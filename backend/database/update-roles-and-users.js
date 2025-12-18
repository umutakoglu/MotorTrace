const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const updateRolesAndUsers = async () => {
    try {
        console.log('🔧 Starting RBAC restructure...\n');

        // 1. Update users table role ENUM
        console.log('📦 Updating user roles ENUM...');
        await promisePool.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('admin', 'yonetici', 'operator', 'technician') DEFAULT 'operator'
        `);
        console.log('✅ User roles ENUM updated\n');

        // 2. Clear all existing users
        console.log('🗑️  Removing all existing users...');
        await promisePool.query('DELETE FROM users');
        console.log('✅ All users removed\n');

        // 3. Create new test users
        console.log('👥 Creating new test users...');
        const passwordHash = await bcrypt.hash('admin123', 10);

        const users = [
            { id: uuidv4(), username: 'Admin', email: 'admin@motortrace.com', role: 'admin' },
            { id: uuidv4(), username: 'Yönetici', email: 'yonetici@motortrace.com', role: 'yonetici' },
            { id: uuidv4(), username: 'Operatör', email: 'operator@motortrace.com', role: 'operator' },
            { id: uuidv4(), username: 'Teknisyen', email: 'teknisyen@motortrace.com', role: 'technician' }
        ];

        for (const user of users) {
            await promisePool.query(
                'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
                [user.id, user.username, user.email, passwordHash, user.role]
            );
            console.log(`✅ Created: ${user.username} (${user.email}) - Role: ${user.role}`);
        }

        console.log('\n🎉 RBAC restructure completed successfully!\n');
        console.log('📧 Test User Credentials:');
        console.log('   All passwords: admin123\n');
        console.log('   Admin:     admin@motortrace.com');
        console.log('   Yönetici:  yonetici@motortrace.com');
        console.log('   Operatör:  operator@motortrace.com');
        console.log('   Teknisyen: teknisyen@motortrace.com\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ RBAC restructure failed:', error);
        process.exit(1);
    }
};

// Run migration
updateRolesAndUsers();
