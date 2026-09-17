// Modelo de entidad: reporte de un dato incorrecto del estudiante,
// enviado por el propio estudiante durante la activación de su cuenta.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("reportes_datos_estudiante")]
public class ReporteDatoEstudiante
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("estudiante_id")]
    public int EstudianteId { get; set; }

    [Column("campo")]
    public string Campo { get; set; } = string.Empty;

    [Column("valor_actual")]
    public string? ValorActual { get; set; }

    [Column("valor_propuesto")]
    public string ValorPropuesto { get; set; } = string.Empty;

    [Column("comentario")]
    public string? Comentario { get; set; }

    // Pendiente / EnRevision / Aprobado / Rechazado
    [Column("estado")]
    public string Estado { get; set; } = "Pendiente";

    [Column("motivo_rechazo")]
    public string? MotivoRechazo { get; set; }

    [Column("resuelto_por")]
    public int? ResueltoPor { get; set; }

    [Column("fecha_creacion")]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;

    [Column("fecha_resolucion")]
    public DateTime? FechaResolucion { get; set; }

    // Relaciones de navegación.
    [ForeignKey("EstudianteId")]
    public virtual Estudiante? Estudiante { get; set; }

    [ForeignKey("ResueltoPor")]
    public virtual Usuario? ResueltoPorUsuario { get; set; }
}