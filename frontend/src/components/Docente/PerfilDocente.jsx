// Componente PerfilDocente: consulta y actualiza los datos personales y la contraseña del docente.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Componente principal: formularios de datos personales y cambio de contraseña.
const PerfilDocente = () => {
    const [loading, setLoading] = useState(true);
    const [savingPerfil, setSavingPerfil] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [docente, setDocente] = useState(null);
    const [mostrarPassword, setMostrarPassword] = useState({
        actual: false,
        nueva: false,
        confirmar: false
    });

    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        correo: '',
        telefono: '',
        especialidadDocente: '',
        tipoDocente: 'Basica'
    });

    const [passwordData, setPasswordData] = useState({
        actual: '',
        nueva: '',
        confirmar: ''
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
        btnDanger: { background: '#dc2626', color: '#fff' },
        btnGhost: {
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer',
            fontFamily: 'inherit'
        },
        infoBox: {
            padding: '14px 16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #94a3b8',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#475569',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px'
        },
        infoItem: { display: 'flex', alignItems: 'center', gap: '6px' },
        infoLabel: { color: '#64748b', fontWeight: 600 },
        infoValue: { color: '#0f172a', fontWeight: 700, fontFamily: 'monospace' }
    };

    // ============================================================
    // CARGA INICIAL
    // ============================================================
    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const docentesRes = await API.get('/docentes');
            const docenteData = docentesRes.data.find(d => d.codigoDocente === user?.codigo);

            if (docenteData) {
                setDocente(docenteData);
                setFormData({
                    nombres: docenteData.nombres || '',
                    apellidos: docenteData.apellidos || '',
                    correo: docenteData.correo || '',
                    telefono: docenteData.telefono || '',
                    especialidadDocente: docenteData.especialidadDocente || '',
                    tipoDocente: docenteData.tipoDocente || 'Basica'
                });
            } else {
                mostrarMensaje('No se encontró tu perfil de docente', 'error');
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
    // GUARDAR PERFIL
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombres.trim() || !formData.apellidos.trim()) {
            mostrarMensaje('Nombres y apellidos son requeridos', 'error');
            return;
        }

        setSavingPerfil(true);
        try {
            const dataToSend = {
                ...formData,
                idDocente: docente?.idDocente,
                codigoDocente: docente?.codigoDocente,
                estado: true
            };

            await API.put(`/docentes/${docente?.idDocente}`, dataToSend);
            mostrarMensaje('Perfil actualizado correctamente', 'success');
            cargarPerfil();
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al actualizar', 'error');
        } finally {
            setSavingPerfil(false);
        }
    };

    // ============================================================
    // CAMBIO DE CONTRASEÑA
    // ============================================================
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!passwordData.actual) {
            mostrarMensaje('Ingrese su contraseña actual', 'error');
            return;
        }
        if (!passwordData.nueva || passwordData.nueva.length < 6) {
            mostrarMensaje('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        if (passwordData.nueva === passwordData.actual) {
            mostrarMensaje('La nueva contraseña debe ser diferente a la actual', 'error');
            return;
        }
        if (passwordData.nueva !== passwordData.confirmar) {
            mostrarMensaje('Las contraseñas no coinciden', 'error');
            return;
        }

        setSavingPassword(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await API.put(`/perfil/cambiar-password/${user?.idUsuario}`, {
                actual: passwordData.actual,
                nueva: passwordData.nueva
            });
            mostrarMensaje('Contraseña cambiada correctamente', 'success');
            setPasswordData({ actual: '', nueva: '', confirmar: '' });
        } catch (error) {
            mostrarMensaje(error.response?.data?.mensaje || 'Error al cambiar contraseña', 'error');
        } finally {
            setSavingPassword(false);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const getIniciales = () => {
        if (!docente) return '??';
        const n = (docente.nombres || '').trim().charAt(0).toUpperCase();
        const a = (docente.apellidos || '').trim().charAt(0).toUpperCase();
        return `${n}${a}`;
    };

    const getTipoDocenteLabel = (tipo) => {
        switch (tipo) {
            case 'Basica': return 'Básica';
            case 'Tecnica': return 'Técnica';
            case 'Ambas': return 'Ambas';
            default: return tipo || '-';
        }
    };

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { label: 'Sin contraseña', color: '#94a3b8', width: '0%' };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 2) return { label: 'Débil', color: '#dc2626', width: '33%' };
        if (score === 3) return { label: 'Media', color: '#e67e22', width: '66%' };
        return { label: 'Fuerte', color: '#16a34a', width: '100%' };
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

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    const strength = getPasswordStrength(passwordData.nueva);

    return (
        <DashboardLayout title="Mi Perfil - Docente">
            <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', background: '#ffffff' }}>

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
                            {docente?.nombres} {docente?.apellidos}
                        </h1>
                        <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '13px' }}>
                            Docente {docente?.especialidadDocente ? `- ${docente.especialidadDocente}` : ''}
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
                                {docente?.codigoDocente}
                            </span>
                            <span style={{
                                padding: '3px 10px',
                                borderRadius: '10px',
                                background: docente?.estado ? '#dcfce7' : '#fee2e2',
                                color: docente?.estado ? '#15803d' : '#b91c1c',
                                border: `1px solid ${docente?.estado ? '#bbf7d0' : '#fecaca'}`,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: '11px'
                            }}>
                                {docente?.estado ? 'Activo' : 'Inactivo'}
                            </span>
                            <span style={{
                                padding: '3px 10px',
                                borderRadius: '10px',
                                background: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #cbd5e1',
                                fontWeight: 600
                            }}>
                                {getTipoDocenteLabel(docente?.tipoDocente)}
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
                        Actualiza tu información personal. El código, tipo de docente y estado solo pueden ser modificados por el administrador.
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
                                    value={formData.correo}
                                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                    placeholder="usuario@ina.edu.sv"
                                    style={S.input}
                                />
                            </div>
                            <div>
                                <label style={S.label}>Teléfono</label>
                                <input
                                    type="text"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    placeholder="Ej: 7777-8888"
                                    style={S.input}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={S.label}>Especialidad</label>
                                <input
                                    type="text"
                                    value={formData.especialidadDocente}
                                    onChange={(e) => setFormData({ ...formData, especialidadDocente: e.target.value })}
                                    placeholder="Ej: Matemáticas, Informática..."
                                    style={S.input}
                                />
                            </div>
                            <div>
                                <label style={S.label}>Tipo de Docente (solo lectura)</label>
                                <input
                                    type="text"
                                    value={getTipoDocenteLabel(formData.tipoDocente)}
                                    disabled
                                    style={S.inputDisabled}
                                />
                            </div>
                        </div>

                        {/* INFO BOX */}
                        <div style={S.infoBox}>
                            <div style={S.infoItem}>
                                <span style={S.infoLabel}>Código:</span>
                                <span style={S.infoValue}>{docente?.codigoDocente}</span>
                            </div>
                            <div style={S.infoItem}>
                                <span style={S.infoLabel}>Estado:</span>
                                <span style={{ ...S.infoValue, color: docente?.estado ? '#15803d' : '#b91c1c' }}>
                                    {docente?.estado ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div style={S.infoItem}>
                                <span style={S.infoLabel}>Tipo:</span>
                                <span style={S.infoValue}>{getTipoDocenteLabel(docente?.tipoDocente)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                style={{ ...S.btn, ...S.btnPrimary, opacity: savingPerfil ? 0.6 : 1, cursor: savingPerfil ? 'not-allowed' : 'pointer' }}
                                disabled={savingPerfil}
                            >
                                {savingPerfil ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* CAMBIO DE CONTRASEÑA */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Cambiar Contraseña</h3>
                    <p style={S.cardSubtitle}>
                        Por seguridad, te recomendamos usar una contraseña de al menos 8 caracteres que combine letras, números y símbolos.
                    </p>

                    <form onSubmit={handleChangePassword}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={S.label}>Contraseña Actual *</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={mostrarPassword.actual ? 'text' : 'password'}
                                    value={passwordData.actual}
                                    onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })}
                                    style={{ ...S.input, paddingRight: '90px' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarPassword({ ...mostrarPassword, actual: !mostrarPassword.actual })}
                                    style={S.btnGhost}
                                >
                                    {mostrarPassword.actual ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={S.label}>Nueva Contraseña *</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={mostrarPassword.nueva ? 'text' : 'password'}
                                        value={passwordData.nueva}
                                        onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })}
                                        style={{ ...S.input, paddingRight: '90px' }}
                                        required
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarPassword({ ...mostrarPassword, nueva: !mostrarPassword.nueva })}
                                        style={S.btnGhost}
                                    >
                                        {mostrarPassword.nueva ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                </div>
                                {passwordData.nueva && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                                            <span style={{ color: '#64748b' }}>Seguridad:</span>
                                            <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: strength.width, height: '100%', background: strength.color, transition: 'all .3s' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={S.label}>Confirmar Nueva Contraseña *</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={mostrarPassword.confirmar ? 'text' : 'password'}
                                        value={passwordData.confirmar}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })}
                                        style={{
                                            ...S.input,
                                            paddingRight: '90px',
                                            borderColor: passwordData.confirmar && passwordData.nueva !== passwordData.confirmar
                                                ? '#dc2626'
                                                : passwordData.confirmar && passwordData.nueva === passwordData.confirmar
                                                    ? '#16a34a'
                                                    : '#cbd5e1'
                                        }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarPassword({ ...mostrarPassword, confirmar: !mostrarPassword.confirmar })}
                                        style={S.btnGhost}
                                    >
                                        {mostrarPassword.confirmar ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                </div>
                                {passwordData.confirmar && passwordData.nueva !== passwordData.confirmar && (
                                    <small style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                        Las contraseñas no coinciden
                                    </small>
                                )}
                                {passwordData.confirmar && passwordData.nueva === passwordData.confirmar && (
                                    <small style={{ color: '#16a34a', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                        Las contraseñas coinciden
                                    </small>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                style={{ ...S.btn, ...S.btnDanger, opacity: savingPassword ? 0.6 : 1, cursor: savingPassword ? 'not-allowed' : 'pointer' }}
                                disabled={savingPassword}
                            >
                                {savingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PerfilDocente;