// Componente MisAsistencias: consulta el detalle y el resumen de asistencias del estudiante.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: resumen estadístico y detalle de asistencias por período.
const MisAsistencias = () => {
    const [asistencias, setAsistencias] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [periodos, setPeriodos] = useState([]);
    const [filterEstado, setFilterEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [estudiante, setEstudiante] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    // ============================================================
    // ESTILOS INLINE
    // ============================================================
    const S = {
        card: {
            background: '#ffffff',
            borderRadius: '12px',
            padding: '22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,.05)',
            marginBottom: '20px'
        },
        cardTitle: {
            margin: '0 0 16px',
            color: '#1e3a5f',
            fontSize: '17px',
            fontWeight: 700
        },
        label: {
            display: 'block',
            fontWeight: 600,
            color: '#34495e',
            fontSize: '13px',
            marginBottom: '6px'
        },
        input: {
            width: '100%',
            padding: '9px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box',
            background: '#ffffff',
            color: '#1e293b',
            fontFamily: 'inherit'
        },
        btn: {
            padding: '9px 16px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            background: '#e5e7eb',
            color: '#334155'
        },
        statCard: {
            background: '#ffffff',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            textAlign: 'center'
        },
        statNumber: {
            fontSize: '26px',
            fontWeight: 700,
            lineHeight: 1.2
        },
        statLabel: {
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '.5px',
            color: '#64748b',
            fontWeight: 600
        },
        th: {
            padding: '12px 10px',
            textAlign: 'left',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '.5px',
            fontWeight: 700,
            color: '#1e293b',
            background: '#f8fafc',
            borderBottom: '2px solid #cbd5e1'
        },
        td: {
            padding: '10px',
            color: '#1e293b',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            verticalAlign: 'middle',
            fontSize: '13px'
        },
        badge: {
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.3px'
        }
    };

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (selectedPeriodo) {
            cargarAsistenciasPorPeriodo();
        }
    }, [selectedPeriodo]);

    const cargarDatos = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudianteData = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudianteData) {
                setEstudiante(estudianteData);

                const periodosRes = await API.get('/periodosacademicos');
                const periodosData = periodosRes.data || [];
                setPeriodos(periodosData);

                if (periodosData.length > 0) {
                    // Seleccionar el período activo o el primero
                    const periodoActivo = periodosData.find(p => p.estado === 'Activo');
                    setSelectedPeriodo(periodoActivo?.idPeriodo || periodosData[0].idPeriodo);
                }
            } else {
                mostrarMensaje('No se encontró tu perfil de estudiante', 'error');
            }
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarAsistenciasPorPeriodo = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudianteData = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudianteData) {
                const response = await API.get(`/asistencias/estudiante/${estudianteData.idEstudiante}/${new Date().getFullYear()}`);
                const data = response.data || [];
                setAsistencias(data);

                const total = data.length;
                const presentes = data.filter(a => a.estado === 'Presente').length;
                const ausencias = data.filter(a => a.estado === 'Ausente').length;
                const tardanzas = data.filter(a => a.estado === 'Tarde').length;
                const justificadas = data.filter(a => a.estado === 'Justificado').length;
                const porcentaje = total > 0 ? ((presentes + tardanzas) / total * 100).toFixed(2) : 0;

                setResumen({ total, presentes, ausencias, tardanzas, justificadas, porcentaje });
            }
        } catch (error) {
            mostrarMensaje('Error al cargar asistencias', 'error');
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
    const getEstadoInfo = (estado) => {
        switch (estado) {
            case 'Presente': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Ausente': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'Tarde': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Justificado': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            return new Date(fecha).toLocaleDateString('es-SV', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return fecha;
        }
    };

    const formatearHora = (hora) => {
        if (!hora) return '-';
        try {
            return new Date(hora).toLocaleTimeString('es-SV', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return hora;
        }
    };

    const getAsistenciaColor = (porcentaje) => {
        const p = parseFloat(porcentaje);
        if (p >= 90) return '#16a34a';
        if (p >= 75) return '#e67e22';
        return '#dc2626';
    };

    // ============================================================
    // FILTRADO
    // ============================================================
    const asistenciasFiltradas = useMemo(() => {
        return asistencias.filter(a => {
            if (filterEstado !== 'todos' && a.estado !== filterEstado) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                const fecha = formatearFecha(a.fecha).toLowerCase();
                const justificacion = (a.justificacion || '').toLowerCase();
                return fecha.includes(term) || justificacion.includes(term);
            }
            return true;
        });
    }, [asistencias, filterEstado, busqueda]);

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
            <DashboardLayout title="Mis Asistencias">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    Cargando asistencias...
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Mis Asistencias">
            <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* HEADER */}
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>
                        Mis Asistencias
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                        {estudiante?.nombres} {estudiante?.apellidos} - Año lectivo {new Date().getFullYear()}
                    </p>
                </div>

                {/* MENSAJES */}
                {mensaje && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        background: mensaje.tipo === 'success' ? '#dcfce7' : '#fee2e2',
                        color: mensaje.tipo === 'success' ? '#15803d' : '#b91c1c',
                        borderLeft: `4px solid ${mensaje.tipo === 'success' ? '#16a34a' : '#dc2626'}`
                    }}>
                        {mensaje.texto}
                    </div>
                )}

                {/* SELECTOR DE PERÍODO */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Seleccionar Período</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                        <div>
                            <label style={S.label}>Período</label>
                            <select
                                value={selectedPeriodo}
                                onChange={(e) => setSelectedPeriodo(e.target.value)}
                                style={S.input}
                            >
                                {periodos.map((p) => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombre || p.nombrePeriodo} - {p.anioLectivo} {p.estado === 'Activo' ? '- Activo' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* RESUMEN */}
                {resumen && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                            <div style={{ ...S.statCard, borderTop: '4px solid #1e3a5f' }}>
                                <span style={{ ...S.statNumber, color: '#1e3a5f' }}>{resumen.total}</span>
                                <span style={S.statLabel}>Total Días</span>
                            </div>
                            <div style={{ ...S.statCard, borderTop: '4px solid #16a34a' }}>
                                <span style={{ ...S.statNumber, color: '#16a34a' }}>{resumen.presentes}</span>
                                <span style={S.statLabel}>Presentes</span>
                            </div>
                            <div style={{ ...S.statCard, borderTop: '4px solid #dc2626' }}>
                                <span style={{ ...S.statNumber, color: '#dc2626' }}>{resumen.ausencias}</span>
                                <span style={S.statLabel}>Ausencias</span>
                            </div>
                            <div style={{ ...S.statCard, borderTop: '4px solid #e67e22' }}>
                                <span style={{ ...S.statNumber, color: '#e67e22' }}>{resumen.tardanzas}</span>
                                <span style={S.statLabel}>Tardanzas</span>
                            </div>
                            <div style={{ ...S.statCard, borderTop: '4px solid #3b82f6' }}>
                                <span style={{ ...S.statNumber, color: '#3b82f6' }}>{resumen.justificadas}</span>
                                <span style={S.statLabel}>Justificadas</span>
                            </div>
                            <div style={{ ...S.statCard, borderTop: `4px solid ${getAsistenciaColor(resumen.porcentaje)}` }}>
                                <span style={{ ...S.statNumber, color: getAsistenciaColor(resumen.porcentaje) }}>
                                    {resumen.porcentaje}%
                                </span>
                                <span style={S.statLabel}>Asistencia Total</span>
                            </div>
                        </div>
                    </>
                )}

                {/* FILTROS DE LA TABLA */}
                {asistencias.length > 0 && (
                    <div style={S.card}>
                        <h3 style={{ ...S.cardTitle, marginBottom: '16px' }}>
                            Filtros de Búsqueda
                            {filtrosActivos > 0 && (
                                <span style={{
                                    display: 'inline-block',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    marginLeft: '8px'
                                }}>
                                    {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                                </span>
                            )}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                            <div>
                                <label style={S.label}>Estado</label>
                                <select
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                    style={S.input}
                                >
                                    <option value="todos">Todos los estados</option>
                                    <option value="Presente">Solo Presentes</option>
                                    <option value="Ausente">Solo Ausencias</option>
                                    <option value="Tarde">Solo Tardanzas</option>
                                    <option value="Justificado">Solo Justificadas</option>
                                </select>
                            </div>
                            <div>
                                <label style={S.label}>Buscar</label>
                                <input
                                    type="text"
                                    placeholder="Buscar por fecha o justificación..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    style={S.input}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button style={S.btn} onClick={cargarAsistenciasPorPeriodo}>Recargar</button>
                                {filtrosActivos > 0 && (
                                    <button style={S.btn} onClick={limpiarFiltros}>Limpiar Filtros</button>
                                )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                Mostrando <strong>{asistenciasFiltradas.length}</strong> de {asistencias.length} registros
                            </div>
                        </div>
                    </div>
                )}

                {/* TABLA DE DETALLE */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Detalle de Asistencias</h3>

                    {asistenciasFiltradas.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>
                                {asistencias.length === 0 ? 'No hay asistencias registradas' : 'No hay registros que coincidan'}
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px' }}>
                                {asistencias.length === 0
                                    ? 'Aún no se ha registrado asistencia para este período.'
                                    : 'Prueba ajustando los filtros de búsqueda.'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...S.th, width: '70px' }}>#</th>
                                        <th style={{ ...S.th, width: '140px' }}>Fecha</th>
                                        <th style={{ ...S.th, width: '130px' }}>Estado</th>
                                        <th style={{ ...S.th, width: '120px' }}>Hora</th>
                                        <th style={{ ...S.th, width: '120px' }}>Min. Tarde</th>
                                        <th style={S.th}>Justificación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asistenciasFiltradas.map((a, index) => {
                                        const estadoInfo = getEstadoInfo(a.estado);
                                        return (
                                            <tr key={index}>
                                                <td style={{ ...S.td, color: '#94a3b8', fontFamily: 'monospace' }}>
                                                    {index + 1}
                                                </td>
                                                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {formatearFecha(a.fecha)}
                                                </td>
                                                <td style={S.td}>
                                                    <span style={{
                                                        ...S.badge,
                                                        background: estadoInfo.bg,
                                                        color: estadoInfo.color,
                                                        border: `1px solid ${estadoInfo.border}`
                                                    }}>
                                                        {a.estado}
                                                    </span>
                                                </td>
                                                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                                                    {formatearHora(a.horaRegistro)}
                                                </td>
                                                <td style={{ ...S.td, textAlign: 'center', fontWeight: 600 }}>
                                                    {a.minutosTarde ? `${a.minutosTarde} min` : '-'}
                                                </td>
                                                <td style={{ ...S.td, fontSize: '12px', color: '#475569' }}>
                                                    {a.justificacion || '-'}
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
        </DashboardLayout>
    );
};

export default MisAsistencias;