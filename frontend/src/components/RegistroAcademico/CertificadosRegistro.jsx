// Componente Certificados de Promoción (Registro Académico): genera e imprime el certificado de promoción de un estudiante.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const CertificadosRegistro = () => {
    // Estado de catálogos, filtros (año, sección, NIE) y datos del certificado generado.
    const [estudiantes, setEstudiantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroAnio, setFiltroAnio] = useState('');
    const [filtroClase, setFiltroClase] = useState('');
    const [filtroSeccion, setFiltroSeccion] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [certificadoData, setCertificadoData] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

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

    // Año lectivo efectivo según el filtro seleccionado.
    const anioLectivo = parseInt(filtroAnio) || new Date().getFullYear();

    // Listas derivadas de los filtros: años, clases del año y estudiantes resultantes.
    const aniosDisponibles = [...new Set(clases.map(c => c.anioLectivo))].sort((a, b) => b - a);
    const clasesAnio = clases.filter(c => c.anioLectivo === anioLectivo);
    const claseSeleccionada = clasesAnio.find(c => c.idClase === parseInt(filtroClase)) || null;
    const seccionesDisponibles = [...new Set(clasesAnio.map(c => c.seccion).filter(Boolean))].sort();
    // Si hay clase elegida, la sección se toma automáticamente de ella; si no, se filtra por la sección manual.
    const clasesFiltradas = claseSeleccionada
        ? [claseSeleccionada]
        : clasesAnio.filter(c => !filtroSeccion || c.seccion === filtroSeccion);
    const idsClasesFiltradas = new Set(clasesFiltradas.map(c => c.idClase));
    const termino = busqueda.trim().toLowerCase();
    const estudiantesFiltrados = estudiantes.filter(e =>
        idsClasesFiltradas.has(e.idClase) &&
        (!termino ||
            (e.nie && String(e.nie).toLowerCase().includes(termino)) ||
            `${e.nombres} ${e.apellidos}`.toLowerCase().includes(termino))
    );

    // Consulta las notas del estudiante y calcula promoción, promedio y materias aprobadas/reprobadas.
    const generarCertificado = async () => {
        if (!selectedEstudiante) {
            mostrarMensaje('Seleccione un estudiante', 'error');
            return;
        }

        try {
            const response = await API.get(`/reportes/notas-estudiante/${selectedEstudiante}/${anioLectivo}`);
            const data = response.data || {};
            const notas = data.notas || [];
            const aprobadas = notas.filter(n => n.estadoMateria === 'Aprobado').length;
            const reprobadas = notas.filter(n => n.estadoMateria === 'Reprobado').length;
            const promedio = notas.length > 0 ? notas.reduce((s, n) => s + n.notaFinal, 0) / notas.length : 0;

            setCertificadoData({
                estudiante: data.estudiante || getEstudianteNombre(selectedEstudiante),
                codigo: data.codigo || getEstudianteCodigo(selectedEstudiante),
                anioLectivo: anioLectivo,
                promedio: promedio.toFixed(2),
                aprobadas,
                reprobadas,
                estado: promedio >= 6 ? 'PROMOVIDO' : 'NO PROMOVIDO',
                fecha: new Date().toLocaleDateString()
            });
            mostrarMensaje('Certificado generado correctamente', 'success');
        } catch (error) {
            mostrarMensaje('Error al generar certificado', 'error');
        }
    };

    // Devuelve el nombre completo del estudiante desde la lista local.
    const getEstudianteNombre = (id) => {
        const estudiante = estudiantes.find(e => e.idEstudiante === parseInt(id));
        return estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : '-';
    };

    // Devuelve el código del estudiante desde la lista local.
    const getEstudianteCodigo = (id) => {
        const estudiante = estudiantes.find(e => e.idEstudiante === parseInt(id));
        return estudiante ? estudiante.codigoEstudiante : '-';
    };

    if (loading) {
        return (
            <DashboardLayout title="Certificados">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Certificados de Promocion - Registro Academico">
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
                <h3>Generar Certificado de Promocion</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Año Lectivo</label>
                        <select
                            value={filtroAnio}
                            onChange={(e) => {
                                setFiltroAnio(e.target.value);
                                setFiltroClase('');
                                setFiltroSeccion('');
                                setSelectedEstudiante('');
                                setCertificadoData(null);
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
                                setFiltroSeccion('');
                                setSelectedEstudiante('');
                                setCertificadoData(null);
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
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Sección</label>
                        <select
                            value={claseSeleccionada ? claseSeleccionada.seccion : filtroSeccion}
                            onChange={(e) => {
                                if (claseSeleccionada) return;
                                setFiltroSeccion(e.target.value);
                                setSelectedEstudiante('');
                                setCertificadoData(null);
                            }}
                            disabled={!!claseSeleccionada}
                            className="form-control"
                            style={{
                                width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px',
                                opacity: claseSeleccionada ? 0.65 : 1, cursor: claseSeleccionada ? 'not-allowed' : 'default'
                            }}
                        >
                            <option value="">{claseSeleccionada ? 'Según la clase seleccionada' : 'Todas las secciones'}</option>
                            {seccionesDisponibles.map(s => (
                                <option key={s} value={s}>Sección {s}</option>
                            ))}
                        </select>
                        {claseSeleccionada && (
                            <small style={{ display: 'block', marginTop: '4px', color: '#16a34a', fontSize: '12px' }}>
                                Sección {claseSeleccionada.seccion || '-'} asignada automáticamente por la clase
                            </small>
                        )}
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
                                setCertificadoData(null);
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
                        {estudiantesFiltrados.length} estudiante(s) en {clasesFiltradas.length > 0
                            ? clasesFiltradas.map(c => `${c.nombreClase} (Sección ${c.seccion})`).join(', ')
                            : 'las clases del año seleccionado'}
                    </small>
                </div>

                <button className="btn-primary" onClick={generarCertificado} style={{ padding: '8px 24px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Generar Certificado
                </button>
            </div>

            {certificadoData && (
                <div className="card" style={{ border: '2px solid #1e3a5f' }}>
                    <h3>Certificado de Promocion</h3>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <p><strong>Instituto Nacional de Apopa</strong></p>
                        <p><strong>Certificado de Promocion</strong></p>
                        <hr />
                        <p><strong>Estudiante:</strong> {certificadoData.estudiante}</p>
                        <p><strong>Codigo:</strong> {certificadoData.codigo}</p>
                        <p><strong>Año Lectivo:</strong> {certificadoData.anioLectivo}</p>
                        <p><strong>Promedio General:</strong> {certificadoData.promedio}</p>
                        <p><strong>Materias Aprobadas:</strong> {certificadoData.aprobadas}</p>
                        <p><strong>Materias Reprobadas:</strong> {certificadoData.reprobadas}</p>
                        <p><strong>Estado:</strong> <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            backgroundColor: certificadoData.estado === 'PROMOVIDO' ? '#dcfce7' : '#fee2e2',
                            color: certificadoData.estado === 'PROMOVIDO' ? '#15803d' : '#b91c1c'
                        }}>
                            {certificadoData.estado}
                        </span></p>
                        <p><strong>Fecha:</strong> {certificadoData.fecha}</p>
                    </div>
                    <button className="btn-success" onClick={() => window.print()} style={{ marginTop: '1rem', padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Imprimir Certificado
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CertificadosRegistro;