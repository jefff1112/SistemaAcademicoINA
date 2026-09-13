-- ============================================================
-- MIGRACIÓN 16: Fix triggers con filtro por id_periodo
-- ------------------------------------------------------------
-- Problema: trg_validar_actividades_100_insert/update sumaban
-- la ponderación de TODOS los períodos (id_clase + id_materia +
-- estado), por lo que al crear actividades en un nuevo período
-- se disparaba "La suma de ponderaciones excede 100%".
-- Fix: incluir id_periodo en el filtro (cada período es
-- independiente).
--
-- Además: 'Numerada' deja de ser un tipo; se usa 'Subactividad'.
--
-- Es idempotente (DROP TRIGGER IF EXISTS). Ejecutar:
--   mysql -u root -h 127.0.0.1 -P 3306 --default-character-set=utf8mb4 sistema_academico < migrations/16_fix_triggers_periodo.sql
-- ============================================================

SET NAMES utf8mb4;
USE sistema_academico;

-- 1. Eliminar triggers antiguos
DROP TRIGGER IF EXISTS trg_validar_actividades_100_insert;
DROP TRIGGER IF EXISTS trg_validar_actividades_100_update;
DROP TRIGGER IF EXISTS trg_actividades_redistribuir_delete;

DELIMITER $$

-- ============================================================
-- 2. Recrear triggers de validación 100% CON filtro id_periodo
-- ============================================================
CREATE TRIGGER trg_validar_actividades_100_insert
BEFORE INSERT ON actividades
FOR EACH ROW
BEGIN
    DECLARE total DECIMAL(5,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM actividades
    WHERE id_clase = NEW.id_clase
      AND ((id_materia = NEW.id_materia) OR (id_materia IS NULL AND NEW.id_materia IS NULL))
      AND ((id_especialidad = NEW.id_especialidad) OR (id_especialidad IS NULL AND NEW.id_especialidad IS NULL))
      AND ((id_periodo = NEW.id_periodo) OR (id_periodo IS NULL AND NEW.id_periodo IS NULL))
      AND (estado = 'Activo' OR estado IS NULL);
    IF (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La suma de ponderaciones de actividades excede 100% en este periodo.';
    END IF;
END$$

CREATE TRIGGER trg_validar_actividades_100_update
BEFORE UPDATE ON actividades
FOR EACH ROW
BEGIN
    DECLARE total DECIMAL(5,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM actividades
    WHERE id_clase = NEW.id_clase
      AND ((id_materia = NEW.id_materia) OR (id_materia IS NULL AND NEW.id_materia IS NULL))
      AND ((id_especialidad = NEW.id_especialidad) OR (id_especialidad IS NULL AND NEW.id_especialidad IS NULL))
      AND ((id_periodo = NEW.id_periodo) OR (id_periodo IS NULL AND NEW.id_periodo IS NULL))
      AND (estado = 'Activo' OR estado IS NULL)
      AND id_actividad != NEW.id_actividad;
    IF (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La suma de ponderaciones de actividades excede 100% en este periodo.';
    END IF;
END$$

CREATE TRIGGER trg_actividades_redistribuir_delete
AFTER UPDATE ON actividades
FOR EACH ROW
BEGIN
    DECLARE totalPonderacion DECIMAL(5,2);
    DECLARE restantes INT;

    IF (OLD.estado = 'Activo' OR OLD.estado IS NULL) AND NEW.estado = 'Cerrado' THEN
        IF NEW.es_modulo = FALSE OR NEW.es_modulo IS NULL THEN
            SELECT COALESCE(SUM(ponderacion), 0), COUNT(*)
            INTO totalPonderacion, restantes
            FROM actividades
            WHERE id_clase = NEW.id_clase
              AND ((id_materia = NEW.id_materia) OR (id_materia IS NULL AND NEW.id_materia IS NULL))
              AND ((id_especialidad = NEW.id_especialidad) OR (id_especialidad IS NULL AND NEW.id_especialidad IS NULL))
              AND ((id_periodo = NEW.id_periodo) OR (id_periodo IS NULL AND NEW.id_periodo IS NULL))
              AND (estado = 'Activo' OR estado IS NULL);

            IF restantes > 0 AND totalPonderacion > 0 AND totalPonderacion < 99.99 THEN
                UPDATE actividades
                SET ponderacion = ROUND(ponderacion * 100.0 / totalPonderacion, 2)
                WHERE id_clase = NEW.id_clase
                  AND ((id_materia = NEW.id_materia) OR (id_materia IS NULL AND NEW.id_materia IS NULL))
                  AND ((id_especialidad = NEW.id_especialidad) OR (id_especialidad IS NULL AND NEW.id_especialidad IS NULL))
                  AND ((id_periodo = NEW.id_periodo) OR (id_periodo IS NULL AND NEW.id_periodo IS NULL))
                  AND (estado = 'Activo' OR estado IS NULL);
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- 3. 'Numerada' -> 'Subactividad' (son lo mismo; el orden se usa
--    con la columna `orden` / `numero_orden`)
-- ============================================================
UPDATE sub_actividades SET tipo_sub_actividad = 'Subactividad'
WHERE tipo_sub_actividad = 'Numerada';

ALTER TABLE sub_actividades
  MODIFY COLUMN tipo_sub_actividad ENUM(
    'Subactividad','Autoevaluacion','Coevaluacion','ActividadModulo',
    'Porcentaje','PruebaObjetiva','RecuperacionModulo'
  ) NOT NULL DEFAULT 'Subactividad';

SELECT '=== MIGRACIÓN 16 COMPLETADA ===' AS info;