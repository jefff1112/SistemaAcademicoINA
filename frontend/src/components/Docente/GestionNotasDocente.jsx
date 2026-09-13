// src/components/Docente/GestionNotasDocente.jsx
// Componente GestionNotasDocente: registro masivo e individual de notas por materia, clase y período académico.
import React, { useState, useEffect } from 'react';
import { FaSave, FaEdit, FaTrash, FaUndo } from 'react-icons/fa';
import API from '../../services/api';
import notasService from '../../services/notasService';
import { notificarNotasActualizadas } from '../../services/notasSync';
import './GestionNotasDocente.css';

// Componente principal: interfaz de gestión de notas con guardado único o masivo.
const GestionNotasDocente = () => {
    const [loading, setLoading] = useState(false);
    const [materias, setMaterias] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedMateria, setSelectedMateria] = useState('');
    const [selectedClase, setSelectedClase] = useState('');
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [mensaje, setMensaje] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const anioActual = new Date().getFullYear();

    // Fila seleccionada: cada materia del docente viene por combinación materia+clase (idDocenteMateria único).
    const materiaSeleccionada = materias.find(m => m.idDocenteMateria === parseInt(selectedMateria));

    // Cargar materias del docente
    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                console.log('📚 Cargando materias del docente...');
                const response = await API.get('/notas/mis-materias');
                setMaterias(response.data || []);
            } catch (error) {
                console.error('❌ Error cargando materias:', error);
                if (error.response?.status === 401) {
                    setMensaje({ tipo: 'error', texto: 'Error de autenticación. Por favor, vuelve a iniciar sesión.' });
                }
            }
        };
        fetchMaterias();
    }, []);

    // Cargar periodos del año actual
    useEffect(() => {
        const fetchPeriodos = async () => {
            try {
                const response = await API.get('/periodosacademicos');
                setPeriodos(response.data.filter(p => p.anioLectivo === anioActual) || []);
            } catch (error) {
                console.error('Error cargando periodos:', error);
            }
        };
        fetchPeriodos();
    }, []);

    // Cargar estudiantes y notas al seleccionar materia y periodo
    useEffect(() => {
        if (selectedMateria && selectedClase && selectedPeriodo) {
            cargarDatos();
        }
    }, [selectedMateria, selectedClase, selectedPeriodo]);

    // Carga los estudiantes y sus notas existentes del período seleccionado.
    const cargarDatos = async () => {
        setLoading(true);
        setMensaje(null);
        try {
            // Obtener estudiantes de la clase
            const estudiantesRes = await API.get(`/estudiantes/clase/${selectedClase}`);
            const estudiantesData = estudiantesRes.data || [];

            // Obtener notas existentes para cada estudiante (del periodo seleccionado)
            const estudiantesConNotas = await Promise.all(
                estudiantesData.map(async (est) => {
                    try {
                        const idMateria = materiaSeleccionada?.idMateria;
                        if (!idMateria) return { ...est, notaId: null, nota: 0, existe: false };
                        const notaRes = await notasService.getNotaPeriodo(est.idEstudiante, idMateria, selectedPeriodo);
                        return {
                            ...est,
                            notaId: notaRes?.idResultadoPeriodo || null,
                            nota: notaRes?.notaAcumulada || 0,
                            existe: !!notaRes?.idResultadoPeriodo
                        };
                    } catch (error) {
                        if (error.response?.status === 401) {
                            console.warn('⚠️ Error de autenticación al obtener nota');
                        }
                        return { ...est, notaId: null, nota: 0, existe: false };
                    }
                })
            );

            setEstudiantes(estudiantesConNotas);
        } catch (error) {
            console.error('Error cargando datos:', error);
            if (error.response?.status === 401) {
                setMensaje({ tipo: 'error', texto: 'Error de autenticación. Por favor, vuelve a iniciar sesión.' });
            } else {
                setMensaje({ tipo: 'error', texto: 'Error al cargar los datos' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNotaChange = (index, value) => {
        const nuevos = [...estudiantes];
        nuevos[index].nota = parseFloat(value) || 0;
        setEstudiantes(nuevos);
    };

    // Guarda de forma masiva las notas cargadas en la tabla mediante la API.
    const guardarTodo = async () => {
        const notas = estudiantes
            .filter(est => est.nota > 0)
            .map(est => ({
                idEstudiante: est.idEstudiante,
                idMateria: materiaSeleccionada?.idMateria,
                idPeriodo: parseInt(selectedPeriodo),
                idClase: parseInt(selectedClase),
                nota: est.nota
            }));

        if (notas.length === 0) {
            setMensaje({ tipo: 'error', texto: 'No hay notas que guardar (ingrese notas mayores a 0)' });
            return;
        }

        setGuardando(true);
        try {
            const response = await API.post('/notas/guardar-multiple', notas);
            setMensaje({ tipo: 'success', texto: response.data?.mensaje || 'Notas guardadas correctamente' });
            notificarNotasActualizadas();
            await cargarDatos();
            setTimeout(() => setMensaje(null), 3000);
        } catch (error) {
            console.error('Error guardando notas:', error);
            setMensaje({
                tipo: 'error',
                texto: error.response?.status === 403
                    ? 'No tiene autorización para calificar esta materia'
                    : 'Error al guardar las notas'
            });
        } finally {
            setGuardando(false);
        }
    };

    // Guarda o actualiza la nota de un estudiante individual.
    const guardarNota = async (index) => {
        const estudiante = estudiantes[index];
        const data = {
            idEstudiante: estudiante.idEstudiante,
            idMateria: materiaSeleccionada?.idMateria,
            idPeriodo: parseInt(selectedPeriodo),
            idClase: parseInt(selectedClase),
            nota: estudiante.nota
        };

        setGuardando(true);
        try {
            let response;
            if (estudiante.notaId) {
                // Editar nota existente
                response = await notasService.editarNota(estudiante.notaId, data);
                setMensaje({ tipo: 'success', texto: `Nota actualizada para ${estudiante.nombres} ${estudiante.apellidos}` });
            } else {
                // Guardar nueva nota
                response = await notasService.guardarNota(data);
                const nuevos = [...estudiantes];
                nuevos[index].notaId = response.id;
                nuevos[index].existe = true;
                setEstudiantes(nuevos);
                setMensaje({ tipo: 'success', texto: `Nota guardada para ${estudiante.nombres} ${estudiante.apellidos}` });
            }
            notificarNotasActualizadas();
            setTimeout(() => setMensaje(null), 3000);
        } catch (error) {
            console.error('Error guardando nota:', error);
            if (error.response?.status === 401) {
                setMensaje({ tipo: 'error', texto: 'Error de autenticación. Por favor, vuelve a iniciar sesión.' });
            } else if (error.response?.status === 403) {
                setMensaje({ tipo: 'error', texto: 'No tiene autorización para calificar esta materia' });
            } else {
                setMensaje({ tipo: 'error', texto: 'Error al guardar la nota' });
            }
        } finally {
            setGuardando(false);
        }
    };

    // Elimina la nota de un estudiante tras confirmación del usuario.
    const eliminarNota = async (index) => {
        const estudiante = estudiantes[index];
        if (!estudiante.notaId) return;
        if (!window.confirm(`¿Eliminar la nota de ${estudiante.nombres} ${estudiante.apellidos}?`)) return;

        try {
            await notasService.eliminarNota(estudiante.notaId);
            notificarNotasActualizadas();
            const nuevos = [...estudiantes];
            nuevos[index].notaId = null;
            nuevos[index].nota = 0;
            nuevos[index].existe = false;
            setEstudiantes(nuevos);
            setMensaje({ tipo: 'success', texto: `Nota eliminada para ${estudiante.nombres} ${estudiante.apellidos}` });
            setTimeout(() => setMensaje(null), 3000);
        } catch (error) {
            console.error('Error eliminando nota:', error);
            setMensaje({ tipo: 'error', texto: 'Error al eliminar la nota' });
        }
    };

    const getEstadoNota = (nota) => {
        if (nota === 0) return { texto: 'Sin nota', color: '#95a5a6' };
        if (nota >= 6) return { texto: 'Aprobado', color: '#27ae60' };
        if (nota >= 5) return { texto: 'Recuperación', color: '#f39c12' };
        return { texto: 'Reprobado', color: '#e74c3c' };
    };

    // Obtener información de la materia seleccionada (incluye clase)
    const materiaInfo = materiaSeleccionada;

    return (
        <div className="gestion-notas-docente">
            <h2>📝 Gestión de Notas</h2>

            {mensaje && (
                <div className={`alert alert-${mensaje.tipo}`}>
                    {mensaje.texto}
                    <button onClick={() => setMensaje(null)}>×</button>
                </div>
            )}

            <div className="filtros-container">
                <div className="filtro-grupo">
                    <label>Materia y Clase</label>
                    <select
                        value={selectedMateria}
                        onChange={(e) => {
                            const selected = e.target.value;
                            setSelectedMateria(selected);
                            const materia = materias.find(m => m.idDocenteMateria === parseInt(selected));
                            if (materia) setSelectedClase(materia.idClase);
                        }}
                    >
                        <option value="">Seleccione una materia</option>
                        {materias.map(m => (
                            <option key={m.idDocenteMateria} value={m.idDocenteMateria}>
                                {m.nombreMateria} - {m.nombreClase} ({m.seccion})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filtro-grupo">
                    <label>Período</label>
                    <select
                        value={selectedPeriodo}
                        onChange={(e) => setSelectedPeriodo(e.target.value)}
                    >
                        <option value="">Seleccione un período</option>
                        {periodos.map(p => (
                            <option key={p.idPeriodo} value={p.idPeriodo}>
                                {p.nombre} ({p.anioLectivo})
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className="btn-recargar"
                    onClick={cargarDatos}
                    disabled={!selectedMateria || !selectedPeriodo || loading}
                >
                    <FaUndo /> Recargar
                </button>
            </div>

            {loading ? (
                <div className="loading">Cargando datos...</div>
            ) : estudiantes.length > 0 ? (
                <div className="tabla-container">
                    <div className="tabla-header">
                        <h3>
                            {materiaInfo?.nombreMateria || 'Materia'} - {materiaInfo?.nombreClase || 'Clase'}
                            <span className="periodo-badge">
                                Período {selectedPeriodo}
                            </span>
                        </h3>
                        <div className="tabla-header-actions">
                            <span className="total-estudiantes">
                                Total: {estudiantes.length} estudiantes
                            </span>
                            <button
                                className="btn-guardar-todo"
                                onClick={guardarTodo}
                                disabled={guardando || !estudiantes.length}
                            >
                                {guardando ? 'Guardando...' : 'Guardar Todo'}
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="tabla-notas">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>NIE</th>
                                    <th>Código</th>
                                    <th>Estudiante</th>
                                    <th>Nota</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map((est, index) => {
                                    const estado = getEstadoNota(est.nota);
                                    return (
                                        <tr key={est.idEstudiante}>
                                            <td>{index + 1}</td>
                                            <td>{est.nie || 'N/A'}</td>
                                            <td>{est.codigoEstudiante || 'N/A'}</td>
                                            <td>{est.nombres} {est.apellidos}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="input-nota"
                                                    value={est.nota}
                                                    onChange={(e) => handleNotaChange(index, e.target.value)}
                                                    min="0"
                                                    max="10"
                                                    step="0.01"
                                                    disabled={guardando}
                                                />
                                            </td>
                                            <td>
                                                <span style={{ color: estado.color, fontWeight: 'bold' }}>
                                                    {estado.texto}
                                                </span>
                                                {est.existe && (
                                                    <span className="badge-guardado" title="Nota guardada">✓</span>
                                                )}
                                            </td>
                                            <td className="acciones-cell">
                                                <button
                                                    className="btn-guardar-nota"
                                                    onClick={() => guardarNota(index)}
                                                    disabled={guardando}
                                                    title={est.existe ? "Actualizar nota" : "Guardar nota"}
                                                >
                                                    {est.existe ? <FaEdit /> : <FaSave />}
                                                </button>
                                                {est.existe && (
                                                    <button
                                                        className="btn-eliminar-nota"
                                                        onClick={() => eliminarNota(index)}
                                                        disabled={guardando}
                                                        title="Eliminar nota"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="sin-datos">
                    <p>Seleccione una materia y período para ver los estudiantes</p>
                </div>
            )}
        </div>
    );
};

export default GestionNotasDocente;