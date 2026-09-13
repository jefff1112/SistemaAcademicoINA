import React, { useState } from 'react';

const Bachilleratos = () => {
    const [selectedCareer, setSelectedCareer] = useState('software');

    const careers = {
        software: {
            name: 'Desarrollo de Software',
            duration: '3 años',
            description: 'En este bachillerato recibirás formación técnica necesaria para desarrollar aplicaciones de escritorio, intranet, web y dispositivos móviles. También obtendrás los conocimientos necesarios para la Administración de Bases de Datos relacionales.',
            subjects: [
                'Programacion I, II, III', 'Base de Datos I y II', 'Estructura de Datos',
                'Ingenieria de Software', 'Aplicaciones Web', 'Aplicaciones Moviles',
                'Redes y Comunicaciones', 'Mantenimiento de Computadoras', 'Logica de Programacion',
                'Diseño UML', 'Matematicas', 'Ingles Tecnico', 'Lenguaje y Literatura'
            ],
            skills: [
                'Analizar los requerimientos de clientes para desarrollar sistemas',
                'Desarrollo de Logica de programacion',
                'Diseñar soluciones informaticas utilizando UML',
                'Administrar bases de datos relacionales',
                'Desarrollar aplicaciones web con Python, Java, C#',
                'Frameworks: Angular, React, JavaScript/TypeScript',
                'Diseñar y configurar redes virtuales',
                'Elaborar manuales de usuarios con normas ISO e ITIL',
                'Implementar buenas practicas de desarrollo de software',
                'Competencias en tecnologias emergentes: IA, realidad virtual, impresion 3D'
            ],
            jobs: [
                'Soporte para mantenimiento de aplicaciones',
                'Desarrollador de sitios y aplicaciones Web',
                'Diseñador de Sistemas',
                'Diseñador y Administrador de Base de datos',
                'Instalador y configurador de Redes LAN',
                'Tecnico de Aseguramiento de Calidad',
                'Cloud Computing',
                'Documentador de Sistemas',
                'Ventas de soluciones de Software'
            ]
        },
        electronica: {
            name: 'Electronica',
            duration: '3 años',
            description: 'El Bachiller Tecnico en Electronica egresa como persona de solida formacion Tecnica y Humana que le permite insertarse en la vida laboral, ser agente productivo del pais y promover su desarrollo personal.',
            subjects: [
                'Dispositivos Electronicos', 'Circuitos Resistivos en CD', 'Semiconductores Lineales',
                'Circuitos Integrados', 'Circuitos Digitales', 'Microcontroladores',
                'Control Electronico de Motores', 'Maquinas Electricas Estaticas',
                'Instrumentacion Electronica', 'Robotica', 'Matematicas', 'Ingles Tecnico'
            ],
            skills: [
                'Estudio de dispositivos electronicos',
                'Analisis de circuitos resistivos en corriente directa',
                'Analisis de Semiconductores lineales',
                'Estudio de circuitos integrados',
                'Aplicacion de circuitos digitales',
                'Programacion de microcontroladores',
                'Control electronico de motores',
                'Mantenimiento de equipos electronicos'
            ],
            jobs: [
                'Mantenimiento electronico de circuitos',
                'Industria de procesos automatizados',
                'Reparacion de equipos electronicos',
                'Instalacion de sistemas electronicos',
                'Tecnico en robotica'
            ]
        },
        contable: {
            name: 'Administrativo Contable',
            duration: '3 años',
            description: 'Competencias y Oportunidades que lograra con el Bachillerato Tecnico Vocacional Administrativo Contable.',
            subjects: [
                'Contabilidad I, II, III', 'Administracion I y II', 'Legislacion Laboral',
                'Legislacion Tributaria', 'Matematica Financiera', 'Economia',
                'Gestion de Compras', 'Analisis Financieros', 'Calculo de Costos',
                'Emprendedurismo', 'Ingles para Contabilidad', 'Lenguaje y Literatura'
            ],
            skills: [
                'Manejo de informacion y registro contable',
                'Organizacion de archivos electronicos',
                'Gestion de procesos y control interno',
                'Interpretacion en ingles de contabilidad',
                'Diseño de planes de negocios',
                'Registro de estados financieros',
                'Tecnicas para administracion de recursos humanos',
                'Procesos para creacion de microempresas'
            ],
            jobs: [
                'Asistente Contable', 'Asistente Administrativo', 'Cajero',
                'Planillero', 'Asistente de Recursos Humanos', 'Ejecutivo de Ventas',
                'Gerente de su propia empresa', 'Operador de Call Center',
                'Asistente de Compras', 'Recepcionista'
            ]
        },
        salud: {
            name: 'Atencion Primaria en Salud',
            duration: '3 años',
            description: 'El Tecnico en Atencion Primaria en Salud es un Tecnico de nivel medio preparado para incorporarse a los procesos de promocion de la salud, Organizacion Comunitaria y Actividades de Administracion de la Salud.',
            subjects: [
                'Anatomia y Fisiologia', 'Primeros Auxilios', 'Enfermeria Basica',
                'Salud Publica', 'Nutricion', 'Farmacologia Basica',
                'Promocion de la Salud', 'Salud Mental', 'Prevencion de Desastres',
                'Vigilancia Epidemiologica', 'Matematicas', 'Ingles Tecnico'
            ],
            skills: [
                'Promocion de la salud y organizacion comunitaria',
                'Vigilancia Epidemiologica',
                'Primeros Auxilios en emergencias',
                'Prevencion de desastres',
                'Cuidados basicos en salud',
                'Apoyo en servicios de salud'
            ],
            jobs: [
                'Promotor Comunitario de Salud',
                'Asistente de cuidados en salud',
                'Asistente Tecnico en Laboratorio Clinico',
                'Asistente en Radiologia, Farmacia, Odontologia',
                'Promotor de Salud Ambiental',
                'Gestor del desarrollo local'
            ]
        },
        general: {
            name: 'Bachillerato General',
            duration: '2 años',
            description: 'Duracion de 2 años y al graduarte podras optar por una carrera universitaria especializada. Obtienes conocimientos generales en todas las asignaturas cientificas.',
            subjects: [
                'Matematicas', 'Lenguaje y Literatura', 'Ingles',
                'Ciencias Naturales', 'Ciencias Sociales', 'Historia',
                'Filosofia', 'Psicologia', 'Educacion Fisica',
                'Orientacion', 'Estudios Sociales'
            ],
            skills: [
                'Conocimientos generales en todas las asignaturas cientificas',
                'Preparacion para asistir a la universidad',
                'Competencias basicas para el campo laboral',
                'Capacidad de micro-emprendimiento'
            ],
            jobs: [
                'Estudios universitarios',
                'Sector comercio',
                'Industria',
                'Micro emprendimiento',
                'Servicios'
            ]
        }
    };

    const current = careers[selectedCareer];

    return (
        <div className="page-container">
            <h1>Bachilleratos</h1>
            <p className="subtitle">Conoce nuestra oferta academica</p>

            <div className="career-tabs">
                <button onClick={() => setSelectedCareer('general')} className={`tab-btn ${selectedCareer === 'general' ? 'active' : ''}`}>Bachillerato General</button>
                <button onClick={() => setSelectedCareer('software')} className={`tab-btn ${selectedCareer === 'software' ? 'active' : ''}`}>Desarrollo de Software</button>
                <button onClick={() => setSelectedCareer('contable')} className={`tab-btn ${selectedCareer === 'contable' ? 'active' : ''}`}>Administrativo Contable</button>
                <button onClick={() => setSelectedCareer('electronica')} className={`tab-btn ${selectedCareer === 'electronica' ? 'active' : ''}`}>Electronica</button>
                <button onClick={() => setSelectedCareer('salud')} className={`tab-btn ${selectedCareer === 'salud' ? 'active' : ''}`}>Atencion Primaria en Salud</button>
            </div>

            <div className="career-detail">
                <div className="career-header">
                    <h2>{current.name}</h2>
                    <p className="duration">Duracion: {current.duration}</p>
                </div>

                <div className="career-description">
                    <h3>Descripcion</h3>
                    <p>{current.description}</p>
                </div>

                <div className="subjects-section">
                    <h3>Pensum de Estudios</h3>
                    <div className="subjects-grid">
                        {current.subjects.map((subject, index) => (
                            <div key={index} className="subject-item">{subject}</div>
                        ))}
                    </div>
                </div>

                <div className="skills-section">
                    <h3>Competencias Tecnicas</h3>
                    <ul className="skills-list">
                        {current.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </div>

                <div className="jobs-section">
                    <h3>Campos de Trabajo</h3>
                    <div className="jobs-grid">
                        {current.jobs.map((job, index) => (
                            <div key={index} className="job-item">{job}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bachilleratos;