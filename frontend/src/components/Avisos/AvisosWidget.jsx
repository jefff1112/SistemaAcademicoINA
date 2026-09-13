// Componente AvisosWidget: widget reutilizable que muestra las notificaciones no leídas del usuario.
import React, { useState, useEffect } from 'react';
import API from '../../services/api';

// Componente principal: lista de avisos recientes, oculta si no hay pendientes.
const AvisosWidget = () => {
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarAvisos();
    }, []);

    // Carga las notificaciones no leídas desde la API.
    const cargarAvisos = async () => {
        try {
            const response = await API.get('/notificaciones');
            // Mostrar todas las notificaciones no leídas
            const noLeidas = response.data.filter(n => !n.leida);
            setAvisos(noLeidas.slice(0, 5));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Marca una notificación como leída y recarga la lista.
    const marcarLeida = async (id) => {
        try {
            await API.post(`/notificaciones/marcar-leida/${id}`);
            cargarAvisos();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) {
        return null;
    }

    if (avisos.length === 0) {
        return null;
    }

    return (
        <div className="avisos-widget">
            <div className="avisos-header">
                <h3>Avisos Importantes</h3>
            </div>
            <div className="avisos-list">
                {avisos.map(aviso => (
                    <div key={aviso.id} className="aviso-item" onClick={() => marcarLeida(aviso.id)}>
                        <div className="aviso-titulo">
                            <strong>{aviso.titulo}</strong>
                        </div>
                        <div className="aviso-contenido">{aviso.mensaje}</div>
                        <div className="aviso-fecha">
                            {new Date(aviso.fecha).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvisosWidget;