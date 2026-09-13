// Componente Auditoría Dirección: consulta el registro de actividades con filtros y exportación a Excel.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

// Componente principal: muestra la auditoría del sistema con filtros avanzados para dirección.
const AuditoriaDireccion = () => {
    // Estados: registros de auditoría, filtros (tipo, usuario, búsqueda, fechas) y mensajes.
    const [auditoria, setAuditoria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTipo, setFilterTipo] = useState('todos');
    const [filterUsuario, setFilterUsuario] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Carga la auditoría al montar el componente.
    useEffect(() => {
        cargarAuditoria();
    }, []);

    // Obtiene el registro de actividades de auditoría desde el backend.
    const cargarAuditoria = async () => {
        try {
            // Petición GET /auditoria para listar las actividades registradas.
            const response = await API.get('/auditoria');
            setAuditoria(response.data || []);
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje(error.response?.status === 403
                ? 'No tiene permisos para consultar la auditoría'
                : 'Error al cargar la auditoría', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Muestra un mensaje temporal al usuario y lo limpia después de 4 segundos.
    const mostrarMensaje = (texto, tipo) => {
        setMessage(texto);
        setMessageType(tipo);
        setTimeout(() => setMessage(''), 4000);
    };

    // Devuelve el color distintivo de cada tipo de acción de auditoría.
    const getTipoColor = (accion) => {
        switch (accion) {
            case 'Login': return '#3b82f6';
            case 'Crear': return '#16a34a';
            case 'Actualizar': return '#e67e22';
            case 'Eliminar': return '#dc2626';
            case 'Aprobar': return '#8b5cf6';
            case 'Rechazar': return '#ef4444';
            case 'Exportar': return '#06b6d4';
            case 'Importar': return '#8b5cf6';
            case 'Backup': return '#6366f1';
            case 'Restaurar': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    // Aplica los filtros activos (tipo, usuario, búsqueda y rango de fechas) a la auditoría.
    const auditoriaFiltrada = auditoria.filter(a => {
        if (filterTipo !== 'todos' && a.accion !== filterTipo) return false;
        if (filterUsuario && a.usuario !== filterUsuario) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (a.usuario?.toLowerCase().includes(term) ||
                a.detalle?.toLowerCase().includes(term) ||
                a.accion?.toLowerCase().includes(term));
        }
        if (fechaInicio) {
            const inicio = new Date(`${fechaInicio}T00:00:00`);
            if (!isNaN(inicio) && new Date(a.fecha) < inicio) return false;
        }
        if (fechaFin) {
            const fin = new Date(`${fechaFin}T23:59:59`);
            if (!isNaN(fin) && new Date(a.fecha) > fin) return false;
        }
        return true;
    });

    // Usuarios únicos presentes en el registro de auditoría (para el filtro).
    const usuariosAuditoria = [...new Set(auditoria.map(a => a.usuario).filter(Boolean))];

    // Exporta la auditoría filtrada a un archivo Excel.
    const exportarAuditoria = () => {
        if (auditoriaFiltrada.length === 0) {
            mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }
        const data = auditoriaFiltrada.map(a => ({
            'Fecha': new Date(a.fecha).toLocaleString(),
            'Usuario': a.usuario,
            'Accion': a.accion,
            'Detalle': a.detalle
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Auditoria');
        XLSX.writeFile(wb, `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`);
        mostrarMensaje('Auditoria exportada', 'success');
    };

    // Restablece todos los filtros de auditoría a sus valores iniciales.
    const limpiarFiltros = () => {
        setFilterTipo('todos');
        setFilterUsuario('');
        setSearchTerm('');
        setFechaInicio('');
        setFechaFin('');
    };

    if (loading) {
        return (
            <DashboardLayout title="Auditoria">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Auditoria del Sistema - Direccion">
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
                <h3>Filtros de Auditoria</h3>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tipo de Accion</label>
                        <select
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            <option value="todos">Todas las acciones</option>
                            <option value="Login">Login</option>
                            <option value="Crear">Crear</option>
                            <option value="Actualizar">Actualizar</option>
                            <option value="Eliminar">Eliminar</option>
                            <option value="Aprobar">Aprobar</option>
                            <option value="Rechazar">Rechazar</option>
                            <option value="Exportar">Exportar</option>
                            <option value="Importar">Importar</option>
                            <option value="Backup">Backup</option>
                            <option value="Restaurar">Restaurar</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Usuario</label>
                        <select
                            value={filterUsuario}
                            onChange={(e) => setFilterUsuario(e.target.value)}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        >
                            <option value="">Todos los usuarios</option>
                            {usuariosAuditoria.map(u => (
                                <option key={u} value={u}>
                                    {u}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Buscar</label>
                        <input
                            type="text"
                            placeholder="Buscar por usuario, detalle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                    </div>
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha Inicio</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Fecha Fin</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="form-control"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        <button
                            className="btn-secondary"
                            onClick={limpiarFiltros}
                            style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Limpiar
                        </button>
                        <button
                            className="btn-success"
                            onClick={exportarAuditoria}
                            style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Exportar Excel
                        </button>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Registro de Actividades</h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Mostrando {auditoriaFiltrada.length} de {auditoria.length} registros
                </p>
                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Usuario</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Accion</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditoriaFiltrada.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>
                                        No hay registros de auditoria
                                    </td>
                                </tr>
                            ) : (
                                auditoriaFiltrada.map((a, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '8px' }}>{new Date(a.fecha).toLocaleString()}</td>
                                        <td style={{ padding: '8px' }}><strong>{a.usuario}</strong></td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getTipoColor(a.accion),
                                                color: '#fff'
                                            }}>
                                                {a.accion}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>{a.detalle}</td>
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

export default AuditoriaDireccion;