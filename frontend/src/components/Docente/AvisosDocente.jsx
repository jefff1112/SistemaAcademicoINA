// Componente AvisosDocente: muestra los avisos internos activos publicados para el docente.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: listado de avisos internos vigentes para el docente.
const AvisosDocente = () => {
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        cargarAvisos();
    }, []);

    // Carga los avisos internos activos desde la API.
    const cargarAvisos = async () => {
        setLoading(true);
        try {
            const response = await API.get('/avisosinternos/activos');
            setAvisos(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar avisos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    const getPrioridadColor = (prioridad) => {
        switch (prioridad) {
            case 'alta': return '#dc2626';
            case 'media': return '#f59e0b';
            case 'baja': return '#16a34a';
            default: return '#6b7280';
        }
    };

    const getPrioridadLabel = (prioridad) => {
        switch (prioridad) {
            case 'alta': return 'Alta';
            case 'media': return 'Media';
            case 'baja': return 'Baja';
            default: return prioridad;
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Avisos">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Avisos - Docente">
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
                <h3>Avisos Internos</h3>
                {avisos.length === 0 ? (
                    <p>No hay avisos disponibles.</p>
                ) : (
                    avisos.map((a) => (
                        <div key={a.idAviso} style={{
                            padding: '12px 16px',
                            marginBottom: '8px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${getPrioridadColor(a.prioridad)}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <strong>{a.titulo}</strong>
                                    <span style={{
                                        marginLeft: '8px',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        backgroundColor: getPrioridadColor(a.prioridad),
                                        color: '#fff'
                                    }}>
                                        {getPrioridadLabel(a.prioridad)}
                                    </span>
                                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#4b5563' }}>{a.contenido}</p>
                                    <small style={{ color: '#9ca3af' }}>
                                        Publicado: {new Date(a.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
};

export default AvisosDocente;