-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: motortrace
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `motor_custom_fields`
--

DROP TABLE IF EXISTS `motor_custom_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `motor_custom_fields`
--

LOCK TABLES `motor_custom_fields` WRITE;
/*!40000 ALTER TABLE `motor_custom_fields` DISABLE KEYS */;
/*!40000 ALTER TABLE `motor_custom_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `motors`
--

DROP TABLE IF EXISTS `motors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `motors`
--

LOCK TABLES `motors` WRITE;
/*!40000 ALTER TABLE `motors` DISABLE KEYS */;
INSERT INTO `motors` VALUES ('1a3c9be2-1add-44bc-83f4-ddfe0cdb6489','ZD4PG00N0NS000001','RSV4RF-00001','Siyah','Aprilia RSV4',2022,'Aprilia','in_stock',NULL,'550e8400-e29b-41d4-a716-446655440000','2025-12-12 10:20:55','2025-12-12 10:25:35'),('1a53c29c-244d-4654-9100-e13705cc28ec','JKBEX650J9A000001','EX650E-000001','Yeşil','Kawasaki Ninja 650',2019,'Kawasaki','in_stock',NULL,'550e8400-e29b-41d4-a716-446655440000','2025-12-12 10:20:55','2025-12-12 10:25:35'),('481d5e1f-f241-42c7-a9c8-da7db7d4276c','MEG1HD48XKR000001','HD750-000001','Indigo','Harley Davidson Street 750',2020,'Harley Davidson','in_stock',NULL,'550e8400-e29b-41d4-a716-446655440000','2025-12-12 10:20:55','2025-12-12 10:25:35'),('559951aa-684d-4ba9-b6ba-706ef2f296b2','WB10EJ000LZX00001','S1000RR-00001','Açık Mavi','BMW S1000RR',2020,'BMW','in_stock',NULL,'550e8400-e29b-41d4-a716-446655440000','2025-12-12 10:20:55','2025-12-12 10:25:35'),('668b93c1-ab4a-4869-bc5f-8333d0d8aa44','ZDM13ANWXMB000001','V4-000001','Crimson Kırmızı','Ducati Panigale V4',2023,'Ducati','in_stock',NULL,'550e8400-e29b-41d4-a716-446655440000','2025-12-12 10:20:55','2025-12-12 10:25:35'),('8576bfbf-30e8-469f-81cf-0c65a21837e3','JS1GR7CA0M2100001','R750K-100001','Altın','Suzuki GSX-R750',2022,'Suzuki','in_stock',NULL,'550e8400-e29b-41d4-a716-446655440000','2025-12-12 10:20:55','2025-12-12 10:25:35'),('a13ea788-d9b6-4aea-a43e-26c94a6ea109','SMTD03NK0MS000001','D03-000001','Lime Yeşil','Triumph Street Triple',2019,'Triumph','in_stock',NULL,'550e8400-e29b-41d4-a716-446655440000','2025-12-12 10:20:55','2025-12-12 10:25:35'),('a3253fd0-4be0-46e3-b2e3-b4e62e77d49c','JYARN231000000001','N231E-000001','Mavi','Yamaha YZF-R1',2021,'Yamaha','in_stock',NULL,'550e8400-e29b-41d4-a716-446655440000','2025-12-12 10:20:55','2025-12-12 10:25:35'),('a74f08b5-1338-40f5-a19c-ed2f27af4f70','JH2PC40001M000001','PC400E-2000001','Kırmızı','Honda CBR 600RR',2020,'Honda','in_stock',NULL,'550e8400-e29b-41d4-a716-446655440000','2025-12-12 10:20:55','2025-12-12 10:25:35'),('b574f527-e933-473d-a7f4-d86cda658400','VBKMZ39000M000001','390DUKE-00001','Turuncu','KTM 390 Duke',2021,'KTM','in_stock',NULL,'550e8400-e29b-41d4-a716-446655440000','2025-12-12 10:20:55','2025-12-12 10:25:35');
/*!40000 ALTER TABLE `motors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qr_codes`
--

DROP TABLE IF EXISTS `qr_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qr_codes`
--

LOCK TABLES `qr_codes` WRITE;
/*!40000 ALTER TABLE `qr_codes` DISABLE KEYS */;
INSERT INTO `qr_codes` VALUES ('084fb081-c473-4612-98e7-3832fe81459a','1a3c9be2-1add-44bc-83f4-ddfe0cdb6489','http://localhost:3000/scan/1a3c9be2-1add-44bc-83f4-ddfe0cdb6489','/uploads/qr-codes/1a3c9be2-1add-44bc-83f4-ddfe0cdb6489.png','2025-12-12 10:20:55',NULL,0),('1202c38a-9812-4e37-ab9b-c889f48026a5','b574f527-e933-473d-a7f4-d86cda658400','http://localhost:3000/scan/b574f527-e933-473d-a7f4-d86cda658400','/uploads/qr-codes/b574f527-e933-473d-a7f4-d86cda658400.png','2025-12-12 10:20:55',NULL,0),('4d8762b0-251b-46c7-8888-1bec94158787','8576bfbf-30e8-469f-81cf-0c65a21837e3','http://localhost:3000/scan/8576bfbf-30e8-469f-81cf-0c65a21837e3','/uploads/qr-codes/8576bfbf-30e8-469f-81cf-0c65a21837e3.png','2025-12-12 10:20:55',NULL,0),('9bd9e75d-3980-4ed5-a30c-26780d6d89f0','a13ea788-d9b6-4aea-a43e-26c94a6ea109','http://localhost:3000/scan/a13ea788-d9b6-4aea-a43e-26c94a6ea109','/uploads/qr-codes/a13ea788-d9b6-4aea-a43e-26c94a6ea109.png','2025-12-12 10:20:55',NULL,0),('afdd9e82-bd91-4644-b4aa-99b57dff2f6c','a74f08b5-1338-40f5-a19c-ed2f27af4f70','http://localhost:3000/scan/a74f08b5-1338-40f5-a19c-ed2f27af4f70','/uploads/qr-codes/a74f08b5-1338-40f5-a19c-ed2f27af4f70.png','2025-12-12 10:20:55',NULL,0),('b008e141-ecf1-4d0e-b813-511e76a18657','481d5e1f-f241-42c7-a9c8-da7db7d4276c','http://localhost:3000/scan/481d5e1f-f241-42c7-a9c8-da7db7d4276c','/uploads/qr-codes/481d5e1f-f241-42c7-a9c8-da7db7d4276c.png','2025-12-12 10:20:55',NULL,0),('c0ae15ac-2af9-4d69-a08e-8e0ae58b8b7d','559951aa-684d-4ba9-b6ba-706ef2f296b2','http://localhost:3000/scan/559951aa-684d-4ba9-b6ba-706ef2f296b2','/uploads/qr-codes/559951aa-684d-4ba9-b6ba-706ef2f296b2.png','2025-12-12 10:20:55',NULL,0),('d4187ad5-44a0-42d7-a343-2aeb4f1618e4','1a53c29c-244d-4654-9100-e13705cc28ec','http://localhost:3000/scan/1a53c29c-244d-4654-9100-e13705cc28ec','/uploads/qr-codes/1a53c29c-244d-4654-9100-e13705cc28ec.png','2025-12-12 10:20:55',NULL,0),('f53f1935-f5ec-4b6d-bfe0-5c0afaf6c209','a3253fd0-4be0-46e3-b2e3-b4e62e77d49c','http://localhost:3000/scan/a3253fd0-4be0-46e3-b2e3-b4e62e77d49c','/uploads/qr-codes/a3253fd0-4be0-46e3-b2e3-b4e62e77d49c.png','2025-12-12 10:20:55',NULL,0),('fc9ec81d-1677-46c1-a72f-a2574b06a73b','668b93c1-ab4a-4869-bc5f-8333d0d8aa44','http://localhost:3000/scan/668b93c1-ab4a-4869-bc5f-8333d0d8aa44','/uploads/qr-codes/668b93c1-ab4a-4869-bc5f-8333d0d8aa44.png','2025-12-12 10:20:55',NULL,0);
/*!40000 ALTER TABLE `qr_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_attachments`
--

DROP TABLE IF EXISTS `service_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_attachments`
--

LOCK TABLES `service_attachments` WRITE;
/*!40000 ALTER TABLE `service_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_history`
--

DROP TABLE IF EXISTS `service_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_history`
--

LOCK TABLES `service_history` WRITE;
/*!40000 ALTER TABLE `service_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('550e8400-e29b-41d4-a716-446655440000','admin','admin@motortrace.com','$2b$10$2Zmfdy2rVsJN1LdwMWAInOjB7G2RCK6.pT7rhbtgD1AbdcXYVpxG.','admin','2025-12-12 08:57:06','2025-12-12 08:57:06');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-13 11:04:45
