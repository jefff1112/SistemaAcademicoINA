
// Componente Exportar Boletas (Registro Académico): genera y descarga boletas de notas en PDF (formatos INA o MINED) por clase y periodo.
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import boletaService from '../../services/boletaService';
import DashboardLayout from '../Layout/DashboardLayout';

const ExportarBoletasRegistro = () => {
    // Estado de clases, periodos, estudiantes y selección de filtros de generación.
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [claseSeleccionada, setClaseSeleccionada] = useState('');
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
    const [formatoSeleccionado, setFormatoSeleccionado] = useState('INA');
    const [tipoSeleccionado, setTipoSeleccionado] = useState('periodo');
    const [cargando, setCargando] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [mensajeTipo, setMensajeTipo] = useState('success');

    // Carga clases y periodos académicos al montar el componente.
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // Recarga los estudiantes cuando cambia la clase seleccionada.
    useEffect(() => {
        if (claseSeleccionada) {
            cargarEstudiantes();
        }
    }, [claseSeleccionada]);

    // Obtiene clases y periodos en paralelo desde la API.
    const cargarDatosIniciales = async () => {
        setCargando(true);
        try {
            const [clasesRes, periodosRes] = await Promise.all([
                API.get('/clases'),
                API.get('/periodosacademicos')
            ]);
            setClases(clasesRes.data || []);
            setPeriodos(periodosRes.data || []);
        } catch (err) {
            mostrarMensaje('Error al cargar datos', 'danger');
        } finally {
            setCargando(false);
        }
    };

    // Obtiene los estudiantes de la clase seleccionada.
    const cargarEstudiantes = async () => {
        if (!claseSeleccionada) return;
        setCargando(true);
        try {
            const res = await API.get(`/estudiantes/clase/${claseSeleccionada}`);
            setEstudiantes(res.data || []);
        } catch (err) {
            mostrarMensaje('Error al cargar estudiantes', 'danger');
        } finally {
            setCargando(false);
        }
    };

    // Muestra un mensaje temporal de éxito, error o advertencia.
    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje(texto);
        setMensajeTipo(tipo);
        setTimeout(() => setMensaje(null), 4000);
    };

    // Valida los filtros y genera las boletas en PDF según el formato seleccionado.
    const generarBoletas = async () => {
        if (!claseSeleccionada) {
            mostrarMensaje('Seleccione una clase', 'warning');
            return;
        }
        if (tipoSeleccionado === 'periodo' && !periodoSeleccionado) {
            mostrarMensaje('Seleccione un periodo', 'warning');
            return;
        }
        if (estudiantes.length === 0) {
            mostrarMensaje('No hay estudiantes en esta clase', 'warning');
            return;
        }

        setGenerando(true);
        try {
            if (formatoSeleccionado === 'MINED') {
                await boletaService.generarPDFMined(
                    estudiantes,
                    parseInt(periodoSeleccionado || 0),
                    parseInt(claseSeleccionada),
                    tipoSeleccionado
                );
                mostrarMensaje('Boletas MINED generadas correctamente', 'success');
            } else {
                await boletaService.generarPDFINA(
                    estudiantes,
                    parseInt(periodoSeleccionado || 0),
                    parseInt(claseSeleccionada),
                    tipoSeleccionado
                );
                mostrarMensaje('Boletas INA generadas correctamente', 'success');
            }
        } catch (err) {
            console.error('Error al generar boletas:', err);
            mostrarMensaje('Error al generar las boletas', 'danger');
        } finally {
            setGenerando(false);
        }
    };

    return (
        <DashboardLayout title="Exportar Boletas - Registro">
            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: '1px solid #e9ecef',
                    padding: '24px'
                }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#212529' }}>
                        Exportar Boletas de Notas
                    </h4>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                        gap: '16px',
                        marginBottom: '20px'
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>
                                Clase
                            </label>
                            <select
                                value={claseSeleccionada}
                                onChange={(e) => setClaseSeleccionada(e.target.value)}
                                style={{ width: '100%', padding: '7px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', background: 'white' }}
                            >
                                <option value="">Seleccionar clase</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} - {c.seccion}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>
                                Periodo
                            </label>
                            <select
                                value={periodoSeleccionado}
                                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                                disabled={tipoSeleccionado === 'global'}
                                style={{ width: '100%', padding: '7px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', background: tipoSeleccionado === 'global' ? '#e9ecef' : 'white' }}
                            >
                                <option value="">{tipoSeleccionado === 'global' ? 'No aplica' : 'Seleccionar periodo'}</option>
                                {periodos.map(p => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>
                                Formato
                            </label>
                            <select
                                value={formatoSeleccionado}
                                onChange={(e) => setFormatoSeleccionado(e.target.value)}
                                style={{ width: '100%', padding: '7px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', background: 'white' }}
                            >
                                <option value="INA">INA (2 por página)</option>
                                <option value="MINED">MINED (1 por página)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>
                                Tipo de boleta
                            </label>
                            <select
                                value={tipoSeleccionado}
                                onChange={(e) => setTipoSeleccionado(e.target.value)}
                                style={{ width: '100%', padding: '7px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', background: 'white' }}
                            >
                                <option value="periodo">Por periodo</option>
                                <option value="global">Global (P1-P4)</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={generarBoletas}
                                disabled={generando || !claseSeleccionada || (tipoSeleccionado === 'periodo' && !periodoSeleccionado)}
                                style={{
                                    padding: '7px 24px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: generando || !claseSeleccionada || (tipoSeleccionado === 'periodo' && !periodoSeleccionado) ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    cursor: generando || !claseSeleccionada || (tipoSeleccionado === 'periodo' && !periodoSeleccionado) ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {generando ? 'Generando...' : 'Generar PDF'}
                            </button>
                        </div>
                    </div>

                    {mensaje && (
                        <div style={{
                            padding: '8px 14px',
                            borderRadius: '4px',
                            marginBottom: '16px',
                            fontSize: '13px',
                            background: mensajeTipo === 'success' ? '#d4edda' :
                                mensajeTipo === 'danger' ? '#f8d7da' :
                                    mensajeTipo === 'warning' ? '#fff3cd' : '#cce5ff',
                            color: mensajeTipo === 'success' ? '#155724' :
                                mensajeTipo === 'danger' ? '#721c24' :
                                    mensajeTipo === 'warning' ? '#856404' : '#004085'
                        }}>
                            {mensaje}
                        </div>
                    )}

                    {estudiantes.length > 0 && (
                        <div style={{
                            background: '#f8f9fa',
                            padding: '12px 16px',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '13px', color: '#495057' }}>
                                <strong>{estudiantes.length}</strong> estudiantes encontrados
                            </span>
                            <span style={{ fontSize: '12px', color: '#6c757d' }}>
                                Formato: {formatoSeleccionado === 'MINED' ? '1 boleta por página' : '2 boletas por página'}
                            </span>
                        </div>
                    )}

                    <div style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: '#e7f3ff',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: '#084298'
                    }}>
                        <strong>Nota:</strong> Seleccione una clase{formatoSeleccionado === 'INA'
                            ? ' y periodo para generar las boletas. El formato INA genera 2 boletas por página para ahorrar papel.'
                            : ' y periodo para generar las boletas. El formato MINED genera 1 boleta por página con el diseño oficial.'}
                        {tipoSeleccionado === 'global'
                            ? ' Tipo "Global" genera la boleta con P1-P4 y nota final del ciclo completo.'
                            : ' Tipo "Por periodo" genera la boleta solo con el periodo seleccionado y su nota final.'}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ExportarBoletasRegistro;