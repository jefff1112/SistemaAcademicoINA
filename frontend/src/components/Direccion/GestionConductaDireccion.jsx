// Componente Gestión de Conducta (Dirección): registra, consulta y anula faltas de estudiantes,
// y permite cambiar manualmente la calificación oficial de conducta por periodo (con auditoría).
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Calificaciones oficiales disponibles (enum de la tabla conducta_periodos).
const CALIFICACIONES = ['Excelente', 'Muy Bueno', 'Bueno', 'Suficiente', 'Necesita Mejorar'];

// Componente principal: administra el historial de conducta de cada estudiante por clase y periodo.
const GestionConductaDireccion = () => {
    // Estados: filtros (clase, periodo, estudiante), conducta, resumen, modales y mensajes.
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [selectedClase, setSelectedClase] = useState('');
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [estudiantesClase, setEstudiantesClase] = useState([]);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [conducta, setConducta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showModalCalif, setShowModalCalif] = useState(false);
    const [savingCalif, setSavingCalif] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        idEstudiante: '',
        tipo: 'Falta',
        gravedad: 'Leve',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
    });
    const [califForm, setCalifForm] = useState({
        calificacion: '',
        observacion: ''
    });

    // Carga clases y periodos al montar el componente, seleccionando los primeros por defecto.
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [clasesRes, periodosRes] = await Promise.all([
                API.get('/clases'),
                API.get('/periodosacademicos')
            ]);
            const clasesData = clasesRes.data || [];
            const periodosData = periodosRes.data || [];
            setClases(clasesData);
            setPeriodos(periodosData);

            if (clasesData.length > 0 && periodosData.length > 0) {
                setSelectedClase(clasesData[0].idClase);
                setSelectedPeriodo(periodosData[0].idPeriodo);
                cargarConductaClase(clasesData[0].idClase, periodosData[0].idPeriodo);
            }
        } catch (error) {
            mostrarMensaje('Error al cargar clases o periodos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Carga la conducta de todos los estudiantes de la clase en el periodo seleccionado.
    const cargarConductaClase = async (idClase, idPeriodo) => {
        try {
            const response = await API.get(`/conducta/clase/${idClase}/periodo/${idPeriodo}`);
            const data = response.data || [];
            setEstudiantesClase(data);
            setSelectedEstudiante(null);
            setConducta([]);
            setResumen(null);
        } catch (error) {
            mostrarMensaje('Error al cargar conducta de la clase', 'error');
        }
    };

    // Carga el historial de faltas y el detalle del estudiante elegido en el periodo.
    const cargarConductaEstudiante = async (idEstudiante, idPeriodo) => {
        try {
            const response = await API.get(`/conducta/estudiante/${idEstudiante}/periodo/${idPeriodo}`);
            const data = response.data || {};
            setConducta(data.conducta || []);
            setResumen({
                totalPuntos: data.totalPuntos || 0,
                calificacion: data.calificacion || 'Sin calificar',
                registroPeriodo: data.registroPeriodo || null
            });
        } catch (error) {
            mostrarMensaje('Error al cargar conducta del estudiante', 'error');
        }
    };

    // Maneja el cambio de clase o periodo y recarga la lista de estudiantes.
    const handleChangeClase = (e) => {
        const id = e.target.value;
        setSelectedClase(id);
        if (id && selectedPeriodo) {
            cargarConductaClase(id, selectedPeriodo);
        }
    };

    const handleChangePeriodo = (e) => {
        const id = e.target.value;
        setSelectedPeriodo(id);
        if (id && selectedClase) {
            cargarConductaClase(selectedClase, id);
        }
    };

    // Maneja la selección de estudiante y carga su historial de conducta.
    const handleSelectEstudiante = (e) => {
        const id = e.target.value;
        setSelectedEstudiante(id);
        if (id) {
            cargarConductaEstudiante(id, selectedPeriodo);
        } else {
            setConducta([]);
            setResumen(null);
        }
    };

    // Registra una falta de conducta para el estudiante seleccionado.
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/conducta', {
                ...formData,
                idEstudiante: parseInt(formData.idEstudiante),
                idPeriodo: parseInt(selectedPeriodo)
            });
            mostrarMensaje('Falta registrada correctamente', 'success');
            setShowModal(false);
            if (selectedEstudiante) {
                await cargarConductaClase(selectedClase, selectedPeriodo);
                setSelectedEstudiante(selectedEstudiante);
                cargarConductaEstudiante(selectedEstudiante, selectedPeriodo);
            }
        } catch (error) {
            mostrarMensaje('Error al registrar falta', 'error');
        }
    };

    // Anula una falta activa tras confirmar con el usuario.
    const handleAnular = async (id) => {
        if (!window.confirm('Anular esta falta?')) return;
        try {
            await API.put(`/conducta/${id}/anular`);
            mostrarMensaje('Falta anulada correctamente', 'success');
            if (selectedEstudiante) {
                await cargarConductaClase(selectedClase, selectedPeriodo);
                setSelectedEstudiante(selectedEstudiante);
                cargarConductaEstudiante(selectedEstudiante, selectedPeriodo);
            }
        } catch (error) {
            mostrarMensaje('Error al anular', 'error');
        }
    };

    // Abre el modal de cambio de calificación con la calificación oficial actual preseleccionada.
    const abrirModalCalificacion = () => {
        if (!selectedEstudiante) {
            mostrarMensaje('Seleccione un estudiante primero', 'error');
            return;
        }
        const actual = resumen?.registroPeriodo?.calificacion || '';
        setCalifForm({ calificacion: actual || CALIFICACIONES[0], observacion: '' });
        setShowModalCalif(true);
    };

    // Guarda el cambio manual de calificación de conducta con observación y auditoría.
    const handleCambiarCalificacion = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setSavingCalif(true);
        try {
            const payload = {
                idPeriodo: parseInt(selectedPeriodo),
                calificacion: califForm.calificacion,
                observacion: califForm.observacion.trim(),
                registradoPor: user.idUsuario || null
            };
            await API.put(`/conducta/estudiante/${selectedEstudiante}/calificacion`, payload);
            mostrarMensaje('Calificación de conducta actualizada correctamente', 'success');
            setShowModalCalif(false);
            await cargarConductaClase(selectedClase, selectedPeriodo);
            setSelectedEstudiante(selectedEstudiante);
            cargarConductaEstudiante(selectedEstudiante, selectedPeriodo);
        } catch (error) {
            mostrarMensaje('Error al cambiar la calificación', 'error');
        } finally {
            setSavingCalif(false);
        }
    };

    // Muestra un mensaje temporal al usuario y lo limpia después de 4 segundos.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Devuelve el color que identifica la gravedad de la falta.
    const getGravedadColor = (gravedad) => {
        switch (gravedad) {
            case 'Leve': return '#16a34a';
            case 'Moderada': return '#e67e22';
            case 'Grave': return '#dc2626';
            case 'Muy Grave': return '#7f1d1d';
            default: return '#6b7280';
        }
    };

    // Da formato legible a la fecha/hora del registro.
    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-SV', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Conducta">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Conducta - Direccion">
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
                <h3>Filtros de Consulta</h3>
                <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Clase *</label>
                        <select value={selectedClase} onChange={handleChangeClase} className="form-control">
                            <option value="">Seleccionar Clase</option>
                            {clases.map(c => (
                                <option key={c.idClase} value={c.idClase}>
                                    {c.nombreClase} - {c.anioLectivo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Periodo *</label>
                        <select value={selectedPeriodo} onChange={handleChangePeriodo} className="form-control">
                            <option value="">Seleccionar Periodo</option>
                            {periodos.map(p => (
                                <option key={p.idPeriodo} value={p.idPeriodo}>
                                    {p.nombre} - {p.anioLectivo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                        <label>Estudiante *</label>
                        <select value={selectedEstudiante || ''} onChange={handleSelectEstudiante} className="form-control">
                            <option value="">Seleccionar Estudiante</option>
                            {estudiantesClase.map(e => (
                                <option key={e.idEstudiante} value={e.idEstudiante}>
                                    {e.apellidos}, {e.nombres} ({e.codigoEstudiante})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {estudiantesClase.length > 0 && (
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 0 }}>
                            <button className="btn-primary" onClick={() => {
                                if (selectedEstudiante) {
                                    setFormData({ ...formData, idEstudiante: selectedEstudiante });
                                    setShowModal(true);
                                } else {
                                    mostrarMensaje('Seleccione un estudiante primero', 'error');
                                }
                            }}>
                                + Registrar Falta
                            </button>
                        </div>
                        {selectedEstudiante && (
                            <div className="form-group" style={{ flex: 0 }}>
                                <button className="btn-primary" onClick={abrirModalCalificacion}>
                                    Cambiar Calificacion
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {resumen && (
                <div className="card">
                    <h3>Resumen de Conducta</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{resumen.totalPuntos}</div>
                            <div className="stat-label">Puntos de Demerito</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{
                                color: resumen.registroPeriodo ? '#1d4ed8' : '#6b7280'
                            }}>
                                {resumen.registroPeriodo?.calificacion || 'Sin asignar'}
                            </div>
                            <div className="stat-label">Calificacion Oficial</div>
                        </div>
                    </div>
                    {resumen.registroPeriodo && (
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: '#eff6ff',
                            borderRadius: '8px',
                            fontSize: '14px',
                            lineHeight: '1.5'
                        }}>
                            <strong>Cambiada el:</strong> {formatearFecha(resumen.registroPeriodo.fechaCambio)}<br />
                            <strong>Observacion:</strong> {resumen.registroPeriodo.observacion || '-'}
                        </div>
                    )}
                </div>
            )}

            {conducta.length > 0 && (
                <div className="card">
                    <h3>Historial de Faltas</h3>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Gravedad</th>
                                    <th>Descripcion</th>
                                    <th>Puntos</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conducta.map((c) => (
                                    <tr key={c.idFaltas}>
                                        <td>{new Date(c.fecha).toLocaleDateString()}</td>
                                        <td>{c.tipo}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getGravedadColor(c.gravedad),
                                                color: '#fff'
                                            }}>
                                                {c.gravedad}
                                            </span>
                                        </td>
                                        <td>{c.descripcion || '-'}</td>
                                        <td>{c.puntosDemerito}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: c.estado === 'Activa' ? '#dcfce7' : '#fee2e2',
                                                color: c.estado === 'Activa' ? '#15803d' : '#b91c1c'
                                            }}>
                                                {c.estado}
                                            </span>
                                        </td>
                                        <td>
                                            {c.estado === 'Activa' && (
                                                <button className="btn-danger" onClick={() => handleAnular(c.idFaltas)}>
                                                    Anular
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!selectedEstudiante && (
                <div className="card">
                    <p style={{ color: '#6b7280' }}>Seleccione una clase, periodo y estudiante para ver su conducta.</p>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>Registrar Falta</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tipo *</label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    required
                                    className="form-control"
                                >
                                    <option value="Falta">Falta</option>
                                    <option value="Amonestacion">Amonestacion</option>
                                    <option value="Demerito">Demerito</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Gravedad *</label>
                                <select
                                    value={formData.gravedad}
                                    onChange={(e) => setFormData({ ...formData, gravedad: e.target.value })}
                                    required
                                    className="form-control"
                                >
                                    <option value="Leve">Leve</option>
                                    <option value="Moderada">Moderada</option>
                                    <option value="Grave">Grave</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Descripcion *</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    required
                                    rows="3"
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    className="form-control"
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showModalCalif && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '520px' }}>
                        <div className="modal-header">
                            <h3>Cambiar Calificacion de Conducta</h3>
                            <button className="modal-close" onClick={() => setShowModalCalif(false)}>X</button>
                        </div>
                        <form onSubmit={handleCambiarCalificacion}>
                            {resumen?.registroPeriodo && (
                                <div style={{
                                    marginBottom: '1rem',
                                    padding: '0.6rem 0.9rem',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '8px',
                                    fontSize: '13px'
                                }}>
                                    Calificacion actual: <strong>{resumen.registroPeriodo.calificacion}</strong>
                                    {' '}(cambiada el {formatearFecha(resumen.registroPeriodo.fechaCambio)})
                                </div>
                            )}
                            <div className="form-group">
                                <label>Nueva Calificacion *</label>
                                <select
                                    value={califForm.calificacion}
                                    onChange={(e) => setCalifForm({ ...califForm, calificacion: e.target.value })}
                                    required
                                    className="form-control"
                                >
                                    {CALIFICACIONES.map(op => (
                                        <option key={op} value={op}>{op}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Observacion (motivo del cambio) *</label>
                                <textarea
                                    value={califForm.observacion}
                                    onChange={(e) => setCalifForm({ ...califForm, observacion: e.target.value })}
                                    required
                                    rows="3"
                                    className="form-control"
                                    placeholder="Explique el motivo por el cual se cambia la calificacion"
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="button" className="btn-cancel" onClick={() => setShowModalCalif(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={savingCalif}>
                                    {savingCalif ? 'Guardando...' : 'Guardar Cambio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionConductaDireccion;