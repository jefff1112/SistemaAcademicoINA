// Componente Gestión de Especialidades (Admin): lista, crea, edita y elimina especialidades.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getEspecialidades, createEspecialidad, updateEspecialidad, deleteEspecialidad } from '../../services/especialidadesService';

// Componente principal: administra el catálogo de especialidades con modal de creación/edición.
const GestionEspecialidadesAdmin = () => {
    // Estados: lista de especialidades, modal de edición, mensajes y datos del formulario.
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        nombreEspecialidad: '',
        descripcion: '',
        duracionAnios: 3
    });

    // Carga la lista de especialidades al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene las especialidades desde el servicio del backend.
    const cargarDatos = async () => {
        try {
            const data = await getEspecialidades();
            setEspecialidades(data || []);
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

    // Abre el modal para crear una especialidad o editar la seleccionada.
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                nombreEspecialidad: item.nombreEspecialidad || '',
                descripcion: item.descripcion || '',
                duracionAnios: item.duracionAnios || 3
            });
        } else {
            setEditingItem(null);
            setFormData({
                nombreEspecialidad: '',
                descripcion: '',
                duracionAnios: 3
            });
        }
        setShowModal(true);
    };

    // Valida y guarda la especialidad, creándola o actualizándola según corresponda.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombreEspecialidad.trim()) {
            mostrarMensaje('El nombre de la especialidad es requerido', 'error');
            return;
        }

        try {
            if (editingItem) {
                // Actualiza la especialidad existente con los datos del formulario.
                await updateEspecialidad(editingItem.idEspecialidad, formData);
                mostrarMensaje('Especialidad actualizada correctamente', 'success');
            } else {
                // Crea una nueva especialidad con los datos del formulario.
                await createEspecialidad(formData);
                mostrarMensaje('Especialidad creada correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        }
    };

    // Elimina una especialidad tras confirmar con el usuario.
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`Eliminar la especialidad "${nombre}"?`)) return;
        try {
            // Elimina la especialidad por su id y refresca la lista.
            await deleteEspecialidad(id);
            mostrarMensaje('Especialidad eliminada correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar', 'error');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Especialidades">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Especialidades">
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
                    <h3>Lista de Especialidades</h3>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Nueva Especialidad
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripcion</th>
                                <th>Duracion (años)</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {especialidades.map((e) => (
                                <tr key={e.idEspecialidad}>
                                    <td>{e.idEspecialidad}</td>
                                    <td><strong>{e.nombreEspecialidad}</strong></td>
                                    <td>{e.descripcion || '-'}</td>
                                    <td>{e.duracionAnios}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleOpenModal(e)}>Editar</button>
                                        <button className="btn-danger" onClick={() => handleDelete(e.idEspecialidad, e.nombreEspecialidad)}>Eliminar</button>
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
                            <h3>{editingItem ? 'Editar Especialidad' : 'Nueva Especialidad'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre de la Especialidad *</label>
                                <input
                                    type="text"
                                    value={formData.nombreEspecialidad}
                                    onChange={(e) => setFormData({ ...formData, nombreEspecialidad: e.target.value })}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripcion</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    rows="3"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Duracion en Años</label>
                                <input
                                    type="number"
                                    value={formData.duracionAnios}
                                    onChange={(e) => setFormData({ ...formData, duracionAnios: parseInt(e.target.value) })}
                                    className="form-control"
                                    min="1"
                                    max="5"
                                />
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

export default GestionEspecialidadesAdmin;