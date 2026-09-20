// Componente Gestión de Asistencias (Registro Académico) - MEJORADO
// Consulta, resume y exporta asistencias por clase y fecha.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const GestionAsistenciasRegistro = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [clases, setClases] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
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
    // CARGA DE DATOS
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

    const cargarAsistencias = async () => {
        try {
            setLoading(true);
            const [asistenciaRes, estudiantesRes] = await Promise.all([
                API.get(`/asistencias/clase/${filtros.idClase}/${filtros.fecha}`),
                API.get(`/estudiantes/clase/${filtros.idClase}`)
            ]);

            const data = asistenciaRes.data || [];
            const estudiantes = estudiantesRes.data || [];

            const asistenciasCombinadas = estudiantes.map(e => {
                const asistencia = data.find(a => a.idEstudiante === e.idEstudiante);
                return {
                    idEstudiante: e.idEstudiante,
                    nombreEstudiante: `${e.apellidos || ''}, ${e.nombres || ''}`,
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

            setResumen({
                total, presentes, ausencias, tardanzas, justificadas, pendientes,
                porcentajeAsistencia
            });
        } catch (error) {
            mostrarMensaje('Error al cargar asistencias', 'error');
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
    // HELPERS
    // ============================================================
    const formatearNombre = (nombreCompleto) => {
        if (!nombreCompleto) return '';
        return nombreCompleto
            .toLowerCase()
            .split(' ')
            .map(palabra => {
                if (palabra.includes(',')) {
                    return palabra.split(',')
                        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                        .join(',');
                }
                return palabra.charAt(0).toUpperCase() + palabra.slice(1);
            })
            .join(' ');
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'Presente': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Ausente': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'Tarde': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Justificado': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            default: return { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
        }
    };

    const formatearHora = (hora) => {
        if (!hora) return '-';
        return new Date(hora).toLocaleTimeString('es-SV', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============================================================
    // EXPORTAR EXCEL
    // ============================================================
    const exportarExcel = () => {
        if (asistenciasFiltradas.length === 0) {
            mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }

        const claseActual = clases.find(c => c.idClase === parseInt(filtros.idClase));
        const nombreClase = claseActual ? `${claseActual.nombreClase} - ${claseActual.seccion}` : '';

        const data = asistenciasFiltradas.map((a, idx) => ({
            'N°': idx + 1,
            'Código': a.codigoEstudiante || '',
            'NIE': a.nie || '',
            'Estudiante': formatearNombre(a.nombreEstudiante),
            'Estado': a.estado,
            'Hora': a.horaRegistro ? new Date(a.horaRegistro).toLocaleTimeString() : '-',
            'Minutos Tarde': a.minutosTarde || 0,
            'Observaciones': a.observaciones || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');

        const fechaArchivo = filtros.fecha || new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `asistencias_${nombreClase}_${fechaArchivo}.xlsx`);
        mostrarMensaje(`Exportados ${data.length} registros a Excel`, 'success');
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const asistenciasFiltradas = useMemo(() => {
        const term = busqueda.trim().toLowerCase();
        if (!term) return asistencias;
        return asistencias.filter(a =>
            a.nombreEstudiante?.toLowerCase().includes(term) ||
            (a.codigoEstudiante && a.codigoEstudiante.toLowerCase().includes(term)) ||
            (a.nie && a.nie.toLowerCase().includes(term))
        );
    }, [asistencias, busqueda]);

    const aniosDisponibles = useMemo(() => {
        const set = new Set(clases.map(c => Number(c.anioLectivo)));
        set.add(new Date().getFullYear());
        return Array.from(set).sort((a, b) => b - a);
    }, [clases]);

    const clasesFiltradas = useMemo(() => {
        return clases.filter(c => !filtros.anioLectivo || Number(c.anioLectivo) === Number(filtros.anioLectivo));
    }, [clases, filtros.anioLectivo]);

    const claseActual = useMemo(() => {
        return clases.find(c => c.idClase === parseInt(filtros.idClase));
    }, [clases, filtros.idClase]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading && clases.length === 0) {
        return (
            <DashboardLayout title="Asistencias - Registro Académico">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Asistencias - Registro Académico">
            <style>{`
                .gar-container { display: flex; flex-direction: column; gap: 20px; }
                .gar-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .gar-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Filtros */
                .gar-filtros { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 14px; align-items: end; }
                .gar-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gar-field input, .gar-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .gar-field input:focus, .gar-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Estadísticas */
                .gar-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
                .gar-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .gar-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gar-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gar-stat-total { background: #eff6ff; color: #1e40af; }
                .gar-stat-presentes { background: #dcfce7; color: #15803d; }
                .gar-stat-ausencias { background: #fee2e2; color: #b91c1c; }
                .gar-stat-tardanzas { background: #fef3c7; color: #b45309; }
                .gar-stat-justificadas { background: #dbeafe; color: #1d4ed8; }
                .gar-stat-pendientes { background: #f1f5f9; color: #64748b; }

                /* Barra de progreso */
                .gar-progress-bar { width: 100%; height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; margin-top: 8px; }
                .gar-progress-fill { height: 100%; transition: width .4s; }

                /* Botones */
                .gar-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .gar-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gar-btn-primary { background: #1e3a5f; color: #fff; }
                .gar-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gar-btn-success { background: #16a34a; color: #fff; }
                .gar-btn-success:hover:not(:disabled) { background: #15803d; }
                .gar-btn-secondary { background: #e5e7eb; color: #334155; }
                .gar-btn-secondary:hover:not(:disabled) { background: #d1d5db; }

                /* Tabla */
                .gar-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
                .gar-tabla thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 11px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .gar-tabla thead th:first-child { border-top-left-radius: 8px; }
                .gar-tabla thead th:last-child { border-top-right-radius: 8px; }
                .gar-tabla tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .gar-tabla tbody tr:hover { background: #f8fafc; }
                .gar-tabla tbody tr:nth-child(even) { background: #fafbfc; }
                .gar-tabla tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .gar-tabla td { padding: 10px; color: #334155; vertical-align: middle; }
                .gar-tabla td.col-codigo { font-family: monospace; font-size: 12px; color: #64748b; }
                .gar-tabla td.col-nombre { font-weight: 500; }
                .gar-tabla td.col-hora { font-family: monospace; font-size: 12px; text-align: center; }

                .gar-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .gar-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gar-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gar-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gar-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
                .gar-empty h3 { color: #475569; margin: 0 0 8px; }

                .gar-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
                .gar-busqueda { padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; min-width: 250px; }
                .gar-busqueda:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }

                @media (max-width: 900px) {
                    .gar-filtros { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .gar-filtros { grid-template-columns: 1fr; }
                    .gar-tabla { font-size: 12px; }
                    .gar-tabla thead th, .gar-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gar-container">
                {message && <div className={`gar-aviso ${messageType}`}>{message}</div>}

                {/* FILTROS */}
                <div className="gar-card">
                    <h3>Filtros de Consulta</h3>
                    <div className="gar-filtros">
                        <div className="gar-field">
                            <label>Año Lectivo</label>
                            <select
                                value={filtros.anioLectivo}
                                onChange={(e) => setFiltros({ ...filtros, anioLectivo: e.target.value, idClase: '' })}
                            >
                                {aniosDisponibles.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <div className="gar-field">
                            <label>Clase</label>
                            <select
                                value={filtros.idClase}
                                onChange={(e) => setFiltros({ ...filtros, idClase: e.target.value })}
                            >
                                <option value="">Seleccionar clase</option>
                                {clasesFiltradas.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} (Sección {c.seccion})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="gar-field">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={filtros.fecha}
                                onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
                            />
                        </div>
                        <button
                            className="gar-btn gar-btn-success"
                            onClick={exportarExcel}
                            disabled={asistenciasFiltradas.length === 0}
                        >
                            Exportar Excel
                        </button>
                    </div>
                </div>

                {/* ESTADÍSTICAS */}
                {resumen && (
                    <div className="gar-card">
                        <h3>Resumen de Asistencias {claseActual && <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>{claseActual.nombreClase}</span>}</h3>
                        <div className="gar-stats">
                            <div className="gar-stat gar-stat-total">
                                <span className="num">{resumen.total}</span>
                                <span className="lbl">Total</span>
                            </div>
                            <div className="gar-stat gar-stat-presentes">
                                <span className="num">{resumen.presentes}</span>
                                <span className="lbl">Presentes</span>
                            </div>
                            <div className="gar-stat gar-stat-ausencias">
                                <span className="num">{resumen.ausencias}</span>
                                <span className="lbl">Ausencias</span>
                            </div>
                            <div className="gar-stat gar-stat-tardanzas">
                                <span className="num">{resumen.tardanzas}</span>
                                <span className="lbl">Tardanzas</span>
                            </div>
                            <div className="gar-stat gar-stat-justificadas">
                                <span className="num">{resumen.justificadas}</span>
                                <span className="lbl">Justificadas</span>
                            </div>
                            <div className="gar-stat gar-stat-pendientes">
                                <span className="num">{resumen.pendientes}</span>
                                <span className="lbl">Pendientes</span>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                                    Porcentaje de Asistencia
                                </span>
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: '16px',
                                    color: resumen.porcentajeAsistencia >= 80 ? '#16a34a' :
                                        resumen.porcentajeAsistencia >= 60 ? '#e67e22' : '#dc2626'
                                }}>
                                    {resumen.porcentajeAsistencia}%
                                </span>
                            </div>
                            <div className="gar-progress-bar">
                                <div
                                    className="gar-progress-fill"
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

                {/* TABLA */}
                {asistencias.length > 0 && (
                    <div className="gar-card">
                        <h3>Detalle de Asistencias</h3>

                        <div className="gar-toolbar">
                            <input
                                type="text"
                                className="gar-busqueda"
                                placeholder="Buscar por nombre, código o NIE..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                Mostrando <strong>{asistenciasFiltradas.length}</strong> de {asistencias.length} estudiantes
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="gar-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                                        <th style={{ width: '120px' }}>Código</th>
                                        <th>Estudiante</th>
                                        <th style={{ width: '130px', textAlign: 'center' }}>Estado</th>
                                        <th style={{ width: '90px', textAlign: 'center' }}>Hora</th>
                                        <th style={{ width: '80px', textAlign: 'center' }}>Min. Tarde</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asistenciasFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="gar-empty">
                                                No se encontraron estudiantes con ese criterio
                                            </td>
                                        </tr>
                                    ) : (
                                        asistenciasFiltradas.map((a, index) => {
                                            const badge = getEstadoBadge(a.estado);
                                            return (
                                                <tr key={a.idEstudiante}>
                                                    <td style={{ textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                                                    <td className="col-codigo">{a.codigoEstudiante || '-'}</td>
                                                    <td className="col-nombre">
                                                        <strong>{formatearNombre(a.nombreEstudiante)}</strong>
                                                        {a.nie && (
                                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                                NIE: {a.nie}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span
                                                            className="gar-badge"
                                                            style={{
                                                                backgroundColor: badge.bg,
                                                                color: badge.color,
                                                                border: `1px solid ${badge.border}`
                                                            }}
                                                        >
                                                            {a.estado}
                                                        </span>
                                                    </td>
                                                    <td className="col-hora">{formatearHora(a.horaRegistro)}</td>
                                                    <td style={{ textAlign: 'center' }}>{a.minutosTarde || 0}</td>
                                                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                                                        {a.observaciones || '-'}
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

                {/* EMPTY STATE */}
                {!filtros.idClase && !loading && (
                    <div className="gar-card">
                        <div className="gar-empty">
                            <h3>Selecciona una clase y una fecha</h3>
                            <p>Los datos de asistencia se cargarán automáticamente.</p>
                        </div>
                    </div>
                )}

                {filtros.idClase && !loading && asistencias.length === 0 && (
                    <div className="gar-card">
                        <div className="gar-empty">
                            <h3>No hay estudiantes en esta clase</h3>
                            <p>Verifica que la clase tenga estudiantes matriculados.</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default GestionAsistenciasRegistro;