// Componente Exportaciones Excel (Dirección) - MEJORADO
// Centro de exportaciones con historial, estadísticas y generación de reportes.
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import DashboardLayout from '../Layout/DashboardLayout';
import './ExportacionesExcel.css';

const TIPOS_EXPORTACION = [
    {
        value: 'ClaseMateriaPeriodo',
        label: 'Clase + Materia + 1 Período',
        descripcion: 'Genera un cuadro auxiliar de una materia específica en un período.',
        requiere: ['clase', 'materia', 'periodo']
    },
    {
        value: 'ClaseMateriaTodosPeriodos',
        label: 'Clase + Materia + Todos los Períodos',
        descripcion: 'Genera una hoja por cada período del año lectivo.',
        requiere: ['clase', 'materia']
    },
    {
        value: 'ClaseTodasMateriasPeriodo',
        label: 'Clase + Todas las Materias + 1 Período',
        descripcion: 'Genera una hoja por cada materia en un período específico.',
        requiere: ['clase', 'periodo']
    },
    {
        value: 'ClaseTodasMateriasTodosPeriodos',
        label: 'Clase + Todas las Materias + Todos los Períodos',
        descripcion: 'Genera hojas para todas las combinaciones materia-período.',
        requiere: ['clase']
    },
    {
        value: 'ConsolidadoAnual',
        label: 'Consolidado Anual por Nivel Académico',
        descripcion: 'Genera una hoja por cada nivel académico con promedios anuales.',
        requiere: []
    }
];

