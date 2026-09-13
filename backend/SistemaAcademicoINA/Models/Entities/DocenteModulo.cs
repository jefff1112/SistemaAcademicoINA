// Modelo de entidad: asignación de un docente a un módulo en una clase.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("docente_modulos")]
public class DocenteModulo
{
    [Key]
    [Column("id_docente_modulo")]
    public int IdDocenteModulo { get; set; }

    [Column("id_docente")]
    public int IdDocente { get; set; }

    [Column("id_modulo")]
    public int IdModulo { get; set; }

    [Column("id_clase")]
    public int IdClase { get; set; }

    [Column("anio_lectivo")]
    public int AnioLectivo { get; set; }

    [Column("estado")]
    public bool Estado { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey(nameof(IdDocente))]
    public virtual Docente? Docente { get; set; }

    [ForeignKey(nameof(IdModulo))]
    public virtual Modulo? Modulo { get; set; }

    [ForeignKey(nameof(IdClase))]
    public virtual Clase? Clase { get; set; }
}