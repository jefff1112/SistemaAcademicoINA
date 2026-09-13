-- ============================================================
-- MIGRACIÓN 17: Sistema de Auditoría de Calificaciones
-- VERSIÓN CORREGIDA: Convierte MyISAM → InnoDB primero
-- ============================================================

USE sistema_academico;

-- ============================================================
-- PASO 1: Eliminar tabla de auditoría si existe (por intentos fallidos)
-- ============================================================
DROP TABLE IF EXISTS calificaciones_auditoria;
DROP VIEW IF EXISTS vista_auditoria_calificaciones;
DROP PROCEDURE IF EXISTS sp_limpiar_auditoria_antigua;

SELECT '✅ Limpiados intentos anteriores' AS paso_1;

-- ============================================================
-- PASO 2: Convertir tablas MyISAM a InnoDB (REQUISITO para FKs)
-- ============================================================

ALTER TABLE calificaciones_sub_actividades ENGINE = InnoDB;
ALTER TABLE sub_actividades ENGINE = InnoDB;
ALTER TABLE actividad_plantilla_detalle ENGINE = InnoDB;
ALTER TABLE sub_actividad_plantilla_detalle ENGINE = InnoDB;
ALTER TABLE recuperaciones_modulo ENGINE = InnoDB;
ALTER TABLE faltas_amonestaciones ENGINE = InnoDB;

SELECT '✅ Todas las tablas convertidas a InnoDB' AS paso_2;

-- ============================================================
-- PASO 3: Crear tabla de auditoría
-- ============================================================

CREATE TABLE calificaciones_auditoria (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT,
    id_calificacion_sub INT NOT NULL COMMENT 'FK a calificaciones_sub_actividades',
    id_estudiante INT NOT NULL,
    id_sub_actividad INT NOT NULL,
    
    -- Datos del cambio
    nota_anterior DECIMAL(5,2) NULL COMMENT 'Nota que tenía antes del cambio',
    nota_nueva DECIMAL(5,2) NULL COMMENT 'Nota después del cambio',
    recuperacion_anterior DECIMAL(5,2) NULL,
    recuperacion_nueva DECIMAL(5,2) NULL,
    
    -- Observación obligatoria
    observacion_cambio TEXT NOT NULL COMMENT 'Razón del cambio (OBLIGATORIA)',
    
    -- Datos del usuario que hizo el cambio
    id_usuario_cambio INT NOT NULL,
    nombre_usuario VARCHAR(200) NOT NULL,
    rol_usuario VARCHAR(100) NOT NULL,
    
    -- Tipo de operación
    tipo_operacion ENUM('CREACION', 'MODIFICACION', 'ELIMINACION', 'RECUPERACION') NOT NULL,
    es_primera_vez BOOLEAN DEFAULT FALSE COMMENT 'TRUE si es la primera nota',
    
    -- Metadata
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    fecha_hora_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys (ahora SÍ funcionan porque ambas tablas son InnoDB)
    CONSTRAINT fk_auditoria_calif_sub 
        FOREIGN KEY (id_calificacion_sub) REFERENCES calificaciones_sub_actividades(id_calificacion_sub) ON DELETE CASCADE,
    CONSTRAINT fk_auditoria_estudiante 
        FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    CONSTRAINT fk_auditoria_usuario 
        FOREIGN KEY (id_usuario_cambio) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_auditoria_calif (id_calificacion_sub),
    INDEX idx_auditoria_estudiante (id_estudiante),
    INDEX idx_auditoria_usuario (id_usuario_cambio),
    INDEX idx_auditoria_fecha (fecha_hora_cambio),
    INDEX idx_auditoria_tipo (tipo_operacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ Tabla calificaciones_auditoria creada' AS paso_3;

-- ============================================================
-- PASO 4: Vista para auditoría
-- ============================================================

CREATE VIEW vista_auditoria_calificaciones AS
SELECT 
    a.id_auditoria,
    a.fecha_hora_cambio,
    a.tipo_operacion,
    a.es_primera_vez,
    e.codigo_estudiante,
    CONCAT(e.nombres, ' ', e.apellidos) AS nombre_estudiante,
    sa.nombre_sub_actividad,
    sa.tipo_sub_actividad,
    sa.ponderacion AS ponderacion_sub,
    act.nombre_actividad,
    act.ponderacion AS ponderacion_act,
    act.id_clase,
    act.id_materia,
    act.id_especialidad,
    act.id_periodo,
    a.nota_anterior,
    a.nota_nueva,
    a.recuperacion_anterior,
    a.recuperacion_nueva,
    a.observacion_cambio,
    a.nombre_usuario,
    a.rol_usuario,
    a.ip_address
FROM calificaciones_auditoria a
INNER JOIN calificaciones_sub_actividades csa ON a.id_calificacion_sub = csa.id_calificacion_sub
INNER JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
INNER JOIN sub_actividades sa ON a.id_sub_actividad = sa.id_sub_actividad
INNER JOIN actividades act ON sa.id_actividad = act.id_actividad
ORDER BY a.fecha_hora_cambio DESC;

SELECT '✅ Vista creada' AS paso_4;

-- ============================================================
-- PASO 5: Procedimiento para limpiar auditoría antigua
-- ============================================================

DELIMITER $$
CREATE PROCEDURE sp_limpiar_auditoria_antigua(IN meses INT)
BEGIN
    DECLARE registros_eliminados INT DEFAULT 0;
    DELETE FROM calificaciones_auditoria 
    WHERE fecha_hora_cambio < DATE_SUB(NOW(), INTERVAL meses MONTH);
    SET registros_eliminados = ROW_COUNT();
    SELECT CONCAT('Se eliminaron ', registros_eliminados, ' registros de auditoría más antiguos de ', meses, ' meses') AS resultado;
END$$
DELIMITER ;

SELECT '✅ Procedimiento creado' AS paso_5;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================

SELECT '=== VERIFICACIÓN ===' AS info;

SELECT TABLE_NAME, ENGINE 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'sistema_academico' 
AND TABLE_NAME IN ('calificaciones_sub_actividades', 'sub_actividades', 'calificaciones_auditoria')
ORDER BY TABLE_NAME;

SELECT 'Foreign Keys de auditoria' AS info, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'sistema_academico' 
AND TABLE_NAME = 'calificaciones_auditoria' 
AND REFERENCED_TABLE_NAME IS NOT NULL;

SELECT '=== MIGRACIÓN 17 COMPLETADA ===' AS info;