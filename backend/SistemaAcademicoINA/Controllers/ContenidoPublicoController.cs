using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using System.Security.Claims;

namespace SistemaAcademicoINA.Controllers
{
    [ApiController]
    [Route("api/contenido-publico")]
    public class ContenidoPublicoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<ContenidoPublicoController> _logger;

        public ContenidoPublicoController(
            ApplicationDbContext context,
            IWebHostEnvironment env,
            ILogger<ContenidoPublicoController> logger)
        {
            _context = context;
            _env = env;
            _logger = logger;
        }

        // ============================================================
        // GET: api/contenido-publico/{pagina}
        // Público - Devuelve todo el contenido activo de una página
        // ============================================================
        [HttpGet("{pagina}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetContenido(string pagina)
        {
            try
            {
                var contenido = await _context.ContenidoPublico
                    .Where(c => c.Pagina == pagina && c.Activo)
                    .OrderBy(c => c.Orden)
                    .Select(c => new
                    {
                        c.IdContenido,
                        c.Pagina,
                        c.Seccion,
                        c.Titulo,
                        c.Contenido,
                        c.ImagenUrl,
                        c.ImagenConfig,
                        c.Orden,
                        c.FechaModificacion,
                        c.ModificadoPor
                    })
                    .ToListAsync();

                return Ok(contenido);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener contenido de {Pagina}", pagina);
                return StatusCode(500, new { mensaje = "Error al obtener el contenido" });
            }
        }

        // ============================================================
        // GET: api/contenido-publico/admin/{pagina}
        // Solo roles autorizados - Devuelve TODO (incluso inactivos)
        // ============================================================
        [HttpGet("admin/{pagina}")]
        [Authorize(Roles = "Administrador,Director,Sub Director")]
        public async Task<ActionResult> GetContenidoAdmin(string pagina)
        {
            try
            {
                var contenido = await _context.ContenidoPublico
                    .Where(c => c.Pagina == pagina)
                    .OrderBy(c => c.Orden)
                    .ToListAsync();

                return Ok(contenido);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error admin al obtener contenido de {Pagina}", pagina);
                return StatusCode(500, new { mensaje = "Error al obtener el contenido" });
            }
        }

        // ============================================================
        // POST: api/contenido-publico
        // Crea un nuevo bloque
        // ============================================================
        [HttpPost]
        [Authorize(Roles = "Administrador,Director,Sub Director")]
        public async Task<ActionResult> CrearContenido([FromBody] ContenidoPublicoDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Pagina) || string.IsNullOrWhiteSpace(dto.Seccion))
                    return BadRequest(new { mensaje = "Página y sección son requeridas" });

                var usuario = User.FindFirst(ClaimTypes.Name)?.Value ?? "Desconocido";

                var contenido = new ContenidoPublico
                {
                    Pagina = dto.Pagina.Trim(),
                    Seccion = dto.Seccion.Trim(),
                    Titulo = dto.Titulo?.Trim(),
                    Contenido = dto.Contenido,
                    ImagenUrl = dto.ImagenUrl,
                    ImagenConfig = dto.ImagenConfig,
                    Orden = dto.Orden,
                    Activo = dto.Activo,
                    FechaModificacion = DateTime.Now,
                    ModificadoPor = usuario
                };

                _context.ContenidoPublico.Add(contenido);
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = "Contenido creado", id = contenido.IdContenido });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear contenido");
                return StatusCode(500, new { mensaje = "Error al crear el contenido: " + ex.Message });
            }
        }

        // ============================================================
        // PUT: api/contenido-publico/{id}
        // Actualiza un bloque
        // ============================================================
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador,Director,Sub Director")]
        public async Task<ActionResult> ActualizarContenido(int id, [FromBody] ContenidoPublicoDto dto)
        {
            try
            {
                var contenido = await _context.ContenidoPublico.FindAsync(id);
                if (contenido == null)
                    return NotFound(new { mensaje = "Contenido no encontrado" });

                var usuario = User.FindFirst(ClaimTypes.Name)?.Value ?? "Desconocido";

                contenido.Titulo = dto.Titulo?.Trim();
                contenido.Contenido = dto.Contenido;
                contenido.ImagenUrl = dto.ImagenUrl;
                contenido.ImagenConfig = dto.ImagenConfig;
                contenido.Orden = dto.Orden;
                contenido.Activo = dto.Activo;
                contenido.FechaModificacion = DateTime.Now;
                contenido.ModificadoPor = usuario;

                await _context.SaveChangesAsync();
                return Ok(new { mensaje = "Contenido actualizado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar contenido {Id}", id);
                return StatusCode(500, new { mensaje = "Error al actualizar: " + ex.Message });
            }
        }

        // ============================================================
        // PUT: api/contenido-publico/reordenar/{pagina}
        // Reordena todos los bloques de una página según el orden enviado
        // ============================================================
        [HttpPut("reordenar/{pagina}")]
        [Authorize(Roles = "Administrador,Director,Sub Director")]
        public async Task<ActionResult> ReordenarContenido(string pagina, [FromBody] ReordenarRequest request)
        {
            try
            {
                if (request?.IdsEnOrden == null || request.IdsEnOrden.Count == 0)
                    return BadRequest(new { mensaje = "Debe enviar el orden de los bloques" });

                var bloques = await _context.ContenidoPublico
                    .Where(c => c.Pagina == pagina)
                    .ToListAsync();

                var usuario = User.FindFirst(ClaimTypes.Name)?.Value ?? "Desconocido";

                for (int i = 0; i < request.IdsEnOrden.Count; i++)
                {
                    var id = request.IdsEnOrden[i];
                    var bloque = bloques.FirstOrDefault(b => b.IdContenido == id);
                    if (bloque != null)
                    {
                        bloque.Orden = i + 1;
                        bloque.FechaModificacion = DateTime.Now;
                        bloque.ModificadoPor = usuario;
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { mensaje = "Orden actualizado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al reordenar contenido de {Pagina}", pagina);
                return StatusCode(500, new { mensaje = "Error al reordenar: " + ex.Message });
            }
        }

        // ============================================================
        // DELETE: api/contenido-publico/{id}
        // ============================================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador,Director,Sub Director")]
        public async Task<ActionResult> EliminarContenido(int id)
        {
            try
            {
                var contenido = await _context.ContenidoPublico.FindAsync(id);
                if (contenido == null)
                    return NotFound(new { mensaje = "Contenido no encontrado" });

                _context.ContenidoPublico.Remove(contenido);
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = "Contenido eliminado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar contenido {Id}", id);
                return StatusCode(500, new { mensaje = "Error al eliminar: " + ex.Message });
            }
        }

        // ============================================================
        // POST: api/contenido-publico/imagen
        // ============================================================
        [HttpPost("imagen")]
        [Authorize(Roles = "Administrador,Director,Sub Director")]
        public async Task<ActionResult> SubirImagen([FromForm] ImagenPublicaRequest request)
        {
            try
            {
                if (request.Archivo == null || request.Archivo.Length == 0)
                    return BadRequest(new { mensaje = "Debe seleccionar un archivo" });

                if (string.IsNullOrWhiteSpace(request.Pagina))
                    return BadRequest(new { mensaje = "Debe indicar la página" });

                var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
                var extension = Path.GetExtension(request.Archivo.FileName).ToLowerInvariant();

                if (!extensionesPermitidas.Contains(extension))
                    return BadRequest(new { mensaje = "Solo se permiten imágenes (jpg, png, gif, webp, svg)" });

                var carpeta = Path.Combine(_env.WebRootPath, "uploads", "contenido_publico", request.Pagina);
                if (!Directory.Exists(carpeta))
                    Directory.CreateDirectory(carpeta);

                var nombreArchivo = $"{Guid.NewGuid():N}_{Path.GetFileName(request.Archivo.FileName)}";
                var rutaFisica = Path.Combine(carpeta, nombreArchivo);

                using (var stream = new FileStream(rutaFisica, FileMode.Create))
                {
                    await request.Archivo.CopyToAsync(stream);
                }

                var rutaRelativa = $"/uploads/contenido_publico/{request.Pagina}/{nombreArchivo}";
                var usuario = User.FindFirst(ClaimTypes.Name)?.Value ?? "Desconocido";

                var imagen = new ImagenPublica
                {
                    Pagina = request.Pagina,
                    Seccion = request.Seccion,
                    NombreArchivo = request.Archivo.FileName,
                    Ruta = rutaRelativa,
                    Descripcion = request.Descripcion,
                    FechaSubida = DateTime.Now,
                    SubidaPor = usuario,
                    Activo = true
                };

                _context.ImagenesPublicas.Add(imagen);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    mensaje = "Imagen subida correctamente",
                    id = imagen.IdImagen,
                    ruta = imagen.Ruta,
                    url = imagen.Ruta
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir imagen");
                return StatusCode(500, new { mensaje = "Error al subir imagen: " + ex.Message });
            }
        }

        // ============================================================
        // GET: api/contenido-publico/imagenes/{pagina}
        // ============================================================
        [HttpGet("imagenes/{pagina}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetImagenes(string pagina)
        {
            try
            {
                var imagenes = await _context.ImagenesPublicas
                    .Where(i => i.Pagina == pagina && i.Activo)
                    .OrderByDescending(i => i.FechaSubida)
                    .ToListAsync();

                return Ok(imagenes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener imágenes");
                return StatusCode(500, new { mensaje = "Error al obtener imágenes" });
            }
        }

        // ============================================================
        // DELETE: api/contenido-publico/imagen/{id}
        // ============================================================
        [HttpDelete("imagen/{id}")]
        [Authorize(Roles = "Administrador,Director,Sub Director")]
        public async Task<ActionResult> EliminarImagen(int id)
        {
            try
            {
                var imagen = await _context.ImagenesPublicas.FindAsync(id);
                if (imagen == null)
                    return NotFound(new { mensaje = "Imagen no encontrada" });

                var rutaFisica = Path.Combine(_env.WebRootPath, imagen.Ruta.TrimStart('/'));
                if (System.IO.File.Exists(rutaFisica))
                    System.IO.File.Delete(rutaFisica);

                _context.ImagenesPublicas.Remove(imagen);
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = "Imagen eliminada correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar imagen {Id}", id);
                return StatusCode(500, new { mensaje = "Error al eliminar: " + ex.Message });
            }
        }
    }

    // ============================================================
    // DTOs
    // ============================================================
    public class ContenidoPublicoDto
    {
        public string Pagina { get; set; } = "";
        public string Seccion { get; set; } = "";
        public string? Titulo { get; set; }
        public string? Contenido { get; set; }
        public string? ImagenUrl { get; set; }
        public string? ImagenConfig { get; set; }
        public int Orden { get; set; } = 0;
        public bool Activo { get; set; } = true;
    }

    public class ImagenPublicaRequest
    {
        public string Pagina { get; set; } = "";
        public string? Seccion { get; set; }
        public string? Descripcion { get; set; }
        public IFormFile? Archivo { get; set; }
    }

    public class ReordenarRequest
    {
        public List<int> IdsEnOrden { get; set; } = new();
    }
}