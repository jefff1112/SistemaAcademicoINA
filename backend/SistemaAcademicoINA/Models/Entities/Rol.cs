// Modelo de entidad: roles del sistema (admin, docente, estudiante,
// etc.) con su nivel de acceso.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("roles")]
public class Rol
{
    [Key]
    [Column("id_rol")]
    public int IdRol { get; set; }

    [Column("nombre_rol")]
    public string NombreRol { get; set; } = string.Empty;

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("nivel_acceso")]
    public int NivelAcceso { get; set; }

    [Column("estado")]
    public bool Estado { get; set; } = true;
}