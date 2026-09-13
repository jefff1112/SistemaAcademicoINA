// Modelo de entidad: nota acumulada de cada estudiante por materia
// y periodo académico, base para el cálculo de la nota final.
// Soporta: materias básicas y módulos/especialidades
// Estructura completa: recuperación por período, nota final anual, recuperación anual
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities
{
    [Table("resultados_periodos")]
    public class ResultadoPeriodo
    {
        [Key]
        [Column("id_resultado_periodo")]
        public int IdResultadoPeriodo { get; set; }

        [Column("id_estudiante")]
        public int IdEstudiante { get; set; }

        [Column("id_materia")]
        public int? IdMateria { get; set; }

        [Column("id_especialidad")]
        public int? IdEspecialidad { get; set; }

        [Column("id_clase")]
        public int IdClase { get; set; }

        [Column("id_periodo")]
        public int IdPeriodo { get; set; }

        [Column("anio_lectivo")]
        public int? AnioLectivo { get; set; }

        [Column("nota_acumulada")]
        public decimal NotaAcumulada { get; set; }

        [Column("nota_recuperacion")]
        public decimal? NotaRecuperacion { get; set; }

        [Column("observacion_recuperacion")]
        public string? ObservacionRecuperacion { get; set; }

        [Column("nota_final_anual")]
        public decimal? NotaFinalAnual { get; set; }

        [Column("nota_recuperacion_anual")]
        public decimal? NotaRecuperacionAnual { get; set; }

        [Column("observacion_recuperacion_anual")]
        public string? ObservacionRecuperacionAnual { get; set; }

        [Column("nota_recuperacion_modulo")]
        public decimal? NotaRecuperacionModulo { get; set; }

        [Column("observacion_recuperacion_modulo")]
        public string? ObservacionRecuperacionModulo { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        // Propiedades de navegación
        [ForeignKey(nameof(IdEstudiante))]
        public virtual Estudiante? Estudiante { get; set; }

        [ForeignKey(nameof(IdMateria))]
        public virtual Materia? Materia { get; set; }

        [ForeignKey(nameof(IdEspecialidad))]
        public virtual Especialidad? Especialidad { get; set; }

        [ForeignKey(nameof(IdClase))]
        public virtual Clase? Clase { get; set; }

        [ForeignKey(nameof(IdPeriodo))]
        public virtual PeriodoAcademico? Periodo { get; set; }

        // ============================================================
        // PROPIEDADES CALCULADAS
        // ============================================================

        /// <summary>
        /// Nota efectiva del período: Recuperación > Acumulada
        /// </summary>
        [NotMapped]
        public decimal NotaPeriodoEfectiva
        {
            get
            {
                if (NotaRecuperacion.HasValue && NotaRecuperacion > 0)
                    return NotaRecuperacion.Value;
                return NotaAcumulada;
            }
        }

        /// <summary>
        /// Nota efectiva anual: Recuperación > Final Anual
        /// </summary>
        [NotMapped]
        public decimal NotaAnualEfectiva
        {
            get
            {
                if (NotaRecuperacionAnual.HasValue && NotaRecuperacionAnual > 0)
                    return NotaRecuperacionAnual.Value;
                return NotaFinalAnual ?? 0;
            }
        }

        /// <summary>
        /// Nota efectiva del módulo: Recuperación módulo > Nota calculada
        /// </summary>
        [NotMapped]
        public decimal NotaModuloEfectiva
        {
            get
            {
                if (NotaRecuperacionModulo.HasValue && NotaRecuperacionModulo > 0)
                    return NotaRecuperacionModulo.Value;
                return NotaAcumulada;
            }
        }

        /// <summary>
        /// Indica si es resultado de una materia básica
        /// </summary>
        [NotMapped]
        public bool EsMateriaBasica => IdMateria.HasValue && !IdEspecialidad.HasValue;

        /// <summary>
        /// Indica si es resultado de un módulo/especialidad
        /// </summary>
        [NotMapped]
        public bool EsModulo => IdEspecialidad.HasValue && !IdMateria.HasValue;

        /// <summary>
        /// Indica si tiene recuperación de período
        /// </summary>
        [NotMapped]
        public bool TieneRecuperacionPeriodo => NotaRecuperacion.HasValue && NotaRecuperacion > 0;

        /// <summary>
        /// Indica si tiene recuperación anual
        /// </summary>
        [NotMapped]
        public bool TieneRecuperacionAnual => NotaRecuperacionAnual.HasValue && NotaRecuperacionAnual > 0;

        /// <summary>
        /// Indica si tiene recuperación de módulo
        /// </summary>
        [NotMapped]
        public bool TieneRecuperacionModulo => NotaRecuperacionModulo.HasValue && NotaRecuperacionModulo > 0;
    }
}
