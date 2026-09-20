// Componente Gestión de Clases (Dirección) - MEJORADO
// Crea, edita y elimina clases con cupos y secciones.
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionClases = () => {
    // ============================================================
    // ESTADOS
    // ============================================================
    const [clases, setClases] = useState([]);
    const [niveles, setNiveles] = useState([]);
    const [grados, setGrados] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingClase, setEditingClase] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAnio, setFilterAnio] = useState(new Date().getFullYear());
    const [filterNivel, setFilterNivel] = useState('todos');
    const [filterEspecialidad, setFilterEspecialidad] = useState('todas');
    const [filterSeccion, setFilterSeccion] = useState('todas');
    const [filterEstado, setFilterEstado] = useState('todas'); // 'todas' | 'con-cupo' | 'llenas'

    // Formulario
    const [formData, setFormData] = useState({
        idNivel: '',
        idGrado: '',
        idEspecialidad: '',
        idSeccion: '',
        cupoMaximo: 30,
        anioLectivo: new Date().getFullYear()
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
            const [clasesRes, nivelesRes, gradosRes, especialidadesRes, seccionesRes] = await Promise.all([
                API.get('/clases'),
                API.get('/clases/niveles'),
                API.get('/grados'),
                API.get('/clases/especialidades'),
                API.get('/clases/secciones')
            ]);
            setClases(clasesRes.data || []);
            setNiveles(nivelesRes.data || []);
            setGrados(gradosRes.data || []);
            setEspecialidades(especialidadesRes.data || []);
            setSecciones(seccionesRes.data || []);
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
    // MODAL CREAR / EDITAR
    // ============================================================
    const handleOpenModal = (clase = null) => {
        if (clase) {
            setEditingClase(clase);
            setFormData({
                idNivel: clase.idNivel || '',
                idGrado: clase.idGrado || '',
                idEspecialidad: clase.idEspecialidad || '',
                idSeccion: clase.idSeccion || '',
                cupoMaximo: clase.cupoMaximo || 30,
                anioLectivo: clase.anioLectivo || new Date().getFullYear()
            });
        } else {
            setEditingClase(null);
            setFormData({
                idNivel: '',
                idGrado: '',
                idEspecialidad: '',
                idSeccion: '',
                cupoMaximo: 30,
                anioLectivo: new Date().getFullYear()
            });
        }
        setShowModal(true);
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getGradosDeNivel = (idNivel) => {
        return grados.filter(g => g.idNivel === Number(idNivel));
    };

    const getEspecialidadesDeNivel = (idNivel) => {
        const nivel = Number(idNivel);
        if (nivel === 1) return [];
        if (nivel === 2) return especialidades.filter(e => e.idEspecialidad === 1 || e.idEspecialidad === 2);
        if (nivel === 3) return especialidades.filter(e => e.idEspecialidad === 3);
        return especialidades;
    };

    const getNivelNombre = (id) => {
        const nivel = niveles.find(n => n.idNivel === Number(id));
        return nivel ? nivel.nombreNivel : '-';
    };

    const getGradoNombre = (id) => {
        const grado = grados.find(g => g.idGrados === Number(id));
        return grado ? grado.nombreGrado : '-';
    };

    const getEspecialidadNombre = (id) => {
        if (!id) return 'Bachillerato General';
        const especialidad = especialidades.find(e => e.idEspecialidad === Number(id));
        return especialidad ? especialidad.nombreEspecialidad : 'Bachillerato General';
    };

    const getSeccionNombre = (id) => {
        const seccion = secciones.find(s => s.idSeccion === Number(id));
        return seccion ? seccion.nombreSeccion : '-';
    };

    // ============================================================
    // SUBMIT
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        const idNivelNum = Number(formData.idNivel);
        const idGradoNum = Number(formData.idGrado);
        const idSeccionNum = Number(formData.idSeccion);
        const cupoMaximoNum = Number(formData.cupoMaximo);
        const anioLectivoNum = Number(formData.anioLectivo);

        if (isNaN(idNivelNum) || idNivelNum === 0) {
            mostrarMensaje('Seleccione un Nivel válido', 'error');
            return;
        }
        if (isNaN(idGradoNum) || idGradoNum === 0) {
            mostrarMensaje('Seleccione el Año que cursa la clase', 'error');
            return;
        }
        const gradoElegido = grados.find(g => g.idGrados === idGradoNum);
        if (gradoElegido && gradoElegido.idNivel !== idNivelNum) {
            mostrarMensaje('El año seleccionado no pertenece al nivel elegido', 'error');
            return;
        }
        if (isNaN(idSeccionNum) || idSeccionNum === 0) {
            mostrarMensaje('Seleccione una Sección válida', 'error');
            return;
        }

        const especialidadesValidas = getEspecialidadesDeNivel(idNivelNum);
        if (formData.idEspecialidad && formData.idEspecialidad !== ''
            && !especialidadesValidas.some(e => e.idEspecialidad === Number(formData.idEspecialidad))) {
            mostrarMensaje('La especialidad elegida no corresponde al nivel seleccionado', 'error');
            return;
        }

        setSaving(true);
        try {
            const dataToSend = {
                idNivel: idNivelNum,
                idGrado: idGradoNum,
                idSeccion: idSeccionNum,
                cupoMaximo: cupoMaximoNum,
                anioLectivo: anioLectivoNum
            };

            if (formData.idEspecialidad && formData.idEspecialidad !== '') {
                const idEspecialidadNum = Number(formData.idEspecialidad);
                if (!isNaN(idEspecialidadNum) && idEspecialidadNum > 0) {
                    dataToSend.idEspecialidad = idEspecialidadNum;
                }
            }

            if (editingClase) {
                await API.put(`/clases/${editingClase.idClase}`, dataToSend);
                mostrarMensaje('Clase actualizada correctamente', 'success');
            } else {
                await API.post('/clases', dataToSend);
                mostrarMensaje('Clase creada correctamente', 'success');
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // ELIMINAR
    // ============================================================
    const handleDelete = async (clase) => {
        if (clase.cupoActual > 0) {
            mostrarMensaje(`No se puede eliminar porque tiene ${clase.cupoActual} estudiantes`, 'error');
            return;
        }
        if (window.confirm(`¿Eliminar la clase "${clase.nombreClase}"?`)) {
            try {
                await API.delete(`/clases/${clase.idClase}`);
                mostrarMensaje('Clase eliminada correctamente', 'success');
                cargarDatos();
            } catch (error) {
                mostrarMensaje('Error al eliminar', 'error');
            }
        }
    };

    // ============================================================
    // FILTRADO Y ESTADÍSTICAS
    // ============================================================
    const aniosDisponibles = useMemo(() => {
        const set = new Set(clases.map(c => Number(c.anioLectivo)));
        set.add(new Date().getFullYear());
        return Array.from(set).sort((a, b) => b - a);
    }, [clases]);

    const clasesFiltradas = useMemo(() => {
        return clases.filter(c => {
            // Año lectivo
            if (filterAnio && Number(c.anioLectivo) !== Number(filterAnio)) return false;

            // Nivel
            if (filterNivel !== 'todos' && Number(c.idNivel) !== Number(filterNivel)) return false;

            // Especialidad
            if (filterEspecialidad !== 'todas') {
                const espFiltro = parseInt(filterEspecialidad);
                const espClase = c.idEspecialidad ? Number(c.idEspecialidad) : 0;
                if (espFiltro === 0) {
                    if (espClase !== 0) return false;
                } else {
                    if (espClase !== espFiltro) return false;
                }
            }

            // Sección
            if (filterSeccion !== 'todas' && Number(c.idSeccion) !== Number(filterSeccion)) return false;

            // Estado de cupo
            const disponible = (c.cupoMaximo || 0) - (c.cupoActual || 0);
            if (filterEstado === 'con-cupo' && disponible <= 0) return false;
            if (filterEstado === 'llenas' && disponible > 0) return false;

            // Búsqueda
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    (c.nombreClase && c.nombreClase.toLowerCase().includes(term)) ||
                    (c.seccion && c.seccion.toLowerCase().includes(term))
                );
            }
            return true;
        });
    }, [clases, filterAnio, filterNivel, filterEspecialidad, filterSeccion, filterEstado, searchTerm]);

    const stats = useMemo(() => {
        const base = clases.filter(c => !filterAnio || Number(c.anioLectivo) === Number(filterAnio));
        const cuposMax = base.reduce((sum, c) => sum + (c.cupoMaximo || 0), 0);
        const cuposAct = base.reduce((sum, c) => sum + (c.cupoActual || 0), 0);
        return {
            total: base.length,
            cuposMax,
            cuposAct,
            cuposDisponibles: cuposMax - cuposAct,
            llenas: base.filter(c => (c.cupoMaximo || 0) - (c.cupoActual || 0) <= 0).length
        };
    }, [clases, filterAnio]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Clases - Dirección">
                <div className="loading">Cargando datos...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Gestión de Clases - Dirección">
            <style>{`
                .gcl-container { display: flex; flex-direction: column; gap: 20px; }
                .gcl-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .gcl-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }

                .gcl-filtros { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 14px; }
                .gcl-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .gcl-field input, .gcl-field select {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                    font-family: inherit; transition: border-color .2s, box-shadow .2s;
                }
                .gcl-field input:focus, .gcl-field select:focus {
                    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }

                .gcl-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
                .gcl-stat { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; background: #f8fafc; }
                .gcl-stat .num { font-size: 24px; font-weight: bold; display: block; line-height: 1.2; }
                .gcl-stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #64748b; margin-top: 4px; }
                .gcl-stat-total { background: #eff6ff; color: #1e40af; }
                .gcl-stat-cupos { background: #dbeafe; color: #1d4ed8; }
                .gcl-stat-ocupados { background: #fef3c7; color: #b45309; }
                .gcl-stat-disponibles { background: #dcfce7; color: #15803d; }
                .gcl-stat-llenas { background: #fee2e2; color: #b91c1c; }

                .gcl-table { width: 100%; border-collapse: collapse; }
                .gcl-table thead th {
                    background: #1e3a5f; color: #fff; padding: 11px 10px;
                    text-align: left; font-size: 12px; text-transform: uppercase;
                    letter-spacing: .5px; font-weight: 600;
                }
                .gcl-table thead th:first-child { border-top-left-radius: 8px; }
                .gcl-table thead th:last-child { border-top-right-radius: 8px; }
                .gcl-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background .15s; }
                .gcl-table tbody tr:hover { background: #f8fafc; }
                .gcl-table tbody tr:nth-child(even) { background: #fafbfc; }
                .gcl-table tbody tr:nth-child(even):hover { background: #f1f5f9; }
                .gcl-table td { padding: 10px; font-size: 13px; color: #334155; vertical-align: middle; }

                .gcl-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                }

                .gcl-bar-container {
                    width: 100px; height: 8px; background: #e2e8f0;
                    border-radius: 4px; overflow: hidden; display: inline-block;
                    vertical-align: middle; margin-right: 8px;
                }
                .gcl-bar-fill { height: 100%; transition: width .3s; }

                .gcl-btn {
                    padding: 9px 16px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .gcl-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gcl-btn-primary { background: #1e3a5f; color: #fff; }
                .gcl-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gcl-btn-info { background: #3b82f6; color: #fff; }
                .gcl-btn-info:hover:not(:disabled) { background: #2563eb; }
                .gcl-btn-danger { background: #dc2626; color: #fff; }
                .gcl-btn-danger:hover:not(:disabled) { background: #b91c1c; }
                .gcl-btn-secondary { background: #e5e7eb; color: #334155; }
                .gcl-btn-secondary:hover:not(:disabled) { background: #d1d5db; }
                .gcl-btn-sm { padding: 5px 12px; font-size: 12px; }

                .gcl-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
                .gcl-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gcl-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                .gcl-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

                .gcl-modal-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(15,23,42,.55);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999; padding: 20px;
                }
                .gcl-modal {
                    background: #fff; border-radius: 12px;
                    max-width: 560px; width: 100%; padding: 24px;
                    max-height: 90vh; overflow-y: auto;
                }
                .gcl-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .gcl-modal-header h3 { margin: 0; font-size: 17px; color: #1e3a5f; }
                .gcl-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; line-height: 1; }
                .gcl-modal-close:hover { color: #dc2626; }
                .gcl-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

                .gcl-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .gcl-form-grid-full { grid-column: 1 / -1; }

                .gcl-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }
                .gcl-warning-text { color: #b45309; font-size: 12px; margin-top: 6px; display: block; }

                .gcl-acciones { display: flex; gap: 6px; flex-wrap: wrap; }

                @media (max-width: 900px) {
                    .gcl-filtros { grid-template-columns: 1fr 1fr; }
                    .gcl-form-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .gcl-filtros { grid-template-columns: 1fr; }
                    .gcl-table { font-size: 12px; }
                    .gcl-table thead th, .gcl-table td { padding: 8px 6px; }
                }
            `}</style>

            <div className="gcl-container">
                {message && <div className={`gcl-aviso ${messageType}`}>{message}</div>}

                {/* ESTADÍSTICAS */}
                <div className="gcl-stats">
                    <div className="gcl-stat gcl-stat-total">
                        <span className="num">{stats.total}</span>
                        <span className="lbl">Total Clases</span>
                    </div>
                    <div className="gcl-stat gcl-stat-cupos">
                        <span className="num">{stats.cuposMax}</span>
                        <span className="lbl">Cupos Totales</span>
                    </div>
                    <div className="gcl-stat gcl-stat-ocupados">
                        <span className="num">{stats.cuposAct}</span>
                        <span className="lbl">Ocupados</span>
                    </div>
                    <div className="gcl-stat gcl-stat-disponibles">
                        <span className="num">{stats.cuposDisponibles}</span>
                        <span className="lbl">Disponibles</span>
                    </div>
                    <div className="gcl-stat gcl-stat-llenas">
                        <span className="num">{stats.llenas}</span>
                        <span className="lbl">Clases Llenas</span>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="gcl-card">
                    <h3>Filtros y Búsqueda</h3>
                    <div className="gcl-filtros">
                        <div className="gcl-field">
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Nombre de clase o sección..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="gcl-field">
                            <label>Año Lectivo</label>
                            <select value={filterAnio} onChange={(e) => setFilterAnio(e.target.value)}>
                                {aniosDisponibles.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <div className="gcl-field">
                            <label>Nivel</label>
                            <select value={filterNivel} onChange={(e) => setFilterNivel(e.target.value)}>
                                <option value="todos">Todos</option>
                                {niveles.map(n => (
                                    <option key={n.idNivel} value={n.idNivel}>{n.nombreNivel}</option>
                                ))}
                            </select>
                        </div>
                        <div className="gcl-field">
                            <label>Especialidad</label>
                            <select value={filterEspecialidad} onChange={(e) => setFilterEspecialidad(e.target.value)}>
                                <option value="todas">Todas</option>
                                <option value="0">Bachillerato General</option>
                                {especialidades.map(e => (
                                    <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                        {e.nombreEspecialidad}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="gcl-field">
                            <label>Sección</label>
                            <select value={filterSeccion} onChange={(e) => setFilterSeccion(e.target.value)}>
                                <option value="todas">Todas</option>
                                {secciones.map(s => (
                                    <option key={s.idSeccion} value={s.idSeccion}>Sección {s.nombreSeccion}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px', alignItems: 'center' }}>
                        <div className="gcl-field" style={{ marginBottom: 0 }}>
                            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={{ minWidth: '180px' }}>
                                <option value="todas">Todas las clases</option>
                                <option value="con-cupo">Solo con cupo disponible</option>
                                <option value="llenas">Solo llenas</option>
                            </select>
                        </div>
                        <button
                            className="gcl-btn gcl-btn-primary"
                            onClick={() => handleOpenModal()}
                        >
                            + Nueva Clase
                        </button>
                        <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>
                            Mostrando <strong>{clasesFiltradas.length}</strong> de {clases.length} clases
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="gcl-card">
                    <h3>Lista de Clases</h3>
                    <div className="table-responsive">
                        <table className="gcl-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '55px' }}>ID</th>
                                    <th>Nivel</th>
                                    <th>Año</th>
                                    <th>Especialidad</th>
                                    <th style={{ width: '80px', textAlign: 'center' }}>Sección</th>
                                    <th>Nombre Clase</th>
                                    <th style={{ width: '130px' }}>Cupos</th>
                                    <th style={{ width: '100px' }}>Año Lectivo</th>
                                    <th style={{ width: '180px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clasesFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="gcl-empty">
                                            No hay clases que coincidan con los filtros
                                        </td>
                                    </tr>
                                ) : (
                                    clasesFiltradas.map((c) => {
                                        const max = c.cupoMaximo || 0;
                                        const actual = c.cupoActual || 0;
                                        const disponible = max - actual;
                                        const porcentaje = max > 0 ? (actual / max) * 100 : 0;
                                        const barColor = disponible <= 0
                                            ? '#dc2626'
                                            : porcentaje >= 80
                                                ? '#e67e22'
                                                : '#16a34a';
                                        return (
                                            <tr key={c.idClase}>
                                                <td style={{ color: '#64748b' }}>{c.idClase}</td>
                                                <td style={{ fontSize: '12px' }}>{getNivelNombre(c.idNivel)}</td>
                                                <td style={{ fontSize: '12px' }}>{getGradoNombre(c.idGrado)}</td>
                                                <td style={{ fontSize: '12px' }}>{getEspecialidadNombre(c.idEspecialidad)}</td>
                                                <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                    {getSeccionNombre(c.idSeccion)}
                                                </td>
                                                <td><strong>{c.nombreClase}</strong></td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ fontSize: '12px', color: '#475569' }}>
                                                            <strong>{actual}</strong> / {max}
                                                        </div>
                                                        <div className="gcl-bar-container">
                                                            <div
                                                                className="gcl-bar-fill"
                                                                style={{ width: `${porcentaje}%`, backgroundColor: barColor }}
                                                            />
                                                        </div>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: disponible > 0 ? '#15803d' : '#b91c1c'
                                                        }}>
                                                            {disponible > 0 ? `${disponible} disponibles` : 'LLENA'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '12px' }}>{c.anioLectivo}</td>
                                                <td>
                                                    <div className="gcl-acciones">
                                                        <button
                                                            className="gcl-btn gcl-btn-info gcl-btn-sm"
                                                            onClick={() => handleOpenModal(c)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="gcl-btn gcl-btn-danger gcl-btn-sm"
                                                            onClick={() => handleDelete(c)}
                                                            disabled={actual > 0}
                                                            title={actual > 0 ? 'No se puede eliminar con estudiantes matriculados' : 'Eliminar'}
                                                        >
                                                            Eliminar
                                                        </button>
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

            {/* MODAL CREAR / EDITAR */}
            {showModal && (
                <div className="gcl-modal-overlay" onClick={() => !saving && setShowModal(false)}>
                    <div className="gcl-modal" onClick={e => e.stopPropagation()}>
                        <div className="gcl-modal-header">
                            <h3>{editingClase ? 'Editar Clase' : 'Nueva Clase'}</h3>
                            <button className="gcl-modal-close" onClick={() => setShowModal(false)} disabled={saving}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="gcl-form-grid">
                                <div className="gcl-field">
                                    <label>Nivel *</label>
                                    <select
                                        value={formData.idNivel}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            idNivel: e.target.value,
                                            idGrado: '',
                                            idEspecialidad: Number(e.target.value) === 1 ? '' : formData.idEspecialidad
                                        })}
                                        required
                                    >
                                        <option value="">Seleccionar Nivel</option>
                                        {niveles.map((n) => (
                                            <option key={n.idNivel} value={n.idNivel}>
                                                {n.nombreNivel}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="gcl-field">
                                    <label>Año que cursa *</label>
                                    <select
                                        value={formData.idGrado}
                                        onChange={(e) => setFormData({ ...formData, idGrado: e.target.value })}
                                        required
                                        disabled={!formData.idNivel}
                                    >
                                        <option value="">Seleccionar Año</option>
                                        {getGradosDeNivel(formData.idNivel).map((g) => (
                                            <option key={g.idGrados} value={g.idGrados}>
                                                {g.nombreGrado}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="gcl-field gcl-form-grid-full">
                                    <label>Especialidad</label>
                                    <select
                                        value={formData.idEspecialidad}
                                        onChange={(e) => setFormData({ ...formData, idEspecialidad: e.target.value })}
                                        disabled={!formData.idNivel || Number(formData.idNivel) === 1}
                                    >
                                        <option value="">
                                            {Number(formData.idNivel) === 1 ? 'Bachillerato General (sin especialidad)' : 'Bachillerato General'}
                                        </option>
                                        {getEspecialidadesDeNivel(formData.idNivel).map((e) => (
                                            <option key={e.idEspecialidad} value={e.idEspecialidad}>
                                                {e.nombreEspecialidad}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.idNivel && Number(formData.idNivel) > 1 && getEspecialidadesDeNivel(formData.idNivel).length > 0 && (
                                        <small className="gcl-warning-text">Obligatoria para niveles técnicos</small>
                                    )}
                                </div>

                                <div className="gcl-field">
                                    <label>Sección *</label>
                                    <select
                                        value={formData.idSeccion}
                                        onChange={(e) => setFormData({ ...formData, idSeccion: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar Sección</option>
                                        {secciones.map((s) => (
                                            <option key={s.idSeccion} value={s.idSeccion}>
                                                Sección {s.nombreSeccion}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="gcl-field">
                                    <label>Cupo Máximo</label>
                                    <input
                                        type="number"
                                        value={formData.cupoMaximo}
                                        onChange={(e) => setFormData({ ...formData, cupoMaximo: e.target.value })}
                                        min="1"
                                    />
                                </div>

                                <div className="gcl-field gcl-form-grid-full">
                                    <label>Año Lectivo</label>
                                    <input
                                        type="number"
                                        value={formData.anioLectivo}
                                        onChange={(e) => setFormData({ ...formData, anioLectivo: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="gcl-modal-actions">
                                <button type="button" className="gcl-btn gcl-btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>
                                    Cancelar
                                </button>
                                <button type="submit" className="gcl-btn gcl-btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : (editingClase ? 'Actualizar' : 'Crear Clase')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionClases;