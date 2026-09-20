// Componente MiHorario: muestra el horario semanal de clases del estudiante.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: grilla horaria por día y hora, más resumen de clases.
const MiHorario = () => {
    const [horario, setHorario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [estudianteId, setEstudianteId] = useState(null);
    const [estudiante, setEstudiante] = useState(null);
    const [filterDia, setFilterDia] = useState('');
    const [busqueda, setBusqueda] = useState('');

    const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
    const horas = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

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
            padding: '16px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            textAlign: 'center'
        },
        statNumber: {
            fontSize: '24px',
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
            verticalAlign: 'top',
            fontSize: '13px'
        },
        badge: {
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 700
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const normalizarHora = (hora) => {
        if (!hora) return '';
        const partes = hora.split(':');
        return partes.length >= 2 ? `${partes[0].padStart(2, '0')}:${partes[1]}` : hora;
    };

    const getHorasGrilla = () => {
        const base = horas.map(h => normalizarHora(h));
        const presentes = horario.map(h => normalizarHora(h.horaInicio));
        return [...new Set([...base, ...presentes])].sort();
    };

    const getDiaBadge = (dia) => {
        switch (dia) {
            case 'Lunes': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            case 'Martes': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Miercoles': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Jueves': return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
            case 'Viernes': return { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    const getColorMateria = (materia) => {
        if (!materia) return { bg: '#eff6ff', border: '#3b82f6' };
        const colores = [
            { bg: '#eff6ff', border: '#3b82f6' },
            { bg: '#dcfce7', border: '#16a34a' },
            { bg: '#fef3c7', border: '#e67e22' },
            { bg: '#e9d5ff', border: '#a855f7' },
            { bg: '#cffafe', border: '#06b6d4' },
            { bg: '#fce7f3', border: '#ec4899' },
            { bg: '#fee2e2', border: '#dc2626' }
        ];
        let hash = 0;
        for (let i = 0; i < materia.length; i++) {
            hash = materia.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colores[Math.abs(hash) % colores.length];
    };

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarHorario();
    }, []);

    const cargarHorario = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudianteData = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudianteData) {
                setEstudianteId(estudianteData.idEstudiante);
                setEstudiante(estudianteData);
                const response = await API.get(`/horarios/estudiante/${estudianteData.idEstudiante}`);
                setHorario(response.data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Escucha cambios de horario en otras pestañas
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'horario_updated') {
                cargarHorario();
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // ============================================================
    // GRILLA
    // ============================================================
    const getHorarioCelda = (dia, hora) => {
        const clases = horario.filter(h => h.diaSemana === dia && normalizarHora(h.horaInicio) === normalizarHora(hora));
        if (clases.length > 0) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {clases.map((clase, index) => {
                        const color = getColorMateria(clase.materia);
                        return (
                            <div
                                key={index}
                                style={{
                                    padding: '8px',
                                    background: color.bg,
                                    borderRadius: '6px',
                                    borderLeft: `3px solid ${color.border}`,
                                    fontSize: '11px',
                                    lineHeight: 1.4
                                }}
                            >
                                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '3px', fontSize: '12px' }}>
                                    {clase.materia}
                                </strong>
                                {clase.docente && (
                                    <div style={{ color: '#475569', fontSize: '11px' }}>
                                        {clase.docente}
                                    </div>
                                )}
                                {clase.aula && (
                                    <div style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace', marginTop: '2px' }}>
                                        Aula: {clase.aula}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }
        return <div style={{ minHeight: '50px' }}></div>;
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const horarioFiltrado = useMemo(() => {
        return horario.filter(h => {
            if (filterDia && h.diaSemana !== filterDia) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (h.materia && h.materia.toLowerCase().includes(term)) ||
                    (h.docente && h.docente.toLowerCase().includes(term)) ||
                    (h.aula && h.aula.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [horario, filterDia, busqueda]);

    const stats = useMemo(() => {
        const diasConClase = new Set(horario.map(h => h.diaSemana)).size;
        const materiasUnicas = new Set(horario.map(h => h.materia)).size;
        const docentesUnicos = new Set(horario.map(h => h.docente).filter(Boolean)).size;
        const aulasUnicas = new Set(horario.map(h => h.aula).filter(Boolean)).size;
        return {
            totalClases: horario.length,
            diasConClase,
            materiasUnicas,
            docentesUnicos,
            aulasUnicas
        };
    }, [horario]);

    const filtrosActivos = (filterDia ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterDia('');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Mi Horario">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    Cargando horario...
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER SIN HORARIO
    // ============================================================
    if (horario.length === 0) {
        return (
            <DashboardLayout title="Mi Horario">
                <div style={{ padding: '20px', background: '#ffffff' }}>
                    <div style={S.card}>
                        <h3 style={S.cardTitle}>Mi Horario</h3>
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>No hay clases asignadas</h3>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                                No se encontraron clases asignadas para tu usuario. Verifica con Registro Académico que tu grado y sección estén correctos.
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
        <DashboardLayout title="Mi Horario">
            <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* HEADER */}
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>
                        Mi Horario
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                        {estudiante?.nombres} {estudiante?.apellidos}
                        {estudiante?.codigoEstudiante ? ` - ${estudiante.codigoEstudiante}` : ''}
                    </p>
                </div>

                {/* ESTADÍSTICAS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <div style={{ ...S.statCard, borderTop: '4px solid #1e3a5f' }}>
                        <span style={{ ...S.statNumber, color: '#1e3a5f' }}>{stats.totalClases}</span>
                        <span style={S.statLabel}>Total Clases</span>
                    </div>
                    <div style={{ ...S.statCard, borderTop: '4px solid #16a34a' }}>
                        <span style={{ ...S.statNumber, color: '#16a34a' }}>{stats.diasConClase}</span>
                        <span style={S.statLabel}>Días con Clase</span>
                    </div>
                    <div style={{ ...S.statCard, borderTop: '4px solid #e9d5ff' }}>
                        <span style={{ ...S.statNumber, color: '#6b21a8' }}>{stats.materiasUnicas}</span>
                        <span style={S.statLabel}>Materias</span>
                    </div>
                    <div style={{ ...S.statCard, borderTop: '4px solid #e67e22' }}>
                        <span style={{ ...S.statNumber, color: '#b45309' }}>{stats.docentesUnicos}</span>
                        <span style={S.statLabel}>Docentes</span>
                    </div>
                    <div style={{ ...S.statCard, borderTop: '4px solid #06b6d4' }}>
                        <span style={{ ...S.statNumber, color: '#0e7490' }}>{stats.aulasUnicas}</span>
                        <span style={S.statLabel}>Aulas</span>
                    </div>
                </div>

                {/* FILTROS */}
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
                            <label style={S.label}>Día</label>
                            <select
                                value={filterDia}
                                onChange={(e) => setFilterDia(e.target.value)}
                                style={S.input}
                            >
                                <option value="">Todos los días</option>
                                {diasSemana.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={S.label}>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por materia, docente o aula..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={S.input}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button style={S.btn} onClick={cargarHorario}>Recargar</button>
                            {filtrosActivos > 0 && (
                                <button style={S.btn} onClick={limpiarFiltros}>Limpiar Filtros</button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{horarioFiltrado.length}</strong> de {horario.length} clases
                        </div>
                    </div>
                </div>

                {/* GRILLA HORARIA */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Horario de Clases</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...S.th, width: '70px', textAlign: 'center' }}>Hora</th>
                                    {diasSemana.map(d => (
                                        <th key={d} style={{ ...S.th, textAlign: 'center' }}>{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {getHorasGrilla().map(hora => (
                                    <tr key={hora}>
                                        <td style={{
                                            ...S.td,
                                            textAlign: 'center',
                                            fontFamily: 'monospace',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            color: '#1e3a5f',
                                            background: '#f8fafc',
                                            verticalAlign: 'middle'
                                        }}>
                                            {hora}
                                        </td>
                                        {diasSemana.map(dia => (
                                            <td key={`${dia}-${hora}`} style={S.td}>
                                                {getHorarioCelda(dia, hora)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RESUMEN DE CLASES */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Resumen de Clases</h3>

                    {horarioFiltrado.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>No hay clases que coincidan</h3>
                            <p style={{ margin: 0, fontSize: '13px' }}>Prueba ajustando los filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...S.th, width: '110px' }}>Día</th>
                                        <th style={S.th}>Materia</th>
                                        <th style={S.th}>Docente</th>
                                        <th style={{ ...S.th, width: '140px' }}>Horario</th>
                                        <th style={{ ...S.th, width: '100px' }}>Aula</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {horarioFiltrado.map((h, index) => {
                                        const diaBadge = getDiaBadge(h.diaSemana);
                                        return (
                                            <tr key={index}>
                                                <td style={S.td}>
                                                    <span style={{
                                                        ...S.badge,
                                                        backgroundColor: diaBadge.bg,
                                                        color: diaBadge.color,
                                                        border: `1px solid ${diaBadge.border}`
                                                    }}>
                                                        {h.diaSemana}
                                                    </span>
                                                </td>
                                                <td style={{ ...S.td, fontWeight: 600, color: '#0f172a' }}>{h.materia}</td>
                                                <td style={{ ...S.td, color: '#475569' }}>{h.docente || '-'}</td>
                                                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                                                    {normalizarHora(h.horaInicio)} - {normalizarHora(h.horaFin)}
                                                </td>
                                                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                                                    {h.aula || '-'}
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

export default MiHorario;