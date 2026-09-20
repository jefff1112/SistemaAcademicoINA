// Componente DashboardEstudiante: resumen de rendimiento, asistencia y avisos del estudiante.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: panel de inicio del estudiante con estadísticas y accesos rápidos.
const DashboardEstudiante = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [estudiante, setEstudiante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        promedioGeneral: 0,
        porcentajeAsistencia: 0,
        materiasAprobadas: 0,
        materiasReprobadas: 0
    });
    const [avisos, setAvisos] = useState([]);

    // ============================================================
    // ESTILOS INLINE
    // ============================================================
    const S = {
        statCard: {
            background: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
        },
        statNumber: {
            fontSize: '28px',
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
        actionBtn: {
            padding: '18px 20px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1e3a5f',
            transition: 'all .2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '12px',
            textAlign: 'left'
        }
    };

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        cargarDatos(userData);
    }, []);

    const cargarDatos = async (userData) => {
        try {
            const estudiantesRes = await API.get('/estudiantes');
            const estudianteData = estudiantesRes.data.find(e => e.codigoEstudiante === userData?.codigo);

            if (estudianteData) {
                setEstudiante(estudianteData);

                const notasRes = await API.get(`/reportes/notas-estudiante/${estudianteData.idEstudiante}/${new Date().getFullYear()}`);
                const notasData = notasRes.data || {};

                const asistenciasRes = await API.get(`/reportes/asistencias-estudiante/${estudianteData.idEstudiante}/${new Date().getFullYear()}`);
                const asistenciasData = asistenciasRes.data || {};

                setStats({
                    promedioGeneral: notasData.promedioGeneral || 0,
                    porcentajeAsistencia: asistenciasData.porcentajeAsistencia || 0,
                    materiasAprobadas: notasData.materiasAprobadas || 0,
                    materiasReprobadas: notasData.materiasReprobadas || 0
                });

                const avisosRes = await API.get('/avisosinternos/activos');
                setAvisos(avisosRes.data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getIniciales = () => {
        if (!estudiante) return '??';
        const n = (estudiante.nombres || '').trim().charAt(0).toUpperCase();
        const a = (estudiante.apellidos || '').trim().charAt(0).toUpperCase();
        return `${n}${a}`;
    };

    const getPromedioColor = (promedio) => {
        const p = parseFloat(promedio);
        if (p >= 8) return '#16a34a';
        if (p >= 6) return '#e67e22';
        return '#dc2626';
    };

    const getAsistenciaColor = (porcentaje) => {
        const p = parseFloat(porcentaje);
        if (p >= 90) return '#16a34a';
        if (p >= 75) return '#e67e22';
        return '#dc2626';
    };

    const getPrioridadInfo = (prioridad) => {
        switch (prioridad) {
            case 'alta': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626', label: 'Alta' };
            case 'media': return { bg: '#fef3c7', color: '#b45309', border: '#f59e0b', label: 'Media' };
            case 'baja': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a', label: 'Baja' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8', label: prioridad || 'Normal' };
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            return new Date(fecha).toLocaleDateString('es-SV', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return fecha;
        }
    };

    const getFechaHoy = () => {
        return new Date().toLocaleDateString('es-SV', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Dashboard Estudiante">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    Cargando dashboard...
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Dashboard Estudiante">
            <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* HEADER DE BIENVENIDA */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '24px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,.05)'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        border: '3px solid #bfdbfe',
                        color: '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        fontWeight: 700,
                        flexShrink: 0
                    }}>
                        {getIniciales()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '12px', textTransform: 'capitalize' }}>
                            {getFechaHoy()}
                        </p>
                        <h1 style={{ margin: '0 0 6px', fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>
                            Bienvenido, {estudiante?.nombres} {estudiante?.apellidos}
                        </h1>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                            <span style={{
                                padding: '3px 10px',
                                borderRadius: '10px',
                                background: '#eff6ff',
                                color: '#1e40af',
                                border: '1px solid #bfdbfe',
                                fontFamily: 'monospace',
                                fontWeight: 600
                            }}>
                                {estudiante?.codigoEstudiante}
                            </span>
                            {estudiante?.nombreEspecialidad && (
                                <span style={{
                                    padding: '3px 10px',
                                    borderRadius: '10px',
                                    background: '#e9d5ff',
                                    color: '#6b21a8',
                                    border: '1px solid #d8b4fe',
                                    fontWeight: 600
                                }}>
                                    {estudiante.nombreEspecialidad}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ESTADÍSTICAS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div style={{ ...S.statCard, borderLeft: `4px solid ${getPromedioColor(stats.promedioGeneral)}` }}>
                        <span style={{ ...S.statNumber, color: getPromedioColor(stats.promedioGeneral) }}>
                            {parseFloat(stats.promedioGeneral).toFixed(2)}
                        </span>
                        <span style={S.statLabel}>Promedio General</span>
                    </div>
                    <div style={{ ...S.statCard, borderLeft: `4px solid ${getAsistenciaColor(stats.porcentajeAsistencia)}` }}>
                        <span style={{ ...S.statNumber, color: getAsistenciaColor(stats.porcentajeAsistencia) }}>
                            {parseFloat(stats.porcentajeAsistencia).toFixed(1)}%
                        </span>
                        <span style={S.statLabel}>Asistencia</span>
                    </div>
                    <div style={{ ...S.statCard, borderLeft: '4px solid #16a34a' }}>
                        <span style={{ ...S.statNumber, color: '#16a34a' }}>{stats.materiasAprobadas}</span>
                        <span style={S.statLabel}>Materias Aprobadas</span>
                    </div>
                    <div style={{ ...S.statCard, borderLeft: '4px solid #dc2626' }}>
                        <span style={{ ...S.statNumber, color: '#dc2626' }}>{stats.materiasReprobadas}</span>
                        <span style={S.statLabel}>Materias Reprobadas</span>
                    </div>
                </div>

                {/* ACCIONES RÁPIDAS */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Acciones Rápidas</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <button
                            style={S.actionBtn}
                            onClick={() => navigate('/estudiante/notas')}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }}></span>
                            <span>Ver Notas</span>
                        </button>
                        <button
                            style={S.actionBtn}
                            onClick={() => navigate('/estudiante/asistencias')}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }}></span>
                            <span>Mis Asistencias</span>
                        </button>
                        <button
                            style={S.actionBtn}
                            onClick={() => navigate('/estudiante/horario')}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e67e22'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(230,126,34,.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e67e22', flexShrink: 0 }}></span>
                            <span>Mi Horario</span>
                        </button>
                        <button
                            style={S.actionBtn}
                            onClick={() => navigate('/estudiante/conducta')}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }}></span>
                            <span>Mi Conducta</span>
                        </button>
                        <button
                            style={S.actionBtn}
                            onClick={() => navigate('/estudiante/historial')}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(6,182,212,.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', flexShrink: 0 }}></span>
                            <span>Historial Académico</span>
                        </button>
                        <button
                            style={S.actionBtn}
                            onClick={() => navigate('/estudiante/constancias')}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,38,38,.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 }}></span>
                            <span>Constancias</span>
                        </button>
                    </div>
                </div>

                {/* AVISOS */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>
                        Avisos Importantes
                        {avisos.length > 0 && (
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
                                {avisos.length}
                            </span>
                        )}
                    </h3>

                    {avisos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>
                            No hay avisos activos en este momento
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {avisos.map((aviso) => {
                                const prioridadInfo = getPrioridadInfo(aviso.prioridad);
                                return (
                                    <div
                                        key={aviso.idAviso}
                                        style={{
                                            padding: '14px 16px',
                                            background: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderLeft: `4px solid ${prioridadInfo.border}`,
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                            <strong style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>
                                                {aviso.titulo}
                                            </strong>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '10px',
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '.3px',
                                                backgroundColor: prioridadInfo.bg,
                                                color: prioridadInfo.color,
                                                border: `1px solid ${prioridadInfo.border}`
                                            }}>
                                                Prioridad {prioridadInfo.label}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                                            {aviso.contenido}
                                        </p>
                                        <small style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}>
                                            Publicado: {formatearFecha(aviso.createdAt)}
                                        </small>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardEstudiante;