-- ============================================================
--  MIGRACIÓN 04: MÓDULO DE CONSTANCIAS
--  Sistema Academico INA - DB: sistema_academico (MySQL 8.x)
--  Ejecutar con el usuario root contra la base del sistema:
--      mysql -u root -h 127.0.0.1 -P 3306 sistema_academico < migrations/04_constancias.sql
-- ============================================================

SET NAMES utf8mb4;

-- Constancias emitidas a estudiantes (estudio, conducta o incapacidad/permiso).
CREATE TABLE IF NOT EXISTS `constancias` (
  `id_constancia` INT NOT NULL AUTO_INCREMENT,
  `id_estudiante` INT NOT NULL,
  `tipo` VARCHAR(30) NOT NULL DEFAULT 'Estudio',
  `motivo` VARCHAR(500) NULL DEFAULT NULL,
  `fecha_inicio` DATE NULL DEFAULT NULL,
  `cantidad_dias` INT NULL DEFAULT NULL,
  `fecha_fin` DATE NULL DEFAULT NULL,
  `documento` VARCHAR(300) NULL DEFAULT NULL,
  `nombre_archivo` VARCHAR(200) NULL DEFAULT NULL,
  `trajo_documento` TINYINT(1) NOT NULL DEFAULT 0,
  `encargado_presente` TINYINT(1) NOT NULL DEFAULT 0,
  `permiso_asistencias` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha_emision` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `generada_por` VARCHAR(50) NULL DEFAULT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'Activa',
  `observaciones` VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (`id_constancia`),
  KEY `idx_constancia_estudiante` (`id_estudiante`),
  KEY `idx_constancia_estado` (`estado`),
  CONSTRAINT `fk_constancia_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estado original de las asistencias modificadas por el permiso automático (para revertir al anular).
CREATE TABLE IF NOT EXISTS `constancia_asistencia_revert` (
  `id_revert` INT NOT NULL AUTO_INCREMENT,
  `id_constancia` INT NOT NULL,
  `id_asistencia` INT NOT NULL,
  `estado_anterior` VARCHAR(20) NOT NULL DEFAULT 'Presente',
  `creada_por_permiso` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_revert`),
  KEY `idx_revert_constancia` (`id_constancia`),
  CONSTRAINT `fk_revert_constancia` FOREIGN KEY (`id_constancia`) REFERENCES `constancias` (`id_constancia`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_revert_asistencia` FOREIGN KEY (`id_asistencia`) REFERENCES `asistencias` (`id_asistencia`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;