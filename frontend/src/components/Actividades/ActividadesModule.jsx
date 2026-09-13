// Módulo de Actividades (Docentes): gestiona las actividades evaluables de una materia por periodo.
import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import ActivityForm from './ActivityForm';
import ActivitiesTable from './ActivitiesTable';

// Opciones de periodo académico para las actividades.
const periodoOptions = [
  { id: 1, nombre: 'I Periodo' },
  { id: 2, nombre: 'II Periodo' },
  { id: 3, nombre: 'III Periodo' },
  { id: 4, nombre: 'IV Periodo' }
];

// Componente principal: lista, crea, edita y elimina actividades de la materia indicada.
export default function ActividadesModule({ materiaId }) {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Carga las actividades cada vez que cambia la materia seleccionada.
  useEffect(() => {
    fetchActividades();
  }, [materiaId]);

  // Obtiene las actividades de la materia desde la API.
  async function fetchActividades() {
    setLoading(true);
    try {
      // Petición GET /actividades?materiaId={id} para listar las actividades.
      const res = await API.get(`/actividades?materiaId=${materiaId}`);
      setActividades(res.data || []);
    } catch (e) {
      console.error(e);
      setActividades([]);
    }
    setLoading(false);
  }

  // Guarda la actividad (crea o actualiza) y recarga la lista.
  const handleSave = async (data) => {
    try {
      if (data.id) {
        // Petición PUT /actividades/{id} para actualizar la actividad.
        await API.put(`/actividades/${data.id}`, data);
      } else {
        // Petición POST /actividades para crear una nueva actividad.
        await API.post('/actividades', { ...data, materiaId });
      }
      setShowForm(false);
      setEditing(null);
      fetchActividades();
    } catch (e) {
      console.error(e);
      alert('Error guardando actividad');
    }
  };

  // Elimina una actividad y recarga la lista.
  const handleDelete = async (a) => {
    try {
      // Petición DELETE /actividades/{id} para borrar la actividad.
      await API.delete(`/actividades/${a.id}`);
      fetchActividades();
    } catch (e) {
      console.error(e);
      alert('Error eliminando actividad');
    }
  };

  return (
    <div className="actividades-module">
      <div className="module-header">
        <h3>Actividades</h3>
        <div>
          <button className="btn" onClick={() => { setEditing(null); setShowForm(true); }}>Crear Actividad</button>
        </div>
      </div>

      {showForm && (
        <ActivityForm
          initialData={editing}
          actividadesDelPeriodo={actividades}
          periodoOptions={periodoOptions}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {loading ? <div>Cargando...</div> : (
        <ActivitiesTable actividades={actividades} onEdit={(a) => { setEditing(a); setShowForm(true); }} onDelete={handleDelete} />
      )}
    </div>
  );
}
