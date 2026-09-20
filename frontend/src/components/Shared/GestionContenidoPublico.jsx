// Componente: Gestión de Contenido Público con DRAG & DROP y configuración de imágenes
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PAGINAS = [
    { valor: 'home', etiqueta: 'Página Principal' },
    { valor: 'bachilleratos', etiqueta: 'Bachilleratos' },
    { valor: 'cultura', etiqueta: 'Cultura Institucional' },
    { valor: 'contacto', etiqueta: 'Contáctanos' },
    { valor: 'extracurriculares', etiqueta: 'Áreas Extracurriculares' }
];

const esUrlExterna = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
};

// Config por defecto si no hay
const CONFIG_DEFAULT = {
    ancho: '100%',
    alto: 'auto',
    alineacion: 'center',
    borderRadius: '8px',
    objectFit: 'cover'
};

// Parsear config desde JSON (con fallback)
const parsearConfig = (json) => {
    if (!json) return CONFIG_DEFAULT;
    try {
        const parsed = typeof json === 'string' ? JSON.parse(json) : json;
        return { ...CONFIG_DEFAULT, ...parsed };
    } catch {
        return CONFIG_DEFAULT;
    }
};

// ============================================================
// Bloque arrastrable con editor de imagen
// ============================================================
const BloqueArrastrable = ({ bloque, editandoId, guardando, onEditar, onGuardar, onCancelar, onEliminar, onActualizarCampo, onAbrirSelectorImagen }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: bloque.idContenido });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
        border: isDragging ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        boxShadow: isDragging ? '0 8px 20px rgba(59,130,246,.3)' : 'none'
    };

    const editando = editandoId === bloque.idContenido;
    const config = parsearConfig(bloque.imagenConfig);

    const actualizarConfig = (campo, valor) => {
        const nuevaConfig = { ...config, [campo]: valor };
        onActualizarCampo(bloque.idContenido, 'imagenConfig', JSON.stringify(nuevaConfig));
    };

    const imagenStyle = {
        width: config.ancho,
        height: config.alto,
        maxWidth: '100%',
        borderRadius: config.borderRadius,
        objectFit: config.objectFit,
        display: 'block',
        margin: config.alineacion === 'center' ? '0 auto' :
            config.alineacion === 'right' ? '0 0 0 auto' : '0 auto 0 0'
    };

    return (
        <div ref={setNodeRef} style={style} className="gc-bloque">
            <div className="gc-bloque-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div {...attributes} {...listeners} className="gc-drag-handle" title="Arrastra para reordenar">⋮⋮</div>
                    <div>
                        <div className="gc-bloque-seccion">
                            Sección: {bloque.seccion}
                            {!bloque.activo && <span style={{ color: '#dc2626', marginLeft: 8 }}>(Inactivo)</span>}
                            <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: '11px' }}>(orden: {bloque.orden})</span>
                        </div>
                        <div className="gc-bloque-meta">
                            Modificado por {bloque.modificadoPor || 'N/A'} el {new Date(bloque.fechaModificacion).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {editando ? (
                        <>
                            <button className="gc-btn gc-btn-success gc-btn-sm" onClick={() => onGuardar(bloque)} disabled={guardando}>
                                {guardando ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button className="gc-btn gc-btn-secondary gc-btn-sm" onClick={onCancelar}>Cancelar</button>
                        </>
                    ) : (
                        <>
                            <button className="gc-btn gc-btn-info gc-btn-sm" onClick={() => onEditar(bloque.idContenido)}>Editar</button>
                            <button className="gc-btn gc-btn-danger gc-btn-sm" onClick={() => onEliminar(bloque.idContenido)}>Eliminar</button>
                        </>
                    )}
                </div>
            </div>

            {editando ? (
                <>
                    <div className="gc-field">
                        <label>Título</label>
                        <input
                            value={bloque.titulo || ''}
                            onChange={(e) => onActualizarCampo(bloque.idContenido, 'titulo', e.target.value)}
                        />
                    </div>
                    <div className="gc-field">
                        <label>Contenido (puedes usar HTML)</label>
                        <textarea
                            value={bloque.contenido || ''}
                            onChange={(e) => onActualizarCampo(bloque.idContenido, 'contenido', e.target.value)}
                        />
                    </div>

                    {/* SECCIÓN DE IMAGEN */}
                    <div className="gc-imagen-section">
                        <div className="gc-imagen-section-title">📷 Imagen</div>

                        <div className="gc-field">
                            <label>
                                URL de imagen
                                <span style={{ fontWeight: 'normal', color: '#64748b', marginLeft: 6, fontSize: 11 }}>
                                    (local o externa)
                                </span>
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    value={bloque.imagenUrl || ''}
                                    onChange={(e) => onActualizarCampo(bloque.idContenido, 'imagenUrl', e.target.value)}
                                    placeholder="https://... o /uploads/contenido_publico/..."
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="gc-btn gc-btn-info gc-btn-sm"
                                    onClick={() => onAbrirSelectorImagen(bloque.idContenido)}
                                >
                                    Elegir
                                </button>
                            </div>
                        </div>

                        {bloque.imagenUrl && (
                            <>
                                <div className="gc-config-grid">
                                    <div className="gc-field">
                                        <label>Ancho</label>
                                        <input
                                            type="text"
                                            value={config.ancho}
                                            onChange={(e) => actualizarConfig('ancho', e.target.value)}
                                            placeholder="100%, 300px, 50%"
                                        />
                                        <div className="gc-presets">
                                            {['25%', '50%', '75%', '100%', '200px', '300px', '500px'].map(v => (
                                                <button key={v} type="button" className="gc-preset-btn" onClick={() => actualizarConfig('ancho', v)}>{v}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="gc-field">
                                        <label>Alto</label>
                                        <input
                                            type="text"
                                            value={config.alto}
                                            onChange={(e) => actualizarConfig('alto', e.target.value)}
                                            placeholder="auto, 200px, 400px"
                                        />
                                        <div className="gc-presets">
                                            {['auto', '150px', '250px', '350px', '500px'].map(v => (
                                                <button key={v} type="button" className="gc-preset-btn" onClick={() => actualizarConfig('alto', v)}>{v}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="gc-field">
                                        <label>Alineación</label>
                                        <select value={config.alineacion} onChange={(e) => actualizarConfig('alineacion', e.target.value)}>
                                            <option value="left">Izquierda</option>
                                            <option value="center">Centro</option>
                                            <option value="right">Derecha</option>
                                        </select>
                                    </div>

                                    <div className="gc-field">
                                        <label>Borde redondeado</label>
                                        <select value={config.borderRadius} onChange={(e) => actualizarConfig('borderRadius', e.target.value)}>
                                            <option value="0">Sin borde</option>
                                            <option value="4px">Pequeño (4px)</option>
                                            <option value="8px">Mediano (8px)</option>
                                            <option value="12px">Grande (12px)</option>
                                            <option value="20px">Muy grande (20px)</option>
                                            <option value="50%">Circular (50%)</option>
                                        </select>
                                    </div>

                                    <div className="gc-field">
                                        <label>Ajuste (cómo se recorta)</label>
                                        <select value={config.objectFit} onChange={(e) => actualizarConfig('objectFit', e.target.value)}>
                                            <option value="cover">Cubrir (recorta para llenar)</option>
                                            <option value="contain">Contener (imagen completa)</option>
                                            <option value="fill">Estirar (se deforma)</option>
                                            <option value="none">Tamaño original</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="gc-field">
                                    <label>Vista previa</label>
                                    <div className="gc-preview-container">
                                        <img
                                            src={bloque.imagenUrl}
                                            alt="Vista previa"
                                            style={imagenStyle}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {bloque.titulo && <p><strong>{bloque.titulo}</strong></p>}
                    <p style={{ color: '#475569', whiteSpace: 'pre-wrap', margin: '4px 0' }}>{bloque.contenido}</p>
                    {bloque.imagenUrl && (
                        <div style={{ marginTop: '12px' }}>
                            <img
                                src={bloque.imagenUrl}
                                alt="Contenido"
                                style={imagenStyle}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ============================================================
// Componente principal
// ============================================================
const GestionContenidoPublico = () => {
    const [paginaSeleccionada, setPaginaSeleccionada] = useState('home');
    const [contenido, setContenido] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [guardandoOrden, setGuardandoOrden] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showNuevoModal, setShowNuevoModal] = useState(false);
    const [nuevoBloque, setNuevoBloque] = useState({
        seccion: '',
        titulo: '',
        contenido: '',
        imagenUrl: '',
        orden: 0
    });
    const [editandoId, setEditandoId] = useState(null);
    const [imagenes, setImagenes] = useState([]);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [selectorImagenAbierto, setSelectorImagenAbierto] = useState(null);
    const [urlPersonalizada, setUrlPersonalizada] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        cargarContenido();
        cargarImagenes();
    }, [paginaSeleccionada]);

    const cargarContenido = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/contenido-publico/admin/${paginaSeleccionada}`);
            const data = (res.data || []).sort((a, b) => a.orden - b.orden);
            setContenido(data);
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error al cargar el contenido', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarImagenes = async () => {
        try {
            const res = await API.get(`/contenido-publico/imagenes/${paginaSeleccionada}`);
            setImagenes(res.data || []);
        } catch (error) {
            console.error('Error al cargar imágenes:', error);
        }
    };

    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = contenido.findIndex(c => c.idContenido === active.id);
        const newIndex = contenido.findIndex(c => c.idContenido === over.id);
        const nuevoOrden = arrayMove(contenido, oldIndex, newIndex);
        setContenido(nuevoOrden);

        setGuardandoOrden(true);
        try {
            const idsEnOrden = nuevoOrden.map(c => c.idContenido);
            await API.put(`/contenido-publico/reordenar/${paginaSeleccionada}`, { idsEnOrden });
            mostrarMensaje('Orden actualizado correctamente', 'success');

            const res = await API.get(`/contenido-publico/admin/${paginaSeleccionada}`);
            const data = (res.data || []).sort((a, b) => a.orden - b.orden);
            setContenido(data);
        } catch (error) {
            console.error('Error guardando orden:', error);
            mostrarMensaje('Error al guardar el orden', 'error');
            cargarContenido();
        } finally {
            setGuardandoOrden(false);
        }
    };

    const handleGuardar = async (bloque) => {
        setGuardando(true);
        try {
            await API.put(`/contenido-publico/${bloque.idContenido}`, {
                pagina: bloque.pagina,
                seccion: bloque.seccion,
                titulo: bloque.titulo,
                contenido: bloque.contenido,
                imagenUrl: bloque.imagenUrl,
                imagenConfig: bloque.imagenConfig,
                orden: bloque.orden,
                activo: bloque.activo
            });
            mostrarMensaje('Contenido actualizado', 'success');
            setEditandoId(null);
            cargarContenido();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al guardar', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const handleCrear = async () => {
        if (!nuevoBloque.seccion.trim()) {
            mostrarMensaje('La sección es requerida', 'error');
            return;
        }
        setGuardando(true);
        try {
            await API.post('/contenido-publico', {
                pagina: paginaSeleccionada,
                seccion: nuevoBloque.seccion,
                titulo: nuevoBloque.titulo,
                contenido: nuevoBloque.contenido,
                imagenUrl: nuevoBloque.imagenUrl,
                orden: contenido.length + 1,
                activo: true
            });
            mostrarMensaje('Bloque creado', 'success');
            setShowNuevoModal(false);
            setNuevoBloque({ seccion: '', titulo: '', contenido: '', imagenUrl: '', orden: 0 });
            cargarContenido();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al crear', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Eliminar este bloque de contenido?')) return;
        try {
            await API.delete(`/contenido-publico/${id}`);
            mostrarMensaje('Bloque eliminado', 'success');
            cargarContenido();
        } catch (error) {
            mostrarMensaje('Error al eliminar', 'error');
        }
    };

    const handleSubirImagen = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;

        setSubiendoImagen(true);
        try {
            const formData = new FormData();
            formData.append('archivo', archivo);
            formData.append('pagina', paginaSeleccionada);

            const res = await API.post('/contenido-publico/imagen', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            mostrarMensaje('Imagen subida: ' + res.data.ruta, 'success');
            cargarImagenes();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al subir imagen', 'error');
        } finally {
            setSubiendoImagen(false);
        }
    };

    const handleEliminarImagen = async (id) => {
        if (!window.confirm('¿Eliminar esta imagen?')) return;
        try {
            await API.delete(`/contenido-publico/imagen/${id}`);
            mostrarMensaje('Imagen eliminada', 'success');
            cargarImagenes();
        } catch (error) {
            mostrarMensaje('Error al eliminar imagen', 'error');
        }
    };

    const actualizarCampo = (id, campo, valor) => {
        setContenido(prev => prev.map(c =>
            c.idContenido === id ? { ...c, [campo]: valor } : c
        ));
    };

    const copiarRutaImagen = (ruta) => {
        navigator.clipboard.writeText(ruta);
        mostrarMensaje('Ruta copiada: ' + ruta, 'success');
    };

    const seleccionarImagen = (ruta) => {
        actualizarCampo(selectorImagenAbierto, 'imagenUrl', ruta);
        setSelectorImagenAbierto(null);
        setUrlPersonalizada('');
        mostrarMensaje('Imagen seleccionada', 'success');
    };

    const aplicarUrlPersonalizada = () => {
        if (!urlPersonalizada.trim()) {
            mostrarMensaje('Debes ingresar una URL', 'error');
            return;
        }
        actualizarCampo(selectorImagenAbierto, 'imagenUrl', urlPersonalizada.trim());
        setSelectorImagenAbierto(null);
        setUrlPersonalizada('');
        mostrarMensaje('URL aplicada', 'success');
    };

    return (
        <DashboardLayout title="Gestión de Contenido Público">
            <style>{`
                .gc-container { display: flex; flex-direction: column; gap: 20px; }
                .gc-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e2e8f0; }
                .gc-card h3 { margin: 0 0 16px; color: #1e3a5f; }
                .gc-selector { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
                .gc-btn-pagina { padding: 8px 16px; border: 2px solid #cbd5e1; background: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all .2s; }
                .gc-btn-pagina:hover { border-color: #3b82f6; }
                .gc-btn-pagina.active { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }
                .gc-bloque { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 14px; background: #fafbfc; transition: background .15s; }
                .gc-bloque:hover { background: #f1f5f9; }
                .gc-bloque-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
                .gc-bloque-seccion { font-weight: 600; color: #1e3a5f; font-size: 14px; }
                .gc-bloque-meta { font-size: 12px; color: #94a3b8; }
                .gc-drag-handle { cursor: grab; font-size: 20px; color: #94a3b8; padding: 4px 8px; border-radius: 4px; user-select: none; line-height: 1; letter-spacing: -2px; }
                .gc-drag-handle:hover { background: #e2e8f0; color: #1e3a5f; }
                .gc-drag-handle:active { cursor: grabbing; }
                .gc-field { margin-bottom: 10px; }
                .gc-field label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; }
                .gc-field input, .gc-field textarea, .gc-field select { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-family: inherit; box-sizing: border-box; }
                .gc-field textarea { min-height: 80px; resize: vertical; }
                .gc-btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all .2s; }
                .gc-btn-primary { background: #1e3a5f; color: #fff; }
                .gc-btn-primary:hover { background: #16293f; }
                .gc-btn-success { background: #16a34a; color: #fff; }
                .gc-btn-danger { background: #dc2626; color: #fff; }
                .gc-btn-secondary { background: #e5e7eb; color: #334155; }
                .gc-btn-info { background: #3b82f6; color: #fff; }
                .gc-btn-sm { padding: 5px 12px; font-size: 12px; }
                .gc-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gc-imagenes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
                .gc-imagen-item { position: relative; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #fff; cursor: pointer; transition: transform .15s; }
                .gc-imagen-item:hover { transform: scale(1.03); border-color: #3b82f6; }
                .gc-imagen-item img { width: 100%; height: 100px; object-fit: cover; display: block; }
                .gc-imagen-acciones { display: flex; gap: 4px; padding: 6px; }
                .gc-imagen-acciones button { flex: 1; border: none; border-radius: 4px; padding: 4px; cursor: pointer; font-size: 10px; }
                .gc-aviso { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
                .gc-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gc-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }
                .gc-modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(15,23,42,.55); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
                .gc-modal { background: #fff; border-radius: 12px; max-width: 700px; width: 100%; padding: 24px; max-height: 90vh; overflow-y: auto; }
                .gc-info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }
                .gc-drag-info { background: #fef3c7; border-left: 4px solid #e67e22; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; color: #92400e; }
                .gc-imagen-section { background: #fff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 14px; margin-top: 12px; }
                .gc-imagen-section-title { font-weight: 600; color: #1e3a5f; font-size: 13px; margin-bottom: 12px; }
                .gc-config-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 12px; }
                .gc-presets { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
                .gc-preset-btn { padding: 3px 8px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer; font-size: 11px; color: #475569; }
                .gc-preset-btn:hover { background: #3b82f6; color: #fff; border-color: #3b82f6; }
                .gc-preview-container { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; min-height: 100px; display: flex; align-items: center; justify-content: center; }
                .gc-tabs { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
                .gc-tab { padding: 8px 16px; cursor: pointer; border: none; background: none; font-size: 14px; color: #64748b; border-bottom: 2px solid transparent; }
                .gc-tab.active { color: #1e3a5f; border-bottom-color: #1e3a5f; font-weight: 600; }
            `}</style>

            <div className="gc-container">
                {message && <div className={`gc-aviso ${messageType}`}>{message}</div>}

                <div className="gc-card">
                    <h3>Selecciona la página a editar</h3>
                    <div className="gc-selector">
                        {PAGINAS.map(p => (
                            <button
                                key={p.valor}
                                className={`gc-btn-pagina ${paginaSeleccionada === p.valor ? 'active' : ''}`}
                                onClick={() => setPaginaSeleccionada(p.valor)}
                            >
                                {p.etiqueta}
                            </button>
                        ))}
                    </div>

                    <div className="gc-info-box">
                        <strong>¿Cómo funciona?</strong> Los bloques se muestran en el orden indicado.
                        La <strong>sección</strong> identifica cada bloque (ej: "historia", "mision").
                        Ahora puedes <strong>configurar el tamaño de las imágenes</strong>: ancho, alto, alineación, bordes y ajuste.
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="gc-btn gc-btn-primary" onClick={() => setShowNuevoModal(true)}>
                            + Agregar bloque
                        </button>
                        <label className="gc-btn gc-btn-info" style={{ cursor: 'pointer', display: 'inline-block' }}>
                            {subiendoImagen ? 'Subiendo...' : 'Subir imagen desde mi PC'}
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleSubirImagen}
                                disabled={subiendoImagen}
                            />
                        </label>
                    </div>
                </div>

                <div className="gc-card">
                    <h3>
                        Bloques de contenido - {PAGINAS.find(p => p.valor === paginaSeleccionada)?.etiqueta}
                        {guardandoOrden && (
                            <span style={{ marginLeft: 12, color: '#3b82f6', fontSize: 13, fontWeight: 'normal' }}>
                                Guardando orden...
                            </span>
                        )}
                    </h3>

                    <div className="gc-drag-info">
                        <strong>Tip:</strong> Arrastra el ícono <strong>⋮⋮</strong> a la izquierda de cada bloque para reordenarlos.
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Cargando...</p>
                    ) : contenido.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                            No hay bloques de contenido. Haz clic en "Agregar bloque" para crear el primero.
                        </p>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={contenido.map(c => c.idContenido)} strategy={verticalListSortingStrategy}>
                                {contenido.map(bloque => (
                                    <BloqueArrastrable
                                        key={bloque.idContenido}
                                        bloque={bloque}
                                        editandoId={editandoId}
                                        guardando={guardando}
                                        onEditar={setEditandoId}
                                        onGuardar={handleGuardar}
                                        onCancelar={() => { setEditandoId(null); cargarContenido(); }}
                                        onEliminar={handleEliminar}
                                        onActualizarCampo={actualizarCampo}
                                        onAbrirSelectorImagen={setSelectorImagenAbierto}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {/* Imágenes subidas */}
                <div className="gc-card">
                    <h3>Imágenes subidas para esta página</h3>
                    {imagenes.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay imágenes subidas</p>
                    ) : (
                        <div className="gc-imagenes-grid">
                            {imagenes.map(img => (
                                <div key={img.idImagen} className="gc-imagen-item">
                                    <img src={img.ruta} alt={img.nombreArchivo} />
                                    <div className="gc-imagen-acciones">
                                        <button className="gc-btn gc-btn-info" onClick={() => copiarRutaImagen(img.ruta)}>
                                            Copiar ruta
                                        </button>
                                        <button className="gc-btn gc-btn-danger" onClick={() => handleEliminarImagen(img.idImagen)}>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal nuevo bloque */}
            {showNuevoModal && (
                <div className="gc-modal-overlay" onClick={() => !guardando && setShowNuevoModal(false)}>
                    <div className="gc-modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Nuevo bloque de contenido</h3>
                        <div className="gc-field">
                            <label>Sección * (identificador único, ej: "historia")</label>
                            <input
                                value={nuevoBloque.seccion}
                                onChange={e => setNuevoBloque({ ...nuevoBloque, seccion: e.target.value })}
                                placeholder="ej: historia, mision, vision, hero-titulo"
                            />
                        </div>
                        <div className="gc-field">
                            <label>Título</label>
                            <input
                                value={nuevoBloque.titulo}
                                onChange={e => setNuevoBloque({ ...nuevoBloque, titulo: e.target.value })}
                            />
                        </div>
                        <div className="gc-field">
                            <label>Contenido (puedes usar HTML)</label>
                            <textarea
                                value={nuevoBloque.contenido}
                                onChange={e => setNuevoBloque({ ...nuevoBloque, contenido: e.target.value })}
                            />
                        </div>
                        <div className="gc-field">
                            <label>URL de imagen (opcional)</label>
                            <input
                                value={nuevoBloque.imagenUrl}
                                onChange={e => setNuevoBloque({ ...nuevoBloque, imagenUrl: e.target.value })}
                                placeholder="https://... o /uploads/..."
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button className="gc-btn gc-btn-secondary" onClick={() => setShowNuevoModal(false)}>Cancelar</button>
                            <button className="gc-btn gc-btn-primary" onClick={handleCrear} disabled={guardando}>
                                {guardando ? 'Guardando...' : 'Crear bloque'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal selector de imagen */}
            {selectorImagenAbierto && (
                <div className="gc-modal-overlay" onClick={() => setSelectorImagenAbierto(null)}>
                    <div className="gc-modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Seleccionar imagen</h3>

                        <div className="gc-tabs">
                            <button className="gc-tab active">Imágenes subidas</button>
                            <button className="gc-tab" onClick={() => { }}>Usar URL externa</button>
                        </div>

                        <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                                Pegar URL de imagen externa (internet)
                            </label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    value={urlPersonalizada}
                                    onChange={(e) => setUrlPersonalizada(e.target.value)}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}
                                />
                                <button className="gc-btn gc-btn-primary" onClick={aplicarUrlPersonalizada}>
                                    Aplicar
                                </button>
                            </div>
                            <small style={{ display: 'block', marginTop: 6, color: '#64748b', fontSize: 11 }}>
                                Ejemplo: https://picsum.photos/800/400
                            </small>
                        </div>

                        <h4 style={{ marginBottom: 8, color: '#334155', fontSize: 14 }}>
                            Imágenes subidas en esta página:
                        </h4>
                        {imagenes.length === 0 ? (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>
                                No hay imágenes subidas. Sube una desde el botón "Subir imagen desde mi PC".
                            </p>
                        ) : (
                            <div className="gc-imagenes-grid">
                                {imagenes.map(img => (
                                    <div
                                        key={img.idImagen}
                                        className="gc-imagen-item"
                                        onClick={() => seleccionarImagen(img.ruta)}
                                    >
                                        <img src={img.ruta} alt={img.nombreArchivo} />
                                        <div style={{ padding: 6, fontSize: 10, color: '#64748b', textAlign: 'center' }}>
                                            {img.nombreArchivo}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="gc-btn gc-btn-secondary" onClick={() => setSelectorImagenAbierto(null)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionContenidoPublico;