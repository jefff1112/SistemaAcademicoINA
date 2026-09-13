// Servicio de API: gestiona las materias del plan de estudios (CRUD y consultas por especialidad).
import API from './api';

// Obtiene la lista de todas las materias.
export const getMaterias = async () => {
    const response = await API.get('/materias');
    return response.data;
};

// Obtiene una materia por su id.
export const getMateria = async (id) => {
    const response = await API.get(`/materias/${id}`);
    return response.data;
};

// Obtiene las materias de una especialidad por idEspecialidad.
export const getMateriasByEspecialidad = async (idEspecialidad) => {
    const response = await API.get(`/materias/especialidad/${idEspecialidad}`);
    return response.data;
};

// Crea una nueva materia con los datos enviados.
export const createMateria = async (data) => {
    const response = await API.post('/materias', data);
    return response.data;
};

// Actualiza una materia existente por su id.
export const updateMateria = async (id, data) => {
    const response = await API.put(`/materias/${id}`, data);
    return response.data;
};

// Elimina una materia por su id.
export const deleteMateria = async (id) => {
    const response = await API.delete(`/materias/${id}`);
    return response.data;
};