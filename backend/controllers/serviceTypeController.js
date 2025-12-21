const { v4: uuidv4 } = require('uuid');
const { promisePool } = require('../config/database');

// Get all service types
exports.getAllServiceTypes = async (req, res, next) => {
    try {
        const { includeInactive } = req.query;
        
        let query = 'SELECT * FROM service_types';
        if (includeInactive !== 'true') {
            query += ' WHERE is_active = TRUE';
        }
        query += ' ORDER BY name ASC';

        const [serviceTypes] = await promisePool.query(query);

        res.json({
            success: true,
            data: serviceTypes,
            count: serviceTypes.length
        });
    } catch (error) {
        next(error);
    }
};

// Get service type by ID
exports.getServiceTypeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [serviceTypes] = await promisePool.query(
            'SELECT * FROM service_types WHERE id = ?',
            [id]
        );

        if (serviceTypes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Servis tipi bulunamadı'
            });
        }

        res.json({
            success: true,
            data: serviceTypes[0]
        });
    } catch (error) {
        next(error);
    }
};

// Create service type
exports.createServiceType = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Servis tipi adı gereklidir'
            });
        }

        // Check if service type already exists
        const [existing] = await promisePool.query(
            'SELECT id FROM service_types WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu isimde bir servis tipi zaten mevcut'
            });
        }

        const serviceTypeId = uuidv4();

        await promisePool.query(
            'INSERT INTO service_types (id, name, description) VALUES (?, ?, ?)',
            [serviceTypeId, name, description || null]
        );

        const [serviceTypes] = await promisePool.query(
            'SELECT * FROM service_types WHERE id = ?',
            [serviceTypeId]
        );

        res.status(201).json({
            success: true,
            message: 'Servis tipi başarıyla oluşturuldu',
            data: serviceTypes[0]
        });
    } catch (error) {
        next(error);
    }
};

// Update service type
exports.updateServiceType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, is_active } = req.body;

        // Check if service type exists
        const [existing] = await promisePool.query(
            'SELECT id FROM service_types WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Servis tipi bulunamadı'
            });
        }

        // Build update query
        const updates = [];
        const values = [];

        if (name !== undefined) {
            // Check if new name conflicts with another service type
            const [nameCheck] = await promisePool.query(
                'SELECT id FROM service_types WHERE name = ? AND id != ?',
                [name, id]
            );
            
            if (nameCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu isimde bir servis tipi zaten mevcut'
                });
            }
            
            updates.push('name = ?');
            values.push(name);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }

        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Güncellenecek alan bulunamadı'
            });
        }

        values.push(id);

        await promisePool.query(
            `UPDATE service_types SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        const [serviceTypes] = await promisePool.query(
            'SELECT * FROM service_types WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Servis tipi başarıyla güncellendi',
            data: serviceTypes[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete service type (soft delete)
exports.deleteServiceType = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [serviceTypes] = await promisePool.query(
            'SELECT id FROM service_types WHERE id = ?',
            [id]
        );

        if (serviceTypes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Servis tipi bulunamadı'
            });
        }

        // Soft delete by setting is_active to false
        await promisePool.query(
            'UPDATE service_types SET is_active = FALSE WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Servis tipi pasifleştirildi'
        });
    } catch (error) {
        next(error);
    }
};

// Get service type statistics
exports.getServiceTypeStats = async (req, res, next) => {
    try {
        const [stats] = await promisePool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive
            FROM service_types
        `);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        next(error);
    }
};
