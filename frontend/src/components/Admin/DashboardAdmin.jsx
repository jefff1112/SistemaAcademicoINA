// Componente Dashboard Admin: muestra estadísticas generales del sistema y acciones rápidas.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: panel de administración con métricas, backups y acceso a módulos.
const DashboardAdmin = () => {
    // Estados: estadísticas del sistema, indicador de carga y fecha del último backup.
    const [stats, setStats] = useState({
        totalUsuarios: 0,
        totalEstudiantes: 0,
        totalDocentes: 0,
        totalAspirantes: 0,
        totalClases: 0,
        backupsRecientes: 0
    });
    const [loading, setLoading] = useState(true);
    const [fechaBackup, setFechaBackup] = useState('');

    // Carga las estadísticas al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene en paralelo los conteos de usuarios, estudiantes, docentes, aspirantes, clases y respaldos.
    const cargarDatos = async () => {
        try {
            // Usa allSettled para que un servicio caído no bloquee el resto de estadísticas.
            const [usuarios, estudiantes, docentes, aspirantes, clases, respaldos] = await Promise.allSettled([
                // Petición GET /usuarios para contar usuarios del sistema.
                API.get('/usuarios'),
                // Petición GET /estudiantes para contar estudiantes registrados.
                API.get('/estudiantes'),
                // Petición GET /docentes para contar docentes activos.
                API.get('/docentes'),
                // Petición GET /aspirantes para contar aspirantes registrados.
                API.get('/aspirantes'),
                // Petición GET /clases para contar clases del instituto.
                API.get('/clases'),
                // Petición GET /respaldos para contar copias de seguridad recientes.
                API.get('/respaldos')
            ]);

            const valor = (r) => (r.status === 'fulfilled' ? r.value?.data?.length || 0 : 0);

            setStats({
                totalUsuarios: valor(usuarios),
                totalEstudiantes: valor(estudiantes),
                totalDocentes: valor(docentes),
                totalAspirantes: valor(aspirantes),
                totalClases: valor(clases),
                backupsRecientes: valor(respaldos)
            });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Genera una copia de seguridad (backup) del sistema.
    const handleBackup = async () => {
        try {
            // Petición POST /respaldos para crear un nuevo respaldo de la base de datos.
            const response = await API.post('/respaldos');
            alert('Backup realizado correctamente');
            setFechaBackup(new Date().toLocaleString());
        } catch (error) {
            alert('Error al realizar backup');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Panel de Administracion">
                <div className="loading">Cargando datos...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Panel de Administracion">
            {/* Tarjetas de estadisticas */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{stats.totalUsuarios}</div>
                    <div className="stat-label">Usuarios</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.totalEstudiantes}</div>
                    <div className="stat-label">Estudiantes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.totalDocentes}</div>
                    <div className="stat-label">Docentes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.totalAspirantes}</div>
                    <div className="stat-label">Aspirantes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.totalClases}</div>
                    <div className="stat-label">Clases</div>
                </div>
            </div>

            {/* Acciones rapidas */}
            <div className="card">
                <h3>Acciones Rapidas</h3>
                <div className="actions-grid">
                    <button className="action-btn" onClick={() => window.location.href = '/admin/usuarios'}>
                        Gestionar Usuarios
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/admin/horarios/generar'}>
                        Generar Horarios
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/admin/roles'}>
                        Gestionar Roles
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/admin/configuracion'}>
                        Configuracion
                    </button>
                    <button className="action-btn" onClick={handleBackup}>
                        Realizar Backup
                    </button>
                </div>
            </div>

            {/* Informacion del sistema */}
            <div className="card">
                <h3>Informacion del Sistema</h3>
                <div className="info-row">
                    <span className="info-label">Version:</span>
                    <span className="info-value">1.0.0</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Ultimo Backup:</span>
                    <span className="info-value">{fechaBackup || 'No realizado'}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Base de Datos:</span>
                    <span className="info-value">MySQL</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Backend:</span>
                    <span className="info-value">.NET 8.0</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Frontend:</span>
                    <span className="info-value">React 19</span>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardAdmin;