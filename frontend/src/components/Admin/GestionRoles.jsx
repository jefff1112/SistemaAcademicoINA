// Componente Gestión de Roles (Admin): lista, crea, edita y elimina roles del sistema.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra los roles y su nivel de acceso con modal de edición.
const GestionRoles = () => {
    // Estados: roles, modal de edición y datos del formulario.
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRol, setEditingRol] = useState(null);
    const [formData, setFormData] = useState({
        idRol: undefined,
        nombreRol: '',
        descripcion: '',
        nivelAcceso: 1,
        estado: true
    });

    // Carga la lista de roles al montar el componente.
    useEffect(() => {
        cargarRoles();
    }, []);

    // Obtiene los roles del sistema desde la API.
    const cargarRoles = async () => {
        try {
            // Petición GET /roles para listar los roles disponibles.
            const response = await API.get('/roles');
            setRoles(response.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Abre el modal para crear un rol o editar el seleccionado.
    const handleOpenModal = (rol = null) => {
        if (rol) {
            setEditingRol(rol);
            setFormData({
                idRol: rol.idRol,
                nombreRol: rol.nombreRol,
                descripcion: rol.descripcion || '',
                nivelAcceso: rol.nivelAcceso || 1,
                estado: rol.estado ?? true
            });
        } else {
            setEditingRol(null);
            setFormData({ idRol: undefined, nombreRol: '', descripcion: '', nivelAcceso: 1, estado: true });
        }
        setShowModal(true);
    };

    // Guarda el rol, actualizándolo o creándolo según corresponda.
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRol) {
                // Petición PUT /roles/{id} para actualizar el rol existente.
                await API.put(`/roles/${editingRol.idRol}`, formData);
                alert('Rol actualizado correctamente');
            } else {
                // Petición POST /roles para crear un nuevo rol.
                await API.post('/roles', formData);
                alert('Rol creado correctamente');
            }
            setShowModal(false);
            cargarRoles();
        } catch (error) {
            alert('Error al guardar rol');
        }
    };

    // Elimina un rol tras confirmar con el usuario.
    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Eliminar rol ${nombre}?`)) {
            try {
                // Petición DELETE /roles/{id} para borrar el rol.
                await API.delete(`/roles/${id}`);
                alert('Rol eliminado');
                cargarRoles();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Roles">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Roles">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Lista de Roles</h3>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Nuevo Rol
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripcion</th>
                                <th>Nivel Acceso</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(r => (
                                <tr key={r.idRol}>
                                    <td>{r.idRol}</td>
                                    <td>{r.nombreRol}</td>
                                    <td>{r.descripcion || '-'}</td>
                                    <td>{r.nivelAcceso || 1}</td>
                                    <td>
                                        <span className={r.estado ? 'badge-success' : 'badge-danger'}>
                                            {r.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleOpenModal(r)}>Editar</button>
                                        <button className="btn-danger" onClick={() => handleDelete(r.idRol, r.nombreRol)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>{editingRol ? 'Editar Rol' : 'Nuevo Rol'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre del Rol *</label>
                                <input
                                    type="text"
                                    value={formData.nombreRol}
                                    onChange={(e) => setFormData({ ...formData, nombreRol: e.target.value })}
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
                                <label>Nivel de Acceso (1-10)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.nivelAcceso}
                                    onChange={(e) => setFormData({ ...formData, nivelAcceso: parseInt(e.target.value) })}
                                    className="form-control"
                                />
                                <small>1 = Maximo acceso, 10 = Minimo acceso</small>
                            </div>
                            <div className="modal-buttons">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionRoles;