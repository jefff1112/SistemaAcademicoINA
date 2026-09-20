// Componente Gestión de Conducta (Docente): registra faltas y amonestaciones
// a los estudiantes de las clases que imparte el docente, con consulta de historial.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionConductaDocente = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [filtros, setFiltros] = useState({
        idClase: '',
        idPeriodo: ''
    });
    const [estudiantesClase, setEstudiantesClase] = useState([]);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [conducta, setConducta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [savingFalta, setSavingFalta] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [docente, setDocente] = useState(null);

    const [formData, setFormData] = useState({
        idEstudiante: '',
        tipo: 'Amonestacion',
        gravedad: 'Leve',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
    });

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
        select: {
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
        textarea: {
            width: '100%',
            padding: '9px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box',
            background: '#ffffff',
            color: '#1e293b',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '80px'
        },
        btn: {
            padding: '9px 16px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
        },
        btnPrimary: { background: '#1e3a5f', color: '#fff' },
        btnSuccess: { background: '#16a34a', color: '#fff' },
        btnDanger: { background: '#dc2626', color: '#fff' },
        btnSecondary: { background: '#e5e7eb', color: '#334155' },
        btnSm: { padding: '5px 12px', fontSize: '12px' },
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
        th: {
            padding: '12px 10px',
            textAlign: 'left',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '.5px',
            fontWeight: 700,
            color: '#1e293b',
            background: '#f8fafc',
            borderBottom: '2px solid #cbd5e1'
        },
        td: {
            padding: '10px',
            color: '#1e293b',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            verticalAlign: 'middle',
            fontSize: '13px'
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
            background: '#eff6ff',
            borderLeft: '4px solid #3b82f6',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#1e40af',
            lineHeight: 1.6
        }
    };

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const docentesRes = await API.get('/docentes');
            const docenteData = docentesRes.data.find(d => d.codigoDocente === user?.codigo);

            if (docenteData) {
                setDocente(docenteData);

                // Cargar clases del docente y periodos
                const [clasesRes, periodosRes] = await Promise.all([
                    API.get(`/docentes/${docenteData.idDocente}/clases/${new Date().getFullYear()}`),
                    API.get('/periodosacademicos')
                ]);

                const clasesData = clasesRes.data || [];
                const periodosData = periodosRes.data || [];

                setClases(clasesData);
                setPeriodos(periodosData);

                // Auto-seleccionar el primer periodo activo o el primero disponible
                const periodoActivo = periodosData.find(p => p.estado === 'Activo');
                const periodoInicial = periodoActivo || periodosData[0];

                if (clasesData.length > 0 && periodoInicial) {
                    setFiltros({
                        idClase: String(clasesData[0].idClase),
                        idPeriodo: String(periodoInicial.idPeriodo)
                    });
                    cargarEstudiantesClase(clasesData[0].idClase, periodoInicial.idPeriodo);
                }
            } else {
                mostrarMensaje('No se encontró tu perfil de docente', 'error');
            }
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // CARGAR ESTUDIANTES DE LA CLASE
    // ============================================================
    const cargarEstudiantesClase = async (idClase, idPeriodo) => {
        setLoadingEstudiantes(true);
        setSelectedEstudiante(null);
        setConducta([]);
        setResumen(null);
        try {
            const response = await API.get(`/conducta/clase/${idClase}/periodo/${idPeriodo}`);
            setEstudiantesClase(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar estudiantes de la clase', 'error');
            setEstudiantesClase([]);
        } finally {
            setLoadingEstudiantes(false);
        }
    };

    // ============================================================
    // CARGAR CONDUCTA DE UN ESTUDIANTE
    // ============================================================
    const cargarConductaEstudiante = async (idEstudiante, idPeriodo) => {
        try {
            const response = await API.get(`/conducta/estudiante/${idEstudiante}/periodo/${idPeriodo}`);
            const data = response.data || {};
            setConducta(data.conducta || []);
            setResumen({
                totalPuntos: data.totalPuntos || 0,
                calificacion: data.calificacion || 'Sin calificar',
                registroPeriodo: data.registroPeriodo || null,
                totalFaltas: (data.conducta || []).length,
                faltasActivas: (data.conducta || []).filter(c => c.estado === 'Activa').length
            });
        } catch (error) {
            mostrarMensaje('Error al cargar conducta del estudiante', 'error');
        }
    };

    // ============================================================
    // HANDLERS
    // ============================================================
    const handleChangeClase = (e) => {
        const id = e.target.value;
        setFiltros({ ...filtros, idClase: id });
        setBusqueda('');
        if (id && filtros.idPeriodo) {
            cargarEstudiantesClase(id, filtros.idPeriodo);
        }
    };

    const handleChangePeriodo = (e) => {
        const id = e.target.value;
        setFiltros({ ...filtros, idPeriodo: id });
        setBusqueda('');
        if (id && filtros.idClase) {
            cargarEstudiantesClase(filtros.idClase, id);
        }
    };

    const handleSelectEstudiante = (e) => {
        const id = e.target.value;
        setSelectedEstudiante(id);
        if (id) {
            cargarConductaEstudiante(id, filtros.idPeriodo);
        } else {
            setConducta([]);
            setResumen(null);
        }
    };

    // ============================================================
    // REGISTRAR FALTA / AMONESTACIÓN
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.descripcion.trim()) {
            mostrarMensaje('La descripción es requerida', 'error');
            return;
        }

        setSavingFalta(true);
        try {
            await API.post('/conducta', {
                idEstudiante: parseInt(formData.idEstudiante),
                idDocente: docente?.idDocente || null,
                tipo: formData.tipo,
                gravedad: formData.gravedad,
                descripcion: formData.descripcion.trim(),
                fecha: formData.fecha,
                idPeriodo: parseInt(filtros.idPeriodo)
            });

            mostrarMensaje('Registro de conducta guardado correctamente', 'success');
            setShowModal(false);
            setFormData({
                idEstudiante: '',
                tipo: 'Amonestacion',
                gravedad: 'Leve',
                descripcion: '',
                fecha: new Date().toISOString().split('T')[0]
            });

            // Refrescar
            if (filtros.idClase && filtros.idPeriodo) {
                await cargarEstudiantesClase(filtros.idClase, filtros.idPeriodo);
                if (selectedEstudiante) {
                    setSelectedEstudiante(selectedEstudiante);
                    cargarConductaEstudiante(selectedEstudiante, filtros.idPeriodo);
                }
            }
        } catch (error) {
            let msg = 'Error al registrar';
            if (error.response?.data?.mensaje) msg = error.response.data.mensaje;
            else if (error.response?.data?.message) msg = error.response.data.message;
            mostrarMensaje(msg, 'error');
        } finally {
            setSavingFalta(false);
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
    const getGravedadInfo = (gravedad) => {
        switch (gravedad) {
            case 'Leve': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a', label: 'Leve' };
            case 'Moderada': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22', label: 'Moderada' };
            case 'Grave': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626', label: 'Grave' };
            case 'Muy Grave': return { bg: '#fecaca', color: '#7f1d1d', border: '#991b1b', label: 'Muy Grave' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8', label: gravedad || 'Normal' };
        }
    };

    const getCalificacionInfo = (calificacion) => {
        switch (calificacion) {
            case 'Excelente': return { bg: '#dcfce7', color: '#15803d' };
            case 'Muy Bueno': return { bg: '#dbeafe', color: '#1d4ed8' };
            case 'Bueno': return { bg: '#fef3c7', color: '#b45309' };
            case 'Suficiente': return { bg: '#fed7aa', color: '#c2410c' };
            case 'Necesita Mejorar': return { bg: '#fee2e2', color: '#b91c1c' };
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    const formatearFecha = (fecha) => {
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

    // ============================================================
    // FILTRADO
    // ============================================================
    const estudiantesFiltrados = useMemo(() => {
        const term = busqueda.trim().toLowerCase();
        if (!term) return estudiantesClase;
        return estudiantesClase.filter(e =>
            `${e.nombres} ${e.apellidos}`.toLowerCase().includes(term) ||
            (e.codigoEstudiante && e.codigoEstudiante.toLowerCase().includes(term))
        );
    }, [estudiantesClase, busqueda]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Conducta">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    Cargando...
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER SIN CLASES
    // ============================================================
    if (clases.length === 0) {
        return (
            <DashboardLayout title="Gestión de Conducta - Docente">
                <div style={{ padding: '20px', background: '#ffffff' }}>
                    <div style={S.card}>
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <h3 style={{ color: '#334155', margin: '0 0 8px', fontSize: '16px' }}>
                                No tienes clases asignadas
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                                Contacta a Dirección o Registro Académico para que te asignen clases antes de registrar conducta.
                            </p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Conducta - Docente">
            <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* HEADER */}
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1e3a5f', fontWeight: 700 }}>
                        Gestión de Conducta
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                        {docente?.nombreCompleto || `${docente?.nombres || ''} ${docente?.apellidos || ''}`}
                        {' '}- Registra amonestaciones y faltas a tus estudiantes
                    </p>
                </div>

                {/* INFO BOX */}
                <div style={S.infoBox}>
                    <strong>Nota:</strong> Como docente puedes registrar faltas y amonestaciones a los estudiantes de tus clases.
                    La calificación oficial de conducta por período es asignada por Dirección o Registro Académico.
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

                {/* FILTROS */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Filtros de Consulta</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        <div>
                            <label style={S.label}>Clase</label>
                            <select value={filtros.idClase} onChange={handleChangeClase} style={S.select}>
                                <option value="">Seleccionar Clase</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nivel || ''} {c.nombreClase} {c.seccion ? `- ${c.seccion}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={S.label}>Período</label>
                            <select value={filtros.idPeriodo} onChange={handleChangePeriodo} style={S.select}>
                                <option value="">Seleccionar Período</option>
                                {periodos.map(p => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombre || p.nombrePeriodo} - {p.anioLectivo} {p.estado === 'Activo' ? '- Activo' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ESTUDIANTE */}
                    {filtros.idClase && filtros.idPeriodo && (
                        <div style={{ marginTop: '16px' }}>
                            <label style={S.label}>Estudiante</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={{ ...S.input, marginBottom: '10px' }}
                                disabled={estudiantesClase.length === 0}
                            />
                            <select
                                value={selectedEstudiante || ''}
                                onChange={handleSelectEstudiante}
                                style={S.select}
                                disabled={estudiantesFiltrados.length === 0}
                            >
                                <option value="">Seleccionar Estudiante</option>
                                {estudiantesFiltrados.map(e => (
                                    <option key={e.idEstudiante} value={e.idEstudiante}>
                                        {e.apellidos}, {e.nombres} ({e.codigoEstudiante})
                                    </option>
                                ))}
                            </select>
                            {estudiantesClase.length > 0 && (
                                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>
                                    Mostrando <strong>{estudiantesFiltrados.length}</strong> de {estudiantesClase.length} estudiantes
                                </p>
                            )}
                        </div>
                    )}

                    {/* ACCIONES */}
                    {selectedEstudiante && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                            <button
                                style={{ ...S.btn, ...S.btnPrimary }}
                                onClick={() => {
                                    setFormData({ ...formData, idEstudiante: selectedEstudiante });
                                    setShowModal(true);
                                }}
                            >
                                Registrar Falta o Amonestación
                            </button>
                        </div>
                    )}
                </div>

                {/* ESTADÍSTICAS */}
                {resumen && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        <div style={{ ...S.statCard, borderTop: '4px solid #dc2626' }}>
                            <span style={{ ...S.statNumber, color: '#dc2626' }}>{resumen.totalPuntos}</span>
                            <span style={S.statLabel}>Puntos de Demérito</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #3b82f6' }}>
                            <span style={{
                                ...S.statNumber,
                                color: resumen.registroPeriodo
                                    ? getCalificacionInfo(resumen.registroPeriodo.calificacion).color
                                    : '#64748b',
                                fontSize: '16px'
                            }}>
                                {resumen.registroPeriodo?.calificacion || 'Sin asignar'}
                            </span>
                            <span style={S.statLabel}>Calificación Oficial</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #1e3a5f' }}>
                            <span style={{ ...S.statNumber, color: '#1e3a5f' }}>{resumen.totalFaltas}</span>
                            <span style={S.statLabel}>Total Registros</span>
                        </div>
                        <div style={{ ...S.statCard, borderTop: '4px solid #e67e22' }}>
                            <span style={{ ...S.statNumber, color: '#b45309' }}>{resumen.faltasActivas}</span>
                            <span style={S.statLabel}>Activas</span>
                        </div>
                    </div>
                )}

                {/* INFO DE CALIFICACIÓN OFICIAL */}
                {resumen?.registroPeriodo && (
                    <div style={S.infoBox}>
                        <div style={{ marginBottom: '6px' }}>
                            <strong>Calificación registrada el:</strong>{' '}
                            {new Date(resumen.registroPeriodo.fechaCambio).toLocaleString('es-SV')}
                        </div>
                        <div>
                            <strong>Observación:</strong> {resumen.registroPeriodo.observacion || '-'}
                        </div>
                    </div>
                )}

                {/* HISTORIAL DE FALTAS */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>
                        Historial de Faltas y Amonestaciones
                        {conducta.length > 0 && (
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
                                {conducta.length}
                            </span>
                        )}
                    </h3>

                    {!selectedEstudiante ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                            {estudiantesClase.length > 0
                                ? 'Selecciona un estudiante para ver su historial de conducta'
                                : 'Selecciona una clase y un período para comenzar'}
                        </div>
                    ) : conducta.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                            Este estudiante no tiene faltas ni amonestaciones registradas en este período
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...S.th, width: '110px' }}>Fecha</th>
                                        <th style={{ ...S.th, width: '130px' }}>Tipo</th>
                                        <th style={{ ...S.th, width: '120px' }}>Gravedad</th>
                                        <th style={S.th}>Descripción</th>
                                        <th style={{ ...S.th, width: '80px', textAlign: 'center' }}>Puntos</th>
                                        <th style={{ ...S.th, width: '110px' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conducta.map((c) => {
                                        const gravedadInfo = getGravedadInfo(c.gravedad);
                                        return (
                                            <tr key={c.idFaltas}>
                                                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {formatearFecha(c.fecha)}
                                                </td>
                                                <td style={{ ...S.td, fontWeight: 600 }}>{c.tipo}</td>
                                                <td style={S.td}>
                                                    <span style={{
                                                        ...S.badge,
                                                        backgroundColor: gravedadInfo.bg,
                                                        color: gravedadInfo.color,
                                                        border: `1px solid ${gravedadInfo.border}`
                                                    }}>
                                                        {gravedadInfo.label}
                                                    </span>
                                                </td>
                                                <td style={{ ...S.td, color: '#475569' }}>{c.descripcion || '-'}</td>
                                                <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>
                                                    {c.puntosDemerito || 0}
                                                </td>
                                                <td style={S.td}>
                                                    <span style={{
                                                        ...S.badge,
                                                        backgroundColor: c.estado === 'Activa' ? '#dcfce7' : '#f1f5f9',
                                                        color: c.estado === 'Activa' ? '#15803d' : '#475569',
                                                        border: `1px solid ${c.estado === 'Activa' ? '#bbf7d0' : '#cbd5e1'}`
                                                    }}>
                                                        {c.estado}
                                                    </span>
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

            {/* MODAL REGISTRAR */}
            {showModal && (
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
                    onClick={() => !savingFalta && setShowModal(false)}
                >
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            width: '90%',
                            maxWidth: '560px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: '24px',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,.1)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '17px', fontWeight: 700 }}>
                                Registrar Falta o Amonestación
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={savingFalta}
                                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}
                            >
                                X
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={S.label}>Tipo *</label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    required
                                    style={S.select}
                                >
                                    <option value="Amonestacion">Amonestación</option>
                                    <option value="Falta">Falta</option>
                                    <option value="Demerito">Demérito</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={S.label}>Gravedad *</label>
                                <select
                                    value={formData.gravedad}
                                    onChange={(e) => setFormData({ ...formData, gravedad: e.target.value })}
                                    required
                                    style={S.select}
                                >
                                    <option value="Leve">Leve</option>
                                    <option value="Moderada">Moderada</option>
                                    <option value="Grave">Grave</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={S.label}>Descripción *</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    required
                                    placeholder="Describe el motivo de la falta o amonestación..."
                                    style={S.textarea}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={S.label}>Fecha</label>
                                <input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    style={S.input}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    type="button"
                                    style={{ ...S.btn, ...S.btnSecondary }}
                                    onClick={() => setShowModal(false)}
                                    disabled={savingFalta}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{ ...S.btn, ...S.btnPrimary, opacity: savingFalta ? 0.6 : 1 }}
                                    disabled={savingFalta}
                                >
                                    {savingFalta ? 'Guardando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionConductaDocente;