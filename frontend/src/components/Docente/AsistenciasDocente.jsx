// Componente AsistenciasDocente: permite al docente registrar y actualizar la asistencia de los estudiantes por clase y fecha.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { formatoHoraExacta } from '../../utils/formatUtils';

// Componente principal: registro diario de asistencia (presente, ausente, tarde, justificado).
const AsistenciasDocente = () => {
    const [clases, setClases] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedClase, setSelectedClase] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [asistencias, setAsistencias] = useState([]);
    const [docente, setDocente] = useState(null);
    const [materiasDocente, setMateriasDocente] = useState([]);

    useEffect(() => {
        cargarClases();
    }, []);

    // Recarga las asistencias cuando cambia la clase o la fecha seleccionada.
    useEffect(() => {
        if (selectedClase && fecha) {
            cargarAsistencias();
        }
    }, [selectedClase, fecha]);

    // Carga las clases asignadas al docente logueado.
    const cargarClases = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const docentesRes = await API.get('/docentes');
            const docenteEncontrado = docentesRes.data.find(d => d.codigoDocente === user?.codigo);

            if (docenteEncontrado) {
                setDocente(docenteEncontrado);
                const response = await API.get(`/docentes/${docenteEncontrado.idDocente}/clases/${new Date().getFullYear()}`);
                setClases(response.data || []);

                try {
                    const materiasRes = await API.get('/notas/mis-materias');
                    setMateriasDocente(materiasRes.data || []);
                } catch (err) {
                    console.error('Error cargando materias del docente:', err);
                }
            }
        } catch (error) {
            mostrarMensaje('Error al cargar clases', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Carga las asistencias de la clase/fecha y las combina con la lista de estudiantes.
    const cargarAsistencias = async () => {
        try {
            const response = await API.get(`/asistencias/clase/${selectedClase}/${fecha}`);
            const asistenciasData = response.data || [];

            // Obtener todos los estudiantes de la clase
            const estudiantesRes = await API.get(`/estudiantes/clase/${selectedClase}`);
            const estudiantesData = estudiantesRes.data || [];

            // Combinar estudiantes con asistencias
            const combinado = estudiantesData.map(e => {
                const asistencia = asistenciasData.find(a => a.idEstudiante === e.idEstudiante);
                return {
                    ...e,
                    estado: asistencia?.estado || 'Pendiente',
                    idAsistencia: asistencia?.idAsistencia || null,
                    horaRegistro: asistencia?.horaRegistro || null,
                    observaciones: asistencia?.observaciones || ''
                };
            });

            setEstudiantes(combinado);
            setAsistencias(asistenciasData);
        } catch (error) {
            mostrarMensaje('Error al cargar asistencias', 'error');
        }
    };

    // Crea o actualiza la asistencia de un estudiante según el estado seleccionado.
    const registrarAsistencia = async (idEstudiante, estado) => {
        try {
            const existing = asistencias.find(a => a.idEstudiante === idEstudiante);
            const materiaDeClase = materiasDocente.find(m => m.idClase === parseInt(selectedClase));
            const idMateria = materiaDeClase?.idMateria || 1;

            const data = {
                idEstudiante,
                idClase: parseInt(selectedClase),
                idMateria,
                idDocente: docente?.idDocente || 1,
                fecha: new Date(fecha),
                estado,
                horaRegistro: new Date().toTimeString().split(' ')[0],
                observaciones: estudiantes.find(e => e.idEstudiante === idEstudiante)?.observaciones || ''
            };

            if (existing) {
                await API.put(`/asistencias/${existing.idAsistencia}`, data);
            } else {
                await API.post('/asistencias', data);
            }
            mostrarMensaje('Asistencia registrada', 'success');
            cargarAsistencias();
        } catch (error) {
            mostrarMensaje('Error al registrar asistencia', 'error');
        }
    };

    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 3000);
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Presente': return '#16a34a';
            case 'Ausente': return '#dc2626';
            case 'Tarde': return '#e67e22';
            case 'Justificado': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Asistencias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Asistencias - Docente">
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
                <h3>Seleccionar Clase y Fecha</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Clase</label>
                        <select
                            value={selectedClase}
                            onChange={(e) => setSelectedClase(e.target.value)}
                            className="form-control"
                        >
                            <option value="">Seleccionar</option>
                            {clases.map(c => (
                                <option key={c.idClase} value={c.idClase}>
                                    {c.nombreClase}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Fecha</label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group" style={{ flex: 0 }}>
                        <button className="btn-primary" onClick={cargarAsistencias}>
                            Cargar
                        </button>
                    </div>
                </div>
            </div>

            {estudiantes.length > 0 && (
                <div className="card">
                    <h3>Registro de Asistencias</h3>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Estudiante</th>
                                    <th>Estado</th>
                                    <th>Hora Registro</th>
                                    <th>Observaciones</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map((e, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{e.nombres} {e.apellidos}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getEstadoColor(e.estado),
                                                color: '#fff'
                                            }}>
                                                {e.estado}
                                            </span>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{formatoHoraExacta(e.horaRegistro)}</td>
                                        <td>
                                            <input
                                                type="text"
                                                value={e.observaciones || ''}
                                                onChange={(ev) => {
                                                    const updated = estudiantes.map(est =>
                                                        est.idEstudiante === e.idEstudiante
                                                            ? { ...est, observaciones: ev.target.value }
                                                            : est
                                                    );
                                                    setEstudiantes(updated);
                                                }}
                                                className="form-control"
                                                style={{ width: '100%' }}
                                            />
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <button
                                                className="btn-success"
                                                title="Presente"
                                                style={{ width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: '#16a34a', marginRight: '4px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                                onClick={() => registrarAsistencia(e.idEstudiante, 'Presente')}
                                            >
                                                P
                                            </button>
                                            <button
                                                className="btn-danger"
                                                title="Ausente"
                                                style={{ width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: '#dc2626', marginRight: '4px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                                onClick={() => registrarAsistencia(e.idEstudiante, 'Ausente')}
                                            >
                                                A
                                            </button>
                                            <button
                                                className="btn-warning"
                                                title="Tarde"
                                                style={{ width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: '#e67e22', marginRight: '4px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                                onClick={() => registrarAsistencia(e.idEstudiante, 'Tarde')}
                                            >
                                                T
                                            </button>
                                            <button
                                                className="btn-primary"
                                                title="Justificado"
                                                style={{ width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                                onClick={() => registrarAsistencia(e.idEstudiante, 'Justificado')}
                                            >
                                                J
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AsistenciasDocente;