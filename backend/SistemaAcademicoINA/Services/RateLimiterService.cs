// Servicio de rate limiting en memoria: limita el número de solicitudes por clave
// (IP) dentro de una ventana de tiempo. Simple y sin dependencias externas.
using System.Collections.Concurrent;

namespace SistemaAcademicoINA.Services;

public class RateLimiterService
{
    private readonly ConcurrentDictionary<string, List<DateTime>> _registros = new();

    // Devuelve true si la solicitud está permitida dentro del límite y ventana dados.
    public bool Permitir(string clave, int limite, int ventanaSegundos)
    {
        var ahora = DateTime.UtcNow;
        var lista = _registros.GetOrAdd(clave, _ => new List<DateTime>());

        lock (lista)
        {
            lista.RemoveAll(t => t < ahora.AddSeconds(-ventanaSegundos));
            if (lista.Count >= limite)
                return false;

            lista.Add(ahora);
            return true;
        }
    }
}