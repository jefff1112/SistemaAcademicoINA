// Componente GestionTituloEnProceso (Compartido): Título en Proceso
// Usado en la ruta /titulo-en-proceso accesible por múltiples roles.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionTituloEnProceso = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    const [generandoTitulo, setGenerandoTitulo] = useState(false);

    const [tituloProceso, setTituloProceso] = useState({
        modo: 'estudiante',
        idEstudiante: '',
        idClase: '',
        formato: 'pdf'
    });

    const [busquedaEstudiante, setBusquedaEstudiante] = useState('');

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
            setClases([...(clasesRes.data || [])].sort((a, b) => b.anioLectivo - a.anioLectivo || a.nombreClase.localeCompare(b.nombreClase)));
        } catch (error) {
            console.error('Error cargando datos:', error);
            mostrarMensaje('Error al cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const mostrarMensaje = (texto, tipo) => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    const cambiarModoTitulo = (modo) => {
        setTituloProceso(prev => ({
            ...prev,
            modo,
            idEstudiante: '',
            idClase: ''
        }));
    };

    const formatosTituloProceso = [
        { valor: 'pdf', etiqueta: 'PDF' },
        { valor: 'word', etiqueta: 'Word (.docx)' }
    ];

    const generarTituloProceso = async () => {
        const { modo, idEstudiante, idClase, formato } = tituloProceso;
        
        if (modo === 'estudiante' && !idEstudiante) {
            mostrarMensaje('Seleccione un estudiante', 'error');
            return;
        }
        if (modo === 'clase' && !idClase) {
            mostrarMensaje('Seleccione una clase', 'error');
            return;
        }

        setGenerandoTitulo(true);
        setMensaje(null);
        try {
            if (modo === 'estudiante') {
                const timestamp = Date.now();
                const res = await API.get(`/constancias/generar/${idEstudiante}/${formato}?_t=${timestamp}`, {
                    responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                const nombreArchivo = formato === 'pdf' 
                    ? `titulo_en_proceso_${idEstudiante}.pdf`
                    : `titulo_en_proceso_${idEstudiante}.docx`;
                link.setAttribute('download', nombreArchivo);
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
                mostrarMensaje(`Título en Proceso generado en ${formato.toUpperCase()}`, 'success');
            } else {
                try {
                    const timestamp = Date.now();
                    const res = await API.get(`/constancias/generar/titulo-proceso/clase/${idClase}/${formato}?_t=${timestamp}`, {
                        responseType: 'blob'
                    });
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    const ext = formato === 'pdf' ? 'pdf' : 'docx';
                    link.setAttribute('download', `titulo_proceso_clase_${idClase}.${ext}`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    mostrarMensaje(`Título en Proceso por clase generado en ${formato.toUpperCase()} (documento combinado, 1 página por estudiante)`, 'success');
                } catch (err) {
                    console.error('Error generando por clase:', err);
                    mostrarMensaje(err.response?.data?.mensaje || 'Error al generar por clase', 'error');
                }
            }
        } catch (error) {
            console.error('Error generando Título en Proceso:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al generar el Título en Proceso', 'error');
        } finally {
            setGenerandoTitulo(false);
        }
    };

    const estudiantesTitulo = estudiantes.filter(e =>
        (!tituloProceso.idClase || e.idClase === parseInt(tituloProceso.idClase)) &&
        (!busquedaEstudiante.trim() ||
            `${e.nombres} ${e.apellidos} ${e.codigoEstudiante || ''} ${e.nie || ''}`.toLowerCase().includes(busquedaEstudiante.trim().toLowerCase()))
    );

    if (loading) {
        return (
            <DashboardLayout title="Título en Proceso">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Título en Proceso">
            <style>{`
                .tp-container { display: flex; flex-direction: column; gap: 20px; }
                .tp-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
                .tp-card h3 { margin: 0 0 16px; color: #2c3e50; }
                .tp-card h4 { margin: 16px 0 12px; color: #34495e; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
                .tp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
                .tp-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .tp-field input, .tp-field select, .tp-field textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box;
                }
                .tp-field input:disabled, .tp-field select:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
                .tp-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
                .tp-aviso { padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
                .tp-aviso.success { background: #d1fae5; color: #065f46; }
                .tp-aviso.error { background: #fee2e2; color: #991b1b; }
                .radio-group { display: flex; gap: 20px; margin-bottom: 12px; }
                .radio-group label { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: #34495e; }
                .radio-group input[type=radio] { width: 16px; height: 16px; accent-color: #3b82f6; }
                .tp-btn-primary { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
                .tp-btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
                .tp-divider { border-top: 2px solid #e2e8f0; margin: 24px 0; padding-top: 16px; }
                .tp-card-titulo { border-left: 4px solid #3b82f6; }
            `}</style>

            <div className="tp-container">
                {mensaje && <div className={`tp-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                <div className="tp-card tp-card-titulo">
                    <h3>Título en Proceso</h3>
                    <p style={{color: '#64748b', fontSize: '13px', marginBottom: '16px'}}>
                        Generar constancia de título en trámite para un estudiante específico o para toda una clase.
                    </p>

                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                name="modoTitulo"
                                value="estudiante"
                                checked={tituloProceso.modo === 'estudiante'}
                                onChange={() => cambiarModoTitulo('estudiante')}
                            />
                            Por Estudiante
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="modoTitulo"
                                value="clase"
                                checked={tituloProceso.modo === 'clase'}
                                onChange={() => cambiarModoTitulo('clase')}
                            />
                            Por Clase
                        </label>
                    </div>

                    <div className="tp-grid">
                        <div className="tp-field">
                            <label>Clase</label>
                            <select 
                                value={tituloProceso.idClase} 
                                onChange={(e) => setTituloProceso(prev => ({ ...prev, idClase: e.target.value, idEstudiante: '' }))}
                            >
                                <option value="">Seleccione una clase</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} (Sección {c.seccion}) - {c.anioLectivo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="tp-field" style={{ display: (tituloProceso.modo === 'estudiante' && tituloProceso.idClase) ? 'block' : 'none' }}>
                            <label>Estudiante</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, código o NIE..."
                                value={busquedaEstudiante}
                                onChange={(e) => setBusquedaEstudiante(e.target.value)}
                                style={{ marginBottom: '6px' }}
                            />
                            <select 
                                value={tituloProceso.idEstudiante} 
                                onChange={(e) => setTituloProceso(prev => ({ ...prev, idEstudiante: e.target.value }))}
                                disabled={tituloProceso.modo !== 'estudiante' || !tituloProceso.idClase}
                            >
                                <option value="">Seleccione un estudiante</option>
                                {estudiantesTitulo.map(e => (
                                    <option key={e.idEstudiante} value={e.idEstudiante}>
                                        {e.nombres} {e.apellidos} - {e.codigoEstudiante} - {e.nie}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="tp-field" style={{ display: tituloProceso.modo === 'clase' ? 'block' : 'none' }}>
                            <label>Clase</label>
                            <select 
                                value={tituloProceso.idClase} 
                                onChange={(e) => setTituloProceso(prev => ({ ...prev, idClase: e.target.value }))}
                                disabled={tituloProceso.modo !== 'clase'}
                            >
                                <option value="">Seleccione una clase</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} (Sección {c.seccion}) - {c.anioLectivo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="tp-field">
                            <label>Formato de salida</label>
                            <select value={tituloProceso.formato} onChange={(e) => setTituloProceso(prev => ({ ...prev, formato: e.target.value }))}>
                                {formatosTituloProceso.map(f => (
                                    <option key={f.valor} value={f.valor}>{f.etiqueta}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="tp-actions">
                        <button 
                            className="tp-btn-primary" 
                            onClick={generarTituloProceso} 
                            disabled={generandoTitulo || (tituloProceso.modo === 'estudiante' && !tituloProceso.idEstudiante) || (tituloProceso.modo === 'clase' && !tituloProceso.idClase)}
                        >
                            {generandoTitulo ? 'Generando...' : `Generar ${tituloProceso.formato.toUpperCase()}`}
                        </button>
                        <small style={{ display: 'block', marginTop: '8px', color: '#64748b', fontSize: '12px' }}>
                            {tituloProceso.modo === 'estudiante' 
                                ? 'Genera constancia individual para el estudiante seleccionado'
                                : 'Genera constancias para todos los estudiantes de la clase seleccionada (documento combinado, 1 página por estudiante)'}
                        </small>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GestionTituloEnProceso;