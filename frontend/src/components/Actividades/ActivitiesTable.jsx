// Tabla de Actividades: muestra la lista de actividades de la materia con acciones de edición.
import React from 'react';
import '../../styles/actividades.css';

// Tabla con las actividades y sus botones de editar/eliminar.
export default function ActivitiesTable({ actividades = [], onEdit, onDelete }) {
  return (
    <div className="activities-table">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Ponderación</th>
            <th>Periodo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {actividades.length === 0 && (
            <tr><td colSpan="4" className="empty">No hay actividades</td></tr>
          )}
          {actividades.map(a => (
            <tr key={a.id}>
              <td>{a.nombre}</td>
              <td>{a.ponderacion}%</td>
              <td>{a.periodoNombre || a.periodoId}</td>
              <td>
                <button className="btn small" onClick={() => onEdit(a)}>Editar</button>
                <button className="btn small danger" onClick={() => { if (confirm('¿Eliminar actividad?')) onDelete(a); }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
