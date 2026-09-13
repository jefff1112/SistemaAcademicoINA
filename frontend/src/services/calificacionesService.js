// Servicio de API: gestiona las calificaciones de actividades (CRUD y consultas).
import API from './api';

// Obtiene la lista de todas las calificaciones desde el backend.
export const getCalificaciones = async () => {
    const response = await API.get('/calificacionesactividades');
    return response.data;
};

// Obtiene una calificación específica por su id.
export const getCalificacion = async (id) => {
    const response = await API.get(`/calificacionesactividades/${id}`);
    return response.data;
};

// Obtiene las calificaciones de una actividad por idActividad.
export const getCalificacionesByActividad = async (idActividad) => {
    const response = await API.get(`/calificacionesactividades/actividad/${idActividad}`);
    return response.data;
};

// Obtiene las calificaciones de un estudiante por idEstudiante.
export const getCalificacionesByEstudiante = async (idEstudiante) => {
    const response = await API.get(`/calificacionesactividades/estudiante/${idEstudiante}`);
    return response.data;
};

// Crea una nueva calificación con los datos enviados.
export const createCalificacion = async (data) => {
    const response = await API.post('/calificacionesactividades', data);
    return response.data;
};

// Actualiza una calificación existente por su id.
export const updateCalificacion = async (id, data) => {
    const response = await API.put(`/calificacionesactividades/${id}`, data);
    return response.data;
};

// Elimina una calificación por su id.
export const deleteCalificacion = async (id) => {
    const response = await API.delete(`/calificacionesactividades/${id}`);
    return response.data;
};