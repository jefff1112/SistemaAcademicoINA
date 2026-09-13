// Controlador API de módulos de especialidad.
// Permite (Dirección/Registro) gestionar los módulos por especialidad+año
// y generar la estructura de actividades-módulo de una clase.
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;

namespace SistemaAcademicoINA.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ModulosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ModulosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ============================================================
    // GET: api/modulos?especialidad={id}&grado={n}
    // Lista módulos (filtros opcionales por especialidad y grado)
    // ============================================================
    [HttpGet]
    public async Task<IActionResult> GetModulos([FromQuery] int? especialidad, [FromQuery] int? grado)
    {
        var query = _context.Modulos.Include(m => m.Especialidad).AsQueryable();
        if (especialidad.HasValue)
            query = query.Where(m => m.IdEspecialidad == especialidad.Value);
        if (grado.HasValue)
            query = query.Where(m => m.NumeroGrado == grado.Value);

        var modulos = await query
            .OrderBy(m => m.NumeroGrado)
            .ThenBy(m => m.NumeroModulo)
            .ToListAsync();

        return Ok(modulos.Select(m => new
        {
            m.IdModulo,
            m.IdEspecialidad,
            m.NumeroGrado,
            m.NumeroModulo,
            m.NombreModulo,
            m.Orden,
            m.Estado,
            Codigo = m.Codigo,
            Especialidad = m.Especialidad?.NombreEspecialidad ?? ""
        }));
    }

    // ============================================================
    // POST: api/modulos
    // ============================================================
    [HttpPost]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public async Task<IActionResult> CrearModulo([FromBody] ModuloRequest request)
    {
        if (request.IdEspecialidad <= 0)
            return BadRequest(new { mensaje = "La especialidad es requerida" });
        if (request.NumeroGrado <= 0 || request.NumeroModulo <= 0)
            return BadRequest(new { mensaje = "El grado y número de módulo son requeridos" });
        if (string.IsNullOrWhiteSpace(request.NombreModulo))
            return BadRequest(new { mensaje = "El nombre del módulo es requerido" });

        var duplicado = await _context.Modulos.AnyAsync(m =>
            m.IdEspecialidad == request.IdEspecialidad
            && m.NumeroGrado == request.NumeroGrado
            && m.NumeroModulo == request.NumeroModulo);
        if (duplicado)
            return BadRequest(new { mensaje = $"Ya existe el Módulo {request.NumeroGrado}.{request.NumeroModulo} para esta especialidad" });

        var modulo = new Modulo
        {
            IdEspecialidad = request.IdEspecialidad,
            NumeroGrado = request.NumeroGrado,
            NumeroModulo = request.NumeroModulo,
            NombreModulo = request.NombreModulo.Trim(),
            Orden = request.Orden > 0 ? request.Orden : request.NumeroModulo,
            Estado = true,
            CreatedAt = DateTime.Now
        };

        _context.Modulos.Add(modulo);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Módulo creado", id = modulo.IdModulo, codigo = modulo.Codigo });
    }

    // ============================================================
    // PUT: api/modulos/{id}
    // ============================================================
    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public async Task<IActionResult> EditarModulo(int id, [FromBody] ModuloRequest request)
    {
        var modulo = await _context.Modulos.FindAsync(id);
        if (modulo == null)
            return NotFound(new { mensaje = "Módulo no encontrado" });

        if (string.IsNullOrWhiteSpace(request.NombreModulo))
            return BadRequest(new { mensaje = "El nombre del módulo es requerido" });

        modulo.IdEspecialidad = request.IdEspecialidad;
        modulo.NumeroGrado = request.NumeroGrado;
        modulo.NumeroModulo = request.NumeroModulo;
        modulo.NombreModulo = request.NombreModulo.Trim();
        modulo.Orden = request.Orden > 0 ? request.Orden : request.NumeroModulo;
        modulo.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Módulo actualizado" });
    }

    // ============================================================
    // DELETE: api/modulos/{id}
    // ============================================================
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public async Task<IActionResult> EliminarModulo(int id)
    {
        var modulo = await _context.Modulos.FindAsync(id);
        if (modulo == null)
            return NotFound(new { mensaje = "Módulo no encontrado" });

        _context.Modulos.Remove(modulo);
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Módulo eliminado" });
    }

    // ============================================================
    // POST: api/modulos/generar-estructura
    // Genera las actividades-módulo (es_modulo) de una clase a
    // partir del catálogo de módulos de su especialidad+grado.
    // ============================================================
    [HttpPost("generar-estructura")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public async Task<IActionResult> GenerarEstructura([FromBody] GenerarEstructuraRequest request)
    {
        var clase = await _context.Clases.FirstOrDefaultAsync(c => c.IdClase == request.IdClase);
        if (clase == null)
            return NotFound(new { mensaje = "Clase no encontrada" });

        if (!clase.IdEspecialidad.HasValue)
            return BadRequest(new { mensaje = "La clase no tiene especialidad asignada" });

        var grado = await _context.Grados.FirstOrDefaultAsync(g => g.IdGrados == clase.IdGrado);
        int numeroGrado = grado?.NumeroGrado ?? 0;
        if (numeroGrado == 0)
            return BadRequest(new { mensaje = "No se pudo determinar el año/grado de la clase" });

        var modulos = await _context.Modulos
            .Where(m => m.IdEspecialidad == clase.IdEspecialidad.Value
                     && m.NumeroGrado == numeroGrado
                     && m.Estado)
            .OrderBy(m => m.NumeroModulo)
            .ToListAsync();

        if (!modulos.Any())
            return BadRequest(new { mensaje = $"No hay módulos definidos para la especialidad en el año {numeroGrado}. Defina los módulos primero." });

        var existe = await _context.Actividades.AnyAsync(a =>
            a.IdClase == clase.IdClase
            && a.IdEspecialidad == clase.IdEspecialidad.Value
            && a.EsModulo
            && a.Estado == "Activo");
        if (existe)
            return BadRequest(new { mensaje = "Ya existe estructura de módulos para esta clase" });

        decimal ponderacion = Math.Round(100m / modulos.Count, 2);

        // Asignaciones docente-módulo ya existentes para esta clase
        var asignaciones = await _context.DocenteModulos
            .Where(d => d.IdClase == clase.IdClase && d.Estado)
            .ToListAsync();

        var creados = new List<object>();
        foreach (var m in modulos)
        {
            var asignacion = asignaciones.FirstOrDefault(d => d.IdModulo == m.IdModulo);
            int idDocente = asignacion?.IdDocente ?? 0;

            var actividad = new Actividad
            {
                IdEspecialidad = clase.IdEspecialidad,
                IdModulo = m.IdModulo,
                IdMateria = null,
                IdClase = clase.IdClase,
                IdDocente = idDocente,
                NombreActividad = m.NombreModulo,
                TipoActividad = "Modulo",
                Ponderacion = ponderacion,
                FechaPublicacion = DateTime.Now,
                FechaLimite = DateTime.Now.AddDays(365),
                Estado = "Activo",
                EsModulo = true,
                NumeroOrden = m.NumeroModulo,
                CreatedAt = DateTime.Now
            };
            _context.Actividades.Add(actividad);
            creados.Add(new { m.NumeroModulo, m.NombreModulo, Codigo = m.Codigo });
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = $"Estructura de {modulos.Count} módulos creada para la clase",
            ponderacionPorModulo = ponderacion,
            modulos = creados
        });
    }
}

// ============================================================
// DTOs
// ============================================================
public class ModuloRequest
{
    public int IdEspecialidad { get; set; }
    public int NumeroGrado { get; set; }
    public int NumeroModulo { get; set; }
    public string NombreModulo { get; set; } = string.Empty;
    public int Orden { get; set; }
}

public class GenerarEstructuraRequest
{
    public int IdClase { get; set; }
}