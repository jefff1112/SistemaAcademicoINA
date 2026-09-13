// Modelo de entidad: resultados de las verificaciones de integridad
// de datos realizadas sobre cada tabla del sistema.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("integridad_datos")]
public class IntegridadDatos
{
    [Key]
    [Column("id_integridad")]
    public int IdIntegridad { get; set; }

    [Column("tabla")]
    public string Tabla { get; set; } = string.Empty;

    [Column("registros_ok")]
    public int RegistrosOk { get; set; }

    [Column("registros_error")]
    public int RegistrosError { get; set; }

    [Column("errores")]
    public string? Errores { get; set; }

    [Column("fecha_verificacion")]
    public DateTime FechaVerificacion { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}