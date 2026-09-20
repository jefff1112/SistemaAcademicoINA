// Componente PerfilEstudiante: consulta y actualiza los datos personales del estudiante.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: formulario de datos personales del estudiante.
const PerfilEstudiante = () => {
    const [estudiante, setEstudiante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        correoEstudiante: '',
        telefonoMovil: '',
        direccion: ''
    });

    // ============================================================
    // ESTILOS INLINE
    // ============================================================
    const S = {
        card: {
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,.05)',
            marginBottom: '20px'
        },
        cardTitle: {
            margin: '0 0 6px',
            color: '#1e3a5f',
            fontSize: '17px',
            fontWeight: 700
        },
        cardSubtitle: {
            margin: '0 0 20px',
            color: '#64748b',
            fontSize: '13px',
            lineHeight: 1.5
        },
        label: {
            display: 'block',
            fontWeight: 600,
            color: '#34495e',
            fontSize: '13px',
            marginBottom: '6px'
        },
        input: {
            width: '100%',
            padding: '9px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box',
            background: '#ffffff',
            color: '#1e293b',
            fontFamily: 'inherit',
            transition: 'border-color .2s'
        },
        inputDisabled: {
            width: '100%',
            padding: '9px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box',
            background: '#f8fafc',
            color: '#64748b',
            fontFamily: 'inherit'
        },
        textarea: {
            width: '100%',
            padding: '9px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box',
            background: '#ffffff',
            color: '#1e293b',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '80px'
        },
        btn: {
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all .2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
        },
        btnPrimary: { background: '#1e3a5f', color: '#fff' },
        infoBox: {
            padding: '16px 18px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #94a3b8',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#475569',
            marginBottom: '20px'
        },
        infoGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
        },
        infoItem: {
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
        },
        infoLabel: {
            color: '#64748b',
            fontWeight: 600,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '.3px'
        },
        infoValue: {
            color: '#0f172a',
            fontWeight: 700,
            fontFamily: 'monospace',
            fontSize: '13px'
        }
    };

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const estudiantesRes = await API.get('/estudiantes');
            const estudianteData = estudiantesRes.data.find(e => e.codigoEstudiante === user?.codigo);

            if (estudianteData) {
                setEstudiante(estudianteData);
                setFormData({
                    nombres: estudianteData.nombres || '',
                    apellidos: estudianteData.apellidos || '',
                    correoEstudiante: estudianteData.correoEstudiante || '',
                    telefonoMovil: estudianteData.telefonoMovil || '',
                    direccion: estudianteData.direccion || ''
                });
            } else {
                mostrarMensaje('No se encontró tu perfil de estudiante', 'error');
            }
        } catch (error) {
            mostrarMensaje('Error al cargar perfil', 'error');
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
    // GUARDAR
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombres.trim() || !formData.apellidos.trim()) {
            mostrarMensaje('Nombres y apellidos son requeridos', 'error');
            return;
        }

        setSaving(true);
        try {
            await API.put(`/estudiantes/${estudiante?.idEstudiante}`, formData);
            mostrarMensaje('Perfil actualizado correctamente', 'success');
            cargarPerfil();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al actualizar perfil', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getIniciales = () => {
        if (!estudiante) return '??';
        const n = (estudiante.nombres || '').trim().charAt(0).toUpperCase();
        const a = (estudiante.apellidos || '').trim().charAt(0).toUpperCase();
        return `${n}${a}`;
    };

    const getClaseNombre = () => {
        if (!estudiante) return 'No asignada';
        return estudiante.clase?.nombreClase || estudiante.nombreClase || 'No asignada';
    };

    const getEstadoInfo = () => {
        const estado = estudiante?.estado;
        if (estado === 'Activo' || estado === true) return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'Activo' };
        if (estado === 'Inactivo' || estado === false) return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', label: 'Inactivo' };
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: 'Sin estado' };
    };

    // ============================================================
    // RENDER LOADING
    // ============================================================
    if (loading) {
        return (
            <DashboardLayout title="Mi Perfil">
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    Cargando perfil...
                </div>
            </DashboardLayout>
        );
    }

    const estadoInfo = getEstadoInfo();

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <DashboardLayout title="Mi Perfil - Estudiante">
            <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', background: '#ffffff' }}>

                {/* HEADER CON AVATAR */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '24px',
                    padding: '20px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,.05)'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        border: '3px solid #bfdbfe',
                        color: '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        fontWeight: 700,
                        flexShrink: 0
                    }}>
                        {getIniciales()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 style={{ margin: '0 0 4px', fontSize: '20px', color: '#1e3a5f', fontWeight: 700 }}>
                            {estudiante?.nombres} {estudiante?.apellidos}
                        </h1>
                        <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '13px' }}>
                            Estudiante - {getClaseNombre()}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                            <span style={{
                                padding: '3px 10px',
                                borderRadius: '10px',
                                background: '#eff6ff',
                                color: '#1e40af',
                                border: '1px solid #bfdbfe',
                                fontFamily: 'monospace',
                                fontWeight: 600
                            }}>
                                {estudiante?.codigoEstudiante}
                            </span>
                            {estudiante?.nie && (
                                <span style={{
                                    padding: '3px 10px',
                                    borderRadius: '10px',
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #cbd5e1',
                                    fontFamily: 'monospace',
                                    fontWeight: 600
                                }}>
                                    NIE: {estudiante.nie}
                                </span>
                            )}
                            <span style={{
                                padding: '3px 10px',
                                borderRadius: '10px',
                                background: estadoInfo.bg,
                                color: estadoInfo.color,
                                border: `1px solid ${estadoInfo.border}`,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: '11px'
                            }}>
                                {estadoInfo.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* MENSAJES */}
                {mensaje && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        background: mensaje.tipo === 'success' ? '#dcfce7' : '#fee2e2',
                        color: mensaje.tipo === 'success' ? '#15803d' : '#b91c1c',
                        borderLeft: `4px solid ${mensaje.tipo === 'success' ? '#16a34a' : '#dc2626'}`
                    }}>
                        {mensaje.texto}
                    </div>
                )}

                {/* DATOS PERSONALES */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Datos Personales</h3>
                    <p style={S.cardSubtitle}>
                        Actualiza tu información de contacto. Los datos académicos (código, NIE, clase) solo pueden ser modificados por Registro Académico.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={S.label}>Nombres *</label>
                                <input
                                    type="text"
                                    value={formData.nombres}
                                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                    required
                                    style={S.input}
                                />
                            </div>
                            <div>
                                <label style={S.label}>Apellidos *</label>
                                <input
                                    type="text"
                                    value={formData.apellidos}
                                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                    required
                                    style={S.input}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={S.label}>Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={formData.correoEstudiante}
                                    onChange={(e) => setFormData({ ...formData, correoEstudiante: e.target.value })}
                                    placeholder="usuario@ina.edu.sv"
                                    style={S.input}
                                />
                            </div>
                            <div>
                                <label style={S.label}>Teléfono Móvil</label>
                                <input
                                    type="text"
                                    value={formData.telefonoMovil}
                                    onChange={(e) => setFormData({ ...formData, telefonoMovil: e.target.value })}
                                    placeholder="Ej: 7777-8888"
                                    style={S.input}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={S.label}>Dirección</label>
                            <textarea
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                placeholder="Dirección completa de residencia..."
                                style={S.textarea}
                            />
                        </div>

                        {/* INFO ACADÉMICA */}
                        <div style={S.infoBox}>
                            <div style={S.infoGrid}>
                                <div style={S.infoItem}>
                                    <span style={S.infoLabel}>Código</span>
                                    <span style={S.infoValue}>{estudiante?.codigoEstudiante || '-'}</span>
                                </div>
                                <div style={S.infoItem}>
                                    <span style={S.infoLabel}>NIE</span>
                                    <span style={S.infoValue}>{estudiante?.nie || '-'}</span>
                                </div>
                                <div style={S.infoItem}>
                                    <span style={S.infoLabel}>Clase</span>
                                    <span style={{ ...S.infoValue, fontFamily: 'inherit' }}>{getClaseNombre()}</span>
                                </div>
                                <div style={S.infoItem}>
                                    <span style={S.infoLabel}>Estado</span>
                                    <span style={{ ...S.infoValue, fontFamily: 'inherit', color: estadoInfo.color }}>
                                        {estadoInfo.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                style={{ ...S.btn, ...S.btnPrimary, opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : 'Actualizar Perfil'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PerfilEstudiante;