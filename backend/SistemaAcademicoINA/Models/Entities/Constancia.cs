// Modelo de entidad: constancias emitidas a estudiantes (estudio, conducta o incapacidad/permiso).
// La genera el personal (dirección/registro/admin); el estudiante solo la consulta.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("constancias")]
public class Constancia
{
    [Key]
    [Column("id_constancia")]
    public int IdConstancia { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    public Estudiante? Estudiante { get; set; }

    // Tipo de constancia: "Estudio", "Conducta" o "Incapacidad".
    [Column("tipo")]
    public string Tipo { get; set; } = "Estudio";

    [Column("motivo")]
    public string? Motivo { get; set; }

    [Column("fecha_inicio")]
    public DateTime? FechaInicio { get; set; }

    [Column("cantidad_dias")]
    public int? CantidadDias { get; set; }

    [Column("fecha_fin")]
    public DateTime? FechaFin { get; set; }

    // Ruta relativa del documento adjunto (ej: /uploads/constancias/{id}/{archivo}).
    [Column("documento")]
    public string? Documento { get; set; }

    [Column("nombre_archivo")]
    public string? NombreArchivo { get; set; }

    [Column("trajo_documento")]
    public bool TrajoDocumento { get; set; }

    [Column("encargado_presente")]
    public bool EncargadoPresente { get; set; }

    // Si es true, las asistencias del rango de fechas se marcan automáticamente como Justificado.
    [Column("permiso_asistencias")]
    public bool PermisoAsistencias { get; set; }

    [Column("fecha_emision")]
    public DateTime FechaEmision { get; set; } = DateTime.Now;

    // Código del usuario que generó la constancia.
    [Column("generada_por")]
    public string? GeneradaPor { get; set; }

    // Estado: "Activa" o "Anulada".
    [Column("estado")]
    public string Estado { get; set; } = "Activa";

    [Column("observaciones")]
    public string? Observaciones { get; set; }
}