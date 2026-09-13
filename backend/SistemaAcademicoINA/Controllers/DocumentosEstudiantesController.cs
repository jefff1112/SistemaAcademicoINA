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

    // GET: obtiene los documentos de un estudiante (ordenados por fecha descendente).
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

    // POST: agrega un documento a un estudiante (personal). El archivo adjunto es opcional.
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
                await _context.SaveChangesAsync();
            }

            return Ok(new { mensaje = "Documento agregado correctamente", id = documento.IdDocumento });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al agregar documento", error = ex.Message });
        }
    }

    // GET: descarga el archivo adjunto del documento.
    [HttpGet("{id}/descargar")]
    public async Task<IActionResult> DescargarDocumento(int id)
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

            var fileName = !string.IsNullOrEmpty(documento.NombreArchivo)
                ? documento.NombreArchivo
                : Path.GetFileName(documento.Documento);

            return PhysicalFile(physicalPath, "application/octet-stream", fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al descargar documento", error = ex.Message });
        }
    }

    // DELETE: elimina el documento (y su archivo físico) de forma definitiva.
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

    // Guarda el archivo en disco (una carpeta por estudiante) y devuelve la ruta relativa.
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

public class DocumentoEstudianteRequest
{
    public int IdEstudiante { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public DateTime? Fecha { get; set; }
    public IFormFile? Archivo { get; set; }
}