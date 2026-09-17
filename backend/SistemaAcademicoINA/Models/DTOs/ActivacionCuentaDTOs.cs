// DTOs del flujo de activación de cuentas de estudiantes de nuevo ingreso.
using System.ComponentModel.DataAnnotations;

namespace SistemaAcademicoINA.Models.DTOs;

// Request: crear la contraseña y activar la cuenta (token de un solo uso).
public class ActivarCuentaRequest
{
    [Required(ErrorMessage = "El token es obligatorio")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "La contraseña debe incluir al menos 1 mayúscula y 1 número")]
    public string Password { get; set; } = string.Empty;
}