import React, { useEffect, useState } from 'react';
import API from '../services/api';

const CulturaInstitucional = () => {
    const [contenido, setContenido] = useState([]);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await API.get('/contenido-publico/cultura');
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

    // Valores desde la BD (secciones que empiezan con "valor-")
    const valoresBD = contenido.filter(c => c.seccion.startsWith('valor-'));

    return (
        <div className="page-container">
            <h1>Cultura Institucional</h1>

            {/* Quienes Somos */}
            <div className="about-section">
                <h2>{get('quienes-somos', 'titulo', '¿Quiénes Somos?')}</h2>
                <div dangerouslySetInnerHTML={{
                    __html: get('quienes-somos', 'contenido',
                        'Somos una institución de educación media, con más de 40 años formando bachilleres de calidad, comprometidos con la sociedad.')
                }} />
                {get('quienes-somos', 'imagenUrl') && (
                    <img
                        src={get('quienes-somos', 'imagenUrl')}
                        alt="Quiénes Somos"
                        style={{ maxWidth: '100%', marginTop: '12px', borderRadius: '8px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
            </div>

            {/* Misión */}
            <div className="mission-section">
                <h2>{get('mision', 'titulo', 'Misión')}</h2>
                <div dangerouslySetInnerHTML={{
                    __html: get('mision', 'contenido',
                        'Somos una institución de educación media que brinda servicios de calidad, haciendo uso de recursos tecnológicos apropiados para la formación de personas integrales, competentes y con visión empresarial con la participación efectiva de los diferentes actores y gestores del proceso educativo.')
                }} />
                {get('mision', 'imagenUrl') && (
                    <img
                        src={get('mision', 'imagenUrl')}
                        alt="Misión"
                        style={{ maxWidth: '100%', marginTop: '12px', borderRadius: '8px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
            </div>

            {/* Visión */}
            <div className="vision-section">
                <h2>{get('vision', 'titulo', 'Visión')}</h2>
                <div dangerouslySetInnerHTML={{
                    __html: get('vision', 'contenido',
                        'Ser una Institución de educación media, líder en la formación de personas integrales, competentes y capaces de desarrollarse en el ámbito familiar, social y de estudios superiores, con proyección empresarial.')
                }} />
                {get('vision', 'imagenUrl') && (
                    <img
                        src={get('vision', 'imagenUrl')}
                        alt="Visión"
                        style={{ maxWidth: '100%', marginTop: '12px', borderRadius: '8px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
            </div>

            {/* Valores */}
            <div className="values-section-detailed">
                <h2>Valores Institucionales</h2>
                <div className="values-grid-detailed">
                    {valoresBD.length > 0 ? (
                        valoresBD.map(v => (
                            <div key={v.idContenido} className="value-card">
                                <div className="value-title">{v.titulo}</div>
                                <div dangerouslySetInnerHTML={{ __html: v.contenido || '' }} />
                                {v.imagenUrl && (
                                    <img
                                        src={v.imagenUrl}
                                        alt={v.titulo}
                                        style={{ maxWidth: '100%', marginTop: '8px', borderRadius: '6px' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            {/* Símbolos Institucionales */}
            <div className="symbols-section">
                <h2>Símbolos Institucionales</h2>
                <div className="symbols-grid">
                    <div className="symbol-card">
                        <h3>{get('escudo', 'titulo', 'Escudo')}</h3>
                        <div dangerouslySetInnerHTML={{
                            __html: get('escudo', 'contenido',
                                'Representa la identidad, los valores y la trayectoria del Instituto Nacional de Apopa.')
                        }} />
                        {get('escudo', 'imagenUrl') && (
                            <img
                                src={get('escudo', 'imagenUrl')}
                                alt="Escudo"
                                style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '6px' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                    </div>
                    <div className="symbol-card">
                        <h3>{get('bandera', 'titulo', 'Bandera')}</h3>
                        <div dangerouslySetInnerHTML={{
                            __html: get('bandera', 'contenido',
                                'Los colores que identifican a nuestra institución y nos representan en eventos cívicos y culturales.')
                        }} />
                        {get('bandera', 'imagenUrl') && (
                            <img
                                src={get('bandera', 'imagenUrl')}
                                alt="Bandera"
                                style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '6px' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                    </div>
                    <div className="symbol-card">
                        <h3>{get('himno', 'titulo', 'Himno')}</h3>
                        <div dangerouslySetInnerHTML={{
                            __html: get('himno', 'contenido',
                                'Canto que exalta los valores, la historia y el orgullo de pertenecer al Instituto Nacional de Apopa.')
                        }} />
                        {get('himno', 'imagenUrl') && (
                            <img
                                src={get('himno', 'imagenUrl')}
                                alt="Himno"
                                style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '6px' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CulturaInstitucional;