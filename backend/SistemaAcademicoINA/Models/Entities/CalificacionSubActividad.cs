// Modelo de entidad: calificación de un estudiante en una sub-actividad específica
// Soporta nota original, nota de recuperación, y observaciones
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("calificaciones_sub_actividades")]
public class CalificacionSubActividad
{
    [Key]
    [Column("id_calificacion_sub")]
    public int IdCalificacionSub { get; set; }

    [Column("id_sub_actividad")]
    public int IdSubActividad { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("nota")]
    public decimal? Nota { get; set; }

    [Column("nota_recuperacion")]
    public decimal? NotaRecuperacion { get; set; }

    [Column("observaciones")]
    public string? Observaciones { get; set; }

    [Column("registrado_por")]
    public int? RegistradoPor { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("fecha_modificacion")]
    public DateTime? FechaModificacion { get; set; }

    // Navegación
    [ForeignKey(nameof(IdSubActividad))]
    public virtual SubActividad? SubActividad { get; set; }

    [ForeignKey(nameof(IdEstudiante))]
    public virtual Estudiante? Estudiante { get; set; }

    // ============================================================
    // PROPIEDADES CALCULADAS
    // ============================================================

    /// <summary>
    /// Nota efectiva: si hay recuperación, usa la recuperación; si no, usa la nota original
    /// </summary>
    [NotMapped]
    public decimal NotaEfectiva
    {
        get
        {
            if (NotaRecuperacion.HasValue && NotaRecuperacion > 0)
                return NotaRecuperacion.Value;
            return Nota ?? 0;
        }
    }

    /// <summary>
    /// Indica si la calificación fue modificada (tiene recuperación)
    /// </summary>
    [NotMapped]
    public bool TieneRecuperacion => NotaRecuperacion.HasValue && NotaRecuperacion > 0;

    /// <summary>
    /// Indica si tiene nota registrada (original o recuperación)
    /// </summary>
    [NotMapped]
    public bool TieneNota => Nota.HasValue || (NotaRecuperacion.HasValue && NotaRecuperacion > 0);
}
