// Modelo de entidad: detalle de actividad dentro de una plantilla
// Soporta: autoevaluación, coevaluación con ponderaciones configurables
// Estructura exacta del Excel INA para plantilla predeterminada
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace SistemaAcademicoINA.Models.Entities;

[Table("actividad_plantilla_detalle")]
public class ActividadPlantillaDetalle
{
    [Key]
    [Column("id_detalle")]
    public int IdDetalle { get; set; }

    [Column("id_plantilla")]
    public int IdPlantilla { get; set; }

    [Column("orden_actividad")]
    public int OrdenActividad { get; set; }

    [Column("nombre_actividad")]
    [Required]
    [MaxLength(200)]
    public string NombreActividad { get; set; } = string.Empty;

    [Column("tipo_actividad")]
    [MaxLength(50)]
    public string TipoActividad { get; set; } = "Actividad";

    [Column("ponderacion_actividad")]
    public decimal PonderacionActividad { get; set; }

    [Column("incluir_autoevaluacion")]
    public bool IncluirAutoevaluacion { get; set; } = false;

    [Column("incluir_coevaluacion")]
    public bool IncluirCoevaluacion { get; set; } = false;

    [Column("ponderacion_autoevaluacion")]
    public decimal? PonderacionAutoevaluacion { get; set; }

    [Column("ponderacion_coevaluacion")]
    public decimal? PonderacionCoevaluacion { get; set; }

    [Column("es_modulo")]
    public bool EsModulo { get; set; } = false;

    [Column("numero_orden")]
    public int NumeroOrden { get; set; } = 0;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    // Navegación
    [ForeignKey(nameof(IdPlantilla))]
    public virtual ActividadPlantilla? Plantilla { get; set; }

    public virtual ICollection<SubActividadPlantillaDetalle> DetallesSubActividades { get; set; } = new List<SubActividadPlantillaDetalle>();
}
