// Hook useBatchEdits: acumula cambios (altas, ediciones, bajas) y los envía en lote a la API.
import { useState } from 'react';

// Hook genérico para acumular cambios (adds, updates, deletes) y enviarlos en lote
export default function useBatchEdits() {
  const [pendingAdds, setPendingAdds] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [pendingDeletes, setPendingDeletes] = useState([]);

  const addPending = (item) => setPendingAdds(prev => [...prev, item]);

  const updatePending = (item) => {
    // si es temp (no viene del servidor) lo actualiza en adds
    if (String(item.idHorario || item.IdHorario || '').startsWith('temp-')) {
      setPendingAdds(prev => prev.map(p => (String(p.idHorario) === String(item.idHorario) ? { ...p, ...item } : p)));
      return;
    }
    setPendingUpdates(prev => {
      const exists = prev.find(p => String(p.idHorario || p.IdHorario) === String(item.idHorario || item.IdHorario));
      if (exists) return prev.map(p => (String(p.idHorario || p.IdHorario) === String(item.idHorario || item.IdHorario) ? item : p));
      return [...prev, item];
    });
  };

  const deletePending = (id) => {
    // eliminar de adds si es temp
    if (String(id).startsWith('temp-')) {
      setPendingAdds(prev => prev.filter(p => String(p.idHorario) !== String(id)));
      return;
    }
    // si no, añadir a deletes y eliminar de updates si existiera
    setPendingDeletes(prev => [...prev, id]);
    setPendingUpdates(prev => prev.filter(p => String(p.idHorario || p.IdHorario) !== String(id)));
  };

  const clearAll = () => {
    setPendingAdds([]);
    setPendingUpdates([]);
    setPendingDeletes([]);
  };

  // --- Optimistic helpers: actualiza UI inmediatamente y ejecuta la petición en background
  const optimisticAdd = async (item, setLocalState, commitAddFn) => {
    // añadir localmente
    setLocalState(prev => [...prev, item]);
    try {
      if (typeof commitAddFn === 'function') await commitAddFn(item);
      return { success: true };
    } catch (err) {
      // revertir local
      setLocalState(prev => prev.filter(p => String(p.idHorario || p.IdHorario) !== String(item.idHorario || item.IdHorario)));
      return { success: false, error: err };
    }
  };

  const optimisticUpdate = async (item, setLocalState, commitUpdateFn) => {
    // actualizar localmente
    setLocalState(prev => prev.map(p => (String(p.idHorario || p.IdHorario) === String(item.idHorario || item.IdHorario) ? { ...p, ...item } : p)));
    try {
      if (typeof commitUpdateFn === 'function') await commitUpdateFn(item);
      return { success: true };
    } catch (err) {
      // Nota: no revertimos automáticamente porque no tenemos la versión anterior; el llamador puede recargar si lo desea
      return { success: false, error: err };
    }
  };

  const optimisticDelete = async (id, setLocalState, commitDeleteFn) => {
    // eliminar localmente
    const prevSnapshot = null; // caller may manage snapshot if needed
    setLocalState(prev => prev.filter(p => String(p.idHorario || p.IdHorario) !== String(id)));
    try {
      if (typeof commitDeleteFn === 'function') await commitDeleteFn(id);
      return { success: true };
    } catch (err) {
      // revertir no implementado por defecto
      return { success: false, error: err };
    }
  };

  const commitAll = async ({ commitAddFn, commitUpdateFn, commitDeleteFn } = {}) => {
    const errors = [];
    // commit adds
    for (const a of pendingAdds) {
      try {
        if (typeof commitAddFn === 'function') await commitAddFn(a);
      } catch (err) {
        errors.push({ type: 'add', item: a, error: err });
      }
    }
    // commit updates
    for (const u of pendingUpdates) {
      try {
        if (typeof commitUpdateFn === 'function') await commitUpdateFn(u);
      } catch (err) {
        errors.push({ type: 'update', item: u, error: err });
      }
    }
    // commit deletes
    for (const d of pendingDeletes) {
      try {
        if (typeof commitDeleteFn === 'function') await commitDeleteFn(d);
      } catch (err) {
        errors.push({ type: 'delete', id: d, error: err });
      }
    }

    const success = errors.length === 0;
    if (success) clearAll();
    return { success, errors };
  };

  return {
    pendingAdds,
    pendingUpdates,
    pendingDeletes,
    addPending,
    updatePending,
    deletePending,
    commitAll,
    clearAll
  };
}
