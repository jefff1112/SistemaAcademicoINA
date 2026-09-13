using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona la información de los docentes y sus materias/clases asignadas.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocentesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DocentesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene la lista de docentes ordenada por apellidos.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Docente>>> GetDocentes()
    {
        try
        {
            var docentes = await _context.Docentes
                .OrderBy(d => d.Apellidos)
                .ToListAsync();
            return Ok(docentes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener docentes", error = ex.Message });
        }
    }

    // GET: obtiene un docente específico por su id.
    [HttpGet("{id}")]
    public async Task<ActionResult<Docente>> GetDocente(int id)
    {
        try
        {
            var docente = await _context.Docentes.FindAsync(id);
            if (docente == null)
                return NotFound(new { mensaje = "Docente no encontrado" });

            return Ok(docente);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener docente", error = ex.Message });
        }
    }

    // POST: crea un nuevo docente validando que el código no exista.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<ActionResult<Docente>> PostDocente([FromBody] DocenteRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.CodigoDocente))
                return BadRequest(new { mensaje = "El código del docente es requerido" });

            if (string.IsNullOrEmpty(request.Nombres))
                return BadRequest(new { mensaje = "Los nombres son requeridos" });

            if (string.IsNullOrEmpty(request.Apellidos))
                return BadRequest(new { mensaje = "Los apellidos son requeridos" });

            var existe = await _context.Docentes
                .AnyAsync(d => d.CodigoDocente == request.CodigoDocente);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe un docente con ese código" });

            var docente = new Docente
            {
                CodigoDocente = request.CodigoDocente,
                Nombres = request.Nombres,
                Apellidos = request.Apellidos,
                Dui = request.Dui,
                Correo = request.Correo,
                Telefono = request.Telefono,
                EspecialidadDocente = request.EspecialidadDocente,
                TipoDocente = request.TipoDocente ?? "Basica",
                FechaIngreso = request.FechaIngreso,
                Estado = true
            };

            _context.Docentes.Add(docente);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Docente creado correctamente", id = docente.IdDocente });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear docente", error = ex.Message });
        }
    }

    // PUT: actualiza los datos de un docente existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutDocente(int id, [FromBody] DocenteRequest request)
    {
        try
        {
            var docente = await _context.Docentes.FindAsync(id);
            if (docente == null)
                return NotFound(new { mensaje = "Docente no encontrado" });

            // Validar código único (excepto el actual)
            var existe = await _context.Docentes
                .AnyAsync(d => d.CodigoDocente == request.CodigoDocente && d.IdDocente != id);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe otro docente con ese código" });

            docente.CodigoDocente = request.CodigoDocente;
            docente.Nombres = request.Nombres;
            docente.Apellidos = request.Apellidos;
            docente.Dui = request.Dui;
            docente.Correo = request.Correo;
            docente.Telefono = request.Telefono;
            docente.EspecialidadDocente = request.EspecialidadDocente;
            docente.TipoDocente = request.TipoDocente ?? docente.TipoDocente;
            docente.FechaIngreso = request.FechaIngreso;
            docente.Estado = request.Estado;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Docente actualizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar docente", error = ex.Message });
        }
    }

    // DELETE: desactiva a un docente existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocente(int id)
    {
        try
        {
            var docente = await _context.Docentes.FindAsync(id);
            if (docente == null)
                return NotFound(new { mensaje = "Docente no encontrado" });

            docente.Estado = false;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Docente desactivado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar docente", error = ex.Message });
        }
    }

    // GET: obtiene las materias asignadas a un docente en un año lectivo.
    [HttpGet("{idDocente}/materias/{anioLectivo}")]
    public async Task<ActionResult> GetMateriasByDocente(int idDocente, int anioLectivo)
    {
        try
        {
            var materias = await _context.DocenteMaterias
                .Include(dm => dm.Materia)
                .Include(dm => dm.Clase)
                .Where(dm => dm.IdDocente == idDocente && dm.AnioLectivo == anioLectivo && dm.Estado)
                .Select(dm => new
                {
                    dm.IdDocenteMateria,
                    dm.IdMateria,
                    NombreMateria = dm.Materia != null ? dm.Materia.NombreMateria : "Sin materia",
                    TipoMateria = dm.Materia != null ? dm.Materia.TipoMateria : "",
                    dm.IdClase,
                    NombreClase = dm.Clase != null ? dm.Clase.NombreClase : "Sin clase",
                    Seccion = dm.Clase != null ? dm.Clase.Seccion : ""
                })
                .ToListAsync();

            return Ok(materias);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener materias", error = ex.Message });
        }
    }

    // GET: obtiene las clases asignadas a un docente en un año lectivo.
    [HttpGet("{idDocente}/clases/{anioLectivo}")]
    public async Task<ActionResult> GetClasesByDocente(int idDocente, int anioLectivo)
    {
        try
        {
            var clases = await _context.DocenteMaterias
                .Include(dm => dm.Clase)
                .Where(dm => dm.IdDocente == idDocente && dm.AnioLectivo == anioLectivo && dm.Estado)
                .Select(dm => new
                {
                    IdClase = dm.Clase != null ? dm.Clase.IdClase : 0,
                    NombreClase = dm.Clase != null ? dm.Clase.NombreClase : "Sin clase",
                    Seccion = dm.Clase != null ? dm.Clase.Seccion : ""
                })
                .Distinct()
                .ToListAsync();

            return Ok(clases);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener clases", error = ex.Message });
        }
    }
}

public class DocenteRequest
{
    public string CodigoDocente { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string? Dui { get; set; }
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
    public string? EspecialidadDocente { get; set; }
    public string? TipoDocente { get; set; }
    public DateTime? FechaIngreso { get; set; }
    public bool Estado { get; set; } = true;
}
