// Servicio de API: gestiona los grados académicos (CRUD y consultas por nivel).
import API from './api';

// Obtiene la lista de todos los grados.
export const getGrados = async () => {
    const response = await API.get('/grados');
    return response.data;
};

// Obtiene un grado por su id.
export const getGrado = async (id) => {
    const response = await API.get(`/grados/${id}`);
    return response.data;
};

// Obtiene los grados pertenecientes a un nivel por idNivel.
export const getGradosByNivel = async (idNivel) => {
    const response = await API.get(`/grados/nivel/${idNivel}`);
    return response.data;
};

// Crea un nuevo grado con los datos enviados.
export const createGrado = async (data) => {
    const response = await API.post('/grados', data);
    return response.data;
};

// Actualiza un grado existente por su id.
export const updateGrado = async (id, data) => {
    const response = await API.put(`/grados/${id}`, data);
    return response.data;
};

// Elimina un grado por su id.
export const deleteGrado = async (id) => {
    const response = await API.delete(`/grados/${id}`);
    return response.data;
};