// Componente Gestión de Entrevistas (Dirección) - MEJORADO
// Programa entrevistas y aprueba o rechaza aspirantes.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionEntrevistas = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [aspirantesPendientes, setAspirantesPendientes] = useState([]);
    const [entrevistasProgramadas, setEntrevistasProgramadas] = useState([]);
    const [entrevistadores, setEntrevistadores] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Filtros
    const [busquedaPendientes, setBusquedaPendientes] = useState('');
    const [filterEstadoEntrevista, setFilterEstadoEntrevista] = useState('todas');
    const [busquedaEntrevistas, setBusquedaEntrevistas] = useState('');

    // Modal Programar
    const [showModal, setShowModal] = useState(false);
    const [selectedAspirante, setSelectedAspirante] = useState(null);
    const [formData, setFormData] = useState({
        fechaEntrevista: '',
        entrevistador: ''
    });

    // Modal Resultado
    const [showResultadoModal, setShowResultadoModal] = useState(false);
    const [selectedEntrevista, setSelectedEntrevista] = useState(null);
    const [clasesDisponibles, setClasesDisponibles] = useState([]);
    const [claseSeleccionada, setClaseSeleccionada] = useState('');
    const [resultadoData, setResultadoData] = useState({
        aprobado: true,
        observaciones: '',
        motivoRechazo: ''
    });

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [aspirantesRes, entrevistasRes, docentesRes, especialidadesRes] = await Promise.all([
                API.get('/aspirantes'),
                API.get('/entrevistas'),
                API.get('/docentes'),
                API.get('/clases/especialidades')
            ]);
            const pendientes = aspirantesRes.data.filter(a => a.estadoSolicitud === 'Pendiente');
            setAspirantesPendientes(pendientes);
            setEntrevistasProgramadas(entrevistasRes.data || []);
            setEntrevistadores(docentesRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
        } catch (error) {
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
    // HELPERS
    // ============================================================
    const getEspecialidadNombre = (id) => {
        if (!id) return 'Bachillerato General';
        const esp = especialidades.find(e => e.idEspecialidad === Number(id));
        return esp ? esp.nombreEspecialidad : '-';
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-SV', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'Aprobado': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a', label: 'Aprobado' };
            case 'Rechazado': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626', label: 'Rechazado' };
            case 'En Espera':
            case 'Programada':
            default: return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6', label: 'Programada' };
        }
    };

    // ============================================================
    // PROGRAMAR ENTREVISTA
    // ============================================================
    const handleProgramar = async (e) => {
        e.preventDefault();
        if (!selectedAspirante) return;
        if (!formData.fechaEntrevista) {
            mostrarMensaje('Seleccione una fecha para la entrevista', 'error');
            return;
        }
        if (!formData.entrevistador.trim()) {
            mostrarMensaje('Ingrese el nombre del entrevistador', 'error');
            return;
        }

        setSaving(true);
        try {
            const nieVal = selectedAspirante?.nie && String(selectedAspirante.nie).trim();
            if (nieVal) {
                try {
                    const estudiantesResp = await API.get('/estudiantes');
                    const estudiantes = estudiantesResp.data || [];
                    const exists = estudiantes.find(s => s.nie && String(s.nie).trim() === nieVal);
                    if (exists) {
                        mostrarMensaje(`El alumno ya está registrado en la sección ${exists.seccion || exists.idSeccion || 'N/A'}`, 'error');
                        return;
                    }
                } catch (err) {
                    console.error('Error comprobando estudiantes existentes', err);
                }
            }

            await API.post('/entrevistas/programar', {
                idAspirante: selectedAspirante.idAspirante,
                fechaEntrevista: formData.fechaEntrevista,
                entrevistador: formData.entrevistador
            });
            mostrarMensaje('Entrevista programada correctamente', 'success');
            setShowModal(false);
            setSelectedAspirante(null);
            setFormData({ fechaEntrevista: '', entrevistador: '' });
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al programar entrevista', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // APROBAR
    // ============================================================
    const handleAceptar = async () => {
        if (!selectedEntrevista) return;
        if (!resultadoData.observaciones.trim()) {
            mostrarMensaje('Ingrese las observaciones de la entrevista', 'error');
            return;
        }
        const idAspirante = selectedEntrevista.idAspirante || selectedEntrevista.id;
        const clase = clasesDisponibles.find(c => c.idClase === parseInt(claseSeleccionada)) || clasesDisponibles[0];
        if (!clase) {
            mostrarMensaje('No hay clases con cupo disponible para la especialidad del aspirante', 'error');
            return;
        }

        setSaving(true);
        try {
            await API.put(`/aspirantes/aprobar/${idAspirante}`, {
                idClaseAsignada: clase.idClase,
                aprobadoPor: 'Direccion'
            });

            await API.post('/entrevistas/registrar-resultado', {
                idAspirante,
                aprobado: true,
                observaciones: resultadoData.observaciones,
                motivoRechazo: null
            });

            mostrarMensaje('Aspirante aprobado. La matrícula la realizará Registro Académico', 'success');
            setShowResultadoModal(false);
            setSelectedEntrevista(null);
            setClasesDisponibles([]);
            setClaseSeleccionada('');
            setResultadoData({ aprobado: true, observaciones: '', motivoRechazo: '' });
            cargarDatos();
        } catch (error) {
            console.error('Error aprobando aspirante:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al aprobar', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // RECHAZAR
    // ============================================================
    const handleRechazar = async () => {
        if (!selectedEntrevista) return;
        if (!resultadoData.motivoRechazo.trim()) {
            mostrarMensaje('Ingrese el motivo del rechazo', 'error');
            return;
        }

        setSaving(true);
        try {
            await API.post('/entrevistas/registrar-resultado', {
                idAspirante: selectedEntrevista.idAspirante || selectedEntrevista.id,
                aprobado: false,
                observaciones: resultadoData.observaciones,
                motivoRechazo: resultadoData.motivoRechazo
            });

            await API.put(`/aspirantes/rechazar/${selectedEntrevista.idAspirante || selectedEntrevista.id}`, {
                rechazadoPor: 'Direccion',
                motivo: resultadoData.motivoRechazo
            });

            mostrarMensaje('Aspirante rechazado', 'success');
            setShowResultadoModal(false);
            setSelectedEntrevista(null);
            setClasesDisponibles([]);
            setClaseSeleccionada('');
            setResultadoData({ aprobado: true, observaciones: '', motivoRechazo: '' });
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al rechazar', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ABRIR MODAL RESULTADO
    // ============================================================
    const abrirResultadoModal = async (entrevista) => {
        setSelectedEntrevista(entrevista);
        setResultadoData({
            aprobado: true,
            observaciones: '',
            motivoRechazo: ''
        });
        setClasesDisponibles([]);
        setClaseSeleccionada('');
        setShowResultadoModal(true);

        const idAspirante = entrevista.idAspirante || entrevista.id;
        try {
            const [aspRes, clasesRes] = await Promise.all([
                API.get(`/aspirantes/${idAspirante}`),
                API.get('/clases')
            ]);
            const aspirante = aspRes.data || {};
            const anio = new Date().getFullYear();
            const disponibles = (clasesRes.data || []).filter(c =>
                c.idEspecialidad === aspirante.especialidadAspira
                && c.estado
                && (c.anioLectivo === anio || c.anioLectivoActual === anio)
                && (c.cupoActual ?? 0) < (c.cupoMaximo ?? 0)
            );
            setClasesDisponibles(disponibles);
            if (disponibles.length > 0) setClaseSeleccionada(disponibles[0].idClase);
        } catch (error) {
            console.error('Error cargando clases del aspirante:', error);
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const aspirantesFiltrados = useMemo(() => {
        const term = busquedaPendientes.trim().toLowerCase();
        if (!term) return aspirantesPendientes;
        return aspirantesPendientes.filter(a =>
            `${a.nombres} ${a.apellidos}`.toLowerCase().includes(term) ||
            (a.correo && a.correo.toLowerCase().includes(term)) ||
            (a.nie && String(a.nie).toLowerCase().includes(term))
        );
    }, [aspirantesPendientes, busquedaPendientes]);

    const entrevistasFiltradas = useMemo(() => {
        return entrevistasProgramadas.filter(e => {
            // Filtro por estado
            if (filterEstadoEntrevista !== 'todas') {
                const estado = e.estado === 'En Espera' ? 'Programada' : (e.estado || 'Programada');
                if (estado !== filterEstadoEntrevista) return false;
            }
            // Búsqueda
            if (busquedaEntrevistas) {
                const term = busquedaEntrevistas.toLowerCase();
                return (
                    (e.aspirante && e.aspirante.toLowerCase().includes(term)) ||
                    (e.entrevistador && e.entrevistador.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [entrevistasProgramadas, filterEstadoEntrevista, busquedaEntrevistas]);

    const stats = useMemo(() => ({
        pendientes: aspirantesPendientes.length,
        programadas: entrevistasProgramadas.filter(e =>
            e.estado === 'En Espera' || e.estado === 'Programada' || !e.estado
        ).length,
        aprobadas: entrevistasProgramadas.filter(e => e.estado === 'Aprobado').length,
        rechazadas: entrevistasProgramadas.filter(e => e.estado === 'Rechazado').length
    }), [aspirantesPendientes, entrevistasProgramadas]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Entrevistas - Dirección">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Entrevistas - Dirección">
            <style>{`
                .ge-container { display: flex; flex-direction: column; gap: 20px; }
                .ge-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .ge-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                /* Estadísticas */
                .ge-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
                .ge-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .ge-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .ge-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .ge-stat-pendientes { background: #fef3c7; color: #b45309; }
                .ge-stat-programadas { background: #dbeafe; color: #1d4ed8; }
                .ge-stat-aprobadas { background: #dcfce7; color: #15803d; }
                .ge-stat-rechazadas { background: #fee2e2; color: #b91c1c; }

                /* Filtros */
                .ge-filtros { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
                .ge-filtros-left { display: flex; gap: 10px; flex-wrap: wrap; flex: 1; }
                .ge-field { flex: 1; min-width: 200px; }
                .ge-field input, .ge-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .ge-field input:focus, .ge-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                /* Botones */
                .ge-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .ge-btn:disabled { opacity: .6; cursor: not-allowed; }
                .ge-btn-primary { background: #1e3a5f; color: #fff; }
                .ge-btn-primary:hover:not(:disabled) { background: #16293f; }
                .ge-btn-info { background: #3b82f6; color: #fff; }
                .ge-btn-info:hover:not(:disabled) { background: #2563eb; }
                .ge-btn-success { background: #16a34a; color: #fff; }
                .ge-btn-success:hover:not(:disabled) { background: #15803d; }
                .ge-btn-danger { background: #dc2626; color: #fff; }
                .ge-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .ge-btn-secondary { background: #e5e7eb; color: #334155; }
                .ge-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .ge-btn-sm { padding: 5px 12px; font-size: 12px; }

                /* Tabla */
                .ge-table { width: 100%; border-collapse: collapse; }
                .ge-table thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 12px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .ge-table thead th:first-child { border-top-left-radius: 8px; }
                .ge-table thead th:last-child { border-top-right-radius: 8px; }
                .ge-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .ge-table tbody tr:hover { background: #f8fafc; }
                .ge-table tbody tr:nth-child(even) { background: #fafbfc; }
                .ge-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .ge-table td { padding: 10px; font-size: 13px; color: #334155; vertical-align: middle; }

                .ge-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }

                .ge-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .ge-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .ge-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .ge-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                /* Modal */
                .ge-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .ge-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 520px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .ge-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .ge-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .ge-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .ge-modal-close:hover { color: #dc2626; }
                .ge-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .ge-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }

                .ge-field-modal { margin-bottom: 14px; }
                .ge-field-modal label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .ge-field-modal input, .ge-field-modal select, .ge-field-modal textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .ge-field-modal input:focus, .ge-field-modal select:focus, .ge-field-modal textarea:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .ge-field-modal textarea { min-height: 80px; resize: vertical; }

                @media (max-width: 768px) {
                    .ge-filtros { flex-direction: column; }
                    .ge-filtros-left { width: 100%; }
                    .ge-table { font-size: 12px; }
                    .ge-table thead th, .ge-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="ge-container">
                {message && <div className={`ge-aviso ${messageType}`}>{message}</div>}

                {/* ESTADÍSTICAS */}
                <div className="ge-stats">
                    <div className="ge-stat ge-stat-pendientes">
                        <span className="num">{stats.pendientes}</span>
                        <span className="lbl">Pendientes</span>
                    </div>
                    <div className="ge-stat ge-stat-programadas">
                        <span className="num">{stats.programadas}</span>
                        <span className="lbl">Programadas</span>
                    </div>
                    <div className="ge-stat ge-stat-aprobadas">
                        <span className="num">{stats.aprobadas}</span>
                        <span className="lbl">Aprobadas</span>
                    </div>
                    <div className="ge-stat ge-stat-rechazadas">
                        <span className="num">{stats.rechazadas}</span>
                        <span className="lbl">Rechazadas</span>
                    </div>
                </div>

                {/* ASPIRANTES PENDIENTES */}
                <div className="ge-card">
                    <h3>Aspirantes Pendientes de Entrevista</h3>

                    <div className="ge-filtros">
                        <div className="ge-filtros-left">
                            <div className="ge-field">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, correo o NIE..."
                                    value={busquedaPendientes}
                                    onChange={(e) => setBusquedaPendientes(e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{aspirantesFiltrados.length}</strong> de {aspirantesPendientes.length}
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="ge-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '55px' }}>ID</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>Especialidad</th>
                                    <th>Correo</th>
                                    <th>Teléfono</th>
                                    <th style={{ width: '180px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aspirantesFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="ge-empty">
                                            No hay aspirantes pendientes
                                        </td>
                                    </tr>
                                ) : (
                                    aspirantesFiltrados.map(a => (
                                        <tr key={a.idAspirante}>
                                            <td style={{ color: '#64748b' }}>{a.idAspirante}</td>
                                            <td><strong>{a.nombres}</strong></td>
                                            <td>{a.apellidos}</td>
                                            <td style={{ fontSize: '12px' }}>{getEspecialidadNombre(a.especialidadAspira)}</td>
                                            <td style={{ fontSize: '12px' }}>{a.correo || '-'}</td>
                                            <td style={{ fontSize: '12px' }}>{a.telefono || '-'}</td>
                                            <td>
                                                <button
                                                    className="ge-btn ge-btn-primary ge-btn-sm"
                                                    onClick={() => {
                                                        setSelectedAspirante(a);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Programar Entrevista
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ENTREVISTAS PROGRAMADAS */}
                <div className="ge-card">
                    <h3>Entrevistas Programadas</h3>

                    <div className="ge-filtros">
                        <div className="ge-filtros-left">
                            <div className="ge-field">
                                <input
                                    type="text"
                                    placeholder="Buscar por aspirante o entrevistador..."
                                    value={busquedaEntrevistas}
                                    onChange={(e) => setBusquedaEntrevistas(e.target.value)}
                                />
                            </div>
                            <div className="ge-field">
                                <select value={filterEstadoEntrevista} onChange={(e) => setFilterEstadoEntrevista(e.target.value)}>
                                    <option value="todas">Todos los estados</option>
                                    <option value="Programada">Programadas</option>
                                    <option value="Aprobado">Aprobadas</option>
                                    <option value="Rechazado">Rechazadas</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{entrevistasFiltradas.length}</strong> de {entrevistasProgramadas.length}
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="ge-table">
                            <thead>
                                <tr>
                                    <th>Aspirante</th>
                                    <th>Fecha</th>
                                    <th>Entrevistador</th>
                                    <th>Observaciones</th>
                                    <th style={{ width: '130px' }}>Estado</th>
                                    <th style={{ width: '180px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entrevistasFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="ge-empty">
                                            No hay entrevistas que coincidan
                                        </td>
                                    </tr>
                                ) : (
                                    entrevistasFiltradas.map(e => {
                                        const badge = getEstadoBadge(e.estado);
                                        return (
                                            <tr key={e.id}>
                                                <td><strong>{e.aspirante}</strong></td>
                                                <td style={{ fontSize: '12px' }}>{formatearFecha(e.fechaEntrevista)}</td>
                                                <td>{e.entrevistador || 'Pendiente'}</td>
                                                <td style={{ fontSize: '12px' }}>{e.observaciones || '-'}</td>
                                                <td>
                                                    <span
                                                        className="ge-badge"
                                                        style={{
                                                            backgroundColor: badge.bg,
                                                            color: badge.color,
                                                            border: `1px solid ${badge.border}`
                                                        }}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    {e.estado !== 'Aprobado' && e.estado !== 'Rechazado' && (
                                                        <button
                                                            className="ge-btn ge-btn-info ge-btn-sm"
                                                            onClick={() => abrirResultadoModal(e)}
                                                        >
                                                            Registrar Resultado
                                                        </button>
                                                    )}
                                                    {e.estado === 'Aprobado' && (
                                                        <span style={{ color: '#15803d', fontWeight: '600', fontSize: '12px' }}>
                                                            Aprobado
                                                        </span>
                                                    )}
                                                    {e.estado === 'Rechazado' && (
                                                        <span style={{ color: '#b91c1c', fontWeight: '600', fontSize: '12px' }}>
                                                            Rechazado
                                                        </span>
                                                    )}
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

            {/* MODAL PROGRAMAR ENTREVISTA */}
            {showModal && (
                <div className="ge-modal-overlay" onClick={() => !saving && setShowModal(false)}>
                    <div className="ge-modal" onClick={e => e.stopPropagation()}>
                        <div className="ge-modal-header">
                            <h3>Programar Entrevista</h3>
                            <button className="ge-modal-close" onClick={() => setShowModal(false)} disabled={saving}>X</button>
                        </div>

                        <div className="ge-info-box">
                            <strong>Aspirante:</strong> {selectedAspirante?.nombres} {selectedAspirante?.apellidos}<br />
                            <strong>Correo:</strong> {selectedAspirante?.correo || 'No registrado'}
                        </div>

                        <div className="ge-field-modal">
                            <label>Fecha y Hora *</label>
                            <input
                                type="datetime-local"
                                value={formData.fechaEntrevista}
                                onChange={(e) => setFormData({ ...formData, fechaEntrevista: e.target.value })}
                                required
                            />
                        </div>

                        <div className="ge-field-modal">
                            <label>Entrevistador *</label>
                            <select
                                value={formData.entrevistador}
                                onChange={(e) => setFormData({ ...formData, entrevistador: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar entrevistador</option>
                                {entrevistadores.map(doc => {
                                    const id = doc.idDocente || doc.IdDocente || doc.id || doc.Id;
                                    const nombre = `${doc.nombres || doc.Nombres || doc.nombre || ''} ${doc.apellidos || doc.Apellidos || ''}`.trim();
                                    return <option key={id} value={nombre}>{nombre}</option>;
                                })}
                            </select>
                        </div>

                        <div className="ge-modal-actions">
                            <button className="ge-btn ge-btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>
                                Cancelar
                            </button>
                            <button className="ge-btn ge-btn-primary" onClick={handleProgramar} disabled={saving}>
                                {saving ? 'Programando...' : 'Programar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL REGISTRAR RESULTADO */}
            {showResultadoModal && (
                <div className="ge-modal-overlay" onClick={() => !saving && setShowResultadoModal(false)}>
                    <div className="ge-modal" onClick={e => e.stopPropagation()}>
                        <div className="ge-modal-header">
                            <h3>Registrar Resultado de Entrevista</h3>
                            <button className="ge-modal-close" onClick={() => setShowResultadoModal(false)} disabled={saving}>X</button>
                        </div>

                        <div className="ge-info-box">
                            <strong>Aspirante:</strong> {selectedEntrevista?.aspirante}<br />
                            <strong>Fecha:</strong> {formatearFecha(selectedEntrevista?.fechaEntrevista)}
                        </div>

                        <div className="ge-field-modal">
                            <label>Resultado *</label>
                            <select
                                value={resultadoData.aprobado}
                                onChange={(e) => setResultadoData({ ...resultadoData, aprobado: e.target.value === 'true' })}
                            >
                                <option value="true">Aprobado</option>
                                <option value="false">Rechazado</option>
                            </select>
                        </div>

                        <div className="ge-field-modal">
                            <label>Observaciones *</label>
                            <textarea
                                value={resultadoData.observaciones}
                                onChange={(e) => setResultadoData({ ...resultadoData, observaciones: e.target.value })}
                                placeholder="Observaciones de la entrevista..."
                            />
                        </div>

                        {resultadoData.aprobado && (
                            <div className="ge-field-modal">
                                <label>Clase a Asignar *</label>
                                <select
                                    value={claseSeleccionada}
                                    onChange={(e) => setClaseSeleccionada(e.target.value)}
                                >
                                    <option value="">Seleccionar clase</option>
                                    {clasesDisponibles.map(c => (
                                        <option key={c.idClase} value={c.idClase}>
                                            {c.nombreClase} (Sección {c.seccion}) - Cupo {c.cupoActual}/{c.cupoMaximo}
                                        </option>
                                    ))}
                                </select>
                                {clasesDisponibles.length === 0 && (
                                    <small style={{ color: '#dc2626', display: 'block', marginTop: '6px', fontSize: '12px' }}>
                                        No hay clases con cupo disponible para la especialidad del aspirante
                                    </small>
                                )}
                            </div>
                        )}

                        {!resultadoData.aprobado && (
                            <div className="ge-field-modal">
                                <label>Motivo del Rechazo *</label>
                                <textarea
                                    value={resultadoData.motivoRechazo}
                                    onChange={(e) => setResultadoData({ ...resultadoData, motivoRechazo: e.target.value })}
                                    placeholder="Ingrese el motivo del rechazo..."
                                    required
                                />
                            </div>
                        )}

                        <div className="ge-modal-actions">
                            <button className="ge-btn ge-btn-secondary" onClick={() => setShowResultadoModal(false)} disabled={saving}>
                                Cancelar
                            </button>
                            {resultadoData.aprobado ? (
                                <button className="ge-btn ge-btn-success" onClick={handleAceptar} disabled={saving}>
                                    {saving ? 'Aprobando...' : 'Aceptar'}
                                </button>
                            ) : (
                                <button className="ge-btn ge-btn-danger" onClick={handleRechazar} disabled={saving}>
                                    {saving ? 'Rechazando...' : 'Rechazar'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionEntrevistas;