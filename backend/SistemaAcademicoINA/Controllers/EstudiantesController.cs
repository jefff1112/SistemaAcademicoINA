using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona la información de los estudiantes (consulta, creación, edición y cambio de clase).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EstudiantesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EstudiantesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene la lista de estudiantes ordenada por apellidos.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Estudiante>>> GetEstudiantes()
    {
        try
        {
            var estudiantes = await _context.Estudiantes
                .OrderBy(e => e.Apellidos)
                .ToListAsync();
            return Ok(estudiantes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener estudiantes", error = ex.Message });
        }
    }

    // GET: obtiene un estudiante por su id.
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Estudiante>> GetEstudiante(int id)
    {
        try
        {
            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.IdEstudiante == id);

            if (estudiante == null)
                return NotFound(new { mensaje = "Estudiante no encontrado" });

            return Ok(estudiante);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener estudiante", error = ex.Message });
        }
    }

    // GET: obtiene un estudiante por su código.
    [HttpGet("codigo/{codigo}")]
    public async Task<ActionResult<Estudiante>> GetEstudianteByCodigo(string codigo)
    {
        try
        {
            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.CodigoEstudiante == codigo);

            if (estudiante == null)
                return NotFound(new { mensaje = "Estudiante no encontrado" });

            return Ok(estudiante);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener estudiante", error = ex.Message });
        }
    }

    // GET: obtiene los estudiantes activos de una clase.
    [HttpGet("clase/{idClase}")]
    public async Task<ActionResult<IEnumerable<Estudiante>>> GetEstudiantesByClase(int idClase)
    {
        try
        {
            var estudiantes = await _context.Estudiantes
                .Where(e => e.IdClase == idClase && e.Estado)
                .OrderBy(e => e.Apellidos)
                .ToListAsync();

            return Ok(estudiantes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener estudiantes por clase", error = ex.Message });
        }
    }

    // POST: crea un nuevo estudiante validando que el código no exista.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<ActionResult<Estudiante>> PostEstudiante([FromBody] EstudianteRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.CodigoEstudiante))
                return BadRequest(new { mensaje = "El código del estudiante es requerido" });

            if (string.IsNullOrEmpty(request.Nombres))
                return BadRequest(new { mensaje = "Los nombres son requeridos" });

            if (string.IsNullOrEmpty(request.Apellidos))
                return BadRequest(new { mensaje = "Los apellidos son requeridos" });

            var existe = await _context.Estudiantes
                .AnyAsync(e => e.CodigoEstudiante == request.CodigoEstudiante);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe un estudiante con ese código" });

            var estudiante = new Estudiante
            {
                Nombres = request.Nombres,
                Apellidos = request.Apellidos,
                CodigoEstudiante = request.CodigoEstudiante,
                Dui = request.Dui,
                Nie = request.Nie,
                CorreoEstudiante = request.CorreoEstudiante,
                TelefonoMovil = request.TelefonoMovil,
                Direccion = request.Direccion,
                IdClase = request.IdClase,
                Estado = true
            };

            _context.Estudiantes.Add(estudiante);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Estudiante creado correctamente", id = estudiante.IdEstudiante });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear estudiante", error = ex.Message });
        }
    }

    // PUT: actualiza los datos de un estudiante existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutEstudiante(int id, [FromBody] EstudianteRequest request)
    {
        try
        {
            var estudiante = await _context.Estudiantes.FindAsync(id);
            if (estudiante == null)
                return NotFound(new { mensaje = "Estudiante no encontrado" });

            if (string.IsNullOrEmpty(request.CodigoEstudiante))
                return BadRequest(new { mensaje = "El código del estudiante es requerido" });

            if (string.IsNullOrEmpty(request.Nombres))
                return BadRequest(new { mensaje = "Los nombres son requeridos" });

            if (string.IsNullOrEmpty(request.Apellidos))
                return BadRequest(new { mensaje = "Los apellidos son requeridos" });

            // Verificar código único (excepto el actual)
            var existe = await _context.Estudiantes
                .AnyAsync(e => e.CodigoEstudiante == request.CodigoEstudiante && e.IdEstudiante != id);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe otro estudiante con ese código" });

            var correoAnterior = estudiante.CorreoEstudiante;

            estudiante.Nombres = request.Nombres;
            estudiante.Apellidos = request.Apellidos;
            estudiante.CodigoEstudiante = request.CodigoEstudiante;
            estudiante.Dui = request.Dui;
            estudiante.Nie = request.Nie;
            estudiante.CorreoEstudiante = request.CorreoEstudiante;
            estudiante.TelefonoMovil = request.TelefonoMovil;
            estudiante.Direccion = request.Direccion;
            estudiante.IdClase = request.IdClase;
            estudiante.Estado = request.Estado;

            // Sincronizar el correo (y nombres) con el usuario y aspirante vinculados, si existen.
            var correoCambio = request.CorreoEstudiante != correoAnterior;

            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Codigo == estudiante.CodigoEstudiante);
            if (usuario != null)
            {
                if (correoCambio)
                    usuario.Correo = request.CorreoEstudiante;
                usuario.Nombres = request.Nombres;
                usuario.Apellidos = request.Apellidos;
            }

            if (estudiante.IdAspiranteOrigen.HasValue)
            {
                var aspirante = await _context.Aspirantes.FindAsync(estudiante.IdAspiranteOrigen.Value);
                if (aspirante != null)
                {
                    if (correoCambio)
                        aspirante.Correo = request.CorreoEstudiante;
                    aspirante.Nombres = request.Nombres;
                    aspirante.Apellidos = request.Apellidos;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Estudiante actualizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar estudiante", error = ex.Message });
        }
    }

    // PUT: cambia de clase a un estudiante, ajustando los cupos de ambas clases.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id:int}/cambiar-clase")]
    public async Task<IActionResult> CambiarClase(int id, [FromBody] CambiarClaseDto dto)
    {
        try
        {
            var estudiante = await _context.Estudiantes.FindAsync(id);
            if (estudiante == null)
                return NotFound(new { mensaje = "Estudiante no encontrado" });

            var idClase = dto.GetIdClase();
            var nuevaClase = await _context.Clases.FindAsync(idClase);
            if (nuevaClase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            if (nuevaClase.CupoActual >= nuevaClase.CupoMaximo)
                return BadRequest(new { mensaje = "La clase destino no tiene cupos disponibles" });

            var claseAnterior = estudiante.IdClase.HasValue
                ? await _context.Clases.FindAsync(estudiante.IdClase.Value)
                : null;

            if (claseAnterior != null)
                claseAnterior.CupoActual--;

            nuevaClase.CupoActual++;
            estudiante.IdClase = idClase;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Clase del estudiante actualizada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al cambiar clase del estudiante", error = ex.Message });
        }
    }

    // DELETE: desactiva a un estudiante existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEstudiante(int id)
    {
        try
        {
            var estudiante = await _context.Estudiantes.FindAsync(id);
            if (estudiante == null)
                return NotFound(new { mensaje = "Estudiante no encontrado" });

            estudiante.Estado = false;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Estudiante desactivado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar estudiante", error = ex.Message });
        }
    }
}

public class CambiarClaseDto
{
    private int _idClase;

    [JsonPropertyName("IdClaseAsignada")]
    public int IdClaseAsignada { get => _idClase; set => _idClase = value; }

    // Soporta también la propiedad 'idClase' enviada desde el frontend
    [JsonPropertyName("idClase")]
    public int idClase { get => _idClase; set => _idClase = value; }

    // Valor común para uso en el controlador
    public int GetIdClase() => _idClase;
}

public class EstudianteRequest
{
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string CodigoEstudiante { get; set; } = string.Empty;
    public string? Dui { get; set; }
    public string? Nie { get; set; }
    public string? CorreoEstudiante { get; set; }
    public string? TelefonoMovil { get; set; }
    public string? Direccion { get; set; }
    public int? IdClase { get; set; }
    public bool Estado { get; set; } = true;
}
