using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona los grados académicos por nivel.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GradosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public GradosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene todos los grados activos con su nivel.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Grado>>> GetGrados()
    {
        var grados = await _context.Grados
            .Include(g => g.Nivel)
            .Where(g => g.Estado)
            .OrderBy(g => g.Orden)
            .ToListAsync();
        return Ok(grados);
    }

    // GET: obtiene un grado específico por su id.
    [HttpGet("{id}")]
    public async Task<ActionResult<Grado>> GetGrado(int id)
    {
        var grado = await _context.Grados
            .Include(g => g.Nivel)
            .FirstOrDefaultAsync(g => g.IdGrados == id);

        if (grado == null)
            return NotFound(new { mensaje = "Grado no encontrado" });

        return Ok(grado);
    }

    // GET: obtiene los grados de un nivel específico.
    [HttpGet("nivel/{idNivel}")]
    public async Task<ActionResult<IEnumerable<Grado>>> GetGradosByNivel(int idNivel)
    {
        var grados = await _context.Grados
            .Where(g => g.IdNivel == idNivel && g.Estado)
            .OrderBy(g => g.Orden)
            .ToListAsync();
        return Ok(grados);
    }

    // POST: crea un nuevo grado validando que no exista duplicado en el nivel.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<ActionResult<Grado>> PostGrado([FromBody] GradoRequest request)
    {
        try
        {
            var existe = await _context.Grados
                .AnyAsync(g => g.IdNivel == request.IdNivel && g.NumeroGrado == request.NumeroGrado);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe un grado con ese numero en este nivel" });

            var grado = new Grado
            {
                IdNivel = request.IdNivel,
                NumeroGrado = request.NumeroGrado,
                NombreGrado = request.NombreGrado,
                Orden = request.Orden ?? request.NumeroGrado,
                Estado = true
            };

            _context.Grados.Add(grado);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Grado creado correctamente", id = grado.IdGrados });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear grado", error = ex.Message });
        }
    }

    // PUT: actualiza los datos de un grado existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutGrado(int id, [FromBody] GradoRequest request)
    {
        try
        {
            var grado = await _context.Grados.FindAsync(id);
            if (grado == null)
                return NotFound(new { mensaje = "Grado no encontrado" });

            var existe = await _context.Grados
                .AnyAsync(g => g.IdNivel == request.IdNivel && g.NumeroGrado == request.NumeroGrado && g.IdGrados != id);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe otro grado con ese numero en este nivel" });

            grado.IdNivel = request.IdNivel;
            grado.NumeroGrado = request.NumeroGrado;
            grado.NombreGrado = request.NombreGrado;
            grado.Orden = request.Orden ?? request.NumeroGrado;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Grado actualizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar grado", error = ex.Message });
        }
    }

    // DELETE: desactiva un grado existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGrado(int id)
    {
        try
        {
            var grado = await _context.Grados.FindAsync(id);
            if (grado == null)
                return NotFound(new { mensaje = "Grado no encontrado" });

            grado.Estado = false;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Grado desactivado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar grado", error = ex.Message });
        }
    }
}

public class GradoRequest
{
    public int IdNivel { get; set; }
    public int NumeroGrado { get; set; }
    public string NombreGrado { get; set; } = string.Empty;
    public int? Orden { get; set; }
}
