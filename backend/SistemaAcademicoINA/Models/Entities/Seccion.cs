// Modelo de entidad: catálogo de secciones (A, B, C, etc.)
// utilizadas para agrupar clases.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("secciones")]
public class Seccion
{
    [Key]
    [Column("id_seccion")]
    public int IdSeccion { get; set; }

    [Column("nombre_seccion")]
    public string NombreSeccion { get; set; } = string.Empty;

    [Column("estado")]
    public bool Estado { get; set; } = true;
}