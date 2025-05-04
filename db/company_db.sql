CREATE USER 'company'@'%' IDENTIFIED BY 'Ukshati@123';
GRANT ALL PRIVILEGES ON company_db.* TO 'company'@'%';
FLUSH PRIVILEGES;

CREATE DATABASE  IF NOT EXISTS `company_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `company_db`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: company_db
-- ------------------------------------------------------
-- Server version	8.4.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `add_expenses`
--


--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_id` int NOT NULL,
  `category_name` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (4,'Drip'),(2,'Electronics'),(3,'Pumping'),(1,'Tools'),(5,'Plumbing'),(6,'Automation'),(7,'Labour');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `cid` int NOT NULL AUTO_INCREMENT,
  `cname` varchar(255) NOT NULL,
  `cphone` varchar(15) NOT NULL,
  `alternate_phone` varchar(15) DEFAULT NULL,
  `status` enum('lead','customer') NOT NULL DEFAULT 'customer',
  `follow_up_date` date DEFAULT NULL,
  `join_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `remark` text,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` (`name`, `email`, `phone`, `password`, `role`) VALUES
('Ukshati', 'ukshati365@gmail.com', '7259439998', '$2b$10$VFW3dVy6O91qYShoi6vEDemc8TMb7DP4SBplGWNm9snPtffVGGu5u', 'Admin');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_spent`
--
--
-- Table structure for table `stock`
--
DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `category_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_pu` decimal(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--
LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES 
(1, 'Hammer', 1, 20, 500.00, NOW(), NOW()),
(2, 'Screwdriver Set', 1, 15, 750.00, NOW(), NOW()),
(3, 'LED Monitor', 2, 12, 15000.00, NOW(), NOW()),
(4, 'Laptop', 2, 2, 60000.00, NOW(), NOW()),
(5, 'Water Pump', 3, 5, 25000.00, NOW(), NOW()),
(6, 'Submersible Pump', 3, 3, 30000.00, NOW(), NOW()),
(7, 'Drip Irrigation Kit', 4, 8, 10000.00, NOW(), NOW()),
(8, 'Smart Irrigation Controller', 4, 6, 12000.00, NOW(), NOW()),
(9, 'PVC Pipes', 5, 25, 2000.00, NOW(), NOW()),
(10, 'Pipe Fittings Set', 5, 30, 1500.00, NOW(), NOW()),
(11, 'Electric Valve', 6, 10, 5000.00, NOW(), NOW()),
(12, 'Automation Controller', 6, 5, 25000.00, NOW(), NOW()),
(13, 'Solar Panel', 6, 7, 40000.00, NOW(), NOW()),
(14, 'Wiring Kit', 6, 20, 3000.00, NOW(), NOW()),
(15, 'Skilled Labour', 7, 50, 500.00, NOW(), NOW()),
(16, 'Unskilled Labour', 7, 70, 300.00, NOW(), NOW()),
(17, 'Plumbing Labour', 7, 40, 400.00, NOW(), NOW()),
(18, 'Masonry Labour', 7, 30, 450.00, NOW(), NOW()),
(19, '3" PVC pipe', 5, 45, 0.00, NOW(), NOW()),
(20, '3" PVC Bend', 5, 32, 0.00, NOW(), NOW()),
(21, '3" PVC Elbow', 5, 28, 0.00, NOW(), NOW()),
(22, '3" PVC TEE', 5, 36, 0.00, NOW(), NOW()),
(23, '3" PVC 45', 5, 24, 0.00, NOW(), NOW()),
(24, '3" PVC Coupler', 5, 42, 0.00, NOW(), NOW()),
(25, '3" PVC UNION', 5, 18, 0.00, NOW(), NOW()),
(26, '3" PVC ENDCAP', 5, 30, 0.00, NOW(), NOW()),
(27, '3" PVC FTA', 5, 25, 0.00, NOW(), NOW()),
(28, '3" PVC MTA', 5, 22, 0.00, NOW(), NOW()),
(29, '3" PVC Valve', 5, 15, 0.00, NOW(), NOW()),
(30, '2" PVC pipe', 5, 65, 57.99, NOW(), NOW()),
(31, '2 inch PVC Bend', 5, 38, 33.30, NOW(), NOW()),
(32, '2 inch PVC Elbow', 5, 42, 40.47, NOW(), NOW()),
(33, '2 inch PVC TEE', 5, 35, 52.86, NOW(), NOW()),
(34, '2 inch PVC 45', 5, 28, 37.17, NOW(), NOW()),
(35, '2 inch PVC Coupler', 5, 50, 25.28, NOW(), NOW()),
(36, '2 inch PVC UNION', 5, 22, 144.42, NOW(), NOW()),
(37, '2 inch PVC ENDCAP', 5, 40, 30.11, NOW(), NOW()),
(38, '2 inch PVC FTA', 5, 35, 26.04, NOW(), NOW()),
(39, '2 inch PVC MTA', 5, 30, 22.75, NOW(), NOW()),
(40, '2 inch PVC Valve', 5, 18, 233.69, NOW(), NOW()),
(41, '2.5" PVC pipe', 5, 55, 90.66, NOW(), NOW()),
(42, '2.5 inch PVC Bend', 5, 32, 51.75, NOW(), NOW()),
(43, '2.5 inch PVC Elbow', 5, 28, 59.89, NOW(), NOW()),
(44, '2.5 inch PVC TEE', 5, 25, 70.62, NOW(), NOW()),
(45, '2.5 inch PVC 45', 5, 20, 46.67, NOW(), NOW()),
(46, '2.5 inch PVC Coupler', 5, 35, 32.71, NOW(), NOW()),
(47, '2.5 inch PVC UNION', 5, 15, 0.00, NOW(), NOW()),
(48, '2.5 inch PVC ENDCAP', 5, 30, 39.77, NOW(), NOW()),
(49, '2.5 inch PVC FTA', 5, 25, 0.00, NOW(), NOW()),
(50, '2.5 inch PVC MTA', 5, 20, 0.00, NOW(), NOW()),
(51, '2.5 inch PVC Valve', 5, 12, 154.85, NOW(), NOW()),
(52, '1.5 inch PVC pipe', 5, 60, 57.99, NOW(), NOW()),
(53, '1.5 inch PVC Bend', 5, 45, 24.99, NOW(), NOW()),
(54, '1.5 inch PVC Elbow', 5, 50, 26.02, NOW(), NOW()),
(55, '1.5 inch PVC TEE', 5, 40, 34.69, NOW(), NOW()),
(56, '1.5 inch PVC 45', 5, 35, 19.41, NOW(), NOW()),
(57, '1.5 inch PVC Coupler', 5, 55, 15.98, NOW(), NOW()),
(58, '1.5 inch PVC UNION', 5, 25, 121.39, NOW(), NOW()),
(59, '1.5 inch PVC ENDCAP', 5, 45, 15.61, NOW(), NOW()),
(60, '1.5 inch PVC FTA', 5, 40, 15.60, NOW(), NOW()),
(61, '1.5 inch PVC MTA', 5, 30, 0.00, NOW(), NOW()),
(62, '1.5 inch PVC Valve', 5, 10, 375.42, NOW(), NOW()),
(63, '1 inch PVC pipe', 5, 75, 31.14, NOW(), NOW()),
(64, '1 inch PVC Bend', 5, 60, 16.15, NOW(), NOW()),
(65, '1 inch PVC Elbow', 5, 65, 9.57, NOW(), NOW()),
(66, '1 inch PVC TEE', 5, 55, 12.57, NOW(), NOW()),
(67, '1 inch PVC 45', 5, 40, 14.87, NOW(), NOW()),
(68, '1 inch PVC Valve', 5, 15, 188.82, NOW(), NOW()),
(69, '1 inch PVC Coupler', 5, 70, 11.21, NOW(), NOW()),
(70, '1 inch PVC UNION', 5, 30, 35.91, NOW(), NOW()),
(71, '1 inch PVC ENDCAP', 5, 80, 4.79, NOW(), NOW()),
(72, '1 inch PVC FTA', 5, 65, 6.19, NOW(), NOW()),
(73, '1 inch PVC MTA', 5, 60, 6.19, NOW(), NOW()),
(74, '0.75 inch PVC pipe', 5, 85, 20.60, NOW(), NOW()),
(75, '0.75 inch PVC Bend', 5, 45, 0.00, NOW(), NOW()),
(76, '0.75 inch PVC Elbow', 5, 50, 8.55, NOW(), NOW()),
(77, '0.75 inch PVC TEE', 5, 40, 0.00, NOW(), NOW()),
(78, '0.75 inch PVC 45', 5, 35, 0.00, NOW(), NOW()),
(79, '0.75 inch PVC Coupler', 5, 60, 5.58, NOW(), NOW()),
(80, '0.75 inch PVC UNION', 5, 25, 0.00, NOW(), NOW()),
(81, '0.75 inch PVC ENDCAP', 5, 65, 4.09, NOW(), NOW()),
(82, '0.75 inch PVC FTA', 5, 55, 7.43, NOW(), NOW()),
(83, '0.75 inch PVC MTA', 5, 50, 5.20, NOW(), NOW()),
(84, '0.5 inch PVC pipe', 5, 90, 16.52, NOW(), NOW()),
(85, '0.5 inch PVC Bend', 5, 50, 0.00, NOW(), NOW()),
(86, '0.5 inch PVC Elbow', 5, 55, 0.00, NOW(), NOW()),
(87, '0.5 inch PVC TEE', 5, 45, 0.00, NOW(), NOW()),
(88, '0.5 inch PVC 45', 5, 40, 0.00, NOW(), NOW()),
(89, '0.5 inch PVC Coupler', 5, 65, 0.00, NOW(), NOW()),
(90, '0.5 inch PVC UNION', 5, 30, 0.00, NOW(), NOW()),
(91, '0.5 inch PVC ENDCAP', 5, 70, 2.97, NOW(), NOW()),
(92, '0.5 inch PVC FTA', 5, 60, 5.20, NOW(), NOW()),
(93, '0.5 inch PVC MTA', 5, 55, 4.46, NOW(), NOW()),
(94, '237ml PVC GUM', 5, 35, 113.99, NOW(), NOW()),
(95, '100ml PVC GUM', 5, 50, 58.35, NOW(), NOW()),
(96, '3 inch to 2 inch PVC Reducer Coupler', 5, 20, 0.00, NOW(), NOW()),
(97, '3 inch to 1.5 inch PVC Reducer Coupler', 5, 18, 0.00, NOW(), NOW()),
(98, '2.5 inch to 2 inch PVC Reducer Coupler', 5, 25, 37.17, NOW(), NOW()),
(99, '2.5 inch to 1.5 inch PVC Reducer Coupler', 5, 22, 28.99, NOW(), NOW()),
(100, '2 inch to 1 inch PVC Reducer Coupler', 5, 30, 41.65, NOW(), NOW()),
(101, '2 inch to 1.5 inch PVC Reducer Coupler', 5, 28, 30.11, NOW(), NOW()),
(102, '1.5 inch to 1 inch PVC Reducer Coupler', 5, 35, 0.00, NOW(), NOW()),
(103, '1.5 inch to 0.75 inch PVC Reducer Coupler', 5, 25, 0.00, NOW(), NOW()),
(104, '1 inch to 0.75 inch PVC Reducer Coupler', 5, 40, 0.00, NOW(), NOW()),
(105, '1 inch to 0.5 inch PVC Reducer Coupler', 5, 45, 8.18, NOW(), NOW()),
(106, '0.75 inch to 0.5 inch PVC Reducer Coupler', 5, 50, 5.20, NOW(), NOW()),
(107, '3 inch to 2 inch PVC Reducer Bush', 5, 15, 0.00, NOW(), NOW()),
(108, '3 inch to 1.5 inch PVC Reducer Bush', 5, 12, 0.00, NOW(), NOW()),
(109, '2.5 inch to 2 inch PVC Reducer Bush', 5, 20, 37.17, NOW(), NOW()),
(110, '2.5 inch to 1.5 inch PVC Reducer Bush', 5, 18, 28.99, NOW(), NOW()),
(111, '2 inch to 1 inch PVC Reducer Bush', 5, 25, 0.00, NOW(), NOW()),
(112, '1.5 inch to 1 inch PVC Reducer Bush', 5, 30, 0.00, NOW(), NOW()),
(113, '1.5 inch to 0.5 inch PVC Reducer Bush', 5, 22, 15.09, NOW(), NOW()),
(114, '1.5 inch to 0.75 inch PVC Reducer Bush', 5, 20, 23.42, NOW(), NOW()),
(115, '1 inch to 0.75 inch PVC Reducer Bush', 5, 35, 0.00, NOW(), NOW()),
(116, '0.75 inch to 0.5 inch PVC Reducer Bush', 5, 40, 3.35, NOW(), NOW()),
(117, '2 inch to 1 inch Reducing Tee', 5, 18, 79.90, NOW(), NOW()),
(118, '2 inch to 1.5 inch Reducing Bush', 5, 25, 17.97, NOW(), NOW()),
(119, '1 inch Threaded Endcap', 5, 50, 8.95, NOW(), NOW()),
(120, '0.75 inch Threaded Ball Valve', 5, 25, 73.15, NOW(), NOW()),
(121, '3 inch UPVC PIPE', 5, 40, 0.00, NOW(), NOW()),
(122, '3 inch UPVC Bend', 5, 30, 0.00, NOW(), NOW()),
(123, '3 inch UPVC Elbow', 5, 35, 0.00, NOW(), NOW()),
(124, '3 inch UPVC TEE', 5, 25, 0.00, NOW(), NOW()),
(125, '3 inch UPVC 45', 5, 20, 0.00, NOW(), NOW()),
(126, '3 inch UPVC Coupler', 5, 30, 0.00, NOW(), NOW()),
(127, '3 inch UPVC UNION', 5, 15, 0.00, NOW(), NOW()),
(128, '3 inch UPVC ENDCAP', 5, 25, 0.00, NOW(), NOW()),
(129, '3 inch UPVC FTA', 5, 20, 0.00, NOW(), NOW()),
(130, '3 inch UPVC MTA', 5, 18, 0.00, NOW(), NOW()),
(131, '3 inch UPVC Valve', 5, 12, 0.00, NOW(), NOW()),
(132, '2 inch UPVC pipe', 5, 50, 199.38, NOW(), NOW()),
(133, '2 inch UPVC Bend', 5, 35, 134.80, NOW(), NOW()),
(134, '2 inch UPVC Elbow', 5, 40, 76.49, NOW(), NOW()),
(135, '2 inch UPVC TEE', 5, 30, 108.84, NOW(), NOW()),
(136, '2 inch UPVC 45', 5, 25, 66.60, NOW(), NOW()),
(137, '2 inch UPVC Coupler', 5, 45, 37.08, NOW(), NOW()),
(138, '2 inch UPVC UNION', 5, 20, 154.88, NOW(), NOW()),
(139, '2 inch UPVC ENDCAP', 5, 35, 36.91, NOW(), NOW()),
(140, '2 inch UPVC FTA', 5, 30, 45.67, NOW(), NOW()),
(141, '2 inch UPVC MTA', 5, 28, 38.06, NOW(), NOW()),
(142, '2 inch UPVC Valve', 5, 15, 0.00, NOW(), NOW()),
(143, '2.5 inch UPVC pipe', 5, 45, 280.08, NOW(), NOW()),
(144, '2.5 inch UPVC Bend', 5, 30, 372.31, NOW(), NOW()),
(145, '2.5 inch UPVC Elbow', 5, 25, 167.82, NOW(), NOW()),
(146, '2.5 inch UPVC TEE', 5, 20, 215.39, NOW(), NOW()),
(147, '2.5 inch UPVC 45', 5, 18, 136.62, NOW(), NOW()),
(148, '2.5 inch UPVC Coupler', 5, 30, 97.80, NOW(), NOW()),
(149, '2.5 inch UPVC UNION', 5, 12, 0.00, NOW(), NOW()),
(150, '2.5 inch UPVC ENDCAP', 5, 25, 62.41, NOW(), NOW()),
(151, '2.5 inch UPVC FTA', 5, 20, 0.00, NOW(), NOW()),
(152, '2.5 inch UPVC MTA', 5, 18, 0.00, NOW(), NOW()),
(153, '2.5 inch UPVC Valve', 5, 10, 0.00, NOW(), NOW()),
(154, '1.5 inch UPVC pipe', 5, 55, 148.36, NOW(), NOW()),
(155, '1.5 inch UPVC Bend', 5, 40, 90.45, NOW(), NOW()),
(156, '1.5 inch UPVC Elbow', 5, 45, 50.99, NOW(), NOW()),
(157, '1.5 inch UPVC TEE', 5, 35, 67.74, NOW(), NOW()),
(158, '1.5 inch UPVC 45', 5, 30, 41.86, NOW(), NOW()),
(159, '1.5 inch UPVC Coupler', 5, 50, 31.97, NOW(), NOW()),
(160, '1.5 inch UPVC UNION', 5, 20, 0.00, NOW(), NOW()),
(161, '1.5 inch UPVC ENDCAP', 5, 40, 23.79, NOW(), NOW()),
(162, '1.5 inch UPVC FTA', 5, 30, 0.00, NOW(), NOW()),
(163, '1.5 inch UPVC MTA', 5, 25, 0.00, NOW(), NOW()),
(164, '1.5 inch UPVC Valve', 5, 12, 313.95, NOW(), NOW()),
(165, '1 inch UPVC pipe', 5, 65, 92.62, NOW(), NOW()),
(166, '1 inch UPVC Bend', 5, 50, 43.65, NOW(), NOW()),
(167, '1 inch UPVC Elbow', 5, 55, 25.88, NOW(), NOW()),
(168, '1 inch UPVC TEE', 5, 45, 34.63, NOW(), NOW()),
(169, '1 inch UPVC 45', 5, 35, 20.93, NOW(), NOW()),
(170, '1 inch UPVC Coupler', 5, 60, 16.74, NOW(), NOW()),
(171, '1 inch UPVC UNION', 5, 30, 54.80, NOW(), NOW()),
(172, '1 inch UPVC ENDCAP', 5, 50, 0.00, NOW(), NOW()),
(173, '1 inch UPVC FTA', 5, 40, 16.36, NOW(), NOW()),
(174, '1 inch UPVC MTA', 5, 35, 12.94, NOW(), NOW()),
(175, '1 inch UPVC Valve', 5, 20, 190.79, NOW(), NOW()),
(176, '0.75 inch UPVC pipe', 5, 70, 57.84, NOW(), NOW()),
(177, '0.75 inch UPVC Bend', 5, 40, 0.00, NOW(), NOW()),
(178, '0.75 inch UPVC Elbow', 5, 45, 15.22, NOW(), NOW()),
(179, '0.75 inch UPVC TEE', 5, 35, 19.79, NOW(), NOW()),
(180, '0.75 inch UPVC 45', 5, 30, 0.00, NOW(), NOW()),
(181, '0.75 inch UPVC Coupler', 5, 55, 10.66, NOW(), NOW()),
(182, '0.75 inch UPVC UNION', 5, 25, 0.00, NOW(), NOW()),
(183, '0.75 inch UPVC ENDCAP', 5, 40, 0.00, NOW(), NOW()),
(184, '0.75 inch UPVC FTA', 5, 35, 0.00, NOW(), NOW()),
(185, '0.75 inch UPVC MTA', 5, 30, 0.00, NOW(), NOW()),
(186, '0.75 inch UPVC Valve', 5, 15, 92.85, NOW(), NOW()),
(187, '0.5 inch UPVC pipe', 5, 80, 47.42, NOW(), NOW()),
(188, '0.5 inch UPVC Bend', 5, 50, 16.20, NOW(), NOW()),
(189, '0.5 inch UPVC Elbow', 5, 55, 10.66, NOW(), NOW()),
(190, '0.5 inch UPVC TEE', 5, 45, 14.08, NOW(), NOW()),
(191, '0.5 inch UPVC 45', 5, 35, 0.00, NOW(), NOW()),
(192, '0.5 inch UPVC Coupler', 5, 65, 7.23, NOW(), NOW()),
(193, '0.5 inch UPVC UNION', 5, 30, 0.00, NOW(), NOW()),
(194, '0.5 inch UPVC ENDCAP', 5, 60, 0.00, NOW(), NOW()),
(195, '0.5 inch UPVC FTA', 5, 50, 7.23, NOW(), NOW()),
(196, '0.5 inch UPVC MTA', 5, 45, 5.71, NOW(), NOW()),
(197, '0.5 inch UPVC valve', 5, 25, 61.27, NOW(), NOW()),
(198, 'UPVC GUM 237ml', 5, 30, 180.89, NOW(), NOW()),
(199, 'UPVC GUM 118ml', 5, 40, 126.38, NOW(), NOW()),
(200, '3 inch to 2 inch UPVC Reducer', 5, 15, 0.00, NOW(), NOW()),
(201, '3 inch to 1.5 inch UPVC Reducer', 5, 12, 0.00, NOW(), NOW()),
(202, '2.5 inch to 2 inch UPVC Reducer Coupler', 5, 20, 87.15, NOW(), NOW()),
(203, '2.5 inch to 1.5 inch UPVC Reducer Coupler', 5, 18, 85.24, NOW(), NOW()),
(204, '2 inch to 1 inch UPVC Reducer Bush', 5, 25, 37.29, NOW(), NOW()),
(205, '2 inch to 1.5 inch UPVC Reducer Coupler', 5, 22, 52.31, NOW(), NOW()),
(206, '1.5 inch to 1 inch UPVC Reducer Coupler', 5, 30, 35.77, NOW(), NOW()),
(207, '1.5 inch to 0.75 inch UPVC Reducer Coupler', 5, 25, 31.21, NOW(), NOW()),
(208, '1.5 inch to 0.5 inch UPVC Reducer Coupler', 5, 28, 29.30, NOW(), NOW()),
(209, '1 inch to 0.75 inch UPVC Reducer Coupler', 5, 35, 15.22, NOW(), NOW()),
(210, '0.75 inch to 0.5 inch UPVC Reducer Coupler', 5, 40, 10.27, NOW(), NOW()),
(211, '0.75 inch to 0.5 inch UPVC Reducer Bush', 5, 45, 3.81, NOW(), NOW()),
(212, '1 inch to 0.75 inch UPVC Reducer Bush', 5, 35, 17.12, NOW(), NOW()),
(213, '1 inch to 0.5 inch UPVC Reducer Bush', 5, 40, 7.00, NOW(), NOW()),
(214, '2 inch to 0.5 inch UPVC Reducing Tee', 5, 18, 106.20, NOW(), NOW()),
(215, '2 inch to 0.75 inch UPVC Reducing Tee', 5, 15, 106.20, NOW(), NOW()),
(216, '1.5 inch to 0.5 inch UPVC Reducing Tee', 5, 20, 67.26, NOW(), NOW()),
(217, '1.5 inch to 0.5 inch UPVC Reducer Bush', 5, 22, 20.93, NOW(), NOW()),
(218, '1.5 inch to 0.75 inch UPVC Reducer Bush', 5, 20, 21.31, NOW(), NOW()),
(219, '2 inch to 1 inch UPVC Reducer Coupler', 5, 25, 52.14, NOW(), NOW()),
(220, '1" PLASTIC AIR RELIEF VALVE (AUTOMAT)', 8, 25, 123.50, NOW(), NOW()),
(221, '2" ALUMINIUM AIR RELIEF VALVE (AUTOMAT)', 8, 15, 570.00, NOW(), NOW()),
(222, '1" PLASTIC BALL TYPE NRV', 8, 30, 229.89, NOW(), NOW()),
(223, '2" PRESSURE RELIEF VALVE METAL', 8, 10, 2232.27, NOW(), NOW()),
(224, 'Teflon Tape', 8, 100, 19.00, NOW(), NOW()),
(225, 'Hacksaw Blade Single side', 8, 80, 9.88, NOW(), NOW()),
(226, 'Hacksaw Blade Double side', 8, 70, 15.00, NOW(), NOW()),
(227, '1" PVC FLOAT VALVE', 8, 20, 351.50, NOW(), NOW()),
(228, '3/4" PVC FLOAT VALVE', 8, 25, 190.00, NOW(), NOW()),
(229, '3/4" CPVC NRV', 8, 35, 125.80, NOW(), NOW()),
(230, '1.5" 5 WAY CHECK VALVE METAL', 8, 12, 2242.00, NOW(), NOW()),
(231, 'DANFOSS PRESSURE SWITCH KP35', 8, 15, 1150.50, NOW(), NOW()),
(232, 'BAUMER PRESSURE GAUGE', 8, 20, 590.00, NOW(), NOW()),
(233, 'SHELLACK 50ml', 8, 50, 33.25, NOW(), NOW()),
(234, 'Rain Bird Unispray', 8, 30, 148.40, NOW(), NOW()),
(235, 'Rain Bird Maxipaw', 8, 18, 1009.12, NOW(), NOW()),
(236, 'Automation (UNO with add ons)', 6, 10, 6355.93, NOW(), NOW()),
(237, 'Automation (UNO)', 6, 15, 5508.47, NOW(), NOW()),
(238, 'QUADRA (Node)', 6, 8, 8898.31, NOW(), NOW()),
(239, 'QUADRA (Master)', 6, 12, 4661.02, NOW(), NOW()),
(240, 'QUADRA (Master Pump Control 1Ph)', 6, 10, 8050.85, NOW(), NOW()),
(241, 'QUADRA (Master Pump Control 3Ph)', 6, 8, 11016.95, NOW(), NOW()),
(242, 'HEXA', 6, 5, 20500.00, NOW(), NOW()),
(243, 'OCTA', 6, 6, 9500.00, NOW(), NOW()),
(244, '0.5 inch Valve', 6, 25, 508.47, NOW(), NOW()),
(245, '1 inch Valve (T1)', 6, 20, 1769.00, NOW(), NOW()),
(246, '1 inch Valve (T2)', 6, 20, 1500.00, NOW(), NOW()),
(247, '1.5 inch Valve (T1)', 6, 15, 3790.00, NOW(), NOW()),
(248, '2 inch Valve (T1)', 6, 12, 4689.00, NOW(), NOW()),
(249, '2 inch Valve (T2)', 6, 10, 5000.00, NOW(), NOW()),
(250, '3 inch Valve (T1)', 6, 8, 6899.00, NOW(), NOW()),
(251, '3 inch Valve (T2)', 6, 6, 8000.00, NOW(), NOW()),
(252, '0.5 inch Flow Sensor', 6, 30, 215.00, NOW(), NOW()),
(253, '1 inch Flow Sensor', 6, 25, 890.00, NOW(), NOW()),
(254, '1.5 inch Flow Sensor', 6, 20, 1075.00, NOW(), NOW()),
(255, '2 inch Flow Sensor', 6, 15, 1435.89, NOW(), NOW()),
(256, '16mm pipe Jain', 4, 100, 0.00, NOW(), NOW()),
(257, '16mm pipe Sujaya', 4, 150, 8.51, NOW(), NOW()),
(258, '16mm pipe Finolex', 4, 120, 11.16, NOW(), NOW()),
(259, '16mm pipe JS AGRO', 4, 200, 5.76, NOW(), NOW()),
(260, '4mm pipe Jain', 4, 200, 4.37, NOW(), NOW()),
(261, '4mm pipe Finolex', 4, 180, 7.60, NOW(), NOW()),
(262, '4mm elbow', 4, 300, 1.23, NOW(), NOW()),
(263, '4mm Tee', 4, 300, 1.23, NOW(), NOW()),
(264, '4mm Valve', 4, 150, 5.32, NOW(), NOW()),
(265, '4mm Straight Connector', 4, 400, 1.04, NOW(), NOW()),
(266, '4mm Bubbler', 4, 200, 3.80, NOW(), NOW()),
(267, 'Drippers (2,4,6,8,14 LPH)', 4, 500, 3.80, NOW(), NOW()),
(268, '16mm Straight Connector', 4, 250, 4.75, NOW(), NOW()),
(269, '16mm TEE Finolex', 4, 200, 8.12, NOW(), NOW()),
(270, '16mm Elbow finolex', 4, 180, 9.50, NOW(), NOW()),
(271, '16mm ENDCAP', 4, 150, 3.80, NOW(), NOW()),
(272, '16mm Takeoff', 4, 200, 4.75, NOW(), NOW()),
(273, '20mm Takeoff', 4, 150, 9.50, NOW(), NOW()),
(274, '16mm grommet', 4, 300, 2.85, NOW(), NOW()),
(275, '16mm Drip Valve', 4, 200, 2.85, NOW(), NOW()),
(276, '16mm hose clamp', 4, 250, 0.00, NOW(), NOW()),
(277, '4mm Stake (14 inch)', 4, 200, 5.60, NOW(), NOW()),
(278, '4mm Stakes (18 inch)', 4, 180, 6.72, NOW(), NOW()),
(279, '4mm C Stake', 4, 300, 0.78, NOW(), NOW()),
(280, '16mm Stake Brown', 4, 150, 4.48, NOW(), NOW()),
(281, '16mm C Stake', 4, 200, 2.24, NOW(), NOW()),
(282, '4mm Holding Mini Stake', 4, 250, 2.24, NOW(), NOW()),
(283, '4mm Arrows', 4, 300, 1.96, NOW(), NOW()),
(284, 'Bubbler Stake', 4, 100, 11.20, NOW(), NOW()),
(285, '3/4 inch Clappet Riser', 4, 120, 18.05, NOW(), NOW()),
(286, '1 Way Connector (16x3/4") ClappetValve', 4, 150, 5.59, NOW(), NOW()),
(287, '2 Way Connector (16x3/4") ClappetValve', 4, 130, 6.98, NOW(), NOW()),
(288, '4 Way Connector (16x3/4") ClappetValve', 4, 100, 14.25, NOW(), NOW()),
(289, 'Automat 180 deg J-Jet Black', 4, 200, 3.80, NOW(), NOW()),
(290, 'Automat 360 deg J-Jet Green', 4, 200, 3.80, NOW(), NOW()),
(291, 'Jain J-Jet 360 deg (Red)', 4, 200, 3.80, NOW(), NOW());
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--
DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `pid` int NOT NULL AUTO_INCREMENT,
  `pname` varchar(50) NOT NULL,
  `cid` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date NULL,
  `status` enum('Ongoing','Completed','On Hold') DEFAULT 'Ongoing',
  `cname` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`pid`),
  KEY `cid` (`cid`),
  CONSTRAINT `project_ibfk_1` FOREIGN KEY (`cid`) REFERENCES `customer` (`cid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--
LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_spent`
--
DROP TABLE IF EXISTS `inventory_spent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_spent` (
  `spent_id` int NOT NULL AUTO_INCREMENT,
  `stock_id` int DEFAULT NULL,
  `quantity_used` int DEFAULT NULL,
  `used_for` int DEFAULT NULL,
  `recorded_by` int DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `remark` text,
  `spent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `recorded_date` DATE DEFAULT (CURRENT_DATE),
  PRIMARY KEY (`spent_id`),
  KEY `stock_id` (`stock_id`),
  KEY `used_for` (`used_for`),
  KEY `recorded_by` (`recorded_by`),
  CONSTRAINT `inventory_spent_ibfk_1` FOREIGN KEY (`stock_id`) REFERENCES `stock` (`stock_id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_spent_ibfk_2` FOREIGN KEY (`used_for`) REFERENCES `project` (`pid`) ON DELETE CASCADE,
  CONSTRAINT `inventory_spent_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `employee` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `add_expenses`
--
DROP TABLE IF EXISTS `add_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `add_expenses` (
  `Exp_ID` int NOT NULL AUTO_INCREMENT,
  `Date` date NOT NULL,
  `id` int NOT NULL,
  `pid` int NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `Status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `Comments` text,
  PRIMARY KEY (`Exp_ID`),
  KEY `id` (`id`),
  KEY `pid` (`pid`),
  CONSTRAINT `add_expenses_ibfk_1` FOREIGN KEY (`id`) REFERENCES `employee` (`id`) ON DELETE CASCADE,
  CONSTRAINT `add_expenses_ibfk_2` FOREIGN KEY (`pid`) REFERENCES `project` (`pid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `add_expenses`
--
LOCK TABLES `add_expenses` WRITE;
/*!40000 ALTER TABLE `add_expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `add_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rates`
--
DROP TABLE IF EXISTS `rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rates` (
  `rate_id` int NOT NULL ,
  `item_id` int DEFAULT NULL,
  `rate_type` varchar(50) DEFAULT NULL,
  `item_name` varchar(50) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price_pu` decimal(10,2) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`rate_id`),
  KEY `item_id` (`item_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `rates_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `stock` (`stock_id`),
  CONSTRAINT `rates_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rates`
--
LOCK TABLES `rates` WRITE;
/*!40000 ALTER TABLE `rates` DISABLE KEYS */;
INSERT INTO `rates` (`rate_id`, `item_id`, `rate_type`, `item_name`, `quantity`, `price_pu`, `category_id`) VALUES
(1, 1, 'Tools', 'Hammer', 20, 500.00, 1),
(2, 2, 'Tools', 'Screwdriver Set', 15, 750.00, 1),
(3, 3, 'Electronics', 'LED Monitor', 12, 15000.00, 2),
(4, 4, 'Electronics', 'Laptop', 10, 60000.00, 2),
(5, 5, 'Pumping', 'Water Pump', 5, 25000.00, 3),
(6, 6, 'Pumping', 'Submersible Pump', 3, 30000.00, 3),
(19, 18, 'Plumbing', '3" PVC pipe', 45, 0.00, 5),
(20, 19, 'Plumbing', '3" PVC Bend', 32, 0.00, 5),
(21, 20, 'Plumbing', '3" PVC Elbow', 28, 0.00, 5),
(22, 21, 'Plumbing', '3" PVC TEE', 36, 0.00, 5),
(23, 22, 'Plumbing', '3" PVC 45', 24, 0.00, 5),
(24, 23, 'Plumbing', '3" PVC Coupler', 42, 0.00, 5),
(25, 24, 'Plumbing', '3" PVC UNION', 18, 0.00, 5),
(26, 25, 'Plumbing', '3" PVC ENDCAP', 30, 0.00, 5),
(27, 26, 'Plumbing', '3" PVC FTA', 25, 0.00, 5),
(28, 27, 'Plumbing', '3" PVC MTA', 22, 0.00, 5),
(29, 28, 'Plumbing', '3" PVC Valve', 15, 0.00, 5),
(30, 29, 'Plumbing', '2" PVC pipe', 65, 72.48, 5),
(31, 30, 'Plumbing', '2 inch PVC Bend', 38, 41.62, 5),
(32, 31, 'Plumbing', '2 inch PVC Elbow', 42, 50.59, 5),
(33, 32, 'Plumbing', '2 inch PVC TEE', 35, 66.08, 5),
(34, 33, 'Plumbing', '2 inch PVC 45', 28, 46.46, 5),
(35, 34, 'Plumbing', '2 inch PVC Coupler', 50, 31.59, 5),
(36, 35, 'Plumbing', '2 inch PVC UNION', 22, 180.52, 5),
(37, 36, 'Plumbing', '2 inch PVC ENDCAP', 40, 37.63, 5),
(38, 37, 'Plumbing', '2 inch PVC FTA', 35, 32.55, 5),
(39, 38, 'Plumbing', '2 inch PVC MTA', 30, 28.43, 5),
(40, 39, 'Plumbing', '2 inch PVC Valve', 18, 292.12, 5),
(41, 40, 'Plumbing', '2.5" PVC pipe', 55, 113.32, 5),
(42, 41, 'Plumbing', '2.5 inch PVC Bend', 32, 64.69, 5),
(43, 42, 'Plumbing', '2.5 inch PVC Elbow', 28, 74.86, 5),
(44, 43, 'Plumbing', '2.5 inch PVC TEE', 25, 88.28, 5),
(45, 44, 'Plumbing', '2.5 inch PVC 45', 20, 58.34, 5),
(46, 45, 'Plumbing', '2.5 inch PVC Coupler', 35, 40.89, 5),
(47, 46, 'Plumbing', '2.5 inch PVC UNION', 15, 0.00, 5),
(48, 47, 'Plumbing', '2.5 inch PVC ENDCAP', 30, 49.71, 5),
(49, 48, 'Plumbing', '2.5 inch PVC FTA', 25, 0.00, 5),
(50, 49, 'Plumbing', '2.5 inch PVC MTA', 20, 0.00, 5),
(51, 50, 'Plumbing', '2.5 inch PVC Valve', 12, 193.57, 5),
(52, 51, 'Plumbing', '1.5 inch PVC pipe', 60, 72.48, 5),
(53, 52, 'Plumbing', '1.5 inch PVC Bend', 45, 31.24, 5),
(54, 53, 'Plumbing', '1.5 inch PVC Elbow', 50, 32.52, 5),
(55, 54, 'Plumbing', '1.5 inch PVC TEE', 40, 43.37, 5),
(56, 55, 'Plumbing', '1.5 inch PVC 45', 35, 24.26, 5),
(57, 56, 'Plumbing', '1.5 inch PVC Coupler', 55, 19.98, 5),
(58, 57, 'Plumbing', '1.5 inch PVC UNION', 25, 151.74, 5),
(59, 58, 'Plumbing', '1.5 inch PVC ENDCAP', 45, 19.51, 5),
(60, 59, 'Plumbing', '1.5 inch PVC FTA', 40, 19.51, 5),
(61, 60, 'Plumbing', '1.5 inch PVC MTA', 30, 0.00, 5),
(62, 61, 'Plumbing', '1.5 inch PVC Valve', 10, 469.27, 5),
(63, 62, 'Plumbing', '1 inch PVC pipe', 75, 38.93, 5),
(64, 63, 'Plumbing', '1 inch PVC Bend', 60, 20.19, 5),
(65, 64, 'Plumbing', '1 inch PVC Elbow', 65, 11.97, 5),
(66, 65, 'Plumbing', '1 inch PVC TEE', 55, 15.71, 5),
(67, 66, 'Plumbing', '1 inch PVC 45', 40, 18.59, 5),
(68, 67, 'Plumbing', '1 inch PVC Valve', 15, 236.03, 5),
(69, 68, 'Plumbing', '1 inch PVC Coupler', 70, 14.01, 5),
(70, 69, 'Plumbing', '1 inch PVC UNION', 30, 44.88, 5),
(71, 70, 'Plumbing', '1 inch PVC ENDCAP', 80, 5.98, 5),
(72, 71, 'Plumbing', '1 inch PVC FTA', 65, 7.73, 5),
(73, 72, 'Plumbing', '1 inch PVC MTA', 60, 7.73, 5),
(74, 73, 'Plumbing', '0.75 inch PVC pipe', 85, 25.75, 5),
(75, 74, 'Plumbing', '0.75 inch PVC Bend', 45, 0.00, 5),
(76, 75, 'Plumbing', '0.75 inch PVC Elbow', 50, 10.69, 5),
(77, 76, 'Plumbing', '0.75 inch PVC TEE', 40, 0.00, 5),
(78, 77, 'Plumbing', '0.75 inch PVC 45', 35, 0.00, 5),
(79, 78, 'Plumbing', '0.75 inch PVC Coupler', 60, 6.97, 5),
(80, 79, 'Plumbing', '0.75 inch PVC UNION', 25, 0.00, 5),
(81, 80, 'Plumbing', '0.75 inch PVC ENDCAP', 65, 5.11, 5),
(82, 81, 'Plumbing', '0.75 inch PVC FTA', 55, 9.29, 5),
(83, 82, 'Plumbing', '0.75 inch PVC MTA', 50, 6.50, 5),
(84, 83, 'Plumbing', '0.5 inch PVC pipe', 90, 20.65, 5),
(85, 84, 'Plumbing', '0.5 inch PVC Bend', 50, 0.00, 5),
(86, 85, 'Plumbing', '0.5 inch PVC Elbow', 55, 0.00, 5),
(87, 86, 'Plumbing', '0.5 inch PVC TEE', 45, 0.00, 5),
(88, 87, 'Plumbing', '0.5 inch PVC 45', 40, 0.00, 5),
(89, 88, 'Plumbing', '0.5 inch PVC Coupler', 65, 0.00, 5),
(90, 89, 'Plumbing', '0.5 inch PVC UNION', 30, 0.00, 5),
(91, 90, 'Plumbing', '0.5 inch PVC ENDCAP', 70, 3.72, 5),
(92, 91, 'Plumbing', '0.5 inch PVC FTA', 60, 6.50, 5),
(93, 92, 'Plumbing', '0.5 inch PVC MTA', 55, 5.58, 5),
(94, 93, 'Plumbing', '237ml PVC GUM', 35, 142.49, 5),
(95, 94, 'Plumbing', '100ml PVC GUM', 50, 72.94, 5),
(96, 95, 'Plumbing', '3 inch to 2 inch PVC Reducer Coupler', 20, 0.00, 5),
(97, 96, 'Plumbing', '3 inch to 1.5 inch PVC Reducer Coupler', 18, 0.00, 5),
(98, 97, 'Plumbing', '2.5 inch to 2 inch PVC Reducer Coupler', 25, 46.46, 5),
(99, 98, 'Plumbing', '2.5 inch to 1.5 inch PVC Reducer Coupler', 22, 36.24, 5),
(100, 99, 'Plumbing', '2 inch to 1 inch PVC Reducer Coupler', 30, 52.06, 5),
(101, 100, 'Plumbing', '2 inch to 1.5 inch PVC Reducer Coupler', 28, 37.63, 5),
(102, 101, 'Plumbing', '1.5 inch to 1 inch PVC Reducer Coupler', 35, 0.00, 5),
(103, 102, 'Plumbing', '1.5 inch to 0.75 inch PVC Reducer Coupler', 25, 0.00, 5),
(104, 103, 'Plumbing', '1 inch to 0.75 inch PVC Reducer Coupler', 40, 0.00, 5),
(105, 104, 'Plumbing', '1 inch to 0.5 inch PVC Reducer Coupler', 45, 10.22, 5),
(106, 105, 'Plumbing', '0.75 inch to 0.5 inch PVC Reducer Coupler', 50, 6.50, 5),
(107, 106, 'Plumbing', '3 inch to 2 inch PVC Reducer Bush', 15, 0.00, 5),
(108, 107, 'Plumbing', '3 inch to 1.5 inch PVC Reducer Bush', 12, 0.00, 5),
(109, 108, 'Plumbing', '2.5 inch to 2 inch PVC Reducer Bush', 20, 46.46, 5),
(110, 109, 'Plumbing', '2.5 inch to 1.5 inch PVC Reducer Bush', 18, 36.24, 5),
(111, 110, 'Plumbing', '2 inch to 1 inch PVC Reducer Bush', 25, 0.00, 5),
(112, 111, 'Plumbing', '1.5 inch to 1 inch PVC Reducer Bush', 30, 0.00, 5),
(113, 112, 'Plumbing', '1.5 inch to 0.5 inch PVC Reducer Bush', 22, 18.86, 5),
(114, 113, 'Plumbing', '1.5 inch to 0.75 inch PVC Reducer Bush', 20, 29.27, 5),
(115, 114, 'Plumbing', '1 inch to 0.75 inch PVC Reducer Bush', 35, 0.00, 5),
(116, 115, 'Plumbing', '0.75 inch to 0.5 inch PVC Reducer Bush', 40, 4.18, 5),
(117, 116, 'Plumbing', '2 inch to 1 inch Reducing Tee', 18, 99.88, 5),
(118, 117, 'Plumbing', '2 inch to 1.5 inch Reducing Bush', 25, 22.46, 5),
(119, 118, 'Plumbing', '1 inch Threaded Endcap', 50, 11.19, 5),
(120, 119, 'Plumbing', '0.75 inch Threaded Ball Valve', 25, 91.44, 5),
(121, 120, 'Plumbing', '3 inch UPVC PIPE', 40, 0.00, 5),
(122, 121, 'Plumbing', '3 inch UPVC Bend', 30, 0.00, 5),
(123, 122, 'Plumbing', '3 inch UPVC Elbow', 35, 0.00, 5),
(124, 123, 'Plumbing', '3 inch UPVC TEE', 25, 0.00, 5),
(125, 124, 'Plumbing', '3 inch UPVC 45', 20, 0.00, 5),
(126, 125, 'Plumbing', '3 inch UPVC Coupler', 30, 0.00, 5),
(127, 126, 'Plumbing', '3 inch UPVC UNION', 15, 0.00, 5),
(128, 127, 'Plumbing', '3 inch UPVC ENDCAP', 25, 0.00, 5),
(129, 128, 'Plumbing', '3 inch UPVC FTA', 20, 0.00, 5),
(130, 129, 'Plumbing', '3 inch UPVC MTA', 18, 0.00, 5),
(131, 130, 'Plumbing', '3 inch UPVC Valve', 12, 0.00, 5),
(132, 131, 'Plumbing', '2 inch UPVC pipe', 50, 249.23, 5),
(133, 132, 'Plumbing', '2 inch UPVC Bend', 35, 168.50, 5),
(134, 133, 'Plumbing', '2 inch UPVC Elbow', 40, 95.61, 5),
(135, 134, 'Plumbing', '2 inch UPVC TEE', 30, 136.05, 5),
(136, 135, 'Plumbing', '2 inch UPVC 45', 25, 83.25, 5),
(137, 136, 'Plumbing', '2 inch UPVC Coupler', 45, 46.35, 5),
(138, 137, 'Plumbing', '2 inch UPVC UNION', 20, 193.60, 5),
(139, 138, 'Plumbing', '2 inch UPVC ENDCAP', 35, 46.14, 5),
(140, 139, 'Plumbing', '2 inch UPVC FTA', 30, 57.09, 5),
(141, 140, 'Plumbing', '2 inch UPVC MTA', 28, 47.58, 5),
(142, 141, 'Plumbing', '2 inch UPVC Valve', 15, 0.00, 5),
(143, 142, 'Plumbing', '2.5 inch UPVC pipe', 45, 350.10, 5),
(144, 143, 'Plumbing', '2.5 inch UPVC Bend', 30, 465.39, 5),
(145, 144, 'Plumbing', '2.5 inch UPVC Elbow', 25, 209.78, 5),
(146, 145, 'Plumbing', '2.5 inch UPVC TEE', 20, 269.24, 5),
(147, 146, 'Plumbing', '2.5 inch UPVC 45', 18, 170.78, 5),
(148, 147, 'Plumbing', '2.5 inch UPVC Coupler', 30, 122.25, 5),
(149, 148, 'Plumbing', '2.5 inch UPVC UNION', 12, 0.00, 5),
(150, 149, 'Plumbing', '2.5 inch UPVC ENDCAP', 25, 78.01, 5),
(151, 150, 'Plumbing', '2.5 inch UPVC FTA', 20, 0.00, 5),
(152, 151, 'Plumbing', '2.5 inch UPVC MTA', 18, 0.00, 5),
(153, 152, 'Plumbing', '2.5 inch UPVC Valve', 10, 0.00, 5),
(154, 153, 'Plumbing', '1.5 inch UPVC pipe', 55, 185.45, 5),
(155, 154, 'Plumbing', '1.5 inch UPVC Bend', 40, 113.06, 5),
(156, 155, 'Plumbing', '1.5 inch UPVC Elbow', 45, 63.74, 5),
(157, 156, 'Plumbing', '1.5 inch UPVC TEE', 35, 84.68, 5),
(158, 157, 'Plumbing', '1.5 inch UPVC 45', 30, 52.33, 5),
(159, 158, 'Plumbing', '1.5 inch UPVC Coupler', 50, 39.96, 5),
(160, 159, 'Plumbing', '1.5 inch UPVC UNION', 20, 0.00, 5),
(161, 160, 'Plumbing', '1.5 inch UPVC ENDCAP', 40, 29.74, 5),
(162, 161, 'Plumbing', '1.5 inch UPVC FTA', 30, 0.00, 5),
(163, 162, 'Plumbing', '1.5 inch UPVC MTA', 25, 0.00, 5),
(164, 163, 'Plumbing', '1.5 inch UPVC Valve', 12, 392.44, 5),
(165, 164, 'Plumbing', '1 inch UPVC pipe', 65, 115.78, 5),
(166, 165, 'Plumbing', '1 inch UPVC Bend', 50, 54.56, 5),
(167, 166, 'Plumbing', '1 inch UPVC Elbow', 55, 32.35, 5),
(168, 167, 'Plumbing', '1 inch UPVC TEE', 45, 43.29, 5),
(169, 168, 'Plumbing', '1 inch UPVC 45', 35, 26.16, 5),
(170, 169, 'Plumbing', '1 inch UPVC Coupler', 60, 20.93, 5),
(171, 170, 'Plumbing', '1 inch UPVC UNION', 30, 68.50, 5),
(172, 171, 'Plumbing', '1 inch UPVC ENDCAP', 50, 0.00, 5),
(173, 172, 'Plumbing', '1 inch UPVC FTA', 40, 20.45, 5),
(174, 173, 'Plumbing', '1 inch UPVC MTA', 35, 16.18, 5),
(175, 174, 'Plumbing', '1 inch UPVC Valve', 20, 238.49, 5),
(176, 175, 'Plumbing', '0.75 inch UPVC pipe', 70, 72.30, 5),
(177, 176, 'Plumbing', '0.75 inch UPVC Bend', 40, 0.00, 5),
(178, 177, 'Plumbing', '0.75 inch UPVC Elbow', 45, 19.03, 5),
(179, 178, 'Plumbing', '0.75 inch UPVC TEE', 35, 24.74, 5),
(180, 179, 'Plumbing', '0.75 inch UPVC 45', 30, 0.00, 5),
(181, 180, 'Plumbing', '0.75 inch UPVC Coupler', 55, 13.33, 5),
(182, 181, 'Plumbing', '0.75 inch UPVC UNION', 25, 0.00, 5),
(183, 182, 'Plumbing', '0.75 inch UPVC ENDCAP', 40, 0.00, 5),
(184, 183, 'Plumbing', '0.75 inch UPVC FTA', 35, 0.00, 5),
(185, 184, 'Plumbing', '0.75 inch UPVC MTA', 30, 0.00, 5),
(186, 185, 'Plumbing', '0.75 inch UPVC Valve', 15, 116.06, 5),
(187, 186, 'Plumbing', '0.5 inch UPVC pipe', 80, 59.28, 5),
(188, 187, 'Plumbing', '0.5 inch UPVC Bend', 50, 20.25, 5),
(189, 188, 'Plumbing', '0.5 inch UPVC Elbow', 55, 13.33, 5),
(190, 189, 'Plumbing', '0.5 inch UPVC TEE', 45, 17.60, 5),
(191, 190, 'Plumbing', '0.5 inch UPVC 45', 35, 0.00, 5),
(192, 191, 'Plumbing', '0.5 inch UPVC Coupler', 65, 9.04, 5),
(193, 192, 'Plumbing', '0.5 inch UPVC UNION', 30, 0.00, 5),
(194, 193, 'Plumbing', '0.5 inch UPVC ENDCAP', 60, 0.00, 5),
(195, 194, 'Plumbing', '0.5 inch UPVC FTA', 50, 9.04, 5),
(196, 195, 'Plumbing', '0.5 inch UPVC MTA', 45, 7.14, 5),
(197, 196, 'Plumbing', '0.5 inch UPVC valve', 25, 76.59, 5),
(198, 197, 'Plumbing', 'UPVC GUM 237ml', 30, 226.11, 5),
(199, 198, 'Plumbing', 'UPVC GUM 118ml', 40, 157.98, 5),
(200, 199, 'Plumbing', '3 inch to 2 inch UPVC Reducer', 15, 0.00, 5),
(201, 200, 'Plumbing', '3 inch to 1.5 inch UPVC Reducer', 12, 0.00, 5),
(202, 201, 'Plumbing', '2.5 inch to 2 inch UPVC Reducer Coupler', 20, 108.94, 5),
(203, 202, 'Plumbing', '2.5 inch to 1.5 inch UPVC Reducer Coupler', 18, 106.55, 5),
(204, 203, 'Plumbing', '2 inch to 1 inch UPVC Reducer Bush', 25, 46.61, 5),
(205, 204, 'Plumbing', '2 inch to 1.5 inch UPVC Reducer Coupler', 22, 65.39, 5),
(206, 205, 'Plumbing', '1.5 inch to 1 inch UPVC Reducer Coupler', 30, 44.71, 5),
(207, 206, 'Plumbing', '1.5 inch to 0.75 inch UPVC Reducer Coupler', 25, 39.01, 5),
(208, 207, 'Plumbing', '1.5 inch to 0.5 inch UPVC Reducer Coupler', 28, 36.63, 5),
(209, 208, 'Plumbing', '1 inch to 0.75 inch UPVC Reducer Coupler', 35, 19.03, 5),
(210, 209, 'Plumbing', '0.75 inch to 0.5 inch UPVC Reducer Coupler', 40, 12.84, 5),
(211, 210, 'Plumbing', '0.75 inch to 0.5 inch UPVC Reducer Bush', 45, 4.76, 5),
(212, 211, 'Plumbing', '1 inch to 0.75 inch UPVC Reducer Bush', 35, 21.40, 5),
(213, 212, 'Plumbing', '1 inch to 0.5 inch UPVC Reducer Bush', 40, 8.75, 5),
(214, 213, 'Plumbing', '2 inch to 0.5 inch UPVC Reducing Tee', 18, 132.75, 5),
(215, 214, 'Plumbing', '2 inch to 0.75 inch UPVC Reducing Tee', 15, 132.75, 5),
(216, 215, 'Plumbing', '1.5 inch to 0.5 inch UPVC Reducing Tee', 20, 84.08, 5),
(217, 216, 'Plumbing', '1.5 inch to 0.5 inch UPVC Reducer Bush', 22, 26.16, 5),
(218, 217, 'Plumbing', '1.5 inch to 0.75 inch UPVC Reducer Bush', 20, 26.64, 5),
(219, 218, 'Plumbing', '2 inch to 1 inch UPVC Reducer Coupler', 25, 65.18, 8),
(220, 219, 'Others', '1" PLASTIC AIR RELIEF VALVE (AUTOMAT)', 25, 154.37, 8),
(221, 220, 'Others', '2" ALUMINIUM AIR RELIEF VALVE (AUTOMAT)', 15, 712.49, 8),
(222, 221, 'Others', '1" PLASTIC BALL TYPE NRV', 30, 287.37, 8),
(223, 222, 'Others', '2" PRESSURE RELIEF VALVE METAL', 10, 2790.34, 8),
(224, 223, 'Others', 'Teflon Tape', 100, 23.75, 8),
(225, 224, 'Others', 'Hacksaw Blade Single side', 80, 12.35, 8),
(226, 225, 'Others', 'Hacksaw Blade Double side', 70, 18.75, 8),
(227, 226, 'Others', '1" PVC FLOAT VALVE', 20, 439.38, 8),
(228, 227, 'Others', '3/4" PVC FLOAT VALVE', 25, 237.50, 8),
(229, 228, 'Others', '3/4" CPVC NRV', 35, 157.25, 8),
(230, 229, 'Others', '1.5" 5 WAY CHECK VALVE METAL', 12, 2802.50, 8),
(231, 230, 'Others', 'DANFOSS PRESSURE SWITCH KP35', 15, 1438.13, 8),
(232, 231, 'Others', 'BAUMER PRESSURE GAUGE', 20, 737.50, 8),
(233, 232, 'Others', 'SHELLACK 50ml', 50, 41.56, 8),
(234, 233, 'Others', 'Rain Bird Unispray', 30, 185.50, 8),
(235, 234, 'Others', 'Rain Bird Maxipaw', 18, 1261.40, 8),
(236, 235, 'Automation', 'Automation (UNO with add ons)', 10, 7500.00, 6),
(237, 236, 'Automation', 'Automation (UNO)', 15, 6500.00, 6),
(238, 237, 'Automation', 'QUADRA (Node)', 8, 10500.00, 6),
(239, 238, 'Automation', 'QUADRA (Master)', 12, 5500.00, 6),
(240, 239, 'Automation', 'QUADRA (Master Pump Control 1Ph)', 10, 9500.00, 6),
(241, 240, 'Automation', 'QUADRA (Master Pump Control 3Ph)', 8, 13000.00, 6),
(242, 241, 'Automation', 'HEXA', 5, 24190.00, 6),
(243, 242, 'Automation', 'OCTA', 6, 11210.00, 6),
(244, 243, 'Automation', '0.5 inch Valve', 25, 600.00, 6),
(245, 244, 'Automation', '1 inch Valve (T1)', 20, 2087.00, 6),
(246, 245, 'Automation', '1 inch Valve (T2)', 20, 1770.00, 6),
(247, 246, 'Automation', '1.5 inch Valve (T1)', 15, 4472.00, 6),
(248, 247, 'Automation', '2 inch Valve (T1)', 12, 5533.00, 6),
(249, 248, 'Automation', '2 inch Valve (T2)', 10, 5900.00, 6),
(250, 249, 'Automation', '3 inch Valve (T1)', 8, 8141.00, 6),
(251, 250, 'Automation', '3 inch Valve (T2)', 6, 9440.00, 6),
(252, 251, 'Automation', '0.5 inch Flow Sensor', 30, 254.00, 6),
(253, 252, 'Automation', '1 inch Flow Sensor', 25, 1050.00, 6),
(254, 253, 'Automation', '1.5 inch Flow Sensor', 20, 1269.00, 6),
(255, 254, 'Automation', '2 inch Flow Sensor', 15, 1694.00, 6),
(256, 255, 'Drip', '16mm pipe Jain', 100, 0.00, 4),
(257, 256, 'Drip', '16mm pipe Sujaya', 150, 10.64, 4),
(258, 257, 'Drip', '16mm pipe Finolex', 120, 13.95, 4),
(259, 258, 'Drip', '16mm pipe JS AGRO', 200, 7.20, 4),
(260, 259, 'Drip', '4mm pipe Jain', 200, 5.46, 4),
(261, 260, 'Drip', '4mm pipe Finolex', 180, 9.50, 4),
(262, 261, 'Drip', '4mm elbow', 300, 1.54, 4),
(263, 262, 'Drip', '4mm Tee', 300, 1.54, 4),
(264, 263, 'Drip', '4mm Valve', 150, 6.65, 4),
(265, 264, 'Drip', '4mm Straight Connector', 400, 1.30, 4),
(266, 265, 'Drip', '4mm Bubbler', 200, 4.75, 4),
(267, 266, 'Drip', 'Drippers (2,4,6,8,14 LPH)', 500, 4.75, 4),
(268, 267, 'Drip', '16mm Straight Connector', 250, 5.93, 4),
(269, 268, 'Drip', '16mm TEE Finolex', 200, 10.15, 4),
(270, 269, 'Drip', '16mm Elbow finolex', 180, 11.88, 4),
(271, 270, 'Drip', '16mm ENDCAP', 150, 4.75, 4),
(272, 271, 'Drip', '16mm Takeoff', 200, 5.93, 4),
(273, 272, 'Drip', '20mm Takeoff', 150, 11.88, 4),
(274, 273, 'Drip', '16mm grommet', 300, 3.56, 4),
(275, 274, 'Drip', '16mm Drip Valve', 200, 3.56, 4),
(276, 275, 'Drip', '16mm hose clamp', 250, 0.00, 4),
(277, 276, 'Drip', '4mm Stake (14 inch)', 200, 7.00, 4),
(278, 277, 'Drip', '4mm Stakes (18 inch)', 180, 8.40, 4),
(279, 278, 'Drip', '4mm C Stake', 300, 0.98, 4),
(280, 279, 'Drip', '16mm Stake Brown', 150, 5.60, 4),
(281, 280, 'Drip', '16mm C Stake', 200, 2.80, 4),
(282, 281, 'Drip', '4mm Holding Mini Stake', 250, 2.80, 4),
(283, 282, 'Drip', '4mm Arrows', 300, 2.45, 4),
(284, 283, 'Drip', 'Bubbler Stake', 100, 14.00, 4),
(285, 284, 'Drip', '3/4 inch Clappet Riser', 120, 22.56, 4),
(286, 285, 'Drip', '1 Way Connector (16x3/4") ClappetValve', 150, 6.98, 4),
(287, 286, 'Drip', '2 Way Connector (16x3/4") ClappetValve', 130, 8.72, 4),
(288, 287, 'Drip', '4 Way Connector (16x3/4") ClappetValve', 100, 17.81, 4),
(289, 288, 'Drip', 'Automat 180 deg J-Jet Black', 200, 4.75, 4),
(290, 289, 'Drip', 'Automat 360 deg J-Jet Green', 200, 4.75, 4),
(291, 290, 'Drip', 'Jain J-Jet 360 deg (Red)', 200, 4.75, 4);
/*!40000 ALTER TABLE `rates` ENABLE KEYS */;
UNLOCK TABLES;

ALTER TABLE rates AUTO_INCREMENT = 292;
--
-- Table structure for table `works_on`
--
DROP TABLE IF EXISTS `works_on`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `works_on` (
  `emp_id` int NOT NULL,
  `pid` int NOT NULL,
  PRIMARY KEY (`emp_id`,`pid`),
  KEY `works_on_ibfk_2` (`pid`),
  CONSTRAINT `works_on_ibfk_1` FOREIGN KEY (`emp_id`) REFERENCES `employee` (`id`),
  CONSTRAINT `works_on_ibfk_2` FOREIGN KEY (`pid`) REFERENCES `project` (`pid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `works_on`
--
LOCK TABLES `works_on` WRITE;
/*!40000 ALTER TABLE `works_on` DISABLE KEYS */;

/*!40000 ALTER TABLE `works_on` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotesdata`
--
DROP TABLE IF EXISTS `quotesdata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotesdata` (
   `quote_id` int NOT NULL AUTO_INCREMENT,
   `project_id` int DEFAULT NULL,
   `customer_name` varchar(255) DEFAULT NULL,
   `date` date NOT NULL DEFAULT (curdate()),
   `automation_cost` decimal(10,2) DEFAULT NULL,
   `drip_cost` decimal(10,2) DEFAULT NULL,
   `electronics_cost` decimal(10,2) DEFAULT NULL,
   `labour_cost` decimal(10,2) DEFAULT NULL,
   `plumbing_cost` decimal(10,2) DEFAULT NULL,
   `pumping_cost` decimal(10,2) DEFAULT NULL,
   `tools_cost` decimal(10,2) DEFAULT NULL,
   `additional_cost` decimal(10,2) DEFAULT NULL,
   `total_cost` decimal(10,2) DEFAULT NULL,
   PRIMARY KEY (`quote_id`),
   KEY `project_id` (`project_id`),
   CONSTRAINT `quotesdata_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`pid`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoices`
--
DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `pid` int NOT NULL,
  `pname` varchar(255) NOT NULL,
  `cid` int NOT NULL,
  `cname` varchar(255) NOT NULL,
  `expenses` json NOT NULL,
  `extraExpenses` json NOT NULL,
  `inventory` json NOT NULL,
  `grandTotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_id`),
  KEY `pid` (`pid`),
  KEY `cid` (`cid`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`pid`) REFERENCES `project` (`pid`),
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`cid`) REFERENCES `customer` (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reminders`
--
DROP TABLE IF EXISTS `reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminders` (
    `rid` INT AUTO_INCREMENT PRIMARY KEY,
    `cid` INT NOT NULL,
    `reminder_date` DATE NOT NULL,
    `reminder_time` TIME NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cid`) REFERENCES `customer`(`cid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stock_transactions`
--
DROP TABLE IF EXISTS `stock_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transactions` (
  `transaction_id` INT NOT NULL AUTO_INCREMENT,
  `stock_id` INT NOT NULL,
  `transaction_type` ENUM('ADD', 'SPEND', 'UPDATE', 'ADJUST') NOT NULL,
  `quantity_change` INT NOT NULL,
  `previous_quantity` INT NOT NULL,
  `new_quantity` INT NOT NULL,
  `price_pu` DECIMAL(10,2) NOT NULL,
  `project_id` INT DEFAULT NULL,
  `employee_id` INT NOT NULL,
  `transaction_date` DATE DEFAULT (CURRENT_DATE),
  `transaction_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT,
  PRIMARY KEY (`transaction_id`),
  KEY `stock_id` (`stock_id`),
  KEY `project_id` (`project_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `stock_transactions_ibfk_1` FOREIGN KEY (`stock_id`) REFERENCES `stock` (`stock_id`),
  CONSTRAINT `stock_transactions_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transactions`
--
LOCK TABLES `stock_transactions` WRITE;
/*!40000 ALTER TABLE `stock_transactions` DISABLE KEYS */;
/* Initial transactions will be added by triggers */
/*!40000 ALTER TABLE `stock_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Triggers for stock tracking
--
DELIMITER //

-- Trigger for INSERT (adding new stock)
CREATE TRIGGER after_stock_insert
AFTER INSERT ON `stock`
FOR EACH ROW
BEGIN
    INSERT INTO stock_transactions (
        stock_id, 
        transaction_type, 
        quantity_change, 
        previous_quantity, 
        new_quantity, 
        price_pu, 
        employee_id,
        notes
    ) VALUES (
        NEW.stock_id, 
        'ADD', 
        NEW.quantity, 
        0, 
        NEW.quantity, 
        NEW.price_pu, 
        1, -- Default admin user
        CONCAT('Initial stock added - ', NEW.item_name)
    );
END//

-- Trigger for UPDATE (stock changes)
CREATE TRIGGER after_stock_update
AFTER UPDATE ON `stock`
FOR EACH ROW
BEGIN
    IF OLD.quantity != NEW.quantity OR OLD.price_pu != NEW.price_pu THEN
        INSERT INTO stock_transactions (
            stock_id, 
            transaction_type, 
            quantity_change, 
            previous_quantity, 
            new_quantity, 
            price_pu, 
            employee_id,
            notes
        ) VALUES (
            NEW.stock_id, 
            'UPDATE', 
            NEW.quantity - OLD.quantity, 
            OLD.quantity, 
            NEW.quantity, 
            NEW.price_pu, 
            1, -- Default admin user
            CONCAT('Stock updated - ', NEW.item_name, 
                  IF(OLD.quantity != NEW.quantity, CONCAT(' Quantity: ', OLD.quantity, '→', NEW.quantity), ''),
                  IF(OLD.price_pu != NEW.price_pu, CONCAT(' Price: ', OLD.price_pu, '→', NEW.price_pu), ''))
        );
    END IF;
END//

-- Trigger for inventory spending
CREATE TRIGGER after_inventory_spent
AFTER INSERT ON `inventory_spent`
FOR EACH ROW
BEGIN
    DECLARE prev_qty INT;
    DECLARE new_qty INT;
    DECLARE item_name VARCHAR(100);
    DECLARE item_price DECIMAL(10,2);
    
    -- Get current stock quantity and price
    SELECT quantity, price_pu, item_name INTO prev_qty, item_price, item_name 
    FROM stock WHERE stock_id = NEW.stock_id;
    
    -- Calculate new quantity
    SET new_qty = prev_qty - NEW.quantity_used;
    
    -- Update stock quantity
    UPDATE stock SET quantity = new_qty WHERE stock_id = NEW.stock_id;
    
    -- Log the transaction
    INSERT INTO stock_transactions (
        stock_id, 
        transaction_type, 
        quantity_change, 
        previous_quantity, 
        new_quantity, 
        price_pu, 
        project_id,
        employee_id,
        notes
    ) VALUES (
        NEW.stock_id, 
        'SPEND', 
        -NEW.quantity_used, 
        prev_qty, 
        new_qty, 
        item_price, 
        NEW.used_for,
        NEW.recorded_by,
        CONCAT('Used for project: ', 
              (SELECT pname FROM project WHERE pid = NEW.used_for), 
              ' - ', 
              IFNULL(NEW.remark, ''))
    );
END//

DELIMITER ;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-23 11:31:00