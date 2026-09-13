// Servicio de API: gestiona la conducta de los estudiantes y las faltas (consulta, anulación y apelación).
import API from './api';

// Obtiene el registro de conducta de un estudiante por idEstudiante.
export const getConductaByEstudiante = async (idEstudiante) => {
    const response = await API.get(`/conducta/estudiante/${idEstudiante}`);
    return response.data;
};

// Obtiene la conducta de un estudiante en un periodo específico.
export const getConductaByEstudiantePeriodo = async (idEstudiante, idPeriodo) => {
    const response = await API.get(`/conducta/estudiante/${idEstudiante}/periodo/${idPeriodo}`);
    return response.data;
};

// Crea un registro de conducta o falta con los datos enviados.
export const createConducta = async (data) => {
    const response = await API.post('/conducta', data);
    return response.data;
};

// Anula una falta registrada por su id.
export const anularFalta = async (id) => {
    const response = await API.put(`/conducta/${id}/anular`);
    return response.data;
};

// Apela una falta por su id enviando los datos de la apelación.
export const apelarFalta = async (id, data) => {
    const response = await API.put(`/conducta/${id}/apelar`, data);
    return response.data;
};