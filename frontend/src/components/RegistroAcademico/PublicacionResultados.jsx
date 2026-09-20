// Componente Publicación de Resultados (Registro Académico)
// Muestra y exporta la lista de aspirantes con su estado por especialidad.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const PublicacionResultados = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [aspirantes, setAspirantes] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterEspecialidad, setFilterEspecialidad] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [generandoPdf, setGenerandoPdf] = useState(false);

    // ID fijo para "Bachillerato General" (ajústalo si tu BD usa otro)
    const ID_BACHILLERATO_GENERAL = 5;

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [aspirantesRes, especialidadesRes] = await Promise.all([
                API.get('/publicacion-resultados/aspirantes'),
                API.get('/publicacion-resultados/especialidades')
            ]);
            setAspirantes(aspirantesRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
            mostrarMensaje('Error al cargar los datos', 'error');
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
    // HELPERS
    // ============================================================
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Aprobado':
                return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Rechazado':
                return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'En Espera':
                return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Preseleccionado':
                return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            default:
                return { bg: '#f1f5f9', color: '#475569', border: '#64748b' };
        }
    };

    // Construye la lista de especialidades para el filtro,
    // agregando "Bachillerato General" si no viene del backend.
    const especialidadesConBachillerato = (() => {
        const lista = [...especialidades];
        const yaExiste = lista.some(
            (e) => e.nombreEspecialidad?.toLowerCase().includes('bachillerato general')
        );
        if (!yaExiste) {
            lista.push({
                idEspecialidad: ID_BACHILLERATO_GENERAL,
                nombreEspecialidad: 'Bachillerato General'
            });
        }
        return lista;
    })();

    // ============================================================
    // FILTROS
    // ============================================================
    const aspirantesFiltrados = aspirantes.filter((a) => {
        // Filtro por especialidad
        let cumpleEspecialidad = true;
        if (filterEspecialidad) {
            const filtro = parseInt(filterEspecialidad, 10);
            if (filtro === ID_BACHILLERATO_GENERAL) {
                // Bachillerato General: incluye a los que tengan ese ID o estén sin especialidad
                cumpleEspecialidad =
                    a.especialidadAspira === ID_BACHILLERATO_GENERAL ||
                    a.especialidadAspira == null;
            } else {
                cumpleEspecialidad = a.especialidadAspira === filtro;
            }
        }

        // Filtro por búsqueda (nombre, apellido o NIE)
        const termino = busqueda.trim().toLowerCase();
        const cumpleBusqueda =
            !termino ||
            (a.nombres && a.nombres.toLowerCase().includes(termino)) ||
            (a.apellidos && a.apellidos.toLowerCase().includes(termino)) ||
            (a.nie && String(a.nie).toLowerCase().includes(termino));

        return cumpleEspecialidad && cumpleBusqueda;
    });

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================
    const stats = {
        total: aspirantesFiltrados.length,
        aprobados: aspirantesFiltrados.filter((a) => a.estadoSolicitud === 'Aprobado').length,
        rechazados: aspirantesFiltrados.filter((a) => a.estadoSolicitud === 'Rechazado').length,
        enEspera: aspirantesFiltrados.filter((a) => a.estadoSolicitud === 'En Espera').length,
        preseleccionados: aspirantesFiltrados.filter((a) => a.estadoSolicitud === 'Preseleccionado')
            .length
    };

    // ============================================================
    // EXPORTAR A EXCEL
    // ============================================================
    const exportarExcel = () => {
        if (aspirantesFiltrados.length === 0) {
            mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }

        const data = aspirantesFiltrados.map((a) => ({
            ID: a.idAspirante,
            Nombres: a.nombres,
            Apellidos: a.apellidos,
            NIE: a.nie || '-',
            Especialidad: a.nombreEspecialidad || '-',
            'Nota Examen': a.notaExamen != null ? Number(a.notaExamen).toFixed(2) : '-',
            Estado: a.estadoSolicitud || 'Pendiente'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
        XLSX.writeFile(wb, `resultados_${new Date().toISOString().split('T')[0]}.xlsx`);
        mostrarMensaje('Lista exportada a Excel', 'success');
    };

    // ============================================================
    // EXPORTAR A PDF
    // ============================================================
    const exportarPdf = async () => {
        if (aspirantesFiltrados.length === 0) {
            mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }

        setGenerandoPdf(true);
        try {
            const params = filterEspecialidad ? { idEspecialidad: filterEspecialidad } : {};
            const response = await API.get('/publicacion-resultados/generar-pdf', {
                params,
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `publicacion_resultados_${new Date()
                .toISOString()
                .split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            mostrarMensaje('PDF generado exitosamente', 'success');
        } catch (error) {
            console.error('Error generando PDF:', error);

            // Manejo del error cuando viene como Blob
            if (error.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        mostrarMensaje(errorData.mensaje || 'Error al generar PDF', 'error');
                    } catch (e) {
                        mostrarMensaje('Error al generar PDF', 'error');
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                mostrarMensaje(
                    error.response?.data?.mensaje || 'Error al generar PDF',
                    'error'
                );
            }
        } finally {
            setGenerandoPdf(false);
        }
    };

    // ============================================================
    // RENDER: LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Publicación de Resultados">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Publicación de Resultados - Registro Académico">
            <style>{`
                .pr-container { display: flex; flex-direction: column; gap: 20px; }
                .pr-card {
                    background: #fff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 2px 10px rgba(0,0,0,.06);
                    border: 1px solid #e2e8f0;
                }
                .pr-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .pr-header h3 { margin: 0; color: #1e3a5f; font-size: 18px; }
                .pr-filtros { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
                .pr-input, .pr-select {
                    padding: 9px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 14px;
                    background: #fff;
                    transition: border-color .2s, box-shadow .2s;
                }
                .pr-input:focus, .pr-select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .pr-btn {
                    padding: 9px 16px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all .2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                .pr-btn:disabled { opacity: .6; cursor: not-allowed; }
                .pr-btn-excel { background: #16a34a; color: #fff; }
                .pr-btn-excel:hover:not(:disabled) { background: #15803d; }
                .pr-btn-pdf { background: #dc2626; color: #fff; }
                .pr-btn-pdf:hover:not(:disabled) { background: #b91c1c; }
                .pr-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    gap: 12px;
                    margin-bottom: 4px;
                }
                .pr-stat {
                    padding: 14px;
                    border-radius: 10px;
                    text-align: center;
                    border: 1px solid #e2e8f0;
                }
                .pr-stat .num {
                    font-size: 24px;
                    font-weight: bold;
                    display: block;
                    line-height: 1.2;
                }
                .pr-stat .lbl {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    opacity: .8;
                }
                .pr-stat-total { background: #f1f5f9; color: #334155; }
                .pr-stat-aprobados { background: #dcfce7; color: #15803d; }
                .pr-stat-rechazados { background: #fee2e2; color: #b91c1c; }
                .pr-stat-espera { background: #fef3c7; color: #b45309; }
                .pr-stat-preseleccionados { background: #dbeafe; color: #1d4ed8; }
                .pr-table { width: 100%; border-collapse: collapse; }
                .pr-table thead th {
                    background: #1e3a5f;
                    color: #fff;
                    padding: 12px 10px;
                    text-align: left;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    font-weight: 600;
                }
                .pr-table thead th:first-child { border-top-left-radius: 8px; }
                .pr-table thead th:last-child { border-top-right-radius: 8px; }
                .pr-table tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    transition: background .15s;
                }
                .pr-table tbody tr:hover { background: #f8fafc; }
                .pr-table tbody tr:nth-child(even) { background: #fafbfc; }
                .pr-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .pr-table td { padding: 10px; font-size: 13px; color: #334155; }
                .pr-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .pr-empty { text-align: center; padding: 40px; color: #94a3b8; }
                .pr-aviso {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    font-weight: 500;
                }
                .pr-aviso.success {
                    background: #dcfce7;
                    color: #15803d;
                    border-left: 4px solid #16a34a;
                }
                .pr-aviso.error {
                    background: #fee2e2;
                    color: #b91c1c;
                    border-left: 4px solid #dc2626;
                }
                @media (max-width: 768px) {
                    .pr-header { flex-direction: column; align-items: stretch; }
                    .pr-filtros { flex-direction: column; }
                    .pr-input, .pr-select { width: 100%; }
                    .pr-table { font-size: 12px; }
                    .pr-table thead th, .pr-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="pr-container">
                {message && <div className={`pr-aviso ${messageType}`}>{message}</div>}

                {/* Tarjetas de estadísticas */}
                <div className="pr-stats">
                    <div className="pr-stat pr-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total</span>
                    </div>
                    <div className="pr-stat pr-stat-aprobados">
                        <span className="num">{stats.aprobados}</span>
                        <span className="lbl">Aprobados</span>
                    </div>
                    <div className="pr-stat pr-stat-rechazados">
                        <span className="num">{stats.rechazados}</span>
                        <span className="lbl">Rechazados</span>
                    </div>
                    <div className="pr-stat pr-stat-espera">
                        <span className="num">{stats.enEspera}</span>
                        <span className="lbl">En Espera</span>
                    </div>
                    <div className="pr-stat pr-stat-preseleccionados">
                        <span className="num">{stats.preseleccionados}</span>
                        <span className="lbl">Preseleccionados</span>
                    </div>
                </div>

                {/* Tabla de aspirantes */}
                <div className="pr-card">
                    <div className="pr-header">
                        <h3>Lista de Aspirantes</h3>
                        <div className="pr-filtros">
                            <input
                                type="text"
                                className="pr-input"
                                placeholder="Buscar por nombre o NIE..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={{ minWidth: '220px' }}
                            />
                            <select
                                value={filterEspecialidad}
                                onChange={(e) => setFilterEspecialidad(e.target.value)}
                                className="pr-select"
                            >
                                <option value="">Todas las especialidades</option>
                                {especialidadesConBachillerato.map((e) => (
                                    <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                        {e.nombreEspecialidad}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="pr-btn pr-btn-excel"
                                onClick={exportarExcel}
                                title="Exportar a Excel"
                            >
                                Exportar Excel
                            </button>
                            <button
                                className="pr-btn pr-btn-pdf"
                                onClick={exportarPdf}
                                disabled={generandoPdf}
                                title="Exportar a PDF"
                            >
                                {generandoPdf ? 'Generando...' : 'Exportar PDF'}
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="pr-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>ID</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th style={{ width: '110px' }}>NIE</th>
                                    <th>Especialidad</th>
                                    <th style={{ width: '80px', textAlign: 'center' }}>Nota</th>
                                    <th style={{ width: '140px', textAlign: 'center' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aspirantesFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="pr-empty">
                                            No se encontraron aspirantes con los filtros aplicados
                                        </td>
                                    </tr>
                                ) : (
                                    aspirantesFiltrados.map((a) => {
                                        const colors = getEstadoColor(a.estadoSolicitud);
                                        return (
                                            <tr key={a.idAspirante}>
                                                <td
                                                    style={{
                                                        textAlign: 'center',
                                                        color: '#64748b'
                                                    }}
                                                >
                                                    {a.idAspirante}
                                                </td>
                                                <td>
                                                    <strong>{a.nombres}</strong>
                                                </td>
                                                <td>{a.apellidos}</td>
                                                <td
                                                    style={{
                                                        textAlign: 'center',
                                                        fontFamily: 'monospace',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {a.nie || '-'}
                                                </td>
                                                <td>{a.nombreEspecialidad || '-'}</td>
                                                <td
                                                    style={{
                                                        textAlign: 'center',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {a.notaExamen != null
                                                        ? Number(a.notaExamen).toFixed(2)
                                                        : '-'}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        className="pr-badge"
                                                        style={{
                                                            backgroundColor: colors.bg,
                                                            color: colors.color,
                                                            border: `1px solid ${colors.border}`
                                                        }}
                                                    >
                                                        {a.estadoSolicitud || 'Pendiente'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PublicacionResultados;