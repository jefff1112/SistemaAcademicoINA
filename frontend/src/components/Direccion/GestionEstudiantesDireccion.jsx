// Componente Gestión de Estudiantes (Dirección): consulta historial académico y cambia de clase.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { cambiarClase } from '../../services/estudiantesService';

// Componente principal: administra la matrícula de estudiantes y sus movimientos de clase.
const GestionEstudiantesDireccion = () => {
    // Estados: estudiantes, clases, especialidades, modales, historial y búsqueda.
    const [estudiantes, setEstudiantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCambioModal, setShowCambioModal] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [estudianteCambio, setEstudianteCambio] = useState(null);
    const [nuevaClaseId, setNuevaClaseId] = useState('');
    const [historial, setHistorial] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Carga estudiantes, clases y especialidades al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene en paralelo estudiantes, clases y especialidades desde la API.
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [estudiantesRes, clasesRes, especialidadesRes] = await Promise.all([
                // Petición GET /estudiantes para listar los estudiantes matriculados.
                API.get('/estudiantes'),
                // Petición GET /clases para conocer la clase actual de cada estudiante.
                API.get('/clases'),
                // Petición GET /clases/especialidades para el catálogo de especialidades.
                API.get('/clases/especialidades')
            ]);
            setEstudiantes(estudiantesRes.data || []);
            setClases(clasesRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
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

    // Consulta el historial académico por año del estudiante seleccionado.
    const verHistorial = async (estudiante) => {
        setSelectedEstudiante(estudiante);
        setShowModal(true);
        try {
            // Petición GET /inscripciones/estudiante/{id} para listar las inscripciones por año.
            const response = await API.get(`/inscripciones/estudiante/${estudiante.idEstudiante}`);
            const inscripciones = response.data || [];
            const historialData = await Promise.all(inscripciones.map(async (ins) => {
                // Petición GET /reportes/notas-estudiante/{id}/{año} para obtener el resumen de notas.
                const notasRes = await API.get(`/reportes/notas-estudiante/${estudiante.idEstudiante}/${ins.anioLectivo}`);
                const notas = notasRes.data || {};
                return {
                    anio: ins.anioLectivo,
                    clase: ins.clase?.nombreClase || 'Sin clase',
                    promedio: notas.promedioGeneral || 0,
                    aprobadas: notas.materiasAprobadas || 0,
                    reprobadas: notas.materiasReprobadas || 0,
                    estado: notas.promedioGeneral >= 6 ? 'Aprobado' : 'Reprobado'
                };
            }));
            setHistorial(historialData.reverse());
        } catch (error) {
            mostrarMensaje('Error al cargar historial', 'error');
        }
    };

    // Abre el modal para cambiar de clase al estudiante seleccionado.
    const abrirCambioClase = (estudiante) => {
        setEstudianteCambio(estudiante);
        setNuevaClaseId('');
        setShowCambioModal(true);
    };

    // Devuelve la clase actual del estudiante a partir de su id.
    const getClaseActual = (idClase) => {
        return clases.find(c => c.idClase === idClase);
    };

    // Devuelve el nombre de la especialidad a partir de su id.
    const getEspecialidadNombre = (id) => {
        if (!id) return 'Bachillerato General';
        const esp = especialidades.find(e => e.idEspecialidad === id);
        return esp ? esp.nombreEspecialidad : 'Bachillerato General';
    };

    // Valida la nueva clase y el cupo disponible, y ejecuta el cambio de clase.
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
            // Cambia de clase al estudiante mediante el servicio y libera el cupo anterior.
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

    // Filtra los estudiantes por nombre, código o NIE según el término de búsqueda.
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
        <DashboardLayout title="Gestion de Estudiantes - Direccion">
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
                <div className="filters-row">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, codigo, NIE..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ flex: 2 }}
                    />
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Codigo</th>
                                <th>Nombres</th>
                                <th>Apellidos</th>
                                <th>NIE</th>
                                <th>Clase Actual</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantesFiltrados.map((e) => {
                                const claseActual = getClaseActual(e.idClase);
                                return (
                                    <tr key={e.idEstudiante}>
                                        <td><strong>{e.codigoEstudiante}</strong></td>
                                        <td>{e.nombres}</td>
                                        <td>{e.apellidos}</td>
                                        <td>{e.nie || '-'}</td>
                                        <td>
                                            {claseActual ? (
                                                <span style={{ fontSize: '13px' }}>
                                                    {claseActual.nombreClase}
                                                </span>
                                            ) : <span style={{ color: '#9ca3af' }}>Sin asignar</span>}
                                        </td>
                                        <td>
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
                                        <td>
                                            <button className="btn-edit" onClick={() => verHistorial(e)} style={{ marginRight: '4px' }}>Historial</button>
                                            <button
                                                className="btn-primary"
                                                onClick={() => abrirCambioClase(e)}
                                                style={{ padding: '4px 12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                            >
                                                Cambiar Clase
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>Historial Academico - {selectedEstudiante?.nombres} {selectedEstudiante?.apellidos}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Codigo:</strong> {selectedEstudiante?.codigoEstudiante}</p>
                            <p><strong>NIE:</strong> {selectedEstudiante?.nie || '-'}</p>

                            <h4 style={{ marginTop: '1rem' }}>Historial Academico</h4>
                            {historial.length === 0 ? (
                                <p>No hay historial academico disponible.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Año</th>
                                                <th>Clase</th>
                                                <th>Promedio</th>
                                                <th>Aprobadas</th>
                                                <th>Reprobadas</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historial.map((h, index) => (
                                                <tr key={index}>
                                                    <td>{h.anio}</td>
                                                    <td>{h.clase}</td>
                                                    <td>{h.promedio}</td>
                                                    <td style={{ color: '#16a34a' }}>{h.aprobadas}</td>
                                                    <td style={{ color: '#dc2626' }}>{h.reprobadas}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            backgroundColor: h.estado === 'Aprobado' ? '#dcfce7' : '#fee2e2',
                                                            color: h.estado === 'Aprobado' ? '#15803d' : '#b91c1c'
                                                        }}>
                                                            {h.estado}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="modal-buttons">
                                <button className="btn-cancel" onClick={() => setShowModal(false)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCambioModal && estudianteCambio && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>Cambiar Clase - {estudianteCambio.nombres} {estudianteCambio.apellidos}</h3>
                            <button className="modal-close" onClick={() => { setShowCambioModal(false); setEstudianteCambio(null); }}>X</button>
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
                                            const disponible = c.cupoMaximo - c.cupoActual;
                                            const esActual = c.idClase === estudianteCambio.idClase;
                                            return (
                                                <option key={c.idClase} value={c.idClase} disabled={esActual || disponible <= 0}>
                                                    {c.nombreClase} - {getEspecialidadNombre(c.idEspecialidad)} (Cupo: {disponible > 0 ? `${disponible} disponible${disponible !== 1 ? 's' : ''}` : 'LLENO'})
                                                    {esActual ? ' [ACTUAL]' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-cancel" onClick={() => { setShowCambioModal(false); setEstudianteCambio(null); }}>
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

export default GestionEstudiantesDireccion;