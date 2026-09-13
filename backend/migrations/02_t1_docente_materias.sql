-- T1: Asignación docente->materia->clase
-- Índices únicos para evitar duplicados en la asignación

-- NOTA: desde T1, la desasignación de materias es BORRADO FÍSICO (DELETE),
-- por lo que no quedan filas desactivadas ocupando slots de unicidad.

-- (0) Limpieza previa: eliminar asignaciones inactivas (residuos de soft-delete)
DELETE FROM docente_materias WHERE estado = 0;

-- (1) Un docente no puede impartir la misma materia a la misma clase dos veces en el mismo año
ALTER TABLE docente_materias
    ADD CONSTRAINT uk_docente_materia_clase
    UNIQUE (id_docente, id_materia, id_clase, anio_lectivo);

-- (2) Una materia+clase no puede tener DOS docentes distintos en el mismo año
-- (impide que dos profesores compartan la misma materia con la misma sección)
ALTER TABLE docente_materias
    ADD CONSTRAINT uk_materia_clase_docente
    UNIQUE (id_materia, id_clase, anio_lectivo);
