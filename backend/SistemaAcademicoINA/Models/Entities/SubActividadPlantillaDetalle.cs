// Modelo de entidad: detalle de sub-actividad dentro de una plantilla de actividad
// Tipos exactos del Excel INA: Numerada, Autoevaluacion, Coevaluacion, Porcentaje, PruebaObjetiva, ActividadModulo, RecuperacionModulo
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("sub_actividad_plantilla_detalle")]
public class SubActividadPlantillaDetalle
{
    [Key]
    [Column("id_sub_detalle")]
    public int IdSubDetalle { get; set; }

    [Column("id_detalle_actividad")]
    public int IdDetalleActividad { get; set; }

    [Column("orden_sub")]
    public int OrdenSub { get; set; }

    [Column("nombre_sub_actividad")]
    [Required]
    [MaxLength(200)]
    public string NombreSubActividad { get; set; } = string.Empty;

    [Column("ponderacion_sub")]
    public decimal PonderacionSub { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("tipo_sub_actividad")]
    [MaxLength(50)]
    public string TipoSubActividad { get; set; } = "Subactividad";

    [Column("es_vertical")]
    public bool EsVertical { get; set; } = false;

    [Column("numero_orden")]
    public int NumeroOrden { get; set; } = 0;

    // Navegación
    [ForeignKey(nameof(IdDetalleActividad))]
    public virtual ActividadPlantillaDetalle? DetalleActividad { get; set; }

    // ============================================================
    // PROPIEDADES CALCULADAS - Tipos exactos del Excel INA
    // ============================================================

    [NotMapped]
    public bool EsAutoevaluacion => TipoSubActividad == "Autoevaluacion";

    [NotMapped]
    public bool EsCoevaluacion => TipoSubActividad == "Coevaluacion";

    [NotMapped]
    public bool EsPorcentajeFinal => TipoSubActividad == "Porcentaje";

    [NotMapped]
    public bool EsPruebaObjetiva => TipoSubActividad == "PruebaObjetiva";

    [NotMapped]
    public bool EsNumerada => TipoSubActividad == "Numerada";

    [NotMapped]
    public bool EsActividadModulo => TipoSubActividad == "ActividadModulo";

    [NotMapped]
    public bool EsRecuperacionModulo => TipoSubActividad == "RecuperacionModulo";

    [NotMapped]
    public bool LlevaNota => PonderacionSub > 0 && !EsAutoevaluacion && !EsCoevaluacion && !EsPorcentajeFinal && !EsRecuperacionModulo;

    [NotMapped]
    public bool EsVerticalCalculado => EsAutoevaluacion || EsCoevaluacion || EsPruebaObjetiva || EsRecuperacionModulo;

    [NotMapped]
    public string NombreDisplay => TipoSubActividad switch
    {
        "Autoevaluacion" => "AUTOEVALUACIÓN",
        "Coevaluacion" => "COEVALUACIÓN",
        "Porcentaje" => $"{PonderacionSub}%",
        "PruebaObjetiva" => $"PRUEBA OBJETIVA {NumeroOrden}",
        "RecuperacionModulo" => "RECUP.",
        "ActividadModulo" => $"ACTIVIDAD {NumeroOrden}",
        "Numerada" => NumeroOrden.ToString(),
        _ => NombreSubActividad
    };
}