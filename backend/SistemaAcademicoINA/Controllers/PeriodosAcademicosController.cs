using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona los periodos académicos del sistema (creación, consulta y cierre).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PeriodosAcademicosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PeriodosAcademicosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene todos los periodos académicos ordenados por año y número.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PeriodoAcademico>>> GetPeriodos()
    {
        var periodos = await _context.PeriodosAcademicos
            .OrderByDescending(p => p.AnioLectivo)
            .ThenBy(p => p.NumeroPeriodo)
            .ToListAsync();
        return Ok(periodos);
    }

    // GET: obtiene un periodo por su id.
    [HttpGet("{id}")]
    public async Task<ActionResult<PeriodoAcademico>> GetPeriodo(int id)
    {
        var periodo = await _context.PeriodosAcademicos.FindAsync(id);
        if (periodo == null)
            return NotFound(new { mensaje = "Periodo no encontrado" });

        return Ok(periodo);
    }

    // GET: obtiene el periodo académico actualmente activo.
    [HttpGet("activo")]
    public async Task<ActionResult<PeriodoAcademico>> GetPeriodoActivo()
    {
        var periodo = await _context.PeriodosAcademicos
            .FirstOrDefaultAsync(p => p.Estado == "Activo");

        if (periodo == null)
            return NotFound(new { mensaje = "No hay un periodo activo" });

        return Ok(periodo);
    }

    // GET: obtiene los periodos de un año lectivo específico.
    [HttpGet("anio/{anioLectivo}")]
    public async Task<ActionResult<IEnumerable<PeriodoAcademico>>> GetPeriodosByAnio(int anioLectivo)
    {
        var periodos = await _context.PeriodosAcademicos
            .Where(p => p.AnioLectivo == anioLectivo)
            .OrderBy(p => p.NumeroPeriodo)
            .ToListAsync();
        return Ok(periodos);
    }

    // POST: crea un periodo académico y cierra los demás si se marca como activo.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<ActionResult<PeriodoAcademico>> PostPeriodo([FromBody] PeriodoRequest request)
    {
        try
        {
            var existe = await _context.PeriodosAcademicos
                .AnyAsync(p => p.AnioLectivo == request.AnioLectivo && p.NumeroPeriodo == request.NumeroPeriodo);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe un periodo con ese numero en ese año" });

            if (request.Estado == "Activo")
            {
                var periodosActivos = await _context.PeriodosAcademicos
                    .Where(p => p.AnioLectivo == request.AnioLectivo && p.Estado == "Activo")
                    .ToListAsync();

                foreach (var p in periodosActivos)
                {
                    p.Estado = "Cerrado";
                }
            }

            var periodo = new PeriodoAcademico
            {
                AnioLectivo = request.AnioLectivo,
                NumeroPeriodo = request.NumeroPeriodo,
                Nombre = request.Nombre,
                FechaInicio = request.FechaInicio,
                FechaFin = request.FechaFin,
                Estado = request.Estado ?? "Cerrado"
            };

            _context.PeriodosAcademicos.Add(periodo);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Periodo creado correctamente", id = periodo.IdPeriodo });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear periodo", error = ex.Message });
        }
    }

    // PUT: actualiza un periodo académico, cerrando los demás si pasa a activo.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPeriodo(int id, [FromBody] PeriodoRequest request)
    {
        try
        {
            var periodo = await _context.PeriodosAcademicos.FindAsync(id);
            if (periodo == null)
                return NotFound(new { mensaje = "Periodo no encontrado" });

            if (request.Estado == "Activo" && periodo.Estado != "Activo")
            {
                var periodosActivos = await _context.PeriodosAcademicos
                    .Where(p => p.AnioLectivo == request.AnioLectivo && p.Estado == "Activo" && p.IdPeriodo != id)
                    .ToListAsync();

                foreach (var p in periodosActivos)
                {
                    p.Estado = "Cerrado";
                }
            }

            periodo.AnioLectivo = request.AnioLectivo;
            periodo.NumeroPeriodo = request.NumeroPeriodo;
            periodo.Nombre = request.Nombre;
            periodo.FechaInicio = request.FechaInicio;
            periodo.FechaFin = request.FechaFin;
            periodo.Estado = request.Estado ?? periodo.Estado;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Periodo actualizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar periodo", error = ex.Message });
        }
    }

    // DELETE: cierra un periodo académico existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePeriodo(int id)
    {
        try
        {
            var periodo = await _context.PeriodosAcademicos.FindAsync(id);
            if (periodo == null)
                return NotFound(new { mensaje = "Periodo no encontrado" });

            periodo.Estado = "Cerrado";
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Periodo desactivado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar periodo", error = ex.Message });
        }
    }
}

public class PeriodoRequest
{
    public int AnioLectivo { get; set; }
    public int NumeroPeriodo { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public string? Estado { get; set; }
}
