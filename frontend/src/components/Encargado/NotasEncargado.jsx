// Componente NotasEncargado: consulta las notas por período de los hijos del encargado.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: resumen y detalle de notas del estudiante seleccionado.
const NotasEncargado = () => {
    const [hijos, setHijos] = useState([]);
    const [selectedHijo, setSelectedHijo] = useState(null);
    const [notas, setNotas] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [periodos, setPeriodos] = useState([]);

    useEffect(() => {
        cargarHijos();
    }, []);

    useEffect(() => {
        if (selectedHijo && selectedPeriodo) {
            cargarNotas();
        }
    }, [selectedHijo, selectedPeriodo]);

    // Carga los hijos del encargado y los períodos académicos.
    const cargarHijos = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await API.get(`/encargados/${user?.idUsuario}/estudiantes`);
            const hijosData = response.data || [];
            setHijos(hijosData);

            if (hijosData.length > 0) {
                setSelectedHijo(hijosData[0]);
            }

            const periodosRes = await API.get('/periodosacademicos');
            setPeriodos(periodosRes.data || []);
            if (periodosRes.data.length > 0) {
                setSelectedPeriodo(periodosRes.data[0].idPeriodo);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Carga las notas del hijo seleccionado y calcula aprobadas, reprobadas y promedio.
    const cargarNotas = async () => {
        try {
            const response = await API.get(`/resultados-periodos/estudiante/${selectedHijo.idEstudiante}/periodo/${selectedPeriodo}`);
            const data = response.data || [];
            setNotas(data);

            const aprobadas = data.filter(n => n.notaAcumulada >= 6).length;
            const reprobadas = data.filter(n => n.notaAcumulada < 6 && n.notaAcumulada > 0).length;
            const promedio = data.length > 0 ? data.reduce((s, n) => s + n.notaAcumulada, 0) / data.length : 0;

            setResumen({
                total: data.length,
                aprobadas,
                reprobadas,
                promedio: promedio.toFixed(2)
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Notas del Estudiante">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Notas del Estudiante">
            <div className="card">
                <h3>Seleccionar Estudiante</h3>
                <div className="form-group">
                    <select
                        value={selectedHijo?.idEstudiante || ''}
                        onChange={(e) => {
                            const hijo = hijos.find(h => h.idEstudiante === parseInt(e.target.value));
                            setSelectedHijo(hijo);
                        }}
                        className="form-control"
                        style={{ maxWidth: '400px' }}
                    >
                        {hijos.map((h) => (
                            <option key={h.idEstudiante} value={h.idEstudiante}>
                                {h.nombres} {h.apellidos}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedHijo && (
                    <div className="form-group">
                        <label>Periodo</label>
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
                )}
            </div>

            {resumen && (
                <div className="card">
                    <h3>Resumen Academico</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{resumen.total}</div>
                            <div className="stat-label">Total Materias</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#16a34a' }}>{resumen.aprobadas}</div>
                            <div className="stat-label">Aprobadas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#dc2626' }}>{resumen.reprobadas}</div>
                            <div className="stat-label">Reprobadas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#3b82f6' }}>{resumen.promedio}</div>
                            <div className="stat-label">Promedio</div>
                        </div>
                    </div>
                </div>
            )}

            {notas.length > 0 && (
                <div className="card">
                    <h3>Detalle de Notas</h3>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Materia</th>
                                    <th>Nota</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notas.map((n, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{n.nombreMateria || 'Sin materia'}</td>
                                        <td><strong>{n.notaAcumulada || 0}</strong></td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: n.notaAcumulada >= 6 ? '#dcfce7' : '#fee2e2',
                                                color: n.notaAcumulada >= 6 ? '#15803d' : '#b91c1c'
                                            }}>
                                                {n.notaAcumulada >= 6 ? 'Aprobado' : 'Reprobado'}
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

export default NotasEncargado;