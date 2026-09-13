// Modelo de entidad: grados académicos (1er, 2do, 3er año, etc.)
// que componen un nivel académico.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("grados")]
public class Grado
{
    [Key]
    [Column("id_grados")]
    public int IdGrados { get; set; }

    [Column("id_nivel")]
    public int IdNivel { get; set; }

    [Column("numero_grado")]
    public int NumeroGrado { get; set; }

    [Column("nombre_grado")]
    public string NombreGrado { get; set; } = string.Empty;

    [Column("orden")]
    public int Orden { get; set; }

    [Column("estado")]
    public bool Estado { get; set; } = true;

    [ForeignKey("IdNivel")]
    public virtual NivelAcademico? Nivel { get; set; }
}