// Componente BoletaNotasEstudiante (Estudiante): vista de su propia boleta de notas en formato INA o MINED.
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import boletaService from '../../services/boletaService';
import DashboardLayout from '../Layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

const BoletaNotasEstudiante = ({ titulo = 'Mi Boleta de Notas' }) => {
    const { user } = useAuth();
    const [periodos, setPeriodos] = useState([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
    const [formatoSeleccionado, setFormatoSeleccionado] = useState('INA');
    const [tipoSeleccionado, setTipoSeleccionado] = useState('periodo');
    const [generando, setGenerando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [mensajeTipo, setMensajeTipo] = useState('success');

    useEffect(() => {
        cargarPeriodos();
    }, []);

    const cargarPeriodos = async () => {
        try {
            const res = await API.get('/periodosacademicos');
            setPeriodos(res.data || []);
        } catch (err) {
            console.error('Error cargando periodos:', err);
        }
    };

    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje(texto);
        setMensajeTipo(tipo);
        setTimeout(() => setMensaje(null), 4000);
    };

    const generarBoleta = async () => {
        if (!periodoSeleccionado && tipoSeleccionado === 'periodo') {
            mostrarMensaje('Seleccione un periodo', 'warning');
            return;
        }

        setGenerando(true);
        try {
            if (formatoSeleccionado === 'MINED') {
                await boletaService.generarPDFMined(
                    [user],
                    parseInt(periodoSeleccionado || 0),
                    user.idClase || 0,
                    tipoSeleccionado
                );
            } else {
                await boletaService.generarPDFINA(
                    [user],
                    parseInt(periodoSeleccionado || 0),
                    user.idClase || 0,
                    tipoSeleccionado
                );
            }
            mostrarMensaje('Boleta generada correctamente', 'success');
        } catch (err) {
            console.error('Error al generar boleta:', err);
            mostrarMensaje('Error al generar la boleta', 'danger');
        }
    };

    return (
        <DashboardLayout title={titulo}>
            <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: '1px solid #e9ecef',
                    padding: '24px'
                }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#212529' }}>
                        Mi Boleta de Notas
                    </h4>

                    {/* FILTROS */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr auto',
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
                                disabled={generando || (tipoSeleccionado === 'periodo' && !periodoSeleccionado)}
                                style={{
                                    padding: '7px 24px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: generando || (tipoSeleccionado === 'periodo' && !periodoSeleccionado)
                                        ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    cursor: generando || (tipoSeleccionado === 'periodo' && !periodoSeleccionado)
                                        ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                {generando ? 'Generando...' : 'Generar mi Boleta'}
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
                    <div style={{
                        background: '#f8f9fa',
                        padding: '12px 16px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '13px', color: '#495057' }}>
                            <strong>{user?.nombres} {user?.apellidos}</strong> - {user?.codigo}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6c757d' }}>
                            Formato: {formatoSeleccionado === 'MINED' ? '1 boleta por página' : '2 boletas por página'}
                        </span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BoletaNotasEstudiante;