// Componente Boletas de Notas (Registro Académico)
// Wrapper que reutiliza el componente genérico BoletaNotasEstudiante
// con el título específico para Registro Académico.
//
// Motivo: el componente base BoletaNotasEstudiante es reutilizable por
// múltiples roles (Dirección, Registro, Sub Dirección). Este wrapper
// permite mantener la ruta y el título contextualizado sin duplicar lógica.
import React from 'react';
import BoletaNotasEstudianteRegistro from './BoletaNotasEstudiante';

const BoletaNotasRegistro = () => {
    return (
        <BoletaNotasEstudianteRegistro
            titulo="Boletas de Notas - Registro Académico"
        />
    );
};

export default BoletaNotasRegistro;