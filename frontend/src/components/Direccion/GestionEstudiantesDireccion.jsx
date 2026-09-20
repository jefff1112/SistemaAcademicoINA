// Componente Gestión de Estudiantes (Dirección) - MEJORADO
// Consulta historial académico y cambia de clase.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { cambiarClase } from '../../services/estudiantesService';

const GestionEstudiantesDireccion = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [estudiantes, setEstudiantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [showCambioModal, setShowCambioModal] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [estudianteCambio, setEstudianteCambio] = useState(null);
    const [nuevaClaseId, setNuevaClaseId] = useState('');
    const [historial, setHistorial] = useState([]);

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Filtros
    const [filtros, setFiltros] = useState({
        anioLectivo: new Date().getFullYear(),
        idClase: '',
        idEspecialidad: 'todas',
        estado: 'todos'
    });
    const [searchTerm, setSearchTerm] = useState('');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [estudiantesRes, clasesRes, especialidadesRes] = await Promise.all([
                API.get('/estudiantes'),
                API.get('/clases'),
                API.get('/clases/especialidades')
            ]);
            setEstudiantes(estudiantesRes.data || []);
            setClases(clasesRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // ============================================================
    // HISTORIAL ACADÉMICO
    // ============================================================
    const verHistorial = async (estudiante) => {
        setSelectedEstudiante(estudiante);
        setShowModal(true);
        setLoadingHistorial(true);
        setHistorial([]);
        try {
            const response = await API.get(`/inscripciones/estudiante/${estudiante.idEstudiante}`);
            const inscripciones = response.data || [];
            const historialData = await Promise.all(inscripciones.map(async (ins) => {
                try {
                    const notasRes = await API.get(`/reportes/notas-estudiante/${estudiante.idEstudiante}/${ins.anioLectivo}`);
                    const notas = notasRes.data || {};
                    return {
                        anio: ins.anioLectivo,
                        clase: ins.clase?.nombreClase || 'Sin clase',
                        promedio: notas.promedioGeneral || 0,
                        aprobadas: notas.materiasAprobadas || 0,
                        reprobadas: notas.materiasReprobadas || 0,
                        estado: (notas.promedioGeneral || 0) >= 6 ? 'Aprobado' : 'Reprobado'
                    };
                } catch {
                    return {
                        anio: ins.anioLectivo,
                        clase: ins.clase?.nombreClase || 'Sin clase',
                        promedio: 0,
                        aprobadas: 0,
                        reprobadas: 0,
                        estado: 'Sin datos'
                    };
                }
            }));
            setHistorial(historialData.reverse());
        } catch (error) {
            mostrarMensaje('Error al cargar historial', 'error');
        } finally {
            setLoadingHistorial(false);
        }
    };

    // ============================================================
    // CAMBIO DE CLASE
    // ============================================================
    const abrirCambioClase = (estudiante) => {
        setEstudianteCambio(estudiante);
        setNuevaClaseId('');
        setShowCambioModal(true);
    };

    const handleCambioClase = async (e) => {
        e.preventDefault();
        if (!nuevaClaseId) {
            mostrarMensaje('Seleccione una nueva clase', 'error');
            return;
        }
        if (Number(nuevaClaseId) === estudianteCambio.idClase) {
            mostrarMensaje('La nueva clase es igual a la actual', 'error');
            return;
        }
        const nuevaClase = clases.find(c => c.idClase === Number(nuevaClaseId));
        if (nuevaClase && nuevaClase.cupoActual >= nuevaClase.cupoMaximo) {
            mostrarMensaje('La clase seleccionada no tiene cupo disponible', 'error');
            return;
        }
        setSaving(true);
        try {
            await cambiarClase(estudianteCambio.idEstudiante, Number(nuevaClaseId));
            mostrarMensaje('Clase cambiada correctamente. Cupo liberado en la clase anterior.', 'success');
            setShowCambioModal(false);
            setEstudianteCambio(null);
            cargarDatos();
        } catch (error) {
            const detalle = error.response?.data?.mensaje
                || JSON.stringify(error.response?.data)
                || error.message
                || 'Error al cambiar clase';
            mostrarMensaje(`${error.response?.status ? error.response.status + ' - ' : ''}${detalle}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getClaseActual = (idClase) => {
        return clases.find(c => c.idClase === idClase);
    };

    const getEspecialidadNombre = (id) => {
        if (!id) return 'Bachillerato General';
        const esp = especialidades.find(e => e.idEspecialidad === Number(id));
        return esp ? esp.nombreEspecialidad : 'Bachillerato General';
    };

    // Lista de especialidades + "Bachillerato General" (sin duplicar)
    const especialidadesConGeneral = useMemo(() => {
        const lista = [...especialidades];
        const yaExiste = lista.some(e =>
            e.idEspecialidad === 0 ||
            (e.nombreEspecialidad && e.nombreEspecialidad.toLowerCase().includes('bachillerato general'))
        );
        if (!yaExiste) {
            lista.unshift({ idEspecialidad: 0, nombreEspecialidad: 'Bachillerato General' });
        }
        return lista;
    }, [especialidades]);

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const estudiantesFiltrados = useMemo(() => {
        return estudiantes.filter(e => {
            // Filtro por estado
            if (filtros.estado === 'activos' && !e.estado) return false;
            if (filtros.estado === 'inactivos' && e.estado) return false;
            if (filtros.estado === 'sin-clase' && e.idClase) return false;

            // Filtro por clase
            if (filtros.idClase) {
                if (Number(e.idClase) !== Number(filtros.idClase)) return false;
            }

            // Filtro por año lectivo (a través de la clase del estudiante)
            if (filtros.anioLectivo) {
                const claseEst = clases.find(c => c.idClase === e.idClase);
                if (claseEst && Number(claseEst.anioLectivo) !== Number(filtros.anioLectivo)) return false;
                if (!claseEst && e.idClase) return false;
            }

            // Filtro por especialidad
            if (filtros.idEspecialidad !== 'todas') {
                const claseEst = clases.find(c => c.idClase === e.idClase);
                const espClase = claseEst?.idEspecialidad ? Number(claseEst.idEspecialidad) : 0;
                const espFiltro = parseInt(filtros.idEspecialidad);
                if (espFiltro === 0) {
                    if (espClase !== 0) return false;
                } else {
                    if (espClase !== espFiltro) return false;
                }
            }

            // Búsqueda
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    (e.nombres && e.nombres.toLowerCase().includes(term)) ||
                    (e.apellidos && e.apellidos.toLowerCase().includes(term)) ||
                    (e.codigoEstudiante && e.codigoEstudiante.toLowerCase().includes(term)) ||
                    (e.nie && e.nie.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [estudiantes, clases, filtros, searchTerm]);

    // Estadísticas
    const stats = useMemo(() => ({
        total: estudiantes.length,
        activos: estudiantes.filter(e => e.estado).length,
        inactivos: estudiantes.filter(e => !e.estado).length,
        sinClase: estudiantes.filter(e => !e.idClase).length
    }), [estudiantes]);

    // Clases filtradas por año lectivo
    const clasesFiltradas = useMemo(() => {
        return clases.filter(c => !filtros.anioLectivo || Number(c.anioLectivo) === Number(filtros.anioLectivo));
    }, [clases, filtros.anioLectivo]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Estudiantes - Dirección">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Estudiantes - Dirección">
            <style>{`
                .ge-container { display: flex; flex-direction: column; gap: 20px; }
                .ge-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .ge-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .ge-filtros { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 14px; }
                .ge-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .ge-field input, .ge-field select, .ge-field textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .ge-field input:focus, .ge-field select:focus, .ge-field textarea:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .ge-field textarea { min-height: 80px; resize: vertical; }

                .ge-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
                .ge-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .ge-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .ge-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .ge-stat-total { background: #eff6ff; color: #1e40af; }
                .ge-stat-activos { background: #dcfce7; color: #15803d; }
                .ge-stat-inactivos { background: #fee2e2; color: #b91c1c; }
                .ge-stat-sinclase { background: #fef3c7; color: #b45309; }

                .ge-table { width: 100%; border-collapse: collapse; }
                .ge-table thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 12px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .ge-table thead th:first-child { border-top-left-radius: 8px; }
                .ge-table thead th:last-child { border-top-right-radius: 8px; }
                .ge-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .ge-table tbody tr:hover { background: #f8fafc; }
                .ge-table tbody tr:nth-child(even) { background: #fafbfc; }
                .ge-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .ge-table td { padding: 10px; font-size: 13px; color: #334155; vertical-align: middle; }

                .ge-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }
                .ge-badge-activo { background: #dcfce7; color: #15803d; border: 1px solid #16a34a; }
                .ge-badge-inactivo { background: #fee2e2; color: #b91c1c; border: 1px solid #dc2626; }

                .ge-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .ge-btn:disabled { opacity: .6; cursor: not-allowed; }
                .ge-btn-primary { background: #1e3a5f; color: #fff; }
                .ge-btn-primary:hover:not(:disabled) { background: #16293f; }
                .ge-btn-info { background: #3b82f6; color: #fff; }
                .ge-btn-info:hover:not(:disabled) { background: #2563eb; }
                .ge-btn-warning { background: #f59e0b; color: #fff; }
                .ge-btn-warning:hover:not(:disabled) { background: #d97706; }
                .ge-btn-secondary { background: #e5e7eb; color: #334155; }
                .ge-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .ge-btn-sm { padding: 5px 12px; font-size: 12px; }

                .ge-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .ge-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .ge-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .ge-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                .ge-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .ge-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 620px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .ge-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .ge-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .ge-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .ge-modal-close:hover { color: #dc2626; }
                .ge-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .ge-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }
                .ge-warning-box { background: #fef3c7; border-left: 4px solid #e67e22; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #92400e; }

                .ge-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                .ge-promedio { font-weight: bold; padding: 4px 10px; border-radius: 6px; display: inline-block; }
                .ge-promedio-ok { background: #dcfce7; color: #15803d; }
                .ge-promedio-bajo { background: #fee2e2; color: #b91c1c; }

                @media (max-width: 900px) {
                    .ge-filtros { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .ge-filtros { grid-template-columns: 1fr; }
                    .ge-table { font-size: 12px; }
                    .ge-table thead th, .ge-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="ge-container">
                {message && <div className={`ge-aviso ${messageType}`}>{message}</div>}

                {/* ESTADÍSTICAS */}
                <div className="ge-stats">
                    <div className="ge-stat ge-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Estudiantes</span>
                    </div>
                    <div className="ge-stat ge-stat-activos">
                        <span className="num">{stats.activos}</span>
                        <span className="lbl">Activos</span>
                    </div>
                    <div className="ge-stat ge-stat-inactivos">
                        <span className="num">{stats.inactivos}</span>
                        <span className="lbl">Inactivos</span>
                    </div>
                    <div className="ge-stat ge-stat-sinclase">
                        <span className="num">{stats.sinClase}</span>
                        <span className="lbl">Sin Clase</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="ge-card">
                    <h3>Filtros y Búsqueda</h3>
                    <div className="ge-filtros">
                        <div className="ge-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Nombre, código, NIE..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="ge-field">
                            <label>Año Lectivo</label>
                            <select
                                value={filtros.anioLectivo}
                                onChange={(e) => setFiltros({ ...filtros, anioLectivo: e.target.value, idClase: '' })}
                            >
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="ge-field">
                            <label>Clase</label>
                            <select
                                value={filtros.idClase}
                                onChange={(e) => setFiltros({ ...filtros, idClase: e.target.value })}
                            >
                                <option value="">Todas las clases</option>
                                {clasesFiltradas.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} (Sección {c.seccion})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="ge-field">
                            <label>Especialidad</label>
                            <select
                                value={filtros.idEspecialidad}
                                onChange={(e) => setFiltros({ ...filtros, idEspecialidad: e.target.value })}
                            >
                                <option value="todas">Todas las especialidades</option>
                                {especialidadesConGeneral.map(e => (
                                    <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                        {e.nombreEspecialidad}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="ge-field">
                            <label>Estado</label>
                            <select
                                value={filtros.estado}
                                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                            >
                                <option value="todos">Todos</option>
                                <option value="activos">Solo activos</option>
                                <option value="inactivos">Solo inactivos</option>
                                <option value="sin-clase">Sin clase asignada</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="ge-card">
                    <h3>Lista de Estudiantes ({estudiantesFiltrados.length})</h3>
                    <div className="table-responsive">
                        <table className="ge-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '140px' }}>Código</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th style={{ width: '110px' }}>NIE</th>
                                    <th>Clase Actual</th>
                                    <th style={{ width: '110px' }}>Estado</th>
                                    <th style={{ width: '210px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantesFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="ge-empty">
                                            No hay estudiantes que coincidan con los filtros
                                        </td>
                                    </tr>
                                ) : (
                                    estudiantesFiltrados.map((e) => {
                                        const claseActual = getClaseActual(e.idClase);
                                        return (
                                            <tr key={e.idEstudiante}>
                                                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                    <strong>{e.codigoEstudiante}</strong>
                                                </td>
                                                <td><strong>{e.nombres}</strong></td>
                                                <td>{e.apellidos}</td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {e.nie || '-'}
                                                </td>
                                                <td>
                                                    {claseActual ? (
                                                        <span style={{ fontSize: '13px' }}>
                                                            {claseActual.nombreClase}
                                                            <span style={{ color: '#94a3b8', marginLeft: 6 }}>
                                                                ({claseActual.seccion})
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                                            Sin asignar
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`ge-badge ${e.estado ? 'ge-badge-activo' : 'ge-badge-inactivo'}`}>
                                                        {e.estado ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="ge-acciones">
                                                        <button
                                                            className="ge-btn ge-btn-info ge-btn-sm"
                                                            onClick={() => verHistorial(e)}
                                                        >
                                                            Historial
                                                        </button>
                                                        <button
                                                            className="ge-btn ge-btn-warning ge-btn-sm"
                                                            onClick={() => abrirCambioClase(e)}
                                                        >
                                                            Cambiar Clase
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL HISTORIAL */}
            {showModal && (
                <div className="ge-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="ge-modal" onClick={e => e.stopPropagation()}>
                        <div className="ge-modal-header">
                            <h3>Historial Académico</h3>
                            <button className="ge-modal-close" onClick={() => setShowModal(false)}>X</button>
                        </div>

                        <div className="ge-info-box">
                            <strong>{selectedEstudiante?.nombres} {selectedEstudiante?.apellidos}</strong><br />
                            Código: {selectedEstudiante?.codigoEstudiante} | NIE: {selectedEstudiante?.nie || '-'}
                        </div>

                        {loadingHistorial ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                                Cargando historial...
                            </p>
                        ) : historial.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                                No hay historial académico disponible.
                            </p>
                        ) : (
                            <table className="ge-table">
                                <thead>
                                    <tr>
                                        <th>Año</th>
                                        <th>Clase</th>
                                        <th style={{ textAlign: 'center' }}>Promedio</th>
                                        <th style={{ textAlign: 'center' }}>Aprobadas</th>
                                        <th style={{ textAlign: 'center' }}>Reprobadas</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.map((h, index) => (
                                        <tr key={index}>
                                            <td><strong>{h.anio}</strong></td>
                                            <td style={{ fontSize: '12px' }}>{h.clase}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`ge-promedio ${h.promedio >= 6 ? 'ge-promedio-ok' : 'ge-promedio-bajo'}`}>
                                                    {Number(h.promedio).toFixed(2)}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center', color: '#15803d', fontWeight: 'bold' }}>
                                                {h.aprobadas}
                                            </td>
                                            <td style={{ textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>
                                                {h.reprobadas}
                                            </td>
                                            <td>
                                                <span className={`ge-badge ${h.estado === 'Aprobado' ? 'ge-badge-activo' : 'ge-badge-inactivo'}`}>
                                                    {h.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div className="ge-modal-actions">
                            <button className="ge-btn ge-btn-secondary" onClick={() => setShowModal(false)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CAMBIO DE CLASE */}
            {showCambioModal && estudianteCambio && (
                <div className="ge-modal-overlay" onClick={() => !saving && setShowCambioModal(false)}>
                    <div className="ge-modal" onClick={e => e.stopPropagation()}>
                        <div className="ge-modal-header">
                            <h3>Cambiar Clase</h3>
                            <button className="ge-modal-close" onClick={() => setShowCambioModal(false)} disabled={saving}>X</button>
                        </div>

                        <div className="ge-info-box">
                            <strong>Estudiante:</strong> {estudianteCambio.nombres} {estudianteCambio.apellidos}<br />
                            <strong>Código:</strong> {estudianteCambio.codigoEstudiante}
                        </div>

                        <div className="ge-warning-box">
                            <strong>Clase actual:</strong> {getClaseActual(estudianteCambio.idClase)?.nombreClase || 'Sin asignar'}<br />
                            <strong>Sección:</strong> {getClaseActual(estudianteCambio.idClase)?.seccion || '-'}
                        </div>

                        <form onSubmit={handleCambioClase}>
                            <div className="ge-field" style={{ marginBottom: '14px' }}>
                                <label>Nueva Clase *</label>
                                <select
                                    value={nuevaClaseId}
                                    onChange={(e) => setNuevaClaseId(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar nueva clase</option>
                                    {clasesFiltradas.map((c) => {
                                        const disponible = c.cupoMaximo - c.cupoActual;
                                        const esActual = c.idClase === estudianteCambio.idClase;
                                        return (
                                            <option key={c.idClase} value={c.idClase} disabled={esActual || disponible <= 0}>
                                                {c.nombreClase} (Sección {c.seccion}) - {getEspecialidadNombre(c.idEspecialidad)} - {disponible > 0 ? `${disponible} cupo${disponible !== 1 ? 's' : ''}` : 'LLENO'}
                                                {esActual ? ' [CLASE ACTUAL]' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="ge-modal-actions">
                                <button type="button" className="ge-btn ge-btn-secondary" onClick={() => setShowCambioModal(false)} disabled={saving}>
                                    Cancelar
                                </button>
                                <button type="submit" className="ge-btn ge-btn-warning" disabled={saving}>
                                    {saving ? 'Cambiando...' : 'Confirmar Cambio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionEstudiantesDireccion;