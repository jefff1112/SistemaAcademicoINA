// Componente Generar Horarios: edita el horario semanal de clases por turno, con validación de conflictos.
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';

// Días hábiles disponibles para el horario.
const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
// Definicion de turnos con franjas (inicio, etiqueta y si es receso)
// Turno matutino: 8 franjas de 45 minutos con dos recesos.
const turnoMatutino = [
    { start: '07:00', label: '07:00 - 07:45', receso: false },
    { start: '07:45', label: '07:45 - 08:30', receso: false },
    { start: '08:30', label: '08:30 - 08:45', receso: true },
    { start: '08:45', label: '08:45 - 09:30', receso: false },
    { start: '09:30', label: '09:30 - 10:15', receso: false },
    { start: '10:15', label: '10:15 - 10:30', receso: true },
    { start: '10:30', label: '10:30 - 11:15', receso: false },
    { start: '11:15', label: '11:15 - 12:00', receso: false },
];

// Turno vespertino: 8 franjas de 45 minutos con dos recesos.
const turnoVespertino = [
    { start: '13:00', label: '13:00 - 13:45', receso: false },
    { start: '13:45', label: '13:45 - 14:30', receso: false },
    { start: '14:30', label: '14:30 - 14:45', receso: true },
    { start: '14:45', label: '14:45 - 15:30', receso: false },
    { start: '15:30', label: '15:30 - 16:15', receso: false },
    { start: '16:15', label: '16:15 - 16:30', receso: true },
    { start: '16:30', label: '16:30 - 17:15', receso: false },
    { start: '17:15', label: '17:15 - 18:00', receso: false },
];

