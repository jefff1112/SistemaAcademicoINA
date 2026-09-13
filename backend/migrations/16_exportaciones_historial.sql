-- ============================================================
-- MIGRACIÓN 16: Sistema de Auditoría de Exportaciones Excel
-- Registra cada exportación generada, guarda el archivo y permite
-- descargarlo sin regenerar. Incluye historial por usuario.
-- ============================================================

USE sistema_academico;

-- ============================================================
-- 1. CREAR TABLA: exportaciones_historial
-- ============================================================

CREATE TABLE IF NOT EXISTS exportaciones_historial (
    id_exportacion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL COMMENT 'Usuario que generó la exportación',
    nombre_usuario VARCHAR(200) NOT NULL COMMENT 'Nombre completo del usuario',
    rol_usuario VARCHAR(100) NOT NULL COMMENT 'Rol del usuario al generar',
    tipo_exportacion ENUM(
        'ClaseMateriaPeriodo',
        'ClaseMateriaTodosPeriodos',
        'ClaseTodasMateriasPeriodo',
        'ClaseTodasMateriasTodosPeriodos',
        'ConsolidadoAnual'
    ) NOT NULL COMMENT 'Tipo de combinación exportada',
    descripcion VARCHAR(500) NOT NULL COMMENT 'Descripción legible (ej: "Matemáticas - 1E - P1 2026")',
    id_clase INT NULL COMMENT 'NULL si es consolidado anual',
    id_materia INT NULL COMMENT 'NULL si son todas las materias o consolidado',
    id_especialidad INT NULL COMMENT 'NULL si es materia básica o consolidado',
    id_periodo INT NULL COMMENT 'NULL si son todos los períodos o consolidado',
    anio_lectivo INT NOT NULL COMMENT 'Año lectivo del reporte',
    nombre_archivo VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo en disco',
    ruta_archivo VARCHAR(500) NOT NULL COMMENT 'Ruta relativa al archivo',
    tamano_bytes BIGINT NOT NULL DEFAULT 0 COMMENT 'Tamaño del archivo en bytes',
    total_registros INT NOT NULL DEFAULT 0 COMMENT 'Número de filas de datos',
    ip_origen VARCHAR(50) NULL COMMENT 'IP desde donde se generó',
    user_agent TEXT NULL COMMENT 'Navegador/usuario del cliente',
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_descarga DATETIME NULL COMMENT 'Última vez que se descargó',
    contador_descargas INT DEFAULT 0 COMMENT 'Número de veces descargado',
    estado ENUM('Activo', 'Eliminado', 'Expirado') DEFAULT 'Activo',
    observaciones TEXT NULL,

    -- Índices para búsquedas rápidas
    INDEX idx_usuario (id_usuario),
    INDEX idx_fecha (fecha_generacion),
    INDEX idx_tipo (tipo_exportacion),
    INDEX idx_clase (id_clase),
    INDEX idx_estado (estado),
    INDEX idx_compuesto (id_usuario, tipo_exportacion, fecha_generacion),

    -- Foreign Keys
    CONSTRAINT fk_exportaciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_exportaciones_clase FOREIGN KEY (id_clase) REFERENCES clases(id_clase) ON DELETE SET NULL,
    CONSTRAINT fk_exportaciones_materia FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE SET NULL,
    CONSTRAINT fk_exportaciones_especialidad FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad) ON DELETE SET NULL,
    CONSTRAINT fk_exportaciones_periodo FOREIGN KEY (id_periodo) REFERENCES periodos_academicos(id_periodo) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de exportaciones Excel generadas por usuarios autorizados';

-- ============================================================
-- 2. CREAR VISTA: vista_exportaciones_detalle
-- ============================================================

DROP VIEW IF EXISTS vista_exportaciones_detalle;

CREATE VIEW vista_exportaciones_detalle AS
SELECT
    e.id_exportacion,
    e.id_usuario,
    e.nombre_usuario,
    e.rol_usuario,
    e.tipo_exportacion,
    e.descripcion,
    e.anio_lectivo,
    e.nombre_archivo,
    e.ruta_archivo,
    e.tamano_bytes,
    ROUND(e.tamano_bytes / 1024, 2) AS tamano_kb,
    e.total_registros,
    e.ip_origen,
    e.fecha_generacion,
    e.fecha_descarga,
    e.contador_descargas,
    e.estado,
    c.nombre_clase AS nombre_clase,
    m.nombre_materia AS nombre_materia,
    esp.nombre_especialidad AS nombre_especialidad,
    p.nombre AS nombre_periodo,
    CASE
        WHEN e.tipo_exportacion = 'ClaseMateriaPeriodo' THEN 'Clase + Materia + 1 Período'
        WHEN e.tipo_exportacion = 'ClaseMateriaTodosPeriodos' THEN 'Clase + Materia + Todos los Períodos'
        WHEN e.tipo_exportacion = 'ClaseTodasMateriasPeriodo' THEN 'Clase + Todas las Materias + 1 Período'
        WHEN e.tipo_exportacion = 'ClaseTodasMateriasTodosPeriodos' THEN 'Clase + Todas las Materias + Todos los Períodos'
        WHEN e.tipo_exportacion = 'ConsolidadoAnual' THEN 'Consolidado Anual'
        ELSE e.tipo_exportacion
    END AS tipo_exportacion_legible
FROM exportaciones_historial e
LEFT JOIN clases c ON e.id_clase = c.id_clase
LEFT JOIN materias m ON e.id_materia = m.id_materia
LEFT JOIN especialidades esp ON e.id_especialidad = esp.id_especialidad
LEFT JOIN periodos_academicos p ON e.id_periodo = p.id_periodo
WHERE e.estado = 'Activo';

-- ============================================================
-- 3. CREAR PROCEDIMIENTO ALMACENADO: sp_limpiar_exportaciones_antiguas
-- ============================================================

DROP PROCEDURE IF EXISTS sp_limpiar_exportaciones_antiguas;

DELIMITER $$

CREATE PROCEDURE sp_limpiar_exportaciones_antiguas(IN dias_antiguedad INT)
BEGIN
    DECLARE filas_afectadas INT;

    -- Marcar como "Expirado" las exportaciones más antiguas que X días
    UPDATE exportaciones_historial
    SET estado = 'Expirado'
    WHERE estado = 'Activo'
      AND fecha_generacion < DATE_SUB(NOW(), INTERVAL dias_antiguedad DAY);

    SET filas_afectadas = ROW_COUNT();

    SELECT CONCAT('Se marcaron ', filas_afectadas, ' exportaciones como expiradas') AS resultado;
END$$

DELIMITER ;

-- ============================================================
-- 4. CREAR TRIGGER: Auto-limpiar archivos físicos al eliminar registro
-- (Nota: MySQL no puede borrar archivos del sistema, solo marcamos)
-- ============================================================

DROP TRIGGER IF EXISTS trg_exportaciones_before_delete;

DELIMITER $$

CREATE TRIGGER trg_exportaciones_before_delete
BEFORE DELETE ON exportaciones_historial
FOR EACH ROW
BEGIN
    -- El archivo físico debe eliminarse desde la aplicación (C#)
    -- Este trigger solo registra en un log de auditoría
    INSERT INTO exportaciones_historial (
        id_usuario, nombre_usuario, rol_usuario, tipo_exportacion,
        descripcion, anio_lectivo, nombre_archivo, ruta_archivo,
        tamano_bytes, total_registros, estado, observaciones
    ) VALUES (
        OLD.id_usuario, OLD.nombre_usuario, OLD.rol_usuario, OLD.tipo_exportacion,
        CONCAT('ELIMINADO: ', OLD.descripcion), OLD.anio_lectivo, OLD.nombre_archivo,
        OLD.ruta_archivo, 0, 0, 'Eliminado',
        CONCAT('Registro eliminado. Archivo físico debe borrarse manualmente: ', OLD.ruta_archivo)
    );
END$$

DELIMITER ;

-- ============================================================
-- 5. CREAR DIRECTORIO DE ALMACENAMIENTO
-- ============================================================

-- Nota: El directorio físico debe crearse desde C# o manualmente:
-- C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\wwwroot\exportaciones\
-- Este script solo lo documenta

SELECT '=== MIGRACIÓN 16 COMPLETADA ===' AS info;
SELECT 'Tabla exportaciones_historial creada' AS resultado;
SELECT 'Vista vista_exportaciones_detalle creada' AS resultado;
SELECT 'Procedimiento sp_limpiar_exportaciones_antiguas creado' AS resultado;
SELECT 'IMPORTANTE: Crear carpeta física wwwroot/exportaciones/ manualmente' AS accion_requerida;

-- Verificar estructura
SELECT 'Columnas de exportaciones_historial' AS tabla, COLUMN_NAME, DATA_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_academico' AND TABLE_NAME = 'exportaciones_historial'
ORDER BY ORDINAL_POSITION;
