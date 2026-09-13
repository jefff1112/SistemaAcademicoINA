// Componente Gestión de Módulos por Especialidad (Dirección / Registro).
// Definir los módulos de cada especialidad+año (código "Módulo X.Y").
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import modulosService from '../../services/modulosService';
import { useAuth } from '../../contexts/AuthContext';

const GRADOS_OPCIONES = [
    { value: 1, label: 'Primer Año (1)' },
    { value: 2, label: 'Segundo Año (2)' },
    { value: 3, label: 'Tercer Año (3)' }
];

const GestionModulosEspecialidad = () => {
    const { user } = useAuth();

    const [especialidades, setEspecialidades] = useState([]);
    const [especialidadSel, setEspecialidadSel] = useState('');
    const [gradoSel, setGradoSel] = useState('');
    const [modulos, setModulos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [modal, setModal] = useState({ mostrar: false, edicion: null });
    const [form, setForm] = useState({ numeroModulo: '', nombreModulo: '' });

    const mostrarMensaje = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

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
        if (!especialidadSel || !gradoSel) { setModulos([]); return; }
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

    const abrirModal = (modulo = null) => {
        setModal({ mostrar: true, edicion: modulo });
        setForm({
            numeroModulo: modulo ? String(modulo.numeroModulo) : '',
            nombreModulo: modulo ? modulo.nombreModulo : ''
        });
    };

    const cerrarModal = () => setModal({ mostrar: false, edicion: null });

    const guardarModulo = async () => {
        if (!form.nombreModulo.trim()) { mostrarMensaje('warning', 'El nombre del módulo es requerido'); return; }
        if (!form.numeroModulo) { mostrarMensaje('warning', 'El número del módulo es requerido'); return; }

        const payload = {
            idEspecialidad: parseInt(especialidadSel),
            numeroGrado: parseInt(gradoSel),
            numeroModulo: parseInt(form.numeroModulo),
            nombreModulo: form.nombreModulo.trim(),
            orden: parseInt(form.numeroModulo)
        };

        try {
            if (modal.edicion) {
                await modulosService.editar(modal.edicion.idModulo, payload);
                mostrarMensaje('success', 'Módulo actualizado');
            } else {
                await modulosService.crear(payload);
                mostrarMensaje('success', 'Módulo creado');
            }
            cerrarModal();
            await listarModulos();
        } catch (e) {
            mostrarMensaje('error', 'Error guardando módulo: ' + (e.response?.data?.mensaje || e.message));
        }
    };

    const eliminarModulo = async (modulo) => {
        if (!window.confirm(`¿Eliminar el módulo ${modulo.codigo} - ${modulo.nombreModulo}?`)) return;
        try {
            await modulosService.eliminar(modulo.idModulo);
            mostrarMensaje('success', 'Módulo eliminado');
            await listarModulos();
        } catch (e) {
            mostrarMensaje('error', 'Error eliminando módulo: ' + (e.response?.data?.mensaje || e.message));
        }
    };

    return (
        <DashboardLayout title="Gestión de Módulos por Especialidad">
            <div style={{ padding: '20px' }}>
                <h2>Gestión de Módulos por Especialidad</h2>
                <p>Defina los módulos (código "Módulo Año.Número") que corresponden a cada especialidad y año del bachillerato.</p>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })} className="btn-close-alert">×</button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '220px' }}>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Especialidad</label>
                        <select value={especialidadSel} onChange={e => setEspecialidadSel(e.target.value)} style={{ width: '100%', padding: 8 }}>
                            <option value="">-- Seleccione --</option>
                            {especialidades.filter(e => e.estado !== false && e.idEspecialidad !== 0).map(e => (
                                <option key={e.idEspecialidad} value={e.idEspecialidad}>{e.nombreEspecialidad}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ minWidth: '180px' }}>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Año</label>
                        <select value={gradoSel} onChange={e => setGradoSel(e.target.value)} style={{ width: '100%', padding: 8 }}>
                            <option value="">-- Seleccione --</option>
                            {GRADOS_OPCIONES.map(g => (
                                <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn btn-primary" disabled={!especialidadSel || !gradoSel} onClick={() => abrirModal()}>
                        + Nuevo Módulo
                    </button>
                </div>

                {loading ? (
                    <p>Cargando módulos...</p>
                ) : (
                    <>
                        {especialidadSel && gradoSel && modulos.length === 0 && (
                            <p style={{ color: '#6c757d' }}>No hay módulos definidos. Agregue el primero.</p>
                        )}
                        {modulos.length > 0 && (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9' }}>
                                        <th style={{ padding: 8, textAlign: 'left' }}>Código</th>
                                        <th style={{ padding: 8, textAlign: 'left' }}>Nombre del módulo</th>
                                        <th style={{ padding: 8, textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modulos.map(m => (
                                        <tr key={m.idModulo} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: 8 }}>{m.codigo}</td>
                                            <td style={{ padding: 8 }}>{m.nombreModulo}</td>
                                            <td style={{ padding: 8, textAlign: 'center' }}>
                                                <button className="btn-sm btn-edit" onClick={() => abrirModal(m)} style={{ marginRight: 6 }}>Editar</button>
                                                <button className="btn-sm btn-del" onClick={() => eliminarModulo(m)}>Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {modal.mostrar && (
                    <div className="modal-overlay" onClick={cerrarModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                            <div className="modal-header">
                                <h3>{modal.edicion ? 'Editar Módulo' : 'Nuevo Módulo'}</h3>
                                <button onClick={cerrarModal} className="btn-close">×</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Número de módulo (ej: 8)</label>
                                    <input type="number" min="1" value={form.numeroModulo} onChange={e => setForm({ ...form, numeroModulo: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Nombre del módulo</label>
                                    <input type="text" value={form.nombreModulo} onChange={e => setForm({ ...form, nombreModulo: e.target.value })} placeholder="Ej: Programación Orientada a Objetos" />
                                </div>
                                {especialidadSel && gradoSel && (
                                    <p style={{ fontSize: '0.9em', color: '#6c757d' }}>
                                        Código: <strong>Módulo {gradoSel}.{form.numeroModulo || '?'}</strong>
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: 20 }}>
                                <button className="btn btn-secondary" onClick={cerrarModal}>Cancelar</button>
                                <button className="btn btn-primary" onClick={guardarModulo}>Guardar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default GestionModulosEspecialidad;