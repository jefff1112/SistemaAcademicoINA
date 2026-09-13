using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;

namespace SistemaAcademicoINA.Controllers;

// Controlador API (solo Administrador): tareas de mantenimiento de la base de datos (limpieza de datos huérfanos, reindexación y optimización de tablas).
[Authorize(Roles = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class MantenimientoController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MantenimientoController(ApplicationDbContext context)
    {
        _context = context;
    }

    // POST: elimina los registros huérfanos de las tablas principales y registra la acción en auditoría.
    [HttpPost("limpiar-huerfanos")]
    public async Task<IActionResult> LimpiarRegistrosHuerfanos()
    {
        try
        {
            var resultados = new List<string>();

            // 1. Resultados de periodos sin estudiante
            var eliminados1 = await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM resultados_periodos WHERE id_estudiante NOT IN (SELECT id_estudiante FROM estudiantes)");
            resultados.Add($"Resultados de periodos: {eliminados1} eliminados");

            // 2. Resultados finales sin estudiante
            var eliminados2 = await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM resultados_finales WHERE id_estudiante NOT IN (SELECT id_estudiante FROM estudiantes)");
            resultados.Add($"Resultados finales: {eliminados2} eliminados");

            // 3. Inscripciones sin estudiante
            var eliminados3 = await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM inscripciones WHERE id_estudiante NOT IN (SELECT id_estudiante FROM estudiantes)");
            resultados.Add($"Inscripciones: {eliminados3} eliminados");

            // 4. Asistencias sin estudiante
            var eliminados4 = await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM asistencias WHERE id_estudiante NOT IN (SELECT id_estudiante FROM estudiantes)");
            resultados.Add($"Asistencias: {eliminados4} eliminados");

            // 5. Faltas sin estudiante
            var eliminados5 = await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM faltas_amonestaciones WHERE id_estudiante NOT IN (SELECT id_estudiante FROM estudiantes)");
            resultados.Add($"Faltas: {eliminados5} eliminados");

            // 6. Horarios sin clase
            var eliminados6 = await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM horarios WHERE id_clase NOT IN (SELECT id_clase FROM clases)");
            resultados.Add($"Horarios: {eliminados6} eliminados");

            // 7. Docente-Materias sin docente
            var eliminados7 = await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM docente_materias WHERE id_docente NOT IN (SELECT id_docente FROM docentes)");
            resultados.Add($"Docente-Materias: {eliminados7} eliminados");

            // 8. Actividades sin clase
            var eliminados8 = await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM actividades WHERE id_clase NOT IN (SELECT id_clase FROM clases)");
            resultados.Add($"Actividades: {eliminados8} eliminados");

            // Registrar en auditoría
            await _context.Database.ExecuteSqlRawAsync(
                "INSERT INTO auditoria (usuario, accion, detalle, fecha) VALUES ('Sistema', 'Limpieza', 'Limpieza de registros huérfanos ejecutada', NOW())");

            return Ok(new { mensaje = "Limpieza completada", resultados });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al limpiar registros huérfanos", error = ex.Message });
        }
    }
    
    // POST: reindexa y optimiza todas las tablas de la base de datos.
    [HttpPost("reindexar")]
    public async Task<IActionResult> ReindexarBaseDatos()
    {
        try
        {
            var resultados = new List<string>();

            // Obtener solo TABLAS, no vistas
            var tables = await _context.Database
                .SqlQueryRaw<string>("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'")
                .ToListAsync();

            foreach (var table in tables)
            {
                // Validar que el nombre solo contenga caracteres seguros antes de interpolar
                if (string.IsNullOrEmpty(table) || !System.Text.RegularExpressions.Regex.IsMatch(table, @"^[a-zA-Z0-9_]+$"))
                    continue;

                try
                {
                    await _context.Database.ExecuteSqlRawAsync($"OPTIMIZE TABLE `{table}`");
                    resultados.Add($"Tabla {table} optimizada");
                }
                catch (Exception ex)
                {
                    resultados.Add($"Error en tabla {table}: {ex.Message}");
                }
            }

            // Registrar en auditoría
            await _context.Database.ExecuteSqlRawAsync(
                "INSERT INTO auditoria (usuario, accion, detalle, fecha) VALUES ('Sistema', 'Reindexacion', 'Reindexación completada', NOW())");

            return Ok(new { mensaje = "Reindexación completada", resultados });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al reindexar", error = ex.Message });
        }
    }
    // POST: optimiza las tablas principales del sistema.
    [HttpPost("optimizar-principales")]
    public async Task<IActionResult> OptimizarTablasPrincipales()
    {
        try
        {
            var tables = new List<string> { "usuarios", "aspirantes", "estudiantes", "docentes", "clases", "materias", "horarios", "asistencias", "auditoria" };
            var resultados = new List<string>();

            foreach (var table in tables)
            {
                await _context.Database.ExecuteSqlRawAsync($"OPTIMIZE TABLE `{table}`");
                resultados.Add($"Tabla {table} optimizada");
            }

            return Ok(new { mensaje = "Tablas principales optimizadas", resultados });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al optimizar", error = ex.Message });
        }
    }
}