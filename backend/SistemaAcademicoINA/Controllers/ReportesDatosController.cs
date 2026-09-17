using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.DTOs;
using SistemaAcademicoINA.Models.Entities;
using SistemaAcademicoINA.Services;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestión de reportes de datos incorrectos enviados por los estudiantes.
// La creación es pública (protegida por el token de activación); la gestión requiere rol Director o Registro Academico.
[ApiController]
[Route("api/reportes-datos")]
public class ReportesDatosController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly PlantillasCorreoService _plantillasCorreo;

    public ReportesDatosController(ApplicationDbContext context, IEmailService emailService, PlantillasCorreoService plantillasCorreo)
    {
        _context = context;
        _emailService = emailService;
        _plantillasCorreo = plantillasCorreo;
    }

    // ============================================================
    // POST: crea N reportes desde la página de activación.
    // ============================================================
    [HttpPost]
    public async Task<IActionResult> CrearReportes([FromBody] CrearReportesRequest request)
    {
        var registro = await _context.TokensActivacion
            .Include(t => t.Usuario)
            .FirstOrDefaultAsync(t => t.Token == request.Token);

        if (registro == null || registro.Usuario == null)
            return BadRequest(new { mensaje = "Enlace inválido" });

        if (registro.FechaExpiracion < DateTime.Now)
            return BadRequest(new { mensaje = "El enlace ha expirado" });

        var estudiante = await _context.Estudiantes
            .FirstOrDefaultAsync(e => e.CodigoEstudiante == registro.Usuario.Codigo);

        if (estudiante == null)
            return BadRequest(new { mensaje = "No se encontró el estudiante asociado" });

        var creados = new List<ReporteDatoEstudiante>();
        foreach (var item in request.Reportes)
        {
            creados.Add(new ReporteDatoEstudiante
            {
                EstudianteId = estudiante.IdEstudiante,
                Campo = item.Campo.Trim(),
                ValorActual = ObtenerValorActual(estudiante, item.Campo.Trim()),
                ValorPropuesto = item.ValorCorrecto,
                Comentario = item.Comentario,
                Estado = "Pendiente",
                FechaCreacion = DateTime.Now
            });
        }

        _context.ReportesDatosEstudiante.AddRange(creados);
        await _context.SaveChangesAsync();

        // Notificación en sistema + correo a Director y Registro Academico.
        var detalle = $"El estudiante {estudiante.Nombres} {estudiante.Apellidos} envió {creados.Count} reporte(s) de datos.";
        await NotificarRolesAsync(detalle);

        // Auditoría
        await AuditoriaHelperAsync($"Estudiante {estudiante.Nombres} {estudiante.Apellidos} envió {creados.Count} reporte(s) de datos", "ReportesDatos");

        return Ok(new { mensaje = "Reportes enviados, serán revisados", total = creados.Count, ids = creados.Select(c => c.Id).ToList() });
    }

    // ============================================================
    // GET: lista reportes con filtros (estado, fecha, estudiante, campo).
    // ============================================================
    [HttpGet]
    [Authorize(Roles = "Director,Registro Academico")]
    public async Task<IActionResult> Listar([FromQuery] string? estado, [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta, [FromQuery] int? estudianteId, [FromQuery] string? campo)
    {
        var query = _context.ReportesDatosEstudiante
            .Include(r => r.Estudiante)
            .Include(r => r.ResueltoPorUsuario)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(estado))
            query = query.Where(r => r.Estado == estado);

        if (desde.HasValue)
            query = query.Where(r => r.FechaCreacion >= desde.Value);

        if (hasta.HasValue)
            query = query.Where(r => r.FechaCreacion <= hasta.Value);

        if (estudianteId.HasValue)
            query = query.Where(r => r.EstudianteId == estudianteId.Value);

        if (!string.IsNullOrWhiteSpace(campo))
            query = query.Where(r => r.Campo == campo);

        var reportes = await query
            .OrderByDescending(r => r.FechaCreacion)
            .Select(r => new
            {
                r.Id,
                r.EstudianteId,
                NombreEstudiante = r.Estudiante != null ? $"{r.Estudiante.Nombres} {r.Estudiante.Apellidos}" : "",
                CodigoEstudiante = r.Estudiante != null ? r.Estudiante.CodigoEstudiante : "",
                r.Campo,
                r.ValorActual,
                r.ValorPropuesto,
                r.Comentario,
                r.Estado,
                r.MotivoRechazo,
                ResueltoPor = r.ResueltoPorUsuario != null ? $"{r.ResueltoPorUsuario.Nombres} {r.ResueltoPorUsuario.Apellidos}" : null,
                r.FechaCreacion,
                r.FechaResolucion
            })
            .ToListAsync();

        return Ok(reportes);
    }

    // ============================================================
    // PUT: aprobar corrección (aplica el valor corregido al estudiante).
    // ============================================================
    [HttpPut("{id}/aprobar")]
    [Authorize(Roles = "Director,Registro Academico")]
    public async Task<IActionResult> Aprobar(int id)
    {
        var reporte = await _context.ReportesDatosEstudiante
            .Include(r => r.Estudiante)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reporte == null)
            return NotFound(new { mensaje = "Reporte no encontrado" });

        if (reporte.Estado == "Aprobado")
            return BadRequest(new { mensaje = "El reporte ya fue aprobado" });

        if (!AplicarCorreccion(reporte.Estudiante!, reporte.Campo, reporte.ValorPropuesto, out var error))
            return BadRequest(new { mensaje = error });

        var userId = await ObtenerUsuarioActualId();
        reporte.Estado = "Aprobado";
        reporte.MotivoRechazo = null;
        reporte.ResueltoPor = userId;
        reporte.FechaResolucion = DateTime.Now;

        await _context.SaveChangesAsync();

        await AuditoriaHelperAsync($"Reporte aprobado (ID {reporte.Id}): campo '{reporte.Campo}' corregido para el estudiante {reporte.Estudiante!.Nombres} {reporte.Estudiante.Apellidos}", "ReporteAprobado");

        if (!string.IsNullOrEmpty(reporte.Estudiante.CorreoEstudiante))
        {
            await _emailService.EncolarAsync(new EmailMessage
            {
                Destinatario = reporte.Estudiante.CorreoEstudiante,
                Asunto = "Tu reporte fue aprobado",
                CuerpoHtml = await GenerarHtmlReporteResuelto(reporte.Estudiante.Nombres, aprobado: true, motivo: null)
            });
        }

        return Ok(new { mensaje = "Reporte aprobado y dato corregido correctamente" });
    }

    // ============================================================
    // PUT: rechazar reporte (motivo obligatorio).
    // ============================================================
    [HttpPut("{id}/rechazar")]
    [Authorize(Roles = "Director,Registro Academico")]
    public async Task<IActionResult> Rechazar(int id, [FromBody] RechazarReporteRequest request)
    {
        var reporte = await _context.ReportesDatosEstudiante
            .Include(r => r.Estudiante)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reporte == null)
            return NotFound(new { mensaje = "Reporte no encontrado" });

        if (reporte.Estado == "Rechazado")
            return BadRequest(new { mensaje = "El reporte ya fue rechazado" });

        var userId = await ObtenerUsuarioActualId();
        reporte.Estado = "Rechazado";
        reporte.MotivoRechazo = request.Motivo;
        reporte.ResueltoPor = userId;
        reporte.FechaResolucion = DateTime.Now;

        await _context.SaveChangesAsync();

        await AuditoriaHelperAsync($"Reporte rechazado (ID {reporte.Id}) motivo: {request.Motivo}", "ReporteRechazado");

        if (!string.IsNullOrEmpty(reporte.Estudiante.CorreoEstudiante))
        {
            await _emailService.EncolarAsync(new EmailMessage
            {
                Destinatario = reporte.Estudiante.CorreoEstudiante,
                Asunto = "Tu reporte fue rechazado",
                CuerpoHtml = await GenerarHtmlReporteResuelto(reporte.Estudiante.Nombres, aprobado: false, motivo: request.Motivo)
            });
        }

        return Ok(new { mensaje = "Reporte rechazado correctamente" });
    }

    // ============================================================
    // PUT: marcar reporte en revisión.
    // ============================================================
    [HttpPut("{id}/en-revision")]
    [Authorize(Roles = "Director,Registro Academico")]
    public async Task<IActionResult> MarcarEnRevision(int id)
    {
        var reporte = await _context.ReportesDatosEstudiante.FindAsync(id);
        if (reporte == null)
            return NotFound(new { mensaje = "Reporte no encontrado" });

        if (reporte.Estado == "EnRevision")
            return BadRequest(new { mensaje = "El reporte ya está en revisión" });

        reporte.Estado = "EnRevision";
        await _context.SaveChangesAsync();

        await AuditoriaHelperAsync($"Reporte marcado en revisión (ID {reporte.Id})", "ReporteEnRevision");

        return Ok(new { mensaje = "Reporte marcado en revisión" });
    }

    // ============================================================
    // HELPERS
    // ============================================================

    // Devuelve el id del usuario autenticado actual.
    private async Task<int?> ObtenerUsuarioActualId()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idStr, out var id))
            return id;

        var codigo = User.FindFirst(ClaimTypes.Name)?.Value;
        if (!string.IsNullOrEmpty(codigo))
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Codigo == codigo);
            if (usuario != null)
                return usuario.IdUsuario;
        }

        return null;
    }

    // Registra un evento en auditoría (usuario, acción, detalle, IP).
    private async Task AuditoriaHelperAsync(string detalle, string accion)
    {
        try
        {
            _context.Auditoria.Add(new Auditoria
            {
                Usuario = User.Identity?.Name ?? "Sistema",
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
            Console.WriteLine($"Error al registrar auditoria: {ex.Message}");
        }
    }

    // Notifica (en sistema + correo) a los roles Director y Registro Academico.
    private async Task NotificarRolesAsync(string detalle)
    {
        try
        {
            _context.Notificaciones.Add(new Notificacion
            {
                Titulo = "Nuevo reporte de datos de estudiante",
                Mensaje = detalle,
                Leida = false,
                Tipo = "interna",
                CreatedAt = DateTime.Now
            });

            var correos = await _context.Usuarios
                .Where(u => u.Estado == true && u.Correo != null
                    && u.Rol != null
                    && (u.Rol.NombreRol == "Director" || u.Rol.NombreRol == "Registro Academico"))
                .Select(u => u.Correo!)
                .ToListAsync();

            await _context.SaveChangesAsync();

            foreach (var correo in correos)
            {
                await _emailService.EncolarAsync(new EmailMessage
                {
                    Destinatario = correo,
                    Asunto = "Nuevo reporte de datos de estudiante",
                    CuerpoHtml = GenerarHtmlNotificacionRol(detalle)
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al notificar roles: {ex.Message}");
        }
    }

    // Valor actual del campo del estudiante (para registrar valor_actual).
    private static string? ObtenerValorActual(Estudiante e, string campo) => campo switch
    {
        "nombres" => e.Nombres,
        "apellidos" => e.Apellidos,
        "nie" => e.Nie,
        "dui" => e.Dui,
        "carnet_menoridad" => e.CarnetMenoridad,
        "fecha_nacimiento" => e.FechaNacimiento?.ToString("yyyy-MM-dd"),
        "genero" => e.Genero,
        "direccion" => e.Direccion,
        "telefono_movil" => e.TelefonoMovil,
        "correo_estudiante" => e.CorreoEstudiante,
        "nombre_encargado" => e.NombreEncargado,
        "parentesco_encargado" => e.ParentescoEncargado,
        "telefono_encargado" => e.TelefonoEncargado,
        _ => null
    };

    // Aplica el valor corregido al estudiante (devuelve false con error si no se pudo aplicar).
    private static bool AplicarCorreccion(Estudiante e, string campo, string? valor, out string error)
    {
        error = string.Empty;
        switch (campo)
        {
            case "nombres": e.Nombres = valor ?? ""; return true;
            case "apellidos": e.Apellidos = valor ?? ""; return true;
            case "nie": e.Nie = valor; return true;
            case "dui": e.Dui = valor; return true;
            case "carnet_menoridad": e.CarnetMenoridad = valor; return true;
            case "genero": e.Genero = valor; return true;
            case "direccion": e.Direccion = valor; return true;
            case "telefono_movil": e.TelefonoMovil = valor; return true;
            case "correo_estudiante": e.CorreoEstudiante = valor; return true;
            case "nombre_encargado": e.NombreEncargado = valor; return true;
            case "parentesco_encargado": e.ParentescoEncargado = valor; return true;
            case "telefono_encargado": e.TelefonoEncargado = valor; return true;
            case "fecha_nacimiento":
                if (string.IsNullOrWhiteSpace(valor)) { error = "La fecha no puede estar vacía"; return false; }
                if (!DateTime.TryParse(valor, out var fecha)) { error = "Formato de fecha inválido"; return false; }
                e.FechaNacimiento = fecha; return true;
            default:
                error = "Campo no reconocido para corrección"; return false;
        }
    }

    // HTML simple para notificar a los roles administrativos.
    private static string GenerarHtmlNotificacionRol(string detalle)
    {
        return $@"
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;border-radius:8px;overflow:hidden'>
            <div style='background:#1A2E6B;color:#fff;padding:16px;text-align:center'>
                <h2 style='margin:0'>Instituto Nacional de Apopa</h2>
            </div>
            <div style='padding:20px;color:#333'>
                <h3>Nuevo reporte de datos de estudiante</h3>
                <p>{System.Net.WebUtility.HtmlEncode(detalle)}</p>
                <p>Ingrese al panel <strong>Reportes de Datos</strong> para revisarlo.</p>
            </div>
        </div>";
    }

    // Genera el HTML de la respuesta al estudiante usando las plantillas Templates/Emails.
    private async Task<string> GenerarHtmlReporteResuelto(string nombreEstudiante, bool aprobado, string? motivo)
    {
        var reemplazos = new Dictionary<string, string>
        {
            { "nombreEstudiante", nombreEstudiante }
        };

        if (!aprobado)
            reemplazos["motivo"] = motivo ?? "";

        var plantilla = aprobado ? "reporte_aprobado" : "reporte_rechazado";
        return await _plantillasCorreo.RenderizarAsync(plantilla, reemplazos);
    }
}