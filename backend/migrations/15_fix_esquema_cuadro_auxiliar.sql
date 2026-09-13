-- ============================================================
-- MIGRACIÓN 15: REPARACIÓN DE ESQUEMA - Cuadro Auxiliar INA
-- ------------------------------------------------------------
-- Corrige la desincronización entre el modelo EF Core y la BD.
--
-- IMPORTANTE: MySQL NO soporta "ADD COLUMN IF NOT EXISTS" ni
-- "CREATE INDEX IF NOT EXISTS" (eso es MariaDB). Esa es la razón
-- por la que las migraciones 13 y 14 fallaron y las columnas
-- nunca se agregaron. Este script es 100% compatible con MySQL 8.
--
-- Es IDEMPOTENTE: se puede re-ejecutar sin error, gracias al
-- procedimiento auxiliar que verifica information_schema antes
-- de agregar cada columna.
--
-- Ejecutar (una sola vez, o cuantas veces se quiera):
--   mysql -u root -h 127.0.0.1 -P 3306 --default-character-set=utf8mb4 sistema_academico < migrations/15_fix_esquema_cuadro_auxiliar.sql
-- ============================================================

SET NAMES utf8mb4;
USE sistema_academico;

-- ============================================================
-- 0. PROCEDIMIENTO AUXILIAR: agrega columna solo si no existe
-- ============================================================
DROP PROCEDURE IF EXISTS add_col;
DELIMITER $$
CREATE PROCEDURE add_col(
  IN p_tabla VARCHAR(64),
  IN p_columna VARCHAR(64),
  IN p_def VARCHAR(256)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_tabla
      AND COLUMN_NAME = p_columna
  ) THEN
    SET @q = CONCAT('ALTER TABLE ', p_tabla, ' ADD COLUMN ', p_columna, ' ', p_def);
    PREPARE s FROM @q;
    EXECUTE s;
    DEALLOCATE PREPARE s;
  END IF;
END$$
DELIMITER ;

-- ============================================================
-- 1. TABLA `actividades` - columnas nuevas del Cuadro Auxiliar
-- ============================================================
CALL add_col('actividades', 'incluir_autoevaluacion',     'BOOLEAN      DEFAULT FALSE');
CALL add_col('actividades', 'incluir_coevaluacion',       'BOOLEAN      DEFAULT FALSE');
CALL add_col('actividades', 'ponderacion_autoevaluacion', 'DECIMAL(5,2) DEFAULT 0');
CALL add_col('actividades', 'ponderacion_coevaluacion',   'DECIMAL(5,2) DEFAULT 0');
CALL add_col('actividades', 'observaciones',              'TEXT');
CALL add_col('actividades', 'es_modulo',                  'BOOLEAN      DEFAULT FALSE');
CALL add_col('actividades', 'numero_orden',               'INT          DEFAULT 0');
CALL add_col('actividades', 'id_periodo',                 'INT          NULL');
CALL add_col('actividades', 'orden',                      'INT          DEFAULT 0');
CALL add_col('actividades', 'es_predeterminada',          'BOOLEAN      DEFAULT FALSE');

-- Ampliar ENUM de tipo_actividad para aceptar 'Evaluación'
-- (valor que inserta la plantilla INA al crear la estructura).
ALTER TABLE actividades
  MODIFY COLUMN tipo_actividad ENUM(
    'Tarea','Examen','Proyecto','Participacion','Otro','Actividad','Modulo','Evaluación'
  ) NOT NULL;

-- ============================================================
-- 2. TABLA `sub_actividades` - columnas + ENUM completo
-- ============================================================
CALL add_col('sub_actividades', 'es_vertical',  'BOOLEAN DEFAULT FALSE');
CALL add_col('sub_actividades', 'numero_orden', 'INT     DEFAULT 0');

-- Ampliar ENUM de tipo_sub_actividad con los tipos del Excel INA.
ALTER TABLE sub_actividades
  MODIFY COLUMN tipo_sub_actividad ENUM(
    'Subactividad','Autoevaluacion','Coevaluacion','ActividadModulo',
    'Numerada','Porcentaje','PruebaObjetiva','RecuperacionModulo'
  ) NOT NULL DEFAULT 'Subactividad';

-- ============================================================
-- 3. TABLA `resultados_periodos` - columnas de módulos/anual
-- ============================================================
CALL add_col('resultados_periodos', 'observacion_recuperacion_anual',  'TEXT NULL');
CALL add_col('resultados_periodos', 'nota_recuperacion_modulo',        'DECIMAL(5,2) NULL');
CALL add_col('resultados_periodos', 'observacion_recuperacion_modulo', 'TEXT NULL');

-- ============================================================
-- 4. TABLA `actividad_plantillas` - columna `estado`
-- (la entidad ActividadPlantilla la mapea y el controller la lee)
-- ============================================================
CALL add_col('actividad_plantillas', 'estado', 'BOOLEAN DEFAULT TRUE');

-- ============================================================
-- 5. TABLA `actividad_plantilla_detalle` - columnas de módulo
-- ============================================================
CALL add_col('actividad_plantilla_detalle', 'es_modulo',    'BOOLEAN DEFAULT FALSE');
CALL add_col('actividad_plantilla_detalle', 'numero_orden', 'INT     DEFAULT 0');

-- ============================================================
-- 6. TABLA `sub_actividad_plantilla_detalle` - columnas de tipo
-- ============================================================
CALL add_col('sub_actividad_plantilla_detalle', 'tipo_sub_actividad', 'VARCHAR(50) DEFAULT ''Subactividad''');
CALL add_col('sub_actividad_plantilla_detalle', 'es_vertical',        'BOOLEAN     DEFAULT FALSE');
CALL add_col('sub_actividad_plantilla_detalle', 'numero_orden',       'INT         DEFAULT 0');

-- Ya no se necesita el procedimiento auxiliar
DROP PROCEDURE IF EXISTS add_col;

-- ============================================================
-- 7. TABLA `recuperaciones_modulo` (no existía)
-- ============================================================
CREATE TABLE IF NOT EXISTS recuperaciones_modulo (
  id_recuperacion_modulo INT AUTO_INCREMENT PRIMARY KEY,
  id_resultado_periodo   INT NOT NULL,
  id_actividad           INT NOT NULL,
  id_estudiante          INT NOT NULL,
  id_periodo             INT NOT NULL,
  id_clase               INT NOT NULL,
  id_especialidad        INT NULL,
  nota_recuperacion      DECIMAL(5,2) CHECK (nota_recuperacion >= 0 AND nota_recuperacion <= 10),
  observacion            TEXT,
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_recmod_resultado_periodo FOREIGN KEY (id_resultado_periodo)
    REFERENCES resultados_periodos(id_resultado_periodo) ON DELETE CASCADE,
  CONSTRAINT fk_recmod_actividad FOREIGN KEY (id_actividad)
    REFERENCES actividades(id_actividad) ON DELETE CASCADE,
  CONSTRAINT fk_recmod_estudiante FOREIGN KEY (id_estudiante)
    REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
  CONSTRAINT fk_recmod_periodo FOREIGN KEY (id_periodo)
    REFERENCES periodos_academicos(id_periodo) ON DELETE CASCADE,
  CONSTRAINT fk_recmod_clase FOREIGN KEY (id_clase)
    REFERENCES clases(id_clase) ON DELETE CASCADE,

  UNIQUE KEY uk_recuperacion_modulo (id_resultado_periodo, id_actividad, id_estudiante),
  INDEX idx_recuperaciones_modulo_lookup (id_resultado_periodo, id_actividad, id_estudiante),
  INDEX idx_recuperaciones_modulo_estudiante (id_estudiante, id_periodo)
);

-- ============================================================
-- 8. LIMPIEZA DE PLANTILLAS DUPLICADAS
-- Deja UNA sola plantilla con es_predeterminada = 1 (la de menor id)
-- ============================================================
UPDATE actividad_plantillas
SET es_predeterminada = 0
WHERE es_predeterminada = 1
  AND id_plantilla <> (
    SELECT m FROM (
      SELECT MIN(id_plantilla) AS m
      FROM actividad_plantillas
      WHERE es_predeterminada = 1
    ) t
  );

-- ============================================================
-- VERIFICACIÓN (opcional, descomentar para revisar)
-- ============================================================
-- SHOW COLUMNS FROM actividades;
-- SHOW COLUMNS FROM sub_actividades;
-- SHOW COLUMNS FROM actividad_plantillas;
-- SHOW COLUMNS FROM actividad_plantilla_detalle;
-- SHOW COLUMNS FROM sub_actividad_plantilla_detalle;
-- SELECT id_plantilla, nombre_plantilla, es_predeterminada, estado FROM actividad_plantillas;

SELECT '=== MIGRACIÓN 15 COMPLETADA ===' AS info;