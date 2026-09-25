using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using System.Globalization;
using System.Text;

namespace SistemaAcademicoINA.Controllers;

// Controlador API (solo Administrador): gestiona los respaldos de la base de datos (listar, crear y eliminar archivos .sql).
[Authorize(Roles = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class RespaldosController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public RespaldosController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // GET: lista los archivos de respaldo almacenados en la carpeta Respaldos.
    [HttpGet]
    public IActionResult GetRespaldos()
    {
        try
        {
            var respaldosFolder = Path.Combine(_environment.ContentRootPath, "Respaldos");
            if (!Directory.Exists(respaldosFolder))
                Directory.CreateDirectory(respaldosFolder);

            var files = Directory.GetFiles(respaldosFolder)
                .Select(f => new
                {
                    nombre = Path.GetFileName(f),
                    fecha = System.IO.File.GetCreationTime(f),
                    tamano = new FileInfo(f).Length
                })
                .OrderByDescending(f => f.fecha)
                .ToList();

            return Ok(files);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener respaldos", error = ex.Message });
        }
    }

    // POST: genera un nuevo archivo de respaldo con fecha y hora en el nombre.
    [HttpPost]
    public async Task<IActionResult> CrearRespaldo()
    {
        try
        {
            var respaldosFolder = Path.Combine(_environment.ContentRootPath, "Respaldos");
            if (!Directory.Exists(respaldosFolder))
                Directory.CreateDirectory(respaldosFolder);

            var fileName = $"backup_{DateTime.Now:yyyyMMdd_HHmmss}.sql";
            var filePath = Path.Combine(respaldosFolder, fileName);

            // Crear un respaldo real con estructura y datos de todas las tablas
            var script = await GenerarBackupAsync();

            await System.IO.File.WriteAllTextAsync(filePath, script);

            return Ok(new
            {
                mensaje = "Respaldo creado correctamente",
                archivo = fileName,
                fecha = DateTime.Now,
                tamano = new FileInfo(filePath).Length
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear respaldo", error = ex.Message });
        }
    }

    // GET: descarga un archivo de respaldo.
    [HttpGet("{nombre}/descargar")]
    public IActionResult DescargarRespaldo(string nombre)
    {
        try
        {
            var respaldosFolder = Path.Combine(_environment.ContentRootPath, "Respaldos");

            var nombreLimpio = Path.GetFileName(nombre);
            // Validar nombre seguro
            if (!System.Text.RegularExpressions.Regex.IsMatch(nombreLimpio, @"^backup_\d{8}_\d{6}\.sql$") &&
                !System.Text.RegularExpressions.Regex.IsMatch(nombreLimpio, @"^baseline_.*\.sql$") &&
                !System.Text.RegularExpressions.Regex.IsMatch(nombreLimpio, @"^alter_.*\.sql$") &&
                !System.Text.RegularExpressions.Regex.IsMatch(nombreLimpio, @"^agregar_.*\.sql$"))
            {
                return BadRequest(new { mensaje = "Nombre de archivo no valido" });
            }

            var filePath = Path.Combine(respaldosFolder, nombreLimpio);

            if (!System.IO.File.Exists(filePath))
                return NotFound(new { mensaje = "Archivo no encontrado" });

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, "application/sql", nombreLimpio);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al descargar respaldo", error = ex.Message });
        }
    }

    // DELETE: elimina un archivo de respaldo, validando el formato del nombre.
    [HttpDelete("{nombre}")]
    public IActionResult DeleteRespaldo(string nombre)
    {
        try
        {
            var respaldosFolder = Path.Combine(_environment.ContentRootPath, "Respaldos");

            var nombreLimpio = Path.GetFileName(nombre);
            if (!System.Text.RegularExpressions.Regex.IsMatch(nombreLimpio, @"^backup_\d{8}_\d{6}\.sql$"))
                return BadRequest(new { mensaje = "Nombre de archivo no valido" });

            var filePath = Path.Combine(respaldosFolder, nombreLimpio);

            if (!System.IO.File.Exists(filePath))
                return NotFound(new { mensaje = "Archivo no encontrado" });

            System.IO.File.Delete(filePath);

            return Ok(new { mensaje = "Respaldo eliminado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar respaldo", error = ex.Message });
        }
    }

    // Genera un respaldo real: estructura (CREATE TABLE) y datos (INSERT) de todas las tablas.
    private async Task<string> GenerarBackupAsync()
    {
        var script = new StringBuilder();

        script.AppendLine("-- ===================================================");
        script.AppendLine("-- RESPALDO - Sistema Academico INA");
        script.AppendLine($"-- Fecha: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        script.AppendLine("-- ===================================================");
        script.AppendLine();

        var conn = _context.Database.GetDbConnection();
        var abierto = false;
        if (conn.State != System.Data.ConnectionState.Open)
        {
            await conn.OpenAsync();
            abierto = true;
        }

        try
        {
            var tablas = new List<string>();
            using (var cmdTablas = conn.CreateCommand())
            {
                cmdTablas.CommandText = "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE' ORDER BY table_name";
                using var reader = await cmdTablas.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                    tablas.Add(reader.GetString(0));
            }

            foreach (var tabla in tablas)
            {
                var columnas = new List<(string Nombre, string Tipo, string Nullable, string Default, string Extra)>();
                using (var cmdCols = conn.CreateCommand())
                {
                    cmdCols.CommandText = "SELECT column_name, column_type, is_nullable, column_default, column_key, extra FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @t ORDER BY ordinal_position";
                    var p = cmdCols.CreateParameter();
                    p.ParameterName = "@t";
                    p.Value = tabla;
                    cmdCols.Parameters.Add(p);

                    using var r = await cmdCols.ExecuteReaderAsync();
                    while (await r.ReadAsync())
                        columnas.Add((r.GetString(0), r.GetString(1), r.GetString(2), r.IsDBNull(3) ? "" : r.GetString(3), r.IsDBNull(5) ? "" : r.GetString(5)));
                }

                // CREATE TABLE
                script.AppendLine($"DROP TABLE IF EXISTS `{tabla}`;");
                script.AppendLine($"CREATE TABLE `{tabla}` (");
                var defs = new List<string>();
                string? pk = null;
                foreach (var c in columnas)
                {
                    var def = $"  `{c.Nombre}` {c.Tipo}";
                    if (c.Nullable == "NO" && !c.Extra.Contains("auto_increment"))
                        def += " NOT NULL";
                    if (c.Extra.Contains("auto_increment"))
                    {
                        def += " AUTO_INCREMENT";
                        if (pk == null) pk = c.Nombre;
                    }
                    else if (c.Default.Length > 0)
                    {
                        def += $" DEFAULT {c.Default}";
                    }
                    defs.Add(def);
                }
                script.AppendLine(string.Join(",\n", defs));
                if (pk != null)
                    script.AppendLine($",\n  PRIMARY KEY (`{pk}`)");
                script.AppendLine(");");

                // INSERT de datos
                long filas = 0;
                using (var cmdData = conn.CreateCommand())
                {
                    cmdData.CommandText = $"SELECT * FROM `{tabla}`";
                    using var rd = await cmdData.ExecuteReaderAsync();
                    while (await rd.ReadAsync())
                    {
                        var valores = new List<string>(rd.FieldCount);
                        for (var i = 0; i < rd.FieldCount; i++)
                        {
                            if (rd.IsDBNull(i))
                            {
                                valores.Add("NULL");
                                continue;
                            }
                            var v = rd.GetValue(i);
                            switch (v)
                            {
                                case DateTime dt:
                                    valores.Add($"'{dt:yyyy-MM-dd HH:mm:ss}'");
                                    break;
                                case bool b:
                                    valores.Add(b ? "1" : "0");
                                    break;
                                case byte[] bytes:
                                    valores.Add("'" + Convert.ToBase64String(bytes) + "'");
                                    break;
                                case int or long or short or byte or sbyte or ushort or uint or ulong or decimal or double or float:
                                    valores.Add(Convert.ToString(v, CultureInfo.InvariantCulture) ?? "NULL");
                                    break;
                                default:
                                    valores.Add("'" + (v.ToString() ?? "").Replace("'", "''") + "'");
                                    break;
                            }
                        }
                        script.AppendLine($"INSERT INTO `{tabla}` VALUES ({string.Join(", ", valores)});");
                        filas++;
                    }
                }
                script.AppendLine($"-- {filas} fila(s) en `{tabla}`");
                script.AppendLine();
            }
        }
        finally
        {
            if (abierto) await conn.CloseAsync();
        }

        return script.ToString();
    }
}