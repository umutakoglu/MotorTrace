const { promisePool } = require('./config/database');
const bcrypt = require('bcryptjs');

const setupDatabase = async () => {
    try {
        console.log('🔧 Starting database setup...\n');

        // Drop existing tables
        console.log('📦 Dropping existing tables...');
        await promisePool.query('DROP TABLE IF EXISTS service_attachments');
        await promisePool.query('DROP TABLE IF EXISTS service_history');
        await promisePool.query('DROP TABLE IF EXISTS motor_custom_fields');
        await promisePool.query('DROP TABLE IF EXISTS qr_codes');
        await promisePool.query('DROP TABLE IF EXISTS motors');
        await promisePool.query('DROP TABLE IF EXISTS users');
        console.log('✅ Existing tables dropped\n');

        // Create users table
        console.log('📦 Creating users table...');
        await promisePool.query(`
            CREATE TABLE users (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_username (username)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Users table created\n');

        // Create motors table
        console.log('📦 Creating motors table...');
        await promisePool.query(`
            CREATE TABLE motors (
                id VARCHAR(36) PRIMARY KEY,
                chassis_number VARCHAR(100) NOT NULL UNIQUE,
                engine_number VARCHAR(100) NOT NULL,
                color VARCHAR(50) NOT NULL,
                model VARCHAR(100) NOT NULL,
                year INT NOT NULL,
                manufacturer VARCHAR(100) DEFAULT 'Unknown',
                status ENUM('in_stock', 'sold', 'in_service', 'scrapped') DEFAULT 'in_stock',
                notes TEXT,
                created_by VARCHAR(36),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_chassis (chassis_number),
                INDEX idx_engine (engine_number),
                INDEX idx_model (model),
                INDEX idx_status (status),
                INDEX idx_year (year),
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Motors table created\n');

        // Create qr_codes table
        console.log('📦 Creating qr_codes table...');
        await promisePool.query(`
            CREATE TABLE qr_codes (
                id VARCHAR(36) PRIMARY KEY,
                motor_id VARCHAR(36) NOT NULL UNIQUE,
                qr_code_data TEXT NOT NULL,
                qr_image_path VARCHAR(500),
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_scanned_at TIMESTAMP NULL,
                scan_count INT DEFAULT 0,
                FOREIGN KEY (motor_id) REFERENCES motors(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ QR codes table created\n');

        // Create motor_custom_fields table
        console.log('📦 Creating motor_custom_fields table...');
        await promisePool.query(`
            CREATE TABLE motor_custom_fields (
                id VARCHAR(36) PRIMARY KEY,
                motor_id VARCHAR(36) NOT NULL,
                field_name VARCHAR(100) NOT NULL,
                field_value TEXT,
                field_type VARCHAR(50) DEFAULT 'text',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (motor_id) REFERENCES motors(id) ON DELETE CASCADE,
                INDEX idx_motor_field (motor_id, field_name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Motor custom fields table created\n');

        // Create service_history table
        console.log('📦 Creating service_history table...');
        await promisePool.query(`
            CREATE TABLE service_history (
                id VARCHAR(36) PRIMARY KEY,
                motor_id VARCHAR(36) NOT NULL,
                service_date DATE NOT NULL,
                service_type VARCHAR(100) NOT NULL,
                description TEXT,
                technician VARCHAR(100),
                cost DECIMAL(10, 2) DEFAULT 0.00,
                parts_replaced TEXT,
                next_service_date DATE NULL,
                notes TEXT,
                created_by VARCHAR(36),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (motor_id) REFERENCES motors(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_motor_service (motor_id, service_date),
                INDEX idx_service_date (service_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Service history table created\n');

        // Create service_attachments table
        console.log('📦 Creating service_attachments table...');
        await promisePool.query(`
            CREATE TABLE service_attachments (
                id VARCHAR(36) PRIMARY KEY,
                service_id VARCHAR(36) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_type VARCHAR(100),
                file_size INT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES service_history(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Service attachments table created\n');

        // Create default admin user
        console.log('👤 Creating default admin user...');
        const passwordHash = await bcrypt.hash('admin123', 10);
        await promisePool.query(`
            INSERT INTO users (id, username, email, password_hash, role) 
            VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@motortrace.com', ?, 'admin')
        `, [passwordHash]);
        console.log('✅ Admin user created');
        console.log('   Email: admin@motortrace.com');
        console.log('   Password: admin123\n');

        console.log('🎉 Database setup completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
};

// Run setup
setupDatabase();
