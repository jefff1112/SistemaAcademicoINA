// Componente NotificacionesCampanita: campana de notificaciones con contador y dropdown para el usuario autenticado.
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { FaBell } from 'react-icons/fa';

// Componente principal: muestra el ícono, el badge de no leídas y el panel desplegable.
const NotificacionesCampanita = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Carga las notificaciones al montar y cada 30 segundos.
    useEffect(() => {
        cargarNotificaciones();
        const interval = setInterval(cargarNotificaciones, 30000);
        return () => clearInterval(interval);
    }, []);

    // Cierra el dropdown al hacer clic fuera del componente.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMostrarDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Consulta las notificaciones a la API y calcula las no leídas.
    const cargarNotificaciones = async () => {
        try {
            const response = await API.get('/notificaciones');
            const data = response.data || [];
            const noLeidasCount = data.filter(n => !n.leida).length;
            setNoLeidas(noLeidasCount);
            // Mostrar hasta 8 notificaciones en el dropdown
            setNotificaciones(data.slice(0, 8));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Marca una notificación individual como leída.
    const marcarLeida = async (id) => {
        try {
            await API.post(`/notificaciones/marcar-leida/${id}`);
            cargarNotificaciones();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Marca todas las notificaciones como leídas.
    const marcarTodasLeidas = async () => {
        try {
            const noLeidasList = notificaciones.filter(n => !n.leida);
            for (const n of noLeidasList) {
                await API.post(`/notificaciones/marcar-leida/${n.id}`);
            }
            cargarNotificaciones();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const verTodas = () => {
        setMostrarDropdown(false);
        navigate('/admin/notificaciones');
    };

    const getTiempoRelativo = (fecha) => {
        const ahora = new Date();
        const fechaNoti = new Date(fecha);
        const diffMs = ahora - fechaNoti;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMs / 3600000);
        const diffDias = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'Ahora';
        if (diffMin < 60) return diffMin + ' min';
        if (diffHoras < 24) return diffHoras + ' h';
        if (diffDias < 7) return diffDias + ' d';
        return fechaNoti.toLocaleDateString();
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
            <button
                onClick={() => setMostrarDropdown(!mostrarDropdown)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#1e3a5f',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Notificaciones"
            >
                <FaBell />
                {noLeidas > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0px',
                        right: '0px',
                        background: '#dc2626',
                        color: '#fff',
                        borderRadius: '50%',
                        fontSize: '11px',
                        minWidth: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        padding: '0 4px'
                    }}>
                        {noLeidas > 99 ? '99+' : noLeidas}
                    </span>
                )}
            </button>

            {mostrarDropdown && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '400px',
                    maxHeight: '500px',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    zIndex: 999,
                    border: '1px solid #e5e7eb'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8fafc'
                    }}>
                        <span style={{
                            fontWeight: '600',
                            color: '#1e3a5f',
                            fontSize: '16px'
                        }}>
                            Notificaciones
                            {noLeidas > 0 && (
                                <span style={{
                                    marginLeft: '8px',
                                    background: '#dc2626',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    padding: '2px 12px',
                                    fontSize: '12px'
                                }}>
                                    {noLeidas} nuevas
                                </span>
                            )}
                        </span>
                        {noLeidas > 0 && (
                            <button
                                onClick={marcarTodasLeidas}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#3b82f6',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    padding: '4px 8px'
                                }}
                            >
                                Marcar todas como leidas
                            </button>
                        )}
                    </div>

                    {/* Lista de notificaciones */}
                    <div style={{
                        maxHeight: '380px',
                        overflowY: 'auto',
                        padding: '4px 0'
                    }}>
                        {loading ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                                Cargando...
                            </div>
                        ) : notificaciones.length === 0 ? (
                            <div style={{
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: '#999'
                            }}>
                                <FaBell size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                <p style={{ fontSize: '15px' }}>No hay notificaciones</p>
                            </div>
                        ) : (
                            notificaciones.map((n) => (
                                <div
                                    key={n.id}
                                    style={{
                                        padding: '14px 20px',
                                        borderBottom: '1px solid #f3f4f6',
                                        background: !n.leida ? '#eff6ff' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={() => { if (!n.leida) marcarLeida(n.id); }}
                                    onMouseEnter={(e) => {
                                        if (!n.leida) e.currentTarget.style.background = '#dbeafe';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!n.leida) e.currentTarget.style.background = '#eff6ff';
                                        else e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: !n.leida ? '600' : '500',
                                                color: '#1e3a5f',
                                                marginBottom: '4px'
                                            }}>
                                                {n.titulo}
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#4b5563',
                                                lineHeight: '1.4',
                                                marginBottom: '4px'
                                            }}>
                                                {n.mensaje}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#9ca3af',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span>{getTiempoRelativo(n.fecha)}</span>
                                                {!n.leida && (
                                                    <span style={{
                                                        background: '#3b82f6',
                                                        color: '#fff',
                                                        borderRadius: '10px',
                                                        padding: '1px 10px',
                                                        fontSize: '10px'
                                                    }}>
                                                        Nueva
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '12px 20px',
                        borderTop: '1px solid #e5e7eb',
                        textAlign: 'center',
                        background: '#f8fafc'
                    }}>
                        <button
                            onClick={verTodas}
                            style={{
                                background: '#1e3a5f',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                padding: '8px 24px',
                                borderRadius: '6px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#152b45'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#1e3a5f'}
                        >
                            Ver todas las notificaciones
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificacionesCampanita;