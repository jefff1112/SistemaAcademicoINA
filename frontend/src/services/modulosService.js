// src/services/modulosService.js
// Servicio API de módulos de especialidad y asignación docente-módulo.
import API from './api';

const modulosService = {
    listar: async (especialidad, grado) => {
        const params = new URLSearchParams();
        if (especialidad) params.append('especialidad', especialidad);
        if (grado) params.append('grado', grado);
        const resp = await API.get(`/Modulos${params.toString() ? `?${params}` : ''}`);
        return resp.data;
    },

    crear: async (data) => {
        const resp = await API.post('/Modulos', data);
        return resp.data;
    },

    editar: async (id, data) => {
        const resp = await API.put(`/Modulos/${id}`, data);
        return resp.data;
    },

    eliminar: async (id) => {
        const resp = await API.delete(`/Modulos/${id}`);
        return resp.data;
    },

    generarEstructura: async (idClase) => {
        const resp = await API.post('/Modulos/generar-estructura', { idClase });
        return resp.data;
    },

    listarAsignaciones: async (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.clase) params.append('clase', filtros.clase);
        if (filtros.modulo) params.append('modulo', filtros.modulo);
        if (filtros.docente) params.append('docente', filtros.docente);
        if (filtros.anio) params.append('anio', filtros.anio);
        const resp = await API.get(`/DocenteModulos${params.toString() ? `?${params}` : ''}`);
        return resp.data;
    },

    asignar: async (data) => {
        const resp = await API.post('/DocenteModulos', data);
        return resp.data;
    },

    desasignar: async (id) => {
        const resp = await API.delete(`/DocenteModulos/${id}`);
        return resp.data;
    }
};

export default modulosService;