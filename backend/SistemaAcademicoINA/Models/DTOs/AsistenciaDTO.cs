// DTOs de asistencia: modelos de transferencia para consultar, registrar,
// detallar, resumir y justificar las asistencias de los estudiantes.
namespace SistemaAcademicoINA.Models.DTOs;

// DTO de respuesta: muestra el estado de asistencia de cada estudiante en un listado (ej. toma de lista).
public class AsistenciaEstudianteDTO
{
    public int IdEstudiante { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Estado { get; set; } = "Pendiente";
    public TimeSpan? HoraRegistro { get; set; }
    public string? Observaciones { get; set; }
}

// DTO de request: datos necesarios para registrar la asistencia de un estudiante en una clase.
public class RegistrarAsistenciaDTO
{
    public int IdEstudiante { get; set; }
    public int IdClase { get; set; }
    public int? IdMateria { get; set; }
    public int IdDocente { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = "Presente";
    public TimeSpan? HoraRegistro { get; set; }
    public int? MinutosTarde { get; set; }
    public string? Observaciones { get; set; }
}

// DTO de respuesta: detalle de un registro de asistencia, incluida su justificación.
public class AsistenciaDetalleDTO
{
    public int IdAsistencia { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = string.Empty;
    public TimeSpan HoraRegistro { get; set; }
    public int? MinutosTarde { get; set; }
    public string? Justificacion { get; set; }
    public string? JustificadoPor { get; set; }
    public DateTime? FechaJustificacion { get; set; }
    public string? Observaciones { get; set; }
}

// DTO de respuesta: resumen de asistencia por periodo (total de días, presentes,
// ausencias, tardanzas, justificadas y porcentaje de asistencia).
public class AsistenciaResumenDTO
{
    public int Periodo { get; set; }
    public int TotalDias { get; set; }
    public int Presentes { get; set; }
    public int Ausencias { get; set; }
    public int Tardanzas { get; set; }
    public int Justificadas { get; set; }
    public decimal PorcentajeAsistencia { get; set; }
}

// DTO de request: datos para justificar una asistencia previamente registrada.
public class JustificarAsistenciaDTO
{
    public int IdAsistencia { get; set; }
    public string TipoJustificacion { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string SolicitadoPor { get; set; } = string.Empty;
    public string? DocumentoAdjunto { get; set; }
    public string JustificadoPor { get; set; } = string.Empty;
}