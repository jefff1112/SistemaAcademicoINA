// Componente Reportes del Sistema (Admin): lista los reportes disponibles y permite generarlos.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: muestra los reportes del sistema y dispara su generación.
const ReportesSistemaAdmin = () => {
    // Estados: lista de reportes e indicador de carga.
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generando, setGenerando] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [reporteGenerado, setReporteGenerado] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Filtros
    const [busqueda, setBusqueda] = useState('');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarReportes();
    }, []);

    const cargarReportes = async () => {
        setLoading(true);
        try {
            const response = await API.get('/reportessistema');
            setReportes(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar los reportes', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    // ============================================================
    // GENERAR REPORTE
    // ============================================================
    const generarReporte = async (id) => {
        setGenerando(id);
        try {
            const response = await API.get(`/reportessistema/${id}`);
            setReporteGenerado(response.data);
            setShowModal(true);
            mostrarMensaje('Reporte generado correctamente', 'success');
        } catch (error) {
            let msg = 'Error al generar el reporte';
            if (error.response?.data?.mensaje) msg = error.response.data.mensaje;
            else if (error.response?.data?.message) msg = error.response.data.message;
            mostrarMensaje(msg, 'error');
        } finally {
            setGenerando(null);
        }
    };

    const handleCerrarModal = () => {
        setShowModal(false);
        setReporteGenerado(null);
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            const d = new Date(fecha);
            return d.toLocaleString('es-SV', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fecha;
        }
    };

    const getTipoBadge = (nombre) => {
        const n = (nombre || '').toLowerCase();
        if (n.includes('asistencia')) return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
        if (n.includes('nota') || n.includes('calific')) return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
        if (n.includes('matricul') || n.includes('estudiante')) return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
        if (n.includes('docente') || n.includes('personal')) return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
        if (n.includes('seccion') || n.includes('grado')) return { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' };
        return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
    };

    // ============================================================
    // FILTRADO
    // ============================================================
    const reportesFiltrados = useMemo(() => {
        if (!busqueda) return reportes;
        const term = busqueda.toLowerCase();
        return reportes.filter(r =>
            (r.nombre && r.nombre.toLowerCase().includes(term)) ||
            (r.descripcion && r.descripcion.toLowerCase().includes(term))
        );
    }, [reportes, busqueda]);

    const stats = useMemo(() => ({
        total: reportes.length,
        filtrados: reportesFiltrados.length
    }), [reportes, reportesFiltrados]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Reportes del Sistema">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Reportes del Sistema">
            <style>{`
                /* Forzar fondo blanco general */
                .gs-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }
                
                .gs-card { 
                    background: #ffffff; 
                    border-radius: 12px; 
                    padding: 22px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03); 
                    border: 1px solid #e2e8f0; 
                }
                .gs-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .gs-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .gs-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .gs-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gs-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gs-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .gs-stat-filtrados { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }

                /* Filtros */
                .gs-filtros { display: grid; grid-template-columns: 1fr; gap: 14px; }
                .gs-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gs-field input {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gs-field input:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .gs-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .gs-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gs-btn-primary { background: #1e3a5f; color: #fff; }
                .gs-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gs-btn-info { background: #3b82f6; color: #fff; }
                .gs-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gs-btn-secondary { background: #e5e7eb; color: #334155; }
                .gs-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gs-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - FORZAR FONDO BLANCO */
                .gs-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .gs-tabla thead th {
                    background: #f8fafc !important; 
                    color: #1e293b !important; 
                    padding: 12px 10px;
                    text-align: left; 
                    font-size: 11px; 
                    text-transform: uppercase;
                    letter-spacing: .5px; 
                    font-weight: 700;
                    border-bottom: 2px solid #cbd5e1;
                }
                .gs-tabla tbody tr { 
                    border-bottom: 1px solid #e2e8f0; 
                    background-color: #ffffff !important; 
                }
                .gs-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .gs-tabla td { 
                    padding: 12px 10px; 
                    color: #1e293b !important; 
                    vertical-align: middle; 
                    background-color: #ffffff !important;
                }
                .gs-tabla tbody tr:hover td { 
                    background-color: #f1f5f9 !important;
                }
                .gs-tabla td.col-id { 
                    font-family: monospace; 
                    font-size: 12px; 
                    color: #475569 !important; 
                }
                .gs-tabla td.col-nombre { 
                    font-weight: 600; 
                    color: #0f172a !important; 
                }
                .gs-tabla td.col-fecha {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                    white-space: nowrap;
                }

                .gs-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .gs-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gs-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gs-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gs-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .gs-empty h3 { color: #334155; margin: 0 0 8px; }

                .gs-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                /* Modal */
                .gs-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .gs-modal {
                    background: #ffffff; border-radius: 12px;
                    max-width: 640px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .gs-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gs-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gs-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gs-modal-close:hover { color: #dc2626; }
                .gs-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gs-info-box {
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
                    background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af;
                }

                .gs-detalle-grid {
                    display: grid;
                    grid-template-columns: 140px 1fr;
                    gap: 10px 16px;
                    font-size: 13px;
                }
                .gs-detalle-grid .label {
                    color: #64748b;
                    font-weight: 600;
                }
                .gs-detalle-grid .value {
                    color: #1e293b;
                    word-break: break-word;
                }

                .gs-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 600px) {
                    .gs-tabla { font-size: 12px; }
                    .gs-tabla thead th, .gs-tabla td { padding: 8px 6px; }
                    .gs-detalle-grid { grid-template-columns: 1fr; gap: 4px; }
                    .gs-detalle-grid .label { margin-top: 8px; }
                }
            `}</style>

            <div className="gs-container">
                {mensaje && <div className={`gs-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gs-stats">
                    <div className="gs-stat gs-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Reportes</span>
                    </div>
                    <div className="gs-stat gs-stat-filtrados">
                        <span className="num">{stats.filtrados}</span>
                        <span className="lbl">Mostrados</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="gs-card">
                    <h3>Filtros de Búsqueda</h3>
                    <div className="gs-filtros">
                        <div className="gs-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o descripción del reporte..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="gs-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="gs-btn gs-btn-secondary" onClick={cargarReportes}>
                                Recargar
                            </button>
                            {busqueda && (
                                <button className="gs-btn gs-btn-secondary" onClick={() => setBusqueda('')}>
                                    Limpiar Filtro
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{reportesFiltrados.length}</strong> de {reportes.length} reportes
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gs-card">
                    <h3>Reportes Disponibles</h3>

                    {reportesFiltrados.length === 0 ? (
                        <div className="gs-empty">
                            <h3>No hay reportes que coincidan</h3>
                            <p>Prueba ajustando el filtro de búsqueda.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="gs-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '70px' }}>ID</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th style={{ width: '180px' }}>Última Generación</th>
                                        <th style={{ width: '130px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportesFiltrados.map(r => {
                                        const tipoBadge = getTipoBadge(r.nombre);
                                        return (
                                            <tr key={r.id}>
                                                <td className="col-id">{r.id}</td>
                                                <td className="col-nombre">
                                                    <span
                                                        className="gs-badge"
                                                        style={{
                                                            backgroundColor: tipoBadge.bg,
                                                            color: tipoBadge.color,
                                                            border: `1px solid ${tipoBadge.border}`
                                                        }}
                                                    >
                                                        {r.nombre}
                                                    </span>
                                                </td>
                                                <td>{r.descripcion || '-'}</td>
                                                <td className="col-fecha">
                                                    {r.fecha ? formatearFecha(r.fecha) : 'Nunca generado'}
                                                </td>
                                                <td>
                                                    <div className="gs-acciones">
                                                        <button
                                                            className="gs-btn gs-btn-primary gs-btn-sm"
                                                            onClick={() => generarReporte(r.id)}
                                                            disabled={generando === r.id}
                                                        >
                                                            {generando === r.id ? 'Generando...' : 'Generar'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE REPORTE GENERADO */}
            {showModal && reporteGenerado && (
                <div className="gs-modal-overlay" onClick={handleCerrarModal}>
                    <div className="gs-modal" onClick={e => e.stopPropagation()}>
                        <div className="gs-modal-header">
                            <h3>Reporte Generado</h3>
                            <button className="gs-modal-close" onClick={handleCerrarModal}>X</button>
                        </div>

                        <div className="gs-info-box">
                            El reporte se ha generado correctamente. Revisa los detalles a continuación.
                        </div>

                        <div className="gs-detalle-grid">
                            {reporteGenerado.id && (
                                <>
                                    <div className="label">ID:</div>
                                    <div className="value">{reporteGenerado.id}</div>
                                </>
                            )}
                            {reporteGenerado.nombre && (
                                <>
                                    <div className="label">Nombre:</div>
                                    <div className="value">{reporteGenerado.nombre}</div>
                                </>
                            )}
                            {reporteGenerado.descripcion && (
                                <>
                                    <div className="label">Descripción:</div>
                                    <div className="value">{reporteGenerado.descripcion}</div>
                                </>
                            )}
                            {reporteGenerado.fecha && (
                                <>
                                    <div className="label">Fecha:</div>
                                    <div className="value">{formatearFecha(reporteGenerado.fecha)}</div>
                                </>
                            )}

                            {/* Datos adicionales dinámicos */}
                            {Object.entries(reporteGenerado).map(([key, value]) => {
                                if (['id', 'nombre', 'descripcion', 'fecha'].includes(key)) return null;
                                if (value === null || value === undefined || value === '') return null;
                                return (
                                    <React.Fragment key={key}>
                                        <div className="label">{key}:</div>
                                        <div className="value">
                                            {typeof value === 'object'
                                                ? JSON.stringify(value, null, 2)
                                                : String(value)}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div className="gs-modal-actions">
                            <button className="gs-btn gs-btn-secondary" onClick={handleCerrarModal}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ReportesSistemaAdmin;