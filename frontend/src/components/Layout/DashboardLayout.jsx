// Componente DashboardLayout: estructura principal del panel (sidebar con menú por rol, topbar y contenido).
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificacionesCampanita from './NotificacionesCampanita';

const DashboardLayout = ({ children, title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getMenuItems = () => {
        const rol = user?.rol;
        const codigo = user?.codigo;

        // ========== ADMINISTRADOR ==========
        if (rol === 'Administrador' || codigo === 'admin') {
            return [
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Gestionar Usuarios', path: '/admin/usuarios' },
                { label: 'Gestionar Roles', path: '/admin/roles' },
                { label: 'Configuracion General', path: '/admin/configuracion' },
                { label: 'Auditoria', path: '/admin/auditoria' },
                { label: 'Respaldos', path: '/admin/respaldos' },
                { label: 'Reportes del Sistema', path: '/admin/reportes' },
                { label: 'Notificaciones', path: '/admin/notificaciones' },
                { label: 'Carga Masiva Aspirantes', path: '/admin/carga-masiva' },
                { label: 'Gestionar Materias', path: '/admin/materias' },
                { label: 'Gestionar Grados', path: '/admin/grados' },
                { label: 'Gestionar Especialidades', path: '/admin/especialidades' },
                { label: 'Gestionar Secciones', path: '/admin/secciones' },
                { label: 'Gestionar Periodos', path: '/admin/periodos' },
                { label: 'Constancias', path: '/admin/constancias' },
                { label: 'Título en Proceso', path: '/titulo-en-proceso' },
                { label: 'Contenido Público', path: '/admin/contenido-publico' },
            ];
        }

        // ========== DIRECCION ==========
        if (rol === 'Direccion' || rol === 'Director' || codigo === 'DIR001') {
            return [
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Gestionar Aspirantes', path: '/direccion/gestion-aspirantes' },
                { label: 'Gestionar Estudiantes', path: '/direccion/estudiantes' },
                { label: 'Gestionar Docentes', path: '/direccion/docentes' },
                { label: 'Gestionar Clases', path: '/direccion/clases' },
                { label: 'Gestionar Materias', path: '/direccion/materias' },
                { label: 'Módulos por Especialidad', path: '/modulos-especialidad' },
                { label: 'Asignar Módulos a Docentes', path: '/asignar-modulos' },
                { label: 'Gestionar Notas', path: '/direccion/cuadro-auxiliar' },
                { label: 'Gestionar Asistencias', path: '/direccion/asistencias' },
                { label: 'Gestionar Conducta', path: '/direccion/conducta' },
                { label: 'Gestionar Periodos', path: '/direccion/periodos' },
                { label: 'Reportes Avanzados', path: '/direccion/reportes-avanzados' },
                { label: 'Auditoria', path: '/direccion/auditoria' },
                { label: 'Avisos', path: '/direccion/avisos' },
                { label: 'Entrevistas', path: '/direccion/entrevistas' },
                { label: 'Constancias', path: '/direccion/constancias' },
                { label: 'Reportes de Datos', path: '/direccion/reportes-datos' },
                { label: 'Activaciones Pendientes', path: '/direccion/activaciones-pendientes' },
                { label: 'Título en Proceso', path: '/titulo-en-proceso' },
                { label: 'Notificaciones', path: '/admin/notificaciones' },
                { label: 'Exportar Boletas', path: '/direccion/exportar-boletas' },
                { label: 'Boleta de Notas', path: '/direccion/boleta-notas' },
                { label: 'Contenido Público', path: '/direccion/contenido-publico' },
            ];
        }

        // ========== REGISTRO ACADEMICO ==========
        if (rol === 'Registro Academico' || rol === 'Registro_Academico' || codigo === 'REG001') {
            return [
                { label: 'Dashboard', path: '/registro/dashboard' },
                { label: 'Gestionar Aspirantes', path: '/registro/aspirantes' },
                { label: 'Matriculas', path: '/registro/matriculas' },
                { label: 'Gestionar Estudiantes', path: '/registro/estudiantes' },
                { label: 'Gestionar Especialidades', path: '/registro/especialidades' },
                { label: 'Gestionar Materias', path: '/registro/materias' },
                { label: 'Módulos por Especialidad', path: '/modulos-especialidad' },
                { label: 'Asignar Módulos a Docentes', path: '/asignar-modulos' },
                { label: 'Gestionar Notas', path: '/registro/cuadro-auxiliar' },
                { label: 'Importacion de Notas', path: '/registro/importar-notas' },
                { label: 'Gestionar Asistencias', path: '/registro/asistencias' },
                { label: 'Gestionar Conducta', path: '/registro/conducta' },
                { label: 'Boletas de Notas', path: '/registro/boletas' },
                { label: 'Constancias', path: '/registro/constancias' },
                { label: 'Reportes de Datos', path: '/registro/reportes-datos' },
                { label: 'Activaciones Pendientes', path: '/registro/activaciones-pendientes' },
                { label: 'Certificados de Promocion', path: '/registro/certificados' },
                { label: 'Publicacion de Resultados', path: '/registro/resultados' },
                { label: 'Documentos de Estudiantes', path: '/registro/documentos' },
                { label: 'Historial Academico', path: '/registro/historial' },
                { label: 'Reportes de Inasistencias', path: '/registro/reportes-inasistencias' },
                { label: 'Exportar Boletas', path: '/registro/exportar-boletas' },
                { label: 'Título en Proceso', path: '/titulo-en-proceso' },
            ];
        }

        // ========== DOCENTE ==========
        if (rol === 'Docente' || codigo === 'DOC001') {
            return [
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Mis Clases', path: '/docente/mis-clases' },
                { label: 'Cuadro de Notas', path: '/docente/cuadro-auxiliar' },
                { label: 'Asistencias', path: '/docente/asistencias' },
                { label: 'Mi Horario', path: '/docente/horario' },
                { label: 'Actividades', path: '/docente/actividades' },
                { label: 'Conducta', path: '/docente/conducta' },
                { label: 'Avisos', path: '/docente/avisos' },
                { label: 'Mi Perfil', path: '/perfil' },
            ];
        }

        // ========== ESTUDIANTE ==========
        if (rol === 'Estudiante' || codigo === '2026-00001-INA') {
            return [
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Mis Notas', path: '/estudiante/notas' },
                { label: 'Mis Asistencias', path: '/estudiante/asistencias' },
                { label: 'Mi Horario', path: '/estudiante/horario' },
                { label: 'Mi Conducta', path: '/estudiante/conducta' },
                { label: 'Historial Academico', path: '/estudiante/historial' },
                { label: 'Constancias', path: '/estudiante/constancias' },
                { label: 'Mi Perfil', path: '/perfil' },
            ];
        }

        // ========== ENCARGADO ==========
        if (rol === 'Encargado' || codigo === 'ENC001') {
            return [
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Notas de mi Hijo', path: '/encargado/notas' },
                { label: 'Asistencias', path: '/encargado/asistencias' },
                { label: 'Conducta', path: '/encargado/conducta' },   // ✅ NUEVO
                { label: 'Mi Perfil', path: '/perfil' },
            ];
        }

        // ========== SUBDIRECTOR ==========
        if (rol === 'Sub Director' || codigo === 'SUBDIR001') {
            return [
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Gestionar Aspirantes', path: '/direccion/gestion-aspirantes' },
                { label: 'Gestionar Estudiantes', path: '/direccion/estudiantes' },
                { label: 'Gestionar Docentes', path: '/direccion/docentes' },
                { label: 'Gestionar Clases', path: '/direccion/clases' },
                { label: 'Gestionar Notas', path: '/direccion/cuadro-auxiliar' },
                { label: 'Gestionar Asistencias', path: '/direccion/asistencias' },
                { label: 'Gestionar Conducta', path: '/direccion/conducta' },
                { label: 'Reportes', path: '/direccion/reportes-avanzados' },
                { label: 'Auditoria', path: '/direccion/auditoria' },
                { label: 'Avisos', path: '/direccion/avisos' },
                { label: 'Periodos Academicos', path: '/direccion/periodos' },
                { label: 'Constancias', path: '/direccion/constancias' },
                { label: 'Título en Proceso', path: '/titulo-en-proceso' },
                { label: 'Boleta de Notas', path: '/direccion/boleta-notas' },
                { label: 'Contenido Público', path: '/direccion/contenido-publico' },
                { label: 'Mi Perfil', path: '/perfil' },
            ];
        }

        // ========== COORDINADOR ==========
        if (rol === 'Coordinador' || codigo === 'COORD001') {
            return [
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Mi Perfil', path: '/perfil' },
            ];
        }

        // Fallback
        return [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Mi Perfil', path: '/perfil' },
        ];
    };

    const menuItems = getMenuItems();

    return (
        <div className="dashboard-layout">
            <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <h2>INA</h2>
                    </div>
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <div className="user-info-sidebar">
                    <div className="user-avatar">👤</div>
                    <div className="user-details">
                        <strong>{user?.nombres} {user?.apellidos}</strong>
                        <span>{user?.rol}</span>
                        <small>{user?.codigo}</small>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className={`main-content-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="dashboard-topbar">
                    <div className="page-title">
                        <h1>{title}</h1>
                    </div>
                    <div className="topbar-actions">
                        <NotificacionesCampanita />
                        <div className="user-menu">
                            <span className="user-name">{user?.nombres} {user?.apellidos}</span>
                            <span className="user-role">{user?.rol}</span>
                        </div>
                        <button onClick={handleLogout} className="logout-topbar-btn">
                            Cerrar Sesion
                        </button>
                    </div>
                </div>
                <div className="dashboard-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;