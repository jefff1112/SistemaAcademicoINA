using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Services;

namespace SistemaAcademicoINA.Controllers
{
    [ApiController]
    [Route("api/publicacion-resultados")]
    [Authorize]
    public class PublicacionResultadosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly DocumentoService _documentoService;
        private readonly ILogger<PublicacionResultadosController> _logger;

        public PublicacionResultadosController(
            ApplicationDbContext context,
            DocumentoService documentoService,
            ILogger<PublicacionResultadosController> logger)
        {
            _context = context;
            _documentoService = documentoService;
            _logger = logger;
        }

        // ============================================================
        // GET: api/publicacion-resultados/aspirantes
        // Obtiene la lista de aspirantes con su especialidad y estado
        // ============================================================
        [HttpGet("aspirantes")]
        public async Task<ActionResult> GetAspirantes()
        {
            try
            {
                var aspirantes = await _context.Aspirantes
                    .Include(a => a.Especialidad)
                    .OrderByDescending(a => a.NotaExamen)
                    .ThenBy(a => a.Apellidos)
                    .Select(a => new
                    {
                        a.IdAspirante,
                        a.Nombres,
                        a.Apellidos,
                        a.Nie,
                        a.NotaExamen,
                        a.EstadoSolicitud,
                        a.EspecialidadAspira,
                        NombreEspecialidad = a.Especialidad != null
                            ? a.Especialidad.NombreEspecialidad
                            : "-"
                    })
                    .ToListAsync();

                return Ok(aspirantes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener aspirantes");
                return StatusCode(500, new { mensaje = "Error al obtener los aspirantes: " + ex.Message });
            }
        }

        // ============================================================
        // GET: api/publicacion-resultados/especialidades
        // Obtiene las especialidades disponibles dinámicamente
        // ============================================================
        [HttpGet("especialidades")]
        public async Task<ActionResult> GetEspecialidades()
        {
            try
            {
                var especialidades = await _context.Especialidades
                    .Where(e => e.Estado == true)
                    .OrderBy(e => e.NombreEspecialidad)
                    .Select(e => new
                    {
                        e.IdEspecialidad,
                        e.NombreEspecialidad
                    })
                    .ToListAsync();

                return Ok(especialidades);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener especialidades");
                return StatusCode(500, new { mensaje = "Error al obtener las especialidades: " + ex.Message });
            }
        }

        // ============================================================
        // GET: api/publicacion-resultados/generar-pdf/{idEspecialidad?}
        // Genera un PDF con la lista de resultados, opcionalmente filtrada
        // ============================================================
        [HttpGet("generar-pdf")]
        public async Task<IActionResult> GenerarPdf([FromQuery] int? idEspecialidad = null)
        {
            try
            {
                var query = _context.Aspirantes
                    .Include(a => a.Especialidad)
                    .AsQueryable();

                if (idEspecialidad.HasValue && idEspecialidad.Value > 0)
                {
                    query = query.Where(a => a.EspecialidadAspira == idEspecialidad.Value);
                }

                var aspirantes = await query
                    .OrderByDescending(a => a.NotaExamen)
                    .ThenBy(a => a.Apellidos)
                    .ToListAsync();

                if (!aspirantes.Any())
                    return NotFound(new { mensaje = "No hay aspirantes para generar el PDF" });

                // Obtener nombre de la especialidad para el título
                string nombreEspecialidad = "Todas las especialidades";
                if (idEspecialidad.HasValue && idEspecialidad.Value > 0)
                {
                    var esp = await _context.Especialidades.FindAsync(idEspecialidad.Value);
                    if (esp != null) nombreEspecialidad = esp.NombreEspecialidad;
                }

                // Calcular estadísticas
                var totalAspirantes = aspirantes.Count;
                var aprobados = aspirantes.Count(a => a.EstadoSolicitud == "Aprobado");
                var rechazados = aspirantes.Count(a => a.EstadoSolicitud == "Rechazado");
                var enEspera = aspirantes.Count(a => a.EstadoSolicitud == "En Espera");
                var preseleccionados = aspirantes.Count(a => a.EstadoSolicitud == "Preseleccionado");

                // Generar el PDF
                var (contenido, nombreArchivo, mimeType) = await _documentoService.GenerarPdfPublicacionResultadosAsync(
                    aspirantes.Select(a => new Dictionary<string, string>
                    {
                        { "id", a.IdAspirante.ToString() },
                        { "nombres", a.Nombres ?? "" },
                        { "apellidos", a.Apellidos ?? "" },
                        { "nie", a.Nie ?? "-" },
                        { "especialidad", a.Especialidad?.NombreEspecialidad ?? "-" },
                        { "nota", a.NotaExamen?.ToString("0.00") ?? "-" },
                        { "estado", a.EstadoSolicitud ?? "Pendiente" }
                    }).ToList(),
                    nombreEspecialidad,
                    totalAspirantes,
                    aprobados,
                    rechazados,
                    enEspera,
                    preseleccionados
                );

                return File(contenido, mimeType, nombreArchivo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar PDF de publicación de resultados");
                return StatusCode(500, new { mensaje = "Error al generar el PDF: " + ex.Message });
            }
        }
    }
}