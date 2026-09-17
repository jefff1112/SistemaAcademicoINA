-- ============================================================
-- 18: Activación de cuentas por correo + reportes de datos incorrectos
-- Database: sistema_academico
-- Cambios:
--   1. usuarios.contrasena  -> NULLable (cuenta sin contraseña hasta activación)
--   2. usuarios.estado_activacion -> nueva columna de estado del flujo
--   3. tokens_activacion          -> nueva tabla (token de un solo uso, 48h)
--   4. reportes_datos_estudiante  -> nueva tabla (reportes de datos)
-- ============================================================

-- ---------- 1. Permitir contraseña nula (PasswordHash = NULL) ----------
ALTER TABLE `usuarios`
    MODIFY `contrasena` varchar(100) NULL;

-- ---------- 2. Estado del flujo de activación del usuario ----------
-- Valores esperados: PendienteActivacion | PendienteEnvioManual | EsperaActivacion | Activo
-- NULL = usuarios heredados/existentes (se tratan como activos).
ALTER TABLE `usuarios`
    ADD COLUMN `estado_activacion` varchar(40) NULL AFTER `estado`;

-- ---------- 3. Tokens de activación (un solo uso, expiración 48h) ----------
CREATE TABLE `tokens_activacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `token` varchar(500) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_token` (`token`),
  KEY `idx_tokens_usuario` (`usuario_id`),
  KEY `idx_tokens_expiracion` (`fecha_expiracion`),
  CONSTRAINT `fk_tokens_usuario` FOREIGN KEY (`usuario_id`)
      REFERENCES `usuarios` (`id_usuario`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- ---------- 4. Reportes de datos incorrectos del estudiante ----------
CREATE TABLE `reportes_datos_estudiante` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estudiante_id` int NOT NULL,
  `campo` varchar(100) NOT NULL,
  `valor_actual` text NULL,
  `valor_propuesto` text NOT NULL,
  `comentario` text NULL,
  `estado` enum('Pendiente','EnRevision','Aprobado','Rechazado') NOT NULL DEFAULT 'Pendiente',
  `motivo_rechazo` text NULL,
  `resuelto_por` int NULL,
  `fecha_creacion` datetime NOT NULL,
  `fecha_resolucion` datetime NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reporte_estudiante` (`estudiante_id`),
  KEY `idx_reporte_estado` (`estado`),
  KEY `idx_reporte_fecha` (`fecha_creacion`),
  CONSTRAINT `fk_reporte_estudiante` FOREIGN KEY (`estudiante_id`)
      REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE,
  CONSTRAINT `fk_reporte_usuario` FOREIGN KEY (`resuelto_por`)
      REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;