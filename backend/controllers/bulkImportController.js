// Bulk Import Controller - Excel import for motors
const { v4: uuidv4 } = require('uuid');
const ExcelJS = require('exceljs');
const db = require('../config/database');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

// Generate Excel template for motor import
exports.downloadTemplate = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Motor Şablonu');

        // Configure worksheet
        worksheet.columns = [
            { header: 'Şase Numarası*', key: 'chassis_number', width: 20 },
            { header: 'Motor Numarası*', key: 'engine_number', width: 20 },
            { header: 'Model*', key: 'model', width: 25 },
            { header: 'Yıl*', key: 'year', width: 10 },
            { header: 'Renk (Hex)*', key: 'color', width: 15 },
            { header: 'Üretici', key: 'manufacturer', width: 20 },
            { header: 'Durum*', key: 'status', width: 15 },
            { header: 'Notlar', key: 'notes', width: 40 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3B82F6' }
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Add example data
        worksheet.addRow({
            chassis_number: 'ABC123XYZ456',
            engine_number: 'ENG789DEF012',
            model: 'Honda CBR500R',
            year: 2024,
            color: '#FF0000',
            manufacturer: 'Honda',
            status: 'in_stock',
            notes: 'Örnek motor kaydı'
        });

        // Add instructions
        worksheet.addRow({});
        worksheet.addRow({
            chassis_number: 'AYDINLATMA:',
            engine_number: '',
            model: '',
            year: '',
            color: '',
            manufacturer: '',
            status: '',
            notes: ''
        });
        worksheet.addRow({
            chassis_number: '* = Zorunlu alan',
            engine_number: '',
            model: '',
            year: '',
            color: '',
            manufacturer: '',
            status: '',
            notes: ''
        });
        worksheet.addRow({
            chassis_number: 'Durum değerleri:',
            engine_number: 'in_stock',
            model: 'sold',
            year: 'in_service',
            color: 'scrapped',
            manufacturer: '',
            status: '',
            notes: ''
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=motor-import-template.xlsx');

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Template generation error:', error);
        res.status(500).json({ message: 'Şablon oluşturulamadı', error: error.message });
    }
};

// Upload and process Excel file
exports.bulkImport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Excel dosyası yüklenmedi' });
        }

        const userId = req.user.userId;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);

        const worksheet = workbook.getWorksheet('Motor Şablonu') || workbook.worksheets[0];
        
        const motors = [];
        const errors = [];
        let rowNumber = 1;

        worksheet.eachRow((row, index) => {
            // Skip header and instruction rows
            if (index === 1 || index <= 2) {
                rowNumber++;
                return;
            }

            const chassis_number = row.getCell(1).value;
            const engine_number = row.getCell(2).value;
            const model = row.getCell(3).value;
            const year = row.getCell(4).value;
            const color = row.getCell(5).value;
            const manufacturer = row.getCell(6).value || 'Unknown';
            const status = row.getCell(7).value || 'in_stock';
            const notes = row.getCell(8).value || '';

            // Skip empty rows
            if (!chassis_number && !engine_number && !model) {
                rowNumber++;
                return;
            }

            // Validation
            const rowErrors = [];
            if (!chassis_number) rowErrors.push('Şase numarası eksik');
            if (!engine_number) rowErrors.push('Motor numarası eksik');
            if (!model) rowErrors.push('Model eksik');
            if (!year || isNaN(year)) rowErrors.push('Geçersiz yıl');
            if (!color || !color.match(/^#[0-9A-F]{6}$/i)) rowErrors.push('Geçersiz renk formatı (hex kod olmalı, örn: #FF0000)');
            
            const validStatuses = ['in_stock', 'sold', 'in_service', 'scrapped'];
            if (!validStatuses.includes(status)) rowErrors.push(`Geçersiz durum (olmalı: ${validStatuses.join(', ')})`);

            if (rowErrors.length > 0) {
                errors.push({
                    row: rowNumber,
                    errors: rowErrors
                });
            } else {
                motors.push({
                    id: uuidv4(),
                    chassis_number: String(chassis_number).trim(),
                    engine_number: String(engine_number).trim(),
                    model: String(model).trim(),
                    year: parseInt(year),
                    color: String(color).trim(),
                    manufacturer: String(manufacturer).trim(),
                    status,
                    notes: String(notes).trim(),
                    created_by: userId
                });
            }

            rowNumber++;
        });

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Excel dosyasında hatalar bulundu',
                errors,
                totalRows: rowNumber - 3,
                validRows: motors.length,
                errorRows: errors.length
            });
        }

        if (motors.length === 0) {
            return res.status(400).json({ message: 'Excel dosyasında geçerli motor kaydı bulunamadı' });
        }

        // Insert motors into database
        const insertedMotors = [];
        const insertErrors = [];

        for (const motor of motors) {
            try {
                // Check for duplicates
                const [existing] = await db.query(
                    'SELECT id FROM motors WHERE chassis_number = ? OR engine_number = ?',
                    [motor.chassis_number, motor.engine_number]
                );

                if (existing.length > 0) {
                    insertErrors.push({
                        chassis: motor.chassis_number,
                        engine: motor.engine_number,
                        error: 'Şase veya motor numarası sistemde zaten mevcut'
                    });
                    continue;
                }

                // Insert motor
                await db.query(
                    `INSERT INTO motors (id, chassis_number, engine_number, model, year, color, manufacturer, status, notes, created_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [motor.id, motor.chassis_number, motor.engine_number, motor.model, motor.year, 
                     motor.color, motor.manufacturer, motor.status, motor.notes, motor.created_by]
                );

                // Generate QR code
                try {
                    const qrData = JSON.stringify({
                        motorId: motor.id,
                        chassis: motor.chassis_number,
                        engine: motor.engine_number,
                        url: `http://localhost:3000/#/motor-detail/${motor.id}`
                    });

                    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
                        width: 300,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });

                    const qrImagePath = `/qr-codes/motor-${motor.id}.png`;
                    
                    // Save QR to database
                    await db.query(
                        `INSERT INTO qr_codes (id, motor_id, qr_code_data, qr_image_path)
                         VALUES (?, ?, ?, ?)
                         ON DUPLICATE KEY UPDATE qr_code_data = ?, qr_image_path = ?`,
                        [uuidv4(), motor.id, qrData, qrImagePath, qrData, qrImagePath]
                    );
                } catch (qrError) {
                    console.error('QR generation error for motor:', motor.id, qrError);
                }

                insertedMotors.push(motor);

            } catch (dbError) {
                console.error('Database insert error:', dbError);
                insertErrors.push({
                    chassis: motor.chassis_number,
                    engine: motor.engine_number,
                    error: dbError.message
                });
            }
        }

        res.status(201).json({
            message: 'Toplu motor ekleme tamamlandı',
            summary: {
                totalProcessed: motors.length,
                successful: insertedMotors.length,
                failed: insertErrors.length
            },
            inserted: insertedMotors.map(m => ({
                id: m.id,
                chassis: m.chassis_number,
                model: m.model
            })),
            errors: insertErrors
        });

    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ message: 'Toplu ekleme başarısız', error: error.message });
    }
};
