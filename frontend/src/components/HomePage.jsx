import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const HomePage = () => {
    const [contenido, setContenido] = useState([]);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await API.get('/contenido-publico/home');
                setContenido(res.data || []);
            } catch (error) {
                console.error('Error cargando contenido:', error);
            }
        };
        cargar();
    }, []);

    // Helper: obtiene un bloque por sección con fallback
    const get = (seccion, campo, fallback = '') => {
        const bloque = contenido.find(c => c.seccion === seccion);
        return bloque?.[campo] || fallback;
    };

    // Bloques de la oferta académica (pueden venir de la BD)
    const carreras = contenido.filter(c => c.seccion.startsWith('carrera-'));

    return (
        <div>
            {/* Hero Section */}
            <div className="hero-section">
                <div className="container">
                    <h1>{get('hero-titulo', 'contenido', 'Instituto Nacional de Apopa')}</h1>
                    <p className="subtitle">{get('hero-subtitulo', 'contenido', 'Excelencia académica y formación integral')}</p>

                    {/* Imagen del Hero (si existe) */}
                    {get('hero-titulo', 'imagenUrl') && (
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <img
                                src={get('hero-titulo', 'imagenUrl')}
                                alt="Hero"
                                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}

                    <div className="hero-buttons">
                        <Link to="/nuevo-ingreso" className="btn-nuevo-ingreso">Nuevo Ingreso</Link>
                        <Link to="/login" className="btn-portal">Portal Académico</Link>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Historia */}
                <div className="history-section-full">
                    <h2>{get('historia', 'titulo', 'Historia')}</h2>
                    <div dangerouslySetInnerHTML={{
                        __html: get('historia', 'contenido',
                            '<p><strong>Fundado el 07 de febrero de 1981</strong>, en el local de la Escuela Vicente Acosta; se utilizó una sala de clases para el funcionamiento de una sección del 1º año de bachillerato con 44 alumnos.</p><p>El Profesor José Jerónimo Yánez (Director), profesor Rubén Alirio Gomero Canjura, Señora María Ramos (Secretaria), Señor Angelino Herrera Salazar (Ordenanza) fueron quienes hicieron funcionar al INA durante el primer año.</p><p>Inicialmente se atendía solo el Bachillerato General y fue en <strong>1984</strong> que se ubicó donde se encuentra actualmente.</p><p>En <strong>1988</strong> se ofreció: Bachillerato Académico, Bachillerato Comercial y Bachillerato en Salud; con una población de 1000 estudiantes y 30 docentes.</p><p>A partir del año <strong>2015</strong> se desarrolla el <strong>Currículo Renovado</strong>, ofreciendo Bachillerato Técnico Vocacional en Administrativo Contable, Atención Primaria en Salud, Electrónica, Desarrollo de Software y Bachillerato General.</p>')
                    }} />

                    {/* Imagen de Historia (si existe) */}
                    {get('historia', 'imagenUrl') && (
                        <div style={{ marginTop: '20px' }}>
                            <img
                                src={get('historia', 'imagenUrl')}
                                alt={get('historia', 'titulo', 'Historia')}
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', display: 'block', margin: '0 auto' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}
                </div>

                {/* Datos clave */}
                <div className="key-facts">
                    <div className="fact-card">
                        <div className="fact-number">1981</div>
                        <div className="fact-label">Fundación</div>
                    </div>
                    <div className="fact-card">
                        <div className="fact-number">44</div>
                        <div className="fact-label">Primeros Alumnos</div>
                    </div>
                    <div className="fact-card">
                        <div className="fact-number">1000+</div>
                        <div className="fact-label">Estudiantes</div>
                    </div>
                    <div className="fact-card">
                        <div className="fact-number">30</div>
                        <div className="fact-label">Docentes</div>
                    </div>
                </div>

                {/* Misión y Visión */}
                <div className="mission-vision-section">
                    <div className="mission-card">
                        <h3>{get('mision', 'titulo', 'Misión')}</h3>
                        <div dangerouslySetInnerHTML={{
                            __html: get('mision', 'contenido',
                                'Formar jóvenes con excelencia académica, valores y habilidades técnicas que les permitan incorporarse exitosamente a la sociedad, al mundo laboral o crear su propia empresa.')
                        }} />
                        {get('mision', 'imagenUrl') && (
                            <div style={{ marginTop: '12px' }}>
                                <img
                                    src={get('mision', 'imagenUrl')}
                                    alt="Misión"
                                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="vision-card">
                        <h3>{get('vision', 'titulo', 'Visión')}</h3>
                        <div dangerouslySetInnerHTML={{
                            __html: get('vision', 'contenido',
                                'Ser un instituto líder a nivel nacional, reconocido por la calidad educativa y la formación integral de estudiantes emprendedores y competitivos.')
                        }} />
                        {get('vision', 'imagenUrl') && (
                            <div style={{ marginTop: '12px' }}>
                                <img
                                    src={get('vision', 'imagenUrl')}
                                    alt="Visión"
                                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Oferta Académica */}
            <div className="academic-section">
                <div className="container">
                    <h2>Oferta Académica</h2>
                    <div className="career-grid">
                        {carreras.length > 0 ? (
                            carreras.map(c => (
                                <div key={c.idContenido} className="career-card">
                                    <h4>{c.titulo}</h4>
                                    <div dangerouslySetInnerHTML={{ __html: c.contenido || '' }} />
                                    {c.imagenUrl && (
                                        <img
                                            src={c.imagenUrl}
                                            alt={c.titulo}
                                            style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="career-card">
                                    <h4>Bachillerato General</h4>
                                    <p>Formación académica completa.</p>
                                    <span className="duration">2 años</span>
                                </div>
                                <div className="career-card">
                                    <h4>Desarrollo de Software</h4>
                                    <p>Programación, bases de datos, desarrollo web y móvil.</p>
                                    <span className="duration">3 años</span>
                                </div>
                                <div className="career-card">
                                    <h4>Administrativo Contable</h4>
                                    <p>Contabilidad, administración, legislación.</p>
                                    <span className="duration">3 años</span>
                                </div>
                                <div className="career-card">
                                    <h4>Electrónica</h4>
                                    <p>Circuitos, robótica, mantenimiento.</p>
                                    <span className="duration">3 años</span>
                                </div>
                                <div className="career-card">
                                    <h4>Atención Primaria en Salud</h4>
                                    <p>Primeros auxilios, enfermería básica.</p>
                                    <span className="duration">3 años</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="view-more">
                        <Link to="/bachilleratos" className="btn-secondary">Ver más</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;