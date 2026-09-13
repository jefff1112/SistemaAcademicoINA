// Modelo de entidad: almacén de claves/valores en caché del sistema
// con fecha de creación y expiración.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("cache_sistema")]
public class CacheSistema
{
    [Key]
    [Column("id_cache")]
    public int IdCache { get; set; }

    [Column("clave")]
    public string Clave { get; set; } = string.Empty;

    [Column("valor")]
    public string Valor { get; set; } = string.Empty;

    [Column("fecha_creacion")]
    public DateTime FechaCreacion { get; set; }

    [Column("fecha_expiracion")]
    public DateTime? FechaExpiracion { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}