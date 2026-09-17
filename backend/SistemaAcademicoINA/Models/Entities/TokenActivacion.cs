// Modelo de entidad: token de activación de cuenta de un solo uso,
// generado al aceptar la matrícula de un estudiante de nuevo ingreso.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("tokens_activacion")]
public class TokenActivacion
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("usuario_id")]
    public int UsuarioId { get; set; }

    [Column("token")]
    public string Token { get; set; } = string.Empty;

    [Column("fecha_creacion")]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;

    [Column("fecha_expiracion")]
    public DateTime FechaExpiracion { get; set; }

    [Column("usado")]
    public bool Usado { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Relación: usuario (estudiante) al que pertenece este token.
    [ForeignKey("UsuarioId")]
    public virtual Usuario? Usuario { get; set; }
}