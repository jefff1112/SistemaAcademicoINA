// Formulario de Actividad: captura datos de la actividad y valida la ponderación acumulada por periodo.
import React, { useEffect, useMemo, useState } from 'react';
import API from '../../services/api';
import '../../styles/actividades.css';

// Formulario para crear o editar una actividad de la materia.
export default function ActivityForm({
  initialData = null,
  actividadesDelPeriodo = [],
  periodoOptions = [],
  onSave,
  onCancel
}) {
  // Estados: campos del formulario, guardado en curso y error de validación.
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  const [periodoId, setPeriodoId] = useState(initialData?.periodoId || (periodoOptions[0]?.id || 1));
  const [ponderacion, setPonderacion] = useState(initialData?.ponderacion || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // porcentaje acumulado calculado en tiempo real
  // Calcula el porcentaje acumulado del periodo en tiempo real (incluye esta actividad).
  const acumulado = useMemo(() => {
    const sumaOtras = actividadesDelPeriodo
      .filter(a => a.id !== initialData?.id && a.periodoId === Number(periodoId))
      .reduce((s, a) => s + Number(a.ponderacion || 0), 0);
    return Math.min(1000, sumaOtras + Number(ponderacion || 0));
  }, [actividadesDelPeriodo, ponderacion, periodoId, initialData]);

  // Color del indicador de acumulado según el porcentaje.
  const acumuladoColor = acumulado > 100 ? 'red' : acumulado >= 90 ? 'orange' : 'green';

  // Limpia el error al cambiar cualquier campo del formulario.
  useEffect(() => {
    setError(null);
  }, [nombre, descripcion, ponderacion, periodoId]);

  // Valida los campos: nombre, ponderación y acumulado máximo del periodo.
  const validate = () => {
    if (!nombre.trim()) return 'El nombre es requerido';
    if (Number(ponderacion) <= 0) return 'La ponderación debe ser mayor que 0';
    if (Number(ponderacion) > 100) return 'La ponderación no puede exceder 100%';
    if (acumulado > 100) return 'El total de las actividades supera el 100%';
    return null;
  };

  // Guarda la actividad delegando en onSave o llamando a la API directamente.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setIsSaving(true);
    setError(null);
    const payload = {
      nombre,
      descripcion,
      periodoId: Number(periodoId),
      ponderacion: Number(ponderacion)
    };

    try {
      // Si se proporciona onSave, delegar la persistencia al padre
      if (onSave) {
        await onSave({ ...payload, id: initialData?.id });
      } else {
        // fallback: llamar API local si existe
        if (initialData?.id) {
          // Petición PUT /actividades/{id} para actualizar la actividad.
          await API.put(`/actividades/${initialData.id}`, payload);
        } else {
          // Petición POST /actividades para crear una nueva actividad.
          await API.post('/actividades', payload);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || 'Error al guardar actividad');
    }

    setIsSaving(false);
  };

  return (
    <form className="act-form" onSubmit={handleSubmit}>
      <div className="act-row">
        <label>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} />
      </div>

      <div className="act-row">
        <label>Descripción</label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} />
      </div>

      <div className="act-row">
        <label>Periodo</label>
        <select value={periodoId} onChange={e => setPeriodoId(e.target.value)}>
          {periodoOptions.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div className="act-row">
        <label>Ponderación (%)</label>
        <input type="number" min="0" max="100" value={ponderacion}
          onChange={e => setPonderacion(e.target.value)} />
      </div>

      <div className="act-progress">
        <div className="act-progress-bar" style={{ width: `${Math.min(acumulado, 100)}%`, backgroundColor: acumuladoColor }} />
        <div className="act-progress-label">Acumulado: {acumulado}%</div>
      </div>

      {error && <div className="act-error">{error}</div>}

      <div className="act-actions">
        <button type="button" className="btn secondary" onClick={onCancel} disabled={isSaving}>Cancelar</button>
        <button type="submit" className="btn primary" disabled={isSaving || acumulado > 100}>{isSaving ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  );
}
