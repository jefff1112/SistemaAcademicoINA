// CuadroAuxiliarDigital (Docente): cuadro de notas tipo Excel INA
// Sección MIXTA: Materias Básicas y Módulos
import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import calificacionesSubActividadesService from '../../services/calificacionesSubActividadesService';
import { useAuth } from '../../contexts/AuthContext';
import './CuadroAuxiliarDigital.css';

const CuadroAuxiliarDigital = () => {
    const { user } = useAuth();

    const [misDatos, setMisDatos] = useState(null);
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [cuadroCompleto, setCuadroCompleto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [notasEditadas, setNotasEditadas] = useState({});
    const [mostrarModalExportacion, setMostrarModalExportacion] = useState(false);

    const [filtros, setFiltros] = useState({
        idClase: '',
        tipo: '',
        idMateria: '',
        idEspecialidad: '',
        idPeriodo: ''
    });

    const debounceTimers = useRef({});

    useEffect(() => {
        cargarMisClases();
    }, []);

    const cargarMisClases = async () => {
        try {
            setLoading(true);
            const resp = await API.get('/actividades/mis-clases');
            setMisDatos(resp.data);
            setClases(resp.data.clases || []);
            setPeriodos(resp.data.periodos || []);

            const periodoActivo = (resp.data.periodos || []).find(p => p.estado === 'Activo');
            if (periodoActivo) {
                setFiltros(f => ({ ...f, idPeriodo: String(periodoActivo.idPeriodo) }));
            }
        } catch (error) {
            mostrarMensaje('error', 'Error al cargar tus asignaciones: ' + (error.response?.data?.mensaje || error.message));
        } finally {
            setLoading(false);
        }
    };

    // ============ CARGAR CUANDO CAMBIAN FILTROS ============
    useEffect(() => {
        const { idClase, tipo, idMateria, idEspecialidad, idPeriodo } = filtros;

        if (!idClase) {
            setCuadroCompleto(null);
            return;
        }
        if (!tipo) {
            setCuadroCompleto(null);
            return;
        }
        if (tipo === 'materia') {
            if (!idMateria || !idPeriodo) {
                setCuadroCompleto(null);
                return;
            }
        }
        if (tipo === 'modulo') {
            if (!idEspecialidad) {
                setCuadroCompleto(null);
                return;
            }
        }

        cargarCuadroCompleto();
        setNotasEditadas({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros]);

    const cargarCuadroCompleto = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('idClase', filtros.idClase);

            if (filtros.tipo === 'materia' && filtros.idMateria) {
                params.append('idMateria', filtros.idMateria);
                if (filtros.idPeriodo) params.append('idPeriodo', filtros.idPeriodo);
            } else if (filtros.tipo === 'modulo' && filtros.idEspecialidad) {
                params.append('idEspecialidad', filtros.idEspecialidad);
            }

            const resp = await API.get(`/CalificacionesSubActividades/cuadro-completo?${params.toString()}`);
            setCuadroCompleto(resp.data);
        } catch (error) {
            mostrarMensaje('error', 'Error al cargar cuadro: ' + (error.response?.data?.mensaje || error.message));
            setCuadroCompleto(null);
        } finally {
            setLoading(false);
        }
    };

    const handleNotaChange = useCallback((idEstudiante, idSubActividad, valor, esRecuperacion = false) => {
        const key = `${idEstudiante}_${idSubActividad}`;
        const nota = valor === '' ? null : parseFloat(valor);
        const maxEscala = cuadroCompleto?.escalaNota || 10;

        if (nota !== null && (isNaN(nota) || nota < 0 || nota > maxEscala)) {
            mostrarMensaje('warning', `La nota debe estar entre 0 y ${maxEscala}`);
            return;
        }

        setNotasEditadas(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || {}),
                [esRecuperacion ? 'notaRecuperacion' : 'nota']: nota,
                idEstudiante,
                idSubActividad
            }
        }));

        if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
        debounceTimers.current[key] = setTimeout(() => {
            guardarNotaAutomatica(idEstudiante, idSubActividad, nota, esRecuperacion);
        }, 800);
    }, [cuadroCompleto]);

    const guardarNotaAutomatica = async (idEstudiante, idSubActividad, nota, esRecuperacion) => {
        try {
            const key = `${idEstudiante}_${idSubActividad}`;
            const datosPrevios = notasEditadas[key] || {};
            const body = {
                idSubActividad,
                idEstudiante,
                nota: esRecuperacion ? (datosPrevios.nota ?? null) : nota,
                notaRecuperacion: esRecuperacion ? nota : (datosPrevios.notaRecuperacion ?? null)
            };

            await API.post('/CalificacionesSubActividades/guardar', body);
            setCuadroCompleto(prev => {
                if (!prev) return prev;
                const nuevasFilas = prev.filas.map(f => {
                    if (f.idEstudiante === idEstudiante) {
                        const nuevasNotas = { ...f.notasSubActividades };
                        nuevasNotas[idSubActividad] = nota;
                        return { ...f, notasSubActividades: nuevasNotas };
                    }
                    return f;
                });
                return { ...prev, filas: nuevasFilas };
            });
        } catch (error) {
            mostrarMensaje('error', 'Error guardando nota: ' + (error.response?.data?.mensaje || error.message));
        }
    };

    const handleRecuperacionPeriodo = async (idEstudiante, valor) => {
        const nota = valor === '' ? null : parseFloat(valor);
        const maxEscala = cuadroCompleto?.escalaNota || 10;
        if (nota !== null && (isNaN(nota) || nota < 0 || nota > maxEscala)) {
            mostrarMensaje('warning', `La nota de recuperación debe estar entre 0 y ${maxEscala}`);
            return;
        }

        try {
            await API.post('/CalificacionesSubActividades/guardar-recuperacion', {
                idEstudiante,
                idMateria: parseInt(filtros.idMateria) || 0,
                idClase: parseInt(filtros.idClase),
                idPeriodo: parseInt(filtros.idPeriodo),
                notaRecuperacion: nota,
                observacionRecuperacion: ''
            });
            mostrarMensaje('success', 'Recuperación guardada');
            await cargarCuadroCompleto();
        } catch (error) {
            mostrarMensaje('error', 'Error guardando recuperación: ' + (error.response?.data?.mensaje || error.message));
        }
    };

    const handleRecuperacionModulo = async (idEstudiante, idActividad, valor) => {
        const nota = valor === '' ? null : parseFloat(valor);
        if (nota !== null && (isNaN(nota) || nota < 0 || nota > 5)) {
            mostrarMensaje('warning', 'La nota de recuperación del módulo debe estar entre 0 y 5');
            return;
        }
        try {
            await API.post('/CalificacionesSubActividades/guardar-recuperacion-modulo', {
                idEstudiante,
                idActividad,
                idClase: parseInt(filtros.idClase),
                idMateria: parseInt(filtros.idMateria) || 0,
                idEspecialidad: parseInt(filtros.idEspecialidad) || 0,
                idPeriodo: parseInt(filtros.idPeriodo) || 0,
                notaRecuperacion: nota,
                observacion: ''
            });
            mostrarMensaje('success', 'Recuperación del módulo guardada');
            await cargarCuadroCompleto();
        } catch (error) {
            mostrarMensaje('error', 'Error guardando recuperación del módulo: ' + (error.response?.data?.mensaje || error.message));
        }
    };

    const handleGuardarTodas = async () => {
        const entries = Object.values(notasEditadas).filter(n => n.idSubActividad);
        if (entries.length === 0) {
            mostrarMensaje('warning', 'No hay cambios pendientes');
            return;
        }

        setSaving(true);
        try {
            const calificaciones = entries.map(n => ({
                idSubActividad: n.idSubActividad,
                idEstudiante: n.idEstudiante,
                nota: n.nota ?? null,
                notaRecuperacion: n.notaRecuperacion ?? null
            }));

            await API.post('/CalificacionesSubActividades/guardar-multiple', calificaciones);
            mostrarMensaje('success', `${entries.length} notas guardadas correctamente`);
            setNotasEditadas({});
            await cargarCuadroCompleto();
        } catch (error) {
            mostrarMensaje('error', 'Error guardando: ' + (error.response?.data?.mensaje || error.message));
        } finally {
            setSaving(false);
        }
    };

    const puedeExportar = () => {
        const rolesPermitidos = ['Administrador', 'Director', 'Sub Director', 'Registro Academico', 'Docente'];
        return rolesPermitidos.includes(user?.rol);
    };

    const claseActual = clases.find(c => c.idClase === parseInt(filtros.idClase));
    const materiasDisponibles = claseActual?.materias || [];
    const esEspecialidadClase = claseActual?.esEspecialidad || false;

    const handleExportar = async (tipo) => {
        try {
            setLoading(true);
            const anioActual = new Date().getFullYear();

            const idMateria = filtros.tipo === 'materia' ? filtros.idMateria : undefined;
            const idEspecialidad = filtros.tipo === 'modulo'
                ? (filtros.idEspecialidad || claseActual?.especialidad?.id)
                : undefined;

            const params = {
                idClase: filtros.idClase,
                idMateria: idMateria,
                idEspecialidad: idEspecialidad,
                idPeriodo: filtros.tipo === 'modulo' ? undefined : filtros.idPeriodo,
                anioLectivo: anioActual
            };

            if (tipo === 'consolidado') {
                params.esConsolidadoAnual = true;
                delete params.idClase;
                delete params.idMateria;
                delete params.idEspecialidad;
                delete params.idPeriodo;
            } else if (tipo === 'resumen-promedios') {
                params.soloPromedios = true;
            } else if (tipo === 'todas-periodos') {
                params.todosPeriodos = true;
                delete params.idPeriodo;
            } else if (tipo === 'todas-materias') {
                params.todasMaterias = true;
            } else if (tipo === 'clase-completa') {
                params.todasMaterias = true;
                params.todosPeriodos = true;
                delete params.idPeriodo;
            }

            await calificacionesSubActividadesService.exportarExcel(params);

            mostrarMensaje('success', 'Excel exportado correctamente');
            setMostrarModalExportacion(false);
        } catch (error) {
            mostrarMensaje('error', 'Error exportando: ' + (error.message || error.response?.data?.mensaje || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const mostrarMensaje = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const totalNotasEditadas = Object.keys(notasEditadas).length;

    const estaEnRecuperacion = (promedio) => {
        if (promedio === null || promedio === undefined) return false;
        const minimo = cuadroCompleto?.esModulo ? 4.00 : 6.00;
        return parseFloat(promedio) < minimo;
    };

    const equivalenteCualitativoModulo = (nota) => {
        if (nota === null || nota === undefined) return '';
        const n = parseFloat(nota);
        if (n >= 5.00) return 'Excelente';
        if (n >= 4.00) return 'Muy bueno';
        if (n >= 3.00) return 'Regular';
        if (n >= 2.00) return 'Deficiente';
        return 'Muy deficiente';
    };

    return (
        <DashboardLayout>
            <div className="cuadro-auxiliar-container">
                <div className="cuadro-header">
                    <h1>Cuadro Auxiliar de Notas</h1>
                    <p>Ingrese las notas directamente en las celdas del cuadro</p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })} className="btn-close-alert">×</button>
                    </div>
                )}

                <div className="filtros-container">
                    <div className="filtro-grupo">
                        <label>Clase:</label>
                        <select
                            value={filtros.idClase}
                            onChange={e => setFiltros({
                                idClase: e.target.value,
                                tipo: '',
                                idMateria: '',
                                idEspecialidad: '',
                                idPeriodo: filtros.idPeriodo
                            })}
                        >
                            <option value="">-- Seleccione clase --</option>
                            {clases.map(c => (
                                <option key={c.idClase} value={c.idClase}>
                                    {c.nivel} - {c.nombreClase} {c.seccion}
                                    {c.esEspecialidad ? ' [Especialidad]' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {claseActual && (
                        <div className="filtro-grupo">
                            <label>Tipo:</label>
                            <select
                                value={filtros.tipo}
                                onChange={e => {
                                    const tipo = e.target.value;
                                    setFiltros({
                                        ...filtros,
                                        tipo,
                                        idMateria: '',
                                        idEspecialidad: tipo === 'modulo' ? String(claseActual?.especialidad?.id ?? '') : ''
                                    });
                                }}
                            >
                                <option value="">-- Seleccione --</option>
                                {materiasDisponibles.length > 0 && (
                                    <option value="materia">Materias Básicas</option>
                                )}
                                {esEspecialidadClase && (
                                    <option value="modulo">Módulos (Especialidad)</option>
                                )}
                            </select>
                        </div>
                    )}

                    {filtros.tipo === 'materia' && (
                        <div className="filtro-grupo">
                            <label>Materia:</label>
                            <select
                                value={filtros.idMateria}
                                onChange={e => setFiltros({ ...filtros, idMateria: e.target.value })}
                            >
                                <option value="">-- Seleccione --</option>
                                {materiasDisponibles.map(m => (
                                    <option key={m.idMateria} value={m.idMateria}>{m.nombreMateria}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {filtros.tipo === 'modulo' && claseActual?.especialidad && (
                        <div className="filtro-grupo">
                            <label>Especialidad:</label>
                            <select
                                value={filtros.idEspecialidad}
                                onChange={e => setFiltros({ ...filtros, idEspecialidad: e.target.value })}
                            >
                                <option value="">-- Seleccione --</option>
                                <option value={claseActual.especialidad.id}>{claseActual.especialidad.nombre}</option>
                            </select>
                        </div>
                    )}

                    {filtros.tipo === 'materia' && (
                        <div className="filtro-grupo">
                            <label>Período:</label>
                            <select
                                value={filtros.idPeriodo}
                                onChange={e => setFiltros({ ...filtros, idPeriodo: e.target.value })}
                            >
                                <option value="">-- Seleccione --</option>
                                {periodos.map(p => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombrePeriodo} ({p.anioLectivo}) {p.estado === 'Activo' ? '✓' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {cuadroCompleto && (
                    <div className="acciones-container">
                        <button
                            className="btn btn-primary"
                            onClick={handleGuardarTodas}
                            disabled={saving || totalNotasEditadas === 0}
                        >
                            Guardar Cambios ({totalNotasEditadas})
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={cargarCuadroCompleto}
                            disabled={loading}
                        >
                            Recargar
                        </button>
                        {puedeExportar() && (
                            <button
                                className="btn btn-success"
                                onClick={() => setMostrarModalExportacion(true)}
                            >
                                Exportar Excel
                            </button>
                        )}
                    </div>
                )}

                <div className="cuadro-wrapper">
                    {loading && <div className="loading-overlay">Cargando...</div>}

                    {cuadroCompleto?.filas?.length > 0 && (
                        <div className="cuadro-ina">
                            <div className="header-ina">
                                <div className="titulo-instituto">{cuadroCompleto.header?.instituto || 'INSTITUTO NACIONAL DE APOPA'}</div>
                                <div className="subtitulo">
                                    <span>{cuadroCompleto.header?.titulo || 'CUADRO AUXILIAR'}</span>
                                    <span className="anio-lectivo">AÑO LECTIVO: {cuadroCompleto.header?.anioLectivo || new Date().getFullYear()}__</span>
                                </div>
                                <div className="datos-generales">
                                    <div className="dato"><strong>ASIGNATURA:</strong> {cuadroCompleto.header?.asignatura || '---'}</div>
                                    <div className="dato"><strong>SECCIÓN:</strong> {cuadroCompleto.header?.seccion || '---'}</div>
                                    {cuadroCompleto.header?.periodoNumero > 0 && (
                                        <div className="dato"><strong>PERIODO N°:</strong> {cuadroCompleto.header?.periodoNumero}</div>
                                    )}
                                    <div className="dato docente"><strong>DOCENTE:</strong> {cuadroCompleto.header?.docente || '---'}</div>
                                </div>
                            </div>

                            <div className="tabla-scroll">
                                <table className="tabla-cuadro">
                                    <thead>
                                        <tr>
                                            <th className="col-codigo" rowSpan="2">CÓDIGO</th>
                                            <th className="col-nombres" rowSpan="2">NOMBRES</th>
                                            {cuadroCompleto.header?.actividades?.map(act => (
                                                <th
                                                    key={act.idActividad}
                                                    colSpan={act.puedeEditar ? (act.columnas?.length || 1) : 1}
                                                    className={`col-actividad-header ${!act.puedeEditar ? 'sin-acceso' : ''}`}
                                                >
                                                    {act.nombre}
                                                    <div className="ponderacion-act">{act.puedeEditar ? `(${act.ponderacion}%)` : '(sin acceso)'}</div>
                                                </th>
                                            ))}
                                            <th className="col-promedio" rowSpan="2">PROMEDIO<br />FINAL</th>
                                            <th className="col-recuperacion" rowSpan="2">RECUPERACIÓN</th>
                                            <th className="col-observaciones" rowSpan="2">OBSERVACIONES</th>
                                        </tr>
                                        <tr>
                                            {cuadroCompleto.header?.actividades?.map(act =>
                                                act.puedeEditar
                                                    ? act.columnas?.map(col => (
                                                        <th
                                                            key={`${act.idActividad}_${col.idSubActividad}`}
                                                            className={`col-sub-header ${col.esVertical ? 'vertical' : ''} ${col.esPorcentajeFinal ? 'porcentaje' : ''} ${col.esRecuperacionModulo ? 'recuperacion' : ''}`}
                                                        >
                                                            {col.esPorcentajeFinal ? `${col.ponderacion}%` : col.nombre}
                                                        </th>
                                                    ))
                                                    : <th key={`${act.idActividad}_bloqueado`} className="col-sub-header sin-acceso">SIN ACCESO</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cuadroCompleto.filas.map(fila => {
                                            const enRecuperacion = estaEnRecuperacion(fila.promedioFinal);
                                            const equivalente = cuadroCompleto.esModulo
                                                ? equivalenteCualitativoModulo(fila.promedioFinal)
                                                : '';

                                            return (
                                                <tr key={fila.idEstudiante}>
                                                    <td className="col-codigo">{fila.codigo}</td>
                                                    <td className="col-nombres">{fila.apellidos}, {fila.nombres}</td>

                                                    {cuadroCompleto.header?.actividades?.map(act =>
                                                        act.puedeEditar
                                                            ? act.columnas?.map(col => {
                                                                const key = `${fila.idEstudiante}_${col.idSubActividad}`;
                                                                const editado = notasEditadas[key];
                                                                const notaActual = editado?.nota !== undefined
                                                                    ? editado.nota
                                                                    : (fila.notasSubActividades?.[col.idSubActividad] ?? null);

                                                                if (col.esPorcentajeFinal) {
                                                                    const notaActividad = fila.notasPorActividad?.[act.idActividad];
                                                                    return (
                                                                        <td key={key} className="col-porcentaje">
                                                                            <strong>{notaActividad !== null && notaActividad !== undefined ? notaActividad.toFixed(2) : '—'}</strong>
                                                                        </td>
                                                                    );
                                                                }

                                                                if (col.esRecuperacionModulo) {
                                                                    const recModulo = fila.recuperacionesPorModulo?.[act.idActividad];
                                                                    return (
                                                                        <td key={`${fila.idEstudiante}_rec_${act.idActividad}`} className="col-recuperacion-cell">
                                                                            <input
                                                                                type="number" min="0" max="5" step="0.1"
                                                                                value={recModulo ?? ''}
                                                                                onChange={e => handleRecuperacionModulo(fila.idEstudiante, act.idActividad, e.target.value)}
                                                                                className="input-nota input-recuperacion"
                                                                                placeholder="—"
                                                                            />
                                                                        </td>
                                                                    );
                                                                }

                                                                return (
                                                                    <td key={key} className={`col-nota ${editado ? 'editado' : ''}`}>
                                                                        <input
                                                                            type="number" min="0" max={cuadroCompleto.escalaNota || 10} step="0.1"
                                                                            value={notaActual ?? ''}
                                                                            onChange={e => handleNotaChange(fila.idEstudiante, col.idSubActividad, e.target.value)}
                                                                            className="input-nota"
                                                                            placeholder="—"
                                                                        />
                                                                    </td>
                                                                );
                                                            })
                                                            : <td key={`${fila.idEstudiante}_${act.idActividad}`} className="col-nota sin-acceso">—</td>
                                                    )}

                                                    <td className={`col-promedio-cell ${enRecuperacion ? 'en-recuperacion' : ''}`}>
                                                        <strong>
                                                            {fila.promedioFinal !== null && fila.promedioFinal !== undefined
                                                                ? parseFloat(fila.promedioFinal).toFixed(2)
                                                                : '—'}
                                                        </strong>
                                                        {cuadroCompleto.esModulo && equivalente && fila.promedioFinal !== null && (
                                                            <div className="equivalente">{equivalente}</div>
                                                        )}
                                                        {enRecuperacion && (
                                                            <div className="badge-recuperacion">RECUPERACIÓN</div>
                                                        )}
                                                    </td>

                                                    <td className="col-recuperacion-cell">
                                                        <input
                                                            type="number" min="0" max={cuadroCompleto.escalaNota || 10} step="0.1"
                                                            value={fila.recuperacion ?? ''}
                                                            onChange={e => handleRecuperacionPeriodo(fila.idEstudiante, e.target.value)}
                                                            className="input-nota input-recuperacion"
                                                            placeholder="—"
                                                        />
                                                    </td>

                                                    <td className="col-observaciones-cell">
                                                        <input type="text" value={fila.observaciones || ''} readOnly className="input-obs" placeholder="—" />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="resumen-cuadro">
                                <div className="resumen-item"><strong>Total Estudiantes:</strong> {cuadroCompleto.filas?.length || 0}</div>
                                <div className="resumen-item"><strong>Total Actividades:</strong> {cuadroCompleto.header?.actividades?.length || 0}</div>
                                <div className="resumen-item"><strong>Es Módulo:</strong> {cuadroCompleto.esModulo ? 'Sí' : 'No'}</div>
                                <div className="resumen-item">
                                    <strong>En Recuperación:</strong>{' '}
                                    {cuadroCompleto.filas.filter(f => estaEnRecuperacion(f.promedioFinal)).length} estudiante(s)
                                </div>
                            </div>

                            {cuadroCompleto.esModulo && (
                                <div className="leyenda-modulos">
                                    <strong>Escala de módulos:</strong> 5 = Excelente | 4 = Muy bueno | 3 o menos = Recuperación
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && !cuadroCompleto && filtros.idClase && (
                        <div className="empty-state">
                            <h3>Seleccione una opción</h3>
                            <p>
                                {!filtros.tipo
                                    ? 'Seleccione el tipo: Materias Básicas o Módulos'
                                    : filtros.tipo === 'materia' && (!filtros.idMateria || !filtros.idPeriodo)
                                        ? 'Seleccione materia y período'
                                        : filtros.tipo === 'modulo' && !filtros.idEspecialidad
                                            ? 'Seleccione la especialidad'
                                            : 'No se encontraron datos.'}
                            </p>
                        </div>
                    )}

                    {!filtros.idClase && (
                        <div className="empty-state">
                            <h3>Bienvenido al Cuadro Auxiliar</h3>
                            <p>Seleccione una clase y el tipo (Materias Básicas o Módulos).</p>
                        </div>
                    )}
                </div>

                {mostrarModalExportacion && (
                    <div className="modal-overlay" onClick={() => setMostrarModalExportacion(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Exportar a Excel</h3>
                                <button onClick={() => setMostrarModalExportacion(false)} className="btn-close">×</button>
                            </div>
                            <div className="modal-body">
                                <button className="btn-export" onClick={() => handleExportar('resumen-promedios')}>
                                    1. Resumen de Promedios (solo notas finales)
                                </button>
                                <button className="btn-export" onClick={() => handleExportar('clase-materia-periodo')}>
                                    2. Clase + Materia + 1 Período (con actividades)
                                </button>
                                <button className="btn-export" onClick={() => handleExportar('todas-periodos')}>
                                    3. Clase + Materia + Todos los Períodos (con actividades)
                                </button>
                                <button className="btn-export" onClick={() => handleExportar('todas-materias')}>
                                    4. Clase + Todas las Materias + 1 Período (con actividades)
                                </button>
                                <button className="btn-export" onClick={() => handleExportar('clase-completa')}>
                                    5. Clase + Todas las Materias + Todos los Períodos (con actividades)
                                </button>
                                <button className="btn-export" onClick={() => handleExportar('consolidado')}>
                                    6. Consolidado Anual (por Nivel)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CuadroAuxiliarDigital;