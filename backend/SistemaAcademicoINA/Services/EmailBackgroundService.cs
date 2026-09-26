// Servicio en background que consume la cola de correos y los envía de forma asíncrona.
// Registra en auditoría cada envío (éxito o fallo) sin bloquear las peticiones HTTP.
using SistemaAcademicoINA.Helpers;

namespace SistemaAcademicoINA.Services;

public class EmailBackgroundService : BackgroundService
{
    private readonly EmailQueue _cola;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EmailBackgroundService> _logger;

    public EmailBackgroundService(
        EmailQueue cola,
        IServiceScopeFactory scopeFactory,
        ILogger<EmailBackgroundService> logger)
    {
        _cola = cola;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("EmailBackgroundService iniciado y escuchando la cola");

        await foreach (var mensaje in _cola.Lector.ReadAllAsync(stoppingToken))
        {
            try
            {
                // Crear scope para resolver IEmailService (Scoped) y AuditoriaHelper (Scoped)
                using var scope = _scopeFactory.CreateScope();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                var auditoria = scope.ServiceProvider.GetRequiredService<AuditoriaHelper>();

                _logger.LogInformation("Procesando correo para {Destinatario}", mensaje.Destinatario);

                await emailService.EnviarAsync(mensaje);

                _logger.LogInformation("Correo enviado exitosamente a {Destinatario}", mensaje.Destinatario);

                await auditoria.RegistrarAsync(
                    "EmailEnviado",
                    $"Correo enviado a {mensaje.Destinatario}",
                    "Sistema");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar correo a {Destinatario}", mensaje.Destinatario);

                // Auditoría del error en un scope separado por si el anterior falló
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var auditoria = scope.ServiceProvider.GetRequiredService<AuditoriaHelper>();
                    await auditoria.RegistrarAsync(
                        "EmailError",
                        $"Error al enviar correo a {mensaje.Destinatario}: {ex.Message}",
                        "Sistema");
                }
                catch (Exception auditEx)
                {
                    _logger.LogWarning(auditEx, "No se pudo registrar auditoría del error de correo");
                }
            }
        }

        _logger.LogInformation("EmailBackgroundService detenido");
    }
}