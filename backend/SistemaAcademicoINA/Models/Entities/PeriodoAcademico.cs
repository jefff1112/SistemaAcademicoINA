// Modelo de entidad: periodos académicos de un año lectivo
// (trimestres) con sus fechas de inicio y fin.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace SistemaAcademicoINA.Models.Entities;

[Table("periodos_academicos")]
public class PeriodoAcademico
{
    [Key]
    [Column("id_periodo")]
    public int IdPeriodo { get; set; }

    [Column("anio_lectivo")]
    public int AnioLectivo { get; set; }

    [Column("numero_periodo")]
    public int NumeroPeriodo { get; set; }

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("fecha_inicio")]
    public DateTime FechaInicio { get; set; }

    [Column("fecha_fin")]
    public DateTime FechaFin { get; set; }

    [Column("estado")]
    public string Estado { get; set; } = "Activo";

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    // ============================================================
    // PROPIEDADES DE NAVEGACIÓN
    // ============================================================

    // Relación con ActividadesPeriodos (uno a muchos)
    [InverseProperty(nameof(ActividadesPeriodo.Periodo))]
    public virtual ICollection<ActividadesPeriodo> ActividadesPeriodos { get; set; } = new List<ActividadesPeriodo>();

    // Relación con ResultadosPeriodos (uno a muchos)
    [InverseProperty(nameof(ResultadoPeriodo.Periodo))]
    public virtual ICollection<ResultadoPeriodo> ResultadosPeriodos { get; set; } = new List<ResultadoPeriodo>();

    // Relación con ConductaPeriodos (uno a muchos)
    [InverseProperty(nameof(ConductaPeriodo.Periodo))]
    public virtual ICollection<ConductaPeriodo> ConductaPeriodos { get; set; } = new List<ConductaPeriodo>();
}