// Componente Gestión de Clases (Dirección): crea, edita y elimina clases con cupos y secciones.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra las clases del instituto con nivel, grado, especialidad y sección.
const GestionClases = () => {
    // Estados: clases, catálogos (niveles, grados, especialidades, secciones), modal y formulario.
    const [clases, setClases] = useState([]);
    const [niveles, setNiveles] = useState([]);
    const [grados, setGrados] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClase, setEditingClase] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        idNivel: '',
        idGrado: '',
        idEspecialidad: '',
        idSeccion: '',
        cupoMaximo: 30,
        anioLectivo: new Date().getFullYear()
    });

    // Carga las clases y los catálogos al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene en paralelo las clases, especialidades y secciones desde la API.
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [clasesRes, nivelesRes, gradosRes, especialidadesRes, seccionesRes] = await Promise.all([
                // Petición GET /clases para listar las clases existentes.
                API.get('/clases'),
                // Petición GET /clases/niveles para el selector de nivel académico.
                API.get('/clases/niveles'),
                // Petición GET /grados para el selector de año que cursa.
                API.get('/grados'),
                // Petición GET /clases/especialidades para el selector de especialidad.
                API.get('/clases/especialidades'),
                // Petición GET /clases/secciones para el selector de sección.
                API.get('/clases/secciones')
            ]);
            setClases(clasesRes.data || []);
            setNiveles(nivelesRes.data || []);
            setGrados(gradosRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
            setSecciones(seccionesRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Muestra un mensaje temporal al usuario y lo limpia después de 3 segundos.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 3000);
    };

    // Abre el modal para crear una clase o editar la seleccionada.
    const handleOpenModal = (clase = null) => {
        if (clase) {
            setEditingClase(clase);
            setFormData({
                idNivel: clase.idNivel || '',
                idGrado: clase.idGrado || '',
                idEspecialidad: clase.idEspecialidad || '',
                idSeccion: clase.idSeccion || '',
                cupoMaximo: clase.cupoMaximo || 30,
                anioLectivo: clase.anioLectivo || new Date().getFullYear()
            });
        } else {
            setEditingClase(null);
            setFormData({
                idNivel: '',
                idGrado: '',
                idEspecialidad: '',
                idSeccion: '',
                cupoMaximo: 30,
                anioLectivo: new Date().getFullYear()
            });
        }
        setShowModal(true);
    };

    // Devuelve los grados pertenecientes al nivel seleccionado.
    const getGradosDeNivel = (idNivel) => {
        return grados.filter(g => g.idNivel === Number(idNivel));
    };

    // Devuelve las especialidades válidas para el nivel seleccionado:
    // General (1) sin especialidad; Vocacional (2): 1-2; Productivo (3): 3.
    const getEspecialidadesDeNivel = (idNivel) => {
        const nivel = Number(idNivel);
        if (nivel === 1) return [];
        if (nivel === 2) return especialidades.filter(e => e.idEspecialidad === 1 || e.idEspecialidad === 2);
        if (nivel === 3) return especialidades.filter(e => e.idEspecialidad === 3);
        return especialidades;
    };

    // Valida los campos obligatorios y crea o actualiza la clase según corresponda.
    const handleSubmit = async (e) => {
        e.preventDefault();

        const idNivelNum = Number(formData.idNivel);
        const idGradoNum = Number(formData.idGrado);
        const idSeccionNum = Number(formData.idSeccion);
        const cupoMaximoNum = Number(formData.cupoMaximo);
        const anioLectivoNum = Number(formData.anioLectivo);

        if (isNaN(idNivelNum) || idNivelNum === 0) {
            mostrarMensaje('Seleccione un Nivel valido', 'error');
            return;
        }
        if (isNaN(idGradoNum) || idGradoNum === 0) {
            mostrarMensaje('Seleccione el Ano que cursa la clase', 'error');
            return;
        }
        const gradoElegido = grados.find(g => g.idGrados === idGradoNum);
        if (gradoElegido && gradoElegido.idNivel !== idNivelNum) {
            mostrarMensaje('El ano seleccionado no pertenece al nivel elegido', 'error');
            return;
        }
        if (isNaN(idSeccionNum) || idSeccionNum === 0) {
            mostrarMensaje('Seleccione una Seccion valida', 'error');
            return;
        }

        const especialidadesValidas = getEspecialidadesDeNivel(idNivelNum);
        if (formData.idEspecialidad && formData.idEspecialidad !== ''
            && !especialidadesValidas.some(e => e.idEspecialidad === Number(formData.idEspecialidad))) {
            mostrarMensaje('La especialidad elegida no corresponde al nivel seleccionado', 'error');
            return;
        }

        try {
            const dataToSend = {
                idNivel: idNivelNum,
                idGrado: idGradoNum,
                idSeccion: idSeccionNum,
                cupoMaximo: cupoMaximoNum,
                anioLectivo: anioLectivoNum
            };

            if (formData.idEspecialidad && formData.idEspecialidad !== '') {
                const idEspecialidadNum = Number(formData.idEspecialidad);
                if (!isNaN(idEspecialidadNum) && idEspecialidadNum > 0) {
                    dataToSend.idEspecialidad = idEspecialidadNum;
                }
            }

            if (editingClase) {
                // Petición PUT /clases/{id} para actualizar la clase existente.
                await API.put(`/clases/${editingClase.idClase}`, dataToSend);
                mostrarMensaje('Clase actualizada correctamente', 'success');
            } else {
                // Petición POST /clases para crear una nueva clase.
                await API.post('/clases', dataToSend);
                mostrarMensaje('Clase creada correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        }
    };

    // Elimina una clase solo si no tiene estudiantes matriculados y tras confirmar.
    const handleDelete = async (clase) => {
        if (clase.cupoActual > 0) {
            mostrarMensaje(`No se puede eliminar porque tiene ${clase.cupoActual} estudiantes`, 'error');
            return;
        }
        if (window.confirm(`Eliminar la clase "${clase.nombreClase}"?`)) {
            try {
                // Petición DELETE /clases/{id} para borrar la clase.
                await API.delete(`/clases/${clase.idClase}`);
                mostrarMensaje('Clase eliminada correctamente', 'success');
                cargarDatos();
            } catch (error) {
                mostrarMensaje('Error al eliminar', 'error');
            }
        }
    };

    // Devuelve el nombre del nivel académico a partir de su id.
    const getNivelNombre = (id) => {
        const nivel = niveles.find(n => n.idNivel === Number(id));
        return nivel ? nivel.nombreNivel : '-';
    };

    // Devuelve el nombre del grado (año que cursa) a partir de su id.
    const getGradoNombre = (id) => {
        const grado = grados.find(g => g.idGrados === Number(id));
        return grado ? grado.nombreGrado : '-';
    };

    // Devuelve el nombre de la especialidad a partir de su id.
    const getEspecialidadNombre = (id) => {
        if (!id) return 'Bachillerato General';
        const especialidad = especialidades.find(e => e.idEspecialidad === id);
        return especialidad ? especialidad.nombreEspecialidad : 'Bachillerato General';
    };

    // Devuelve el nombre de la sección a partir de su id.
    const getSeccionNombre = (id) => {
        const seccion = secciones.find(s => s.idSeccion === id);
        return seccion ? `Seccion ${seccion.nombreSeccion}` : '-';
    };

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Clases">
                <div className="loading">Cargando datos...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Clases - Direccion">
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Lista de Clases</h3>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Nueva Clase
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nivel</th>
                                <th>Año</th>
                                <th>Especialidad</th>
                                <th>Seccion</th>
                                <th>Nombre Clase</th>
                                <th>Cupo Max</th>
                                <th>Cupo Actual</th>
                                <th>Disponible</th>
                                <th>Año Lectivo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clases.map((c) => (
                                <tr key={c.idClase}>
                                    <td>{c.idClase}</td>
                                    <td>{getNivelNombre(c.idNivel)}</td>
                                    <td>{getGradoNombre(c.idGrado)}</td>
                                    <td>{getEspecialidadNombre(c.idEspecialidad)}</td>
                                    <td>{getSeccionNombre(c.idSeccion)}</td>
                                    <td><strong>{c.nombreClase}</strong></td>
                                    <td>{c.cupoMaximo}</td>
                                    <td>{c.cupoActual}</td>
                                    <td style={{ color: c.cupoMaximo - c.cupoActual > 0 ? '#16a34a' : '#dc2626' }}>
                                        {c.cupoMaximo - c.cupoActual}
                                    </td>
                                    <td>{c.anioLectivo}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleOpenModal(c)}>Editar</button>
                                        <button className="btn-danger" onClick={() => handleDelete(c)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingClase ? 'Editar Clase' : 'Nueva Clase'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nivel *</label>
                                <select
                                    value={formData.idNivel}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        idNivel: e.target.value,
                                        idGrado: '',
                                        idEspecialidad: Number(e.target.value) === 1 ? '' : formData.idEspecialidad
                                    })}
                                    required
                                    className="form-control"
                                >
                                    <option value="">Seleccionar Nivel</option>
                                    {niveles.map((n) => (
                                        <option key={n.idNivel} value={n.idNivel}>
                                            {n.nombreNivel}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Año que cursa *</label>
                                <select
                                    value={formData.idGrado}
                                    onChange={(e) => setFormData({ ...formData, idGrado: e.target.value })}
                                    required
                                    className="form-control"
                                    disabled={!formData.idNivel}
                                >
                                    <option value="">Seleccionar Año</option>
                                    {getGradosDeNivel(formData.idNivel).map((g) => (
                                        <option key={g.idGrados} value={g.idGrados}>
                                            {g.nombreGrado}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Especialidad</label>
                                <select
                                    value={formData.idEspecialidad}
                                    onChange={(e) => setFormData({ ...formData, idEspecialidad: e.target.value })}
                                    className="form-control"
                                    disabled={!formData.idNivel || Number(formData.idNivel) === 1}
                                >
                                    <option value="">
                                        {Number(formData.idNivel) === 1 ? 'Bachillerato General (sin especialidad)' : 'Bachillerato General'}
                                    </option>
                                    {getEspecialidadesDeNivel(formData.idNivel).map((e) => (
                                        <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                            {e.nombreEspecialidad}
                                        </option>
                                    ))}
                                </select>
                                {formData.idNivel && Number(formData.idNivel) > 1 && getEspecialidadesDeNivel(formData.idNivel).length > 0 && (
                                    <small style={{ color: '#64748b' }}>Obligatoria para niveles tecnicos</small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Seccion *</label>
                                <select
                                    value={formData.idSeccion}
                                    onChange={(e) => setFormData({ ...formData, idSeccion: e.target.value })}
                                    required
                                    className="form-control"
                                >
                                    <option value="">Seleccionar Seccion</option>
                                    {secciones.map((s) => (
                                        <option key={s.idSeccion} value={s.idSeccion}>
                                            Seccion {s.nombreSeccion}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Cupo Maximo</label>
                                <input
                                    type="number"
                                    value={formData.cupoMaximo}
                                    onChange={(e) => setFormData({ ...formData, cupoMaximo: e.target.value })}
                                    className="form-control"
                                    min="1"
                                />
                            </div>

                            <div className="form-group">
                                <label>Año Lectivo</label>
                                <input
                                    type="number"
                                    value={formData.anioLectivo}
                                    onChange={(e) => setFormData({ ...formData, anioLectivo: e.target.value })}
                                    className="form-control"
                                />
                            </div>

                            <div className="modal-buttons">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {editingClase ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionClases;