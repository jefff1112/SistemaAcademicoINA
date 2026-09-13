// Modelo de entidad: solicitudes de recuperación de contraseña
// con token de verificación y fecha de expiración.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("recuperaciones_contrasena")]
public class RecuperacionContrasena
{
    [Key]
    [Column("id_recuperacion")]
    public int IdRecuperacion { get; set; }

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("token")]
    public string Token { get; set; } = string.Empty;

    [Column("fecha_expiracion")]
    public DateTime FechaExpiracion { get; set; }

    [Column("usado")]
    public bool Usado { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}