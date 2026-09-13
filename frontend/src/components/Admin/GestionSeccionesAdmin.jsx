// Componente Gestión de Secciones (Admin): lista, crea, edita y elimina secciones.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getSecciones, createSeccion, updateSeccion, deleteSeccion } from '../../services/seccionesService';

// Componente principal: administra el catálogo de secciones con modal de creación/edición.
const GestionSeccionesAdmin = () => {
    // Estados: secciones, modal de edición, mensajes y datos del formulario.
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        nombreSeccion: ''
    });

    // Carga la lista de secciones al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene las secciones desde el servicio del backend.
    const cargarDatos = async () => {
        try {
            const data = await getSecciones();
            setSecciones(data || []);
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

    // Abre el modal para crear una sección o editar la seleccionada.
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                nombreSeccion: item.nombreSeccion || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                nombreSeccion: ''
            });
        }
        setShowModal(true);
    };

    // Valida el formulario y crea o actualiza la sección según corresponda.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombreSeccion.trim()) {
            mostrarMensaje('El nombre de la seccion es requerido', 'error');
            return;
        }

        try {
            if (editingItem) {
                // Actualiza la sección existente con los datos del formulario.
                await updateSeccion(editingItem.idSeccion, formData);
                mostrarMensaje('Seccion actualizada correctamente', 'success');
            } else {
                // Crea una nueva sección con los datos del formulario.
                await createSeccion(formData);
                mostrarMensaje('Seccion creada correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        }
    };

    // Elimina una sección tras confirmar con el usuario.
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`Eliminar la seccion "${nombre}"?`)) return;
        try {
            // Elimina la sección por su id y refresca la lista.
            await deleteSeccion(id);
            mostrarMensaje('Seccion eliminada correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar', 'error');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Secciones">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Secciones">
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
                    <h3>Lista de Secciones</h3>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Nueva Seccion
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {secciones.map((s) => (
                                <tr key={s.idSeccion}>
                                    <td>{s.idSeccion}</td>
                                    <td><strong>Seccion {s.nombreSeccion}</strong></td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleOpenModal(s)}>Editar</button>
                                        <button className="btn-danger" onClick={() => handleDelete(s.idSeccion, s.nombreSeccion)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>{editingItem ? 'Editar Seccion' : 'Nueva Seccion'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre de la Seccion *</label>
                                <input
                                    type="text"
                                    value={formData.nombreSeccion}
                                    onChange={(e) => setFormData({ ...formData, nombreSeccion: e.target.value })}
                                    required
                                    className="form-control"
                                    placeholder="Ej: A, B, C, D, E"
                                />
                                <small>Ingrese una letra o nombre para la seccion</small>
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

export default GestionSeccionesAdmin;