// Modelo de entidad: registro de intentos de inicio de sesión,
// útil para detectar accesos fallidos o sospechosos.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("intentos_login")]
public class IntentoLogin
{
    [Key]
    [Column("id_intento")]
    public int IdIntento { get; set; }

    [Column("codigo")]
    public string Codigo { get; set; } = string.Empty;

    [Column("ip")]
    public string? Ip { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; }

    [Column("exitoso")]
    public bool Exitoso { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}