// Componente principal: genera el horario por clase con modal de edición y sincronización con el servidor.
const GenerarClase = () => {
    // Estados: catálogos, clase seleccionada, horario actual y modal de edición.
    const [clases, setClases] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClase, setSelectedClase] = useState('');
    const [horario, setHorario] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCelda, setSelectedCelda] = useState(null);
    const [editingHorario, setEditingHorario] = useState(null);
    const [formData, setFormData] = useState({
        idMateria: '',
        idDocente: '',
        aula: ''
    });
    // Cambios pendientes (adds/updates) y docentes no disponibles por conflicto remoto.
    const [pendingAdds, setPendingAdds] = useState([]);
    const [pendingUpdates, setPendingUpdates] = useState([]);
    const [remoteUnavailableDocentes, setRemoteUnavailableDocentes] = useState(new Set());
    const [remoteChecking, setRemoteChecking] = useState(false);

    // Carga los catálogos de clases, materias y docentes al montar el componente.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Autoload horario al cambiar la clase seleccionada
    // Carga el horario de la clase cuando cambia la clase seleccionada.
    useEffect(() => {
        if (selectedClase) cargarHorario();
    }, [selectedClase]);

    // Obtiene en paralelo clases, materias y docentes desde la API.
    const cargarDatos = async () => {
        try {
            const [clasesRes, materiasRes, docentesRes] = await Promise.all([
                // Petición GET /clases para el selector de clase.
                API.get('/clases'),
                // Petición GET /materias para el selector de materia.
                API.get('/materias'),
                // Petición GET /docentes para el selector de docente.
                API.get('/docentes')
            ]);
            setClases(clasesRes.data || []);
            setMaterias(materiasRes.data || []);
            setDocentes(docentesRes.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handler para selecci�n de docente en la modal: valida local y remoto antes de aceptar
    // Valida conflictos local y remoto antes de aceptar al docente en la modal.
    const handleSelectDocente = async (value) => {
        const did = value;
        const slotDia = selectedCelda?.dia || (editingHorario ? diaAString(editingHorario.diaSemana) : null);
        const slotHora = selectedCelda?.hora || formatoHoraSimple(editingHorario?.horaInicio || editingHorario?.HoraInicio || editingHorario?.hora || '');
        const excludeId = editingHorario ? (editingHorario.idHorario ?? editingHorario.IdHorario) : null;
        // validacion local
        const { unavailableDocentes } = getUnavailableForSlot(slotDia, slotHora, excludeId);
        if (unavailableDocentes.has(String(did)) && String(did) !== String(editingHorario?.idDocente ?? editingHorario?.IdDocente)) {
            alert('Conflicto local: el docente ya est\u00e1 asignado en ese d\u00eda y hora.');
            return;
        }
        // validacion remota
        const remoto = await checkDocenteRemoteConflict(did, slotDia, slotHora, excludeId);
        if (remoto && String(did) !== String(editingHorario?.idDocente ?? editingHorario?.IdDocente)) {
            alert('Conflicto remoto: el docente ya tiene una clase en ese d\u00eda y hora.');
            return;
        }
        setFormData(prev => ({ ...prev, idDocente: did }));
    };

    // Envía los cambios pendientes (altas y actualizaciones) al servidor.
    const commitChanges = async () => {
        const errors = [];
        try {
            // enviar adds
            for (const a of pendingAdds) {
                const payload = {
                    IdClase: parseInt(selectedClase),
                    IdMateria: parseInt(a.idMateria),
                    IdDocente: parseInt(a.idDocente),
                    DiaSemana: a.diaSemana,
                    HoraInicio: padHora(a.horaInicio),
                    HoraFin: padHora(a.horaFin),
                    Aula: a.aula,
                    AnioLectivo: new Date().getFullYear()
                };
                console.log('POST /horarios payload', payload);
                try {
                    // Petición POST /horarios para crear la franja.
                    await API.post('/horarios', payload);
                } catch (err) {
                    console.error('Error POST /horarios', err?.response || err);
                    const msg = err?.response?.data ? JSON.stringify(err.response.data) : (err.message || 'Error en POST');
                    errors.push(`POST: ${msg}`);
                }
            }

            // enviar updates
            for (const u of pendingUpdates) {
                const horarioId = u.idHorario;
                const payload = {
                    IdClase: parseInt(selectedClase),
                    IdMateria: parseInt(u.idMateria),
                    IdDocente: parseInt(u.idDocente),
                    DiaSemana: u.diaSemana,
                    HoraInicio: padHora(u.horaInicio),
                    HoraFin: padHora(u.horaFin),
                    Aula: u.aula,
                    AnioLectivo: new Date().getFullYear()
                };
                console.log('PUT /horarios/', horarioId, 'payload', payload);
                try {
                    // Petición PUT /horarios/{id} para actualizar la franja.
                    await API.put(`/horarios/${horarioId}`, payload);
                } catch (err) {
                    console.error('Error PUT /horarios', err?.response || err);
                    const msg = err?.response?.data ? JSON.stringify(err.response.data) : (err.message || 'Error en PUT');
                    errors.push(`PUT ${horarioId}: ${msg}`);
                }
            }

            if (errors.length > 0) {
                console.error('Errores al sincronizar:', errors);
                alert('Error al sincronizar cambios:\n' + errors.join('\n'));
            } else {
                setPendingAdds([]);
                setPendingUpdates([]);
                await cargarHorario();
                alert('Horario sincronizado correctamente');
            }
        } catch (error) {
            console.error('Error al sincronizar cambios inesperado', error);
            alert('Error al sincronizar cambios');
        }
    };

    // Carga el horario de la clase seleccionada desde la API.
    const cargarHorario = async () => {
        if (!selectedClase) return;
        setLoading(true);
        try {
            // Petición GET /horarios/clase/{id} para listar las franjas de la clase.
            const response = await API.get(`/horarios/clase/${selectedClase}`);
            setHorario(response.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // helper: calcula docentes y aulas ya ocupadas en un d�a/hora (local: horario de la clase + pendientes)
    // Calcula los docentes y aulas ocupados en un día/hora (local y pendientes).
    const getUnavailableForSlot = (dia, hora, excludeId = null) => {
        const combined = [...(horario || []), ...(pendingAdds || []), ...(pendingUpdates || [])];
        const unavailableDocentes = new Set();
        const unavailableAulas = new Set();
        combined.forEach(h => {
            const hid = String(h.idHorario || h.IdHorario);
            if (excludeId && String(excludeId) === hid) return;
            const diaStr = diaAString(h.diaSemana);
            const horaStr = formatoHoraSimple(h.horaInicio || h.HoraInicio || h.hora);
            if (!diaStr || !horaStr) return;
            if (diaStr === dia && horaStr === hora) {
                if (h.idDocente || h.IdDocente) unavailableDocentes.add(String(h.idDocente || h.IdDocente));
                if (h.aula || h.Aula) unavailableAulas.add(String(h.aula || h.Aula));
            }
        });
        return { unavailableDocentes, unavailableAulas };
    };

    // Cuando se abre la modal o cambia la celda, comprobar remotamente si los docentes ya tienen clases en esa franja
    // Verifica remotamente si cada docente tiene clase en la franja de la celda seleccionada.
    useEffect(() => {
        let mounted = true;
        const fetchRemote = async () => {
            setRemoteUnavailableDocentes(new Set());
            if (!showModal) return;
            const slotDia = selectedCelda?.dia || (editingHorario ? diaAString(editingHorario.diaSemana) : null);
            const slotHora = selectedCelda?.hora || formatoHoraSimple(editingHorario?.horaInicio || editingHorario?.HoraInicio || editingHorario?.hora || '');
            if (!slotDia || !slotHora) return;
            setRemoteChecking(true);
            try {
                const promises = (docentes || []).map(async (d) => {
                    const did = d.idDocente || d.IdDocente;
                    try {
                        // Petición GET /horarios/docente/{id} para el horario de cada docente.
                        const resp = await API.get(`/horarios/docente/${did}`);
                        const lista = resp.data || [];
                        const conflict = lista.find(h => {
                            const hid = String(h.idHorario || h.IdHorario);
                            const diaStr = diaAString(h.diaSemana);
                            const horaStr = formatoHoraSimple(h.horaInicio || h.HoraInicio || h.hora);
                            return diaStr === slotDia && horaStr === slotHora && !(editingHorario && hid === String(editingHorario.idHorario ?? editingHorario.IdHorario));
                        });
                        return { did: String(did), conflict: !!conflict };
                    } catch (err) {
                        return { did: String(did), conflict: false };
                    }
                });
                const results = await Promise.all(promises);
                if (!mounted) return;
                const setRemote = new Set();
                results.forEach(r => { if (r.conflict) setRemote.add(r.did); });
                setRemoteUnavailableDocentes(setRemote);
            } catch (err) {
                console.error('Error comprobando disponibilidad remota', err);
            } finally {
                if (mounted) setRemoteChecking(false);
            }
        };
        fetchRemote();
        return () => { mounted = false; };
    }, [showModal, selectedCelda, docentes, editingHorario]);

    // Verifica en el servidor si un docente ya tiene asignada una clase en ese d�a/hora
    // Consulta al servidor si el docente ya tiene clase en ese día y hora.
    const checkDocenteRemoteConflict = async (docenteId, dia, hora, excludeId = null) => {
        if (!docenteId) return false;
        try {
            // Petición GET /horarios/docente/{id} para revisar conflictos del docente.
            const resp = await API.get(`/horarios/docente/${docenteId}`);
            const lista = resp.data || [];
            const conflict = lista.find(h => {
                const hid = String(h.idHorario || h.IdHorario);
                if (excludeId && hid === String(excludeId)) return false;
                const diaStr = diaAString(h.diaSemana);
                const horaStr = formatoHoraSimple(h.horaInicio || h.HoraInicio || h.hora);
                return diaStr === dia && horaStr === hora;
            });
            return !!conflict;
        } catch (err) {
            console.error('Error al comprobar horario del docente', err?.response || err);
            // En caso de error remoto, mejor no bloquear la operaci�n (pero avisar)
            return false;
        }
    };

    // Agrega una franja al horario de forma optimista y la persiste en el servidor en segundo plano.
    const agregarHorario = (e) => {
        e.preventDefault();
        // Crear objeto local de clase para mostrar en la tabla y encolar para env��o
        const nueva = {
            idHorario: `temp-${Date.now()}`,
            idMateria: parseInt(formData.idMateria),
            idDocente: parseInt(formData.idDocente),
            aula: formData.aula,
            diaSemana: selectedCelda.dia,
            horaInicio: formatoHoraSimple(selectedCelda.hora),
            horaFin: formatoHoraSimple(selectedCelda.horaFin || calcularHoraFin(selectedCelda.hora))
        };

        // Validar conflictos cliente (docente/aula en mismo d��a/hora)
        const { unavailableDocentes, unavailableAulas } = getUnavailableForSlot(nueva.diaSemana, nueva.horaInicio);
        if (unavailableDocentes.has(String(nueva.idDocente))) {
            alert('Conflicto: el docente ya est\u00e1 asignado en ese d\u00eda y hora.');
            return;
        }
        if (unavailableAulas.has(String(nueva.aula))) {
            alert('Conflicto: el aula ya est\u00e1 ocupada en ese d\u00eda y hora.');
            return;
        }

        // Reservar inmediatamente localmente (optimista) para bloquear la opci�n en la UI
        setHorario(prev => [...prev, nueva]);
        setShowModal(false);
        setFormData({ idMateria: '', idDocente: '', aula: '' });

        // Verificar conflicto remoto (docente ya ocupado) y persistir en background
        (async () => {
            const conflictoRemoto = await checkDocenteRemoteConflict(nueva.idDocente, nueva.diaSemana, nueva.horaInicio);
            if (conflictoRemoto) {
                // revertir reserva local
                setHorario(prev => prev.filter(h => String(h.idHorario) !== String(nueva.idHorario)));
                alert('Conflicto: el docente ya tiene una clase asignada en ese d\u00eda y hora (conflicto remoto).');
                return;
            }

            const payload = {
                IdClase: parseInt(selectedClase),
                IdMateria: parseInt(nueva.idMateria),
                IdDocente: parseInt(nueva.idDocente),
                DiaSemana: nueva.diaSemana,
                HoraInicio: padHora(nueva.horaInicio),
                HoraFin: padHora(nueva.horaFin),
                Aula: nueva.aula,
                AnioLectivo: new Date().getFullYear()
            };
            try {
                // Petición POST /horarios para persistir la nueva franja.
                await API.post('/horarios', payload);
                // recargar para mantener consistencia con servidor
                await cargarHorario();
            } catch (err) {
                console.error('Error POST /horarios', err?.response || err);
                // quitar el item optimista
                setHorario(prev => prev.filter(h => String(h.idHorario) !== String(nueva.idHorario)));
                alert('Error al guardar la clase en el servidor');
            }
        })();
    };

    // Actualiza una franja existente de forma optimista y la persiste en el servidor.
    const actualizarHorario = (e) => {
        e.preventDefault();
        if (!editingHorario) return;
        // preparar payload actualizado
        const actualizado = {
            idHorario: editingHorario.idHorario ?? editingHorario.IdHorario,
            idMateria: parseInt(formData.idMateria),
            idDocente: parseInt(formData.idDocente),
            aula: formData.aula,
            diaSemana: selectedCelda.dia,
            horaInicio: formatoHoraSimple(selectedCelda.hora),
            horaFin: formatoHoraSimple(selectedCelda.horaFin || calcularHoraFin(selectedCelda.hora))
        };

        // Validar conflictos (excluyendo la propia fila)
        const excludeId = actualizado.idHorario;
        const { unavailableDocentes: ud, unavailableAulas: ua } = getUnavailableForSlot(actualizado.diaSemana, actualizado.horaInicio, excludeId);
        if (ud.has(String(actualizado.idDocente))) {
            alert('Conflicto: el docente ya est\u00e1 asignado en ese d\u00eda y hora.');
            return;
        }
        if (ua.has(String(actualizado.aula))) {
            alert('Conflicto: el aula ya est\u00e1 ocupada en ese d\u00eda y hora.');
            return;
        }

        // Verificar conflicto remoto al editar clase existente
        (async () => {
            const conflictoRemoto = await checkDocenteRemoteConflict(actualizado.idDocente, actualizado.diaSemana, actualizado.horaInicio, excludeId);
            if (conflictoRemoto) {
                alert('Conflicto: el docente ya tiene una clase asignada en ese d\u00eda y hora (conflicto remoto).');
                return;
            }

            // Actualizaci\u00f3n optimista local
            setHorario(prev => prev.map(h => (String(h.idHorario || h.IdHorario) === String(actualizado.idHorario) ? { ...h, ...actualizado } : h)));
            setShowModal(false);
            setFormData({ idMateria: '', idDocente: '', aula: '' });
            setEditingHorario(null);

            // Persistir en backend inmediatamente
            (async () => {
                const payload = {
                    IdClase: parseInt(selectedClase),
                    IdMateria: parseInt(actualizado.idMateria),
                    IdDocente: parseInt(actualizado.idDocente),
                    DiaSemana: actualizado.diaSemana,
                    HoraInicio: padHora(actualizado.horaInicio),
                    HoraFin: padHora(actualizado.horaFin),
                    Aula: actualizado.aula,
                    AnioLectivo: new Date().getFullYear()
                };
                try {
                    // si es temp -> crear, sino -> actualizar
                    // Si es temporal se crea; si no, se actualiza con PUT.
                    if (String(actualizado.idHorario).startsWith('temp-')) {
                        // Petición POST /horarios para crear la franja temporal.
                        await API.post('/horarios', payload);
                    } else {
                        // Petición PUT /horarios/{id} para actualizar la franja.
                        await API.put(`/horarios/${actualizado.idHorario}`, payload);
                    }
                    await cargarHorario();
                } catch (err) {
                    console.error('Error al persistir actualizaci\u00f3n', err?.response || err);
                    alert('Error al actualizar la clase en el servidor');
                    await cargarHorario();
                }
            })();
        })();
    };

    // Calcula la hora de fin sumando 1 hora a la hora de inicio.
    const calcularHoraFin = (horaInicio) => {
        const [h, m] = String(horaInicio).split(':');
        const nuevaHora = (parseInt(h, 10) + 1).toString().padStart(2, '0');
        return `${nuevaHora}:${(m || '00')}`;
    };

    // Normaliza la hora al formato HH:mm:ss.
    const padHora = (h) => {
        if (!h) return '';
        const parts = String(h).trim().slice(0,5).split(':');
        const hh = parts[0].padStart(2, '0');
        const mm = (parts[1] || '00').padStart(2, '0');
        return `${hh}:${mm}:00`;
    };

    // Elimina una franja del horario tras confirmar con el usuario.
    const eliminarHorario = async (id) => {
        if (window.confirm('Eliminar esta Clase?')) {
            try {
                // Petición DELETE /horarios/{id} para borrar la franja.
                await API.delete(`/horarios/${id}`);
                cargarHorario();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    // Devuelve el nombre de la materia según su id.
    const obtenerMateria = (id) => {
        const materia = materias.find(m => m.idMateria === id || m.IdMateria === id);
        return materia ? materia.nombreMateria || materia.NombreMateria : '-';
    };

    // Devuelve el nombre completo del docente según su id.
    const obtenerDocente = (id) => {
        const docente = docentes.find(d => d.idDocente === id || d.IdDocente === id);
        if (!docente) return '-';
        return `${docente.nombres || docente.Nombres || ''} ${docente.apellidos || docente.Apellidos || ''}`.trim();
    };

    // Devuelve el nombre y sección de la clase según su id.
    const obtenerClase = (id) => {
        const clase = clases.find(c => c.idClase === parseInt(id) || c.IdClase === parseInt(id));
        return clase ? `${clase.nombreClase || clase.NombreClase} - Seccion ${clase.seccion || clase.Seccion}` : '-';
    };

    // Convierte una hora HH:mm a minutos para comparaciones.
    const horaToMinutes = (hora) => {
        if (!hora) return null;
        const parts = hora.split(':');
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1] || '0', 10);
        return h * 60 + m;
    };

    // helpers para normalizar
    // Normaliza la hora al formato HH:mm (5 caracteres).
    const formatoHoraSimple = (hora) => {
        if (!hora) return '';
        return String(hora).trim().slice(0,5);
    };

    // Convierte el día a texto normalizado (número a nombre).
    const diaAString = (valor) => {
        if (valor === null || valor === undefined) return '';
        if (typeof valor === 'number') {
            return dias[valor - 1] || '';
        }
        const s = String(valor).trim();
        const sinAcentos = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        const capital = sinAcentos.charAt(0).toUpperCase() + sinAcentos.slice(1).toLowerCase();
        return capital;
    };

    // Devuelve el nombre de la materia resuelto por el backend o localmente.
    const obtenerTextoMateria = (claseObj) => {
        // backend puede devolver 'materia' o 'Materia' con nombre ya resuelto
        return claseObj?.materia || claseObj?.Materia || obtenerMateria(claseObj?.idMateria ?? claseObj?.IdMateria);
    };

    if (loading) {
        return (
            <DashboardLayout title="Generar Clase">
                <div className="loading">Cargando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Generar Clase">
            <div className="card">
                <div className="form-row">
                    <div className="form-group">
                        <label>Seleccionar Clase</label>
                        <select value={selectedClase} onChange={(e) => setSelectedClase(e.target.value)} className="form-control">
                            <option value="">Seleccionar clase</option>
                            {clases.map(c => (<option key={c.idClase} value={c.idClase}>{c.nombreClase} - Seccion {c.seccion}</option>))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>&nbsp;</label>
                        <button className="btn-secondary" style={{ marginLeft: '8px' }} onClick={commitChanges} disabled={pendingAdds.length === 0 && pendingUpdates.length === 0}>Actualizar Horario</button>
                    </div>
                </div>
            </div>

            {selectedClase && (
                <>
                    <div className="card">
                        <h3>Turno Matutino</h3>
                        <div className="table-responsive">
                            <table className="horario-table">
                                <thead>
                                    <tr><th>Hora</th>{dias.map(dia => <th key={dia}>{dia}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {turnoMatutino.map(slot => (
                                        <tr key={slot.start}>
                                            <td className="hora-columna">{slot.label}</td>
                                            {dias.map(dia => {
                                                if (slot.receso) {
                                                    return <td key={`${dia}-${slot.start}`} className="celda-receso">RECESO</td>;
                                                }
                                                const clase = horario.find(h => {
                                                    const diaStr = diaAString(h.diaSemana);
                                                    const horaStr = formatoHoraSimple(h.horaInicio || h.HoraInicio || h.hora);
                                                    return diaStr === dia && horaStr === slot.start;
                                                });
                                                return (
                                                    <td key={`${dia}-${slot.start}`} className={clase ? 'celda-ocupada' : 'celda-vacia'} onClick={() => {
                                                        if (!clase) {
                                                            setEditingHorario(null);
                                                            setSelectedCelda({ dia, hora: slot.start, horaFin: slot.label.split(' - ')[1] });
                                                            setShowModal(true);
                                                        }
                                                    }}>
                                                        {clase ? (
                                                            <div>
                                                                <strong>{obtenerMateria(clase.idMateria ?? clase.IdMateria)}</strong>
                                                                <div className="docente-row">{obtenerDocente(clase.idDocente ?? clase.IdDocente)}</div>
                                                                <div className="aula-row">Aula: {clase.aula || clase.Aula}</div>
                                                                <div className="cell-actions">
                                                                    <button className="btn-edit-small" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingHorario(clase);
                                                                        setFormData({ idMateria: clase.idMateria ?? clase.IdMateria, idDocente: clase.idDocente ?? clase.IdDocente, aula: clase.aula || clase.Aula || '' });
                                                                        setSelectedCelda({ dia, hora: slot.start, horaFin: slot.label.split(' - ')[1] });
                                                                        setShowModal(true);
                                                                    }}>Editar</button>
                                                                    <button className="btn-danger-small" onClick={(e) => { e.stopPropagation(); eliminarHorario(clase.idHorario ?? clase.IdHorario); }}>X</button>
                                                                </div>
                                                            </div>
                                                        ) : '+'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Turno Vespertino</h3>
                        <div className="table-responsive">
                            <table className="horario-table">
                                <thead>
                                    <tr><th>Hora</th>{dias.map(dia => <th key={dia}>{dia}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {turnoVespertino.map(slot => (
                                        <tr key={slot.start}>
                                            <td className="hora-columna">{slot.label}</td>
                                            {dias.map(dia => {
                                                if (slot.receso) {
                                                    return <td key={`${dia}-${slot.start}`} className="celda-receso">RECESO</td>;
                                                }
                                                const clase = horario.find(h => {
                                                    const diaStr = diaAString(h.diaSemana);
                                                    const horaStr = formatoHoraSimple(h.horaInicio || h.HoraInicio || h.hora);
                                                    return diaStr === dia && horaStr === slot.start;
                                                });
                                                return (
                                                    <td key={`${dia}-${slot.start}`} className={clase ? 'celda-ocupada' : 'celda-vacia'} onClick={() => {
                                                        if (!clase) {
                                                            setEditingHorario(null);
                                                            setSelectedCelda({ dia, hora: slot.start, horaFin: slot.label.split(' - ')[1] });
                                                            setShowModal(true);
                                                        }
                                                    }}>
                                                        {clase ? (
                                                            <div>
                                                                <strong>{obtenerMateria(clase.idMateria ?? clase.IdMateria)}</strong>
                                                                <div className="docente-row">{obtenerDocente(clase.idDocente ?? clase.IdDocente)}</div>
                                                                <div className="aula-row">Aula: {clase.aula || clase.Aula}</div>
                                                                <div className="cell-actions">
                                                                    <button className="btn-edit-small" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingHorario(clase);
                                                                        setFormData({ idMateria: clase.idMateria ?? clase.IdMateria, idDocente: clase.idDocente ?? clase.IdDocente, aula: clase.aula || clase.Aula || '' });
                                                                        setSelectedCelda({ dia, hora: slot.start, horaFin: slot.label.split(' - ')[1] });
                                                                        setShowModal(true);
                                                                    }}>Editar</button>
                                                                    <button className="btn-danger-small" onClick={(e) => { e.stopPropagation(); eliminarHorario(clase.idHorario ?? clase.IdHorario); }}>X</button>
                                                                </div>
                                                            </div>
                                                        ) : '+'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {showModal && (() => {
                const slotDia = selectedCelda?.dia || (editingHorario ? diaAString(editingHorario.diaSemana) : null);
                const slotHora = selectedCelda?.hora || formatoHoraSimple(editingHorario?.horaInicio || editingHorario?.HoraInicio || editingHorario?.hora || '');
                const excludeId = editingHorario ? (editingHorario.idHorario ?? editingHorario.IdHorario) : null;
                const { unavailableDocentes, unavailableAulas } = getUnavailableForSlot(slotDia, slotHora, excludeId);
                return (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <div className="modal-header"><h3>{editingHorario ? 'Editar Clase' : 'Agregar Clase'}</h3><button className="modal-close" onClick={() => { setShowModal(false); setEditingHorario(null); }}>�</button></div>
                            <form onSubmit={editingHorario ? actualizarHorario : agregarHorario}>
                                <div className="form-group">
                                    <label>Materia</label>
                                    <select value={formData.idMateria} onChange={(e) => setFormData({ ...formData, idMateria: e.target.value })} required className="form-control">
                                        <option value="">Seleccionar</option>
                                        {materias.map(m => (<option key={m.idMateria} value={m.idMateria}>{m.nombreMateria || m.NombreMateria}</option>))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Docente</label>
                                    <select value={formData.idDocente} onChange={async (e) => { await handleSelectDocente(e.target.value); }} required className="form-control">
                                        <option value="">Seleccionar</option>
                                        {docentes.map(d => {
                                            const did = d.idDocente || d.IdDocente;
                                            const disabledLocal = unavailableDocentes.has(String(did)) && String(did) !== String(editingHorario?.idDocente ?? editingHorario?.IdDocente);
                                            const disabledRemote = remoteUnavailableDocentes && remoteUnavailableDocentes.has(String(did)) && String(did) !== String(editingHorario?.idDocente ?? editingHorario?.IdDocente);
                                            const disabled = disabledLocal || disabledRemote;
                                            return (<option key={did} value={did} disabled={disabled}>{(d.nombres||d.Nombres) + ' ' + (d.apellidos||d.Apellidos)}{disabled ? ' (no disponible)' : ''}</option>);
                                        })}
                                    </select>
                                </div>
                                <div className="form-group"><label>Aula</label>
                                    <input value={formData.aula} onChange={(e) => setFormData({ ...formData, aula: e.target.value })} required className="form-control" />
                                    {formData.aula && unavailableAulas.has(String(formData.aula)) && String(formData.aula) !== String(editingHorario?.aula ?? editingHorario?.Aula) && (
                                        <div className="form-note" style={{ color: 'red', marginTop: '6px' }}>Esta aula ya est\u00e1 ocupada en el mismo d\u00eda y hora.</div>
                                    )}
                                </div>
                                <div className="form-actions"><button className="btn-primary" type="submit">{editingHorario ? 'Actualizar Clase' : 'Agregar Clase'}</button></div>
                            </form>
                        </div>
                    </div>
                );
            })()}
        </DashboardLayout>
    );
};

export default GenerarClase;
