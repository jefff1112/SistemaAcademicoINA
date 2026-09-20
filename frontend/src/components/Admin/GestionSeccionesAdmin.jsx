// Componente Gestión de Secciones (Admin): lista, crea, edita y elimina secciones.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getSecciones, createSeccion, updateSeccion, deleteSeccion } from '../../services/seccionesService';

// Componente principal: administra el catálogo de secciones con modal de creación/edición.
const GestionSeccionesAdmin = () => {
    // Estados: secciones, modal de edición, mensajes y datos del formulario.
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    // Filtros
    const [busqueda, setBusqueda] = useState('');

    const [formData, setFormData] = useState({
        nombreSeccion: ''
    });

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await getSecciones();
            setSecciones(data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
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
    // MODAL
    // ============================================================
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                nombreSeccion: item.nombreSeccion || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                nombreSeccion: ''
            });
        }
        setShowModal(true);
    };

    const handleCerrarModal = () => {
        if (saving) return;
        setShowModal(false);
    };

    // ============================================================
    // SUBMIT
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombreSeccion.trim()) {
            mostrarMensaje('El nombre de la sección es requerido', 'error');
            return;
        }

        setSaving(true);
        try {
            const dataToSend = {
                nombreSeccion: formData.nombreSeccion.trim()
            };

            if (editingItem) {
                await updateSeccion(editingItem.idSeccion, dataToSend);
                mostrarMensaje('Sección actualizada correctamente', 'success');
            } else {
                await createSeccion(dataToSend);
                mostrarMensaje('Sección creada correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            let msg = 'Error al guardar';
            if (error.response?.data?.mensaje) msg = error.response.data.mensaje;
            else if (error.response?.data?.message) msg = error.response.data.message;
            mostrarMensaje(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ELIMINAR
    // ============================================================
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar la sección "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
        try {
            await deleteSeccion(id);
            mostrarMensaje('Sección eliminada correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar la sección', 'error');
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const seccionesFiltradas = useMemo(() => {
        if (!busqueda) return secciones;
        const term = busqueda.toLowerCase();
        return secciones.filter(s =>
            s.nombreSeccion && s.nombreSeccion.toLowerCase().includes(term)
        );
    }, [secciones, busqueda]);

    const stats = useMemo(() => ({
        total: secciones.length
    }), [secciones]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestion de Secciones">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestion de Secciones">
            <style>{`
                /* Fondo blanco general */
                .gs-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }

                .gs-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03);
                    border: 1px solid #e2e8f0;
                }
                .gs-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .gs-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .gs-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .gs-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gs-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gs-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .gs-stat-filtrados { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }

                /* Filtros */
                .gs-filtros { display: grid; grid-template-columns: 1fr; gap: 14px; }
                .gs-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gs-field input {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gs-field input:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .gs-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                    font-family: inherit;
                }
                .gs-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gs-btn-primary { background: #1e3a5f; color: #fff; }
                .gs-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gs-btn-info { background: #3b82f6; color: #fff; }
                .gs-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gs-btn-danger { background: #dc2626; color: #fff; }
                .gs-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gs-btn-secondary { background: #e5e7eb; color: #334155; }
                .gs-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gs-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - FONDO BLANCO FORZADO */
                .gs-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .gs-tabla thead th {
                    background: #f8fafc !important;
                    color: #1e293b !important;
                    padding: 12px 10px;
                    text-align: left;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    font-weight: 700;
                    border-bottom: 2px solid #cbd5e1;
                }
                .gs-tabla tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    background-color: #ffffff !important;
                }
                .gs-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .gs-tabla td {
                    padding: 12px 10px;
                    color: #1e293b !important;
                    vertical-align: middle;
                    background-color: #ffffff !important;
                }
                .gs-tabla tbody tr:hover td {
                    background-color: #f1f5f9 !important;
                }
                .gs-tabla td.col-id {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                }
                .gs-tabla td.col-nombre {
                    font-weight: 600;
                    color: #0f172a !important;
                }

                .gs-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .gs-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gs-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gs-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gs-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .gs-empty h3 { color: #334155; margin: 0 0 8px; }

                .gs-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .gs-badge-filtros {
                    display: inline-block;
                    background: #3b82f6;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 10px;
                    margin-left: 8px;
                }

                /* Modal */
                .gs-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .gs-modal {
                    background: #ffffff; border-radius: 12px;
                    max-width: 420px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .gs-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gs-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gs-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gs-modal-close:hover { color: #dc2626; }
                .gs-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gs-modal .gs-field { margin-bottom: 14px; }
                .gs-modal .gs-field input {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gs-modal .gs-field input:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .gs-modal .gs-field small {
                    display: block;
                    color: #64748b;
                    font-size: 12px;
                    margin-top: 4px;
                }

                .gs-info-box {
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
                }
                .gs-info-primary { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }

                .gs-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 600px) {
                    .gs-tabla { font-size: 12px; }
                    .gs-tabla thead th, .gs-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gs-container">
                {mensaje && <div className={`gs-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gs-stats">
                    <div className="gs-stat gs-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Secciones</span>
                    </div>
                    <div className="gs-stat gs-stat-filtrados">
                        <span className="num">{seccionesFiltradas.length}</span>
                        <span className="lbl">Mostradas</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="gs-card">
                    <h3>Filtros de Búsqueda</h3>
                    <div className="gs-filtros">
                        <div className="gs-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre de sección..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="gs-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="gs-btn gs-btn-primary" onClick={() => handleOpenModal()}>
                                Nueva Sección
                            </button>
                            {busqueda && (
                                <button className="gs-btn gs-btn-secondary" onClick={() => setBusqueda('')}>
                                    Limpiar Filtro
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{seccionesFiltradas.length}</strong> de {secciones.length} secciones
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gs-card">
                    <h3>Lista de Secciones</h3>

                    {seccionesFiltradas.length === 0 ? (
                        <div className="gs-empty">
                            <h3>No hay secciones que coincidan</h3>
                            <p>Prueba ajustando el filtro o crea una nueva sección.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="gs-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>ID</th>
                                        <th>Nombre de la Sección</th>
                                        <th style={{ width: '180px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {seccionesFiltradas.map((s) => (
                                        <tr key={s.idSeccion}>
                                            <td className="col-id">{s.idSeccion}</td>
                                            <td className="col-nombre">Sección {s.nombreSeccion}</td>
                                            <td>
                                                <div className="gs-acciones">
                                                    <button
                                                        className="gs-btn gs-btn-info gs-btn-sm"
                                                        onClick={() => handleOpenModal(s)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="gs-btn gs-btn-danger gs-btn-sm"
                                                        onClick={() => handleDelete(s.idSeccion, s.nombreSeccion)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CREAR / EDITAR */}
            {showModal && (
                <div className="gs-modal-overlay" onClick={handleCerrarModal}>
                    <div className="gs-modal" onClick={e => e.stopPropagation()}>
                        <div className="gs-modal-header">
                            <h3>{editingItem ? 'Editar Sección' : 'Nueva Sección'}</h3>
                            <button className="gs-modal-close" onClick={handleCerrarModal} disabled={saving}>X</button>
                        </div>

                        {editingItem && (
                            <div className="gs-info-box gs-info-primary">
                                <strong>Editando:</strong> Sección {editingItem.nombreSeccion}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="gs-field">
                                <label>Nombre de la Sección *</label>
                                <input
                                    type="text"
                                    value={formData.nombreSeccion}
                                    onChange={(e) => setFormData({ ...formData, nombreSeccion: e.target.value })}
                                    required
                                    placeholder="Ej: A, B, C, D, E"
                                    autoFocus
                                />
                                <small>Ingrese una letra o nombre corto para la sección</small>
                            </div>

                            <div className="gs-modal-actions">
                                <button
                                    type="button"
                                    className="gs-btn gs-btn-secondary"
                                    onClick={handleCerrarModal}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="gs-btn gs-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear Sección')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionSeccionesAdmin;