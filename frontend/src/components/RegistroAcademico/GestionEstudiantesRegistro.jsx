// Componente Gestión de Estudiantes (Registro Académico): crea, edita, desactiva y cambia de clase a estudiantes verificando cupos.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getEstudiantes, createEstudiante, updateEstudiante, deleteEstudiante, cambiarClase } from '../../services/estudiantesService';
import { getClases } from '../../services/clasesService';
import { getEspecialidades } from '../../services/especialidadesService';

const GestionEstudiantesRegistro = () => {
    // Estado de estudiantes, clases, especialidades, modales y formulario.
    const [estudiantes, setEstudiantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCambioModal, setShowCambioModal] = useState(false);
    const [estudianteCambio, setEstudianteCambio] = useState(null);
    const [nuevaClaseId, setNuevaClaseId] = useState('');
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        codigoEstudiante: '',
        dui: '',
        nie: '',
        correoEstudiante: '',
        telefonoMovil: '',
        direccion: '',
        idClase: '',
        estado: true
    });

    // Carga estudiantes, clases y especialidades al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene los tres catálogos en paralelo desde la API.
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [estudiantesData, clasesData, especialidadesData] = await Promise.all([
                getEstudiantes(),
                getClases(),
                getEspecialidades()
            ]);
            setEstudiantes(estudiantesData || []);
            setClases(clasesData || []);
            setEspecialidades(especialidadesData || []);
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
    const handleOpenModal = (estudiante = null) => {
        if (estudiante) {
            setSelectedEstudiante(estudiante);
            setFormData({
                nombres: estudiante.nombres || '',
                apellidos: estudiante.apellidos || '',
                codigoEstudiante: estudiante.codigoEstudiante || '',
                dui: estudiante.dui || '',
                nie: estudiante.nie || '',
                correoEstudiante: estudiante.correoEstudiante || '',
                telefonoMovil: estudiante.telefonoMovil || '',
                direccion: estudiante.direccion || '',
                idClase: estudiante.idClase || '',
                estado: estudiante.estado !== undefined ? estudiante.estado : true
            });
        } else {
            setSelectedEstudiante(null);
            setFormData({
                nombres: '',
                apellidos: '',
                codigoEstudiante: '',
                dui: '',
                nie: '',
                correoEstudiante: '',
                telefonoMovil: '',
                direccion: '',
                idClase: '',
                estado: true
            });
        }
        setShowModal(true);
    };

    // Crea o actualiza el estudiante en la API según el modo del modal.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend = {
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                codigoEstudiante: formData.codigoEstudiante,
                dui: formData.dui || null,
                nie: formData.nie || null,
                correoEstudiante: formData.correoEstudiante || null,
                telefonoMovil: formData.telefonoMovil || null,
                direccion: formData.direccion || null,
                idClase: formData.idClase ? parseInt(formData.idClase) : null,
                estado: formData.estado
            };

            console.log('Enviando datos al backend:', JSON.stringify(dataToSend, null, 2));

            let response;
            if (selectedEstudiante) {
                response = await updateEstudiante(selectedEstudiante.idEstudiante, dataToSend);
                console.log('Respuesta actualización:', response);
                mostrarMensaje('Estudiante actualizado correctamente', 'success');
            } else {
                response = await createEstudiante(dataToSend);
                console.log('Respuesta creación:', response);
                mostrarMensaje('Estudiante creado correctamente', 'success');
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

    // Desactiva o reactiva al estudiante tras la confirmación del usuario.
    const handleDelete = async (estudiante) => {
        if (!window.confirm(`¿Desactivar al estudiante ${estudiante.nombres} ${estudiante.apellidos}?`)) return;

        setLoading(true);
        try {
            await deleteEstudiante(estudiante.idEstudiante);
            mostrarMensaje('Estudiante desactivado correctamente', 'success');
            cargarDatos();
        } catch (error) {
            const mensaje = error.response?.data?.mensaje || error.message || 'Error al desactivar';
            mostrarMensaje(mensaje, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Abre el modal de cambio de clase para el estudiante indicado.
    const abrirCambioClase = (estudiante) => {
        setEstudianteCambio(estudiante);
        setNuevaClaseId('');
        setShowCambioModal(true);
    };

    // Devuelve la clase actual del estudiante desde el catálogo local.
    const getClaseActual = (idClase) => {
        return clases.find(c => c.idClase === idClase);
    };

    // Valida la nueva clase y el cupo disponible antes de realizar el cambio en la API.
    const handleCambioClase = async (e) => {
        e.preventDefault();
        if (!nuevaClaseId) {
            mostrarMensaje('Seleccione una nueva clase', 'error');
            return;
        }
        if (Number(nuevaClaseId) === estudianteCambio.idClase) {
            mostrarMensaje('La nueva clase es igual a la actual', 'error');
            return;
        }
        const nuevaClase = clases.find(c => c.idClase === Number(nuevaClaseId));
        if (nuevaClase && nuevaClase.cupoActual >= nuevaClase.cupoMaximo) {
            mostrarMensaje('La clase seleccionada no tiene cupo disponible', 'error');
            return;
        }
        try {
            await cambiarClase(estudianteCambio.idEstudiante, Number(nuevaClaseId));
            mostrarMensaje('Clase cambiada correctamente. Cupo liberado en la clase anterior.', 'success');
            setShowCambioModal(false);
            setEstudianteCambio(null);
            cargarDatos();
        } catch (error) {
            console.error('Error al cambiar clase - response:', error.response);
            const detalle = error.response?.data?.mensaje || JSON.stringify(error.response?.data) || error.message || 'Error al cambiar clase';
            mostrarMensaje(`${error.response?.status ? error.response.status + ' - ' : ''}${detalle}`, 'error');
        }
    };

    // Resuelve nombre de clase, especialidad y sección para la tabla.
    const getClaseInfo = (idClase) => {
        const clase = clases.find(c => c.idClase === idClase);
        if (!clase) return { nombre: 'Sin clase', especialidad: 'Sin especialidad', seccion: '-' };

        const especialidad = especialidades.find(e => e.idEspecialidad === clase.idEspecialidad);
        return {
            nombre: clase.nombreClase || 'Sin clase',
            especialidad: especialidad ? especialidad.nombreEspecialidad : 'Bachillerato General',
            seccion: clase.seccion || '-'
        };
    };

    // Filtra estudiantes por nombre, código o NIE según el término de búsqueda.
    const estudiantesFiltrados = estudiantes.filter(e => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (e.nombres?.toLowerCase().includes(term) ||
            e.apellidos?.toLowerCase().includes(term) ||
            e.codigoEstudiante?.toLowerCase().includes(term) ||
            e.nie?.toLowerCase().includes(term));
    });

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Estudiantes">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Estudiantes - Registro Academico">
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
                <div className="filters-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, código, NIE..."
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
                        + Nuevo Estudiante
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Código</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombres</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Apellidos</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>NIE</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Clase</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Sección</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay estudiantes registrados
                                    </td>
                                </tr>
                            ) : (
                                estudiantesFiltrados.map((e) => {
                                    const claseInfo = getClaseInfo(e.idClase);
                                    return (
                                        <tr key={e.idEstudiante} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '8px' }}><strong>{e.codigoEstudiante}</strong></td>
                                            <td style={{ padding: '8px' }}>{e.nombres}</td>
                                            <td style={{ padding: '8px' }}>{e.apellidos}</td>
                                            <td style={{ padding: '8px' }}>{e.nie || '-'}</td>
                                            <td style={{ padding: '8px' }}>{claseInfo.nombre}</td>
                                            <td style={{ padding: '8px' }}>{claseInfo.especialidad}</td>
                                            <td style={{ padding: '8px' }}>{claseInfo.seccion}</td>
                                            <td style={{ padding: '8px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: e.estado ? '#dcfce7' : '#fee2e2',
                                                    color: e.estado ? '#15803d' : '#b91c1c'
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
                                                    className="btn-primary"
                                                    onClick={() => abrirCambioClase(e)}
                                                    style={{ padding: '4px 12px', marginRight: '4px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                                >
                                                    Cambiar Clase
                                                </button>
                                                <button
                                                    className="btn-danger"
                                                    onClick={() => handleDelete(e)}
                                                    style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    {e.estado ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Editar */}
            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '600px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>{selectedEstudiante ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Código *</label>
                                    <input
                                        type="text"
                                        value={formData.codigoEstudiante}
                                        onChange={(e) => setFormData({ ...formData, codigoEstudiante: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>NIE</label>
                                    <input
                                        type="text"
                                        value={formData.nie}
                                        onChange={(e) => setFormData({ ...formData, nie: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
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
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.telefonoMovil}
                                        onChange={(e) => setFormData({ ...formData, telefonoMovil: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Correo</label>
                                <input
                                    type="email"
                                    value={formData.correoEstudiante}
                                    onChange={(e) => setFormData({ ...formData, correoEstudiante: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Dirección</label>
                                <textarea
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    rows="2"
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Clase</label>
                                    <select
                                        value={formData.idClase}
                                        onChange={(e) => setFormData({ ...formData, idClase: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    >
                                        <option value="">Seleccionar Clase</option>
                                        {clases.map((c) => {
                                            const esp = especialidades.find(e => e.idEspecialidad === c.idEspecialidad);
                                            return (
                                                <option key={c.idClase} value={c.idClase}>
                                                    {c.nombreClase} - {esp ? esp.nombreEspecialidad : 'Bachillerato General'} (Sección {c.seccion})
                                                </option>
                                            );
                                        })}
                                    </select>
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
                                    {selectedEstudiante ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCambioModal && estudianteCambio && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Cambiar Clase - {estudianteCambio.nombres} {estudianteCambio.apellidos}</h3>
                            <button className="modal-close" onClick={() => { setShowCambioModal(false); setEstudianteCambio(null); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '1rem', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                                <p style={{ margin: '4px 0' }}><strong>Clase Actual:</strong> {getClaseActual(estudianteCambio.idClase)?.nombreClase || 'Sin asignar'}</p>
                                <p style={{ margin: '4px 0' }}><strong>Seccion:</strong> {getClaseActual(estudianteCambio.idClase)?.seccion || '-'}</p>
                            </div>

                            <form onSubmit={handleCambioClase}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Nueva Clase *</label>
                                    <select
                                        value={nuevaClaseId}
                                        onChange={(e) => setNuevaClaseId(e.target.value)}
                                        className="form-control"
                                        required
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    >
                                        <option value="">Seleccionar nueva clase</option>
                                        {clases.map((c) => {
                                            const esp = especialidades.find(e => e.idEspecialidad === c.idEspecialidad);
                                            const disponible = c.cupoMaximo - c.cupoActual;
                                            const esActual = c.idClase === estudianteCambio.idClase;
                                            return (
                                                <option key={c.idClase} value={c.idClase} disabled={esActual || disponible <= 0}>
                                                    {c.nombreClase} - {esp ? esp.nombreEspecialidad : 'Bachillerato General'} (Cupo: {disponible > 0 ? `${disponible} disponible${disponible !== 1 ? 's' : ''}` : 'LLENO'})
                                                    {esActual ? ' [ACTUAL]' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-cancel" onClick={() => { setShowCambioModal(false); setEstudianteCambio(null); }} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ padding: '8px 20px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                        Confirmar Cambio
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionEstudiantesRegistro;