using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;

namespace SistemaAcademicoINA.Controllers
{
    // Controlador API (autenticado): gestiona los resultados (notas) por periodo de los estudiantes.
    [ApiController]
    [Route("api/resultados-periodos")]
    [Authorize]
    public class ResultadosPeriodosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ResultadosPeriodosController> _logger;

        public ResultadosPeriodosController(ApplicationDbContext context, ILogger<ResultadosPeriodosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: obtiene la nota de un estudiante en una materia del periodo activo.
        [HttpGet("estudiante/{idEstudiante}/materia/{idMateria}")]
        public async Task<IActionResult> GetNotaEstudianteMateria(int idEstudiante, int idMateria, [FromQuery] int? idClase = null)
        {
            var periodoActual = await _context.PeriodosAcademicos
                .FirstOrDefaultAsync(p => p.AnioLectivo == DateTime.Now.Year && p.Estado == "Activo");

            if (periodoActual == null)
                return Ok(new { mensaje = "No hay periodo activo", nota = 0 });

            var nota = await _context.ResultadosPeriodos
                .FirstOrDefaultAsync(r => r.IdEstudiante == idEstudiante
                    && r.IdMateria == idMateria
                    && r.IdPeriodo == periodoActual.IdPeriodo
                    && (idClase == null || r.IdClase == idClase));

            if (nota == null)
            {
                return Ok(new
                {
                    mensaje = "No hay nota registrada",
                    idEstudiante = idEstudiante,
                    idMateria = idMateria,
                    nota = 0
                });
            }

            return Ok(new
            {
                nota.IdResultadoPeriodo,
                nota.IdEstudiante,
                nota.IdMateria,
                nota.IdPeriodo,
                nota.IdClase,
                nota.NotaAcumulada,
                nota.CreatedAt,
                nota.UpdatedAt
            });
        }

        // GET: obtiene la nota de un estudiante en una materia de un periodo específico.
        [HttpGet("estudiante/{idEstudiante}/materia/{idMateria}/periodo/{idPeriodo}")]
        public async Task<IActionResult> GetNotaEstudianteMateriaPeriodo(int idEstudiante, int idMateria, int idPeriodo, [FromQuery] int? idClase = null)
        {
            var nota = await _context.ResultadosPeriodos
                .FirstOrDefaultAsync(r => r.IdEstudiante == idEstudiante
                    && r.IdMateria == idMateria
                    && r.IdPeriodo == idPeriodo
                    && (idClase == null || r.IdClase == idClase));

            if (nota == null)
            {
                return Ok(new
                {
                    mensaje = "No hay nota registrada",
                    idEstudiante = idEstudiante,
                    idMateria = idMateria,
                    idPeriodo = idPeriodo,
                    nota = 0
                });
            }

            return Ok(new
            {
                nota.IdResultadoPeriodo,
                nota.IdEstudiante,
                nota.IdMateria,
                nota.IdPeriodo,
                nota.IdClase,
                nota.NotaAcumulada,
                nota.CreatedAt,
                nota.UpdatedAt
            });
        }

        // GET: obtiene las notas de un estudiante en un periodo, con el nombre de la materia.
        [HttpGet("estudiante/{idEstudiante}/periodo/{idPeriodo}")]
        public async Task<IActionResult> GetNotasEstudiantePeriodo(int idEstudiante, int idPeriodo)
        {
            var notas = await _context.ResultadosPeriodos
                .Include(r => r.Materia)
                .Where(r => r.IdEstudiante == idEstudiante && r.IdPeriodo == idPeriodo)
                .Select(r => new
                {
                    r.IdResultadoPeriodo,
                    r.IdEstudiante,
                    r.IdMateria,
                    r.IdPeriodo,
                    r.IdClase,
                    r.NotaAcumulada,
                    nombreMateria = r.Materia != null ? r.Materia.NombreMateria : ""
                })
                .ToListAsync();

            return Ok(notas);
        }

        // GET: obtiene las notas de todos los estudiantes de una clase en un periodo.
        [HttpGet("clase/{idClase}/periodo/{idPeriodo}")]
        public async Task<IActionResult> GetNotasClasePeriodo(int idClase, int idPeriodo)
        {
            var notas = await _context.ResultadosPeriodos
                .Include(r => r.Materia)
                .Include(r => r.Estudiante)
                .Where(r => r.IdClase == idClase && r.IdPeriodo == idPeriodo)
                .ToListAsync();

            return Ok(notas);
        }

        // POST: guarda la nota de un estudiante en una materia y periodo, validando autorización del docente.
        [HttpPost]
        public async Task<IActionResult> GuardarNota([FromBody] GuardarNotaPeriodoDto dto)
        {
            var estudiante = await _context.Estudiantes.FindAsync(dto.IdEstudiante);
            if (estudiante == null)
                return NotFound(new { mensaje = $"Estudiante {dto.IdEstudiante} no encontrado" });

            var materia = await _context.Materias.FindAsync(dto.IdMateria);
            if (materia == null)
                return NotFound(new { mensaje = $"Materia {dto.IdMateria} no encontrada" });

            var periodo = await _context.PeriodosAcademicos.FindAsync(dto.IdPeriodo);
            if (periodo == null)
                return NotFound(new { mensaje = "Periodo no encontrado" });

            var idClase = dto.IdClase ?? await ObtenerClaseEstudiante(dto.IdEstudiante, periodo.AnioLectivo);

            if (idClase == null)
                return BadRequest(new { mensaje = "El estudiante no tiene una clase asignada para este periodo" });

            if (!await DocenteAutorizadoParaMateria(dto.IdMateria, idClase, periodo.AnioLectivo))
                return StatusCode(403, new { mensaje = "No tiene autorización para calificar esta materia" });

            var resultado = await _context.ResultadosPeriodos
                .FirstOrDefaultAsync(r => r.IdEstudiante == dto.IdEstudiante
                    && r.IdMateria == dto.IdMateria
                    && r.IdPeriodo == dto.IdPeriodo
                    && r.IdClase == idClase);

            decimal? anterior = null;
            if (resultado == null)
            {
                resultado = new ResultadoPeriodo
                {
                    IdEstudiante = dto.IdEstudiante,
                    IdMateria = dto.IdMateria,
                    IdPeriodo = dto.IdPeriodo,
                    IdClase = idClase.Value,
                    NotaAcumulada = dto.Nota,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.ResultadosPeriodos.Add(resultado);
            }
            else
            {
                anterior = resultado.NotaAcumulada;
                resultado.NotaAcumulada = dto.Nota;
                resultado.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            if (anterior.HasValue && anterior.Value != dto.Nota)
                await RegistrarAuditoriaNotaAsync(resultado.IdResultadoPeriodo, resultado.IdEstudiante, resultado.IdMateria, anterior.Value, dto.Nota, dto.Motivo);

            return Ok(new
            {
                mensaje = "Nota guardada correctamente",
                id = resultado.IdResultadoPeriodo,
                nota = resultado.NotaAcumulada
            });
        }

        // ============================================================
        // POST: api/resultados-periodos/importar
        // Importa en lote las notas de una clase y periodo (Registro Académico).
        // Valida todas las filas contra la clase y sus materias, inserta o
        // actualiza (upsert) y devuelve un reporte por fila.
        // ============================================================
        [HttpPost("importar")]
        public async Task<IActionResult> ImportarNotas([FromBody] ImportarNotasRequest request)
        {
            try
            {
                if (request.Notas == null || request.Notas.Count == 0)
                    return BadRequest(new { mensaje = "No hay notas para importar" });

                if (request.Notas.Count > 5000)
                    return BadRequest(new { mensaje = "El archivo excede el máximo de 5000 notas por importación" });

                var clase = await _context.Clases
                    .FirstOrDefaultAsync(c => c.IdClase == request.IdClase);
                if (clase == null)
                    return NotFound(new { mensaje = "Clase no encontrada" });

                if (!clase.Estado)
                    return BadRequest(new { mensaje = "La clase está inactiva" });

                if (clase.AnioLectivo != DateTime.Now.Year)
                    return BadRequest(new { mensaje = $"La clase pertenece al año lectivo {clase.AnioLectivo}, no al actual" });

                var periodo = await _context.PeriodosAcademicos
                    .FirstOrDefaultAsync(p => p.IdPeriodo == request.IdPeriodo);
                if (periodo == null)
                    return NotFound(new { mensaje = "Periodo no encontrado" });

                // Materias válidas de la clase (básicas + las de su especialidad),
                // mismo criterio que GET /materias/clase/{idClase}.
                var idEspecialidad = clase.IdEspecialidad;
                var materiasClase = await _context.Materias
                    .Where(m => m.Estado == true
                        && (m.TipoMateria == "Basica"
                            || (m.TipoMateria == "Especialidad" && idEspecialidad != null && m.IdEspecialidad == idEspecialidad)))
                    .Select(m => m.IdMateria)
                    .ToListAsync();
                var setMateriasClase = materiasClase.ToHashSet();

                // Estudiantes inscritos en la clase durante el año lectivo.
                var estudiantesClase = await _context.Inscripciones
                    .Where(i => i.IdClase == request.IdClase && i.AnioLectivo == DateTime.Now.Year)
                    .Select(i => i.IdEstudiante)
                    .ToListAsync();
                var setEstudiantesClase = estudiantesClase.ToHashSet();

                // Autorización: el personal (staff) tiene acceso irrestricto; el resto
                // de roles solo para sus materias asignadas con permiso de calificar.
                var codigoActual = User.FindFirst(ClaimTypes.Name)?.Value;
                var rol = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
                var rolesStaff = new[] { "Administrador", "Director", "Sub Director", "Registro Academico", "Coordinador" };
                var esStaff = rolesStaff.Contains(rol);

                var materiasAutorizadas = new HashSet<string>();
                if (!esStaff)
                {
                    var docente = await _context.Docentes
                        .FirstOrDefaultAsync(d => string.IsNullOrEmpty(codigoActual) ? false : (d.CodigoDocente == codigoActual || d.Correo == codigoActual));
                    if (docente == null)
                        return StatusCode(403, new { mensaje = "No tiene autorización para importar notas" });

                    var asignaciones = await _context.DocenteMaterias
                        .Where(dm => dm.IdDocente == docente.IdDocente
                            && dm.AnioLectivo == DateTime.Now.Year
                            && dm.Estado == true
                            && dm.PuedeCalificar == true)
                        .Select(dm => new { dm.IdMateria, dm.IdClase })
                        .ToListAsync();
                    materiasAutorizadas = asignaciones
                        .Select(x => $"{x.IdMateria}|{x.IdClase}")
                        .ToHashSet();
                }

                // Filas repetidas dentro del mismo archivo (mismo estudiante/materia).
                var duplicadosEnArchivo = request.Notas
                    .GroupBy(n => new { n.IdEstudiante, n.IdMateria })
                    .Where(g => g.Count() > 1)
                    .Select(g => $"{g.Key.IdEstudiante}|{g.Key.IdMateria}")
                    .ToHashSet();

                var insertados = 0;
                var actualizados = 0;
                var errores = new List<object>();
                var cambiosAuditoria = new List<AuditoriaNota>();

                foreach (var nota in request.Notas)
                {
                    var referencia = $"Estudiante {nota.IdEstudiante} - Materia {nota.IdMateria}";

                    if (nota.Nota < 0 || nota.Nota > 10)
                    {
                        errores.Add(new { fila = referencia, motivo = "La nota debe estar entre 0 y 10" });
                        continue;
                    }

                    if (!setEstudiantesClase.Contains(nota.IdEstudiante))
                    {
                        errores.Add(new { fila = referencia, motivo = "El estudiante no pertenece a esta clase" });
                        continue;
                    }

                    if (!setMateriasClase.Contains(nota.IdMateria))
                    {
                        errores.Add(new { fila = referencia, motivo = "La materia no pertenece a esta clase" });
                        continue;
                    }

                    if (!esStaff && !materiasAutorizadas.Contains($"{nota.IdMateria}|{request.IdClase}"))
                    {
                        errores.Add(new { fila = referencia, motivo = "No tiene autorización para calificar esta materia" });
                        continue;
                    }

                    if (duplicadosEnArchivo.Contains($"{nota.IdEstudiante}|{nota.IdMateria}"))
                    {
                        errores.Add(new { fila = referencia, motivo = "Fila duplicada en el archivo" });
                        continue;
                    }

                    var resultado = await _context.ResultadosPeriodos
                        .FirstOrDefaultAsync(r => r.IdEstudiante == nota.IdEstudiante
                            && r.IdMateria == nota.IdMateria
                            && r.IdPeriodo == request.IdPeriodo
                            && r.IdClase == request.IdClase);

                    decimal? anterior = null;
                    if (resultado == null)
                    {
                        resultado = new ResultadoPeriodo
                        {
                            IdEstudiante = nota.IdEstudiante,
                            IdMateria = nota.IdMateria,
                            IdPeriodo = request.IdPeriodo,
                            IdClase = request.IdClase,
                            NotaAcumulada = nota.Nota,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now
                        };
                        _context.ResultadosPeriodos.Add(resultado);
                        insertados++;
                    }
                    else
                    {
                        anterior = resultado.NotaAcumulada;
                        resultado.NotaAcumulada = nota.Nota;
                        resultado.UpdatedAt = DateTime.Now;
                        actualizados++;
                    }

                    if (anterior.HasValue && anterior.Value != nota.Nota)
                    {
                        var auditoria = new AuditoriaNota
                        {
                            IdEstudiante = nota.IdEstudiante,
                            IdMateria = nota.IdMateria,
                            IdDocente = 0,
                            NotaAnterior = anterior,
                            NotaNueva = nota.Nota,
                            MotivoCambio = "Importación desde Excel",
                            FechaCambio = DateTime.Now
                        };
                        if (!esStaff)
                        {
                            var docente = await _context.Docentes
                                .FirstOrDefaultAsync(d => !string.IsNullOrEmpty(codigoActual) && (d.CodigoDocente == codigoActual || d.Correo == codigoActual));
                            auditoria.IdDocente = docente?.IdDocente ?? 0;
                        }
                        cambiosAuditoria.Add(auditoria);
                    }
                }

                await _context.SaveChangesAsync();

                // Enlaza las auditorías con el id real de cada resultado y las guarda.
                if (cambiosAuditoria.Any())
                {
                    foreach (var aud in cambiosAuditoria)
                    {
                        var r = await _context.ResultadosPeriodos
                            .FirstOrDefaultAsync(x => x.IdEstudiante == aud.IdEstudiante
                                && x.IdMateria == aud.IdMateria
                                && x.IdPeriodo == request.IdPeriodo
                                && x.IdClase == request.IdClase);
                        aud.IdCalificacion = r?.IdResultadoPeriodo ?? 0;
                    }
                    _context.AuditoriaNotas.AddRange(cambiosAuditoria);
                    await _context.SaveChangesAsync();
                }

                // Registro de auditoría del sistema.
                try
                {
                    _context.Auditoria.Add(new Auditoria
                    {
                        Usuario = string.IsNullOrEmpty(codigoActual) ? "Sistema" : codigoActual,
                        Accion = "Importar Notas",
                        Detalle = $"Importación de {insertados} notas nuevas y {actualizados} actualizadas en {clase.NombreClase}, periodo {periodo.NumeroPeriodo} ({request.Notas.Count - errores.Count} válidas)",
                        Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                        Fecha = DateTime.Now,
                        CreatedAt = DateTime.Now
                    });
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al registrar auditoría de importación: {ex.Message}");
                }

                return Ok(new
                {
                    mensaje = $"Importación completada: {insertados} insertadas, {actualizados} actualizadas, {errores.Count} con error",
                    insertados,
                    actualizados,
                    fallidos = errores.Count,
                    errores
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al importar notas");
                return StatusCode(500, new { mensaje = "Error al importar las notas", error = ex.Message });
            }
        }

        // PUT: edita la nota de un resultado existente, validando la autorización.
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarNota(int id, [FromBody] GuardarNotaPeriodoDto dto)
        {
            var resultado = await _context.ResultadosPeriodos.FindAsync(id);
            if (resultado == null)
                return NotFound(new { mensaje = $"Nota con ID {id} no encontrada" });

            var periodo = await _context.PeriodosAcademicos.FindAsync(resultado.IdPeriodo);
            if (periodo == null)
                return NotFound(new { mensaje = "Periodo no encontrado" });

            if (!await DocenteAutorizadoParaMateria(resultado.IdMateria, resultado.IdClase, periodo.AnioLectivo))
                return StatusCode(403, new { mensaje = "No tiene autorización para calificar esta materia" });

            var anterior = resultado.NotaAcumulada;
            resultado.NotaAcumulada = dto.Nota;
            resultado.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            if (anterior != dto.Nota)
                await RegistrarAuditoriaNotaAsync(resultado.IdResultadoPeriodo, resultado.IdEstudiante, resultado.IdMateria, anterior, dto.Nota, dto.Motivo);

            return Ok(new
            {
                mensaje = "Nota actualizada correctamente",
                id = resultado.IdResultadoPeriodo,
                nota = resultado.NotaAcumulada
            });
        }

        // DELETE: elimina un resultado de nota, validando la autorización.
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarNota(int id)
        {
            var resultado = await _context.ResultadosPeriodos.FindAsync(id);
            if (resultado == null)
                return NotFound(new { mensaje = $"Nota con ID {id} no encontrada" });

            var periodo = await _context.PeriodosAcademicos.FindAsync(resultado.IdPeriodo);
            if (periodo == null)
                return NotFound(new { mensaje = "Periodo no encontrado" });

            if (!await DocenteAutorizadoParaMateria(resultado.IdMateria, resultado.IdClase, periodo.AnioLectivo))
                return StatusCode(403, new { mensaje = "No tiene autorización para calificar esta materia" });

            var idResultado = resultado.IdResultadoPeriodo;
            var idEstudiante = resultado.IdEstudiante;
            var idMateria = resultado.IdMateria;
            var anterior = resultado.NotaAcumulada;

            _context.ResultadosPeriodos.Remove(resultado);
            await _context.SaveChangesAsync();

            await RegistrarAuditoriaNotaAsync(idResultado, idEstudiante, idMateria, anterior, null, "Nota eliminada");

            return Ok(new { mensaje = "Nota eliminada correctamente" });
        }

        // GET: obtiene el historial de auditoría de cambios de una nota (resultado de periodo).
        [HttpGet("{id}/auditoria")]
        public async Task<ActionResult<IEnumerable<AuditoriaNota>>> GetAuditoriaNota(int id)
        {
            try
            {
                var historial = await _context.AuditoriaNotas
                    .Where(a => a.IdCalificacion == id)
                    .OrderByDescending(a => a.FechaCambio)
                    .Select(a => new
                    {
                        a.IdAuditNota,
                        a.NotaAnterior,
                        a.NotaNueva,
                        a.MotivoCambio,
                        a.FechaCambio,
                        a.IdDocente
                    })
                    .ToListAsync();

                return Ok(historial);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al obtener auditoría", error = ex.Message });
            }
        }

        // ============================================================
        // AUXILIARES
        // ============================================================
        private async Task RegistrarAuditoriaNotaAsync(int idCalificacion, int idEstudiante, int? idMateria, decimal? anterior, decimal? nueva, string? motivo)
        {
            try
            {
                var codigo = User.FindFirst(ClaimTypes.Name)?.Value;
                var idDocente = 0;
                if (!string.IsNullOrEmpty(codigo))
                {
                    var docente = await _context.Docentes
                        .FirstOrDefaultAsync(d => d.CodigoDocente == codigo || d.Correo == codigo);
                    if (docente != null)
                        idDocente = docente.IdDocente;
                }

                _context.AuditoriaNotas.Add(new AuditoriaNota
                {
                    IdCalificacion = idCalificacion,
                    IdEstudiante = idEstudiante,
                    IdMateria = idMateria,
                    IdDocente = idDocente,
                    NotaAnterior = anterior,
                    NotaNueva = nueva,
                    MotivoCambio = motivo,
                    FechaCambio = DateTime.Now
                });
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al registrar auditoría de nota: {ex.Message}");
            }
        }

        private async Task<int?> ObtenerClaseEstudiante(int idEstudiante, int anioLectivo)
        {
            return await _context.Inscripciones
                .Where(i => i.IdEstudiante == idEstudiante && i.AnioLectivo == anioLectivo)
                .Select(i => (int?)i.IdClase)
                .FirstOrDefaultAsync();
        }

        private async Task<bool> DocenteAutorizadoParaMateria(int? idMateria, int? idClase, int anioLectivo)
        {
            try
            {
                var codigo = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(codigo))
                    return false;

                // Roles de personal (staff) tienen acceso de supervisión irrestricto.
                var rol = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
                var rolesStaff = new[] { "Administrador", "Director", "Sub Director", "Registro Academico", "Coordinador" };
                if (rolesStaff.Contains(rol))
                    return true;

                // El resto de roles SOLO si son el docente titular con asignación activa.
                var docente = await _context.Docentes
                    .FirstOrDefaultAsync(d => d.CodigoDocente == codigo || d.Correo == codigo);

                if (docente == null)
                    return false;

                if (idClase == null)
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
                Console.WriteLine($"Error al validar autorización del docente: {ex.Message}");
                return false;
            }
        }
    }

    public class GuardarNotaPeriodoDto
    {
        public int IdEstudiante { get; set; }
        public int IdMateria { get; set; }
        public int IdPeriodo { get; set; }
        public int? IdClase { get; set; }
        public decimal Nota { get; set; }
        public string? Motivo { get; set; }
    }

    public class ImportarNotasRequest
    {
        public int IdClase { get; set; }
        public int IdPeriodo { get; set; }
        public List<ImportarNotaItem> Notas { get; set; } = new();
    }

    public class ImportarNotaItem
    {
        public int IdEstudiante { get; set; }
        public int IdMateria { get; set; }
        public decimal Nota { get; set; }
    }
}