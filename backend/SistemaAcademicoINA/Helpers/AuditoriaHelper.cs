// Utilidad para registrar eventos de auditoría en la base de datos con datos del usuario y su IP.
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using System.Security.Claims;

namespace SistemaAcademicoINA.Helpers;

public class AuditoriaHelper
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditoriaHelper(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    // Registra una acción de auditoría capturando usuario e IP desde el contexto HTTP actual.
    public async Task RegistrarAsync(string accion, string detalle, string? usuario = null)
    {
        try
        {
            // Resuelve el usuario autenticado (o "Sistema") y la IP de la solicitud.
            var user = _httpContextAccessor.HttpContext?.User;
            var nombreUsuario = usuario ?? user?.Identity?.Name ?? "Sistema";
            var ip = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "0.0.0.0";

            var auditoria = new Auditoria
            {
                Usuario = nombreUsuario,
                Accion = accion,
                Detalle = detalle,
                Ip = ip,
                Fecha = DateTime.Now,
                CreatedAt = DateTime.Now
            };

            _context.Auditoria.Add(auditoria);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al registrar auditoria: {ex.Message}");
        }
    }
}