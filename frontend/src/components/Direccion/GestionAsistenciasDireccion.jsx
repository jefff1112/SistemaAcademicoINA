// Componente Gestión de Asistencias (Dirección): consulta y registra asistencias por clase y fecha.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { formatoHoraExacta } from '../../utils/formatUtils';

// Componente principal: permite ver el detalle de asistencias y registrar estados por estudiante.
const GestionAsistenciasDireccion = () => {
    // Estados: clases, asistencias, filtros de consulta, resumen y mensajes.
    const [clases, setClases] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        idClase: '',
        fecha: new Date().toISOString().split('T')[0]
    });
    const [resumen, setResumen] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Carga las clases al montar el componente.
    useEffect(() => {
        cargarClases();
    }, []);

    // Carga las asistencias cuando cambian la clase o la fecha de los filtros.
    useEffect(() => {
        if (filtros.idClase && filtros.fecha) {
            cargarAsistencias();
        }
    }, [filtros]);

    // Obtiene la lista de clases desde la API.
    const cargarClases = async () => {
        try {
            // Petición GET /clases para listar las clases disponibles.
            const response = await API.get('/clases');
            setClases(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar clases', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Carga las asistencias de la clase y fecha seleccionadas, combinándolas con los estudiantes.
    const cargarAsistencias = async () => {
        try {
            setLoading(true);
            // Petición GET /asistencias/clase/{id}/{fecha} para obtener los registros del día.
            const response = await API.get(`/asistencias/clase/${filtros.idClase}/${filtros.fecha}`);
            const data = response.data || [];

            // Obtener nombres de estudiantes
            // Petición GET /estudiantes/clase/{id} para enlistar los estudiantes de la clase.
            const estudiantesRes = await API.get(`/estudiantes/clase/${filtros.idClase}`);
            const estudiantes = estudiantesRes.data || [];

            // Combinar estudiantes con asistencias
            const asistenciasCombinadas = estudiantes.map(e => {
                const asistencia = data.find(a => a.idEstudiante === e.idEstudiante);
                return {
                    idAsistencia: asistencia?.idAsistencia || null,
                    idEstudiante: e.idEstudiante,
                    nombreEstudiante: `${e.nombres} ${e.apellidos}`,
                    codigoEstudiante: e.codigoEstudiante,
                    estado: asistencia?.estado || 'Pendiente',
                    horaRegistro: asistencia?.horaRegistro || null,
                    minutosTarde: asistencia?.minutosTarde || 0,
                    observaciones: asistencia?.observaciones || ''
                };
            });

            setAsistencias(asistenciasCombinadas);

            const total = asistenciasCombinadas.length;
            const presentes = asistenciasCombinadas.filter(a => a.estado === 'Presente').length;
            const ausencias = asistenciasCombinadas.filter(a => a.estado === 'Ausente').length;
            const tardanzas = asistenciasCombinadas.filter(a => a.estado === 'Tarde').length;
            const justificadas = asistenciasCombinadas.filter(a => a.estado === 'Justificado').length;
            const porcentajeAsistencia = total > 0 ? ((presentes + tardanzas) / total * 100).toFixed(2) : 0;

            setResumen({ total, presentes, ausencias, tardanzas, justificadas, porcentajeAsistencia });
        } catch (error) {
            mostrarMensaje('Error al cargar asistencias', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Actualiza localmente las observaciones de un estudiante (se envían al marcar asistencia).
    const actualizarObservaciones = (idEstudiante, valor) => {
        setAsistencias(prev => prev.map(a =>
            a.idEstudiante === idEstudiante ? { ...a, observaciones: valor } : a
        ));
    };

    // Registra o actualiza la asistencia de un estudiante y refresca la lista.
    const registrarAsistencia = async (idEstudiante, estado, observaciones = '') => {
        try {
            const existing = asistencias.find(a => a.idEstudiante === idEstudiante);

            const data = {
                idEstudiante,
                idClase: parseInt(filtros.idClase),
                idMateria: 1,
                idDocente: 1,
                fecha: new Date(filtros.fecha),
                estado,
                horaRegistro: new Date().toTimeString().split(' ')[0],
                observaciones
            };

            if (existing && existing.idAsistencia) {
                // Petición PUT /asistencias/{id} para actualizar la asistencia existente.
                await API.put(`/asistencias/${existing.idAsistencia}`, data);
            } else {
                // Petición POST /asistencias para crear el registro de asistencia.
                await API.post('/asistencias', data);
            }

            mostrarMensaje('Asistencia registrada', 'success');
            cargarAsistencias();
        } catch (error) {
            mostrarMensaje('Error al registrar asistencia', 'error');
        }
    };

    // Muestra un mensaje temporal al usuario y lo limpia después de 4 segundos.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Devuelve el color que identifica el estado de asistencia del estudiante.
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
            <DashboardLayout title="Gestion de Asistencias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Asistencias - Direccion">
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
                <h3>Filtros de Consulta</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Clase</label>
                        <select
                            value={filtros.idClase}
                            onChange={(e) => setFiltros({ ...filtros, idClase: e.target.value })}
                            className="form-control"
                        >
                            <option value="">Seleccionar</option>
                            {clases.map(c => (
                                <option key={c.idClase} value={c.idClase}>
                                    {c.nombreClase}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Fecha</label>
                        <input
                            type="date"
                            value={filtros.fecha}
                            onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
                            className="form-control"
                        />
                    </div>
                </div>
            </div>

            {resumen && (
                <div className="card">
                    <h3>Resumen de Asistencias</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{resumen.total}</div>
                            <div className="stat-label">Total Estudiantes</div>
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
                            <div className="stat-number" style={{ color: '#1e3a5f' }}>{resumen.porcentajeAsistencia}%</div>
                            <div className="stat-label">Porcentaje Asistencia</div>
                        </div>
                    </div>
                </div>
            )}

            {asistencias.length > 0 && (
                <div className="card">
                    <h3>Detalle de Asistencias</h3>
                    <div className="table-responsive">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Codigo</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estudiante</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Hora</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Minutos Tarde</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Observaciones</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {asistencias.map((a, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{index + 1}</td>
                                        <td style={{ padding: '8px' }}>{a.codigoEstudiante || '-'}</td>
                                        <td style={{ padding: '8px' }}>{a.nombreEstudiante}</td>
                                        <td style={{ padding: '8px' }}>
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
                                        <td style={{ padding: '8px' }}>{formatoHoraExacta(a.horaRegistro)}</td>
                                        <td style={{ padding: '8px' }}>{a.minutosTarde || 0}</td>
                                        <td style={{ padding: '8px' }}>
                                            <input
                                                type="text"
                                                placeholder="Observaciones..."
                                                value={a.observaciones || ''}
                                                onChange={(ev) => actualizarObservaciones(a.idEstudiante, ev.target.value)}
                                                className="form-control"
                                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                <button
                                                    className="btn-success"
                                                    title="Presente"
                                                    style={{ width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                                    onClick={() => registrarAsistencia(a.idEstudiante, 'Presente', a.observaciones)}
                                                >
                                                    P
                                                </button>
                                                <button
                                                    className="btn-danger"
                                                    title="Ausente"
                                                    style={{ width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                                    onClick={() => registrarAsistencia(a.idEstudiante, 'Ausente', a.observaciones)}
                                                >
                                                    A
                                                </button>
                                                <button
                                                    className="btn-warning"
                                                    title="Tarde"
                                                    style={{ width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: '#e67e22', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                                    onClick={() => registrarAsistencia(a.idEstudiante, 'Tarde', a.observaciones)}
                                                >
                                                    T
                                                </button>
                                                <button
                                                    className="btn-primary"
                                                    title="Justificado"
                                                    style={{ width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                                    onClick={() => registrarAsistencia(a.idEstudiante, 'Justificado', a.observaciones)}
                                                >
                                                    J
                                                </button>
                                            </div>
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

export default GestionAsistenciasDireccion;