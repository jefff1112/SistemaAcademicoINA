// Modelo de entidad: representa una actividad académica (tarea, examen, etc.)
// publicada por un docente para una materia y clase específicas.
// Soporta materias básicas (id_materia) y módulos de especialidad (id_especialidad).
// Estructura exacta del Excel INA: 3 actividades (35/35/30) con sub-actividades tipadas.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace SistemaAcademicoINA.Models.Entities;

[Table("actividades")]
public class Actividad
{
    [Key]
    [Column("id_actividad")]
    public int IdActividad { get; set; }

    [Column("id_materia")]
    public int? IdMateria { get; set; }

    [Column("id_especialidad")]
    public int? IdEspecialidad { get; set; }

    [Column("id_modulo")]
    public int? IdModulo { get; set; }

    [Column("id_clase")]
    public int IdClase { get; set; }

    [Column("id_docente")]
    public int IdDocente { get; set; }

    [Column("nombre_actividad")]
    public string NombreActividad { get; set; } = string.Empty;

    [Column("tipo_actividad")]
    public string TipoActividad { get; set; } = "Actividad";

    [Column("ponderacion")]
    public decimal Ponderacion { get; set; }

    [Column("fecha_publicacion")]
    public DateTime FechaPublicacion { get; set; }

    [Column("fecha_limite")]
    public DateTime FechaLimite { get; set; }

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("especificacion")]
    public string? Especificacion { get; set; }

    [Column("estado")]
    public string Estado { get; set; } = "Activo";

    [Column("incluir_autoevaluacion")]
    public bool IncluirAutoevaluacion { get; set; } = false;

    [Column("incluir_coevaluacion")]
    public bool IncluirCoevaluacion { get; set; } = false;

    [Column("ponderacion_autoevaluacion")]
    public decimal PonderacionAutoevaluacion { get; set; } = 0;

    [Column("ponderacion_coevaluacion")]
    public decimal PonderacionCoevaluacion { get; set; } = 0;

    [Column("observaciones")]
    public string? Observaciones { get; set; }

    [Column("es_modulo")]
    public bool EsModulo { get; set; } = false;

    [Column("numero_orden")]
    public int NumeroOrden { get; set; } = 0;

    [Column("id_periodo")]
    public int? IdPeriodo { get; set; }

    [Column("orden")]
    public int Orden { get; set; } = 0;

    [Column("es_predeterminada")]
    public bool EsPredeterminada { get; set; } = false;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // ============================================================
    // PROPIEDADES DE NAVEGACIÓN
    // ============================================================

    [ForeignKey(nameof(IdMateria))]
    public virtual Materia? Materia { get; set; }

    [ForeignKey(nameof(IdPeriodo))]
    public virtual PeriodoAcademico? PeriodoAcademico { get; set; }

    [ForeignKey(nameof(IdEspecialidad))]
    public virtual Especialidad? Especialidad { get; set; }

    [ForeignKey(nameof(IdModulo))]
    public virtual Modulo? Modulo { get; set; }

    [ForeignKey(nameof(IdClase))]
    public virtual Clase? Clase { get; set; }

    [ForeignKey(nameof(IdDocente))]
    public virtual Docente? Docente { get; set; }

    // Relación con ActividadesPeriodos (uno a muchos)
    [InverseProperty(nameof(ActividadesPeriodo.Actividad))]
    public virtual ICollection<ActividadesPeriodo> ActividadesPeriodos { get; set; } = new List<ActividadesPeriodo>();

    // Relación con CalificacionesActividades (uno a muchos)
    [InverseProperty(nameof(CalificacionActividad.Actividad))]
    public virtual ICollection<CalificacionActividad> CalificacionesActividades { get; set; } = new List<CalificacionActividad>();

    // Relación con SubActividades (uno a muchos)
    [InverseProperty(nameof(SubActividad.Actividad))]
    public virtual ICollection<SubActividad> SubActividades { get; set; } = new List<SubActividad>();

    // ============================================================
    // PROPIEDADES CALCULADAS (no mapeadas a BD)
    // ============================================================

    /// <summary>
    /// Indica si esta actividad es de una materia básica (no módulo)
    /// </summary>
    [NotMapped]
    public bool EsMateriaBasica => IdMateria.HasValue && !IdEspecialidad.HasValue;

    /// <summary>
    /// Indica si esta actividad es de un módulo/especialidad (calculado desde BD)
    /// </summary>
    [NotMapped]
    public bool EsModuloCalculado => IdEspecialidad.HasValue && !IdMateria.HasValue;

    /// <summary>
    /// Nombre descriptivo del tipo de actividad
    /// </summary>
    [NotMapped]
    public string NombreTipoActividad => TipoActividad switch
    {
        "Tarea" => "Tarea",
        "Examen" => "Examen",
        "Proyecto" => "Proyecto",
        "Participacion" => "Participación",
        "Otro" => "Otro",
        "Actividad" => "Actividad",
        "Modulo" => "Módulo",
        _ => TipoActividad
    };

    /// <summary>
    /// Sub-actividades ordenadas para renderizado del cuadro auxiliar
    /// </summary>
    [NotMapped]
    public List<SubActividad> SubActividadesOrdenadas => SubActividades.OrderBy(s => s.Orden).ToList();

    /// <summary>
    /// Suma de ponderaciones de sub-actividades que llevan nota (excluye Autoeval, Coeval, Porcentaje, RecuperacionModulo)
    /// </summary>
    [NotMapped]
    public decimal SumaPonderacionesSubConNota => SubActividades
        .Where(s => s.Ponderacion > 0 && s.TipoSubActividad != "Autoevaluacion" && s.TipoSubActividad != "Coevaluacion" 
            && s.TipoSubActividad != "Porcentaje" && s.TipoSubActividad != "RecuperacionModulo")
        .Sum(s => s.Ponderacion);

    /// <summary>
    /// Indica si las sub-actividades con nota suman 100%
    /// </summary>
    [NotMapped]
    public bool SubPonderacionesValidas => Math.Abs(SumaPonderacionesSubConNota - 100) < 0.01m;

    /// <summary>
    /// Obtiene la sub-actividad de autoevaluación si existe
    /// </summary>
    [NotMapped]
    public SubActividad? SubAutoevaluacion => SubActividades.FirstOrDefault(s => s.TipoSubActividad == "Autoevaluacion");

    /// <summary>
    /// Obtiene la sub-actividad de coevaluación si existe
    /// </summary>
    [NotMapped]
    public SubActividad? SubCoevaluacion => SubActividades.FirstOrDefault(s => s.TipoSubActividad == "Coevaluacion");

    /// <summary>
    /// Obtiene la sub-actividad de porcentaje final (35%/30%)
    /// </summary>
    [NotMapped]
    public SubActividad? SubPorcentajeFinal => SubActividades.FirstOrDefault(s => s.TipoSubActividad == "Porcentaje");

    /// <summary>
    /// Obtiene la sub-actividad de recuperación de módulo
    /// </summary>
    [NotMapped]
    public SubActividad? SubRecuperacionModulo => SubActividades.FirstOrDefault(s => s.TipoSubActividad == "RecuperacionModulo");

    /// <summary>
    /// Sub-actividades numeradas (1-5) para materias básicas
    /// </summary>
    [NotMapped]
    public List<SubActividad> SubNumeradas => SubActividades
        .Where(s => s.TipoSubActividad == "Numerada")
        .OrderBy(s => s.NumeroOrden)
        .ToList();

    /// <summary>
    /// Sub-actividades de pruebas objetivas para Actividad 3
    /// </summary>
    [NotMapped]
    public List<SubActividad> SubPruebasObjetivas => SubActividades
        .Where(s => s.TipoSubActividad == "PruebaObjetiva")
        .OrderBy(s => s.NumeroOrden)
        .ToList();

    /// <summary>
    /// Sub-actividades tipo ActividadModulo para módulos/especialidades
    /// </summary>
    [NotMapped]
    public List<SubActividad> SubActividadesModulo => SubActividades
        .Where(s => s.TipoSubActividad == "ActividadModulo")
        .OrderBy(s => s.NumeroOrden)
        .ToList();
}
