// Componente Gestión de Respaldos (Admin): lista los backups y permite crear nuevos.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra las copias de seguridad de la base de datos.
const RespaldosAdmin = () => {
    // Estados: respaldos existentes, indicador de carga y de creación en curso.
    const [respaldos, setRespaldos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creando, setCreando] = useState(false);
    const [eliminando, setEliminando] = useState(null);
    const [descargando, setDescargando] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    // Filtros
    const [busqueda, setBusqueda] = useState('');

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarRespaldos();
    }, []);

    const cargarRespaldos = async () => {
        setLoading(true);
        try {
            const response = await API.get('/respaldos');
            setRespaldos(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar los respaldos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    // ============================================================
    // CREAR RESPALDO
    // ============================================================
    const crearRespaldo = async () => {
        setCreando(true);
        try {
            await API.post('/respaldos');
            mostrarMensaje('Respaldo creado correctamente', 'success');
            cargarRespaldos();
        } catch (error) {
            let msg = 'Error al crear el respaldo';
            if (error.response?.data?.mensaje) msg = error.response.data.mensaje;
            else if (error.response?.data?.message) msg = error.response.data.message;
            mostrarMensaje(msg, 'error');
        } finally {
            setCreando(false);
        }
    };

    // ============================================================
    // DESCARGAR RESPALDO
    // ============================================================
    const descargarRespaldo = async (respaldo) => {
        setDescargando(respaldo.nombre);
        try {
            const response = await API.get(`/respaldos/${respaldo.nombre}/descargar`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', respaldo.nombre);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            mostrarMensaje('Respaldo descargado correctamente', 'success');
        } catch (error) {
            mostrarMensaje('Error al descargar el respaldo', 'error');
        } finally {
            setDescargando(null);
        }
    };

    // ============================================================
    // ELIMINAR RESPALDO
    // ============================================================
    const eliminarRespaldo = async (nombre) => {
        if (!window.confirm(`¿Eliminar el respaldo "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
        setEliminando(nombre);
        try {
            await API.delete(`/respaldos/${nombre}`);
            mostrarMensaje('Respaldo eliminado correctamente', 'success');
            cargarRespaldos();
        } catch (error) {
            mostrarMensaje('Error al eliminar el respaldo', 'error');
        } finally {
            setEliminando(null);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            const d = new Date(fecha);
            return d.toLocaleString('es-SV', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fecha;
        }
    };

    const formatearTamano = (bytes) => {
        if (!bytes && bytes !== 0) return '-';
        if (typeof bytes === 'string' && isNaN(Number(bytes))) return bytes;
        const b = Number(bytes);
        if (b < 1024) return `${b} B`;
        if (b < 1024 * 1024) return `${(b / 1024).toFixed(2)} KB`;
        if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
        return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const respaldosFiltrados = useMemo(() => {
        if (!busqueda) return respaldos;
        const term = busqueda.toLowerCase();
        return respaldos.filter(r =>
            r.nombre && r.nombre.toLowerCase().includes(term)
        );
    }, [respaldos, busqueda]);

    const stats = useMemo(() => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const creadosHoy = respaldos.filter(r => new Date(r.fecha) >= hoy).length;
        return {
            total: respaldos.length,
            hoy: creadosHoy
        };
    }, [respaldos]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Respaldos">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestion de Respaldos">
            <style>{`
                /* Forzar fondo blanco general */
                .gb-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }
                
                .gb-card { 
                    background: #ffffff; 
                    border-radius: 12px; 
                    padding: 22px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03); 
                    border: 1px solid #e2e8f0; 
                }
                .gb-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .gb-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .gb-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff; }
                .gb-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gb-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gb-stat-total { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
                .gb-stat-hoy { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }

                /* Filtros */
                .gb-filtros { display: grid; grid-template-columns: 1fr; gap: 14px; }
                .gb-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gb-field input {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                }
                .gb-field input:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .gb-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .gb-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gb-btn-primary { background: #1e3a5f; color: #fff; }
                .gb-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gb-btn-info { background: #3b82f6; color: #fff; }
                .gb-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gb-btn-danger { background: #dc2626; color: #fff; }
                .gb-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gb-btn-secondary { background: #e5e7eb; color: #334155; }
                .gb-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gb-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla - FORZAR FONDO BLANCO */
                .gb-tabla { width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff !important; }
                .gb-tabla thead th {
                    background: #f8fafc !important; 
                    color: #1e293b !important; 
                    padding: 12px 10px;
                    text-align: left; 
                    font-size: 11px; 
                    text-transform: uppercase;
                    letter-spacing: .5px; 
                    font-weight: 700;
                    border-bottom: 2px solid #cbd5e1;
                }
                .gb-tabla tbody tr { 
                    border-bottom: 1px solid #e2e8f0; 
                    background-color: #ffffff !important; 
                }
                .gb-tabla tbody tr:hover { background-color: #f1f5f9 !important; }
                .gb-tabla td { 
                    padding: 12px 10px; 
                    color: #1e293b !important; 
                    vertical-align: middle; 
                    background-color: #ffffff !important;
                }
                .gb-tabla tbody tr:hover td { 
                    background-color: #f1f5f9 !important;
                }
                .gb-tabla td.col-nombre { 
                    font-weight: 600; 
                    color: #0f172a !important; 
                    font-family: monospace;
                    font-size: 12px;
                }
                .gb-tabla td.col-fecha {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                    white-space: nowrap;
                }
                .gb-tabla td.col-tamano {
                    font-family: monospace;
                    font-size: 12px;
                    color: #475569 !important;
                    white-space: nowrap;
                }

                .gb-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gb-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gb-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gb-empty { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
                .gb-empty h3 { color: #334155; margin: 0 0 8px; }

                .gb-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }

                .gb-info-box {
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
                    background: #fef3c7; border-left: 4px solid #e67e22; color: #b45309;
                }

                .gb-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 600px) {
                    .gb-tabla { font-size: 12px; }
                    .gb-tabla thead th, .gb-tabla td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gb-container">
                {mensaje && <div className={`gb-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gb-stats">
                    <div className="gb-stat gb-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Respaldos</span>
                    </div>
                    <div className="gb-stat gb-stat-hoy">
                        <span className="num">{stats.hoy}</span>
                        <span className="lbl">Creados Hoy</span>
                    </div>
                </div>

                {/* FILTROS Y ACCIONES */}
                <div className="gb-card">
                    <h3>Filtros y Acciones</h3>

                    <div className="gb-info-box">
                        Los respaldos contienen una copia completa de la base de datos del sistema. Se recomienda crear respaldos periódicamente y almacenarlos en un lugar seguro.
                    </div>

                    <div className="gb-filtros">
                        <div className="gb-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre de archivo..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="gb-toolbar" style={{ marginTop: '14px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                className="gb-btn gb-btn-primary"
                                onClick={crearRespaldo}
                                disabled={creando}
                            >
                                {creando ? 'Creando...' : 'Nuevo Respaldo'}
                            </button>
                            <button className="gb-btn gb-btn-secondary" onClick={cargarRespaldos}>
                                Recargar
                            </button>
                            {busqueda && (
                                <button className="gb-btn gb-btn-secondary" onClick={() => setBusqueda('')}>
                                    Limpiar Filtro
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{respaldosFiltrados.length}</strong> de {respaldos.length} respaldos
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gb-card">
                    <h3>Respaldos Disponibles</h3>

                    {respaldosFiltrados.length === 0 ? (
                        <div className="gb-empty">
                            <h3>No hay respaldos que coincidan</h3>
                            <p>Prueba ajustando el filtro o crea un nuevo respaldo.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="gb-tabla">
                                <thead>
                                    <tr>
                                        <th>Nombre del Archivo</th>
                                        <th style={{ width: '180px' }}>Fecha</th>
                                        <th style={{ width: '120px' }}>Tamaño</th>
                                        <th style={{ width: '200px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {respaldosFiltrados.map((r, index) => (
                                        <tr key={index}>
                                            <td className="col-nombre">{r.nombre}</td>
                                            <td className="col-fecha">{formatearFecha(r.fecha)}</td>
                                            <td className="col-tamano">{formatearTamano(r.tamano)}</td>
                                            <td>
                                                <div className="gb-acciones">
                                                    <button
                                                        className="gb-btn gb-btn-info gb-btn-sm"
                                                        onClick={() => descargarRespaldo(r)}
                                                        disabled={descargando === r.nombre}
                                                    >
                                                        {descargando === r.nombre ? 'Descargando...' : 'Descargar'}
                                                    </button>
                                                    <button
                                                        className="gb-btn gb-btn-danger gb-btn-sm"
                                                        onClick={() => eliminarRespaldo(r.nombre)}
                                                        disabled={eliminando === r.nombre}
                                                    >
                                                        {eliminando === r.nombre ? 'Eliminando...' : 'Eliminar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RespaldosAdmin;