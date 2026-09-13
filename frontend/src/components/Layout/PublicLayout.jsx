// Componente PublicLayout: estructura de las páginas públicas (Navbar, contenido y Footer).
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

// Componente principal: envuelve el contenido público del sitio.
const PublicLayout = ({ children }) => {
    return (
        <div className="public-layout">
            <Navbar />
            <main className="public-main">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;