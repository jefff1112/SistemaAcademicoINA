// Componente Gestión de Docentes (Dirección): crea, edita, desactiva docentes y asigna materias.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getDocentes, createDocente, updateDocente, deleteDocente } from '../../services/docentesService';
import { getMaterias } from '../../services/materiasService';
import { getClases } from '../../services/clasesService';
import { getDocenteMateriasByDocente, createDocenteMateria, deleteDocenteMateria } from '../../services/docenteMateriasService';

// Componente principal: administra la planta docente y la asignación de materias por año.
const GestionDocentesDireccion = () => {
    // Estados: docentes, modal de edición, búsqueda y datos del formulario.
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDocente, setSelectedDocente] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        codigoDocente: '',
        nombres: '',
        apellidos: '',
        dui: '',
        correo: '',
        telefono: '',
        especialidadDocente: '',
        tipoDocente: 'Basica',
        fechaIngreso: '',
        estado: true
    });

    // Estado para el modal de asignación de materias
    // Estados del modal de asignación: materias, clases, asignaciones y formulario de asignación.
    const [showAsignarModal, setShowAsignarModal] = useState(false);
    const [materiasList, setMateriasList] = useState([]);
    const [clasesList, setClasesList] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [asignarForm, setAsignarForm] = useState({
        idMateria: '',
        idClase: '',
        anioLectivo: new Date().getFullYear(),
        puedeCalificar: true,
        puedeAmonestar: true
    });
    const [asignando, setAsignando] = useState(false);

    // Carga la lista de docentes al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene los docentes desde el servicio del backend.
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await getDocentes();
            setDocentes(data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar docentes', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Muestra un mensaje temporal al usuario y lo limpia después de 4 segundos.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Abre el modal para crear un docente o editar el seleccionado.
    const handleOpenModal = (docente = null) => {
        if (docente) {
            setSelectedDocente(docente);
            setFormData({
                codigoDocente: docente.codigoDocente || '',
                nombres: docente.nombres || '',
                apellidos: docente.apellidos || '',
                dui: docente.dui || '',
                correo: docente.correo || '',
                telefono: docente.telefono || '',
                especialidadDocente: docente.especialidadDocente || '',
                tipoDocente: docente.tipoDocente || 'Basica',
                fechaIngreso: docente.fechaIngreso ? new Date(docente.fechaIngreso).toISOString().split('T')[0] : '',
                estado: docente.estado !== undefined ? docente.estado : true
            });
        } else {
            setSelectedDocente(null);
            setFormData({
                codigoDocente: '',
                nombres: '',
                apellidos: '',
                dui: '',
                correo: '',
                telefono: '',
                especialidadDocente: '',
                tipoDocente: 'Basica',
                fechaIngreso: '',
                estado: true
            });
        }
        setShowModal(true);
    };

    // Valida campos requeridos y crea o actualiza el docente según corresponda.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validar campos requeridos
            if (!formData.codigoDocente.trim()) {
                mostrarMensaje('El código del docente es requerido', 'error');
                setLoading(false);
                return;
            }
            if (!formData.nombres.trim()) {
                mostrarMensaje('Los nombres son requeridos', 'error');
                setLoading(false);
                return;
            }
            if (!formData.apellidos.trim()) {
                mostrarMensaje('Los apellidos son requeridos', 'error');
                setLoading(false);
                return;
            }

            const dataToSend = {
                codigoDocente: formData.codigoDocente.trim(),
                nombres: formData.nombres.trim(),
                apellidos: formData.apellidos.trim(),
                dui: formData.dui || null,
                correo: formData.correo || null,
                telefono: formData.telefono || null,
                especialidadDocente: formData.especialidadDocente || null,
                tipoDocente: formData.tipoDocente || 'Basica',
                fechaIngreso: formData.fechaIngreso || null,
                estado: formData.estado
            };

            console.log('Enviando datos al backend:', JSON.stringify(dataToSend, null, 2));

            if (selectedDocente) {
                // Actualiza el docente existente con los datos del formulario.
                await updateDocente(selectedDocente.idDocente, dataToSend);
                mostrarMensaje('Docente actualizado correctamente', 'success');
            } else {
                // Crea un nuevo docente con los datos del formulario.
                await createDocente(dataToSend);
                mostrarMensaje('Docente creado correctamente', 'success');
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

    // Desactiva o activa un docente tras confirmar con el usuario.
    const handleDelete = async (docente) => {
        if (!window.confirm(`¿Desactivar al docente ${docente.nombres} ${docente.apellidos}?`)) return;

        setLoading(true);
        try {
            // Desactiva al docente por su id mediante el servicio.
            await deleteDocente(docente.idDocente);
            mostrarMensaje('Docente desactivado correctamente', 'success');
            cargarDatos();
        } catch (error) {
            const mensaje = error.response?.data?.mensaje || error.message || 'Error al desactivar';
            mostrarMensaje(mensaje, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filtra los docentes por nombre, código o correo según el término de búsqueda.
    const docentesFiltrados = docentes.filter(d => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (d.nombres?.toLowerCase().includes(term) ||
            d.apellidos?.toLowerCase().includes(term) ||
            d.codigoDocente?.toLowerCase().includes(term) ||
            d.correo?.toLowerCase().includes(term));
    });

    // ============================================================
    // ASIGNACIÓN DE MATERIAS AL DOCENTE
    // ============================================================
    // Abre el modal de asignación y carga materias, clases y asignaciones del docente.
    const handleOpenAsignar = async (docente) => {
        setSelectedDocente(docente);
        setAsignarForm({
            idMateria: '',
            idClase: '',
            anioLectivo: new Date().getFullYear(),
            puedeCalificar: true,
            puedeAmonestar: true
        });
        setShowAsignarModal(true);

        try {
            const anio = new Date().getFullYear();
            const [materiasData, clasesData, asignacionesData] = await Promise.all([
                getMaterias(),
                getClases(),
                getDocenteMateriasByDocente(docente.idDocente, anio)
            ]);
            setMateriasList(materiasData || []);
            setClasesList(clasesData || []);
            setAsignaciones(asignacionesData || []);
        } catch (error) {
            console.error('Error cargando datos de asignación:', error);
            mostrarMensaje('Error al cargar datos de asignación', 'error');
        }
    };

    // Cierra el modal de asignación y limpia los datos temporales.
    const handleCerrarAsignar = () => {
        setShowAsignarModal(false);
        setSelectedDocente(null);
        setAsignaciones([]);
    };

    // Valida materia y clase, y crea la asignación docente-materia.
    const handleAsignar = async (e) => {
        e.preventDefault();
        if (!asignarForm.idMateria || !asignarForm.idClase) {
            mostrarMensaje('Seleccione materia y clase', 'error');
            return;
        }

        setAsignando(true);
        try {
            // Crea la asignación de materia al docente mediante el servicio.
            await createDocenteMateria({
                idDocente: selectedDocente.idDocente,
                idMateria: parseInt(asignarForm.idMateria),
                idClase: parseInt(asignarForm.idClase),
                anioLectivo: parseInt(asignarForm.anioLectivo),
                puedeCalificar: asignarForm.puedeCalificar,
                puedeAmonestar: asignarForm.puedeAmonestar
            });
            mostrarMensaje('Materia asignada correctamente', 'success');
            const asignacionesData = await getDocenteMateriasByDocente(selectedDocente.idDocente, asignarForm.anioLectivo);
            setAsignaciones(asignacionesData || []);
            setAsignarForm({
                ...asignarForm,
                idMateria: '',
                idClase: ''
            });
        } catch (error) {
            const mensaje = error.response?.data?.mensaje || 'Error al asignar materia';
            mostrarMensaje(mensaje, 'error');
        } finally {
            setAsignando(false);
        }
    };

    // Quita la asignación de materia al docente tras confirmar con el usuario.
    const handleQuitarAsignacion = async (asignacion) => {
        if (!window.confirm('¿Quitar esta materia asignada?')) return;
        try {
            // Elimina la asignación por su id mediante el servicio.
            await deleteDocenteMateria(asignacion.idDocenteMateria);
            mostrarMensaje('Asignación eliminada correctamente', 'success');
            const asignacionesData = await getDocenteMateriasByDocente(selectedDocente.idDocente, asignarForm.anioLectivo);
            setAsignaciones(asignacionesData || []);
        } catch (error) {
            const mensaje = error.response?.data?.mensaje || 'Error al eliminar asignación';
            mostrarMensaje(mensaje, 'error');
        }
    };

    // Filtra las asignaciones activas del año lectivo seleccionado.
    const asignacionesFiltradas = asignaciones.filter(a => a.anioLectivo === parseInt(asignarForm.anioLectivo) && a.estado);

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Docentes">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Docentes - Direccion">
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
                <div className="filters-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, código, correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ flex: 2, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                    <button
                        className="btn-primary"
                        onClick={() => handleOpenModal()}
                        style={{ padding: '8px 20px' }}
                    >
                        + Nuevo Docente
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Código</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombres</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Apellidos</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Correo</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docentesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay docentes registrados
                                    </td>
                                </tr>
                            ) : (
                                docentesFiltrados.map((d) => (
                                    <tr key={d.idDocente} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}><strong>{d.codigoDocente}</strong></td>
                                        <td style={{ padding: '8px' }}>{d.nombres}</td>
                                        <td style={{ padding: '8px' }}>{d.apellidos}</td>
                                        <td style={{ padding: '8px' }}>{d.correo || '-'}</td>
                                        <td style={{ padding: '8px' }}>{d.especialidadDocente || '-'}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: d.estado ? '#dcfce7' : '#fee2e2',
                                                color: d.estado ? '#15803d' : '#b91c1c'
                                            }}>
                                                {d.estado ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleOpenModal(d)}
                                                style={{ padding: '4px 12px', marginRight: '4px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleOpenAsignar(d)}
                                                style={{ padding: '4px 12px', marginRight: '4px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                title="Asignar materias al docente"
                                            >
                                                Materias
                                            </button>
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleDelete(d)}
                                                style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                {d.estado ? 'Desactivar' : 'Activar'}
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
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '600px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>{selectedDocente ? 'Editar Docente' : 'Nuevo Docente'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Código *</label>
                                    <input
                                        type="text"
                                        value={formData.codigoDocente}
                                        onChange={(e) => setFormData({ ...formData, codigoDocente: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>DUI</label>
                                    <input
                                        type="text"
                                        value={formData.dui}
                                        onChange={(e) => setFormData({ ...formData, dui: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombres *</label>
                                    <input
                                        type="text"
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Apellidos *</label>
                                    <input
                                        type="text"
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Correo</label>
                                    <input
                                        type="email"
                                        value={formData.correo}
                                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Especialidad</label>
                                    <input
                                        type="text"
                                        value={formData.especialidadDocente}
                                        onChange={(e) => setFormData({ ...formData, especialidadDocente: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tipo</label>
                                    <select
                                        value={formData.tipoDocente}
                                        onChange={(e) => setFormData({ ...formData, tipoDocente: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    >
                                        <option value="Basica">Básica</option>
                                        <option value="Tecnica">Técnica</option>
                                        <option value="Ambas">Ambas</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha Ingreso</label>
                                    <input
                                        type="date"
                                        value={formData.fechaIngreso}
                                        onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
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
                                    {selectedDocente ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showAsignarModal && selectedDocente && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '700px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Asignar Materias - {selectedDocente.nombres} {selectedDocente.apellidos}</h3>
                            <button className="modal-close" onClick={handleCerrarAsignar} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Año Lectivo</label>
                            <select
                                value={asignarForm.anioLectivo}
                                onChange={(e) => {
                                    const anio = parseInt(e.target.value);
                                    setAsignarForm({ ...asignarForm, anioLectivo: anio });
                                    getDocenteMateriasByDocente(selectedDocente.idDocente, anio)
                                        .then(data => setAsignaciones(data || []))
                                        .catch(() => setAsignaciones([]));
                                }}
                                className="form-control"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                            >
                                {[new Date().getFullYear(), new Date().getFullYear() + 1].map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>

                        <form onSubmit={handleAsignar}>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Materia</label>
                                    <select
                                        value={asignarForm.idMateria}
                                        onChange={(e) => setAsignarForm({ ...asignarForm, idMateria: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {materiasList.map(m => (
                                            <option key={m.idMateria} value={m.idMateria}>{m.nombreMateria}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Clase</label>
                                    <select
                                        value={asignarForm.idClase}
                                        onChange={(e) => setAsignarForm({ ...asignarForm, idClase: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {clasesList.map(c => (
                                            <option key={c.idClase} value={c.idClase}>
                                                {c.nombreClase} ({c.seccion})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Permisos</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px' }}>
                                        <label style={{ fontWeight: '400' }}>
                                            <input
                                                type="checkbox"
                                                checked={asignarForm.puedeCalificar}
                                                onChange={(e) => setAsignarForm({ ...asignarForm, puedeCalificar: e.target.checked })}
                                            /> Calificar
                                        </label>
                                        <label style={{ fontWeight: '400' }}>
                                            <input
                                                type="checkbox"
                                                checked={asignarForm.puedeAmonestar}
                                                onChange={(e) => setAsignarForm({ ...asignarForm, puedeAmonestar: e.target.checked })}
                                            /> Amonestar
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn-primary" disabled={asignando} style={{ padding: '8px 20px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    {asignando ? 'Asignando...' : '+ Asignar Materia'}
                                </button>
                            </div>
                        </form>

                        <div style={{ marginTop: '20px' }}>
                            <h4 style={{ marginBottom: '8px' }}>Materias asignadas ({asignacionesFiltradas.length})</h4>
                            {asignacionesFiltradas.length === 0 ? (
                                <p style={{ color: '#7f8c8d' }}>Sin materias asignadas para este año.</p>
                            ) : (
                                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f1f5f9' }}>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Materia</th>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Clase</th>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Calificar</th>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Amonestar</th>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {asignacionesFiltradas.map(a => (
                                            <tr key={a.idDocenteMateria} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '8px' }}>{a.materia?.nombreMateria || a.nombreMateria || `#${a.idMateria}`}</td>
                                                <td style={{ padding: '8px' }}>
                                                    {a.clase?.nombreClase || a.nombreClase || `#${a.idClase}`}
                                                    {a.clase?.seccion ? ` (${a.clase.seccion})` : (a.seccion ? ` (${a.seccion})` : '')}
                                                </td>
                                                <td style={{ padding: '8px' }}>{a.puedeCalificar ? 'Sí' : 'No'}</td>
                                                <td style={{ padding: '8px' }}>{a.puedeAmonestar ? 'Sí' : 'No'}</td>
                                                <td style={{ padding: '8px' }}>
                                                    <button
                                                        onClick={() => handleQuitarAsignacion(a)}
                                                        style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        Quitar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionDocentesDireccion;