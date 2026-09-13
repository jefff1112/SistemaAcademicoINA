// Componente MisActividades: vista de solo lectura para estudiantes
// Muestra materias, actividades, sub-actividades (expandible), ponderaciones, fechas y notas
// Soporta materias básicas y módulos/especialidades
// Incluye autoevaluación, coevaluación, recuperación y notas calculadas
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import calificacionesSubActividadesService from '../../services/calificacionesSubActividadesService';
import DashboardLayout from '../Layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import './MisActividades.css';

function MisActividades() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [materias, setMaterias] = useState([]);
    const [actividadesPorMateria, setActividadesPorMateria] = useState({});
    const [notasEstudiante, setNotasEstudiante] = useState({});
    const [notasSubActividades, setNotasSubActividades] = useState({});
    const [notasActividades, setNotasActividades] = useState({});
    const [periodoActivo, setPeriodoActivo] = useState(null);
    const [error, setError] = useState('');
    const [expandidos, setExpandidos] = useState({});
    const [infoEstudiante, setInfoEstudiante] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            // Obtener período activo
            const periodosRes = await API.get('/periodosacademicos/activo');
            let periodo = null;
            if (periodosRes.data) {
                periodo = periodosRes.data;
                setPeriodoActivo(periodo);
            }

            // Obtener información del estudiante
            if (user && user.codigo) {
                const estudianteRes = await API.get('/estudiantes/codigo/' + user.codigo);
                const est = estudianteRes.data;
                if (est) {
                    setInfoEstudiante(est);
                    const idClase = est.idClase || est.IdClase;
                    const idEstudiante = est.idEstudiante || est.IdEstudiante;

                    // Obtener materias de la clase (normales)
                    const materiasRes = await API.get('/materias/clase/' + idClase);
                    const materiasData = materiasRes.data || [];

                    // Obtener especialidades/módulos (si existen)
                    let especialidadesData = [];
                    try {
                        const espRes = await API.get('/especialidades/clase/' + idClase);
                        especialidadesData = espRes.data || [];
                    } catch (e) {
                        // Si falla, no hay especialidades
                    }

                    const todasMaterias = [
                        ...materiasData.map(m => ({
                            id: m.idMateria || m.IdMateria,
                            nombre: m.nombreMateria || m.NombreMateria,
                            tipo: 'Materia',
                            esEspecialidad: false
                        })),
                        ...especialidadesData.map(e => ({
                            id: e.idEspecialidad || e.IdEspecialidad,
                            nombre: e.nombreEspecialidad || e.NombreEspecialidad,
                            tipo: 'Especialidad',
                            esEspecialidad: true
                        }))
                    ];

                    setMaterias(todasMaterias);

                    // Cargar actividades y notas por cada materia/especialidad
                    for (const materia of todasMaterias) {
                        await cargarActividadesYNotas(materia, idClase, idEstudiante, periodo);
                    }
                }
            }
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar las actividades: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const cargarActividadesYNotas = async (materia, idClase, idEstudiante, periodo) => {
        try {
            const params = new URLSearchParams({
                idClase: idClase.toString()
            });
            if (materia.esEspecialidad) {
                params.append('idEspecialidad', materia.id.toString());
            } else {
                params.append('idMateria', materia.id.toString());
            }

            // Cargar estructura completa de actividades
            let actividades = [];
            try {
                const actRes = await API.get('/actividades/estructura-completa?' + params.toString());
                actividades = actRes.data.actividades || actRes.data.Actividades || [];
            } catch (e) {
                // Puede ser que no existan actividades aún
            }

            // Cargar nota final del período
            let notaFinal = null;
            if (periodo) {
                try {
                    const endpoint = materia.esEspecialidad
                        ? `/resultados-periodos/estudiante/${idEstudiante}/clase/${idClase}/especialidad/${materia.id}/periodo/${periodo.idPeriodo || periodo.IdPeriodo}`
                        : `/resultados-periodos/estudiante/${idEstudiante}/clase/${idClase}/materia/${materia.id}/periodo/${periodo.idPeriodo || periodo.IdPeriodo}`;
                    const notasRes = await API.get(endpoint);
                    if (notasRes.data) {
                        notaFinal = notasRes.data.nota_acumulada
                            || notasRes.data.notaAcumulada
                            || notasRes.data.nota_periodo
                            || notasRes.data.notaPeriodo
                            || notasRes.data.nota
                            || null;
                    }
                } catch (e) {
                    // Sin notas registradas aún
                }
            }

            // Cargar notas por sub-actividad para cada actividad
            const notasPorSub = {};
            const notasPorActividad = {};
            for (const actividad of actividades) {
                const idAct = actividad.idActividad || actividad.IdActividad;
                try {
                    const response = await calificacionesSubActividadesService.getByEstudianteYActividad(
                        idEstudiante,
                        idAct
                    );
                    if (response && Array.isArray(response)) {
                        notasPorSub[idAct] = response.reduce((acc, item) => {
                            const idSub = item.idSubActividad || item.IdSubActividad;
                            acc[idSub] = {
                                nota: item.nota,
                                notaRecuperacion: item.notaRecuperacion || item.NotaRecuperacion,
                                notaEfectiva: item.notaRecuperacion || item.NotaRecuperacion || item.nota
                            };
                            return acc;
                        }, {});
                    }

                    // Calcular nota de actividad a partir de sub-actividades
                    const subs = actividad.subActividades || actividad.SubActividades || [];
                    if (subs.length > 0 && notasPorSub[idAct]) {
                        let sumaPonderada = 0;
                        let totalPondSub = 0;
                        for (const sub of subs) {
                            const idSub = sub.idSubActividad || sub.IdSubActividad;
                            const ponderacionSub = sub.ponderacion || sub.Ponderacion || 0;
                            const notaSubData = notasPorSub[idAct][idSub];
                            if (notaSubData && notaSubData.notaEfectiva != null) {
                                sumaPonderada += parseFloat(notaSubData.notaEfectiva) * parseFloat(ponderacionSub);
                                totalPondSub += parseFloat(ponderacionSub);
                            }
                        }
                        if (totalPondSub > 0) {
                            notasPorActividad[idAct] = (sumaPonderada / totalPondSub).toFixed(2);
                        }
                    }
                } catch (subErr) {
                    console.error('Error cargando notas de sub-actividades para actividad ' + idAct, subErr);
                }
            }

            setActividadesPorMateria(prev => ({
                ...prev,
                [materia.id]: actividades
            }));
            setNotasEstudiante(prev => ({
                ...prev,
                [materia.id]: { notaFinal }
            }));
            setNotasSubActividades(prev => ({
                ...prev,
                [materia.id]: notasPorSub
            }));
            setNotasActividades(prev => ({
                ...prev,
                [materia.id]: notasPorActividad
            }));
        } catch (err) {
            console.error('Error cargando actividades para materia ' + materia.nombre + ':', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date)) return '-';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getEstadoNota = (nota) => {
        if (nota === null || nota === undefined || nota === '' || isNaN(parseFloat(nota))) {
            return { texto: 'Sin calificar', clase: 'sin-nota', color: '#6b7280', bg: '#f3f4f6' };
        }
        const n = parseFloat(nota);
        if (n >= 6) return { texto: 'Aprobado', clase: 'aprobado', color: '#15803d', bg: '#dcfce7' };
        if (n >= 5) return { texto: 'Recuperación', clase: 'recuperacion', color: '#92400e', bg: '#fef3c7' };
        return { texto: 'Reprobado', clase: 'reprobado', color: '#b91c1c', bg: '#fee2e2' };
    };

    const calcularTotalPonderacionActividades = (actividades) => {
        return actividades.reduce((sum, a) => sum + parseFloat(a.ponderacion || a.Ponderacion || 0), 0);
    };

    const calcularPromedioFinalMateria = (actividades, notasAct) => {
        let sumaPonderada = 0;
        let totalPond = 0;
        for (const act of actividades) {
            const idAct = act.idActividad || act.IdActividad;
            const ponderacion = parseFloat(act.ponderacion || act.Ponderacion || 0);
            const notaAct = notasAct[idAct];
            if (notaAct != null && notaAct !== '' && !isNaN(parseFloat(notaAct))) {
                sumaPonderada += parseFloat(notaAct) * ponderacion;
                totalPond += ponderacion;
            }
        }
        return totalPond > 0 ? (sumaPonderada / totalPond).toFixed(2) : null;
    };

    const toggleExpandido = (key) => {
        setExpandidos(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const expandirTodos = () => {
        const nuevosExpandidos = {};
        materias.forEach(m => {
            const acts = actividadesPorMateria[m.id] || [];
            acts.forEach(a => {
                const idAct = a.idActividad || a.IdActividad;
                nuevosExpandidos[`${m.id}_${idAct}`] = true;
            });
        });
        setExpandidos(nuevosExpandidos);
    };

    const colapsarTodos = () => setExpandidos({});

    if (loading) {
        return (
            <DashboardLayout title="Mis Actividades">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando actividades...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Mis Actividades">
                <div className="alert error">{error}</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mis Actividades">
            <div className="mis-actividades">
                <div className="header-info">
                    <div className="header-titles">
                        <h2>📚 Mis Actividades y Evaluaciones</h2>
                        {periodoActivo && (
                            <div className="periodo-badge">
                                <span className="periodo-label">Período:</span>
                                <span className="periodo-value">
                                    {periodoActivo.nombre || periodoActivo.Nombre} ({periodoActivo.anioLectivo || periodoActivo.AnioLectivo})
                                </span>
                            </div>
                        )}
                    </div>
                    {infoEstudiante && (
                        <div className="estudiante-info">
                            <div className="estudiante-dato">
                                <strong>Estudiante:</strong> {infoEstudiante.nombres || infoEstudiante.Nombres} {infoEstudiante.apellidos || infoEstudiante.Apellidos}
                            </div>
                            <div className="estudiante-dato">
                                <strong>Código:</strong> {infoEstudiante.codigo || infoEstudiante.Codigo}
                            </div>
                        </div>
                    )}
                    <div className="acciones-globales">
                        <button className="btn-expandir" onClick={expandirTodos}>📂 Expandir Todo</button>
                        <button className="btn-colapsar" onClick={colapsarTodos}>📁 Colapsar Todo</button>
                    </div>
                </div>

                {materias.length === 0 ? (
                    <div className="estado-vacio">
                        <div className="vacio-icon">📭</div>
                        <h3>No tienes materias asignadas</h3>
                        <p>Consulta con el registro académico si crees que esto es un error.</p>
                    </div>
                ) : (
                    <div className="materias-lista">
                        {materias.map(materia => {
                            const actividades = actividadesPorMateria[materia.id] || [];
                            const notas = notasEstudiante[materia.id] || {};
                            const notasSub = notasSubActividades[materia.id] || {};
                            const notasAct = notasActividades[materia.id] || {};
                            const promedioCalculado = calcularPromedioFinalMateria(actividades, notasAct);
                            const notaFinalMostrar = notas.notaFinal || promedioCalculado;
                            const estadoFinal = getEstadoNota(notaFinalMostrar);
                            const totalPond = calcularTotalPonderacionActividades(actividades);

                            return (
                                <div key={materia.id} className="materia-seccion">
                                    <div className="materia-header">
                                        <div className="materia-info">
                                            <h3>{materia.nombre}</h3>
                                            <div className="materia-meta">
                                                <span className={`tipo-badge ${materia.esEspecialidad ? 'tipo-especialidad' : 'tipo-materia'}`}>
                                                    {materia.tipo}
                                                </span>
                                                <span className="actividades-count">
                                                    📋 {actividades.length} {actividades.length === 1 ? 'actividad' : 'actividades'}
                                                </span>
                                                <span className={`ponderacion-badge ${Math.abs(totalPond - 100) > 0.01 ? 'ponderacion-invalida' : 'ponderacion-valida'}`}>
                                                    Σ {totalPond.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                        {notaFinalMostrar && (
                                            <div className="nota-final-box" style={{ backgroundColor: estadoFinal.bg, color: estadoFinal.color }}>
                                                <div className="nota-label">Nota Final</div>
                                                <div className="nota-valor">{parseFloat(notaFinalMostrar).toFixed(2)}</div>
                                                <div className="nota-estado">{estadoFinal.texto}</div>
                                            </div>
                                        )}
                                    </div>

                                    {actividades.length === 0 ? (
                                        <div className="sin-actividades">
                                            <div className="sin-icon">⏳</div>
                                            <p>El docente aún no ha configurado actividades para esta materia.</p>
                                        </div>
                                    ) : (
                                        <div className="actividades-container">
                                            {actividades.map((actividad, idx) => {
                                                const idAct = actividad.idActividad || actividad.IdActividad;
                                                const nombreAct = actividad.nombreActividad || actividad.NombreActividad || actividad.nombre || `Actividad ${idx + 1}`;
                                                const ponderacionAct = parseFloat(actividad.ponderacion || actividad.Ponderacion || 0);
                                                const tipoActividad = actividad.tipoActividad || actividad.TipoActividad || 'Actividad';
                                                const descripcion = actividad.descripcion || actividad.Descripcion;
                                                const observaciones = actividad.observaciones || actividad.Observaciones;
                                                const fechaPublicacion = actividad.fechaPublicacion || actividad.FechaPublicacion;
                                                const fechaLimite = actividad.fechaLimite || actividad.FechaLimite;
                                                const subs = actividad.subActividades || actividad.SubActividades || [];
                                                const totalPondSubs = subs.reduce((sum, s) => sum + parseFloat(s.ponderacion || s.Ponderacion || 0), 0);
                                                const key = `${materia.id}_${idAct}`;
                                                const isExpanded = expandidos[key];
                                                const notaAct = notasAct[idAct];
                                                const estadoAct = getEstadoNota(notaAct);

                                                return (
                                                    <div key={idAct} className={`actividad-card ${isExpanded ? 'expanded' : ''}`}>
                                                        <div
                                                            className="actividad-header"
                                                            onClick={() => toggleExpandido(key)}
                                                        >
                                                            <div className="actividad-info">
                                                                <div className="actividad-toggle">
                                                                    <span className={`toggle-icon ${isExpanded ? 'rotated' : ''}`}>▼</span>
                                                                    <div className="actividad-main">
                                                                        <div className="actividad-title">
                                                                            <span className="actividad-numero">#{idx + 1}</span>
                                                                            {nombreAct}
                                                                            {tipoActividad === 'Modulo' && <span className="badge-modulo">Módulo</span>}
                                                                        </div>
                                                                        <div className="actividad-meta">
                                                                            {fechaPublicacion && (
                                                                                <span className="meta-item">📅 {formatDate(fechaPublicacion)} → {formatDate(fechaLimite)}</span>
                                                                            )}
                                                                            <span className={`meta-item ponderacion-sub ${Math.abs(totalPondSubs - 100) > 0.01 ? 'invalida' : ''}`}>
                                                                                Sub-actividades: {totalPondSubs.toFixed(0)}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="actividad-stats">
                                                                <div className="stat-ponderacion">
                                                                    <div className="stat-label">Ponderación</div>
                                                                    <div className="stat-value">{ponderacionAct}%</div>
                                                                </div>
                                                                <div className="stat-nota" style={{ backgroundColor: estadoAct.bg, color: estadoAct.color }}>
                                                                    <div className="stat-label">Tu Nota</div>
                                                                    <div className="stat-value">
                                                                        {notaAct != null ? parseFloat(notaAct).toFixed(2) : '—'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="actividad-details">
                                                                {descripcion && (
                                                                    <div className="detail-box descripcion">
                                                                        <strong>📝 Descripción:</strong>
                                                                        <p>{descripcion}</p>
                                                                    </div>
                                                                )}
                                                                {observaciones && (
                                                                    <div className="detail-box observaciones">
                                                                        <strong>💬 Observaciones:</strong>
                                                                        <p>{observaciones}</p>
                                                                    </div>
                                                                )}

                                                                <div className="sub-actividades-table">
                                                                    <table>
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Sub-Actividad</th>
                                                                                <th>Tipo</th>
                                                                                <th>Ponderación</th>
                                                                                <th>Tu Nota</th>
                                                                                <th>Recuperación</th>
                                                                                <th>Estado</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {subs.length === 0 ? (
                                                                                <tr>
                                                                                    <td colSpan="6" className="sin-subs">
                                                                                        No hay sub-actividades configuradas
                                                                                    </td>
                                                                                </tr>
                                                                            ) : (
                                                                                subs.map((sub, subIdx) => {
                                                                                    const idSub = sub.idSubActividad || sub.IdSubActividad;
                                                                                    const nombreSub = sub.nombreSubActividad || sub.NombreSubActividad || sub.nombre || `Sub-actividad ${subIdx + 1}`;
                                                                                    const ponderacionSub = parseFloat(sub.ponderacion || sub.Ponderacion || 0);
                                                                                    const tipoSub = sub.tipoSubActividad || sub.TipoSubActividad || 'Subactividad';
                                                                                    const notaSubData = notasSub[idAct]?.[idSub];
                                                                                    const notaSub = notaSubData?.nota;
                                                                                    const notaRecuperacionSub = notaSubData?.notaRecuperacion;
                                                                                    const notaEfectivaSub = notaSubData?.notaEfectiva;
                                                                                    const estadoSub = getEstadoNota(notaEfectivaSub);

                                                                                    return (
                                                                                        <tr key={idSub} className={`sub-row tipo-${tipoSub.toLowerCase()}`}>
                                                                                            <td className="sub-nombre">
                                                                                                <span className="sub-num">{subIdx + 1}.</span>
                                                                                                {nombreSub}
                                                                                            </td>
                                                                                            <td className="sub-tipo">
                                                                                                <span className={`badge-tipo tipo-${tipoSub.toLowerCase().replace('ó', 'o')}`}>
                                                                                                    {tipoSub}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="sub-ponderacion">{ponderacionSub}%</td>
                                                                                            <td className="sub-nota">
                                                                                                {notaSub != null ? parseFloat(notaSub).toFixed(2) : '—'}
                                                                                            </td>
                                                                                            <td className="sub-recuperacion">
                                                                                                {notaRecuperacionSub != null ? (
                                                                                                    <span className="nota-recuperacion-badge">
                                                                                                        {parseFloat(notaRecuperacionSub).toFixed(2)}
                                                                                                    </span>
                                                                                                ) : '—'}
                                                                                            </td>
                                                                                            <td className="sub-estado">
                                                                                                <span
                                                                                                    className="estado-chip"
                                                                                                    style={{ backgroundColor: estadoSub.bg, color: estadoSub.color }}
                                                                                                >
                                                                                                    {estadoSub.texto}
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                                {subs.length > 0 && (
                                                                    <div className="actividad-resumen">
                                                                        <div className="resumen-item">
                                                                            <span>Sub-actividades:</span>
                                                                            <strong>{subs.length}</strong>
                                                                        </div>
                                                                        <div className="resumen-item">
                                                                            <span>Ponderación total:</span>
                                                                            <strong className={Math.abs(totalPondSubs - 100) > 0.01 ? 'invalido' : ''}>
                                                                                {totalPondSubs.toFixed(0)}%
                                                                            </strong>
                                                                        </div>
                                                                        <div className="resumen-item destacado">
                                                                            <span>Nota de la actividad:</span>
                                                                            <strong style={{ color: estadoAct.color }}>
                                                                                {notaAct != null ? parseFloat(notaAct).toFixed(2) : 'Sin calificar'}
                                                                            </strong>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default MisActividades;
