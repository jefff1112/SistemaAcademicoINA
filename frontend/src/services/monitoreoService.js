// Servicio de API: consulta el estado del espacio en disco del servidor para monitoreo.
import API from './api';

// Obtiene el espacio en disco actual del servidor.
export const getEspacioDisco = async () => {
    const response = await API.get('/monitoreo/espacio');
    return response.data;
};

// Obtiene el historial de uso de espacio de los últimos N días (por defecto 7).
export const getHistorialEspacio = async (dias = 7) => {
    const response = await API.get(`/monitoreo/espacio/historial?dias=${dias}`);
    return response.data;
};