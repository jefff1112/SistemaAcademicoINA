// Modelo de entidad: vínculo entre una actividad y un periodo académico,
// con la ponderación específica que la actividad tiene en ese periodo.
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("actividades_periodos")]
public class ActividadesPeriodo
{
    [Key]
    [Column("id_actividad_periodo")]
    public int IdActividadPeriodo { get; set; }

    [Column("id_actividad")]
    public int IdActividad { get; set; }

    [Column("id_periodo")]
    public int IdPeriodo { get; set; }

    [Column("ponderacion_periodo")]
    public decimal PonderacionPeriodo { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Relaciones
    [ForeignKey(nameof(IdActividad))]
    public virtual Actividad? Actividad { get; set; }

    [ForeignKey(nameof(IdPeriodo))]
    public virtual PeriodoAcademico? Periodo { get; set; }
}