const { v4: uuidv4 } = require('uuid');
const { promisePool } = require('../config/database');

// Get all technicians
exports.getAllTechnicians = async (req, res, next) => {
    try {
        const { includeInactive } = req.query;
        
        let query = 'SELECT * FROM technicians';
        if (includeInactive !== 'true') {
            query += ' WHERE is_active = TRUE';
        }
        query += ' ORDER BY name ASC';

        const [technicians] = await promisePool.query(query);

        res.json({
            success: true,
            data: technicians,
            count: technicians.length
        });
    } catch (error) {
        next(error);
    }
};

// Get technician by ID
exports.getTechnicianById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [technicians] = await promisePool.query(
            'SELECT * FROM technicians WHERE id = ?',
            [id]
        );

        if (technicians.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teknisyen bulunamadı'
            });
        }

        res.json({
            success: true,
            data: technicians[0]
        });
    } catch (error) {
        next(error);
    }
};

// Create technician
exports.createTechnician = async (req, res, next) => {
    try {
        const { name, phone, email, specialization } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Teknisyen adı gereklidir'
            });
        }

        const technicianId = uuidv4();

        await promisePool.query(
            'INSERT INTO technicians (id, name, phone, email, specialization) VALUES (?, ?, ?, ?, ?)',
            [technicianId, name, phone || null, email || null, specialization || null]
        );

        const [technicians] = await promisePool.query(
            'SELECT * FROM technicians WHERE id = ?',
            [technicianId]
        );

        res.status(201).json({
            success: true,
            message: 'Teknisyen başarıyla oluşturuldu',
            data: technicians[0]
        });
    } catch (error) {
        next(error);
    }
};

// Update technician
exports.updateTechnician = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, phone, email, specialization, is_active } = req.body;

        // Check if technician exists
        const [existing] = await promisePool.query(
            'SELECT id FROM technicians WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teknisyen bulunamadı'
            });
        }

        // Build update query
        const updates = [];
        const values = [];

        if (name !== undefined) { updates.push('name = ?'); values.push(name); }
        if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
        if (email !== undefined) { updates.push('email = ?'); values.push(email); }
        if (specialization !== undefined) { updates.push('specialization = ?'); values.push(specialization); }
        if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Güncellenecek alan bulunamadı'
            });
        }

        values.push(id);

        await promisePool.query(
            `UPDATE technicians SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        const [technicians] = await promisePool.query(
            'SELECT * FROM technicians WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Teknisyen başarıyla güncellendi',
            data: technicians[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete technician (soft delete)
exports.deleteTechnician = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [technicians] = await promisePool.query(
            'SELECT id FROM technicians WHERE id = ?',
            [id]
        );

        if (technicians.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teknisyen bulunamadı'
            });
        }

        // Soft delete
        await promisePool.query(
            'UPDATE technicians SET is_active = FALSE WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Teknisyen pasifleştirildi'
        });
    } catch (error) {
        next(error);
    }
};

// Get technician statistics
exports.getTechnicianStats = async (req, res, next) => {
    try {
        const [stats] = await promisePool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive
            FROM technicians
        `);

        // Get service counts per technician
        const [serviceCounts] = await promisePool.query(`
            SELECT 
                t.id,
                t.name,
                COUNT(s.id) as service_count
            FROM technicians t
            LEFT JOIN service_history s ON t.name = s.technician
            WHERE t.is_active = TRUE
            GROUP BY t.id, t.name
            ORDER BY service_count DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                ...stats[0],
                topTechnicians: serviceCounts
            }
        });
    } catch (error) {
        next(error);
    }
};
