// Componente Exportar Boletas (Registro Académico) - MEJORADO
// Genera y descarga boletas de notas en PDF (formatos INA o MINED) por clase y periodo.
import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import boletaService from '../../services/boletaService';
import DashboardLayout from '../Layout/DashboardLayout';

const ExportarBoletasRegistro = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [claseSeleccionada, setClaseSeleccionada] = useState('');
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
    const [formatoSeleccionado, setFormatoSeleccionado] = useState('INA');
    const [tipoSeleccionado, setTipoSeleccionado] = useState('periodo');
    const [cargando, setCargando] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [mensajeTipo, setMensajeTipo] = useState('success');
    
    // Selección individual de estudiantes para exportación
    const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);
    const [seleccionarTodos, setSeleccionarTodos] = useState(true);

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
            setEstudiantesSeleccionados([]);
        }
    }, [claseSeleccionada]);

    // Actualizar selección cuando cambian los estudiantes
    useEffect(() => {
        if (estudiantes.length > 0 && seleccionarTodos) {
            setEstudiantesSeleccionados(estudiantes.map(e => e.idEstudiante));
        }
    }, [estudiantes, seleccionarTodos]);

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

    const getClaseNombre = (id) => {
        const c = clases.find(c => c.idClase === parseInt(id));
        return c ? `${c.nombreClase} - ${c.seccion}` : '-';
    };

    const getPeriodoNombre = (id) => {
        if (!id) return '-';
        const p = periodos.find(p => p.idPeriodo === parseInt(id));
        return p ? p.nombre : '-';
    };

    // ============================================================
    // GENERAR BOLETAS
    // ============================================================
    const generarBoletas = async () => {
        if (!claseSeleccionada) {
            mostrarMensaje('Seleccione una clase', 'warning');
            return;
        }

        if (tipoSeleccionado === 'periodo' && !periodoSeleccionado) {
            mostrarMensaje('Seleccione un periodo', 'warning');
            return;
        }

        if (estudiantesSeleccionados.length === 0) {
            mostrarMensaje('Seleccione al menos un estudiante', 'warning');
            return;
        }

        setGenerando(true);
        try {
            // Filtrar solo los estudiantes seleccionados
            const estudiantesAExportar = estudiantes.filter(e => 
                estudiantesSeleccionados.includes(e.idEstudiante)
            );

            if (formatoSeleccionado === 'MINED') {
                await boletaService.generarPDFMined(
                    estudiantesAExportar,
                    parseInt(periodoSeleccionado || 0),
                    parseInt(claseSeleccionada),
                    tipoSeleccionado
                );
                mostrarMensaje(`Boletas MINED generadas correctamente (${estudiantesAExportar.length} estudiante(s))`, 'success');
            } else {
                await boletaService.generarPDFINA(
                    estudiantesAExportar,
                    parseInt(periodoSeleccionado || 0),
                    parseInt(claseSeleccionada),
                    tipoSeleccionado
                );
                mostrarMensaje(`Boletas INA generadas correctamente (${estudiantesAExportar.length} estudiante(s))`, 'success');
            }
        } catch (err) {
            console.error('Error al generar boletas:', err);
            mostrarMensaje('Error al generar las boletas', 'danger');
        } finally {
            setGenerando(false);
        }
    };

    // ============================================================
    // DERIVADOS
    // ============================================================
    const puedeGenerar = useMemo(() => {
        return claseSeleccionada && estudiantesSeleccionados.length > 0 &&
            (tipoSeleccionado === 'global' || periodoSeleccionado);
    }, [claseSeleccionada, estudiantesSeleccionados, tipoSeleccionado, periodoSeleccionado]);

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout title="Exportar Boletas - Registro Académico">
            <style>{`
                .eb-container { display: flex; flex-direction: column; gap: 20px; }
                .eb-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .eb-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .eb-header h1 { margin: 0; color: #1e3a5f; font-size: 22px; }
                .eb-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }

                /* Filtros */
                .eb-filtros { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
                .eb-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .eb-field input, .eb-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .eb-field input:focus, .eb-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .eb-field input:disabled, .eb-field select:disabled {
                    background: #f1f5f9; color: #94a3b8; cursor: not-allowed;
                }

                /* Botones */
                .eb-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .eb-btn:disabled { opacity: .6; cursor: not-allowed; }
                .eb-btn-primary { background: #1e3a5f; color: #fff; }
                .eb-btn-primary:hover:not(:disabled) { background: #16293f; }
                .eb-btn-success { background: #16a34a; color: #fff; }
                .eb-btn-success:hover:not(:disabled) { background: #15803d; }
                .eb-btn-secondary { background: #e5e7eb; color: #334155; }
                .eb-btn-secondary:hover:not(:disabled) { background: #d1d5db; }

                /* Estadísticas */
                .eb-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .eb-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .eb-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .eb-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .eb-stat-estudiantes { background: #eff6ff; color: #1e40af; }
                .eb-stat-formato { background: #dbeafe; color: #1d4ed8; }
                .eb-stat-tipo { background: #dcfce7; color: #15803d; }
                .eb-stat-periodo { background: #fef3c7; color: #b45309; }

                /* Avisos */
                .eb-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .eb-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .eb-aviso.danger { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }
                .eb-aviso.warning { background: #fef3c7; color: #b45309; border-left: 4px solid #e67e22; }

                /* Tabla */
                .eb-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
                .eb-tabla thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 11px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .eb-tabla thead th:first-child { border-top-left-radius: 8px; }
                .eb-tabla thead th:last-child { border-top-right-radius: 8px; }
                .eb-tabla tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .eb-tabla tbody tr:hover { background: #f8fafc; }
                .eb-tabla tbody tr:nth-child(even) { background: #fafbfc; }
                .eb-tabla tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .eb-tabla td { padding: 10px; color: #334155; vertical-align: middle; }

                .eb-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }
                .eb-badge-ok { background: #dcfce7; color: #15803d; border: 1px solid #16a34a; }
                .eb-badge-pendiente { background: #f1f5f9; color: #475569; border: 1px solid #94a3b8; }

                .eb-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
                .eb-empty h3 { color: #475569; margin: 0 0 8px; }

                .eb-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-top: 16px; font-size: 13px; color: #1e40af; }

                .eb-acciones {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 16px;
                    align-items: center;
                    justify-content: space-between;
                }

                @media (max-width: 768px) {
                    .eb-filtros { grid-template-columns: 1fr; }
                    .eb-tabla { font-size: 12px; }
                    .eb-tabla thead th, .eb-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="eb-container">
                {mensaje && <div className={`eb-aviso ${mensajeTipo}`}>{mensaje}</div>}

                {/* HEADER */}
                <div className="eb-card">
                    <div className="eb-header" style={{ marginBottom: '16px' }}>
                        <h1>Exportar Boletas de Notas</h1>
                        <p>Genera boletas en formato INA (2 por página) o MINED (1 por página)</p>
                    </div>

                    {/* FILTROS */}
                    <div className="eb-filtros">
                        <div className="eb-field">
                            <label>Clase *</label>
                            <select
                                value={claseSeleccionada}
                                onChange={(e) => {
                                    setClaseSeleccionada(e.target.value);
                                    setPeriodoSeleccionado('');
                                }}
                            >
                                <option value="">Seleccionar clase</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} (Sección {c.seccion}) - {c.anioLectivo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="eb-field">
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

                        <div className="eb-field">
                            <label>Periodo {tipoSeleccionado === 'global' && '(N/A)'}</label>
                            <select
                                value={periodoSeleccionado}
                                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                                disabled={tipoSeleccionado === 'global'}
                            >
                                <option value="">{tipoSeleccionado === 'global' ? 'No aplica' : 'Seleccionar periodo'}</option>
                                {periodos.map(p => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombre} ({p.anioLectivo})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="eb-field">
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

                    <div className="eb-acciones">
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                className="eb-btn eb-btn-primary"
                                onClick={generarBoletas}
                                disabled={!puedeGenerar || generando}
                            >
                                {generando ? 'Generando...' : 'Generar PDF'}
                            </button>
                            <button
                                className="eb-btn eb-btn-secondary"
                                onClick={() => {
                                    setClaseSeleccionada('');
                                    setPeriodoSeleccionado('');
                                    setFormatoSeleccionado('INA');
                                    setTipoSeleccionado('periodo');
                                    setEstudiantes([]);
                                }}
                                disabled={!claseSeleccionada && !periodoSeleccionado}
                            >
                                Limpiar
                            </button>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            {puedeGenerar ? 'Listo para generar' : 'Complete los filtros para continuar'}
                        </div>
                    </div>

                    {tipoSeleccionado === 'global' && (
                        <div className="eb-info-box">
                            <strong>Modo Global:</strong> Se generarán boletas con las notas de todos los periodos (P1, P2, P3, P4).
                        </div>
                    )}
                </div>

                {/* ESTADÍSTICAS */}
                {(claseSeleccionada || estudiantes.length > 0) && (
                    <div className="eb-stats">
                        <div className="eb-stat eb-stat-estudiantes">
                            <span className="num">{estudiantes.length}</span>
                            <span className="lbl">Total Estudiantes</span>
                        </div>
                        <div className="eb-stat" style={{ background: '#fef3c7', color: '#b45309' }}>
                            <span className="num">{estudiantesSeleccionados.length}</span>
                            <span className="lbl">Seleccionados</span>
                        </div>
                        <div className="eb-stat eb-stat-formato">
                            <span className="num" style={{ fontSize: '14px', paddingTop: '6px' }}>
                                {formatoSeleccionado === 'MINED' ? 'MINED' : 'INA'}
                            </span>
                            <span className="lbl">Formato</span>
                        </div>
                        <div className="eb-stat eb-stat-tipo">
                            <span className="num" style={{ fontSize: '14px', paddingTop: '6px' }}>
                                {tipoSeleccionado === 'global' ? 'Global' : 'Por Periodo'}
                            </span>
                            <span className="lbl">Tipo</span>
                        </div>
                        <div className="eb-stat eb-stat-periodo">
                            <span className="num" style={{ fontSize: '14px', paddingTop: '6px' }}>
                                {tipoSeleccionado === 'global' ? 'P1-P4' : (getPeriodoNombre(periodoSeleccionado) || '-')}
                            </span>
                            <span className="lbl">Periodo</span>
                        </div>
                    </div>
                )}

                {/* VISTA PREVIA DE ESTUDIANTES */}
                {claseSeleccionada && (
                    <div className="eb-card">
                        <h3>
                            Vista Previa de Estudiantes
                            {claseSeleccionada && <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px', fontWeight: 'normal' }}>
                                - {getClaseNombre(claseSeleccionada)}
                            </span>}
                        </h3>

                        {cargando ? (
                            <p className="eb-empty">Cargando estudiantes...</p>
                        ) : estudiantes.length === 0 ? (
                            <p className="eb-empty">No hay estudiantes en esta clase</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="eb-tabla">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={seleccionarTodos && estudiantes.length > 0}
                                                    onChange={(e) => {
                                                        setSeleccionarTodos(e.target.checked);
                                                        if (e.target.checked) {
                                                            setEstudiantesSeleccionados(estudiantes.map(est => est.idEstudiante));
                                                        } else {
                                                            setEstudiantesSeleccionados([]);
                                                        }
                                                    }}
                                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                />
                                            </th>
                                            <th style={{ width: '40px' }}>#</th>
                                            <th style={{ width: '120px' }}>Código</th>
                                            <th>Nombre del Estudiante</th>
                                            <th style={{ width: '120px' }}>NIE</th>
                                            <th style={{ width: '100px', textAlign: 'center' }}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estudiantes.map((e, index) => {
                                            const isSelected = estudiantesSeleccionados.includes(e.idEstudiante);
                                            return (
                                                <tr key={e.idEstudiante} style={{ background: isSelected ? '#f0f9ff' : 'transparent' }}>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(ev) => {
                                                                if (ev.target.checked) {
                                                                    setEstudiantesSeleccionados([...estudiantesSeleccionados, e.idEstudiante]);
                                                                } else {
                                                                    setEstudiantesSeleccionados(estudiantesSeleccionados.filter(id => id !== e.idEstudiante));
                                                                    setSeleccionarTodos(false);
                                                                }
                                                            }}
                                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                        />
                                                    </td>
                                                    <td style={{ color: '#64748b' }}>{index + 1}</td>
                                                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                        {e.codigoEstudiante || '-'}
                                                    </td>
                                                    <td><strong>{formatearNombre(`${e.apellidos || ''}, ${e.nombres || ''}`)}</strong></td>
                                                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                        {e.nie || '-'}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span className={`eb-badge ${e.estado ? 'eb-badge-ok' : 'eb-badge-pendiente'}`}>
                                                            {e.estado ? 'Activo' : 'Inactivo'}
                                                        </span>
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

                {!claseSeleccionada && (
                    <div className="eb-card">
                        <div className="eb-empty">
                            <h3>Selecciona una clase</h3>
                            <p>Configura los filtros y genera las boletas de notas.</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ExportarBoletasRegistro;