// Modelo de entidad: historial de cambios de contraseña de los
// usuarios, para controlar la reutilización de credenciales.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("historial_contrasenas")]
public class HistorialContrasena
{
    [Key]
    [Column("id_historial")]
    public int IdHistorial { get; set; }

    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Column("contrasena_anterior")]
    public string ContrasenaAnterior { get; set; } = string.Empty;

    [Column("contrasena_nueva")]
    public string ContrasenaNueva { get; set; } = string.Empty;

    [Column("ip")]
    public string? Ip { get; set; }

    [Column("fecha_cambio")]
    public DateTime FechaCambio { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}