// Componente DashboardEncargado: resumen académico de los estudiantes a cargo del encargado.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: panel con estadísticas por hijo y accesos rápidos.
const DashboardEncargado = () => {
    const [hijos, setHijos] = useState([]);
    const [selectedHijo, setSelectedHijo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        promedioGeneral: 0,
        porcentajeAsistencia: 0,
        materiasAprobadas: 0,
        materiasReprobadas: 0
    });

    useEffect(() => {
        cargarHijos();
    }, []);

    useEffect(() => {
        if (selectedHijo) {
            cargarDatosHijo(selectedHijo);
        }
    }, [selectedHijo]);

    // Carga los estudiantes asociados al encargado logueado.
    const cargarHijos = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await API.get(`/encargados/${user?.idUsuario}/estudiantes`);
            const hijosData = response.data || [];
            setHijos(hijosData);
            
            if (hijosData.length > 0) {
                setSelectedHijo(hijosData[0]);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Carga notas y asistencias del año en curso para el hijo seleccionado.
    const cargarDatosHijo = async (hijo) => {
        try {
            const [notasRes, asistenciasRes] = await Promise.all([
                API.get(`/reportes/notas-estudiante/${hijo.idEstudiante}/${new Date().getFullYear()}`),
                API.get(`/reportes/asistencias-estudiante/${hijo.idEstudiante}/${new Date().getFullYear()}`)
            ]);
            
            const notasData = notasRes.data || {};
            const asistenciasData = asistenciasRes.data || {};
            
            setStats({
                promedioGeneral: notasData.promedioGeneral || 0,
                porcentajeAsistencia: asistenciasData.porcentajeAsistencia || 0,
                materiasAprobadas: notasData.materiasAprobadas || 0,
                materiasReprobadas: notasData.materiasReprobadas || 0
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Dashboard Encargado">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Dashboard Encargado">
            {hijos.length === 0 ? (
                <div className="card">
                    <p>No tiene estudiantes asociados.</p>
                </div>
            ) : (
                <>
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
                                        {h.nombres} {h.apellidos} - {h.codigoEstudiante}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedHijo && (
                        <>
                            <div className="welcome-card">
                                <h2>{selectedHijo.nombres} {selectedHijo.apellidos}</h2>
                                <p>{selectedHijo.codigoEstudiante} - {selectedHijo.clase?.nombreClase || 'Sin clase'}</p>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-number" style={{ color: '#3b82f6' }}>{stats.promedioGeneral}</div>
                                    <div className="stat-label">Promedio General</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number" style={{ color: '#16a34a' }}>{stats.porcentajeAsistencia}%</div>
                                    <div className="stat-label">Asistencia</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number" style={{ color: '#16a34a' }}>{stats.materiasAprobadas}</div>
                                    <div className="stat-label">Materias Aprobadas</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number" style={{ color: '#dc2626' }}>{stats.materiasReprobadas}</div>
                                    <div className="stat-label">Materias Reprobadas</div>
                                </div>
                            </div>

                            <div className="card">
                                <h3>Acciones Rapidas</h3>
                                <div className="actions-grid">
                                    <button className="action-btn" onClick={() => window.location.href = '/encargado/notas'}>
                                        Ver Notas
                                    </button>
                                    <button className="action-btn" onClick={() => window.location.href = '/encargado/asistencias'}>
                                        Asistencias
                                    </button>
                                    <button className="action-btn" onClick={() => window.location.href = '/encargado/conducta'}>
                                        Conducta
                                    </button>
                                    <button className="action-btn" onClick={() => window.location.href = '/encargado/boleta'}>
                                        Boleta de Notas
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </DashboardLayout>
    );
};

export default DashboardEncargado;