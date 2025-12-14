const { v4: uuidv4 } = require('uuid');
const { promisePool } = require('../config/database');

// Get all roles with permissions
exports.getAllRoles = async (req, res, next) => {
    try {
        const [roles] = await promisePool.query(`
            SELECT r.*, 
                   COUNT(DISTINCT p.id) as permission_count,
                   COUNT(DISTINCT u.id) as user_count
            FROM roles r
            LEFT JOIN permissions p ON r.id = p.role_id
            LEFT JOIN users u ON r.id = u.role_id
            GROUP BY r.id
            ORDER BY r.is_system_role DESC, r.name ASC
        `);

        res.json({
            success: true,
            data: roles,
            count: roles.length
        });
    } catch (error) {
        next(error);
    }
};

// Get role by ID with permissions
exports.getRoleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [roles] = await promisePool.query(
            'SELECT * FROM roles WHERE id = ?',
            [id]
        );

        if (roles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
        }

        // Get permissions for this role
        const [permissions] = await promisePool.query(
            'SELECT * FROM permissions WHERE role_id = ?',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...roles[0],
                permissions
            }
        });
    } catch (error) {
        next(error);
    }
};

// Create role with permissions
exports.createRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Rol adı gereklidir'
            });
        }

        // Check if role already exists
        const [existing] = await promisePool.query(
            'SELECT id FROM roles WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu isimde bir rol zaten mevcut'
            });
        }

        const roleId = uuidv4();

        // Insert role
        await promisePool.query(
            'INSERT INTO roles (id, name, description, is_system_role) VALUES (?, ?, ?, FALSE)',
            [roleId, name, description || null]
        );

        // Insert permissions if provided
        if (permissions && Array.isArray(permissions)) {
            for (const perm of permissions) {
                const permId = uuidv4();
                await promisePool.query(
                    `INSERT INTO permissions (id, role_id, resource, can_view, can_create, can_edit, can_delete) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        permId,
                        roleId,
                        perm.resource,
                        perm.can_view || false,
                        perm.can_create || false,
                        perm.can_edit || false,
                        perm.can_delete || false
                    ]
                );
            }
        }

        // Fetch created role with permissions
        const [roles] = await promisePool.query(
            'SELECT * FROM roles WHERE id = ?',
            [roleId]
        );

        const [rolePermissions] = await promisePool.query(
            'SELECT * FROM permissions WHERE role_id = ?',
            [roleId]
        );

        res.status(201).json({
            success: true,
            message: 'Rol başarıyla oluşturuldu',
            data: {
                ...roles[0],
                permissions: rolePermissions
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update role and permissions
exports.updateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;

        // Check if role exists
        const [existing] = await promisePool.query(
            'SELECT * FROM roles WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
        }

        // Prevent modification of system roles' name
        if (existing[0].is_system_role && name && name !== existing[0].name) {
            return res.status(400).json({
                success: false,
                message: 'Sistem rollerinin adı değiştirilemez'
            });
        }

        // Update role
        const updates = [];
        const values = [];

        if (name !== undefined) {
            // Check if new name conflicts
            const [nameCheck] = await promisePool.query(
                'SELECT id FROM roles WHERE name = ? AND id != ?',
                [name, id]
            );
            
            if (nameCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu isimde bir rol zaten mevcut'
                });
            }
            
            updates.push('name = ?');
            values.push(name);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }

        if (updates.length > 0) {
            values.push(id);
            await promisePool.query(
                `UPDATE roles SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        // Update permissions if provided
        if (permissions && Array.isArray(permissions)) {
            // Delete existing permissions
            await promisePool.query(
                'DELETE FROM permissions WHERE role_id = ?',
                [id]
            );

            // Insert new permissions
            for (const perm of permissions) {
                const permId = uuidv4();
                await promisePool.query(
                    `INSERT INTO permissions (id, role_id, resource, can_view, can_create, can_edit, can_delete) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        permId,
                        id,
                        perm.resource,
                        perm.can_view || false,
                        perm.can_create || false,
                        perm.can_edit || false,
                        perm.can_delete || false
                    ]
                );
            }
        }

        // Fetch updated role with permissions
        const [roles] = await promisePool.query(
            'SELECT * FROM roles WHERE id = ?',
            [id]
        );

        const [rolePermissions] = await promisePool.query(
            'SELECT * FROM permissions WHERE role_id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Rol başarıyla güncellendi',
            data: {
                ...roles[0],
                permissions: rolePermissions
            }
        });
    } catch (error) {
        next(error);
    }
};

// Delete role
exports.deleteRole = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [roles] = await promisePool.query(
            'SELECT * FROM roles WHERE id = ?',
            [id]
        );

        if (roles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
        }

        // Prevent deletion of system roles
        if (roles[0].is_system_role) {
            return res.status(400).json({
                success: false,
                message: 'Sistem rolleri silinemez'
            });
        }

        // Check if role is assigned to any users
        const [users] = await promisePool.query(
            'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
            [id]
        );

        if (users[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu role atanmış kullanıcılar var. Önce kullanıcıların rollerini değiştirin.'
            });
        }

        // Delete role (permissions will be deleted automatically via CASCADE)
        await promisePool.query(
            'DELETE FROM roles WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Rol başarıyla silindi'
        });
    } catch (error) {
        next(error);
    }
};

// Get role permissions
exports.getRolePermissions = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [permissions] = await promisePool.query(
            'SELECT * FROM permissions WHERE role_id = ?',
            [id]
        );

        res.json({
            success: true,
            data: permissions
        });
    } catch (error) {
        next(error);
    }
};
