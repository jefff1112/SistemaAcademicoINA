import React, { useEffect, useState } from 'react';
import API from '../services/api';

const Contactanos = () => {
    const [contenido, setContenido] = useState([]);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await API.get('/contenido-publico/contacto');
                setContenido(res.data || []);
            } catch (error) {
                console.error('Error cargando contenido:', error);
            }
        };
        cargar();
    }, []);

    const get = (seccion, campo, fallback = '') => {
        const bloque = contenido.find(c => c.seccion === seccion);
        return bloque?.[campo] || fallback;
    };

    return (
        <div className="page-container">
            <h1>Contáctanos</h1>

            <div className="contact-grid">
                {/* Columna de información de contacto */}
                <div className="contact-info">
                    <h2>Información de Contacto</h2>

                    <div className="contact-item">
                        <strong>{get('ubicacion', 'titulo', 'Ubicación')}</strong>
                        <div dangerouslySetInnerHTML={{
                            __html: get('ubicacion', 'contenido',
                                '<p>Calle "A". Colonia Madre Tierra, Apopa, El Salvador</p>')
                        }} />
                    </div>

                    <div className="contact-item">
                        <strong>{get('telefono', 'titulo', 'Teléfono')}</strong>
                        <div dangerouslySetInnerHTML={{
                            __html: get('telefono', 'contenido', '<p>2216-4001</p>')
                        }} />
                    </div>

                    <div className="contact-item">
                        <strong>{get('correo', 'titulo', 'Correo Electrónico')}</strong>
                        <div dangerouslySetInnerHTML={{
                            __html: get('correo', 'contenido', '<p>direccioninapopa@gmail.com</p>')
                        }} />
                    </div>

                    <div className="contact-item">
                        <strong>{get('horario', 'titulo', 'Horario de Atención')}</strong>
                        <div dangerouslySetInnerHTML={{
                            __html: get('horario', 'contenido',
                                '<p>Lunes a Viernes: 7:00 AM - 3:00 PM</p><p>Secretaría: 7:00 AM - 12:00 PM</p>')
                        }} />
                    </div>

                    <h3>Redes Sociales</h3>
                    <div className="social-links">
                        <a href={get('facebook', 'contenido', 'https://www.facebook.com/inadeapopa')} target="_blank" rel="noopener noreferrer" className="social-link">
                            Facebook: {get('facebook', 'titulo', '@inadeapopa')}
                        </a>
                        <a href={get('instagram', 'contenido', 'https://www.instagram.com/ina_apopa_oficial/')} target="_blank" rel="noopener noreferrer" className="social-link">
                            Instagram: {get('instagram', 'titulo', '@ina_apopa_oficial')}
                        </a>
                        <a href={get('tiktok', 'contenido', 'https://www.tiktok.com/@inapopaoficial')} target="_blank" rel="noopener noreferrer" className="social-link">
                            TikTok: {get('tiktok', 'titulo', '@inapopaoficial')}
                        </a>
                    </div>
                </div>

                {/* Columna del mapa */}
                <div className="map-column">
                    <h2>{get('mapa', 'titulo', 'Ubicación')}</h2>
                    <div className="map-container">
                        <iframe
                            src={get('mapa', 'contenido',
                                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1565.868012198678!2d-89.1810772712228!3d13.803841851818627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f633bef15ed222f%3A0x6328d1cb15f7fa7a!2sInstituto%20Nacional%20de%20Apopa!5e0!3m2!1ses-419!2ssv!4v1781128295790!5m2!1ses-419!2ssv')}
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Mapa Instituto Nacional de Apopa"
                        ></iframe>
                    </div>
                    <div className="map-address">
                        <div dangerouslySetInnerHTML={{
                            __html: get('direccion', 'contenido',
                                '<p><strong>Dirección:</strong> Calle "A". Colonia Madre Tierra, Apopa, El Salvador</p><p><strong>Teléfono:</strong> 2216-4001</p>')
                        }} />
                    </div>

                    {/* Imagen adicional (si existe) */}
                    {get('ubicacion', 'imagenUrl') && (
                        <img
                            src={get('ubicacion', 'imagenUrl')}
                            alt="Ubicación"
                            style={{ maxWidth: '100%', marginTop: '16px', borderRadius: '8px' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contactanos;