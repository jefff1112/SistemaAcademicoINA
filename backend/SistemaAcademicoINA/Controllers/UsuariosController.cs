using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using BCryptNet = BCrypt.Net.BCrypt;

namespace SistemaAcademicoINA.Controllers;

// Controlador API (solo Administrador): gestiona los usuarios del sistema (consulta, creación, edición y desactivación).
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class UsuariosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsuariosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene la lista de usuarios con su rol.
    [HttpGet]
    [Authorize(Roles = "Administrador,Director")]
    public async Task<ActionResult<IEnumerable<object>>> GetUsuarios()
    {
        var usuarios = await _context.Usuarios
            .Include(u => u.Rol)
            .Select(u => new
            {
                u.IdUsuario,
                u.Codigo,
                u.Nombres,
                u.Apellidos,
                u.Correo,
                u.RolId,
                u.Estado,
                Rol = u.Rol != null ? u.Rol.NombreRol : ""
            })
            .ToListAsync();
        return Ok(usuarios);
    }

    // GET: obtiene un usuario por su id con su rol.
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.IdUsuario == id);
        if (usuario == null)
            return NotFound();
        return Ok(new
        {
            usuario.IdUsuario,
            usuario.Codigo,
            usuario.Nombres,
            usuario.Apellidos,
            usuario.Correo,
            usuario.RolId,
            usuario.Estado,
            Rol = usuario.Rol != null ? usuario.Rol.NombreRol : ""
        });
    }

    // POST: crea un nuevo usuario con la contraseña encriptada.
    [HttpPost]
    public async Task<ActionResult<Usuario>> PostUsuario([FromBody] UsuarioRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Nombres) || string.IsNullOrWhiteSpace(request.Apellidos))
                return BadRequest(new { mensaje = "Los nombres y apellidos son obligatorios" });

            if (string.IsNullOrWhiteSpace(request.Contrasena) || request.Contrasena.Length < 6)
                return BadRequest(new { mensaje = "La contraseña debe tener al menos 6 caracteres" });

            var codigoDuplicado = await _context.Usuarios.AnyAsync(u => u.Codigo == request.Codigo);
            if (codigoDuplicado)
                return BadRequest(new { mensaje = "Ya existe un usuario con ese código" });

            string contrasenaEncriptada = BCryptNet.HashPassword(request.Contrasena);

            var usuario = new Usuario
            {
                Codigo = request.Codigo,
                Nombres = request.Nombres.Trim(),
                Apellidos = request.Apellidos.Trim(),
                Correo = request.Correo,
                Contrasena = contrasenaEncriptada,
                RolId = request.RolId,
                Estado = true
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Usuario creado correctamente", id = usuario.IdUsuario });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al crear usuario: {ex.Message}");
            return StatusCode(500, new { mensaje = "Error al crear usuario" });
        }
    }

    // PUT: actualiza los datos de un usuario, encriptando la contraseña si se envía.
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUsuario(int id, [FromBody] UsuarioRequest request)
    {
        var usuarioExistente = await _context.Usuarios.FindAsync(id);
        if (usuarioExistente == null)
            return NotFound(new { mensaje = "Usuario no encontrado" });

        if (string.IsNullOrWhiteSpace(request.Nombres) || string.IsNullOrWhiteSpace(request.Apellidos))
            return BadRequest(new { mensaje = "Los nombres y apellidos son obligatorios" });

        if (!string.IsNullOrEmpty(request.Contrasena) && request.Contrasena.Length < 6)
            return BadRequest(new { mensaje = "La contraseña debe tener al menos 6 caracteres" });

        usuarioExistente.Codigo = request.Codigo;
        usuarioExistente.Nombres = request.Nombres.Trim();
        usuarioExistente.Apellidos = request.Apellidos.Trim();
        usuarioExistente.Correo = request.Correo;
        usuarioExistente.RolId = request.RolId;

        if (!string.IsNullOrEmpty(request.Contrasena))
        {
            usuarioExistente.Contrasena = BCryptNet.HashPassword(request.Contrasena);
        }

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Usuario actualizado correctamente" });
    }

    // DELETE: desactiva a un usuario existente.
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound(new { mensaje = "Usuario no encontrado" });

        usuario.Estado = false;
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Usuario desactivado correctamente" });
    }
}

public class UsuarioRequest
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public string Contrasena { get; set; } = string.Empty;
    public int RolId { get; set; }
}