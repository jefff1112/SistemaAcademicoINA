// ============================================================
// src/components/Direccion/GestionNotasDireccion.jsx
// Gestion de notas por clase y periodo (misma funcion que
// Registro Academico / Docentes): escribe en resultados_periodos,
// la misma tabla que alimenta la boleta (P1..P4).
// ============================================================
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { notificarNotasActualizadas } from '../../services/notasSync';

// Componente principal: captura y guarda notas de estudiantes por clase y periodo.
const GestionNotasDireccion = () => {
    // Estados: catálogos, notas por estudiante/materia, selección de clase y periodo.
    const [clases, setClases] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [notas, setNotas] = useState({});
    const [notasOriginales, setNotasOriginales] = useState({});
    const [claseSeleccionada, setClaseSeleccionada] = useState('');
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
    const [cargando, setCargando] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Estados para modal
    // Estados del modal de edición con motivo: nota en edición, motivo y guardado.
    const [modalAbierto, setModalAbierto] = useState(false);
    const [notaEditando, setNotaEditando] = useState({
        idEstudiante: null,
        idMateria: null,
        notaActual: 0,
        nuevaNota: 0,
        estudianteNombre: '',
        materiaNombre: ''
    });
    const [motivoEdicion, setMotivoEdicion] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [notasEditadas, setNotasEditadas] = useState({});

    // Carga las clases y periodos al montar el componente.
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // Carga las materias de la clase cuando cambia la clase seleccionada.
    useEffect(() => {
        if (claseSeleccionada) {
            cargarMateriasDeClase();
        } else {
            setMaterias([]);
        }
    }, [claseSeleccionada]);

    // Carga estudiantes y notas cuando cambian la clase y el periodo.
    useEffect(() => {
        if (claseSeleccionada && periodoSeleccionado) {
            cargarEstudiantesYNotas();
        } else {
            setEstudiantes([]);
            setNotas({});
            setNotasOriginales({});
            setNotasEditadas({});
        }
    }, [claseSeleccionada, periodoSeleccionado]);

    // Obtiene en paralelo las clases y los periodos desde la API.
    const cargarDatosIniciales = async () => {
        setCargando(true);
        try {
            const [clasesRes, periodosRes] = await Promise.all([
                // Petición GET /clases para el selector de clase.
                API.get('/clases'),
                // Petición GET /periodosacademicos para el selector de periodo.
                API.get('/periodosacademicos')
            ]);
            setClases(clasesRes.data || []);
            setPeriodos(periodosRes.data || []);
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            mostrarMensaje('Error al cargar datos iniciales', 'error');
        } finally {
            setCargando(false);
        }
    };

    // Carga las materias asignadas a la clase seleccionada.
    const cargarMateriasDeClase = async () => {
        try {
            // Petición GET /materias/clase/{id} para listar las materias de la clase.
            const res = await API.get(`/materias/clase/${claseSeleccionada}`);
            setMaterias(res.data || []);
        } catch (error) {
            console.error('Error al cargar materias de la clase:', error);
            setMaterias([]);
            mostrarMensaje('Error al cargar materias de la clase', 'error');
        }
    };

    // Obtiene estudiantes, notas existentes y materias de la clase en paralelo.
    const cargarEstudiantesYNotas = async () => {
        if (!claseSeleccionada || !periodoSeleccionado) return;
        setCargando(true);

        try {
            const [estudiantesRes, notasRes, materiasRes] = await Promise.all([
                // Petición GET /estudiantes/clase/{id} para los estudiantes de la clase.
                API.get(`/estudiantes/clase/${claseSeleccionada}`),
                // Petición GET /resultados-periodos/clase/{id}/periodo/{id} para notas existentes.
                API.get(`/resultados-periodos/clase/${claseSeleccionada}/periodo/${periodoSeleccionado}`),
                // Petición GET /materias/clase/{id} para las materias de la clase.
                API.get(`/materias/clase/${claseSeleccionada}`)
            ]);
            const listaEstudiantes = estudiantesRes.data || [];
            const filasNotas = notasRes.data || [];
            const materiasClase = materiasRes.data || [];
            setEstudiantes(listaEstudiantes);
            setMaterias(materiasClase);

            const nuevasNotas = {};
            const originales = {};

            listaEstudiantes.forEach(e => {
                const notasEstudiante = {};
                materiasClase.forEach(m => {
                    const fila = filasNotas.find(f => f.idEstudiante === e.idEstudiante && f.idMateria === m.idMateria);
                    notasEstudiante[m.idMateria] = fila ? fila.notaAcumulada : null;
                });
                nuevasNotas[e.idEstudiante] = notasEstudiante;
                originales[e.idEstudiante] = { ...notasEstudiante };
            });

            setNotas(nuevasNotas);
            setNotasOriginales(originales);
            setNotasEditadas({});

            if (listaEstudiantes.length === 0) {
                mostrarMensaje('No hay estudiantes en esta clase', 'error');
            }
        } catch (error) {
            console.error('Error al cargar estudiantes y notas:', error);
            mostrarMensaje('Error al cargar estudiantes y notas', 'error');
        } finally {
            setCargando(false);
        }
    };

    // Guarda una nota individual en resultados_periodos y sincroniza los estados locales.
    const guardarNota = async (idEstudiante, idMateria, nota, motivo = '') => {
        try {
            // Convierte valores vacíos o inválidos a 0.
            const notaFinal = nota === null || isNaN(nota) ? 0 : parseFloat(nota);

            const data = {
                idEstudiante: idEstudiante,
                idMateria: idMateria,
                idPeriodo: parseInt(periodoSeleccionado),
                idClase: parseInt(claseSeleccionada),
                nota: notaFinal
            };

            // Petición POST /resultados-periodos para guardar la nota.
            await API.post('/resultados-periodos', data);

            // Actualiza la nota en los estados local y original para marcarla como guardada.
            setNotas(prev => ({
                ...prev,
                [idEstudiante]: {
                    ...prev[idEstudiante],
                    [idMateria]: notaFinal
                }
            }));

            setNotasOriginales(prev => ({
                ...prev,
                [idEstudiante]: {
                    ...prev[idEstudiante],
                    [idMateria]: notaFinal
                }
            }));

            // Quita la nota de la lista de cambios pendientes.
            setNotasEditadas(prev => {
                const key = `${idEstudiante}_${idMateria}`;
                const newState = { ...prev };
                delete newState[key];
                return newState;
            });

            // Notifica a otros módulos (ej. boletas) que hubo cambios en notas.
            notificarNotasActualizadas();
            mostrarMensaje('Nota guardada correctamente', 'success');
            return true;

        } catch (error) {
            console.error('Error al guardar nota:', error);
            mostrarMensaje('Error al guardar la nota', 'error');
            return false;
        }
    };

    // Actualiza la nota al digitar y la registra como pendiente si difiere de la original.
    const handleNotaChange = (idEstudiante, idMateria, value) => {
        let nota = null;
        if (value !== '' && value !== null && !isNaN(parseFloat(value))) {
            nota = Math.min(Math.max(parseFloat(value), 0), 10);
        }

        setNotas(prev => ({
            ...prev,
            [idEstudiante]: {
                ...prev[idEstudiante],
                [idMateria]: nota
            }
        }));

        const original = notasOriginales[idEstudiante]?.[idMateria] ?? null;
        if (nota !== original) {
            setNotasEditadas(prev => ({
                ...prev,
                [`${idEstudiante}_${idMateria}`]: nota
            }));
        } else {
            setNotasEditadas(prev => {
                const newState = { ...prev };
                delete newState[`${idEstudiante}_${idMateria}`];
                return newState;
            });
        }
    };

    // Guarda en lote todas las notas pendientes de edición.
    const guardarTodasLasNotas = async () => {
        const claves = Object.keys(notasEditadas);
        if (claves.length === 0) {
            mostrarMensaje('No hay notas pendientes', 'error');
            return;
        }

        setGuardando(true);
        let exitosas = 0;
        let fallidas = 0;

        for (const key of claves) {
            const [idEstudiante, idMateria] = key.split('_');
            const result = await guardarNota(parseInt(idEstudiante), parseInt(idMateria), notasEditadas[key]);
            if (result) exitosas++;
            else fallidas++;
        }

        setGuardando(false);
        if (fallidas > 0) {
            mostrarMensaje(`${exitosas} guardadas, ${fallidas} con error`, 'error');
        } else {
            mostrarMensaje(`${exitosas} notas guardadas correctamente`, 'success');
        }
    };

    // Abre el modal de edición con motivo para la nota seleccionada.
    const abrirModalEdicion = (idEstudiante, idMateria, notaActual, estudianteNombre, materiaNombre) => {
        setNotaEditando({
            idEstudiante,
            idMateria,
            notaActual: notaActual ?? 0,
            nuevaNota: notaActual ?? 0,
            estudianteNombre,
            materiaNombre
        });
        setMotivoEdicion('');
        setModalAbierto(true);
    };

    // Valida el motivo y guarda la nota editada desde el modal.
    const guardarNotaConMotivo = async () => {
        if (!motivoEdicion.trim()) {
            mostrarMensaje('Debe ingresar un motivo para la edición', 'error');
            return;
        }
        await guardarNota(notaEditando.idEstudiante, notaEditando.idMateria, notaEditando.nuevaNota, motivoEdicion);
        setModalAbierto(false);
        setMotivoEdicion('');
    };

    // Muestra un mensaje temporal al usuario y lo limpia después de 4 segundos.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Calcula el promedio de notas del estudiante en las materias de la clase.
    const calcularPromedio = (idEstudiante) => {
        const notasEstudiante = Object.values(notas[idEstudiante] || {}).filter(n => n !== null);
        if (notasEstudiante.length === 0) return 'N/A';
        const promedio = notasEstudiante.reduce((a, b) => a + b, 0) / notasEstudiante.length;
        return promedio.toFixed(2);
    };

    // Devuelve el color según el valor de la nota (aprobado, recuperación, reprobado).
    const getNotaColor = (nota) => {
        if (nota === null || nota === undefined) return '#6c757d';
        if (nota >= 6.0) return '#16a34a';
        if (nota >= 5.0) return '#e67e22';
        if (nota > 0) return '#dc2626';
        return '#6c757d';
    };

    // Devuelve la etiqueta de estado según el valor de la nota.
    const getNotaEstado = (nota) => {
        if (nota === null || nota === undefined) return 'Sin nota';
        if (nota >= 6.0) return 'Aprobado';
        if (nota >= 5.0) return 'Recuperación';
        if (nota > 0) return 'Reprobado';
        return 'Sin nota';
    };

    if (cargando) {
        return (
            <DashboardLayout title="Gestión de Notas">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestión de Notas - Dirección">
            {message && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
                    color: messageType === 'success' ? '#15803d' : '#b91c1c',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>{message}</span>
                    <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'inherit' }}>×</button>
                </div>
            )}

            <div className="card">
                <h3>Filtros de Consulta</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Clase</label>
                        <select
                            value={claseSeleccionada}
                            onChange={(e) => setClaseSeleccionada(e.target.value)}
                            className="form-control"
                        >
                            <option value="">Seleccionar</option>
                            {clases.map(c => (
                                <option key={c.idClase} value={c.idClase}>
                                    {c.nombreClase} - {c.seccion}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Periodo</label>
                        <select
                            value={periodoSeleccionado}
                            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                            className="form-control"
                        >
                            <option value="">Seleccionar</option>
                            {periodos.map(p => (
                                <option key={p.idPeriodo} value={p.idPeriodo}>
                                    {p.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {estudiantes.length > 0 && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>
                            Notas por Estudiante - Periodo {periodos.find(p => p.idPeriodo === parseInt(periodoSeleccionado))?.nombre || periodoSeleccionado}
                        </h3>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {Object.keys(notasEditadas).length > 0 && (
                                <button
                                    className="btn-primary"
                                    onClick={guardarTodasLasNotas}
                                    disabled={guardando}
                                    style={{ padding: '8px 16px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    {guardando ? 'Guardando...' : `Guardar (${Object.keys(notasEditadas).length})`}
                                </button>
                            )}
                            <span style={{ fontSize: '12px', fontWeight: '500', color: Object.keys(notasEditadas).length > 0 ? '#e67e22' : '#6b7280' }}>
                                {Object.keys(notasEditadas).length > 0 ? `${Object.keys(notasEditadas).length} pendiente(s)` : 'Sin cambios'}
                            </span>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Codigo</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Estudiante</th>
                                    {materias.map(m => (
                                        <th key={m.idMateria} style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }} title="Doble click para editar con motivo">
                                            {m.nombreMateria}
                                        </th>
                                    ))}
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Promedio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map((estudiante, index) => {
                                    const promedio = calcularPromedio(estudiante.idEstudiante);
                                    const promedioNum = parseFloat(promedio);
                                    return (
                                        <tr key={estudiante.idEstudiante} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '8px' }}>{index + 1}</td>
                                            <td style={{ padding: '8px' }}>{estudiante.codigoEstudiante}</td>
                                            <td style={{ padding: '8px' }}><strong>{estudiante.nombres} {estudiante.apellidos}</strong></td>

                                            {materias.map(materia => {
                                                const nota = notas[estudiante.idEstudiante]?.[materia.idMateria] ?? null;
                                                const key = `${estudiante.idEstudiante}_${materia.idMateria}`;
                                                const esEditada = notasEditadas.hasOwnProperty(key);
                                                const color = getNotaColor(nota);
                                                return (
                                                    <td key={materia.idMateria} style={{ padding: '4px' }}>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="10"
                                                            value={nota !== null ? nota : ''}
                                                            placeholder="—"
                                                            onChange={(e) => handleNotaChange(estudiante.idEstudiante, materia.idMateria, e.target.value)}
                                                            onDoubleClick={() => abrirModalEdicion(
                                                                estudiante.idEstudiante,
                                                                materia.idMateria,
                                                                nota,
                                                                `${estudiante.nombres} ${estudiante.apellidos}`,
                                                                materia.nombreMateria
                                                            )}
                                                            title="Doble click para editar con motivo"
                                                            style={{
                                                                width: '70px',
                                                                padding: '4px 6px',
                                                                border: esEditada ? '2px solid #e67e22' : `2px solid ${color}`,
                                                                borderRadius: '4px',
                                                                fontSize: '13px',
                                                                textAlign: 'center',
                                                                backgroundColor: esEditada ? '#fff7ed' : 'white',
                                                                outline: 'none'
                                                            }}
                                                        />
                                                    </td>
                                                );
                                            })}

                                            <td style={{ padding: '8px', fontWeight: 'bold', color: promedio !== 'N/A' && promedioNum >= 6 ? '#16a34a' : promedio !== 'N/A' && promedioNum >= 5 ? '#e67e22' : promedio !== 'N/A' ? '#dc2626' : '#6b7280' }}>
                                                {promedio}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="stats-grid" style={{ marginTop: '12px' }}>
                        <div className="stat-card">
                            <div className="stat-number">{estudiantes.length}</div>
                            <div className="stat-label">Total Estudiantes</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#16a34a' }}>
                                {estudiantes.filter(e => {
                                    const p = parseFloat(calcularPromedio(e.idEstudiante));
                                    return !isNaN(p) && p >= 6;
                                }).length}
                            </div>
                            <div className="stat-label">Aprobados</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#e67e22' }}>
                                {estudiantes.filter(e => {
                                    const p = parseFloat(calcularPromedio(e.idEstudiante));
                                    return !isNaN(p) && p >= 5 && p < 6;
                                }).length}
                            </div>
                            <div className="stat-label">Recuperación</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#dc2626' }}>
                                {estudiantes.filter(e => {
                                    const p = parseFloat(calcularPromedio(e.idEstudiante));
                                    return !isNaN(p) && p < 5;
                                }).length}
                            </div>
                            <div className="stat-label">Reprobados</div>
                        </div>
                    </div>
                </div>
            )}

            {claseSeleccionada && periodoSeleccionado && estudiantes.length === 0 && (
                <div className="card">
                    <p style={{ textAlign: 'center', color: '#6b7280' }}>
                        No hay estudiantes en esta clase para el periodo seleccionado
                    </p>
                </div>
            )}

            {modalAbierto && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999
                }} onClick={() => setModalAbierto(false)}>
                    <div style={{
                        background: 'white', borderRadius: '8px', maxWidth: '480px', width: '92%',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            padding: '14px 20px', borderBottom: '1px solid #e5e7eb',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: '#f8f9fa', borderRadius: '8px 8px 0 0'
                        }}>
                            <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Editar Nota</h5>
                            <button onClick={() => setModalAbierto(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>×</button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Estudiante</label>
                                    <div style={{ marginTop: '3px', padding: '6px 10px', background: '#f8f9fa', borderRadius: '4px', fontSize: '13px', border: '1px solid #e5e7eb' }}>
                                        {notaEditando.estudianteNombre}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Materia</label>
                                    <div style={{ marginTop: '3px', padding: '6px 10px', background: '#f8f9fa', borderRadius: '4px', fontSize: '13px', border: '1px solid #e5e7eb' }}>
                                        {notaEditando.materiaNombre}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Nota Actual</label>
                                    <div style={{ marginTop: '3px', padding: '6px 10px', background: '#fee2e2', borderRadius: '4px', color: '#b91c1c', fontWeight: '600', fontSize: '14px', border: '1px solid #fecaca' }}>
                                        {notaEditando.notaActual}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Nueva Nota</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={notaEditando.nuevaNota}
                                        onChange={(e) => setNotaEditando({ ...notaEditando, nuevaNota: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                                        className="form-control"
                                        style={{ marginTop: '3px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                                    Motivo de la Edición <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    value={motivoEdicion}
                                    onChange={(e) => setMotivoEdicion(e.target.value)}
                                    placeholder="Ej: Error de captura, Recuperación, etc."
                                    className="form-control"
                                    style={{ marginTop: '3px', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
                                <button
                                    className="btn-primary"
                                    onClick={guardarNotaConMotivo}
                                    style={{ padding: '8px 16px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Guardar Nota
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionNotasDireccion;
