// Modelo de entidad: relación de parentesco entre un estudiante
// y una persona (padre, madre, encargado, etc.).
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("relaciones_familiares")]
public class RelacionFamiliar
{
    [Key]
    [Column("id_relacion")]
    public int IdRelacion { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("id_persona")]
    public int IdPersona { get; set; }

    [Column("parentesco")]
    public string Parentesco { get; set; } = string.Empty;

    [Column("vive_con_estudiante")]
    public bool ViveConEstudiante { get; set; } = true;

    [Column("recibe_comunicados")]
    public bool RecibeComunicados { get; set; } = true;

    // Relaciones de navegación
    [ForeignKey("IdEstudiante")]
    public virtual Estudiante? Estudiante { get; set; }

    [ForeignKey("IdPersona")]
    public virtual Persona? Persona { get; set; }
}