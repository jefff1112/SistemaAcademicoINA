// Componente CuadroAuxiliarINA: Réplica visual EXACTA del Excel INA "PRIMEROS AÑOS MATERIAS CUADROS AUXILIARES-2026"
// Usa Tailwind CSS + CSS Grid para replicar: headers merged, texto vertical, bordes, líneas punteadas
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const CuadroAuxiliarINA = ({ data, onSaveNota, onSaveRecuperacion, onSaveRecuperacionModulo, saving, readOnly = false }) => {
    const { user } = useAuth();
    const [editCell, setEditCell] = useState(null); // { idEstudiante, idSubActividad, value }
    const [editRecuperacion, setEditRecuperacion] = useState(null); // { idEstudiante, value } o { idEstudiante, idActividad, value, isModulo }
    const [editObservacion, setEditObservacion] = useState(null); // { idEstudiante, idActividad, value }

    // Colores para notas
    const getColorNota = (nota) => {
        if (nota === null || nota === undefined) return 'border-gray-300';
        if (nota >= 6) return 'border-green-500 bg-green-50';
        if (nota >= 5) return 'border-yellow-500 bg-yellow-50';
        return 'border-red-500 bg-red-50';
    };

    const getBadgeClass = (nota) => {
        if (nota === null || nota === undefined) return 'badge-sin-nota';
        if (nota >= 6) return 'badge-aprobado';
        if (nota >= 5) return 'badge-recuperacion';
        return 'badge-reprobado';
    };

    const getEstadoTexto = (nota) => {
        if (nota === null || nota === undefined) return 'Sin calificar';
        if (nota >= 6) return `Aprobado (${nota})`;
        if (nota >= 5) return `Recuperación (${nota})`;
        return `Reprobado (${nota})`;
    };

    // Calcular totales de columnas para colSpan dinámicos
    const bloquesConColSpan = useMemo(() => {
        if (!data?.Header?.Actividades) return [];
        return data.Header.Actividades.map((act, idx) => ({
            ...act,
            colSpan: act.Columnas.length,
            keyActividad: act.IdActividad,
            esModulo: data.EsModulo || act.EsModulo
        }));
    }, [data]);

    // Total columnas de sub-actividades
    const totalSubColumnas = useMemo(() => {
        if (!data?.Header?.Actividades) return 0;
        return data.Header.Actividades.reduce((sum, act) => sum + act.Columnas.length, 0);
    }, [data]);

    // Columnas fijas: CODIGO, NOMBRES + sub-columnas + PROMEDIO + RECUPERACION + OBSERVACIONES
    const totalColumnas = 2 + totalSubColumnas + 3;

    // ===== HANDLERS =====
    const handleInputChange = (e, idEstudiante, idSubActividad) => {
        const value = e.target.value === '' ? null : parseFloat(e.target.value);
        if (value !== null && (isNaN(value) || value < 0 || value > 10)) return;
        setEditCell({ idEstudiante, idSubActividad, value });
    };

    const handleInputBlur = (idEstudiante, idSubActividad) => {
        if (editCell && editCell.idEstudiante === idEstudiante && editCell.idSubActividad === idSubActividad) {
            if (editCell.value !== null && onSaveNota) {
                onSaveNota(editCell.idEstudiante, editCell.idSubActividad, editCell.value);
            }
            setEditCell(null);
        }
    };

    const handleRecuperacionChange = (e, idEstudiante, idActividad = null, isModulo = false) => {
        const value = e.target.value === '' ? null : parseFloat(e.target.value);
        if (value !== null && (isNaN(value) || value < 0 || value > 10)) return;
        if (isModulo && idActividad) {
            setEditRecuperacion({ idEstudiante, idActividad, value, isModulo: true });
        } else {
            setEditRecuperacion({ idEstudiante, value, isModulo: false });
        }
    };

    const handleRecuperacionBlur = (idEstudiante, idActividad = null, isModulo = false) => {
        if (editRecuperacion && editRecuperacion.idEstudiante === idEstudiante) {
            const match = isModulo 
                ? editRecuperacion.idActividad === idActividad && editRecuperacion.isModulo
                : !editRecuperacion.isModulo;
            if (match && editRecuperacion.value !== null) {
                if (isModulo && onSaveRecuperacionModulo) {
                    onSaveRecuperacionModulo(editRecuperacion.idEstudiante, editRecuperacion.idActividad, editRecuperacion.value);
                } else if (!isModulo && onSaveRecuperacion) {
                    onSaveRecuperacion(editRecuperacion.idEstudiante, editRecuperacion.value);
                }
            }
            setEditRecuperacion(null);
        }
    };

    const handleObservacionChange = (e, idEstudiante, idActividad) => {
        setEditObservacion({ idEstudiante, idActividad, value: e.target.value });
    };

    const handleObservacionBlur = (idEstudiante, idActividad) => {
        if (editObservacion && editObservacion.idEstudiante === idEstudiante && editObservacion.idActividad === idActividad) {
            // TODO: implementar guardado de observación
            setEditObservacion(null);
        }
    };

    // ===== RENDER =====
    if (!data) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Seleccione Clase, Materia/Especialidad y Período para ver el cuadro auxiliar
            </div>
        );
    }

    // Validaciones defensivas para evitar errores cuando data no tiene la estructura completa
    const { Header, Filas, EsModulo } = data;
    
    if (!Header || !Filas) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                {Header ? 'Cargando estudiantes...' : 'Cargando estructura del cuadro...'}
            </div>
        );
    }
    
    // Asegurar que Header.Actividades exista y sea un array
    if (!Header.Actividades || !Array.isArray(Header.Actividades)) {
        Header.Actividades = [];
    }
    
    const esModulo = EsModulo || Header?.EsModulo || false;

    return (
        <div className="cuadro-ina-container bg-white">
            {/* ===== HEADER INA ===== */}
            <div className="ina-header-block border-2 border-black p-4 mb-4 bg-white">
                <div className="text-center font-bold text-lg mb-2">
                    {Header.Instituto}
                </div>
                <div className="flex justify-between items-center font-bold text-sm mb-2 border-b border-black pb-2">
                    <span>{Header.Titulo}</span>
                    <span className="text-right">AÑO LECTIVO: {Header.AnioLectivo}__</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs font-bold">
                    <div>
                        <span className="block">ASIGNATURA:</span>
                        <div className="border-b border-black h-6 mt-1">{Header.Asignatura}</div>
                    </div>
                    <div>
                        <span className="block">SECCIÓN:</span>
                        <div className="border-b border-black h-6 mt-6 w-20">{Header.Seccion}</div>
                    </div>
                    <div>
                        <span className="block">PERIODO N°:</span>
                        <div className="border-b border-black h-6 mt-1 w-16">{Header.PeriodoNumero}</div>
                    </div>
                    <div className="col-span-1">
                        <span className="block">DOCENTE:</span>
                        <div className="border-b border-black h-6 mt-1">{Header.Docente}</div>
                    </div>
                </div>
            </div>

            {/* ===== LÍNEAS PUNTEADAS DE SALTO DE PÁGINA ===== */}
            <div className="page-break-lines absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
                {/* Línea 1: después de SECCIÓN (aprox 25%) */}
                <div className="absolute h-full border-l border-dashed border-gray-400" style={{ left: '25%' }} />
                {/* Línea 2: después de Autoeval Act 1 (aprox 45%) */}
                <div className="absolute h-full border-l border-dashed border-gray-400" style={{ left: '45%' }} />
                {/* Línea 3: cerca de Observaciones (aprox 85%) */}
                <div className="absolute h-full border-l border-dashed border-gray-400" style={{ left: '85%' }} />
            </div>

            {/* ===== TABLA PRINCIPAL - CSS GRID EXACTO ===== */}
            <div className="relative overflow-x-auto overflow-y-auto max-h-[70vh] border-2 border-black bg-white">
                <table className="cuadro-ina-table w-full border-collapse" style={{ minWidth: `${totalColumnas * 60}px` }}>
                    <thead className="sticky top-0 z-10">
                        {/* FILA 1: Nombres de Actividad (merged con colSpan) */}
                        <tr className="bg-ina-deep text-white border-2 border-black">
                            <th rowSpan={2} className="ina-th-fixed header-vertical">
                                <div className="writing-mode-vertical-lr rotate-180 text-center py-2 px-1">CÓDIGO</div>
                            </th>
                            <th rowSpan={2} className="ina-th-fixed header-horizontal text-left px-2">
                                NOMBRES
                            </th>
                            {Header.Actividades.map((act, actIdx) => (
                                <th
                                    key={act.IdActividad}
                                    colSpan={act.Columnas.length}
                                    className="bg-ina-deep text-white text-center border-2 border-black text-xs py-2"
                                    style={{ minWidth: `${act.Columnas.length * 55}px` }}
                                >
                                    {esModulo ? `MÓDULO ${act.NumeroOrden}` : `ACTIVIDAD ${act.NumeroOrden}`}
                                </th>
                            ))}
                            <th rowSpan={2} className="bg-ina-deep text-white border-2 border-black border-l-2 border-l-black header-vertical text-center px-1">
                                <div className="writing-mode-vertical-lr rotate-180 text-center py-2">PROMEDIO FINAL<br/>DE PERIODO</div>
                            </th>
                            <th rowSpan={2} className="bg-ina-deep text-white border-2 border-black border-l-2 border-l-black header-vertical text-center px-1">
                                <div className="writing-mode-vertical-lr rotate-180 text-center py-2">CORRECCIÓN,<br/>RECUPERACIÓN</div>
                            </th>
                            <th rowSpan={2} className="bg-ina-deep text-white border-2 border-black border-l-2 border-l-black header-horizontal text-center px-2">
                                OBSERVACIONES
                            </th>
                        </tr>

                        {/* FILA 2: Sub-actividades con ponderaciones */}
                        <tr className="bg-gray-100 border-2 border-black">
                            {Header.Actividades.flatMap(act => 
                                act.Columnas.map((col, colIdx) => (
                                    <th
                                        key={`${col.IdSubActividad}-${col.NumeroOrden}`}
                                        className={`bg-gray-100 text-ina-deep text-center border border-gray-300 text-xs px-1 py-1 ${col.EsVertical ? 'header-vertical' : 'header-horizontal'} ${col.EsPorcentajeFinal ? 'font-bold text-gold' : ''}`}
                                        style={{ minWidth: '55px', maxWidth: '70px' }}
                                    >
                                        {col.TipoSubActividad === 'Porcentaje' ? (
                                            <span className="font-bold text-gold">{col.Ponderacion}%</span>
                                        ) : col.EsRecuperacionModulo ? (
                                            <span className="font-bold text-red-600">REC.</span>
                                        ) : col.TipoSubActividad === 'Autoevaluacion' ? (
                                            <>AUTO<br/><span className="font-normal text-xs">EVAL.</span></>
                                        ) : col.TipoSubActividad === 'Coevaluacion' ? (
                                            <>COE<br/><span className="font-normal text-xs">EVAL.</span></>
                                        ) : col.TipoSubActividad === 'PruebaObjetiva' ? (
                                            <>PRUEBA<br/><span className="font-normal text-xs">OBJ.</span></>
                                        ) : col.TipoSubActividad === 'Numerada' ? (
                                            <span>{col.NumeroOrden}</span>
                                        ) : (
                                            <>
                                                {col.Nombre}
                                                {col.Ponderacion && <span className="text-gold text-xs"> ({col.Ponderacion}%)</span>}
                                            </>
                                        )}
                                        {col.Ponderacion && col.TipoSubActividad !== 'Porcentaje' && (
                                            <span className="block text-gold text-[9px] font-bold">{col.Ponderacion}%</span>
                                        )}
                                    </th>
                                ))
                            )}
                            <th className="bg-gray-100 border border-gray-300 header-vertical text-center px-1">
                                <div className="writing-mode-vertical-lr rotate-180 text-center py-1">PROMEDIO</div>
                            </th>
                            <th className="bg-gray-100 border border-gray-300 header-vertical text-center px-1">
                                <div className="writing-mode-vertical-lr rotate-180 text-center py-1">REC.</div>
                            </th>
                            <th className="bg-gray-100 border border-gray-300 header-horizontal text-center px-2">
                                OBS.
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {Filas.map((est, rowIdx) => (
                            <tr key={est.IdEstudiante} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                {/* CODIGO - fixed sticky */}
                                <td className="ina-td-fixed border border-gray-300 text-center text-xs font-mono px-1 py-1 sticky left-0 z-10 bg-gray-50 border-r-2 border-black">
                                    {est.Codigo}
                                </td>
                                {/* NOMBRES - fixed sticky */}
                                <td className="ina-td-fixed border border-gray-300 text-left font-medium text-xs px-2 py-1 sticky left-[60px] z-10 bg-gray-50 border-r-2 border-black">
                                    {est.Apellidos}, {est.Nombres}
                                </td>

                                {/* SUB-ACTIVIDADES DINÁMICAS */}
                                {Header.Actividades.flatMap(act => 
                                    act.Columnas.map((col, colIdx) => {
                                        const nota = est.NotasSubActividades?.[col.IdSubActividad];
                                        const isEditing = editCell?.idEstudiante === est.IdEstudiante && editCell?.idSubActividad === col.IdSubActividad;
                                        const bgClass = col.EsPorcentajeFinal ? 'bg-amber-50' : getColorNota(nota);
                                        
                                        return (
                                            <td
                                                key={`${est.IdEstudiante}-${col.IdSubActividad}`}
                                                className={`border border-gray-300 text-center ${bgClass} ${col.EsPorcentajeFinal ? 'bg-amber-50 font-bold' : ''} ${col.EsRecuperacionModulo ? 'bg-red-50' : ''}`}
                                                style={{ minWidth: '55px', maxWidth: '70px' }}
                                            >
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="10"
                                                        value={editCell?.value ?? ''}
                                                        onChange={(e) => handleInputChange(e, est.IdEstudiante, col.IdSubActividad)}
                                                        onBlur={() => handleInputBlur(est.IdEstudiante, col.IdSubActividad)}
                                                        autoFocus
                                                        className="w-full h-full text-center text-sm border-0 outline-none bg-transparent focus:ring-2 focus:ring-blue-500"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleInputBlur(est.IdEstudiante, col.IdSubActividad)}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        {nota !== null && nota !== undefined ? (
                                                            <span className={`text-sm font-medium ${nota >= 6 ? 'text-green-700' : nota >= 5 ? 'text-yellow-700' : 'text-red-700'}`}>
                                                                {Number(nota).toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-300">—</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })
                                )}

                                {/* PROMEDIO FINAL DE PERIODO */}
                                <td className="bg-amber-50 border-2 border-l-2 border-l-amber-400 border-amber-300 text-center font-bold text-sm text-ina-deep px-1 py-1 sticky right-[170px] z-10">
                                    {est.PromedioFinal !== null && est.PromedioFinal !== undefined ? Number(est.PromedioFinal).toFixed(2) : '—'}
                                </td>

                                {/* CORRECCIÓN, RECUPERACIÓN */}
                                <td className="bg-red-50 border-2 border-l-2 border-l-red-400 border-red-300 text-center px-1 py-1 sticky right-[90px] z-10">
                                    {esModulo ? (
                                        <>
                                            {(() => {
                                                const recGlobal = Filas.find(f => f.IdEstudiante === est.IdEstudiante)?.Recuperacion;
                                                return recGlobal !== null && recGlobal !== undefined ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="10"
                                                        value={editRecuperacion?.idEstudiante === est.IdEstudiante && !editRecuperacion.isModulo ? editRecuperacion.value : (recGlobal ?? '')}
                                                        onChange={(e) => handleRecuperacionChange(e, est.IdEstudiante)}
                                                        onBlur={() => handleRecuperacionBlur(est.IdEstudiante)}
                                                        autoFocus={editRecuperacion?.idEstudiante === est.IdEstudiante && !editRecuperacion?.isModulo}
                                                        className="w-full h-full text-center text-sm font-bold text-red-700 border-0 outline-none bg-transparent focus:ring-2 focus:ring-red-500"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRecuperacionBlur(est.IdEstudiante)}
                                                    />
                                                ) : (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="10"
                                                        value={editRecuperacion?.idEstudiante === est.IdEstudiante && !editRecuperacion.isModulo ? editRecuperacion.value : ''}
                                                        onChange={(e) => handleRecuperacionChange(e, est.IdEstudiante)}
                                                        onBlur={() => handleRecuperacionBlur(est.IdEstudiante)}
                                                        autoFocus={editRecuperacion?.idEstudiante === est.IdEstudiante && !editRecuperacion?.isModulo}
                                                        className="w-full h-full text-center text-sm font-bold text-red-700 border-0 outline-none bg-transparent focus:ring-2 focus:ring-red-500"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRecuperacionBlur(est.IdEstudiante)}
                                                    />
                                                );
                                            })()}
                                        </>
                                    ) : (
                                        <>
                                            {(() => {
                                                const recGlobal = est.Recuperacion;
                                                return recGlobal !== null && recGlobal !== undefined ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="10"
                                                        value={editRecuperacion?.idEstudiante === est.IdEstudiante && !editRecuperacion.isModulo ? editRecuperacion.value : (recGlobal ?? '')}
                                                        onChange={(e) => handleRecuperacionChange(e, est.IdEstudiante)}
                                                        onBlur={() => handleRecuperacionBlur(est.IdEstudiante)}
                                                        autoFocus={editRecuperacion?.idEstudiante === est.IdEstudiante && !editRecuperacion?.isModulo}
                                                        className="w-full h-full text-center text-sm font-bold text-red-700 border-0 outline-none bg-transparent focus:ring-2 focus:ring-red-500"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRecuperacionBlur(est.IdEstudiante)}
                                                    />
                                                ) : (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="10"
                                                        value={editRecuperacion?.idEstudiante === est.IdEstudiante && !editRecuperacion.isModulo ? editRecuperacion.value : ''}
                                                        onChange={(e) => handleRecuperacionChange(e, est.IdEstudiante)}
                                                        onBlur={() => handleRecuperacionBlur(est.IdEstudiante)}
                                                        autoFocus={editRecuperacion?.idEstudiante === est.IdEstudiante && !editRecuperacion?.isModulo}
                                                        className="w-full h-full text-center text-sm font-bold text-red-700 border-0 outline-none bg-transparent focus:ring-2 focus:ring-red-500"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRecuperacionBlur(est.IdEstudiante)}
                                                    />
                                                );
                                            })()}
                                        </>
                                    )}
                                </td>

                                {/* OBSERVACIONES */}
                                <td className="border border-gray-300 px-2 py-1 sticky right-0 z-10">
                                    <input
                                        type="text"
                                        value={editObservacion?.idEstudiante === est.IdEstudiante && editObservacion.idActividad === 'global' ? editObservacion.value : (est.Observaciones || '')}
                                        onChange={(e) => handleObservacionChange(e, est.IdEstudiante, 'global')}
                                        onBlur={() => handleObservacionBlur(est.IdEstudiante, 'global')}
                                        className="w-full h-full text-xs border-0 outline-none bg-transparent focus:ring-2 focus:ring-blue-500"
                                        placeholder="Obs."
                                    />
                                </td>
                            </tr>
                        ))}

                        {Filas.length === 0 && (
                            <tr>
                                <td colSpan={totalColumnas} className="text-center text-gray-500 py-12">
                                    No hay estudiantes matriculados en esta clase para el período seleccionado
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ===== LEYENDA ===== */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg text-xs">
                <h4 className="font-bold text-ina-deep mb-2">Leyenda de colores:</h4>
                <div className="flex flex-wrap gap-4">
                    <span className="flex items-center gap-2"><span className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></span> ≥ 6.0 Aprobado (Verde)</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded"></span> 5.0 - 5.9 Recuperación (Dorado INA)</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></span> &lt; 5.0 Reprobado (Rojo)</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-4 bg-amber-100 border-2 border-amber-500 rounded font-bold"></span> Promedio Final (Naranja)</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-4 bg-red-50 border-2 border-red-400 rounded font-bold"></span> Recuperación (Rojo - reemplaza final)</span>
                </div>
            </div>
        </div>
    );
};

export default CuadroAuxiliarINA;
