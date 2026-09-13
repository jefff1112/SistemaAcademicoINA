// Componente Monitoreo de Espacio (Admin): muestra el uso de disco y alertas de capacidad.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getEspacioDisco } from '../../services/monitoreoService';

// Componente principal: consulta el espacio en disco y lo actualiza cada minuto.
const MonitoreoEspacio = () => {
    // Estados: datos de espacio en disco, indicador de carga y mensajes.
    const [espacio, setEspacio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Carga los datos de espacio al montar y programa una actualización por minuto.
    useEffect(() => {
        cargarDatos();
        const interval = setInterval(cargarDatos, 60000); // Actualizar cada minuto
        return () => clearInterval(interval);
    }, []);

    // Obtiene el estado del espacio en disco desde el backend.
    const cargarDatos = async () => {
        try {
            const data = await getEspacioDisco();
            setEspacio(data);
        } catch (error) {
            setMessage('Error al cargar datos de espacio');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    // Devuelve el color según el estado de uso del disco (crítico, advertencia u OK).
    const getStatusColor = (status) => {
        switch (status) {
            case 'CRITICO': return '#dc2626';
            case 'ADVERTENCIA': return '#e67e22';
            case 'OK': return '#16a34a';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Monitoreo de Espacio">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Monitoreo de Espacio en Disco">
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

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#3b82f6' }}>{espacio?.espacioTotalGB} GB</div>
                    <div className="stat-label">Espacio Total</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#16a34a' }}>{espacio?.espacioLibreGB} GB</div>
                    <div className="stat-label">Espacio Libre</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#e67e22' }}>{espacio?.espacioUsadoGB} GB</div>
                    <div className="stat-label">Espacio Usado</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: getStatusColor(espacio?.status) }}>
                        {espacio?.porcentajeUso}%
                    </div>
                    <div className="stat-label" style={{ color: getStatusColor(espacio?.status) }}>
                        {espacio?.status}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Detalle de Espacio</h3>
                <div style={{
                    width: '100%',
                    height: '30px',
                    background: '#e5e7eb',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    marginTop: '1rem'
                }}>
                    <div style={{
                        width: `${espacio?.porcentajeUso}%`,
                        height: '100%',
                        background: espacio?.porcentajeUso > 90 ? '#dc2626' : espacio?.porcentajeUso > 70 ? '#e67e22' : '#16a34a',
                        transition: 'width 0.5s ease'
                    }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '14px', color: '#6b7280' }}>
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>

                {espacio?.porcentajeUso > 90 && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#fee2e2',
                        borderRadius: '8px',
                        color: '#b91c1c',
                        border: '1px solid #dc2626'
                    }}>
                        ⚠️ ALERTA: Espacio en disco crítico. Por favor libere espacio.
                    </div>
                )}
                {espacio?.porcentajeUso > 70 && espacio?.porcentajeUso <= 90 && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#fef3c7',
                        borderRadius: '8px',
                        color: '#b45309',
                        border: '1px solid #e67e22'
                    }}>
                        ⚠️ ADVERTENCIA: El espacio en disco se está agotando.
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MonitoreoEspacio;