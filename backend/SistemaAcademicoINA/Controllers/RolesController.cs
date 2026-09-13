using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;

namespace SistemaAcademicoINA.Controllers;

// Controlador API (solo Administrador): gestiona los roles del sistema (consulta, creación, edición y desactivación).
[Authorize(Roles = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RolesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/roles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Rol>>> GetRoles()
    {
        var roles = await _context.Roles.ToListAsync();
        return Ok(roles);
    }

    // GET: api/roles/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Rol>> GetRol(int id)
    {
        var rol = await _context.Roles.FindAsync(id);
        if (rol == null)
            return NotFound();
        return Ok(rol);
    }

    // POST: api/roles
    [HttpPost]
    public async Task<ActionResult<Rol>> PostRol(Rol rol)
    {
        if (string.IsNullOrWhiteSpace(rol.NombreRol))
            return BadRequest(new { mensaje = "El nombre del rol es obligatorio" });

        var duplicado = await _context.Roles.AnyAsync(r => r.NombreRol == rol.NombreRol.Trim());
        if (duplicado)
            return BadRequest(new { mensaje = "Ya existe un rol con ese nombre" });

        // La tabla roles no usa AUTO_INCREMENT: se calcula el siguiente ID disponible.
        var maxId = await _context.Roles.MaxAsync(r => (int?)r.IdRol) ?? 0;
        rol.IdRol = maxId + 1;

        // No forzar estado: si el cliente no envía el campo, el default del modelo es activo.
        _context.Roles.Add(rol);
        await _context.SaveChangesAsync();
        return Ok(rol);
    }

    // PUT: api/roles/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> PutRol(int id, [FromBody] Rol rol)
    {
        var existente = await _context.Roles.FindAsync(id);
        if (existente == null)
            return NotFound();

        existente.NombreRol = rol.NombreRol;
        existente.Descripcion = rol.Descripcion;
        existente.NivelAcceso = rol.NivelAcceso;
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Rol actualizado" });
    }

    // DELETE: api/roles/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRol(int id)
    {
        var rol = await _context.Roles.FindAsync(id);
        if (rol == null)
            return NotFound();

        rol.Estado = false;
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Rol desactivado" });
    }
}