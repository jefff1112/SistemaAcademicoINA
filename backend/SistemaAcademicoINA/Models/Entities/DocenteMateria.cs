// Modelo de entidad: asignación de materias a docentes por clase y año
// lectivo, con permisos para calificar y amonestar.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("docente_materias")]
public class DocenteMateria
{
    [Key]
    [Column("id_docente_materia")]
    public int IdDocenteMateria { get; set; }

    [Column("id_docente")]
    public int IdDocente { get; set; }

    [Column("id_materia")]
    public int IdMateria { get; set; }

    [Column("id_clase")]
    public int IdClase { get; set; }

    [Column("anio_lectivo")]
    public int AnioLectivo { get; set; }

    [Column("puede_calificar")]
    public bool PuedeCalificar { get; set; } = true;

    [Column("puede_amonestar")]
    public bool PuedeAmonestar { get; set; } = true;

    [Column("estado")]
    public bool Estado { get; set; } = true;

    // Relaciones de navegación
    [ForeignKey("IdDocente")]
    public virtual Docente? Docente { get; set; }

    [ForeignKey("IdMateria")]
    public virtual Materia? Materia { get; set; }

    [ForeignKey("IdClase")]
    public virtual Clase? Clase { get; set; }
}