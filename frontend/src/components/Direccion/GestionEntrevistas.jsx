// Componente Gestión de Entrevistas (Dirección): programa entrevistas y aprueba o rechaza aspirantes.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra el flujo de entrevistas de los aspirantes al instituto.
const GestionEntrevistas = () => {
    // Estados: aspirantes pendientes, entrevistas, entrevistadores y mensajes.
    const [aspirantesPendientes, setAspirantesPendientes] = useState([]);
    const [entrevistasProgramadas, setEntrevistasProgramadas] = useState([]);
    const [entrevistadores, setEntrevistadores] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Modal Programar
    // Estados del modal de programación: aspirante seleccionado y formulario de fecha/entrevistador.
    const [showModal, setShowModal] = useState(false);
    const [selectedAspirante, setSelectedAspirante] = useState(null);
    const [formData, setFormData] = useState({
        fechaEntrevista: '',
        entrevistador: ''
    });

    // Modal Resultado
    // Estados del modal de resultado: entrevista seleccionada y datos de la evaluación.
    const [showResultadoModal, setShowResultadoModal] = useState(false);
    const [selectedEntrevista, setSelectedEntrevista] = useState(null);
    const [clasesDisponibles, setClasesDisponibles] = useState([]);
    const [claseSeleccionada, setClaseSeleccionada] = useState('');
    const [resultadoData, setResultadoData] = useState({
        aprobado: true,
        observaciones: '',
        motivoRechazo: ''
    });

    // Carga aspirantes, entrevistas y docentes al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene en paralelo aspirantes, entrevistas y docentes entrevistadores.
    const cargarDatos = async () => {
        try {
            const [aspirantesRes, entrevistasRes, docentesRes, especialidadesRes] = await Promise.all([
                // Petición GET /aspirantes para listar las solicitudes pendientes.
                API.get('/aspirantes'),
                // Petición GET /entrevistas para listar las entrevistas programadas.
                API.get('/entrevistas'),
                // Petición GET /docentes para el selector de entrevistador.
                API.get('/docentes'),
                // Petición GET /clases/especialidades para el catálogo real de especialidades.
                API.get('/clases/especialidades')
            ]);
            const pendientes = aspirantesRes.data.filter(a => a.estadoSolicitud === 'Pendiente');
            setAspirantesPendientes(pendientes);
            setEntrevistasProgramadas(entrevistasRes.data || []);
            setEntrevistadores(docentesRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
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

    // Devuelve el nombre de la especialidad a partir de su id usando el catálogo real de la API.
    const getEspecialidadNombre = (id) => {
        if (!id) return 'Bachillerato General';
        const esp = especialidades.find(e => e.idEspecialidad === Number(id));
        return esp ? esp.nombreEspecialidad : '-';
    };

    // Valida fecha y entrevistador, verifica el NIE y programa la entrevista.
    const handleProgramar = async (e) => {
        e.preventDefault();
        if (!selectedAspirante) return;
        if (!formData.fechaEntrevista) {
            mostrarMensaje('Seleccione una fecha para la entrevista', 'error');
            return;
        }
        if (!formData.entrevistador.trim()) {
            mostrarMensaje('Ingrese el nombre del entrevistador', 'error');
            return;
        }

        try {
            // Antes de programar, comprobar si el NIE ya está en estudiantes
            const nieVal = selectedAspirante?.nie && String(selectedAspirante.nie).trim();
            if (nieVal) {
                try {
                    // Petición GET /estudiantes para verificar si el NIE ya está registrado.
                    const estudiantesResp = await API.get('/estudiantes');
                    const estudiantes = estudiantesResp.data || [];
                    const exists = estudiantes.find(s => s.nie && String(s.nie).trim() === nieVal);
                    if (exists) {
                        mostrarMensaje(`El alumno ya está registrado en la sección ${exists.seccion || exists.idSeccion || 'N/A'}`, 'error');
                        return;
                    }
                } catch (err) {
                    console.error('Error comprobando estudiantes existentes', err);
                }
            }

            // Petición POST /entrevistas/programar para agendar la entrevista del aspirante.
            await API.post('/entrevistas/programar', {
                idAspirante: selectedAspirante.idAspirante,
                fechaEntrevista: formData.fechaEntrevista,
                entrevistador: formData.entrevistador
            });
            mostrarMensaje('Entrevista programada correctamente', 'success');
            setShowModal(false);
            setSelectedAspirante(null);
            setFormData({ fechaEntrevista: '', entrevistador: '' });
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al programar entrevista', 'error');
        }
    };

    // Registra el resultado aprobado de la entrevista y convierte al aspirante en estudiante.
    const handleAceptar = async () => {
        if (!selectedEntrevista) return;
        if (!resultadoData.observaciones.trim()) {
            mostrarMensaje('Ingrese las observaciones de la entrevista', 'error');
            return;
        }
        const idAspirante = selectedEntrevista.idAspirante || selectedEntrevista.id;
        const clase = clasesDisponibles.find(c => c.idClase === parseInt(claseSeleccionada)) || clasesDisponibles[0];
        if (!clase) {
            mostrarMensaje('No hay clases con cupo disponible para la especialidad del aspirante', 'error');
            return;
        }

        try {
            // 1º Aprobar la solicitud del aspirante asignándole la clase (PUT /aspirantes/aprobar/{id}).
            // La matrícula formal (creación del estudiante) la realiza Registro Académico en "Matrículas".
            await API.put(`/aspirantes/aprobar/${idAspirante}`, {
                idClaseAsignada: clase.idClase,
                aprobadoPor: 'Direccion'
            });

            // 2º Registrar el resultado de la entrevista (POST /entrevistas/registrar-resultado).
            await API.post('/entrevistas/registrar-resultado', {
                idAspirante,
                aprobado: true,
                observaciones: resultadoData.observaciones,
                motivoRechazo: null
            });

            mostrarMensaje('Aspirante aprobado. La matrícula la realizará Registro Académico', 'success');
            setShowResultadoModal(false);
            setSelectedEntrevista(null);
            setClasesDisponibles([]);
            setClaseSeleccionada('');
            setResultadoData({ aprobado: true, observaciones: '', motivoRechazo: '' });
            cargarDatos();
        } catch (error) {
            console.error('Error aprobando aspirante:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al aprobar', 'error');
        }
    };

    // Registra el resultado de rechazo de la entrevista y rechaza al aspirante.
    const handleRechazar = async () => {
        if (!selectedEntrevista) return;
        if (!resultadoData.motivoRechazo.trim()) {
            mostrarMensaje('Ingrese el motivo del rechazo', 'error');
            return;
        }

        try {
            // Petición POST /entrevistas/registrar-resultado para guardar el rechazo.
            await API.post('/entrevistas/registrar-resultado', {
                idAspirante: selectedEntrevista.idAspirante || selectedEntrevista.id,
                aprobado: false,
                observaciones: resultadoData.observaciones,
                motivoRechazo: resultadoData.motivoRechazo
            });

            // Rechazar al aspirante
            // Petición PUT /aspirantes/rechazar/{id} para marcar la solicitud como rechazada.
            await API.put(`/aspirantes/rechazar/${selectedEntrevista.idAspirante || selectedEntrevista.id}`, {
                rechazadoPor: 'Direccion',
                motivo: resultadoData.motivoRechazo
            });

            mostrarMensaje('Aspirante rechazado', 'success');
            setShowResultadoModal(false);
            setSelectedEntrevista(null);
            setClasesDisponibles([]);
            setClaseSeleccionada('');
            setResultadoData({ aprobado: true, observaciones: '', motivoRechazo: '' });
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al rechazar', 'error');
        }
    };

    // Abre el modal de resultado, carga la entrevista seleccionada y las clases disponibles del aspirante.
    const abrirResultadoModal = async (entrevista) => {
        setSelectedEntrevista(entrevista);
        setResultadoData({
            aprobado: true,
            observaciones: '',
            motivoRechazo: ''
        });
        setClasesDisponibles([]);
        setClaseSeleccionada('');
        setShowResultadoModal(true);

        const idAspirante = entrevista.idAspirante || entrevista.id;
        try {
            // Petición GET /aspirantes/{id} para conocer la especialidad y nota del aspirante.
            const [aspRes, clasesRes] = await Promise.all([
                API.get(`/aspirantes/${idAspirante}`),
                API.get('/clases')
            ]);
            const aspirante = aspRes.data || {};
            const anio = new Date().getFullYear();
            // Clases activas de la especialidad del aspirante, del año actual y con cupo.
            const disponibles = (clasesRes.data || []).filter(c =>
                c.idEspecialidad === aspirante.especialidadAspira
                && c.estado
                && (c.anioLectivo === anio || c.anioLectivoActual === anio)
                && (c.cupoActual ?? 0) < (c.cupoMaximo ?? 0)
            );
            setClasesDisponibles(disponibles);
            if (disponibles.length > 0) setClaseSeleccionada(disponibles[0].idClase);
        } catch (error) {
            console.error('Error cargando clases del aspirante:', error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Entrevistas">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Entrevistas - Direccion">
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

            {/* Aspirantes Pendientes */}
            <div className="card">
                <h3>Aspirantes Pendientes de Entrevista</h3>
                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombres</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Apellidos</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Correo</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Telefono</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aspirantesPendientes.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay aspirantes pendientes
                                    </td>
                                </tr>
                            ) : (
                                aspirantesPendientes.map(a => (
                                    <tr key={a.idAspirante} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{a.idAspirante}</td>
                                        <td style={{ padding: '8px' }}><strong>{a.nombres}</strong></td>
                                        <td style={{ padding: '8px' }}>{a.apellidos}</td>
                                        <td style={{ padding: '8px' }}>{getEspecialidadNombre(a.especialidadAspira)}</td>
                                        <td style={{ padding: '8px' }}>{a.correo || '-'}</td>
                                        <td style={{ padding: '8px' }}>{a.telefono || '-'}</td>
                                        <td style={{ padding: '8px' }}>
                                            <button
                                                className="btn-primary"
                                                onClick={() => {
                                                    setSelectedAspirante(a);
                                                    setShowModal(true);
                                                }}
                                                style={{ padding: '6px 14px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Programar Entrevista
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Entrevistas Programadas */}
            <div className="card">
                <h3>Entrevistas Programadas</h3>
                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Aspirante</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Entrevistador</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Observaciones</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entrevistasProgramadas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay entrevistas programadas
                                    </td>
                                </tr>
                            ) : (
                                entrevistasProgramadas.map(e => (
                                    <tr key={e.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}><strong>{e.aspirante}</strong></td>
                                        <td style={{ padding: '8px' }}>{new Date(e.fechaEntrevista).toLocaleString()}</td>
                                        <td style={{ padding: '8px' }}>{e.entrevistador || 'Pendiente'}</td>
                                        <td style={{ padding: '8px' }}>{e.observaciones || '-'}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: e.estado === 'En Espera' || e.estado === 'Programada' ? '#3b82f6' :
                                                    e.estado === 'Aprobado' ? '#16a34a' : '#dc2626',
                                                color: '#fff'
                                            }}>
                                                {e.estado === 'En Espera' ? 'Programada' : (e.estado || 'Programada')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {e.estado !== 'Aprobado' && e.estado !== 'Rechazado' && (
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => abrirResultadoModal(e)}
                                                    style={{ padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Registrar Resultado
                                                </button>
                                            )}
                                            {e.estado === 'Aprobado' && (
                                                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Aprobado</span>
                                            )}
                                            {e.estado === 'Rechazado' && (
                                                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Rechazado</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Programar Entrevista */}
            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '450px', width: '100%', padding: '24px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Programar Entrevista</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Aspirante:</strong> {selectedAspirante?.nombres} {selectedAspirante?.apellidos}</p>
                            <p><strong>Correo:</strong> {selectedAspirante?.correo || 'No registrado'}</p>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha y Hora *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.fechaEntrevista}
                                    onChange={(e) => setFormData({ ...formData, fechaEntrevista: e.target.value })}
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Entrevistador *</label>
                                <select
                                    value={formData.entrevistador}
                                    onChange={(e) => setFormData({ ...formData, entrevistador: e.target.value })}
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                >
                                    <option value="">Seleccionar entrevistador</option>
                                    {entrevistadores.map(doc => {
                                        const id = doc.idDocente || doc.IdDocente || doc.id || doc.Id;
                                        const nombre = (doc.nombres || doc.Nombres || doc.nombre || doc.nombreCompleto) + ' ' + (doc.apellidos || doc.Apellidos || '');
                                        return (<option key={id} value={nombre}>{nombre}</option>);
                                    })}
                                </select>
                            </div>
                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button className="btn-cancel" onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button className="btn-primary" onClick={handleProgramar} style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Programar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Registrar Resultado */}
            {showResultadoModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '450px', width: '100%', padding: '24px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Registrar Resultado de Entrevista</h3>
                            <button className="modal-close" onClick={() => setShowResultadoModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Aspirante:</strong> {selectedEntrevista?.aspirante}</p>
                            <p><strong>Fecha Entrevista:</strong> {selectedEntrevista?.fechaEntrevista ? new Date(selectedEntrevista.fechaEntrevista).toLocaleString() : '-'}</p>

                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Resultado *</label>
                                <select
                                    value={resultadoData.aprobado}
                                    onChange={(e) => setResultadoData({ ...resultadoData, aprobado: e.target.value === 'true' })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                >
                                    <option value="true">Aprobado</option>
                                    <option value="false">Rechazado</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Observaciones *</label>
                                <textarea
                                    value={resultadoData.observaciones}
                                    onChange={(e) => setResultadoData({ ...resultadoData, observaciones: e.target.value })}
                                    rows="3"
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    placeholder="Observaciones de la entrevista..."
                                />
                            </div>

                            {resultadoData.aprobado && (
                                <div className="form-group" style={{ marginTop: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Clase a Asignar *</label>
                                    <select
                                        value={claseSeleccionada}
                                        onChange={(e) => setClaseSeleccionada(e.target.value)}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    >
                                        <option value="">Seleccionar clase</option>
                                        {clasesDisponibles.map(c => (
                                            <option key={c.idClase} value={c.idClase}>
                                                {c.nombreClase} ({c.seccion}) - Cupo {c.cupoActual}/{c.cupoMaximo}
                                            </option>
                                        ))}
                                    </select>
                                    {clasesDisponibles.length === 0 && (
                                        <small style={{ color: '#dc2626' }}>No hay clases con cupo disponible para la especialidad del aspirante</small>
                                    )}
                                </div>
                            )}

                            {!resultadoData.aprobado && (
                                <div className="form-group" style={{ marginTop: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Motivo del Rechazo *</label>
                                    <textarea
                                        value={resultadoData.motivoRechazo}
                                        onChange={(e) => setResultadoData({ ...resultadoData, motivoRechazo: e.target.value })}
                                        rows="3"
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        placeholder="Ingrese el motivo del rechazo..."
                                        required
                                    />
                                </div>
                            )}

                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button className="btn-cancel" onClick={() => setShowResultadoModal(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                {resultadoData.aprobado ? (
                                    <button className="btn-success" onClick={handleAceptar} style={{ padding: '8px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Aceptar</button>
                                ) : (
                                    <button className="btn-danger" onClick={handleRechazar} style={{ padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Rechazar</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionEntrevistas;