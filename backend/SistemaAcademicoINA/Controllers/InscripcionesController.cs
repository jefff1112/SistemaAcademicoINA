using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona las inscripciones de estudiantes a clases (consulta, cambio de clase y estados).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InscripcionesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InscripcionesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene todas las inscripciones con datos de estudiante y clase.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Inscripcion>>> GetInscripciones()
    {
        var inscripciones = await _context.Inscripciones
            .Include(i => i.Estudiante)
            .Include(i => i.Clase)
            .OrderByDescending(i => i.FechaInscripcion)
            .ToListAsync();
        return Ok(inscripciones);
    }

    // GET: obtiene una inscripción por su id.
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Inscripcion>> GetInscripcion(int id)
    {
        var inscripcion = await _context.Inscripciones
            .Include(i => i.Estudiante)
            .Include(i => i.Clase)
            .FirstOrDefaultAsync(i => i.IdInscripciones == id);

        if (inscripcion == null)
            return NotFound(new { mensaje = "Inscripcion no encontrada" });

        return Ok(inscripcion);
    }

    // GET: obtiene las inscripciones de un estudiante.
    [HttpGet("estudiante/{idEstudiante}")]
    public async Task<ActionResult<IEnumerable<Inscripcion>>> GetInscripcionesByEstudiante(int idEstudiante)
    {
        var inscripciones = await _context.Inscripciones
            .Include(i => i.Clase)
            .Where(i => i.IdEstudiante == idEstudiante)
            .OrderByDescending(i => i.AnioLectivo)
            .ToListAsync();
        return Ok(inscripciones);
    }

    // GET: obtiene las inscripciones de una clase en un año lectivo.
    [HttpGet("clase/{idClase}/anio/{anioLectivo}")]
    public async Task<ActionResult<IEnumerable<Inscripcion>>> GetInscripcionesByClaseAnio(int idClase, int anioLectivo)
    {
        var inscripciones = await _context.Inscripciones
            .Include(i => i.Estudiante)
            .Where(i => i.IdClase == idClase && i.AnioLectivo == anioLectivo)
            .OrderBy(i => i.FechaInscripcion)
            .ToListAsync();
        return Ok(inscripciones);
    }

    // POST: inscribe a un estudiante en una clase, validando duplicados y cupos disponibles.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<ActionResult<Inscripcion>> PostInscripcion([FromBody] InscripcionRequest request)
    {
        try
        {
            var existe = await _context.Inscripciones
                .AnyAsync(i => i.IdEstudiante == request.IdEstudiante &&
                               i.IdClase == request.IdClase &&
                               i.AnioLectivo == request.AnioLectivo);

            if (existe)
                return BadRequest(new { mensaje = "El estudiante ya esta inscrito en esta clase" });

            var clase = await _context.Clases.FindAsync(request.IdClase);
            if (clase == null)
                return BadRequest(new { mensaje = "Clase no encontrada" });

            if (clase.CupoActual >= clase.CupoMaximo)
                return BadRequest(new { mensaje = "No hay cupos disponibles en esta clase" });

            if (clase.IdEspecialidad.HasValue)
            {
                var cupo = await _context.CuposEspecialidades
                    .FirstOrDefaultAsync(c => c.IdEspecialidad == clase.IdEspecialidad &&
                                              c.Seccion == clase.Seccion &&
                                              c.AnioLectivo == request.AnioLectivo);

                if (cupo != null && cupo.CuposOcupados >= cupo.CuposTotales)
                    return BadRequest(new { mensaje = "No hay cupos disponibles en esta especialidad/seccion" });
            }

            var inscripcion = new Inscripcion
            {
                IdEstudiante = request.IdEstudiante,
                IdClase = request.IdClase,
                AnioLectivo = request.AnioLectivo,
                FechaInscripcion = DateTime.Now,
                FechaMatricula = request.FechaMatricula ?? DateTime.Now,
                TipoInscripcion = request.TipoInscripcion ?? "Nuevo Ingreso",
                EstadoInscripcion = "Confirmada",
                EstadoAprobacion = "Aprobada"
            };

            _context.Inscripciones.Add(inscripcion);
            clase.CupoActual++;

            if (clase.IdEspecialidad.HasValue)
            {
                var cupo = await _context.CuposEspecialidades
                    .FirstOrDefaultAsync(c => c.IdEspecialidad == clase.IdEspecialidad &&
                                              c.Seccion == clase.Seccion &&
                                              c.AnioLectivo == request.AnioLectivo);

                if (cupo != null)
                    cupo.CuposOcupados++;
            }

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Inscripcion realizada correctamente", id = inscripcion.IdInscripciones });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear inscripcion", error = ex.Message });
        }
    }

    // POST: cambia de clase a una inscripción, ajustando los cupos de ambas clases.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost("cambiar-clase")]
    public async Task<IActionResult> CambiarClaseInscripcion([FromBody] CambiarClasePorInscripcionDto dto)
    {
        try
        {
            Inscripcion? inscripcion = null;
            if (dto.IdInscripcion > 0)
            {
                inscripcion = await _context.Inscripciones.FindAsync(dto.IdInscripcion);
            }
            else if (dto.IdEstudiante > 0)
            {
                inscripcion = await _context.Inscripciones
                    .Where(i => i.IdEstudiante == dto.IdEstudiante)
                    .OrderByDescending(i => i.FechaInscripcion)
                    .FirstOrDefaultAsync();
            }

            if (inscripcion == null)
                return NotFound(new { mensaje = "Inscripcion no encontrada" });

            var claseNueva = await _context.Clases.FindAsync(dto.IdClaseNueva);
            if (claseNueva == null)
                return NotFound(new { mensaje = "Clase nueva no encontrada" });

            if (claseNueva.CupoActual >= claseNueva.CupoMaximo)
                return BadRequest(new { mensaje = "La clase destino no tiene cupos disponibles" });

            var claseAnterior = await _context.Clases.FindAsync(inscripcion.IdClase);
            if (claseAnterior != null)
                claseAnterior.CupoActual--;

            claseNueva.CupoActual++;
            inscripcion.IdClase = dto.IdClaseNueva;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Clase de la inscripción actualizada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al cambiar clase de la inscripción", error = ex.Message });
        }
    }

    // PUT: actualiza el estado de una inscripción, liberando cupo si se cancela o retira.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id:int}/estado")]
    public async Task<IActionResult> UpdateEstado(int id, [FromBody] UpdateEstadoInscripcionRequest request)
    {
        try
        {
            var inscripcion = await _context.Inscripciones.FindAsync(id);
            if (inscripcion == null)
                return NotFound(new { mensaje = "Inscripcion no encontrada" });

            var estadoNormalizado = request.EstadoInscripcion switch
            {
                "Inactiva" => "Cancelada",
                _ => request.EstadoInscripcion
            };

            if (estadoNormalizado == "Cancelada" || estadoNormalizado == "Retirado")
            {
                var clase = await _context.Clases.FindAsync(inscripcion.IdClase);
                if (clase != null && clase.CupoActual > 0)
                    clase.CupoActual--;
            }

            inscripcion.EstadoInscripcion = estadoNormalizado;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Estado actualizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar estado", error = ex.Message });
        }
    }
}

public class CambiarClasePorInscripcionDto
{
    public int IdInscripcion { get; set; }
    public int IdEstudiante { get; set; }
    public int IdClaseNueva { get; set; }
}

public class InscripcionRequest
{
    public int IdEstudiante { get; set; }
    public int IdClase { get; set; }
    public int AnioLectivo { get; set; }
    public DateTime? FechaMatricula { get; set; }
    public string? TipoInscripcion { get; set; }
}

public class UpdateEstadoInscripcionRequest
{
    public string EstadoInscripcion { get; set; } = string.Empty;  
}
