using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: genera reportes académicos (notas por estudiante, rendimiento de clase y asistencias).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/reportes/notas-estudiante/{idEstudiante}/{anioLectivo}
    [HttpGet("notas-estudiante/{idEstudiante}/{anioLectivo}")]
    public async Task<IActionResult> GetReporteNotasEstudiante(int idEstudiante, int anioLectivo)
    {
        var estudiante = await _context.Estudiantes
            .FirstOrDefaultAsync(e => e.IdEstudiante == idEstudiante);

        if (estudiante == null)
            return NotFound("Estudiante no encontrado");

        var notas = await _context.ResultadosFinales
            .Include(rf => rf.Materia)
            .Where(rf => rf.IdEstudiante == idEstudiante && rf.AnioLectivo == anioLectivo)
            .Select(rf => new
            {
                NombreMateria = rf.Materia != null ? rf.Materia.NombreMateria : "Sin materia",
                rf.NotaFinal,
                rf.EstadoMateria
            })
            .ToListAsync();

        var promedio = notas.Any() ? notas.Average(n => n.NotaFinal) : 0;

        var resultado = new
        {
            Estudiante = $"{estudiante.Nombres} {estudiante.Apellidos}",
            Codigo = estudiante.CodigoEstudiante ?? "",
            AnioLectivo = anioLectivo,
            Notas = notas,
            PromedioGeneral = promedio,
            MateriasAprobadas = notas.Count(n => n.EstadoMateria == "Aprobado"),
            MateriasReprobadas = notas.Count(n => n.EstadoMateria == "Reprobado")
        };

        return Ok(resultado);
    }

    // GET: api/reportes/rendimiento-clase/{idClase}/{anioLectivo}
    [HttpGet("rendimiento-clase/{idClase}/{anioLectivo}")]
    public async Task<IActionResult> GetRendimientoClase(int idClase, int anioLectivo)
    {
        var clase = await _context.Clases.FindAsync(idClase);
        if (clase == null)
            return NotFound("Clase no encontrada");

        var estudiantes = await _context.Inscripciones
            .Where(i => i.IdClase == idClase && i.AnioLectivo == anioLectivo && i.EstadoAprobacion == "Aprobada")
            .Select(i => i.IdEstudiante)
            .ToListAsync();

        var notas = await _context.ResultadosFinales
            .Where(rf => estudiantes.Contains(rf.IdEstudiante) && rf.AnioLectivo == anioLectivo)
            .ToListAsync();

        var notasPorEstudiante = notas.GroupBy(n => n.IdEstudiante)
            .Select(g => new
            {
                IdEstudiante = g.Key,
                Promedio = g.Average(n => n.NotaFinal),
                Aprobadas = g.Count(n => n.EstadoMateria == "Aprobado"),
                Reprobadas = g.Count(n => n.EstadoMateria == "Reprobado")
            })
            .ToList();

        var promedioClase = notasPorEstudiante.Any() ? notasPorEstudiante.Average(n => n.Promedio) : 0;

        var resultado = new
        {
            Clase = clase.NombreClase ?? "Sin nombre",
            AnioLectivo = anioLectivo,
            TotalEstudiantes = estudiantes.Count,
            PromedioClase = promedioClase,
            Aprobados = notasPorEstudiante.Count(n => n.Reprobadas == 0),
            Reprobados = notasPorEstudiante.Count(n => n.Reprobadas > 0),
            DetalleEstudiantes = notasPorEstudiante
        };

        return Ok(resultado);
    }

    // GET: api/reportes/asistencias-estudiante/{idEstudiante}/{anioLectivo}
    [HttpGet("asistencias-estudiante/{idEstudiante}/{anioLectivo}")]
    public async Task<IActionResult> GetReporteAsistenciasEstudiante(int idEstudiante, int anioLectivo)
    {
        var estudiante = await _context.Estudiantes
            .FirstOrDefaultAsync(e => e.IdEstudiante == idEstudiante);

        if (estudiante == null)
            return NotFound("Estudiante no encontrado");

        var asistencias = await _context.Asistencias
            .Where(a => a.IdEstudiante == idEstudiante && a.Fecha.Year == anioLectivo)
            .ToListAsync();

        var totalDias = asistencias.Count;
        var presentes = asistencias.Count(a => a.Estado == "Presente");
        var ausencias = asistencias.Count(a => a.Estado == "Ausente");
        var tardanzas = asistencias.Count(a => a.Estado == "Tarde");
        var justificadas = asistencias.Count(a => a.Estado == "Justificado");
        var porcentaje = totalDias > 0 ? (double)(presentes + tardanzas) / totalDias * 100 : 0;

        var resultado = new
        {
            Estudiante = $"{estudiante.Nombres} {estudiante.Apellidos}",
            Codigo = estudiante.CodigoEstudiante ?? "",
            AnioLectivo = anioLectivo,
            TotalDias = totalDias,
            Presentes = presentes,
            Ausencias = ausencias,
            Tardanzas = tardanzas,
            Justificadas = justificadas,
            PorcentajeAsistencia = Math.Round(porcentaje, 2)
        };

        return Ok(resultado);
    }
}
