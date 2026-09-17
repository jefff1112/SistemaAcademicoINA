// Cola de correos en memoria: canal compartido entre productores (controladores/servicios)
// y el consumidor (EmailBackgroundService).
using System.Threading.Channels;

namespace SistemaAcademicoINA.Services;

public class EmailQueue
{
    private readonly Channel<EmailMessage> _canal = Channel.CreateUnbounded<EmailMessage>(
        new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        });

    // Escritor para encolar correos.
    public ChannelWriter<EmailMessage> Escritor => _canal.Writer;

    // Lector consumido por el servicio en background.
    public ChannelReader<EmailMessage> Lector => _canal.Reader;
}