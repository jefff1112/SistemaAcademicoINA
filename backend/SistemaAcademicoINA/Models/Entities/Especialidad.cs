// Modelo de entidad: catálogo de especialidades técnicas
// ofrecidas por el instituto (nombre, descripción y duración).
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("especialidades")]
public class Especialidad
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_especialidad")]
    public int IdEspecialidad { get; set; }

    [Column("nombre_especialidad")]
    public string NombreEspecialidad { get; set; } = string.Empty;

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("duracion_anios")]
    public int DuracionAnios { get; set; } = 3;

    [Column("estado")]
    public bool Estado { get; set; } = true;
}