// Componente Auditoría Dirección - MEJORADO
// Consulta el registro de actividades con filtros y exportación a Excel.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const AuditoriaDireccion = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [auditoria, setAuditoria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTipo, setFilterTipo] = useState('todos');
    const [filterUsuario, setFilterUsuario] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarAuditoria();
    }, []);

    const cargarAuditoria = async () => {
        try {
            const response = await API.get('/auditoria');
            setAuditoria(response.data || []);
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje(error.response?.status === 403
                ? 'No tiene permisos para consultar la auditoría'
                : 'Error al cargar la auditoría', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getTipoBadge = (accion) => {
        switch (accion) {
            case 'Login': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            case 'Crear': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Actualizar': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Eliminar': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'Aprobar': return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
            case 'Rechazar': return { bg: '#fecaca', color: '#991b1b', border: '#ef4444' };
            case 'Exportar': return { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' };
            case 'Importar': return { bg: '#ede9fe', color: '#5b21b6', border: '#8b5cf6' };
            case 'Backup': return { bg: '#e0e7ff', color: '#3730a3', border: '#6366f1' };
            case 'Restaurar': return { bg: '#fef9c3', color: '#854d0e', border: '#f59e0b' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-SV', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============================================================
    // FILTRADO
    // ============================================================
    const auditoriaFiltrada = useMemo(() => {
        return auditoria.filter(a => {
            if (filterTipo !== 'todos' && a.accion !== filterTipo) return false;
            if (filterUsuario && a.usuario !== filterUsuario) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const cumple = (
                    a.usuario?.toLowerCase().includes(term) ||
                    a.detalle?.toLowerCase().includes(term) ||
                    a.accion?.toLowerCase().includes(term)
                );
                if (!cumple) return false;
            }
            if (fechaInicio) {
                const inicio = new Date(`${fechaInicio}T00:00:00`);
                if (!isNaN(inicio) && new Date(a.fecha) < inicio) return false;
            }
            if (fechaFin) {
                const fin = new Date(`${fechaFin}T23:59:59`);
                if (!isNaN(fin) && new Date(a.fecha) > fin) return false;
            }
            return true;
        });
    }, [auditoria, filterTipo, filterUsuario, searchTerm, fechaInicio, fechaFin]);

    // Usuarios únicos
    const usuariosAuditoria = useMemo(() => {
        return [...new Set(auditoria.map(a => a.usuario).filter(Boolean))].sort();
    }, [auditoria]);

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================
    const stats = useMemo(() => {
        const stats = {
            total: auditoria.length,
            filtrados: auditoriaFiltrada.length,
            usuarios: usuariosAuditoria.length,
            logins: auditoria.filter(a => a.accion === 'Login').length
        };

        // Contar por tipo de acción
        const porAccion = {};
        auditoria.forEach(a => {
            porAccion[a.accion] = (porAccion[a.accion] || 0) + 1;
        });

        // Top 3 acciones
        const topAcciones = Object.entries(porAccion)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([accion, count]) => ({ accion, count }));

        return { ...stats, topAcciones };
    }, [auditoria, auditoriaFiltrada, usuariosAuditoria]);

    // Contador de filtros activos
    const filtrosActivos = useMemo(() => {
        let count = 0;
        if (filterTipo !== 'todos') count++;
        if (filterUsuario) count++;
        if (searchTerm) count++;
        if (fechaInicio) count++;
        if (fechaFin) count++;
        return count;
    }, [filterTipo, filterUsuario, searchTerm, fechaInicio, fechaFin]);

    // ============================================================
    // EXPORTAR
    // ============================================================
    const exportarAuditoria = () => {
        if (auditoriaFiltrada.length === 0) {
            mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }
        const data = auditoriaFiltrada.map(a => ({
            'Fecha': new Date(a.fecha).toLocaleString(),
            'Usuario': a.usuario,
            'Accion': a.accion,
            'Detalle': a.detalle,
            'IP': a.ip || '-'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Auditoria');
        XLSX.writeFile(wb, `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`);
        mostrarMensaje(`Auditoría exportada (${auditoriaFiltrada.length} registros)`, 'success');
    };

    // ============================================================
    // LIMPIAR FILTROS
    // ============================================================
    const limpiarFiltros = () => {
        setFilterTipo('todos');
        setFilterUsuario('');
        setSearchTerm('');
        setFechaInicio('');
        setFechaFin('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Auditoría">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Auditoría del Sistema - Dirección">
            <style>{`
                .ad-container { display: flex; flex-direction: column; gap: 20px; }
                .ad-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .ad-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .ad-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
                .ad-header h1 { margin: 0; color: #1e3a5f; font-size: 22px; }
                .ad-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }

                /* Estadísticas */
                .ad-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .ad-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .ad-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .ad-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .ad-stat-total { background: #eff6ff; color: #1e40af; }
                .ad-stat-filtrados { background: #dcfce7; color: #15803d; }
                .ad-stat-usuarios { background: #dbeafe; color: #1d4ed8; }
                .ad-stat-logins { background: #e9d5ff; color: #6b21a8; }

                /* Top acciones */
                .ad-top-acciones { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
                .ad-top-accion { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #f1f5f9; color: #334155; display: inline-flex; align-items: center; gap: 6px; }
                .ad-top-accion-count { background: #1e3a5f; color: #fff; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; }

                /* Filtros */
                .ad-filtros { display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 14px; }
                .ad-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .ad-field input, .ad-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .ad-field input:focus, .ad-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .ad-filtros-fechas { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 12px; }

                /* Badge filtros activos */
                .ad-badge-filtros {
                    display: inline-block;
                    background: #3b82f6;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 10px;
                    margin-left: 8px;
                }

                /* Botones */
                .ad-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .ad-btn:disabled { opacity: .6; cursor: not-allowed; }
                .ad-btn-primary { background: #1e3a5f; color: #fff; }
                .ad-btn-primary:hover:not(:disabled) { background: #16293f; }
                .ad-btn-success { background: #16a34a; color: #fff; }
                .ad-btn-success:hover:not(:disabled) { background: #15803d; }
                .ad-btn-secondary { background: #e5e7eb; color: #334155; }
                .ad-btn-secondary:hover:not(:disabled) { background: #d1d5db; }

                /* Tabla */
                .ad-tabla-wrapper { overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; }
                .ad-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
                .ad-tabla thead th {
                    background: #1e3a5f; color: #fff; padding: 12px 10px;
                    text-align: left; font-size: 11px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600; white-space: nowrap;
                }
                .ad-tabla thead th:first-child { border-top-left-radius: 8px; }
                .ad-tabla thead th:last-child { border-top-right-radius: 8px; }
                .ad-tabla tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .ad-tabla tbody tr:hover { background: #f8fafc; }
                .ad-tabla tbody tr:nth-child(even) { background: #fafbfc; }
                .ad-tabla tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .ad-tabla td { padding: 10px; color: #334155; vertical-align: middle; }
                .ad-tabla td.col-fecha { font-family: monospace; font-size: 12px; color: #64748b; white-space: nowrap; }
                .ad-tabla td.col-usuario { font-weight: 600; color: #1e293b; white-space: nowrap; }
                .ad-tabla td.col-detalle { color: #475569; max-width: 500px; }

                .ad-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                    white-space: nowrap;
                }

                .ad-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .ad-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .ad-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .ad-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                .ad-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 12px;
                }

                .ad-acciones {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 14px;
                }

                @media (max-width: 900px) {
                    .ad-filtros { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .ad-filtros { grid-template-columns: 1fr; }
                    .ad-filtros-fechas { grid-template-columns: 1fr; }
                    .ad-tabla { font-size: 12px; }
                    .ad-tabla thead th, .ad-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="ad-container">
                {message && <div className={`ad-aviso ${messageType}`}>{message}</div>}

                {/* ESTADÍSTICAS */}
                <div className="ad-stats">
                    <div className="ad-stat ad-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Registros</span>
                    </div>
                    <div className="ad-stat ad-stat-filtrados">
                        <span className="num">{stats.filtrados}</span>
                        <span className="lbl">Mostrando</span>
                    </div>
                    <div className="ad-stat ad-stat-usuarios">
                        <span className="num">{stats.usuarios}</span>
                        <span className="lbl">Usuarios</span>
                    </div>
                    <div className="ad-stat ad-stat-logins">
                        <span className="num">{stats.logins}</span>
                        <span className="lbl">Logins</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="ad-card">
                    <h3>
                        Filtros de Auditoría
                        {filtrosActivos > 0 && (
                            <span className="ad-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>

                    <div className="ad-filtros">
                        <div className="ad-field">
                            <label>Tipo de Acción</label>
                            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                                <option value="todos">Todas las acciones</option>
                                <option value="Login">Login</option>
                                <option value="Crear">Crear</option>
                                <option value="Actualizar">Actualizar</option>
                                <option value="Eliminar">Eliminar</option>
                                <option value="Aprobar">Aprobar</option>
                                <option value="Rechazar">Rechazar</option>
                                <option value="Exportar">Exportar</option>
                                <option value="Importar">Importar</option>
                                <option value="Backup">Backup</option>
                                <option value="Restaurar">Restaurar</option>
                            </select>
                        </div>

                        <div className="ad-field">
                            <label>Usuario</label>
                            <select value={filterUsuario} onChange={(e) => setFilterUsuario(e.target.value)}>
                                <option value="">Todos los usuarios</option>
                                {usuariosAuditoria.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        <div className="ad-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por usuario, detalle..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="ad-filtros-fechas">
                        <div className="ad-field">
                            <label>Fecha Inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                            />
                        </div>
                        <div className="ad-field">
                            <label>Fecha Fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="ad-acciones">
                        <button
                            className="ad-btn ad-btn-secondary"
                            onClick={limpiarFiltros}
                            disabled={filtrosActivos === 0}
                        >
                            Limpiar Filtros
                        </button>
                        <button
                            className="ad-btn ad-btn-success"
                            onClick={exportarAuditoria}
                            disabled={auditoriaFiltrada.length === 0}
                        >
                            Exportar Excel ({auditoriaFiltrada.length})
                        </button>
                    </div>

                    {/* Top acciones */}
                    {stats.topAcciones.length > 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                                Acciones más frecuentes
                            </div>
                            <div className="ad-top-acciones">
                                {stats.topAcciones.map(({ accion, count }) => (
                                    <span key={accion} className="ad-top-accion">
                                        {accion}
                                        <span className="ad-top-accion-count">{count}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* TABLA */}
                <div className="ad-card">
                    <div className="ad-toolbar">
                        <h3 style={{ margin: 0 }}>Registro de Actividades</h3>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{auditoriaFiltrada.length}</strong> de {auditoria.length} registros
                        </span>
                    </div>

                    <div className="ad-tabla-wrapper">
                        <table className="ad-tabla">
                            <thead>
                                <tr>
                                    <th style={{ width: '160px' }}>Fecha y Hora</th>
                                    <th style={{ width: '140px' }}>Usuario</th>
                                    <th style={{ width: '130px' }}>Acción</th>
                                    <th>Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditoriaFiltrada.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="ad-empty">
                                            No hay registros de auditoría que coincidan con los filtros
                                        </td>
                                    </tr>
                                ) : (
                                    auditoriaFiltrada.map((a, index) => {
                                        const badge = getTipoBadge(a.accion);
                                        return (
                                            <tr key={index}>
                                                <td className="col-fecha">{formatearFecha(a.fecha)}</td>
                                                <td className="col-usuario">{a.usuario}</td>
                                                <td>
                                                    <span
                                                        className="ad-badge"
                                                        style={{
                                                            backgroundColor: badge.bg,
                                                            color: badge.color,
                                                            border: `1px solid ${badge.border}`
                                                        }}
                                                    >
                                                        {a.accion}
                                                    </span>
                                                </td>
                                                <td className="col-detalle">{a.detalle}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AuditoriaDireccion;