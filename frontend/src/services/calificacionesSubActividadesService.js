// src/services/calificacionesSubActividadesService.js
// Servicio de API: gestiona las calificaciones de sub-actividades y el cuadro auxiliar
import API from './api';

const calificacionesSubActividadesService = {
    // Obtener calificaciones por sub-actividad
    getBySubActividad: async (idSubActividad) => {
        try {
            const response = await API.get(`/CalificacionesSubActividades/subactividad/${idSubActividad}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener calificaciones:', error);
            throw error;
        }
    },

    // Obtener calificaciones de un estudiante para una actividad
    getByEstudianteYActividad: async (idEstudiante, idActividad) => {
        try {
            const response = await API.get(`/CalificacionesSubActividades/estudiante/${idEstudiante}/actividad/${idActividad}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener calificaciones del estudiante:', error);
            throw error;
        }
    },

    // Obtener cuadro auxiliar completo (estudiantes x sub-actividades agrupadas por actividad)
    getCuadroAuxiliar: async (idClase, idMateria, idPeriodo) => {
        try {
            const params = new URLSearchParams({
                idClase: idClase.toString(),
                idMateria: idMateria.toString(),
                idPeriodo: idPeriodo.toString()
            });
            const response = await API.get(`/CalificacionesSubActividades/cuadro-auxiliar?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener cuadro auxiliar:', error);
            throw error;
        }
    },

    // Obtener cuadro auxiliar COMPLETO (nuevo endpoint con estructura INA exacta)
    getCuadroCompleto: async (paramsString) => {
        try {
            const response = await API.get(`/CalificacionesSubActividades/cuadro-completo?${paramsString}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener cuadro completo:', error);
            throw error;
        }
    },

    // Guardar calificación individual
    guardar: async (data) => {
        try {
            const response = await API.post('/CalificacionesSubActividades/guardar', data);
            return response.data;
        } catch (error) {
            console.error('Error al guardar calificación:', error);
            throw error;
        }
    },

    // Guardar múltiples calificaciones en lote
    guardarMultiple: async (calificaciones) => {
        try {
            const response = await API.post('/CalificacionesSubActividades/guardar-multiple', calificaciones);
            return response.data;
        } catch (error) {
            console.error('Error al guardar calificaciones múltiples:', error);
            throw error;
        }
    },

    // Guardar nota de recuperación
    guardarRecuperacion: async (data) => {
        try {
            const response = await API.post('/CalificacionesSubActividades/guardar-recuperacion', data);
            return response.data;
        } catch (error) {
            console.error('Error al guardar recuperación:', error);
            throw error;
        }
    },

    // ============================================================
    // EXPORTAR EXCEL (VERSIÓN CORREGIDA)
    // ============================================================
    exportarExcel: async (filtros) => {
        try {
            const params = new URLSearchParams();
            if (filtros.idClase) params.append('idClase', filtros.idClase);
            if (filtros.idMateria) params.append('idMateria', filtros.idMateria);
            if (filtros.idEspecialidad) params.append('idEspecialidad', filtros.idEspecialidad);
            if (filtros.idPeriodo) params.append('idPeriodo', filtros.idPeriodo);
            if (filtros.anioLectivo) params.append('anioLectivo', filtros.anioLectivo);
            if (filtros.todasClases) params.append('todasClases', 'true');
            if (filtros.todasMaterias) params.append('todasMaterias', 'true');
            if (filtros.todosPeriodos) params.append('todosPeriodos', 'true');
            if (filtros.esConsolidadoAnual) params.append('esConsolidadoAnual', 'true');

            console.log('Exportando con params:', params.toString());

            // Endpoint correcto: CuadroAuxiliar/exportar
            const response = await API.get(`/CuadroAuxiliar/exportar?${params.toString()}`, {
                responseType: 'blob'
            });

            // Verificar si el backend devolvió un error disfrazado de blob
            const contentType = response.headers['content-type'] || '';
            if (contentType.includes('application/json')) {
                const text = await response.data.text();
                let errorData = {};
                try {
                    errorData = JSON.parse(text);
                } catch (e) {
                    // no es JSON válido
                }
                throw new Error(errorData.mensaje || errorData.message || 'Error al exportar');
            }

            // Verificar que el blob tenga contenido
            if (!response.data || response.data.size === 0) {
                throw new Error('El archivo generado está vacío');
            }

            // Crear blob y descargar
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extraer nombre del archivo del header Content-Disposition
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `Cuadro_Auxiliar_${Date.now()}.xlsx`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    fileName = match[1].replace(/['"]/g, '');
                    try {
                        fileName = decodeURIComponent(fileName);
                    } catch (e) {
                        // Ignorar si no es URI encoded
                    }
                }
            }
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true, fileName };
        } catch (error) {
            console.error('Error al exportar Excel:', error);

            // Si el error tiene un blob (JSON de error del backend), leerlo
            if (error.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.mensaje || errorData.message || 'Error al exportar');
                } catch (parseError) {
                    throw new Error('Error al exportar: respuesta inválida del servidor');
                }
            }

            throw error;
        }
    },

    // Exportar: Clase + Materia + 1 Período
    exportar1ClaseMateriaUnPeriodo: async (idClase, idMateria, idPeriodo) => {
        return calificacionesSubActividadesService.exportarExcel({
            idClase,
            idMateria,
            idPeriodo
        });
    },

    // Exportar: Clase + Materia + Todos los Periodos
    exportar1ClaseMateriaTodasPeriodos: async (idClase, idMateria, anioLectivo) => {
        return calificacionesSubActividadesService.exportarExcel({
            idClase,
            idMateria,
            anioLectivo,
            todosPeriodos: true
        });
    },

    // Exportar: Clase + Todas las Materias + 1 Período
    exportar1ClaseTodasMateriasUnPeriodo: async (idClase, idPeriodo, anioLectivo) => {
        return calificacionesSubActividadesService.exportarExcel({
            idClase,
            idPeriodo,
            anioLectivo,
            todasMaterias: true
        });
    },

    // Exportar: Clase + Todas las Materias + Todos los Periodos
    exportar1ClaseTodasMateriasTodasPeriodos: async (idClase, anioLectivo) => {
        return calificacionesSubActividadesService.exportarExcel({
            idClase,
            anioLectivo,
            todasMaterias: true,
            todosPeriodos: true
        });
    },

    // Exportar: Consolidado Anual (una hoja por nivel académico)
    exportarConsolidadoAnual: async (anioLectivo) => {
        return calificacionesSubActividadesService.exportarExcel({
            anioLectivo,
            esConsolidadoAnual: true
        });
    },

    // Importar cuadro auxiliar desde Excel
    importarExcel: async (file, idClase, idMateria, idPeriodo) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await API.post(`/CuadroAuxiliar/importar?idClase=${idClase}&idMateria=${idMateria}&idPeriodo=${idPeriodo}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Error al importar Excel:', error);
            throw error;
        }
    },

    // Generar plantilla Excel
    generarPlantilla: async (idClase, idMateria, idPeriodo) => {
        try {
            const response = await API.get(`/CuadroAuxiliar/plantilla?idClase=${idClase}&idMateria=${idMateria}&idPeriodo=${idPeriodo}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let fileName = `Plantilla_CuadroAuxiliar_${Date.now()}.xlsx`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) fileName = match[1].replace(/['"]/g, '');
            }
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Error al generar plantilla:', error);
            throw error;
        }
    },

    // ============================================================
    // AUDITORÍA DE CALIFICACIONES
    // ============================================================

    // Guardar calificación con auditoría (observación obligatoria según rol)
    guardarConAuditoria: async (data) => {
        try {
            const response = await API.post('/CalificacionesSubActividades/guardar-con-auditoria', data);
            return response.data;
        } catch (error) {
            console.error('Error al guardar con auditoría:', error);
            throw error;
        }
    },

    // Guardar múltiples calificaciones con auditoría
    guardarMultipleConAuditoria: async (data) => {
        try {
            const response = await API.post('/CalificacionesSubActividades/guardar-multiple-con-auditoria', data);
            return response.data;
        } catch (error) {
            console.error('Error al guardar múltiples con auditoría:', error);
            throw error;
        }
    },

    // Obtener historial de auditoría de una calificación
    getHistorialAuditoria: async (idCalificacionSub) => {
        try {
            const response = await API.get(`/CalificacionesSubActividades/historial-auditoria/${idCalificacionSub}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener historial de auditoría:', error);
            throw error;
        }
    },

    // Verificar estado de auditoría de una calificación
    getEstadoAuditoria: async (idCalificacionSub) => {
        try {
            const response = await API.get(`/CalificacionesSubActividades/estado-auditoria/${idCalificacionSub}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener estado de auditoría:', error);
            throw error;
        }
    },

    // Verificar auditoría de múltiples calificaciones en lote
    verificarAuditoriaBatch: async (idsCalificacionSub) => {
        try {
            const response = await API.post('/CalificacionesSubActividades/verificar-auditoria-batch', {
                IdsCalificacionSub: idsCalificacionSub
            });
            return response.data;
        } catch (error) {
            console.error('Error al verificar auditoría batch:', error);
            throw error;
        }
    }
};

export default calificacionesSubActividadesService;