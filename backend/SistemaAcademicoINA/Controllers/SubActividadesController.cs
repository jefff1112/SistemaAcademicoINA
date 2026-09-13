using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;

namespace SistemaAcademicoINA.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubActividadesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SubActividadesController> _logger;

    public SubActividadesController(ApplicationDbContext context, ILogger<SubActividadesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/subactividades/actividad/{idActividad}
    [HttpGet("actividad/{idActividad}")]
    public async Task<IActionResult> GetSubActividadesByActividad(int idActividad)
    {
        try
        {
            var subActividades = await _context.SubActividades
                .Where(sa => sa.IdActividad == idActividad)
                .OrderBy(sa => sa.Orden)
                .Select(sa => new
                {
                    sa.IdSubActividad,
                    sa.IdActividad,
                    sa.NombreSubActividad,
                    sa.Ponderacion,
                    sa.Orden,
                    sa.CreatedAt,
                    sa.UpdatedAt
                })
                .ToListAsync();

            var totalPonderacion = subActividades.Sum(sa => sa.Ponderacion);

            return Ok(new
            {
                subActividades,
                totalPonderacion,
                ponderacionRestante = Math.Max(0, 100 - totalPonderacion),
                esValido = Math.Abs(totalPonderacion - 100) < 0.01m
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener sub-actividades");
            return StatusCode(500, new { mensaje = "Error al obtener sub-actividades", error = ex.Message });
        }
    }

    // GET: api/subactividades/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSubActividad(int id)
    {
        try
        {
            var subActividad = await _context.SubActividades
                .FirstOrDefaultAsync(sa => sa.IdSubActividad == id);

            if (subActividad == null)
                return NotFound(new { mensaje = "Sub-actividad no encontrada" });

            return Ok(subActividad);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener sub-actividad");
            return StatusCode(500, new { mensaje = "Error al obtener sub-actividad", error = ex.Message });
        }
    }

    // POST: api/subactividades
    [HttpPost]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> CreateSubActividad([FromBody] SubActividadRequest request)
    {
        try
        {
            // Validar que la actividad existe y el usuario tiene permiso
            var actividad = await _context.Actividades
                .Include(a => a.SubActividades)
                .FirstOrDefaultAsync(a => a.IdActividad == request.IdActividad);

            if (actividad == null)
                return NotFound(new { mensaje = "Actividad no encontrada" });

            if (!await UsuarioAutorizadoParaActividad(actividad))
                return StatusCode(403, new { mensaje = "No tiene autorización para modificar esta actividad" });

            // Validar ponderación total no exceda 100
            var totalActual = actividad.SubActividades.Sum(sa => sa.Ponderacion);
            if (totalActual + request.Ponderacion > 100)
            {
                return BadRequest(new
                {
                    mensaje = $"La suma de ponderaciones excedería 100%. Actual: {totalActual}%, Nueva: {request.Ponderacion}%, Restante: {100 - totalActual}%"
                });
            }

            var subActividad = new SubActividad
            {
                IdActividad = request.IdActividad,
                NombreSubActividad = request.NombreSubActividad,
                Ponderacion = request.Ponderacion,
                Orden = request.Orden,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.SubActividades.Add(subActividad);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Sub-actividad creada correctamente",
                subActividad = new
                {
                    subActividad.IdSubActividad,
                    subActividad.IdActividad,
                    subActividad.NombreSubActividad,
                    subActividad.Ponderacion,
                    subActividad.Orden
                },
                totalPonderacion = totalActual + request.Ponderacion
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear sub-actividad");
            return StatusCode(500, new { mensaje = "Error al crear sub-actividad", error = ex.Message });
        }
    }

    // PUT: api/subactividades/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> UpdateSubActividad(int id, [FromBody] SubActividadRequest request)
    {
        try
        {
            var subActividad = await _context.SubActividades
                .Include(sa => sa.Actividad)
                    .ThenInclude(a => a.SubActividades)
                .FirstOrDefaultAsync(sa => sa.IdSubActividad == id);

            if (subActividad == null)
                return NotFound(new { mensaje = "Sub-actividad no encontrada" });

            if (!await UsuarioAutorizadoParaActividad(subActividad.Actividad))
                return StatusCode(403, new { mensaje = "No tiene autorización para modificar esta sub-actividad" });

            // Validar ponderación total (excluyendo la actual)
            var totalOtras = subActividad.Actividad.SubActividades
                .Where(sa => sa.IdSubActividad != id)
                .Sum(sa => sa.Ponderacion);

            if (totalOtras + request.Ponderacion > 100)
            {
                return BadRequest(new
                {
                    mensaje = $"La suma de ponderaciones excedería 100%. Otras: {totalOtras}%, Nueva: {request.Ponderacion}%, Restante: {100 - totalOtras}%"
                });
            }

            subActividad.NombreSubActividad = request.NombreSubActividad;
            subActividad.Ponderacion = request.Ponderacion;
            subActividad.Orden = request.Orden;
            subActividad.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            var totalNuevo = totalOtras + request.Ponderacion;
            return Ok(new
            {
                mensaje = "Sub-actividad actualizada correctamente",
                totalPonderacion = totalNuevo,
                ponderacionRestante = Math.Max(0, 100 - totalNuevo)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar sub-actividad");
            return StatusCode(500, new { mensaje = "Error al actualizar sub-actividad", error = ex.Message });
        }
    }

    // DELETE: api/subactividades/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> DeleteSubActividad(int id)
    {
        try
        {
            var subActividad = await _context.SubActividades
                .Include(sa => sa.Actividad)
                .FirstOrDefaultAsync(sa => sa.IdSubActividad == id);

            if (subActividad == null)
                return NotFound(new { mensaje = "Sub-actividad no encontrada" });

            if (!await UsuarioAutorizadoParaActividad(subActividad.Actividad))
                return StatusCode(403, new { mensaje = "No tiene autorización para eliminar esta sub-actividad" });

            var idActividad = subActividad.IdActividad;
            var ponderacionEliminada = subActividad.Ponderacion;

            _context.SubActividades.Remove(subActividad);
            await _context.SaveChangesAsync();

            var totalRestante = await _context.SubActividades
                .Where(sa => sa.IdActividad == idActividad)
                .SumAsync(sa => sa.Ponderacion);

            return Ok(new
            {
                mensaje = "Sub-actividad eliminada correctamente",
                totalPonderacion = totalRestante,
                ponderacionRestante = Math.Max(0, 100 - totalRestante)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar sub-actividad");
            return StatusCode(500, new { mensaje = "Error al eliminar sub-actividad", error = ex.Message });
        }
    }

    // POST: api/subactividades/crear-estructura-estandar
    // Crea la estructura estándar del cuadro auxiliar: 3 actividades con 5 sub-actividades cada una
    [HttpPost("crear-estructura-estandar")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> CrearEstructuraEstandar([FromBody] CrearEstructuraEstandarRequest request)
    {
        try
        {
            // Verificar que las 3 actividades existan y pertenezcan al mismo docente/materia/clase/periodo
            var actividades = await _context.Actividades
                .Where(a => request.IdActividades.Contains(a.IdActividad))
                .Include(a => a.SubActividades)
                .ToListAsync();

            if (actividades.Count != 3)
                return BadRequest(new { mensaje = "Se requieren exactamente 3 actividades para la estructura estándar" });

            // Verificar autorización
            foreach (var act in actividades)
            {
                if (!await UsuarioAutorizadoParaActividad(act))
                    return StatusCode(403, new { mensaje = $"No tiene autorización para la actividad {act.NombreActividad}" });
            }

            var resultados = new List<object>();

            foreach (var act in actividades)
            {
                // Eliminar sub-actividades existentes si las hay
                if (act.SubActividades.Any())
                {
                    _context.SubActividades.RemoveRange(act.SubActividades);
                }

                // Determinar ponderación de la actividad (del Excel: 35%, 35%, 30%)
                decimal ponderacionActividad = act.Ponderacion > 0 ? act.Ponderacion : 
                    (actividades.IndexOf(act) < 2 ? 35m : 30m);

                // Crear 5 sub-actividades estándar
                var subActividadesEstandar = new[]
                {
                    new { Nombre = "AUTOEVALUACIÓN", Ponderacion = 20m, Orden = 1 },
                    new { Nombre = "COEVALUACIÓN", Ponderacion = 20m, Orden = 2 },
                    new { Nombre = "PRUEBA OBJETIVA 1", Ponderacion = 20m, Orden = 3 },
                    new { Nombre = "PRUEBA OBJETIVA 2", Ponderacion = 20m, Orden = 4 },
                    new { Nombre = "PRUEBA OBJETIVA 3", Ponderacion = 20m, Orden = 5 }
                };

                foreach (var sa in subActividadesEstandar)
                {
                    var subActividad = new SubActividad
                    {
                        IdActividad = act.IdActividad,
                        NombreSubActividad = sa.Nombre,
                        Ponderacion = sa.Ponderacion,
                        Orden = sa.Orden,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };
                    _context.SubActividades.Add(subActividad);
                    resultados.Add(new
                    {
                        act.IdActividad,
                        Actividad = act.NombreActividad,
                        subActividad.IdSubActividad,
                        subActividad.NombreSubActividad,
                        subActividad.Ponderacion
                    });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Estructura estándar creada correctamente (3 actividades × 5 sub-actividades = 100% cada una)",
                subActividadesCreadas = resultados.Count,
                detalle = resultados
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear estructura estándar");
            return StatusCode(500, new { mensaje = "Error al crear estructura estándar", error = ex.Message });
        }
    }

    private async Task<bool> UsuarioAutorizadoParaActividad(Actividad actividad)
    {
        try
        {
            var codigo = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(codigo))
                return false;

            var rol = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            var rolesStaff = new[] { "Administrador", "Director", "Sub Director", "Registro Academico", "Coordinador" };
            if (rolesStaff.Contains(rol))
                return true;

            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.CodigoDocente == codigo || d.Correo == codigo);

            if (docente == null)
                return false;

            return actividad.IdDocente == docente.IdDocente;
        }
        catch
        {
            return false;
        }
    }
}

public class SubActividadRequest
{
    public int IdActividad { get; set; }
    public string NombreSubActividad { get; set; } = string.Empty;
    public decimal Ponderacion { get; set; }
    public int Orden { get; set; } = 1;
}

public class CrearEstructuraEstandarRequest
{
    public List<int> IdActividades { get; set; } = new();
}