// Componente Asignar Módulos a Docentes (Dirección / Registro) - MEJORADO
// Selecciona una clase de especialidad, genera la estructura de módulos
// y asigna cada módulo a un docente.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import modulosService from '../../services/modulosService';

const AsignarModulosDocentes = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [clases, setClases] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [grados, setGrados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Filtros
    const [filterAnio, setFilterAnio] = useState(new Date().getFullYear());
    const [filterEspecialidad, setFilterEspecialidad] = useState('todas');
    const [claseSel, setClaseSel] = useState('');
    const [busquedaDocente, setBusquedaDocente] = useState('');

    // Datos
    const [modulos, setModulos] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);

    // Modal generar estructura
    const [showGenerarModal, setShowGenerarModal] = useState(false);

    // Modal asignación masiva
    const [showMasivaModal, setShowMasivaModal] = useState(false);
    const [docenteMasivo, setDocenteMasivo] = useState('');
    const [modulosSeleccionados, setModulosSeleccionados] = useState([]);

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarCatalogos();
    }, []);

    const cargarCatalogos = async () => {
        try {
            const [clasesRes, docentesRes, gradosRes] = await Promise.all([
                API.get('/clases'),
                API.get('/docentes'),
                API.get('/grados')
            ]);
            setClases(clasesRes.data || []);
            setDocentes(docentesRes.data || []);
            setGrados(gradosRes.data || []);
        } catch (e) {
            mostrarMensaje('error', 'Error cargando catálogos');
        }
    };

    // ============================================================
    // CARGAR DATOS DE CLASE
    // ============================================================
    const cargarDatosClase = async (idClase) => {
        setLoading(true);
        try {
            const clase = clases.find(c => String(c.idClase) === String(idClase));
            if (!clase) {
                setModulos([]);
                setAsignaciones([]);
                return;
            }

            const grado = grados.find(g => String(g.idGrados) === String(clase.idGrado));
            const numeroGrado = grado?.numeroGrado || 0;

            const [modulosData, asigData] = await Promise.all([
                modulosService.listar(clase.idEspecialidad, numeroGrado),
                modulosService.listarAsignaciones({ clase: idClase })
            ]);
            setModulos(modulosData || []);
            setAsignaciones(asigData || []);
        } catch (e) {
            mostrarMensaje('error', 'Error cargando módulos de la clase');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (claseSel) {
            cargarDatosClase(claseSel);
        } else {
            setModulos([]);
            setAsignaciones([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claseSel]);

    // ============================================================
    // ASIGNACIÓN
    // ============================================================
    const docenteAsignado = (idModulo) => {
        const asig = asignaciones.find(a => a.idModulo === idModulo);
        return asig ? asig.idDocente : '';
    };

    const asignarDocente = async (idModulo, idDocente) => {
        const previo = docenteAsignado(idModulo);
        setSaving(true);
        try {
            if (!idDocente) {
                const asig = asignaciones.find(a => a.idModulo === idModulo);
                if (asig) await modulosService.desasignar(asig.idDocenteModulo);
                mostrarMensaje('success', 'Docente removido del módulo');
            } else {
                await modulosService.asignar({
                    idDocente: parseInt(idDocente),
                    idModulo,
                    idClase: parseInt(claseSel),
                    anioLectivo: parseInt(filterAnio)
                });
                mostrarMensaje('success', previo ? 'Asignación actualizada' : 'Docente asignado correctamente');
            }
            await cargarDatosClase(claseSel);
        } catch (e) {
            mostrarMensaje('error', 'Error al asignar: ' + (e.response?.data?.mensaje || e.message));
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ASIGNACIÓN MASIVA
    // ============================================================
    const abrirAsignacionMasiva = () => {
        if (modulos.length === 0) {
            mostrarMensaje('warning', 'No hay módulos para asignar');
            return;
        }
        setModulosSeleccionados(modulos.map(m => m.idModulo));
        setDocenteMasivo('');
        setShowMasivaModal(true);
    };

    const toggleModuloSeleccionado = (idModulo) => {
        setModulosSeleccionados(prev =>
            prev.includes(idModulo)
                ? prev.filter(id => id !== idModulo)
                : [...prev, idModulo]
        );
    };

    const toggleTodosModulos = () => {
        if (modulosSeleccionados.length === modulos.length) {
            setModulosSeleccionados([]);
        } else {
            setModulosSeleccionados(modulos.map(m => m.idModulo));
        }
    };

    const aplicarAsignacionMasiva = async () => {
        if (!docenteMasivo) {
            mostrarMensaje('warning', 'Seleccione un docente');
            return;
        }
        if (modulosSeleccionados.length === 0) {
            mostrarMensaje('warning', 'Seleccione al menos un módulo');
            return;
        }

        setSaving(true);
        try {
            for (const idModulo of modulosSeleccionados) {
                const asigExistente = asignaciones.find(a => a.idModulo === idModulo);
                if (asigExistente) {
                    // Si ya estaba asignado a otro, actualizar
                    if (asigExistente.idDocente !== parseInt(docenteMasivo)) {
                        await modulosService.desasignar(asigExistente.idDocenteModulo);
                        await modulosService.asignar({
                            idDocente: parseInt(docenteMasivo),
                            idModulo,
                            idClase: parseInt(claseSel),
                            anioLectivo: parseInt(filterAnio)
                        });
                    }
                } else {
                    await modulosService.asignar({
                        idDocente: parseInt(docenteMasivo),
                        idModulo,
                        idClase: parseInt(claseSel),
                        anioLectivo: parseInt(filterAnio)
                    });
                }
            }
            mostrarMensaje('success', `${modulosSeleccionados.length} módulos asignados`);
            setShowMasivaModal(false);
            await cargarDatosClase(claseSel);
        } catch (e) {
            mostrarMensaje('error', 'Error al asignar: ' + (e.response?.data?.mensaje || e.message));
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // GENERAR ESTRUCTURA
    // ============================================================
    const generarEstructura = async () => {
        setSaving(true);
        try {
            const resp = await modulosService.generarEstructura(parseInt(claseSel));
            mostrarMensaje('success', resp.mensaje || 'Estructura generada correctamente');
            setShowGenerarModal(false);
            await cargarDatosClase(claseSel);
        } catch (e) {
            mostrarMensaje('error', 'Error generando estructura: ' + (e.response?.data?.mensaje || e.message));
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getNombreDocente = (id) => {
        const d = docentes.find(d => d.idDocente === Number(id));
        return d ? `${d.apellidos}, ${d.nombres}` : '';
    };

    const getIniciales = (nombre) => {
        if (!nombre) return '?';
        const partes = nombre.split(' ').filter(p => p.length > 0);
        return partes.slice(0, 2).map(p => p[0]).join('').toUpperCase();
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const clasesEspecialidad = useMemo(() => {
        return clases.filter(c => {
            if (!c.idEspecialidad) return false;
            if (filterAnio && Number(c.anioLectivo) !== Number(filterAnio)) return false;
            if (filterEspecialidad !== 'todas') {
                return Number(c.idEspecialidad) === Number(filterEspecialidad);
            }
            return true;
        });
    }, [clases, filterAnio, filterEspecialidad]);

    const especialidadesDisponibles = useMemo(() => {
        const map = new Map();
        clases.forEach(c => {
            if (c.idEspecialidad && !map.has(c.idEspecialidad)) {
                map.set(c.idEspecialidad, {
                    id: c.idEspecialidad,
                    nombre: c.especialidad?.nombreEspecialidad || c.nombreEspecialidad || `Especialidad ${c.idEspecialidad}`
                });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [clases]);

    const docentesFiltrados = useMemo(() => {
        const term = busquedaDocente.trim().toLowerCase();
        const activos = docentes.filter(d => d.estado !== false);
        if (!term) return activos;
        return activos.filter(d =>
            `${d.nombres} ${d.apellidos}`.toLowerCase().includes(term) ||
            (d.codigoDocente && d.codigoDocente.toLowerCase().includes(term)) ||
            (d.especialidadDocente && d.especialidadDocente.toLowerCase().includes(term))
        );
    }, [docentes, busquedaDocente]);

    const stats = useMemo(() => {
        const total = modulos.length;
        const asignados = modulos.filter(m => docenteAsignado(m.idModulo)).length;
        const sinAsignar = total - asignados;
        const cobertura = total > 0 ? Math.round((asignados / total) * 100) : 0;
        return { total, asignados, sinAsignar, cobertura };
    }, [modulos, asignaciones]);

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout title="Asignar Módulos a Docentes">
            <style>{`
                .amd-container { display: flex; flex-direction: column; gap: 20px; }
                .amd-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .amd-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .amd-intro { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }

                .amd-filtros { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 14px; margin-bottom: 16px; }
                .amd-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .amd-field input, .amd-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .amd-field input:focus, .amd-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                .amd-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .amd-btn:disabled { opacity: .6; cursor: not-allowed; }
                .amd-btn-primary { background: #1e3a5f; color: #fff; }
                .amd-btn-primary:hover:not(:disabled) { background: #16293f; }
                .amd-btn-success { background: #16a34a; color: #fff; }
                .amd-btn-success:hover:not(:disabled) { background: #15803d; }
                .amd-btn-info { background: #3b82f6; color: #fff; }
                .amd-btn-info:hover:not(:disabled) { background: #2563eb; }
                .amd-btn-warning { background: #e67e22; color: #fff; }
                .amd-btn-warning:hover:not(:disabled) { background: #d35400; }
                .amd-btn-secondary { background: #e5e7eb; color: #334155; }
                .amd-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .amd-btn-sm { padding: 5px 12px; font-size: 12px; }

                .amd-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 16px; }
                .amd-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .amd-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .amd-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .amd-stat-total { background: #eff6ff; color: #1e40af; }
                .amd-stat-asignados { background: #dcfce7; color: #15803d; }
                .amd-stat-sinasignar { background: #fee2e2; color: #b91c1c; }
                .amd-stat-cobertura { background: #dbeafe; color: #1d4ed8; }

                .amd-progress { width: 100%; height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; margin-top: 8px; }
                .amd-progress-fill { height: 100%; transition: width .4s; }

                .amd-table { width: 100%; border-collapse: collapse; }
                .amd-table thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 12px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .amd-table thead th:first-child { border-top-left-radius: 8px; }
                .amd-table thead th:last-child { border-top-right-radius: 8px; }
                .amd-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .amd-table tbody tr:hover { background: #f8fafc; }
                .amd-table tbody tr:nth-child(even) { background: #fafbfc; }
                .amd-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .amd-table td { padding: 10px; font-size: 13px; color: #334155; vertical-align: middle; }

                .amd-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }
                .amd-badge-codigo { background: #dbeafe; color: #1d4ed8; border: 1px solid #3b82f6; }
                .amd-badge-ok { background: #dcfce7; color: #15803d; border: 1px solid #16a34a; }
                .amd-badge-pendiente { background: #fee2e2; color: #b91c1c; border: 1px solid #dc2626; }

                .amd-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; display: flex; justify-content: space-between; align-items: center; }
                .amd-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .amd-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }
                .amd-aviso.warning { background: #fef3c7; color: #b45309; border-left: 4px solid #e67e22; }
                .amd-aviso button { background: none; border: none; font-size: 18px; cursor: pointer; color: inherit; opacity: .7; }
                .amd-aviso button:hover { opacity: 1; }

                .amd-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                .amd-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .amd-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 560px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .amd-modal-lg { max-width: 680px; }
                .amd-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .amd-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .amd-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .amd-modal-close:hover { color: #dc2626; }
                .amd-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .amd-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }
                .amd-warning-box { background: #fef3c7; border-left: 4px solid #e67e22; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #92400e; }

                .amd-docente-avatar {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 32px; height: 32px; border-radius: 50%;
                    background: #1e3a5f; color: #fff; font-weight: 600; font-size: 12px;
                    margin-right: 8px;
                }

                .amd-modulo-lista {
                    max-height: 300px; overflow-y: auto; border: 1px solid #e2e8f0;
                    border-radius: 8px; padding: 8px; margin-top: 8px;
                }
                .amd-modulo-item {
                    display: flex; align-items: center; gap: 8px;
                    padding: 8px 10px; border-radius: 6px; cursor: pointer;
                    transition: background .15s;
                }
                .amd-modulo-item:hover { background: #f1f5f9; }
                .amd-modulo-item.selected { background: #dbeafe; }
                .amd-modulo-item input { cursor: pointer; }

                @media (max-width: 900px) {
                    .amd-filtros { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .amd-filtros { grid-template-columns: 1fr; }
                    .amd-table { font-size: 12px; }
                    .amd-table thead th, .amd-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="amd-container">
                {message.text && (
                    <div className={`amd-aviso ${message.type}`}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage({ type: '', text: '' })}>X</button>
                    </div>
                )}

                {/* INTRO */}
                <div className="amd-intro">
                    Selecciona una clase de especialidad, genera la estructura de módulos y asigna cada módulo a un docente.
                    Puedes usar <strong>Asignación masiva</strong> para asignar el mismo docente a varios módulos a la vez.
                </div>

                {/* FILTROS */}
                <div className="amd-card">
                    <h3>Filtros</h3>
                    <div className="amd-filtros">
                        <div className="amd-field">
                            <label>Año Lectivo</label>
                            <select value={filterAnio} onChange={e => { setFilterAnio(e.target.value); setClaseSel(''); }}>
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="amd-field">
                            <label>Especialidad</label>
                            <select value={filterEspecialidad} onChange={e => { setFilterEspecialidad(e.target.value); setClaseSel(''); }}>
                                <option value="todas">Todas</option>
                                {especialidadesDisponibles.map(esp => (
                                    <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="amd-field">
                            <label>Clase</label>
                            <select value={claseSel} onChange={e => setClaseSel(e.target.value)}>
                                <option value="">-- Seleccione una clase --</option>
                                {clasesEspecialidad.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} {c.seccion ? `(${c.seccion})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {claseSel && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                            <button
                                className="amd-btn amd-btn-success"
                                onClick={() => setShowGenerarModal(true)}
                                disabled={!claseSel || saving}
                            >
                                Generar Estructura de Módulos
                            </button>
                            <button
                                className="amd-btn amd-btn-warning"
                                onClick={abrirAsignacionMasiva}
                                disabled={modulos.length === 0 || saving}
                            >
                                Asignación Masiva
                            </button>
                        </div>
                    )}
                </div>

                {/* CONTENIDO */}
                {loading ? (
                    <div className="amd-card">
                        <p className="amd-empty">Cargando módulos...</p>
                    </div>
                ) : !claseSel ? (
                    <div className="amd-card">
                        <p className="amd-empty">Selecciona una clase para ver y asignar sus módulos</p>
                    </div>
                ) : modulos.length === 0 ? (
                    <div className="amd-card">
                        <p className="amd-empty">
                            No hay módulos definidos para esta especialidad y año.<br />
                            Defínelos en <strong>"Gestión de Módulos por Especialidad"</strong> o usa <strong>"Generar Estructura de Módulos"</strong>.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ESTADÍSTICAS */}
                        <div className="amd-stats">
                            <div className="amd-stat amd-stat-total">
                                <span className="num">{stats.total}</span>
                                <span className="lbl">Total Módulos</span>
                            </div>
                            <div className="amd-stat amd-stat-asignados">
                                <span className="num">{stats.asignados}</span>
                                <span className="lbl">Asignados</span>
                            </div>
                            <div className="amd-stat amd-stat-sinasignar">
                                <span className="num">{stats.sinAsignar}</span>
                                <span className="lbl">Sin Asignar</span>
                            </div>
                            <div className="amd-stat amd-stat-cobertura">
                                <span className="num">{stats.cobertura}%</span>
                                <span className="lbl">Cobertura</span>
                                <div className="amd-progress">
                                    <div
                                        className="amd-progress-fill"
                                        style={{
                                            width: `${stats.cobertura}%`,
                                            background: stats.cobertura >= 80
                                                ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                                                : stats.cobertura >= 50
                                                    ? 'linear-gradient(90deg, #e67e22, #f59e0b)'
                                                    : 'linear-gradient(90deg, #dc2626, #ef4444)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* BUSCADOR DE DOCENTES */}
                        <div className="amd-card">
                            <h3>Buscador de Docentes</h3>
                            <div className="amd-field">
                                <input
                                    type="text"
                                    placeholder="Buscar docente por nombre, código o especialidad..."
                                    value={busquedaDocente}
                                    onChange={e => setBusquedaDocente(e.target.value)}
                                />
                            </div>
                            <small style={{ color: '#64748b', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                                {docentesFiltrados.length} docentes disponibles
                            </small>
                        </div>

                        {/* TABLA DE MÓDULOS */}
                        <div className="amd-card">
                            <h3>Módulos de la Clase ({modulos.length})</h3>
                            <div className="table-responsive">
                                <table className="amd-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '140px' }}>Código</th>
                                            <th>Nombre del Módulo</th>
                                            <th style={{ width: '180px', textAlign: 'center' }}>Estado</th>
                                            <th style={{ width: '320px' }}>Docente Asignado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modulos
                                            .slice()
                                            .sort((a, b) => a.numeroModulo - b.numeroModulo)
                                            .map(m => {
                                                const docenteId = docenteAsignado(m.idModulo);
                                                const asignado = !!docenteId;
                                                return (
                                                    <tr key={m.idModulo}>
                                                        <td>
                                                            <span className="amd-badge amd-badge-codigo">
                                                                {m.codigo}
                                                            </span>
                                                        </td>
                                                        <td><strong>{m.nombreModulo}</strong></td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span className={`amd-badge ${asignado ? 'amd-badge-ok' : 'amd-badge-pendiente'}`}>
                                                                {asignado ? 'Asignado' : 'Sin asignar'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <select
                                                                value={docenteId || ''}
                                                                onChange={e => asignarDocente(m.idModulo, e.target.value)}
                                                                disabled={saving}
                                                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
                                                            >
                                                                <option value="">-- Sin docente --</option>
                                                                {docentesFiltrados.map(d => (
                                                                    <option key={d.idDocente} value={d.idDocente}>
                                                                        {d.apellidos}, {d.nombres}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* MODAL GENERAR ESTRUCTURA */}
            {showGenerarModal && (
                <div className="amd-modal-overlay" onClick={() => !saving && setShowGenerarModal(false)}>
                    <div className="amd-modal" onClick={e => e.stopPropagation()}>
                        <div className="amd-modal-header">
                            <h3>Generar Estructura de Módulos</h3>
                            <button className="amd-modal-close" onClick={() => setShowGenerarModal(false)} disabled={saving}>X</button>
                        </div>
                        <div className="amd-warning-box">
                            Esta acción generará las <strong>actividades</strong> de cada módulo para la clase seleccionada.
                            Si ya existen actividades, se conservarán las existentes.
                        </div>
                        <p>
                            Se crearán las actividades correspondientes a los módulos definidos para esta
                            especialidad y año, aplicadas a todos los estudiantes inscritos en la clase.
                        </p>
                        <div className="amd-modal-actions">
                            <button className="amd-btn amd-btn-secondary" onClick={() => setShowGenerarModal(false)} disabled={saving}>
                                Cancelar
                            </button>
                            <button className="amd-btn amd-btn-success" onClick={generarEstructura} disabled={saving}>
                                {saving ? 'Generando...' : 'Confirmar y Generar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ASIGNACIÓN MASIVA */}
            {showMasivaModal && (
                <div className="amd-modal-overlay" onClick={() => !saving && setShowMasivaModal(false)}>
                    <div className="amd-modal amd-modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="amd-modal-header">
                            <h3>Asignación Masiva de Módulos</h3>
                            <button className="amd-modal-close" onClick={() => setShowMasivaModal(false)} disabled={saving}>X</button>
                        </div>

                        <div className="amd-info-box">
                            Asigna el mismo docente a varios módulos a la vez.
                        </div>

                        <div className="amd-field" style={{ marginBottom: '14px' }}>
                            <label>Docente a asignar *</label>
                            <select value={docenteMasivo} onChange={e => setDocenteMasivo(e.target.value)}>
                                <option value="">-- Seleccione un docente --</option>
                                {docentesFiltrados.map(d => (
                                    <option key={d.idDocente} value={d.idDocente}>
                                        {d.apellidos}, {d.nombres} {d.especialidadDocente ? `(${d.especialidadDocente})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="amd-field">
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Módulos a asignar ({modulosSeleccionados.length} de {modulos.length})</span>
                                <button
                                    className="amd-btn amd-btn-secondary amd-btn-sm"
                                    onClick={toggleTodosModulos}
                                >
                                    {modulosSeleccionados.length === modulos.length ? 'Quitar todos' : 'Seleccionar todos'}
                                </button>
                            </label>
                            <div className="amd-modulo-lista">
                                {modulos
                                    .slice()
                                    .sort((a, b) => a.numeroModulo - b.numeroModulo)
                                    .map(m => {
                                        const seleccionado = modulosSeleccionados.includes(m.idModulo);
                                        return (
                                            <div
                                                key={m.idModulo}
                                                className={`amd-modulo-item ${seleccionado ? 'selected' : ''}`}
                                                onClick={() => toggleModuloSeleccionado(m.idModulo)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={seleccionado}
                                                    onChange={() => toggleModuloSeleccionado(m.idModulo)}
                                                />
                                                <strong style={{ fontFamily: 'monospace', color: '#1e40af' }}>
                                                    {m.codigo}
                                                </strong>
                                                <span style={{ color: '#475569' }}>{m.nombreModulo}</span>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>

                        <div className="amd-modal-actions">
                            <button className="amd-btn amd-btn-secondary" onClick={() => setShowMasivaModal(false)} disabled={saving}>
                                Cancelar
                            </button>
                            <button
                                className="amd-btn amd-btn-warning"
                                onClick={aplicarAsignacionMasiva}
                                disabled={saving || !docenteMasivo || modulosSeleccionados.length === 0}
                            >
                                {saving ? 'Asignando...' : `Asignar a ${modulosSeleccionados.length} módulo${modulosSeleccionados.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AsignarModulosDocentes;