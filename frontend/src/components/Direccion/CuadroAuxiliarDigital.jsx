// CuadroAuxiliarDireccion (Dirección): cuadro de notas tipo Excel INA
// Muestra solo el promedio final por materia (sin actividades ni sub-actividades).
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import calificacionesSubActividadesService from '../../services/calificacionesSubActividadesService';
import { useAuth } from '../../contexts/AuthContext';
import '../Docente/CuadroAuxiliarDigital.css';

const CuadroAuxiliarDireccion = () => {
    const { user } = useAuth();

    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [resumenPorMateria, setResumenPorMateria] = useState(null);
    const [mostrarModalExportacion, setMostrarModalExportacion] = useState(false);

    const [filtros, setFiltros] = useState({
        idClase: '',
        tipo: '',
        idMateria: '',
        idEspecialidad: '',
        idPeriodo: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const resp = await API.get('/actividades/mis-clases');
            const data = resp.data || {};
            setClases(data.clases || []);
            setPeriodos(data.periodos || []);

            const periodoActivo = (data.periodos || []).find(p => p.estado === 'Activo');
            if (periodoActivo) {
                setFiltros(f => ({ ...f, idPeriodo: String(periodoActivo.idPeriodo) }));
            }
        } catch (error) {
            mostrarMensaje('error', 'Error al cargar datos: ' + (error.response?.data?.mensaje || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const { idClase, idPeriodo, tipo, idMateria, idEspecialidad } = filtros;

        if (!idClase || !idPeriodo) {
            setResumenPorMateria(null);
            return;
        }
        if (!tipo) {
            setResumenPorMateria(null);
            return;
        }
        if (tipo === 'materia' && !idMateria) {
            setResumenPorMateria(null);
            return;
        }
        if (tipo === 'modulo' && !idEspecialidad) {
            setResumenPorMateria(null);
            return;
        }

        cargarResumenPorMateria();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros]);

    const cargarResumenPorMateria = async () => {
        try {
            setLoading(true);
            const idClase = filtros.idClase;
            const idPeriodo = filtros.idPeriodo;
            if (!idClase || !idPeriodo) {
                setResumenPorMateria(null);
                return;
            }

            const params = new URLSearchParams();
            params.append('idClase', idClase);
            params.append('idPeriodo', idPeriodo);

            if (filtros.tipo === 'modulo' && filtros.idEspecialidad) {
                params.append('idEspecialidad', filtros.idEspecialidad);
            } else if (filtros.tipo === 'materia' && filtros.idMateria) {
                params.append('idMateria', filtros.idMateria);
            }

            const resp = await API.get(
                `/CuadroAuxiliar/resumen-por-materia?${params.toString()}`
            );

            const data = resp.data;

            const filas = (data.estudiantes || []).map(est => {
                const notasMap = {};
                Object.entries(est.notas || {}).forEach(([idMateria, valor]) => {
                    notasMap[idMateria] = {
                        promedio: valor.nota,
                        recuperacion: valor.recuperacion,
                        enRecuperacion: valor.enRecuperacion === true,
                        aprobado: valor.aprobado === true,
                        estado: valor.estado,
                        equivalenteCualitativo: valor.equivalenteCualitativo,
                        equivalenteEscala10: valor.equivalenteEscala10
                    };
                });
                return {
                    idEstudiante: est.idEstudiante,
                    codigo: est.codigo,
                    nombres: `${est.apellidos || ''}, ${est.nombres || ''}`,
                    notas: notasMap,
                    tieneRecuperaciones: est.tieneRecuperaciones === true,
                    materiasEnRecuperacion: est.materiasEnRecuperacion || est.modulosEnRecuperacion || 0
                };
            });

            setResumenPorMateria({
                materias: data.materias || [],
                filas,
                modoModulos: data.modoModulos === true,
                escala: data.escala || 10,
                notaMinimaAprobacion: data.notaMinimaAprobacion || 6
            });

            if (data.modoModulos && data.materias?.length === 0) {
                mostrarMensaje('warning', data.mensaje || 'No hay módulos registrados para esta especialidad.');
            }
        } catch (error) {
            console.error('Error cargando resumen por materia:', error);
            setResumenPorMateria(null);
        } finally {
            setLoading(false);
        }
    };

    const puedeExportar = () => {
        const rolesPermitidos = ['Administrador', 'Director', 'Sub Director', 'Registro Academico'];
        return rolesPermitidos.includes(user?.rol);
    };

    const claseActual = clases.find(c => c.idClase === parseInt(filtros.idClase));
    const materiasDisponibles = claseActual?.materias || [];
    const esEspecialidadClase = claseActual?.esEspecialidad || false;

    const handleExportar = async (tipo) => {
        try {
            setLoading(true);
            const anioActual = new Date().getFullYear();

            const idMateria = filtros.tipo === 'materia' ? filtros.idMateria : undefined;
            const idEspecialidad = filtros.tipo === 'modulo'
                ? (filtros.idEspecialidad || claseActual?.especialidad?.id)
                : undefined;

            const params = {
                idClase: filtros.idClase,
                idMateria: idMateria,
                idEspecialidad: idEspecialidad,
                idPeriodo: filtros.tipo === 'modulo' ? undefined : filtros.idPeriodo,
                anioLectivo: anioActual
            };

            if (tipo === 'todas-periodos') {
                params.todosPeriodos = true;
                delete params.idPeriodo;
            } else if (tipo === 'todas-materias') {
                params.todasMaterias = true;
            } else if (tipo === 'clase-completa') {
                params.todasMaterias = true;
                params.todosPeriodos = true;
                delete params.idPeriodo;
            } else if (tipo === 'consolidado') {
                params.esConsolidadoAnual = true;
                delete params.idClase;
                delete params.idMateria;
                delete params.idEspecialidad;
                delete params.idPeriodo;
            } else if (tipo === 'resumen-promedios') {
                params.soloPromedios = true;
            }

            await calificacionesSubActividadesService.exportarExcel(params);

            mostrarMensaje('success', 'Excel exportado correctamente');
            setMostrarModalExportacion(false);
        } catch (error) {
            console.error('Error exportando:', error);
            mostrarMensaje('error', 'Error exportando: ' + (error.message || error.response?.data?.mensaje || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const mostrarMensaje = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const estudiantesEnRecuperacion = resumenPorMateria?.filas?.filter(f => f.tieneRecuperaciones).length || 0;

    return (
        <DashboardLayout>
            <div className="cuadro-auxiliar-container">
                <div className="cuadro-header">
                    <h1>Cuadro Auxiliar de Notas - Dirección</h1>
                    <p>Resumen de promedios finales por materia.</p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })} className="btn-close-alert">×</button>
                    </div>
                )}

                <div className="filtros-container">
                    <div className="filtro-grupo">
                        <label>Clase: *</label>
                        <select
                            value={filtros.idClase}
                            onChange={e => setFiltros({
                                idClase: e.target.value,
                                tipo: '',
                                idMateria: '',
                                idEspecialidad: '',
                                idPeriodo: filtros.idPeriodo
                            })}
                        >
                            <option value="">-- Seleccione clase --</option>
                            {clases.map(c => (
                                <option key={c.idClase} value={c.idClase}>
                                    {c.nivel} - {c.nombreClase} {c.seccion}
                                    {c.esEspecialidad ? ' [Especialidad]' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {claseActual && (
                        <div className="filtro-grupo">
                            <label>Tipo:</label>
                            <select
                                value={filtros.tipo}
                                onChange={e => {
                                    const tipo = e.target.value;
                                    setFiltros({
                                        ...filtros,
                                        tipo,
                                        idMateria: '',
                                        idEspecialidad: tipo === 'modulo' ? String(claseActual?.especialidad?.id ?? '') : ''
                                    });
                                }}
                            >
                                <option value="">-- Seleccione --</option>
                                {materiasDisponibles.length > 0 && (
                                    <option value="materia">Materias Básicas</option>
                                )}
                                {esEspecialidadClase && (
                                    <option value="modulo">Módulos (Especialidad)</option>
                                )}
                            </select>
                        </div>
                    )}

                    {filtros.tipo === 'materia' && (
                        <div className="filtro-grupo">
                            <label>Materia: *</label>
                            <select
                                value={filtros.idMateria}
                                onChange={e => setFiltros({ ...filtros, idMateria: e.target.value })}
                            >
                                <option value="">-- Seleccione --</option>
                                {materiasDisponibles.map(m => (
                                    <option key={m.idMateria} value={m.idMateria}>{m.nombreMateria}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {filtros.tipo === 'modulo' && claseActual?.especialidad && (
                        <div className="filtro-grupo">
                            <label>Especialidad:</label>
                            <select
                                value={filtros.idEspecialidad}
                                onChange={e => setFiltros({ ...filtros, idEspecialidad: e.target.value })}
                            >
                                <option value="">-- Seleccione --</option>
                                <option value={claseActual.especialidad.id}>{claseActual.especialidad.nombre}</option>
                            </select>
                        </div>
                    )}

                    <div className="filtro-grupo">
                        <label>Período: *</label>
                        <select
                            value={filtros.idPeriodo}
                            onChange={e => setFiltros({ ...filtros, idPeriodo: e.target.value })}
                        >
                            <option value="">-- Seleccione --</option>
                            {periodos.map(p => (
                                <option key={p.idPeriodo} value={p.idPeriodo}>
                                    {p.nombrePeriodo} ({p.anioLectivo}) {p.estado === 'Activo' ? '✓' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {resumenPorMateria && (
                    <div className="acciones-container">
                        <button className="btn btn-secondary" onClick={() => cargarResumenPorMateria()} disabled={loading}>
                            Recargar
                        </button>
                        {puedeExportar() && (
                            <button className="btn btn-success" onClick={() => setMostrarModalExportacion(true)}>
                                Exportar Excel
                            </button>
                        )}
                    </div>
                )}

                <div className="cuadro-wrapper">
                    {loading && <div className="loading-overlay">Cargando...</div>}

                    {resumenPorMateria && resumenPorMateria.filas?.length > 0 && resumenPorMateria.materias?.length > 0 && (
                        <div className="cuadro-ina">
                            <div className="header-ina">
                                <div className="titulo-instituto">INSTITUTO NACIONAL DE APOPA</div>
                                <div className="subtitulo">
                                    <span>CUADRO RESUMEN POR MATERIA</span>
                                    <span className="anio-lectivo">AÑO LECTIVO: {new Date().getFullYear()}__</span>
                                </div>
                                <div className="datos-generales">
                                    <div className="dato"><strong>CLASE:</strong> {claseActual?.nombreClase || '---'}</div>
                                    <div className="dato"><strong>SECCIÓN:</strong> {claseActual?.seccion || '---'}</div>
                                    <div className="dato">
                                        <strong>PERIODO:</strong>{' '}
                                        {periodos.find(p => String(p.idPeriodo) === String(filtros.idPeriodo))?.nombrePeriodo || filtros.idPeriodo}
                                    </div>
                                    <div className="dato">
                                        <strong>EN RECUPERACIÓN:</strong>{' '}
                                        <span className={estudiantesEnRecuperacion > 0 ? 'badge-recuperacion-header activo' : 'badge-recuperacion-header'}>
                                            {estudiantesEnRecuperacion} estudiante(s)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="tabla-scroll">
                                <table className="tabla-cuadro resumen-materias">
                                    <thead>
                                        <tr>
                                            <th className="col-codigo">CÓDIGO</th>
                                            <th className="col-nombres">NOMBRES</th>
                                            {resumenPorMateria.materias.map(m => {
                                                const displayName = (m.nombreMateria || '').trim() === 'Ciencias'
                                                    ? 'Ciencias Naturales'
                                                    : (m.nombreMateria || 'Sin materia');
                                                return (
                                                    <th key={m.idMateria} className="col-materia">{displayName}</th>
                                                );
                                            })}
                                            <th className="col-promedio-general">PROMEDIO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resumenPorMateria.filas.map(fila => (
                                            <tr key={fila.idEstudiante}>
                                                <td className="col-codigo">{fila.codigo}</td>
                                                <td className="col-nombres">{fila.nombres}</td>
                                                {resumenPorMateria.materias.map(m => {
                                                    const notaObj = (fila.notas || {})[m.idMateria] || {};
                                                    const prom = notaObj.promedio;
                                                    const rec = notaObj.recuperacion;
                                                    const enRecuperacion = notaObj.enRecuperacion === true;
                                                    const sinNota = notaObj.estado === 'SinNota';
                                                    const equivalente = notaObj.equivalenteCualitativo;
                                                    const esModulo = resumenPorMateria.modoModulos === true;

                                                    const claseCelda = [
                                                        'col-materia-cell',
                                                        enRecuperacion ? 'en-recuperacion' : '',
                                                        sinNota ? 'sin-nota' : ''
                                                    ].filter(Boolean).join(' ');

                                                    return (
                                                        <td
                                                            key={`${fila.idEstudiante}_${m.idMateria}`}
                                                            className={claseCelda}
                                                        >
                                                            <span className="nota-principal">
                                                                {prom !== null && prom !== undefined ? Number(prom).toFixed(2) : '—'}
                                                            </span>
                                                            {esModulo && equivalente && prom !== null && (
                                                                <div className="equivalente">{equivalente}</div>
                                                            )}
                                                            {rec !== null && rec !== undefined && (
                                                                <div className="recuperacion">Rec: {Number(rec).toFixed(2)}</div>
                                                            )}
                                                            {enRecuperacion && (
                                                                <div className="badge-recuperacion">RECUPERACIÓN</div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="col-promedio-general">
                                                    {fila.promedioGeneral !== null && fila.promedioGeneral !== undefined
                                                        ? Number(fila.promedioGeneral).toFixed(2)
                                                        : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {resumenPorMateria.modoModulos && (
                                <div className="leyenda-modulos">
                                    <strong>Escala de módulos:</strong> 5 = Excelente | 4 = Muy bueno | 3 o menos = Recuperación
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && !resumenPorMateria && filtros.idClase && (
                        <div className="empty-state">
                            <h3>Complete los filtros</h3>
                            <p>
                                {!filtros.tipo
                                    ? 'Seleccione el tipo: Materias Básicas o Módulos'
                                    : filtros.tipo === 'materia' && !filtros.idMateria
                                        ? 'Seleccione una materia'
                                        : filtros.tipo === 'modulo' && !filtros.idEspecialidad
                                            ? 'Seleccione la especialidad'
                                            : 'Seleccione todos los filtros para cargar el cuadro.'}
                            </p>
                        </div>
                    )}

                    {!filtros.idClase && (
                        <div className="empty-state">
                            <h3>Bienvenido al Cuadro Auxiliar - Dirección</h3>
                            <p>Seleccione una clase y el tipo (Materias Básicas o Módulos).</p>
                        </div>
                    )}
                </div>

                {mostrarModalExportacion && (
                    <div className="modal-overlay" onClick={() => setMostrarModalExportacion(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Exportar a Excel</h3>
                                <button onClick={() => setMostrarModalExportacion(false)} className="btn-close">×</button>
                            </div>
                            <div className="modal-body">
                                <button className="btn-export" onClick={() => handleExportar('resumen-promedios')}>
                                    1. Resumen de Promedios por Materia (solo notas finales)
                                </button>
                                <button className="btn-export" onClick={() => handleExportar('clase-materia-periodo')}>
                                    2. Clase + Materia + 1 Período (con actividades)
                                </button>
                                <button className="btn-export" onClick={() => handleExportar('todas-periodos')}>
                                    3. Clase + Materia + Todos los Períodos (con actividades)
                                </button>
                                <button className="btn-export" onClick={() => handleExportar('todas-materias')}>
                                    4. Clase + Todas las Materias + 1 Período (con actividades)
                                </button>
                                <button className="btn-export" onClick={() => handleExportar('clase-completa')}>
                                    5. Clase + Todas las Materias + Todos los Períodos (con actividades)
                                </button>
                                <button className="btn-export" onClick={() => handleExportar('consolidado')}>
                                    6. Consolidado Anual (por Nivel)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CuadroAuxiliarDireccion;