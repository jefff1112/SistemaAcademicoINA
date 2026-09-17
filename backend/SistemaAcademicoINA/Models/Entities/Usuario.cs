// Modelo de entidad: cuentas de usuario del sistema con sus
// credenciales de acceso y el rol asignado.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("usuarios")]
public class Usuario
{
    [Key]
    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Column("codigo")]
    public string Codigo { get; set; } = string.Empty;

    [Column("nombres")]
    public string Nombres { get; set; } = string.Empty;

    [Column("apellidos")]
    public string Apellidos { get; set; } = string.Empty;

    [Column("correo")]
    public string? Correo { get; set; }

    [Column("contrasena")]
    public string? Contrasena { get; set; }

    [Column("rol_id")]
    public int RolId { get; set; }

    [Column("estado")]
    public bool Estado { get; set; } = true;

    // PendienteActivacion / PendienteEnvioManual / EsperaActivacion / Activo
    [Column("estado_activacion")]
    public string? EstadoActivacion { get; set; }

    [ForeignKey("RolId")]
    public virtual Rol? Rol { get; set; }
}