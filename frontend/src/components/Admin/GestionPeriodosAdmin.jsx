// Componente Gestión de Periodos Académicos (Admin): crea, edita y desactiva periodos.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getPeriodos, createPeriodo, updatePeriodo, deletePeriodo } from '../../services/periodosService';

// Componente principal: administra los periodos académicos con modal de creación/edición.
const GestionPeriodosAdmin = () => {
    // Estados: periodos, modal de edición, mensajes y datos del formulario.
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
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

    // Carga la lista de periodos al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene los periodos académicos desde el servicio del backend.
    const cargarDatos = async () => {
        try {
            const data = await getPeriodos();
            setPeriodos(data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Muestra un mensaje temporal al usuario y lo limpia después de 3 segundos.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 3000);
    };

    // Abre el modal para crear un periodo o editar el seleccionado.
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                anioLectivo: item.anioLectivo || new Date().getFullYear(),
                numeroPeriodo: item.numeroPeriodo || 1,
                nombre: item.nombre || '',
                fechaInicio: item.fechaInicio ? new Date(item.fechaInicio).toISOString().split('T')[0] : '',
                fechaFin: item.fechaFin ? new Date(item.fechaFin).toISOString().split('T')[0] : '',
                estado: item.estado || 'Cerrado'
            });
        } else {
            setEditingItem(null);
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

    // Valida el formulario y crea o actualiza el periodo según corresponda.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            mostrarMensaje('El nombre del periodo es requerido', 'error');
            return;
        }
        if (!formData.fechaInicio) {
            mostrarMensaje('La fecha de inicio es requerida', 'error');
            return;
        }
        if (!formData.fechaFin) {
            mostrarMensaje('La fecha de fin es requerida', 'error');
            return;
        }

        try {
            if (editingItem) {
                // Actualiza el periodo existente con los datos del formulario.
                await updatePeriodo(editingItem.idPeriodo, formData);
                mostrarMensaje('Periodo actualizado correctamente', 'success');
            } else {
                // Crea un nuevo periodo con los datos del formulario.
                await createPeriodo(formData);
                mostrarMensaje('Periodo creado correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        }
    };

    // Desactiva un periodo cambiando su estado a Cerrado en lugar de eliminarlo.
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`Desactivar el periodo "${nombre}"?`)) return;
        try {
            // En lugar de eliminar, marcar como Cerrado para desactivar el periodo
            const periodo = periodos.find(p => p.idPeriodo === id);
            if (!periodo) {
                mostrarMensaje('Periodo no encontrado', 'error');
                return;
            }
            const actualizado = { ...periodo, estado: 'Cerrado' };
            // Actualiza el periodo con estado Cerrado para desactivarlo.
            await updatePeriodo(id, actualizado);
            mostrarMensaje('Periodo desactivado correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al desactivar periodo', 'error');
        }
    };

    // Devuelve el color que identifica visualmente el estado del periodo.
    const getEstadoColor = (estado) => {
        if (estado === 'Activo') return '#16a34a';
        if (estado === 'Cerrado') return '#dc2626';
        return '#e67e22';
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Periodos Academicos">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Periodos Academicos">
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Lista de Periodos Academicos</h3>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Nuevo Periodo
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Año</th>
                                <th>Periodo</th>
                                <th>Nombre</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Fin</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {periodos.map((p) => (
                                <tr key={p.idPeriodo}>
                                    <td>{p.idPeriodo}</td>
                                    <td>{p.anioLectivo}</td>
                                    <td>{p.numeroPeriodo}</td>
                                    <td><strong>{p.nombre}</strong></td>
                                    <td>{new Date(p.fechaInicio).toLocaleDateString()}</td>
                                    <td>{new Date(p.fechaFin).toLocaleDateString()}</td>
                                    <td>
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
                                    <td>
                                        <button className="btn-edit" onClick={() => handleOpenModal(p)}>Editar</button>
                                        <button className="btn-danger" onClick={() => handleDelete(p.idPeriodo, p.nombre)}>Desactivar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingItem ? 'Editar Periodo' : 'Nuevo Periodo'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Año Lectivo *</label>
                                <input
                                    type="number"
                                    value={formData.anioLectivo}
                                    onChange={(e) => setFormData({ ...formData, anioLectivo: parseInt(e.target.value) })}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Numero de Periodo *</label>
                                <input
                                    type="number"
                                    value={formData.numeroPeriodo}
                                    onChange={(e) => setFormData({ ...formData, numeroPeriodo: parseInt(e.target.value) })}
                                    required
                                    className="form-control"
                                    min="1"
                                    max="4"
                                />
                            </div>

                            <div className="form-group">
                                <label>Nombre del Periodo *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                    className="form-control"
                                    placeholder="Ej: Primer Periodo, Segundo Periodo..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha de Inicio *</label>
                                    <input
                                        type="date"
                                        value={formData.fechaInicio}
                                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fecha de Fin *</label>
                                    <input
                                        type="date"
                                        value={formData.fechaFin}
                                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Estado</label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    className="form-control"
                                >
                                    <option value="Cerrado">Cerrado</option>
                                    <option value="Activo">Activo</option>
                                </select>
                                <small>Nota: Solo puede haber un periodo activo por año</small>
                            </div>

                            <div className="modal-buttons">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {editingItem ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionPeriodosAdmin;