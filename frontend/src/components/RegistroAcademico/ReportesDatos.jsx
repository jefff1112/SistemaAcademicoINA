// Componente ReportesDatos - MEJORADO
// Panel de gestión de reportes de datos incorrectos de estudiantes.
// Accesible por Director y Registro Académico.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { listarReportes, aprobarReporte, rechazarReporte, marcarEnRevision } from '../../services/reportesService';

const ReportesDatos = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [modalRechazo, setModalRechazo] = useState(null);
    const [motivo, setMotivo] = useState('');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargar();
    }, [filtroEstado]);

    const cargar = async () => {
        setLoading(true);
        try {
            const data = await listarReportes(filtroEstado ? { estado: filtroEstado } : {});
            setReportes(data || []);
        } catch (err) {
            mostrarMensaje('Error al cargar reportes', 'error');
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
    // ACCIONES
    // ============================================================
    const handleAprobar = async (id) => {
        setSaving(true);
        try {
            const res = await aprobarReporte(id);
            mostrarMensaje(res?.mensaje || 'Reporte aprobado correctamente', 'success');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error al aprobar', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRechazar = async () => {
        if (!motivo.trim()) {
            mostrarMensaje('El motivo de rechazo es obligatorio', 'error');
            return;
        }
        setSaving(true);
        try {
            const res = await rechazarReporte(modalRechazo, motivo);
            mostrarMensaje(res?.mensaje || 'Reporte rechazado correctamente', 'success');
            setModalRechazo(null);
            setMotivo('');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error al rechazar', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRevision = async (id) => {
        setSaving(true);
        try {
            await marcarEnRevision(id);
            mostrarMensaje('Reporte marcado en revisión', 'success');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error al marcar en revisión', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getBadgeEstado = (estado) => {
        switch (estado) {
            case 'Pendiente': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'EnRevision': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            case 'Aprobado': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Rechazado': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    const getEstadoLabel = (estado) => {
        switch (estado) {
            case 'EnRevision': return 'En Revisión';
            default: return estado;
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-SV', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatearCampo = (campo) => {
        if (!campo) return '';
        return campo
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const reportesFiltrados = useMemo(() => {
        if (!searchTerm.trim()) return reportes;
        const t = searchTerm.toLowerCase();
        return reportes.filter(r =>
            `${r.nombreEstudiante} ${r.codigoEstudiante} ${r.campo} ${r.valorPropuesto}`.toLowerCase().includes(t)
        );
    }, [reportes, searchTerm]);

    const stats = useMemo(() => ({
        total: reportes.length,
        pendientes: reportes.filter(r => r.estado === 'Pendiente').length,
        enRevision: reportes.filter(r => r.estado === 'EnRevision').length,
        aprobados: reportes.filter(r => r.estado === 'Aprobado').length,
        rechazados: reportes.filter(r => r.estado === 'Rechazado').length
    }), [reportes]);

    const filtrosActivos = (filtroEstado ? 1 : 0) + (searchTerm ? 1 : 0);

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout title="Reportes de Datos - Dirección / Registro">
            <style>{`
                .rd-container { display: flex; flex-direction: column; gap: 20px; }
                .rd-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .rd-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .rd-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
                .rd-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .rd-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .rd-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .rd-stat-total { background: #eff6ff; color: #1e40af; }
                .rd-stat-pendientes { background: #fef3c7; color: #b45309; }
                .rd-stat-revision { background: #dbeafe; color: #1d4ed8; }
                .rd-stat-aprobados { background: #dcfce7; color: #15803d; }
                .rd-stat-rechazados { background: #fee2e2; color: #b91c1c; }

                /* Filtros */
                .rd-filtros { display: grid; grid-template-columns: 1fr 2fr auto; gap: 14px; align-items: end; }
                .rd-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .rd-field input, .rd-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .rd-field input:focus, .rd-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .rd-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .rd-btn:disabled { opacity: .6; cursor: not-allowed; }
                .rd-btn-primary { background: #1e3a5f; color: #fff; }
                .rd-btn-primary:hover:not(:disabled) { background: #16293f; }
                .rd-btn-success { background: #16a34a; color: #fff; }
                .rd-btn-success:hover:not(:disabled) { background: #15803d; }
                .rd-btn-info { background: #3b82f6; color: #fff; }
                .rd-btn-info:hover:not(:disabled) { background: #2563eb; }
                .rd-btn-danger { background: #dc2626; color: #fff; }
                .rd-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .rd-btn-secondary { background: #e5e7eb; color: #334155; }
                .rd-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .rd-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla */
                .rd-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
                .rd-tabla thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 11px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .rd-tabla thead th:first-child { border-top-left-radius: 8px; }
                .rd-tabla thead th:last-child { border-top-right-radius: 8px; }
                .rd-tabla tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .rd-tabla tbody tr:hover { background: #f8fafc; }
                .rd-tabla tbody tr:nth-child(even) { background: #fafbfc; }
                .rd-tabla tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .rd-tabla td { padding: 10px; color: #334155; vertical-align: top; }

                .rd-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                /* Comparación de valores */
                .rd-comparacion { display: flex; flex-direction: column; gap: 4px; }
                .rd-valor-actual {
                    font-size: 12px; color: #94a3b8; text-decoration: line-through;
                }
                .rd-valor-propuesto {
                    font-size: 13px; font-weight: 600; color: #16a34a;
                }

                .rd-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .rd-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .rd-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .rd-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
                .rd-empty h3 { color: #475569; margin: 0 0 8px; }

                /* Modal */
                .rd-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .rd-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 500px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .rd-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .rd-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .rd-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .rd-modal-close:hover { color: #dc2626; }
                .rd-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .rd-modal textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; min-height: 100px; resize: vertical;
                }
                .rd-modal textarea:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Badge filtros activos */
                .rd-badge-filtros {
                    display: inline-block;
                    background: #3b82f6;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 10px;
                    margin-left: 8px;
                }

                @media (max-width: 900px) {
                    .rd-filtros { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .rd-filtros { grid-template-columns: 1fr; }
                    .rd-tabla { font-size: 12px; }
                    .rd-tabla thead th, .rd-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="rd-container">
                {message && <div className={`rd-aviso ${messageType}`}>{message}</div>}

                {/* ESTADÍSTICAS */}
                <div className="rd-stats">
                    <div className="rd-stat rd-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total</span>
                    </div>
                    <div className="rd-stat rd-stat-pendientes">
                        <span className="num">{stats.pendientes}</span>
                        <span className="lbl">Pendientes</span>
                    </div>
                    <div className="rd-stat rd-stat-revision">
                        <span className="num">{stats.enRevision}</span>
                        <span className="lbl">En Revisión</span>
                    </div>
                    <div className="rd-stat rd-stat-aprobados">
                        <span className="num">{stats.aprobados}</span>
                        <span className="lbl">Aprobados</span>
                    </div>
                    <div className="rd-stat rd-stat-rechazados">
                        <span className="num">{stats.rechazados}</span>
                        <span className="lbl">Rechazados</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="rd-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="rd-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="rd-filtros">
                        <div className="rd-field">
                            <label>Estado</label>
                            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                                <option value="">Todos los estados</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="EnRevision">En Revisión</option>
                                <option value="Aprobado">Aprobado</option>
                                <option value="Rechazado">Rechazado</option>
                            </select>
                        </div>
                        <div className="rd-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por estudiante, código, campo o valor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="rd-btn rd-btn-primary" onClick={cargar} disabled={loading}>
                                {loading ? 'Cargando...' : 'Recargar'}
                            </button>
                            {filtrosActivos > 0 && (
                                <button
                                    className="rd-btn rd-btn-secondary"
                                    onClick={() => { setFiltroEstado(''); setSearchTerm(''); }}
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="rd-card">
                    <h3>
                        Reportes de Datos de Estudiantes
                        <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px', fontWeight: 'normal' }}>
                            ({reportesFiltrados.length} de {reportes.length})
                        </span>
                    </h3>

                    {loading ? (
                        <p className="rd-empty">Cargando reportes...</p>
                    ) : reportesFiltrados.length === 0 ? (
                        <div className="rd-empty">
                            <h3>No hay reportes</h3>
                            <p>
                                {filtrosActivos > 0
                                    ? 'Prueba ajustando los filtros o la búsqueda.'
                                    : 'No hay reportes de datos pendientes.'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="rd-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '200px' }}>Estudiante</th>
                                        <th style={{ width: '140px' }}>Campo</th>
                                        <th>Valor Actual</th>
                                        <th>Valor Propuesto</th>
                                        <th style={{ width: '130px', textAlign: 'center' }}>Estado</th>
                                        <th style={{ width: '100px' }}>Fecha</th>
                                        <th style={{ width: '220px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportesFiltrados.map(r => {
                                        const badge = getBadgeEstado(r.estado);
                                        return (
                                            <tr key={r.id}>
                                                <td>
                                                    <strong>{r.nombreEstudiante}</strong>
                                                    <br />
                                                    <small style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                                                        {r.codigoEstudiante}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '3px 10px',
                                                        background: '#f1f5f9',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: '#475569'
                                                    }}>
                                                        {formatearCampo(r.campo)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="rd-valor-actual">
                                                        {r.valorActual || '(vacío)'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="rd-valor-propuesto">
                                                        {r.valorPropuesto}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        className="rd-badge"
                                                        style={{
                                                            backgroundColor: badge.bg,
                                                            color: badge.color,
                                                            border: `1px solid ${badge.border}`
                                                        }}
                                                    >
                                                        {getEstadoLabel(r.estado)}
                                                    </span>
                                                    {r.motivoRechazo && (
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#b91c1c',
                                                            marginTop: '6px',
                                                            padding: '4px 6px',
                                                            background: '#fee2e2',
                                                            borderRadius: '4px',
                                                            textAlign: 'left'
                                                        }}>
                                                            <strong>Motivo:</strong> {r.motivoRechazo}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {formatearFecha(r.fechaCreacion)}
                                                </td>
                                                <td>
                                                    {r.estado !== 'Aprobado' && r.estado !== 'Rechazado' ? (
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            <button
                                                                className="rd-btn rd-btn-success rd-btn-sm"
                                                                onClick={() => handleAprobar(r.id)}
                                                                disabled={saving}
                                                            >
                                                                Aprobar
                                                            </button>
                                                            <button
                                                                className="rd-btn rd-btn-danger rd-btn-sm"
                                                                onClick={() => { setModalRechazo(r.id); setMotivo(''); }}
                                                                disabled={saving}
                                                            >
                                                                Rechazar
                                                            </button>
                                                            {r.estado === 'Pendiente' && (
                                                                <button
                                                                    className="rd-btn rd-btn-info rd-btn-sm"
                                                                    onClick={() => handleRevision(r.id)}
                                                                    disabled={saving}
                                                                >
                                                                    En Revisión
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                            {r.estado === 'Aprobado' ? 'Reporte aprobado' : 'Reporte rechazado'}
                                                        </span>
                                                    )}
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

            {/* MODAL RECHAZO */}
            {modalRechazo !== null && (
                <div className="rd-modal-overlay" onClick={() => !saving && setModalRechazo(null)}>
                    <div className="rd-modal" onClick={e => e.stopPropagation()}>
                        <div className="rd-modal-header">
                            <h3>Rechazar Reporte</h3>
                            <button className="rd-modal-close" onClick={() => setModalRechazo(null)} disabled={saving}>X</button>
                        </div>

                        <div style={{ background: '#fee2e2', borderLeft: '4px solid #dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#b91c1c' }}>
                            El motivo del rechazo es <strong>obligatorio</strong> y será visible para el estudiante que hizo la solicitud.
                        </div>

                        <label style={{ display: 'block', fontWeight: '600', color: '#34495e', fontSize: '13px', marginBottom: '6px' }}>
                            Motivo del Rechazo *
                        </label>
                        <textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Explica por qué se rechaza este cambio de datos..."
                            autoFocus
                        />

                        <div className="rd-modal-actions">
                            <button
                                className="rd-btn rd-btn-secondary"
                                onClick={() => setModalRechazo(null)}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                className="rd-btn rd-btn-danger"
                                onClick={handleRechazar}
                                disabled={saving || !motivo.trim()}
                            >
                                {saving ? 'Rechazando...' : 'Rechazar Reporte'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ReportesDatos;