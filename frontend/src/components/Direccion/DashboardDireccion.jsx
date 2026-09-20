// Componente Dashboard Dirección - MEJORADO
// Muestra estadísticas y gráficas de aspirantes y rendimiento académico.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, CartesianGrid
} from 'recharts';

// Paleta de colores para las gráficas
const COLORS = ['#1e3a5f', '#e67e22', '#16a34a', '#dc2626', '#3b82f6', '#8b5cf6', '#ec489a'];

const DashboardDireccion = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [periodos, setPeriodos] = useState([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
    const [aspirantesPorEspecialidad, setAspirantesPorEspecialidad] = useState([]);
    const [aspirantesPorMes, setAspirantesPorMes] = useState([]);
    const [cuposPorEspecialidad, setCuposPorEspecialidad] = useState([]);

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [periodosRes] = await Promise.all([
                    API.get('/periodosacademicos')
                ]);
                setPeriodos(periodosRes.data || []);
                await cargarResumen('');
            } catch (error) {
                console.error('Error inicializando dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // ============================================================
    // CARGAR RESUMEN
    // ============================================================
    const cargarResumen = async (periodo = '') => {
        setLoading(true);
        try {
            const [especialidad, meses, cupos] = await Promise.all([
                API.get('/dashboard/aspirantes-por-especialidad'),
                API.get('/dashboard/aspirantes-por-mes'),
                API.get('/dashboard/cupos-por-especialidad')
            ]);

            setAspirantesPorEspecialidad(especialidad.data || []);
            setAspirantesPorMes(meses.data || []);
            setCuposPorEspecialidad(cupos.data || []);

            if (!periodo) {
                const resumenRes = await API.get('/dashboard/resumen');
                setDashboardData({ ...resumenRes.data, view: 'consolidado' });
            } else {
                const clasesRes = await API.get('/clases');
                const clasesList = clasesRes.data || [];
                const notasPromises = clasesList.map(c =>
                    API.get(`/resultados-periodos/clase/${c.idClase}/periodo/${periodo}`)
                );
                const notasResults = await Promise.all(notasPromises);
                const allNotas = notasResults.flatMap(r => r.data || []);

                const valores = allNotas.map(n => (n.notaAcumulada ?? n.NotaAcumulada ?? 0));
                const promedio = valores.length
                    ? (valores.reduce((a, b) => a + b, 0) / valores.length)
                    : 0;

                const resumenRes = await API.get('/dashboard/resumen');
                setDashboardData({
                    ...resumenRes.data,
                    promedioGeneral: Math.round(promedio * 100) / 100,
                    view: `periodo-${periodo}`
                });
            }
        } catch (error) {
            console.error('Error cargando resumen por periodo:', error);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const formatearPeriodoLabel = (p) => {
        const numero = p.numeroPeriodo || p.NumeroPeriodo || p.idPeriodo;
        const nombre = p.nombre || `Período ${numero}`;
        return `${nombre} (${p.anioLectivo || ''})`.trim();
    };

    const getPromedioColor = (promedio) => {
        if (promedio >= 8) return '#16a34a';
        if (promedio >= 6) return '#e67e22';
        return '#dc2626';
    };

    const getPeriodoActual = useMemo(() => {
        if (!periodoSeleccionado) return 'Todos los Períodos';
        const p = periodos.find(p => String(p.idPeriodo) === String(periodoSeleccionado));
        return p ? (p.nombre || `Período ${p.numeroPeriodo || p.idPeriodo}`) : `Período ${periodoSeleccionado}`;
    }, [periodoSeleccionado, periodos]);

    // Tooltip personalizado para las gráficas
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,.1)',
                    fontSize: '13px'
                }}>
                    <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ margin: '4px 0 0', color: p.color }}>
                            <strong>{p.name}:</strong> {p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading && !dashboardData) {
        return (
            <DashboardLayout title="Dashboard Dirección">
                <div className="loading">Cargando datos del dashboard...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Dashboard Dirección">
            <style>{`
                .dd-container { display: flex; flex-direction: column; gap: 20px; }
                .dd-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .dd-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 17px; }

                .dd-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
                .dd-header h1 { margin: 0; color: #1e3a5f; font-size: 22px; }
                .dd-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }

                /* Selector de periodo */
                .dd-selector {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 18px;
                    background: #eff6ff;
                    border-radius: 10px;
                    border-left: 4px solid #3b82f6;
                    flex-wrap: wrap;
                }
                .dd-selector label {
                    font-weight: 600;
                    color: #1e40af;
                    font-size: 13px;
                }
                .dd-selector select {
                    padding: 8px 14px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: inherit;
                    background: #fff;
                    min-width: 200px;
                    cursor: pointer;
                    transition: all .2s;
                }
                .dd-selector select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .dd-viewing {
                    margin-left: auto;
                    padding: 6px 14px;
                    background: #fff;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #1d4ed8;
                    border: 1px solid #dbeafe;
                }

                /* Tarjetas de estadísticas */
                .dd-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 14px;
                }
                .dd-stat {
                    background: #fff;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,.06);
                    border: 1px solid #e2e8f0;
                    transition: all .2s;
                    border-top: 4px solid transparent;
                }
                .dd-stat:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,.1);
                }
                .dd-stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .dd-stat-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    font-weight: 600;
                    color: #64748b;
                }
                .dd-stat-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 15px;
                    font-weight: bold;
                    color: #fff;
                }
                .dd-stat-value {
                    font-size: 28px;
                    font-weight: bold;
                    line-height: 1.1;
                    color: #1e293b;
                }
                .dd-stat-sub {
                    font-size: 11px;
                    color: #94a3b8;
                    margin-top: 6px;
                }

                /* Gráficas */
                .dd-charts-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .dd-chart-card {
                    background: #fff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 2px 10px rgba(0,0,0,.06);
                    border: 1px solid #e2e8f0;
                }
                .dd-chart-card h3 {
                    margin: 0 0 16px;
                    color: #1e3a5f;
                    font-size: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .dd-chart-info {
                    text-align: center;
                    font-size: 13px;
                    color: #64748b;
                    margin-top: 8px;
                    padding: 10px;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .dd-chart-info strong {
                    color: #1e3a5f;
                    font-size: 16px;
                }

                .dd-empty-chart {
                    text-align: center;
                    padding: 60px 20px;
                    color: #94a3b8;
                    font-size: 13px;
                }

                @media (max-width: 1024px) {
                    .dd-charts-row { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .dd-stats { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
                    .dd-stat-value { font-size: 22px; }
                    .dd-selector { flex-direction: column; align-items: stretch; }
                    .dd-viewing { margin-left: 0; text-align: center; }
                }
            `}</style>

            <div className="dd-container">
                {/* HEADER */}
                <div className="dd-card">
                    <div className="dd-header">
                        <div>
                            <h1>Panel de Dirección</h1>
                            <p>Resumen general y estadísticas del instituto</p>
                        </div>
                    </div>
                </div>

                {/* SELECTOR DE PERIODO */}
                <div className="dd-selector">
                    <label>Filtrar por período:</label>
                    <select
                        value={periodoSeleccionado}
                        onChange={async (e) => {
                            setPeriodoSeleccionado(e.target.value);
                            await cargarResumen(e.target.value);
                        }}
                    >
                        <option value="">Todos los Períodos (Consolidado)</option>
                        {periodos.map(p => (
                            <option key={p.idPeriodo} value={p.idPeriodo}>
                                {formatearPeriodoLabel(p)}
                            </option>
                        ))}
                    </select>
                    <div className="dd-viewing">
                        {getPeriodoActual}
                    </div>
                </div>

                {/* ESTADÍSTICAS PRINCIPALES */}
                <div className="dd-stats">
                    <div className="dd-stat" style={{ borderTopColor: '#1e3a5f' }}>
                        <div className="dd-stat-header">
                            <span className="dd-stat-label">Estudiantes Activos</span>
                            <div className="dd-stat-icon" style={{ background: '#1e3a5f' }}>E</div>
                        </div>
                        <div className="dd-stat-value">{dashboardData?.totalEstudiantes || 0}</div>
                    </div>

                    <div className="dd-stat" style={{ borderTopColor: '#3b82f6' }}>
                        <div className="dd-stat-header">
                            <span className="dd-stat-label">Docentes</span>
                            <div className="dd-stat-icon" style={{ background: '#3b82f6' }}>D</div>
                        </div>
                        <div className="dd-stat-value">{dashboardData?.totalDocentes || 0}</div>
                    </div>

                    <div className="dd-stat" style={{ borderTopColor: '#8b5cf6' }}>
                        <div className="dd-stat-header">
                            <span className="dd-stat-label">Clases Activas</span>
                            <div className="dd-stat-icon" style={{ background: '#8b5cf6' }}>C</div>
                        </div>
                        <div className="dd-stat-value">{dashboardData?.totalClases || 0}</div>
                    </div>

                    <div className="dd-stat" style={{ borderTopColor: '#e67e22' }}>
                        <div className="dd-stat-header">
                            <span className="dd-stat-label">Aspirantes Pendientes</span>
                            <div className="dd-stat-icon" style={{ background: '#e67e22' }}>P</div>
                        </div>
                        <div className="dd-stat-value" style={{ color: '#e67e22' }}>
                            {dashboardData?.aspirantesPendientes || 0}
                        </div>
                    </div>

                    <div className="dd-stat" style={{ borderTopColor: '#16a34a' }}>
                        <div className="dd-stat-header">
                            <span className="dd-stat-label">Aspirantes Aprobados</span>
                            <div className="dd-stat-icon" style={{ background: '#16a34a' }}>A</div>
                        </div>
                        <div className="dd-stat-value" style={{ color: '#16a34a' }}>
                            {dashboardData?.aspirantesAprobados || 0}
                        </div>
                    </div>

                    <div className="dd-stat" style={{ borderTopColor: getPromedioColor(dashboardData?.promedioGeneral || 0) }}>
                        <div className="dd-stat-header">
                            <span className="dd-stat-label">Promedio General</span>
                            <div className="dd-stat-icon" style={{ background: getPromedioColor(dashboardData?.promedioGeneral || 0) }}>G</div>
                        </div>
                        <div className="dd-stat-value" style={{ color: getPromedioColor(dashboardData?.promedioGeneral || 0) }}>
                            {dashboardData?.promedioGeneral || 0}
                        </div>
                        <div className="dd-stat-sub">{getPeriodoActual}</div>
                    </div>
                </div>

                {/* GRÁFICAS: Aspirantes */}
                <div className="dd-charts-row">
                    <div className="dd-chart-card">
                        <h3>Aspirantes por Especialidad</h3>
                        {aspirantesPorEspecialidad.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={aspirantesPorEspecialidad}
                                        dataKey="cantidad"
                                        nameKey="nombre"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {aspirantesPorEspecialidad.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dd-empty-chart">No hay datos de aspirantes por especialidad</div>
                        )}
                    </div>

                    <div className="dd-chart-card">
                        <h3>Aspirantes por Mes</h3>
                        {aspirantesPorMes.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={aspirantesPorMes}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="nombre" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="cantidad" fill="#1e3a5f" name="Cantidad" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dd-empty-chart">No hay datos de aspirantes por mes</div>
                        )}
                    </div>
                </div>

                {/* GRÁFICAS: Cupos y Rendimiento */}
                <div className="dd-charts-row">
                    <div className="dd-chart-card">
                        <h3>Cupos por Especialidad</h3>
                        {cuposPorEspecialidad.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={cuposPorEspecialidad}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="nombre" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="totales" fill="#1e3a5f" name="Cupos Totales" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="ocupados" fill="#e67e22" name="Cupos Ocupados" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="disponibles" fill="#16a34a" name="Cupos Disponibles" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dd-empty-chart">No hay datos de cupos por especialidad</div>
                        )}
                    </div>

                    <div className="dd-chart-card">
                        <h3>Rendimiento Académico</h3>
                        {((dashboardData?.aprobados || 0) + (dashboardData?.reprobados || 0)) > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Aprobados', value: dashboardData?.aprobados || 0 },
                                                { name: 'Reprobados', value: dashboardData?.reprobados || 0 }
                                            ]}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            <Cell fill="#16a34a" />
                                            <Cell fill="#dc2626" />
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="dd-chart-info">
                                    Promedio General: <strong>{dashboardData?.promedioGeneral || 0}</strong>
                                    <div style={{ fontSize: '11px', marginTop: '4px', color: '#94a3b8' }}>{getPeriodoActual}</div>
                                </div>
                            </>
                        ) : (
                            <div className="dd-empty-chart">No hay datos de rendimiento académico</div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardDireccion;