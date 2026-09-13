// src/services/notasService.js
// Servicio de API: gestiona las notas de los estudiantes por materia y periodo (consultas, guardar, editar y eliminar).
import API from './api';

const notasService = {
    // Obtener nota específica de estudiante-materia
    getNota: async (idEstudiante, idMateria) => {
        try {
            const response = await API.get(`/resultados-periodos/estudiante/${idEstudiante}/materia/${idMateria}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener nota:', error);
            throw error;
        }
    },

    // Obtener nota específica de estudiante-materia-periodo
    getNotaPeriodo: async (idEstudiante, idMateria, idPeriodo) => {
        try {
            const response = await API.get(`/resultados-periodos/estudiante/${idEstudiante}/materia/${idMateria}/periodo/${idPeriodo}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener nota por periodo:', error);
            throw error;
        }
    },

    // Obtener todas las notas de un estudiante por periodo
    getNotasByEstudiantePeriodo: async (idEstudiante, idPeriodo) => {
        try {
            const response = await API.get(`/resultados-periodos/estudiante/${idEstudiante}/periodo/${idPeriodo}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener notas:', error);
            throw error;
        }
    },

    // Obtener notas de una clase por periodo
    getNotasByClasePeriodo: async (idClase, idPeriodo) => {
        try {
            const response = await API.get(`/resultados-periodos/clase/${idClase}/periodo/${idPeriodo}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener notas de clase:', error);
            throw error;
        }
    },

    // Guardar nueva nota
    guardarNota: async (data) => {
        try {
            const response = await API.post('/resultados-periodos', data);
            return response.data;
        } catch (error) {
            console.error('Error al guardar nota:', error);
            throw error;
        }
    },

    // Editar nota existente
    editarNota: async (id, data) => {
        try {
            const response = await API.put(`/resultados-periodos/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error al editar nota:', error);
            throw error;
        }
    },

    // Eliminar nota
    eliminarNota: async (id) => {
        try {
            const response = await API.delete(`/resultados-periodos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar nota:', error);
            throw error;
        }
    }
};

export default notasService;