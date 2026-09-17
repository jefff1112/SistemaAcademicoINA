// src/services/activacionesService.js
// Servicio de API: gestión de estudiantes con activación de cuenta pendiente.
import API from './api';

// Lista estudiantes con activación pendiente y el estado de su token.
export const listarPendientes = async () => {
    const response = await API.get('/activaciones/pendientes');
    return response.data;
};

// Reenvía el correo de activación (genera un nuevo token de 48h).
export const reenviarCorreo = async (usuarioId) => {
    const response = await API.post(`/activaciones/${usuarioId}/reenviar`);
    return response.data;
};

// Marca un estudiante en espera de activación.
export const marcarEspera = async (usuarioId, comentario) => {
    const response = await API.post(`/activaciones/${usuarioId}/marcar-espera`, { comentario });
    return response.data;
};

// Activa presencialmente creando una contraseña temporal.
export const activarPresencial = async (usuarioId, passwordTemporal) => {
    const response = await API.post(`/activaciones/${usuarioId}/activar-presencial`, { passwordTemporal });
    return response.data;
};