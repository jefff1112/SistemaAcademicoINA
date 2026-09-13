// Componente HistorialAcademico: muestra el resumen académico del estudiante por año lectivo.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: tabla de promedios y estados por año.
const HistorialAcademico = () => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarHistorial();
    }, []);

    // Carga las inscripciones del estudiante y sus notas por cada año lectivo.
    const cargarHistorial = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudiante = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudiante) {
                const response = await API.get(`/inscripciones/estudiante/${estudiante.idEstudiante}`);
                const inscripciones = response.data || [];

                const historialData = await Promise.all(inscripciones.map(async (ins) => {
                    const notasRes = await API.get(`/reportes/notas-estudiante/${estudiante.idEstudiante}/${ins.anioLectivo}`);
                    const notas = notasRes.data || {};
                    return {
                        anio: ins.anioLectivo,
                        clase: ins.clase?.nombreClase || 'Sin clase',
                        promedio: notas.promedioGeneral || 0,
                        aprobadas: notas.materiasAprobadas || 0,
                        reprobadas: notas.materiasReprobadas || 0,
                        estado: notas.promedioGeneral >= 6 ? 'Aprobado' : 'Reprobado'
                    };
                }));
                setHistorial(historialData.reverse());
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Historial Academico">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Historial Academico">
            <div className="card">
                <h3>Resumen Academico por Año</h3>
                {historial.length === 0 ? (
                    <p>No hay historial academico disponible.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Año</th>
                                    <th>Clase</th>
                                    <th>Promedio</th>
                                    <th>Aprobadas</th>
                                    <th>Reprobadas</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map((h, index) => (
                                    <tr key={index}>
                                        <td><strong>{h.anio}</strong></td>
                                        <td>{h.clase}</td>
                                        <td>{h.promedio}</td>
                                        <td style={{ color: '#16a34a' }}>{h.aprobadas}</td>
                                        <td style={{ color: '#dc2626' }}>{h.reprobadas}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: h.estado === 'Aprobado' ? '#dcfce7' : '#fee2e2',
                                                color: h.estado === 'Aprobado' ? '#15803d' : '#b91c1c'
                                            }}>
                                                {h.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default HistorialAcademico;