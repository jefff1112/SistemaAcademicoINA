using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using System.IO;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: monitorea el espacio en disco del servidor y su historial.
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class MonitoreoController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<MonitoreoController> _logger;

    public MonitoreoController(ApplicationDbContext context, IWebHostEnvironment environment, ILogger<MonitoreoController> logger)
    {
        _context = context;
        _environment = environment;
        _logger = logger;
    }

    // GET: calcula y registra el espacio en disco, con alerta si queda menos de 2 GB.
    [HttpGet("espacio")]
    public async Task<IActionResult> GetEspacioDisco()
    {
        try
        {
            var driveInfo = new DriveInfo(Path.GetPathRoot(_environment.ContentRootPath));

            // Guarda contra unidades virtuales sin tamaño reportado (división por cero).
            if (driveInfo.TotalSize <= 0)
            {
                var sinDatos = new MonitoreoEspacio
                {
                    EspacioTotalGB = 0,
                    EspacioLibreGB = 0,
                    EspacioUsadoGB = 0,
                    PorcentajeUso = 0,
                    Fecha = DateTime.Now,
                    CreatedAt = DateTime.Now
                };
                _context.MonitoreoEspacio.Add(sinDatos);
                await _context.SaveChangesAsync();
                return Ok(sinDatos);
            }

            var espacioTotalGB = Math.Round((decimal)driveInfo.TotalSize / 1024 / 1024 / 1024, 2);
            var espacioLibreGB = Math.Round((decimal)driveInfo.AvailableFreeSpace / 1024 / 1024 / 1024, 2);
            var espacioUsadoGB = espacioTotalGB - espacioLibreGB;
            var porcentajeUso = Math.Round((espacioUsadoGB / espacioTotalGB) * 100, 2);

            var monitoreo = new MonitoreoEspacio
            {
                EspacioTotalGB = espacioTotalGB,
                EspacioLibreGB = espacioLibreGB,
                EspacioUsadoGB = espacioUsadoGB,
                PorcentajeUso = porcentajeUso,
                Fecha = DateTime.Now,
                CreatedAt = DateTime.Now
            };

            _context.MonitoreoEspacio.Add(monitoreo);
            await _context.SaveChangesAsync();

            // Alerta si el espacio libre es menor a 2GB
            if (espacioLibreGB < 2)
            {
                _logger.LogWarning($"⚠️ ALERTA: Espacio libre en disco: {espacioLibreGB} GB");
                // Aquí se podría enviar un correo de alerta
            }

            return Ok(new
            {
                espacioTotalGB,
                espacioLibreGB,
                espacioUsadoGB,
                porcentajeUso,
                status = espacioLibreGB < 2 ? "CRITICO" : espacioLibreGB < 5 ? "ADVERTENCIA" : "OK"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener espacio en disco");
            return StatusCode(500, new { mensaje = "Error al obtener espacio en disco", error = ex.Message });
        }
    }

    // GET: obtiene el historial de mediciones de espacio en disco de los últimos días.
    [HttpGet("espacio/historial")]
    public async Task<IActionResult> GetHistorialEspacio(int dias = 7)
    {
        try
        {
            var historial = await _context.MonitoreoEspacio
                .Where(m => m.Fecha >= DateTime.Now.AddDays(-dias))
                .OrderByDescending(m => m.Fecha)
                .ToListAsync();

            return Ok(historial);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener historial", error = ex.Message });
        }
    }
}
