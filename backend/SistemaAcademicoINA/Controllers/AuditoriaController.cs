using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;

namespace SistemaAcademicoINA.Controllers;

// Controlador API (Administrador y Director): gestiona el registro y consulta de auditoría de acciones del sistema.
[Authorize(Roles = "Administrador,Director")]
[ApiController]
[Route("api/[controller]")]
public class AuditoriaController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditoriaController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    // GET: obtiene el historial de auditoría ordenado por fecha descendente.
    [HttpGet]
    public async Task<IActionResult> GetAuditoria()
    {
        try
        {
            var auditoria = await _context.Auditoria
                .OrderByDescending(a => a.Fecha)
                .Select(a => new
                {
                    id = a.IdAuditoria,
                    fecha = a.Fecha,
                    usuario = a.Usuario,
                    accion = a.Accion,
                    detalle = a.Detalle ?? ""
                })
                .ToListAsync();

            // Si no hay registros, devolver lista vacia
            return Ok(auditoria);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener auditoria", error = ex.Message });
        }
    }

    // GET: obtiene un resumen estadístico de la auditoría (totales, acciones por tipo).
    [HttpGet("resumen")]
    public async Task<IActionResult> GetResumenAuditoria()
    {
        try
        {
            var total = await _context.Auditoria.CountAsync();
            var hoy = DateTime.Now.Date;
            var hoyCount = await _context.Auditoria.CountAsync(a => a.Fecha.Date == hoy);

            var accionesPorTipo = await _context.Auditoria
                .GroupBy(a => a.Accion)
                .Select(g => new { Accion = g.Key, Total = g.Count() })
                .ToListAsync();

            var ultimaActividad = await _context.Auditoria
                .OrderByDescending(a => a.Fecha)
                .Select(a => a.Fecha)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                total,
                hoy = hoyCount,
                accionesPorTipo,
                ultimaActividad
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener resumen", error = ex.Message });
        }
    }

    // POST: registra manualmente una entrada de auditoría con usuario e IP.
    [HttpPost("registrar")]
    public async Task<IActionResult> RegistrarAuditoria([FromBody] RegistrarAuditoriaRequest request)
    {
        try
        {
            var usuario = User.Identity?.Name ?? "Sistema";
            var ip = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "0.0.0.0";

            var auditoria = new Auditoria
            {
                Usuario = request.Usuario ?? usuario,
                Accion = request.Accion,
                Detalle = request.Detalle,
                Ip = ip,
                Fecha = DateTime.Now,
                CreatedAt = DateTime.Now
            };

            _context.Auditoria.Add(auditoria);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Auditoria registrada", id = auditoria.IdAuditoria });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al registrar auditoria", error = ex.Message });
        }
    }

    // DELETE: elimina un registro de auditoría por su id.
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAuditoria(int id)
    {
        try
        {
            var auditoria = await _context.Auditoria.FindAsync(id);
            if (auditoria == null)
                return NotFound(new { mensaje = "Registro no encontrado" });

            _context.Auditoria.Remove(auditoria);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Registro eliminado" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar", error = ex.Message });
        }
    }
}

public class RegistrarAuditoriaRequest
{
    public string? Usuario { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string Detalle { get; set; } = string.Empty;
}