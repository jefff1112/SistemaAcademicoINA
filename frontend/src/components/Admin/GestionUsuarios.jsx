// Componente Gestión de Usuarios (Admin): lista, crea, edita y desactiva usuarios del sistema.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra los usuarios del sistema con asignación de roles.
const GestionUsuarios = () => {
    // Estados: usuarios, roles, modal de edición, formulario e indicador de guardado.
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        codigo: '',
        nombres: '',
        apellidos: '',
        correo: '',
        contrasena: '',
        rolId: ''
    });
    const [saving, setSaving] = useState(false);

    // Carga los usuarios y roles al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene en paralelo los usuarios y los roles desde la API.
    const cargarDatos = async () => {
        try {
            const [usuariosRes, rolesRes] = await Promise.all([
                // Petición GET /usuarios para listar los usuarios del sistema.
                API.get('/usuarios'),
                // Petición GET /roles para listar los roles disponibles.
                API.get('/roles')
            ]);
            setUsuarios(usuariosRes.data || []);
            setRoles(rolesRes.data || []);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Devuelve el nombre del rol a partir de su id.
    const getRolNombre = (rolId) => {
        const rol = roles.find(r => r.idRol === rolId);
        return rol ? rol.nombreRol : 'Sin rol';
    };

    // Abre el modal para crear un usuario o editar el seleccionado.
    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                codigo: user.codigo || '',
                nombres: user.nombres || '',
                apellidos: user.apellidos || '',
                correo: user.correo || '',
                contrasena: '',
                rolId: user.rolId || user.rol_id || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                codigo: '',
                nombres: '',
                apellidos: '',
                correo: '',
                contrasena: '',
                rolId: ''
            });
        }
        setShowModal(true);
    };

    // Valida los campos y crea o actualiza el usuario según corresponda.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        if (!formData.codigo.trim()) {
            alert('El codigo es requerido');
            setSaving(false);
            return;
        }
        if (!formData.nombres.trim()) {
            alert('Los nombres son requeridos');
            setSaving(false);
            return;
        }
        if (!formData.apellidos.trim()) {
            alert('Los apellidos son requeridos');
            setSaving(false);
            return;
        }
        if (!formData.rolId) {
            alert('Debe seleccionar un rol');
            setSaving(false);
            return;
        }
        if (!editingUser && !formData.contrasena) {
            alert('La contraseña es requerida para nuevos usuarios');
            setSaving(false);
            return;
        }

        try {
            const dataToSend = {
                codigo: formData.codigo.trim(),
                nombres: formData.nombres.trim(),
                apellidos: formData.apellidos.trim(),
                correo: formData.correo || null,
                contrasena: formData.contrasena,
                rolId: parseInt(formData.rolId)
            };

            let response;
            if (editingUser) {
                // Petición PUT /usuarios/{id} para actualizar el usuario existente.
                response = await API.put(`/usuarios/${editingUser.idUsuario}`, dataToSend);
                alert('Usuario actualizado correctamente');
            } else {
                // Petición POST /usuarios para crear un nuevo usuario.
                response = await API.post('/usuarios', dataToSend);
                alert('Usuario creado correctamente');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            console.error('ERROR COMPLETO:', error);
            console.error('RESPUESTA DEL ERROR:', error.response);
            console.error('DATOS DEL ERROR:', error.response?.data);

            let mensaje = 'Error al guardar usuario';
            if (error.response?.data?.mensaje) {
                mensaje = error.response.data.mensaje;
            } else if (error.response?.data?.message) {
                mensaje = error.response.data.message;
            } else if (error.response?.data?.title) {
                mensaje = error.response.data.title;
            } else if (error.message) {
                mensaje = error.message;
            }
            alert(mensaje);
        } finally {
            setSaving(false);
        }
    };
    // Desactiva un usuario tras confirmar con el usuario administrador.
    const handleDelete = async (id, nombre) => {
        if (window.confirm(`Desactivar usuario ${nombre}?`)) {
            try {
                // Petición DELETE /usuarios/{id} para desactivar el usuario.
                await API.delete(`/usuarios/${id}`);
                alert('Usuario desactivado');
                cargarDatos();
            } catch (error) {
                alert('Error al desactivar usuario');
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Usuarios">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Usuarios">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Lista de Usuarios</h3>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Nuevo Usuario
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Codigo</th>
                                <th>Nombres</th>
                                <th>Apellidos</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.idUsuario}>
                                    <td>{u.idUsuario}</td>
                                    <td>{u.codigo}</td>
                                    <td>{u.nombres}</td>
                                    <td>{u.apellidos}</td>
                                    <td>{u.correo || '-'}</td>
                                    <td>{getRolNombre(u.rolId)}</td>
                                    <td>
                                        <span className={u.estado ? 'badge-success' : 'badge-danger'}>
                                            {u.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleOpenModal(u)}>Editar</button>
                                        <button className="btn-danger" onClick={() => handleDelete(u.idUsuario, u.nombres)}>Desactivar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Codigo *</label>
                                <input type="text" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} required className="form-control" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombres *</label>
                                    <input type="text" value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} required className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Apellidos *</label>
                                    <input type="text" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} required className="form-control" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Correo</label>
                                <input type="email" value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Contraseña {editingUser && '(Dejar vacio para no cambiar)'} *</label>
                                <input type="password" value={formData.contrasena} onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })} required={!editingUser} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Rol *</label>
                                <select value={formData.rolId} onChange={(e) => setFormData({ ...formData, rolId: e.target.value })} required className="form-control">
                                    <option value="">Seleccionar Rol</option>
                                    {roles.map(r => (
                                        <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-buttons">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionUsuarios;