// Componente Documentos de Estudiantes (Registro Académico)
// Consulta, agrega y elimina documentos por estudiante. Solo permite VISUALIZAR (no descargar).
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const DocumentosEstudiantes = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [estudiantes, setEstudiantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroAnio, setFiltroAnio] = useState('');
    const [filtroClase, setFiltroClase] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [documentos, setDocumentos] = useState([]);
    const [cargandoDocs, setCargandoDocs] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [formData, setFormData] = useState({
        tipo: '',
        nombre: '',
        archivo: null,
        fecha: new Date().toISOString().split('T')[0]
    });

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [estudiantesRes, clasesRes] = await Promise.all([
                API.get('/estudiantes'),
                API.get('/clases')
            ]);
            setEstudiantes(estudiantesRes.data || []);
            const clasesData = clasesRes.data || [];
            setClases(clasesData);
            const anios = [...new Set(clasesData.map(c => c.anioLectivo))].sort((a, b) => b - a);
            setFiltroAnio(
                anios.includes(new Date().getFullYear())
                    ? String(new Date().getFullYear())
                    : (anios.length > 0 ? String(anios[0]) : String(new Date().getFullYear()))
            );
        } catch (error) {
            console.error('Error cargando datos:', error);
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // ============================================================
    // CÁLCULOS DERIVADOS
    // ============================================================
    const anioLectivo = parseInt(filtroAnio) || new Date().getFullYear();
    const aniosDisponibles = [...new Set(clases.map(c => c.anioLectivo))].sort((a, b) => b - a);
    const clasesAnio = clases.filter(c => c.anioLectivo === anioLectivo);
    const claseSeleccionada = clasesAnio.find(c => c.idClase === parseInt(filtroClase)) || null;

    const estudiantesFiltrados = useMemo(() => {
        const idsClases = claseSeleccionada
            ? new Set([claseSeleccionada.idClase])
            : new Set(clasesAnio.map(c => c.idClase));
        const termino = busqueda.trim().toLowerCase();
        return estudiantes.filter(e =>
            idsClases.has(e.idClase) &&
            (!termino ||
                (e.nie && String(e.nie).toLowerCase().includes(termino)) ||
                `${e.nombres} ${e.apellidos}`.toLowerCase().includes(termino))
        );
    }, [estudiantes, clasesAnio, claseSeleccionada, busqueda]);

    // ============================================================
    // HELPERS
    // ============================================================
    const getNombreEstudiante = (id) => {
        const est = estudiantes.find(e => e.idEstudiante === parseInt(id));
        return est ? `${est.nombres} ${est.apellidos}` : '-';
    };

    const esArchivoVisualizable = (extension) => {
        if (!extension) return false;
        const ext = extension.toLowerCase();
        return ext === '.pdf' || ext.startsWith('.jpg') || ext.startsWith('.jpeg') ||
            ext === '.png' || ext === '.gif' || ext === '.webp' || ext === '.bmp';
    };

    // ============================================================
    // CARGAR DOCUMENTOS
    // ============================================================
    const cargarDocumentos = async (idEstudiante) => {
        setCargandoDocs(true);
        try {
            const res = await API.get(`/documentos-estudiantes/estudiante/${idEstudiante}`);
            setDocumentos(res.data || []);
        } catch (error) {
            console.error('Error cargando documentos:', error);
            mostrarMensaje('Error al cargar documentos', 'error');
            setDocumentos([]);
        } finally {
            setCargandoDocs(false);
        }
    };

    // ============================================================
    // SELECCIÓN DE ESTUDIANTE
    // ============================================================
    const handleSelectEstudiante = (e) => {
        const id = e.target.value;
        setSelectedEstudiante(id);
        if (id) {
            cargarDocumentos(id);
        } else {
            setDocumentos([]);
        }
    };

    // ============================================================
    // SUBIR DOCUMENTO
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEstudiante) {
            mostrarMensaje('Seleccione un estudiante', 'error');
            return;
        }
        setGuardando(true);
        try {
            const data = new FormData();
            data.append('idEstudiante', selectedEstudiante);
            data.append('tipo', formData.tipo);
            data.append('nombre', formData.nombre);
            data.append('fecha', formData.fecha);
            if (formData.archivo) {
                data.append('archivo', formData.archivo);
            }
            await API.post('/documentos-estudiantes', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            mostrarMensaje('Documento agregado correctamente', 'success');
            setShowModal(false);
            setFormData({ tipo: '', nombre: '', archivo: null, fecha: new Date().toISOString().split('T')[0] });
            cargarDocumentos(selectedEstudiante);
        } catch (error) {
            console.error('Error guardando documento:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al agregar documento', 'error');
        } finally {
            setGuardando(false);
        }
    };

    // ============================================================
    // VER DOCUMENTO (abre en nueva pestaña, solo para PDF/imagen)
    // ============================================================
    const verDocumento = async (doc) => {
        try {
            const res = await API.get(`/documentos-estudiantes/${doc.idDocumento}/descargar?inline=true`, {
                responseType: 'blob'
            });

            const contentType = res.headers['content-type'] || 'application/octet-stream';

            // Extraer nombre desde Content-Disposition
            let nombreArchivo = doc.nombreArchivo || `documento_${doc.idDocumento}`;
            const contentDisposition = res.headers['content-disposition'];
            if (contentDisposition) {
                const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
                if (utf8Match && utf8Match[1]) {
                    nombreArchivo = decodeURIComponent(utf8Match[1]);
                } else {
                    const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
                    if (asciiMatch && asciiMatch[1]) {
                        nombreArchivo = asciiMatch[1];
                    }
                }
            }

            const blob = new Blob([res.data], { type: contentType });
            const blobUrl = window.URL.createObjectURL(blob);

            // Abrir siempre en una nueva pestaña (solo para visualizar)
            const nuevaPestana = window.open(blobUrl, '_blank');
            if (!nuevaPestana) {
                mostrarMensaje('Permita las ventanas emergentes para ver el archivo', 'error');
            }
            // Revocar el URL después de un tiempo para liberar memoria
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
        } catch (error) {
            console.error('Error visualizando documento:', error);
            mostrarMensaje('Error al visualizar el documento', 'error');
        }
    };

    // ============================================================
    // ELIMINAR
    // ============================================================
    const eliminar = async (doc) => {
        const nombre = getNombreEstudiante(selectedEstudiante);
        if (!window.confirm(`¿Eliminar "${doc.nombre || doc.tipo}" de ${nombre}?`)) return;
        try {
            await API.delete(`/documentos-estudiantes/${doc.idDocumento}`);
            mostrarMensaje('Documento eliminado correctamente', 'success');
            cargarDocumentos(selectedEstudiante);
        } catch (error) {
            console.error('Error eliminando documento:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al eliminar documento', 'error');
        }
    };

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================
    const totalDocumentos = documentos.length;

    // ============================================================
    // RENDER: LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Documentos">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Documentos de Estudiantes - Registro Académico">
            <style>{`
                .de-container { display: flex; flex-direction: column; gap: 20px; }
                .de-card {
                    background: #fff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 2px 10px rgba(0,0,0,.06);
                    border: 1px solid #e2e8f0;
                }
                .de-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }
                .de-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 14px;
                    margin-bottom: 16px;
                }
                .de-field label {
                    display: block;
                    font-weight: 600;
                    color: #34495e;
                    font-size: 13px;
                    margin-bottom: 6px;
                }
                .de-field input, .de-field select {
                    width: 100%;
                    padding: 9px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 14px;
                    box-sizing: border-box;
                    background: #fff;
                    transition: border-color .2s, box-shadow .2s;
                }
                .de-field input:focus, .de-field select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .de-field small { display: block; margin-top: 4px; color: #64748b; font-size: 12px; }

                .de-btn {
                    padding: 9px 18px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all .2s;
                }
                .de-btn:disabled { opacity: .6; cursor: not-allowed; }
                .de-btn-primary { background: #1e3a5f; color: #fff; }
                .de-btn-primary:hover:not(:disabled) { background: #16293f; }
                .de-btn-info { background: #3b82f6; color: #fff; }
                .de-btn-info:hover:not(:disabled) { background: #2563eb; }
                .de-btn-danger { background: #dc2626; color: #fff; }
                .de-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .de-btn-sm { padding: 5px 12px; font-size: 12px; }

                .de-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 12px;
                    margin-bottom: 4px;
                }
                .de-stat {
                    padding: 14px;
                    border-radius: 10px;
                    text-align: center;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                }
                .de-stat .num {
                    font-size: 22px;
                    font-weight: bold;
                    display: block;
                    color: #1e3a5f;
                    line-height: 1.2;
                }
                .de-stat .lbl {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    color: #64748b;
                }

                .de-table { width: 100%; border-collapse: collapse; }
                .de-table thead th {
                    background: #1e3a5f;
                    color: #fff;
                    padding: 11px 10px;
                    text-align: left;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    font-weight: 600;
                }
                .de-table thead th:first-child { border-top-left-radius: 8px; }
                .de-table thead th:last-child { border-top-right-radius: 8px; }
                .de-table tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    transition: background .15s;
                }
                .de-table tbody tr:hover { background: #f8fafc; }
                .de-table tbody tr:nth-child(even) { background: #fafbfc; }
                .de-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .de-table td { padding: 10px; font-size: 13px; color: #334155; }

                .de-aviso {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    font-weight: 500;
                }
                .de-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .de-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .de-empty {
                    text-align: center;
                    padding: 40px;
                    color: #94a3b8;
                    font-size: 14px;
                }

                .de-badge {
                    display: inline-block;
                    padding: 3px 10px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 600;
                    background: #dbeafe;
                    color: #1d4ed8;
                }

                /* Modal */
                .de-modal-overlay {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: rgba(15,23,42,.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999;
                    padding: 20px;
                }
                .de-modal {
                    background: #fff;
                    border-radius: 12px;
                    max-width: 520px;
                    width: 100%;
                    padding: 24px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .de-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .de-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .de-modal-close {
                    background: none;
                    border: none;
                    font-size: 22px;
                    cursor: pointer;
                    color: #64748b;
                    line-height: 1;
                }
                .de-modal-close:hover { color: #dc2626; }

                @media (max-width: 768px) {
                    .de-grid { grid-template-columns: 1fr; }
                    .de-table { font-size: 12px; }
                    .de-table thead th, .de-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="de-container">
                {message && <div className={`de-aviso ${messageType}`}>{message}</div>}

                {/* TARJETAS DE ESTADÍSTICAS */}
                <div className="de-stats">
                    <div className="de-stat">
                        <span className="num">{estudiantesFiltrados.length}</span>
                        <span className="lbl">Estudiantes</span>
                    </div>
                    <div className="de-stat">
                        <span className="num">{totalDocumentos}</span>
                        <span className="lbl">Documentos del Estudiante</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="de-card">
                    <h3>Documentos del Estudiante</h3>

                    <div className="de-grid">
                        <div className="de-field">
                            <label>Año Lectivo</label>
                            <select
                                value={filtroAnio}
                                onChange={(e) => {
                                    setFiltroAnio(e.target.value);
                                    setFiltroClase('');
                                    setSelectedEstudiante('');
                                    setDocumentos([]);
                                }}
                            >
                                {aniosDisponibles.length === 0 && (
                                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                )}
                                {aniosDisponibles.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>

                        <div className="de-field">
                            <label>Clase</label>
                            <select
                                value={filtroClase}
                                onChange={(e) => {
                                    setFiltroClase(e.target.value);
                                    setSelectedEstudiante('');
                                    setDocumentos([]);
                                }}
                            >
                                <option value="">Todas las clases</option>
                                {clasesAnio.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} (Sección {c.seccion})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="de-field">
                            <label>Buscar por NIE o Nombre</label>
                            <input
                                type="text"
                                placeholder="Digite el NIE o nombre..."
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setSelectedEstudiante('');
                                    setDocumentos([]);
                                }}
                            />
                        </div>
                    </div>

                    <div className="de-field" style={{ marginBottom: '12px' }}>
                        <label>Estudiante</label>
                        <select
                            value={selectedEstudiante}
                            onChange={handleSelectEstudiante}
                        >
                            <option value="">Seleccionar Estudiante</option>
                            {estudiantesFiltrados.map(e => (
                                <option key={e.idEstudiante} value={e.idEstudiante}>
                                    {e.nombres} {e.apellidos} - NIE: {e.nie || 'N/A'}
                                </option>
                            ))}
                        </select>
                        <small>
                            {estudiantesFiltrados.length} estudiante(s) disponibles
                        </small>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                        <button
                            className="de-btn de-btn-primary"
                            onClick={() => setShowModal(true)}
                            disabled={!selectedEstudiante}
                        >
                            + Agregar Documento
                        </button>
                    </div>
                </div>

                {/* TABLA DE DOCUMENTOS */}
                {selectedEstudiante && (
                    <div className="de-card">
                        <h3>Documentos de {getNombreEstudiante(selectedEstudiante)}</h3>
                        {cargandoDocs ? (
                            <p className="de-empty">Cargando documentos...</p>
                        ) : documentos.length === 0 ? (
                            <p className="de-empty">
                                Este estudiante no tiene documentos registrados. Use "+ Agregar Documento" para subir uno.
                            </p>
                        ) : (
                            <div className="table-responsive">
                                <table className="de-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50px' }}>#</th>
                                            <th>Tipo</th>
                                            <th>Nombre</th>
                                            <th>Fecha</th>
                                            <th>Archivo</th>
                                            <th style={{ width: '180px' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documentos.map((doc, index) => {
                                            const visualizable = esArchivoVisualizable(doc.extension);
                                            return (
                                                <tr key={doc.idDocumento}>
                                                    <td style={{ textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                                                    <td><span className="de-badge">{doc.tipo}</span></td>
                                                    <td>{doc.nombre}</td>
                                                    <td>{new Date(doc.fecha).toLocaleDateString()}</td>
                                                    <td>
                                                        {doc.tieneDocumento
                                                            ? <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{doc.nombreArchivo}</span>
                                                            : <em style={{ color: '#94a3b8' }}>Sin archivo</em>}
                                                    </td>
                                                    <td>
                                                        {doc.tieneDocumento && visualizable && (
                                                            <button
                                                                className="de-btn de-btn-info de-btn-sm"
                                                                onClick={() => verDocumento(doc)}
                                                                style={{ marginRight: '6px' }}
                                                                title="Ver en el navegador"
                                                            >
                                                                Ver
                                                            </button>
                                                        )}
                                                        <button
                                                            className="de-btn de-btn-danger de-btn-sm"
                                                            onClick={() => eliminar(doc)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL: AGREGAR DOCUMENTO */}
                {showModal && (
                    <div className="de-modal-overlay" onClick={() => !guardando && setShowModal(false)}>
                        <div className="de-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="de-modal-header">
                                <h3>Agregar Documento - {getNombreEstudiante(selectedEstudiante)}</h3>
                                <button
                                    className="de-modal-close"
                                    onClick={() => setShowModal(false)}
                                    disabled={guardando}
                                >
                                    X
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="de-field" style={{ marginBottom: '14px' }}>
                                    <label>Tipo de Documento</label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Certificado de Notas">Certificado de Notas</option>
                                        <option value="Constancia de Estudio">Constancia de Estudio</option>
                                        <option value="Partida de Nacimiento">Partida de Nacimiento</option>
                                        <option value="Certificado de Conducta">Certificado de Conducta</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div className="de-field" style={{ marginBottom: '14px' }}>
                                    <label>Nombre del Documento</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        required
                                        placeholder="Ej: Certificado de Notas 2026"
                                    />
                                </div>

                                <div className="de-field" style={{ marginBottom: '14px' }}>
                                    <label>Archivo (PDF o imagen, opcional)</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) => setFormData({ ...formData, archivo: e.target.files[0] })}
                                    />
                                </div>

                                <div className="de-field" style={{ marginBottom: '14px' }}>
                                    <label>Fecha</label>
                                    <input
                                        type="date"
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        className="de-btn"
                                        onClick={() => setShowModal(false)}
                                        disabled={guardando}
                                        style={{ background: '#e5e7eb', color: '#334155' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="de-btn de-btn-primary"
                                        disabled={guardando}
                                    >
                                        {guardando ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DocumentosEstudiantes;