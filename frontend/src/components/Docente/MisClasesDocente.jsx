// Componente MisClasesDocente: lista las clases asignadas al docente y permite ver sus estudiantes.
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: tabla de clases con acceso al detalle de estudiantes y notas.
const MisClasesDocente = () => {
    const navigate = useNavigate();
    const [clases, setClases] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedClase, setSelectedClase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filterEspecialidad, setFilterEspecialidad] = useState('');
    const [busquedaEstudiantes, setBusquedaEstudiantes] = useState('');
    const [showModal, setShowModal] = useState(false);

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarClases();
    }, []);

    const cargarClases = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const docentesRes = await API.get('/docentes');
            const docente = docentesRes.data.find(d => d.codigoDocente === user?.codigo);

            if (docente) {
                const response = await API.get(`/docentes/${docente.idDocente}/clases/${new Date().getFullYear()}`);
                setClases(response.data || []);
            } else {
                setClases([]);
            }
        } catch (error) {
            mostrarMensaje('Error al cargar clases', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarEstudiantes = async (clase) => {
        setLoadingEstudiantes(true);
        setSelectedClase(clase);
        setEstudiantes([]);
        setShowModal(true);
        try {
            const response = await API.get(`/estudiantes/clase/${clase.idClase}`);
            setEstudiantes(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar estudiantes', 'error');
        } finally {
            setLoadingEstudiantes(false);
        }
    };

    const cerrarModal = () => {
        setShowModal(false);
        setSelectedClase(null);
        setEstudiantes([]);
        setBusquedaEstudiantes('');
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
    // Obtiene el nombre de la especialidad de una clase.
    // Si no tiene especialidad asignada, se considera "Bachillerato General".
    const getEspecialidadNombre = (clase) => {
        if (clase.especialidad?.nombreEspecialidad) {
            return clase.especialidad.nombreEspecialidad;
        }
        if (clase.nombreEspecialidad) {
            return clase.nombreEspecialidad;
        }
        if (clase.especialidadNombre) {
            return clase.especialidadNombre;
        }
        return 'Bachillerato General';
    };

    const getEspecialidadBadge = (nombre) => {
        const n = (nombre || '').toLowerCase();
        if (n.includes('general')) return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        if (n.includes('software') || n.includes('inform')) return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
        if (n.includes('conta') || n.includes('admin')) return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
        if (n.includes('salud') || n.includes('enferm')) return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
        if (n.includes('elect') || n.includes('mec')) return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
        return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
    };

    // ============================================================
    // ESPECIALIDADES QUE IMPARTE EL DOCENTE
    // ============================================================
    // Solo se listan las especialidades presentes en las clases del docente.
    // Si tiene al menos una clase sin especialidad, se agrega "Bachillerato General".
    const especialidadesDelDocente = useMemo(() => {
        const set = new Set();
        let tieneGeneral = false;

        clases.forEach(c => {
            const nombre = getEspecialidadNombre(c);
            if (nombre === 'Bachillerato General') {
                tieneGeneral = true;
            } else {
                set.add(nombre);
            }
        });

        const lista = Array.from(set).sort((a, b) => a.localeCompare(b));
        if (tieneGeneral) lista.unshift('Bachillerato General');
        return lista;
    }, [clases]);

    // ============================================================
    // FILTRADO
    // ============================================================
    const clasesFiltradas = useMemo(() => {
        return clases.filter(c => {
            if (filterEspecialidad) {
                const especialidadClase = getEspecialidadNombre(c);
                if (especialidadClase !== filterEspecialidad) return false;
            }
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (c.nombreClase && c.nombreClase.toLowerCase().includes(term)) ||
                    (c.seccion && c.seccion.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [clases, filterEspecialidad, busqueda]);

    const estudiantesFiltrados = useMemo(() => {
        if (!busquedaEstudiantes) return estudiantes;
        const term = busquedaEstudiantes.toLowerCase();
        return estudiantes.filter(e =>
            (e.nombres && e.nombres.toLowerCase().includes(term)) ||
            (e.apellidos && e.apellidos.toLowerCase().includes(term)) ||
            (e.codigoEstudiante && e.codigoEstudiante.toLowerCase().includes(term)) ||
            (e.nie && e.nie.toLowerCase().includes(term))
        );
    }, [estudiantes, busquedaEstudiantes]);

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================
    const stats = useMemo(() => {
        const totalEstudiantes = clases.reduce((acc, c) => acc + (c.estudiantes || 0), 0);
        return {
            totalClases: clases.length,
            totalEstudiantes,
            totalEspecialidades: especialidadesDelDocente.length
        };
    }, [clases, especialidadesDelDocente]);

    const filtrosActivos = (filterEspecialidad ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterEspecialidad('');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Mis Clases">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Mis Clases - Docente">
            <style>{`
                /* Fondo blanco general */
                .mc-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }

                .mc-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03);
                    border: 1px solid #e2e8f0;
                }
                .mc-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .mc-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .mc-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .mc-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .mc-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .mc-stat-clases { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .mc-stat-estudiantes { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
                .mc-stat-especialidades { background: #e9d5ff; color: #6b21a8; border-color: #d8b4fe; }

                /* Filtros */
                .mc-filtros { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .mc-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .mc-field input, .mc-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .mc-field input:focus, .mc-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .mc-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                    font-family: inherit;
                }
                .mc-btn:disabled { opacity: .6; cursor: not-allowed; }
                .mc-btn-primary { background: #1e3a5f; color: #fff; }
                .mc-btn-primary:hover:not(:disabled) { background: #16293f; }
                .mc-btn-info { background: #3b82f6; color: #fff; }
                .mc-btn-info:hover:not(:disabled) { background: #2563eb; }
                .mc-btn-secondary { background: #e5e7eb; color: #334155; }
                .mc-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .mc-btn-sm { padding: 6px 14px; font-size: 12px; }

                /* Tabla - FONDO BLANCO FORZADO */
                .mc-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .mc-tabla thead th {
                    background: #f8fafc !important;
                    color: #1e293b !important;
                    padding: 12px 10px;
                    text-align: left;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    font-weight: 700;
                    border-bottom: 2px solid #cbd5e1;
                }
                .mc-tabla tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    background-color: #ffffff !important;
                }
                .mc-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .mc-tabla td {
                    padding: 12px 10px;
                    color: #1e293b !important;
                    vertical-align: middle;
                    background-color: #ffffff !important;
                }
                .mc-tabla tbody tr:hover td {
                    background-color: #f1f5f9 !important;
                }
                .mc-tabla td.col-clase { font-weight: 600; color: #0f172a !important; }
                .mc-tabla td.col-seccion {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                }
                .mc-tabla td.col-estudiantes {
                    text-align: center;
                    font-weight: 700;
                    color: #1e40af !important;
                }
                .mc-tabla td.col-codigo {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                }
                .mc-tabla td.col-nombre { font-weight: 600; color: #0f172a !important; }

                .mc-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 600;
                }
                .mc-badge-estudiantes {
                    background: #eff6ff;
                    color: #1e40af;
                    border: 1px solid #bfdbfe;
                }

                .mc-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .mc-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .mc-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .mc-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .mc-empty h3 { color: #334155; margin: 0 0 8px; }

                .mc-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .mc-badge-filtros {
                    display: inline-block;
                    background: #3b82f6;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 10px;
                    margin-left: 8px;
                }

                /* Modal */
                .mc-modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .mc-modal {
                    background: #ffffff; border-radius: 12px;
                    max-width: 900px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04);
                }
                .mc-modal-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 20px; padding-bottom: 16px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .mc-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .mc-modal-close {
                    background: none; border: none; font-size: 22px; cursor: pointer;
                    color: #64748b; line-height: 1;
                }
                .mc-modal-close:hover { color: #dc2626; }
                .mc-modal-info {
                    background: #eff6ff; border-left: 4px solid #3b82f6;
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;
                    font-size: 13px; color: #1e40af;
                }

                .mc-loading {
                    text-align: center;
                    padding: 40px;
                    color: #64748b;
                    font-size: 14px;
                }

                @media (max-width: 900px) {
                    .mc-filtros { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .mc-tabla { font-size: 12px; }
                    .mc-tabla thead th, .mc-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="mc-container">
                {mensaje && <div className={`mc-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="mc-stats">
                    <div className="mc-stat mc-stat-clases">
                        <span className="num">{stats.totalClases}</span>
                        <span className="lbl">Clases Asignadas</span>
                    </div>
                    <div className="mc-stat mc-stat-estudiantes">
                        <span className="num">{stats.totalEstudiantes}</span>
                        <span className="lbl">Estudiantes Totales</span>
                    </div>
                    <div className="mc-stat mc-stat-especialidades">
                        <span className="num">{stats.totalEspecialidades}</span>
                        <span className="lbl">Especialidades que Imparte</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="mc-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="mc-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="mc-filtros">
                        <div className="mc-field">
                            <label>Especialidad que Imparte</label>
                            <select
                                value={filterEspecialidad}
                                onChange={(e) => setFilterEspecialidad(e.target.value)}
                            >
                                <option value="">Todas mis especialidades</option>
                                {especialidadesDelDocente.map(esp => (
                                    <option key={esp} value={esp}>{esp}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mc-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre de clase o sección..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mc-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="mc-btn mc-btn-secondary" onClick={cargarClases}>
                                Recargar
                            </button>
                            {filtrosActivos > 0 && (
                                <button className="mc-btn mc-btn-secondary" onClick={limpiarFiltros}>
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{clasesFiltradas.length}</strong> de {clases.length} clases
                        </div>
                    </div>
                </div>

                {/* TABLA DE CLASES */}
                <div className="mc-card">
                    <h3>Lista de Clases</h3>

                    {clasesFiltradas.length === 0 ? (
                        <div className="mc-empty">
                            <h3>No hay clases que coincidan</h3>
                            <p>Prueba ajustando los filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="mc-tabla">
                                <thead>
                                    <tr>
                                        <th>Clase</th>
                                        <th style={{ width: '200px' }}>Especialidad</th>
                                        <th style={{ width: '120px' }}>Sección</th>
                                        <th style={{ width: '120px', textAlign: 'center' }}>Estudiantes</th>
                                        <th style={{ width: '170px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clasesFiltradas.map((c) => {
                                        const espNombre = getEspecialidadNombre(c);
                                        const espBadge = getEspecialidadBadge(espNombre);
                                        return (
                                            <tr key={c.idClase}>
                                                <td className="col-clase">{c.nombreClase}</td>
                                                <td>
                                                    <span
                                                        className="mc-badge"
                                                        style={{
                                                            backgroundColor: espBadge.bg,
                                                            color: espBadge.color,
                                                            border: `1px solid ${espBadge.border}`
                                                        }}
                                                    >
                                                        {espNombre}
                                                    </span>
                                                </td>
                                                <td className="col-seccion">{c.seccion || '-'}</td>
                                                <td className="col-estudiantes">
                                                    <span className="mc-badge mc-badge-estudiantes">
                                                        {c.estudiantes || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="mc-btn mc-btn-info mc-btn-sm"
                                                        onClick={() => cargarEstudiantes(c)}
                                                    >
                                                        Ver Estudiantes
                                                    </button>
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

            {/* MODAL DE ESTUDIANTES */}
            {showModal && (
                <div className="mc-modal-overlay" onClick={cerrarModal}>
                    <div className="mc-modal" onClick={e => e.stopPropagation()}>
                        <div className="mc-modal-header">
                            <h3>
                                Estudiantes de {selectedClase?.nombreClase}
                                {selectedClase?.seccion ? ` - Sección ${selectedClase.seccion}` : ''}
                            </h3>
                            <button className="mc-modal-close" onClick={cerrarModal}>X</button>
                        </div>

                        <div className="mc-modal-info">
                            <strong>Especialidad:</strong>{' '}
                            {selectedClase ? getEspecialidadNombre(selectedClase) : '-'}
                            {' '} | Lista de estudiantes inscritos en esta clase.
                        </div>

                        {loadingEstudiantes ? (
                            <div className="mc-loading">Cargando estudiantes...</div>
                        ) : estudiantes.length === 0 ? (
                            <div className="mc-empty">
                                <h3>No hay estudiantes inscritos</h3>
                                <p>Esta clase aún no tiene estudiantes matriculados.</p>
                            </div>
                        ) : (
                            <>
                                <div className="mc-field" style={{ marginBottom: '16px' }}>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, código o NIE..."
                                        value={busquedaEstudiantes}
                                        onChange={(e) => setBusquedaEstudiantes(e.target.value)}
                                    />
                                </div>

                                <div className="table-responsive">
                                    <table className="mc-tabla">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '130px' }}>Código</th>
                                                <th>Nombres</th>
                                                <th>Apellidos</th>
                                                <th style={{ width: '130px' }}>NIE</th>
                                                <th style={{ width: '130px' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estudiantesFiltrados.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                                        No hay estudiantes que coincidan con la búsqueda
                                                    </td>
                                                </tr>
                                            ) : (
                                                estudiantesFiltrados.map((e) => (
                                                    <tr key={e.idEstudiante}>
                                                        <td className="col-codigo">{e.codigoEstudiante}</td>
                                                        <td className="col-nombre">{e.nombres}</td>
                                                        <td>{e.apellidos}</td>
                                                        <td className="col-codigo">{e.nie || '-'}</td>
                                                        <td>
                                                            <button
                                                                className="mc-btn mc-btn-info mc-btn-sm"
                                                                onClick={() => {
                                                                    cerrarModal();
                                                                    navigate('/docente/subir-notas');
                                                                }}
                                                            >
                                                                Ver Notas
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default MisClasesDocente;