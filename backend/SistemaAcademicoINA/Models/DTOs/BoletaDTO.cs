// DTOs de boleta: modelos de transferencia para generar la boleta de
// calificaciones de un estudiante (notas, asistencias y conducta por periodo).
namespace SistemaAcademicoINA.Models.DTOs;

// DTO de respuesta: boleta completa de un estudiante por periodo (datos generales, notas, asistencia, conducta y resumen de materias).
public class BoletaDTO
{
    public int IdEstudiante { get; set; }
    public string CodigoEstudiante { get; set; } = "N/A";
    public string Nombres { get; set; } = "Sin nombre";
    public string Apellidos { get; set; } = "Sin apellido";
    public string Nie { get; set; } = "N/A";
    public string Seccion { get; set; } = "A";
    public string Grado { get; set; } = "Primer Año";
    public string Especialidad { get; set; } = "Bachillerato General";

    public int PeriodoId { get; set; }
    public string PeriodoNombre { get; set; } = "Periodo";
    public int PeriodoNumero { get; set; }
    public int AnioLectivo { get; set; }

    public List<NotaBoletaDTO> Notas { get; set; } = new();
    public AsistenciasBoletaDTO Asistencias { get; set; } = new();
    public string Conducta { get; set; } = "Excelente";

    public int MateriasAprobadas { get; set; }
    public int MateriasReprobadas { get; set; }
    public int ModulosAprobados { get; set; }
    public int ModulosReprobados { get; set; }
    public string DocenteOrientador { get; set; } = "DOCENTE ORIENTADOR/A";
}

// DTO de respuesta: notas por materia dentro de la boleta (P1-P4, promedio, nota final, estado e inasistencias).
public class NotaBoletaDTO
{
    public int IdMateria { get; set; }
    public string NombreMateria { get; set; } = "Sin materia";
    public string TipoMateria { get; set; } = "Basica";
    public decimal P1 { get; set; }
    public decimal P2 { get; set; }
    public decimal P3 { get; set; }
    public decimal P4 { get; set; }
    public decimal Promedio { get; set; }
    public decimal NotaFinal { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public int Inasistencias { get; set; }
}

// DTO de respuesta: resumen de asistencias incluido en la boleta de calificaciones.
public class AsistenciasBoletaDTO
{
    public int TotalDias { get; set; }
    public int Presentes { get; set; }
    public int Ausencias { get; set; }
    public int Tardanzas { get; set; }
    public int Justificadas { get; set; }
    public decimal Porcentaje { get; set; }
}
