// Servicio de API: gestiona los estudiantes (CRUD, búsquedas y cambio de clase).
import API from './api';

// Obtiene la lista de todos los estudiantes.
export const getEstudiantes = async () => {
    try {
        const response = await API.get('/estudiantes');
        return response.data;
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        throw error;
    }
};

// Obtiene un estudiante por su id.
export const getEstudiante = async (id) => {
    try {
        const response = await API.get(`/estudiantes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener estudiante:', error);
        throw error;
    }
};

// Obtiene un estudiante por su código institucional.
export const getEstudianteByCodigo = async (codigo) => {
    try {
        const response = await API.get(`/estudiantes/codigo/${codigo}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener estudiante por código:', error);
        throw error;
    }
};

// Obtiene los estudiantes matriculados en una clase por idClase.
export const getEstudiantesByClase = async (idClase) => {
    try {
        const response = await API.get(`/estudiantes/clase/${idClase}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener estudiantes por clase:', error);
        throw error;
    }
};

// Crea un nuevo estudiante con los datos enviados.
export const createEstudiante = async (data) => {
    try {
        const response = await API.post('/estudiantes', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear estudiante:', error);
        throw error;
    }
};

// Actualiza un estudiante existente por su id.
export const updateEstudiante = async (id, data) => {
    try {
        const response = await API.put(`/estudiantes/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        throw error;
    }
};

// Elimina un estudiante por su id.
export const deleteEstudiante = async (id) => {
    try {
        const response = await API.delete(`/estudiantes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        throw error;
    }
};

// Cambia a un estudiante de clase; prueba varias variantes de endpoint y método para tolerar diferencias del backend.
export const cambiarClase = async (idEstudiante, idNuevaClase) => {
    // Enviamos varias variantes del nombre del campo para tolerar diferencias
    // entre implementaciones del backend (idNuevaClase, idClase, idClaseNueva, classId).
    const payload = {
        idNuevaClase,
        idClase: idNuevaClase,
        idClaseNueva: idNuevaClase,
        classId: idNuevaClase,
        idEstudiante
    };

    // Intentos con distintos endpoints/métodos para evitar 404 por ruta distinta
    // Evitar llamar a /estudiantes/cambiar-clase sin id porque puede coincidir
    // con la ruta parametrizada /estudiantes/{id} en algunos backends y generar
    // un 400 con id = 'cambiar-clase'. Probar solo rutas con id en la URL
    // y una alternativa en inscripciones.
    const attempts = [
        { method: 'put', url: `/estudiantes/${idEstudiante}/cambiar-clase` },
        { method: 'put', url: `/inscripciones/${idEstudiante}/cambiar-clase` },
        { method: 'post', url: `/inscripciones/cambiar-clase` }
    ];

    let lastError = null;
    for (const attempt of attempts) {
        try {
            const response = await API[attempt.method](attempt.url, payload);
            return response.data;
        } catch (error) {
            lastError = error;
            // Si es 404 probamos la siguiente variante. Si es 405 (Method Not Allowed)
            // intentamos con el otro método (PUT <-> POST) en la misma URL antes de seguir.
            const status = error.response?.status;
            if (status === 405) {
                try {
                    const altMethod = attempt.method === 'put' ? 'post' : 'put';
                    const altResponse = await API[altMethod](attempt.url, payload);
                    return altResponse.data;
                } catch (altError) {
                    lastError = altError;
                    // continuar al siguiente intento
                }
            }
            // Si es otro error que no 404, lo lanzamos inmediatamente
            if (status && status !== 404) {
                console.error('Error al cambiar clase:', error);
                throw error;
            }
            // console.warn(`Endpoint ${attempt.method.toUpperCase()} ${attempt.url} returned 404, intentando siguiente...`);
        }
    }

    // Si todos los intentos devolvieron 404, lanzar el último error para que la UI lo muestre
    console.error('Todos los endpoints para cambiar clase devolvieron 404. Último error:', lastError);
    throw lastError;
};
