// Modelo de entidad: persona genérica (familiar o encargado)
// vinculada a los estudiantes del sistema.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("personas")]
public class Persona
{
    [Key]
    [Column("id_persona")]
    public int IdPersona { get; set; }

    [Column("tipo_documento")]
    public string? TipoDocumento { get; set; }

    [Column("numero_documento")]
    public string? NumeroDocumento { get; set; }

    [Column("nombres")]
    public string Nombres { get; set; } = string.Empty;

    [Column("apellidos")]
    public string Apellidos { get; set; } = string.Empty;

    [Column("fecha_nacimiento")]
    public DateTime? FechaNacimiento { get; set; }

    [Column("genero")]
    public string? Genero { get; set; }

    [Column("telefono_principal")]
    public string? TelefonoPrincipal { get; set; }

    [Column("telefono_secundario")]
    public string? TelefonoSecundario { get; set; }

    [Column("correo")]
    public string? Correo { get; set; }

    [Column("direccion")]
    public string? Direccion { get; set; }

    [Column("ocupacion")]
    public string? Ocupacion { get; set; }

    [Column("id_usuario")]
    public int? IdUsuario { get; set; }

    // Relación: usuario del sistema asociado a la persona (si aplica).
    [ForeignKey("IdUsuario")]
    public virtual Usuario? Usuario { get; set; }
}