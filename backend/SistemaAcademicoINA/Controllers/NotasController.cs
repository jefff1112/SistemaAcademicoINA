using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using SistemaAcademicoINA.Models.DTOs;

namespace SistemaAcademicoINA.Controllers;

// Controlador API (autenticado): gestiona las notas de los estudiantes por periodo y las consultas del docente.
[ApiController]
[Route("api/notas")]
[Authorize]
public class NotasController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NotasController> _logger;

    public NotasController(ApplicationDbContext context, ILogger<NotasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ============================================================
    // POST: api/notas/guardar
    // ============================================================
    [HttpPost("guardar")]
    public async Task<IActionResult> GuardarNota([FromBody] GuardarNotaDto request)
    {
        try
        {
            var estudiante = await _context.Estudiantes.FindAsync(request.IdEstudiante);
            if (estudiante == null)
                return NotFound(new { mensaje = "Estudiante no encontrado" });

            var materia = await _context.Materias.FindAsync(request.IdMateria);
            if (materia == null)
                return NotFound(new { mensaje = "Materia no encontrada" });

            var periodo = await _context.PeriodosAcademicos.FindAsync(request.IdPeriodo);
            if (periodo == null)
                return NotFound(new { mensaje = "Periodo no encontrado" });

            // Validación de propiedad: el docente solo califica sus materias asignadas
            if (!await DocenteAutorizadoParaMateria(request.IdMateria, request.IdClase, periodo.AnioLectivo))
                return StatusCode(403, new { mensaje = "No tiene autorización para calificar esta materia" });

            var clase = await _context.Clases.FindAsync(request.IdClase);
            if (clase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            var inscripcion = await _context.Inscripciones
                .FirstOrDefaultAsync(i => i.IdEstudiante == request.IdEstudiante
                                          && i.IdClase == request.IdClase
                                          && i.AnioLectivo == DateTime.Now.Year);
            if (inscripcion == null)
                return BadRequest(new { mensaje = "El estudiante no pertenece a esta clase" });

            var resultado = await _context.ResultadosPeriodos
                .FirstOrDefaultAsync(r => r.IdEstudiante == request.IdEstudiante
                                          && r.IdMateria == request.IdMateria
                                          && r.IdPeriodo == request.IdPeriodo
                                          && r.IdClase == request.IdClase);

            if (resultado == null)
            {
                resultado = new ResultadoPeriodo
                {
                    IdEstudiante = request.IdEstudiante,
                    IdMateria = request.IdMateria,
                    IdPeriodo = request.IdPeriodo,
                    IdClase = request.IdClase,
                    NotaAcumulada = request.Nota,
                    CreatedAt = DateTime.Now
                };
                _context.ResultadosPeriodos.Add(resultado);
            }
            else
            {
                resultado.NotaAcumulada = request.Nota;
                resultado.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            await RecalcularPromedioEstudiante(request.IdEstudiante, request.IdPeriodo);

            return Ok(new
            {
                mensaje = "Nota guardada correctamente",
                nota = request.Nota,
                idResultado = resultado.IdResultadoPeriodo
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar nota");
            return StatusCode(500, new { mensaje = "Error al guardar la nota", error = ex.Message });
        }
    }

    // ============================================================
    // POST: api/notas/guardar-multiple
    // ============================================================
    [HttpPost("guardar-multiple")]
    public async Task<IActionResult> GuardarNotasMultiples([FromBody] List<GuardarNotaDto> notas)
    {
        try
        {
            if (notas == null || !notas.Any())
                return BadRequest(new { mensaje = "No hay notas para guardar" });

            var resultados = new List<ResultadoPeriodo>();
            var auditorias = new List<AuditoriaNota>();
            var estudianteId = notas.First().IdEstudiante;
            var periodoId = notas.First().IdPeriodo;

            var idDocenteActual = 0;
            var codigoActual = User.FindFirst(ClaimTypes.Name)?.Value;
            if (!string.IsNullOrEmpty(codigoActual))
            {
                var docenteActual = await _context.Docentes
                    .FirstOrDefaultAsync(d => d.CodigoDocente == codigoActual || d.Correo == codigoActual);
                if (docenteActual != null)
                    idDocenteActual = docenteActual.IdDocente;
            }

            foreach (var request in notas)
            {
                var estudiante = await _context.Estudiantes.FindAsync(request.IdEstudiante);
                if (estudiante == null) continue;

                var materia = await _context.Materias.FindAsync(request.IdMateria);
                if (materia == null) continue;

                var periodo = await _context.PeriodosAcademicos.FindAsync(request.IdPeriodo);
                if (periodo == null) continue;

                // Validación de propiedad: el docente solo califica sus materias asignadas
                if (!await DocenteAutorizadoParaMateria(request.IdMateria, request.IdClase, periodo.AnioLectivo))
                    return StatusCode(403, new { mensaje = $"No tiene autorización para calificar la materia {request.IdMateria}" });

                var resultado = await _context.ResultadosPeriodos
                    .FirstOrDefaultAsync(r => r.IdEstudiante == request.IdEstudiante
                                              && r.IdMateria == request.IdMateria
                                              && r.IdPeriodo == request.IdPeriodo
                                              && r.IdClase == request.IdClase);

                decimal? anterior = null;
                if (resultado == null)
                {
                    resultado = new ResultadoPeriodo
                    {
                        IdEstudiante = request.IdEstudiante,
                        IdMateria = request.IdMateria,
                        IdPeriodo = request.IdPeriodo,
                        IdClase = request.IdClase,
                        NotaAcumulada = request.Nota,
                        CreatedAt = DateTime.Now
                    };
                    _context.ResultadosPeriodos.Add(resultado);
                }
                else
                {
                    anterior = resultado.NotaAcumulada;
                    resultado.NotaAcumulada = request.Nota;
                    resultado.UpdatedAt = DateTime.Now;
                }

                if (anterior.HasValue && anterior.Value != request.Nota)
                {
                    auditorias.Add(new AuditoriaNota
                    {
                        IdEstudiante = request.IdEstudiante,
                        IdMateria = request.IdMateria,
                        IdDocente = idDocenteActual,
                        NotaAnterior = anterior,
                        NotaNueva = request.Nota,
                        MotivoCambio = "Guardado masivo",
                        FechaCambio = DateTime.Now
                    });
                }

                resultados.Add(resultado);
            }

            await _context.SaveChangesAsync();

            if (auditorias.Any())
            {
                foreach (var aud in auditorias)
                {
                    aud.IdCalificacion = resultados.FirstOrDefault(r =>
                        r.IdEstudiante == aud.IdEstudiante && r.IdMateria == aud.IdMateria)?.IdResultadoPeriodo ?? 0;
                }
                _context.AuditoriaNotas.AddRange(auditorias);
                await _context.SaveChangesAsync();
            }

            if (estudianteId > 0 && periodoId > 0)
            {
                await RecalcularPromedioEstudiante(estudianteId, periodoId);
            }

            return Ok(new
            {
                mensaje = $"Notas guardadas correctamente ({resultados.Count})",
                total = resultados.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar notas múltiples");
            return StatusCode(500, new { mensaje = "Error al guardar las notas", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/notas/estudiante/{idEstudiante}/periodo/{idPeriodo}
    // ============================================================
    [HttpGet("estudiante/{idEstudiante}/periodo/{idPeriodo}")]
    public async Task<IActionResult> GetNotasEstudiantePeriodo(int idEstudiante, int idPeriodo)
    {
        try
        {
            var notas = await _context.ResultadosPeriodos
                .Include(r => r.Materia)
                .Where(r => r.IdEstudiante == idEstudiante && r.IdPeriodo == idPeriodo)
                .ToListAsync();

            var result = notas.Select(n => new
            {
                n.IdMateria,
                MateriaNombre = n.Materia?.NombreMateria,
                n.NotaAcumulada,
                n.IdResultadoPeriodo
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener notas del estudiante");
            return StatusCode(500, new { mensaje = "Error al obtener notas", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/notas/clase/{idClase}/periodo/{idPeriodo}
    // ============================================================
    [HttpGet("clase/{idClase}/periodo/{idPeriodo}")]
    public async Task<IActionResult> GetNotasClasePeriodo(int idClase, int idPeriodo)
    {
        try
        {
            var estudiantes = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Where(i => i.IdClase == idClase && i.AnioLectivo == DateTime.Now.Year)
                .Select(i => i.IdEstudiante)
                .ToListAsync();

            var notas = await _context.ResultadosPeriodos
                .Include(r => r.Materia)
                .Include(r => r.Estudiante)
                .Where(r => r.IdClase == idClase && r.IdPeriodo == idPeriodo)
                .ToListAsync();

            var materias = await _context.Materias.ToListAsync();

            var result = estudiantes.Select(e => new
            {
                IdEstudiante = e,
                Notas = materias.Select(m => new
                {
                    m.IdMateria,
                    m.NombreMateria,
                    Nota = notas.FirstOrDefault(n => n.IdEstudiante == e && n.IdMateria == m.IdMateria)?.NotaAcumulada ?? 0,
                    IdResultado = notas.FirstOrDefault(n => n.IdEstudiante == e && n.IdMateria == m.IdMateria)?.IdResultadoPeriodo ?? 0
                }).ToList(),
                Promedio = notas.Where(n => n.IdEstudiante == e).Average(n => (decimal?)n.NotaAcumulada) ?? 0
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener notas de la clase");
            return StatusCode(500, new { mensaje = "Error al obtener notas", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/notas/general?clase={idClase}&materia={idMateria}&anio={anio}
    // Consulta de notas por periodo (P1..P4) y global por clase/materia.
    // Reutiliza la lógica de la vista vista_notas_finales_periodos.
    // ============================================================
    [HttpGet("general")]
    public async Task<IActionResult> GetNotasGenerales(int? clase, int? materia, int? anio)
    {
        try
        {
            var anioLectivo = anio ?? DateTime.Now.Year;
            var idClase = clase ?? 0;
            var idMateria = materia ?? 0;

            var sql = @"
                SELECT
                    e.id_estudiante AS IdEstudiante,
                    e.codigo_estudiante AS CodigoEstudiante,
                    e.nombres AS Nombres,
                    e.apellidos AS Apellidos,
                    c.id_clase AS IdClase,
                    c.nombre_clase AS NombreClase,
                    m.id_materia AS IdMateria,
                    m.nombre_materia AS NombreMateria,
                    m.tipo_materia AS TipoMateria,
                    MAX(CASE WHEN p.numero_periodo = 1 THEN rp.nota_acumulada END) AS Periodo1,
                    MAX(CASE WHEN p.numero_periodo = 2 THEN rp.nota_acumulada END) AS Periodo2,
                    MAX(CASE WHEN p.numero_periodo = 3 THEN rp.nota_acumulada END) AS Periodo3,
                    MAX(CASE WHEN p.numero_periodo = 4 THEN rp.nota_acumulada END) AS Periodo4,
                    ROUND(AVG(rp.nota_acumulada), 2) AS NotaFinal,
                    CASE WHEN m.tipo_materia = 'Basica' THEN 6.00 ELSE 4.00 END AS NotaMinima,
                    CASE WHEN ROUND(AVG(rp.nota_acumulada), 2) >= CASE WHEN m.tipo_materia = 'Basica' THEN 6.00 ELSE 4.00 END
                        THEN 'APROBADO' ELSE 'REPROBADO' END AS EstadoFinal
                FROM resultados_periodos rp
                JOIN estudiantes e ON rp.id_estudiante = e.id_estudiante
                JOIN clases c ON rp.id_clase = c.id_clase
                JOIN materias m ON rp.id_materia = m.id_materia
                JOIN periodos_academicos p ON rp.id_periodo = p.id_periodo
                WHERE p.anio_lectivo = @anio
                  AND (@clase = 0 OR c.id_clase = @clase)
                  AND (@materia = 0 OR m.id_materia = @materia)
                GROUP BY e.id_estudiante, e.codigo_estudiante, e.nombres, e.apellidos,
                         c.id_clase, c.nombre_clase, m.id_materia, m.nombre_materia, m.tipo_materia
                ORDER BY e.apellidos, e.nombres, m.nombre_materia";

            var notas = await _context.Database
                .SqlQueryRaw<NotaGeneralDTO>(sql,
                    new MySqlConnector.MySqlParameter("@anio", anioLectivo),
                    new MySqlConnector.MySqlParameter("@clase", idClase),
                    new MySqlConnector.MySqlParameter("@materia", idMateria))
                .ToListAsync();

            return Ok(notas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener notas generales");
            return StatusCode(500, new { mensaje = "Error al obtener notas generales", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/notas/estudiante/{idEstudiante}/general
    // Notas por periodo (P1..P4) y global de un estudiante (todas sus materias).
    // ============================================================
    [HttpGet("estudiante/{idEstudiante}/general")]
    public async Task<IActionResult> GetNotasGeneralesEstudiante(int idEstudiante)
    {
        try
        {
            var anioLectivo = DateTime.Now.Year;

            var sql = @"
                SELECT
                    e.id_estudiante AS IdEstudiante,
                    e.codigo_estudiante AS CodigoEstudiante,
                    e.nombres AS Nombres,
                    e.apellidos AS Apellidos,
                    c.id_clase AS IdClase,
                    c.nombre_clase AS NombreClase,
                    m.id_materia AS IdMateria,
                    m.nombre_materia AS NombreMateria,
                    m.tipo_materia AS TipoMateria,
                    MAX(CASE WHEN p.numero_periodo = 1 THEN rp.nota_acumulada END) AS Periodo1,
                    MAX(CASE WHEN p.numero_periodo = 2 THEN rp.nota_acumulada END) AS Periodo2,
                    MAX(CASE WHEN p.numero_periodo = 3 THEN rp.nota_acumulada END) AS Periodo3,
                    MAX(CASE WHEN p.numero_periodo = 4 THEN rp.nota_acumulada END) AS Periodo4,
                    ROUND(AVG(rp.nota_acumulada), 2) AS NotaFinal,
                    CASE WHEN m.tipo_materia = 'Basica' THEN 6.00 ELSE 4.00 END AS NotaMinima,
                    CASE WHEN ROUND(AVG(rp.nota_acumulada), 2) >= CASE WHEN m.tipo_materia = 'Basica' THEN 6.00 ELSE 4.00 END
                        THEN 'APROBADO' ELSE 'REPROBADO' END AS EstadoFinal
                FROM resultados_periodos rp
                JOIN estudiantes e ON rp.id_estudiante = e.id_estudiante
                JOIN clases c ON rp.id_clase = c.id_clase
                JOIN materias m ON rp.id_materia = m.id_materia
                JOIN periodos_academicos p ON rp.id_periodo = p.id_periodo
                WHERE p.anio_lectivo = @anio
                  AND e.id_estudiante = @estudiante
                GROUP BY e.id_estudiante, e.codigo_estudiante, e.nombres, e.apellidos,
                         c.id_clase, c.nombre_clase, m.id_materia, m.nombre_materia, m.tipo_materia
                ORDER BY m.nombre_materia";

            var notas = await _context.Database
                .SqlQueryRaw<NotaGeneralDTO>(sql,
                    new MySqlConnector.MySqlParameter("@anio", anioLectivo),
                    new MySqlConnector.MySqlParameter("@estudiante", idEstudiante))
                .ToListAsync();

            return Ok(notas);
        }
catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener notas generales del estudiante {IdEstudiante}", idEstudiante);
                return StatusCode(500, new { mensaje = "Error al obtener notas del estudiante", error = ex.Message, stackTrace = ex.StackTrace });
            }
    }

    // ============================================================
    // GET: api/notas/mis-materias (NUEVO - Para docente)
    // ============================================================
    [HttpGet("mis-materias")]
    public async Task<IActionResult> GetMisMaterias()
    {
        try
        {
            var codigo = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(codigo))
                return Unauthorized(new { mensaje = "Usuario no autenticado" });

            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.CodigoDocente == codigo || d.Correo == codigo);

            if (docente == null)
                return NotFound(new { mensaje = "Docente no encontrado" });

            var anioActual = DateTime.Now.Year;

            var materias = await _context.DocenteMaterias
                .Include(dm => dm.Materia)
                .Include(dm => dm.Clase)
                .Where(dm => dm.IdDocente == docente.IdDocente
                    && dm.AnioLectivo == anioActual
                    && dm.Estado == true
                    && dm.PuedeCalificar == true)
                .Select(dm => new
                {
                    dm.IdDocenteMateria,
                    dm.IdMateria,
                    NombreMateria = dm.Materia != null ? dm.Materia.NombreMateria : "Sin materia",
                    TipoMateria = dm.Materia != null ? dm.Materia.TipoMateria : "",
                    dm.IdClase,
                    NombreClase = dm.Clase != null ? dm.Clase.NombreClase : "Sin clase",
                    Seccion = dm.Clase != null ? dm.Clase.Seccion : "",
                    IdGrado = dm.Clase != null ? dm.Clase.IdGrado : (int?)null
                })
                .ToListAsync();

            return Ok(materias);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener materias del docente");
            return StatusCode(500, new { mensaje = "Error al obtener materias", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/notas/mis-clases (NUEVO - Para docente)
    // ============================================================
    [HttpGet("mis-clases")]
    public async Task<IActionResult> GetMisClases()
    {
        try
        {
            var codigo = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(codigo))
                return Unauthorized(new { mensaje = "Usuario no autenticado" });

            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.CodigoDocente == codigo || d.Correo == codigo);

            if (docente == null)
                return NotFound(new { mensaje = "Docente no encontrado" });

            var anioActual = DateTime.Now.Year;

            var clases = await _context.DocenteMaterias
                .Include(dm => dm.Clase)
                .Where(dm => dm.IdDocente == docente.IdDocente
                    && dm.AnioLectivo == anioActual
                    && dm.Estado == true)
                .Select(dm => new
                {
                    IdClase = dm.Clase != null ? dm.Clase.IdClase : 0,
                    NombreClase = dm.Clase != null ? dm.Clase.NombreClase : "Sin clase",
                    Seccion = dm.Clase != null ? dm.Clase.Seccion : "",
                    IdGrado = dm.Clase != null ? dm.Clase.IdGrado : (int?)null,
                    IdEspecialidad = dm.Clase != null ? dm.Clase.IdEspecialidad : (int?)null
                })
                .Distinct()
                .ToListAsync();

            return Ok(clases);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener clases del docente");
            return StatusCode(500, new { mensaje = "Error al obtener clases", error = ex.Message });
        }
    }

    // ============================================================
    // AUXILIAR: VERIFICA QUE EL DOCENTE AUTENTICADO PUEDA CALIFICAR
    // LA MATERIA/CLASE. Los roles no-docente (admin, direccion, etc.)
    // tienen acceso irrestricto.
    // ============================================================
    private async Task<bool> DocenteAutorizadoParaMateria(int idMateria, int idClase, int anioLectivo)
    {
        try
        {
            var codigo = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(codigo))
                return false;

            // Roles de personal (staff) tienen acceso de supervisión irrestricto.
            var rol = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            var rolesStaff = new[] { "Administrador", "Director", "Sub Director", "Registro Academico", "Coordinador" };
            if (rolesStaff.Contains(rol))
                return true;

            // El resto de roles SOLO si son el docente titular con asignación activa.
            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.CodigoDocente == codigo || d.Correo == codigo);

            if (docente == null)
                return false;

            return await _context.DocenteMaterias.AnyAsync(dm =>
                dm.IdDocente == docente.IdDocente
                && dm.IdMateria == idMateria
                && dm.IdClase == idClase
                && dm.AnioLectivo == anioLectivo
                && dm.Estado == true
                && dm.PuedeCalificar == true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al validar autorización del docente");
            return false;
        }
    }

    // ============================================================
    // MÉTODO AUXILIAR
    // ============================================================
    private async Task RecalcularPromedioEstudiante(int idEstudiante, int idPeriodo)
    {
        try
        {
            var notas = await _context.ResultadosPeriodos
                .Where(r => r.IdEstudiante == idEstudiante && r.IdPeriodo == idPeriodo)
                .ToListAsync();

            if (notas.Any())
            {
                var promedio = notas.Average(n => n.NotaAcumulada);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al recalcular promedio");
        }
    }
}

// ============================================================
// DTOs
// ============================================================
public class GuardarNotaDto
{
    public int IdEstudiante { get; set; }
    public int IdMateria { get; set; }
    public int IdPeriodo { get; set; }
    public int IdClase { get; set; }
    public decimal Nota { get; set; }
}