using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("contenido_publico")]
public class ContenidoPublico
{
	[Key]
	[Column("id_contenido")]
	public int IdContenido { get; set; }

	[Column("pagina")]
	[MaxLength(50)]
	public string Pagina { get; set; } = "";

	[Column("seccion")]
	[MaxLength(100)]
	public string Seccion { get; set; } = "";

	[Column("titulo")]
	[MaxLength(200)]
	public string? Titulo { get; set; }

	[Column("contenido")]
	public string? Contenido { get; set; }

	[Column("imagen_url")]
	[MaxLength(500)]
	public string? ImagenUrl { get; set; }

	[Column("orden")]
	public int Orden { get; set; } = 0;

	[Column("activo")]
	public bool Activo { get; set; } = true;

	[Column("fecha_modificacion")]
	public DateTime FechaModificacion { get; set; } = DateTime.Now;

	[Column("modificado_por")]
	[MaxLength(100)]
	public string? ModificadoPor { get; set; }

    [Column("imagen_config")]
    [MaxLength(500)]
    public string? ImagenConfig { get; set; }
}