// Componente Notificaciones (Admin): gestiona correos y notificaciones internas del sistema.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { MdEmail, MdMarkEmailRead, MdDelete, MdEdit, MdNotificationsActive, MdSend } from 'react-icons/md';

// Componente principal: centro de notificaciones con envío, edición y borrado.
const Notificaciones = () => {
    // Estados: notificaciones, modales, formulario de envío y tipo de notificación.
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedNotificacion, setSelectedNotificacion] = useState(null);
    const [emailData, setEmailData] = useState({
        destinatario: '',
        asunto: '',
        mensaje: '',
        archivoAdjunto: null,
        fechaProgramada: ''
    });
    const [tipoNotificacion, setTipoNotificacion] = useState('email');

    // Carga las notificaciones al montar el componente.
    useEffect(() => {
        cargarNotificaciones();
    }, []);

    // Obtiene las notificaciones del sistema desde la API.
    const cargarNotificaciones = async () => {
        try {
            // Petición GET /notificaciones para listar las notificaciones.
            const response = await API.get('/notificaciones');
            setNotificaciones(response.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Marca una notificación como leída y refresca la lista.
    const marcarLeida = async (id) => {
        try {
            // Petición POST /notificaciones/marcar-leida/{id} para marcar como leída.
            await API.post(`/notificaciones/marcar-leida/${id}`);
            cargarNotificaciones();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Elimina una notificación tras confirmar con el usuario.
    const eliminarNotificacion = async (id) => {
        if (!window.confirm('Eliminar esta notificacion?')) return;
        try {
            // Petición DELETE /notificaciones/{id} para borrar la notificación.
            await API.delete(`/notificaciones/${id}`);
            alert('Notificacion eliminada');
            cargarNotificaciones();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    // Actualiza el título y mensaje de la notificación seleccionada.
    const editarNotificacion = async (e) => {
        e.preventDefault();
        try {
            // Petición PUT /notificaciones/{id} para actualizar la notificación.
            await API.put(`/notificaciones/${selectedNotificacion.id}`, {
                titulo: emailData.asunto,
                mensaje: emailData.mensaje
            });
            alert('Notificacion actualizada');
            setShowEditModal(false);
            cargarNotificaciones();
        } catch (error) {
            alert('Error al actualizar');
        }
    };

    // Carga la notificación seleccionada en el formulario de edición.
    const abrirEditar = (notificacion) => {
        setSelectedNotificacion(notificacion);
        setEmailData({
            ...emailData,
            asunto: notificacion.titulo,
            mensaje: notificacion.mensaje
        });
        setShowEditModal(true);
    };

    // Envía la notificación: correo electrónico con adjunto o notificación interna.
    const enviarNotificacion = async (e) => {
        e.preventDefault();

        if (tipoNotificacion === 'email') {
            if (!emailData.destinatario || !emailData.asunto || !emailData.mensaje) {
                alert('Complete todos los campos');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('destinatario', emailData.destinatario);
                formData.append('asunto', emailData.asunto);
                formData.append('mensaje', emailData.mensaje);
                if (emailData.archivoAdjunto) {
                    formData.append('archivo', emailData.archivoAdjunto);
                }
                if (emailData.fechaProgramada) {
                    formData.append('fechaProgramada', emailData.fechaProgramada);
                }

                // Petición POST /notificaciones/enviar-email con adjuntos y fecha programada opcionales.
                await API.post('/notificaciones/enviar-email', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Correo enviado correctamente');
                setShowModal(false);
                resetForm();
                cargarNotificaciones();
            } catch (error) {
                alert('Error al enviar correo');
            }
        } else {
            if (!emailData.asunto || !emailData.mensaje) {
                alert('Complete todos los campos');
                return;
            }

            try {
                // Petición POST /notificaciones/interna para crear la notificación interna.
                await API.post('/notificaciones/interna', {
                    titulo: emailData.asunto,
                    mensaje: emailData.mensaje
                });
                alert('Notificacion interna creada');
                setShowModal(false);
                resetForm();
                cargarNotificaciones();
            } catch (error) {
                alert('Error al crear notificacion');
            }
        }
    };

    // Limpia el formulario y restablece el tipo de notificación a correo.
    const resetForm = () => {
        setEmailData({
            destinatario: '',
            asunto: '',
            mensaje: '',
            archivoAdjunto: null,
            fechaProgramada: ''
        });
        setTipoNotificacion('email');
    };

    // Marca como leídas todas las notificaciones pendientes de la lista.
    const marcarTodasLeidas = async () => {
        for (const n of notificaciones) {
            if (!n.leida) {
                // Petición POST /notificaciones/marcar-leida/{id} por cada notificación no leída.
                await API.post(`/notificaciones/marcar-leida/${n.id}`);
            }
        }
        cargarNotificaciones();
        alert('Todas las notificaciones marcadas como leidas');
    };

    if (loading) {
        return (
            <DashboardLayout title="Notificaciones">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Centro de Notificaciones">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3>Notificaciones del Sistema</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-secondary" onClick={marcarTodasLeidas}>
                            <MdMarkEmailRead size={16} /> Marcar todas como leidas
                        </button>
                        <button className="btn-primary" onClick={() => setShowModal(true)}>
                            <MdNotificationsActive size={18} /> Nueva Notificacion
                        </button>
                    </div>
                </div>

                {notificaciones.length === 0 ? (
                    <p>No hay notificaciones disponibles.</p>
                ) : (
                    <div className="notificaciones-list">
                        {notificaciones.map(n => (
                            <div
                                key={n.id}
                                className={`notificacion-item ${!n.leida ? 'no-leida' : ''}`}
                            >
                                <div className="notificacion-icon" onClick={() => marcarLeida(n.id)}>
                                    {!n.leida ? <MdEmail size={24} color="#1e3a5f" /> : <MdMarkEmailRead size={24} color="#999" />}
                                </div>
                                <div className="notificacion-content">
                                    <div className="notificacion-titulo">{n.titulo}</div>
                                    <div className="notificacion-mensaje">{n.mensaje}</div>
                                    <div className="notificacion-fecha">{new Date(n.fecha).toLocaleString()}</div>
                                </div>
                                <div className="notificacion-acciones">
                                    <button className="btn-edit-small" onClick={() => abrirEditar(n)}>
                                        <MdEdit size={14} /> Editar
                                    </button>
                                    <button className="btn-delete-small" onClick={() => eliminarNotificacion(n.id)}>
                                        <MdDelete size={14} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>Nueva Notificacion</h3>
                            <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>X</button>
                        </div>
                        <form onSubmit={enviarNotificacion}>
                            <div className="form-group">
                                <label>Tipo de Notificacion</label>
                                <select
                                    value={tipoNotificacion}
                                    onChange={(e) => setTipoNotificacion(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="email">Correo Electronico</option>
                                    <option value="interna">Notificacion Interna</option>
                                </select>
                            </div>

                            {tipoNotificacion === 'email' && (
                                <div className="form-group">
                                    <label>Destinatario (Correo Electronico)</label>
                                    <input
                                        type="email"
                                        value={emailData.destinatario}
                                        onChange={(e) => setEmailData({ ...emailData, destinatario: e.target.value })}
                                        required
                                        className="form-control"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Asunto / Titulo</label>
                                <input
                                    type="text"
                                    value={emailData.asunto}
                                    onChange={(e) => setEmailData({ ...emailData, asunto: e.target.value })}
                                    required
                                    className="form-control"
                                    placeholder="Asunto de la notificacion"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mensaje</label>
                                <textarea
                                    value={emailData.mensaje}
                                    onChange={(e) => setEmailData({ ...emailData, mensaje: e.target.value })}
                                    required
                                    rows="5"
                                    className="form-control"
                                    placeholder="Escriba el mensaje aqui..."
                                />
                            </div>

                            {tipoNotificacion === 'email' && (
                                <>
                                    <div className="form-group">
                                        <label>Adjuntar Archivo (opcional)</label>
                                        <input
                                            type="file"
                                            onChange={(e) => setEmailData({ ...emailData, archivoAdjunto: e.target.files[0] })}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Programar envio (opcional)</label>
                                        <input
                                            type="datetime-local"
                                            value={emailData.fechaProgramada}
                                            onChange={(e) => setEmailData({ ...emailData, fechaProgramada: e.target.value })}
                                            className="form-control"
                                        />
                                        <small>Dejar en blanco para enviar ahora</small>
                                    </div>
                                </>
                            )}

                            <div className="modal-buttons">
                                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    <MdSend size={16} /> Enviar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>Editar Notificacion</h3>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>X</button>
                        </div>
                        <form onSubmit={editarNotificacion}>
                            <div className="form-group">
                                <label>Titulo</label>
                                <input
                                    type="text"
                                    value={emailData.asunto}
                                    onChange={(e) => setEmailData({ ...emailData, asunto: e.target.value })}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mensaje</label>
                                <textarea
                                    value={emailData.mensaje}
                                    onChange={(e) => setEmailData({ ...emailData, mensaje: e.target.value })}
                                    required
                                    rows="5"
                                    className="form-control"
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Notificaciones;