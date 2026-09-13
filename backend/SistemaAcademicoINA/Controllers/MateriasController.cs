using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona las materias del plan de estudios y su asignación por clase, especialidad o tipo.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MateriasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MateriasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene la lista de materias activas ordenadas por tipo y nombre.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Materia>>> GetMaterias()
    {
        try
        {
            var materias = await _context.Materias
                .Include(m => m.Especialidad)
                .Where(m => m.Estado)
                .OrderBy(m => m.TipoMateria)
                .ThenBy(m => m.NombreMateria)
                .ToListAsync();
            return Ok(materias);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener materias", error = ex.Message });
        }
    }

    // GET: obtiene una materia específica por su id.
    [HttpGet("{id}")]
    public async Task<ActionResult<Materia>> GetMateria(int id)
    {
        try
        {
            var materia = await _context.Materias
                .Include(m => m.Especialidad)
                .FirstOrDefaultAsync(m => m.IdMateria == id);

            if (materia == null)
                return NotFound(new { mensaje = "Materia no encontrada" });

            return Ok(materia);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener materia", error = ex.Message });
        }
    }

    // GET: obtiene las materias activas de una clase (básicas + las de su especialidad).
    [HttpGet("clase/{idClase}")]
    public async Task<ActionResult<IEnumerable<Materia>>> GetMateriasByClase(int idClase)
    {
        try
        {
            var clase = await _context.Clases
                .FirstOrDefaultAsync(c => c.IdClase == idClase);

            if (clase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            var idEspecialidad = clase.IdEspecialidad;

            var materias = await _context.Materias
                .Where(m => m.Estado == true
                    && (m.TipoMateria == "Basica"
                        || (m.TipoMateria == "Especialidad" && idEspecialidad != null && m.IdEspecialidad == idEspecialidad)))
                .OrderBy(m => m.TipoMateria)
                .ThenBy(m => m.NombreMateria)
                .ToListAsync();

            return Ok(materias);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener materias de la clase", error = ex.Message });
        }
    }

    // GET: obtiene las materias de una especialidad específica.
    [HttpGet("especialidad/{idEspecialidad}")]
    public async Task<ActionResult<IEnumerable<Materia>>> GetMateriasByEspecialidad(int idEspecialidad)
    {
        try
        {
            var materias = await _context.Materias
                .Where(m => m.IdEspecialidad == idEspecialidad && m.Estado)
                .OrderBy(m => m.NombreMateria)
                .ToListAsync();
            return Ok(materias);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener materias por especialidad", error = ex.Message });
        }
    }

    // GET: obtiene las materias activas de un tipo (Básica o Especialidad).
    [HttpGet("tipo/{tipo}")]
    public async Task<ActionResult<IEnumerable<Materia>>> GetMateriasByTipo(string tipo)
    {
        try
        {
            var materias = await _context.Materias
                .Where(m => m.TipoMateria == tipo && m.Estado)
                .OrderBy(m => m.NombreMateria)
                .ToListAsync();
            return Ok(materias);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener materias por tipo", error = ex.Message });
        }
    }

    // POST: crea una nueva materia validando que el nombre no exista.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<ActionResult<Materia>> PostMateria([FromBody] MateriaRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.NombreMateria))
                return BadRequest(new { mensaje = "El nombre de la materia es requerido" });

            var existe = await _context.Materias
                .AnyAsync(m => m.NombreMateria == request.NombreMateria && m.Estado);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe una materia con ese nombre" });

            var materia = new Materia
            {
                NombreMateria = request.NombreMateria,
                CodigoMateria = request.CodigoMateria,
                TipoMateria = request.TipoMateria ?? "Basica",
                EscalaMaxima = request.EscalaMaxima ?? 100,
                EscalaMinima = request.EscalaMinima ?? 0,
                NotaMinima = request.NotaMinima ?? 6,
                DecimalesPermitidos = request.DecimalesPermitidos ?? 2,
                IdEspecialidad = request.IdEspecialidad,
                Estado = true
            };

            _context.Materias.Add(materia);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Materia creada correctamente", id = materia.IdMateria });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear materia", error = ex.Message });
        }
    }

    // PUT: actualiza los datos de una materia existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutMateria(int id, [FromBody] MateriaRequest request)
    {
        try
        {
            var materia = await _context.Materias.FindAsync(id);
            if (materia == null)
                return NotFound(new { mensaje = "Materia no encontrada" });

            if (string.IsNullOrEmpty(request.NombreMateria))
                return BadRequest(new { mensaje = "El nombre de la materia es requerido" });

            var existe = await _context.Materias
                .AnyAsync(m => m.NombreMateria == request.NombreMateria && m.IdMateria != id && m.Estado);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe otra materia con ese nombre" });

            materia.NombreMateria = request.NombreMateria;
            materia.CodigoMateria = request.CodigoMateria;
            materia.TipoMateria = request.TipoMateria ?? materia.TipoMateria;
            materia.EscalaMaxima = request.EscalaMaxima ?? materia.EscalaMaxima;
            materia.EscalaMinima = request.EscalaMinima ?? materia.EscalaMinima;
            materia.NotaMinima = request.NotaMinima ?? materia.NotaMinima;
            materia.DecimalesPermitidos = request.DecimalesPermitidos ?? materia.DecimalesPermitidos;
            materia.IdEspecialidad = request.IdEspecialidad;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Materia actualizada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar materia", error = ex.Message });
        }
    }

    // DELETE: desactiva una materia existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMateria(int id)
    {
        try
        {
            var materia = await _context.Materias.FindAsync(id);
            if (materia == null)
                return NotFound(new { mensaje = "Materia no encontrada" });

            materia.Estado = false;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Materia desactivada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar materia", error = ex.Message });
        }
    }
}

public class MateriaRequest
{
    public string NombreMateria { get; set; } = string.Empty;
    public string? CodigoMateria { get; set; }
    public string? TipoMateria { get; set; }
    public decimal? EscalaMaxima { get; set; }
    public decimal? EscalaMinima { get; set; }
    public decimal? NotaMinima { get; set; }
    public int? DecimalesPermitidos { get; set; }
    public int? IdEspecialidad { get; set; }
}
