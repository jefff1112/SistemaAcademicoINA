import React, { useState, useEffect } from 'react';
import { createAspirante, verificarAspirante } from '../services/aspirantesService';

const NuevoIngreso = () => {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        dui: '',
        carnetMenoridad: '',
        nie: '',
        fechaNacimiento: '',
        genero: '',
        telefono: '',
        correo: '',
        escuelaProcedencia: '',
        nivelAspira: 'Bachillerato General',
        especialidadAspira: ''
    });

    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [intentosHoy, setIntentosHoy] = useState(null);
    const MAX_INTENTOS_POR_DIA = 3;
    const EDAD_MINIMA = 14;
    const EDAD_MAXIMA = 19;

    const [documentos, setDocumentos] = useState([
        { tipo: 'Notas de 9° Grado', archivo: null, fijo: true }
    ]);

    const TIPOS_DOCUMENTO_EXTRA = [
        'Partida de Nacimiento',
        'Constancia de Conducta',
        'Certificado de Salud',
        'Otro'
    ];

    // ✅ FUNCIÓN CORREGIDA - Calcula la edad exacta con debug
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) {
            console.log('❌ fechaNacimiento está vacío');
            return null;
        }

        console.log('📅 Fecha recibida (raw):', fechaNacimiento);

        // Si la fecha viene en formato DD/MM/YYYY, convertir a YYYY-MM-DD
        let fechaParseada = fechaNacimiento;
        if (fechaNacimiento.includes('/')) {
            const partes = fechaNacimiento.split('/');
            if (partes.length === 3) {
                fechaParseada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                console.log('🔄 Fecha convertida de DD/MM/YYYY a YYYY-MM-DD:', fechaParseada);
            }
        }

        const hoy = new Date();
        console.log('📅 Fecha actual:', hoy.toISOString().split('T')[0]);

        const [year, month, day] = fechaParseada.split('-').map(Number);
        console.log('📅 Año:', year, 'Mes:', month, 'Día:', day);

        const nacimiento = new Date(year, month - 1, day);
        console.log('📅 Fecha de nacimiento (Date object):', nacimiento);

        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mesActual = hoy.getMonth();
        const diaActual = hoy.getDate();
        const mesNac = nacimiento.getMonth();
        const diaNac = nacimiento.getDate();

        console.log('📊 Comparación:', { mesActual, diaActual, mesNac, diaNac });

        if (mesActual < mesNac || (mesActual === mesNac && diaActual < diaNac)) {
            edad--;
            console.log('⬇️ Restando 1 año por no haber cumplido años aún');
        }

        console.log('✅ Edad calculada FINAL:', edad);
        return edad;
    };

    const formatDate = (d) => {
        const anio = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    };

    // ✅ FECHA MÍNIMA (más antigua): hoy - EDAD_MAXIMA años (hace 19 años)
    const fechaLimiteInferior = () => {
        const hoy = new Date();
        hoy.setFullYear(hoy.getFullYear() - EDAD_MAXIMA);
        const fecha = formatDate(hoy);
        console.log('📅 Fecha mínima permitida (19 años atrás):', fecha);
        return fecha;
    };

    // ✅ FECHA MÁXIMA (más reciente): hoy - EDAD_MINIMA años (hace 14 años)
    const fechaLimiteSuperior = () => {
        const hoy = new Date();
        hoy.setFullYear(hoy.getFullYear() - EDAD_MINIMA);
        const fecha = formatDate(hoy);
        console.log('📅 Fecha máxima permitida (14 años atrás):', fecha);
        return fecha;
    };

    // ✅ NUEVA FUNCIÓN: Validar fecha antes de enviar
    const validarFechaNacimiento = (fecha) => {
        console.log('🔍 Validando fecha:', fecha);

        if (!fecha) {
            return { valida: false, mensaje: 'La fecha de nacimiento es requerida' };
        }

        // Intentar parsear la fecha
        let fechaParseada = fecha;
        if (fecha.includes('/')) {
            const partes = fecha.split('/');
            if (partes.length === 3) {
                fechaParseada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            }
        }

        const edad = calcularEdad(fechaParseada);
        console.log('🔍 Edad calculada en validación:', edad);

        if (edad === null) {
            return { valida: false, mensaje: 'Fecha de nacimiento inválida' };
        }

        if (edad < EDAD_MINIMA) {
            return {
                valida: false,
                mensaje: `La edad mínima permitida es ${EDAD_MINIMA} años. Tienes ${edad} años.`
            };
        }

        if (edad > EDAD_MAXIMA) {
            return {
                valida: false,
                mensaje: `La edad máxima permitida es ${EDAD_MAXIMA} años. Tienes ${edad} años.`
            };
        }

        return { valida: true, mensaje: 'Edad válida', edad };
    };

    const esMayorDeEdad = (fechaNac) => {
        const edad = calcularEdad(fechaNac);
        return edad === null ? null : edad >= 18;
    };

    const getTodayKey = (nie) => {
        if (!nie) return null;
        const today = new Date().toISOString().split('T')[0];
        return `preinsc_attempts_${nie}_${today}`;
    };

    const getAttemptsForToday = (nie) => {
        try {
            const key = getTodayKey(nie);
            if (!key) return 0;
            const v = localStorage.getItem(key);
            return v ? parseInt(v, 10) : 0;
        } catch (err) {
            return 0;
        }
    };

    const incrementAttemptsForToday = (nie) => {
        try {
            const key = getTodayKey(nie);
            if (!key) return;
            const current = getAttemptsForToday(nie);
            localStorage.setItem(key, String(current + 1));
            setIntentosHoy(current + 1);
        } catch (err) {
            // ignore
        }
    };

    useEffect(() => {
        const nieVal = formData.nie && String(formData.nie).trim();
        if (!nieVal) {
            setIntentosHoy(null);
            return;
        }
        setIntentosHoy(getAttemptsForToday(nieVal));
    }, [formData.nie]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log('🔄 Cambio en campo:', name, 'Valor:', value);

        if (name === 'fechaNacimiento') {
            // Validar la fecha al cambiar
            const validacion = validarFechaNacimiento(value);
            console.log('🔍 Validación en tiempo real:', validacion);

            if (!validacion.valida) {
                setError(validacion.mensaje);
            } else {
                setError('');
            }

            setFormData({ ...formData, fechaNacimiento: value });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFoto(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    const handleDocChange = (idx, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const valido = file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png';
        if (!valido) {
            alert('Solo se permiten archivos PDF, JPG o PNG');
            e.target.value = '';
            return;
        }
        setDocumentos(prev => prev.map((d, i) => (i === idx ? { ...d, archivo: file } : d)));
    };

    const handleDocTipoChange = (idx, e) => {
        const tipo = e.target.value;
        setDocumentos(prev => prev.map((d, i) => (i === idx ? { ...d, tipo } : d)));
    };

    const agregarDocumento = () => {
        setDocumentos(prev => [...prev, { tipo: TIPOS_DOCUMENTO_EXTRA[0], archivo: null, fijo: false }]);
    };

    const quitarDocumento = (idx) => {
        setDocumentos(prev => prev.filter((_, i) => i !== idx));
    };

    const verificarCampo = async (campo, valor) => {
        if (!valor || !String(valor).trim()) return false;
        try {
            const result = await verificarAspirante(campo, valor);
            if (result?.existe) {
                setError(result.mensaje || `${campo} ya está registrado`);
                return true;
            }
            setError('');
            return false;
        } catch (err) {
            console.error('Error verificando campo:', err);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🚀 INICIANDO ENVÍO DEL FORMULARIO');
        setError('');
        setLoading(true);
        setSuccess(false);

        const nieVal = formData.nie && String(formData.nie).trim();
        if (!nieVal) {
            setError('El NIE es requerido');
            setLoading(false);
            return;
        }

        const attempts = getAttemptsForToday(nieVal);
        if (attempts >= MAX_INTENTOS_POR_DIA) {
            setError('Has alcanzado el número máximo de intentos de preinscripción para hoy (3). Intenta mañana.');
            setLoading(false);
            return;
        }

        // ✅ VALIDACIÓN DE FECHA ANTES DE ENVIAR
        console.log('🔍 Validando fecha antes de enviar:', formData.fechaNacimiento);
        const validacionFecha = validarFechaNacimiento(formData.fechaNacimiento);
        console.log('🔍 Resultado de validación:', validacionFecha);

        if (!validacionFecha.valida) {
            setError(validacionFecha.mensaje);
            setLoading(false);
            return;
        }

        // ✅ VERIFICAR DUPLICADOS
        const duplicadoNie = await verificarCampo('nie', nieVal);
        const duplicadoDui = formData.dui ? await verificarCampo('dui', formData.dui) : false;
        const duplicadoCorreo = formData.correo ? await verificarCampo('correo', formData.correo) : false;

        if (duplicadoNie || duplicadoDui || duplicadoCorreo) {
            setLoading(false);
            return;
        }

        try {
            // Validar campos requeridos
            if (!formData.nombres.trim()) {
                setError('Los nombres son requeridos');
                setLoading(false);
                return;
            }
            if (!formData.apellidos.trim()) {
                setError('Los apellidos son requeridos');
                setLoading(false);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!formData.correo.trim() || !emailRegex.test(formData.correo.trim())) {
                setError('Correo electrónico inválido');
                setLoading(false);
                return;
            }

            if (formData.nivelAspira === 'Bachillerato Tecnico' && !String(formData.especialidadAspira || '').trim()) {
                setError('Debe seleccionar una especialidad para Bachillerato Técnico');
                setLoading(false);
                return;
            }

            if (!foto) {
                setError('La fotografía tamaño carnet es requerida');
                setLoading(false);
                return;
            }

            const sinArchivo = documentos.find(d => !d.archivo);
            if (sinArchivo) {
                setError(`Debe adjuntar el archivo del documento: ${sinArchivo.tipo}`);
                setLoading(false);
                return;
            }

            console.log('✅ Todas las validaciones pasaron, preparando FormData...');

            const data = new FormData();
            data.append('nombres', formData.nombres);
            data.append('apellidos', formData.apellidos);
            data.append('dui', formData.dui || '');
            data.append('carnetMenoridad', formData.carnetMenoridad || '');
            data.append('nie', formData.nie);
            // ✅ Enviar la fecha en formato YYYY-MM-DD
            let fechaEnvio = formData.fechaNacimiento;
            if (fechaEnvio.includes('/')) {
                const partes = fechaEnvio.split('/');
                fechaEnvio = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            }
            console.log('📅 Fecha enviada al backend:', fechaEnvio);
            data.append('fechaNacimiento', fechaEnvio);
            data.append('genero', formData.genero || '');
            data.append('telefono', formData.telefono || '');
            data.append('correo', formData.correo);
            data.append('escuelaProcedencia', formData.escuelaProcedencia || '');
            data.append('nivelAspira', formData.nivelAspira);
            data.append('especialidadAspira', formData.especialidadAspira || '');

            data.append('foto', foto);

            documentos.forEach((d) => {
                data.append('documentos', d.archivo);
            });

            const docsInfo = documentos.map(d => ({
                tipo: d.tipo,
                nombre: d.archivo.name,
                size: d.archivo.size,
                type: d.archivo.type
            }));
            data.append('documentosInfo', JSON.stringify(docsInfo));

            console.log('📤 Enviando al backend...');
            await createAspirante(data);

            console.log('✅ Preinscripción exitosa!');
            incrementAttemptsForToday(nieVal);
            setSuccess(true);

            setFormData({
                nombres: '', apellidos: '', dui: '', carnetMenoridad: '', nie: '', fechaNacimiento: '',
                genero: '', telefono: '', correo: '', escuelaProcedencia: '',
                nivelAspira: 'Bachillerato General', especialidadAspira: ''
            });
            setFoto(null);
            setFotoPreview(null);
            setDocumentos([{ tipo: 'Notas de 9° Grado', archivo: null, fijo: true }]);
            window.scrollTo(0, 0);

        } catch (err) {
            console.error('❌ Error al enviar preinscripción:', err);
            incrementAttemptsForToday(nieVal);

            const mensaje = err?.response?.data?.mensaje || err?.message || 'Error al enviar la preinscripción';
            console.log('❌ Mensaje de error:', mensaje);
            console.log('❌ Error completo:', err);
            setError(mensaje);
        }
        setLoading(false);
    };

    return (
        <div className="page-container">
            <h1>Nuevo Ingreso</h1>
            <p className="subtitle">Preinscripción en Línea para aspirantes</p>

            <div className="info-box">
                <h3>Requisitos de Admisión</h3>
                <ul>
                    <li>Certificado de 9° grado (subir en PDF)</li>
                    <li>Partida de Nacimiento (reciente)</li>
                    <li>DUI o Carnet de Menoridad (opcional)</li>
                    <li>NIE (obligatorio)</li>
                    <li>Fotografía tamaño carnet (obligatorio)</li>
                    <li>Edad permitida: {EDAD_MINIMA} a {EDAD_MAXIMA} años</li>
                </ul>
            </div>

            <div className="form-container">
                {success && <div className="success-message">Preinscripción registrada exitosamente. En breve nos comunicaremos contigo.</div>}
                {error && <div className="error-message">{error}</div>}
                {formData.nie && String(formData.nie).trim() ? (
                    <div className="info-message">Intentos hoy: {intentosHoy ?? 0}/{MAX_INTENTOS_POR_DIA}</div>
                ) : (
                    <div className="info-message">Ingrese NIE para ver los intentos disponibles hoy</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field">
                            <label>Nombres *</label>
                            <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label>Apellidos *</label>
                            <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label>DUI (opcional)</label>
                            <input type="text" name="dui" value={formData.dui} onChange={handleChange} placeholder="12345678-9" />
                        </div>
                        <div className="form-field">
                            <label>Carnet de Menoridad (opcional)</label>
                            <input type="text" name="carnetMenoridad" value={formData.carnetMenoridad} onChange={handleChange} placeholder="Número de carnet" />
                        </div>
                        <div className="form-field">
                            <label>NIE *</label>
                            <input type="text" name="nie" value={formData.nie} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label>Fecha Nacimiento *</label>
                            <input
                                type="date"
                                name="fechaNacimiento"
                                value={formData.fechaNacimiento}
                                onChange={handleChange}
                                min={fechaLimiteInferior()}
                                max={fechaLimiteSuperior()}
                            />
                            <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                                Edad permitida: {EDAD_MINIMA} a {EDAD_MAXIMA} años
                            </small>
                            {formData.fechaNacimiento && (
                                <small style={{ color: '#2563eb', fontSize: '0.75rem', display: 'block' }}>
                                    Edad calculada: {calcularEdad(formData.fechaNacimiento)} años
                                </small>
                            )}
                        </div>
                        <div className="form-field">
                            <label>Género</label>
                            <select name="genero" value={formData.genero} onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Teléfono</label>
                            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label>Correo Electrónico *</label>
                            <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                        </div>
                        <div className="form-field full-width">
                            <label>Escuela de Procedencia</label>
                            <input type="text" name="escuelaProcedencia" value={formData.escuelaProcedencia} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label>Nivel que Aspira *</label>
                            <select name="nivelAspira" value={formData.nivelAspira} onChange={handleChange}>
                                <option value="Bachillerato General">Bachillerato General</option>
                                <option value="Bachillerato Tecnico">Bachillerato Técnico</option>
                            </select>
                        </div>

                        {formData.nivelAspira === 'Bachillerato Tecnico' && (
                            <div className="form-field">
                                <label>Especialidad *</label>
                                <select name="especialidadAspira" value={formData.especialidadAspira} onChange={handleChange} required>
                                    <option value="">Seleccionar Especialidad</option>
                                    <option value="1">Administrativo Contable</option>
                                    <option value="2">Desarrollo de Software</option>
                                    <option value="3">Salud y Bienestar</option>
                                    <option value="4">Electrónica</option>
                                </select>
                            </div>
                        )}

                        <div className="form-field">
                            <label>Foto (tamaño carnet) *</label>
                            <input type="file" accept="image/*" onChange={handleFotoChange} />
                            {fotoPreview && <img src={fotoPreview} alt="Vista previa" style={{ width: '100px', marginTop: '0.5rem' }} />}
                        </div>

                        <div className="form-field full-width">
                            <label>Documentos de Admisión *</label>
                            {documentos.map((doc, idx) => (
                                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.6rem', marginBottom: '0.5rem', background: '#fafafa' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', gap: '0.5rem' }}>
                                        {doc.fijo ? (
                                            <strong style={{ fontSize: '0.85rem' }}>{doc.tipo}</strong>
                                        ) : (
                                            <select value={doc.tipo} onChange={(e) => handleDocTipoChange(idx, e)} style={{ fontSize: '0.85rem', padding: '0.25rem' }}>
                                                {TIPOS_DOCUMENTO_EXTRA.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        )}
                                        {!doc.fijo && (
                                            <button type="button" onClick={() => quitarDocumento(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                Quitar
                                            </button>
                                        )}
                                    </div>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocChange(idx, e)} />
                                    {doc.archivo && (
                                        <p style={{ fontSize: '0.8rem', color: '#16a34a', margin: '0.25rem 0 0' }}>
                                            Archivo: {doc.archivo.name}
                                        </p>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={agregarDocumento} className="submit-btn" style={{ background: '#374151', padding: '0.45rem 0.9rem', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                + Agregar documento
                            </button>
                            <small style={{ color: '#6b7280', fontSize: '0.75rem', display: 'block', marginTop: '0.35rem' }}>
                                Se requiere al menos: Notas de 9° Grado. Formatos: PDF, JPG o PNG.
                            </small>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? 'Enviando...' : 'Enviar Preinscripción'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NuevoIngreso;