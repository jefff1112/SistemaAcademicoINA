-- ============================================================
-- MIGRACIÓN 14: Cuadro Auxiliar Completo INA - Estructura Exacta Excel Físico
-- Ejecutar: mysql -u root -p sistema_academico < migrations/14_cuadro_auxiliar_ina_completo.sql
-- ============================================================

USE sistema_academico;

-- ============================================================
-- 1. CAMPOS NUEVOS EN ACTIVIDADES - Para estructura exacta del Excel
-- ============================================================
ALTER TABLE actividades
ADD COLUMN IF NOT EXISTS es_modulo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS numero_orden INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS id_especialidad INT NULL,
ADD COLUMN IF NOT EXISTS incluir_autoevaluacion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS incluir_coevaluacion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ponderacion_autoevaluacion DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ponderacion_coevaluacion DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Índices para actividades
CREATE INDEX IF NOT EXISTS idx_actividades_es_modulo ON actividades(es_modulo);
CREATE INDEX IF NOT EXISTS idx_actividades_id_especialidad ON actividades(id_especialidad);
CREATE INDEX IF NOT EXISTS idx_actividades_clase_materia_especialidad ON actividades(id_clase, id_materia, id_especialidad, estado);

-- ============================================================
-- 2. CAMPOS NUEVOS EN SUB_ACTIVIDADES - Tipos exactos del Excel
-- ============================================================
ALTER TABLE sub_actividades
ADD COLUMN IF NOT EXISTS tipo_sub_actividad VARCHAR(50) DEFAULT 'Subactividad',
ADD COLUMN IF NOT EXISTS es_vertical BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS numero_orden INT DEFAULT 0;

-- Valores válidos para tipo_sub_actividad:
-- 'Numerada' (1,2,3,4,5 en base)
-- 'Autoevaluacion' (texto vertical)
-- 'Coevaluacion' (texto vertical)
-- 'Porcentaje' (35% o 30% en base, negrita, dorado)
-- 'PruebaObjetiva' (texto vertical, para Actividad 3)
-- 'RecuperacionModulo' (columna RECUP. en módulos)

CREATE INDEX IF NOT EXISTS idx_sub_actividades_tipo ON sub_actividades(tipo_sub_actividad);
CREATE INDEX IF NOT EXISTS idx_sub_actividades_actividad_tipo ON sub_actividades(id_actividad, tipo_sub_actividad);

-- ============================================================
-- 3. CAMPOS EN CALIFICACIONES_SUB_ACTIVIDADES - Nota de recuperación por sub-actividad
-- ============================================================
ALTER TABLE calificaciones_sub_actividades
ADD COLUMN IF NOT EXISTS nota_recuperacion DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- ============================================================
-- 4. CAMPOS EN RESULTADOS_PERIODOS - Para módulos y recuperaciones
-- ============================================================
ALTER TABLE resultados_periodos
ADD COLUMN IF NOT EXISTS id_especialidad INT NULL,
ADD COLUMN IF NOT EXISTS anio_lectivo INT NULL,
ADD COLUMN IF NOT EXISTS nota_final_anual DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS nota_recuperacion_anual DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS observacion_recuperacion_anual TEXT NULL,
ADD COLUMN IF NOT EXISTS nota_recuperacion_modulo DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS observacion_recuperacion_modulo TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_resultados_especialidad ON resultados_periodos(id_especialidad, anio_lectivo);
CREATE INDEX IF NOT EXISTS idx_resultados_clase_especialidad_anio ON resultados_periodos(id_clase, id_especialidad, anio_lectivo);

-- ============================================================
-- 5. TABLA RECUPERACIONES MODULO - Una por cada módulo/actividad
-- ============================================================
CREATE TABLE IF NOT EXISTS recuperaciones_modulo (
    id_recuperacion_modulo INT AUTO_INCREMENT PRIMARY KEY,
    id_resultado_periodo INT NOT NULL,
    id_actividad INT NOT NULL,
    id_estudiante INT NOT NULL,
    id_periodo INT NOT NULL,
    id_clase INT NOT NULL,
    id_especialidad INT NULL,
    nota_recuperacion DECIMAL(5,2) CHECK (nota_recuperacion >= 0 AND nota_recuperacion <= 10),
    observacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_resultado_periodo) REFERENCES resultados_periodos(id_resultado_periodo) ON DELETE CASCADE,
    FOREIGN KEY (id_actividad) REFERENCES actividades(id_actividad) ON DELETE CASCADE,
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    FOREIGN KEY (id_periodo) REFERENCES periodos_academicos(id_periodo) ON DELETE CASCADE,
    FOREIGN KEY (id_clase) REFERENCES clases(id_clase) ON DELETE CASCADE,
    UNIQUE KEY uk_recuperacion_modulo (id_resultado_periodo, id_actividad, id_estudiante)
);

CREATE INDEX IF NOT EXISTS idx_recuperaciones_modulo_lookup ON recuperaciones_modulo(id_resultado_periodo, id_actividad, id_estudiante);
CREATE INDEX IF NOT EXISTS idx_recuperaciones_modulo_estudiante ON recuperaciones_modulo(id_estudiante, id_periodo);

-- ============================================================
-- 6. ACTUALIZAR PLANTILLA INA - Estructura exacta del Excel físico
-- ============================================================

-- 6.1 Agregar columnas necesarias a plantilla detalle
ALTER TABLE actividad_plantilla_detalle
ADD COLUMN IF NOT EXISTS incluir_autoevaluacion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS incluir_coevaluacion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ponderacion_autoevaluacion DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ponderacion_coevaluacion DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS es_modulo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS numero_orden INT DEFAULT 0;

-- 6.2 Agregar columnas a sub_actividad_plantilla_detalle
ALTER TABLE sub_actividad_plantilla_detalle
ADD COLUMN IF NOT EXISTS tipo_sub_actividad VARCHAR(50) DEFAULT 'Subactividad',
ADD COLUMN IF NOT EXISTS es_vertical BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS numero_orden INT DEFAULT 0;

-- 6.3 Limpiar plantilla existente y recrear exacta al Excel
DELETE FROM sub_actividad_plantilla_detalle WHERE id_detalle_actividad IN (SELECT id_detalle FROM actividad_plantilla_detalle WHERE id_plantilla = (SELECT id_plantilla FROM actividad_plantillas WHERE es_predeterminada = TRUE LIMIT 1));
DELETE FROM actividad_plantilla_detalle WHERE id_plantilla = (SELECT id_plantilla FROM actividad_plantillas WHERE es_predeterminada = TRUE LIMIT 1);

-- Insertar plantilla predeterminada (si no existe)
INSERT IGNORE INTO actividad_plantillas (nombre_plantilla, descripcion, tipo_materia, es_predeterminada)
VALUES ('CUADRO AUXILIAR ESTÁNDAR INA', 'Estructura oficial INA: 3 actividades (35/35/30) con sub-actividades exactas del Excel físico', 'Todas', TRUE);

SET @plantilla_id = (SELECT id_plantilla FROM actividad_plantillas WHERE es_predeterminada = TRUE LIMIT 1);

-- ============================================================
-- ACTIVIDAD 1: 35% - 8 SUB-ACTIVIDADES (5 numeradas + Autoeval + Coeval + 35%)
-- ============================================================
INSERT INTO actividad_plantilla_detalle (id_plantilla, orden_actividad, nombre_actividad, tipo_actividad, ponderacion_actividad, incluir_autoevaluacion, incluir_coevaluacion, ponderacion_autoevaluacion, ponderacion_coevaluacion, numero_orden)
VALUES (@plantilla_id, 1, 'ACTIVIDAD 1', 'Evaluación', 35.00, TRUE, TRUE, 20.00, 20.00, 1);

SET @act1_id = LAST_INSERT_ID();

-- Sub-actividades Actividad 1 (orden exacto como en Excel)
INSERT INTO sub_actividad_plantilla_detalle (id_detalle_actividad, orden_sub, nombre_sub_actividad, ponderacion_sub, tipo_sub_actividad, es_vertical, numero_orden) VALUES
(@act1_id, 1, '1', 20.00, 'Numerada', FALSE, 1),           -- Columna 1: "1"
(@act1_id, 2, '2', 20.00, 'Numerada', FALSE, 2),           -- Columna 2: "2"
(@act1_id, 3, '3', 20.00, 'Numerada', FALSE, 3),           -- Columna 3: "3"
(@act1_id, 4, '4', 20.00, 'Numerada', FALSE, 4),           -- Columna 4: "4"
(@act1_id, 5, '5', 20.00, 'Numerada', FALSE, 5),           -- Columna 5: "5"
(@act1_id, 6, 'AUTOEVALUACIÓN', 0.00, 'Autoevaluacion', TRUE, 6),  -- Columna 6: Autoeval (vertical)
(@act1_id, 7, 'COEVALUACIÓN', 0.00, 'Coevaluacion', TRUE, 7),      -- Columna 7: Coeval (vertical)
(@act1_id, 8, '35%', 0.00, 'Porcentaje', FALSE, 8);              -- Columna 8: 35% (base, dorado)

-- ============================================================
-- ACTIVIDAD 2: 35% - 8 SUB-ACTIVIDADES (Idéntica a Actividad 1)
-- ============================================================
INSERT INTO actividad_plantilla_detalle (id_plantilla, orden_actividad, nombre_actividad, tipo_actividad, ponderacion_actividad, incluir_autoevaluacion, incluir_coevaluacion, ponderacion_autoevaluacion, ponderacion_coevaluacion, numero_orden)
VALUES (@plantilla_id, 2, 'ACTIVIDAD 2', 'Evaluación', 35.00, TRUE, TRUE, 20.00, 20.00, 2);

SET @act2_id = LAST_INSERT_ID();

INSERT INTO sub_actividad_plantilla_detalle (id_detalle_actividad, orden_sub, nombre_sub_actividad, ponderacion_sub, tipo_sub_actividad, es_vertical, numero_orden) VALUES
(@act2_id, 1, '1', 20.00, 'Numerada', FALSE, 1),
(@act2_id, 2, '2', 20.00, 'Numerada', FALSE, 2),
(@act2_id, 3, '3', 20.00, 'Numerada', FALSE, 3),
(@act2_id, 4, '4', 20.00, 'Numerada', FALSE, 4),
(@act2_id, 5, '5', 20.00, 'Numerada', FALSE, 5),
(@act2_id, 6, 'AUTOEVALUACIÓN', 0.00, 'Autoevaluacion', TRUE, 6),
(@act2_id, 7, 'COEVALUACIÓN', 0.00, 'Coevaluacion', TRUE, 7),
(@act2_id, 8, '35%', 0.00, 'Porcentaje', FALSE, 8);

-- ============================================================
-- ACTIVIDAD 3: 30% - 4 SUB-ACTIVIDADES (3 Pruebas Objetivas + 30%)
-- ============================================================
INSERT INTO actividad_plantilla_detalle (id_plantilla, orden_actividad, nombre_actividad, tipo_actividad, ponderacion_actividad, incluir_autoevaluacion, incluir_coevaluacion, ponderacion_autoevaluacion, ponderacion_coevaluacion, numero_orden)
VALUES (@plantilla_id, 3, 'ACTIVIDAD 3', 'Evaluación', 30.00, FALSE, FALSE, 0.00, 0.00, 3);

SET @act3_id = LAST_INSERT_ID();

INSERT INTO sub_actividad_plantilla_detalle (id_detalle_actividad, orden_sub, nombre_sub_actividad, ponderacion_sub, tipo_sub_actividad, es_vertical, numero_orden) VALUES
(@act3_id, 1, 'PRUEBA OBJETIVA 1', 33.33, 'PruebaObjetiva', TRUE, 1),   -- Columna 1: Prueba Obj 1 (vertical)
(@act3_id, 2, 'PRUEBA OBJETIVA 2', 33.33, 'PruebaObjetiva', TRUE, 2),   -- Columna 2: Prueba Obj 2 (vertical)
(@act3_id, 3, 'PRUEBA OBJETIVA 3', 33.34, 'PruebaObjetiva', TRUE, 3),   -- Columna 3: Prueba Obj 3 (vertical)
(@act3_id, 4, '30%', 0.00, 'Porcentaje', FALSE, 4);                       -- Columna 4: 30% (separada por borde doble)

-- ============================================================
-- 7. PLANTILLA PARA MÓDULOS/ESPECIALIDADES
-- ============================================================
-- Insertar plantilla para módulos (8 módulos típico por año)
INSERT IGNORE INTO actividad_plantillas (nombre_plantilla, descripcion, tipo_materia, es_predeterminada)
VALUES ('CUADRO AUXILIAR MÓDULOS ESPECIALIDAD', 'Estructura para especialidades: Módulos con actividades y recuperación por módulo + nota final anual', 'Especialidad', FALSE);

SET @plantilla_modulo_id = (SELECT id_plantilla FROM actividad_plantillas WHERE nombre_plantilla = 'CUADRO AUXILIAR MÓDULOS ESPECIALIDAD' LIMIT 1);

-- Módulos típicos (8 por año, se pueden ajustar)
INSERT INTO actividad_plantilla_detalle (id_plantilla, orden_actividad, nombre_actividad, tipo_actividad, ponderacion_actividad, es_modulo, numero_orden)
VALUES 
(@plantilla_modulo_id, 1, 'MÓDULO 1', 'Modulo', 12.50, TRUE, 1),
(@plantilla_modulo_id, 2, 'MÓDULO 2', 'Modulo', 12.50, TRUE, 2),
(@plantilla_modulo_id, 3, 'MÓDULO 3', 'Modulo', 12.50, TRUE, 3),
(@plantilla_modulo_id, 4, 'MÓDULO 4', 'Modulo', 12.50, TRUE, 4),
(@plantilla_modulo_id, 5, 'MÓDULO 5', 'Modulo', 12.50, TRUE, 5),
(@plantilla_modulo_id, 6, 'MÓDULO 6', 'Modulo', 12.50, TRUE, 6),
(@plantilla_modulo_id, 7, 'MÓDULO 7', 'Modulo', 12.50, TRUE, 7),
(@plantilla_modulo_id, 8, 'MÓDULO 8', 'Modulo', 12.50, TRUE, 8);

-- Sub-actividades para cada módulo (actividades dentro del módulo + recuperación)
SET @mod1 = (SELECT id_detalle FROM actividad_plantilla_detalle WHERE id_plantilla = @plantilla_modulo_id AND orden_actividad = 1);
SET @mod2 = (SELECT id_detalle FROM actividad_plantilla_detalle WHERE id_plantilla = @plantilla_modulo_id AND orden_actividad = 2);
SET @mod3 = (SELECT id_detalle FROM actividad_plantilla_detalle WHERE id_plantilla = @plantilla_modulo_id AND orden_actividad = 3);
SET @mod4 = (SELECT id_detalle FROM actividad_plantilla_detalle WHERE id_plantilla = @plantilla_modulo_id AND orden_actividad = 4);
SET @mod5 = (SELECT id_detalle FROM actividad_plantilla_detalle WHERE id_plantilla = @plantilla_modulo_id AND orden_actividad = 5);
SET @mod6 = (SELECT id_detalle FROM actividad_plantilla_detalle WHERE id_plantilla = @plantilla_modulo_id AND orden_actividad = 6);
SET @mod7 = (SELECT id_detalle FROM actividad_plantilla_detalle WHERE id_plantilla = @plantilla_modulo_id AND orden_actividad = 7);
SET @mod8 = (SELECT id_detalle FROM actividad_plantilla_detalle WHERE id_plantilla = @plantilla_modulo_id AND orden_actividad = 8);

-- Cada módulo tiene: 3 actividades + columna RECUP. (recuperación del módulo)
INSERT INTO sub_actividad_plantilla_detalle (id_detalle_actividad, orden_sub, nombre_sub_actividad, ponderacion_sub, tipo_sub_actividad, es_vertical, numero_orden) VALUES
-- Módulo 1
(@mod1, 1, 'ACTIVIDAD 1', 33.33, 'ActividadModulo', FALSE, 1),
(@mod1, 2, 'ACTIVIDAD 2', 33.33, 'ActividadModulo', FALSE, 2),
(@mod1, 3, 'ACTIVIDAD 3', 33.34, 'ActividadModulo', FALSE, 3),
(@mod1, 4, 'RECUP.', 0.00, 'RecuperacionModulo', TRUE, 4),
-- Módulo 2
(@mod2, 1, 'ACTIVIDAD 1', 33.33, 'ActividadModulo', FALSE, 1),
(@mod2, 2, 'ACTIVIDAD 2', 33.33, 'ActividadModulo', FALSE, 2),
(@mod2, 3, 'ACTIVIDAD 3', 33.34, 'ActividadModulo', FALSE, 3),
(@mod2, 4, 'RECUP.', 0.00, 'RecuperacionModulo', TRUE, 4),
-- Módulo 3
(@mod3, 1, 'ACTIVIDAD 1', 33.33, 'ActividadModulo', FALSE, 1),
(@mod3, 2, 'ACTIVIDAD 2', 33.33, 'ActividadModulo', FALSE, 2),
(@mod3, 3, 'ACTIVIDAD 3', 33.34, 'ActividadModulo', FALSE, 3),
(@mod3, 4, 'RECUP.', 0.00, 'RecuperacionModulo', TRUE, 4),
-- Módulo 4
(@mod4, 1, 'ACTIVIDAD 1', 33.33, 'ActividadModulo', FALSE, 1),
(@mod4, 2, 'ACTIVIDAD 2', 33.33, 'ActividadModulo', FALSE, 2),
(@mod4, 3, 'ACTIVIDAD 3', 33.34, 'ActividadModulo', FALSE, 3),
(@mod4, 4, 'RECUP.', 0.00, 'RecuperacionModulo', TRUE, 4),
-- Módulo 5
(@mod5, 1, 'ACTIVIDAD 1', 33.33, 'ActividadModulo', FALSE, 1),
(@mod5, 2, 'ACTIVIDAD 2', 33.33, 'ActividadModulo', FALSE, 2),
(@mod5, 3, 'ACTIVIDAD 3', 33.34, 'ActividadModulo', FALSE, 3),
(@mod5, 4, 'RECUP.', 0.00, 'RecuperacionModulo', TRUE, 4),
-- Módulo 6
(@mod6, 1, 'ACTIVIDAD 1', 33.33, 'ActividadModulo', FALSE, 1),
(@mod6, 2, 'ACTIVIDAD 2', 33.33, 'ActividadModulo', FALSE, 2),
(@mod6, 3, 'ACTIVIDAD 3', 33.34, 'ActividadModulo', FALSE, 3),
(@mod6, 4, 'RECUP.', 0.00, 'RecuperacionModulo', TRUE, 4),
-- Módulo 7
(@mod7, 1, 'ACTIVIDAD 1', 33.33, 'ActividadModulo', FALSE, 1),
(@mod7, 2, 'ACTIVIDAD 2', 33.33, 'ActividadModulo', FALSE, 2),
(@mod7, 3, 'ACTIVIDAD 3', 33.34, 'ActividadModulo', FALSE, 3),
(@mod7, 4, 'RECUP.', 0.00, 'RecuperacionModulo', TRUE, 4),
-- Módulo 8
(@mod8, 1, 'ACTIVIDAD 1', 33.33, 'ActividadModulo', FALSE, 1),
(@mod8, 2, 'ACTIVIDAD 2', 33.33, 'ActividadModulo', FALSE, 2),
(@mod8, 3, 'ACTIVIDAD 3', 33.34, 'ActividadModulo', FALSE, 3),
(@mod8, 4, 'RECUP.', 0.00, 'RecuperacionModulo', TRUE, 4);

-- ============================================================
-- 8. TRIGGERS ACTUALIZADOS - Validaciones 100% con soporte módulos
-- ============================================================
DROP TRIGGER IF EXISTS trg_validar_actividades_100_insert;
DROP TRIGGER IF EXISTS trg_validar_actividades_100_update;
DROP TRIGGER IF EXISTS trg_validar_sub_actividades_100_insert;
DROP TRIGGER IF EXISTS trg_validar_sub_actividades_100_update;
DROP TRIGGER IF EXISTS trg_actividades_redistribuir_delete;

DELIMITER $$

