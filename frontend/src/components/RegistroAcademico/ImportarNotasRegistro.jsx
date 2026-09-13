// Componente Importar Notas (Registro Académico): carga notas en bloque desde Excel.
// La plantilla se genera con los estudiantes y materias REALES de la clase elegida;
// el servidor inserta o actualiza en una transacción y devuelve un reporte por fila.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import { notificarNotasActualizadas } from '../../services/notasSync';
import * as XLSX from 'xlsx';

const ImportarNotasRegistro = () => {
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [filtros, setFiltros] = useState({ idClase: '', idPeriodo: '' });
    const [estudiantesClase, setEstudiantesClase] = useState([]);
    const [materiasClase, setMateriasClase] = useState([]);
    const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filas, setFilas] = useState([]);
    const [erroresValidacion, setErroresValidacion] = useState([]);
    const [resultados, setResultados] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Carga las clases y periodos académicos al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene clases y periodos en paralelo desde la API.
    const cargarDatos = async () => {
        try {
            const [clasesRes, periodosRes] = await Promise.all([
                API.get('/clases'),
                API.get('/periodosacademicos')
            ]);
            setClases(clasesRes.data || []);
            setPeriodos(periodosRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        }
    };

    // Al elegir clase, precarga los estudiantes y materias reales de esa clase.
    const cargarCatalogoClase = async (idClase) => {
        setFilas([]);
        setErroresValidacion([]);
        setResultados(null);
        setFile(null);
        if (!idClase) {
            setEstudiantesClase([]);
            setMateriasClase([]);
            return;
        }
        setCargandoCatalogo(true);
        try {
            const [estudiantesRes, materiasRes] = await Promise.all([
                API.get(`/estudiantes/clase/${idClase}`),
                API.get(`/materias/clase/${idClase}`)
            ]);
            setEstudiantesClase(estudiantesRes.data || []);
            setMateriasClase(materiasRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar la clase', 'error');
            setEstudiantesClase([]);
            setMateriasClase([]);
        } finally {
            setCargandoCatalogo(false);
        }
    };

    // Muestra un mensaje temporal de éxito o error.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 5000);
    };

    // Devuelve el nombre de la clase tolerando distintos nombres de campo.
    const getNombreClase = (id) => {
        const c = clases.find(c => Number(c.idClase ?? c.IdClase ?? c.id) === Number(id));
        return c ? (c.nombreClase || c.NombreClase || `Clase ${id}`) : 'Clase';
    };

    // Devuelve el número del periodo seleccionado.
    const getNumeroPeriodo = (id) => {
        const p = periodos.find(p => Number(p.idPeriodo) === Number(id));
        return p ? p.numeroPeriodo : (id || '');
    };

    // Genera la plantilla con los estudiantes y materias reales de la clase
    // (matriz: una fila por estudiante y una columna por materia).
    const descargarPlantilla = () => {
        if (!filtros.idClase) {
            mostrarMensaje('Seleccione una clase primero', 'error');
            return;
        }
        if (estudiantesClase.length === 0 || materiasClase.length === 0) {
            mostrarMensaje('La clase seleccionada no tiene estudiantes o materias', 'error');
            return;
        }
        const filas = estudiantesClase.map(est => {
            const fila = {
                CodigoEstudiante: est.codigoEstudiante,
                NombreEstudiante: `${est.apellidos}, ${est.nombres}`
            };
            materiasClase.forEach(m => { fila[m.nombreMateria] = ''; });
            return fila;
        });
        const ws = XLSX.utils.json_to_sheet(filas);
        ws['!cols'] = [{ wch: 18 }, { wch: 32 }, ...materiasClase.map(() => ({ wch: 16 }))];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Notas');
        const nombreArchivo = `plantilla_notas_${getNombreClase(filtros.idClase).replace(/\s+/g, '_')}_P${getNumeroPeriodo(filtros.idPeriodo)}.xlsx`;
        XLSX.writeFile(wb, nombreArchivo);
        mostrarMensaje('Plantilla descargada con los estudiantes y materias de la clase', 'success');
    };

    // Al elegir un archivo, lo lee y valida contra el catálogo real de la clase.
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        if (!filtros.idClase) {
            mostrarMensaje('Seleccione la clase antes de cargar el archivo', 'error');
            e.target.value = '';
            return;
        }
        setFile(selectedFile);
        setResultados(null);
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = new Uint8Array(ev.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
                parsearYValidar(json);
            } catch (err) {
                mostrarMensaje('No se pudo leer el archivo Excel', 'error');
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    // Convierte cada fila del Excel en notas con validación previa
    // (estudiante existe en la clase, materia del catálogo y nota 0-10).
    const parsearYValidar = (json) => {
        const estByCodigo = new Map(estudiantesClase.map(e => [String(e.codigoEstudiante).trim(), e]));
        const errores = [];
        const filas = json.map((row, idx) => {
            const codigo = String(row.CodigoEstudiante || row.codigoEstudiante || '').trim();
            const nombre = row.NombreEstudiante || row.nombreEstudiante || '';
            const est = estByCodigo.get(codigo) || null;
            if (!est) {
                errores.push(`Fila ${idx + 2}: el código "${codigo}" no corresponde a un estudiante de la clase`);
            }
            const notas = {};
            let conNota = 0;
            materiasClase.forEach(m => {
                const cell = row[m.nombreMateria];
                if (cell === null || cell === undefined || cell === '') {
                    notas[m.idMateria] = null;
                    return;
                }
                const valor = parseFloat(String(cell).replace(',', '.'));
                if (isNaN(valor) || valor < 0 || valor > 10) {
                    notas[m.idMateria] = null;
                    errores.push(`Fila ${idx + 2} (${codigo || nombre}): nota inválida en "${m.nombreMateria}" (${cell})`);
                    return;
                }
                notas[m.idMateria] = valor;
                conNota++;
            });
            return { codigo, nombre, est, notas, conNota };
        });
        setFilas(filas);
        setErroresValidacion(errores);
        if (errores.length > 0) {
            mostrarMensaje(`El archivo tiene ${errores.length} problema(s) de validación`, 'error');
        } else {
            mostrarMensaje('Archivo válido, listo para importar', 'success');
        }
    };

    // Envía las notas válidas al endpoint de importación en lote del servidor.
    const handleImportar = async () => {
        if (!filtros.idClase || !filtros.idPeriodo) {
            mostrarMensaje('Seleccione la clase y el periodo', 'error');
            return;
        }
        if (!file) {
            mostrarMensaje('Seleccione un archivo Excel primero', 'error');
            return;
        }
        const notas = [];
        filas.forEach(f => {
            if (!f.est) return;
            materiasClase.forEach(m => {
                if (f.notas[m.idMateria] !== null && f.notas[m.idMateria] !== undefined) {
                    notas.push({ idEstudiante: f.est.idEstudiante, idMateria: m.idMateria, nota: f.notas[m.idMateria] });
                }
            });
        });
        if (notas.length === 0) {
            mostrarMensaje('No hay notas válidas para importar', 'error');
            return;
        }
        setLoading(true);
        try {
            const response = await API.post('/resultados-periodos/importar', {
                idClase: parseInt(filtros.idClase),
                idPeriodo: parseInt(filtros.idPeriodo),
                notas
            });
            setResultados(response.data);
            const totalOk = (response.data.insertados || 0) + (response.data.actualizados || 0);
            if (totalOk > 0) {
                notificarNotasActualizadas();
            }
            mostrarMensaje(response.data.mensaje, (response.data.fallidos || 0) > 0 ? 'error' : 'success');
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al importar las notas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalNotasEnArchivo = filas.reduce((s, f) => s + (f.est ? f.conNota : 0), 0);

    return (
        <DashboardLayout title="Importacion de Notas">
            {message && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
                    color: messageType === 'success' ? '#15803d' : '#b91c1c'
                }}>
                    {message}
                </div>
            )}

            <div className="card">
                <h3>Importar Notas desde Excel</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                    1. Seleccione la clase y el periodo. 2. Descargue la plantilla (viene con los estudiantes y materias reales).
                    3. Llene las notas (0-10) y cargue el archivo. 4. Importe y revise el reporte.
                </p>

                <div className="filters-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Clase *</label>
                        <select
                            value={filtros.idClase}
                            onChange={(e) => {
                                const id = e.target.value;
                                setFiltros(prev => ({ ...prev, idClase: id }));
                                cargarCatalogoClase(id);
                            }}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            <option value="">Seleccionar Clase</option>
                            {clases.map(c => (
                                <option key={c.idClase} value={c.idClase}>
                                    {c.nombreClase || c.NombreClase || `Clase ${c.idClase}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Periodo *</label>
                        <select
                            value={filtros.idPeriodo}
                            onChange={(e) => setFiltros(prev => ({ ...prev, idPeriodo: e.target.value }))}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            <option value="">Seleccionar Periodo</option>
                            {periodos.map(p => (
                                <option key={p.idPeriodo} value={p.idPeriodo}>
                                    Periodo {p.numeroPeriodo} ({p.anioLectivo})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {filtros.idClase && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '14px' }}>
                        {cargandoCatalogo ? (
                            <span style={{ color: '#64748b' }}>Cargando estudiantes y materias...</span>
                        ) : (
                            <span>
                                <strong>{getNombreClase(filtros.idClase)}:</strong>{' '}
                                {estudiantesClase.length} estudiantes, {materiasClase.length} materias
                            </span>
                        )}
                    </div>
                )}

                <div style={{ marginTop: '1rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={descargarPlantilla}
                        disabled={!filtros.idClase || cargandoCatalogo}
                        style={{
                            padding: '8px 16px',
                            background: !filtros.idClase || cargandoCatalogo ? '#e5e7eb' : '#e5e7eb',
                            color: '#1f2937',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: !filtros.idClase || cargandoCatalogo ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Descargar Plantilla (Clase + Periodo)
                    </button>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Seleccionar Archivo Excel</label>
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>

                {erroresValidacion.length > 0 && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                        <h4 style={{ margin: 0, color: '#b91c1c', fontSize: '14px' }}>Problemas de validación ({erroresValidacion.length})</h4>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '13px', color: '#b91c1c', maxHeight: '160px', overflowY: 'auto' }}>
                            {erroresValidacion.slice(0, 50).map((e, i) => <li key={i}>{e}</li>)}
                            {erroresValidacion.length > 50 && <li>...y {erroresValidacion.length - 50} más</li>}
                        </ul>
                    </div>
                )}

                {filas.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '14px' }}>
                            Vista Previa ({filas.length} estudiantes, {totalNotasEnArchivo} notas válidas)
                        </h4>
                        <div className="table-responsive" style={{ marginTop: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9' }}>
                                    <tr>
                                        <th style={{ padding: '8px', textAlign: 'left' }}>Codigo</th>
                                        <th style={{ padding: '8px', textAlign: 'left' }}>Nombre</th>
                                        {materiasClase.map(m => (
                                            <th key={m.idMateria} style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>{m.nombreMateria}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filas.map((f, i) => (
                                        <tr key={i} style={{
                                            borderBottom: '1px solid #e5e7eb',
                                            backgroundColor: f.est ? 'transparent' : '#fee2e2'
                                        }}>
                                            <td style={{ padding: '6px', fontSize: '13px' }}>{f.codigo || '-'}</td>
                                            <td style={{ padding: '6px', fontSize: '13px' }}>{f.nombre || '-'}</td>
                                            {materiasClase.map(m => (
                                                <td key={m.idMateria} style={{ padding: '6px', fontSize: '13px', textAlign: 'center' }}>
                                                    {f.notas[m.idMateria] !== null && f.notas[m.idMateria] !== undefined
                                                        ? f.notas[m.idMateria]
                                                        : <span style={{ color: '#cbd5e1' }}>—</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <button
                    className="btn-primary"
                    onClick={handleImportar}
                    disabled={loading || totalNotasEnArchivo === 0}
                    style={{
                        marginTop: '1rem',
                        padding: '8px 24px',
                        background: loading || totalNotasEnArchivo === 0 ? '#9ca3af' : '#1e3a5f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading || totalNotasEnArchivo === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Importando...' : `Importar ${totalNotasEnArchivo} Notas`}
                </button>

                {resultados && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: 0, fontSize: '14px' }}>Resultado de la Importacion</h4>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <p style={{ margin: 0, fontSize: '13px' }}>
                                <strong style={{ color: '#15803d' }}>Insertadas:</strong> {resultados.insertados || 0}
                            </p>
                            <p style={{ margin: 0, fontSize: '13px' }}>
                                <strong style={{ color: '#0369a1' }}>Actualizadas:</strong> {resultados.actualizados || 0}
                            </p>
                            <p style={{ margin: 0, fontSize: '13px' }}>
                                <strong style={{ color: '#b91c1c' }}>Fallidas:</strong> {resultados.fallidos || 0}
                            </p>
                        </div>
                        {resultados.errores && resultados.errores.length > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <strong style={{ fontSize: '13px' }}>Detalle de fallos:</strong>
                                <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '12px', maxHeight: '160px', overflowY: 'auto' }}>
                                    {resultados.errores.map((e, i) => (
                                        <li key={i}>{e.fila || e.motivo}: {e.motivo || ''}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ImportarNotasRegistro;
