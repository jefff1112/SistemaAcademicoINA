// Servicio de API: gestiona las asistencias de estudiantes, su registro, justificación y configuración.
import API from './api';

// Obtiene las asistencias de un estudiante en un año lectivo; devuelve [] ante errores.
export const getAsistenciasByEstudiante = async (idEstudiante, anioLectivo) => {
    try {
        const response = await API.get(`/asistencias/estudiante/${idEstudiante}/${anioLectivo}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

// Obtiene las asistencias de una clase en una fecha dada; devuelve [] ante errores.
export const getAsistenciasClase = async (idClase, fecha) => {
    try {
        const response = await API.get(`/asistencias/clase/${idClase}/${fecha}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

// Registra una nueva asistencia en el backend.
export const registrarAsistencia = async (asistencia) => {
    const response = await API.post('/asistencias', asistencia);
    return response.data;
};

// Envía la justificación de una asistencia por su id.
export const justificarAsistencia = async (idAsistencia, justificacion) => {
    const response = await API.post(`/asistencias/justificar/${idAsistencia}`, justificacion);
    return response.data;
};

// Obtiene la configuración actual del módulo de asistencias.
export const getConfiguracionAsistencias = async () => {
    const response = await API.get('/asistencias/configuracion');
    return response.data;
};

// Actualiza la configuración del módulo de asistencias.
export const updateConfiguracionAsistencias = async (config) => {
    const response = await API.put('/asistencias/configuracion', config);
    return response.data;
};