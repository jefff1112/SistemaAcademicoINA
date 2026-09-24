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
        Console.WriteLine($"[DEBUG] EncargadosController: Buscando estudiantes para idUsuario={idUsuario}");
        
        var persona = await _context.Personas
            .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        Console.WriteLine($"[DEBUG] Persona encontrada: {(persona != null ? $"IdPersona={persona.IdPersona}, Nombre={persona.Nombres} {persona.Apellidos}" : "NULL")}");

        if (persona == null)
        {
            Console.WriteLine($"[DEBUG] No hay persona para idUsuario={idUsuario}");
            return Ok(new List<object>());
        }

        var relaciones = await _context.RelacionesFamiliares
            .Include(r => r.Estudiante)
                .ThenInclude(e => e.Clase)
            .Where(r => r.IdPersona == persona.IdPersona && r.RecibeComunicados == true)
            .ToListAsync();

        Console.WriteLine($"[DEBUG] RelacionesFamiliares encontradas: {relaciones.Count} para IdPersona={persona.IdPersona}");

        var estudiantes = relaciones
            .Where(r => r.Estudiante != null)
            .Select(r => new
            {
                IdEstudiante = r.Estudiante.IdEstudiante,
                Nombres = r.Estudiante.Nombres,
                Apellidos = r.Estudiante.Apellidos,
                CodigoEstudiante = r.Estudiante.CodigoEstudiante,
                Nie = r.Estudiante.Nie,
                Parentesco = r.Parentesco,
                Clase = r.Estudiante.Clase != null
                    ? new { r.Estudiante.Clase.NombreClase, r.Estudiante.Clase.Seccion }
                    : null
            })
            .ToList();

        Console.WriteLine($"[DEBUG] Estudiantes a retornar: {estudiantes.Count}");
        return Ok(estudiantes);
    }
}
