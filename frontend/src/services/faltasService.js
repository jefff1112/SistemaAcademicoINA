// Servicio de API: gestiona las faltas disciplinarias de los estudiantes (consultas y actualización de estado).
import API from './api';

// Obtiene la lista de todas las faltas registradas.
export const getFaltas = async () => {
    const response = await API.get('/faltas');
    return response.data;
};

// Obtiene una falta por su id.
export const getFalta = async (id) => {
    const response = await API.get(`/faltas/${id}`);
    return response.data;
};

// Obtiene las faltas de un estudiante por idEstudiante.
export const getFaltasByEstudiante = async (idEstudiante) => {
    const response = await API.get(`/faltas/estudiante/${idEstudiante}`);
    return response.data;
};

// Obtiene el resumen de faltas de un estudiante por idEstudiante.
export const getResumenFaltas = async (idEstudiante) => {
    const response = await API.get(`/faltas/resumen/estudiante/${idEstudiante}`);
    return response.data;
};

// Actualiza el estado de una falta por su id (ej. anulada, apelada).
export const updateEstadoFalta = async (id, data) => {
    const response = await API.put(`/faltas/${id}/estado`, data);
    return response.data;
};