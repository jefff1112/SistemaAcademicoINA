// Componente HistorialAcademico: muestra el resumen académico del estudiante por año lectivo.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: tabla de promedios y estados por año.
const HistorialAcademico = () => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
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
            padding: '12px 10px',
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
        cargarHistorial();
    }, []);

    const cargarHistorial = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudianteData = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudianteData) {
                setEstudiante(estudianteData);

                const response = await API.get(`/inscripciones/estudiante/${estudianteData.idEstudiante}`);
                const inscripciones = response.data || [];

                const historialData = await Promise.all(inscripciones.map(async (ins) => {
                    try {
                        const notasRes = await API.get(`/reportes/notas-estudiante/${estudianteData.idEstudiante}/${ins.anioLectivo}`);
                        const notas = notasRes.data || {};
                        return {
                            anio: ins.anioLectivo,
                            clase: ins.clase?.nombreClase || ins.nombreClase || 'Sin clase',
                            promedio: notas.promedioGeneral || 0,
                            aprobadas: notas.materiasAprobadas || 0,
                            reprobadas: notas.materiasReprobadas || 0,
                            estado: (notas.promedioGeneral || 0) >= 6 ? 'Aprobado' : 'Reprobado'
                        };
                    } catch (err) {
                        return {
                            anio: ins.anioLectivo,
                            clase: ins.clase?.nombreClase || ins.nombreClase || 'Sin clase',
                            promedio: 0,
                            aprobadas: 0,
                            reprobadas: 0,
                            estado: 'Sin datos'
                        };
                    }
                }));

                setHistorial(historialData.reverse());
            } else {
                mostrarMensaje('No se encontró tu perfil de estudiante', 'error');
            }
        } catch (error) {
            mostrarMensaje('Error al cargar historial', 'error');
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
    const getPromedioColor = (promedio) => {
        const p = parseFloat(promedio);
        if (p >= 9) return '#16a34a';
        if (p >= 7) return '#3b82f6';
        if (p >= 6) return '#e67e22';
        if (p > 0) return '#dc2626';
        return '#94a3b8';
    };

    const getEstadoInfo = (estado) => {
        switch (estado) {
            case 'Aprobado': return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
            case 'Reprobado': return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
        }
    };

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================
    const stats = useMemo(() => {
        if (historial.length === 0) {
            return { anios: 0, promedioGlobal: 0, aprobados: 0, reprobados: 0, totalAprobadas: 0, totalReprobadas: 0 };
        }
        const anios = historial.length;
        const promedioGlobal = historial.reduce((acc, h) => acc + (parseFloat(h.promedio) || 0), 0) / anios;
        const aprobados = historial.filter(h => h.estado === 'Aprobado').length;
        const reprobados = historial.filter(h => h.estado === 'Reprobado').length;
        const totalAprobadas = historial.reduce((acc, h) => acc + (parseInt(h.aprobadas) || 0), 0);
        const totalReprobadas = historial.reduce((acc, h) => acc + (parseInt(h.reprobadas) || 0), 0);

        return {
            anios,
            promedioGlobal: promedioGlobal.toFixed(2),
            aprobados,
            reprobados,
            totalAprobadas,
            totalReprobadas
        };
    }, [historial]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Historial Academico">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    Cargando historial académico...
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Historial Academico">
            <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* HEADER */}
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>
                        Historial Académico
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                        {estudiante?.nombres} {estudiante?.apellidos}
                        {estudiante?.codigoEstudiante ? ` - ${estudiante.codigoEstudiante}` : ''}
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

                {/* ESTADÍSTICAS */}
                {historial.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        <div style={{ ...S.statCard, borderTop: '4px solid #1e3a5f' }}>
                            <span style={{ ...S.statNumber, color: '#1e3a5f' }}>{stats.anios}</span>
                            <span style={S.statLabel}>Años Cursados</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: `4px solid ${getPromedioColor(stats.promedioGlobal)}` }}>
                            <span style={{ ...S.statNumber, color: getPromedioColor(stats.promedioGlobal) }}>
                                {stats.promedioGlobal}
                            </span>
                            <span style={S.statLabel}>Promedio Global</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #16a34a' }}>
                            <span style={{ ...S.statNumber, color: '#16a34a' }}>{stats.totalAprobadas}</span>
                            <span style={S.statLabel}>Materias Aprobadas</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #dc2626' }}>
                            <span style={{ ...S.statNumber, color: '#dc2626' }}>{stats.totalReprobadas}</span>
                            <span style={S.statLabel}>Materias Reprobadas</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #3b82f6' }}>
                            <span style={{ ...S.statNumber, color: '#3b82f6' }}>{stats.aprobados}</span>
                            <span style={S.statLabel}>Años Aprobados</span>
                        </div>
                    </div>
                )}

                {/* TABLA DE HISTORIAL */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Resumen Académico por Año</h3>

                    {historial.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>Sin historial académico</h3>
                            <p style={{ margin: 0, fontSize: '13px' }}>
                                No hay historial académico disponible para tu cuenta.
                            </p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...S.th, width: '90px' }}>Año</th>
                                        <th style={S.th}>Clase</th>
                                        <th style={{ ...S.th, width: '110px', textAlign: 'center' }}>Promedio</th>
                                        <th style={{ ...S.th, width: '110px', textAlign: 'center' }}>Aprobadas</th>
                                        <th style={{ ...S.th, width: '110px', textAlign: 'center' }}>Reprobadas</th>
                                        <th style={{ ...S.th, width: '120px', textAlign: 'center' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.map((h, index) => {
                                        const estadoInfo = getEstadoInfo(h.estado);
                                        const promedioColor = getPromedioColor(h.promedio);
                                        return (
                                            <tr key={index}>
                                                <td style={{ ...S.td, fontWeight: 700, color: '#1e3a5f', fontFamily: 'monospace' }}>
                                                    {h.anio}
                                                </td>
                                                <td style={{ ...S.td, fontWeight: 600, color: '#0f172a' }}>
                                                    {h.clase}
                                                </td>
                                                <td style={{ ...S.td, textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 12px',
                                                        borderRadius: '10px',
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        fontFamily: 'monospace',
                                                        color: promedioColor,
                                                        background: '#ffffff',
                                                        border: `2px solid ${promedioColor}`
                                                    }}>
                                                        {parseFloat(h.promedio).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>
                                                    {h.aprobadas}
                                                </td>
                                                <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>
                                                    {h.reprobadas}
                                                </td>
                                                <td style={{ ...S.td, textAlign: 'center' }}>
                                                    <span style={{
                                                        ...S.badge,
                                                        backgroundColor: estadoInfo.bg,
                                                        color: estadoInfo.color,
                                                        border: `1px solid ${estadoInfo.border}`
                                                    }}>
                                                        {h.estado}
                                                    </span>
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

export default HistorialAcademico;