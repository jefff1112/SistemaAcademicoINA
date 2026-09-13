// DTOs de autenticación: credenciales de inicio de sesión y respuesta con el token de sesión.
namespace SistemaAcademicoINA.Models.DTOs;

// DTO de request: credenciales de acceso al sistema (código de usuario y contraseña).
public class LoginDTO
{
    public string Codigo { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
}

// DTO de respuesta: datos del usuario autenticado junto con el token de sesión y su expiración.
public class LoginResponseDTO
{
    public int IdUsuario { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime Expiracion { get; set; }
}