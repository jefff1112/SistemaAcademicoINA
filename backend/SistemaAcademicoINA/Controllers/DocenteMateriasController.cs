using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;

namespace SistemaAcademicoINA.Controllers;

// Controlador API (autenticado): gestiona las asignaciones de materias a docentes por clase y año lectivo.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocenteMateriasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DocenteMateriasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene todas las asignaciones de materias a docentes.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocenteMateria>>> GetDocenteMaterias()
    {
        var asignaciones = await _context.DocenteMaterias
            .Include(dm => dm.Docente)
            .Include(dm => dm.Materia)
            .Include(dm => dm.Clase)
            .Where(dm => dm.Estado)
            .OrderBy(dm => dm.AnioLectivo)
            .ToListAsync();
        return Ok(asignaciones);
    }

    // GET: obtiene una asignación específica por su id.
    [HttpGet("{id}")]
    public async Task<ActionResult<DocenteMateria>> GetDocenteMateria(int id)
    {
        var asignacion = await _context.DocenteMaterias
            .Include(dm => dm.Docente)
            .Include(dm => dm.Materia)
            .Include(dm => dm.Clase)
            .FirstOrDefaultAsync(dm => dm.IdDocenteMateria == id);

        if (asignacion == null)
            return NotFound(new { mensaje = "Asignacion no encontrada" });

        return Ok(asignacion);
    }

    // GET: obtiene las materias asignadas a un docente en un año lectivo.
    [HttpGet("docente/{idDocente}/anio/{anioLectivo}")]
    public async Task<ActionResult<IEnumerable<DocenteMateria>>> GetByDocenteAnio(int idDocente, int anioLectivo)
    {
        var asignaciones = await _context.DocenteMaterias
            .Include(dm => dm.Materia)
            .Include(dm => dm.Clase)
            .Where(dm => dm.IdDocente == idDocente && dm.AnioLectivo == anioLectivo && dm.Estado)
            .ToListAsync();
        return Ok(asignaciones);
    }

    // GET: obtiene las materias asignadas a una clase en un año lectivo.
    [HttpGet("clase/{idClase}/anio/{anioLectivo}")]
    public async Task<ActionResult<IEnumerable<DocenteMateria>>> GetByClaseAnio(int idClase, int anioLectivo)
    {
        var asignaciones = await _context.DocenteMaterias
            .Include(dm => dm.Docente)
            .Include(dm => dm.Materia)
            .Where(dm => dm.IdClase == idClase && dm.AnioLectivo == anioLectivo && dm.Estado)
            .ToListAsync();
        return Ok(asignaciones);
    }

    // POST: asigna una materia a un docente en una clase, validando duplicados.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<ActionResult<DocenteMateria>> PostDocenteMateria([FromBody] DocenteMateriaRequest request)
    {
        try
        {
            // Verificar que el docente no tenga ya esta materia en esta clase
            var existente = await _context.DocenteMaterias
                .AnyAsync(dm => dm.IdDocente == request.IdDocente &&
                                dm.IdMateria == request.IdMateria &&
                                dm.IdClase == request.IdClase &&
                                dm.AnioLectivo == request.AnioLectivo);

            if (existente)
                return BadRequest(new { mensaje = "El docente ya tiene asignada esta materia en esta clase" });

            // Verificar que la materia+clase no esté ya asignada a OTRO docente
            var ocupadaPorOtro = await _context.DocenteMaterias
                .AnyAsync(dm => dm.IdDocente != request.IdDocente &&
                                dm.IdMateria == request.IdMateria &&
                                dm.IdClase == request.IdClase &&
                                dm.AnioLectivo == request.AnioLectivo);

            if (ocupadaPorOtro)
                return BadRequest(new { mensaje = "Esta materia y clase ya tiene un docente asignado" });

            var asignacion = new DocenteMateria
            {
                IdDocente = request.IdDocente,
                IdMateria = request.IdMateria,
                IdClase = request.IdClase,
                AnioLectivo = request.AnioLectivo,
                PuedeCalificar = request.PuedeCalificar ?? true,
                PuedeAmonestar = request.PuedeAmonestar ?? true,
                Estado = true
            };

            _context.DocenteMaterias.Add(asignacion);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Asignacion creada correctamente", id = asignacion.IdDocenteMateria });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear asignacion", error = ex.Message });
        }
    }

    // PUT: actualiza los permisos de calificar y amonestar de una asignación.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutDocenteMateria(int id, [FromBody] DocenteMateriaRequest request)
    {
        try
        {
            var asignacion = await _context.DocenteMaterias.FindAsync(id);
            if (asignacion == null)
                return NotFound(new { mensaje = "Asignacion no encontrada" });

            asignacion.PuedeCalificar = request.PuedeCalificar ?? asignacion.PuedeCalificar;
            asignacion.PuedeAmonestar = request.PuedeAmonestar ?? asignacion.PuedeAmonestar;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Asignacion actualizada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar asignacion", error = ex.Message });
        }
    }

    // DELETE: elimina una asignación de materia a docente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocenteMateria(int id)
    {
        try
        {
            var asignacion = await _context.DocenteMaterias.FindAsync(id);
            if (asignacion == null)
                return NotFound(new { mensaje = "Asignacion no encontrada" });

            _context.DocenteMaterias.Remove(asignacion);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Asignacion eliminada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar asignacion", error = ex.Message });
        }
    }
}

public class DocenteMateriaRequest
{
    public int IdDocente { get; set; }
    public int IdMateria { get; set; }
    public int IdClase { get; set; }
    public int AnioLectivo { get; set; }
    public bool? PuedeCalificar { get; set; }
    public bool? PuedeAmonestar { get; set; }
}
