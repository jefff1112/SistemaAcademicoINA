-- ============================================================
-- MIGRACIÓN 17: Módulos de especialidad
-- ------------------------------------------------------------
-- Los módulos son por ESPECIALIDAD + AÑO (grado). No cambian por
-- clase: todas las clases del mismo nivel/especialidad comparten
-- los mismos módulos.
--
-- IMPORTANTE: las tablas usan ENGINE=InnoDB obligatorio (el motor
-- por defecto del servidor es MyISAM, que NO soporta FOREIGN KEYS).
--
-- Ejecutar (ya aplicado):
--   mysql -u root -h 127.0.0.1 -P 3306 --default-character-set=utf8mb4 sistema_academico < migrations/17_modulos_especialidad.sql
-- ============================================================

SET NAMES utf8mb4;
USE sistema_academico;

-- 1. Tabla modulos (catálogo por especialidad + año)
DROP TABLE IF EXISTS docente_modulos;
DROP TABLE IF EXISTS modulos;

CREATE TABLE modulos (
    id_modulo       INT AUTO_INCREMENT PRIMARY KEY,
    id_especialidad INT NOT NULL,
    numero_grado    INT NOT NULL COMMENT 'Año del bachillerato: 1, 2, 3...',
    numero_modulo   INT NOT NULL COMMENT 'Número del módulo según el plan MINED',
    nombre_modulo   VARCHAR(200) NOT NULL,
    orden           INT DEFAULT 0,
    estado          TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_modulo_especialidad
        FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad) ON DELETE CASCADE,
    UNIQUE KEY uk_modulo_esp_grado_num (id_especialidad, numero_grado, numero_modulo),
    INDEX idx_modulos_especialidad (id_especialidad, numero_grado, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla docente_modulos (asignación docente -> módulo -> clase)
CREATE TABLE docente_modulos (
    id_docente_modulo INT AUTO_INCREMENT PRIMARY KEY,
    id_docente        INT NOT NULL,
    id_modulo         INT NOT NULL,
    id_clase          INT NOT NULL,
    anio_lectivo      INT NOT NULL,
    estado            TINYINT(1) DEFAULT 1,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_docmod_docente FOREIGN KEY (id_docente) REFERENCES docentes(id_docente) ON DELETE CASCADE,
    CONSTRAINT fk_docmod_modulo  FOREIGN KEY (id_modulo)  REFERENCES modulos(id_modulo)  ON DELETE CASCADE,
    CONSTRAINT fk_docmod_clase   FOREIGN KEY (id_clase)   REFERENCES clases(id_clase)    ON DELETE CASCADE,
    UNIQUE KEY uk_docente_modulo_clase (id_docente, id_modulo, id_clase, anio_lectivo),
    INDEX idx_docmod_docente (id_docente, anio_lectivo, estado),
    INDEX idx_docmod_clase (id_clase, anio_lectivo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. actividades.id_modulo (columna + índice + FK), idempotente
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = 'sistema_academico'
                 AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'id_modulo');
SET @sql = IF(@exists = 0, 'ALTER TABLE actividades ADD COLUMN id_modulo INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.STATISTICS
               WHERE TABLE_SCHEMA = 'sistema_academico'
                 AND TABLE_NAME = 'actividades' AND INDEX_NAME = 'idx_actividades_modulo');
SET @sql = IF(@exists = 0, 'ALTER TABLE actividades ADD INDEX idx_actividades_modulo (id_modulo)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
               WHERE CONSTRAINT_SCHEMA = 'sistema_academico'
                 AND TABLE_NAME = 'actividades' AND CONSTRAINT_NAME = 'fk_actividad_modulo');
SET @sql = IF(@exists = 0, 'ALTER TABLE actividades ADD CONSTRAINT fk_actividad_modulo FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Eliminar materias tipo 'Especialidad' (reemplazadas por módulos)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM docente_materias
WHERE id_materia IN (SELECT id_materia FROM materias WHERE tipo_materia = 'Especialidad');
DELETE FROM materias WHERE tipo_materia = 'Especialidad';
SET FOREIGN_KEY_CHECKS = 1;

SELECT '=== MIGRACIÓN 17 COMPLETADA ===' AS info;