// DTO de respuesta: calificaciones generales de un estudiante por materia
// (notas de los 4 periodos, nota final, nota mínima y estado final).
namespace SistemaAcademicoINA.Models.DTOs;

public class NotaGeneralDTO
{
    public int IdEstudiante { get; set; }
    public string CodigoEstudiante { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public int IdClase { get; set; }
    public string NombreClase { get; set; } = string.Empty;
    public int IdMateria { get; set; }
    public string NombreMateria { get; set; } = string.Empty;
    public string TipoMateria { get; set; } = string.Empty;
    public decimal? Periodo1 { get; set; }
    public decimal? Periodo2 { get; set; }
    public decimal? Periodo3 { get; set; }
    public decimal? Periodo4 { get; set; }
    public decimal? NotaFinal { get; set; }
    public decimal NotaMinima { get; set; }
    public string EstadoFinal { get; set; } = string.Empty;
}
