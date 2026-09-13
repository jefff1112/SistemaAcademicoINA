// Modelo de entidad: guarda el estado original de cada asistencia modificada por el
// permiso automático de una constancia, para revertirlo si la constancia se anula.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities;

[Table("constancia_asistencia_revert")]
public class ConstanciaAsistenciaRevert
{
    [Key]
    [Column("id_revert")]
    public int IdRevert { get; set; }

    [Column("id_constancia")]
    public int IdConstancia { get; set; }

    [Column("id_asistencia")]
    public int IdAsistencia { get; set; }

    [Column("estado_anterior")]
    public string EstadoAnterior { get; set; } = "Presente";

    // Indica si la asistencia fue CREADA por el permiso (no existía antes).
    // Al revertir, esas filas se eliminan en lugar de restaurar el estado anterior.
    [Column("creada_por_permiso")]
    public bool CreadaPorPermiso { get; set; }
}