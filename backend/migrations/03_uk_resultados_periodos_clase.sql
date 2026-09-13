-- 03: Corregir indice unico de resultados_periodos.
-- El indice anterior (id_estudiante, id_materia, id_periodo) no incluia id_clase,
-- provocaba conflictos de clave unica al guardar notas de un estudiante que tiene
-- filas en otra clase (ej: datos de prueba con clase distinta a la actual).

-- Crear primero el nuevo indice para que las FK sigan teniendo indice en id_estudiante.
ALTER TABLE resultados_periodos
    ADD CONSTRAINT uk_estudiante_materia_periodo_clase
    UNIQUE (id_estudiante, id_materia, id_periodo, id_clase);

ALTER TABLE resultados_periodos DROP INDEX uk_estudiante_materia_periodo;
