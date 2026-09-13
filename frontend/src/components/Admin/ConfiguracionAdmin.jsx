// Componente Configuración Admin: edita la configuración general del instituto.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: formulario para consultar y guardar la configuración del instituto.
const ConfiguracionAdmin = () => {
    // Estado: configuración actual del instituto (nombre, año lectivo, contactos, director y lema).
    const [config, setConfig] = useState({
        nombreInstituto: 'Instituto Nacional de Apopa',
        anioLectivo: new Date().getFullYear(),
        telefonoContacto: '',
        correoContacto: '',
        director: '',
        lema: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Carga la configuración actual al montar el componente.
    useEffect(() => {
        cargarConfiguracion();
    }, []);

    // Obtiene la configuración guardada desde el backend.
    const cargarConfiguracion = async () => {
        try {
            // Petición GET /configuracion para consultar los valores actuales.
            const response = await API.get('/configuracion');
            if (response.data) {
                setConfig(response.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Guarda la configuración editada enviándola al backend.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Petición PUT /configuracion para actualizar la configuración del instituto.
            await API.put('/configuracion', config);
            alert('Configuracion guardada correctamente');
        } catch (error) {
            alert('Error al guardar configuracion');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Configuracion General">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Configuracion General">
            <div className="card">
                <h3>Configuracion del Instituto</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre del Instituto</label>
                        <input
                            type="text"
                            value={config.nombreInstituto}
                            onChange={(e) => setConfig({ ...config, nombreInstituto: e.target.value })}
                            className="form-control"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Año Lectivo</label>
                            <input
                                type="number"
                                value={config.anioLectivo}
                                onChange={(e) => setConfig({ ...config, anioLectivo: parseInt(e.target.value) })}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Telefono de Contacto</label>
                            <input
                                type="text"
                                value={config.telefonoContacto}
                                onChange={(e) => setConfig({ ...config, telefonoContacto: e.target.value })}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Correo de Contacto</label>
                            <input
                                type="email"
                                value={config.correoContacto}
                                onChange={(e) => setConfig({ ...config, correoContacto: e.target.value })}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Director(a)</label>
                            <input
                                type="text"
                                value={config.director}
                                onChange={(e) => setConfig({ ...config, director: e.target.value })}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Lema</label>
                        <textarea
                            value={config.lema}
                            onChange={(e) => setConfig({ ...config, lema: e.target.value })}
                            rows="2"
                            className="form-control"
                        />
                    </div>

                    <div className="modal-buttons">
                        <button type="submit" disabled={saving} className="btn-primary">
                            {saving ? 'Guardando...' : 'Guardar Configuracion'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default ConfiguracionAdmin;