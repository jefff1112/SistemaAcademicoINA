// Componente Gestión de Materias (Admin): lista, crea, edita y elimina materias.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getMaterias, createMateria, updateMateria, deleteMateria } from '../../services/materiasService';
import { getEspecialidades } from '../../services/especialidadesService';

// Componente principal: administra el catálogo de materias con su configuración de evaluación.
const GestionMateriasAdmin = () => {
    // Estados: materias, especialidades, modal de edición, mensajes y datos del formulario.
    const [materias, setMaterias] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        nombreMateria: '',
        codigoMateria: '',
        tipoMateria: 'Basica',
        escalaMaxima: 100,
        escalaMinima: 0,
        notaMinima: 6,
        decimalesPermitidos: 2,
        idEspecialidad: ''
    });

    // Carga las materias y especialidades al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene en paralelo las materias y las especialidades desde el backend.
    const cargarDatos = async () => {
        try {
            const [materiasRes, especialidadesRes] = await Promise.all([
                // Consulta la lista de materias.
                getMaterias(),
                // Consulta la lista de especialidades para asignar la materia.
                getEspecialidades()
            ]);
            setMaterias(materiasRes || []);
            setEspecialidades(especialidadesRes || []);
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

    // Abre el modal para crear una materia o editar la seleccionada.
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                nombreMateria: item.nombreMateria || '',
                codigoMateria: item.codigoMateria || '',
                tipoMateria: item.tipoMateria || 'Basica',
                escalaMaxima: item.escalaMaxima || 100,
                escalaMinima: item.escalaMinima || 0,
                notaMinima: item.notaMinima || 6,
                decimalesPermitidos: item.decimalesPermitidos || 2,
                idEspecialidad: item.idEspecialidad || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                nombreMateria: '',
                codigoMateria: '',
                tipoMateria: 'Basica',
                escalaMaxima: 100,
                escalaMinima: 0,
                notaMinima: 6,
                decimalesPermitidos: 2,
                idEspecialidad: ''
            });
        }
        setShowModal(true);
    };

    // Valida el formulario y crea o actualiza la materia según corresponda.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombreMateria.trim()) {
            mostrarMensaje('El nombre de la materia es requerido', 'error');
            return;
        }

        try {
            // Convierte los campos numéricos del formulario para que el backend los reciba como números.
            const dataToSend = {
                nombreMateria: formData.nombreMateria.trim(),
                codigoMateria: formData.codigoMateria.trim(),
                tipoMateria: formData.tipoMateria,
                escalaMaxima: parseInt(formData.escalaMaxima),
                escalaMinima: parseInt(formData.escalaMinima),
                notaMinima: parseFloat(formData.notaMinima),
                decimalesPermitidos: parseInt(formData.decimalesPermitidos),
                idEspecialidad: formData.idEspecialidad ? parseInt(formData.idEspecialidad) : null
            };

            if (editingItem) {
                // Actualiza la materia existente con los datos del formulario.
                await updateMateria(editingItem.idMateria, dataToSend);
                mostrarMensaje('Materia actualizada correctamente', 'success');
            } else {
                // Crea una nueva materia con los datos del formulario.
                await createMateria(dataToSend);
                mostrarMensaje('Materia creada correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        }
    };

    // Elimina una materia tras confirmar con el usuario.
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`Eliminar la materia "${nombre}"?`)) return;
        try {
            // Elimina la materia por su id y refresca la lista.
            await deleteMateria(id);
            mostrarMensaje('Materia eliminada correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar', 'error');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Materias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Materias">
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
                    <h3>Lista de Materias</h3>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Nueva Materia
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Codigo</th>
                                <th>Tipo</th>
                                <th>Nota Minima</th>
                                <th>Especialidad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materias.map((m) => (
                                <tr key={m.idMateria}>
                                    <td>{m.idMateria}</td>
                                    <td><strong>{m.nombreMateria}</strong></td>
                                    <td>{m.codigoMateria || '-'}</td>
                                    <td>{m.tipoMateria}</td>
                                    <td>{m.notaMinima}</td>
                                    <td>{m.especialidad?.nombreEspecialidad || 'General'}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleOpenModal(m)}>Editar</button>
                                        <button className="btn-danger" onClick={() => handleDelete(m.idMateria, m.nombreMateria)}>Eliminar</button>
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
                            <h3>{editingItem ? 'Editar Materia' : 'Nueva Materia'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre de la Materia *</label>
                                <input
                                    type="text"
                                    value={formData.nombreMateria}
                                    onChange={(e) => setFormData({ ...formData, nombreMateria: e.target.value })}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Codigo de la Materia</label>
                                <input
                                    type="text"
                                    value={formData.codigoMateria}
                                    onChange={(e) => setFormData({ ...formData, codigoMateria: e.target.value })}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tipo de Materia</label>
                                <select
                                    value={formData.tipoMateria}
                                    onChange={(e) => setFormData({ ...formData, tipoMateria: e.target.value })}
                                    className="form-control"
                                >
                                    <option value="Basica">Basica</option>
                                    <option value="Tecnica">Tecnica</option>
                                    <option value="Complementaria">Complementaria</option>
                                    <option value="Electiva">Electiva</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nota Minima</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.notaMinima}
                                        onChange={(e) => setFormData({ ...formData, notaMinima: parseFloat(e.target.value) })}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Decimales Permitidos</label>
                                    <input
                                        type="number"
                                        value={formData.decimalesPermitidos}
                                        onChange={(e) => setFormData({ ...formData, decimalesPermitidos: parseInt(e.target.value) })}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Especialidad</label>
                                <select
                                    value={formData.idEspecialidad}
                                    onChange={(e) => setFormData({ ...formData, idEspecialidad: e.target.value })}
                                    className="form-control"
                                >
                                    <option value="">General (Bachillerato)</option>
                                    {especialidades.map((e) => (
                                        <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                            {e.nombreEspecialidad}
                                        </option>
                                    ))}
                                </select>
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

export default GestionMateriasAdmin;