using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaAcademicoINA.Models.Entities
{
    /// <summary>
    /// Entidad que registra cada exportación Excel generada por los usuarios autorizados.
    /// Permite auditoría completa y descarga sin regeneración.
    /// </summary>
    [Table("exportaciones_historial")]
    public class ExportacionHistorial
    {
        [Key]
        [Column("id_exportacion")]
        public int IdExportacion { get; set; }

        [Column("id_usuario")]
        [Required]
        public int IdUsuario { get; set; }

        [Column("nombre_usuario")]
        [Required]
        [StringLength(200)]
        public string NombreUsuario { get; set; } = string.Empty;

        [Column("rol_usuario")]
        [Required]
        [StringLength(100)]
        public string RolUsuario { get; set; } = string.Empty;

        [Column("tipo_exportacion")]
        [Required]
        public TipoExportacion TipoExportacion { get; set; }

        [Column("descripcion")]
        [Required]
        [StringLength(500)]
        public string Descripcion { get; set; } = string.Empty;

        [Column("id_clase")]
        public int? IdClase { get; set; }

        [Column("id_materia")]
        public int? IdMateria { get; set; }

        [Column("id_especialidad")]
        public int? IdEspecialidad { get; set; }

        [Column("id_periodo")]
        public int? IdPeriodo { get; set; }

        [Column("anio_lectivo")]
        [Required]
        public int AnioLectivo { get; set; }

        [Column("nombre_archivo")]
        [Required]
        [StringLength(255)]
        public string NombreArchivo { get; set; } = string.Empty;

        [Column("ruta_archivo")]
        [Required]
        [StringLength(500)]
        public string RutaArchivo { get; set; } = string.Empty;

        [Column("tamano_bytes")]
        public long TamanoBytes { get; set; }

        [Column("total_registros")]
        public int TotalRegistros { get; set; }

        [Column("ip_origen")]
        [StringLength(50)]
        public string? IpOrigen { get; set; }

        [Column("user_agent")]
        public string? UserAgent { get; set; }

        [Column("fecha_generacion")]
        public DateTime FechaGeneracion { get; set; } = DateTime.Now;

        [Column("fecha_descarga")]
        public DateTime? FechaDescarga { get; set; }

        [Column("contador_descargas")]
        public int ContadorDescargas { get; set; } = 0;

        [Column("estado")]
        public EstadoExportacion Estado { get; set; } = EstadoExportacion.Activo;

        [Column("observaciones")]
        public string? Observaciones { get; set; }

        // ============================================
        // PROPIEDADES DE NAVEGACIÓN
        // ============================================

        [ForeignKey("IdUsuario")]
        public Usuario? Usuario { get; set; }

        [ForeignKey("IdClase")]
        public Clase? Clase { get; set; }

        [ForeignKey("IdMateria")]
        public Materia? Materia { get; set; }

        [ForeignKey("IdEspecialidad")]
        public Especialidad? Especialidad { get; set; }

        [ForeignKey("IdPeriodo")]
        public PeriodoAcademico? Periodo { get; set; }

        // ============================================
        // PROPIEDADES CALCULADAS (NO persistidas)
        // ============================================

        [NotMapped]
        public string TamanoLegible
        {
            get
            {
                if (TamanoBytes < 1024) return $"{TamanoBytes} B";
                if (TamanoBytes < 1024 * 1024) return $"{TamanoBytes / 1024.0:F2} KB";
                return $"{TamanoBytes / (1024.0 * 1024.0):F2} MB";
            }
        }

        [NotMapped]
        public string TipoExportacionLegible => TipoExportacion switch
        {
            TipoExportacion.ClaseMateriaPeriodo => "Clase + Materia + 1 Período",
            TipoExportacion.ClaseMateriaTodosPeriodos => "Clase + Materia + Todos los Períodos",
            TipoExportacion.ClaseTodasMateriasPeriodo => "Clase + Todas las Materias + 1 Período",
            TipoExportacion.ClaseTodasMateriasTodosPeriodos => "Clase + Todas las Materias + Todos los Períodos",
            TipoExportacion.ConsolidadoAnual => "Consolidado Anual",
            TipoExportacion.ResumenPorMateria => "Resumen por Materia (solo promedios)",
            _ => TipoExportacion.ToString()
        };

        [NotMapped]
        public string RutaDescarga => $"/api/exportaciones/{IdExportacion}/descargar";
    }

    public enum TipoExportacion
    {
        ClaseMateriaPeriodo,
        ClaseMateriaTodosPeriodos,
        ClaseTodasMateriasPeriodo,
        ClaseTodasMateriasTodosPeriodos,
        ConsolidadoAnual,
        ResumenPorMateria
    }

    public enum EstadoExportacion
    {
        Activo,
        Eliminado,
        Expirado
    }
}