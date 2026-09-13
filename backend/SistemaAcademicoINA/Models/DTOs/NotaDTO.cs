// DTOs de notas: modelos de transferencia para consultar notas finales, notas
// por periodo, actividades académicas y cuadros resumen de rendimiento.
namespace SistemaAcademicoINA.Models.DTOs;

// DTO de respuesta: nota final de un estudiante por materia, con su estado (aprobada/reprobada).
public class NotaFinalDTO
{
    public int IdEstudiante { get; set; }
    public string Estudiante { get; set; } = string.Empty;
    public string CodigoEstudiante { get; set; } = string.Empty;
    public string NombreMateria { get; set; } = string.Empty;
    public string TipoMateria { get; set; } = string.Empty;
    public decimal NotaFinal { get; set; }
    public string Estado { get; set; } = string.Empty;
}

// DTO de respuesta: nota acumulada de un estudiante en un periodo específico.
public class NotaPeriodoDTO
{
    public int IdPeriodo { get; set; }
    public int NumeroPeriodo { get; set; }
    public string NombrePeriodo { get; set; } = string.Empty;
    public decimal NotaAcumulada { get; set; }
}

// DTO de respuesta: datos de una actividad académica publicada (ponderación, fechas y descripción).
public class ActividadDTO
{
    public int IdActividad { get; set; }
    public string NombreActividad { get; set; } = string.Empty;
    public string TipoActividad { get; set; } = string.Empty;
    public decimal Ponderacion { get; set; }
    public DateTime FechaPublicacion { get; set; }
    public DateTime FechaLimite { get; set; }
    public string? Descripcion { get; set; }
}

// DTO de respuesta: calificación obtenida por un estudiante en una actividad.
public class CalificacionActividadDTO
{
    public int IdCalificacion { get; set; }
    public int IdActividad { get; set; }
    public int IdEstudiante { get; set; }
    public string Estudiante { get; set; } = string.Empty;
    public decimal Nota { get; set; }
    public string? Observaciones { get; set; }
    public int? RegistradoPor { get; set; }
}

// DTO de respuesta: cuadro resumen de calificaciones por materia principal
// y promedio general del estudiante con su condición final.
public class CuadroResumenDTO
{
    public int IdEstudiante { get; set; }
    public string CodigoEstudiante { get; set; } = string.Empty;
    public string Estudiante { get; set; } = string.Empty;
    public decimal? Matematica { get; set; }
    public decimal? Lenguaje { get; set; }
    public decimal? Ciencias { get; set; }
    public decimal? Ingles { get; set; }
    public decimal? Historia { get; set; }
    public decimal PromedioGeneral { get; set; }
    public string Condicion { get; set; } = string.Empty;
}