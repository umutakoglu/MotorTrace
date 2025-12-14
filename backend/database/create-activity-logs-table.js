const { promisePool } = require('../config/database');

const setupActivityLogsTable = async () => {
    try {
        console.log('🔧 Creating activity_logs table...\n');

        // Create activity_logs table
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36),
                action VARCHAR(100) NOT NULL,
                resource_type VARCHAR(50) NOT NULL,
                resource_id VARCHAR(36),
                details TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_action (action),
                INDEX idx_resource (resource_type, resource_id),
                INDEX idx_created_at (created_at),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ activity_logs table created successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create activity_logs table:', error);
        process.exit(1);
    }
};

// Run setup
setupActivityLogsTable();
