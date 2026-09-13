// Modelo de entidad: estadísticas de tamaño y cantidad de registros
// por tabla de la base de datos.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("estadisticas_tablas")]
public class EstadisticasTabla
{
    [Key]
    [Column("id_estadistica")]
    public int IdEstadistica { get; set; }

    [Column("tabla")]
    public string Tabla { get; set; } = string.Empty;

    [Column("registros")]
    public int Registros { get; set; }

    [Column("tamano_mb")]
    public decimal TamanoMB { get; set; }

    [Column("fecha_actualizacion")]
    public DateTime FechaActualizacion { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}