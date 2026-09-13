// Servicio de API: obtiene los datos estadísticos y resúmenes mostrados en el dashboard.
import API from './api';

// Obtiene el resumen general (totales y promedios) para el dashboard; devuelve ceros ante errores.
export const getDashboardResumen = async () => {
    try {
        const response = await API.get('/dashboard/resumen');
        return response.data;
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        return {
            totalEstudiantes: 0,
            totalDocentes: 0,
            totalClases: 0,
            aspirantesPendientes: 0,
            aspirantesAprobados: 0,
            promedioGeneral: 0,
            aprobados: 0,
            reprobados: 0
        };
    }
};

// Obtiene las estadísticas de una clase por idClase; devuelve null ante errores.
export const getEstadisticasClase = async (idClase) => {
    try {
        const response = await API.get(`/dashboard/estadisticas-clase/${idClase}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

// Obtiene el ranking de los mejores estudiantes; devuelve [] ante errores.
export const getMejoresEstudiantes = async () => {
    try {
        const response = await API.get('/dashboard/mejores-estudiantes');
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};