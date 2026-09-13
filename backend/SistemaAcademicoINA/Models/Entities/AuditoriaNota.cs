// Modelo de entidad: auditoría de cambios de calificaciones; guarda la nota
// anterior y la nueva, junto con el motivo y la fecha del cambio.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("auditoria_notas")]
public class AuditoriaNota
{
    [Key]
    [Column("id_audit_nota")]
    public int IdAuditNota { get; set; }

    [Column("id_calificacion")]
    public int IdCalificacion { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("id_materia")]
    public int? IdMateria { get; set; }

    [Column("id_docente")]
    public int IdDocente { get; set; }

    [Column("nota_anterior")]
    public decimal? NotaAnterior { get; set; }

    [Column("nota_nueva")]
    public decimal? NotaNueva { get; set; }

    [Column("motivo_cambio")]
    public string? MotivoCambio { get; set; }

    [Column("fecha_cambio")]
    public DateTime FechaCambio { get; set; } = DateTime.Now;
}