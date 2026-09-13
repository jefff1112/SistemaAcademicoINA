using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Helpers;
using SistemaAcademicoINA.Models.DTOs;
using SistemaAcademicoINA.Models.Entities;
using BCryptHelper = BCrypt.Net.BCrypt;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona la autenticación de usuarios (inicio de sesión, control de intentos fallidos y cierre de sesión).
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtHelper _jwtHelper;

    public AuthController(ApplicationDbContext context, JwtHelper jwtHelper)
    {
        _context = context;
        _jwtHelper = jwtHelper;
    }

    // POST: autentica al usuario (código o correo + contraseña) y devuelve el token JWT.
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginDTO login)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(login.Codigo) || string.IsNullOrWhiteSpace(login.Contrasena))
            {
                return BadRequest(new { mensaje = "Código y contraseña son obligatorios" });
            }

            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";

            // =============================================
            // 1. BUSCAR USUARIO (código o correo)
            // =============================================
            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u =>
                    (u.Codigo == login.Codigo || u.Correo == login.Codigo)
                    && u.Estado == true);

            if (usuario == null)
            {
                // Intentos de códigos inexistentes se cuentan por el valor crudo.
                await RegistrarIntentoLogin(login.Codigo, ip, false);
                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos" });
            }

            // =============================================
            // 2. BLOQUEO DE INTENTOS FALLIDOS
            // Se cuenta por CÓDIGO CANÓNICO del usuario (no por el valor que
            // escribió el cliente), de modo que alternar código/correo no
            // reinicia el contador (evita el bypass).
            // =============================================
            var intentosFallidos = await _context.IntentosLogin
                .Where(i => i.Codigo == usuario.Codigo && !i.Exitoso && i.Fecha > DateTime.Now.AddMinutes(-15))
                .CountAsync();

            if (intentosFallidos >= 5)
            {
                return StatusCode(423, new { mensaje = "Usuario bloqueado por demasiados intentos. Espere 15 minutos." });
            }

            // =============================================
            // 3. VERIFICAR CONTRASEÑA
            // =============================================
            if (!BCryptHelper.Verify(login.Contrasena, usuario.Contrasena))
            {
                await RegistrarIntentoLogin(usuario.Codigo, ip, false);
                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos" });
            }

            // =============================================
            // 4. LOGIN EXITOSO - LIMPIAR INTENTOS
            // =============================================
            await _context.IntentosLogin
                .Where(i => i.Codigo == usuario.Codigo && !i.Exitoso)
                .ExecuteDeleteAsync();

            await RegistrarIntentoLogin(usuario.Codigo, ip, true);

            // =============================================
            // 5. REGISTRAR AUDITORÍA Y SESIÓN ACTIVA
            // =============================================
            string nombreRol = usuario.Rol?.NombreRol ?? "Usuario";
            var token = _jwtHelper.GenerarToken(usuario.IdUsuario, usuario.Codigo, nombreRol);

            try
            {
                var auditoria = new Auditoria
                {
                    Usuario = usuario.Codigo,
                    Accion = "Login",
                    Detalle = $"Inicio de sesion exitoso desde IP: {ip}",
                    Ip = ip,
                    Fecha = DateTime.Now,
                    CreatedAt = DateTime.Now
                };
                _context.Auditoria.Add(auditoria);

                _context.SesionesUsuarios.Add(new SesionUsuario
                {
                    IdUsuario = usuario.IdUsuario,
                    Usuario = usuario.Codigo,
                    Token = token,
                    Ip = ip,
                    FechaInicio = DateTime.Now,
                    Activa = true,
                    CreatedAt = DateTime.Now
                });

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al registrar auditoria/sesion: {ex.Message}");
            }

            // =============================================
            // 6. GENERAR TOKEN Y RESPONDER
            // =============================================
            return Ok(new LoginResponseDTO
            {
                IdUsuario = usuario.IdUsuario,
                Nombres = usuario.Nombres,
                Apellidos = usuario.Apellidos,
                Codigo = usuario.Codigo,
                Correo = usuario.Correo ?? "",
                Rol = nombreRol,
                Token = token,
                Expiracion = DateTime.Now.AddHours(8)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en login: {ex.Message}");
            return StatusCode(500, new { mensaje = "Error al iniciar sesión" });
        }
    }

    // POST: cierra la sesión marcando como inactiva la sesión del token enviado.
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var authHeader = HttpContext.Request.Headers["Authorization"].ToString();
            var token = authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
                ? authHeader["Bearer ".Length..]
                : authHeader;

            if (!string.IsNullOrEmpty(token))
            {
                var sesiones = await _context.SesionesUsuarios
                    .Where(s => s.Token == token && s.Activa)
                    .ToListAsync();

                foreach (var sesion in sesiones)
                {
                    sesion.Activa = false;
                    sesion.FechaFin = DateTime.Now;
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { mensaje = "Sesión cerrada correctamente" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en logout: {ex.Message}");
            return StatusCode(500, new { mensaje = "Error al cerrar sesión" });
        }
    }

    // =============================================
    // MÉTODO PARA REGISTRAR INTENTOS DE LOGIN
    // =============================================
    private async Task RegistrarIntentoLogin(string codigo, string ip, bool exitoso)
    {
        try
        {
            var intento = new IntentoLogin
            {
                Codigo = codigo,
                Ip = ip,
                Fecha = DateTime.Now,
                Exitoso = exitoso,
                CreatedAt = DateTime.Now
            };

            _context.IntentosLogin.Add(intento);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al registrar intento de login: {ex.Message}");
        }
    }
}