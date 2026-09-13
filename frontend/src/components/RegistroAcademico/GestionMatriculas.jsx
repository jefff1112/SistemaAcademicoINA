// Componente Gestión de Matrículas (Registro Académico): matricula formalmente a los
// aspirantes aprobados por Dirección, creando el estudiante, su usuario de acceso
// y la inscripción 'Nuevo Ingreso' con la clase fijada por Dirección.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionMatriculas = () => {
    const [aspirantes, setAspirantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAspirante, setSelectedAspirante] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [matriculando, setMatriculando] = useState(false);
    const [formData, setFormData] = useState({
        fechaMatricula: new Date().toISOString().split('T')[0],
        numeroExpediente: '',
        numeroCarnet: '',
        telefonoMovil: '',
        telefonoFijo: '',
        direccion: '',
        documentosPresentados: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEspecialidad, setFilterEspecialidad] = useState('');

    // Carga los aspirantes aprobados, las clases y las especialidades al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene los datos en paralelo y conserva solo aspirantes aprobados sin matricular.
    const cargarDatos = async () => {
        try {
            const [aspirantesRes, clasesRes, especialidadesRes] = await Promise.all([
                API.get('/aspirantes'),
                API.get('/clases'),
                API.get('/clases/especialidades')
            ]);
            // Solo aprobados por Dirección que aún no fueron convertidos en estudiantes.
            const aprobados = (aspirantesRes.data || []).filter(a =>
                a.estadoSolicitud === 'Aprobado' && !a.idEstudianteGenerado
            );
            setAspirantes(aprobados);
            setClases(clasesRes.data || []);
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

    // Mapea el id de especialidad a su nombre usando el catálogo real de la API.
    const getEspecialidadNombre = (id) => {
        if (!id) return 'Bachillerato General';
        const esp = especialidades.find(e => e.idEspecialidad === Number(id));
        return esp ? esp.nombreEspecialidad : 'Sin especialidad';
    };

    // Busca una clase por su id tolerando distintos nombres de campo.
    const getClase = (id) => {
        if (!id) return null;
        return clases.find(c => Number(c.idClase ?? c.IdClase ?? c.id) === Number(id));
    };

    // Abre el modal de matrícula con los datos del aspirante precargados.
    const abrirModal = (aspirante) => {
        setSelectedAspirante(aspirante);
        setFormData({
            fechaMatricula: new Date().toISOString().split('T')[0],
            numeroExpediente: aspirante.numeroExpediente || '',
            numeroCarnet: aspirante.carnetMenoridad || '',
            telefonoMovil: aspirante.telefono || '',
            telefonoFijo: aspirante.telefonoFijo || '',
            direccion: aspirante.direccion || '',
            documentosPresentados: aspirante.documentosPresentados || ''
        });
        setShowModal(true);
    };

    // Valida y ejecuta la matrícula formal del aspirante aprobado.
    const handleMatricular = async () => {
        if (!selectedAspirante) return;
        if (!formData.fechaMatricula) {
            mostrarMensaje('Seleccione la fecha de matrícula', 'error');
            return;
        }
        setMatriculando(true);
        try {
            // Petición POST /aspirantes/matricular/{id}: crea el estudiante con la clase
            // fijada por Dirección, su usuario de acceso y la inscripción 'Nuevo Ingreso'.
            const response = await API.post(`/aspirantes/matricular/${selectedAspirante.idAspirante}`, {
                fechaMatricula: formData.fechaMatricula,
                numeroExpediente: formData.numeroExpediente,
                numeroCarnet: formData.numeroCarnet,
                telefonoMovil: formData.telefonoMovil,
                telefonoFijo: formData.telefonoFijo,
                direccion: formData.direccion,
                documentosPresentados: formData.documentosPresentados,
                matriculadoPor: 'Registro Academico'
            });
            mostrarMensaje(response.data?.mensaje || 'Estudiante matriculado exitosamente', 'success');
            setShowModal(false);
            setSelectedAspirante(null);
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al matricular', 'error');
        } finally {
            setMatriculando(false);
        }
    };

    // Filtra aspirantes por término de búsqueda o especialidad.
    const aspirantesFiltrados = aspirantes.filter(a => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (a.nombres?.toLowerCase().includes(term) ||
                a.apellidos?.toLowerCase().includes(term) ||
                a.nie?.toLowerCase().includes(term));
        }
        if (filterEspecialidad) {
            return a.especialidadAspira === parseInt(filterEspecialidad);
        }
        return true;
    });

    if (loading) {
        return (
            <DashboardLayout title="Matriculas">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Matriculas - Registro Academico">
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
                <h3>Aspirantes Aprobados</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '1rem' }}>
                    Estos aspirantes fueron aprobados por Dirección con una clase asignada.
                    Complete su matrícula para crear el estudiante y la inscripción.
                </p>
                <div className="filters-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, NIE..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ flex: 2, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                    <select
                        value={filterEspecialidad}
                        onChange={(e) => setFilterEspecialidad(e.target.value)}
                        className="filter-select"
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                        <option value="">Todas las especialidades</option>
                        {especialidades.map((e) => (
                            <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                {e.nombreEspecialidad}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombres</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Apellidos</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>NIE</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Clase Asignada</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Accion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aspirantesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay aspirantes aprobados pendientes de matrícula
                                    </td>
                                </tr>
                            ) : (
                                aspirantesFiltrados.map((a) => {
                                    const clase = getClase(a.idClaseAsignada);
                                    return (
                                        <tr key={a.idAspirante} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '8px' }}>{a.idAspirante}</td>
                                            <td style={{ padding: '8px' }}><strong>{a.nombres}</strong></td>
                                            <td style={{ padding: '8px' }}>{a.apellidos}</td>
                                            <td style={{ padding: '8px' }}>{a.nie || '-'}</td>
                                            <td style={{ padding: '8px' }}>{getEspecialidadNombre(a.especialidadAspira)}</td>
                                            <td style={{ padding: '8px' }}>
                                                {clase ? (
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        backgroundColor: '#e0f2fe',
                                                        color: '#0369a1'
                                                    }}>
                                                        {clase.nombreClase || clase.NombreClase || `Clase ${a.idClaseAsignada}`}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#b91c1c', fontSize: '13px' }}>Sin clase asignada</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: '#dcfce7',
                                                    color: '#15803d'
                                                }}>
                                                    Aprobado
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <button
                                                    onClick={() => abrirModal(a)}
                                                    disabled={!a.idClaseAsignada}
                                                    style={{
                                                        padding: '6px 14px',
                                                        background: a.idClaseAsignada ? '#16a34a' : '#9ca3af',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: a.idClaseAsignada ? 'pointer' : 'not-allowed',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    Matricular
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

            {showModal && selectedAspirante && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '600px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Matricular Aspirante</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Aspirante:</strong> {selectedAspirante.nombres} {selectedAspirante.apellidos}</p>
                            <p><strong>NIE:</strong> {selectedAspirante.nie || '-'}</p>
                            <p><strong>Especialidad:</strong> {getEspecialidadNombre(selectedAspirante.especialidadAspira)}</p>
                            {getClase(selectedAspirante.idClaseAsignada) && (
                                <p><strong>Clase asignada (por Direccion):</strong> {getClase(selectedAspirante.idClaseAsignada).nombreClase || getClase(selectedAspirante.idClaseAsignada).NombreClase}</p>
                            )}

                            <div className="form-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <div className="form-group" style={{ flex: 1, minWidth: '200px', marginTop: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha de Matricula *</label>
                                    <input
                                        type="date"
                                        value={formData.fechaMatricula}
                                        onChange={(e) => setFormData({ ...formData, fechaMatricula: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1, minWidth: '200px', marginTop: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Numero de Expediente</label>
                                    <input
                                        type="text"
                                        value={formData.numeroExpediente}
                                        onChange={(e) => setFormData({ ...formData, numeroExpediente: e.target.value })}
                                        className="form-control"
                                        placeholder="Ej: EXP-2026-001"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1, minWidth: '200px', marginTop: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Numero de Carnet</label>
                                    <input
                                        type="text"
                                        value={formData.numeroCarnet}
                                        onChange={(e) => setFormData({ ...formData, numeroCarnet: e.target.value })}
                                        className="form-control"
                                        placeholder="Opcional"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1, minWidth: '200px', marginTop: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Telefono Movil</label>
                                    <input
                                        type="text"
                                        value={formData.telefonoMovil}
                                        onChange={(e) => setFormData({ ...formData, telefonoMovil: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1, minWidth: '200px', marginTop: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Telefono Fijo</label>
                                    <input
                                        type="text"
                                        value={formData.telefonoFijo}
                                        onChange={(e) => setFormData({ ...formData, telefonoFijo: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1, minWidth: '200px', marginTop: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Direccion</label>
                                    <input
                                        type="text"
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Documentos Presentados</label>
                                <textarea
                                    value={formData.documentosPresentados}
                                    onChange={(e) => setFormData({ ...formData, documentosPresentados: e.target.value })}
                                    className="form-control"
                                    rows="3"
                                    placeholder="Ej: Partida de nacimiento, notas de noveno grado, DUI..."
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button className="btn-cancel" onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button
                                    className="btn-success"
                                    onClick={handleMatricular}
                                    disabled={matriculando}
                                    style={{
                                        padding: '8px 20px',
                                        background: '#16a34a',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: matriculando ? 'wait' : 'pointer'
                                    }}
                                >
                                    {matriculando ? 'Matriculando...' : 'Confirmar Matricula'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionMatriculas;
