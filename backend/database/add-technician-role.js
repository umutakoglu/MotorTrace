const { promisePool } = require('../config/database');

const addTechnicianRole = async () => {
    try {
        console.log('🔧 Adding technician role to users table...\n');

        // Alter the role enum to include 'technician'
        await promisePool.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('admin', 'user', 'technician') DEFAULT 'user'
        `);

        console.log('✅ Successfully added technician role to users table!\n');
        console.log('Users can now be assigned the "technician" role.\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to add technician role:', error.message);
        process.exit(1);
    }
};

// Run migration
addTechnicianRole();
