using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Helpers;
using SistemaAcademicoINA.Models.Entities;
using SistemaAcademicoINA.Services;
using BCryptHelper = BCrypt.Net.BCrypt;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona aspirantes (solicitudes de ingreso), sus documentos,
// cupos por especialidad y la conversión a estudiantes.
//
// ⚠️ IMPORTANTE: NO se usa [Authorize] a nivel de clase.
// Se aplica [Authorize] individualmente a cada endpoint que lo requiera,
// dejando públicos los endpoints marcados con [AllowAnonymous].
//
// 📌 REGLAS DE UNICIDAD (validadas en BuscarDuplicadoAsync):
//   - NIE (único en aspirantes y estudiantes)
//   - DUI (único en aspirantes y estudiantes)
//   - Carnet de menoridad (único en aspirantes y estudiantes)
//   - Correo del estudiante (único en aspirantes y estudiantes)
//   - Correo del encargado (único en aspirantes y estudiantes)
//
// 📌 REGLAS DE ESPECIALIDAD:
//   - Si NivelAspira contiene "tecnico" → EspecialidadAspira OBLIGATORIA y debe existir.
//   - Si NivelAspira es "Bachillerato General" → EspecialidadAspira = NULL.
//   - Se valida contra la tabla `especialidades` antes de guardar.
//
// 📌 RATE LIMIT: máximo 5 preinscripciones por minuto (por IP + NIE).
[ApiController]
[Route("api/[controller]")]
public class AspirantesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly IEmailService _emailService;
    private readonly JwtHelper _jwtHelper;
    private readonly IConfiguration _configuration;
    private readonly PlantillasCorreoService _plantillasCorreo;
    private readonly ILogger<AspirantesController> _logger;

    // ============================================================
    // RATE LIMITING en memoria (por IP + NIE)
    // ============================================================
    private static readonly Dictionary<string, List<DateTime>> _rateLimit = new();
    private static readonly object _rateLimitLock = new();
    private const int MAX_INTENTOS_POR_MINUTO = 5;
    private const int VENTANA_SEGUNDOS = 60;

    public AspirantesController(
        ApplicationDbContext context,
        IWebHostEnvironment environment,
        IEmailService emailService,
        JwtHelper jwtHelper,
        IConfiguration configuration,
        PlantillasCorreoService plantillasCorreo,
        ILogger<AspirantesController> logger)
    {
        _context = context;
        _environment = environment;
        _emailService = emailService;
        _jwtHelper = jwtHelper;
        _configuration = configuration;
        _plantillasCorreo = plantillasCorreo;
        _logger = logger;
    }

    // ============================================================
    // GET: LISTAR ASPIRANTES
    // ============================================================
    [Authorize]
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
            _logger.LogError(ex, "Error al obtener aspirantes");
            return StatusCode(500, new { mensaje = "Error al obtener aspirantes", error = ex.Message });
        }
    }

    // ============================================================
    // GET: OBTENER ASPIRANTE POR ID
    // ============================================================
    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<Aspirante>> GetAspirante(int id)
    {
        var aspirante = await _context.Aspirantes.FindAsync(id);
        if (aspirante == null)
            return NotFound(new { mensaje = "Aspirante no encontrado" });
        return aspirante;
    }

    // ============================================================
    // GET: DOCUMENTOS DEL ASPIRANTE
    // ============================================================
    [Authorize]
    [HttpGet("{id}/documentos")]
    public async Task<IActionResult> GetDocumentos(int id)
    {
        try
        {
            var aspirante = await _context.Aspirantes.FindAsync(id);
            if (aspirante == null)
                return NotFound(new { mensaje = "Aspirante no encontrado" });

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            string? fotoUrl = null;
            string? pdfUrl = null;

            if (!string.IsNullOrEmpty(aspirante.Foto))
            {
                var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", aspirante.Foto.TrimStart('/'));
                if (System.IO.File.Exists(physicalPath))
                    fotoUrl = $"{baseUrl}{aspirante.Foto}";
            }

            if (!string.IsNullOrEmpty(aspirante.ArchivoNotasEscuela))
            {
                var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", aspirante.ArchivoNotasEscuela.TrimStart('/'));
                if (System.IO.File.Exists(physicalPath))
                    pdfUrl = $"{baseUrl}{aspirante.ArchivoNotasEscuela}";
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
                fotoUrl,
                pdfUrl,
                documentos = documentosUrl,
                carpeta = $"/uploads/aspirantes/{aspirante.IdAspirante}/"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener documentos del aspirante {Id}", id);
            return StatusCode(500, new { mensaje = "Error al obtener documentos del aspirante" });
        }
    }

    // ============================================================
    // GET: VERIFICAR DUPLICADOS (PÚBLICO)
    // ============================================================
    [AllowAnonymous]
    [HttpGet("verificar")]
    public async Task<IActionResult> VerificarDuplicadosPreinscripcion(
        [FromQuery] string? dui = null,
        [FromQuery] string? nie = null,
        [FromQuery] string? correo = null,
        [FromQuery] string? emailEncargado = null,
        [FromQuery] string? carnetMenoridad = null)
    {
        try
        {
            var duplicado = await BuscarDuplicadoAsync(dui, nie, correo, emailEncargado, carnetMenoridad);
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
            _logger.LogError(ex, "Error al verificar duplicados");
            return StatusCode(500, new { mensaje = "Error al verificar datos", error = ex.Message });
        }
    }

    // ============================================================
    // POST: CREAR ASPIRANTE (PÚBLICO)
    // ============================================================
    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<Aspirante>> PostAspirante([FromForm] AspiranteRequestConArchivos request)
    {
        try
        {
            // ============================================================
            // RATE LIMIT: máximo 5 envíos por minuto (por IP + NIE)
            // ============================================================
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var nieRate = string.IsNullOrWhiteSpace(request.Nie) ? "sin-nie" : request.Nie.Trim();
            var rateKey = $"{ip}|{nieRate}";

            lock (_rateLimitLock)
            {
                if (!_rateLimit.ContainsKey(rateKey))
                    _rateLimit[rateKey] = new List<DateTime>();

                var ahora = DateTime.Now;
                var hace1min = ahora.AddSeconds(-VENTANA_SEGUNDOS);

                _rateLimit[rateKey].RemoveAll(t => t < hace1min);

                if (_rateLimit[rateKey].Count >= MAX_INTENTOS_POR_MINUTO)
                {
                    _logger.LogWarning("⚠️ Rate limit alcanzado para {Key}", rateKey);
                    return StatusCode(429, new
                    {
                        mensaje = $"Has alcanzado el límite de {MAX_INTENTOS_POR_MINUTO} envíos por minuto. Espera unos segundos e intenta de nuevo."
                    });
                }

                _rateLimit[rateKey].Add(ahora);

                if (_rateLimit.Count > 1000)
                {
                    var clavesViejas = _rateLimit
                        .Where(kvp => kvp.Value.All(t => t < hace1min))
                        .Select(kvp => kvp.Key)
                        .ToList();
                    foreach (var k in clavesViejas)
                        _rateLimit.Remove(k);
                }
            }

            _logger.LogInformation("📥 Recibida preinscripción: {Nombres} {Apellidos}, NIE: {Nie}, DUI: {Dui}, Correo: {Correo}, Nivel: {Nivel}, Especialidad: {Esp}",
                request.Nombres, request.Apellidos, request.Nie, request.Dui, request.Correo,
                request.NivelAspira, request.EspecialidadAspira);

            // Validar duplicados
            var duplicado = await BuscarDuplicadoAsync(
                request.Dui, request.Nie, request.Correo, request.EmailEncargado, request.CarnetMenoridad);

            if (duplicado != null)
            {
                _logger.LogWarning("⚠️ Duplicado detectado: {Mensaje}", duplicado.Value.Mensaje);
                return Conflict(new { mensaje = duplicado.Value.Mensaje, campo = duplicado.Value.Campo, duplicado = true });
            }

            // Validar edad entre 14 y 19 años
            if (!request.FechaNacimiento.HasValue)
                return BadRequest(new { mensaje = "La fecha de nacimiento es requerida" });

            var fechaNacimiento = request.FechaNacimiento.Value.Date;
            var fechaActual = DateTime.Today;
            var edad = fechaActual.Year - fechaNacimiento.Year;
            if (fechaNacimiento > fechaActual.AddYears(-edad)) edad--;

            const int EDAD_MINIMA = 14;
            const int EDAD_MAXIMA = 19;

            if (edad < EDAD_MINIMA)
                return BadRequest(new { mensaje = $"La edad mínima permitida es de {EDAD_MINIMA} años. Tienes {edad} años.", edad });

            if (edad > EDAD_MAXIMA)
                return BadRequest(new { mensaje = $"La edad máxima permitida es de {EDAD_MAXIMA} años. Tienes {edad} años.", edad });

            // ============================================================
            // VALIDAR ESPECIALIDAD
            // - Si NivelAspira contiene "tecnico" → EspecialidadAspira obligatoria y debe existir.
            // - Si NivelAspira es "Bachillerato General" → EspecialidadAspira = NULL.
            // ============================================================
            int? especialidadValidada = null;

            bool esTecnico = !string.IsNullOrWhiteSpace(request.NivelAspira)
                && request.NivelAspira.Trim().ToLowerInvariant().Contains("tecnico");

            if (esTecnico)
            {
                if (!request.EspecialidadAspira.HasValue || request.EspecialidadAspira.Value <= 0)
                {
                    return BadRequest(new { mensaje = "Debe seleccionar una especialidad para Bachillerato Técnico." });
                }

                var especialidadExiste = await _context.Especialidades
                    .AnyAsync(e => e.IdEspecialidad == request.EspecialidadAspira.Value && e.Estado);

                if (!especialidadExiste)
                {
                    _logger.LogWarning("Especialidad {Id} no existe o está inactiva", request.EspecialidadAspira);
                    return BadRequest(new { mensaje = $"La especialidad seleccionada (ID {request.EspecialidadAspira}) no existe o está inactiva." });
                }

                especialidadValidada = request.EspecialidadAspira.Value;
                _logger.LogInformation("🎓 Especialidad validada: ID {Id} para NIE {Nie}", especialidadValidada, request.Nie);
            }
            else
            {
                // Bachillerato General → sin especialidad
                especialidadValidada = null;
                _logger.LogInformation("🎓 Bachillerato General → EspecialidadAspira = NULL para NIE {Nie}", request.Nie);
            }

            var aspirante = new Aspirante
            {
                Nombres = request.Nombres ?? "",
                Apellidos = request.Apellidos ?? "",
                Dui = string.IsNullOrWhiteSpace(request.Dui) ? null : request.Dui.Trim(),
                Nie = string.IsNullOrWhiteSpace(request.Nie) ? null : request.Nie.Trim(),
                CarnetMenoridad = string.IsNullOrWhiteSpace(request.CarnetMenoridad) ? null : request.CarnetMenoridad.Trim(),
                FechaNacimiento = request.FechaNacimiento,
                Genero = string.IsNullOrWhiteSpace(request.Genero) ? null : request.Genero,
                Telefono = string.IsNullOrWhiteSpace(request.Telefono) ? null : request.Telefono.Trim(),
                Correo = string.IsNullOrWhiteSpace(request.Correo) ? null : request.Correo.Trim(),
                EmailEncargado = string.IsNullOrWhiteSpace(request.EmailEncargado) ? null : request.EmailEncargado.Trim(),
                EscuelaProcedencia = string.IsNullOrWhiteSpace(request.EscuelaProcedencia) ? null : request.EscuelaProcedencia.Trim(),
                PromedioAnterior = request.PromedioAnterior,
                NivelAspira = string.IsNullOrWhiteSpace(request.NivelAspira) ? null : request.NivelAspira.Trim(),
                EspecialidadAspira = especialidadValidada,
                FechaSolicitud = DateTime.Now,
                EstadoSolicitud = "Pendiente"
            };

            _context.Aspirantes.Add(aspirante);
            await _context.SaveChangesAsync();

            _logger.LogInformation("✅ Aspirante creado con ID {Id} (EspecialidadAspira: {Esp})",
                aspirante.IdAspirante, aspirante.EspecialidadAspira);

            // Guardar archivos
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "aspirantes", aspirante.IdAspirante.ToString());
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            string? fotoPath = null;
            string? pdfPath = null;

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

            await AuditoriaAsync($"Nuevo aspirante registrado: {aspirante.Nombres} {aspirante.Apellidos} (ID: {aspirante.IdAspirante}, Esp: {aspirante.EspecialidadAspira})", "Crear");

            return Ok(new
            {
                mensaje = "Aspirante registrado correctamente",
                id = aspirante.IdAspirante,
                especialidadAspira = aspirante.EspecialidadAspira,
                nivelAspira = aspirante.NivelAspira,
                foto = fotoPath,
                pdf = pdfPath
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error al crear aspirante: {Message}", ex.Message);
            return StatusCode(500, new { mensaje = "Error al crear aspirante", error = ex.Message });
        }
    }

    // ============================================================
    // POST: REGISTRAR NOTA DE EXAMEN
    // ============================================================
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

            await AuditoriaAsync($"Nota de examen registrada para aspirante {aspirante.Nombres} {aspirante.Apellidos}: {request.p_nota_examen}", "Actualizar");

            return Ok(new { mensaje = "Nota registrada correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar nota del aspirante {Id}", request.p_id_aspirante);
            return StatusCode(500, new { mensaje = "Error al registrar nota", error = ex.Message });
        }
    }

    // ============================================================
    // PUT: APROBAR ASPIRANTE (Dirección)
    // ============================================================
    [Authorize(Roles = "Administrador,Director,Sub Director")]
    [HttpPut("aprobar/{id}")]
    public async Task<IActionResult> AprobarAspirante(int id, [FromBody] AprobarAspiranteRequest request)
    {
        try
        {
            _logger.LogInformation("Iniciando aprobación del aspirante {Id} con clase {Clase}", id, request.IdClaseAsignada);

            var aspirante = await _context.Aspirantes.FindAsync(id);
            if (aspirante == null)
                return NotFound(new { mensaje = "Aspirante no encontrado" });

            if (aspirante.EstadoSolicitud == "Aprobado")
                return BadRequest(new { mensaje = "Este aspirante ya fue aprobado. La matrícula la realiza Registro Académico." });

            if (aspirante.EstadoSolicitud == "Rechazado")
                return BadRequest(new { mensaje = "No se puede aprobar un aspirante rechazado. Reábrelo primero." });

            if (aspirante.IdEstudianteGenerado.HasValue)
                return BadRequest(new { mensaje = "Este aspirante ya fue matriculado como estudiante" });

            if (string.IsNullOrWhiteSpace(aspirante.Nie))
                return BadRequest(new { mensaje = "El aspirante no tiene NIE registrado. Agregue el NIE antes de aprobar la solicitud." });

            if (!aspirante.NotaExamen.HasValue && !aspirante.Exonerado)
                return BadRequest(new { mensaje = "El aspirante debe tener nota de examen registrada o estar exonerado para ser aprobado" });

            if (aspirante.NotaExamen.HasValue && aspirante.NotaExamen < 6)
                return BadRequest(new { mensaje = "La nota mínima para aprobar es 6" });

            if (request.IdClaseAsignada <= 0)
                return BadRequest(new { mensaje = "Debe seleccionar una clase válida" });

            var clase = await _context.Clases
                .Include(c => c.Nivel)
                .Include(c => c.Especialidad)
                .FirstOrDefaultAsync(c => c.IdClase == request.IdClaseAsignada);

            if (clase == null)
                return BadRequest(new { mensaje = "La clase asignada no existe" });

            if (!clase.Estado)
                return BadRequest(new { mensaje = "La clase asignada está inactiva" });

            if (clase.AnioLectivo != DateTime.Now.Year)
                return BadRequest(new { mensaje = $"La clase asignada pertenece al año lectivo {clase.AnioLectivo}, no al actual ({DateTime.Now.Year})" });

            var cupoActual = await _context.Estudiantes
                .CountAsync(e => e.IdClase == clase.IdClase && e.Estado);

            if (cupoActual >= clase.CupoMaximo)
                return BadRequest(new { mensaje = $"La clase {clase.NombreClase} no tiene cupos disponibles ({cupoActual}/{clase.CupoMaximo})" });

            // Validar coincidencia de especialidad
            var especialidadAspirante = aspirante.EspecialidadAspira ?? 0;
            var especialidadClase = clase.IdEspecialidad ?? 0;
            string? advertencia = null;

            if (especialidadAspirante != especialidadClase)
            {
                _logger.LogWarning(
                    "Aspirante {Id} aspira a especialidad {EspAsp} pero la clase {Clase} es de especialidad {EspClase}",
                    id, especialidadAspirante, clase.IdClase, especialidadClase);

                advertencia = $"El aspirante aspiraba a una especialidad distinta. Se asignó a {clase.NombreClase}.";
            }

            aspirante.EstadoSolicitud = "Aprobado";
            aspirante.FechaAprobacion = DateTime.Now;
            aspirante.AprobadoPor = string.IsNullOrWhiteSpace(request.AprobadoPor) ? "Direccion" : request.AprobadoPor;
            aspirante.IdClaseAsignada = request.IdClaseAsignada;

            if (clase.IdEspecialidad.HasValue)
                aspirante.EspecialidadAspira = clase.IdEspecialidad.Value;

            await _context.SaveChangesAsync();

            await AuditoriaAsync(
                $"Aspirante {aspirante.Nombres} {aspirante.Apellidos} aprobado y asignado a la clase {clase.NombreClase} (pendiente de matrícula por Registro Académico)",
                "Aprobar");

            _logger.LogInformation("Aspirante {Id} aprobado correctamente", id);

            return Ok(new
            {
                mensaje = "Aspirante aprobado correctamente. La matrícula la realizará Registro Académico.",
                idAspirante = aspirante.IdAspirante,
                idClaseAsignada = aspirante.IdClaseAsignada,
                advertencia
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al aprobar aspirante {Id}", id);
            return StatusCode(500, new
            {
                mensaje = "Error al aprobar el aspirante. Verifique los datos e intente nuevamente.",
                error = ex.Message
            });
        }
    }

    // ============================================================
    // POST: MATRICULAR ASPIRANTE APROBADO
    // ============================================================
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    [HttpPost("matricular/{id}")]
    public async Task<IActionResult> MatricularAspirante(int id, [FromBody] MatricularAspiranteRequest request)
    {
        try
        {
            _logger.LogInformation("Iniciando matrícula del aspirante {Id}", id);

            var aspirante = await _context.Aspirantes.FindAsync(id);
            if (aspirante == null)
                return NotFound(new { mensaje = "Aspirante no encontrado" });

            if (aspirante.EstadoSolicitud != "Aprobado")
                return BadRequest(new { mensaje = "Solo se pueden matricular aspirantes aprobados por Dirección" });

            if (aspirante.IdEstudianteGenerado.HasValue)
                return BadRequest(new { mensaje = "Este aspirante ya fue matriculado como estudiante" });

            if (string.IsNullOrWhiteSpace(aspirante.Nie))
                return BadRequest(new { mensaje = "El aspirante no tiene NIE registrado" });

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

            var cupoActual = await _context.Estudiantes
                .CountAsync(e => e.IdClase == clase.IdClase && e.Estado);

            if (cupoActual >= clase.CupoMaximo)
                return BadRequest(new { mensaje = "La clase asignada no tiene cupos disponibles" });

            var especialidadClase = clase.IdEspecialidad ?? 0;
            var seccionClase = string.IsNullOrEmpty(clase.Seccion) ? "A" : clase.Seccion;

            var cupo = await _context.CuposEspecialidades
                .FirstOrDefaultAsync(c => c.IdEspecialidad == especialidadClase
                    && c.Seccion == seccionClase
                    && c.AnioLectivo == DateTime.Now.Year);

            if (cupo != null && cupo.CuposOcupados >= cupo.CuposTotales)
                return BadRequest(new { mensaje = "No hay cupos disponibles en esta especialidad/sección" });

            if (!string.IsNullOrEmpty(aspirante.Dui))
            {
                var estPorDui = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.Dui == aspirante.Dui);
                if (estPorDui != null)
                    return Conflict(new { mensaje = $"Ya existe un estudiante matriculado con el DUI {aspirante.Dui} ({estPorDui.Nombres} {estPorDui.Apellidos}).", duplicado = true });
            }

            if (!string.IsNullOrEmpty(aspirante.Nie))
            {
                var estPorNie = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.Nie == aspirante.Nie);
                if (estPorNie != null)
                    return Conflict(new { mensaje = $"Ya existe un estudiante matriculado con el NIE {aspirante.Nie} ({estPorNie.Nombres} {estPorNie.Apellidos}).", duplicado = true });
            }

            if (!string.IsNullOrEmpty(aspirante.Correo)
                && await _context.Estudiantes.AnyAsync(e => e.CorreoEstudiante == aspirante.Correo))
                return Conflict(new { mensaje = $"Ya existe un estudiante matriculado con el correo {aspirante.Correo}.", duplicado = true });

            if (!string.IsNullOrEmpty(aspirante.Correo)
                && await _context.Usuarios.AnyAsync(u => u.Correo == aspirante.Correo))
                return Conflict(new { mensaje = $"El correo {aspirante.Correo} ya está registrado en el sistema." });

            var anioLectivo = DateTime.Now.Year;
            var fechaMatricula = request.FechaMatricula ?? DateTime.Now;
            var matriculadoPor = string.IsNullOrWhiteSpace(request.MatriculadoPor) ? "Registro Academico" : request.MatriculadoPor;

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
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
                    ParentescoEmergencia = aspirante.ParentescoEmergencia,
                    CarnetMenoridad = aspirante.CarnetMenoridad
                };

                _context.Estudiantes.Add(estudiante);
                await _context.SaveChangesAsync();

                estudiante.CodigoEstudiante = $"{anioLectivo}-{estudiante.IdEstudiante.ToString().PadLeft(5, '0')}-INA";
                await _context.SaveChangesAsync();

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

                clase.CupoActual++;
                if (cupo != null)
                    cupo.CuposOcupados++;

                aspirante.IdEstudianteGenerado = estudiante.IdEstudiante;
                aspirante.IdInscripcionGenerada = inscripcion.IdInscripciones;
                if (!string.IsNullOrWhiteSpace(inscripcion.NumeroExpediente))
                    aspirante.NumeroExpediente = inscripcion.NumeroExpediente;

                var enviarCorreo = request.EnviarCorreo != false;

                if (!string.IsNullOrEmpty(aspirante.Correo))
                {
                    var nuevoUsuario = new Usuario
                    {
                        Codigo = estudiante.CodigoEstudiante,
                        Nombres = aspirante.Nombres ?? "",
                        Apellidos = aspirante.Apellidos ?? "",
                        Correo = aspirante.Correo,
                        Contrasena = null,
                        RolId = 7,
                        Estado = false,
                        EstadoActivacion = enviarCorreo ? "PendienteActivacion" : "PendienteEnvioManual"
                    };

                    _context.Usuarios.Add(nuevoUsuario);
                    await _context.SaveChangesAsync();

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

                if (!string.IsNullOrEmpty(aspirante.EmailEncargado))
                {
                    if (await _context.Usuarios.AnyAsync(u => u.Correo == aspirante.EmailEncargado))
                    {
                        _logger.LogWarning("Email de encargado {Email} ya registrado. No se crea usuario.", aspirante.EmailEncargado);
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
                            RolId = 8,
                            Estado = false,
                            EstadoActivacion = enviarCorreo ? "PendienteActivacion" : "PendienteEnvioManual"
                        };

                        _context.Usuarios.Add(usuarioEncargado);
                        await _context.SaveChangesAsync();

                        string duiEncargado = aspirante.DuiEncargado?.Trim() ?? "";
                        bool duiExiste = !string.IsNullOrEmpty(duiEncargado) &&
                            await _context.Personas.AnyAsync(p => p.NumeroDocumento == duiEncargado && p.TipoDocumento == "DUI");

                        if (string.IsNullOrEmpty(duiEncargado) || duiExiste)
                            duiEncargado = $"ENC-DUI-{usuarioEncargado.IdUsuario}";

                        var personaEncargado = new Persona
                        {
                            TipoDocumento = "DUI",
                            NumeroDocumento = duiEncargado,
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

                            await _emailService.EncolarAsync(new EmailMessage
                            {
                                Destinatario = aspirante.EmailEncargado,
                                Asunto = "¡Felicidades! Su hijo(a) ha sido matriculado en el INA",
                                CuerpoHtml = await GenerarHtmlBienvenidaEncargado(
                                    aspirante.NombreEncargado ?? "",
                                    $"{aspirante.Nombres} {aspirante.Apellidos}",
                                    tokenActivacionEncargado)
                            });
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await AuditoriaAsync(
                    $"Matrícula aceptada por {matriculadoPor} el {DateTime.Now:dd/MM/yyyy HH:mm}. Aspirante {aspirante.Nombres} {aspirante.Apellidos} matriculado como estudiante (ID: {estudiante.IdEstudiante}, código {estudiante.CodigoEstudiante}) en la clase {clase.NombreClase}",
                    "Matricular");

                _logger.LogInformation("Aspirante {Id} matriculado correctamente como estudiante {EstudianteId}", id, estudiante.IdEstudiante);

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
                await transaction.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al matricular aspirante {Id}", id);
            return StatusCode(500, new
            {
                mensaje = "Error al matricular el estudiante. Verifique los datos e intente nuevamente.",
                error = ex.Message
            });
        }
    }

    // ============================================================
    // PUT: RECHAZAR ASPIRANTE
    // ============================================================
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

            await AuditoriaAsync($"Aspirante {aspirante.Nombres} {aspirante.Apellidos} rechazado. Motivo: {dto.Motivo}", "Rechazar");

            return Ok(new { mensaje = "Aspirante rechazado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al rechazar aspirante {Id}", id);
            return StatusCode(500, new { mensaje = "Error al rechazar aspirante", error = ex.Message });
        }
    }

    // ============================================================
    // PUT: PONER EN ESPERA
    // ============================================================
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

            await AuditoriaAsync($"Aspirante {aspirante.Nombres} {aspirante.Apellidos} puesto en lista de espera", "Actualizar");

            return Ok(new { mensaje = "Aspirante puesto en lista de espera" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al poner en espera aspirante {Id}", id);
            return StatusCode(500, new { mensaje = "Error al poner en espera", error = ex.Message });
        }
    }

    // ============================================================
    // PUT: ACTUALIZAR ASPIRANTE
    // ============================================================
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

            if (!string.IsNullOrEmpty(request.Nombres)) aspirante.Nombres = request.Nombres;
            if (!string.IsNullOrEmpty(request.Apellidos)) aspirante.Apellidos = request.Apellidos;
            if (request.Dui != null) aspirante.Dui = request.Dui;
            if (!string.IsNullOrEmpty(request.Nie)) aspirante.Nie = request.Nie;
            if (!string.IsNullOrEmpty(request.Correo)) aspirante.Correo = request.Correo;
            if (request.Telefono != null) aspirante.Telefono = request.Telefono;
            if (request.EscuelaProcedencia != null) aspirante.EscuelaProcedencia = request.EscuelaProcedencia;
            if (request.NotaExamen.HasValue) aspirante.NotaExamen = request.NotaExamen.Value;
            aspirante.Exonerado = request.Exonerado;
            if (request.TipoExoneracion != null) aspirante.TipoExoneracion = request.TipoExoneracion;

            if (!string.IsNullOrEmpty(request.EstadoSolicitud))
            {
                var estadosValidos = new[] { "Pendiente", "En Espera", "Aprobado", "Rechazado" };
                if (estadosValidos.Contains(request.EstadoSolicitud))
                    aspirante.EstadoSolicitud = request.EstadoSolicitud;
            }

            var correoCambio = !string.IsNullOrEmpty(request.Correo) && request.Correo != correoAnterior;
            if (correoCambio || !string.IsNullOrEmpty(request.Nombres) || !string.IsNullOrEmpty(request.Apellidos))
            {
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.IdAspiranteOrigen == aspirante.IdAspirante
                        || (aspirante.IdEstudianteGenerado.HasValue && e.IdEstudiante == aspirante.IdEstudianteGenerado.Value));

                if (estudiante != null)
                {
                    if (correoCambio) estudiante.CorreoEstudiante = aspirante.Correo;
                    if (!string.IsNullOrEmpty(request.Nombres)) estudiante.Nombres = request.Nombres;
                    if (!string.IsNullOrEmpty(request.Apellidos)) estudiante.Apellidos = request.Apellidos;

                    var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Codigo == estudiante.CodigoEstudiante);
                    if (usuario != null)
                    {
                        if (correoCambio) usuario.Correo = aspirante.Correo;
                        if (!string.IsNullOrEmpty(request.Nombres)) usuario.Nombres = request.Nombres;
                        if (!string.IsNullOrEmpty(request.Apellidos)) usuario.Apellidos = request.Apellidos;
                    }
                }
            }

            await _context.SaveChangesAsync();

            await AuditoriaAsync($"Aspirante {aspirante.Nombres} {aspirante.Apellidos} actualizado (ID: {aspirante.IdAspirante})", "Actualizar");

            return Ok(new { mensaje = "Aspirante actualizado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar aspirante {Id}", id);
            return StatusCode(500, new { mensaje = "Error al actualizar aspirante", error = ex.Message });
        }
    }

    // ============================================================
    // GET: CUPOS
    // ============================================================
    [Authorize]
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
            _logger.LogError(ex, "Error al obtener cupos");
            return StatusCode(500, new { mensaje = "Error al obtener cupos", error = ex.Message });
        }
    }

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
            _logger.LogError(ex, "Error al actualizar cupo {Id}", id);
            return StatusCode(500, new { mensaje = "Error al actualizar cupo", error = ex.Message });
        }
    }

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
            _logger.LogError(ex, "Error al eliminar cupo {Id}", id);
            return StatusCode(500, new { mensaje = "Error al eliminar cupo", error = ex.Message });
        }
    }

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
                return BadRequest(new { mensaje = "Ya existe un cupo para esta especialidad y sección" });

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
            _logger.LogError(ex, "Error al crear cupo");
            return StatusCode(500, new { mensaje = "Error al crear cupo", error = ex.Message });
        }
    }

    // ============================================================
    // HELPERS PRIVADOS
    // ============================================================
    private async Task<(string Campo, string Tipo, string Nombre, string Mensaje)?> BuscarDuplicadoAsync(
        string? dui, string? nie, string? correo, string? emailEncargado, string? carnetMenoridad = null)
    {
        // ✅ NIE
        if (!string.IsNullOrWhiteSpace(nie))
        {
            var nieTrim = nie.Trim();

            var est = await _context.Estudiantes.FirstOrDefaultAsync(e => e.Nie == nieTrim);
            if (est != null)
                return ("nie", "estudiante", $"{est.Nombres} {est.Apellidos}",
                    $"Ya existe un estudiante registrado con el NIE {nieTrim}.");

            var aspi = await _context.Aspirantes
                .FirstOrDefaultAsync(a => a.Nie == nieTrim && a.EstadoSolicitud != "Rechazado");
            if (aspi != null)
                return ("nie", "solicitud", $"{aspi.Nombres} {aspi.Apellidos}",
                    $"El NIE {nieTrim} ya fue utilizado en otra preinscripción.");
        }

        // ✅ DUI
        if (!string.IsNullOrWhiteSpace(dui))
        {
            var duiTrim = dui.Trim();

            var est = await _context.Estudiantes.FirstOrDefaultAsync(e => e.Dui == duiTrim);
            if (est != null)
                return ("dui", "estudiante", $"{est.Nombres} {est.Apellidos}",
                    $"Ya existe un estudiante registrado con el DUI {duiTrim}.");

            var aspi = await _context.Aspirantes
                .FirstOrDefaultAsync(a => a.Dui == duiTrim && a.EstadoSolicitud != "Rechazado");
            if (aspi != null)
                return ("dui", "solicitud", $"{aspi.Nombres} {aspi.Apellidos}",
                    $"El DUI {duiTrim} ya fue utilizado en otra preinscripción.");
        }

        // ✅ CARNET MENORIDAD
        if (!string.IsNullOrWhiteSpace(carnetMenoridad))
        {
            var carnetTrim = carnetMenoridad.Trim();

            var est = await _context.Estudiantes.FirstOrDefaultAsync(e => e.CarnetMenoridad == carnetTrim);
            if (est != null)
                return ("carnetMenoridad", "estudiante", $"{est.Nombres} {est.Apellidos}",
                    $"Ya existe un estudiante registrado con el carnet de menoridad {carnetTrim}.");

            var aspi = await _context.Aspirantes
                .FirstOrDefaultAsync(a => a.CarnetMenoridad == carnetTrim && a.EstadoSolicitud != "Rechazado");
            if (aspi != null)
                return ("carnetMenoridad", "solicitud", $"{aspi.Nombres} {aspi.Apellidos}",
                    $"El carnet de menoridad {carnetTrim} ya fue utilizado en otra preinscripción.");
        }

        // ✅ CORREO
        if (!string.IsNullOrWhiteSpace(correo))
        {
            var correoTrim = correo.Trim().ToLowerInvariant();

            var est = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.CorreoEstudiante != null && e.CorreoEstudiante.ToLower() == correoTrim);
            if (est != null)
                return ("correo", "estudiante", $"{est.Nombres} {est.Apellidos}",
                    $"Ya existe un estudiante registrado con el correo {correoTrim}.");

            var aspi = await _context.Aspirantes
                .FirstOrDefaultAsync(a => a.Correo != null && a.Correo.ToLower() == correoTrim && a.EstadoSolicitud != "Rechazado");
            if (aspi != null)
                return ("correo", "solicitud", $"{aspi.Nombres} {aspi.Apellidos}",
                    $"El correo {correoTrim} ya fue utilizado en otra preinscripción.");
        }

        // ✅ CORREO ENCARGADO
        if (!string.IsNullOrWhiteSpace(emailEncargado))
        {
            var emailEnc = emailEncargado.Trim().ToLowerInvariant();

            var estEnc = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.EmailEncargado != null && e.EmailEncargado.ToLower() == emailEnc);
            if (estEnc != null)
                return ("emailEncargado", "estudiante", $"{estEnc.Nombres} {estEnc.Apellidos}",
                    $"Ya existe un estudiante con este correo de encargado.");

            var aspiEnc = await _context.Aspirantes
                .FirstOrDefaultAsync(a => a.EmailEncargado != null && a.EmailEncargado.ToLower() == emailEnc && a.EstadoSolicitud != "Rechazado");
            if (aspiEnc != null)
                return ("emailEncargado", "solicitud", $"{aspiEnc.Nombres} {aspiEnc.Apellidos}",
                    $"El correo del encargado ya fue utilizado en otra preinscripción.");
        }

        return null;
    }

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
                Directory.CreateDirectory(uploadsFolder);

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
            _logger.LogError(ex, "Error al guardar documentos del aspirante {Id}", idAspirante);
            return null;
        }
    }

    private async Task AuditoriaAsync(string detalle, string accion)
    {
        try
        {
            _context.Auditoria.Add(new Auditoria
            {
                Usuario = User.Identity?.Name ?? "Sistema",
                Accion = accion,
                Detalle = detalle,
                Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                Fecha = DateTime.Now,
                CreatedAt = DateTime.Now
            });
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error al registrar auditoría");
        }
    }

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

// ============================================================
// DTOs
// ============================================================
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