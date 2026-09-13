// Componente MiHorario: muestra el horario semanal de clases del estudiante.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: grilla horaria por día y hora, más resumen de clases.
const MiHorario = () => {
    const [horario, setHorario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [estudianteId, setEstudianteId] = useState(null);

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

    // Carga el horario del estudiante identificado por su código de usuario.
    const cargarHorario = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudiante = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudiante) {
                setEstudianteId(estudiante.idEstudiante);
                const response = await API.get(`/horarios/estudiante/${estudiante.idEstudiante}`);
                setHorario(response.data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Escucha cambios de horario en otras pestañas para recargar automáticamente.
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'horario_updated') {
                try {
                    const data = JSON.parse(e.newValue);
                    if (!data) return;
                    // recargar siempre que haya un update; backend filtrará por estudiante
                    cargarHorario();
                } catch (err) {
                    console.error('Error procesando evento storage horario_updated', err);
                }
            }
        };

        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

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
                            border: '1px solid #bfdbfe',
                            minHeight: '20px'
                        }}>
                            <strong>{clase.materia}</strong>
                            <br />
                            <small style={{ color: '#6b7280' }}>{clase.docente}</small>
                            <br />
                            <small style={{ color: '#6b7280' }}>{clase.aula || 'Sin aula'}</small>
                        </div>
                    ))}
                </div>
            );
        }
        return <div style={{ minHeight: '50px' }}></div>;
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
            <DashboardLayout title="Mi Horario">
                <div className="card">
                    <h3>Mi Horario</h3>
                    <p>No se encontraron clases asignadas para su usuario. Verifique con registro academico que su grado/sección esté correcto.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mi Horario">
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
                                <th>Materia</th>
                                <th>Docente</th>
                                <th>Hora</th>
                                <th>Aula</th>
                            </tr>
                        </thead>
                        <tbody>
                            {horario.map((h, index) => (
                                <tr key={index}>
                                    <td>{h.diaSemana}</td>
                                    <td><strong>{h.materia}</strong></td>
                                    <td>{h.docente}</td>
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

export default MiHorario;