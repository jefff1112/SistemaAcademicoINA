import React from 'react';

const AreasExtracurriculares = () => {
    const areas = [
        {
            name: 'Selección de Fútbol',
            description: 'Entrenamiento y competencias deportivas en fútbol masculino y femenino.',
            schedule: 'Lunes y Miércoles - 2:00 PM a 4:00 PM',
            contact: 'Prof. Roberto Martinez'
        },
        {
            name: 'Selección de Basketball',
            description: 'Entrenamiento de básquetbol, participacion en torneos interescolares.',
            schedule: 'Martes y Jueves - 2:00 PM a 4:00 PM',
            contact: 'Prof. Carlos Rivera'
        },
        {
            name: 'Selección de Bádminton',
            description: 'Practica y competencias de bádminton a nivel escolar.',
            schedule: 'Viernes - 2:00 PM a 4:00 PM',
            contact: 'Prof. Ana Morales'
        },
        {
            name: 'Banda de Paz',
            description: 'Banda marcial, formación musical e instrumentos de viento y percusión.',
            schedule: 'Lunes a Viernes - 1:30 PM a 3:30 PM',
            contact: 'Prof. José Hernandez'
        },
        {
            name: 'Cachiporras',
            description: 'Perteneciente a la Banda de Paz, coreografías y animación en eventos.',
            schedule: 'Lunes a Viernes - 1:30 PM a 3:30 PM',
            contact: 'Prof. María Flores'
        },
        {
            name: 'Danza Folklórica',
            description: 'Aprendizaje y presentación de danzas tradicionales de El Salvador.',
            schedule: 'Martes y Jueves - 2:00 PM a 4:00 PM',
            contact: 'Lic. Silvia Menjivar'
        },
        {
            name: 'Danza Moderna',
            description: 'Ritmos contemporáneos, coreografías y presentaciones artísticas.',
            schedule: 'Miércoles y Viernes - 2:00 PM a 4:00 PM',
            contact: 'Lic. Karla Reyes'
        }
    ];

    return (
        <div className="page-container">
            <h1>Áreas Extracurriculares</h1>
            <p className="subtitle">Desarrolla tus talentos y habilidades</p>

            <div className="extracurricular-intro">
                <p>El Instituto Nacional de Apopa promueve la participación de los estudiantes en actividades artísticas, deportivas y culturales, logrando resultados positivos y reconocimientos a nivel nacional e internacional.</p>
            </div>

            <div className="extracurricular-grid">
                {areas.map((area, index) => (
                    <div key={index} className="extracurricular-card">
                        <div className="extracurricular-icon"></div>
                        <h3>{area.name}</h3>
                        <p>{area.description}</p>
                        <div className="extra-details">
                            <p><strong>Horario:</strong> {area.schedule}</p>
                            <p><strong>Responsable:</strong> {area.contact}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="achievements-section">
                <h2>Logros y Reconocimientos</h2>
                <ul>
                    <li>Campeonatos interescolares en fútbol y baloncesto</li>
                    <li>Reconocimientos en festivales de danza folklorica</li>
                    <li>Presentaciones de la Banda de Paz en eventos cívicos nacionales</li>
                    <li>Participación en competencias departamentales de bádminton</li>
                </ul>
            </div>

            <div className="calendar-section">
                <h2>Calendario de Actividades 2026</h2>
                <ul>
                    <li>Marzo: Inicio de entrenamientos deportivos</li>
                    <li>Mayo: Festival de Danza y Música</li>
                    <li>Junio: Juegos estudiantiles interescolares</li>
                    <li>Agosto: Presentación de la Banda de Paz</li>
                    <li>Septiembre: Competencias deportivas departamentales</li>
                    <li>Octubre: Clausura de actividades extracurriculares</li>
                </ul>
            </div>
        </div>
    );
};

export default AreasExtracurriculares;