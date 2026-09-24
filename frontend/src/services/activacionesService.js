// src/services/activacionesService.js
// Servicio de API: gestión de activaciones pendientes (Estudiantes y Encargados).
import API from './api';

// Lista activaciones pendientes con filtro por tipo.
// tipo: 'estudiantes' | 'encargados' | 'todos' (default: 'todos')
export const listarPendientes = async (tipo = 'todos') => {
    const response = await API.get(`/activaciones/pendientes?tipo=${encodeURIComponent(tipo)}`);
    return response.data;
};

// Reenvía el correo de activación (genera un nuevo token de 48h).
// Funciona para Estudiante y Encargado (el backend detecta el rol).
export const reenviarCorreo = async (usuarioId) => {
    const response = await API.post(`/activaciones/${usuarioId}/reenviar`);
    return response.data;
};

// Marca en espera de activación.
// Funciona para Estudiante y Encargado.
export const marcarEspera = async (usuarioId, comentario) => {
    const response = await API.post(`/activaciones/${usuarioId}/marcar-espera`, { comentario });
    return response.data;
};

// Activa presencialmente creando una contraseña temporal.
// Funciona para Estudiante y Encargado.
export const activarPresencial = async (usuarioId, passwordTemporal) => {
    const response = await API.post(`/activaciones/${usuarioId}/activar-presencial`, { passwordTemporal });
    return response.data;
};