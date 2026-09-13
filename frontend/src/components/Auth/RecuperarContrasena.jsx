// Componente RecuperarContrasena: solicita el envío de instrucciones de recuperación de contraseña por correo.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

// Componente principal: formulario de recuperación de contraseña.
const RecuperarContrasena = () => {
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Envía el correo del usuario a la API para iniciar la recuperación.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMensaje('');

        try {
            const response = await API.post('/auth/recuperar', { correo: email });
            setMensaje(response.data.mensaje);
        } catch (err) {
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Recuperar Contraseña</h1>
                    <p>Ingresa tu correo electrónico</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {mensaje && <div className="success-message">{mensaje}</div>}

                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? 'Enviando...' : 'Enviar instrucciones'}
                    </button>
                </form>

                <div className="login-footer">
                    <p><Link to="/login">Volver al inicio de sesión</Link></p>
                </div>
            </div>
        </div>
    );
};

export default RecuperarContrasena;