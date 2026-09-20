// Componente ActivacionesPendientes - MEJORADO
// Panel de gestión de estudiantes con activación de cuenta pendiente.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { listarPendientes, reenviarCorreo, marcarEspera, activarPresencial } from '../../services/activacionesService';

const ActivacionesPendientes = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [pendientes, setPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [modalEspera, setModalEspera] = useState(null);
    const [comentario, setComentario] = useState('');
    const [modalPresencial, setModalPresencial] = useState(null);
    const [passwordTemporal, setPasswordTemporal] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const data = await listarPendientes();
            setPendientes(data || []);
        } catch (err) {
            mostrarMensaje('Error al cargar activaciones', 'error');
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
    const handleReenviar = async (usuarioId) => {
        setSaving(true);
        try {
            const res = await reenviarCorreo(usuarioId);
            mostrarMensaje(res?.mensaje || 'Correo reenviado correctamente', 'success');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error al reenviar', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEspera = async () => {
        setSaving(true);
        try {
            const res = await marcarEspera(modalEspera, comentario);
            mostrarMensaje(res?.mensaje || 'Estudiante marcado en espera', 'success');
            setModalEspera(null);
            setComentario('');
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error al marcar en espera', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handlePresencial = async () => {
        if (!passwordTemporal || passwordTemporal.length < 8) {
            mostrarMensaje('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }
        setSaving(true);
        try {
            const res = await activarPresencial(modalPresencial, passwordTemporal);
            mostrarMensaje(res?.mensaje || 'Cuenta activada presencialmente', 'success');
            setModalPresencial(null);
            setPasswordTemporal('');
            setMostrarPassword(false);
            cargar();
        } catch (err) {
            mostrarMensaje(err.response?.data?.mensaje || 'Error al activar', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getBadgeToken = (estado) => {
        switch (estado) {
            case 'Válido': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Expirado': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'Ya usado': return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
            case 'Pendiente manual': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
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

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const pendientesFiltrados = useMemo(() => {
        if (!searchTerm.trim()) return pendientes;
        const t = searchTerm.toLowerCase();
        return pendientes.filter(p =>
            `${p.nombre} ${p.codigo} ${p.correo}`.toLowerCase().includes(t)
        );
    }, [pendientes, searchTerm]);

    const stats = useMemo(() => ({
        total: pendientes.length,
        validos: pendientes.filter(p => p.estadoToken === 'Válido').length,
        expirados: pendientes.filter(p => p.estadoToken === 'Expirado').length,
        pendientesManuales: pendientes.filter(p => p.estadoToken === 'Pendiente manual').length
    }), [pendientes]);

    const puedeReenviar = (p) => p.estadoToken === 'Expirado' || p.estadoToken === 'Pendiente manual';

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading && pendientes.length === 0) {
        return (
            <DashboardLayout title="Activaciones Pendientes">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Activaciones Pendientes">
            <style>{`
                .ap-container { display: flex; flex-direction: column; gap: 20px; }
                .ap-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .ap-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .ap-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .ap-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .ap-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .ap-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .ap-stat-total { background: #eff6ff; color: #1e40af; }
                .ap-stat-validos { background: #dcfce7; color: #15803d; }
                .ap-stat-expirados { background: #fee2e2; color: #b91c1c; }
                .ap-stat-manuales { background: #fef3c7; color: #b45309; }

                /* Búsqueda */
                .ap-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
                .ap-busqueda { padding: 9px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; min-width: 280px; transition: border-color .2s, box-shadow .2s; }
                .ap-busqueda:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }

                /* Botones */
                .ap-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .ap-btn:disabled { opacity: .6; cursor: not-allowed; }
                .ap-btn-primary { background: #1e3a5f; color: #fff; }
                .ap-btn-primary:hover:not(:disabled) { background: #16293f; }
                .ap-btn-info { background: #3b82f6; color: #fff; }
                .ap-btn-info:hover:not(:disabled) { background: #2563eb; }
                .ap-btn-warning { background: #e67e22; color: #fff; }
                .ap-btn-warning:hover:not(:disabled) { background: #d35400; }
                .ap-btn-success { background: #16a34a; color: #fff; }
                .ap-btn-success:hover:not(:disabled) { background: #15803d; }
                .ap-btn-secondary { background: #e5e7eb; color: #334155; }
                .ap-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .ap-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla */
                .ap-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
                .ap-tabla thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 11px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .ap-tabla thead th:first-child { border-top-left-radius: 8px; }
                .ap-tabla thead th:last-child { border-top-right-radius: 8px; }
                .ap-tabla tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .ap-tabla tbody tr:hover { background: #f8fafc; }
                .ap-tabla tbody tr:nth-child(even) { background: #fafbfc; }
                .ap-tabla tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .ap-tabla td { padding: 10px; color: #334155; vertical-align: middle; }

                .ap-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .ap-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .ap-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .ap-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .ap-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
                .ap-empty h3 { color: #475569; margin: 0 0 8px; }

                /* Modal */
                .ap-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .ap-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 500px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .ap-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .ap-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .ap-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .ap-modal-close:hover { color: #dc2626; }
                .ap-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .ap-modal textarea, .ap-modal input {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .ap-modal textarea { min-height: 100px; resize: vertical; }
                .ap-modal textarea:focus, .ap-modal input:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                .ap-input-group { position: relative; }
                .ap-input-group input { padding-right: 90px; }
                .ap-toggle-password {
                    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
                    background: #f1f5f9; border: none; border-radius: 6px;
                    padding: 6px 10px; font-size: 11px; font-weight: 600;
                    color: #475569; cursor: pointer; transition: all .2s;
                }
                .ap-toggle-password:hover { background: #e2e8f0; color: #1e293b; }

                .ap-info-box {
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
                }
                .ap-info-warning { background: #fef3c7; border-left: 4px solid #e67e22; color: #b45309; }
                .ap-info-primary { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }
                .ap-info-success { background: #dcfce7; border-left: 4px solid #16a34a; color: #15803d; }

                .ap-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 600px) {
                    .ap-tabla { font-size: 12px; }
                    .ap-tabla thead th, .ap-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="ap-container">
                {message && <div className={`ap-aviso ${messageType}`}>{message}</div>}

                {/* ESTADÍSTICAS */}
                <div className="ap-stats">
                    <div className="ap-stat ap-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total</span>
                    </div>
                    <div className="ap-stat ap-stat-validos">
                        <span className="num">{stats.validos}</span>
                        <span className="lbl">Tokens Válidos</span>
                    </div>
                    <div className="ap-stat ap-stat-expirados">
                        <span className="num">{stats.expirados}</span>
                        <span className="lbl">Tokens Expirados</span>
                    </div>
                    <div className="ap-stat ap-stat-manuales">
                        <span className="num">{stats.pendientesManuales}</span>
                        <span className="lbl">Pendientes Manuales</span>
                    </div>
                </div>

                {/* TABLA */}
                <div className="ap-card">
                    <h3>
                        Estudiantes con Activación Pendiente
                        <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px', fontWeight: 'normal' }}>
                            ({pendientesFiltrados.length} de {pendientes.length})
                        </span>
                    </h3>

                    <div className="ap-toolbar">
                        <input
                            type="text"
                            className="ap-busqueda"
                            placeholder="Buscar por nombre, código o correo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="ap-btn ap-btn-secondary" onClick={cargar} disabled={loading}>
                            {loading ? 'Cargando...' : 'Recargar'}
                        </button>
                    </div>

                    {loading ? (
                        <p className="ap-empty">Cargando activaciones...</p>
                    ) : pendientesFiltrados.length === 0 ? (
                        <div className="ap-empty">
                            <h3>No hay activaciones pendientes</h3>
                            <p>
                                {searchTerm
                                    ? 'Prueba con otro criterio de búsqueda.'
                                    : 'Todos los estudiantes han activado su cuenta.'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="ap-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '220px' }}>Estudiante</th>
                                        <th>Correo</th>
                                        <th style={{ width: '130px' }}>Fecha Matrícula</th>
                                        <th style={{ width: '160px', textAlign: 'center' }}>Estado del Token</th>
                                        <th style={{ width: '280px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendientesFiltrados.map(p => {
                                        const badge = getBadgeToken(p.estadoToken);
                                        return (
                                            <tr key={p.usuarioId}>
                                                <td>
                                                    <strong>{p.nombre}</strong>
                                                    <br />
                                                    <small style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}>
                                                        {p.codigo}
                                                    </small>
                                                </td>
                                                <td style={{ fontSize: '12px', color: '#475569' }}>
                                                    {p.correo || <em style={{ color: '#94a3b8' }}>Sin correo</em>}
                                                </td>
                                                <td style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {formatearFecha(p.fechaMatricula)}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        className="ap-badge"
                                                        style={{
                                                            backgroundColor: badge.bg,
                                                            color: badge.color,
                                                            border: `1px solid ${badge.border}`
                                                        }}
                                                    >
                                                        {p.estadoToken}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="ap-acciones">
                                                        {puedeReenviar(p) && (
                                                            <button
                                                                className="ap-btn ap-btn-info ap-btn-sm"
                                                                onClick={() => handleReenviar(p.usuarioId)}
                                                                disabled={saving}
                                                            >
                                                                Reenviar Correo
                                                            </button>
                                                        )}
                                                        <button
                                                            className="ap-btn ap-btn-warning ap-btn-sm"
                                                            onClick={() => { setModalEspera(p.usuarioId); setComentario(''); }}
                                                            disabled={saving}
                                                        >
                                                            Marcar en Espera
                                                        </button>
                                                        <button
                                                            className="ap-btn ap-btn-success ap-btn-sm"
                                                            onClick={() => { setModalPresencial(p.usuarioId); setPasswordTemporal(''); setMostrarPassword(false); }}
                                                            disabled={saving}
                                                        >
                                                            Activar Presencial
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

            {/* MODAL ESPERA */}
            {modalEspera !== null && (
                <div className="ap-modal-overlay" onClick={() => !saving && setModalEspera(null)}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h3>Marcar en Espera</h3>
                            <button className="ap-modal-close" onClick={() => setModalEspera(null)} disabled={saving}>X</button>
                        </div>

                        <div className="ap-info-box ap-info-warning">
                            El estudiante quedará marcado como <strong>pendiente de activación</strong>. Podrás reenviar el correo o activar la cuenta manualmente después.
                        </div>

                        <label style={{ display: 'block', fontWeight: '600', color: '#34495e', fontSize: '13px', marginBottom: '6px' }}>
                            Comentario (opcional)
                        </label>
                        <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Ej: El estudiante no recibió el correo, se contactará por teléfono..."
                            autoFocus
                        />

                        <div className="ap-modal-actions">
                            <button
                                className="ap-btn ap-btn-secondary"
                                onClick={() => setModalEspera(null)}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                className="ap-btn ap-btn-warning"
                                onClick={handleEspera}
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PRESENCIAL */}
            {modalPresencial !== null && (
                <div className="ap-modal-overlay" onClick={() => !saving && setModalPresencial(null)}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h3>Activar Cuenta Presencialmente</h3>
                            <button className="ap-modal-close" onClick={() => setModalPresencial(null)} disabled={saving}>X</button>
                        </div>

                        <div className="ap-info-box ap-info-primary">
                            Establece una <strong>contraseña temporal</strong> para el estudiante. Podrá cambiarla al iniciar sesión por primera vez.
                        </div>

                        <label style={{ display: 'block', fontWeight: '600', color: '#34495e', fontSize: '13px', marginBottom: '6px' }}>
                            Contraseña Temporal *
                        </label>
                        <div className="ap-input-group">
                            <input
                                type={mostrarPassword ? 'text' : 'password'}
                                value={passwordTemporal}
                                onChange={(e) => setPasswordTemporal(e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                autoFocus
                            />
                            <button
                                type="button"
                                className="ap-toggle-password"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                            >
                                {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>
                        <small style={{
                            display: 'block',
                            marginTop: '6px',
                            fontSize: '12px',
                            color: passwordTemporal.length >= 8 ? '#15803d' : '#94a3b8'
                        }}>
                            {passwordTemporal.length} / 8 caracteres
                            {passwordTemporal.length >= 8 && ' - Listo para activar'}
                        </small>

                        <div className="ap-modal-actions">
                            <button
                                className="ap-btn ap-btn-secondary"
                                onClick={() => setModalPresencial(null)}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                className="ap-btn ap-btn-success"
                                onClick={handlePresencial}
                                disabled={saving || passwordTemporal.length < 8}
                            >
                                {saving ? 'Activando...' : 'Activar Cuenta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ActivacionesPendientes;