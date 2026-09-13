import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import DashboardLayout from '../Layout/DashboardLayout';
import './ExportacionesExcel.css';

const TIPOS_EXPORTACION = [
    {
        value: 'ClaseMateriaPeriodo',
        label: 'Clase + Materia + 1 Período',
        icon: '📄',
        descripcion: 'Genera un cuadro auxiliar de una materia específica en un período.',
        requiere: ['clase', 'materia', 'periodo']
    },
    {
        value: 'ClaseMateriaTodosPeriodos',
        label: 'Clase + Materia + Todos los Períodos',
        icon: '📚',
        descripcion: 'Genera una hoja por cada período del año lectivo.',
        requiere: ['clase', 'materia']
    },
    {
        value: 'ClaseTodasMateriasPeriodo',
        label: 'Clase + Todas las Materias + 1 Período',
        icon: '📋',
        descripcion: 'Genera una hoja por cada materia en un período específico.',
        requiere: ['clase', 'periodo']
    },
    {
        value: 'ClaseTodasMateriasTodosPeriodos',
        label: 'Clase + Todas las Materias + Todos los Períodos',
        icon: '📊',
        descripcion: 'Genera hojas para todas las combinaciones materia-período.',
        requiere: ['clase']
    },
    {
        value: 'ConsolidadoAnual',
        label: 'Consolidado Anual (por Nivel Académico)',
        icon: '🏆',
        descripcion: 'Genera una hoja por cada nivel académico con promedios anuales.',
        requiere: []
    }
];

const ExportacionesExcelRegistro = () => {
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

    const handleGenerar = async () => {
        const tipoInfo = TIPOS_EXPORTACION.find(t => t.value === tipoSel);
        if (!tipoInfo) {
            alert('⚠️ Seleccione un tipo de exportación.');
            return;
        }

        if (tipoInfo.requiere.includes('clase') && !claseSel) {
            alert('⚠️ Debe seleccionar una Clase.');
            return;
        }
        if (tipoInfo.requiere.includes('materia') && !materiaSel) {
            alert('⚠️ Debe seleccionar una Materia.');
            return;
        }
        if (tipoInfo.requiere.includes('periodo') && !periodoSel) {
            alert('⚠️ Debe seleccionar un Período.');
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
            alert('❌ Error al generar la exportación: ' + (error.response?.data?.message || error.message));
        } finally {
            setGenerando(false);
        }
    };

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
            alert('❌ Error al descargar el archivo.');
        }
    };

    const handleEliminar = async (idExportacion) => {
        if (!window.confirm('¿Está seguro de eliminar esta exportación del historial?')) return;
        try {
            await API.delete(`/exportaciones/${idExportacion}`);
            cargarHistorial();
        } catch (error) {
            console.error('Error eliminando:', error);
            alert('❌ Error al eliminar.');
        }
    };

    const tipoInfoSel = TIPOS_EXPORTACION.find(t => t.value === tipoSel);
    const requiereClase = tipoInfoSel?.requiere.includes('clase');
    const requiereMateria = tipoInfoSel?.requiere.includes('materia');
    const requierePeriodo = tipoInfoSel?.requiere.includes('periodo');

    return (
        <DashboardLayout>
            <div className="exportaciones-container">
                <div className="exportaciones-header">
                    <h1>📊 Centro de Exportaciones Excel</h1>
                    <p className="subtitle">
                        Genera reportes oficiales del INA, consulta el historial y descarga archivos previamente generados - Registro Académico
                    </p>
                </div>

                <div className="exportaciones-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'generar' ? 'active' : ''}`}
                        onClick={() => setActiveTab('generar')}
                    >
                        ✨ Generar Nueva Exportación
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
                        onClick={() => setActiveTab('historial')}
                    >
                        📜 Historial & Auditoría
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('estadisticas')}
                    >
                        📈 Estadísticas
                    </button>
                </div>

                {activeTab === 'generar' && (
                    <div className="generar-section">
                        <div className="tipo-selector">
                            <h2>1️⃣ Seleccione el tipo de exportación</h2>
                            <div className="tipos-grid">
                                {TIPOS_EXPORTACION.map(tipo => (
                                    <div
                                        key={tipo.value}
                                        className={`tipo-card ${tipoSel === tipo.value ? 'selected' : ''}`}
                                        onClick={() => setTipoSel(tipo.value)}
                                    >
                                        <div className="tipo-icon">{tipo.icon}</div>
                                        <div className="tipo-info">
                                            <div className="tipo-label">{tipo.label}</div>
                                            <div className="tipo-desc">{tipo.descripcion}</div>
                                        </div>
                                        {tipoSel === tipo.value && <div className="check-mark">✓</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {tipoSel && (
                            <div className="filtros-section">
                                <h2>2️⃣ Configure los filtros</h2>
                                <div className="filtros-grid">
                                    <div className="filtro-group">
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
                                        <div className="filtro-group">
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
                                        <div className="filtro-group">
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
                                        <div className="filtro-group">
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

                                <button
                                    className="btn-generar"
                                    onClick={handleGenerar}
                                    disabled={generando}
                                >
                                    {generando ? '⏳ Generando...' : '🚀 Generar y Guardar Exportación'}
                                </button>
                            </div>
                        )}

                        {resultado && (
                            <div className="resultado-success">
                                <h3>✅ ¡Exportación generada exitosamente!</h3>
                                <div className="resultado-info">
                                    <p><strong>📄 Archivo:</strong> {resultado.nombreArchivo}</p>
                                    <p><strong>📏 Tamaño:</strong> {resultado.tamanoKB} KB</p>
                                    <p><strong>📊 Registros:</strong> {resultado.totalRegistros}</p>
                                    <p><strong>📝 Descripción:</strong> {resultado.descripcion}</p>
                                </div>
                                <button
                                    className="btn-descargar-resultado"
                                    onClick={() => handleDescargar(resultado.idExportacion, resultado.nombreArchivo)}
                                >
                                    ⬇️ Descargar Ahora
                                </button>
                                <p className="resultado-hint">
                                    💡 Este archivo está guardado en el servidor. Podrás descargarlo en cualquier momento desde el <strong>Historial</strong>.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'historial' && (
                    <div className="historial-section">
                        <div className="historial-filtros">
                            <h2>🔍 Filtros del historial</h2>
                            <div className="filtros-grid">
                                <div className="filtro-group">
                                    <label>Tipo de exportación</label>
                                    <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                                        <option value="">Todos</option>
                                        {TIPOS_EXPORTACION.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filtro-group">
                                    <label>Fecha desde</label>
                                    <input type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)} />
                                </div>
                                <div className="filtro-group">
                                    <label>Fecha hasta</label>
                                    <input type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)} />
                                </div>
                                <button className="btn-limpiar" onClick={() => { setFiltroTipo(''); setFiltroFechaDesde(''); setFiltroFechaHasta(''); setPaginacion(p => ({...p, pagina: 1})); }}>
                                    🧹 Limpiar
                                </button>
                            </div>
                        </div>

                        <div className="historial-resumen">
                            <span>📊 Total: <strong>{paginacion.total}</strong> exportaciones</span>
                        </div>

                        {cargandoHistorial ? (
                            <div className="loading">⏳ Cargando historial...</div>
                        ) : historial.length === 0 ? (
                            <div className="empty-state">
                                <p>📭 No hay exportaciones en el historial con los filtros actuales.</p>
                            </div>
                        ) : (
                            <>
                                <table className="historial-table">
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
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historial.map(item => (
                                            <tr key={item.idExportacion}>
                                                <td><strong>{item.nombreUsuario}</strong></td>
                                                <td><span className="badge-rol">{item.rolUsuario}</span></td>
                                                <td><span className="badge-tipo">{item.tipoExportacionLegible}</span></td>
                                                <td className="desc-cell">{item.descripcion}</td>
                                                <td>{item.anioLectivo}</td>
                                                <td>{item.tamanoLegible || `${item.tamanoKB} KB`}</td>
                                                <td>{item.totalRegistros}</td>
                                                <td>
                                                    <span className="contador-descargas">
                                                        ⬇️ {item.contadorDescargas}
                                                    </span>
                                                </td>
                                                <td className="fecha-cell">{item.fechaGeneracion}</td>
                                                <td className="acciones-cell">
                                                    <button
                                                        className="btn-descargar"
                                                        onClick={() => handleDescargar(item.idExportacion, item.nombreArchivo)}
                                                        title="Descargar"
                                                    >
                                                        ⬇️
                                                    </button>
                                                    {(user?.rol === 'Administrador' || user?.rol === 'Director') && (
                                                        <button
                                                            className="btn-eliminar"
                                                            onClick={() => handleEliminar(item.idExportacion)}
                                                            title="Eliminar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {paginacion.totalPaginas > 1 && (
                                    <div className="paginacion">
                                        <button
                                            disabled={paginacion.pagina === 1}
                                            onClick={() => setPaginacion(p => ({...p, pagina: p.pagina - 1}))}
                                        >
                                            ← Anterior
                                        </button>
                                        <span>Página {paginacion.pagina} de {paginacion.totalPaginas}</span>
                                        <button
                                            disabled={paginacion.pagina === paginacion.totalPaginas}
                                            onClick={() => setPaginacion(p => ({...p, pagina: p.pagina + 1}))}
                                        >
                                            Siguiente →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'estadisticas' && (
                    <div className="estadisticas-section">
                        {estadisticas ? (
                            <>
                                <div className="stats-cards">
                                    <div className="stat-card">
                                        <div className="stat-icon">📊</div>
                                        <div className="stat-value">{estadisticas.totalExportaciones}</div>
                                        <div className="stat-label">Total Exportaciones</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">💾</div>
                                        <div className="stat-value">{estadisticas.tamanoTotalMB} MB</div>
                                        <div className="stat-label">Espacio Ocupado</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">⬇️</div>
                                        <div className="stat-value">{estadisticas.totalDescargas}</div>
                                        <div className="stat-label">Descargas Totales</div>
                                    </div>
                                </div>

                                <div className="stats-grid">
                                    <div className="stats-panel">
                                        <h3>📊 Por Tipo de Exportación</h3>
                                        <div className="stats-list">
                                            {estadisticas.porTipo?.map(item => (
                                                <div key={item.tipo} className="stat-item">
                                                    <span className="stat-name">{item.tipoLegible}</span>
                                                    <span className="stat-count">{item.cantidad}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="stats-panel">
                                        <h3>👤 Top 10 Usuarios</h3>
                                        <div className="stats-list">
                                            {estadisticas.topUsuarios?.map((item, idx) => (
                                                <div key={item.idUsuario} className="stat-item">
                                                    <span className="stat-name">
                                                        <span className="rank">#{idx + 1}</span>
                                                        {item.nombreUsuario}
                                                        <span className="stat-rol">({item.rolUsuario})</span>
                                                    </span>
                                                    <span className="stat-count">{item.cantidad}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="loading">⏳ Cargando estadísticas...</div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ExportacionesExcelRegistro;
