// Modelo de entidad: sub-componente evaluable dentro de una Actividad
// Cada Actividad se desglosa en SubActividades con ponderación propia (suma = 100% para las que llevan nota)
// Tipos válidos:
//   - Subactividad: genérica (incluye las numeradas 1-5 por orden)
//   - PruebaObjetiva: examen del período
//   - Autoevaluacion: evaluación propia (texto vertical en cuadro)
//   - Coevaluacion: evaluación entre pares (texto vertical en cuadro)
//   - ActividadModulo: sub-actividad dentro de un módulo/especialidad
//   - RecuperacionModulo: recuperación del módulo (solo si actividad.EsModulo=true)
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("sub_actividades")]
public class SubActividad
{
    [Key]
    [Column("id_sub_actividad")]
    public int IdSubActividad { get; set; }

    [Column("id_actividad")]
    public int IdActividad { get; set; }

    [Column("nombre_sub_actividad")]
    [Required]
    [MaxLength(200)]
    public string NombreSubActividad { get; set; } = string.Empty;

    [Column("tipo_sub_actividad")]
    [MaxLength(50)]
    public string TipoSubActividad { get; set; } = "Subactividad";

    [Column("ponderacion")]
    public decimal Ponderacion { get; set; }

    [Column("orden")]
    public int Orden { get; set; } = 1;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("es_vertical")]
    public bool EsVertical { get; set; } = false;

    [Column("numero_orden")]
    public int NumeroOrden { get; set; } = 0;

    // Navegación
    [ForeignKey(nameof(IdActividad))]
    public virtual Actividad? Actividad { get; set; }

    public virtual ICollection<CalificacionSubActividad> CalificacionesSubActividades { get; set; } = new List<CalificacionSubActividad>();

    // ============================================================
    // PROPIEDADES CALCULADAS - Tipos válidos de sub-actividad
    // ============================================================

    [NotMapped] public bool EsAutoevaluacion => TipoSubActividad == "Autoevaluacion";
    [NotMapped] public bool EsCoevaluacion => TipoSubActividad == "Coevaluacion";
    [NotMapped] public bool EsPruebaObjetiva => TipoSubActividad == "PruebaObjetiva";
    [NotMapped] public bool EsActividadModulo => TipoSubActividad == "ActividadModulo";
    [NotMapped] public bool EsRecuperacionModulo => TipoSubActividad == "RecuperacionModulo";

    /// <summary>
    /// Indica si esta sub-actividad lleva nota numérica.
    /// Lleva nota todas excepto: RecuperacionModulo (columna aparte) y las de ponderación 0.
    /// </summary>
    [NotMapped]
    public bool LlevaNota => Ponderacion > 0 && !EsRecuperacionModulo;

    /// <summary>
    /// Indica si debe mostrarse con texto vertical en el cuadro auxiliar
    /// </summary>
    [NotMapped]
    public bool EsVerticalCalculado => EsAutoevaluacion || EsCoevaluacion || EsPruebaObjetiva || EsRecuperacionModulo;

    /// <summary>
    /// Nombre limpio para mostrar (sin emojis, sin mayúsculas forzadas).
    /// Los emojis se renderizan como iconos en la UI, no se guardan en BD.
    /// </summary>
    [NotMapped]
    public string NombreDisplay => TipoSubActividad switch
    {
        "Autoevaluacion" => string.IsNullOrWhiteSpace(NombreSubActividad) ? "Autoevaluación" : NombreSubActividad,
        "Coevaluacion" => string.IsNullOrWhiteSpace(NombreSubActividad) ? "Coevaluación" : NombreSubActividad,
        "PruebaObjetiva" => string.IsNullOrWhiteSpace(NombreSubActividad) ? $"Prueba Objetiva {NumeroOrden}" : NombreSubActividad,
        "RecuperacionModulo" => string.IsNullOrWhiteSpace(NombreSubActividad) ? "Recuperación" : NombreSubActividad,
        "ActividadModulo" => string.IsNullOrWhiteSpace(NombreSubActividad) ? $"Actividad {NumeroOrden}" : NombreSubActividad,
        _ => NombreSubActividad
    };

    /// <summary>
    /// CSS Class para estilo visual en el cuadro
    /// </summary>
    [NotMapped]
    public string CssClass => TipoSubActividad switch
    {
        "Autoevaluacion" => "sub-act-autoeval writing-mode-vertical text-center",
        "Coevaluacion" => "sub-act-coeval writing-mode-vertical text-center",
        "PruebaObjetiva" => "sub-act-prueba writing-mode-vertical text-center",
        "RecuperacionModulo" => "sub-act-recup writing-mode-vertical text-center bg-red-50",
        "ActividadModulo" => "sub-act-modulo text-center",
        _ => "sub-act-normal"
    };

    /// <summary>
    /// Icono visual (solo UI, no se guarda en BD)
    /// </summary>
    [NotMapped]
    public string Icono => TipoSubActividad switch
    {
        "Autoevaluacion" => "🔄",
        "Coevaluacion" => "🤝",
        "PruebaObjetiva" => "📝",
        "ActividadModulo" => "📦",
        "RecuperacionModulo" => "♻️",
        _ => "📋"
    };
}
