// Modelo de entidad: registro de auditoría de las acciones realizadas por
// los usuarios sobre actividades (crear, editar, eliminar, etc.).
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("actividad_usuarios")]
public class ActividadUsuario
{
    [Key]
    [Column("id_actividad")]
    public int IdActividad { get; set; }

    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Column("usuario")]
    public string Usuario { get; set; } = string.Empty;

    [Column("accion")]
    public string Accion { get; set; } = string.Empty;

    [Column("modulo")]
    public string Modulo { get; set; } = string.Empty;

    [Column("detalle")]
    public string? Detalle { get; set; }

    [Column("ip")]
    public string? Ip { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}