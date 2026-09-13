// Componente MisAsistencias: consulta el detalle y el resumen de asistencias del estudiante.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: resumen estadístico y detalle de asistencias por período.
const MisAsistencias = () => {
    const [asistencias, setAsistencias] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [periodos, setPeriodos] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (selectedPeriodo) {
            cargarAsistenciasPorPeriodo();
        }
    }, [selectedPeriodo]);

    // Carga los períodos disponibles para el filtro.
    const cargarDatos = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudiante = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudiante) {
                const periodosRes = await API.get('/periodosacademicos');
                setPeriodos(periodosRes.data || []);

                if (periodosRes.data.length > 0) {
                    setSelectedPeriodo(periodosRes.data[0].idPeriodo);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Carga las asistencias del año en curso y calcula el resumen por estado.
    const cargarAsistenciasPorPeriodo = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudiante = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudiante) {
                const response = await API.get(`/asistencias/estudiante/${estudiante.idEstudiante}/${new Date().getFullYear()}`);
                const data = response.data || [];
                setAsistencias(data);

                const total = data.length;
                const presentes = data.filter(a => a.estado === 'Presente').length;
                const ausencias = data.filter(a => a.estado === 'Ausente').length;
                const tardanzas = data.filter(a => a.estado === 'Tarde').length;
                const justificadas = data.filter(a => a.estado === 'Justificado').length;
                const porcentaje = total > 0 ? ((presentes + tardanzas) / total * 100).toFixed(2) : 0;

                setResumen({ total, presentes, ausencias, tardanzas, justificadas, porcentaje });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Presente': return '#16a34a';
            case 'Ausente': return '#dc2626';
            case 'Tarde': return '#e67e22';
            case 'Justificado': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Mis Asistencias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mis Asistencias">
            <div className="card">
                <h3>Seleccionar Periodo</h3>
                <div className="form-group">
                    <select
                        value={selectedPeriodo}
                        onChange={(e) => setSelectedPeriodo(e.target.value)}
                        className="form-control"
                        style={{ maxWidth: '300px' }}
                    >
                        {periodos.map((p) => (
                            <option key={p.idPeriodo} value={p.idPeriodo}>
                                {p.nombre} - {p.anioLectivo}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {resumen && (
                <div className="card">
                    <h3>Resumen de Asistencias</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{resumen.total}</div>
                            <div className="stat-label">Total Dias</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#16a34a' }}>{resumen.presentes}</div>
                            <div className="stat-label">Presentes</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#dc2626' }}>{resumen.ausencias}</div>
                            <div className="stat-label">Ausencias</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#e67e22' }}>{resumen.tardanzas}</div>
                            <div className="stat-label">Tardanzas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#3b82f6' }}>{resumen.justificadas}</div>
                            <div className="stat-label">Justificadas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#1e3a5f' }}>{resumen.porcentaje}%</div>
                            <div className="stat-label">Porcentaje Asistencia</div>
                        </div>
                    </div>
                </div>
            )}

            {asistencias.length > 0 && (
                <div className="card">
                    <h3>Detalle de Asistencias</h3>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Hora</th>
                                    <th>Minutos Tarde</th>
                                    <th>Justificacion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {asistencias.map((a, index) => (
                                    <tr key={index}>
                                        <td>{new Date(a.fecha).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getEstadoColor(a.estado),
                                                color: '#fff'
                                            }}>
                                                {a.estado}
                                            </span>
                                        </td>
                                        <td>{a.horaRegistro ? new Date(a.horaRegistro).toLocaleTimeString() : '-'}</td>
                                        <td>{a.minutosTarde || 0}</td>
                                        <td>{a.justificacion || '-'}</td>
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

export default MisAsistencias;