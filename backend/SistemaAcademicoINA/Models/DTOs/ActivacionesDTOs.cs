// DTOs del módulo de gestión de activaciones pendientes.
using System.ComponentModel.DataAnnotations;

namespace SistemaAcademicoINA.Models.DTOs;

// Request: marcar un estudiante en espera de activación (con comentario opcional).
public class MarcarEsperaRequest
{
    public string? Comentario { get; set; }
}

// Request: activar presencialmente (el personal crea una contraseña temporal).
public class ActivarPresencialRequest
{
    [Required(ErrorMessage = "La contraseña temporal es obligatoria")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    public string PasswordTemporal { get; set; } = string.Empty;
}

// Request: solicitar un nuevo enlace de activación (desde la pantalla de "enlace expirado").
public class SolicitarNuevoEnlaceRequest
{
    [Required(ErrorMessage = "El token es obligatorio")]
    public string Token { get; set; } = string.Empty;
}