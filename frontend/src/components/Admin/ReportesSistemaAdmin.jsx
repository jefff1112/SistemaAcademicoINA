// Componente Reportes del Sistema (Admin): lista los reportes disponibles y permite generarlos.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: muestra los reportes del sistema y dispara su generación.
const ReportesSistemaAdmin = () => {
    // Estados: lista de reportes e indicador de carga.
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Carga los reportes disponibles al montar el componente.
    useEffect(() => {
        cargarReportes();
    }, []);

    // Obtiene la lista de reportes del sistema desde la API.
    const cargarReportes = async () => {
        try {
            // Petición GET /reportessistema para listar los reportes disponibles.
            const response = await API.get('/reportessistema');
            setReportes(response.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Genera el reporte seleccionado consultando su detalle en el backend.
    const generarReporte = async (id) => {
        try {
            // Petición GET /reportessistema/{id} para generar el reporte.
            const response = await API.get(`/reportessistema/${id}`);
            alert(`Reporte generado: ${response.data.nombre}`);
        } catch (error) {
            alert('Error al generar reporte');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Reportes del Sistema">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Reportes del Sistema">
            <div className="card">
                <h3>Reportes Disponibles</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripcion</th>
                                <th>Ultima Generacion</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportes.map(r => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td>{r.nombre}</td>
                                    <td>{r.descripcion}</td>
                                    <td>{new Date(r.fecha).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn-primary" onClick={() => generarReporte(r.id)}>Generar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReportesSistemaAdmin;