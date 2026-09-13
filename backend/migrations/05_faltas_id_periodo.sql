-- Asocia cada falta/amonestación a su periodo académico (id_periodo) en lugar de depender solo del rango de fechas.
ALTER TABLE `faltas_amonestaciones`
  ADD COLUMN `id_periodo` INT NULL AFTER `fecha`,
  ADD KEY `idx_faltas_periodo` (`id_periodo`),
  ADD CONSTRAINT `fk_faltas_periodo` FOREIGN KEY (`id_periodo`)
    REFERENCES `periodos_academicos` (`id_periodo`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: asigna el periodo de las faltas existentes según su fecha.
UPDATE `faltas_amonestaciones` f
LEFT JOIN `periodos_academicos` p
  ON f.fecha BETWEEN p.fecha_inicio AND p.fecha_fin
SET f.id_periodo = p.id_periodo;