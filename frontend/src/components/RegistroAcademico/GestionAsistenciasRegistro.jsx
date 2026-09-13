// Componente Gestión de Asistencias (Registro Académico): consulta, resume y exporta asistencias por clase y fecha.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const GestionAsistenciasRegistro = () => {
    // Estado de clases, asistencias, filtros y resumen calculado.
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

    // Al cambiar clase o fecha, recarga las asistencias.
    useEffect(() => {
        if (filtros.idClase && filtros.fecha) {
            cargarAsistencias();
        }
    }, [filtros]);

    // Obtiene las clases desde la API.
    const cargarClases = async () => {
        try {
            const response = await API.get('/clases');
            setClases(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar clases', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Obtiene asistencias y estudiantes de la clase, combina ambos y calcula el resumen.
    const cargarAsistencias = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/asistencias/clase/${filtros.idClase}/${filtros.fecha}`);
            const data = response.data || [];

            const estudiantesRes = await API.get(`/estudiantes/clase/${filtros.idClase}`);
            const estudiantes = estudiantesRes.data || [];

            const asistenciasCombinadas = estudiantes.map(e => {
                const asistencia = data.find(a => a.idEstudiante === e.idEstudiante);
                return {
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

    // Exporta las asistencias cargadas a un archivo Excel.
    const exportarExcel = () => {
        if (asistencias.length === 0) {
            mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }

        const data = asistencias.map(a => ({
            'Codigo': a.codigoEstudiante || '',
            'Estudiante': a.nombreEstudiante,
            'Estado': a.estado,
            'Hora': a.horaRegistro ? new Date(a.horaRegistro).toLocaleTimeString() : '-',
            'Minutos Tarde': a.minutosTarde || 0,
            'Observaciones': a.observaciones || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
        XLSX.writeFile(wb, `asistencias_${new Date().toISOString().split('T')[0]}.xlsx`);
        mostrarMensaje('Exportado a Excel', 'success');
    };

    // Devuelve el color según el estado de asistencia.
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Presente': return '#16a34a';
            case 'Ausente': return '#dc2626';
            case 'Tarde': return '#e67e22';
            case 'Justificado': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    // Muestra un mensaje temporal de éxito o error.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    if (loading) {
        return (
            <DashboardLayout title="Asistencias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Asistencias - Registro Academico">
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
                <h3>Filtros</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Clase</label>
                        <select
                            value={filtros.idClase}
                            onChange={(e) => setFiltros({ ...filtros, idClase: e.target.value })}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
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
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="btn-success" onClick={exportarExcel} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            Exportar Excel
                        </button>
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
                                        <td style={{ padding: '8px' }}>{a.horaRegistro ? new Date(a.horaRegistro).toLocaleTimeString() : '-'}</td>
                                        <td style={{ padding: '8px' }}>{a.minutosTarde || 0}</td>
                                        <td style={{ padding: '8px' }}>{a.observaciones || '-'}</td>
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

export default GestionAsistenciasRegistro;