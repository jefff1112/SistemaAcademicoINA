// Servicio de API: gestiona las inscripciones de estudiantes a clases (consultas y cambios de estado).
import API from './api';

// Obtiene la lista de todas las inscripciones.
export const getInscripciones = async () => {
    const response = await API.get('/inscripciones');
    return response.data;
};

// Obtiene una inscripción por su id.
export const getInscripcion = async (id) => {
    const response = await API.get(`/inscripciones/${id}`);
    return response.data;
};

// Obtiene las inscripciones de un estudiante por idEstudiante.
export const getInscripcionesByEstudiante = async (idEstudiante) => {
    const response = await API.get(`/inscripciones/estudiante/${idEstudiante}`);
    return response.data;
};

// Obtiene las inscripciones de una clase en un año lectivo.
export const getInscripcionesByClaseAnio = async (idClase, anio) => {
    const response = await API.get(`/inscripciones/clase/${idClase}/anio/${anio}`);
    return response.data;
};

// Crea una nueva inscripción con los datos enviados.
export const createInscripcion = async (data) => {
    const response = await API.post('/inscripciones', data);
    return response.data;
};

// Actualiza el estado de una inscripción por su id (ej. activa, retirada).
export const updateEstadoInscripcion = async (id, data) => {
    const response = await API.put(`/inscripciones/${id}/estado`, data);
    return response.data;
};