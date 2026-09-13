// Modelo de entidad: niveles académicos del instituto
// (básica, media técnica, etc.) con su duración.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("niveles_academicos")]
public class NivelAcademico
{
    [Key]
    [Column("id_niveles")]
    public int IdNiveles { get; set; }

    [Column("nombre_nivel")]
    public string NombreNivel { get; set; } = string.Empty;

    [Column("tipo_media")]
    public string TipoMedia { get; set; } = string.Empty;

    [Column("duracion_anios")]
    public int DuracionAnios { get; set; }

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("estado")]
    public bool Estado { get; set; } = true;
}