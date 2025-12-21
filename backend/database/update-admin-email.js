const { promisePool } = require('../config/database');

const updateAdminEmail = async () => {
    try {
        console.log('🔧 Updating admin user email...\n');

        // Update admin email to admin@adminmotortrace.com
        await promisePool.query(`
            UPDATE users 
            SET email = 'admin@adminmotortrace.com'
            WHERE role = 'admin'
        `);

        console.log('✅ Admin email updated successfully!');
        console.log('   New email: admin@adminmotortrace.com');
        console.log('   Password: admin123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update admin email:', error);
        process.exit(1);
    }
};

// Run update
updateAdminEmail();
