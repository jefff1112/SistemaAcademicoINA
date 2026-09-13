namespace SistemaAcademicoINA.Models.DTOs;

/// <summary>
/// Header del cuadro auxiliar INA
/// </summary>
public class CuadroAuxiliarHeaderDTO
{
    public string Instituto { get; set; } = "INSTITUTO NACIONAL DE APOPA";
    public string Titulo { get; set; } = "CUADRO AUXILIAR PARA EL REGISTRO DE EVALUACIONES POR ASIGNATURA Y PERIODO";
    public int AnioLectivo { get; set; }
    public string Asignatura { get; set; } = string.Empty;
    public string Seccion { get; set; } = string.Empty;
    public int PeriodoNumero { get; set; }
    public string Docente { get; set; } = string.Empty;
    public bool EsModulo { get; set; }
    public List<ActividadBloqueDTO> Actividades { get; set; } = new();
}

/// <summary>
/// Bloque de actividad (ACTIVIDAD 1, 2, 3 o MÓDULO 1, 2...)
/// </summary>
public class ActividadBloqueDTO
{
    public int IdActividad { get; set; }
    public string Nombre { get; set; } = string.Empty; // "ACTIVIDAD 1" o "MÓDULO 1"
    public decimal Ponderacion { get; set; }
    public bool EsModulo { get; set; }
    public int NumeroOrden { get; set; }
    public bool PuedeEditar { get; set; } = true;
    public List<SubActividadColumnaDTO> Columnas { get; set; } = new();
}

/// <summary>
/// Columna de sub-actividad en el encabezado del cuadro
/// </summary>
public class SubActividadColumnaDTO
{
    public int IdSubActividad { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int NumeroOrden { get; set; } // 1-5 numeradas, 6=Autoeval, 7=Coeval, 8=%, 9+=Pruebas
    public string TipoSubActividad { get; set; } = string.Empty; // "Numerada", "Autoevaluacion", "Coevaluacion", "Porcentaje", "PruebaObjetiva"
    public bool EsVertical { get; set; }
    public decimal? Ponderacion { get; set; }
    public bool EsPorcentajeFinal { get; set; }
    public bool EsRecuperacionModulo { get; set; } // Para módulos: columna de recuperación por módulo
    public bool EsActividadModulo { get; set; }
    public bool EsPruebaObjetiva { get; set; }
    public bool EsNumerada { get; set; }
    public bool EsAutoevaluacion { get; set; }
    public bool EsCoevaluacion { get; set; }
}

/// <summary>
/// Fila de estudiante en el cuadro
/// </summary>
public class EstudianteFilaDTO
{
    public int IdEstudiante { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public Dictionary<int, decimal?> NotasSubActividades { get; set; } = new(); // idSubActividad -> nota
    public decimal? PromedioFinal { get; set; }
    public decimal? Recuperacion { get; set; }
    public string Observaciones { get; set; } = string.Empty;
    // Para módulos: recuperaciones por módulo y observaciones por actividad
    public Dictionary<int, decimal?> RecuperacionesPorModulo { get; set; } = new(); // idActividad -> nota
    public Dictionary<int, string> ObservacionesPorActividad { get; set; } = new(); // idActividad -> observación
    public Dictionary<int, decimal?> NotasPorActividad { get; set; } = new(); // idActividad -> nota final de la actividad (promedio de sub-actividades)
}

/// <summary>
/// Cuadro auxiliar completo listo para renderizar en React
/// </summary>
public class CuadroAuxiliarCompletoDTO
{
    public CuadroAuxiliarHeaderDTO Header { get; set; } = new();
    public List<EstudianteFilaDTO> Filas { get; set; } = new();
    public int TotalEstudiantes { get; set; }
    public int TotalActividades { get; set; }
    public int TotalSubActividades { get; set; }
    public bool EsModulo { get; set; }
    public int? IdEspecialidad { get; set; }
    public int IdPeriodo { get; set; }
    public int EscalaNota { get; set; } = 10; // 10 materias básicas, 5 módulos
}

/// <summary>
/// Request para guardar nota individual
/// </summary>
public class GuardarNotaRequest
{
    public int IdEstudiante { get; set; }
    public int IdSubActividad { get; set; }
    public decimal? Nota { get; set; }
    public string? Observaciones { get; set; }
}

/// <summary>
/// Request para guardar múltiples notas
/// </summary>
public class GuardarNotasMultipleRequest
{
    public List<GuardarNotaRequest> Notas { get; set; } = new();
}

/// <summary>
/// Request para guardar recuperación de período
/// </summary>
public class GuardarRecuperacionRequest
{
    public int IdEstudiante { get; set; }
    public int IdMateria { get; set; }
    public int IdClase { get; set; }
    public int IdPeriodo { get; set; }
    public decimal? NotaRecuperacion { get; set; }
    public string? ObservacionRecuperacion { get; set; }
}

/// <summary>
/// Request para guardar recuperación por módulo
/// </summary>
public class GuardarRecuperacionModuloRequest
{
    public int IdEstudiante { get; set; }
    public int IdActividad { get; set; } // El módulo/actividad
    public int IdClase { get; set; }
    public int IdMateria { get; set; }
    public int IdEspecialidad { get; set; }
    public int IdPeriodo { get; set; }
    public decimal? NotaRecuperacion { get; set; }
    public string? Observacion { get; set; }
}

/// <summary>
/// Response para recuperación por módulo
/// </summary>
public class RecuperacionModuloResponse
{
    public int IdRecuperacionModulo { get; set; }
    public int IdActividad { get; set; }
    public decimal? NotaRecuperacion { get; set; }
    public decimal? NotaFinalModulo { get; set; } // Nota del módulo con recuperación aplicada
    public decimal? NotaFinalAnual { get; set; } // Promedio de todos los módulos
    public bool EsRecuperacionAnual { get; set; }
}

/// <summary>
/// DTO para exportación con template físico
/// </summary>
public class ExportarCuadroAuxiliarRequest
{
    public int? IdClase { get; set; }
    public int? IdMateria { get; set; }
    public int? IdEspecialidad { get; set; }
    public int? IdPeriodo { get; set; }
    public int? AnioLectivo { get; set; }
    public bool TodasClases { get; set; }
    public bool TodasMaterias { get; set; }
    public bool TodosPeriodos { get; set; }
    public bool EsConsolidadoAnual { get; set; }
    public string? TipoExportacion { get; set; } // "Completo", "SoloNotas", "Template"
}

/// <summary>
/// Request para crear actividad desde ActivityManager
/// </summary>
public class CrearActividadRequest
{
    public int? IdMateria { get; set; }
    public int? IdEspecialidad { get; set; }
    public int IdClase { get; set; }
    public int? IdDocente { get; set; }
    public int? IdPeriodo { get; set; }
    public string NombreActividad { get; set; } = string.Empty;
    public string TipoActividad { get; set; } = "Actividad";
    public decimal Ponderacion { get; set; }
    public DateTime? FechaPublicacion { get; set; }
    public DateTime? FechaLimite { get; set; }
    public string? Descripcion { get; set; }
    public string? Especificacion { get; set; }
    public bool IncluirAutoevaluacion { get; set; }
    public bool IncluirCoevaluacion { get; set; }
    public decimal PonderacionAutoevaluacion { get; set; }
    public decimal PonderacionCoevaluacion { get; set; }
    public bool EsModulo { get; set; }
}

/// <summary>
/// Request para crear sub-actividad desde ActivityManager
/// </summary>
public class CrearSubActividadRequest
{
    public int IdActividad { get; set; }
    public string NombreSubActividad { get; set; } = string.Empty;
    public string TipoSubActividad { get; set; } = "Subactividad"; // Numerada, Autoevaluacion, Coevaluacion, Porcentaje, PruebaObjetiva, ActividadModulo, RecuperacionModulo
    public decimal Ponderacion { get; set; }
    public int Orden { get; set; } = 1;
    public int NumeroOrden { get; set; } = 0;
    public bool EsVertical { get; set; } = false;
}

/// <summary>
/// Estructura completa de actividad para ActivityManager
/// </summary>
public class ActividadEstructuraDTO
{
    public int IdActividad { get; set; }
    public int? IdMateria { get; set; }
    public int? IdEspecialidad { get; set; }
    public int IdClase { get; set; }
    public int IdDocente { get; set; }
    public int? IdPeriodo { get; set; }
    public string NombreActividad { get; set; } = string.Empty;
    public string TipoActividad { get; set; } = string.Empty;
    public decimal Ponderacion { get; set; }
    public DateTime FechaPublicacion { get; set; }
    public DateTime FechaLimite { get; set; }
    public string? Descripcion { get; set; }
    public string? Especificacion { get; set; }
    public string Estado { get; set; } = "Activo";
    public bool IncluirAutoevaluacion { get; set; }
    public bool IncluirCoevaluacion { get; set; }
    public decimal PonderacionAutoevaluacion { get; set; }
    public decimal PonderacionCoevaluacion { get; set; }
    public bool EsModulo { get; set; }
    public int NumeroOrden { get; set; }
    public bool PonderacionValida { get; set; }
    public List<SubActividadEstructuraDTO> SubActividades { get; set; } = new();
    public decimal TotalPonderacionSub { get; set; }
    public bool SubPonderacionesValidas { get; set; }
}

/// <summary>
/// Estructura completa de sub-actividad para ActivityManager
/// </summary>
public class SubActividadEstructuraDTO
{
    public int IdSubActividad { get; set; }
    public int IdActividad { get; set; }
    public string NombreSubActividad { get; set; } = string.Empty;
    public string TipoSubActividad { get; set; } = string.Empty;
    public decimal Ponderacion { get; set; }
    public int Orden { get; set; }
    public int NumeroOrden { get; set; }
    public bool EsVertical { get; set; }
    public string NombreDisplay { get; set; } = string.Empty;
    public string CssClass { get; set; } = string.Empty;
    public bool LlevaNota { get; set; }
    public bool EsAutoevaluacion { get; set; }
    public bool EsCoevaluacion { get; set; }
    public bool EsPorcentajeFinal { get; set; }
    public bool EsPruebaObjetiva { get; set; }
    public bool EsNumerada { get; set; }
    public bool EsActividadModulo { get; set; }
    public bool EsRecuperacionModulo { get; set; }
    public string Icono { get; set; } = string.Empty;
}

/// <summary>
/// Respuesta de estructura completa para ActivityManager
/// </summary>
public class EstructuraCompletaResponse
{
    public List<ActividadEstructuraDTO> Actividades { get; set; } = new();
    public decimal TotalPonderacionActividades { get; set; }
    public decimal PonderacionRestante { get; set; }
    public bool EsValidaTotal { get; set; }
    public bool EsModulo { get; set; }
    public string? NombreMateria { get; set; }
    public string? NombreEspecialidad { get; set; }
    public string NombreClase { get; set; } = string.Empty;
    public int? IdPeriodo { get; set; }
    public string? NombrePeriodo { get; set; }
    public int? AnioLectivo { get; set; }
}

/// <summary>
/// Request para crear estructura predeterminada INA
/// </summary>
public class CrearEstructuraPredeterminadaRequest
{
    public int? IdMateria { get; set; }
    public int? IdEspecialidad { get; set; }
    public int IdClase { get; set; }
    public int? IdDocente { get; set; }
    public int? IdPeriodo { get; set; }
}

/// <summary>
/// Request para redistribuir ponderaciones
/// </summary>
public class RedistribuirPonderacionesRequest
{
    public int? IdMateria { get; set; }
    public int? IdEspecialidad { get; set; }
    public int IdClase { get; set; }
    public int IdDocente { get; set; }
    public int? IdPeriodo { get; set; }
}

/// <summary>
/// Request para reordenar actividades (drag & drop)
/// </summary>
public class ReordenarActividadesRequest
{
    public List<int> IdsActividadEnOrden { get; set; } = new();
}

/// <summary>
/// Request para reordenar sub-actividades (drag & drop)
/// </summary>
public class ReordenarSubActividadesRequest
{
    public List<int> IdsSubActividadEnOrden { get; set; } = new();
}