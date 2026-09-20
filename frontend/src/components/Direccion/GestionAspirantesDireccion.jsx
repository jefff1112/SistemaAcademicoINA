// Componente Gestión de Aspirantes (Dirección) - MEJORADO
// Evalúa notas, aprueba, rechaza o pone en espera aspirantes.
// Incluye filtro por especialidad (con Bachillerato General) y estado.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionAspirantesDireccion = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [aspirantes, setAspirantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [showModalNota, setShowModalNota] = useState(false);
    const [showModalAprobar, setShowModalAprobar] = useState(false);
    const [showModalRechazo, setShowModalRechazo] = useState(false);
    const [showModalEspera, setShowModalEspera] = useState(false);
    const [showModalDocumentos, setShowModalDocumentos] = useState(false);

    const [selectedAspirante, setSelectedAspirante] = useState(null);
    const [errorAprobar, setErrorAprobar] = useState('');
    const [documentosData, setDocumentosData] = useState(null);

    // Filtros
    const [filterEstado, setFilterEstado] = useState('todos');
    const [filterEspecialidad, setFilterEspecialidad] = useState('todas');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        notaExamen: '',
        especialidadId: '',
        seccion: 'A',
        idClaseAsignada: '',
        motivo: '',
        observacion: ''
    });

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [aspirantesRes, clasesRes, especialidadesRes] = await Promise.all([
                API.get('/aspirantes'),
                API.get('/clases'),
                API.get('/clases/especialidades')
            ]);
            setAspirantes(aspirantesRes.data || []);
            setClases(clasesRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // HELPERS DE CLASES
    // ============================================================
    const getClaseEspecialidadId = (c) => {
        return c.idEspecialidad ?? c.id_especialidad ?? c.especialidadId ?? c.idEspecialidadFk ?? 0;
    };

    const getClaseDisponible = (c) => {
        const max = c.cupoMaximo ?? c.cupo_maximo ?? c.CupoMaximo ?? c.cupoMax ?? 0;
        const actual = c.cupoActual ?? c.cupo_actual ?? c.CupoActual ?? c.cupo ?? 0;
        const disponible = Number(max) - Number(actual);
        return isNaN(disponible) ? 0 : disponible;
    };

    // ============================================================
    // REABRIR ASPIRANTE
    // ============================================================
    const handleReabrir = async (aspirante) => {
        if (!aspirante) return;
        try {
            setAspirantes(prev => prev.map(a =>
                a.idAspirante === aspirante.idAspirante ? { ...a, estadoSolicitud: 'Pendiente' } : a
            ));
            await API.put(`/aspirantes/${aspirante.idAspirante}`, { estadoSolicitud: 'Pendiente' });
            mostrarMensaje('Aspirante reabierto a Pendiente', 'success');
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al reabrir aspirante', 'error');
            cargarDatos();
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
    // HELPERS DE ESPECIALIDAD
    // ============================================================
    const getEspecialidadNombre = (id) => {
        if (!id) return 'Bachillerato General';
        const esp = especialidades.find(e => e.idEspecialidad === Number(id));
        return esp ? esp.nombreEspecialidad : 'Bachillerato General';
    };

    // Lista de especialidades + "Bachillerato General" (id = 0)
    // Solo agrega "Bachillerato General" si NO viene ya desde la API.
    const especialidadesConGeneral = useMemo(() => {
        const lista = [...especialidades];

        // Verifica si ya existe una especialidad con id 0 o con nombre "Bachillerato General"
        const yaExiste = lista.some(e =>
            e.idEspecialidad === 0 ||
            (e.nombreEspecialidad && e.nombreEspecialidad.toLowerCase().includes('bachillerato general'))
        );

        if (!yaExiste) {
            lista.unshift({ idEspecialidad: 0, nombreEspecialidad: 'Bachillerato General' });
        }

        return lista;
    }, [especialidades]);

    // ============================================================
    // COLORES DE ESTADO
    // ============================================================
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Aprobado': return { bg: '#dcfce7', color: '#15803d', border: '#16a34a' };
            case 'Rechazado': return { bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' };
            case 'En Espera': return { bg: '#fef3c7', color: '#b45309', border: '#e67e22' };
            case 'Preseleccionado': return { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
        }
    };

    // ============================================================
    // VER DOCUMENTOS
    // ============================================================
    const verDocumentos = async (aspirante) => {
        try {
            const response = await API.get(`/aspirantes/${aspirante.idAspirante}/documentos`);
            setDocumentosData(response.data);
            setSelectedAspirante(aspirante);
            setShowModalDocumentos(true);
        } catch (error) {
            mostrarMensaje('Error al cargar documentos', 'error');
        }
    };

    // ============================================================
    // REGISTRAR NOTA
    // ============================================================
    const handleRegistrarNota = async () => {
        if (!selectedAspirante) return;
        if (!formData.notaExamen || parseFloat(formData.notaExamen) < 0 || parseFloat(formData.notaExamen) > 10) {
            mostrarMensaje('Ingrese una nota valida entre 0 y 10', 'error');
            return;
        }
        setSaving(true);
        try {
            await API.post('/aspirantes/sp_registrar_nota_examen', {
                p_id_aspirante: selectedAspirante.idAspirante,
                p_nota_examen: parseFloat(formData.notaExamen)
            });
            mostrarMensaje('Nota registrada correctamente', 'success');
            setShowModalNota(false);
            setAspirantes(prev => prev.map(a =>
                a.idAspirante === selectedAspirante.idAspirante
                    ? { ...a, notaExamen: parseFloat(formData.notaExamen) }
                    : a
            ));
            setSelectedAspirante(null);
            setFormData({ ...formData, notaExamen: '' });
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al registrar nota', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // APROBAR
    // ============================================================
    const handleAprobar = async () => {
        if (!selectedAspirante) return;
        if (!formData.idClaseAsignada) {
            mostrarMensaje('Seleccione una clase con cupo disponible', 'error');
            return;
        }

        const claseSeleccionada = clases.find(c => {
            const id = c.idClase ?? c.IdClase ?? c.id;
            return Number(id) === Number(formData.idClaseAsignada);
        });
        if (!claseSeleccionada) {
            mostrarMensaje('La clase seleccionada no existe', 'error');
            return;
        }
        if (getClaseDisponible(claseSeleccionada) <= 0) {
            mostrarMensaje('La clase seleccionada no tiene cupo disponible', 'error');
            return;
        }

        const nota = parseFloat(selectedAspirante.notaExamen || 0);
        if (nota < 6) {
            mostrarMensaje('La nota minima para aprobar es 6', 'error');
            return;
        }

        setSaving(true);
        try {
            await API.put(`/aspirantes/aprobar/${selectedAspirante.idAspirante}`, {
                idClaseAsignada: Number(formData.idClaseAsignada),
                aprobadoPor: 'Direccion'
            });
            mostrarMensaje('Aspirante aprobado. La matrícula la realizará Registro Académico', 'success');
            setShowModalAprobar(false);
            setAspirantes(prev => prev.map(a =>
                a.idAspirante === selectedAspirante.idAspirante
                    ? { ...a, estadoSolicitud: 'Aprobado', idClaseAsignada: Number(formData.idClaseAsignada) }
                    : a
            ));
            setSelectedAspirante(null);
            setFormData({ ...formData, especialidadId: '', seccion: 'A', idClaseAsignada: '' });
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al aprobar', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // RECHAZAR
    // ============================================================
    const handleRechazar = async () => {
        if (!selectedAspirante) return;
        if (!formData.motivo.trim()) {
            mostrarMensaje('Ingrese un motivo de rechazo', 'error');
            return;
        }
        setSaving(true);
        try {
            await API.put(`/aspirantes/rechazar/${selectedAspirante.idAspirante}`, {
                rechazadoPor: 'Direccion',
                motivo: formData.motivo
            });
            mostrarMensaje('Aspirante rechazado correctamente', 'success');
            setShowModalRechazo(false);
            setAspirantes(prev => prev.map(a =>
                a.idAspirante === selectedAspirante.idAspirante
                    ? { ...a, estadoSolicitud: 'Rechazado' }
                    : a
            ));
            setSelectedAspirante(null);
            setFormData({ ...formData, motivo: '' });
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al rechazar', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ESPERA
    // ============================================================
    const handleEspera = async () => {
        if (!selectedAspirante) return;
        if (!formData.observacion.trim()) {
            mostrarMensaje('Ingrese una observacion', 'error');
            return;
        }
        setSaving(true);
        try {
            await API.put(`/aspirantes/espera/${selectedAspirante.idAspirante}`, {
                entrevistadoPor: 'Direccion',
                observacion: formData.observacion
            });
            mostrarMensaje('Aspirante en lista de espera', 'success');
            setShowModalEspera(false);
            setAspirantes(prev => prev.map(a =>
                a.idAspirante === selectedAspirante.idAspirante
                    ? { ...a, estadoSolicitud: 'En Espera' }
                    : a
            ));
            setSelectedAspirante(null);
            setFormData({ ...formData, observacion: '' });
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al poner en espera', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const aspirantesFiltrados = useMemo(() => {
        return aspirantes.filter(a => {
            // Filtro por estado
            if (filterEstado !== 'todos' && a.estadoSolicitud !== filterEstado) return false;

            // Filtro por especialidad (0 = Bachillerato General = sin especialidad)
            if (filterEspecialidad !== 'todas') {
                const espFiltro = parseInt(filterEspecialidad);
                const espAspirante = a.especialidadAspira ? Number(a.especialidadAspira) : 0;
                if (espFiltro === 0) {
                    if (espAspirante !== 0 && espAspirante !== null) return false;
                } else {
                    if (espAspirante !== espFiltro) return false;
                }
            }

            // Búsqueda
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    (a.nombres && a.nombres.toLowerCase().includes(term)) ||
                    (a.apellidos && a.apellidos.toLowerCase().includes(term)) ||
                    (a.nie && a.nie.toLowerCase().includes(term)) ||
                    (a.correo && a.correo.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [aspirantes, filterEstado, filterEspecialidad, searchTerm]);

    // Estadísticas
    const stats = useMemo(() => {
        const base = aspirantes.filter(a => {
            if (filterEspecialidad === 'todas') return true;
            const espFiltro = parseInt(filterEspecialidad);
            const espAspirante = a.especialidadAspira ? Number(a.especialidadAspira) : 0;
            if (espFiltro === 0) return espAspirante === 0 || espAspirante === null;
            return espAspirante === espFiltro;
        });

        return {
            total: base.length,
            pendientes: base.filter(a => a.estadoSolicitud === 'Pendiente').length,
            aprobados: base.filter(a => a.estadoSolicitud === 'Aprobado').length,
            rechazados: base.filter(a => a.estadoSolicitud === 'Rechazado').length,
            enEspera: base.filter(a => a.estadoSolicitud === 'En Espera').length
        };
    }, [aspirantes, filterEspecialidad]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Aspirantes - Dirección">
                <div className="loading">Cargando datos...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Aspirantes - Dirección">
            <style>{`
                .ga-container { display: flex; flex-direction: column; gap: 20px; }
                .ga-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .ga-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .ga-filtros { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 14px; }
                .ga-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .ga-field input, .ga-field select, .ga-field textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .ga-field input:focus, .ga-field select:focus, .ga-field textarea:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .ga-field textarea { min-height: 80px; resize: vertical; }

                .ga-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 4px; }
                .ga-stat { padding: 14px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .ga-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .ga-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .ga-stat-total { background: #eff6ff; color: #1e40af; }
                .ga-stat-pendientes { background: #dbeafe; color: #1d4ed8; }
                .ga-stat-aprobados { background: #dcfce7; color: #15803d; }
                .ga-stat-rechazados { background: #fee2e2; color: #b91c1c; }
                .ga-stat-espera { background: #fef3c7; color: #b45309; }

                .ga-table { width: 100%; border-collapse: collapse; }
                .ga-table thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 12px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .ga-table thead th:first-child { border-top-left-radius: 8px; }
                .ga-table thead th:last-child { border-top-right-radius: 8px; }
                .ga-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .ga-table tbody tr:hover { background: #f8fafc; }
                .ga-table tbody tr:nth-child(even) { background: #fafbfc; }
                .ga-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .ga-table td { padding: 10px; font-size: 13px; color: #334155; vertical-align: middle; }

                .ga-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }

                .ga-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .ga-btn:disabled { opacity: .6; cursor: not-allowed; }
                .ga-btn-primary { background: #1e3a5f; color: #fff; }
                .ga-btn-primary:hover:not(:disabled) { background: #16293f; }
                .ga-btn-success { background: #16a34a; color: #fff; }
                .ga-btn-success:hover:not(:disabled) { background: #15803d; }
                .ga-btn-danger { background: #dc2626; color: #fff; }
                .ga-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .ga-btn-warning { background: #e67e22; color: #fff; }
                .ga-btn-warning:hover:not(:disabled) { background: #d35400; }
                .ga-btn-info { background: #8b5cf6; color: #fff; }
                .ga-btn-info:hover:not(:disabled) { background: #7c3aed; }
                .ga-btn-secondary { background: #e5e7eb; color: #334155; }
                .ga-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .ga-btn-sm { padding: 5px 12px; font-size: 12px; }

                .ga-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .ga-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .ga-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .ga-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                .ga-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .ga-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 520px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .ga-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .ga-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .ga-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .ga-modal-close:hover { color: #dc2626; }
                .ga-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .ga-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }

                .ga-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 768px) {
                    .ga-filtros { grid-template-columns: 1fr; }
                    .ga-table { font-size: 12px; }
                    .ga-table thead th, .ga-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="ga-container">
                {message && <div className={`ga-aviso ${messageType}`}>{message}</div>}

                {/* ESTADÍSTICAS */}
                <div className="ga-stats">
                    <div className="ga-stat ga-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total</span>
                    </div>
                    <div className="ga-stat ga-stat-pendientes">
                        <span className="num">{stats.pendientes}</span>
                        <span className="lbl">Pendientes</span>
                    </div>
                    <div className="ga-stat ga-stat-aprobados">
                        <span className="num">{stats.aprobados}</span>
                        <span className="lbl">Aprobados</span>
                    </div>
                    <div className="ga-stat ga-stat-rechazados">
                        <span className="num">{stats.rechazados}</span>
                        <span className="lbl">Rechazados</span>
                    </div>
                    <div className="ga-stat ga-stat-espera">
                        <span className="num">{stats.enEspera}</span>
                        <span className="lbl">En Espera</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="ga-card">
                    <h3>Filtros y Búsqueda</h3>
                    <div className="ga-filtros">
                        <div className="ga-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, NIE, correo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="ga-field">
                            <label>Estado</label>
                            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                                <option value="todos">Todos los estados</option>
                                <option value="Pendiente">Pendientes</option>
                                <option value="Aprobado">Aprobados</option>
                                <option value="Rechazado">Rechazados</option>
                                <option value="En Espera">En Espera</option>
                                <option value="Preseleccionado">Preseleccionados</option>
                            </select>
                        </div>
                        <div className="ga-field">
                            <label>Especialidad</label>
                            <select value={filterEspecialidad} onChange={(e) => setFilterEspecialidad(e.target.value)}>
                                <option value="todas">Todas las especialidades</option>
                                {especialidadesConGeneral.map(e => (
                                    <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                        {e.nombreEspecialidad}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="ga-card">
                    <h3>Lista de Aspirantes ({aspirantesFiltrados.length})</h3>
                    <div className="table-responsive">
                        <table className="ga-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>ID</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th style={{ width: '100px' }}>NIE</th>
                                    <th style={{ width: '80px', textAlign: 'center' }}>Nota</th>
                                    <th>Especialidad</th>
                                    <th style={{ width: '120px' }}>Estado</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Documentos</th>
                                    <th style={{ width: '280px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aspirantesFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="ga-empty">
                                            No hay aspirantes que coincidan con los filtros
                                        </td>
                                    </tr>
                                ) : (
                                    aspirantesFiltrados.map((a) => {
                                        const colores = getEstadoColor(a.estadoSolicitud);
                                        return (
                                            <tr key={a.idAspirante}>
                                                <td style={{ color: '#64748b' }}>{a.idAspirante}</td>
                                                <td><strong>{a.nombres}</strong></td>
                                                <td>{a.apellidos}</td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {a.nie || '-'}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        className="ga-badge"
                                                        style={{
                                                            backgroundColor: a.notaExamen ? '#dcfce7' : '#f1f5f9',
                                                            color: a.notaExamen ? '#15803d' : '#64748b'
                                                        }}
                                                    >
                                                        {a.notaExamen || 'Pend.'}
                                                    </span>
                                                </td>
                                                <td>{getEspecialidadNombre(a.especialidadAspira)}</td>
                                                <td>
                                                    <span
                                                        className="ga-badge"
                                                        style={{
                                                            backgroundColor: colores.bg,
                                                            color: colores.color,
                                                            border: `1px solid ${colores.border}`
                                                        }}
                                                    >
                                                        {a.estadoSolicitud || 'Pendiente'}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        className="ga-btn ga-btn-info ga-btn-sm"
                                                        onClick={() => verDocumentos(a)}
                                                    >
                                                        Ver
                                                    </button>
                                                </td>
                                                <td>
                                                    <div className="ga-acciones">
                                                        {a.estadoSolicitud === 'Pendiente' && !a.notaExamen && (
                                                            <button
                                                                className="ga-btn ga-btn-primary ga-btn-sm"
                                                                onClick={() => {
                                                                    setSelectedAspirante(a);
                                                                    setShowModalNota(true);
                                                                }}
                                                            >
                                                                Registrar Nota
                                                            </button>
                                                        )}

                                                        {a.estadoSolicitud === 'Pendiente' && a.notaExamen && (
                                                            <>
                                                                <button
                                                                    className="ga-btn ga-btn-success ga-btn-sm"
                                                                    onClick={() => {
                                                                        setSelectedAspirante(a);
                                                                        setErrorAprobar('');
                                                                        const espInicial = a.especialidadAspira ? String(a.especialidadAspira) : '0';
                                                                        setFormData({ ...formData, especialidadId: espInicial, seccion: 'A', idClaseAsignada: '' });
                                                                        setShowModalAprobar(true);
                                                                    }}
                                                                >
                                                                    Aprobar
                                                                </button>
                                                                <button
                                                                    className="ga-btn ga-btn-warning ga-btn-sm"
                                                                    onClick={() => {
                                                                        setSelectedAspirante(a);
                                                                        setShowModalEspera(true);
                                                                    }}
                                                                >
                                                                    Espera
                                                                </button>
                                                            </>
                                                        )}

                                                        {a.estadoSolicitud === 'Pendiente' && (
                                                            <button
                                                                className="ga-btn ga-btn-danger ga-btn-sm"
                                                                onClick={() => {
                                                                    setSelectedAspirante(a);
                                                                    setShowModalRechazo(true);
                                                                }}
                                                            >
                                                                Rechazar
                                                            </button>
                                                        )}

                                                        {(a.estadoSolicitud === 'Rechazado' || a.estadoSolicitud === 'En Espera') && (
                                                            <button
                                                                className="ga-btn ga-btn-primary ga-btn-sm"
                                                                onClick={() => handleReabrir(a)}
                                                            >
                                                                Reabrir
                                                            </button>
                                                        )}

                                                        {a.estadoSolicitud === 'Aprobado' && (
                                                            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
                                                                Pendiente de matrícula
                                                            </span>
                                                        )}
                                                    </div>
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

            {/* MODAL DOCUMENTOS */}
            {showModalDocumentos && documentosData && (
                <div className="ga-modal-overlay" onClick={() => setShowModalDocumentos(false)}>
                    <div className="ga-modal" onClick={e => e.stopPropagation()}>
                        <div className="ga-modal-header">
                            <h3>Documentos del Aspirante</h3>
                            <button className="ga-modal-close" onClick={() => setShowModalDocumentos(false)}>X</button>
                        </div>
                        <div className="ga-info-box">
                            <strong>{documentosData.nombres} {documentosData.apellidos}</strong>
                        </div>
                        <p><strong>Correo:</strong> {documentosData.correo || 'No registrado'}</p>
                        <p><strong>Teléfono:</strong> {documentosData.telefono || 'No registrado'}</p>
                        <p><strong>Promedio Anterior:</strong> {documentosData.promedioAnterior || 'No registrado'}</p>

                        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

                        <div className="ga-field">
                            <label>Fotografía</label>
                            {documentosData.fotoUrl ? (
                                <img
                                    src={documentosData.fotoUrl}
                                    alt="Foto del aspirante"
                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <p style={{ color: '#94a3b8' }}>No hay foto disponible</p>
                            )}
                        </div>

                        <div className="ga-field" style={{ marginTop: '16px' }}>
                            <label>Documento PDF</label>
                            {documentosData.pdfUrl ? (
                                <a
                                    href={documentosData.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ga-btn ga-btn-danger"
                                    style={{ textDecoration: 'none' }}
                                >
                                    Ver PDF
                                </a>
                            ) : (
                                <p style={{ color: '#94a3b8' }}>No hay documento PDF disponible</p>
                            )}
                        </div>

                        <div className="ga-modal-actions">
                            <button className="ga-btn ga-btn-secondary" onClick={() => setShowModalDocumentos(false)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NOTA */}
            {showModalNota && (
                <div className="ga-modal-overlay" onClick={() => !saving && setShowModalNota(false)}>
                    <div className="ga-modal" onClick={e => e.stopPropagation()}>
                        <div className="ga-modal-header">
                            <h3>Registrar Nota de Examen</h3>
                            <button className="ga-modal-close" onClick={() => setShowModalNota(false)} disabled={saving}>X</button>
                        </div>
                        <div className="ga-info-box">
                            <strong>Aspirante:</strong> {selectedAspirante?.nombres} {selectedAspirante?.apellidos}
                        </div>
                        <div className="ga-field">
                            <label>Nota (0-10) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                value={formData.notaExamen}
                                onChange={(e) => setFormData({ ...formData, notaExamen: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="ga-modal-actions">
                            <button className="ga-btn ga-btn-secondary" onClick={() => setShowModalNota(false)} disabled={saving}>
                                Cancelar
                            </button>
                            <button className="ga-btn ga-btn-primary" onClick={handleRegistrarNota} disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Nota'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL APROBAR */}
            {showModalAprobar && (
                <div className="ga-modal-overlay" onClick={() => !saving && setShowModalAprobar(false)}>
                    <div className="ga-modal" onClick={e => e.stopPropagation()}>
                        <div className="ga-modal-header">
                            <h3>Aprobar Aspirante</h3>
                            <button className="ga-modal-close" onClick={() => setShowModalAprobar(false)} disabled={saving}>X</button>
                        </div>
                        <div className="ga-info-box">
                            <strong>Aspirante:</strong> {selectedAspirante?.nombres} {selectedAspirante?.apellidos}<br />
                            <strong>Nota:</strong> {selectedAspirante?.notaExamen} (mínima: 6)
                        </div>
                        <div className="ga-field" style={{ marginBottom: '14px' }}>
                            <label>Especialidad *</label>
                            <select
                                value={formData.especialidadId}
                                onChange={(e) => setFormData({ ...formData, especialidadId: e.target.value, idClaseAsignada: '' })}
                                required
                            >
                                <option value="">Seleccionar Especialidad</option>
                                {especialidadesConGeneral.map(e => (
                                    <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                        {e.nombreEspecialidad}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="ga-field" style={{ marginBottom: '14px' }}>
                            <label>Clase *</label>
                            <select
                                value={formData.idClaseAsignada}
                                onChange={(e) => setFormData({ ...formData, idClaseAsignada: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar Clase</option>
                                {clases
                                    .filter(c => {
                                        if (formData.especialidadId === '') return true;
                                        const espClase = Number(getClaseEspecialidadId(c));
                                        const espForm = parseInt(formData.especialidadId);
                                        // Si es Bachillerato General (0), mostrar clases sin especialidad (null/0)
                                        if (espForm === 0) return espClase === 0 || c.idEspecialidad == null;
                                        return espClase === espForm;
                                    })
                                    .map(c => {
                                        const disponible = getClaseDisponible(c);
                                        const sinCupo = disponible <= 0;
                                        const id = c.idClase ?? c.IdClase ?? c.id ?? '';
                                        const label = c.nombreClase || c.nombre || `Clase ${id}`;
                                        return (
                                            <option key={id} value={id} disabled={sinCupo}>
                                                {label} - {disponible > 0 ? `${disponible} cupo${disponible !== 1 ? 's' : ''}` : 'SIN CUPO'}
                                            </option>
                                        );
                                    })}
                            </select>
                        </div>
                        <div className="ga-field" style={{ marginBottom: '14px' }}>
                            <label>Sección</label>
                            {formData.idClaseAsignada ? (() => {
                                const claseSel = clases.find(c => {
                                    const id = c.idClase ?? c.IdClase ?? c.id;
                                    return Number(id) === Number(formData.idClaseAsignada);
                                });
                                return (
                                    <p style={{ margin: 0, padding: '8px 12px', background: '#f1f5f9', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}>
                                        Sección {claseSel?.seccion || 'A'} (asignada automáticamente)
                                    </p>
                                );
                            })() : (
                                <p style={{ margin: 0, padding: '8px 12px', background: '#f1f5f9', borderRadius: '6px', color: '#64748b', fontSize: '13px' }}>
                                    Seleccione una clase para ver su sección
                                </p>
                            )}
                        </div>

                        {errorAprobar && (
                            <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '13px' }}>
                                <p style={{ margin: 0, fontWeight: '600' }}>{errorAprobar}</p>
                                <button
                                    className="ga-btn ga-btn-danger ga-btn-sm"
                                    style={{ marginTop: '8px' }}
                                    onClick={() => { setShowModalAprobar(false); setErrorAprobar(''); setShowModalRechazo(true); }}
                                >
                                    Rechazar esta solicitud
                                </button>
                            </div>
                        )}

                        <div className="ga-modal-actions">
                            <button className="ga-btn ga-btn-secondary" onClick={() => setShowModalAprobar(false)} disabled={saving}>
                                Cancelar
                            </button>
                            <button
                                className="ga-btn ga-btn-success"
                                onClick={handleAprobar}
                                disabled={!formData.idClaseAsignada || saving}
                            >
                                {saving ? 'Aprobando...' : 'Aprobar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL RECHAZO */}
            {showModalRechazo && (
                <div className="ga-modal-overlay" onClick={() => !saving && setShowModalRechazo(false)}>
                    <div className="ga-modal" onClick={e => e.stopPropagation()}>
                        <div className="ga-modal-header">
                            <h3>Rechazar Aspirante</h3>
                            <button className="ga-modal-close" onClick={() => setShowModalRechazo(false)} disabled={saving}>X</button>
                        </div>
                        <div className="ga-info-box">
                            <strong>Aspirante:</strong> {selectedAspirante?.nombres} {selectedAspirante?.apellidos}
                        </div>
                        <div className="ga-field">
                            <label>Motivo del Rechazo *</label>
                            <textarea
                                value={formData.motivo}
                                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                required
                                placeholder="Explique el motivo del rechazo"
                            />
                        </div>
                        <div className="ga-modal-actions">
                            <button className="ga-btn ga-btn-secondary" onClick={() => setShowModalRechazo(false)} disabled={saving}>
                                Cancelar
                            </button>
                            <button className="ga-btn ga-btn-danger" onClick={handleRechazar} disabled={saving}>
                                {saving ? 'Rechazando...' : 'Rechazar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ESPERA */}
            {showModalEspera && (
                <div className="ga-modal-overlay" onClick={() => !saving && setShowModalEspera(false)}>
                    <div className="ga-modal" onClick={e => e.stopPropagation()}>
                        <div className="ga-modal-header">
                            <h3>Lista de Espera</h3>
                            <button className="ga-modal-close" onClick={() => setShowModalEspera(false)} disabled={saving}>X</button>
                        </div>
                        <div className="ga-info-box">
                            <strong>Aspirante:</strong> {selectedAspirante?.nombres} {selectedAspirante?.apellidos}
                        </div>
                        <div className="ga-field">
                            <label>Observación *</label>
                            <textarea
                                value={formData.observacion}
                                onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                                required
                                placeholder="Indique el motivo por el cual queda en espera"
                            />
                        </div>
                        <div className="ga-modal-actions">
                            <button className="ga-btn ga-btn-secondary" onClick={() => setShowModalEspera(false)} disabled={saving}>
                                Cancelar
                            </button>
                            <button className="ga-btn ga-btn-warning" onClick={handleEspera} disabled={saving}>
                                {saving ? 'Guardando...' : 'Poner en Espera'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionAspirantesDireccion;