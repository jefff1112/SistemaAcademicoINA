// Componente Avisos Dirección: publica, edita y elimina avisos internos.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra los avisos internos dirigidos al personal del instituto.
const AvisosDireccion = () => {
    // Estados: avisos, modal de edición, mensajes y datos del formulario.
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAviso, setEditingAviso] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        titulo: '',
        contenido: '',
        prioridad: 'media',
        activo: true
    });

    // Carga los avisos al montar el componente.
    useEffect(() => {
        cargarAvisos();
    }, []);

    // Obtiene los avisos internos desde la API.
    const cargarAvisos = async () => {
        try {
            // Petición GET /avisosinternos para listar los avisos publicados.
            const response = await API.get('/avisosinternos');
            setAvisos(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar avisos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Muestra un mensaje temporal al usuario y lo limpia después de 3 segundos.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 3000);
    };

    // Abre el modal para crear un aviso o editar el seleccionado.
    const handleOpenModal = (aviso = null) => {
        if (aviso) {
            setEditingAviso(aviso);
            setFormData({
                titulo: aviso.titulo || '',
                contenido: aviso.contenido || '',
                prioridad: aviso.prioridad || 'media',
                activo: aviso.activo !== undefined ? aviso.activo : true
            });
        } else {
            setEditingAviso(null);
            setFormData({
                titulo: '',
                contenido: '',
                prioridad: 'media',
                activo: true
            });
        }
        setShowModal(true);
    };

    // Guarda el aviso, creándolo o actualizándolo según corresponda.
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAviso) {
                // Petición PUT /avisosinternos/{id} para actualizar el aviso existente.
                await API.put(`/avisosinternos/${editingAviso.idAviso}`, formData);
                mostrarMensaje('Aviso actualizado correctamente', 'success');
            } else {
                // Petición POST /avisosinternos para crear un nuevo aviso.
                await API.post('/avisosinternos', formData);
                mostrarMensaje('Aviso creado correctamente', 'success');
            }
            setShowModal(false);
            cargarAvisos();
        } catch (error) {
            mostrarMensaje('Error al guardar', 'error');
        }
    };

    // Elimina un aviso tras confirmar con el usuario.
    const handleDelete = async (id) => {
        if (!window.confirm('Eliminar este aviso?')) return;
        try {
            // Petición DELETE /avisosinternos/{id} para borrar el aviso.
            await API.delete(`/avisosinternos/${id}`);
            mostrarMensaje('Aviso eliminado correctamente', 'success');
            cargarAvisos();
        } catch (error) {
            mostrarMensaje('Error al eliminar', 'error');
        }
    };

    // Devuelve el color que identifica la prioridad del aviso.
    const getPrioridadColor = (prioridad) => {
        switch (prioridad) {
            case 'alta': return '#dc2626';
            case 'media': return '#f59e0b';
            case 'baja': return '#16a34a';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Avisos">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Avisos - Direccion">
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Avisos</h3>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Nuevo Aviso
                    </button>
                </div>

                {avisos.length === 0 ? (
                    <p>No hay avisos publicados.</p>
                ) : (
                    avisos.map((a) => (
                        <div key={a.idAviso} style={{
                            padding: '12px 16px',
                            marginBottom: '8px',
                            background: a.activo ? '#f8fafc' : '#f3f4f6',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${getPrioridadColor(a.prioridad)}`,
                            opacity: a.activo ? 1 : 0.6
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <strong>{a.titulo}</strong>
                                    <span style={{
                                        marginLeft: '8px',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        backgroundColor: getPrioridadColor(a.prioridad),
                                        color: '#fff'
                                    }}>
                                        {a.prioridad}
                                    </span>
                                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#4b5563' }}>{a.contenido}</p>
                                    <small style={{ color: '#9ca3af' }}>
                                        Publicado: {new Date(a.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                                <div>
                                    <button className="btn-edit" onClick={() => handleOpenModal(a)}>Editar</button>
                                    <button className="btn-danger" onClick={() => handleDelete(a.idAviso)}>Eliminar</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingAviso ? 'Editar Aviso' : 'Nuevo Aviso'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Titulo *</label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Contenido *</label>
                                <textarea
                                    value={formData.contenido}
                                    onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                                    required
                                    rows="4"
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Prioridad</label>
                                <select
                                    value={formData.prioridad}
                                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                                    className="form-control"
                                >
                                    <option value="baja">Baja</option>
                                    <option value="media">Media</option>
                                    <option value="alta">Alta</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.activo}
                                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                    />
                                    {' '}Activo
                                </label>
                            </div>
                            <div className="modal-buttons">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {editingAviso ? 'Actualizar' : 'Publicar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AvisosDireccion;