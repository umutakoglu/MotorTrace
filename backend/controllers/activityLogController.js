const { v4: uuidv4 } = require('uuid');
const { promisePool } = require('../config/database');

// Log an activity
const logActivity = async (userId, action, resourceType, resourceId = null, details = null, ipAddress = null, userAgent = null) => {
    try {
        const activityId = uuidv4();
        await promisePool.query(
            `INSERT INTO activity_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [activityId, userId, action, resourceType, resourceId, details, ipAddress, userAgent]
        );
        return activityId;
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw error - activity logging shouldn't break the main flow
        return null;
    }
};

// Get activity logs with pagination and filtering
exports.getActivityLogs = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 50,
            userId,
            action,
            resourceType,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;

        // Build WHERE clause
        const conditions = [];
        const params = [];

        if (userId) {
            conditions.push('user_id = ?');
            params.push(userId);
        }

        if (action) {
            conditions.push('action = ?');
            params.push(action);
        }

        if (resourceType) {
            conditions.push('resource_type = ?');
            params.push(resourceType);
        }

        if (startDate) {
            conditions.push('created_at >= ?');
            params.push(startDate);
        }

        if (endDate) {
            conditions.push('created_at <= ?');
            params.push(endDate);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const [countResult] = await promisePool.query(
            `SELECT COUNT(*) as total FROM activity_logs ${whereClause}`,
            params
        );

        const total = countResult[0].total;

        // Get logs with user info
        const [logs] = await promisePool.query(
            `SELECT 
                al.*,
                u.username,
                u.email
             FROM activity_logs al
             LEFT JOIN users u ON al.user_id = u.id
             ${whereClause}
             ORDER BY al.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get activity statistics
exports.getActivityStats = async (req, res, next) => {
    try {
        const [stats] = await promisePool.query(`
            SELECT 
                COUNT(*) as total_activities,
                COUNT(DISTINCT user_id) as active_users,
                SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as create_count,
                SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as update_count,
                SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as delete_count,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_count,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as week_count
            FROM activity_logs
        `);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        next(error);
    }
};

// Export the log function
exports.logActivity = logActivity;
