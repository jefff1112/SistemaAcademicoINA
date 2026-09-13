// Componente Reportes de Inasistencias (Registro Académico): genera y exporta el reporte de ausencias por clase.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const ReportesInasistencias = () => {
    // Estado de clases, estudiantes, filtro de clase y datos del reporte.
    const [clases, setClases] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterClase, setFilterClase] = useState('');
    const [reporteData, setReporteData] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Carga clases y estudiantes al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Al cambiar la clase, regenera el reporte de inasistencias.
    useEffect(() => {
        if (filterClase) {
            generarReporte();
        }
    }, [filterClase]);

    // Obtiene clases y estudiantes en paralelo desde la API.
    const cargarDatos = async () => {
        try {
            const [clasesRes, estudiantesRes] = await Promise.all([
                API.get('/clases'),
                API.get('/estudiantes')
            ]);
            setClases(clasesRes.data || []);
            setEstudiantes(estudiantesRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Muestra un mensaje temporal de éxito o error.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Consulta las asistencias de cada estudiante de la clase y calcula ausencias, tardanzas y porcentaje.
    const generarReporte = async () => {
        if (!filterClase) return;

        try {
            const estudiantesClase = estudiantes.filter(e => e.idClase === parseInt(filterClase));
            const reporte = await Promise.all(estudiantesClase.map(async (e) => {
                const asistenciasRes = await API.get(`/asistencias/estudiante/${e.idEstudiante}/${new Date().getFullYear()}`);
                const asistencias = asistenciasRes.data || [];
                const total = asistencias.length;
                const ausencias = asistencias.filter(a => a.estado === 'Ausente').length;
                const tardanzas = asistencias.filter(a => a.estado === 'Tarde').length;
                const justificadas = asistencias.filter(a => a.estado === 'Justificado').length;
                const porcentaje = total > 0 ? ((total - ausencias) / total * 100).toFixed(2) : 0;

                return {
                    codigo: e.codigoEstudiante,
                    estudiante: `${e.nombres} ${e.apellidos}`,
                    totalDias: total,
                    ausencias: ausencias,
                    tardanzas: tardanzas,
                    justificadas: justificadas,
                    porcentaje: porcentaje,
                    estado: parseFloat(porcentaje) >= 70 ? 'Regular' : 'Irregular'
                };
            }));

            setReporteData(reporte);
        } catch (error) {
            mostrarMensaje('Error al generar reporte', 'error');
        }
    };

    // Exporta el reporte generado a un archivo Excel.
    const exportarExcel = () => {
        if (reporteData.length === 0) {
            mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }

        const data = reporteData.map(r => ({
            'Codigo': r.codigo,
            'Estudiante': r.estudiante,
            'Total Dias': r.totalDias,
            'Ausencias': r.ausencias,
            'Tardanzas': r.tardanzas,
            'Justificadas': r.justificadas,
            'Porcentaje': `${r.porcentaje}%`,
            'Estado': r.estado
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inasistencias');
        XLSX.writeFile(wb, `reporte_inasistencias_${new Date().toISOString().split('T')[0]}.xlsx`);
        mostrarMensaje('Reporte exportado', 'success');
    };

    if (loading) {
        return (
            <DashboardLayout title="Reportes de Inasistencias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Reportes de Inasistencias - Registro Academico">
            {message && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
                    color: messageType === 'success' ? '#15803d' : '#b91c1c'
                }}>
                    {message}
                </div>
            )}

            <div className="card">
                <h3>Seleccionar Clase</h3>
                <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <select
                            value={filterClase}
                            onChange={(e) => setFilterClase(e.target.value)}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            <option value="">Seleccionar Clase</option>
                            {clases.map(c => (
                                <option key={c.idClase} value={c.idClase}>
                                    {c.nombreClase}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 0 }}>
                        <button className="btn-success" onClick={exportarExcel} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            Exportar Excel
                        </button>
                    </div>
                </div>
            </div>

            {reporteData.length > 0 && (
                <div className="card">
                    <h3>Reporte de Inasistencias</h3>
                    <div className="table-responsive">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Codigo</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estudiante</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Total Dias</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Ausencias</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Tardanzas</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Justificadas</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Porcentaje</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reporteData.map((r, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{index + 1}</td>
                                        <td style={{ padding: '8px' }}>{r.codigo}</td>
                                        <td style={{ padding: '8px' }}>{r.estudiante}</td>
                                        <td style={{ padding: '8px' }}>{r.totalDias}</td>
                                        <td style={{ padding: '8px', color: '#dc2626' }}>{r.ausencias}</td>
                                        <td style={{ padding: '8px', color: '#e67e22' }}>{r.tardanzas}</td>
                                        <td style={{ padding: '8px', color: '#3b82f6' }}>{r.justificadas}</td>
                                        <td style={{ padding: '8px' }}>{r.porcentaje}%</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: r.estado === 'Regular' ? '#dcfce7' : '#fee2e2',
                                                color: r.estado === 'Regular' ? '#15803d' : '#b91c1c'
                                            }}>
                                                {r.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ReportesInasistencias;