using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona las clases (nivel, especialidad, sección, cupos) y sus catálogos asociados.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClasesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClasesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene las clases activas con nivel, especialidad y sección.
    [HttpGet]
    public async Task<IActionResult> GetClases()
    {
        try
        {
            var clases = await _context.Clases
                .Include(c => c.Nivel)
                .Include(c => c.Especialidad)
                .Include(c => c.SeccionObj)
                .Where(c => c.Estado)
                .OrderBy(c => c.IdNivel)
                .ThenBy(c => c.IdEspecialidad)
                .ThenBy(c => c.IdSeccion)
                .Select(c => new
                {
                    c.IdClase,
                    c.NombreClase,
                    c.Seccion,
                    c.IdNivel,
                    NivelNombre = c.Nivel != null ? c.Nivel.NombreNivel : "",
                    c.IdEspecialidad,
                    EspecialidadNombre = c.Especialidad != null ? c.Especialidad.NombreEspecialidad : "Bachillerato General",
                    c.IdSeccion,
                    SeccionNombre = c.SeccionObj != null ? c.SeccionObj.NombreSeccion : "",
                    c.CupoMaximo,
                    c.CupoActual,
                    c.AnioLectivo,
                    c.Estado
                })
                .ToListAsync();

            return Ok(clases);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener clases", error = ex.Message });
        }
    }

    // GET: obtiene una clase específica por su id.
    [HttpGet("{id}")]
    public async Task<IActionResult> GetClase(int id)
    {
        try
        {
            var clase = await _context.Clases
                .Include(c => c.Nivel)
                .Include(c => c.Especialidad)
                .Include(c => c.SeccionObj)
                .FirstOrDefaultAsync(c => c.IdClase == id);

            if (clase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            return Ok(clase);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener clase", error = ex.Message });
        }
    }

    // GET: obtiene los niveles académicos disponibles.
    [HttpGet("niveles")]
    public async Task<IActionResult> GetNiveles()
    {
        try
        {
            var niveles = await _context.NivelesAcademicos
                .Where(n => n.Estado)
                .Select(n => new
                {
                    idNivel = n.IdNiveles,
                    nombreNivel = n.NombreNivel
                })
                .OrderBy(n => n.idNivel)
                .ToListAsync();

            return Ok(niveles);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener niveles", error = ex.Message });
        }
    }

    // GET: obtiene las especialidades disponibles, incluyendo "Bachillerato General" (id 0)
    // como opción para las clases del nivel general que no tienen especialidad.
    [HttpGet("especialidades")]
    public async Task<IActionResult> GetEspecialidades()
    {
        try
        {
            var especialidades = await _context.Especialidades
                .Where(e => e.Estado)
                .Select(e => new
                {
                    idEspecialidad = e.IdEspecialidad,
                    nombreEspecialidad = e.NombreEspecialidad
                })
                .OrderBy(e => e.nombreEspecialidad)
                .ToListAsync();

            var resultado = new List<object>
            {
                new { idEspecialidad = 0, nombreEspecialidad = "Bachillerato General" }
            };
            resultado.AddRange(especialidades);

            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener especialidades", error = ex.Message });
        }
    }

    // GET: obtiene las secciones disponibles.
    [HttpGet("secciones")]
    public async Task<IActionResult> GetSecciones()
    {
        try
        {
            var secciones = await _context.Secciones
                .Where(s => s.Estado)
                .Select(s => new
                {
                    s.IdSeccion,
                    s.NombreSeccion
                })
                .OrderBy(s => s.NombreSeccion)
                .ToListAsync();

            return Ok(secciones);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener secciones", error = ex.Message });
        }
    }

    // POST: crea una nueva clase generando su nombre a partir de año (grado), especialidad y sección.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost]
    public async Task<IActionResult> CreateClase([FromBody] CreateClaseRequest request)
    {
        try
        {
            if (request.IdNivel <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar un año/nivel" });

            if (request.IdGrado <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar el año que cursa la clase" });

            if (request.IdSeccion <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar una sección" });

            var nivel = await _context.NivelesAcademicos.FindAsync(request.IdNivel);
            if (nivel == null)
                return BadRequest(new { mensaje = "El año/nivel seleccionado no existe" });

            var seccion = await _context.Secciones.FindAsync(request.IdSeccion);
            if (seccion == null)
                return BadRequest(new { mensaje = "La sección seleccionada no existe" });

            var grado = await _context.Grados
                .FirstOrDefaultAsync(g => g.IdGrados == request.IdGrado && g.Estado);
            if (grado == null)
                return BadRequest(new { mensaje = "El año que cursa seleccionado no existe" });
            if (grado.IdNivel != request.IdNivel)
                return BadRequest(new { mensaje = $"El año '{grado.NombreGrado}' no pertenece al nivel '{nivel.NombreNivel}'" });

            Especialidad especialidad = null;
            if (request.IdEspecialidad.HasValue && request.IdEspecialidad.Value > 0)
            {
                especialidad = await _context.Especialidades.FindAsync(request.IdEspecialidad.Value);
                if (especialidad == null)
                    return BadRequest(new { mensaje = "La especialidad seleccionada no existe" });
            }

            // Coherencia nivel <-> especialidad: el nivel General no admite especialidad;
            // los niveles técnicos (Vocacional/Productivo) requieren una especialidad válida.
            var errorCombinacion = ValidarCombinacionNivelEspecialidad(request.IdNivel, especialidad);
            if (errorCombinacion != null)
                return BadRequest(new { mensaje = errorCombinacion });

            var nombreClase = CrearNombreClase(grado.NombreGrado, especialidad, seccion.NombreSeccion);

            var clase = new Clase
            {
                IdNivel = request.IdNivel,
                IdGrado = request.IdGrado,
                IdEspecialidad = especialidad?.IdEspecialidad,
                IdSeccion = request.IdSeccion,
                Seccion = seccion.NombreSeccion,
                NombreClase = nombreClase,
                CupoMaximo = request.CupoMaximo > 0 ? request.CupoMaximo : 30,
                CupoActual = 0,
                AnioLectivo = request.AnioLectivo > 0 ? request.AnioLectivo : DateTime.Now.Year,
                Estado = true,
                CreatedAt = DateTime.Now
            };

            _context.Clases.Add(clase);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Clase creada correctamente", id = clase.IdClase });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear clase", error = ex.Message, innerError = ex.InnerException?.Message });
        }
    }

    // PUT: actualiza los datos de una clase existente.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClase(int id, [FromBody] CreateClaseRequest request)
    {
        try
        {
            var clase = await _context.Clases.FindAsync(id);
            if (clase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            if (request.IdNivel <= 0 || request.IdGrado <= 0 || request.IdSeccion <= 0)
                return BadRequest(new { mensaje = "Debe indicar nivel, año que cursa y sección" });

            var nivel = await _context.NivelesAcademicos.FindAsync(request.IdNivel);
            if (nivel == null)
                return BadRequest(new { mensaje = "El año/nivel seleccionado no existe" });

            var seccion = await _context.Secciones.FindAsync(request.IdSeccion);
            if (seccion == null)
                return BadRequest(new { mensaje = "La sección seleccionada no existe" });

            var grado = await _context.Grados
                .FirstOrDefaultAsync(g => g.IdGrados == request.IdGrado && g.Estado);
            if (grado == null)
                return BadRequest(new { mensaje = "El año que cursa seleccionado no existe" });
            if (grado.IdNivel != request.IdNivel)
                return BadRequest(new { mensaje = $"El año '{grado.NombreGrado}' no pertenece al nivel '{nivel.NombreNivel}'" });

            Especialidad especialidad = null;
            if (request.IdEspecialidad.HasValue && request.IdEspecialidad.Value > 0)
            {
                especialidad = await _context.Especialidades.FindAsync(request.IdEspecialidad.Value);
                if (especialidad == null)
                    return BadRequest(new { mensaje = "La especialidad seleccionada no existe" });
            }

            var errorCombinacion = ValidarCombinacionNivelEspecialidad(request.IdNivel, especialidad);
            if (errorCombinacion != null)
                return BadRequest(new { mensaje = errorCombinacion });

            clase.IdNivel = request.IdNivel;
            clase.IdGrado = request.IdGrado;
            clase.IdEspecialidad = especialidad?.IdEspecialidad;
            clase.IdSeccion = request.IdSeccion;
            clase.Seccion = seccion.NombreSeccion;
            clase.NombreClase = CrearNombreClase(grado.NombreGrado, especialidad, seccion.NombreSeccion);
            clase.CupoMaximo = request.CupoMaximo > 0 ? request.CupoMaximo : 30;
            clase.AnioLectivo = request.AnioLectivo > 0 ? request.AnioLectivo : DateTime.Now.Year;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Clase actualizada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar clase", error = ex.Message });
        }
    }

    // DELETE: desactiva una clase, validando que no tenga estudiantes inscritos.
        [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClase(int id)
    {
        try
        {
            var clase = await _context.Clases.FindAsync(id);
            if (clase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            if (clase.CupoActual > 0)
                return BadRequest(new { mensaje = $"No se puede eliminar la clase porque tiene {clase.CupoActual} estudiantes inscritos" });

            clase.Estado = false;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Clase desactivada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar clase", error = ex.Message });
        }
    }

    // ============================================================
    // AUXILIARES DE COHERENCIA
    // ============================================================

    // Valida la combinación nivel <-> especialidad:
    // · Nivel 1 (General): sin especialidad.
    // · Nivel 2 (Vocacional): especialidades técnicas vocacionales (1 y 2).
    // · Nivel 3 (Productivo): especialidades técnicas productivas (3).
    // Devuelve el mensaje de error o null si es válida.
    private static string? ValidarCombinacionNivelEspecialidad(int idNivel, Especialidad? especialidad)
    {
        if (idNivel == 1)
        {
            if (especialidad != null)
                return "El Bachillerato General no admite especialidad. Deje la especialidad sin seleccionar.";
            return null;
        }

        if (especialidad == null)
            return "Para un nivel técnico debe seleccionar una especialidad.";

        if (idNivel == 2 && especialidad.IdEspecialidad != 1 && especialidad.IdEspecialidad != 2)
            return $"La especialidad '{especialidad.NombreEspecialidad}' no pertenece al Bachillerato Técnico Vocacional.";

        if (idNivel == 3 && especialidad.IdEspecialidad != 3)
            return $"La especialidad '{especialidad.NombreEspecialidad}' no pertenece al Bachillerato Técnico Productivo.";

        return null;
    }

    // Genera el nombre estandarizado de una clase: "Primer Año - Especialidad - Seccion A".
    private static string CrearNombreClase(string nombreGrado, Especialidad? especialidad, string nombreSeccion)
    {
        var nombreEspecialidad = especialidad != null
            ? especialidad.NombreEspecialidad
            : "Bachillerato General";
        return $"{nombreGrado} - {nombreEspecialidad} - Seccion {nombreSeccion}";
    }
}

public class CreateClaseRequest
{
    public int IdNivel { get; set; }
    public int IdGrado { get; set; }
    public int? IdEspecialidad { get; set; }
    public int IdSeccion { get; set; }
    public int CupoMaximo { get; set; }
    public int AnioLectivo { get; set; }
}
