using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: consulta los estudiantes vinculados a un encargado (padre/madre de familia) para comunicados.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EncargadosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EncargadosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene los estudiantes relacionados con el encargado según su usuario.
    [HttpGet("{idUsuario}/estudiantes")]
    public async Task<ActionResult> GetEstudiantesByEncargado(int idUsuario)
    {
        var persona = await _context.Personas
            .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        if (persona == null)
            return Ok(new List<object>());

        var estudiantes = await _context.RelacionesFamiliares
            .Include(r => r.Estudiante)
                .ThenInclude(e => e.Clase)
            .Where(r => r.IdPersona == persona.IdPersona && r.RecibeComunicados == true)
            .Select(r => new
            {
                IdEstudiante = r.Estudiante != null ? r.Estudiante.IdEstudiante : 0,
                Nombres = r.Estudiante != null ? r.Estudiante.Nombres : "",
                Apellidos = r.Estudiante != null ? r.Estudiante.Apellidos : "",
                CodigoEstudiante = r.Estudiante != null ? r.Estudiante.CodigoEstudiante : "",
                Nie = r.Estudiante != null ? r.Estudiante.Nie : "",
                Parentesco = r.Parentesco,
                Clase = r.Estudiante != null && r.Estudiante.Clase != null
                    ? new { r.Estudiante.Clase.NombreClase, r.Estudiante.Clase.Seccion }
                    : null
            })
            .ToListAsync();

        return Ok(estudiantes);
    }
}
