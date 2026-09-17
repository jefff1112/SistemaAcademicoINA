// src/services/reportesService.js
// Servicio de API: reportes de datos incorrectos de estudiantes (crear, listar, aprobar, rechazar, revisión).
import API from './api';

// Crea uno o varios reportes desde la página de activación (protegido por token de activación).
export const crearReportes = async (token, reportes) => {
    const response = await API.post('/reportes-datos', { token, reportes });
    return response.data;
};

// Lista reportes con filtros opcionales.
export const listarReportes = async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    if (filtros.estudianteId) params.append('estudianteId', filtros.estudianteId);
    if (filtros.campo) params.append('campo', filtros.campo);
    const response = await API.get(`/reportes-datos?${params.toString()}`);
    return response.data;
};

// Aprueba una corrección (aplica el dato al estudiante).
export const aprobarReporte = async (id) => {
    const response = await API.put(`/reportes-datos/${id}/aprobar`);
    return response.data;
};

// Rechaza un reporte con motivo obligatorio.
export const rechazarReporte = async (id, motivo) => {
    const response = await API.put(`/reportes-datos/${id}/rechazar`, { motivo });
    return response.data;
};

// Marca un reporte en revisión.
export const marcarEnRevision = async (id) => {
    const response = await API.put(`/reportes-datos/${id}/en-revision`);
    return response.data;
};