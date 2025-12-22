const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
const { promisePool } = require('../config/database');
const { logActivity } = require('./activityLogController');

// Get all motors with pagination and filtering
exports.getAllMotors = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            year = '',
            model = ''
        } = req.query;

        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM motors WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM motors WHERE 1=1';
        const params = [];
        const countParams = [];

        // Search filter
        if (search) {
            const searchCondition = ' AND (chassis_number LIKE ? OR engine_number LIKE ? OR model LIKE ? OR manufacturer LIKE ?)';
            const searchValue = `%${search}%`;
            query += searchCondition;
            countQuery += searchCondition;
            params.push(searchValue, searchValue, searchValue, searchValue);
            countParams.push(searchValue, searchValue, searchValue, searchValue);
        }

        // Status filter
        if (status) {
            query += ' AND status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
            countParams.push(status);
        }

        // Year filter
        if (year) {
            query += ' AND year = ?';
            countQuery += ' AND year = ?';
            params.push(year);
            countParams.push(year);
        }

        // Model filter
        if (model) {
            query += ' AND model LIKE ?';
            countQuery += ' AND model LIKE ?';
            params.push(`%${model}%`);
            countParams.push(`%${model}%`);
        }

        // Add ordering and pagination
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        // Execute queries
        const [motors] = await promisePool.query(query, params);
        const [[{ total }]] = await promisePool.query(countQuery, countParams);

        res.json({
            success: true,
            data: {
                motors,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};



// Get motor statistics (for dashboard analytics)
exports.getMotorStats = async (req, res, next) => {
    try {
        const { period = 'monthly' } = req.query; // daily, weekly, monthly

        let dateFormat;
        let limit;
        let groupBy;

        // Determine date format and limit based on period
        switch (period) {
            case 'daily':
                // Last 30 days
                dateFormat = '%Y-%m-%d';
                groupBy = `DATE_FORMAT(created_at, '${dateFormat}')`;
                limit = 30;
                break;
            case 'weekly':
                // Last 12 weeks
                dateFormat = '%Y-%u'; // Year-Week
                groupBy = `DATE_FORMAT(created_at, '${dateFormat}')`;
                limit = 12;
                break;
            case 'monthly':
            default:
                // Last 12 months
                dateFormat = '%Y-%m'; // Year-Month
                groupBy = `DATE_FORMAT(created_at, '${dateFormat}')`;
                limit = 12;
                break;
        }

        const query = `
            SELECT 
                ${groupBy} as label,
                COUNT(*) as count
            FROM motors 
            GROUP BY label
            ORDER BY label DESC
            LIMIT ?
        `;

        const [results] = await promisePool.query(query, [limit]);

        // Fix order (ASC for chart)
        results.reverse();

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        next(error);
    }
};

// Get single motor by ID
exports.getMotorById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [motors] = await promisePool.query(
            'SELECT * FROM motors WHERE id = ?',
            [id]
        );

        if (motors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Motor not found'
            });
        }

        // Get custom fields
        const [customFields] = await promisePool.query(
            'SELECT field_name, field_value, field_type FROM motor_custom_fields WHERE motor_id = ?',
            [id]
        );

        // Get QR code info
        const [qrCodes] = await promisePool.query(
            'SELECT id, qr_image_path, generated_at, last_scanned_at, scan_count FROM qr_codes WHERE motor_id = ?',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...motors[0],
                customFields,
                qrCode: qrCodes[0] || null
            }
        });
    } catch (error) {
        next(error);
    }
};

