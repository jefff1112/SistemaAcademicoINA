using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;
using SistemaAcademicoINA.Models.DTOs;
using ClosedXML.Excel;

namespace SistemaAcademicoINA.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CuadroAuxiliarController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CuadroAuxiliarController> _logger;

    public CuadroAuxiliarController(ApplicationDbContext context, ILogger<CuadroAuxiliarController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ============================================================
    // GET: api/cuadro-auxiliar/resumen-por-materia
    // ============================================================
    [HttpGet("resumen-por-materia")]
    public async Task<IActionResult> GetResumenPorMateria(
        [FromQuery] int idClase,
        [FromQuery] int idPeriodo,
        [FromQuery] int? idMateria = null,
        [FromQuery] int? idEspecialidad = null)
    {
        try
        {
            var periodo = await _context.PeriodosAcademicos.FindAsync(idPeriodo);
            if (periodo == null)
                return NotFound(new { mensaje = "Periodo no encontrado" });

            var clase = await _context.Clases
                .Include(c => c.Nivel)
                .Include(c => c.Especialidad)
                .FirstOrDefaultAsync(c => c.IdClase == idClase);

            if (clase == null)
                return NotFound(new { mensaje = "Clase no encontrada" });

            var anioLectivo = periodo.AnioLectivo;

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

            var idsEstudiantes = estudiantes.Select(e => e.IdEstudiante).ToList();

            // ============================================================
            // MODO MÓDULOS (especialidad) - escala 1 a 5, min 4.00
            // Los módulos NO tienen período (son anuales)
            // ============================================================
            if (idEspecialidad.HasValue)
            {
                // FIX: NO filtrar por id_periodo
                var modulos = await _context.Actividades
                    .Where(a => a.IdEspecialidad == idEspecialidad.Value
                        && a.IdClase == idClase
                        && a.EsModulo
                        && a.Estado == "Activo")
                    .OrderBy(a => a.NumeroOrden > 0 ? a.NumeroOrden : 9999)
                    .Include(a => a.SubActividades.OrderBy(s => s.Orden))
                    .ToListAsync();

                if (!modulos.Any())
                {
                    return Ok(new
                    {
                        clase = new
                        {
                            idClase = clase.IdClase,
                            nombreClase = clase.NombreClase,
                            seccion = clase.Seccion,
                            nivel = clase.Nivel?.NombreNivel ?? "",
                            especialidad = clase.Especialidad?.NombreEspecialidad
                        },
                        periodo = new
                        {
                            idPeriodo = periodo.IdPeriodo,
                            nombre = periodo.Nombre,
                            numero = periodo.NumeroPeriodo,
                            anioLectivo = periodo.AnioLectivo
                        },
                        materias = new List<object>(),
                        estudiantes = new List<object>(),
                        totalEstudiantes = estudiantes.Count,
                        totalMaterias = 0,
                        modoModulos = true,
                        escala = 5,
                        notaMinimaAprobacion = 4,
                        mensaje = "No hay módulos registrados para esta especialidad."
                    });
                }

                var idsModulos = modulos.Select(m => m.IdActividad).ToList();
                var recuperaciones = await _context.RecuperacionesModulo
                    .Where(r => idsEstudiantes.Contains(r.IdEstudiante)
                        && idsModulos.Contains(r.IdActividad)
                        && r.IdPeriodo == idPeriodo
                        && r.IdClase == idClase)
                    .ToListAsync();

                var idsSubs = modulos.SelectMany(m => m.SubActividades.Select(s => s.IdSubActividad)).ToList();
                var calificaciones = await _context.CalificacionesSubActividades
                    .Where(c => idsEstudiantes.Contains(c.IdEstudiante) && idsSubs.Contains(c.IdSubActividad))
                    .ToListAsync();

                var filas = estudiantes.Select(est =>
                {
                    var notasPorModulo = new Dictionary<int, object>();

                    foreach (var mod in modulos)
                    {
                        var idsSubsMod = mod.SubActividades.Select(s => s.IdSubActividad).ToList();
                        var califsMod = calificaciones
                            .Where(c => c.IdEstudiante == est.IdEstudiante && idsSubsMod.Contains(c.IdSubActividad))
                            .ToList();

                        var notasConValor = califsMod
                            .Where(c => c.Nota.HasValue && c.Nota.Value > 0)
                            .Select(c => c.Nota!.Value)
                            .ToList();

                        decimal? promedioModulo = notasConValor.Any()
                            ? Math.Round(notasConValor.Average(), 2)
                            : (decimal?)null;

                        var rec = recuperaciones.FirstOrDefault(r =>
                            r.IdEstudiante == est.IdEstudiante
                            && r.IdActividad == mod.IdActividad);

                        decimal? notaFinal = (rec?.NotaRecuperacion.HasValue == true && rec.NotaRecuperacion > 0)
                            ? rec.NotaRecuperacion
                            : promedioModulo;

                        string estadoModulo;
                        bool enRecuperacion;
                        bool aprobado;
                        string equivalenteCualitativo;
                        int? equivalenteEscala10;

                        if (!notaFinal.HasValue)
                        {
                            estadoModulo = "SinNota"; enRecuperacion = false; aprobado = false;
                            equivalenteCualitativo = "Sin nota"; equivalenteEscala10 = null;
                        }
                        else if (notaFinal.Value >= 5.00m)
                        {
                            estadoModulo = "Aprobado"; aprobado = true; enRecuperacion = false;
                            equivalenteCualitativo = "Excelente"; equivalenteEscala10 = 10;
                        }
                        else if (notaFinal.Value >= 4.00m)
                        {
                            estadoModulo = "Aprobado"; aprobado = true; enRecuperacion = false;
                            equivalenteCualitativo = "Muy bueno"; equivalenteEscala10 = 8;
                        }
                        else if (notaFinal.Value >= 3.00m)
                        {
                            estadoModulo = "Reprobado"; aprobado = false; enRecuperacion = true;
                            equivalenteCualitativo = "Regular"; equivalenteEscala10 = 6;
                        }
                        else if (notaFinal.Value >= 2.00m)
                        {
                            estadoModulo = "Reprobado"; aprobado = false; enRecuperacion = true;
                            equivalenteCualitativo = "Deficiente"; equivalenteEscala10 = 5;
                        }
                        else
                        {
                            estadoModulo = "Reprobado"; aprobado = false; enRecuperacion = true;
                            equivalenteCualitativo = "Muy deficiente"; equivalenteEscala10 = 3;
                        }

                        notasPorModulo[mod.IdActividad] = new
                        {
                            nota = notaFinal,
                            recuperacion = rec?.NotaRecuperacion,
                            enRecuperacion = enRecuperacion,
                            aprobado = aprobado,
                            estado = estadoModulo,
                            escala = 5,
                            notaMinima = 4.00m,
                            equivalenteCualitativo = equivalenteCualitativo,
                            equivalenteEscala10 = equivalenteEscala10
                        };
                    }

                    var notasValidas = notasPorModulo.Values
                        .Cast<dynamic>()
                        .Where(n => n.nota != null)
                        .Select(n => (decimal)n.nota)
                        .ToList();

                    var promedioGeneral = notasValidas.Any()
                        ? Math.Round(notasValidas.Average(), 2)
                        : (decimal?)null;

                    var modulosEnRecuperacion = notasPorModulo.Values
                        .Cast<dynamic>()
                        .Count(n => n.enRecuperacion == true);

                    return new
                    {
                        idEstudiante = est.IdEstudiante,
                        codigo = est.CodigoEstudiante,
                        nombres = est.Nombres,
                        apellidos = est.Apellidos,
                        notas = notasPorModulo,
                        promedioGeneral = promedioGeneral,
                        modulosEnRecuperacion = modulosEnRecuperacion,
                        tieneRecuperaciones = modulosEnRecuperacion > 0
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
                        especialidad = clase.Especialidad?.NombreEspecialidad
                    },
                    periodo = new
                    {
                        idPeriodo = periodo.IdPeriodo,
                        nombre = periodo.Nombre,
                        numero = periodo.NumeroPeriodo,
                        anioLectivo = periodo.AnioLectivo
                    },
                    materias = modulos.Select(m => new
                    {
                        idMateria = m.IdActividad,
                        nombreMateria = m.NombreActividad,
                        tipoMateria = "Modulo",
                        idEspecialidad = idEspecialidad.Value
                    }),
                    estudiantes = filas,
                    totalEstudiantes = filas.Count,
                    totalMaterias = modulos.Count,
                    modoModulos = true,
                    escala = 5,
                    notaMinimaAprobacion = 4
                });
            }

            // ============================================================
            // MODO MATERIAS BÁSICAS - escala 1 a 10, min 6.00
            // ============================================================
            var idEspecialidadClase = clase.IdEspecialidad;

            var materias = await _context.Materias
                .Where(m => m.Estado == true
                    && (m.TipoMateria == "Basica"
                        || (m.TipoMateria == "Especialidad"
                            && idEspecialidadClase != null
                            && m.IdEspecialidad == idEspecialidadClase)))
                .OrderBy(m => m.TipoMateria)
                .ThenBy(m => m.NombreMateria)
                .ToListAsync();

            if (idMateria.HasValue)
                materias = materias.Where(m => m.IdMateria == idMateria.Value).ToList();

            var idsMaterias = materias.Select(m => m.IdMateria).ToList();

            var resultados = await _context.ResultadosPeriodos
                .Where(r => idsEstudiantes.Contains(r.IdEstudiante)
                    && r.IdClase == idClase
                    && r.IdPeriodo == idPeriodo
                    && r.IdMateria != null
                    && idsMaterias.Contains(r.IdMateria.Value)
                    && r.AnioLectivo == anioLectivo)
                .ToListAsync();

            var filasBasicas = estudiantes.Select(est =>
            {
                var notasPorMateria = new Dictionary<int, object>();

                foreach (var mat in materias)
                {
                    var resultado = resultados.FirstOrDefault(r =>
                        r.IdEstudiante == est.IdEstudiante && r.IdMateria == mat.IdMateria);

                    decimal? notaMostrar = null;
                    if (resultado != null)
                    {
                        if (resultado.NotaRecuperacion.HasValue && resultado.NotaRecuperacion > 0)
                            notaMostrar = resultado.NotaRecuperacion;
                        else
                            notaMostrar = resultado.NotaAcumulada;
                    }

                    bool enRecuperacion = notaMostrar.HasValue && notaMostrar.Value < 6.00m;
                    bool aprobado = notaMostrar.HasValue && notaMostrar.Value >= 6.00m;

                    notasPorMateria[mat.IdMateria] = new
                    {
                        nota = notaMostrar,
                        recuperacion = resultado?.NotaRecuperacion,
                        observacion = resultado?.ObservacionRecuperacion,
                        enRecuperacion = enRecuperacion,
                        aprobado = aprobado,
                        estado = !notaMostrar.HasValue
                            ? "SinNota"
                            : aprobado ? "Aprobado" : "Reprobado",
                        escala = 10,
                        notaMinima = 6.00m
                    };
                }

                var notasValidas = notasPorMateria.Values
                    .Cast<dynamic>()
                    .Where(n => n.nota != null)
                    .Select(n => (decimal)n.nota)
                    .ToList();

                var promedio = notasValidas.Any()
                    ? Math.Round(notasValidas.Average(), 2)
                    : (decimal?)null;

                var materiasEnRecuperacion = notasPorMateria.Values
                    .Cast<dynamic>()
                    .Count(n => n.enRecuperacion == true);

                return new
                {
                    idEstudiante = est.IdEstudiante,
                    codigo = est.CodigoEstudiante,
                    nombres = est.Nombres,
                    apellidos = est.Apellidos,
                    notas = notasPorMateria,
                    promedioGeneral = promedio,
                    materiasEnRecuperacion = materiasEnRecuperacion,
                    tieneRecuperaciones = materiasEnRecuperacion > 0
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
                    especialidad = clase.Especialidad?.NombreEspecialidad
                },
                periodo = new
                {
                    idPeriodo = periodo.IdPeriodo,
                    nombre = periodo.Nombre,
                    numero = periodo.NumeroPeriodo,
                    anioLectivo = periodo.AnioLectivo
                },
                materias = materias.Select(m => new
                {
                    idMateria = m.IdMateria,
                    nombreMateria = m.NombreMateria,
                    tipoMateria = m.TipoMateria,
                    idEspecialidad = m.IdEspecialidad
                }),
                estudiantes = filasBasicas,
                totalEstudiantes = filasBasicas.Count,
                totalMaterias = materias.Count,
                modoModulos = false,
                escala = 10,
                notaMinimaAprobacion = 6
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener resumen por materia {Clase}/{Periodo}", idClase, idPeriodo);
            return StatusCode(500, new { mensaje = "Error al obtener resumen por materia", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/cuadro-auxiliar/completo
    // ============================================================
    [HttpGet("completo")]
    public async Task<IActionResult> GetCuadroCompleto(
        [FromQuery] int idClase,
        [FromQuery] int? idMateria = null,
        [FromQuery] int? idEspecialidad = null,
        [FromQuery] int idPeriodo = 0)
    {
        try
        {
            if (idPeriodo == 0)
                return BadRequest(new { mensaje = "idPeriodo es requerido" });

            var clase = await _context.Clases
                .Include(c => c.Nivel)
                .Include(c => c.SeccionObj)
                .FirstOrDefaultAsync(c => c.IdClase == idClase);

            var periodo = await _context.PeriodosAcademicos.FindAsync(idPeriodo);

            if (clase == null || periodo == null)
                return NotFound(new { mensaje = "Clase o periodo no encontrados" });

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
                // Módulos no tienen período
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
                        AnioLectivo = periodo.AnioLectivo,
                        Asignatura = materia?.NombreMateria ?? especialidad?.NombreEspecialidad ?? "",
                        Seccion = clase.Seccion,
                        PeriodoNumero = periodo.NumeroPeriodo,
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
                        AnioLectivo = periodo.AnioLectivo,
                        Asignatura = materia?.NombreMateria ?? especialidad?.NombreEspecialidad ?? "",
                        Seccion = clase.Seccion,
                        PeriodoNumero = periodo.NumeroPeriodo,
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
                    && r.IdPeriodo == idPeriodo)
                .ToListAsync();

            Dictionary<int, Dictionary<int, decimal?>> recuperacionesPorModulo = new();
            if (esModulo)
            {
                var idsActividades = actividades.Select(a => a.IdActividad).ToList();
                var recuperacionesModulo = await _context.RecuperacionesModulo
                    .Where(r => idsEstudiantes.Contains(r.IdEstudiante)
                        && idsActividades.Contains(r.IdActividad)
                        && r.IdPeriodo == idPeriodo
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
                AnioLectivo = periodo.AnioLectivo,
                Asignatura = materia?.NombreMateria ?? especialidad?.NombreEspecialidad ?? "",
                Seccion = clase.Seccion,
                PeriodoNumero = periodo.NumeroPeriodo,
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

    // ============================================================
    // GET: api/cuadro-auxiliar/exportar
    // ============================================================
    [HttpGet("exportar")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico")]
    public async Task<IActionResult> ExportarCuadroAuxiliar(
        [FromQuery] int? idClase = null,
        [FromQuery] int? idMateria = null,
        [FromQuery] int? idEspecialidad = null,
        [FromQuery] int? idPeriodo = null,
        [FromQuery] int? anioLectivo = null,
        [FromQuery] bool todasClases = false,
        [FromQuery] bool todasMaterias = false,
        [FromQuery] bool todosPeriodos = false,
        [FromQuery] bool esConsolidadoAnual = false,
        [FromQuery] bool soloPromedios = false)
    {
        try
        {
            var anio = anioLectivo ?? DateTime.Now.Year;
            var periodos = await _context.PeriodosAcademicos
                .Where(p => p.AnioLectivo == anio)
                .OrderBy(p => p.NumeroPeriodo)
                .ToListAsync();

            var periodosExportar = todosPeriodos || esConsolidadoAnual
                ? periodos
                : (idPeriodo.HasValue
                    ? periodos.Where(p => p.IdPeriodo == idPeriodo).ToList()
                    : new List<PeriodoAcademico> { periodos.FirstOrDefault(p => p.Estado == "Activo") ?? periodos.FirstOrDefault() }
                        .Where(p => p != null).Cast<PeriodoAcademico>().ToList());

            IQueryable<Clase> queryClases = _context.Clases.Where(c => c.AnioLectivo == anio && c.Estado);
            if (!todasClases && !esConsolidadoAnual && idClase.HasValue)
                queryClases = queryClases.Where(c => c.IdClase == idClase);
            var clases = await queryClases
                .Include(c => c.Nivel)
                .ToListAsync();

            if (!clases.Any())
                return NotFound(new { mensaje = "No se encontraron clases" });

            using var workbook = new XLWorkbook();
            bool hayDatos = false;

            if (esConsolidadoAnual)
            {
                var clasesPorNivel = clases.GroupBy(c => c.Nivel?.NombreNivel ?? "Sin Nivel").OrderBy(g => g.Key);
                foreach (var grupoNivel in clasesPorNivel)
                {
                    var sheetName = SanitizeSheetName(grupoNivel.Key.Substring(0, Math.Min(25, grupoNivel.Key.Length)));
                    var ws = workbook.Worksheets.Add(sheetName);
                    await LlenarHojaConsolidadoAnual(ws, grupoNivel.Key, grupoNivel.OrderBy(c => c.Seccion).ToList(), periodosExportar, anio);
                    hayDatos = true;
                }
            }
            else if (soloPromedios)
            {
                foreach (var periodo in periodosExportar)
                {
                    foreach (var clase in clases)
                    {
                        var sheetName = SanitizeSheetName($"Resumen_{clase.Seccion}_P{periodo.NumeroPeriodo}");
                        if (sheetName.Length > 31) sheetName = sheetName.Substring(0, 31);
                        var ws = workbook.Worksheets.Add(sheetName);
                        await LlenarHojaResumenPromedios(ws, clase, periodo, anio);
                        hayDatos = true;
                    }
                }
            }
            else if (idEspecialidad.HasValue)
            {
                var especialidad = await _context.Especialidades.FindAsync(idEspecialidad.Value);
                if (especialidad == null)
                    return NotFound(new { mensaje = "Especialidad no encontrada" });

                foreach (var periodo in periodosExportar)
                {
                    foreach (var clase in clases.Where(c => c.IdEspecialidad == idEspecialidad.Value))
                    {
                        var sheetName = SanitizeSheetName($"{clase.Seccion}_Modulos_P{periodo.NumeroPeriodo}");
                        if (sheetName.Length > 31) sheetName = sheetName.Substring(0, 31);
                        var ws = workbook.Worksheets.Add(sheetName);
                        await LlenarHojaCuadroAuxiliarModulos(ws, clase, especialidad, periodo, anio);
                        hayDatos = true;
                    }
                }
            }
            else
            {
                foreach (var periodo in periodosExportar)
                {
                    foreach (var clase in clases)
                    {
                        var idEspClase = clase.IdEspecialidad;
                        IQueryable<Materia> queryMaterias = _context.Materias
                            .Where(m => m.Estado == true
                                && (m.TipoMateria == "Basica"
                                    || (m.TipoMateria == "Especialidad" && idEspClase != null && m.IdEspecialidad == idEspClase)));

                        if (!todasMaterias && idMateria.HasValue)
                            queryMaterias = queryMaterias.Where(m => m.IdMateria == idMateria.Value);

                        var materias = await queryMaterias
                            .OrderBy(m => m.TipoMateria)
                            .ThenBy(m => m.NombreMateria)
                            .ToListAsync();

                        if (!materias.Any()) continue;

                        foreach (var materia in materias)
                        {
                            var sheetName = $"{clase.Seccion}_{materia.NombreMateria.Substring(0, Math.Min(20, materia.NombreMateria.Length))}_P{periodo.NumeroPeriodo}";
                            sheetName = SanitizeSheetName(sheetName);
                            if (sheetName.Length > 31) sheetName = sheetName.Substring(0, 31);

                            var ws = workbook.Worksheets.Add(sheetName);
                            await LlenarHojaCuadroAuxiliarExacto(ws, clase, materia, periodo, anio, esModulo: false);
                            hayDatos = true;
                        }
                    }
                }
            }

            if (!hayDatos)
            {
                var ws = workbook.Worksheets.Add("Sin datos");
                ws.Cell(1, 1).Value = "No hay datos para exportar";
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            var fileName = esConsolidadoAnual
                ? $"ConsolidadoAnual_{anio}_{DateTime.Now:yyyyMMddHHmmss}.xlsx"
                : soloPromedios
                    ? $"ResumenPromedios_{(idClase?.ToString() ?? "Clase")}_{anio}_{DateTime.Now:yyyyMMddHHmmss}.xlsx"
                    : $"Cuadro_Auxiliar_{anio}_{DateTime.Now:yyyyMMddHHmmss}.xlsx";

            return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al exportar cuadro auxiliar");
            return StatusCode(500, new { mensaje = "Error al exportar cuadro auxiliar", error = ex.Message });
        }
    }

    // ============================================================
    // GET: api/cuadro-auxiliar/plantilla
    // ============================================================
    [HttpGet("plantilla")]
    [Authorize(Roles = "Administrador,Director,Sub Director,Registro Academico,Docente")]
    public async Task<IActionResult> GenerarPlantilla(
        [FromQuery] int idClase,
        [FromQuery] int? idMateria = null,
        [FromQuery] int? idEspecialidad = null,
        [FromQuery] int idPeriodo = 0)
    {
        try
        {
            var clase = await _context.Clases.FindAsync(idClase);
            var periodo = await _context.PeriodosAcademicos.FindAsync(idPeriodo);

            if (clase == null || periodo == null)
                return NotFound(new { mensaje = "Clase o periodo no encontrados" });

            var materia = idMateria.HasValue ? await _context.Materias.FindAsync(idMateria.Value) : null;
            var especialidad = idEspecialidad.HasValue ? await _context.Especialidades.FindAsync(idEspecialidad.Value) : null;

            var esModulo = idEspecialidad.HasValue;

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
                .Include(a => a.SubActividades.OrderBy(sa => sa.Orden))
                .ToListAsync();

            var estudiantes = await _context.Inscripciones
                .Where(i => i.IdClase == idClase && i.AnioLectivo == periodo.AnioLectivo)
                .Select(i => i.Estudiante)
                .Where(e => e != null && e.Estado == true)
                .OrderBy(e => e!.Apellidos)
                .ThenBy(e => e!.Nombres)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("Cuadro Auxiliar");

            int row = 1;
            ws.Cell(row, 1).Value = "INSTITUTO NACIONAL DE APOPA";
            ws.Range(row, 1, row, 25).Merge();
            ws.Cell(row, 1).Style.Font.Bold = true;
            ws.Cell(row, 1).Style.Font.FontSize = 14;
            ws.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            row++;

            ws.Cell(row, 1).Value = "CUADRO AUXILIAR PARA EL REGISTRO DE EVALUACIONES";
            ws.Range(row, 1, row, 25).Merge();
            ws.Cell(row, 1).Style.Font.Bold = true;
            ws.Cell(row, 1).Style.Font.FontSize = 12;
            ws.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            row++;

            ws.Cell(row, 1).Value = $"AÑO LECTIVO: {periodo.AnioLectivo}__";
            ws.Cell(row, 1).Style.Font.Bold = true;
            row++;

            ws.Cell(row, 1).Value = $"ASIGNATURA: {materia?.NombreMateria ?? especialidad?.NombreEspecialidad ?? "---"}";
            ws.Cell(row, 1).Style.Font.Bold = true;
            row++;

            ws.Cell(row, 1).Value = $"SECCIÓN: {clase.Seccion}";
            ws.Cell(row, 1).Style.Font.Bold = true;
            row++;

            ws.Cell(row, 1).Value = $"PERIODO Nº: {periodo.NumeroPeriodo}__";
            ws.Cell(row, 1).Style.Font.Bold = true;
            row += 2;

            int col = 1;
            EstiloHeaderVertical(ws.Cell(row, col), "CÓDIGO"); col++;
            EstiloHeaderHorizontal(ws.Cell(row, col), "NOMBRES"); col++;

            foreach (var act in actividades)
            {
                int colActStart = col;
                foreach (var sa in act.SubActividades)
                {
                    if (sa.EsVertical)
                        EstiloHeaderVertical(ws.Cell(row, col), sa.NombreDisplay);
                    else
                        EstiloHeaderHorizontal(ws.Cell(row, col), sa.NombreDisplay);
                    col++;
                }
                int colActEnd = col - 1;
                if (colActStart <= colActEnd)
                {
                    ws.Range(row, colActStart, row, colActEnd).Merge();
                    var mc = ws.Cell(row, colActStart);
                    mc.Value = $"{act.NombreActividad} ({act.Ponderacion}%)";
                    mc.Style.Font.Bold = true;
                    mc.Style.Fill.BackgroundColor = XLColor.LightYellow;
                }
            }

            EstiloHeaderVertical(ws.Cell(row, col), "PROMEDIO"); col++;
            EstiloHeaderVertical(ws.Cell(row, col), "RECUPERACIÓN"); col++;
            EstiloHeaderHorizontal(ws.Cell(row, col), "OBSERVACIONES"); col++;
            row++;

            foreach (var est in estudiantes)
            {
                col = 1;
                ws.Cell(row, col).Value = est.CodigoEstudiante; col++;
                ws.Cell(row, col).Value = $"{est.Apellidos}, {est.Nombres}"; col++;

                foreach (var act in actividades)
                {
                    foreach (var sa in act.SubActividades)
                    {
                        ws.Cell(row, col).Value = "";
                        col++;
                    }
                }

                ws.Cell(row, col).Value = "";
                col++;
                ws.Cell(row, col).Value = "";
                col++;
                ws.Cell(row, col).Value = "";
                row++;
            }

            ws.Columns().AdjustToContents();

            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            ms.Position = 0;

            var fileName = $"Plantilla_CuadroAuxiliar_{clase.Seccion}_{DateTime.Now:yyyyMMdd}.xlsx";
            return File(ms.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar plantilla");
            return StatusCode(500, new { mensaje = "Error al generar plantilla", error = ex.Message });
        }
    }

    // ============================================================
    // Helpers privados
    // ============================================================

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

    private void EstiloHeaderVertical(IXLCell cell, string value)
    {
        cell.Value = value;
        cell.Style.Font.Bold = true;
        cell.Style.Fill.BackgroundColor = XLColor.LightBlue;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        cell.Style.Alignment.TextRotation = 90;
    }

    private void EstiloHeaderHorizontal(IXLCell cell, string value)
    {
        cell.Value = value;
        cell.Style.Font.Bold = true;
        cell.Style.Fill.BackgroundColor = XLColor.LightBlue;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
    }

    private string SanitizeSheetName(string name)
    {
        return name.Replace("/", "-").Replace("\\", "-").Replace(":", "-").Replace("*", "-").Replace("?", "-").Replace("[", "-").Replace("]", "-");
    }

    // ============================================================
    // NUEVO: hoja con SOLO promedios finales por materia
    // - Materias básicas: celda AMARILLA si promedio < 6.00
    // - Módulos: celda AMARILLA si promedio < 4.00
    // ============================================================
    private async Task LlenarHojaResumenPromedios(IXLWorksheet ws, Clase clase, PeriodoAcademico periodo, int anio)
    {
        var idEspecialidadClase = clase.IdEspecialidad;

        var materias = await _context.Materias
            .Where(m => m.Estado == true
                && (m.TipoMateria == "Basica"
                    || (m.TipoMateria == "Especialidad"
                        && idEspecialidadClase != null
                        && m.IdEspecialidad == idEspecialidadClase)))
            .OrderBy(m => m.TipoMateria)
            .ThenBy(m => m.NombreMateria)
            .ToListAsync();

        var idsEstudiantes = await _context.Inscripciones
            .Where(i => i.IdClase == clase.IdClase && i.EstadoInscripcion == "Confirmada")
            .Select(i => i.IdEstudiante)
            .ToListAsync();

        var estudiantes = await _context.Estudiantes
            .Where(e => idsEstudiantes.Contains(e.IdEstudiante) && e.Estado)
            .OrderBy(e => e.Apellidos)
            .ThenBy(e => e.Nombres)
            .ToListAsync();

        var idsMaterias = materias.Select(m => m.IdMateria).ToList();

        var resultados = await _context.ResultadosPeriodos
            .Where(r => idsEstudiantes.Contains(r.IdEstudiante)
                && r.IdClase == clase.IdClase
                && r.IdPeriodo == periodo.IdPeriodo
                && r.IdMateria != null
                && idsMaterias.Contains(r.IdMateria.Value)
                && r.AnioLectivo == anio)
            .ToListAsync();

        int row = 1;

        ws.Cell(row, 1).Value = "INSTITUTO NACIONAL DE APOPA";
        ws.Range(row, 1, row, 3 + materias.Count).Merge();
        ws.Cell(row, 1).Style.Font.Bold = true;
        ws.Cell(row, 1).Style.Font.FontSize = 14;
        ws.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        row++;

        ws.Cell(row, 1).Value = "RESUMEN DE PROMEDIOS POR MATERIA";
        ws.Range(row, 1, row, 3 + materias.Count).Merge();
        ws.Cell(row, 1).Style.Font.Bold = true;
        ws.Cell(row, 1).Style.Font.FontSize = 12;
        ws.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        row++;

        ws.Cell(row, 1).Value = $"AÑO LECTIVO: {anio}__";
        ws.Cell(row, 1).Style.Font.Bold = true;
        row++;

        ws.Cell(row, 1).Value = $"CLASE: {clase.NombreClase} {clase.Seccion}";
        ws.Cell(row, 1).Style.Font.Bold = true;
        row++;

        ws.Cell(row, 1).Value = $"PERIODO N°: {periodo.NumeroPeriodo} - {periodo.Nombre}";
        ws.Cell(row, 1).Style.Font.Bold = true;
        row++;

        ws.Cell(row, 1).Value = "Leyenda:";
        ws.Cell(row, 1).Style.Font.Bold = true;
        ws.Cell(row, 1).Style.Font.FontSize = 9;
        ws.Cell(row, 2).Value = "Amarillo = Recuperación (básicas < 6, módulos < 4)";
        ws.Cell(row, 2).Style.Fill.BackgroundColor = XLColor.LightYellow;
        ws.Cell(row, 2).Style.Font.FontSize = 9;
        ws.Cell(row, 2).Style.Font.FontColor = XLColor.DarkOrange;
        row += 2;

        ws.Cell(row, 1).Value = "CÓDIGO";
        ws.Cell(row, 1).Style.Font.Bold = true;
        ws.Cell(row, 1).Style.Fill.BackgroundColor = XLColor.LightBlue;
        ws.Cell(row, 1).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        ws.Cell(row, 2).Value = "ESTUDIANTE";
        ws.Cell(row, 2).Style.Font.Bold = true;
        ws.Cell(row, 2).Style.Fill.BackgroundColor = XLColor.LightBlue;
        ws.Cell(row, 2).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        int col = 3;
        foreach (var mat in materias)
        {
            ws.Cell(row, col).Value = mat.NombreMateria ?? "Sin materia";
            ws.Cell(row, col).Style.Font.Bold = true;
            ws.Cell(row, col).Style.Fill.BackgroundColor = XLColor.LightBlue;
            ws.Cell(row, col).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            ws.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            ws.Cell(row, col).Style.Alignment.WrapText = true;
            ws.Cell(row, col).Style.Alignment.TextRotation = 90;
            col++;
        }

        ws.Cell(row, col).Value = "PROMEDIO GENERAL";
        ws.Cell(row, col).Style.Font.Bold = true;
        ws.Cell(row, col).Style.Fill.BackgroundColor = XLColor.LightGreen;
        ws.Cell(row, col).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        ws.Cell(row, col).Style.Alignment.TextRotation = 90;
        row++;

        foreach (var est in estudiantes)
        {
            ws.Cell(row, 1).Value = est.CodigoEstudiante ?? "";
            ws.Cell(row, 2).Value = $"{est.Apellidos}, {est.Nombres}";

            col = 3;
            var notasEstudiante = new List<decimal>();

            foreach (var mat in materias)
            {
                var resultado = resultados.FirstOrDefault(r =>
                    r.IdEstudiante == est.IdEstudiante && r.IdMateria == mat.IdMateria);

                decimal? notaMostrar = null;
                if (resultado != null)
                {
                    if (resultado.NotaRecuperacion.HasValue && resultado.NotaRecuperacion > 0)
                        notaMostrar = resultado.NotaRecuperacion;
                    else
                        notaMostrar = resultado.NotaAcumulada;
                }

                if (notaMostrar.HasValue)
                    ws.Cell(row, col).Value = notaMostrar.Value;
                else
                    ws.Cell(row, col).Value = "";

                ws.Cell(row, col).Style.NumberFormat.Format = "0.00";
                ws.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                if (notaMostrar.HasValue)
                {
                    notasEstudiante.Add(notaMostrar.Value);

                    decimal minimoAprobacion = mat.TipoMateria == "Basica" ? 6.00m : 4.00m;

                    if (notaMostrar.Value < minimoAprobacion)
                    {
                        ws.Cell(row, col).Style.Fill.BackgroundColor = XLColor.LightYellow;
                        ws.Cell(row, col).Style.Font.Bold = true;
                        ws.Cell(row, col).Style.Font.FontColor = XLColor.DarkOrange;
                    }
                }

                col++;
            }

            decimal? promedioGeneral = notasEstudiante.Any()
                ? Math.Round(notasEstudiante.Average(), 2)
                : (decimal?)null;

            if (promedioGeneral.HasValue)
                ws.Cell(row, col).Value = promedioGeneral.Value;
            else
                ws.Cell(row, col).Value = "";

            ws.Cell(row, col).Style.Font.Bold = true;
            ws.Cell(row, col).Style.NumberFormat.Format = "0.00";
            ws.Cell(row, col).Style.Fill.BackgroundColor = XLColor.LightGreen;
            ws.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            row++;
        }

        ws.Columns().AdjustToContents();
    }

    private async Task LlenarHojaCuadroAuxiliarExacto(IXLWorksheet ws, Clase clase, Materia materia, PeriodoAcademico periodo, int anio, bool esModulo)
    {
        var actividades = await _context.Actividades
            .Where(a => a.IdMateria == materia.IdMateria
                && a.IdClase == clase.IdClase
                && a.IdPeriodo == periodo.IdPeriodo
                && a.Estado == "Activo")
            .Include(a => a.SubActividades.OrderBy(sa => sa.Orden))
            .ToListAsync();

        var estudiantes = await _context.Inscripciones
            .Where(i => i.IdClase == clase.IdClase && i.AnioLectivo == anio && i.EstadoInscripcion == "Confirmada")
            .Select(i => i.Estudiante)
            .Where(e => e != null && e.Estado == true)
            .OrderBy(e => e!.Apellidos)
            .ThenBy(e => e!.Nombres)
            .ToListAsync();

        var idsSubActividades = actividades.SelectMany(a => a.SubActividades.Select(sa => sa.IdSubActividad)).ToList();
        var calificaciones = await _context.CalificacionesSubActividades
            .Where(c => idsSubActividades.Contains(c.IdSubActividad)
                && estudiantes.Select(e => e!.IdEstudiante).Contains(c.IdEstudiante))
            .ToListAsync();

        var resultadosPeriodo = await _context.ResultadosPeriodos
            .Where(r => r.IdClase == clase.IdClase
                && r.IdMateria == materia.IdMateria
                && r.IdPeriodo == periodo.IdPeriodo
                && r.AnioLectivo == anio
                && estudiantes.Select(e => e!.IdEstudiante).Contains(r.IdEstudiante))
            .ToListAsync();

        int row = 1;
        ws.Cell(row, 1).Value = "INSTITUTO NACIONAL DE APOPA";
        ws.Range(row, 1, row, 25).Merge();
        ws.Cell(row, 1).Style.Font.Bold = true;
        ws.Cell(row, 1).Style.Font.FontSize = 14;
        ws.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        row++;

        ws.Cell(row, 1).Value = "CUADRO AUXILIAR DE EVALUACIONES";
        ws.Range(row, 1, row, 25).Merge();
        ws.Cell(row, 1).Style.Font.Bold = true;
        ws.Cell(row, 1).Style.Font.FontSize = 12;
        ws.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        row += 3;

        int col = 1;
        EstiloHeaderVertical(ws.Cell(row, col), "CÓDIGO"); col++;
        EstiloHeaderHorizontal(ws.Cell(row, col), "NOMBRES"); col++;

        foreach (var act in actividades)
        {
            int colActStart = col;
            foreach (var sa in act.SubActividades)
            {
                if (sa.EsVertical)
                    EstiloHeaderVertical(ws.Cell(row, col), sa.NombreDisplay);
                else
                    EstiloHeaderHorizontal(ws.Cell(row, col), sa.NombreDisplay);
                col++;
            }
            int colActEnd = col - 1;
            if (colActStart <= colActEnd)
            {
                ws.Range(row, colActStart, row, colActEnd).Merge();
                var mc = ws.Cell(row, colActStart);
                mc.Value = $"{act.NombreActividad} ({act.Ponderacion}%)";
                mc.Style.Font.Bold = true;
                mc.Style.Fill.BackgroundColor = XLColor.LightYellow;
            }
        }
        row++;

        foreach (var est in estudiantes)
        {
            col = 1;
            ws.Cell(row, col).Value = est.CodigoEstudiante; col++;
            ws.Cell(row, col).Value = $"{est.Apellidos}, {est.Nombres}"; col++;

            foreach (var act in actividades)
            {
                foreach (var sa in act.SubActividades)
                {
                    var calif = calificaciones.FirstOrDefault(c => c.IdSubActividad == sa.IdSubActividad && c.IdEstudiante == est!.IdEstudiante);
                    if (calif?.Nota > 0)
                        ws.Cell(row, col).Value = calif.Nota.Value;
                    else
                        ws.Cell(row, col).Value = "";
                    col++;
                }
            }
            row++;
        }

        ws.Columns().AdjustToContents();
    }

    private async Task LlenarHojaCuadroAuxiliarModulos(IXLWorksheet ws, Clase clase, Especialidad especialidad, PeriodoAcademico periodo, int anio)
    {
        // Los módulos NO tienen período
        var actividades = await _context.Actividades
            .Where(a => a.IdEspecialidad == especialidad.IdEspecialidad
                && a.IdClase == clase.IdClase
                && a.EsModulo
                && a.Estado == "Activo")
            .OrderBy(a => a.NumeroOrden > 0 ? a.NumeroOrden : 9999)
            .Include(a => a.SubActividades.OrderBy(sa => sa.Orden))
            .ToListAsync();

        var estudiantes = await _context.Inscripciones
            .Where(i => i.IdClase == clase.IdClase && i.AnioLectivo == anio && i.EstadoInscripcion == "Confirmada")
            .Select(i => i.Estudiante)
            .Where(e => e != null && e.Estado == true)
            .OrderBy(e => e!.Apellidos).ThenBy(e => e!.Nombres)
            .ToListAsync();

        int row = 1;
        ws.Cell(row, 1).Value = "INSTITUTO NACIONAL DE APOPA";
        ws.Range(row, 1, row, 40).Merge();
        ws.Cell(row, 1).Style.Font.Bold = true;
        ws.Cell(row, 1).Style.Font.FontSize = 14;
        ws.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        row += 2;

        int col = 1;
        EstiloHeaderVertical(ws.Cell(row, col), "CÓDIGO"); col++;
        EstiloHeaderHorizontal(ws.Cell(row, col), "NOMBRES"); col++;

        foreach (var act in actividades)
        {
            EstiloHeaderHorizontal(ws.Cell(row, col), act.NombreActividad);
            col++;
        }
        row++;

        foreach (var est in estudiantes)
        {
            col = 1;
            ws.Cell(row, col).Value = est.CodigoEstudiante; col++;
            ws.Cell(row, col).Value = $"{est.Apellidos}, {est.Nombres}"; col++;

            foreach (var act in actividades)
            {
                ws.Cell(row, col).Value = "";
                col++;
            }
            row++;
        }

        ws.Columns().AdjustToContents();
    }

    private async Task LlenarHojaConsolidadoAnual(IXLWorksheet ws, string nivelNombre, List<Clase> clases, List<PeriodoAcademico> periodos, int anio)
    {
        ws.Cell(1, 1).Value = $"CONSOLIDADO ANUAL - {nivelNombre} - {anio}";
        ws.Cell(1, 1).Style.Font.Bold = true;
        ws.Cell(1, 1).Style.Font.FontSize = 14;
    }
}