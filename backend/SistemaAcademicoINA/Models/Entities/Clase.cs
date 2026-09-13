// Modelo de entidad: representa una clase o grupo académico (nivel, grado,
// sección y especialidad opcional) con su capacidad y cupos actuales.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("clases")]
public class Clase
{
    [Key]
    [Column("id_clase")]
    public int IdClase { get; set; }

    [Column("id_nivel")]
    public int IdNivel { get; set; }

    [Column("id_grado")]
    public int IdGrado { get; set; }

    [Column("id_especialidad")]
    public int? IdEspecialidad { get; set; }

    [Column("id_seccion")]
    public int IdSeccion { get; set; }

    [Column("nombre_clase")]
    public string NombreClase { get; set; } = string.Empty;

    [Column("seccion")]
    public string Seccion { get; set; } = string.Empty;

    [Column("grupo")]
    public string? Grupo { get; set; }

    [Column("anio_lectivo_actual")]
    public int? AnioLectivoActual { get; set; }

    [Column("cupo_maximo")]
    public int CupoMaximo { get; set; } = 30;

    [Column("cupo_actual")]
    public int CupoActual { get; set; } = 0;

    [Column("anio_lectivo")]
    public int AnioLectivo { get; set; }

    [Column("promocion_automatica")]
    public bool PromocionAutomatica { get; set; } = true;

    [Column("estado")]
    public bool Estado { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Relaciones de navegación (nivel académico, especialidad y sección)
    [ForeignKey("IdNivel")]
    public virtual NivelAcademico? Nivel { get; set; }

    [ForeignKey("IdEspecialidad")]
    public virtual Especialidad? Especialidad { get; set; }

    [ForeignKey("IdSeccion")]
    public virtual Seccion? SeccionObj { get; set; }
}