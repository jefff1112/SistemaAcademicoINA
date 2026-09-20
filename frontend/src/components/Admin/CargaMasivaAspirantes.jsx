// Componente Carga Masiva de Aspirantes (Admin): importa aspirantes desde un archivo Excel.
import React, { useState, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

// Componente principal: gestiona la carga de aspirantes por lote y muestra los resultados.
const CargaMasivaAspirantes = () => {
    // Estados: archivo seleccionado, indicador de carga, vista previa y resultados.
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState([]);
    const [resultados, setResultados] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [progreso, setProgreso] = useState({ actual: 0, total: 0 });

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    // ============================================================
    // MANEJO DEL ARCHIVO
    // ============================================================
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResultados(null);
            leerExcel(selectedFile);
        }
    };

    const leerExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                setPreview(jsonData.slice(0, 10));
                if (jsonData.length === 0) {
                    mostrarMensaje('El archivo está vacío', 'error');
                } else {
                    mostrarMensaje(`Archivo cargado: ${jsonData.length} registros detectados`, 'success');
                }
            } catch (error) {
                mostrarMensaje('Error al leer el archivo. Verifica el formato.', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const limpiarArchivo = () => {
        setFile(null);
        setPreview([]);
        setResultados(null);
        setProgreso({ actual: 0, total: 0 });
        const input = document.getElementById('file-input-aspirantes');
        if (input) input.value = '';
    };

    // ============================================================
    // CARGA MASIVA
    // ============================================================
    const handleUpload = async () => {
        if (!file) {
            mostrarMensaje('Seleccione un archivo primero', 'error');
            return;
        }

        setLoading(true);
        setResultados(null);
        setProgreso({ actual: 0, total: 0 });

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const aspirantes = XLSX.utils.sheet_to_json(sheet);

            let exitosos = 0;
            let fallidos = 0;
            const errores = [];
            const total = aspirantes.length;

            setProgreso({ actual: 0, total });

            for (let i = 0; i < aspirantes.length; i++) {
                const aspirante = aspirantes[i];
                try {
                    await API.post('/aspirantes', {
                        nombres: aspirante.Nombres || aspirante.nombres,
                        apellidos: aspirante.Apellidos || aspirante.apellidos,
                        dui: aspirante.DUI || aspirante.dui,
                        nie: aspirante.NIE || aspirante.nie,
                        correo: aspirante.Correo || aspirante.correo,
                        telefono: aspirante.Telefono || aspirante.telefono,
                        escuelaProcedencia: aspirante.Escuela || aspirante.escuela,
                        especialidadAspira: aspirante.EspecialidadId || aspirante.especialidadId,
                        nivelAspira: aspirante.Nivel || aspirante.nivel || 'Bachillerato Tecnico'
                    });
                    exitosos++;
                } catch (error) {
                    fallidos++;
                    const nombre = aspirante.Nombres || aspirante.nombres || `Fila ${i + 1}`;
                    const msg = error.response?.data?.mensaje || error.response?.data?.message || error.message;
                    errores.push({ fila: i + 1, nombre, mensaje: msg });
                }
                setProgreso({ actual: i + 1, total });
            }

            setResultados({ exitosos, fallidos, errores, total });
            setLoading(false);

            if (fallidos === 0) {
                mostrarMensaje(`Carga completada: ${exitosos} aspirantes registrados`, 'success');
            } else {
                mostrarMensaje(`Carga finalizada: ${exitosos} exitosos, ${fallidos} fallidos`, 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // ============================================================
    // PLANTILLA
    // ============================================================
    const descargarPlantilla = () => {
        const plantilla = [
            {
                Nombres: 'Juan Carlos',
                Apellidos: 'Pérez López',
                DUI: '12345678-9',
                NIE: '20240001',
                Correo: 'juan.perez@ejemplo.com',
                Telefono: '7777-8888',
                Escuela: 'Centro Escolar Ejemplo',
                EspecialidadId: 2,
                Nivel: 'Bachillerato Tecnico'
            },
            {
                Nombres: 'María Elena',
                Apellidos: 'Rodríguez Castro',
                DUI: '98765432-1',
                NIE: '20240002',
                Correo: 'maria.rodriguez@ejemplo.com',
                Telefono: '6666-5555',
                Escuela: 'Instituto Nacional Ejemplo',
                EspecialidadId: 1,
                Nivel: 'Bachillerato General'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(plantilla);
        ws['!cols'] = [
            { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
            { wch: 30 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 22 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Aspirantes');
        XLSX.writeFile(wb, 'plantilla_aspirantes.xlsx');
        mostrarMensaje('Plantilla descargada correctamente', 'success');
    };

    // ============================================================
    // ESTADÍSTICAS Y PROGRESO
    // ============================================================
    const porcentajeProgreso = useMemo(() => {
        if (progreso.total === 0) return 0;
        return Math.round((progreso.actual / progreso.total) * 100);
    }, [progreso]);

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <DashboardLayout title="Carga Masiva de Aspirantes">
            <style>{`
                /* Fondo blanco general */
                .gc-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }

                .gc-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03);
                    border: 1px solid #e2e8f0;
                }
                .gc-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }
                .gc-card h4 { margin: 0 0 12px; color: #334155; font-size: 15px; }

                /* Info box */
                .gc-info-box {
                    padding: 14px 18px;
                    border-radius: 8px;
                    margin-bottom: 18px;
                    font-size: 13px;
                    background: #eff6ff;
                    border-left: 4px solid #3b82f6;
                    color: #1e40af;
                    line-height: 1.5;
                }
                .gc-warning-box {
                    padding: 14px 18px;
                    border-radius: 8px;
                    margin-bottom: 18px;
                    font-size: 13px;
                    background: #fef3c7;
                    border-left: 4px solid #e67e22;
                    color: #b45309;
                    line-height: 1.5;
                }

                /* Botones */
                .gc-btn {
                    padding: 9px 16px;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all .2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-family: inherit;
                }
                .gc-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gc-btn-primary { background: #1e3a5f; color: #fff; }
                .gc-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gc-btn-secondary { background: #e5e7eb; color: #334155; }
                .gc-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gc-btn-success { background: #16a34a; color: #fff; }
                .gc-btn-success:hover:not(:disabled) { background: #15803d; }
                .gc-btn-danger { background: #dc2626; color: #fff; }
                .gc-btn-danger:hover:not(:disabled) { background: #b91c1c; }

                /* Campos */
                .gc-field { margin-bottom: 16px; }
                .gc-field label {
                    display: block;
                    font-weight: 600;
                    color: #34495e;
                    font-size: 13px;
                    margin-bottom: 6px;
                }
                .gc-field input[type="file"] {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px dashed #cbd5e1;
                    border-radius: 8px;
                    font-size: 13px;
                    box-sizing: border-box;
                    font-family: inherit;
                    background-color: #f8fafc;
                    cursor: pointer;
                    transition: border-color .2s, background .2s;
                }
                .gc-field input[type="file"]:hover {
                    border-color: #3b82f6;
                    background-color: #eff6ff;
                }

                /* Estadísticas */
                .gc-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .gc-stat {
                    padding: 16px;
                    border-radius: 10px;
                    text-align: center;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                }
                .gc-stat .num {
                    font-size: 24px;
                    font-weight: bold;
                    display: block;
                    line-height: 1.2;
                }
                .gc-stat .lbl {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    color: #64748b;
                    margin-top: 4px;
                }
                .gc-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .gc-stat-exitosos { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
                .gc-stat-fallidos { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }

                /* Barra de progreso */
                .gc-progreso-container {
                    margin-bottom: 16px;
                }
                .gc-progreso-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #475569;
                    margin-bottom: 6px;
                    font-weight: 600;
                }
                .gc-progreso-bar {
                    width: 100%;
                    height: 10px;
                    background: #e2e8f0;
                    border-radius: 5px;
                    overflow: hidden;
                }
                .gc-progreso-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1e3a5f);
                    border-radius: 5px;
                    transition: width .3s ease;
                }

                /* Tabla - FONDO BLANCO FORZADO */
                .gc-tabla {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                    background-color: #ffffff !important;
                }
                .gc-tabla thead th {
                    background: #f8fafc !important;
                    color: #1e293b !important;
                    padding: 10px 8px;
                    text-align: left;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    font-weight: 700;
                    border-bottom: 2px solid #cbd5e1;
                    white-space: nowrap;
                }
                .gc-tabla tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    background-color: #ffffff !important;
                }
                .gc-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .gc-tabla td {
                    padding: 10px 8px;
                    color: #1e293b !important;
                    vertical-align: middle;
                    background-color: #ffffff !important;
                    white-space: nowrap;
                }
                .gc-tabla tbody tr:hover td {
                    background-color: #f1f5f9 !important;
                }

                /* Lista de errores */
                .gc-errores-lista {
                    max-height: 300px;
                    overflow-y: auto;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    background: #fef2f2;
                }
                .gc-error-item {
                    padding: 10px 14px;
                    border-bottom: 1px solid #fecaca;
                    font-size: 12px;
                    color: #991b1b;
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                }
                .gc-error-item:last-child { border-bottom: none; }
                .gc-error-fila {
                    font-weight: 700;
                    background: #fee2e2;
                    color: #b91c1c;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    flex-shrink: 0;
                }
                .gc-error-nombre {
                    font-weight: 600;
                    color: #7f1d1d;
                }
                .gc-error-mensaje {
                    color: #991b1b;
                    word-break: break-word;
                }

                /* Avisos */
                .gc-aviso {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    font-weight: 500;
                }
                .gc-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gc-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                /* Acciones */
                .gc-acciones {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 16px;
                }

                @media (max-width: 600px) {
                    .gc-tabla { font-size: 11px; }
                    .gc-tabla thead th, .gc-tabla td { padding: 6px 4px; }
                }
            `}</style>

            <div className="gc-container">
                {mensaje && <div className={`gc-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* INSTRUCCIONES Y PLANTILLA */}
                <div className="gc-card">
                    <h3>Carga de Aspirantes desde Excel</h3>

                    <div className="gc-info-box">
                        <strong>Instrucciones:</strong>
                        <ol style={{ margin: '8px 0 0 18px', padding: 0 }}>
                            <li>Descarga la plantilla de ejemplo para conocer el formato requerido.</li>
                            <li>Completa la plantilla con los datos de los aspirantes.</li>
                            <li>Selecciona el archivo completado y verifica la vista previa.</li>
                            <li>Haz clic en "Cargar Aspirantes" para procesar el lote.</li>
                        </ol>
                    </div>

                    <div className="gc-warning-box">
                        <strong>Formatos aceptados:</strong> .xlsx, .xls<br />
                        <strong>Columnas requeridas:</strong> Nombres, Apellidos, DUI, NIE, Correo, Telefono, Escuela, EspecialidadId, Nivel
                    </div>

                    <button className="gc-btn gc-btn-secondary" onClick={descargarPlantilla}>
                        Descargar Plantilla de Ejemplo
                    </button>
                </div>

                {/* SELECCIÓN DE ARCHIVO */}
                <div className="gc-card">
                    <h3>Seleccionar Archivo</h3>

                    <div className="gc-field">
                        <label>Archivo Excel</label>
                        <input
                            id="file-input-aspirantes"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                    </div>

                    {file && (
                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                            Archivo seleccionado: <strong style={{ color: '#1e293b' }}>{file.name}</strong>
                            {' '}({(file.size / 1024).toFixed(2)} KB)
                        </div>
                    )}

                    <div className="gc-acciones">
                        <button
                            className="gc-btn gc-btn-primary"
                            onClick={handleUpload}
                            disabled={loading || !file}
                        >
                            {loading ? 'Procesando...' : 'Cargar Aspirantes'}
                        </button>
                        {file && !loading && (
                            <button className="gc-btn gc-btn-secondary" onClick={limpiarArchivo}>
                                Limpiar
                            </button>
                        )}
                    </div>

                    {/* Barra de progreso */}
                    {loading && progreso.total > 0 && (
                        <div className="gc-progreso-container" style={{ marginTop: '16px' }}>
                            <div className="gc-progreso-info">
                                <span>Procesando registros...</span>
                                <span>{progreso.actual} / {progreso.total} ({porcentajeProgreso}%)</span>
                            </div>
                            <div className="gc-progreso-bar">
                                <div
                                    className="gc-progreso-fill"
                                    style={{ width: `${porcentajeProgreso}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* VISTA PREVIA */}
                {preview.length > 0 && (
                    <div className="gc-card">
                        <h4>Vista Previa (primeros 10 registros)</h4>
                        <div className="table-responsive">
                            <table className="gc-tabla">
                                <thead>
                                    <tr>
                                        {Object.keys(preview[0]).map(key => (
                                            <th key={key}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, i) => (
                                        <tr key={i}>
                                            {Object.values(row).map((val, j) => (
                                                <td key={j}>{val !== null && val !== undefined ? String(val) : '-'}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* RESULTADOS */}
                {resultados && (
                    <div className="gc-card">
                        <h3>Resultado de la Carga</h3>

                        <div className="gc-stats">
                            <div className="gc-stat gc-stat-total">
                                <span className="num">{resultados.total}</span>
                                <span className="lbl">Total Procesados</span>
                            </div>
                            <div className="gc-stat gc-stat-exitosos">
                                <span className="num">{resultados.exitosos}</span>
                                <span className="lbl">Exitosos</span>
                            </div>
                            <div className="gc-stat gc-stat-fallidos">
                                <span className="num">{resultados.fallidos}</span>
                                <span className="lbl">Fallidos</span>
                            </div>
                        </div>

                        {resultados.errores.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h4>Errores Detectados ({resultados.errores.length})</h4>
                                <div className="gc-errores-lista">
                                    {resultados.errores.map((err, i) => (
                                        <div key={i} className="gc-error-item">
                                            <span className="gc-error-fila">Fila {err.fila}</span>
                                            <div>
                                                <div className="gc-error-nombre">{err.nombre}</div>
                                                <div className="gc-error-mensaje">{err.mensaje}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {resultados.fallidos === 0 && (
                            <div className="gc-info-box" style={{ marginTop: '16px', marginBottom: 0 }}>
                                Todos los aspirantes se registraron correctamente. Puedes verificar la lista en el módulo de aspirantes.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CargaMasivaAspirantes;