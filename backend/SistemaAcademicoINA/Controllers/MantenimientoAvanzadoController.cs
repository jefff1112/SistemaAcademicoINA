using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;

namespace SistemaAcademicoINA.Controllers;

// Controlador API (solo Administrador): tareas avanzadas de mantenimiento del sistema (actividad de usuarios, sesiones, caché, integridad y estadísticas de BD).
[Authorize(Roles = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class MantenimientoAvanzadoController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public MantenimientoAvanzadoController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // =============================================
    // 1. REGISTRO DE ACTIVIDAD DE USUARIOS
    // =============================================
    // POST: registra una actividad realizada por un usuario en el sistema.
    [HttpPost("registrar-actividad")]
    public async Task<IActionResult> RegistrarActividad([FromBody] RegistrarActividadRequest request)
    {
        try
        {
            var actividad = new ActividadUsuario
            {
                IdUsuario = request.IdUsuario,
                Usuario = request.Usuario,
                Accion = request.Accion,
                Modulo = request.Modulo,
                Detalle = request.Detalle,
                Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                Fecha = DateTime.Now,
                CreatedAt = DateTime.Now
            };

            _context.ActividadUsuarios.Add(actividad);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Actividad registrada", id = actividad.IdActividad });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al registrar actividad", error = ex.Message });
        }
    }

    // GET: obtiene las actividades de los usuarios de los últimos días, filtrable por usuario.
    [HttpGet("actividad-usuarios")]
    public async Task<IActionResult> GetActividadUsuarios(int? idUsuario = null, int dias = 7)
    {
        try
        {
            var query = _context.ActividadUsuarios
                .Where(a => a.Fecha >= DateTime.Now.AddDays(-dias));

            if (idUsuario.HasValue)
            {
                query = query.Where(a => a.IdUsuario == idUsuario.Value);
            }

            var actividades = await query
                .OrderByDescending(a => a.Fecha)
                .ToListAsync();

            return Ok(actividades);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener actividades", error = ex.Message });
        }
    }

    // =============================================
    // 2. SESIONES DE USUARIOS
    // =============================================
    // GET: obtiene las sesiones de usuario actualmente activas.
    [HttpGet("sesiones-activas")]
    public async Task<IActionResult> GetSesionesActivas()
    {
        try
        {
            var sesiones = await _context.SesionesUsuarios
                .Where(s => s.Activa)
                .OrderByDescending(s => s.FechaInicio)
                .ToListAsync();

            return Ok(new
            {
                total = sesiones.Count,
                sesiones = sesiones
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener sesiones", error = ex.Message });
        }
    }

    // POST: cierra las sesiones inactivas con más de X minutos de antigüedad.
    [HttpPost("cerrar-sesiones-inactivas")]
    public async Task<IActionResult> CerrarSesionesInactivas(int minutos = 60)
    {
        try
        {
            var limite = DateTime.Now.AddMinutes(-minutos);
            var sesionesCerradas = await _context.SesionesUsuarios
                .Where(s => s.Activa && s.FechaInicio < limite)
                .ToListAsync();

            foreach (var sesion in sesionesCerradas)
            {
                sesion.Activa = false;
                sesion.FechaFin = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = $"Se cerraron {sesionesCerradas.Count} sesiones inactivas",
                cerradas = sesionesCerradas.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al cerrar sesiones", error = ex.Message });
        }
    }

    // =============================================
    // 3. LIMPIEZA DE CACHE
    // =============================================
    // POST: elimina todos los registros de la caché del sistema.
    [HttpPost("limpiar-cache")]
    public async Task<IActionResult> LimpiarCache()
    {
        try
        {
            var count = await _context.CacheSistema.CountAsync();
            _context.CacheSistema.RemoveRange(_context.CacheSistema);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = $"Cache limpiada ({count} registros eliminados)" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al limpiar cache", error = ex.Message });
        }
    }

    // POST: guarda o actualiza un valor en la caché con su fecha de expiración.
    [HttpPost("cache")]
    public async Task<IActionResult> SetCache([FromBody] SetCacheRequest request)
    {
        try
        {
            var existente = await _context.CacheSistema
                .FirstOrDefaultAsync(c => c.Clave == request.Clave);

            if (existente != null)
            {
                existente.Valor = request.Valor;
                existente.FechaCreacion = DateTime.Now;
                existente.FechaExpiracion = request.FechaExpiracion;
            }
            else
            {
                var cache = new CacheSistema
                {
                    Clave = request.Clave,
                    Valor = request.Valor,
                    FechaCreacion = DateTime.Now,
                    FechaExpiracion = request.FechaExpiracion,
                    CreatedAt = DateTime.Now
                };
                _context.CacheSistema.Add(cache);
            }

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Cache guardado" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al guardar cache", error = ex.Message });
        }
    }

    // GET: obtiene un valor de la caché por su clave, eliminándolo si está expirado.
    [HttpGet("cache/{clave}")]
    public async Task<IActionResult> GetCache(string clave)
    {
        try
        {
            var cache = await _context.CacheSistema
                .FirstOrDefaultAsync(c => c.Clave == clave);

            if (cache == null)
                return NotFound(new { mensaje = "Cache no encontrado" });

            if (cache.FechaExpiracion.HasValue && cache.FechaExpiracion.Value < DateTime.Now)
            {
                _context.CacheSistema.Remove(cache);
                await _context.SaveChangesAsync();
                return NotFound(new { mensaje = "Cache expirado" });
            }

            return Ok(new { clave = cache.Clave, valor = cache.Valor });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener cache", error = ex.Message });
        }
    }

    // =============================================
    // 4. VERIFICACIÓN DE INTEGRIDAD DE DATOS
    // =============================================
    // POST: verifica la integridad de los datos (referencias inválidas) y guarda el resultado.
    [HttpPost("verificar-integridad")]
    public async Task<IActionResult> VerificarIntegridad()
    {
        try
        {
            var errores = new List<string>();

            // Verificar estudiantes sin usuario
            var estudiantesSinUsuario = await _context.Estudiantes
                .Where(e => !_context.Usuarios.Any(u => u.Codigo == e.CodigoEstudiante))
                .ToListAsync();

            if (estudiantesSinUsuario.Any())
            {
                errores.Add($"Estudiantes sin usuario: {estudiantesSinUsuario.Count}");
            }

            // Verificar aspirantes sin especialidad
            var aspirantesSinEspecialidad = await _context.Aspirantes
                .Where(a => a.EspecialidadAspira.HasValue && !_context.Especialidades.Any(e => e.IdEspecialidad == a.EspecialidadAspira))
                .ToListAsync();

            if (aspirantesSinEspecialidad.Any())
            {
                errores.Add($"Aspirantes con especialidad inválida: {aspirantesSinEspecialidad.Count}");
            }

            // Verificar clases sin nivel
            var clasesSinNivel = await _context.Clases
                .Where(c => !_context.NivelesAcademicos.Any(n => n.IdNiveles == c.IdNivel))
                .ToListAsync();

            if (clasesSinNivel.Any())
            {
                errores.Add($"Clases sin nivel válido: {clasesSinNivel.Count}");
            }

            // Verificar estudiantes sin clase
            var estudiantesSinClase = await _context.Estudiantes
                .Where(e => e.IdClase.HasValue && !_context.Clases.Any(c => c.IdClase == e.IdClase))
                .ToListAsync();

            if (estudiantesSinClase.Any())
            {
                errores.Add($"Estudiantes con clase inválida: {estudiantesSinClase.Count}");
            }

            // Guardar resultado
            var integridad = new IntegridadDatos
            {
                Tabla = "Todas",
                RegistrosOk = 0,
                RegistrosError = errores.Count,
                Errores = errores.Any() ? string.Join("; ", errores) : null,
                FechaVerificacion = DateTime.Now,
                CreatedAt = DateTime.Now
            };

            _context.IntegridadDatos.Add(integridad);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = errores.Any() ? "Se encontraron problemas de integridad" : "Todo correcto",
                errores = errores,
                totalErrores = errores.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al verificar integridad", error = ex.Message });
        }
    }

    // =============================================
    // 5. ESTADÍSTICAS DE TABLAS (SIN SQL INJECTION)
    // =============================================
    // GET: obtiene estadísticas (filas y tamaño) de las tablas de la base de datos.
    [HttpGet("estadisticas-tablas")]
    public async Task<IActionResult> GetEstadisticasTablas()
    {
        try
        {
            // Usar FromSqlRaw con parámetros para evitar SQL injection
            var tables = await _context.Database
                .SqlQueryRaw<InfoTabla>("SELECT table_name AS TableName, COALESCE(table_rows, 0) AS TableRows, ROUND((data_length + index_length) / 1024 / 1024, 2) AS SizeMb FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY (data_length + index_length) DESC")
                .ToListAsync();

            return Ok(tables);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener estadísticas", error = ex.Message });
        }
    }

    // =============================================
    // 6. TABLAS MÁS GRANDES (SIN SQL INJECTION)
    // =============================================
    // GET: obtiene las N tablas más grandes de la base de datos por tamaño.
    [HttpGet("tablas-mas-grandes")]
    public async Task<IActionResult> GetTablasMasGrandes(int limite = 10)
    {
        try
        {
            var tables = await _context.Database
                .SqlQueryRaw<InfoTabla>("SELECT table_name AS TableName, ROUND((data_length + index_length) / 1024 / 1024, 2) AS SizeMb, COALESCE(table_rows, 0) AS TableRows FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY (data_length + index_length) DESC LIMIT {0}", limite)
                .ToListAsync();

            return Ok(tables);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener tablas grandes", error = ex.Message });
        }
    }

    // =============================================
    // 7. LIMPIEZA DE TABLAS TEMPORALES (SIN SQL INJECTION)
    // =============================================
    // POST: elimina las tablas temporales de la base de datos (validando nombres seguros).
    [HttpPost("limpiar-temporales")]
    public async Task<IActionResult> LimpiarTablasTemporales()
    {
        try
        {
            var tables = await _context.Database
                .SqlQueryRaw<string>("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND (table_name LIKE '%temp%' OR table_name LIKE '%tmp%')")
                .ToListAsync();

            var eliminadas = 0;
            foreach (var table in tables)
            {
                // Validar que el nombre solo contenga caracteres seguros antes de interpolar
                if (string.IsNullOrEmpty(table) || !System.Text.RegularExpressions.Regex.IsMatch(table, @"^[a-zA-Z0-9_]+$"))
                    continue;

                // Whitelist: solo se eliminan tablas temporales conocidas del modelo
                if (!IsKnownTempTable(table))
                    continue;

                await _context.Database.ExecuteSqlRawAsync($"DROP TABLE IF EXISTS `{table}`");
                eliminadas++;
            }

            return Ok(new { mensaje = $"Tablas temporales limpiadas: {eliminadas} eliminadas" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al limpiar tablas temporales", error = ex.Message });
        }
    }

    private static readonly HashSet<string> _tablasTemporalesConocidas = new(StringComparer.OrdinalIgnoreCase)
    {
        "especialidades_temp"
    };

    private static bool IsKnownTempTable(string tableName) => _tablasTemporalesConocidas.Contains(tableName);
}

// =============================================
// DTOs
// =============================================
public class InfoTabla
{
    public string TableName { get; set; } = string.Empty;
    public long TableRows { get; set; }
    public decimal SizeMb { get; set; }
}
public class RegistrarActividadRequest
{
    public int IdUsuario { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public string Accion { get; set; } = string.Empty;
    public string Modulo { get; set; } = string.Empty;
    public string? Detalle { get; set; }
}

public class SetCacheRequest
{
    public string Clave { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
    public DateTime? FechaExpiracion { get; set; }
}