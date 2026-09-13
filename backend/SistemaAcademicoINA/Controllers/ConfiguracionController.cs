using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: expone la configuración general del instituto (datos de contacto y año lectivo).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConfiguracionController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    // Almacén en memoria para el ciclo de vida de la API (no existe tabla de configuración en la BD).
    private static readonly Dictionary<string, string> ConfiguracionMemoria = new();

    public ConfiguracionController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: devuelve la configuración general del instituto (nombre, contacto y año lectivo).
    // GET: api/configuracion
    [HttpGet]
    public async Task<IActionResult> GetConfiguracion()
    {
        var config = new
        {
            NombreInstituto = ConfiguracionMemoria.TryGetValue("NombreInstituto", out var ni) ? ni : "Instituto Nacional de Apopa",
            AnioLectivo = ConfiguracionMemoria.TryGetValue("AnioLectivo", out var al) && int.TryParse(al, out var anio) ? anio : DateTime.Now.Year,
            TelefonoContacto = ConfiguracionMemoria.TryGetValue("TelefonoContacto", out var tc) ? tc : "2288-9966",
            CorreoContacto = ConfiguracionMemoria.TryGetValue("CorreoContacto", out var cc) ? cc : "ina@mined.edu.sv",
            Director = ConfiguracionMemoria.TryGetValue("Director", out var di) ? di : "Lic. Juan Perez",
            Lema = ConfiguracionMemoria.TryGetValue("Lema", out var le) ? le : "Educacion con excelencia"
        };

        return Ok(config);
    }

    // PUT: guarda la configuración del instituto (persistencia en memoria de la instancia en ejecución).
    // PUT: api/configuracion
    [Authorize(Roles = "Administrador")]
    [HttpPut]
    public async Task<IActionResult> UpdateConfiguracion([FromBody] ConfiguracionRequest config)
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(config.NombreInstituto)) ConfiguracionMemoria["NombreInstituto"] = config.NombreInstituto.Trim();
            if (config.AnioLectivo > 2000) ConfiguracionMemoria["AnioLectivo"] = config.AnioLectivo.ToString();
            if (!string.IsNullOrWhiteSpace(config.TelefonoContacto)) ConfiguracionMemoria["TelefonoContacto"] = config.TelefonoContacto.Trim();
            if (!string.IsNullOrWhiteSpace(config.CorreoContacto)) ConfiguracionMemoria["CorreoContacto"] = config.CorreoContacto.Trim();
            if (!string.IsNullOrWhiteSpace(config.Director)) ConfiguracionMemoria["Director"] = config.Director.Trim();
            if (!string.IsNullOrWhiteSpace(config.Lema)) ConfiguracionMemoria["Lema"] = config.Lema.Trim();

            return Ok(new { mensaje = "Configuracion guardada correctamente" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al guardar configuracion: {ex.Message}");
            return StatusCode(500, new { mensaje = "Error al guardar configuracion" });
        }
    }
}

public class ConfiguracionRequest
{
    public string NombreInstituto { get; set; } = string.Empty;
    public int AnioLectivo { get; set; }
    public string TelefonoContacto { get; set; } = string.Empty;
    public string CorreoContacto { get; set; } = string.Empty;
    public string Director { get; set; } = string.Empty;
    public string Lema { get; set; } = string.Empty;
}
