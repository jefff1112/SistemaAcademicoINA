// src/services/api.js
// Servicio de API: configura la instancia de Axios con la URL base del backend y los interceptores de token y errores.
import axios from 'axios';

// Instancia Axios con la URL base del backend.
// No forzamos Content-Type globalmente para permitir que Axios
// determine correctamente el encabezado (p.ej. multipart/form-data con boundary).
// En producción se usa REACT_APP_API_URL, en desarrollo fallback a localhost.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5228/api';

const API = axios.create({
    baseURL: API_URL
});

// Interceptor para agregar el token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Log de la URL completa con parámetros
        if (config.params) {
            const url = new URL(config.url, config.baseURL);
            Object.entries(config.params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
            console.log('📤 API Request:', config.method?.toUpperCase(), url.toString());
        } else {
            console.log('📤 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Solo redirigir si es 401 y NO es una petición que debe manejar el error
        if (error.response?.status === 401) {
            const url = error.config?.url || '';

            // ✅ EXCLUIR estas URLs del cierre de sesión
            const urlsExcluidas = [
                '/boleta/',
                '/notasdocente/mis-materias',
                '/resultados-periodos/',
                '/notas/'
            ];

            const debeExcluir = urlsExcluidas.some(u => url.includes(u));

            if (debeExcluir) {
                return Promise.reject(error);
            }

            // Si no está en la lista de excluidas, cerrar sesión
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;