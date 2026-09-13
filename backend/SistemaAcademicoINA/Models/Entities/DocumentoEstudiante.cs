// Modelo de entidad: documentos de un estudiante (certificados, constancias, partidas de nacimiento, etc.).
// El archivo se almacena en disco bajo wwwroot/uploads/documentos_estudiantes/{id}.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("documentos_estudiantes")]
public class DocumentoEstudiante
{
    [Key]
    [Column("id_documento")]
    public int IdDocumento { get; set; }

    [Column("id_estudiante")]
    public int IdEstudiante { get; set; }

    public Estudiante? Estudiante { get; set; }

    // Tipo de documento: "Certificado de Notas", "Constancia de Estudio", "Partida de Nacimiento", etc.
    [Column("tipo")]
    public string Tipo { get; set; } = string.Empty;

    // Nombre descriptivo del documento (ej: "Certificado de Notas 2026").
    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    // Ruta relativa del archivo adjunto (ej: /uploads/documentos_estudiantes/{id}/{archivo}).
    [Column("documento")]
    public string? Documento { get; set; }

    [Column("nombre_archivo")]
    public string? NombreArchivo { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; } = DateTime.Now;

    // Código del usuario que registró el documento.
    [Column("registrado_por")]
    public string? RegistradoPor { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }
}