// Servicio de API: gestiona los docentes (CRUD) y las consultas de materias/clases asignadas.
import API from './api';

// Obtiene la lista de todos los docentes.
export const getDocentes = async () => {
    try {
        const response = await API.get('/docentes');
        return response.data;
    } catch (error) {
        console.error('Error al obtener docentes:', error);
        throw error;
    }
};

// Obtiene un docente por su id.
export const getDocente = async (id) => {
    try {
        const response = await API.get(`/docentes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener docente:', error);
        throw error;
    }
};

// Crea un nuevo docente con los datos enviados.
export const createDocente = async (data) => {
    try {
        const response = await API.post('/docentes', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear docente:', error);
        throw error;
    }
};

// Actualiza un docente existente por su id.
export const updateDocente = async (id, data) => {
    try {
        const response = await API.put(`/docentes/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar docente:', error);
        throw error;
    }
};

// Elimina un docente por su id.
export const deleteDocente = async (id) => {
    try {
        const response = await API.delete(`/docentes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar docente:', error);
        throw error;
    }
};

// Obtiene las materias asignadas a un docente en un año lectivo.
export const getMateriasByDocente = async (idDocente, anioLectivo) => {
    try {
        const response = await API.get(`/docentes/${idDocente}/materias/${anioLectivo}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener materias del docente:', error);
        throw error;
    }
};

// Obtiene las clases asignadas a un docente en un año lectivo.
export const getClasesByDocente = async (idDocente, anioLectivo) => {
    try {
        const response = await API.get(`/docentes/${idDocente}/clases/${anioLectivo}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener clases del docente:', error);
        throw error;
    }
};