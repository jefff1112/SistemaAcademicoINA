// Modelo de entidad: sesiones de los usuarios (activas o finalizadas)
// con token, IP y fechas de inicio/fin.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("sesiones_usuarios")]
public class SesionUsuario
{
    [Key]
    [Column("id_sesion")]
    public int IdSesion { get; set; }

    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Column("usuario")]
    public string Usuario { get; set; } = string.Empty;

    [Column("token")]
    public string? Token { get; set; }

    [Column("ip")]
    public string? Ip { get; set; }

    [Column("fecha_inicio")]
    public DateTime FechaInicio { get; set; }

    [Column("fecha_fin")]
    public DateTime? FechaFin { get; set; }

    [Column("activa")]
    public bool Activa { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}