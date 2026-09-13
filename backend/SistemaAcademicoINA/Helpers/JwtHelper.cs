// Utilidad para generar tokens JWT de acceso con identificador, código y rol del usuario.
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace SistemaAcademicoINA.Helpers;

public class JwtHelper
{
    private readonly IConfiguration _configuration;

    public JwtHelper(IConfiguration configuration)
    {
        _configuration = configuration;
    }

// Genera un token JWT firmado con la clave de "Jwt:Key", vigente por 8 horas.
public string GenerarToken(int idUsuario, string codigo, string rol)
{
    var tokenHandler = new JwtSecurityTokenHandler();
    // Mismo fallback que Program.cs: sin configuración, firma y validación usan la MISMA clave.
    var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "TuClaveSecretaSuperSeguraDeAlMenos32Caracteres!");
    var issuer = _configuration["Jwt:Issuer"] ?? "SistemaAcademicoINA";
    var audience = _configuration["Jwt:Audience"] ?? "SistemaAcademicoINAWeb";

    // Define los claims de identidad y rol, y las credenciales de firma del token.
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, idUsuario.ToString()),
            new Claim(ClaimTypes.Name, codigo),
            new Claim(ClaimTypes.Role, rol)
        }),
        Issuer = issuer,
        Audience = audience,
        Expires = DateTime.UtcNow.AddHours(8),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };

    var token = tokenHandler.CreateToken(tokenDescriptor);
    return tokenHandler.WriteToken(token);
}
}