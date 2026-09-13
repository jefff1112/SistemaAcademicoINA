// Componente MisFaltas: consulta las faltas disciplinarias del estudiante con resumen por gravedad.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: historial de faltas filtrable por gravedad.
const MisFaltas = () => {
    const [faltas, setFaltas] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterGravedad, setFilterGravedad] = useState('todos');

    useEffect(() => {
        cargarFaltas();
    }, []);

    // Carga las faltas y su resumen desde la API.
    const cargarFaltas = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudiante = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudiante) {
                const [faltasRes, resumenRes] = await Promise.all([
                    API.get(`/faltas/estudiante/${estudiante.idEstudiante}`),
                    API.get(`/faltas/resumen/estudiante/${estudiante.idEstudiante}`)
                ]);
                setFaltas(faltasRes.data || []);
                setResumen(resumenRes.data || {});
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const faltasFiltradas = faltas.filter(f => {
        if (filterGravedad === 'todos') return true;
        return f.gravedad === filterGravedad;
    });

    const getGravedadColor = (gravedad) => {
        switch (gravedad) {
            case 'Leve': return '#16a34a';
            case 'Moderada': return '#e67e22';
            case 'Grave': return '#dc2626';
            case 'Muy Grave': return '#7f1d1d';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Mis Faltas">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mis Faltas">
            {resumen && (
                <div className="card">
                    <h3>Resumen de Faltas</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{resumen.totalFaltas || 0}</div>
                            <div className="stat-label">Total Faltas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#16a34a' }}>{resumen.leves || 0}</div>
                            <div className="stat-label">Leves</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#e67e22' }}>{resumen.moderadas || 0}</div>
                            <div className="stat-label">Moderadas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#dc2626' }}>{resumen.graves || 0}</div>
                            <div className="stat-label">Graves</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#7f1d1d' }}>{resumen.muyGraves || 0}</div>
                            <div className="stat-label">Muy Graves</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#3b82f6' }}>{resumen.totalPuntos || 0}</div>
                            <div className="stat-label">Puntos de Demerito</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <h3>Filtros</h3>
                <div className="form-group">
                    <select
                        value={filterGravedad}
                        onChange={(e) => setFilterGravedad(e.target.value)}
                        className="form-control"
                        style={{ maxWidth: '300px' }}
                    >
                        <option value="todos">Todas las gravedades</option>
                        <option value="Leve">Leve</option>
                        <option value="Moderada">Moderada</option>
                        <option value="Grave">Grave</option>
                        <option value="Muy Grave">Muy Grave</option>
                    </select>
                </div>
            </div>

            {faltasFiltradas.length > 0 && (
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
                                {faltasFiltradas.map((f) => (
                                    <tr key={f.idFaltas}>
                                        <td>{new Date(f.fecha).toLocaleDateString()}</td>
                                        <td>{f.tipo}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getGravedadColor(f.gravedad),
                                                color: '#fff'
                                            }}>
                                                {f.gravedad}
                                            </span>
                                        </td>
                                        <td>{f.descripcion || '-'}</td>
                                        <td>{f.puntosDemerito}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: f.estado === 'Activa' ? '#dcfce7' : '#fee2e2',
                                                color: f.estado === 'Activa' ? '#15803d' : '#b91c1c'
                                            }}>
                                                {f.estado}
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

export default MisFaltas;