-- Trigger: Validar actividades sumen 100% (soporta materias Y módulos/especialidades)
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

-- Trigger: Validar sub-actividades sumen 100% (solo las que tienen ponderación > 0)
CREATE TRIGGER trg_validar_sub_actividades_100_insert
BEFORE INSERT ON sub_actividades
FOR EACH ROW
BEGIN
    DECLARE total DECIMAL(5,2);
    SELECT COALESCE(SUM(ponderacion), 0) INTO total
    FROM sub_actividades
    WHERE id_actividad = NEW.id_actividad;
    -- Solo validar si la nueva sub-actividad tiene ponderación > 0 (excluye Autoeval, Coeval, Porcentaje, RecuperacionModulo)
    IF NEW.ponderacion > 0 AND (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La suma de ponderaciones de sub-actividades con nota excede 100%.';
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
    IF NEW.ponderacion > 0 AND (total + NEW.ponderacion) > 100.01 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La suma de ponderaciones de sub-actividades con nota excede 100%.';
    END IF;
END$$

-- Trigger: Redistribuir ponderaciones al cerrar actividad (solo materias, no módulos)
CREATE TRIGGER trg_actividades_redistribuir_delete
AFTER UPDATE ON actividades
FOR EACH ROW
BEGIN
    DECLARE totalPonderacion DECIMAL(5,2);
    DECLARE restantes INT;
    
    IF (OLD.estado = 'Activo' OR OLD.estado IS NULL) AND NEW.estado = 'Cerrado' THEN
        -- Solo redistribuir si es materia básica (no módulo)
        IF NEW.es_modulo = FALSE OR NEW.es_modulo IS NULL THEN
            SELECT COALESCE(SUM(ponderacion), 0), COUNT(*)
            INTO totalPonderacion, restantes
            FROM actividades
            WHERE id_clase = NEW.id_clase
              AND ((id_materia = NEW.id_materia) OR (id_materia IS NULL AND NEW.id_materia IS NULL))
              AND (estado = 'Activo' OR estado IS NULL);
            
            IF restantes > 0 AND totalPonderacion > 0 AND totalPonderacion < 99.99 THEN
                UPDATE actividades
                SET ponderacion = ROUND(ponderacion * 100.0 / totalPonderacion, 2)
                WHERE id_clase = NEW.id_clase
                  AND ((id_materia = NEW.id_materia) OR (id_materia IS NULL AND NEW.id_materia IS NULL))
                  AND (estado = 'Activo' OR estado IS NULL);
            END IF;
        END IF;
    END IF;
END$$

-- Trigger: Auto-crear sub-actividades Autoeval/Coeval al marcar flags en actividad
CREATE TRIGGER trg_actividad_auto_coeval_after_update
AFTER UPDATE ON actividades
FOR EACH ROW
BEGIN
    -- Si se activó incluir_autoevaluacion y no existe sub-actividad autoeval
    IF NEW.incluir_autoevaluacion = TRUE AND (OLD.incluir_autoevaluacion = FALSE OR OLD.incluir_autoevaluacion IS NULL) THEN
        IF NOT EXISTS (SELECT 1 FROM sub_actividades WHERE id_actividad = NEW.id_actividad AND tipo_sub_actividad = 'Autoevaluacion') THEN
            INSERT INTO sub_actividades (id_actividad, nombre_sub_actividad, tipo_sub_actividad, ponderacion, orden, es_vertical, numero_orden, created_at)
            VALUES (NEW.id_actividad, 'AUTOEVALUACIÓN', 'Autoevaluacion', NEW.ponderacion_autoevaluacion, 
                    (SELECT COALESCE(MAX(orden), 0) + 1 FROM sub_actividades WHERE id_actividad = NEW.id_actividad),
                    TRUE, 6, NOW());
        END IF;
    END IF;
    
    -- Si se activó incluir_coevaluacion y no existe sub-actividad coeval
    IF NEW.incluir_coevaluacion = TRUE AND (OLD.incluir_coevaluacion = FALSE OR OLD.incluir_coevaluacion IS NULL) THEN
        IF NOT EXISTS (SELECT 1 FROM sub_actividades WHERE id_actividad = NEW.id_actividad AND tipo_sub_actividad = 'Coevaluacion') THEN
            INSERT INTO sub_actividades (id_actividad, nombre_sub_actividad, tipo_sub_actividad, ponderacion, orden, es_vertical, numero_orden, created_at)
            VALUES (NEW.id_actividad, 'COEVALUACIÓN', 'Coevaluacion', NEW.ponderacion_coevaluacion,
                    (SELECT COALESCE(MAX(orden), 0) + 1 FROM sub_actividades WHERE id_actividad = NEW.id_actividad),
                    TRUE, 7, NOW());
        END IF;
    END IF;
    
    -- Si se desactivó, eliminar las sub-actividades auto/coeval
    IF NEW.incluir_autoevaluacion = FALSE AND OLD.incluir_autoevaluacion = TRUE THEN
        DELETE FROM sub_actividades WHERE id_actividad = NEW.id_actividad AND tipo_sub_actividad = 'Autoevaluacion';
    END IF;
    
    IF NEW.incluir_coevaluacion = FALSE AND OLD.incluir_coevaluacion = TRUE THEN
        DELETE FROM sub_actividades WHERE id_actividad = NEW.id_actividad AND tipo_sub_actividad = 'Coevaluacion';
    END IF;
END$$

-- Trigger: Auto-crear columna Porcentaje (35%/30%) al crear actividad
CREATE TRIGGER trg_actividad_porcentaje_after_insert
AFTER INSERT ON actividades
FOR EACH ROW
BEGIN
    -- Insertar columna porcentaje final si no existe
    IF NOT EXISTS (SELECT 1 FROM sub_actividades WHERE id_actividad = NEW.id_actividad AND tipo_sub_actividad = 'Porcentaje') THEN
        INSERT INTO sub_actividades (id_actividad, nombre_sub_actividad, tipo_sub_actividad, ponderacion, orden, es_vertical, numero_orden, created_at)
        VALUES (NEW.id_actividad, CONCAT(NEW.ponderacion, '%'), 'Porcentaje', 0, 
                (SELECT COALESCE(MAX(orden), 0) + 1 FROM sub_actividades WHERE id_actividad = NEW.id_actividad),
                FALSE, 8, NOW());
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- 9. VISTA COMPLETA PARA EL CUADRO AUXILIAR - Lista para el Frontend
-- ============================================================
DROP VIEW IF EXISTS vista_cuadro_auxiliar_completo;

CREATE VIEW vista_cuadro_auxiliar_completo AS
SELECT 
    a.id_actividad,
    a.id_materia,
    a.id_especialidad,
    a.id_clase,
    a.id_docente,
    a.nombre_actividad,
    a.tipo_actividad,
    a.ponderacion AS ponderacion_actividad,
    a.fecha_publicacion,
    a.fecha_limite,
    a.descripcion,
    a.especificacion,
    a.estado,
    a.es_modulo,
    a.incluir_autoevaluacion,
    a.incluir_coevaluacion,
    a.ponderacion_autoevaluacion,
    a.ponderacion_coevaluacion,
    a.numero_orden AS actividad_numero_orden,
    a.observaciones,
    -- Sub-actividades con info completa para renderizado exacto
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id_sub_actividad', sa.id_sub_actividad,
            'nombre_sub_actividad', sa.nombre_sub_actividad,
            'tipo_sub_actividad', sa.tipo_sub_actividad,
            'ponderacion', sa.ponderacion,
            'orden', sa.orden,
            'es_vertical', sa.es_vertical,
            'numero_orden', sa.numero_orden,
            'es_autoevaluacion', sa.tipo_sub_actividad = 'Autoevaluacion',
            'es_coevaluacion', sa.tipo_sub_actividad = 'Coevaluacion',
            'es_porcentaje', sa.tipo_sub_actividad = 'Porcentaje',
            'es_prueba_objetiva', sa.tipo_sub_actividad = 'PruebaObjetiva',
            'es_actividad_modulo', sa.tipo_sub_actividad = 'ActividadModulo',
            'es_recuperacion_modulo', sa.tipo_sub_actividad = 'RecuperacionModulo',
            'es_numerada', sa.tipo_sub_actividad = 'Numerada'
        )
        ORDER BY sa.orden
    ) AS sub_actividades,
    -- Validaciones
    CASE 
        WHEN ABS(COALESCE(SUM(CASE WHEN sa.ponderacion > 0 THEN sa.ponderacion ELSE 0 END), 0) - 100) < 0.01 THEN 'VALIDA'
        ELSE CONCAT('PENDIENTE: Sub-ponderaciones con nota = ', COALESCE(SUM(CASE WHEN sa.ponderacion > 0 THEN sa.ponderacion ELSE 0 END), 0), '%')
    END AS validacion_sub_actividades
