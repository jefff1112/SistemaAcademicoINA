
// Componente Boletas de Notas (Registro Académico): genera el PDF de la boleta de notas individual
// por estudiante (formato INA o MINED), usando el componente específico de Registro Académico.
import React from 'react';
import BoletaNotasEstudianteRegistro from './BoletaNotasEstudiante';

const BoletaNotasRegistro = () => {
    return <BoletaNotasEstudianteRegistro titulo="Boletas de Notas - Registro Academico" />;
};

export default BoletaNotasRegistro;