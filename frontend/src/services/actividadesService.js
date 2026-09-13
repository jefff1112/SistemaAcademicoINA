// Servicio de API: gestiona las peticiones al backend para las actividades académicas (CRUD y consultas).
import API from './api';

// Obtiene la lista de todas las actividades desde el backend.
export const getActividades = async () => {
    const response = await API.get('/actividades');
    return response.data;
};

// Obtiene una actividad específica por su id.
export const getActividad = async (id) => {
    const response = await API.get(`/actividades/${id}`);
    return response.data;
};

// Obtiene las actividades de una clase por idClase.
export const getActividadesByClase = async (idClase) => {
    const response = await API.get(`/actividades/clase/${idClase}`);
    return response.data;
};

// Obtiene las actividades asignadas a un docente por idDocente.
export const getActividadesByDocente = async (idDocente) => {
    const response = await API.get(`/actividades/docente/${idDocente}`);
    return response.data;
};

// Crea una nueva actividad con los datos enviados.
export const createActividad = async (data) => {
    const response = await API.post('/actividades', data);
    return response.data;
};

// Actualiza una actividad existente por su id.
export const updateActividad = async (id, data) => {
    const response = await API.put(`/actividades/${id}`, data);
    return response.data;
};

// Elimina una actividad por su id.
export const deleteActividad = async (id) => {
    const response = await API.delete(`/actividades/${id}`);
    return response.data;
};