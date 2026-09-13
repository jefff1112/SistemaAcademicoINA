import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div>
            {/* Hero Section */}
            <div className="hero-section">
                <div className="container">
                    <h1>Instituto Nacional de Apopa</h1>
                    <p className="subtitle">Excelencia académica y formación integral</p>
                    <div className="hero-buttons">
                        <Link to="/nuevo-ingreso" className="btn-nuevo-ingreso">Nuevo Ingreso</Link>
                        <Link to="/login" className="btn-portal">Portal Académico</Link>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Historia */}
                <div className="history-section-full">
                    <h2>Historia</h2>
                    <p><strong>Fundado el 07 de febrero de 1981</strong>, en el local de la Escuela Vicente Acosta; se utilizó una sala de clases para el funcionamiento de una sección del 1º año de bachillerato con 44 alumnos.</p>
                    <p>El Profesor José Jerónimo Yánez (Director), profesor Rubén Alirio Gomero Canjura, Señora María Ramos (Secretaria), Señor Angelino Herrera Salazar (Ordenanza) fueron quienes hicieron funcionar al INA durante el primer año.</p>
                    <p>Inicialmente se atendía solo el Bachillerato General y fue en <strong>1984</strong> que se ubicó donde se encuentra actualmente.</p>
                    <p>En <strong>1988</strong> se ofreció: Bachillerato Académico, Bachillerato Comercial y Bachillerato en Salud; con una población de 1000 estudiantes y 30 docentes.</p>
                    <p>A partir del año <strong>2015</strong> se desarrolla el <strong>Currículo Renovado</strong>, ofreciendo Bachillerato Técnico Vocacional en Administrativo Contable, Atención Primaria en Salud, Electrónica, Desarrollo de Software y Bachillerato General.</p>
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
                        <h3>Misión</h3>
                        <p>Formar jóvenes con excelencia académica, valores y habilidades técnicas que les permitan incorporarse exitosamente a la sociedad, al mundo laboral o crear su propia empresa.</p>
                    </div>
                    <div className="vision-card">
                        <h3>Visión</h3>
                        <p>Ser un instituto líder a nivel nacional, reconocido por la calidad educativa y la formación integral de estudiantes emprendedores y competitivos.</p>
                    </div>
                </div>
            </div>

            {/* Oferta Académica */}
            <div className="academic-section">
                <div className="container">
                    <h2>Oferta Académica</h2>
                    <div className="career-grid">
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