// ============================================================
// Models/Entities/ConductaPeriodo.cs - VERSIÓN CORREGIDA
// ============================================================
// Modelo de entidad: calificación de conducta de un estudiante por periodo académico.
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("conducta_periodos")]
public class ConductaPeriodo
{
    [Key]
    [Column("id_conducta")]
    public int IdConducta { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("id_periodo")]
    public int IdPeriodo { get; set; }

    [Column("calificacion_conducta")]
    public string CalificacionConducta { get; set; } = string.Empty;

    [Column("observaciones")]
    public string? Observaciones { get; set; }

    [Column("registrado_por")]
    public int? RegistradoPor { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // ✅ RELACIONES CORRECTAS
    [ForeignKey(nameof(IdEstudiante))]
    public virtual Estudiante? Estudiante { get; set; }

    [ForeignKey(nameof(IdPeriodo))]
    public virtual PeriodoAcademico? Periodo { get; set; }
}