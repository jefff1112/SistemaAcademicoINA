using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using SistemaAcademicoINA.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SistemaAcademicoINA.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActividadesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ActividadesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ============================================================
    // GET: api/actividades/estructura-completa
    // ============================================================
    [HttpGet("estructura-completa")]
    public async Task<ActionResult<EstructuraCompletaResponse>> GetEstructuraCompleta(
        [FromQuery] int? idMateria = null,
        [FromQuery] int? idEspecialidad = null,
        [FromQuery] int idClase = 0,
        [FromQuery] int? idPeriodo = null,
        [FromQuery] int? idDocente = null)
    {
        try
        {
            if (idClase == 0)
                return BadRequest(new { mensaje = "idClase es requerido" });

            var clase = await _context.Clases
                .Include(c => c.Nivel)
                .Include(c => c.SeccionObj)
                .FirstOrDefaultAsync(c => c.IdClase == idClase);

            if (clase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            string nombreClaseSeguro = $"{clase.NombreClase ?? ""} - {clase.Seccion ?? ""}";

            Materia? materia = null;
            Especialidad? especialidad = null;
            bool esModulo = false;

            if (idMateria.HasValue)
            {
                materia = await _context.Materias.FindAsync(idMateria.Value);
                if (materia == null)
                    return NotFound(new { mensaje = "Materia no encontrada" });
            }
            else if (idEspecialidad.HasValue)
            {
                especialidad = await _context.Especialidades.FindAsync(idEspecialidad.Value);
                if (especialidad == null)
                    return NotFound(new { mensaje = "Especialidad no encontrada" });
                esModulo = true;
            }

            if (!idDocente.HasValue)
            {
                idDocente = await ObtenerIdDocenteActual();
            }

            var query = _context.Actividades
                .Where(a => a.IdClase == idClase && a.Estado == "Activo");

            if (idMateria.HasValue)
            {
                query = query.Where(a => a.IdMateria == idMateria.Value);
                if (idPeriodo.HasValue)
                    query = query.Where(a => a.IdPeriodo == idPeriodo.Value);
                if (idDocente.HasValue && idDocente.Value > 0)
                    query = query.Where(a => a.IdDocente == idDocente.Value);
            }
            else if (idEspecialidad.HasValue)
            {
                query = query.Where(a => a.IdEspecialidad == idEspecialidad.Value);
            }

            var actividades = await query
                .OrderBy(a => a.NumeroOrden > 0 ? a.NumeroOrden : 999)
                .ThenBy(a => a.FechaPublicacion)
                .Include(a => a.SubActividades.OrderBy(s => s.Orden))
                .ToListAsync();

            var actividadesDTO = actividades.Select(a => {
                var subsOrdenadas = (a.SubActividades ?? new List<SubActividad>()).OrderBy(s => s.Orden).ToList();
                var subsConNota = subsOrdenadas.Where(s => s.LlevaNota).ToList();
                var totalPondSub = subsConNota.Sum(s => s.Ponderacion);

                return new ActividadEstructuraDTO
                {
                    IdActividad = a.IdActividad,
                    IdMateria = a.IdMateria,
                    IdEspecialidad = a.IdEspecialidad,
                    IdClase = a.IdClase,
                    IdDocente = a.IdDocente,
                    IdPeriodo = a.IdPeriodo,
                    NombreActividad = a.NombreActividad ?? "",
                    TipoActividad = a.TipoActividad ?? "Actividad",
                    Ponderacion = a.Ponderacion,
                    FechaPublicacion = a.FechaPublicacion,
                    FechaLimite = a.FechaLimite,
                    Descripcion = a.Descripcion,
                    Especificacion = a.Especificacion,
                    Estado = a.Estado ?? "Activo",
                    IncluirAutoevaluacion = a.IncluirAutoevaluacion,
                    IncluirCoevaluacion = a.IncluirCoevaluacion,
                    PonderacionAutoevaluacion = a.PonderacionAutoevaluacion,
                    PonderacionCoevaluacion = a.PonderacionCoevaluacion,
                    EsModulo = a.EsModulo,
                    NumeroOrden = a.NumeroOrden,
                    PonderacionValida = a.Ponderacion > 0,
                    SubActividades = subsOrdenadas.Select(sa => new SubActividadEstructuraDTO
                    {
                        IdSubActividad = sa.IdSubActividad,
                        IdActividad = sa.IdActividad,
                        NombreSubActividad = sa.NombreSubActividad ?? "",
                        TipoSubActividad = sa.TipoSubActividad ?? "Subactividad",
                        Ponderacion = sa.Ponderacion,
                        Orden = sa.Orden,
                        NumeroOrden = sa.NumeroOrden,
                        EsVertical = sa.EsVertical,
                        NombreDisplay = sa.NombreDisplay,
                        CssClass = sa.CssClass,
                        LlevaNota = sa.LlevaNota,
                        EsAutoevaluacion = sa.EsAutoevaluacion,
                        EsCoevaluacion = sa.EsCoevaluacion,
                        EsPruebaObjetiva = sa.EsPruebaObjetiva,
                        EsActividadModulo = sa.EsActividadModulo,
                        EsRecuperacionModulo = sa.EsRecuperacionModulo,
                        Icono = sa.Icono
                    }).ToList(),
                    TotalPonderacionSub = totalPondSub,
                    SubPonderacionesValidas = Math.Abs(totalPondSub - 100) < 0.01m
                };
            }).ToList();

            var totalPonderacionActividades = actividadesDTO.Sum(a => a.Ponderacion);

            string? nombrePeriodo = null;
            int? anioLectivo = null;
            if (idPeriodo.HasValue)
            {
                var periodo = await _context.PeriodosAcademicos.FindAsync(idPeriodo.Value);
                if (periodo != null)
                {
                    nombrePeriodo = periodo.Nombre;
                    anioLectivo = periodo.AnioLectivo;
                }
            }
            else
            {
                var periodoActivo = await _context.PeriodosAcademicos
                    .FirstOrDefaultAsync(p => p.Estado == "Activo");
                if (periodoActivo != null)
                {
                    nombrePeriodo = periodoActivo.Nombre;
                    anioLectivo = periodoActivo.AnioLectivo;
                }
            }

            return Ok(new EstructuraCompletaResponse
            {
                Actividades = actividadesDTO,
                TotalPonderacionActividades = totalPonderacionActividades,
                PonderacionRestante = Math.Max(0, 100 - totalPonderacionActividades),
                EsValidaTotal = Math.Abs(totalPonderacionActividades - 100) < 0.01m,
                EsModulo = esModulo,
                NombreMateria = materia?.NombreMateria,
                NombreEspecialidad = especialidad?.NombreEspecialidad,
                NombreClase = nombreClaseSeguro,
                IdPeriodo = idPeriodo,
                NombrePeriodo = nombrePeriodo,
                AnioLectivo = anioLectivo
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener estructura", error = ex.Message });
        }
    }

    // ============================================================
    // POST: api/actividades/crear-estructura-predeterminada
    // ============================================================
    [HttpPost("crear-estructura-predeterminada")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> CrearEstructuraPredeterminada([FromBody] CrearEstructuraPredeterminadaRequest request)
    {
        try
        {
            bool esModulo = request.IdEspecialidad.HasValue;

            if (!esModulo && !request.IdPeriodo.HasValue)
                return BadRequest(new { mensaje = "El período es obligatorio para materias básicas" });

            var queryExiste = _context.Actividades
                .Where(a => a.IdClase == request.IdClase && a.Estado == "Activo");

            if (request.IdMateria.HasValue)
            {
                queryExiste = queryExiste.Where(a => a.IdMateria == request.IdMateria.Value);
                if (request.IdPeriodo.HasValue)
                    queryExiste = queryExiste.Where(a => a.IdPeriodo == request.IdPeriodo.Value);
            }
            else if (request.IdEspecialidad.HasValue)
            {
                queryExiste = queryExiste.Where(a => a.IdEspecialidad == request.IdEspecialidad.Value);
            }

            var existeActividades = await queryExiste.AnyAsync();

            if (existeActividades)
                return BadRequest(new { mensaje = "Ya existen actividades para esta materia/módulo." });

            int idDocente = request.IdDocente ?? await ObtenerIdDocenteActual();
            if (idDocente == 0)
                return BadRequest(new { mensaje = "No se pudo identificar el docente" });

            var plantilla = await _context.ActividadPlantillas
                .Include(p => p.DetallesActividades.OrderBy(d => d.OrdenActividad))
                    .ThenInclude(d => d.DetallesSubActividades.OrderBy(s => s.OrdenSub))
                .FirstOrDefaultAsync(p => p.EsPredeterminada && p.Estado == true);

            if (plantilla == null)
                return await CrearEstructuraINAHardcoded(request, idDocente);

            var actividadesCreadas = new List<object>();

            foreach (var actDetalle in plantilla.DetallesActividades.OrderBy(d => d.OrdenActividad))
            {
                var actividad = new Actividad
                {
                    IdMateria = request.IdMateria,
                    IdEspecialidad = request.IdEspecialidad,
                    IdClase = request.IdClase,
                    IdDocente = idDocente,
                    IdPeriodo = esModulo ? null : request.IdPeriodo,
                    NombreActividad = actDetalle.NombreActividad ?? "Actividad",
                    TipoActividad = actDetalle.TipoActividad ?? "Actividad",
                    Ponderacion = actDetalle.PonderacionActividad,
                    FechaPublicacion = DateTime.Now,
                    FechaLimite = DateTime.Now.AddDays(60),
                    Descripcion = "Actividad creada desde plantilla predeterminada INA",
                    Estado = "Activo",
                    CreatedAt = DateTime.Now,
                    IncluirAutoevaluacion = actDetalle.IncluirAutoevaluacion,
                    IncluirCoevaluacion = actDetalle.IncluirCoevaluacion,
                    PonderacionAutoevaluacion = actDetalle.PonderacionAutoevaluacion ?? 0,
                    PonderacionCoevaluacion = actDetalle.PonderacionCoevaluacion ?? 0,
                    EsModulo = esModulo,
                    NumeroOrden = actDetalle.NumeroOrden > 0 ? actDetalle.NumeroOrden : actDetalle.OrdenActividad
                };

                _context.Actividades.Add(actividad);
                await _context.SaveChangesAsync();

                var subActividadesCreadas = new List<object>();
                foreach (var subDetalle in actDetalle.DetallesSubActividades.OrderBy(s => s.OrdenSub))
                {
                    var subActividad = new SubActividad
                    {
                        IdActividad = actividad.IdActividad,
                        NombreSubActividad = subDetalle.NombreSubActividad ?? "Sub",
                        TipoSubActividad = subDetalle.TipoSubActividad ?? "Subactividad",
                        Ponderacion = subDetalle.PonderacionSub,
                        Orden = subDetalle.OrdenSub > 0 ? subDetalle.OrdenSub : 1,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now,
                        EsVertical = subDetalle.EsVertical,
                        NumeroOrden = subDetalle.NumeroOrden
                    };
                    _context.SubActividades.Add(subActividad);
                    subActividadesCreadas.Add(new
                    {
                        subDetalle.NombreSubActividad,
                        subDetalle.TipoSubActividad,
                        subDetalle.PonderacionSub,
                        subDetalle.EsVertical
                    });
                }

                actividadesCreadas.Add(new
                {
                    actividad.IdActividad,
                    actividad.NombreActividad,
                    actividad.Ponderacion,
                    actividad.EsModulo,
                    actividad.NumeroOrden,
                    SubActividades = subActividadesCreadas
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Estructura predeterminada INA creada correctamente",
                actividadesCreadas
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear estructura predeterminada", error = ex.Message });
        }
    }

    // ============================================================
    // FALLBACK: Estructura INA hardcoded
    // ============================================================
    private async Task<IActionResult> CrearEstructuraINAHardcoded(CrearEstructuraPredeterminadaRequest request, int idDocente)
    {
        try
        {
            var esModulo = request.IdEspecialidad.HasValue;
            var estructuraBase = new List<object>();

            if (!esModulo)
            {
                estructuraBase.Add(new
                {
                    Nombre = "Actividad 1",
                    Ponderacion = 35m,
                    Orden = 1,
                    AutoEval = true,
                    CoEval = true,
                    Subs = new[] {
                        new { Nombre = "Sub-actividad 1", Pond = 14m, Orden = 1, Tipo = "Subactividad" },
                        new { Nombre = "Sub-actividad 2", Pond = 14m, Orden = 2, Tipo = "Subactividad" },
                        new { Nombre = "Sub-actividad 3", Pond = 14m, Orden = 3, Tipo = "Subactividad" },
                        new { Nombre = "Sub-actividad 4", Pond = 14m, Orden = 4, Tipo = "Subactividad" },
                        new { Nombre = "Sub-actividad 5", Pond = 14m, Orden = 5, Tipo = "Subactividad" },
                        new { Nombre = "Autoevaluación", Pond = 15m, Orden = 6, Tipo = "Autoevaluacion" },
                        new { Nombre = "Coevaluación", Pond = 15m, Orden = 7, Tipo = "Coevaluacion" }
                    }
                });
                estructuraBase.Add(new
                {
                    Nombre = "Actividad 2",
                    Ponderacion = 35m,
                    Orden = 2,
                    AutoEval = true,
                    CoEval = true,
                    Subs = new[] {
                        new { Nombre = "Sub-actividad 1", Pond = 14m, Orden = 1, Tipo = "Subactividad" },
                        new { Nombre = "Sub-actividad 2", Pond = 14m, Orden = 2, Tipo = "Subactividad" },
                        new { Nombre = "Sub-actividad 3", Pond = 14m, Orden = 3, Tipo = "Subactividad" },
                        new { Nombre = "Sub-actividad 4", Pond = 14m, Orden = 4, Tipo = "Subactividad" },
                        new { Nombre = "Sub-actividad 5", Pond = 14m, Orden = 5, Tipo = "Subactividad" },
                        new { Nombre = "Autoevaluación", Pond = 15m, Orden = 6, Tipo = "Autoevaluacion" },
                        new { Nombre = "Coevaluación", Pond = 15m, Orden = 7, Tipo = "Coevaluacion" }
                    }
                });
                estructuraBase.Add(new
                {
                    Nombre = "Actividad 3",
                    Ponderacion = 30m,
                    Orden = 3,
                    AutoEval = false,
                    CoEval = false,
                    Subs = new[] {
                        new { Nombre = "Prueba Objetiva 1", Pond = 34m, Orden = 1, Tipo = "PruebaObjetiva" },
                        new { Nombre = "Prueba Objetiva 2", Pond = 33m, Orden = 2, Tipo = "PruebaObjetiva" },
                        new { Nombre = "Prueba Objetiva 3", Pond = 33m, Orden = 3, Tipo = "PruebaObjetiva" }
                    }
                });
            }
            else
            {
                estructuraBase.Add(new
                {
                    Nombre = "Módulo 1",
                    Ponderacion = 35m,
                    Orden = 1,
                    AutoEval = false,
                    CoEval = false,
                    Subs = new[] {
                        new { Nombre = "Actividad 1", Pond = 50m, Orden = 1, Tipo = "ActividadModulo" },
                        new { Nombre = "Actividad 2", Pond = 50m, Orden = 2, Tipo = "ActividadModulo" }
                    }
                });
                estructuraBase.Add(new
                {
                    Nombre = "Módulo 2",
                    Ponderacion = 35m,
                    Orden = 2,
                    AutoEval = false,
                    CoEval = false,
                    Subs = new[] {
                        new { Nombre = "Actividad 1", Pond = 50m, Orden = 1, Tipo = "ActividadModulo" },
                        new { Nombre = "Actividad 2", Pond = 50m, Orden = 2, Tipo = "ActividadModulo" }
                    }
                });
                estructuraBase.Add(new
                {
                    Nombre = "Módulo 3",
                    Ponderacion = 30m,
                    Orden = 3,
                    AutoEval = false,
                    CoEval = false,
                    Subs = new[] {
                        new { Nombre = "Actividad 1", Pond = 50m, Orden = 1, Tipo = "ActividadModulo" },
                        new { Nombre = "Actividad 2", Pond = 50m, Orden = 2, Tipo = "ActividadModulo" }
                    }
                });
            }

            var creadas = new List<object>();
            foreach (dynamic act in estructuraBase)
            {
                var actividad = new Actividad
                {
                    IdMateria = request.IdMateria,
                    IdEspecialidad = request.IdEspecialidad,
                    IdClase = request.IdClase,
                    IdDocente = idDocente,
                    IdPeriodo = esModulo ? null : request.IdPeriodo,
                    NombreActividad = act.Nombre,
                    TipoActividad = esModulo ? "Modulo" : "Actividad",
                    Ponderacion = act.Ponderacion,
                    FechaPublicacion = DateTime.Now,
                    FechaLimite = DateTime.Now.AddDays(60),
                    Descripcion = esModulo ? "Módulo INA predeterminado" : "Actividad INA predeterminada",
                    Estado = "Activo",
                    CreatedAt = DateTime.Now,
                    IncluirAutoevaluacion = act.AutoEval,
                    IncluirCoevaluacion = act.CoEval,
                    EsModulo = esModulo,
                    NumeroOrden = act.Orden
                };
                _context.Actividades.Add(actividad);
                await _context.SaveChangesAsync();

                foreach (dynamic sub in act.Subs)
                {
                    var tipoSub = (string)sub.Tipo;
                    _context.SubActividades.Add(new SubActividad
                    {
                        IdActividad = actividad.IdActividad,
                        NombreSubActividad = sub.Nombre,
                        TipoSubActividad = tipoSub,
                        Ponderacion = sub.Pond,
                        Orden = sub.Orden,
                        EsVertical = tipoSub == "Autoevaluacion" || tipoSub == "Coevaluacion" || tipoSub == "PruebaObjetiva",
                        NumeroOrden = sub.Orden,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    });
                }
                creadas.Add(new { actividad.IdActividad, actividad.NombreActividad, actividad.Ponderacion });
            }
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Estructura INA creada correctamente (modo fallback)",
                actividadesCreadas = creadas
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error creando estructura INA", error = ex.Message });
        }
    }

    // ============================================================
    // POST: api/actividades/crear
    // ============================================================
    [HttpPost("crear")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> CrearActividad([FromBody] CrearActividadRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.NombreActividad))
                return BadRequest(new { mensaje = "El nombre de la actividad es requerido" });

            if (request.Ponderacion <= 0 || request.Ponderacion > 100)
                return BadRequest(new { mensaje = "La ponderación debe estar entre 0.01 y 100" });

            bool esModulo = request.EsModulo || request.IdEspecialidad.HasValue;

            if (!esModulo && !request.IdPeriodo.HasValue)
                return BadRequest(new { mensaje = "El período es obligatorio para materias básicas" });

            var queryPonderacion = _context.Actividades
                .Where(a => a.IdClase == request.IdClase && a.Estado == "Activo");

            if (request.IdMateria.HasValue)
            {
                queryPonderacion = queryPonderacion.Where(a => a.IdMateria == request.IdMateria.Value);
                if (request.IdPeriodo.HasValue)
                    queryPonderacion = queryPonderacion.Where(a => a.IdPeriodo == request.IdPeriodo.Value);
            }
            else if (request.IdEspecialidad.HasValue)
            {
                queryPonderacion = queryPonderacion.Where(a => a.IdEspecialidad == request.IdEspecialidad.Value);
            }

            var totalActual = await queryPonderacion.SumAsync(a => a.Ponderacion);
            if (totalActual + request.Ponderacion > 100.01m)
                return BadRequest(new { mensaje = $"La suma de ponderaciones excedería 100%" });

            int idDocente = request.IdDocente ?? await ObtenerIdDocenteActual();
            if (idDocente == 0)
                return BadRequest(new { mensaje = "No se pudo identificar el docente" });

            var maxOrden = await _context.Actividades
                .Where(a => a.IdClase == request.IdClase && a.Estado == "Activo")
                .MaxAsync(a => (int?)a.NumeroOrden) ?? 0;

            var actividad = new Actividad
            {
                IdMateria = request.IdMateria,
                IdEspecialidad = request.IdEspecialidad,
                IdClase = request.IdClase,
                IdDocente = idDocente,
                IdPeriodo = esModulo ? null : request.IdPeriodo,
                NombreActividad = request.NombreActividad,
                TipoActividad = request.TipoActividad,
                Ponderacion = request.Ponderacion,
                FechaPublicacion = request.FechaPublicacion ?? DateTime.Now,
                FechaLimite = request.FechaLimite ?? DateTime.Now.AddDays(30),
                Descripcion = request.Descripcion,
                Especificacion = request.Especificacion,
                IncluirAutoevaluacion = request.IncluirAutoevaluacion,
                IncluirCoevaluacion = request.IncluirCoevaluacion,
                PonderacionAutoevaluacion = request.PonderacionAutoevaluacion,
                PonderacionCoevaluacion = request.PonderacionCoevaluacion,
                EsModulo = esModulo,
                NumeroOrden = maxOrden + 1,
                Estado = "Activo",
                CreatedAt = DateTime.Now
            };

            _context.Actividades.Add(actividad);
            await _context.SaveChangesAsync();

            if (request.IncluirAutoevaluacion)
            {
                _context.SubActividades.Add(new SubActividad
                {
                    IdActividad = actividad.IdActividad,
                    NombreSubActividad = "Autoevaluación",
                    TipoSubActividad = "Autoevaluacion",
                    Ponderacion = request.PonderacionAutoevaluacion,
                    Orden = (await _context.SubActividades.Where(s => s.IdActividad == actividad.IdActividad).MaxAsync(s => (int?)s.Orden) ?? 0) + 1,
                    EsVertical = true,
                    NumeroOrden = 0,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                });
            }

            if (request.IncluirCoevaluacion)
            {
                _context.SubActividades.Add(new SubActividad
                {
                    IdActividad = actividad.IdActividad,
                    NombreSubActividad = "Coevaluación",
                    TipoSubActividad = "Coevaluacion",
                    Ponderacion = request.PonderacionCoevaluacion,
                    Orden = (await _context.SubActividades.Where(s => s.IdActividad == actividad.IdActividad).MaxAsync(s => (int?)s.Orden) ?? 0) + 1,
                    EsVertical = true,
                    NumeroOrden = 0,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Actividad creada correctamente", id = actividad.IdActividad });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear actividad", error = ex.Message });
        }
    }

    // ============================================================
    // POST: api/actividades/{id}/crear-subactividad
    // ============================================================
    [HttpPost("{id}/crear-subactividad")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> CrearSubActividad(int id, [FromBody] CrearSubActividadRequest request)
    {
        try
        {
            var actividad = await _context.Actividades.FindAsync(id);
            if (actividad == null)
                return NotFound(new { mensaje = "Actividad no encontrada" });

            if (string.IsNullOrWhiteSpace(request.NombreSubActividad))
                return BadRequest(new { mensaje = "El nombre de la sub-actividad es requerido" });

            var totalActual = await _context.SubActividades
                .Where(s => s.IdActividad == id)
                .SumAsync(s => s.Ponderacion);

            if (request.Ponderacion > 0 && totalActual + request.Ponderacion > 100.01m)
                return BadRequest(new { mensaje = $"La suma de ponderaciones excedería 100%" });

            if (request.TipoSubActividad == "RecuperacionModulo" && !actividad.EsModulo)
                return BadRequest(new { mensaje = "La Recuperación de Módulo solo puede agregarse a módulos" });

            bool esVertical = request.TipoSubActividad switch
            {
                "Autoevaluacion" or "Coevaluacion" or "PruebaObjetiva" or "RecuperacionModulo" => true,
                _ => false
            };

            int ordenFinal = request.Orden;
            if (ordenFinal <= 0)
            {
                ordenFinal = (await _context.SubActividades.Where(s => s.IdActividad == id).MaxAsync(s => (int?)s.Orden) ?? 0) + 1;
            }

            var subActividad = new SubActividad
            {
                IdActividad = id,
                NombreSubActividad = request.NombreSubActividad,
                TipoSubActividad = request.TipoSubActividad,
                Ponderacion = request.Ponderacion,
                Orden = ordenFinal,
                EsVertical = esVertical,
                NumeroOrden = request.NumeroOrden,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.SubActividades.Add(subActividad);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Sub-actividad creada correctamente", id = subActividad.IdSubActividad });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear sub-actividad", error = ex.Message });
        }
    }

    // ============================================================
    // PUT: api/actividades/{id}
    // ============================================================
    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> PutActividad(int id, [FromBody] CrearActividadRequest request)
    {
        try
        {
            var actividad = await _context.Actividades.FindAsync(id);
            if (actividad == null)
                return NotFound(new { mensaje = "Actividad no encontrada" });

            if (string.IsNullOrWhiteSpace(request.NombreActividad))
                return BadRequest(new { mensaje = "El nombre de la actividad es requerido" });

            if (request.Ponderacion <= 0 || request.Ponderacion > 100)
                return BadRequest(new { mensaje = "La ponderación debe estar entre 0.01 y 100" });

            var queryPonderacion = _context.Actividades
                .Where(a => a.IdClase == request.IdClase && a.Estado == "Activo" && a.IdActividad != id);

            if (request.IdMateria.HasValue)
            {
                queryPonderacion = queryPonderacion.Where(a => a.IdMateria == request.IdMateria.Value);
                if (request.IdPeriodo.HasValue)
                    queryPonderacion = queryPonderacion.Where(a => a.IdPeriodo == request.IdPeriodo.Value);
            }
            else if (request.IdEspecialidad.HasValue)
            {
                queryPonderacion = queryPonderacion.Where(a => a.IdEspecialidad == request.IdEspecialidad.Value);
            }

            var totalActual = await queryPonderacion.SumAsync(a => a.Ponderacion);
            if (totalActual + request.Ponderacion > 100.01m)
                return BadRequest(new { mensaje = $"La suma de ponderaciones excedería 100%" });

            actividad.NombreActividad = request.NombreActividad;
            actividad.TipoActividad = request.TipoActividad;
            actividad.Ponderacion = request.Ponderacion;
            actividad.FechaPublicacion = request.FechaPublicacion ?? actividad.FechaPublicacion;
            actividad.FechaLimite = request.FechaLimite ?? actividad.FechaLimite;
            actividad.Descripcion = request.Descripcion;
            actividad.Especificacion = request.Especificacion;
            actividad.EsModulo = request.EsModulo;
            actividad.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Actividad actualizada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar actividad", error = ex.Message });
        }
    }

    // ============================================================
    // PUT: api/actividades/subactividad/{id}
    // ============================================================
    [HttpPut("subactividad/{id}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> PutSubActividad(int id, [FromBody] CrearSubActividadRequest request)
    {
        try
        {
            var subActividad = await _context.SubActividades
                .Include(s => s.Actividad)
                .FirstOrDefaultAsync(s => s.IdSubActividad == id);

            if (subActividad == null)
                return NotFound(new { mensaje = "Sub-actividad no encontrada" });

            if (string.IsNullOrWhiteSpace(request.NombreSubActividad))
                return BadRequest(new { mensaje = "El nombre de la sub-actividad es requerido" });

            var totalActual = await _context.SubActividades
                .Where(s => s.IdActividad == subActividad.IdActividad && s.IdSubActividad != id)
                .SumAsync(s => s.Ponderacion);

            if (request.Ponderacion > 0 && totalActual + request.Ponderacion > 100.01m)
                return BadRequest(new { mensaje = $"La suma de ponderaciones excedería 100%" });

            subActividad.NombreSubActividad = request.NombreSubActividad;
            subActividad.TipoSubActividad = request.TipoSubActividad;
            subActividad.Ponderacion = request.Ponderacion;
            subActividad.Orden = request.Orden;
            subActividad.NumeroOrden = request.NumeroOrden;
            subActividad.EsVertical = request.EsVertical;
            subActividad.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Sub-actividad actualizada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al actualizar sub-actividad", error = ex.Message });
        }
    }

    // ============================================================
    // DELETE: api/actividades/{id}
    // ============================================================
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> DeleteActividad(int id)
    {
        try
        {
            var actividad = await _context.Actividades.FindAsync(id);
            if (actividad == null)
                return NotFound(new { mensaje = "Actividad no encontrada" });

            actividad.Estado = "Cerrado";
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Actividad desactivada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar actividad", error = ex.Message });
        }
    }

    // ============================================================
    // DELETE: api/actividades/subactividad/{id}
    // ============================================================
    [HttpDelete("subactividad/{id}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> DeleteSubActividad(int id)
    {
        try
        {
            var subActividad = await _context.SubActividades.FindAsync(id);
            if (subActividad == null)
                return NotFound(new { mensaje = "Sub-actividad no encontrada" });

            _context.SubActividades.Remove(subActividad);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Sub-actividad eliminada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al eliminar sub-actividad", error = ex.Message });
        }
    }

    // ============================================================
    // POST: api/actividades/redistribuir-ponderaciones
    // ============================================================
    [HttpPost("redistribuir-ponderaciones")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> RedistribuirPonderaciones([FromBody] RedistribuirPonderacionesRequest request)
    {
        try
        {
            var queryRedistribuir = _context.Actividades
                .Where(a => a.IdClase == request.IdClase && a.Estado == "Activo");

            if (request.IdMateria.HasValue)
            {
                queryRedistribuir = queryRedistribuir.Where(a => a.IdMateria == request.IdMateria.Value);
                if (request.IdPeriodo.HasValue)
                    queryRedistribuir = queryRedistribuir.Where(a => a.IdPeriodo == request.IdPeriodo.Value);
                if (request.IdDocente > 0)
                    queryRedistribuir = queryRedistribuir.Where(a => a.IdDocente == request.IdDocente);
            }
            else if (request.IdEspecialidad.HasValue)
            {
                queryRedistribuir = queryRedistribuir.Where(a => a.IdEspecialidad == request.IdEspecialidad.Value);
            }

            var actividades = await queryRedistribuir
                .OrderBy(a => a.FechaPublicacion)
                .ToListAsync();

            if (!actividades.Any())
                return BadRequest(new { mensaje = "No hay actividades para redistribuir" });

            if (actividades.Count == 1)
            {
                actividades[0].Ponderacion = 100m;
                await _context.SaveChangesAsync();
                return Ok(new { mensaje = "Ponderación ajustada a 100%", actividad = actividades[0] });
            }

            int baseValue = 100 / actividades.Count;
            int remainder = 100 % actividades.Count;

            for (int i = 0; i < actividades.Count; i++)
            {
                actividades[i].Ponderacion = i < remainder ? baseValue + 1 : baseValue;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = $"Ponderaciones redistribuidas (Algoritmo Hamilton)",
                actividades = actividades.Select(a => new { a.IdActividad, a.NombreActividad, a.Ponderacion }).ToList()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al redistribuir ponderaciones", error = ex.Message });
        }
    }

    // ============================================================
    // POST: api/actividades/redistribuir-subactividades/{idActividad}
    // ============================================================
    [HttpPost("redistribuir-subactividades/{idActividad}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> RedistribuirSubActividades(int idActividad)
    {
        try
        {
            var actividad = await _context.Actividades.FindAsync(idActividad);
            if (actividad == null)
                return NotFound(new { mensaje = "Actividad no encontrada" });

            var subActividades = await _context.SubActividades
                .Where(s => s.IdActividad == idActividad && s.TipoSubActividad == "Subactividad")
                .OrderBy(s => s.Orden)
                .ToListAsync();

            if (!subActividades.Any())
                return BadRequest(new { mensaje = "No hay sub-actividades normales para redistribuir" });

            if (subActividades.Count == 1)
            {
                subActividades[0].Ponderacion = 100m;
                await _context.SaveChangesAsync();
                return Ok(new { mensaje = "Ponderación ajustada a 100%", subActividad = subActividades[0] });
            }

            int baseValue = 100 / subActividades.Count;
            int remainder = 100 % subActividades.Count;

            for (int i = 0; i < subActividades.Count; i++)
            {
                subActividades[i].Ponderacion = i < remainder ? baseValue + 1 : baseValue;
                subActividades[i].UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = $"Sub-actividades redistribuidas (Algoritmo Hamilton)",
                subActividades = subActividades.Select(s => new { s.IdSubActividad, s.NombreSubActividad, s.Ponderacion }).ToList()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al redistribuir sub-actividades", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/actividades/mis-clases
    // FIX: queryAsignaciones declarado como IQueryable<DocenteMateria>
    // ============================================================
    [HttpGet("mis-clases")]
    public async Task<ActionResult> GetMisClases()
    {
        try
        {
            var rol = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            bool esDocente = rol == "Docente";

            int idDocente = await ObtenerIdDocenteActual();
            if (esDocente && idDocente == 0)
                return BadRequest(new { mensaje = "No se pudo identificar al docente actual" });

            var clasesMap = new Dictionary<int, ClaseResumenDto>();

            var todasLasClases = await _context.Clases
                .Where(c => c.Estado == true)
                .Include(c => c.Nivel)
                .Include(c => c.Especialidad)
                .ToListAsync();

            // FIX: declarar explícitamente como IQueryable<DocenteMateria>
            IQueryable<DocenteMateria> queryAsignaciones = _context.DocenteMaterias
                .Where(dm => dm.Estado == true)
                .Include(dm => dm.Materia);

            if (esDocente)
                queryAsignaciones = queryAsignaciones.Where(dm => dm.IdDocente == idDocente);

            var asignaciones = await queryAsignaciones.ToListAsync();

            foreach (var a in asignaciones)
            {
                var clase = todasLasClases.FirstOrDefault(c => c.IdClase == a.IdClase);
                if (clase == null) continue;

                if (!clasesMap.TryGetValue(clase.IdClase, out var dto))
                {
                    dto = new ClaseResumenDto
                    {
                        IdClase = clase.IdClase,
                        NombreClase = clase.NombreClase ?? "",
                        Seccion = clase.Seccion ?? "",
                        Nivel = clase.Nivel?.NombreNivel ?? "",
                        EsEspecialidad = clase.IdEspecialidad.HasValue,
                        Especialidad = clase.IdEspecialidad.HasValue ? new EspecialidadResumenDto
                        {
                            Id = clase.Especialidad?.IdEspecialidad ?? 0,
                            Nombre = clase.Especialidad?.NombreEspecialidad ?? ""
                        } : null
                    };
                    clasesMap[clase.IdClase] = dto;
                }

                if (a.Materia != null && a.Materia.TipoMateria == "Basica")
                {
                    if (!dto.Materias.Any(m => m.IdMateria == a.Materia.IdMateria))
                        dto.Materias.Add(new MateriaResumenDto
                        {
                            IdMateria = a.Materia.IdMateria,
                            NombreMateria = a.Materia.NombreMateria ?? ""
                        });
                }
            }

            if (!esDocente)
            {
                var materiasBasicas = await _context.Materias
                    .Where(m => m.Estado == true && m.TipoMateria == "Basica")
                    .OrderBy(m => m.NombreMateria)
                    .ToListAsync();

                foreach (var clase in todasLasClases)
                {
                    if (!clasesMap.ContainsKey(clase.IdClase))
                    {
                        clasesMap[clase.IdClase] = new ClaseResumenDto
                        {
                            IdClase = clase.IdClase,
                            NombreClase = clase.NombreClase ?? "",
                            Seccion = clase.Seccion ?? "",
                            Nivel = clase.Nivel?.NombreNivel ?? "",
                            EsEspecialidad = clase.IdEspecialidad.HasValue,
                            Especialidad = clase.IdEspecialidad.HasValue ? new EspecialidadResumenDto
                            {
                                Id = clase.Especialidad?.IdEspecialidad ?? 0,
                                Nombre = clase.Especialidad?.NombreEspecialidad ?? ""
                            } : null,
                            Materias = materiasBasicas.Select(m => new MateriaResumenDto
                            {
                                IdMateria = m.IdMateria,
                                NombreMateria = m.NombreMateria ?? ""
                            }).ToList()
                        };
                    }
                }
            }

            if (esDocente && idDocente > 0)
            {
                var modulosAsignados = await _context.DocenteModulos
                    .Where(d => d.IdDocente == idDocente && d.Estado)
                    .Include(d => d.Clase).ThenInclude(c => c.Nivel)
                    .Include(d => d.Clase).ThenInclude(c => c.Especialidad)
                    .ToListAsync();

                foreach (var d in modulosAsignados.Where(d => d.Clase != null))
                {
                    var clase = d.Clase!;
                    if (clasesMap.ContainsKey(clase.IdClase))
                        continue;

                    clasesMap[clase.IdClase] = new ClaseResumenDto
                    {
                        IdClase = clase.IdClase,
                        NombreClase = clase.NombreClase ?? "",
                        Seccion = clase.Seccion ?? "",
                        Nivel = clase.Nivel?.NombreNivel ?? "",
                        EsEspecialidad = true,
                        Especialidad = new EspecialidadResumenDto
                        {
                            Id = clase.IdEspecialidad ?? 0,
                            Nombre = clase.Especialidad?.NombreEspecialidad ?? ""
                        }
                    };
                }
            }

            var clasesAgrupadas = clasesMap.Values
                .OrderBy(c => c.Nivel)
                .ThenBy(c => c.NombreClase)
                .ToList();

            var periodos = await _context.PeriodosAcademicos
                .Where(p => p.Estado == "Activo" || p.AnioLectivo == DateTime.Now.Year)
                .OrderBy(p => p.NumeroPeriodo)
                .Select(p => new
                {
                    p.IdPeriodo,
                    NombrePeriodo = p.Nombre,
                    p.NumeroPeriodo,
                    p.AnioLectivo,
                    p.Estado
                })
                .ToListAsync();

            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.IdDocente == idDocente);

            return Ok(new
            {
                docente = new
                {
                    docente?.IdDocente,
                    docente?.CodigoDocente,
                    NombreCompleto = docente != null ? $"{docente.Nombres} {docente.Apellidos}" : ""
                },
                clases = clasesAgrupadas,
                periodos,
                totalClases = clasesAgrupadas.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener sus clases", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/actividades/materias-seccion/{idClase}
    // ============================================================
    [HttpGet("materias-seccion/{idClase}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public async Task<ActionResult> GetMateriasSeccion(int idClase)
    {
        try
        {
            var clase = await _context.Clases
                .Include(c => c.Nivel)
                .Include(c => c.Especialidad)
                .FirstOrDefaultAsync(c => c.IdClase == idClase);

            if (clase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            var materiasBasicas = await _context.Materias
                .Where(m => m.Estado == true && m.TipoMateria == "Basica")
                .OrderBy(m => m.NombreMateria)
                .ToListAsync();

            var asignaciones = await _context.DocenteMaterias
                .Where(dm => dm.IdClase == idClase && dm.Estado == true)
                .ToListAsync();

            var materiasConEstado = materiasBasicas.Select(m =>
            {
                var asignacion = asignaciones.FirstOrDefault(a => a.IdMateria == m.IdMateria);
                return new
                {
                    idMateria = m.IdMateria,
                    nombreMateria = m.NombreMateria,
                    codigoMateria = m.CodigoMateria,
                    tipoMateria = m.TipoMateria,
                    asignada = asignacion != null,
                    idDocente = asignacion?.IdDocente,
                    idDocenteMateria = asignacion?.IdDocenteMateria
                };
            }).ToList();

            return Ok(new
            {
                clase = new
                {
                    idClase = clase.IdClase,
                    nombreClase = clase.NombreClase,
                    seccion = clase.Seccion,
                    nivel = clase.Nivel?.NombreNivel ?? "",
                    anioLectivo = clase.AnioLectivo
                },
                materias = materiasConEstado,
                totalMaterias = materiasBasicas.Count,
                totalAsignadas = materiasConEstado.Count(m => m.asignada)
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener materias", error = ex.Message });
        }
    }

    // ============================================================
    // POST: api/actividades/asignar-materias-seccion
    // ============================================================
    [HttpPost("asignar-materias-seccion")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public async Task<IActionResult> AsignarMateriasSeccion([FromBody] AsignarMateriasSeccionRequest request)
    {
        try
        {
            if (request == null || request.IdClase == 0)
                return BadRequest(new { mensaje = "Datos inválidos" });

            if (request.IdsMateria == null)
                request.IdsMateria = new List<int>();

            var clase = await _context.Clases.FindAsync(request.IdClase);
            if (clase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            var anioLectivo = clase.AnioLectivo > 0 ? clase.AnioLectivo : DateTime.Now.Year;

            var actuales = await _context.DocenteMaterias
                .Where(dm => dm.IdClase == request.IdClase)
                .ToListAsync();

            var idsActuales = actuales.Select(a => a.IdMateria).ToList();
            var idsNuevos = request.IdsMateria.Distinct().ToList();

            var idsAgregar = idsNuevos.Except(idsActuales).ToList();
            var idsEliminar = idsActuales.Except(idsNuevos).ToList();

            int agregadas = 0, eliminadas = 0, reactivadas = 0;

            foreach (var idMateria in idsAgregar)
            {
                _context.DocenteMaterias.Add(new DocenteMateria
                {
                    IdDocente = request.IdDocente > 0 ? request.IdDocente : 1,
                    IdMateria = idMateria,
                    IdClase = request.IdClase,
                    AnioLectivo = anioLectivo,
                    PuedeCalificar = true,
                    PuedeAmonestar = true,
                    Estado = true
                });
                agregadas++;
            }

            foreach (var idMateria in idsEliminar)
            {
                var asignacion = actuales.FirstOrDefault(a => a.IdMateria == idMateria);
                if (asignacion != null)
                {
                    asignacion.Estado = false;
                    eliminadas++;
                }
            }

            var reactivar = actuales.Where(a => idsNuevos.Contains(a.IdMateria) && !a.Estado).ToList();
            foreach (var r in reactivar)
            {
                r.Estado = true;
                reactivadas++;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = $"Materias actualizadas: {agregadas} agregadas, {eliminadas} removidas, {reactivadas} reactivadas",
                agregadas,
                eliminadas,
                reactivadas,
                totalAsignadas = idsNuevos.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al asignar materias", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/actividades/todas-clases
    // ============================================================
    [HttpGet("todas-clases")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public async Task<ActionResult> GetTodasClases()
    {
        try
        {
            var clases = await _context.Clases
                .Where(c => c.Estado == true)
                .Include(c => c.Nivel)
                .Include(c => c.Especialidad)
                .OrderBy(c => c.NombreClase)
                .ToListAsync();

            var materias = await _context.Materias
                .Where(m => m.Estado == true)
                .OrderBy(m => m.NombreMateria)
                .ToListAsync();

            var especialidades = await _context.Especialidades
                .Where(e => e.Estado == true)
                .OrderBy(e => e.NombreEspecialidad)
                .ToListAsync();

            var periodos = await _context.PeriodosAcademicos
                .Where(p => p.Estado == "Activo" || p.Estado == null)
                .OrderBy(p => p.NumeroPeriodo)
                .Select(p => new
                {
                    p.IdPeriodo,
                    NombrePeriodo = p.Nombre ?? $"Período {p.NumeroPeriodo}",
                    p.NumeroPeriodo,
                    p.AnioLectivo,
                    p.Estado
                })
                .ToListAsync();

            return Ok(new
            {
                clases = clases.Select(c => new
                {
                    c.IdClase,
                    NombreClase = c.NombreClase ?? "",
                    c.Seccion,
                    NivelNombre = c.Nivel?.NombreNivel ?? "",
                    IdEspecialidad = c.IdEspecialidad,
                    EspecialidadNombre = c.Especialidad?.NombreEspecialidad ?? "",
                    EsEspecialidad = c.IdEspecialidad.HasValue
                }).ToList(),
                materias = materias.Select(m => new
                {
                    m.IdMateria,
                    m.NombreMateria,
                    m.IdEspecialidad
                }).ToList(),
                especialidades = especialidades.Select(e => new
                {
                    e.IdEspecialidad,
                    e.NombreEspecialidad
                }).ToList(),
                periodos,
                totalClases = clases.Count,
                totalMaterias = materias.Count,
                totalEspecialidades = especialidades.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al cargar las clases.", detalle = ex.Message });
        }
    }

    // ============================================================
    // POST: api/actividades/reordenar-actividades
    // ============================================================
    [HttpPost("reordenar-actividades")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> ReordenarActividades([FromBody] ReordenarActividadesRequest request)
    {
        try
        {
            if (request.IdsActividadEnOrden == null || request.IdsActividadEnOrden.Count == 0)
                return BadRequest(new { mensaje = "No se proporcionaron IDs" });

            for (int i = 0; i < request.IdsActividadEnOrden.Count; i++)
            {
                var actividad = await _context.Actividades.FindAsync(request.IdsActividadEnOrden[i]);
                if (actividad != null)
                {
                    actividad.NumeroOrden = i + 1;
                    actividad.Orden = i + 1;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = $"{request.IdsActividadEnOrden.Count} actividades reordenadas" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al reordenar", error = ex.Message });
        }
    }

    // ============================================================
    // POST: api/actividades/reordenar-subactividades/{idActividad}
    // ============================================================
    [HttpPost("reordenar-subactividades/{idActividad}")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> ReordenarSubActividades(int idActividad, [FromBody] ReordenarSubActividadesRequest request)
    {
        try
        {
            if (request.IdsSubActividadEnOrden == null || request.IdsSubActividadEnOrden.Count == 0)
                return BadRequest(new { mensaje = "No se proporcionaron IDs" });

            var actividad = await _context.Actividades.FindAsync(idActividad);
            if (actividad == null)
                return NotFound(new { mensaje = "Actividad no encontrada" });

            for (int i = 0; i < request.IdsSubActividadEnOrden.Count; i++)
            {
                var subActividad = await _context.SubActividades.FindAsync(request.IdsSubActividadEnOrden[i]);
                if (subActividad != null && subActividad.IdActividad == idActividad)
                {
                    subActividad.Orden = i + 1;
                    subActividad.NumeroOrden = i + 1;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = $"{request.IdsSubActividadEnOrden.Count} sub-actividades reordenadas" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al reordenar", error = ex.Message });
        }
    }

    // ============================================================
    // Helpers privados
    // ============================================================
    private async Task<int> ObtenerIdDocenteActual()
    {
        var codigo = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(codigo))
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(idClaim) && int.TryParse(idClaim, out int idDoc))
            {
                var docenteById = await _context.Docentes.FirstOrDefaultAsync(d => d.IdDocente == idDoc);
                if (docenteById != null) return docenteById.IdDocente;
            }
            return 0;
        }

        var docente = await _context.Docentes
            .FirstOrDefaultAsync(d => d.CodigoDocente == codigo || d.Correo == codigo);

        return docente?.IdDocente ?? 0;
    }
}

public class ClaseResumenDto
{
    public int IdClase { get; set; }
    public string NombreClase { get; set; } = "";
    public string Seccion { get; set; } = "";
    public string Nivel { get; set; } = "";
    public bool EsEspecialidad { get; set; }
    public EspecialidadResumenDto? Especialidad { get; set; }
    public List<MateriaResumenDto> Materias { get; set; } = new();
}

public class EspecialidadResumenDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
}

public class MateriaResumenDto
{
    public int IdMateria { get; set; }
    public string NombreMateria { get; set; } = "";
}

public class AsignarMateriasSeccionRequest
{
    public int IdClase { get; set; }
    public List<int> IdsMateria { get; set; } = new();
    public int IdDocente { get; set; } = 0;
}