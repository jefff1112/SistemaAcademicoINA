// Servicio de API: gestiona aspirantes, cupos y el proceso de admisión (CRUD y flujos de registro/rechazo).
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

export const createAspirante = async (data) => {
    try {
        if (data instanceof FormData) {
            const token = localStorage.getItem('token');
            const baseURL = API.defaults?.baseURL || '';
            const url = `${baseURL}/aspirantes`;

            const headers = {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            };

            const resp = await fetch(url, {
                method: 'POST',
                body: data,
                headers
            });

            const resJson = await resp.json().catch(() => null);

            if (!resp.ok) {
                const error = new Error(resJson?.mensaje || 'Error en creación de aspirante');
                error.response = { data: resJson, status: resp.status };
                throw error;
            }
            return resJson;
        }

        const response = await API.post('/aspirantes', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear aspirante:', error);
        throw error;
    }
};

export const updateAspirante = async (id, data) => {
    try {
        const response = await API.patch(`/aspirantes/${id}`, data);
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
        const response = await API.get('/aspirantes/verificar', {
            params: { [campo]: valor.trim() }
        });
        return response.data;
    } catch (error) {
        console.error('Error al verificar:', error);
        throw error;
    }
};