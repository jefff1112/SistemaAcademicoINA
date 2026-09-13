// Componente Asignar Módulos a Docentes (Dirección / Registro).
// Selecciona una clase de especialidad, genera la estructura de módulos
// y asigna cada módulo a un docente.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import modulosService from '../../services/modulosService';
import { useAuth } from '../../contexts/AuthContext';

const AsignarModulosDocentes = () => {
    const { user } = useAuth();

    const [clases, setClases] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [grados, setGrados] = useState([]);
    const [claseSel, setClaseSel] = useState('');
    const [modulos, setModulos] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const mostrarMensaje = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

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

    const clasesEspecialidad = clases.filter(c => c.idEspecialidad);

    const cargarDatosClase = async (idClase) => {
        setLoading(true);
        try {
            const clase = clases.find(c => String(c.idClase) === String(idClase));
            if (!clase) { setModulos([]); setAsignaciones([]); return; }

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
        if (claseSel) cargarDatosClase(claseSel);
        else { setModulos([]); setAsignaciones([]); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claseSel]);

    const docenteAsignado = (idModulo) => {
        const asig = asignaciones.find(a => a.idModulo === idModulo);
        return asig ? asig.idDocente : '';
    };

    const asignarDocente = async (idModulo, idDocente) => {
        const previo = docenteAsignado(idModulo);
        try {
            if (!idDocente) {
                const asig = asignaciones.find(a => a.idModulo === idModulo);
                if (asig) await modulosService.desasignar(asig.idDocenteModulo);
            } else {
                await modulosService.asignar({
                    idDocente: parseInt(idDocente),
                    idModulo,
                    idClase: parseInt(claseSel),
                    anioLectivo: new Date().getFullYear()
                });
            }
            await cargarDatosClase(claseSel);
            mostrarMensaje('success', previo || idDocente ? 'Asignación actualizada' : 'Docente asignado');
        } catch (e) {
            mostrarMensaje('error', 'Error al asignar: ' + (e.response?.data?.mensaje || e.message));
        }
    };

    const generarEstructura = async () => {
        if (!window.confirm('¿Generar la estructura de módulos (actividades) para esta clase?')) return;
        try {
            const resp = await modulosService.generarEstructura(parseInt(claseSel));
            mostrarMensaje('success', resp.mensaje || 'Estructura generada');
        } catch (e) {
            mostrarMensaje('error', 'Error generando estructura: ' + (e.response?.data?.mensaje || e.message));
        }
    };

    return (
        <DashboardLayout title="Asignar Módulos a Docentes">
            <div style={{ padding: '20px' }}>
                <h2>Asignar Módulos a Docentes</h2>
                <p>Seleccione una clase de especialidad, genere la estructura y asigne cada módulo a un docente.</p>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })} className="btn-close-alert">×</button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '320px' }}>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Clase (especialidad)</label>
                        <select value={claseSel} onChange={e => setClaseSel(e.target.value)} style={{ width: '100%', padding: 8 }}>
                            <option value="">-- Seleccione --</option>
                            {clasesEspecialidad.map(c => (
                                <option key={c.idClase} value={c.idClase}>{c.nombreClase}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn btn-success" disabled={!claseSel} onClick={generarEstructura}>
                        Generar Estructura de Módulos
                    </button>
                </div>

                {loading && <p>Cargando módulos...</p>}

                {!loading && claseSel && modulos.length === 0 && (
                    <p style={{ color: '#6c757d' }}>No hay módulos definidos para esta especialidad/año. Defínalos en "Gestión de Módulos".</p>
                )}

                {modulos.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: 8, textAlign: 'left' }}>Código</th>
                                <th style={{ padding: 8, textAlign: 'left' }}>Módulo</th>
                                <th style={{ padding: 8, textAlign: 'left' }}>Docente asignado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modulos.map(m => (
                                <tr key={m.idModulo} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: 8 }}>{m.codigo}</td>
                                    <td style={{ padding: 8 }}>{m.nombreModulo}</td>
                                    <td style={{ padding: 8 }}>
                                        <select
                                            value={docenteAsignado(m.idModulo)}
                                            onChange={e => asignarDocente(m.idModulo, e.target.value)}
                                            style={{ width: '100%', padding: 6 }}
                                        >
                                            <option value="">-- Sin docente --</option>
                                            {docentes.filter(d => d.estado !== false).map(d => (
                                                <option key={d.idDocente} value={d.idDocente}>{d.apellidos}, {d.nombres}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AsignarModulosDocentes;