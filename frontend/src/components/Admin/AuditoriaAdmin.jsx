// Componente Auditoría Admin: consulta el registro de actividades realizadas en el sistema.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: muestra la tabla de auditoría dentro del layout de dashboard.
const AuditoriaAdmin = () => {
    const [auditoria, setAuditoria] = useState([]);
    const [loading, setLoading] = useState(true);

    // Carga el registro de auditoría al montar el componente.
    useEffect(() => {
        cargarAuditoria();
    }, []);

    // Obtiene la lista de actividades de auditoría desde el backend.
    const cargarAuditoria = async () => {
        try {
            // Petición GET al endpoint /auditoria para listar las actividades.
            const response = await API.get('/auditoria');
            setAuditoria(response.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Auditoria">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Auditoria del Sistema">
            <div className="card">
                <h3>Registro de Actividades</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Accion</th>
                                <th>Usuario</th>
                                <th>Fecha</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditoria.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.accion}</td>
                                    <td>{item.usuario}</td>
                                    <td>{new Date(item.fecha).toLocaleString()}</td>
                                    <td>{item.detalle}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AuditoriaAdmin;