-- 10: Plantillas de actividades, validaciones 100%, auto-recalculo
-- Estructura predeterminada igual al Excel oficial

-- 1. Tabla de plantillas de actividad (estructura predeterminada por tipo de materia)
CREATE TABLE IF NOT EXISTS actividad_plantillas (
    id_plantilla INT AUTO_INCREMENT PRIMARY KEY,
    nombre_plantilla VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_materia ENUM('Basica', 'Especialidad', 'Todas') DEFAULT 'Todas',
    es_predeterminada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tipo_materia (tipo_materia),
    INDEX idx_predeterminada (es_predeterminada)
);

-- 2. Detalle de actividades en la plantilla
CREATE TABLE IF NOT EXISTS actividad_plantilla_detalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_plantilla INT NOT NULL,
    orden_actividad INT NOT NULL,
    nombre_actividad VARCHAR(200) NOT NULL,
    tipo_actividad VARCHAR(50) DEFAULT 'Evaluación',
    ponderacion_actividad DECIMAL(5,2) NOT NULL CHECK (ponderacion_actividad > 0 AND ponderacion_actividad <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_plantilla) REFERENCES actividad_plantillas(id_plantilla) ON DELETE CASCADE,
    INDEX idx_plantilla_orden (id_plantilla, orden_actividad)
);

-- 3. Detalle de sub-actividades en la plantilla
CREATE TABLE IF NOT EXISTS sub_actividad_plantilla_detalle (
    id_sub_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_detalle_actividad INT NOT NULL,
    orden_sub INT NOT NULL,
    nombre_sub_actividad VARCHAR(200) NOT NULL,
    ponderacion_sub DECIMAL(5,2) NOT NULL CHECK (ponderacion_sub > 0 AND ponderacion_sub <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_detalle_actividad) REFERENCES actividad_plantilla_detalle(id_detalle) ON DELETE CASCADE,
    INDEX idx_actividad_orden (id_detalle_actividad, orden_sub)
);

-- 4. Insertar plantilla predeterminada (igual al Excel oficial)
INSERT INTO actividad_plantillas (nombre_plantilla, descripcion, tipo_materia, es_predeterminada)
VALUES ('CUADRO AUXILIAR ESTÁNDAR INA', 'Estructura oficial: 3 actividades (35/35/30) con sub-actividades ponderadas', 'Todas', TRUE);

-- Obtener ID de la plantilla insertada
SET @plantilla_id = LAST_INSERT_ID();

-- Actividad 1: 35% - 5 sub-actividades (20% cada una = 100%)
INSERT INTO actividad_plantilla_detalle (id_plantilla, orden_actividad, nombre_actividad, tipo_actividad, ponderacion_actividad)
VALUES (@plantilla_id, 1, 'ACTIVIDAD 1', 'Evaluación', 35.00);
SET @act1_id = LAST_INSERT_ID();

INSERT INTO sub_actividad_plantilla_detalle (id_detalle_actividad, orden_sub, nombre_sub_actividad, ponderacion_sub)
VALUES 
(@act1_id, 1, 'AUTOEVALUACIÓN', 20.00),
(@act1_id, 2, 'COEVALUACIÓN', 20.00),
(@act1_id, 3, 'PRUEBA OBJETIVA 1', 20.00),
(@act1_id, 4, 'PRUEBA OBJETIVA 2', 20.00),
(@act1_id, 5, 'PRUEBA OBJETIVA 3', 20.00);

-- Actividad 2: 35% - 5 sub-actividades (20% cada una = 100%)
INSERT INTO actividad_plantilla_detalle (id_plantilla, orden_actividad, nombre_actividad, tipo_actividad, ponderacion_actividad)
VALUES (@plantilla_id, 2, 'ACTIVIDAD 2', 'Evaluación', 35.00);
SET @act2_id = LAST_INSERT_ID();

INSERT INTO sub_actividad_plantilla_detalle (id_detalle_actividad, orden_sub, nombre_sub_actividad, ponderacion_sub)
VALUES 
(@act2_id, 1, 'AUTOEVALUACIÓN', 20.00),
(@act2_id, 2, 'COEVALUACIÓN', 20.00),
(@act2_id, 3, 'PRUEBA OBJETIVA 1', 20.00),
(@act2_id, 4, 'PRUEBA OBJETIVA 2', 20.00),
(@act2_id, 5, 'PRUEBA OBJETIVA 3', 20.00);

-- Actividad 3: 30% - 3 sub-actividades (ponderación ajustable = 100%)
INSERT INTO actividad_plantilla_detalle (id_plantilla, orden_actividad, nombre_actividad, tipo_actividad, ponderacion_actividad)
VALUES (@plantilla_id, 3, 'ACTIVIDAD 3', 'Evaluación', 30.00);
SET @act3_id = LAST_INSERT_ID();

INSERT INTO sub_actividad_plantilla_detalle (id_detalle_actividad, orden_sub, nombre_sub_actividad, ponderacion_sub)
VALUES 
(@act3_id, 1, 'AUTOEVALUACIÓN', 33.33),
(@act3_id, 2, 'COEVALUACIÓN', 33.33),
(@act3_id, 3, 'PRUEBA OBJETIVA', 33.34);

