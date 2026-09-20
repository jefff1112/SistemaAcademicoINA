// Componente Dashboard Admin - MEJORADO
// Muestra estadísticas generales del sistema y acciones rápidas.
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

const DashboardAdmin = () => {
    const navigate = useNavigate();

    // ============================================================
    // ESTADOS
    // ============================================================
    const [stats, setStats] = useState({
        totalUsuarios: 0,
        totalEstudiantes: 0,
        totalDocentes: 0,
        totalAspirantes: 0,
        totalClases: 0,
        backupsRecientes: 0
    });
    const [loading, setLoading] = useState(true);
    const [backupEnProceso, setBackupEnProceso] = useState(false);
    const [fechaBackup, setFechaBackup] = useState('');
    const [mensaje, setMensaje] = useState(null);

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [usuarios, estudiantes, docentes, aspirantes, clases, respaldos] = await Promise.allSettled([
                API.get('/usuarios'),
                API.get('/estudiantes'),
                API.get('/docentes'),
                API.get('/aspirantes'),
                API.get('/clases'),
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

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo) => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    // ============================================================
    // BACKUP
    // ============================================================
    const handleBackup = async () => {
        if (!window.confirm('¿Realizar una copia de seguridad del sistema?\nEsta acción puede tardar unos minutos.')) return;

        setBackupEnProceso(true);
        try {
            await API.post('/respaldos');
            mostrarMensaje('Backup realizado correctamente', 'success');
            setFechaBackup(new Date().toLocaleString('es-SV'));
            cargarDatos();
        } catch (error) {
            mostrarMensaje('Error al realizar el backup', 'error');
        } finally {
            setBackupEnProceso(false);
        }
    };

    // ============================================================
    // NAVEGACIÓN
    // ============================================================
    const irA = (ruta) => {
        navigate(ruta);
    };

    // ============================================================
    // DERIVADOS
    // ============================================================
    const totalRegistros = useMemo(() => {
        return stats.totalUsuarios + stats.totalEstudiantes + stats.totalDocentes +
            stats.totalAspirantes + stats.totalClases;
    }, [stats]);

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Panel de Administración">
                <div className="loading">Cargando datos del sistema...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Panel de Administración">
            <style>{`
                .da-container { display: flex; flex-direction: column; gap: 20px; }

                /* Header */
                .da-header {
                    background: linear-gradient(135deg, #1e3a5f 0%, #2d4f7c 100%);
                    border-radius: 12px;
                    padding: 24px 28px;
                    color: #fff;
                    box-shadow: 0 4px 16px rgba(30,58,95,.2);
                }
                .da-header h1 { margin: 0 0 6px; font-size: 24px; font-weight: 700; }
                .da-header p { margin: 0; font-size: 14px; opacity: .9; }
                .da-header-stats {
                    display: flex;
                    gap: 24px;
                    margin-top: 18px;
                    flex-wrap: wrap;
                }
                .da-header-stat {
                    display: flex;
                    flex-direction: column;
                }
                .da-header-stat .num {
                    font-size: 22px;
                    font-weight: bold;
                    line-height: 1.1;
                }
                .da-header-stat .lbl {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    opacity: .85;
                    margin-top: 2px;
                }

                /* Cards generales */
                .da-card {
                    background: #fff;
                    border-radius: 12px;
                    padding: 22px;
                    box-shadow: 0 2px 10px rgba(0,0,0,.06);
                    border: 1px solid #e2e8f0;
                }
                .da-card h3 {
                    margin: 0 0 16px;
                    color: #1e3a5f;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Tarjetas de estadísticas */
                .da-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 14px;
                }
                .da-stat {
                    background: #fff;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,.06);
                    border: 1px solid #e2e8f0;
                    transition: all .2s;
                    border-top: 4px solid transparent;
                    cursor: default;
                }
                .da-stat:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,.1);
                }
                .da-stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .da-stat-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    font-weight: 600;
                    color: #64748b;
                }
                .da-stat-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 15px;
                    font-weight: bold;
                    color: #fff;
                }
                .da-stat-value {
                    font-size: 30px;
                    font-weight: bold;
                    line-height: 1.1;
                    color: #1e293b;
                }
                .da-stat-sub {
                    font-size: 11px;
                    color: #94a3b8;
                    margin-top: 4px;
                }

                /* Acciones rápidas */
                .da-actions {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 14px;
                }
                .da-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 18px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    text-align: left;
                    cursor: pointer;
                    transition: all .2s;
                    font-family: inherit;
                }
                .da-action-btn:hover {
                    background: #eff6ff;
                    border-color: #3b82f6;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59,130,246,.15);
                }
                .da-action-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: bold;
                    color: #fff;
                    flex-shrink: 0;
                }
                .da-action-info { display: flex; flex-direction: column; gap: 2px; }
                .da-action-title {
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 14px;
                }
                .da-action-desc {
                    font-size: 12px;
                    color: #64748b;
                }

                /* Info del sistema */
                .da-info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                }
                .da-info-row:last-child { border-bottom: none; }
                .da-info-label { color: #64748b; font-weight: 500; }
                .da-info-value {
                    color: #1e293b;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Badge estado */
                .da-badge {
                    display: inline-block;
                    padding: 3px 10px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .da-badge-ok { background: #dcfce7; color: #15803d; }
                .da-badge-pending { background: #fef3c7; color: #b45309; }

                /* Avisos */
                .da-aviso {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    font-weight: 500;
                }
                .da-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .da-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                /* Spinner del botón backup */
                .da-spinner {
                    display: inline-block;
                    width: 14px;
                    height: 14px;
                    border: 2px solid #e2e8f0;
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: da-spin .6s linear infinite;
                }
                @keyframes da-spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .da-header { padding: 20px; }
                    .da-header h1 { font-size: 20px; }
                    .da-header-stats { gap: 16px; }
                    .da-stats { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
                    .da-stat-value { font-size: 24px; }
                    .da-actions { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="da-container">
                {mensaje && <div className={`da-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                {/* HEADER */}
                <div className="da-header">
                    <h1>Panel de Administración</h1>
                    <p>Resumen general del sistema académico INA</p>
                    <div className="da-header-stats">
                        <div className="da-header-stat">
                            <span className="num">{totalRegistros}</span>
                            <span className="lbl">Registros Totales</span>
                        </div>
                        <div className="da-header-stat">
                            <span className="num">{stats.totalClases}</span>
                            <span className="lbl">Clases Activas</span>
                        </div>
                        <div className="da-header-stat">
                            <span className="num">{stats.backupsRecientes}</span>
                            <span className="lbl">Backups Recientes</span>
                        </div>
                    </div>
                </div>

                {/* TARJETAS DE ESTADÍSTICAS */}
                <div className="da-stats">
                    <div className="da-stat" style={{ borderTopColor: '#3b82f6' }}>
                        <div className="da-stat-header">
                            <span className="da-stat-label">Usuarios</span>
                            <div className="da-stat-icon" style={{ background: '#3b82f6' }}>U</div>
                        </div>
                        <div className="da-stat-value">{stats.totalUsuarios}</div>
                        <div className="da-stat-sub">Total en el sistema</div>
                    </div>

                    <div className="da-stat" style={{ borderTopColor: '#1e3a5f' }}>
                        <div className="da-stat-header">
                            <span className="da-stat-label">Estudiantes</span>
                            <div className="da-stat-icon" style={{ background: '#1e3a5f' }}>E</div>
                        </div>
                        <div className="da-stat-value">{stats.totalEstudiantes}</div>
                        <div className="da-stat-sub">Matriculados activos</div>
                    </div>

                    <div className="da-stat" style={{ borderTopColor: '#8b5cf6' }}>
                        <div className="da-stat-header">
                            <span className="da-stat-label">Docentes</span>
                            <div className="da-stat-icon" style={{ background: '#8b5cf6' }}>D</div>
                        </div>
                        <div className="da-stat-value">{stats.totalDocentes}</div>
                        <div className="da-stat-sub">Planta docente</div>
                    </div>

                    <div className="da-stat" style={{ borderTopColor: '#e67e22' }}>
                        <div className="da-stat-header">
                            <span className="da-stat-label">Aspirantes</span>
                            <div className="da-stat-icon" style={{ background: '#e67e22' }}>A</div>
                        </div>
                        <div className="da-stat-value">{stats.totalAspirantes}</div>
                        <div className="da-stat-sub">En proceso de admisión</div>
                    </div>

                    <div className="da-stat" style={{ borderTopColor: '#16a34a' }}>
                        <div className="da-stat-header">
                            <span className="da-stat-label">Clases</span>
                            <div className="da-stat-icon" style={{ background: '#16a34a' }}>C</div>
                        </div>
                        <div className="da-stat-value">{stats.totalClases}</div>
                        <div className="da-stat-sub">Clases registradas</div>
                    </div>

                    <div className="da-stat" style={{ borderTopColor: '#0ea5e9' }}>
                        <div className="da-stat-header">
                            <span className="da-stat-label">Backups</span>
                            <div className="da-stat-icon" style={{ background: '#0ea5e9' }}>B</div>
                        </div>
                        <div className="da-stat-value">{stats.backupsRecientes}</div>
                        <div className="da-stat-sub">Respaldos disponibles</div>
                    </div>
                </div>

                {/* ACCIONES RÁPIDAS */}
                <div className="da-card">
                    <h3>Acciones Rápidas</h3>
                    <div className="da-actions">
                        <button className="da-action-btn" onClick={() => irA('/admin/usuarios')}>
                            <div className="da-action-icon" style={{ background: '#3b82f6' }}>U</div>
                            <div className="da-action-info">
                                <span className="da-action-title">Gestionar Usuarios</span>
                                <span className="da-action-desc">Crear, editar y administrar usuarios</span>
                            </div>
                        </button>

                        <button className="da-action-btn" onClick={() => irA('/admin/horarios/generar')}>
                            <div className="da-action-icon" style={{ background: '#16a34a' }}>H</div>
                            <div className="da-action-info">
                                <span className="da-action-title">Generar Horarios</span>
                                <span className="da-action-desc">Crear horarios académicos</span>
                            </div>
                        </button>

                        <button className="da-action-btn" onClick={() => irA('/admin/roles')}>
                            <div className="da-action-icon" style={{ background: '#8b5cf6' }}>R</div>
                            <div className="da-action-info">
                                <span className="da-action-title">Gestionar Roles</span>
                                <span className="da-action-desc">Permisos y roles del sistema</span>
                            </div>
                        </button>

                        <button className="da-action-btn" onClick={() => irA('/admin/configuracion')}>
                            <div className="da-action-icon" style={{ background: '#e67e22' }}>C</div>
                            <div className="da-action-info">
                                <span className="da-action-title">Configuración</span>
                                <span className="da-action-desc">Ajustes generales del sistema</span>
                            </div>
                        </button>

                        <button
                            className="da-action-btn"
                            onClick={handleBackup}
                            disabled={backupEnProceso}
                        >
                            <div className="da-action-icon" style={{ background: '#0ea5e9' }}>
                                {backupEnProceso ? <span className="da-spinner"></span> : 'B'}
                            </div>
                            <div className="da-action-info">
                                <span className="da-action-title">
                                    {backupEnProceso ? 'Realizando Backup...' : 'Realizar Backup'}
                                </span>
                                <span className="da-action-desc">Copia de seguridad de la base de datos</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* INFORMACIÓN DEL SISTEMA */}
                <div className="da-card">
                    <h3>Información del Sistema</h3>

                    <div className="da-info-row">
                        <span className="da-info-label">Versión</span>
                        <span className="da-info-value">1.0.0</span>
                    </div>

                    <div className="da-info-row">
                        <span className="da-info-label">Último Backup</span>
                        <span className="da-info-value">
                            {fechaBackup ? (
                                <>
                                    {fechaBackup}
                                    <span className="da-badge da-badge-ok">OK</span>
                                </>
                            ) : (
                                <>
                                    No realizado
                                    <span className="da-badge da-badge-pending">Pendiente</span>
                                </>
                            )}
                        </span>
                    </div>

                    <div className="da-info-row">
                        <span className="da-info-label">Base de Datos</span>
                        <span className="da-info-value">MySQL</span>
                    </div>

                    <div className="da-info-row">
                        <span className="da-info-label">Backend</span>
                        <span className="da-info-value">.NET 8.0</span>
                    </div>

                    <div className="da-info-row">
                        <span className="da-info-label">Frontend</span>
                        <span className="da-info-value">React 19</span>
                    </div>

                    <div className="da-info-row">
                        <span className="da-info-label">Total de Registros</span>
                        <span className="da-info-value">{totalRegistros}</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardAdmin;