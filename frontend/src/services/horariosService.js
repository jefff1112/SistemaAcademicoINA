// Servicio de API: obtiene los horarios según el rol (estudiante, docente o clase).
import API from './api';

// Obtiene el horario de un estudiante; devuelve [] ante errores.
export const getHorarioEstudiante = async (idEstudiante) => {
    try {
        const response = await API.get(`/horarios/estudiante/${idEstudiante}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

// Obtiene el horario de un docente; devuelve [] ante errores.
export const getHorarioDocente = async (idDocente) => {
    try {
        const response = await API.get(`/horarios/docente/${idDocente}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

// Obtiene el horario de una clase; devuelve [] ante errores.
export const getHorarioClase = async (idClase) => {
    try {
        const response = await API.get(`/horarios/clase/${idClase}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};
