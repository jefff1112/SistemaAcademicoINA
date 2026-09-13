using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.DTOs;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BoletaController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BoletaController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("estudiante/{idEstudiante}/periodo/{idPeriodo}/clase/{idClase}")]
    public async Task<IActionResult> GetDatosBoleta(int idEstudiante, int idPeriodo, int idClase)
    {
        try
        {
            var boleta = await ConstruirBoleta(idEstudiante, idClase, idPeriodo);
            if (boleta == null)
                return NotFound(new { mensaje = "Estudiante no encontrado" });

            return Ok(boleta);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                mensaje = "Error al obtener datos de la boleta",
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("estudiante/{idEstudiante}/global/clase/{idClase}")]
    public async Task<IActionResult> GetDatosBoletaGlobal(int idEstudiante, int idClase)
    {
        try
        {
            var boleta = await ConstruirBoleta(idEstudiante, idClase, null);
            if (boleta == null)
                return NotFound(new { mensaje = "Estudiante no encontrado" });

            return Ok(boleta);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                mensaje = "Error al obtener datos de la boleta",
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    private async Task<BoletaDTO?> ConstruirBoleta(int idEstudiante, int idClase, int? idPeriodo)
    {
        var estudiante = await _context.Estudiantes
            .FirstOrDefaultAsync(e => e.IdEstudiante == idEstudiante);

        if (estudiante == null)
            return null;

        var clase = await _context.Clases
            .FirstOrDefaultAsync(c => c.IdClase == idClase);

        string nombreGrado = "Primer Año";
        if (clase != null && clase.IdGrado > 0)
        {
            var grado = await _context.Grados
                .FirstOrDefaultAsync(g => g.IdGrados == clase.IdGrado);
            if (grado != null)
                nombreGrado = grado.NombreGrado;
        }

        PeriodoAcademico? periodo = null;
        if (idPeriodo != null)
        {
            periodo = await _context.PeriodosAcademicos
                .FirstOrDefaultAsync(p => p.IdPeriodo == idPeriodo);

            if (periodo == null)
                return null;
        }

        var anioLectivo = periodo?.AnioLectivo ?? DateTime.Now.Year;
        var esGlobal = idPeriodo == null;

        var idEspecialidadClase = clase?.IdEspecialidad;
        var materias = await _context.Materias
            .Where(m => m.Estado == true
                && (m.TipoMateria == "Basica"
                    || (m.TipoMateria == "Especialidad" && idEspecialidadClase != null && m.IdEspecialidad == idEspecialidadClase)))
            .OrderBy(m => m.TipoMateria)
            .ThenBy(m => m.NombreMateria)
            .ToListAsync();

        // FIX CRÍTICO: filtrar IdMateria != null y por AnioLectivo
        var notasClase = await _context.ResultadosPeriodos
            .Include(r => r.Periodo)
            .Where(r => r.IdEstudiante == idEstudiante
                        && r.IdClase == idClase
                        && r.IdMateria != null
                        && r.AnioLectivo == anioLectivo)
            .ToListAsync();

        Dictionary<int, ResultadoFinal> notasFinales = new();
        try
        {
            notasFinales = await _context.ResultadosFinales
                .Where(r => r.IdEstudiante == idEstudiante
                            && r.IdClase == idClase
                            && r.AnioLectivo == anioLectivo)
                .GroupBy(r => r.IdMateria)
                .ToDictionaryAsync(g => g.Key, g => g.First());
        }
        catch { }

        var asistenciasEstudiante = await _context.Asistencias
            .Where(a => a.IdEstudiante == idEstudiante
                        && a.IdClase == idClase
                        && a.Fecha.Year == anioLectivo)
            .ToListAsync();

        var presentes = asistenciasEstudiante.Count(a => a.Estado == "Presente");
        var tardanzas = asistenciasEstudiante.Count(a => a.Estado == "Tarde");
        var justificadas = asistenciasEstudiante.Count(a => a.Estado == "Justificado");
        var ausencias = asistenciasEstudiante.Count(a => a.Estado == "Ausente");
        var totalRegistros = presentes + tardanzas + justificadas + ausencias;

        var asistencia = new AsistenciasResumen
        {
            TotalDias = asistenciasEstudiante.Select(a => a.Fecha.Date).Distinct().Count(),
            Presentes = presentes,
            Ausencias = ausencias,
            Tardanzas = tardanzas,
            Justificadas = justificadas,
            PorcentajeAsistencia = totalRegistros > 0
                ? Math.Round((decimal)(presentes + tardanzas) * 100 / totalRegistros, 2)
                : 0
        };

        ConductaPeriodo? conducta = null;
        try
        {
            conducta = await _context.ConductaPeriodos
                .Where(c => c.IdEstudiante == idEstudiante)
                .OrderByDescending(c => c.IdPeriodo)
                .FirstOrDefaultAsync();
        }
        catch { }

        var notas = new List<NotaBoletaDTO>();
        int aprobadas = 0;
        int reprobadas = 0;

        foreach (var materia in materias)
        {
            // FIX: comparación explícita por IdMateria null-safe
            var notasMateria = notasClase
                .Where(n => n.IdMateria.HasValue && n.IdMateria.Value == materia.IdMateria)
                .ToList();

            decimal p1 = 0, p2 = 0, p3 = 0, p4 = 0;
            if (esGlobal)
            {
                p1 = notasMateria.FirstOrDefault(n => n.Periodo?.NumeroPeriodo == 1)?.NotaAcumulada ?? 0;
                p2 = notasMateria.FirstOrDefault(n => n.Periodo?.NumeroPeriodo == 2)?.NotaAcumulada ?? 0;
                p3 = notasMateria.FirstOrDefault(n => n.Periodo?.NumeroPeriodo == 3)?.NotaAcumulada ?? 0;
                p4 = notasMateria.FirstOrDefault(n => n.Periodo?.NumeroPeriodo == 4)?.NotaAcumulada ?? 0;
            }
            else
            {
                var notaPeriodo = notasMateria
                    .FirstOrDefault(n => n.Periodo?.NumeroPeriodo == periodo!.NumeroPeriodo)?.NotaAcumulada ?? 0;

                switch (periodo!.NumeroPeriodo)
                {
                    case 1: p1 = notaPeriodo; break;
                    case 2: p2 = notaPeriodo; break;
                    case 3: p3 = notaPeriodo; break;
                    case 4: p4 = notaPeriodo; break;
                }
            }

            var promedio = notasMateria.Count > 0
                ? notasMateria.Average(n => n.NotaAcumulada)
                : 0;

            decimal notaFinal;
            string estado;

            if (notasFinales.ContainsKey(materia.IdMateria))
            {
                notaFinal = notasFinales[materia.IdMateria].NotaFinal;
                estado = notasFinales[materia.IdMateria].EstadoMateria;
            }
            else
            {
                var notaMinima = materia.TipoMateria == "Basica" ? 6.00m : 4.00m;
                notaFinal = Math.Round(promedio, 2);
                estado = promedio > 0
                    ? (notaFinal >= notaMinima ? "Aprobado" : "Reprobado")
                    : "Pendiente";
            }

            if (estado == "Aprobado")
                aprobadas++;
            else if (estado == "Reprobado")
                reprobadas++;

            notas.Add(new NotaBoletaDTO
            {
                IdMateria = materia.IdMateria,
                NombreMateria = materia.NombreMateria ?? "Sin materia",
                TipoMateria = materia.TipoMateria ?? "Basica",
                P1 = p1,
                P2 = p2,
                P3 = p3,
                P4 = p4,
                Promedio = Math.Round(promedio, 2),
                NotaFinal = notaFinal,
                Estado = estado,
                Inasistencias = asistencia?.Ausencias ?? 0
            });
        }

        return new BoletaDTO
        {
            IdEstudiante = estudiante.IdEstudiante,
            CodigoEstudiante = estudiante.CodigoEstudiante ?? "N/A",
            Nombres = estudiante.Nombres ?? "Sin nombre",
            Apellidos = estudiante.Apellidos ?? "Sin apellido",
            Nie = estudiante.Nie ?? "N/A",
            Seccion = clase?.Seccion ?? "A",
            Grado = nombreGrado,
            Especialidad = "Bachillerato General",

            PeriodoId = periodo?.IdPeriodo ?? 0,
            PeriodoNombre = esGlobal ? "CICLO COMPLETO" : (periodo?.Nombre ?? "Periodo"),
            PeriodoNumero = esGlobal ? 0 : (periodo?.NumeroPeriodo ?? 0),
            AnioLectivo = anioLectivo,

            Notas = notas,
            Asistencias = new AsistenciasBoletaDTO
            {
                TotalDias = asistencia?.TotalDias ?? 0,
                Presentes = asistencia?.Presentes ?? 0,
                Ausencias = asistencia?.Ausencias ?? 0,
                Tardanzas = asistencia?.Tardanzas ?? 0,
                Justificadas = asistencia?.Justificadas ?? 0,
                Porcentaje = asistencia?.PorcentajeAsistencia ?? 0
            },
            Conducta = conducta?.CalificacionConducta ?? "Excelente",

            MateriasAprobadas = aprobadas,
            MateriasReprobadas = reprobadas,
            ModulosAprobados = 0,
            ModulosReprobados = 0,
            DocenteOrientador = "DOCENTE ORIENTADOR/A"
        };
    }
}