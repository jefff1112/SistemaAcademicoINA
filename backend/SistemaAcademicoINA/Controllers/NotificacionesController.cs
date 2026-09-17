using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using System.Net;
using System.Net.Mail;

namespace SistemaAcademicoINA.Controllers;

// Controlador API (autenticado): gestiona notificaciones internas y envío de correos con archivos adjuntos.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificacionesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public NotificacionesController(ApplicationDbContext context, IWebHostEnvironment environment, IConfiguration configuration)
    {
        _context = context;
        _environment = environment;
        _configuration = configuration;
    }

    // GET: obtiene la lista de notificaciones ordenada por fecha.
    [HttpGet]
    public async Task<IActionResult> GetNotificaciones()
    {
        var notificaciones = await _context.Notificaciones
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                Id = n.IdNotificacion,
                n.Titulo,
                n.Mensaje,
                n.Leida,
                Fecha = n.CreatedAt
            })
            .ToListAsync();

        return Ok(notificaciones);
    }

    // DELETE: elimina una notificación por su id.
        [Authorize(Roles = "Administrador,Director,Sub Director")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotificacion(int id)
    {
        var notificacion = await _context.Notificaciones.FindAsync(id);
        if (notificacion == null)
            return NotFound(new { mensaje = "Notificacion no encontrada" });

        _context.Notificaciones.Remove(notificacion);
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Notificacion eliminada" });
    }

    // PUT: actualiza título y mensaje de una notificación existente.
        [Authorize(Roles = "Administrador,Director,Sub Director")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateNotificacion(int id, [FromBody] UpdateNotificacionRequest request)
    {
        var notificacion = await _context.Notificaciones.FindAsync(id);
        if (notificacion == null)
            return NotFound(new { mensaje = "Notificacion no encontrada" });

        notificacion.Titulo = request.Titulo;
        notificacion.Mensaje = request.Mensaje;
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Notificacion actualizada" });
    }

    // POST: crea una notificación interna del sistema.
        [Authorize(Roles = "Administrador,Director,Sub Director")]
    [HttpPost("interna")]
    public async Task<IActionResult> CrearNotificacionInterna([FromBody] InternaNotificacionRequest request)
    {
        var notificacion = new Notificacion
        {
            Titulo = request.Titulo,
            Mensaje = request.Mensaje,
            Leida = false,
            Tipo = "interna",
            CreatedAt = DateTime.Now
        };

        _context.Notificaciones.Add(notificacion);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Notificacion interna creada", id = notificacion.IdNotificacion });
    }

    // POST: marca una notificación como leída.
    [HttpPost("marcar-leida/{id}")]
    public async Task<IActionResult> MarcarLeida(int id)
    {
        var notificacion = await _context.Notificaciones.FindAsync(id);
        if (notificacion == null)
            return NotFound();

        notificacion.Leida = true;
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Marcada como leida" });
    }

    // POST: envía un correo (opcionalmente con archivo adjunto); si tiene fecha futura queda programado.
        [Authorize(Roles = "Administrador,Director,Sub Director")]
    [HttpPost("enviar-email")]
    public async Task<IActionResult> EnviarEmail([FromForm] EmailRequestConArchivo request)
    {
        try
        {
            string? archivoGuardado = null;

            if (request.Archivo != null && request.Archivo.Length > 0)
            {
                var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                archivoGuardado = Path.Combine(uploadsFolder, Guid.NewGuid().ToString() + "_" + request.Archivo.FileName);
                using (var fileStream = new FileStream(archivoGuardado, FileMode.Create))
                {
                    await request.Archivo.CopyToAsync(fileStream);
                }
            }

            var notificacion = new Notificacion
            {
                Titulo = request.Asunto,
                Mensaje = request.Mensaje ?? "",
                Leida = false,
                Tipo = "email",
                DestinatarioEmail = request.Destinatario,
                ArchivoAdjunto = archivoGuardado,
                FechaProgramada = request.FechaProgramada,
                CreatedAt = DateTime.Now
            };
            _context.Notificaciones.Add(notificacion);
            await _context.SaveChangesAsync();

            if (request.FechaProgramada.HasValue && request.FechaProgramada.Value > DateTime.Now)
            {
                var correoProgramado = new CorreoProgramado
                {
                    Destinatario = request.Destinatario,
                    Asunto = request.Asunto,
                    Mensaje = request.Mensaje ?? "",
                    ArchivoAdjunto = archivoGuardado,
                    FechaProgramada = request.FechaProgramada.Value,
                    Enviado = false
                };
                _context.CorreosProgramados.Add(correoProgramado);
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = $"Correo programado para: {request.FechaProgramada.Value.ToString("dd/MM/yyyy HH:mm")}" });
            }

            var emailSettings = _configuration.GetSection("Smtp");
            var smtpServer = emailSettings["Host"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(emailSettings["Port"] ?? "587");
            var smtpUsername = emailSettings["User"] ?? "tu_correo@gmail.com";
            var smtpPassword = emailSettings["Password"] ?? "tu_contraseña";
            var smtpFrom = emailSettings["From"] ?? "notificaciones@ina.edu.sv";
            var enableSsl = bool.Parse(emailSettings["EnableSsl"] ?? "true");

            using var smtpClient = new SmtpClient(smtpServer)
            {
                Port = smtpPort,
                Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                EnableSsl = enableSsl,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(smtpFrom),
                Subject = request.Asunto,
                Body = request.Mensaje ?? "",
                IsBodyHtml = false,
            };
            mailMessage.To.Add(request.Destinatario);

            if (!string.IsNullOrEmpty(archivoGuardado))
            {
                mailMessage.Attachments.Add(new Attachment(archivoGuardado));
            }

            await smtpClient.SendMailAsync(mailMessage);

            return Ok(new { mensaje = "Correo enviado correctamente", id = notificacion.IdNotificacion });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al enviar correo", error = ex.Message });
        }
    }
}

public class UpdateNotificacionRequest
{
    public string Titulo { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
}

public class InternaNotificacionRequest
{
    public string Titulo { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
}

public class EmailRequestConArchivo
{
    public string Destinatario { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string? Mensaje { get; set; }
    public IFormFile? Archivo { get; set; }
    public DateTime? FechaProgramada { get; set; }
}
