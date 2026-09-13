// Modelo de entidad: inscripción de un estudiante a una clase
// para un año lectivo, con su estado de aprobación.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("inscripciones")]
public class Inscripcion
{
    [Key]
    [Column("id_inscripciones")]
    public int IdInscripciones { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    [Column("id_clase")]
    public int IdClase { get; set; }

    [Column("anio_lectivo")]
    public int AnioLectivo { get; set; }

    [Column("fecha_inscripcion")]
    public DateTime? FechaInscripcion { get; set; }

    [Column("fecha_matricula")]
    public DateTime? FechaMatricula { get; set; }

    [Column("tipo_inscripcion")]
    public string TipoInscripcion { get; set; } = "Nuevo Ingreso";

    [Column("estado_inscripcion")]
    public string EstadoInscripcion { get; set; } = "Pendiente";

    [Column("estado_aprobacion")]
    public string EstadoAprobacion { get; set; } = "Pendiente";

    [Column("numero_expediente")]
    public string? NumeroExpediente { get; set; }

    [Column("numero_carnet")]
    public string? NumeroCarnet { get; set; }

    [Column("fecha_aprobacion")]
    public DateTime? FechaAprobacion { get; set; }

    [Column("aprobado_por")]
    public string? AprobadoPor { get; set; }

    [Column("motivo_rechazo")]
    public string? MotivoRechazo { get; set; }

    [Column("documentos_presentados")]
    public string? DocumentosPresentados { get; set; }

    [Column("id_aspirante_origen")]
    public int? IdAspiranteOrigen { get; set; }

    [Column("nie")]
    public string? Nie { get; set; }

    [Column("carnet_menoridad")]
    public string? CarnetMenoridad { get; set; }

    // Relaciones de navegación
    [ForeignKey("IdEstudiante")]
    public virtual Estudiante? Estudiante { get; set; }

    [ForeignKey("IdClase")]
    public virtual Clase? Clase { get; set; }
}