using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using SistemaAcademicoINA.Services;

namespace SistemaAcademicoINA.Controllers
{
    [ApiController]
    [Route("api/certificados-promocion")]
    [Authorize]
    public class CertificadosPromocionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly DocumentoService _documentoService;
        private readonly ILogger<CertificadosPromocionController> _logger;

        public CertificadosPromocionController(
            ApplicationDbContext context,
            DocumentoService documentoService,
            ILogger<CertificadosPromocionController> logger)
        {
            _context = context;
            _documentoService = documentoService;
            _logger = logger;
        }

        // ============================================================
        // GET: api/certificados-promocion/estudiante/{idEstudiante}/{anioLectivo}
        // Obtiene los datos del certificado para un estudiante específico
        // ============================================================
        [HttpGet("estudiante/{idEstudiante}/{anioLectivo}")]
        public async Task<ActionResult> GetCertificadoPorEstudiante(int idEstudiante, int anioLectivo)
        {
            try
            {
                var datos = await CalcularDatosCertificado(idEstudiante, anioLectivo);

                if (datos == null)
                    return NotFound(new { mensaje = "Estudiante no encontrado o sin datos para el año lectivo especificado" });

                return Ok(datos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener certificado del estudiante {Id}", idEstudiante);
                return StatusCode(500, new { mensaje = "Error al obtener el certificado: " + ex.Message });
            }
        }

        // ============================================================
        // GET: api/certificados-promocion/clase/{idClase}/{anioLectivo}
        // Obtiene los datos de todos los estudiantes de una clase
        // ============================================================
        [HttpGet("clase/{idClase}/{anioLectivo}")]
        public async Task<ActionResult> GetCertificadosPorClase(int idClase, int anioLectivo)
        {
            try
            {
                // Buscar estudiantes matriculados en la clase
                var estudiantesIds = await _context.Inscripciones
                    .Where(i => i.IdClase == idClase && i.EstadoInscripcion == "Confirmada")
                    .Select(i => i.IdEstudiante)
                    .ToListAsync();

                if (!estudiantesIds.Any())
                    return NotFound(new { mensaje = "No hay estudiantes matriculados en esta clase" });

                var estudiantes = await _context.Estudiantes
                    .Where(e => estudiantesIds.Contains(e.IdEstudiante) && e.Estado)
                    .OrderBy(e => e.Apellidos)
                    .ThenBy(e => e.Nombres)
                    .ToListAsync();

                var certificados = new List<object>();
                foreach (var est in estudiantes)
                {
                    var datos = await CalcularDatosCertificado(est.IdEstudiante, anioLectivo);
                    if (datos != null)
                        certificados.Add(datos);
                }

                return Ok(certificados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener certificados de la clase {Id}", idClase);
                return StatusCode(500, new { mensaje = "Error al obtener los certificados: " + ex.Message });
            }
        }

        // ============================================================
        // GET: api/certificados-promocion/generar/estudiante/{idEstudiante}/{anioLectivo}/{formato}
        // Genera el PDF/Word del certificado para un estudiante
        // ============================================================
        [HttpGet("generar/estudiante/{idEstudiante}/{anioLectivo}/{formato}")]
        public async Task<IActionResult> GenerarCertificadoEstudiante(int idEstudiante, int anioLectivo, string formato)
        {
            try
            {
                if (!Enum.TryParse(formato, true, out FormatoDocumento fmt))
                    return BadRequest(new { mensaje = "Formato no válido. Use: pdf o word" });

                var datos = await CalcularDatosCertificado(idEstudiante, anioLectivo);
                if (datos == null)
                    return NotFound(new { mensaje = "Estudiante no encontrado o sin datos" });

                var directora = await ObtenerDirectora();

                var reemplazos = new Dictionary<string, string>
                {
                    { "nombreEstudiante", datos.NombreCompleto },
                    { "codigoEstudiante", datos.CodigoEstudiante },
                    { "nie", datos.Nie ?? "-" },
                    { "nivelBachillerato", datos.NivelBachillerato },
                    { "especialidad", datos.Especialidad },
                    { "seccion", datos.Seccion },
                    { "anioLectivo", anioLectivo.ToString() },
                    { "promedioGeneral", datos.PromedioGeneral.ToString("0.00") },
                    { "materiasAprobadas", datos.MateriasAprobadas.ToString() },
                    { "materiasReprobadas", datos.MateriasReprobadas.ToString() },
                    { "estado", datos.Estado },
                    { "nombreDirectora", directora },
                    { "dia", DateTime.Now.Day.ToString() },
                    { "mes", DateTime.Now.ToString("MMMM") },
                    { "anio", DateTime.Now.Year.ToString() }
                };

                var (contenido, nombreArchivo, mimeType) = await _documentoService.GenerarCertificadoPromocionAsync(fmt, reemplazos, datos.CodigoEstudiante);
                return File(contenido, mimeType, nombreArchivo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar certificado del estudiante {Id}", idEstudiante);
                return StatusCode(500, new { mensaje = "Error al generar el certificado: " + ex.Message });
            }
        }

        // ============================================================
        // GET: api/certificados-promocion/generar/clase/{idClase}/{anioLectivo}/{formato}
        // Genera un PDF/Word combinado con todos los estudiantes de una clase
        // ============================================================
        [HttpGet("generar/clase/{idClase}/{anioLectivo}/{formato}")]
        public async Task<IActionResult> GenerarCertificadoClase(int idClase, int anioLectivo, string formato)
        {
            try
            {
                if (!Enum.TryParse(formato, true, out FormatoDocumento fmt))
                    return BadRequest(new { mensaje = "Formato no válido. Use: pdf o word" });

                var estudiantesIds = await _context.Inscripciones
                    .Where(i => i.IdClase == idClase && i.EstadoInscripcion == "Confirmada")
                    .Select(i => i.IdEstudiante)
                    .ToListAsync();

                if (!estudiantesIds.Any())
                    return NotFound(new { mensaje = "No hay estudiantes matriculados en esta clase" });

                var estudiantes = await _context.Estudiantes
                    .Where(e => estudiantesIds.Contains(e.IdEstudiante) && e.Estado)
                    .OrderBy(e => e.Apellidos)
                    .ThenBy(e => e.Nombres)
                    .ToListAsync();

                var directora = await ObtenerDirectora();
                var listaReemplazos = new List<Dictionary<string, string>>();

                foreach (var est in estudiantes)
                {
                    var datos = await CalcularDatosCertificado(est.IdEstudiante, anioLectivo);
                    if (datos == null) continue;

                    listaReemplazos.Add(new Dictionary<string, string>
                    {
                        { "nombreEstudiante", datos.NombreCompleto },
                        { "codigoEstudiante", datos.CodigoEstudiante },
                        { "nie", datos.Nie ?? "-" },
                        { "nivelBachillerato", datos.NivelBachillerato },
                        { "especialidad", datos.Especialidad },
                        { "seccion", datos.Seccion },
                        { "anioLectivo", anioLectivo.ToString() },
                        { "promedioGeneral", datos.PromedioGeneral.ToString("0.00") },
                        { "materiasAprobadas", datos.MateriasAprobadas.ToString() },
                        { "materiasReprobadas", datos.MateriasReprobadas.ToString() },
                        { "estado", datos.Estado },
                        { "nombreDirectora", directora },
                        { "dia", DateTime.Now.Day.ToString() },
                        { "mes", DateTime.Now.ToString("MMMM") },
                        { "anio", DateTime.Now.Year.ToString() }
                    });
                }

                if (!listaReemplazos.Any())
                    return NotFound(new { mensaje = "No se pudieron generar certificados para esta clase" });

                if (fmt == FormatoDocumento.Pdf)
                {
                    var (contenido, nombreArchivo, mimeType) = await _documentoService.GenerarPdfCombinadoCertificadoPromocionAsync(listaReemplazos, idClase);
                    return File(contenido, mimeType, nombreArchivo);
                }
                else
                {
                    var (contenido, nombreArchivo, mimeType) = await _documentoService.GenerarWordCombinadoCertificadoPromocionAsync(listaReemplazos, idClase);
                    return File(contenido, mimeType, nombreArchivo);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar certificados de la clase {Id}", idClase);
                return StatusCode(500, new { mensaje = "Error al generar los certificados: " + ex.Message });
            }
        }

        // ============================================================
        // MÉTODO PRIVADO: Calcular los datos del certificado
        // CORREGIDO: Ahora filtra correctamente por año lectivo y materia
        // ============================================================
        private async Task<CertificadoPromocionDto?> CalcularDatosCertificado(int idEstudiante, int anioLectivo)
        {
            // 1. Obtener estudiante con su clase, nivel y especialidad
            var estudiante = await _context.Estudiantes
                .Include(e => e.Clase)
                    .ThenInclude(c => c!.Nivel)
                .Include(e => e.Clase)
                    .ThenInclude(c => c!.SeccionObj)
                .Include(e => e.Clase)
                    .ThenInclude(c => c!.Especialidad)
                .FirstOrDefaultAsync(e => e.IdEstudiante == idEstudiante);

            if (estudiante == null) return null;

            var clase = estudiante.Clase;
            var nombreNivel = clase?.Nivel?.NombreNivel ?? "Técnico";
            var duracionAnios = clase?.Nivel?.DuracionAnios ?? 3;
            var especialidad = clase?.Especialidad?.NombreEspecialidad ?? "Bachillerato General";
            var seccion = clase?.SeccionObj?.NombreSeccion ?? clase?.Seccion ?? "-";

            var nivelBachillerato = duracionAnios switch
            {
                1 => "PRIMER",
                2 => "SEGUNDO",
                3 => "TERCER",
                4 => "CUARTO",
                5 => "QUINTO",
                _ => duracionAnios.ToString()
            };

            // 2. Obtener los resultados por período para el estudiante en el año lectivo
            // CORREGIDO: Se filtra por AnioLectivo y se agrupa por materia
            var resultados = await _context.ResultadosPeriodos
                .Where(r => r.IdEstudiante == idEstudiante && r.AnioLectivo == anioLectivo)
                .Include(r => r.Materia)
                .ToListAsync();

            if (!resultados.Any())
            {
                // Si no hay resultados, devolver datos con promedio 0 y sin promoción
                return new CertificadoPromocionDto
                {
                    IdEstudiante = idEstudiante,
                    NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}".Trim(),
                    CodigoEstudiante = estudiante.CodigoEstudiante ?? "-",
                    Nie = estudiante.Nie,
                    NivelBachillerato = nivelBachillerato + " " + nombreNivel,
                    Especialidad = especialidad,
                    Seccion = seccion,
                    AnioLectivo = anioLectivo,
                    PromedioGeneral = 0,
                    MateriasAprobadas = 0,
                    MateriasReprobadas = 0,
                    Estado = "NO PROMOVIDO"
                };
            }

            // 3. Agrupar por materia y calcular el promedio final de cada materia
            // El promedio de una materia es el promedio de sus notas en todos los períodos
            var notasPorMateria = resultados
                .GroupBy(r => r.IdMateria)
                .Select(g => new
                {
                    IdMateria = g.Key,
                    NombreMateria = g.First().Materia?.NombreMateria ?? "N/A",
                    // Nota final: usar NotaRecuperacion si existe y es > 0, sino NotaAcumulada
                    NotaFinal = g.Average(r =>
                        (r.NotaRecuperacion.HasValue && r.NotaRecuperacion > 0)
                            ? r.NotaRecuperacion.Value
                            : r.NotaAcumulada)
                })
                .ToList();

            // 4. Calcular promedio general (promedio de promedios de materias)
            var promedioGeneral = notasPorMateria.Any()
                ? Math.Round(notasPorMateria.Average(n => n.NotaFinal), 2)
                : 0;

            // 5. Contar materias aprobadas (>= 6.0) y reprobadas (< 6.0)
            var aprobadas = notasPorMateria.Count(n => n.NotaFinal >= 6);
            var reprobadas = notasPorMateria.Count(n => n.NotaFinal < 6);

            // 6. Determinar estado: PROMOVIDO si no hay reprobadas, NO PROMOVIDO si hay al menos una
            var estado = reprobadas == 0 && aprobadas > 0 ? "PROMOVIDO" : "NO PROMOVIDO";

            return new CertificadoPromocionDto
            {
                IdEstudiante = idEstudiante,
                NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}".Trim(),
                CodigoEstudiante = estudiante.CodigoEstudiante ?? "-",
                Nie = estudiante.Nie,
                NivelBachillerato = nivelBachillerato + " " + nombreNivel,
                Especialidad = especialidad,
                Seccion = seccion,
                AnioLectivo = anioLectivo,
                PromedioGeneral = promedioGeneral,
                MateriasAprobadas = aprobadas,
                MateriasReprobadas = reprobadas,
                Estado = estado
            };
        }

        // Obtener el nombre de la directora
        private async Task<string> ObtenerDirectora()
        {
            return await _context.Usuarios
                .Include(u => u.Rol)
                .Where(u => u.Rol != null && (u.Rol.NombreRol == "Director" || u.Rol.NombreRol == "Directora"))
                .Select(u => u.Nombres + " " + u.Apellidos)
                .FirstOrDefaultAsync() ?? "Directora";
        }
    }

    // DTO para los datos del certificado
    public class CertificadoPromocionDto
    {
        public int IdEstudiante { get; set; }
        public string NombreCompleto { get; set; } = "";
        public string CodigoEstudiante { get; set; } = "";
        public string? Nie { get; set; }
        public string NivelBachillerato { get; set; } = "";
        public string Especialidad { get; set; } = "";
        public string Seccion { get; set; } = "";
        public int AnioLectivo { get; set; }
        public decimal PromedioGeneral { get; set; }
        public int MateriasAprobadas { get; set; }
        public int MateriasReprobadas { get; set; }
        public string Estado { get; set; } = "NO PROMOVIDO";
    }
}