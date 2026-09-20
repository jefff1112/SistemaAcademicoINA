// Componente Auditoría Admin: consulta el registro de actividades realizadas en el sistema.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: muestra la tabla de auditoría dentro del layout de dashboard.
const AuditoriaAdmin = () => {
    const [auditoria, setAuditoria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filterAccion, setFilterAccion] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 15;

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarAuditoria();
    }, []);

    const cargarAuditoria = async () => {
        setLoading(true);
        try {
            const response = await API.get('/auditoria');
            setAuditoria(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar el registro de auditoría', 'error');
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
    // HELPERS
    // ============================================================
    const getAccionBadge = (accion) => {
        const accionLower = (accion || '').toLowerCase();
        if (accionLower.includes('crear') || accionLower.includes('creó') || accionLower.includes('insert')) {
            return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
        }
        if (accionLower.includes('actualiz') || accionLower.includes('edit') || accionLower.includes('modific')) {
            return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
        }
        if (accionLower.includes('elimin') || accionLower.includes('borr') || accionLower.includes('desactiv')) {
            return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
        }
        if (accionLower.includes('login') || accionLower.includes('sesión') || accionLower.includes('ingres')) {
            return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
        }
        return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
    };

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

    // ============================================================
    // FILTRADO
    // ============================================================
    const accionesUnicas = useMemo(() => {
        const set = new Set();
        auditoria.forEach(a => {
            if (a.accion) set.add(a.accion);
        });
        return Array.from(set).sort();
    }, [auditoria]);

    const auditoriaFiltrada = useMemo(() => {
        return auditoria.filter(item => {
            // Filtro por acción
            if (filterAccion && item.accion !== filterAccion) return false;

            // Filtro por fecha desde
            if (fechaDesde) {
                const fechaItem = new Date(item.fecha);
                const desde = new Date(fechaDesde);
                desde.setHours(0, 0, 0, 0);
                if (fechaItem < desde) return false;
            }

            // Filtro por fecha hasta
            if (fechaHasta) {
                const fechaItem = new Date(item.fecha);
                const hasta = new Date(fechaHasta);
                hasta.setHours(23, 59, 59, 999);
                if (fechaItem > hasta) return false;
            }

            // Búsqueda general
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (item.accion && item.accion.toLowerCase().includes(term)) ||
                    (item.usuario && item.usuario.toLowerCase().includes(term)) ||
                    (item.detalle && item.detalle.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [auditoria, filterAccion, fechaDesde, fechaHasta, busqueda]);

    // ============================================================
    // PAGINACIÓN
    // ============================================================
    const totalPaginas = Math.ceil(auditoriaFiltrada.length / registrosPorPagina);
    const indiceInicio = (paginaActual - 1) * registrosPorPagina;
    const indiceFin = indiceInicio + registrosPorPagina;
    const registrosPaginados = auditoriaFiltrada.slice(indiceInicio, indiceFin);

    // Resetear página al cambiar filtros
    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filterAccion, fechaDesde, fechaHasta]);

    const irPaginaAnterior = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    const irPaginaSiguiente = () => {
        if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
    };

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================
    const stats = useMemo(() => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const registrosHoy = auditoria.filter(a => new Date(a.fecha) >= hoy).length;
        return {
            total: auditoria.length,
            hoy: registrosHoy,
            acciones: accionesUnicas.length
        };
    }, [auditoria, accionesUnicas]);

    const filtrosActivos = (filterAccion ? 1 : 0) + (fechaDesde ? 1 : 0) + (fechaHasta ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterAccion('');
        setFechaDesde('');
        setFechaHasta('');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Auditoria">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Auditoria del Sistema">
            <style>{`
                /* Forzar fondo blanco general */
                .ga-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }
                
                .ga-card { 
                    background: #ffffff; 
                    border-radius: 12px; 
                    padding: 22px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03); 
                    border: 1px solid #e2e8f0; 
                }
                .ga-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .ga-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .ga-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .ga-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .ga-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .ga-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .ga-stat-hoy { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
                .ga-stat-acciones { background: #e9d5ff; color: #6b21a8; border-color: #d8b4fe; }

                /* Filtros */
                .ga-filtros { display: grid; grid-template-columns: 1.5fr 1.5fr 1fr 1fr; gap: 14px; }
                .ga-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .ga-field input, .ga-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .ga-field input:focus, .ga-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .ga-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .ga-btn:disabled { opacity: .6; cursor: not-allowed; }
                .ga-btn-primary { background: #1e3a5f; color: #fff; }
                .ga-btn-primary:hover:not(:disabled) { background: #16293f; }
                .ga-btn-secondary { background: #e5e7eb; color: #334155; }
                .ga-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .ga-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - FORZAR FONDO BLANCO */
                .ga-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .ga-tabla thead th {
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
                .ga-tabla tbody tr { 
                    border-bottom: 1px solid #e2e8f0; 
                    background-color: #ffffff !important; 
                }
                .ga-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .ga-tabla td { 
                    padding: 12px 10px; 
                    color: #1e293b !important; 
                    vertical-align: middle; 
                    background-color: #ffffff !important;
                }
                .ga-tabla tbody tr:hover td { 
                    background-color: #f1f5f9 !important;
                }
                .ga-tabla td.col-fecha { 
                    font-family: monospace; 
                    font-size: 12px; 
                    color: #475569 !important; 
                    white-space: nowrap;
                }
                .ga-tabla td.col-usuario { 
                    font-weight: 600; 
                    color: #0f172a !important; 
                }
                .ga-tabla td.col-detalle {
                    font-size: 12px;
                    color: #475569 !important;
                    max-width: 400px;
                    word-break: break-word;
                }

                .ga-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .ga-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .ga-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .ga-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .ga-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .ga-empty h3 { color: #334155; margin: 0 0 8px; }

                .ga-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .ga-badge-filtros {
                    display: inline-block;
                    background: #3b82f6;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 10px;
                    margin-left: 8px;
                }

                /* Paginación */
                .ga-paginacion {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #e2e8f0;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .ga-paginacion-info { font-size: 13px; color: #64748b; }
                .ga-paginacion-controles { display: flex; gap: 8px; align-items: center; }
                .ga-paginacion-controles button {
                    padding: 6px 12px;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    color: #334155;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all .2s;
                }
                .ga-paginacion-controles button:hover:not(:disabled) {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                }
                .ga-paginacion-controles button:disabled {
                    opacity: .5;
                    cursor: not-allowed;
                }
                .ga-paginacion-controles .pagina-actual {
                    font-size: 13px;
                    color: #1e293b;
                    font-weight: 600;
                    padding: 0 8px;
                }

                @media (max-width: 900px) {
                    .ga-filtros { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .ga-filtros { grid-template-columns: 1fr; }
                    .ga-tabla { font-size: 12px; }
                    .ga-tabla thead th, .ga-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="ga-container">
                {mensaje && <div className={`ga-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="ga-stats">
                    <div className="ga-stat ga-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Registros</span>
                    </div>
                    <div className="ga-stat ga-stat-hoy">
                        <span className="num">{stats.hoy}</span>
                        <span className="lbl">Actividades Hoy</span>
                    </div>
                    <div className="ga-stat ga-stat-acciones">
                        <span className="num">{stats.acciones}</span>
                        <span className="lbl">Tipos de Acción</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="ga-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="ga-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="ga-filtros">
                        <div className="ga-field">
                            <label>Acción</label>
                            <select value={filterAccion} onChange={(e) => setFilterAccion(e.target.value)}>
                                <option value="">Todas las acciones</option>
                                {accionesUnicas.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <div className="ga-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por usuario, acción o detalle..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <div className="ga-field">
                            <label>Desde</label>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                            />
                        </div>
                        <div className="ga-field">
                            <label>Hasta</label>
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="ga-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="ga-btn ga-btn-secondary" onClick={cargarAuditoria}>
                                Recargar
                            </button>
                            {filtrosActivos > 0 && (
                                <button className="ga-btn ga-btn-secondary" onClick={limpiarFiltros}>
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{auditoriaFiltrada.length}</strong> de {auditoria.length} registros
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="ga-card">
                    <h3>Registro de Actividades</h3>

                    {auditoriaFiltrada.length === 0 ? (
                        <div className="ga-empty">
                            <h3>No hay registros que coincidan</h3>
                            <p>Prueba ajustando los filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="ga-tabla">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '160px' }}>Fecha</th>
                                            <th style={{ width: '180px' }}>Usuario</th>
                                            <th style={{ width: '160px' }}>Acción</th>
                                            <th>Detalle</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrosPaginados.map((item, index) => {
                                            const badge = getAccionBadge(item.accion);
                                            return (
                                                <tr key={index}>
                                                    <td className="col-fecha">{formatearFecha(item.fecha)}</td>
                                                    <td className="col-usuario">{item.usuario || '-'}</td>
                                                    <td>
                                                        <span
                                                            className="ga-badge"
                                                            style={{
                                                                backgroundColor: badge.bg,
                                                                color: badge.color,
                                                                border: `1px solid ${badge.border}`
                                                            }}
                                                        >
                                                            {item.accion || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="col-detalle">{item.detalle || '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINACIÓN */}
                            {totalPaginas > 1 && (
                                <div className="ga-paginacion">
                                    <div className="ga-paginacion-info">
                                        Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong>
                                        {' '}({indiceInicio + 1}-{Math.min(indiceFin, auditoriaFiltrada.length)} de {auditoriaFiltrada.length})
                                    </div>
                                    <div className="ga-paginacion-controles">
                                        <button onClick={irPaginaAnterior} disabled={paginaActual === 1}>
                                            Anterior
                                        </button>
                                        <span className="pagina-actual">{paginaActual}</span>
                                        <button onClick={irPaginaSiguiente} disabled={paginaActual === totalPaginas}>
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AuditoriaAdmin;