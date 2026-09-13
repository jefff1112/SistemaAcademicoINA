// Modelo de entidad: resumen consolidado de asistencias por estudiante,
// clase y periodo (días, presentes, ausencias, tardanzas y justificadas).
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("asistencias_resumen")]
public class AsistenciasResumen
{
	[Key]
	[Column("id_resumen")]
	public int IdResumen { get; set; }

	[Column("id_estudiante")]
	public int IdEstudiante { get; set; }

	[Column("id_clase")]
	public int IdClase { get; set; }

	[Column("anio_lectivo")]
	public int AnioLectivo { get; set; }

	[Column("periodo")]
	public int Periodo { get; set; }

	[Column("total_dias")]
	public int TotalDias { get; set; }

	[Column("presentes")]
	public int Presentes { get; set; }

	[Column("ausencias")]
	public int Ausencias { get; set; }

	[Column("tardanzas")]
	public int Tardanzas { get; set; }

	[Column("justificadas")]
	public int Justificadas { get; set; }

	[Column("porcentaje_asistencia")]
	public decimal PorcentajeAsistencia { get; set; }

	// Relaciones de navegación
	[ForeignKey(nameof(IdEstudiante))]
	public virtual Estudiante? Estudiante { get; set; }

	[ForeignKey(nameof(IdClase))]
	public virtual Clase? Clase { get; set; }
}