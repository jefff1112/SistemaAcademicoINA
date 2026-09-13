// src/contexts/AuthContext.jsx
// Contexto AuthContext: gestiona el estado global de autenticación (usuario, token, login y logout).
import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin } from '../services/authService';

const AuthContext = createContext();

// Proveedor que restaura la sesión desde localStorage al montar la aplicación.
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('❌ Error restaurando usuario:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    }, []);

    // Autentica al usuario con la API y guarda el token y sus datos en localStorage.
    const login = async (codigo, contrasena) => {
        try {
            const response = await apiLogin(codigo, contrasena);

            // ✅ VERIFICAR que la respuesta tiene token
            if (response && response.token) {
                // ✅ Guardar token en localStorage
                localStorage.setItem('token', response.token);

                // ✅ Construir objeto usuario
                const userData = {
                    idUsuario: response.idUsuario || response.user?.id || response.user?.idUsuario || 0,
                    nombres: response.nombres || response.user?.nombres || '',
                    apellidos: response.apellidos || response.user?.apellidos || '',
                    codigo: response.codigo || response.user?.codigo || '',
                    correo: response.correo || response.user?.correo || '',
                    rol: response.rol || response.user?.rol || response.user?.Rol || 'Usuario',
                    token: response.token
                };

                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);

                return { success: true, user: userData };
            }

            console.error('❌ Login fallido: No se recibió token');
            return { success: false, error: 'Credenciales incorrectas' };
        } catch (error) {
            console.error('❌ Error en login:', error);
            return { success: false, error: error.response?.data?.mensaje || error.message || 'Error al iniciar sesión' };
        }
    };

    // Cierra la sesión limpiando el almacenamiento local y el estado del usuario.
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;