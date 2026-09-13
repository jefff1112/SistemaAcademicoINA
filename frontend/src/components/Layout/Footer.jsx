// Componente Footer: pie de página público del sitio web del Instituto Nacional de Apopa.
import React from 'react';

// Componente principal: información institucional, contacto y redes sociales.
const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-section">
                        <h4>Instituto Nacional de Apopa</h4>
                        <p>Excelencia académica y formación integral desde 1981</p>
                    </div>
                    <div className="footer-section">
                        <h4>Contacto</h4>
                        <p>Dirección: Apopa, El Salvador</p>
                        <p>Teléfono: 2216-4001 / 2288-9966</p>
                        <p>Correo: ina@mined.edu.sv</p>
                    </div>
                    <div className="footer-section">
                        <h4>Horario de Atención</h4>
                        <p>Lunes a Viernes: 7:00 AM - 3:00 PM</p>
                        <p>Secretaría: 7:00 AM - 12:00 PM</p>
                    </div>
                    <div className="footer-section">
                        <h4>Redes Sociales</h4>
                        <p>Facebook: @inadeapopa</p>
                        <p>Instagram: @ina_apopa_oficial</p>
                        <p>TikTok: @inapopaoficial</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Instituto Nacional de Apopa. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;