// Componente ActivityManager (Docente): Gestión visual tipo Excel de actividades y sub-actividades
// Diseño en formato cuadro con validación 100% y soporte para autoevaluación/coevaluación
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { notificarNotasActualizadas } from '../../services/notasSync';
import { useAuth } from '../../contexts/AuthContext';
import './ActivityManager.css';

function ActivityManager({ 
    idClase: idClaseProp, 
    idMateria: idMateriaProp, 
    idEspecialidad: idEspecialidadProp,
    onActividadesChange,
    soloLectura = false 
}) {
    const { user } = useAuth();

    // Obtener idDocente del usuario logueado si es docente
    const [idDocente, setIdDocente] = useState(0);
    useEffect(() => {
        if (user && user.rol === 'Docente' && user.codigo) {
            API.get('/docentes').then(res => {
                const docente = (res.data || []).find(d => d.codigoDocente === user.codigo || d.correo === user.codigo);
                if (docente) setIdDocente(docente.idDocente);
            }).catch(() => {});
        }
    }, [user]);

    // Filtros internos si no vienen por props
    const [idClase, setIdClase] = useState(idClaseProp || '');
    const [idMateria, setIdMateria] = useState(idMateriaProp || '');
    const [idEspecialidad, setIdEspecialidad] = useState(idEspecialidadProp || '');
    const [idPeriodo, setIdPeriodo] = useState('');

    const [actividades, setActividades] = useState([]);
    const [clases, setClases] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');

    // Estados para modales
    const [mostrarModalActividad, setMostrarModalActividad] = useState(false);
    const [mostrarModalSubActividad, setMostrarModalSubActividad] = useState(false);
    const [actividadPadre, setActividadPadre] = useState(null);
    const [editandoActividad, setEditandoActividad] = useState(null);
    const [editandoSubActividad, setEditandoSubActividad] = useState(null);

    // Formulario de actividad
    const [formActividad, setFormActividad] = useState({
        nombre: '',
        tipoActividad: 'Actividad', // 'Actividad' o 'Modulo'
        ponderacion: 0,
        fechaInicio: '',
        fechaFin: '',
        observaciones: '',
        incluirAutoevaluacion: false,
        ponderacionAutoevaluacion: 0,
        incluirCoevaluacion: false,
        ponderacionCoevaluacion: 0
    });

    // Formulario de sub-actividad
    const [formSubActividad, setFormSubActividad] = useState({
        nombre: '',
        tipoSubActividad: 'Subactividad',
        ponderacion: 0
    });

    const [erroresValidacion, setErroresValidacion] = useState({});

    // Cargar catálogos al montar
    useEffect(() => {
        cargarCatalogos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cargarCatalogos = async () => {
        try {
            const [clasesRes, periodosRes, especialidadesRes] = await Promise.all([
                API.get('/clases'),
                API.get('/periodosacademicos'),
                API.get('/especialidades').catch(() => ({ data: [] }))
            ]);
            setClases(clasesRes.data || []);
            setPeriodos(periodosRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
            
            const activo = periodosRes.data.find(p => p.estado === 'Activo');
            if (activo && !idPeriodo) {
                setIdPeriodo(String(activo.idPeriodo));
            }
        } catch (err) {
            console.error('Error cargando catálogos:', err);
        }
    };

    // Cargar materias cuando cambia la clase
    useEffect(() => {
        if (idClase) {
            cargarMateriasDeClase();
        } else {
            setMaterias([]);
            setIdMateria('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idClase]);

    const cargarMateriasDeClase = async () => {
        try {
            const res = await API.get('/materias/clase/' + idClase);
            setMaterias(res.data || []);
        } catch (err) {
            console.error('Error cargando materias:', err);
            setMaterias([]);
        }
    };

    // Cargar estructura completa al cambiar filtros
    useEffect(() => {
        if (idClase && (idMateria || idEspecialidad)) {
            cargarEstructura();
        } else {
            setActividades([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idClase, idMateria, idEspecialidad]);

    const cargarEstructura = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                idClase: idClase.toString()
            });
            
            if (idMateria) {
                params.append('idMateria', idMateria.toString());
            }
            if (idEspecialidad) {
                params.append('idEspecialidad', idEspecialidad.toString());
            }
            if (idDocente) {
                params.append('idDocente', idDocente.toString());
            }

            const res = await API.get('/actividades/estructura-completa?' + params.toString());
            setActividades(res.data.actividades || []);
            if (onActividadesChange) onActividadesChange(res.data.actividades || []);
        } catch (err) {
            console.error('Error cargando estructura:', err);
            setError('Error al cargar actividades');
        } finally {
            setLoading(false);
        }
    };

    // Calcular totales y validaciones
    const calcularTotales = () => {
        const totalActividades = actividades.reduce((sum, a) => sum + (a.ponderacion || 0), 0);
        const actividadesConValidacion = actividades.map(act => {
            const totalSub = act.subActividades?.reduce((sum, sa) => sum + (sa.ponderacion || 0), 0) || 0;
            const ponderacionValida = Math.abs(totalSub - 100) < 0.01;
            return { ...act, totalSub, ponderacionValida };
        });
        const totalActividadesValido = Math.abs(totalActividades - 100) < 0.01;
        
        return { totalActividades, actividadesConValidacion, totalActividadesValido };
    };

    // Validar formulario de actividad
    const validarFormActividad = () => {
        const errores = {};
        const { totalActividades } = calcularTotales();
        const ponderacionNueva = formActividad.ponderacion || 0;
        
        if (!formActividad.nombre.trim()) errores.nombre = 'Nombre requerido';
        if (ponderacionNueva <= 0) errores.ponderacion = 'Ponderación debe ser > 0';
        
        // Calcular ponderación disponible
        let ponderacionDisponible = 100 - totalActividades;
        if (editandoActividad) {
            ponderacionDisponible += editandoActividad.ponderacion;
        }
        
        if (ponderacionNueva > ponderacionDisponible + 0.01) {
            errores.ponderacion = `Excede 100%. Disponible: ${ponderacionDisponible.toFixed(2)}%`;
        }

        // Validar que autoevaluación + coevaluación no excedan ponderación total
        const ponderacionAutoCoe = (formActividad.ponderacionAutoevaluacion || 0) + (formActividad.ponderacionCoevaluacion || 0);
        if (ponderacionAutoCoe > ponderacionNueva) {
            errores.autoCoevaluacion = `Autoevaluación + Coevaluación (${ponderacionAutoCoe}%) no puede exceder ponderación total (${ponderacionNueva}%)`;
        }

        setErroresValidacion(errores);
        return Object.keys(errores).length === 0;
    };

    // Validar formulario de sub-actividad
    const validarFormSubActividad = () => {
        const errores = {};
        
        if (!formSubActividad.nombre.trim()) errores.nombre = 'Nombre requerido';
        if (formSubActividad.ponderacion <= 0) errores.ponderacion = 'Ponderación debe ser > 0';

        // Validar que no exceda 100% de la actividad padre
        if (actividadPadre) {
            const totalSubsActuales = actividadPadre.subActividades
                ?.filter(sa => !editandoSubActividad || sa.idSubActividad !== editandoSubActividad.idSubActividad)
                .reduce((sum, sa) => sum + (sa.ponderacion || 0), 0) || 0;
            
            // No validar si es tipo Porcentaje (que tiene ponderación 0)
            if (formSubActividad.ponderacion > 0 && totalSubsActuales + formSubActividad.ponderacion > 100.01) {
                errores.ponderacion = `Excede 100%. Disponible: ${(100 - totalSubsActuales).toFixed(2)}%`;
            }
        }

        setErroresValidacion(errores);
        return Object.keys(errores).length === 0;
    };

    // Abrir modal de crear actividad
    const abrirModalCrearActividad = () => {
        if (actividades.length >= 10) {
            setError('Máximo 10 actividades permitidas');
            return;
        }
        const { totalActividades } = calcularTotales();
        const ponderacionSugerida = Math.max(0, 100 - totalActividades);
        
        setEditandoActividad(null);
        setFormActividad({
            nombre: '',
            tipoActividad: idEspecialidad ? 'Modulo' : 'Actividad',
            ponderacion: ponderacionSugerida,
            fechaInicio: new Date().toISOString().split('T')[0],
            fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            observaciones: '',
            incluirAutoevaluacion: false,
            ponderacionAutoevaluacion: 0,
            incluirCoevaluacion: false,
            ponderacionCoevaluacion: 0
        });
        setErroresValidacion({});
        setMostrarModalActividad(true);
    };

    // Abrir modal de editar actividad
    const abrirModalEditarActividad = (actividad) => {
        setEditandoActividad(actividad);
        setFormActividad({
            nombre: actividad.nombreActividad,
            tipoActividad: actividad.tipoActividad,
            ponderacion: actividad.ponderacion,
            fechaInicio: actividad.fechaPublicacion?.split('T')[0] || '',
            fechaFin: actividad.fechaLimite?.split('T')[0] || '',
            observaciones: actividad.descripcion || '',
            incluirAutoevaluacion: actividad.subActividades?.some(sa => sa.tipoSubActividad === 'Autoevaluacion') || false,
            ponderacionAutoevaluacion: actividad.subActividades?.find(sa => sa.tipoSubActividad === 'Autoevaluacion')?.ponderacion || 0,
            incluirCoevaluacion: actividad.subActividades?.some(sa => sa.tipoSubActividad === 'Coevaluacion') || false,
            ponderacionCoevaluacion: actividad.subActividades?.find(sa => sa.tipoSubActividad === 'Coevaluacion')?.ponderacion || 0
        });
        setErroresValidacion({});
        setMostrarModalActividad(true);
    };

    // Abrir modal de crear sub-actividad
    const abrirModalCrearSubActividad = (actividad) => {
        setActividadPadre(actividad);
        setEditandoSubActividad(null);
        
        const totalSubs = actividad.subActividades?.reduce((sum, sa) => sum + (sa.ponderacion || 0), 0) || 0;
        const ponderacionSugerida = Math.max(0, 100 - totalSubs);
        
        setFormSubActividad({
            nombre: '',
            tipoSubActividad: 'Subactividad',
            ponderacion: ponderacionSugerida
        });
        setErroresValidacion({});
        setMostrarModalSubActividad(true);
    };

    // Abrir modal de editar sub-actividad
    const abrirModalEditarSubActividad = (actividad, subActividad) => {
        setActividadPadre(actividad);
        setEditandoSubActividad(subActividad);
        setFormSubActividad({
            nombre: subActividad.nombreSubActividad,
            tipoSubActividad: subActividad.tipoSubActividad,
            ponderacion: subActividad.ponderacion
        });
        setErroresValidacion({});
        setMostrarModalSubActividad(true);
    };

    // Guardar actividad
    const guardarActividad = async () => {
        if (!validarFormActividad()) return;

        setLoading(true);
        setError('');
        
        try {
            const data = {
                idClase: parseInt(idClase),
                idMateria: idMateria ? parseInt(idMateria) : null,
                idEspecialidad: idEspecialidad ? parseInt(idEspecialidad) : null,
                nombreActividad: formActividad.nombre,
                tipoActividad: formActividad.tipoActividad,
                ponderacion: formActividad.ponderacion,
                fechaPublicacion: formActividad.fechaInicio,
                fechaLimite: formActividad.fechaFin,
                descripcion: formActividad.observaciones,
                incluirAutoevaluacion: formActividad.incluirAutoevaluacion,
                ponderacionAutoevaluacion: formActividad.ponderacionAutoevaluacion,
                incluirCoevaluacion: formActividad.incluirCoevaluacion,
                ponderacionCoevaluacion: formActividad.ponderacionCoevaluacion
            };
            
            if (editandoActividad) {
                await API.put('/actividades/' + editandoActividad.idActividad, data);
                setMensajeExito('Actividad actualizada correctamente');
            } else {
                await API.post('/actividades/crear', data);
                setMensajeExito('Actividad creada correctamente');
            }

            setMostrarModalActividad(false);
            await cargarEstructura();
            notificarNotasActualizadas();
            
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (err) {
            console.error('Error guardando:', err);
            setError(err.response?.data?.mensaje || 'Error al guardar actividad');
        } finally {
            setLoading(false);
        }
    };

    // Guardar sub-actividad
    const guardarSubActividad = async () => {
        if (!validarFormSubActividad()) return;

        setLoading(true);
        setError('');
        
        try {
            const data = {
                idActividad: actividadPadre.idActividad,
                nombreSubActividad: formSubActividad.nombre,
                tipoSubActividad: formSubActividad.tipoSubActividad,
                ponderacion: formSubActividad.ponderacion,
                orden: (actividadPadre.subActividades?.length || 0) + 1
            };

            if (editandoSubActividad) {
                await API.put('/actividades/subactividad/' + editandoSubActividad.idSubActividad, data);
                setMensajeExito('Sub-actividad actualizada correctamente');
            } else {
                await API.post('/actividades/' + actividadPadre.idActividad + '/crear-subactividad', data);
                setMensajeExito('Sub-actividad creada correctamente');
            }

            setMostrarModalSubActividad(false);
            await cargarEstructura();
            notificarNotasActualizadas();
            
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (err) {
            console.error('Error guardando:', err);
            setError(err.response?.data?.mensaje || 'Error al guardar sub-actividad');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar actividad
    const eliminarActividad = async (id) => {
        if (!window.confirm('¿Eliminar esta actividad? Las ponderaciones se redistribuirán automáticamente.')) return;
        
        try {
            await API.delete('/actividades/' + id);
            setMensajeExito('Actividad eliminada correctamente');
            await cargarEstructura();
            notificarNotasActualizadas();
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (err) {
            setError('Error al eliminar actividad');
        }
    };

    // Eliminar sub-actividad
    const eliminarSubActividad = async (idSubActividad) => {
        if (!window.confirm('¿Eliminar esta sub-actividad?')) return;
        
        try {
            await API.delete('/actividades/subactividad/' + idSubActividad);
            setMensajeExito('Sub-actividad eliminada correctamente');
            await cargarEstructura();
            notificarNotasActualizadas();
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (err) {
            setError('Error al eliminar sub-actividad');
        }
    };

    // Crear estructura predeterminada INA
    const crearEstructuraPredeterminada = async () => {
        if (!idClase || (!idMateria && !idEspecialidad)) {
            setError('Debe seleccionar clase y materia/especialidad primero');
            return;
        }

        if (!window.confirm('¿Crear estructura predeterminada INA? Esto creará 3 actividades con sub-actividades predefinidas.')) return;

        setLoading(true);
        setError('');
        
        try {
            const data = {
                idClase: parseInt(idClase),
                idMateria: idMateria ? parseInt(idMateria) : null,
                idEspecialidad: idEspecialidad ? parseInt(idEspecialidad) : null,
                incluirAutoevaluacion: true,
                incluirCoevaluacion: true
            };

            await API.post('/actividades/crear-estructura-predeterminada', data);
            setMensajeExito('Estructura predeterminada INA creada correctamente');
            await cargarEstructura();
            notificarNotasActualizadas();
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (err) {
            console.error('Error creando estructura:', err);
            setError(err.response?.data?.mensaje || 'Error al crear estructura predeterminada');
        } finally {
            setLoading(false);
        }
    };

    // Redistribuir ponderaciones
    const redistribuirPonderaciones = async () => {
        if (!window.confirm('¿Redistribuir ponderaciones proporcionalmente para que sumen 100%?')) return;

        try {
            await API.post('/actividades/redistribuir-ponderaciones', {
                idMateria: idMateria ? parseInt(idMateria) : null,
                idEspecialidad: idEspecialidad ? parseInt(idEspecialidad) : null,
                idClase: parseInt(idClase),
                idDocente: idDocente || undefined
            });
            setMensajeExito('Ponderaciones redistribuidas correctamente');
            await cargarEstructura();
            notificarNotasActualizadas();
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (err) {
            setError('Error al redistribuir ponderaciones');
        }
    };

    const { totalActividades, actividadesConValidacion, totalActividadesValido } = calcularTotales();

    return (
        <div className="activity-manager-container">
            <div className="activity-manager-header">
                <h2>📋 Gestión de Actividades y Sub-actividades</h2>
                <p className="subtitle">Configure la estructura de evaluación antes de ingresar notas</p>
            </div>

            {/* Mensajes */}
            {error && (
                <div className="alert alert-error">
                    <span>❌ {error}</span>
                    <button onClick={() => setError('')}>✕</button>
                </div>
            )}
            {mensajeExito && (
                <div className="alert alert-success">
                    <span>✅ {mensajeExito}</span>
                    <button onClick={() => setMensajeExito('')}>✕</button>
                </div>
            )}

            {/* Filtros */}
            {!idClaseProp && (
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Clase:</label>
                        <select value={idClase} onChange={(e) => setIdClase(e.target.value)}>
                            <option value="">-- Seleccione --</option>
                            {clases.map(c => (
                                <option key={c.idClase} value={c.idClase}>{c.nombreClase}</option>
                            ))}
                        </select>
                    </div>

                    {idClase && !idEspecialidadProp && (
                        <div className="filter-group">
                            <label>Materia:</label>
                            <select value={idMateria} onChange={(e) => setIdMateria(e.target.value)}>
                                <option value="">-- Seleccione --</option>
                                {materias.map(m => (
                                    <option key={m.idMateria} value={m.idMateria}>{m.nombreMateria}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!idMateriaProp && !idMateria && (
                        <div className="filter-group">
                            <label>Especialidad (Módulos):</label>
                            <select value={idEspecialidad} onChange={(e) => setIdEspecialidad(e.target.value)}>
                                <option value="">-- Seleccione --</option>
                                {especialidades.map(e => (
                                    <option key={e.idEspecialidad} value={e.idEspecialidad}>{e.nombreEspecialidad}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* Botones de acción */}
            {idClase && (idMateria || idEspecialidad) && !soloLectura && (
                <div className="action-buttons">
                    <button className="btn btn-primary" onClick={crearEstructuraPredeterminada}>
                        🎯 Crear Estructura Predeterminada INA
                    </button>
                    <button className="btn btn-success" onClick={abrirModalCrearActividad}>
                        ➕ Crear Actividad
                    </button>
                    <button className="btn btn-warning" onClick={redistribuirPonderaciones}>
                        ⚖️ Redistribuir Ponderaciones
                    </button>
                </div>
            )}

            {/* Resumen de validación */}
            {actividades.length > 0 && (
                <div className={`validation-summary ${totalActividadesValido ? 'valid' : 'invalid'}`}>
                    <div className="validation-item">
                        <span className="validation-label">Total Actividades:</span>
                        <span className={`validation-value ${totalActividadesValido ? 'valid' : 'invalid'}`}>
                            {totalActividades.toFixed(2)}% {totalActividadesValido ? '✓' : '✗'}
                        </span>
                    </div>
                    {!totalActividadesValido && (
                        <div className="validation-warning">
                            ⚠️ Las actividades deben sumar exactamente 100%
                        </div>
                    )}
                </div>
            )}

            {/* Cuadro tipo Excel de actividades */}
            {loading ? (
                <div className="loading">Cargando...</div>
            ) : actividades.length === 0 ? (
                <div className="empty-state">
                    <p>📭 No hay actividades configuradas</p>
                    {idClase && (idMateria || idEspecialidad) && !soloLectura && (
                        <p>Haga clic en "Crear Estructura Predeterminada INA" o "Crear Actividad" para comenzar</p>
                    )}
                </div>
            ) : (
                <div className="activities-table-container">
                    <table className="activities-table">
                        <thead>
                            <tr>
                                <th className="header-main">#</th>
                                <th className="header-main">Actividad / Módulo</th>
                                <th className="header-main">Tipo</th>
                                <th className="header-main">Ponderación</th>
                                <th className="header-main">Sub-actividades</th>
                                <th className="header-main">Total Sub</th>
                                <th className="header-main">Estado</th>
                                {!soloLectura && <th className="header-main">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {actividadesConValidacion.map((act, idx) => (
                                <React.Fragment key={act.idActividad}>
                                    {/* Fila principal de actividad */}
                                    <tr className="activity-row">
                                        <td className="cell-number">{idx + 1}</td>
                                        <td className="cell-name">
                                            <strong>{act.nombreActividad}</strong>
                                            {act.descripcion && (
                                                <div className="activity-description">{act.descripcion}</div>
                                            )}
                                        </td>
                                        <td className="cell-type">
                                            <span className={`badge ${act.tipoActividad === 'Modulo' ? 'badge-module' : 'badge-activity'}`}>
                                                {act.tipoActividad}
                                            </span>
                                        </td>
                                        <td className="cell-ponderacion">
                                            <span className="ponderacion-value">{act.ponderacion.toFixed(2)}%</span>
                                        </td>
                                        <td className="cell-sub-count">
                                            {act.subActividades?.length || 0} sub-actividades
                                        </td>
                                        <td className={`cell-total ${act.ponderacionValida ? 'valid' : 'invalid'}`}>
                                            {act.totalSub.toFixed(2)}%
                                        </td>
                                        <td className="cell-status">
                                            {act.ponderacionValida ? (
                                                <span className="status-valid">✓ Válido</span>
                                            ) : (
                                                <span className="status-invalid">✗ Inválido</span>
                                            )}
                                        </td>
                                        {!soloLectura && (
                                            <td className="cell-actions">
                                                <button 
                                                    className="btn-icon btn-edit"
                                                    onClick={() => abrirModalEditarActividad(act)}
                                                    title="Editar actividad"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className="btn-icon btn-add-sub"
                                                    onClick={() => abrirModalCrearSubActividad(act)}
                                                    title="Agregar sub-actividad"
                                                >
                                                    ➕
                                                </button>
                                                <button 
                                                    className="btn-icon btn-delete"
                                                    onClick={() => eliminarActividad(act.idActividad)}
                                                    title="Eliminar actividad"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        )}
                                    </tr>

                                    {/* Filas de sub-actividades */}
                                    {act.subActividades?.map((sub, subIdx) => (
                                        <tr key={sub.idSubActividad} className={`sub-activity-row ${sub.tipoSubActividad.toLowerCase()}`}>
                                            <td className="cell-sub-number"></td>
                                            <td className="cell-sub-name">
                                                <span className="sub-indicator">↳</span>
                                                {sub.nombreSubActividad}
                                            </td>
                                            <td className="cell-sub-type">
                                                <span className={`badge badge-${sub.tipoSubActividad.toLowerCase()}`}>
                                                    {sub.tipoSubActividad}
                                                </span>
                                            </td>
                                            <td className="cell-sub-ponderacion">
                                                {sub.ponderacion.toFixed(2)}%
                                            </td>
                                            <td className="cell-sub-order">
                                                Orden: {subIdx + 1}
                                            </td>
                                            <td colSpan={2}></td>
                                            {!soloLectura && (
                                                <td className="cell-actions">
                                                    <button 
                                                        className="btn-icon btn-edit-small"
                                                        onClick={() => abrirModalEditarSubActividad(act, sub)}
                                                        title="Editar sub-actividad"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        className="btn-icon btn-delete-small"
                                                        onClick={() => eliminarSubActividad(sub.idSubActividad)}
                                                        title="Eliminar sub-actividad"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}

                                    {/* Botón para agregar más sub-actividades */}
                                    {!soloLectura && act.ponderacionValida && (
                                        <tr className="add-sub-row">
                                            <td colSpan={6}></td>
                                            <td colSpan={2}>
                                                <button 
                                                    className="btn btn-small btn-add"
                                                    onClick={() => abrirModalCrearSubActividad(act)}
                                                >
                                                    + Agregar Sub-actividad
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Actividad */}
            {mostrarModalActividad && (
                <div className="modal-overlay" onClick={() => setMostrarModalActividad(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editandoActividad ? 'Editar Actividad' : 'Crear Nueva Actividad'}</h3>
                            <button className="btn-close" onClick={() => setMostrarModalActividad(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nombre de la Actividad: *</label>
                                <input
                                    type="text"
                                    value={formActividad.nombre}
                                    onChange={(e) => setFormActividad({...formActividad, nombre: e.target.value})}
                                    className={erroresValidacion.nombre ? 'input-error' : ''}
                                />
                                {erroresValidacion.nombre && <span className="error-text">{erroresValidacion.nombre}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo: *</label>
                                    <select
                                        value={formActividad.tipoActividad}
                                        onChange={(e) => setFormActividad({...formActividad, tipoActividad: e.target.value})}
                                    >
                                        <option value="Actividad">Actividad</option>
                                        <option value="Modulo">Módulo (Especialidad)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Ponderación (%): *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={formActividad.ponderacion}
                                        onChange={(e) => setFormActividad({...formActividad, ponderacion: parseFloat(e.target.value) || 0})}
                                        className={erroresValidacion.ponderacion ? 'input-error' : ''}
                                    />
                                    {erroresValidacion.ponderacion && <span className="error-text">{erroresValidacion.ponderacion}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha Inicio:</label>
                                    <input
                                        type="date"
                                        value={formActividad.fechaInicio}
                                        onChange={(e) => setFormActividad({...formActividad, fechaInicio: e.target.value})}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Fecha Fin:</label>
                                    <input
                                        type="date"
                                        value={formActividad.fechaFin}
                                        onChange={(e) => setFormActividad({...formActividad, fechaFin: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Observaciones:</label>
                                <textarea
                                    value={formActividad.observaciones}
                                    onChange={(e) => setFormActividad({...formActividad, observaciones: e.target.value})}
                                    rows="3"
                                />
                            </div>

                            <div className="divider">
                                <h4>Opciones Avanzadas</h4>
                            </div>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formActividad.incluirAutoevaluacion}
                                        onChange={(e) => setFormActividad({...formActividad, incluirAutoevaluacion: e.target.checked})}
                                    />
                                    <span>Incluir Autoevaluación</span>
                                </label>
                                {formActividad.incluirAutoevaluacion && (
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={formActividad.ponderacion}
                                        value={formActividad.ponderacionAutoevaluacion}
                                        onChange={(e) => setFormActividad({...formActividad, ponderacionAutoevaluacion: parseFloat(e.target.value) || 0})}
                                        placeholder="Ponderación %"
                                        className="input-inline"
                                    />
                                )}
                            </div>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formActividad.incluirCoevaluacion}
                                        onChange={(e) => setFormActividad({...formActividad, incluirCoevaluacion: e.target.checked})}
                                    />
                                    <span>Incluir Coevaluación</span>
                                </label>
                                {formActividad.incluirCoevaluacion && (
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={formActividad.ponderacion}
                                        value={formActividad.ponderacionCoevaluacion}
                                        onChange={(e) => setFormActividad({...formActividad, ponderacionCoevaluacion: parseFloat(e.target.value) || 0})}
                                        placeholder="Ponderación %"
                                        className="input-inline"
                                    />
                                )}
                            </div>

                            {erroresValidacion.autoCoevaluacion && (
                                <span className="error-text">{erroresValidacion.autoCoevaluacion}</span>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setMostrarModalActividad(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={guardarActividad} disabled={loading}>
                                {loading ? 'Guardando...' : (editandoActividad ? 'Actualizar' : 'Crear')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Sub-actividad */}
            {mostrarModalSubActividad && (
                <div className="modal-overlay" onClick={() => setMostrarModalSubActividad(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editandoSubActividad ? 'Editar Sub-actividad' : 'Crear Sub-actividad'}</h3>
                            <button className="btn-close" onClick={() => setMostrarModalSubActividad(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="info-box">
                                <strong>Actividad padre:</strong> {actividadPadre?.nombreActividad}
                            </div>

                            <div className="form-group">
                                <label>Nombre de la Sub-actividad: *</label>
                                <input
                                    type="text"
                                    value={formSubActividad.nombre}
                                    onChange={(e) => setFormSubActividad({...formSubActividad, nombre: e.target.value})}
                                    className={erroresValidacion.nombre ? 'input-error' : ''}
                                />
                                {erroresValidacion.nombre && <span className="error-text">{erroresValidacion.nombre}</span>}
                            </div>

                            <div className="form-group">
                                <label>Tipo: *</label>
                                <select
                                    value={formSubActividad.tipoSubActividad}
                                    onChange={(e) => setFormSubActividad({...formSubActividad, tipoSubActividad: e.target.value})}
                                >
                                    <option value="Subactividad">Subactividad</option>
                                    <option value="Autoevaluacion">Autoevaluación</option>
                                    <option value="Coevaluacion">Coevaluación</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ponderación (%): *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formSubActividad.ponderacion}
                                    onChange={(e) => setFormSubActividad({...formSubActividad, ponderacion: parseFloat(e.target.value) || 0})}
                                    className={erroresValidacion.ponderacion ? 'input-error' : ''}
                                />
                                {erroresValidacion.ponderacion && <span className="error-text">{erroresValidacion.ponderacion}</span>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setMostrarModalSubActividad(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={guardarSubActividad} disabled={loading}>
                                {loading ? 'Guardando...' : (editandoSubActividad ? 'Actualizar' : 'Crear')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ActivityManager;
