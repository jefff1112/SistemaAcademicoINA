// Implementación SMTP del servicio de correo usando MailKit.
// Lee la configuración de la sección "Smtp" de appsettings.json.
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace SistemaAcademicoINA.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly EmailQueue _cola;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger, EmailQueue cola)
    {
        _configuration = configuration;
        _logger = logger;
        _cola = cola;
    }

    // Envía el correo HTML a través de SMTP (Gmail con contraseña de aplicación).
    public async Task EnviarAsync(EmailMessage mensaje)
    {
        var smtp = _configuration.GetSection("Smtp");
        var host = smtp["Host"] ?? "smtp.gmail.com";
        var port = int.Parse(smtp["Port"] ?? "587");
        var user = smtp["User"] ?? "";
        var password = smtp["Password"] ?? "";
        var from = smtp["From"] ?? user;
        var fromName = smtp["FromName"] ?? "INA - Sistema Académico";
        var enableSsl = bool.Parse(smtp["EnableSsl"] ?? "true");

        using var client = new SmtpClient();

        // Conexión con STARTTLS (puerto 587) o sin cifrado según configuración.
        await client.ConnectAsync(host, port, enableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

        if (!string.IsNullOrEmpty(user))
        {
            await client.AuthenticateAsync(user, password);
        }

        var correo = new MimeMessage();
        correo.From.Add(new MailboxAddress(fromName, from));
        correo.To.Add(MailboxAddress.Parse(mensaje.Destinatario));
        correo.Subject = mensaje.Asunto;

        var cuerpo = new BodyBuilder { HtmlBody = mensaje.CuerpoHtml };
        correo.Body = cuerpo.ToMessageBody();

        await client.SendAsync(correo);
        await client.DisconnectAsync(true);

        _logger.LogInformation("Correo enviado a {Destinatario}", mensaje.Destinatario);
    }

    // Encola el correo para que EmailBackgroundService lo envíe sin bloquear la petición HTTP.
    public ValueTask EncolarAsync(EmailMessage mensaje) => _cola.Escritor.WriteAsync(mensaje);
}