-- 5. Función para validar suma de ponderaciones de sub-actividades = 100%
DELIMITER //
CREATE FUNCTION IF NOT EXISTS validar_ponderaciones_sub_actividades(p_id_actividad INT)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM sub_actividades
    WHERE id_actividad = p_id_actividad;
    RETURN ABS(total - 100) < 0.01;
END//

-- 6. Función para validar suma de ponderaciones de actividades = 100%
CREATE FUNCTION IF NOT EXISTS validar_ponderaciones_actividades(p_id_materia INT, p_id_clase INT, p_id_docente INT)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM actividades
    WHERE id_materia = p_id_materia
      AND id_clase = p_id_clase
      AND id_docente = p_id_docente
      AND estado = 'Activo';
    RETURN ABS(total - 100) < 0.01;
END//

-- 7. Trigger: Validar sub-actividades sumen 100% al insertar/actualizar
CREATE TRIGGER IF NOT EXISTS trg_validar_sub_actividades_100_insert
BEFORE INSERT ON sub_actividades
FOR EACH ROW
BEGIN
    DECLARE total DECIMAL(10,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM sub_actividades
    WHERE id_actividad = NEW.id_actividad;
    
    IF (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('La suma de ponderaciones de sub-actividades excede 100%: ', total + NEW.ponderacion);
    END IF;
END//

CREATE TRIGGER IF NOT EXISTS trg_validar_sub_actividades_100_update
BEFORE UPDATE ON sub_actividades
FOR EACH ROW
BEGIN
    DECLARE total DECIMAL(10,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM sub_actividades
    WHERE id_actividad = NEW.id_actividad AND id_sub_actividad != NEW.id_sub_actividad;
    
    IF (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('La suma de ponderaciones de sub-actividades excede 100%: ', total + NEW.ponderacion);
    END IF;
END//

-- 8. Trigger: Validar actividades sumen 100% al insertar/actualizar
CREATE TRIGGER IF NOT EXISTS trg_validar_actividades_100_insert
BEFORE INSERT ON actividades
FOR EACH ROW
BEGIN
    DECLARE total DECIMAL(10,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM actividades
    WHERE id_materia = NEW.id_materia
      AND id_clase = NEW.id_clase
      AND id_docente = NEW.id_docente
      AND estado = 'Activo';
    
    IF (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('La suma de ponderaciones de actividades excede 100%: ', total + NEW.ponderacion);
    END IF;
END//

CREATE TRIGGER IF NOT EXISTS trg_validar_actividades_100_update
BEFORE UPDATE ON actividades
FOR EACH ROW
BEGIN
    DECLARE total DECIMAL(10,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM actividades
    WHERE id_materia = NEW.id_materia
      AND id_clase = NEW.id_clase
      AND id_docente = NEW.id_docente
      AND estado = 'Activo'
      AND id_actividad != NEW.id_actividad;
    
    IF (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('La suma de ponderaciones de actividades excede 100%: ', total + NEW.ponderacion);
    END IF;
END//

-- 9. Trigger: Auto-recalcular ponderaciones de actividades al borrar una
CREATE TRIGGER IF NOT EXISTS trg_actividades_redistribuir_delete
AFTER DELETE ON actividades
FOR EACH ROW
BEGIN
    -- Solo si era la última actividad o queda una sola
    DECLARE count_act INT;
    SELECT COUNT(*) INTO count_act
    FROM actividades
    WHERE id_materia = OLD.id_materia
      AND id_clase = OLD.id_clase
      AND id_docente = OLD.id_docente
      AND estado = 'Activo';
    
    IF count_act = 1 THEN
        UPDATE actividades 
        SET ponderacion = 100.00
        WHERE id_materia = OLD.id_materia
          AND id_clase = OLD.id_clase
          AND id_docente = OLD.id_docente
          AND estado = 'Activo';
    END IF;
END//

-- 10. Vista para obtener estructura completa de actividades con validación
CREATE OR REPLACE VIEW vista_actividades_completas AS
SELECT 
    a.id_actividad,
    a.id_materia,
    a.id_clase,
    a.id_docente,
    a.nombre_actividad,
    a.tipo_actividad,
    a.ponderacion AS ponderacion_actividad,
    a.fecha_publicacion,
    a.fecha_limite,
    a.estado,
    a.created_at,
    -- Validación actividades
    CASE 
        WHEN validar_ponderaciones_actividades(a.id_materia, a.id_clase, a.id_docente) THEN 'VALIDA'
        ELSE 'PENDIENTE: Ponderaciones ≠ 100%'
    END AS validacion_actividades,
    -- Sub-actividades
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id_sub_actividad', sa.id_sub_actividad,
            'nombre_sub_actividad', sa.nombre_sub_actividad,
            'ponderacion', sa.ponderacion,
            'orden', sa.orden,
            'validacion_sub', CASE WHEN validar_ponderaciones_sub_actividades(a.id_actividad) THEN 'VALIDA' ELSE 'PENDIENTE: Sub-ponderaciones ≠ 100%' END
        )
    ) AS sub_actividades
FROM actividades a
LEFT JOIN sub_actividades sa ON sa.id_actividad = a.id_actividad
WHERE a.estado = 'Activo'
GROUP BY a.id_actividad;

DELIMITER ;