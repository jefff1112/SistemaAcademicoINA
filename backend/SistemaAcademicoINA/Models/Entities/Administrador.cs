// Modelo de entidad: representa las cuentas de administración del sistema.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("administradores")]
public class Administrador
{
    [Key]
    [Column("id_admin")]
    public int IdAdmin { get; set; }

    [Column("usuario")]
    public string Usuario { get; set; } = string.Empty;

    [Column("contraseña")]
    public string Contraseña { get; set; } = string.Empty;

    [Column("nombre_completo")]
    public string? NombreCompleto { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("id_rol")]
    public int? IdRol { get; set; }

    // Relación: rol con el que opera el administrador en el sistema.
    [ForeignKey("IdRol")]
    public virtual Rol? Rol { get; set; }
}