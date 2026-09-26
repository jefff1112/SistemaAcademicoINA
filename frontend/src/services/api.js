import axios from 'axios';

// ============================================================
// URL base del backend .NET
// En desarrollo: http://localhost:5080/api
// En producción se puede sobreescribir con REACT_APP_API_URL
// ============================================================
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

// ============================================================
// Instancia de axios
// NO definir 'Content-Type' en el default.
// Axios detecta automáticamente:
//   - Objeto JS  → application/json
//   - FormData   → multipart/form-data (con boundary correcto)
// ============================================================
const API = axios.create({
    baseURL: API_URL
});

// ============================================================
// Endpoints públicos que NUNCA deben redirigir al login en 401
// ============================================================
const ENDPOINTS_PUBLICOS = [
    '/aspirantes/verificar',
    '/aspirantes'
];

const esEndpointPublico = (url = '') =>
    ENDPOINTS_PUBLICOS.some(p => url.includes(p));

// ============================================================
// Interceptor de solicitudes: agrega el token JWT si existe
// ============================================================
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================
// Interceptor de respuestas
// - 401 en endpoint público → NO redirige, solo propaga el error
// - 401 en endpoint protegido → limpia sesión y redirige al login
// ============================================================
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';

        if (status === 401 && !esEndpointPublico(url)) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default API;