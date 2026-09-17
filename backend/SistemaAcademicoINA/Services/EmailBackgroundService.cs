// Servicio en background que consume la cola de correos y los envía de forma asíncrona.
// Registra en auditoría cada envío (éxito o fallo) sin bloquear las peticiones HTTP.
using SistemaAcademicoINA.Helpers;

namespace SistemaAcademicoINA.Services;

public class EmailBackgroundService : BackgroundService
{
    private readonly EmailQueue _cola;
    private readonly IEmailService _emailService;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EmailBackgroundService> _logger;

    public EmailBackgroundService(
        EmailQueue cola,
        IEmailService emailService,
        IServiceScopeFactory scopeFactory,
        ILogger<EmailBackgroundService> logger)
    {
        _cola = cola;
        _emailService = emailService;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var mensaje in _cola.Lector.ReadAllAsync(stoppingToken))
        {
            try
            {
                await _emailService.EnviarAsync(mensaje);
                await RegistrarAuditoriaAsync($"Correo enviado a {mensaje.Destinatario}", "EmailEnviado");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar correo a {Destinatario}", mensaje.Destinatario);
                await RegistrarAuditoriaAsync($"Error al enviar correo a {mensaje.Destinatario}: {ex.Message}", "EmailError");
            }
        }
    }

    // Registra el resultado del envío en auditoría usando un scope propio
    // (BackgroundService es singleton, mientras el DbContext es scoped).
    private async Task RegistrarAuditoriaAsync(string detalle, string accion)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var auditoria = scope.ServiceProvider.GetRequiredService<AuditoriaHelper>();
            await auditoria.RegistrarAsync(accion, detalle, "Sistema");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "No se pudo registrar auditoría de envío de correo");
        }
    }
}