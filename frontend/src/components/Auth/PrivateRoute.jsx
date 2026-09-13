// Componente PrivateRoute: protege rutas privadas y muestra el dashboard correspondiente al rol del usuario.
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Importar todos los Dashboards
import DashboardAdmin from '../Admin/DashboardAdmin';
import DashboardDireccion from '../Direccion/DashboardDireccion';
import DashboardRegistro from '../RegistroAcademico/DashboardRegistro';
import DashboardDocente from '../Docente/DashboardDocente';
import DashboardEstudiante from '../Estudiante/DashboardEstudiante';
import DashboardEncargado from '../Encargado/DashboardEncargado';

// Componente principal: valida la sesión activa y selecciona el dashboard por rol.
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />;
    }

    // Si la ruta tiene children (ej: /direccion/gestion-aspirantes), mostrar children
    if (children) {
        return children;
    }

    // Si no hay children (ej: /dashboard), mostrar el dashboard según el rol
    const rol = user?.rol;
    const codigo = user?.codigo;

    // Administrador
    if (rol === 'Administrador' || codigo === 'admin') {
        return <DashboardAdmin />;
    }

    // Direccion
    if (rol === 'Direccion' || rol === 'Director' || codigo === 'DIR001') {
        return <DashboardDireccion />;
    }

    // Registro Academico
    if (rol === 'Registro Academico' || rol === 'Registro_Academico' || codigo === 'REG001') {
        return <DashboardRegistro />;
    }

    // Docente
    if (rol === 'Docente' || codigo === 'DOC001') {
        return <DashboardDocente />;
    }

    // Estudiante
    if (rol === 'Estudiante' || codigo === '2026-00001-INA') {
        return <DashboardEstudiante />;
    }

    // Encargado
    if (rol === 'Encargado' || codigo === 'ENC001') {
        return <DashboardEncargado />;
    }

    // Fallback - si no se reconoce el rol
    return <DashboardAdmin />;
};

export default PrivateRoute;