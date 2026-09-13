// Modelo de entidad: nota final consolidada de cada estudiante
// por materia en un año lectivo, con su estado.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("resultados_finales")]
public class ResultadoFinal
{
    [Key]
    [Column("id_resultado_final")]
    public int IdResultadoFinal { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("id_materia")]
    public int IdMateria { get; set; }

    [Column("id_clase")]
    public int IdClase { get; set; }

    [Column("anio_lectivo")]
    public int AnioLectivo { get; set; }

    [Column("nota_final")]
    public decimal NotaFinal { get; set; }

    [Column("estado_materia")]
    public string EstadoMateria { get; set; } = "Pendiente";

    // Relaciones de navegación
    [ForeignKey("IdEstudiante")]
    public virtual Estudiante? Estudiante { get; set; }

    [ForeignKey("IdMateria")]
    public virtual Materia? Materia { get; set; }
}