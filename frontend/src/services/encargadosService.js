// Servicio de API (mock temporal): consultas de estudiantes, notas y asistencias para los encargados mientras se completa el backend.
// Versión mock mientras se completa el backend
// Devuelve datos mock de los estudiantes a cargo de un encargado por idUsuario.
export const getEstudiantesByEncargado = async (idUsuario) => {
    // Datos mock para prueba
    return [
        {
            idEstudiante: 1,
            nombres: 'Ana Lucia',
            apellidos: 'Perez Gomez',
            codigoEstudiante: '2026-00001-INA',
            nie: 'NIE-2026-001',
            parentesco: 'Madre',
            clase: { nombreClase: 'Primero Bachillerato General A', seccion: 'A' }
        },
        {
            idEstudiante: 2,
            nombres: 'Valeria Nicole',
            apellidos: 'Mendoza Rivas',
            codigoEstudiante: '2026-00002-INA',
            nie: 'NIE-2026-002',
            parentesco: 'Padre',
            clase: { nombreClase: 'Primero Especialidad Desarrollo Software C', seccion: 'C' }
        }
    ];
};

// Devuelve notas mock de un estudiante en un año lectivo.
export const getNotasEstudiante = async (idEstudiante, anioLectivo) => {
    return [
        { nombreMateria: 'Matematicas', tipoMateria: 'Basica', notaFinal: 8.5, estado: 'Aprobado' },
        { nombreMateria: 'Ciencias', tipoMateria: 'Basica', notaFinal: 8.0, estado: 'Aprobado' },
        { nombreMateria: 'Ingles', tipoMateria: 'Basica', notaFinal: 9.0, estado: 'Aprobado' }
    ];
};

// Devuelve asistencias mock de un estudiante en un año lectivo.
export const getAsistenciasEstudiante = async (idEstudiante, anioLectivo) => {
    return [
        { fecha: '2026-06-01', estado: 'Presente', horaRegistro: '07:15:00', justificacion: null },
        { fecha: '2026-06-02', estado: 'Presente', horaRegistro: '07:10:00', justificacion: null },
        { fecha: '2026-06-03', estado: 'Ausente', horaRegistro: null, justificacion: 'Enfermedad' }
    ];
};