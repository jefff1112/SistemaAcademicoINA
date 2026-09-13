// Componente PerfilDocente: consulta y actualiza los datos personales y la contraseña del docente.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: formularios de datos personales y cambio de contraseña.
const PerfilDocente = () => {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [docente, setDocente] = useState(null);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        correo: '',
        telefono: '',
        especialidadDocente: '',
        tipoDocente: 'Basica'
    });
    const [passwordData, setPasswordData] = useState({
        actual: '',
        nueva: '',
        confirmar: ''
    });

    useEffect(() => {
        cargarPerfil();
    }, []);

    // Carga los datos del perfil del docente logueado.
    const cargarPerfil = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const docentesRes = await API.get('/docentes');
            const docenteData = docentesRes.data.find(d => d.codigoDocente === user?.codigo);

            if (docenteData) {
                setDocente(docenteData);
                setFormData({
                    nombres: docenteData.nombres || '',
                    apellidos: docenteData.apellidos || '',
                    correo: docenteData.correo || '',
                    telefono: docenteData.telefono || '',
                    especialidadDocente: docenteData.especialidadDocente || '',
                    tipoDocente: docenteData.tipoDocente || 'Basica'
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
        setTimeout(() => setMessage(''), 4000);
    };

    // Guarda los cambios del perfil del docente mediante la API.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend = {
                ...formData,
                idDocente: docente?.idDocente,
                codigoDocente: docente?.codigoDocente,
                estado: true
            };

            await API.put(`/docentes/${docente?.idDocente}`, dataToSend);
            mostrarMensaje('Perfil actualizado correctamente', 'success');
            cargarPerfil();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al actualizar', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Valida y ejecuta el cambio de contraseña del usuario.
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!passwordData.actual) {
            mostrarMensaje('Ingrese su contraseña actual', 'error');
            return;
        }
        if (!passwordData.nueva || passwordData.nueva.length < 6) {
            mostrarMensaje('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        if (passwordData.nueva !== passwordData.confirmar) {
            mostrarMensaje('Las contraseñas no coinciden', 'error');
            return;
        }

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await API.put(`/perfil/cambiar-password/${user?.idUsuario}`, {
                actual: passwordData.actual,
                nueva: passwordData.nueva
            });
            mostrarMensaje('Contraseña cambiada correctamente', 'success');
            setPasswordData({ actual: '', nueva: '', confirmar: '' });
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al cambiar contraseña', 'error');
        } finally {
            setLoading(false);
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
        <DashboardLayout title="Mi Perfil - Docente">
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
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombres *</label>
                            <input
                                type="text"
                                value={formData.nombres}
                                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                required
                                className="form-control"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Apellidos *</label>
                            <input
                                type="text"
                                value={formData.apellidos}
                                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                required
                                className="form-control"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Correo</label>
                            <input
                                type="email"
                                value={formData.correo}
                                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                className="form-control"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Telefono</label>
                            <input
                                type="text"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="form-control"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Especialidad</label>
                            <input
                                type="text"
                                value={formData.especialidadDocente}
                                onChange={(e) => setFormData({ ...formData, especialidadDocente: e.target.value })}
                                className="form-control"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tipo de Docente</label>
                            <select
                                value={formData.tipoDocente}
                                onChange={(e) => setFormData({ ...formData, tipoDocente: e.target.value })}
                                className="form-control"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                            >
                                <option value="Basica">Basica</option>
                                <option value="Tecnica">Tecnica</option>
                                <option value="Ambas">Ambas</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '6px' }}>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                            <strong>Codigo:</strong> {docente?.codigoDocente}
                            <span style={{ marginLeft: '12px' }}>
                                <strong>Estado:</strong> {docente?.estado ? 'Activo' : 'Inactivo'}
                            </span>
                        </p>
                    </div>

                    <div className="modal-buttons" style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '8px 24px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Cambiar Contraseña */}
            <div className="card">
                <h3>Cambiar Contraseña</h3>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Contraseña Actual *</label>
                        <input
                            type="password"
                            value={passwordData.actual}
                            onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                            required
                        />
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nueva Contraseña *</label>
                            <input
                                type="password"
                                value={passwordData.nueva}
                                onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })}
                                className="form-control"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                required
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Confirmar Nueva Contraseña *</label>
                            <input
                                type="password"
                                value={passwordData.confirmar}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })}
                                className="form-control"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-buttons" style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '8px 24px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default PerfilDocente;