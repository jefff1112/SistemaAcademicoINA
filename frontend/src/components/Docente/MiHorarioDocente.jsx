// Componente MiHorarioDocente: muestra el horario semanal de clases del docente en formato de tabla.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: grilla horaria por día y hora, más resumen de clases.
const MiHorarioDocente = () => {
    const [horario, setHorario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [docenteId, setDocenteId] = useState(null);

    const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
    const horas = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

    // Normaliza una hora a formato HH:MM ("07:00:00" o "7:00" -> "07:00") para comparar horarios.
    const normalizarHora = (hora) => {
        if (!hora) return '';
        const partes = hora.split(':');
        return partes.length >= 2 ? `${partes[0].padStart(2, '0')}:${partes[1]}` : hora;
    };

    // Filas de la grilla: horas en punto de la tabla completa más las horas reales del horario,
    // para conservar toda la estructura de la tabla y aun asi mostrar cada clase asignada.
    const getHorasGrilla = () => {
        const base = horas.map(h => normalizarHora(h));
        const presentes = horario.map(h => normalizarHora(h.horaInicio));
        return [...new Set([...base, ...presentes])].sort();
    };

    useEffect(() => {
        cargarHorario();
    }, []);

    // Carga el horario del docente identificado por su código de usuario.
    const cargarHorario = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const docentesRes = await API.get('/docentes');
            const docente = docentesRes.data.find(d => d.codigoDocente === user?.codigo);

            if (docente) {
                setDocenteId(docente.idDocente);
                const response = await API.get(`/horarios/docente/${docente.idDocente}`);
                setHorario(response.data || []);
            }
        } catch (error) {
            mostrarMensaje('Error al cargar horario', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Escucha cambios de horario en otras pestañas (storage) para recargar automáticamente.
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'horario_updated') {
                try {
                    const data = JSON.parse(e.newValue);
                    // si el update corresponde a este docente, recargar
                    if (!data) return;
                    if (data.idDocente && docenteId && parseInt(data.idDocente) === parseInt(docenteId)) {
                        cargarHorario();
                    } else if (data.idClase) {
                        // también recargamos si podría afectar (por ejemplo, misma clase)
                        cargarHorario();
                    }
                } catch (err) {
                    console.error('Error procesando evento storage horario_updated', err);
                }
            }
        };

        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [docenteId]);

    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 3000);
    };

    const getHorarioCelda = (dia, hora) => {
        const clases = horario.filter(h => h.diaSemana === dia && normalizarHora(h.horaInicio) === normalizarHora(hora));
        if (clases.length > 0) {
            return (
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {clases.map((clase, index) => (
                        <div key={index} style={{
                            padding: '4px',
                            background: '#eff6ff',
                            borderRadius: '4px',
                            border: '1px solid #bfdbfe'
                        }}>
                            <strong>{clase.materia}</strong>
                            <br />
                            <small>{clase.clase}</small>
                            <br />
                            <small style={{ color: '#6b7280' }}>{clase.aula || 'Sin aula'}</small>
                        </div>
                    ))}
                </div>
            );
        }
        return <div style={{ height: '60px' }}></div>;
    };

    if (loading) {
        return (
            <DashboardLayout title="Mi Horario">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    if (!loading && horario.length === 0) {
        return (
            <DashboardLayout title="Mi Horario - Docente">
                <div className="card">
                    <h3>Mi Horario</h3>
                    <p>No se encontraron clases asignadas para su usuario. Si debería ver su horario, verifique que su cuenta de docente esté vinculada correctamente o que existan horarios asignados a su clase.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mi Horario - Docente">
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
                <h3>Horario de Clases</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Hora</th>
                                {diasSemana.map(d => (
                                    <th key={d}>{d}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {getHorasGrilla().map(hora => (
                                <tr key={hora}>
                                    <td><strong>{hora}</strong></td>
                                    {diasSemana.map(dia => (
                                        <td key={`${dia}-${hora}`}>
                                            {getHorarioCelda(dia, hora)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <h3>Resumen de Clases</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Dia</th>
                                <th>Clase</th>
                                <th>Materia</th>
                                <th>Hora</th>
                                <th>Aula</th>
                            </tr>
                        </thead>
                        <tbody>
                            {horario.map((h, index) => (
                                <tr key={index}>
                                    <td>{h.diaSemana}</td>
                                    <td>{h.clase}</td>
                                    <td><strong>{h.materia}</strong></td>
                                    <td>{normalizarHora(h.horaInicio)} - {normalizarHora(h.horaFin)}</td>
                                    <td>{h.aula || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MiHorarioDocente;