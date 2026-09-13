// Modelo de entidad: recuperación por módulo (especialidades técnicas)
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("recuperaciones_modulo")]
public class RecuperacionesModulo
{
    [Key]
    [Column("id_recuperacion_modulo")]
    public int IdRecuperacionModulo { get; set; }

    [Column("id_resultado_periodo")]
    public int IdResultadoPeriodo { get; set; }

    [Column("id_actividad")]
    public int IdActividad { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("id_periodo")]
    public int IdPeriodo { get; set; }

    [Column("id_clase")]
    public int IdClase { get; set; }

    [Column("id_especialidad")]
    public int? IdEspecialidad { get; set; }

    [Column("nota_recuperacion")]
    public decimal? NotaRecuperacion { get; set; }

    [Column("observacion")]
    public string? Observacion { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navegación
    [ForeignKey(nameof(IdActividad))]
    public virtual Actividad? Actividad { get; set; }

    [ForeignKey(nameof(IdEstudiante))]
    public virtual Estudiante? Estudiante { get; set; }

    [ForeignKey(nameof(IdPeriodo))]
    public virtual PeriodoAcademico? Periodo { get; set; }

    [ForeignKey(nameof(IdClase))]
    public virtual Clase? Clase { get; set; }

    [ForeignKey(nameof(IdEspecialidad))]
    public virtual Especialidad? Especialidad { get; set; }
}