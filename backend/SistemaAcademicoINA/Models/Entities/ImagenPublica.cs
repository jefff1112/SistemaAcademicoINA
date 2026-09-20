using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("imagenes_publicas")]
public class ImagenPublica
{
    [Key]
    [Column("id_imagen")]
    public int IdImagen { get; set; }

    [Column("pagina")]
    [MaxLength(50)]
    public string Pagina { get; set; } = "";

    [Column("seccion")]
    [MaxLength(100)]
    public string? Seccion { get; set; }

    [Column("nombre_archivo")]
    [MaxLength(255)]
    public string NombreArchivo { get; set; } = "";

    [Column("ruta")]
    [MaxLength(500)]
    public string Ruta { get; set; } = "";

    [Column("descripcion")]
    [MaxLength(255)]
    public string? Descripcion { get; set; }

    [Column("fecha_subida")]
    public DateTime FechaSubida { get; set; } = DateTime.Now;

    [Column("subida_por")]
    [MaxLength(100)]
    public string? SubidaPor { get; set; }

    [Column("activo")]
    public bool Activo { get; set; } = true;
}