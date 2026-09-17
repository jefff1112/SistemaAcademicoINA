# Implementación: Activación de Cuentas por Correo (Estudiantes de Nuevo Ingreso)

> Documento técnico de la funcionalidad implementada en el Sistema Académico INA.
> Incluye: qué se creó, qué hace cada archivo, cómo funciona el flujo y cómo probarlo.

---

## 1. Resumen

Al **aceptar la matrícula** de un aspirante aprobado, el sistema ahora:

1. Crea el **estudiante**, su **inscripción** y su **usuario de acceso** (sin contraseña, `estado = inactivo`).
2. Genera un **token JWT de un solo uso** con expiración de **48 horas** y lo guarda en `tokens_activacion`.
3. Envía (o deja pendiente) un **correo de bienvenida** con un enlace a `/activar-cuenta?token=XXXX`.
4. El estudiante crea su contraseña en la página pública de activación, pudiendo **reportar datos incorrectos** (uno o varios a la vez).
5. **Dirección y Registro Académico** gestionan los reportes (aprobar/rechazar/en revisión) y las activaciones pendientes (reenviar / espera / presencial).

---

## 2. Flujo general

```
[Aceptar matrícula] ──► Crea estudiante + inscripción + usuario (sin contraseña)
         │
         ├─ (auto) ► genera token 48h ► guarda en tokens_activacion ► encola correo de bienvenida
         └─ (manual) ► usuario queda "PendienteEnvioManual" (sin token hasta reenviar)

[Estudiante abre /activar-cuenta?token=XXXX]
         ├─ token inválido  ► "Enlace inválido"
         ├─ token usado     ► "Este enlace ya fue utilizado"
         ├─ token expirado  ► "El enlace ha expirado" + "Solicitar nuevo enlace" (notifica a roles)
         └─ token válido    ► muestra datos del estudiante
                 ├─ crea contraseña (mín 8, 1 mayúscula, 1 número) ► activa cuenta (token se invalida)
                 └─ reporta datos incorrectos ► N reportes ► notifica a Director + Registro Académico

[Panel Dirección/Registro]
         ├─ Reportes de Datos: aprobar (corrige el dato) / rechazar (motivo) / en revisión
         └─ Activaciones Pendientes: reenviar correo / marcar en espera / activar presencial
```

---

## 3. Base de datos (migración)

Script: **`backend/migrations/18_activacion_cuentas_reportes.sql`**

### Cambios sobre `usuarios`
```sql
ALTER TABLE usuarios MODIFY contrasena varchar(100) NULL;          -- cuenta sin contraseña hasta activar
ALTER TABLE usuarios ADD COLUMN estado_activacion varchar(40) NULL; -- PendienteActivacion / PendienteEnvioManual / EsperaActivacion / Activo
```

### Nueva tabla `tokens_activacion`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INT AUTO_INCREMENT PK | |
| `usuario_id` | INT FK → usuarios.id_usuario | Usuario (estudiante) |
| `token` | VARCHAR(500) | JWT de un solo uso (indexado) |
| `fecha_creacion` | DATETIME | |
| `fecha_expiracion` | DATETIME | 48 h después de creación |
| `usado` | TINYINT(1) | 0 = vigente, 1 = usado/invalidado |
| `created_at` | TIMESTAMP | |

Índices: `token`, `usuario_id`, `fecha_expiracion`.

### Nueva tabla `reportes_datos_estudiante`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INT AUTO_INCREMENT PK | |
| `estudiante_id` | INT FK → estudiantes.id_estudiante | |
| `campo` | VARCHAR(100) | Campo reportado |
| `valor_actual` | TEXT NULL | Valor que tenía el dato (auto) |
| `valor_propuesto` | TEXT | Valor corregido propuesto |
| `comentario` | TEXT NULL | Comentario del estudiante |
| `estado` | ENUM(Pendiente,EnRevision,Aprobado,Rechazado) | |
| `motivo_rechazo` | TEXT NULL | Obligatorio al rechazar |
| `resuelto_por` | INT NULL FK → usuarios.id_usuario | Quién resolvió |
| `fecha_creacion` | DATETIME | |
| `fecha_resolucion` | DATETIME NULL | |

Índices: `estudiante_id`, `estado`, `fecha_creacion`.

---

## 4. Backend — archivos nuevos

| Archivo | Qué hace |
|---|---|
| `Models/Entities/TokenActivacion.cs` | Entidad EF de `tokens_activacion` |
| `Models/Entities/ReporteDatoEstudiante.cs` | Entidad EF de `reportes_datos_estudiante` |
| `Models/DTOs/ActivacionCuentaDTOs.cs` | `ActivarCuentaRequest` (token + contraseña con validación de complejidad) |
| `Models/DTOs/ActivacionesDTOs.cs` | `MarcarEsperaRequest`, `ActivarPresencialRequest`, `SolicitarNuevoEnlaceRequest` |
| `Models/DTOs/ReportesDatosDTOs.cs` | `CrearReportesRequest`, `ReporteDatoDto`, `RechazarReporteRequest` |
| `Services/IEmailService.cs` | Interfaz del servicio de correo (`EnviarAsync` / `EncolarAsync`) |
| `Services/SmtpEmailService.cs` | Envío SMTP real con **MailKit** (STARTTLS 587) |
| `Services/EmailMessage.cs` | Modelo de mensaje (`Destinatario`, `Asunto`, `CuerpoHtml`) |
| `Services/EmailQueue.cs` | Cola en memoria con `Channel<T>` |
| `Services/EmailBackgroundService.cs` | `IHostedService` que consume la cola y **audita éxito/fallo** de cada envío |
| `Services/PlantillasCorreoService.cs` | Carga las plantillas HTML de `Templates/Emails` y reemplaza `{{placeholders}}` |
| `Services/RateLimiterService.cs` | Límite en memoria por IP (10 req/min en `validar-token`) |
| `Controllers/ReportesDatosController.cs` | `/api/reportes-datos`: crear (público con token), listar, aprobar, rechazar, en revisión |
| `Controllers/ActivacionesController.cs` | `/api/activaciones`: pendientes, reenviar, espera, activar presencial, solicitar enlace |
| `Templates/Emails/bienvenida_activacion.html` | Correo de bienvenida (matrícula auto) |
| `Templates/Emails/nuevo_enlace_activacion.html` | Correo de reenvío de enlace |
| `Templates/Emails/reporte_aprobado.html` | Notificación al estudiante: reporte aprobado |
| `Templates/Emails/reporte_rechazado.html` | Notificación al estudiante: reporte rechazado |
| `migrations/18_activacion_cuentas_reportes.sql` | Migración de BD (tablas + columnas) |

---

## 5. Backend — archivos modificados

| Archivo | Cambio |
|---|---|
| `Program.cs` | Registro de `EmailQueue`, `IEmailService/SmtpEmailService`, `EmailBackgroundService`, `PlantillasCorreoService`, `RateLimiterService` |
| `Models/Entities/Usuario.cs` | `Contrasena` ahora nullable + nueva propiedad `EstadoActivacion` |
| `Data/ApplicationDbContext.cs` | `DbSet` de `TokenActivacion` y `ReporteDatoEstudiante` + índices/relaciones en `OnModelCreating` |
| `Helpers/JwtHelper.cs` | Nuevo `GenerarTokenActivacion(idUsuario, email)` (JWT 48 h, propósito `activacionCuenta`) |
| `Controllers/AuthController.cs` | `GET /validar-token`, `POST /activar-cuenta`, rate limiting y guard de contraseña nula en login |
| `Controllers/AspirantesController.cs` | `MatricularAspirante` crea usuario pendiente + token + correo auto/manual; `UpdateAspirante` **sincroniza correo/nombres** a estudiante y usuario |
| `Controllers/EstudiantesController.cs` | `PutEstudiante` **sincroniza correo/nombres** a usuario y aspirante |
| `Controllers/NotificacionesController.cs` | Lee la sección `Smtp` (en vez de `EmailSettings`) |
| `SistemaAcademicoINA.csproj` | Agregado paquete **MailKit 4.18.0** |

### Sincronización de datos personales
Al editar el correo/nombres en **Gestionar Aspirantes** o **Gestionar Estudiantes**, se propaga automáticamente a los 3 registros: `aspirantes`, `estudiantes` y `usuarios`. Así los paneles (Activaciones Pendientes, Login, Reportes) siempre muestran el dato vigente.

---

## 6. Frontend — archivos nuevos

