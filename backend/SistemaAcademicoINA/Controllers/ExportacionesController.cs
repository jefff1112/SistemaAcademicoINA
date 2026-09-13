using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClosedXML.Excel;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using System.Drawing;
using System.IO;
using System.Security.Claims;

namespace SistemaAcademicoINA.Controllers
{
    /// <summary>
    /// Controller para gestión de exportaciones Excel con auditoría completa.
    /// Solo accesible por roles administrativos: Administrador, Director, Sub Director, Registro Académico.
    /// Usa ClosedXML para generar los archivos Excel.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public class ExportacionesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ExportacionesController> _logger;
        private readonly IWebHostEnvironment _env;
        private const string EXPORTACIONES_DIR = "wwwroot/exportaciones";

        public ExportacionesController(
            ApplicationDbContext context,
            ILogger<ExportacionesController> logger,
            IWebHostEnvironment env)
        {
            _context = context;
            _logger = logger;
            _env = env;
        }

        // ============================================================
        // POST: api/exportaciones/generar
        // ============================================================
        [HttpPost("generar")]
        public async Task<ActionResult> GenerarExportacion([FromBody] GenerarExportacionRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Request inválido." });

                var idUsuario = ObtenerIdUsuarioActual();
                if (idUsuario == 0)
                    return Unauthorized(new { message = "No se pudo identificar al usuario." });

                var usuario = await _context.Usuarios
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u => u.IdUsuario == idUsuario);

                if (usuario == null)
                    return Unauthorized(new { message = "Usuario no encontrado." });

                var dirPath = Path.Combine(_env.ContentRootPath, EXPORTACIONES_DIR);
                if (!Directory.Exists(dirPath))
                    Directory.CreateDirectory(dirPath);

                byte[] archivoBytes;
                string descripcion;
                int totalRegistros;
                int? idClase = null;
                int? idMateria = null;
                int? idEspecialidad = null;
                int? idPeriodo = null;

                switch (request.Tipo)
                {
                    case TipoExportacion.ClaseMateriaPeriodo:
                        if (!request.IdClase.HasValue || !request.IdMateria.HasValue || !request.IdPeriodo.HasValue)
                            return BadRequest(new { message = "Para ClaseMateriaPeriodo se requieren idClase, idMateria e idPeriodo." });
                        idClase = request.IdClase;
                        idMateria = request.IdMateria;
                        idPeriodo = request.IdPeriodo;
                        (archivoBytes, descripcion, totalRegistros) = await GenerarClaseMateriaPeriodo(
                            request.IdClase.Value, request.IdMateria.Value, request.IdPeriodo.Value, request.AnioLectivo);
                        break;

                    case TipoExportacion.ClaseMateriaTodosPeriodos:
                        if (!request.IdClase.HasValue || !request.IdMateria.HasValue)
                            return BadRequest(new { message = "Para ClaseMateriaTodosPeriodos se requieren idClase e idMateria." });
                        idClase = request.IdClase;
                        idMateria = request.IdMateria;
                        (archivoBytes, descripcion, totalRegistros) = await GenerarClaseMateriaTodosPeriodos(
                            request.IdClase.Value, request.IdMateria.Value, request.AnioLectivo);
                        break;

                    case TipoExportacion.ClaseTodasMateriasPeriodo:
                        if (!request.IdClase.HasValue || !request.IdPeriodo.HasValue)
                            return BadRequest(new { message = "Para ClaseTodasMateriasPeriodo se requieren idClase e idPeriodo." });
                        idClase = request.IdClase;
                        idPeriodo = request.IdPeriodo;
                        (archivoBytes, descripcion, totalRegistros) = await GenerarClaseTodasMateriasPeriodo(
                            request.IdClase.Value, request.IdPeriodo.Value, request.AnioLectivo);
                        break;

                    case TipoExportacion.ClaseTodasMateriasTodosPeriodos:
                        if (!request.IdClase.HasValue)
                            return BadRequest(new { message = "Para ClaseTodasMateriasTodosPeriodos se requiere idClase." });
                        idClase = request.IdClase;
                        (archivoBytes, descripcion, totalRegistros) = await GenerarClaseTodasMateriasTodosPeriodos(
                            request.IdClase.Value, request.AnioLectivo);
                        break;

                    case TipoExportacion.ConsolidadoAnual:
                        (archivoBytes, descripcion, totalRegistros) = await GenerarConsolidadoAnual(request.AnioLectivo);
                        break;

                    default:
                        return BadRequest(new { message = "Tipo de exportación inválido." });
                }

                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var nombreArchivo = $"{request.Tipo}_{timestamp}_{Guid.NewGuid().ToString().Substring(0, 8)}.xlsx";
                var rutaRelativa = Path.Combine(EXPORTACIONES_DIR, nombreArchivo);
                var rutaAbsoluta = Path.Combine(_env.ContentRootPath, rutaRelativa);

                await System.IO.File.WriteAllBytesAsync(rutaAbsoluta, archivoBytes);

                var exportacion = new ExportacionHistorial
                {
                    IdUsuario = idUsuario,
                    NombreUsuario = $"{usuario.Nombres} {usuario.Apellidos}",
                    RolUsuario = usuario.Rol?.NombreRol ?? "Desconocido",
                    TipoExportacion = request.Tipo,
                    Descripcion = descripcion,
                    IdClase = idClase,
                    IdMateria = idMateria,
                    IdEspecialidad = idEspecialidad,
                    IdPeriodo = idPeriodo,
                    AnioLectivo = request.AnioLectivo,
                    NombreArchivo = nombreArchivo,
                    RutaArchivo = rutaRelativa,
                    TamanoBytes = archivoBytes.Length,
                    TotalRegistros = totalRegistros,
                    IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = Request.Headers["User-Agent"].ToString(),
                    FechaGeneracion = DateTime.Now,
                    Estado = EstadoExportacion.Activo
                };

                _context.ExportacionesHistorial.Add(exportacion);
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Exportación generada por {Usuario} ({Rol}): {Tipo} - {Descripcion} - {Tamano} bytes",
                    exportacion.NombreUsuario, exportacion.RolUsuario,
                    exportacion.TipoExportacion, descripcion, archivoBytes.Length);

                return Ok(new
                {
                    message = "Exportación generada exitosamente.",
                    idExportacion = exportacion.IdExportacion,
                    nombreArchivo = exportacion.NombreArchivo,
                    tamanoKB = Math.Round(archivoBytes.Length / 1024.0, 2),
                    totalRegistros = totalRegistros,
                    descripcion = descripcion,
                    rutaDescarga = $"/api/exportaciones/{exportacion.IdExportacion}/descargar"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar exportación");
                return StatusCode(500, new { message = "Error al generar la exportación.", detalle = ex.Message });
            }
        }

        // ============================================================
        // GET: api/exportaciones/historial
        // ============================================================
        [HttpGet("historial")]
        public async Task<ActionResult> GetHistorial(
            [FromQuery] int? idUsuario = null,
            [FromQuery] string? tipoExportacion = null,
            [FromQuery] DateTime? fechaDesde = null,
            [FromQuery] DateTime? fechaHasta = null,
            [FromQuery] int pagina = 1,
            [FromQuery] int porPagina = 50)
        {
            try
            {
                var query = _context.ExportacionesHistorial
                    .Include(e => e.Usuario)
                    .Include(e => e.Clase)
                    .Include(e => e.Materia)
                    .Include(e => e.Especialidad)
                    .Include(e => e.Periodo)
                    .Where(e => e.Estado == EstadoExportacion.Activo)
                    .AsQueryable();

                if (idUsuario.HasValue)
                    query = query.Where(e => e.IdUsuario == idUsuario.Value);

                if (!string.IsNullOrEmpty(tipoExportacion))
                {
                    if (Enum.TryParse<TipoExportacion>(tipoExportacion, out var tipo))
                        query = query.Where(e => e.TipoExportacion == tipo);
                }

                if (fechaDesde.HasValue)
                    query = query.Where(e => e.FechaGeneracion >= fechaDesde.Value);

                if (fechaHasta.HasValue)
                    query = query.Where(e => e.FechaGeneracion <= fechaHasta.Value);

                var total = await query.CountAsync();

                var items = await query
                    .OrderByDescending(e => e.FechaGeneracion)
                    .Skip((pagina - 1) * porPagina)
                    .Take(porPagina)
                    .Select(e => new
                    {
                        e.IdExportacion,
                        e.NombreUsuario,
                        e.RolUsuario,
                        TipoExportacion = e.TipoExportacion,
                        tipoExportacionLegible = e.TipoExportacionLegible,
                        e.Descripcion,
                        e.AnioLectivo,
                        NombreClase = e.Clase != null ? e.Clase.NombreClase : null,
                        NombreMateria = e.Materia != null ? e.Materia.NombreMateria : null,
                        NombreEspecialidad = e.Especialidad != null ? e.Especialidad.NombreEspecialidad : null,
                        NombrePeriodo = e.Periodo != null ? e.Periodo.Nombre : null,
                        e.NombreArchivo,
                        e.TamanoBytes,
                        tamanoLegible = e.TamanoLegible,
                        e.TotalRegistros,
                        e.IpOrigen,
                        e.FechaGeneracion,
                        e.FechaDescarga,
                        e.ContadorDescargas
                    })
                    .ToListAsync();

                var itemsProyectados = items.Select(e => new
                {
                    e.IdExportacion,
                    e.NombreUsuario,
                    e.RolUsuario,
                    tipoExportacion = e.TipoExportacion.ToString(),
                    e.tipoExportacionLegible,
                    e.Descripcion,
                    e.AnioLectivo,
                    nombreClase = e.NombreClase,
                    nombreMateria = e.NombreMateria,
                    nombreEspecialidad = e.NombreEspecialidad,
                    nombrePeriodo = e.NombrePeriodo,
                    e.NombreArchivo,
                    tamanoKB = Math.Round(e.TamanoBytes / 1024.0, 2),
                    e.tamanoLegible,
                    e.TotalRegistros,
                    e.IpOrigen,
                    fechaGeneracion = e.FechaGeneracion.ToString("yyyy-MM-dd HH:mm:ss"),
                    fechaDescarga = e.FechaDescarga?.ToString("yyyy-MM-dd HH:mm:ss"),
                    e.ContadorDescargas,
                    rutaDescarga = $"/api/exportaciones/{e.IdExportacion}/descargar"
                }).ToList();

                return Ok(new
                {
                    total,
                    pagina,
                    porPagina,
                    totalPaginas = (int)Math.Ceiling(total / (double)porPagina),
                    items = itemsProyectados
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener historial de exportaciones");
                return StatusCode(500, new { message = "Error al obtener el historial.", detalle = ex.Message });
            }
        }

        // ============================================================
        // GET: api/exportaciones/{id}/descargar
        // ============================================================
        [HttpGet("{id}/descargar")]
        public async Task<ActionResult> DescargarExportacion(int id)
        {
            try
            {
                var exportacion = await _context.ExportacionesHistorial
                    .FirstOrDefaultAsync(e => e.IdExportacion == id && e.Estado == EstadoExportacion.Activo);

                if (exportacion == null)
                    return NotFound(new { message = "Exportación no encontrada." });

                var rutaAbsoluta = Path.Combine(_env.ContentRootPath, exportacion.RutaArchivo);

                if (!System.IO.File.Exists(rutaAbsoluta))
                    return NotFound(new { message = "El archivo físico no existe en el servidor." });

                exportacion.ContadorDescargas++;
                exportacion.FechaDescarga = DateTime.Now;
                await _context.SaveChangesAsync();

                var bytes = await System.IO.File.ReadAllBytesAsync(rutaAbsoluta);

                _logger.LogInformation(
                    "Exportación descargada: ID={Id} por usuario={Usuario} (descarga #{Contador})",
                    id, ObtenerIdUsuarioActual(), exportacion.ContadorDescargas);

                return File(bytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    exportacion.NombreArchivo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al descargar exportación {Id}", id);
                return StatusCode(500, new { message = "Error al descargar el archivo.", detalle = ex.Message });
            }
        }

        // ============================================================
        // DELETE: api/exportaciones/{id}
        // ============================================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador,Director")]
        public async Task<ActionResult> EliminarExportacion(int id)
        {
            try
            {
                var exportacion = await _context.ExportacionesHistorial
                    .FirstOrDefaultAsync(e => e.IdExportacion == id && e.Estado == EstadoExportacion.Activo);

                if (exportacion == null)
                    return NotFound(new { message = "Exportación no encontrada." });

                exportacion.Estado = EstadoExportacion.Eliminado;
                await _context.SaveChangesAsync();

                var rutaAbsoluta = Path.Combine(_env.ContentRootPath, exportacion.RutaArchivo);
                if (System.IO.File.Exists(rutaAbsoluta))
                {
                    try { System.IO.File.Delete(rutaAbsoluta); }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "No se pudo eliminar el archivo físico: {Ruta}", rutaAbsoluta);
                    }
                }

                _logger.LogInformation("Exportación eliminada: ID={Id} por usuario={Usuario}",
                    id, ObtenerIdUsuarioActual());

                return Ok(new { message = "Exportación eliminada correctamente." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar exportación {Id}", id);
                return StatusCode(500, new { message = "Error al eliminar.", detalle = ex.Message });
            }
        }

        // ============================================================
        // GET: api/exportaciones/estadisticas
        // ============================================================
        [HttpGet("estadisticas")]
        public async Task<ActionResult> GetEstadisticas()
        {
            try
            {
                var total = await _context.ExportacionesHistorial
                    .CountAsync(e => e.Estado == EstadoExportacion.Activo);

                var totalBytes = await _context.ExportacionesHistorial
                    .Where(e => e.Estado == EstadoExportacion.Activo)
                    .SumAsync(e => (long?)e.TamanoBytes) ?? 0;

                var totalDescargas = await _context.ExportacionesHistorial
                    .Where(e => e.Estado == EstadoExportacion.Activo)
                    .SumAsync(e => (int?)e.ContadorDescargas) ?? 0;

                var porTipoRaw = await _context.ExportacionesHistorial
                    .Where(e => e.Estado == EstadoExportacion.Activo)
                    .GroupBy(e => e.TipoExportacion)
                    .Select(g => new
                    {
                        Tipo = g.Key,
                        Cantidad = g.Count()
                    })
                    .ToListAsync();

                var porTipo = porTipoRaw.Select(g => new
                {
                    tipo = g.Tipo.ToString(),
                    tipoLegible = g.Tipo switch
                    {
                        TipoExportacion.ClaseMateriaPeriodo => "Clase + Materia + 1 Período",
                        TipoExportacion.ClaseMateriaTodosPeriodos => "Clase + Materia + Todos los Períodos",
                        TipoExportacion.ClaseTodasMateriasPeriodo => "Clase + Todas las Materias + 1 Período",
                        TipoExportacion.ClaseTodasMateriasTodosPeriodos => "Clase + Todas las Materias + Todos los Períodos",
                        TipoExportacion.ConsolidadoAnual => "Consolidado Anual",
                        _ => g.Tipo.ToString()
                    },
                    cantidad = g.Cantidad
                }).ToList();

                var porUsuario = await _context.ExportacionesHistorial
                    .Where(e => e.Estado == EstadoExportacion.Activo)
                    .GroupBy(e => new { e.IdUsuario, e.NombreUsuario, e.RolUsuario })
                    .Select(g => new
                    {
                        idUsuario = g.Key.IdUsuario,
                        nombreUsuario = g.Key.NombreUsuario,
                        rolUsuario = g.Key.RolUsuario,
                        cantidad = g.Count()
                    })
                    .OrderByDescending(x => x.cantidad)
                    .Take(10)
                    .ToListAsync();

                return Ok(new
                {
                    totalExportaciones = total,
                    tamanoTotalMB = Math.Round(totalBytes / (1024.0 * 1024.0), 2),
                    totalDescargas,
                    porTipo,
                    topUsuarios = porUsuario
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas");
                return StatusCode(500, new { message = "Error al obtener estadísticas.", detalle = ex.Message });
            }
        }

        // ============================================================
        // MÉTODOS PRIVADOS: Generadores de cada tipo de Excel
        // ============================================================

        private async Task<(byte[] bytes, string descripcion, int totalRegistros)> GenerarClaseMateriaPeriodo(
            int idClase, int idMateria, int idPeriodo, int anioLectivo)
        {
            var clase = await _context.Clases.Include(c => c.Nivel).FirstOrDefaultAsync(c => c.IdClase == idClase);
            var materia = await _context.Materias.FirstOrDefaultAsync(m => m.IdMateria == idMateria);
            var periodo = await _context.PeriodosAcademicos.FirstOrDefaultAsync(p => p.IdPeriodo == idPeriodo);

            var descripcion = $"Clase: {clase?.NombreClase ?? "N/A"} | Materia: {materia?.NombreMateria ?? "N/A"} | Período: {periodo?.Nombre ?? "P" + idPeriodo} | Año: {anioLectivo}";

            var datos = await ObtenerDatosCuadroAuxiliar(idClase, idMateria, null, idPeriodo);

            using var workbook = new XLWorkbook();
            CrearHojaConFormatoINA(workbook, "Cuadro Auxiliar", datos, clase, materia, periodo, anioLectivo);

            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return (ms.ToArray(), descripcion, datos.filas.Count);
        }

        private async Task<(byte[] bytes, string descripcion, int totalRegistros)> GenerarClaseMateriaTodosPeriodos(
            int idClase, int idMateria, int anioLectivo)
        {
            var clase = await _context.Clases.Include(c => c.Nivel).FirstOrDefaultAsync(c => c.IdClase == idClase);
            var materia = await _context.Materias.FirstOrDefaultAsync(m => m.IdMateria == idMateria);
            var periodos = await _context.PeriodosAcademicos
                .Where(p => p.AnioLectivo == anioLectivo)
                .OrderBy(p => p.NumeroPeriodo)
                .ToListAsync();

            var descripcion = $"Clase: {clase?.NombreClase ?? "N/A"} | Materia: {materia?.NombreMateria ?? "N/A"} | TODOS los Períodos | Año: {anioLectivo}";

            using var workbook = new XLWorkbook();
            int totalReg = 0;

            foreach (var periodo in periodos)
            {
                var datos = await ObtenerDatosCuadroAuxiliar(idClase, idMateria, null, periodo.IdPeriodo);
                CrearHojaConFormatoINA(workbook, $"P{periodo.NumeroPeriodo} - {periodo.Nombre}", datos, clase, materia, periodo, anioLectivo);
                totalReg += datos.filas.Count;
            }

            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return (ms.ToArray(), descripcion, totalReg);
        }

        private async Task<(byte[] bytes, string descripcion, int totalRegistros)> GenerarClaseTodasMateriasPeriodo(
            int idClase, int idPeriodo, int anioLectivo)
        {
            var clase = await _context.Clases.Include(c => c.Nivel).FirstOrDefaultAsync(c => c.IdClase == idClase);
            var periodo = await _context.PeriodosAcademicos.FirstOrDefaultAsync(p => p.IdPeriodo == idPeriodo);
            var materias = await _context.Materias.OrderBy(m => m.NombreMateria).ToListAsync();

            var descripcion = $"Clase: {clase?.NombreClase ?? "N/A"} | TODAS las Materias | Período: {periodo?.Nombre ?? "P" + idPeriodo} | Año: {anioLectivo}";

            using var workbook = new XLWorkbook();
            int totalReg = 0;

            foreach (var materia in materias)
            {
                var datos = await ObtenerDatosCuadroAuxiliar(idClase, materia.IdMateria, null, idPeriodo);
                if (datos.actividades.Any())
                {
                    CrearHojaConFormatoINA(workbook, materia.NombreMateria, datos, clase, materia, periodo, anioLectivo);
                    totalReg += datos.filas.Count;
                }
            }

            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return (ms.ToArray(), descripcion, totalReg);
        }

        private async Task<(byte[] bytes, string descripcion, int totalRegistros)> GenerarClaseTodasMateriasTodosPeriodos(
            int idClase, int anioLectivo)
        {
            var clase = await _context.Clases.Include(c => c.Nivel).FirstOrDefaultAsync(c => c.IdClase == idClase);
            var materias = await _context.Materias.OrderBy(m => m.NombreMateria).ToListAsync();
            var periodos = await _context.PeriodosAcademicos
                .Where(p => p.AnioLectivo == anioLectivo)
                .OrderBy(p => p.NumeroPeriodo)
                .ToListAsync();

            var descripcion = $"Clase: {clase?.NombreClase ?? "N/A"} | TODAS las Materias | TODOS los Períodos | Año: {anioLectivo}";

            using var workbook = new XLWorkbook();
            int totalReg = 0;

            foreach (var materia in materias)
            {
                foreach (var periodo in periodos)
                {
                    var datos = await ObtenerDatosCuadroAuxiliar(idClase, materia.IdMateria, null, periodo.IdPeriodo);
                    if (datos.actividades.Any())
                    {
                        var nombreHoja = $"{materia.NombreMateria} P{periodo.NumeroPeriodo}";
                        if (nombreHoja.Length > 31) nombreHoja = nombreHoja.Substring(0, 31);
                        CrearHojaConFormatoINA(workbook, nombreHoja, datos, clase, materia, periodo, anioLectivo);
                        totalReg += datos.filas.Count;
                    }
                }
            }

            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return (ms.ToArray(), descripcion, totalReg);
        }

        // ============================================================
        // FIX: GenerarConsolidadoAnual corregido
        // - Agrupa clases por Nivel usando la navegación (no el DbSet)
        // - Usa "Confirmada" en inscripciones
        // - Filtra por AnioLectivo
        // - Crea hoja "Sin datos" si no hay información
        // ============================================================
        private async Task<(byte[] bytes, string descripcion, int totalRegistros)> GenerarConsolidadoAnual(int anioLectivo)
        {
            var descripcion = $"CONSOLIDADO ANUAL - Año Lectivo: {anioLectivo}";

            var clases = await _context.Clases
                .Include(c => c.Nivel)
                .Where(c => c.AnioLectivo == anioLectivo && c.Estado)
                .ToListAsync();

            var periodos = await _context.PeriodosAcademicos
                .Where(p => p.AnioLectivo == anioLectivo)
                .OrderBy(p => p.NumeroPeriodo)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            int totalReg = 0;

            if (!clases.Any() || !periodos.Any())
            {
                var wsVacia = workbook.Worksheets.Add("Sin datos");
                wsVacia.Cell(1, 1).Value = "INSTITUTO NACIONAL DE APOPA";
                wsVacia.Cell(1, 1).Style.Font.Bold = true;
                wsVacia.Cell(1, 1).Style.Font.FontSize = 14;
                wsVacia.Cell(2, 1).Value = $"No se encontraron datos para el año lectivo {anioLectivo}.";
                wsVacia.Cell(3, 1).Value = !clases.Any()
                    ? "Motivo: no hay clases registradas para este año."
                    : "Motivo: no hay períodos académicos registrados para este año.";

                using var msVacio = new MemoryStream();
                workbook.SaveAs(msVacio);
                return (msVacio.ToArray(), descripcion, 0);
            }

            var clasesPorNivel = clases
                .Where(c => c.Nivel != null)
                .GroupBy(c => new { c.Nivel!.IdNiveles, c.Nivel.NombreNivel })
                .OrderBy(g => g.Key.IdNiveles)
                .ToList();

            if (!clasesPorNivel.Any())
            {
                var wsSinNivel = workbook.Worksheets.Add("Sin Nivel");
                int filaAux = 1;
                wsSinNivel.Cell(filaAux, 1).Value = "INSTITUTO NACIONAL DE APOPA";
                wsSinNivel.Cell(filaAux, 1).Style.Font.Bold = true;
                filaAux += 2;

                foreach (var clase in clases)
                {
                    wsSinNivel.Cell(filaAux, 1).Value = $"Clase: {clase.NombreClase} {clase.Seccion}";
                    wsSinNivel.Cell(filaAux, 1).Style.Font.Bold = true;
                    filaAux++;
                }

                using var msSinNivel = new MemoryStream();
                workbook.SaveAs(msSinNivel);
                return (msSinNivel.ToArray(), descripcion, 0);
            }

            foreach (var grupoNivel in clasesPorNivel)
            {
                var nombreNivel = grupoNivel.Key.NombreNivel ?? $"Nivel {grupoNivel.Key.IdNiveles}";
                var sheetName = nombreNivel.Length > 31 ? nombreNivel.Substring(0, 31) : nombreNivel;

                int contador = 1;
                var nombreFinal = sheetName;
                while (workbook.Worksheets.Any(w => w.Name == nombreFinal))
                {
                    nombreFinal = $"{sheetName}_{contador++}";
                    if (nombreFinal.Length > 31) nombreFinal = nombreFinal.Substring(0, 31);
                }

                var sheet = workbook.Worksheets.Add(nombreFinal);
                int row = 1;

                sheet.Cell(row, 1).Value = "INSTITUTO NACIONAL DE APOPA";
                sheet.Range(row, 1, row, 10).Merge();
                sheet.Cell(row, 1).Style.Font.Bold = true;
                sheet.Cell(row, 1).Style.Font.FontSize = 14;
                sheet.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                row++;

                sheet.Cell(row, 1).Value = $"CONSOLIDADO ANUAL - {nombreNivel} - Año {anioLectivo}";
                sheet.Range(row, 1, row, 10).Merge();
                sheet.Cell(row, 1).Style.Font.Bold = true;
                sheet.Cell(row, 1).Style.Font.FontSize = 12;
                sheet.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                row += 2;

                foreach (var clase in grupoNivel.OrderBy(c => c.Seccion))
                {
                    sheet.Cell(row, 1).Value = $"Clase: {clase.NombreClase} {clase.Seccion}";
                    sheet.Cell(row, 1).Style.Font.Bold = true;
                    row++;

                    sheet.Cell(row, 1).Value = "Código";
                    sheet.Cell(row, 1).Style.Font.Bold = true;
                    sheet.Cell(row, 1).Style.Fill.BackgroundColor = XLColor.LightGray;
                    sheet.Cell(row, 2).Value = "Estudiante";
                    sheet.Cell(row, 2).Style.Font.Bold = true;
                    sheet.Cell(row, 2).Style.Fill.BackgroundColor = XLColor.LightGray;

                    int colPeriodo = 3;
                    foreach (var periodo in periodos)
                    {
                        sheet.Cell(row, colPeriodo).Value = periodo.Nombre ?? $"P{periodo.NumeroPeriodo}";
                        sheet.Cell(row, colPeriodo).Style.Font.Bold = true;
                        sheet.Cell(row, colPeriodo).Style.Fill.BackgroundColor = XLColor.LightBlue;
                        colPeriodo++;
                    }
                    sheet.Cell(row, colPeriodo).Value = "Promedio Anual";
                    sheet.Cell(row, colPeriodo).Style.Font.Bold = true;
                    sheet.Cell(row, colPeriodo).Style.Fill.BackgroundColor = XLColor.LightGreen;
                    row++;

                    var idsEstudiantes = await _context.Inscripciones
                        .Where(i => i.IdClase == clase.IdClase
                            && i.EstadoInscripcion == "Confirmada")
                        .Select(i => i.IdEstudiante)
                        .ToListAsync();

                    if (!idsEstudiantes.Any())
                    {
                        sheet.Cell(row, 1).Value = "(Sin estudiantes matriculados)";
                        sheet.Cell(row, 1).Style.Font.Italic = true;
                        row += 2;
                        continue;
                    }

                    var estudiantes = await _context.Estudiantes
                        .Where(e => idsEstudiantes.Contains(e.IdEstudiante) && e.Estado)
                        .OrderBy(e => e.Apellidos)
                        .ThenBy(e => e.Nombres)
                        .ToListAsync();

                    foreach (var est in estudiantes)
                    {
                        sheet.Cell(row, 1).Value = est.CodigoEstudiante;
                        sheet.Cell(row, 2).Value = $"{est.Apellidos}, {est.Nombres}";

                        colPeriodo = 3;
                        decimal sumaNotas = 0;
                        int countNotas = 0;

                        foreach (var periodo in periodos)
                        {
                            var resultado = await _context.ResultadosPeriodos
                                .FirstOrDefaultAsync(r => r.IdEstudiante == est.IdEstudiante
                                    && r.IdClase == clase.IdClase
                                    && r.IdPeriodo == periodo.IdPeriodo
                                    && r.AnioLectivo == anioLectivo);

                            if (resultado != null)
                            {
                                var notaFinal = (resultado.NotaRecuperacion.HasValue && resultado.NotaRecuperacion > 0)
                                    ? resultado.NotaRecuperacion.Value
                                    : resultado.NotaAcumulada;

                                sheet.Cell(row, colPeriodo).Value = notaFinal;
                                sheet.Cell(row, colPeriodo).Style.NumberFormat.Format = "0.00";

                                if (notaFinal > 0)
                                {
                                    sumaNotas += notaFinal;
                                    countNotas++;
                                    if (notaFinal < 6)
                                        sheet.Cell(row, colPeriodo).Style.Fill.BackgroundColor = XLColor.LightCoral;
                                }
                            }
                            else
                            {
                                sheet.Cell(row, colPeriodo).Value = "";
                            }
                            colPeriodo++;
                        }

                        if (countNotas > 0)
                        {
                            var promedioAnual = Math.Round(sumaNotas / countNotas, 2);
                            sheet.Cell(row, colPeriodo).Value = promedioAnual;
                            sheet.Cell(row, colPeriodo).Style.Font.Bold = true;
                            sheet.Cell(row, colPeriodo).Style.NumberFormat.Format = "0.00";
                            if (promedioAnual < 6)
                                sheet.Cell(row, colPeriodo).Style.Fill.BackgroundColor = XLColor.LightCoral;
                        }
                        else
                        {
                            sheet.Cell(row, colPeriodo).Value = "";
                        }

                        row++;
                        totalReg++;
                    }
                    row += 2;
                }

                sheet.Columns().AdjustToContents();
            }

            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return (ms.ToArray(), descripcion, totalReg);
        }

        private async Task<(List<ActividadInfo> actividades, List<EstudianteInfo> filas)> ObtenerDatosCuadroAuxiliar(
            int idClase, int? idMateria, int? idEspecialidad, int idPeriodo)
        {
            // FIX: filtrar por período
            var actividades = await _context.Actividades
                .Where(a => a.IdClase == idClase
                         && a.IdMateria == idMateria
                         && a.IdEspecialidad == idEspecialidad
                         && a.IdPeriodo == idPeriodo
                         && a.Estado == "Activo")
                .OrderBy(a => a.NumeroOrden)
                .Include(a => a.SubActividades)
                .ToListAsync();

            var actividadesInfo = actividades.Select(a => new ActividadInfo
            {
                IdActividad = a.IdActividad,
                Nombre = a.NombreActividad,
                Ponderacion = a.Ponderacion,
                SubActividades = a.SubActividades
                    .OrderBy(sa => sa.Orden)
                    .Select(sa => new SubActividadInfo
                    {
                        IdSubActividad = sa.IdSubActividad,
                        Nombre = sa.NombreSubActividad,
                        Tipo = sa.TipoSubActividad,
                        Ponderacion = sa.Ponderacion,
                        EsVertical = sa.EsVertical
                    }).ToList()
            }).ToList();

            var estudiantesIdsMatriculados = await _context.Inscripciones
                .Where(i => i.IdClase == idClase && i.EstadoInscripcion == "Confirmada")
                .Select(i => i.IdEstudiante)
                .ToListAsync();

            var estudiantes = await _context.Estudiantes
                .Where(e => estudiantesIdsMatriculados.Contains(e.IdEstudiante))
                .OrderBy(e => e.Apellidos)
                .ThenBy(e => e.Nombres)
                .ToListAsync();

            var filas = new List<EstudianteInfo>();

            foreach (var est in estudiantes)
            {
                var fila = new EstudianteInfo
                {
                    Codigo = est.CodigoEstudiante ?? "",
                    Nombre = $"{est.Apellidos} {est.Nombres}",
                    Notas = new Dictionary<int, NotaInfo>()
                };

                foreach (var act in actividades)
                {
                    foreach (var sub in act.SubActividades)
                    {
                        var calif = await _context.CalificacionesSubActividades
                            .FirstOrDefaultAsync(c => c.IdSubActividad == sub.IdSubActividad
                                                   && c.IdEstudiante == est.IdEstudiante);

                        fila.Notas[sub.IdSubActividad] = new NotaInfo
                        {
                            Nota = calif?.Nota,
                            NotaRecuperacion = calif?.NotaRecuperacion
                        };
                    }
                }

                var resultado = await _context.ResultadosPeriodos
                    .FirstOrDefaultAsync(r => r.IdEstudiante == est.IdEstudiante
                                           && r.IdClase == idClase
                                           && r.IdMateria == idMateria
                                           && r.IdPeriodo == idPeriodo);

                fila.PromedioFinal = resultado?.NotaRecuperacion ?? resultado?.NotaAcumulada;

                filas.Add(fila);
            }

            return (actividadesInfo, filas);
        }

        private IXLWorksheet CrearHojaConFormatoINA(
            XLWorkbook workbook,
            string nombreHoja,
            (List<ActividadInfo> actividades, List<EstudianteInfo> filas) datos,
            Clase? clase,
            Materia? materia,
            PeriodoAcademico? periodo,
            int anioLectivo)
        {
            if (nombreHoja.Length > 31) nombreHoja = nombreHoja.Substring(0, 31);
            var sheet = workbook.Worksheets.Add(nombreHoja);

            int row = 1;

            sheet.Cell(row, 1).Value = "INSTITUTO NACIONAL DE APOPA";
            int totalCols = 2 + datos.actividades.Sum(a => a.SubActividades.Count) + 3;
            sheet.Range(row, 1, row, totalCols).Merge();
            sheet.Cell(row, 1).Style.Font.Bold = true;
            sheet.Cell(row, 1).Style.Font.FontSize = 14;
            sheet.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            row++;

            sheet.Cell(row, 1).Value = "CUADRO AUXILIAR PARA EL REGISTRO DE EVALUACIONES POR ASIGNATURA Y PERIODO";
            sheet.Cell(row, totalCols).Value = $"AÑO LECTIVO: {anioLectivo}";
            sheet.Range(row, 1, row, totalCols - 1).Merge();
            sheet.Cell(row, 1).Style.Font.Bold = true;
            row++;

            sheet.Cell(row, 1).Value = $"ASIGNATURA: {materia?.NombreMateria ?? "N/A"}";
            sheet.Cell(row, 4).Value = $"SECCIÓN: {clase?.NombreClase ?? "N/A"}";
            sheet.Cell(row, 7).Value = $"PERIODO N°: {periodo?.NumeroPeriodo ?? 0}";
            sheet.Cell(row, 9).Value = $"DOCENTE: ";
            row += 2;

            int headerRow = row;
            sheet.Cell(headerRow, 1).Value = "CÓDIGO";
            sheet.Cell(headerRow, 1).Style.Font.Bold = true;
            sheet.Cell(headerRow, 1).Style.Fill.BackgroundColor = XLColor.LightGray;

            sheet.Cell(headerRow, 2).Value = "NOMBRES";
            sheet.Cell(headerRow, 2).Style.Font.Bold = true;
            sheet.Cell(headerRow, 2).Style.Fill.BackgroundColor = XLColor.LightGray;

            int col = 3;
            foreach (var act in datos.actividades)
            {
                int startCol = col;
                int endCol = col + act.SubActividades.Count - 1;

                if (endCol > startCol)
                    sheet.Range(headerRow, startCol, headerRow, endCol).Merge();
                sheet.Cell(headerRow, startCol).Value = act.Nombre;
                sheet.Cell(headerRow, startCol).Style.Font.Bold = true;
                sheet.Cell(headerRow, startCol).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                sheet.Cell(headerRow, startCol).Style.Fill.BackgroundColor = XLColor.LightYellow;

                foreach (var sub in act.SubActividades)
                {
                    sheet.Cell(headerRow + 1, col).Value = sub.Nombre;
                    sheet.Cell(headerRow + 1, col).Style.Font.Bold = true;
                    sheet.Cell(headerRow + 1, col).Style.Fill.BackgroundColor = XLColor.LightYellow;

                    if (sub.EsVertical)
                    {
                        sheet.Cell(headerRow + 1, col).Style.Alignment.TextRotation = 90;
                        sheet.Row(headerRow + 1).Height = 60;
                    }
                    col++;
                }
            }

            sheet.Cell(headerRow, col).Value = "PROMEDIO FINAL";
            sheet.Cell(headerRow, col).Style.Font.Bold = true;
            sheet.Cell(headerRow, col).Style.Fill.BackgroundColor = XLColor.LightGreen;
            col++;

            sheet.Cell(headerRow, col).Value = "RECUPERACIÓN";
            sheet.Cell(headerRow, col).Style.Font.Bold = true;
            sheet.Cell(headerRow, col).Style.Fill.BackgroundColor = XLColor.LightCoral;
            col++;

            sheet.Cell(headerRow, col).Value = "OBSERVACIONES";
            sheet.Cell(headerRow, col).Style.Font.Bold = true;
            sheet.Cell(headerRow, col).Style.Fill.BackgroundColor = XLColor.LightGray;

            int dataRow = headerRow + 2;
            foreach (var fila in datos.filas)
            {
                col = 1;
                sheet.Cell(dataRow, col++).Value = fila.Codigo;
                sheet.Cell(dataRow, col++).Value = fila.Nombre;

                foreach (var act in datos.actividades)
                {
                    foreach (var sub in act.SubActividades)
                    {
                        var nota = fila.Notas.ContainsKey(sub.IdSubActividad)
                            ? fila.Notas[sub.IdSubActividad]
                            : new NotaInfo();
                        sheet.Cell(dataRow, col).Value = nota.NotaRecuperacion ?? nota.Nota;
                        col++;
                    }
                }

                sheet.Cell(dataRow, col).Value = fila.PromedioFinal;
                sheet.Cell(dataRow, col).Style.Font.Bold = true;
                col++;

                sheet.Cell(dataRow, col).Value = fila.PromedioFinal;
                col++;

                dataRow++;
            }

            sheet.Columns().AdjustToContents();
            return sheet;
        }

        private int ObtenerIdUsuarioActual()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                     ?? User.FindFirst("Name")
                     ?? User.FindFirst("sub");

            if (claim != null && int.TryParse(claim.Value, out int id))
                return id;

            return 0;
        }

        // ============================================================
        // CLASES AUXILIARES
        // ============================================================
        private class ActividadInfo
        {
            public int IdActividad { get; set; }
            public string Nombre { get; set; } = "";
            public decimal Ponderacion { get; set; }
            public List<SubActividadInfo> SubActividades { get; set; } = new();
        }

        private class SubActividadInfo
        {
            public int IdSubActividad { get; set; }
            public string Nombre { get; set; } = "";
            public string Tipo { get; set; } = "";
            public decimal Ponderacion { get; set; }
            public bool EsVertical { get; set; }
        }

        private class EstudianteInfo
        {
            public string Codigo { get; set; } = "";
            public string Nombre { get; set; } = "";
            public Dictionary<int, NotaInfo> Notas { get; set; } = new();
            public decimal? PromedioFinal { get; set; }
        }

        private class NotaInfo
        {
            public decimal? Nota { get; set; }
            public decimal? NotaRecuperacion { get; set; }
        }
    }

    public class GenerarExportacionRequest
    {
        public TipoExportacion Tipo { get; set; }
        public int? IdClase { get; set; }
        public int? IdMateria { get; set; }
        public int? IdEspecialidad { get; set; }
        public int? IdPeriodo { get; set; }
        public int AnioLectivo { get; set; } = DateTime.Now.Year;
    }
}