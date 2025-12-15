-- MotorTrace Database Schema
-- MySQL Database for Motor Tracking System with QR Codes
-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Motors table - main motor information
CREATE TABLE IF NOT EXISTS motors (
    id VARCHAR(36) PRIMARY KEY,
    chassis_number VARCHAR(100) NOT NULL UNIQUE,
    engine_number VARCHAR(100) NOT NULL UNIQUE,
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
    INDEX idx_year (year),
    INDEX idx_status (status),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Motor custom fields for extensibility
CREATE TABLE IF NOT EXISTS motor_custom_fields (
    id VARCHAR(36) PRIMARY KEY,
    motor_id VARCHAR(36) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT NOT NULL,
    field_type ENUM('text', 'number', 'date', 'boolean') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_motor_id (motor_id),
    INDEX idx_field_name (field_name),
    FOREIGN KEY (motor_id) REFERENCES motors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service history table
CREATE TABLE IF NOT EXISTS service_history (
    id VARCHAR(36) PRIMARY KEY,
    motor_id VARCHAR(36) NOT NULL,
    service_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    technician VARCHAR(100),
    cost DECIMAL(10, 2),
    parts_replaced TEXT,
    next_service_date DATE,
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_motor_id (motor_id),
    INDEX idx_service_date (service_date),
    INDEX idx_service_type (service_type),
    FOREIGN KEY (motor_id) REFERENCES motors(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service attachments (photos, documents)
CREATE TABLE IF NOT EXISTS service_attachments (
    id VARCHAR(36) PRIMARY KEY,
    service_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    uploaded_by VARCHAR(36),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_service_id (service_id),
    FOREIGN KEY (service_id) REFERENCES service_history(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QR codes table
CREATE TABLE IF NOT EXISTS qr_codes (
    id VARCHAR(36) PRIMARY KEY,
    motor_id VARCHAR(36) NOT NULL UNIQUE,
    qr_code_data TEXT NOT NULL,
    qr_image_path VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_scanned_at TIMESTAMP NULL,
    scan_count INT DEFAULT 0,
    INDEX idx_motor_id (motor_id),
    FOREIGN KEY (motor_id) REFERENCES motors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
