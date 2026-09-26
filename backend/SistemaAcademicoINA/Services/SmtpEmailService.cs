// Implementación SMTP del servicio de correo usando MailKit.
// Lee la configuración de la sección "Smtp" de appsettings.json.
// Soporta autenticación con contraseña de aplicación de Gmail (recomendado).
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

        if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "La configuración SMTP no está completa. Verifica 'Smtp:User' y 'Smtp:Password' en appsettings.json");
        }

        using var client = new SmtpClient();

        // Detectar el tipo de conexión segura según el puerto.
        // - Puerto 587: STARTTLS (recomendado por Gmail)
        // - Puerto 465: SSL/TLS directo
        // - Cualquier otro: sin cifrado
        SecureSocketOptions secureOption;
        if (port == 465)
        {
            secureOption = SecureSocketOptions.SslOnConnect;
        }
        else if (port == 587 || enableSsl)
        {
            secureOption = SecureSocketOptions.StartTls;
        }
        else
        {
            secureOption = SecureSocketOptions.None;
        }

        _logger.LogInformation("Conectando a SMTP {Host}:{Port} con {SecureOption}", host, port, secureOption);

        await client.ConnectAsync(host, port, secureOption);

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