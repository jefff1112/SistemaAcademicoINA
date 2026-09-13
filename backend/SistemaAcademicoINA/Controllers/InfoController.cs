using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: endpoint de información básica del sistema (nombre, versión y estado).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InfoController : ControllerBase
{
    // GET: devuelve la información de versión y estado del sistema.
    [AllowAnonymous]
    [HttpGet]
    public IActionResult GetInfo()
    {
        return Ok(new
        {
            Nombre = "Sistema Academico INA",
            Version = "1.0.0",
            Framework = ".NET 8.0",
            Fecha = DateTime.Now,
            Estado = "Funcionando"
        });
    }
}
