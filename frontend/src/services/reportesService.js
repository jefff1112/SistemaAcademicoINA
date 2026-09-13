// Servicio de API: genera reportes académicos (notas, rendimiento y asistencias).
import API from './api';

// Obtiene el reporte de notas de un estudiante en un año lectivo.
export const getReporteNotasEstudiante = async (idEstudiante, anioLectivo) => {
    const response = await API.get(`/reportes/notas-estudiante/${idEstudiante}/${anioLectivo}`);
    return response.data;
};

// Obtiene el reporte de rendimiento de una clase en un año lectivo.
export const getReporteRendimientoClase = async (idClase, anioLectivo) => {
    const response = await API.get(`/reportes/rendimiento-clase/${idClase}/${anioLectivo}`);
    return response.data;
};

// Obtiene el reporte de asistencias de un estudiante en un año lectivo.
export const getReporteAsistenciasEstudiante = async (idEstudiante, anioLectivo) => {
    const response = await API.get(`/reportes/asistencias-estudiante/${idEstudiante}/${anioLectivo}`);
    return response.data;
};