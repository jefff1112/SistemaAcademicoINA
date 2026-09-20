// Componente Configuración Admin: edita la configuración general del instituto.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: formulario para consultar y guardar la configuración del instituto.
const ConfiguracionAdmin = () => {
    // Estado: configuración actual del instituto.
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
    const [mensaje, setMensaje] = useState(null);

    // ============================================================
    // CARGA DE DATOS
    // ============================================================
    useEffect(() => {
        cargarConfiguracion();
    }, []);

    const cargarConfiguracion = async () => {
        try {
            const response = await API.get('/configuracion');
            if (response.data) {
                setConfig(response.data);
            }
        } catch (error) {
            mostrarMensaje('Error al cargar la configuración', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MENSAJES
    // ============================================================
    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    // ============================================================
    // SUBMIT
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!config.nombreInstituto.trim()) {
            mostrarMensaje('El nombre del instituto es requerido', 'error');
            return;
        }

        setSaving(true);
        try {
            await API.put('/configuracion', config);
            mostrarMensaje('Configuración guardada correctamente', 'success');
        } catch (error) {
            let msg = 'Error al guardar la configuración';
            if (error.response?.data?.mensaje) msg = error.response.data.mensaje;
            else if (error.response?.data?.message) msg = error.response.data.message;
            mostrarMensaje(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Configuracion General">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Configuracion General">
            <style>{`
                /* Forzar fondo blanco general */
                .gc-container { display: flex; flex-direction: column; gap: 20px; background-color: #ffffff; }
                
                .gc-card { 
                    background: #ffffff; 
                    border-radius: 12px; 
                    padding: 24px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03); 
                    border: 1px solid #e2e8f0; 
                }
                .gc-card h3 { margin: 0 0 20px; color: #1e3a5f; font-size: 18px; }

                /* Secciones */
                .gc-section {
                    margin-bottom: 24px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .gc-section:last-of-type {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                .gc-section-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1e3a5f;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    margin: 0 0 16px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #e2e8f0;
                }

                /* Campos */
                .gc-field { margin-bottom: 16px; }
                .gc-field label { 
                    display: block; 
                    font-weight: 600; 
                    color: #34495e; 
                    font-size: 13px; 
                    margin-bottom: 6px; 
                }
                .gc-field input, .gc-field textarea {
                    width: 100%; 
                    padding: 10px 12px; 
                    border: 1px solid #cbd5e1;
                    border-radius: 8px; 
                    font-size: 14px; 
                    box-sizing: border-box;
                    font-family: inherit; 
                    transition: border-color .2s, box-shadow .2s;
                    background-color: #ffffff;
                    color: #1e293b;
                }
                .gc-field textarea { resize: vertical; min-height: 70px; }
                .gc-field input:focus, .gc-field textarea:focus {
                    outline: none; 
                    border-color: #3b82f6; 
                    box-shadow: 0 0 0 3px rgba(59,130,246,.1);
                }
                .gc-field small {
                    display: block;
                    color: #64748b;
                    font-size: 12px;
                    margin-top: 4px;
                }

                /* Grid */
                .gc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .gc-grid-full { grid-column: 1 / -1; }

                /* Botones */
                .gc-btn {
                    padding: 10px 20px; 
                    border: none; 
                    border-radius: 8px;
                    font-size: 14px; 
                    font-weight: 600; 
                    cursor: pointer;
                    transition: all .2s; 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 6px;
                }
                .gc-btn:disabled { opacity: .6; cursor: not-allowed; }
                .gc-btn-primary { background: #1e3a5f; color: #fff; }
                .gc-btn-primary:hover:not(:disabled) { background: #16293f; }
                .gc-btn-secondary { background: #e5e7eb; color: #334155; }
                .gc-btn-secondary:hover:not(:disabled) { background: #d1d5db; }

                /* Avisos */
                .gc-aviso { 
                    padding: 12px 16px; 
                    border-radius: 8px; 
                    margin-bottom: 16px; 
                    font-size: 14px; 
                    font-weight: 500; 
                }
                .gc-aviso.success { background: #dcfce7; color: #15803d; border-left: 4px solid #16a34a; }
                .gc-aviso.error { background: #fee2e2; color: #b91c1c; border-left: 4px solid #dc2626; }

                /* Info box */
                .gc-info-box {
                    padding: 12px 16px; 
                    border-radius: 8px; 
                    margin-bottom: 20px; 
                    font-size: 13px;
                    background: #eff6ff; 
                    border-left: 4px solid #3b82f6; 
                    color: #1e40af;
                }

                /* Footer acciones */
                .gc-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                }

                @media (max-width: 700px) {
                    .gc-grid { grid-template-columns: 1fr; }
                    .gc-actions { flex-direction: column-reverse; }
                    .gc-actions button { width: 100%; justify-content: center; }
                }
            `}</style>

            <div className="gc-container">
                {mensaje && <div className={`gc-aviso ${mensaje.tipo}`}>{mensaje.texto}</div>}

                <div className="gc-card">
                    <h3>Configuración del Instituto</h3>

                    <div className="gc-info-box">
                        Estos datos se muestran en constancias, reportes y documentos oficiales del sistema.
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* INFORMACIÓN INSTITUCIONAL */}
                        <div className="gc-section">
                            <h4 className="gc-section-title">Información Institucional</h4>
                            <div className="gc-grid">
                                <div className="gc-field gc-grid-full">
                                    <label>Nombre del Instituto *</label>
                                    <input
                                        type="text"
                                        value={config.nombreInstituto}
                                        onChange={(e) => setConfig({ ...config, nombreInstituto: e.target.value })}
                                        placeholder="Ej: Instituto Nacional de Apopa"
                                        required
                                    />
                                </div>

                                <div className="gc-field">
                                    <label>Año Lectivo</label>
                                    <input
                                        type="number"
                                        value={config.anioLectivo}
                                        onChange={(e) => setConfig({ ...config, anioLectivo: parseInt(e.target.value) || new Date().getFullYear() })}
                                        min="2000"
                                        max="2100"
                                    />
                                </div>

                                <div className="gc-field">
                                    <label>Director(a)</label>
                                    <input
                                        type="text"
                                        value={config.director}
                                        onChange={(e) => setConfig({ ...config, director: e.target.value })}
                                        placeholder="Nombre del director(a)"
                                    />
                                </div>

                                <div className="gc-field gc-grid-full">
                                    <label>Lema Institucional</label>
                                    <textarea
                                        value={config.lema}
                                        onChange={(e) => setConfig({ ...config, lema: e.target.value })}
                                        rows="2"
                                        placeholder="Lema o frase institucional..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* INFORMACIÓN DE CONTACTO */}
                        <div className="gc-section">
                            <h4 className="gc-section-title">Información de Contacto</h4>
                            <div className="gc-grid">
                                <div className="gc-field">
                                    <label>Teléfono de Contacto</label>
                                    <input
                                        type="text"
                                        value={config.telefonoContacto}
                                        onChange={(e) => setConfig({ ...config, telefonoContacto: e.target.value })}
                                        placeholder="Ej: 2222-3333"
                                    />
                                </div>

                                <div className="gc-field">
                                    <label>Correo de Contacto</label>
                                    <input
                                        type="email"
                                        value={config.correoContacto}
                                        onChange={(e) => setConfig({ ...config, correoContacto: e.target.value })}
                                        placeholder="contacto@ina.edu.sv"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div className="gc-actions">
                            <button
                                type="button"
                                className="gc-btn gc-btn-secondary"
                                onClick={cargarConfiguracion}
                                disabled={saving}
                            >
                                Restaurar
                            </button>
                            <button
                                type="submit"
                                className="gc-btn gc-btn-primary"
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : 'Guardar Configuración'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ConfiguracionAdmin;