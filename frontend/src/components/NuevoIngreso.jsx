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
        emailEncargado: '',
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

    // ============================================================
    // RATE LIMIT POR MINUTO (para demos)
    // Máximo 5 envíos por minuto por NIE.
    // El backend también aplica este límite por IP+NIE.
    // ============================================================
    const MAX_INTENTOS_POR_MINUTO = 5;
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

    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return null;

        let fechaParseada = fechaNacimiento;
        if (fechaNacimiento.includes('/')) {
            const partes = fechaNacimiento.split('/');
            if (partes.length === 3) {
                fechaParseada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            }
        }

        const hoy = new Date();
        const [year, month, day] = fechaParseada.split('-').map(Number);
        const nacimiento = new Date(year, month - 1, day);

        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mesActual = hoy.getMonth();
        const diaActual = hoy.getDate();
        const mesNac = nacimiento.getMonth();
        const diaNac = nacimiento.getDate();

        if (mesActual < mesNac || (mesActual === mesNac && diaActual < diaNac)) {
            edad--;
        }

        return edad;
    };

    const formatDate = (d) => {
        const anio = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    };

    const fechaLimiteInferior = () => {
        const hoy = new Date();
        hoy.setFullYear(hoy.getFullYear() - EDAD_MAXIMA);
        return formatDate(hoy);
    };

    const fechaLimiteSuperior = () => {
        const hoy = new Date();
        hoy.setFullYear(hoy.getFullYear() - EDAD_MINIMA);
        return formatDate(hoy);
    };

    const validarFechaNacimiento = (fecha) => {
        if (!fecha) {
            return { valida: false, mensaje: 'La fecha de nacimiento es requerida' };
        }

        let fechaParseada = fecha;
        if (fecha.includes('/')) {
            const partes = fecha.split('/');
            if (partes.length === 3) {
                fechaParseada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            }
        }

        const edad = calcularEdad(fechaParseada);

        if (edad === null || isNaN(edad)) {
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

    // ============================================================
    // RATE LIMIT POR MINUTO
    // ============================================================
    const getAttemptsKey = (nie) => {
        if (!nie) return null;
        return `preinsc_attempts_${nie}`;
    };

    const getAttemptsLastMinute = (nie) => {
        try {
            const key = getAttemptsKey(nie);
            if (!key) return [];
            const raw = localStorage.getItem(key);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            if (!Array.isArray(arr)) return [];
            const hace1min = Date.now() - 60 * 1000;
            return arr.filter(t => typeof t === 'number' && t > hace1min);
        } catch (err) {
            return [];
        }
    };

    const incrementAttempts = (nie) => {
        try {
            const key = getAttemptsKey(nie);
            if (!key) return;
            const arr = getAttemptsLastMinute(nie);
            arr.push(Date.now());
            localStorage.setItem(key, JSON.stringify(arr));
            setIntentosHoy(arr.length);
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
        setIntentosHoy(getAttemptsLastMinute(nieVal).length);
    }, [formData.nie]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'fechaNacimiento') {
            const validacion = validarFechaNacimiento(value);
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

        // Rate limit por minuto (solo en frontend para feedback rápido)
        const attemptsLastMinute = getAttemptsLastMinute(nieVal);
        if (attemptsLastMinute.length >= MAX_INTENTOS_POR_MINUTO) {
            setError(`Has alcanzado el límite de ${MAX_INTENTOS_POR_MINUTO} envíos por minuto. Espera unos segundos e intenta de nuevo.`);
            setLoading(false);
            return;
        }

        // Validación de fecha
        const validacionFecha = validarFechaNacimiento(formData.fechaNacimiento);
        if (!validacionFecha.valida) {
            setError(validacionFecha.mensaje);
            setLoading(false);
            return;
        }

        // Validaciones básicas
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

        if (!formData.emailEncargado.trim() || !emailRegex.test(formData.emailEncargado.trim())) {
            setError('Correo del encargado inválido');
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

        // Verificar duplicados (NIE, DUI, Carnet, Correo, Correo encargado)
        let duplicadoNie = false, duplicadoDui = false, duplicadoCorreo = false,
            duplicadoEmailEncargado = false, duplicadoCarnet = false;
        try {
            duplicadoNie = await verificarCampo('nie', nieVal);
            duplicadoDui = formData.dui ? await verificarCampo('dui', formData.dui) : false;
            duplicadoCorreo = formData.correo ? await verificarCampo('correo', formData.correo) : false;
            duplicadoEmailEncargado = formData.emailEncargado ? await verificarCampo('emailEncargado', formData.emailEncargado) : false;
            duplicadoCarnet = formData.carnetMenoridad ? await verificarCampo('carnetMenoridad', formData.carnetMenoridad) : false;
        } catch (err) {
            console.warn('⚠️ Error verificando duplicados, continuando:', err);
        }

        if (duplicadoNie || duplicadoDui || duplicadoCorreo || duplicadoEmailEncargado || duplicadoCarnet) {
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('nombres', formData.nombres.trim());
            data.append('apellidos', formData.apellidos.trim());
            if (formData.dui && formData.dui.trim()) data.append('dui', formData.dui.trim());
            if (formData.carnetMenoridad && formData.carnetMenoridad.trim()) data.append('carnetMenoridad', formData.carnetMenoridad.trim());
            data.append('nie', nieVal);

            let fechaEnvio = formData.fechaNacimiento;
            if (fechaEnvio.includes('/')) {
                const partes = fechaEnvio.split('/');
                fechaEnvio = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            }
            data.append('fechaNacimiento', fechaEnvio);

            if (formData.genero) data.append('genero', formData.genero);
            if (formData.telefono && formData.telefono.trim()) data.append('telefono', formData.telefono.trim());
            data.append('correo', formData.correo.trim());
            data.append('emailEncargado', formData.emailEncargado.trim());
            if (formData.escuelaProcedencia && formData.escuelaProcedencia.trim()) {
                data.append('escuelaProcedencia', formData.escuelaProcedencia.trim());
            }
            data.append('nivelAspira', formData.nivelAspira);

            if (formData.especialidadAspira && String(formData.especialidadAspira).trim()) {
                data.append('especialidadAspira', String(formData.especialidadAspira).trim());
            }

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
            const response = await createAspirante(data);
            console.log('✅ Preinscripción exitosa!', response);

            incrementAttempts(nieVal);
            setSuccess(true);

            setFormData({
                nombres: '', apellidos: '', dui: '', carnetMenoridad: '', nie: '', fechaNacimiento: '',
                genero: '', telefono: '', correo: '', emailEncargado: '', escuelaProcedencia: '',
                nivelAspira: 'Bachillerato General', especialidadAspira: ''
            });
            setFoto(null);
            setFotoPreview(null);
            setDocumentos([{ tipo: 'Notas de 9° Grado', archivo: null, fijo: true }]);
            window.scrollTo(0, 0);

        } catch (err) {
            console.error('❌ Error al enviar preinscripción:', err);
            console.error('❌ Response:', err?.response);
            console.error('❌ Status:', err?.response?.status);
            console.error('❌ Data:', err?.response?.data);

            incrementAttempts(nieVal);

            let mensaje = 'Error al enviar la preinscripción';
            if (err?.response?.data?.mensaje) {
                mensaje = err.response.data.mensaje;
            } else if (err?.response?.status === 409) {
                mensaje = 'Ya existe una preinscripción con estos datos. Verifica el correo, DUI, NIE, carnet o correo del encargado.';
            } else if (err?.response?.status === 400) {
                mensaje = err.response.data?.mensaje || 'Datos inválidos. Verifica el formulario.';
            } else if (err?.response?.status === 401) {
                mensaje = 'Error de autenticación. Contacta al administrador.';
            } else if (err?.response?.status === 429) {
                mensaje = err.response.data?.mensaje || 'Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.';
            } else if (err?.response?.status === 500) {
                mensaje = 'Error en el servidor. Intenta de nuevo más tarde.';
            } else if (err?.message) {
                mensaje = err.message;
            }

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
                    <div className="info-message">
                        Envíos en el último minuto: {intentosHoy ?? 0}/{MAX_INTENTOS_POR_MINUTO}
                    </div>
                ) : (
                    <div className="info-message">Ingrese NIE para ver el estado del rate limit</div>
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
                        <div className="form-field">
                            <label>Correo del Encargado *</label>
                            <input type="email" name="emailEncargado" value={formData.emailEncargado} onChange={handleChange} placeholder="correo@encargado.com" />
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
                                <select
                                    name="especialidadAspira"
                                    value={formData.especialidadAspira}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccionar Especialidad</option>
                                    <option value="1">Tecnico Vocacional en Desarrollo de Software</option>
                                    <option value="2">Tecnico Vocacional en Administrativo Contable</option>
                                    <option value="3">Tecnico Productivo en Salud y Bienestar</option>
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