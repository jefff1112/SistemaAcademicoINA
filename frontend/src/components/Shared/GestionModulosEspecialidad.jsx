// Componente Gestión de Módulos por Especialidad (Dirección / Registro) - MEJORADO
// Define los módulos de cada especialidad + año (código "Módulo X.Y").
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import modulosService from '../../services/modulosService';

const GRADOS_OPCIONES = [
    { value: 1, label: 'Primer Año' },
    { value: 2, label: 'Segundo Año' },
    { value: 3, label: 'Tercer Año' }
];

const GestionModulosEspecialidad = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [especialidades, setEspecialidades] = useState([]);
    const [especialidadSel, setEspecialidadSel] = useState('');
    const [gradoSel, setGradoSel] = useState('');
    const [modulos, setModulos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [modal, setModal] = useState({ mostrar: false, edicion: null });
    const [form, setForm] = useState({ numeroModulo: '', nombreModulo: '' });

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
        cargarEspecialidades();
    }, []);

    const cargarEspecialidades = async () => {
        try {
            const resp = await API.get('/especialidades');
            setEspecialidades(resp.data || []);
        } catch (e) {
            mostrarMensaje('error', 'Error cargando especialidades');
        }
    };

    const listarModulos = useCallback(async () => {
        if (!especialidadSel || !gradoSel) {
            setModulos([]);
            return;
        }
        setLoading(true);
        try {
            const data = await modulosService.listar(especialidadSel, gradoSel);
            setModulos(data || []);
        } catch (e) {
            mostrarMensaje('error', 'Error cargando módulos: ' + (e.response?.data?.mensaje || e.message));
        } finally {
            setLoading(false);
        }
    }, [especialidadSel, gradoSel]);

    useEffect(() => { listarModulos(); }, [listarModulos]);

    // ============================================================
    // MODAL
    // ============================================================
    const abrirModal = (modulo = null) => {
        setModal({ mostrar: true, edicion: modulo });
        setForm({
            numeroModulo: modulo ? String(modulo.numeroModulo) : '',
            nombreModulo: modulo ? modulo.nombreModulo : ''
        });
    };

    const cerrarModal = () => setModal({ mostrar: false, edicion: null });

    // ============================================================
    // GUARDAR
    // ============================================================
    const guardarModulo = async () => {
        if (!form.nombreModulo.trim()) {
            mostrarMensaje('warning', 'El nombre del módulo es requerido');
            return;
        }
        if (!form.numeroModulo) {
            mostrarMensaje('warning', 'El número del módulo es requerido');
            return;
        }

        // Validar número duplicado
        const numeroNuevo = parseInt(form.numeroModulo);
        const duplicado = modulos.find(m =>
            m.numeroModulo === numeroNuevo &&
            (!modal.edicion || m.idModulo !== modal.edicion.idModulo)
        );
        if (duplicado) {
            mostrarMensaje('error', `Ya existe un módulo con el número ${numeroNuevo}`);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                idEspecialidad: parseInt(especialidadSel),
                numeroGrado: parseInt(gradoSel),
                numeroModulo: numeroNuevo,
                nombreModulo: form.nombreModulo.trim(),
                orden: numeroNuevo
            };

            if (modal.edicion) {
                await modulosService.editar(modal.edicion.idModulo, payload);
                mostrarMensaje('success', 'Módulo actualizado correctamente');
            } else {
                await modulosService.crear(payload);
                mostrarMensaje('success', 'Módulo creado correctamente');
            }
            cerrarModal();
            await listarModulos();
        } catch (e) {
            mostrarMensaje('error', 'Error guardando módulo: ' + (e.response?.data?.mensaje || e.message));
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ELIMINAR
    // ============================================================
    const eliminarModulo = async (modulo) => {
        if (!window.confirm(`¿Eliminar el módulo ${modulo.codigo} - ${modulo.nombreModulo}?`)) return;
        try {
            await modulosService.eliminar(modulo.idModulo);
            mostrarMensaje('success', 'Módulo eliminado correctamente');
            await listarModulos();
        } catch (e) {
            mostrarMensaje('error', 'Error eliminando módulo: ' + (e.response?.data?.mensaje || e.message));
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getEspecialidadNombre = (id) => {
        const esp = especialidades.find(e => e.idEspecialidad === Number(id));
        return esp ? esp.nombreEspecialidad : '-';
    };

    const getGradoLabel = (value) => {
        const g = GRADOS_OPCIONES.find(o => o.value === Number(value));
        return g ? g.label : `Año ${value}`;
    };

    // Próximo número sugerido
    const proximoNumero = useMemo(() => {
        if (modulos.length === 0) return 1;
        const numeros = modulos.map(m => m.numeroModulo).filter(n => !isNaN(n));
        return numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
    }, [modulos]);

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Módulos por Especialidad">
            <style>{`
                .gme-container { display: flex; flex-direction: column; gap: 20px; }
                .gme-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .gme-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .gme-intro { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }

                .gme-filtros { display: grid; grid-template-columns: 2fr 1fr auto; gap: 14px; align-items: end; }
                .gme-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gme-field input, .gme-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .gme-field input:focus, .gme-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                .gme-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                    white-space: nowrap;
                }
                .gme-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gme-btn-primary { background: #1e3a5f; color: #fff; }
                .gme-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gme-btn-info { background: #3b82f6; color: #fff; }
                .gme-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gme-btn-danger { background: #dc2626; color: #fff; }
                .gme-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gme-btn-secondary { background: #e5e7eb; color: #334155; }
                .gme-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gme-btn-sm { padding: 5px 12px; font-size: 12px; }

                .gme-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
                .gme-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .gme-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gme-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gme-stat-especialidad { background: #eff6ff; color: #1e40af; }
                .gme-stat-grado { background: #dbeafe; color: #1d4ed8; }
                .gme-stat-total { background: #dcfce7; color: #15803d; }

                .gme-table { width: 100%; border-collapse: collapse; }
                .gme-table thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 12px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .gme-table thead th:first-child { border-top-left-radius: 8px; }
                .gme-table thead th:last-child { border-top-right-radius: 8px; }
                .gme-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .gme-table tbody tr:hover { background: #f8fafc; }
                .gme-table tbody tr:nth-child(even) { background: #fafbfc; }
                .gme-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .gme-table td { padding: 10px; font-size: 13px; color: #334155; vertical-align: middle; }

                .gme-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }
                .gme-badge-codigo { background: #dbeafe; color: #1d4ed8; border: 1px solid #3b82f6; }

                .gme-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; display: flex; justify-content: space-between; align-items: center; }
                .gme-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gme-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }
                .gme-aviso.warning { background: #fef3c7; color: #b45309; border-left: 4px solid #e67e22; }
                .gme-aviso button { background: none; border: none; font-size: 18px; cursor: pointer; color: inherit; opacity: .7; }
                .gme-aviso button:hover { opacity: 1; }

                .gme-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                .gme-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .gme-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 500px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .gme-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gme-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gme-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gme-modal-close:hover { color: #dc2626; }
                .gme-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gme-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }
                .gme-preview { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; margin-top: 12px; }
                .gme-preview-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: .5px; }
                .gme-preview-codigo { font-size: 18px; font-weight: bold; color: #1e3a5f; margin-top: 4px; font-family: monospace; }

                .gme-acciones { display: flex; gap: 6px; }

                @media (max-width: 900px) {
                    .gme-filtros { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .gme-filtros { grid-template-columns: 1fr; }
                    .gme-table { font-size: 12px; }
                    .gme-table thead th, .gme-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gme-container">
                {message.text && (
                    <div className={`gme-aviso ${message.type}`}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage({ type: '', text: '' })}>X</button>
                    </div>
                )}

                {/* INTRO */}
                <div className="gme-intro">
                    Defina los módulos (código <strong>Módulo Año.Número</strong>) que corresponden a cada especialidad y año del bachillerato.
                    Ejemplo: <strong>Módulo 1.1</strong>, <strong>Módulo 1.2</strong>, <strong>Módulo 2.1</strong>, etc.
                </div>

                {/* FILTROS */}
                <div className="gme-card">
                    <h3>Seleccionar Especialidad y Año</h3>
                    <div className="gme-filtros">
                        <div className="gme-field">
                            <label>Especialidad</label>
                            <select value={especialidadSel} onChange={e => setEspecialidadSel(e.target.value)}>
                                <option value="">-- Seleccione una especialidad --</option>
                                {especialidades
                                    .filter(e => e.estado !== false && e.idEspecialidad !== 0)
                                    .map(e => (
                                        <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                            {e.nombreEspecialidad}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="gme-field">
                            <label>Año</label>
                            <select value={gradoSel} onChange={e => setGradoSel(e.target.value)}>
                                <option value="">-- Seleccione --</option>
                                {GRADOS_OPCIONES.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="gme-btn gme-btn-primary"
                            disabled={!especialidadSel || !gradoSel}
                            onClick={() => abrirModal()}
                        >
                            + Nuevo Módulo
                        </button>
                    </div>
                </div>

                {/* CONTENIDO */}
                {especialidadSel && gradoSel && (
                    <>
                        {/* ESTADÍSTICAS */}
                        <div className="gme-stats">
                            <div className="gme-stat gme-stat-especialidad">
                                <span className="num" style={{ fontSize: '14px' }}>
                                    {getEspecialidadNombre(especialidadSel)}
                                </span>
                                <span className="lbl">Especialidad</span>
                            </div>
                            <div className="gme-stat gme-stat-grado">
                                <span className="num" style={{ fontSize: '18px' }}>{getGradoLabel(gradoSel)}</span>
                                <span className="lbl">Año</span>
                            </div>
                            <div className="gme-stat gme-stat-total">
                                <span className="num">{modulos.length}</span>
                                <span className="lbl">Módulos Registrados</span>
                            </div>
                        </div>

                        {/* TABLA */}
                        <div className="gme-card">
                            <h3>Módulos del {getGradoLabel(gradoSel)}</h3>

                            {loading ? (
                                <p className="gme-empty">Cargando módulos...</p>
                            ) : modulos.length === 0 ? (
                                <p className="gme-empty">
                                    No hay módulos definidos para esta especialidad y año.<br />
                                    Haz clic en "Nuevo Módulo" para agregar el primero.
                                </p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="gme-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '140px' }}>Código</th>
                                                <th>Nombre del Módulo</th>
                                                <th style={{ width: '180px', textAlign: 'center' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modulos
                                                .slice()
                                                .sort((a, b) => a.numeroModulo - b.numeroModulo)
                                                .map(m => (
                                                    <tr key={m.idModulo}>
                                                        <td>
                                                            <span className="gme-badge gme-badge-codigo">
                                                                {m.codigo}
                                                            </span>
                                                        </td>
                                                        <td><strong>{m.nombreModulo}</strong></td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <div className="gme-acciones">
                                                                <button
                                                                    className="gme-btn gme-btn-info gme-btn-sm"
                                                                    onClick={() => abrirModal(m)}
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    className="gme-btn gme-btn-danger gme-btn-sm"
                                                                    onClick={() => eliminarModulo(m)}
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {!especialidadSel || !gradoSel ? (
                    <div className="gme-card">
                        <p className="gme-empty">
                            Seleccione una especialidad y un año para ver y administrar sus módulos.
                        </p>
                    </div>
                ) : null}
            </div>

            {/* MODAL */}
            {modal.mostrar && (
                <div className="gme-modal-overlay" onClick={() => !saving && cerrarModal()}>
                    <div className="gme-modal" onClick={e => e.stopPropagation()}>
                        <div className="gme-modal-header">
                            <h3>{modal.edicion ? 'Editar Módulo' : 'Nuevo Módulo'}</h3>
                            <button className="gme-modal-close" onClick={cerrarModal} disabled={saving}>X</button>
                        </div>

                        <div className="gme-info-box">
                            <strong>Especialidad:</strong> {getEspecialidadNombre(especialidadSel)}<br />
                            <strong>Año:</strong> {getGradoLabel(gradoSel)}
                        </div>

                        <div className="gme-field" style={{ marginBottom: '14px' }}>
                            <label>Número de módulo *</label>
                            <input
                                type="number"
                                min="1"
                                value={form.numeroModulo}
                                onChange={e => setForm({ ...form, numeroModulo: e.target.value })}
                                placeholder={`Ej: ${proximoNumero}`}
                                autoFocus
                            />
                            {!modal.edicion && proximoNumero > 1 && (
                                <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    Sugerido: {proximoNumero}
                                </small>
                            )}
                        </div>

                        <div className="gme-field" style={{ marginBottom: '14px' }}>
                            <label>Nombre del módulo *</label>
                            <input
                                type="text"
                                value={form.nombreModulo}
                                onChange={e => setForm({ ...form, nombreModulo: e.target.value })}
                                placeholder="Ej: Programación Orientada a Objetos"
                            />
                        </div>

                        {especialidadSel && gradoSel && (
                            <div className="gme-preview">
                                <div className="gme-preview-label">Vista previa del código</div>
                                <div className="gme-preview-codigo">
                                    Módulo {gradoSel}.{form.numeroModulo || '?'}
                                </div>
                            </div>
                        )}

                        <div className="gme-modal-actions">
                            <button
                                className="gme-btn gme-btn-secondary"
                                onClick={cerrarModal}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                className="gme-btn gme-btn-primary"
                                onClick={guardarModulo}
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : (modal.edicion ? 'Actualizar' : 'Crear Módulo')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionModulosEspecialidad;