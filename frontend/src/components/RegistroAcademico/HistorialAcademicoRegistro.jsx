// Componente Historial Académico (Registro Académico): consulta el historial por año de un estudiante y lo exporta a Excel.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const HistorialAcademicoRegistro = () => {
    // Estado de estudiantes, selección, historial cargado y mensajes.
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [historial, setHistorial] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Carga la lista de estudiantes al montar el componente.
    useEffect(() => {
        cargarEstudiantes();
    }, []);

    // Obtiene los estudiantes desde la API.
    const cargarEstudiantes = async () => {
        try {
            const response = await API.get('/estudiantes');
            setEstudiantes(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar estudiantes', 'error');
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

    // Consulta inscripciones por año y las notas de cada año para armar el historial.
    const cargarHistorial = async (idEstudiante) => {
        try {
            const response = await API.get(`/inscripciones/estudiante/${idEstudiante}`);
            const inscripciones = response.data || [];

            const historialData = await Promise.all(inscripciones.map(async (ins) => {
                const notasRes = await API.get(`/reportes/notas-estudiante/${idEstudiante}/${ins.anioLectivo}`);
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
        } catch (error) {
            mostrarMensaje('Error al cargar historial', 'error');
        }
    };

    // Genera el archivo Excel con el historial del estudiante.
    const exportarHistorial = () => {
        if (historial.length === 0) {
            mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }

        const data = historial.map(h => ({
            'Año': h.anio,
            'Clase': h.clase,
            'Promedio': h.promedio,
            'Aprobadas': h.aprobadas,
            'Reprobadas': h.reprobadas,
            'Estado': h.estado
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Historial');
        XLSX.writeFile(wb, `historial_${selectedEstudiante}_${new Date().toISOString().split('T')[0]}.xlsx`);
        mostrarMensaje('Historial exportado', 'success');
    };

    // Devuelve el nombre completo del estudiante desde la lista local.
    const getEstudianteNombre = (id) => {
        const estudiante = estudiantes.find(e => e.idEstudiante === parseInt(id));
        return estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : '-';
    };

    // Devuelve el código del estudiante desde la lista local.
    const getEstudianteCodigo = (id) => {
        const estudiante = estudiantes.find(e => e.idEstudiante === parseInt(id));
        return estudiante ? estudiante.codigoEstudiante : '-';
    };

    if (loading) {
        return (
            <DashboardLayout title="Historial Academico">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Historial Academico - Registro Academico">
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
                <h3>Seleccionar Estudiante</h3>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                    <select
                        value={selectedEstudiante}
                        onChange={(e) => {
                            setSelectedEstudiante(e.target.value);
                            if (e.target.value) {
                                cargarHistorial(e.target.value);
                            } else {
                                setHistorial([]);
                            }
                        }}
                        className="form-control"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                        <option value="">Seleccionar Estudiante</option>
                        {estudiantes.map(e => (
                            <option key={e.idEstudiante} value={e.idEstudiante}>
                                {e.nombres} {e.apellidos} - {e.codigoEstudiante}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedEstudiante && (
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                        <p><strong>Estudiante:</strong> {getEstudianteNombre(selectedEstudiante)}</p>
                        <p><strong>Codigo:</strong> {getEstudianteCodigo(selectedEstudiante)}</p>
                    </div>
                )}
            </div>

            {historial.length > 0 && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Historial Academico</h3>
                        <button className="btn-success" onClick={exportarHistorial} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            Exportar Excel
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Año</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Clase</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Promedio</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Aprobadas</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Reprobadas</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map((h, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{h.anio}</td>
                                        <td style={{ padding: '8px' }}>{h.clase}</td>
                                        <td style={{ padding: '8px' }}>{h.promedio}</td>
                                        <td style={{ padding: '8px', color: '#16a34a' }}>{h.aprobadas}</td>
                                        <td style={{ padding: '8px', color: '#dc2626' }}>{h.reprobadas}</td>
                                        <td style={{ padding: '8px' }}>
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
                </div>
            )}
        </DashboardLayout>
    );
};

export default HistorialAcademicoRegistro;