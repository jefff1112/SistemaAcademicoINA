import React from 'react';

const CulturaInstitucional = () => {
    return (
        <div className="page-container">
            <h1>Cultura Institucional</h1>

            {/* Quienes Somos */}
            <div className="about-section">
                <h2>¿Quiénes Somos?</h2>
                <p>Somos una institución de educación media, con más de 40 años formando bachilleres de calidad, comprometidos con la sociedad.</p>
            </div>

            {/* Misión */}
            <div className="mission-section">
                <h2>Misión</h2>
                <p>Somos una institución de educación media que brinda servicios de calidad, haciendo uso de recursos tecnológicos apropiados para la formación de personas integrales, competentes y con visión empresarial con la participación efectiva de los diferentes actores y gestores del proceso educativo.</p>
            </div>

            {/* Visión */}
            <div className="vision-section">
                <h2>Visión</h2>
                <p>Ser una Institución de educación media, líder en la formación de personas integrales, competentes y capaces de desarrollarse en el ámbito familiar, social y de estudios superiores, con proyección empresarial.</p>
            </div>

            {/* Valores */}
            <div className="values-section-detailed">
                <h2>Valores Institucionales</h2>
                <div className="values-grid-detailed">
                    <div className="value-card">
                        <div className="value-title">Calidad en Educación</div>
                        <p>Brindamos servicios educativos de excelencia para la formación integral de nuestros estudiantes.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-title">Excelencia Académica</div>
                        <p>Buscamos la mejora continua en el proceso de enseñanza-aprendizaje.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-title">Innovación continua</div>
                        <p>Incorporamos recursos tecnológicos apropiados para potenciar el aprendizaje.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-title">Compromiso Social</div>
                        <p>Nos comprometemos con el desarrollo de la sociedad a través de la formación de jóvenes.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-title">Respeto</div>
                        <p>Fomentamos el respeto entre todos los miembros de la comunidad educativa.</p>
                    </div>
                </div>
            </div>

            {/* Símbolos Institucionales */}
            <div className="symbols-section">
                <h2>Símbolos Institucionales</h2>
                <div className="symbols-grid">
                    <div className="symbol-card">
                        <h3>Escudo</h3>
                        <p>Representa la identidad, los valores y la trayectoria del Instituto Nacional de Apopa.</p>
                    </div>
                    <div className="symbol-card">
                        <h3>Bandera</h3>
                        <p>Los colores que identifican a nuestra institución y nos representan en eventos cívicos y culturales.</p>
                    </div>
                    <div className="symbol-card">
                        <h3>Himno</h3>
                        <p>Canto que exalta los valores, la historia y el orgullo de pertenecer al Instituto Nacional de Apopa.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CulturaInstitucional;