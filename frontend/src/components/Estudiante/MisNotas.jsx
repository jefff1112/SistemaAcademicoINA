// MisNotas (Estudiante): cuadro resumen de sus propias notas por materia.
// Muestra el mismo formato que Dirección/Registro pero solo con las notas del estudiante logueado.
// - Filtro por Tipo (Materias Básicas / Módulos)
// - Filtro por Período
// - Coloreado amarillo para recuperación
// - Exportación a Excel
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const MisNotas = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [resumenPorMateria, setResumenPorMateria] = useState(null);
    const [estudianteInfo, setEstudianteInfo] = useState(null);
    const [claseInfo, setClaseInfo] = useState(null);
    const [periodos, setPeriodos] = useState([]);
    const [exportando, setExportando] = useState(false);

    const [filtros, setFiltros] = useState({
        tipo: 'materia', // 'materia' | 'modulo'
        idPeriodo: ''
    });

    // ============ CARGA INICIAL ============
    useEffect(() => {
        cargarInfoEstudiante();
    }, []);

    const cargarInfoEstudiante = async () => {
        try {
            setLoading(true);

            // 1. Obtener el estudiante logueado por su código
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudiante = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (!estudiante) {
                mostrarMensaje('error', 'No se encontró el perfil del estudiante');
                return;
            }
            setEstudianteInfo(estudiante);

            // 2. Obtener info de la clase
            const clasesRes = await API.get('/clases');
            const clase = clasesRes.data?.find(c => c.idClase === estudiante.idClase);
            if (clase) {
                setClaseInfo(clase);
            }

            // 3. Obtener períodos académicos
            try {
                const periodosRes = await API.get('/periodosacademicos');
                const periodosData = periodosRes.data || [];
                setPeriodos(periodosData);

                // Auto-seleccionar el período activo
                const periodoActivo = periodosData.find(p => p.estado === 'Activo');
                if (periodoActivo) {
                    setFiltros(f => ({ ...f, idPeriodo: String(periodoActivo.idPeriodo) }));
                } else if (periodosData.length > 0) {
                    setFiltros(f => ({ ...f, idPeriodo: String(periodosData[0].idPeriodo) }));
                }
            } catch (e) {
                console.warn('No se pudieron cargar períodos', e);
                // Fallback: usar períodos de la clase actual
                setPeriodos([
                    { idPeriodo: 1, nombre: 'I Periodo' },
                    { idPeriodo: 2, nombre: 'II Periodo' },
                    { idPeriodo: 3, nombre: 'III Periodo' },
                    { idPeriodo: 4, nombre: 'IV Periodo' }
                ]);
                setFiltros(f => ({ ...f, idPeriodo: '1' }));
            }

        } catch (error) {
            console.error('Error cargando estudiante:', error);
            mostrarMensaje('error', 'Error al cargar tu perfil: ' + (error.response?.data?.mensaje || error.message));
        } finally {
            setLoading(false);
        }
    };

    // ============ CARGAR NOTAS CUANDO CAMBIAN FILTROS ============
    useEffect(() => {
        if (!estudianteInfo || !claseInfo || !filtros.idPeriodo) {
            setResumenPorMateria(null);
            return;
        }
        cargarResumen();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros, estudianteInfo, claseInfo]);

    const cargarResumen = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append('idClase', claseInfo.idClase);
            params.append('idPeriodo', filtros.idPeriodo);

            if (filtros.tipo === 'modulo' && claseInfo.idEspecialidad) {
                params.append('idEspecialidad', claseInfo.idEspecialidad);
            }
            // Si es materia, no se pasa idMateria → el endpoint devuelve todas las materias básicas

            const resp = await API.get(
                `/CuadroAuxiliar/resumen-por-materia?${params.toString()}`
            );

            const data = resp.data;

            // Filtrar SOLO el estudiante logueado
            const estudianteRow = (data.estudiantes || []).find(
                e => Number(e.idEstudiante) === Number(estudianteInfo.idEstudiante)
            );

            if (!estudianteRow) {
                setResumenPorMateria({
                    materias: data.materias || [],
                    fila: null,
                    modoModulos: data.modoModulos === true
                });
                return;
            }

            setResumenPorMateria({
                materias: data.materias || [],
                fila: {
                    idEstudiante: estudianteRow.idEstudiante,
                    codigo: estudianteRow.codigo,
                    nombres: `${estudianteRow.apellidos || ''}, ${estudianteRow.nombres || ''}`,
                    notas: estudianteRow.notas || {},
                    promedioGeneral: estudianteRow.promedioGeneral,
                    tieneRecuperaciones: estudianteRow.tieneRecuperaciones,
                    materiasEnRecuperacion: estudianteRow.materiasEnRecuperacion || estudianteRow.modulosEnRecuperacion || 0
                },
                modoModulos: data.modoModulos === true
            });

        } catch (error) {
            console.error('Error cargando notas:', error);
            setResumenPorMateria(null);
            mostrarMensaje('error', 'Error al cargar tus notas: ' + (error.response?.data?.mensaje || error.message));
        } finally {
            setLoading(false);
        }
    };

    // ============ EXPORTAR EXCEL ============
    const exportarExcel = async () => {
        if (!resumenPorMateria?.fila || !resumenPorMateria?.materias?.length) {
            mostrarMensaje('warning', 'No hay datos para exportar');
            return;
        }

        setExportando(true);
        try {
            const { fila, materias, modoModulos } = resumenPorMateria;
            const periodoActual = periodos.find(p => String(p.idPeriodo) === String(filtros.idPeriodo));

            // Construir filas del Excel
            const filas = [];

            // Encabezado institucional
            filas.push(['INSTITUTO NACIONAL DE APOPA']);
            filas.push([modoModulos ? 'CUADRO RESUMEN DE MÓDULOS' : 'CUADRO RESUMEN DE MATERIAS']);
            filas.push([`AÑO LECTIVO: ${new Date().getFullYear()}`]);
            filas.push([`ESTUDIANTE: ${fila.nombres}`]);
            filas.push([`CÓDIGO: ${fila.codigo}`]);
            filas.push([`CLASE: ${claseInfo?.nombreClase || ''} ${claseInfo?.seccion || ''}`]);
            filas.push([`PERIODO: ${periodoActual?.nombre || filtros.idPeriodo}`]);
            filas.push([]);

            // Encabezados de la tabla
            const headers = ['CÓDIGO', 'ESTUDIANTE', ...materias.map(m => m.nombreMateria), 'PROMEDIO'];
            filas.push(headers);

            // Fila del estudiante
            const filaDatos = [fila.codigo, fila.nombres];
            materias.forEach(m => {
                const notaObj = (fila.notas || {})[m.idMateria] || {};
                const prom = notaObj.promedio ?? notaObj.nota;
                filaDatos.push(prom !== null && prom !== undefined ? Number(prom).toFixed(2) : '—');
            });
            filaDatos.push(fila.promedioGeneral !== null && fila.promedioGeneral !== undefined
                ? Number(fila.promedioGeneral).toFixed(2)
                : '—');
            filas.push(filaDatos);

            filas.push([]);
            filas.push([modoModulos
                ? 'Escala: 5 = Excelente | 4 = Muy bueno | 3 o menos = Recuperación'
                : 'Escala: Mínimo aprobatorio 6.00']);

            // Crear workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(filas);

            // Ancho de columnas
            ws['!cols'] = [
                { wch: 14 }, // Código
                { wch: 40 }, // Estudiante
                ...materias.map(() => ({ wch: 18 })),
                { wch: 12 } // Promedio
            ];

            XLSX.utils.book_append_sheet(wb, ws, 'Mis Notas');

            const anio = new Date().getFullYear();
            const sufijo = modoModulos ? 'Modulos' : 'Materias';
            XLSX.writeFile(wb, `MisNotas_${sufijo}_${anio}.xlsx`);

            mostrarMensaje('success', 'Excel exportado correctamente');
        } catch (error) {
            console.error('Error exportando:', error);
            mostrarMensaje('error', 'Error al exportar: ' + error.message);
        } finally {
            setExportando(false);
        }
    };

    // ============ UTILIDADES ============
    const mostrarMensaje = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const equivalenteCualitativoModulo = (nota) => {
        if (nota === null || nota === undefined) return '';
        const n = parseFloat(nota);
        if (n >= 5.00) return 'Excelente';
        if (n >= 4.00) return 'Muy bueno';
        if (n >= 3.00) return 'Regular';
        if (n >= 2.00) return 'Deficiente';
        return 'Muy deficiente';
    };

    // ============ RENDER ============
    if (loading && !resumenPorMateria) {
        return (
            <DashboardLayout title="Mis Notas">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mis Notas">
            <div className="cuadro-auxiliar-container">
                <div className="cuadro-header">
                    <h1>Mis Notas</h1>
                    <p>Resumen de tus promedios finales por {filtros.tipo === 'modulo' ? 'módulo' : 'materia'}.</p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })} className="btn-close-alert">×</button>
                    </div>
                )}

                {/* Info del estudiante */}
                {estudianteInfo && (
                    <div className="card" style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <div><strong>Código:</strong> {estudianteInfo.codigoEstudiante}</div>
                            <div><strong>Estudiante:</strong> {estudianteInfo.apellidos}, {estudianteInfo.nombres}</div>
                            {claseInfo && (
                                <div><strong>Clase:</strong> {claseInfo.nombreClase} - Sección {claseInfo.seccion}</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="filtros-container">
                    <div className="filtro-grupo">
                        <label>Tipo:</label>
                        <select
                            value={filtros.tipo}
                            onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
                        >
                            <option value="materia">Materias Básicas</option>
                            <option value="modulo">Módulos Técnicos</option>
                        </select>
                    </div>

                    <div className="filtro-grupo">
                        <label>Período:</label>
                        <select
                            value={filtros.idPeriodo}
                            onChange={e => setFiltros({ ...filtros, idPeriodo: e.target.value })}
                        >
                            <option value="">-- Seleccione --</option>
                            {periodos.map(p => (
                                <option key={p.idPeriodo} value={p.idPeriodo}>
                                    {p.nombre || p.nombrePeriodo} ({p.anioLectivo || ''})
                                    {p.estado === 'Activo' ? ' ✓' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-grupo" style={{ alignSelf: 'flex-end' }}>
                        <button
                            className="btn btn-success"
                            onClick={exportarExcel}
                            disabled={exportando || !resumenPorMateria?.fila}
                        >
                            {exportando ? 'Generando...' : 'Exportar Excel'}
                        </button>
                    </div>
                </div>

                {/* Cuadro de notas */}
                <div className="cuadro-wrapper">
                    {loading && <div className="loading-overlay">Cargando...</div>}

                    {resumenPorMateria && resumenPorMateria.materias?.length > 0 && resumenPorMateria.fila && (
                        <div className="cuadro-ina">
                            <div className="header-ina">
                                <div className="titulo-instituto">INSTITUTO NACIONAL DE APOPA</div>
                                <div className="subtitulo">
                                    <span>CUADRO RESUMEN POR {filtros.tipo === 'modulo' ? 'MÓDULO' : 'MATERIA'}</span>
                                    <span className="anio-lectivo">AÑO LECTIVO: {new Date().getFullYear()}__</span>
                                </div>
                                <div className="datos-generales">
                                    <div className="dato">
                                        <strong>ESTUDIANTE:</strong> {resumenPorMateria.fila.nombres}
                                    </div>
                                    <div className="dato">
                                        <strong>CÓDIGO:</strong> {resumenPorMateria.fila.codigo}
                                    </div>
                                    {claseInfo && (
                                        <div className="dato">
                                            <strong>CLASE:</strong> {claseInfo.nombreClase} {claseInfo.seccion}
                                        </div>
                                    )}
                                    <div className="dato">
                                        <strong>PERIODO:</strong>{' '}
                                        {periodos.find(p => String(p.idPeriodo) === String(filtros.idPeriodo))?.nombre
                                            || periodos.find(p => String(p.idPeriodo) === String(filtros.idPeriodo))?.nombrePeriodo
                                            || filtros.idPeriodo}
                                    </div>
                                </div>
                            </div>

                            <div className="tabla-scroll">
                                <table className="tabla-cuadro resumen-materias">
                                    <thead>
                                        <tr>
                                            <th className="col-codigo">CÓDIGO</th>
                                            <th className="col-nombres">NOMBRES</th>
                                            {resumenPorMateria.materias.map(m => {
                                                const displayName = (m.nombreMateria || '').trim() === 'Ciencias'
                                                    ? 'Ciencias Naturales'
                                                    : (m.nombreMateria || 'Sin materia');
                                                return (
                                                    <th key={m.idMateria} className="col-materia">{displayName}</th>
                                                );
                                            })}
                                            <th className="col-promedio-general">PROMEDIO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="col-codigo">{resumenPorMateria.fila.codigo}</td>
                                            <td className="col-nombres">{resumenPorMateria.fila.nombres}</td>
                                            {resumenPorMateria.materias.map(m => {
                                                const notaObj = (resumenPorMateria.fila.notas || {})[m.idMateria] || {};
                                                const prom = notaObj.promedio ?? notaObj.nota;
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
                                                        key={`${resumenPorMateria.fila.idEstudiante}_${m.idMateria}`}
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
                                                {resumenPorMateria.fila.promedioGeneral !== null && resumenPorMateria.fila.promedioGeneral !== undefined
                                                    ? Number(resumenPorMateria.fila.promedioGeneral).toFixed(2)
                                                    : '—'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {resumenPorMateria.modoModulos && (
                                <div className="leyenda-modulos">
                                    <strong>Escala de módulos:</strong> 5 = Excelente | 4 = Muy bueno | 3 o menos = Recuperación
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && resumenPorMateria && !resumenPorMateria.fila && (
                        <div className="empty-state">
                            <h3>Sin notas registradas</h3>
                            <p>No tienes notas registradas para el período seleccionado.</p>
                        </div>
                    )}

                    {!loading && !resumenPorMateria && !filtros.idPeriodo && (
                        <div className="empty-state">
                            <h3>Seleccione un período</h3>
                            <p>Elige el período para ver tus notas.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MisNotas;