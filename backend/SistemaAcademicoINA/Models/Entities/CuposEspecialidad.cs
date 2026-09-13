// Modelo de entidad: control de cupos disponibles por especialidad,
// sección y año lectivo para el proceso de admisión.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("cupos_especialidades")]
public class CuposEspecialidad
{
    [Key]
    [Column("id_cupo")]
    public int IdCupo { get; set; }

    [Column("id_especialidad")]
    public int IdEspecialidad { get; set; }

    [Column("seccion")]
    public string Seccion { get; set; } = string.Empty;

    [Column("cupos_totales")]
    public int CuposTotales { get; set; }

    [Column("cupos_ocupados")]
    public int CuposOcupados { get; set; }

    // Propiedad calculada: cupos disponibles = cupos totales - cupos ocupados.
    [Column("cupos_disponibles")]
    public int CuposDisponibles => CuposTotales - CuposOcupados;

    [Column("anio_lectivo")]
    public int AnioLectivo { get; set; }

    [ForeignKey("IdEspecialidad")]
    public virtual Especialidad? Especialidad { get; set; }
}