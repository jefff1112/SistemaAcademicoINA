// Modelo de entidad: avisos internos publicados en el sistema (comunicados,
// circulares), con prioridad, vigencia y estado de publicación.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("avisos_internos")]
public class AvisoInterno
{
    [Key]
    [Column("id_aviso")]
    public int IdAviso { get; set; }

    [Column("titulo")]
    public string Titulo { get; set; } = string.Empty;

    [Column("contenido")]
    public string Contenido { get; set; } = string.Empty;

    [Column("prioridad")]
    public string Prioridad { get; set; } = "media";

    [Column("activo")]
    public bool Activo { get; set; } = true;

    [Column("fecha_inicio")]
    public DateTime? FechaInicio { get; set; }

    [Column("fecha_fin")]
    public DateTime? FechaFin { get; set; }

    [Column("creado_por")]
    public int? CreadoPor { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}