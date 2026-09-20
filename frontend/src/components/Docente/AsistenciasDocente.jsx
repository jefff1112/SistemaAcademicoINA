// Componente AsistenciasDocente: permite al docente registrar y actualizar la asistencia de los estudiantes por clase y fecha.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { formatoHoraExacta } from '../../utils/formatUtils';

// Componente principal: registro diario de asistencia (presente, ausente, tarde, justificado).
const AsistenciasDocente = () => {
    const [clases, setClases] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedClase, setSelectedClase] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [loadingAsistencias, setLoadingAsistencias] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [asistencias, setAsistencias] = useState([]);
    const [docente, setDocente] = useState(null);
    const [materiasDocente, setMateriasDocente] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarClases();
    }, []);

    useEffect(() => {
        if (selectedClase && fecha) {
            cargarAsistencias();
        }
    }, [selectedClase, fecha]);

    const cargarClases = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const docentesRes = await API.get('/docentes');
            const docenteEncontrado = docentesRes.data.find(d => d.codigoDocente === user?.codigo);

            if (docenteEncontrado) {
                setDocente(docenteEncontrado);
                const response = await API.get(`/docentes/${docenteEncontrado.idDocente}/clases/${new Date().getFullYear()}`);
                setClases(response.data || []);

                try {
                    const materiasRes = await API.get('/notas/mis-materias');
                    setMateriasDocente(materiasRes.data || []);
                } catch (err) {
                    console.error('Error cargando materias del docente:', err);
                }
            }
        } catch (error) {
            mostrarMensaje('Error al cargar clases', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarAsistencias = async () => {
        setLoadingAsistencias(true);
        try {
            const response = await API.get(`/asistencias/clase/${selectedClase}/${fecha}`);
            const asistenciasData = response.data || [];

            const estudiantesRes = await API.get(`/estudiantes/clase/${selectedClase}`);
            const estudiantesData = estudiantesRes.data || [];

            const combinado = estudiantesData.map(e => {
                const asistencia = asistenciasData.find(a => a.idEstudiante === e.idEstudiante);
                return {
                    ...e,
                    estado: asistencia?.estado || 'Pendiente',
                    idAsistencia: asistencia?.idAsistencia || null,
                    horaRegistro: asistencia?.horaRegistro || null,
                    observaciones: asistencia?.observaciones || ''
                };
            });

            setEstudiantes(combinado);
            setAsistencias(asistenciasData);
        } catch (error) {
            mostrarMensaje('Error al cargar asistencias', 'error');
        } finally {
            setLoadingAsistencias(false);
        }
    };

    // ============================================================
    // REGISTRAR ASISTENCIA
    // ============================================================
    const registrarAsistencia = async (idEstudiante, estado) => {
        try {
            const existing = asistencias.find(a => a.idEstudiante === idEstudiante);
            const materiaDeClase = materiasDocente.find(m => m.idClase === parseInt(selectedClase));
            const idMateria = materiaDeClase?.idMateria || 1;

            const data = {
                idEstudiante,
                idClase: parseInt(selectedClase),
                idMateria,
                idDocente: docente?.idDocente || 1,
                fecha: new Date(fecha),
                estado,
                horaRegistro: new Date().toTimeString().split(' ')[0],
                observaciones: estudiantes.find(e => e.idEstudiante === idEstudiante)?.observaciones || ''
            };

            if (existing) {
                await API.put(`/asistencias/${existing.idAsistencia}`, data);
            } else {
                await API.post('/asistencias', data);
            }
            mostrarMensaje('Asistencia registrada correctamente', 'success');
            cargarAsistencias();
        } catch (error) {
            mostrarMensaje('Error al registrar asistencia', 'error');
        }
    };

    const handleObservacionesChange = (idEstudiante, valor) => {
        setEstudiantes(prev =>
            prev.map(est =>
                est.idEstudiante === idEstudiante
                    ? { ...est, observaciones: valor }
                    : est
            )
        );
    };

    const guardarObservaciones = async (idEstudiante) => {
        const estudiante = estudiantes.find(e => e.idEstudiante === idEstudiante);
        if (!estudiante) return;

        try {
            const existing = asistencias.find(a => a.idEstudiante === idEstudiante);
            if (!existing) {
                mostrarMensaje('Debe registrar la asistencia primero', 'warning');
                return;
            }

            const materiaDeClase = materiasDocente.find(m => m.idClase === parseInt(selectedClase));
            const idMateria = materiaDeClase?.idMateria || 1;

            await API.put(`/asistencias/${existing.idAsistencia}`, {
                ...existing,
                observaciones: estudiante.observaciones,
                idMateria,
                idDocente: docente?.idDocente || 1
            });
            mostrarMensaje('Observaciones guardadas', 'success');
            cargarAsistencias();
        } catch (error) {
            mostrarMensaje('Error al guardar observaciones', 'error');
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
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Presente': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Ausente': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'Tarde': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Justificado': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const estudiantesFiltrados = useMemo(() => {
        return estudiantes.filter(e => {
            if (filterEstado !== 'todos' && e.estado !== filterEstado) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (e.nombres && e.nombres.toLowerCase().includes(term)) ||
                    (e.apellidos && e.apellidos.toLowerCase().includes(term)) ||
                    (e.codigoEstudiante && e.codigoEstudiante.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [estudiantes, filterEstado, busqueda]);

    const stats = useMemo(() => {
        const total = estudiantes.length;
        const presentes = estudiantes.filter(e => e.estado === 'Presente').length;
        const ausentes = estudiantes.filter(e => e.estado === 'Ausente').length;
        const tarde = estudiantes.filter(e => e.estado === 'Tarde').length;
        const justificados = estudiantes.filter(e => e.estado === 'Justificado').length;
        const pendientes = estudiantes.filter(e => e.estado === 'Pendiente').length;
        return { total, presentes, ausentes, tarde, justificados, pendientes };
    }, [estudiantes]);

    const filtrosActivos = (filterEstado !== 'todos' ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterEstado('todos');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Asistencias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Asistencias - Docente">
            <style>{`
                .ad-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }

                .ad-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,.05);
                    border: 1px solid #e2e8f0;
                }
                .ad-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Filtros */
                .ad-filtros { display: grid; grid-template-columns: 1fr 1fr auto; gap: 14px; align-items: end; }
                .ad-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .ad-field select, .ad-field input {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; background-color: #ffffff;
                }
                .ad-field select:focus, .ad-field input:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .ad-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 600; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                    font-family: inherit;
                }
                .ad-btn:disabled { opacity: .6; cursor: not-allowed; }
                .ad-btn-primary { background: #1e3a5f; color: #fff; }
                .ad-btn-primary:hover:not(:disabled) { background: #16293f; }
                .ad-btn-secondary { background: #e5e7eb; color: #334155; }
                .ad-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .ad-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Botones P/A/T/J */
                .ad-estado-btns { display: flex; gap: 4px; }
                .ad-estado-btn {
                    width: 34px; height: 34px;
                    display: inline-flex; align-items: center; justify-content: center;
                    padding: 0; color: #fff; border: none; border-radius: 6px;
                    cursor: pointer; font-size: 13px; font-weight: 700;
                    font-family: inherit; transition: transform .15s, opacity .15s;
                }
                .ad-estado-btn:hover { transform: scale(1.08); }
                .ad-estado-btn:active { transform: scale(0.95); }
                .ad-estado-btn-p { background: #16a34a; }
                .ad-estado-btn-a { background: #dc2626; }
                .ad-estado-btn-t { background: #e67e22; }
                .ad-estado-btn-j { background: #3b82f6; }
                .ad-estado-btn.activo { box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #1e3a5f; }

                /* Estadísticas */
                .ad-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
                .ad-stat { padding: 14px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .ad-stat .num { font-size: 22px; font-weight: 700; display: block; line-height: 1.2; }
                .ad-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .ad-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .ad-stat-presente { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
                .ad-stat-ausente { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
                .ad-stat-tarde { background: #fef3c7; color: #b45309; border-color: #fde68a; }
                .ad-stat-justificado { background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe; }
                .ad-stat-pendiente { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }

                /* Tabla - FONDO BLANCO FORZADO */
                .ad-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .ad-tabla thead th {
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
                .ad-tabla tbody tr { border-bottom: 1px solid #e2e8f0; background-color: #ffffff !important; }
                .ad-tabla tbody tr:hover { background-color: #f8fafc !important; }
                .ad-tabla td {
                    padding: 10px;
                    color: #1e293b !important;
                    vertical-align: middle;
                    background-color: #ffffff !important;
                }
                .ad-tabla tbody tr:hover td { background-color: #f8fafc !important; }
                .ad-tabla td.col-num {
                    font-family: monospace;
                    font-size: 12px;
                    color: #94a3b8 !important;
                    text-align: center;
                    width: 50px;
                }
                .ad-tabla td.col-estudiante { font-weight: 600; color: #0f172a !important; }
                .ad-tabla td.col-hora {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                    white-space: nowrap;
                }

                .ad-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .ad-input-obs {
                    width: 100%;
                    padding: 6px 10px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 12px;
                    font-family: inherit;
                    background: #ffffff;
                    color: #1e293b;
                    box-sizing: border-box;
                }
                .ad-input-obs:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                .ad-aviso {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    font-weight: 500;
                }
                .ad-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .ad-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }
                .ad-aviso.warning { background: #fef3c7; color: #b45309; border-left: 4px solid #e67e22; }

                .ad-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .ad-empty h3 { color: #334155; margin: 0 0 8px; }

                .ad-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .ad-badge-filtros {
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
                    .ad-filtros { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .ad-filtros { grid-template-columns: 1fr; }
                    .ad-tabla { font-size: 12px; }
                    .ad-tabla thead th, .ad-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="ad-container">
                {mensaje && <div className={`ad-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* FILTROS */}
                <div className="ad-card">
                    <h3>Seleccionar Clase y Fecha</h3>
                    <div className="ad-filtros">
                        <div className="ad-field">
                            <label>Clase</label>
                            <select
                                value={selectedClase}
                                onChange={(e) => setSelectedClase(e.target.value)}
                            >
                                <option value="">Seleccionar clase</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} {c.seccion ? `- ${c.seccion}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="ad-field">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                className="ad-btn ad-btn-primary"
                                onClick={cargarAsistencias}
                                disabled={!selectedClase || loadingAsistencias}
                            >
                                {loadingAsistencias ? 'Cargando...' : 'Recargar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ESTADÍSTICAS */}
                {estudiantes.length > 0 && (
                    <div className="ad-stats">
                        <div className="ad-stat ad-stat-total">
                            <span className="num">{stats.total}</span>
                            <span className="lbl">Total</span>
                        </div>
                        <div className="ad-stat ad-stat-presente">
                            <span className="num">{stats.presentes}</span>
                            <span className="lbl">Presentes</span>
                        </div>
                        <div className="ad-stat ad-stat-ausente">
                            <span className="num">{stats.ausentes}</span>
                            <span className="lbl">Ausentes</span>
                        </div>
                        <div className="ad-stat ad-stat-tarde">
                            <span className="num">{stats.tarde}</span>
                            <span className="lbl">Tarde</span>
                        </div>
                        <div className="ad-stat ad-stat-justificado">
                            <span className="num">{stats.justificados}</span>
                            <span className="lbl">Justificados</span>
                        </div>
                        <div className="ad-stat ad-stat-pendiente">
                            <span className="num">{stats.pendientes}</span>
                            <span className="lbl">Pendientes</span>
                        </div>
                    </div>
                )}

                {/* FILTROS DE LA TABLA */}
                {estudiantes.length > 0 && (
                    <div className="ad-card">
                        <h3>
                            Filtros de Búsqueda
                            {filtrosActivos > 0 && (
                                <span className="ad-badge-filtros">
                                    {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                                </span>
                            )}
                        </h3>
                        <div className="ad-filtros">
                            <div className="ad-field">
                                <label>Estado</label>
                                <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                                    <option value="todos">Todos</option>
                                    <option value="Presente">Presentes</option>
                                    <option value="Ausente">Ausentes</option>
                                    <option value="Tarde">Tarde</option>
                                    <option value="Justificado">Justificados</option>
                                    <option value="Pendiente">Pendientes</option>
                                </select>
                            </div>
                            <div className="ad-field">
                                <label>Buscar</label>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o código..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                            <div>
                                {filtrosActivos > 0 && (
                                    <button className="ad-btn ad-btn-secondary" onClick={limpiarFiltros}>
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="ad-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                Mostrando <strong>{estudiantesFiltrados.length}</strong> de {estudiantes.length} estudiantes
                            </div>
                        </div>
                    </div>
                )}

                {/* TABLA DE ASISTENCIAS */}
                {estudiantes.length > 0 && (
                    <div className="ad-card">
                        <h3>Registro de Asistencias</h3>

                        {estudiantesFiltrados.length === 0 ? (
                            <div className="ad-empty">
                                <h3>No hay estudiantes que coincidan</h3>
                                <p>Prueba ajustando los filtros de búsqueda.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="ad-tabla">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                                            <th>Estudiante</th>
                                            <th style={{ width: '120px' }}>Estado</th>
                                            <th style={{ width: '120px' }}>Hora</th>
                                            <th style={{ width: '250px' }}>Observaciones</th>
                                            <th style={{ width: '190px' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estudiantesFiltrados.map((e, index) => {
                                            const estadoStyle = getEstadoColor(e.estado);
                                            return (
                                                <tr key={e.idEstudiante}>
                                                    <td className="col-num">{index + 1}</td>
                                                    <td className="col-estudiante">
                                                        {e.nombres} {e.apellidos}
                                                        {e.codigoEstudiante && (
                                                            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 400 }}>
                                                                {e.codigoEstudiante}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className="ad-badge"
                                                            style={{
                                                                backgroundColor: estadoStyle.bg,
                                                                color: estadoStyle.color,
                                                                border: `1px solid ${estadoStyle.border}`
                                                            }}
                                                        >
                                                            {e.estado}
                                                        </span>
                                                    </td>
                                                    <td className="col-hora">{formatoHoraExacta(e.horaRegistro)}</td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={e.observaciones || ''}
                                                            onChange={(ev) => handleObservacionesChange(e.idEstudiante, ev.target.value)}
                                                            onBlur={() => guardarObservaciones(e.idEstudiante)}
                                                            className="ad-input-obs"
                                                            placeholder="Sin observaciones"
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="ad-estado-btns">
                                                            <button
                                                                className={`ad-estado-btn ad-estado-btn-p ${e.estado === 'Presente' ? 'activo' : ''}`}
                                                                title="Presente"
                                                                onClick={() => registrarAsistencia(e.idEstudiante, 'Presente')}
                                                            >
                                                                P
                                                            </button>
                                                            <button
                                                                className={`ad-estado-btn ad-estado-btn-a ${e.estado === 'Ausente' ? 'activo' : ''}`}
                                                                title="Ausente"
                                                                onClick={() => registrarAsistencia(e.idEstudiante, 'Ausente')}
                                                            >
                                                                A
                                                            </button>
                                                            <button
                                                                className={`ad-estado-btn ad-estado-btn-t ${e.estado === 'Tarde' ? 'activo' : ''}`}
                                                                title="Tarde"
                                                                onClick={() => registrarAsistencia(e.idEstudiante, 'Tarde')}
                                                            >
                                                                T
                                                            </button>
                                                            <button
                                                                className={`ad-estado-btn ad-estado-btn-j ${e.estado === 'Justificado' ? 'activo' : ''}`}
                                                                title="Justificado"
                                                                onClick={() => registrarAsistencia(e.idEstudiante, 'Justificado')}
                                                            >
                                                                J
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* EMPTY STATE */}
                {!selectedClase && (
                    <div className="ad-card">
                        <div className="ad-empty">
                            <h3>Seleccione una clase y fecha</h3>
                            <p>Elija una clase del selector superior para comenzar a registrar asistencias.</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AsistenciasDocente;