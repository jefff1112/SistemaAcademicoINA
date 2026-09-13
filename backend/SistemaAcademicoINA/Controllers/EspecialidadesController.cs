using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona las especialidades académicas del instituto.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EspecialidadesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EspecialidadesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene la lista de especialidades ordenada alfabéticamente.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Especialidad>>> GetEspecialidades()
    {
        try
        {
            var especialidades = await _context.Especialidades
                .OrderBy(e => e.NombreEspecialidad)
                .ToListAsync();
            return Ok(especialidades);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener especialidades", error = ex.Message });
        }
    }

    // GET: obtiene una especialidad específica por su id.
    [HttpGet("{id}")]
    public async Task<ActionResult<Especialidad>> GetEspecialidad(int id)
    {
        try
        {
            var especialidad = await _context.Especialidades.FindAsync(id);
            if (especialidad == null)
                return NotFound(new { mensaje = "Especialidad no encontrada" });

            return Ok(especialidad);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener especialidad", error = ex.Message });
        }
    }

    // POST: crea una nueva especialidad validando que el nombre no exista.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<ActionResult<Especialidad>> PostEspecialidad([FromBody] EspecialidadRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.NombreEspecialidad))
                return BadRequest(new { mensaje = "El nombre de la especialidad es requerido" });

            var existe = await _context.Especialidades
                .AnyAsync(e => e.NombreEspecialidad == request.NombreEspecialidad);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe una especialidad con ese nombre" });

            var especialidad = new Especialidad
            {
                NombreEspecialidad = request.NombreEspecialidad,
                Descripcion = request.Descripcion,
                DuracionAnios = request.DuracionAnios ?? 3,
                Estado = true
            };

            _context.Especialidades.Add(especialidad);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Especialidad creada correctamente", id = especialidad.IdEspecialidad });
        }
        catch (DbUpdateException dbEx)
        {
            var innerMessage = dbEx.InnerException?.Message ?? dbEx.Message;
            return StatusCode(500, new { mensaje = "Error de base de datos", detalle = innerMessage });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear especialidad", error = ex.Message });
        }
    }

    // PUT: actualiza los datos de una especialidad existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutEspecialidad(int id, [FromBody] EspecialidadRequest request)
    {
        try
        {
            var especialidad = await _context.Especialidades.FindAsync(id);
            if (especialidad == null)
                return NotFound(new { mensaje = "Especialidad no encontrada" });

            if (string.IsNullOrEmpty(request.NombreEspecialidad))
                return BadRequest(new { mensaje = "El nombre de la especialidad es requerido" });

            var existe = await _context.Especialidades
                .AnyAsync(e => e.NombreEspecialidad == request.NombreEspecialidad && e.IdEspecialidad != id);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe otra especialidad con ese nombre" });

            especialidad.NombreEspecialidad = request.NombreEspecialidad;
            especialidad.Descripcion = request.Descripcion;
            especialidad.DuracionAnios = request.DuracionAnios ?? especialidad.DuracionAnios;
            especialidad.Estado = request.Estado;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Especialidad actualizada correctamente" });
        }
        catch (DbUpdateException dbEx)
        {
            var innerMessage = dbEx.InnerException?.Message ?? dbEx.Message;
            return StatusCode(500, new { mensaje = "Error de base de datos", detalle = innerMessage });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar especialidad", error = ex.Message });
        }
    }

    // DELETE: desactiva una especialidad existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEspecialidad(int id)
    {
        try
        {
            var especialidad = await _context.Especialidades.FindAsync(id);
            if (especialidad == null)
                return NotFound(new { mensaje = "Especialidad no encontrada" });

            especialidad.Estado = false;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Especialidad desactivada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar especialidad", error = ex.Message });
        }
    }
}

public class EspecialidadRequest
{
    public string NombreEspecialidad { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int? DuracionAnios { get; set; }
    public bool Estado { get; set; } = true;
}
