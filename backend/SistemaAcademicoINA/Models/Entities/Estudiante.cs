// Modelo de entidad: representa a los estudiantes matriculados en el
// sistema, con sus datos personales, familiares y de matrícula.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("estudiantes")]
public class Estudiante
{
    [Key]
    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("nombres")]
    public string Nombres { get; set; } = string.Empty;

    [Column("apellidos")]
    public string Apellidos { get; set; } = string.Empty;

    [Column("codigo_estudiante")]
    public string CodigoEstudiante { get; set; } = string.Empty;

    [Column("dui")]
    public string? Dui { get; set; }

    [Column("pasaporte")]
    public string? Pasaporte { get; set; }

    [Column("nacionalidad")]
    public string Nacionalidad { get; set; } = "Salvadorena";

    [Column("fecha_nacimiento")]
    public DateTime? FechaNacimiento { get; set; }

    [Column("genero")]
    public string? Genero { get; set; }

    [Column("tipo_sangre")]
    public string? TipoSangre { get; set; }

    [Column("enfermedades_cronicas")]
    public string? EnfermedadesCronicas { get; set; }

    [Column("alergias")]
    public string? Alergias { get; set; }

    [Column("medicamentos")]
    public string? Medicamentos { get; set; }

    [Column("discapacidad")]
    public bool Discapacidad { get; set; }

    [Column("tipo_discapacidad")]
    public string? TipoDiscapacidad { get; set; }

    [Column("direccion")]
    public string? Direccion { get; set; }

    [Column("telefono_fijo")]
    public string? TelefonoFijo { get; set; }

    [Column("telefono_movil")]
    public string? TelefonoMovil { get; set; }

    [Column("telefono_emergencia")]
    public string? TelefonoEmergencia { get; set; }

    [Column("nombre_contacto_emergencia")]
    public string? NombreContactoEmergencia { get; set; }

    [Column("parentesco_emergencia")]
    public string? ParentescoEmergencia { get; set; }

    [Column("correo_estudiante")]
    public string? CorreoEstudiante { get; set; }

    [Column("id_clase")]
    public int? IdClase { get; set; }

    [Column("ano_ingreso")]
    public int? AnoIngreso { get; set; }

    [Column("fecha_matricula")]
    public DateTime? FechaMatricula { get; set; }

    [Column("nombre_padre")]
    public string? NombrePadre { get; set; }

    [Column("dui_padre")]
    public string? DuiPadre { get; set; }

    [Column("telefono_padre")]
    public string? TelefonoPadre { get; set; }

    [Column("ocupacion_padre")]
    public string? OcupacionPadre { get; set; }

    [Column("nombre_madre")]
    public string? NombreMadre { get; set; }

    [Column("dui_madre")]
    public string? DuiMadre { get; set; }

    [Column("telefono_madre")]
    public string? TelefonoMadre { get; set; }

    [Column("ocupacion_madre")]
    public string? OcupacionMadre { get; set; }

    [Column("nombre_encargado")]
    public string? NombreEncargado { get; set; }

    [Column("telefono_encargado")]
    public string? TelefonoEncargado { get; set; }

    [Column("parentesco_encargado")]
    public string? ParentescoEncargado { get; set; }

    [Column("email_encargado")]
    public string? EmailEncargado { get; set; }

    [Column("contrasena")]
    public string? Contraseña { get; set; }

    [Column("estado")]
    public bool Estado { get; set; } = true;

    [Column("graduado")]
    public bool Graduado { get; set; }

    [Column("fecha_graduacion")]
    public DateTime? FechaGraduacion { get; set; }

    [Column("id_rol")]
    public int? IdRol { get; set; }

    [Column("id_aspirante_origen")]
    public int? IdAspiranteOrigen { get; set; }

    [Column("nie")]
    public string? Nie { get; set; }

    [Column("carnet_menoridad")]
    public string? CarnetMenoridad { get; set; }

    // Relación: clase actual del estudiante.
    [ForeignKey("IdClase")]
    public virtual Clase? Clase { get; set; }

    // Relación: rol asignado al estudiante para el acceso al sistema.
    [ForeignKey("IdRol")]
    public virtual Rol? Rol { get; set; }

    // Relación: aspirante de origen del que proviene el estudiante (proceso de admisión).
    [ForeignKey("IdAspiranteOrigen")]
    public virtual Aspirante? AspiranteOrigen { get; set; }
}