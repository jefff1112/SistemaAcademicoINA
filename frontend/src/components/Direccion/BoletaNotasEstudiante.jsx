// Componente BoletaNotasEstudiante (Dirección): selecciona clase, periodo y estudiante,
// y genera el PDF de la boleta de notas individual en formato INA o MINED.
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import boletaService from '../../services/boletaService';
import DashboardLayout from '../Layout/DashboardLayout';

const BoletaNotasEstudiante = ({ titulo = 'Boleta de Notas - Dirección' }) => {
    const [clases, setClases] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [claseSeleccionada, setClaseSeleccionada] = useState('');
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState('');
    const [formatoSeleccionado, setFormatoSeleccionado] = useState('INA');
    const [tipoSeleccionado, setTipoSeleccionado] = useState('periodo');
    const [cargando, setCargando] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [mensajeTipo, setMensajeTipo] = useState('success');

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    useEffect(() => {
        if (claseSeleccionada) {
            cargarEstudiantes();
        } else {
            setEstudiantes([]);
            setEstudianteSeleccionado('');
        }
    }, [claseSeleccionada]);

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

    const cargarEstudiantes = async () => {
        if (!claseSeleccionada) return;
        setCargando(true);
        try {
            const res = await API.get(`/estudiantes/clase/${claseSeleccionada}`);
            setEstudiantes(res.data || []);
            setEstudianteSeleccionado('');
        } catch (err) {
            mostrarMensaje('Error al cargar estudiantes', 'danger');
        } finally {
            setCargando(false);
        }
    };

    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje(texto);
        setMensajeTipo(tipo);
        setTimeout(() => setMensaje(null), 4000);
    };

    const generarBoleta = async () => {
        if (!claseSeleccionada) {
            mostrarMensaje('Seleccione una clase', 'warning');
            return;
        }
        if (!estudianteSeleccionado) {
            mostrarMensaje('Seleccione un estudiante', 'warning');
            return;
        }
        if (tipoSeleccionado === 'periodo' && !periodoSeleccionado) {
            mostrarMensaje('Seleccione un periodo', 'warning');
            return;
        }

        const estudiante = estudiantes.find(e => String(e.idEstudiante) === String(estudianteSeleccionado));
        if (!estudiante) {
            mostrarMensaje('Estudiante no encontrado', 'danger');
            return;
        }

        setGenerando(true);
        try {
            if (formatoSeleccionado === 'MINED') {
                await boletaService.generarPDFMined(
                    [estudiante],
                    parseInt(periodoSeleccionado || 0),
                    parseInt(claseSeleccionada),
                    tipoSeleccionado
                );
            } else {
                await boletaService.generarPDFINA(
                    [estudiante],
                    parseInt(periodoSeleccionado || 0),
                    parseInt(claseSeleccionada),
                    tipoSeleccionado
                );
            }
            mostrarMensaje('Boleta generada correctamente', 'success');
        } catch (err) {
            console.error('Error al generar boleta:', err);
            mostrarMensaje('Error al generar la boleta', 'danger');
        } finally {
            setGenerando(false);
        }
    };

    const estudianteActual = estudiantes.find(e => String(e.idEstudiante) === String(estudianteSeleccionado));

    return (
        <DashboardLayout title={titulo}>
            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: '1px solid #e9ecef',
                    padding: '24px'
                }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#212529' }}>
                        Boleta de Notas por Estudiante
                    </h4>

                    {/* FILTROS */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto',
                        gap: '16px',
                        marginBottom: '20px'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#495057',
                                marginBottom: '4px'
                            }}>
                                Clase
                            </label>
                            <select
                                value={claseSeleccionada}
                                onChange={(e) => setClaseSeleccionada(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '7px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ced4da',
                                    fontSize: '14px',
                                    background: 'white'
                                }}
                            >
                                <option value="">Seleccionar clase</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} - {c.anioLectivo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#495057',
                                marginBottom: '4px'
                            }}>
                                Estudiante
                            </label>
                            <select
                                value={estudianteSeleccionado}
                                onChange={(e) => setEstudianteSeleccionado(e.target.value)}
                                disabled={!claseSeleccionada}
                                style={{
                                    width: '100%',
                                    padding: '7px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ced4da',
                                    fontSize: '14px',
                                    background: claseSeleccionada ? 'white' : '#e9ecef'
                                }}
                            >
                                <option value="">{claseSeleccionada ? 'Seleccionar estudiante' : 'Primero seleccione clase'}</option>
                                {estudiantes.map(e => (
                                    <option key={e.idEstudiante} value={e.idEstudiante}>
                                        {e.apellidos}, {e.nombres} - {e.codigoEstudiante}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#495057',
                                marginBottom: '4px'
                            }}>
                                Periodo
                            </label>
                            <select
                                value={periodoSeleccionado}
                                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                                disabled={tipoSeleccionado === 'global'}
                                style={{
                                    width: '100%',
                                    padding: '7px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ced4da',
                                    fontSize: '14px',
                                    background: tipoSeleccionado === 'global' ? '#e9ecef' : 'white'
                                }}
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
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#495057',
                                marginBottom: '4px'
                            }}>
                                Formato
                            </label>
                            <select
                                value={formatoSeleccionado}
                                onChange={(e) => setFormatoSeleccionado(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '7px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ced4da',
                                    fontSize: '14px',
                                    background: 'white'
                                }}
                            >
                                <option value="INA">INA (2 por página)</option>
                                <option value="MINED">MINED (1 por página)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#495057',
                                marginBottom: '4px'
                            }}>
                                Tipo de boleta
                            </label>
                            <select
                                value={tipoSeleccionado}
                                onChange={(e) => setTipoSeleccionado(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '7px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ced4da',
                                    fontSize: '14px',
                                    background: 'white'
                                }}
                            >
                                <option value="periodo">Por periodo</option>
                                <option value="global">Global (P1-P4)</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={generarBoleta}
                                disabled={generando || !claseSeleccionada || !estudianteSeleccionado || (tipoSeleccionado === 'periodo' && !periodoSeleccionado)}
                                style={{
                                    padding: '7px 24px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: generando || !claseSeleccionada || !estudianteSeleccionado || (tipoSeleccionado === 'periodo' && !periodoSeleccionado)
                                        ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    cursor: generando || !claseSeleccionada || !estudianteSeleccionado || (tipoSeleccionado === 'periodo' && !periodoSeleccionado)
                                        ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                {generando ? 'Generando...' : 'Generar PDF'}
                            </button>
                        </div>
                    </div>

                    {/* MENSAJES */}
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

                    {/* INFO DEL ESTUDIANTE */}
                    {estudianteActual && (
                        <div style={{
                            background: '#f8f9fa',
                            padding: '12px 16px',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '13px', color: '#495057' }}>
                                <strong>{estudianteActual.apellidos}, {estudianteActual.nombres}</strong> - {estudianteActual.codigoEstudiante}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6c757d' }}>
                                Formato: {formatoSeleccionado === 'MINED' ? '1 boleta por página' : '2 boletas por página'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BoletaNotasEstudiante;