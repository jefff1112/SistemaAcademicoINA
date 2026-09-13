// src/services/notasSync.js
// Servicio de sincronización: notifica entre pestañas/ventanas cuando las notas se actualizan (evento, storage y BroadcastChannel).
const CHANNEL_NAME = 'sync-notas';
const STORAGE_KEY = 'notas-ultima-actualizacion';

// Crea un canal de BroadcastChannel si el navegador lo soporta; devuelve null en caso contrario.
const obtenerCanal = () => {
    try {
        if (typeof BroadcastChannel === 'undefined') return null;
        return new BroadcastChannel(CHANNEL_NAME);
    } catch {
        return null;
    }
};

// Dispara el evento local, guarda la marca de tiempo y avisa a otras pestañas por BroadcastChannel.
export const notificarNotasActualizadas = () => {
    try {
        window.dispatchEvent(new Event('notas-actualizadas'));
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
        // sin soporte de localStorage
    }

    try {
        const canal = obtenerCanal();
        if (canal) {
            canal.postMessage({ tipo: 'notas-actualizadas', fecha: Date.now() });
            canal.close();
        }
    } catch {
        // sin soporte de BroadcastChannel
    }
};

// Suscribe un callback a las tres fuentes de aviso; devuelve una función para cancelar la suscripción.
export const suscribirNotasActualizadas = (callback) => {
    const limpiezas = [];

    const handlerEvento = () => callback();
    window.addEventListener('notas-actualizadas', handlerEvento);
    limpiezas.push(() => window.removeEventListener('notas-actualizadas', handlerEvento));

    const handlerStorage = (e) => {
        if (e.key === STORAGE_KEY) callback();
    };
    window.addEventListener('storage', handlerStorage);
    limpiezas.push(() => window.removeEventListener('storage', handlerStorage));

    const canal = obtenerCanal();
    if (canal) {
        const handlerCanal = (e) => {
            if (e.data && e.data.tipo === 'notas-actualizadas') callback();
        };
        canal.addEventListener('message', handlerCanal);
        limpiezas.push(() => {
            canal.removeEventListener('message', handlerCanal);
            canal.close();
        });
    }

    return () => limpiezas.forEach(fn => fn());
};
