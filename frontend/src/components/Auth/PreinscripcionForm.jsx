// Componente PreinscripcionForm (Auth): formulario público de preinscripción en línea para aspirantes al INA.
import React, { useState } from 'react';
import { createAspirante } from '../../services/aspirantesService';

// Componente principal: captura los datos del aspirante y los envía a la API.
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
        escuelaProcedencia: '',
        promedioAnterior: '',
        nivelAspira: 'Bachillerato General',
        especialidadAspira: ''
    });

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Envía la preinscripción a la API y muestra el resultado al usuario.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setSuccess(false);

        try {
            await createAspirante(formData);
            setSuccess(true);
            setFormData({
                nombres: '', apellidos: '', dui: '', nie: '', fechaNacimiento: '',
                genero: '', telefono: '', correo: '', escuelaProcedencia: '',
                promedioAnterior: '', nivelAspira: 'Bachillerato General', especialidadAspira: ''
            });
        } catch (err) {
            setError(err.mensaje || 'Error al enviar la preinscripción');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Preinscripción en Línea - INA</h1>

            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">Preinscripción registrada exitosamente</div>}
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nombres *</label>
                        <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Apellidos *</label>
                        <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">DUI</label>
                        <input type="text" name="dui" value={formData.dui} onChange={handleChange} placeholder="12345678-9" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">NIE *</label>
                        <input type="text" name="nie" value={formData.nie} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Fecha Nacimiento</label>
                        <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Género</label>
                        <select name="genero" value={formData.genero} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">Seleccionar</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Correo *</label>
                        <input type="email" name="correo" value={formData.correo} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Escuela de Procedencia</label>
                        <input type="text" name="escuelaProcedencia" value={formData.escuelaProcedencia} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Promedio Anterior</label>
                        <input type="number" step="0.01" name="promedioAnterior" value={formData.promedioAnterior} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nivel que Aspira *</label>
                        <select name="nivelAspira" value={formData.nivelAspira} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="Bachillerato General">Bachillerato General</option>
                            <option value="Bachillerato Tecnico">Bachillerato Técnico</option>
                        </select>
                    </div>
                    {formData.nivelAspira === 'Bachillerato Tecnico' && (
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Especialidad</label>
                            <select name="especialidadAspira" value={formData.especialidadAspira} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="">Seleccionar</option>
                                <option value="2">Técnico en Desarrollo de Software</option>
                                <option value="1">Técnico en Administrativo Contable</option>
                                <option value="4">Técnico en Electrónica</option>
                                <option value="3">Técnico en Salud y Bienestar</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Enviando...' : 'Enviar Preinscripción'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PreinscripcionForm;