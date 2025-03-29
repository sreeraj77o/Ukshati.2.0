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

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `category_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_pu` decimal(10,2) NOT NULL,
  PRIMARY KEY (`stock_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `inventory_spent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_spent` (
  `spent_id` int NOT NULL,
  `stock_id` int DEFAULT NULL,
  `quantity_used` int DEFAULT NULL,
  `used_for` int DEFAULT NULL,
  `recorded_by` int DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `remark` text,
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
-- Dumping data for table `inventory_spent`
--

LOCK TABLES `inventory_spent` WRITE;
/*!40000 ALTER TABLE `inventory_spent` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_spent` ENABLE KEYS */;
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
  `end_date` date DEFAULT NULL,
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
-- Dumping data for table `quotesdata`
--

LOCK TABLES `quotesdata` WRITE;
/*!40000 ALTER TABLE `quotesdata` DISABLE KEYS */;
/*!40000 ALTER TABLE `quotesdata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rates`
--

DROP TABLE IF EXISTS `rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rates` (
  `rate_id` int NOT NULL,
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
-- Table structure for table `stock`
--

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

ALTER TABLE inventory_spent MODIFY spent_id INT AUTO_INCREMENT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;


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

DROP TABLE IF EXISTS reminders;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE reminders (
    rid INT AUTO_INCREMENT PRIMARY KEY,
    cid INT NOT NULL,
    reminder_date DATE NOT NULL,
    reminder_time TIME NOT NULL,
    message TEXT NOT NULL,
    FOREIGN KEY (cid) REFERENCES customer(cid) ON DELETE CASCADE
)ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-23 11:31:00