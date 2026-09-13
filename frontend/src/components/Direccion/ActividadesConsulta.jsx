import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import DashboardLayout from '../Layout/DashboardLayout';
import './ActividadesConsulta.css';

const ActividadesConsultaDireccion = () => {
    const { user } = useAuth();

    const [clases, setClases] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [periodos, setPeriodos] = useState([]);

    const [periodoSel, setPeriodoSel] = useState('');
    const [claseSel, setClaseSel] = useState('');
    const [tipoSel, setTipoSel] = useState('');
    const [materiaSel, setMateriaSel] = useState('');
    const [especialidadSel, setEspecialidadSel] = useState('');

    const [estructura, setEstructura] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarCatalogos();
    }, []);

    useEffect(() => {
        if (periodoSel && claseSel && (materiaSel || especialidadSel)) {
            cargarEstructura();
        } else {
            setEstructura(null);
        }
    }, [periodoSel, claseSel, materiaSel, especialidadSel]);

    const cargarCatalogos = async () => {
        try {
            const [c, m, e, p] = await Promise.all([
                API.get('/clases').then(r => r.data),
                API.get('/materias').then(r => r.data),
                API.get('/especialidades').then(r => r.data).catch(() => []),
                API.get('/periodos').then(r => r.data)
            ]);
            setClases(Array.isArray(c) ? c : []);
            setMaterias(Array.isArray(m) ? m : []);
            setEspecialidades(Array.isArray(e) ? e : []);
            setPeriodos(Array.isArray(p) ? p : []);
        } catch (err) {
            console.error('Error cargando catálogos:', err);
        }
    };

    const cargarEstructura = async () => {
        setCargando(true);
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('idClase', claseSel);
            params.append('idPeriodo', periodoSel);
            if (tipoSel === 'materia' && materiaSel) params.append('idMateria', materiaSel);
            if (tipoSel === 'modulo' && especialidadSel) params.append('idEspecialidad', especialidadSel);

            const response = await API.get(`/actividades/estructura-completa?${params.toString()}`);
            setEstructura(response.data);
        } catch (err) {
            console.error('Error cargando estructura:', err);
            setError('Error al cargar la estructura de actividades.');
            setEstructura(null);
        } finally {
            setCargando(false);
        }
    };

    const handleClaseChange = (valor) => {
        setClaseSel(valor);
        setTipoSel('');
        setMateriaSel('');
        setEspecialidadSel('');

        if (valor) {
            const clase = clases.find(c => c.idClase === parseInt(valor));
            if (clase?.idEspecialidad) {
                setTipoSel('modulo');
                setEspecialidadSel(clase.idEspecialidad.toString());
            } else {
                setTipoSel('materia');
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="actividades-consulta-container">
                <div className="consulta-header">
                    <h1>📚 Consulta de Actividades</h1>
                    <p className="subtitle">
                        Visualización de actividades y sub-actividades configuradas por los docentes (solo lectura) - Dirección
                    </p>
                </div>

                <div className="filtros-section">
                    <h2>🔍 Filtros</h2>
                    <div className="filtros-grid">
                        <div className="filtro-group">
                            <label>Período *</label>
                            <select value={periodoSel} onChange={e => setPeriodoSel(e.target.value)}>
                                <option value="">-- Seleccione --</option>
                                {periodos.map(p => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombre || `Período ${p.idPeriodo}`} - {new Date().getFullYear()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filtro-group">
                            <label>Clase *</label>
                            <select value={claseSel} onChange={e => handleClaseChange(e.target.value)}>
                                <option value="">-- Seleccione --</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} {c.idEspecialidad ? '(Especialidad)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {claseSel && tipoSel === 'materia' && (
                            <div className="filtro-group">
                                <label>Materia *</label>
                                <select value={materiaSel} onChange={e => setMateriaSel(e.target.value)}>
                                    <option value="">-- Seleccione --</option>
                                    {materias.map(m => (
                                        <option key={m.idMateria} value={m.idMateria}>
                                            {m.nombreMateria}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {claseSel && tipoSel === 'modulo' && (
                            <div className="filtro-group">
                                <label>Módulo/Especialidad</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={especialidades.find(e => e.idEspecialidad === parseInt(especialidadSel))?.nombreEspecialidad || ''}
                                    placeholder="Detectado automáticamente"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {error && <div className="error-banner">⚠️ {error}</div>}

                {cargando && <div className="loading">⏳ Cargando estructura...</div>}

                {!cargando && estructura && (
                    <div className="estructura-section">
                        <div className="estructura-header">
                            <h2>📋 Estructura de Actividades</h2>
                            <div className="estructura-info">
                                <span className="badge-info">
                                    {estructura.actividades?.length || 0} actividades
                                </span>
                                <span className="badge-info">
                                    Ponderación total: {estructura.actividades?.reduce((sum, a) => sum + (a.ponderacion || 0), 0) || 0}%
                                </span>
                            </div>
                        </div>

                        <div className="actividades-lista">
                            {estructura.actividades?.map(act => (
                                <div key={act.idActividad} className="actividad-card">
                                    <div className="actividad-header">
                                        <div className="actividad-titulo">
                                            <span className="actividad-numero">#{act.numeroOrden || act.idActividad}</span>
                                            <span className="actividad-nombre">{act.nombreActividad}</span>
                                            <span className="badge-tipo">
                                                {act.tipoActividad === 'Modulo' ? '📦 Módulo' : '📝 Actividad'}
                                            </span>
                                        </div>
                                        <div className="actividad-ponderacion">
                                            <span className="ponderacion-valor">{act.ponderacion}%</span>
                                        </div>
                                    </div>

                                    {act.descripcion && (
                                        <div className="actividad-descripcion">
                                            <strong>Descripción:</strong> {act.descripcion}
                                        </div>
                                    )}

                                    {act.subActividades && act.subActividades.length > 0 && (
                                        <div className="sub-actividades-container">
                                            <h4>Sub-actividades ({act.subActividades.length})</h4>
                                            <table className="sub-actividades-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Nombre</th>
                                                        <th>Tipo</th>
                                                        <th>Ponderación</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {act.subActividades.map((sub, idx) => (
                                                        <tr key={sub.idSubActividad}>
                                                            <td>{idx + 1}</td>
                                                            <td>{sub.nombreSubActividad}</td>
                                                            <td>
                                                                <span className="badge-sub-tipo">
                                                                    {sub.tipoSubActividad}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="ponderacion-sub">
                                                                    {sub.ponderacion}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colSpan="3"><strong>Total</strong></td>
                                                        <td>
                                                            <strong>
                                                                {act.subActividades.reduce((sum, s) => sum + (s.ponderacion || 0), 0)}%
                                                            </strong>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!cargando && !estructura && periodoSel && claseSel && (
                    <div className="empty-state">
                        <p>📭 No se ha configurado una estructura de actividades para los filtros seleccionados.</p>
                    </div>
                )}

                {!cargando && (!periodoSel || !claseSel) && (
                    <div className="empty-state">
                        <p>👆 Seleccione un período y una clase para ver la estructura de actividades.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ActividadesConsultaDireccion;
