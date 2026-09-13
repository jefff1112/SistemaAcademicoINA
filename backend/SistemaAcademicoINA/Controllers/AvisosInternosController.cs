using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona los avisos y comunicados internos del sistema (consulta, creación, edición y eliminación).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AvisosInternosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AvisosInternosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene los avisos activos dentro de su ventana de vigencia, devolviendo título, contenido y prioridad.
    // GET: api/avisosinternos/activos
    [HttpGet("activos")]
    public async Task<IActionResult> GetAvisosActivos()
    {
        var hoy = DateTime.Now;
        // Filtra por vigencia (FechaInicio/FechaFin) y ordena por prioridad (alta, media, baja) y fecha de creación
        var avisos = await _context.AvisosInternos
            .Where(a => a.Activo)
            .Where(a => a.FechaInicio == null || a.FechaInicio <= hoy)
            .Where(a => a.FechaFin == null || a.FechaFin >= hoy)
            .OrderByDescending(a => a.Prioridad == "alta" ? 1 : a.Prioridad == "media" ? 2 : 3)
            .ThenByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.IdAviso,
                a.Titulo,
                a.Contenido,
                a.Prioridad,
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(avisos);
    }

    // GET: obtiene todos los avisos internos sin filtrar, ordenados por fecha de creación.
    // GET: api/avisosinternos
    [HttpGet]
    public async Task<IActionResult> GetAllAvisos()
    {
        var avisos = await _context.AvisosInternos
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
        return Ok(avisos);
    }

    // POST: crea un nuevo aviso interno y devuelve el id del aviso registrado.
    // POST: api/avisosinternos
        [Authorize(Roles = "Administrador,Director,Sub Director")]
    [HttpPost]
    public async Task<IActionResult> CreateAviso([FromBody] CreateAvisoInternoRequest request)
    {
        var aviso = new AvisoInterno
        {
            Titulo = request.Titulo,
            Contenido = request.Contenido,
            Prioridad = request.Prioridad,
            Activo = request.Activo,
            FechaInicio = request.FechaInicio,
            FechaFin = request.FechaFin,
            CreatedAt = DateTime.Now
        };

        _context.AvisosInternos.Add(aviso);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Aviso creado correctamente", id = aviso.IdAviso });
    }

    // PUT: actualiza el título, contenido, prioridad y vigencia de un aviso existente.
    // PUT: api/avisosinternos/{id}
        [Authorize(Roles = "Administrador,Director,Sub Director")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAviso(int id, [FromBody] UpdateAvisoInternoRequest request)
    {
        var aviso = await _context.AvisosInternos.FindAsync(id);
        if (aviso == null)
            return NotFound(new { mensaje = "Aviso no encontrado" });

        aviso.Titulo = request.Titulo;
        aviso.Contenido = request.Contenido;
        aviso.Prioridad = request.Prioridad;
        aviso.Activo = request.Activo;
        aviso.FechaInicio = request.FechaInicio;
        aviso.FechaFin = request.FechaFin;
        aviso.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Aviso actualizado correctamente" });
    }

    // DELETE: elimina un aviso interno existente.
    // DELETE: api/avisosinternos/{id}
        [Authorize(Roles = "Administrador,Director,Sub Director")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAviso(int id)
    {
        var aviso = await _context.AvisosInternos.FindAsync(id);
        if (aviso == null)
            return NotFound(new { mensaje = "Aviso no encontrado" });

        _context.AvisosInternos.Remove(aviso);
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Aviso eliminado correctamente" });
    }
}

public class CreateAvisoInternoRequest
{
    public string Titulo { get; set; } = string.Empty;
    public string Contenido { get; set; } = string.Empty;
    public string Prioridad { get; set; } = "media";
    public bool Activo { get; set; } = true;
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
}

public class UpdateAvisoInternoRequest
{
    public string Titulo { get; set; } = string.Empty;
    public string Contenido { get; set; } = string.Empty;
    public string Prioridad { get; set; } = "media";
    public bool Activo { get; set; } = true;
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
}
