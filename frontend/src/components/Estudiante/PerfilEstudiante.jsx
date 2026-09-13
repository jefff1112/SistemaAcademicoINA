// Componente PerfilEstudiante: consulta y actualiza los datos personales del estudiante.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: formulario de datos personales del estudiante.
const PerfilEstudiante = () => {
    const [estudiante, setEstudiante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        correoEstudiante: '',
        telefonoMovil: '',
        direccion: ''
    });

    useEffect(() => {
        cargarPerfil();
    }, []);

    // Carga los datos del estudiante logueado.
    const cargarPerfil = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudianteData = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudianteData) {
                setEstudiante(estudianteData);
                setFormData({
                    nombres: estudianteData.nombres || '',
                    apellidos: estudianteData.apellidos || '',
                    correoEstudiante: estudianteData.correoEstudiante || '',
                    telefonoMovil: estudianteData.telefonoMovil || '',
                    direccion: estudianteData.direccion || ''
                });
            }
        } catch (error) {
            mostrarMensaje('Error al cargar perfil', 'error');
        } finally {
            setLoading(false);
        }
    };

    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 3000);
    };

    // Guarda los cambios del perfil del estudiante mediante la API.
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/estudiantes/${estudiante?.idEstudiante}`, formData);
            mostrarMensaje('Perfil actualizado correctamente', 'success');
        } catch (error) {
            mostrarMensaje('Error al actualizar perfil', 'error');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Mi Perfil">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mi Perfil - Estudiante">
            {message && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
                    color: messageType === 'success' ? '#15803d' : '#b91c1c'
                }}>
                    {message}
                </div>
            )}

            <div className="card">
                <h3>Datos Personales</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombres *</label>
                            <input
                                type="text"
                                value={formData.nombres}
                                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Apellidos *</label>
                            <input
                                type="text"
                                value={formData.apellidos}
                                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                required
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Correo Electronico</label>
                        <input
                            type="email"
                            value={formData.correoEstudiante}
                            onChange={(e) => setFormData({ ...formData, correoEstudiante: e.target.value })}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Telefono Movil</label>
                        <input
                            type="text"
                            value={formData.telefonoMovil}
                            onChange={(e) => setFormData({ ...formData, telefonoMovil: e.target.value })}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Direccion</label>
                        <textarea
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            rows="3"
                            className="form-control"
                        />
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                    }}>
                        <p><strong>Codigo:</strong> {estudiante?.codigoEstudiante}</p>
                        <p><strong>NIE:</strong> {estudiante?.nie || '-'}</p>
                        <p><strong>Clase:</strong> {estudiante?.clase?.nombreClase || 'No asignada'}</p>
                    </div>

                    <button type="submit" className="btn-primary">
                        Actualizar Perfil
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default PerfilEstudiante;