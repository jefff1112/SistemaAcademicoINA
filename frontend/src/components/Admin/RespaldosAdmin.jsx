// Componente Gestión de Respaldos (Admin): lista los backups y permite crear nuevos.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: administra las copias de seguridad de la base de datos.
const RespaldosAdmin = () => {
    // Estados: respaldos existentes, indicador de carga y de creación en curso.
    const [respaldos, setRespaldos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creando, setCreando] = useState(false);

    // Carga los respaldos al montar el componente.
    useEffect(() => {
        cargarRespaldos();
    }, []);

    // Obtiene la lista de respaldos desde la API.
    const cargarRespaldos = async () => {
        try {
            // Petición GET /respaldos para listar las copias de seguridad.
            const response = await API.get('/respaldos');
            setRespaldos(response.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Crea un nuevo respaldo de la base de datos y refresca la lista.
    const crearRespaldo = async () => {
        setCreando(true);
        try {
            // Petición POST /respaldos para generar una nueva copia de seguridad.
            await API.post('/respaldos');
            alert('Respaldo creado correctamente');
            cargarRespaldos();
        } catch (error) {
            alert('Error al crear respaldo');
        } finally {
            setCreando(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Respaldos">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion de Respaldos">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Respaldos Disponibles</h3>
                    <button className="btn-primary" onClick={crearRespaldo} disabled={creando}>
                        {creando ? 'Creando...' : '+ Nuevo Respaldo'}
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Fecha</th>
                                <th>Tamaño</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {respaldos.map((r, index) => (
                                <tr key={index}>
                                    <td>{r.nombre}</td>
                                    <td>{new Date(r.fecha).toLocaleString()}</td>
                                    <td>{r.tamano}</td>
                                    <td>
                                        <button className="btn-edit">Descargar</button>
                                        <button className="btn-danger">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RespaldosAdmin;