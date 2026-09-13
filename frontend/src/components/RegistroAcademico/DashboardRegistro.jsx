// Componente Dashboard (Registro Académico): muestra estadísticas, gráficos y accesos rápidos del módulo.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardRegistro = () => {
    // Estado con los contadores de aspirantes, estudiantes y datos de gráficas.
    const [stats, setStats] = useState({
        aspirantesPendientes: 0,
        aspirantesPreseleccionados: 0,
        aspirantesAprobados: 0,
        aspirantesRechazados: 0,
        estudiantes: 0,
        totalAspirantes: 0
    });
    const [loading, setLoading] = useState(true);
    const [aspirantesPorMes, setAspirantesPorMes] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');

    // Carga aspirantes, estudiantes y resumen del dashboard al montar el componente.
    useEffect(() => {
        // Cargar periodos y datos iniciales (consolidado por defecto)
        const init = async () => {
            setLoading(true);
            try {
                const [periodosRes] = await Promise.all([
                    API.get('/periodosacademicos')
                ]);
                setPeriodos(periodosRes.data || []);
                await cargarDatos('');
            } catch (err) {
                console.error('Error inicializando dashboard registro:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Cargar datos del dashboard; si periodo === '' utiliza /dashboard/resumen para consolidado,
    // si periodo es un número, calcular promedio del periodo consultando notas por clase.
    const cargarDatos = async (periodo = '') => {
        setLoading(true);
        try {
            const [aspirantesRes, estudiantesRes, dashboardRes] = await Promise.all([
                API.get('/aspirantes'),
                API.get('/estudiantes'),
                API.get('/dashboard/resumen')
            ]);

            const aspirantes = aspirantesRes.data || [];
            const estudiantes = estudiantesRes.data || [];

            const pendientes = aspirantes.filter(a => a.estadoSolicitud === 'Pendiente').length;
            const preseleccionados = aspirantes.filter(a => a.estadoSolicitud === 'En Espera').length;
            const aprobados = aspirantes.filter(a => a.estadoSolicitud === 'Aprobado').length;
            const rechazados = aspirantes.filter(a => a.estadoSolicitud === 'Rechazado').length;

            setStats({
                aspirantesPendientes: pendientes,
                aspirantesPreseleccionados: preseleccionados,
                aspirantesAprobados: aprobados,
                aspirantesRechazados: rechazados,
                estudiantes: estudiantes.filter(e => e.estado).length,
                totalAspirantes: aspirantes.length
            });

            // Datos por mes
            const mesesData = {};
            aspirantes.forEach(a => {
                const mes = new Date(a.fechaSolicitud).getMonth();
                mesesData[mes] = (mesesData[mes] || 0) + 1;
            });
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const dataPorMes = meses.map((m, i) => ({
                nombre: m,
                cantidad: mesesData[i] || 0
            }));
            setAspirantesPorMes(dataPorMes);

            if (!periodo) {
                // consolidado: usar promedio del resumen
                // dashboardRes contiene PromedioGeneral en mayúsculas en este componente's data? usar dashboardRes.data
                // No se muestran en esta vista, pero podemos mantener comportamiento
            } else {
                // calcular promedio del periodo consultando notas por clase
                const clasesRes = await API.get('/clases');
                const clasesList = clasesRes.data || [];
                const notasPromises = clasesList.map(c => API.get(`/resultados-periodos/clase/${c.idClase}/periodo/${periodo}`));
                const notasResults = await Promise.all(notasPromises);
                const allNotas = notasResults.flatMap(r => r.data || []);
                const valores = allNotas.map(n => (n.notaAcumulada ?? n.NotaAcumulada ?? 0));
                const promedio = valores.length ? (valores.reduce((a, b) => a + b, 0) / valores.length) : 0;
                // Podríamos mostrar este promedio en algún card si se requiere; para ahora lo dejamos en consola y en título
                console.log('Promedio periodo', periodo, promedio);
            }

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Colores de las secciones del gráfico de pastel.
    const COLORS = ['#3b82f6', '#e67e22', '#16a34a', '#dc2626'];

    if (loading) {
        return (
            <DashboardLayout title="Dashboard Registro Academico">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Dashboard Registro Academico">
            {/* Selector de Periodo (opcional) */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontWeight: 600 }}>Periodo</label>
                <select value={periodoSeleccionado} onChange={async (e) => { setPeriodoSeleccionado(e.target.value); await cargarDatos(e.target.value); }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd' }}>
                    <option value="">Todos los Periodos</option>
                    {periodos.map(p => (
                        <option key={p.idPeriodo} value={p.idPeriodo}>Periodo {p.numeroPeriodo || p.NumeroPeriodo || p.idPeriodo}</option>
                    ))}
                </select>
                <div style={{ marginLeft: 'auto', fontSize: 13, color: '#555' }}>
                    {periodoSeleccionado ? `Viendo: Periodo ${periodoSeleccionado}` : 'Viendo: Consolidado (4 Periodos)'}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#3b82f6' }}>{stats.aspirantesPendientes}</div>
                    <div className="stat-label">Aspirantes Pendientes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#e67e22' }}>{stats.aspirantesPreseleccionados}</div>
                    <div className="stat-label">Preseleccionados</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#16a34a' }}>{stats.aspirantesAprobados}</div>
                    <div className="stat-label">Aspirantes Aprobados</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#dc2626' }}>{stats.aspirantesRechazados}</div>
                    <div className="stat-label">Aspirantes Rechazados</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#1e3a5f' }}>{stats.estudiantes}</div>
                    <div className="stat-label">Estudiantes Activos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#8b5cf6' }}>{stats.totalAspirantes}</div>
                    <div className="stat-label">Total Aspirantes</div>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3>Estado de Aspirantes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Pendientes', value: stats.aspirantesPendientes },
                                    { name: 'Preseleccionados', value: stats.aspirantesPreseleccionados },
                                    { name: 'Aprobados', value: stats.aspirantesAprobados },
                                    { name: 'Rechazados', value: stats.aspirantesRechazados }
                                ]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {COLORS.map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3>Aspirantes por Mes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={aspirantesPorMes}>
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cantidad" fill="#3b82f6" name="Aspirantes" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card">
                <h3>Acciones Rapidas</h3>
                <div className="actions-grid">
                    <button className="action-btn" onClick={() => window.location.href = '/registro/aspirantes'}>
                        Gestionar Aspirantes
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/registro/matriculas'}>
                        Matriculas
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/registro/estudiantes'}>
                        Gestionar Estudiantes
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/registro/notas'}>
                        Gestionar Notas
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/registro/asistencias'}>
                        Asistencias
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/registro/boletas'}>
                        Boletas y Constancias
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardRegistro;