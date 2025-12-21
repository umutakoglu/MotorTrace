const { v4: uuidv4 } = require('uuid');
const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
    try {
        const [users] = await promisePool.query(
            'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        next(error);
    }
};

// Create user (admin only)
exports.createUser = async (req, res, next) => {
    try {
        const { username, email, password, role, role_id } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Kullanıcı adı, email ve şifre gereklidir'
            });
        }

        // Check if username already exists
        const [existingUsername] = await promisePool.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsername.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu kullanıcı adı zaten kullanılıyor'
            });
        }

        // Check if email already exists
        const [existingEmail] = await promisePool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingEmail.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        // Validate and insert user with role
        const userRole = role || 'operator';
        if (!['admin', 'yonetici', 'operator', 'technician'].includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz rol. İzin verilen roller: admin, yonetici, operator, technician'
            });
        }

        await promisePool.query(
            'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [userId, username, email, password_hash, userRole]
        );

        // Get created user
        const [users] = await promisePool.query(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.status(201).json({
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu',
            data: users[0]
        });
    } catch (error) {
        next(error);
    }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [users] = await promisePool.query(
            'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        next(error);
    }
};

// Update user role
exports.updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        if (!['admin', 'yonetici', 'operator', 'technician'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz rol. İzin verilen roller: admin, yonetici, operator, technician'
            });
        }

        // Check if user exists
        const [existingUsers] = await promisePool.query(
            'SELECT id, role FROM users WHERE id = ?',
            [id]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Prevent changing own role
        if (req.user.id === id || req.user.userId === id) {
            return res.status(400).json({
                success: false,
                message: 'Kendi rolünüzü değiştiremezsiniz'
            });
        }

        // Update role
        await promisePool.query(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );

        // Get updated user
        const [users] = await promisePool.query(
            'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Kullanıcı rolü başarıyla güncellendi',
            data: users[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const [existingUsers] = await promisePool.query(
            'SELECT id FROM users WHERE id = ?',
            [id]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Prevent deleting own account
        if (req.user.id === id || req.user.userId === id) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızı silemezsiniz'
            });
        }

        // Delete user
        await promisePool.query('DELETE FROM users WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Kullanıcı başarıyla silindi'
        });
    } catch (error) {
        next(error);
    }
};

// Update user password (admin only)
exports.updatePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        // Validation
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Yeni şifre en az 6 karakter olmalıdır'
            });
        }

        // Check if user exists
        const [existingUsers] = await promisePool.query(
            'SELECT id FROM users WHERE id = ?',
            [id]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Hash new password
        const password_hash = await bcrypt.hash(newPassword, 10);

        // Update password
        await promisePool.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [password_hash, id]
        );

        res.json({
            success: true,
            message: 'Kullanıcı şifresi başarıyla güncellendi'
        });
    } catch (error) {
        next(error);
    }
};

// Get user statistics
exports.getUserStats = async (req, res, next) => {
    try {
        const [stats] = await promisePool.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_this_week
            FROM users
        `);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        next(error);
    }
};
