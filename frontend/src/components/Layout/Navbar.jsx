// Componente Navbar: barra de navegación pública con accesos a secciones del sitio y menú de usuario.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Componente principal: navegación responsiva con enlaces institucionales y sesión.
const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Cierra la sesión y redirige a la página de inicio de sesión.
    const handleLogout = () => {
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    const menuItems = [
        { label: 'Inicio', path: '/' },
        { label: 'Cultura Institucional', path: '/cultura-institucional' },  // ← CAMBIADO
        { label: 'Bachilleratos', path: '/bachilleratos' },
        { label: 'Nuevo Ingreso', path: '/nuevo-ingreso' },
        { label: 'Areas Extracurriculares', path: '/areas-extracurriculares' },
        { label: 'Contactanos', path: '/contactanos' },
    ];

    const userMenu = user ? [
        { label: 'Dashboard', path: '/dashboard' },
    ] : [];

    const allMenuItems = [...menuItems, ...userMenu];

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
                    <span className="logo-text">Instituto Nacional de Apopa</span>
                </Link>

                <button className={`menu-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
                    <span className="menu-icon">☰</span>
                    <span className="menu-close">✕</span>
                </button>

                <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                    {allMenuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className="nav-link"
                            onClick={() => setMenuOpen(false)}
                        >
                            <span>{item.label}</span>
                        </Link>
                    ))}

                    {user && (
                        <div className="nav-user-section">
                            <div className="user-info">
                                <div className="user-details">
                                    <strong>{user.nombres} {user.apellidos}</strong>
                                    <small>{user.rol}</small>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="nav-logout">
                                Cerrar Sesion
                            </button>
                        </div>
                    )}

                    {!user && (
                        <Link to="/login" className="nav-login" onClick={() => setMenuOpen(false)}>
                            Iniciar Sesion
                        </Link>
                    )}
                </div>
            </div>

            {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}
        </nav>
    );
};

export default Navbar;