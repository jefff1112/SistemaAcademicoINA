// src/services/subActividadesService.js
// Servicio de API: gestiona las sub-actividades de una actividad
import API from './api';

const subActividadesService = {
    // Obtener sub-actividades de una actividad
    getByActividad: async (idActividad) => {
        try {
            const response = await API.get(`/SubActividades/actividad/${idActividad}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener sub-actividades:', error);
            throw error;
        }
    },

    // Obtener una sub-actividad por ID
    getById: async (id) => {
        try {
            const response = await API.get(`/SubActividades/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener sub-actividad:', error);
            throw error;
        }
    },

    // Crear sub-actividad
    crear: async (data) => {
        try {
            const response = await API.post('/SubActividades', data);
            return response.data;
        } catch (error) {
            console.error('Error al crear sub-actividad:', error);
            throw error;
        }
    },

    // Actualizar sub-actividad
    actualizar: async (id, data) => {
        try {
            const response = await API.put(`/SubActividades/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar sub-actividad:', error);
            throw error;
        }
    },

    // Eliminar sub-actividad
    eliminar: async (id) => {
        try {
            const response = await API.delete(`/SubActividades/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar sub-actividad:', error);
            throw error;
        }
    },

    // Crear estructura estándar (3 actividades × 5 sub-actividades)
    crearEstructuraEstandar: async (idActividades) => {
        try {
            const response = await API.post('/SubActividades/crear-estructura-estandar', { idActividades });
            return response.data;
        } catch (error) {
            console.error('Error al crear estructura estándar:', error);
            throw error;
        }
    }
};

export default subActividadesService;