// Servicio de API: gestiona las clases y los catálogos asociados (niveles, especialidades y secciones).
import API from './api';

// Obtiene la lista de todas las clases; relanza el error en caso de fallo.
export const getClases = async () => {
    try {
        const response = await API.get('/clases');
        return response.data;
    } catch (error) {
        console.error('Error al obtener clases:', error);
        throw error;
    }
};

// Obtiene una clase específica por su id.
export const getClase = async (id) => {
    try {
        const response = await API.get(`/clases/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener clase:', error);
        throw error;
    }
};

// Obtiene el catálogo de niveles educativos disponibles.
export const getNiveles = async () => {
    try {
        const response = await API.get('/clases/niveles');
        return response.data;
    } catch (error) {
        console.error('Error al obtener niveles:', error);
        throw error;
    }
};

// Obtiene el catálogo de especialidades disponibles.
export const getEspecialidades = async () => {
    try {
        const response = await API.get('/clases/especialidades');
        return response.data;
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        throw error;
    }
};

// Obtiene el catálogo de secciones disponibles.
export const getSecciones = async () => {
    try {
        const response = await API.get('/clases/secciones');
        return response.data;
    } catch (error) {
        console.error('Error al obtener secciones:', error);
        throw error;
    }
};

// Crea una nueva clase con los datos enviados.
export const createClase = async (data) => {
    try {
        const response = await API.post('/clases', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear clase:', error);
        throw error;
    }
};

// Actualiza una clase existente por su id.
export const updateClase = async (id, data) => {
    try {
        const response = await API.put(`/clases/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar clase:', error);
        throw error;
    }
};

// Elimina una clase por su id.
export const deleteClase = async (id) => {
    try {
        const response = await API.delete(`/clases/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar clase:', error);
        throw error;
    }
};