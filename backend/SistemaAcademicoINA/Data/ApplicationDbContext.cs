// Contexto de base de datos: gestiona todas las entidades del sistema académico (usuarios, estudiantes, docentes, notas, auditoría, etc.).
// Data/ApplicationDbContext.cs

using Microsoft.EntityFrameworkCore;
using SistemaAcademicoINA.Models.Entities;

namespace SistemaAcademicoINA.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Usuarios y Roles
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Rol> Roles { get; set; }

    // Aspirantes y Estudiantes
    public DbSet<Aspirante> Aspirantes { get; set; }
    public DbSet<Estudiante> Estudiantes { get; set; }
    public DbSet<Inscripcion> Inscripciones { get; set; }

    // Docentes
    public DbSet<Docente> Docentes { get; set; }
    public DbSet<DocenteMateria> DocenteMaterias { get; set; }

    // Clases y Materias
    public DbSet<Clase> Clases { get; set; }
    public DbSet<Materia> Materias { get; set; }
    public DbSet<Grado> Grados { get; set; }
    public DbSet<NivelAcademico> NivelesAcademicos { get; set; }
    public DbSet<Especialidad> Especialidades { get; set; }
    public DbSet<Seccion> Secciones { get; set; }

    // Horarios
    public DbSet<Horario> Horarios { get; set; }

    // Notas
    public DbSet<ResultadoPeriodo> ResultadosPeriodos { get; set; }
    public DbSet<ResultadoFinal> ResultadosFinales { get; set; }

    // Asistencias
    public DbSet<Asistencia> Asistencias { get; set; }
    public DbSet<AsistenciasResumen> AsistenciasResumen { get; set; }

    // Periodos
    public DbSet<PeriodoAcademico> PeriodosAcademicos { get; set; }

    // Personas y Relaciones
    public DbSet<Persona> Personas { get; set; }
    public DbSet<RelacionFamiliar> RelacionesFamiliares { get; set; }

    // Cupos Especialidad
    public DbSet<CuposEspecialidad> CuposEspecialidades { get; set; }

    // Módulos de especialidad
    public DbSet<Modulo> Modulos { get; set; }
    public DbSet<DocenteModulo> DocenteModulos { get; set; }

    // Actividades y Calificaciones
    public DbSet<Actividad> Actividades { get; set; }
    public DbSet<CalificacionActividad> CalificacionesActividades { get; set; }
    public DbSet<ActividadesPeriodo> ActividadesPeriodos { get; set; }
    public DbSet<SubActividad> SubActividades { get; set; }
    public DbSet<CalificacionSubActividad> CalificacionesSubActividades { get; set; }
    public DbSet<ActividadPlantilla> ActividadPlantillas { get; set; }
    public DbSet<ActividadPlantillaDetalle> ActividadPlantillaDetalles { get; set; }
    public DbSet<SubActividadPlantillaDetalle> SubActividadPlantillaDetalles { get; set; }
    public DbSet<RecuperacionesModulo> RecuperacionesModulo { get; set; }

    // Faltas y Amonestaciones
    public DbSet<FaltaAmonestacion> FaltasAmonestaciones { get; set; }

    // Conducta
    public DbSet<ConductaPeriodo> ConductaPeriodos { get; set; }

    // Auditoria
    public DbSet<AuditoriaNota> AuditoriaNotas { get; set; }
    public DbSet<Auditoria> Auditoria { get; set; }

    // Constancias
    public DbSet<Constancia> Constancias { get; set; }
    public DbSet<ConstanciaAsistenciaRevert> ConstanciaAsistenciaReverts { get; set; }

    // Documentos de estudiantes
    public DbSet<DocumentoEstudiante> DocumentosEstudiantes { get; set; }

    // Mantenimiento y Seguridad
    public DbSet<IntentoLogin> IntentosLogin { get; set; }
    public DbSet<ErrorSistema> ErroresSistema { get; set; }
    public DbSet<MonitoreoEspacio> MonitoreoEspacio { get; set; }
    public DbSet<HistorialContrasena> HistorialContrasenas { get; set; }
    public DbSet<ActividadUsuario> ActividadUsuarios { get; set; }
    public DbSet<SesionUsuario> SesionesUsuarios { get; set; }
    public DbSet<CacheSistema> CacheSistema { get; set; }
    public DbSet<IntegridadDatos> IntegridadDatos { get; set; }
    public DbSet<EstadisticasTabla> EstadisticasTablas { get; set; }

    // Notificaciones
    public DbSet<Notificacion> Notificaciones { get; set; }
    public DbSet<CorreoProgramado> CorreosProgramados { get; set; }

    // Avisos Internos
    public DbSet<AvisoInterno> AvisosInternos { get; set; }

    // Recuperaciones Contraseña
    public DbSet<RecuperacionContrasena> RecuperacionesContrasena { get; set; }

    // Exportaciones Excel (Auditoría + Historial)
    public DbSet<ExportacionHistorial> ExportacionesHistorial { get; set; }

    // Auditoría de Calificaciones (cambios de notas con observaciones)
    public DbSet<CalificacionAuditoria> CalificacionesAuditoria { get; set; }

    // Activación de cuentas por correo
    public DbSet<TokenActivacion> TokensActivacion { get; set; }

    // Reportes de datos incorrectos de estudiantes
    public DbSet<ReporteDatoEstudiante> ReportesDatosEstudiante { get; set; }

    // Configuración del modelo: índices únicos y compuestos, índices de rendimiento, precisiones decimales y mapeos de tablas.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ============================================================
        // ÍNDICES ÚNICOS EXISTENTES
        // ============================================================
        modelBuilder.Entity<Usuario>().HasIndex(u => u.Codigo).IsUnique();
        modelBuilder.Entity<Estudiante>().HasIndex(e => e.CodigoEstudiante).IsUnique();
        modelBuilder.Entity<Docente>().HasIndex(d => d.CodigoDocente).IsUnique();
        modelBuilder.Entity<Especialidad>().HasIndex(e => e.NombreEspecialidad).IsUnique();

        // ============================================================
        // ÍNDICES COMPUESTOS
        // ============================================================
        // Claves de unicidad sobre combinaciones de columnas (estudiante-materia-periodo, docentes, horarios, etc.).
        modelBuilder.Entity<ResultadoPeriodo>()
            .HasIndex(rp => new {
                rp.IdEstudiante,
                rp.IdClase,
                rp.IdMateria,
                rp.IdEspecialidad,
                rp.IdPeriodo,
                rp.AnioLectivo
            })
            .HasDatabaseName("uk_resultado_periodo")
            .IsUnique();

        modelBuilder.Entity<ResultadoFinal>()
            .HasIndex(rf => new { rf.IdEstudiante, rf.IdMateria, rf.AnioLectivo })
            .IsUnique();

        modelBuilder.Entity<RelacionFamiliar>()
            .HasIndex(rf => new { rf.IdEstudiante, rf.IdPersona })
            .IsUnique();

        modelBuilder.Entity<DocenteMateria>()
            .HasIndex(dm => new { dm.IdDocente, dm.IdMateria, dm.IdClase, dm.AnioLectivo })
            .IsUnique();

        modelBuilder.Entity<Horario>()
            .HasIndex(h => new { h.IdClase, h.DiaSemana, h.HoraInicio })
            .IsUnique();

        // ============================================================
        // ÍNDICES PARA RENDIMIENTO
        // ============================================================
        // Acelera las consultas frecuentes por fecha y por estado de errores.
        modelBuilder.Entity<Auditoria>()
            .HasIndex(a => a.Fecha);

        modelBuilder.Entity<ErrorSistema>()
            .HasIndex(e => e.Fecha);

        modelBuilder.Entity<ErrorSistema>()
            .HasIndex(e => e.Resuelto);

        modelBuilder.Entity<IntentoLogin>()
            .HasIndex(i => new { i.Codigo, i.Fecha });

        // ============================================================
        // PRECISIONES DECIMALES
        // ============================================================
        // Define la precisión de los campos numéricos de notas y monitoreo de espacio (5,2) y (10,2).
        modelBuilder.Entity<Aspirante>()
            .Property(a => a.NotaExamen)
            .HasPrecision(5, 2);

        modelBuilder.Entity<Aspirante>()
            .Property(a => a.PromedioAnterior)
            .HasPrecision(5, 2);

        modelBuilder.Entity<ResultadoPeriodo>()
            .Property(rp => rp.NotaAcumulada)
            .HasPrecision(5, 2);

        modelBuilder.Entity<ResultadoFinal>()
            .Property(rf => rf.NotaFinal)
            .HasPrecision(5, 2);

        modelBuilder.Entity<MonitoreoEspacio>()
            .Property(m => m.EspacioTotalGB)
            .HasPrecision(10, 2);

        modelBuilder.Entity<MonitoreoEspacio>()
            .Property(m => m.EspacioLibreGB)
            .HasPrecision(10, 2);

        modelBuilder.Entity<MonitoreoEspacio>()
            .Property(m => m.EspacioUsadoGB)
            .HasPrecision(10, 2);

        modelBuilder.Entity<MonitoreoEspacio>()
            .Property(m => m.PorcentajeUso)
            .HasPrecision(5, 2);

        // ============================================================
        // CONFIGURACIONES DE ESPECIALIDAD
        // ============================================================
        modelBuilder.Entity<Especialidad>()
            .Property(e => e.NombreEspecialidad)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Especialidad>()
            .Property(e => e.DuracionAnios)
            .HasDefaultValue(3);

        modelBuilder.Entity<Especialidad>()
            .Property(e => e.Estado)
            .HasDefaultValue(true);

        // ============================================================
        // CONFIGURACIONES DE ErrorSistema
        // ============================================================
        modelBuilder.Entity<ErrorSistema>()
            .Property(e => e.Mensaje)
            .IsRequired();

        // ============================================================
        // CONFIGURACIONES DE IntentoLogin
        // ============================================================
        modelBuilder.Entity<IntentoLogin>()
            .Property(i => i.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        // ============================================================
        // CONFIGURACIONES DE HistorialContrasena
        // ============================================================
        modelBuilder.Entity<HistorialContrasena>()
            .Property(h => h.ContrasenaAnterior)
            .IsRequired();

        modelBuilder.Entity<HistorialContrasena>()
            .Property(h => h.ContrasenaNueva)
            .IsRequired();

        modelBuilder.Entity<HistorialContrasena>()
            .HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(h => h.IdUsuario)
            .OnDelete(DeleteBehavior.Cascade);

        // ============================================================
        // CONFIGURACIÓN: AsistenciasResumen
        // ============================================================
        // Mapea la entidad a la tabla "asistencias_resumen" con sus índices y relaciones.
        modelBuilder.Entity<AsistenciasResumen>(entity =>
        {
            entity.ToTable("asistencias_resumen");
            entity.HasKey(e => e.IdResumen);

            entity.Property(e => e.IdResumen)
                .HasColumnName("id_resumen")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.IdEstudiante)
                .HasColumnName("id_estudiante")
                .IsRequired();

            entity.Property(e => e.IdClase)
                .HasColumnName("id_clase")
                .IsRequired();

            entity.Property(e => e.AnioLectivo)
                .HasColumnName("anio_lectivo")
                .IsRequired();

            entity.Property(e => e.Periodo)
                .HasColumnName("periodo")
                .IsRequired();

            entity.Property(e => e.TotalDias)
                .HasColumnName("total_dias")
                .HasDefaultValue(0);

            entity.Property(e => e.Presentes)
                .HasColumnName("presentes")
                .HasDefaultValue(0);

            entity.Property(e => e.Ausencias)
                .HasColumnName("ausencias")
                .HasDefaultValue(0);

            entity.Property(e => e.Tardanzas)
                .HasColumnName("tardanzas")
                .HasDefaultValue(0);

            entity.Property(e => e.Justificadas)
                .HasColumnName("justificadas")
                .HasDefaultValue(0);

            entity.Property(e => e.PorcentajeAsistencia)
                .HasColumnName("porcentaje_asistencia")
                .HasPrecision(5, 2)
                .HasDefaultValue(0);

            entity.HasIndex(e => new { e.IdEstudiante, e.IdClase, e.AnioLectivo, e.Periodo })
                .IsUnique()
                .HasDatabaseName("uk_resumen_estudiante_periodo");

            entity.HasIndex(e => e.IdEstudiante)
                .HasDatabaseName("idx_resumen_estudiante");

            entity.HasIndex(e => e.IdClase)
                .HasDatabaseName("idx_resumen_clase");

            entity.HasOne(e => e.Estudiante)
                .WithMany()
                .HasForeignKey(e => e.IdEstudiante)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Clase)
                .WithMany()
                .HasForeignKey(e => e.IdClase)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============================================================
        // CONFIGURACIÓN: Constancia
        // ============================================================
        // Define explícitamente la relación con Estudiante (la columna id_estudiante);
        // la convención de EF no la detectaba por el nombre de la propiedad.
        modelBuilder.Entity<Constancia>(entity =>
        {
            entity.ToTable("constancias");
            entity.HasKey(c => c.IdConstancia);

            entity.HasOne(c => c.Estudiante)
                .WithMany()
                .HasForeignKey(c => c.IdEstudiante)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(c => c.IdEstudiante)
                .HasDatabaseName("idx_constancia_estudiante");

            entity.HasIndex(c => c.Estado)
                .HasDatabaseName("idx_constancia_estado");
        });

        // ============================================================
        // CONFIGURACIÓN: DocumentoEstudiante
        // ============================================================
        // Define explícitamente la relación con Estudiante (la columna id_estudiante).
        modelBuilder.Entity<DocumentoEstudiante>(entity =>
        {
            entity.ToTable("documentos_estudiantes");
            entity.HasKey(d => d.IdDocumento);

            entity.HasOne(d => d.Estudiante)
                .WithMany()
                .HasForeignKey(d => d.IdEstudiante)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(d => d.IdEstudiante)
                .HasDatabaseName("idx_documento_estudiante");
        });

        // ============================================================
        // CONFIGURACIÓN: ConductaPeriodo
        // Mapea la entidad a la tabla "conducta_periodos" con sus índices y relaciones.
        modelBuilder.Entity<ConductaPeriodo>(entity =>
        {
            entity.ToTable("conducta_periodos");
            entity.HasKey(e => e.IdConducta);

            entity.Property(e => e.IdConducta)
                .HasColumnName("id_conducta")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.IdEstudiante)
                .HasColumnName("id_estudiante")
                .IsRequired();

            entity.Property(e => e.IdPeriodo)
                .HasColumnName("id_periodo")
                .IsRequired();

            entity.Property(e => e.CalificacionConducta)
                .HasColumnName("calificacion_conducta")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.Observaciones)
                .HasColumnName("observaciones")
                .HasColumnType("text");

            entity.Property(e => e.RegistradoPor)
                .HasColumnName("registrado_por");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAddOrUpdate();

            entity.HasIndex(e => new { e.IdEstudiante, e.IdPeriodo })
                .IsUnique()
                .HasDatabaseName("uk_estudiante_periodo");

            entity.HasIndex(e => e.CalificacionConducta)
                .HasDatabaseName("idx_conducta_calificacion");

            entity.HasOne(e => e.Estudiante)
                .WithMany()
                .HasForeignKey(e => e.IdEstudiante)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_conducta_estudiante");

            entity.HasOne(e => e.Periodo)
                .WithMany(p => p.ConductaPeriodos)
                .HasForeignKey(e => e.IdPeriodo)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_conducta_periodo");
        });

        // ============================================================
        // CONFIGURACIÓN: ActividadesPeriodo
        // ============================================================
        // Mapea la entidad a la tabla "actividades_periodos" con sus índices y relaciones.
        modelBuilder.Entity<ActividadesPeriodo>(entity =>
        {
            entity.ToTable("actividades_periodos");
            entity.HasKey(e => e.IdActividadPeriodo);

            entity.Property(e => e.IdActividadPeriodo)
                .HasColumnName("id_actividad_periodo")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.IdActividad)
                .HasColumnName("id_actividad")
                .IsRequired();

            entity.Property(e => e.IdPeriodo)
                .HasColumnName("id_periodo")
                .IsRequired();

            entity.Property(e => e.PonderacionPeriodo)
                .HasColumnName("ponderacion_periodo")
                .HasPrecision(5, 2)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAddOrUpdate();

            entity.HasIndex(e => new { e.IdActividad, e.IdPeriodo })
                .IsUnique()
                .HasDatabaseName("uk_actividad_periodo");

            entity.HasIndex(e => e.IdPeriodo)
                .HasDatabaseName("idx_actividad_periodo_periodo");

            entity.HasOne(e => e.Actividad)
                .WithMany(a => a.ActividadesPeriodos)
                .HasForeignKey(e => e.IdActividad)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Periodo)
                .WithMany()
                .HasForeignKey(e => e.IdPeriodo)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============================================================
        // CONFIGURACIÓN: SubActividad
        // ============================================================
        modelBuilder.Entity<SubActividad>(entity =>
        {
            entity.ToTable("sub_actividades");
            entity.HasKey(e => e.IdSubActividad);

            entity.Property(e => e.IdSubActividad)
                .HasColumnName("id_sub_actividad")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.IdActividad)
                .HasColumnName("id_actividad")
                .IsRequired();

            entity.Property(e => e.NombreSubActividad)
                .HasColumnName("nombre_sub_actividad")
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.TipoSubActividad)
                .HasColumnName("tipo_sub_actividad")
                .HasMaxLength(50)
                .HasDefaultValue("Subactividad");

            entity.Property(e => e.Ponderacion)
                .HasColumnName("ponderacion")
                .HasPrecision(5, 2)
                .IsRequired();

            entity.Property(e => e.Orden)
                .HasColumnName("orden")
                .HasDefaultValue(1);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAddOrUpdate();

            entity.Property(e => e.EsVertical)
                .HasColumnName("es_vertical")
                .HasDefaultValue(false);

            entity.Property(e => e.NumeroOrden)
                .HasColumnName("numero_orden")
                .HasDefaultValue(0);

            entity.HasIndex(e => e.IdActividad)
                .HasDatabaseName("idx_sub_actividad_actividad");

            entity.HasIndex(e => e.TipoSubActividad)
                .HasDatabaseName("idx_sub_actividades_tipo");

            entity.HasOne(e => e.Actividad)
                .WithMany(a => a.SubActividades)
                .HasForeignKey(e => e.IdActividad)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============================================================
        // CONFIGURACIÓN: CalificacionSubActividad
        // ============================================================
        modelBuilder.Entity<CalificacionSubActividad>(entity =>
        {
            entity.ToTable("calificaciones_sub_actividades");
            entity.HasKey(e => e.IdCalificacionSub);

            entity.Property(e => e.IdCalificacionSub)
                .HasColumnName("id_calificacion_sub")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.IdSubActividad)
                .HasColumnName("id_sub_actividad")
                .IsRequired();

            entity.Property(e => e.IdEstudiante)
                .HasColumnName("id_estudiante")
                .IsRequired();

            entity.Property(e => e.Nota)
                .HasColumnName("nota")
                .HasPrecision(5, 2);

            entity.Property(e => e.NotaRecuperacion)
                .HasColumnName("nota_recuperacion")
                .HasPrecision(5, 2);

            entity.Property(e => e.Observaciones)
                .HasColumnName("observaciones")
                .HasColumnType("text");

            entity.Property(e => e.RegistradoPor)
                .HasColumnName("registrado_por");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAddOrUpdate();

            entity.Property(e => e.FechaModificacion)
                .HasColumnName("fecha_modificacion");

            entity.HasIndex(e => new { e.IdEstudiante, e.IdSubActividad })
                .IsUnique()
                .HasDatabaseName("uk_estudiante_sub_actividad");

            entity.HasIndex(e => e.IdEstudiante)
                .HasDatabaseName("idx_calif_sub_estudiante");

            entity.HasIndex(e => e.IdSubActividad)
                .HasDatabaseName("idx_calif_sub_actividad");

            entity.HasOne(e => e.SubActividad)
                .WithMany(sa => sa.CalificacionesSubActividades)
                .HasForeignKey(e => e.IdSubActividad)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Estudiante)
                .WithMany()
                .HasForeignKey(e => e.IdEstudiante)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============================================================
        // CONFIGURACIÓN: ActividadPlantilla
        // ============================================================
        modelBuilder.Entity<ActividadPlantilla>(entity =>
        {
            entity.ToTable("actividad_plantillas");
            entity.HasKey(e => e.IdPlantilla);

            entity.Property(e => e.IdPlantilla)
                .HasColumnName("id_plantilla")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.NombrePlantilla)
                .HasColumnName("nombre_plantilla")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Descripcion)
                .HasColumnName("descripcion")
                .HasColumnType("text");

            entity.Property(e => e.TipoMateria)
                .HasColumnName("tipo_materia")
                .HasMaxLength(20)
                .HasDefaultValue("Todas");

            entity.Property(e => e.EsPredeterminada)
                .HasColumnName("es_predeterminada")
                .HasDefaultValue(false);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAddOrUpdate();

            entity.HasIndex(e => e.TipoMateria)
                .HasDatabaseName("idx_plantilla_tipo_materia");

            entity.HasIndex(e => e.EsPredeterminada)
                .HasDatabaseName("idx_plantilla_predeterminada");
        });

        // ============================================================
        // CONFIGURACIÓN: ActividadPlantillaDetalle
        // ============================================================
        modelBuilder.Entity<ActividadPlantillaDetalle>(entity =>
        {
            entity.ToTable("actividad_plantilla_detalle");
            entity.HasKey(e => e.IdDetalle);

            entity.Property(e => e.IdDetalle)
                .HasColumnName("id_detalle")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.IdPlantilla)
                .HasColumnName("id_plantilla")
                .IsRequired();

            entity.Property(e => e.OrdenActividad)
                .HasColumnName("orden_actividad")
                .IsRequired();

            entity.Property(e => e.NombreActividad)
                .HasColumnName("nombre_actividad")
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.TipoActividad)
                .HasColumnName("tipo_actividad")
                .HasMaxLength(50)
                .HasDefaultValue("Evaluación");

            entity.Property(e => e.PonderacionActividad)
                .HasColumnName("ponderacion_actividad")
                .HasPrecision(5, 2)
                .IsRequired();

            entity.Property(e => e.IncluirAutoevaluacion)
                .HasColumnName("incluir_autoevaluacion")
                .HasDefaultValue(false);

            entity.Property(e => e.IncluirCoevaluacion)
                .HasColumnName("incluir_coevaluacion")
                .HasDefaultValue(false);

            entity.Property(e => e.PonderacionAutoevaluacion)
                .HasColumnName("ponderacion_autoevaluacion")
                .HasPrecision(5, 2);

            entity.Property(e => e.PonderacionCoevaluacion)
                .HasColumnName("ponderacion_coevaluacion")
                .HasPrecision(5, 2);

            entity.Property(e => e.EsModulo)
                .HasColumnName("es_modulo")
                .HasDefaultValue(false);

            entity.Property(e => e.NumeroOrden)
                .HasColumnName("numero_orden")
                .HasDefaultValue(0);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.IdPlantilla)
                .HasDatabaseName("idx_detalle_plantilla");

            entity.HasIndex(e => new { e.IdPlantilla, e.OrdenActividad })
                .HasDatabaseName("idx_plantilla_orden")
                .IsUnique();

            entity.HasOne(e => e.Plantilla)
                .WithMany(p => p.DetallesActividades)
                .HasForeignKey(e => e.IdPlantilla)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============================================================
        // CONFIGURACIÓN: SubActividadPlantillaDetalle
        // ============================================================
        modelBuilder.Entity<SubActividadPlantillaDetalle>(entity =>
        {
            entity.ToTable("sub_actividad_plantilla_detalle");
            entity.HasKey(e => e.IdSubDetalle);

            entity.Property(e => e.IdSubDetalle)
                .HasColumnName("id_sub_detalle")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.IdDetalleActividad)
                .HasColumnName("id_detalle_actividad")
                .IsRequired();

            entity.Property(e => e.OrdenSub)
                .HasColumnName("orden_sub")
                .IsRequired();

            entity.Property(e => e.NombreSubActividad)
                .HasColumnName("nombre_sub_actividad")
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.PonderacionSub)
                .HasColumnName("ponderacion_sub")
                .HasPrecision(5, 2)
                .IsRequired();

            entity.Property(e => e.TipoSubActividad)
                .HasColumnName("tipo_sub_actividad")
                .HasMaxLength(50)
                .HasDefaultValue("Subactividad");

            entity.Property(e => e.EsVertical)
                .HasColumnName("es_vertical")
                .HasDefaultValue(false);

            entity.Property(e => e.NumeroOrden)
                .HasColumnName("numero_orden")
                .HasDefaultValue(0);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.IdDetalleActividad)
                .HasDatabaseName("idx_sub_detalle_actividad");

            entity.HasIndex(e => new { e.IdDetalleActividad, e.OrdenSub })
                .HasDatabaseName("idx_actividad_orden_sub")
                .IsUnique();

            entity.HasIndex(e => e.TipoSubActividad)
                .HasDatabaseName("idx_sub_plantilla_tipo");

            entity.HasOne(e => e.DetalleActividad)
                .WithMany(d => d.DetallesSubActividades)
                .HasForeignKey(e => e.IdDetalleActividad)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============================================================
        // CONFIGURACIÓN: ResultadoPeriodo - nuevos campos
        // ============================================================
        modelBuilder.Entity<ResultadoPeriodo>(entity =>
        {
            entity.Property(e => e.IdMateria)
                .HasColumnName("id_materia")
                .IsRequired(false);

            entity.Property(e => e.IdEspecialidad)
                .HasColumnName("id_especialidad")
                .IsRequired(false);

            entity.Property(e => e.AnioLectivo)
                .HasColumnName("anio_lectivo")
                .IsRequired(false);

            entity.Property(e => e.NotaAcumulada)
                .HasColumnName("nota_acumulada")
                .HasPrecision(5, 2);

            entity.Property(e => e.NotaRecuperacion)
                .HasColumnName("nota_recuperacion")
                .HasPrecision(5, 2);

            entity.Property(e => e.ObservacionRecuperacion)
                .HasColumnName("observacion_recuperacion")
                .HasColumnType("text");

            entity.Property(e => e.NotaFinalAnual)
                .HasColumnName("nota_final_anual")
                .HasPrecision(5, 2);

            entity.Property(e => e.NotaRecuperacionAnual)
                .HasColumnName("nota_recuperacion_anual")
                .HasPrecision(5, 2);

            entity.Property(e => e.ObservacionRecuperacionAnual)
                .HasColumnName("observacion_recuperacion_anual")
                .HasColumnType("text");

            entity.Property(e => e.NotaRecuperacionModulo)
                .HasColumnName("nota_recuperacion_modulo")
                .HasPrecision(5, 2);

            entity.Property(e => e.ObservacionRecuperacionModulo)
                .HasColumnName("observacion_recuperacion_modulo")
                .HasColumnType("text");

            entity.HasOne(e => e.Especialidad)
                .WithMany()
                .HasForeignKey(e => e.IdEspecialidad)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.IdEspecialidad)
                .HasDatabaseName("idx_resultados_especialidad");

            entity.HasIndex(e => new { e.IdClase, e.IdEspecialidad, e.AnioLectivo })
                .HasDatabaseName("idx_resultados_clase_especialidad_anio");
        });

        // ============================================================
        // CONFIGURACIÓN: Actividad - nuevos campos
        // ============================================================
        modelBuilder.Entity<Actividad>(entity =>
        {
            entity.Property(e => e.IdMateria)
                .HasColumnName("id_materia")
                .IsRequired(false);

            entity.Property(e => e.IdEspecialidad)
                .HasColumnName("id_especialidad")
                .IsRequired(false);

            entity.Property(e => e.Ponderacion)
                .HasColumnName("ponderacion")
                .HasPrecision(5, 2);

            entity.Property(e => e.IncluirAutoevaluacion)
                .HasColumnName("incluir_autoevaluacion")
                .HasDefaultValue(false);

            entity.Property(e => e.IncluirCoevaluacion)
                .HasColumnName("incluir_coevaluacion")
                .HasDefaultValue(false);

            entity.Property(e => e.PonderacionAutoevaluacion)
                .HasColumnName("ponderacion_autoevaluacion")
                .HasPrecision(5, 2)
                .HasDefaultValue(0);

            entity.Property(e => e.PonderacionCoevaluacion)
                .HasColumnName("ponderacion_coevaluacion")
                .HasPrecision(5, 2)
                .HasDefaultValue(0);

            entity.Property(e => e.Observaciones)
                .HasColumnName("observaciones")
                .HasColumnType("text");

            entity.Property(e => e.EsModulo)
                .HasColumnName("es_modulo")
                .HasDefaultValue(false);

            entity.Property(e => e.NumeroOrden)
                .HasColumnName("numero_orden")
                .HasDefaultValue(0);

            entity.HasOne(e => e.Especialidad)
                .WithMany()
                .HasForeignKey(e => e.IdEspecialidad)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.IdEspecialidad)
                .HasDatabaseName("idx_actividades_especialidad");

            entity.HasIndex(e => e.EsModulo)
                .HasDatabaseName("idx_actividades_es_modulo");

            entity.HasIndex(e => new { e.IdClase, e.IdEspecialidad, e.Estado })
                .HasDatabaseName("idx_actividades_clase_especialidad");

            entity.HasOne(e => e.PeriodoAcademico)
                .WithMany()
                .HasForeignKey(e => e.IdPeriodo)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ============================================================
        // CONFIGURACIÓN: SubActividad - nuevos campos
        // ============================================================
        modelBuilder.Entity<SubActividad>(entity =>
        {
            entity.Property(e => e.TipoSubActividad)
                .HasColumnName("tipo_sub_actividad")
                .HasMaxLength(50)
                .HasDefaultValue("Subactividad");

            entity.HasIndex(e => e.TipoSubActividad)
                .HasDatabaseName("idx_sub_actividades_tipo");
        });

        // ============================================================
        // CONFIGURACIÓN: CalificacionActividad - nuevos campos
        // ============================================================
        modelBuilder.Entity<CalificacionActividad>(entity =>
        {
            entity.Property(e => e.Nota)
                .HasColumnName("nota")
                .HasPrecision(5, 2)
                .IsRequired(false);

            entity.Property(e => e.NotaCalculada)
                .HasColumnName("nota_calculada")
                .HasPrecision(5, 2);

            entity.Property(e => e.NotaManual)
                .HasColumnName("nota_manual")
                .HasPrecision(5, 2);

            entity.Property(e => e.NotaRecuperacion)
                .HasColumnName("nota_recuperacion")
                .HasPrecision(5, 2);

            entity.Property(e => e.FechaModificacion)
                .HasColumnName("fecha_modificacion");
        });

        // ============================================================
        // CONFIGURACIÓN: CalificacionSubActividad - nuevos campos
        // ============================================================
        modelBuilder.Entity<CalificacionSubActividad>(entity =>
        {
            entity.Property(e => e.NotaRecuperacion)
                .HasColumnName("nota_recuperacion")
                .HasPrecision(5, 2);

            entity.Property(e => e.FechaModificacion)
                .HasColumnName("fecha_modificacion");
        });

        // ============================================================
        // CONFIGURACIÓN: ActividadPlantillaDetalle - nuevos campos
        // ============================================================
        modelBuilder.Entity<ActividadPlantillaDetalle>(entity =>
        {
            entity.Property(e => e.IncluirAutoevaluacion)
                .HasColumnName("incluir_autoevaluacion")
                .HasDefaultValue(false);

            entity.Property(e => e.IncluirCoevaluacion)
                .HasColumnName("incluir_coevaluacion")
                .HasDefaultValue(false);

            entity.Property(e => e.PonderacionAutoevaluacion)
                .HasColumnName("ponderacion_autoevaluacion")
                .HasPrecision(5, 2);

            entity.Property(e => e.PonderacionCoevaluacion)
                .HasColumnName("ponderacion_coevaluacion")
                .HasPrecision(5, 2);
        });

        // ============================================================
        // CONFIGURACIÓN: RecuperacionesModulo
        // ============================================================
        modelBuilder.Entity<RecuperacionesModulo>(entity =>
        {
            entity.ToTable("recuperaciones_modulo");

            entity.Property(e => e.IdRecuperacionModulo)
                .HasColumnName("id_recuperacion_modulo")
                .IsRequired();

            entity.Property(e => e.IdResultadoPeriodo)
                .HasColumnName("id_resultado_periodo")
                .IsRequired();

            entity.Property(e => e.IdActividad)
                .HasColumnName("id_actividad")
                .IsRequired();

            entity.Property(e => e.IdEstudiante)
                .HasColumnName("id_estudiante")
                .IsRequired();

            entity.Property(e => e.IdPeriodo)
                .HasColumnName("id_periodo")
                .IsRequired();

            entity.Property(e => e.IdClase)
                .HasColumnName("id_clase")
                .IsRequired();

            entity.Property(e => e.IdEspecialidad)
                .HasColumnName("id_especialidad")
                .IsRequired(false);

            entity.Property(e => e.NotaRecuperacion)
                .HasColumnName("nota_recuperacion")
                .HasPrecision(5, 2);

            entity.Property(e => e.Observacion)
                .HasColumnName("observacion")
                .HasMaxLength(500);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => new { e.IdResultadoPeriodo, e.IdActividad, e.IdEstudiante })
                .HasDatabaseName("uk_recuperacion_modulo")
                .IsUnique();

            entity.HasIndex(e => e.IdActividad)
                .HasDatabaseName("idx_recuperacion_modulo_actividad");

            entity.HasIndex(e => e.IdEstudiante)
                .HasDatabaseName("idx_recuperacion_modulo_estudiante");

            entity.HasIndex(e => e.IdEspecialidad)
                .HasDatabaseName("idx_recuperacion_modulo_especialidad");

            entity.HasOne(e => e.Actividad)
                .WithMany()
                .HasForeignKey(e => e.IdActividad)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Estudiante)
                .WithMany()
                .HasForeignKey(e => e.IdEstudiante)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Periodo)
                .WithMany()
                .HasForeignKey(e => e.IdPeriodo)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Clase)
                .WithMany()
                .HasForeignKey(e => e.IdClase)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Especialidad)
                .WithMany()
                .HasForeignKey(e => e.IdEspecialidad)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ============================================================
        // CONFIGURACIÓN: CalificacionAuditoria
        // ============================================================
        modelBuilder.Entity<CalificacionAuditoria>(entity =>
        {
            entity.ToTable("calificaciones_auditoria");

            entity.Property(e => e.NotaAnterior)
                .HasColumnName("nota_anterior")
                .HasPrecision(5, 2);

            entity.Property(e => e.NotaNueva)
                .HasColumnName("nota_nueva")
                .HasPrecision(5, 2);

            entity.Property(e => e.NotaRecuperacionAnterior)
                .HasColumnName("nota_recuperacion_anterior")
                .HasPrecision(5, 2);

            entity.Property(e => e.NotaRecuperacionNueva)
                .HasColumnName("nota_recuperacion_nueva")
                .HasPrecision(5, 2);

            entity.Property(e => e.ObservacionCambio)
                .HasColumnName("observacion_cambio")
                .IsRequired();

            entity.Property(e => e.NombreUsuario)
                .HasColumnName("nombre_usuario")
                .HasMaxLength(200);

            entity.Property(e => e.RolUsuario)
                .HasColumnName("rol_usuario")
                .HasMaxLength(100);

            entity.Property(e => e.TipoCambio)
                .HasColumnName("tipo_cambio")
                .HasMaxLength(20);

            entity.Property(e => e.FechaHoraCambio)
                .HasColumnName("fecha_hora_cambio")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.IdCalificacionSub)
                .HasDatabaseName("idx_auditoria_calificacion");

            entity.HasIndex(e => e.IdEstudiante)
                .HasDatabaseName("idx_auditoria_estudiante");

            entity.HasIndex(e => e.IdUsuarioCambio)
                .HasDatabaseName("idx_auditoria_usuario");

            entity.HasIndex(e => e.FechaHoraCambio)
                .HasDatabaseName("idx_auditoria_fecha");

            entity.HasOne(e => e.CalificacionSubActividad)
                .WithMany()
                .HasForeignKey(e => e.IdCalificacionSub)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Estudiante)
                .WithMany()
                .HasForeignKey(e => e.IdEstudiante)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Usuario)
                .WithMany()
                .HasForeignKey(e => e.IdUsuarioCambio)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============================================================
        // CONFIGURACIÓN: TokenActivacion
        // ============================================================
        modelBuilder.Entity<TokenActivacion>(entity =>
        {
            entity.HasIndex(t => t.Token)
                .HasDatabaseName("idx_token");

            entity.HasIndex(t => t.UsuarioId)
                .HasDatabaseName("idx_tokens_usuario");

            entity.HasIndex(t => t.FechaExpiracion)
                .HasDatabaseName("idx_tokens_expiracion");

            entity.HasOne(t => t.Usuario)
                .WithMany()
                .HasForeignKey(t => t.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ============================================================
        // CONFIGURACIÓN: ReporteDatoEstudiante
        // ============================================================
        modelBuilder.Entity<ReporteDatoEstudiante>(entity =>
        {
            entity.HasIndex(r => r.EstudianteId)
                .HasDatabaseName("idx_reporte_estudiante");

            entity.HasIndex(r => r.Estado)
                .HasDatabaseName("idx_reporte_estado");

            entity.HasIndex(r => r.FechaCreacion)
                .HasDatabaseName("idx_reporte_fecha");

            entity.HasOne(r => r.Estudiante)
                .WithMany()
                .HasForeignKey(r => r.EstudianteId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.ResueltoPorUsuario)
                .WithMany()
                .HasForeignKey(r => r.ResueltoPor)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}