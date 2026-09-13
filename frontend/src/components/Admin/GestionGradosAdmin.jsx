// Componente Gestión de Grados (Admin): lista, crea, edita y elimina grados académicos.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getGrados, createGrado, updateGrado, deleteGrado } from '../../services/gradosService';
import { getNiveles } from '../../services/nivelesService';

// Componente principal: administra los grados por nivel con modal de creación/edición.
const GestionGradosAdmin = () => {
    // Estados: grados, niveles, modal de edición, mensajes y datos del formulario.
    const [grados, setGrados] = useState([]);
    const [niveles, setNiveles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        idNivel: '',
        numeroGrado: '',
        nombreGrado: '',
        orden: ''
    });

    // Carga los grados y niveles al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene en paralelo los grados y los niveles desde el backend.
    const cargarDatos = async () => {
        try {
            const [gradosRes, nivelesRes] = await Promise.all([
                // Consulta la lista de grados.
                getGrados(),
                // Consulta la lista de niveles para el selector del formulario.
                getNiveles()
            ]);
            setGrados(gradosRes || []);
            setNiveles(nivelesRes || []);
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

    // Abre el modal para crear un grado o editar el seleccionado.
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                idNivel: item.idNivel || '',
                numeroGrado: item.numeroGrado || '',
                nombreGrado: item.nombreGrado || '',
                orden: item.orden || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                idNivel: '',
                numeroGrado: '',
                nombreGrado: '',
                orden: ''
            });
        }
        setShowModal(true);
    };

    // Valida el formulario y crea o actualiza el grado según corresponda.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.idNivel) {
            mostrarMensaje('Seleccione un nivel', 'error');
            return;
        }
        if (!formData.nombreGrado.trim()) {
            mostrarMensaje('El nombre del grado es requerido', 'error');
            return;
        }

        try {
            const data = {
                ...formData,
                numeroGrado: parseInt(formData.numeroGrado),
                orden: formData.orden ? parseInt(formData.orden) : parseInt(formData.numeroGrado)
            };

            if (editingItem) {
                // Actualiza el grado existente con los datos del formulario.
                await updateGrado(editingItem.idGrados, data);
                mostrarMensaje('Grado actualizado correctamente', 'success');
            } else {
                // Crea un nuevo grado con los datos del formulario.
                await createGrado(data);
                mostrarMensaje('Grado creado correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        }
    };

    // Elimina un grado tras confirmar con el usuario.
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`Eliminar el grado "${nombre}"?`)) return;
        try {
            // Elimina el grado por su id y refresca la lista.
            await deleteGrado(id);
            mostrarMensaje('Grado eliminado correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar', 'error');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Grados">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Grados">
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
                    <h3>Lista de Grados</h3>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Nuevo Grado
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nivel</th>
                                <th>Numero</th>
                                <th>Nombre</th>
                                <th>Orden</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grados.map((g) => (
                                <tr key={g.idGrados}>
                                    <td>{g.idGrados}</td>
                                    <td>{g.nivel?.nombreNivel || '-'}</td>
                                    <td>{g.numeroGrado}</td>
                                    <td><strong>{g.nombreGrado}</strong></td>
                                    <td>{g.orden}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleOpenModal(g)}>Editar</button>
                                        <button className="btn-danger" onClick={() => handleDelete(g.idGrados, g.nombreGrado)}>Eliminar</button>
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
                            <h3>{editingItem ? 'Editar Grado' : 'Nuevo Grado'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nivel *</label>
                                <select
                                    value={formData.idNivel}
                                    onChange={(e) => setFormData({ ...formData, idNivel: e.target.value })}
                                    required
                                    className="form-control"
                                >
                                    <option value="">Seleccionar Nivel</option>
                                    {niveles.map((n) => (
                                        <option key={n.idNiveles} value={n.idNiveles}>
                                            {n.nombreNivel}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Numero de Grado *</label>
                                <input
                                    type="number"
                                    value={formData.numeroGrado}
                                    onChange={(e) => setFormData({ ...formData, numeroGrado: e.target.value })}
                                    required
                                    className="form-control"
                                    min="1"
                                />
                            </div>

                            <div className="form-group">
                                <label>Nombre del Grado *</label>
                                <input
                                    type="text"
                                    value={formData.nombreGrado}
                                    onChange={(e) => setFormData({ ...formData, nombreGrado: e.target.value })}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Orden</label>
                                <input
                                    type="number"
                                    value={formData.orden}
                                    onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
                                    className="form-control"
                                />
                                <small>Dejar en blanco para usar el numero de grado</small>
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

export default GestionGradosAdmin;