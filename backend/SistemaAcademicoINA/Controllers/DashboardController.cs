using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: provee los indicadores y gráficas del dashboard (totales, aspirantes y cupos).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene el resumen general de indicadores del sistema (estudiantes, docentes, clases, aspirantes, promedios).
    [HttpGet("resumen")]
    public async Task<IActionResult> GetResumen()
    {
        var anioActual = DateTime.Now.Year;

        var totalEstudiantes = await _context.Estudiantes.CountAsync(e => e.Estado);
        var totalDocentes = await _context.Docentes.CountAsync(d => d.Estado);
        var totalClases = await _context.Clases.CountAsync(c => c.Estado);

        var aspirantesPendientes = await _context.Aspirantes.CountAsync(a => a.EstadoSolicitud == "Pendiente");
        var aspirantesAprobados = await _context.Aspirantes.CountAsync(a => a.EstadoSolicitud == "Aprobado");

        var promedioGeneral = await _context.ResultadosFinales
            .Where(rf => rf.AnioLectivo == anioActual)
            .AverageAsync(rf => (double?)rf.NotaFinal) ?? 0;

        var aprobados = await _context.ResultadosFinales
            .CountAsync(rf => rf.AnioLectivo == anioActual && rf.EstadoMateria == "Aprobado");

        var reprobados = await _context.ResultadosFinales
            .CountAsync(rf => rf.AnioLectivo == anioActual && rf.EstadoMateria == "Reprobado");

        return Ok(new
        {
            TotalEstudiantes = totalEstudiantes,
            TotalDocentes = totalDocentes,
            TotalClases = totalClases,
            AspirantesPendientes = aspirantesPendientes,
            AspirantesAprobados = aspirantesAprobados,
            PromedioGeneral = Math.Round(promedioGeneral, 2),
            Aprobados = aprobados,
            Reprobados = reprobados
        });
    }

    // GET: obtiene la cantidad de aspirantes agrupados por especialidad a la que aspiran.
    [HttpGet("aspirantes-por-especialidad")]
    public async Task<IActionResult> GetAspirantesPorEspecialidad()
    {
        try
        {
            var resultado = await _context.Aspirantes
                .Where(a => a.EspecialidadAspira != null && a.EspecialidadAspira.HasValue)
                .GroupBy(a => a.EspecialidadAspira.Value)
                .Select(g => new
                {
                    especialidad = g.Key,
                    cantidad = g.Count()
                })
                .ToListAsync();

            var especialidadesBD = await _context.Especialidades
                .ToDictionaryAsync(e => e.IdEspecialidad, e => e.NombreEspecialidad);

            var result = resultado.Select(r => new
            {
                nombre = especialidadesBD.TryGetValue(r.especialidad, out var nombre) ? nombre : "Otra",
                cantidad = r.cantidad
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al obtener aspirantes por especialidad: {ex.Message}");
            return StatusCode(500, new { mensaje = "Error al obtener datos" });
        }
    }

    // GET: obtiene la cantidad de solicitudes de aspirantes agrupadas por mes.
    [HttpGet("aspirantes-por-mes")]
    public async Task<IActionResult> GetAspirantesPorMes()
    {
        try
        {
            var resultado = await _context.Aspirantes
                .GroupBy(a => new { a.FechaSolicitud.Year, a.FechaSolicitud.Month })
                .Select(g => new
                {
                    año = g.Key.Year,
                    mes = g.Key.Month,
                    cantidad = g.Count()
                })
                .OrderBy(r => r.año)
                .ThenBy(r => r.mes)
                .ToListAsync();

            var meses = new[] { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };

            var result = resultado.Select(r => new
            {
                nombre = $"{meses[r.mes - 1]} {r.año}",
                cantidad = r.cantidad
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al obtener aspirantes por mes: {ex.Message}");
            return StatusCode(500, new { mensaje = "Error al obtener datos" });
        }
    }

    // GET: obtiene los cupos disponibles y ocupados por especialidad.
    [HttpGet("cupos-por-especialidad")]
    public async Task<IActionResult> GetCuposPorEspecialidad()
    {
        try
        {
            var resultado = await _context.CuposEspecialidades
                .Include(c => c.Especialidad)
                .GroupBy(c => c.IdEspecialidad)
                .Select(g => new
                {
                    especialidadId = g.Key,
                    nombreEspecialidad = g.First().Especialidad != null ? g.First().Especialidad.NombreEspecialidad : "Sin nombre",
                    cuposTotales = g.Sum(c => c.CuposTotales),
                    cuposOcupados = g.Sum(c => c.CuposOcupados)
                })
                .ToListAsync();

            var result = resultado.Select(r => new
            {
                nombre = r.nombreEspecialidad ?? "Sin nombre",
                disponibles = r.cuposTotales - r.cuposOcupados,
                ocupados = r.cuposOcupados,
                totales = r.cuposTotales
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al obtener cupos por especialidad: {ex.Message}");
            return StatusCode(500, new { mensaje = "Error al obtener datos" });
        }
    }
}
