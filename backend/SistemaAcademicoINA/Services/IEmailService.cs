// Interfaz del servicio de correo: envío directo y encolado para envío asíncrono en background.
namespace SistemaAcademicoINA.Services;

public interface IEmailService
{
    // Envía el correo de forma inmediata (bloqueante respecto a quien lo invoca).
    Task EnviarAsync(EmailMessage mensaje);

    // Encola el correo para ser enviado en background (no bloquea la respuesta HTTP).
    ValueTask EncolarAsync(EmailMessage mensaje);
}