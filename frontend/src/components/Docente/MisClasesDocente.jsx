// Componente MisClasesDocente: lista las clases asignadas al docente y permite ver sus estudiantes.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: tabla de clases con acceso al detalle de estudiantes y notas.
const MisClasesDocente = () => {
    const [clases, setClases] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedClase, setSelectedClase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        cargarClases();
    }, []);

    // Carga las clases del docente para el año lectivo en curso.
    const cargarClases = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const docentesRes = await API.get('/docentes');
            const docente = docentesRes.data.find(d => d.codigoDocente === user?.codigo);

            if (docente) {
                const response = await API.get(`/docentes/${docente.idDocente}/clases/${new Date().getFullYear()}`);
                setClases(response.data || []);
            }
        } catch (error) {
            mostrarMensaje('Error al cargar clases', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Carga los estudiantes inscritos en la clase seleccionada.
    const cargarEstudiantes = async (idClase) => {
        try {
            const response = await API.get(`/estudiantes/clase/${idClase}`);
            setEstudiantes(response.data || []);
            setSelectedClase(idClase);
        } catch (error) {
            mostrarMensaje('Error al cargar estudiantes', 'error');
        }
    };

    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) {
        return (
            <DashboardLayout title="Mis Clases">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mis Clases - Docente">
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
                <h3>Mis Clases</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Clase</th>
                                <th>Seccion</th>
                                <th>Estudiantes</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clases.map((c) => (
                                <tr key={c.idClase}>
                                    <td><strong>{c.nombreClase}</strong></td>
                                    <td>{c.seccion}</td>
                                    <td>{c.estudiantes || 0}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => cargarEstudiantes(c.idClase)}>
                                            Ver Estudiantes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {estudiantes.length > 0 && (
                <div className="card">
                    <h3>Estudiantes de la Clase</h3>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Codigo</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>NIE</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map((e) => (
                                    <tr key={e.idEstudiante}>
                                        <td><strong>{e.codigoEstudiante}</strong></td>
                                        <td>{e.nombres}</td>
                                        <td>{e.apellidos}</td>
                                        <td>{e.nie || '-'}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => {
                                                window.location.href = `/docente/subir-notas`;
                                            }}>
                                                Ver Notas
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

export default MisClasesDocente;