// Modelo de entidad: plantilla de actividades predefinida
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace SistemaAcademicoINA.Models.Entities;

[Table("actividad_plantillas")]
public class ActividadPlantilla
{
    [Key]
    [Column("id_plantilla")]
    public int IdPlantilla { get; set; }

    [Column("nombre_plantilla")]
    [Required]
    [MaxLength(100)]
    public string NombrePlantilla { get; set; } = string.Empty;

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("tipo_materia")]
    [MaxLength(20)]
    public string TipoMateria { get; set; } = "Todas";

    [Column("es_predeterminada")]
    public bool EsPredeterminada { get; set; } = false;

    [Column("estado")]
    public bool Estado { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navegación
    public virtual ICollection<ActividadPlantillaDetalle> DetallesActividades { get; set; } = new List<ActividadPlantillaDetalle>();
}