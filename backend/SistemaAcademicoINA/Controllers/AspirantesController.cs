using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Helpers;
using SistemaAcademicoINA.Models.Entities;
using SistemaAcademicoINA.Services;
using BCryptHelper = BCrypt.Net.BCrypt;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona aspirantes (solicitudes de ingreso), sus documentos, cupos por especialidad y la conversión a estudiantes.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AspirantesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly IEmailService _emailService;
    private readonly JwtHelper _jwtHelper;
    private readonly IConfiguration _configuration;
    private readonly PlantillasCorreoService _plantillasCorreo;

    public AspirantesController(ApplicationDbContext context, IWebHostEnvironment environment, IEmailService emailService, JwtHelper jwtHelper, IConfiguration configuration, PlantillasCorreoService plantillasCorreo)
    {
        _context = context;
        _environment = environment;
        _emailService = emailService;
        _jwtHelper = jwtHelper;
        _configuration = configuration;
        _plantillasCorreo = plantillasCorreo;
    }

    // GET: obtiene la lista de aspirantes ordenados por fecha de solicitud.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Aspirante>>> GetAspirantes()
    {
        try
        {
            var aspirantes = await _context.Aspirantes
                .OrderByDescending(a => a.FechaSolicitud)
                .ToListAsync();
            return Ok(aspirantes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener aspirantes", error = ex.Message });
        }
    }

    // GET: obtiene un aspirante por su id.
    [HttpGet("{id}")]
    public async Task<ActionResult<Aspirante>> GetAspirante(int id)
    {
        var aspirante = await _context.Aspirantes.FindAsync(id);
        if (aspirante == null)
            return NotFound();
        return aspirante;
    }

    // GET: devuelve los documentos (foto y notas en PDF) de un aspirante con sus URLs.
    [HttpGet("{id}/documentos")]
    public async Task<IActionResult> GetDocumentos(int id)
    {
        try
        {
            var aspirante = await _context.Aspirantes.FindAsync(id);
            if (aspirante == null)
                return NotFound(new { mensaje = "Aspirante no encontrado" });

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            string fotoUrl = null;
            string pdfUrl = null;

            if (!string.IsNullOrEmpty(aspirante.Foto))
            {
                var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", aspirante.Foto.TrimStart('/'));
                if (System.IO.File.Exists(physicalPath))
                {
                    fotoUrl = $"{baseUrl}{aspirante.Foto}";
                }
            }

            if (!string.IsNullOrEmpty(aspirante.ArchivoNotasEscuela))
            {
                var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", aspirante.ArchivoNotasEscuela.TrimStart('/'));
                if (System.IO.File.Exists(physicalPath))
                {
                    pdfUrl = $"{baseUrl}{aspirante.ArchivoNotasEscuela}";
                }
            }

            var documentosUrl = new List<object>();
            if (!string.IsNullOrEmpty(aspirante.Documentos))
            {
                using var doc = System.Text.Json.JsonDocument.Parse(aspirante.Documentos);
                foreach (var elemento in doc.RootElement.EnumerateArray())
                {
                    var tipo = elemento.TryGetProperty("tipo", out var tp) ? tp.GetString() : null;
                    var nombre = elemento.TryGetProperty("nombre", out var np) ? np.GetString() : null;
                    var ruta = elemento.TryGetProperty("archivo", out var ar) ? ar.GetString() : null;

                    if (string.IsNullOrEmpty(ruta)) continue;
                    var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", ruta.TrimStart('/'));
                    if (!System.IO.File.Exists(physicalPath)) continue;

                    documentosUrl.Add(new { tipo, nombre, archivo = ruta, url = $"{baseUrl}{ruta}" });
                }
            }

            return Ok(new
            {
                aspirante.IdAspirante,
                aspirante.Nombres,
                aspirante.Apellidos,
                aspirante.Foto,
                aspirante.ArchivoNotasEscuela,
                aspirante.PromedioAnterior,
                aspirante.Correo,
                aspirante.Telefono,
                fotoUrl = fotoUrl,
                pdfUrl = pdfUrl,
                documentos = documentosUrl,
                carpeta = $"/uploads/aspirantes/{aspirante.IdAspirante}/"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al obtener documentos: {ex.Message}");
            return StatusCode(500, new { mensaje = "Error al obtener documentos del aspirante" });
        }
    }

    // GET: verificación pública de datos duplicados para el formulario de preinscripción.
    [AllowAnonymous]
    [HttpGet("verificar")]
    public async Task<IActionResult> VerificarDuplicadosPreinscripcion(
        [FromQuery] string? dui, [FromQuery] string? nie, [FromQuery] string? correo, [FromQuery] string? emailEncargado)
    {
        try
        {
            var duplicado = await BuscarDuplicadoAsync(dui, nie, correo, emailEncargado);
            if (duplicado != null)
                return Ok(new
                {
                    existe = true,
                    campo = duplicado.Value.Campo,
                    tipo = duplicado.Value.Tipo,
                    nombre = duplicado.Value.Nombre,
                    mensaje = duplicado.Value.Mensaje
                });

            return Ok(new { existe = false });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al verificar datos", error = ex.Message });
        }
    }

    // POST: registra un nuevo aspirante con sus archivos (foto y PDF) subidos al servidor.
    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<Aspirante>> PostAspirante([FromForm] AspiranteRequestConArchivos request)
    {
        try
        {
            // =============================================
            // VALIDACIÓN DE DUPLICADOS (preinscripción pública)
            // =============================================
            var duplicado = await BuscarDuplicadoAsync(request.Dui, request.Nie, request.Correo, request.EmailEncargado);
            if (duplicado != null)
                return Conflict(new { mensaje = duplicado.Value.Mensaje, campo = duplicado.Value.Campo, duplicado = true });

            // =============================================
            // ✅ VALIDACIÓN DE EDAD CORREGIDA: entre 14 y 19 años
            // =============================================
            if (request.FechaNacimiento.HasValue)
            {
                var fechaNacimiento = request.FechaNacimiento.Value.Date;
                var fechaActual = DateTime.Today;

                // Calcular edad exacta
                var edad = fechaActual.Year - fechaNacimiento.Year;
                if (fechaNacimiento.Date > fechaActual.AddYears(-edad))
                {
                    edad--;
                }

                const int EDAD_MINIMA = 14;
                const int EDAD_MAXIMA = 19;

                if (edad < EDAD_MINIMA)
                {
                    return BadRequest(new
                    {
                        mensaje = $"La edad mínima permitida es de {EDAD_MINIMA} años. Tienes {edad} años. Verifique la fecha de nacimiento.",
                        edad = edad
                    });
                }

                if (edad > EDAD_MAXIMA)
                {
                    return BadRequest(new
                    {
                        mensaje = $"La edad máxima permitida es de {EDAD_MAXIMA} años. Tienes {edad} años. Verifique la fecha de nacimiento.",
                        edad = edad
                    });
                }
            }
            else
            {
                return BadRequest(new { mensaje = "La fecha de nacimiento es requerida" });
            }

            var aspirante = new Aspirante
            {
                Nombres = request.Nombres ?? "",
                Apellidos = request.Apellidos ?? "",
                Dui = request.Dui,
                Nie = request.Nie,
                CarnetMenoridad = request.CarnetMenoridad,
                FechaNacimiento = request.FechaNacimiento,
                Genero = request.Genero,
                Telefono = request.Telefono,
                Correo = request.Correo,
                EmailEncargado = request.EmailEncargado,
                EscuelaProcedencia = request.EscuelaProcedencia,
                PromedioAnterior = request.PromedioAnterior,
                NivelAspira = request.NivelAspira,
                EspecialidadAspira = request.EspecialidadAspira,
                FechaSolicitud = DateTime.Now,
                EstadoSolicitud = "Pendiente"
            };

            _context.Aspirantes.Add(aspirante);
            await _context.SaveChangesAsync();

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "aspirantes", aspirante.IdAspirante.ToString());
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string fotoPath = null;
            string pdfPath = null;

            if (request.Foto != null && request.Foto.Length > 0)
            {
                var fileName = $"foto_{Path.GetFileName(request.Foto.FileName)}";
                var fullPath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await request.Foto.CopyToAsync(stream);
                }
                fotoPath = $"/uploads/aspirantes/{aspirante.IdAspirante}/{fileName}";
            }

            if (request.Pdf != null && request.Pdf.Length > 0)
            {
                var fileName = $"documento_{Path.GetFileName(request.Pdf.FileName)}";
                var fullPath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await request.Pdf.CopyToAsync(stream);
                }
                pdfPath = $"/uploads/aspirantes/{aspirante.IdAspirante}/{fileName}";
            }

            aspirante.Foto = fotoPath;
            aspirante.ArchivoNotasEscuela = pdfPath;

            // =============================================
            // DOCUMENTOS MÚLTIPLES
            // =============================================
            if (request.Documentos != null && request.Documentos.Count > 0)
            {
                var documentosJson = await GuardarDocumentosAsync(request.Documentos, request.DocumentosInfo, aspirante.IdAspirante);
                if (documentosJson != null)
                {
                    aspirante.Documentos = documentosJson;

                    if (string.IsNullOrEmpty(aspirante.ArchivoNotasEscuela))
                    {
                        using var doc = System.Text.Json.JsonDocument.Parse(documentosJson);
                        foreach (var elemento in doc.RootElement.EnumerateArray())
                        {
                            if (elemento.TryGetProperty("tipo", out var tipoProp) &&
                                tipoProp.GetString()?.Contains("Notas", StringComparison.OrdinalIgnoreCase) == true &&
                                elemento.TryGetProperty("archivo", out var archivoProp))
                            {
                                aspirante.ArchivoNotasEscuela = archivoProp.GetString();
                                break;
                            }
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Registrar en auditoria
            try
            {
                var auditoria = new Auditoria
                {
                    Usuario = "Sistema",
                    Accion = "Crear",
                    Detalle = $"Nuevo aspirante registrado: {aspirante.Nombres} {aspirante.Apellidos} (ID: {aspirante.IdAspirante})",
                    Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    Fecha = DateTime.Now,
                    CreatedAt = DateTime.Now
                };
                _context.Auditoria.Add(auditoria);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al registrar auditoria: {ex.Message}");
            }

            return Ok(new
            {
                mensaje = "Aspirante registrado correctamente",
                id = aspirante.IdAspirante,
                foto = fotoPath,
                pdf = pdfPath
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear aspirante", error = ex.Message });
        }
    }

    // Guarda en disco los documentos múltiples de un aspirante (uno por tipo) y
    // devuelve el JSON con { tipo, nombre, archivo } para almacenarlo en la columna Documentos.
    private async Task<string?> GuardarDocumentosAsync(List<IFormFile> documentos, string? documentosInfo, int idAspirante)
    {
        try
        {
            var info = new List<(string Tipo, string Nombre)>();
            if (!string.IsNullOrWhiteSpace(documentosInfo))
            {
                using var doc = System.Text.Json.JsonDocument.Parse(documentosInfo);
                foreach (var el in doc.RootElement.EnumerateArray())
                {
                    var tipo = el.TryGetProperty("tipo", out var t) ? t.GetString() ?? "Documento" : "Documento";
                    var nombre = el.TryGetProperty("nombre", out var n) ? n.GetString() ?? tipo : tipo;
                    info.Add((tipo, nombre));
                }
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "aspirantes", idAspirante.ToString());
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var registros = new List<object>();
            for (int i = 0; i < documentos.Count; i++)
            {
                var archivo = documentos[i];
                if (archivo == null || archivo.Length == 0) continue;

                var tipo = i < info.Count ? info[i].Tipo : "Documento";
                var nombreOriginal = i < info.Count && !string.IsNullOrWhiteSpace(info[i].Nombre) ? info[i].Nombre : archivo.FileName;

                var slug = new string(tipo.Where(char.IsLetterOrDigit).ToArray());
                if (string.IsNullOrEmpty(slug)) slug = "documento";
                if (slug.Length > 40) slug = slug[..40];

                var fileName = $"{slug}_{i + 1}_{Path.GetFileName(nombreOriginal)}";
                var fullPath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await archivo.CopyToAsync(stream);
                }

                registros.Add(new
                {
                    tipo,
                    nombre = nombreOriginal,
                    archivo = $"/uploads/aspirantes/{idAspirante}/{fileName}"
                });
            }

            return registros.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(registros) : null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al guardar documentos: {ex.Message}");
            return null;
        }
    }

    // POST: registra la nota del examen de admisión de un aspirante.
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost("sp_registrar_nota_examen")]
    public async Task<IActionResult> RegistrarNotaExamen([FromBody] RegistrarNotaExamenRequest request)
    {
        try
        {
            var aspirante = await _context.Aspirantes.FindAsync(request.p_id_aspirante);
            if (aspirante == null)
                return NotFound(new { mensaje = "Aspirante no encontrado" });

            if (request.p_nota_examen < 0 || request.p_nota_examen > 10)
                return BadRequest(new { mensaje = "La nota debe estar entre 0 y 10" });

            aspirante.NotaExamen = request.p_nota_examen;
            await _context.SaveChangesAsync();

            // Registrar en auditoria
            try
            {
                var auditoria = new Auditoria
                {
                    Usuario = "Direccion",
                    Accion = "Actualizar",
                    Detalle = $"Nota de examen registrada para aspirante {aspirante.Nombres} {aspirante.Apellidos}: {request.p_nota_examen}",
                    Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    Fecha = DateTime.Now,
                    CreatedAt = DateTime.Now
                };
                _context.Auditoria.Add(auditoria);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al registrar auditoria: {ex.Message}");
            }

            return Ok(new { mensaje = "Nota registrada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al registrar nota", error = ex.Message });
        }
    }

    // PUT: aprueba la solicitud de un aspirante asignándole la clase (Dirección).
    [Authorize(Roles = "Administrador,Director,Sub Director")]
    [HttpPut("aprobar/{id}")]
    public async Task<IActionResult> AprobarAspirante(int id, [FromBody] AprobarAspiranteRequest request)
    {
        try
        {
            var aspirante = await _context.Aspirantes.FindAsync(id);
            if (aspirante == null)
                return NotFound(new { mensaje = "Aspirante no encontrado" });

            if (aspirante.EstadoSolicitud == "Aprobado")
                return BadRequest(new { mensaje = "Este aspirante ya fue aprobado. La matrícula la realiza Registro Académico." });

            if (aspirante.EstadoSolicitud == "Rechazado")
                return BadRequest(new { mensaje = "No se puede aprobar un aspirante rechazado" });

            if (aspirante.IdEstudianteGenerado.HasValue)
                return BadRequest(new { mensaje = "Este aspirante ya fue matriculado como estudiante" });

            if (string.IsNullOrWhiteSpace(aspirante.Nie))
                return BadRequest(new { mensaje = "El aspirante no tiene NIE registrado. Agregue el NIE antes de aprobar la solicitud." });

            if (!aspirante.NotaExamen.HasValue && !aspirante.Exonerado)
                return BadRequest(new { mensaje = "El aspirante debe tener nota de examen registrada o estar exonerado para ser aprobado" });

            if (aspirante.NotaExamen.HasValue && aspirante.NotaExamen < 6)
                return BadRequest(new { mensaje = "La nota mínima para aprobar es 6" });

            var clase = await _context.Clases
                .FirstOrDefaultAsync(c => c.IdClase == request.IdClaseAsignada);
            if (clase == null)
                return BadRequest(new { mensaje = "La clase asignada no existe" });

            if (!clase.Estado)
                return BadRequest(new { mensaje = "La clase asignada está inactiva" });

            if (clase.AnioLectivo != DateTime.Now.Year)
                return BadRequest(new { mensaje = $"La clase asignada pertenece al año lectivo {clase.AnioLectivo}, no al actual" });

            if (clase.CupoActual >= clase.CupoMaximo)
                return BadRequest(new { mensaje = "La clase asignada no tiene cupos disponibles" });

            aspirante.EstadoSolicitud = "Aprobado";
            aspirante.FechaAprobacion = DateTime.Now;
            aspirante.AprobadoPor = string.IsNullOrWhiteSpace(request.AprobadoPor) ? "Direccion" : request.AprobadoPor;
            aspirante.IdClaseAsignada = request.IdClaseAsignada;
            if (clase.IdEspecialidad.HasValue)
                aspirante.EspecialidadAspira = clase.IdEspecialidad.Value;

            await _context.SaveChangesAsync();

            // Registrar en auditoria
            try
            {
                var auditoria = new Auditoria
                {
                    Usuario = aspirante.AprobadoPor,
                    Accion = "Aprobar",
                    Detalle = $"Aspirante {aspirante.Nombres} {aspirante.Apellidos} aprobado y asignado a la clase {clase.NombreClase} (pendiente de matrícula por Registro Académico)",
                    Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    Fecha = DateTime.Now,
                    CreatedAt = DateTime.Now
                };
                _context.Auditoria.Add(auditoria);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al registrar auditoria: {ex.Message}");
            }

            return Ok(new { mensaje = "Aspirante aprobado correctamente. La matrícula la realizará Registro Académico." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al aprobar aspirante {id}: {ex}");
            return StatusCode(500, new { mensaje = "Error al aprobar el aspirante. Verifique los datos e intente nuevamente" });
        }
    }

    // POST: matrícula formal del aspirante aprobado (Registro Académico).
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost("matricular/{id}")]
    public async Task<IActionResult> MatricularAspirante(int id, [FromBody] MatricularAspiranteRequest request)
    {
        try
        {
            var aspirante = await _context.Aspirantes.FindAsync(id);
            if (aspirante == null)
                return NotFound(new { mensaje = "Aspirante no encontrado" });

            if (aspirante.EstadoSolicitud != "Aprobado")
                return BadRequest(new { mensaje = "Solo se pueden matricular aspirantes aprobados por Dirección" });

            if (aspirante.IdEstudianteGenerado.HasValue)
                return BadRequest(new { mensaje = "Este aspirante ya fue matriculado como estudiante" });

            if (string.IsNullOrWhiteSpace(aspirante.Nie))
                return BadRequest(new { mensaje = "El aspirante no tiene NIE registrado. Agregue el NIE antes de matricular." });

            if (!aspirante.IdClaseAsignada.HasValue)
                return BadRequest(new { mensaje = "El aspirante aún no tiene una clase asignada. Dirección debe aprobarlo primero." });

            var clase = await _context.Clases
                .Include(c => c.Nivel)
                .Include(c => c.Especialidad)
                .FirstOrDefaultAsync(c => c.IdClase == aspirante.IdClaseAsignada.Value);
            if (clase == null)
                return BadRequest(new { mensaje = "La clase asignada no existe" });

            if (!clase.Estado)
                return BadRequest(new { mensaje = "La clase asignada está inactiva" });

            if (clase.AnioLectivo != DateTime.Now.Year)
                return BadRequest(new { mensaje = $"La clase asignada pertenece al año lectivo {clase.AnioLectivo}, no al actual" });

            if (clase.CupoActual >= clase.CupoMaximo)
                return BadRequest(new { mensaje = "La clase asignada no tiene cupos disponibles" });

            var especialidadClase = clase.IdEspecialidad ?? 0;
            var seccionClase = string.IsNullOrEmpty(clase.Seccion) ? "A" : clase.Seccion;

            var cupo = await _context.CuposEspecialidades
                .FirstOrDefaultAsync(c => c.IdEspecialidad == especialidadClase
                    && c.Seccion == seccionClase
                    && c.AnioLectivo == DateTime.Now.Year);

            if (cupo != null && cupo.CuposOcupados >= cupo.CuposTotales)
                return BadRequest(new { mensaje = "No hay cupos disponibles en esta especialidad/seccion" });

            // ============================================================
            // VALIDACIONES PROFESIONALES DE DUPLICADOS
            // ============================================================

            if (!string.IsNullOrEmpty(aspirante.Dui))
            {
                var estPorDui = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.Dui == aspirante.Dui);
                if (estPorDui != null)
                    return Conflict(new { mensaje = $"Ya existe un estudiante matriculado con el DUI {aspirante.Dui} ({estPorDui.Nombres} {estPorDui.Apellidos}). No se puede registrar la misma inscripción dos veces.", duplicado = true });
            }

            if (!string.IsNullOrEmpty(aspirante.Nie))
            {
                var estPorNie = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.Nie == aspirante.Nie);
                if (estPorNie != null)
                    return Conflict(new { mensaje = $"Ya existe un estudiante matriculado con el NIE {aspirante.Nie} ({estPorNie.Nombres} {estPorNie.Apellidos}). No se puede registrar la misma inscripción dos veces.", duplicado = true });
            }

            if (!string.IsNullOrEmpty(aspirante.Correo)
                && await _context.Estudiantes.AnyAsync(e => e.CorreoEstudiante == aspirante.Correo))
                return Conflict(new { mensaje = $"Ya existe un estudiante matriculado con el correo {aspirante.Correo}. No se puede registrar la misma inscripción dos veces.", duplicado = true });

            if (!string.IsNullOrEmpty(aspirante.Correo)
                && await _context.Usuarios.AnyAsync(u => u.Correo == aspirante.Correo))
                return Conflict(new { mensaje = $"El correo {aspirante.Correo} ya está registrado en el sistema. No se puede matricular la misma cuenta." });

            if (!string.IsNullOrEmpty(aspirante.Dui) || !string.IsNullOrEmpty(aspirante.Nie))
            {
                var solicitudDuplicada = await _context.Aspirantes
                    .Where(a => a.IdAspirante != id
                        && (a.EstadoSolicitud == "Pendiente" || a.EstadoSolicitud == "Preseleccionado" || a.EstadoSolicitud == "En Espera")
                        && ((aspirante.Dui != null && a.Dui == aspirante.Dui)
                            || (aspirante.Nie != null && a.Nie == aspirante.Nie)))
                    .Select(a => new { a.IdAspirante, a.Nombres, a.Apellidos })
                    .FirstOrDefaultAsync();

                if (solicitudDuplicada != null)
                    return Conflict(new { mensaje = $"Ya existe otra solicitud de inscripción con el mismo DUI o NIE (aspirante {solicitudDuplicada.IdAspirante}: {solicitudDuplicada.Nombres} {solicitudDuplicada.Apellidos}). Rechace la solicitud duplicada antes de matricular esta.", duplicado = true });
            }

            var anioLectivo = DateTime.Now.Year;
            var fechaMatricula = request.FechaMatricula ?? DateTime.Now;
            var matriculadoPor = string.IsNullOrWhiteSpace(request.MatriculadoPor) ? "Registro Academico" : request.MatriculadoPor;

            await using var transaction = await _context.Database.BeginTransactionAsync();

            var estudiante = new Estudiante
            {
                Nombres = aspirante.Nombres,
                Apellidos = aspirante.Apellidos,
                CodigoEstudiante = "TEMP-" + Guid.NewGuid().ToString("N").Substring(0, 8),
                Dui = aspirante.Dui,
                Nie = aspirante.Nie,
                IdClase = clase.IdClase,
                AnoIngreso = anioLectivo,
                FechaMatricula = fechaMatricula,
                Estado = true,
                IdAspiranteOrigen = aspirante.IdAspirante,
                CorreoEstudiante = aspirante.Correo,
                IdRol = 7,
                TelefonoMovil = string.IsNullOrWhiteSpace(request.TelefonoMovil) ? aspirante.Telefono : request.TelefonoMovil,
                TelefonoFijo = string.IsNullOrWhiteSpace(request.TelefonoFijo) ? aspirante.TelefonoFijo : request.TelefonoFijo,
                Direccion = string.IsNullOrWhiteSpace(request.Direccion) ? aspirante.Direccion : request.Direccion,
                TipoSangre = aspirante.TipoSangre,
                Alergias = aspirante.Alergias,
                NombrePadre = aspirante.NombrePadre,
                DuiPadre = aspirante.DuiPadre,
                TelefonoPadre = aspirante.TelefonoPadre,
                NombreMadre = aspirante.NombreMadre,
                DuiMadre = aspirante.DuiMadre,
                TelefonoMadre = aspirante.TelefonoMadre,
                NombreEncargado = aspirante.NombreEncargado,
                TelefonoEncargado = aspirante.TelefonoEncargado,
                ParentescoEncargado = aspirante.ParentescoEncargado,
                EmailEncargado = aspirante.EmailEncargado,
                TelefonoEmergencia = aspirante.TelefonoEmergencia,
                NombreContactoEmergencia = aspirante.NombreContactoEmergencia,
                ParentescoEmergencia = aspirante.ParentescoEmergencia
            };

            _context.Estudiantes.Add(estudiante);
            await _context.SaveChangesAsync();

            // Código de estudiante definitivo basado en el id real asignado por la base de datos.
            estudiante.CodigoEstudiante = $"{anioLectivo}-{estudiante.IdEstudiante.ToString().PadLeft(5, '0')}-INA";
            await _context.SaveChangesAsync();

            // Inscripción formal 'Nuevo Ingreso' con la clase fijada por Dirección.
            var inscripcion = new Inscripcion
            {
                IdEstudiante = estudiante.IdEstudiante,
                IdClase = clase.IdClase,
                AnioLectivo = anioLectivo,
                FechaInscripcion = fechaMatricula,
                FechaMatricula = fechaMatricula,
                TipoInscripcion = "Nuevo Ingreso",
                EstadoInscripcion = "Confirmada",
                EstadoAprobacion = "Aprobada",
                FechaAprobacion = DateTime.Now,
                AprobadoPor = matriculadoPor,
                NumeroExpediente = string.IsNullOrWhiteSpace(request.NumeroExpediente) ? aspirante.NumeroExpediente : request.NumeroExpediente,
                NumeroCarnet = request.NumeroCarnet,
                DocumentosPresentados = string.IsNullOrWhiteSpace(request.DocumentosPresentados) ? aspirante.DocumentosPresentados : request.DocumentosPresentados,
                IdAspiranteOrigen = aspirante.IdAspirante,
                Nie = estudiante.Nie,
                CarnetMenoridad = aspirante.CarnetMenoridad
            };

            _context.Inscripciones.Add(inscripcion);
            await _context.SaveChangesAsync();

            if (clase != null)
                clase.CupoActual++;

            if (cupo != null)
                cupo.CuposOcupados++;

            aspirante.IdEstudianteGenerado = estudiante.IdEstudiante;
            aspirante.IdInscripcionGenerada = inscripcion.IdInscripciones;
            if (!string.IsNullOrWhiteSpace(inscripcion.NumeroExpediente))
                aspirante.NumeroExpediente = inscripcion.NumeroExpediente;

            // Creación del usuario de acceso (pendiente de activación) dentro de la misma transacción.
            // El correo ya fue validado como no registrado; se crea sin contraseña (estado pendiente).
            var enviarCorreo = request.EnviarCorreo != false; // por defecto TRUE (automático)
            if (!string.IsNullOrEmpty(aspirante.Correo))
            {
                var nuevoUsuario = new Usuario
                {
                    Codigo = estudiante.CodigoEstudiante,
                    Nombres = aspirante.Nombres ?? "",
                    Apellidos = aspirante.Apellidos ?? "",
                    Correo = aspirante.Correo,
                    Contrasena = null, // sin acceso hasta activar la cuenta
                    RolId = 7,         // Estudiante
                    Estado = false,    // inactivo hasta activación
                    EstadoActivacion = enviarCorreo ? "PendienteActivacion" : "PendienteEnvioManual"
                };

                _context.Usuarios.Add(nuevoUsuario);
                await _context.SaveChangesAsync();

                // En modo automático se genera el token y se envía el correo; en modo manual
                // NO se genera token: quedará como "Pendiente manual" y se generará al reenviar desde el panel.
                if (enviarCorreo)
                {
                    var tokenActivacion = _jwtHelper.GenerarTokenActivacion(nuevoUsuario.IdUsuario, aspirante.Correo);
                    _context.TokensActivacion.Add(new TokenActivacion
                    {
                        UsuarioId = nuevoUsuario.IdUsuario,
                        Token = tokenActivacion,
                        FechaCreacion = DateTime.Now,
                        FechaExpiracion = DateTime.Now.AddHours(48),
                        Usado = false,
                        CreatedAt = DateTime.Now
                    });
                    await _context.SaveChangesAsync();

                    await _emailService.EncolarAsync(new EmailMessage
                    {
                        Destinatario = aspirante.Correo,
                        Asunto = "¡Felicidades! Has sido aceptado en el INA",
                        CuerpoHtml = await GenerarHtmlBienvenida($"{aspirante.Nombres} {aspirante.Apellidos}", tokenActivacion)
                    });
                }
            }

            // ============================================================
            // CREAR USUARIO ENCARGADO (si hay email de encargado)
            // ============================================================
            if (!string.IsNullOrEmpty(aspirante.EmailEncargado))
            {
                // Validar que el email del encargado no esté ya registrado
                if (await _context.Usuarios.AnyAsync(u => u.Correo == aspirante.EmailEncargado))
                {
                    // Log warning pero no bloquear la matrícula
                    Console.WriteLine($"ADVERTENCIA: Email de encargado {aspirante.EmailEncargado} ya registrado en el sistema. No se crea usuario de encargado.");
                }
                else
                {
                    var usuarioEncargado = new Usuario
                    {
                        Codigo = "ENC-" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper(),
                        Nombres = aspirante.NombreEncargado ?? "",
                        Apellidos = aspirante.Apellidos ?? "",
                        Correo = aspirante.EmailEncargado,
                        Contrasena = null,
                        RolId = 8,         // Encargado
                        Estado = false,    // inactivo hasta activación
                        EstadoActivacion = enviarCorreo ? "PendienteActivacion" : "PendienteEnvioManual"
                    };

                    _context.Usuarios.Add(usuarioEncargado);
                    await _context.SaveChangesAsync();

                    // ============================================================
                    // CREAR PERSONA Y RELACIÓN FAMILIAR PARA EL ENCARGADO
                    // ============================================================
                    var personaEncargado = new Persona
                    {
                        TipoDocumento = "DUI",
                        NumeroDocumento = aspirante.DuiEncargado ?? "",
                        Nombres = aspirante.NombreEncargado ?? "",
                        Apellidos = aspirante.Apellidos ?? "",
                        TelefonoPrincipal = aspirante.TelefonoEncargado ?? "",
                        Correo = aspirante.EmailEncargado,
                        IdUsuario = usuarioEncargado.IdUsuario
                    };
                    _context.Personas.Add(personaEncargado);
                    await _context.SaveChangesAsync();

                    var relacionFamiliar = new RelacionFamiliar
                    {
                        IdEstudiante = estudiante.IdEstudiante,
                        IdPersona = personaEncargado.IdPersona,
                        Parentesco = aspirante.ParentescoEncargado ?? "Encargado",
                        ViveConEstudiante = true,
                        RecibeComunicados = true
                    };
                    _context.RelacionesFamiliares.Add(relacionFamiliar);
                    await _context.SaveChangesAsync();

                    if (enviarCorreo)
                    {
                        var tokenActivacionEncargado = _jwtHelper.GenerarTokenActivacion(usuarioEncargado.IdUsuario, aspirante.EmailEncargado);
                        _context.TokensActivacion.Add(new TokenActivacion
                        {
                            UsuarioId = usuarioEncargado.IdUsuario,
                            Token = tokenActivacionEncargado,
                            FechaCreacion = DateTime.Now,
                            FechaExpiracion = DateTime.Now.AddHours(48),
                            Usado = false,
                            CreatedAt = DateTime.Now
                        });
                        await _context.SaveChangesAsync();

                        // Enviar email de activación al encargado usando template específico
                        await _emailService.EncolarAsync(new EmailMessage
                        {
                            Destinatario = aspirante.EmailEncargado,
                            Asunto = "¡Felicidades! Su hijo(a) ha sido matriculado en el INA",
                            CuerpoHtml = await GenerarHtmlBienvenidaEncargado(
                                $"{aspirante.NombreEncargado}",
                                $"{aspirante.Nombres} {aspirante.Apellidos}",
                                tokenActivacionEncargado)
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Registrar en auditoria: matrícula + correo de activación (auto/manual).
            try
            {
                _context.Auditoria.Add(new Auditoria
                {
                    Usuario = matriculadoPor,
                    Accion = "Matricular",
                    Detalle = $"Matrícula aceptada por {matriculadoPor} el {DateTime.Now:dd/MM/yyyy HH:mm}. Aspirante {aspirante.Nombres} {aspirante.Apellidos} matriculado como estudiante (ID: {estudiante.IdEstudiante}, código {estudiante.CodigoEstudiante}) en la clase {clase.NombreClase}",
                    Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    Fecha = DateTime.Now,
                    CreatedAt = DateTime.Now
                });

                if (!string.IsNullOrEmpty(aspirante.Correo))
                {
                    _context.Auditoria.Add(new Auditoria
                    {
                        Usuario = matriculadoPor,
                        Accion = "CorreoActivacion",
                        Detalle = enviarCorreo
                            ? $"Correo de activación enviado a {aspirante.Correo} (automático)"
                            : $"Correo de activación pendiente de envío manual a {aspirante.Correo}",
                        Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                        Fecha = DateTime.Now,
                        CreatedAt = DateTime.Now
                    });
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al registrar auditoria: {ex.Message}");
            }

            return Ok(new
            {
                mensaje = "Estudiante matriculado exitosamente",
                estudianteId = estudiante.IdEstudiante,
                codigoEstudiante = estudiante.CodigoEstudiante,
                inscripcionId = inscripcion.IdInscripciones
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al matricular aspirante {id}: {ex}");
            return StatusCode(500, new { mensaje = "Error al matricular el estudiante. Verifique los datos e intente nuevamente" });
        }
    }

    // PUT: rechaza la solicitud de un aspirante con el motivo indicado.
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("rechazar/{id}")]
    public async Task<IActionResult> RechazarAspirante(int id, [FromBody] RechazarAspiranteDTO dto)
    {
        try
        {
            var aspirante = await _context.Aspirantes.FindAsync(id);
            if (aspirante == null)
                return NotFound(new { mensaje = "Aspirante no encontrado" });

            if (aspirante.EstadoSolicitud == "Aprobado")
                return BadRequest(new { mensaje = "No se puede rechazar un aspirante que ya fue aprobado" });

            aspirante.EstadoSolicitud = "Rechazado";
            aspirante.FechaAprobacion = DateTime.Now;
            aspirante.AprobadoPor = dto.RechazadoPor;
            aspirante.Observaciones = dto.Motivo;

            await _context.SaveChangesAsync();

            // Registrar en auditoria
            try
            {
                var auditoria = new Auditoria
                {
                    Usuario = dto.RechazadoPor,
                    Accion = "Rechazar",
                    Detalle = $"Aspirante {aspirante.Nombres} {aspirante.Apellidos} rechazado. Motivo: {dto.Motivo}",
                    Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    Fecha = DateTime.Now,
                    CreatedAt = DateTime.Now
                };
                _context.Auditoria.Add(auditoria);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al registrar auditoria: {ex.Message}");
            }

            return Ok(new { mensaje = "Aspirante rechazado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al rechazar aspirante", error = ex.Message });
        }
    }

    // PUT: pone a un aspirante en lista de espera registrando la entrevista.
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("espera/{id}")]
    public async Task<IActionResult> PonerEnEspera(int id, [FromBody] EsperaAspiranteDTO dto)
    {
        try
        {
            var aspirante = await _context.Aspirantes.FindAsync(id);
            if (aspirante == null)
                return NotFound(new { mensaje = "Aspirante no encontrado" });

            if (aspirante.EstadoSolicitud == "Aprobado")
                return BadRequest(new { mensaje = "No se puede poner en espera un aspirante aprobado" });

            aspirante.EstadoSolicitud = "En Espera";
            aspirante.FechaEntrevista = DateTime.Now;
            aspirante.EntrevistadoPor = dto.EntrevistadoPor;
            aspirante.ObservacionesEntrevista = dto.Observacion;

            await _context.SaveChangesAsync();

            // Registrar en auditoria
            try
            {
                var auditoria = new Auditoria
                {
                    Usuario = dto.EntrevistadoPor,
                    Accion = "Actualizar",
                    Detalle = $"Aspirante {aspirante.Nombres} {aspirante.Apellidos} puesto en lista de espera",
                    Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    Fecha = DateTime.Now,
                    CreatedAt = DateTime.Now
                };
                _context.Auditoria.Add(auditoria);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al registrar auditoria: {ex.Message}");
            }

            return Ok(new { mensaje = "Aspirante puesto en lista de espera" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al poner en espera", error = ex.Message });
        }
    }

    // PUT: actualiza los datos personales y el estado de solicitud de un aspirante.
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAspirante(int id, [FromBody] UpdateAspiranteRequest request)
    {
        try
        {
            var aspirante = await _context.Aspirantes.FindAsync(id);
            if (aspirante == null)
                return NotFound(new { mensaje = "Aspirante no encontrado" });

            var correoAnterior = aspirante.Correo;

            if (!string.IsNullOrEmpty(request.Nombres))
                aspirante.Nombres = request.Nombres;

            if (!string.IsNullOrEmpty(request.Apellidos))
                aspirante.Apellidos = request.Apellidos;

            if (request.Dui != null)
                aspirante.Dui = request.Dui;

            if (!string.IsNullOrEmpty(request.Nie))
                aspirante.Nie = request.Nie;

            if (!string.IsNullOrEmpty(request.Correo))
                aspirante.Correo = request.Correo;

            if (request.Telefono != null)
                aspirante.Telefono = request.Telefono;

            if (request.EscuelaProcedencia != null)
                aspirante.EscuelaProcedencia = request.EscuelaProcedencia;

            if (request.NotaExamen.HasValue)
                aspirante.NotaExamen = request.NotaExamen.Value;

            aspirante.Exonerado = request.Exonerado;

            if (request.TipoExoneracion != null)
                aspirante.TipoExoneracion = request.TipoExoneracion;

            if (!string.IsNullOrEmpty(request.EstadoSolicitud))
            {
                var estadosValidos = new[] { "Pendiente", "En Espera", "Aprobado", "Rechazado" };
                if (estadosValidos.Contains(request.EstadoSolicitud))
                    aspirante.EstadoSolicitud = request.EstadoSolicitud;
            }

            // Sincronizar el correo (y nombres) con el estudiante y usuario vinculados, si existen.
            var correoCambio = !string.IsNullOrEmpty(request.Correo) && request.Correo != correoAnterior;
            if (correoCambio || !string.IsNullOrEmpty(request.Nombres) || !string.IsNullOrEmpty(request.Apellidos))
            {
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.IdAspiranteOrigen == aspirante.IdAspirante
                        || (aspirante.IdEstudianteGenerado.HasValue && e.IdEstudiante == aspirante.IdEstudianteGenerado.Value));

                if (estudiante != null)
                {
                    if (correoCambio)
                        estudiante.CorreoEstudiante = aspirante.Correo;
                    if (!string.IsNullOrEmpty(request.Nombres))
                        estudiante.Nombres = request.Nombres;
                    if (!string.IsNullOrEmpty(request.Apellidos))
                        estudiante.Apellidos = request.Apellidos;

                    var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Codigo == estudiante.CodigoEstudiante);
                    if (usuario != null)
                    {
                        if (correoCambio)
                            usuario.Correo = aspirante.Correo;
                        if (!string.IsNullOrEmpty(request.Nombres))
                            usuario.Nombres = request.Nombres;
                        if (!string.IsNullOrEmpty(request.Apellidos))
                            usuario.Apellidos = request.Apellidos;
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Registrar en auditoria
            try
            {
                var auditoria = new Auditoria
                {
                    Usuario = "Registro Academico",
                    Accion = "Actualizar",
                    Detalle = $"Aspirante {aspirante.Nombres} {aspirante.Apellidos} actualizado (ID: {aspirante.IdAspirante})",
                    Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    Fecha = DateTime.Now,
                    CreatedAt = DateTime.Now
                };
                _context.Auditoria.Add(auditoria);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al registrar auditoria: {ex.Message}");
            }

            return Ok(new { mensaje = "Aspirante actualizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar aspirante", error = ex.Message });
        }
    }

    // GET: obtiene los cupos disponibles por especialidad y sección.
    [HttpGet("cupos")]
    public async Task<IActionResult> GetCupos()
    {
        try
        {
            var cupos = await _context.CuposEspecialidades
                .OrderBy(c => c.IdEspecialidad)
                .ThenBy(c => c.Seccion)
                .ToListAsync();
            return Ok(cupos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener cupos", error = ex.Message });
        }
    }

    // PUT: actualiza la cantidad total de cupos de un registro existente.
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPut("cupos/{id}")]
    public async Task<IActionResult> ActualizarCupo(int id, [FromBody] ActualizarCupoRequest request)
    {
        try
        {
            var cupo = await _context.CuposEspecialidades.FindAsync(id);
            if (cupo == null)
                return NotFound(new { mensaje = "Cupo no encontrado" });

            cupo.CuposTotales = request.CuposTotales;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Cupo actualizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar cupo", error = ex.Message });
        }
    }

    // DELETE: elimina un registro de cupo existente.
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpDelete("cupos/{id}")]
    public async Task<IActionResult> EliminarCupo(int id)
    {
        try
        {
            var cupo = await _context.CuposEspecialidades.FindAsync(id);
            if (cupo == null)
                return NotFound(new { mensaje = "Cupo no encontrado" });

            _context.CuposEspecialidades.Remove(cupo);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Cupo eliminado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar cupo", error = ex.Message });
        }
    }

    // POST: crea un nuevo cupo para una especialidad, sección y año lectivo.
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost("cupos")]
    public async Task<IActionResult> CrearCupo([FromBody] CrearCupoRequest request)
    {
        try
        {
            var existe = await _context.CuposEspecialidades
                .AnyAsync(c => c.IdEspecialidad == request.IdEspecialidad
                    && c.Seccion == request.Seccion
                    && c.AnioLectivo == DateTime.Now.Year);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe un cupo para esta especialidad y seccion" });

            var cupo = new CuposEspecialidad
            {
                IdEspecialidad = request.IdEspecialidad,
                Seccion = request.Seccion,
                CuposTotales = request.CuposTotales,
                CuposOcupados = 0,
                AnioLectivo = DateTime.Now.Year
            };

            _context.CuposEspecialidades.Add(cupo);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Cupo creado correctamente", cupo });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear cupo", error = ex.Message });
        }
    }

    // ============================================================
    // Busca si un DUI, NIE o correo ya están registrados en estudiantes
    // o en otra solicitud activa (todo estado menos Rechazado).
    // Devuelve datos del duplicado o null si no hay.
    // ============================================================
    private async Task<(string Campo, string Tipo, string Nombre, string Mensaje)?> BuscarDuplicadoAsync(string? dui, string? nie, string? correo, string? emailEncargado)
    {
        if (!string.IsNullOrWhiteSpace(dui))
        {
            var est = await _context.Estudiantes.FirstOrDefaultAsync(e => e.Dui == dui.Trim());
            if (est != null)
                return ("dui", "estudiante", $"{est.Nombres} {est.Apellidos}",
                    $"Ya existe un estudiante registrado con el DUI {dui} ({est.Nombres} {est.Apellidos}). No se puede registrar la misma información dos veces.");

            var aspi = await _context.Aspirantes
                .FirstOrDefaultAsync(a => a.Dui == dui.Trim() && a.EstadoSolicitud != "Rechazado");
            if (aspi != null)
                return ("dui", "solicitud", $"{aspi.Nombres} {aspi.Apellidos}",
                    $"El DUI {dui} ya fue utilizado en otra preinscripción ({aspi.Nombres} {aspi.Apellidos}). Espere la respuesta de su solicitud.");
        }

        if (!string.IsNullOrWhiteSpace(nie))
        {
            var est = await _context.Estudiantes.FirstOrDefaultAsync(e => e.Nie == nie.Trim());
            if (est != null)
                return ("nie", "estudiante", $"{est.Nombres} {est.Apellidos}",
                    $"Ya existe un estudiante registrado con el NIE {nie} ({est.Nombres} {est.Apellidos}). No se puede registrar la misma información dos veces.");

            var aspi = await _context.Aspirantes
                .FirstOrDefaultAsync(a => a.Nie == nie.Trim() && a.EstadoSolicitud != "Rechazado");
            if (aspi != null)
                return ("nie", "solicitud", $"{aspi.Nombres} {aspi.Apellidos}",
                    $"El NIE {nie} ya fue utilizado en otra preinscripción ({aspi.Nombres} {aspi.Apellidos}). Espere la respuesta de su solicitud.");
        }

        if (!string.IsNullOrWhiteSpace(correo))
        {
            var est = await _context.Estudiantes.FirstOrDefaultAsync(e => e.CorreoEstudiante == correo.Trim());
            if (est != null)
                return ("correo", "estudiante", $"{est.Nombres} {est.Apellidos}",
                    $"Ya existe un estudiante registrado con el correo {correo} ({est.Nombres} {est.Apellidos}). No se puede registrar la misma información dos veces.");

            var aspi = await _context.Aspirantes
                .FirstOrDefaultAsync(a => a.Correo == correo.Trim() && a.EstadoSolicitud != "Rechazado");
            if (aspi != null)
                return ("correo", "solicitud", $"{aspi.Nombres} {aspi.Apellidos}",
                    $"El correo {correo} ya fue utilizado en otra preinscripción ({aspi.Nombres} {aspi.Apellidos}). Espere la respuesta de su solicitud.");
        }

        // Validar EmailEncargado
        if (!string.IsNullOrWhiteSpace(emailEncargado))
        {
            var emailEnc = emailEncargado.Trim();
            
            var estEnc = await _context.Estudiantes.FirstOrDefaultAsync(e => e.EmailEncargado == emailEnc);
            if (estEnc != null)
                return ("emailEncargado", "estudiante", $"{estEnc.Nombres} {estEnc.Apellidos}",
                    $"Ya existe un estudiante con este correo de encargado ({emailEnc}). No se puede registrar la misma información dos veces.");

            var aspiEnc = await _context.Aspirantes
                .FirstOrDefaultAsync(a => a.EmailEncargado == emailEnc && a.EstadoSolicitud != "Rechazado");
            if (aspiEnc != null)
                return ("emailEncargado", "solicitud", $"{aspiEnc.Nombres} {aspiEnc.Apellidos}",
                    $"El correo del encargado {emailEnc} ya fue utilizado en otra preinscripción ({aspiEnc.Nombres} {aspiEnc.Apellidos}). Espere la respuesta de su solicitud.");
        }

        return null;
    }

    // Genera el HTML del correo de bienvenida/activación usando la plantilla Templates/Emails.
    private async Task<string> GenerarHtmlBienvenida(string nombreEstudiante, string token)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var enlace = $"{frontendUrl}/activar-cuenta?token={token}";

        return await _plantillasCorreo.RenderizarAsync("bienvenida_activacion", new Dictionary<string, string>
        {
            { "nombreEstudiante", nombreEstudiante },
            { "enlace", enlace }
        });
    }

    // Genera el HTML del correo de bienvenida/activación para ENCARGADO.
    private async Task<string> GenerarHtmlBienvenidaEncargado(string nombreEncargado, string nombreEstudiante, string token)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var enlace = $"{frontendUrl}/activar-cuenta?token={token}";

        return await _plantillasCorreo.RenderizarAsync("bienvenida_activacion_encargado", new Dictionary<string, string>
        {
            { "nombreEncargado", nombreEncargado },
            { "nombreEstudiante", nombreEstudiante },
            { "enlace", enlace }
        });
    }
}

public class AprobarAspiranteRequest
{
    public int IdClaseAsignada { get; set; }
    public string AprobadoPor { get; set; } = "Direccion";
}

public class MatricularAspiranteRequest
{
    public DateTime? FechaMatricula { get; set; }
    public string? NumeroExpediente { get; set; }
    public string? NumeroCarnet { get; set; }
    public string? TelefonoMovil { get; set; }
    public string? TelefonoFijo { get; set; }
    public string? Direccion { get; set; }
    public string? DocumentosPresentados { get; set; }
    public string MatriculadoPor { get; set; } = "Registro Academico";
    // true/nulo = enviar correo automáticamente; false = enviar manualmente después.
    public bool? EnviarCorreo { get; set; }
}

public class RegistrarNotaExamenRequest
{
    public int p_id_aspirante { get; set; }
    public decimal p_nota_examen { get; set; }
}

public class RechazarAspiranteDTO
{
    public string RechazadoPor { get; set; } = string.Empty;
    public string Motivo { get; set; } = string.Empty;
}

public class EsperaAspiranteDTO
{
    public string EntrevistadoPor { get; set; } = string.Empty;
    public string Observacion { get; set; } = string.Empty;
}

public class ActualizarCupoRequest
{
    public int CuposTotales { get; set; }
}

public class CrearCupoRequest
{
    public int IdEspecialidad { get; set; }
    public string Seccion { get; set; } = string.Empty;
    public int CuposTotales { get; set; }
}

public class AspiranteRequestConArchivos
{
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string? Dui { get; set; }
    public string? Nie { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public string? Genero { get; set; }
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public string? EmailEncargado { get; set; }
    public string? EscuelaProcedencia { get; set; }
    public decimal? PromedioAnterior { get; set; }
    public string? NivelAspira { get; set; }
    public int? EspecialidadAspira { get; set; }
    public string? CarnetMenoridad { get; set; }
    public IFormFile? Foto { get; set; }
    public IFormFile? Pdf { get; set; }
    public List<IFormFile>? Documentos { get; set; }
    public string? DocumentosInfo { get; set; }
}

public class UpdateAspiranteRequest
{
    public string? Nombres { get; set; }
    public string? Apellidos { get; set; }
    public string? Dui { get; set; }
    public string? Nie { get; set; }
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
    public string? EscuelaProcedencia { get; set; }
    public decimal? NotaExamen { get; set; }
    public bool Exonerado { get; set; }
    public string? TipoExoneracion { get; set; }
    public string? EstadoSolicitud { get; set; }
}