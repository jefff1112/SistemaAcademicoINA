// Componente MiHorarioDocente: muestra el horario semanal de clases del docente en formato de tabla.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: grilla horaria por día y hora, más resumen de clases.
const MiHorarioDocente = () => {
    const [horario, setHorario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    const [docenteId, setDocenteId] = useState(null);
    const [filterDia, setFilterDia] = useState('');
    const [busqueda, setBusqueda] = useState('');

    const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
    const horas = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

    // Normaliza una hora a formato HH:MM
    const normalizarHora = (hora) => {
        if (!hora) return '';
        const partes = hora.split(':');
        return partes.length >= 2 ? `${partes[0].padStart(2, '0')}:${partes[1]}` : hora;
    };

    // Filas de la grilla
    const getHorasGrilla = () => {
        const base = horas.map(h => normalizarHora(h));
        const presentes = horario.map(h => normalizarHora(h.horaInicio));
        return [...new Set([...base, ...presentes])].sort();
    };

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarHorario();
    }, []);

    const cargarHorario = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const docentesRes = await API.get('/docentes');
            const docente = docentesRes.data.find(d => d.codigoDocente === user?.codigo);

            if (docente) {
                setDocenteId(docente.idDocente);
                const response = await API.get(`/horarios/docente/${docente.idDocente}`);
                setHorario(response.data || []);
            }
        } catch (error) {
            mostrarMensaje('Error al cargar horario', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Escucha cambios en otras pestañas
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'horario_updated') {
                try {
                    const data = JSON.parse(e.newValue);
                    if (!data) return;
                    if (data.idDocente && docenteId && parseInt(data.idDocente) === parseInt(docenteId)) {
                        cargarHorario();
                    } else if (data.idClase) {
                        cargarHorario();
                    }
                } catch (err) {
                    console.error('Error procesando evento storage horario_updated', err);
                }
            }
        };

        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [docenteId]);

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
    const getDiaBadge = (dia) => {
        switch (dia) {
            case 'Lunes': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            case 'Martes': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Miercoles': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Jueves': return { bg: '#e9d5ff', color: '#6b21a8', border: '#a855f7' };
            case 'Viernes': return { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    const getHorarioCelda = (dia, hora) => {
        const clases = horario.filter(h => h.diaSemana === dia && normalizarHora(h.horaInicio) === normalizarHora(hora));
        if (clases.length > 0) {
            return (
                <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {clases.map((clase, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '6px 8px',
                                background: '#eff6ff',
                                borderRadius: '6px',
                                border: '1px solid #bfdbfe',
                                borderLeft: '3px solid #3b82f6',
                                fontSize: '11px',
                                lineHeight: 1.3
                            }}
                        >
                            <strong style={{ color: '#1e3a5f', display: 'block', marginBottom: '2px' }}>
                                {clase.materia}
                            </strong>
                            <small style={{ color: '#475569', display: 'block' }}>{clase.clase}</small>
                            {clase.aula && (
                                <small style={{ color: '#94a3b8', display: 'block', fontFamily: 'monospace' }}>
                                    Aula: {clase.aula}
                                </small>
                            )}
                        </div>
                    ))}
                </div>
            );
        }
        return <div style={{ height: '60px' }}></div>;
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const horarioFiltrado = useMemo(() => {
        return horario.filter(h => {
            if (filterDia && h.diaSemana !== filterDia) return false;
            if (busqueda) {
                const term = busqueda.toLowerCase();
                return (
                    (h.clase && h.clase.toLowerCase().includes(term)) ||
                    (h.materia && h.materia.toLowerCase().includes(term)) ||
                    (h.aula && h.aula.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [horario, filterDia, busqueda]);

    const stats = useMemo(() => {
        const diasConClase = new Set(horario.map(h => h.diaSemana)).size;
        const materiasUnicas = new Set(horario.map(h => h.materia)).size;
        const aulasUnicas = new Set(horario.filter(h => h.aula).map(h => h.aula)).size;
        return {
            totalClases: horario.length,
            diasConClase,
            materiasUnicas,
            aulasUnicas
        };
    }, [horario]);

    const filtrosActivos = (filterDia ? 1 : 0) + (busqueda ? 1 : 0);

    const limpiarFiltros = () => {
        setFilterDia('');
        setBusqueda('');
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Mi Horario">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER SIN HORARIO
    // ============================================================
    if (!loading && horario.length === 0) {
        return (
            <DashboardLayout title="Mi Horario - Docente">
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '22px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '18px' }}>Mi Horario</h3>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                        <h3 style={{ color: '#334155', margin: '0 0 8px' }}>No hay clases asignadas</h3>
                        <p>No se encontraron clases asignadas para su usuario. Si debería ver su horario, verifique que su cuenta de docente esté vinculada correctamente o que existan horarios asignados a su clase.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Mi Horario - Docente">
            <style>{`
                .mh-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }

                .mh-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,.05);
                    border: 1px solid #e2e8f0;
                }
                .mh-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .mh-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .mh-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .mh-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .mh-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .mh-stat-clases { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .mh-stat-dias { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
                .mh-stat-materias { background: #e9d5ff; color: #6b21a8; border-color: #d8b4fe; }
                .mh-stat-aulas { background: #fef3c7; color: #b45309; border-color: #fde68a; }

                /* Filtros */
                .mh-filtros { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; }
                .mh-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .mh-field input, .mh-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; background-color: #ffffff;
                }
                .mh-field input:focus, .mh-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .mh-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 600; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                    font-family: inherit;
                }
                .mh-btn:disabled { opacity: .6; cursor: not-allowed; }
                .mh-btn-primary { background: #1e3a5f; color: #fff; }
                .mh-btn-primary:hover:not(:disabled) { background: #16293f; }
                .mh-btn-secondary { background: #e5e7eb; color: #334155; }
                .mh-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .mh-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - FONDO BLANCO FORZADO */
                .mh-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .mh-tabla thead th {
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
                .mh-tabla tbody tr { border-bottom: 1px solid #e2e8f0; background-color: #ffffff !important; }
                .mh-tabla tbody tr:hover { background-color: #f8fafc !important; }
                .mh-tabla td {
                    padding: 10px;
                    color: #1e293b !important;
                    vertical-align: top;
                    background-color: #ffffff !important;
                }
                .mh-tabla tbody tr:hover td { background-color: #f8fafc !important; }
                .mh-tabla td.col-hora {
                    font-family: monospace;
                    font-size: 12px;
                    color: #1e3a5f !important;
                    font-weight: 700;
                    width: 70px;
                    background-color: #f8fafc !important;
                }
                .mh-tabla td.col-clase { font-weight: 600; color: #0f172a !important; }
                .mh-tabla td.col-materia { color: #1e40af !important; font-weight: 600; }
                .mh-tabla td.col-horario {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                    white-space: nowrap;
                }

                .mh-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .mh-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .mh-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .mh-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .mh-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .mh-empty h3 { color: #334155; margin: 0 0 8px; }

                .mh-badge-filtros {
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
                    .mh-filtros { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .mh-tabla { font-size: 12px; }
                    .mh-tabla thead th, .mh-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="mh-container">
                {mensaje && <div className={`mh-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="mh-stats">
                    <div className="mh-stat mh-stat-clases">
                        <span className="num">{stats.totalClases}</span>
                        <span className="lbl">Total Clases</span>
                    </div>
                    <div className="mh-stat mh-stat-dias">
                        <span className="num">{stats.diasConClase}</span>
                        <span className="lbl">Días con Clase</span>
                    </div>
                    <div className="mh-stat mh-stat-materias">
                        <span className="num">{stats.materiasUnicas}</span>
                        <span className="lbl">Materias Distintas</span>
                    </div>
                    <div className="mh-stat mh-stat-aulas">
                        <span className="num">{stats.aulasUnicas}</span>
                        <span className="lbl">Aulas Distintas</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="mh-card">
                    <h3>
                        Filtros de Búsqueda
                        {filtrosActivos > 0 && (
                            <span className="mh-badge-filtros">
                                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <div className="mh-filtros">
                        <div className="mh-field">
                            <label>Día</label>
                            <select value={filterDia} onChange={(e) => setFilterDia(e.target.value)}>
                                <option value="">Todos los días</option>
                                {diasSemana.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mh-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por clase, materia o aula..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="mh-btn mh-btn-secondary" onClick={cargarHorario}>
                                Recargar
                            </button>
                            {filtrosActivos > 0 && (
                                <button className="mh-btn mh-btn-secondary" onClick={limpiarFiltros}>
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{horarioFiltrado.length}</strong> de {horario.length} clases
                        </div>
                    </div>
                </div>

                {/* GRILLA HORARIA */}
                <div className="mh-card">
                    <h3>Horario de Clases</h3>
                    <div className="table-responsive">
                        <table className="mh-tabla">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}>Hora</th>
                                    {diasSemana.map(d => (
                                        <th key={d}>{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {getHorasGrilla().map(hora => (
                                    <tr key={hora}>
                                        <td className="col-hora">{hora}</td>
                                        {diasSemana.map(dia => (
                                            <td key={`${dia}-${hora}`}>
                                                {getHorarioCelda(dia, hora)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RESUMEN DE CLASES */}
                <div className="mh-card">
                    <h3>Resumen de Clases</h3>

                    {horarioFiltrado.length === 0 ? (
                        <div className="mh-empty">
                            <h3>No hay clases que coincidan</h3>
                            <p>Prueba ajustando los filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="mh-tabla">
                                <thead>
                                    <tr>
                                        <th style={{ width: '110px' }}>Día</th>
                                        <th>Clase</th>
                                        <th>Materia</th>
                                        <th style={{ width: '140px' }}>Horario</th>
                                        <th style={{ width: '100px' }}>Aula</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {horarioFiltrado.map((h, index) => {
                                        const diaBadge = getDiaBadge(h.diaSemana);
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <span
                                                        className="mh-badge"
                                                        style={{
                                                            backgroundColor: diaBadge.bg,
                                                            color: diaBadge.color,
                                                            border: `1px solid ${diaBadge.border}`
                                                        }}
                                                    >
                                                        {h.diaSemana}
                                                    </span>
                                                </td>
                                                <td className="col-clase">{h.clase}</td>
                                                <td className="col-materia">{h.materia}</td>
                                                <td className="col-horario">
                                                    {normalizarHora(h.horaInicio)} - {normalizarHora(h.horaFin)}
                                                </td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                                                    {h.aula || '-'}
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
        </DashboardLayout>
    );
};

export default MiHorarioDocente;