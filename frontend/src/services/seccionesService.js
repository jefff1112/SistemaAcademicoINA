// Servicio de API: gestiona las secciones de las clases (CRUD).
import API from './api';

// Obtiene la lista de todas las secciones.
export const getSecciones = async () => {
    const response = await API.get('/secciones');
    return response.data;
};

// Obtiene una sección por su id.
export const getSeccion = async (id) => {
    const response = await API.get(`/secciones/${id}`);
    return response.data;
};

// Crea una nueva sección con los datos enviados.
export const createSeccion = async (data) => {
    const response = await API.post('/secciones', data);
    return response.data;
};

// Actualiza una sección existente por su id.
export const updateSeccion = async (id, data) => {
    const response = await API.put(`/secciones/${id}`, data);
    return response.data;
};

// Elimina una sección por su id.
export const deleteSeccion = async (id) => {
    const response = await API.delete(`/secciones/${id}`);
    return response.data;
};