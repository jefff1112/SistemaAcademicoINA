// Componente MiPerfil: vista común de perfil para actualizar datos personales y contraseña de cualquier rol.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';

// Componente principal: formularios de información personal y cambio de contraseña.
const MiPerfil = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editando, setEditando] = useState(false);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        correo: ''
    });
    const [passwordData, setPasswordData] = useState({
        actual: '',
        nueva: '',
        confirmar: ''
    });

    // Precarga el formulario con los datos del usuario autenticado.
    useEffect(() => {
        if (user) {
            setFormData({
                nombres: user.nombres || '',
                apellidos: user.apellidos || '',
                correo: user.correo || ''
            });
        }
    }, [user]);

    // Guarda los datos actualizados del perfil y los sincroniza en localStorage.
    const handleUpdatePerfil = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.put(`/perfil/${user.idUsuario}`, formData);
            alert('Perfil actualizado correctamente');
            setEditando(false);
            const userActualizado = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(userActualizado));
        } catch (error) {
            alert('Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    // Valida y cambia la contraseña del usuario mediante la API.
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.nueva !== passwordData.confirmar) {
            alert('Las contraseñas nuevas no coinciden');
            return;
        }
        setLoading(true);
        try {
            await API.put(`/perfil/cambiar-password/${user.idUsuario}`, {
                actual: passwordData.actual,
                nueva: passwordData.nueva
            });
            alert('Contraseña cambiada correctamente');
            setPasswordData({ actual: '', nueva: '', confirmar: '' });
        } catch (error) {
            alert('Error al cambiar contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Mi Perfil">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Informacion Personal</h3>
                    {!editando && <button className="btn-edit" onClick={() => setEditando(true)}>Editar Perfil</button>}
                </div>
                {editando ? (
                    <form onSubmit={handleUpdatePerfil}>
                        <div className="form-row">
                            <div className="form-group"><label>Nombres</label><input type="text" value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} className="form-control" required /></div>
                            <div className="form-group"><label>Apellidos</label><input type="text" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} className="form-control" required /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Correo Electronico</label><input type="email" value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} className="form-control" /></div>
                        </div>
                        <div className="modal-buttons">
                            <button type="button" className="btn-cancel" onClick={() => setEditando(false)}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="info-row"><span className="info-label">Nombres:</span><span className="info-value">{user?.nombres}</span></div>
                        <div className="info-row"><span className="info-label">Apellidos:</span><span className="info-value">{user?.apellidos}</span></div>
                        <div className="info-row"><span className="info-label">Correo:</span><span className="info-value">{user?.correo || '-'}</span></div>
                        <div className="info-row"><span className="info-label">Codigo:</span><span className="info-value">{user?.codigo}</span></div>
                        <div className="info-row"><span className="info-label">Rol:</span><span className="info-value">{user?.rol}</span></div>
                    </>
                )}
            </div>

            <div className="card">
                <h3>Cambiar Contraseña</h3>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group"><label>Contraseña Actual</label><input type="password" value={passwordData.actual} onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })} className="form-control" required /></div>
                    <div className="form-group"><label>Nueva Contraseña</label><input type="password" value={passwordData.nueva} onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })} className="form-control" required /></div>
                    <div className="form-group"><label>Confirmar Nueva Contraseña</label><input type="password" value={passwordData.confirmar} onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })} className="form-control" required /></div>
                    <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Cambiando...' : 'Cambiar Contraseña'}</button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default MiPerfil;