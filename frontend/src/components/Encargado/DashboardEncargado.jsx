// Componente DashboardEncargado: resumen académico de los estudiantes a cargo del encargado.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: panel con estadísticas por hijo y accesos rápidos.
const DashboardEncargado = () => {
    const navigate = useNavigate();
    const [hijos, setHijos] = useState([]);
    const [selectedHijo, setSelectedHijo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingStats, setLoadingStats] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [stats, setStats] = useState({
        promedioGeneral: 0,
        porcentajeAsistencia: 0,
        materiasAprobadas: 0,
        materiasReprobadas: 0
    });

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
        select: {
            width: '100%',
            maxWidth: '500px',
            padding: '10px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box',
            background: '#ffffff',
            color: '#1e293b',
            fontFamily: 'inherit'
        },
        statCard: {
            background: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            textAlign: 'center'
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
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarHijos();
    }, []);

    useEffect(() => {
        if (selectedHijo) {
            cargarDatosHijo(selectedHijo);
        }
    }, [selectedHijo]);

    const cargarHijos = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await API.get(`/encargados/${user?.idUsuario}/estudiantes`);
            const hijosData = response.data || [];
            setHijos(hijosData);

            if (hijosData.length > 0) {
                setSelectedHijo(hijosData[0]);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error al cargar los estudiantes asociados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarDatosHijo = async (hijo) => {
        setLoadingStats(true);
        try {
            const [notasRes, asistenciasRes] = await Promise.all([
                API.get(`/reportes/notas-estudiante/${hijo.idEstudiante}/${new Date().getFullYear()}`),
                API.get(`/reportes/asistencias-estudiante/${hijo.idEstudiante}/${new Date().getFullYear()}`)
            ]);

            const notasData = notasRes.data || {};
            const asistenciasData = asistenciasRes.data || {};

            setStats({
                promedioGeneral: notasData.promedioGeneral || 0,
                porcentajeAsistencia: asistenciasData.porcentajeAsistencia || 0,
                materiasAprobadas: notasData.materiasAprobadas || 0,
                materiasReprobadas: notasData.materiasReprobadas || 0
            });
        } catch (error) {
            console.error('Error:', error);
            setStats({
                promedioGeneral: 0,
                porcentajeAsistencia: 0,
                materiasAprobadas: 0,
                materiasReprobadas: 0
            });
        } finally {
            setLoadingStats(false);
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
    const getIniciales = (hijo) => {
        if (!hijo) return '??';
        const n = (hijo.nombres || '').trim().charAt(0).toUpperCase();
        const a = (hijo.apellidos || '').trim().charAt(0).toUpperCase();
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
            <DashboardLayout title="Dashboard Encargado">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    Cargando dashboard...
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // SIN HIJOS
    // ============================================================
    if (hijos.length === 0) {
        return (
            <DashboardLayout title="Dashboard Encargado">
                <div style={{ padding: '20px', background: '#ffffff' }}>
                    <div style={S.card}>
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>
                                No tienes estudiantes asociados
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                                Contacta a Registro Académico para vincular a tus hijos o encargados a tu cuenta.
                            </p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Dashboard Encargado">
            <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* HEADER */}
                <div>
                    <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '12px', textTransform: 'capitalize' }}>
                        {getFechaHoy()}
                    </p>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>
                        Panel del Encargado
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                        Consulta el rendimiento académico de {hijos.length === 1 ? 'tu estudiante' : 'tus estudiantes'}
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

                {/* SELECTOR DE ESTUDIANTE */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Seleccionar Estudiante</h3>
                    <div>
                        <label style={S.label}>
                            {hijos.length === 1 ? 'Estudiante a cargo' : 'Estudiantes a cargo'}
                        </label>
                        <select
                            value={selectedHijo?.idEstudiante || ''}
                            onChange={(e) => {
                                const hijo = hijos.find(h => parseInt(h.idEstudiante) === parseInt(e.target.value));
                                setSelectedHijo(hijo);
                            }}
                            style={S.select}
                        >
                            {hijos.map((h) => (
                                <option key={h.idEstudiante} value={h.idEstudiante}>
                                    {h.nombres} {h.apellidos} - {h.codigoEstudiante}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* INFO DEL HIJO SELECCIONADO */}
                {selectedHijo && (
                    <>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            padding: '20px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,.05)'
                        }}>
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                background: '#eff6ff',
                                border: '3px solid #bfdbfe',
                                color: '#1e40af',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                fontWeight: 700,
                                flexShrink: 0
                            }}>
                                {getIniciales(selectedHijo)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{ margin: '0 0 4px', fontSize: '18px', color: '#1e3a5f', fontWeight: 700 }}>
                                    {selectedHijo.nombres} {selectedHijo.apellidos}
                                </h2>
                                <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '13px' }}>
                                    {selectedHijo.clase?.nombreClase || selectedHijo.nombreClase || 'Sin clase asignada'}
                                </p>
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
                                        {selectedHijo.codigoEstudiante}
                                    </span>
                                    {selectedHijo.nie && (
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: '10px',
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            border: '1px solid #cbd5e1',
                                            fontFamily: 'monospace',
                                            fontWeight: 600
                                        }}>
                                            NIE: {selectedHijo.nie}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ESTADÍSTICAS */}
                        {loadingStats ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                                Cargando estadísticas...
                            </div>
                        ) : (
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
                        )}

                        {/* ACCIONES RÁPIDAS */}
                        <div style={S.card}>
                            <h3 style={S.cardTitle}>Acciones Rápidas</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <button
                                    style={S.actionBtn}
                                    onClick={() => navigate('/encargado/notas')}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }}></span>
                                    <span>Ver Notas</span>
                                </button>
                                <button
                                    style={S.actionBtn}
                                    onClick={() => navigate('/encargado/asistencias')}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }}></span>
                                    <span>Asistencias</span>
                                </button>
                                <button
                                    style={S.actionBtn}
                                    onClick={() => navigate('/encargado/conducta')}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e67e22'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(230,126,34,.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e67e22', flexShrink: 0 }}></span>
                                    <span>Conducta</span>
                                </button>
                                <button
                                    style={S.actionBtn}
                                    onClick={() => navigate('/encargado/boleta')}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }}></span>
                                    <span>Boleta de Notas</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DashboardEncargado;