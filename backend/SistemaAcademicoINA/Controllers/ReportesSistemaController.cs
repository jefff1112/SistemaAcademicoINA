using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: expone el catálogo demostrativo de reportes del sistema.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportesSistemaController : ControllerBase
{
    // GET: api/reportessistema
    [HttpGet]
    public IActionResult GetReportes()
    {
        var reportes = new[]
        {
            new { Id = 1, Nombre = "Reporte de Usuarios", Descripcion = "Listado de todos los usuarios del sistema", Fecha = DateTime.Now.AddDays(-1) },
            new { Id = 2, Nombre = "Reporte de Actividad", Descripcion = "Registro de actividades recientes", Fecha = DateTime.Now.AddDays(-2) },
            new { Id = 3, Nombre = "Reporte de Errores", Descripcion = "Errores del sistema", Fecha = DateTime.Now.AddDays(-3) },
            new { Id = 4, Nombre = "Estadisticas de Uso", Descripcion = "Metricas de uso del sistema", Fecha = DateTime.Now.AddDays(-4) }
        };
        return Ok(reportes);
    }

    // GET: api/reportessistema/{id}
    [HttpGet("{id}")]
    public IActionResult GetReporte(int id)
    {
        return Ok(new { Id = id, Nombre = $"Reporte {id}", Contenido = "Contenido del reporte", FechaGeneracion = DateTime.Now });
    }
}
