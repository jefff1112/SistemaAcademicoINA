// Modelo de entidad: registra la asistencia diaria de un estudiante
// a una clase/materia, con estado, hora y justificación si aplica.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("asistencias")]
public class Asistencia
{
    [Key]
    [Column("id_asistencia")]
    public int IdAsistencia { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("id_clase")]
    public int IdClase { get; set; }

    [Column("id_materia")]
    public int IdMateria { get; set; }

    [Column("id_docente")]
    public int IdDocente { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; }

    [Column("estado")]
    public string Estado { get; set; } = "Presente";

    [Column("hora_registro")]
    public TimeSpan HoraRegistro { get; set; }

    [Column("minutos_tarde")]
    public int? MinutosTarde { get; set; }

    [Column("justificacion")]
    public string? Justificacion { get; set; }

    [Column("observaciones")]
    public string? Observaciones { get; set; }
}