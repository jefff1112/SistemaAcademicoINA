// Componente NotasEncargado: consulta las notas por período de los hijos del encargado.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: resumen y detalle de notas del estudiante seleccionado.
const NotasEncargado = () => {
    const [hijos, setHijos] = useState([]);
    const [selectedHijo, setSelectedHijo] = useState(null);
    const [notas, setNotas] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingNotas, setLoadingNotas] = useState(false);
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [periodos, setPeriodos] = useState([]);
    const [mensaje, setMensaje] = useState(null);
    const [filterEstado, setFilterEstado] = useState('todas');
    const [busqueda, setBusqueda] = useState('');

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
        cargarHijos();
    }, []);

    useEffect(() => {
        if (selectedHijo && selectedPeriodo) {
            cargarNotas();
        }
    }, [selectedHijo, selectedPeriodo]);

    const cargarHijos = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await API.get(`/encargados/${user?.idUsuario}/estudiantes`);
            const hijosData = response.data || [];
            setHijos(hijosData);

            if (hijosData.length > 0) {
                setSelectedHijo(hijosData[0]);
            }

            const periodosRes = await API.get('/periodosacademicos');
            const periodosData = periodosRes.data || [];
            setPeriodos(periodosData);

            if (periodosData.length > 0) {
                const periodoActivo = periodosData.find(p => p.estado === 'Activo');
                setSelectedPeriodo(periodoActivo?.idPeriodo || periodosData[0].idPeriodo);
            }
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarNotas = async () => {
        setLoadingNotas(true);
        try {
            const response = await API.get(`/resultados-periodos/estudiante/${selectedHijo.idEstudiante}/periodo/${selectedPeriodo}`);
            const data = response.data || [];
            setNotas(data);

            const aprobadas = data.filter(n => parseFloat(n.notaAcumulada) >= 6).length;
            const reprobadas = data.filter(n => parseFloat(n.notaAcumulada) < 6 && parseFloat(n.notaAcumulada) > 0).length;
            const promedio = data.length > 0 ? data.reduce((s, n) => s + parseFloat(n.notaAcumulada || 0), 0) / data.length : 0;

            setResumen({
                total: data.length,
                aprobadas,
                reprobadas,
                promedio: promedio.toFixed(2)
            });
        } catch (error) {
            mostrarMensaje('Error al cargar notas', 'error');
            setNotas([]);
            setResumen(null);
        } finally {
            setLoadingNotas(false);
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

    const getNotaColor = (nota) => {
        const n = parseFloat(nota);
        if (n >= 9) return '#16a34a';
        if (n >= 7) return '#3b82f6';
        if (n >= 6) return '#e67e22';
        if (n > 0) return '#dc2626';
        return '#94a3b8';
    };

    const getEstadoInfo = (nota) => {
        const n = parseFloat(nota);
        if (n >= 6) return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'Aprobado' };
        if (n > 0) return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', label: 'Reprobado' };
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: 'Sin nota' };
    };

    // ============================================================
    // FILTRADO
    // ============================================================
    const notasFiltradas = useMemo(() => {
        return notas.filter(n => {
            const nota = parseFloat(n.notaAcumulada);
            if (filterEstado === 'aprobadas' && nota < 6) return false;
            if (filterEstado === 'reprobadas' && (nota >= 6 || nota === 0)) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return n.nombreMateria && n.nombreMateria.toLowerCase().includes(term);
            }
            return true;
        });
    }, [notas, filterEstado, busqueda]);

    const filtrosActivos = (filterEstado !== 'todas' ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterEstado('todas');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Notas del Estudiante">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    Cargando notas...
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER SIN HIJOS
    // ============================================================
    if (hijos.length === 0) {
        return (
            <DashboardLayout title="Notas del Estudiante">
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
        <DashboardLayout title="Notas del Estudiante">
            <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* HEADER */}
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>
                        Notas del Estudiante
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                        Consulta las calificaciones por período académico
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

                {/* SELECTORES */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Seleccionar Estudiante y Período</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={S.label}>Estudiante</label>
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

                        <div>
                            <label style={S.label}>Período</label>
                            <select
                                value={selectedPeriodo}
                                onChange={(e) => setSelectedPeriodo(e.target.value)}
                                style={S.select}
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

                {/* INFO DEL HIJO SELECCIONADO */}
                {selectedHijo && (
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
                            </div>
                        </div>
                    </div>
                )}

                {/* RESUMEN */}
                {resumen && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        <div style={{ ...S.statCard, borderTop: '4px solid #1e3a5f' }}>
                            <span style={{ ...S.statNumber, color: '#1e3a5f' }}>{resumen.total}</span>
                            <span style={S.statLabel}>Total Materias</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #16a34a' }}>
                            <span style={{ ...S.statNumber, color: '#16a34a' }}>{resumen.aprobadas}</span>
                            <span style={S.statLabel}>Aprobadas</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #dc2626' }}>
                            <span style={{ ...S.statNumber, color: '#dc2626' }}>{resumen.reprobadas}</span>
                            <span style={S.statLabel}>Reprobadas</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: `4px solid ${getNotaColor(resumen.promedio)}` }}>
                            <span style={{ ...S.statNumber, color: getNotaColor(resumen.promedio) }}>
                                {resumen.promedio}
                            </span>
                            <span style={S.statLabel}>Promedio</span>
                        </div>
                    </div>
                )}

                {/* FILTROS */}
                {notas.length > 0 && (
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
                                    <option value="todas">Todas las materias</option>
                                    <option value="aprobadas">Solo aprobadas</option>
                                    <option value="reprobadas">Solo reprobadas</option>
                                </select>
                            </div>
                            <div>
                                <label style={S.label}>Buscar</label>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre de materia..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    style={S.input}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button style={S.btn} onClick={cargarNotas}>Recargar</button>
                                {filtrosActivos > 0 && (
                                    <button style={S.btn} onClick={limpiarFiltros}>Limpiar Filtros</button>
                                )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                Mostrando <strong>{notasFiltradas.length}</strong> de {notas.length} materias
                            </div>
                        </div>
                    </div>
                )}

                {/* TABLA DE NOTAS */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Detalle de Notas</h3>

                    {loadingNotas ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                            Cargando notas...
                        </div>
                    ) : notas.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>Sin notas registradas</h3>
                            <p style={{ margin: 0, fontSize: '13px' }}>
                                No hay calificaciones registradas para este período.
                            </p>
                        </div>
                    ) : notasFiltradas.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>No hay materias que coincidan</h3>
                            <p style={{ margin: 0, fontSize: '13px' }}>Prueba ajustando los filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...S.th, width: '60px', textAlign: 'center' }}>#</th>
                                        <th style={S.th}>Materia</th>
                                        <th style={{ ...S.th, width: '120px', textAlign: 'center' }}>Nota</th>
                                        <th style={{ ...S.th, width: '140px', textAlign: 'center' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notasFiltradas.map((n, index) => {
                                        const estadoInfo = getEstadoInfo(n.notaAcumulada);
                                        const notaColor = getNotaColor(n.notaAcumulada);
                                        return (
                                            <tr key={index}>
                                                <td style={{ ...S.td, textAlign: 'center', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                    {index + 1}
                                                </td>
                                                <td style={{ ...S.td, fontWeight: 600, color: '#0f172a' }}>
                                                    {n.nombreMateria || 'Sin materia'}
                                                </td>
                                                <td style={{ ...S.td, textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 12px',
                                                        borderRadius: '10px',
                                                        fontSize: '14px',
                                                        fontWeight: 700,
                                                        fontFamily: 'monospace',
                                                        color: notaColor,
                                                        background: '#ffffff',
                                                        border: `2px solid ${notaColor}`
                                                    }}>
                                                        {parseFloat(n.notaAcumulada || 0).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td style={{ ...S.td, textAlign: 'center' }}>
                                                    <span style={{
                                                        ...S.badge,
                                                        backgroundColor: estadoInfo.bg,
                                                        color: estadoInfo.color,
                                                        border: `1px solid ${estadoInfo.border}`
                                                    }}>
                                                        {estadoInfo.label}
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

export default NotasEncargado;