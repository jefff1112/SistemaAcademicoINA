using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using SistemaAcademicoINA.Models.DTOs;

namespace SistemaAcademicoINA.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalificacionesSubActividadesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CalificacionesSubActividadesController> _logger;

    public CalificacionesSubActividadesController(ApplicationDbContext context, ILogger<CalificacionesSubActividadesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("subactividad/{idSubActividad}")]
    public async Task<IActionResult> GetBySubActividad(int idSubActividad)
    {
        var calificaciones = await _context.CalificacionesSubActividades
            .Include(c => c.Estudiante)
            .Where(c => c.IdSubActividad == idSubActividad)
            .OrderBy(c => c.Estudiante != null ? c.Estudiante.Apellidos : "")
            .ThenBy(c => c.Estudiante != null ? c.Estudiante.Nombres : "")
            .Select(c => new
            {
                c.IdCalificacionSub,
                c.IdSubActividad,
                c.IdEstudiante,
                codigoEstudiante = c.Estudiante != null ? c.Estudiante.CodigoEstudiante : null,
                nombres = c.Estudiante != null ? c.Estudiante.Nombres : null,
                apellidos = c.Estudiante != null ? c.Estudiante.Apellidos : null,
                c.Nota,
                c.Observaciones,
                c.CreatedAt,
                c.UpdatedAt
            })
            .ToListAsync();

        return Ok(calificaciones);
    }

    [HttpGet("estudiante/{idEstudiante}/actividad/{idActividad}")]
    public async Task<IActionResult> GetByEstudianteYActividad(int idEstudiante, int idActividad)
    {
        var actividad = await _context.Actividades
            .Include(a => a.SubActividades.OrderBy(s => s.Orden))
            .FirstOrDefaultAsync(a => a.IdActividad == idActividad);

        if (actividad == null)
            return NotFound(new { mensaje = "Actividad no encontrada" });

        var idsSubs = actividad.SubActividades.Select(s => s.IdSubActividad).ToList();
        var calificaciones = await _context.CalificacionesSubActividades
            .Where(c => c.IdEstudiante == idEstudiante && idsSubs.Contains(c.IdSubActividad))
            .ToListAsync();

        var resultado = actividad.SubActividades.Select(sa =>
        {
            var calif = calificaciones.FirstOrDefault(c => c.IdSubActividad == sa.IdSubActividad);
            return new
            {
                idSubActividad = sa.IdSubActividad,
                nombreSubActividad = sa.NombreSubActividad,
                ponderacion = sa.Ponderacion,
                orden = sa.Orden,
                idCalificacionSub = calif?.IdCalificacionSub,
                nota = calif?.Nota,
                observaciones = calif?.Observaciones
            };
        }).ToList();

        return Ok(resultado);
    }

    [HttpGet("cuadro-auxiliar")]
    public async Task<IActionResult> GetCuadroAuxiliar(
        [FromQuery] int idClase,
        [FromQuery] int idMateria,
        [FromQuery] int idPeriodo)
    {
        try
        {
            var clase = await _context.Clases.FindAsync(idClase);
            var materia = await _context.Materias.FindAsync(idMateria);
            var periodo = await _context.PeriodosAcademicos.FindAsync(idPeriodo);

            if (clase == null || materia == null || periodo == null)
                return NotFound(new { mensaje = "Clase, materia o periodo no encontrados" });

            var actividades = await _context.Actividades
                .Where(a => a.IdClase == idClase
                    && a.IdMateria == idMateria
                    && a.IdPeriodo == idPeriodo
                    && a.Estado == "Activo")
                .OrderBy(a => a.NumeroOrden)
                .Include(a => a.SubActividades.OrderBy(s => s.Orden))
                .ToListAsync();

            if (!actividades.Any())
                return Ok(new { actividades = new List<object>(), estudiantes = new List<object>() });

            var idsSubActividades = actividades.SelectMany(a => a.SubActividades.Select(s => s.IdSubActividad)).ToList();

            var inscripciones = await _context.Inscripciones
                .Where(i => i.IdClase == idClase && i.EstadoInscripcion == "Confirmada")
                .Include(i => i.Estudiante)
                .ToListAsync();

            var estudiantes = inscripciones
                .Where(i => i.Estudiante != null)
                .Select(i => i.Estudiante!)
                .OrderBy(e => e.Apellidos)
                .ThenBy(e => e.Nombres)
                .ToList();

            if (!estudiantes.Any())
                return Ok(new
                {
                    actividades = actividades.Select(a => new
                    {
                        idActividad = a.IdActividad,
                        nombreActividad = a.NombreActividad,
                        ponderacion = a.Ponderacion,
                        tipoActividad = a.TipoActividad,
                        subActividades = a.SubActividades.Select(s => new
                        {
                            idSubActividad = s.IdSubActividad,
                            nombreSubActividad = s.NombreSubActividad,
                            ponderacion = s.Ponderacion,
                            orden = s.Orden
                        })
                    }),
                    estudiantes = new List<object>()
                });

            var idsEstudiantes = estudiantes.Select(e => e.IdEstudiante).ToList();

            var todasLasCalificaciones = await _context.CalificacionesSubActividades
                .Where(c => idsEstudiantes.Contains(c.IdEstudiante) && idsSubActividades.Contains(c.IdSubActividad))
                .ToListAsync();

            var resultadosPeriodo = await _context.ResultadosPeriodos
                .Where(r => idsEstudiantes.Contains(r.IdEstudiante)
                    && r.IdMateria == idMateria
                    && r.IdClase == idClase
                    && r.IdPeriodo == idPeriodo)
                .ToListAsync();

            var estudiantesResponse = estudiantes.Select(est =>
            {
                var califsEst = todasLasCalificaciones.Where(c => c.IdEstudiante == est.IdEstudiante).ToList();
                var notaFinal = CalcularNotaFinalEstudiante(est.IdEstudiante, actividades, califsEst);
                var resultado = resultadosPeriodo.FirstOrDefault(r => r.IdEstudiante == est.IdEstudiante);

                var actividadesEstudiante = actividades.Select(a => new
                {
                    idActividad = a.IdActividad,
                    nombreActividad = a.NombreActividad,
                    ponderacion = a.Ponderacion,
                    subActividades = a.SubActividades.Select(s =>
                    {
                        var calif = califsEst.FirstOrDefault(c => c.IdSubActividad == s.IdSubActividad);
                        return new
                        {
                            idSubActividad = s.IdSubActividad,
                            nombreSubActividad = s.NombreSubActividad,
                            ponderacion = s.Ponderacion,
                            orden = s.Orden,
                            nota = calif?.Nota,
                            observaciones = calif?.Observaciones
                        };
                    })
                });

                return new
                {
                    idEstudiante = est.IdEstudiante,
                    codigoEstudiante = est.CodigoEstudiante,
                    nombres = est.Nombres,
                    apellidos = est.Apellidos,
                    notaFinalCalculada = notaFinal,
                    notaRecuperacion = resultado?.NotaRecuperacion,
                    observacionRecuperacion = resultado?.ObservacionRecuperacion,
                    actividades = actividadesEstudiante
                };
            }).ToList();

            var actividadesHeaders = actividades.Select(a => new
            {
                idActividad = a.IdActividad,
                nombreActividad = a.NombreActividad,
                ponderacion = a.Ponderacion,
                tipoActividad = a.TipoActividad,
                subActividades = a.SubActividades.Select(s => new
                {
                    idSubActividad = s.IdSubActividad,
                    nombreSubActividad = s.NombreSubActividad,
                    ponderacion = s.Ponderacion,
                    orden = s.Orden
                })
            });

            return Ok(new
            {
                actividades = actividadesHeaders,
                estudiantes = estudiantesResponse
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener cuadro auxiliar {Clase}/{Materia}/{Periodo}", idClase, idMateria, idPeriodo);
            return StatusCode(500, new { mensaje = "Error al obtener el cuadro auxiliar", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/CalificacionesSubActividades/cuadro-completo
    // PERMITE MÓDULOS SIN PERÍODO (idPeriodo = 0 cuando es módulo)
    // ============================================================
    [HttpGet("cuadro-completo")]
    public async Task<IActionResult> GetCuadroCompleto(
        [FromQuery] int idClase,
        [FromQuery] int? idMateria = null,
        [FromQuery] int? idEspecialidad = null,
        [FromQuery] int idPeriodo = 0)
    {
        try
        {
            // FIX: idPeriodo solo es obligatorio para MATERIAS
            if (idPeriodo == 0 && !idEspecialidad.HasValue)
                return BadRequest(new { mensaje = "idPeriodo es requerido para materias" });

            var clase = await _context.Clases
                .Include(c => c.Nivel)
                .Include(c => c.SeccionObj)
                .FirstOrDefaultAsync(c => c.IdClase == idClase);

            if (clase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            // FIX: período opcional (null para módulos)
            PeriodoAcademico? periodo = null;
            if (idPeriodo > 0)
            {
                periodo = await _context.PeriodosAcademicos.FindAsync(idPeriodo);
                if (periodo == null)
                    return NotFound(new { mensaje = "Periodo no encontrado" });
            }

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
            else
            {
                return BadRequest(new { mensaje = "Debe especificar idMateria o idEspecialidad" });
            }

            var docenteMateria = await _context.DocenteMaterias
                .Include(dm => dm.Docente)
                .Include(dm => dm.Materia)
                .FirstOrDefaultAsync(dm => dm.IdClase == idClase
                    && dm.Estado == true
                    && ((idMateria.HasValue && dm.IdMateria == idMateria.Value)
                        || (idEspecialidad.HasValue && dm.Materia != null && dm.Materia.IdEspecialidad == idEspecialidad.Value)));

            var queryActividades = _context.Actividades
                .Where(a => a.IdClase == idClase && a.Estado == "Activo");

            if (idMateria.HasValue)
            {
                queryActividades = queryActividades.Where(a => a.IdMateria == idMateria.Value);
                if (idPeriodo > 0)
                    queryActividades = queryActividades.Where(a => a.IdPeriodo == idPeriodo);
            }
            else if (idEspecialidad.HasValue)
            {
                queryActividades = queryActividades.Where(a => a.IdEspecialidad == idEspecialidad.Value);
            }

            var actividades = await queryActividades
                .OrderBy(a => a.NumeroOrden > 0 ? a.NumeroOrden : 999)
                .ThenBy(a => a.FechaPublicacion)
                .Include(a => a.SubActividades.OrderBy(s => s.Orden))
                .ToListAsync();

            var rol = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            int idDocenteActual = 0;
            if (rol == "Docente")
            {
                var codigoUsuario = User.FindFirst(ClaimTypes.Name)?.Value;
                if (!string.IsNullOrEmpty(codigoUsuario))
                {
                    var docente = await _context.Docentes
                        .FirstOrDefaultAsync(d => d.CodigoDocente == codigoUsuario || d.Correo == codigoUsuario);
                    idDocenteActual = docente?.IdDocente ?? 0;
                }
            }

            var modulosEditables = new HashSet<int>();
            if (esModulo && idDocenteActual > 0)
            {
                modulosEditables = (await _context.DocenteModulos
                    .Where(d => d.IdDocente == idDocenteActual && d.IdClase == idClase && d.Estado)
                    .Select(d => d.IdModulo)
                    .ToListAsync()).ToHashSet();
            }

            if (!actividades.Any())
                return Ok(new CuadroAuxiliarCompletoDTO
                {
                    Header = new CuadroAuxiliarHeaderDTO
                    {
                        Instituto = "INSTITUTO NACIONAL DE APOPA",
                        Titulo = "CUADRO AUXILIAR PARA EL REGISTRO DE EVALUACIONES POR ASIGNATURA Y PERIODO",
                        AnioLectivo = periodo?.AnioLectivo ?? DateTime.Now.Year,
                        Asignatura = materia?.NombreMateria ?? especialidad?.NombreEspecialidad ?? "",
                        Seccion = clase.Seccion,
                        PeriodoNumero = periodo?.NumeroPeriodo ?? 0,
                        Docente = docenteMateria?.Docente != null ? $"{docenteMateria.Docente.Apellidos}, {docenteMateria.Docente.Nombres}" : "",
                        EsModulo = esModulo,
                        Actividades = new List<ActividadBloqueDTO>()
                    },
                    Filas = new List<EstudianteFilaDTO>(),
                    EsModulo = esModulo,
                    IdEspecialidad = idEspecialidad,
                    IdPeriodo = idPeriodo,
                    EscalaNota = esModulo ? 5 : 10
                });

            var bloquesActividad = new List<ActividadBloqueDTO>();
            int actividadNumero = 1;

            foreach (var act in actividades)
            {
                var columnas = new List<SubActividadColumnaDTO>();
                int subNumero = 1;

                foreach (var sa in act.SubActividades.OrderBy(s => s.Orden))
                {
                    var tipoSub = sa.TipoSubActividad;
                    var esVertical = sa.EsVertical || tipoSub == "Autoevaluacion" || tipoSub == "Coevaluacion";

                    string tipoVisual;
                    if (tipoSub == "Autoevaluacion") tipoVisual = "Autoevaluacion";
                    else if (tipoSub == "Coevaluacion") tipoVisual = "Coevaluacion";
                    else if (tipoSub == "Porcentaje") tipoVisual = "Porcentaje";
                    else if (tipoSub == "PruebaObjetiva") tipoVisual = "PruebaObjetiva";
                    else if (sa.NumeroOrden > 0 && sa.NumeroOrden <= 5) tipoVisual = "Numerada";
                    else tipoVisual = "Subactividad";

                    columnas.Add(new SubActividadColumnaDTO
                    {
                        IdSubActividad = sa.IdSubActividad,
                        Nombre = sa.NombreSubActividad,
                        NumeroOrden = sa.NumeroOrden > 0 ? sa.NumeroOrden : subNumero,
                        TipoSubActividad = tipoVisual,
                        EsVertical = esVertical,
                        Ponderacion = sa.Ponderacion,
                        EsPorcentajeFinal = sa.TipoSubActividad == "Porcentaje"
                    });
                    subNumero++;
                }

                if (esModulo)
                {
                    columnas.Add(new SubActividadColumnaDTO
                    {
                        IdSubActividad = 0,
                        Nombre = "RECUPERACIÓN",
                        NumeroOrden = 99,
                        TipoSubActividad = "RecuperacionModulo",
                        EsVertical = true,
                        EsRecuperacionModulo = true,
                        Ponderacion = null
                    });
                }

                columnas.Add(new SubActividadColumnaDTO
                {
                    IdSubActividad = 0,
                    Nombre = $"{act.Ponderacion}%",
                    NumeroOrden = 999,
                    TipoSubActividad = "Porcentaje",
                    EsVertical = false,
                    Ponderacion = act.Ponderacion,
                    EsPorcentajeFinal = true
                });

                var nombreActividad = esModulo ? $"MÓDULO {actividadNumero}" : $"ACTIVIDAD {actividadNumero}";

                bool puedeEditar = true;
                if (esModulo && rol == "Docente")
                    puedeEditar = act.IdModulo.HasValue && modulosEditables.Contains(act.IdModulo.Value);

                bloquesActividad.Add(new ActividadBloqueDTO
                {
                    IdActividad = act.IdActividad,
                    Nombre = nombreActividad,
                    Ponderacion = act.Ponderacion,
                    EsModulo = esModulo,
                    NumeroOrden = actividadNumero,
                    PuedeEditar = puedeEditar,
                    Columnas = columnas
                });

                actividadNumero++;
            }

            var inscripciones = await _context.Inscripciones
                .Where(i => i.IdClase == idClase && i.EstadoInscripcion == "Confirmada")
                .Include(i => i.Estudiante)
                .ToListAsync();

            var estudiantes = inscripciones
                .Where(i => i.Estudiante != null)
                .Select(i => i.Estudiante!)
                .OrderBy(e => e.Apellidos)
                .ThenBy(e => e.Nombres)
                .ToList();

            if (!estudiantes.Any())
            {
                return Ok(new CuadroAuxiliarCompletoDTO
                {
                    Header = new CuadroAuxiliarHeaderDTO
                    {
                        Instituto = "INSTITUTO NACIONAL DE APOPA",
                        Titulo = "CUADRO AUXILIAR PARA EL REGISTRO DE EVALUACIONES POR ASIGNATURA Y PERIODO",
                        AnioLectivo = periodo?.AnioLectivo ?? DateTime.Now.Year,
                        Asignatura = materia?.NombreMateria ?? especialidad?.NombreEspecialidad ?? "",
                        Seccion = clase.Seccion,
                        PeriodoNumero = periodo?.NumeroPeriodo ?? 0,
                        Docente = docenteMateria?.Docente != null ? $"{docenteMateria.Docente.Apellidos}, {docenteMateria.Docente.Nombres}" : "",
                        EsModulo = esModulo,
                        Actividades = bloquesActividad
                    },
                    Filas = new List<EstudianteFilaDTO>(),
                    EsModulo = esModulo,
                    IdEspecialidad = idEspecialidad,
                    IdPeriodo = idPeriodo,
                    EscalaNota = esModulo ? 5 : 10
                });
            }

            var idsEstudiantes = estudiantes.Select(e => e.IdEstudiante).ToList();
            var idsSubActividades = actividades.SelectMany(a => a.SubActividades.Select(s => s.IdSubActividad)).ToList();

            var todasLasCalificaciones = await _context.CalificacionesSubActividades
                .Where(c => idsEstudiantes.Contains(c.IdEstudiante) && idsSubActividades.Contains(c.IdSubActividad))
                .ToListAsync();

            var resultadosPeriodo = await _context.ResultadosPeriodos
                .Where(r => idsEstudiantes.Contains(r.IdEstudiante)
                    && ((idMateria.HasValue && r.IdMateria == idMateria.Value) || (idEspecialidad.HasValue && r.IdEspecialidad == idEspecialidad.Value))
                    && r.IdClase == idClase
                    && (idPeriodo == 0 || r.IdPeriodo == idPeriodo))
                .ToListAsync();

            Dictionary<int, Dictionary<int, decimal?>> recuperacionesPorModulo = new();
            if (esModulo)
            {
                var idsActividades = actividades.Select(a => a.IdActividad).ToList();
                var recuperacionesModulo = await _context.RecuperacionesModulo
                    .Where(r => idsEstudiantes.Contains(r.IdEstudiante)
                        && idsActividades.Contains(r.IdActividad)
                        && (idPeriodo == 0 || r.IdPeriodo == idPeriodo)
                        && r.IdClase == idClase)
                    .ToListAsync();

                foreach (var rec in recuperacionesModulo)
                {
                    if (!recuperacionesPorModulo.ContainsKey(rec.IdEstudiante))
                        recuperacionesPorModulo[rec.IdEstudiante] = new Dictionary<int, decimal?>();
                    recuperacionesPorModulo[rec.IdEstudiante][rec.IdActividad] = rec.NotaRecuperacion;
                }
            }

            var filas = new List<EstudianteFilaDTO>();

            foreach (var est in estudiantes)
            {
                var califsEst = todasLasCalificaciones.Where(c => c.IdEstudiante == est.IdEstudiante).ToList();
                var notaFinal = CalcularNotaFinalEstudiante(est.IdEstudiante, actividades, califsEst);
                var resultado = resultadosPeriodo.FirstOrDefault(r => r.IdEstudiante == est.IdEstudiante);

                var notasSub = new Dictionary<int, decimal?>();
                foreach (var act in actividades)
                {
                    foreach (var sa in act.SubActividades)
                    {
                        var calif = califsEst.FirstOrDefault(c => c.IdSubActividad == sa.IdSubActividad);
                        notasSub[sa.IdSubActividad] = calif?.Nota;
                    }
                }

                var recModuloEst = recuperacionesPorModulo.ContainsKey(est.IdEstudiante)
                    ? recuperacionesPorModulo[est.IdEstudiante]
                    : new Dictionary<int, decimal?>();

                var notasPorActividad = new Dictionary<int, decimal?>();
                foreach (var act in actividades)
                {
                    decimal? notaModulo;
                    if (recModuloEst.TryGetValue(act.IdActividad, out var rec) && rec.HasValue && rec.Value > 0)
                    {
                        notaModulo = rec.Value;
                    }
                    else
                    {
                        var notasConValor = new List<decimal>();
                        foreach (var sa in act.SubActividades)
                        {
                            var calif = califsEst.FirstOrDefault(c => c.IdSubActividad == sa.IdSubActividad);
                            if (calif?.Nota.HasValue == true)
                                notasConValor.Add(calif.Nota.Value);
                        }
                        notaModulo = notasConValor.Any()
                            ? Math.Round(notasConValor.Sum() / notasConValor.Count, 2)
                            : (decimal?)null;
                    }
                    notasPorActividad[act.IdActividad] = notaModulo;
                }

                if (esModulo)
                {
                    var notasEfectivas = notasPorActividad.Values.Where(v => v.HasValue).Select(v => v!.Value).ToList();
                    notaFinal = notasEfectivas.Any() ? Math.Round(notasEfectivas.Average(), 2) : 0;
                }

                filas.Add(new EstudianteFilaDTO
                {
                    IdEstudiante = est.IdEstudiante,
                    Codigo = est.CodigoEstudiante,
                    Nombres = est.Nombres,
                    Apellidos = est.Apellidos,
                    NotasSubActividades = notasSub,
                    PromedioFinal = resultado?.NotaRecuperacion.HasValue == true && resultado.NotaRecuperacion > 0
                        ? resultado.NotaRecuperacion
                        : (notaFinal > 0 ? notaFinal : null),
                    Recuperacion = resultado?.NotaRecuperacion,
                    Observaciones = resultado?.ObservacionRecuperacion ?? "",
                    RecuperacionesPorModulo = recModuloEst,
                    ObservacionesPorActividad = new Dictionary<int, string>(),
                    NotasPorActividad = notasPorActividad
                });
            }

            var header = new CuadroAuxiliarHeaderDTO
            {
                Instituto = "INSTITUTO NACIONAL DE APOPA",
                Titulo = "CUADRO AUXILIAR PARA EL REGISTRO DE EVALUACIONES POR ASIGNATURA Y PERIODO",
                AnioLectivo = periodo?.AnioLectivo ?? DateTime.Now.Year,
                Asignatura = materia?.NombreMateria ?? especialidad?.NombreEspecialidad ?? "",
                Seccion = clase.Seccion,
                PeriodoNumero = periodo?.NumeroPeriodo ?? 0,
                Docente = docenteMateria?.Docente != null ? $"{docenteMateria.Docente.Apellidos}, {docenteMateria.Docente.Nombres}" : "",
                EsModulo = esModulo,
                Actividades = bloquesActividad
            };

            return Ok(new CuadroAuxiliarCompletoDTO
            {
                Header = header,
                Filas = filas,
                TotalEstudiantes = filas.Count,
                TotalActividades = actividades.Count,
                TotalSubActividades = actividades.Sum(a => a.SubActividades.Count),
                EsModulo = esModulo,
                IdEspecialidad = idEspecialidad,
                IdPeriodo = idPeriodo,
                EscalaNota = esModulo ? 5 : 10
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener cuadro completo {Clase}/{Materia}/{Especialidad}/{Periodo}", idClase, idMateria, idEspecialidad, idPeriodo);
            return StatusCode(500, new { mensaje = "Error al obtener el cuadro completo", error = ex.Message });
        }
    }

    [HttpPost("guardar-recuperacion-modulo")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> GuardarRecuperacionModulo([FromBody] GuardarRecuperacionModuloRequest request)
    {
        if (request == null)
            return BadRequest(new { mensaje = "Datos inválidos" });

        if (request.NotaRecuperacion.HasValue && (request.NotaRecuperacion.Value < 0 || request.NotaRecuperacion.Value > 5))
            return BadRequest(new { mensaje = "La nota de recuperación del módulo debe estar entre 0 y 5" });

        try
        {
            var periodo = await _context.PeriodosAcademicos.FindAsync(request.IdPeriodo);
            if (periodo == null)
                return NotFound(new { mensaje = "Periodo no encontrado" });

            var actividad = await _context.Actividades.FindAsync(request.IdActividad);
            if (actividad == null)
                return NotFound(new { mensaje = "Actividad/Módulo no encontrado" });

            var resultado = await _context.RecuperacionesModulo
                .FirstOrDefaultAsync(r => r.IdEstudiante == request.IdEstudiante
                    && r.IdActividad == request.IdActividad
                    && r.IdPeriodo == request.IdPeriodo
                    && r.IdClase == request.IdClase);

            if (resultado == null)
            {
                resultado = new RecuperacionesModulo
                {
                    IdResultadoPeriodo = 0,
                    IdActividad = request.IdActividad,
                    IdEstudiante = request.IdEstudiante,
                    IdPeriodo = request.IdPeriodo,
                    IdClase = request.IdClase,
                    NotaRecuperacion = request.NotaRecuperacion,
                    Observacion = request.Observacion,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.RecuperacionesModulo.Add(resultado);
            }
            else
            {
                resultado.NotaRecuperacion = request.NotaRecuperacion;
                resultado.Observacion = request.Observacion;
                resultado.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Nota de recuperación del módulo guardada",
                idRecuperacionModulo = resultado.IdRecuperacionModulo,
                notaRecuperacion = resultado.NotaRecuperacion
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar recuperación de módulo");
            return StatusCode(500, new { mensaje = "Error al guardar la recuperación del módulo", error = ex.Message });
        }
    }

    [HttpPost("guardar")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> Guardar([FromBody] GuardarCalificacionSubRequest request)
    {
        if (request == null)
            return BadRequest(new { mensaje = "Datos inválidos" });

        try
        {
            var sub = await _context.SubActividades
                .Include(s => s.Actividad)
                .FirstOrDefaultAsync(s => s.IdSubActividad == request.IdSubActividad);

            if (sub == null)
                return NotFound(new { mensaje = "Sub-actividad no encontrada" });

            if (sub.Actividad == null)
                return BadRequest(new { mensaje = "La sub-actividad no tiene actividad asociada" });

            decimal maxNota = (sub.Actividad.EsModulo || sub.Actividad.IdModulo.HasValue) ? 5 : 10;
            if (request.Nota.HasValue && (request.Nota.Value < 0 || request.Nota.Value > maxNota))
                return BadRequest(new { mensaje = $"La nota debe estar entre 0 y {maxNota}" });

            var registradoPor = await ObtenerIdUsuarioActual();

            var calif = await _context.CalificacionesSubActividades
                .FirstOrDefaultAsync(c => c.IdSubActividad == request.IdSubActividad && c.IdEstudiante == request.IdEstudiante);

            if (calif == null)
            {
                calif = new CalificacionSubActividad
                {
                    IdSubActividad = request.IdSubActividad,
                    IdEstudiante = request.IdEstudiante,
                    Nota = request.Nota,
                    Observaciones = request.Observaciones,
                    RegistradoPor = registradoPor,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.CalificacionesSubActividades.Add(calif);
            }
            else
            {
                calif.Nota = request.Nota;
                calif.Observaciones = request.Observaciones;
                if (registradoPor > 0) calif.RegistradoPor = registradoPor;
                calif.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            if (sub.Actividad.IdMateria.HasValue)
            {
                await RecalcularNotaPeriodo(
                    request.IdEstudiante,
                    sub.Actividad.IdMateria.Value,
                    sub.Actividad.IdClase);
            }

            var notaPeriodo = sub.Actividad.IdMateria.HasValue
                ? await ObtenerNotaPeriodoActual(
                    request.IdEstudiante,
                    sub.Actividad.IdMateria.Value,
                    sub.Actividad.IdClase)
                : null;

            return Ok(new
            {
                mensaje = "Calificación guardada",
                idCalificacionSub = calif.IdCalificacionSub,
                nota = calif.Nota,
                notaPeriodoActualizada = notaPeriodo
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar calificación sub-actividad");
            return StatusCode(500, new { mensaje = "Error al guardar la calificación", error = ex.Message });
        }
    }

    [HttpPost("guardar-multiple")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> GuardarMultiple([FromBody] List<GuardarCalificacionSubRequest> requests)
    {
        if (requests == null || !requests.Any())
            return BadRequest(new { mensaje = "Lista vacía" });

        try
        {
            var idsSubs = requests.Select(r => r.IdSubActividad).Distinct().ToList();
            var subs = await _context.SubActividades
                .Include(s => s.Actividad)
                .Where(s => idsSubs.Contains(s.IdSubActividad))
                .ToDictionaryAsync(s => s.IdSubActividad);

            var registradoPor = await ObtenerIdUsuarioActual();
            var idsEstudiantes = requests.Select(r => r.IdEstudiante).Distinct().ToList();

            var existentes = await _context.CalificacionesSubActividades
                .Where(c => idsSubs.Contains(c.IdSubActividad) && idsEstudiantes.Contains(c.IdEstudiante))
                .ToListAsync();

            int creadas = 0, actualizadas = 0;
            var recalcular = new HashSet<(int idEstudiante, int? idMateria, int? idEspecialidad, int idClase)>();

            foreach (var req in requests)
            {
                if (!subs.TryGetValue(req.IdSubActividad, out var sub) || sub.Actividad == null)
                    continue;

                decimal maxNota = (sub.Actividad.EsModulo || sub.Actividad.IdModulo.HasValue) ? 5 : 10;
                if (req.Nota.HasValue && (req.Nota.Value < 0 || req.Nota.Value > maxNota))
                    continue;

                var existente = existentes.FirstOrDefault(c =>
                    c.IdSubActividad == req.IdSubActividad && c.IdEstudiante == req.IdEstudiante);

                if (existente == null)
                {
                    var nueva = new CalificacionSubActividad
                    {
                        IdSubActividad = req.IdSubActividad,
                        IdEstudiante = req.IdEstudiante,
                        Nota = req.Nota,
                        Observaciones = req.Observaciones,
                        RegistradoPor = registradoPor,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };
                    _context.CalificacionesSubActividades.Add(nueva);
                    creadas++;
                }
                else
                {
                    existente.Nota = req.Nota;
                    existente.Observaciones = req.Observaciones;
                    if (registradoPor > 0) existente.RegistradoPor = registradoPor;
                    existente.UpdatedAt = DateTime.Now;
                    actualizadas++;
                }

                recalcular.Add((req.IdEstudiante, sub.Actividad.IdMateria, sub.Actividad.IdEspecialidad, sub.Actividad.IdClase));
            }

            await _context.SaveChangesAsync();

            foreach (var (idEstudiante, idMateria, idEspecialidad, idClase) in recalcular)
            {
                if (idMateria.HasValue)
                {
                    await RecalcularNotaPeriodo(idEstudiante, idMateria.Value, idClase);
                }
            }

            return Ok(new
            {
                mensaje = $"Guardado masivo completado: {creadas} nuevas, {actualizadas} actualizadas",
                creadas,
                actualizadas,
                recalculos = recalcular.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar calificaciones múltiples");
            return StatusCode(500, new { mensaje = "Error al guardar calificaciones", error = ex.Message });
        }
    }

    [HttpPost("guardar-recuperacion")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> GuardarRecuperacion([FromBody] GuardarRecuperacionRequest request)
    {
        if (request == null)
            return BadRequest(new { mensaje = "Datos inválidos" });

        if (request.NotaRecuperacion.HasValue && (request.NotaRecuperacion.Value < 0 || request.NotaRecuperacion.Value > 10))
            return BadRequest(new { mensaje = "La nota de recuperación debe estar entre 0 y 10" });

        try
        {
            var periodo = await _context.PeriodosAcademicos.FindAsync(request.IdPeriodo);
            if (periodo == null)
                return NotFound(new { mensaje = "Periodo no encontrado" });

            var resultado = await _context.ResultadosPeriodos
                .FirstOrDefaultAsync(r => r.IdEstudiante == request.IdEstudiante
                    && r.IdMateria == request.IdMateria
                    && r.IdClase == request.IdClase
                    && r.IdPeriodo == request.IdPeriodo);

            if (resultado == null)
            {
                resultado = new ResultadoPeriodo
                {
                    IdEstudiante = request.IdEstudiante,
                    IdMateria = request.IdMateria,
                    IdClase = request.IdClase,
                    IdPeriodo = request.IdPeriodo,
                    AnioLectivo = periodo.AnioLectivo,
                    NotaAcumulada = 0,
                    NotaRecuperacion = request.NotaRecuperacion,
                    ObservacionRecuperacion = request.ObservacionRecuperacion,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.ResultadosPeriodos.Add(resultado);
            }
            else
            {
                resultado.NotaRecuperacion = request.NotaRecuperacion;
                resultado.ObservacionRecuperacion = request.ObservacionRecuperacion;
                resultado.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Nota de recuperación guardada",
                idResultadoPeriodo = resultado.IdResultadoPeriodo,
                notaRecuperacion = resultado.NotaRecuperacion,
                notaFinalEfectiva = resultado.NotaRecuperacion.HasValue && resultado.NotaRecuperacion > 0
                    ? resultado.NotaRecuperacion
                    : resultado.NotaAcumulada
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar nota de recuperación");
            return StatusCode(500, new { mensaje = "Error al guardar la recuperación", error = ex.Message });
        }
    }

    [HttpGet("exportar")]
    public IActionResult ExportarProxy(
        [FromQuery] int? idClase = null,
        [FromQuery] int? idMateria = null,
        [FromQuery] int? idEspecialidad = null,
        [FromQuery] int? idPeriodo = null,
        [FromQuery] int? anioLectivo = null,
        [FromQuery] bool todasClases = false,
        [FromQuery] bool todasMaterias = false,
        [FromQuery] bool todosPeriodos = false,
        [FromQuery] bool esConsolidadoAnual = false)
    {
        var query = Microsoft.AspNetCore.WebUtilities.QueryHelpers.AddQueryString(
            "/api/CuadroAuxiliar/exportar",
            new Dictionary<string, string?>
            {
                ["idClase"] = idClase?.ToString(),
                ["idMateria"] = idMateria?.ToString(),
                ["idEspecialidad"] = idEspecialidad?.ToString(),
                ["idPeriodo"] = idPeriodo?.ToString(),
                ["anioLectivo"] = anioLectivo?.ToString(),
                ["todasClases"] = todasClases.ToString().ToLowerInvariant(),
                ["todasMaterias"] = todasMaterias.ToString().ToLowerInvariant(),
                ["todosPeriodos"] = todosPeriodos.ToString().ToLowerInvariant(),
                ["esConsolidadoAnual"] = esConsolidadoAnual.ToString().ToLowerInvariant()
            }.Where(kv => kv.Value != null)!);

        return Redirect(query);
    }

    [HttpPost("guardar-con-auditoria")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> GuardarConAuditoria([FromBody] GuardarConAuditoriaRequest request)
    {
        try
        {
            if (request == null)
                return BadRequest(new { mensaje = "Datos de calificación requeridos" });

            var rolUsuario = request.RolUsuario ?? "";
            var esDocente = rolUsuario.Contains("Docente");
            var requiereObservacion = !esDocente || !request.EsPrimeraVez;

            if (requiereObservacion && string.IsNullOrWhiteSpace(request.Observacion))
                return BadRequest(new { mensaje = "La observación es obligatoria para este cambio" });

            var subActividadEscala = await _context.SubActividades
                .Include(s => s.Actividad)
                .FirstOrDefaultAsync(s => s.IdSubActividad == request.IdSubActividad);
            if (subActividadEscala?.Actividad != null)
            {
                decimal maxEscala = (subActividadEscala.Actividad.EsModulo || subActividadEscala.Actividad.IdModulo.HasValue) ? 5 : 10;
                if (request.Nota.HasValue && (request.Nota.Value < 0 || request.Nota.Value > maxEscala))
                    return BadRequest(new { mensaje = $"La nota debe estar entre 0 y {maxEscala}" });
                if (request.NotaRecuperacion.HasValue && (request.NotaRecuperacion.Value < 0 || request.NotaRecuperacion.Value > maxEscala))
                    return BadRequest(new { mensaje = $"La nota de recuperación debe estar entre 0 y {maxEscala}" });
            }

            var idUsuario = await ObtenerIdUsuarioActual();
            if (idUsuario == 0)
                return Unauthorized(new { mensaje = "No se pudo identificar el usuario" });

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.IdUsuario == idUsuario);

            if (usuario == null)
                return Unauthorized(new { mensaje = "Usuario no encontrado" });

            var califExistente = await _context.CalificacionesSubActividades
                .FirstOrDefaultAsync(c => c.IdSubActividad == request.IdSubActividad
                    && c.IdEstudiante == request.IdEstudiante);

            decimal? notaAnterior = null;
            decimal? notaRecuperacionAnterior = null;
            string tipoCambio = "CREACION";

            if (califExistente != null)
            {
                notaAnterior = califExistente.Nota;
                notaRecuperacionAnterior = califExistente.NotaRecuperacion;
                tipoCambio = "MODIFICACION";

                califExistente.Nota = request.Nota;
                califExistente.NotaRecuperacion = request.NotaRecuperacion;
                califExistente.Observaciones = request.Observacion;
                califExistente.UpdatedAt = DateTime.Now;
            }
            else
            {
                califExistente = new CalificacionSubActividad
                {
                    IdSubActividad = request.IdSubActividad,
                    IdEstudiante = request.IdEstudiante,
                    Nota = request.Nota,
                    NotaRecuperacion = request.NotaRecuperacion,
                    Observaciones = request.Observacion,
                    RegistradoPor = idUsuario,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.CalificacionesSubActividades.Add(califExistente);
            }

            await _context.SaveChangesAsync();

            var auditoria = new CalificacionAuditoria
            {
                IdCalificacionSub = califExistente.IdCalificacionSub,
                IdEstudiante = request.IdEstudiante,
                NotaAnterior = notaAnterior,
                NotaNueva = request.Nota,
                NotaRecuperacionAnterior = notaRecuperacionAnterior,
                NotaRecuperacionNueva = request.NotaRecuperacion,
                ObservacionCambio = requiereObservacion ? request.Observacion : "Primera vez que se registra la nota",
                IdUsuarioCambio = idUsuario,
                NombreUsuario = $"{usuario.Nombres} {usuario.Apellidos}",
                RolUsuario = usuario.Rol?.NombreRol ?? rolUsuario,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers["User-Agent"].ToString(),
                TipoCambio = request.NotaRecuperacion.HasValue ? "RECUPERACION" : tipoCambio,
                FechaHoraCambio = DateTime.Now
            };

            _context.CalificacionesAuditoria.Add(auditoria);
            await _context.SaveChangesAsync();

            var subActividad = await _context.SubActividades
                .Include(s => s.Actividad)
                .FirstOrDefaultAsync(s => s.IdSubActividad == request.IdSubActividad);

            if (subActividad?.Actividad != null)
            {
                await RecalcularNotaActividad(subActividad.Actividad.IdActividad, request.IdEstudiante);
                if (subActividad.Actividad.IdMateria.HasValue)
                {
                    await RecalcularNotaPeriodo(request.IdEstudiante, subActividad.Actividad.IdMateria.Value, subActividad.Actividad.IdClase);
                }
            }

            return Ok(new
            {
                mensaje = "Calificación guardada correctamente",
                idCalificacionSub = califExistente.IdCalificacionSub,
                idAuditoria = auditoria.IdAuditoria,
                tipoCambio = auditoria.TipoCambio,
                fueModificado = auditoria.TipoCambio != "CREACION"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar con auditoría");
            return StatusCode(500, new { mensaje = "Error al guardar la calificación", detalle = ex.Message });
        }
    }

    [HttpPost("guardar-multiple-con-auditoria")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> GuardarMultipleConAuditoria([FromBody] GuardarMultipleConAuditoriaRequest request)
    {
        try
        {
            if (request?.Calificaciones == null || !request.Calificaciones.Any())
                return BadRequest(new { mensaje = "No se enviaron calificaciones" });

            var rolUsuario = request.RolUsuario ?? "";
            var esDocente = rolUsuario.Contains("Docente");

            var idUsuario = await ObtenerIdUsuarioActual();
            if (idUsuario == 0)
                return Unauthorized(new { mensaje = "No se pudo identificar el usuario" });

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.IdUsuario == idUsuario);

            if (usuario == null)
                return Unauthorized(new { mensaje = "Usuario no encontrado" });

            var resultados = new List<object>();

            foreach (var item in request.Calificaciones)
            {
                var requiereObservacion = !esDocente || !item.EsPrimeraVez;

                if (requiereObservacion && string.IsNullOrWhiteSpace(request.ObservacionGeneral))
                    return BadRequest(new { mensaje = $"La observación es obligatoria para cambiar la nota del estudiante {item.IdEstudiante}" });

                var califExistente = await _context.CalificacionesSubActividades
                    .FirstOrDefaultAsync(c => c.IdSubActividad == item.IdSubActividad
                        && c.IdEstudiante == item.IdEstudiante);

                decimal? notaAnterior = null;
                decimal? notaRecuperacionAnterior = null;
                string tipoCambio = "CREACION";

                if (califExistente != null)
                {
                    notaAnterior = califExistente.Nota;
                    notaRecuperacionAnterior = califExistente.NotaRecuperacion;
                    tipoCambio = "MODIFICACION";

                    califExistente.Nota = item.Nota;
                    califExistente.NotaRecuperacion = item.NotaRecuperacion;
                    califExistente.Observaciones = requiereObservacion ? request.ObservacionGeneral : "";
                    califExistente.UpdatedAt = DateTime.Now;
                }
                else
                {
                    califExistente = new CalificacionSubActividad
                    {
                        IdSubActividad = item.IdSubActividad,
                        IdEstudiante = item.IdEstudiante,
                        Nota = item.Nota,
                        NotaRecuperacion = item.NotaRecuperacion,
                        Observaciones = requiereObservacion ? request.ObservacionGeneral : "",
                        RegistradoPor = idUsuario,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };
                    _context.CalificacionesSubActividades.Add(califExistente);
                }

                await _context.SaveChangesAsync();

                var auditoria = new CalificacionAuditoria
                {
                    IdCalificacionSub = califExistente.IdCalificacionSub,
                    IdEstudiante = item.IdEstudiante,
                    NotaAnterior = notaAnterior,
                    NotaNueva = item.Nota,
                    NotaRecuperacionAnterior = notaRecuperacionAnterior,
                    NotaRecuperacionNueva = item.NotaRecuperacion,
                    ObservacionCambio = requiereObservacion ? request.ObservacionGeneral : "Primera vez que se registra la nota",
                    IdUsuarioCambio = idUsuario,
                    NombreUsuario = $"{usuario.Nombres} {usuario.Apellidos}",
                    RolUsuario = usuario.Rol?.NombreRol ?? rolUsuario,
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = Request.Headers["User-Agent"].ToString(),
                    TipoCambio = item.NotaRecuperacion.HasValue ? "RECUPERACION" : tipoCambio,
                    FechaHoraCambio = DateTime.Now
                };

                _context.CalificacionesAuditoria.Add(auditoria);

                resultados.Add(new
                {
                    idCalificacionSub = califExistente.IdCalificacionSub,
                    fueModificado = tipoCambio == "MODIFICACION"
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = $"{resultados.Count} calificaciones guardadas correctamente",
                totalGuardadas = resultados.Count,
                resultados
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar múltiples con auditoría");
            return StatusCode(500, new { mensaje = "Error al guardar las calificaciones", detalle = ex.Message });
        }
    }

    [HttpGet("historial-auditoria/{idCalificacionSub}")]
    public async Task<IActionResult> GetHistorialAuditoria(int idCalificacionSub)
    {
        var historial = await _context.CalificacionesAuditoria
            .Where(a => a.IdCalificacionSub == idCalificacionSub)
            .OrderByDescending(a => a.FechaHoraCambio)
            .Select(a => new HistorialAuditoriaResponse
            {
                IdAuditoria = a.IdAuditoria,
                IdCalificacionSub = a.IdCalificacionSub,
                NotaAnterior = a.NotaAnterior,
                NotaNueva = a.NotaNueva,
                NotaRecuperacionAnterior = a.NotaRecuperacionAnterior,
                NotaRecuperacionNueva = a.NotaRecuperacionNueva,
                ObservacionCambio = a.ObservacionCambio,
                NombreUsuario = a.NombreUsuario,
                RolUsuario = a.RolUsuario,
                TipoCambio = a.TipoCambio,
                FechaHoraCambio = a.FechaHoraCambio,
                DescripcionCambio = a.NotaAnterior == null && a.NotaNueva != null
                    ? "Nota creada"
                    : a.NotaAnterior != null && a.NotaNueva == null
                        ? "Nota eliminada"
                        : a.NotaAnterior != a.NotaNueva
                            ? $"Nota cambiada de {a.NotaAnterior} a {a.NotaNueva}"
                            : "Modificación"
            })
            .ToListAsync();

        return Ok(historial);
    }

    [HttpGet("estado-auditoria/{idCalificacionSub}")]
    public async Task<IActionResult> GetEstadoAuditoria(int idCalificacionSub)
    {
        var auditorias = await _context.CalificacionesAuditoria
            .Where(a => a.IdCalificacionSub == idCalificacionSub)
            .OrderByDescending(a => a.FechaHoraCambio)
            .ToListAsync();

        if (!auditorias.Any())
        {
            return Ok(new EstadoAuditoriaResponse
            {
                IdCalificacionSub = idCalificacionSub,
                TieneHistorial = false,
                TotalCambios = 0
            });
        }

        var ultima = auditorias.First();
        return Ok(new EstadoAuditoriaResponse
        {
            IdCalificacionSub = idCalificacionSub,
            TieneHistorial = true,
            TotalCambios = auditorias.Count,
            UltimaModificacion = ultima.FechaHoraCambio,
            UltimoUsuario = ultima.NombreUsuario,
            UltimaObservacion = ultima.ObservacionCambio
        });
    }

    [HttpPost("verificar-auditoria-batch")]
    public async Task<IActionResult> VerificarAuditoriaBatch([FromBody] VerificarAuditoriaBatchRequest request)
    {
        if (request?.IdsCalificacionSub == null || !request.IdsCalificacionSub.Any())
            return BadRequest(new { mensaje = "IDs requeridos" });

        var auditorias = await _context.CalificacionesAuditoria
            .Where(a => request.IdsCalificacionSub.Contains(a.IdCalificacionSub))
            .GroupBy(a => a.IdCalificacionSub)
            .Select(g => new
            {
                IdCalificacionSub = g.Key,
                TotalCambios = g.Count(),
                UltimaModificacion = g.Max(a => a.FechaHoraCambio),
                UltimoUsuario = g.OrderByDescending(a => a.FechaHoraCambio).First().NombreUsuario,
                UltimaObservacion = g.OrderByDescending(a => a.FechaHoraCambio).First().ObservacionCambio,
                TipoUltimoCambio = g.OrderByDescending(a => a.FechaHoraCambio).First().TipoCambio
            })
            .ToListAsync();

        var resultado = request.IdsCalificacionSub.Select(id =>
        {
            var aud = auditorias.FirstOrDefault(a => a.IdCalificacionSub == id);
            return new
            {
                idCalificacionSub = id,
                tieneHistorial = aud != null && aud.TotalCambios > 0,
                totalCambios = aud?.TotalCambios ?? 0,
                ultimaModificacion = aud?.UltimaModificacion,
                ultimoUsuario = aud?.UltimoUsuario ?? "",
                ultimaObservacion = aud?.UltimaObservacion ?? "",
                fueModificado = aud != null && aud.TipoUltimoCambio != "CREACION"
            };
        }).ToList();

        return Ok(resultado);
    }

    private decimal CalcularNotaFinalEstudiante(int idEstudiante, List<Actividad> actividades, List<CalificacionSubActividad> calificaciones)
    {
        var notasActividades = new List<(decimal nota, decimal ponderacion)>();

        foreach (var act in actividades)
        {
            var subsAct = act.SubActividades.ToList();
            var califsEst = calificaciones
                .Where(c => subsAct.Any(sa => sa.IdSubActividad == c.IdSubActividad) && c.IdEstudiante == idEstudiante)
                .ToList();

            var subsConNota = califsEst.Where(c => c.Nota.HasValue).ToList();
            if (!subsConNota.Any()) continue;

            var sumaPonderada = subsConNota.Sum(c =>
            {
                var sa = subsAct.First(s => s.IdSubActividad == c.IdSubActividad);
                return (decimal)c.Nota! * (sa.Ponderacion / 100m);
            });
            var totalPond = subsAct
                .Where(sa => califsEst.Any(c => c.IdSubActividad == sa.IdSubActividad && c.Nota.HasValue))
                .Sum(sa => sa.Ponderacion);

            if (totalPond > 0)
            {
                var notaAct = Math.Round(sumaPonderada / (totalPond / 100m), 2);
                notasActividades.Add((notaAct, act.Ponderacion));
            }
        }

        if (!notasActividades.Any()) return 0;

        var sumaFinal = notasActividades.Sum(n => n.nota * (n.ponderacion / 100m));

        return Math.Round(sumaFinal, 2);
    }

    private async Task RecalcularNotaActividad(int idActividad, int idEstudiante)
    {
        try
        {
            var actividad = await _context.Actividades
                .Include(a => a.SubActividades)
                .FirstOrDefaultAsync(a => a.IdActividad == idActividad);

            if (actividad == null || actividad.SubActividades == null || !actividad.SubActividades.Any())
                return;

            var idsSubs = actividad.SubActividades.Select(s => s.IdSubActividad).ToList();
            var califs = await _context.CalificacionesSubActividades
                .Where(c => c.IdEstudiante == idEstudiante && idsSubs.Contains(c.IdSubActividad) && c.Nota.HasValue)
                .ToListAsync();

            if (!califs.Any()) return;

            var sumaPonderada = califs.Sum(c =>
            {
                var sa = actividad.SubActividades.First(s => s.IdSubActividad == c.IdSubActividad);
                return (decimal)c.Nota! * (sa.Ponderacion / 100m);
            });

            var totalPond = actividad.SubActividades
                .Where(sa => califs.Any(c => c.IdSubActividad == sa.IdSubActividad))
                .Sum(sa => sa.Ponderacion);

            if (totalPond <= 0) return;

            var notaCalculada = Math.Round(sumaPonderada / (totalPond / 100m), 2);

            var califAct = await _context.CalificacionesActividades
                .FirstOrDefaultAsync(c => c.IdActividad == idActividad && c.IdEstudiante == idEstudiante);

            if (califAct == null)
            {
                califAct = new CalificacionActividad
                {
                    IdActividad = idActividad,
                    IdEstudiante = idEstudiante,
                    NotaCalculada = notaCalculada,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.CalificacionesActividades.Add(califAct);
            }
            else
            {
                califAct.NotaCalculada = notaCalculada;
                califAct.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al recalcular nota de actividad {IdActividad} para estudiante {IdEstudiante}", idActividad, idEstudiante);
        }
    }

    private async Task RecalcularNotaPeriodo(int idEstudiante, int? idMateria, int idClase)
    {
        try
        {
            if (!idMateria.HasValue)
                return;

            var periodoActual = await _context.PeriodosAcademicos
                .FirstOrDefaultAsync(p => p.AnioLectivo == DateTime.Now.Year && p.Estado == "Activo");

            if (periodoActual == null) return;

            var actividades = await _context.Actividades
                .Where(a => a.IdClase == idClase
                    && a.IdMateria == idMateria.Value
                    && a.IdPeriodo == periodoActual.IdPeriodo
                    && a.Estado == "Activo")
                .Include(a => a.SubActividades)
                .ToListAsync();

            if (!actividades.Any()) return;

            var idsSubs = actividades.SelectMany(a => a.SubActividades.Select(s => s.IdSubActividad)).ToList();
            var calificaciones = await _context.CalificacionesSubActividades
                .Where(c => c.IdEstudiante == idEstudiante && idsSubs.Contains(c.IdSubActividad))
                .ToListAsync();

            var notaFinal = CalcularNotaFinalEstudiante(idEstudiante, actividades, calificaciones);

            var resultado = await _context.ResultadosPeriodos
                .FirstOrDefaultAsync(r => r.IdEstudiante == idEstudiante
                    && r.IdMateria == idMateria.Value
                    && r.IdClase == idClase
                    && r.IdPeriodo == periodoActual.IdPeriodo
                    && r.AnioLectivo == periodoActual.AnioLectivo);

            if (resultado == null)
            {
                resultado = new ResultadoPeriodo
                {
                    IdEstudiante = idEstudiante,
                    IdMateria = idMateria.Value,
                    IdEspecialidad = null,
                    IdClase = idClase,
                    IdPeriodo = periodoActual.IdPeriodo,
                    AnioLectivo = periodoActual.AnioLectivo,
                    NotaAcumulada = notaFinal,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.ResultadosPeriodos.Add(resultado);
                await _context.SaveChangesAsync();
                return;
            }

            if (resultado.NotaRecuperacion.HasValue && resultado.NotaRecuperacion > 0)
                return;

            if (resultado.NotaAcumulada != notaFinal)
            {
                resultado.NotaAcumulada = notaFinal;
                resultado.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al recalcular nota de periodo ({Est},{Mat},{Cl})", idEstudiante, idMateria, idClase);
        }
    }

    private async Task<decimal?> ObtenerNotaPeriodoActual(int idEstudiante, int idMateria, int idClase)
    {
        var periodoActual = await _context.PeriodosAcademicos
            .FirstOrDefaultAsync(p => p.AnioLectivo == DateTime.Now.Year && p.Estado == "Activo");
        if (periodoActual == null) return null;

        var r = await _context.ResultadosPeriodos
            .FirstOrDefaultAsync(x => x.IdEstudiante == idEstudiante
                && x.IdMateria == idMateria
                && x.IdClase == idClase
                && x.IdPeriodo == periodoActual.IdPeriodo);

        return r?.NotaRecuperacion.HasValue == true && r.NotaRecuperacion > 0 ? r.NotaRecuperacion : r?.NotaAcumulada;
    }

    private async Task<int> ObtenerIdUsuarioActual()
    {
        var codigo = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(codigo))
            return 0;

        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Codigo == codigo || u.Correo == codigo);
        return usuario?.IdUsuario ?? 0;
    }
}

public class GuardarCalificacionSubRequest
{
    public int IdSubActividad { get; set; }
    public int IdEstudiante { get; set; }
    public decimal? Nota { get; set; }
    public string? Observaciones { get; set; }
}

public class GuardarRecuperacionRequest
{
    public int IdEstudiante { get; set; }
    public int IdMateria { get; set; }
    public int IdClase { get; set; }
    public int IdPeriodo { get; set; }
    public decimal? NotaRecuperacion { get; set; }
    public string? ObservacionRecuperacion { get; set; }
}