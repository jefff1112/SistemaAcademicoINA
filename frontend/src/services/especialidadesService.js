// Servicio de API: gestiona las especialidades del bachillerato técnico (CRUD).
import API from './api';

// Obtiene la lista de todas las especialidades.
export const getEspecialidades = async () => {
    try {
        const response = await API.get('/especialidades');
        return response.data;
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        throw error;
    }
};

// Obtiene una especialidad por su id.
export const getEspecialidad = async (id) => {
    try {
        const response = await API.get(`/especialidades/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener especialidad:', error);
        throw error;
    }
};

// Crea una nueva especialidad con los datos enviados.
export const createEspecialidad = async (data) => {
    try {
        const response = await API.post('/especialidades', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear especialidad:', error);
        throw error;
    }
};

// Actualiza una especialidad existente por su id.
export const updateEspecialidad = async (id, data) => {
    try {
        const response = await API.put(`/especialidades/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar especialidad:', error);
        throw error;
    }
};

// Elimina una especialidad por su id.
export const deleteEspecialidad = async (id) => {
    try {
        const response = await API.delete(`/especialidades/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar especialidad:', error);
        throw error;
    }
};