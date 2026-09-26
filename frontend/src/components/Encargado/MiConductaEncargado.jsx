// Componente MiConductaEncargado: consulta las faltas disciplinarias y la
// calificación de conducta de los hijos del encargado. Permite elegir entre
// varios hijos cuando el encargado tiene más de un estudiante asociado.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const MiConductaEncargado = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [hijos, setHijos] = useState([]);
    const [selectedHijo, setSelectedHijo] = useState(null);
    const [conducta, setConducta] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingConducta, setLoadingConducta] = useState(false);
    const [periodos, setPeriodos] = useState([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [filterGravedad, setFilterGravedad] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const [mensaje, setMensaje] = useState(null);

    // ============================================================
    // ESTILOS INLINE
    // ============================================================
    const S = {
        card: { background: '#ffffff', borderRadius: '12px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,.05)', marginBottom: '20px' },
        cardTitle: { margin: '0 0 16px', color: '#1e3a5f', fontSize: '17px', fontWeight: 700 },
        label: { display: 'block', fontWeight: 600, color: '#34495e', fontSize: '13px', marginBottom: '6px' },
        input: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#ffffff', color: '#1e293b', fontFamily: 'inherit' },
        btn: { padding: '9px 16px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: '#e5e7eb', color: '#334155' },
        statCard: { background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' },
        statNumber: { fontSize: '26px', fontWeight: 700, lineHeight: 1.2 },
        statLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#64748b', fontWeight: 600 },
        th: { padding: '12px 10px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700, color: '#1e293b', background: '#f8fafc', borderBottom: '2px solid #cbd5e1' },
        td: { padding: '10px', color: '#1e293b', background: '#ffffff', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle', fontSize: '13px' },
        badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.3px' },
        infoBox: { marginTop: '16px', padding: '14px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius: '8px', fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }
    };

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => { cargarDatos(); }, []);

    useEffect(() => {
        if (selectedHijo && selectedPeriodo) cargarConductaPorPeriodo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHijo, selectedPeriodo]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const hijosRes = await API.get(`/encargados/${user?.idUsuario}/estudiantes`);
            const hijosData = hijosRes.data || [];
            setHijos(hijosData);
            if (hijosData.length > 0) setSelectedHijo(hijosData[0]);

            const periodosRes = await API.get('/periodosacademicos');
            const periodosData = periodosRes.data || [];
            setPeriodos(periodosData);
            if (periodosData.length > 0) {
                const periodoActivo = periodosData.find(p => p.estado === 'Activo');
                setSelectedPeriodo(String(periodoActivo?.idPeriodo || periodosData[0].idPeriodo));
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarConductaPorPeriodo = async () => {
        if (!selectedHijo || !selectedPeriodo) return;
        try {
            setLoadingConducta(true);
            const response = await API.get(`/conducta/estudiante/${selectedHijo.idEstudiante}/periodo/${selectedPeriodo}`);
            const data = response.data || {};
            setConducta(data.conducta || []);
            setResumen({
                totalPuntos: data.totalPuntos || 0,
                calificacion: data.calificacion || 'Sin calificar',
                registroPeriodo: data.registroPeriodo || null
            });
        } catch (error) {
            console.error('Error al cargar conducta:', error);
            mostrarMensaje('Error al cargar conducta', 'error');
            setConducta([]);
            setResumen(null);
        } finally {
            setLoadingConducta(false);
        }
    };

    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    const getIniciales = (hijo) => {
        if (!hijo) return '??';
        const n = (hijo.nombres || '').trim().charAt(0).toUpperCase();
        const a = (hijo.apellidos || '').trim().charAt(0).toUpperCase();
        return `${n}${a}`;
    };

    const getGravedadInfo = (gravedad) => {
        switch (gravedad) {
            case 'Leve': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a', label: 'Leve' };
            case 'Moderada': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22', label: 'Moderada' };
            case 'Grave': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626', label: 'Grave' };
            case 'Muy Grave': return { bg: '#fecaca', color: '#7f1d1d', border: '#991b1b', label: 'Muy Grave' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8', label: gravedad || 'Normal' };
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            return new Date(fecha).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return fecha; }
    };

    const formatearFechaHora = (fecha) => {
        if (!fecha) return '-';
        try {
            return new Date(fecha).toLocaleString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return fecha; }
    };

    const getCalificacionColor = (calificacion) => {
        if (!calificacion) return '#64748b';
        const c = String(calificacion).toUpperCase();
        if (c.includes('EXCELENTE') || c === 'A' || c === '10' || c === '9') return '#16a34a';
        if (c.includes('MUY BUENO') || c === 'B' || c === '8') return '#0e7490';
        if (c.includes('BUENO') || c === 'C' || c === '7') return '#3b82f6';
        if (c.includes('REGULAR') || c === 'D' || c === '6') return '#e67e22';
        return '#dc2626';
    };

    const conductaFiltrada = useMemo(() => {
        return conducta.filter(c => {
            if (filterGravedad !== 'todas' && c.gravedad !== filterGravedad) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (c.tipo && c.tipo.toLowerCase().includes(term)) || (c.descripcion && c.descripcion.toLowerCase().includes(term));
            }
            return true;
        });
    }, [conducta, filterGravedad, busqueda]);

    const stats = useMemo(() => ({
        total: conducta.length,
        leves: conducta.filter(c => c.gravedad === 'Leve').length,
        moderadas: conducta.filter(c => c.gravedad === 'Moderada').length,
        graves: conducta.filter(c => c.gravedad === 'Grave' || c.gravedad === 'Muy Grave').length
    }), [conducta]);

    const filtrosActivos = (filterGravedad !== 'todas' ? 1 : 0) + (busqueda ? 1 : 0);
    const limpiarFiltros = () => { setFilterGravedad('todas'); setBusqueda(''); };

    if (loading) {
        return (
            <DashboardLayout title="Conducta del Estudiante">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>Cargando conducta...</div>
            </DashboardLayout>
        );
    }

    if (hijos.length === 0) {
        return (
            <DashboardLayout title="Conducta del Estudiante">
                <div style={{ padding: '20px', background: '#ffffff' }}>
                    <div style={S.card}>
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>No tienes estudiantes asociados</h3>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>Contacta a Registro Académico para vincular a tus hijos a tu cuenta.</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Conducta del Estudiante">
            <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>Conducta del Estudiante</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>Consulta las faltas y la calificación de conducta por período</p>
                </div>

                {mensaje && (
                    <div style={{ padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, background: mensaje.tipo === 'success' ? '#dcfce7' : '#fee2e2', color: mensaje.tipo === 'success' ? '#15803d' : '#b91c1c', borderLeft: `4px solid ${mensaje.tipo === 'success' ? '#16a34a' : '#dc2626'}` }}>
                        {mensaje.texto}
                    </div>
                )}

                <div style={S.card}>
                    <h3 style={S.cardTitle}>Seleccionar Estudiante y Período</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                        <div>
                            <label style={S.label}>Estudiante</label>
                            <select value={selectedHijo?.idEstudiante || ''} onChange={(e) => { const hijo = hijos.find(h => Number(h.idEstudiante) === Number(e.target.value)); setSelectedHijo(hijo); }} style={S.input}>
                                {hijos.map(h => (<option key={h.idEstudiante} value={h.idEstudiante}>{h.nombres} {h.apellidos} - {h.codigoEstudiante}</option>))}
                            </select>
                        </div>
                        <div>
                            <label style={S.label}>Período</label>
                            <select value={selectedPeriodo} onChange={(e) => setSelectedPeriodo(e.target.value)} style={S.input}>
                                {periodos.map(p => (<option key={p.idPeriodo} value={p.idPeriodo}>{p.nombre || p.nombrePeriodo} - {p.anioLectivo} {p.estado === 'Activo' ? '- Activo' : ''}</option>))}
                            </select>
                        </div>
                    </div>
                </div>

                {selectedHijo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#eff6ff', border: '3px solid #bfdbfe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, flexShrink: 0 }}>
                            {getIniciales(selectedHijo)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h2 style={{ margin: '0 0 4px', fontSize: '18px', color: '#1e3a5f', fontWeight: 700 }}>{selectedHijo.nombres} {selectedHijo.apellidos}</h2>
                            <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '13px' }}>{selectedHijo.clase?.nombreClase || selectedHijo.nombreClase || 'Sin clase asignada'}</p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '10px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', fontFamily: 'monospace', fontWeight: 600 }}>{selectedHijo.codigoEstudiante}</span>
                            </div>
                        </div>
                    </div>
                )}

                {loadingConducta ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>Cargando conducta...</div>
                ) : resumen && (
                    <div style={S.card}>
                        <h3 style={S.cardTitle}>Resumen de Conducta</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                            <div style={{ ...S.statCard, borderTop: '4px solid #dc2626' }}>
                                <span style={{ ...S.statNumber, color: '#dc2626' }}>{resumen.totalPuntos}</span>
                                <span style={S.statLabel}>Puntos de Demérito</span>
                            </div>
                            <div style={{ ...S.statCard, borderTop: `4px solid ${getCalificacionColor(resumen.registroPeriodo?.calificacion)}` }}>
                                <span style={{ ...S.statNumber, color: getCalificacionColor(resumen.registroPeriodo?.calificacion) }}>{resumen.registroPeriodo?.calificacion || 'Sin asignar'}</span>
                                <span style={S.statLabel}>Calificación Oficial</span>
                            </div>
                        </div>
                        {resumen.registroPeriodo ? (
                            <div style={S.infoBox}>
                                <div style={{ marginBottom: '6px' }}><strong>Fecha del cambio:</strong> {formatearFechaHora(resumen.registroPeriodo.fechaCambio)}</div>
                                <div><strong>Observación:</strong> {resumen.registroPeriodo.observacion || 'Sin observaciones'}</div>
                            </div>
                        ) : (
                            <div style={{ marginTop: '16px', padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #94a3b8', borderRadius: '8px', fontSize: '13px', color: '#64748b' }}>
                                Aún no se ha asignado una calificación oficial por Dirección para este período.
                            </div>
                        )}
                    </div>
                )}

                {conducta.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                        <div style={{ ...S.statCard, borderTop: '4px solid #1e3a5f' }}><span style={{ ...S.statNumber, color: '#1e3a5f' }}>{stats.total}</span><span style={S.statLabel}>Total Faltas</span></div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #16a34a' }}><span style={{ ...S.statNumber, color: '#16a34a' }}>{stats.leves}</span><span style={S.statLabel}>Leves</span></div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #e67e22' }}><span style={{ ...S.statNumber, color: '#b45309' }}>{stats.moderadas}</span><span style={S.statLabel}>Moderadas</span></div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #dc2626' }}><span style={{ ...S.statNumber, color: '#dc2626' }}>{stats.graves}</span><span style={S.statLabel}>Graves</span></div>
                    </div>
                )}

                {conducta.length > 0 && (
                    <div style={S.card}>
                        <h3 style={{ ...S.cardTitle, marginBottom: '16px' }}>
                            Filtros de Búsqueda
                            {filtrosActivos > 0 && (<span style={{ display: 'inline-block', background: '#3b82f6', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', marginLeft: '8px' }}>{filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}</span>)}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                            <div>
                                <label style={S.label}>Gravedad</label>
                                <select value={filterGravedad} onChange={(e) => setFilterGravedad(e.target.value)} style={S.input}>
                                    <option value="todas">Todas las gravedades</option>
                                    <option value="Leve">Solo Leves</option>
                                    <option value="Moderada">Solo Moderadas</option>
                                    <option value="Grave">Solo Graves</option>
                                    <option value="Muy Grave">Solo Muy Graves</option>
                                </select>
                            </div>
                            <div>
                                <label style={S.label}>Buscar</label>
                                <input type="text" placeholder="Buscar por tipo o descripción..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={S.input} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button style={S.btn} onClick={cargarConductaPorPeriodo}>Recargar</button>
                                {filtrosActivos > 0 && (<button style={S.btn} onClick={limpiarFiltros}>Limpiar Filtros</button>)}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>Mostrando <strong>{conductaFiltrada.length}</strong> de {conducta.length} faltas</div>
                        </div>
                    </div>
                )}

                <div style={S.card}>
                    <h3 style={S.cardTitle}>Historial de Faltas</h3>
                    {conducta.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>Sin faltas registradas</h3>
                            <p style={{ margin: 0, fontSize: '13px' }}>El estudiante no tiene faltas disciplinarias registradas en este período.</p>
                        </div>
                    ) : conductaFiltrada.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>No hay faltas que coincidan</h3>
                            <p style={{ margin: 0, fontSize: '13px' }}>Prueba ajustando los filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...S.th, width: '120px' }}>Fecha</th>
                                        <th style={{ ...S.th, width: '140px' }}>Tipo</th>
                                        <th style={{ ...S.th, width: '130px' }}>Gravedad</th>
                                        <th style={S.th}>Descripción</th>
                                        <th style={{ ...S.th, width: '90px', textAlign: 'center' }}>Puntos</th>
                                        <th style={{ ...S.th, width: '110px' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conductaFiltrada.map((c) => {
                                        const gravedadInfo = getGravedadInfo(c.gravedad);
                                        return (
                                            <tr key={c.idFaltas}>
                                                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '12px' }}>{formatearFecha(c.fecha)}</td>
                                                <td style={{ ...S.td, fontWeight: 600, color: '#0f172a' }}>{c.tipo || '-'}</td>
                                                <td style={S.td}>
                                                    <span style={{ ...S.badge, backgroundColor: gravedadInfo.bg, color: gravedadInfo.color, border: `1px solid ${gravedadInfo.border}` }}>{gravedadInfo.label}</span>
                                                </td>
                                                <td style={{ ...S.td, color: '#475569' }}>{c.descripcion || '-'}</td>
                                                <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>{c.puntosDemerito || 0}</td>
                                                <td style={S.td}>
                                                    <span style={{ ...S.badge, backgroundColor: c.estado === 'Activa' ? '#dcfce7' : '#f1f5f9', color: c.estado === 'Activa' ? '#15803d' : '#475569', border: `1px solid ${c.estado === 'Activa' ? '#bbf7d0' : '#cbd5e1'}` }}>{c.estado}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MiConductaEncargado;