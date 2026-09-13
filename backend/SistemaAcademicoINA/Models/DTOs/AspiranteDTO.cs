// DTOs de aspirantes: modelos de transferencia del proceso de admisión
// (registro de examen, asignación de cupos, aprobación o rechazo de solicitudes).
namespace SistemaAcademicoINA.Models.DTOs;

// DTO de request: registro de la nota del examen de admisión del aspirante.
public class RegistrarNotaExamenDTO
{
    public int IdAspirante { get; set; }
    public decimal NotaExamen { get; set; }
}

// DTO de request: asignación o actualización de cupos por especialidad.
public class AsignarCuposDTO
{
    public int IdEspecialidad { get; set; }
    public int Cupos { get; set; }
}

// DTO de request: aprobación de un aspirante con asignación de clase y responsable.
public class AprobarAspiranteDTO
{
    public int IdAspirante { get; set; }
    public int IdClaseAsignada { get; set; }
    public string AprobadoPor { get; set; } = string.Empty;
}

// DTO de request: rechazo de la solicitud de un aspirante, con responsable y motivo.
public class RechazarAspiranteDTO
{
    public string RechazadoPor { get; set; } = string.Empty;
    public string Motivo { get; set; } = string.Empty;
}

// DTO de request: puesta en lista de espera de un aspirante, con observación y responsable de la entrevista.
public class EsperaAspiranteDTO
{
    public string EntrevistadoPor { get; set; } = string.Empty;
    public string Observacion { get; set; } = string.Empty;
}