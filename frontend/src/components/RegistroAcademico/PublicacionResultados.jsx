// Componente Publicación de Resultados (Registro Académico): muestra y exporta la lista de aspirantes con su estado por especialidad.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const PublicacionResultados = () => {
    // Estado de aspirantes, filtro por especialidad y mensajes.
    const [aspirantes, setAspirantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterEspecialidad, setFilterEspecialidad] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Carga la lista de aspirantes al montar el componente.
    useEffect(() => {
        cargarAspirantes();
    }, []);

    // Obtiene los aspirantes desde la API.
    const cargarAspirantes = async () => {
        try {
            const response = await API.get('/aspirantes');
            setAspirantes(response.data || []);
        } catch (error) {
            mostrarMensaje('Error al cargar datos', 'error');
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

    // Exporta la lista filtrada de aspirantes a un archivo Excel.
    const exportarLista = () => {
        const data = aspirantesFiltrados.map(a => ({
            'ID': a.idAspirante,
            'Nombres': a.nombres,
            'Apellidos': a.apellidos,
            'NIE': a.nie || '-',
            'Especialidad': getEspecialidadNombre(a.especialidadAspira),
            'Nota Examen': a.notaExamen || '-',
            'Estado': a.estadoSolicitud || 'Pendiente'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
        XLSX.writeFile(wb, `resultados_${new Date().toISOString().split('T')[0]}.xlsx`);
        mostrarMensaje('Lista exportada', 'success');
    };

    // Filtra los aspirantes por especialidad seleccionada.
    const aspirantesFiltrados = aspirantes.filter(a => {
        if (filterEspecialidad) {
            return a.especialidadAspira === parseInt(filterEspecialidad);
        }
        return true;
    });

    if (loading) {
        return (
            <DashboardLayout title="Publicacion de Resultados">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Publicacion de Resultados - Registro Academico">
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Lista de Aspirantes</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select
                            value={filterEspecialidad}
                            onChange={(e) => setFilterEspecialidad(e.target.value)}
                            className="filter-select"
                            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            <option value="">Todas las especialidades</option>
                            <option value="1">Administrativo Contable</option>
                            <option value="2">Desarrollo de Software</option>
                            <option value="3">Salud y Bienestar</option>
                            <option value="4">Electronica</option>
                            <option value="5">Bachillerato General</option>
                        </select>
                        <button className="btn-success" onClick={exportarLista}>
                            Exportar Excel
                        </button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombres</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Apellidos</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>NIE</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nota</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aspirantesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>
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
                                        <td style={{ padding: '8px' }}>{getEspecialidadNombre(a.especialidadAspira)}</td>
                                        <td style={{ padding: '8px' }}>{a.notaExamen || '-'}</td>
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
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PublicacionResultados;