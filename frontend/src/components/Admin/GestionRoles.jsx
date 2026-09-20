// Componente Gestión de Roles (Admin): lista, crea, edita y elimina roles del sistema.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra los roles y su nivel de acceso con modal de edición.
const GestionRoles = () => {
    // Estados: roles, modal de edición y datos del formulario.
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingRol, setEditingRol] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');

    const [formData, setFormData] = useState({
        idRol: undefined,
        nombreRol: '',
        descripcion: '',
        nivelAcceso: 1,
        estado: true
    });

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarRoles();
    }, []);

    const cargarRoles = async () => {
        setLoading(true);
        try {
            const response = await API.get('/roles');
            setRoles(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar roles', 'error');
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
    const handleOpenModal = (rol = null) => {
        if (rol) {
            setEditingRol(rol);
            setFormData({
                idRol: rol.idRol,
                nombreRol: rol.nombreRol,
                descripcion: rol.descripcion || '',
                nivelAcceso: rol.nivelAcceso || 1,
                estado: rol.estado ?? true
            });
        } else {
            setEditingRol(null);
            setFormData({ idRol: undefined, nombreRol: '', descripcion: '', nivelAcceso: 1, estado: true });
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

        if (!formData.nombreRol.trim()) {
            mostrarMensaje('El nombre del rol es requerido', 'error');
            return;
        }

        setSaving(true);
        try {
            if (editingRol) {
                await API.put(`/roles/${editingRol.idRol}`, formData);
                mostrarMensaje('Rol actualizado correctamente', 'success');
            } else {
                await API.post('/roles', formData);
                mostrarMensaje('Rol creado correctamente', 'success');
            }
            setShowModal(false);
            cargarRoles();
        } catch (error) {
            let msg = 'Error al guardar rol';
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
        if (!window.confirm(`¿Eliminar el rol "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
        try {
            await API.delete(`/roles/${id}`);
            mostrarMensaje('Rol eliminado correctamente', 'success');
            cargarRoles();
        } catch (error) {
            mostrarMensaje('Error al eliminar rol', 'error');
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const rolesFiltrados = useMemo(() => {
        return roles.filter(r => {
            if (filterEstado === 'activos' && !r.estado) return false;
            if (filterEstado === 'inactivos' && r.estado) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (r.nombreRol && r.nombreRol.toLowerCase().includes(term)) ||
                    (r.descripcion && r.descripcion.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [roles, filterEstado, busqueda]);

    const stats = useMemo(() => ({
        total: roles.length,
        activos: roles.filter(r => r.estado).length,
        inactivos: roles.filter(r => !r.estado).length
    }), [roles]);

    const filtrosActivos = (filterEstado !== 'todos' ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterEstado('todos');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestion de Roles">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestion de Roles">
            <style>{`
                /* Forzar fondo blanco general */
                .gr-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }
                
                .gr-card { 
                    background: #ffffff; 
                    border-radius: 12px; 
                    padding: 22px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03); 
                    border: 1px solid #e2e8f0; 
                }
                .gr-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .gr-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .gr-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .gr-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gr-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gr-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .gr-stat-activos { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
                .gr-stat-inactivos { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }

                /* Filtros */
                .gr-filtros { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; }
                .gr-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gr-field input, .gr-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gr-field input:focus, .gr-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .gr-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .gr-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gr-btn-primary { background: #1e3a5f; color: #fff; }
                .gr-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gr-btn-info { background: #3b82f6; color: #fff; }
                .gr-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gr-btn-danger { background: #dc2626; color: #fff; }
                .gr-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gr-btn-secondary { background: #e5e7eb; color: #334155; }
                .gr-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gr-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - FORZAR FONDO BLANCO */
                .gr-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .gr-tabla thead th {
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
                .gr-tabla tbody tr { 
                    border-bottom: 1px solid #e2e8f0; 
                    background-color: #ffffff !important; 
                }
                .gr-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .gr-tabla td { 
                    padding: 12px 10px; 
                    color: #1e293b !important; 
                    vertical-align: middle; 
                    background-color: #ffffff !important;
                }
                .gr-tabla tbody tr:hover td { 
                    background-color: #f1f5f9 !important;
                }
                .gr-tabla td.col-id { 
                    font-family: monospace; 
                    font-size: 12px; 
                    color: #475569 !important; 
                    background-color: #ffffff !important;
                }
                .gr-tabla td.col-nombre { 
                    font-weight: 600; 
                    color: #0f172a !important; 
                    background-color: #ffffff !important;
                }

                .gr-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .gr-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gr-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gr-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gr-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .gr-empty h3 { color: #334155; margin: 0 0 8px; }

                .gr-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .gr-badge-filtros {
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
                .gr-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .gr-modal {
                    background: #ffffff; border-radius: 12px;
                    max-width: 520px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .gr-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gr-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gr-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gr-modal-close:hover { color: #dc2626; }
                .gr-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gr-modal .gr-field { margin-bottom: 14px; }
                .gr-modal .gr-field input, .gr-modal .gr-field select, .gr-modal .gr-field textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gr-modal .gr-field textarea { resize: vertical; min-height: 70px; }
                .gr-modal .gr-field input:focus, .gr-modal .gr-field select:focus, .gr-modal .gr-field textarea:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .gr-modal .gr-field small {
                    display: block; color: #64748b; font-size: 12px; margin-top: 4px;
                }

                .gr-info-box {
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
                }
                .gr-info-primary { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }

                .gr-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 900px) {
                    .gr-filtros { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .gr-tabla { font-size: 12px; }
                    .gr-tabla thead th, .gr-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gr-container">
                {mensaje && <div className={`gr-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gr-stats">
                    <div className="gr-stat gr-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Roles</span>
                    </div>
                    <div className="gr-stat gr-stat-activos">
                        <span className="num">{stats.activos}</span>
                        <span className="lbl">Activos</span>
                    </div>
                    <div className="gr-stat gr-stat-inactivos">
                        <span className="num">{stats.inactivos}</span>
                        <span className="lbl">Inactivos</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="gr-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="gr-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="gr-filtros">
                        <div className="gr-field">
                            <label>Estado</label>
                            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="activos">Solo activos</option>
                                <option value="inactivos">Solo inactivos</option>
                            </select>
                        </div>
                        <div className="gr-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o descripción..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="gr-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="gr-btn gr-btn-primary" onClick={() => handleOpenModal()}>
                                Nuevo Rol
                            </button>
                            {filtrosActivos > 0 && (
                                <button className="gr-btn gr-btn-secondary" onClick={limpiarFiltros}>
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{rolesFiltrados.length}</strong> de {roles.length} roles
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gr-card">
                    <h3>Lista de Roles</h3>

                    {rolesFiltrados.length === 0 ? (
                        <div className="gr-empty">
                            <h3>No hay roles que coincidan</h3>
                            <p>Prueba ajustando los filtros o crea un nuevo rol.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="gr-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '70px' }}>ID</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th style={{ width: '120px', textAlign: 'center' }}>Nivel Acceso</th>
                                        <th style={{ width: '100px', textAlign: 'center' }}>Estado</th>
                                        <th style={{ width: '180px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rolesFiltrados.map(r => (
                                        <tr key={r.idRol}>
                                            <td className="col-id">{r.idRol}</td>
                                            <td className="col-nombre">{r.nombreRol}</td>
                                            <td>{r.descripcion || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="gr-badge" style={{
                                                    backgroundColor: '#eff6ff',
                                                    color: '#1e40af',
                                                    border: '1px solid #bfdbfe'
                                                }}>
                                                    Nivel {r.nivelAcceso || 1}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span
                                                    className="gr-badge"
                                                    style={{
                                                        backgroundColor: r.estado ? '#dcfce7' : '#fee2e2',
                                                        color: r.estado ? '#15803d' : '#b91c1c',
                                                        border: r.estado ? '1px solid #16a34a' : '1px solid #dc2626'
                                                    }}
                                                >
                                                    {r.estado ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="gr-acciones">
                                                    <button
                                                        className="gr-btn gr-btn-info gr-btn-sm"
                                                        onClick={() => handleOpenModal(r)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="gr-btn gr-btn-danger gr-btn-sm"
                                                        onClick={() => handleDelete(r.idRol, r.nombreRol)}
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
                <div className="gr-modal-overlay" onClick={handleCerrarModal}>
                    <div className="gr-modal" onClick={e => e.stopPropagation()}>
                        <div className="gr-modal-header">
                            <h3>{editingRol ? 'Editar Rol' : 'Nuevo Rol'}</h3>
                            <button className="gr-modal-close" onClick={handleCerrarModal} disabled={saving}>X</button>
                        </div>

                        {editingRol && (
                            <div className="gr-info-box gr-info-primary">
                                <strong>Editando:</strong> {editingRol.nombreRol}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="gr-field">
                                <label>Nombre del Rol *</label>
                                <input
                                    type="text"
                                    value={formData.nombreRol}
                                    onChange={(e) => setFormData({ ...formData, nombreRol: e.target.value })}
                                    required
                                    placeholder="Ej: Administrador, Docente, Estudiante"
                                />
                            </div>

                            <div className="gr-field">
                                <label>Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    rows="3"
                                    placeholder="Describe las responsabilidades de este rol..."
                                />
                            </div>

                            <div className="gr-field">
                                <label>Nivel de Acceso (1-10)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.nivelAcceso}
                                    onChange={(e) => setFormData({ ...formData, nivelAcceso: parseInt(e.target.value) || 1 })}
                                />
                                <small>1 = Máximo acceso, 10 = Mínimo acceso</small>
                            </div>

                            <div className="gr-modal-actions">
                                <button
                                    type="button"
                                    className="gr-btn gr-btn-secondary"
                                    onClick={handleCerrarModal}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="gr-btn gr-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : (editingRol ? 'Actualizar' : 'Crear Rol')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionRoles;