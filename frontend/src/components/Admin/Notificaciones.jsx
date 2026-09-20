// Componente Notificaciones (Admin): gestiona correos y notificaciones internas del sistema.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: centro de notificaciones con envío, edición y borrado.
const Notificaciones = () => {
    // Estados: notificaciones, modales, formulario de envío y tipo de notificación.
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedNotificacion, setSelectedNotificacion] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    const [emailData, setEmailData] = useState({
        destinatario: '',
        asunto: '',
        mensaje: '',
        archivoAdjunto: null,
        fechaProgramada: ''
    });
    const [tipoNotificacion, setTipoNotificacion] = useState('email');

    // Filtros
    const [filterEstado, setFilterEstado] = useState('todas');
    const [busqueda, setBusqueda] = useState('');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarNotificaciones();
    }, []);

    const cargarNotificaciones = async () => {
        setLoading(true);
        try {
            const response = await API.get('/notificaciones');
            setNotificaciones(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar las notificaciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            const d = new Date(fecha);
            return d.toLocaleString('es-SV', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fecha;
        }
    };

    // ============================================================
    // MARCAR COMO LEÍDA
    // ============================================================
    const marcarLeida = async (id) => {
        try {
            await API.post(`/notificaciones/marcar-leida/${id}`);
            cargarNotificaciones();
        } catch (error) {
            mostrarMensaje('Error al marcar como leída', 'error');
        }
    };

    const marcarTodasLeidas = async () => {
        const noLeidas = notificaciones.filter(n => !n.leida);
        if (noLeidas.length === 0) {
            mostrarMensaje('No hay notificaciones pendientes', 'success');
            return;
        }
        setSaving(true);
        try {
            for (const n of noLeidas) {
                await API.post(`/notificaciones/marcar-leida/${n.id}`);
            }
            mostrarMensaje('Todas las notificaciones marcadas como leídas', 'success');
            cargarNotificaciones();
        } catch (error) {
            mostrarMensaje('Error al marcar notificaciones', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ELIMINAR
    // ============================================================
    const eliminarNotificacion = async (id) => {
        if (!window.confirm('¿Eliminar esta notificación?\nEsta acción no se puede deshacer.')) return;
        try {
            await API.delete(`/notificaciones/${id}`);
            mostrarMensaje('Notificación eliminada correctamente', 'success');
            cargarNotificaciones();
        } catch (error) {
            mostrarMensaje('Error al eliminar la notificación', 'error');
        }
    };

    // ============================================================
    // EDITAR
    // ============================================================
    const abrirEditar = (notificacion) => {
        setSelectedNotificacion(notificacion);
        setEmailData({
            ...emailData,
            asunto: notificacion.titulo,
            mensaje: notificacion.mensaje
        });
        setShowEditModal(true);
    };

    const editarNotificacion = async (e) => {
        e.preventDefault();
        if (!emailData.asunto.trim() || !emailData.mensaje.trim()) {
            mostrarMensaje('Complete todos los campos', 'error');
            return;
        }
        setSaving(true);
        try {
            await API.put(`/notificaciones/${selectedNotificacion.id}`, {
                titulo: emailData.asunto,
                mensaje: emailData.mensaje
            });
            mostrarMensaje('Notificación actualizada correctamente', 'success');
            setShowEditModal(false);
            cargarNotificaciones();
        } catch (error) {
            mostrarMensaje('Error al actualizar la notificación', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ENVIAR NUEVA
    // ============================================================
    const enviarNotificacion = async (e) => {
        e.preventDefault();

        if (tipoNotificacion === 'email') {
            if (!emailData.destinatario || !emailData.asunto || !emailData.mensaje) {
                mostrarMensaje('Complete todos los campos requeridos', 'error');
                return;
            }
            setSaving(true);
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
                await API.post('/notificaciones/enviar-email', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                mostrarMensaje('Correo enviado correctamente', 'success');
                setShowModal(false);
                resetForm();
                cargarNotificaciones();
            } catch (error) {
                mostrarMensaje('Error al enviar el correo', 'error');
            } finally {
                setSaving(false);
            }
        } else {
            if (!emailData.asunto || !emailData.mensaje) {
                mostrarMensaje('Complete todos los campos requeridos', 'error');
                return;
            }
            setSaving(true);
            try {
                await API.post('/notificaciones/interna', {
                    titulo: emailData.asunto,
                    mensaje: emailData.mensaje
                });
                mostrarMensaje('Notificación interna creada correctamente', 'success');
                setShowModal(false);
                resetForm();
                cargarNotificaciones();
            } catch (error) {
                mostrarMensaje('Error al crear la notificación', 'error');
            } finally {
                setSaving(false);
            }
        }
    };

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

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const notificacionesFiltradas = useMemo(() => {
        return notificaciones.filter(n => {
            if (filterEstado === 'no-leidas' && n.leida) return false;
            if (filterEstado === 'leidas' && !n.leida) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (n.titulo && n.titulo.toLowerCase().includes(term)) ||
                    (n.mensaje && n.mensaje.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [notificaciones, filterEstado, busqueda]);

    const stats = useMemo(() => ({
        total: notificaciones.length,
        noLeidas: notificaciones.filter(n => !n.leida).length,
        leidas: notificaciones.filter(n => n.leida).length
    }), [notificaciones]);

    const filtrosActivos = (filterEstado !== 'todas' ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterEstado('todas');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Notificaciones">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Centro de Notificaciones">
            <style>{`
                /* Forzar fondo blanco general */
                .gn-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }
                
                .gn-card { 
                    background: #ffffff; 
                    border-radius: 12px; 
                    padding: 22px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03); 
                    border: 1px solid #e2e8f0; 
                }
                .gn-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .gn-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .gn-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .gn-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gn-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gn-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .gn-stat-noleidas { background: #fef3c7; color: #b45309; border-color: #fde68a; }
                .gn-stat-leidas { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }

                /* Filtros */
                .gn-filtros { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; }
                .gn-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gn-field input, .gn-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gn-field input:focus, .gn-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .gn-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .gn-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gn-btn-primary { background: #1e3a5f; color: #fff; }
                .gn-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gn-btn-info { background: #3b82f6; color: #fff; }
                .gn-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gn-btn-danger { background: #dc2626; color: #fff; }
                .gn-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gn-btn-secondary { background: #e5e7eb; color: #334155; }
                .gn-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gn-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Lista de notificaciones */
                .gn-lista { display: flex; flex-direction: column; gap: 10px; }
                .gn-item {
                    display: flex;
                    gap: 14px;
                    padding: 16px;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    transition: all .2s;
                }
                .gn-item:hover {
                    border-color: #cbd5e1;
                    box-shadow: 0 2px 6px rgba(0,0,0,.04);
                }
                .gn-item.no-leida {
                    border-left: 4px solid #3b82f6;
                    background: #f8fafc;
                }
                .gn-item.leida {
                    border-left: 4px solid #cbd5e1;
                    opacity: .85;
                }
                .gn-item-icon {
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    font-weight: 700;
                }
                .gn-item-icon.no-leida {
                    background: #dbeafe;
                    color: #1d4ed8;
                }
                .gn-item-icon.leida {
                    background: #f1f5f9;
                    color: #94a3b8;
                }
                .gn-item-content { flex: 1; min-width: 0; }
                .gn-item-titulo {
                    font-size: 14px;
                    font-weight: 600;
                    color: #0f172a;
                    margin-bottom: 4px;
                }
                .gn-item-mensaje {
                    font-size: 13px;
                    color: #475569;
                    margin-bottom: 6px;
                    line-height: 1.4;
                }
                .gn-item-fecha {
                    font-size: 11px;
                    color: #94a3b8;
                    font-family: monospace;
                }
                .gn-item-acciones {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex-shrink: 0;
                }

                /* Toolbar */
                .gn-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .gn-badge-filtros {
                    display: inline-block;
                    background: #3b82f6;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 10px;
                    margin-left: 8px;
                }

                /* Avisos */
                .gn-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gn-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gn-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                /* Empty */
                .gn-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .gn-empty h3 { color: #334155; margin: 0 0 8px; }

                /* Modal */
                .gn-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .gn-modal {
                    background: #ffffff; border-radius: 12px;
                    max-width: 600px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .gn-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gn-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gn-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gn-modal-close:hover { color: #dc2626; }
                .gn-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gn-modal .gn-field { margin-bottom: 14px; }
                .gn-modal .gn-field input, .gn-modal .gn-field select, .gn-modal .gn-field textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gn-modal .gn-field textarea { resize: vertical; min-height: 100px; }
                .gn-modal .gn-field input:focus, .gn-modal .gn-field select:focus, .gn-modal .gn-field textarea:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .gn-modal .gn-field small {
                    display: block; color: #64748b; font-size: 12px; margin-top: 4px;
                }

                .gn-info-box {
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
                    background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af;
                }

                .gn-tipo-selector {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .gn-tipo-btn {
                    flex: 1;
                    padding: 12px;
                    border: 2px solid #e2e8f0;
                    background: #ffffff;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    transition: all .2s;
                    font-family: inherit;
                }
                .gn-tipo-btn:hover {
                    border-color: #cbd5e1;
                }
                .gn-tipo-btn.active {
                    border-color: #3b82f6;
                    background: #eff6ff;
                    color: #1e40af;
                }

                @media (max-width: 700px) {
                    .gn-filtros { grid-template-columns: 1fr; }
                    .gn-item { flex-direction: column; }
                    .gn-item-acciones { flex-direction: row; }
                    .gn-tipo-selector { flex-direction: column; }
                }
            `}</style>

            <div className="gn-container">
                {mensaje && <div className={`gn-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gn-stats">
                    <div className="gn-stat gn-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total</span>
                    </div>
                    <div className="gn-stat gn-stat-noleidas">
                        <span className="num">{stats.noLeidas}</span>
                        <span className="lbl">No Leídas</span>
                    </div>
                    <div className="gn-stat gn-stat-leidas">
                        <span className="num">{stats.leidas}</span>
                        <span className="lbl">Leídas</span>
                    </div>
                </div>

                {/* FILTROS Y ACCIONES */}
                <div className="gn-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="gn-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="gn-filtros">
                        <div className="gn-field">
                            <label>Estado</label>
                            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                                <option value="todas">Todas</option>
                                <option value="no-leidas">Solo no leídas</option>
                                <option value="leidas">Solo leídas</option>
                            </select>
                        </div>
                        <div className="gn-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por título o mensaje..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="gn-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                className="gn-btn gn-btn-primary"
                                onClick={() => setShowModal(true)}
                            >
                                Nueva Notificación
                            </button>
                            <button
                                className="gn-btn gn-btn-secondary"
                                onClick={marcarTodasLeidas}
                                disabled={saving || stats.noLeidas === 0}
                            >
                                Marcar Todas como Leídas
                            </button>
                            {filtrosActivos > 0 && (
                                <button className="gn-btn gn-btn-secondary" onClick={limpiarFiltros}>
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{notificacionesFiltradas.length}</strong> de {notificaciones.length} notificaciones
                        </div>
                    </div>
                </div>

                {/* LISTA */}
                <div className="gn-card">
                    <h3>Notificaciones del Sistema</h3>

                    {notificacionesFiltradas.length === 0 ? (
                        <div className="gn-empty">
                            <h3>No hay notificaciones que coincidan</h3>
                            <p>Prueba ajustando los filtros o crea una nueva notificación.</p>
                        </div>
                    ) : (
                        <div className="gn-lista">
                            {notificacionesFiltradas.map(n => (
                                <div
                                    key={n.id}
                                    className={`gn-item ${!n.leida ? 'no-leida' : 'leida'}`}
                                >
                                    <div
                                        className={`gn-item-icon ${!n.leida ? 'no-leida' : 'leida'}`}
                                        onClick={() => !n.leida && marcarLeida(n.id)}
                                        style={{ cursor: !n.leida ? 'pointer' : 'default' }}
                                        title={!n.leida ? 'Marcar como leída' : 'Leída'}
                                    >
                                        {!n.leida ? 'N' : 'L'}
                                    </div>
                                    <div className="gn-item-content">
                                        <div className="gn-item-titulo">{n.titulo}</div>
                                        <div className="gn-item-mensaje">{n.mensaje}</div>
                                        <div className="gn-item-fecha">{formatearFecha(n.fecha)}</div>
                                    </div>
                                    <div className="gn-item-acciones">
                                        <button
                                            className="gn-btn gn-btn-info gn-btn-sm"
                                            onClick={() => abrirEditar(n)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="gn-btn gn-btn-danger gn-btn-sm"
                                            onClick={() => eliminarNotificacion(n.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL NUEVA NOTIFICACIÓN */}
            {showModal && (
                <div className="gn-modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="gn-modal" onClick={e => e.stopPropagation()}>
                        <div className="gn-modal-header">
                            <h3>Nueva Notificación</h3>
                            <button className="gn-modal-close" onClick={() => { setShowModal(false); resetForm(); }} disabled={saving}>X</button>
                        </div>

                        <div className="gn-info-box">
                            Selecciona el tipo de notificación que deseas enviar.
                        </div>

                        <div className="gn-tipo-selector">
                            <button
                                type="button"
                                className={`gn-tipo-btn ${tipoNotificacion === 'email' ? 'active' : ''}`}
                                onClick={() => setTipoNotificacion('email')}
                            >
                                Correo Electrónico
                            </button>
                            <button
                                type="button"
                                className={`gn-tipo-btn ${tipoNotificacion === 'interna' ? 'active' : ''}`}
                                onClick={() => setTipoNotificacion('interna')}
                            >
                                Notificación Interna
                            </button>
                        </div>

                        <form onSubmit={enviarNotificacion}>
                            {tipoNotificacion === 'email' && (
                                <div className="gn-field">
                                    <label>Destinatario (Correo Electrónico) *</label>
                                    <input
                                        type="email"
                                        value={emailData.destinatario}
                                        onChange={(e) => setEmailData({ ...emailData, destinatario: e.target.value })}
                                        required
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            )}

                            <div className="gn-field">
                                <label>Asunto / Título *</label>
                                <input
                                    type="text"
                                    value={emailData.asunto}
                                    onChange={(e) => setEmailData({ ...emailData, asunto: e.target.value })}
                                    required
                                    placeholder="Asunto de la notificación"
                                />
                            </div>

                            <div className="gn-field">
                                <label>Mensaje *</label>
                                <textarea
                                    value={emailData.mensaje}
                                    onChange={(e) => setEmailData({ ...emailData, mensaje: e.target.value })}
                                    required
                                    rows="5"
                                    placeholder="Escriba el mensaje aquí..."
                                />
                            </div>

                            {tipoNotificacion === 'email' && (
                                <>
                                    <div className="gn-field">
                                        <label>Adjuntar Archivo (opcional)</label>
                                        <input
                                            type="file"
                                            onChange={(e) => setEmailData({ ...emailData, archivoAdjunto: e.target.files[0] })}
                                        />
                                    </div>
                                    <div className="gn-field">
                                        <label>Programar Envío (opcional)</label>
                                        <input
                                            type="datetime-local"
                                            value={emailData.fechaProgramada}
                                            onChange={(e) => setEmailData({ ...emailData, fechaProgramada: e.target.value })}
                                        />
                                        <small>Dejar en blanco para enviar ahora</small>
                                    </div>
                                </>
                            )}

                            <div className="gn-modal-actions">
                                <button
                                    type="button"
                                    className="gn-btn gn-btn-secondary"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="gn-btn gn-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR */}
            {showEditModal && (
                <div className="gn-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="gn-modal" onClick={e => e.stopPropagation()}>
                        <div className="gn-modal-header">
                            <h3>Editar Notificación</h3>
                            <button className="gn-modal-close" onClick={() => setShowEditModal(false)} disabled={saving}>X</button>
                        </div>

                        <form onSubmit={editarNotificacion}>
                            <div className="gn-field">
                                <label>Título *</label>
                                <input
                                    type="text"
                                    value={emailData.asunto}
                                    onChange={(e) => setEmailData({ ...emailData, asunto: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="gn-field">
                                <label>Mensaje *</label>
                                <textarea
                                    value={emailData.mensaje}
                                    onChange={(e) => setEmailData({ ...emailData, mensaje: e.target.value })}
                                    required
                                    rows="5"
                                />
                            </div>
                            <div className="gn-modal-actions">
                                <button
                                    type="button"
                                    className="gn-btn gn-btn-secondary"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="gn-btn gn-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Notificaciones;