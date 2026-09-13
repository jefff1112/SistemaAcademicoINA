// Controlador API de asignación docente -> módulo -> clase.
// Solo Dirección/Registro gestionan qué docente imparte cada módulo.
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;

namespace SistemaAcademicoINA.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocenteModulosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DocenteModulosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ============================================================
    // GET: api/docenteModulos?clase={id}&modulo={id}&docente={id}&anio={n}
    // ============================================================
    [HttpGet]
    public async Task<IActionResult> GetAsignaciones(
        [FromQuery] int? clase, [FromQuery] int? modulo, [FromQuery] int? docente, [FromQuery] int? anio)
    {
        var query = _context.DocenteModulos
            .Include(d => d.Docente)
            .Include(d => d.Modulo)
            .Include(d => d.Clase)
            .AsQueryable();

        if (clase.HasValue) query = query.Where(d => d.IdClase == clase.Value);
        if (modulo.HasValue) query = query.Where(d => d.IdModulo == modulo.Value);
        if (docente.HasValue) query = query.Where(d => d.IdDocente == docente.Value);
        if (anio.HasValue) query = query.Where(d => d.AnioLectivo == anio.Value);

        var lista = await query.OrderBy(d => d.IdModulo).ToListAsync();

        return Ok(lista.Select(d => new
        {
            d.IdDocenteModulo,
            d.IdDocente,
            d.IdModulo,
            d.IdClase,
            d.AnioLectivo,
            d.Estado,
            Docente = d.Docente != null ? $"{d.Docente.Apellidos}, {d.Docente.Nombres}" : "",
            Modulo = d.Modulo != null ? new { d.Modulo.IdModulo, d.Modulo.NombreModulo, d.Modulo.NumeroGrado, d.Modulo.NumeroModulo, Codigo = d.Modulo.Codigo } : null,
            Clase = d.Clase?.NombreClase ?? ""
        }));
    }

    // ============================================================
    // POST: api/docenteModulos
    // Asigna un docente a un módulo de una clase. También marca la
    // actividad-módulo con el docente correspondiente.
    // ============================================================
    [HttpPost]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public async Task<IActionResult> Asignar([FromBody] DocenteModuloRequest request)
    {
        if (request.IdDocente <= 0 || request.IdModulo <= 0 || request.IdClase <= 0)
            return BadRequest(new { mensaje = "Docente, módulo y clase son requeridos" });

        int anio = request.AnioLectivo > 0 ? request.AnioLectivo : DateTime.Now.Year;

        var existe = await _context.DocenteModulos.FirstOrDefaultAsync(d =>
            d.IdDocente == request.IdDocente && d.IdModulo == request.IdModulo
            && d.IdClase == request.IdClase && d.AnioLectivo == anio);

        if (existe != null)
            return BadRequest(new { mensaje = "Ese módulo ya está asignado a ese docente en esta clase" });

        var asignacion = new DocenteModulo
        {
            IdDocente = request.IdDocente,
            IdModulo = request.IdModulo,
            IdClase = request.IdClase,
            AnioLectivo = anio,
            Estado = true,
            CreatedAt = DateTime.Now
        };
        _context.DocenteModulos.Add(asignacion);
        await _context.SaveChangesAsync();

        // Marcar la actividad-módulo con el docente (si existe)
        var actividad = await _context.Actividades
            .FirstOrDefaultAsync(a => a.IdModulo == request.IdModulo && a.IdClase == request.IdClase && a.EsModulo);
        if (actividad != null)
        {
            actividad.IdDocente = request.IdDocente;
            actividad.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
        }

        return Ok(new { mensaje = "Docente asignado al módulo", id = asignacion.IdDocenteModulo });
    }

    // ============================================================
    // DELETE: api/docenteModulos/{id}
    // ============================================================
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public async Task<IActionResult> Desasignar(int id)
    {
        var asignacion = await _context.DocenteModulos.FindAsync(id);
        if (asignacion == null)
            return NotFound(new { mensaje = "Asignación no encontrada" });

        _context.DocenteModulos.Remove(asignacion);
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Asignación eliminada" });
    }
}

public class DocenteModuloRequest
{
    public int IdDocente { get; set; }
    public int IdModulo { get; set; }
    public int IdClase { get; set; }
    public int AnioLectivo { get; set; }
}