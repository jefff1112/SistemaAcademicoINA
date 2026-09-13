// DTOs de resultados por periodo y boleta: modelos de transferencia utilizados
// para consultar notas por periodo, notas finales y la boleta completa del estudiante.
namespace SistemaAcademicoINA.DTOs
{
    // DTO de respuesta: nota de un estudiante por materia y periodo, con su estado.
    public class ResultadoPeriodoDto
    {
        public int IdEstudiante { get; set; }
        public string? CodigoEstudiante { get; set; }
        public string? EstudianteNombre { get; set; }
        public int IdMateria { get; set; }
        public string? MateriaNombre { get; set; }
        public int IdPeriodo { get; set; }
        public string? PeriodoNombre { get; set; }
        public decimal Nota { get; set; }
        public string Estado { get; set; } = "Pendiente";
    }

    // DTO de respuesta: nota final de un estudiante por materia, con su estado.
    public class ResultadoFinalDto
    {
        public int IdEstudiante { get; set; }
        public string? CodigoEstudiante { get; set; }
        public string? EstudianteNombre { get; set; }
        public int IdMateria { get; set; }
        public string? MateriaNombre { get; set; }
        public decimal NotaFinal { get; set; }
        public string Estado { get; set; } = "Pendiente";
    }

    // DTO de respuesta: estructura principal de la boleta (información del estudiante, notas por
    // periodo, nota final, asistencia, conducta y resumen de materias).
    public class BoletaEstudianteDto
    {
        public EstudianteInfoDto? Estudiante { get; set; }
        public List<NotaPeriodoDto> NotasPeriodos { get; set; } = new();
        public NotaFinalDto? NotaFinal { get; set; }
        public AsistenciaDto? Asistencia { get; set; }
        public string? Conducta { get; set; }
        public ResumenDto? Resumen { get; set; }
    }

    // DTO de respuesta: información general del estudiante para la boleta.
    public class EstudianteInfoDto
    {
        public int IdEstudiante { get; set; }
        public string? CodigoEstudiante { get; set; }
        public string? Nombres { get; set; }
        public string? Apellidos { get; set; }
        public string? Nie { get; set; }
        public string? Clase { get; set; }
        public string? Seccion { get; set; }
        public string? Especialidad { get; set; }
    }

    // DTO de respuesta: nota de un estudiante por periodo y materia.
    public class NotaPeriodoDto
    {
        public int IdPeriodo { get; set; }
        public string? PeriodoNombre { get; set; }
        public int PeriodoNumero { get; set; }
        public int IdMateria { get; set; }
        public string? MateriaNombre { get; set; }
        public decimal Nota { get; set; }
        public string Estado { get; set; } = "Pendiente";
    }

    // DTO de respuesta: nota final del estudiante con su estado.
    public class NotaFinalDto
    {
        public decimal Nota { get; set; }
        public string Estado { get; set; } = "Pendiente";
    }

    // DTO de respuesta: resumen de asistencias del estudiante para la boleta.
    public class AsistenciaDto
    {
        public int TotalDias { get; set; }
        public int Presentes { get; set; }
        public int Ausencias { get; set; }
        public int Tardanzas { get; set; }
        public int Justificadas { get; set; }
        public decimal Porcentaje { get; set; }
    }

    // DTO de respuesta: resumen de materias aprobadas/reprobadas y promedio general.
    public class ResumenDto
    {
        public int MateriasAprobadas { get; set; }
        public int MateriasReprobadas { get; set; }
        public decimal PromedioGeneral { get; set; }
    }
}