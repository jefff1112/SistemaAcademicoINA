// Componente Gestión de Aspirantes (Registro Académico): lista, filtra, busca y edita aspirantes.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const GestionAspirantesRegistro = () => {
    // Estado de aspirantes, filtros, búsqueda, modal de edición y formulario.
    const [aspirantes, setAspirantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAspirante, setSelectedAspirante] = useState(null);
    const [showModalDocumentos, setShowModalDocumentos] = useState(false);
    const [documentosData, setDocumentosData] = useState(null);
    const [filterEstado, setFilterEstado] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        dui: '',
        nie: '',
        correo: '',
        telefono: '',
        escuelaProcedencia: '',
        notaExamen: '',
        exonerado: false,
        tipoExoneracion: ''
    });

    // Carga la lista de aspirantes al montar el componente.
    useEffect(() => {
        cargarAspirantes();
    }, []);

    // Obtiene los aspirantes desde la API.
    const cargarAspirantes = async () => {
        setLoading(true);
        try {
            const response = await API.get('/aspirantes');
            setAspirantes(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar aspirantes', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Muestra un mensaje temporal de éxito o error.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Mapea el id de especialidad a su nombre descriptivo.
    const getEspecialidadNombre = (id) => {
        const especialidades = {
            1: 'Administrativo Contable',
            2: 'Desarrollo de Software',
            3: 'Salud y Bienestar',
            4: 'Electronica',
            5: 'Bachillerato General'
        };
        return especialidades[id] || '-';
    };

    // Devuelve el color según el estado de la solicitud.
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Aprobado': return '#16a34a';
            case 'Rechazado': return '#dc2626';
            case 'En Espera': return '#e67e22';
            default: return '#3b82f6';
        }
    };

    // Consulta los documentos (foto y PDF de notas) del aspirante y abre el modal para visualizarlos.
    const verDocumentos = async (aspirante) => {
        try {
            const response = await API.get(`/aspirantes/${aspirante.idAspirante}/documentos`);
            setDocumentosData(response.data);
            setShowModalDocumentos(true);
        } catch (error) {
            mostrarMensaje('Error al cargar documentos', 'error');
        }
    };

    // Abre el modal de edición y precarga los datos del aspirante seleccionado.
    const handleOpenModal = (aspirante) => {
        setSelectedAspirante(aspirante);
        setFormData({
            nombres: aspirante.nombres || '',
            apellidos: aspirante.apellidos || '',
            dui: aspirante.dui || '',
            nie: aspirante.nie || '',
            correo: aspirante.correo || '',
            telefono: aspirante.telefono || '',
            escuelaProcedencia: aspirante.escuelaProcedencia || '',
            notaExamen: aspirante.notaExamen || '',
            exonerado: aspirante.exonerado || false,
            tipoExoneracion: aspirante.tipoExoneracion || ''
        });
        setShowModal(true);
    };

    // Valida los campos y actualiza el aspirante en la API.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validar campos requeridos
            if (!formData.nombres.trim()) {
                mostrarMensaje('Los nombres son requeridos', 'error');
                setLoading(false);
                return;
            }
            if (!formData.apellidos.trim()) {
                mostrarMensaje('Los apellidos son requeridos', 'error');
                setLoading(false);
                return;
            }
            if (!formData.nie.trim()) {
                mostrarMensaje('El NIE es requerido', 'error');
                setLoading(false);
                return;
            }
            if (!formData.correo.trim()) {
                mostrarMensaje('El correo es requerido', 'error');
                setLoading(false);
                return;
            }

            // NOTA: No se envía estadoSolicitud para que no se pueda cambiar
            const dataToSend = {
                nombres: formData.nombres.trim(),
                apellidos: formData.apellidos.trim(),
                dui: formData.dui || null,
                nie: formData.nie.trim(),
                correo: formData.correo.trim(),
                telefono: formData.telefono || null,
                escuelaProcedencia: formData.escuelaProcedencia || null,
                notaExamen: formData.notaExamen ? parseFloat(formData.notaExamen) : null,
                exonerado: formData.exonerado,
                tipoExoneracion: formData.tipoExoneracion || null
            };

            console.log('Enviando datos:', dataToSend);

            const response = await API.put(`/aspirantes/${selectedAspirante.idAspirante}`, dataToSend);

            console.log('Respuesta:', response.data);
            mostrarMensaje('Aspirante actualizado correctamente', 'success');
            setShowModal(false);
            cargarAspirantes();
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Response data:', error.response?.data);
            const mensaje = error.response?.data?.mensaje || error.message || 'Error al actualizar';
            mostrarMensaje(mensaje, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filtra los aspirantes por estado y término de búsqueda.
    const aspirantesFiltrados = aspirantes.filter(a => {
        if (filterEstado !== 'todos' && a.estadoSolicitud !== filterEstado) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (a.nombres?.toLowerCase().includes(term) ||
                a.apellidos?.toLowerCase().includes(term) ||
                a.nie?.toLowerCase().includes(term) ||
                a.correo?.toLowerCase().includes(term));
        }
        return true;
    });

    if (loading) {
        return (
            <DashboardLayout title="Gestion de Aspirantes">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Aspirantes - Registro Academico">
            {message && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
                    color: messageType === 'success' ? '#15803d' : '#b91c1c'
                }}>
                    {message}
                </div>
            )}

            <div className="card">
                <div className="filters-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, NIE, correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ flex: 2, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '200px' }}
                    />
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="filter-select"
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="Pendiente">Pendientes</option>
                        <option value="Aprobado">Aprobados</option>
                        <option value="Rechazado">Rechazados</option>
                        <option value="En Espera">En Espera</option>
                    </select>
                </div>

                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombres</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Apellidos</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>NIE</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Correo</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nota</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aspirantesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay aspirantes registrados
                                    </td>
                                </tr>
                            ) : (
                                aspirantesFiltrados.map((a) => (
                                    <tr key={a.idAspirante} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{a.idAspirante}</td>
                                        <td style={{ padding: '8px' }}><strong>{a.nombres}</strong></td>
                                        <td style={{ padding: '8px' }}>{a.apellidos}</td>
                                        <td style={{ padding: '8px' }}>{a.nie || '-'}</td>
                                        <td style={{ padding: '8px' }}>{a.correo || '-'}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '10px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: a.notaExamen ? '#dcfce7' : '#fee2e2',
                                                color: a.notaExamen ? '#15803d' : '#b91c1c'
                                            }}>
                                                {a.notaExamen || 'Pendiente'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>{getEspecialidadNombre(a.especialidadAspira)}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getEstadoColor(a.estadoSolicitud),
                                                color: '#fff'
                                            }}>
                                                {a.estadoSolicitud || 'Pendiente'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <button
                                                className="btn-edit"
                                                onClick={() => verDocumentos(a)}
                                                style={{ padding: '6px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}
                                            >
                                                Documentos
                                            </button>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleOpenModal(a)}
                                                style={{ padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '550px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Editar Aspirante</h3>
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>ID: {selectedAspirante?.idAspirante}</p>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombres *</label>
                                    <input
                                        type="text"
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Apellidos *</label>
                                    <input
                                        type="text"
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>DUI</label>
                                    <input
                                        type="text"
                                        value={formData.dui}
                                        onChange={(e) => setFormData({ ...formData, dui: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        placeholder="12345678-9"
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>NIE *</label>
                                    <input
                                        type="text"
                                        value={formData.nie}
                                        onChange={(e) => setFormData({ ...formData, nie: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Correo *</label>
                                    <input
                                        type="email"
                                        value={formData.correo}
                                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Telefono</label>
                                    <input
                                        type="text"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Escuela de Procedencia</label>
                                <input
                                    type="text"
                                    value={formData.escuelaProcedencia}
                                    onChange={(e) => setFormData({ ...formData, escuelaProcedencia: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nota Examen</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    value={formData.notaExamen}
                                    onChange={(e) => setFormData({ ...formData, notaExamen: e.target.value })}
                                    className="form-control"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.exonerado}
                                        onChange={(e) => setFormData({ ...formData, exonerado: e.target.checked })}
                                    />
                                    {' '}Exonerado
                                </label>
                            </div>

                            {formData.exonerado && (
                                <div className="form-group" style={{ marginTop: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tipo de Exoneracion</label>
                                    <input
                                        type="text"
                                        value={formData.tipoExoneracion}
                                        onChange={(e) => setFormData({ ...formData, tipoExoneracion: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        placeholder="Ej: Discapacidad, Deporte, Becado..."
                                    />
                                </div>
                            )}

                            <div style={{ marginTop: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '6px' }}>
                                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                                    <strong>Estado actual:</strong> {selectedAspirante?.estadoSolicitud}
                                    <span style={{ marginLeft: '12px', fontSize: '12px', color: '#9ca3af' }}>(No se puede modificar desde aquí)</span>
                                </p>
                            </div>

                            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showModalDocumentos && documentosData && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="modal-container" style={{ background: '#fff', borderRadius: '12px', maxWidth: '550px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Documentos del Aspirante</h3>
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>ID: {documentosData.idAspirante}</p>
                            <button className="modal-close" onClick={() => setShowModalDocumentos(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Nombre:</strong> {documentosData.nombres} {documentosData.apellidos}</p>
                            <p><strong>Correo:</strong> {documentosData.correo || 'No registrado'}</p>
                            <p><strong>Telefono:</strong> {documentosData.telefono || 'No registrado'}</p>
                            <p><strong>Promedio Anterior:</strong> {documentosData.promedioAnterior || 'No registrado'}</p>

                            <hr style={{ margin: '16px 0' }} />

                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Fotografia:</label>
                                {documentosData.fotoUrl ? (
                                    <img
                                        src={documentosData.fotoUrl}
                                        alt="Foto del aspirante"
                                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <p style={{ color: '#999' }}>No hay foto disponible</p>
                                )}
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Documento PDF:</label>
                                {documentosData.pdfUrl ? (
                                    <a
                                        href={documentosData.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-block', padding: '8px 16px', background: '#dc2626', color: '#fff', borderRadius: '6px', textDecoration: 'none' }}
                                    >
                                        Ver PDF de notas
                                    </a>
                                ) : (
                                    <p style={{ color: '#999' }}>No hay PDF disponible</p>
                                )}
                            </div>
                        </div>
                        <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button className="btn-cancel" onClick={() => setShowModalDocumentos(false)} style={{ padding: '8px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GestionAspirantesRegistro;