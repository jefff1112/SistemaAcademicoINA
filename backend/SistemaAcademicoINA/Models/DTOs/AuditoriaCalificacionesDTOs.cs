using System;
using System.Collections.Generic;

namespace SistemaAcademicoINA.Models.DTOs
{
    // ============================================================
    // DTO para guardar calificación con auditoría
    // ============================================================
    public class GuardarConAuditoriaRequest
    {
        public int IdSubActividad { get; set; }
        public int IdEstudiante { get; set; }
        public decimal? Nota { get; set; }
        public decimal? NotaRecuperacion { get; set; }
        public string Observacion { get; set; } = string.Empty;
        public bool EsPrimeraVez { get; set; } = false; // Si es primera vez, el docente no necesita observación
        public string RolUsuario { get; set; } = string.Empty; // Para saber si es docente, registro o dirección
    }

    // ============================================================
    // DTO para guardar múltiples calificaciones con auditoría
    // ============================================================
    public class GuardarMultipleConAuditoriaRequest
    {
        public List<ItemConAuditoria> Calificaciones { get; set; } = new();
        public string ObservacionGeneral { get; set; } = string.Empty;
        public string RolUsuario { get; set; } = string.Empty;
    }

    public class ItemConAuditoria
    {
        public int IdSubActividad { get; set; }
        public int IdEstudiante { get; set; }
        public decimal? Nota { get; set; }
        public decimal? NotaRecuperacion { get; set; }
        public bool EsPrimeraVez { get; set; } = false;
    }

    // ============================================================
    // DTO para respuesta de historial de auditoría
    // ============================================================
    public class HistorialAuditoriaResponse
    {
        public int IdAuditoria { get; set; }
        public int IdCalificacionSub { get; set; }
        public string NombreEstudiante { get; set; } = string.Empty;
        public string NombreSubActividad { get; set; } = string.Empty;
        public string NombreActividad { get; set; } = string.Empty;
        public string NombreMateria { get; set; } = string.Empty;
        public string Seccion { get; set; } = string.Empty;
        public decimal? NotaAnterior { get; set; }
        public decimal? NotaNueva { get; set; }
        public decimal? NotaRecuperacionAnterior { get; set; }
        public decimal? NotaRecuperacionNueva { get; set; }
        public string ObservacionCambio { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string RolUsuario { get; set; } = string.Empty;
        public string TipoCambio { get; set; } = string.Empty;
        public DateTime FechaHoraCambio { get; set; }
        public string DescripcionCambio { get; set; } = string.Empty;
        public bool FueModificado { get; set; } // Para mostrar color naranja en UI
    }

    // ============================================================
    // DTO para verificar si una calificación tiene historial
    // ============================================================
    public class EstadoAuditoriaResponse
    {
        public int IdCalificacionSub { get; set; }
        public bool TieneHistorial { get; set; }
        public int TotalCambios { get; set; }
        public DateTime? UltimaModificacion { get; set; }
        public string UltimoUsuario { get; set; } = string.Empty;
        public string UltimaObservacion { get; set; } = string.Empty;
        public List<HistorialAuditoriaResponse> Historial { get; set; } = new();
    }

    // ============================================================
    // DTO para verificar estado de múltiples calificaciones
    // ============================================================
    public class VerificarAuditoriaBatchRequest
    {
        public List<int> IdsCalificacionSub { get; set; } = new();
    }
}
