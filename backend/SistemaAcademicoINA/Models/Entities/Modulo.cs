// Modelo de entidad: módulo de una especialidad (por año/grado).
// Los módulos son por especialidad + grado; todas las clases del mismo
// nivel y especialidad comparten los mismos módulos.
// Código: "Modulo {numero_grado}.{numero_modulo}" (plan MINED).
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("modulos")]
public class Modulo
{
    [Key]
    [Column("id_modulo")]
    public int IdModulo { get; set; }

    [Column("id_especialidad")]
    public int IdEspecialidad { get; set; }

    [Column("numero_grado")]
    public int NumeroGrado { get; set; }

    [Column("numero_modulo")]
    public int NumeroModulo { get; set; }

    [Column("nombre_modulo")]
    [MaxLength(200)]
    [Required]
    public string NombreModulo { get; set; } = string.Empty;

    [Column("orden")]
    public int Orden { get; set; } = 0;

    [Column("estado")]
    public bool Estado { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(IdEspecialidad))]
    public virtual Especialidad? Especialidad { get; set; }

    /// <summary>Código tipo "Modulo 2.8" (grado.módulo).</summary>
    [NotMapped]
    public string Codigo => $"Módulo {NumeroGrado}.{NumeroModulo}";
}