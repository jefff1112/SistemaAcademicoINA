// Componente ReportesDatos: panel de gestión de reportes de datos incorrectos de estudiantes.
// Accesible por Director y Registro Académico.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { listarReportes, aprobarReporte, rechazarReporte, marcarEnRevision } from '../../services/reportesService';

const ReportesDatos = () => {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [modalRechazo, setModalRechazo] = useState(null);
    const [motivo, setMotivo] = useState('');

    useEffect(() => {
        cargar();
    }, []);

    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    const cargar = async () => {
        try {
            const data = await listarReportes(filtroEstado ? { estado: filtroEstado } : {});
            setReportes(data || []);
        } catch (err) {
            mostrarMensaje('Error al cargar reportes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (id) => {
        try {
            const res = await aprobarReporte(id);
            mostrarMensaje(res?.mensaje || 'Reporte aprobado', 'success');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error al aprobar', 'error');
        }
    };

    const handleRechazar = async () => {
        if (!motivo.trim()) {
            mostrarMensaje('El motivo de rechazo es obligatorio', 'error');
            return;
        }
        try {
            const res = await rechazarReporte(modalRechazo, motivo);
            mostrarMensaje(res?.mensaje || 'Reporte rechazado', 'success');
            setModalRechazo(null);
            setMotivo('');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error al rechazar', 'error');
        }
    };

    const handleRevision = async (id) => {
        try {
            await marcarEnRevision(id);
            mostrarMensaje('Reporte marcado en revisión', 'success');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error', 'error');
        }
    };

    const filtrados = reportes.filter(r => {
        if (!searchTerm) return true;
        const t = searchTerm.toLowerCase();
        return `${r.nombreEstudiante} ${r.codigoEstudiante} ${r.campo}`.toLowerCase().includes(t);
    });

    const badgeEstado = {
        Pendiente: { bg: '#fef9c3', color: '#a16207' },
        EnRevision: { bg: '#e0f2fe', color: '#0369a1' },
        Aprobado: { bg: '#dcfce7', color: '#15803d' },
        Rechazado: { bg: '#fee2e2', color: '#b91c1c' }
    };

    return (
        <DashboardLayout title="Reportes de Datos">
            {message && (
                <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2', color: messageType === 'success' ? '#15803d' : '#b91c1c' }}>
                    {message}
                </div>
            )}

            <div className="card">
                <h3>Reportes de Datos de Estudiantes</h3>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); }} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}>
                        <option value="">Todos los estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="EnRevision">En revisión</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Rechazado">Rechazado</option>
                    </select>
                    <button onClick={cargar} style={{ padding: '8px 16px', background: '#1A2E6B', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Filtrar</button>
                    <input type="text" placeholder="Buscar estudiante o campo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>

                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estudiante</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Campo</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Valor actual</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Valor propuesto</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>No hay reportes</td></tr>
                                ) : (
                                    filtrados.map(r => {
                                        const badge = badgeEstado[r.estado] || { bg: '#e2e8f0', color: '#475569' };
                                        return (
                                            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '8px' }}><strong>{r.nombreEstudiante}</strong><br /><small>{r.codigoEstudiante}</small></td>
                                                <td style={{ padding: '8px' }}>{r.campo}</td>
                                                <td style={{ padding: '8px' }}>{r.valorActual || '-'}</td>
                                                <td style={{ padding: '8px', fontWeight: '500' }}>{r.valorPropuesto}</td>
                                                <td style={{ padding: '8px' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: badge.bg, color: badge.color }}>{r.estado}</span>
                                                    {r.motivoRechazo && <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px' }}>Motivo: {r.motivoRechazo}</div>}
                                                </td>
                                                <td style={{ padding: '8px', fontSize: '13px' }}>{String(r.fechaCreacion).slice(0, 10)}</td>
                                                <td style={{ padding: '8px' }}>
                                                    {r.estado !== 'Aprobado' && r.estado !== 'Rechazado' && (
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            <button onClick={() => handleAprobar(r.id)} style={{ padding: '5px 10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Aprobar</button>
                                                            <button onClick={() => { setModalRechazo(r.id); setMotivo(''); }} style={{ padding: '5px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Rechazar</button>
                                                            {r.estado === 'Pendiente' && (
                                                                <button onClick={() => handleRevision(r.id)} style={{ padding: '5px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>En revisión</button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalRechazo !== null && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ background: '#fff', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '24px' }}>
                        <h3>Rechazar reporte</h3>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Motivo (obligatorio)</label>
                        <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows="3" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setModalRechazo(null)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleRechazar} style={{ padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Rechazar</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ReportesDatos;