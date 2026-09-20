// Componente Avisos Dirección - MEJORADO
// Publica, edita y elimina avisos internos.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const AvisosDireccion = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingAviso, setEditingAviso] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Filtros
    const [filterPrioridad, setFilterPrioridad] = useState('todas');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');

    // Formulario
    const [formData, setFormData] = useState({
        titulo: '',
        contenido: '',
        prioridad: 'media',
        activo: true
    });

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarAvisos();
    }, []);

    const cargarAvisos = async () => {
        try {
            const response = await API.get('/avisosinternos');
            setAvisos(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar avisos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // ============================================================
    // MODAL CREAR / EDITAR
    // ============================================================
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

    // ============================================================
    // SUBMIT
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.titulo.trim()) {
            mostrarMensaje('El título es requerido', 'error');
            return;
        }
        if (!formData.contenido.trim()) {
            mostrarMensaje('El contenido es requerido', 'error');
            return;
        }

        setSaving(true);
        try {
            if (editingAviso) {
                await API.put(`/avisosinternos/${editingAviso.idAviso}`, formData);
                mostrarMensaje('Aviso actualizado correctamente', 'success');
            } else {
                await API.post('/avisosinternos', formData);
                mostrarMensaje('Aviso creado correctamente', 'success');
            }
            setShowModal(false);
            cargarAvisos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ELIMINAR
    // ============================================================
    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este aviso?')) return;
        try {
            await API.delete(`/avisosinternos/${id}`);
            mostrarMensaje('Aviso eliminado correctamente', 'success');
            cargarAvisos();
        } catch (error) {
            mostrarMensaje('Error al eliminar', 'error');
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getPrioridadBadge = (prioridad) => {
        switch (prioridad) {
            case 'alta': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626', label: 'Alta' };
            case 'media': return { bg: '#fef3c7', color: '#b45309', border: '#f59e0b', label: 'Media' };
            case 'baja': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a', label: 'Baja' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8', label: prioridad };
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-SV', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const avisosFiltrados = useMemo(() => {
        return avisos.filter(a => {
            // Filtro por prioridad
            if (filterPrioridad !== 'todas' && a.prioridad !== filterPrioridad) return false;

            // Filtro por estado
            if (filterEstado === 'activos' && !a.activo) return false;
            if (filterEstado === 'inactivos' && a.activo) return false;

            // Búsqueda
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    (a.titulo && a.titulo.toLowerCase().includes(term)) ||
                    (a.contenido && a.contenido.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [avisos, filterPrioridad, filterEstado, searchTerm]);

    const stats = useMemo(() => ({
        total: avisos.length,
        activos: avisos.filter(a => a.activo).length,
        inactivos: avisos.filter(a => !a.activo).length,
        alta: avisos.filter(a => a.prioridad === 'alta').length
    }), [avisos]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Avisos - Dirección">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Avisos - Dirección">
            <style>{`
                .av-container { display: flex; flex-direction: column; gap: 20px; }
                .av-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .av-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .av-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
                .av-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .av-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .av-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .av-stat-total { background: #eff6ff; color: #1e40af; }
                .av-stat-activos { background: #dcfce7; color: #15803d; }
                .av-stat-inactivos { background: #f1f5f9; color: #475569; }
                .av-stat-alta { background: #fee2e2; color: #b91c1c; }

                /* Filtros */
                .av-filtros { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 14px; }
                .av-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .av-field input, .av-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .av-field input:focus, .av-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .av-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .av-btn:disabled { opacity: .6; cursor: not-allowed; }
                .av-btn-primary { background: #1e3a5f; color: #fff; }
                .av-btn-primary:hover:not(:disabled) { background: #16293f; }
                .av-btn-info { background: #3b82f6; color: #fff; }
                .av-btn-info:hover:not(:disabled) { background: #2563eb; }
                .av-btn-danger { background: #dc2626; color: #fff; }
                .av-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .av-btn-secondary { background: #e5e7eb; color: #334155; }
                .av-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .av-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tarjetas de aviso */
                .av-lista { display: flex; flex-direction: column; gap: 12px; }
                .av-item {
                    padding: 18px 20px;
                    border-radius: 10px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-left-width: 5px;
                    transition: all .15s;
                    position: relative;
                }
                .av-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); transform: translateY(-1px); }
                .av-item.inactivo { opacity: .65; background: #f9fafb; }

                .av-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 8px;
                    flex-wrap: wrap;
                }
                .av-item-titulo { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; }
                .av-item-meta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 4px; }
                .av-item-fecha { font-size: 12px; color: #94a3b8; }
                .av-item-contenido { color: #475569; font-size: 14px; line-height: 1.5; margin: 8px 0 0; white-space: pre-wrap; }
                .av-item-acciones { display: flex; gap: 6px; }

                .av-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                }
                .av-badge-inactivo {
                    background: #f1f5f9;
                    color: #64748b;
                    border: 1px solid #cbd5e1;
                }

                .av-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .av-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .av-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .av-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
                .av-empty h3 { color: #475569; margin: 0 0 8px; }

                /* Modal */
                .av-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .av-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 560px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .av-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .av-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .av-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .av-modal-close:hover { color: #dc2626; }
                .av-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                @media (max-width: 900px) {
                    .av-filtros { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .av-filtros { grid-template-columns: 1fr; }
                    .av-item { padding: 14px 16px; }
                    .av-item-header { flex-direction: column; }
                    .av-item-acciones { width: 100%; }
                }
            `}</style>

            <div className="av-container">
                {message && <div className={`av-aviso ${messageType}`}>{message}</div>}

                {/* ESTADÍSTICAS */}
                <div className="av-stats">
                    <div className="av-stat av-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Avisos</span>
                    </div>
                    <div className="av-stat av-stat-activos">
                        <span className="num">{stats.activos}</span>
                        <span className="lbl">Activos</span>
                    </div>
                    <div className="av-stat av-stat-inactivos">
                        <span className="num">{stats.inactivos}</span>
                        <span className="lbl">Inactivos</span>
                    </div>
                    <div className="av-stat av-stat-alta">
                        <span className="num">{stats.alta}</span>
                        <span className="lbl">Prioridad Alta</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="av-card">
                    <h3>Filtros y Búsqueda</h3>
                    <div className="av-filtros">
                        <div className="av-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por título o contenido..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="av-field">
                            <label>Prioridad</label>
                            <select value={filterPrioridad} onChange={(e) => setFilterPrioridad(e.target.value)}>
                                <option value="todas">Todas</option>
                                <option value="alta">Alta</option>
                                <option value="media">Media</option>
                                <option value="baja">Baja</option>
                            </select>
                        </div>
                        <div className="av-field">
                            <label>Estado</label>
                            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="activos">Solo activos</option>
                                <option value="inactivos">Solo inactivos</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px', alignItems: 'center' }}>
                        <button className="av-btn av-btn-primary" onClick={() => handleOpenModal()}>
                            + Nuevo Aviso
                        </button>
                        <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{avisosFiltrados.length}</strong> de {avisos.length} avisos
                        </div>
                    </div>
                </div>

                {/* LISTA DE AVISOS */}
                <div className="av-card">
                    <h3>Avisos Publicados</h3>

                    {avisosFiltrados.length === 0 ? (
                        <div className="av-empty">
                            <h3>No hay avisos que coincidan</h3>
                            <p>Prueba ajustando los filtros o crea el primero.</p>
                        </div>
                    ) : (
                        <div className="av-lista">
                            {avisosFiltrados.map((a) => {
                                const badge = getPrioridadBadge(a.prioridad);
                                return (
                                    <div
                                        key={a.idAviso}
                                        className={`av-item ${!a.activo ? 'inactivo' : ''}`}
                                        style={{ borderLeftColor: badge.border }}
                                    >
                                        <div className="av-item-header">
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 className="av-item-titulo">{a.titulo}</h4>
                                                <div className="av-item-meta">
                                                    <span
                                                        className="av-badge"
                                                        style={{
                                                            backgroundColor: badge.bg,
                                                            color: badge.color,
                                                            border: `1px solid ${badge.border}`
                                                        }}
                                                    >
                                                        Prioridad {badge.label}
                                                    </span>
                                                    {!a.activo && (
                                                        <span className="av-badge av-badge-inactivo">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                    <span className="av-item-fecha">
                                                        {formatearFecha(a.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="av-item-acciones">
                                                <button
                                                    className="av-btn av-btn-info av-btn-sm"
                                                    onClick={() => handleOpenModal(a)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="av-btn av-btn-danger av-btn-sm"
                                                    onClick={() => handleDelete(a.idAviso)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                        <p className="av-item-contenido">{a.contenido}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CREAR / EDITAR */}
            {showModal && (
                <div className="av-modal-overlay" onClick={() => !saving && setShowModal(false)}>
                    <div className="av-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="av-modal-header">
                            <h3>{editingAviso ? 'Editar Aviso' : 'Nuevo Aviso'}</h3>
                            <button className="av-modal-close" onClick={() => setShowModal(false)} disabled={saving}>X</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="av-field" style={{ marginBottom: '14px' }}>
                                <label>Título *</label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    required
                                    placeholder="Ej: Reunión de personal"
                                />
                            </div>

                            <div className="av-field" style={{ marginBottom: '14px' }}>
                                <label>Contenido *</label>
                                <textarea
                                    value={formData.contenido}
                                    onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                                    required
                                    rows="5"
                                    placeholder="Escribe el contenido del aviso..."
                                    style={{ resize: 'vertical', fontFamily: 'inherit', minHeight: '100px' }}
                                />
                            </div>

                            <div className="av-field" style={{ marginBottom: '14px' }}>
                                <label>Prioridad</label>
                                <select
                                    value={formData.prioridad}
                                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                                >
                                    <option value="baja">Baja</option>
                                    <option value="media">Media</option>
                                    <option value="alta">Alta</option>
                                </select>
                            </div>

                            <div className="av-field" style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.activo}
                                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                        style={{ width: 'auto' }}
                                    />
                                    Aviso activo (visible para el personal)
                                </label>
                            </div>

                            <div className="av-modal-actions">
                                <button
                                    type="button"
                                    className="av-btn av-btn-secondary"
                                    onClick={() => setShowModal(false)}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="av-btn av-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : (editingAviso ? 'Actualizar' : 'Publicar')}
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