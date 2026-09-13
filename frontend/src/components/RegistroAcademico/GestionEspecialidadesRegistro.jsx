// Componente Gestión de Especialidades (Registro Académico): crea, edita, elimina y busca especialidades.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionEspecialidadesRegistro = () => {
    // Estado de especialidades, modal de edición, búsqueda y formulario.
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEspecialidad, setEditingEspecialidad] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nombreEspecialidad: '',
        descripcion: '',
        duracionAnios: 3,
        estado: true
    });

    // Carga las especialidades al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene las especialidades desde la API.
    const cargarDatos = async () => {
        setLoading(true);
        try {
            console.log('Cargando especialidades...');
            const response = await API.get('/especialidades');
            console.log('Especialidades recibidas:', response.data);
            setEspecialidades(response.data || []);
        } catch (error) {
            console.error('Error al cargar especialidades:', error);
            mostrarMensaje('Error al cargar especialidades: ' + (error.response?.data?.mensaje || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Muestra un mensaje temporal de éxito o error.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Abre el modal con datos precargados para editar o vacíos para crear.
    const handleOpenModal = (especialidad = null) => {
        if (especialidad) {
            setEditingEspecialidad(especialidad);
            setFormData({
                nombreEspecialidad: especialidad.nombreEspecialidad || '',
                descripcion: especialidad.descripcion || '',
                duracionAnios: especialidad.duracionAnios || 3,
                estado: especialidad.estado !== undefined ? especialidad.estado : true
            });
        } else {
            setEditingEspecialidad(null);
            setFormData({
                nombreEspecialidad: '',
                descripcion: '',
                duracionAnios: 3,
                estado: true
            });
        }
        setShowModal(true);
    };

    // Valida el nombre y crea o actualiza la especialidad en la API.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.nombreEspecialidad.trim()) {
            mostrarMensaje('El nombre de la especialidad es requerido', 'error');
            setLoading(false);
            return;
        }

        try {
            const dataToSend = {
                nombreEspecialidad: formData.nombreEspecialidad.trim(),
                descripcion: formData.descripcion || null,
                duracionAnios: formData.duracionAnios ? parseInt(formData.duracionAnios) : 3,
                estado: formData.estado
            };

            console.log('Enviando datos:', dataToSend);

            let response;
            if (editingEspecialidad) {
                response = await API.put(`/especialidades/${editingEspecialidad.idEspecialidad}`, dataToSend);
                console.log('Respuesta actualización:', response.data);
                mostrarMensaje('Especialidad actualizada correctamente', 'success');
            } else {
                response = await API.post('/especialidades', dataToSend);
                console.log('Respuesta creación:', response.data);
                mostrarMensaje('Especialidad creada correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Response data:', error.response?.data);
            const mensaje = error.response?.data?.mensaje || error.message || 'Error al guardar';
            mostrarMensaje(mensaje, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Elimina la especialidad tras la confirmación del usuario.
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`Eliminar la especialidad "${nombre}"?`)) return;
        setLoading(true);
        try {
            await API.delete(`/especialidades/${id}`);
            mostrarMensaje('Especialidad eliminada correctamente', 'success');
            cargarDatos();
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error al eliminar', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Devuelve el color del estado activo/inactivo.
    const getEstadoColor = (estado) => {
        return estado ? '#16a34a' : '#dc2626';
    };

    // Filtra las especialidades por el término de búsqueda.
    const especialidadesFiltradas = especialidades.filter(e => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (e.nombreEspecialidad?.toLowerCase().includes(term) ||
                e.descripcion?.toLowerCase().includes(term));
        }
        return true;
    });

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Especialidades">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Especialidades - Registro Academico">
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
                <div className="filters-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, descripcion..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ flex: 2, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '200px' }}
                    />
                    <button
                        className="btn-primary"
                        onClick={() => handleOpenModal()}
                        style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        + Nueva Especialidad
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Descripcion</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Duracion (años)</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {especialidadesFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay especialidades registradas
                                    </td>
                                </tr>
                            ) : (
                                especialidadesFiltradas.map((e) => (
                                    <tr key={e.idEspecialidad} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{e.idEspecialidad}</td>
                                        <td style={{ padding: '8px' }}><strong>{e.nombreEspecialidad}</strong></td>
                                        <td style={{ padding: '8px' }}>{e.descripcion || '-'}</td>
                                        <td style={{ padding: '8px' }}>{e.duracionAnios}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getEstadoColor(e.estado),
                                                color: '#fff'
                                            }}>
                                                {e.estado ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleOpenModal(e)}
                                                style={{ padding: '4px 12px', marginRight: '4px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleDelete(e.idEspecialidad, e.nombreEspecialidad)}
                                                style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
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

            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>{editingEspecialidad ? 'Editar Especialidad' : 'Nueva Especialidad'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombre de la Especialidad *</label>
                                <input
                                    type="text"
                                    value={formData.nombreEspecialidad}
                                    onChange={(e) => setFormData({ ...formData, nombreEspecialidad: e.target.value })}
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Descripcion</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    rows="3"
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Duracion (años)</label>
                                    <input
                                        type="number"
                                        value={formData.duracionAnios}
                                        onChange={(e) => setFormData({ ...formData, duracionAnios: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        min="1"
                                        max="5"
                                    />
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.estado}
                                            onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                                        />
                                        {' '}Activo
                                    </label>
                                </div>
                            </div>

                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    {editingEspecialidad ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionEspecialidadesRegistro;