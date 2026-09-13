// src/components/Auth/Login.jsx
// Componente Login: autentica a los usuarios del sistema y los redirige según su rol.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicLayout from '../Layout/PublicLayout';
import './Login.css';

// Componente principal: formulario de acceso y envío de credenciales.
const Login = () => {
    const [codigo, setCodigo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Valida las credenciales con el contexto de autenticación y redirige por rol.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(codigo, contrasena);

            if (result.success) {
                const rol = result.user?.rol?.toLowerCase() || '';
                if (rol === 'docente') {
                    navigate('/docente/dashboard');
                } else if (rol === 'administrador' || result.user?.codigo === 'admin') {
                    navigate('/admin/dashboard');
                } else if (rol === 'direccion' || rol === 'director') {
                    navigate('/direccion/dashboard');
                } else if (rol === 'registro academico') {
                    navigate('/registro/dashboard');
                } else if (rol === 'estudiante') {
                    navigate('/estudiante/dashboard');
                } else if (rol === 'encargado') {
                    navigate('/encargado/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(result.error || 'Credenciales incorrectas');
            }
        } catch (err) {
            console.error('❌ Error en login:', err);
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>🏫 Sistema Académico INA</h1>
                        <p>Instituto Nacional de Apopa</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && <div className="login-error">{error}</div>}

                        <div className="form-group">
                            <label>Código</label>
                            <input
                                type="text"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                placeholder="Ingresa tu código"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="login-btn">
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                </div>
            </div>


        </PublicLayout>
    );
};

export default Login;