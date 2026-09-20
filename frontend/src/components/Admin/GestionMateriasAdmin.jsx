// Componente Gestión de Materias (Admin): lista, crea, edita y elimina materias.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getMaterias, createMateria, updateMateria, deleteMateria } from '../../services/materiasService';
import { getEspecialidades } from '../../services/especialidadesService';

// Componente principal: administra el catálogo de materias con su configuración de evaluación.
const GestionMateriasAdmin = () => {
    // Estados: materias, especialidades, modal de edición, mensajes y datos del formulario.
    const [materias, setMaterias] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    // Filtros
    const [filterTipo, setFilterTipo] = useState('');
    const [filterEspecialidad, setFilterEspecialidad] = useState('');
    const [busqueda, setBusqueda] = useState('');

    const [formData, setFormData] = useState({
        nombreMateria: '',
        codigoMateria: '',
        tipoMateria: 'Basica',
        escalaMaxima: 100,
        escalaMinima: 0,
        notaMinima: 6,
        decimalesPermitidos: 2,
        idEspecialidad: ''
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
            const [materiasRes, especialidadesRes] = await Promise.all([
                getMaterias(),
                getEspecialidades()
            ]);
            setMaterias(materiasRes || []);
            setEspecialidades(especialidadesRes || []);
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
    const getTipoBadge = (tipo) => {
        switch (tipo) {
            case 'Basica': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            case 'Tecnica': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Complementaria': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Electiva': return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    // ============================================================
    // MODAL
    // ============================================================
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                nombreMateria: item.nombreMateria || '',
                codigoMateria: item.codigoMateria || '',
                tipoMateria: item.tipoMateria || 'Basica',
                escalaMaxima: item.escalaMaxima || 100,
                escalaMinima: item.escalaMinima || 0,
                notaMinima: item.notaMinima || 6,
                decimalesPermitidos: item.decimalesPermitidos || 2,
                idEspecialidad: item.idEspecialidad || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                nombreMateria: '',
                codigoMateria: '',
                tipoMateria: 'Basica',
                escalaMaxima: 100,
                escalaMinima: 0,
                notaMinima: 6,
                decimalesPermitidos: 2,
                idEspecialidad: ''
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

        if (!formData.nombreMateria.trim()) {
            mostrarMensaje('El nombre de la materia es requerido', 'error');
            return;
        }

        if (formData.escalaMinima >= formData.escalaMaxima) {
            mostrarMensaje('La escala mínima debe ser menor que la máxima', 'error');
            return;
        }

        if (formData.notaMinima < formData.escalaMinima || formData.notaMinima > formData.escalaMaxima) {
            mostrarMensaje('La nota mínima debe estar dentro del rango de la escala', 'error');
            return;
        }

        setSaving(true);
        try {
            const dataToSend = {
                nombreMateria: formData.nombreMateria.trim(),
                codigoMateria: formData.codigoMateria.trim(),
                tipoMateria: formData.tipoMateria,
                escalaMaxima: parseInt(formData.escalaMaxima),
                escalaMinima: parseInt(formData.escalaMinima),
                notaMinima: parseFloat(formData.notaMinima),
                decimalesPermitidos: parseInt(formData.decimalesPermitidos),
                idEspecialidad: formData.idEspecialidad ? parseInt(formData.idEspecialidad) : null
            };

            if (editingItem) {
                await updateMateria(editingItem.idMateria, dataToSend);
                mostrarMensaje('Materia actualizada correctamente', 'success');
            } else {
                await createMateria(dataToSend);
                mostrarMensaje('Materia creada correctamente', 'success');
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
        if (!window.confirm(`¿Eliminar la materia "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
        try {
            await deleteMateria(id);
            mostrarMensaje('Materia eliminada correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar la materia', 'error');
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const materiasFiltradas = useMemo(() => {
        return materias.filter(m => {
            if (filterTipo && m.tipoMateria !== filterTipo) return false;
            if (filterEspecialidad && String(m.idEspecialidad || '') !== String(filterEspecialidad)) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (m.nombreMateria && m.nombreMateria.toLowerCase().includes(term)) ||
                    (m.codigoMateria && m.codigoMateria.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [materias, filterTipo, filterEspecialidad, busqueda]);

    const stats = useMemo(() => ({
        total: materias.length,
        basicas: materias.filter(m => m.tipoMateria === 'Basica').length,
        tecnicas: materias.filter(m => m.tipoMateria === 'Tecnica').length,
        otras: materias.filter(m => !['Basica', 'Tecnica'].includes(m.tipoMateria)).length
    }), [materias]);

    const filtrosActivos = (filterTipo ? 1 : 0) + (filterEspecialidad ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterTipo('');
        setFilterEspecialidad('');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestion de Materias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestion de Materias">
            <style>{`
                /* Fondo blanco general */
                .gm-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }

                .gm-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03);
                    border: 1px solid #e2e8f0;
                }
                .gm-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .gm-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .gm-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .gm-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gm-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gm-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .gm-stat-basicas { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }
                .gm-stat-tecnicas { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
                .gm-stat-otras { background: #e9d5ff; color: #6b21a8; border-color: #d8b4fe; }

                /* Filtros */
                .gm-filtros { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 14px; }
                .gm-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gm-field input, .gm-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gm-field input:focus, .gm-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .gm-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                    font-family: inherit;
                }
                .gm-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gm-btn-primary { background: #1e3a5f; color: #fff; }
                .gm-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gm-btn-info { background: #3b82f6; color: #fff; }
                .gm-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gm-btn-danger { background: #dc2626; color: #fff; }
                .gm-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gm-btn-secondary { background: #e5e7eb; color: #334155; }
                .gm-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gm-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - FONDO BLANCO FORZADO */
                .gm-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .gm-tabla thead th {
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
                .gm-tabla tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    background-color: #ffffff !important;
                }
                .gm-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .gm-tabla td {
                    padding: 12px 10px;
                    color: #1e293b !important;
                    vertical-align: middle;
                    background-color: #ffffff !important;
                }
                .gm-tabla tbody tr:hover td {
                    background-color: #f1f5f9 !important;
                }
                .gm-tabla td.col-id {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                }
                .gm-tabla td.col-nombre {
                    font-weight: 600;
                    color: #0f172a !important;
                }
                .gm-tabla td.col-codigo {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                }

                .gm-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .gm-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gm-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gm-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gm-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .gm-empty h3 { color: #334155; margin: 0 0 8px; }

                .gm-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .gm-badge-filtros {
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
                .gm-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .gm-modal {
                    background: #ffffff; border-radius: 12px;
                    max-width: 560px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .gm-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gm-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gm-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gm-modal-close:hover { color: #dc2626; }
                .gm-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gm-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .gm-form-grid-full { grid-column: 1 / -1; }

                .gm-modal .gm-field { margin-bottom: 14px; }
                .gm-modal .gm-field input, .gm-modal .gm-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gm-modal .gm-field input:focus, .gm-modal .gm-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .gm-modal .gm-field small {
                    display: block;
                    color: #64748b;
                    font-size: 12px;
                    margin-top: 4px;
                }

                .gm-info-box {
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
                }
                .gm-info-primary { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }

                .gm-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 900px) {
                    .gm-filtros { grid-template-columns: 1fr 1fr; }
                    .gm-form-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .gm-filtros { grid-template-columns: 1fr; }
                    .gm-tabla { font-size: 12px; }
                    .gm-tabla thead th, .gm-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gm-container">
                {mensaje && <div className={`gm-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gm-stats">
                    <div className="gm-stat gm-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Materias</span>
                    </div>
                    <div className="gm-stat gm-stat-basicas">
                        <span className="num">{stats.basicas}</span>
                        <span className="lbl">Básicas</span>
                    </div>
                    <div className="gm-stat gm-stat-tecnicas">
                        <span className="num">{stats.tecnicas}</span>
                        <span className="lbl">Técnicas</span>
                    </div>
                    <div className="gm-stat gm-stat-otras">
                        <span className="num">{stats.otras}</span>
                        <span className="lbl">Otras</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="gm-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="gm-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="gm-filtros">
                        <div className="gm-field">
                            <label>Tipo</label>
                            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                                <option value="">Todos los tipos</option>
                                <option value="Basica">Básica</option>
                                <option value="Tecnica">Técnica</option>
                                <option value="Complementaria">Complementaria</option>
                                <option value="Electiva">Electiva</option>
                            </select>
                        </div>
                        <div className="gm-field">
                            <label>Especialidad</label>
                            <select value={filterEspecialidad} onChange={(e) => setFilterEspecialidad(e.target.value)}>
                                <option value="">Todas</option>
                                {especialidades.map(e => (
                                    <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                        {e.nombreEspecialidad}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="gm-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="gm-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="gm-btn gm-btn-primary" onClick={() => handleOpenModal()}>
                                Nueva Materia
                            </button>
                            {filtrosActivos > 0 && (
                                <button className="gm-btn gm-btn-secondary" onClick={limpiarFiltros}>
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{materiasFiltradas.length}</strong> de {materias.length} materias
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gm-card">
                    <h3>Lista de Materias</h3>

                    {materiasFiltradas.length === 0 ? (
                        <div className="gm-empty">
                            <h3>No hay materias que coincidan</h3>
                            <p>Prueba ajustando los filtros o crea una nueva materia.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="gm-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '70px' }}>ID</th>
                                        <th>Nombre</th>
                                        <th style={{ width: '120px' }}>Código</th>
                                        <th style={{ width: '150px' }}>Tipo</th>
                                        <th style={{ width: '100px', textAlign: 'center' }}>Nota Mín.</th>
                                        <th>Especialidad</th>
                                        <th style={{ width: '180px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materiasFiltradas.map((m) => {
                                        const tipoBadge = getTipoBadge(m.tipoMateria);
                                        return (
                                            <tr key={m.idMateria}>
                                                <td className="col-id">{m.idMateria}</td>
                                                <td className="col-nombre">{m.nombreMateria}</td>
                                                <td className="col-codigo">{m.codigoMateria || '-'}</td>
                                                <td>
                                                    <span
                                                        className="gm-badge"
                                                        style={{
                                                            backgroundColor: tipoBadge.bg,
                                                            color: tipoBadge.color,
                                                            border: `1px solid ${tipoBadge.border}`
                                                        }}
                                                    >
                                                        {m.tipoMateria}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                                    {m.notaMinima}
                                                </td>
                                                <td>{m.especialidad?.nombreEspecialidad || 'General'}</td>
                                                <td>
                                                    <div className="gm-acciones">
                                                        <button
                                                            className="gm-btn gm-btn-info gm-btn-sm"
                                                            onClick={() => handleOpenModal(m)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="gm-btn gm-btn-danger gm-btn-sm"
                                                            onClick={() => handleDelete(m.idMateria, m.nombreMateria)}
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
                <div className="gm-modal-overlay" onClick={handleCerrarModal}>
                    <div className="gm-modal" onClick={e => e.stopPropagation()}>
                        <div className="gm-modal-header">
                            <h3>{editingItem ? 'Editar Materia' : 'Nueva Materia'}</h3>
                            <button className="gm-modal-close" onClick={handleCerrarModal} disabled={saving}>X</button>
                        </div>

                        {editingItem && (
                            <div className="gm-info-box gm-info-primary">
                                <strong>Editando:</strong> {editingItem.nombreMateria}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="gm-form-grid">
                                <div className="gm-field gm-form-grid-full">
                                    <label>Nombre de la Materia *</label>
                                    <input
                                        type="text"
                                        value={formData.nombreMateria}
                                        onChange={(e) => setFormData({ ...formData, nombreMateria: e.target.value })}
                                        required
                                        placeholder="Ej: Matemáticas, Lenguaje..."
                                    />
                                </div>

                                <div className="gm-field">
                                    <label>Código de la Materia</label>
                                    <input
                                        type="text"
                                        value={formData.codigoMateria}
                                        onChange={(e) => setFormData({ ...formData, codigoMateria: e.target.value })}
                                        placeholder="Ej: MAT101"
                                    />
                                </div>

                                <div className="gm-field">
                                    <label>Tipo de Materia</label>
                                    <select
                                        value={formData.tipoMateria}
                                        onChange={(e) => setFormData({ ...formData, tipoMateria: e.target.value })}
                                    >
                                        <option value="Basica">Básica</option>
                                        <option value="Tecnica">Técnica</option>
                                        <option value="Complementaria">Complementaria</option>
                                        <option value="Electiva">Electiva</option>
                                    </select>
                                </div>

                                <div className="gm-field">
                                    <label>Escala Mínima</label>
                                    <input
                                        type="number"
                                        value={formData.escalaMinima}
                                        onChange={(e) => setFormData({ ...formData, escalaMinima: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="gm-field">
                                    <label>Escala Máxima</label>
                                    <input
                                        type="number"
                                        value={formData.escalaMaxima}
                                        onChange={(e) => setFormData({ ...formData, escalaMaxima: parseInt(e.target.value) || 100 })}
                                    />
                                </div>

                                <div className="gm-field">
                                    <label>Nota Mínima para Aprobar</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.notaMinima}
                                        onChange={(e) => setFormData({ ...formData, notaMinima: parseFloat(e.target.value) || 0 })}
                                    />
                                    <small>Nota mínima requerida para aprobar la materia</small>
                                </div>

                                <div className="gm-field">
                                    <label>Decimales Permitidos</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="4"
                                        value={formData.decimalesPermitidos}
                                        onChange={(e) => setFormData({ ...formData, decimalesPermitidos: parseInt(e.target.value) || 0 })}
                                    />
                                    <small>Cantidad de decimales en las calificaciones</small>
                                </div>

                                <div className="gm-field gm-form-grid-full">
                                    <label>Especialidad</label>
                                    <select
                                        value={formData.idEspecialidad}
                                        onChange={(e) => setFormData({ ...formData, idEspecialidad: e.target.value })}
                                    >
                                        <option value="">General (Bachillerato)</option>
                                        {especialidades.map((e) => (
                                            <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                                {e.nombreEspecialidad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="gm-modal-actions">
                                <button
                                    type="button"
                                    className="gm-btn gm-btn-secondary"
                                    onClick={handleCerrarModal}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="gm-btn gm-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear Materia')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionMateriasAdmin;