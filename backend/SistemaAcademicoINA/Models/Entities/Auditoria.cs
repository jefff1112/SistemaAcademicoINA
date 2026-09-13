// Modelo de entidad: registro de auditoría general; traza las acciones
// realizadas por los usuarios del sistema (quién, qué, cuándo y desde dónde).
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("auditoria")]
public class Auditoria
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_auditoria")]
    public int IdAuditoria { get; set; }

    [Column("usuario")]
    public string Usuario { get; set; } = string.Empty;

    [Column("accion")]
    public string Accion { get; set; } = string.Empty;

    [Column("detalle")]
    public string? Detalle { get; set; }

    [Column("ip")]
    public string? Ip { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}