// Componente Gestión de Grados (Admin): lista, crea, edita y elimina grados académicos.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getGrados, createGrado, updateGrado, deleteGrado } from '../../services/gradosService';
import { getNiveles } from '../../services/nivelesService';

// Componente principal: administra los grados por nivel con modal de creación/edición.
const GestionGradosAdmin = () => {
    // Estados: grados, niveles, modal de edición, mensajes y datos del formulario.
    const [grados, setGrados] = useState([]);
    const [niveles, setNiveles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    // Filtros
    const [filterNivel, setFilterNivel] = useState('');
    const [busqueda, setBusqueda] = useState('');

    const [formData, setFormData] = useState({
        idNivel: '',
        numeroGrado: '',
        nombreGrado: '',
        orden: ''
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
            const [gradosRes, nivelesRes] = await Promise.all([
                getGrados(),
                getNiveles()
            ]);
            setGrados(gradosRes || []);
            setNiveles(nivelesRes || []);
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
    // HELPERS
    // ============================================================
    const getNivelNombre = (idNivel) => {
        const nivel = niveles.find(n => String(n.idNiveles) === String(idNivel));
        return nivel ? nivel.nombreNivel : '-';
    };

    const getNivelBadge = (nombre) => {
        const n = (nombre || '').toLowerCase();
        if (n.includes('parvularia') || n.includes('inicial')) return { bg: '#fce7f3', color: '#9d174d', border: '#ec4899' };
        if (n.includes('primaria') || n.includes('básica')) return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
        if (n.includes('media') || n.includes('bachiller')) return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
        return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
    };

    // ============================================================
    // MODAL
    // ============================================================
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                idNivel: item.idNivel || '',
                numeroGrado: item.numeroGrado || '',
                nombreGrado: item.nombreGrado || '',
                orden: item.orden || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                idNivel: '',
                numeroGrado: '',
                nombreGrado: '',
                orden: ''
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

        if (!formData.idNivel) {
            mostrarMensaje('Seleccione un nivel', 'error');
            return;
        }
        if (!formData.nombreGrado.trim()) {
            mostrarMensaje('El nombre del grado es requerido', 'error');
            return;
        }
        if (!formData.numeroGrado) {
            mostrarMensaje('El número de grado es requerido', 'error');
            return;
        }

        setSaving(true);
        try {
            const data = {
                idNivel: parseInt(formData.idNivel),
                numeroGrado: parseInt(formData.numeroGrado),
                nombreGrado: formData.nombreGrado.trim(),
                orden: formData.orden ? parseInt(formData.orden) : parseInt(formData.numeroGrado)
            };

            if (editingItem) {
                await updateGrado(editingItem.idGrados, data);
                mostrarMensaje('Grado actualizado correctamente', 'success');
            } else {
                await createGrado(data);
                mostrarMensaje('Grado creado correctamente', 'success');
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
        if (!window.confirm(`¿Eliminar el grado "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
        try {
            await deleteGrado(id);
            mostrarMensaje('Grado eliminado correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar el grado', 'error');
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const gradosFiltrados = useMemo(() => {
        return grados.filter(g => {
            if (filterNivel && String(g.idNivel) !== String(filterNivel)) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (g.nombreGrado && g.nombreGrado.toLowerCase().includes(term)) ||
                    (String(g.numeroGrado) && String(g.numeroGrado).includes(term))
                );
            }
            return true;
        }).sort((a, b) => {
            const ordenA = a.orden || a.numeroGrado || 0;
            const ordenB = b.orden || b.numeroGrado || 0;
            return ordenA - ordenB;
        });
    }, [grados, filterNivel, busqueda]);

    const stats = useMemo(() => {
        const porNivel = {};
        grados.forEach(g => {
            const nombre = getNivelNombre(g.idNivel);
            porNivel[nombre] = (porNivel[nombre] || 0) + 1;
        });
        return {
            total: grados.length,
            niveles: niveles.length
        };
    }, [grados, niveles]);

    const filtrosActivos = (filterNivel ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterNivel('');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestion de Grados">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestion de Grados">
            <style>{`
                /* Fondo blanco general */
                .gg-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }

                .gg-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03);
                    border: 1px solid #e2e8f0;
                }
                .gg-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .gg-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .gg-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .gg-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gg-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gg-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .gg-stat-niveles { background: #e9d5ff; color: #6b21a8; border-color: #d8b4fe; }

                /* Filtros */
                .gg-filtros { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; }
                .gg-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gg-field input, .gg-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gg-field input:focus, .gg-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .gg-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                    font-family: inherit;
                }
                .gg-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gg-btn-primary { background: #1e3a5f; color: #fff; }
                .gg-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gg-btn-info { background: #3b82f6; color: #fff; }
                .gg-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gg-btn-danger { background: #dc2626; color: #fff; }
                .gg-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gg-btn-secondary { background: #e5e7eb; color: #334155; }
                .gg-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gg-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - FONDO BLANCO FORZADO */
                .gg-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .gg-tabla thead th {
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
                .gg-tabla tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    background-color: #ffffff !important;
                }
                .gg-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .gg-tabla td {
                    padding: 12px 10px;
                    color: #1e293b !important;
                    vertical-align: middle;
                    background-color: #ffffff !important;
                }
                .gg-tabla tbody tr:hover td {
                    background-color: #f1f5f9 !important;
                }
                .gg-tabla td.col-id {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                }
                .gg-tabla td.col-nombre {
                    font-weight: 600;
                    color: #0f172a !important;
                }
                .gg-tabla td.col-numero {
                    text-align: center;
                    font-weight: 600;
                    color: #1e40af !important;
                }
                .gg-tabla td.col-orden {
                    text-align: center;
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                }

                .gg-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .gg-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gg-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gg-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gg-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .gg-empty h3 { color: #334155; margin: 0 0 8px; }

                .gg-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .gg-badge-filtros {
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
                .gg-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .gg-modal {
                    background: #ffffff; border-radius: 12px;
                    max-width: 520px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .gg-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gg-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gg-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gg-modal-close:hover { color: #dc2626; }
                .gg-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gg-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .gg-form-grid-full { grid-column: 1 / -1; }

                .gg-modal .gg-field { margin-bottom: 14px; }
                .gg-modal .gg-field input, .gg-modal .gg-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gg-modal .gg-field input:focus, .gg-modal .gg-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .gg-modal .gg-field small {
                    display: block;
                    color: #64748b;
                    font-size: 12px;
                    margin-top: 4px;
                }

                .gg-info-box {
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
                }
                .gg-info-primary { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }

                .gg-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 900px) {
                    .gg-filtros { grid-template-columns: 1fr; }
                    .gg-form-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .gg-tabla { font-size: 12px; }
                    .gg-tabla thead th, .gg-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gg-container">
                {mensaje && <div className={`gg-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gg-stats">
                    <div className="gg-stat gg-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Grados</span>
                    </div>
                    <div className="gg-stat gg-stat-niveles">
                        <span className="num">{stats.niveles}</span>
                        <span className="lbl">Niveles</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="gg-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="gg-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="gg-filtros">
                        <div className="gg-field">
                            <label>Nivel</label>
                            <select value={filterNivel} onChange={(e) => setFilterNivel(e.target.value)}>
                                <option value="">Todos los niveles</option>
                                {niveles.map(n => (
                                    <option key={n.idNiveles} value={n.idNiveles}>
                                        {n.nombreNivel}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="gg-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o número de grado..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="gg-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="gg-btn gg-btn-primary" onClick={() => handleOpenModal()}>
                                Nuevo Grado
                            </button>
                            {filtrosActivos > 0 && (
                                <button className="gg-btn gg-btn-secondary" onClick={limpiarFiltros}>
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{gradosFiltrados.length}</strong> de {grados.length} grados
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gg-card">
                    <h3>Lista de Grados</h3>

                    {gradosFiltrados.length === 0 ? (
                        <div className="gg-empty">
                            <h3>No hay grados que coincidan</h3>
                            <p>Prueba ajustando los filtros o crea un nuevo grado.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="gg-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '70px' }}>ID</th>
                                        <th>Nivel</th>
                                        <th style={{ width: '90px', textAlign: 'center' }}>Número</th>
                                        <th>Nombre del Grado</th>
                                        <th style={{ width: '80px', textAlign: 'center' }}>Orden</th>
                                        <th style={{ width: '180px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gradosFiltrados.map((g) => {
                                        const nivelNombre = g.nivel?.nombreNivel || getNivelNombre(g.idNivel);
                                        const nivelBadge = getNivelBadge(nivelNombre);
                                        return (
                                            <tr key={g.idGrados}>
                                                <td className="col-id">{g.idGrados}</td>
                                                <td>
                                                    <span
                                                        className="gg-badge"
                                                        style={{
                                                            backgroundColor: nivelBadge.bg,
                                                            color: nivelBadge.color,
                                                            border: `1px solid ${nivelBadge.border}`
                                                        }}
                                                    >
                                                        {nivelNombre}
                                                    </span>
                                                </td>
                                                <td className="col-numero">{g.numeroGrado}</td>
                                                <td className="col-nombre">{g.nombreGrado}</td>
                                                <td className="col-orden">{g.orden || g.numeroGrado}</td>
                                                <td>
                                                    <div className="gg-acciones">
                                                        <button
                                                            className="gg-btn gg-btn-info gg-btn-sm"
                                                            onClick={() => handleOpenModal(g)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="gg-btn gg-btn-danger gg-btn-sm"
                                                            onClick={() => handleDelete(g.idGrados, g.nombreGrado)}
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
                <div className="gg-modal-overlay" onClick={handleCerrarModal}>
                    <div className="gg-modal" onClick={e => e.stopPropagation()}>
                        <div className="gg-modal-header">
                            <h3>{editingItem ? 'Editar Grado' : 'Nuevo Grado'}</h3>
                            <button className="gg-modal-close" onClick={handleCerrarModal} disabled={saving}>X</button>
                        </div>

                        {editingItem && (
                            <div className="gg-info-box gg-info-primary">
                                <strong>Editando:</strong> {editingItem.nombreGrado}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="gg-form-grid">
                                <div className="gg-field gg-form-grid-full">
                                    <label>Nivel *</label>
                                    <select
                                        value={formData.idNivel}
                                        onChange={(e) => setFormData({ ...formData, idNivel: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar Nivel</option>
                                        {niveles.map((n) => (
                                            <option key={n.idNiveles} value={n.idNiveles}>
                                                {n.nombreNivel}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="gg-field">
                                    <label>Número de Grado *</label>
                                    <input
                                        type="number"
                                        value={formData.numeroGrado}
                                        onChange={(e) => setFormData({ ...formData, numeroGrado: e.target.value })}
                                        required
                                        min="1"
                                        placeholder="Ej: 1, 2, 3..."
                                    />
                                </div>

                                <div className="gg-field">
                                    <label>Orden</label>
                                    <input
                                        type="number"
                                        value={formData.orden}
                                        onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
                                        placeholder="Auto"
                                    />
                                    <small>Dejar en blanco para usar el número</small>
                                </div>

                                <div className="gg-field gg-form-grid-full">
                                    <label>Nombre del Grado *</label>
                                    <input
                                        type="text"
                                        value={formData.nombreGrado}
                                        onChange={(e) => setFormData({ ...formData, nombreGrado: e.target.value })}
                                        required
                                        placeholder="Ej: Primer Grado, Segundo Grado..."
                                    />
                                </div>
                            </div>

                            <div className="gg-modal-actions">
                                <button
                                    type="button"
                                    className="gg-btn gg-btn-secondary"
                                    onClick={handleCerrarModal}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="gg-btn gg-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear Grado')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionGradosAdmin;