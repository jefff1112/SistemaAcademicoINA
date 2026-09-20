// Componente Gestión de Docentes (Dirección) - MEJORADO
// Crea, edita, activa/desactiva docentes y asigna materias.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getDocentes, createDocente, updateDocente, deleteDocente } from '../../services/docentesService';
import { getMaterias } from '../../services/materiasService';
import { getClases } from '../../services/clasesService';
import { getDocenteMateriasByDocente, createDocenteMateria, deleteDocenteMateria } from '../../services/docenteMateriasService';

const GestionDocentesDireccion = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedDocente, setSelectedDocente] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [filterTipo, setFilterTipo] = useState('todos');
    const [filterEspecialidad, setFilterEspecialidad] = useState('todas');

    // Formulario
    const [formData, setFormData] = useState({
        codigoDocente: '',
        nombres: '',
        apellidos: '',
        dui: '',
        correo: '',
        telefono: '',
        especialidadDocente: '',
        tipoDocente: 'Basica',
        fechaIngreso: '',
        estado: true
    });

    // Modal asignar materias
    const [showAsignarModal, setShowAsignarModal] = useState(false);
    const [materiasList, setMateriasList] = useState([]);
    const [clasesList, setClasesList] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [busquedaMateria, setBusquedaMateria] = useState('');
    const [asignarForm, setAsignarForm] = useState({
        idMateria: '',
        idClase: '',
        anioLectivo: new Date().getFullYear(),
        puedeCalificar: true,
        puedeAmonestar: true
    });
    const [asignando, setAsignando] = useState(false);

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await getDocentes();
            setDocentes(data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar docentes', 'error');
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
    const handleOpenModal = (docente = null) => {
        if (docente) {
            setSelectedDocente(docente);
            setFormData({
                codigoDocente: docente.codigoDocente || '',
                nombres: docente.nombres || '',
                apellidos: docente.apellidos || '',
                dui: docente.dui || '',
                correo: docente.correo || '',
                telefono: docente.telefono || '',
                especialidadDocente: docente.especialidadDocente || '',
                tipoDocente: docente.tipoDocente || 'Basica',
                fechaIngreso: docente.fechaIngreso ? new Date(docente.fechaIngreso).toISOString().split('T')[0] : '',
                estado: docente.estado !== undefined ? docente.estado : true
            });
        } else {
            setSelectedDocente(null);
            setFormData({
                codigoDocente: '',
                nombres: '',
                apellidos: '',
                dui: '',
                correo: '',
                telefono: '',
                especialidadDocente: '',
                tipoDocente: 'Basica',
                fechaIngreso: '',
                estado: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.codigoDocente.trim()) {
            mostrarMensaje('El código del docente es requerido', 'error');
            return;
        }
        if (!formData.nombres.trim() || !formData.apellidos.trim()) {
            mostrarMensaje('Nombres y apellidos son requeridos', 'error');
            return;
        }

        setSaving(true);
        try {
            const dataToSend = {
                codigoDocente: formData.codigoDocente.trim(),
                nombres: formData.nombres.trim(),
                apellidos: formData.apellidos.trim(),
                dui: formData.dui || null,
                correo: formData.correo || null,
                telefono: formData.telefono || null,
                especialidadDocente: formData.especialidadDocente || null,
                tipoDocente: formData.tipoDocente || 'Basica',
                fechaIngreso: formData.fechaIngreso || null,
                estado: formData.estado
            };

            if (selectedDocente) {
                await updateDocente(selectedDocente.idDocente, dataToSend);
                mostrarMensaje('Docente actualizado correctamente', 'success');
            } else {
                await createDocente(dataToSend);
                mostrarMensaje('Docente creado correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            const mensaje = error.response?.data?.mensaje || error.message || 'Error al guardar';
            mostrarMensaje(mensaje, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ACTIVAR / DESACTIVAR
    // ============================================================
    const handleDelete = async (docente) => {
        const accion = docente.estado ? 'desactivar' : 'activar';
        if (!window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} al docente ${docente.nombres} ${docente.apellidos}?`)) return;

        setSaving(true);
        try {
            await deleteDocente(docente.idDocente);
            mostrarMensaje(`Docente ${accion === 'desactivar' ? 'desactivado' : 'activado'} correctamente`, 'success');
            cargarDatos();
        } catch (error) {
            const mensaje = error.response?.data?.mensaje || error.message || 'Error';
            mostrarMensaje(mensaje, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ASIGNAR MATERIAS
    // ============================================================
    const handleOpenAsignar = async (docente) => {
        setSelectedDocente(docente);
        setAsignarForm({
            idMateria: '',
            idClase: '',
            anioLectivo: new Date().getFullYear(),
            puedeCalificar: true,
            puedeAmonestar: true
        });
        setBusquedaMateria('');
        setShowAsignarModal(true);

        try {
            const anio = new Date().getFullYear();
            const [materiasData, clasesData, asignacionesData] = await Promise.all([
                getMaterias(),
                getClases(),
                getDocenteMateriasByDocente(docente.idDocente, anio)
            ]);
            setMateriasList(materiasData || []);
            setClasesList(clasesData || []);
            setAsignaciones(asignacionesData || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos de asignación', 'error');
        }
    };

    const handleCerrarAsignar = () => {
        setShowAsignarModal(false);
        setSelectedDocente(null);
        setAsignaciones([]);
        setBusquedaMateria('');
    };

    const handleAsignar = async (e) => {
        e.preventDefault();
        if (!asignarForm.idMateria || !asignarForm.idClase) {
            mostrarMensaje('Seleccione materia y clase', 'error');
            return;
        }

        setAsignando(true);
        try {
            await createDocenteMateria({
                idDocente: selectedDocente.idDocente,
                idMateria: parseInt(asignarForm.idMateria),
                idClase: parseInt(asignarForm.idClase),
                anioLectivo: parseInt(asignarForm.anioLectivo),
                puedeCalificar: asignarForm.puedeCalificar,
                puedeAmonestar: asignarForm.puedeAmonestar
            });
            mostrarMensaje('Materia asignada correctamente', 'success');
            const asignacionesData = await getDocenteMateriasByDocente(selectedDocente.idDocente, asignarForm.anioLectivo);
            setAsignaciones(asignacionesData || []);
            setAsignarForm({
                ...asignarForm,
                idMateria: '',
                idClase: ''
            });
        } catch (error) {
            const mensaje = error.response?.data?.mensaje || 'Error al asignar materia';
            mostrarMensaje(mensaje, 'error');
        } finally {
            setAsignando(false);
        }
    };

    const handleQuitarAsignacion = async (asignacion) => {
        if (!window.confirm('¿Quitar esta materia asignada?')) return;
        try {
            await deleteDocenteMateria(asignacion.idDocenteMateria);
            mostrarMensaje('Asignación eliminada correctamente', 'success');
            const asignacionesData = await getDocenteMateriasByDocente(selectedDocente.idDocente, asignarForm.anioLectivo);
            setAsignaciones(asignacionesData || []);
        } catch (error) {
            const mensaje = error.response?.data?.mensaje || 'Error al eliminar asignación';
            mostrarMensaje(mensaje, 'error');
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const especialidadesDisponibles = useMemo(() => {
        const set = new Set();
        docentes.forEach(d => {
            if (d.especialidadDocente) set.add(d.especialidadDocente);
        });
        return Array.from(set).sort();
    }, [docentes]);

    const docentesFiltrados = useMemo(() => {
        return docentes.filter(d => {
            // Filtro por estado
            if (filterEstado === 'activos' && !d.estado) return false;
            if (filterEstado === 'inactivos' && d.estado) return false;

            // Filtro por tipo
            if (filterTipo !== 'todos' && d.tipoDocente !== filterTipo) return false;

            // Filtro por especialidad
            if (filterEspecialidad !== 'todas' && d.especialidadDocente !== filterEspecialidad) return false;

            // Búsqueda
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    (d.nombres && d.nombres.toLowerCase().includes(term)) ||
                    (d.apellidos && d.apellidos.toLowerCase().includes(term)) ||
                    (d.codigoDocente && d.codigoDocente.toLowerCase().includes(term)) ||
                    (d.correo && d.correo.toLowerCase().includes(term)) ||
                    (d.dui && d.dui.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [docentes, filterEstado, filterTipo, filterEspecialidad, searchTerm]);

    const stats = useMemo(() => ({
        total: docentes.length,
        activos: docentes.filter(d => d.estado).length,
        inactivos: docentes.filter(d => !d.estado).length,
        basicas: docentes.filter(d => d.tipoDocente === 'Basica').length,
        tecnicos: docentes.filter(d => d.tipoDocente === 'Tecnica').length
    }), [docentes]);

    // Materias filtradas para el select (con búsqueda)
    const materiasFiltradasSelect = useMemo(() => {
        if (!busquedaMateria.trim()) return materiasList;
        const term = busquedaMateria.toLowerCase();
        return materiasList.filter(m =>
            m.nombreMateria?.toLowerCase().includes(term) ||
            m.codigoMateria?.toLowerCase().includes(term)
        );
    }, [materiasList, busquedaMateria]);

    // Asignaciones del año seleccionado
    const asignacionesFiltradas = useMemo(() => {
        return asignaciones.filter(a =>
            Number(a.anioLectivo) === Number(asignarForm.anioLectivo) && a.estado !== false
        );
    }, [asignaciones, asignarForm.anioLectivo]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Docentes - Dirección">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Docentes - Dirección">
            <style>{`
                .gd-container { display: flex; flex-direction: column; gap: 20px; }
                .gd-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .gd-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .gd-filtros { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 14px; }
                .gd-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gd-field input, .gd-field select, .gd-field textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .gd-field input:focus, .gd-field select:focus, .gd-field textarea:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .gd-field textarea { min-height: 80px; resize: vertical; }

                .gd-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
                .gd-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .gd-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gd-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gd-stat-total { background: #eff6ff; color: #1e40af; }
                .gd-stat-activos { background: #dcfce7; color: #15803d; }
                .gd-stat-inactivos { background: #fee2e2; color: #b91c1c; }
                .gd-stat-basica { background: #fef3c7; color: #b45309; }
                .gd-stat-tecnica { background: #dbeafe; color: #1d4ed8; }

                .gd-table { width: 100%; border-collapse: collapse; }
                .gd-table thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 12px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .gd-table thead th:first-child { border-top-left-radius: 8px; }
                .gd-table thead th:last-child { border-top-right-radius: 8px; }
                .gd-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .gd-table tbody tr:hover { background: #f8fafc; }
                .gd-table tbody tr:nth-child(even) { background: #fafbfc; }
                .gd-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .gd-table td { padding: 10px; font-size: 13px; color: #334155; vertical-align: middle; }

                .gd-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }
                .gd-badge-activo { background: #dcfce7; color: #15803d; border: 1px solid #16a34a; }
                .gd-badge-inactivo { background: #fee2e2; color: #b91c1c; border: 1px solid #dc2626; }
                .gd-badge-tipo-basica { background: #fef3c7; color: #b45309; border: 1px solid #f59e0b; }
                .gd-badge-tipo-tecnica { background: #dbeafe; color: #1d4ed8; border: 1px solid #3b82f6; }
                .gd-badge-tipo-ambas { background: #e9d5ff; color: #6b21a8; border: 1px solid #a855f7; }

                .gd-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .gd-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gd-btn-primary { background: #1e3a5f; color: #fff; }
                .gd-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gd-btn-info { background: #3b82f6; color: #fff; }
                .gd-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gd-btn-success { background: #16a34a; color: #fff; }
                .gd-btn-success:hover:not(:disabled) { background: #15803d; }
                .gd-btn-danger { background: #dc2626; color: #fff; }
                .gd-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gd-btn-teal { background: #0d9488; color: #fff; }
                .gd-btn-teal:hover:not(:disabled) { background: #0f766e; }
                .gd-btn-secondary { background: #e5e7eb; color: #334155; }
                .gd-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gd-btn-sm { padding: 5px 12px; font-size: 12px; }

                .gd-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gd-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gd-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gd-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                .gd-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .gd-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 620px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .gd-modal-lg { max-width: 780px; }
                .gd-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gd-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gd-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gd-modal-close:hover { color: #dc2626; }
                .gd-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gd-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
                .gd-form-grid-full { grid-column: 1 / -1; }

                .gd-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }

                .gd-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                .gd-asignacion-card {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 8px;
                    margin-bottom: 8px; background: #fafbfc;
                }
                .gd-asignacion-card:hover { background: #f1f5f9; }

                .gd-permisos { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
                .gd-permiso-badge { font-size: 11px; padding: 2px 8px; border-radius: 6px; background: #dbeafe; color: #1d4ed8; }
                .gd-permiso-badge.no { background: #f1f5f9; color: #94a3b8; }

                @media (max-width: 900px) {
                    .gd-filtros { grid-template-columns: 1fr 1fr; }
                    .gd-form-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .gd-filtros { grid-template-columns: 1fr; }
                    .gd-table { font-size: 12px; }
                    .gd-table thead th, .gd-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gd-container">
                {message && <div className={`gd-aviso ${messageType}`}>{message}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gd-stats">
                    <div className="gd-stat gd-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total</span>
                    </div>
                    <div className="gd-stat gd-stat-activos">
                        <span className="num">{stats.activos}</span>
                        <span className="lbl">Activos</span>
                    </div>
                    <div className="gd-stat gd-stat-inactivos">
                        <span className="num">{stats.inactivos}</span>
                        <span className="lbl">Inactivos</span>
                    </div>
                    <div className="gd-stat gd-stat-basica">
                        <span className="num">{stats.basicas}</span>
                        <span className="lbl">Básica</span>
                    </div>
                    <div className="gd-stat gd-stat-tecnica">
                        <span className="num">{stats.tecnicos}</span>
                        <span className="lbl">Técnica</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="gd-card">
                    <h3>Filtros y Búsqueda</h3>
                    <div className="gd-filtros">
                        <div className="gd-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Nombre, código, correo, DUI..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="gd-field">
                            <label>Estado</label>
                            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="activos">Solo activos</option>
                                <option value="inactivos">Solo inactivos</option>
                            </select>
                        </div>
                        <div className="gd-field">
                            <label>Tipo</label>
                            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="Basica">Básica</option>
                                <option value="Tecnica">Técnica</option>
                                <option value="Ambas">Ambas</option>
                            </select>
                        </div>
                        <div className="gd-field">
                            <label>Especialidad</label>
                            <select value={filterEspecialidad} onChange={(e) => setFilterEspecialidad(e.target.value)}>
                                <option value="todas">Todas</option>
                                {especialidadesDisponibles.map(esp => (
                                    <option key={esp} value={esp}>{esp}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                        <button
                            className="gd-btn gd-btn-primary"
                            onClick={() => handleOpenModal()}
                        >
                            + Nuevo Docente
                        </button>
                        <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b', alignSelf: 'center' }}>
                            Mostrando <strong>{docentesFiltrados.length}</strong> de {docentes.length} docentes
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gd-card">
                    <h3>Lista de Docentes</h3>
                    <div className="table-responsive">
                        <table className="gd-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '110px' }}>Código</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>Correo</th>
                                    <th>Especialidad</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Tipo</th>
                                    <th style={{ width: '100px' }}>Estado</th>
                                    <th style={{ width: '260px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docentesFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="gd-empty">
                                            No hay docentes que coincidan con los filtros
                                        </td>
                                    </tr>
                                ) : (
                                    docentesFiltrados.map((d) => {
                                        const tipoClase = d.tipoDocente === 'Tecnica'
                                            ? 'gd-badge-tipo-tecnica'
                                            : d.tipoDocente === 'Ambas'
                                                ? 'gd-badge-tipo-ambas'
                                                : 'gd-badge-tipo-basica';
                                        const tipoLabel = d.tipoDocente === 'Tecnica'
                                            ? 'Técnica'
                                            : d.tipoDocente === 'Ambas'
                                                ? 'Ambas'
                                                : 'Básica';
                                        return (
                                            <tr key={d.idDocente}>
                                                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                    <strong>{d.codigoDocente}</strong>
                                                </td>
                                                <td><strong>{d.nombres}</strong></td>
                                                <td>{d.apellidos}</td>
                                                <td style={{ fontSize: '12px' }}>{d.correo || '-'}</td>
                                                <td>{d.especialidadDocente || '-'}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`gd-badge ${tipoClase}`}>
                                                        {tipoLabel}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`gd-badge ${d.estado ? 'gd-badge-activo' : 'gd-badge-inactivo'}`}>
                                                        {d.estado ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="gd-acciones">
                                                        <button
                                                            className="gd-btn gd-btn-info gd-btn-sm"
                                                            onClick={() => handleOpenModal(d)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="gd-btn gd-btn-teal gd-btn-sm"
                                                            onClick={() => handleOpenAsignar(d)}
                                                        >
                                                            Materias
                                                        </button>
                                                        <button
                                                            className={`gd-btn ${d.estado ? 'gd-btn-danger' : 'gd-btn-success'} gd-btn-sm`}
                                                            onClick={() => handleDelete(d)}
                                                        >
                                                            {d.estado ? 'Desactivar' : 'Activar'}
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

            {/* MODAL CREAR / EDITAR DOCENTE */}
            {showModal && (
                <div className="gd-modal-overlay" onClick={() => !saving && setShowModal(false)}>
                    <div className="gd-modal" onClick={e => e.stopPropagation()}>
                        <div className="gd-modal-header">
                            <h3>{selectedDocente ? 'Editar Docente' : 'Nuevo Docente'}</h3>
                            <button className="gd-modal-close" onClick={() => setShowModal(false)} disabled={saving}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="gd-form-grid">
                                <div className="gd-field">
                                    <label>Código *</label>
                                    <input
                                        type="text"
                                        value={formData.codigoDocente}
                                        onChange={(e) => setFormData({ ...formData, codigoDocente: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="gd-field">
                                    <label>DUI</label>
                                    <input
                                        type="text"
                                        value={formData.dui}
                                        onChange={(e) => setFormData({ ...formData, dui: e.target.value })}
                                        placeholder="00000000-0"
                                    />
                                </div>
                                <div className="gd-field">
                                    <label>Nombres *</label>
                                    <input
                                        type="text"
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="gd-field">
                                    <label>Apellidos *</label>
                                    <input
                                        type="text"
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="gd-field">
                                    <label>Correo</label>
                                    <input
                                        type="email"
                                        value={formData.correo}
                                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                    />
                                </div>
                                <div className="gd-field">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>
                                <div className="gd-field">
                                    <label>Especialidad</label>
                                    <input
                                        type="text"
                                        value={formData.especialidadDocente}
                                        onChange={(e) => setFormData({ ...formData, especialidadDocente: e.target.value })}
                                        placeholder="Ej: Matemática, Programación"
                                    />
                                </div>
                                <div className="gd-field">
                                    <label>Tipo</label>
                                    <select
                                        value={formData.tipoDocente}
                                        onChange={(e) => setFormData({ ...formData, tipoDocente: e.target.value })}
                                    >
                                        <option value="Basica">Básica</option>
                                        <option value="Tecnica">Técnica</option>
                                        <option value="Ambas">Ambas</option>
                                    </select>
                                </div>
                                <div className="gd-field">
                                    <label>Fecha de Ingreso</label>
                                    <input
                                        type="date"
                                        value={formData.fechaIngreso}
                                        onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                                    />
                                </div>
                                <div className="gd-field" style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.estado}
                                            onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                                        />
                                        Docente activo
                                    </label>
                                </div>
                            </div>
                            <div className="gd-modal-actions">
                                <button type="button" className="gd-btn gd-btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>
                                    Cancelar
                                </button>
                                <button type="submit" className="gd-btn gd-btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : (selectedDocente ? 'Actualizar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ASIGNAR MATERIAS */}
            {showAsignarModal && selectedDocente && (
                <div className="gd-modal-overlay" onClick={() => !asignando && handleCerrarAsignar()}>
                    <div className="gd-modal gd-modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="gd-modal-header">
                            <h3>Asignar Materias</h3>
                            <button className="gd-modal-close" onClick={handleCerrarAsignar} disabled={asignando}>X</button>
                        </div>

                        <div className="gd-info-box">
                            <strong>Docente:</strong> {selectedDocente.nombres} {selectedDocente.apellidos}<br />
                            <strong>Código:</strong> {selectedDocente.codigoDocente} | <strong>Especialidad:</strong> {selectedDocente.especialidadDocente || '-'}
                        </div>

                        {/* Selector de año */}
                        <div className="gd-field" style={{ marginBottom: '14px' }}>
                            <label>Año Lectivo</label>
                            <select
                                value={asignarForm.anioLectivo}
                                onChange={(e) => {
                                    const anio = parseInt(e.target.value);
                                    setAsignarForm({ ...asignarForm, anioLectivo: anio });
                                    getDocenteMateriasByDocente(selectedDocente.idDocente, anio)
                                        .then(data => setAsignaciones(data || []))
                                        .catch(() => setAsignaciones([]));
                                }}
                            >
                                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>

                        {/* Formulario de asignación */}
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '20px' }}>
                            <h4 style={{ margin: '0 0 12px', color: '#334155', fontSize: '14px' }}>Nueva Asignación</h4>
                            <form onSubmit={handleAsignar}>
                                <div className="gd-form-grid">
                                    <div className="gd-field">
                                        <label>Buscar Materia</label>
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre o código..."
                                            value={busquedaMateria}
                                            onChange={(e) => setBusquedaMateria(e.target.value)}
                                            style={{ marginBottom: '8px' }}
                                        />
                                        <select
                                            value={asignarForm.idMateria}
                                            onChange={(e) => setAsignarForm({ ...asignarForm, idMateria: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccione...</option>
                                            {materiasFiltradasSelect.map(m => (
                                                <option key={m.idMateria} value={m.idMateria}>
                                                    {m.nombreMateria} {m.codigoMateria ? `(${m.codigoMateria})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="gd-field">
                                        <label>Clase</label>
                                        <select
                                            value={asignarForm.idClase}
                                            onChange={(e) => setAsignarForm({ ...asignarForm, idClase: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccione...</option>
                                            {clasesList
                                                .filter(c => !asignarForm.anioLectivo || Number(c.anioLectivo) === Number(asignarForm.anioLectivo))
                                                .map(c => (
                                                    <option key={c.idClase} value={c.idClase}>
                                                        {c.nombreClase} ({c.seccion})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="gd-field" style={{ marginTop: '12px' }}>
                                    <label>Permisos</label>
                                    <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '400', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={asignarForm.puedeCalificar}
                                                onChange={(e) => setAsignarForm({ ...asignarForm, puedeCalificar: e.target.checked })}
                                            />
                                            Puede calificar
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '400', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={asignarForm.puedeAmonestar}
                                                onChange={(e) => setAsignarForm({ ...asignarForm, puedeAmonestar: e.target.checked })}
                                            />
                                            Puede amonestar
                                        </label>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                                    <button type="submit" className="gd-btn gd-btn-teal" disabled={asignando}>
                                        {asignando ? 'Asignando...' : '+ Asignar Materia'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Lista de asignaciones */}
                        <h4 style={{ margin: '0 0 12px', color: '#334155', fontSize: '15px' }}>
                            Materias asignadas en {asignarForm.anioLectivo} ({asignacionesFiltradas.length})
                        </h4>
                        {asignacionesFiltradas.length === 0 ? (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                                Sin materias asignadas para este año
                            </p>
                        ) : (
                            asignacionesFiltradas.map(a => {
                                const nombreMateria = a.materia?.nombreMateria || a.nombreMateria || `#${a.idMateria}`;
                                const nombreClase = a.clase?.nombreClase || a.nombreClase || `#${a.idClase}`;
                                const seccion = a.clase?.seccion || a.seccion || '';
                                return (
                                    <div key={a.idDocenteMateria} className="gd-asignacion-card">
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1e3a5f', fontSize: '14px' }}>
                                                {nombreMateria}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                                {nombreClase} {seccion ? `(Sección ${seccion})` : ''}
                                            </div>
                                            <div className="gd-permisos">
                                                <span className={`gd-permiso-badge ${!a.puedeCalificar ? 'no' : ''}`}>
                                                    {a.puedeCalificar ? 'Califica' : 'No califica'}
                                                </span>
                                                <span className={`gd-permiso-badge ${!a.puedeAmonestar ? 'no' : ''}`}>
                                                    {a.puedeAmonestar ? 'Amonesta' : 'No amonesta'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className="gd-btn gd-btn-danger gd-btn-sm"
                                            onClick={() => handleQuitarAsignacion(a)}
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                );
                            })
                        )}

                        <div className="gd-modal-actions">
                            <button className="gd-btn gd-btn-secondary" onClick={handleCerrarAsignar}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionDocentesDireccion;