// Servicio de API: consulta los niveles educativos registrados.
import API from './api';

// Obtiene la lista de todos los niveles educativos.
export const getNiveles = async () => {
    const response = await API.get('/clases/niveles');
    return response.data;
};

// Obtiene un nivel educativo por su id.
export const getNivel = async (id) => {
    const response = await API.get(`/clases/niveles/${id}`);
    return response.data;
};