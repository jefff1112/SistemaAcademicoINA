// Modelo de entidad: horario de clases por materia, docente, día y
// horas, con la jornada y el aula asignada.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("horarios")]
public class Horario
{
    [Key]
    [Column("id_horario")]
    public int IdHorario { get; set; }

    [Column("id_clase")]
    public int IdClase { get; set; }

    [Column("id_materia")]
    public int IdMateria { get; set; }

    [Column("id_docente")]
    public int? IdDocente { get; set; }

    [Column("jornada")]
    public string Jornada { get; set; } = "Matutina";

    [Column("dia_semana")]
    public string DiaSemana { get; set; } = string.Empty;

    [Column("hora_inicio")]
    public TimeSpan HoraInicio { get; set; }

    [Column("hora_fin")]
    public TimeSpan HoraFin { get; set; }

    [Column("aula")]
    public string? Aula { get; set; }

    [Column("id_aula")]
    public int? IdAula { get; set; }

    [Column("periodo")]
    public int? Periodo { get; set; }

    [Column("estado")]
    public bool Estado { get; set; } = true;

    [Column("anio_lectivo")]
    public int AnioLectivo { get; set; }

    // Relaciones de navegación
    [ForeignKey("IdClase")]
    public virtual Clase? Clase { get; set; }

    [ForeignKey("IdMateria")]
    public virtual Materia? Materia { get; set; }

    [ForeignKey("IdDocente")]
    public virtual Docente? Docente { get; set; }
}