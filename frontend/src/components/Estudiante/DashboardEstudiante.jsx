// Componente DashboardEstudiante: resumen de rendimiento, asistencia y avisos del estudiante.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: panel de inicio del estudiante con estadísticas y accesos rápidos.
const DashboardEstudiante = () => {
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

    // Carga las notas, asistencias y avisos del estudiante al montar el componente.
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        cargarDatos(userData);
    }, []);

    // Consulta la API para obtener estadísticas académicas y avisos del estudiante.
    const cargarDatos = async (userData) => {
        try {
            // Buscar estudiante por código
            const estudiantesRes = await API.get('/estudiantes');
            const estudianteData = estudiantesRes.data.find(e => e.codigoEstudiante === userData?.codigo);

            if (estudianteData) {
                setEstudiante(estudianteData);

                // Cargar notas finales
                const notasRes = await API.get(`/reportes/notas-estudiante/${estudianteData.idEstudiante}/${new Date().getFullYear()}`);
                const notasData = notasRes.data || {};

                // Cargar asistencias
                const asistenciasRes = await API.get(`/reportes/asistencias-estudiante/${estudianteData.idEstudiante}/${new Date().getFullYear()}`);
                const asistenciasData = asistenciasRes.data || {};

                setStats({
                    promedioGeneral: notasData.promedioGeneral || 0,
                    porcentajeAsistencia: asistenciasData.porcentajeAsistencia || 0,
                    materiasAprobadas: notasData.materiasAprobadas || 0,
                    materiasReprobadas: notasData.materiasReprobadas || 0
                });

                // Cargar avisos internos
                const avisosRes = await API.get('/avisosinternos/activos');
                setAvisos(avisosRes.data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Dashboard Estudiante">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Dashboard Estudiante">
            <div className="welcome-card">
                <h2>Bienvenido, {estudiante?.nombres || 'Estudiante'}</h2>
                <p>{estudiante?.codigoEstudiante}</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#3b82f6' }}>{stats.promedioGeneral}</div>
                    <div className="stat-label">Promedio General</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#16a34a' }}>{stats.porcentajeAsistencia}%</div>
                    <div className="stat-label">Asistencia</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#16a34a' }}>{stats.materiasAprobadas}</div>
                    <div className="stat-label">Materias Aprobadas</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#dc2626' }}>{stats.materiasReprobadas}</div>
                    <div className="stat-label">Materias Reprobadas</div>
                </div>
            </div>

            {avisos.length > 0 && (
                <div className="card">
                    <h3>Avisos Importantes</h3>
                    {avisos.map((aviso) => (
                        <div key={aviso.idAviso} style={{
                            padding: '10px 14px',
                            marginBottom: '8px',
                            background: aviso.prioridad === 'alta' ? '#fee2e2' : '#f8fafc',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${aviso.prioridad === 'alta' ? '#dc2626' : '#3b82f6'}`
                        }}>
                            <strong>{aviso.titulo}</strong>
                            <p style={{ margin: '4px 0', fontSize: '14px', color: '#4b5563' }}>{aviso.contenido}</p>
                            <small style={{ color: '#9ca3af' }}>{new Date(aviso.createdAt).toLocaleDateString()}</small>
                        </div>
                    ))}
                </div>
            )}

            <div className="card">
                <h3>Acciones Rapidas</h3>
                <div className="actions-grid">
                    <button className="action-btn" onClick={() => window.location.href = '/estudiante/notas'}>
                        Ver Notas
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/estudiante/actividades'}>
                        Mis Actividades
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/estudiante/asistencias'}>
                        Asistencias
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/estudiante/horario'}>
                        Mi Horario
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardEstudiante;