// Servicio de API: gestiona los respaldos de la base de datos (listar, crear y eliminar).
import API from './api';

// Obtiene la lista de respaldos disponibles.
export const getRespaldos = async () => {
    const response = await API.get('/respaldos');
    return response.data;
};

// Solicita la creación de un respaldo de la base de datos.
export const crearRespaldo = async () => {
    const response = await API.post('/respaldos');
    return response.data;
};

// Elimina un respaldo existente por su nombre.
export const deleteRespaldo = async (nombre) => {
    const response = await API.delete(`/respaldos/${nombre}`);
    return response.data;
};