// Componente Gestión de Materias (Dirección) - MEJORADO
// Crea, edita, elimina y filtra materias del plan de estudio.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionMateriasDireccion = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [materias, setMaterias] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingMateria, setEditingMateria] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Filtros
    const [filterTipo, setFilterTipo] = useState('todos');
    const [filterEspecialidad, setFilterEspecialidad] = useState('todas');
    const [searchTerm, setSearchTerm] = useState('');

    // Formulario
    const [formData, setFormData] = useState({
        nombreMateria: '',
        codigoMateria: '',
        tipoMateria: 'Basica',
        escalaMaxima: 100,
        escalaMinima: 0,
        notaMinima: 6,
        decimalesPermitidos: 2,
        idEspecialidad: null
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
                API.get('/materias'),
                API.get('/especialidades')
            ]);
            setMaterias(materiasRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
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
    const handleOpenModal = (materia = null) => {
        if (materia) {
            setEditingMateria(materia);
            setFormData({
                nombreMateria: materia.nombreMateria || '',
                codigoMateria: materia.codigoMateria || '',
                tipoMateria: materia.tipoMateria || 'Basica',
                escalaMaxima: materia.escalaMaxima || 100,
                escalaMinima: materia.escalaMinima || 0,
                notaMinima: materia.notaMinima || 6,
                decimalesPermitidos: materia.decimalesPermitidos || 2,
                idEspecialidad: materia.idEspecialidad ?? null
            });
        } else {
            setEditingMateria(null);
            setFormData({
                nombreMateria: '',
                codigoMateria: '',
                tipoMateria: 'Basica',
                escalaMaxima: 100,
                escalaMinima: 0,
                notaMinima: 6,
                decimalesPermitidos: 2,
                idEspecialidad: null
            });
        }
        setShowModal(true);
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
        if (Number(formData.notaMinima) < Number(formData.escalaMinima)) {
            mostrarMensaje('La nota mínima no puede ser menor que la escala mínima', 'error');
            return;
        }

        setSaving(true);
        try {
            const dataToSend = {
                nombreMateria: formData.nombreMateria.trim(),
                codigoMateria: formData.codigoMateria?.trim() || null,
                tipoMateria: formData.tipoMateria,
                escalaMaxima: Number(formData.escalaMaxima),
                escalaMinima: Number(formData.escalaMinima),
                notaMinima: Number(formData.notaMinima),
                decimalesPermitidos: Number(formData.decimalesPermitidos),
                idEspecialidad: formData.idEspecialidad ?? null
            };

            if (editingMateria) {
                await API.put(`/materias/${editingMateria.idMateria}`, dataToSend);
                mostrarMensaje('Materia actualizada correctamente', 'success');
            } else {
                await API.post('/materias', dataToSend);
                mostrarMensaje('Materia creada correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ELIMINAR
    // ============================================================
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar la materia "${nombre}"?`)) return;
        try {
            await API.delete(`/materias/${id}`);
            mostrarMensaje('Materia eliminada correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar', 'error');
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getTipoLabel = (tipo) => {
        const tipos = {
            'Basica': 'Básica',
            'Tecnica': 'Técnica',
            'Complementaria': 'Complementaria',
            'Electiva': 'Electiva'
        };
        return tipos[tipo] || tipo;
    };

    const getTipoBadge = (tipo) => {
        switch (tipo) {
            case 'Basica': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            case 'Tecnica': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Complementaria': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Electiva': return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    const getEspecialidadNombre = (id) => {
        if (!id) return 'Bachillerato General';
        const esp = especialidades.find(e => e.idEspecialidad === Number(id));
        return esp ? esp.nombreEspecialidad : 'Bachillerato General';
    };

    // Lista de especialidades + "Bachillerato General" (sin duplicar)
    const especialidadesConGeneral = useMemo(() => {
        const lista = [...especialidades];
        const yaExiste = lista.some(e =>
            e.idEspecialidad === 0 ||
            (e.nombreEspecialidad && e.nombreEspecialidad.toLowerCase().includes('bachillerato general'))
        );
        if (!yaExiste) {
            lista.unshift({ idEspecialidad: 0, nombreEspecialidad: 'Bachillerato General' });
        }
        return lista;
    }, [especialidades]);

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const materiasFiltradas = useMemo(() => {
        return materias.filter(m => {
            // Filtro por tipo
            if (filterTipo !== 'todos' && m.tipoMateria !== filterTipo) return false;

            // Filtro por especialidad (0 = Bachillerato General)
            if (filterEspecialidad !== 'todas') {
                const espFiltro = parseInt(filterEspecialidad);
                const espMateria = m.idEspecialidad ? Number(m.idEspecialidad) : 0;
                if (espFiltro === 0) {
                    if (espMateria !== 0) return false;
                } else {
                    if (espMateria !== espFiltro) return false;
                }
            }

            // Búsqueda
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    (m.nombreMateria && m.nombreMateria.toLowerCase().includes(term)) ||
                    (m.codigoMateria && m.codigoMateria.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [materias, filterTipo, filterEspecialidad, searchTerm]);

    const stats = useMemo(() => ({
        total: materias.length,
        basicas: materias.filter(m => m.tipoMateria === 'Basica').length,
        tecnicas: materias.filter(m => m.tipoMateria === 'Tecnica').length,
        complementarias: materias.filter(m => m.tipoMateria === 'Complementaria').length,
        electivas: materias.filter(m => m.tipoMateria === 'Electiva').length
    }), [materias]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Materias - Dirección">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Materias - Dirección">
            <style>{`
                .gm-container { display: flex; flex-direction: column; gap: 20px; }
                .gm-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .gm-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .gm-filtros { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 14px; }
                .gm-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gm-field input, .gm-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .gm-field input:focus, .gm-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                .gm-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
                .gm-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .gm-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gm-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gm-stat-total { background: #eff6ff; color: #1e40af; }
                .gm-stat-basica { background: #dbeafe; color: #1d4ed8; }
                .gm-stat-tecnica { background: #dcfce7; color: #15803d; }
                .gm-stat-complementaria { background: #fef3c7; color: #b45309; }
                .gm-stat-electiva { background: #e9d5ff; color: #6b21a8; }

                .gm-table { width: 100%; border-collapse: collapse; }
                .gm-table thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 12px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .gm-table thead th:first-child { border-top-left-radius: 8px; }
                .gm-table thead th:last-child { border-top-right-radius: 8px; }
                .gm-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .gm-table tbody tr:hover { background: #f8fafc; }
                .gm-table tbody tr:nth-child(even) { background: #fafbfc; }
                .gm-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .gm-table td { padding: 10px; font-size: 13px; color: #334155; vertical-align: middle; }

                .gm-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }

                .gm-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
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

                .gm-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gm-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gm-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gm-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                .gm-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .gm-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 580px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .gm-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gm-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gm-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gm-modal-close:hover { color: #dc2626; }
                .gm-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gm-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .gm-form-grid-full { grid-column: 1 / -1; }

                .gm-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }
                .gm-preview-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; font-size: 12px; color: #475569; margin-top: 8px; }
                .gm-preview-box strong { color: #1e3a5f; }

                .gm-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 900px) {
                    .gm-filtros { grid-template-columns: 1fr 1fr; }
                    .gm-form-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .gm-filtros { grid-template-columns: 1fr; }
                    .gm-table { font-size: 12px; }
                    .gm-table thead th, .gm-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gm-container">
                {message && <div className={`gm-aviso ${messageType}`}>{message}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gm-stats">
                    <div className="gm-stat gm-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Materias</span>
                    </div>
                    <div className="gm-stat gm-stat-basica">
                        <span className="num">{stats.basicas}</span>
                        <span className="lbl">Básicas</span>
                    </div>
                    <div className="gm-stat gm-stat-tecnica">
                        <span className="num">{stats.tecnicas}</span>
                        <span className="lbl">Técnicas</span>
                    </div>
                    <div className="gm-stat gm-stat-complementaria">
                        <span className="num">{stats.complementarias}</span>
                        <span className="lbl">Complementarias</span>
                    </div>
                    <div className="gm-stat gm-stat-electiva">
                        <span className="num">{stats.electivas}</span>
                        <span className="lbl">Electivas</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="gm-card">
                    <h3>Filtros y Búsqueda</h3>
                    <div className="gm-filtros">
                        <div className="gm-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Nombre o código de la materia..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="gm-field">
                            <label>Tipo</label>
                            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                                <option value="todos">Todos los tipos</option>
                                <option value="Basica">Básica</option>
                                <option value="Tecnica">Técnica</option>
                                <option value="Complementaria">Complementaria</option>
                                <option value="Electiva">Electiva</option>
                            </select>
                        </div>
                        <div className="gm-field">
                            <label>Especialidad</label>
                            <select value={filterEspecialidad} onChange={(e) => setFilterEspecialidad(e.target.value)}>
                                <option value="todas">Todas las especialidades</option>
                                {especialidadesConGeneral.map(e => (
                                    <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                        {e.nombreEspecialidad}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px', alignItems: 'center' }}>
                        <button
                            className="gm-btn gm-btn-primary"
                            onClick={() => handleOpenModal()}
                        >
                            + Nueva Materia
                        </button>
                        <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{materiasFiltradas.length}</strong> de {materias.length} materias
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gm-card">
                    <h3>Lista de Materias</h3>
                    <div className="table-responsive">
                        <table className="gm-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '55px' }}>ID</th>
                                    <th>Nombre</th>
                                    <th style={{ width: '120px' }}>Código</th>
                                    <th style={{ width: '140px', textAlign: 'center' }}>Tipo</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Nota Mín.</th>
                                    <th>Especialidad</th>
                                    <th style={{ width: '180px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materiasFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="gm-empty">
                                            No hay materias que coincidan con los filtros
                                        </td>
                                    </tr>
                                ) : (
                                    materiasFiltradas.map((m) => {
                                        const tipoColors = getTipoBadge(m.tipoMateria);
                                        return (
                                            <tr key={m.idMateria}>
                                                <td style={{ color: '#64748b' }}>{m.idMateria}</td>
                                                <td><strong>{m.nombreMateria}</strong></td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {m.codigoMateria || '-'}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        className="gm-badge"
                                                        style={{
                                                            backgroundColor: tipoColors.bg,
                                                            color: tipoColors.color,
                                                            border: `1px solid ${tipoColors.border}`
                                                        }}
                                                    >
                                                        {getTipoLabel(m.tipoMateria)}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                    {m.notaMinima}
                                                </td>
                                                <td>{getEspecialidadNombre(m.idEspecialidad)}</td>
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
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL CREAR / EDITAR */}
            {showModal && (
                <div className="gm-modal-overlay" onClick={() => !saving && setShowModal(false)}>
                    <div className="gm-modal" onClick={e => e.stopPropagation()}>
                        <div className="gm-modal-header">
                            <h3>{editingMateria ? 'Editar Materia' : 'Nueva Materia'}</h3>
                            <button className="gm-modal-close" onClick={() => setShowModal(false)} disabled={saving}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="gm-form-grid">
                                <div className="gm-field gm-form-grid-full">
                                    <label>Nombre de la Materia *</label>
                                    <input
                                        type="text"
                                        value={formData.nombreMateria}
                                        onChange={(e) => setFormData({ ...formData, nombreMateria: e.target.value })}
                                        required
                                        placeholder="Ej: Matemática, Programación I"
                                    />
                                </div>

                                <div className="gm-field">
                                    <label>Código de la Materia</label>
                                    <input
                                        type="text"
                                        value={formData.codigoMateria}
                                        onChange={(e) => setFormData({ ...formData, codigoMateria: e.target.value })}
                                        placeholder="Ej: MAT-B01"
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
                                        step="0.01"
                                        value={formData.escalaMinima}
                                        onChange={(e) => setFormData({ ...formData, escalaMinima: e.target.value })}
                                    />
                                </div>
                                <div className="gm-field">
                                    <label>Escala Máxima</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.escalaMaxima}
                                        onChange={(e) => setFormData({ ...formData, escalaMaxima: e.target.value })}
                                    />
                                </div>

                                <div className="gm-field">
                                    <label>Nota Mínima Aprobatoria</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.notaMinima}
                                        onChange={(e) => setFormData({ ...formData, notaMinima: e.target.value })}
                                    />
                                </div>
                                <div className="gm-field">
                                    <label>Decimales Permitidos</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="2"
                                        value={formData.decimalesPermitidos}
                                        onChange={(e) => setFormData({ ...formData, decimalesPermitidos: e.target.value })}
                                    />
                                </div>

                                <div className="gm-field gm-form-grid-full">
                                    <label>Especialidad</label>
                                    <select
                                        value={formData.idEspecialidad ?? ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            idEspecialidad: e.target.value === '' ? null : parseInt(e.target.value)
                                        })}
                                    >
                                        {especialidadesConGeneral.map(e => (
                                            <option key={e.idEspecialidad} value={e.idEspecialidad === 0 ? '' : e.idEspecialidad}>
                                                {e.nombreEspecialidad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Vista previa */}
                            <div className="gm-preview-box">
                                <strong>Vista previa:</strong> Los estudiantes deben obtener al menos{' '}
                                <strong>{formData.notaMinima || 0}</strong> de un máximo de{' '}
                                <strong>{formData.escalaMaxima || 100}</strong> para aprobar esta materia.
                            </div>

                            <div className="gm-modal-actions">
                                <button type="button" className="gm-btn gm-btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>
                                    Cancelar
                                </button>
                                <button type="submit" className="gm-btn gm-btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : (editingMateria ? 'Actualizar' : 'Crear Materia')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionMateriasDireccion;