// Componente Consulta de Aspirantes (Registro Académico): lista aspirantes con filtros por estado de solicitud.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { getAspirantes } from '../../services/aspirantesService';

const ConsultaAspirantes = () => {
    // Estado de aspirantes, carga y filtro activo.
    const [aspirantes, setAspirantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');

    // Carga la lista de aspirantes al montar el componente.
    useEffect(() => {
        cargarAspirantes();
    }, []);

    // Obtiene los aspirantes desde la API.
    const cargarAspirantes = async () => {
        try {
            const data = await getAspirantes();
            setAspirantes(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtra los aspirantes según el estado de solicitud seleccionado.
    const filteredAspirantes = aspirantes.filter(a => {
        if (filter === 'aprobados') return a.estadoSolicitud === 'Aprobado';
        if (filter === 'pendientes') return a.estadoSolicitud === 'Pendiente';
        if (filter === 'preseleccionados') return a.estadoSolicitud === 'Preseleccionado';
        return true;
    });

    if (loading) return <div className="loading">Cargando...</div>;

    return (
        <DashboardLayout title="Consultar Aspirantes">
            <div className="filter-buttons">
                <button onClick={() => setFilter('todos')} className={`filter-btn ${filter === 'todos' ? 'active' : ''}`}>Todos</button>
                <button onClick={() => setFilter('preseleccionados')} className={`filter-btn ${filter === 'preseleccionados' ? 'active' : ''}`}>Preseleccionados</button>
                <button onClick={() => setFilter('aprobados')} className={`filter-btn ${filter === 'aprobados' ? 'active' : ''}`}>Aprobados</button>
                <button onClick={() => setFilter('pendientes')} className={`filter-btn ${filter === 'pendientes' ? 'active' : ''}`}>Pendientes</button>
            </div>

            <div className="table-responsive">
                <table className="aspirantes-table">
                    <thead>
                        <tr>
                            <th>ID</th><th>Nombres</th><th>Apellidos</th><th>Estado</th><th>Nota Examen</th><th>Puntaje</th><th>Especialidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAspirantes.map(a => (
                            <tr key={a.idAspirante}>
                                <td>{a.idAspirante}</td>
                                <td>{a.nombres}</td>
                                <td>{a.apellidos}</td>
                                <td className={`estado-${(a.estadoSolicitud || 'pendiente').toLowerCase()}`}>
                                    {a.estadoSolicitud || 'Pendiente'}
                                </td>
                                <td>{a.notaExamen || '-'}</td>
                                <td>{a.puntajeSeleccion || '-'}</td>
                                <td>{a.especialidadAspira === 2 ? 'Desarrollo Software' :
                                    a.especialidadAspira === 1 ? 'Administrativo Contable' :
                                        a.especialidadAspira === 4 ? 'Electronica' :
                                            a.especialidadAspira === 3 ? 'Salud y Bienestar' : 'Bachillerato General'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default ConsultaAspirantes;