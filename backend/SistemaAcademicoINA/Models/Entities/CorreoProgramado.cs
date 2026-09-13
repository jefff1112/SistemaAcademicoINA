// Modelo de entidad: correos electrónicos programados para su envío
// posterior (recordatorios, comunicados, notificaciones masivas).
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("correos_programados")]
public class CorreoProgramado
{
    [Key]
    [Column("id_correo")]
    public int IdCorreo { get; set; }

    [Column("destinatario")]
    public string Destinatario { get; set; } = string.Empty;

    [Column("asunto")]
    public string Asunto { get; set; } = string.Empty;

    [Column("mensaje")]
    public string Mensaje { get; set; } = string.Empty;

    [Column("archivo_adjunto")]
    public string? ArchivoAdjunto { get; set; }

    [Column("fecha_programada")]
    public DateTime FechaProgramada { get; set; }

    [Column("enviado")]
    public bool Enviado { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}