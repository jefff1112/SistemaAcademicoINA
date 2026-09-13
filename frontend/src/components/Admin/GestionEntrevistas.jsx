// Componente Gestión de Entrevistas (Admin): programa entrevistas y registra resultados de aspirantes.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra aspirantes pendientes y entrevistas programadas.
const GestionEntrevistas = () => {
    // Estados: listas de aspirantes y entrevistas, modales y datos de los formularios.
    const [aspirantesPendientes, setAspirantesPendientes] = useState([]);
    const [entrevistasProgramadas, setEntrevistasProgramadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAspirante, setSelectedAspirante] = useState(null);
    const [formData, setFormData] = useState({ fechaEntrevista: '', entrevistador: '' });
    const [showResultadoModal, setShowResultadoModal] = useState(false);
    const [resultadoData, setResultadoData] = useState({ aprobado: true, observaciones: '', motivoRechazo: '' });

    // Carga aspirantes pendientes y entrevistas programadas al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene en paralelo aspirantes y entrevistas, y filtra los que están pendientes.
    const cargarDatos = async () => {
        try {
            const [aspirantesRes, entrevistasRes] = await Promise.all([
                // Petición GET /aspirantes para listar los solicitantes de ingreso.
                API.get('/aspirantes'),
                // Petición GET /entrevistas para listar las entrevistas programadas.
                API.get('/entrevistas')
            ]);
            const pendientes = aspirantesRes.data.filter(a => a.estadoSolicitud === 'Pendiente');
            setAspirantesPendientes(pendientes);
            setEntrevistasProgramadas(entrevistasRes.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Programa la entrevista del aspirante seleccionado y actualiza las listas.
    const programarEntrevista = async (e) => {
        e.preventDefault();
        try {
            // Petición POST /entrevistas/programar para agendar la entrevista.
            await API.post('/entrevistas/programar', {
                idAspirante: selectedAspirante.idAspirante,
                fechaEntrevista: formData.fechaEntrevista,
                entrevistador: formData.entrevistador
            });
            alert('Entrevista programada correctamente');
            setShowModal(false);
            setSelectedAspirante(null);
            setFormData({ fechaEntrevista: '', entrevistador: '' });
            cargarDatos();
        } catch (error) {
            alert('Error al programar entrevista');
        }
    };

    // Registra el resultado (aprobado o rechazado) de la entrevista y refresca los datos.
    const registrarResultado = async (e) => {
        e.preventDefault();
        try {
            // Petición POST /entrevistas/registrar-resultado para guardar la evaluación.
            await API.post('/entrevistas/registrar-resultado', {
                idAspirante: selectedAspirante.idAspirante,
                aprobado: resultadoData.aprobado,
                observaciones: resultadoData.observaciones,
                motivoRechazo: resultadoData.motivoRechazo
            });
            alert('Resultado registrado correctamente');
            setShowResultadoModal(false);
            setSelectedAspirante(null);
            setResultadoData({ aprobado: true, observaciones: '', motivoRechazo: '' });
            cargarDatos();
        } catch (error) {
            alert('Error al registrar resultado');
        }
    };

    // Devuelve el nombre de la especialidad a partir de su id.
    const getEspecialidadNombre = (id) => {
        const especialidades = { 1: 'Administrativo Contable', 2: 'Desarrollo de Software', 3: 'Salud y Bienestar', 4: 'Electronica', 5: 'Bachillerato General' };
        return especialidades[id] || '-';
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Entrevistas">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Entrevistas">
            {/* Aspirantes Pendientes */}
            <div className="card">
                <h3>Aspirantes Pendientes de Entrevista</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Nombres</th><th>Apellidos</th><th>Especialidad</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aspirantesPendientes.map(a => (
                                <tr key={a.idAspirante}>
                                    <td>{a.idAspirante}</td>
                                    <td>{a.nombres}</td>
                                    <td>{a.apellidos}</td>
                                    <td>{getEspecialidadNombre(a.especialidadAspira)}</td>
                                    <td><button className="btn-primary" onClick={() => { setSelectedAspirante(a); setShowModal(true); }}>Programar Entrevista</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Entrevistas Programadas */}
            <div className="card">
                <h3>Entrevistas Programadas</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Aspirante</th><th>Fecha</th><th>Entrevistador</th><th>Observaciones</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entrevistasProgramadas.map(e => (
                                <tr key={e.id}>
                                    <td>{e.aspirante}</td>
                                    <td>{new Date(e.fechaEntrevista).toLocaleString()}</td>
                                    <td>{e.entrevistador || 'Pendiente'}</td>
                                    <td>{e.observaciones || '-'}</td>
                                    <td><button className="btn-edit" onClick={() => { setSelectedAspirante(e); setShowResultadoModal(true); }}>Registrar Resultado</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Programar */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header"><h3>Programar Entrevista</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
                        <form onSubmit={programarEntrevista}>
                            <div className="form-group"><label>Aspirante</label><input type="text" value={`${selectedAspirante?.nombres} ${selectedAspirante?.apellidos}`} disabled className="form-control" /></div>
                            <div className="form-group"><label>Fecha y Hora</label><input type="datetime-local" value={formData.fechaEntrevista} onChange={(e) => setFormData({ ...formData, fechaEntrevista: e.target.value })} required className="form-control" /></div>
                            <div className="form-group"><label>Entrevistador</label><input type="text" value={formData.entrevistador} onChange={(e) => setFormData({ ...formData, entrevistador: e.target.value })} required className="form-control" /></div>
                            <div className="modal-buttons"><button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button><button type="submit" className="btn-primary">Programar</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Resultado */}
            {showResultadoModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header"><h3>Registrar Resultado</h3><button className="modal-close" onClick={() => setShowResultadoModal(false)}>×</button></div>
                        <form onSubmit={registrarResultado}>
                            <div className="form-group"><label>Aspirante</label><input type="text" value={selectedAspirante?.aspirante || ''} disabled className="form-control" /></div>
                            <div className="form-group"><label>Resultado</label><select value={resultadoData.aprobado} onChange={(e) => setResultadoData({ ...resultadoData, aprobado: e.target.value === 'true' })} className="form-control"><option value="true">Aprobado</option><option value="false">Rechazado</option></select></div>
                            <div className="form-group"><label>Observaciones</label><textarea value={resultadoData.observaciones} onChange={(e) => setResultadoData({ ...resultadoData, observaciones: e.target.value })} rows="3" className="form-control" /></div>
                            {!resultadoData.aprobado && (<div className="form-group"><label>Motivo de Rechazo</label><textarea value={resultadoData.motivoRechazo} onChange={(e) => setResultadoData({ ...resultadoData, motivoRechazo: e.target.value })} rows="2" required className="form-control" /></div>)}
                            <div className="modal-buttons"><button type="button" className="btn-cancel" onClick={() => setShowResultadoModal(false)}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionEntrevistas;