// Modelo de entidad: faltas disciplinarias y amonestaciones
// aplicadas a los estudiantes con su gravedad y puntos de demérito.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("faltas_amonestaciones")]
public class FaltaAmonestacion
{
    [Key]
    [Column("id_faltas")]
    public int IdFaltas { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("id_docente")]
    public int? IdDocente { get; set; }

    [Column("tipo")]
    public string Tipo { get; set; } = string.Empty;

    [Column("gravedad")]
    public string Gravedad { get; set; } = "Leve";

    [Column("fecha")]
    public DateTime Fecha { get; set; }

    [Column("id_periodo")]
    public int? IdPeriodo { get; set; }

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("puntos_demerito")]
    public int PuntosDemerito { get; set; }

    [Column("estado")]
    public string Estado { get; set; } = "Activa";
}