// Create new motor
exports.createMotor = async (req, res, next) => {
    try {
        const {
            chassis_number,
            engine_number,
            color,
            model,
            year,
            manufacturer = 'Unknown',
            status = 'in_stock',
            notes = '',
            customFields = []
        } = req.body;

        // Validation
        if (!chassis_number || !engine_number || !color || !model || !year) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: chassis_number, engine_number, color, model, year'
            });
        }

        const motorId = uuidv4();
        const createdBy = req.user.id;

        // Insert motor
        await promisePool.query(
            'INSERT INTO motors (id, chassis_number, engine_number, color, model, year, manufacturer, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [motorId, chassis_number, engine_number, color, model, year, manufacturer, status, notes, createdBy]
        );

        // Insert custom fields if provided
        if (customFields && customFields.length > 0) {
            for (const field of customFields) {
                await promisePool.query(
                    'INSERT INTO motor_custom_fields (id, motor_id, field_name, field_value, field_type) VALUES (?, ?, ?, ?, ?)',
                    [uuidv4(), motorId, field.name, field.value, field.type || 'text']
                );
            }
        }

        // Generate QR code
        const qrId = uuidv4();
        const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/scan/${motorId}`;

        // Create QR code directory if it doesn't exist
        const qrDir = path.join(__dirname, '../uploads/qr-codes');
        try {
            await fs.mkdir(qrDir, { recursive: true });
        } catch (err) {
            // Directory already exists
        }

        const qrFileName = `${motorId}.png`;
        const qrFilePath = path.join(qrDir, qrFileName);

        // Generate QR code image
        await QRCode.toFile(qrFilePath, qrData, {
            width: 300,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        const qrImagePath = `/uploads/qr-codes/${qrFileName}`;

        // Save QR code info to database
        await promisePool.query(
            'INSERT INTO qr_codes (id, motor_id, qr_code_data, qr_image_path) VALUES (?, ?, ?, ?)',
            [qrId, motorId, qrData, qrImagePath]
        );

        // Get created motor
        const [motors] = await promisePool.query(
            'SELECT * FROM motors WHERE id = ?',
            [motorId]
        );

        // Log activity
        await logActivity(
            req.user.id,
            'CREATE',
            'motor',
            motorId,
            JSON.stringify({ model, chassis_number, engine_number, color, year }),
            req.ip || req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
            req.headers['user-agent']
        );

        res.status(201).json({
            success: true,
            message: 'Motor created successfully',
            data: {
                motor: motors[0],
                qrCode: {
                    id: qrId,
                    data: qrData,
                    imagePath: qrImagePath
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update motor
exports.updateMotor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            chassis_number,
            engine_number,
            color,
            model,
            year,
            manufacturer,
            status,
            notes
        } = req.body;

        // Check if motor exists
        const [existingMotors] = await promisePool.query(
            'SELECT id FROM motors WHERE id = ?',
            [id]
        );

        if (existingMotors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Motor not found'
            });
        }

        // Build update query
        const updates = [];
        const values = [];

        if (chassis_number) { updates.push('chassis_number = ?'); values.push(chassis_number); }
        if (engine_number) { updates.push('engine_number = ?'); values.push(engine_number); }
        if (color) { updates.push('color = ?'); values.push(color); }
        if (model) { updates.push('model = ?'); values.push(model); }
        if (year) { updates.push('year = ?'); values.push(year); }
        if (manufacturer) { updates.push('manufacturer = ?'); values.push(manufacturer); }
        if (status) { updates.push('status = ?'); values.push(status); }
        if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(id);

        await promisePool.query(
            `UPDATE motors SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Get updated motor
        const [motors] = await promisePool.query(
            'SELECT * FROM motors WHERE id = ?',
            [id]
        );

        // Log activity
        await logActivity(
            req.user.id,
            'UPDATE',
            'motor',
            id,
            JSON.stringify(req.body),
            req.ip || req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Motor updated successfully',
            data: motors[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete motor
exports.deleteMotor = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if motor exists
        const [motors] = await promisePool.query(
            'SELECT id FROM motors WHERE id = ?',
            [id]
        );

        if (motors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Motor not found'
            });
        }

        // Delete motor (cascade will handle related records)
        await promisePool.query('DELETE FROM motors WHERE id = ?', [id]);

        // Delete QR code image file
        try {
            const qrFilePath = path.join(__dirname, '../uploads/qr-codes', `${id}.png`);
            await fs.unlink(qrFilePath);
        } catch (err) {
            // File might not exist
        }

        // Log activity
        await logActivity(
            req.user.id,
            'DELETE',
            'motor',
            id,
            null,
            req.ip || req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Motor deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Export motors to Excel
exports.exportExcel = async (req, res, next) => {
    try {
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Motor Listesi');

        // Define columns
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 36 },
            { header: 'Kullanıcı', key: 'username', width: 20 },
            { header: 'Marka', key: 'manufacturer', width: 15 },
            { header: 'Model', key: 'model', width: 20 },
            { header: 'Yıl', key: 'year', width: 10 },
            { header: 'Şase No', key: 'chassis_number', width: 25 },
            { header: 'Motor No', key: 'engine_number', width: 25 },
            { header: 'Renk', key: 'color', width: 15 },
            { header: 'Durum', key: 'status', width: 15 },
            { header: 'Oluşturulma Tarihi', key: 'created_at', width: 20 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEEEEEE' }
        };

        // Fetch all motors with user info
        const [motors] = await promisePool.query(`
            SELECT m.*, u.username
            FROM motors m
            LEFT JOIN users u ON m.user_id = u.id
            ORDER BY m.created_at DESC
        `);

        // Add rows
        motors.forEach(motor => {
            worksheet.addRow({
                id: motor.id,
                username: motor.username,
                manufacturer: motor.manufacturer,
                model: motor.model,
                year: motor.year,
                chassis_number: motor.chassis_number,
                engine_number: motor.engine_number,
                color: motor.color,
                status: motor.status,
                created_at: motor.created_at
            });
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=motor-listesi.xlsx');

        // Log export activity
        await logActivity(
            req.user.id,
            'EXPORT',
            'motor',
            null,
            'Excel list exported',
            req.ip || req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
            req.headers['user-agent']
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        next(error);
    }
};

// Get motor by QR scan
exports.scanQRCode = async (req, res, next) => {
    try {
        const { motorId } = req.params;

        const [motors] = await promisePool.query(
            'SELECT * FROM motors WHERE id = ?',
            [motorId]
        );

        if (motors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Motor not found'
            });
        }

        // Update scan count and last scanned time
        await promisePool.query(
            'UPDATE qr_codes SET last_scanned_at = NOW(), scan_count = scan_count + 1 WHERE motor_id = ?',
            [motorId]
        );

        // Get custom fields
        const [customFields] = await promisePool.query(
            'SELECT field_name, field_value, field_type FROM motor_custom_fields WHERE motor_id = ?',
            [motorId]
        );

        res.json({
            success: true,
            data: {
                ...motors[0],
                customFields
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get QR code image (for display/embedding)
exports.getQRCodeImage = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [qrCodes] = await promisePool.query(
            'SELECT qr_image_path FROM qr_codes WHERE motor_id = ?',
            [id]
        );

        if (qrCodes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'QR code not found'
            });
        }

        const qrImagePath = path.join(__dirname, '..', qrCodes[0].qr_image_path);

        // Send the file as image
        res.sendFile(qrImagePath);
    } catch (error) {
        next(error);
    }
};

// Download QR code
exports.downloadQRCode = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [qrCodes] = await promisePool.query(
            'SELECT qr_image_path FROM qr_codes WHERE motor_id = ?',
            [id]
        );

        if (qrCodes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'QR code not found'
            });
        }

        const qrImagePath = path.join(__dirname, '..', qrCodes[0].qr_image_path);

        res.download(qrImagePath, `motor-${id}-qr.png`);
    } catch (error) {
        next(error);
    }
};

// Generate QR code for a single motor
exports.generateQR = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if motor exists
        const [motors] = await promisePool.query(
            'SELECT id, chassis_number FROM motors WHERE id = ?',
            [id]
        );

        if (motors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Motor not found'
            });
        }

        // Check if QR already exists - if so, delete it
        const [existingQR] = await promisePool.query(
            'SELECT id, qr_image_path FROM qr_codes WHERE motor_id = ?',
            [id]
        );

        if (existingQR.length > 0) {
            // Delete old QR code from database
            await promisePool.query('DELETE FROM qr_codes WHERE motor_id = ?', [id]);

            // Delete old QR code file
            try {
                const oldQrFilePath = path.join(__dirname, '..', existingQR[0].qr_image_path);
                await fs.unlink(oldQrFilePath);
            } catch (err) {
                // File might not exist, continue anyway
                console.log('Old QR file not found, continuing...');
            }
        }

        // Generate QR code
        const qrId = uuidv4();
        const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/scan/${id}`;

        // Create QR code directory if it doesn't exist
        const qrDir = path.join(__dirname, '../uploads/qr-codes');
        try {
            await fs.mkdir(qrDir, { recursive: true });
        } catch (err) {
            // Directory already exists
        }

        const qrFileName = `${id}.png`;
        const qrFilePath = path.join(qrDir, qrFileName);

        // Generate QR code image
        await QRCode.toFile(qrFilePath, qrData, {
            width: 300,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        const qrImagePath = `/uploads/qr-codes/${qrFileName}`;

        // Save QR code info to database
        await promisePool.query(
            'INSERT INTO qr_codes (id, motor_id, qr_code_data, qr_image_path) VALUES (?, ?, ?, ?)',
            [qrId, id, qrData, qrImagePath]
        );

        res.status(201).json({
            success: true,
            message: existingQR.length > 0 ? 'QR code regenerated successfully' : 'QR code generated successfully',
            data: {
                qrCode: {
                    id: qrId,
                    motorId: id,
                    data: qrData,
                    imagePath: qrImagePath
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Generate QR codes for all motors that don't have one
exports.generateAllQRs = async (req, res, next) => {
    try {
        // Get all motors without QR codes
        const [motorsWithoutQR] = await promisePool.query(`
            SELECT m.id, m.chassis_number 
            FROM motors m 
            LEFT JOIN qr_codes qr ON m.id = qr.motor_id 
            WHERE qr.id IS NULL
        `);

        if (motorsWithoutQR.length === 0) {
            return res.json({
                success: true,
                message: 'All motors already have QR codes',
                data: {
                    generated: 0,
                    total: 0
                }
            });
        }

        const qrDir = path.join(__dirname, '../uploads/qr-codes');
        try {
            await fs.mkdir(qrDir, { recursive: true });
        } catch (err) {
            // Directory already exists
        }

        let generatedCount = 0;
        const errors = [];

        for (const motor of motorsWithoutQR) {
            try {
                const qrId = uuidv4();
                const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/scan/${motor.id}`;
                const qrFileName = `${motor.id}.png`;
                const qrFilePath = path.join(qrDir, qrFileName);

                // Generate QR code image
                await QRCode.toFile(qrFilePath, qrData, {
                    width: 300,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });

                const qrImagePath = `/uploads/qr-codes/${qrFileName}`;

                // Save QR code info to database
                await promisePool.query(
                    'INSERT INTO qr_codes (id, motor_id, qr_code_data, qr_image_path) VALUES (?, ?, ?, ?)',
                    [qrId, motor.id, qrData, qrImagePath]
                );

                generatedCount++;
            } catch (error) {
                errors.push({
                    motorId: motor.id,
                    chassisNumber: motor.chassis_number,
                    error: error.message
                });
            }
        }

        res.status(201).json({
            success: true,
            message: `QR codes generated for ${generatedCount} motors`,
            data: {
                generated: generatedCount,
                total: motorsWithoutQR.length,
                errors: errors.length > 0 ? errors : undefined
            }
        });
    } catch (error) {
        next(error);
    }
};
