DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) NOT NULL,
  `resource_id` varchar(36) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_resource` (`resource_type`,`resource_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `motor_custom_fields`;
CREATE TABLE `motor_custom_fields` (
  `id` varchar(36) NOT NULL,
  `motor_id` varchar(36) NOT NULL,
  `field_name` varchar(100) NOT NULL,
  `field_value` text DEFAULT NULL,
  `field_type` varchar(50) DEFAULT 'text',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_motor_field` (`motor_id`,`field_name`),
  CONSTRAINT `motor_custom_fields_ibfk_1` FOREIGN KEY (`motor_id`) REFERENCES `motors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `motors`;
CREATE TABLE `motors` (
  `id` varchar(36) NOT NULL,
  `chassis_number` varchar(100) NOT NULL,
  `engine_number` varchar(100) NOT NULL,
  `color` varchar(50) NOT NULL,
  `model` varchar(100) NOT NULL,
  `year` int(11) NOT NULL,
  `manufacturer` varchar(100) DEFAULT 'Unknown',
  `status` enum('in_stock','sold','in_service','scrapped') DEFAULT 'in_stock',
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `chassis_number` (`chassis_number`),
  KEY `idx_chassis` (`chassis_number`),
  KEY `idx_engine` (`engine_number`),
  KEY `idx_model` (`model`),
  KEY `idx_status` (`status`),
  KEY `idx_year` (`year`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `motors_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `motors` VALUES 
('34e5460c-23b8-41cb-8ad2-0103efe628af', 'DCTMNS000001', 'MNSTE-4004', 'Gümüş', 'Ducati Monster', 2022, 'Ducati', 'in_stock', NULL, NULL, '2025-12-18 10:19:15.000', '2025-12-18 10:19:15.000'),
('398fb159-27ee-405a-b603-3223e8f62bca', 'YMHTT0700001', 'MT07E-1001', 'Siyah', 'Yamaha MT-07', 2024, 'Yamaha', 'in_stock', NULL, NULL, '2025-12-18 10:19:15.000', '2025-12-18 10:19:15.000'),
('3ba97c20-7728-476e-b758-f6f2eab68cf3', 'ZD4PG00N0NS000001222', 'RSV4RF-0000121', 'Kırmızı', 'Test Model 11', 2022, 'Honda', 'in_stock', '', '822978c1-7c77-499c-9fd3-c3723519b423', '2025-12-18 15:33:36.000', '2025-12-18 15:33:36.000'),
('3e7775df-b892-461f-b89c-25d03b57ddae', 'VSPGTS300001', 'GTS30E-5005', 'Sarı', 'Vespa GTS 300', 2023, 'Vespa', 'in_stock', NULL, NULL, '2025-12-18 10:19:15.000', '2025-12-18 10:19:15.000'),
('4b7b1180-19be-42d3-b995-7e1b2efcc6ae', 'ABC123XYZ456', 'ENG789DEF012', 'Siyah', 'Test Model', 2024, 'Test Üretici', 'in_stock', '', '822978c1-7c77-499c-9fd3-c3723519b423', '2025-12-18 14:46:38.000', '2025-12-18 14:46:38.000'),
('5305795c-7158-472e-a83b-740fffc1d75a', 'KWSZ90000001', 'Z900E-3003', 'Yeşil', 'Kawasaki Z900', 2024, 'Kawasaki', 'in_stock', NULL, NULL, '2025-12-18 10:19:15.000', '2025-12-18 10:19:15.000'),
('71a3e860-10c4-4032-baeb-efd191e83aa9', 'HNDCRF250001', 'CRF25E-2002', 'Kırmızı', 'Honda CRF 250L', 2023, 'Honda', 'in_stock', NULL, NULL, '2025-12-18 10:19:15.000', '2025-12-18 10:19:15.000');

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` varchar(36) NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `resource` varchar(50) NOT NULL,
  `can_view` tinyint(1) DEFAULT 0,
  `can_create` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_resource` (`role_id`,`resource`),
  KEY `idx_role` (`role_id`),
  CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `permissions` VALUES 
('0399f869-f47a-4677-a943-67462466e4d7', '93fe37e9-f350-4250-9b6d-760ba4bf97ce', 'motors', 1, 0, 0, 0, '2025-12-18 10:14:05.000'),
('0cc2a47b-8623-4afa-a615-0d8489117d33', '9c5eabf5-418f-4c67-85f4-4ebdf4f5b4f8', 'services', 1, 1, 1, 1, '2025-12-18 10:14:05.000'),
('0f25e3a5-7650-48f9-a491-0238ce04b94d', '9c5eabf5-418f-4c67-85f4-4ebdf4f5b4f8', 'users', 1, 1, 1, 1, '2025-12-18 10:14:05.000'),
('10f5fe5c-35c3-4c5d-9462-35537ad68eaf', '42667f55-524c-4529-9aa1-19f681109cff', 'services', 1, 0, 0, 0, '2025-12-18 10:14:05.000'),
('5d0841a2-1c2a-4d07-b212-47d849e44267', '42667f55-524c-4529-9aa1-19f681109cff', 'motors', 1, 0, 0, 0, '2025-12-18 10:14:05.000'),
('7134a374-9af0-49d6-aea5-1147166b9602', '9c5eabf5-418f-4c67-85f4-4ebdf4f5b4f8', 'roles', 1, 1, 1, 1, '2025-12-18 10:14:05.000'),
('85f8d451-3343-4bf3-8367-7f40c98a1c5b', '9c5eabf5-418f-4c67-85f4-4ebdf4f5b4f8', 'settings', 1, 1, 1, 1, '2025-12-18 10:14:05.000'),
('9da08dbb-85ac-4e9b-a4c0-7608cd608308', '93fe37e9-f350-4250-9b6d-760ba4bf97ce', 'services', 1, 1, 1, 0, '2025-12-18 10:14:05.000'),
('a1ee7317-1ceb-48c7-879c-4c0b053e356b', '9c5eabf5-418f-4c67-85f4-4ebdf4f5b4f8', 'technicians', 1, 1, 1, 1, '2025-12-18 10:14:05.000'),
('c8cbbacd-40bd-47ea-8305-d6add949411c', '9c5eabf5-418f-4c67-85f4-4ebdf4f5b4f8', 'motors', 1, 1, 1, 1, '2025-12-18 10:14:05.000'),
('efecb630-c687-4808-95c9-e5227a191c4c', '9c5eabf5-418f-4c67-85f4-4ebdf4f5b4f8', 'reports', 1, 1, 1, 1, '2025-12-18 10:14:05.000'),
('fc629249-e3d4-4f60-9ae4-be38736ebc28', '9c5eabf5-418f-4c67-85f4-4ebdf4f5b4f8', 'service_types', 1, 1, 1, 1, '2025-12-18 10:14:05.000');

DROP TABLE IF EXISTS `qr_codes`;
CREATE TABLE `qr_codes` (
  `id` varchar(36) NOT NULL,
  `motor_id` varchar(36) NOT NULL,
  `qr_code_data` text NOT NULL,
  `qr_image_path` varchar(500) DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_scanned_at` timestamp NULL DEFAULT NULL,
  `scan_count` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `motor_id` (`motor_id`),
  CONSTRAINT `qr_codes_ibfk_1` FOREIGN KEY (`motor_id`) REFERENCES `motors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `qr_codes` VALUES 
('21444321-b8ba-4c93-a674-1d6a75fb1ce2', '3ba97c20-7728-476e-b758-f6f2eab68cf3', 'http://localhost:3000/scan/3ba97c20-7728-476e-b758-f6f2eab68cf3', '/uploads/qr-codes/3ba97c20-7728-476e-b758-f6f2eab68cf3.png', '2025-12-18 15:33:36.000', NULL, 0),
('35a35363-0dd8-4be5-af1f-ff1a3c1a496e', '34e5460c-23b8-41cb-8ad2-0103efe628af', 'http://localhost:3000/scan/34e5460c-23b8-41cb-8ad2-0103efe628af', '/uploads/qr-codes/34e5460c-23b8-41cb-8ad2-0103efe628af.png', '2025-12-18 10:19:15.000', NULL, 0),
('6a11e924-30ff-4f9f-8d08-a5266140888b', '5305795c-7158-472e-a83b-740fffc1d75a', 'http://localhost:3000/scan/5305795c-7158-472e-a83b-740fffc1d75a', '/uploads/qr-codes/5305795c-7158-472e-a83b-740fffc1d75a.png', '2025-12-18 10:19:15.000', NULL, 0),
('a38bf0b0-5ddd-44c2-9f74-6298193bd8b5', '3e7775df-b892-461f-b89c-25d03b57ddae', 'http://localhost:3000/scan/3e7775df-b892-461f-b89c-25d03b57ddae', '/uploads/qr-codes/3e7775df-b892-461f-b89c-25d03b57ddae.png', '2025-12-18 10:19:16.000', NULL, 0),
('b76403e9-e7b0-47e1-8f1b-a3e329249235', '398fb159-27ee-405a-b603-3223e8f62bca', 'http://localhost:3000/scan/398fb159-27ee-405a-b603-3223e8f62bca', '/uploads/qr-codes/398fb159-27ee-405a-b603-3223e8f62bca.png', '2025-12-18 10:19:15.000', NULL, 0),
('c9be4965-5476-4967-a692-c6e4c082e87f', '4b7b1180-19be-42d3-b995-7e1b2efcc6ae', 'http://localhost:3000/scan/4b7b1180-19be-42d3-b995-7e1b2efcc6ae', '/uploads/qr-codes/4b7b1180-19be-42d3-b995-7e1b2efcc6ae.png', '2025-12-18 14:46:38.000', NULL, 0),
('d568d4cc-4b6c-4e84-9977-e0e3e4788b1e', '71a3e860-10c4-4032-baeb-efd191e83aa9', 'http://localhost:3000/scan/71a3e860-10c4-4032-baeb-efd191e83aa9', '/uploads/qr-codes/71a3e860-10c4-4032-baeb-efd191e83aa9.png', '2025-12-18 10:19:15.000', NULL, 0);

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_system_role` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` VALUES 
('42667f55-524c-4529-9aa1-19f681109cff', 'user', 'Regular User - Read-only access', 1, '2025-12-18 10:14:05.000', '2025-12-18 10:14:05.000'),
('93fe37e9-f350-4250-9b6d-760ba4bf97ce', 'technician', 'Technician - Can add/edit service records', 1, '2025-12-18 10:14:05.000', '2025-12-18 10:14:05.000'),
('9c5eabf5-418f-4c67-85f4-4ebdf4f5b4f8', 'admin', 'Administrator - Full access to all features', 1, '2025-12-18 10:14:05.000', '2025-12-18 10:14:05.000');

DROP TABLE IF EXISTS `service_attachments`;
CREATE TABLE `service_attachments` (
  `id` varchar(36) NOT NULL,
  `service_id` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `service_attachments_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `service_history` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `service_history`;
CREATE TABLE `service_history` (
  `id` varchar(36) NOT NULL,
  `motor_id` varchar(36) NOT NULL,
  `service_date` date NOT NULL,
  `service_type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `technician` varchar(100) DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT 0.00,
  `parts_replaced` text DEFAULT NULL,
  `next_service_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_motor_service` (`motor_id`,`service_date`),
  KEY `idx_service_date` (`service_date`),
  CONSTRAINT `service_history_ibfk_1` FOREIGN KEY (`motor_id`) REFERENCES `motors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `service_history_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `service_history` VALUES 
('30dff93a-1d7e-4475-9845-b5fbd1c034cf', '398fb159-27ee-405a-b603-3223e8f62bca', '2025-12-18 00:00:00.000', 'Elektrik', 'asdads', '', '1000.00', 'assadada', NULL, '', 'c88106b2-6beb-4b14-9bd7-8ace6d92809b', '2025-12-18 15:38:20.000', '2025-12-18 15:38:20.000'),
('692d3a26-4e43-4f6b-b1d2-2779a2edeac7', '3ba97c20-7728-476e-b758-f6f2eab68cf3', '2025-12-18 00:00:00.000', 'Elektrik', 'Test service record. No technician dropdown visible.', 'Admin', '0.00', '', NULL, '', '32dab545-2e18-4248-9faf-faaea768b95b', '2025-12-18 15:52:25.000', '2025-12-18 15:52:25.000');

DROP TABLE IF EXISTS `service_types`;
CREATE TABLE `service_types` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `service_types` VALUES 
('025dcf8c-4c32-4f42-b653-590057edc1ea', 'Kaporta/Boya', 'Kaporta ve boya işleri', 1, '2025-12-18 10:14:05.000', '2025-12-18 10:14:05.000'),
('0e8d0f0f-ef4b-4b94-950d-59c3ac6f9f0d', 'Onarım', 'Arıza ve hasar onarımları', 1, '2025-12-18 10:14:05.000', '2025-12-18 10:14:05.000'),
('360f7be1-0fff-4eff-91e7-d8fdbdf358d9', 'Rutin Bakım', 'Periyodik bakım işlemleri', 1, '2025-12-18 10:14:05.000', '2025-12-18 10:14:05.000'),
('7e12847b-b57f-484a-98a7-ef8ddcf9704a', 'Yağ Değişimi', 'Motor ve şanzıman yağı değişimi', 1, '2025-12-18 10:14:05.000', '2025-12-18 10:14:05.000'),
('b29b363a-9bac-4c93-b7a4-cf83d2db8fed', 'Fren Bakımı', 'Fren sistemi kontrolü ve bakımı', 1, '2025-12-18 10:14:05.000', '2025-12-18 10:14:05.000'),
('c3d6cf45-576e-4a91-97ca-a35b4a6a7d4a', 'Elektrik', 'Elektrik sistemi işlemleri', 1, '2025-12-18 10:14:05.000', '2025-12-18 10:14:05.000');

DROP TABLE IF EXISTS `technicians`;
CREATE TABLE `technicians` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','yonetici','operator','technician') DEFAULT 'operator',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` VALUES 
('32dab545-2e18-4248-9faf-faaea768b95b', 'Admin', 'admin@adminmotortrace.com', '$2b$10$4ZhF9VsM1BjH3Uey/qLjX.BYo4p/nCPBmMtgqZ7ailIHl/eu0CpNi', 'admin', '2025-12-18 10:46:33.000', '2025-12-18 11:33:02.000', NULL),
('7e251d1f-b69c-4ba5-86fa-ecd47931e392', 'Yönetici', 'yonetici@motortrace.com', '$2b$10$4ZhF9VsM1BjH3Uey/qLjX.BYo4p/nCPBmMtgqZ7ailIHl/eu0CpNi', 'yonetici', '2025-12-18 10:46:33.000', '2025-12-18 10:46:33.000', NULL),
('822978c1-7c77-499c-9fd3-c3723519b423', 'Operatör', 'operator@motortrace.com', '$2b$10$4ZhF9VsM1BjH3Uey/qLjX.BYo4p/nCPBmMtgqZ7ailIHl/eu0CpNi', 'operator', '2025-12-18 10:46:33.000', '2025-12-18 10:46:33.000', NULL),
('c88106b2-6beb-4b14-9bd7-8ace6d92809b', 'Teknisyen', 'teknisyen@motortrace.com', '$2b$10$4ZhF9VsM1BjH3Uey/qLjX.BYo4p/nCPBmMtgqZ7ailIHl/eu0CpNi', 'technician', '2025-12-18 10:46:33.000', '2025-12-18 10:46:33.000', NULL);

