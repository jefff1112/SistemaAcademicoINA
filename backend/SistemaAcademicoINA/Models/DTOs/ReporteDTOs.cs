// DTOs de reportes: modelos de transferencia con datos agregados para reportes
// de promoción, rendimiento, faltas, horarios, boletas e historial académico.
namespace SistemaAcademicoINA.Models.DTOs;

// DTO de respuesta: datos de promoción de un estudiante de una clase a otra, con su promedio final.
public class PromocionReporteDTO
{
    public int IdEstudiante { get; set; }
    public string CodigoEstudiante { get; set; } = string.Empty;
    public string Estudiante { get; set; } = string.Empty;
    public string ClaseOrigen { get; set; } = string.Empty;
    public string ClaseDestino { get; set; } = string.Empty;
    public decimal PromedioFinal { get; set; }
    public string Estado { get; set; } = string.Empty;
}

// DTO de respuesta: rendimiento general del estudiante (promedio, materias aprobadas/reprobadas y estado final).
public class RendimientoEstudianteDTO
{
    public int IdEstudiante { get; set; }
    public string CodigoEstudiante { get; set; } = string.Empty;
    public string Estudiante { get; set; } = string.Empty;
    public decimal PromedioGeneral { get; set; }
    public int MateriasAprobadas { get; set; }
    public int MateriasReprobadas { get; set; }
    public string EstadoFinal { get; set; } = string.Empty;
}

// DTO de respuesta: detalle de una falta disciplinaria para reportes (tipo, gravedad y puntos de demérito).
public class FaltaReporteDTO
{
    public int IdFalta { get; set; }
    public DateTime Fecha { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string Gravedad { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int PuntosDemerito { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? RegistradoPor { get; set; }
}

// DTO de respuesta: materias asignadas a un docente con permisos de calificación y amonestación.
public class DocenteMateriaDTO
{
    public int IdDocenteMateria { get; set; }
    public int IdMateria { get; set; }
    public string NombreMateria { get; set; } = string.Empty;
    public int IdClase { get; set; }
    public string NombreClase { get; set; } = string.Empty;
    public bool PuedeCalificar { get; set; }
    public bool PuedeAmonestar { get; set; }
}

// DTO de respuesta: horario de un docente por día, horas, clase, materia y aula.
public class HorarioDocenteDTO
{
    public int IdHorario { get; set; }
    public string DiaSemana { get; set; } = string.Empty;
    public TimeSpan HoraInicio { get; set; }
    public TimeSpan HoraFin { get; set; }
    public string NombreClase { get; set; } = string.Empty;
    public string NombreMateria { get; set; } = string.Empty;
    public string Aula { get; set; } = string.Empty;
}

// DTO de respuesta: datos agregados para la boleta impresa de un estudiante
// (notas de matemática, asistencia, conducta y resumen de materias).
public class BoletaEstudianteDTO
{
    public int IdEstudiante { get; set; }
    public string CodigoEstudiante { get; set; } = string.Empty;
    public string Nie { get; set; } = string.Empty;
    public string Estudiante { get; set; } = string.Empty;
    public string NombreClase { get; set; } = string.Empty;
    public string Seccion { get; set; } = string.Empty;
    public int IdEspecialidad { get; set; }
    public string NombreEspecialidad { get; set; } = string.Empty;
    public int AnioLectivo { get; set; }
    public decimal MatP1 { get; set; }
    public decimal MatP2 { get; set; }
    public decimal MatP3 { get; set; }
    public decimal MatP4 { get; set; }
    public decimal MatNotaFinal { get; set; }
    public string MatEstado { get; set; } = string.Empty;
    public int TotalDias { get; set; }
    public int Presentes { get; set; }
    public int Ausencias { get; set; }
    public int Tardanzas { get; set; }
    public int Justificadas { get; set; }
    public decimal PorcentajeAsistencia { get; set; }
    public string CalificacionConducta { get; set; } = string.Empty;
    public string ConductaObservaciones { get; set; } = string.Empty;
    public int MateriasAprobadas { get; set; }
    public int MateriasReprobadas { get; set; }
    public int MateriasRecuperacion { get; set; }
}

// DTO de respuesta: historial académico del estudiante por periodo, materia y año lectivo.
public class HistorialEstudianteDTO
{
    public int IdEstudiante { get; set; }
    public string CodigoEstudiante { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string NombreClase { get; set; } = string.Empty;
    public string Seccion { get; set; } = string.Empty;
    public int AnioLectivo { get; set; }
    public int NumeroPeriodo { get; set; }
    public string PeriodoNombre { get; set; } = string.Empty;
    public string NombreMateria { get; set; } = string.Empty;
    public decimal NotaPeriodo { get; set; }
    public decimal NotaFinal { get; set; }
    public string EstadoMateria { get; set; } = string.Empty;
    public decimal PorcentajeAsistencia { get; set; }
    public string CalificacionConducta { get; set; } = string.Empty;
}

// DTO de respuesta: calificación de conducta de un estudiante por periodo académico.
public class ConductaPeriodoDTO
{
    public int IdPeriodo { get; set; }
    public int NumeroPeriodo { get; set; }
    public string NombrePeriodo { get; set; } = string.Empty;
    public string CalificacionConducta { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
    public int IdEstudiante { get; set; }
    public int? RegistradoPor { get; set; }
}

// DTO de respuesta: datos de una persona vinculada al estudiante, con su parentesco.
public class RelacionFamiliarDTO
{
    public int IdPersona { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Parentesco { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public bool ViveConEstudiante { get; set; }
    public bool RecibeComunicados { get; set; }
}