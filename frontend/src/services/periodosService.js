// Servicio de API: gestiona los periodos académicos del año escolar (CRUD y consultas).
import API from './api';

// Obtiene la lista de todos los periodos académicos.
export const getPeriodos = async () => {
    const response = await API.get('/periodosacademicos');
    return response.data;
};

// Obtiene un periodo académico por su id.
export const getPeriodo = async (id) => {
    const response = await API.get(`/periodosacademicos/${id}`);
    return response.data;
};

// Obtiene el periodo académico activo.
export const getPeriodoActivo = async () => {
    const response = await API.get('/periodosacademicos/activo');
    return response.data;
};

// Obtiene los periodos de un año lectivo específico.
export const getPeriodosByAnio = async (anio) => {
    const response = await API.get(`/periodosacademicos/anio/${anio}`);
    return response.data;
};

// Crea un nuevo periodo académico con los datos enviados.
export const createPeriodo = async (data) => {
    const response = await API.post('/periodosacademicos', data);
    return response.data;
};

// Actualiza un periodo académico existente por su id.
export const updatePeriodo = async (id, data) => {
    const response = await API.put(`/periodosacademicos/${id}`, data);
    return response.data;
};

// Elimina un periodo académico por su id.
export const deletePeriodo = async (id) => {
    const response = await API.delete(`/periodosacademicos/${id}`);
    return response.data;
};