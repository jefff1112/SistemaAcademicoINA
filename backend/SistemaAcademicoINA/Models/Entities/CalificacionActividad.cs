// Modelo de entidad: calificación obtenida por un estudiante
// en una actividad académica específica.
// Soporta: nota original, nota_calculada (auto), nota_manual (docente), nota_recuperacion
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("calificaciones_actividades")]
public class CalificacionActividad
{
    [Key]
    [Column("id_calificacion")]
    public int IdCalificacion { get; set; }

    [Column("id_actividad")]
    public int IdActividad { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("nota")]
    public decimal? Nota { get; set; }

    [Column("nota_calculada")]
    public decimal? NotaCalculada { get; set; }

    [Column("nota_manual")]
    public decimal? NotaManual { get; set; }

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

    // Relaciones de navegación
    [ForeignKey("IdActividad")]
    public virtual Actividad? Actividad { get; set; }

    [ForeignKey("IdEstudiante")]
    public virtual Estudiante? Estudiante { get; set; }

    // ============================================================
    // PROPIEDADES CALCULADAS
    // ============================================================

    /// <summary>
    /// Nota efectiva con prioridad: Recuperación > Manual > Calculada > Original
    /// </summary>
    [NotMapped]
    public decimal NotaEfectiva
    {
        get
        {
            if (NotaRecuperacion.HasValue && NotaRecuperacion > 0)
                return NotaRecuperacion.Value;
            if (NotaManual.HasValue)
                return NotaManual.Value;
            if (NotaCalculada.HasValue)
                return NotaCalculada.Value;
            return Nota ?? 0;
        }
    }

    /// <summary>
    /// Indica si la nota fue sobrescrita manualmente
    /// </summary>
    [NotMapped]
    public bool EsNotaManual => NotaManual.HasValue;

    /// <summary>
    /// Indica si tiene nota de recuperación
    /// </summary>
    [NotMapped]
    public bool TieneRecuperacion => NotaRecuperacion.HasValue && NotaRecuperacion > 0;
}
