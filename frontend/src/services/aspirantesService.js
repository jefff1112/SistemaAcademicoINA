// Servicio de API: gestiona aspirantes, cupos y el proceso de admisión
import API from './api';

export const getAspirantes = async () => {
    try {
        const response = await API.get('/aspirantes');
        return response.data;
    } catch (error) {
        console.error('Error al obtener aspirantes:', error);
        throw error;
    }
};

export const getAspirante = async (id) => {
    try {
        const response = await API.get(`/aspirantes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener aspirante:', error);
        throw error;
    }
};

// ============================================================
// Crear aspirante: usa axios con FormData.
// Axios detecta automáticamente FormData y establece el
// Content-Type correcto (multipart/form-data + boundary).
// NO forzar Content-Type manualmente.
// ============================================================
export const createAspirante = async (data) => {
    try {
        const response = await API.post('/aspirantes', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear aspirante:', error);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
        throw error;
    }
};

export const updateAspirante = async (id, data) => {
    try {
        const response = await API.put(`/aspirantes/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar aspirante:', error);
        throw error;
    }
};

export const deleteAspirante = async (id) => {
    try {
        const response = await API.delete(`/aspirantes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar aspirante:', error);
        throw error;
    }
};

export const registrarNotaExamen = async (data) => {
    try {
        const response = await API.post('/aspirantes/sp_registrar_nota_examen', data);
        return response.data;
    } catch (error) {
        console.error('Error al registrar nota:', error);
        throw error;
    }
};

export const aprobarAspirante = async (id, data) => {
    try {
        const response = await API.put(`/aspirantes/aprobar/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al aprobar aspirante:', error);
        throw error;
    }
};

export const matricularAspirante = async (id, data) => {
    try {
        const response = await API.post(`/aspirantes/matricular/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al matricular aspirante:', error);
        throw error;
    }
};

export const rechazarAspirante = async (id, data) => {
    try {
        const response = await API.put(`/aspirantes/rechazar/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al rechazar aspirante:', error);
        throw error;
    }
};

export const ponerEnEspera = async (id, data) => {
    try {
        const response = await API.put(`/aspirantes/espera/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al poner en espera:', error);
        throw error;
    }
};

export const getCupos = async () => {
    try {
        const response = await API.get('/aspirantes/cupos');
        return response.data;
    } catch (error) {
        console.error('Error al obtener cupos:', error);
        throw error;
    }
};

export const createCupo = async (data) => {
    try {
        const response = await API.post('/aspirantes/cupos', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear cupo:', error);
        throw error;
    }
};

export const updateCupo = async (id, data) => {
    try {
        const response = await API.put(`/aspirantes/cupos/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar cupo:', error);
        throw error;
    }
};

export const deleteCupo = async (id) => {
    try {
        const response = await API.delete(`/aspirantes/cupos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar cupo:', error);
        throw error;
    }
};

export const verificarAspirante = async (campo, valor) => {
    try {
        const params = {};
        params[campo] = valor.trim();
        const response = await API.get('/aspirantes/verificar', { params });
        return response.data;
    } catch (error) {
        console.error('Error al verificar:', error);
        throw error;
    }
};