using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using BCryptNet = BCrypt.Net.BCrypt;

namespace SistemaAcademicoINA.Controllers;

// Controlador API (autenticado): gestiona el perfil del usuario logueado (consulta, edición y cambio de contraseña).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PerfilController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PerfilController(ApplicationDbContext context)
    {
        _context = context;
    }

    private bool EsPerfilPropio(int id)
    {
        return int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idUsuario)
            && idUsuario == id;
    }

    // GET: obtiene los datos del perfil propio del usuario autenticado.
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPerfil(int id)
    {
        if (!EsPerfilPropio(id))
            return StatusCode(403, new { mensaje = "No tiene acceso al perfil de otro usuario" });

        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.IdUsuario == id);

        if (usuario == null)
            return NotFound(new { mensaje = "Usuario no encontrado" });

        return Ok(new
        {
            usuario.IdUsuario,
            usuario.Codigo,
            usuario.Nombres,
            usuario.Apellidos,
            usuario.Correo,
            usuario.Estado,
            Rol = usuario.Rol?.NombreRol ?? ""
        });
    }

    // PUT: actualiza nombres, apellidos y correo del perfil propio.
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePerfil(int id, [FromBody] UpdatePerfilRequest request)
    {
        if (!EsPerfilPropio(id))
            return StatusCode(403, new { mensaje = "No tiene acceso al perfil de otro usuario" });

        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound(new { mensaje = "Usuario no encontrado" });

        if (string.IsNullOrWhiteSpace(request.Nombres) || string.IsNullOrWhiteSpace(request.Apellidos))
            return BadRequest(new { mensaje = "Los nombres y apellidos son obligatorios" });

        usuario.Nombres = request.Nombres.Trim();
        usuario.Apellidos = request.Apellidos.Trim();
        usuario.Correo = request.Correo;

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Perfil actualizado correctamente" });
    }

    // PUT: cambia la contraseña del usuario verificando la contraseña actual.
    [HttpPut("cambiar-password/{id}")]
    public async Task<IActionResult> CambiarPassword(int id, [FromBody] CambiarPasswordRequest request)
    {
        if (!EsPerfilPropio(id))
            return StatusCode(403, new { mensaje = "No tiene acceso al perfil de otro usuario" });

        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound(new { mensaje = "Usuario no encontrado" });

        if (!BCryptNet.Verify(request.Actual, usuario.Contrasena))
        {
            return BadRequest(new { mensaje = "Contraseña actual incorrecta" });
        }

        if (string.IsNullOrWhiteSpace(request.Nueva) || request.Nueva.Length < 6)
        {
            return BadRequest(new { mensaje = "La nueva contraseña debe tener al menos 6 caracteres" });
        }

        usuario.Contrasena = BCryptNet.HashPassword(request.Nueva);

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Contraseña cambiada correctamente" });
    }
}

public class UpdatePerfilRequest
{
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string? Correo { get; set; }
}

public class CambiarPasswordRequest
{
    public string Actual { get; set; } = string.Empty;
    public string Nueva { get; set; } = string.Empty;
}