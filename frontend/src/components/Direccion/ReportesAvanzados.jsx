// Componente Reportes Avanzados (Dirección) - MEJORADO
// Genera vistas previas y exporta reportes a Excel.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const ReportesAvanzados = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [loading, setLoading] = useState(false);
    const [tipoReporte, setTipoReporte] = useState('aspirantes');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [especialidadId, setEspecialidadId] = useState('');
    const [dataPrevia, setDataPrevia] = useState([]);
    const [mostrarTabla, setMostrarTabla] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // ============================================================
    // HELPERS
    // ============================================================
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

    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-SV', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // ============================================================
    // CARGAR VISTA PREVIA
    // ============================================================
    const cargarVistaPrevia = async () => {
        setLoading(true);
        setMostrarTabla(true);

        try {
            if (tipoReporte === 'aspirantes') {
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
                    'Fecha': formatearFecha(a.fechaSolicitud)
                }));
                setDataPrevia(previewData);
                mostrarMensaje(`Vista previa cargada con ${previewData.length} registros`, 'success');

            } else if (tipoReporte === 'estudiantes') {
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
                const estudiantesRes = await API.get('/estudiantes');
                const estudiantes = estudiantesRes.data || [];
                const boletas = await Promise.all(estudiantes.slice(0, 20).map(async (e) => {
                    try {
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

    // ============================================================
    // EXPORTAR A EXCEL
    // ============================================================
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

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout title="Reportes Avanzados - Dirección">
            <style>{`
                .ra-container { display: flex; flex-direction: column; gap: 20px; }
                .ra-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .ra-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .ra-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
                .ra-header h1 { margin: 0; color: #1e3a5f; font-size: 22px; }
                .ra-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }

                .ra-filtros { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
                .ra-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .ra-field input, .ra-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .ra-field input:focus, .ra-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .ra-field input:disabled, .ra-field select:disabled {
                    background: #f1f5f9;
                    color: #94a3b8;
                    cursor: not-allowed;
                }

                .ra-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .ra-btn:disabled { opacity: .6; cursor: not-allowed; }
                .ra-btn-primary { background: #1e3a5f; color: #fff; }
                .ra-btn-primary:hover:not(:disabled) { background: #16293f; }
                .ra-btn-success { background: #16a34a; color: #fff; }
                .ra-btn-success:hover:not(:disabled) { background: #15803d; }
                .ra-btn-secondary { background: #e5e7eb; color: #334155; }
                .ra-btn-secondary:hover:not(:disabled) { background: #d1d5db; }

                .ra-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
                .ra-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .ra-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .ra-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .ra-stat-total { background: #eff6ff; color: #1e40af; }
                .ra-stat-tipo { background: #dbeafe; color: #1d4ed8; }

                .ra-tabla-wrapper { overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; }
                .ra-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
                .ra-tabla thead th {
                    background: #1e3a5f; color: #fff; padding: 12px 10px;
                    text-align: left; font-size: 11px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600; white-space: nowrap;
                }
                .ra-tabla thead th:first-child { border-top-left-radius: 8px; }
                .ra-tabla thead th:last-child { border-top-right-radius: 8px; }
                .ra-tabla tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .ra-tabla tbody tr:hover { background: #f8fafc; }
                .ra-tabla tbody tr:nth-child(even) { background: #fafbfc; }
                .ra-tabla tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .ra-tabla td { padding: 10px; color: #334155; vertical-align: middle; }

                .ra-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }
                .ra-badge-aprobado { background: #dcfce7; color: #15803d; border: 1px solid #16a34a; }
                .ra-badge-rechazado { background: #fee2e2; color: #b91c1c; border: 1px solid #dc2626; }
                .ra-badge-espera { background: #fef3c7; color: #b45309; border: 1px solid #e67e22; }
                .ra-badge-pendiente { background: #f1f5f9; color: #475569; border: 1px solid #94a3b8; }
                .ra-badge-preseleccionado { background: #dbeafe; color: #1d4ed8; border: 1px solid #3b82f6; }

                .ra-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .ra-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .ra-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }
                .ra-aviso.warning { background: #fef3c7; color: #b45309; border-left: 4px solid #e67e22; }

                .ra-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
                .ra-empty h3 { color: #475569; margin: 0 0 8px; }

                .ra-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }

                .ra-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }

                @media (max-width: 768px) {
                    .ra-filtros { grid-template-columns: 1fr; }
                    .ra-tabla { font-size: 12px; }
                }
            `}</style>

            <div className="ra-container">
                {message && <div className={`ra-aviso ${messageType}`}>{message}</div>}

                {/* HEADER + FILTROS */}
                <div className="ra-card">
                    <div className="ra-header">
                        <div>
                            <h1>Reportes Avanzados</h1>
                            <p>Genera vistas previas y exporta reportes a Excel</p>
                        </div>
                    </div>

                    <div className="ra-filtros">
                        <div className="ra-field">
                            <label>Tipo de Reporte *</label>
                            <select
                                value={tipoReporte}
                                onChange={(e) => {
                                    setTipoReporte(e.target.value);
                                    setMostrarTabla(false);
                                    setDataPrevia([]);
                                }}
                            >
                                <option value="aspirantes">Reporte de Aspirantes</option>
                                <option value="estudiantes">Reporte de Estudiantes</option>
                                <option value="notas">Reporte de Notas</option>
                            </select>
                        </div>

                        <div className="ra-field">
                            <label>Fecha Inicio {tipoReporte !== 'aspirantes' && '(N/A)'}</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                disabled={tipoReporte !== 'aspirantes'}
                            />
                        </div>

                        <div className="ra-field">
                            <label>Fecha Fin {tipoReporte !== 'aspirantes' && '(N/A)'}</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                disabled={tipoReporte !== 'aspirantes'}
                            />
                        </div>

                        <div className="ra-field">
                            <label>Especialidad {tipoReporte !== 'aspirantes' && '(N/A)'}</label>
                            <select
                                value={especialidadId}
                                onChange={(e) => setEspecialidadId(e.target.value)}
                                disabled={tipoReporte !== 'aspirantes'}
                            >
                                <option value="">Todas</option>
                                <option value="1">Administrativo Contable</option>
                                <option value="2">Desarrollo de Software</option>
                                <option value="3">Salud y Bienestar</option>
                                <option value="4">Electronica</option>
                                <option value="5">Bachillerato General</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                        <button
                            className="ra-btn ra-btn-secondary"
                            onClick={cargarVistaPrevia}
                            disabled={loading}
                        >
                            {loading ? 'Cargando...' : 'Ver Vista Previa'}
                        </button>
                        <button
                            className="ra-btn ra-btn-primary"
                            onClick={exportarExcel}
                            disabled={dataPrevia.length === 0}
                        >
                            Exportar a Excel
                        </button>
                    </div>

                    {tipoReporte !== 'aspirantes' && (
                        <div className="ra-info-box" style={{ marginTop: '16px', marginBottom: 0 }}>
                            <strong>Nota:</strong> Los filtros de fecha y especialidad solo aplican al reporte de aspirantes.
                        </div>
                    )}
                </div>

                {/* ESTADÍSTICAS */}
                {mostrarTabla && dataPrevia.length > 0 && (
                    <div className="ra-stats">
                        <div className="ra-stat ra-stat-total">
                            <span className="num">{dataPrevia.length}</span>
                            <span className="lbl">Registros</span>
                        </div>
                        <div className="ra-stat ra-stat-tipo">
                            <span className="num" style={{ fontSize: '16px', paddingTop: '4px' }}>
                                {tipoReporte === 'aspirantes' && 'Aspirantes'}
                                {tipoReporte === 'estudiantes' && 'Estudiantes'}
                                {tipoReporte === 'notas' && 'Notas'}
                            </span>
                            <span className="lbl">Tipo de Reporte</span>
                        </div>
                    </div>
                )}

                {/* TABLA DE VISTA PREVIA */}
                {mostrarTabla && dataPrevia.length > 0 && (
                    <div className="ra-card">
                        <div className="ra-toolbar">
                            <h3 style={{ margin: 0 }}>Vista Previa</h3>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                                Mostrando <strong>{dataPrevia.length}</strong> registros (máx. 20)
                            </span>
                        </div>

                        <div className="ra-tabla-wrapper">
                            <table className="ra-tabla">
                                <thead>
                                    <tr>
                                        {Object.keys(dataPrevia[0]).map(key => (
                                            <th key={key}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataPrevia.map((row, index) => (
                                        <tr key={index}>
                                            {Object.entries(row).map(([key, val], i) => {
                                                // Si el valor es un estado, mostrarlo como badge
                                                if (key === 'Estado' && typeof val === 'string') {
                                                    let badgeClass = 'ra-badge-pendiente';
                                                    if (val === 'Aprobado') badgeClass = 'ra-badge-aprobado';
                                                    else if (val === 'Rechazado') badgeClass = 'ra-badge-rechazado';
                                                    else if (val === 'En Espera') badgeClass = 'ra-badge-espera';
                                                    else if (val === 'Preseleccionado') badgeClass = 'ra-badge-preseleccionado';
                                                    return (
                                                        <td key={i}>
                                                            <span className={`ra-badge ${badgeClass}`}>{val}</span>
                                                        </td>
                                                    );
                                                }
                                                return <td key={i}>{val}</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}
                {mostrarTabla && !loading && dataPrevia.length === 0 && (
                    <div className="ra-card">
                        <div className="ra-empty">
                            <h3>No se encontraron registros</h3>
                            <p>Prueba ajustando los filtros o selecciona otro tipo de reporte.</p>
                        </div>
                    </div>
                )}

                {!mostrarTabla && (
                    <div className="ra-card">
                        <div className="ra-empty">
                            <h3>Selecciona un tipo de reporte</h3>
                            <p>Configura los filtros y haz clic en "Ver Vista Previa" para comenzar.</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ReportesAvanzados;