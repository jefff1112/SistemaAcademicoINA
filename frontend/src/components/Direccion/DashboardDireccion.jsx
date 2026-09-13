// Componente Dashboard Dirección: muestra estadísticas y gráficas de aspirantes y rendimiento académico.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// Paleta de colores para las gráficas del dashboard.
const COLORS = ['#1e3a5f', '#e67e22', '#16a34a', '#dc2626', '#3b82f6', '#8b5cf6', '#ec489a'];

// Componente principal: panel de dirección con indicadores y gráficas comparativas.
const DashboardDireccion = () => {
    // Estados: carga, resumen general, periodo seleccionado y datos de las gráficas de aspirantes y cupos.
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [periodos, setPeriodos] = useState([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
    const [aspirantesPorEspecialidad, setAspirantesPorEspecialidad] = useState([]);
    const [aspirantesPorMes, setAspirantesPorMes] = useState([]);
    const [cuposPorEspecialidad, setCuposPorEspecialidad] = useState([]);

    // Carga en paralelo el resumen y los datos de las gráficas al montar el componente.
    useEffect(() => {
        // Al montar, cargamos periodos y el resumen por defecto (Todos los Periodos = consolidado)
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

    // Carga el resumen del dashboard. Si periodo === '' muestra consolidado (4 periodos),
    // si periodo es un número, calcula el promedio para ese periodo.
    const cargarResumen = async (periodo = '') => {
        setLoading(true);
        try {
            // Siempre traer datos de aspirantes y cupos para las gráficas.
            const [especialidad, meses, cupos] = await Promise.all([
                API.get('/dashboard/aspirantes-por-especialidad'),
                API.get('/dashboard/aspirantes-por-mes'),
                API.get('/dashboard/cupos-por-especialidad')
            ]);

            setAspirantesPorEspecialidad(especialidad.data || []);
            setAspirantesPorMes(meses.data || []);
            setCuposPorEspecialidad(cupos.data || []);

            if (!periodo) {
                // Consolidado: usar endpoint existente
                const resumenRes = await API.get('/dashboard/resumen');
                setDashboardData({ ...resumenRes.data, view: 'consolidado' });
            } else {
                // Periodo específico: calcular promedio consultando notas por clase
                const clasesRes = await API.get('/clases');
                const clasesList = clasesRes.data || [];
                // Obtener notas de cada clase para el periodo seleccionado
                const notasPromises = clasesList.map(c => API.get(`/resultados-periodos/clase/${c.idClase}/periodo/${periodo}`));
                const notasResults = await Promise.all(notasPromises);
                const allNotas = notasResults.flatMap(r => r.data || []);

                // Promedio general del periodo
                const valores = allNotas.map(n => (n.notaAcumulada ?? n.NotaAcumulada ?? 0));
                const promedio = valores.length ? (valores.reduce((a, b) => a + b, 0) / valores.length) : 0;

                // Mantener otros indicadores del dashboard basados en resumen consolidado (no dependen de periodo)
                const resumenRes = await API.get('/dashboard/resumen');
                setDashboardData({ ...resumenRes.data, promedioGeneral: Math.round(promedio * 100) / 100, view: `periodo-${periodo}` });
            }
        } catch (error) {
            console.error('Error cargando resumen por periodo:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Dashboard Direccion">
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Cargando datos...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Dashboard Direccion">
            {/* Selector de Periodo (opcional) */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontWeight: 600 }}>Periodo</label>
                <select value={periodoSeleccionado} onChange={async (e) => { setPeriodoSeleccionado(e.target.value); await cargarResumen(e.target.value); }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd' }}>
                    <option value="">Todos los Periodos</option>
                    {periodos.map(p => (
                        <option key={p.idPeriodo} value={p.idPeriodo}>Periodo {p.numeroPeriodo || p.NumeroPeriodo || p.idPeriodo}</option>
                    ))}
                </select>
                <div style={{ marginLeft: 'auto', fontSize: 13, color: '#555' }}>
                    {dashboardData?.view === 'consolidado' || !dashboardData?.view ? 'Viendo: Consolidado (4 Periodos)' : `Viendo: Periodo ${periodoSeleccionado}`}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{dashboardData?.totalEstudiantes || 0}</div>
                    <div className="stat-label">Estudiantes Activos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{dashboardData?.totalDocentes || 0}</div>
                    <div className="stat-label">Docentes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{dashboardData?.totalClases || 0}</div>
                    <div className="stat-label">Clases</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#3b82f6' }}>{dashboardData?.aspirantesPendientes || 0}</div>
                    <div className="stat-label">Aspirantes Pendientes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#16a34a' }}>{dashboardData?.aspirantesAprobados || 0}</div>
                    <div className="stat-label">Aspirantes Aprobados</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#1e3a5f' }}>{dashboardData?.promedioGeneral || 0}</div>
                    <div className="stat-label">Promedio General</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{dashboardData?.view === 'consolidado' || !dashboardData?.view ? 'Consolidado (4 Periodos)' : `Periodo ${periodoSeleccionado}`}</div>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3>Aspirantes por Especialidad</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={aspirantesPorEspecialidad} dataKey="cantidad" nameKey="nombre" cx="50%" cy="50%" outerRadius={100} label>
                                {aspirantesPorEspecialidad.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip /><Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3>Aspirantes por Mes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={aspirantesPorMes}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" /><YAxis /><Tooltip /><Legend />
                            <Bar dataKey="cantidad" fill="#1e3a5f" name="Cantidad" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3>Cupos por Especialidad</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cuposPorEspecialidad}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" /><YAxis /><Tooltip /><Legend />
                            <Bar dataKey="totales" fill="#1e3a5f" name="Cupos Totales" />
                            <Bar dataKey="ocupados" fill="#e67e22" name="Cupos Ocupados" />
                            <Bar dataKey="disponibles" fill="#16a34a" name="Cupos Disponibles" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3>Rendimiento Academico</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={[{ name: 'Aprobados', value: dashboardData?.aprobados || 0 }, { name: 'Reprobados', value: dashboardData?.reprobados || 0 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                <Cell fill="#16a34a" /><Cell fill="#dc2626" />
                            </Pie>
                            <Tooltip /><Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    <p className="chart-info">Promedio General: {dashboardData?.promedioGeneral || 0}</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardDireccion;