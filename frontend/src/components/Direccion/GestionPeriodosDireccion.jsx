// Componente Gestión de Periodos (Dirección): administra los periodos académicos y su estado activo.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: crea, edita, elimina y activa/desactiva periodos académicos.
const GestionPeriodosDireccion = () => {
    // Estados: lista de periodos, periodo activo, modal, formulario y mensajes.
    const [periodos, setPeriodos] = useState([]);
    const [periodoActivo, setPeriodoActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPeriodo, setEditingPeriodo] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        anioLectivo: new Date().getFullYear(),
        numeroPeriodo: 1,
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        estado: 'Cerrado'
    });

    // Carga los periodos y el periodo activo al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene en paralelo la lista de periodos y el periodo activo desde la API.
    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Petición GET /periodosacademicos para listar todos los periodos.
            const periodosRes = await API.get('/periodosacademicos');
            setPeriodos(periodosRes.data || []);

            // Petición GET /periodosacademicos/activo para obtener el periodo activo.
            // Un 404 es un caso normal: significa que no hay ningun periodo activo.
            let activo = null;
            try {
                const activoRes = await API.get('/periodosacademicos/activo');
                activo = activoRes.data || null;
            } catch (activoError) {
                if (activoError.response?.status !== 404) {
                    throw activoError;
                }
            }
            setPeriodoActivo(activo);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Muestra un mensaje temporal al usuario y lo limpia después de 4 segundos.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Abre el modal para crear un periodo o editar el seleccionado.
    const handleOpenModal = (periodo = null) => {
        if (periodo) {
            setEditingPeriodo(periodo);
            setFormData({
                anioLectivo: periodo.anioLectivo || new Date().getFullYear(),
                numeroPeriodo: periodo.numeroPeriodo || 1,
                nombre: periodo.nombre || '',
                fechaInicio: periodo.fechaInicio ? new Date(periodo.fechaInicio).toISOString().split('T')[0] : '',
                fechaFin: periodo.fechaFin ? new Date(periodo.fechaFin).toISOString().split('T')[0] : '',
                estado: periodo.estado || 'Cerrado'
            });
        } else {
            setEditingPeriodo(null);
            setFormData({
                anioLectivo: new Date().getFullYear(),
                numeroPeriodo: 1,
                nombre: '',
                fechaInicio: '',
                fechaFin: '',
                estado: 'Cerrado'
            });
        }
        setShowModal(true);
    };

    // Valida y crea o actualiza el periodo académico.
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPeriodo) {
                // Petición PUT /periodosacademicos/{id} para actualizar el periodo.
                await API.put(`/periodosacademicos/${editingPeriodo.idPeriodo}`, formData);
                mostrarMensaje('Periodo actualizado correctamente', 'success');
            } else {
                // Petición POST /periodosacademicos para crear un nuevo periodo.
                await API.post('/periodosacademicos', formData);
                mostrarMensaje('Periodo creado correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        }
    };

    // Elimina un periodo académico tras confirmar con el usuario.
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`Eliminar el periodo "${nombre}"?`)) return;
        try {
            // Petición DELETE /periodosacademicos/{id} para borrar el periodo.
            await API.delete(`/periodosacademicos/${id}`);
            mostrarMensaje('Periodo eliminado correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar periodo', 'error');
        }
    };

    // ✅ CORREGIDO: Función async
    // Activa o desactiva un periodo, verificando que solo haya uno activo por año.
    const handleToggleEstado = async (periodo) => {
        const nuevoEstado = periodo.estado === 'Activo' ? 'Cerrado' : 'Activo';

        // Si se va a activar, verificar que no haya otro periodo activo en el mismo año
        if (nuevoEstado === 'Activo') {
            try {
                // Petición GET /periodosacademicos para validar periodos activos del año.
                const response = await API.get('/periodosacademicos');
                const existeOtroActivo = response.data.some(p =>
                    p.estado === 'Activo' &&
                    p.anioLectivo === periodo.anioLectivo &&
                    p.idPeriodo !== periodo.idPeriodo
                );

                if (existeOtroActivo) {
                    mostrarMensaje('Ya hay un periodo activo para este año lectivo. Desactivelo primero.', 'error');
                    return;
                }
            } catch (error) {
                mostrarMensaje('Error al verificar periodos activos', 'error');
                return;
            }
        }

        try {
            // Petición PUT /periodosacademicos/{id} para cambiar el estado del periodo.
            await API.put(`/periodosacademicos/${periodo.idPeriodo}`, { ...periodo, estado: nuevoEstado });
            mostrarMensaje(`Periodo ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente`, 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al cambiar estado', 'error');
        }
    };

    // Devuelve el color según el estado del periodo.
    const getEstadoColor = (estado) => {
        if (estado === 'Activo') return '#16a34a';
        if (estado === 'Cerrado') return '#dc2626';
        return '#e67e22';
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Periodos">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Periodos Academicos - Direccion">
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

            {periodoActivo && (
                <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
                    <h3>Periodo Activo</h3>
                    <p><strong>{periodoActivo.nombre}</strong> - {periodoActivo.anioLectivo}</p>
                    <p>Del {new Date(periodoActivo.fechaInicio).toLocaleDateString()} al {new Date(periodoActivo.fechaFin).toLocaleDateString()}</p>
                </div>
            )}

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Periodos Academicos</h3>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Nuevo Periodo
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Año</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Periodo</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Fecha Inicio</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Fecha Fin</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {periodos.map((p) => (
                                <tr key={p.idPeriodo} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '8px' }}>{p.anioLectivo}</td>
                                    <td style={{ padding: '8px' }}>{p.numeroPeriodo}</td>
                                    <td style={{ padding: '8px' }}><strong>{p.nombre}</strong></td>
                                    <td style={{ padding: '8px' }}>{new Date(p.fechaInicio).toLocaleDateString()}</td>
                                    <td style={{ padding: '8px' }}>{new Date(p.fechaFin).toLocaleDateString()}</td>
                                    <td style={{ padding: '8px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            backgroundColor: getEstadoColor(p.estado),
                                            color: '#fff'
                                        }}>
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleOpenModal(p)}
                                            style={{ padding: '4px 12px', marginRight: '4px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleToggleEstado(p)}
                                            style={{ padding: '4px 12px', marginRight: '4px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            {p.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                                        </button>
                                        <button
                                            className="btn-danger"
                                            onClick={() => handleDelete(p.idPeriodo, p.nombre)}
                                            style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>{editingPeriodo ? 'Editar Periodo' : 'Nuevo Periodo'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Año Lectivo *</label>
                                <input
                                    type="number"
                                    value={formData.anioLectivo}
                                    onChange={(e) => setFormData({ ...formData, anioLectivo: parseInt(e.target.value) })}
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Numero de Periodo *</label>
                                <input
                                    type="number"
                                    value={formData.numeroPeriodo}
                                    onChange={(e) => setFormData({ ...formData, numeroPeriodo: parseInt(e.target.value) })}
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    min="1"
                                    max="4"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha Inicio *</label>
                                    <input
                                        type="date"
                                        value={formData.fechaInicio}
                                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha Fin *</label>
                                    <input
                                        type="date"
                                        value={formData.fechaFin}
                                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Estado</label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                >
                                    <option value="Cerrado">Cerrado</option>
                                    <option value="Activo">Activo</option>
                                </select>
                                <small style={{ color: '#6b7280' }}>Solo puede haber un periodo activo por año</small>
                            </div>
                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    {editingPeriodo ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionPeriodosDireccion;