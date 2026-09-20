// CuadroAuxiliarDireccion (Dirección) - MEJORADO
// Cuadro de notas tipo Excel INA - Muestra solo el promedio final por materia.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import calificacionesSubActividadesService from '../../services/calificacionesSubActividadesService';
import { useAuth } from '../../contexts/AuthContext';
import '../Docente/CuadroAuxiliarDigital.css';

const CuadroAuxiliarDireccion = () => {
    const { user } = useAuth();

    // ============================================================
    // ESTADOS
    // ============================================================
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [resumenPorMateria, setResumenPorMateria] = useState(null);
    const [mostrarModalExportacion, setMostrarModalExportacion] = useState(false);
    const [busquedaEstudiante, setBusquedaEstudiante] = useState('');

    const [filtros, setFiltros] = useState({
        idClase: '',
        tipo: '',
        idMateria: '',
        idEspecialidad: '',
        idPeriodo: ''
    });

    // ============================================================
    // CARGA INICIAL
    // ============================================================
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

    // ============================================================
    // CARGAR RESUMEN
    // ============================================================
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

            const resp = await API.get(`/CuadroAuxiliar/resumen-por-materia?${params.toString()}`);
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

    // ============================================================
    // EXPORTAR
    // ============================================================
    const puedeExportar = () => {
        const rolesPermitidos = ['Administrador', 'Director', 'Sub Director', 'Registro Academico'];
        return rolesPermitidos.includes(user?.rol);
    };

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

    // ============================================================
    // HELPERS
    // ============================================================
    const mostrarMensaje = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const claseActual = clases.find(c => c.idClase === parseInt(filtros.idClase));
    const materiasDisponibles = claseActual?.materias || [];
    const esEspecialidadClase = claseActual?.esEspecialidad || false;

    const estudiantesEnRecuperacion = resumenPorMateria?.filas?.filter(f => f.tieneRecuperaciones).length || 0;

    // ============================================================
    // FORMATEO DE NOMBRES
    // ============================================================
    const formatearNombre = (nombreCompleto) => {
        if (!nombreCompleto) return '';

        return nombreCompleto
            .toLowerCase()
            .split(' ')
            .map(palabra => {
                if (palabra.includes(',')) {
                    return palabra.split(',')
                        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                        .join(',');
                }
                return palabra.charAt(0).toUpperCase() + palabra.slice(1);
            })
            .join(' ');
    };

    // ============================================================
    // FILTRO Y ESTADÍSTICAS DE LA TABLA
    // ============================================================
    const filasFiltradas = useMemo(() => {
        if (!resumenPorMateria?.filas) return [];
        if (!busquedaEstudiante.trim()) return resumenPorMateria.filas;
        const term = busquedaEstudiante.toLowerCase();
        return resumenPorMateria.filas.filter(f =>
            (f.nombres && f.nombres.toLowerCase().includes(term)) ||
            (f.codigo && f.codigo.toLowerCase().includes(term))
        );
    }, [resumenPorMateria, busquedaEstudiante]);

    const stats = useMemo(() => {
        if (!resumenPorMateria?.filas) return null;

        const filas = resumenPorMateria.filas;
        const total = filas.length;

        let sumaPromedios = 0;
        let contadorPromedios = 0;
        filas.forEach(f => {
            const notas = Object.values(f.notas || {});
            notas.forEach(n => {
                if (n.promedio !== null && n.promedio !== undefined && !isNaN(n.promedio)) {
                    sumaPromedios += Number(n.promedio);
                    contadorPromedios++;
                }
            });
        });
        const promedioGlobal = contadorPromedios > 0 ? sumaPromedios / contadorPromedios : 0;

        const aprobados = filas.filter(f => {
            const notas = Object.values(f.notas || {});
            if (notas.length === 0) return false;
            return notas.every(n => n.aprobado === true || n.promedio === null);
        }).length;

        const reprobados = filas.filter(f => {
            const notas = Object.values(f.notas || {});
            return notas.some(n => n.promedio !== null && n.aprobado === false);
        }).length;

        return {
            total,
            aprobados,
            reprobados,
            recuperacion: estudiantesEnRecuperacion,
            promedioGlobal: promedioGlobal.toFixed(2)
        };
    }, [resumenPorMateria, estudiantesEnRecuperacion]);

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout title="Cuadro Auxiliar de Notas - Dirección">
            <style>{`
                .cad-container { display: flex; flex-direction: column; gap: 20px; }
                .cad-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .cad-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .cad-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
                .cad-header h1 { margin: 0; color: #1e3a5f; font-size: 22px; }
                .cad-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }

                .cad-filtros { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
                .cad-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .cad-field select, .cad-field input {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .cad-field select:focus, .cad-field input:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                .cad-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .cad-btn:disabled { opacity: .6; cursor: not-allowed; }
                .cad-btn-primary { background: #1e3a5f; color: #fff; }
                .cad-btn-primary:hover:not(:disabled) { background: #16293f; }
                .cad-btn-success { background: #16a34a; color: #fff; }
                .cad-btn-success:hover:not(:disabled) { background: #15803d; }
                .cad-btn-secondary { background: #e5e7eb; color: #334155; }
                .cad-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .cad-btn-info { background: #3b82f6; color: #fff; }
                .cad-btn-info:hover:not(:disabled) { background: #2563eb; }

                .cad-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 16px; }
                .cad-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .cad-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .cad-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .cad-stat-total { background: #eff6ff; color: #1e40af; }
                .cad-stat-aprobados { background: #dcfce7; color: #15803d; }
                .cad-stat-reprobados { background: #fee2e2; color: #b91c1c; }
                .cad-stat-recuperacion { background: #fef3c7; color: #b45309; }
                .cad-stat-promedio { background: #dbeafe; color: #1d4ed8; }

                .cad-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
                .cad-busqueda { padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; min-width: 250px; }
                .cad-busqueda:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }

                .cad-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; display: flex; justify-content: space-between; align-items: center; }
                .cad-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .cad-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }
                .cad-aviso.warning { background: #fef3c7; color: #b45309; border-left: 4px solid #e67e22; }
                .cad-aviso button { background: none; border: none; font-size: 18px; cursor: pointer; color: inherit; opacity: .7; }
                .cad-aviso button:hover { opacity: 1; }

                .cad-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }

                .cad-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
                .cad-empty h3 { color: #475569; margin: 0 0 8px; }

                /* Tabla */
                .cad-tabla-wrapper { overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; }
                .cad-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
                .cad-tabla thead th {
                    background: #1e3a5f; color: #fff; padding: 12px 10px;
                    text-align: center; font-size: 11px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600; position: sticky; top: 0;
                    z-index: 5;
                }
                .cad-tabla thead th:first-child { text-align: left; border-top-left-radius: 8px; }
                .cad-tabla thead th:nth-child(2) { text-align: left; }
                .cad-tabla thead th:last-child { border-top-right-radius: 8px; }
                .cad-tabla tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .cad-tabla tbody tr:hover { background: #f8fafc; }
                .cad-tabla tbody tr:nth-child(even) { background: #fafbfc; }
                .cad-tabla tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .cad-tabla td { padding: 10px 8px; text-align: center; color: #334155; vertical-align: middle; }

                /* Código */
                .cad-tabla td.col-codigo {
                    text-align: left; font-family: monospace; font-size: 12px;
                    color: #64748b;
                }

                /* Columna de nombres: fondo blanco forzado, nombre completo */
                .cad-tabla td.col-nombres {
                    text-align: left;
                    font-size: 13px;
                    line-height: 1.4;
                    min-width: 260px;
                    padding: 10px 12px;
                    vertical-align: middle;
                    background-color: #ffffff !important;
                    color: #1e293b;
                    font-weight: 500;
                }

                /* Forzar fondo blanco en hover y zebra */
                .cad-tabla tbody tr:hover td.col-nombres {
                    background-color: #ffffff !important;
                }
                .cad-tabla tbody tr:nth-child(even) td.col-nombres {
                    background-color: #ffffff !important;
                }
                .cad-tabla tbody tr:nth-child(even):hover td.col-nombres {
                    background-color: #ffffff !important;
                }

                /* Nombre completo en una sola línea (con wrap si es largo) */
                .cad-tabla .nombre-completo {
                    color: #1e293b;
                    font-size: 13px;
                    font-weight: 600;
                    white-space: normal;
                    word-break: break-word;
                    background-color: #ffffff;
                }

                /* Celdas de notas */
                .cad-tabla td.col-materia-cell {
                    font-weight: 600;
                    font-size: 14px;
                    color: #1e293b;
                    letter-spacing: 0.3px;
                }
                .cad-tabla td.col-materia-cell.en-recuperacion {
                    background: #fef3c7;
                    color: #b45309;
                }
                .cad-tabla td.col-materia-cell.sin-nota {
                    color: #cbd5e1;
                    font-weight: 400;
                }
                .cad-tabla td.col-promedio-general {
                    font-weight: bold;
                    color: #1e3a5f;
                    background: #eff6ff;
                    font-size: 14px;
                }

                .cad-tabla .nota-principal {
                    font-weight: 700;
                    font-size: 14px;
                    color: #1e3a5f;
                }
                .cad-tabla .recuperacion {
                    font-size: 11px;
                    color: #3b82f6;
                    margin-top: 2px;
                }
                .cad-tabla .equivalente {
                    font-size: 10px;
                    color: #64748b;
                    margin-top: 2px;
                    text-transform: uppercase;
                }
                .cad-tabla .badge-recuperacion {
                    display: inline-block; font-size: 9px; font-weight: bold;
                    background: #e67e22; color: #fff; padding: 2px 6px;
                    border-radius: 4px; margin-top: 4px; text-transform: uppercase;
                }

                /* Modal */
                .cad-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .cad-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 560px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .cad-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .cad-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .cad-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .cad-modal-close:hover { color: #dc2626; }

                .cad-export-btn {
                    display: block; width: 100%; padding: 14px 16px; margin-bottom: 10px;
                    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
                    text-align: left; cursor: pointer; transition: all .2s;
                    font-size: 14px; color: #334155; font-family: inherit;
                }
                .cad-export-btn:hover { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
                .cad-export-btn strong { display: block; color: #1e3a5f; margin-bottom: 2px; }
                .cad-export-btn small { color: #64748b; font-size: 12px; }

                @media (max-width: 768px) {
                    .cad-filtros { grid-template-columns: 1fr; }
                    .cad-tabla { font-size: 12px; }
                }
            `}</style>

            <div className="cad-container">
                {message.text && (
                    <div className={`cad-aviso ${message.type}`}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage({ type: '', text: '' })}>X</button>
                    </div>
                )}

                {/* HEADER + FILTROS */}
                <div className="cad-card">
                    <div className="cad-header" style={{ marginBottom: '16px' }}>
                        <div>
                            <h1>Cuadro Auxiliar de Notas</h1>
                            <p>Resumen de promedios finales por materia o módulo</p>
                        </div>
                    </div>

                    <div className="cad-filtros">
                        <div className="cad-field">
                            <label>Clase *</label>
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
                            <div className="cad-field">
                                <label>Tipo *</label>
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
                            <div className="cad-field">
                                <label>Materia *</label>
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
                            <div className="cad-field">
                                <label>Especialidad</label>
                                <select
                                    value={filtros.idEspecialidad}
                                    onChange={e => setFiltros({ ...filtros, idEspecialidad: e.target.value })}
                                >
                                    <option value="">-- Seleccione --</option>
                                    <option value={claseActual.especialidad.id}>{claseActual.especialidad.nombre}</option>
                                </select>
                            </div>
                        )}

                        <div className="cad-field">
                            <label>Período *</label>
                            <select
                                value={filtros.idPeriodo}
                                onChange={e => setFiltros({ ...filtros, idPeriodo: e.target.value })}
                            >
                                <option value="">-- Seleccione --</option>
                                {periodos.map(p => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombrePeriodo} ({p.anioLectivo}) {p.estado === 'Activo' ? '- Activo' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {resumenPorMateria && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                            <button className="cad-btn cad-btn-secondary" onClick={() => cargarResumenPorMateria()} disabled={loading}>
                                Recargar
                            </button>
                            {puedeExportar() && (
                                <button className="cad-btn cad-btn-success" onClick={() => setMostrarModalExportacion(true)}>
                                    Exportar Excel
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ESTADÍSTICAS */}
                {stats && (
                    <div className="cad-stats">
                        <div className="cad-stat cad-stat-total">
                            <span className="num">{stats.total}</span>
                            <span className="lbl">Total Estudiantes</span>
                        </div>
                        <div className="cad-stat cad-stat-aprobados">
                            <span className="num">{stats.aprobados}</span>
                            <span className="lbl">Aprobados</span>
                        </div>
                        <div className="cad-stat cad-stat-reprobados">
                            <span className="num">{stats.reprobados}</span>
                            <span className="lbl">Con Reprobadas</span>
                        </div>
                        <div className="cad-stat cad-stat-recuperacion">
                            <span className="num">{stats.recuperacion}</span>
                            <span className="lbl">En Recuperación</span>
                        </div>
                        <div className="cad-stat cad-stat-promedio">
                            <span className="num">{stats.promedioGlobal}</span>
                            <span className="lbl">Promedio General</span>
                        </div>
                    </div>
                )}

                {/* TABLA */}
                {loading && (
                    <div className="cad-card">
                        <p className="cad-empty">Cargando datos...</p>
                    </div>
                )}

                {!loading && resumenPorMateria && resumenPorMateria.filas?.length > 0 && resumenPorMateria.materias?.length > 0 && (
                    <div className="cad-card">
                        <div className="cad-toolbar">
                            <input
                                type="text"
                                className="cad-busqueda"
                                placeholder="Buscar estudiante por nombre o código..."
                                value={busquedaEstudiante}
                                onChange={e => setBusquedaEstudiante(e.target.value)}
                            />
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                Mostrando <strong>{filasFiltradas.length}</strong> de {resumenPorMateria.filas.length} estudiantes
                            </div>
                        </div>

                        {resumenPorMateria.modoModulos && (
                            <div className="cad-info-box">
                                <strong>Escala de módulos:</strong> 5 = Excelente | 4 = Muy bueno | 3 o menos = Recuperación
                            </div>
                        )}

                        <div className="cad-tabla-wrapper">
                            <table className="cad-tabla">
                                <thead>
                                    <tr>
                                        <th className="col-codigo" style={{ width: '120px' }}>Código</th>
                                        <th className="col-nombres" style={{ minWidth: '260px', textAlign: 'left' }}>Nombre del Estudiante</th>
                                        {resumenPorMateria.materias.map(m => {
                                            const displayName = (m.nombreMateria || '').trim() === 'Ciencias'
                                                ? 'Ciencias Naturales'
                                                : (m.nombreMateria || 'Sin materia');
                                            return (
                                                <th key={m.idMateria} style={{ minWidth: '90px' }}>{displayName}</th>
                                            );
                                        })}
                                        <th style={{ width: '100px' }}>Promedio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filasFiltradas.map(fila => (
                                        <tr key={fila.idEstudiante}>
                                            <td className="col-codigo">{fila.codigo}</td>
                                            <td className="col-nombres" title={formatearNombre(fila.nombres)}>
                                                <div className="nombre-completo">
                                                    {formatearNombre(fila.nombres)}
                                                </div>
                                            </td>
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
                    </div>
                )}

                {/* EMPTY STATES */}
                {!loading && !resumenPorMateria && filtros.idClase && (
                    <div className="cad-card">
                        <div className="cad-empty">
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
                    </div>
                )}

                {!filtros.idClase && (
                    <div className="cad-card">
                        <div className="cad-empty">
                            <h3>Bienvenido al Cuadro Auxiliar - Dirección</h3>
                            <p>Seleccione una clase y el tipo (Materias Básicas o Módulos).</p>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL EXPORTACIÓN */}
            {mostrarModalExportacion && (
                <div className="cad-modal-overlay" onClick={() => setMostrarModalExportacion(false)}>
                    <div className="cad-modal" onClick={e => e.stopPropagation()}>
                        <div className="cad-modal-header">
                            <h3>Exportar a Excel</h3>
                            <button className="cad-modal-close" onClick={() => setMostrarModalExportacion(false)}>X</button>
                        </div>

                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0, marginBottom: '16px' }}>
                            Selecciona el tipo de exportación según lo que necesites:
                        </p>

                        <button className="cad-export-btn" onClick={() => handleExportar('resumen-promedios')}>
                            <strong>1. Resumen de Promedios por Materia</strong>
                            <small>Solo notas finales (sin actividades ni sub-actividades)</small>
                        </button>

                        <button className="cad-export-btn" onClick={() => handleExportar('clase-materia-periodo')}>
                            <strong>2. Clase + Materia + 1 Período</strong>
                            <small>Con detalle de actividades y sub-actividades</small>
                        </button>

                        <button className="cad-export-btn" onClick={() => handleExportar('todas-periodos')}>
                            <strong>3. Clase + Materia + Todos los Períodos</strong>
                            <small>Una hoja por período con actividades</small>
                        </button>

                        <button className="cad-export-btn" onClick={() => handleExportar('todas-materias')}>
                            <strong>4. Clase + Todas las Materias + 1 Período</strong>
                            <small>Una hoja por materia</small>
                        </button>

                        <button className="cad-export-btn" onClick={() => handleExportar('clase-completa')}>
                            <strong>5. Clase Completa</strong>
                            <small>Todas las materias y todos los períodos</small>
                        </button>

                        <button className="cad-export-btn" onClick={() => handleExportar('consolidado')}>
                            <strong>6. Consolidado Anual</strong>
                            <small>Resumen por nivel de todo el año lectivo</small>
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CuadroAuxiliarDireccion;