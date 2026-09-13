using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona el registro y consulta de faltas y amonestaciones de estudiantes.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FaltasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FaltasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene todas las faltas ordenadas por fecha.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FaltaAmonestacion>>> GetFaltas()
    {
        var faltas = await _context.FaltasAmonestaciones
            .OrderByDescending(f => f.Fecha)
            .ToListAsync();
        return Ok(faltas);
    }

    // GET: obtiene una falta específica por su id.
    [HttpGet("{id}")]
    public async Task<ActionResult<FaltaAmonestacion>> GetFalta(int id)
    {
        var falta = await _context.FaltasAmonestaciones.FindAsync(id);
        if (falta == null)
            return NotFound(new { mensaje = "Falta no encontrada" });

        return Ok(falta);
    }

    // GET: obtiene las faltas de un estudiante.
    [HttpGet("estudiante/{idEstudiante}")]
    public async Task<ActionResult<IEnumerable<FaltaAmonestacion>>> GetFaltasByEstudiante(int idEstudiante)
    {
        var faltas = await _context.FaltasAmonestaciones
            .Where(f => f.IdEstudiante == idEstudiante)
            .OrderByDescending(f => f.Fecha)
            .ToListAsync();
        return Ok(faltas);
    }

    // GET: obtiene el resumen de faltas de un estudiante por gravedad y puntos.
    [HttpGet("resumen/estudiante/{idEstudiante}")]
    public async Task<ActionResult> GetResumenFaltas(int idEstudiante)
    {
        var faltas = await _context.FaltasAmonestaciones
            .Where(f => f.IdEstudiante == idEstudiante && f.Estado == "Activa")
            .ToListAsync();

        var resumen = new
        {
            totalFaltas = faltas.Count,
            totalPuntos = faltas.Sum(f => f.PuntosDemerito),
            leves = faltas.Count(f => f.Gravedad == "Leve"),
            moderadas = faltas.Count(f => f.Gravedad == "Moderada"),
            graves = faltas.Count(f => f.Gravedad == "Grave"),
            muyGraves = faltas.Count(f => f.Gravedad == "Muy Grave")
        };

        return Ok(resumen);
    }

    // PUT: actualiza el estado de una falta existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    [HttpPut("{id}/estado")]
    public async Task<IActionResult> UpdateEstado(int id, [FromBody] UpdateEstadoRequest request)
    {
        try
        {
            var falta = await _context.FaltasAmonestaciones.FindAsync(id);
            if (falta == null)
                return NotFound(new { mensaje = "Falta no encontrada" });

            falta.Estado = request.Estado;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Estado actualizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar estado", error = ex.Message });
        }
    }
}

public class UpdateEstadoRequest
{
    public string Estado { get; set; } = string.Empty;
}
