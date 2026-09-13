// Modelo de entidad: monitoreo del espacio en disco utilizado
// por la base de datos (total, libre, usado y porcentaje).
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("monitoreo_espacio")]
public class MonitoreoEspacio
{
    [Key]
    [Column("id_monitoreo")]
    public int IdMonitoreo { get; set; }

    [Column("espacio_total_gb")]
    public decimal EspacioTotalGB { get; set; }

    [Column("espacio_libre_gb")]
    public decimal EspacioLibreGB { get; set; }

    [Column("espacio_usado_gb")]
    public decimal EspacioUsadoGB { get; set; }

    [Column("porcentaje_uso")]
    public decimal PorcentajeUso { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}