// Componente Gestión de Especialidades (Admin): lista, crea, edita y elimina especialidades.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getEspecialidades, createEspecialidad, updateEspecialidad, deleteEspecialidad } from '../../services/especialidadesService';

// Componente principal: administra el catálogo de especialidades con modal de creación/edición.
const GestionEspecialidadesAdmin = () => {
    // Estados: lista de especialidades, modal de edición, mensajes y datos del formulario.
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filterDuracion, setFilterDuracion] = useState('');

    const [formData, setFormData] = useState({
        nombreEspecialidad: '',
        descripcion: '',
        duracionAnios: 3
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
            const data = await getEspecialidades();
            setEspecialidades(data || []);
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
                nombreEspecialidad: item.nombreEspecialidad || '',
                descripcion: item.descripcion || '',
                duracionAnios: item.duracionAnios || 3
            });
        } else {
            setEditingItem(null);
            setFormData({
                nombreEspecialidad: '',
                descripcion: '',
                duracionAnios: 3
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

        if (!formData.nombreEspecialidad.trim()) {
            mostrarMensaje('El nombre de la especialidad es requerido', 'error');
            return;
        }

        if (formData.duracionAnios < 1 || formData.duracionAnios > 10) {
            mostrarMensaje('La duración debe estar entre 1 y 10 años', 'error');
            return;
        }

        setSaving(true);
        try {
            const dataToSend = {
                nombreEspecialidad: formData.nombreEspecialidad.trim(),
                descripcion: formData.descripcion.trim(),
                duracionAnios: parseInt(formData.duracionAnios)
            };

            if (editingItem) {
                await updateEspecialidad(editingItem.idEspecialidad, dataToSend);
                mostrarMensaje('Especialidad actualizada correctamente', 'success');
            } else {
                await createEspecialidad(dataToSend);
                mostrarMensaje('Especialidad creada correctamente', 'success');
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
        if (!window.confirm(`¿Eliminar la especialidad "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
        try {
            await deleteEspecialidad(id);
            mostrarMensaje('Especialidad eliminada correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar la especialidad', 'error');
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getDuracionBadge = (anios) => {
        const a = parseInt(anios) || 0;
        if (a <= 2) return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
        if (a === 3) return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
        if (a === 4) return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
        return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const especialidadesFiltradas = useMemo(() => {
        return especialidades.filter(e => {
            if (filterDuracion && String(e.duracionAnios) !== String(filterDuracion)) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (e.nombreEspecialidad && e.nombreEspecialidad.toLowerCase().includes(term)) ||
                    (e.descripcion && e.descripcion.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [especialidades, filterDuracion, busqueda]);

    const stats = useMemo(() => {
        const totalAnios = especialidades.reduce((acc, e) => acc + (parseInt(e.duracionAnios) || 0), 0);
        const promedio = especialidades.length > 0 ? (totalAnios / especialidades.length).toFixed(1) : 0;
        return {
            total: especialidades.length,
            promedio
        };
    }, [especialidades]);

    const duracionesUnicas = useMemo(() => {
        const set = new Set();
        especialidades.forEach(e => {
            if (e.duracionAnios) set.add(e.duracionAnios);
        });
        return Array.from(set).sort((a, b) => a - b);
    }, [especialidades]);

    const filtrosActivos = (filterDuracion ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterDuracion('');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestion de Especialidades">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestion de Especialidades">
            <style>{`
                /* Fondo blanco general */
                .ge-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }

                .ge-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03);
                    border: 1px solid #e2e8f0;
                }
                .ge-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .ge-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .ge-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .ge-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .ge-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .ge-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .ge-stat-promedio { background: #e9d5ff; color: #6b21a8; border-color: #d8b4fe; }

                /* Filtros */
                .ge-filtros { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; }
                .ge-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .ge-field input, .ge-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .ge-field input:focus, .ge-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .ge-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                    font-family: inherit;
                }
                .ge-btn:disabled { opacity: .6; cursor: not-allowed; }
                .ge-btn-primary { background: #1e3a5f; color: #fff; }
                .ge-btn-primary:hover:not(:disabled) { background: #16293f; }
                .ge-btn-info { background: #3b82f6; color: #fff; }
                .ge-btn-info:hover:not(:disabled) { background: #2563eb; }
                .ge-btn-danger { background: #dc2626; color: #fff; }
                .ge-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .ge-btn-secondary { background: #e5e7eb; color: #334155; }
                .ge-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .ge-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - FONDO BLANCO FORZADO */
                .ge-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .ge-tabla thead th {
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
                .ge-tabla tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    background-color: #ffffff !important;
                }
                .ge-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .ge-tabla td {
                    padding: 12px 10px;
                    color: #1e293b !important;
                    vertical-align: middle;
                    background-color: #ffffff !important;
                }
                .ge-tabla tbody tr:hover td {
                    background-color: #f1f5f9 !important;
                }
                .ge-tabla td.col-id {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                }
                .ge-tabla td.col-nombre {
                    font-weight: 600;
                    color: #0f172a !important;
                }
                .ge-tabla td.col-descripcion {
                    font-size: 12px;
                    color: #475569 !important;
                    max-width: 400px;
                    word-break: break-word;
                }

                .ge-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .ge-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .ge-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .ge-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .ge-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .ge-empty h3 { color: #334155; margin: 0 0 8px; }

                .ge-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .ge-badge-filtros {
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
                .ge-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .ge-modal {
                    background: #ffffff; border-radius: 12px;
                    max-width: 520px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .ge-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .ge-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .ge-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .ge-modal-close:hover { color: #dc2626; }
                .ge-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .ge-modal .ge-field { margin-bottom: 14px; }
                .ge-modal .ge-field input, .ge-modal .ge-field textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .ge-modal .ge-field textarea { resize: vertical; min-height: 80px; }
                .ge-modal .ge-field input:focus, .ge-modal .ge-field textarea:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .ge-modal .ge-field small {
                    display: block;
                    color: #64748b;
                    font-size: 12px;
                    margin-top: 4px;
                }

                .ge-info-box {
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
                }
                .ge-info-primary { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }

                .ge-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 900px) {
                    .ge-filtros { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .ge-tabla { font-size: 12px; }
                    .ge-tabla thead th, .ge-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="ge-container">
                {mensaje && <div className={`ge-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="ge-stats">
                    <div className="ge-stat ge-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Especialidades</span>
                    </div>
                    <div className="ge-stat ge-stat-promedio">
                        <span className="num">{stats.promedio}</span>
                        <span className="lbl">Promedio Años</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="ge-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="ge-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="ge-filtros">
                        <div className="ge-field">
                            <label>Duración (años)</label>
                            <select value={filterDuracion} onChange={(e) => setFilterDuracion(e.target.value)}>
                                <option value="">Todas las duraciones</option>
                                {duracionesUnicas.map(d => (
                                    <option key={d} value={d}>{d} año{d !== 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div className="ge-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o descripción..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="ge-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="ge-btn ge-btn-primary" onClick={() => handleOpenModal()}>
                                Nueva Especialidad
                            </button>
                            {filtrosActivos > 0 && (
                                <button className="ge-btn ge-btn-secondary" onClick={limpiarFiltros}>
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{especialidadesFiltradas.length}</strong> de {especialidades.length} especialidades
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="ge-card">
                    <h3>Lista de Especialidades</h3>

                    {especialidadesFiltradas.length === 0 ? (
                        <div className="ge-empty">
                            <h3>No hay especialidades que coincidan</h3>
                            <p>Prueba ajustando los filtros o crea una nueva especialidad.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="ge-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '70px' }}>ID</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th style={{ width: '130px', textAlign: 'center' }}>Duración</th>
                                        <th style={{ width: '180px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {especialidadesFiltradas.map((e) => {
                                        const duracionBadge = getDuracionBadge(e.duracionAnios);
                                        return (
                                            <tr key={e.idEspecialidad}>
                                                <td className="col-id">{e.idEspecialidad}</td>
                                                <td className="col-nombre">{e.nombreEspecialidad}</td>
                                                <td className="col-descripcion">{e.descripcion || '-'}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        className="ge-badge"
                                                        style={{
                                                            backgroundColor: duracionBadge.bg,
                                                            color: duracionBadge.color,
                                                            border: `1px solid ${duracionBadge.border}`
                                                        }}
                                                    >
                                                        {e.duracionAnios} año{e.duracionAnios !== 1 ? 's' : ''}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="ge-acciones">
                                                        <button
                                                            className="ge-btn ge-btn-info ge-btn-sm"
                                                            onClick={() => handleOpenModal(e)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="ge-btn ge-btn-danger ge-btn-sm"
                                                            onClick={() => handleDelete(e.idEspecialidad, e.nombreEspecialidad)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CREAR / EDITAR */}
            {showModal && (
                <div className="ge-modal-overlay" onClick={handleCerrarModal}>
                    <div className="ge-modal" onClick={e => e.stopPropagation()}>
                        <div className="ge-modal-header">
                            <h3>{editingItem ? 'Editar Especialidad' : 'Nueva Especialidad'}</h3>
                            <button className="ge-modal-close" onClick={handleCerrarModal} disabled={saving}>X</button>
                        </div>

                        {editingItem && (
                            <div className="ge-info-box ge-info-primary">
                                <strong>Editando:</strong> {editingItem.nombreEspecialidad}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="ge-field">
                                <label>Nombre de la Especialidad *</label>
                                <input
                                    type="text"
                                    value={formData.nombreEspecialidad}
                                    onChange={(e) => setFormData({ ...formData, nombreEspecialidad: e.target.value })}
                                    required
                                    placeholder="Ej: Desarrollo de Software, Contabilidad..."
                                />
                            </div>

                            <div className="ge-field">
                                <label>Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    rows="3"
                                    placeholder="Describe brevemente la especialidad..."
                                />
                            </div>

                            <div className="ge-field">
                                <label>Duración en Años</label>
                                <input
                                    type="number"
                                    value={formData.duracionAnios}
                                    onChange={(e) => setFormData({ ...formData, duracionAnios: parseInt(e.target.value) || 1 })}
                                    min="1"
                                    max="10"
                                />
                                <small>Duración del programa en años (1-10)</small>
                            </div>

                            <div className="ge-modal-actions">
                                <button
                                    type="button"
                                    className="ge-btn ge-btn-secondary"
                                    onClick={handleCerrarModal}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="ge-btn ge-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear Especialidad')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionEspecialidadesAdmin;