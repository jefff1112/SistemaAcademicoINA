// Validaciones reutilizables
// Utilidades de validación de formularios (fotos, fechas, correos institucionales, NIE/DUI).

export const validatePhotoSize = (file, maxBytes = 1024 * 1024 * 2) => {
  // maxBytes por defecto 2MB
  if (!file) return false;
  return file.size <= maxBytes;
};

// Valida que la fecha ingresada no sea posterior a hoy.
export const validateDateNotFuture = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d <= now;
};

// Verifica que el correo termine con el dominio institucional.
export const validateInstitutionalEmail = (email, domain = '@institucion.edu') => {
  if (!email) return false;
  try {
    const mail = String(email).trim().toLowerCase();
    // opción: permitir cualquier dominio que incluya el dominio institucional
    return mail.endsWith(domain);
  } catch (e) { return false; }
};

// Valida que todos los campos requeridos del objeto estén completos.
export const requiredFieldsPresent = (obj, fields = []) => {
  if (!obj) return false;
  return fields.every(f => obj[f] !== undefined && obj[f] !== null && String(obj[f]).trim() !== '');
};

// Valida básicamente la longitud de un NIE o DUI.
export const validateNIEorDUI = (value) => {
  if (!value) return false;
  // validación básica: longitud entre 6 y 20
  const s = String(value).trim();
  return s.length >= 6 && s.length <= 20;
};

export default {
  validatePhotoSize,
  validateDateNotFuture,
  validateInstitutionalEmail,
  requiredFieldsPresent,
  validateNIEorDUI
};