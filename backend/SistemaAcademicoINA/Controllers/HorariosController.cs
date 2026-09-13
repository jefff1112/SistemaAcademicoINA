using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona los horarios de clases por estudiante, docente y clase.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HorariosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HorariosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene el horario de un estudiante según su clase.
    [HttpGet("estudiante/{idEstudiante}")]
    public async Task<ActionResult> GetHorarioByEstudiante(int idEstudiante)
    {
        var estudiante = await _context.Estudiantes
            .FirstOrDefaultAsync(e => e.IdEstudiante == idEstudiante);

        if (estudiante == null || estudiante.IdClase == null)
            return Ok(new List<object>());

        var horario = await _context.Horarios
            .Include(h => h.Materia)
            .Include(h => h.Docente)
            .Where(h => h.IdClase == estudiante.IdClase && h.Estado && h.AnioLectivo == DateTime.Now.Year)
            .OrderBy(h => h.DiaSemana)
            .ThenBy(h => h.HoraInicio)
            .Select(h => new
            {
                h.IdHorario,
                h.DiaSemana,
                h.HoraInicio,
                h.HoraFin,
                Materia = h.Materia != null ? h.Materia.NombreMateria : "Sin materia",
                Docente = h.Docente != null ? h.Docente.Nombres + " " + h.Docente.Apellidos : "Sin docente",
                h.Aula
            })
            .ToListAsync();

        return Ok(horario);
    }

    // GET: obtiene el horario de un docente.
    [HttpGet("docente/{idDocente}")]
    public async Task<ActionResult> GetHorarioByDocente(int idDocente)
    {
        var horario = await _context.Horarios
            .Include(h => h.Materia)
            .Include(h => h.Clase)
            .Where(h => h.IdDocente == idDocente && h.Estado && h.AnioLectivo == DateTime.Now.Year)
            .OrderBy(h => h.DiaSemana)
            .ThenBy(h => h.HoraInicio)
            .Select(h => new
            {
                h.IdHorario,
                h.DiaSemana,
                h.HoraInicio,
                h.HoraFin,
                Materia = h.Materia != null ? h.Materia.NombreMateria : "Sin materia",
                Clase = h.Clase != null ? h.Clase.NombreClase : "Sin clase",
                h.Aula
            })
            .ToListAsync();

        return Ok(horario);
    }

    // GET: obtiene el horario de una clase específica.
    [HttpGet("clase/{idClase}")]
    public async Task<ActionResult> GetHorarioByClase(int idClase)
    {
        var horario = await _context.Horarios
            .Include(h => h.Materia)
            .Include(h => h.Docente)
            .Where(h => h.IdClase == idClase && h.Estado && h.AnioLectivo == DateTime.Now.Year)
            .OrderBy(h => h.DiaSemana)
            .ThenBy(h => h.HoraInicio)
            .Select(h => new
            {
                h.IdHorario,
                h.IdMateria,
                h.IdDocente,
                h.DiaSemana,
                h.HoraInicio,
                h.HoraFin,
                h.Aula,
                Materia = h.Materia != null ? h.Materia.NombreMateria : "Sin materia",
                Docente = h.Docente != null ? h.Docente.Nombres + " " + h.Docente.Apellidos : "Sin docente"
            })
            .ToListAsync();

        return Ok(horario);
    }

    // POST: crea un nuevo horario validando día, hora y datos obligatorios.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<IActionResult> PostHorario([FromBody] HorarioRequest request)
    {
        try
        {
            if (request.IdClase <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar una clase" });

            if (request.IdMateria <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar una materia" });

            if (request.IdDocente <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar un docente" });

            if (string.IsNullOrEmpty(request.DiaSemana))
                return BadRequest(new { mensaje = "Debe seleccionar un día" });

            if (request.HoraInicio >= request.HoraFin)
                return BadRequest(new { mensaje = "La hora de inicio debe ser menor que la hora de fin" });

            var existe = await _context.Horarios
                .AnyAsync(h => h.Estado
                    && h.IdClase == request.IdClase
                    && h.DiaSemana == request.DiaSemana
                    && h.HoraInicio == request.HoraInicio
                    && h.AnioLectivo == request.AnioLectivo);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe un horario en este día y hora" });

            var horario = new Horario
            {
                IdClase = request.IdClase,
                IdMateria = request.IdMateria,
                IdDocente = request.IdDocente,
                DiaSemana = request.DiaSemana,
                HoraInicio = request.HoraInicio,
                HoraFin = request.HoraFin,
                Aula = request.Aula,
                AnioLectivo = request.AnioLectivo,
                Jornada = request.Jornada ?? "Matutina",
                Estado = true
            };

            _context.Horarios.Add(horario);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Horario creado correctamente", id = horario.IdHorario });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear horario", error = ex.Message });
        }
    }

    // PUT: actualiza los datos de un horario existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHorario(int id, [FromBody] HorarioRequest request)
    {
        try
        {
            var horario = await _context.Horarios.FindAsync(id);
            if (horario == null)
                return NotFound(new { mensaje = "Horario no encontrado" });

            if (request.IdClase <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar una clase" });

            if (request.IdMateria <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar una materia" });

            if (request.IdDocente <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar un docente" });

            if (string.IsNullOrEmpty(request.DiaSemana))
                return BadRequest(new { mensaje = "Debe seleccionar un día" });

            horario.IdClase = request.IdClase;
            horario.IdMateria = request.IdMateria;
            horario.IdDocente = request.IdDocente;
            horario.DiaSemana = request.DiaSemana;
            horario.HoraInicio = request.HoraInicio;
            horario.HoraFin = request.HoraFin;
            horario.Aula = request.Aula;
            horario.AnioLectivo = request.AnioLectivo;
            horario.Jornada = request.Jornada ?? horario.Jornada;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Horario actualizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar horario", error = ex.Message });
        }
    }

    // DELETE: desactiva un horario existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHorario(int id)
    {
        try
        {
            var horario = await _context.Horarios.FindAsync(id);
            if (horario == null)
                return NotFound(new { mensaje = "Horario no encontrado" });

            horario.Estado = false;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Horario eliminado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar horario", error = ex.Message });
        }
    }
}

public class HorarioRequest
{
    public int IdClase { get; set; }
    public int IdMateria { get; set; }
    public int IdDocente { get; set; }
    public string DiaSemana { get; set; } = string.Empty;
    public TimeSpan HoraInicio { get; set; }
    public TimeSpan HoraFin { get; set; }
    public string? Aula { get; set; }
    public int AnioLectivo { get; set; }
    public string? Jornada { get; set; }
}
