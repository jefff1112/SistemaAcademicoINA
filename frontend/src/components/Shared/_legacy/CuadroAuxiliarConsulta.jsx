import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import DashboardLayout from '../Layout/DashboardLayout';
import './CuadroAuxiliarConsulta.css';

const CuadroAuxiliarConsulta = ({ titulo = 'Consulta de Cuadro de Notas' }) => {
    const { user } = useAuth();

    const [clases, setClases] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [periodos, setPeriodos] = useState([]);

    const [periodoSel, setPeriodoSel] = useState('');
    const [claseSel, setClaseSel] = useState('');
    const [materiaSel, setMateriaSel] = useState('');

    const [cuadroData, setCuadroData] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarCatalogos();
    }, []);

    useEffect(() => {
        if (periodoSel && claseSel && materiaSel) {
            cargarCuadro();
        } else {
            setCuadroData(null);
        }
    }, [periodoSel, claseSel, materiaSel]);

    const cargarCatalogos = async () => {
        try {
            const [c, m, p] = await Promise.all([
                API.get('/clases').then(r => r.data),
                API.get('/materias').then(r => r.data),
                API.get('/periodos').then(r => r.data)
            ]);
            setClases(Array.isArray(c) ? c : []);
            setMaterias(Array.isArray(m) ? m : []);
            setPeriodos(Array.isArray(p) ? p : []);
        } catch (err) {
            console.error('Error cargando catálogos:', err);
        }
    };

    const cargarCuadro = async () => {
        setCargando(true);
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('idClase', claseSel);
            params.append('idMateria', materiaSel);
            params.append('idPeriodo', periodoSel);

            const response = await API.get(`/CalificacionesSubActividades/cuadro-completo?${params.toString()}`);
            setCuadroData(response.data);
        } catch (err) {
            console.error('Error cargando cuadro:', err);
            setError('Error al cargar el cuadro de notas. Verifique que exista estructura de actividades.');
            setCuadroData(null);
        } finally {
            setCargando(false);
        }
    };

    const getIconoTipo = (tipo) => {
        switch (tipo?.toLowerCase()) {
            case 'autoevaluacion': return '🔄';
            case 'coevaluacion': return '🤝';
            case 'pruebaobjetiva': return '📝';
            case 'actividadmodulo': return '📦';
            case 'recuperacionmodulo': return '♻️';
            default: return '📋';
        }
    };

    return (
        <DashboardLayout>
            <div className="cuadro-consulta-container">
                <div className="consulta-header">
                    <h1>📊 {titulo}</h1>
                    <p className="subtitle">
                        Visualización del cuadro auxiliar de notas (solo lectura)
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
                            <select value={claseSel} onChange={e => setClaseSel(e.target.value)}>
                                <option value="">-- Seleccione --</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                    </div>
                </div>

                {error && <div className="error-banner">⚠️ {error}</div>}

                {cargando && <div className="loading">⏳ Cargando cuadro de notas...</div>}

                {!cargando && cuadroData && (
                    <div className="cuadro-section">
                        {/* ENCABEZADO INSTITUCIONAL */}
                        <div className="cuadro-header-ina">
                            <div className="header-line-1">INSTITUTO NACIONAL DE APOPA</div>
                            <div className="header-line-2">
                                <span>CUADRO AUXILIAR PARA EL REGISTRO DE EVALUACIONES POR ASIGNATURA Y PERIODO</span>
                                <span className="anio">AÑO LECTIVO: {cuadroData.header?.anioLectivo || new Date().getFullYear()}</span>
                            </div>
                            <div className="header-line-3">
                                <span><strong>ASIGNATURA:</strong> {cuadroData.header?.asignatura || ''}</span>
                                <span><strong>SECCIÓN:</strong> {cuadroData.header?.seccion || ''}</span>
                                <span><strong>PERIODO N°:</strong> {cuadroData.header?.periodoNumero || periodoSel}</span>
                                <span><strong>DOCENTE:</strong> {cuadroData.header?.docente || ''}</span>
                            </div>
                        </div>

                        {/* TABLA DEL CUADRO */}
                        <div className="cuadro-table-container">
                            <table className="cuadro-table">
                                <thead>
                                    <tr>
                                        <th rowSpan="2" className="col-codigo">CÓDIGO</th>
                                        <th rowSpan="2" className="col-nombres">NOMBRES</th>
                                        {cuadroData.header?.actividades?.map(act => (
                                            <th
                                                key={act.idActividad}
                                                colSpan={act.columnas?.length || 1}
                                                className="col-actividad"
                                            >
                                                {act.nombreActividad || `Actividad ${act.numeroOrden}`}
                                                <span className="act-ponderacion">({act.ponderacion}%)</span>
                                            </th>
                                        ))}
                                        <th rowSpan="2" className="col-promedio">PROMEDIO FINAL</th>
                                        <th rowSpan="2" className="col-recuperacion">RECUPERACIÓN</th>
                                        <th rowSpan="2" className="col-observaciones">OBSERVACIONES</th>
                                    </tr>
                                    <tr>
                                        {cuadroData.header?.actividades?.map(act =>
                                            act.columnas?.map(col => (
                                                <th
                                                    key={col.idSubActividad}
                                                    className={`col-sub ${col.esVertical ? 'vertical' : ''}`}
                                                >
                                                    {getIconoTipo(col.tipoSubActividad)} {col.nombre}
                                                    <div className="sub-ponderacion">{col.ponderacion}%</div>
                                                </th>
                                            ))
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {cuadroData.filas?.map(fila => (
                                        <tr key={fila.idEstudiante}>
                                            <td className="cell-codigo">{fila.codigo}</td>
                                            <td className="cell-nombre">{fila.apellidos} {fila.nombres}</td>
                                            {cuadroData.header?.actividades?.map(act =>
                                                act.columnas?.map(col => {
                                                    const nota = fila.notasSubActividades?.[col.idSubActividad];
                                                    const tieneNota = nota !== null && nota !== undefined;
                                                    return (
                                                        <td
                                                            key={col.idSubActividad}
                                                            className={`cell-nota ${tieneNota ? 'con-nota' : ''}`}
                                                        >
                                                            {tieneNota ? Number(nota).toFixed(2) : '—'}
                                                        </td>
                                                    );
                                                })
                                            )}
                                            <td className="cell-promedio">
                                                {fila.promedioFinal ? Number(fila.promedioFinal).toFixed(2) : '—'}
                                            </td>
                                            <td className="cell-recuperacion">
                                                {fila.recuperacion ? Number(fila.recuperacion).toFixed(2) : '—'}
                                            </td>
                                            <td className="cell-observaciones">
                                                {fila.observaciones || ''}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!cuadroData.filas || cuadroData.filas.length === 0) && (
                                        <tr>
                                            <td colSpan="100" className="empty-row">
                                                No hay estudiantes matriculados en esta clase.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="cuadro-footer">
                            <div className="footer-info">
                                <span>👥 Total estudiantes: <strong>{cuadroData.filas?.length || 0}</strong></span>
                                <span>📚 Total actividades: <strong>{cuadroData.header?.actividades?.length || 0}</strong></span>
                                <span>📊 Total sub-actividades: <strong>
                                    {cuadroData.header?.actividades?.reduce((sum, a) => sum + (a.columnas?.length || 0), 0) || 0}
                                </strong></span>
                            </div>
                        </div>
                    </div>
                )}

                {!cargando && !cuadroData && periodoSel && claseSel && materiaSel && (
                    <div className="empty-state">
                        <p>📭 No hay datos de cuadro de notas para los filtros seleccionados.</p>
                    </div>
                )}

                {!cargando && (!periodoSel || !claseSel || !materiaSel) && (
                    <div className="empty-state">
                        <p>👆 Seleccione período, clase y materia para ver el cuadro de notas.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CuadroAuxiliarConsulta;
