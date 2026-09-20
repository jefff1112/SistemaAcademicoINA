// Componente Gestión de Conducta (Dirección) - MEJORADO
// Registra, consulta y anula faltas de estudiantes,
// y permite cambiar manualmente la calificación oficial de conducta por periodo (con auditoría).
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Calificaciones oficiales disponibles (enum de la tabla conducta_periodos).
const CALIFICACIONES = ['Excelente', 'Muy Bueno', 'Bueno', 'Suficiente', 'Necesita Mejorar'];

const GestionConductaDireccion = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [filtros, setFiltros] = useState({
        anioLectivo: new Date().getFullYear(),
        idClase: '',
        idPeriodo: ''
    });
    const [estudiantesClase, setEstudiantesClase] = useState([]);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [conducta, setConducta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalCalif, setShowModalCalif] = useState(false);
    const [savingCalif, setSavingCalif] = useState(false);
    const [savingFalta, setSavingFalta] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [formData, setFormData] = useState({
        idEstudiante: '',
        tipo: 'Falta',
        gravedad: 'Leve',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    const [califForm, setCalifForm] = useState({
        calificacion: '',
        observacion: ''
    });

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [clasesRes, periodosRes] = await Promise.all([
                API.get('/clases'),
                API.get('/periodosacademicos')
            ]);
            const clasesData = clasesRes.data || [];
            const periodosData = periodosRes.data || [];
            setClases(clasesData);
            setPeriodos(periodosData);

            if (clasesData.length > 0 && periodosData.length > 0) {
                const claseInicial = clasesData[0];
                const periodoInicial = periodosData.find(p => p.anioLectivo === claseInicial.anioLectivo) || periodosData[0];
                setFiltros({
                    anioLectivo: claseInicial.anioLectivo || new Date().getFullYear(),
                    idClase: claseInicial.idClase,
                    idPeriodo: periodoInicial.idPeriodo
                });
                cargarConductaClase(claseInicial.idClase, periodoInicial.idPeriodo);
            }
        } catch (error) {
            mostrarMensaje('Error al cargar clases o periodos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // CARGAR CONDUCTA DE LA CLASE
    // ============================================================
    const cargarConductaClase = async (idClase, idPeriodo) => {
        try {
            const response = await API.get(`/conducta/clase/${idClase}/periodo/${idPeriodo}`);
            const data = response.data || [];
            setEstudiantesClase(data);
            setSelectedEstudiante(null);
            setConducta([]);
            setResumen(null);
        } catch (error) {
            mostrarMensaje('Error al cargar conducta de la clase', 'error');
        }
    };

    // ============================================================
    // CARGAR CONDUCTA DEL ESTUDIANTE
    // ============================================================
    const cargarConductaEstudiante = async (idEstudiante, idPeriodo) => {
        try {
            const response = await API.get(`/conducta/estudiante/${idEstudiante}/periodo/${idPeriodo}`);
            const data = response.data || {};
            setConducta(data.conducta || []);
            setResumen({
                totalPuntos: data.totalPuntos || 0,
                calificacion: data.calificacion || 'Sin calificar',
                registroPeriodo: data.registroPeriodo || null,
                totalFaltas: (data.conducta || []).length,
                faltasActivas: (data.conducta || []).filter(c => c.estado === 'Activa').length
            });
        } catch (error) {
            mostrarMensaje('Error al cargar conducta del estudiante', 'error');
        }
    };

    // ============================================================
    // HANDLERS DE FILTROS
    // ============================================================
    const handleChangeAnio = (e) => {
        const anio = parseInt(e.target.value);
        setFiltros({ ...filtros, anioLectivo: anio, idClase: '', idPeriodo: '' });
        setEstudiantesClase([]);
        setSelectedEstudiante(null);
        setConducta([]);
        setResumen(null);
    };

    const handleChangeClase = (e) => {
        const id = e.target.value;
        setFiltros({ ...filtros, idClase: id });
        setSelectedEstudiante(null);
        if (id && filtros.idPeriodo) {
            cargarConductaClase(id, filtros.idPeriodo);
        }
    };

    const handleChangePeriodo = (e) => {
        const id = e.target.value;
        setFiltros({ ...filtros, idPeriodo: id });
        setSelectedEstudiante(null);
        if (id && filtros.idClase) {
            cargarConductaClase(filtros.idClase, id);
        }
    };

    const handleSelectEstudiante = (e) => {
        const id = e.target.value;
        setSelectedEstudiante(id);
        if (id) {
            cargarConductaEstudiante(id, filtros.idPeriodo);
        } else {
            setConducta([]);
            setResumen(null);
        }
    };

    // ============================================================
    // REGISTRAR FALTA
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSavingFalta(true);
        try {
            await API.post('/conducta', {
                ...formData,
                idEstudiante: parseInt(formData.idEstudiante),
                idPeriodo: parseInt(filtros.idPeriodo)
            });
            mostrarMensaje('Falta registrada correctamente', 'success');
            setShowModal(false);
            setFormData({
                idEstudiante: '',
                tipo: 'Falta',
                gravedad: 'Leve',
                descripcion: '',
                fecha: new Date().toISOString().split('T')[0]
            });
            if (selectedEstudiante) {
                await cargarConductaClase(filtros.idClase, filtros.idPeriodo);
                setSelectedEstudiante(selectedEstudiante);
                cargarConductaEstudiante(selectedEstudiante, filtros.idPeriodo);
            }
        } catch (error) {
            mostrarMensaje('Error al registrar falta', 'error');
        } finally {
            setSavingFalta(false);
        }
    };

    // ============================================================
    // ANULAR FALTA
    // ============================================================
    const handleAnular = async (id) => {
        if (!window.confirm('¿Anular esta falta?')) return;
        try {
            await API.put(`/conducta/${id}/anular`);
            mostrarMensaje('Falta anulada correctamente', 'success');
            if (selectedEstudiante) {
                await cargarConductaClase(filtros.idClase, filtros.idPeriodo);
                setSelectedEstudiante(selectedEstudiante);
                cargarConductaEstudiante(selectedEstudiante, filtros.idPeriodo);
            }
        } catch (error) {
            mostrarMensaje('Error al anular', 'error');
        }
    };

    // ============================================================
    // CAMBIAR CALIFICACIÓN
    // ============================================================
    const abrirModalCalificacion = () => {
        if (!selectedEstudiante) {
            mostrarMensaje('Seleccione un estudiante primero', 'error');
            return;
        }
        const actual = resumen?.registroPeriodo?.calificacion || '';
        setCalifForm({ calificacion: actual || CALIFICACIONES[0], observacion: '' });
        setShowModalCalif(true);
    };

    const handleCambiarCalificacion = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setSavingCalif(true);
        try {
            const payload = {
                idPeriodo: parseInt(filtros.idPeriodo),
                calificacion: califForm.calificacion,
                observacion: califForm.observacion.trim(),
                registradoPor: user.idUsuario || null
            };
            await API.put(`/conducta/estudiante/${selectedEstudiante}/calificacion`, payload);
            mostrarMensaje('Calificación de conducta actualizada correctamente', 'success');
            setShowModalCalif(false);
            await cargarConductaClase(filtros.idClase, filtros.idPeriodo);
            setSelectedEstudiante(selectedEstudiante);
            cargarConductaEstudiante(selectedEstudiante, filtros.idPeriodo);
        } catch (error) {
            mostrarMensaje('Error al cambiar la calificación', 'error');
        } finally {
            setSavingCalif(false);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    const getGravedadColor = (gravedad) => {
        switch (gravedad) {
            case 'Leve': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Moderada': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Grave': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'Muy Grave': return { bg: '#fecaca', color: '#7f1d1d', border: '#991b1b' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    const getCalificacionColor = (calificacion) => {
        switch (calificacion) {
            case 'Excelente': return { bg: '#dcfce7', color: '#15803d' };
            case 'Muy Bueno': return { bg: '#dbeafe', color: '#1d4ed8' };
            case 'Bueno': return { bg: '#fef3c7', color: '#b45309' };
            case 'Suficiente': return { bg: '#fed7aa', color: '#c2410c' };
            case 'Necesita Mejorar': return { bg: '#fee2e2', color: '#b91c1c' };
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-SV', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // ============================================================
    // DERIVADOS
    // ============================================================
    const clasesFiltradas = useMemo(() => {
        return clases.filter(c => !filtros.anioLectivo || c.anioLectivo === filtros.anioLectivo);
    }, [clases, filtros.anioLectivo]);

    const periodosFiltrados = useMemo(() => {
        return periodos.filter(p => !filtros.anioLectivo || p.anioLectivo === filtros.anioLectivo);
    }, [periodos, filtros.anioLectivo]);

    const estudiantesFiltrados = useMemo(() => {
        const term = busqueda.trim().toLowerCase();
        if (!term) return estudiantesClase;
        return estudiantesClase.filter(e =>
            `${e.nombres} ${e.apellidos}`.toLowerCase().includes(term) ||
            (e.codigoEstudiante && e.codigoEstudiante.toLowerCase().includes(term)) ||
            (e.nie && e.nie.toLowerCase().includes(term))
        );
    }, [estudiantesClase, busqueda]);

    // ============================================================
    // RENDER
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Conducta - Dirección">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestión de Conducta - Dirección">
            <style>{`
                .gc-container { display: flex; flex-direction: column; gap: 20px; }
                .gc-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .gc-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }
                .gc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 16px; }
                .gc-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gc-field input, .gc-field select, .gc-field textarea { width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; font-family: inherit; transition: border-color .2s, box-shadow .2s; }
                .gc-field input:focus, .gc-field select:focus, .gc-field textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
                .gc-field textarea { min-height: 80px; resize: vertical; }

                .gc-btn { padding: 9px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .2s; display: inline-flex; align-items: center; gap: 6px; }
                .gc-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gc-btn-primary { background: #1e3a5f; color: #fff; }
                .gc-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gc-btn-danger { background: #dc2626; color: #fff; }
                .gc-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gc-btn-secondary { background: #e5e7eb; color: #334155; }
                .gc-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gc-btn-info { background: #3b82f6; color: #fff; }
                .gc-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gc-btn-sm { padding: 5px 12px; font-size: 12px; }

                .gc-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 16px; }
                .gc-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .gc-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gc-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gc-stat-puntos { background: #fee2e2; }
                .gc-stat-calif { background: #dbeafe; }
                .gc-stat-total { background: #f1f5f9; }
                .gc-stat-activas { background: #fef3c7; }

                .gc-table { width: 100%; border-collapse: collapse; }
                .gc-table thead th { background: #1e3a5f; color: #fff; padding: 11px 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
                .gc-table thead th:first-child { border-top-left-radius: 8px; }
                .gc-table thead th:last-child { border-top-right-radius: 8px; }
                .gc-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .gc-table tbody tr:hover { background: #f8fafc; }
                .gc-table tbody tr:nth-child(even) { background: #fafbfc; }
                .gc-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .gc-table td { padding: 10px; font-size: 13px; color: #334155; vertical-align: middle; }

                .gc-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .gc-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gc-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gc-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gc-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                .gc-modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(15,23,42,.55); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
                .gc-modal { background: #fff; border-radius: 12px; max-width: 520px; width: 100%; padding: 24px; max-height: 90vh; overflow-y: auto; }
                .gc-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gc-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gc-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gc-modal-close:hover { color: #dc2626; }
                .gc-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gc-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }

                .gc-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
                .gc-busqueda { padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; min-width: 250px; }
                .gc-busqueda:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }

                @media (max-width: 768px) {
                    .gc-grid { grid-template-columns: 1fr; }
                    .gc-table { font-size: 12px; }
                    .gc-table thead th, .gc-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gc-container">
                {message && <div className={`gc-aviso ${messageType}`}>{message}</div>}

                {/* FILTROS */}
                <div className="gc-card">
                    <h3>Filtros de Consulta</h3>
                    <div className="gc-grid">
                        <div className="gc-field">
                            <label>Año Lectivo</label>
                            <select value={filtros.anioLectivo} onChange={handleChangeAnio}>
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="gc-field">
                            <label>Clase *</label>
                            <select value={filtros.idClase} onChange={handleChangeClase}>
                                <option value="">Seleccionar Clase</option>
                                {clasesFiltradas.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} (Sección {c.seccion})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="gc-field">
                            <label>Periodo *</label>
                            <select value={filtros.idPeriodo} onChange={handleChangePeriodo}>
                                <option value="">Seleccionar Periodo</option>
                                {periodosFiltrados.map(p => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombre} - {p.anioLectivo}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="gc-toolbar">
                        <input
                            type="text"
                            className="gc-busqueda"
                            placeholder="Buscar estudiante por nombre, código o NIE..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            disabled={estudiantesClase.length === 0}
                        />
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            {estudiantesClase.length > 0 && (
                                <>Mostrando <strong>{estudiantesFiltrados.length}</strong> de {estudiantesClase.length} estudiantes</>
                            )}
                        </div>
                    </div>

                    <div className="gc-field">
                        <label>Estudiante *</label>
                        <select
                            value={selectedEstudiante || ''}
                            onChange={handleSelectEstudiante}
                            disabled={estudiantesFiltrados.length === 0}
                        >
                            <option value="">Seleccionar Estudiante</option>
                            {estudiantesFiltrados.map(e => (
                                <option key={e.idEstudiante} value={e.idEstudiante}>
                                    {e.apellidos}, {e.nombres} ({e.codigoEstudiante})
                                </option>
                            ))}
                        </select>
                    </div>

                    {estudiantesClase.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                            <button
                                className="gc-btn gc-btn-primary"
                                onClick={() => {
                                    if (selectedEstudiante) {
                                        setFormData({ ...formData, idEstudiante: selectedEstudiante });
                                        setShowModal(true);
                                    } else {
                                        mostrarMensaje('Seleccione un estudiante primero', 'error');
                                    }
                                }}
                            >
                                + Registrar Falta
                            </button>
                            {selectedEstudiante && (
                                <button className="gc-btn gc-btn-info" onClick={abrirModalCalificacion}>
                                    Cambiar Calificación Oficial
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* RESUMEN DEL ESTUDIANTE */}
                {resumen && (
                    <div className="gc-card">
                        <h3>Resumen de Conducta</h3>
                        <div className="gc-stats">
                            <div className="gc-stat gc-stat-puntos">
                                <span className="num" style={{ color: '#b91c1c' }}>{resumen.totalPuntos}</span>
                                <span className="lbl">Puntos de Demérito</span>
                            </div>
                            <div className="gc-stat gc-stat-calif">
                                <span className="num" style={{
                                    color: resumen.registroPeriodo
                                        ? getCalificacionColor(resumen.registroPeriodo.calificacion).color
                                        : '#6b7280',
                                    fontSize: '18px'
                                }}>
                                    {resumen.registroPeriodo?.calificacion || 'Sin asignar'}
                                </span>
                                <span className="lbl">Calificación Oficial</span>
                            </div>
                            <div className="gc-stat gc-stat-total">
                                <span className="num" style={{ color: '#334155' }}>{resumen.totalFaltas}</span>
                                <span className="lbl">Total Faltas</span>
                            </div>
                            <div className="gc-stat gc-stat-activas">
                                <span className="num" style={{ color: '#b45309' }}>{resumen.faltasActivas}</span>
                                <span className="lbl">Faltas Activas</span>
                            </div>
                        </div>

                        {resumen.registroPeriodo && (
                            <div className="gc-info-box">
                                <strong>Calificación registrada el:</strong> {formatearFecha(resumen.registroPeriodo.fechaCambio)}<br />
                                <strong>Observación:</strong> {resumen.registroPeriodo.observacion || '-'}
                            </div>
                        )}
                    </div>
                )}

                {/* HISTORIAL DE FALTAS */}
                {conducta.length > 0 && (
                    <div className="gc-card">
                        <h3>Historial de Faltas ({conducta.length})</h3>
                        <div className="table-responsive">
                            <table className="gc-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '110px' }}>Fecha</th>
                                        <th style={{ width: '120px' }}>Tipo</th>
                                        <th style={{ width: '120px' }}>Gravedad</th>
                                        <th>Descripción</th>
                                        <th style={{ width: '80px', textAlign: 'center' }}>Puntos</th>
                                        <th style={{ width: '110px' }}>Estado</th>
                                        <th style={{ width: '100px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conducta.map((c) => {
                                        const colores = getGravedadColor(c.gravedad);
                                        return (
                                            <tr key={c.idFaltas}>
                                                <td style={{ fontSize: '12px' }}>{new Date(c.fecha).toLocaleDateString()}</td>
                                                <td>{c.tipo}</td>
                                                <td>
                                                    <span
                                                        className="gc-badge"
                                                        style={{
                                                            backgroundColor: colores.bg,
                                                            color: colores.color,
                                                            border: `1px solid ${colores.border}`
                                                        }}
                                                    >
                                                        {c.gravedad}
                                                    </span>
                                                </td>
                                                <td>{c.descripcion || '-'}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#b91c1c' }}>
                                                    {c.puntosDemerito}
                                                </td>
                                                <td>
                                                    <span
                                                        className="gc-badge"
                                                        style={{
                                                            backgroundColor: c.estado === 'Activa' ? '#dcfce7' : '#fee2e2',
                                                            color: c.estado === 'Activa' ? '#15803d' : '#b91c1c'
                                                        }}
                                                    >
                                                        {c.estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    {c.estado === 'Activa' && (
                                                        <button
                                                            className="gc-btn gc-btn-danger gc-btn-sm"
                                                            onClick={() => handleAnular(c.idFaltas)}
                                                        >
                                                            Anular
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MENSAJE CUANDO NO HAY ESTUDIANTE SELECCIONADO */}
                {!selectedEstudiante && estudiantesClase.length > 0 && (
                    <div className="gc-card">
                        <p className="gc-empty">
                            Seleccione un estudiante para ver su historial de conducta y registrar faltas
                        </p>
                    </div>
                )}

                {!filtros.idClase && !loading && (
                    <div className="gc-card">
                        <p className="gc-empty">
                            Seleccione un año, una clase y un periodo para comenzar
                        </p>
                    </div>
                )}
            </div>

            {/* MODAL REGISTRAR FALTA */}
            {showModal && (
                <div className="gc-modal-overlay" onClick={() => !savingFalta && setShowModal(false)}>
                    <div className="gc-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="gc-modal-header">
                            <h3>Registrar Falta</h3>
                            <button className="gc-modal-close" onClick={() => setShowModal(false)} disabled={savingFalta}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="gc-field" style={{ marginBottom: '14px' }}>
                                <label>Tipo *</label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    required
                                >
                                    <option value="Falta">Falta</option>
                                    <option value="Amonestacion">Amonestación</option>
                                    <option value="Demerito">Demérito</option>
                                </select>
                            </div>
                            <div className="gc-field" style={{ marginBottom: '14px' }}>
                                <label>Gravedad *</label>
                                <select
                                    value={formData.gravedad}
                                    onChange={(e) => setFormData({ ...formData, gravedad: e.target.value })}
                                    required
                                >
                                    <option value="Leve">Leve</option>
                                    <option value="Moderada">Moderada</option>
                                    <option value="Grave">Grave</option>
                                </select>
                            </div>
                            <div className="gc-field" style={{ marginBottom: '14px' }}>
                                <label>Descripción *</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    required
                                    rows="3"
                                    placeholder="Describa el motivo de la falta"
                                />
                            </div>
                            <div className="gc-field" style={{ marginBottom: '14px' }}>
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                />
                            </div>
                            <div className="gc-modal-actions">
                                <button type="button" className="gc-btn gc-btn-secondary" onClick={() => setShowModal(false)} disabled={savingFalta}>
                                    Cancelar
                                </button>
                                <button type="submit" className="gc-btn gc-btn-primary" disabled={savingFalta}>
                                    {savingFalta ? 'Registrando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CAMBIAR CALIFICACIÓN */}
            {showModalCalif && (
                <div className="gc-modal-overlay" onClick={() => !savingCalif && setShowModalCalif(false)}>
                    <div className="gc-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="gc-modal-header">
                            <h3>Cambiar Calificación de Conducta</h3>
                            <button className="gc-modal-close" onClick={() => setShowModalCalif(false)} disabled={savingCalif}>X</button>
                        </div>
                        <form onSubmit={handleCambiarCalificacion}>
                            {resumen?.registroPeriodo && (
                                <div className="gc-info-box">
                                    <strong>Calificación actual:</strong> {resumen.registroPeriodo.calificacion}
                                    <br />
                                    <strong>Cambiada el:</strong> {formatearFecha(resumen.registroPeriodo.fechaCambio)}
                                </div>
                            )}
                            <div className="gc-field" style={{ marginBottom: '14px' }}>
                                <label>Nueva Calificación *</label>
                                <select
                                    value={califForm.calificacion}
                                    onChange={(e) => setCalifForm({ ...califForm, calificacion: e.target.value })}
                                    required
                                >
                                    {CALIFICACIONES.map(op => (
                                        <option key={op} value={op}>{op}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="gc-field" style={{ marginBottom: '14px' }}>
                                <label>Observación (motivo del cambio) *</label>
                                <textarea
                                    value={califForm.observacion}
                                    onChange={(e) => setCalifForm({ ...califForm, observacion: e.target.value })}
                                    required
                                    rows="3"
                                    placeholder="Explique el motivo por el cual se cambia la calificación"
                                />
                            </div>
                            <div className="gc-modal-actions">
                                <button type="button" className="gc-btn gc-btn-secondary" onClick={() => setShowModalCalif(false)} disabled={savingCalif}>
                                    Cancelar
                                </button>
                                <button type="submit" className="gc-btn gc-btn-primary" disabled={savingCalif}>
                                    {savingCalif ? 'Guardando...' : 'Guardar Cambio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionConductaDireccion;