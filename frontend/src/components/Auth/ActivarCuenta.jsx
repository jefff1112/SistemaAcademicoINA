// Componente ActivarCuenta: página pública de activación de cuenta (Estudiante o Encargado).
// Valida el token, muestra los datos según el rol, permite crear contraseña y reportar datos incorrectos.
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validarToken, activarCuenta, solicitarNuevoEnlace } from '../../services/authService';
import { crearReportes } from '../../services/reportesService';

// Campos reportables para estudiantes.
const CAMPOS_REPORTABLES_ESTUDIANTE = [
    { campo: 'nombres', label: 'Nombres' },
    { campo: 'apellidos', label: 'Apellidos' },
    { campo: 'nie', label: 'NIE (código MINED)' },
    { campo: 'dui', label: 'DUI' },
    { campo: 'carnet_menoridad', label: 'Carnet de Minoridad' },
    { campo: 'fecha_nacimiento', label: 'Fecha de nacimiento' },
    { campo: 'genero', label: 'Género' },
    { campo: 'direccion', label: 'Dirección' },
    { campo: 'telefono_movil', label: 'Teléfono móvil' },
    { campo: 'correo_estudiante', label: 'Correo electrónico' },
    { campo: 'nombre_encargado', label: 'Nombre del encargado' },
    { campo: 'parentesco_encargado', label: 'Parentesco del encargado' },
    { campo: 'telefono_encargado', label: 'Teléfono del encargado' }
];

const ActivarCuenta = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    // estados: cargando | valido | invalido | expirado | usado | exitoso
    const [estado, setEstado] = useState('cargando');
    const [datos, setDatos] = useState(null);

    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);

    const [showReporte, setShowReporte] = useState(false);
    const [reportes, setReportes] = useState([{ campo: '', valorCorrecto: '', comentario: '' }]);
    const [reporteMsg, setReporteMsg] = useState('');
    const [enviandoReporte, setEnviandoReporte] = useState(false);
    const [solicitando, setSolicitando] = useState(false);

    useEffect(() => {
        cargarToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Valida el token y carga el estado correspondiente.
    const cargarToken = async () => {
        if (!token) { setEstado('invalido'); return; }
        try {
            const res = await validarToken(token);
            if (res.estado === 'valido') { setEstado('valido'); setDatos(res); }
            else setEstado(res.estado || 'invalido');
        } catch {
            setEstado('invalido');
        }
    };

    // Crea la contraseña y activa la cuenta.
    const handleActivar = async (e) => {
        e.preventDefault();
        setMensaje('');
        if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            setMensaje('La contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número');
            return;
        }
        if (password !== confirmar) {
            setMensaje('Las contraseñas no coinciden');
            return;
        }
        setEnviando(true);
        try {
            await activarCuenta(token, password);
            setEstado('exitoso');
        } catch (err) {
            setMensaje(err.response?.data?.mensaje || 'Error al activar la cuenta');
        } finally {
            setEnviando(false);
        }
    };

    // Solicita un nuevo enlace (para pantalla de enlace expirado).
    const handleSolicitarEnlace = async () => {
        setSolicitando(true);
        setMensaje('');
        try {
            await solicitarNuevoEnlace(token);
            setMensaje('Solicitud enviada. Contacta a Registro Académico.');
        } catch (err) {
            setMensaje(err.response?.data?.mensaje || 'Error al solicitar enlace');
        } finally {
            setSolicitando(false);
        }
    };

    // Variables del modal de reporte.
    const actualizarReporte = (idx, campo, valor) => {
        setReportes(prev => prev.map((r, i) => (i === idx ? { ...r, [campo]: valor } : r)));
    };
    const agregarReporte = () => setReportes(prev => [...prev, { campo: '', valorCorrecto: '', comentario: '' }]);
    const quitarReporte = (idx) => setReportes(prev => prev.filter((_, i) => i !== idx));

    // Devuelve el valor actual del estudiante para la clave de campo dada.
    const valorActualDe = (campo) => {
        const e = datos?.estudiante;
        if (!e) return '';
        const map = {
            nombres: e.nombres, apellidos: e.apellidos, nie: e.nie, dui: e.dui,
            carnet_menoridad: e.carnetMenoridad, fecha_nacimiento: e.fechaNacimiento,
            genero: e.genero, direccion: e.direccion, telefono_movil: e.telefonoMovil,
            correo_estudiante: e.correo, nombre_encargado: e.nombreEncargado,
            parentesco_encargado: e.parentescoEncargado, telefono_encargado: e.telefonoEncargado
        };
        const v = map[campo];
        return v ?? '';
    };

    // Envía los reportes acumulados.
    const handleEnviarReportes = async () => {
        const validos = reportes.filter(r => r.campo && r.valorCorrecto && r.valorCorrecto.trim());
        if (validos.length === 0) { setReporteMsg('Selecciona un campo y escribe el valor correcto'); return; }
        setEnviandoReporte(true);
        setReporteMsg('');
        try {
            const payload = validos.map(r => ({ campo: r.campo, valorCorrecto: r.valorCorrecto, comentario: r.comentario }));
            await crearReportes(token, payload);
            setShowReporte(false);
            setReportes([{ campo: '', valorCorrecto: '', comentario: '' }]);
            setMensaje('Reportes enviados, serán revisados');
        } catch (err) {
            setReporteMsg(err.response?.data?.mensaje || 'Error al enviar reportes');
        } finally {
            setEnviandoReporte(false);
        }
    };

    const estiloCarta = {
        maxWidth: '520px', margin: '60px auto', background: '#fff',
        border: '1px solid #ddd', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    };
    const estiloBoton = { background: '#1A2E6B', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', marginTop: '8px' };
    const estiloEntrada = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' };

    if (estado === 'cargando') {
        return <div style={estiloCarta}><p style={{ textAlign: 'center' }}>Cargando...</p></div>;
    }

    if (estado === 'exitoso') {
        return (
            <div style={estiloCarta}>
                <h2 style={{ color: '#15803d', textAlign: 'center' }}>Cuenta activada correctamente</h2>
                <p style={{ textAlign: 'center' }}>Ya puedes iniciar sesión con tu correo y tu nueva contraseña.</p>
                <button style={{ ...estiloBoton, width: '100%' }} onClick={() => navigate('/login')}>Ir a iniciar sesión</button>
            </div>
        );
    }

    if (estado === 'invalido') {
        return (
            <div style={estiloCarta}>
                <h2 style={{ textAlign: 'center' }}>Enlace inválido</h2>
                <p style={{ textAlign: 'center' }}>El enlace de activación no es válido.</p>
            </div>
        );
    }

    if (estado === 'usado') {
        return (
            <div style={estiloCarta}>
                <h2 style={{ textAlign: 'center' }}>Este enlace ya fue utilizado</h2>
                <p style={{ textAlign: 'center' }}>Tu cuenta ya fue activada. Inicia sesión con tus credenciales.</p>
                <button style={{ ...estiloBoton, width: '100%' }} onClick={() => navigate('/login')}>Ir a iniciar sesión</button>
            </div>
        );
    }

    if (estado === 'expirado') {
        return (
            <div style={estiloCarta}>
                <h2 style={{ textAlign: 'center' }}>El enlace ha expirado</h2>
                <p style={{ textAlign: 'center', color: '#b91c1c' }}>Este enlace ya no está disponible porque superó las 48 horas.</p>
                {mensaje && <p style={{ textAlign: 'center', color: '#15803d' }}>{mensaje}</p>}
                <button style={{ ...estiloBoton, width: '100%' }} onClick={handleSolicitarEnlace} disabled={solicitando}>
                    {solicitando ? 'Enviando...' : 'Solicitar nuevo enlace'}
                </button>
                <p style={{ textAlign: 'center', color: '#64748b' }}>Contacta a Registro Académico.</p>
            </div>
        );
    }

    // Estado válido: detectar si es Estudiante o Encargado
    const esEncargado = datos?.rol === 'Encargado';
    const est = datos?.estudiante;
    const encargado = datos?.encargado;

    return (
        <div style={estiloCarta}>
            <h2 style={{ color: '#1A2E6B', textAlign: 'center' }}>Instituto Nacional de Apopa</h2>
            {esEncargado ? (
                <>
                    <h3 style={{ textAlign: 'center' }}>¡Bienvenido, {encargado?.nombres}!</h3>
                    <p style={{ textAlign: 'center', color: '#64748b' }}>
                        Crea tu contraseña para acceder al <strong>Portal de Encargados</strong> y dar seguimiento a <strong>{est?.nombres} {est?.apellidos}</strong>.
                    </p>
                    <div style={{ background: '#EEF1F9', borderRadius: '8px', padding: '16px', margin: '16px 0', fontSize: '14px' }}>
                        <p><strong>Encargado:</strong> {encargado?.nombres} {encargado?.apellidos}</p>
                        <p><strong>Correo:</strong> {encargado?.correo || '-'}</p>
                        <hr style={{ margin: '12px 0', borderColor: '#cbd5e1' }} />
                        <p><strong>Estudiante a cargo:</strong> {est?.nombres} {est?.apellidos}</p>
                        <p><strong>Código Estudiante:</strong> {est?.codigoEstudiante || '-'}</p>
                        <p><strong>NIE:</strong> {est?.nie || '-'}</p>
                        <p><strong>Carrera:</strong> {est?.carrera || 'Bachillerato General'}</p>
                        <p><strong>Nivel:</strong> {est?.nivel || '-'}</p>
                        {est?.gradoSeccion && <p><strong>Grado/Sección:</strong> {est.gradoSeccion}</p>}
                    </div>
                </>
            ) : (
                <>
                    <h3 style={{ textAlign: 'center' }}>¡Bienvenido, {est?.nombres}!</h3>
                    <p style={{ textAlign: 'center', color: '#64748b' }}>Revisa tus datos y crea tu contraseña para acceder al portal.</p>
                    <div style={{ background: '#EEF1F9', borderRadius: '8px', padding: '16px', margin: '16px 0', fontSize: '14px' }}>
                        <p><strong>Nombres:</strong> {est?.nombres}</p>
                        <p><strong>Apellidos:</strong> {est?.apellidos}</p>
                        <p><strong>DUI:</strong> {est?.dui || '-'}</p>
                        <p><strong>NIE:</strong> {est?.nie || '-'}</p>
                        <p><strong>Fecha de nacimiento:</strong> {est?.fechaNacimiento ? String(est.fechaNacimiento).slice(0, 10) : '-'}</p>
                        <p><strong>Género:</strong> {est?.genero || '-'}</p>
                        <p><strong>Dirección:</strong> {est?.direccion || '-'}</p>
                        <p><strong>Teléfono:</strong> {est?.telefonoMovil || '-'}</p>
                        <p><strong>Correo:</strong> {est?.correo || '-'}</p>
                        <p><strong>Carrera:</strong> {est?.carrera || 'Bachillerato General'}</p>
                        <p><strong>Nivel:</strong> {est?.nivel || '-'}</p>
                        {est?.gradoSeccion && <p><strong>Grado/Sección:</strong> {est.gradoSeccion}</p>}
                    </div>
                </>
            )}

            <form onSubmit={handleActivar}>
                {mensaje && <p style={{ color: '#b91c1c', fontSize: '14px' }}>{mensaje}</p>}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Contraseña</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={estiloEntrada} placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número" required />
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Confirmar contraseña</label>
                    <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} style={estiloEntrada} placeholder="Repite la contraseña" required />
                </div>
                <button type="submit" disabled={enviando} style={{ ...estiloBoton, width: '100%' }}>
                    {enviando ? 'Activando...' : esEncargado ? 'Crear mi contraseña y acceder al Portal Encargado' : 'Crear mi contraseña y acceder'}
                </button>
            </form>

            {!esEncargado && (
                <button onClick={() => setShowReporte(true)} style={{ ...estiloBoton, width: '100%', background: '#C8A832' }}>
                    Reportar dato incorrecto
                </button>
            )}

            {showReporte && !esEncargado && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ background: '#fff', borderRadius: '12px', maxWidth: '640px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3>Reportar datos incorrectos</h3>
                            <button onClick={() => setShowReporte(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>X</button>
                        </div>
                        {reporteMsg && <p style={{ color: '#b91c1c' }}>{reporteMsg}</p>}
                        {reportes.map((r, idx) => (
                            <div key={idx} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Campo a reportar</label>
                                    <select value={r.campo} onChange={(e) => actualizarReporte(idx, 'campo', e.target.value)} style={estiloEntrada}>
                                        <option value="">Seleccione un campo</option>
                                        {CAMPOS_REPORTABLES_ESTUDIANTE.map(c => <option key={c.campo} value={c.campo}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Valor actual</label>
                                    <input type="text" value={valorActualDe(r.campo)} readOnly style={{ ...estiloEntrada, background: '#f1f5f9' }} />
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Cómo debería estar *</label>
                                    <input type="text" value={r.valorCorrecto} onChange={(e) => actualizarReporte(idx, 'valorCorrecto', e.target.value)} style={estiloEntrada} placeholder="Escribe el valor correcto" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Comentario adicional (opcional)</label>
                                    <textarea value={r.comentario} onChange={(e) => actualizarReporte(idx, 'comentario', e.target.value)} rows="2" style={estiloEntrada} />
                                </div>
                                {reportes.length > 1 && (
                                    <button onClick={() => quitarReporte(idx)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', marginTop: '8px', fontSize: '12px' }}>
                                        Quitar
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={agregarReporte} style={{ background: '#e2e8f0', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>
                            + Agregar otro dato
                        </button>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowReporte(false)} style={{ background: '#e5e7eb', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleEnviarReportes} disabled={enviandoReporte} style={estiloBoton}>
                                {enviandoReporte ? 'Enviando...' : 'Enviar reportes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivarCuenta;