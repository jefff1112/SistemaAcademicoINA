// Componente MiConducta: consulta las faltas disciplinarias y la calificación de conducta del estudiante.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: resumen y detalle de conducta por período académico.
const MiConducta = () => {
    const [conducta, setConducta] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [periodos, setPeriodos] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (selectedPeriodo) {
            cargarConductaPorPeriodo();
        }
    }, [selectedPeriodo]);

    // Carga los períodos disponibles del estudiante.
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

    // Carga la conducta y puntos de demérito del período seleccionado.
    const cargarConductaPorPeriodo = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudiante = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudiante) {
                const response = await API.get(`/conducta/estudiante/${estudiante.idEstudiante}/periodo/${selectedPeriodo}`);
                const data = response.data || {};
                setConducta(data.conducta || []);
                setResumen({
                    totalPuntos: data.totalPuntos || 0,
                    calificacion: data.calificacion || 'Sin calificar',
                    registroPeriodo: data.registroPeriodo || null
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getGravedadColor = (gravedad) => {
        switch (gravedad) {
            case 'Leve': return '#16a34a';
            case 'Moderada': return '#e67e22';
            case 'Grave': return '#dc2626';
            case 'Muy Grave': return '#7f1d1d';
            default: return '#6b7280';
        }
    };

    // Da formato legible a la fecha/hora del cambio de calificación.
    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-SV', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <DashboardLayout title="Mi Conducta">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mi Conducta">
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
                    <h3>Resumen de Conducta</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{resumen.totalPuntos}</div>
                            <div className="stat-label">Puntos de Demerito</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{
                                color: resumen.registroPeriodo ? '#1d4ed8' : '#6b7280'
                            }}>
                                {resumen.registroPeriodo?.calificacion || 'Sin asignar'}
                            </div>
                            <div className="stat-label">Calificacion Oficial</div>
                        </div>
                    </div>
                    {resumen.registroPeriodo && (
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: '#eff6ff',
                            borderRadius: '8px',
                            fontSize: '14px',
                            lineHeight: '1.5'
                        }}>
                            <strong>Fecha del cambio:</strong> {formatearFecha(resumen.registroPeriodo.fechaCambio)}<br />
                            <strong>Observacion:</strong> {resumen.registroPeriodo.observacion || '-'}
                        </div>
                    )}
                    {resumen && !resumen.registroPeriodo && (
                        <p style={{ color: '#6b7280', marginTop: '0.75rem', fontSize: '13px' }}>
                            Aun no se ha asignado una calificacion oficial por Direccion para este periodo.
                        </p>
                    )}
                </div>
            )}

            {conducta.length > 0 && (
                <div className="card">
                    <h3>Historial de Faltas</h3>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Gravedad</th>
                                    <th>Descripcion</th>
                                    <th>Puntos</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conducta.map((c) => (
                                    <tr key={c.idFaltas}>
                                        <td>{new Date(c.fecha).toLocaleDateString()}</td>
                                        <td>{c.tipo}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getGravedadColor(c.gravedad),
                                                color: '#fff'
                                            }}>
                                                {c.gravedad}
                                            </span>
                                        </td>
                                        <td>{c.descripcion || '-'}</td>
                                        <td>{c.puntosDemerito}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: c.estado === 'Activa' ? '#dcfce7' : '#fee2e2',
                                                color: c.estado === 'Activa' ? '#15803d' : '#b91c1c'
                                            }}>
                                                {c.estado}
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

export default MiConducta;