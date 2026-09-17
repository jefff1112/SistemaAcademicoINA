// DTOs del módulo de reportes de datos incorrectos del estudiante.
using System.ComponentModel.DataAnnotations;

namespace SistemaAcademicoINA.Models.DTOs;

// Request: crear uno o varios reportes desde la página de activación.
public class CrearReportesRequest
{
    [Required(ErrorMessage = "El token es obligatorio")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe enviar al menos un reporte")]
    [MinLength(1, ErrorMessage = "Debe enviar al menos un reporte")]
    public List<ReporteDatoDto> Reportes { get; set; } = new();
}

// Un reporte individual: campo reportado y valor corregido propuesto.
public class ReporteDatoDto
{
    [Required(ErrorMessage = "El campo es obligatorio")]
    public string Campo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El valor correcto es obligatorio")]
    public string ValorCorrecto { get; set; } = string.Empty;

    public string? Comentario { get; set; }
}

// Request: rechazar un reporte (motivo obligatorio).
public class RechazarReporteRequest
{
    [Required(ErrorMessage = "El motivo de rechazo es obligatorio")]
    public string Motivo { get; set; } = string.Empty;
}