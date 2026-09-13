// Componente Gestión de Materias (Registro Académico): crea, edita, elimina y filtra materias por tipo y especialidad.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionMateriasRegistro = () => {
    // Estado de materias, especialidades, filtros, modal de edición y formulario.
    const [materias, setMaterias] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMateria, setEditingMateria] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [filterTipo, setFilterTipo] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
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

    // Carga materias y especialidades al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene materias y especialidades en paralelo desde la API.
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [materiasRes, especialidadesRes] = await Promise.all([
                API.get('/materias'),
                API.get('/especialidades')
            ]);

            console.log('Materias recibidas:', materiasRes.data);
            console.log('Especialidades recibidas:', especialidadesRes.data);

            setMaterias(materiasRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
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
    const handleOpenModal = (materia = null) => {
        if (materia) {
            setEditingMateria(materia);
            setFormData({
                nombreMateria: materia.nombreMateria || '',
                codigoMateria: materia.codigoMateria || '',
                tipoMateria: materia.tipoMateria || 'Basica',
                escalaMaxima: materia.escalaMaxima || 100,
                escalaMinima: materia.escalaMinima || 0,
                notaMinima: materia.notaMinima || 6,
                decimalesPermitidos: materia.decimalesPermitidos || 2,
                idEspecialidad: materia.idEspecialidad || ''
            });
        } else {
            setEditingMateria(null);
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

    // Valida el nombre y crea o actualiza la materia en la API.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombreMateria.trim()) {
            mostrarMensaje('El nombre de la materia es requerido', 'error');
            return;
        }

        try {
            const dataToSend = {
                nombreMateria: formData.nombreMateria.trim(),
                codigoMateria: formData.codigoMateria || null,
                tipoMateria: formData.tipoMateria,
                escalaMaxima: formData.escalaMaxima ? parseFloat(formData.escalaMaxima) : 100,
                escalaMinima: formData.escalaMinima ? parseFloat(formData.escalaMinima) : 0,
                notaMinima: formData.notaMinima ? parseFloat(formData.notaMinima) : 6,
                decimalesPermitidos: formData.decimalesPermitidos ? parseInt(formData.decimalesPermitidos) : 2,
                idEspecialidad: formData.idEspecialidad || null
            };

            console.log('Enviando datos:', dataToSend);

            if (editingMateria) {
                await API.put(`/materias/${editingMateria.idMateria}`, dataToSend);
                mostrarMensaje('Materia actualizada correctamente', 'success');
            } else {
                await API.post('/materias', dataToSend);
                mostrarMensaje('Materia creada correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        }
    };

    // Elimina la materia tras la confirmación del usuario.
    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`Eliminar la materia "${nombre}"?`)) return;
        try {
            await API.delete(`/materias/${id}`);
            mostrarMensaje('Materia eliminada correctamente', 'success');
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al eliminar', 'error');
        }
    };

    // Devuelve la etiqueta legible del tipo de materia.
    const getTipoLabel = (tipo) => {
        const tipos = {
            'Basica': 'Basica',
            'Tecnica': 'Tecnica',
            'Complementaria': 'Complementaria',
            'Electiva': 'Electiva'
        };
        return tipos[tipo] || 'Sin tipo';
    };

    // Devuelve el color representativo del tipo de materia.
    const getTipoColor = (tipo) => {
        const colores = {
            'Basica': '#3b82f6',
            'Tecnica': '#16a34a',
            'Complementaria': '#e67e22',
            'Electiva': '#8b5cf6'
        };
        return colores[tipo] || '#6b7280';
    };

    // Resuelve el nombre de la especialidad o Bachillerato General por defecto.
    const getEspecialidadNombre = (id) => {
        if (!id) return 'Bachillerato General';
        const especialidad = especialidades.find(e => e.idEspecialidad === id);
        return especialidad ? especialidad.nombreEspecialidad : 'Bachillerato General';
    };

    // Filtra las materias por tipo y término de búsqueda.
    const materiasFiltradas = materias.filter(m => {
        if (filterTipo !== 'todos' && m.tipoMateria !== filterTipo) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (m.nombreMateria?.toLowerCase().includes(term) ||
                m.codigoMateria?.toLowerCase().includes(term));
        }
        return true;
    });

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Materias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Materias - Registro Academico">
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
                        placeholder="Buscar por nombre, codigo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ flex: 2, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '200px' }}
                    />
                    <select
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value)}
                        className="filter-select"
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                        <option value="todos">Todos los tipos</option>
                        <option value="Basica">Basica</option>
                        <option value="Tecnica">Tecnica</option>
                        <option value="Complementaria">Complementaria</option>
                        <option value="Electiva">Electiva</option>
                    </select>
                    <button
                        className="btn-primary"
                        onClick={() => handleOpenModal()}
                        style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        + Nueva Materia
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Codigo</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Tipo</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nota Minima</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materiasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay materias registradas
                                    </td>
                                </tr>
                            ) : (
                                materiasFiltradas.map((m) => (
                                    <tr key={m.idMateria} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{m.idMateria}</td>
                                        <td style={{ padding: '8px' }}><strong>{m.nombreMateria}</strong></td>
                                        <td style={{ padding: '8px' }}>{m.codigoMateria || '-'}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getTipoColor(m.tipoMateria || 'Basica'),
                                                color: '#fff'
                                            }}>
                                                {getTipoLabel(m.tipoMateria || 'Basica')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>{m.notaMinima || 6}</td>
                                        <td style={{ padding: '8px' }}>{getEspecialidadNombre(m.idEspecialidad)}</td>
                                        <td style={{ padding: '8px' }}>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleOpenModal(m)}
                                                style={{ padding: '4px 12px', marginRight: '4px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleDelete(m.idMateria, m.nombreMateria)}
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
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '550px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>{editingMateria ? 'Editar Materia' : 'Nueva Materia'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombre de la Materia *</label>
                                <input
                                    type="text"
                                    value={formData.nombreMateria}
                                    onChange={(e) => setFormData({ ...formData, nombreMateria: e.target.value })}
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Codigo de la Materia</label>
                                    <input
                                        type="text"
                                        value={formData.codigoMateria}
                                        onChange={(e) => setFormData({ ...formData, codigoMateria: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tipo de Materia</label>
                                    <select
                                        value={formData.tipoMateria}
                                        onChange={(e) => setFormData({ ...formData, tipoMateria: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    >
                                        <option value="Basica">Basica</option>
                                        <option value="Tecnica">Tecnica</option>
                                        <option value="Complementaria">Complementaria</option>
                                        <option value="Electiva">Electiva</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nota Minima</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.notaMinima}
                                        onChange={(e) => setFormData({ ...formData, notaMinima: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Decimales Permitidos</label>
                                    <input
                                        type="number"
                                        value={formData.decimalesPermitidos}
                                        onChange={(e) => setFormData({ ...formData, decimalesPermitidos: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Especialidad</label>
                                <select
                                    value={formData.idEspecialidad}
                                    onChange={(e) => setFormData({ ...formData, idEspecialidad: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                >
                                    <option value="">Bachillerato General</option>
                                    {especialidades
                                        .filter(e => e.nombreEspecialidad !== 'Bachillerato General')
                                        .map((e) => (
                                            <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                                {e.nombreEspecialidad}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    {editingMateria ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionMateriasRegistro;