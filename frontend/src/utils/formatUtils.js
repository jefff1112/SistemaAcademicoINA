// Utilidades para normalizar/formatar horas y dias
// Funciones de formato de horas y días de la semana usadas en horarios.

export const formatoHoraSimple = (hora) => {
  if (!hora) return '';
  return String(hora).trim().slice(0, 5);
};

// Formatea la hora exacta (HH:mm:ss) usada en registros de asistencia.
// Tolera el formato "HH:mm:ss", "HH:mm" o un DateTime ISO completo enviado por la API.
export const formatoHoraExacta = (hora) => {
  if (!hora) return '-';
  const s = String(hora).trim();
  if (!s) return '-';
  const sinFecha = s.includes('T') ? s.split('T')[1] : s;
  const principal = sinFecha.split('.')[0].split(':');
  if (principal.length < 2) return s;
  const hh = principal[0].padStart(2, '0');
  const mm = principal[1].padStart(2, '0');
  const ss = principal.length >= 3 ? principal[2].padStart(2, '0') : '00';
  return `${hh}:${mm}:${ss}`;
};

export const padHora = (h) => {
  if (!h) return '';
  const parts = String(h).trim().slice(0, 5).split(':');
  const hh = (parts[0] || '0').toString().padStart(2, '0');
  const mm = (parts[1] || '00').toString().padStart(2, '0');
  return `${hh}:${mm}:00`;
};

// Calcula la hora de fin sumando los minutos de duración a la hora de inicio.
export const calcularHoraFin = (horaInicio, minutosDuracion = 60) => {
  if (!horaInicio) return '';
  const parts = String(horaInicio).slice(0, 5).split(':');
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const total = h * 60 + m + minutosDuracion;
  const hh = Math.floor(total / 60).toString().padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

// Convierte un día (número o texto) al nombre del día de la semana en español.
export const diaAString = (valor) => {
  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'number') {
    return dias[valor - 1] || '';
  }
  const s = String(valor).trim();
  try {
    const sinAcentos = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const capital = sinAcentos.charAt(0).toUpperCase() + sinAcentos.slice(1).toLowerCase();
    return capital;
  } catch (e) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
};
