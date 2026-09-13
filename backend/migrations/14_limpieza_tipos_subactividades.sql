-- ============================================================
-- MIGRACIÓN 14: Limpieza de tipos de sub-actividades
-- Ejecutar: mysql -u root -p sistema_academico < migrations/14_limpieza_tipos_subactividades.sql
-- ============================================================

USE sistema_academico;

-- 1. Convertir "Numerada" → "Subactividad"
UPDATE sub_actividades 
SET tipo_sub_actividad = 'Subactividad' 
WHERE tipo_sub_actividad = 'Numerada';

-- 2. Eliminar todas las sub-actividades de tipo "Porcentaje" (era una columna visual, no un dato real)
DELETE FROM calificaciones_sub_actividades 
WHERE id_sub_actividad IN (
    SELECT id_sub_actividad FROM sub_actividades WHERE tipo_sub_actividad = 'Porcentaje'
);

DELETE FROM sub_actividades 
WHERE tipo_sub_actividad = 'Porcentaje';

-- 3. Limpiar nombres en mayúsculas forzadas
UPDATE sub_actividades SET nombre_sub_actividad = 'Autoevaluación' WHERE nombre_sub_actividad = 'AUTOEVALUACIÓN';
UPDATE sub_actividades SET nombre_sub_actividad = 'Coevaluación' WHERE nombre_sub_actividad = 'COEVALUACIÓN';
UPDATE sub_actividades SET nombre_sub_actividad = REPLACE(nombre_sub_actividad, 'PRUEBA OBJETIVA', 'Prueba Objetiva') WHERE nombre_sub_actividad LIKE 'PRUEBA OBJETIVA%';

-- 4. Limpiar nombres con emojis o ponderación
UPDATE sub_actividades SET nombre_sub_actividad = 'Sub-actividad' WHERE nombre_sub_actividad REGEXP '^[0-9]+(\\.[0-9]+)?%$';

-- 5. Ajustar ponderaciones de autoevaluación y coevaluación para que sumen al 100%
-- (si tenían 0%, asignar una ponderación razonable)
UPDATE sub_actividades 
SET ponderacion = 10 
WHERE tipo_sub_actividad IN ('Autoevaluacion', 'Coevaluacion') 
AND ponderacion = 0;

-- 6. Verificación
SELECT '=== MIGRACIÓN 14 COMPLETADA ===' AS info;

SELECT tipo_sub_actividad, COUNT(*) AS cantidad 
FROM sub_actividades 
GROUP BY tipo_sub_actividad 
ORDER BY cantidad DESC;

SELECT 'Sub-actividades con nombres limpios' AS info, COUNT(*) AS cantidad
FROM sub_actividades
WHERE nombre_sub_actividad NOT REGEXP '^[0-9]+%' 
  AND nombre_sub_actividad != 'AUTOEVALUACIÓN'
  AND nombre_sub_actividad != 'COEVALUACIÓN';
