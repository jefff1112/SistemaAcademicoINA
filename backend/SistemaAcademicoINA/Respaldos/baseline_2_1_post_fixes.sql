-- MySQL dump 10.13  Distrib 8.4.7, for Win64 (x86_64)
--
-- Host: localhost    Database: sistema_academico
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `sistema_academico`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `sistema_academico` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `sistema_academico`;

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__efmigrationshistory`
--

LOCK TABLES `__efmigrationshistory` WRITE;
/*!40000 ALTER TABLE `__efmigrationshistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `__efmigrationshistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actividad_usuarios`
--

DROP TABLE IF EXISTS `actividad_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividad_usuarios` (
  `id_actividad` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `usuario` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `accion` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `modulo` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `detalle` text COLLATE utf8mb4_spanish_ci,
  `ip` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_actividad`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `fk_actividad_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividad_usuarios`
--

LOCK TABLES `actividad_usuarios` WRITE;
/*!40000 ALTER TABLE `actividad_usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `actividad_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actividades`
--

DROP TABLE IF EXISTS `actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades` (
  `id_actividad` int NOT NULL AUTO_INCREMENT,
  `id_materia` int NOT NULL,
  `id_clase` int NOT NULL,
  `id_docente` int NOT NULL,
  `nombre_actividad` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_actividad` enum('Tarea','Examen','Proyecto','Participacion','Otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ponderacion` decimal(5,2) NOT NULL,
  `fecha_publicacion` date NOT NULL,
  `fecha_limite` date NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `especificacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `estado` enum('Pendiente','Activo','Cerrado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_actividad`),
  KEY `id_materia` (`id_materia`),
  KEY `id_docente` (`id_docente`),
  KEY `idx_actividad_clase_materia` (`id_clase`,`id_materia`),
  KEY `idx_actividad_fecha_limite` (`fecha_limite`),
  CONSTRAINT `fk_actividades_clase` FOREIGN KEY (`id_clase`) REFERENCES `clases` (`id_clase`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_actividades_docente` FOREIGN KEY (`id_docente`) REFERENCES `docentes` (`id_docente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_actividades_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades`
--

LOCK TABLES `actividades` WRITE;
/*!40000 ALTER TABLE `actividades` DISABLE KEYS */;
INSERT INTO `actividades` VALUES (1,1,1,1,'Tarea 1: Operaciones Básicas','Tarea',10.00,'2026-01-20','2026-01-27','Resolver ejercicios de operaciones combinadas',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(2,1,1,1,'Examen Unidad I','Examen',20.00,'2026-02-02','2026-02-06','Examen de la unidad de conjuntos y numeros reales',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(3,1,1,1,'Proyecto: Presupuesto Familiar','Proyecto',30.00,'2026-02-10','2026-02-24','Elaborar presupuesto familiar con datos reales',NULL,'Cerrado','2026-08-15 00:30:23','2026-08-15 00:30:23'),(4,1,1,1,'Participacion en Clase','Participacion',10.00,'2026-01-15','2026-03-10','Evaluacion continua de participacion',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(5,2,1,1,'Ensayo: La Literatura Salvadorena','Tarea',15.00,'2026-01-22','2026-01-29','Ensayo sobre autores salvadorenos',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(6,3,1,2,'Examen Unidad I: La Celula','Examen',25.00,'2026-02-03','2026-02-07','Examen de citologia',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(7,4,1,2,'Investigacion: Simbolos Patrios','Tarea',15.00,'2026-01-26','2026-02-03','Investigacion historica de los simbolos patrios',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(8,5,2,3,'Tarea: Vocabulario Unidad 2','Tarea',30.00,'2026-01-25','2026-02-01','Vocabulario de la unidad 2',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(9,6,1,3,'Practica: Hoja de Calculo','Proyecto',5.00,'2026-02-12','2026-03-04','Practica de formulas en hoja de calculo',NULL,'Cerrado','2026-08-15 00:30:23','2026-08-15 00:30:23'),(10,7,3,4,'Tarea: Estructuras de Datos','Tarea',15.00,'2026-01-22','2026-01-29','Ejercicios de pilas y colas',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(11,7,3,4,'Examen Parcial: Programacion','Examen',35.00,'2026-02-05','2026-02-09','Examen parcial de logica de programacion',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(12,8,3,4,'Proyecto: Base de Datos Escolar','Proyecto',50.00,'2026-02-12','2026-03-05','Disenar e implementar base de datos del instituto',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(13,7,4,4,'Examen: Logica de Programacion','Examen',50.00,'2026-02-06','2026-02-10','Examen de logica aplicada',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(14,8,4,4,'Tarea: Modelo Relacional','Tarea',50.00,'2026-02-10','2026-02-20','Modelar entidades de un sistema de biblioteca',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(15,10,6,5,'Tarea: Asientos Contables','Tarea',25.00,'2026-01-28','2026-02-04','Registrar asientos contables basicos',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(16,11,6,5,'Proyecto: Planilla de Empleados','Proyecto',35.00,'2026-02-10','2026-03-06','Calcular planilla con deducciones de ley',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(17,12,7,6,'Practica: Higiene Escolar','Tarea',30.00,'2026-01-27','2026-02-04','Practica de habitos de higiene personal',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23'),(18,13,7,6,'Practica: Vendajes','Proyecto',40.00,'2026-02-15','2026-03-01','Practica de tecnicas de vendaje basico',NULL,'Activo','2026-08-15 00:30:23','2026-08-15 00:30:23');
/*!40000 ALTER TABLE `actividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actividades_entregas`
--

DROP TABLE IF EXISTS `actividades_entregas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades_entregas` (
  `id_entrega` int NOT NULL AUTO_INCREMENT,
  `id_actividad` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `fecha_entrega` datetime DEFAULT NULL,
  `archivo_entrega` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `estado_entrega` enum('Pendiente','Entregado','Revisado','Atrasado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Pendiente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_entrega`),
  UNIQUE KEY `uk_actividad_estudiante` (`id_actividad`,`id_estudiante`),
  KEY `idx_entrega_estudiante` (`id_estudiante`),
  CONSTRAINT `fk_entrega_actividad` FOREIGN KEY (`id_actividad`) REFERENCES `actividades` (`id_actividad`) ON DELETE CASCADE,
  CONSTRAINT `fk_entrega_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades_entregas`
--

LOCK TABLES `actividades_entregas` WRITE;
/*!40000 ALTER TABLE `actividades_entregas` DISABLE KEYS */;
/*!40000 ALTER TABLE `actividades_entregas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actividades_periodos`
--

DROP TABLE IF EXISTS `actividades_periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades_periodos` (
  `id_actividad_periodo` int NOT NULL AUTO_INCREMENT,
  `id_actividad` int NOT NULL,
  `id_periodo` int NOT NULL,
  `ponderacion_periodo` decimal(5,2) NOT NULL COMMENT 'Ponderación dentro del periodo (máx 100%)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_actividad_periodo`),
  UNIQUE KEY `uk_actividad_periodo` (`id_actividad`,`id_periodo`),
  KEY `idx_actividad_periodo_periodo` (`id_periodo`),
  CONSTRAINT `fk_actperiod_actividad` FOREIGN KEY (`id_actividad`) REFERENCES `actividades` (`id_actividad`) ON DELETE CASCADE,
  CONSTRAINT `fk_actperiod_periodo` FOREIGN KEY (`id_periodo`) REFERENCES `periodos_academicos` (`id_periodo`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades_periodos`
--

LOCK TABLES `actividades_periodos` WRITE;
/*!40000 ALTER TABLE `actividades_periodos` DISABLE KEYS */;
INSERT INTO `actividades_periodos` VALUES (1,1,1,10.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(2,2,1,20.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(3,3,1,30.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(4,4,1,10.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(5,5,1,15.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(6,6,1,25.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(7,7,1,15.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(8,8,1,30.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(9,9,1,5.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(10,10,1,15.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(11,11,1,35.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(12,12,1,50.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(13,13,1,50.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(14,14,1,50.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(15,15,1,25.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(16,16,1,35.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(17,17,1,30.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(18,18,1,40.00,'2026-08-15 00:30:23','2026-08-15 00:30:23');
/*!40000 ALTER TABLE `actividades_periodos` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_actividades_periodos_before_insert` BEFORE INSERT ON `actividades_periodos` FOR EACH ROW BEGIN
    DECLARE v_clase_id INT;
    DECLARE v_total DECIMAL(5,2);
    
    SELECT id_clase INTO v_clase_id 
    FROM actividades WHERE id_actividad = NEW.id_actividad;
    
    SELECT IFNULL(SUM(ponderacion_periodo), 0) INTO v_total
    FROM actividades_periodos ap
    INNER JOIN actividades a ON ap.id_actividad = a.id_actividad
    WHERE a.id_clase = v_clase_id
      AND ap.id_periodo = NEW.id_periodo
      AND a.estado != 'Cerrado';
    
    IF (v_total + NEW.ponderacion_periodo) > 100 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'La ponderación total del periodo excede el 100%';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_actividades_periodos_before_update` BEFORE UPDATE ON `actividades_periodos` FOR EACH ROW BEGIN
    DECLARE v_clase_id INT;
    DECLARE v_total DECIMAL(5,2);
    
    SELECT id_clase INTO v_clase_id 
    FROM actividades WHERE id_actividad = NEW.id_actividad;
    
    SELECT IFNULL(SUM(ponderacion_periodo), 0) INTO v_total
    FROM actividades_periodos ap
    INNER JOIN actividades a ON ap.id_actividad = a.id_actividad
    WHERE a.id_clase = v_clase_id
      AND ap.id_periodo = NEW.id_periodo
      AND ap.id_actividad_periodo != NEW.id_actividad_periodo
      AND a.estado != 'Cerrado';
    
    IF (v_total + NEW.ponderacion_periodo) > 100 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'La ponderación total del periodo excede el 100%';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `administradores`
--

DROP TABLE IF EXISTS `administradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administradores` (
  `id_admin` int NOT NULL,
  `usuario` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `contraseña` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `nombre_completo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `id_rol` int DEFAULT NULL,
  PRIMARY KEY (`id_admin`),
  KEY `fk_admin_usuario` (`usuario`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `fk_admin_usuario` FOREIGN KEY (`usuario`) REFERENCES `usuarios` (`codigo`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_administradores_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administradores`
--

LOCK TABLES `administradores` WRITE;
/*!40000 ALTER TABLE `administradores` DISABLE KEYS */;
INSERT INTO `administradores` VALUES (1,'admin','$2a$11$bWtGBM9DWGJHIc9SWheVceDnLjiyPfCW3fFqi8ks.PJDzdiCJ.ymO','Administrador del Sistema','admin@ina.edu.sv',1);
/*!40000 ALTER TABLE `administradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignacion_aulas`
--

DROP TABLE IF EXISTS `asignacion_aulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignacion_aulas` (
  `id_asignacion_aula` int NOT NULL,
  `id_clase` int NOT NULL,
  `id_aula` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `asignado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_asignacion_aula`),
  KEY `idx_asignacion_id_clase` (`id_clase`),
  KEY `idx_asignacion_id_aula` (`id_aula`),
  CONSTRAINT `fk_asignacion_aula` FOREIGN KEY (`id_aula`) REFERENCES `aulas` (`id_aula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignacion_aulas`
--

LOCK TABLES `asignacion_aulas` WRITE;
/*!40000 ALTER TABLE `asignacion_aulas` DISABLE KEYS */;
/*!40000 ALTER TABLE `asignacion_aulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id_asistencia` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_clase` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_docente` int NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('Presente','Ausente','Tarde','Justificado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'Presente',
  `hora_registro` time NOT NULL,
  `minutos_tarde` int DEFAULT '0',
  `justificacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `justificado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha_justificacion` date DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `uk_asistencia_estudiante_fecha` (`id_estudiante`,`id_clase`,`fecha`),
  KEY `idx_asistencia_estudiante` (`id_estudiante`),
  KEY `idx_asistencia_clase` (`id_clase`),
  KEY `idx_asistencia_materia` (`id_materia`),
  KEY `idx_asistencia_docente` (`id_docente`),
  KEY `idx_asistencia_fecha` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
INSERT INTO `asistencias` VALUES (1,1,1,1,1,'2026-01-13','Presente','07:02:00',0,NULL,NULL,NULL,NULL),(2,1,1,1,1,'2026-01-14','Presente','07:01:00',0,NULL,NULL,NULL,NULL),(3,1,1,1,1,'2026-01-15','Tarde','07:15:00',15,NULL,NULL,NULL,'Llego tarde por trafico'),(4,1,1,1,1,'2026-01-16','Presente','07:00:00',0,NULL,NULL,NULL,NULL),(5,1,1,1,1,'2026-01-20','Presente','07:03:00',0,NULL,NULL,NULL,NULL),(6,1,1,1,1,'2026-01-21','Ausente','08:00:00',0,NULL,NULL,NULL,'Cita medica'),(7,1,1,1,1,'2026-01-22','Presente','07:00:00',0,NULL,NULL,NULL,NULL),(8,1,1,1,1,'2026-01-26','Tarde','07:10:00',10,NULL,NULL,NULL,NULL),(9,1,1,1,1,'2026-01-27','Presente','07:01:00',0,NULL,NULL,NULL,NULL),(10,1,1,1,1,'2026-01-28','Presente','07:02:00',0,NULL,NULL,NULL,NULL),(11,2,1,1,1,'2026-01-13','Presente','07:00:00',0,NULL,NULL,NULL,NULL),(12,2,1,1,1,'2026-01-14','Presente','07:05:00',0,NULL,NULL,NULL,NULL),(13,2,1,1,1,'2026-01-15','Tarde','07:12:00',12,NULL,NULL,NULL,NULL),(14,2,1,1,1,'2026-01-16','Presente','07:00:00',0,NULL,NULL,NULL,NULL),(15,2,1,1,1,'2026-01-20','Ausente','08:10:00',0,NULL,NULL,NULL,'Motivo familiar'),(16,2,1,1,1,'2026-01-21','Presente','07:00:00',0,NULL,NULL,NULL,NULL),(17,3,3,7,4,'2026-01-13','Presente','07:01:00',0,NULL,NULL,NULL,NULL),(18,3,3,7,4,'2026-01-14','Presente','07:03:00',0,NULL,NULL,NULL,NULL),(19,3,3,7,4,'2026-01-16','Presente','07:00:00',0,NULL,NULL,NULL,NULL),(20,3,3,7,4,'2026-01-20','Presente','07:02:00',0,NULL,NULL,NULL,NULL),(21,3,3,7,4,'2026-01-22','Tarde','07:20:00',20,NULL,NULL,NULL,NULL),(22,3,3,7,4,'2026-01-27','Presente','07:00:00',0,NULL,NULL,NULL,NULL),(23,6,4,7,4,'2026-02-03','Presente','07:00:00',0,NULL,NULL,NULL,NULL),(24,6,4,7,4,'2026-02-04','Presente','07:01:00',0,NULL,NULL,NULL,NULL),(25,6,4,7,4,'2026-02-06','Ausente','08:00:00',0,NULL,NULL,NULL,'Sin justificacion'),(26,6,4,7,4,'2026-02-10','Presente','07:00:00',0,NULL,NULL,NULL,NULL),(27,6,4,7,4,'2026-02-11','Presente','07:05:00',0,NULL,NULL,NULL,NULL),(28,8,1,1,1,'2026-08-15','Presente','18:59:37',NULL,NULL,NULL,NULL,''),(29,7,1,1,1,'2026-08-15','Presente','18:40:02',NULL,NULL,NULL,NULL,''),(30,2,1,1,1,'2026-08-15','Presente','18:58:50',NULL,NULL,NULL,NULL,''),(31,1,1,1,1,'2026-08-15','Presente','18:40:06',NULL,NULL,NULL,NULL,'');
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias_alertas`
--

DROP TABLE IF EXISTS `asistencias_alertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias_alertas` (
  `id_alerta` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_clase` int NOT NULL,
  `tipo_alerta` enum('Ausencia_Consecutiva','Bajo_Porcentaje','Justificacion_Pendiente') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `fecha_alerta` date NOT NULL,
  `estado` enum('Pendiente','Enviada','Resuelta') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Pendiente',
  PRIMARY KEY (`id_alerta`),
  KEY `idx_alerta_estudiante` (`id_estudiante`),
  KEY `idx_alerta_clase` (`id_clase`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias_alertas`
--

LOCK TABLES `asistencias_alertas` WRITE;
/*!40000 ALTER TABLE `asistencias_alertas` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencias_alertas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias_configuracion`
--

DROP TABLE IF EXISTS `asistencias_configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias_configuracion` (
  `id_config` int NOT NULL AUTO_INCREMENT,
  `anio_lectivo` year NOT NULL,
  `porcentaje_minimo` decimal(5,2) NOT NULL DEFAULT '80.00',
  `tolerancia_retardo_minutos` int NOT NULL DEFAULT '10',
  `justificacion_dias_limite` int NOT NULL DEFAULT '3',
  PRIMARY KEY (`id_config`),
  UNIQUE KEY `uk_config_anio` (`anio_lectivo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias_configuracion`
--

LOCK TABLES `asistencias_configuracion` WRITE;
/*!40000 ALTER TABLE `asistencias_configuracion` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencias_configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias_justificaciones`
--

DROP TABLE IF EXISTS `asistencias_justificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias_justificaciones` (
  `id_justificacion` int NOT NULL AUTO_INCREMENT,
  `id_asistencia` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `tipo_justificacion` enum('Medica','Familiar','Personal','Institucional','Otra') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `documento_adjunto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `solicitado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `aprobado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `estado` enum('Pendiente','Aprobado','Rechazado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Pendiente',
  `fecha_solicitud` date NOT NULL,
  `fecha_aprobacion` date DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  PRIMARY KEY (`id_justificacion`),
  KEY `idx_justificacion_asistencia` (`id_asistencia`),
  KEY `idx_justificacion_estudiante` (`id_estudiante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias_justificaciones`
--

LOCK TABLES `asistencias_justificaciones` WRITE;
/*!40000 ALTER TABLE `asistencias_justificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencias_justificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias_resumen`
--

DROP TABLE IF EXISTS `asistencias_resumen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias_resumen` (
  `id_resumen` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `periodo` int NOT NULL,
  `total_dias` int NOT NULL DEFAULT '0',
  `presentes` int NOT NULL DEFAULT '0',
  `ausencias` int NOT NULL DEFAULT '0',
  `tardanzas` int NOT NULL DEFAULT '0',
  `justificadas` int NOT NULL DEFAULT '0',
  `porcentaje_asistencia` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id_resumen`),
  UNIQUE KEY `uk_resumen_estudiante_periodo` (`id_estudiante`,`id_clase`,`anio_lectivo`,`periodo`),
  KEY `idx_resumen_estudiante` (`id_estudiante`),
  KEY `idx_resumen_clase` (`id_clase`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias_resumen`
--

LOCK TABLES `asistencias_resumen` WRITE;
/*!40000 ALTER TABLE `asistencias_resumen` DISABLE KEYS */;
INSERT INTO `asistencias_resumen` VALUES (1,1,1,2026,1,10,7,1,2,1,90.00),(2,2,1,2026,1,6,4,1,1,0,83.33),(3,3,3,2026,1,6,5,0,1,0,91.66),(4,6,4,2026,1,5,4,1,0,0,80.00);
/*!40000 ALTER TABLE `asistencias_resumen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aspirantes`
--

DROP TABLE IF EXISTS `aspirantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aspirantes` (
  `id_aspirante` int NOT NULL AUTO_INCREMENT,
  `numero_expediente` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `apellidos` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `dui` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `pasaporte` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nacionalidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Salvadoreña',
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('Masculino','Femenino','Otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `tipo_sangre` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `enfermedades_cronicas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `alergias` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `medicamentos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `discapacidad` tinyint(1) DEFAULT '0',
  `tipo_discapacidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `telefono` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_fijo` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_emergencia` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nombre_contacto_emergencia` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `parentesco_emergencia` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `correo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `escuela_procedencia` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `anio_estudio` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `promedio_anterior` decimal(5,2) DEFAULT NULL,
  `conducta_puntaje` decimal(5,2) DEFAULT NULL COMMENT 'Puntaje de conducta de escuela anterior (0-10)',
  `nota_examen` decimal(5,2) DEFAULT NULL,
  `puntaje_seleccion` decimal(5,2) DEFAULT NULL,
  `exonerado` tinyint(1) DEFAULT '0' COMMENT '1=exonerado de examen',
  `tipo_exoneracion` enum('conducta','notas','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `documento_exoneracion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `puesto_aspirante` int DEFAULT NULL,
  `nivel_aspira` enum('Bachillerato General','Bachillerato Tecnico') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `especialidad_aspira` int DEFAULT NULL,
  `nombre_padre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `dui_padre` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_padre` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `ocupacion_padre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nombre_madre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `dui_madre` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_madre` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `ocupacion_madre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nombre_encargado` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `dui_encargado` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_encargado` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `parentesco_encargado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `num_hermanos` int DEFAULT '0',
  `estado_solicitud` enum('Pendiente','Aprobado','Rechazado','En Espera','Preseleccionado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'Pendiente',
  `fecha_solicitud` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `fecha_entrevista` date DEFAULT NULL,
  `entrevistado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `observaciones_entrevista` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `fecha_aprobacion` date DEFAULT NULL,
  `aprobado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `documentos_presentados` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `id_estudiante_generado` int DEFAULT NULL,
  `id_inscripcion_generada` int DEFAULT NULL,
  `nie` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `carnet_menoridad` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL COMMENT 'Carnet de Menoridad',
  `nota_primer_periodo_escuela` decimal(5,2) DEFAULT NULL,
  `nota_segundo_periodo_escuela` decimal(5,2) DEFAULT NULL,
  `promedio_final_escuela` decimal(5,2) DEFAULT NULL,
  `archivo_notas_escuela` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL COMMENT 'Ruta del PDF de notas de escuela anterior',
  `conducta_escuela` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL COMMENT 'Excelente, Muy Bueno, Bueno, Suficiente',
  `foto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `documento_pdf` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `documentos_observacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  PRIMARY KEY (`id_aspirante`),
  KEY `idx_aspirantes_estado` (`estado_solicitud`),
  KEY `idx_aspirantes_fecha` (`fecha_solicitud`),
  KEY `idx_aspirantes_dui` (`dui`),
  KEY `idx_aspirantes_especialidad_aspira` (`especialidad_aspira`),
  KEY `id_estudiante_generado` (`id_estudiante_generado`),
  KEY `id_inscripcion_generada` (`id_inscripcion_generada`),
  KEY `nie` (`nie`),
  KEY `carnet_menoridad` (`carnet_menoridad`),
  KEY `idx_nota_examen` (`nota_examen` DESC),
  CONSTRAINT `fk_aspirante_estudiante` FOREIGN KEY (`id_estudiante_generado`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_aspirante_inscripcion` FOREIGN KEY (`id_inscripcion_generada`) REFERENCES `inscripciones` (`id_inscripciones`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_aspirantes_especialidad` FOREIGN KEY (`especialidad_aspira`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aspirantes`
--

LOCK TABLES `aspirantes` WRITE;
/*!40000 ALTER TABLE `aspirantes` DISABLE KEYS */;
INSERT INTO `aspirantes` VALUES (1,NULL,'Miguel Angel','Rivas Salaverria','02000001-1',NULL,'Salvadoreña','2010-03-14','Masculino','O+',NULL,NULL,NULL,0,NULL,'Colonia San Luis, Apopa','7788-1001',NULL,NULL,NULL,NULL,'miguel.rivas@correo.com','Centro Escolar San Luis','9° Grado',8.20,9.00,9.00,NULL,0,NULL,NULL,NULL,'Bachillerato General',NULL,'Carlos Rivas',NULL,'7788-2001',NULL,'Sandra Salaverria',NULL,'7788-3001',NULL,NULL,NULL,NULL,NULL,2,'Aprobado','2026-01-20 15:00:00','Aspirante con buen promedio','2026-08-14','Direccion','ok\n',NULL,NULL,'Partida de Nacimiento, Notas',NULL,NULL,'NIE-EXP-001',NULL,7.50,8.00,8.20,NULL,'Muy Bueno',NULL,NULL,NULL),(2,NULL,'Karen Noemi','Ayala Martinez','02000002-2',NULL,'Salvadoreña','2010-07-22','Femenino','A+',NULL,NULL,NULL,0,NULL,'Residencial Los Angeles, Apopa','7788-1002',NULL,NULL,NULL,NULL,'karen.ayala@correo.com','CE La Floresta','9° Grado',8.90,9.50,10.00,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',2,'Jose Ayala',NULL,'7788-2002',NULL,'Marta Martinez',NULL,'7788-3002',NULL,NULL,NULL,NULL,NULL,1,'Aprobado','2026-01-21 16:00:00',NULL,NULL,NULL,NULL,'2026-08-14','Direccion','Partida de Nacimiento, Notas, Carnet',26,NULL,'NIE-EXP-002',NULL,8.50,9.00,8.90,NULL,'Excelente',NULL,NULL,NULL),(3,NULL,'Luis Eduardo','Mejia Benavides','02000003-3',NULL,'Salvadoreña','2010-01-30','Masculino','B+',NULL,NULL,NULL,0,NULL,'Canton El Rosario, Apopa','7788-1003',NULL,NULL,NULL,NULL,'luis.mejia@correo.com','CE El Rosario','9° Grado',7.80,8.00,10.00,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',2,'Rene Mejia',NULL,'7788-2003',NULL,'Adriana Benavides',NULL,'7788-3003',NULL,NULL,NULL,NULL,NULL,3,'Aprobado','2026-01-22 17:00:00',NULL,NULL,NULL,NULL,'2026-08-14','Direccion','Partida de Nacimiento, Notas',25,NULL,'NIE-EXP-003',NULL,7.00,7.50,7.80,NULL,'Bueno',NULL,NULL,NULL),(4,NULL,'Carlos Javier','Guevara Ponce','02000004-4',NULL,'Salvadoreña','2010-05-11','Masculino','O-',NULL,NULL,NULL,0,NULL,'Colonia La Campanera, Apopa','7788-1004',NULL,NULL,NULL,NULL,'carlos.guevara@correo.com','CE La Campanera','9° Grado',8.10,8.50,NULL,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',1,'Hector Guevara',NULL,'7788-2004',NULL,'Rosa Ponce',NULL,'7788-3004',NULL,NULL,NULL,NULL,NULL,0,'Preseleccionado','2026-01-22 20:00:00','Preseleccionado por nota de examen',NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas',NULL,NULL,'NIE-EXP-004',NULL,7.80,8.20,8.10,NULL,'Muy Bueno',NULL,NULL,NULL),(5,NULL,'Ana Gabriela','Menjivar Castro','02000005-5',NULL,'Salvadoreña','2010-09-18','Femenino','A-',NULL,NULL,NULL,0,NULL,'Canton El Zapote, Apopa','7788-1005',NULL,NULL,NULL,NULL,'ana.menjivar@correo.com','CE El Zapote','9° Grado',8.00,9.00,NULL,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',3,'Walter Menjivar',NULL,'7788-2005',NULL,'Leticia Castro',NULL,'7788-3005',NULL,NULL,NULL,NULL,NULL,1,'Preseleccionado','2026-01-23 15:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas, Carnet',NULL,NULL,'NIE-EXP-005',NULL,7.90,8.10,8.00,NULL,'Muy Bueno',NULL,NULL,NULL),(6,NULL,'Rodrigo Alexander','Ayala Serrano','02000006-6',NULL,'Salvadoreña','2010-11-05','Masculino','B-',NULL,NULL,NULL,0,NULL,'Colonia Las Dalias, Apopa','7788-1006',NULL,NULL,NULL,NULL,'rodrigo.ayala@correo.com','CE Las Dalias','9° Grado',7.00,7.50,NULL,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',2,'Marcos Ayala',NULL,'7788-2006',NULL,'Julia Serrano',NULL,'7788-3006',NULL,NULL,NULL,NULL,NULL,2,'Preseleccionado','2026-01-23 16:30:00','Necesita reforzar notas',NULL,NULL,NULL,NULL,NULL,'Notas',NULL,NULL,'NIE-EXP-006',NULL,6.80,7.20,7.00,NULL,'Bueno',NULL,NULL,NULL),(7,NULL,'Paola Michelle','Flores Ramirez','02000007-7',NULL,'Salvadoreña','2010-04-26','Femenino','AB+',NULL,NULL,NULL,0,NULL,'Residencial Las Colinas, Apopa','7788-1007',NULL,NULL,NULL,NULL,'paola.flores@correo.com','CE Las Colinas','9° Grado',8.70,9.50,NULL,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',1,'Roberto Flores',NULL,'7788-2007',NULL,'Claudia Ramirez',NULL,'7788-3007',NULL,NULL,NULL,NULL,NULL,0,'Preseleccionado','2026-01-24 15:30:00','Excelente expediente',NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas',NULL,NULL,'NIE-EXP-007',NULL,8.40,8.80,8.70,NULL,'Excelente',NULL,NULL,NULL),(8,NULL,'Jose Roberto','Parada Linares','02000008-8',NULL,'Salvadoreña','2010-08-03','Masculino','O+',NULL,NULL,NULL,0,NULL,'Colonia San Miguel, Apopa','7788-1008',NULL,NULL,NULL,NULL,'jose.parada@correo.com','CE San Miguel','9° Grado',8.50,9.00,NULL,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',1,'Juan Parada',NULL,'7788-2008',NULL,'Carmen Linares',NULL,'7788-3008',NULL,NULL,NULL,NULL,NULL,1,'Aprobado','2026-01-15 14:00:00','Aprobado con exito','2026-01-28','Direccion INA','Buen desempeño en entrevista','2026-02-02','Direccion INA','Partida de Nacimiento, Notas, Carnet, DUI Padre',NULL,NULL,'NIE-EXP-008',NULL,8.00,8.60,8.50,NULL,'Excelente',NULL,NULL,NULL),(9,NULL,'Sandra Yolanda','Quintanilla Vega','02000009-9',NULL,'Salvadoreña','2010-02-14','Femenino','A+',NULL,NULL,NULL,0,NULL,'Colonia La Solidaridad, Apopa','7788-1009',NULL,NULL,NULL,NULL,'sandra.quintanilla@correo.com','CE La Solidaridad','9° Grado',8.30,8.50,NULL,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',1,'Ramon Quintanilla',NULL,'7788-2009',NULL,'Vilma Vega',NULL,'7788-3009',NULL,NULL,NULL,NULL,NULL,2,'Aprobado','2026-01-16 16:00:00',NULL,'2026-01-29','Direccion INA','Expediente completo','2026-02-03','Direccion INA','Partida de Nacimiento, Notas',NULL,NULL,'NIE-EXP-009',NULL,8.10,8.40,8.30,NULL,'Muy Bueno',NULL,NULL,NULL),(10,NULL,'Walter Ernesto','Pineda Amaya','02000010-0',NULL,'Salvadoreña','2010-06-09','Masculino','B-',NULL,NULL,NULL,0,NULL,'Canton Joya Grande, Apopa','7788-1010',NULL,NULL,NULL,NULL,'walter.pineda@correo.com','CE Joya Grande','9° Grado',5.60,6.00,NULL,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',2,'Salvador Pineda',NULL,'7788-2010',NULL,'Dina Amaya',NULL,'7788-3010',NULL,NULL,NULL,NULL,NULL,3,'Rechazado','2026-01-19 15:00:00','Promedio por debajo del minimo',NULL,NULL,NULL,'2026-02-04','Comision INA','Notas',NULL,NULL,'NIE-EXP-010',NULL,5.20,5.80,5.60,NULL,'Suficiente',NULL,NULL,NULL),(11,NULL,'Claudia Marina','Ochoa Tamayo','02000011-1',NULL,'Salvadoreña','2010-10-27','Femenino','O+',NULL,NULL,NULL,0,NULL,'Residencial Las Perlas, Apopa','7788-1011',NULL,NULL,NULL,NULL,'claudia.ochoa@correo.com','CE Las Perlas','9° Grado',5.90,6.50,NULL,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',3,'Nelson Ochoa',NULL,'7788-2011',NULL,'Beatriz Tamayo',NULL,'7788-3011',NULL,NULL,NULL,NULL,NULL,1,'Rechazado','2026-01-20 19:00:00','Documentacion incompleta',NULL,NULL,NULL,'2026-02-04','Comision INA','Notas',NULL,NULL,'NIE-EXP-011',NULL,5.70,6.00,5.90,NULL,'Suficiente',NULL,NULL,NULL),(12,NULL,'Alejandro Rafael','Vasquez Portillo','02000012-2',NULL,'Salvadoreña','2010-03-03','Masculino','A-',NULL,NULL,NULL,0,NULL,'Colonia El Milagro, Apopa','7788-1012',NULL,NULL,NULL,NULL,'alejandro.vasquez@correo.com','CE El Milagro','9° Grado',7.60,8.00,NULL,NULL,0,NULL,NULL,NULL,'Bachillerato Tecnico',3,'Julio Vasquez',NULL,'7788-2012',NULL,'Sonia Portillo',NULL,'7788-3012',NULL,NULL,NULL,NULL,NULL,2,'En Espera','2026-01-21 21:00:00','En lista de espera por cupo',NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas',NULL,NULL,'NIE-EXP-012',NULL,7.20,7.70,7.60,NULL,'Bueno',NULL,NULL,NULL);
/*!40000 ALTER TABLE `aspirantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `aspirantes_aprobados`
--

DROP TABLE IF EXISTS `aspirantes_aprobados`;
/*!50001 DROP VIEW IF EXISTS `aspirantes_aprobados`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `aspirantes_aprobados` AS SELECT 
 1 AS `id_aspirante`,
 1 AS `nombres`,
 1 AS `apellidos`,
 1 AS `identificacion`,
 1 AS `nie`,
 1 AS `carnet_menoridad`,
 1 AS `fecha_aprobacion`,
 1 AS `aprobado_por`,
 1 AS `id_estudiante`,
 1 AS `codigo_estudiante`,
 1 AS `estudiante_nie`,
 1 AS `estudiante_carnet`,
 1 AS `id_inscripciones`,
 1 AS `numero_expediente`,
 1 AS `numero_carnet`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `aspirantes_espera`
--

DROP TABLE IF EXISTS `aspirantes_espera`;
/*!50001 DROP VIEW IF EXISTS `aspirantes_espera`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `aspirantes_espera` AS SELECT 
 1 AS `id_aspirante`,
 1 AS `nombres`,
 1 AS `apellidos`,
 1 AS `identificacion`,
 1 AS `fecha_entrevista`,
 1 AS `entrevistado_por`,
 1 AS `observaciones`,
 1 AS `fecha_solicitud`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `aspirantes_pendientes`
--

DROP TABLE IF EXISTS `aspirantes_pendientes`;
/*!50001 DROP VIEW IF EXISTS `aspirantes_pendientes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `aspirantes_pendientes` AS SELECT 
 1 AS `id_aspirante`,
 1 AS `numero_expediente`,
 1 AS `nombres`,
 1 AS `apellidos`,
 1 AS `identificacion`,
 1 AS `nie`,
 1 AS `carnet_menoridad`,
 1 AS `correo`,
 1 AS `telefono`,
 1 AS `escuela_procedencia`,
 1 AS `promedio_anterior`,
 1 AS `nivel_aspira`,
 1 AS `especialidad_aspira`,
 1 AS `fecha_solicitud`,
 1 AS `documentos_presentados`,
 1 AS `dias_espera`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `aspirantes_rechazados`
--

DROP TABLE IF EXISTS `aspirantes_rechazados`;
/*!50001 DROP VIEW IF EXISTS `aspirantes_rechazados`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `aspirantes_rechazados` AS SELECT 
 1 AS `id_aspirante`,
 1 AS `nombres`,
 1 AS `apellidos`,
 1 AS `identificacion`,
 1 AS `fecha_rechazo`,
 1 AS `rechazado_por`,
 1 AS `motivo_rechazo`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `accion` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `detalle` text COLLATE utf8mb4_spanish_ci,
  `ip` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_auditoria_usuario` (`usuario`),
  KEY `idx_auditoria_fecha` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
INSERT INTO `auditoria` VALUES (1,'DIR001','Login','Inicio de sesion exitoso desde IP: ::1','::1','2026-08-14 18:33:38','2026-08-15 00:33:38'),(2,'Direccion','Actualizar','Nota de examen registrada para aspirante Luis Eduardo Mejia Benavides: 10','::1','2026-08-14 18:34:10','2026-08-15 00:34:10'),(3,'Direccion','Aprobar','Aspirante Luis Eduardo Mejia Benavides aprobado y registrado como estudiante (ID: 25)','::1','2026-08-14 18:35:34','2026-08-15 00:35:34'),(4,'Direccion','Actualizar','Nota de examen registrada para aspirante Karen Noemi Ayala Martinez: 10','::1','2026-08-14 18:36:12','2026-08-15 00:36:12'),(5,'Direccion','Aprobar','Aspirante Karen Noemi Ayala Martinez aprobado y registrado como estudiante (ID: 26)','::1','2026-08-14 18:36:21','2026-08-15 00:36:21'),(6,'Direccion','Actualizar','Nota de examen registrada para aspirante Miguel Angel Rivas Salaverria: 9','::1','2026-08-14 18:36:26','2026-08-15 00:36:26'),(7,'Direccion','Actualizar','Aspirante Miguel Angel Rivas Salaverria puesto en lista de espera','::1','2026-08-14 18:36:34','2026-08-15 00:36:34'),(8,'DOC001','Login','Inicio de sesion exitoso desde IP: ::1','::1','2026-08-14 18:55:52','2026-08-15 00:55:52'),(9,'REG001','Login','Inicio de sesion exitoso desde IP: ::1','::1','2026-08-14 19:09:00','2026-08-15 01:09:00');
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria_notas`
--

DROP TABLE IF EXISTS `auditoria_notas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria_notas` (
  `id_audit_nota` int NOT NULL AUTO_INCREMENT,
  `id_calificacion` int NOT NULL COMMENT 'ID de la calificación afectada',
  `id_estudiante` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_docente` int NOT NULL COMMENT 'Docente que hizo el cambio',
  `nota_anterior` decimal(5,2) DEFAULT NULL,
  `nota_nueva` decimal(5,2) DEFAULT NULL,
  `motivo_cambio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci COMMENT 'Razón del cambio (ej. error de captura, recuperación)',
  `fecha_cambio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_audit_nota`),
  KEY `id_calificacion` (`id_calificacion`),
  KEY `id_materia` (`id_materia`),
  KEY `idx_audit_notas_estudiante` (`id_estudiante`),
  KEY `idx_audit_notas_docente_fecha` (`id_docente`,`fecha_cambio`),
  CONSTRAINT `fk_auditnotas_docente` FOREIGN KEY (`id_docente`) REFERENCES `docentes` (`id_docente`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_notas`
--

LOCK TABLES `auditoria_notas` WRITE;
/*!40000 ALTER TABLE `auditoria_notas` DISABLE KEYS */;
INSERT INTO `auditoria_notas` VALUES (1,1,1,1,1,NULL,8.50,'Creación inicial de calificación','2026-08-15 00:30:23'),(2,2,2,1,1,NULL,7.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(3,3,7,1,1,NULL,9.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(4,4,8,1,1,NULL,7.50,'Creación inicial de calificación','2026-08-15 00:30:23'),(5,5,1,1,1,NULL,8.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(6,6,2,1,1,NULL,6.50,'Creación inicial de calificación','2026-08-15 00:30:23'),(7,7,7,1,1,NULL,8.50,'Creación inicial de calificación','2026-08-15 00:30:23'),(8,8,8,1,1,NULL,6.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(9,9,1,1,1,NULL,9.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(10,10,2,1,1,NULL,7.50,'Creación inicial de calificación','2026-08-15 00:30:23'),(11,11,7,1,1,NULL,9.50,'Creación inicial de calificación','2026-08-15 00:30:23'),(12,12,8,1,1,NULL,7.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(13,13,1,1,1,NULL,8.80,'Creación inicial de calificación','2026-08-15 00:30:23'),(14,14,2,1,1,NULL,7.80,'Creación inicial de calificación','2026-08-15 00:30:23'),(15,15,7,1,1,NULL,9.20,'Creación inicial de calificación','2026-08-15 00:30:23'),(16,16,8,1,1,NULL,7.20,'Creación inicial de calificación','2026-08-15 00:30:23'),(17,17,1,2,1,NULL,8.60,'Creación inicial de calificación','2026-08-15 00:30:23'),(18,18,2,2,1,NULL,7.40,'Creación inicial de calificación','2026-08-15 00:30:23'),(19,19,7,2,1,NULL,8.90,'Creación inicial de calificación','2026-08-15 00:30:23'),(20,20,8,2,1,NULL,7.10,'Creación inicial de calificación','2026-08-15 00:30:23'),(21,21,1,3,2,NULL,7.80,'Creación inicial de calificación','2026-08-15 00:30:23'),(22,22,2,3,2,NULL,7.20,'Creación inicial de calificación','2026-08-15 00:30:23'),(23,23,7,3,2,NULL,8.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(24,24,8,3,2,NULL,6.80,'Creación inicial de calificación','2026-08-15 00:30:23'),(25,25,1,4,2,NULL,8.90,'Creación inicial de calificación','2026-08-15 00:30:23'),(26,26,2,4,2,NULL,7.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(27,27,7,4,2,NULL,9.20,'Creación inicial de calificación','2026-08-15 00:30:23'),(28,28,8,4,2,NULL,7.40,'Creación inicial de calificación','2026-08-15 00:30:23'),(29,29,9,5,3,NULL,8.50,'Creación inicial de calificación','2026-08-15 00:30:23'),(30,30,10,5,3,NULL,7.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(31,31,1,6,3,NULL,8.40,'Creación inicial de calificación','2026-08-15 00:30:23'),(32,32,7,6,3,NULL,8.80,'Creación inicial de calificación','2026-08-15 00:30:23'),(33,33,3,7,4,NULL,8.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(34,34,11,7,4,NULL,7.50,'Creación inicial de calificación','2026-08-15 00:30:23'),(35,35,12,7,4,NULL,9.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(36,36,3,7,4,NULL,7.50,'Creación inicial de calificación','2026-08-15 00:30:23'),(37,37,11,7,4,NULL,6.80,'Creación inicial de calificación','2026-08-15 00:30:23'),(38,38,12,7,4,NULL,8.70,'Creación inicial de calificación','2026-08-15 00:30:23'),(39,39,3,8,4,NULL,8.20,'Creación inicial de calificación','2026-08-15 00:30:23'),(40,40,11,8,4,NULL,7.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(41,41,12,8,4,NULL,9.30,'Creación inicial de calificación','2026-08-15 00:30:23'),(42,42,13,7,4,NULL,8.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(43,43,14,7,4,NULL,7.40,'Creación inicial de calificación','2026-08-15 00:30:23'),(44,44,6,7,4,NULL,8.60,'Creación inicial de calificación','2026-08-15 00:30:23'),(45,45,13,8,4,NULL,8.30,'Creación inicial de calificación','2026-08-15 00:30:23'),(46,46,14,8,4,NULL,7.10,'Creación inicial de calificación','2026-08-15 00:30:23'),(47,47,6,8,4,NULL,8.10,'Creación inicial de calificación','2026-08-15 00:30:23'),(48,48,4,10,5,NULL,7.60,'Creación inicial de calificación','2026-08-15 00:30:23'),(49,49,17,10,5,NULL,8.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(50,50,18,10,5,NULL,6.90,'Creación inicial de calificación','2026-08-15 00:30:23'),(51,51,4,11,5,NULL,8.00,'Creación inicial de calificación','2026-08-15 00:30:23'),(52,52,17,11,5,NULL,8.30,'Creación inicial de calificación','2026-08-15 00:30:23'),(53,53,18,11,5,NULL,7.20,'Creación inicial de calificación','2026-08-15 00:30:23'),(54,54,5,12,6,NULL,8.30,'Creación inicial de calificación','2026-08-15 00:30:23'),(55,55,19,12,6,NULL,7.90,'Creación inicial de calificación','2026-08-15 00:30:23'),(56,56,20,12,6,NULL,8.10,'Creación inicial de calificación','2026-08-15 00:30:23'),(57,57,5,13,6,NULL,8.10,'Creación inicial de calificación','2026-08-15 00:30:23'),(58,58,19,13,6,NULL,8.40,'Creación inicial de calificación','2026-08-15 00:30:23'),(59,59,20,13,6,NULL,7.80,'Creación inicial de calificación','2026-08-15 00:30:23');
/*!40000 ALTER TABLE `auditoria_notas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria_recuperaciones`
--

DROP TABLE IF EXISTS `auditoria_recuperaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria_recuperaciones` (
  `id_audit_recuperacion` int NOT NULL AUTO_INCREMENT,
  `id_recuperacion` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `id_materia` int NOT NULL,
  `accion` enum('CREAR','MODIFICAR_NOTA','ELIMINAR') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `nota_anterior` decimal(5,2) DEFAULT NULL,
  `nota_nueva` decimal(5,2) DEFAULT NULL,
  `registrado_por` int NOT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_audit_recuperacion`),
  KEY `id_recuperacion` (`id_recuperacion`),
  KEY `id_materia` (`id_materia`),
  KEY `idx_audit_rec_estudiante` (`id_estudiante`),
  KEY `idx_audit_rec_fecha` (`fecha`),
  KEY `fk_auditrecup_docente` (`registrado_por`),
  CONSTRAINT `fk_auditrecup_docente` FOREIGN KEY (`registrado_por`) REFERENCES `docentes` (`id_docente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_recuperaciones`
--

LOCK TABLES `auditoria_recuperaciones` WRITE;
/*!40000 ALTER TABLE `auditoria_recuperaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria_recuperaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aulas`
--

DROP TABLE IF EXISTS `aulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aulas` (
  `id_aula` int NOT NULL,
  `id_edificio` int NOT NULL,
  `numero_aula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `nivel_edificio` int DEFAULT '1',
  `capacidad` int NOT NULL DEFAULT '30',
  `tipo_aula` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Aula regular',
  `turno` enum('Matutino','Vespertino','Ambos') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Ambos',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_aula`),
  KEY `idx_aulas_id_edificio` (`id_edificio`),
  CONSTRAINT `fk_aulas_edificio` FOREIGN KEY (`id_edificio`) REFERENCES `edificios` (`id_edificio`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas`
--

LOCK TABLES `aulas` WRITE;
/*!40000 ALTER TABLE `aulas` DISABLE KEYS */;
INSERT INTO `aulas` VALUES (1,1,'A-01',1,30,'Aula regular','Matutino',1),(2,1,'A-02',1,30,'Aula regular','Matutino',1),(3,1,'A-03',2,35,'Aula regular','Matutino',1),(4,2,'B-01',1,30,'Aula regular','Matutino',1),(5,2,'LAB-01',1,25,'Laboratorio de Informatica','Matutino',1),(6,2,'LAB-02',1,25,'Laboratorio de Contabilidad','Matutino',1);
/*!40000 ALTER TABLE `aulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avisos`
--

DROP TABLE IF EXISTS `avisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos` (
  `id_aviso` int NOT NULL,
  `titulo_aviso` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `detalle_aviso` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `archivo_adjunto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha_publicacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_admin` int DEFAULT NULL,
  `modificado_por` int DEFAULT NULL,
  PRIMARY KEY (`id_aviso`),
  KEY `id_admin` (`id_admin`),
  KEY `modificado_por` (`modificado_por`),
  CONSTRAINT `fk_avisos_admin` FOREIGN KEY (`id_admin`) REFERENCES `administradores` (`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_avisos_modificado_admin` FOREIGN KEY (`modificado_por`) REFERENCES `administradores` (`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avisos`
--

LOCK TABLES `avisos` WRITE;
/*!40000 ALTER TABLE `avisos` DISABLE KEYS */;
INSERT INTO `avisos` VALUES (1,'Inicio de Clases 2026','Bienvenida a toda la comunidad educativa del Instituto Nacional de Apopa. Las clases inician el 15 de enero de 2026 en horario de 7:00 a 12:00.',NULL,'2026-01-15 13:00:00',1,NULL),(2,'Semana de Examenes - I Periodo','Los examenes del I periodo se realizaran del 2 al 6 de febrero. Estudiantes deben presentarse puntualmente con su carnet.',NULL,'2026-01-28 15:00:00',1,NULL),(3,'Feriado de Semana Santa','Recordamos que del 29 de marzo al 4 de abril no habra clases por la celebracion de Semana Santa.',NULL,'2026-03-20 14:30:00',1,NULL),(4,'Entrega de Notas I Periodo','Las notas del I periodo seran publicadas en el portal del estudiante a partir del 16 de marzo.',NULL,'2026-03-10 16:00:00',1,NULL);
/*!40000 ALTER TABLE `avisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avisos_internos`
--

DROP TABLE IF EXISTS `avisos_internos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos_internos` (
  `id_aviso` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `contenido` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `prioridad` enum('baja','media','alta') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'media',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `creado_por` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_aviso`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avisos_internos`
--

LOCK TABLES `avisos_internos` WRITE;
/*!40000 ALTER TABLE `avisos_internos` DISABLE KEYS */;
INSERT INTO `avisos_internos` VALUES (1,'h','prueba','alta',1,NULL,NULL,NULL,'2026-08-15 00:45:05',NULL);
/*!40000 ALTER TABLE `avisos_internos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_sistema`
--

DROP TABLE IF EXISTS `cache_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_sistema` (
  `id_cache` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `valor` text COLLATE utf8mb4_spanish_ci NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cache`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_sistema`
--

LOCK TABLES `cache_sistema` WRITE;
/*!40000 ALTER TABLE `cache_sistema` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calificaciones_actividades`
--

DROP TABLE IF EXISTS `calificaciones_actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calificaciones_actividades` (
  `id_calificacion` int NOT NULL AUTO_INCREMENT,
  `id_actividad` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `nota` decimal(5,2) NOT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `registrado_por` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_calificacion`),
  UNIQUE KEY `uk_actividad_estudiante` (`id_actividad`,`id_estudiante`),
  KEY `registrado_por` (`registrado_por`),
  KEY `idx_calif_estudiante` (`id_estudiante`),
  CONSTRAINT `fk_calif_actividad` FOREIGN KEY (`id_actividad`) REFERENCES `actividades` (`id_actividad`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_calif_actividades_docente` FOREIGN KEY (`registrado_por`) REFERENCES `docentes` (`id_docente`),
  CONSTRAINT `fk_calif_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calificaciones_actividades`
--

LOCK TABLES `calificaciones_actividades` WRITE;
/*!40000 ALTER TABLE `calificaciones_actividades` DISABLE KEYS */;
INSERT INTO `calificaciones_actividades` VALUES (1,1,1,8.50,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(2,1,2,7.00,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(3,1,7,9.00,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(4,1,8,7.50,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(5,2,1,8.00,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(6,2,2,6.50,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(7,2,7,8.50,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(8,2,8,6.00,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(9,3,1,9.00,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(10,3,2,7.50,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(11,3,7,9.50,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(12,3,8,7.00,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(13,4,1,8.80,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(14,4,2,7.80,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(15,4,7,9.20,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(16,4,8,7.20,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(17,5,1,8.60,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(18,5,2,7.40,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(19,5,7,8.90,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(20,5,8,7.10,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(21,6,1,7.80,NULL,2,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(22,6,2,7.20,NULL,2,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(23,6,7,8.00,NULL,2,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(24,6,8,6.80,NULL,2,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(25,7,1,8.90,NULL,2,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(26,7,2,7.00,NULL,2,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(27,7,7,9.20,NULL,2,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(28,7,8,7.40,NULL,2,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(29,8,9,8.50,NULL,3,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(30,8,10,7.00,NULL,3,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(31,9,1,8.40,NULL,3,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(32,9,7,8.80,NULL,3,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(33,10,3,8.00,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(34,10,11,7.50,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(35,10,12,9.00,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(36,11,3,7.50,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(37,11,11,6.80,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(38,11,12,8.70,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(39,12,3,8.20,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(40,12,11,7.00,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(41,12,12,9.30,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(42,13,13,8.00,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(43,13,14,7.40,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(44,13,6,8.60,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(45,14,13,8.30,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(46,14,14,7.10,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(47,14,6,8.10,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(48,15,4,7.60,NULL,5,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(49,15,17,8.00,NULL,5,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(50,15,18,6.90,NULL,5,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(51,16,4,8.00,NULL,5,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(52,16,17,8.30,NULL,5,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(53,16,18,7.20,NULL,5,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(54,17,5,8.30,NULL,6,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(55,17,19,7.90,NULL,6,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(56,17,20,8.10,NULL,6,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(57,18,5,8.10,NULL,6,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(58,18,19,8.40,NULL,6,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(59,18,20,7.80,NULL,6,'2026-08-15 00:30:23','2026-08-15 00:30:23');
/*!40000 ALTER TABLE `calificaciones_actividades` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_audit_calificaciones_insert` AFTER INSERT ON `calificaciones_actividades` FOR EACH ROW BEGIN
    INSERT INTO auditoria_notas (id_calificacion, id_estudiante, id_materia, id_docente, nota_anterior, nota_nueva, motivo_cambio)
    VALUES (
        NEW.id_calificacion,
        NEW.id_estudiante,
        (SELECT id_materia FROM actividades WHERE id_actividad = NEW.id_actividad),
        (SELECT id_docente FROM actividades WHERE id_actividad = NEW.id_actividad),
        NULL,
        NEW.nota,
        'Creación inicial de calificación'
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_audit_calificaciones_update` AFTER UPDATE ON `calificaciones_actividades` FOR EACH ROW BEGIN
    IF OLD.nota != NEW.nota THEN
        INSERT INTO auditoria_notas (id_calificacion, id_estudiante, id_materia, id_docente, nota_anterior, nota_nueva, motivo_cambio)
        VALUES (
            NEW.id_calificacion,
            NEW.id_estudiante,
            (SELECT id_materia FROM actividades WHERE id_actividad = NEW.id_actividad),
            (SELECT id_docente FROM actividades WHERE id_actividad = NEW.id_actividad),
            OLD.nota,
            NEW.nota,
            'Modificación de calificación'
        );
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `clases`
--

DROP TABLE IF EXISTS `clases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clases` (
  `id_clase` int NOT NULL AUTO_INCREMENT,
  `id_nivel` int NOT NULL,
  `id_grado` int NOT NULL,
  `id_especialidad` int DEFAULT NULL,
  `id_seccion` int DEFAULT NULL,
  `nombre_clase` varchar(80) COLLATE utf8mb4_spanish_ci NOT NULL,
  `seccion` varchar(5) COLLATE utf8mb4_spanish_ci NOT NULL,
  `grupo` varchar(10) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `anio_lectivo_actual` year DEFAULT NULL,
  `promocion_automatica` tinyint(1) DEFAULT '1',
  `estado` tinyint(1) DEFAULT '1',
  `cupo_maximo` int DEFAULT '30',
  `cupo_actual` int DEFAULT '0',
  `anio_lectivo` year NOT NULL DEFAULT '2026',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_clase`),
  KEY `id_nivel` (`id_nivel`),
  KEY `id_especialidad` (`id_especialidad`),
  KEY `id_seccion` (`id_seccion`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clases`
--

LOCK TABLES `clases` WRITE;
/*!40000 ALTER TABLE `clases` DISABLE KEYS */;
INSERT INTO `clases` VALUES (1,1,1,NULL,1,'Primer Año - Bachillerato General - Seccion A','A','A',2026,1,1,30,4,2026,'2026-08-15 00:30:22'),(2,1,2,NULL,1,'Segundo Año - Bachillerato General - Seccion A','A','A',2026,1,1,30,2,2026,'2026-08-15 00:30:22'),(3,2,3,1,1,'Primer Año - Tecnico Vocacional en Desarrollo de Software - Seccion A','A','A',2026,1,1,30,3,2026,'2026-08-15 00:30:22'),(4,2,4,1,1,'Segundo Año - Tecnico Vocacional en Desarrollo de Software - Seccion A','A','A',2026,1,1,30,2,2026,'2026-08-15 00:30:22'),(5,2,5,1,1,'Tercer Año - Tecnico Vocacional en Desarrollo de Software - Seccion A','A','A',2026,1,1,30,3,2026,'2026-08-15 00:30:22'),(6,2,2,2,1,'Bachillerato Tecnico Vocacional - Tecnico Vocacional en Administrativo Contable ','A','A',2026,1,1,30,5,2026,'2026-08-15 00:30:22'),(7,3,6,3,1,'Primer Año - Tecnico Productivo en Salud y Bienestar - Seccion A','A','A',2026,1,1,30,3,2026,'2026-08-15 00:30:22'),(8,2,3,1,2,'Primer Año - Tecnico Vocacional en Desarrollo de Software - Seccion B','B','B',2026,1,1,30,2,2026,'2026-08-15 00:30:22');
/*!40000 ALTER TABLE `clases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `combinacion_materias`
--

DROP TABLE IF EXISTS `combinacion_materias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `combinacion_materias` (
  `id_combinacion` int NOT NULL,
  `id_clase` int NOT NULL,
  `id_materia` int NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_combinacion`),
  KEY `idx_combinacion_id_clase` (`id_clase`),
  KEY `idx_combinacion_id_materia` (`id_materia`),
  CONSTRAINT `fk_combinacion_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `combinacion_materias`
--

LOCK TABLES `combinacion_materias` WRITE;
/*!40000 ALTER TABLE `combinacion_materias` DISABLE KEYS */;
/*!40000 ALTER TABLE `combinacion_materias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conducta_periodos`
--

DROP TABLE IF EXISTS `conducta_periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conducta_periodos` (
  `id_conducta` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_periodo` int NOT NULL,
  `calificacion_conducta` enum('Excelente','Muy Bueno','Bueno','Suficiente','Necesita Mejorar') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `registrado_por` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_conducta`),
  UNIQUE KEY `uk_estudiante_periodo` (`id_estudiante`,`id_periodo`),
  KEY `idx_conducta_calificacion` (`calificacion_conducta`),
  KEY `conducta_periodos_ibfk_2` (`id_periodo`),
  KEY `conducta_periodos_ibfk_3` (`registrado_por`),
  CONSTRAINT `conducta_periodos_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE,
  CONSTRAINT `conducta_periodos_ibfk_2` FOREIGN KEY (`id_periodo`) REFERENCES `periodos_academicos` (`id_periodo`) ON DELETE CASCADE,
  CONSTRAINT `conducta_periodos_ibfk_3` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conducta_periodos`
--

LOCK TABLES `conducta_periodos` WRITE;
/*!40000 ALTER TABLE `conducta_periodos` DISABLE KEYS */;
INSERT INTO `conducta_periodos` VALUES (1,1,1,'Excelente','Excelente participacion en clase',4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(2,2,1,'Bueno','Requiere mejorar comportamiento en aula',4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(3,3,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(4,4,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(5,5,1,'Excelente',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(6,6,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(7,7,1,'Excelente',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(8,8,1,'Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(9,9,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(10,10,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(11,11,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(12,12,1,'Excelente',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(13,13,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(14,14,1,'Bueno','Amonestado por interrupciones',4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(15,15,1,'Excelente',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(16,16,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(17,17,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(18,18,1,'Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(19,19,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(20,20,1,'Muy Bueno',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(21,21,1,'Excelente',NULL,4,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(22,22,1,'Suficiente','Falta de atencion constante',4,'2026-08-15 00:30:23','2026-08-15 00:30:23');
/*!40000 ALTER TABLE `conducta_periodos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion` (
  `id_configuracion` int NOT NULL,
  `clave` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `valor` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `creado_por` int DEFAULT NULL,
  `modificado_por` int DEFAULT NULL,
  PRIMARY KEY (`id_configuracion`),
  KEY `creado_por` (`creado_por`),
  KEY `modificado_por` (`modificado_por`),
  CONSTRAINT `fk_config_creado_admin` FOREIGN KEY (`creado_por`) REFERENCES `administradores` (`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_config_modificado_admin` FOREIGN KEY (`modificado_por`) REFERENCES `administradores` (`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
INSERT INTO `configuracion` VALUES (1,'nombre_instituto','Instituto Nacional de Apopa','Nombre del instituto',NULL,NULL),(2,'logo','logo.png','Logo del sistema',NULL,NULL),(3,'anio_lectivo','2026','Año lectivo actual',NULL,NULL),(4,'nota_minima_basica','60','Nota minima aprobatoria para materias basicas (0-100)',NULL,NULL),(5,'nota_minima_especialidad','4','Nota minima aprobatoria para especialidad (1-5)',NULL,NULL),(6,'escala_basica_max','100','Escala maxima para materias basicas',NULL,NULL),(7,'escala_especialidad_max','5','Escala maxima para especialidad',NULL,NULL),(8,'periodos_anio','4','Numero de periodos por año lectivo',NULL,NULL),(9,'conducta_escala_max','10','Escala maxima para conducta',NULL,NULL),(10,'telefono_contacto','2288-9966','Telefono de contacto del instituto',NULL,NULL),(11,'correo_contacto','ina@mined.edu.sv','Correo de contacto del instituto',NULL,NULL),(12,'director','Lic. Juan Perez','Nombre del director',NULL,NULL),(13,'lema','Educacion con excelencia','Lema del instituto',NULL,NULL);
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `correos_programados`
--

DROP TABLE IF EXISTS `correos_programados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `correos_programados` (
  `id_correo` int NOT NULL AUTO_INCREMENT,
  `destinatario` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `asunto` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `mensaje` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `archivo_adjunto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha_programada` datetime NOT NULL,
  `enviado` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `correos_programados`
--

LOCK TABLES `correos_programados` WRITE;
/*!40000 ALTER TABLE `correos_programados` DISABLE KEYS */;
/*!40000 ALTER TABLE `correos_programados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupos_especialidades`
--

DROP TABLE IF EXISTS `cupos_especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupos_especialidades` (
  `id_cupo` int NOT NULL AUTO_INCREMENT,
  `id_especialidad` int NOT NULL,
  `seccion` varchar(5) COLLATE utf8mb4_spanish_ci NOT NULL,
  `cupos_totales` int NOT NULL DEFAULT '30',
  `cupos_ocupados` int NOT NULL DEFAULT '0',
  `anio_lectivo` year NOT NULL,
  PRIMARY KEY (`id_cupo`),
  UNIQUE KEY `uk_especialidad_seccion` (`id_especialidad`,`seccion`,`anio_lectivo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupos_especialidades`
--

LOCK TABLES `cupos_especialidades` WRITE;
/*!40000 ALTER TABLE `cupos_especialidades` DISABLE KEYS */;
INSERT INTO `cupos_especialidades` VALUES (1,1,'A',30,8,2026),(2,1,'B',30,2,2026),(3,2,'A',30,4,2026),(4,3,'A',30,3,2026);
/*!40000 ALTER TABLE `cupos_especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `docente_materias`
--

DROP TABLE IF EXISTS `docente_materias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `docente_materias` (
  `id_docente_materia` int NOT NULL AUTO_INCREMENT,
  `id_docente` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `puede_calificar` tinyint(1) DEFAULT '1',
  `puede_amonestar` tinyint(1) DEFAULT '1',
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_docente_materia`),
  UNIQUE KEY `uk_docente_materia_clase` (`id_docente`,`id_materia`,`id_clase`,`anio_lectivo`),
  UNIQUE KEY `uk_materia_clase_docente` (`id_materia`,`id_clase`,`anio_lectivo`),
  KEY `idx_docente_materias_id_docente` (`id_docente`),
  KEY `idx_docente_materias_id_materia` (`id_materia`),
  KEY `idx_docente_materias_id_clase` (`id_clase`),
  CONSTRAINT `fk_docente_materias_docente` FOREIGN KEY (`id_docente`) REFERENCES `docentes` (`id_docente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_docente_materias_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `docente_materias`
--

LOCK TABLES `docente_materias` WRITE;
/*!40000 ALTER TABLE `docente_materias` DISABLE KEYS */;
INSERT INTO `docente_materias` VALUES (1,1,1,1,2026,1,1,1),(2,1,1,2,2026,1,1,1),(3,1,2,1,2026,1,1,1),(4,2,2,2,2026,1,1,1),(5,2,3,1,2026,1,1,1),(6,2,3,2,2026,1,1,1),(7,2,4,1,2026,1,1,1),(8,2,4,2,2026,1,1,1),(9,3,5,1,2026,1,1,1),(10,3,5,2,2026,1,1,1),(11,3,5,3,2026,1,1,1),(12,3,5,6,2026,1,1,1),(13,3,5,8,2026,1,1,1),(14,3,6,1,2026,1,1,1),(15,3,6,3,2026,1,1,1),(16,3,6,6,2026,1,1,1),(17,4,7,3,2026,1,1,1),(18,4,7,4,2026,1,1,1),(19,4,7,5,2026,1,1,1),(20,4,7,8,2026,1,1,1),(21,4,8,3,2026,1,1,1),(22,4,8,4,2026,1,1,1),(23,4,8,5,2026,1,1,1),(24,4,8,8,2026,1,1,1),(25,5,10,6,2026,1,1,1),(26,5,11,6,2026,1,1,1),(27,6,12,7,2026,1,1,1),(28,6,13,7,2026,1,1,1),(29,3,10,1,2026,1,1,1);
/*!40000 ALTER TABLE `docente_materias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `docentes`
--

DROP TABLE IF EXISTS `docentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `docentes` (
  `id_docente` int NOT NULL AUTO_INCREMENT,
  `codigo_docente` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `nip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `apellidos` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `dui` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `pasaporte` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `correo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `especialidad_docente` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL COMMENT 'Ej: Matematicas, Ciencias, Programacion',
  `tipo_docente` enum('Basica','Especialidad') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Basica',
  `id_especialidad` int DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `tipo_contrato` enum('Planta','Hora Clase','Sobresueldo') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Planta',
  `sueldo_base` decimal(10,2) DEFAULT NULL,
  `valor_hora` decimal(10,2) DEFAULT NULL,
  `horas_asignadas` int DEFAULT NULL,
  `contrasena` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `situacion` enum('Activo','Licencia','Vacaciones','Incapacidad','Suspendido','Retirado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Activo',
  `id_rol` int DEFAULT NULL,
  PRIMARY KEY (`id_docente`),
  UNIQUE KEY `uk_docentes_codigo` (`codigo_docente`),
  UNIQUE KEY `uk_docentes_dui` (`dui`),
  KEY `idx_docentes_id_especialidad` (`id_especialidad`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `fk_docentes_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `docentes`
--

LOCK TABLES `docentes` WRITE;
/*!40000 ALTER TABLE `docentes` DISABLE KEYS */;
INSERT INTO `docentes` VALUES (1,'DOC001','DOC001','Maria Elena','Rodriguez Castro','01010101-1','0610-010101-101-1',NULL,'7711-0001','docente@ina.edu.sv','Colonia San Jose, Apopa','Matematica','Basica',NULL,'2019-01-15','Planta',900.00,12.50,20,NULL,1,'Activo',6),(2,'DOC002','DOC002','Carlos Alberto','Martinez Herrera','01020202-2','0610-010202-102-2',NULL,'7711-0002','carlos.martinez@ina.edu.sv','Residencial Las Flores, Apopa','Ciencias Naturales','Basica',NULL,'2019-02-01','Planta',850.00,12.00,20,NULL,1,'Activo',6),(3,'DOC003','DOC003','Rosa Elvira','Castillo Lopez','01030303-3','0610-010303-103-3',NULL,'7711-0003','rosa.castillo@ina.edu.sv','Colonia El Carmen, Apopa','Ingles','Basica',NULL,'2020-01-15','Planta',850.00,12.00,20,NULL,1,'Activo',6),(4,'DOC004','DOC004','Jose Manuel','Ramirez Flores','01040404-4','0610-010404-104-4',NULL,'7711-0004','jose.ramirez@ina.edu.sv','Colonia La Campanera, San Salvador','Desarrollo de Software','Especialidad',1,'2020-02-01','Planta',950.00,14.00,20,NULL,1,'Activo',6),(5,'DOC005','DOC005','Karla Ivette','Sanchez Guevara','01050505-5','0610-010505-105-5',NULL,'7711-0005','karla.sanchez@ina.edu.sv','Colonia Escalon, San Salvador','Contabilidad','Especialidad',2,'2021-01-15','Planta',950.00,14.00,20,NULL,1,'Activo',6),(6,'DOC006','DOC006','Fernando Enrique','Vasquez Rivas','01060606-6','0610-010606-106-6',NULL,'7711-0006','fernando.vasquez@ina.edu.sv','Canton Santa Lucia, Apopa','Salud y Bienestar','Especialidad',3,'2021-02-01','Planta',900.00,13.00,20,NULL,1,'Activo',6);
/*!40000 ALTER TABLE `docentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_personas`
--

DROP TABLE IF EXISTS `documentos_personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_personas` (
  `id_documento_persona` int NOT NULL AUTO_INCREMENT,
  `id_persona` int NOT NULL COMMENT 'Referencia a la persona (padre, madre, encargado, etc.)',
  `id_tipo_documento` int NOT NULL COMMENT 'Tipo de documento (referencia a tipodocumentos)',
  `numero_documento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL COMMENT 'Número de documento oficial',
  `archivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL COMMENT 'Ruta del archivo subido',
  `estado` tinyint DEFAULT '1' COMMENT '1=Activo, 0=Inactivo',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_documento_persona`),
  KEY `id_tipo_documento` (`id_tipo_documento`),
  KEY `idx_persona_documento` (`id_persona`,`id_tipo_documento`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `documentos_personas_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`) ON DELETE CASCADE,
  CONSTRAINT `documentos_personas_ibfk_2` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tipodocumentos` (`id_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_personas`
--

LOCK TABLES `documentos_personas` WRITE;
/*!40000 ALTER TABLE `documentos_personas` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_personas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentosadministrativos`
--

DROP TABLE IF EXISTS `documentosadministrativos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentosadministrativos` (
  `id_documento_admin` int NOT NULL AUTO_INCREMENT,
  `id_administrador` int DEFAULT NULL,
  `id_documento` int DEFAULT NULL,
  `NumeroDocumento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `Documento` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `Estado` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id_documento_admin`),
  KEY `idx_docadmin_administrador` (`id_administrador`),
  KEY `idx_docadmin_documento` (`id_documento`),
  CONSTRAINT `fk_docadmin_administrador` FOREIGN KEY (`id_administrador`) REFERENCES `administradores` (`id_admin`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_docadmin_documento` FOREIGN KEY (`id_documento`) REFERENCES `tipodocumentos` (`id_documento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentosadministrativos`
--

LOCK TABLES `documentosadministrativos` WRITE;
/*!40000 ALTER TABLE `documentosadministrativos` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentosadministrativos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentosdocentes`
--

DROP TABLE IF EXISTS `documentosdocentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentosdocentes` (
  `id_documento_docente` int NOT NULL AUTO_INCREMENT,
  `id_docente` int DEFAULT NULL,
  `id_documento` int DEFAULT NULL,
  `NumeroDocumento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `Documento` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `Estado` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id_documento_docente`),
  KEY `id_docente` (`id_docente`),
  KEY `id_documento` (`id_documento`),
  CONSTRAINT `fk_docdoc_docente` FOREIGN KEY (`id_docente`) REFERENCES `docentes` (`id_docente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_docdoc_documento` FOREIGN KEY (`id_documento`) REFERENCES `tipodocumentos` (`id_documento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentosdocentes`
--

LOCK TABLES `documentosdocentes` WRITE;
/*!40000 ALTER TABLE `documentosdocentes` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentosdocentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentosestudiantes`
--

DROP TABLE IF EXISTS `documentosestudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentosestudiantes` (
  `id_documento_estudiante` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int DEFAULT NULL,
  `id_documento` int DEFAULT NULL,
  `Numero_Documento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `Documento` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `Estado` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id_documento_estudiante`),
  KEY `id_documento` (`id_documento`),
  KEY `id_estudiante` (`id_estudiante`),
  CONSTRAINT `fk_docest_documento` FOREIGN KEY (`id_documento`) REFERENCES `tipodocumentos` (`id_documento`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_docest_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentosestudiantes`
--

LOCK TABLES `documentosestudiantes` WRITE;
/*!40000 ALTER TABLE `documentosestudiantes` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentosestudiantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edificios`
--

DROP TABLE IF EXISTS `edificios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edificios` (
  `id_edificio` int NOT NULL,
  `codigo_edificio` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `nombre_edificio` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_edificio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edificios`
--

LOCK TABLES `edificios` WRITE;
/*!40000 ALTER TABLE `edificios` DISABLE KEYS */;
INSERT INTO `edificios` VALUES (1,'A','Edificio A','Salones de primero y segundo año',1),(2,'B','Edificio B','Salones de especialidades y laboratorios',1);
/*!40000 ALTER TABLE `edificios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `errores_sistema`
--

DROP TABLE IF EXISTS `errores_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `errores_sistema` (
  `id_error` int NOT NULL AUTO_INCREMENT,
  `mensaje` text COLLATE utf8mb4_spanish_ci NOT NULL,
  `stack_trace` text COLLATE utf8mb4_spanish_ci,
  `usuario` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `ruta` varchar(255) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `ip` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `resuelto` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_error`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `errores_sistema`
--

LOCK TABLES `errores_sistema` WRITE;
/*!40000 ALTER TABLE `errores_sistema` DISABLE KEYS */;
/*!40000 ALTER TABLE `errores_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidades`
--

DROP TABLE IF EXISTS `especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidades` (
  `id_especialidad` int NOT NULL,
  `nombre_especialidad` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `duracion_anios` int DEFAULT '3',
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_especialidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidades`
--

LOCK TABLES `especialidades` WRITE;
/*!40000 ALTER TABLE `especialidades` DISABLE KEYS */;
INSERT INTO `especialidades` VALUES (1,'Tecnico Vocacional en Desarrollo de Software','Programacion, bases de datos y desarrollo de aplicaciones',3,1),(2,'Tecnico Vocacional en Administrativo Contable','Contabilidad, administracion y planillas',3,1),(3,'Tecnico Productivo en Salud y Bienestar','Salud preventiva, primeros auxilios y nutricion',3,1);
/*!40000 ALTER TABLE `especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidades_temp`
--

DROP TABLE IF EXISTS `especialidades_temp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidades_temp` (
  `id_especialidad` int NOT NULL AUTO_INCREMENT,
  `nombre_especialidad` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_spanish_ci,
  `duracion_anios` int DEFAULT '3',
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_especialidad`),
  UNIQUE KEY `nombre_especialidad` (`nombre_especialidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidades_temp`
--

LOCK TABLES `especialidades_temp` WRITE;
/*!40000 ALTER TABLE `especialidades_temp` DISABLE KEYS */;
/*!40000 ALTER TABLE `especialidades_temp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadisticas_tablas`
--

DROP TABLE IF EXISTS `estadisticas_tablas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estadisticas_tablas` (
  `id_estadistica` int NOT NULL AUTO_INCREMENT,
  `tabla` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `registros` int DEFAULT '0',
  `tamano_mb` decimal(10,2) DEFAULT '0.00',
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estadistica`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadisticas_tablas`
--

LOCK TABLES `estadisticas_tablas` WRITE;
/*!40000 ALTER TABLE `estadisticas_tablas` DISABLE KEYS */;
/*!40000 ALTER TABLE `estadisticas_tablas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiantes`
--

DROP TABLE IF EXISTS `estudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiantes` (
  `id_estudiante` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `apellidos` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `codigo_estudiante` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `dui` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `pasaporte` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nacionalidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Salvadorena',
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('Masculino','Femenino','Otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `tipo_sangre` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `enfermedades_cronicas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `alergias` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `medicamentos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `discapacidad` tinyint(1) DEFAULT '0',
  `tipo_discapacidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `telefono_fijo` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_movil` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_emergencia` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nombre_contacto_emergencia` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `parentesco_emergencia` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `correo_estudiante` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `id_clase` int DEFAULT NULL,
  `ano_ingreso` year DEFAULT NULL,
  `fecha_matricula` date DEFAULT NULL,
  `nombre_padre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `dui_padre` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_padre` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `ocupacion_padre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nombre_madre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `dui_madre` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_madre` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `ocupacion_madre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nombre_encargado` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_encargado` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `parentesco_encargado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `contrasena` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `graduado` tinyint(1) DEFAULT '0',
  `fecha_graduacion` date DEFAULT NULL,
  `id_rol` int DEFAULT NULL,
  `id_aspirante_origen` int DEFAULT NULL,
  `nie` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `carnet_menoridad` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL COMMENT 'Carnet de Menoridad',
  PRIMARY KEY (`id_estudiante`),
  UNIQUE KEY `uk_estudiantes_codigo` (`codigo_estudiante`),
  UNIQUE KEY `idx_estudiantes_nie` (`nie`),
  UNIQUE KEY `uk_estudiantes_dui` (`dui`),
  KEY `idx_estudiantes_clase` (`id_clase`),
  KEY `id_rol` (`id_rol`),
  KEY `id_aspirante_origen` (`id_aspirante_origen`),
  KEY `carnet_menoridad` (`carnet_menoridad`),
  CONSTRAINT `fk_estudiante_aspirante` FOREIGN KEY (`id_aspirante_origen`) REFERENCES `aspirantes` (`id_aspirante`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_estudiantes_clase` FOREIGN KEY (`id_clase`) REFERENCES `clases` (`id_clase`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_estudiantes_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes`
--

LOCK TABLES `estudiantes` WRITE;
/*!40000 ALTER TABLE `estudiantes` DISABLE KEYS */;
INSERT INTO `estudiantes` VALUES (1,'Ana Lucia','Perez Gomez','2026-00001-INA','03000001-1',NULL,'Salvadorena','2009-05-12','Femenino','O+',NULL,NULL,NULL,0,NULL,'Colonia San Jose, Apopa',NULL,'7788-4001',NULL,NULL,NULL,'estudiante@ina.edu.sv',1,2026,'2026-01-05','Luis Alberto Perez',NULL,'7701-0001','Contador','Ana Beatriz Gomez',NULL,'7701-0002','Ama de casa',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-01',NULL),(2,'jose','perez','2026-00002-INA','03000002-2',NULL,'Salvadorena','2008-11-03','Masculino','A+',NULL,NULL,NULL,0,NULL,'Colonia San Jose, Apopa',NULL,'7788-4002',NULL,NULL,NULL,'josesito@gmail.com',1,2026,'2026-01-05','Luis Alberto Perez',NULL,'7701-0001','Contador','Ana Beatriz Gomez',NULL,'7701-0002','Ama de casa',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-02',NULL),(3,'José Efraín','Pérez Argueta','2026-00010-INA','03000003-3',NULL,'Salvadorena','2009-02-18','Masculino','O-',NULL,NULL,NULL,0,NULL,'Colonia El Carmen, Apopa',NULL,'7788-4003',NULL,NULL,NULL,'jose19morado@gmail.com',3,2026,'2026-01-06','Efrain Perez',NULL,'7701-0003','Comerciante','Rosa Argueta',NULL,'7701-0004','Costurera',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-03',NULL),(4,'Ian Andrew','Bonilla Hernandez','2026-00013-INA','03000004-4',NULL,'Salvadorena','2009-07-25','Masculino','B+',NULL,NULL,NULL,0,NULL,'Colonia La Campanera, San Salvador',NULL,'7788-4004',NULL,NULL,NULL,'owenmejia12@gmail.com',6,2026,'2026-01-06','Miguel Bonilla',NULL,'7701-0005','Mecanico','Sandra Hernandez',NULL,'7701-0006','Enfermera',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-04',NULL),(5,'FELIPE MEDRANO','Bonilla Suarez','2026-00103-INA','03000005-5',NULL,'Salvadorena','2008-09-14','Masculino','A-',NULL,NULL,NULL,0,NULL,'Colonia Las Dalias, Apopa',NULL,'7788-4005',NULL,NULL,NULL,'santamariamadrededios@gmail.com',7,2026,'2026-01-06','Felipe Bonilla',NULL,'7701-0007','Albañil','Carmen Suarez',NULL,'7701-0008','Vendedora',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-05',NULL),(6,'Juan Jose','Hernández Perez','2026-00127-INA','03000006-6',NULL,'Salvadorena','2008-04-22','Masculino','O+',NULL,NULL,NULL,0,NULL,'Canton Santa Lucia, Apopa',NULL,'7788-4006',NULL,NULL,NULL,'juan19morado@gmail.com',4,2026,'2026-01-07','Roberto Hernandez',NULL,'7701-0009','Agricultor','Patricia Perez',NULL,'7701-0010','Maestra',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-06',NULL),(7,'Carlos Ernesto','Martinez Portillo','2026-00007-INA','03000007-7',NULL,'Salvadorena','2009-06-30','Masculino','B-',NULL,NULL,NULL,0,NULL,'Colonia San Luis, Apopa',NULL,'7788-4007',NULL,NULL,NULL,'carlos.martinez@pupilo.com',1,2026,'2026-01-05','Jorge Martinez',NULL,'7701-0011','Piloto','Iris Portillo',NULL,'7701-0012','Secretaria',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-07',NULL),(8,'Daniela Beatriz','Hernandez Caceres','2026-00008-INA','03000008-8',NULL,'Salvadorena','2009-01-09','Femenino','AB+',NULL,NULL,NULL,0,NULL,'Residencial Las Flores, Apopa',NULL,'7788-4008',NULL,NULL,NULL,'daniela.hernandez@pupilo.com',1,2026,'2026-01-05','Oscar Hernandez',NULL,'7701-0013','Contador','Ruth Caceres',NULL,'7701-0014','Doctora',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-08',NULL),(9,'Sofia Alejandra','Romero Alas','2026-00009-INA','03000009-9',NULL,'Salvadorena','2008-08-17','Femenino','O+',NULL,NULL,NULL,0,NULL,'Colonia El Carmen, Apopa',NULL,'7788-4009',NULL,NULL,NULL,'sofia.romero@pupilo.com',2,2026,'2026-01-05','Manuel Romero',NULL,'7701-0015','Electricista','Glenda Alas',NULL,'7701-0016','Cocinera',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-09',NULL),(10,'Diego Alejandro','Mejia Quintanilla','2026-00011-INA','03000010-0',NULL,'Salvadorena','2008-12-05','Masculino','A+',NULL,NULL,NULL,0,NULL,'Colonia La Solidaridad, Apopa',NULL,'7788-4010',NULL,NULL,NULL,'diego.mejia@pupilo.com',2,2026,'2026-01-05','Rene Mejia',NULL,'7701-0017','Chofer','Iliana Quintanilla',NULL,'7701-0018','Ama de casa',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-10',NULL),(11,'Katherine Michelle','Ayala Serrano','2026-00012-INA','03000011-1',NULL,'Salvadorena','2009-03-28','Femenino','O-',NULL,NULL,NULL,0,NULL,'Colonia Las Dalias, Apopa',NULL,'7788-4011',NULL,NULL,NULL,'katherine.ayala@pupilo.com',3,2026,'2026-01-06','Marcos Ayala',NULL,'7701-0019','Policia','Julia Serrano',NULL,'7701-0020','Enfermera',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-11',NULL),(12,'Bryan Jose','Orellana Ventura','2026-00014-INA','03000012-2',NULL,'Salvadorena','2009-10-11','Masculino','B+',NULL,NULL,NULL,0,NULL,'Canton El Rosario, Apopa',NULL,'7788-4012',NULL,NULL,NULL,'bryan.orellana@pupilo.com',3,2026,'2026-01-06','Hugo Orellana',NULL,'7701-0021','Jardinero','Marta Ventura',NULL,'7701-0022','Vendedora',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-12',NULL),(13,'Gabriela Estefany','Alvarado Perez','2026-00015-INA','03000013-3',NULL,'Salvadorena','2008-07-19','Femenino','A-',NULL,NULL,NULL,0,NULL,'Colonia San Miguel, Apopa',NULL,'7788-4013',NULL,NULL,NULL,'gabriela.alvarado@pupilo.com',5,2026,'2026-01-07','Saul Alvarado',NULL,'7701-0023','Carpintero','Silvia Perez',NULL,'7701-0024','Maestra',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-13',NULL),(14,'Steven Alexander','Rivas Melendez','2026-00016-INA','03000014-4',NULL,'Salvadorena','2008-05-02','Masculino','O+',NULL,NULL,NULL,0,NULL,'Residencial Las Perlas, Apopa',NULL,'7788-4014',NULL,NULL,NULL,'steven.rivas@pupilo.com',4,2026,'2026-01-07','Carlos Rivas',NULL,'7701-0025','Mecanico','Alicia Melendez',NULL,'7701-0026','Ama de casa',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-14',NULL),(15,'Andrea Paola','Flores Martinez','2026-00017-INA','03000015-5',NULL,'Salvadorena','2007-11-23','Femenino','AB+',NULL,NULL,NULL,0,NULL,'Colonia El Milagro, Apopa',NULL,'7788-4015',NULL,NULL,NULL,'andrea.flores@pupilo.com',5,2026,'2026-01-07','Roberto Flores',NULL,'7701-0027','Contador','Claudia Ramirez',NULL,'7701-0028','Abogada',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-15',NULL),(16,'Kevin Josue','Vega Campos','2026-00018-INA','03000016-6',NULL,'Salvadorena','2007-03-15','Masculino','B-',NULL,NULL,NULL,0,NULL,'Colonia La Campanera, Apopa',NULL,'7788-4016',NULL,NULL,NULL,'kevin.vega@pupilo.com',5,2026,'2026-01-07','Luis Vega',NULL,'7701-0029','Pintor','Nancy Campos',NULL,'7701-0030','Ama de casa',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-16',NULL),(17,'Nancy Michelle','Guzman Torres','2026-00019-INA','03000017-7',NULL,'Salvadorena','2009-01-31','Femenino','O+',NULL,NULL,NULL,0,NULL,'Colonia San Luis, Apopa',NULL,'7788-4017',NULL,NULL,NULL,'nancy.guzman@pupilo.com',6,2026,'2026-01-06','Pablo Guzman',NULL,'7701-0031','Albañil','Sonia Torres',NULL,'7701-0032','Costurera',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-17',NULL),(18,'Eduardo Saul','Menjivar Carballo','2026-00020-INA','03000018-8',NULL,'Salvadorena','2009-04-08','Masculino','A+',NULL,NULL,NULL,0,NULL,'Canton Joya Grande, Apopa',NULL,'7788-4018',NULL,NULL,NULL,'eduardo.menjivar@pupilo.com',6,2026,'2026-01-06','Walter Menjivar',NULL,'7701-0033','Agricultor','Leticia Carballo',NULL,'7701-0034','Ama de casa',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-18',NULL),(19,'Patricia Liliana','Cruz Escobar','2026-00021-INA','03000019-9',NULL,'Salvadorena','2008-10-20','Femenino','O-',NULL,NULL,NULL,0,NULL,'Colonia Las Flores, Apopa',NULL,'7788-4019',NULL,NULL,NULL,'patricia.cruz@pupilo.com',7,2026,'2026-01-06','Hernan Cruz',NULL,'7701-0035','Bombero','Vilma Escobar',NULL,'7701-0036','Ama de casa',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-19',NULL),(20,'Jorge Alberto','Herrera Rivas','2026-00022-INA','03000020-0',NULL,'Salvadorena','2008-02-27','Masculino','B+',NULL,NULL,NULL,0,NULL,'Colonia La Esperanza, Apopa',NULL,'7788-4020',NULL,NULL,NULL,'jorge.herrera@pupilo.com',7,2026,'2026-01-06','David Herrera',NULL,'7701-0037','Chofer','Claribel Rivas',NULL,'7701-0038','Cocinera',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-20',NULL),(21,'Beatriz Adriana','Marroquin Sosa','2026-00023-INA','03000021-1',NULL,'Salvadorena','2009-09-06','Femenino','A-',NULL,NULL,NULL,0,NULL,'Residencial Los Angeles, Apopa',NULL,'7788-4021',NULL,NULL,NULL,'beatriz.marroquin@pupilo.com',8,2026,'2026-01-07','Edwin Marroquin',NULL,'7701-0039','Tecnico','Karla Sosa',NULL,'7701-0040','Enfermera',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-21',NULL),(22,'William Ernesto','Velasquez Giron','2026-00024-INA','03000022-2',NULL,'Salvadorena','2009-12-14','Masculino','O+',NULL,NULL,NULL,0,NULL,'Colonia El Zapote, Apopa',NULL,'7788-4022',NULL,NULL,NULL,'william.velasquez@pupilo.com',8,2026,'2026-01-07','Mario Velasquez',NULL,'7701-0041','Comerciante','Rosa Giron',NULL,'7701-0042','Vendedora',NULL,NULL,NULL,NULL,1,0,NULL,7,NULL,'NIE-2026-22',NULL),(25,'Luis Eduardo','Mejia Benavides','2026-00025-INA','02000003-3',NULL,'Salvadorena',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'luis.mejia@correo.com',6,2026,'2026-08-14',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,NULL,3,'NIE-EXP-003',NULL),(26,'Karen Noemi','Ayala Martinez','2026-00026-INA','02000002-2',NULL,'Salvadorena',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'karen.ayala@correo.com',6,2026,'2026-08-14',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,NULL,2,'NIE-EXP-002',NULL);
/*!40000 ALTER TABLE `estudiantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `estudiantes_aspirantes`
--

DROP TABLE IF EXISTS `estudiantes_aspirantes`;
/*!50001 DROP VIEW IF EXISTS `estudiantes_aspirantes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `estudiantes_aspirantes` AS SELECT 
 1 AS `id_estudiante`,
 1 AS `codigo_estudiante`,
 1 AS `nombres`,
 1 AS `apellidos`,
 1 AS `dui`,
 1 AS `nie`,
 1 AS `carnet_menoridad`,
 1 AS `id_clase`,
 1 AS `ano_ingreso`,
 1 AS `estado`,
 1 AS `graduado`,
 1 AS `id_aspirante`,
 1 AS `fecha_aprobacion`,
 1 AS `aprobado_por`,
 1 AS `numero_expediente`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `faltas_amonestaciones`
--

DROP TABLE IF EXISTS `faltas_amonestaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faltas_amonestaciones` (
  `id_faltas` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_docente` int DEFAULT NULL,
  `tipo` enum('Falta','Amonestacion','Demerito') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `gravedad` enum('Leve','Moderada','Grave') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Leve',
  `fecha` date NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `puntos_demerito` int DEFAULT '0',
  `estado` enum('Activa','Revisada','Apelada') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Activa',
  `registrado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `id_docente_registro` int DEFAULT NULL,
  PRIMARY KEY (`id_faltas`),
  KEY `idx_faltas_id_estudiante` (`id_estudiante`),
  KEY `idx_faltas_id_docente` (`id_docente`),
  KEY `fk_falta_docente_registro` (`id_docente_registro`),
  CONSTRAINT `fk_falta_docente_registro` FOREIGN KEY (`id_docente_registro`) REFERENCES `docentes` (`id_docente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_faltas_docente` FOREIGN KEY (`id_docente`) REFERENCES `docentes` (`id_docente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_faltas_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_falta_tipo` CHECK ((`tipo` in (_cp850'Falta',_cp850'Amonestacion',_cp850'Demerito')))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faltas_amonestaciones`
--

LOCK TABLES `faltas_amonestaciones` WRITE;
/*!40000 ALTER TABLE `faltas_amonestaciones` DISABLE KEYS */;
INSERT INTO `faltas_amonestaciones` VALUES (1,2,1,'Falta','Leve','2026-02-10','Uso de telefono celular en clase sin autorizacion',2,'Activa','DOC001',1),(2,14,4,'Amonestacion','Moderada','2026-02-18','Interrupciones repetidas durante la clase',5,'Activa','DOC004',4),(3,16,4,'Demerito','Grave','2026-02-25','Salida del aula sin autorizacion',8,'Activa','DOC004',4),(4,18,5,'Falta','Leve','2026-02-12','No entrego la tarea asignada',2,'Activa','DOC005',5),(5,13,NULL,'Falta','Leve','2026-08-14','prueba\n',2,'Activa',NULL,NULL);
/*!40000 ALTER TABLE `faltas_amonestaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grados`
--

DROP TABLE IF EXISTS `grados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grados` (
  `id_grados` int NOT NULL,
  `id_nivel` int NOT NULL,
  `numero_grado` int NOT NULL,
  `nombre_grado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `orden` int NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_grados`),
  KEY `idx_grados_id_nivel` (`id_nivel`),
  CONSTRAINT `fk_grados_nivel` FOREIGN KEY (`id_nivel`) REFERENCES `niveles_academicos` (`id_niveles`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grados`
--

LOCK TABLES `grados` WRITE;
/*!40000 ALTER TABLE `grados` DISABLE KEYS */;
INSERT INTO `grados` VALUES (1,1,1,'Primer Año',1,1),(2,1,2,'Segundo Año',2,1),(3,2,1,'Primer Año',1,1),(4,2,2,'Segundo Año',2,1),(5,2,3,'Tercer Año',3,1),(6,3,1,'Primer Año',1,1),(7,3,2,'Segundo Año',2,1);
/*!40000 ALTER TABLE `grados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_contrasenas`
--

DROP TABLE IF EXISTS `historial_contrasenas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_contrasenas` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `contrasena_anterior` varchar(255) COLLATE utf8mb4_spanish_ci NOT NULL,
  `contrasena_nueva` varchar(255) COLLATE utf8mb4_spanish_ci NOT NULL,
  `ip` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha_cambio` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_contrasenas`
--

LOCK TABLES `historial_contrasenas` WRITE;
/*!40000 ALTER TABLE `historial_contrasenas` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_contrasenas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios`
--

DROP TABLE IF EXISTS `horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios` (
  `id_horario` int NOT NULL AUTO_INCREMENT,
  `id_clase` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_docente` int DEFAULT NULL,
  `jornada` enum('Matutina','Vespertina') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `dia_semana` enum('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `aula` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `id_aula` int DEFAULT NULL,
  `periodo` int DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `anio_lectivo` year NOT NULL DEFAULT '2026' COMMENT 'Año lectivo al que pertenece el horario',
  PRIMARY KEY (`id_horario`),
  KEY `idx_horarios_busqueda` (`id_clase`,`dia_semana`,`hora_inicio`),
  KEY `idx_horarios_id_clase` (`id_clase`),
  KEY `idx_horarios_id_materia` (`id_materia`),
  KEY `idx_horarios_id_docente` (`id_docente`),
  KEY `idx_horarios_id_aula` (`id_aula`),
  KEY `anio_lectivo` (`anio_lectivo`),
  CONSTRAINT `fk_horarios_aula` FOREIGN KEY (`id_aula`) REFERENCES `aulas` (`id_aula`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_horarios_clase` FOREIGN KEY (`id_clase`) REFERENCES `clases` (`id_clase`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_horarios_docente` FOREIGN KEY (`id_docente`) REFERENCES `docentes` (`id_docente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_horarios_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios`
--

LOCK TABLES `horarios` WRITE;
/*!40000 ALTER TABLE `horarios` DISABLE KEYS */;
INSERT INTO `horarios` VALUES (1,1,1,1,'Matutina','Lunes','08:45:00','09:30:00','A-01',1,1,1,2026),(2,1,2,1,'Matutina','Lunes','09:30:00','10:15:00','A-01',1,1,0,2026),(3,1,5,3,'Matutina','Martes','07:00:00','07:45:00','A-02',2,1,1,2026),(4,1,3,2,'Matutina','Lunes','10:30:00','11:15:00','A-01',1,1,1,2026),(5,1,1,1,'Matutina','Jueves','08:45:00','09:30:00','A-01',1,1,1,2026),(6,1,4,2,'Matutina','Martes','09:30:00','10:15:00','A-01',1,1,1,2026),(7,1,2,1,'Matutina','Miercoles','07:45:00','08:30:00','A-01',1,1,1,2026),(8,1,6,3,'Matutina','Miercoles','11:15:00','12:00:00','A-03',3,1,1,2026),(9,1,1,1,'Matutina','Jueves','07:00:00','07:45:00','A-01',1,1,1,2026),(10,1,4,2,'Matutina','Jueves','07:45:00','08:30:00','A-01',1,1,1,2026),(11,1,5,3,'Matutina','Viernes','08:45:00','09:30:00','A-02',2,1,1,2026),(12,1,3,2,'Matutina','Viernes','10:30:00','11:15:00','A-01',1,1,1,2026),(13,2,1,1,'Matutina','Lunes','07:00:00','07:45:00','A-02',2,1,1,2026),(14,2,2,2,'Matutina','Lunes','07:45:00','08:30:00','A-02',2,1,1,2026),(15,2,5,3,'Matutina','Martes','07:45:00','08:30:00','A-01',1,1,1,2026),(16,2,4,2,'Matutina','Lunes','08:45:00','09:30:00','A-02',2,1,1,2026),(17,2,3,2,'Matutina','Miercoles','07:45:00','08:30:00','A-02',2,1,1,2026),(18,2,1,1,'Matutina','Miercoles','07:00:00','07:45:00','A-02',2,1,1,2026),(19,2,4,2,'Matutina','Jueves','09:30:00','10:15:00','A-02',2,1,1,2026),(20,2,5,3,'Matutina','Viernes','07:45:00','08:30:00','A-01',1,1,1,2026),(21,3,7,4,'Matutina','Miercoles','09:30:00','10:15:00','LAB-01',5,1,1,2026),(22,3,8,4,'Matutina','Jueves','07:00:00','07:45:00','LAB-01',5,1,1,2026),(23,3,5,3,'Matutina','Lunes','08:45:00','09:30:00','B-01',4,1,1,2026),(24,3,6,3,'Matutina','Lunes','10:30:00','11:15:00','LAB-01',5,1,1,2026),(25,3,7,4,'Matutina','Miercoles','07:45:00','08:30:00','LAB-01',5,1,1,2026),(26,3,8,4,'Matutina','Martes','08:45:00','09:30:00','LAB-01',5,1,1,2026),(27,3,7,4,'Matutina','Miercoles','08:45:00','09:30:00','LAB-01',5,1,1,2026),(28,3,8,4,'Matutina','Viernes','07:45:00','08:30:00','LAB-01',5,1,1,2026),(29,3,7,4,'Matutina','Viernes','08:45:00','09:30:00','LAB-01',5,1,1,2026),(30,4,7,4,'Matutina','Viernes','07:00:00','07:45:00','LAB-01',5,1,1,2026),(31,4,8,4,'Matutina','Jueves','08:45:00','09:30:00','LAB-01',5,1,1,2026),(32,4,7,4,'Matutina','Jueves','09:30:00','10:15:00','LAB-01',5,1,1,2026),(33,4,8,4,'Matutina','Miercoles','07:00:00','07:45:00','LAB-01',5,1,1,2026),(34,4,7,4,'Matutina','Jueves','07:45:00','08:30:00','LAB-01',5,1,1,2026),(35,4,8,4,'Matutina','Viernes','10:30:00','11:15:00','LAB-01',5,1,1,2026),(36,5,7,4,'Matutina','Lunes','07:00:00','07:45:00','B-01',4,1,1,2026),(37,5,8,4,'Matutina','Lunes','10:30:00','11:15:00','B-01',4,1,1,2026),(38,5,7,4,'Matutina','Martes','09:30:00','10:15:00','B-01',4,1,1,2026),(39,5,8,4,'Matutina','Viernes','11:15:00','12:00:00','B-01',4,1,1,2026),(40,6,10,5,'Matutina','Lunes','07:00:00','07:45:00','LAB-02',6,1,1,2026),(41,6,11,5,'Matutina','Lunes','07:45:00','08:30:00','LAB-02',6,1,1,2026),(42,6,5,3,'Matutina','Jueves','07:00:00','07:45:00','B-01',4,1,1,2026),(43,6,6,3,'Matutina','Lunes','09:30:00','10:15:00','LAB-02',6,1,1,2026),(44,6,10,5,'Matutina','Martes','07:00:00','07:45:00','LAB-02',6,1,1,2026),(45,6,11,5,'Matutina','Miercoles','07:45:00','08:30:00','LAB-02',6,1,1,2026),(46,7,12,6,'Matutina','Lunes','09:30:00','10:15:00','B-01',4,1,1,2026),(47,7,13,6,'Matutina','Lunes','07:45:00','08:30:00','B-01',4,1,1,2026),(48,7,12,6,'Matutina','Miercoles','08:45:00','09:30:00','B-01',4,1,1,2026),(49,7,13,6,'Matutina','Jueves','07:45:00','08:30:00','B-01',4,1,1,2026),(50,8,7,4,'Matutina','Martes','07:45:00','08:30:00','LAB-01',5,1,1,2026),(51,8,8,4,'Matutina','Lunes','09:30:00','10:15:00','LAB-01',5,1,1,2026),(52,8,5,3,'Matutina','Lunes','11:15:00','12:00:00','B-01',4,1,1,2026),(53,8,7,4,'Matutina','Martes','07:00:00','07:45:00','LAB-01',5,1,1,2026),(54,8,8,4,'Matutina','Viernes','09:30:00','10:15:00','LAB-01',5,1,1,2026);
/*!40000 ALTER TABLE `horarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inscripciones`
--

DROP TABLE IF EXISTS `inscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inscripciones` (
  `id_inscripciones` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `fecha_inscripcion` date DEFAULT NULL,
  `fecha_matricula` date DEFAULT NULL,
  `tipo_inscripcion` enum('Nuevo Ingreso','Regular','Repitente','Traslado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Nuevo Ingreso',
  `estado_inscripcion` enum('Pendiente','Confirmada','Cancelada','Retirado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Pendiente',
  `estado_aprobacion` enum('Pendiente','Aprobada','Rechazada') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Pendiente',
  `fecha_aprobacion` datetime DEFAULT NULL,
  `aprobado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `motivo_rechazo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `numero_expediente` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `numero_carnet` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `documentos_presentados` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `id_aspirante_origen` int DEFAULT NULL,
  `nie` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL COMMENT 'Numero de Identificacion de Estudiante',
  `carnet_menoridad` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL COMMENT 'Carnet de Menoridad',
  PRIMARY KEY (`id_inscripciones`),
  UNIQUE KEY `uk_inscripcion_estudiante_anio` (`id_estudiante`,`id_clase`,`anio_lectivo`),
  KEY `idx_inscripciones_id_estudiante` (`id_estudiante`),
  KEY `idx_inscripciones_id_clase` (`id_clase`),
  KEY `id_aspirante_origen` (`id_aspirante_origen`),
  KEY `nie` (`nie`),
  KEY `carnet_menoridad` (`carnet_menoridad`),
  CONSTRAINT `fk_inscripcion_aspirante` FOREIGN KEY (`id_aspirante_origen`) REFERENCES `aspirantes` (`id_aspirante`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inscripciones_clase` FOREIGN KEY (`id_clase`) REFERENCES `clases` (`id_clase`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_inscripciones_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripciones`
--

LOCK TABLES `inscripciones` WRITE;
/*!40000 ALTER TABLE `inscripciones` DISABLE KEYS */;
INSERT INTO `inscripciones` VALUES (1,1,1,2026,'2026-01-05','2026-01-05','Regular','Confirmada','Aprobada','2026-01-05 08:30:00','Registro Academico',NULL,'EXP-2026-001','CARNET-2026-001','Partida, Notas',NULL,'NIE-2026-01',NULL),(2,2,1,2026,'2026-01-05','2026-01-05','Regular','Confirmada','Aprobada','2026-01-05 08:35:00','Registro Academico',NULL,'EXP-2026-002','CARNET-2026-002','Partida, Notas',NULL,'NIE-2026-02',NULL),(3,3,3,2026,'2026-01-06','2026-01-06','Regular','Confirmada','Aprobada','2026-01-06 08:30:00','Registro Academico',NULL,'EXP-2026-003','CARNET-2026-003','Partida, Notas, DUI',NULL,'NIE-2026-03',NULL),(4,4,6,2026,'2026-01-06','2026-01-06','Regular','Confirmada','Aprobada','2026-01-06 09:00:00','Registro Academico',NULL,'EXP-2026-004','CARNET-2026-004','Partida, Notas',NULL,'NIE-2026-04',NULL),(5,5,7,2026,'2026-01-06','2026-01-06','Regular','Confirmada','Aprobada','2026-01-06 09:10:00','Registro Academico',NULL,'EXP-2026-005','CARNET-2026-005','Partida, Notas, Carnet',NULL,'NIE-2026-05',NULL),(6,6,4,2026,'2026-01-07','2026-01-07','Regular','Confirmada','Aprobada','2026-01-07 08:40:00','Registro Academico',NULL,'EXP-2026-006','CARNET-2026-006','Partida, Notas',NULL,'NIE-2026-06',NULL),(7,7,1,2026,'2026-01-05','2026-01-06','Nuevo Ingreso','Confirmada','Aprobada','2026-01-06 10:00:00','Registro Academico',NULL,'EXP-2026-007','CARNET-2026-007','Partida, Notas',NULL,'NIE-2026-07',NULL),(8,8,1,2026,'2026-01-05','2026-01-06','Nuevo Ingreso','Confirmada','Aprobada','2026-01-06 10:05:00','Registro Academico',NULL,'EXP-2026-008','CARNET-2026-008','Partida, Notas',NULL,'NIE-2026-08',NULL),(9,9,2,2026,'2026-01-05','2026-01-06','Regular','Confirmada','Aprobada','2026-01-06 10:10:00','Registro Academico',NULL,'EXP-2026-009','CARNET-2026-009','Partida, Notas',NULL,'NIE-2026-09',NULL),(10,10,2,2026,'2026-01-05','2026-01-06','Regular','Confirmada','Aprobada','2026-01-06 10:15:00','Registro Academico',NULL,'EXP-2026-010','CARNET-2026-010','Partida, Notas',NULL,'NIE-2026-10',NULL),(11,11,3,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:00:00','Registro Academico',NULL,'EXP-2026-011','CARNET-2026-011','Partida, Notas, Carnet',NULL,'NIE-2026-11',NULL),(12,12,3,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:05:00','Registro Academico',NULL,'EXP-2026-012','CARNET-2026-012','Partida, Notas',NULL,'NIE-2026-12',NULL),(13,13,6,2026,'2026-01-07','2026-01-07','Regular','Confirmada','Aprobada','2026-01-07 09:10:00','Registro Academico',NULL,'EXP-2026-013','CARNET-2026-013','Partida, Notas',NULL,'NIE-2026-13',NULL),(14,14,4,2026,'2026-01-07','2026-01-07','Regular','Confirmada','Aprobada','2026-01-07 09:15:00','Registro Academico',NULL,'EXP-2026-014','CARNET-2026-014','Partida, Notas',NULL,'NIE-2026-14',NULL),(15,15,5,2026,'2026-01-07','2026-01-07','Regular','Confirmada','Aprobada','2026-01-07 09:20:00','Registro Academico',NULL,'EXP-2026-015','CARNET-2026-015','Partida, Notas',NULL,'NIE-2026-15',NULL),(16,16,5,2026,'2026-01-07','2026-01-07','Regular','Confirmada','Aprobada','2026-01-07 09:25:00','Registro Academico',NULL,'EXP-2026-016','CARNET-2026-016','Partida, Notas',NULL,'NIE-2026-16',NULL),(17,17,6,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:30:00','Registro Academico',NULL,'EXP-2026-017','CARNET-2026-017','Partida, Notas, Carnet',NULL,'NIE-2026-17',NULL),(18,18,6,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:35:00','Registro Academico',NULL,'EXP-2026-018','CARNET-2026-018','Partida, Notas',NULL,'NIE-2026-18',NULL),(19,19,7,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:40:00','Registro Academico',NULL,'EXP-2026-019','CARNET-2026-019','Partida, Notas, DUI',NULL,'NIE-2026-19',NULL),(20,20,7,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:45:00','Registro Academico',NULL,'EXP-2026-020','CARNET-2026-020','Partida, Notas',NULL,'NIE-2026-20',NULL),(21,21,8,2026,'2026-01-07','2026-01-08','Nuevo Ingreso','Confirmada','Aprobada','2026-01-08 09:00:00','Registro Academico',NULL,'EXP-2026-021','CARNET-2026-021','Partida, Notas, Carnet',NULL,'NIE-2026-21',NULL),(22,22,8,2026,'2026-01-07','2026-01-08','Nuevo Ingreso','Confirmada','Aprobada','2026-01-08 09:05:00','Registro Academico',NULL,'EXP-2026-022','CARNET-2026-022','Partida, Notas',NULL,'NIE-2026-22',NULL),(23,25,6,2026,'2026-08-14','2026-08-14','Regular','Confirmada','Pendiente',NULL,NULL,NULL,'EXP-2026-25',NULL,NULL,NULL,NULL,NULL),(24,26,6,2026,'2026-08-14','2026-08-14','Regular','Confirmada','Pendiente',NULL,NULL,NULL,'EXP-2026-26',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `inscripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integridad_datos`
--

DROP TABLE IF EXISTS `integridad_datos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `integridad_datos` (
  `id_integridad` int NOT NULL AUTO_INCREMENT,
  `tabla` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `registros_ok` int DEFAULT '0',
  `registros_error` int DEFAULT '0',
  `errores` text COLLATE utf8mb4_spanish_ci,
  `fecha_verificacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_integridad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integridad_datos`
--

LOCK TABLES `integridad_datos` WRITE;
/*!40000 ALTER TABLE `integridad_datos` DISABLE KEYS */;
/*!40000 ALTER TABLE `integridad_datos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `intentos_login`
--

DROP TABLE IF EXISTS `intentos_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `intentos_login` (
  `id_intento` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `ip` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `exitoso` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_intento`),
  KEY `idx_intentos_login` (`codigo`,`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `intentos_login`
--

LOCK TABLES `intentos_login` WRITE;
/*!40000 ALTER TABLE `intentos_login` DISABLE KEYS */;
INSERT INTO `intentos_login` VALUES (1,'DIR001','::1','2026-08-14 18:33:38',1,'2026-08-15 00:33:38'),(2,'DOC001','::1','2026-08-14 18:55:52',1,'2026-08-15 00:55:52'),(3,'REG001','::1','2026-08-14 19:09:00',1,'2026-08-15 01:09:00');
/*!40000 ALTER TABLE `intentos_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id_inventario` int NOT NULL,
  `codigo_inventario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `nombre_equipo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `marca` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `modelo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `serie` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `categoria` enum('Electronico','Mobiliario','Deportivo','Laboratorio','Oficina','Otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Electronico',
  `estado_equipo` enum('Bueno','Regular','Malo','En Reparacion','Dado de Baja') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Bueno',
  `cantidad` int DEFAULT '1',
  `ubicacion` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `id_edificio` int DEFAULT NULL,
  `id_aula` int DEFAULT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `valor_compra` decimal(10,2) DEFAULT NULL,
  `responsable` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_inventario`),
  KEY `idx_inventario_id_edificio` (`id_edificio`),
  KEY `idx_inventario_id_aula` (`id_aula`),
  CONSTRAINT `fk_inventario_aula` FOREIGN KEY (`id_aula`) REFERENCES `aulas` (`id_aula`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inventario_edificio` FOREIGN KEY (`id_edificio`) REFERENCES `edificios` (`id_edificio`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materias`
--

DROP TABLE IF EXISTS `materias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materias` (
  `id_materia` int NOT NULL AUTO_INCREMENT,
  `nombre_materia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `codigo_materia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `tipo_materia` enum('Basica','Especialidad') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'Basica',
  `escala_maxima` decimal(5,2) NOT NULL DEFAULT '100.00',
  `escala_minima` decimal(5,2) NOT NULL DEFAULT '0.00',
  `nota_minima` decimal(5,2) NOT NULL DEFAULT '60.00',
  `decimales_permitidos` tinyint NOT NULL DEFAULT '0',
  `id_especialidad` int DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_materia`),
  KEY `idx_materias_id_especialidad` (`id_especialidad`),
  CONSTRAINT `fk_materias_especialidad` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id_especialidad`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materias`
--

LOCK TABLES `materias` WRITE;
/*!40000 ALTER TABLE `materias` DISABLE KEYS */;
INSERT INTO `materias` VALUES (1,'Matematica','MAT-B01','Basica',100.00,0.00,60.00,1,NULL,1),(2,'Lenguaje y Literatura','LEN-B02','Basica',100.00,0.00,60.00,1,NULL,1),(3,'Ciencias Naturales','CIE-B03','Basica',100.00,0.00,60.00,1,NULL,1),(4,'Estudios Sociales','EST-B04','Basica',100.00,0.00,60.00,1,NULL,1),(5,'Ingles','ING-B05','Basica',100.00,0.00,60.00,1,NULL,1),(6,'Informatica','INF-B06','Basica',100.00,0.00,60.00,1,NULL,1),(7,'Programacion','PROG-E01','Especialidad',5.00,0.00,4.00,1,1,1),(8,'Base de Datos','BD-E02','Especialidad',5.00,0.00,4.00,1,1,1),(9,'Diseno Web','WEB-E03','Especialidad',5.00,0.00,4.00,1,1,1),(10,'Contabilidad General','CONT-E01','Especialidad',5.00,0.00,4.00,1,2,1),(11,'Administracion','ADM-E02','Especialidad',5.00,0.00,4.00,1,2,1),(12,'Higiene y Salud','SAL-E01','Especialidad',5.00,0.00,4.00,1,3,1),(13,'Primeros Auxilios','PAUX-E02','Especialidad',5.00,0.00,4.00,1,3,1);
/*!40000 ALTER TABLE `materias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monitoreo_espacio`
--

DROP TABLE IF EXISTS `monitoreo_espacio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monitoreo_espacio` (
  `id_monitoreo` int NOT NULL AUTO_INCREMENT,
  `espacio_total_gb` decimal(10,2) NOT NULL,
  `espacio_libre_gb` decimal(10,2) NOT NULL,
  `espacio_usado_gb` decimal(10,2) NOT NULL,
  `porcentaje_uso` decimal(5,2) NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_monitoreo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monitoreo_espacio`
--

LOCK TABLES `monitoreo_espacio` WRITE;
/*!40000 ALTER TABLE `monitoreo_espacio` DISABLE KEYS */;
/*!40000 ALTER TABLE `monitoreo_espacio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `niveles_academicos`
--

DROP TABLE IF EXISTS `niveles_academicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `niveles_academicos` (
  `id_niveles` int NOT NULL,
  `nombre_nivel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `tipo_media` enum('General','Especialidad') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `duracion_anios` int NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_niveles`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `niveles_academicos`
--

LOCK TABLES `niveles_academicos` WRITE;
/*!40000 ALTER TABLE `niveles_academicos` DISABLE KEYS */;
INSERT INTO `niveles_academicos` VALUES (1,'Bachillerato General','General',2,'Educacion media general (2 anios)',1),(2,'Bachillerato Tecnico Vocacional','Especialidad',3,'Bachillerato tecnico vocacional (3 anios)',1),(3,'Bachillerato Tecnico Productivo','Especialidad',3,'Bachillerato tecnico productivo (3 anios)',1);
/*!40000 ALTER TABLE `niveles_academicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `mensaje` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `tipo` enum('email','interna') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'interna',
  `destinatario_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha_programada` datetime DEFAULT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `archivo_adjunto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `creado_por` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  KEY `fk_notif_usuario` (`creado_por`),
  KEY `idx_notif_leida` (`leida`),
  KEY `idx_notif_destino` (`destinatario_email`),
  KEY `idx_notif_programada` (`fecha_programada`),
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,'Bienvenida al Portal','Su cuenta fue creada exitosamente en el Sistema Academico INA',1,'interna','estudiante@ina.edu.sv',NULL,NULL,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:49:13'),(2,'Reunion de Padres de Familia','El 5 de febrero se realizara la reunion general de padres a las 8:00 AM en el auditorio.',1,'interna','encargado@google.com',NULL,NULL,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:49:13'),(3,'Resultados Publicados','Los resultados del I periodo ya estan disponibles en el portal.',1,'interna','estudiante@ina.edu.sv',NULL,NULL,NULL,1,'2026-08-15 00:30:23','2026-08-15 00:49:13'),(4,'Actividad Proxima','Recuerde que el examen de Programacion es el 9 de febrero.',1,'interna','jose19morado@gmail.com',NULL,NULL,NULL,4,'2026-08-15 00:30:23','2026-08-15 00:49:13');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodos_academicos`
--

DROP TABLE IF EXISTS `periodos_academicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodos_academicos` (
  `id_periodo` int NOT NULL AUTO_INCREMENT,
  `anio_lectivo` year NOT NULL,
  `numero_periodo` tinyint NOT NULL,
  `nombre` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('Activo','Cerrado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_periodo`),
  UNIQUE KEY `uk_periodo_anio_num` (`anio_lectivo`,`numero_periodo`),
  KEY `idx_periodo_fechas` (`fecha_inicio`,`fecha_fin`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos_academicos`
--

LOCK TABLES `periodos_academicos` WRITE;
/*!40000 ALTER TABLE `periodos_academicos` DISABLE KEYS */;
INSERT INTO `periodos_academicos` VALUES (1,2026,1,'I Periodo','2026-01-15','2026-03-15','Activo','2026-08-15 00:30:21'),(2,2026,2,'II Periodo','2026-03-16','2026-05-30','Cerrado','2026-08-15 00:30:21'),(3,2026,3,'III Periodo','2026-06-01','2026-08-15','Cerrado','2026-08-15 00:30:21'),(4,2026,4,'IV Periodo','2026-08-16','2026-10-30','Cerrado','2026-08-15 00:30:21');
/*!40000 ALTER TABLE `periodos_academicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personas`
--

DROP TABLE IF EXISTS `personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personas` (
  `id_persona` int NOT NULL AUTO_INCREMENT,
  `tipo_documento` enum('DUI','NIT','Pasaporte','NIE','Carnet_Menoridad') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `numero_documento` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `apellidos` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('Masculino','Femenino','Otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_principal` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono_secundario` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `correo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `ocupacion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `uk_persona_documento` (`tipo_documento`,`numero_documento`),
  KEY `idx_persona_nombres` (`nombres`,`apellidos`),
  KEY `idx_persona_telefono` (`telefono_principal`),
  KEY `fk_personas_usuario` (`id_usuario`),
  CONSTRAINT `fk_personas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personas`
--

LOCK TABLES `personas` WRITE;
/*!40000 ALTER TABLE `personas` DISABLE KEYS */;
INSERT INTO `personas` VALUES (1,'DUI','04000001-1','Luis Alberto','Perez Martinez','1975-08-20','Masculino','7701-0001',NULL,'encargado@google.com','Colonia San Jose, Apopa','Contador','2026-08-15 00:30:22','2026-08-15 00:30:22',6),(2,'DUI','04000002-2','Ana Beatriz','Gomez Romero','1978-02-14','Femenino','7701-0002',NULL,'ana.gomez@correo.com','Colonia San Jose, Apopa','Ama de casa','2026-08-15 00:30:22','2026-08-15 00:30:22',NULL),(3,'DUI','04000003-3','Roberto Carlos','Hernandez Torres','1974-11-30','Masculino','7701-0009',NULL,'roberto.hernandez@correo.com','Canton Santa Lucia, Apopa','Agricultor','2026-08-15 00:30:22','2026-08-15 00:30:22',NULL),(4,'DUI','04000004-4','Juan Carlos','Perez Rodriguez','1970-05-10','Masculino','7799-0001',NULL,'direccion@ina.edu.sv','Apopa','Director','2026-08-15 00:30:22','2026-08-15 00:30:22',2);
/*!40000 ALTER TABLE `personas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plantillas_constancias`
--

DROP TABLE IF EXISTS `plantillas_constancias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plantillas_constancias` (
  `id_plantilla` int NOT NULL AUTO_INCREMENT,
  `nombre_plantilla` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `titulo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `cuerpo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `pie` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_plantilla`),
  UNIQUE KEY `nombre_plantilla` (`nombre_plantilla`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantillas_constancias`
--

LOCK TABLES `plantillas_constancias` WRITE;
/*!40000 ALTER TABLE `plantillas_constancias` DISABLE KEYS */;
/*!40000 ALTER TABLE `plantillas_constancias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestamos_equipo`
--

DROP TABLE IF EXISTS `prestamos_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestamos_equipo` (
  `id_prestamo` int NOT NULL,
  `id_inventario` int NOT NULL,
  `tipo_solicitante` enum('Docente','Estudiante','Administrativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `id_solicitante` int NOT NULL,
  `nombre_solicitante` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha_prestamo` date DEFAULT NULL,
  `fecha_devolucion_esperada` date DEFAULT NULL,
  `fecha_devolucion_real` date DEFAULT NULL,
  `estado_prestamo` enum('Pendiente','Activo','Devuelto','Vencido','Cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Pendiente',
  `estado_equipo_entrega` enum('Bueno','Regular','Malo') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Bueno',
  `estado_equipo_devolucion` enum('Bueno','Regular','Malo','Danado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `aprobado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_prestamo`),
  KEY `idx_prestamos_id_inventario` (`id_inventario`),
  CONSTRAINT `fk_prestamos_inventario` FOREIGN KEY (`id_inventario`) REFERENCES `inventario` (`id_inventario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestamos_equipo`
--

LOCK TABLES `prestamos_equipo` WRITE;
/*!40000 ALTER TABLE `prestamos_equipo` DISABLE KEYS */;
/*!40000 ALTER TABLE `prestamos_equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promocion_automatica`
--

DROP TABLE IF EXISTS `promocion_automatica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promocion_automatica` (
  `id_promocion` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `id_clase_origen` int NOT NULL,
  `id_clase_destino` int DEFAULT NULL,
  `anio_lectivo` year NOT NULL,
  `promedio_final` decimal(5,2) DEFAULT NULL,
  `estado_promocion` enum('Promovido','Reprobado','CambioEspecialidad') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nueva_especialidad` int DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  PRIMARY KEY (`id_promocion`),
  KEY `idx_promocion_id_estudiante` (`id_estudiante`),
  KEY `idx_promocion_id_clase_origen` (`id_clase_origen`),
  KEY `idx_promocion_id_clase_destino` (`id_clase_destino`),
  KEY `idx_promocion_nueva_especialidad` (`nueva_especialidad`),
  CONSTRAINT `fk_promocion_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promocion_automatica`
--

LOCK TABLES `promocion_automatica` WRITE;
/*!40000 ALTER TABLE `promocion_automatica` DISABLE KEYS */;
/*!40000 ALTER TABLE `promocion_automatica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recuperaciones`
--

DROP TABLE IF EXISTS `recuperaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recuperaciones` (
  `id_recuperacion` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `nota_recuperacion` decimal(5,2) NOT NULL,
  `fecha_recuperacion` date NOT NULL,
  `tipo_recuperacion` enum('Sustituye','Promedia','Nota_Minima') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Sustituye',
  `nota_minima_asignada` decimal(5,2) DEFAULT NULL,
  `registrado_por` int DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_recuperacion`),
  UNIQUE KEY `uk_recuperacion_estudiante_materia` (`id_estudiante`,`id_materia`,`anio_lectivo`),
  KEY `id_materia` (`id_materia`),
  KEY `id_clase` (`id_clase`),
  KEY `registrado_por` (`registrado_por`),
  KEY `idx_recuperacion_fecha` (`fecha_recuperacion`),
  KEY `idx_recuperacion_tipo` (`tipo_recuperacion`),
  CONSTRAINT `fk_recuperaciones_docente` FOREIGN KEY (`registrado_por`) REFERENCES `docentes` (`id_docente`),
  CONSTRAINT `fk_recuperaciones_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recuperaciones`
--

LOCK TABLES `recuperaciones` WRITE;
/*!40000 ALTER TABLE `recuperaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `recuperaciones` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_audit_recuperaciones_insert` AFTER INSERT ON `recuperaciones` FOR EACH ROW BEGIN
    INSERT INTO auditoria_recuperaciones (id_recuperacion, id_estudiante, id_materia, accion, nota_nueva, registrado_por)
    VALUES (
        NEW.id_recuperacion,
        NEW.id_estudiante,
        NEW.id_materia,
        'CREAR',
        NEW.nota_recuperacion,
        NEW.registrado_por
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_audit_recuperaciones_update` AFTER UPDATE ON `recuperaciones` FOR EACH ROW BEGIN
    IF OLD.nota_recuperacion != NEW.nota_recuperacion THEN
        INSERT INTO auditoria_recuperaciones (id_recuperacion, id_estudiante, id_materia, accion, nota_anterior, nota_nueva, registrado_por)
        VALUES (
            NEW.id_recuperacion,
            NEW.id_estudiante,
            NEW.id_materia,
            'MODIFICAR_NOTA',
            OLD.nota_recuperacion,
            NEW.nota_recuperacion,
            NEW.registrado_por
        );
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `recuperaciones_contrasena`
--

DROP TABLE IF EXISTS `recuperaciones_contrasena`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recuperaciones_contrasena` (
  `id_recuperacion` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_recuperacion`),
  KEY `idx_recuperacion_email` (`email`),
  KEY `idx_recuperacion_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recuperaciones_contrasena`
--

LOCK TABLES `recuperaciones_contrasena` WRITE;
/*!40000 ALTER TABLE `recuperaciones_contrasena` DISABLE KEYS */;
/*!40000 ALTER TABLE `recuperaciones_contrasena` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relaciones_familiares`
--

DROP TABLE IF EXISTS `relaciones_familiares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relaciones_familiares` (
  `id_relacion` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_persona` int NOT NULL,
  `parentesco` enum('Padre','Madre','Encargado','Tutor','Hermano','Abuelo','Otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `vive_con_estudiante` tinyint(1) DEFAULT '1',
  `recibe_comunicados` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_relacion`),
  UNIQUE KEY `uk_relacion_estudiante_persona` (`id_estudiante`,`id_persona`),
  KEY `idx_relacion_estudiante` (`id_estudiante`),
  KEY `idx_relacion_persona` (`id_persona`),
  CONSTRAINT `fk_relacion_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_relacion_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relaciones_familiares`
--

LOCK TABLES `relaciones_familiares` WRITE;
/*!40000 ALTER TABLE `relaciones_familiares` DISABLE KEYS */;
INSERT INTO `relaciones_familiares` VALUES (1,1,1,'Padre',1,1,'2026-08-15 00:30:22','2026-08-15 00:30:22'),(2,2,1,'Padre',1,1,'2026-08-15 00:30:22','2026-08-15 00:30:22'),(3,1,2,'Madre',1,0,'2026-08-15 00:30:22','2026-08-15 00:30:22'),(4,2,2,'Madre',1,0,'2026-08-15 00:30:22','2026-08-15 00:30:22'),(5,6,3,'Padre',1,1,'2026-08-15 00:30:22','2026-08-15 00:30:22');
/*!40000 ALTER TABLE `relaciones_familiares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes_pendientes`
--

DROP TABLE IF EXISTS `reportes_pendientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes_pendientes` (
  `id_reportes` int NOT NULL,
  `titulo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `tipo_reporte` enum('Academico','Disciplinario','Equipo','General') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'General',
  `generado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha_generacion` date DEFAULT NULL,
  `estado` enum('Pendiente','En Proceso','Completado','Cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Pendiente',
  `archivo_adjunto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `id_admin` int DEFAULT NULL,
  `aprobado_por` int DEFAULT NULL,
  PRIMARY KEY (`id_reportes`),
  KEY `id_admin` (`id_admin`),
  KEY `aprobado_por` (`aprobado_por`),
  CONSTRAINT `fk_reportes_admin` FOREIGN KEY (`id_admin`) REFERENCES `administradores` (`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reportes_aprobado_admin` FOREIGN KEY (`aprobado_por`) REFERENCES `administradores` (`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes_pendientes`
--

LOCK TABLES `reportes_pendientes` WRITE;
/*!40000 ALTER TABLE `reportes_pendientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `reportes_pendientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resultados_finales`
--

DROP TABLE IF EXISTS `resultados_finales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultados_finales` (
  `id_resultado_final` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `nota_final` decimal(5,2) NOT NULL DEFAULT '0.00',
  `estado_materia` enum('Aprobado','Reprobado','Recuperacion','Pendiente') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Pendiente',
  `fecha_calculo` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_resultado_final`),
  UNIQUE KEY `uk_estudiante_materia_anio` (`id_estudiante`,`id_materia`,`anio_lectivo`),
  KEY `fk_result_final_materia` (`id_materia`),
  KEY `fk_result_final_clase` (`id_clase`),
  KEY `idx_resultados_estado` (`estado_materia`),
  KEY `idx_resultados_nota` (`nota_final`),
  CONSTRAINT `fk_result_final_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_result_final_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultados_finales`
--

LOCK TABLES `resultados_finales` WRITE;
/*!40000 ALTER TABLE `resultados_finales` DISABLE KEYS */;
INSERT INTO `resultados_finales` VALUES (1,1,1,1,2026,8.30,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(2,1,2,1,2026,8.60,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(3,1,3,1,2026,7.80,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(4,1,4,1,2026,8.90,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(5,1,5,1,2026,8.00,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(6,1,6,1,2026,8.40,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(7,2,1,1,2026,7.30,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(8,2,2,1,2026,7.40,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(9,2,3,1,2026,7.20,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(10,2,4,1,2026,7.00,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(11,2,5,1,2026,8.10,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(12,2,6,1,2026,6.90,'Recuperacion','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(13,7,1,1,2026,9.00,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(14,7,2,1,2026,8.90,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(15,7,3,1,2026,8.00,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(16,7,4,1,2026,9.20,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(17,7,5,1,2026,8.80,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(18,7,6,1,2026,8.50,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(19,3,7,3,2026,7.90,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(20,3,8,3,2026,8.20,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(21,3,5,3,2026,7.90,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(22,3,6,3,2026,8.00,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(23,12,7,3,2026,9.00,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(24,12,8,3,2026,9.30,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(25,12,5,3,2026,8.80,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(26,12,6,3,2026,8.60,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(27,6,7,4,2026,8.40,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(28,6,8,4,2026,8.10,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(29,15,7,5,2026,9.10,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(30,15,8,5,2026,9.40,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(31,16,7,5,2026,8.20,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(32,16,8,5,2026,8.50,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(33,4,10,6,2026,7.80,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(34,4,11,6,2026,8.00,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(35,18,10,6,2026,6.90,'Recuperacion','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(36,18,11,6,2026,7.20,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(37,5,12,7,2026,8.20,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(38,5,13,7,2026,8.10,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(39,19,12,7,2026,7.90,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23'),(40,19,13,7,2026,8.40,'Aprobado','2026-08-15 00:30:23','2026-08-15 00:30:23','2026-08-15 00:30:23');
/*!40000 ALTER TABLE `resultados_finales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resultados_periodos`
--

DROP TABLE IF EXISTS `resultados_periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultados_periodos` (
  `id_resultado_periodo` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_clase` int NOT NULL,
  `id_periodo` int NOT NULL,
  `nota_acumulada` decimal(5,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_resultado_periodo`),
  UNIQUE KEY `uk_estudiante_materia_periodo_clase` (`id_estudiante`,`id_materia`,`id_periodo`,`id_clase`),
  KEY `id_materia` (`id_materia`),
  KEY `id_clase` (`id_clase`),
  KEY `idx_resultados_periodo` (`id_periodo`,`nota_acumulada`),
  CONSTRAINT `fk_resultperiodos_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_resultperiodos_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_resultperiodos_periodo` FOREIGN KEY (`id_periodo`) REFERENCES `periodos_academicos` (`id_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultados_periodos`
--

LOCK TABLES `resultados_periodos` WRITE;
/*!40000 ALTER TABLE `resultados_periodos` DISABLE KEYS */;
INSERT INTO `resultados_periodos` VALUES (1,1,1,1,1,8.50,'2026-08-15 00:30:23','2026-08-15 01:12:21'),(2,1,2,1,1,8.60,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(3,1,3,1,1,7.80,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(4,1,4,1,1,8.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(5,1,5,1,1,8.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(6,1,6,1,1,8.40,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(7,2,1,1,1,7.30,'2026-08-15 00:30:23','2026-08-15 00:57:51'),(8,2,2,1,1,7.40,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(9,2,3,1,1,7.20,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(10,2,4,1,1,7.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(11,2,5,1,1,8.10,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(12,2,6,1,1,6.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(13,7,1,1,1,9.00,'2026-08-15 00:30:23','2026-08-15 00:57:51'),(14,7,2,1,1,8.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(15,7,3,1,1,8.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(16,7,4,1,1,9.20,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(17,7,5,1,1,8.80,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(18,7,6,1,1,8.50,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(19,8,1,1,1,10.00,'2026-08-15 00:30:23','2026-08-15 00:57:51'),(20,8,2,1,1,7.10,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(21,8,3,1,1,6.80,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(22,8,4,1,1,7.40,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(23,8,5,1,1,7.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(24,8,6,1,1,7.20,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(25,9,1,2,1,8.40,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(26,9,2,2,1,8.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(27,9,3,2,1,8.20,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(28,9,4,2,1,8.70,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(29,9,5,2,1,8.50,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(30,10,1,2,1,7.20,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(31,10,2,2,1,7.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(32,10,3,2,1,7.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(33,10,4,2,1,7.40,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(34,10,5,2,1,7.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(35,3,7,3,1,7.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(36,3,8,3,1,8.20,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(37,3,5,3,1,7.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(38,3,6,3,1,8.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(39,11,7,3,1,7.10,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(40,11,8,3,1,7.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(41,11,5,3,1,7.60,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(42,11,6,3,1,7.30,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(43,12,7,3,1,9.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(44,12,8,3,1,9.30,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(45,12,5,3,1,8.80,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(46,12,6,3,1,8.60,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(47,13,7,4,1,8.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(48,13,8,4,1,8.30,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(49,14,7,4,1,7.40,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(50,14,8,4,1,7.10,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(51,6,7,4,1,8.40,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(52,6,8,4,1,8.10,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(53,15,7,5,1,9.10,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(54,15,8,5,1,9.40,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(55,16,7,5,1,8.20,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(56,16,8,5,1,8.50,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(57,4,10,6,1,7.80,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(58,4,11,6,1,8.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(59,4,5,6,1,8.20,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(60,4,6,6,1,7.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(61,17,10,6,1,8.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(62,17,11,6,1,8.30,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(63,17,5,6,1,7.70,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(64,17,6,6,1,8.10,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(65,18,10,6,1,6.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(66,18,11,6,1,7.20,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(67,18,5,6,1,7.40,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(68,18,6,6,1,7.00,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(69,5,12,7,1,8.20,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(70,5,13,7,1,8.10,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(71,19,12,7,1,7.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(72,19,13,7,1,8.40,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(73,20,12,7,1,8.10,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(74,20,13,7,1,7.80,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(75,21,7,8,1,8.70,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(76,21,8,8,1,8.90,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(77,21,5,8,1,7.80,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(78,22,7,8,1,7.50,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(79,22,8,8,1,7.30,'2026-08-15 00:30:23','2026-08-15 00:30:23'),(80,22,5,8,1,7.10,'2026-08-15 00:30:23','2026-08-15 00:30:23');
/*!40000 ALTER TABLE `resultados_periodos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `resumen_aspirantes`
--

DROP TABLE IF EXISTS `resumen_aspirantes`;
/*!50001 DROP VIEW IF EXISTS `resumen_aspirantes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `resumen_aspirantes` AS SELECT 
 1 AS `estado`,
 1 AS `total`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL,
  `nombre_rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `nivel_acceso` int DEFAULT '1',
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','Acceso total al sistema',1,1),(2,'Director','Acceso a todo excepto configuracion',2,1),(3,'Sub Director','Acceso limitado a gestion academica',3,1),(4,'Registro Academico','Todos los permisos de gestion academica',2,1),(5,'Coordinador','Supervision de docentes y materias',4,1),(6,'Docente','Solo puede calificar y ver sus materias',5,1),(7,'Estudiante','Solo puede consultar notas, horarios y avisos',6,1),(8,'Encargado','Padres o tutores de estudiantes',6,1);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secciones`
--

DROP TABLE IF EXISTS `secciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `secciones` (
  `id_seccion` int NOT NULL AUTO_INCREMENT,
  `nombre_seccion` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_seccion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `secciones`
--

LOCK TABLES `secciones` WRITE;
/*!40000 ALTER TABLE `secciones` DISABLE KEYS */;
INSERT INTO `secciones` VALUES (1,'A',1),(2,'B',1);
/*!40000 ALTER TABLE `secciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones_usuarios`
--

DROP TABLE IF EXISTS `sesiones_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones_usuarios` (
  `id_sesion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `usuario` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `ip` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_fin` datetime DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sesion`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_usuarios`
--

LOCK TABLES `sesiones_usuarios` WRITE;
/*!40000 ALTER TABLE `sesiones_usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesiones_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_equipo`
--

DROP TABLE IF EXISTS `solicitudes_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_equipo` (
  `id_solicitud` int NOT NULL,
  `id_solicitante` int DEFAULT NULL,
  `tipo_solicitante` enum('Docente','Estudiante','Administrativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `nombre_solicitante` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `equipo_solicitado` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `cantidad` int DEFAULT '1',
  `fecha_solicitud` date DEFAULT NULL,
  `fecha_devolucion` date DEFAULT NULL,
  `estado_equipo` enum('Bueno','Regular','Malo','En Reparacion') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Bueno',
  `observacion_equipo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `estado_solicitud` enum('Pendiente','Aprobada','Rechazada','Entregado','Devuelto') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT 'Pendiente',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `aprobado_por` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_solicitud`),
  KEY `fk_solicitudes_docente` (`id_solicitante`),
  CONSTRAINT `fk_solicitudes_docente` FOREIGN KEY (`id_solicitante`) REFERENCES `docentes` (`id_docente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_equipo`
--

LOCK TABLES `solicitudes_equipo` WRITE;
/*!40000 ALTER TABLE `solicitudes_equipo` DISABLE KEYS */;
/*!40000 ALTER TABLE `solicitudes_equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipodocumentos`
--

DROP TABLE IF EXISTS `tipodocumentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipodocumentos` (
  `id_documento` int NOT NULL,
  `TipoDocumento` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipodocumentos`
--

LOCK TABLES `tipodocumentos` WRITE;
/*!40000 ALTER TABLE `tipodocumentos` DISABLE KEYS */;
INSERT INTO `tipodocumentos` VALUES (1,'Partida de Nacimiento'),(2,'Carnet de Menoridad'),(3,'DUI'),(4,'Notas de 9 Grado'),(5,'Certificado de Conducta');
/*!40000 ALTER TABLE `tipodocumentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `apellidos` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `correo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `contrasena` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `rol_id` int NOT NULL,
  `id_referencia` int DEFAULT NULL,
  `tipo_referencia` enum('docente','estudiante','persona') COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_usuarios_codigo` (`codigo`),
  KEY `idx_usuarios_rol_id` (`rol_id`),
  KEY `idx_usuarios_id_referencia` (`id_referencia`),
  KEY `idx_usuarios_correo` (`correo`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','Administrador','del Sistema','admin@ina.edu.sv','$2a$11$bWtGBM9DWGJHIc9SWheVceDnLjiyPfCW3fFqi8ks.PJDzdiCJ.ymO',1,NULL,NULL,1),(2,'DIR001','Juan Carlos','Perez Rodriguez','direccion@ina.edu.sv','$2a$11$6iEhqDI1/yUmeSB3JjvfP.bnv6AW1yoXCPJWCKUL69hz8BB3WKeEa',2,NULL,NULL,1),(3,'REG001','Ana Maria','Lopez Castro','registro@ina.edu.sv','$2a$11$vrNXPdDJ4jYTkoKB.T3W2O/ZBQd3Zs3Hdyu17ZYyZzdnA8qSpJpbO',4,NULL,NULL,1),(4,'DOC001','Maria Elena','Rodriguez Castro','docente@ina.edu.sv','$2a$11$UfT7jEtzhOQTLVj0FomEAuJo.TKTfjCqsTehWl8dKGf2Y3oM/GHWC',6,1,'docente',1),(5,'2026-00001-INA','Ana Lucia','Perez Gomez','estudiante@ina.edu.sv','$2a$11$luOIw86cBHk8pstAPrWJuOJ8hLzn6ea3LRn/4J.gvFwIhWILqctIW',7,1,'estudiante',1),(6,'ENC001','Luis Alberto','Perez Martinez','encargado@google.com','$2a$11$u6Se/jUi5OdRAlOwyDTgxOxaBFTDSGEUuBpY1PYvntCP23kYipJVy',8,1,'persona',1),(7,'2026-00002-INA','jose','perez','josesito@gmail.com','$2a$11$hBMoA.hf4qaOiGTUWYty5OuyEOe1qFIvkxE4y0PvJ/RR1Z2EC8.uK',7,2,'estudiante',1),(8,'DIR002','Oscar','Cortez','Oscar@gmail.com','$2a$11$lkRXxePsGnWyYqSb3hmrw.w1jrJjgkR94yc2BX66ZuS4GS6mjX97y',3,NULL,NULL,1),(9,'2026-00010-INA','José Efraín','Pérez Argueta','jose19morado@gmail.com','$2a$11$9wFYjookN3BUkx5zXyt/.Oz1l5IYeItsom6cz5jMh0BWutm3d5bom',7,3,'estudiante',1),(10,'2026-00013-INA','Ian Andrew','Bonilla Hernandez','owenmejia12@gmail.com','$2a$11$HuJG7vIquzaVscAysCNTi.ETONt8RXXk2DWJcrZI3JcvJOukyrrDK',7,4,'estudiante',1),(11,'2026-00103-INA','FELIPE MEDRANO','BONILLA SUAREZ','santamariamadrededios@gmail.com','$2a$11$KNMhx8Z62Umrta38ARollu0vuqn5MHgtvICwXTQNflMMQLEO6.aM2',7,5,'estudiante',1),(12,'TEMPQA01','QA Test','Temp','qa@temp.local','$2a$11$oxxIUG2c6RpzbOGDJEjCYOwGC5yLnyiMyxCUVGaxWJ6Iw3QZreXLC',2,NULL,NULL,0),(13,'TEMPQA03','QA','Temp','qa3@temp.local','$2a$11$6J0FBqUKkzc8fdJwdl9unuoc91ES7gsWwM4rMoC9nXdmGoq9Y86Mq',2,NULL,NULL,0),(14,'2026-00127-INA','Juan Jose','Hernández Perez','juan19morado@gmail.com','$2a$11$2.//pWZAnnduRWoYdmIW0.WpYcishRCSh/VEnQmKxUTW7KpJ6urGy',7,6,'estudiante',1),(15,'2026-00025-INA','Luis Eduardo','Mejia Benavides','luis.mejia@correo.com','$2a$11$/nZ5RtVvZlhYdQcuc1r38uqSSuGXgRLksum5Rsx3yQcO3152UIktS',7,NULL,NULL,1),(16,'2026-00026-INA','Karen Noemi','Ayala Martinez','karen.ayala@correo.com','$2a$11$zckTQ8g0bEJ528EO654qsuJ.NB1yO/RyY5x2ZkYGG56/.Hqiy1QG2',7,NULL,NULL,1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_actividades_periodos`
--

DROP TABLE IF EXISTS `v_actividades_periodos`;
/*!50001 DROP VIEW IF EXISTS `v_actividades_periodos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_actividades_periodos` AS SELECT 
 1 AS `id_actividad`,
 1 AS `nombre_actividad`,
 1 AS `tipo_actividad`,
 1 AS `fecha_publicacion`,
 1 AS `fecha_limite`,
 1 AS `estado`,
 1 AS `id_clase`,
 1 AS `id_materia`,
 1 AS `id_docente`,
 1 AS `id_periodo`,
 1 AS `numero_periodo`,
 1 AS `nombre_periodo`,
 1 AS `ponderacion_periodo`,
 1 AS `ponderacion_total_periodo`,
 1 AS `total_calificados`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_auditoria_completa`
--

DROP TABLE IF EXISTS `v_auditoria_completa`;
/*!50001 DROP VIEW IF EXISTS `v_auditoria_completa`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_auditoria_completa` AS SELECT 
 1 AS `tipo_cambio`,
 1 AS `id_auditoria`,
 1 AS `fecha`,
 1 AS `docente_nombres`,
 1 AS `docente_apellidos`,
 1 AS `estudiante`,
 1 AS `nombre_materia`,
 1 AS `nota_anterior`,
 1 AS `nota_nueva`,
 1 AS `motivo_cambio`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_boleta_estudiante`
--

DROP TABLE IF EXISTS `v_boleta_estudiante`;
/*!50001 DROP VIEW IF EXISTS `v_boleta_estudiante`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_boleta_estudiante` AS SELECT 
 1 AS `id_estudiante`,
 1 AS `codigo_estudiante`,
 1 AS `nie`,
 1 AS `estudiante`,
 1 AS `nombre_clase`,
 1 AS `seccion`,
 1 AS `id_especialidad`,
 1 AS `nombre_especialidad`,
 1 AS `anio_lectivo`,
 1 AS `mat_P1`,
 1 AS `mat_P2`,
 1 AS `mat_P3`,
 1 AS `mat_P4`,
 1 AS `mat_nota_final`,
 1 AS `mat_estado`,
 1 AS `total_dias`,
 1 AS `presentes`,
 1 AS `ausencias`,
 1 AS `tardanzas`,
 1 AS `justificadas`,
 1 AS `porcentaje_asistencia`,
 1 AS `calificacion_conducta`,
 1 AS `conducta_observaciones`,
 1 AS `materias_aprobadas`,
 1 AS `materias_reprobadas`,
 1 AS `materias_recuperacion`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_estudiantes_por_encargado`
--

DROP TABLE IF EXISTS `v_estudiantes_por_encargado`;
/*!50001 DROP VIEW IF EXISTS `v_estudiantes_por_encargado`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_estudiantes_por_encargado` AS SELECT 
 1 AS `id_persona`,
 1 AS `encargado_nombres`,
 1 AS `encargado_apellidos`,
 1 AS `id_estudiante`,
 1 AS `estudiante_nombres`,
 1 AS `estudiante_apellidos`,
 1 AS `codigo_estudiante`,
 1 AS `parentesco`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_historial_estudiante`
--

DROP TABLE IF EXISTS `v_historial_estudiante`;
/*!50001 DROP VIEW IF EXISTS `v_historial_estudiante`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_historial_estudiante` AS SELECT 
 1 AS `id_estudiante`,
 1 AS `codigo_estudiante`,
 1 AS `nombres`,
 1 AS `apellidos`,
 1 AS `nombre_clase`,
 1 AS `seccion`,
 1 AS `anio_lectivo`,
 1 AS `numero_periodo`,
 1 AS `periodo_nombre`,
 1 AS `nombre_materia`,
 1 AS `nota_periodo`,
 1 AS `nota_final`,
 1 AS `estado_materia`,
 1 AS `porcentaje_asistencia`,
 1 AS `calificacion_conducta`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_notas_estudiante_materia`
--

DROP TABLE IF EXISTS `v_notas_estudiante_materia`;
/*!50001 DROP VIEW IF EXISTS `v_notas_estudiante_materia`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_notas_estudiante_materia` AS SELECT 
 1 AS `id_estudiante`,
 1 AS `codigo_estudiante`,
 1 AS `nie`,
 1 AS `estudiante`,
 1 AS `id_materia`,
 1 AS `nombre_materia`,
 1 AS `tipo_materia`,
 1 AS `nombre_clase`,
 1 AS `seccion`,
 1 AS `anio_lectivo`,
 1 AS `numero_periodo`,
 1 AS `nombre_periodo`,
 1 AS `nota_acumulada`,
 1 AS `nota_final`,
 1 AS `estado_materia`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_notas_estudiante_periodo`
--

DROP TABLE IF EXISTS `v_notas_estudiante_periodo`;
/*!50001 DROP VIEW IF EXISTS `v_notas_estudiante_periodo`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_notas_estudiante_periodo` AS SELECT 
 1 AS `id_estudiante`,
 1 AS `codigo_estudiante`,
 1 AS `estudiante`,
 1 AS `id_clase`,
 1 AS `nombre_clase`,
 1 AS `seccion`,
 1 AS `id_materia`,
 1 AS `nombre_materia`,
 1 AS `id_periodo`,
 1 AS `numero_periodo`,
 1 AS `nombre_periodo`,
 1 AS `nota_periodo`,
 1 AS `actividades_entregadas`,
 1 AS `total_actividades_periodo`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_notas_finales_periodos`
--

DROP TABLE IF EXISTS `vista_notas_finales_periodos`;
/*!50001 DROP VIEW IF EXISTS `vista_notas_finales_periodos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_notas_finales_periodos` AS SELECT 
 1 AS `id_estudiante`,
 1 AS `codigo_estudiante`,
 1 AS `nombres`,
 1 AS `apellidos`,
 1 AS `nombre_clase`,
 1 AS `nombre_materia`,
 1 AS `tipo_materia`,
 1 AS `periodo_1`,
 1 AS `periodo_2`,
 1 AS `periodo_3`,
 1 AS `periodo_4`,
 1 AS `nota_final`,
 1 AS `nota_minima`,
 1 AS `estado_final`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'sistema_academico'
--
/*!50003 DROP FUNCTION IF EXISTS `esta_aprobado` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `esta_aprobado`(`p_id_estudiante` INT, `p_id_materia` INT, `p_anio_lectivo` YEAR) RETURNS varchar(10) CHARSET utf8mb4 COLLATE utf8mb4_spanish_ci
    DETERMINISTIC
BEGIN
    DECLARE v_nota_final DECIMAL(5,2);
    DECLARE v_nota_minima DECIMAL(5,2);
    
    SELECT ROUND(AVG(rp.nota_acumulada), 2) INTO v_nota_final
    FROM `resultados_periodos` rp
    INNER JOIN `periodos_academicos` p ON rp.id_periodo = p.id_periodo
    WHERE p.anio_lectivo = p_anio_lectivo
    AND rp.id_estudiante = p_id_estudiante
    AND rp.id_materia = p_id_materia;
    
    SELECT CASE WHEN m.tipo_materia = 'Basica' THEN 6.00 ELSE 4.00 END INTO v_nota_minima
    FROM `materias` m
    WHERE m.id_materia = p_id_materia;
    
    IF v_nota_final >= v_nota_minima THEN RETURN 'SI'; ELSE RETURN 'NO'; END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_generar_constancia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_generar_constancia`(`p_id_estudiante` INT, `p_nombre_plantilla` VARCHAR(50), `p_id_periodo` INT) RETURNS text CHARSET utf8mb4 COLLATE utf8mb4_spanish_ci
    DETERMINISTIC
BEGIN
    DECLARE v_plantilla TEXT;
    DECLARE v_titulo VARCHAR(200);
    DECLARE v_pie TEXT;
    DECLARE v_resultado TEXT;
    
    -- Variables del estudiante
    DECLARE v_nombre_completo VARCHAR(200);
    DECLARE v_nie VARCHAR(20);
    DECLARE v_grado VARCHAR(50);
    DECLARE v_seccion VARCHAR(5);
    DECLARE v_especialidad VARCHAR(150);
    DECLARE v_anio_lectivo YEAR;
    DECLARE v_calificacion_conducta VARCHAR(30);
    DECLARE v_detalle_conducta TEXT;
    DECLARE v_expediente VARCHAR(50);
    
    -- 1. Obtener la plantilla
    SELECT cuerpo, titulo, pie INTO v_plantilla, v_titulo, v_pie
    FROM plantillas_constancias
    WHERE nombre_plantilla = p_nombre_plantilla;
    
    -- 2. Obtener datos del estudiante
    SELECT 
        CONCAT(e.nombres, ' ', e.apellidos),
        e.nie,
        g.nombre_grado,
        c.seccion,
        COALESCE(esp.nombre_especialidad, 'Bachillerato General'),
        i.anio_lectivo,
        i.numero_expediente
    INTO 
        v_nombre_completo,
        v_nie,
        v_grado,
        v_seccion,
        v_especialidad,
        v_anio_lectivo,
        v_expediente
    FROM estudiantes e
    JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
    JOIN clases c ON i.id_clase = c.id_clase
    JOIN grados g ON c.id_grado = g.id_grados
    LEFT JOIN especialidades esp ON c.id_especialidad = esp.id_especialidad
    WHERE e.id_estudiante = p_id_estudiante
    AND i.anio_lectivo = YEAR(CURDATE())
    LIMIT 1;
    
    -- 3. Si es constancia de conducta, obtener la calificación
    IF p_nombre_plantilla = 'conducta' AND p_id_periodo IS NOT NULL THEN
        SELECT 
            cp.calificacion_conducta,
            cp.observaciones
        INTO 
            v_calificacion_conducta,
            v_detalle_conducta
        FROM conducta_periodos cp
        WHERE cp.id_estudiante = p_id_estudiante
        AND cp.id_periodo = p_id_periodo;
    END IF;
    
    -- 4. Reemplazar variables en la plantilla
    SET v_resultado = v_plantilla;
    
    -- Reemplazos comunes
    SET v_resultado = REPLACE(v_resultado, '{{nombre_completo}}', v_nombre_completo);
    SET v_resultado = REPLACE(v_resultado, '{{nie}}', IFNULL(v_nie, 'No registrado'));
    SET v_resultado = REPLACE(v_resultado, '{{grado}}', v_grado);
    SET v_resultado = REPLACE(v_resultado, '{{seccion}}', v_seccion);
    SET v_resultado = REPLACE(v_resultado, '{{especialidad}}', v_especialidad);
    SET v_resultado = REPLACE(v_resultado, '{{anio_lectivo}}', v_anio_lectivo);
    SET v_resultado = REPLACE(v_resultado, '{{expediente}}', IFNULL(v_expediente, 'En trámite'));
    
    -- Reemplazos específicos para conducta
    SET v_resultado = REPLACE(v_resultado, '{{calificacion_conducta}}', IFNULL(v_calificacion_conducta, 'No registrada'));
    SET v_resultado = REPLACE(v_resultado, '{{periodo}}', p_id_periodo);
    SET v_resultado = REPLACE(v_resultado, '{{detalle_conducta}}', IFNULL(v_detalle_conducta, 'Sin observaciones específicas'));
    
    -- 5. Agregar título y pie
    SET v_resultado = CONCAT(v_titulo, '\n\n', v_resultado, '\n\n', v_pie);
    
    RETURN v_resultado;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `obtener_nota_final` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `obtener_nota_final`(`p_id_estudiante` INT, `p_id_materia` INT, `p_anio_lectivo` YEAR) RETURNS decimal(5,2)
    DETERMINISTIC
BEGIN
    DECLARE v_nota_final DECIMAL(5,2);
    
    SELECT ROUND(AVG(rp.nota_acumulada), 2) INTO v_nota_final
    FROM `resultados_periodos` rp
    INNER JOIN `periodos_academicos` p ON rp.id_periodo = p.id_periodo
    WHERE p.anio_lectivo = p_anio_lectivo
    AND rp.id_estudiante = p_id_estudiante
    AND rp.id_materia = p_id_materia;
    
    RETURN IFNULL(v_nota_final, 0);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `actualizar_resultados_finales_desde_periodos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizar_resultados_finales_desde_periodos`(IN `p_anio_lectivo` YEAR)
BEGIN
    DECLARE v_id_estudiante INT;
    DECLARE v_id_materia INT;
    DECLARE v_id_clase INT;
    DECLARE v_nota_final DECIMAL(5,2);
    DECLARE v_estado VARCHAR(20);
    DECLARE v_nota_minima DECIMAL(5,2);
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE cur_periodos CURSOR FOR
        SELECT DISTINCT rp.id_estudiante, rp.id_materia, rp.id_clase
        FROM `resultados_periodos` rp
        INNER JOIN `periodos_academicos` p ON rp.id_periodo = p.id_periodo
        WHERE p.anio_lectivo = p_anio_lectivo;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    DELETE FROM `resultados_finales` WHERE anio_lectivo = p_anio_lectivo;
    
    OPEN cur_periodos;
    
    read_loop: LOOP
        FETCH cur_periodos INTO v_id_estudiante, v_id_materia, v_id_clase;
        IF done THEN LEAVE read_loop; END IF;
        
        SELECT ROUND(AVG(rp.nota_acumulada), 2) INTO v_nota_final
        FROM `resultados_periodos` rp
        INNER JOIN `periodos_academicos` p ON rp.id_periodo = p.id_periodo
        WHERE p.anio_lectivo = p_anio_lectivo
        AND rp.id_estudiante = v_id_estudiante
        AND rp.id_materia = v_id_materia;
        
        SELECT CASE WHEN m.tipo_materia = 'Basica' THEN 6.00 ELSE 4.00 END INTO v_nota_minima
        FROM `materias` m
        WHERE m.id_materia = v_id_materia;
        
        IF v_nota_final >= v_nota_minima THEN
            SET v_estado = 'Aprobado';
        ELSE
            SET v_estado = 'Reprobado';
        END IF;
        
        INSERT INTO `resultados_finales` (
            id_estudiante, id_materia, id_clase, anio_lectivo, nota_final, estado_materia
        ) VALUES (
            v_id_estudiante, v_id_materia, v_id_clase, p_anio_lectivo, v_nota_final, v_estado
        );
        
    END LOOP;
    
    CLOSE cur_periodos;
    SELECT CONCAT('Resultados finales actualizados para el año ', p_anio_lectivo) AS mensaje;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `aprobar_aspirante` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `aprobar_aspirante`(IN `p_id_aspirante` INT, IN `p_aprobado_por` VARCHAR(100), IN `p_id_clase_asignada` INT)
BEGIN
    DECLARE v_nuevo_estudiante_id INT;
    
    UPDATE aspirantes 
    SET estado_solicitud = 'Aprobado',
        fecha_aprobacion = CURDATE(),
        aprobado_por = p_aprobado_por
    WHERE id_aspirante = p_id_aspirante;
    
    INSERT INTO estudiantes (
        nombres, apellidos, codigo_estudiante,
        dui, nie, id_clase, ano_ingreso, estado
    )
    SELECT 
        nombres, apellidos,
        CONCAT(YEAR(CURDATE()), '-', LPAD(p_id_aspirante, 5, '0'), '-INA'),
        dui, nie,
        p_id_clase_asignada,
        YEAR(CURDATE()),
        1
    FROM aspirantes
    WHERE id_aspirante = p_id_aspirante;
    
    SET v_nuevo_estudiante_id = LAST_INSERT_ID();
    
    INSERT INTO inscripciones (
        id_estudiante, id_clase, anio_lectivo,
        fecha_inscripcion, tipo_inscripcion,
        estado_inscripcion, estado_aprobacion
    ) VALUES (
        v_nuevo_estudiante_id,
        p_id_clase_asignada,
        YEAR(CURDATE()),
        CURDATE(),
        'Nuevo Ingreso',
        'Confirmada',
        'Aprobada'
    );
    
    UPDATE aspirantes 
    SET id_estudiante_generado = v_nuevo_estudiante_id,
        id_inscripcion_generada = LAST_INSERT_ID()
    WHERE id_aspirante = p_id_aspirante;
    
    SELECT v_nuevo_estudiante_id AS nuevo_estudiante_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `calcular_nota_final_desde_periodos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `calcular_nota_final_desde_periodos`(IN `p_anio_lectivo` YEAR, IN `p_id_estudiante` INT, IN `p_id_materia` INT)
BEGIN
    DECLARE v_nota_final DECIMAL(5,2);
    DECLARE v_estado VARCHAR(20);
    DECLARE v_nota_minima DECIMAL(5,2);
    DECLARE v_tipo_materia VARCHAR(20);
    
    SELECT ROUND(AVG(rp.nota_acumulada), 2) INTO v_nota_final
    FROM `resultados_periodos` rp
    INNER JOIN `periodos_academicos` p ON rp.id_periodo = p.id_periodo
    WHERE p.anio_lectivo = p_anio_lectivo
    AND (p_id_estudiante IS NULL OR rp.id_estudiante = p_id_estudiante)
    AND (p_id_materia IS NULL OR rp.id_materia = p_id_materia);
    
    SELECT 
        m.tipo_materia,
        CASE 
            WHEN m.tipo_materia = 'Basica' THEN 6.00
            ELSE 4.00
        END INTO v_tipo_materia, v_nota_minima
    FROM `materias` m
    WHERE m.id_materia = p_id_materia;
    
    IF v_nota_final >= v_nota_minima THEN
        SET v_estado = 'Aprobado';
    ELSE
        SET v_estado = 'Reprobado';
    END IF;
    
    SELECT v_nota_final AS nota_final, v_estado AS estado, v_nota_minima AS nota_minima, v_tipo_materia AS tipo_materia;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `detalle_aspirante` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `detalle_aspirante`(IN `p_id_aspirante` INT)
BEGIN
    SELECT 
        a.*,
        es.nombre_especialidad,
        e.id_estudiante,
        e.codigo_estudiante,
        e.id_clase,
        i.id_inscripciones,
        i.numero_expediente,
        i.numero_carnet,
        i.estado_aprobacion AS inscripcion_estado
    FROM aspirantes a
    LEFT JOIN especialidades es ON a.especialidad_aspira = es.id_especialidad
    LEFT JOIN estudiantes e ON a.id_estudiante_generado = e.id_estudiante
    LEFT JOIN inscripciones i ON a.id_inscripcion_generada = i.id_inscripciones
    WHERE a.id_aspirante = p_id_aspirante;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `espera_aspirante` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `espera_aspirante`(IN `p_id_aspirante` INT, IN `p_entrevistado_por` VARCHAR(100), IN `p_observacion` TEXT)
BEGIN
    -- Validar que el aspirante existe
    IF NOT EXISTS (SELECT 1 FROM aspirantes WHERE id_aspirante = p_id_aspirante) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El aspirante no existe';
    END IF;
    
    UPDATE aspirantes 
    SET estado_solicitud = 'En Espera',
        observaciones = p_observacion,
        entrevistado_por = p_entrevistado_por,
        fecha_entrevista = CURDATE()
    WHERE id_aspirante = p_id_aspirante;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `programar_entrevista` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `programar_entrevista`(IN `p_id_aspirante` INT, IN `p_fecha_entrevista` DATE, IN `p_entrevistador` VARCHAR(100))
BEGIN
    -- Validar que el aspirante existe
    IF NOT EXISTS (SELECT 1 FROM aspirantes WHERE id_aspirante = p_id_aspirante) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El aspirante no existe';
    END IF;
    
    UPDATE aspirantes 
    SET fecha_entrevista = p_fecha_entrevista,
        entrevistado_por = p_entrevistador
    WHERE id_aspirante = p_id_aspirante;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `rechazar_aspirante` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `rechazar_aspirante`(IN `p_id_aspirante` INT, IN `p_rechazado_por` VARCHAR(100), IN `p_motivo` TEXT)
BEGIN
    -- Validar que el aspirante existe
    IF NOT EXISTS (SELECT 1 FROM aspirantes WHERE id_aspirante = p_id_aspirante) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El aspirante no existe';
    END IF;
    
    UPDATE aspirantes 
    SET estado_solicitud = 'Rechazado',
        fecha_aprobacion = CURDATE(),
        aprobado_por = p_rechazado_por,
        observaciones = p_motivo
    WHERE id_aspirante = p_id_aspirante;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_asignar_cupos_especialidad` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_asignar_cupos_especialidad`(IN `p_id_especialidad` INT, IN `p_cupos` INT)
BEGIN
    UPDATE aspirantes 
    SET estado_solicitud = 'Preseleccionado'
    WHERE especialidad_aspira = p_id_especialidad 
    AND nota_examen IS NOT NULL 
    AND estado_solicitud = 'Pendiente'
    LIMIT p_cupos;
    
    SELECT CONCAT('Cupos asignados para especialidad ', p_id_especialidad) AS mensaje;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_calcular_nota_periodo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_calcular_nota_periodo`(IN `p_id_estudiante` INT, IN `p_id_periodo` INT, IN `p_id_clase` INT)
BEGIN
    DECLARE v_nota_total DECIMAL(5,2);
    
    -- Calcular nota ponderada del periodo
    SELECT ROUND(SUM((ca.nota / 100) * ap.ponderacion_periodo), 2) INTO v_nota_total
    FROM calificaciones_actividades ca
    INNER JOIN actividades a ON ca.id_actividad = a.id_actividad
    INNER JOIN actividades_periodos ap ON a.id_actividad = ap.id_actividad
    WHERE ca.id_estudiante = p_id_estudiante
      AND ap.id_periodo = p_id_periodo
      AND a.id_clase = p_id_clase
      AND a.estado = 'Cerrado';
    
    -- Insertar o actualizar en resultados_periodos
    INSERT INTO resultados_periodos (
        id_estudiante, id_materia, id_clase, id_periodo, nota_acumulada
    ) VALUES (
        p_id_estudiante,
        (SELECT DISTINCT id_materia FROM actividades WHERE id_clase = p_id_clase LIMIT 1),
        p_id_clase,
        p_id_periodo,
        IFNULL(v_nota_total, 0)
    ) ON DUPLICATE KEY UPDATE
        nota_acumulada = IFNULL(v_nota_total, 0),
        updated_at = CURRENT_TIMESTAMP;
    
    SELECT IFNULL(v_nota_total, 0) AS nota_periodo;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_calcular_puntaje_seleccion` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_calcular_puntaje_seleccion`(IN `p_id_especialidad` INT)
BEGIN
    -- 1. Calcular puntaje para aspirantes NO exonerados
    UPDATE aspirantes
    SET puntaje_seleccion = ROUND(
        -- Examen: 50%
        (COALESCE(nota_examen, 0) * 0.50) +
        
        -- Notas 9° grado: 30%
        (COALESCE(promedio_final_escuela, 
                  (COALESCE(nota_primer_periodo_escuela, 0) + 
                   COALESCE(nota_segundo_periodo_escuela, 0)) / 2, 0) * 0.30) +
        
        -- Conducta: 20% (convertir texto a número)
        (CASE conducta_escuela
            WHEN 'Excelente' THEN 10
            WHEN 'Muy Bueno' THEN 8.5
            WHEN 'Bueno' THEN 7.0
            WHEN 'Suficiente' THEN 6.0
            ELSE 5.0
         END * 0.20), 2)
    WHERE especialidad_aspira = p_id_especialidad
      AND (exonerado = 0 OR exonerado IS NULL)
      AND (estado_solicitud NOT IN ('Aprobado', 'Rechazado') OR estado_solicitud IS NULL);
    
    -- 2. Exonerados: puntaje máximo (100)
    UPDATE aspirantes
    SET puntaje_seleccion = 100
    WHERE especialidad_aspira = p_id_especialidad
      AND exonerado = 1
      AND (estado_solicitud NOT IN ('Aprobado', 'Rechazado') OR estado_solicitud IS NULL);
    
    SELECT CONCAT('Puntajes calculados para especialidad ', p_id_especialidad) AS mensaje;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_cuadro_resumen_seccion` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cuadro_resumen_seccion`(IN `p_id_clase` INT, IN `p_id_periodo` INT)
BEGIN
    -- PRIMERA PARTE: Cuadro detallado por estudiante
    SELECT 
        e.id_estudiante,
        e.codigo_estudiante,
        CONCAT(e.nombres, ' ', e.apellidos) AS estudiante,
        -- Notas por materia (pivote con CASE)
        ROUND(MAX(CASE WHEN m.nombre_materia = 'Matematicas' THEN rp.nota_acumulada END), 2) AS Matematica,
        ROUND(MAX(CASE WHEN m.nombre_materia = 'Lenguaje' THEN rp.nota_acumulada END), 2) AS Lenguaje,
        ROUND(MAX(CASE WHEN m.nombre_materia = 'Ciencias' THEN rp.nota_acumulada END), 2) AS Ciencias,
        ROUND(MAX(CASE WHEN m.nombre_materia = 'Ingles' THEN rp.nota_acumulada END), 2) AS Ingles,
        ROUND(MAX(CASE WHEN m.nombre_materia = 'Historia' THEN rp.nota_acumulada END), 2) AS Historia,
        -- Promedio general del estudiante en el periodo
        ROUND(AVG(rp.nota_acumulada), 2) AS promedio_general,
        -- Condición
        CASE 
            WHEN AVG(rp.nota_acumulada) >= 6.0 THEN 'Aprobado'
            WHEN AVG(rp.nota_acumulada) BETWEEN 5.0 AND 5.99 THEN 'Recuperacion'
            ELSE 'Reprobado'
        END AS condicion
    FROM estudiantes e
    JOIN inscripciones i ON e.id_estudiante = i.id_estudiante AND i.id_clase = p_id_clase
    JOIN resultados_periodos rp ON e.id_estudiante = rp.id_estudiante AND rp.id_periodo = p_id_periodo
    JOIN materias m ON rp.id_materia = m.id_materia
    GROUP BY e.id_estudiante
    ORDER BY e.apellidos, e.nombres;

    -- SEGUNDA PARTE: Estadísticas globales de la sección
    SELECT 
        COUNT(DISTINCT e.id_estudiante) AS total_estudiantes,
        SUM(CASE WHEN AVG(rp.nota_acumulada) >= 6.0 THEN 1 ELSE 0 END) AS aprobados,
        SUM(CASE WHEN AVG(rp.nota_acumulada) BETWEEN 5.0 AND 5.99 THEN 1 ELSE 0 END) AS recuperacion,
        SUM(CASE WHEN AVG(rp.nota_acumulada) < 5.0 THEN 1 ELSE 0 END) AS reprobados,
        ROUND(AVG(AVG(rp.nota_acumulada)), 2) AS promedio_seccion
    FROM estudiantes e
    JOIN inscripciones i ON e.id_estudiante = i.id_estudiante AND i.id_clase = p_id_clase
    JOIN resultados_periodos rp ON e.id_estudiante = rp.id_estudiante AND rp.id_periodo = p_id_periodo
    GROUP BY e.id_estudiante;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_generar_constancia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_generar_constancia`(IN `p_id_estudiante` INT, IN `p_tipo_constancia` VARCHAR(50), IN `p_id_periodo` INT)
BEGIN
    DECLARE v_constancia TEXT;
    
    -- Validar que el estudiante existe
    IF NOT EXISTS (SELECT 1 FROM estudiantes WHERE id_estudiante = p_id_estudiante) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El estudiante no existe';
    END IF;
    
    -- Validar tipo de constancia
    IF p_tipo_constancia NOT IN ('estudio', 'conducta', 'titulo') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de constancia no válido. Use: estudio, conducta, titulo';
    END IF;
    
    -- Para constancia de conducta, validar periodo
    IF p_tipo_constancia = 'conducta' AND p_id_periodo IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Para constancia de conducta debe especificar el período';
    END IF;
    
    -- Generar la constancia
    SELECT fn_generar_constancia(p_id_estudiante, p_tipo_constancia, p_id_periodo) INTO v_constancia;
    
    -- Mostrar resultado
    SELECT v_constancia AS constancia;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_generar_constancia_formato` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_generar_constancia_formato`(IN `p_id_estudiante` INT, IN `p_tipo_constancia` VARCHAR(50))
BEGIN
    DECLARE v_nombre_completo VARCHAR(200);
    DECLARE v_nie VARCHAR(20);
    DECLARE v_grado VARCHAR(50);
    DECLARE v_seccion VARCHAR(5);
    DECLARE v_especialidad VARCHAR(150);
    DECLARE v_anio_lectivo YEAR;
    DECLARE v_promedio_general DECIMAL(5,2);
    DECLARE v_conducta VARCHAR(30);
    
    -- Obtener datos del estudiante
    SELECT 
        CONCAT(e.nombres, ' ', e.apellidos),
        e.nie,
        g.nombre_grado,
        c.seccion,
        COALESCE(esp.nombre_especialidad, 'Bachillerato General'),
        i.anio_lectivo
    INTO 
        v_nombre_completo,
        v_nie,
        v_grado,
        v_seccion,
        v_especialidad,
        v_anio_lectivo
    FROM estudiantes e
    JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
    JOIN clases c ON i.id_clase = c.id_clase
    JOIN grados g ON c.id_grado = g.id_grados
    LEFT JOIN especialidades esp ON c.id_especialidad = esp.id_especialidad
    WHERE e.id_estudiante = p_id_estudiante
    AND i.anio_lectivo = YEAR(CURDATE());
    
    -- Para constancia de conducta, obtener la calificación
    IF p_tipo_constancia = 'conducta' THEN
        SELECT calificacion_conducta INTO v_conducta
        FROM conducta_periodos cp
        WHERE cp.id_estudiante = p_id_estudiante
        ORDER BY cp.id_periodo DESC
        LIMIT 1;
    END IF;
    
    -- Constancia de estudio
    IF p_tipo_constancia = 'estudio' THEN
        SELECT CONCAT(
            'INSTITUTO NACIONAL DE APOPA\n',
            '====================================\n',
            'CONSTANCIA DE ESTUDIO\n',
            '====================================\n\n',
            'El Director del Instituto Nacional de Apopa,\n',
            'HACE CONSTAR:\n\n',
            'Que el(la) estudiante ', v_nombre_completo, ',\n',
            'con NIE: ', IFNULL(v_nie, 'No registrado'), ',\n',
            'cursa actualmente el ', v_grado, ' sección "', v_seccion, '"\n',
            'en la especialidad de ', v_especialidad, '.\n\n',
            'Se extiende la presente constancia para los fines\n',
            'que al interesado convengan.\n\n',
            'Fecha: ', DATE_FORMAT(NOW(), '%d de %m de %Y'), '\n\n\n',
            '_______________________________________\n',
            'Director(a) del Centro Educativo'
        ) AS constancia;
    
    -- Constancia de conducta
    ELSEIF p_tipo_constancia = 'conducta' THEN
        SELECT CONCAT(
            'INSTITUTO NACIONAL DE APOPA\n',
            '====================================\n',
            'CONSTANCIA DE CONDUCTA\n',
            '====================================\n\n',
            'El Director del Instituto Nacional de Apopa,\n',
            'CERTIFICA:\n\n',
            'Que el(la) estudiante ', v_nombre_completo, ',\n',
            'con NIE: ', IFNULL(v_nie, 'No registrado'), ',\n',
            'ha mantenido una conducta calificada como: ', IFNULL(v_conducta, 'Buena'), '\n\n',
            'Se extiende la presente constancia para los fines\n',
            'que al interesado convengan.\n\n',
            'Fecha: ', DATE_FORMAT(NOW(), '%d de %m de %Y'), '\n\n\n',
            '_______________________________________\n',
            'Director(a) del Centro Educativo'
        ) AS constancia;
    
    -- Constancia de trámite de título
    ELSEIF p_tipo_constancia = 'titulo' THEN
        SELECT CONCAT(
            'INSTITUTO NACIONAL DE APOPA\n',
            '====================================\n',
            'CONSTANCIA DE TRÁMITE DE TÍTULO\n',
            '====================================\n\n',
            'El Director del Instituto Nacional de Apopa,\n',
            'CERTIFICA:\n\n',
            'Que el(la) estudiante ', v_nombre_completo, ',\n',
            'con NIE: ', IFNULL(v_nie, 'No registrado'), ',\n',
            'ha culminado sus estudios en ', v_especialidad, '\n',
            'en el año lectivo ', v_anio_lectivo, '.\n\n',
            'Su título se encuentra actualmente en trámite ante\n',
            'el Ministerio de Educación.\n\n',
            'Se extiende la presente constancia para los fines\n',
            'académicos que al interesado convengan.\n\n',
            'Fecha: ', DATE_FORMAT(NOW(), '%d de %m de %Y'), '\n\n\n',
            '_______________________________________\n',
            'Director(a) del Centro Educativo'
        ) AS constancia;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_obtener_admitidos_especialidad` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_admitidos_especialidad`(IN `p_id_especialidad` INT, IN `p_cupos` INT)
BEGIN
    -- Primero, asignar cupos
    CALL sp_asignar_cupos_especialidad(p_id_especialidad, p_cupos);
    
    -- Luego, mostrar los admitidos (preseleccionados)
    SELECT 
        a.puesto_aspirante,
        CONCAT(a.nombres, ' ', a.apellidos) AS nombre_completo,
        a.nota_examen,
        a.dui,
        a.nie,
        a.carnet_menoridad,
        a.telefono,
        a.correo,
        a.escuela_procedencia,
        a.promedio_anterior,
        a.estado_solicitud
    FROM aspirantes a
    WHERE a.especialidad_aspira = p_id_especialidad
      AND a.estado_solicitud = 'Preseleccionado'
      AND a.nota_examen IS NOT NULL
    ORDER BY a.puesto_aspirante ASC;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_obtener_lista_espera` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_lista_espera`(IN `p_id_especialidad` INT, IN `p_cupos` INT)
BEGIN
    SELECT 
        a.puesto_aspirante,
        CONCAT(a.nombres, ' ', a.apellidos) AS nombre_completo,
        a.nota_examen,
        a.dui,
        a.nie,
        a.telefono,
        a.correo
    FROM aspirantes a
    WHERE a.especialidad_aspira = p_id_especialidad
      AND a.estado_solicitud = 'Pendiente'
      AND a.nota_examen IS NOT NULL
      AND a.puesto_aspirante > p_cupos
    ORDER BY a.puesto_aspirante ASC;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_nota_examen` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_nota_examen`(IN `p_id_aspirante` INT, IN `p_nota_examen` DECIMAL(5,2))
BEGIN
    UPDATE aspirantes 
    SET nota_examen = p_nota_examen,
        estado_solicitud = 'Pendiente'
    WHERE id_aspirante = p_id_aspirante;
    
    SELECT 'Nota registrada correctamente' AS mensaje;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_validar_ponderacion_periodo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_validar_ponderacion_periodo`(IN `p_id_clase` INT, IN `p_id_periodo` INT, IN `p_ponderacion_nueva` DECIMAL(5,2), IN `p_id_actividad_excluir` INT)
BEGIN
    DECLARE v_total_ponderacion DECIMAL(5,2);
    
    SELECT IFNULL(SUM(ap.ponderacion_periodo), 0) INTO v_total_ponderacion
    FROM actividades a
    INNER JOIN actividades_periodos ap ON a.id_actividad = ap.id_actividad
    WHERE a.id_clase = p_id_clase
      AND ap.id_periodo = p_id_periodo
      AND a.id_actividad != IFNULL(p_id_actividad_excluir, -1)
      AND a.estado != 'Cerrado';
    
    IF (v_total_ponderacion + p_ponderacion_nueva) > 100 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'La ponderación total del periodo excede el 100%';
    END IF;
    
    SELECT v_total_ponderacion AS ponderacion_actual, 
           (100 - v_total_ponderacion) AS ponderacion_disponible;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Current Database: `sistema_academico`
--

USE `sistema_academico`;

--
-- Final view structure for view `aspirantes_aprobados`
--

/*!50001 DROP VIEW IF EXISTS `aspirantes_aprobados`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `aspirantes_aprobados` AS select `a`.`id_aspirante` AS `id_aspirante`,`a`.`nombres` AS `nombres`,`a`.`apellidos` AS `apellidos`,ifnull(`a`.`dui`,ifnull(`a`.`pasaporte`,'Sin documento')) AS `identificacion`,`a`.`nie` AS `nie`,`a`.`carnet_menoridad` AS `carnet_menoridad`,`a`.`fecha_aprobacion` AS `fecha_aprobacion`,`a`.`aprobado_por` AS `aprobado_por`,`e`.`id_estudiante` AS `id_estudiante`,`e`.`codigo_estudiante` AS `codigo_estudiante`,`e`.`nie` AS `estudiante_nie`,`e`.`carnet_menoridad` AS `estudiante_carnet`,`i`.`id_inscripciones` AS `id_inscripciones`,`i`.`numero_expediente` AS `numero_expediente`,`i`.`numero_carnet` AS `numero_carnet` from ((`aspirantes` `a` left join `estudiantes` `e` on((`a`.`id_estudiante_generado` = `e`.`id_estudiante`))) left join `inscripciones` `i` on((`a`.`id_inscripcion_generada` = `i`.`id_inscripciones`))) where (`a`.`estado_solicitud` = 'Aprobado') order by `a`.`fecha_aprobacion` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `aspirantes_espera`
--

/*!50001 DROP VIEW IF EXISTS `aspirantes_espera`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `aspirantes_espera` AS select `a`.`id_aspirante` AS `id_aspirante`,`a`.`nombres` AS `nombres`,`a`.`apellidos` AS `apellidos`,ifnull(`a`.`dui`,ifnull(`a`.`pasaporte`,'Sin documento')) AS `identificacion`,`a`.`fecha_entrevista` AS `fecha_entrevista`,`a`.`entrevistado_por` AS `entrevistado_por`,`a`.`observaciones` AS `observaciones`,`a`.`fecha_solicitud` AS `fecha_solicitud` from `aspirantes` `a` where (`a`.`estado_solicitud` = 'En Espera') order by `a`.`fecha_entrevista` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `aspirantes_pendientes`
--

/*!50001 DROP VIEW IF EXISTS `aspirantes_pendientes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `aspirantes_pendientes` AS select `a`.`id_aspirante` AS `id_aspirante`,`a`.`numero_expediente` AS `numero_expediente`,`a`.`nombres` AS `nombres`,`a`.`apellidos` AS `apellidos`,ifnull(`a`.`dui`,ifnull(`a`.`pasaporte`,'No registrado')) AS `identificacion`,`a`.`nie` AS `nie`,`a`.`carnet_menoridad` AS `carnet_menoridad`,`a`.`correo` AS `correo`,`a`.`telefono` AS `telefono`,`a`.`escuela_procedencia` AS `escuela_procedencia`,`a`.`promedio_anterior` AS `promedio_anterior`,`a`.`nivel_aspira` AS `nivel_aspira`,`es`.`nombre_especialidad` AS `especialidad_aspira`,`a`.`fecha_solicitud` AS `fecha_solicitud`,`a`.`documentos_presentados` AS `documentos_presentados`,(to_days(curdate()) - to_days(`a`.`fecha_solicitud`)) AS `dias_espera` from (`aspirantes` `a` left join `especialidades` `es` on((`a`.`especialidad_aspira` = `es`.`id_especialidad`))) where (`a`.`estado_solicitud` = 'Pendiente') order by `a`.`fecha_solicitud` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `aspirantes_rechazados`
--

/*!50001 DROP VIEW IF EXISTS `aspirantes_rechazados`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `aspirantes_rechazados` AS select `a`.`id_aspirante` AS `id_aspirante`,`a`.`nombres` AS `nombres`,`a`.`apellidos` AS `apellidos`,ifnull(`a`.`dui`,ifnull(`a`.`pasaporte`,'Sin documento')) AS `identificacion`,`a`.`fecha_aprobacion` AS `fecha_rechazo`,`a`.`aprobado_por` AS `rechazado_por`,`a`.`observaciones` AS `motivo_rechazo` from `aspirantes` `a` where (`a`.`estado_solicitud` = 'Rechazado') order by `a`.`fecha_aprobacion` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `estudiantes_aspirantes`
--

/*!50001 DROP VIEW IF EXISTS `estudiantes_aspirantes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `estudiantes_aspirantes` AS select `e`.`id_estudiante` AS `id_estudiante`,`e`.`codigo_estudiante` AS `codigo_estudiante`,`e`.`nombres` AS `nombres`,`e`.`apellidos` AS `apellidos`,`e`.`dui` AS `dui`,`e`.`nie` AS `nie`,`e`.`carnet_menoridad` AS `carnet_menoridad`,`e`.`id_clase` AS `id_clase`,`e`.`ano_ingreso` AS `ano_ingreso`,`e`.`estado` AS `estado`,`e`.`graduado` AS `graduado`,`a`.`id_aspirante` AS `id_aspirante`,`a`.`fecha_aprobacion` AS `fecha_aprobacion`,`a`.`aprobado_por` AS `aprobado_por`,`i`.`numero_expediente` AS `numero_expediente` from ((`estudiantes` `e` join `aspirantes` `a` on((`e`.`id_aspirante_origen` = `a`.`id_aspirante`))) left join `inscripciones` `i` on((`a`.`id_inscripcion_generada` = `i`.`id_inscripciones`))) where (`e`.`id_aspirante_origen` is not null) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `resumen_aspirantes`
--

/*!50001 DROP VIEW IF EXISTS `resumen_aspirantes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `resumen_aspirantes` AS select 'Pendientes' AS `estado`,count(0) AS `total` from `aspirantes` where (`aspirantes`.`estado_solicitud` = 'Pendiente') union all select 'Aprobados' AS `estado`,count(0) AS `total` from `aspirantes` where (`aspirantes`.`estado_solicitud` = 'Aprobado') union all select 'Rechazados' AS `estado`,count(0) AS `total` from `aspirantes` where (`aspirantes`.`estado_solicitud` = 'Rechazado') union all select 'En Espera' AS `estado`,count(0) AS `total` from `aspirantes` where (`aspirantes`.`estado_solicitud` = 'En Espera') union all select 'Total General' AS `estado`,count(0) AS `total` from `aspirantes` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_actividades_periodos`
--

/*!50001 DROP VIEW IF EXISTS `v_actividades_periodos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_actividades_periodos` AS select `a`.`id_actividad` AS `id_actividad`,`a`.`nombre_actividad` AS `nombre_actividad`,`a`.`tipo_actividad` AS `tipo_actividad`,`a`.`fecha_publicacion` AS `fecha_publicacion`,`a`.`fecha_limite` AS `fecha_limite`,`a`.`estado` AS `estado`,`a`.`id_clase` AS `id_clase`,`a`.`id_materia` AS `id_materia`,`a`.`id_docente` AS `id_docente`,`pa`.`id_periodo` AS `id_periodo`,`pa`.`numero_periodo` AS `numero_periodo`,`pa`.`nombre` AS `nombre_periodo`,`ap`.`ponderacion_periodo` AS `ponderacion_periodo`,(select ifnull(sum(`ap2`.`ponderacion_periodo`),0) from (`actividades_periodos` `ap2` join `actividades` `a2` on((`ap2`.`id_actividad` = `a2`.`id_actividad`))) where ((`a2`.`id_clase` = `a`.`id_clase`) and (`ap2`.`id_periodo` = `pa`.`id_periodo`) and (`a2`.`estado` <> 'Cerrado'))) AS `ponderacion_total_periodo`,(select count(0) from `calificaciones_actividades` `ca` where (`ca`.`id_actividad` = `a`.`id_actividad`)) AS `total_calificados` from ((`actividades` `a` join `actividades_periodos` `ap` on((`a`.`id_actividad` = `ap`.`id_actividad`))) join `periodos_academicos` `pa` on((`ap`.`id_periodo` = `pa`.`id_periodo`))) where (`a`.`estado` <> 'Cerrado') order by `pa`.`numero_periodo`,`a`.`fecha_limite` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_auditoria_completa`
--

/*!50001 DROP VIEW IF EXISTS `v_auditoria_completa`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_auditoria_completa` AS select 'calificacion' AS `tipo_cambio`,`an`.`id_audit_nota` AS `id_auditoria`,`an`.`fecha_cambio` AS `fecha`,`d`.`nombres` AS `docente_nombres`,`d`.`apellidos` AS `docente_apellidos`,concat(`e`.`nombres`,' ',`e`.`apellidos`) AS `estudiante`,`m`.`nombre_materia` AS `nombre_materia`,`an`.`nota_anterior` AS `nota_anterior`,`an`.`nota_nueva` AS `nota_nueva`,`an`.`motivo_cambio` AS `motivo_cambio` from (((`auditoria_notas` `an` join `docentes` `d` on((`an`.`id_docente` = `d`.`id_docente`))) join `estudiantes` `e` on((`an`.`id_estudiante` = `e`.`id_estudiante`))) join `materias` `m` on((`an`.`id_materia` = `m`.`id_materia`))) union all select 'recuperacion' AS `tipo_cambio`,`ar`.`id_audit_recuperacion` AS `id_audit_recuperacion`,`ar`.`fecha` AS `fecha`,`d`.`nombres` AS `nombres`,`d`.`apellidos` AS `apellidos`,concat(`e`.`nombres`,' ',`e`.`apellidos`) AS `estudiante`,`m`.`nombre_materia` AS `nombre_materia`,`ar`.`nota_anterior` AS `nota_anterior`,`ar`.`nota_nueva` AS `nota_nueva`,`ar`.`accion` AS `motivo_cambio` from (((`auditoria_recuperaciones` `ar` join `docentes` `d` on((`ar`.`registrado_por` = `d`.`id_docente`))) join `estudiantes` `e` on((`ar`.`id_estudiante` = `e`.`id_estudiante`))) join `materias` `m` on((`ar`.`id_materia` = `m`.`id_materia`))) order by `fecha` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_boleta_estudiante`
--

/*!50001 DROP VIEW IF EXISTS `v_boleta_estudiante`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_boleta_estudiante` AS select `e`.`id_estudiante` AS `id_estudiante`,`e`.`codigo_estudiante` AS `codigo_estudiante`,`e`.`nie` AS `nie`,concat(`e`.`nombres`,' ',`e`.`apellidos`) AS `estudiante`,`c`.`nombre_clase` AS `nombre_clase`,`c`.`seccion` AS `seccion`,`c`.`id_especialidad` AS `id_especialidad`,`esp`.`nombre_especialidad` AS `nombre_especialidad`,`pa`.`anio_lectivo` AS `anio_lectivo`,max((case when ((`p`.`numero_periodo` = 1) and (`rp`.`id_materia` = 1)) then `rp`.`nota_acumulada` end)) AS `mat_P1`,max((case when ((`p`.`numero_periodo` = 2) and (`rp`.`id_materia` = 1)) then `rp`.`nota_acumulada` end)) AS `mat_P2`,max((case when ((`p`.`numero_periodo` = 3) and (`rp`.`id_materia` = 1)) then `rp`.`nota_acumulada` end)) AS `mat_P3`,max((case when ((`p`.`numero_periodo` = 4) and (`rp`.`id_materia` = 1)) then `rp`.`nota_acumulada` end)) AS `mat_P4`,`rf`.`nota_final` AS `mat_nota_final`,`rf`.`estado_materia` AS `mat_estado`,`ar`.`total_dias` AS `total_dias`,`ar`.`presentes` AS `presentes`,`ar`.`ausencias` AS `ausencias`,`ar`.`tardanzas` AS `tardanzas`,`ar`.`justificadas` AS `justificadas`,`ar`.`porcentaje_asistencia` AS `porcentaje_asistencia`,`cp`.`calificacion_conducta` AS `calificacion_conducta`,`cp`.`observaciones` AS `conducta_observaciones`,(select count(0) from `resultados_finales` `rf2` where ((`rf2`.`id_estudiante` = `e`.`id_estudiante`) and (`rf2`.`anio_lectivo` = `pa`.`anio_lectivo`) and (`rf2`.`estado_materia` = 'Aprobado'))) AS `materias_aprobadas`,(select count(0) from `resultados_finales` `rf2` where ((`rf2`.`id_estudiante` = `e`.`id_estudiante`) and (`rf2`.`anio_lectivo` = `pa`.`anio_lectivo`) and (`rf2`.`estado_materia` = 'Reprobado'))) AS `materias_reprobadas`,(select count(0) from `resultados_finales` `rf2` where ((`rf2`.`id_estudiante` = `e`.`id_estudiante`) and (`rf2`.`anio_lectivo` = `pa`.`anio_lectivo`) and (`rf2`.`estado_materia` = 'Recuperacion'))) AS `materias_recuperacion` from (((((((((`estudiantes` `e` join `inscripciones` `i` on((`e`.`id_estudiante` = `i`.`id_estudiante`))) join `clases` `c` on((`i`.`id_clase` = `c`.`id_clase`))) left join `especialidades` `esp` on((`c`.`id_especialidad` = `esp`.`id_especialidad`))) join `periodos_academicos` `pa` on((`pa`.`anio_lectivo` = `i`.`anio_lectivo`))) left join `resultados_periodos` `rp` on(((`rp`.`id_estudiante` = `e`.`id_estudiante`) and (`rp`.`id_clase` = `c`.`id_clase`)))) left join `periodos_academicos` `p` on(((`rp`.`id_periodo` = `p`.`id_periodo`) and (`p`.`anio_lectivo` = `pa`.`anio_lectivo`)))) left join `resultados_finales` `rf` on(((`rf`.`id_estudiante` = `e`.`id_estudiante`) and (`rf`.`id_clase` = `c`.`id_clase`) and (`rf`.`anio_lectivo` = `pa`.`anio_lectivo`) and (`rf`.`id_materia` = 1)))) left join `asistencias_resumen` `ar` on(((`ar`.`id_estudiante` = `e`.`id_estudiante`) and (`ar`.`id_clase` = `c`.`id_clase`) and (`ar`.`anio_lectivo` = `pa`.`anio_lectivo`)))) left join `conducta_periodos` `cp` on(((`cp`.`id_estudiante` = `e`.`id_estudiante`) and (`cp`.`id_periodo` = `p`.`id_periodo`)))) where (`pa`.`anio_lectivo` = year(curdate())) group by `e`.`id_estudiante`,`c`.`id_clase`,`pa`.`anio_lectivo`,`rf`.`nota_final`,`cp`.`calificacion_conducta` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_estudiantes_por_encargado`
--

/*!50001 DROP VIEW IF EXISTS `v_estudiantes_por_encargado`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_estudiantes_por_encargado` AS select `p`.`id_persona` AS `id_persona`,`p`.`nombres` AS `encargado_nombres`,`p`.`apellidos` AS `encargado_apellidos`,`e`.`id_estudiante` AS `id_estudiante`,`e`.`nombres` AS `estudiante_nombres`,`e`.`apellidos` AS `estudiante_apellidos`,`e`.`codigo_estudiante` AS `codigo_estudiante`,`rf`.`parentesco` AS `parentesco` from ((`personas` `p` join `relaciones_familiares` `rf` on((`p`.`id_persona` = `rf`.`id_persona`))) join `estudiantes` `e` on((`rf`.`id_estudiante` = `e`.`id_estudiante`))) where (`rf`.`recibe_comunicados` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_historial_estudiante`
--

/*!50001 DROP VIEW IF EXISTS `v_historial_estudiante`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_historial_estudiante` AS select `e`.`id_estudiante` AS `id_estudiante`,`e`.`codigo_estudiante` AS `codigo_estudiante`,`e`.`nombres` AS `nombres`,`e`.`apellidos` AS `apellidos`,`c`.`nombre_clase` AS `nombre_clase`,`c`.`seccion` AS `seccion`,`pa`.`anio_lectivo` AS `anio_lectivo`,`p`.`numero_periodo` AS `numero_periodo`,`p`.`nombre` AS `periodo_nombre`,`m`.`nombre_materia` AS `nombre_materia`,`rp`.`nota_acumulada` AS `nota_periodo`,`rf`.`nota_final` AS `nota_final`,`rf`.`estado_materia` AS `estado_materia`,`ar`.`porcentaje_asistencia` AS `porcentaje_asistencia`,`cp`.`calificacion_conducta` AS `calificacion_conducta` from (((((((((`estudiantes` `e` join `inscripciones` `i` on((`e`.`id_estudiante` = `i`.`id_estudiante`))) join `clases` `c` on((`i`.`id_clase` = `c`.`id_clase`))) join `periodos_academicos` `pa` on((`pa`.`anio_lectivo` = `i`.`anio_lectivo`))) left join `resultados_periodos` `rp` on(((`rp`.`id_estudiante` = `e`.`id_estudiante`) and (`rp`.`id_clase` = `c`.`id_clase`)))) left join `periodos_academicos` `p` on((`rp`.`id_periodo` = `p`.`id_periodo`))) left join `materias` `m` on((`rp`.`id_materia` = `m`.`id_materia`))) left join `resultados_finales` `rf` on(((`rf`.`id_estudiante` = `e`.`id_estudiante`) and (`rf`.`id_materia` = `m`.`id_materia`) and (`rf`.`anio_lectivo` = `pa`.`anio_lectivo`)))) left join `asistencias_resumen` `ar` on(((`ar`.`id_estudiante` = `e`.`id_estudiante`) and (`ar`.`anio_lectivo` = `pa`.`anio_lectivo`) and (`ar`.`periodo` = `p`.`numero_periodo`)))) left join `conducta_periodos` `cp` on(((`cp`.`id_estudiante` = `e`.`id_estudiante`) and (`cp`.`id_periodo` = `p`.`id_periodo`)))) order by `e`.`id_estudiante`,`pa`.`anio_lectivo`,`p`.`numero_periodo`,`m`.`nombre_materia` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_notas_estudiante_materia`
--

/*!50001 DROP VIEW IF EXISTS `v_notas_estudiante_materia`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_notas_estudiante_materia` AS select `e`.`id_estudiante` AS `id_estudiante`,`e`.`codigo_estudiante` AS `codigo_estudiante`,`e`.`nie` AS `nie`,concat(`e`.`nombres`,' ',`e`.`apellidos`) AS `estudiante`,`m`.`id_materia` AS `id_materia`,`m`.`nombre_materia` AS `nombre_materia`,`m`.`tipo_materia` AS `tipo_materia`,`c`.`nombre_clase` AS `nombre_clase`,`c`.`seccion` AS `seccion`,`pa`.`anio_lectivo` AS `anio_lectivo`,`p`.`numero_periodo` AS `numero_periodo`,`p`.`nombre` AS `nombre_periodo`,`rp`.`nota_acumulada` AS `nota_acumulada`,`rf`.`nota_final` AS `nota_final`,`rf`.`estado_materia` AS `estado_materia` from (((((((`estudiantes` `e` join `inscripciones` `i` on((`e`.`id_estudiante` = `i`.`id_estudiante`))) join `clases` `c` on((`i`.`id_clase` = `c`.`id_clase`))) join `periodos_academicos` `pa` on((`pa`.`anio_lectivo` = `i`.`anio_lectivo`))) join `resultados_periodos` `rp` on(((`rp`.`id_estudiante` = `e`.`id_estudiante`) and (`rp`.`id_clase` = `c`.`id_clase`) and (`rp`.`id_periodo` = `pa`.`id_periodo`)))) join `materias` `m` on((`rp`.`id_materia` = `m`.`id_materia`))) join `periodos_academicos` `p` on((`rp`.`id_periodo` = `p`.`id_periodo`))) left join `resultados_finales` `rf` on(((`rf`.`id_estudiante` = `e`.`id_estudiante`) and (`rf`.`id_clase` = `c`.`id_clase`) and (`rf`.`id_materia` = `m`.`id_materia`) and (`rf`.`anio_lectivo` = `pa`.`anio_lectivo`)))) where (`pa`.`anio_lectivo` = year(curdate())) order by `e`.`apellidos`,`m`.`nombre_materia`,`p`.`numero_periodo` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_notas_estudiante_periodo`
--

/*!50001 DROP VIEW IF EXISTS `v_notas_estudiante_periodo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_notas_estudiante_periodo` AS select `e`.`id_estudiante` AS `id_estudiante`,`e`.`codigo_estudiante` AS `codigo_estudiante`,concat(`e`.`nombres`,' ',`e`.`apellidos`) AS `estudiante`,`c`.`id_clase` AS `id_clase`,`c`.`nombre_clase` AS `nombre_clase`,`c`.`seccion` AS `seccion`,`m`.`id_materia` AS `id_materia`,`m`.`nombre_materia` AS `nombre_materia`,`pa`.`id_periodo` AS `id_periodo`,`pa`.`numero_periodo` AS `numero_periodo`,`pa`.`nombre` AS `nombre_periodo`,round(sum(((`ca`.`nota` / 100) * `ap`.`ponderacion_periodo`)),2) AS `nota_periodo`,count(distinct `ca`.`id_actividad`) AS `actividades_entregadas`,(select count(0) from (`actividades` `a2` join `actividades_periodos` `ap2` on((`a2`.`id_actividad` = `ap2`.`id_actividad`))) where ((`a2`.`id_clase` = `c`.`id_clase`) and (`ap2`.`id_periodo` = `pa`.`id_periodo`) and (`a2`.`estado` <> 'Cerrado'))) AS `total_actividades_periodo` from (((((((`estudiantes` `e` join `inscripciones` `i` on((`e`.`id_estudiante` = `i`.`id_estudiante`))) join `clases` `c` on((`i`.`id_clase` = `c`.`id_clase`))) join `actividades` `a` on((`a`.`id_clase` = `c`.`id_clase`))) join `actividades_periodos` `ap` on((`a`.`id_actividad` = `ap`.`id_actividad`))) join `periodos_academicos` `pa` on((`ap`.`id_periodo` = `pa`.`id_periodo`))) join `materias` `m` on((`a`.`id_materia` = `m`.`id_materia`))) left join `calificaciones_actividades` `ca` on(((`ca`.`id_actividad` = `a`.`id_actividad`) and (`ca`.`id_estudiante` = `e`.`id_estudiante`)))) where ((`i`.`anio_lectivo` = year(curdate())) and (`pa`.`anio_lectivo` = year(curdate()))) group by `e`.`id_estudiante`,`c`.`id_clase`,`m`.`id_materia`,`pa`.`id_periodo` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_notas_finales_periodos`
--

/*!50001 DROP VIEW IF EXISTS `vista_notas_finales_periodos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_notas_finales_periodos` AS select `e`.`id_estudiante` AS `id_estudiante`,`e`.`codigo_estudiante` AS `codigo_estudiante`,`e`.`nombres` AS `nombres`,`e`.`apellidos` AS `apellidos`,`c`.`nombre_clase` AS `nombre_clase`,`m`.`nombre_materia` AS `nombre_materia`,`m`.`tipo_materia` AS `tipo_materia`,max((case when (`p`.`numero_periodo` = 1) then `rp`.`nota_acumulada` end)) AS `periodo_1`,max((case when (`p`.`numero_periodo` = 2) then `rp`.`nota_acumulada` end)) AS `periodo_2`,max((case when (`p`.`numero_periodo` = 3) then `rp`.`nota_acumulada` end)) AS `periodo_3`,max((case when (`p`.`numero_periodo` = 4) then `rp`.`nota_acumulada` end)) AS `periodo_4`,round(avg(`rp`.`nota_acumulada`),2) AS `nota_final`,(case when (`m`.`tipo_materia` = 'Basica') then 6.00 else 4.00 end) AS `nota_minima`,(case when (round(avg(`rp`.`nota_acumulada`),2) >= (case when (`m`.`tipo_materia` = 'Basica') then 6.00 else 4.00 end)) then 'APROBADO' else 'REPROBADO' end) AS `estado_final` from ((((`resultados_periodos` `rp` join `estudiantes` `e` on((`rp`.`id_estudiante` = `e`.`id_estudiante`))) join `clases` `c` on((`rp`.`id_clase` = `c`.`id_clase`))) join `materias` `m` on((`rp`.`id_materia` = `m`.`id_materia`))) join `periodos_academicos` `p` on((`rp`.`id_periodo` = `p`.`id_periodo`))) where (`p`.`anio_lectivo` = 2026) group by `e`.`id_estudiante`,`e`.`codigo_estudiante`,`e`.`nombres`,`e`.`apellidos`,`c`.`nombre_clase`,`m`.`nombre_materia`,`m`.`tipo_materia` order by `e`.`apellidos`,`m`.`nombre_materia` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-14 19:28:57
