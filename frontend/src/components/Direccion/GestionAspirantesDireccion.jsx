// Componente Gestión de Aspirantes (Dirección): evalúa notas, aprueba, rechaza o pone en espera aspirantes.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra el proceso de admisión de aspirantes con sus documentos.
const GestionAspirantesDireccion = () => {
    // Estados: aspirantes, clases, modales de gestión, formulario, filtros y mensajes.
    const [aspirantes, setAspirantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showModalNota, setShowModalNota] = useState(false);
    const [showModalAprobar, setShowModalAprobar] = useState(false);
    const [showModalRechazo, setShowModalRechazo] = useState(false);
    const [showModalEspera, setShowModalEspera] = useState(false);
    const [showModalDocumentos, setShowModalDocumentos] = useState(false);
    const [selectedAspirante, setSelectedAspirante] = useState(null);
    const [errorAprobar, setErrorAprobar] = useState('');
    const [documentosData, setDocumentosData] = useState(null);
    const [filterEstado, setFilterEstado] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        notaExamen: '',
        especialidadId: '',
        seccion: 'A',
        idClaseAsignada: '',
        motivo: '',
        observacion: ''
    });

    // Carga los aspirantes y las clases al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene en paralelo los aspirantes y las clases desde la API.
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [aspirantesRes, clasesRes, especialidadesRes] = await Promise.all([
                // Petición GET /aspirantes para listar las solicitudes de ingreso.
                API.get('/aspirantes'),
                // Petición GET /clases para verificar cupos disponibles.
                API.get('/clases'),
                // Petición GET /clases/especialidades para el catálogo real de especialidades.
                API.get('/clases/especialidades')
            ]);
            setAspirantes(aspirantesRes.data || []);
            setClases(clasesRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helpers tolerantes a distintos shapes de la API
    // Devuelve el id de especialidad de una clase tolerando distintos nombres de campo.
    const getClaseEspecialidadId = (c) => {
        return c.idEspecialidad ?? c.id_especialidad ?? c.especialidadId ?? c.idEspecialidadFk ?? 0;
    };

    // Calcula el cupo disponible de una clase a partir de su cupo máximo y actual.
    const getClaseDisponible = (c) => {
        const max = c.cupoMaximo ?? c.cupo_maximo ?? c.CupoMaximo ?? c.cupoMax ?? 0;
        const actual = c.cupoActual ?? c.cupo_actual ?? c.CupoActual ?? c.cupo ?? 0;
        const disponible = Number(max) - Number(actual);
        return isNaN(disponible) ? 0 : disponible;
    };

    // Reabre un aspirante rechazado o en espera, regresándolo a estado Pendiente.
    const handleReabrir = async (aspirante) => {
        if (!aspirante) return;
        try {
            // optimista: actualizar UI inmediatamente
            setAspirantes(prev => prev.map(a => a.idAspirante === aspirante.idAspirante ? { ...a, estadoSolicitud: 'Pendiente' } : a));
            // llamar endpoint de actualización general
            // Petición PUT /aspirantes/{id} para actualizar el estado de la solicitud.
            await API.put(`/aspirantes/${aspirante.idAspirante}`, { estadoSolicitud: 'Pendiente' });
            mostrarMensaje('Aspirante reabierto a Pendiente', 'success');
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al reabrir aspirante', 'error');
            // revertir: recargar datos para consistencia
            cargarDatos();
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
        return esp ? esp.nombreEspecialidad : 'Bachillerato General';
    };

    // Devuelve el color que identifica el estado de la solicitud del aspirante.
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Aprobado': return '#16a34a';
            case 'Rechazado': return '#dc2626';
            case 'En Espera': return '#e67e22';
            default: return '#3b82f6';
        }
    };

    // Consulta los documentos del aspirante y abre el modal para visualizarlos.
    const verDocumentos = async (aspirante) => {
        try {
            // Petición GET /aspirantes/{id}/documentos para obtener los archivos adjuntos.
            const response = await API.get(`/aspirantes/${aspirante.idAspirante}/documentos`);
            setDocumentosData(response.data);
            setSelectedAspirante(aspirante);
            setShowModalDocumentos(true);
        } catch (error) {
            mostrarMensaje('Error al cargar documentos', 'error');
        }
    };

    // Valida y registra la nota de examen del aspirante seleccionado.
    const handleRegistrarNota = async () => {
        if (!selectedAspirante) return;
        if (!formData.notaExamen || parseFloat(formData.notaExamen) < 0 || parseFloat(formData.notaExamen) > 10) {
            mostrarMensaje('Ingrese una nota valida entre 0 y 10', 'error');
            return;
        }
        try {
            // Petición POST /aspirantes/sp_registrar_nota_examen para guardar la nota de examen.
            await API.post('/aspirantes/sp_registrar_nota_examen', {
                p_id_aspirante: selectedAspirante.idAspirante,
                p_nota_examen: parseFloat(formData.notaExamen)
            });
            mostrarMensaje('Nota registrada correctamente', 'success');
            setShowModalNota(false);
            // actualizar estado localmente para reflejar la nota sin recargar
            setAspirantes(prev => prev.map(a => a.idAspirante === selectedAspirante.idAspirante ? { ...a, notaExamen: parseFloat(formData.notaExamen) } : a));
            setSelectedAspirante(null);
            setFormData({ ...formData, notaExamen: '' });
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al registrar nota', 'error');
        }
    };

    // Valida cupo y nota mínima, y aprueba al aspirante en la clase seleccionada (fuente de verdad).
    const handleAprobar = async () => {
        if (!selectedAspirante) return;
        if (!formData.idClaseAsignada) {
            mostrarMensaje('Seleccione una clase con cupo disponible', 'error');
            return;
        }

        const claseSeleccionada = clases.find(c => {
            const id = c.idClase ?? c.IdClase ?? c.id;
            return Number(id) === Number(formData.idClaseAsignada);
        });
        if (!claseSeleccionada) {
            mostrarMensaje('La clase seleccionada no existe', 'error');
            return;
        }
        if (getClaseDisponible(claseSeleccionada) <= 0) {
            mostrarMensaje('La clase seleccionada no tiene cupo disponible', 'error');
            return;
        }

        const nota = parseFloat(selectedAspirante.notaExamen || 0);
        if (nota < 6) {
            mostrarMensaje('La nota minima para aprobar es 6', 'error');
            return;
        }

        try {
            // Petición PUT /aspirantes/aprobar/{id}: aprueba la solicitud y asigna la clase.
            // La matrícula formal (creación del estudiante) la realiza Registro Académico en "Matrículas".
            await API.put(`/aspirantes/aprobar/${selectedAspirante.idAspirante}`, {
                idClaseAsignada: Number(formData.idClaseAsignada),
                aprobadoPor: 'Direccion'
            });
            mostrarMensaje('Aspirante aprobado. La matrícula la realizará Registro Académico', 'success');
            setShowModalAprobar(false);
            // actualizar estado localmente: marcar aprobado
            setAspirantes(prev => prev.map(a => a.idAspirante === selectedAspirante.idAspirante ? { ...a, estadoSolicitud: 'Aprobado', idClaseAsignada: Number(formData.idClaseAsignada) } : a));
            setSelectedAspirante(null);
            setFormData({ ...formData, especialidadId: '', seccion: 'A', idClaseAsignada: '' });
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al aprobar', 'error');
        }
    };

    // Valida el motivo y rechaza la solicitud del aspirante.
    const handleRechazar = async () => {
        if (!selectedAspirante) return;
        if (!formData.motivo.trim()) {
            mostrarMensaje('Ingrese un motivo de rechazo', 'error');
            return;
        }
        try {
            // Petición PUT /aspirantes/rechazar/{id} para rechazar la solicitud con su motivo.
            await API.put(`/aspirantes/rechazar/${selectedAspirante.idAspirante}`, {
                rechazadoPor: 'Direccion',
                motivo: formData.motivo
            });
            mostrarMensaje('Aspirante rechazado correctamente', 'success');
            setShowModalRechazo(false);
            // actualizar estado localmente
            setAspirantes(prev => prev.map(a => a.idAspirante === selectedAspirante.idAspirante ? { ...a, estadoSolicitud: 'Rechazado' } : a));
            setSelectedAspirante(null);
            setFormData({ ...formData, motivo: '' });
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al rechazar', 'error');
        }
    };

    // Coloca al aspirante en lista de espera con la observación indicada.
    const handleEspera = async () => {
        if (!selectedAspirante) return;
        if (!formData.observacion.trim()) {
            mostrarMensaje('Ingrese una observacion', 'error');
            return;
        }
        try {
            // Petición PUT /aspirantes/espera/{id} para poner la solicitud en lista de espera.
            await API.put(`/aspirantes/espera/${selectedAspirante.idAspirante}`, {
                entrevistadoPor: 'Direccion',
                observacion: formData.observacion
            });
            mostrarMensaje('Aspirante en lista de espera', 'success');
            setShowModalEspera(false);
            // actualizar estado localmente
            setAspirantes(prev => prev.map(a => a.idAspirante === selectedAspirante.idAspirante ? { ...a, estadoSolicitud: 'En Espera' } : a));
            setSelectedAspirante(null);
            setFormData({ ...formData, observacion: '' });
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al poner en espera', 'error');
        }
    };

    // Filtra los aspirantes por estado y por término de búsqueda.
    const aspirantesFiltrados = aspirantes.filter(a => {
        if (filterEstado !== 'todos' && a.estadoSolicitud !== filterEstado) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (a.nombres?.toLowerCase().includes(term) ||
                a.apellidos?.toLowerCase().includes(term) ||
                a.nie?.toLowerCase().includes(term) ||
                a.correo?.toLowerCase().includes(term));
        }
        return true;
    });

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Aspirantes">
                <div className="loading">Cargando datos...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Aspirantes - Direccion">
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

            <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="filters-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, NIE, correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ flex: 2, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '200px' }}
                    />
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="filter-select"
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="Pendiente">Pendientes</option>
                        <option value="Aprobado">Aprobados</option>
                        <option value="Rechazado">Rechazados</option>
                        <option value="En Espera">En Espera</option>
                    </select>
                </div>
            </div>

            <div className="card">
                <h3>Lista de Aspirantes</h3>
                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombres</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Apellidos</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>NIE</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nota</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Documentos</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aspirantesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay aspirantes registrados
                                    </td>
                                </tr>
                            ) : (
                                aspirantesFiltrados.map((a) => (
                                    <tr key={a.idAspirante} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{a.idAspirante}</td>
                                        <td style={{ padding: '8px' }}><strong>{a.nombres}</strong></td>
                                        <td style={{ padding: '8px' }}>{a.apellidos}</td>
                                        <td style={{ padding: '8px' }}>{a.nie || '-'}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '10px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: a.notaExamen ? '#dcfce7' : '#fee2e2',
                                                color: a.notaExamen ? '#15803d' : '#b91c1c'
                                            }}>
                                                {a.notaExamen || 'Pendiente'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {getEspecialidadNombre(a.especialidadAspira)}
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getEstadoColor(a.estadoSolicitud),
                                                color: '#fff'
                                            }}>
                                                {a.estadoSolicitud || 'Pendiente'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <button
                                                onClick={() => verDocumentos(a)}
                                                style={{
                                                    padding: '4px 10px',
                                                    background: '#8b5cf6',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Ver Archivos
                                            </button>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                {a.estadoSolicitud === 'Pendiente' && !a.notaExamen && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAspirante(a);
                                                            setShowModalNota(true);
                                                        }}
                                                        style={{
                                                            padding: '6px 14px',
                                                            background: '#3b82f6',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        Nota
                                                    </button>
                                                )}

                                                {a.estadoSolicitud === 'Pendiente' && a.notaExamen && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAspirante(a);
                                                            setErrorAprobar('');
                                                            // Preselecciona la especialidad que el aspirante eligió al preinscribirse.
                                                            // (0 = Bachillerato General, sin especialidad técnica)
                                                            const espInicial = a.especialidadAspira ? String(a.especialidadAspira) : '0';
                                                            setFormData({ ...formData, especialidadId: espInicial, seccion: 'A', idClaseAsignada: '' });
                                                            setShowModalAprobar(true);
                                                        }}
                                                        style={{
                                                            padding: '6px 14px',
                                                            background: '#16a34a',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        Aceptar
                                                    </button>
                                                )}

                                                {a.estadoSolicitud === 'Pendiente' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAspirante(a);
                                                            setShowModalRechazo(true);
                                                        }}
                                                        style={{
                                                            padding: '6px 14px',
                                                            background: '#dc2626',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        Rechazar
                                                    </button>
                                                )}

                                                {a.estadoSolicitud === 'Pendiente' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAspirante(a);
                                                            setShowModalEspera(true);
                                                        }}
                                                        style={{
                                                            padding: '6px 14px',
                                                            background: '#e67e22',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        Espera
                                                    </button>
                                                )}

                                                {a.estadoSolicitud === 'Aprobado' && (
                                                    <span style={{ padding: '6px 14px', background: '#dcfce7', color: '#15803d', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                                                        Aprobado
                                                    </span>
                                                )}
                                                {a.estadoSolicitud === 'Rechazado' && (
                                                    <>
                                                        <span style={{ padding: '6px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                                                            Rechazado
                                                        </span>
                                                        <button onClick={() => handleReabrir(a)} style={{ marginLeft: '6px', padding: '6px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Reabrir</button>
                                                    </>
                                                )}
                                                {a.estadoSolicitud === 'En Espera' && (
                                                    <>
                                                        <span style={{ padding: '6px 14px', background: '#fef3c7', color: '#b45309', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                                                            En Espera
                                                        </span>
                                                        <button onClick={() => handleReabrir(a)} style={{ marginLeft: '6px', padding: '6px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Reabrir</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModalDocumentos && documentosData && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '550px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Documentos del Aspirante</h3>
                            <button className="modal-close" onClick={() => setShowModalDocumentos(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Nombre:</strong> {documentosData.nombres} {documentosData.apellidos}</p>
                            <p><strong>Correo:</strong> {documentosData.correo || 'No registrado'}</p>
                            <p><strong>Telefono:</strong> {documentosData.telefono || 'No registrado'}</p>
                            <p><strong>Promedio Anterior:</strong> {documentosData.promedioAnterior || 'No registrado'}</p>

                            <hr style={{ margin: '16px 0' }} />

                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Fotografia:</label>
                                {documentosData.fotoUrl ? (
                                    <div>
                                        <img
                                            src={documentosData.fotoUrl}
                                            alt="Foto del aspirante"
                                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<p style={{ color: "#dc2626" }}>No se pudo cargar la imagen</p>';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <p style={{ color: '#999' }}>No hay foto disponible</p>
                                )}
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Documento PDF:</label>
                                {documentosData.pdfUrl ? (
                                    <div>
                                        <a
                                            href={documentosData.pdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-block',
                                                padding: '8px 16px',
                                                background: '#dc2626',
                                                color: '#fff',
                                                textDecoration: 'none',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            Ver PDF
                                        </a>
                                    </div>
                                ) : (
                                    <p style={{ color: '#999' }}>No hay documento PDF disponible</p>
                                )}
                            </div>
                        </div>
                        <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                            <button className="btn-cancel" onClick={() => setShowModalDocumentos(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {showModalNota && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '450px', width: '100%', padding: '24px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Registrar Nota de Examen</h3>
                            <button className="modal-close" onClick={() => setShowModalNota(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Aspirante:</strong> {selectedAspirante?.nombres} {selectedAspirante?.apellidos}</p>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nota (0-10) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    value={formData.notaExamen}
                                    onChange={(e) => setFormData({ ...formData, notaExamen: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button className="btn-cancel" onClick={() => setShowModalNota(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button className="btn-primary" onClick={handleRegistrarNota} style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Guardar Nota</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModalAprobar && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '24px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Aprobar Aspirante</h3>
                            <button className="modal-close" onClick={() => setShowModalAprobar(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Aspirante:</strong> {selectedAspirante?.nombres} {selectedAspirante?.apellidos}</p>
                            <p><strong>Nota Examen:</strong> {selectedAspirante?.notaExamen}</p>
                            <p style={{ color: '#e67e22', fontSize: '14px' }}>Nota minima para aprobar: 6</p>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Especialidad *</label>
                                <select
                                    value={formData.especialidadId}
                                    onChange={(e) => {
                                        setFormData({ ...formData, especialidadId: e.target.value, idClaseAsignada: '' });
                                    }}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    required
                                >
                                    <option value="">Seleccionar Especialidad</option>
                                    {especialidades.map((e) => (
                                        <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                            {e.nombreEspecialidad}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Clase *</label>
                                <select
                                    value={formData.idClaseAsignada}
                                    onChange={(e) => setFormData({ ...formData, idClaseAsignada: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    required
                                >
                                    <option value="">Seleccionar Clase</option>
                                    {clases
                                        .filter(c => {
                                            if (!formData.especialidadId) return true;
                                            return Number(getClaseEspecialidadId(c)) === parseInt(formData.especialidadId);
                                        })
                                        .map((c) => {
                                            const disponible = getClaseDisponible(c);
                                            const sinCupo = disponible <= 0;
                                            const id = c.idClase ?? c.IdClase ?? c.id ?? '';
                                            const label = c.nombreClase || c.nombre || c.NombreClase || `Clase ${id}`;
                                            return (
                                                <option key={id} value={id} disabled={sinCupo}>
                                                    {label} - {disponible > 0 ? `${disponible} cupo${disponible !== 1 ? 's' : ''} disponible` : 'SIN CUPO'}
                                                </option>
                                            );
                                        })}
                                </select>
                                {formData.especialidadId && clases.filter(c => {
                                    const match = !formData.especialidadId || Number(getClaseEspecialidadId(c)) === parseInt(formData.especialidadId);
                                    return match && getClaseDisponible(c) > 0;
                                }).length === 0 && (
                                    <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '6px' }}>
                                        No hay clases disponibles con cupo para esta especialidad
                                    </p>
                                )}
                            </div>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Seccion</label>
                                {formData.idClaseAsignada ? (() => {
                                    const claseSel = clases.find(c => {
                                        const id = c.idClase ?? c.IdClase ?? c.id;
                                        return Number(id) === Number(formData.idClaseAsignada);
                                    });
                                    return (
                                        <p style={{ margin: 0, padding: '8px', background: '#f1f5f9', borderRadius: '6px', fontWeight: '600' }}>
                                            Seccion {claseSel?.seccion || claseSel?.Seccion || 'A'} (se asigna automaticamente con la clase)
                                        </p>
                                    );
                                })() : (
                                    <p style={{ margin: 0, padding: '8px', background: '#f1f5f9', borderRadius: '6px', color: '#64748b' }}>
                                        Seleccione una clase para ver su seccion
                                    </p>
                                )}
                            </div>
                            {errorAprobar && (
                                <div style={{ marginTop: '12px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '13px' }}>
                                    <p style={{ margin: 0, fontWeight: '600' }}>{errorAprobar}</p>
                                    <button
                                        onClick={() => { setShowModalAprobar(false); setErrorAprobar(''); setShowModalRechazo(true); }}
                                        style={{
                                            marginTop: '8px', padding: '6px 14px', background: '#dc2626', color: '#fff',
                                            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                                        }}
                                    >
                                        Rechazar esta solicitud duplicada
                                    </button>
                                </div>
                            )}
                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button className="btn-cancel" onClick={() => setShowModalAprobar(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button
                                    className="btn-success"
                                    onClick={handleAprobar}
                                    disabled={!formData.idClaseAsignada}
                                    style={{
                                        padding: '8px 20px',
                                        background: formData.idClaseAsignada ? '#16a34a' : '#9ca3af',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: formData.idClaseAsignada ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    {formData.idClaseAsignada ? 'Aprobar' : 'Sin cupo disponible'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModalRechazo && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '450px', width: '100%', padding: '24px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Rechazar Aspirante</h3>
                            <button className="modal-close" onClick={() => setShowModalRechazo(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Aspirante:</strong> {selectedAspirante?.nombres} {selectedAspirante?.apellidos}</p>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Motivo del Rechazo *</label>
                                <textarea
                                    value={formData.motivo}
                                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                    className="form-control"
                                    rows="3"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    required
                                />
                            </div>
                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button className="btn-cancel" onClick={() => setShowModalRechazo(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button className="btn-danger" onClick={handleRechazar} style={{ padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Rechazar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModalEspera && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '450px', width: '100%', padding: '24px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Lista de Espera</h3>
                            <button className="modal-close" onClick={() => setShowModalEspera(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Aspirante:</strong> {selectedAspirante?.nombres} {selectedAspirante?.apellidos}</p>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Observacion *</label>
                                <textarea
                                    value={formData.observacion}
                                    onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                                    className="form-control"
                                    rows="3"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    required
                                />
                            </div>
                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button className="btn-cancel" onClick={() => setShowModalEspera(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button className="btn-warning" onClick={handleEspera} style={{ padding: '8px 20px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Poner en Espera</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionAspirantesDireccion;