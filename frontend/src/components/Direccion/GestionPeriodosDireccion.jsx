// Componente Gestión de Periodos (Admin): administra los periodos académicos.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionPeriodosAdmin = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [periodos, setPeriodos] = useState([]);
    const [periodoActivo, setPeriodoActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingPeriodo, setEditingPeriodo] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    // Filtros
    const [filterAnio, setFilterAnio] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState('');

    // Formulario
    const [formData, setFormData] = useState({
        anioLectivo: new Date().getFullYear(),
        numeroPeriodo: 1,
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        estado: 'Cerrado'
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
            const periodosRes = await API.get('/periodosacademicos');
            setPeriodos(periodosRes.data || []);

            let activo = null;
            try {
                const activoRes = await API.get('/periodosacademicos/activo');
                activo = activoRes.data || null;
            } catch (activoError) {
                if (activoError.response?.status !== 404) {
                    throw activoError;
                }
            }
            setPeriodoActivo(activo);
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
    const handleOpenModal = (periodo = null) => {
        if (periodo) {
            setEditingPeriodo(periodo);
            setFormData({
                anioLectivo: periodo.anioLectivo || new Date().getFullYear(),
                numeroPeriodo: periodo.numeroPeriodo || 1,
                nombre: periodo.nombre || '',
                fechaInicio: periodo.fechaInicio ? new Date(periodo.fechaInicio).toISOString().split('T')[0] : '',
                fechaFin: periodo.fechaFin ? new Date(periodo.fechaFin).toISOString().split('T')[0] : '',
                estado: periodo.estado || 'Cerrado'
            });
        } else {
            setEditingPeriodo(null);
            setFormData({
                anioLectivo: new Date().getFullYear(),
                numeroPeriodo: 1,
                nombre: '',
                fechaInicio: '',
                fechaFin: '',
                estado: 'Cerrado'
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

        if (!formData.nombre.trim()) {
            mostrarMensaje('El nombre del periodo es requerido', 'error');
            return;
        }
        if (!formData.fechaInicio || !formData.fechaFin) {
            mostrarMensaje('Las fechas son requeridas', 'error');
            return;
        }
        if (new Date(formData.fechaInicio) >= new Date(formData.fechaFin)) {
            mostrarMensaje('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
            return;
        }

        setSaving(true);
        try {
            const dataToSend = {
                anioLectivo: parseInt(formData.anioLectivo),
                numeroPeriodo: parseInt(formData.numeroPeriodo),
                nombre: formData.nombre.trim(),
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin,
                estado: formData.estado
            };

            if (editingPeriodo) {
                await API.put(`/periodosacademicos/${editingPeriodo.idPeriodo}`, dataToSend);
                mostrarMensaje('Periodo actualizado correctamente', 'success');
            } else {
                await API.post('/periodosacademicos', dataToSend);
                mostrarMensaje('Periodo creado correctamente', 'success');
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
        if (!window.confirm(`¿Eliminar el periodo "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
        try {
            await API.delete(`/periodosacademicos/${id}`);
            mostrarMensaje('Periodo eliminado correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar periodo', 'error');
        }
    };

    // ============================================================
    // ACTIVAR / DESACTIVAR
    // ============================================================
    const handleToggleEstado = async (periodo) => {
        const nuevoEstado = periodo.estado === 'Activo' ? 'Cerrado' : 'Activo';

        if (nuevoEstado === 'Activo') {
            try {
                const response = await API.get('/periodosacademicos');
                const existeOtroActivo = response.data.some(p =>
                    p.estado === 'Activo' &&
                    p.anioLectivo === periodo.anioLectivo &&
                    p.idPeriodo !== periodo.idPeriodo
                );

                if (existeOtroActivo) {
                    mostrarMensaje('Ya hay un periodo activo para este año lectivo. Desactívelo primero.', 'error');
                    return;
                }
            } catch (error) {
                mostrarMensaje('Error al verificar periodos activos', 'error');
                return;
            }
        }

        setSaving(true);
        try {
            await API.put(`/periodosacademicos/${periodo.idPeriodo}`, { ...periodo, estado: nuevoEstado });
            mostrarMensaje(`Periodo ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente`, 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al cambiar estado', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getEstadoBadge = (estado) => {
        if (estado === 'Activo') return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
        if (estado === 'Cerrado') return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
        return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-SV', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const diasRestantes = useMemo(() => {
        if (!periodoActivo?.fechaFin) return null;
        const hoy = new Date();
        const fin = new Date(periodoActivo.fechaFin);
        const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
        return diff;
    }, [periodoActivo]);

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const aniosUnicos = useMemo(() => {
        const set = new Set();
        periodos.forEach(p => {
            if (p.anioLectivo) set.add(p.anioLectivo);
        });
        return Array.from(set).sort((a, b) => b - a);
    }, [periodos]);

    const periodosFiltrados = useMemo(() => {
        return periodos.filter(p => {
            if (filterAnio && String(p.anioLectivo) !== String(filterAnio)) return false;
            if (filterEstado === 'activos' && p.estado !== 'Activo') return false;
            if (filterEstado === 'cerrados' && p.estado !== 'Cerrado') return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (p.nombre && p.nombre.toLowerCase().includes(term)) ||
                    (String(p.numeroPeriodo) && String(p.numeroPeriodo).includes(term))
                );
            }
            return true;
        }).sort((a, b) => {
            if (a.anioLectivo !== b.anioLectivo) return b.anioLectivo - a.anioLectivo;
            return a.numeroPeriodo - b.numeroPeriodo;
        });
    }, [periodos, filterAnio, filterEstado, busqueda]);

    const stats = useMemo(() => ({
        total: periodos.length,
        activos: periodos.filter(p => p.estado === 'Activo').length,
        cerrados: periodos.filter(p => p.estado === 'Cerrado').length
    }), [periodos]);

    const filtrosActivos = (filterAnio ? 1 : 0) + (filterEstado !== 'todos' ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterAnio('');
        setFilterEstado('todos');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Periodos">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Periodos Académicos">
            <style>{`
                /* Reset forzado para toda la tabla - sin fondo azul */
                .gpa-wrapper table,
                .gpa-wrapper thead,
                .gpa-wrapper thead tr,
                .gpa-wrapper thead th,
                .gpa-wrapper tbody,
                .gpa-wrapper tbody tr,
                .gpa-wrapper tbody td {
                    background-color: #ffffff !important;
                    background-image: none !important;
                    color: #1e293b !important;
                }

                /* Contenedor general */
                .gpa-wrapper { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }

                .gpa-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03);
                    border: 1px solid #e2e8f0;
                }
                .gpa-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Tarjeta de periodo activo - blanco con borde verde (sin gradiente) */
                .gpa-activo-card {
                    background: #ffffff;
                    border: 2px solid #16a34a;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(22,163,74,.15);
                }
                .gpa-activo-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                }
                .gpa-activo-indicador {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #16a34a;
                    box-shadow: 0 0 0 4px rgba(22,163,74,.2);
                }
                .gpa-activo-header h3 {
                    margin: 0;
                    color: #15803d;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    font-weight: 700;
                }
                .gpa-activo-nombre {
                    font-size: 22px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 8px;
                }
                .gpa-activo-badge {
                    display: inline-block;
                    background: #dcfce7;
                    color: #15803d;
                    border: 1px solid #16a34a;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .gpa-activo-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 16px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #e2e8f0;
                }
                .gpa-activo-info-item { display: flex; flex-direction: column; }
                .gpa-activo-info-item .lbl {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    color: #64748b;
                    margin-bottom: 4px;
                    font-weight: 600;
                }
                .gpa-activo-info-item .val {
                    font-size: 15px;
                    font-weight: 600;
                    color: #0f172a;
                }

                /* Estadísticas */
                .gpa-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
                .gpa-stat {
                    padding: 16px;
                    border-radius: 10px;
                    text-align: center;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                }
                .gpa-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gpa-stat .lbl {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    color: #64748b;
                    margin-top: 4px;
                }
                .gpa-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .gpa-stat-activos { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
                .gpa-stat-cerrados { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }

                /* Filtros */
                .gpa-filtros { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 14px; }
                .gpa-field label {
                    display: block;
                    font-weight: 600;
                    color: #34495e;
                    font-size: 13px;
                    margin-bottom: 6px;
                }
                .gpa-field input, .gpa-field select {
                    width: 100%;
                    padding: 9px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 14px;
                    box-sizing: border-box;
                    font-family: inherit;
                    transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                    color: #1e293b;
                }
                .gpa-field input:focus, .gpa-field select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .gpa-btn {
                    padding: 9px 16px;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all .2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-family: inherit;
                }
                .gpa-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gpa-btn-primary { background: #1e3a5f; color: #fff; }
                .gpa-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gpa-btn-info { background: #3b82f6; color: #fff; }
                .gpa-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gpa-btn-warning { background: #e67e22; color: #fff; }
                .gpa-btn-warning:hover:not(:disabled) { background: #d35400; }
                .gpa-btn-danger { background: #dc2626; color: #fff; }
                .gpa-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gpa-btn-secondary { background: #e5e7eb; color: #334155; }
                .gpa-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gpa-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - forzado fondo blanco */
                .gpa-tabla {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                    background-color: #ffffff !important;
                }
                .gpa-tabla thead th {
                    background-color: #f8fafc !important;
                    background-image: none !important;
                    color: #1e293b !important;
                    padding: 12px 10px;
                    text-align: left;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    font-weight: 700;
                    border-bottom: 2px solid #cbd5e1;
                }
                .gpa-tabla tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    background-color: #ffffff !important;
                    background-image: none !important;
                }
                .gpa-tabla tbody tr:hover {
                    background-color: #f1f5f9 !important;
                }
                .gpa-tabla td {
                    padding: 12px 10px;
                    color: #1e293b !important;
                    vertical-align: middle;
                    background-color: #ffffff !important;
                    background-image: none !important;
                }
                .gpa-tabla tbody tr:hover td {
                    background-color: #f1f5f9 !important;
                }
                .gpa-tabla td.col-anio { font-weight: 700; color: #0f172a !important; }
                .gpa-tabla td.col-numero { text-align: center; font-weight: 600; color: #1e40af !important; }
                .gpa-tabla td.col-nombre { font-weight: 600; color: #0f172a !important; }
                .gpa-tabla td.col-fecha {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                }

                .gpa-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .gpa-aviso {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    font-weight: 500;
                }
                .gpa-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gpa-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gpa-empty {
                    text-align: center;
                    padding: 40px;
                    color: #64748b;
                    font-size: 14px;
                    background: #ffffff;
                }

                .gpa-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .gpa-badge-filtros {
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
                .gpa-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15,23,42,.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .gpa-modal {
                    background: #ffffff;
                    border-radius: 12px;
                    max-width: 560px;
                    width: 100%;
                    padding: 24px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04);
                }
                .gpa-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .gpa-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gpa-modal-close {
                    background: none;
                    border: none;
                    font-size: 22px;
                    cursor: pointer;
                    color: #64748b;
                    line-height: 1;
                }
                .gpa-modal-close:hover { color: #dc2626; }
                .gpa-modal-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                .gpa-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .gpa-form-grid-full { grid-column: 1 / -1; }

                .gpa-info-box {
                    background: #eff6ff;
                    border-left: 4px solid #3b82f6;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 13px;
                    color: #1e40af;
                }

                .gpa-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 900px) {
                    .gpa-filtros { grid-template-columns: 1fr 1fr; }
                    .gpa-form-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .gpa-filtros { grid-template-columns: 1fr; }
                    .gpa-tabla { font-size: 12px; }
                    .gpa-tabla thead th, .gpa-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gpa-wrapper">
                {mensaje && <div className={`gpa-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* PERIODO ACTIVO */}
                {periodoActivo && (
                    <div className="gpa-activo-card">
                        <div className="gpa-activo-header">
                            <span className="gpa-activo-indicador"></span>
                            <h3>Periodo Activo Actual</h3>
                        </div>
                        <div className="gpa-activo-nombre">{periodoActivo.nombre}</div>
                        <div className="gpa-activo-badge">
                            Año Lectivo {periodoActivo.anioLectivo} - Periodo {periodoActivo.numeroPeriodo}
                        </div>
                        <div className="gpa-activo-info">
                            <div className="gpa-activo-info-item">
                                <span className="lbl">Fecha de Inicio</span>
                                <span className="val">{formatearFecha(periodoActivo.fechaInicio)}</span>
                            </div>
                            <div className="gpa-activo-info-item">
                                <span className="lbl">Fecha de Fin</span>
                                <span className="val">{formatearFecha(periodoActivo.fechaFin)}</span>
                            </div>
                            <div className="gpa-activo-info-item">
                                <span className="lbl">Días Restantes</span>
                                <span className="val">
                                    {diasRestantes !== null
                                        ? (diasRestantes > 0 ? `${diasRestantes} días` : 'Vencido')
                                        : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ESTADÍSTICAS */}
                <div className="gpa-stats">
                    <div className="gpa-stat gpa-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Periodos</span>
                    </div>
                    <div className="gpa-stat gpa-stat-activos">
                        <span className="num">{stats.activos}</span>
                        <span className="lbl">Activos</span>
                    </div>
                    <div className="gpa-stat gpa-stat-cerrados">
                        <span className="num">{stats.cerrados}</span>
                        <span className="lbl">Cerrados</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="gpa-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="gpa-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="gpa-filtros">
                        <div className="gpa-field">
                            <label>Año Lectivo</label>
                            <select value={filterAnio} onChange={(e) => setFilterAnio(e.target.value)}>
                                <option value="">Todos los años</option>
                                {aniosUnicos.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <div className="gpa-field">
                            <label>Estado</label>
                            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="activos">Solo activos</option>
                                <option value="cerrados">Solo cerrados</option>
                            </select>
                        </div>
                        <div className="gpa-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o número de periodo..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="gpa-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="gpa-btn gpa-btn-primary" onClick={() => handleOpenModal()}>
                                Nuevo Periodo
                            </button>
                            {filtrosActivos > 0 && (
                                <button className="gpa-btn gpa-btn-secondary" onClick={limpiarFiltros}>
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{periodosFiltrados.length}</strong> de {periodos.length} periodos
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gpa-card">
                    <h3>Lista de Periodos Académicos</h3>

                    {periodosFiltrados.length === 0 ? (
                        <div className="gpa-empty">
                            No hay periodos que coincidan. Prueba ajustando los filtros o crea uno nuevo.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="gpa-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>Año</th>
                                        <th style={{ width: '70px', textAlign: 'center' }}>N°</th>
                                        <th>Nombre</th>
                                        <th style={{ width: '120px' }}>Fecha Inicio</th>
                                        <th style={{ width: '120px' }}>Fecha Fin</th>
                                        <th style={{ width: '110px' }}>Estado</th>
                                        <th style={{ width: '240px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {periodosFiltrados.map((p) => {
                                        const badge = getEstadoBadge(p.estado);
                                        return (
                                            <tr key={p.idPeriodo}>
                                                <td className="col-anio">{p.anioLectivo}</td>
                                                <td className="col-numero">{p.numeroPeriodo}</td>
                                                <td className="col-nombre">{p.nombre}</td>
                                                <td className="col-fecha">{formatearFecha(p.fechaInicio)}</td>
                                                <td className="col-fecha">{formatearFecha(p.fechaFin)}</td>
                                                <td>
                                                    <span
                                                        className="gpa-badge"
                                                        style={{
                                                            backgroundColor: badge.bg,
                                                            color: badge.color,
                                                            border: `1px solid ${badge.border}`
                                                        }}
                                                    >
                                                        {p.estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="gpa-acciones">
                                                        <button
                                                            className="gpa-btn gpa-btn-info gpa-btn-sm"
                                                            onClick={() => handleOpenModal(p)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className={`gpa-btn ${p.estado === 'Activo' ? 'gpa-btn-warning' : 'gpa-btn-primary'} gpa-btn-sm`}
                                                            onClick={() => handleToggleEstado(p)}
                                                            disabled={saving}
                                                        >
                                                            {p.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                        <button
                                                            className="gpa-btn gpa-btn-danger gpa-btn-sm"
                                                            onClick={() => handleDelete(p.idPeriodo, p.nombre)}
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
                <div className="gpa-modal-overlay" onClick={handleCerrarModal}>
                    <div className="gpa-modal" onClick={e => e.stopPropagation()}>
                        <div className="gpa-modal-header">
                            <h3>{editingPeriodo ? 'Editar Periodo' : 'Nuevo Periodo'}</h3>
                            <button className="gpa-modal-close" onClick={handleCerrarModal} disabled={saving}>X</button>
                        </div>

                        <div className="gpa-info-box">
                            Solo puede haber <strong>un periodo activo por año lectivo</strong>.
                            El periodo activo es el que se usa por defecto para registrar notas y asistencias.
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="gpa-form-grid">
                                <div className="gpa-field">
                                    <label>Año Lectivo *</label>
                                    <input
                                        type="number"
                                        value={formData.anioLectivo}
                                        onChange={(e) => setFormData({ ...formData, anioLectivo: parseInt(e.target.value) || new Date().getFullYear() })}
                                        required
                                        min="2020"
                                        max="2100"
                                    />
                                </div>
                                <div className="gpa-field">
                                    <label>Número de Periodo *</label>
                                    <input
                                        type="number"
                                        value={formData.numeroPeriodo}
                                        onChange={(e) => setFormData({ ...formData, numeroPeriodo: parseInt(e.target.value) || 1 })}
                                        required
                                        min="1"
                                        max="4"
                                    />
                                </div>

                                <div className="gpa-field gpa-form-grid-full">
                                    <label>Nombre del Periodo *</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        required
                                        placeholder="Ej: I Periodo, II Periodo..."
                                    />
                                </div>

                                <div className="gpa-field">
                                    <label>Fecha de Inicio *</label>
                                    <input
                                        type="date"
                                        value={formData.fechaInicio}
                                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="gpa-field">
                                    <label>Fecha de Fin *</label>
                                    <input
                                        type="date"
                                        value={formData.fechaFin}
                                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="gpa-field gpa-form-grid-full">
                                    <label>Estado</label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    >
                                        <option value="Cerrado">Cerrado</option>
                                        <option value="Activo">Activo</option>
                                    </select>
                                    <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        Solo puede haber un periodo activo por año lectivo
                                    </small>
                                </div>
                            </div>

                            <div className="gpa-modal-actions">
                                <button
                                    type="button"
                                    className="gpa-btn gpa-btn-secondary"
                                    onClick={handleCerrarModal}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="gpa-btn gpa-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : (editingPeriodo ? 'Actualizar' : 'Crear Periodo')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionPeriodosAdmin;