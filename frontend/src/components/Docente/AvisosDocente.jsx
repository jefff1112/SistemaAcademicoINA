// Componente AvisosDocente: muestra los avisos internos activos publicados para el docente.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: listado de avisos internos vigentes para el docente.
const AvisosDocente = () => {
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filterPrioridad, setFilterPrioridad] = useState('todas');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarAvisos();
    }, []);

    const cargarAvisos = async () => {
        setLoading(true);
        try {
            const response = await API.get('/avisosinternos/activos');
            setAvisos(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar avisos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getPrioridadInfo = (prioridad) => {
        switch (prioridad) {
            case 'alta': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626', label: 'Alta' };
            case 'media': return { bg: '#fef3c7', color: '#b45309', border: '#f59e0b', label: 'Media' };
            case 'baja': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a', label: 'Baja' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8', label: prioridad || 'Normal' };
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            const d = new Date(fecha);
            return d.toLocaleString('es-SV', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fecha;
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const avisosFiltrados = useMemo(() => {
        return avisos.filter(a => {
            if (filterPrioridad !== 'todas' && a.prioridad !== filterPrioridad) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (a.titulo && a.titulo.toLowerCase().includes(term)) ||
                    (a.contenido && a.contenido.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [avisos, filterPrioridad, busqueda]);

    const stats = useMemo(() => ({
        total: avisos.length,
        alta: avisos.filter(a => a.prioridad === 'alta').length,
        media: avisos.filter(a => a.prioridad === 'media').length,
        baja: avisos.filter(a => a.prioridad === 'baja').length
    }), [avisos]);

    const filtrosActivos = (filterPrioridad !== 'todas' ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterPrioridad('todas');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Avisos">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    Cargando avisos...
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Avisos - Docente">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', background: '#ffffff' }}>

                {/* HEADER */}
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>
                        Avisos Internos
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                        Comunicados y notificaciones vigentes para el personal docente
                    </p>
                </div>

                {/* MENSAJES */}
                {mensaje && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        background: mensaje.tipo === 'success' ? '#dcfce7' : '#fee2e2',
                        color: mensaje.tipo === 'success' ? '#15803d' : '#b91c1c',
                        borderLeft: `4px solid ${mensaje.tipo === 'success' ? '#16a34a' : '#dc2626'}`
                    }}>
                        {mensaje.texto}
                    </div>
                )}

                {/* ESTADÍSTICAS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <div style={{ padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #bfdbfe', background: '#eff6ff' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', color: '#1e40af' }}>{stats.total}</span>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#64748b' }}>Total Avisos</span>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #fecaca', background: '#fee2e2' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', color: '#b91c1c' }}>{stats.alta}</span>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#64748b' }}>Prioridad Alta</span>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #fde68a', background: '#fef3c7' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', color: '#b45309' }}>{stats.media}</span>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#64748b' }}>Prioridad Media</span>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #bbf7d0', background: '#dcfce7' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', color: '#15803d' }}>{stats.baja}</span>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#64748b' }}>Prioridad Baja</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '18px', fontWeight: 700 }}>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span style={{ display: 'inline-block', background: '#3b82f6', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', marginLeft: '8px' }}>
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, color: '#34495e', fontSize: '13px', marginBottom: '6px' }}>Prioridad</label>
                            <select
                                value={filterPrioridad}
                                onChange={(e) => setFilterPrioridad(e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#ffffff' }}
                            >
                                <option value="todas">Todas las prioridades</option>
                                <option value="alta">Solo Alta</option>
                                <option value="media">Solo Media</option>
                                <option value="baja">Solo Baja</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, color: '#34495e', fontSize: '13px', marginBottom: '6px' }}>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por título o contenido..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#ffffff' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={cargarAvisos}
                                style={{ padding: '9px 16px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: '#e5e7eb', color: '#334155', fontFamily: 'inherit' }}
                            >
                                Recargar
                            </button>
                            {filtrosActivos > 0 && (
                                <button
                                    onClick={limpiarFiltros}
                                    style={{ padding: '9px 16px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: '#e5e7eb', color: '#334155', fontFamily: 'inherit' }}
                                >
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{avisosFiltrados.length}</strong> de {avisos.length} avisos
                        </div>
                    </div>
                </div>

                {/* LISTA DE AVISOS */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '18px', fontWeight: 700 }}>Listado de Avisos</h3>

                    {avisosFiltrados.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>
                                {avisos.length === 0 ? 'No hay avisos disponibles' : 'No hay avisos que coincidan'}
                            </h3>
                            <p style={{ fontSize: '13px', margin: 0 }}>
                                {avisos.length === 0
                                    ? 'En este momento no hay comunicados activos para el personal docente.'
                                    : 'Prueba ajustando los filtros de búsqueda.'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {avisosFiltrados.map((a) => {
                                const prioridadInfo = getPrioridadInfo(a.prioridad);
                                return (
                                    <div
                                        key={a.idAviso}
                                        style={{
                                            padding: '16px 18px',
                                            background: '#ffffff',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            borderLeft: `4px solid ${prioridadInfo.border}`,
                                            transition: 'box-shadow .2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                    <strong style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700 }}>
                                                        {a.titulo}
                                                    </strong>
                                                    <span style={{
                                                        padding: '3px 10px',
                                                        borderRadius: '10px',
                                                        fontSize: '10px',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '.3px',
                                                        backgroundColor: prioridadInfo.bg,
                                                        color: prioridadInfo.color,
                                                        border: `1px solid ${prioridadInfo.border}`
                                                    }}>
                                                        Prioridad {prioridadInfo.label}
                                                    </span>
                                                </div>
                                                <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                                                    {a.contenido}
                                                </p>
                                                <small style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}>
                                                    Publicado: {formatearFecha(a.createdAt)}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AvisosDocente;