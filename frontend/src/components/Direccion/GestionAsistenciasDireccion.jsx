// Componente Gestión de Asistencias (Dirección) - MEJORADO
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { formatoHoraExacta } from '../../utils/formatUtils';

const GestionAsistenciasDireccion = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [clases, setClases] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [filtros, setFiltros] = useState({
        anioLectivo: new Date().getFullYear(),
        idClase: '',
        fecha: new Date().toISOString().split('T')[0]
    });
    const [resumen, setResumen] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarClases();
    }, []);

    useEffect(() => {
        if (filtros.idClase && filtros.fecha) {
            cargarAsistencias();
        } else {
            setAsistencias([]);
            setResumen(null);
        }
    }, [filtros.idClase, filtros.fecha]);

    const cargarClases = async () => {
        try {
            const response = await API.get('/clases');
            setClases(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar clases', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // CARGAR ASISTENCIAS
    // ============================================================
    const cargarAsistencias = async () => {
        try {
            setLoading(true);
            const [asistenciaRes, estudiantesRes] = await Promise.all([
                API.get(`/asistencias/clase/${filtros.idClase}/${filtros.fecha}`),
                API.get(`/estudiantes/clase/${filtros.idClase}`)
            ]);

            const dataAsist = asistenciaRes.data || [];
            const estudiantes = estudiantesRes.data || [];

            const asistenciasCombinadas = estudiantes.map(e => {
                const asistencia = dataAsist.find(a => a.idEstudiante === e.idEstudiante);
                return {
                    idAsistencia: asistencia?.idAsistencia || null,
                    idEstudiante: e.idEstudiante,
                    nombreEstudiante: `${e.apellidos}, ${e.nombres}`,
                    codigoEstudiante: e.codigoEstudiante,
                    nie: e.nie,
                    estado: asistencia?.estado || 'Pendiente',
                    horaRegistro: asistencia?.horaRegistro || null,
                    minutosTarde: asistencia?.minutosTarde || 0,
                    observaciones: asistencia?.observaciones || ''
                };
            });

            setAsistencias(asistenciasCombinadas);

            const total = asistenciasCombinadas.length;
            const presentes = asistenciasCombinadas.filter(a => a.estado === 'Presente').length;
            const ausencias = asistenciasCombinadas.filter(a => a.estado === 'Ausente').length;
            const tardanzas = asistenciasCombinadas.filter(a => a.estado === 'Tarde').length;
            const justificadas = asistenciasCombinadas.filter(a => a.estado === 'Justificado').length;
            const pendientes = asistenciasCombinadas.filter(a => a.estado === 'Pendiente').length;
            const porcentajeAsistencia = total > 0
                ? ((presentes + tardanzas + justificadas) / total * 100).toFixed(1)
                : 0;

            setResumen({ total, presentes, ausencias, tardanzas, justificadas, pendientes, porcentajeAsistencia });
        } catch (error) {
            mostrarMensaje('Error al cargar asistencias', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FILTRO POR BÚSQUEDA
    // ============================================================
    const asistenciasFiltradas = useMemo(() => {
        const term = busqueda.trim().toLowerCase();
        if (!term) return asistencias;
        return asistencias.filter(a =>
            a.nombreEstudiante.toLowerCase().includes(term) ||
            (a.codigoEstudiante && a.codigoEstudiante.toLowerCase().includes(term)) ||
            (a.nie && a.nie.toLowerCase().includes(term))
        );
    }, [asistencias, busqueda]);

    // ============================================================
    // ACTUALIZAR OBSERVACIONES
    // ============================================================
    const actualizarObservaciones = (idEstudiante, valor) => {
        setAsistencias(prev => prev.map(a =>
            a.idEstudiante === idEstudiante ? { ...a, observaciones: valor } : a
        ));
    };

    // ============================================================
    // REGISTRAR ASISTENCIA INDIVIDUAL
    // ============================================================
    const registrarAsistencia = async (idEstudiante, estado, observaciones = '') => {
        try {
            setProcesando(true);
            const existing = asistencias.find(a => a.idEstudiante === idEstudiante);

            const data = {
                idEstudiante,
                idClase: parseInt(filtros.idClase),
                idMateria: 1,
                idDocente: 1,
                fecha: new Date(filtros.fecha),
                estado,
                horaRegistro: new Date().toTimeString().split(' ')[0],
                observaciones
            };

            if (existing && existing.idAsistencia) {
                await API.put(`/asistencias/${existing.idAsistencia}`, data);
            } else {
                await API.post('/asistencias', data);
            }

            setAsistencias(prev => prev.map(a =>
                a.idEstudiante === idEstudiante
                    ? { ...a, estado, horaRegistro: data.horaRegistro, observaciones }
                    : a
            ));

            actualizarResumenLocal();
            mostrarMensaje('Asistencia registrada', 'success');
        } catch (error) {
            mostrarMensaje('Error al registrar asistencia', 'error');
        } finally {
            setProcesando(false);
        }
    };

    // ============================================================
    // MARCAR TODOS
    // ============================================================
    const marcarTodos = async (estado) => {
        if (!window.confirm(`¿Marcar TODOS los estudiantes pendientes como "${estado}"?`)) return;

        try {
            setProcesando(true);
            const pendientes = asistencias.filter(a => a.estado === 'Pendiente');
            if (pendientes.length === 0) {
                mostrarMensaje('Todos los estudiantes ya tienen asistencia registrada', 'error');
                return;
            }

            await Promise.all(pendientes.map(a => {
                const data = {
                    idEstudiante: a.idEstudiante,
                    idClase: parseInt(filtros.idClase),
                    idMateria: 1,
                    idDocente: 1,
                    fecha: new Date(filtros.fecha),
                    estado,
                    horaRegistro: new Date().toTimeString().split(' ')[0],
                    observaciones: a.observaciones || ''
                };
                return API.post('/asistencias', data);
            }));

            mostrarMensaje(`${pendientes.length} asistencias registradas`, 'success');
            await cargarAsistencias();
        } catch (error) {
            mostrarMensaje('Error al marcar asistencias', 'error');
        } finally {
            setProcesando(false);
        }
    };

    const actualizarResumenLocal = () => {
        setAsistencias(prev => {
            const total = prev.length;
            const presentes = prev.filter(a => a.estado === 'Presente').length;
            const ausencias = prev.filter(a => a.estado === 'Ausente').length;
            const tardanzas = prev.filter(a => a.estado === 'Tarde').length;
            const justificadas = prev.filter(a => a.estado === 'Justificado').length;
            const pendientes = prev.filter(a => a.estado === 'Pendiente').length;
            const porcentajeAsistencia = total > 0
                ? ((presentes + tardanzas + justificadas) / total * 100).toFixed(1)
                : 0;
            setResumen({ total, presentes, ausencias, tardanzas, justificadas, pendientes, porcentajeAsistencia });
            return prev;
        });
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Presente': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Ausente': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'Tarde': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Justificado': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Asistencias - Dirección">
            <style>{`
                .ga-container { display: flex; flex-direction: column; gap: 20px; }
                .ga-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .ga-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }
                .ga-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 16px; }
                .ga-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .ga-field input, .ga-field select { width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color .2s, box-shadow .2s; }
                .ga-field input:focus, .ga-field select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }

                .ga-btn { padding: 9px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .2s; display: inline-flex; align-items: center; gap: 6px; }
                .ga-btn:disabled { opacity: .6; cursor: not-allowed; }
                .ga-btn-primary { background: #1e3a5f; color: #fff; }
                .ga-btn-primary:hover:not(:disabled) { background: #16293f; }
                .ga-btn-success { background: #16a34a; color: #fff; }
                .ga-btn-success:hover:not(:disabled) { background: #15803d; }
                .ga-btn-danger { background: #dc2626; color: #fff; }
                .ga-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .ga-btn-secondary { background: #e5e7eb; color: #334155; }
                .ga-btn-secondary:hover:not(:disabled) { background: #d1d5db; }

                .ga-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
                .ga-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .ga-stat .num { font-size: 26px; font-weight: bold; display: block; line-height: 1.2; }
                .ga-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .ga-stat-total { background: #eff6ff; }
                .ga-stat-presentes { background: #dcfce7; color: #15803d; }
                .ga-stat-ausencias { background: #fee2e2; color: #b91c1c; }
                .ga-stat-tardanzas { background: #fef3c7; color: #b45309; }
                .ga-stat-justificadas { background: #dbeafe; color: #1d4ed8; }
                .ga-stat-pendientes { background: #f1f5f9; color: #475569; }

                .ga-progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 8px; }
                .ga-progress-fill { height: 100%; transition: width .4s; }

                .ga-table { width: 100%; border-collapse: collapse; }
                .ga-table thead th { background: #1e3a5f; color: #fff; padding: 11px 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
                .ga-table thead th:first-child { border-top-left-radius: 8px; }
                .ga-table thead th:last-child { border-top-right-radius: 8px; }
                .ga-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .ga-table tbody tr:hover { background: #f8fafc; }
                .ga-table tbody tr:nth-child(even) { background: #fafbfc; }
                .ga-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .ga-table td { padding: 10px; font-size: 13px; color: #334155; vertical-align: middle; }

                .ga-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .ga-botones-estado { display: flex; gap: 4px; }
                .ga-btn-estado { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; padding: 0; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 700; transition: all .2s; }
                .ga-btn-estado:hover { transform: scale(1.1); }
                .ga-btn-estado.P { background: #16a34a; color: #fff; }
                .ga-btn-estado.A { background: #dc2626; color: #fff; }
                .ga-btn-estado.T { background: #e67e22; color: #fff; }
                .ga-btn-estado.J { background: #3b82f6; color: #fff; }

                .ga-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .ga-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .ga-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .ga-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                .ga-obs-input { width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; box-sizing: border-box; }
                .ga-obs-input:focus { outline: none; border-color: #3b82f6; }

                .ga-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
                .ga-busqueda { padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; min-width: 250px; }
                .ga-busqueda:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }

                @media (max-width: 768px) {
                    .ga-grid { grid-template-columns: 1fr; }
                    .ga-table { font-size: 12px; }
                    .ga-table thead th, .ga-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="ga-container">
                {message && <div className={`ga-aviso ${messageType}`}>{message}</div>}

                {/* FILTROS */}
                <div className="ga-card">
                    <h3>Filtros de Consulta</h3>
                    <div className="ga-grid">
                        <div className="ga-field">
                            <label>Año Lectivo</label>
                            <select
                                value={filtros.anioLectivo}
                                onChange={(e) => setFiltros({ ...filtros, anioLectivo: e.target.value, idClase: '' })}
                            >
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="ga-field">
                            <label>Clase</label>
                            <select
                                value={filtros.idClase}
                                onChange={(e) => setFiltros({ ...filtros, idClase: e.target.value })}
                            >
                                <option value="">Seleccionar clase</option>
                                {clases
                                    .filter(c => !filtros.anioLectivo || c.anioLectivo === parseInt(filtros.anioLectivo))
                                    .map(c => (
                                        <option key={c.idClase} value={c.idClase}>
                                            {c.nombreClase} (Sección {c.seccion})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="ga-field">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={filtros.fecha}
                                onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
                            />
                        </div>
                    </div>

                    {filtros.idClase && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                            <button
                                className="ga-btn ga-btn-success"
                                onClick={() => marcarTodos('Presente')}
                                disabled={procesando || !resumen || resumen.pendientes === 0}
                            >
                                Marcar todos Presentes
                            </button>
                            <button
                                className="ga-btn ga-btn-danger"
                                onClick={() => marcarTodos('Ausente')}
                                disabled={procesando || !resumen || resumen.pendientes === 0}
                            >
                                Marcar todos Ausentes
                            </button>
                            <button
                                className="ga-btn ga-btn-secondary"
                                onClick={cargarAsistencias}
                                disabled={loading}
                            >
                                Refrescar
                            </button>
                        </div>
                    )}
                </div>

                {/* ESTADÍSTICAS */}
                {resumen && (
                    <div className="ga-card">
                        <h3>Resumen de Asistencias</h3>
                        <div className="ga-stats">
                            <div className="ga-stat ga-stat-total">
                                <span className="num" style={{ color: '#1e40af' }}>{resumen.total}</span>
                                <span className="lbl">Total</span>
                            </div>
                            <div className="ga-stat ga-stat-presentes">
                                <span className="num">{resumen.presentes}</span>
                                <span className="lbl">Presentes</span>
                            </div>
                            <div className="ga-stat ga-stat-ausencias">
                                <span className="num">{resumen.ausencias}</span>
                                <span className="lbl">Ausencias</span>
                            </div>
                            <div className="ga-stat ga-stat-tardanzas">
                                <span className="num">{resumen.tardanzas}</span>
                                <span className="lbl">Tardanzas</span>
                            </div>
                            <div className="ga-stat ga-stat-justificadas">
                                <span className="num">{resumen.justificadas}</span>
                                <span className="lbl">Justificadas</span>
                            </div>
                            <div className="ga-stat ga-stat-pendientes">
                                <span className="num">{resumen.pendientes}</span>
                                <span className="lbl">Pendientes</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                                    Porcentaje de Asistencia
                                </span>
                                <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '15px' }}>
                                    {resumen.porcentajeAsistencia}%
                                </span>
                            </div>
                            <div className="ga-progress-bar">
                                <div
                                    className="ga-progress-fill"
                                    style={{
                                        width: `${resumen.porcentajeAsistencia}%`,
                                        background: resumen.porcentajeAsistencia >= 80
                                            ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                                            : resumen.porcentajeAsistencia >= 60
                                                ? 'linear-gradient(90deg, #e67e22, #f59e0b)'
                                                : 'linear-gradient(90deg, #dc2626, #ef4444)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* TABLA DETALLE */}
                {asistencias.length > 0 && (
                    <div className="ga-card">
                        <h3>Detalle de Asistencias</h3>

                        <div className="ga-toolbar">
                            <input
                                type="text"
                                className="ga-busqueda"
                                placeholder="Buscar por nombre, código o NIE..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                Mostrando <strong>{asistenciasFiltradas.length}</strong> de {asistencias.length} estudiantes
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="ga-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>#</th>
                                        <th style={{ width: '100px' }}>Código</th>
                                        <th>Estudiante</th>
                                        <th style={{ width: '130px' }}>Estado</th>
                                        <th style={{ width: '90px' }}>Hora</th>
                                        <th style={{ width: '80px' }}>Min. Tarde</th>
                                        <th style={{ width: '200px' }}>Observaciones</th>
                                        <th style={{ width: '200px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asistenciasFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="ga-empty">
                                                No se encontraron estudiantes con ese criterio de búsqueda
                                            </td>
                                        </tr>
                                    ) : (
                                        asistenciasFiltradas.map((a, index) => {
                                            const colores = getEstadoColor(a.estado);
                                            return (
                                                <tr key={a.idEstudiante}>
                                                    <td style={{ textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                                                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                        {a.codigoEstudiante || '-'}
                                                    </td>
                                                    <td>
                                                        <strong>{a.nombreEstudiante}</strong>
                                                        {a.nie && (
                                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                                NIE: {a.nie}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className="ga-badge"
                                                            style={{
                                                                backgroundColor: colores.bg,
                                                                color: colores.color,
                                                                border: `1px solid ${colores.border}`
                                                            }}
                                                        >
                                                            {a.estado}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                        {formatoHoraExacta(a.horaRegistro) || '-'}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {a.minutosTarde || 0}
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="ga-obs-input"
                                                            placeholder="Observaciones..."
                                                            value={a.observaciones || ''}
                                                            onChange={(ev) => actualizarObservaciones(a.idEstudiante, ev.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="ga-botones-estado">
                                                            <button
                                                                className="ga-btn-estado P"
                                                                title="Marcar como Presente"
                                                                onClick={() => registrarAsistencia(a.idEstudiante, 'Presente', a.observaciones)}
                                                                disabled={procesando}
                                                            >
                                                                P
                                                            </button>
                                                            <button
                                                                className="ga-btn-estado A"
                                                                title="Marcar como Ausente"
                                                                onClick={() => registrarAsistencia(a.idEstudiante, 'Ausente', a.observaciones)}
                                                                disabled={procesando}
                                                            >
                                                                A
                                                            </button>
                                                            <button
                                                                className="ga-btn-estado T"
                                                                title="Marcar como Tarde"
                                                                onClick={() => registrarAsistencia(a.idEstudiante, 'Tarde', a.observaciones)}
                                                                disabled={procesando}
                                                            >
                                                                T
                                                            </button>
                                                            <button
                                                                className="ga-btn-estado J"
                                                                title="Marcar como Justificado"
                                                                onClick={() => registrarAsistencia(a.idEstudiante, 'Justificado', a.observaciones)}
                                                                disabled={procesando}
                                                            >
                                                                J
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
                )}

                {/* MENSAJE CUANDO NO HAY CLASE SELECCIONADA */}
                {!filtros.idClase && !loading && (
                    <div className="ga-card">
                        <p className="ga-empty">
                            Selecciona un año, una clase y una fecha para ver las asistencias
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default GestionAsistenciasDireccion;