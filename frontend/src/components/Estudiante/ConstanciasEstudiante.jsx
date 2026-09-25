// Componente ConstanciasEstudiante: portal de consulta del estudiante.
// Muestra solo las constancias ACTIVAS, el HISTORIAL y el DETALLE de cada una,
// con descarga del documento adjunto si existe. No puede emitir ni anular constancias;
// eso lo realiza el personal (Dirección/Registro/Admin) cuando el estudiante lo solicita.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const ConstanciasEstudiante = () => {
    const [constancias, setConstancias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const [descargando, setDescargando] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [estudiante, setEstudiante] = useState(null);

    // ============================================================
    // ESTILOS INLINE
    // ============================================================
    const S = {
        card: {
            background: '#ffffff',
            borderRadius: '12px',
            padding: '22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,.05)',
            marginBottom: '20px'
        },
        cardTitle: {
            margin: '0 0 16px',
            color: '#1e3a5f',
            fontSize: '17px',
            fontWeight: 700
        },
        label: {
            display: 'block',
            fontWeight: 600,
            color: '#34495e',
            fontSize: '13px',
            marginBottom: '6px'
        },
        input: {
            width: '100%',
            padding: '9px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box',
            background: '#ffffff',
            color: '#1e293b',
            fontFamily: 'inherit'
        },
        btn: {
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all .2s'
        },
        btnPrimary: { background: '#1e3a5f', color: '#fff' },
        btnSuccess: { background: '#16a34a', color: '#fff' },
        btnSecondary: { background: '#e5e7eb', color: '#334155' },
        btnSm: { padding: '6px 14px', fontSize: '12px' },
        statCard: {
            background: '#ffffff',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            textAlign: 'center'
        },
        statNumber: {
            fontSize: '26px',
            fontWeight: 700,
            lineHeight: 1.2
        },
        statLabel: {
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '.5px',
            color: '#64748b',
            fontWeight: 600
        },
        badge: {
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.3px'
        },
        infoBox: {
            padding: '14px 18px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderLeft: '4px solid #3b82f6',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#1e40af',
            lineHeight: 1.6,
            marginBottom: '20px'
        }
    };

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarConstancias();
    }, []);

    const cargarConstancias = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudianteData = (estudiantesRes.data || []).find(e => e.codigoEstudiante === user?.codigo);

            if (!estudianteData) {
                setMensaje({ texto: 'No se encontró el estudiante asociado a esta cuenta', tipo: 'error' });
                return;
            }

            setEstudiante(estudianteData);
            const constanciasRes = await API.get(`/constancias/estudiante/${estudianteData.idEstudiante}`);
            setConstancias(constanciasRes.data || []);
        } catch (error) {
            console.error('Error cargando constancias:', error);
            setMensaje({ texto: 'Error al cargar las constancias', tipo: 'error' });
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
    const tipoLabel = (tipo) => {
        const tipos = {
            Incapacidad: 'Incapacidad / Permiso'
        };
        return tipos[tipo] || tipo;
    };

    const fechaLabel = (fecha) => {
        if (!fecha) return '-';
        try {
            return new Date(fecha).toLocaleDateString('es-SV', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return fecha;
        }
    };

    const fechaHoraLabel = (fecha) => {
        if (!fecha) return '-';
        try {
            return new Date(fecha).toLocaleString('es-SV', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fecha;
        }
    };

    const getTipoBadge = (tipo) => {
        switch (tipo) {
            case 'Incapacidad': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    const descargarDocumento = async (c) => {
        setDescargando(true);
        try {
            const res = await API.get(`/constancias/${c.idConstancia}/documento`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', c.nombreArchivo || 'documento_constancia');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            mostrarMensaje('Documento descargado correctamente', 'success');
        } catch (error) {
            console.error('Error descargando documento:', error);
            mostrarMensaje('Error al descargar el documento', 'error');
        } finally {
            setDescargando(false);
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const constanciasFiltradas = useMemo(() => {
        return constancias.filter(c => {
            // Solo mostrar tipo Incapacidad (Permiso)
            if (c.tipo !== 'Incapacidad') return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (c.motivo && c.motivo.toLowerCase().includes(term)) ||
                    (tipoLabel(c.tipo).toLowerCase().includes(term)) ||
                    (c.generadaPor && c.generadaPor.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [constancias, busqueda]);

    const activas = constanciasFiltradas.filter(c => c.estado === 'Activa');
    const historial = constanciasFiltradas.filter(c => c.estado !== 'Activa');

    const stats = useMemo(() => ({
        total: constancias.length,
        activas: constancias.filter(c => c.estado === 'Activa').length,
        anuladas: constancias.filter(c => c.estado === 'Anulada').length,
        conDocumento: constancias.filter(c => c.tieneDocumento).length
    }), [constancias]);

    const filtrosActivos = (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setBusqueda('');
    };

    // ============================================================
    // RENDER CARD
    // ============================================================
    const renderCard = (c) => {
        const tipoBadge = getTipoBadge(c.tipo);
        const esActiva = c.estado === 'Activa';
        return (
            <div
                key={c.idConstancia}
                style={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    padding: '16px 18px',
                    border: '1px solid #e2e8f0',
                    borderLeft: `4px solid ${esActiva ? '#16a34a' : '#94a3b8'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                    transition: 'box-shadow .2s'
                }}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span style={{
                            ...S.badge,
                            background: tipoBadge.bg,
                            color: tipoBadge.color,
                            border: `1px solid ${tipoBadge.border}`
                        }}>
                            {tipoLabel(c.tipo)}
                        </span>
                        <span style={{
                            ...S.badge,
                            background: esActiva ? '#dcfce7' : '#fee2e2',
                            color: esActiva ? '#15803d' : '#b91c1c',
                            border: `1px solid ${esActiva ? '#bbf7d0' : '#fecaca'}`
                        }}>
                            {c.estado}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 4px', color: '#0f172a', fontSize: '13px', fontWeight: 600 }}>
                        {c.motivo || 'Emitida sin motivo específico'}
                    </p>
                    {c.tipo === 'Incapacidad' && (
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>
                            {fechaLabel(c.fechaInicio)} a {fechaLabel(c.fechaFin)} ({c.cantidadDias} días)
                        </p>
                    )}
                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}>
                        Emitida el {fechaLabel(c.fechaEmision)}
                        {c.generadaPor ? ` por ${c.generadaPor}` : ''}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                        style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }}
                        onClick={() => setDetalle(c)}
                    >
                        Detalles
                    </button>
                    {c.tieneDocumento && (
                        <button
                            style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm, opacity: descargando ? 0.6 : 1 }}
                            onClick={() => descargarDocumento(c)}
                            disabled={descargando}
                        >
                            Documento
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Constancias">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    Cargando constancias...
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Constancias">
            <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* HEADER */}
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>
                        Mis Constancias
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                        {estudiante?.nombres} {estudiante?.apellidos}
                        {estudiante?.codigoEstudiante ? ` - ${estudiante.codigoEstudiante}` : ''}
                    </p>
                </div>

                {/* INFO BOX */}
                <div style={S.infoBox}>
                    <strong>Información importante:</strong> Las constancias son emitidas por la Dirección / Registro Académico.
                    Si necesitas una constancia, acércate a la Dirección con tu documento o encargado. Aquí puedes consultar tus constancias activas,
                    el historial y descargar los documentos adjuntos.
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
                {constancias.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        <div style={{ ...S.statCard, borderTop: '4px solid #1e3a5f' }}>
                            <span style={{ ...S.statNumber, color: '#1e3a5f' }}>{stats.total}</span>
                            <span style={S.statLabel}>Total Constancias</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #16a34a' }}>
                            <span style={{ ...S.statNumber, color: '#16a34a' }}>{stats.activas}</span>
                            <span style={S.statLabel}>Activas</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #dc2626' }}>
                            <span style={{ ...S.statNumber, color: '#dc2626' }}>{stats.anuladas}</span>
                            <span style={S.statLabel}>Anuladas</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #3b82f6' }}>
                            <span style={{ ...S.statNumber, color: '#3b82f6' }}>{stats.conDocumento}</span>
                            <span style={S.statLabel}>Con Documento</span>
                        </div>
                    </div>
                )}

                {/* FILTROS */}
                {constancias.length > 0 && (
                    <div style={S.card}>
                        <h3 style={{ ...S.cardTitle, marginBottom: '16px' }}>
                            Filtros de Búsqueda
                            {filtrosActivos > 0 && (
                                <span style={{
                                    display: 'inline-block',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    marginLeft: '8px'
                                }}>
                                    {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                                </span>
                            )}
                        </h3>
                        <div>
                            <label style={S.label}>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por motivo o quién emitió..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={S.input}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button style={{ ...S.btn, ...S.btnSecondary }} onClick={cargarConstancias}>Recargar</button>
                                {filtrosActivos > 0 && (
                                    <button style={{ ...S.btn, ...S.btnSecondary }} onClick={limpiarFiltros}>Limpiar Filtros</button>
                                )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                Mostrando <strong>{constanciasFiltradas.length}</strong> de {constancias.length} constancias
                            </div>
                        </div>
                    </div>
                )}

                {/* SIN CONSTANCIAS */}
                {constancias.length === 0 ? (
                    <div style={S.card}>
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>Sin constancias emitidas</h3>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                                No tienes constancias registradas por el momento. Si necesitas una, acude a la Dirección o Registro Académico.
                            </p>
                        </div>
                    </div>
                ) : constanciasFiltradas.length === 0 ? (
                    <div style={S.card}>
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>No hay constancias que coincidan</h3>
                            <p style={{ margin: 0, fontSize: '13px' }}>Prueba ajustando los filtros de búsqueda.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* CONSTANCIAS ACTIVAS */}
                        <div style={S.card}>
                            <h3 style={S.cardTitle}>
                                Constancias Activas
                                {activas.length > 0 && (
                                    <span style={{
                                        display: 'inline-block',
                                        background: '#16a34a',
                                        color: '#fff',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        marginLeft: '8px'
                                    }}>
                                        {activas.length}
                                    </span>
                                )}
                            </h3>
                            {activas.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>
                                    No tienes constancias activas en este momento.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {activas.map(renderCard)}
                                </div>
                            )}
                        </div>

                        {/* HISTORIAL */}
                        <div style={S.card}>
                            <h3 style={S.cardTitle}>
                                Historial
                                {historial.length > 0 && (
                                    <span style={{
                                        display: 'inline-block',
                                        background: '#94a3b8',
                                        color: '#fff',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        marginLeft: '8px'
                                    }}>
                                        {historial.length}
                                    </span>
                                )}
                            </h3>
                            {historial.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>
                                    Sin constancias anteriores.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {historial.map(renderCard)}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* MODAL DE DETALLE */}
                {detalle && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(15,23,42,.55)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}
                        onClick={() => setDetalle(null)}
                    >
                        <div
                            style={{
                                background: '#ffffff',
                                borderRadius: '12px',
                                width: '560px',
                                maxWidth: '94vw',
                                maxHeight: '90vh',
                                overflow: 'auto',
                                padding: '24px',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,.1)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '17px', fontWeight: 700 }}>
                                    Detalle - {tipoLabel(detalle.tipo)}
                                </h3>
                                <button
                                    onClick={() => setDetalle(null)}
                                    style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}
                                >
                                    X
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px 16px', fontSize: '13px' }}>
                                <div style={{ color: '#64748b', fontWeight: 600 }}>Estado:</div>
                                <div>
                                    <span style={{
                                        ...S.badge,
                                        background: detalle.estado === 'Activa' ? '#dcfce7' : '#fee2e2',
                                        color: detalle.estado === 'Activa' ? '#15803d' : '#b91c1c',
                                        border: `1px solid ${detalle.estado === 'Activa' ? '#bbf7d0' : '#fecaca'}`
                                    }}>
                                        {detalle.estado}
                                    </span>
                                </div>

                                <div style={{ color: '#64748b', fontWeight: 600 }}>Motivo:</div>
                                <div style={{ color: '#1e293b' }}>{detalle.motivo || '-'}</div>

                                {detalle.tipo === 'Incapacidad' && (
                                    <>
                                        <div style={{ color: '#64748b', fontWeight: 600 }}>Rango:</div>
                                        <div style={{ color: '#1e293b' }}>
                                            {fechaLabel(detalle.fechaInicio)} a {fechaLabel(detalle.fechaFin)} ({detalle.cantidadDias} días)
                                        </div>
                                    </>
                                )}

                                <div style={{ color: '#64748b', fontWeight: 600 }}>Emisión:</div>
                                <div style={{ color: '#1e293b' }}>{fechaHoraLabel(detalle.fechaEmision)}</div>

                                <div style={{ color: '#64748b', fontWeight: 600 }}>Generada por:</div>
                                <div style={{ color: '#1e293b' }}>{detalle.generadaPor || '-'}</div>

                                <div style={{ color: '#64748b', fontWeight: 600 }}>Trajo documento:</div>
                                <div style={{ color: '#1e293b' }}>{detalle.trajoDocumento ? 'Sí' : 'No'}</div>

                                <div style={{ color: '#64748b', fontWeight: 600 }}>Encargado presente:</div>
                                <div style={{ color: '#1e293b' }}>{detalle.encargadoPresente ? 'Sí' : 'No'}</div>

                                {detalle.tipo === 'Incapacidad' && (
                                    <>
                                        <div style={{ color: '#64748b', fontWeight: 600 }}>Permiso asistencias:</div>
                                        <div style={{ color: '#1e293b' }}>{detalle.permisoAsistencias ? 'Sí' : 'No'}</div>
                                    </>
                                )}

                                {detalle.observaciones && (
                                    <>
                                        <div style={{ color: '#64748b', fontWeight: 600 }}>Observaciones:</div>
                                        <div style={{ color: '#1e293b' }}>{detalle.observaciones}</div>
                                    </>
                                )}

                                <div style={{ color: '#64748b', fontWeight: 600 }}>Documento adjunto:</div>
                                <div style={{ color: '#1e293b', fontFamily: 'monospace', fontSize: '12px' }}>
                                    {detalle.tieneDocumento ? detalle.nombreArchivo : 'Sin adjunto'}
                                </div>
                            </div>

                            {detalle.tieneDocumento && (
                                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                    <button
                                        style={{ ...S.btn, ...S.btnSuccess, opacity: descargando ? 0.6 : 1 }}
                                        onClick={() => descargarDocumento(detalle)}
                                        disabled={descargando}
                                    >
                                        {descargando ? 'Descargando...' : 'Descargar Documento'}
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button
                                    style={{ ...S.btn, ...S.btnSecondary }}
                                    onClick={() => setDetalle(null)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ConstanciasEstudiante;