using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona las entrevistas de aspirantes (programación, resultado y lista de pendientes).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EntrevistasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EntrevistasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene los aspirantes con entrevista programada (estado "En Espera") con sus datos de entrevista.
    // GET: api/entrevistas
    [HttpGet]
    public async Task<IActionResult> GetEntrevistas()
    {
        var entrevistas = await _context.Aspirantes
            .Where(a => a.EstadoSolicitud == "En Espera" && a.FechaEntrevista != null)
            .Select(a => new
            {
                Id = a.IdAspirante,
                Aspirante = a.Nombres + " " + a.Apellidos,
                FechaEntrevista = a.FechaEntrevista,
                Entrevistador = a.EntrevistadoPor,
                Observaciones = a.ObservacionesEntrevista,
                Estado = a.EstadoSolicitud
            })
            .ToListAsync();

        return Ok(entrevistas);
    }

    // POST: programa la fecha de entrevista de un aspirante y lo deja en estado "En Espera".
    // POST: api/entrevistas/programar
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost("programar")]
    public async Task<IActionResult> ProgramarEntrevista([FromBody] ProgramarEntrevistaRequest request)
    {
        var aspirante = await _context.Aspirantes.FindAsync(request.IdAspirante);
        if (aspirante == null)
            return NotFound(new { mensaje = "Aspirante no encontrado" });

        aspirante.FechaEntrevista = request.FechaEntrevista;
        aspirante.EntrevistadoPor = request.Entrevistador;
        aspirante.EstadoSolicitud = "En Espera";

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Entrevista programada correctamente" });
    }

    // POST: registra el resultado de la entrevista, aprobando o rechazando al aspirante.
    // POST: api/entrevistas/registrar-resultado
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost("registrar-resultado")]
    public async Task<IActionResult> RegistrarResultado([FromBody] RegistrarResultadoRequest request)
    {
        var aspirante = await _context.Aspirantes.FindAsync(request.IdAspirante);
        if (aspirante == null)
            return NotFound(new { mensaje = "Aspirante no encontrado" });

        aspirante.ObservacionesEntrevista = request.Observaciones;

        if (request.Aprobado)
        {
            aspirante.EstadoSolicitud = "Aprobado";
        }
        else
        {
            aspirante.EstadoSolicitud = "Rechazado";
            aspirante.Observaciones = request.MotivoRechazo;
        }

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Resultado registrado correctamente" });
    }

    // GET: obtiene los aspirantes pendientes de entrevista (estado "Pendiente").
    // GET: api/entrevistas/pendientes
    [HttpGet("pendientes")]
    public async Task<IActionResult> GetAspirantesPendientes()
    {
        var pendientes = await _context.Aspirantes
            .Where(a => a.EstadoSolicitud == "Pendiente")
            .Select(a => new
            {
                a.IdAspirante,
                a.Nombres,
                a.Apellidos,
                a.EspecialidadAspira,
                a.Correo,
                a.Telefono
            })
            .ToListAsync();

        return Ok(pendientes);
    }
}

public class ProgramarEntrevistaRequest
{
    public int IdAspirante { get; set; }
    public DateTime FechaEntrevista { get; set; }
    public string Entrevistador { get; set; } = string.Empty;
}

public class RegistrarResultadoRequest
{
    public int IdAspirante { get; set; }
    public bool Aprobado { get; set; }
    public string Observaciones { get; set; } = string.Empty;
    public string? MotivoRechazo { get; set; }
}
