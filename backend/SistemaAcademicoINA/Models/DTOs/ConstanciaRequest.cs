// DTO para recibir los datos de una constancia desde el formulario frontend.
using System.ComponentModel.DataAnnotations;

namespace SistemaAcademicoINA.Models.DTOs;

public class ConstanciaRequest
{
    [Required]
    public int IdEstudiante { get; set; }

    [Required]
    public string Tipo { get; set; } = "Estudio";

    public string? Motivo { get; set; }

    public DateTime? FechaInicio { get; set; }

    public int? CantidadDias { get; set; }

    public bool TrajoDocumento { get; set; }

    public bool EncargadoPresente { get; set; }

    public bool PermisoAsistencias { get; set; }

    [MaxLength(500)]
    public string? Observaciones { get; set; }

    public IFormFile? Documento { get; set; }
}