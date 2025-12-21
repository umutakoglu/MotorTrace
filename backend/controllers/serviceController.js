const { v4: uuidv4 } = require('uuid');
const { promisePool } = require('../config/database');
const { logActivity } = require('./activityLogController');

// Get all service records for a motor
exports.getMotorServices = async (req, res, next) => {
    try {
        const { motorId } = req.params;

        // Check if motor exists
        const [motors] = await promisePool.query(
            'SELECT id FROM motors WHERE id = ?',
            [motorId]
        );

        if (motors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Motor not found'
            });
        }

        // Get service history
        const [services] = await promisePool.query(
            'SELECT * FROM service_history WHERE motor_id = ? ORDER BY service_date DESC',
            [motorId]
        );

        // Get attachments for each service
        for (let service of services) {
            const [attachments] = await promisePool.query(
                'SELECT id, file_name, file_path, file_type, file_size, uploaded_at FROM service_attachments WHERE service_id = ?',
                [service.id]
            );
            service.attachments = attachments;
        }

        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        next(error);
    }
};

// Get recent services (last 5 global)
exports.getRecentServices = async (req, res, next) => {
    try {
        const [services] = await promisePool.query(`
            SELECT s.*, m.model, m.chassis_number, m.id as motor_id 
            FROM service_history s
            JOIN motors m ON s.motor_id = m.id
            ORDER BY s.service_date DESC, s.created_at DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        next(error);
    }
};

// Create service record
exports.createService = async (req, res, next) => {
    try {
        const { motorId } = req.params;
        const {
            service_date,
            service_type,
            description = '',
            cost = 0,
            parts_replaced = '',
            next_service_date = null,
            notes = ''
        } = req.body;

        // Debug logging
        console.log('Creating service for motorId:', motorId);
        console.log('Authenticated user:', req.user);

        // Validation
        if (!service_date || !service_type) {
            return res.status(400).json({
                success: false,
                message: 'Please provide service_date and service_type'
            });
        }

        // Check if motor exists
        const [motors] = await promisePool.query(
            'SELECT id FROM motors WHERE id = ?',
            [motorId]
        );

        if (motors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Motor not found'
            });
        }

        // Generate service ID
        const serviceId = uuidv4();

        // Get user ID and username from authenticated user
        const userId = req.user?.userId || req.user?.id || null;
        const technicianName = req.user?.username || 'Unknown';

        console.log('User ID for created_by:', userId);
        console.log('Technician (from logged-in user):', technicianName);

        // Insert service record with created_by (can be NULL)
        await promisePool.query(
            `INSERT INTO service_history (
                id, motor_id, service_date, service_type, description,
                technician, cost, parts_replaced, next_service_date, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                serviceId,
                motorId,
                service_date,
                service_type,
                description,
                technicianName,  // Use logged-in user's username
                cost,
                parts_replaced,
                next_service_date,
                notes,
                userId  // Can be NULL - ON DELETE SET NULL handles this
            ]
        );

        // Get created service
        const [services] = await promisePool.query(
            'SELECT * FROM service_history WHERE id = ?',
            [serviceId]
        );

        // Log activity
        await logActivity(
            userId,
            'CREATE',
            'service',
            serviceId,
            JSON.stringify({ service_type, motorId, cost }),
            req.ip || req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
            req.headers['user-agent']
        );

        res.status(201).json({
            success: true,
            message: 'Service record created successfully',
            data: services[0]
        });
    } catch (error) {
        next(error);
    }
};

// Update service record
exports.updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            service_date,
            service_type,
            description,
            technician,
            cost,
            parts_replaced,
            next_service_date,
            notes
        } = req.body;

        // Check if service exists
        const [existingServices] = await promisePool.query(
            'SELECT id FROM service_history WHERE id = ?',
            [id]
        );

        if (existingServices.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service record not found'
            });
        }

        // Build update query
        const updates = [];
        const values = [];

        if (service_date) { updates.push('service_date = ?'); values.push(service_date); }
        if (service_type) { updates.push('service_type = ?'); values.push(service_type); }
        if (description !== undefined) { updates.push('description = ?'); values.push(description); }
        if (technician !== undefined) { updates.push('technician = ?'); values.push(technician); }
        if (cost !== undefined) { updates.push('cost = ?'); values.push(cost); }
        if (parts_replaced !== undefined) { updates.push('parts_replaced = ?'); values.push(parts_replaced); }
        if (next_service_date !== undefined) { updates.push('next_service_date = ?'); values.push(next_service_date); }
        if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(id);

        await promisePool.query(
            `UPDATE service_history SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Get updated service
        const [services] = await promisePool.query(
            'SELECT * FROM service_history WHERE id = ?',
            [id]
        );

        // Log activity
        await logActivity(
            req.user.id,
            'UPDATE',
            'service',
            id,
            JSON.stringify(req.body),
            req.ip || req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Service record updated successfully',
            data: services[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete service record
exports.deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [services] = await promisePool.query(
            'SELECT id FROM service_history WHERE id = ?',
            [id]
        );

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service record not found'
            });
        }

        await promisePool.query('DELETE FROM service_history WHERE id = ?', [id]);

        // Log activity
        await logActivity(
            req.user.id,
            'DELETE',
            'service',
            id,
            null,
            req.ip || req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Service record deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Upload service attachment
exports.uploadAttachment = async (req, res, next) => {
    try {
        const { id: serviceId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Dosya yüklenmedi'
            });
        }

        // Check if service exists
        const [services] = await promisePool.query(
            'SELECT id FROM service_history WHERE id = ?',
            [serviceId]
        );

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Servis kaydı bulunamadı'
            });
        }

        const attachmentId = uuidv4();
        const filePath = '/uploads/services/' + req.file.filename;

        await promisePool.query(
            `INSERT INTO service_attachments (id, service_id, file_name, file_path, file_type, file_size)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [attachmentId, serviceId, req.file.originalname, filePath, req.file.mimetype, req.file.size]
        );

        const [attachments] = await promisePool.query(
            'SELECT * FROM service_attachments WHERE id = ?',
            [attachmentId]
        );

        res.status(201).json({
            success: true,
            message: 'Dosya başarıyla yüklendi',
            data: attachments[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete service attachment
exports.deleteAttachment = async (req, res, next) => {
    try {
        const { attachmentId } = req.params;
        const fs = require('fs');
        const path = require('path');

        const [attachments] = await promisePool.query(
            'SELECT * FROM service_attachments WHERE id = ?',
            [attachmentId]
        );

        if (attachments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Dosya bulunamadı'
            });
        }

        const attachment = attachments[0];

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', attachment.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await promisePool.query('DELETE FROM service_attachments WHERE id = ?', [attachmentId]);

        res.json({
            success: true,
            message: 'Dosya başarıyla silindi'
        });
    } catch (error) {
        next(error);
    }
};

// Get service report (HTML for printing)
exports.getServiceReport = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [services] = await promisePool.query(
            `SELECT s.*, m.chassis_number, m.engine_number, m.model, m.year, m.color
             FROM service_history s
             JOIN motors m ON s.motor_id = m.id
             WHERE s.id = ?`,
            [id]
        );

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Servis kaydı bulunamadı'
            });
        }

        const service = services[0];

        // Get attachments
        const [attachments] = await promisePool.query(
            'SELECT * FROM service_attachments WHERE service_id = ?',
            [id]
        );

        service.attachments = attachments;

        // Generate HTML report
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Servis Formu - ${service.model}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section h2 {
            background: #333;
            color: white;
            padding: 10px;
            margin-bottom: 10px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-item {
            border: 1px solid #ddd;
            padding: 10px;
        }
        
        .info-item label {
            font-weight: bold;
            color: #666;
            display: block;
            margin-bottom: 5px;
        }
        
        .info-item value {
            color: #333;
        }
        
        .full-width {
            grid-column: 1 / -1;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>SERVİS FORMU</h1>
        <p>MotorTrace - Motor Takip Sistemi</p>
    </div>
    
    <div class="section">
        <h2>Motor Bilgileri</h2>
        <div class="info-grid">
            <div class="info-item">
                <label>Model:</label>
                <value>${service.model}</value>
            </div>
            <div class="info-item">
                <label>Yıl:</label>
                <value>${service.year}</value>
            </div>
            <div class="info-item">
                <label>Şase No:</label>
                <value>${service.chassis_number}</value>
            </div>
            <div class="info-item">
                <label>Motor No:</label>
                <value>${service.engine_number}</value>
            </div>
            <div class="info-item">
                <label>Renk:</label>
                <value>${service.color}</value>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>Servis Detayları</h2>
        <div class="info-grid">
            <div class="info-item">
                <label>Servis Tarihi:</label>
                <value>${new Date(service.service_date).toLocaleDateString('tr-TR')}</value>
            </div>
            <div class="info-item">
                <label>Servis Tipi:</label>
                <value>${service.service_type}</value>
            </div>
            <div class="info-item">
                <label>Teknisyen:</label>
                <value>${service.technician || 'Belirtilmemiş'}</value>
            </div>
            <div class="info-item">
                <label>Maliyet:</label>
                <value>${service.cost ? service.cost + ' TL' : 'Belirtilmemiş'}</value>
            </div>
            ${service.next_service_date ? `
            <div class="info-item">
                <label>Sonraki Servis Tarihi:</label>
                <value>${new Date(service.next_service_date).toLocaleDateString('tr-TR')}</value>
            </div>
            ` : ''}
            ${service.description ? `
            <div class="info-item full-width">
                <label>Açıklama:</label>
                <value>${service.description}</value>
            </div>
            ` : ''}
            ${service.parts_replaced ? `
            <div class="info-item full-width">
                <label>Değiştirilen Parçalar:</label>
                <value>${service.parts_replaced}</value>
            </div>
            ` : ''}
            ${service.notes ? `
            <div class="info-item full-width">
                <label>Notlar:</label>
                <value>${service.notes}</value>
            </div>
            ` : ''}
        </div>
    </div>
    
    ${service.attachments.length > 0 ? `
    <div class="section">
        <h2>Ekler</h2>
        <ul>
            ${service.attachments.map(att => `<li>${att.file_name}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
    
    <div class="section">
        <p style="text-align: center; color: #666; margin-top: 40px;">
            Rapor Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}
        </p>
    </div>
    
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
        `;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (error) {
        next(error);
    }
};