FROM actividades a
LEFT JOIN sub_actividades sa ON sa.id_actividad = a.id_actividad
WHERE a.estado = 'Activo'
GROUP BY a.id_actividad;

-- ============================================================
-- 10. VISTA PARA CUADRO AUXILIAR CON NOTAS - Lista para exportar/ver
-- ============================================================
DROP VIEW IF EXISTS vista_cuadro_auxiliar_con_notas;

CREATE VIEW vista_cuadro_auxiliar_con_notas AS
SELECT 
    e.id_estudiante,
    e.codigo_estudiante,
    e.nombres,
    e.apellidos,
    c.id_clase,
    c.nombre_clase,
    c.seccion,
    m.id_materia,
    m.nombre_materia,
    m.tipo_materia,
    esp.id_especialidad,
    esp.nombre_especialidad,
    p.id_periodo,
    p.numero_periodo,
    p.anio_lectivo,
    a.id_actividad,
    a.nombre_actividad,
    a.ponderacion AS ponderacion_actividad,
    a.es_modulo,
    a.numero_orden AS actividad_orden,
    sa.id_sub_actividad,
    sa.nombre_sub_actividad,
    sa.tipo_sub_actividad,
    sa.ponderacion AS ponderacion_sub,
    sa.orden AS sub_orden,
    sa.numero_orden AS sub_numero_orden,
    sa.es_vertical,
    csa.nota,
    csa.nota_recuperacion,
    csa.observaciones,
    -- Nota efectiva (recuperación > original)
    CASE 
        WHEN csa.nota_recuperacion IS NOT NULL AND csa.nota_recuperacion > 0 THEN csa.nota_recuperacion
        ELSE csa.nota
    END AS nota_efectiva,
    -- Resultado del período
    rp.nota_acumulada,
    rp.nota_recuperacion AS nota_recuperacion_periodo,
    rp.observacion_recuperacion,
    rp.nota_final_anual,
    rp.nota_recuperacion_anual,
    rp.observacion_recuperacion_anual
FROM estudiantes e
INNER JOIN inscripciones i ON i.id_estudiante = e.id_estudiante AND i.estado_inscripcion IN ('Matriculado', 'Aprobado')
INNER JOIN clases c ON c.id_clase = i.id_clase
LEFT JOIN materias m ON m.id_materia = (
    SELECT DISTINCT a.id_materia FROM actividades a WHERE a.id_clase = c.id_clase AND a.id_materia IS NOT NULL LIMIT 1
)
LEFT JOIN especialidades esp ON esp.id_especialidad = c.id_especialidad
LEFT JOIN periodos_academicos p ON p.anio_lectivo = c.anio_lectivo AND p.estado = 'Activo'
LEFT JOIN actividades a ON a.id_clase = c.id_clase AND a.estado = 'Activo'
LEFT JOIN sub_actividades sa ON sa.id_actividad = a.id_actividad
LEFT JOIN calificaciones_sub_actividades csa ON csa.id_sub_actividad = sa.id_sub_actividad AND csa.id_estudiante = e.id_estudiante
LEFT JOIN resultados_periodos rp ON rp.id_estudiante = e.id_estudiante 
    AND rp.id_clase = c.id_clase 
    AND rp.id_periodo = p.id_periodo
    AND ((rp.id_materia = a.id_materia) OR (rp.id_especialidad = a.id_especialidad))
WHERE e.estado = TRUE;

SELECT '=== MIGRACIÓN 14 COMPLETADA: Cuadro Auxiliar INA Exacto ===' AS info;