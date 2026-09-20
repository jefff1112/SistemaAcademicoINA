import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const ActividadesDocente = () => {
    const { user } = useAuth();

    // ============================================================
    // ESTADOS
    // ============================================================
    const [misDatos, setMisDatos] = useState(null);
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);

    const [claseSel, setClaseSel] = useState('');
    const [tipoSel, setTipoSel] = useState('');
    const [materiaSel, setMateriaSel] = useState('');
    const [especialidadSel, setEspecialidadSel] = useState('');
    const [periodoSel, setPeriodoSel] = useState('');

    const [estructura, setEstructura] = useState(null);
    const [cargandoEstructura, setCargandoEstructura] = useState(false);

    const [showModalActividad, setShowModalActividad] = useState(false);
    const [showModalSubActividad, setShowModalSubActividad] = useState(false);
    const [actividadEnEdicion, setActividadEnEdicion] = useState(null);
    const [subActividadEnEdicion, setSubActividadEnEdicion] = useState(null);
    const [idActividadPadre, setIdActividadPadre] = useState(null);

    const [mensaje, setMensaje] = useState(null);
    const [procesando, setProcesando] = useState(false);

    const [draggedActId, setDraggedActId] = useState(null);
    const [draggedSubId, setDraggedSubId] = useState(null);
    const [dragOverActId, setDragOverActId] = useState(null);
    const [dragOverSubId, setDragOverSubId] = useState(null);

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
    // ESTILOS INLINE (sin depender de CSS externo)
    // ============================================================
    const S = {
        card: { background: '#ffffff', borderRadius: '12px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,.05)', marginBottom: '20px' },
        h3: { margin: '0 0 16px', color: '#1e3a5f', fontSize: '18px', fontWeight: 700 },
        label: { display: 'block', fontWeight: 600, color: '#34495e', fontSize: '13px', marginBottom: '6px' },
        input: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#ffffff', color: '#1e293b', fontFamily: 'inherit' },
        btn: { padding: '9px 16px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
        btnPrimary: { background: '#1e3a5f', color: '#fff' },
        btnSuccess: { background: '#16a34a', color: '#fff' },
        btnWarning: { background: '#e67e22', color: '#fff' },
        btnInfo: { background: '#3b82f6', color: '#fff' },
        btnDanger: { background: '#dc2626', color: '#fff' },
        btnSecondary: { background: '#e5e7eb', color: '#334155' },
        btnSm: { padding: '5px 10px', fontSize: '11px', marginRight: '4px' },
        th: { padding: '12px 10px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700, color: '#1e293b', background: '#f8fafc', borderBottom: '2px solid #cbd5e1' },
        td: { padding: '10px', color: '#1e293b', background: '#ffffff', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle', fontSize: '13px' },
        badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.3px' }
    };

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarMisClases();
    }, []);

    const cargarMisClases = async () => {
        try {
            const resp = await API.get('/actividades/mis-clases');

            console.log('=== RESPUESTA /actividades/mis-clases ===');
            console.log('Datos completos:', resp.data);
            console.log('Clases:', resp.data.clases);
            console.log('Primera clase:', resp.data.clases?.[0]);
            console.log('Periodos:', resp.data.periodos);
            console.log('=========================================');

            setMisDatos(resp.data);
            setClases(resp.data.clases || []);
            setPeriodos(resp.data.periodos || []);

            // Auto-seleccionar período activo
            const periodoActivo = (resp.data.periodos || []).find(p => p.estado === 'Activo');
            if (periodoActivo) {
                setPeriodoSel(String(periodoActivo.idPeriodo));
            }

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
    // CARGAR ESTRUCTURA
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
    // HELPERS
    // ============================================================
    const periodoActual = periodos.find(p => parseInt(p.idPeriodo) === parseInt(periodoSel));
    const claseActual = clases.find(c => parseInt(c.idClase) === parseInt(claseSel));
    const materiasDisponibles = claseActual?.materias || claseActual?.materiasAsignadas || [];
    const esEspecialidadClase = claseActual?.esEspecialidad || false;

    useEffect(() => {
        if (claseSel) {
            console.log('=== CLASE SELECCIONADA ===');
            console.log('claseSel:', claseSel);
            console.log('claseActual:', claseActual);
            console.log('materiasDisponibles:', materiasDisponibles);
            console.log('esEspecialidadClase:', esEspecialidadClase);
            console.log('=========================');
        }
    }, [claseSel, claseActual, materiasDisponibles, esEspecialidadClase]);

    const esModuloActividadPadre = (() => {
        if (!idActividadPadre || !estructura?.actividades) return esEspecialidadClase;
        const actPadre = estructura.actividades.find(a => parseInt(a.idActividad) === parseInt(idActividadPadre));
        return actPadre?.esModulo || esEspecialidadClase;
    })();

    const getTipoBadge = (tipo) => {
        switch (tipo) {
            case 'Modulo': return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
            case 'Actividad': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            case 'PruebaObjetiva': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Autoevaluacion': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Coevaluacion': return { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' };
            case 'RecuperacionModulo': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'ActividadModulo': return { bg: '#ede9fe', color: '#6d28d9', border: '#8b5cf6' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    // ============================================================
    // ACCIONES
    // ============================================================
    const handleCrearEstructuraINA = async () => {
        if (!claseSel || !periodoSel || (!materiaSel && !especialidadSel)) {
            setMensaje({ tipo: 'warning', texto: 'Seleccione período, clase y materia/módulo primero' });
            return;
        }
        if (!window.confirm('¿Crear estructura predeterminada INA (35/35/30)? Esto creará 3 actividades con sus sub-actividades automáticamente.')) return;

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
            setMensaje({ tipo: 'error', texto: 'Error creando estructura: ' + (error.response?.data?.mensaje || error.message) });
        } finally {
            setProcesando(false);
        }
    };

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
            setMensaje({ tipo: 'error', texto: 'Error guardando actividad: ' + (error.response?.data?.mensaje || error.message) });
        } finally {
            setProcesando(false);
        }
    };

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
            setFormSubActividad({ nombreSubActividad: '', tipoSubActividad: 'Subactividad', ponderacion: 0, orden: 1 });
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
            setMensaje({ tipo: 'error', texto: 'Error guardando sub-actividad: ' + (error.response?.data?.mensaje || error.message) });
        } finally {
            setProcesando(false);
        }
    };

    const handleEliminarActividad = async (idActividad, nombre) => {
        if (!window.confirm(`¿Cerrar/desactivar la actividad "${nombre}"?`)) return;
        try {
            await API.delete(`/actividades/${idActividad}`);
            setMensaje({ tipo: 'success', texto: 'Actividad cerrada' });
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

    const handleRedistribuir = async () => {
        if (!claseSel || !periodoSel) return;
        if (!window.confirm('¿Redistribuir las ponderaciones de TODAS las actividades (Hamilton 100%)?')) return;

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
            setMensaje({ tipo: 'error', texto: 'Error: ' + (error.response?.data?.mensaje || error.message) });
        } finally {
            setProcesando(false);
        }
    };

    const handleRedistribuirSubs = async (idActividad, nombreActividad) => {
        if (!window.confirm(`¿Redistribuir sub-actividades de "${nombreActividad}"?`)) return;
        setProcesando(true);
        try {
            const resp = await API.post(`/actividades/redistribuir-subactividades/${idActividad}`);
            setMensaje({ tipo: 'success', texto: resp.data.mensaje || 'Sub-actividades redistribuidas' });
            await cargarEstructura();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error: ' + (error.response?.data?.mensaje || error.message) });
        } finally {
            setProcesando(false);
        }
    };

    // Drag & Drop
    const handleDragStartAct = (e, idActividad) => {
        setDraggedActId(idActividad);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => e.target.classList.add('dragging'), 0);
    };
    const handleDragOverAct = (e, idActividad) => {
        e.preventDefault();
        if (draggedActId && draggedActId !== idActividad) setDragOverActId(idActividad);
    };
    const handleDragLeaveAct = () => setDragOverActId(null);
    const handleDropAct = async (e, targetId) => {
        e.preventDefault();
        setDragOverActId(null);
        if (!draggedActId || draggedActId === targetId) { setDraggedActId(null); return; }
        const nuevas = [...(estructura?.actividades || [])];
        const dIdx = nuevas.findIndex(a => a.idActividad === draggedActId);
        const tIdx = nuevas.findIndex(a => a.idActividad === targetId);
        if (dIdx === -1 || tIdx === -1) { setDraggedActId(null); return; }
        const [m] = nuevas.splice(dIdx, 1);
        nuevas.splice(tIdx, 0, m);
        setEstructura(prev => ({ ...prev, actividades: nuevas }));
        try {
            await API.post('/actividades/reordenar-actividades', { idsActividadEnOrden: nuevas.map(a => a.idActividad) });
            setMensaje({ tipo: 'success', texto: 'Actividades reordenadas' });
            await cargarEstructura();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error: ' + (error.response?.data?.mensaje || error.message) });
            await cargarEstructura();
        } finally { setDraggedActId(null); }
    };
    const handleDragEndAct = (e) => { e.target.classList.remove('dragging'); setDraggedActId(null); setDragOverActId(null); };

    const handleDragStartSub = (e, id) => { setDraggedSubId(id); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => e.target.classList.add('dragging'), 0); };
    const handleDragOverSub = (e, id) => { e.preventDefault(); e.stopPropagation(); if (draggedSubId && draggedSubId !== id) setDragOverSubId(id); };
    const handleDragLeaveSub = () => setDragOverSubId(null);
    const handleDropSub = async (e, targetSubId, idActPadre) => {
        e.preventDefault(); e.stopPropagation(); setDragOverSubId(null);
        if (!draggedSubId || draggedSubId === targetSubId) { setDraggedSubId(null); return; }
        const nuevas = [...(estructura?.actividades || [])];
        const aIdx = nuevas.findIndex(a => a.idActividad === idActPadre);
        if (aIdx === -1) { setDraggedSubId(null); return; }
        const subs = [...(nuevas[aIdx].subActividades || [])];
        const dIdx = subs.findIndex(s => s.idSubActividad === draggedSubId);
        const tIdx = subs.findIndex(s => s.idSubActividad === targetSubId);
        if (dIdx === -1 || tIdx === -1) { setDraggedSubId(null); return; }
        const [m] = subs.splice(dIdx, 1);
        subs.splice(tIdx, 0, m);
        nuevas[aIdx] = { ...nuevas[aIdx], subActividades: subs };
        setEstructura(prev => ({ ...prev, actividades: nuevas }));
        try {
            await API.post(`/actividades/reordenar-subactividades/${idActPadre}`, { idsSubActividadEnOrden: subs.map(s => s.idSubActividad) });
            setMensaje({ tipo: 'success', texto: 'Sub-actividades reordenadas' });
            await cargarEstructura();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error: ' + (error.response?.data?.mensaje || error.message) });
            await cargarEstructura();
        } finally { setDraggedSubId(null); }
    };
    const handleDragEndSub = (e) => { e.target.classList.remove('dragging'); setDraggedSubId(null); setDragOverSubId(null); };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout>
            <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Segoe UI, Tahoma, sans-serif', backgroundColor: '#ffffff' }}>

                {/* HEADER */}
                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>Gestión de Actividades</h1>
                    {misDatos?.docente?.nombreCompleto && (
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                            Docente: {misDatos.docente.nombreCompleto}
                        </p>
                    )}
                </div>

                {/* PERIODO ACTIVO */}
                {periodoActual && (
                    <div style={{ padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#1e40af' }}>
                            <strong>Período Activo:</strong> {periodoActual.nombrePeriodo} - Año Lectivo {periodoActual.anioLectivo}
                        </div>
                        {periodoActual.estado === 'Activo' && (
                            <span style={{ ...S.badge, background: '#dcfce7', color: '#15803d', border: '1px solid #16a34a' }}>ACTIVO</span>
                        )}
                    </div>
                )}

                {/* MENSAJES */}
                {mensaje && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: mensaje.tipo === 'success' ? '#dcfce7' : mensaje.tipo === 'warning' ? '#fef3c7' : '#fee2e2',
                        color: mensaje.tipo === 'success' ? '#15803d' : mensaje.tipo === 'warning' ? '#b45309' : '#b91c1c',
                        borderLeft: `4px solid ${mensaje.tipo === 'success' ? '#16a34a' : mensaje.tipo === 'warning' ? '#e67e22' : '#dc2626'}`
                    }}>
                        <span>{mensaje.texto}</span>
                        <button onClick={() => setMensaje(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'inherit', lineHeight: 1 }}>X</button>
                    </div>
                )}

                {/* FILTROS */}
                <div style={S.card}>
                    <h3 style={S.h3}>Filtros de Búsqueda</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                        <div>
                            <label style={S.label}>Período</label>
                            <select value={periodoSel} onChange={e => setPeriodoSel(e.target.value)} style={S.input}>
                                <option value="">-- Seleccione Período --</option>
                                {periodos.map(p => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombrePeriodo} - {p.anioLectivo} {p.estado === 'Activo' ? '- Activo' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={S.label}>Clase</label>
                            <select value={claseSel} onChange={e => {
                                setClaseSel(e.target.value);
                                setTipoSel('');
                                setMateriaSel('');
                                setEspecialidadSel('');
                            }} style={S.input}>
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
                            <div>
                                <label style={S.label}>Tipo</label>
                                <select value={tipoSel} onChange={e => {
                                    const tipo = e.target.value;
                                    setTipoSel(tipo);
                                    setMateriaSel('');
                                    setEspecialidadSel(tipo === 'modulo' ? String(claseActual?.especialidad?.id ?? '') : '');
                                }} style={S.input}>
                                    <option value="">-- Seleccione --</option>
                                    {materiasDisponibles.length > 0 && <option value="materia">Materias Básicas</option>}
                                    {esEspecialidadClase && <option value="modulo">Módulos (Especialidad)</option>}
                                </select>
                            </div>
                        )}

                        {tipoSel === 'materia' && (
                            <div>
                                <label style={S.label}>Materia</label>
                                <select value={materiaSel} onChange={e => setMateriaSel(e.target.value)} style={S.input}>
                                    <option value="">-- Seleccione --</option>
                                    {materiasDisponibles.map(m => (
                                        <option key={m.idMateria} value={m.idMateria}>{m.nombreMateria}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {tipoSel === 'modulo' && claseActual?.especialidad && (
                            <div>
                                <label style={S.label}>Especialidad</label>
                                <select value={especialidadSel} onChange={e => setEspecialidadSel(e.target.value)} style={S.input}>
                                    <option value="">-- Seleccione --</option>
                                    <option value={claseActual.especialidad.id}>{claseActual.especialidad.nombre}</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {claseSel && !claseActual && (
                        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '13px' }}>
                            No se encontró la clase seleccionada. Verifica la consola del navegador (F12).
                        </div>
                    )}
                </div>

                {/* ACCIONES */}
                {estructura !== null && (
                    <div style={S.card}>
                        <h3 style={S.h3}>Acciones</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {tipoSel !== 'modulo' && (
                                <>
                                    <button
                                        style={{ ...S.btn, ...S.btnPrimary, opacity: (procesando || estructura?.actividades?.length > 0) ? 0.5 : 1 }}
                                        onClick={handleCrearEstructuraINA}
                                        disabled={procesando || estructura?.actividades?.length > 0}
                                    >
                                        Crear Estructura Predeterminada INA
                                    </button>
                                    <button style={{ ...S.btn, ...S.btnSuccess }} onClick={() => abrirModalActividad()} disabled={procesando}>
                                        Crear Actividad
                                    </button>
                                    <button style={{ ...S.btn, ...S.btnWarning, opacity: (procesando || !estructura?.actividades?.length) ? 0.5 : 1 }} onClick={handleRedistribuir} disabled={procesando || !estructura?.actividades?.length}>
                                        Redistribuir Ponderaciones
                                    </button>
                                </>
                            )}
                            {tipoSel === 'modulo' && (
                                <span style={{ color: '#64748b', fontSize: '13px' }}>
                                    Los módulos son definidos por Dirección/Registro. Aquí solo agrega las actividades de tus módulos.
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* VALIDACIÓN */}
                {estructura && (
                    <div style={{
                        padding: '14px 20px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                        fontSize: '13px',
                        background: estructura.esValidaTotal ? '#dcfce7' : '#fee2e2',
                        borderLeft: `4px solid ${estructura.esValidaTotal ? '#16a34a' : '#dc2626'}`,
                        color: estructura.esValidaTotal ? '#15803d' : '#b91c1c'
                    }}>
                        <div>
                            <strong>Total Actividades:</strong> {estructura.totalPonderacionActividades?.toFixed(2)}%
                            <span style={{ ...S.badge, marginLeft: '10px', background: estructura.esValidaTotal ? '#16a34a' : '#dc2626', color: '#fff' }}>
                                {estructura.esValidaTotal ? 'Válido' : 'Inválido'}
                            </span>
                        </div>
                        {estructura.ponderacionRestante > 0 && (
                            <div style={{ fontWeight: 600 }}>Restante: {estructura.ponderacionRestante.toFixed(2)}%</div>
                        )}
                    </div>
                )}

                {/* TABLA */}
                <div style={S.card}>
                    {cargandoEstructura && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Cargando estructura...</div>
                    )}

                    {!cargandoEstructura && estructura?.actividades?.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...S.th, width: '70px' }}>Orden</th>
                                        <th style={S.th}>Actividad</th>
                                        <th style={{ ...S.th, width: '110px' }}>Tipo</th>
                                        <th style={{ ...S.th, width: '100px' }}>Ponderación</th>
                                        <th style={{ ...S.th, width: '110px' }}>Sub-Act.</th>
                                        <th style={{ ...S.th, width: '90px' }}>Suma</th>
                                        <th style={{ ...S.th, width: '90px' }}>Estado</th>
                                        <th style={{ ...S.th, width: '180px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estructura.actividades.map(act => {
                                        const totalSubs = act.totalPonderacionSub || 0;
                                        const subsValidas = act.subPonderacionesValidas;
                                        const tipoBadge = getTipoBadge(act.tipoActividad);

                                        return (
                                            <React.Fragment key={act.idActividad}>
                                                <tr style={{ background: dragOverActId === act.idActividad ? '#eff6ff' : '#ffffff' }}>
                                                    <td style={S.td}>
                                                        <span style={{ cursor: 'grab', color: '#94a3b8', marginRight: '6px', fontWeight: 700 }}>::</span>
                                                        <strong>{act.numeroOrden || '-'}</strong>
                                                    </td>
                                                    <td style={{ ...S.td, fontWeight: 600 }}><strong>{act.nombreActividad}</strong></td>
                                                    <td style={S.td}>
                                                        <span style={{ ...S.badge, background: tipoBadge.bg, color: tipoBadge.color, border: `1px solid ${tipoBadge.border}` }}>
                                                            {act.tipoActividad}
                                                        </span>
                                                    </td>
                                                    <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: '#1e40af' }}><strong>{act.ponderacion}%</strong></td>
                                                    <td style={S.td}>{act.subActividades?.length || 0} subs</td>
                                                    <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: subsValidas ? '#15803d' : '#b91c1c' }}>
                                                        {totalSubs.toFixed(2)}%{!subsValidas && ' !'}
                                                    </td>
                                                    <td style={S.td}>
                                                        <span style={{ ...S.badge, background: act.estado === 'Activo' ? '#dcfce7' : '#f1f5f9', color: act.estado === 'Activo' ? '#15803d' : '#475569', border: `1px solid ${act.estado === 'Activo' ? '#bbf7d0' : '#cbd5e1'}` }}>
                                                            {act.estado}
                                                        </span>
                                                    </td>
                                                    <td style={S.td}>
                                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                            {tipoSel !== 'modulo' && (
                                                                <>
                                                                    <button style={{ ...S.btn, ...S.btnInfo, ...S.btnSm }} onClick={() => abrirModalActividad(act)}>Editar</button>
                                                                    <button style={{ ...S.btn, ...S.btnWarning, ...S.btnSm }} onClick={() => handleRedistribuirSubs(act.idActividad, act.nombreActividad)} disabled={!act.subActividades?.filter(s => s.tipoSubActividad === 'Subactividad').length}>Redistribuir</button>
                                                                    <button style={{ ...S.btn, ...S.btnDanger, ...S.btnSm }} onClick={() => handleEliminarActividad(act.idActividad, act.nombreActividad)}>Cerrar</button>
                                                                </>
                                                            )}
                                                            <button style={{ ...S.btn, ...S.btnSecondary, ...S.btnSm }} onClick={() => abrirModalSubActividad(act.idActividad)}>+ Sub</button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {act.subActividades?.map(sub => {
                                                    const subTipoBadge = getTipoBadge(sub.tipoSubActividad);
                                                    return (
                                                        <tr key={sub.idSubActividad} style={{ background: '#fafbfc' }}>
                                                            <td style={{ ...S.td, background: '#fafbfc' }}>
                                                                <span style={{ cursor: 'grab', color: '#cbd5e1' }}>::</span>
                                                            </td>
                                                            <td style={{ ...S.td, paddingLeft: '30px', background: '#fafbfc' }}>{sub.nombreDisplay || sub.nombreSubActividad}</td>
                                                            <td style={{ ...S.td, background: '#fafbfc' }}>
                                                                <span style={{ ...S.badge, background: subTipoBadge.bg, color: subTipoBadge.color, border: `1px solid ${subTipoBadge.border}` }}>
                                                                    {sub.tipoSubActividad}
                                                                </span>
                                                            </td>
                                                            <td style={{ ...S.td, textAlign: 'center', background: '#fafbfc' }}>{sub.ponderacion}%</td>
                                                            <td colSpan="2" style={{ ...S.td, background: '#fafbfc' }}>Orden: {sub.orden}</td>
                                                            <td style={{ ...S.td, background: '#fafbfc' }}>{sub.llevaNota ? 'Sí' : 'No'}</td>
                                                            <td style={{ ...S.td, background: '#fafbfc' }}>
                                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                                    <button style={{ ...S.btn, ...S.btnInfo, ...S.btnSm }} onClick={() => abrirModalSubActividad(act.idActividad, sub)}>Editar</button>
                                                                    <button style={{ ...S.btn, ...S.btnDanger, ...S.btnSm }} onClick={() => handleEliminarSubActividad(sub.idSubActividad, sub.nombreSubActividad)}>Eliminar</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!cargandoEstructura && estructura?.actividades?.length === 0 && claseSel && periodoSel && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>
                                {tipoSel === 'modulo' ? 'No tienes módulos asignados' : 'No hay actividades creadas'}
                            </h3>
                            <p style={{ fontSize: '13px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
                                {tipoSel === 'modulo'
                                    ? 'Los módulos son definidos y asignados por Dirección/Registro.'
                                    : 'Presione "Crear Estructura Predeterminada INA" o "Crear Actividad" para comenzar.'}
                            </p>
                        </div>
                    )}

                    {(!claseSel || !periodoSel) && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '17px' }}>Bienvenido</h3>
                            <p style={{ fontSize: '13px', margin: 0 }}>
                                Seleccione un <strong>período</strong> y una <strong>clase</strong> para comenzar.
                            </p>
                        </div>
                    )}
                </div>

                {/* MODAL ACTIVIDAD */}
                {showModalActividad && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowModalActividad(false)}>
                        <div style={{ background: '#ffffff', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '17px' }}>{actividadEnEdicion ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
                                <button onClick={() => setShowModalActividad(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>X</button>
                            </div>
                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={S.label}>Nombre de la Actividad</label>
                                    <input type="text" value={formActividad.nombreActividad} onChange={e => setFormActividad({ ...formActividad, nombreActividad: e.target.value })} placeholder="Ej: Actividad 1" style={S.input} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={S.label}>Ponderación (%)</label>
                                        <input type="number" min="0" max="100" step="0.01" value={formActividad.ponderacion} onChange={e => setFormActividad({ ...formActividad, ponderacion: e.target.value })} style={S.input} />
                                    </div>
                                    <div>
                                        <label style={S.label}>Tipo (automático)</label>
                                        <input type="text" value={tipoSel === 'modulo' ? 'Módulo' : 'Actividad'} disabled style={{ ...S.input, background: '#f8fafc', color: '#64748b' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={S.label}>Fecha Publicación</label>
                                        <input type="date" value={formActividad.fechaPublicacion} onChange={e => setFormActividad({ ...formActividad, fechaPublicacion: e.target.value })} style={S.input} />
                                    </div>
                                    <div>
                                        <label style={S.label}>Fecha Límite</label>
                                        <input type="date" value={formActividad.fechaLimite} onChange={e => setFormActividad({ ...formActividad, fechaLimite: e.target.value })} style={S.input} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={S.label}>Descripción</label>
                                    <textarea value={formActividad.descripcion} onChange={e => setFormActividad({ ...formActividad, descripcion: e.target.value })} rows="3" style={{ ...S.input, resize: 'vertical', minHeight: '70px' }} />
                                </div>
                            </div>
                            <div style={{ padding: '15px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => setShowModalActividad(false)}>Cancelar</button>
                                <button style={{ ...S.btn, ...S.btnPrimary }} onClick={handleGuardarActividad} disabled={procesando}>
                                    {procesando ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL SUB-ACTIVIDAD */}
                {showModalSubActividad && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowModalSubActividad(false)}>
                        <div style={{ background: '#ffffff', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '17px' }}>{subActividadEnEdicion ? 'Editar Sub-Actividad' : 'Nueva Sub-Actividad'}</h3>
                                <button onClick={() => setShowModalSubActividad(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>X</button>
                            </div>
                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={S.label}>Nombre</label>
                                    <input type="text" value={formSubActividad.nombreSubActividad} onChange={e => setFormSubActividad({ ...formSubActividad, nombreSubActividad: e.target.value })} style={S.input} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={S.label}>Tipo</label>
                                    <select value={formSubActividad.tipoSubActividad} onChange={e => setFormSubActividad({ ...formSubActividad, tipoSubActividad: e.target.value })} style={S.input}>
                                        <option value="Subactividad">Sub-actividad</option>
                                        <option value="PruebaObjetiva">Prueba Objetiva</option>
                                        <option value="Autoevaluacion">Autoevaluación</option>
                                        <option value="Coevaluacion">Coevaluación</option>
                                        {esModuloActividadPadre && (
                                            <>
                                                <option value="ActividadModulo">Actividad de Módulo</option>
                                                <option value="RecuperacionModulo">Recuperación de Módulo</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={S.label}>Ponderación (%)</label>
                                        <input type="number" min="0" max="100" step="0.01" value={formSubActividad.ponderacion} onChange={e => setFormSubActividad({ ...formSubActividad, ponderacion: e.target.value })} style={S.input} />
                                    </div>
                                    <div>
                                        <label style={S.label}>Orden</label>
                                        <input type="number" min="1" value={formSubActividad.orden} onChange={e => setFormSubActividad({ ...formSubActividad, orden: e.target.value })} style={S.input} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '15px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => setShowModalSubActividad(false)}>Cancelar</button>
                                <button style={{ ...S.btn, ...S.btnPrimary }} onClick={handleGuardarSubActividad} disabled={procesando}>
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