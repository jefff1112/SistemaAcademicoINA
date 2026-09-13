// ============================================================
// src/services/resultadosService.js - VERSIÓN CORREGIDA
// Servicio de API: obtiene y guarda notas/resultados académicos de los estudiantes (notasperiodos y resultados-periodos).
// ============================================================
import axios from 'axios';

// URL base de la API, configurable por variable de entorno REACT_APP_API_URL.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5228/api';

const resultadosService = {
    // ============================================================
    // ✅ OBTENER NOTA DE ESTUDIANTE POR MATERIA
    // ============================================================
    getNotaEstudianteMateria: async (idEstudiante, idMateria) => {
        try {
            const response = await axios.get(
                `${API_URL}/resultados-periodos/estudiante/${idEstudiante}/materia/${idMateria}`
            );
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener nota:', error);
            return { notaAcumulada: 0 };
        }
    },

    // ============================================================
    // ✅ GUARDAR NOTA
    // ============================================================
    guardarNota: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/resultados-periodos`, data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al guardar nota:', error);
            throw error;
        }
    },

    // ============================================================
    // ✅ OBTENER TODAS LAS NOTAS DE UN ESTUDIANTE
    // ============================================================
    getResultadosByEstudiante: async (idEstudiante, idPeriodo = 1) => {
        try {
            const response = await axios.get(`${API_URL}/resultados-periodos/estudiante/${idEstudiante}/periodo/${idPeriodo}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener notas del estudiante:', error);
            return [];
        }
    },

    // ============================================================
    // ✅ GUARDAR MÚLTIPLES NOTAS
    // ============================================================
    guardarNotasMultiples: async (notas) => {
        try {
            const response = await axios.post(`${API_URL}/notas/guardar-multiple`, notas);
            return response.data;
        } catch (error) {
            console.error('❌ Error al guardar notas múltiples:', error);
            throw error;
        }
    },

    // ============================================================
    // MÉTODOS EXISTENTES (MANTENER POR COMPATIBILIDAD)
    // ============================================================
    getResultados: async (filtros = {}) => {
        const params = new URLSearchParams(filtros).toString();
        const url = params ? `${API_URL}/resultados-periodos?${params}` : `${API_URL}/resultados-periodos`;
        const response = await axios.get(url);
        return response.data;
    },

    getResultadosByClasePeriodo: async (idClase, idPeriodo) => {
        const response = await axios.get(`${API_URL}/resultados-periodos/clase/${idClase}/periodo/${idPeriodo}`);
        return response.data;
    },

    getResultadosFinalesByClase: async (idClase) => {
        const response = await axios.get(`${API_URL}/resultados-periodos/finales/clase/${idClase}`);
        return response.data;
    },

    getBoletaEstudiante: async (idEstudiante) => {
        const response = await axios.get(`${API_URL}/resultados-periodos/boleta/${idEstudiante}`);
        return response.data;
    },

    calcularNotasPeriodo: async (idClase, idPeriodo) => {
        const response = await axios.post(`${API_URL}/notas/calcular-periodo`, {
            idClase,
            idPeriodo
        });
        return response.data;
    },

    calcularNotasFinales: async (idClase) => {
        const response = await axios.post(`${API_URL}/notas/calcular-finales`, {
            idClase
        });
        return response.data;
    }
};

export default resultadosService;