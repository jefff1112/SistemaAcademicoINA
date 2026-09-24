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
            .Include(c => c.Especialidad)
            .FirstOrDefaultAsync(c => c.IdClase == idClase);

        string nombreGrado = "Primer Año";
        int numeroGrado = 1;
        if (clase != null && clase.IdGrado > 0)
        {
            var grado = await _context.Grados
                .FirstOrDefaultAsync(g => g.IdGrados == clase.IdGrado);
            if (grado != null)
            {
                nombreGrado = grado.NombreGrado;
                numeroGrado = grado.NumeroGrado;
            }
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

        // Los 4 periodos del año lectivo (para alinear P1..P4).
        var periodosAnio = await _context.PeriodosAcademicos
            .Where(p => p.AnioLectivo == anioLectivo)
            .OrderBy(p => p.NumeroPeriodo)
            .ToListAsync();

        var idEspecialidadClase = clase?.IdEspecialidad;

        // Asignaturas: materias básicas + materias de la especialidad de la clase.
        var materias = await _context.Materias
            .Where(m => m.Estado == true
                && (m.TipoMateria == "Basica"
                    || (m.TipoMateria == "Especialidad" && idEspecialidadClase != null && m.IdEspecialidad == idEspecialidadClase)))
            .OrderBy(m => m.TipoMateria)
            .ThenBy(m => m.NombreMateria)
            .ToListAsync();

        // Todas las filas de resultados del estudiante en la clase/año (materias y especialidad).
        var notasClase = await _context.ResultadosPeriodos
            .Include(r => r.Periodo)
            .Where(r => r.IdEstudiante == idEstudiante
                        && r.IdClase == idClase
                        && r.AnioLectivo == anioLectivo)
            .ToListAsync();

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
            var filasMateria = notasClase
                .Where(n => n.IdMateria.HasValue && n.IdMateria.Value == materia.IdMateria)
                .ToList();

            var fila = ConstruirFilaNota(filasMateria, materia.NombreMateria ?? "Sin materia",
                materia.TipoMateria ?? "Basica", materia.IdMateria, periodosAnio,
                esGlobal, periodo, asistencia.Ausencias, esModulo: false, codigoModulo: null);

            notas.Add(fila);
            if (fila.Estado == "Aprobado")
                aprobadas++;
            else if (fila.Estado == "Reprobado")
                reprobadas++;
        }

        int modulosAprobados = 0;
        int modulosReprobados = 0;

        // Módulos integrales de la especialidad + grado de la clase.
        if (clase != null && clase.IdEspecialidad.HasValue)
        {
            var modulos = await _context.Modulos
                .Where(m => m.Estado == true
                            && m.IdEspecialidad == clase.IdEspecialidad.Value
                            && m.NumeroGrado == numeroGrado)
                .OrderBy(m => m.NumeroModulo)
                .ToListAsync();

            for (int i = 0; i < modulos.Count; i++)
            {
                var modulo = modulos[i];
                var filasModulo = notasClase
                    .Where(n => n.IdMateria == null && n.IdEspecialidad == clase.IdEspecialidad.Value)
                    .ToList();

                var fila = ConstruirFilaNota(filasModulo, modulo.NombreModulo ?? $"Módulo {modulo.NumeroModulo}",
                    "Especialidad", null, periodosAnio, esGlobal, periodo, asistencia.Ausencias,
                    esModulo: true, codigoModulo: $"MOD.{i + 1}");

                notas.Add(fila);
                if (fila.Estado == "Aprobado")
                    modulosAprobados++;
                else if (fila.Estado == "Reprobado")
                    modulosReprobados++;
            }
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
            Especialidad = clase?.Especialidad?.NombreEspecialidad ?? "Bachillerato General",

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
            ModulosAprobados = modulosAprobados,
            ModulosReprobados = modulosReprobados,
            DocenteOrientador = "DOCENTE ORIENTADOR/A"
        };
    }

    // Construye una fila de nota aplicando la regla INA:
    //  ORDINARIO = (P1+P2+P3+P4)/4 (periodos sin nota = 0).
    //  Por cada periodo, si existe recuperación > 0, la nota efectiva es min(recuperación, 6.0).
    //  NOTA FINAL = (E1+E2+E3+E4)/4.
    private static NotaBoletaDTO ConstruirFilaNota(
        List<ResultadoPeriodo> filas,
        string nombre,
        string tipoMateria,
        int? idMateria,
        List<PeriodoAcademico> periodosAnio,
        bool esGlobal,
        PeriodoAcademico? periodo,
        int inasistencias,
        bool esModulo,
        string? codigoModulo)
    {
        decimal p1 = 0, p2 = 0, p3 = 0, p4 = 0;
        decimal e1 = 0, e2 = 0, e3 = 0, e4 = 0;
        decimal? recuperacion = null;

        var porPeriodo = filas
            .Where(f => f.Periodo != null)
            .ToDictionary(f => f.Periodo!.NumeroPeriodo);

        foreach (var per in periodosAnio)
        {
            var f = porPeriodo.GetValueOrDefault(per.NumeroPeriodo);
            decimal acum = f?.NotaAcumulada ?? 0;
            decimal? recup = f?.NotaRecuperacion;

            // Nota efectiva del periodo: recuperación (tope 6.0) si existe, si no la acumulada.
            decimal efectiva = acum;
            if (recup.HasValue && recup.Value > 0)
                efectiva = Math.Min(recup.Value, 6.0m);

            switch (per.NumeroPeriodo)
            {
                case 1: p1 = acum; e1 = efectiva; break;
                case 2: p2 = acum; e2 = efectiva; break;
                case 3: p3 = acum; e3 = efectiva; break;
                case 4: p4 = acum; e4 = efectiva; break;
            }

            // Recuperación a mostrar: la del periodo seleccionado (o la primera encontrada).
            if (recuperacion == null && recup.HasValue && recup.Value > 0)
                recuperacion = recup.Value;
        }

        decimal ordinario = Math.Round((p1 + p2 + p3 + p4) / 4m, 1);
        decimal notaFinal = Math.Round((e1 + e2 + e3 + e4) / 4m, 1);

        bool tieneNotas = p1 > 0 || p2 > 0 || p3 > 0 || p4 > 0;
        string estado;
        if (!tieneNotas)
            estado = "Pendiente";
        else
            estado = notaFinal >= 6m ? "Aprobado" : "Reprobado";

        return new NotaBoletaDTO
        {
            IdMateria = idMateria ?? 0,
            NombreMateria = nombre,
            TipoMateria = tipoMateria,
            P1 = p1,
            P2 = p2,
            P3 = p3,
            P4 = p4,
            Promedio = ordinario,
            Recuperacion = recuperacion,
            NotaFinal = notaFinal,
            Estado = estado,
            Inasistencias = inasistencias,
            EsModulo = esModulo,
            CodigoModulo = codigoModulo
        };
    }
}