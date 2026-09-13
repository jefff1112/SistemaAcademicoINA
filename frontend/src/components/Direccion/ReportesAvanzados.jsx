// Componente Reportes Avanzados (Dirección): genera vistas previas y exporta reportes a Excel.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

// Componente principal: filtra y muestra aspirantes, estudiantes o notas, con exportación a Excel.
const ReportesAvanzados = () => {
    // Estados: filtros del reporte, datos de vista previa y mensajes.
    const [loading, setLoading] = useState(false);
    const [tipoReporte, setTipoReporte] = useState('aspirantes');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [especialidadId, setEspecialidadId] = useState('');
    const [dataPrevia, setDataPrevia] = useState([]);
    const [mostrarTabla, setMostrarTabla] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Devuelve el nombre legible de la especialidad según su id.
    const getEspecialidadNombre = (id) => {
        const especialidades = {
            1: 'Administrativo Contable',
            2: 'Desarrollo de Software',
            3: 'Salud y Bienestar',
            4: 'Electronica',
            5: 'Bachillerato General'
        };
        return especialidades[id] || 'Sin Especialidad';
    };

    // Muestra un mensaje temporal al usuario y lo limpia después de 4 segundos.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Carga la vista previa (máx. 20 registros) según el tipo de reporte y los filtros.
    const cargarVistaPrevia = async () => {
        setLoading(true);
        setMostrarTabla(true);

        try {
            if (tipoReporte === 'aspirantes') {
                // Petición GET /aspirantes para el reporte de aspirantes.
                const response = await API.get('/aspirantes');
                let data = response.data || [];

                if (fechaInicio) {
                    data = data.filter(a => new Date(a.fechaSolicitud) >= new Date(fechaInicio));
                }
                if (fechaFin) {
                    data = data.filter(a => new Date(a.fechaSolicitud) <= new Date(fechaFin));
                }
                if (especialidadId) {
                    data = data.filter(a => a.especialidadAspira === parseInt(especialidadId));
                }

                const previewData = data.slice(0, 20).map(a => ({
                    'ID': a.idAspirante,
                    'Nombres': a.nombres,
                    'Apellidos': a.apellidos,
                    'NIE': a.nie || '-',
                    'Correo': a.correo || '-',
                    'Especialidad': getEspecialidadNombre(a.especialidadAspira),
                    'Estado': a.estadoSolicitud || 'Pendiente',
                    'Fecha': new Date(a.fechaSolicitud).toLocaleDateString()
                }));
                setDataPrevia(previewData);
                mostrarMensaje(`Vista previa cargada con ${previewData.length} registros`, 'success');

            } else if (tipoReporte === 'estudiantes') {
                // Petición GET /estudiantes para el reporte de estudiantes.
                const response = await API.get('/estudiantes');
                let data = response.data || [];

                const previewData = data.slice(0, 20).map(e => ({
                    'Codigo': e.codigoEstudiante,
                    'Nombres': e.nombres,
                    'Apellidos': e.apellidos,
                    'NIE': e.nie || '-',
                    'Estado': e.estado ? 'Activo' : 'Inactivo'
                }));
                setDataPrevia(previewData);
                mostrarMensaje(`Vista previa cargada con ${previewData.length} registros`, 'success');

            } else if (tipoReporte === 'notas') {
                // Petición GET /estudiantes para el reporte de notas de estudiantes.
                const estudiantesRes = await API.get('/estudiantes');
                const estudiantes = estudiantesRes.data || [];
                const boletas = await Promise.all(estudiantes.slice(0, 20).map(async (e) => {
                    try {
                        // Petición GET /reportes/notas-estudiante/{id}/{anio} para las notas del estudiante.
                        const notasRes = await API.get(`/reportes/notas-estudiante/${e.idEstudiante}/${new Date().getFullYear()}`);
                        return {
                            estudiante: e,
                            notas: notasRes.data || {}
                        };
                    } catch {
                        return { estudiante: e, notas: {} };
                    }
                }));

                const previewData = boletas.map(b => ({
                    'Codigo': b.estudiante.codigoEstudiante,
                    'Estudiante': `${b.estudiante.nombres} ${b.estudiante.apellidos}`,
                    'Promedio': b.notas.promedioGeneral || 0,
                    'Aprobadas': b.notas.materiasAprobadas || 0,
                    'Reprobadas': b.notas.materiasReprobadas || 0
                }));
                setDataPrevia(previewData);
                mostrarMensaje(`Vista previa cargada con ${previewData.length} registros`, 'success');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error al cargar datos: ' + (error.response?.data?.mensaje || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Genera y descarga el archivo Excel con los datos de la vista previa.
    const exportarExcel = () => {
        if (dataPrevia.length === 0) {
            mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(dataPrevia);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
        XLSX.writeFile(wb, `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.xlsx`);
        mostrarMensaje('Reporte exportado correctamente', 'success');
    };

    return (
        <DashboardLayout title="Reportes Avanzados - Direccion">
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
                <h3>Generar Reportes</h3>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tipo de Reporte</label>
                    <select
                        value={tipoReporte}
                        onChange={(e) => {
                            setTipoReporte(e.target.value);
                            setMostrarTabla(false);
                            setDataPrevia([]);
                        }}
                        className="form-control"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                        <option value="aspirantes">Reporte de Aspirantes</option>
                        <option value="estudiantes">Reporte de Estudiantes</option>
                        <option value="notas">Reporte de Notas</option>
                    </select>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha Inicio</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha Fin</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Especialidad</label>
                    <select
                        value={especialidadId}
                        onChange={(e) => setEspecialidadId(e.target.value)}
                        className="form-control"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                        <option value="">Todas</option>
                        <option value="1">Administrativo Contable</option>
                        <option value="2">Desarrollo de Software</option>
                        <option value="3">Salud y Bienestar</option>
                        <option value="4">Electronica</option>
                        <option value="5">Bachillerato General</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={cargarVistaPrevia}
                        disabled={loading}
                        style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        {loading ? 'Cargando...' : 'Ver Vista Previa'}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={exportarExcel}
                        style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Exportar a Excel
                    </button>
                </div>
            </div>

            {mostrarTabla && dataPrevia.length > 0 && (
                <div className="card">
                    <h3>Vista Previa</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        Mostrando {dataPrevia.length} registros
                    </p>
                    <div className="table-responsive">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    {Object.keys(dataPrevia[0]).map(key => (
                                        <th key={key} style={{ padding: '10px', textAlign: 'left' }}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dataPrevia.map((row, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        {Object.values(row).map((val, i) => (
                                            <td key={i} style={{ padding: '8px' }}>{val}</td>
                                        ))}
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

export default ReportesAvanzados;