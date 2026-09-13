-- 09: Limpieza de datos de prueba y reset para nueva estructura de notas
-- Ejecutar después de la migración 08

-- 1. Eliminar calificaciones de actividades antiguas (tabla antigua)
DELETE FROM calificaciones_actividades;

-- 2. Eliminar actividades antiguas
DELETE FROM actividades;

-- 3. Eliminar resultados_periodos de prueba (se regenerarán desde sub-actividades)
DELETE FROM resultados_periodos;

-- 4. Eliminar auditoría de notas de prueba
DELETE FROM auditoria_notas;

-- 5. Verificar estructura nueva
SELECT 'sub_actividades' as tabla, COUNT(*) as registros FROM sub_actividades
UNION ALL
SELECT 'calificaciones_sub_actividades', COUNT(*) FROM calificaciones_sub_actividades
UNION ALL
SELECT 'resultados_periodos', COUNT(*) FROM resultados_periodos
UNION ALL
SELECT 'actividades', COUNT(*) FROM actividades;