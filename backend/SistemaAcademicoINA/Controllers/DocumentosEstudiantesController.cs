// Controlador API (autenticado): documentos de estudiantes para Registro Académico, Dirección y Administrador.
// - consulta de documentos por estudiante, subida de archivos (PDF/imagen), descarga y eliminación.
// El archivo físico se guarda en wwwroot/uploads/documentos_estudiantes/{id} (patrón de Constancias).
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using System.Security.Claims;

namespace SistemaAcademicoINA.Controllers;

[ApiController]
[Route("api/documentos-estudiantes")]
[Authorize]
public class DocumentosEstudiantesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DocumentosEstudiantesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ============================================================
    // GET: Obtiene los documentos de un estudiante
    // ============================================================
    [HttpGet("estudiante/{idEstudiante}")]
    public async Task<ActionResult> GetDocumentosByEstudiante(int idEstudiante)
    {
        try
        {
            var documentos = await _context.DocumentosEstudiantes
                .Where(d => d.IdEstudiante == idEstudiante)
                .OrderByDescending(d => d.Fecha)
                .Select(d => new
                {
                    d.IdDocumento,
                    d.IdEstudiante,
                    d.Tipo,
                    d.Nombre,
                    d.Fecha,
                    tieneDocumento = !string.IsNullOrEmpty(d.Documento),
                    d.NombreArchivo,
                    // Extensión del archivo (para que el frontend sepa si es PDF, imagen, etc.)
                    extension = !string.IsNullOrEmpty(d.NombreArchivo)
                        ? Path.GetExtension(d.NombreArchivo).ToLowerInvariant()
                        : (!string.IsNullOrEmpty(d.Documento)
                            ? Path.GetExtension(d.Documento).ToLowerInvariant()
                            : ""),
                    d.RegistradoPor,
                    d.CreatedAt
                })
                .ToListAsync();

            return Ok(documentos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener documentos", error = ex.Message });
        }
    }

    // ============================================================
    // GET: Obtiene los documentos de todos los estudiantes de una clase
    // Optimización para el modo "Por Clase" del frontend
    // ============================================================
    [HttpGet("clase/{idClase}")]
    public async Task<ActionResult> GetDocumentosByClase(int idClase)
    {
        try
        {
            // Obtener los IDs de los estudiantes matriculados en la clase
            var estudiantesIds = await _context.Inscripciones
                .Where(i => i.IdClase == idClase && i.EstadoInscripcion == "Confirmada")
                .Select(i => i.IdEstudiante)
                .ToListAsync();

            if (!estudiantesIds.Any())
                return Ok(new Dictionary<int, object>());

            // Obtener todos los documentos de esos estudiantes
            var documentos = await _context.DocumentosEstudiantes
                .Where(d => estudiantesIds.Contains(d.IdEstudiante))
                .OrderByDescending(d => d.Fecha)
                .ToListAsync();

            // Agrupar por estudiante
            var resultado = documentos
                .GroupBy(d => d.IdEstudiante)
                .ToDictionary(
                    g => g.Key,
                    g => (object)g.Select(d => new
                    {
                        d.IdDocumento,
                        d.IdEstudiante,
                        d.Tipo,
                        d.Nombre,
                        d.Fecha,
                        tieneDocumento = !string.IsNullOrEmpty(d.Documento),
                        d.NombreArchivo,
                        extension = !string.IsNullOrEmpty(d.NombreArchivo)
                            ? Path.GetExtension(d.NombreArchivo).ToLowerInvariant()
                            : (!string.IsNullOrEmpty(d.Documento)
                                ? Path.GetExtension(d.Documento).ToLowerInvariant()
                                : ""),
                        d.RegistradoPor,
                        d.CreatedAt
                    }).ToList()
                );

            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener documentos de la clase", error = ex.Message });
        }
    }

    // ============================================================
    // POST: Agrega un documento a un estudiante (personal)
    // ============================================================
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<IActionResult> PostDocumento([FromForm] DocumentoEstudianteRequest request)
    {
        try
        {
            if (request.IdEstudiante <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar un estudiante" });

            if (string.IsNullOrWhiteSpace(request.Tipo))
                return BadRequest(new { mensaje = "El tipo de documento es requerido" });

            var estudiante = await _context.Estudiantes.FindAsync(request.IdEstudiante);
            if (estudiante == null)
                return NotFound(new { mensaje = "Estudiante no encontrado" });

            var documento = new DocumentoEstudiante
            {
                IdEstudiante = request.IdEstudiante,
                Tipo = request.Tipo.Trim(),
                Nombre = string.IsNullOrWhiteSpace(request.Nombre) ? request.Tipo.Trim() : request.Nombre.Trim(),
                Fecha = request.Fecha ?? DateTime.Now,
                RegistradoPor = User.FindFirst(ClaimTypes.Name)?.Value,
                CreatedAt = DateTime.Now
            };

            _context.DocumentosEstudiantes.Add(documento);
            await _context.SaveChangesAsync();

            if (request.Archivo != null && request.Archivo.Length > 0)
            {
                documento.Documento = await GuardarArchivoAsync(documento.IdEstudiante, request.Archivo);
                // IMPORTANTE: Guardar el nombre original del archivo para poder descargarlo con su extensión correcta
                documento.NombreArchivo = Path.GetFileName(request.Archivo.FileName);
                await _context.SaveChangesAsync();
            }

            return Ok(new { mensaje = "Documento agregado correctamente", id = documento.IdDocumento });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al agregar documento", error = ex.Message });
        }
    }

    // ============================================================
    // GET: Descarga o visualiza el archivo adjunto del documento
    // ============================================================
    [HttpGet("{id}/descargar")]
    public async Task<IActionResult> DescargarDocumento(int id, [FromQuery] bool inline = false)
    {
        try
        {
            var documento = await _context.DocumentosEstudiantes.FindAsync(id);
            if (documento == null)
                return NotFound(new { mensaje = "Documento no encontrado" });

            if (string.IsNullOrEmpty(documento.Documento))
                return NotFound(new { mensaje = "El documento no tiene archivo adjunto" });

            var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", documento.Documento.TrimStart('/'));
            if (!System.IO.File.Exists(physicalPath))
                return NotFound(new { mensaje = "El archivo ya no existe en el servidor" });

            // Determinar el nombre real del archivo (con su extensión)
            var fileName = !string.IsNullOrEmpty(documento.NombreArchivo)
                ? documento.NombreArchivo
                : Path.GetFileName(documento.Documento);

            // Detectar el MIME type correcto según la extensión
            var extension = Path.GetExtension(fileName)?.ToLowerInvariant() ?? "";
            var mimeType = extension switch
            {
                ".pdf" => "application/pdf",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                ".bmp" => "image/bmp",
                ".svg" => "image/svg+xml",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".ppt" => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".txt" => "text/plain",
                ".zip" => "application/zip",
                _ => "application/octet-stream"
            };

            // Si es inline=true, el navegador intentará mostrarlo (útil para PDFs e imágenes)
            var disposition = inline ? "inline" : "attachment";

            // Abrir el stream del archivo
            var stream = new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.Read);

            // Configurar el Content-Disposition con el nombre correcto (soporta UTF-8)
            Response.Headers["Content-Disposition"] =
                $"{disposition}; filename=\"{fileName}\"; filename*=UTF-8''{Uri.EscapeDataString(fileName)}";

            return new FileStreamResult(stream, mimeType)
            {
                FileDownloadName = fileName,
                EnableRangeProcessing = true
            };
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al descargar documento", error = ex.Message });
        }
    }

    // ============================================================
    // DELETE: Elimina el documento (y su archivo físico)
    // ============================================================
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocumento(int id)
    {
        try
        {
            var documento = await _context.DocumentosEstudiantes.FindAsync(id);
            if (documento == null)
                return NotFound(new { mensaje = "Documento no encontrado" });

            if (!string.IsNullOrEmpty(documento.Documento))
            {
                var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", documento.Documento.TrimStart('/'));
                if (System.IO.File.Exists(physicalPath))
                    System.IO.File.Delete(physicalPath);
            }

            _context.DocumentosEstudiantes.Remove(documento);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Documento eliminado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar documento", error = ex.Message });
        }
    }

    // ============================================================
    // MÉTODO PRIVADO: Guarda el archivo en disco
    // ============================================================
    private async Task<string> GuardarArchivoAsync(int idEstudiante, IFormFile archivo)
    {
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "documentos_estudiantes", idEstudiante.ToString());
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var archivoSeguro = Path.GetFileName(archivo.FileName) ?? "documento";
        var fileName = $"documento_{Guid.NewGuid():N}_{archivoSeguro}";
        var fullPath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await archivo.CopyToAsync(stream);
        }

        return $"/uploads/documentos_estudiantes/{idEstudiante}/{fileName}";
    }
}

// ============================================================
// DTO de request
// ============================================================
public class DocumentoEstudianteRequest
{
    public int IdEstudiante { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public DateTime? Fecha { get; set; }
    public IFormFile? Archivo { get; set; }
}