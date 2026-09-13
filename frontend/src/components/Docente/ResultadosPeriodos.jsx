// ============================================================
// src/components/Docente/ResultadosPeriodos.jsx
// Componente ResultadosPeriodos: consulta las notas acumuladas por estudiante, clase y período.
// ============================================================
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../Layout/DashboardLayout';
import './ResultadosPeriodos.css';

// Componente principal: filtros de clase/período y tabla de resultados con estadísticas.
const ResultadosPeriodos = () => {
    const { user } = useAuth();
    const [resultados, setResultados] = useState([]);
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [claseSeleccionada, setClaseSeleccionada] = useState('');
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // Carga las clases y períodos del año en curso para los filtros.
    const cargarDatosIniciales = async () => {
        setCargando(true);
        try {
            // Obtener el id del docente según el código del usuario logueado
            const docentesRes = await API.get('/docentes');
            const docente = (Array.isArray(docentesRes.data) ? docentesRes.data : [])
                .find(d => d.codigoDocente === user?.codigo);

            if (!docente) {
                setError('No se encontró el docente asociado a este usuario');
                return;
            }

            const anioActual = new Date().getFullYear();
            const [clasesRes, periodosRes] = await Promise.all([
                API.get(`/docentes/${docente.idDocente}/clases/${anioActual}`),
                API.get('/periodosacademicos')
            ]);

            setClases(clasesRes.data || []);
            setPeriodos(Array.isArray(periodosRes.data)
                ? periodosRes.data.filter(p => p.anioLectivo === anioActual)
                : []);
        } catch (err) {
            setError('Error al cargar datos iniciales');
            console.error('Error:', err);
        } finally {
            setCargando(false);
        }
    };

    // Consulta los resultados del período para la clase seleccionada.
    const cargarResultados = async () => {
        if (!claseSeleccionada || !periodoSeleccionado) {
            setError('Seleccione una clase y un periodo');
            return;
        }

        setCargando(true);
        setError(null);
        try {
            const response = await API.get(`/resultados-periodos/clase/${claseSeleccionada}/periodo/${periodoSeleccionado}`);
            const filas = (response.data || []).map(r => {
                const notaVal = r.notaAcumulada;
                let estado;
                if (notaVal === null || notaVal === undefined) estado = 'Pendiente';
                else if (notaVal >= 6.0) estado = 'Aprobado';
                else if (notaVal >= 5.0) estado = 'Recuperacion';
                else estado = 'Reprobado';
                return {
                    idEstudiante: r.idEstudiante,
                    codigoEstudiante: r.estudiante?.codigoEstudiante || 'N/A',
                    estudianteNombre: r.estudiante ? `${r.estudiante.nombres} ${r.estudiante.apellidos}` : '',
                    materiaNombre: r.materia?.nombreMateria || `Materia ${r.idMateria}`,
                    periodoNombre: `Periodo ${r.idPeriodo}`,
                    nota: notaVal ?? 0,
                    estado
                };
            });
            setResultados(filas);

            if (filas.length === 0) {
                setMensaje('No hay resultados para esta clase y periodo');
            } else {
                setMensaje(null);
            }
        } catch (err) {
            setError('Error al cargar los resultados');
            console.error('Error:', err);
        } finally {
            setCargando(false);
        }
    };

    const getBadgeEstado = (estado) => {
        const estados = {
            'Aprobado': 'success',
            'Reprobado': 'danger',
            'Recuperacion': 'warning',
            'Pendiente': 'secondary'
        };
        return estados[estado] || 'secondary';
    };

    const getEstadoTexto = (nota) => {
        if (nota >= 6.0) return 'Aprobado';
        if (nota >= 5.0) return 'Recuperacion';
        return 'Reprobado';
    };

    const getBadgeNota = (nota) => {
        if (nota >= 6.0) return 'success';
        if (nota >= 5.0) return 'warning';
        return 'danger';
    };

    return (
        <DashboardLayout title="Calificaciones por Periodo">
            <div className="resultados-periodos-container">
                <div className="card">
                    <div className="card-header">
                        <h4 className="mb-0">📊 Resultados por Periodo</h4>
                    </div>
                    <div className="card-body">
                        {/* Filtros */}
                        <div className="filtros-row">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Clase</label>
                                    <select
                                        className="form-select"
                                        value={claseSeleccionada}
                                        onChange={(e) => setClaseSeleccionada(e.target.value)}
                                    >
                                        <option value="">Seleccionar clase</option>
                                        {clases.map((c) => (
                                            <option key={c.idClase} value={c.idClase}>
                                                {c.nombreClase} - {c.seccion}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Periodo</label>
                                    <select
                                        className="form-select"
                                        value={periodoSeleccionado}
                                        onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                                    >
                                        <option value="">Seleccionar periodo</option>
                                        {periodos.map((p) => (
                                            <option key={p.idPeriodo} value={p.idPeriodo}>
                                                {p.nombre} ({p.anioLectivo})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary"
                                            onClick={cargarResultados}
                                            disabled={!claseSeleccionada || !periodoSeleccionado || cargando}
                                        >
                                            <i className="fas fa-search"></i> Ver Resultados
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mensajes */}
                        {mensaje && (
                            <div className="alert alert-info alert-dismissible mt-3">
                                {mensaje}
                                <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
                            </div>
                        )}
                        {error && (
                            <div className="alert alert-danger alert-dismissible mt-3">
                                {error}
                                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                            </div>
                        )}

                        {/* Tabla de resultados */}
                        {cargando ? (
                            <div className="text-center mt-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <p className="mt-2">Cargando resultados...</p>
                            </div>
                        ) : resultados.length > 0 ? (
                            <div className="table-responsive mt-4">
                                <table className="table table-striped table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>Código</th>
                                            <th>Estudiante</th>
                                            <th>Materia</th>
                                            <th>Periodo</th>
                                            <th className="text-center">Nota</th>
                                            <th className="text-center">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultados.map((resultado, index) => (
                                            <tr key={resultado.idEstudiante || index}>
                                                <td>{index + 1}</td>
                                                <td>{resultado.codigoEstudiante || 'N/A'}</td>
                                                <td>{resultado.estudianteNombre || 'Sin nombre'}</td>
                                                <td>{resultado.materiaNombre || 'Sin materia'}</td>
                                                <td>{resultado.periodoNombre || `Periodo ${resultado.idPeriodo}`}</td>
                                                <td className="text-center">
                                                    <span className={`badge bg-${getBadgeNota(resultado.nota || 0)} fs-6`}>
                                                        {resultado.nota?.toFixed(2) || '0.00'}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge bg-${getBadgeEstado(resultado.estado)}`}>
                                                        {resultado.estado || getEstadoTexto(resultado.nota || 0)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            claseSeleccionada && periodoSeleccionado && !cargando && (
                                <div className="alert alert-warning mt-4">
                                    <i className="fas fa-info-circle"></i> No hay resultados para mostrar.
                                    Seleccione una clase y periodo, luego haga clic en "Ver Resultados".
                                </div>
                            )
                        )}

                        {/* Estadísticas */}
                        {resultados.length > 0 && (
                            <div className="estadisticas mt-4">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="card text-center border-primary">
                                            <div className="card-body">
                                                <h5 className="text-primary">{resultados.length}</h5>
                                                <small>Total Estudiantes</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card text-center border-success">
                                            <div className="card-body">
                                                <h5 className="text-success">
                                                    {resultados.filter(r => r.nota >= 6.0).length}
                                                </h5>
                                                <small>Aprobados</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card text-center border-warning">
                                            <div className="card-body">
                                                <h5 className="text-warning">
                                                    {resultados.filter(r => r.nota >= 5.0 && r.nota < 6.0).length}
                                                </h5>
                                                <small>Recuperación</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card text-center border-danger">
                                            <div className="card-body">
                                                <h5 className="text-danger">
                                                    {resultados.filter(r => r.nota < 5.0).length}
                                                </h5>
                                                <small>Reprobados</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ResultadosPeriodos;