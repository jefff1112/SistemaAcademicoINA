import React, { useEffect, useState } from 'react';
import API from '../services/api';

// Áreas por defecto (fallback)
const AREAS_DEFAULT = [
    { name: 'Selección de Fútbol', description: 'Entrenamiento y competencias deportivas en fútbol masculino y femenino.', schedule: 'Lunes y Miércoles - 2:00 PM a 4:00 PM', contact: 'Prof. Roberto Martinez' },
    { name: 'Selección de Basketball', description: 'Entrenamiento de básquetbol, participacion en torneos interescolares.', schedule: 'Martes y Jueves - 2:00 PM a 4:00 PM', contact: 'Prof. Carlos Rivera' },
    { name: 'Selección de Bádminton', description: 'Practica y competencias de bádminton a nivel escolar.', schedule: 'Viernes - 2:00 PM a 4:00 PM', contact: 'Prof. Ana Morales' },
    { name: 'Banda de Paz', description: 'Banda marcial, formación musical e instrumentos de viento y percusión.', schedule: 'Lunes a Viernes - 1:30 PM a 3:30 PM', contact: 'Prof. José Hernandez' },
    { name: 'Cachiporras', description: 'Perteneciente a la Banda de Paz, coreografías y animación en eventos.', schedule: 'Lunes a Viernes - 1:30 PM a 3:30 PM', contact: 'Prof. María Flores' },
    { name: 'Danza Folklórica', description: 'Aprendizaje y presentación de danzas tradicionales de El Salvador.', schedule: 'Martes y Jueves - 2:00 PM a 4:00 PM', contact: 'Lic. Silvia Menjivar' },
    { name: 'Danza Moderna', description: 'Ritmos contemporáneos, coreografías y presentaciones artísticas.', schedule: 'Miércoles y Viernes - 2:00 PM a 4:00 PM', contact: 'Lic. Karla Reyes' }
];

const AreasExtracurriculares = () => {
    const [contenido, setContenido] = useState([]);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await API.get('/contenido-publico/extracurriculares');
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

    // Áreas desde la BD (secciones que empiezan con "area-")
    const areasBD = contenido.filter(c => c.seccion.startsWith('area-'));
    const areas = areasBD.length > 0
        ? areasBD.map(a => ({
            name: a.titulo,
            description: a.contenido,
            imagenUrl: a.imagenUrl || ''
        }))
        : AREAS_DEFAULT;

    return (
        <div className="page-container">
            <h1>Áreas Extracurriculares</h1>
            <p className="subtitle">Desarrolla tus talentos y habilidades</p>

            <div className="extracurricular-intro">
                <div dangerouslySetInnerHTML={{
                    __html: get('introduccion', 'contenido',
                        'El Instituto Nacional de Apopa promueve la participación de los estudiantes en actividades artísticas, deportivas y culturales, logrando resultados positivos y reconocimientos a nivel nacional e internacional.')
                }} />
                {get('introduccion', 'imagenUrl') && (
                    <img
                        src={get('introduccion', 'imagenUrl')}
                        alt="Introducción"
                        style={{ maxWidth: '100%', marginTop: '12px', borderRadius: '8px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
            </div>

            <div className="extracurricular-grid">
                {areas.map((area, index) => (
                    <div key={index} className="extracurricular-card">
                        {area.imagenUrl && (
                            <img
                                src={area.imagenUrl}
                                alt={area.name}
                                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0', marginBottom: '12px' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                        <div className="extracurricular-icon"></div>
                        <h3>{area.name}</h3>
                        <div dangerouslySetInnerHTML={{ __html: area.description }} />
                        {area.schedule && (
                            <div className="extra-details">
                                <p><strong>Horario:</strong> {area.schedule}</p>
                                {area.contact && <p><strong>Responsable:</strong> {area.contact}</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="achievements-section">
                <h2>{get('logros', 'titulo', 'Logros y Reconocimientos')}</h2>
                <div dangerouslySetInnerHTML={{
                    __html: get('logros', 'contenido',
                        '<ul><li>Campeonatos interescolares en fútbol y baloncesto</li><li>Reconocimientos en festivales de danza folklorica</li><li>Presentaciones de la Banda de Paz en eventos cívicos nacionales</li><li>Participación en competencias departamentales de bádminton</li></ul>')
                }} />
                {get('logros', 'imagenUrl') && (
                    <img
                        src={get('logros', 'imagenUrl')}
                        alt="Logros"
                        style={{ maxWidth: '100%', marginTop: '12px', borderRadius: '8px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
            </div>

            <div className="calendar-section">
                <h2>{get('calendario', 'titulo', 'Calendario de Actividades 2026')}</h2>
                <div dangerouslySetInnerHTML={{
                    __html: get('calendario', 'contenido',
                        '<ul><li>Marzo: Inicio de entrenamientos deportivos</li><li>Mayo: Festival de Danza y Música</li><li>Junio: Juegos estudiantiles interescolares</li><li>Agosto: Presentación de la Banda de Paz</li><li>Septiembre: Competencias deportivas departamentales</li><li>Octubre: Clausura de actividades extracurriculares</li></ul>')
                }} />
                {get('calendario', 'imagenUrl') && (
                    <img
                        src={get('calendario', 'imagenUrl')}
                        alt="Calendario"
                        style={{ maxWidth: '100%', marginTop: '12px', borderRadius: '8px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
            </div>
        </div>
    );
};

export default AreasExtracurriculares;