const ExportacionesExcelDireccion = () => {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('generar');
    const [clases, setClases] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [periodos, setPeriodos] = useState([]);

    const [tipoSel, setTipoSel] = useState('');
    const [claseSel, setClaseSel] = useState('');
    const [materiaSel, setMateriaSel] = useState('');
    const [periodoSel, setPeriodoSel] = useState('');
    const [anioLectivo, setAnioLectivo] = useState(new Date().getFullYear());

    const [generando, setGenerando] = useState(false);
    const [resultado, setResultado] = useState(null);

    const [historial, setHistorial] = useState([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);
    const [paginacion, setPaginacion] = useState({ pagina: 1, totalPaginas: 1, total: 0 });

    const [estadisticas, setEstadisticas] = useState(null);

    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
    const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarCatalogos();
    }, []);

    useEffect(() => {
        if (activeTab === 'historial') cargarHistorial();
        if (activeTab === 'estadisticas') cargarEstadisticas();
    }, [activeTab, filtroTipo, filtroFechaDesde, filtroFechaHasta, paginacion.pagina]);

    const cargarCatalogos = async () => {
        try {
            const [c, m, p] = await Promise.all([
                API.get('/clases').then(r => r.data),
                API.get('/materias').then(r => r.data),
                API.get('/periodos').then(r => r.data)
            ]);
            setClases(Array.isArray(c) ? c : []);
            setMaterias(Array.isArray(m) ? m : []);
            setPeriodos(Array.isArray(p) ? p : []);
        } catch (error) {
            console.error('Error cargando catálogos:', error);
        }
    };

    const cargarHistorial = async () => {
        setCargandoHistorial(true);
        try {
            const params = new URLSearchParams();
            params.append('pagina', paginacion.pagina.toString());
            params.append('porPagina', '20');
            if (filtroTipo) params.append('tipoExportacion', filtroTipo);
            if (filtroFechaDesde) params.append('fechaDesde', filtroFechaDesde);
            if (filtroFechaHasta) params.append('fechaHasta', filtroFechaHasta);

            const response = await API.get(`/exportaciones/historial?${params.toString()}`);
            setHistorial(response.data.items || []);
            setPaginacion(prev => ({
                ...prev,
                total: response.data.total,
                totalPaginas: response.data.totalPaginas
            }));
        } catch (error) {
            console.error('Error cargando historial:', error);
        } finally {
            setCargandoHistorial(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const response = await API.get('/exportaciones/estadisticas');
            setEstadisticas(response.data);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    };

    // ============================================================
    // GENERAR
    // ============================================================
    const handleGenerar = async () => {
        const tipoInfo = TIPOS_EXPORTACION.find(t => t.value === tipoSel);
        if (!tipoInfo) {
            alert('Seleccione un tipo de exportación.');
            return;
        }

        if (tipoInfo.requiere.includes('clase') && !claseSel) {
            alert('Debe seleccionar una Clase.');
            return;
        }
        if (tipoInfo.requiere.includes('materia') && !materiaSel) {
            alert('Debe seleccionar una Materia.');
            return;
        }
        if (tipoInfo.requiere.includes('periodo') && !periodoSel) {
            alert('Debe seleccionar un Período.');
            return;
        }

        setGenerando(true);
        setResultado(null);

        try {
            const payload = {
                tipo: tipoSel,
                idClase: claseSel ? parseInt(claseSel) : null,
                idMateria: materiaSel ? parseInt(materiaSel) : null,
                idPeriodo: periodoSel ? parseInt(periodoSel) : null,
                anioLectivo: parseInt(anioLectivo)
            };

            const response = await API.post('/exportaciones/generar', payload);
            setResultado(response.data);
        } catch (error) {
            console.error('Error generando exportación:', error);
            alert('Error al generar la exportación: ' + (error.response?.data?.message || error.message));
        } finally {
            setGenerando(false);
        }
    };

    // ============================================================
    // DESCARGAR
    // ============================================================
    const handleDescargar = async (idExportacion, nombreArchivo) => {
        try {
            const response = await API.get(`/exportaciones/${idExportacion}/descargar`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando:', error);
            alert('Error al descargar el archivo.');
        }
    };

    // ============================================================
    // ELIMINAR
    // ============================================================
    const handleEliminar = async (idExportacion) => {
        if (!window.confirm('¿Está seguro de eliminar esta exportación del historial?')) return;
        try {
            await API.delete(`/exportaciones/${idExportacion}`);
            cargarHistorial();
        } catch (error) {
            console.error('Error eliminando:', error);
            alert('Error al eliminar.');
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getTipoBadge = (tipo) => {
        if (tipo?.includes('ClaseMateriaPeriodo')) return { bg: '#dbeafe', color: '#1d4ed8' };
        if (tipo?.includes('ClaseMateriaTodosPeriodos')) return { bg: '#dcfce7', color: '#15803d' };
        if (tipo?.includes('ClaseTodasMateriasPeriodo')) return { bg: '#fef3c7', color: '#b45309' };
        if (tipo?.includes('ClaseTodasMateriasTodosPeriodos')) return { bg: '#e9d5ff', color: '#6b21a8' };
        if (tipo?.includes('ConsolidadoAnual')) return { bg: '#cffafe', color: '#0e7490' };
        return { bg: '#f1f5f9', color: '#475569' };
    };

    const getRolBadge = (rol) => {
        switch (rol) {
            case 'Administrador': return { bg: '#fee2e2', color: '#b91c1c' };
            case 'Director': return { bg: '#dbeafe', color: '#1d4ed8' };
            case 'Sub Director': return { bg: '#e9d5ff', color: '#6b21a8' };
            case 'Registro Academico': return { bg: '#dcfce7', color: '#15803d' };
            default: return { bg: '#f1f5f9', color: '#475569' };
        }
    };

    const formatearNombre = (nombreCompleto) => {
        if (!nombreCompleto) return '';
        return nombreCompleto
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    };

    const tipoInfoSel = TIPOS_EXPORTACION.find(t => t.value === tipoSel);
    const requiereClase = tipoInfoSel?.requiere.includes('clase');
    const requiereMateria = tipoInfoSel?.requiere.includes('materia');
    const requierePeriodo = tipoInfoSel?.requiere.includes('periodo');

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout title="Centro de Exportaciones Excel - Dirección">
            <style>{`
                .exp-container { display: flex; flex-direction: column; gap: 20px; }
                .exp-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .exp-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .exp-header h1 { margin: 0; color: #1e3a5f; font-size: 22px; }
                .exp-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }

                /* Tabs */
                .exp-tabs { display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px; flex-wrap: wrap; }
                .exp-tab {
                    padding: 12px 20px; border: none; background: none;
                    font-size: 14px; font-weight: 500; color: #64748b;
                    cursor: pointer; border-bottom: 3px solid transparent;
                    margin-bottom: -2px; transition: all .2s;
                }
                .exp-tab:hover { color: #3b82f6; }
                .exp-tab.active { color: #1e3a5f; border-bottom-color: #3b82f6; font-weight: 600; }

                /* Tarjetas de tipo */
                .exp-tipos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
                .exp-tipo-card {
                    padding: 18px; border: 2px solid #e2e8f0; border-radius: 10px;
                    cursor: pointer; transition: all .2s; background: #fff;
                    display: flex; align-items: flex-start; gap: 12px;
                    position: relative;
                }
                .exp-tipo-card:hover { border-color: #3b82f6; background: #f8fafc; }
                .exp-tipo-card.selected { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 0 0 3px rgba(59,130,246,.15); }
                .exp-tipo-info { flex: 1; }
                .exp-tipo-label { font-weight: 600; color: #1e293b; font-size: 14px; margin-bottom: 4px; }
                .exp-tipo-desc { font-size: 12px; color: #64748b; line-height: 1.4; }
                .exp-tipo-check {
                    position: absolute; top: 12px; right: 12px;
                    width: 22px; height: 22px; border-radius: 50%;
                    background: #3b82f6; color: #fff; display: flex;
                    align-items: center; justify-content: center;
                    font-size: 14px; font-weight: bold;
                }

                /* Filtros */
                .exp-filtros-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
                .exp-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .exp-field input, .exp-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .exp-field input:focus, .exp-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .exp-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .exp-btn:disabled { opacity: .6; cursor: not-allowed; }
                .exp-btn-primary { background: #1e3a5f; color: #fff; }
                .exp-btn-primary:hover:not(:disabled) { background: #16293f; }
                .exp-btn-success { background: #16a34a; color: #fff; }
                .exp-btn-success:hover:not(:disabled) { background: #15803d; }
                .exp-btn-info { background: #3b82f6; color: #fff; }
                .exp-btn-info:hover:not(:disabled) { background: #2563eb; }
                .exp-btn-danger { background: #dc2626; color: #fff; }
                .exp-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .exp-btn-secondary { background: #e5e7eb; color: #334155; }
                .exp-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .exp-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Resultado */
                .exp-resultado {
                    background: #dcfce7; border: 2px solid #16a34a; border-radius: 10px;
                    padding: 20px; margin-top: 20px;
                }
                .exp-resultado h3 { margin: 0 0 12px; color: #15803d; }
                .exp-resultado-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 14px; }
                .exp-resultado-info p { margin: 4px 0; font-size: 13px; color: #334155; }
                .exp-resultado-info strong { color: #1e293b; }

                /* Estadísticas */
                .exp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }
                .exp-stat { padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .exp-stat .num { font-size: 28px; font-weight: bold; display: block; line-height: 1.2; }
                .exp-stat .lbl { font-size: 12px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 6px; }
                .exp-stat-total { background: #eff6ff; color: #1e40af; }
                .exp-stat-tamano { background: #dbeafe; color: #1d4ed8; }
                .exp-stat-descargas { background: #dcfce7; color: #15803d; }

                /* Tabla */
                .exp-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
                .exp-tabla thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 11px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .exp-tabla thead th:first-child { border-top-left-radius: 8px; }
                .exp-tabla thead th:last-child { border-top-right-radius: 8px; }
                .exp-tabla tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .exp-tabla tbody tr:hover { background: #f8fafc; }
                .exp-tabla tbody tr:nth-child(even) { background: #fafbfc; }
                .exp-tabla tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .exp-tabla td { padding: 10px; color: #334155; vertical-align: middle; }

                .exp-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }

                .exp-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                /* Paginación */
                .exp-paginacion { display: flex; justify-content: center; align-items: center; gap: 14px; margin-top: 16px; }
                .exp-paginacion button {
                    padding: 8px 16px; border: 1px solid #cbd5e1; background: #fff;
                    border-radius: 8px; font-size: 13px; cursor: pointer;
                    transition: all .2s;
                }
                .exp-paginacion button:hover:not(:disabled) { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; }
                .exp-paginacion button:disabled { opacity: .5; cursor: not-allowed; }
                .exp-paginacion span { font-size: 13px; color: #64748b; }

                /* Paneles de stats */
                .exp-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .exp-stats-panel { background: #f8fafc; border-radius: 10px; padding: 18px; border: 1px solid #e2e8f0; }
                .exp-stats-panel h3 { margin: 0 0 14px; font-size: 15px; color: #1e3a5f; }
                .exp-stats-list { display: flex; flex-direction: column; gap: 8px; }
                .exp-stats-item {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 10px 14px; background: #fff; border-radius: 8px;
                    border: 1px solid #e2e8f0; font-size: 13px;
                }
                .exp-stats-item-name { color: #334155; }
                .exp-stats-item-count {
                    background: #1e3a5f; color: #fff; border-radius: 12px;
                    padding: 2px 10px; font-size: 12px; font-weight: 600;
                }
                .exp-stats-rol { color: #94a3b8; font-size: 11px; margin-left: 6px; }
                .exp-rank {
                    display: inline-block; width: 22px; height: 22px;
                    background: #3b82f6; color: #fff; border-radius: 50%;
                    text-align: center; line-height: 22px; font-size: 11px;
                    font-weight: 600; margin-right: 8px;
                }

                /* Búsqueda/Filtros */
                .exp-toolbar { display: flex; gap: 12px; flex-wrap: wrap; align-items: end; margin-bottom: 16px; }

                @media (max-width: 900px) {
                    .exp-stats-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .exp-tipos-grid { grid-template-columns: 1fr; }
                    .exp-tabla { font-size: 12px; }
                    .exp-tabla thead th, .exp-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="exp-container">
                {/* HEADER */}
                <div className="exp-card">
                    <div className="exp-header">
                        <h1>Centro de Exportaciones Excel</h1>
                        <p>Genera reportes oficiales del INA, consulta el historial y descarga archivos previamente generados</p>
                    </div>
                </div>

                {/* TABS */}
                <div className="exp-tabs">
                    <button
                        className={`exp-tab ${activeTab === 'generar' ? 'active' : ''}`}
                        onClick={() => setActiveTab('generar')}
                    >
                        Generar Nueva Exportación
                    </button>
                    <button
                        className={`exp-tab ${activeTab === 'historial' ? 'active' : ''}`}
                        onClick={() => setActiveTab('historial')}
                    >
                        Historial y Auditoría
                    </button>
                    <button
                        className={`exp-tab ${activeTab === 'estadisticas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('estadisticas')}
                    >
                        Estadísticas
                    </button>
                </div>

                {/* TAB GENERAR */}
                {activeTab === 'generar' && (
                    <>
                        <div className="exp-card">
                            <h3>Paso 1: Seleccione el tipo de exportación</h3>
                            <div className="exp-tipos-grid">
                                {TIPOS_EXPORTACION.map(tipo => (
                                    <div
                                        key={tipo.value}
                                        className={`exp-tipo-card ${tipoSel === tipo.value ? 'selected' : ''}`}
                                        onClick={() => setTipoSel(tipo.value)}
                                    >
                                        <div className="exp-tipo-info">
                                            <div className="exp-tipo-label">{tipo.label}</div>
                                            <div className="exp-tipo-desc">{tipo.descripcion}</div>
                                        </div>
                                        {tipoSel === tipo.value && <div className="exp-tipo-check">✓</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {tipoSel && (
                            <div className="exp-card">
                                <h3>Paso 2: Configure los filtros</h3>
                                <div className="exp-filtros-grid">
                                    <div className="exp-field">
                                        <label>Año Lectivo *</label>
                                        <input
                                            type="number"
                                            value={anioLectivo}
                                            onChange={e => setAnioLectivo(e.target.value)}
                                            min="2020"
                                            max="2100"
                                        />
                                    </div>

                                    {requiereClase && (
                                        <div className="exp-field">
                                            <label>Clase *</label>
                                            <select value={claseSel} onChange={e => setClaseSel(e.target.value)}>
                                                <option value="">-- Seleccione --</option>
                                                {clases.map(c => (
                                                    <option key={c.idClase} value={c.idClase}>
                                                        {c.nombreClase}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {requiereMateria && (
                                        <div className="exp-field">
                                            <label>Materia *</label>
                                            <select value={materiaSel} onChange={e => setMateriaSel(e.target.value)}>
                                                <option value="">-- Seleccione --</option>
                                                {materias.map(m => (
                                                    <option key={m.idMateria} value={m.idMateria}>
                                                        {m.nombreMateria}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {requierePeriodo && (
                                        <div className="exp-field">
                                            <label>Período *</label>
                                            <select value={periodoSel} onChange={e => setPeriodoSel(e.target.value)}>
                                                <option value="">-- Seleccione --</option>
                                                {periodos.map(p => (
                                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                                        {p.nombre || `Período ${p.idPeriodo}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <button
                                        className="exp-btn exp-btn-primary"
                                        onClick={handleGenerar}
                                        disabled={generando}
                                    >
                                        {generando ? 'Generando...' : 'Generar y Guardar Exportación'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {resultado && (
                            <div className="exp-resultado">
                                <h3>Exportación generada exitosamente</h3>
                                <div className="exp-resultado-info">
                                    <p><strong>Archivo:</strong> {resultado.nombreArchivo}</p>
                                    <p><strong>Tamaño:</strong> {resultado.tamanoKB} KB</p>
                                    <p><strong>Registros:</strong> {resultado.totalRegistros}</p>
                                    <p><strong>Descripción:</strong> {resultado.descripcion}</p>
                                </div>
                                <button
                                    className="exp-btn exp-btn-success"
                                    onClick={() => handleDescargar(resultado.idExportacion, resultado.nombreArchivo)}
                                >
                                    Descargar Ahora
                                </button>
                                <p style={{ fontSize: '12px', color: '#15803d', marginTop: '12px' }}>
                                    Este archivo está guardado en el servidor. Podrás descargarlo en cualquier momento desde el Historial.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* TAB HISTORIAL */}
                {activeTab === 'historial' && (
                    <div className="exp-card">
                        <h3>Historial y Auditoría</h3>

                        <div className="exp-toolbar">
                            <div className="exp-field" style={{ flex: 1, minWidth: '200px' }}>
                                <label>Tipo de exportación</label>
                                <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                                    <option value="">Todos los tipos</option>
                                    {TIPOS_EXPORTACION.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="exp-field" style={{ minWidth: '150px' }}>
                                <label>Fecha desde</label>
                                <input type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)} />
                            </div>
                            <div className="exp-field" style={{ minWidth: '150px' }}>
                                <label>Fecha hasta</label>
                                <input type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)} />
                            </div>
                            <button
                                className="exp-btn exp-btn-secondary"
                                onClick={() => {
                                    setFiltroTipo('');
                                    setFiltroFechaDesde('');
                                    setFiltroFechaHasta('');
                                    setPaginacion(p => ({ ...p, pagina: 1 }));
                                }}
                            >
                                Limpiar
                            </button>
                        </div>

                        <div style={{ marginBottom: '14px', fontSize: '13px', color: '#64748b' }}>
                            Total: <strong>{paginacion.total}</strong> exportaciones
                        </div>

                        {cargandoHistorial ? (
                            <p className="exp-empty">Cargando historial...</p>
                        ) : historial.length === 0 ? (
                            <p className="exp-empty">No hay exportaciones en el historial con los filtros actuales</p>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="exp-tabla">
                                        <thead>
                                            <tr>
                                                <th>Usuario</th>
                                                <th>Rol</th>
                                                <th>Tipo</th>
                                                <th>Descripción</th>
                                                <th>Año</th>
                                                <th>Tamaño</th>
                                                <th>Registros</th>
                                                <th>Descargas</th>
                                                <th>Fecha</th>
                                                <th style={{ width: '120px' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historial.map(item => {
                                                const tipoBadge = getTipoBadge(item.tipoExportacionLegible);
                                                const rolBadge = getRolBadge(item.rolUsuario);
                                                return (
                                                    <tr key={item.idExportacion}>
                                                        <td><strong>{formatearNombre(item.nombreUsuario)}</strong></td>
                                                        <td>
                                                            <span
                                                                className="exp-badge"
                                                                style={{ backgroundColor: rolBadge.bg, color: rolBadge.color }}
                                                            >
                                                                {item.rolUsuario}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className="exp-badge"
                                                                style={{ backgroundColor: tipoBadge.bg, color: tipoBadge.color }}
                                                            >
                                                                {item.tipoExportacionLegible}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '12px', maxWidth: '250px' }}>{item.descripcion}</td>
                                                        <td>{item.anioLectivo}</td>
                                                        <td>{item.tamanoLegible || `${item.tamanoKB} KB`}</td>
                                                        <td>{item.totalRegistros}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span style={{ fontWeight: '600', color: '#15803d' }}>
                                                                {item.contadorDescargas}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '11px', color: '#64748b' }}>{item.fechaGeneracion}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    className="exp-btn exp-btn-info exp-btn-sm"
                                                                    onClick={() => handleDescargar(item.idExportacion, item.nombreArchivo)}
                                                                    title="Descargar"
                                                                >
                                                                    Descargar
                                                                </button>
                                                                {(user?.rol === 'Administrador' || user?.rol === 'Director') && (
                                                                    <button
                                                                        className="exp-btn exp-btn-danger exp-btn-sm"
                                                                        onClick={() => handleEliminar(item.idExportacion)}
                                                                        title="Eliminar"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {paginacion.totalPaginas > 1 && (
                                    <div className="exp-paginacion">
                                        <button
                                            disabled={paginacion.pagina === 1}
                                            onClick={() => setPaginacion(p => ({ ...p, pagina: p.pagina - 1 }))}
                                        >
                                            Anterior
                                        </button>
                                        <span>Página {paginacion.pagina} de {paginacion.totalPaginas}</span>
                                        <button
                                            disabled={paginacion.pagina === paginacion.totalPaginas}
                                            onClick={() => setPaginacion(p => ({ ...p, pagina: p.pagina + 1 }))}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* TAB ESTADÍSTICAS */}
                {activeTab === 'estadisticas' && (
                    <div className="exp-card">
                        <h3>Estadísticas del Sistema</h3>

                        {estadisticas ? (
                            <>
                                <div className="exp-stats">
                                    <div className="exp-stat exp-stat-total">
                                        <span className="num">{estadisticas.totalExportaciones}</span>
                                        <span className="lbl">Total Exportaciones</span>
                                    </div>
                                    <div className="exp-stat exp-stat-tamano">
                                        <span className="num">{estadisticas.tamanoTotalMB} MB</span>
                                        <span className="lbl">Espacio Ocupado</span>
                                    </div>
                                    <div className="exp-stat exp-stat-descargas">
                                        <span className="num">{estadisticas.totalDescargas}</span>
                                        <span className="lbl">Descargas Totales</span>
                                    </div>
                                </div>

                                <div className="exp-stats-grid">
                                    <div className="exp-stats-panel">
                                        <h3>Por Tipo de Exportación</h3>
                                        <div className="exp-stats-list">
                                            {estadisticas.porTipo?.map(item => (
                                                <div key={item.tipo} className="exp-stats-item">
                                                    <span className="exp-stats-item-name">{item.tipoLegible}</span>
                                                    <span className="exp-stats-item-count">{item.cantidad}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="exp-stats-panel">
                                        <h3>Top 10 Usuarios</h3>
                                        <div className="exp-stats-list">
                                            {estadisticas.topUsuarios?.map((item, idx) => (
                                                <div key={item.idUsuario} className="exp-stats-item">
                                                    <span className="exp-stats-item-name">
                                                        <span className="exp-rank">#{idx + 1}</span>
                                                        {formatearNombre(item.nombreUsuario)}
                                                        <span className="exp-stats-rol">({item.rolUsuario})</span>
                                                    </span>
                                                    <span className="exp-stats-item-count">{item.cantidad}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="exp-empty">Cargando estadísticas...</p>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ExportacionesExcelDireccion;