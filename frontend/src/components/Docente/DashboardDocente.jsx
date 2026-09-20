// Componente DashboardDocente: resumen general del docente con estadísticas, clases del día, avisos y accesos rápidos.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaChalkboardTeacher,
    FaClipboardList,
    FaCalendarCheck,
    FaClock,
    FaUserGraduate,
    FaChartLine,
    FaBell,
    FaFileAlt,
    FaCheckCircle,
    FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import DashboardLayout from '../Layout/DashboardLayout';
import './DashboardDocente.css';

// Componente principal: panel de inicio del docente.
const DashboardDocente = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClases: 0,
        totalEstudiantes: 0,
        materiasAsignadas: 0,
        clasesHoy: 0,
        notasPendientes: 0,
        asistenciasHoy: 0
    });
    const [avisos, setAvisos] = useState([]);
    const [clasesHoy, setClasesHoy] = useState([]);
    const [actividadesRecientes, setActividadesRecientes] = useState([]);

    const getDiaSemana = () => {
        // Coincide con el enum de la BD (sin tildes): Lunes, Martes, Miercoles, Jueves, Viernes, Sabado
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
        return dias[new Date().getDay()];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date)) return '-';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Petición GET con manejo de errores aislado: si falla, devuelve null sin tumbar el resto.
    const safeGet = async (url) => {
        try {
            const res = await API.get(url);
            return res.data;
        } catch (error) {
            console.error(`Error en GET ${url}:`, error);
            return null;
        }
    };

    // Al montar, obtiene estadísticas, horario del día, avisos y actividades recientes del docente.
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Obtener IDs y datos base del docente (cada petición aislada).
                const [docentesData, materiasData, clasesData] = await Promise.all([
                    safeGet('/docentes'),
                    safeGet('/notas/mis-materias'),
                    safeGet('/notas/mis-clases')
                ]);

                const materias = Array.isArray(materiasData) ? materiasData : [];
                const clases = Array.isArray(clasesData) ? clasesData : [];
                const docente = (Array.isArray(docentesData) ? docentesData : [])
                    .find(d => d.codigoDocente === user?.codigo);

                // Horario, avisos y actividades del docente (cada petición aislada).
                const [horariosData, avisosData, actividadesData] = await Promise.all([
                    docente ? safeGet(`/horarios/docente/${docente.idDocente}`) : Promise.resolve(null),
                    safeGet('/avisosinternos/activos'),
                    docente ? safeGet(`/actividades/docente/${docente.idDocente}`) : Promise.resolve(null)
                ]);

                const horarios = (Array.isArray(horariosData) ? horariosData : [])
                    .filter(h => h.diaSemana === getDiaSemana());
                const clasesDeHoy = horarios.map(h => ({
                    horaInicio: (h.horaInicio || '07:00:00').slice(0, 5),
                    horaFin: (h.horaFin || '08:30:00').slice(0, 5),
                    nombreClase: h.clase || 'Clase',
                    nombreMateria: h.materia || '',
                    seccion: h.aula || ''
                }));

                let totalEstudiantes = 0;
                for (const clase of clases) {
                    try {
                        const estudiantesResponse = await API.get(`/estudiantes/clase/${clase.idClase}`);
                        totalEstudiantes += (estudiantesResponse.data || []).length;
                    } catch (e) {
                        console.error('Error obteniendo estudiantes de clase:', e);
                    }
                }

                setStats({
                    totalClases: clases.length,
                    totalEstudiantes: totalEstudiantes,
                    materiasAsignadas: materias.length,
                    clasesHoy: clasesDeHoy.length,
                    notasPendientes: materias.length * 2,
                    asistenciasHoy: 0
                });

                setClasesHoy(clasesDeHoy);
                setAvisos((Array.isArray(avisosData) ? avisosData : []).slice(0, 3).map(a => ({
                    titulo: a.titulo,
                    fecha: a.createdAt,
                    descripcion: a.contenido
                })));
                setActividadesRecientes((Array.isArray(actividadesData) ? actividadesData : []).slice(0, 5).map(a => ({
                    id: a.idActividad,
                    titulo: a.nombreActividad,
                    fecha: a.fechaLimite || a.fechaPublicacion,
                    estado: a.estado || 'Pendiente'
                })));

            } catch (error) {
                console.error('Error cargando dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const quickActions = [
        {
            id: 1,
            titulo: 'Mis Clases',
            descripcion: 'Ver todas tus clases asignadas',
            icon: <FaChalkboardTeacher />,
            color: '#3498db',
            ruta: '/docente/mis-clases'
        },
        {
            id: 2,
            titulo: 'Gestión de Notas',
            descripcion: 'Registrar y gestionar notas de tus materias',
            icon: <FaClipboardList />,
            color: '#27ae60',
            ruta: '/docente/gestion-notas'
        },
        {
            id: 3,
            titulo: 'Asistencias',
            descripcion: 'Registrar asistencias de tus clases',
            icon: <FaCalendarCheck />,
            color: '#f39c12',
            ruta: '/docente/asistencias'
        },
        {
            id: 4,
            titulo: 'Horario',
            descripcion: 'Ver tu horario de clases',
            icon: <FaClock />,
            color: '#9b59b6',
            ruta: '/docente/horario'
        }
    ];

    if (loading) {
        return (
            <DashboardLayout title="Dashboard Docente">
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Cargando dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Dashboard Docente">
            <div className="dashboard-docente">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="header-left">
                        <h1>Bienvenido, {user?.nombres || 'Docente'} </h1>
                        <p className="fecha-actual">
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="header-right">
                        <div className="notificaciones-badge">
                            <FaBell />
                            <span className="badge">{avisos.length}</span>
                        </div>
                        <div className="perfil-info">
                            <span>{user?.nombres?.split(' ')[0]}</span>
                            <img src="/default-avatar.png" alt="Avatar" className="avatar-small" />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#e8f4f8' }}>
                            <FaChalkboardTeacher style={{ color: '#3498db' }} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.totalClases}</h3>
                            <p>Clases Asignadas</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#e8f8f0' }}>
                            <FaUserGraduate style={{ color: '#27ae60' }} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.totalEstudiantes}</h3>
                            <p>Estudiantes</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#fef9e7' }}>
                            <FaClipboardList style={{ color: '#f39c12' }} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.materiasAsignadas}</h3>
                            <p>Materias</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#fdedec' }}>
                            <FaExclamationTriangle style={{ color: '#e74c3c' }} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.notasPendientes}</h3>
                            <p>Notas Pendientes</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h2>Acciones Rápidas</h2>
                    <div className="quick-actions-grid">
                        {quickActions.map((action) => (
                            <div
                                key={action.id}
                                className="quick-action-card"
                                onClick={() => navigate(action.ruta)}
                                style={{ borderLeft: `4px solid ${action.color}` }}
                            >
                                <div className="action-icon" style={{ color: action.color }}>
                                    {action.icon}
                                </div>
                                <div className="action-info">
                                    <h3>{action.titulo}</h3>
                                    <p>{action.descripcion}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="dashboard-two-column">
                    <div className="left-column">
                        <div className="card-section">
                            <h2>
                                <FaClock /> Clases de Hoy
                                <span className="badge-hoy">{clasesHoy.length}</span>
                            </h2>
                            {clasesHoy.length > 0 ? (
                                <div className="clases-hoy-list">
                                    {clasesHoy.map((clase, index) => (
                                        <div key={index} className="clase-item">
                                            <div className="clase-hora">
                                                <span className="hora">{clase.horaInicio || '07:00'}</span>
                                                <span className="hora-fin">{clase.horaFin || '08:30'}</span>
                                            </div>
                                            <div className="clase-info">
                                                <h4>{clase.nombreClase}</h4>
                                                <p>{clase.nombreMateria} • {clase.seccion}</p>
                                            </div>
                                            <div className="clase-estado">
                                                <span className="estado-badge pendiente">Pendiente</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No tienes clases programadas para hoy</p>
                                </div>
                            )}
                        </div>

                        <div className="card-section">
                            <h2>
                                <FaFileAlt /> Actividades Recientes
                            </h2>
                            <div className="actividades-list">
                                {actividadesRecientes.map((actividad) => (
                                    <div key={actividad.id} className="actividad-item">
                                        <div className="actividad-info">
                                            <h4>{actividad.titulo}</h4>
                                            <p>Fecha: {formatDate(actividad.fecha)}</p>
                                        </div>
                                        <div className="actividad-estado">
                                            <span className={`estado-badge ${actividad.estado.toLowerCase()}`}>
                                                {actividad.estado === 'Completado' ? (
                                                    <><FaCheckCircle /> {actividad.estado}</>
                                                ) : (
                                                    <><FaExclamationTriangle /> {actividad.estado}</>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="card-section">
                            <h2>
                                <FaBell /> Avisos Importantes
                            </h2>
                            <div className="avisos-list">
                                {avisos.length > 0 ? (
                                    avisos.map((aviso, index) => (
                                        <div key={index} className="aviso-item">
                                            <div className="aviso-header">
                                                <h4>{aviso.titulo}</h4>
                                                <span className="aviso-fecha">{formatDate(aviso.fecha || new Date())}</span>
                                            </div>
                                            <p>{aviso.descripcion || aviso.contenido || 'Sin descripción'}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No hay avisos importantes</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-section">
                            <h2>
                                <FaChartLine /> Resumen Académico
                            </h2>
                            <div className="resumen-academico">
                                <div className="resumen-item">
                                    <div className="resumen-label">Clases Activas</div>
                                    <div className="resumen-valor">{stats.totalClases}</div>
                                </div>
                                <div className="resumen-item">
                                    <div className="resumen-label">Materias</div>
                                    <div className="resumen-valor">{stats.materiasAsignadas}</div>
                                </div>
                                <div className="resumen-item">
                                    <div className="resumen-label">Estudiantes Totales</div>
                                    <div className="resumen-valor">{stats.totalEstudiantes}</div>
                                </div>
                                <div className="resumen-item">
                                    <div className="resumen-label">Notas Pendientes</div>
                                    <div className="resumen-valor" style={{ color: '#e74c3c' }}>
                                        {stats.notasPendientes}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-section destacado">
                            <div className="gestion-notas-rapida">
                                <div className="gestion-notas-icon">
                                    <FaClipboardList />
                                </div>
                                <div className="gestion-notas-info">
                                    <h3>¿Listo para calificar?</h3>
                                    <p>Accede a la gestión de notas de tus materias</p>
                                    <button
                                        className="btn-gestion-notas"
                                        onClick={() => navigate('/docente/gestion-notas')}
                                    >
                                        Ir a Gestión de Notas →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardDocente;