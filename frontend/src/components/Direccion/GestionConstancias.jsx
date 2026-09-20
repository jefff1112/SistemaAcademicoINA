// Componente GestionConstancias (Direccion) - MEJORADO
// Emision, edicion, anulacion y consulta de constancias.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionConstancias = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [estudiantes, setEstudiantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [constancias, setConstancias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [formatoGenerar, setFormatoGenerar] = useState('pdf');

    const [form, setForm] = useState({
        idEstudiante: '',
        tipo: 'Estudio',
        motivo: '',
        fechaInicio: '',
        cantidadDias: '',
        trajoDocumento: false,
        encargadoPresente: false,
        permisoAsistencias: false,
        observaciones: ''
    });
    const [archivo, setArchivo] = useState(null);
    const [editandoId, setEditandoId] = useState(null);
    const [detalle, setDetalle] = useState(null);

    // Filtros
    const [filtroClase, setFiltroClase] = useState('');
    const [filtroBusqueda, setFiltroBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
    const [claseEstudianteForm, setClaseEstudianteForm] = useState('');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [estudiantesRes, constanciasRes, clasesRes] = await Promise.all([
                API.get('/estudiantes'),
                API.get('/constancias'),
                API.get('/clases')
            ]);
            setEstudiantes(estudiantesRes.data || []);
            setConstancias(constanciasRes.data || []);
            setClases([...(clasesRes.data || [])].sort((a, b) => b.anioLectivo - a.anioLectivo || a.nombreClase.localeCompare(b.nombreClase)));
        } catch (error) {
            console.error('Error cargando datos:', error);
            mostrarMensaje('Error al cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo) => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const cambiarCampo = (campo, valor) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const resetForm = () => {
        setForm({
            idEstudiante: '',
            tipo: 'Estudio',
            motivo: '',
            fechaInicio: '',
            cantidadDias: '',
            trajoDocumento: false,
            encargadoPresente: false,
            permisoAsistencias: false,
            observaciones: ''
        });
        setArchivo(null);
        setEditandoId(null);
        setFormatoGenerar('pdf');
    };

    const tipoLabel = (tipo) => {
        const tipos = {
            Estudio: 'Estudio',
            Conducta: 'Conducta',
            Incapacidad: 'Incapacidad / Permiso',
            'titulo_en_proceso': 'Título en Proceso'
        };
        return tipos[tipo] || tipo;
    };

    const tipoBadge = (tipo) => {
        switch (tipo) {
            case 'Estudio': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            case 'Conducta': return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
            case 'Incapacidad': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'titulo_en_proceso': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    const nombreEstudiante = (id) => {
        const est = estudiantes.find(e => e.idEstudiante === parseInt(id));
        return est ? `${est.nombres} ${est.apellidos}` : `#${id}`;
    };

    const fechaLabel = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-SV', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const esIncapacidad = form.tipo === 'Incapacidad';

    const formatosDisponibles = [
        { valor: 'pdf', etiqueta: 'PDF' },
        { valor: 'word', etiqueta: 'Word (.docx)' },
        { valor: 'excel', etiqueta: 'Excel (.xlsx)' }
    ];

    const limpiarFiltros = () => {
        setFiltroClase('');
        setFiltroBusqueda('');
        setFiltroTipo('');
        setFiltroEstado('');
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const constanciasFiltradas = useMemo(() => {
        const terminoBusqueda = filtroBusqueda.trim().toLowerCase();
        return constancias.filter(c => {
            if (filtroClase && c.clase !== filtroClase) return false;
            if (filtroTipo && c.tipo !== filtroTipo) return false;
            if (filtroEstado && c.estado !== filtroEstado) return false;
            if (!terminoBusqueda) return true;
            const nombre = (c.estudiante || nombreEstudiante(c.idEstudiante)).toLowerCase();
            const codigo = (c.codigoEstudiante || '').toLowerCase();
            const nie = (c.nie || '').toLowerCase();
            return nombre.includes(terminoBusqueda) || codigo.includes(terminoBusqueda) || nie.includes(terminoBusqueda);
        });
    }, [constancias, filtroClase, filtroTipo, filtroEstado, filtroBusqueda]);

    const stats = useMemo(() => ({
        total: constancias.length,
        activas: constancias.filter(c => c.estado === 'Activa').length,
        anuladas: constancias.filter(c => c.estado === 'Anulada').length,
        estudio: constancias.filter(c => c.tipo === 'Estudio').length,
        conducta: constancias.filter(c => c.tipo === 'Conducta').length,
        incapacidad: constancias.filter(c => c.tipo === 'Incapacidad').length
    }), [constancias]);

    const filtrosActivos = [filtroClase, filtroBusqueda, filtroTipo, filtroEstado].filter(Boolean).length;

    // Estudiantes filtrados en el formulario
    const estudiantesForm = useMemo(() => {
        const terminoEstudiante = busquedaEstudiante.trim().toLowerCase();
        const claseFormSeleccionada = parseInt(claseEstudianteForm) || null;
        return estudiantes.filter(e =>
            (!claseFormSeleccionada || e.idClase === claseFormSeleccionada) &&
            (!terminoEstudiante ||
                `${e.nombres} ${e.apellidos} ${e.codigoEstudiante || ''} ${e.nie || ''} ${e.dui || ''}`.toLowerCase().includes(terminoEstudiante))
        );
    }, [estudiantes, claseEstudianteForm, busquedaEstudiante]);

    // ============================================================
    // GENERAR CONSTANCIA
    // ============================================================
    const generarConstancia = async () => {
        if (!form.idEstudiante) {
            mostrarMensaje('Seleccione un estudiante', 'error');
            return;
        }
        setGuardando(true);
        setMensaje(null);
        try {
            const timestamp = Date.now();
            const res = await API.get(`/constancias/generar/${form.idEstudiante}/${formatoGenerar}?_t=${timestamp}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            const estudiante = estudiantes.find(e => e.idEstudiante === parseInt(form.idEstudiante));
            const codigo = estudiante?.codigoEstudiante || 'estudiante';
            let nombreArchivo;
            if (formatoGenerar === 'pdf') nombreArchivo = `constancia_${codigo}.pdf`;
            else if (formatoGenerar === 'word') nombreArchivo = `constancia_${codigo}.docx`;
            else nombreArchivo = `reporte_${codigo}.xlsx`;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            mostrarMensaje('Constancia generada y descargada correctamente', 'success');
        } catch (error) {
            console.error('Error generando constancia:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al generar la constancia', 'error');
        } finally {
            setGuardando(false);
        }
    };

    // ============================================================
    // EMITIR
    // ============================================================
    const emitir = async () => {
        if (!form.idEstudiante) {
            mostrarMensaje('Seleccione un estudiante', 'error');
            return;
        }
        if (form.tipo === 'Incapacidad') {
            if (!form.fechaInicio || !form.cantidadDias) {
                mostrarMensaje('Para incapacidad debe indicar fecha de inicio y cantidad de días', 'error');
                return;
            }
            if (parseInt(form.cantidadDias) < 1) {
                mostrarMensaje('La cantidad de días debe ser mayor a 0', 'error');
                return;
            }
        }

        setGuardando(true);
        setMensaje(null);

        const fd = new FormData();
        fd.append('IdEstudiante', form.idEstudiante);
        fd.append('Tipo', form.tipo);
        fd.append('Motivo', form.motivo || '');
        fd.append('FechaInicio', form.fechaInicio || '');
        fd.append('CantidadDias', form.cantidadDias || '');
        fd.append('TrajoDocumento', Boolean(form.trajoDocumento).toString());
        fd.append('EncargadoPresente', Boolean(form.encargadoPresente).toString());
        fd.append('PermisoAsistencias', Boolean(form.permisoAsistencias).toString());
        fd.append('Observaciones', form.observaciones || '');
        if (archivo) fd.append('Documento', archivo);

        try {
            if (editandoId) {
                await API.put(`/constancias/${editandoId}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                mostrarMensaje('Constancia actualizada correctamente', 'success');
            } else {
                await API.post('/constancias', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                mostrarMensaje('Constancia emitida correctamente', 'success');
            }
            resetForm();
            await cargarDatos();
        } catch (error) {
            console.error('Error guardando constancia:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar la constancia', 'error');
        } finally {
            setGuardando(false);
        }
    };

    // ============================================================
    // EDITAR
    // ============================================================
    const editar = (c) => {
        setEditandoId(c.idConstancia);
        setForm({
            idEstudiante: String(c.idEstudiante),
            tipo: c.tipo,
            motivo: c.motivo || '',
            fechaInicio: c.fechaInicio ? String(c.fechaInicio).slice(0, 10) : '',
            cantidadDias: c.cantidadDias ? String(c.cantidadDias) : '',
            trajoDocumento: c.trajoDocumento || false,
            encargadoPresente: c.encargadoPresente || false,
            permisoAsistencias: c.permisoAsistencias || false,
            observaciones: c.observaciones || ''
        });
        setArchivo(null);
        setFormatoGenerar('pdf');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================================
    // ANULAR
    // ============================================================
    const anular = async (c) => {
        if (!window.confirm(`Anular la constancia de ${nombreEstudiante(c.idEstudiante)}?\nSe revertirán los permisos automáticos de asistencia aplicados.`)) return;
        try {
            await API.post(`/constancias/${c.idConstancia}/anular`);
            mostrarMensaje('Constancia anulada correctamente', 'success');
            await cargarDatos();
        } catch (error) {
            console.error('Error anulando constancia:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al anular la constancia', 'error');
        }
    };

    // ============================================================
    // DESCARGAR DOCUMENTO
    // ============================================================
    const descargarDocumento = async (c) => {
        try {
            const res = await API.get(`/constancias/${c.idConstancia}/documento`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', c.nombreArchivo || `constancia_${c.idConstancia}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando documento:', error);
            mostrarMensaje('Error al descargar el documento', 'error');
        }
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Constancias - Dirección">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Constancias - Dirección">
            <style>{`
                .const-container { display: flex; flex-direction: column; gap: 20px; }
                .const-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .const-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .const-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
                .const-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .const-field input, .const-field select, .const-field textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .const-field input:focus, .const-field select:focus, .const-field textarea:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .const-field textarea { min-height: 64px; resize: vertical; }

                .const-checks { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 14px; padding: 12px; background: #f8fafc; border-radius: 8px; }
                .const-checks label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #34495e; cursor: pointer; }
                .const-checks input[type=checkbox] { width: 16px; height: 16px; cursor: pointer; }

                .const-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }

                /* Estadísticas */
                .const-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
                .const-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .const-stat .num { font-size: 22px; font-weight: bold; display: block; line-height: 1.2; }
                .const-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .const-stat-total { background: #eff6ff; color: #1e40af; }
                .const-stat-activas { background: #dcfce7; color: #15803d; }
                .const-stat-anuladas { background: #fee2e2; color: #b91c1c; }
                .const-stat-estudio { background: #dbeafe; color: #1d4ed8; }
                .const-stat-conducta { background: #e9d5ff; color: #6b21a8; }
                .const-stat-incapacidad { background: #fef3c7; color: #b45309; }

                /* Filtros */
                .const-filtros { display: grid; grid-template-columns: 1fr 2fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
                .const-filtros input, .const-filtros select {
                    padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .const-filtros input:focus, .const-filtros select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .const-filtros-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; }
                .const-filtros-badge { font-size: 12px; color: #64748b; }

                /* Botones */
                .const-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .const-btn:disabled { opacity: .6; cursor: not-allowed; }
                .const-btn-primary { background: #1e3a5f; color: #fff; }
                .const-btn-primary:hover:not(:disabled) { background: #16293f; }
                .const-btn-success { background: #16a34a; color: #fff; }
                .const-btn-success:hover:not(:disabled) { background: #15803d; }
                .const-btn-info { background: #3b82f6; color: #fff; }
                .const-btn-info:hover:not(:disabled) { background: #2563eb; }
                .const-btn-danger { background: #dc2626; color: #fff; }
                .const-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .const-btn-secondary { background: #e5e7eb; color: #334155; }
                .const-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .const-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla */
                .const-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
                .const-tabla thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 11px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .const-tabla thead th:first-child { border-top-left-radius: 8px; }
                .const-tabla thead th:last-child { border-top-right-radius: 8px; }
                .const-tabla tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .const-tabla tbody tr:hover { background: #f8fafc; }
                .const-tabla tbody tr:nth-child(even) { background: #fafbfc; }
                .const-tabla tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .const-tabla td { padding: 10px; color: #334155; vertical-align: middle; }

                .const-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }

                .const-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .const-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .const-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .const-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                /* Formato selector */
                .format-option {
                    padding: 6px 14px; border: 2px solid #e2e8f0; border-radius: 8px;
                    margin: 4px; cursor: pointer; display: inline-block; font-size: 13px;
                    font-weight: 500; color: #64748b; transition: all .2s;
                }
                .format-option:hover { border-color: #3b82f6; color: #3b82f6; }
                .format-option.seleccionado { background: #3b82f6; color: #fff; border-color: #3b82f6; }

                /* Modal */
                .const-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .const-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 620px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .const-modal h3 { margin: 0 0 16px; color: #1e3a5f; }
                .const-detalle { font-size: 14px; }
                .const-detalle p { margin: 8px 0; color: #475569; }
                .const-detalle b { color: #1e3a5f; }
                .const-modal-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }

                /* Badge filtros activos */
                .const-badge-filtros {
                    display: inline-block;
                    background: #3b82f6;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 10px;
                    margin-left: 8px;
                }

                @media (max-width: 900px) {
                    .const-filtros { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .const-grid { grid-template-columns: 1fr; }
                    .const-filtros { grid-template-columns: 1fr; }
                    .const-tabla { font-size: 12px; }
                    .const-tabla thead th, .const-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="const-container">
                {mensaje && <div className={`const-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="const-stats">
                    <div className="const-stat const-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total</span>
                    </div>
                    <div className="const-stat const-stat-activas">
                        <span className="num">{stats.activas}</span>
                        <span className="lbl">Activas</span>
                    </div>
                    <div className="const-stat const-stat-anuladas">
                        <span className="num">{stats.anuladas}</span>
                        <span className="lbl">Anuladas</span>
                    </div>
                    <div className="const-stat const-stat-estudio">
                        <span className="num">{stats.estudio}</span>
                        <span className="lbl">Estudio</span>
                    </div>
                    <div className="const-stat const-stat-conducta">
                        <span className="num">{stats.conducta}</span>
                        <span className="lbl">Conducta</span>
                    </div>
                    <div className="const-stat const-stat-incapacidad">
                        <span className="num">{stats.incapacidad}</span>
                        <span className="lbl">Incapacidad</span>
                    </div>
                </div>

                {/* FORMULARIO EMITIR */}
                <div className="const-card">
                    <h3>{editandoId ? `Editar Constancia #${editandoId}` : 'Emitir Constancia'}</h3>

                    <div className="const-grid">
                        <div className="const-field">
                            <label>Filtrar por Clase</label>
                            <select
                                value={claseEstudianteForm}
                                onChange={(e) => {
                                    setClaseEstudianteForm(e.target.value);
                                    setBusquedaEstudiante('');
                                    cambiarCampo('idEstudiante', '');
                                }}
                            >
                                <option value="">Todas las clases</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} (Sección {c.seccion}) - {c.anioLectivo}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="const-field">
                            <label>Buscar Estudiante</label>
                            <input
                                type="text"
                                placeholder="Nombre, código, NIE o DUI..."
                                value={busquedaEstudiante}
                                onChange={(e) => setBusquedaEstudiante(e.target.value)}
                            />
                        </div>
                        <div className="const-field">
                            <label>Tipo de Constancia</label>
                            <select value={form.tipo} onChange={(e) => cambiarCampo('tipo', e.target.value)}>
                                <option value="Estudio">Constancia de Estudio</option>
                                <option value="Conducta">Constancia de Conducta</option>
                                <option value="Incapacidad">Incapacidad / Permiso</option>
                            </select>
                        </div>
                        <div className="const-field">
                            <label>Estudiante Seleccionado</label>
                            <select value={form.idEstudiante} onChange={(e) => cambiarCampo('idEstudiante', e.target.value)}>
                                <option value="">Seleccione un estudiante</option>
                                {estudiantesForm.map(e => (
                                    <option key={e.idEstudiante} value={e.idEstudiante}>
                                        {e.nombres} {e.apellidos} - Cod: {e.codigoEstudiante} {e.nie ? `| NIE: ${e.nie}` : ''}
                                    </option>
                                ))}
                            </select>
                            <small style={{ display: 'block', marginTop: '4px', color: '#64748b', fontSize: '12px' }}>
                                {estudiantesForm.length} estudiante(s) encontrado(s)
                            </small>
                        </div>

                        {esIncapacidad && (
                            <>
                                <div className="const-field">
                                    <label>Fecha de Inicio</label>
                                    <input type="date" value={form.fechaInicio} onChange={(e) => cambiarCampo('fechaInicio', e.target.value)} />
                                </div>
                                <div className="const-field">
                                    <label>Cantidad de Días</label>
                                    <input
                                        type="number" min="1" max="120"
                                        placeholder="Ej: 3"
                                        value={form.cantidadDias}
                                        onChange={(e) => cambiarCampo('cantidadDias', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        <div className="const-field" style={{ gridColumn: esIncapacidad ? 'auto' : '1 / -1' }}>
                            <label>Motivo</label>
                            <input
                                type="text"
                                placeholder="Motivo de la constancia"
                                value={form.motivo}
                                onChange={(e) => cambiarCampo('motivo', e.target.value)}
                            />
                        </div>
                        <div className="const-field">
                            <label>Observaciones</label>
                            <textarea
                                placeholder="Observaciones adicionales (opcional)"
                                value={form.observaciones}
                                onChange={(e) => cambiarCampo('observaciones', e.target.value)}
                            />
                        </div>
                        <div className="const-field">
                            <label>Documento Adjunto {editandoId ? '(dejar vacío para conservar)' : '(opcional)'}</label>
                            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setArchivo(e.target.files[0] || null)} />
                        </div>
                    </div>

                    <div className="const-checks">
                        <label>
                            <input
                                type="checkbox"
                                checked={form.trajoDocumento}
                                onChange={(e) => cambiarCampo('trajoDocumento', e.target.checked)}
                            />
                            Trajo documento
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={form.encargadoPresente}
                                onChange={(e) => cambiarCampo('encargadoPresente', e.target.checked)}
                            />
                            Encargado presente
                        </label>
                        {esIncapacidad && (
                            <label>
                                <input
                                    type="checkbox"
                                    checked={form.permisoAsistencias}
                                    onChange={(e) => cambiarCampo('permisoAsistencias', e.target.checked)}
                                />
                                Permiso automático en asistencias
                            </label>
                        )}
                    </div>

                    {form.idEstudiante && (
                        <div style={{ marginTop: '14px', padding: '12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px', display: 'block' }}>
                                Formato de generación:
                            </label>
                            {formatosDisponibles.map(f => (
                                <span
                                    key={f.valor}
                                    className={`format-option ${formatoGenerar === f.valor ? 'seleccionado' : ''}`}
                                    onClick={() => setFormatoGenerar(f.valor)}
                                >
                                    {f.etiqueta}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="const-actions">
                        <button className="const-btn const-btn-primary" onClick={emitir} disabled={guardando}>
                            {guardando ? 'Guardando...' : (editandoId ? 'Guardar Cambios' : 'Emitir Constancia')}
                        </button>
                        {form.idEstudiante && (
                            <button className="const-btn const-btn-success" onClick={generarConstancia} disabled={guardando}>
                                Generar {formatoGenerar === 'pdf' ? 'PDF' : formatoGenerar === 'word' ? 'Word' : 'Excel'}
                            </button>
                        )}
                        {editandoId && (
                            <button className="const-btn const-btn-secondary" onClick={resetForm} disabled={guardando}>
                                Cancelar Edición
                            </button>
                        )}
                    </div>
                </div>

                {/* TABLA DE CONSTANCIAS */}
                <div className="const-card">
                    <h3>
                        Constancias Emitidas
                        {filtrosActivos > 0 && (
                            <span className="const-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>

                    {constancias.length === 0 ? (
                        <p className="const-empty">No hay constancias emitidas.</p>
                    ) : (
                        <>
                            <div className="const-filtros">
                                <select value={filtroClase} onChange={(e) => setFiltroClase(e.target.value)}>
                                    <option value="">Todas las clases</option>
                                    {clases.map(c => (
                                        <option key={c.idClase} value={c.nombreClase}>
                                            {c.nombreClase} (Sección {c.seccion})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, código, NIE o DUI..."
                                    value={filtroBusqueda}
                                    onChange={(e) => setFiltroBusqueda(e.target.value)}
                                />
                                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                                    <option value="">Todos los tipos</option>
                                    <option value="Estudio">Estudio</option>
                                    <option value="Conducta">Conducta</option>
                                    <option value="Incapacidad">Incapacidad</option>
                                </select>
                                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                                    <option value="">Todos los estados</option>
                                    <option value="Activa">Activa</option>
                                    <option value="Anulada">Anulada</option>
                                </select>
                            </div>

                            <div className="const-filtros-info">
                                <button
                                    className="const-btn const-btn-secondary const-btn-sm"
                                    onClick={limpiarFiltros}
                                    disabled={filtrosActivos === 0}
                                >
                                    Limpiar Filtros
                                </button>
                                <span className="const-filtros-badge">
                                    Mostrando <strong>{constanciasFiltradas.length}</strong> de {constancias.length} constancias
                                </span>
                            </div>

                            {constanciasFiltradas.length === 0 ? (
                                <p className="const-empty">No hay constancias que coincidan con los filtros.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="const-tabla">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Estudiante</th>
                                                <th>Tipo</th>
                                                <th>Rango</th>
                                                <th>Emisión</th>
                                                <th>Estado</th>
                                                <th>Documento</th>
                                                <th style={{ width: '220px' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {constanciasFiltradas.map(c => {
                                                const badge = tipoBadge(c.tipo);
                                                return (
                                                    <tr key={c.idConstancia}>
                                                        <td style={{ color: '#64748b' }}>{c.idConstancia}</td>
                                                        <td>
                                                            <strong>{c.estudiante || nombreEstudiante(c.idEstudiante)}</strong>
                                                            <br /><small style={{ color: '#94a3b8' }}>{c.codigoEstudiante}</small>
                                                            {c.nie && (
                                                                <><br /><small style={{ color: '#64748b' }}>NIE: {c.nie}</small></>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className="const-badge"
                                                                style={{
                                                                    backgroundColor: badge.bg,
                                                                    color: badge.color,
                                                                    border: `1px solid ${badge.border}`
                                                                }}
                                                            >
                                                                {tipoLabel(c.tipo)}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '12px' }}>
                                                            {c.tipo === 'Incapacidad'
                                                                ? `${fechaLabel(c.fechaInicio)} → ${fechaLabel(c.fechaFin)}`
                                                                : 'N/A'}
                                                        </td>
                                                        <td style={{ fontSize: '12px' }}>{fechaLabel(c.fechaEmision)}</td>
                                                        <td>
                                                            <span className={`const-badge ${c.estado === 'Activa' ? 'activa' : 'anulada'}`}
                                                                style={{
                                                                    backgroundColor: c.estado === 'Activa' ? '#dcfce7' : '#fee2e2',
                                                                    color: c.estado === 'Activa' ? '#15803d' : '#b91c1c',
                                                                    border: c.estado === 'Activa' ? '1px solid #16a34a' : '1px solid #dc2626'
                                                                }}
                                                            >
                                                                {c.estado}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {c.tieneDocumento ? (
                                                                <button className="const-btn const-btn-success const-btn-sm" onClick={() => descargarDocumento(c)}>
                                                                    Descargar
                                                                </button>
                                                            ) : <span style={{ color: '#94a3b8', fontSize: '12px' }}>Sin adjunto</span>}
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                                <button className="const-btn const-btn-info const-btn-sm" onClick={() => setDetalle(c)}>
                                                                    Ver
                                                                </button>
                                                                {c.estado === 'Activa' && (
                                                                    <>
                                                                        <button
                                                                            className="const-btn const-btn-primary const-btn-sm"
                                                                            onClick={() => editar(c)}
                                                                        >
                                                                            Editar
                                                                        </button>
                                                                        <button
                                                                            className="const-btn const-btn-danger const-btn-sm"
                                                                            onClick={() => anular(c)}
                                                                        >
                                                                            Anular
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* MODAL DETALLE */}
                {detalle && (
                    <div className="const-modal-overlay" onClick={() => setDetalle(null)}>
                        <div className="const-modal" onClick={e => e.stopPropagation()}>
                            <h3>Constancia #{detalle.idConstancia} - {tipoLabel(detalle.tipo)}</h3>
                            <div className="const-detalle">
                                <p><b>Estudiante:</b> {detalle.estudiante || nombreEstudiante(detalle.idEstudiante)} ({detalle.codigoEstudiante || ''})</p>
                                {detalle.nie && <p><b>NIE:</b> {detalle.nie}</p>}
                                <p><b>Clase:</b> {detalle.clase || '-'}</p>
                                <p><b>Motivo:</b> {detalle.motivo || '-'}</p>
                                {detalle.tipo === 'Incapacidad' && (
                                    <>
                                        <p><b>Rango:</b> {fechaLabel(detalle.fechaInicio)} → {fechaLabel(detalle.fechaFin)} ({detalle.cantidadDias} días)</p>
                                        <p><b>Permiso automático en asistencias:</b> {detalle.permisoAsistencias ? 'Sí' : 'No'}</p>
                                    </>
                                )}
                                <p><b>Trajo documento:</b> {detalle.trajoDocumento ? 'Sí' : 'No'}</p>
                                <p><b>Encargado presente:</b> {detalle.encargadoPresente ? 'Sí' : 'No'}</p>
                                <p><b>Emisión:</b> {fechaLabel(detalle.fechaEmision)}</p>
                                <p><b>Generada por:</b> {detalle.generadaPor || '-'}</p>
                                <p>
                                    <b>Estado:</b>{' '}
                                    <span
                                        className="const-badge"
                                        style={{
                                            backgroundColor: detalle.estado === 'Activa' ? '#dcfce7' : '#fee2e2',
                                            color: detalle.estado === 'Activa' ? '#15803d' : '#b91c1c',
                                            border: detalle.estado === 'Activa' ? '1px solid #16a34a' : '1px solid #dc2626'
                                        }}
                                    >
                                        {detalle.estado}
                                    </span>
                                </p>
                                {detalle.observaciones && <p><b>Observaciones:</b> {detalle.observaciones}</p>}
                                <p><b>Documento adjunto:</b> {detalle.tieneDocumento ? detalle.nombreArchivo : 'Sin adjunto'}</p>
                            </div>
                            <div className="const-modal-buttons">
                                {detalle.tieneDocumento && (
                                    <button className="const-btn const-btn-success" onClick={() => descargarDocumento(detalle)}>
                                        Descargar Documento
                                    </button>
                                )}
                                <button className="const-btn const-btn-secondary" onClick={() => setDetalle(null)}>
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

export default GestionConstancias;