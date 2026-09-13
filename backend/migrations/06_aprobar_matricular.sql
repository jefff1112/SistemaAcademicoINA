-- ============================================================
-- 06: flujo aprobar (Direccion) -> matricular (Registro Academico)
-- 1. Columna id_clase_asignada en aspirantes + FK a clases
-- 2. Backfill: la clase de los estudiantes ya generados
-- 3. Inscripciones retroactivas para el flujo anterior
-- ============================================================

-- 1. Clase asignada por Direccion al aprobar la solicitud.
ALTER TABLE `aspirantes`
    ADD COLUMN `id_clase_asignada` int DEFAULT NULL AFTER `especialidad_aspira`,
    ADD KEY `idx_aspirantes_clase_asignada` (`id_clase_asignada`),
    ADD CONSTRAINT `fk_aspirantes_clase_asignada` FOREIGN KEY (`id_clase_asignada`)
        REFERENCES `clases` (`id_clase`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. Backfill: los aspirantes ya convertidos heredan la clase de su estudiante.
UPDATE `aspirantes` a
JOIN `estudiantes` e ON e.`id_estudiante` = a.`id_estudiante_generado`
SET a.`id_clase_asignada` = e.`id_clase`
WHERE a.`id_clase_asignada` IS NULL
  AND e.`id_clase` IS NOT NULL;

-- 3. Inscripciones retroactivas ('Nuevo Ingreso' confirmada y aprobada) para
--    los estudiantes creados por el flujo anterior que no tienen inscripcion
--    en su anio de ingreso.
INSERT INTO `inscripciones`
    (`id_estudiante`, `id_clase`, `anio_lectivo`, `fecha_inscripcion`, `fecha_matricula`,
     `tipo_inscripcion`, `estado_inscripcion`, `estado_aprobacion`, `fecha_aprobacion`, `aprobado_por`,
     `numero_expediente`, `documentos_presentados`, `id_aspirante_origen`, `nie`, `carnet_menoridad`)
SELECT e.`id_estudiante`, e.`id_clase`, e.`ano_ingreso`,
       COALESCE(e.`fecha_matricula`, CURDATE()), COALESCE(e.`fecha_matricula`, CURDATE()),
       'Nuevo Ingreso', 'Confirmada', 'Aprobada',
       COALESCE(a.`fecha_aprobacion`, NOW()), COALESCE(a.`aprobado_por`, 'Sistema'),
       a.`numero_expediente`, a.`documentos_presentados`,
       a.`id_aspirante`, e.`nie`, e.`carnet_menoridad`
FROM `estudiantes` e
JOIN `aspirantes` a ON a.`id_aspirante` = e.`id_aspirante_origen`
WHERE e.`id_clase` IS NOT NULL
  AND e.`ano_ingreso` IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM `inscripciones` i
      WHERE i.`id_estudiante` = e.`id_estudiante`
        AND i.`anio_lectivo` = e.`ano_ingreso`
  );

-- Conecta la inscripcion retroactiva con su aspirante (la mas reciente).
UPDATE `aspirantes` a
SET a.`id_inscripcion_generada` = (
    SELECT MAX(i.`id_inscripciones`)
    FROM `inscripciones` i
    WHERE i.`id_aspirante_origen` = a.`id_aspirante`
)
WHERE a.`id_inscripcion_generada` IS NULL
  AND EXISTS (
      SELECT 1 FROM `inscripciones` i
      WHERE i.`id_aspirante_origen` = a.`id_aspirante`
  );