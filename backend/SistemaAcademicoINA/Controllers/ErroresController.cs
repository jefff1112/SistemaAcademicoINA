using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace SistemaAcademicoINA.Controllers;

// Controlador API: gestiona el registro de errores del sistema (consulta, resolución y eliminación).
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class ErroresController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ErroresController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: obtiene los errores del sistema, por defecto solo los no resueltos.
    [HttpGet]
    public async Task<IActionResult> GetErrores(bool soloNoResueltos = true)
    {
        try
        {
            var query = _context.ErroresSistema.AsQueryable();
            if (soloNoResueltos)
            {
                query = query.Where(e => !e.Resuelto);
            }

            var errores = await query
                .OrderByDescending(e => e.Fecha)
                .ToListAsync();

            return Ok(errores);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener errores", error = ex.Message });
        }
    }

    // PUT: marca un error del sistema como resuelto.
    [HttpPut("{id}/resolver")]
    public async Task<IActionResult> MarcarResuelto(int id)
    {
        try
        {
            var error = await _context.ErroresSistema.FindAsync(id);
            if (error == null)
                return NotFound(new { mensaje = "Error no encontrado" });

            error.Resuelto = true;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Error marcado como resuelto" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al marcar como resuelto", error = ex.Message });
        }
    }

    // DELETE: elimina un registro de error del sistema.
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteError(int id)
    {
        try
        {
            var error = await _context.ErroresSistema.FindAsync(id);
            if (error == null)
                return NotFound(new { mensaje = "Error no encontrado" });

            _context.ErroresSistema.Remove(error);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Error eliminado" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar", error = ex.Message });
        }
    }
}
