-- ============================================================
-- MIGRACIÓN 12: Corrección de Triggers (usa estado en lugar de activo)
-- Ejecutar: mysql -u root -p sistema_academico < migrations/12_fix_triggers_estado.sql
-- ============================================================

USE sistema_academico;

-- ELIMINAR TRIGGERS CON ERROR
DROP TRIGGER IF EXISTS trg_validar_actividades_100_insert;
DROP TRIGGER IF EXISTS trg_validar_actividades_100_update;
DROP TRIGGER IF EXISTS trg_validar_sub_actividades_100_insert;
DROP TRIGGER IF EXISTS trg_validar_sub_actividades_100_update;
DROP TRIGGER IF EXISTS trg_actividades_redistribuir_delete;

DELIMITER $$

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
      AND (estado = 'Activo' OR estado IS NULL);
    IF (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La suma de ponderaciones de actividades excede 100%.';
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
      AND (estado = 'Activo' OR estado IS NULL)
      AND id_actividad != NEW.id_actividad;
    IF (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La suma de ponderaciones de actividades excede 100%.';
    END IF;
END$$

CREATE TRIGGER trg_validar_sub_actividades_100_insert
BEFORE INSERT ON sub_actividades
FOR EACH ROW
BEGIN
    DECLARE total DECIMAL(5,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM sub_actividades
    WHERE id_actividad = NEW.id_actividad;
    IF (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La suma de ponderaciones de sub-actividades excede 100%.';
    END IF;
END$$

CREATE TRIGGER trg_validar_sub_actividades_100_update
BEFORE UPDATE ON sub_actividades
FOR EACH ROW
BEGIN
    DECLARE total DECIMAL(5,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM sub_actividades
    WHERE id_actividad = NEW.id_actividad AND id_sub_actividad != NEW.id_sub_actividad;
    IF (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La suma de ponderaciones de sub-actividades excede 100%.';
    END IF;
END$$

CREATE TRIGGER trg_actividades_redistribuir_delete
AFTER UPDATE ON actividades
FOR EACH ROW
BEGIN
    DECLARE totalPonderacion DECIMAL(5,2);
    DECLARE restantes INT;
    
    -- Si la actividad pasó de Activa a Cerrada
    IF (OLD.estado = 'Activo' OR OLD.estado IS NULL) AND NEW.estado = 'Cerrado' THEN
        SELECT COALESCE(SUM(ponderacion), 0), COUNT(*)
        INTO totalPonderacion, restantes
        FROM actividades
        WHERE id_clase = NEW.id_clase
          AND ((id_materia = NEW.id_materia) OR (id_materia IS NULL AND NEW.id_materia IS NULL))
          AND ((id_especialidad = NEW.id_especialidad) OR (id_especialidad IS NULL AND NEW.id_especialidad IS NULL))
          AND (estado = 'Activo' OR estado IS NULL);
        
        IF restantes > 0 AND totalPonderacion > 0 AND totalPonderacion < 99.99 THEN
            UPDATE actividades
            SET ponderacion = ROUND(ponderacion * 100.0 / totalPonderacion, 2)
            WHERE id_clase = NEW.id_clase
              AND ((id_materia = NEW.id_materia) OR (id_materia IS NULL AND NEW.id_materia IS NULL))
              AND ((id_especialidad = NEW.id_especialidad) OR (id_especialidad IS NULL AND NEW.id_especialidad IS NULL))
              AND (estado = 'Activo' OR estado IS NULL);
        END IF;
    END IF;
END$$

DELIMITER ;

SELECT '=== MIGRACIÓN 12 COMPLETADA ===' AS info;
SELECT TRIGGER_NAME, EVENT_MANIPULATION FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'sistema_academico' AND TRIGGER_NAME LIKE 'trg_%'
ORDER BY TRIGGER_NAME;
