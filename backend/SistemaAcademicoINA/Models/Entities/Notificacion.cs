// Modelo de entidad: notificaciones internas y/o por correo
// dirigidas a los usuarios del sistema.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("notificaciones")]
public class Notificacion
{
    [Key]
    [Column("id_notificacion")]
    public int IdNotificacion { get; set; }

    [Column("titulo")]
    public string Titulo { get; set; } = string.Empty;

    [Column("mensaje")]
    public string Mensaje { get; set; } = string.Empty;

    [Column("leida")]
    public bool Leida { get; set; }

    [Column("tipo")]
    public string Tipo { get; set; } = "interna";

    [Column("destinatario_email")]
    public string? DestinatarioEmail { get; set; }

    [Column("fecha_programada")]
    public DateTime? FechaProgramada { get; set; }

    [Column("fecha_envio")]
    public DateTime? FechaEnvio { get; set; }

    [Column("archivo_adjunto")]
    public string? ArchivoAdjunto { get; set; }

    [Column("creado_por")]
    public int? CreadoPor { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}