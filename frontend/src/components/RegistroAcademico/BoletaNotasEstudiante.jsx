// Componente BoletaNotasEstudiante (Registro Académico) - MEJORADO
// Selecciona clase, periodo y estudiante, y genera el PDF de la boleta
// de notas individual en formato INA o MINED.
import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import boletaService from '../../services/boletaService';
import DashboardLayout from '../Layout/DashboardLayout';

const BoletaNotasEstudiante = ({ titulo = 'Boleta de Notas - Registro Académico' }) => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [claseSeleccionada, setClaseSeleccionada] = useState('');
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState('');
    const [formatoSeleccionado, setFormatoSeleccionado] = useState('INA');
    const [tipoSeleccionado, setTipoSeleccionado] = useState('periodo');
    const [cargando, setCargando] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [mensajeTipo, setMensajeTipo] = useState('success');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    useEffect(() => {
        if (claseSeleccionada) {
            cargarEstudiantes();
        } else {
            setEstudiantes([]);
            setEstudianteSeleccionado('');
        }
    }, [claseSeleccionada]);

    const cargarDatosIniciales = async () => {
        setCargando(true);
        try {
            const [clasesRes, periodosRes] = await Promise.all([
                API.get('/clases'),
                API.get('/periodosacademicos')
            ]);
            setClases(clasesRes.data || []);
            setPeriodos(periodosRes.data || []);
        } catch (err) {
            mostrarMensaje('Error al cargar datos', 'danger');
        } finally {
            setCargando(false);
        }
    };

    const cargarEstudiantes = async () => {
        if (!claseSeleccionada) return;
        setCargando(true);
        try {
            const res = await API.get(`/estudiantes/clase/${claseSeleccionada}`);
            setEstudiantes(res.data || []);
            setEstudianteSeleccionado('');
        } catch (err) {
            mostrarMensaje('Error al cargar estudiantes', 'danger');
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje(texto);
        setMensajeTipo(tipo);
        setTimeout(() => setMensaje(null), 4000);
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const formatearNombre = (nombres, apellidos) => {
        const n = (nombres || '').trim();
        const a = (apellidos || '').trim();
        return `${a}, ${n}`;
    };

    const getClaseNombre = (id) => {
        const c = clases.find(c => c.idClase === parseInt(id));
        return c ? `${c.nombreClase} - ${c.seccion || ''}` : '-';
    };

    const getPeriodoNombre = (id) => {
        if (!id) return '-';
        const p = periodos.find(p => p.idPeriodo === parseInt(id));
        return p ? p.nombre : '-';
    };

    const estudianteActual = useMemo(() => {
        return estudiantes.find(e => String(e.idEstudiante) === String(estudianteSeleccionado));
    }, [estudiantes, estudianteSeleccionado]);

    const puedeGenerar = useMemo(() => {
        if (!claseSeleccionada) return false;
        if (!estudianteSeleccionado) return false;
        if (tipoSeleccionado === 'periodo' && !periodoSeleccionado) return false;
        return true;
    }, [claseSeleccionada, estudianteSeleccionado, tipoSeleccionado, periodoSeleccionado]);

    // ============================================================
    // GENERAR BOLETA
    // ============================================================
    const generarBoleta = async () => {
        if (!claseSeleccionada) {
            mostrarMensaje('Seleccione una clase', 'warning');
            return;
        }
        if (!estudianteSeleccionado) {
            mostrarMensaje('Seleccione un estudiante', 'warning');
            return;
        }
        if (tipoSeleccionado === 'periodo' && !periodoSeleccionado) {
            mostrarMensaje('Seleccione un periodo', 'warning');
            return;
        }

        const estudiante = estudiantes.find(e => String(e.idEstudiante) === String(estudianteSeleccionado));
        if (!estudiante) {
            mostrarMensaje('Estudiante no encontrado', 'danger');
            return;
        }

        setGenerando(true);
        try {
            if (formatoSeleccionado === 'MINED') {
                await boletaService.generarPDFMined(
                    [estudiante],
                    parseInt(periodoSeleccionado || 0),
                    parseInt(claseSeleccionada),
                    tipoSeleccionado
                );
            } else {
                await boletaService.generarPDFINA(
                    [estudiante],
                    parseInt(periodoSeleccionado || 0),
                    parseInt(claseSeleccionada),
                    tipoSeleccionado
                );
            }
            mostrarMensaje('Boleta generada correctamente', 'success');
        } catch (err) {
            console.error('Error al generar boleta:', err);
            mostrarMensaje('Error al generar la boleta', 'danger');
        } finally {
            setGenerando(false);
        }
    };

    // ============================================================
    // LIMPIAR
    // ============================================================
    const limpiarFiltros = () => {
        setClaseSeleccionada('');
        setPeriodoSeleccionado('');
        setEstudianteSeleccionado('');
        setFormatoSeleccionado('INA');
        setTipoSeleccionado('periodo');
        setEstudiantes([]);
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout title={titulo}>
            <style>{`
                .bne-container { display: flex; flex-direction: column; gap: 20px; }
                .bne-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .bne-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .bne-header h1 { margin: 0; color: #1e3a5f; font-size: 22px; }
                .bne-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }

                /* Filtros */
                .bne-filtros { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
                .bne-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .bne-field input, .bne-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .bne-field input:focus, .bne-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .bne-field input:disabled, .bne-field select:disabled {
                    background: #f1f5f9; color: #94a3b8; cursor: not-allowed;
                }

                /* Botones */
                .bne-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .bne-btn:disabled { opacity: .6; cursor: not-allowed; }
                .bne-btn-primary { background: #1e3a5f; color: #fff; }
                .bne-btn-primary:hover:not(:disabled) { background: #16293f; }
                .bne-btn-success { background: #16a34a; color: #fff; }
                .bne-btn-success:hover:not(:disabled) { background: #15803d; }
                .bne-btn-secondary { background: #e5e7eb; color: #334155; }
                .bne-btn-secondary:hover:not(:disabled) { background: #d1d5db; }

                /* Card de estudiante */
                .bne-estudiante-card {
                    background: #eff6ff;
                    border-left: 4px solid #3b82f6;
                    border-radius: 8px;
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .bne-estudiante-info { display: flex; flex-direction: column; gap: 4px; }
                .bne-estudiante-nombre { font-weight: 600; color: #1e3a5f; font-size: 15px; }
                .bne-estudiante-detalle { font-size: 12px; color: #64748b; }

                .bne-estudiante-badges { display: flex; gap: 8px; flex-wrap: wrap; }
                .bne-badge {
                    display: inline-block; padding: 5px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                    letter-spacing: .5px;
                }
                .bne-badge-clase { background: #dbeafe; color: #1d4ed8; }
                .bne-badge-formato { background: #fef3c7; color: #b45309; }
                .bne-badge-tipo { background: #dcfce7; color: #15803d; }
                .bne-badge-periodo { background: #e9d5ff; color: #6b21a8; }

                /* Avisos */
                .bne-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .bne-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .bne-aviso.danger { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }
                .bne-aviso.warning { background: #fef3c7; color: #b45309; border-left: 4px solid #e67e22; }

                /* Estado listo */
                .bne-status {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                    padding: 14px 18px;
                    border-radius: 8px;
                    background: #f8fafc;
                    border: 1px dashed #cbd5e1;
                    margin-top: 16px;
                }
                .bne-status-text { font-size: 13px; color: #64748b; }
                .bne-status-text strong { color: #1e3a5f; }
                .bne-status-dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 6px;
                    background: #cbd5e1;
                }
                .bne-status-dot.list {
                    background: #16a34a;
                    box-shadow: 0 0 0 3px rgba(22,163,74,.2);
                }
                .bne-status-dot.pending {
                    background: #e67e22;
                    box-shadow: 0 0 0 3px rgba(230,126,34,.2);
                }

                /* Empty state */
                .bne-empty {
                    text-align: center; padding: 40px; color: #94a3b8; font-size: 14px;
                }
                .bne-empty h3 { color: #475569; margin: 0 0 8px; }

                .bne-info-box {
                    background: #eff6ff;
                    border-left: 4px solid #3b82f6;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-top: 16px;
                    font-size: 13px;
                    color: #1e40af;
                }

                @media (max-width: 768px) {
                    .bne-filtros { grid-template-columns: 1fr; }
                    .bne-estudiante-card { flex-direction: column; align-items: stretch; }
                }
            `}</style>

            <div className="bne-container">
                {/* HEADER */}
                <div className="bne-card">
                    <div className="bne-header" style={{ marginBottom: '16px' }}>
                        <h1>Boleta de Notas por Estudiante</h1>
                        <p>Genera el PDF de la boleta de notas para un estudiante específico</p>
                    </div>

                    {/* FILTROS */}
                    <div className="bne-filtros">
                        <div className="bne-field">
                            <label>Clase *</label>
                            <select
                                value={claseSeleccionada}
                                onChange={(e) => {
                                    setClaseSeleccionada(e.target.value);
                                    setEstudianteSeleccionado('');
                                }}
                            >
                                <option value="">Seleccionar clase</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} (Sección {c.seccion || '-'}) - {c.anioLectivo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bne-field">
                            <label>Estudiante {!claseSeleccionada && '(primero seleccione clase)'}</label>
                            <select
                                value={estudianteSeleccionado}
                                onChange={(e) => setEstudianteSeleccionado(e.target.value)}
                                disabled={!claseSeleccionada}
                            >
                                <option value="">
                                    {claseSeleccionada ? 'Seleccionar estudiante' : 'Primero seleccione clase'}
                                </option>
                                {estudiantes.map(e => (
                                    <option key={e.idEstudiante} value={e.idEstudiante}>
                                        {formatearNombre(e.nombres, e.apellidos)} - {e.codigoEstudiante || ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bne-field">
                            <label>Tipo de Boleta *</label>
                            <select
                                value={tipoSeleccionado}
                                onChange={(e) => {
                                    setTipoSeleccionado(e.target.value);
                                    if (e.target.value === 'global') setPeriodoSeleccionado('');
                                }}
                            >
                                <option value="periodo">Por Periodo</option>
                                <option value="global">Global (P1-P4)</option>
                            </select>
                        </div>

                        <div className="bne-field">
                            <label>Periodo {tipoSeleccionado === 'global' && '(N/A)'}</label>
                            <select
                                value={periodoSeleccionado}
                                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                                disabled={tipoSeleccionado === 'global'}
                            >
                                <option value="">{tipoSeleccionado === 'global' ? 'No aplica' : 'Seleccionar periodo'}</option>
                                {periodos.map(p => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bne-field">
                            <label>Formato *</label>
                            <select
                                value={formatoSeleccionado}
                                onChange={(e) => setFormatoSeleccionado(e.target.value)}
                            >
                                <option value="INA">INA (2 por página)</option>
                                <option value="MINED">MINED (1 por página)</option>
                            </select>
                        </div>
                    </div>

                    {/* ACCIONES */}
                    <div className="bne-acciones" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                        <button
                            className="bne-btn bne-btn-success"
                            onClick={generarBoleta}
                            disabled={!puedeGenerar || generando}
                        >
                            {generando ? 'Generando...' : 'Generar PDF'}
                        </button>
                        <button
                            className="bne-btn bne-btn-secondary"
                            onClick={limpiarFiltros}
                            disabled={!claseSeleccionada && !estudianteSeleccionado && !periodoSeleccionado}
                        >
                            Limpiar
                        </button>
                    </div>

                    {/* STATUS */}
                    <div className="bne-status">
                        <span className="bne-status-text">
                            <span className={`bne-status-dot ${puedeGenerar ? 'list' : 'pending'}`}></span>
                            {puedeGenerar ? (
                                <>
                                    <strong>Listo para generar</strong> - Haz clic en "Generar PDF"
                                </>
                            ) : (
                                <>
                                    <strong>Complete los filtros requeridos</strong> para continuar
                                </>
                            )}
                        </span>
                        {estudiantes.length > 0 && (
                            <span className="bne-status-text">
                                <strong>{estudiantes.length}</strong> estudiante{estudiantes.length !== 1 ? 's' : ''} en la clase
                            </span>
                        )}
                    </div>

                    {tipoSeleccionado === 'global' && (
                        <div className="bne-info-box">
                            <strong>Modo Global:</strong> Se generarán boletas con las notas de todos los periodos (P1, P2, P3, P4).
                        </div>
                    )}
                </div>

                {/* CARD DEL ESTUDIANTE SELECCIONADO */}
                {estudianteActual && (
                    <div className="bne-card">
                        <h3>Estudiante Seleccionado</h3>
                        <div className="bne-estudiante-card">
                            <div className="bne-estudiante-info">
                                <div className="bne-estudiante-nombre">
                                    {formatearNombre(estudianteActual.nombres, estudianteActual.apellidos)}
                                </div>
                                <div className="bne-estudiante-detalle">
                                    Código: {estudianteActual.codigoEstudiante || '-'}
                                    {estudianteActual.nie && ` | NIE: ${estudianteActual.nie}`}
                                </div>
                            </div>
                            <div className="bne-estudiante-badges">
                                <span className="bne-badge bne-badge-clase">
                                    {getClaseNombre(claseSeleccionada)}
                                </span>
                                <span className="bne-badge bne-badge-tipo">
                                    {tipoSeleccionado === 'global' ? 'Global P1-P4' : 'Por Periodo'}
                                </span>
                                {tipoSeleccionado === 'periodo' && periodoSeleccionado && (
                                    <span className="bne-badge bne-badge-periodo">
                                        {getPeriodoNombre(periodoSeleccionado)}
                                    </span>
                                )}
                                <span className="bne-badge bne-badge-formato">
                                    {formatoSeleccionado === 'MINED' ? 'MINED (1 por página)' : 'INA (2 por página)'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!claseSeleccionada && (
                    <div className="bne-card">
                        <div className="bne-empty">
                            <h3>Selecciona una clase para comenzar</h3>
                            <p>Luego podrás elegir un estudiante y generar su boleta de notas.</p>
                        </div>
                    </div>
                )}

                {claseSeleccionada && estudiantes.length === 0 && !cargando && (
                    <div className="bne-card">
                        <div className="bne-empty">
                            <h3>No hay estudiantes en esta clase</h3>
                            <p>Verifica que la clase tenga estudiantes matriculados.</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BoletaNotasEstudiante;