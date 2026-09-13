// Servicio de API: gestiona los avisos internos del sistema (CRUD y consultas).
import API from './api';

// Obtiene los avisos internos activos; devuelve [] ante errores.
export const getAvisosActivos = async () => {
    try {
        const response = await API.get('/avisosinternos/activos');
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

// Obtiene todos los avisos internos; devuelve [] ante errores.
export const getAllAvisos = async () => {
    try {
        const response = await API.get('/avisosinternos');
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

// Crea un nuevo aviso interno con los datos enviados.
export const createAviso = async (data) => {
    const response = await API.post('/avisosinternos', data);
    return response.data;
};

// Actualiza un aviso interno por su id.
export const updateAviso = async (id, data) => {
    const response = await API.put(`/avisosinternos/${id}`, data);
    return response.data;
};

// Elimina un aviso interno por su id.
export const deleteAviso = async (id) => {
    const response = await API.delete(`/avisosinternos/${id}`);
    return response.data;
};