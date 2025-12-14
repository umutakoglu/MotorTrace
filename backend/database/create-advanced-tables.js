const { promisePool } = require('../config/database');

const setupAdvancedTables = async () => {
    try {
        console.log('🔧 Creating advanced management tables...\n');

        // Create service_types table
        console.log('📦 Creating service_types table...');
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS service_types (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ service_types table created\n');

        // Create technicians table
        console.log('📦 Creating technicians table...');
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS technicians (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(255),
                specialization VARCHAR(100),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_active (is_active),
                INDEX idx_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ technicians table created\n');

        // Create roles table
        console.log('📦 Creating roles table...');
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                is_system_role BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ roles table created\n');

        // Create permissions table
        console.log('📦 Creating permissions table...');
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS permissions (
                id VARCHAR(36) PRIMARY KEY,
                role_id VARCHAR(36) NOT NULL,
                resource VARCHAR(50) NOT NULL,
                can_view BOOLEAN DEFAULT FALSE,
                can_create BOOLEAN DEFAULT FALSE,
                can_edit BOOLEAN DEFAULT FALSE,
                can_delete BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                UNIQUE KEY unique_role_resource (role_id, resource),
                INDEX idx_role (role_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ permissions table created\n');

        // Add role_id column to users table if not exists
        console.log('📦 Adding role_id to users table...');
        await promisePool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS role_id VARCHAR(36),
            ADD INDEX IF NOT EXISTS idx_role_id (role_id)
        `).catch(() => {
            console.log('   Column role_id already exists or error occurred (continuing...)');
        });

        // Insert default roles
        console.log('📦 Creating default roles...');
        const { v4: uuidv4 } = require('uuid');
        
        const adminRoleId = uuidv4();
        const userRoleId = uuidv4();
        const technicianRoleId = uuidv4();

        await promisePool.query(`
            INSERT IGNORE INTO roles (id, name, description, is_system_role) VALUES
            (?, 'admin', 'Administrator - Full access to all features', TRUE),
            (?, 'user', 'Regular User - Read-only access', TRUE),
            (?, 'technician', 'Technician - Can add/edit service records', TRUE)
        `, [adminRoleId, userRoleId, technicianRoleId]);

        // Insert default permissions for admin role
        console.log('📦 Creating default permissions...');
        const resources = ['motors', 'services', 'users', 'roles', 'technicians', 'service_types', 'reports', 'settings'];
        
        for (const resource of resources) {
            const permId = uuidv4();
            await promisePool.query(`
                INSERT IGNORE INTO permissions (id, role_id, resource, can_view, can_create, can_edit, can_delete) 
                VALUES (?, ?, ?, TRUE, TRUE, TRUE, TRUE)
            `, [permId, adminRoleId, resource]);
        }

        // User role - read only
        for (const resource of ['motors', 'services']) {
            const permId = uuidv4();
            await promisePool.query(`
                INSERT IGNORE INTO permissions (id, role_id, resource, can_view, can_create, can_edit, can_delete) 
                VALUES (?, ?, ?, TRUE, FALSE, FALSE, FALSE)
            `, [permId, userRoleId, resource]);
        }

        // Technician role - can manage services
        for (const resource of ['motors', 'services']) {
            const permId = uuidv4();
            const canEdit = resource === 'services';
            await promisePool.query(`
                INSERT IGNORE INTO permissions (id, role_id, resource, can_view, can_create, can_edit, can_delete) 
                VALUES (?, ?, ?, TRUE, ?, ?, FALSE)
            `, [permId, technicianRoleId, resource, canEdit, canEdit]);
        }

        // Insert default service types
        console.log('📦 Creating default service types...');
        const serviceTypes = [
            { name: 'Rutin Bakım', description: 'Periyodik bakım işlemleri' },
            { name: 'Onarım', description: 'Arıza ve hasar onarımları' },
            { name: 'Yağ Değişimi', description: 'Motor ve şanzıman yağı değişimi' },
            { name: 'Fren Bakımı', description: 'Fren sistemi kontrolü ve bakımı' },
            { name: 'Elektrik', description: 'Elektrik sistemi işlemleri' },
            { name: 'Kaporta/Boya', description: 'Kaporta ve boya işleri' }
        ];

        for (const type of serviceTypes) {
            const typeId = uuidv4();
            await promisePool.query(`
                INSERT IGNORE INTO service_types (id, name, description) VALUES (?, ?, ?)
            `, [typeId, type.name, type.description]);
        }

        console.log('✅ Default service types created\n');

        console.log('🎉 Advanced tables setup completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Advanced tables setup failed:', error);
        process.exit(1);
    }
};

// Run setup
setupAdvancedTables();