| Archivo | Qué hace |
|---|---|
| `src/components/Auth/ActivarCuenta.jsx` | Página pública `/activar-cuenta` (valida token, muestra datos, crea contraseña, modal multi-reporte) |
| `src/components/RegistroAcademico/ReportesDatos.jsx` | Panel de reportes (filtros, aprobar/rechazar/en revisión) |
| `src/components/RegistroAcademico/ActivacionesPendientes.jsx` | Panel de activaciones (reenviar/espera/presencial) |
| `src/services/reportesService.js` | API de reportes |
| `src/services/activacionesService.js` | API de activaciones |

---

## 7. Frontend — archivos modificados

| Archivo | Cambio |
|---|---|
| `src/services/authService.js` | +`validarToken`, +`activarCuenta`, +`solicitarNuevoEnlace` |
| `src/App.js` | Rutas públicas `/activar-cuenta` y protegidas `/direccion|registro/reportes-datos`, `/direccion|registro/activaciones-pendientes` |
| `src/components/Layout/DashboardLayout.jsx` | Items de menú "Reportes de Datos" y "Activaciones Pendientes" (Director y Registro) |
| `src/components/RegistroAcademico/GestionMatriculas.jsx` | Checkbox "Enviar correo de activación automáticamente" + envío de `enviarCorreo` |

---

## 8. Configuración

`appsettings.example.json` (versionado) / `appsettings.json` (local, NO se sube a Git):

```json
{
  "FrontendUrl": "http://localhost:3000",
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "User": "sistemaacademicoina@gmail.com",
    "Password": "APP_PASSWORD_DE_GMAIL",
    "From": "sistemaacademicoina@gmail.com",
    "FromName": "INA - Sistema Académico",
    "EnableSsl": true
  }
}
```

> **Importante**: `From` debe ser igual a `User` (Gmail rechaza remitentes que no sean la cuenta autenticada). El `Password` es una **App Password** de Gmail (requiere 2FA activado), no la contraseña normal.

---

## 9. Seguridad

- **Token de un solo uso**: se marca `usado=true` al activar; el enlace no se reutiliza.
- **Expiración 48 h** y **rate limiting** (10 req/min por IP) en `validar-token`.
- **Contraseña nunca se envía por correo**; solo el enlace.
- Contraseñas con **BCrypt**; validación mínima: 8 caracteres, 1 mayúscula, 1 número.
- Cuentas pendientes (`estado=false`) **no pueden iniciar sesión**.
- El `POST /api/reportes-datos` identifica al estudiante desde el token (no se fía de un `estudianteId` del cliente).
- Auditoría de todas las acciones (matrícula, activación, reenvío, espera, presencial, reportes).

---

## 10. Cómo probar el flujo completo

1. **Aplicar la migración** (si no se ha hecho):
   ```bash
   mysql -u root sistema_academico < backend/migrations/18_activacion_cuentas_reportes.sql
   ```
2. Configurar `Smtp` en `appsettings.json` con una App Password válida.
3. **Registro Académico** → Matrículas → matricular un aspirante (marcado "Enviar correo automáticamente").
4. Abrir el enlace del correo → `http://localhost:3000/activar-cuenta?token=XXXX`.
5. Crear la contraseña y/o reportar datos incorrectos.
6. **Dirección/Registro** → "Reportes de Datos" (aprobar/rechazar) y "Activaciones Pendientes" (reenviar/espera/presencial).

---

## 11. Endpoints de la API

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/auth/validar-token?token=` | Público (rate-limited) |
| POST | `/api/auth/activar-cuenta` | Público (token) |
| POST | `/api/reportes-datos` | Público (token) |
| GET | `/api/reportes-datos` | Director, Registro Académico |
| PUT | `/api/reportes-datos/{id}/aprobar` | Director, Registro Académico |
| PUT | `/api/reportes-datos/{id}/rechazar` | Director, Registro Académico |
| PUT | `/api/reportes-datos/{id}/en-revision` | Director, Registro Académico |
| GET | `/api/activaciones/pendientes` | Director, Registro Académico |
| POST | `/api/activaciones/{id}/reenviar` | Director, Registro Académico |
| POST | `/api/activaciones/{id}/marcar-espera` | Director, Registro Académico |
| POST | `/api/activaciones/{id}/activar-presencial` | Director, Registro Académico |
| POST | `/api/activaciones/solicitar-nuevo-enlace` | Público |