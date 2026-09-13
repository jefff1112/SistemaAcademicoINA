-- ============================================================
--  MIGRACIÓN 07: MÓDULO DE DOCUMENTOS DE ESTUDIANTES
--  Sistema Academico INA - DB: sistema_academico (MySQL 8.x)
--  Ejecutar con el usuario root contra la base del sistema:
--      mysql -u root -h 127.0.0.1 -P 3306 sistema_academico < migrations/07_documentos_estudiantes.sql
-- ============================================================

SET NAMES utf8mb4;

-- Documentos de estudiantes: certificados, constancias, partidas de nacimiento, etc.
CREATE TABLE IF NOT EXISTS `documentos_estudiantes` (
  `id_documento` INT NOT NULL AUTO_INCREMENT,
  `id_estudiante` INT NOT NULL,
  `tipo` VARCHAR(80) NOT NULL,
  `nombre` VARCHAR(200) NOT NULL,
  `documento` VARCHAR(300) NULL DEFAULT NULL,
  `nombre_archivo` VARCHAR(200) NULL DEFAULT NULL,
  `fecha` DATE NOT NULL,
  `registrado_por` VARCHAR(50) NULL DEFAULT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_documento`),
  KEY `idx_documento_estudiante` (`id_estudiante`),
  CONSTRAINT `fk_documento_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;