using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using SistemaAcademicoINA.Helpers;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona la conducta de los estudiantes (faltas, amonestaciones, anulación, apelación y calificación manual por periodo).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConductaController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly AuditoriaHelper _auditoriaHelper;

    // Calificaciones disponibles para la calificación oficial de conducta por periodo (enum de la tabla conducta_periodos).
    private static readonly string[] CalificacionesDisponibles =
        { "Excelente", "Muy Bueno", "Bueno", "Suficiente", "Necesita Mejorar" };

    public ConductaController(ApplicationDbContext context, AuditoriaHelper auditoriaHelper)
    {
        _context = context;
        _auditoriaHelper = auditoriaHelper;
    }

    // GET: obtiene las faltas activas de un estudiante con su calificación de conducta según puntos.
    [HttpGet("estudiante/{idEstudiante}")]
    public async Task<ActionResult> GetConductaByEstudiante(int idEstudiante)
    {
        var conducta = await _context.FaltasAmonestaciones
            .Where(f => f.IdEstudiante == idEstudiante && f.Estado == "Activa")
            .OrderByDescending(f => f.Fecha)
            .Select(f => new
            {
                f.IdFaltas,
                f.Tipo,
                f.Gravedad,
                f.Fecha,
                f.Descripcion,
                f.PuntosDemerito,
                f.Estado
            })
            .ToListAsync();

        var totalPuntos = conducta.Sum(c => c.PuntosDemerito);

        var registro = await _context.ConductaPeriodos
            .Where(c => c.IdEstudiante == idEstudiante)
            .OrderByDescending(c => c.IdPeriodo)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            conducta,
            totalPuntos,
            calificacion = ObtenerCalificacion(totalPuntos),
            registroPeriodo = ObtenerRegistroDto(registro)
        });
    }

    // GET: obtiene las faltas de un estudiante dentro de un periodo académico específico.
    [HttpGet("estudiante/{idEstudiante}/periodo/{idPeriodo}")]
    public async Task<ActionResult> GetConductaByEstudiantePeriodo(int idEstudiante, int idPeriodo)
    {
        var periodo = await _context.PeriodosAcademicos.FindAsync(idPeriodo);
        if (periodo == null)
            return NotFound(new { mensaje = "Periodo no encontrado" });

        var conducta = await _context.FaltasAmonestaciones
            .Where(f => f.IdEstudiante == idEstudiante &&
                        f.IdPeriodo == idPeriodo &&
                        f.Estado == "Activa")
            .OrderByDescending(f => f.Fecha)
            .ToListAsync();

        var totalPuntos = conducta.Sum(c => c.PuntosDemerito);

        var registro = await _context.ConductaPeriodos
            .FirstOrDefaultAsync(c => c.IdEstudiante == idEstudiante && c.IdPeriodo == idPeriodo);

        return Ok(new
        {
            conducta,
            totalPuntos,
            calificacion = ObtenerCalificacion(totalPuntos),
            registroPeriodo = ObtenerRegistroDto(registro)
        });
    }

    // GET: obtiene la conducta de todos los estudiantes de una clase en un periodo (puntos, calificación calculada y calificación oficial).
    [HttpGet("clase/{idClase}/periodo/{idPeriodo}")]
    public async Task<ActionResult> GetConductaPorClase(int idClase, int idPeriodo)
    {
        var periodo = await _context.PeriodosAcademicos.FindAsync(idPeriodo);
        if (periodo == null)
            return NotFound(new { mensaje = "Periodo no encontrado" });

        var estudiantes = await _context.Estudiantes
            .Where(e => e.IdClase == idClase && e.Estado)
            .OrderBy(e => e.Apellidos)
            .ThenBy(e => e.Nombres)
            .ToListAsync();

        var idsEstudiantes = estudiantes.Select(e => e.IdEstudiante).ToList();

        var faltas = idsEstudiantes.Count > 0
            ? await _context.FaltasAmonestaciones
                .Where(f => idsEstudiantes.Contains(f.IdEstudiante) &&
                            f.IdPeriodo == idPeriodo &&
                            f.Estado == "Activa")
                .ToListAsync()
            : new List<FaltaAmonestacion>();

        var registros = idsEstudiantes.Count > 0
            ? await _context.ConductaPeriodos
                .Where(c => idsEstudiantes.Contains(c.IdEstudiante) && c.IdPeriodo == idPeriodo)
                .ToListAsync()
            : new List<ConductaPeriodo>();

        var resultado = estudiantes.Select(e =>
        {
            var puntos = faltas.Where(f => f.IdEstudiante == e.IdEstudiante).Sum(f => f.PuntosDemerito);
            var registro = registros.FirstOrDefault(c => c.IdEstudiante == e.IdEstudiante);
            return new
            {
                e.IdEstudiante,
                e.Nombres,
                e.Apellidos,
                e.CodigoEstudiante,
                totalPuntos = puntos,
                calificacion = ObtenerCalificacion(puntos),
                registroPeriodo = ObtenerRegistroDto(registro)
            };
        }).ToList();

        return Ok(resultado);
    }

    // POST: registra una falta o amonestación a un estudiante, asociándola a su periodo académico.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    [HttpPost]
    public async Task<ActionResult> PostConducta([FromBody] ConductaRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Tipo) ||
                !new[] { "Falta", "Amonestacion", "Demerito" }.Contains(request.Tipo))
                return BadRequest(new { mensaje = "Tipo invalido. Opciones: Falta, Amonestacion, Demerito" });

            var fecha = request.Fecha ?? DateTime.Now;

            // Resuelve el periodo de la falta: el enviado explícitamente o el que contiene la fecha.
            var idPeriodo = request.IdPeriodo;
            if (idPeriodo == null)
            {
                var periodoFecha = await _context.PeriodosAcademicos
                    .Where(p => fecha >= p.FechaInicio && fecha <= p.FechaFin)
                    .Select(p => (int?)p.IdPeriodo)
                    .FirstOrDefaultAsync();
                idPeriodo = periodoFecha;
            }

            var falta = new FaltaAmonestacion
            {
                IdEstudiante = request.IdEstudiante,
                IdDocente = request.IdDocente,
                Tipo = request.Tipo,
                Gravedad = request.Gravedad ?? "Leve",
                Fecha = fecha,
                IdPeriodo = idPeriodo,
                Descripcion = request.Descripcion,
                PuntosDemerito = request.PuntosDemerito ?? ObtenerPuntosPorGravedad(request.Gravedad ?? "Leve"),
                Estado = "Activa"
            };

            _context.FaltasAmonestaciones.Add(falta);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Falta registrada correctamente", id = falta.IdFaltas });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al registrar falta", error = ex.Message });
        }
    }

    // PUT: anula una falta existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    [HttpPut("{id}/anular")]
    public async Task<IActionResult> AnularFalta(int id)
    {
        try
        {
            var falta = await _context.FaltasAmonestaciones.FindAsync(id);
            if (falta == null)
                return NotFound(new { mensaje = "Falta no encontrada" });

            falta.Estado = "Anulada";
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Falta anulada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al anular falta", error = ex.Message });
        }
    }

    // PUT: registra la apelación de una falta activa.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    [HttpPut("{id}/apelar")]
    public async Task<IActionResult> ApelarFalta(int id, [FromBody] ApelarRequest request)
    {
        try
        {
            var falta = await _context.FaltasAmonestaciones.FindAsync(id);
            if (falta == null)
                return NotFound(new { mensaje = "Falta no encontrada" });

            if (falta.Estado != "Activa")
                return BadRequest(new { mensaje = "Solo se pueden apelar faltas activas" });

            falta.Estado = "En Apelacion";
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Apelacion registrada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al registrar apelacion", error = ex.Message });
        }
    }

    // PUT: cambia manualmente la calificación oficial de conducta de un estudiante en un periodo, con auditoría y observación.
        [Authorize(Roles = "Administrador,Director,Sub Director")]
    [HttpPut("estudiante/{idEstudiante}/calificacion")]
    public async Task<IActionResult> CambiarCalificacion(int idEstudiante, [FromBody] CambiarCalificacionRequest request)
    {
        try
        {
            var estudiante = await _context.Estudiantes.FindAsync(idEstudiante);
            if (estudiante == null)
                return NotFound(new { mensaje = "Estudiante no encontrado" });

            var periodo = await _context.PeriodosAcademicos.FindAsync(request.IdPeriodo);
            if (periodo == null)
                return BadRequest(new { mensaje = "Periodo no encontrado" });

            if (string.IsNullOrWhiteSpace(request.Calificacion) ||
                !CalificacionesDisponibles.Contains(request.Calificacion))
                return BadRequest(new { mensaje = "Calificación no válida. Opciones: " + string.Join(", ", CalificacionesDisponibles) });

            if (string.IsNullOrWhiteSpace(request.Observacion))
                return BadRequest(new { mensaje = "La observación es obligatoria para cambiar la calificación" });

            var registro = await _context.ConductaPeriodos
                .FirstOrDefaultAsync(c => c.IdEstudiante == idEstudiante && c.IdPeriodo == request.IdPeriodo);

            var calificacionAnterior = registro?.CalificacionConducta;

            if (registro == null)
            {
                registro = new ConductaPeriodo
                {
                    IdEstudiante = idEstudiante,
                    IdPeriodo = request.IdPeriodo,
                    CalificacionConducta = request.Calificacion,
                    Observaciones = request.Observacion,
                    RegistradoPor = request.RegistradoPor,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.ConductaPeriodos.Add(registro);
            }
            else
            {
                registro.CalificacionConducta = request.Calificacion;
                registro.Observaciones = request.Observacion;
                registro.RegistradoPor = request.RegistradoPor;
                registro.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            await _auditoriaHelper.RegistrarAsync(
                "Cambiar Calificación de Conducta",
                $"Estudiante {estudiante.CodigoEstudiante} ({estudiante.Nombres} {estudiante.Apellidos}), periodo '{periodo.Nombre}' {periodo.AnioLectivo}: calificación '" +
                (calificacionAnterior ?? "Sin asignar") + "' -> '" + request.Calificacion + "'. Motivo: " + request.Observacion);

            return Ok(new
            {
                mensaje = "Calificación de conducta actualizada correctamente",
                registroPeriodo = ObtenerRegistroDto(registro)
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al cambiar la calificación de conducta", error = ex.Message });
        }
    }

    // Convierte un registro de conducta_periodos en el DTO que consume el frontend (null si no existe).
    private static object? ObtenerRegistroDto(ConductaPeriodo? registro)
    {
        if (registro == null)
            return null;

        return new
        {
            calificacion = registro.CalificacionConducta,
            observacion = registro.Observaciones,
            fechaCambio = registro.UpdatedAt ?? registro.CreatedAt,
            registradoPor = registro.RegistradoPor
        };
    }

    private string ObtenerCalificacion(int puntos)
    {
        if (puntos <= 0) return "Excelente";
        if (puntos <= 5) return "Buena";
        if (puntos <= 10) return "Regular";
        if (puntos <= 20) return "Mala";
        return "Deficiente";
    }

    private int ObtenerPuntosPorGravedad(string gravedad)
    {
        return gravedad.ToLower() switch
        {
            "leve" => 2,
            "moderada" => 5,
            "grave" => 10,
            "muy grave" => 20,
            _ => 2
        };
    }
}

public class ConductaRequest
{
    public int IdEstudiante { get; set; }
    public int? IdDocente { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string? Gravedad { get; set; }
    public DateTime? Fecha { get; set; }
    public int? IdPeriodo { get; set; }
    public string? Descripcion { get; set; }
    public int? PuntosDemerito { get; set; }
}

public class ApelarRequest
{
    public string Motivo { get; set; } = string.Empty;
}

public class CambiarCalificacionRequest
{
    public int IdPeriodo { get; set; }
    public string Calificacion { get; set; } = string.Empty;
    public string Observacion { get; set; } = string.Empty;
    public int? RegistradoPor { get; set; }
}
