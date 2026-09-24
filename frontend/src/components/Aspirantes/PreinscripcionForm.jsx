// Componente PreinscripcionForm: formulario público de preinscripción en línea para aspirantes al INA.
import React, { useState, useEffect } from 'react';
import { createAspirante, verificarAspirante } from '../../services/aspirantesService';

const PreinscripcionForm = () => {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        dui: '',
        nie: '',
        fechaNacimiento: '',
        genero: '',
        telefono: '',
        correo: '',
        emailEncargado: '',
        escuelaProcedencia: '',
        promedioAnterior: '',
        nivelAspira: 'Bachillerato General',
        especialidadAspira: ''
    });

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [erroresCampo, setErroresCampo] = useState({ dui: '', nie: '', correo: '', emailEncargado: '' });
    const [intentosHoy, setIntentosHoy] = useState(null);
    const MAX_INTENTOS_POR_DIA = 3;
    const EDAD_MINIMA = 14;
    const EDAD_MAXIMA = 19;

    // ✅ FUNCIÓN CORREGIDA - Calcula la edad exacta
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return null;

        const hoy = new Date();
        const [year, month, day] = fechaNacimiento.split('-').map(Number);
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const verificarCampo = async (campo, valor) => {
        if (!valor || !String(valor).trim()) {
            setErroresCampo(prev => ({ ...prev, [campo]: '' }));
            return null;
        }
        try {
            const result = await verificarAspirante(campo, valor);
            if (result?.existe) {
                setErroresCampo(prev => ({ ...prev, [campo]: result.mensaje || `${campo} ya registrado` }));
                return { campo, mensaje: result.mensaje };
            }
            setErroresCampo(prev => ({ ...prev, [campo]: '' }));
            return null;
        } catch (err) {
            setErroresCampo(prev => ({ ...prev, [campo]: '' }));
            return null;
        }
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
        return formatDate(hoy);
    };

    // ✅ FECHA MÁXIMA (más reciente): hoy - EDAD_MINIMA años (hace 14 años)
    const fechaLimiteSuperior = () => {
        const hoy = new Date();
        hoy.setFullYear(hoy.getFullYear() - EDAD_MINIMA);
        return formatDate(hoy);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setSuccess(false);

        const nieVal = formData.nie && String(formData.nie).trim();
        if (!nieVal) {
            setError('NIE es requerido para preinscripción');
            setLoading(false);
            return;
        }

        const attempts = getAttemptsForToday(nieVal);
        if (attempts >= MAX_INTENTOS_POR_DIA) {
            setError('Has alcanzado el número máximo de intentos de preinscripción para hoy (3). Intenta mañana.');
            setLoading(false);
            return;
        }

        // ✅ VALIDACIÓN DE EDAD CORREGIDA
        if (!formData.fechaNacimiento) {
            setError('La fecha de nacimiento es requerida');
            setLoading(false);
            return;
        }

        const edad = calcularEdad(formData.fechaNacimiento);
        console.log('📅 Edad calculada:', edad, 'para fecha:', formData.fechaNacimiento);

        if (edad === null) {
            setError('Fecha de nacimiento inválida');
            setLoading(false);
            return;
        }

        if (edad < EDAD_MINIMA) {
            setError(`La edad mínima permitida es ${EDAD_MINIMA} años. Tienes ${edad} años.`);
            setLoading(false);
            return;
        }

        if (edad > EDAD_MAXIMA) {
            setError(`La edad máxima permitida es ${EDAD_MAXIMA} años. Tienes ${edad} años.`);
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.correo.trim() || !emailRegex.test(formData.correo.trim())) {
            setError('Correo electrónico inválido');
            setLoading(false);
            return;
        }

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

        const [dupDui, dupNie, dupCorreo, dupEmailEncargado] = await Promise.all([
            formData.dui ? verificarCampo('dui', formData.dui) : Promise.resolve(null),
            verificarCampo('nie', nieVal),
            formData.correo ? verificarCampo('correo', formData.correo) : Promise.resolve(null),
            formData.emailEncargado ? verificarCampo('emailEncargado', formData.emailEncargado) : Promise.resolve(null)
        ]);

        const duplicado = dupDui || dupNie || dupCorreo || dupEmailEncargado;
        if (duplicado) {
            setError(duplicado.mensaje);
            setLoading(false);
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                dui: formData.dui || '',
                telefono: formData.telefono || '',
                escuelaProcedencia: formData.escuelaProcedencia || '',
                promedioAnterior: formData.promedioAnterior || '',
                especialidadAspira: formData.especialidadAspira || ''
            };

            await createAspirante(dataToSend);
            incrementAttemptsForToday(nieVal);
            setSuccess(true);
            setFormData({
                nombres: '', apellidos: '', dui: '', nie: '', fechaNacimiento: '',
                genero: '', telefono: '', correo: '', emailEncargado: '', escuelaProcedencia: '',
                promedioAnterior: '', nivelAspira: 'Bachillerato General', especialidadAspira: ''
            });
            setErroresCampo({ dui: '', nie: '', correo: '', emailEncargado: '' });
            window.scrollTo(0, 0);
        } catch (err) {
            incrementAttemptsForToday(nieVal);
            const mensaje = err?.response?.data?.mensaje || err?.message || 'Error al enviar la preinscripción';
            setError(mensaje);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Preinscripción en Línea - INA</h1>

            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">✅ Preinscripción registrada exitosamente</div>}
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {formData.nie && String(formData.nie).trim() ? (
                <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                    Intentos hoy: {intentosHoy ?? 0}/{MAX_INTENTOS_POR_DIA}
                </div>
            ) : (
                <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                    Ingrese NIE para ver los intentos disponibles hoy
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nombres *</label>
                        <input
                            type="text"
                            name="nombres"
                            value={formData.nombres}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Apellidos *</label>
                        <input
                            type="text"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">DUI (opcional)</label>
                        <input
                            type="text"
                            name="dui"
                            value={formData.dui}
                            onChange={handleChange}
                            onBlur={(e) => verificarCampo('dui', e.target.value)}
                            placeholder="12345678-9"
                            className={`w-full px-3 py-2 border rounded-lg ${erroresCampo.dui ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {erroresCampo.dui && <p className="text-red-600 text-xs mt-1">{erroresCampo.dui}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">NIE *</label>
                        <input
                            type="text"
                            name="nie"
                            value={formData.nie}
                            onChange={handleChange}
                            onBlur={(e) => verificarCampo('nie', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg ${erroresCampo.nie ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {erroresCampo.nie && <p className="text-red-600 text-xs mt-1">{erroresCampo.nie}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Fecha Nacimiento *</label>
                        <input
                            type="date"
                            name="fechaNacimiento"
                            value={formData.fechaNacimiento}
                            onChange={handleChange}
                            required
                            min={fechaLimiteInferior()}
                            max={fechaLimiteSuperior()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <small className="text-gray-500 text-xs">Edad permitida: {EDAD_MINIMA} a {EDAD_MAXIMA} años</small>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Género</label>
                        <select
                            name="genero"
                            value={formData.genero}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Seleccionar</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Correo *</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            onBlur={(e) => verificarCampo('correo', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg ${erroresCampo.correo ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {erroresCampo.correo && <p className="text-red-600 text-xs mt-1">{erroresCampo.correo}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Correo del Encargado *</label>
                        <input
                            type="email"
                            name="emailEncargado"
                            value={formData.emailEncargado}
                            onChange={handleChange}
                            onBlur={(e) => verificarCampo('emailEncargado', e.target.value)}
                            required
                            className={`w-full px-3 py-2 border rounded-lg ${erroresCampo.emailEncargado ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="correo@encargado.com"
                        />
                        {erroresCampo.emailEncargado && <p className="text-red-600 text-xs mt-1">{erroresCampo.emailEncargado}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Escuela de Procedencia</label>
                        <input
                            type="text"
                            name="escuelaProcedencia"
                            value={formData.escuelaProcedencia}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Promedio Anterior</label>
                        <input
                            type="number"
                            step="0.01"
                            name="promedioAnterior"
                            value={formData.promedioAnterior}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nivel que Aspira *</label>
                        <select
                            name="nivelAspira"
                            value={formData.nivelAspira}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="Bachillerato General">Bachillerato General</option>
                            <option value="Bachillerato Tecnico">Bachillerato Técnico</option>
                        </select>
                    </div>

                    {formData.nivelAspira === 'Bachillerato Tecnico' && (
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Especialidad *</label>
                            <select
                                name="especialidadAspira"
                                value={formData.especialidadAspira}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Seleccionar</option>
                                <option value="1">Técnico en Desarrollo de Software</option>
                                <option value="2">Técnico en Administrativo Contable</option>
                                <option value="3">Técnico en Salud y Bienestar</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Enviar Preinscripción'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PreinscripcionForm;