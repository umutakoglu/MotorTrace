const { v4: uuidv4 } = require('uuid');
const { promisePool } = require('../config/database');

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

// Create service record
exports.createService = async (req, res, next) => {
    try {
        const { motorId } = req.params;
        const {
            service_date,
            service_type,
            description = '',
            technician = '',
            cost = 0,
            parts_replaced = '',
            next_service_date = null,
            notes = ''
        } = req.body;

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

        const serviceId = uuidv4();
        const createdBy = req.user.id;

        await promisePool.query(
            `INSERT INTO service_history 
            (id, motor_id, service_date, service_type, description, technician, cost, parts_replaced, next_service_date, notes, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [serviceId, motorId, service_date, service_type, description, technician, cost, parts_replaced, next_service_date, notes, createdBy]
        );

        // Get created service
        const [services] = await promisePool.query(
            'SELECT * FROM service_history WHERE id = ?',
            [serviceId]
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

        res.json({
            success: true,
            message: 'Service record deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
