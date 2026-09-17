// Mensaje de correo a enviar o encolar. Datos mínimos para el envío HTML.
namespace SistemaAcademicoINA.Services;

public class EmailMessage
{
    public string Destinatario { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string CuerpoHtml { get; set; } = string.Empty;
}