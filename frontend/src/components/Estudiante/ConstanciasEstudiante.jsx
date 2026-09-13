// Componente ConstanciasEstudiante: portal de consulta del estudiante.
// Muestra solo las constancias ACTIVAS, el HISTORIAL y el DETALLE de cada una,
// con descarga del documento adjunto si existe. No puede emitir ni anular constancias;
// eso lo realiza el personal (Dirección/Registro/Admin) cuando el estudiante lo solicita.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const ConstanciasEstudiante = () => {
    const [constancias, setConstancias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const [descargando, setDescargando] = useState(false);

    useEffect(() => {
        cargarConstancias();
    }, []);

    // Busca el estudiante logueado y carga sus constancias.
    const cargarConstancias = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudiante = (estudiantesRes.data || []).find(e => e.codigoEstudiante === user?.codigo);

            if (!estudiante) {
                setMensaje({ texto: 'No se encontró el estudiante asociado a esta cuenta', tipo: 'error' });
                return;
            }

            const constanciasRes = await API.get(`/constancias/estudiante/${estudiante.idEstudiante}`);
            setConstancias(constanciasRes.data || []);
        } catch (error) {
            console.error('Error cargando constancias:', error);
            setMensaje({ texto: 'Error al cargar las constancias', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const tipoLabel = (tipo) => {
        const tipos = { Estudio: 'Constancia de Estudio', Conducta: 'Constancia de Conducta', Incapacidad: 'Incapacidad / Permiso' };
        return tipos[tipo] || tipo;
    };

    const fechaLabel = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString();
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
        } catch (error) {
            console.error('Error descargando documento:', error);
            setMensaje({ texto: 'Error al descargar el documento', tipo: 'error' });
            setTimeout(() => setMensaje(null), 4000);
        } finally {
            setDescargando(false);
        }
    };

    const activas = constancias.filter(c => c.estado === 'Activa');
    const historial = constancias.filter(c => c.estado !== 'Activa');

    const renderCard = (c) => (
        <div key={c.idConstancia} style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,.10)',
            borderLeft: `5px solid ${c.estado === 'Activa' ? '#27ae60' : '#95a5a6'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
        }}>
            <div>
                <p style={{ margin: 0, fontWeight: '600', color: '#2c3e50', fontSize: '15px' }}>
                    {tipoLabel(c.tipo)}
                    {c.estado === 'Activa' && (
                        <span style={{
                            marginLeft: '8px',
                            background: '#d1fae5',
                            color: '#065f46',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '20px'
                        }}>ACTIVA</span>
                    )}
                    {c.estado === 'Anulada' && (
                        <span style={{
                            marginLeft: '8px',
                            background: '#fee2e2',
                            color: '#991b1b',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '20px'
                        }}>ANULADA</span>
                    )}
                </p>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                    {c.motivo || `Emitida sin motivo específico`}
                </p>
                {c.tipo === 'Incapacidad' && (
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                        {fechaLabel(c.fechaInicio)} → {fechaLabel(c.fechaFin)} ({c.cantidadDias} días)
                    </p>
                )}
                <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '12px' }}>
                    Emitida el {fechaLabel(c.fechaEmision)}{c.generadaPor ? ` por ${c.generadaPor}` : ''}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setDetalle(c)}>Detalles</button>
                {c.tieneDocumento && (
                    <button className="btn btn-success btn-sm" onClick={() => descargarDocumento(c)} disabled={descargando}>
                        Documento
                    </button>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <DashboardLayout title="Constancias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Constancias">
            <style>{`
                .const-est-aviso { padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
                .const-est-aviso.success { background: #d1fae5; color: #065f46; }
                .const-est-aviso.error { background: #fee2e2; color: #991b1b; }
                .const-est-seccion { margin-bottom: 24px; }
                .const-est-seccion h3 { color: #2c3e50; margin: 0 0 12px; font-size: 17px; }
                .const-est-aviso-info { background: #f8fafc; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; font-size: 13px; color: #64748b; }
                .const-est-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .const-est-modal { background: #fff; border-radius: 12px; width: 520px; max-width: 94vw; max-height: 90vh; overflow: auto; padding: 24px; }
                .const-est-modal h3 { margin: 0 0 16px; color: #2c3e50; }
                .const-est-detalle p { margin: 8px 0; color: #475569; font-size: 14px; }
                .const-est-detalle b { color: #2c3e50; }
                .const-est-badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #fff; }
                .const-est-badge.activa { background: #27ae60; }
                .const-est-badge.anulada { background: #e74c3c; }
                .const-est-modal-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
            `}</style>

            <div className="const-est-aviso-info">
                Las constancias son emitidas por la Dirección / Registro Académico. Si necesita una constancia,
                acérquese a la Dirección con su documento o encargado; aquí podrá consultar sus constancias activas, historial y descargar detalles.
            </div>

            {mensaje && <div className={`const-est-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

            {constancias.length === 0 ? (
                <div className="const-est-seccion">
                    <h3>Constancias Activas</h3>
                    <p style={{ color: '#7f8c8d' }}>No tiene constancias emitidas por el momento.</p>
                </div>
            ) : (
                <>
                    <div className="const-est-seccion">
                        <h3>Constancias Activas</h3>
                        {activas.length === 0 ? (
                            <p style={{ color: '#7f8c8d' }}>No tiene constancias activas.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {activas.map(renderCard)}
                            </div>
                        )}
                    </div>

                    <div className="const-est-seccion">
                        <h3>Historial</h3>
                        {historial.length === 0 ? (
                            <p style={{ color: '#7f8c8d' }}>Sin constancias anteriores.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {historial.map(renderCard)}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modal de detalle */}
            {detalle && (
                <div className="const-est-modal-overlay">
                    <div className="const-est-modal">
                        <h3>Detalle - {tipoLabel(detalle.tipo)}</h3>
                        <div className="const-est-detalle">
                            <p><b>Motivo:</b> {detalle.motivo || '-'}</p>
                            {detalle.tipo === 'Incapacidad' && (
                                <p><b>Rango:</b> {fechaLabel(detalle.fechaInicio)} → {fechaLabel(detalle.fechaFin)} ({detalle.cantidadDias} días)</p>
                            )}
                            <p><b>Emisión:</b> {fechaLabel(detalle.fechaEmision)}</p>
                            <p><b>Generada por:</b> {detalle.generadaPor || '-'}</p>
                            <p>
                                <b>Estado:</b>{' '}
                                <span className={`const-est-badge ${detalle.estado === 'Activa' ? 'activa' : 'anulada'}`}>
                                    {detalle.estado}
                                </span>
                            </p>
                            <p><b>Trajo documento:</b> {detalle.trajoDocumento ? 'Sí' : 'No'}</p>
                            <p><b>Encargado presente:</b> {detalle.encargadoPresente ? 'Sí' : 'No'}</p>
                            {detalle.tipo === 'Incapacidad' && (
                                <p><b>Permiso automático en asistencias:</b> {detalle.permisoAsistencias ? 'Sí' : 'No'}</p>
                            )}
                            {detalle.observaciones && <p><b>Observaciones:</b> {detalle.observaciones}</p>}
                            <p><b>Documento adjunto:</b> {detalle.tieneDocumento ? detalle.nombreArchivo : 'Sin adjunto'}</p>
                        </div>
                        {detalle.tieneDocumento && (
                            <div style={{ marginTop: '14px' }}>
                                <button className="btn btn-success btn-sm" onClick={() => descargarDocumento(detalle)} disabled={descargando}>
                                    {descargando ? 'Descargando...' : 'Descargar Documento'}
                                </button>
                            </div>
                        )}
                        <div className="const-est-modal-buttons">
                            <button className="btn btn-cancel" onClick={() => setDetalle(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ConstanciasEstudiante;