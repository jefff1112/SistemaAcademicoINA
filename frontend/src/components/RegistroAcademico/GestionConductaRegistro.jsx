// Componente Gestión de Conducta (Registro Académico): registra faltas, consulta historial y calcula puntos de demérito por estudiante.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionConductaRegistro = () => {
    // Estado de estudiantes, faltas, selección, resumen y formulario del modal.
    const [estudiantes, setEstudiantes] = useState([]);
    const [conducta, setConducta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        idEstudiante: '',
        tipo: 'Falta',
        gravedad: 'Leve',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    // Carga la lista de estudiantes al montar el componente.
    useEffect(() => {
        cargarEstudiantes();
    }, []);

    // Obtiene los estudiantes desde la API.
    const cargarEstudiantes = async () => {
        try {
            const response = await API.get('/estudiantes');
            setEstudiantes(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar estudiantes', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Carga las faltas y el resumen de conducta del estudiante.
    const cargarConducta = async (idEstudiante) => {
        try {
            const response = await API.get(`/conducta/estudiante/${idEstudiante}`);
            setConducta(response.data?.conducta || []);
            setResumen({
                totalPuntos: response.data?.totalPuntos || 0,
                registroPeriodo: response.data?.registroPeriodo || null
            });
        } catch (error) {
            mostrarMensaje('Error al cargar conducta', 'error');
        }
    };

    // Al elegir un estudiante, carga su historial de faltas; si no hay selección, limpia la tabla.
    const handleSelectEstudiante = (e) => {
        const id = e.target.value;
        setSelectedEstudiante(id);
        if (id) {
            cargarConducta(id);
        } else {
            setConducta([]);
            setResumen(null);
        }
    };

    // Registra la falta en la API y refresca el historial del estudiante.
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/conducta', {
                ...formData,
                idEstudiante: parseInt(formData.idEstudiante)
            });
            mostrarMensaje('Falta registrada correctamente', 'success');
            setShowModal(false);
            if (selectedEstudiante) {
                cargarConducta(selectedEstudiante);
            }
        } catch (error) {
            mostrarMensaje('Error al registrar falta', 'error');
        }
    };

    // Anula una falta tras la confirmación del usuario.
    const handleAnular = async (id) => {
        if (!window.confirm('Anular esta falta?')) return;
        try {
            await API.put(`/conducta/${id}/anular`);
            mostrarMensaje('Falta anulada correctamente', 'success');
            if (selectedEstudiante) {
                cargarConducta(selectedEstudiante);
            }
        } catch (error) {
            mostrarMensaje('Error al anular', 'error');
        }
    };

    // Muestra un mensaje temporal de éxito o error.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Devuelve el color según la gravedad de la falta.
    const getGravedadColor = (gravedad) => {
        switch (gravedad) {
            case 'Leve': return '#16a34a';
            case 'Moderada': return '#e67e22';
            case 'Grave': return '#dc2626';
            case 'Muy Grave': return '#7f1d1d';
            default: return '#6b7280';
        }
    };

    // Da formato legible a la fecha/hora del cambio de calificación.
    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-SV', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <DashboardLayout title="Conducta">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Conducta - Registro Academico">
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
                <h3>Seleccionar Estudiante</h3>
                <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <select
                            value={selectedEstudiante || ''}
                            onChange={handleSelectEstudiante}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            <option value="">Seleccionar Estudiante</option>
                            {estudiantes.map(e => (
                                <option key={e.idEstudiante} value={e.idEstudiante}>
                                    {e.nombres} {e.apellidos} - {e.codigoEstudiante}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 0 }}>
                        <button className="btn-primary" onClick={() => {
                            if (selectedEstudiante) {
                                setFormData({ ...formData, idEstudiante: selectedEstudiante });
                                setShowModal(true);
                            } else {
                                mostrarMensaje('Seleccione un estudiante primero', 'error');
                            }
                        }} style={{ padding: '8px 16px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            + Registrar Falta
                        </button>
                    </div>
                </div>
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
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Tipo</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Gravedad</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Descripcion</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Puntos</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conducta.map((c) => (
                                    <tr key={c.idFaltas} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{new Date(c.fecha).toLocaleDateString()}</td>
                                        <td style={{ padding: '8px' }}>{c.tipo}</td>
                                        <td style={{ padding: '8px' }}>
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
                                        <td style={{ padding: '8px' }}>{c.descripcion || '-'}</td>
                                        <td style={{ padding: '8px' }}>{c.puntosDemerito}</td>
                                        <td style={{ padding: '8px' }}>
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
                                        <td style={{ padding: '8px' }}>
                                            {c.estado === 'Activa' && (
                                                <button className="btn-danger" onClick={() => handleAnular(c.idFaltas)} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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

            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '24px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Registrar Falta</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tipo *</label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                >
                                    <option value="Falta">Falta</option>
                                    <option value="Amonestacion">Amonestacion</option>
                                    <option value="Demerito">Demerito</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Gravedad *</label>
                                <select
                                    value={formData.gravedad}
                                    onChange={(e) => setFormData({ ...formData, gravedad: e.target.value })}
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                >
                                    <option value="Leve">Leve</option>
                                    <option value="Moderada">Moderada</option>
                                    <option value="Grave">Grave</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Descripcion *</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    required
                                    rows="3"
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha</label>
                                <input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionConductaRegistro;