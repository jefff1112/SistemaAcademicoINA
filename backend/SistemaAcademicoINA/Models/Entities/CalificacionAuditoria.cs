using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities
{
    [Table("calificaciones_auditoria")]
    public class CalificacionAuditoria
    {
        [Key]
        [Column("id_auditoria")]
        public int IdAuditoria { get; set; }

        [Column("id_calificacion_sub")]
        public int IdCalificacionSub { get; set; }

        [Column("id_estudiante")]
        public int IdEstudiante { get; set; }

        [Column("nota_anterior", TypeName = "decimal(5,2)")]
        public decimal? NotaAnterior { get; set; }

        [Column("nota_nueva", TypeName = "decimal(5,2)")]
        public decimal? NotaNueva { get; set; }

        [Column("nota_recuperacion_anterior", TypeName = "decimal(5,2)")]
        public decimal? NotaRecuperacionAnterior { get; set; }

        [Column("nota_recuperacion_nueva", TypeName = "decimal(5,2)")]
        public decimal? NotaRecuperacionNueva { get; set; }

        [Required]
        [Column("observacion_cambio")]
        public string ObservacionCambio { get; set; } = string.Empty;

        [Column("id_usuario_cambio")]
        public int IdUsuarioCambio { get; set; }

        [Required]
        [StringLength(200)]
        [Column("nombre_usuario")]
        public string NombreUsuario { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [Column("rol_usuario")]
        public string RolUsuario { get; set; } = string.Empty;

        [StringLength(50)]
        [Column("ip_address")]
        public string? IpAddress { get; set; }

        [Column("user_agent")]
        public string? UserAgent { get; set; }

        [Column("fecha_hora_cambio")]
        public DateTime FechaHoraCambio { get; set; } = DateTime.Now;

        [Required]
        [Column("tipo_cambio")]
        public string TipoCambio { get; set; } = "MODIFICACION"; // CREACION, MODIFICACION, RECUPERACION

        // Navegación
        [ForeignKey("IdCalificacionSub")]
        public CalificacionSubActividad? CalificacionSubActividad { get; set; }

        [ForeignKey("IdEstudiante")]
        public Estudiante? Estudiante { get; set; }

        [ForeignKey("IdUsuarioCambio")]
        public Usuario? Usuario { get; set; }
    }
}
