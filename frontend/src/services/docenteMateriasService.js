// Servicio de API: gestiona la asignación de materias a docentes (CRUD y consultas por docente/clase).
import API from './api';

// Obtiene la lista de todas las asignaciones docente-materia.
export const getDocenteMaterias = async () => {
    const response = await API.get('/docentematerias');
    return response.data;
};

// Obtiene una asignación docente-materia por su id.
export const getDocenteMateria = async (id) => {
    const response = await API.get(`/docentematerias/${id}`);
    return response.data;
};

// Obtiene las materias asignadas a un docente por idDocente en un año lectivo.
export const getDocenteMateriasByDocente = async (idDocente, anio) => {
    const response = await API.get(`/docentematerias/docente/${idDocente}/anio/${anio}`);
    return response.data;
};

// Obtiene las materias asignadas a una clase por idClase en un año lectivo.
export const getDocenteMateriasByClase = async (idClase, anio) => {
    const response = await API.get(`/docentematerias/clase/${idClase}/anio/${anio}`);
    return response.data;
};

// Crea una nueva asignación docente-materia.
export const createDocenteMateria = async (data) => {
    const response = await API.post('/docentematerias', data);
    return response.data;
};

// Actualiza una asignación docente-materia por su id.
export const updateDocenteMateria = async (id, data) => {
    const response = await API.put(`/docentematerias/${id}`, data);
    return response.data;
};

// Elimina una asignación docente-materia por su id.
export const deleteDocenteMateria = async (id) => {
    const response = await API.delete(`/docentematerias/${id}`);
    return response.data;
};