// Modelo de entidad: representa a los aspirantes del proceso de admisión con
// su expediente completo (datos personales, familiares, académicos y estado de la solicitud).
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("aspirantes")]
public class Aspirante
{
    [Key]
    [Column("id_aspirante")]
    public int IdAspirante { get; set; }

    [Column("numero_expediente")]
    public string? NumeroExpediente { get; set; }

    [Column("nombres")]
    public string Nombres { get; set; } = string.Empty;

    [Column("apellidos")]
    public string Apellidos { get; set; } = string.Empty;

    [Column("dui")]
    public string? Dui { get; set; }

    [Column("pasaporte")]
    public string? Pasaporte { get; set; }

    [Column("nacionalidad")]
    public string Nacionalidad { get; set; } = "Salvadoreña";

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

    [Column("telefono")]
    public string? Telefono { get; set; }

    [Column("telefono_fijo")]
    public string? TelefonoFijo { get; set; }

    [Column("telefono_emergencia")]
    public string? TelefonoEmergencia { get; set; }

    [Column("nombre_contacto_emergencia")]
    public string? NombreContactoEmergencia { get; set; }

    [Column("parentesco_emergencia")]
    public string? ParentescoEmergencia { get; set; }

    [Column("correo")]
    public string? Correo { get; set; }

    [Column("escuela_procedencia")]
    public string? EscuelaProcedencia { get; set; }

    [Column("anio_estudio")]
    public string? AnioEstudio { get; set; }

    [Column("promedio_anterior")]
    public decimal? PromedioAnterior { get; set; }

    [Column("nota_examen")]
    public decimal? NotaExamen { get; set; }

    [Column("puntaje_seleccion")]
    public decimal? PuntajeSeleccion { get; set; }

    [Column("exonerado")]
    public bool Exonerado { get; set; }

    [Column("tipo_exoneracion")]
    public string? TipoExoneracion { get; set; }

    [Column("documento_exoneracion")]
    public string? DocumentoExoneracion { get; set; }

    [Column("puesto_aspirante")]
    public int? PuestoAspirante { get; set; }

    [Column("nivel_aspira")]
    public string? NivelAspira { get; set; }

    [Column("especialidad_aspira")]
    public int? EspecialidadAspira { get; set; }

    // NUEVA PROPIEDAD
    [Column("id_clase_asignada")]
    public int? IdClaseAsignada { get; set; }

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

    [Column("dui_encargado")]
    public string? DuiEncargado { get; set; }

    [Column("telefono_encargado")]
    public string? TelefonoEncargado { get; set; }

    [Column("parentesco_encargado")]
    public string? ParentescoEncargado { get; set; }

    [Column("num_hermanos")]
    public int NumHermanos { get; set; }

    [Column("estado_solicitud")]
    public string EstadoSolicitud { get; set; } = "Pendiente";

    [Column("fecha_solicitud")]
    public DateTime FechaSolicitud { get; set; }

    [Column("observaciones")]
    public string? Observaciones { get; set; }

    [Column("fecha_entrevista")]
    public DateTime? FechaEntrevista { get; set; }

    [Column("entrevistado_por")]
    public string? EntrevistadoPor { get; set; }

    [Column("observaciones_entrevista")]
    public string? ObservacionesEntrevista { get; set; }

    [Column("fecha_aprobacion")]
    public DateTime? FechaAprobacion { get; set; }

    [Column("aprobado_por")]
    public string? AprobadoPor { get; set; }

    [Column("documentos_presentados")]
    public string? DocumentosPresentados { get; set; }

    [Column("id_estudiante_generado")]
    public int? IdEstudianteGenerado { get; set; }

    [Column("id_inscripcion_generada")]
    public int? IdInscripcionGenerada { get; set; }

    [Column("nie")]
    public string? Nie { get; set; }

    [Column("carnet_menoridad")]
    public string? CarnetMenoridad { get; set; }

    [Column("nota_primer_periodo_escuela")]
    public decimal? NotaPrimerPeriodoEscuela { get; set; }

    [Column("nota_segundo_periodo_escuela")]
    public decimal? NotaSegundoPeriodoEscuela { get; set; }

    [Column("promedio_final_escuela")]
    public decimal? PromedioFinalEscuela { get; set; }

    [Column("archivo_notas_escuela")]
    public string? ArchivoNotasEscuela { get; set; }

    [Column("conducta_escuela")]
    public string? ConductaEscuela { get; set; }

    // ========== NUEVA PROPIEDAD ==========
    [Column("foto")]
    public string? Foto { get; set; }

    // Documentos adicionales del aspirante en formato JSON: [{ "tipo": "...", "nombre": "...", "archivo": "/uploads/..." }]
    [Column("documentos")]
    public string? Documentos { get; set; }

    // Relación: especialidad a la que aspira ingresar el candidato.
    [ForeignKey("EspecialidadAspira")]
    public virtual Especialidad? Especialidad { get; set; }

    // Relación: clase asignada por Dirección al aprobar la solicitud.
    [ForeignKey("IdClaseAsignada")]
    public virtual Clase? ClaseAsignada { get; set; }
}