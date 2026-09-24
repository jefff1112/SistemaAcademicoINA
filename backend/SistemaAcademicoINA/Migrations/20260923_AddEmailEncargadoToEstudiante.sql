-- Migración: Agregar EmailEncargado a tabla estudiantes
-- Fecha: 2026-09-23
-- Descripción: Agrega campo email_encargado a estudiantes para el flujo de activación de cuentas de encargados

-- 1. Agregar columna email_encargado a estudiantes
ALTER TABLE `estudiantes` 
ADD COLUMN `email_encargado` VARCHAR(100) NULL 
AFTER `parentesco_encargado`;

-- 2. Crear índice único para email_encargado
-- En MySQL, UNIQUE index permite múltiples valores NULL (NULL != NULL)
CREATE UNIQUE INDEX `idx_estudiante_email_encargado` ON `estudiantes` (`email_encargado`);

-- 3. Verificar que el índice único en aspirantes ya existe (si no, crearlo)
-- En MySQL, UNIQUE index permite múltiples valores NULL
-- ALTER TABLE `aspirantes` ADD UNIQUE INDEX `idx_aspirante_email_encargado` (`email_encargado`);

-- 4. Sincronizar email_encargado existente de aspirantes a estudiantes (para datos ya migrados)
UPDATE `estudiantes` e
INNER JOIN `aspirantes` a ON e.`id_aspirante_origen` = a.`id_aspirante`
SET e.`email_encargado` = a.`email_encargado`
WHERE a.`email_encargado` IS NOT NULL 
  AND (e.`email_encargado` IS NULL OR e.`email_encargado` = '');