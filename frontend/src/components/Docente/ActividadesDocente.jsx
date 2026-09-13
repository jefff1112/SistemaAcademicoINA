import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import './ActividadesDocente.css';

const ActividadesDocente = () => {
    const { user, token } = useAuth();

    // ============================================================
    // ESTADOS
    // ============================================================
    const [misDatos, setMisDatos] = useState(null);
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);

    // Filtros
    const [claseSel, setClaseSel] = useState('');
    const [tipoSel, setTipoSel] = useState(''); // 'materia' o 'modulo'
    const [materiaSel, setMateriaSel] = useState('');
    const [especialidadSel, setEspecialidadSel] = useState('');
    const [periodoSel, setPeriodoSel] = useState('');

    // Estructura
    const [estructura, setEstructura] = useState(null);
    const [cargandoEstructura, setCargandoEstructura] = useState(false);

    // Modales
    const [showModalActividad, setShowModalActividad] = useState(false);
    const [showModalSubActividad, setShowModalSubActividad] = useState(false);
    const [actividadEnEdicion, setActividadEnEdicion] = useState(null);
    const [subActividadEnEdicion, setSubActividadEnEdicion] = useState(null);
    const [idActividadPadre, setIdActividadPadre] = useState(null);

    // Mensajes
    const [mensaje, setMensaje] = useState(null);
    const [procesando, setProcesando] = useState(false);

    // Drag & Drop
    const [draggedActId, setDraggedActId] = useState(null);
    const [draggedSubId, setDraggedSubId] = useState(null);
    const [dragOverActId, setDragOverActId] = useState(null);
    const [dragOverSubId, setDragOverSubId] = useState(null);

    // ============================================================
    // FORMULARIOS
    // ============================================================
    const [formActividad, setFormActividad] = useState({
        nombreActividad: '',
        tipoActividad: 'Actividad',
        ponderacion: 0,
        fechaPublicacion: new Date().toISOString().split('T')[0],
        fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        descripcion: '',
        incluirAutoevaluacion: false,
        incluirCoevaluacion: false,
        ponderacionAutoevaluacion: 0,
        ponderacionCoevaluacion: 0
    });

    const [formSubActividad, setFormSubActividad] = useState({
        nombreSubActividad: '',
        tipoSubActividad: 'Subactividad',
        ponderacion: 0,
        orden: 1
    });

    // ============================================================
    // CARGA INICIAL: mis-clases
    // ============================================================
    useEffect(() => {
        cargarMisClases();
    }, []);

    const cargarMisClases = async () => {
        try {
            const resp = await API.get('/actividades/mis-clases');
            setMisDatos(resp.data);
            setClases(resp.data.clases || []);
            setPeriodos(resp.data.periodos || []);

            if (resp.data.clases?.length === 0) {
                setMensaje({
                    tipo: 'warning',
                    texto: 'No tienes clases/materias asignadas. Contacta al administrador.'
                });
            }
        } catch (error) {
            console.error('Error cargando mis clases:', error);
            setMensaje({
                tipo: 'error',
                texto: 'Error al cargar tus asignaciones: ' + (error.response?.data?.mensaje || error.message)
            });
        }
    };

    // ============================================================
    // CARGAR ESTRUCTURA cuando cambian los filtros
    // ============================================================
    useEffect(() => {
        if (!claseSel || !periodoSel) {
            setEstructura(null);
            return;
        }
        if (tipoSel === 'materia' && !materiaSel) {
            setEstructura(null);
            return;
        }
        if (tipoSel === 'modulo' && !especialidadSel) {
            setEstructura(null);
            return;
        }
        cargarEstructura();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claseSel, tipoSel, materiaSel, especialidadSel, periodoSel]);

    const cargarEstructura = async () => {
        setCargandoEstructura(true);
        try {
            const params = new URLSearchParams();
            params.append('idClase', claseSel);
            params.append('idPeriodo', periodoSel);
            if (tipoSel === 'materia' && materiaSel) params.append('idMateria', materiaSel);
            if (tipoSel === 'modulo' && especialidadSel) params.append('idEspecialidad', especialidadSel);

            const resp = await API.get(`/actividades/estructura-completa?${params.toString()}`);
            setEstructura(resp.data);
        } catch (error) {
            console.error('Error cargando estructura:', error);
            setMensaje({
                tipo: 'error',
                texto: 'Error al cargar estructura: ' + (error.response?.data?.mensaje || error.message)
            });
            setEstructura(null);
        } finally {
            setCargandoEstructura(false);
        }
    };

    // ============================================================
    // CREAR ESTRUCTURA PREDETERMINADA INA
    // ============================================================
    const handleCrearEstructuraINA = async () => {
        if (!claseSel || !periodoSel || (!materiaSel && !especialidadSel)) {
            setMensaje({ tipo: 'warning', texto: 'Seleccione período, clase y materia/módulo primero' });
            return;
        }

        if (!window.confirm('¿Crear estructura predeterminada INA (35/35/30)? Esto creará 3 actividades con sus sub-actividades automáticamente.')) {
            return;
        }

        setProcesando(true);
        try {
            const body = {
                idClase: parseInt(claseSel),
                idPeriodo: parseInt(periodoSel),
                idMateria: tipoSel === 'materia' ? parseInt(materiaSel) : null,
                idEspecialidad: tipoSel === 'modulo' ? parseInt(especialidadSel) : null
            };

            const resp = await API.post('/actividades/crear-estructura-predeterminada', body);

            setMensaje({ tipo: 'success', texto: resp.data.mensaje || 'Estructura INA creada correctamente' });
            await cargarEstructura();
        } catch (error) {
            setMensaje({
                tipo: 'error',
                texto: 'Error creando estructura: ' + (error.response?.data?.mensaje || error.message)
            });
        } finally {
            setProcesando(false);
        }
    };

    // ============================================================
    // CREAR ACTIVIDAD (modal)
    // ============================================================
    const abrirModalActividad = (actividad = null) => {
        if (actividad) {
            setActividadEnEdicion(actividad);
            setFormActividad({
                nombreActividad: actividad.nombreActividad || '',
                tipoActividad: actividad.tipoActividad || 'Actividad',
                ponderacion: actividad.ponderacion || 0,
                fechaPublicacion: actividad.fechaPublicacion?.split('T')[0] || new Date().toISOString().split('T')[0],
                fechaLimite: actividad.fechaLimite?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                descripcion: actividad.descripcion || '',
                incluirAutoevaluacion: actividad.incluirAutoevaluacion || false,
                incluirCoevaluacion: actividad.incluirCoevaluacion || false,
                ponderacionAutoevaluacion: actividad.ponderacionAutoevaluacion || 0,
                ponderacionCoevaluacion: actividad.ponderacionCoevaluacion || 0
            });
        } else {
            setActividadEnEdicion(null);
            setFormActividad({
                nombreActividad: '',
                tipoActividad: tipoSel === 'modulo' ? 'Modulo' : 'Actividad',
                ponderacion: 0,
                fechaPublicacion: new Date().toISOString().split('T')[0],
                fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                descripcion: '',
                incluirAutoevaluacion: false,
                incluirCoevaluacion: false,
                ponderacionAutoevaluacion: 0,
                ponderacionCoevaluacion: 0
            });
        }
        setShowModalActividad(true);
    };

    const handleGuardarActividad = async () => {
        if (!formActividad.nombreActividad.trim()) {
            setMensaje({ tipo: 'warning', texto: 'El nombre es requerido' });
            return;
        }
        if (formActividad.ponderacion <= 0 || formActividad.ponderacion > 100) {
            setMensaje({ tipo: 'warning', texto: 'La ponderación debe estar entre 1 y 100' });
            return;
        }

        setProcesando(true);
        try {
            const body = {
                idClase: parseInt(claseSel),
                idPeriodo: parseInt(periodoSel),
                idMateria: tipoSel === 'materia' ? parseInt(materiaSel) : null,
                idEspecialidad: tipoSel === 'modulo' ? parseInt(especialidadSel) : null,
                nombreActividad: formActividad.nombreActividad,
                tipoActividad: tipoSel === 'modulo' ? 'Modulo' : 'Actividad',
                ponderacion: parseFloat(formActividad.ponderacion),
                fechaPublicacion: formActividad.fechaPublicacion,
                fechaLimite: formActividad.fechaLimite,
                descripcion: formActividad.descripcion,
                incluirAutoevaluacion: formActividad.incluirAutoevaluacion,
                incluirCoevaluacion: formActividad.incluirCoevaluacion,
                ponderacionAutoevaluacion: parseFloat(formActividad.ponderacionAutoevaluacion) || 0,
                ponderacionCoevaluacion: parseFloat(formActividad.ponderacionCoevaluacion) || 0,
                esModulo: tipoSel === 'modulo'
            };

            if (actividadEnEdicion) {
                await API.put(`/actividades/${actividadEnEdicion.idActividad}`, body);
                setMensaje({ tipo: 'success', texto: 'Actividad actualizada correctamente' });
            } else {
                await API.post('/actividades/crear', body);
                setMensaje({ tipo: 'success', texto: 'Actividad creada correctamente' });
            }

            setShowModalActividad(false);
            await cargarEstructura();
        } catch (error) {
            setMensaje({
                tipo: 'error',
                texto: 'Error guardando actividad: ' + (error.response?.data?.mensaje || error.message)
            });
        } finally {
            setProcesando(false);
        }
    };

    // ============================================================
    // CREAR SUB-ACTIVIDAD (modal)
    // ============================================================
    const abrirModalSubActividad = (idActividad, subActividad = null) => {
        setIdActividadPadre(idActividad);
        if (subActividad) {
            setSubActividadEnEdicion(subActividad);
            setFormSubActividad({
                nombreSubActividad: subActividad.nombreSubActividad || '',
                tipoSubActividad: subActividad.tipoSubActividad || 'Subactividad',
                ponderacion: subActividad.ponderacion || 0,
                orden: subActividad.orden || 1
            });
        } else {
            setSubActividadEnEdicion(null);
            setFormSubActividad({
                nombreSubActividad: '',
                tipoSubActividad: 'Subactividad',
                ponderacion: 0,
                orden: 1
            });
        }
        setShowModalSubActividad(true);
    };

    const handleGuardarSubActividad = async () => {
        if (!formSubActividad.nombreSubActividad.trim()) {
            setMensaje({ tipo: 'warning', texto: 'El nombre es requerido' });
            return;
        }

        setProcesando(true);
        try {
            const body = {
                idActividad: parseInt(idActividadPadre),
                nombreSubActividad: formSubActividad.nombreSubActividad,
                tipoSubActividad: formSubActividad.tipoSubActividad,
                ponderacion: parseFloat(formSubActividad.ponderacion),
                orden: parseInt(formSubActividad.orden),
                esVertical: ['Autoevaluacion', 'Coevaluacion', 'PruebaObjetiva', 'RecuperacionModulo'].includes(formSubActividad.tipoSubActividad)
            };

            if (subActividadEnEdicion) {
                await API.put(`/actividades/subactividad/${subActividadEnEdicion.idSubActividad}`, body);
                setMensaje({ tipo: 'success', texto: 'Sub-actividad actualizada' });
            } else {
                await API.post(`/actividades/${idActividadPadre}/crear-subactividad`, body);
                setMensaje({ tipo: 'success', texto: 'Sub-actividad creada' });
            }

            setShowModalSubActividad(false);
            await cargarEstructura();
        } catch (error) {
            setMensaje({
                tipo: 'error',
                texto: 'Error guardando sub-actividad: ' + (error.response?.data?.mensaje || error.message)
            });
        } finally {
            setProcesando(false);
        }
    };

    // ============================================================
    // ELIMINAR
    // ============================================================
    const handleEliminarActividad = async (idActividad, nombre) => {
        if (!window.confirm(`¿Cerrar/desactivar la actividad "${nombre}"? Las ponderaciones se redistribuirán automáticamente.`)) return;
        try {
            await API.delete(`/actividades/${idActividad}`);
            setMensaje({ tipo: 'success', texto: 'Actividad cerrada y ponderaciones redistribuidas' });
            await cargarEstructura();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error eliminando: ' + (error.response?.data?.mensaje || error.message) });
        }
    };

    const handleEliminarSubActividad = async (idSubActividad, nombre) => {
        if (!window.confirm(`¿Eliminar sub-actividad "${nombre}"?`)) return;
        try {
            await API.delete(`/actividades/subactividad/${idSubActividad}`);
            setMensaje({ tipo: 'success', texto: 'Sub-actividad eliminada' });
            await cargarEstructura();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error eliminando: ' + (error.response?.data?.mensaje || error.message) });
        }
    };

    // ============================================================
    // REDISTRIBUIR PONDERACIONES
    // ============================================================
    const handleRedistribuir = async () => {
        if (!claseSel || !periodoSel) return;
        if (!window.confirm('¿Redistribuir las ponderaciones de TODAS las actividades usando el algoritmo Hamilton?\n\nCada actividad recibirá un valor entero que sume exactamente 100%.\nEjemplo: 3 actividades → 34 + 33 + 33 = 100')) return;

        setProcesando(true);
        try {
            const body = {
                idClase: parseInt(claseSel),
                idPeriodo: parseInt(periodoSel),
                idMateria: tipoSel === 'materia' ? parseInt(materiaSel) : null,
                idEspecialidad: tipoSel === 'modulo' ? parseInt(especialidadSel) : null,
                idDocente: misDatos?.docente?.idDocente || 0
            };
            const resp = await API.post('/actividades/redistribuir-ponderaciones', body);
            setMensaje({ tipo: 'success', texto: resp.data.mensaje || 'Ponderaciones redistribuidas' });
            await cargarEstructura();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error redistribuyendo: ' + (error.response?.data?.mensaje || error.message) });
        } finally {
            setProcesando(false);
        }
    };

    // ============================================================
    // REDISTRIBUIR SUB-ACTIVIDADES (de una actividad específica)
    // ============================================================
    const handleRedistribuirSubs = async (idActividad, nombreActividad) => {
        if (!window.confirm(`¿Redistribuir las sub-actividades de "${nombreActividad}" usando el algoritmo Hamilton?\n\nSolo se redistribuyen sub-actividades normales (no autoevaluación, coevaluación, ni recuperación).\nCada sub-actividad recibirá un valor entero que sume exactamente 100%.`)) return;

        setProcesando(true);
        try {
            const resp = await API.post(`/actividades/redistribuir-subactividades/${idActividad}`);
            setMensaje({ tipo: 'success', texto: resp.data.mensaje || 'Sub-actividades redistribuidas' });
            await cargarEstructura();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error redistribuyendo subs: ' + (error.response?.data?.mensaje || error.message) });
        } finally {
            setProcesando(false);
        }
    };

    // ============================================================
    // DRAG & DROP - Actividades
    // ============================================================
    const handleDragStartAct = (e, idActividad) => {
        setDraggedActId(idActividad);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', idActividad.toString());
        // Hacer la fila semi-transparente después de un tick
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    };

    const handleDragOverAct = (e, idActividad) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedActId && draggedActId !== idActividad) {
            setDragOverActId(idActividad);
        }
    };

    const handleDragLeaveAct = () => {
        setDragOverActId(null);
    };

    const handleDropAct = async (e, targetId) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverActId(null);

        if (!draggedActId || draggedActId === targetId) {
            setDraggedActId(null);
            return;
        }

        // Reordenar localmente
        const nuevasActividades = [...(estructura?.actividades || [])];
        const draggedIndex = nuevasActividades.findIndex(a => a.idActividad === draggedActId);
        const targetIndex = nuevasActividades.findIndex(a => a.idActividad === targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedActId(null);
            return;
        }

        // Mover el elemento arrastrado a la posición del target
        const [movedAct] = nuevasActividades.splice(draggedIndex, 1);
        nuevasActividades.splice(targetIndex, 0, movedAct);

        // Actualizar estado local inmediatamente (feedback visual rápido)
        setEstructura(prev => ({
            ...prev,
            actividades: nuevasActividades
        }));

        // Extraer IDs en el nuevo orden
        const idsEnOrden = nuevasActividades.map(a => a.idActividad);

        // Persistir en backend
        try {
            await API.post('/actividades/reordenar-actividades', { idsActividadEnOrden: idsEnOrden });
            setMensaje({ tipo: 'success', texto: 'Actividades reordenadas correctamente' });
            // Recargar estructura para sincronizar
            await cargarEstructura();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error reordenando: ' + (error.response?.data?.mensaje || error.message) });
            // Revertir cambio local si falla
            await cargarEstructura();
        } finally {
            setDraggedActId(null);
        }
    };

    const handleDragEndAct = (e) => {
        e.target.classList.remove('dragging');
        setDraggedActId(null);
        setDragOverActId(null);
    };

    // ============================================================
    // DRAG & DROP - Sub-actividades
    // ============================================================
    const handleDragStartSub = (e, idSubActividad) => {
        setDraggedSubId(idSubActividad);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', idSubActividad.toString());
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    };

    const handleDragOverSub = (e, idSubActividad) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        if (draggedSubId && draggedSubId !== idSubActividad) {
            setDragOverSubId(idSubActividad);
        }
    };

    const handleDragLeaveSub = () => {
        setDragOverSubId(null);
    };

    const handleDropSub = async (e, targetSubId, idActividadPadre) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverSubId(null);

        if (!draggedSubId || draggedSubId === targetSubId) {
            setDraggedSubId(null);
            return;
        }

        // Encontrar la actividad padre y sus subs
        const nuevasActividades = [...(estructura?.actividades || [])];
        const actIndex = nuevasActividades.findIndex(a => a.idActividad === idActividadPadre);
        if (actIndex === -1) {
            setDraggedSubId(null);
            return;
        }

        const nuevasSubs = [...(nuevasActividades[actIndex].subActividades || [])];
        const draggedIndex = nuevasSubs.findIndex(s => s.idSubActividad === draggedSubId);
        const targetIndex = nuevasSubs.findIndex(s => s.idSubActividad === targetSubId);

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedSubId(null);
            return;
        }

        // Mover la sub-actividad arrastrada
        const [movedSub] = nuevasSubs.splice(draggedIndex, 1);
        nuevasSubs.splice(targetIndex, 0, movedSub);

        nuevasActividades[actIndex] = {
            ...nuevasActividades[actIndex],
            subActividades: nuevasSubs
        };

        setEstructura(prev => ({
            ...prev,
            actividades: nuevasActividades
        }));

        // Extraer IDs en el nuevo orden
        const idsEnOrden = nuevasSubs.map(s => s.idSubActividad);

        try {
            await API.post(`/actividades/reordenar-subactividades/${idActividadPadre}`, { idsSubActividadEnOrden: idsEnOrden });
            setMensaje({ tipo: 'success', texto: 'Sub-actividades reordenadas correctamente' });
            await cargarEstructura();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error reordenando subs: ' + (error.response?.data?.mensaje || error.message) });
            await cargarEstructura();
        } finally {
            setDraggedSubId(null);
        }
    };

    const handleDragEndSub = (e) => {
        e.target.classList.remove('dragging');
        setDraggedSubId(null);
        setDragOverSubId(null);
    };

    // ============================================================
    // PERÍODO ACTUAL SELECCIONADO
    // ============================================================
    const periodoActual = periodos.find(p => p.idPeriodo === parseInt(periodoSel));

    // ============================================================
    // CLASE ACTUAL SELECCIONADA
    // ============================================================
    const claseActual = clases.find(c => c.idClase === parseInt(claseSel));
    const materiasDisponibles = claseActual?.materias || [];
    const esEspecialidadClase = claseActual?.esEspecialidad || false;

    // Determinar si la actividad padre es un módulo (para mostrar tipos condicionales en modal de sub-actividad)
    const esModuloActividadPadre = (() => {
        if (!idActividadPadre || !estructura?.actividades) return esEspecialidadClase;
        const actPadre = estructura.actividades.find(a => a.idActividad === idActividadPadre);
        return actPadre?.esModulo || esEspecialidadClase;
    })();

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout>
            <div className="actividades-docente-container">
                <div className="actividades-header">
                <h1>📋 Gestión de Actividades</h1>
                <p className="docente-info">
                    {misDatos?.docente?.nombreCompleto && `Docente: ${misDatos.docente.nombreCompleto}`}
                </p>
                {periodoActual && (
                    <div className="periodo-banner">
                        📅 Período Activo: <strong>{periodoActual.nombrePeriodo}</strong> - Año Lectivo <strong>{periodoActual.anioLectivo}</strong>
                        {periodoActual.estado === 'Activo' && <span className="badge-activo">✓ ACTIVO</span>}
                    </div>
                )}
            </div>

            {/* Mensajes */}
            {mensaje && (
                <div className={`alert alert-${mensaje.tipo}`}>
                    {mensaje.texto}
                    <button className="btn-close-alert" onClick={() => setMensaje(null)}>×</button>
                </div>
            )}

            {/* Filtros */}
            <div className="filtros-container">
                <div className="filtro-grupo">
                    <label>📅 Período:</label>
                    <select value={periodoSel} onChange={e => setPeriodoSel(e.target.value)}>
                        <option value="">-- Seleccione Período --</option>
                        {periodos.map(p => (
                            <option key={p.idPeriodo} value={p.idPeriodo}>
                                {p.nombrePeriodo} - {p.anioLectivo} {p.estado === 'Activo' ? '✓' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filtro-grupo">
                    <label>🏫 Clase:</label>
                    <select value={claseSel} onChange={e => {
                        setClaseSel(e.target.value);
                        setTipoSel('');
                        setMateriaSel('');
                        setEspecialidadSel('');
                    }}>
                        <option value="">-- Seleccione --</option>
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
                        <select value={tipoSel} onChange={e => {
                            const tipo = e.target.value;
                            setTipoSel(tipo);
                            setMateriaSel('');
                            setEspecialidadSel(tipo === 'modulo' ? String(claseActual?.especialidad?.id ?? '') : '');
                        }}>
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

                {tipoSel === 'materia' && (
                    <div className="filtro-grupo">
                        <label>Materia:</label>
                        <select value={materiaSel} onChange={e => setMateriaSel(e.target.value)}>
                            <option value="">-- Seleccione --</option>
                            {materiasDisponibles.map(m => (
                                <option key={m.idMateria} value={m.idMateria}>{m.nombreMateria}</option>
                            ))}
                        </select>
                    </div>
                )}

                {tipoSel === 'modulo' && claseActual?.especialidad && (
                    <div className="filtro-grupo">
                        <label>Especialidad:</label>
                        <select value={especialidadSel} onChange={e => setEspecialidadSel(e.target.value)}>
                            <option value="">-- Seleccione --</option>
                            <option value={claseActual.especialidad.id}>{claseActual.especialidad.nombre}</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Botones de acción */}
            {estructura !== null && (
                <div className="acciones-container">
                    {tipoSel !== 'modulo' && (
                        <>
                            <button
                                className="btn btn-primary"
                                onClick={handleCrearEstructuraINA}
                                disabled={procesando || estructura?.actividades?.length > 0}
                                title={estructura?.actividades?.length > 0 ? 'Ya existen actividades. Elimine las existentes primero.' : ''}
                            >
                                🎯 Crear Estructura Predeterminada INA
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={() => abrirModalActividad()}
                                disabled={procesando}
                            >
                                ➕ Crear Actividad
                            </button>
                            <button
                                className="btn btn-warning"
                                onClick={handleRedistribuir}
                                disabled={procesando || !estructura?.actividades?.length}
                            >
                                ⚖️ Redistribuir Ponderaciones
                            </button>
                        </>
                    )}
                    {tipoSel === 'modulo' && (
                        <span style={{ color: '#6c757d', fontSize: '0.9em' }}>
                            Los módulos son definidos por Dirección/Registro. Aquí solo agrega las actividades de tus módulos.
                        </span>
                    )}
                </div>
            )}

            {/* Resumen de validación */}
            {estructura && (
                <div className={`validacion-container ${estructura.esValidaTotal ? 'valido' : 'invalido'}`}>
                    <div className="validacion-info">
                        <strong>Total Actividades:</strong> {estructura.totalPonderacionActividades?.toFixed(2)}%
                        {estructura.esValidaTotal ? (
                            <span className="badge-valido">✓ Válido</span>
                        ) : (
                            <span className="badge-invalido">✗ Inválido (debe sumar 100%)</span>
                        )}
                    </div>
                    {estructura.ponderacionRestante > 0 && (
                        <div className="restante-info">
                            Restante: {estructura.ponderacionRestante.toFixed(2)}%
                        </div>
                    )}
                </div>
            )}

            {/* Cuadro de actividades */}
            <div className="cuadro-actividades">
                {cargandoEstructura && <div className="loading">Cargando estructura...</div>}

                {!cargandoEstructura && estructura?.actividades?.length > 0 && (
                    <table className="tabla-actividades">
                        <thead>
                            <tr>
                                <th>Orden</th>
                                <th>Actividad</th>
                                <th>Tipo</th>
                                <th>Ponderación</th>
                                <th>Sub-Actividades</th>
                                <th>Σ Subs</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estructura.actividades.map(act => {
                                const totalSubs = act.totalPonderacionSub || 0;
                                const subsValidas = act.subPonderacionesValidas;

                                return (
                                    <React.Fragment key={act.idActividad}>
                                        {/* Fila principal de actividad (DRAGGABLE) */}
                                        <tr
                                            className={`fila-actividad ${draggedActId === act.idActividad ? 'dragging' : ''} ${dragOverActId === act.idActividad ? 'drag-over' : ''}`}
                                            draggable={true}
                                            onDragStart={(e) => handleDragStartAct(e, act.idActividad)}
                                            onDragOver={(e) => handleDragOverAct(e, act.idActividad)}
                                            onDragLeave={handleDragLeaveAct}
                                            onDrop={(e) => handleDropAct(e, act.idActividad)}
                                            onDragEnd={handleDragEndAct}
                                            style={{ cursor: 'grab' }}
                                            title="Arrastra para reordenar"
                                        >
                                            <td>
                                                <span className="drag-handle" title="Arrastra para reordenar">⋮⋮</span>
                                                <strong>{act.numeroOrden || '-'}</strong>
                                            </td>
                                            <td><strong>{act.nombreActividad}</strong></td>
                                            <td>
                                                <span className={`badge-tipo ${act.tipoActividad === 'Modulo' ? 'badge-modulo' : 'badge-actividad'}`}>
                                                    {act.tipoActividad}
                                                </span>
                                            </td>
                                            <td className="ponderacion-cell">
                                                <strong>{act.ponderacion}%</strong>
                                            </td>
                                            <td>{act.subActividades?.length || 0} subs</td>
                                            <td className={`suma-subs ${subsValidas ? 'valido' : 'invalido'}`}>
                                                {totalSubs.toFixed(2)}%
                                                {!subsValidas && <span className="alerta-subs"> ⚠</span>}
                                            </td>
                                            <td>
                                                <span className={`badge-estado ${act.estado === 'Activo' ? 'badge-activo' : 'badge-cerrado'}`}>
                                                    {act.estado}
                                                </span>
                                            </td>
                                            <td className="acciones-cell">
                                                {tipoSel !== 'modulo' && (
                                                    <>
                                                        <button className="btn-sm btn-edit" onClick={() => abrirModalActividad(act)} title="Editar">✏️</button>
                                                        <button 
                                                            className="btn-sm btn-redistribuir-subs" 
                                                            onClick={() => handleRedistribuirSubs(act.idActividad, act.nombreActividad)} 
                                                            title="Redistribuir Sub-actividades (Algoritmo Hamilton)"
                                                            disabled={!act.subActividades?.filter(s => s.tipoSubActividad === 'Subactividad').length}
                                                        >
                                                            ⚖️
                                                        </button>
                                                        <button className="btn-sm btn-del" onClick={() => handleEliminarActividad(act.idActividad, act.nombreActividad)} title="Cerrar">🗑️</button>
                                                    </>
                                                )}
                                                <button className="btn-sm btn-add-sub" onClick={() => abrirModalSubActividad(act.idActividad)} title={tipoSel === 'modulo' ? 'Agregar Actividad' : 'Agregar Sub'}>➕</button>
                                            </td>
                                        </tr>

                                        {/* Filas de sub-actividades (DRAGGABLE dentro de la misma actividad) */}
                                        {act.subActividades?.map(sub => (
                                            <tr
                                                key={sub.idSubActividad}
                                                className={`fila-subactividad ${draggedSubId === sub.idSubActividad ? 'dragging' : ''} ${dragOverSubId === sub.idSubActividad ? 'drag-over' : ''}`}
                                                draggable={true}
                                                onDragStart={(e) => handleDragStartSub(e, sub.idSubActividad)}
                                                onDragOver={(e) => handleDragOverSub(e, sub.idSubActividad)}
                                                onDragLeave={handleDragLeaveSub}
                                                onDrop={(e) => handleDropSub(e, sub.idSubActividad, act.idActividad)}
                                                onDragEnd={handleDragEndSub}
                                                style={{ cursor: 'grab' }}
                                                title="Arrastra para reordenar dentro de esta actividad"
                                            >
                                                <td>
                                                    <span className="drag-handle sub" title="Arrastra para reordenar">⋮⋮</span>
                                                </td>
                                                <td className="sub-nombre">
                                                    <span className={`sub-tipo-icon ${sub.esVertical ? 'vertical' : ''}`}>
                                                        {sub.icono || '📋'}
                                                    </span>
                                                    {sub.nombreDisplay || sub.nombreSubActividad}
                                                </td>
                                                <td>
                                                    <span className={`badge-sub-tipo ${sub.tipoSubActividad.toLowerCase()}`}>
                                                        {sub.tipoSubActividad}
                                                    </span>
                                                </td>
                                                <td className="ponderacion-cell">{sub.ponderacion}%</td>
                                                <td colSpan="2">{sub.orden}</td>
                                                <td>{sub.llevaNota ? '📝' : '—'}</td>
                                                <td className="acciones-cell">
                                                    <button className="btn-sm btn-edit" onClick={() => abrirModalSubActividad(act.idActividad, sub)} title="Editar">✏️</button>
                                                    <button className="btn-sm btn-del" onClick={() => handleEliminarSubActividad(sub.idSubActividad, sub.nombreSubActividad)} title="Eliminar">🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {!cargandoEstructura && estructura?.actividades?.length === 0 && claseSel && periodoSel && (
                    <div className="empty-state">
                        <h3>📭 {tipoSel === 'modulo' ? 'No tienes módulos asignados' : 'No hay actividades creadas'}</h3>
                        <p>
                            {tipoSel === 'modulo'
                                ? 'Los módulos son definidos y asignados por Dirección/Registro. Una vez asignados, podrás agregar las actividades de cada módulo.'
                                : 'Presione "Crear Estructura Predeterminada INA" para generar automáticamente 3 actividades con sus sub-actividades, o "Crear Actividad" para agregar una manualmente.'}
                        </p>
                    </div>
                )}

                {(!claseSel || !periodoSel) && (
                    <div className="empty-state">
                        <h3>👋 Bienvenido</h3>
                        <p>Seleccione un <strong>período</strong> y una <strong>clase</strong> para comenzar a gestionar sus actividades y sub-actividades.</p>
                    </div>
                )}
            </div>

            {/* ============================================================ */}
            {/* MODAL: Crear/Editar Actividad */}
            {/* ============================================================ */}
            {showModalActividad && (
                <div className="modal-overlay" onClick={() => setShowModalActividad(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{actividadEnEdicion ? '✏️ Editar Actividad' : '➕ Nueva Actividad'}</h3>
                            <button className="btn-close" onClick={() => setShowModalActividad(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nombre de la Actividad:</label>
                                <input
                                    type="text"
                                    value={formActividad.nombreActividad}
                                    onChange={e => setFormActividad({ ...formActividad, nombreActividad: e.target.value })}
                                    placeholder="Ej: Actividad 1, Tarea Práctica, etc."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ponderación (%):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formActividad.ponderacion}
                                        onChange={e => setFormActividad({ ...formActividad, ponderacion: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tipo (automático):</label>
                                    <input
                                        type="text"
                                        value={tipoSel === 'modulo' ? '📦 Módulo (Especialidad)' : '📋 Actividad (Materia Básica)'}
                                        disabled
                                        style={{ backgroundColor: '#f0f0f0', color: '#666' }}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha Publicación:</label>
                                    <input
                                        type="date"
                                        value={formActividad.fechaPublicacion}
                                        onChange={e => setFormActividad({ ...formActividad, fechaPublicacion: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fecha Límite:</label>
                                    <input
                                        type="date"
                                        value={formActividad.fechaLimite}
                                        onChange={e => setFormActividad({ ...formActividad, fechaLimite: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea
                                    value={formActividad.descripcion}
                                    onChange={e => setFormActividad({ ...formActividad, descripcion: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formActividad.incluirAutoevaluacion}
                                        onChange={e => setFormActividad({ ...formActividad, incluirAutoevaluacion: e.target.checked })}
                                    />
                                    🔄 Incluir Autoevaluación
                                </label>
                                {formActividad.incluirAutoevaluacion && (
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formActividad.ponderacionAutoevaluacion}
                                        onChange={e => setFormActividad({ ...formActividad, ponderacionAutoevaluacion: e.target.value })}
                                        placeholder="Ponderación"
                                        className="ponderacion-inline"
                                    />
                                )}
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formActividad.incluirCoevaluacion}
                                        onChange={e => setFormActividad({ ...formActividad, incluirCoevaluacion: e.target.checked })}
                                    />
                                    🤝 Incluir Coevaluación
                                </label>
                                {formActividad.incluirCoevaluacion && (
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formActividad.ponderacionCoevaluacion}
                                        onChange={e => setFormActividad({ ...formActividad, ponderacionCoevaluacion: e.target.value })}
                                        placeholder="Ponderación"
                                        className="ponderacion-inline"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-cancel" onClick={() => setShowModalActividad(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleGuardarActividad} disabled={procesando}>
                                {procesando ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODAL: Crear/Editar Sub-Actividad */}
            {/* ============================================================ */}
            {showModalSubActividad && (
                <div className="modal-overlay" onClick={() => setShowModalSubActividad(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{subActividadEnEdicion ? '✏️ Editar Sub-Actividad' : '➕ Nueva Sub-Actividad'}</h3>
                            <button className="btn-close" onClick={() => setShowModalSubActividad(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nombre:</label>
                                <input
                                    type="text"
                                    value={formSubActividad.nombreSubActividad}
                                    onChange={e => setFormSubActividad({ ...formSubActividad, nombreSubActividad: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Tipo:</label>
                                <select
                                    value={formSubActividad.tipoSubActividad}
                                    onChange={e => setFormSubActividad({ ...formSubActividad, tipoSubActividad: e.target.value })}
                                >
                                    <option value="Subactividad">📋 Sub-actividad (normal)</option>
                                    <option value="PruebaObjetiva">📝 Prueba Objetiva (vertical)</option>
                                    <option value="Autoevaluacion">🔄 Autoevaluación (vertical)</option>
                                    <option value="Coevaluacion">🤝 Coevaluación (vertical)</option>
                                    {esModuloActividadPadre && (
                                        <>
                                            <option value="ActividadModulo">📦 Actividad de Módulo</option>
                                            <option value="RecuperacionModulo">♻️ Recuperación de Módulo</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ponderación (%):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formSubActividad.ponderacion}
                                        onChange={e => setFormSubActividad({ ...formSubActividad, ponderacion: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Orden:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formSubActividad.orden}
                                        onChange={e => setFormSubActividad({ ...formSubActividad, orden: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-cancel" onClick={() => setShowModalSubActividad(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleGuardarSubActividad} disabled={procesando}>
                                {procesando ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </DashboardLayout>
    );
};

export default ActividadesDocente;
