// Componente GestionConstancias (Registro Academico): emision, edicion, anulacion y consulta de constancias
// (estudio, conducta e incapacidad/permiso) para Registro Academico.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionConstancias = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [clases, setClases] = useState([]);
    const [constancias, setConstancias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [formatoGenerar, setFormatoGenerar] = useState('pdf');

    const [form, setForm] = useState({
        idEstudiante: '',
        tipo: 'Estudio',
        motivo: '',
        fechaInicio: '',
        cantidadDias: '',
        trajoDocumento: false,
        encargadoPresente: false,
        permisoAsistencias: false,
        observaciones: ''
    });
    const [archivo, setArchivo] = useState(null);
    const [editandoId, setEditandoId] = useState(null);
    const [detalle, setDetalle] = useState(null);

    const [filtroClase, setFiltroClase] = useState('');
    const [filtroBusqueda, setFiltroBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
    const [claseEstudianteForm, setClaseEstudianteForm] = useState('');

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [estudiantesRes, constanciasRes, clasesRes] = await Promise.all([
                API.get('/estudiantes'),
                API.get('/constancias'),
                API.get('/clases')
            ]);
            setEstudiantes(estudiantesRes.data || []);
            setConstancias(constanciasRes.data || []);
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

    const cambiarCampo = (campo, valor) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const resetForm = () => {
        setForm({
            idEstudiante: '',
            tipo: 'Estudio',
            motivo: '',
            fechaInicio: '',
            cantidadDias: '',
            trajoDocumento: false,
            encargadoPresente: false,
            permisoAsistencias: false,
            observaciones: ''
        });
        setArchivo(null);
        setEditandoId(null);
        setFormatoGenerar('pdf');
    };

    const tipoLabel = (tipo) => {
        const tipos = {
            Estudio: 'Estudio',
            Conducta: 'Conducta',
            Incapacidad: 'Incapacidad / Permiso',
            'titulo_en_proceso': 'Titulo en Proceso'
        };
        return tipos[tipo] || tipo;
    };

    const nombreEstudiante = (id) => {
        const est = estudiantes.find(e => e.idEstudiante === parseInt(id));
        return est ? `${est.nombres} ${est.apellidos}` : `#${id}`;
    };

    const fechaLabel = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString();
    };

    const esIncapacidad = form.tipo === 'Incapacidad';

    const formatosDisponibles = [
        { valor: 'pdf', etiqueta: 'PDF', descripcion: 'Documento portatil para imprimir' },
        { valor: 'word', etiqueta: 'Word (.docx)', descripcion: 'Documento editable con estilos' },
        { valor: 'excel', etiqueta: 'Excel (.xlsx)', descripcion: 'Reporte con datos tabulados' }
    ];

    const limpiarFiltros = () => {
        setFiltroClase('');
        setFiltroBusqueda('');
        setFiltroTipo('');
        setFiltroEstado('');
    };

    const terminoBusqueda = filtroBusqueda.trim().toLowerCase();
    const constanciasFiltradas = constancias.filter(c => {
        if (filtroClase && c.clase !== filtroClase) return false;
        if (filtroTipo && c.tipo !== filtroTipo) return false;
        if (filtroEstado && c.estado !== filtroEstado) return false;
        if (!terminoBusqueda) return true;
        const nombre = (c.estudiante || nombreEstudiante(c.idEstudiante)).toLowerCase();
        const codigo = (c.codigoEstudiante || '').toLowerCase();
        const nie = (c.nie || '').toLowerCase();
        return nombre.includes(terminoBusqueda) || codigo.includes(terminoBusqueda) || nie.includes(terminoBusqueda);
    });

    const terminoEstudiante = busquedaEstudiante.trim().toLowerCase();
    const claseFormSeleccionada = parseInt(claseEstudianteForm) || null;
    const estudiantesForm = estudiantes.filter(e =>
        (!claseFormSeleccionada || e.idClase === claseFormSeleccionada) &&
        (!terminoEstudiante ||
            `${e.nombres} ${e.apellidos} ${e.codigoEstudiante || ''} ${e.nie || ''} ${e.dui || ''}`.toLowerCase().includes(terminoEstudiante))
    );

    const generarConstancia = async () => {
        if (!form.idEstudiante) {
            mostrarMensaje('Seleccione un estudiante', 'error');
            return;
        }
        setGuardando(true);
        setMensaje(null);
        try {
            const timestamp = Date.now();
            const res = await API.get(`/constancias/generar/${form.idEstudiante}/${formatoGenerar}?_t=${timestamp}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            const estudiante = estudiantes.find(e => e.idEstudiante === parseInt(form.idEstudiante));
            const codigo = estudiante?.codigoEstudiante || 'estudiante';
            let nombreArchivo;
            if (formatoGenerar === 'pdf') nombreArchivo = `constancia_${codigo}.pdf`;
            else if (formatoGenerar === 'word') nombreArchivo = `constancia_${codigo}.docx`;
            else nombreArchivo = `reporte_${codigo}.xlsx`;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            mostrarMensaje('Constancia generada y descargada correctamente', 'success');
        } catch (error) {
            console.error('Error generando constancia:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al generar la constancia', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const emitir = async () => {
        if (!form.idEstudiante) {
            mostrarMensaje('Seleccione un estudiante', 'error');
            return;
        }
        if (form.tipo === 'Incapacidad') {
            if (!form.fechaInicio || !form.cantidadDias) {
                mostrarMensaje('Para incapacidad debe indicar fecha de inicio y cantidad de dias', 'error');
                return;
            }
            if (parseInt(form.cantidadDias) < 1) {
                mostrarMensaje('La cantidad de dias debe ser mayor a 0', 'error');
                return;
            }
        }

        setGuardando(true);
        setMensaje(null);

        const fd = new FormData();
        fd.append('IdEstudiante', form.idEstudiante);
        fd.append('Tipo', form.tipo);
        fd.append('Motivo', form.motivo || '');
        fd.append('FechaInicio', form.fechaInicio || '');
        fd.append('CantidadDias', form.cantidadDias || '');
        fd.append('TrajoDocumento', Boolean(form.trajoDocumento).toString());
        fd.append('EncargadoPresente', Boolean(form.encargadoPresente).toString());
        fd.append('PermisoAsistencias', Boolean(form.permisoAsistencias).toString());
        fd.append('Observaciones', form.observaciones || '');
        if (archivo) fd.append('Documento', archivo);

        try {
            if (editandoId) {
                await API.put(`/constancias/${editandoId}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                mostrarMensaje('Constancia actualizada correctamente', 'success');
            } else {
                await API.post('/constancias', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                mostrarMensaje('Constancia emitida correctamente', 'success');
            }
            resetForm();
            await cargarDatos();
        } catch (error) {
            console.error('Error guardando constancia:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar la constancia', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const editar = (c) => {
        setEditandoId(c.idConstancia);
        setForm({
            idEstudiante: String(c.idEstudiante),
            tipo: c.tipo,
            motivo: c.motivo || '',
            fechaInicio: c.fechaInicio ? String(c.fechaInicio).slice(0, 10) : '',
            cantidadDias: c.cantidadDias ? String(c.cantidadDias) : '',
            trajoDocumento: c.trajoDocumento || false,
            encargadoPresente: c.encargadoPresente || false,
            permisoAsistencias: c.permisoAsistencias || false,
            observaciones: c.observaciones || ''
        });
        setArchivo(null);
        setFormatoGenerar('pdf');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const anular = async (c) => {
        if (!window.confirm(`Anular la constancia de ${nombreEstudiante(c.idEstudiante)}?\nSe revertiran los permisos automaticos de asistencia aplicados.`)) return;
        try {
            await API.post(`/constancias/${c.idConstancia}/anular`);
            mostrarMensaje('Constancia anulada correctamente', 'success');
            await cargarDatos();
        } catch (error) {
            console.error('Error anulando constancia:', error);
            mostrarMensaje(error.response?.data?.mensaje || 'Error al anular la constancia', 'error');
        }
    };

    const descargarDocumento = async (c) => {
        try {
            const res = await API.get(`/constancias/${c.idConstancia}/documento`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', c.nombreArchivo || `constancia_${c.idConstancia}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando documento:', error);
            mostrarMensaje('Error al descargar el documento', 'error');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Constancias">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Constancias - Registro Academico">
            <style>{`
                .const-container { display: flex; flex-direction: column; gap: 20px; }
                .const-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
                .const-card h3 { margin: 0 0 16px; color: #2c3e50; }
                .const-card h4 { margin: 16px 0 12px; color: #34495e; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
                .const-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
                .const-field label { display: block; font-weight: 600; color: #34495e; font-size: 13px; margin-bottom: 6px; }
                .const-field input, .const-field select, .const-field textarea {
                    width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box;
                }
                .const-field textarea { min-height: 64px; resize: vertical; }
                .const-field input:disabled, .const-field select:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
                .const-checks { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 4px; }
                .const-checks label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #34495e; cursor: pointer; }
                .const-checks input[type=checkbox] { width: 16px; height: 16px; }
                .const-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
                .const-tabla { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .const-tabla th, .const-tabla td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; font-size: 13px; }
                .const-tabla th { background: #f8fafc; font-weight: 600; color: #34495e; }
                .const-tabla tr:hover { background: #f8fafc; }
                .const-badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #fff; }
                .const-badge.activa { background: #27ae60; }
                .const-badge.anulada { background: #e74c3c; }
                .const-aviso { padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
                .const-aviso.success { background: #d1fae5; color: #065f46; }
                .const-aviso.error { background: #fee2e2; color: #991b1b; }
                .const-filtros { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 14px; }
                .const-filtros input[type=text] { flex: 1 1 220px; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
                .const-filtros select { min-width: 170px; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
                .const-filtros .const-resultados { font-size: 13px; color: #64748b; white-space: nowrap; }
                .const-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .const-modal { background: #fff; border-radius: 12px; width: 560px; max-width: 94vw; max-height: 90vh; overflow: auto; padding: 24px; }
                .const-modal h3 { margin: 0 0 16px; color: #2c3e50; }
                .const-detalle { font-size: 14px; }
                .const-detalle p { margin: 8px 0; color: #475569; }
                .const-detalle b { color: #2c3e50; }
                .const-historial { margin-top: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
                .const-modal-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
                .format-option { padding: 6px 12px; border: 1px solid #dee2e6; border-radius: 6px; margin: 2px; cursor: pointer; display: inline-block; }
                .format-option.seleccionado { background: #3b82f6; color: white; }
                .const-btn-generar { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
                .const-btn-generar:disabled { background: #6b7280; cursor: not-allowed; }
                .const-btn-primary { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
                .const-btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
                .btn { padding: 6px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
                .btn-sm { padding: 4px 10px; font-size: 12px; }
                .btn-primary { background: #3b82f6; color: white; }
                .btn-secondary { background: #6b7280; color: white; }
                .btn-success { background: #10b981; color: white; }
                .btn-danger { background: #ef4444; color: white; }
                .btn-cancel { background: #6b7280; color: white; }
            `}</style>

            <div className="const-container">
                {mensaje && <div className={`const-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                <div className="const-card">
                    <h3>{editandoId ? `Editar Constancia #${editandoId}` : 'Emitir Constancia'}</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Tipos: Estudio, Conducta, Incapacidad / Permiso</p>

                    <div className="const-grid">
                        <div className="const-field">
                            <label>Estudiante</label>
                            <select
                                value={claseEstudianteForm}
                                onChange={(e) => {
                                    setClaseEstudianteForm(e.target.value);
                                    setBusquedaEstudiante('');
                                    cambiarCampo('idEstudiante', '');
                                }}
                                style={{ marginBottom: '6px' }}
                            >
                                <option value="">Todas las clases</option>
                                {clases.map(c => (
                                    <option key={c.idClase} value={c.idClase}>
                                        {c.nombreClase} (Seccion {c.seccion}) - {c.anioLectivo}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, codigo, NIE o DUI..."
                                value={busquedaEstudiante}
                                onChange={(e) => setBusquedaEstudiante(e.target.value)}
                                style={{ marginBottom: '6px' }}
                            />
                            <select value={form.idEstudiante} onChange={(e) => cambiarCampo('idEstudiante', e.target.value)}>
                                <option value="">Seleccione un estudiante</option>
                                {estudiantesForm.map(e => (
                                    <option key={e.idEstudiante} value={e.idEstudiante}>
                                        {e.nombres} {e.apellidos} - Cod: {e.codigoEstudiante} {e.nie ? `| NIE: ${e.nie}` : ''}
                                    </option>
                                ))}
                            </select>
                            <small style={{ display: 'block', marginTop: '4px', color: '#64748b', fontSize: '12px' }}>
                                {estudiantesForm.length} estudiante(s) encontrados
                            </small>
                        </div>
                        <div className="const-field">
                            <label>Tipo de Constancia</label>
                            <select value={form.tipo} onChange={(e) => cambiarCampo('tipo', e.target.value)}>
                                <option value="Estudio">Constancia de Estudio</option>
                                <option value="Conducta">Constancia de Conducta</option>
                                <option value="Incapacidad">Incapacidad / Permiso</option>
                            </select>
                        </div>
                        {esIncapacidad && (
                            <>
                                <div className="const-field">
                                    <label>Fecha de Inicio</label>
                                    <input type="date" value={form.fechaInicio} onChange={(e) => cambiarCampo('fechaInicio', e.target.value)} />
                                </div>
                                <div className="const-field">
                                    <label>Dias</label>
                                    <input
                                        type="number" min="1" max="120"
                                        placeholder="Ej: 3"
                                        value={form.cantidadDias}
                                        onChange={(e) => cambiarCampo('cantidadDias', e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                        <div className="const-field" style={esIncapacidad ? {} : { gridColumn: '1 / -1' }}>
                            <label>Motivo</label>
                            <input
                                type="text"
                                placeholder="Motivo de la constancia (ej: presento constancia medica)"
                                value={form.motivo}
                                onChange={(e) => cambiarCampo('motivo', e.target.value)}
                            />
                        </div>
                        <div className="const-field">
                            <label>Observaciones</label>
                            <textarea
                                placeholder="Observaciones adicionales (opcional)"
                                value={form.observaciones}
                                onChange={(e) => cambiarCampo('observaciones', e.target.value)}
                            />
                        </div>
                        <div className="const-field">
                            <label>Documento adjunto {editandoId ? '(dejar vacio para conservarlo)' : '(PDF o imagen, opcional)'}</label>
                            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setArchivo(e.target.files[0] || null)} />
                        </div>
                    </div>

                    <div className="const-checks">
                        <label>
                            <input
                                type="checkbox"
                                checked={form.trajoDocumento}
                                onChange={(e) => cambiarCampo('trajoDocumento', e.target.checked)}
                            />
                            Trajo documento
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={form.encargadoPresente}
                                onChange={(e) => cambiarCampo('encargadoPresente', e.target.checked)}
                            />
                            Encargado presente
                        </label>
                        {esIncapacidad && (
                            <label>
                                <input
                                    type="checkbox"
                                    checked={form.permisoAsistencias}
                                    onChange={(e) => cambiarCampo('permisoAsistencias', e.target.checked)}
                                />
                                Permiso automatico en asistencias
                            </label>
                        )}
                    </div>

                    <div className="const-actions">
                        <button className="const-btn-generar" onClick={emitir} disabled={guardando}>
                            {guardando ? 'Guardando...' : (editandoId ? 'Guardar Cambios' : 'Emitir Constancia')}
                        </button>
                        {editandoId && (
                            <button className="const-btn-generar" style={{ background: '#6b7280' }} onClick={resetForm} disabled={guardando}>Cancelar</button>
                        )}
                        {form.idEstudiante && (
                            <button className="const-btn-generar" style={{ marginLeft: '10px', background: '#3b82f6' }} onClick={generarConstancia} disabled={guardando}>
                                Generar {formatoGenerar === 'pdf' ? 'PDF' : formatoGenerar === 'word' ? 'Word' : 'Excel'}
                            </button>
                        )}
                    </div>

                    {form.idEstudiante && (
                        <div style={{ marginTop: '12px', padding: '8px', background: '#f8fafc', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                            <small>Generar en:</small>
                            {formatosDisponibles.map(f => (
                                <span
                                    key={f.valor}
                                    className={`format-option ${formatoGenerar === f.valor ? 'seleccionado' : ''}`}
                                    onClick={() => setFormatoGenerar(f.valor)}
                                >
                                    {f.etiqueta}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="const-card">
                    <h3>Constancias Emitidas</h3>
                    {constancias.length === 0 ? (
                        <p style={{ color: '#7f8c8d', textAlign: 'center' }}>No hay constancias emitidas.</p>
                    ) : (
                        <>
                            <div className="const-filtros">
                                <select value={filtroClase} onChange={(e) => setFiltroClase(e.target.value)}>
                                    <option value="">Todas las clases</option>
                                    {clases.map(c => (
                                        <option key={c.idClase} value={c.nombreClase}>
                                            {c.nombreClase} (Seccion {c.seccion}) - {c.anioLectivo}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, codigo, NIE o DUI..."
                                    value={filtroBusqueda}
                                    onChange={(e) => setFiltroBusqueda(e.target.value)}
                                />
                                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                                    <option value="">Todos los tipos</option>
                                    <option value="Estudio">Constancia de Estudio</option>
                                    <option value="Conducta">Constancia de Conducta</option>
                                    <option value="Incapacidad">Incapacidad / Permiso</option>
                                </select>
                                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                                    <option value="">Todos los estados</option>
                                    <option value="Activa">Activa</option>
                                    <option value="Anulada">Anulada</option>
                                </select>
                                {(filtroClase || filtroBusqueda || filtroTipo || filtroEstado) && (
                                    <button className="btn btn-cancel btn-sm" onClick={limpiarFiltros}>Limpiar</button>
                                )}
                                <span className="const-resultados">{constanciasFiltradas.length} de {constancias.length}</span>
                            </div>
                            {constanciasFiltradas.length === 0 ? (
                                <p style={{ color: '#7f8c8d', textAlign: 'center' }}>No hay constancias que coincidan con los filtros.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="const-tabla">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Estudiante</th>
                                                <th>Clase</th>
                                                <th>Tipo</th>
                                                <th>Rango</th>
                                                <th>Dias</th>
                                                <th>Emision</th>
                                                <th>Estado</th>
                                                <th>Documento</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {constanciasFiltradas.map(c => (
                                                <tr key={c.idConstancia}>
                                                    <td>{c.idConstancia}</td>
                                                    <td>
                                                        {c.estudiante || nombreEstudiante(c.idEstudiante)}
                                                        <br /><small style={{ color: '#9ca3af' }}>{c.codigoEstudiante}</small>
                                                        {c.nie && (
                                                            <><br /><small style={{ color: '#64748b' }}>NIE: {c.nie}</small></>
                                                        )}
                                                    </td>
                                                    <td>{c.clase || '-'}</td>
                                                    <td>{tipoLabel(c.tipo)}</td>
                                                    <td>
                                                        {c.tipo === 'Incapacidad'
                                                            ? `${fechaLabel(c.fechaInicio)} -> ${fechaLabel(c.fechaFin)}`
                                                            : 'N/A'}
                                                    </td>
                                                    <td>{c.cantidadDias || '-'}</td>
                                                    <td>{fechaLabel(c.fechaEmision)}</td>
                                                    <td>
                                                        <span className={`const-badge ${c.estado === 'Activa' ? 'activa' : 'anulada'}`}>
                                                            {c.estado}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {c.tieneDocumento ? (
                                                            <button className="btn btn-success btn-sm" onClick={() => descargarDocumento(c)}>
                                                                Descargar
                                                            </button>
                                                        ) : '-'}
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-primary btn-sm" onClick={() => setDetalle(c)}>Ver</button>
                                                        {c.estado === 'Activa' && (
                                                            <>
                                                                <button
                                                                    className="btn btn-secondary btn-sm"
                                                                    style={{ marginLeft: 6 }}
                                                                    onClick={() => editar(c)}
                                                                >Editar</button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    style={{ marginLeft: 6 }}
                                                                    onClick={() => anular(c)}
                                                                >Anular</button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {detalle && (
                    <div className="const-modal-overlay">
                        <div className="const-modal">
                            <h3>Constancia #{detalle.idConstancia} - {tipoLabel(detalle.tipo)}</h3>
                            <div className="const-detalle">
                                <p><b>Estudiante:</b> {detalle.estudiante || nombreEstudiante(detalle.idEstudiante)} ({detalle.codigoEstudiante || ''})</p>
                                {detalle.nie && <p><b>NIE:</b> {detalle.nie}</p>}
                                <p><b>Clase:</b> {detalle.clase || '-'}</p>
                                <p><b>Motivo:</b> {detalle.motivo || '-'}</p>
                                {detalle.tipo === 'Incapacidad' && (
                                    <>
                                        <p><b>Rango:</b> {fechaLabel(detalle.fechaInicio)} -> {fechaLabel(detalle.fechaFin)} ({detalle.cantidadDias} dias)</p>
                                        <p><b>Permiso automatico en asistencias:</b> {detalle.permisoAsistencias ? 'Si' : 'No'}</p>
                                    </>
                                )}
                                <p><b>Trajo documento:</b> {detalle.trajoDocumento ? 'Si' : 'No'}</p>
                                <p><b>Encargado presente:</b> {detalle.encargadoPresente ? 'Si' : 'No'}</p>
                                <p><b>Emision:</b> {fechaLabel(detalle.fechaEmision)}</p>
                                <p><b>Generada por:</b> {detalle.generadaPor || '-'}</p>
                                <p><b>Estado:</b> <span className={`const-badge ${detalle.estado === 'Activa' ? 'activa' : 'anulada'}`}>{detalle.estado}</span></p>
                                {detalle.observaciones && <p><b>Observaciones:</b> {detalle.observaciones}</p>}
                                <p><b>Documento adjunto:</b> {detalle.tieneDocumento ? detalle.nombreArchivo : 'Sin adjunto'}</p>
                            </div>
                            {detalle.tieneDocumento && (
                                <p className="const-historial">
                                    <button className="btn btn-success btn-sm" onClick={() => descargarDocumento(detalle)}>Descargar Documento</button>
                                </p>
                            )}
                            <div className="const-modal-buttons">
                                <button className="btn btn-cancel" onClick={() => setDetalle(null)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default GestionConstancias;