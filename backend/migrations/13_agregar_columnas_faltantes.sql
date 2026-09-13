-- ============================================================
-- MIGRACIÓN 13: Agregar Columnas Faltantes
-- Soluciona error: Unknown column 'a.es_modulo' in 'field list'
-- ============================================================

USE sistema_academico;

-- ============================================================
-- TABLA: actividades
-- ============================================================

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'es_modulo');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN es_modulo BOOLEAN DEFAULT FALSE COMMENT ''TRUE si es módulo de especialidad''', 'SELECT ''Columna es_modulo ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'es_predeterminada');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN es_predeterminada BOOLEAN DEFAULT FALSE COMMENT ''TRUE si fue creada desde plantilla INA''', 'SELECT ''Columna es_predeterminada ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'especificacion');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN especificacion TEXT NULL COMMENT ''Especificación detallada de la actividad''', 'SELECT ''Columna especificacion ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'incluir_autoevaluacion');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN incluir_autoevaluacion BOOLEAN DEFAULT FALSE', 'SELECT ''Columna incluir_autoevaluacion ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'incluir_coevaluacion');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN incluir_coevaluacion BOOLEAN DEFAULT FALSE', 'SELECT ''Columna incluir_coevaluacion ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'numero_orden');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN numero_orden INT DEFAULT 0 COMMENT ''Número de orden dentro del período''', 'SELECT ''Columna numero_orden ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'orden');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN orden INT DEFAULT 0 COMMENT ''Orden de visualización''', 'SELECT ''Columna orden ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'ponderacion_autoevaluacion');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN ponderacion_autoevaluacion DECIMAL(5,2) DEFAULT 0.00', 'SELECT ''Columna ponderacion_autoevaluacion ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'ponderacion_coevaluacion');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN ponderacion_coevaluacion DECIMAL(5,2) DEFAULT 0.00', 'SELECT ''Columna ponderacion_coevaluacion ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'created_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP', 'SELECT ''Columna created_at ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'updated_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE actividades ADD COLUMN updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP', 'SELECT ''Columna updated_at ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- TABLA: sub_actividades
-- ============================================================

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'sub_actividades' AND COLUMN_NAME = 'es_vertical');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE sub_actividades ADD COLUMN es_vertical BOOLEAN DEFAULT FALSE COMMENT ''TRUE si el texto debe mostrarse vertical (autoevaluación/coevaluación)''', 'SELECT ''Columna es_vertical ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'sub_actividades' AND COLUMN_NAME = 'numero_orden');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE sub_actividades ADD COLUMN numero_orden INT DEFAULT 0', 'SELECT ''Columna numero_orden ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'sub_actividades' AND COLUMN_NAME = 'orden');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE sub_actividades ADD COLUMN orden INT DEFAULT 0', 'SELECT ''Columna orden ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'sub_actividades' AND COLUMN_NAME = 'created_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE sub_actividades ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP', 'SELECT ''Columna created_at ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'sub_actividades' AND COLUMN_NAME = 'updated_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE sub_actividades ADD COLUMN updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP', 'SELECT ''Columna updated_at ya existe'' AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- ACTUALIZAR DATOS EXISTENTES
-- ============================================================

-- Marcar actividades con id_especialidad como módulos
UPDATE actividades SET es_modulo = TRUE WHERE id_especialidad IS NOT NULL;

-- Actualizar numero_orden basado en orden existente
UPDATE actividades SET numero_orden = orden WHERE orden IS NOT NULL AND numero_orden = 0;

-- Marcar sub-actividades de autoevaluación/coevaluación como verticales
UPDATE sub_actividades SET es_vertical = TRUE WHERE tipo_sub_actividad IN ('Autoevaluacion', 'Coevaluacion');

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

SELECT '=== MIGRACIÓN 13 COMPLETADA ===' AS info;

SELECT 'Columnas en actividades' AS tabla, COUNT(*) AS total_columnas
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'actividades';

SELECT 'Columnas en sub_actividades' AS tabla, COUNT(*) AS total_columnas
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'sub_actividades';

SELECT 'Actividades marcadas como módulo' AS info, COUNT(*) AS cantidad
FROM actividades WHERE es_modulo = TRUE;

SELECT 'Sub-actividades verticales' AS info, COUNT(*) AS cantidad
FROM sub_actividades WHERE es_vertical = TRUE;