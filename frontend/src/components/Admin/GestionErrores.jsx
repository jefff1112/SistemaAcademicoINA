// Componente Gestión de Errores (Admin): lista, resuelve y elimina errores del sistema.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra el registro de errores con filtro por estado.
const GestionErrores = () => {
    // Estados: lista de errores, filtro de estado y mensajes de retroalimentación.
    const [errores, setErrores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todos');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Carga los errores al montar el componente o al cambiar el filtro.
    useEffect(() => {
        cargarErrores();
    }, [filtro]);

    // Obtiene los errores del sistema desde el backend según el filtro activo.
    const cargarErrores = async () => {
        setLoading(true);
        try {
            const soloNoResueltos = filtro === 'noResueltos';
            // Petición GET /errores con filtro opcional de solo los no resueltos.
            const response = await API.get(`/errores?soloNoResueltos=${soloNoResueltos}`);
            setErrores(response.data || []);
        } catch (error) {
            setMessage('Error al cargar errores');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    // Marca un error como resuelto y refresca la lista.
    const marcarResuelto = async (id) => {
        try {
            // Petición PUT /errores/{id}/resolver para actualizar el estado del error.
            await API.put(`/errores/${id}/resolver`);
            setMessage('Error marcado como resuelto');
            setMessageType('success');
            cargarErrores();
        } catch (error) {
            setMessage('Error al marcar como resuelto');
            setMessageType('error');
        }
    };

    // Elimina un error del registro tras confirmar con el usuario.
    const eliminarError = async (id) => {
        if (!window.confirm('¿Eliminar este error?')) return;
        try {
            // Petición DELETE /errores/{id} para borrar el error.
            await API.delete(`/errores/${id}`);
            setMessage('Error eliminado');
            setMessageType('success');
            cargarErrores();
        } catch (error) {
            setMessage('Error al eliminar');
            setMessageType('error');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Errores del Sistema">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Errores del Sistema">
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
                <div className="filters-row">
                    <select
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="filter-select"
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                        <option value="todos">Todos los errores</option>
                        <option value="noResueltos">No resueltos</option>
                    </select>
                    <button className="btn-primary" onClick={cargarErrores} style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Actualizar
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Mensaje</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Usuario</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Ruta</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {errores.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay errores registrados
                                    </td>
                                </tr>
                            ) : (
                                errores.map((e) => (
                                    <tr key={e.idError} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{new Date(e.fecha).toLocaleString()}</td>
                                        <td style={{ padding: '8px' }}><strong>{e.mensaje}</strong></td>
                                        <td style={{ padding: '8px' }}>{e.usuario || '-'}</td>
                                        <td style={{ padding: '8px' }}>{e.ruta || '-'}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: e.resuelto ? '#dcfce7' : '#fee2e2',
                                                color: e.resuelto ? '#15803d' : '#b91c1c'
                                            }}>
                                                {e.resuelto ? 'Resuelto' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {!e.resuelto && (
                                                <button className="btn-success" onClick={() => marcarResuelto(e.idError)} style={{ padding: '4px 12px', marginRight: '4px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Resolver
                                                </button>
                                            )}
                                            <button className="btn-danger" onClick={() => eliminarError(e.idError)} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GestionErrores;