// Modelo de entidad: catálogo de materias con su escala de
// calificación (máxima, mínima y nota mínima aprobatoria).
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("materias")]
public class Materia
{
    [Key]
    [Column("id_materia")]
    public int IdMateria { get; set; }

    [Column("nombre_materia")]
    public string NombreMateria { get; set; } = string.Empty;

    [Column("codigo_materia")]
    public string? CodigoMateria { get; set; }

    [Column("tipo_materia")]
    public string TipoMateria { get; set; } = "Basica";

    [Column("escala_maxima")]
    public decimal EscalaMaxima { get; set; } = 100;

    [Column("escala_minima")]
    public decimal EscalaMinima { get; set; } = 0;

    [Column("nota_minima")]
    public decimal NotaMinima { get; set; } = 6;

    [Column("decimales_permitidos")]
    public int DecimalesPermitidos { get; set; }

    [Column("id_especialidad")]
    public int? IdEspecialidad { get; set; }

    [Column("estado")]
    public bool Estado { get; set; } = true;

    [ForeignKey("IdEspecialidad")]
    public virtual Especialidad? Especialidad { get; set; }
}