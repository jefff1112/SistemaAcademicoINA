// Modelo de entidad: datos del personal docente que imparte
// clases en el instituto (información personal, tipo y estado).
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("docentes")]
public class Docente
{
    [Key]
    [Column("id_docente")]
    public int IdDocente { get; set; }

    [Column("codigo_docente")]
    public string CodigoDocente { get; set; } = string.Empty;

    [Column("nombres")]
    public string Nombres { get; set; } = string.Empty;

    [Column("apellidos")]
    public string Apellidos { get; set; } = string.Empty;

    [Column("dui")]
    public string? Dui { get; set; }

    [Column("correo")]
    public string? Correo { get; set; }

    [Column("telefono")]
    public string? Telefono { get; set; }

    [Column("especialidad_docente")]
    public string? EspecialidadDocente { get; set; }

    [Column("tipo_docente")]
    public string TipoDocente { get; set; } = "Basica";

    [Column("fecha_ingreso")]
    public DateTime? FechaIngreso { get; set; }

    [Column("estado")]
    public bool Estado { get; set; } = true;

    [Column("id_rol")]
    public int? IdRol { get; set; }
}