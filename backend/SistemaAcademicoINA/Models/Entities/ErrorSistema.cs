// Modelo de entidad: registro de errores del sistema para su
// monitoreo, depuración y posterior resolución.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("errores_sistema")]
public class ErrorSistema
{
    [Key]
    [Column("id_error")]
    public int IdError { get; set; }

    [Column("mensaje")]
    public string Mensaje { get; set; } = string.Empty;

    [Column("stack_trace")]
    public string? StackTrace { get; set; }

    [Column("usuario")]
    public string? Usuario { get; set; }

    [Column("ruta")]
    public string? Ruta { get; set; }

    [Column("ip")]
    public string? Ip { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; }

    [Column("resuelto")]
    public bool Resuelto { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}