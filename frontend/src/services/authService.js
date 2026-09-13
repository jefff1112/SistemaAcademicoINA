// src/services/authService.js
// Servicio de autenticación: gestiona login/logout y el estado de sesión del usuario en localStorage.
import API from './api';

// Envía las credenciales (código y contraseña) al backend y devuelve la respuesta con el token.
export const login = async (codigo, contrasena) => {
    try {
        const response = await API.post('/auth/login', { codigo, contrasena });
        console.log('📦 Respuesta del servidor:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en login service:', error);
        throw error;
    }
};

// Cierra la sesión eliminando el token y los datos del usuario de localStorage.
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Devuelve el token de autenticación almacenado, o null si no existe.
export const getToken = () => {
    return localStorage.getItem('token');
};

// Devuelve el usuario guardado en localStorage parseado como objeto, o null si no hay datos.
export const getUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch {
            return null;
        }
    }
    return null;
};

// Indica si hay una sesión activa comprobando la existencia del token.
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};