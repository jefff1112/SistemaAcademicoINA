// Componente ActivacionesPendientes: panel de gestión de estudiantes con activación de cuenta pendiente.
// Accesible por Director y Registro Académico.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { listarPendientes, reenviarCorreo, marcarEspera, activarPresencial } from '../../services/activacionesService';

const ActivacionesPendientes = () => {
    const [pendientes, setPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [modalEspera, setModalEspera] = useState(null);
    const [comentario, setComentario] = useState('');
    const [modalPresencial, setModalPresencial] = useState(null);
    const [passwordTemporal, setPasswordTemporal] = useState('');

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
            const data = await listarPendientes();
            setPendientes(data || []);
        } catch (err) {
            mostrarMensaje('Error al cargar activaciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReenviar = async (usuarioId) => {
        try {
            const res = await reenviarCorreo(usuarioId);
            mostrarMensaje(res?.mensaje || 'Correo reenviado', 'success');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error al reenviar', 'error');
        }
    };

    const handleEspera = async () => {
        try {
            const res = await marcarEspera(modalEspera, comentario);
            mostrarMensaje(res?.mensaje || 'Estudiante marcado en espera', 'success');
            setModalEspera(null);
            setComentario('');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error', 'error');
        }
    };

    const handlePresencial = async () => {
        if (!passwordTemporal || passwordTemporal.length < 8) {
            mostrarMensaje('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }
        try {
            const res = await activarPresencial(modalPresencial, passwordTemporal);
            mostrarMensaje(res?.mensaje || 'Cuenta activada presencialmente', 'success');
            setModalPresencial(null);
            setPasswordTemporal('');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error', 'error');
        }
    };

    const badgeToken = {
        'Válido': { bg: '#dcfce7', color: '#15803d' },
        'Expirado': { bg: '#fee2e2', color: '#b91c1c' },
        'Ya usado': { bg: '#e2e8f0', color: '#475569' },
        'Pendiente manual': { bg: '#fef9c3', color: '#a16207' }
    };

    return (
        <DashboardLayout title="Activaciones Pendientes">
            {message && (
                <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2', color: messageType === 'success' ? '#15803d' : '#b91c1c' }}>
                    {message}
                </div>
            )}

            <div className="card">
                <h3>Estudiantes con activación pendiente</h3>
                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estudiante</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Correo</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Fecha matrícula</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado del token</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendientes.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No hay activaciones pendientes</td></tr>
                                ) : (
                                    pendientes.map(p => {
                                        const badge = badgeToken[p.estadoToken] || { bg: '#e2e8f0', color: '#475569' };
                                        return (
                                            <tr key={p.usuarioId} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '8px' }}><strong>{p.nombre}</strong><br /><small>{p.codigo}</small></td>
                                                <td style={{ padding: '8px' }}>{p.correo || '-'}</td>
                                                <td style={{ padding: '8px', fontSize: '13px' }}>{p.fechaMatricula ? String(p.fechaMatricula).slice(0, 10) : '-'}</td>
                                                <td style={{ padding: '8px' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: badge.bg, color: badge.color }}>{p.estadoToken}</span>
                                                </td>
                                                <td style={{ padding: '8px' }}>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {(p.estadoToken === 'Expirado' || p.estadoToken === 'Pendiente manual') && (
                                                            <button onClick={() => handleReenviar(p.usuarioId)} style={{ padding: '5px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Reenviar correo</button>
                                                        )}
                                                        <button onClick={() => { setModalEspera(p.usuarioId); setComentario(''); }} style={{ padding: '5px 10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Marcar en espera</button>
                                                        <button onClick={() => { setModalPresencial(p.usuarioId); setPasswordTemporal(''); }} style={{ padding: '5px 10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Activar presencial</button>
                                                    </div>
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

            {modalEspera !== null && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ background: '#fff', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '24px' }}>
                        <h3>Marcar en espera</h3>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Comentario</label>
                        <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows="3" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setModalEspera(null)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleEspera} style={{ padding: '8px 20px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalPresencial !== null && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ background: '#fff', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '24px' }}>
                        <h3>Activar presencialmente</h3>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Contraseña temporal</label>
                        <input type="text" value={passwordTemporal} onChange={(e) => setPasswordTemporal(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="Mínimo 8 caracteres" />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setModalPresencial(null)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handlePresencial} style={{ padding: '8px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Activar</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ActivacionesPendientes;