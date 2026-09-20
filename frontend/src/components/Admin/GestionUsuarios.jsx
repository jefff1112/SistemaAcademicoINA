// Componente Gestión de Usuarios (Admin) - MEJORADO
// Lista, crea, edita y desactiva usuarios del sistema.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionUsuarios = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);

    // Filtros
    const [filterRol, setFilterRol] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState('');

    // Formulario
    const [formData, setFormData] = useState({
        codigo: '',
        nombres: '',
        apellidos: '',
        correo: '',
        contrasena: '',
        rolId: ''
    });

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [usuariosRes, rolesRes] = await Promise.all([
                API.get('/usuarios'),
                API.get('/roles')
            ]);
            setUsuarios(usuariosRes.data || []);
            setRoles(rolesRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getRolNombre = (rolId) => {
        const rol = roles.find(r => r.idRol === rolId || r.idRol === parseInt(rolId));
        return rol ? rol.nombreRol : 'Sin rol';
    };

    const getRolBadge = (rolNombre) => {
        switch (rolNombre) {
            case 'Administrador': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'Director': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            case 'Sub Director': return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
            case 'Registro Academico': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Docente': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Estudiante': return { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' };
            case 'Encargado': return { bg: '#fce7f3', color: '#9d174d', border: '#ec4899' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    const formatearNombre = (nombreCompleto) => {
        if (!nombreCompleto) return '';
        return nombreCompleto
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    };

    // ============================================================
    // MODAL
    // ============================================================
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
        setConfirmarPassword('');
        setMostrarPassword(false);
        setShowModal(true);
    };

    const handleCerrarModal = () => {
        if (saving) return;
        setShowModal(false);
    };

    // ============================================================
    // SUBMIT
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.codigo.trim()) {
            mostrarMensaje('El código es requerido', 'error');
            return;
        }
        if (!formData.nombres.trim()) {
            mostrarMensaje('Los nombres son requeridos', 'error');
            return;
        }
        if (!formData.apellidos.trim()) {
            mostrarMensaje('Los apellidos son requeridos', 'error');
            return;
        }
        if (!formData.rolId) {
            mostrarMensaje('Debe seleccionar un rol', 'error');
            return;
        }
        if (!editingUser && !formData.contrasena) {
            mostrarMensaje('La contraseña es requerida para nuevos usuarios', 'error');
            return;
        }
        if (formData.contrasena && formData.contrasena.length < 6) {
            mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        if (formData.contrasena && formData.contrasena !== confirmarPassword) {
            mostrarMensaje('Las contraseñas no coinciden', 'error');
            return;
        }

        setSaving(true);
        try {
            const dataToSend = {
                codigo: formData.codigo.trim(),
                nombres: formData.nombres.trim(),
                apellidos: formData.apellidos.trim(),
                correo: formData.correo || null,
                contrasena: formData.contrasena,
                rolId: parseInt(formData.rolId)
            };

            if (editingUser) {
                await API.put(`/usuarios/${editingUser.idUsuario}`, dataToSend);
                mostrarMensaje('Usuario actualizado correctamente', 'success');
            } else {
                await API.post('/usuarios', dataToSend);
                mostrarMensaje('Usuario creado correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            let msg = 'Error al guardar usuario';
            if (error.response?.data?.mensaje) msg = error.response.data.mensaje;
            else if (error.response?.data?.message) msg = error.response.data.message;
            else if (error.response?.data?.title) msg = error.response.data.title;
            else if (error.message) msg = error.message;
            mostrarMensaje(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // DESACTIVAR
    // ============================================================
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Desactivar al usuario "${nombre}"?\nYa no podrá iniciar sesión en el sistema.`)) return;
        try {
            await API.delete(`/usuarios/${id}`);
            mostrarMensaje('Usuario desactivado correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al desactivar usuario', 'error');
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter(u => {
            // Filtro por rol
            if (filterRol && String(u.rolId || u.rol_id) !== String(filterRol)) return false;

            // Filtro por estado
            if (filterEstado === 'activos' && !u.estado) return false;
            if (filterEstado === 'inactivos' && u.estado) return false;

            // Búsqueda
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (u.nombres && u.nombres.toLowerCase().includes(term)) ||
                    (u.apellidos && u.apellidos.toLowerCase().includes(term)) ||
                    (u.codigo && u.codigo.toLowerCase().includes(term)) ||
                    (u.correo && u.correo.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [usuarios, filterRol, filterEstado, busqueda]);

    const stats = useMemo(() => ({
        total: usuarios.length,
        activos: usuarios.filter(u => u.estado).length,
        inactivos: usuarios.filter(u => !u.estado).length,
        roles: roles.length
    }), [usuarios, roles]);

    const filtrosActivos = (filterRol ? 1 : 0) + (filterEstado !== 'todos' ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterRol('');
        setFilterEstado('todos');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Usuarios">
                <div className="loading">Cargando usuarios...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Usuarios">
            <style>{`
                /* Forzar fondo blanco general */
                .gu-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }
                
                .gu-card { 
                    background: #ffffff; 
                    border-radius: 12px; 
                    padding: 22px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03); 
                    border: 1px solid #e2e8f0; 
                }
                .gu-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .gu-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .gu-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .gu-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gu-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gu-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .gu-stat-activos { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
                .gu-stat-inactivos { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
                .gu-stat-roles { background: #e9d5ff; color: #6b21a8; border-color: #d8b4fe; }

                /* Filtros */
                .gu-filtros { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 14px; }
                .gu-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gu-field input, .gu-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gu-field input:focus, .gu-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .gu-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .gu-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gu-btn-primary { background: #1e3a5f; color: #fff; }
                .gu-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gu-btn-info { background: #3b82f6; color: #fff; }
                .gu-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gu-btn-danger { background: #dc2626; color: #fff; }
                .gu-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gu-btn-secondary { background: #e5e7eb; color: #334155; }
                .gu-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gu-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - FORZAR FONDO BLANCO EN TODO */
                .gu-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .gu-tabla thead th {
                    background: #f8fafc !important; 
                    color: #1e293b !important; 
                    padding: 12px 10px;
                    text-align: left; 
                    font-size: 11px; 
                    text-transform: uppercase;
                    letter-spacing: .5px; 
                    font-weight: 700;
                    border-bottom: 2px solid #cbd5e1;
                }
                .gu-tabla tbody tr { 
                    border-bottom: 1px solid #e2e8f0; 
                    background-color: #ffffff !important; 
                }
                .gu-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .gu-tabla td { 
                    padding: 12px 10px; 
                    color: #1e293b !important; 
                    vertical-align: middle; 
                    background-color: #ffffff !important;
                }
                .gu-tabla tbody tr:hover td { 
                    background-color: #f1f5f9 !important;
                }
                .gu-tabla td.col-codigo { 
                    font-family: monospace; 
                    font-size: 12px; 
                    color: #475569 !important; 
                    background-color: #ffffff !important;
                }
                .gu-tabla td.col-nombre-completo { 
                    font-weight: 600; 
                    color: #0f172a !important; 
                    background-color: #ffffff !important;
                }

                .gu-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .gu-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gu-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gu-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gu-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .gu-empty h3 { color: #334155; margin: 0 0 8px; }

                .gu-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .gu-badge-filtros {
                    display: inline-block;
                    background: #3b82f6;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 10px;
                    margin-left: 8px;
                }

                /* Modal */
                .gu-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .gu-modal {
                    background: #ffffff; border-radius: 12px;
                    max-width: 560px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .gu-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gu-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gu-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gu-modal-close:hover { color: #dc2626; }
                .gu-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gu-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .gu-form-grid-full { grid-column: 1 / -1; }

                .gu-modal .gu-field { margin-bottom: 14px; }
                .gu-modal .gu-field input, .gu-modal .gu-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gu-modal .gu-field input:focus, .gu-modal .gu-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                .gu-input-group { position: relative; }
                .gu-input-group input { padding-right: 90px; }
                .gu-toggle-password {
                    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
                    background: #f1f5f9; border: none; border-radius: 6px;
                    padding: 6px 10px; font-size: 11px; font-weight: 600;
                    color: #475569; cursor: pointer; transition: all .2s;
                }
                .gu-toggle-password:hover { background: #e2e8f0; color: #1e293b; }

                .gu-info-box {
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
                }
                .gu-info-warning { background: #fef3c7; border-left: 4px solid #e67e22; color: #b45309; }
                .gu-info-primary { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }

                .gu-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 900px) {
                    .gu-filtros { grid-template-columns: 1fr 1fr; }
                    .gu-form-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .gu-filtros { grid-template-columns: 1fr; }
                    .gu-tabla { font-size: 12px; }
                    .gu-tabla thead th, .gu-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gu-container">
                {mensaje && <div className={`gu-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gu-stats">
                    <div className="gu-stat gu-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Usuarios</span>
                    </div>
                    <div className="gu-stat gu-stat-activos">
                        <span className="num">{stats.activos}</span>
                        <span className="lbl">Activos</span>
                    </div>
                    <div className="gu-stat gu-stat-inactivos">
                        <span className="num">{stats.inactivos}</span>
                        <span className="lbl">Inactivos</span>
                    </div>
                    <div className="gu-stat gu-stat-roles">
                        <span className="num">{stats.roles}</span>
                        <span className="lbl">Roles</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="gu-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="gu-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="gu-filtros">
                        <div className="gu-field">
                            <label>Rol</label>
                            <select value={filterRol} onChange={(e) => setFilterRol(e.target.value)}>
                                <option value="">Todos los roles</option>
                                {roles.map(r => (
                                    <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>
                                ))}
                            </select>
                        </div>
                        <div className="gu-field">
                            <label>Estado</label>
                            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="activos">Solo activos</option>
                                <option value="inactivos">Solo inactivos</option>
                            </select>
                        </div>
                        <div className="gu-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, código o correo..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="gu-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="gu-btn gu-btn-primary" onClick={() => handleOpenModal()}>
                                Nuevo Usuario
                            </button>
                            {filtrosActivos > 0 && (
                                <button className="gu-btn gu-btn-secondary" onClick={limpiarFiltros}>
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{usuariosFiltrados.length}</strong> de {usuarios.length} usuarios
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gu-card">
                    <h3>Lista de Usuarios</h3>

                    {usuariosFiltrados.length === 0 ? (
                        <div className="gu-empty">
                            <h3>No hay usuarios que coincidan</h3>
                            <p>Prueba ajustando los filtros o crea un nuevo usuario.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="gu-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '130px' }}>Código</th>
                                        <th>Nombre Completo</th>
                                        <th>Correo</th>
                                        <th style={{ width: '160px' }}>Rol</th>
                                        <th style={{ width: '100px', textAlign: 'center' }}>Estado</th>
                                        <th style={{ width: '180px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosFiltrados.map(u => {
                                        const rolNombre = getRolNombre(u.rolId || u.rol_id);
                                        const rolBadge = getRolBadge(rolNombre);
                                        return (
                                            <tr key={u.idUsuario}>
                                                <td className="col-codigo">{u.codigo}</td>
                                                <td className="col-nombre-completo">
                                                    {formatearNombre(`${u.nombres} ${u.apellidos}`)}
                                                </td>
                                                <td style={{ fontSize: '12px' }}>{u.correo || '-'}</td>
                                                <td>
                                                    <span
                                                        className="gu-badge"
                                                        style={{
                                                            backgroundColor: rolBadge.bg,
                                                            color: rolBadge.color,
                                                            border: `1px solid ${rolBadge.border}`
                                                        }}
                                                    >
                                                        {rolNombre}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        className="gu-badge"
                                                        style={{
                                                            backgroundColor: u.estado ? '#dcfce7' : '#fee2e2',
                                                            color: u.estado ? '#15803d' : '#b91c1c',
                                                            border: u.estado ? '1px solid #16a34a' : '1px solid #dc2626'
                                                        }}
                                                    >
                                                        {u.estado ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="gu-acciones">
                                                        <button
                                                            className="gu-btn gu-btn-info gu-btn-sm"
                                                            onClick={() => handleOpenModal(u)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="gu-btn gu-btn-danger gu-btn-sm"
                                                            onClick={() => handleDelete(u.idUsuario, `${u.nombres} ${u.apellidos}`)}
                                                            disabled={!u.estado}
                                                            title={!u.estado ? 'El usuario ya está inactivo' : 'Desactivar usuario'}
                                                        >
                                                            {u.estado ? 'Desactivar' : 'Inactivo'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CREAR / EDITAR */}
            {showModal && (
                <div className="gu-modal-overlay" onClick={handleCerrarModal}>
                    <div className="gu-modal" onClick={e => e.stopPropagation()}>
                        <div className="gu-modal-header">
                            <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                            <button className="gu-modal-close" onClick={handleCerrarModal} disabled={saving}>X</button>
                        </div>

                        {editingUser && (
                            <div className="gu-info-box gu-info-primary">
                                <strong>Editando:</strong> {editingUser.nombres} {editingUser.apellidos}<br />
                                <small>Deja la contraseña vacía si no deseas cambiarla.</small>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="gu-form-grid">
                                <div className="gu-field">
                                    <label>Código *</label>
                                    <input
                                        type="text"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                        required
                                        placeholder="Ej: DIR001, DOC005"
                                    />
                                </div>

                                <div className="gu-field">
                                    <label>Rol *</label>
                                    <select
                                        value={formData.rolId}
                                        onChange={(e) => setFormData({ ...formData, rolId: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar Rol</option>
                                        {roles.map(r => (
                                            <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="gu-field">
                                    <label>Nombres *</label>
                                    <input
                                        type="text"
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                        required
                                        placeholder="Ej: Juan Carlos"
                                    />
                                </div>

                                <div className="gu-field">
                                    <label>Apellidos *</label>
                                    <input
                                        type="text"
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                        required
                                        placeholder="Ej: Pérez Rodríguez"
                                    />
                                </div>

                                <div className="gu-field gu-form-grid-full">
                                    <label>Correo Electrónico</label>
                                    <input
                                        type="email"
                                        value={formData.correo}
                                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                        placeholder="usuario@ina.edu.sv"
                                    />
                                </div>

                                <div className="gu-field gu-form-grid-full">
                                    <label>
                                        Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
                                    </label>
                                    <div className="gu-input-group">
                                        <input
                                            type={mostrarPassword ? 'text' : 'password'}
                                            value={formData.contrasena}
                                            onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                                            required={!editingUser}
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                        <button
                                            type="button"
                                            className="gu-toggle-password"
                                            onClick={() => setMostrarPassword(!mostrarPassword)}
                                        >
                                            {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                                        </button>
                                    </div>
                                </div>

                                {formData.contrasena && (
                                    <div className="gu-field gu-form-grid-full">
                                        <label>Confirmar Contraseña *</label>
                                        <input
                                            type={mostrarPassword ? 'text' : 'password'}
                                            value={confirmarPassword}
                                            onChange={(e) => setConfirmarPassword(e.target.value)}
                                            placeholder="Repite la contraseña"
                                            style={{
                                                borderColor: confirmarPassword && formData.contrasena !== confirmarPassword
                                                    ? '#dc2626'
                                                    : confirmarPassword && formData.contrasena === confirmarPassword
                                                        ? '#16a34a'
                                                        : '#cbd5e1'
                                            }}
                                        />
                                        {confirmarPassword && formData.contrasena !== confirmarPassword && (
                                            <small style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                                Las contraseñas no coinciden
                                            </small>
                                        )}
                                        {confirmarPassword && formData.contrasena === confirmarPassword && (
                                            <small style={{ color: '#16a34a', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                                Las contraseñas coinciden
                                            </small>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="gu-modal-actions">
                                <button
                                    type="button"
                                    className="gu-btn gu-btn-secondary"
                                    onClick={handleCerrarModal}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="gu-btn gu-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear Usuario')}
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