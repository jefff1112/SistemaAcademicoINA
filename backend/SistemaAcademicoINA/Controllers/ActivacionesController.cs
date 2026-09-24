using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Helpers;
using SistemaAcademicoINA.Models.DTOs;
using SistemaAcademicoINA.Models.Entities;
using SistemaAcademicoINA.Services;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestión de activaciones pendientes (Estudiantes + Encargados).
// Solo Director y Registro Academico pueden listar y gestionar las activaciones.
[ApiController]
[Route("api/activaciones")]
public class ActivacionesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly JwtHelper _jwtHelper;
    private readonly IConfiguration _configuration;
    private readonly PlantillasCorreoService _plantillasCorreo;

    public ActivacionesController(ApplicationDbContext context, IEmailService emailService, JwtHelper jwtHelper, IConfiguration configuration, PlantillasCorreoService plantillasCorreo)
    {
        _context = context;
        _emailService = emailService;
        _jwtHelper = jwtHelper;
        _configuration = configuration;
        _plantillasCorreo = plantillasCorreo;
    }

    // ============================================================
    // GET: lista de activaciones pendientes (Estudiantes y/o Encargados).
    // Query param: tipo = "estudiante" | "encargado" | "todos" (default: todos)
    // ============================================================
    [HttpGet("pendientes")]
    [Authorize(Roles = "Director,Registro Academico")]
    public async Task<IActionResult> ListarPendientes([FromQuery] string tipo = "todos")
    {
        var rolIds = new List<int>();
        if (tipo == "estudiante") rolIds.Add(7);
        else if (tipo == "encargado") rolIds.Add(8);
        else { rolIds.Add(7); rolIds.Add(8); } // todos

        var usuarios = await _context.Usuarios
            .Where(u => u.Estado == false && rolIds.Contains(u.RolId))
            .OrderByDescending(u => u.IdUsuario)
            .ToListAsync();

        var ids = usuarios.Select(u => u.IdUsuario).ToList();
        var codigos = usuarios.Select(u => u.Codigo).ToList();

        var tokens = await _context.TokensActivacion
            .Where(t => ids.Contains(t.UsuarioId))
            .OrderByDescending(t => t.FechaCreacion)
            .ToListAsync();

        // Para estudiantes: buscar por CodigoEstudiante
        // Para encargados: buscar por EmailEncargado (el correo del usuario encargado)
        var estudiantes = await _context.Estudiantes
            .Where(e => codigos.Contains(e.CodigoEstudiante) || codigos.Contains(e.EmailEncargado ?? ""))
            .ToListAsync();

        var estudiantePorCodigo = estudiantes.ToDictionary(e => e.CodigoEstudiante);
        var estudiantePorEmailEncargado = estudiantes.Where(e => !string.IsNullOrEmpty(e.EmailEncargado))
            .ToDictionary(e => e.EmailEncargado!);

        var resultado = usuarios.Select(u =>
        {
            var token = tokens.FirstOrDefault(t => t.UsuarioId == u.IdUsuario);
            var estadoToken = token == null
                ? "Pendiente manual"
                : token.Usado
                    ? "Ya usado"
                    : token.FechaExpiracion < DateTime.Now
                        ? "Expirado"
                        : "Válido";

            var esEncargado = u.RolId == 8;
            Estudiante? est = null;

            if (esEncargado)
            {
                // Para encargados, buscar por email_encargado
                estudiantePorEmailEncargado.TryGetValue(u.Correo ?? "", out est);
            }
            else
            {
                // Para estudiantes, buscar por codigo_estudiante
                estudiantePorCodigo.TryGetValue(u.Codigo, out est);
            }

            return new
            {
                usuarioId = u.IdUsuario,
                nombre = $"{u.Nombres} {u.Apellidos}",
                correo = u.Correo,
                codigo = u.Codigo,
                estadoActivacion = u.EstadoActivacion,
                estadoToken,
                tokenId = token?.Id,
                fechaMatricula = est?.FechaMatricula,
                tipo = esEncargado ? "encargado" : "estudiante",
                // Para encargados, incluir info del estudiante vinculado
                estudianteVinculado = esEncargado && est != null ? new
                {
                    idEstudiante = est.IdEstudiante,
                    nombres = est.Nombres,
                    apellidos = est.Apellidos,
                    codigoEstudiante = est.CodigoEstudiante,
                    nie = est.Nie
                } : null
            };
        }).ToList();

        return Ok(resultado);
    }

    // ============================================================
    // POST: reenviar correo (invalida token anterior y genera uno nuevo).
    // Funciona para Estudiante y Encargado (detecta por rol).
    // ============================================================
    [HttpPost("{usuarioId}/reenviar")]
    [Authorize(Roles = "Director,Registro Academico")]
    public async Task<IActionResult> Reenviar(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.IdUsuario == usuarioId);
        if (usuario == null)
            return NotFound(new { mensaje = "Usuario no encontrado" });

        if (string.IsNullOrEmpty(usuario.Correo))
            return BadRequest(new { mensaje = "El usuario no tiene correo registrado" });

        // Invalidar (eliminar) los tokens anteriores.
        var anteriores = await _context.TokensActivacion.Where(t => t.UsuarioId == usuarioId).ToListAsync();
        _context.TokensActivacion.RemoveRange(anteriores);

        // Generar nuevo token de 48 horas.
        var token = _jwtHelper.GenerarTokenActivacion(usuario.IdUsuario, usuario.Correo);
        _context.TokensActivacion.Add(new TokenActivacion
        {
            UsuarioId = usuario.IdUsuario,
            Token = token,
            FechaCreacion = DateTime.Now,
            FechaExpiracion = DateTime.Now.AddHours(48),
            Usado = false,
            CreatedAt = DateTime.Now
        });

        usuario.EstadoActivacion = "PendienteActivacion";
        await _context.SaveChangesAsync();

        var esEncargado = usuario.RolId == 8;
        string asunto, html;

        if (esEncargado)
        {
            // Buscar nombre del estudiante vinculado
            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.EmailEncargado == usuario.Correo);
            var nombreEstudiante = estudiante != null ? $"{estudiante.Nombres} {estudiante.Apellidos}" : "su hijo(a)";

            asunto = "¡Felicidades! Su hijo(a) ha sido matriculado en el INA";
            html = await GenerarHtmlBienvenidaEncargado($"{usuario.Nombres} {usuario.Apellidos}", nombreEstudiante, token);
        }
        else
        {
            asunto = "¡Felicidades! Has sido aceptado en el INA";
            html = await GenerarHtmlBienvenida($"{usuario.Nombres} {usuario.Apellidos}", token);
        }

        await _emailService.EncolarAsync(new EmailMessage
        {
            Destinatario = usuario.Correo,
            Asunto = asunto,
            CuerpoHtml = html
        });

        await AuditoriaAsync($"Correo de activación reenviado a {usuario.Correo} ({usuario.Rol?.NombreRol ?? "Usuario"})", "ReenviarActivacion");

        return Ok(new { mensaje = "Correo reenviado correctamente" });
    }

    // ============================================================
    // POST: marcar en espera de activación (con comentario opcional).
    // Funciona para Estudiante y Encargado.
    // ============================================================
    [HttpPost("{usuarioId}/marcar-espera")]
    [Authorize(Roles = "Director,Registro Academico")]
    public async Task<IActionResult> MarcarEspera(int usuarioId, [FromBody] MarcarEsperaRequest request)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.IdUsuario == usuarioId);
        if (usuario == null)
            return NotFound(new { mensaje = "Usuario no encontrado" });

        usuario.EstadoActivacion = "EsperaActivacion";
        usuario.Estado = false;
        await _context.SaveChangesAsync();

        await AuditoriaAsync($"{usuario.Rol?.NombreRol ?? "Usuario"} marcado en espera de activación (comentario: {request.Comentario ?? "sin comentario"})", "MarcarEsperaActivacion");

        return Ok(new { mensaje = $"{usuario.Rol?.NombreRol ?? "Usuario"} marcado en espera" });
    }

    // ============================================================
    // POST: activar presencialmente (crea contraseña temporal y activa la cuenta).
    // Funciona para Estudiante y Encargado.
    // ============================================================
    [HttpPost("{usuarioId}/activar-presencial")]
    [Authorize(Roles = "Director,Registro Academico")]
    public async Task<IActionResult> ActivarPresencial(int usuarioId, [FromBody] ActivarPresencialRequest request)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.IdUsuario == usuarioId);
        if (usuario == null)
            return NotFound(new { mensaje = "Usuario no encontrado" });

        usuario.Contrasena = BCrypt.Net.BCrypt.HashPassword(request.PasswordTemporal);
        usuario.Estado = true;
        usuario.EstadoActivacion = "Activo";

        // Invalidar tokens pendientes.
        var tokens = await _context.TokensActivacion.Where(t => t.UsuarioId == usuarioId && !t.Usado).ToListAsync();
        foreach (var t in tokens)
            t.Usado = true;

        await _context.SaveChangesAsync();

        var quien = User.FindFirst(ClaimTypes.Name)?.Value ?? "Sistema";
        await AuditoriaAsync($"Cuenta de {usuario.Rol?.NombreRol ?? "Usuario"} activada presencialmente por {quien}", "ActivacionPresencial");

        return Ok(new { mensaje = $"Cuenta de {usuario.Rol?.NombreRol ?? "Usuario"} activada presencialmente" });
    }

    // ============================================================
    // POST: solicitar un nuevo enlace (público, desde pantalla "enlace expirado").
    // ============================================================
    [HttpPost("solicitar-nuevo-enlace")]
    public async Task<IActionResult> SolicitarNuevoEnlace([FromBody] SolicitarNuevoEnlaceRequest request)
    {
        var registro = await _context.TokensActivacion
            .Include(t => t.Usuario)
                .ThenInclude(u => u.Rol)
            .FirstOrDefaultAsync(t => t.Token == request.Token);

        if (registro == null || registro.Usuario == null)
            return BadRequest(new { mensaje = "Enlace inválido" });

        var rol = registro.Usuario.Rol?.NombreRol ?? "Usuario";
        var detalle = $"El {rol.ToLower()} {registro.Usuario.Nombres} {registro.Usuario.Apellidos} ({registro.Usuario.Correo}) solicita un nuevo enlace de activación.";
        await NotificarRolesAsync(detalle);

        return Ok(new { mensaje = "Solicitud enviada. Registro Académico será notificado." });
    }

    // ============================================================
    // HELPERS
    // ============================================================

    // Registra un evento en auditoría.
    private async Task AuditoriaAsync(string detalle, string accion)
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

    // Notifica (en sistema + correo) a Director y Registro Academico.
    private async Task NotificarRolesAsync(string detalle)
    {
        try
        {
            _context.Notificaciones.Add(new Notificacion
            {
                Titulo = "Solicitud de nuevo enlace de activación",
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
                    Asunto = "Solicitud de nuevo enlace de activación",
                    CuerpoHtml = GenerarHtmlNotificacionRol(detalle)
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al notificar roles: {ex.Message}");
        }
    }

    // Genera la URL del enlace de activación.
    private string ObtenerUrlActivacion(string token)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        return $"{frontendUrl}/activar-cuenta?token={token}";
    }

    // Genera el HTML del correo de reenvío usando la plantilla Templates/Emails.
    private async Task<string> GenerarHtmlBienvenida(string nombreEstudiante, string token)
    {
        var enlace = ObtenerUrlActivacion(token);
        return await _plantillasCorreo.RenderizarAsync("nuevo_enlace_activacion", new Dictionary<string, string>
        {
            { "nombreEstudiante", nombreEstudiante },
            { "enlace", enlace }
        });
    }

    // Genera el HTML del correo de bienvenida/activación para ENCARGADO.
    private async Task<string> GenerarHtmlBienvenidaEncargado(string nombreEncargado, string nombreEstudiante, string token)
    {
        var enlace = ObtenerUrlActivacion(token);
        return await _plantillasCorreo.RenderizarAsync("bienvenida_activacion_encargado", new Dictionary<string, string>
        {
            { "nombreEncargado", nombreEncargado },
            { "nombreEstudiante", nombreEstudiante },
            { "enlace", enlace }
        });
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
                <p>{System.Net.WebUtility.HtmlEncode(detalle)}</p>
            </div>
        </div>";
    }
}