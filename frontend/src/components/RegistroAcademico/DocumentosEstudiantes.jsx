// Componente Documentos de Estudiantes (Registro Académico): consulta, agrega, descarga y elimina documentos por estudiante.
// Filtros por año lectivo, clase y búsqueda por NIE/nombre para localizar rápido al estudiante.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const DocumentosEstudiantes = () => {
    // Estado de catálogos, filtros, estudiante seleccionado, documentos y formulario.
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

    // Carga estudiantes y clases al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene los estudiantes y las clases desde la API.
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
            setFiltroAnio(anios.includes(new Date().getFullYear())
                ? String(new Date().getFullYear())
                : (anios.length > 0 ? String(anios[0]) : String(new Date().getFullYear())));
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Muestra un mensaje temporal de éxito o error.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Año lectivo efectivo según el filtro.
    const anioLectivo = parseInt(filtroAnio) || new Date().getFullYear();

    // Listas derivadas de los filtros: años, clases del año y estudiantes resultantes.
    const aniosDisponibles = [...new Set(clases.map(c => c.anioLectivo))].sort((a, b) => b - a);
    const clasesAnio = clases.filter(c => c.anioLectivo === anioLectivo);
    const claseSeleccionada = clasesAnio.find(c => c.idClase === parseInt(filtroClase)) || null;
    const clasesFiltradas = claseSeleccionada ? [claseSeleccionada] : clasesAnio;
    const idsClasesFiltradas = new Set(clasesFiltradas.map(c => c.idClase));
    const termino = busqueda.trim().toLowerCase();
    const estudiantesFiltrados = estudiantes.filter(e =>
        idsClasesFiltradas.has(e.idClase) &&
        (!termino ||
            (e.nie && String(e.nie).toLowerCase().includes(termino)) ||
            `${e.nombres} ${e.apellidos}`.toLowerCase().includes(termino))
    );

    // Devuelve el nombre completo del estudiante desde la lista local.
    const getNombreEstudiante = (id) => {
        const est = estudiantes.find(e => e.idEstudiante === parseInt(id));
        return est ? `${est.nombres} ${est.apellidos}` : '-';
    };

    // Carga los documentos reales del estudiante desde la API.
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

    // Al elegir un estudiante, carga sus documentos; si no hay selección, limpia la lista.
    const handleSelectEstudiante = (e) => {
        const id = e.target.value;
        setSelectedEstudiante(id);
        if (id) {
            cargarDocumentos(id);
        } else {
            setDocumentos([]);
        }
    };

    // Envía el formulario del nuevo documento a la API y refresca la lista.
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
            await API.post('/documentos-estudiantes', data, { headers: { 'Content-Type': 'multipart/form-data' } });
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

    // Descarga el archivo adjunto del documento.
    const descargar = async (doc) => {
        try {
            const res = await API.get(`/documentos-estudiantes/${doc.idDocumento}/descargar`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.nombreArchivo || `documento_${doc.idDocumento}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando documento:', error);
            mostrarMensaje('Error al descargar el documento', 'error');
        }
    };

    // Elimina el documento (con confirmación) y refresca la lista.
    const eliminar = async (doc) => {
        if (!window.confirm(`¿Eliminar "${doc.nombre || doc.tipo}" de ${getNombreEstudiante(selectedEstudiante)}?`)) return;
        try {
            await API.delete(`/documentos-estudiantes/${doc.idDocumento}`);
            mostrarMensaje('Documento eliminado correctamente', 'success');
            cargarDocumentos(selectedEstudiante);
        } catch (error) {
            console.error('Error eliminando documento:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al eliminar documento', 'error');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Documentos">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Documentos de Estudiantes - Registro Academico">
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
                <h3>Documentos del Estudiante</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Año Lectivo</label>
                        <select
                            value={filtroAnio}
                            onChange={(e) => {
                                setFiltroAnio(e.target.value);
                                setFiltroClase('');
                                setSelectedEstudiante('');
                                setDocumentos([]);
                            }}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            {aniosDisponibles.length === 0 && <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>}
                            {aniosDisponibles.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Clase</label>
                        <select
                            value={filtroClase}
                            onChange={(e) => {
                                setFiltroClase(e.target.value);
                                setSelectedEstudiante('');
                                setDocumentos([]);
                            }}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            <option value="">Todas las clases</option>
                            {clasesAnio.map(c => (
                                <option key={c.idClase} value={c.idClase}>
                                    {c.nombreClase} (Sección {c.seccion})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Buscar por NIE</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Digite el NIE..."
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setSelectedEstudiante('');
                                setDocumentos([]);
                            }}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Estudiante</label>
                    <select
                        value={selectedEstudiante}
                        onChange={handleSelectEstudiante}
                        className="form-control"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                        <option value="">Seleccionar Estudiante</option>
                        {estudiantesFiltrados.map(e => (
                            <option key={e.idEstudiante} value={e.idEstudiante}>
                                {e.nombres} {e.apellidos} - NIE: {e.nie || 'N/A'}
                            </option>
                        ))}
                    </select>
                    <small style={{ display: 'block', marginTop: '4px', color: '#64748b', fontSize: '12px' }}>
                        {estudiantesFiltrados.length} estudiante(s) en {clasesFiltradas.length > 0
                            ? clasesFiltradas.map(c => `${c.nombreClase} (Sección ${c.seccion})`).join(', ')
                            : 'las clases del año seleccionado'}
                    </small>
                </div>

                <button
                    className="btn-primary"
                    onClick={() => setShowModal(true)}
                    disabled={!selectedEstudiante}
                    style={{ padding: '8px 16px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: selectedEstudiante ? 'pointer' : 'not-allowed', opacity: selectedEstudiante ? 1 : 0.6 }}
                >
                    + Agregar Documento
                </button>
            </div>

            {selectedEstudiante && (
                <div className="card">
                    <h3>Documentos de {getNombreEstudiante(selectedEstudiante)}</h3>
                    {cargandoDocs ? (
                        <p style={{ color: '#7f8c8d', textAlign: 'center' }}>Cargando documentos...</p>
                    ) : documentos.length === 0 ? (
                        <p style={{ color: '#7f8c8d', textAlign: 'center' }}>
                            Este estudiante no tiene documentos registrados. Use "+ Agregar Documento" para subir uno.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9' }}>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Tipo</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Archivo</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documentos.map((doc, index) => (
                                        <tr key={doc.idDocumento} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '8px' }}>{index + 1}</td>
                                            <td style={{ padding: '8px' }}>{doc.tipo}</td>
                                            <td style={{ padding: '8px' }}>{doc.nombre}</td>
                                            <td style={{ padding: '8px' }}>{new Date(doc.fecha).toLocaleDateString()}</td>
                                            <td style={{ padding: '8px' }}>{doc.tieneDocumento ? doc.nombreArchivo : 'Sin archivo'}</td>
                                            <td style={{ padding: '8px' }}>
                                                {doc.tieneDocumento && (
                                                    <button
                                                        className="btn-edit"
                                                        title="Descargar archivo"
                                                        onClick={() => descargar(doc)}
                                                        style={{ padding: '4px 12px', marginRight: '4px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Ver / Descargar
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-danger"
                                                    title="Eliminar documento"
                                                    onClick={() => eliminar(doc)}
                                                    style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '24px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Agregar Documento - {getNombreEstudiante(selectedEstudiante)}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tipo de Documento</label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
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
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombre del Documento</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    required
                                    placeholder="Ej: Certificado de Notas 2026"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Archivo (PDF o imagen, opcional)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) => setFormData({ ...formData, archivo: e.target.files[0] })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha</label>
                                <input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={guardando} style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.6 : 1 }}>
                                    {guardando ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default DocumentosEstudiantes;