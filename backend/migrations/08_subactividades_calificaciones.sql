-- 08: SubActividades, CalificacionesSubActividades y nota_recuperacion
-- Estructura para replicar el "Cuadro Auxiliar" del Excel oficial

-- 1. SubActividad: desglose de una Actividad en componentes evaluables con ponderación propia
CREATE TABLE IF NOT EXISTS sub_actividades (
    id_sub_actividad INT AUTO_INCREMENT PRIMARY KEY,
    id_actividad INT NOT NULL,
    nombre_sub_actividad VARCHAR(200) NOT NULL,
    ponderacion DECIMAL(5,2) NOT NULL CHECK (ponderacion >= 0 AND ponderacion <= 100),
    orden INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_actividad) REFERENCES actividades(id_actividad) ON DELETE CASCADE,
    INDEX idx_sub_actividad_actividad (id_actividad)
);

-- 2. CalificacionSubActividad: nota de cada estudiante en cada sub-actividad
CREATE TABLE IF NOT EXISTS calificaciones_sub_actividades (
    id_calificacion_sub INT AUTO_INCREMENT PRIMARY KEY,
    id_sub_actividad INT NOT NULL,
    id_estudiante INT NOT NULL,
    nota DECIMAL(5,2) CHECK (nota >= 0 AND nota <= 10),
    observaciones TEXT,
    registrado_por INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_sub_actividad) REFERENCES sub_actividades(id_sub_actividad) ON DELETE CASCADE,
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    UNIQUE KEY uk_estudiante_sub_actividad (id_estudiante, id_sub_actividad),
    INDEX idx_calif_sub_estudiante (id_estudiante),
    INDEX idx_calif_sub_actividad (id_sub_actividad)
);

-- 3. Agregar nota_recuperacion a resultados_periodos (columna CORRECCIÓN, RECUPERACIÓN del Excel)
ALTER TABLE resultados_periodos 
ADD COLUMN IF NOT EXISTS nota_recuperacion DECIMAL(5,2) CHECK (nota_recuperacion >= 0 AND nota_recuperacion <= 10) NULL,
ADD COLUMN IF NOT EXISTS observacion_recuperacion TEXT NULL;

-- 4. Vista para calcular nota de periodo desde sub-actividades
DROP VIEW IF EXISTS vista_notas_periodo_desde_subactividades;

CREATE VIEW vista_notas_periodo_desde_subactividades AS
SELECT 
    rp.id_resultado_periodo,
    rp.id_estudiante,
    rp.id_materia,
    rp.id_clase,
    rp.id_periodo,
    rp.nota_acumulada AS nota_manual,
    rp.nota_recuperacion,
    -- Cálculo automático desde sub-actividades
    COALESCE((
        SELECT 
            ROUND(SUM(ca.nota * (ca_sub.ponderacion / 100) * (a.ponderacion / 100)), 2)
        FROM calificaciones_sub_actividades ca
        JOIN sub_actividades ca_sub ON ca.id_sub_actividad = ca_sub.id_sub_actividad
        JOIN actividades a ON ca_sub.id_actividad = a.id_actividad
        WHERE a.id_materia = rp.id_materia
          AND a.id_clase = rp.id_clase
          AND a.id_docente IN (
              SELECT dm.id_docente FROM docente_materias dm 
              WHERE dm.id_materia = rp.id_materia 
              AND dm.id_clase = rp.id_clase 
              AND dm.anio_lectivo = (SELECT anio_lectivo FROM periodos_academicos WHERE id_periodo = rp.id_periodo)
              AND dm.estado = 1
          )
          AND ca.id_estudiante = rp.id_estudiante
    ), 0) AS nota_calculada_subactividades,
    -- Nota final = prioridad a recuperación, luego calculada, luego manual
    CASE 
        WHEN rp.nota_recuperacion IS NOT NULL AND rp.nota_recuperacion > 0 THEN rp.nota_recuperacion
        WHEN COALESCE((
            SELECT 
                ROUND(SUM(ca.nota * (ca_sub.ponderacion / 100) * (a.ponderacion / 100)), 2)
            FROM calificaciones_sub_actividades ca
            JOIN sub_actividades ca_sub ON ca.id_sub_actividad = ca_sub.id_sub_actividad
            JOIN actividades a ON ca_sub.id_actividad = a.id_actividad
            WHERE a.id_materia = rp.id_materia
              AND a.id_clase = rp.id_clase
              AND a.id_docente IN (
                  SELECT dm.id_docente FROM docente_materias dm 
                  WHERE dm.id_materia = rp.id_materia 
                  AND dm.id_clase = rp.id_clase 
                  AND dm.anio_lectivo = (SELECT anio_lectivo FROM periodos_academicos WHERE id_periodo = rp.id_periodo)
                  AND dm.estado = 1
              )
              AND ca.id_estudiante = rp.id_estudiante
        ), 0) > 0 THEN COALESCE((
            SELECT 
                ROUND(SUM(ca.nota * (ca_sub.ponderacion / 100) * (a.ponderacion / 100)), 2)
            FROM calificaciones_sub_actividades ca
            JOIN sub_actividades ca_sub ON ca.id_sub_actividad = ca_sub.id_sub_actividad
            JOIN actividades a ON ca_sub.id_actividad = a.id_actividad
            WHERE a.id_materia = rp.id_materia
              AND a.id_clase = rp.id_clase
              AND a.id_docente IN (
                  SELECT dm.id_docente FROM docente_materias dm 
                  WHERE dm.id_materia = rp.id_materia 
                  AND dm.id_clase = rp.id_clase 
                  AND dm.anio_lectivo = (SELECT anio_lectivo FROM periodos_academicos WHERE id_periodo = rp.id_periodo)
                  AND dm.estado = 1
              )
              AND ca.id_estudiante = rp.id_estudiante
        ), 0)
        ELSE rp.nota_acumulada
    END AS nota_final_periodo
FROM resultados_periodos rp;