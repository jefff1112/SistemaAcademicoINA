using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona los endpoints de asistencia de estudiantes (registro, consulta y justificación).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AsistenciasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AsistenciasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene las asistencias de una clase en una fecha determinada.
    [HttpGet("clase/{idClase}/{fecha}")]
    public async Task<ActionResult> GetAsistenciasClase(int idClase, DateTime fecha)
    {
        var asistencias = await _context.Asistencias
            .Where(a => a.IdClase == idClase && a.Fecha.Date == fecha.Date)
            .Select(a => new
            {
                a.IdAsistencia,
                a.IdEstudiante,
                a.Estado,
                a.HoraRegistro,
                a.MinutosTarde,
                a.Observaciones
            })
            .ToListAsync();

        return Ok(asistencias);
    }

    // GET: obtiene el historial de asistencias de un estudiante en un año lectivo.
    [HttpGet("estudiante/{idEstudiante}/{anioLectivo}")]
    public async Task<ActionResult> GetAsistenciasByEstudiante(int idEstudiante, int anioLectivo)
    {
        var asistencias = await _context.Asistencias
            .Where(a => a.IdEstudiante == idEstudiante && a.Fecha.Year == anioLectivo)
            .OrderByDescending(a => a.Fecha)
            .Select(a => new
            {
                a.IdAsistencia,
                a.Fecha,
                a.Estado,
                a.HoraRegistro,
                a.MinutosTarde,
                a.Justificacion
            })
            .ToListAsync();

        return Ok(asistencias);
    }

    // POST: registra la asistencia del estudiante, evitando duplicados por fecha.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    [HttpPost]
    public async Task<ActionResult<Asistencia>> PostAsistencia(Asistencia asistencia)
    {
        var existe = await _context.Asistencias
            .AnyAsync(a => a.IdEstudiante == asistencia.IdEstudiante
                && a.IdClase == asistencia.IdClase
                && a.Fecha.Date == asistencia.Fecha.Date);

        if (existe)
            return BadRequest("Ya existe una asistencia registrada para este estudiante en esta fecha");

        asistencia.HoraRegistro = DateTime.Now.TimeOfDay;
        _context.Asistencias.Add(asistencia);
        await _context.SaveChangesAsync();

        await RegistrarAuditoria("Registrar asistencia",
            $"Estudiante {asistencia.IdEstudiante} - {asistencia.Estado} - Clase {asistencia.IdClase} - Hora {asistencia.HoraRegistro.ToString(@"hh\:mm\:ss")}");

        return Ok(new { mensaje = "Asistencia registrada", id = asistencia.IdAsistencia });
    }

    // PUT: actualiza estado, minutos de tardanza y observaciones de una asistencia.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutAsistencia(int id, Asistencia asistencia)
    {
        var existente = await _context.Asistencias.FindAsync(id);
        if (existente == null)
            return NotFound(new { mensaje = "Asistencia no encontrada" });

        if (!string.IsNullOrEmpty(asistencia.Estado))
            existente.Estado = asistencia.Estado;
        if (asistencia.MinutosTarde.HasValue)
            existente.MinutosTarde = asistencia.MinutosTarde;
        if (asistencia.Observaciones != null)
            existente.Observaciones = asistencia.Observaciones;
        if (asistencia.Justificacion != null)
            existente.Justificacion = asistencia.Justificacion;

        existente.HoraRegistro = DateTime.Now.TimeOfDay;

        await _context.SaveChangesAsync();

        await RegistrarAuditoria("Editar asistencia",
            $"Asistencia {id} - Estudiante {existente.IdEstudiante} - Nuevo estado {existente.Estado} - Hora {existente.HoraRegistro.ToString(@"hh\:mm\:ss")}");

        return Ok(new { mensaje = "Asistencia actualizada" });
    }

    // POST: marca una asistencia como justificada con el motivo indicado.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    [HttpPost("justificar/{id}")]
    public async Task<IActionResult> JustificarAsistencia(int id, [FromBody] string justificacion)
    {
        var asistencia = await _context.Asistencias.FindAsync(id);
        if (asistencia == null)
            return NotFound();

        asistencia.Estado = "Justificado";
        asistencia.Justificacion = justificacion;
        asistencia.HoraRegistro = DateTime.Now.TimeOfDay;
        await _context.SaveChangesAsync();

        await RegistrarAuditoria("Justificar asistencia",
            $"Asistencia {id} - Estudiante {asistencia.IdEstudiante} - Motivo: {justificacion}");

        return Ok(new { mensaje = "Asistencia justificada" });
    }

    // Guarda la constancia (registro de auditoría) de las acciones sobre asistencias.
    private async Task RegistrarAuditoria(string accion, string detalle)
    {
        try
        {
            var usuario = User.FindFirst(ClaimTypes.Name)?.Value ?? User.Identity?.Name ?? "Sistema";

            _context.Auditoria.Add(new Auditoria
            {
                Usuario = usuario,
                Accion = accion,
                Detalle = detalle,
                Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                Fecha = DateTime.Now,
                CreatedAt = DateTime.Now
            });
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al registrar auditoria de asistencia: {ex.Message}");
        }
    }
}
