using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona las secciones de clase (consulta, creación, edición y desactivación).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SeccionesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SeccionesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene las secciones activas ordenadas por nombre.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Seccion>>> GetSecciones()
    {
        var secciones = await _context.Secciones
            .Where(s => s.Estado)
            .OrderBy(s => s.NombreSeccion)
            .ToListAsync();
        return Ok(secciones);
    }

    // GET: obtiene una sección por su id.
    [HttpGet("{id}")]
    public async Task<ActionResult<Seccion>> GetSeccion(int id)
    {
        var seccion = await _context.Secciones.FindAsync(id);
        if (seccion == null)
            return NotFound(new { mensaje = "Seccion no encontrada" });

        return Ok(seccion);
    }

    // POST: crea una nueva sección validando que el nombre no exista.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<ActionResult<Seccion>> PostSeccion([FromBody] SeccionRequest request)
    {
        try
        {
            var existe = await _context.Secciones
                .AnyAsync(s => s.NombreSeccion == request.NombreSeccion && s.Estado);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe una seccion con ese nombre" });

            var seccion = new Seccion
            {
                NombreSeccion = request.NombreSeccion,
                Estado = true
            };

            _context.Secciones.Add(seccion);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Seccion creada correctamente", id = seccion.IdSeccion });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear seccion", error = ex.Message });
        }
    }

    // PUT: actualiza el nombre de una sección existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutSeccion(int id, [FromBody] SeccionRequest request)
    {
        try
        {
            var seccion = await _context.Secciones.FindAsync(id);
            if (seccion == null)
                return NotFound(new { mensaje = "Seccion no encontrada" });

            var existe = await _context.Secciones
                .AnyAsync(s => s.NombreSeccion == request.NombreSeccion && s.IdSeccion != id && s.Estado);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe otra seccion con ese nombre" });

            seccion.NombreSeccion = request.NombreSeccion;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Seccion actualizada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar seccion", error = ex.Message });
        }
    }

    // DELETE: desactiva una sección existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSeccion(int id)
    {
        try
        {
            var seccion = await _context.Secciones.FindAsync(id);
            if (seccion == null)
                return NotFound(new { mensaje = "Seccion no encontrada" });

            seccion.Estado = false;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Seccion desactivada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar seccion", error = ex.Message });
        }
    }
}

public class SeccionRequest
{
    public string NombreSeccion { get; set; } = string.Empty;
}
