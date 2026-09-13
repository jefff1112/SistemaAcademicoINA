using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona las calificaciones de los estudiantes por actividad académica.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalificacionesActividadesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CalificacionesActividadesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene todas las calificaciones con datos de actividad y estudiante.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CalificacionActividad>>> GetCalificaciones()
    {
        var calificaciones = await _context.CalificacionesActividades
            .Include(c => c.Actividad)
            .Include(c => c.Estudiante)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
        return Ok(calificaciones);
    }

    // GET: obtiene una calificación específica por su id.
    [HttpGet("{id}")]
    public async Task<ActionResult<CalificacionActividad>> GetCalificacion(int id)
    {
        var calificacion = await _context.CalificacionesActividades
            .Include(c => c.Actividad)
            .Include(c => c.Estudiante)
            .FirstOrDefaultAsync(c => c.IdCalificacion == id);

        if (calificacion == null)
            return NotFound(new { mensaje = "Calificacion no encontrada" });

        return Ok(calificacion);
    }

    // GET: obtiene las calificaciones de una actividad específica.
    [HttpGet("actividad/{idActividad}")]
    public async Task<ActionResult<IEnumerable<CalificacionActividad>>> GetCalificacionesByActividad(int idActividad)
    {
        var calificaciones = await _context.CalificacionesActividades
            .Include(c => c.Estudiante)
            .Where(c => c.IdActividad == idActividad)
            .OrderBy(c => c.Estudiante != null ? c.Estudiante.Apellidos : "")
            .ToListAsync();
        return Ok(calificaciones);
    }

    // GET: obtiene las calificaciones de un estudiante en todas sus actividades.
    [HttpGet("estudiante/{idEstudiante}")]
    public async Task<ActionResult<IEnumerable<CalificacionActividad>>> GetCalificacionesByEstudiante(int idEstudiante)
    {
        var calificaciones = await _context.CalificacionesActividades
            .Include(c => c.Actividad)
            .Where(c => c.IdEstudiante == idEstudiante)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
        return Ok(calificaciones);
    }

    // POST: registra la nota de un estudiante para una actividad, sin permitir duplicados.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    [HttpPost]
    public async Task<ActionResult<CalificacionActividad>> PostCalificacion([FromBody] CalificacionRequest request)
    {
        try
        {
            var existe = await _context.CalificacionesActividades
                .AnyAsync(c => c.IdActividad == request.IdActividad && c.IdEstudiante == request.IdEstudiante);

            if (existe)
                return BadRequest(new { mensaje = "El estudiante ya tiene calificacion para esta actividad" });

            var calificacion = new CalificacionActividad
            {
                IdActividad = request.IdActividad,
                IdEstudiante = request.IdEstudiante,
                Nota = request.Nota,
                Observaciones = request.Observaciones,
                RegistradoPor = request.RegistradoPor,
                CreatedAt = DateTime.Now
            };

            _context.CalificacionesActividades.Add(calificacion);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Calificacion registrada correctamente", id = calificacion.IdCalificacion });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al registrar calificacion", error = ex.Message });
        }
    }

    // PUT: actualiza la nota y observaciones de una calificación existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCalificacion(int id, [FromBody] CalificacionRequest request)
    {
        try
        {
            var calificacion = await _context.CalificacionesActividades.FindAsync(id);
            if (calificacion == null)
                return NotFound(new { mensaje = "Calificacion no encontrada" });

            calificacion.Nota = request.Nota;
            calificacion.Observaciones = request.Observaciones;
            calificacion.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Calificacion actualizada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar calificacion", error = ex.Message });
        }
    }

    // DELETE: elimina una calificación existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCalificacion(int id)
    {
        try
        {
            var calificacion = await _context.CalificacionesActividades.FindAsync(id);
            if (calificacion == null)
                return NotFound(new { mensaje = "Calificacion no encontrada" });

            _context.CalificacionesActividades.Remove(calificacion);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Calificacion eliminada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar calificacion", error = ex.Message });
        }
    }
}

public class CalificacionRequest
{
    public int IdActividad { get; set; }
    public int IdEstudiante { get; set; }
    public decimal? Nota { get; set; }
    public decimal? NotaCalculada { get; set; }
    public decimal? NotaManual { get; set; }
    public decimal? NotaRecuperacion { get; set; }
    public string? Observaciones { get; set; }
    public int? RegistradoPor { get; set; }
}
