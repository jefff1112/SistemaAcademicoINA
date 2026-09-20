import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const CertificadosRegistro = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modo, setModo] = useState('estudiante'); // 'estudiante' o 'clase'
    const [filtroAnio, setFiltroAnio] = useState('');
    const [filtroClase, setFiltroClase] = useState('');
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [formato, setFormato] = useState('pdf');
    const [busqueda, setBusqueda] = useState('');
    const [certificadoData, setCertificadoData] = useState(null);
    const [certificadosClase, setCertificadosClase] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [generando, setGenerando] = useState(false);

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
            setFiltroAnio(anios.includes(new Date().getFullYear())
                ? String(new Date().getFullYear())
                : (anios.length > 0 ? String(anios[0]) : String(new Date().getFullYear())));
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    const cambiarModo = (nuevoModo) => {
        setModo(nuevoModo);
        setSelectedEstudiante('');
        setCertificadoData(null);
        setCertificadosClase([]);
        setBusqueda('');
    };

    const anioLectivo = parseInt(filtroAnio) || new Date().getFullYear();
    const aniosDisponibles = [...new Set(clases.map(c => c.anioLectivo))].sort((a, b) => b - a);
    const clasesAnio = clases.filter(c => c.anioLectivo === anioLectivo);
    const claseSeleccionada = clasesAnio.find(c => c.idClase === parseInt(filtroClase)) || null;

    // Estudiantes filtrados por clase y búsqueda
    const idsClasesFiltradas = new Set(claseSeleccionada ? [claseSeleccionada.idClase] : clasesAnio.map(c => c.idClase));
    const termino = busqueda.trim().toLowerCase();
    const estudiantesFiltrados = estudiantes.filter(e =>
        idsClasesFiltradas.has(e.idClase) &&
        (!termino ||
            (e.nie && String(e.nie).toLowerCase().includes(termino)) ||
            `${e.nombres} ${e.apellidos}`.toLowerCase().includes(termino))
    );

    // Generar certificado individual (vista previa)
    const generarCertificadoIndividual = async () => {
        if (!selectedEstudiante) {
            mostrarMensaje('Seleccione un estudiante', 'error');
            return;
        }

        try {
            const response = await API.get(`/certificados-promocion/estudiante/${selectedEstudiante}/${anioLectivo}`);
            setCertificadoData(response.data);
            setCertificadosClase([]);
            mostrarMensaje('Certificado generado correctamente', 'success');
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al generar certificado', 'error');
        }
    };

    // Cargar certificados de toda la clase (vista previa)
    const cargarCertificadosClase = async () => {
        if (!filtroClase) {
            mostrarMensaje('Seleccione una clase', 'error');
            return;
        }

        try {
            const response = await API.get(`/certificados-promocion/clase/${filtroClase}/${anioLectivo}`);
            setCertificadosClase(response.data);
            setCertificadoData(null);
            mostrarMensaje(`${response.data.length} certificados cargados`, 'success');
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al cargar certificados', 'error');
        }
    };

    // Descargar PDF/Word
    const descargarDocumento = async () => {
        setGenerando(true);
        try {
            let url = '';
            let nombreArchivo = '';

            if (modo === 'estudiante') {
                if (!selectedEstudiante) {
                    mostrarMensaje('Seleccione un estudiante', 'error');
                    setGenerando(false);
                    return;
                }
                url = `/certificados-promocion/generar/estudiante/${selectedEstudiante}/${anioLectivo}/${formato}`;
                nombreArchivo = `certificado_promocion_${selectedEstudiante}.${formato === 'pdf' ? 'pdf' : 'docx'}`;
            } else {
                if (!filtroClase) {
                    mostrarMensaje('Seleccione una clase', 'error');
                    setGenerando(false);
                    return;
                }
                url = `/certificados-promocion/generar/clase/${filtroClase}/${anioLectivo}/${formato}`;
                nombreArchivo = `certificados_promocion_clase_${filtroClase}.${formato === 'pdf' ? 'pdf' : 'docx'}`;
            }

            const response = await API.get(url, { responseType: 'blob' });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = nombreArchivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);

            mostrarMensaje('Documento descargado exitosamente', 'success');
        } catch (error) {
            // Manejar error que viene como blob
            if (error.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        mostrarMensaje(errorData.mensaje || 'Error al generar documento', 'error');
                    } catch (e) {
                        mostrarMensaje('Error al generar documento', 'error');
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                mostrarMensaje(error.response?.data?.mensaje || 'Error al generar documento', 'error');
            }
        } finally {
            setGenerando(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Certificados">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Certificados de Promoción - Registro Académico">
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
                <h3>Generar Certificado de Promoción</h3>

                {/* Radio buttons para seleccionar modo */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="modoCertificado"
                            value="estudiante"
                            checked={modo === 'estudiante'}
                            onChange={() => cambiarModo('estudiante')}
                        />
                        Por Estudiante
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="modoCertificado"
                            value="clase"
                            checked={modo === 'clase'}
                            onChange={() => cambiarModo('clase')}
                        />
                        Por Clase
                    </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Año Lectivo</label>
                        <select
                            value={filtroAnio}
                            onChange={(e) => {
                                setFiltroAnio(e.target.value);
                                setFiltroClase('');
                                setSelectedEstudiante('');
                                setCertificadoData(null);
                                setCertificadosClase([]);
                            }}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
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
                                setCertificadoData(null);
                                setCertificadosClase([]);
                            }}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            <option value="">Seleccione una clase</option>
                            {clasesAnio.map(c => (
                                <option key={c.idClase} value={c.idClase}>
                                    {c.nombreClase} (Sección {c.seccion})
                                </option>
                            ))}
                        </select>
                    </div>

                    {modo === 'estudiante' && (
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Buscar por NIE</label>
                            <input
                                type="text"
                                placeholder="Digite el NIE..."
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setSelectedEstudiante('');
                                    setCertificadoData(null);
                                }}
                                className="form-control"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Formato</label>
                        <select
                            value={formato}
                            onChange={(e) => setFormato(e.target.value)}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            <option value="pdf">PDF</option>
                            <option value="word">Word (.docx)</option>
                        </select>
                    </div>
                </div>

                {modo === 'estudiante' && (
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Estudiante</label>
                        <select
                            value={selectedEstudiante}
                            onChange={(e) => setSelectedEstudiante(e.target.value)}
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
                            {estudiantesFiltrados.length} estudiante(s) encontrados
                        </small>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={modo === 'estudiante' ? generarCertificadoIndividual : cargarCertificadosClase}
                        style={{ padding: '8px 24px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Vista Previa
                    </button>
                    <button
                        onClick={descargarDocumento}
                        disabled={generando}
                        style={{
                            padding: '8px 24px',
                            background: generando ? '#93c5fd' : '#16a34a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: generando ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {generando ? 'Generando...' : `Descargar ${formato.toUpperCase()}`}
                    </button>
                </div>
            </div>

            {/* Vista previa del certificado individual */}
            {certificadoData && (
                <div className="card" style={{ border: '2px solid #1e3a5f', marginTop: '20px' }}>
                    <h3>Certificado de Promoción</h3>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <p><strong>Instituto Nacional de Apopa</strong></p>
                        <p><strong>Certificado de Promoción</strong></p>
                        <hr />
                        <p><strong>Estudiante:</strong> {certificadoData.nombreCompleto}</p>
                        <p><strong>Código:</strong> {certificadoData.codigoEstudiante}</p>
                        <p><strong>NIE:</strong> {certificadoData.nie || '-'}</p>
                        <p><strong>Nivel:</strong> {certificadoData.nivelBachillerato}</p>
                        <p><strong>Especialidad:</strong> {certificadoData.especialidad}</p>
                        <p><strong>Sección:</strong> {certificadoData.seccion}</p>
                        <p><strong>Año Lectivo:</strong> {certificadoData.anioLectivo}</p>
                        <p><strong>Promedio General:</strong> {certificadoData.promedioGeneral.toFixed(2)}</p>
                        <p><strong>Materias Aprobadas:</strong> {certificadoData.materiasAprobadas}</p>
                        <p><strong>Materias Reprobadas:</strong> {certificadoData.materiasReprobadas}</p>
                        <p><strong>Estado:</strong>
                            <span style={{
                                marginLeft: '8px',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                backgroundColor: certificadoData.estado === 'PROMOVIDO' ? '#dcfce7' : '#fee2e2',
                                color: certificadoData.estado === 'PROMOVIDO' ? '#15803d' : '#b91c1c'
                            }}>
                                {certificadoData.estado}
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {/* Vista previa de certificados por clase */}
            {certificadosClase.length > 0 && (
                <div className="card" style={{ border: '2px solid #1e3a5f', marginTop: '20px' }}>
                    <h3>Certificados de la Clase ({certificadosClase.length})</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {certificadosClase.map((cert, idx) => (
                            <div key={idx} style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{cert.nombreCompleto}</strong>
                                    <span style={{ color: '#64748b', marginLeft: '8px', fontSize: '13px' }}>
                                        {cert.codigoEstudiante}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <span>Prom: {cert.promedioGeneral.toFixed(2)}</span>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: cert.estado === 'PROMOVIDO' ? '#dcfce7' : '#fee2e2',
                                        color: cert.estado === 'PROMOVIDO' ? '#15803d' : '#b91c1c'
                                    }}>
                                        {cert.estado}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CertificadosRegistro;