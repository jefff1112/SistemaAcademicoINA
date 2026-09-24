-- ===================================================
-- RESPALDO - Sistema Academico INA
-- Fecha: 2026-09-24 23:20:52
-- ===================================================

DROP TABLE IF EXISTS `__efmigrationshistory`;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) NOT NULL,
  `ProductVersion` varchar(32) NOT NULL
);
-- 0 fila(s) en `__efmigrationshistory`

DROP TABLE IF EXISTS `actividad_plantilla_detalle`;
CREATE TABLE `actividad_plantilla_detalle` (
  `id_detalle` int AUTO_INCREMENT,
  `id_plantilla` int NOT NULL,
  `orden_actividad` int NOT NULL,
  `nombre_actividad` varchar(200) NOT NULL,
  `tipo_actividad` varchar(50) DEFAULT Evaluación,
  `ponderacion_actividad` decimal(5,2) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `tipo_sub_actividad` enum('Subactividad','Autoevaluacion','Coevaluacion','ActividadModulo') NOT NULL DEFAULT Subactividad,
  `incluir_autoevaluacion` tinyint(1) DEFAULT 0,
  `incluir_coevaluacion` tinyint(1) DEFAULT 0,
  `ponderacion_autoevaluacion` decimal(5,2) DEFAULT 0.00,
  `ponderacion_coevaluacion` decimal(5,2) DEFAULT 0.00,
  `es_modulo` tinyint(1) DEFAULT 0,
  `numero_orden` int DEFAULT 0
,
  PRIMARY KEY (`id_detalle`)
);
INSERT INTO `actividad_plantilla_detalle` VALUES (1, 1, 1, 'ACTIVIDAD 1', 'Evaluación', 35.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0, 0.00, 0.00, 0, 0);
INSERT INTO `actividad_plantilla_detalle` VALUES (2, 1, 2, 'ACTIVIDAD 2', 'Evaluación', 35.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0, 0.00, 0.00, 0, 0);
INSERT INTO `actividad_plantilla_detalle` VALUES (3, 1, 3, 'ACTIVIDAD 3', 'Evaluación', 30.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0, 0.00, 0.00, 0, 0);
INSERT INTO `actividad_plantilla_detalle` VALUES (4, 2, 1, 'ACTIVIDAD 1', 'Evaluación', 35.00, '2026-08-25 19:10:10', 'Subactividad', 0, 0, 0.00, 0.00, 0, 0);
INSERT INTO `actividad_plantilla_detalle` VALUES (5, 2, 2, 'ACTIVIDAD 2', 'Evaluación', 35.00, '2026-08-25 19:10:11', 'Subactividad', 0, 0, 0.00, 0.00, 0, 0);
INSERT INTO `actividad_plantilla_detalle` VALUES (6, 2, 3, 'ACTIVIDAD 3', 'Evaluación', 30.00, '2026-08-25 19:10:11', 'Subactividad', 0, 0, 0.00, 0.00, 0, 0);
-- 6 fila(s) en `actividad_plantilla_detalle`

DROP TABLE IF EXISTS `actividad_plantillas`;
CREATE TABLE `actividad_plantillas` (
  `id_plantilla` int AUTO_INCREMENT,
  `nombre_plantilla` varchar(100) NOT NULL,
  `descripcion` text,
  `tipo_materia` enum('Basica','Especialidad','Todas') DEFAULT Todas,
  `es_predeterminada` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `estado` tinyint(1) DEFAULT 1
,
  PRIMARY KEY (`id_plantilla`)
);
INSERT INTO `actividad_plantillas` VALUES (1, 'CUADRO AUXILIAR ESTÁNDAR INA', 'Estructura oficial: 3 actividades (35/35/30) con sub-actividades ponderadas', 'Todas', 1, '2026-08-25 19:05:49', '2026-08-25 19:05:49', 1);
INSERT INTO `actividad_plantillas` VALUES (2, 'CUADRO AUXILIAR ESTÁNDAR INA', 'Estructura oficial: 3 actividades (35/35/30) con sub-actividades ponderadas', 'Todas', 0, '2026-08-25 19:10:10', '2026-09-05 10:16:12', 1);
-- 2 fila(s) en `actividad_plantillas`

DROP TABLE IF EXISTS `actividad_usuarios`;
CREATE TABLE `actividad_usuarios` (
  `id_actividad` int AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `accion` varchar(50) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `detalle` text,
  `ip` varchar(50),
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_actividad`)
);
-- 0 fila(s) en `actividad_usuarios`

DROP TABLE IF EXISTS `actividades`;
CREATE TABLE `actividades` (
  `id_actividad` int AUTO_INCREMENT,
  `id_materia` int,
  `id_especialidad` int,
  `id_clase` int NOT NULL,
  `id_docente` int NOT NULL,
  `nombre_actividad` varchar(150) NOT NULL,
  `tipo_actividad` enum('Tarea','Examen','Proyecto','Participacion','Otro','Actividad','Modulo','Evaluación') NOT NULL,
  `ponderacion` decimal(5,2) NOT NULL,
  `fecha_publicacion` date NOT NULL,
  `fecha_limite` date NOT NULL,
  `descripcion` text,
  `especificacion` text,
  `estado` enum('Pendiente','Activo','Cerrado') DEFAULT Activo,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `incluir_autoevaluacion` tinyint(1) DEFAULT 0,
  `incluir_coevaluacion` tinyint(1) DEFAULT 0,
  `ponderacion_autoevaluacion` decimal(5,2) DEFAULT 0.00,
  `ponderacion_coevaluacion` decimal(5,2) DEFAULT 0.00,
  `observaciones` text,
  `es_modulo` tinyint(1) DEFAULT 0,
  `numero_orden` int DEFAULT 0,
  `id_periodo` int,
  `orden` int DEFAULT 0,
  `es_predeterminada` tinyint(1) DEFAULT 0,
  `id_modulo` int
,
  PRIMARY KEY (`id_actividad`)
);
INSERT INTO `actividades` VALUES (21, 2, NULL, 1, 1, 'prueba', 'Tarea', 30.00, '2026-08-24 00:00:00', '2026-08-31 00:00:00', '', '', 'Cerrado', '2026-08-23 20:03:00', '2026-09-06 17:00:09', 0, 0, 0.00, 0.00, NULL, 0, 0, NULL, 0, 0, NULL);
INSERT INTO `actividades` VALUES (22, 2, NULL, 2, 2, 'Actividad 1', 'Tarea', 35.00, '2026-08-23 00:00:00', '2026-10-22 00:00:00', NULL, NULL, 'Activo', '2026-08-23 20:28:23', '2026-09-07 00:02:38', 0, 0, 0.00, 0.00, NULL, 0, 0, NULL, 0, 0, NULL);
INSERT INTO `actividades` VALUES (23, 2, NULL, 2, 2, 'Actividad 2', 'Tarea', 35.00, '2026-08-23 00:00:00', '2026-10-22 00:00:00', NULL, NULL, 'Activo', '2026-08-23 20:28:23', '2026-09-07 00:02:47', 0, 0, 0.00, 0.00, NULL, 0, 0, NULL, 0, 0, NULL);
INSERT INTO `actividades` VALUES (24, 2, NULL, 2, 2, 'Actividad 3', 'Tarea', 30.00, '2026-08-23 00:00:00', '2026-10-22 00:00:00', NULL, NULL, 'Activo', '2026-08-23 20:28:23', '2026-09-07 00:02:55', 0, 0, 0.00, 0.00, NULL, 0, 0, NULL, 0, 0, NULL);
INSERT INTO `actividades` VALUES (26, 2, NULL, 1, 1, 'ACTIVIDAD 1', 'Evaluación', 12.00, '2026-09-06 00:00:00', '2026-11-05 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-06 17:00:21', '2026-09-16 23:14:18', 0, 0, 0.00, 0.00, NULL, 0, 1, NULL, 0, 0, NULL);
INSERT INTO `actividades` VALUES (27, 2, NULL, 1, 1, 'ACTIVIDAD 2', 'Evaluación', 11.00, '2026-09-06 00:00:00', '2026-11-05 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-06 17:00:21', '2026-09-16 23:14:18', 0, 0, 0.00, 0.00, NULL, 0, 2, NULL, 0, 0, NULL);
INSERT INTO `actividades` VALUES (28, 2, NULL, 1, 1, 'ACTIVIDAD 3', 'Evaluación', 11.00, '2026-09-06 00:00:00', '2026-11-05 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-06 17:00:21', '2026-09-16 23:14:18', 0, 0, 0.00, 0.00, NULL, 0, 3, NULL, 0, 0, NULL);
INSERT INTO `actividades` VALUES (29, 2, NULL, 1, 1, 'ACTIVIDAD 1', 'Evaluación', 34.00, '2026-09-07 00:00:00', '2026-11-06 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-07 00:09:05', '2026-09-21 22:53:52', 0, 0, 0.00, 0.00, NULL, 0, 1, 1, 1, 0, NULL);
INSERT INTO `actividades` VALUES (30, 2, NULL, 1, 1, 'ACTIVIDAD 2', 'Evaluación', 33.00, '2026-09-07 00:00:00', '2026-11-06 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-07 00:09:05', '2026-09-21 22:53:52', 0, 0, 0.00, 0.00, NULL, 0, 2, 1, 2, 0, NULL);
INSERT INTO `actividades` VALUES (31, 2, NULL, 1, 1, 'ACTIVIDAD 3', 'Evaluación', 33.00, '2026-09-07 00:00:00', '2026-11-06 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-07 00:09:05', '2026-09-21 22:53:40', 0, 0, 0.00, 0.00, NULL, 0, 3, 1, 3, 0, NULL);
INSERT INTO `actividades` VALUES (32, 1, NULL, 2, 1, 'ACTIVIDAD 1', 'Evaluación', 35.00, '2026-09-07 00:00:00', '2026-11-06 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-07 22:56:23', NULL, 0, 0, 0.00, 0.00, NULL, 0, 1, 1, 0, 0, NULL);
INSERT INTO `actividades` VALUES (33, 1, NULL, 2, 1, 'ACTIVIDAD 2', 'Evaluación', 35.00, '2026-09-07 00:00:00', '2026-11-06 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-07 22:56:23', NULL, 0, 0, 0.00, 0.00, NULL, 0, 2, 1, 0, 0, NULL);
INSERT INTO `actividades` VALUES (34, 1, NULL, 2, 1, 'ACTIVIDAD 3', 'Evaluación', 30.00, '2026-09-07 00:00:00', '2026-11-06 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-07 22:56:23', NULL, 0, 0, 0.00, 0.00, NULL, 0, 3, 1, 0, 0, NULL);
INSERT INTO `actividades` VALUES (38, NULL, 1, 3, 1, 'prueba', 'Modulo', 12.50, '2026-09-09 00:00:00', '2027-09-09 00:00:00', NULL, NULL, 'Activo', '2026-09-09 09:26:03', NULL, 0, 0, 0.00, 0.00, NULL, 1, 1, NULL, 0, 0, 1);
INSERT INTO `actividades` VALUES (39, NULL, 1, 3, 1, 'prueba', 'Modulo', 12.50, '2026-09-09 00:00:00', '2027-09-09 00:00:00', NULL, NULL, 'Activo', '2026-09-09 09:26:03', NULL, 0, 0, 0.00, 0.00, NULL, 1, 2, NULL, 0, 0, 2);
INSERT INTO `actividades` VALUES (40, NULL, 1, 3, 1, 'prueba', 'Modulo', 12.50, '2026-09-09 00:00:00', '2027-09-09 00:00:00', NULL, NULL, 'Activo', '2026-09-09 09:26:03', NULL, 0, 0, 0.00, 0.00, NULL, 1, 3, NULL, 0, 0, 3);
INSERT INTO `actividades` VALUES (41, NULL, 1, 3, 1, 'prueba', 'Modulo', 12.50, '2026-09-09 00:00:00', '2027-09-09 00:00:00', NULL, NULL, 'Activo', '2026-09-09 09:26:03', NULL, 0, 0, 0.00, 0.00, NULL, 1, 4, NULL, 0, 0, 4);
INSERT INTO `actividades` VALUES (42, NULL, 1, 3, 1, 'prueba', 'Modulo', 12.50, '2026-09-09 00:00:00', '2027-09-09 00:00:00', NULL, NULL, 'Activo', '2026-09-09 09:26:03', NULL, 0, 0, 0.00, 0.00, NULL, 1, 5, NULL, 0, 0, 5);
INSERT INTO `actividades` VALUES (43, NULL, 1, 3, 1, 'prueba', 'Modulo', 12.50, '2026-09-09 00:00:00', '2027-09-09 00:00:00', NULL, NULL, 'Activo', '2026-09-09 09:26:03', NULL, 0, 0, 0.00, 0.00, NULL, 1, 6, NULL, 0, 0, 6);
INSERT INTO `actividades` VALUES (44, NULL, 1, 3, 6, 'prueba', 'Modulo', 12.50, '2026-09-09 00:00:00', '2027-09-09 00:00:00', NULL, NULL, 'Activo', '2026-09-09 09:26:03', NULL, 0, 0, 0.00, 0.00, NULL, 1, 7, NULL, 0, 0, 7);
INSERT INTO `actividades` VALUES (45, NULL, 1, 3, 2, 'prueba', 'Modulo', 12.50, '2026-09-09 00:00:00', '2027-09-09 00:00:00', NULL, NULL, 'Activo', '2026-09-09 09:26:03', NULL, 0, 0, 0.00, 0.00, NULL, 1, 8, NULL, 0, 0, 8);
INSERT INTO `actividades` VALUES (46, 1, NULL, 1, 1, 'ACTIVIDAD 1', 'Evaluación', 11.00, '2026-09-11 00:00:00', '2026-11-10 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-11 10:40:27', '2026-09-16 23:14:18', 0, 0, 0.00, 0.00, NULL, 0, 1, 1, 0, 0, NULL);
INSERT INTO `actividades` VALUES (47, 1, NULL, 1, 1, 'ACTIVIDAD 2', 'Evaluación', 11.00, '2026-09-11 00:00:00', '2026-11-10 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-11 10:40:27', '2026-09-16 23:14:18', 0, 0, 0.00, 0.00, NULL, 0, 2, 1, 0, 0, NULL);
INSERT INTO `actividades` VALUES (48, 1, NULL, 1, 1, 'ACTIVIDAD 3', 'Evaluación', 11.00, '2026-09-11 00:00:00', '2026-11-10 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-11 10:40:27', '2026-09-16 23:14:18', 0, 0, 0.00, 0.00, NULL, 0, 3, 1, 0, 0, NULL);
INSERT INTO `actividades` VALUES (49, 2, NULL, 3, 1, 'ACTIVIDAD 1', 'Evaluación', 35.00, '2026-09-12 00:00:00', '2026-11-11 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-12 16:17:23', NULL, 0, 0, 0.00, 0.00, NULL, 0, 1, 1, 0, 0, NULL);
INSERT INTO `actividades` VALUES (50, 2, NULL, 3, 1, 'ACTIVIDAD 2', 'Evaluación', 35.00, '2026-09-12 00:00:00', '2026-11-11 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-12 16:17:23', NULL, 0, 0, 0.00, 0.00, NULL, 0, 2, 1, 0, 0, NULL);
INSERT INTO `actividades` VALUES (51, 2, NULL, 3, 1, 'ACTIVIDAD 3', 'Evaluación', 30.00, '2026-09-12 00:00:00', '2026-11-11 00:00:00', 'Actividad creada desde plantilla predeterminada INA', NULL, 'Activo', '2026-09-12 16:17:23', NULL, 0, 0, 0.00, 0.00, NULL, 0, 3, 1, 0, 0, NULL);
-- 27 fila(s) en `actividades`

DROP TABLE IF EXISTS `actividades_entregas`;
CREATE TABLE `actividades_entregas` (
  `id_entrega` int AUTO_INCREMENT,
  `id_actividad` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `fecha_entrega` datetime,
  `archivo_entrega` varchar(255),
  `comentario` text,
  `estado_entrega` enum('Pendiente','Entregado','Revisado','Atrasado') DEFAULT Pendiente,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_entrega`)
);
-- 0 fila(s) en `actividades_entregas`

DROP TABLE IF EXISTS `actividades_periodos`;
CREATE TABLE `actividades_periodos` (
  `id_actividad_periodo` int AUTO_INCREMENT,
  `id_actividad` int NOT NULL,
  `id_periodo` int NOT NULL,
  `ponderacion_periodo` decimal(5,2) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_actividad_periodo`)
);
-- 0 fila(s) en `actividades_periodos`

DROP TABLE IF EXISTS `administradores`;
CREATE TABLE `administradores` (
  `id_admin` int NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `nombre_completo` varchar(200),
  `email` varchar(100),
  `id_rol` int
);
INSERT INTO `administradores` VALUES (1, 'admin', '$2a$11$bWtGBM9DWGJHIc9SWheVceDnLjiyPfCW3fFqi8ks.PJDzdiCJ.ymO', 'Administrador del Sistema', 'admin@ina.edu.sv', 1);
-- 1 fila(s) en `administradores`

DROP TABLE IF EXISTS `asignacion_aulas`;
CREATE TABLE `asignacion_aulas` (
  `id_asignacion_aula` int NOT NULL,
  `id_clase` int NOT NULL,
  `id_aula` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `notas` text,
  `asignado_por` varchar(100)
);
-- 0 fila(s) en `asignacion_aulas`

DROP TABLE IF EXISTS `asistencias`;
CREATE TABLE `asistencias` (
  `id_asistencia` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_clase` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_docente` int NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('Presente','Ausente','Tarde','Justificado') NOT NULL DEFAULT Presente,
  `hora_registro` time NOT NULL,
  `minutos_tarde` int DEFAULT 0,
  `justificacion` text,
  `justificado_por` varchar(100),
  `fecha_justificacion` date,
  `observaciones` text
,
  PRIMARY KEY (`id_asistencia`)
);
INSERT INTO `asistencias` VALUES (1, 1, 1, 1, 1, '2026-01-13 00:00:00', 'Presente', '07:02:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (2, 1, 1, 1, 1, '2026-01-14 00:00:00', 'Presente', '07:01:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (3, 1, 1, 1, 1, '2026-01-15 00:00:00', 'Tarde', '07:15:00', 15, NULL, NULL, NULL, 'Llego tarde por trafico');
INSERT INTO `asistencias` VALUES (4, 1, 1, 1, 1, '2026-01-16 00:00:00', 'Presente', '07:00:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (5, 1, 1, 1, 1, '2026-01-20 00:00:00', 'Presente', '07:03:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (6, 1, 1, 1, 1, '2026-01-21 00:00:00', 'Ausente', '08:00:00', 0, NULL, NULL, NULL, 'Cita medica');
INSERT INTO `asistencias` VALUES (7, 1, 1, 1, 1, '2026-01-22 00:00:00', 'Presente', '07:00:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (8, 1, 1, 1, 1, '2026-01-26 00:00:00', 'Tarde', '07:10:00', 10, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (9, 1, 1, 1, 1, '2026-01-27 00:00:00', 'Presente', '07:01:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (10, 1, 1, 1, 1, '2026-01-28 00:00:00', 'Presente', '07:02:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (11, 2, 1, 1, 1, '2026-01-13 00:00:00', 'Presente', '07:00:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (12, 2, 1, 1, 1, '2026-01-14 00:00:00', 'Presente', '07:05:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (13, 2, 1, 1, 1, '2026-01-15 00:00:00', 'Tarde', '07:12:00', 12, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (14, 2, 1, 1, 1, '2026-01-16 00:00:00', 'Presente', '07:00:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (15, 2, 1, 1, 1, '2026-01-20 00:00:00', 'Ausente', '08:10:00', 0, NULL, NULL, NULL, 'Motivo familiar');
INSERT INTO `asistencias` VALUES (16, 2, 1, 1, 1, '2026-01-21 00:00:00', 'Presente', '07:00:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (17, 3, 3, 7, 4, '2026-01-13 00:00:00', 'Presente', '07:01:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (18, 3, 3, 7, 4, '2026-01-14 00:00:00', 'Presente', '07:03:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (19, 3, 3, 7, 4, '2026-01-16 00:00:00', 'Presente', '07:00:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (20, 3, 3, 7, 4, '2026-01-20 00:00:00', 'Presente', '07:02:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (21, 3, 3, 7, 4, '2026-01-22 00:00:00', 'Tarde', '07:20:00', 20, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (22, 3, 3, 7, 4, '2026-01-27 00:00:00', 'Presente', '07:00:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (23, 6, 4, 7, 4, '2026-02-03 00:00:00', 'Presente', '07:00:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (24, 6, 4, 7, 4, '2026-02-04 00:00:00', 'Presente', '07:01:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (25, 6, 4, 7, 4, '2026-02-06 00:00:00', 'Ausente', '08:00:00', 0, NULL, NULL, NULL, 'Sin justificacion');
INSERT INTO `asistencias` VALUES (26, 6, 4, 7, 4, '2026-02-10 00:00:00', 'Presente', '07:00:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (27, 6, 4, 7, 4, '2026-02-11 00:00:00', 'Presente', '07:05:00', 0, NULL, NULL, NULL, NULL);
INSERT INTO `asistencias` VALUES (28, 8, 1, 1, 1, '2026-08-15 00:00:00', 'Presente', '18:59:37', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (29, 7, 1, 1, 1, '2026-08-15 00:00:00', 'Presente', '18:40:02', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (30, 2, 1, 1, 1, '2026-08-15 00:00:00', 'Presente', '18:58:50', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (31, 1, 1, 1, 1, '2026-08-15 00:00:00', 'Presente', '18:40:06', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (32, 13, 2, 1, 1, '2026-08-15 00:00:00', 'Presente', '20:28:25', NULL, NULL, NULL, NULL, 'naada');
INSERT INTO `asistencias` VALUES (33, 10, 2, 1, 1, '2026-08-15 00:00:00', 'Presente', '20:28:37', NULL, NULL, NULL, NULL, 'da');
INSERT INTO `asistencias` VALUES (34, 9, 2, 1, 1, '2026-08-15 00:00:00', 'Presente', '20:28:40', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (35, 13, 1, 1, 1, '2026-08-16 00:00:00', 'Presente', '12:23:47', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (36, 8, 1, 1, 1, '2026-08-16 00:00:00', 'Presente', '12:23:49', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (37, 7, 1, 1, 1, '2026-08-16 00:00:00', 'Presente', '12:23:51', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (38, 2, 1, 1, 1, '2026-08-16 00:00:00', 'Presente', '12:23:51', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (39, 1, 1, 1, 1, '2026-08-16 00:00:00', 'Presente', '12:23:52', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (60, 11, 3, 1, 1, '2026-08-17 00:00:00', 'Presente', '22:39:25', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (61, 12, 3, 1, 1, '2026-08-17 00:00:00', 'Presente', '22:48:57', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (62, 3, 3, 1, 1, '2026-08-17 00:00:00', 'Presente', '22:49:08', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (63, 40, 2, 1, 1, '2026-09-17 00:00:00', 'Presente', '11:40:48', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (64, 1, 1, 1, 1, '2026-09-17 00:00:00', 'Presente', '11:42:35', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (65, 2, 3, 2, 1, '2026-09-17 00:00:00', 'Presente', '11:43:47', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (66, 37, 2, 1, 1, '2026-09-11 00:00:00', 'Presente', '17:54:46', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (67, 9, 2, 1, 1, '2026-09-11 00:00:00', 'Presente', '17:54:46', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (68, 10, 2, 1, 1, '2026-09-11 00:00:00', 'Presente', '17:54:46', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (69, 36, 2, 1, 1, '2026-09-11 00:00:00', 'Presente', '17:54:46', NULL, NULL, NULL, NULL, '');
INSERT INTO `asistencias` VALUES (70, 40, 2, 1, 1, '2026-09-11 00:00:00', 'Presente', '17:54:46', NULL, NULL, NULL, NULL, '');
-- 50 fila(s) en `asistencias`

DROP TABLE IF EXISTS `asistencias_alertas`;
CREATE TABLE `asistencias_alertas` (
  `id_alerta` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_clase` int NOT NULL,
  `tipo_alerta` enum('Ausencia_Consecutiva','Bajo_Porcentaje','Justificacion_Pendiente') NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_alerta` date NOT NULL,
  `estado` enum('Pendiente','Enviada','Resuelta') DEFAULT Pendiente
,
  PRIMARY KEY (`id_alerta`)
);
-- 0 fila(s) en `asistencias_alertas`

DROP TABLE IF EXISTS `asistencias_configuracion`;
CREATE TABLE `asistencias_configuracion` (
  `id_config` int AUTO_INCREMENT,
  `anio_lectivo` year NOT NULL,
  `porcentaje_minimo` decimal(5,2) NOT NULL DEFAULT 80.00,
  `tolerancia_retardo_minutos` int NOT NULL DEFAULT 10,
  `justificacion_dias_limite` int NOT NULL DEFAULT 3
,
  PRIMARY KEY (`id_config`)
);
-- 0 fila(s) en `asistencias_configuracion`

DROP TABLE IF EXISTS `asistencias_justificaciones`;
CREATE TABLE `asistencias_justificaciones` (
  `id_justificacion` int AUTO_INCREMENT,
  `id_asistencia` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `tipo_justificacion` enum('Medica','Familiar','Personal','Institucional','Otra') NOT NULL,
  `documento_adjunto` varchar(255),
  `descripcion` text NOT NULL,
  `solicitado_por` varchar(100) NOT NULL,
  `aprobado_por` varchar(100),
  `estado` enum('Pendiente','Aprobado','Rechazado') DEFAULT Pendiente,
  `fecha_solicitud` date NOT NULL,
  `fecha_aprobacion` date,
  `observaciones` text
,
  PRIMARY KEY (`id_justificacion`)
);
-- 0 fila(s) en `asistencias_justificaciones`

DROP TABLE IF EXISTS `asistencias_resumen`;
CREATE TABLE `asistencias_resumen` (
  `id_resumen` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `periodo` int NOT NULL,
  `total_dias` int NOT NULL DEFAULT 0,
  `presentes` int NOT NULL DEFAULT 0,
  `ausencias` int NOT NULL DEFAULT 0,
  `tardanzas` int NOT NULL DEFAULT 0,
  `justificadas` int NOT NULL DEFAULT 0,
  `porcentaje_asistencia` decimal(5,2) DEFAULT 0.00
,
  PRIMARY KEY (`id_resumen`)
);
INSERT INTO `asistencias_resumen` VALUES (1, 1, 1, 2026, 1, 10, 7, 1, 2, 1, 90.00);
INSERT INTO `asistencias_resumen` VALUES (2, 2, 1, 2026, 1, 6, 4, 1, 1, 0, 83.33);
INSERT INTO `asistencias_resumen` VALUES (3, 3, 3, 2026, 1, 6, 5, 0, 1, 0, 91.66);
INSERT INTO `asistencias_resumen` VALUES (4, 6, 4, 2026, 1, 5, 4, 1, 0, 0, 80.00);
-- 4 fila(s) en `asistencias_resumen`

DROP TABLE IF EXISTS `aspirantes`;
CREATE TABLE `aspirantes` (
  `id_aspirante` int AUTO_INCREMENT,
  `numero_expediente` varchar(50),
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `dui` varchar(10),
  `pasaporte` varchar(50),
  `nacionalidad` varchar(100) DEFAULT Salvadoreña,
  `fecha_nacimiento` date,
  `genero` enum('Masculino','Femenino','Otro'),
  `tipo_sangre` varchar(10),
  `enfermedades_cronicas` text,
  `alergias` text,
  `medicamentos` text,
  `discapacidad` tinyint(1) DEFAULT 0,
  `tipo_discapacidad` varchar(100),
  `direccion` text,
  `telefono` varchar(15),
  `telefono_fijo` varchar(15),
  `telefono_emergencia` varchar(15),
  `nombre_contacto_emergencia` varchar(150),
  `parentesco_emergencia` varchar(50),
  `correo` varchar(100),
  `escuela_procedencia` varchar(200),
  `anio_estudio` varchar(50),
  `promedio_anterior` decimal(5,2),
  `conducta_puntaje` decimal(5,2),
  `nota_examen` decimal(5,2),
  `puntaje_seleccion` decimal(5,2),
  `exonerado` tinyint(1) DEFAULT 0,
  `tipo_exoneracion` enum('conducta','notas','otro'),
  `documento_exoneracion` varchar(255),
  `puesto_aspirante` int,
  `nivel_aspira` enum('Bachillerato General','Bachillerato Tecnico'),
  `especialidad_aspira` int,
  `id_clase_asignada` int,
  `nombre_padre` varchar(150),
  `dui_padre` varchar(10),
  `telefono_padre` varchar(15),
  `ocupacion_padre` varchar(100),
  `nombre_madre` varchar(150),
  `dui_madre` varchar(10),
  `telefono_madre` varchar(15),
  `ocupacion_madre` varchar(100),
  `nombre_encargado` varchar(150),
  `dui_encargado` varchar(10),
  `telefono_encargado` varchar(15),
  `email_encargado` varchar(100),
  `parentesco_encargado` varchar(50),
  `num_hermanos` int DEFAULT 0,
  `estado_solicitud` enum('Pendiente','Aprobado','Rechazado','En Espera','Preseleccionado') NOT NULL DEFAULT Pendiente,
  `fecha_solicitud` timestamp DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text,
  `fecha_entrevista` date,
  `entrevistado_por` varchar(100),
  `observaciones_entrevista` text,
  `fecha_aprobacion` date,
  `aprobado_por` varchar(100),
  `documentos_presentados` text,
  `id_estudiante_generado` int,
  `id_inscripcion_generada` int,
  `nie` varchar(20),
  `carnet_menoridad` varchar(20),
  `nota_primer_periodo_escuela` decimal(5,2),
  `nota_segundo_periodo_escuela` decimal(5,2),
  `promedio_final_escuela` decimal(5,2),
  `archivo_notas_escuela` varchar(255),
  `conducta_escuela` varchar(50),
  `foto` varchar(255),
  `documentos` text,
  `documento_pdf` varchar(255),
  `documentos_observacion` text
,
  PRIMARY KEY (`id_aspirante`)
);
INSERT INTO `aspirantes` VALUES (1, NULL, 'Miguel Angel', 'Rivas Salaverria', '02000001-1', NULL, 'Salvadoreña', '2010-03-14 00:00:00', 'Masculino', 'O+', NULL, NULL, NULL, 0, NULL, 'Colonia San Luis, Apopa', '7788-1001', NULL, NULL, NULL, NULL, 'miguel.rivas@correo.com', 'Centro Escolar San Luis', '9° Grado', 8.20, 9.00, 9.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato General', 1, 11, 'Carlos Rivas', NULL, '7788-2001', NULL, 'Sandra Salaverria', NULL, '7788-3001', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'Aprobado', '2026-01-20 09:00:00', 'Aspirante con buen promedio', '2026-08-14 00:00:00', 'Direccion', 'ok
', '2026-08-16 00:00:00', 'Direccion', 'Partida de Nacimiento, Notas', 29, 27, 'NIE-EXP-001', NULL, 7.50, 8.00, 8.20, NULL, 'Muy Bueno', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (2, NULL, 'Karen Noemi', 'Ayala Martinez', '02000002-2', NULL, 'Salvadoreña', '2010-07-22 00:00:00', 'Femenino', 'A+', NULL, NULL, NULL, 0, NULL, 'Residencial Los Angeles, Apopa', '7788-1002', NULL, NULL, NULL, NULL, 'karen.ayala@correo.com', 'CE La Floresta', '9° Grado', 8.90, 9.50, 10.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 2, 6, 'Jose Ayala', NULL, '7788-2002', NULL, 'Marta Martinez', NULL, '7788-3002', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Aprobado', '2026-01-21 10:00:00', NULL, NULL, NULL, NULL, '2026-08-14 00:00:00', 'Direccion', 'Partida de Nacimiento, Notas, Carnet', 26, NULL, 'NIE-EXP-002', NULL, 8.50, 9.00, 8.90, NULL, 'Excelente', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (3, NULL, 'Luis Eduardo', 'Mejia Benavides', '02000003-3', NULL, 'Salvadoreña', '2010-01-30 00:00:00', 'Masculino', 'B+', NULL, NULL, NULL, 0, NULL, 'Canton El Rosario, Apopa', '7788-1003', NULL, NULL, NULL, NULL, 'luis.mejia@correo.com', 'CE El Rosario', '9° Grado', 7.80, 8.00, 10.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 2, 6, 'Rene Mejia', NULL, '7788-2003', NULL, 'Adriana Benavides', NULL, '7788-3003', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'Aprobado', '2026-01-22 11:00:00', NULL, NULL, NULL, NULL, '2026-08-14 00:00:00', 'Direccion', 'Partida de Nacimiento, Notas', 25, NULL, 'NIE-EXP-003', NULL, 7.00, 7.50, 7.80, NULL, 'Bueno', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (4, NULL, 'Carlos Javier', 'Guevara Ponce', '02000004-4', NULL, 'Salvadoreña', '2010-05-11 00:00:00', 'Masculino', 'O-', NULL, NULL, NULL, 0, NULL, 'Colonia La Campanera, Apopa', '7788-1004', NULL, NULL, NULL, NULL, 'carlos.guevara@correo.com', 'CE La Campanera', '9° Grado', 8.10, 8.50, NULL, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 1, NULL, 'Hector Guevara', NULL, '7788-2004', NULL, 'Rosa Ponce', NULL, '7788-3004', NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Preseleccionado', '2026-01-22 14:00:00', 'Preseleccionado por nota de examen', NULL, NULL, NULL, NULL, NULL, 'Partida de Nacimiento, Notas', NULL, NULL, 'NIE-EXP-004', NULL, 7.80, 8.20, 8.10, NULL, 'Muy Bueno', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (5, NULL, 'Ana Gabriela', 'Menjivar Castro', '02000005-5', NULL, 'Salvadoreña', '2010-09-18 00:00:00', 'Femenino', 'A-', NULL, NULL, NULL, 0, NULL, 'Canton El Zapote, Apopa', '7788-1005', NULL, NULL, NULL, NULL, 'ana.menjivar@correo.com', 'CE El Zapote', '9° Grado', 8.00, 9.00, NULL, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 3, NULL, 'Walter Menjivar', NULL, '7788-2005', NULL, 'Leticia Castro', NULL, '7788-3005', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Preseleccionado', '2026-01-23 09:00:00', NULL, NULL, NULL, NULL, NULL, NULL, 'Partida de Nacimiento, Notas, Carnet', NULL, NULL, 'NIE-EXP-005', NULL, 7.90, 8.10, 8.00, NULL, 'Muy Bueno', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (6, NULL, 'Rodrigo Alexander', 'Ayala Serrano', '02000006-6', NULL, 'Salvadoreña', '2010-11-05 00:00:00', 'Masculino', 'B-', NULL, NULL, NULL, 0, NULL, 'Colonia Las Dalias, Apopa', '7788-1006', NULL, NULL, NULL, NULL, 'rodrigo.ayala@correo.com', 'CE Las Dalias', '9° Grado', 7.00, 7.50, NULL, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 2, NULL, 'Marcos Ayala', NULL, '7788-2006', NULL, 'Julia Serrano', NULL, '7788-3006', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'Preseleccionado', '2026-01-23 10:30:00', 'Necesita reforzar notas', NULL, NULL, NULL, NULL, NULL, 'Notas', NULL, NULL, 'NIE-EXP-006', NULL, 6.80, 7.20, 7.00, NULL, 'Bueno', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (7, NULL, 'Paola Michelle', 'Flores Ramirez', '02000007-7', NULL, 'Salvadoreña', '2010-04-26 00:00:00', 'Femenino', 'AB+', NULL, NULL, NULL, 0, NULL, 'Residencial Las Colinas, Apopa', '7788-1007', NULL, NULL, NULL, NULL, 'paola.flores@correo.com', 'CE Las Colinas', '9° Grado', 8.70, 9.50, NULL, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 1, NULL, 'Roberto Flores', NULL, '7788-2007', NULL, 'Claudia Ramirez', NULL, '7788-3007', NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Preseleccionado', '2026-01-24 09:30:00', 'Excelente expediente', NULL, NULL, NULL, NULL, NULL, 'Partida de Nacimiento, Notas', NULL, NULL, 'NIE-EXP-007', NULL, 8.40, 8.80, 8.70, NULL, 'Excelente', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (8, NULL, 'Jose Roberto', 'Parada Linares', '02000008-8', NULL, 'Salvadoreña', '2010-08-03 00:00:00', 'Masculino', 'O+', NULL, NULL, NULL, 0, NULL, 'Colonia San Miguel, Apopa', '7788-1008', NULL, NULL, NULL, NULL, 'jose.parada@correo.com', 'CE San Miguel', '9° Grado', 8.50, 9.00, NULL, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 1, NULL, 'Juan Parada', NULL, '7788-2008', NULL, 'Carmen Linares', NULL, '7788-3008', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'En Espera', '2026-01-15 08:00:00', 'Aprobado con exito', '2026-01-28 00:00:00', 'Direccion INA', 'Buen desempeño en entrevista', NULL, 'Direccion INA', 'Partida de Nacimiento, Notas, Carnet, DUI Padre', NULL, NULL, 'NIE-EXP-008', NULL, 8.00, 8.60, 8.50, NULL, 'Excelente', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (9, NULL, 'Sandra Yolanda', 'Quintanilla Vega', '02000009-9', NULL, 'Salvadoreña', '2010-02-14 00:00:00', 'Femenino', 'A+', NULL, NULL, NULL, 0, NULL, 'Colonia La Solidaridad, Apopa', '7788-1009', NULL, NULL, NULL, NULL, 'sandra.quintanilla@correo.com', 'CE La Solidaridad', '9° Grado', 8.30, 8.50, NULL, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 1, NULL, 'Ramon Quintanilla', NULL, '7788-2009', NULL, 'Vilma Vega', NULL, '7788-3009', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'En Espera', '2026-01-16 10:00:00', NULL, '2026-01-29 00:00:00', 'Direccion INA', 'Expediente completo', NULL, 'Direccion INA', 'Partida de Nacimiento, Notas', NULL, NULL, 'NIE-EXP-009', NULL, 8.10, 8.40, 8.30, NULL, 'Muy Bueno', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (10, 'prueba', 'Walter Ernesto', 'Pineda Amaya', '02000010-0', NULL, 'Salvadoreña', '2010-06-09 00:00:00', 'Masculino', 'B-', NULL, NULL, NULL, 0, NULL, 'Canton Joya Grande, Apopa', '7788-1010', NULL, NULL, NULL, NULL, 'walter.pineda@correo.com', 'CE Joya Grande', '9° Grado', 5.60, 6.00, 9.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 2, 6, 'Salvador Pineda', NULL, '7788-2010', NULL, 'Dina Amaya', NULL, '7788-3010', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'Aprobado', '2026-01-19 09:00:00', 'Promedio por debajo del minimo', NULL, NULL, NULL, '2026-08-16 00:00:00', 'Direccion', 'Notas', 35, 33, 'NIE-EXP-010', NULL, 5.20, 5.80, 5.60, NULL, 'Suficiente', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (11, NULL, 'Claudia Marina', 'Ochoa Tamayo', '02000011-1', NULL, 'Salvadoreña', '2010-10-27 00:00:00', 'Femenino', 'O+', NULL, NULL, NULL, 0, NULL, 'Residencial Las Perlas, Apopa', '7788-1011', NULL, NULL, NULL, NULL, 'claudia.ochoa@correo.com', 'CE Las Perlas', '9° Grado', 5.90, 6.50, NULL, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 3, NULL, 'Nelson Ochoa', NULL, '7788-2011', NULL, 'Beatriz Tamayo', NULL, '7788-3011', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Rechazado', '2026-01-20 13:00:00', 'Documentacion incompleta', NULL, NULL, NULL, '2026-02-04 00:00:00', 'Comision INA', 'Notas', NULL, NULL, 'NIE-EXP-011', NULL, 5.70, 6.00, 5.90, NULL, 'Suficiente', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (12, NULL, 'Alejandro Rafael', 'Vasquez Portillo', '02000012-2', NULL, 'Salvadoreña', '2010-03-03 00:00:00', 'Masculino', 'A-', NULL, NULL, NULL, 0, NULL, 'Colonia El Milagro, Apopa', '7788-1012', NULL, NULL, NULL, NULL, 'alejandro.vasquez@correo.com', 'CE El Milagro', '9° Grado', 7.60, 8.00, 8.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 2, 6, 'Julio Vasquez', NULL, '7788-2012', NULL, 'Sonia Portillo', NULL, '7788-3012', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'Aprobado', '2026-01-21 15:00:00', 'En lista de espera por cupo', NULL, NULL, NULL, '2026-08-14 00:00:00', 'Direccion', 'Partida de Nacimiento, Notas', 27, 26, 'NIE-EXP-012', NULL, 7.20, 7.70, 7.60, NULL, 'Bueno', NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (13, NULL, '', '', NULL, NULL, 'Salvadoreña', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'En Espera', '2026-08-14 21:32:55', 'prueba', '2026-09-20 00:00:00', 'Direccion', 'prueba', '2026-08-16 00:00:00', 'Direccion', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (17, NULL, 'PRUEBA2', 'prueba2', '111111111-', NULL, 'Salvadoreña', '2009-02-26 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '22335456', NULL, NULL, NULL, NULL, 'jm@gmail.com', 'sgvdfgsge', NULL, NULL, NULL, 8.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 2, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Aprobado', '2026-08-16 18:15:13', NULL, NULL, NULL, NULL, '2026-08-16 00:00:00', 'Direccion', NULL, 34, 29, '11114463', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (18, NULL, 'PRUEBA3', 'prueba3', '111113454', NULL, 'Salvadoreña', '2007-07-20 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '22335457', NULL, NULL, NULL, NULL, 'ajdhad@gmail.com', 'fsfsdfsdfsd', NULL, NULL, NULL, 9.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato General', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Aprobado', '2026-08-16 18:17:35', NULL, NULL, NULL, NULL, '2026-08-16 00:00:00', 'Direccion', NULL, 33, 28, '424245242', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (21, NULL, 'PRUEBA3', 'prueba3', '111111111-', NULL, 'Salvadoreña', '2010-08-04 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '22335457', NULL, NULL, NULL, NULL, 'jm@gmail.com', 'sgvdfgsg', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 'Bachillerato General', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Rechazado', '2026-08-16 18:42:03', 'prueba', NULL, NULL, NULL, '2026-08-16 00:00:00', 'Direccion', NULL, NULL, NULL, '11114464', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (23, NULL, 'PRUEBA3', 'prueba2', '111111111-', NULL, 'Salvadoreña', '2009-03-11 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '22335457', NULL, NULL, NULL, NULL, 'jm@gmail.com', 'sgvdfgsg', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 'Bachillerato General', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Rechazado', '2026-08-16 18:50:09', 'mjj', NULL, NULL, NULL, '2026-08-17 00:00:00', 'Direccion', NULL, NULL, NULL, '11114464', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `aspirantes` VALUES (24, NULL, 'Ian Andrew', 'Bonilla Hernandez', NULL, NULL, 'Salvadoreña', '2008-08-22 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'owenmejia1@gmail.com', 'Centro escolar 2', NULL, NULL, NULL, 10.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 2, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Aprobado', '2026-08-17 09:06:21', NULL, NULL, NULL, NULL, '2026-09-16 00:00:00', 'Direccion', NULL, NULL, NULL, '546668956', NULL, NULL, NULL, NULL, '/uploads/aspirantes/24/Notasde9Grado_1_boletas_ina_periodo.pdf', NULL, '/uploads/aspirantes/24/foto_images.png', '[{"tipo":"Notas de 9\u00B0 Grado","nombre":"boletas_ina_periodo.pdf","archivo":"/uploads/aspirantes/24/Notasde9Grado_1_boletas_ina_periodo.pdf"}]', NULL, NULL);
INSERT INTO `aspirantes` VALUES (25, NULL, 'Vladimir Ernesto', 'Orantes patrick', NULL, NULL, 'Salvadoreña', '2008-08-02 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '79544646', NULL, NULL, NULL, NULL, 'owenmejia452@gmail.com', 'Centro escolar 1', NULL, NULL, NULL, 8.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 1, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Aprobado', '2026-08-17 09:08:16', NULL, NULL, NULL, NULL, '2026-08-17 00:00:00', 'Direccion', NULL, NULL, NULL, '5466689564', NULL, NULL, NULL, NULL, '/uploads/aspirantes/25/Notasde9Grado_1_boletas_ina_periodo.pdf', NULL, '/uploads/aspirantes/25/foto_images.png', '[{"tipo":"Notas de 9\u00B0 Grado","nombre":"boletas_ina_periodo.pdf","archivo":"/uploads/aspirantes/25/Notasde9Grado_1_boletas_ina_periodo.pdf"}]', NULL, NULL);
INSERT INTO `aspirantes` VALUES (26, NULL, 'Joshua Felix', 'Bonilla Hernandez', NULL, NULL, 'Salvadoreña', '2009-08-22 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '22556633', NULL, NULL, NULL, NULL, 'joshua19morao@gmail.com', 'Centro escolar 2', NULL, NULL, NULL, 10.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 2, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Aprobado', '2026-09-11 20:35:49', NULL, NULL, NULL, NULL, '2026-09-16 00:00:00', 'Direccion', NULL, 39, 37, '3164665', NULL, NULL, NULL, NULL, '/uploads/aspirantes/26/Notasde9Grado_1_boletas_ina_periodo.pdf', NULL, '/uploads/aspirantes/26/foto_snoopy.jpg', '[{"tipo":"Notas de 9\u00B0 Grado","nombre":"boletas_ina_periodo.pdf","archivo":"/uploads/aspirantes/26/Notasde9Grado_1_boletas_ina_periodo.pdf"}]', NULL, NULL);
INSERT INTO `aspirantes` VALUES (27, '253542', 'prueba5', 'prueba5', NULL, NULL, 'Salvadoreña', '2009-11-18 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '68797977', NULL, NULL, NULL, NULL, 'equiposabiiquiz@gmail.com', 'svhf', NULL, NULL, NULL, 10.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato General', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Aprobado', '2026-09-16 21:11:53', NULL, NULL, NULL, NULL, '2026-09-16 00:00:00', 'Direccion', NULL, 36, 34, '112436897', NULL, NULL, NULL, NULL, '/uploads/aspirantes/27/Notasde9Grado_1_messi-1920x1080.jpg', NULL, '/uploads/aspirantes/27/foto_saludando_perro_1.png', '[{"tipo":"Notas de 9\u00B0 Grado","nombre":"messi-1920x1080.jpg","archivo":"/uploads/aspirantes/27/Notasde9Grado_1_messi-1920x1080.jpg"}]', NULL, NULL);
INSERT INTO `aspirantes` VALUES (28, NULL, 'prueba6', 'prueba6', NULL, NULL, 'Salvadoreña', '2009-08-23 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '2335535', NULL, NULL, NULL, NULL, 'jefferaguieirre@gmail.com', 'sfff', NULL, NULL, NULL, 10.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato General', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Aprobado', '2026-09-16 23:03:51', NULL, NULL, NULL, NULL, '2026-09-16 00:00:00', 'Direccion', NULL, 37, 35, '44444444444444', NULL, NULL, NULL, NULL, '/uploads/aspirantes/28/Notasde9Grado_1_saludando_perro_1.png', NULL, '/uploads/aspirantes/28/foto_saludando_perro_1.png', '[{"tipo":"Notas de 9\u00B0 Grado","nombre":"saludando_perro_1.png","archivo":"/uploads/aspirantes/28/Notasde9Grado_1_saludando_perro_1.png"}]', NULL, NULL);
INSERT INTO `aspirantes` VALUES (29, NULL, 'Joshua Felix', 'Hernández Perez', NULL, NULL, 'Salvadoreña', '2009-05-22 00:00:00', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, '79544646', NULL, NULL, NULL, NULL, 'josesitoxd504@gmail.com', 'Centro escolar 2', NULL, NULL, NULL, 10.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 1, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Aprobado', '2026-09-16 23:44:05', NULL, NULL, NULL, NULL, '2026-09-16 00:00:00', 'Direccion', NULL, 38, 36, '747845', NULL, NULL, NULL, NULL, '/uploads/aspirantes/29/Notasde9Grado_1_boletas_ina_periodo.pdf', NULL, '/uploads/aspirantes/29/foto_favicon.icon.png', '[{"tipo":"Notas de 9\u00B0 Grado","nombre":"boletas_ina_periodo.pdf","archivo":"/uploads/aspirantes/29/Notasde9Grado_1_boletas_ina_periodo.pdf"}]', NULL, NULL);
INSERT INTO `aspirantes` VALUES (30, '235253', 'ghfgjhgjg', 'dgdghfhfg', NULL, NULL, 'Salvadoreña', '2008-07-19 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '75868657', NULL, NULL, NULL, NULL, 'eswampy29naranja@gmail.com', NULL, NULL, NULL, NULL, 10.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato General', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Aprobado', '2026-09-17 11:23:36', NULL, NULL, NULL, NULL, '2026-09-17 00:00:00', 'Direccion', NULL, 40, 38, '6789689', NULL, NULL, NULL, NULL, '/uploads/aspirantes/30/Notasde9Grado_1_favicon.icon.png', NULL, '/uploads/aspirantes/30/foto_favicon.icon.png', '[{"tipo":"Notas de 9\u00B0 Grado","nombre":"favicon.icon.png","archivo":"/uploads/aspirantes/30/Notasde9Grado_1_favicon.icon.png"}]', NULL, NULL);
INSERT INTO `aspirantes` VALUES (31, '2026-001-01', 'Ronald Ernesto ', 'Pérez Argueta', NULL, NULL, 'Salvadoreña', '2008-07-13 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '22556633', NULL, NULL, NULL, NULL, 'eswampy32morado@gmail.com', 'Centro escolar 2', NULL, NULL, NULL, 10.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato Tecnico', 2, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Aprobado', '2026-09-19 11:42:16', NULL, NULL, NULL, NULL, '2026-09-19 00:00:00', 'Direccion', NULL, 41, 39, '1234875966', NULL, NULL, NULL, NULL, '/uploads/aspirantes/31/Notasde9Grado_1_boletas_ina_periodo.pdf', NULL, '/uploads/aspirantes/31/foto_favicon.icon.png', '[{"tipo":"Notas de 9\u00B0 Grado","nombre":"boletas_ina_periodo.pdf","archivo":"/uploads/aspirantes/31/Notasde9Grado_1_boletas_ina_periodo.pdf"}]', NULL, NULL);
INSERT INTO `aspirantes` VALUES (32, NULL, 'svdhfh', 'afsgsg', 'sdfsgsg', NULL, 'Salvadoreña', '2009-04-22 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, 'wertre', NULL, NULL, NULL, NULL, 'jefferaguiwirre@gmail.com', 'www', NULL, NULL, NULL, 10.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato General', NULL, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'equiposwabiquiz@gmail.com', NULL, 0, 'Aprobado', '2026-09-23 20:51:17', NULL, NULL, NULL, NULL, '2026-09-23 00:00:00', 'Direccion', NULL, NULL, NULL, '234543234', '4424244', NULL, NULL, NULL, '/uploads/aspirantes/32/Notasde9Grado_1_ina.png', NULL, '/uploads/aspirantes/32/foto_ina.png', '[{"tipo":"Notas de 9\u00B0 Grado","nombre":"ina.png","archivo":"/uploads/aspirantes/32/Notasde9Grado_1_ina.png"}]', NULL, NULL);
INSERT INTO `aspirantes` VALUES (33, NULL, 'prueba10', 'prueba10', '234567865', NULL, 'Salvadoreña', '2009-09-24 00:00:00', 'Masculino', NULL, NULL, NULL, NULL, 0, NULL, NULL, '242435343', NULL, NULL, NULL, NULL, 'cuentadetrabajo123mujer@gmail.com', 'afsfaf', NULL, NULL, NULL, 9.00, NULL, 0, NULL, NULL, NULL, 'Bachillerato General', NULL, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'jefferaguirrre@gmail.com', NULL, 0, 'Aprobado', '2026-09-23 21:11:40', NULL, NULL, NULL, NULL, '2026-09-23 00:00:00', 'Direccion', NULL, 42, 40, '23565432', '23565', NULL, NULL, NULL, '/uploads/aspirantes/33/Notasde9Grado_1_ina.png', NULL, '/uploads/aspirantes/33/foto_ina.png', '[{"tipo":"Notas de 9\u00B0 Grado","nombre":"ina.png","archivo":"/uploads/aspirantes/33/Notasde9Grado_1_ina.png"}]', NULL, NULL);
-- 27 fila(s) en `aspirantes`

DROP TABLE IF EXISTS `auditoria`;
CREATE TABLE `auditoria` (
  `id_auditoria` int AUTO_INCREMENT,
  `usuario` varchar(100) NOT NULL,
  `accion` varchar(50) NOT NULL,
  `detalle` text,
  `ip` varchar(50),
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_auditoria`)
);
INSERT INTO `auditoria` VALUES (1, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 18:33:38', '2026-08-14 18:33:38');
INSERT INTO `auditoria` VALUES (2, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Luis Eduardo Mejia Benavides: 10', '::1', '2026-08-14 18:34:10', '2026-08-14 18:34:10');
INSERT INTO `auditoria` VALUES (3, 'Direccion', 'Aprobar', 'Aspirante Luis Eduardo Mejia Benavides aprobado y registrado como estudiante (ID: 25)', '::1', '2026-08-14 18:35:34', '2026-08-14 18:35:34');
INSERT INTO `auditoria` VALUES (4, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Karen Noemi Ayala Martinez: 10', '::1', '2026-08-14 18:36:12', '2026-08-14 18:36:12');
INSERT INTO `auditoria` VALUES (5, 'Direccion', 'Aprobar', 'Aspirante Karen Noemi Ayala Martinez aprobado y registrado como estudiante (ID: 26)', '::1', '2026-08-14 18:36:21', '2026-08-14 18:36:21');
INSERT INTO `auditoria` VALUES (6, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Miguel Angel Rivas Salaverria: 9', '::1', '2026-08-14 18:36:26', '2026-08-14 18:36:26');
INSERT INTO `auditoria` VALUES (7, 'Direccion', 'Actualizar', 'Aspirante Miguel Angel Rivas Salaverria puesto en lista de espera', '::1', '2026-08-14 18:36:34', '2026-08-14 18:36:34');
INSERT INTO `auditoria` VALUES (8, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 18:55:52', '2026-08-14 18:55:52');
INSERT INTO `auditoria` VALUES (9, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 19:09:00', '2026-08-14 19:09:00');
INSERT INTO `auditoria` VALUES (10, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 19:33:58', '2026-08-14 19:33:58');
INSERT INTO `auditoria` VALUES (11, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 19:36:45', '2026-08-14 19:36:45');
INSERT INTO `auditoria` VALUES (12, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 20:14:09', '2026-08-14 20:14:09');
INSERT INTO `auditoria` VALUES (13, 'Registro Academico', 'Actualizar', 'Aspirante Alejandro Rafael Vasquez Portillo actualizado (ID: 12)', '::1', '2026-08-14 20:14:31', '2026-08-14 20:14:31');
INSERT INTO `auditoria` VALUES (14, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Alejandro Rafael Vasquez Portillo: 8', '::1', '2026-08-14 20:14:34', '2026-08-14 20:14:34');
INSERT INTO `auditoria` VALUES (15, 'Direccion', 'Aprobar', 'Aspirante Alejandro Rafael Vasquez Portillo aprobado y registrado como estudiante (ID: 27)', '::1', '2026-08-14 20:14:47', '2026-08-14 20:14:47');
INSERT INTO `auditoria` VALUES (16, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 20:26:51', '2026-08-14 20:26:51');
INSERT INTO `auditoria` VALUES (17, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 20:27:30', '2026-08-14 20:27:30');
INSERT INTO `auditoria` VALUES (18, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 20:27:35', '2026-08-14 20:27:35');
INSERT INTO `auditoria` VALUES (19, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 20:28:01', '2026-08-14 20:28:01');
INSERT INTO `auditoria` VALUES (20, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 20:28:50', '2026-08-14 20:28:50');
INSERT INTO `auditoria` VALUES (21, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 21:19:37', '2026-08-14 21:19:37');
INSERT INTO `auditoria` VALUES (22, 'Sistema', 'Crear', 'Nuevo aspirante registrado:   (ID: 13)', '::1', '2026-08-14 21:32:55', '2026-08-14 21:32:55');
INSERT INTO `auditoria` VALUES (23, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 22:09:07', '2026-08-14 22:09:07');
INSERT INTO `auditoria` VALUES (24, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante  : 10', '::1', '2026-08-14 22:11:36', '2026-08-14 22:11:36');
INSERT INTO `auditoria` VALUES (25, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 22:12:35', '2026-08-14 22:12:35');
INSERT INTO `auditoria` VALUES (26, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 22:13:38', '2026-08-14 22:13:38');
INSERT INTO `auditoria` VALUES (27, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 22:13:45', '2026-08-14 22:13:45');
INSERT INTO `auditoria` VALUES (28, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 22:14:02', '2026-08-14 22:14:02');
INSERT INTO `auditoria` VALUES (29, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 22:15:12', '2026-08-14 22:15:12');
INSERT INTO `auditoria` VALUES (30, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-14 22:15:32', '2026-08-14 22:15:32');
INSERT INTO `auditoria` VALUES (31, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 11:28:10', '2026-08-16 11:28:10');
INSERT INTO `auditoria` VALUES (32, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 11:29:19', '2026-08-16 11:29:19');
INSERT INTO `auditoria` VALUES (33, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 11:46:29', '2026-08-16 11:46:29');
INSERT INTO `auditoria` VALUES (34, 'Direccion', 'Rechazar', 'Aspirante   rechazado. Motivo: prueba', '::1', '2026-08-16 11:49:16', '2026-08-16 11:49:16');
INSERT INTO `auditoria` VALUES (35, 'Registro Academico', 'Actualizar', 'Aspirante Miguel Angel Rivas Salaverria actualizado (ID: 1)', '::1', '2026-08-16 11:49:36', '2026-08-16 11:49:36');
INSERT INTO `auditoria` VALUES (36, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 12:00:50', '2026-08-16 12:00:50');
INSERT INTO `auditoria` VALUES (37, 'DOC001', 'Registrar asistencia', 'Estudiante 13 - Presente - Clase 1 - Hora 12:23:46', '::1', '2026-08-16 12:23:47', '2026-08-16 12:23:47');
INSERT INTO `auditoria` VALUES (38, 'DOC001', 'Registrar asistencia', 'Estudiante 8 - Presente - Clase 1 - Hora 12:23:48', '::1', '2026-08-16 12:23:49', '2026-08-16 12:23:49');
INSERT INTO `auditoria` VALUES (39, 'DOC001', 'Registrar asistencia', 'Estudiante 7 - Presente - Clase 1 - Hora 12:23:50', '::1', '2026-08-16 12:23:51', '2026-08-16 12:23:51');
INSERT INTO `auditoria` VALUES (40, 'DOC001', 'Registrar asistencia', 'Estudiante 2 - Presente - Clase 1 - Hora 12:23:51', '::1', '2026-08-16 12:23:52', '2026-08-16 12:23:52');
INSERT INTO `auditoria` VALUES (41, 'DOC001', 'Registrar asistencia', 'Estudiante 1 - Presente - Clase 1 - Hora 12:23:52', '::1', '2026-08-16 12:23:52', '2026-08-16 12:23:52');
INSERT INTO `auditoria` VALUES (42, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 12:24:28', '2026-08-16 12:24:28');
INSERT INTO `auditoria` VALUES (43, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 12:24:51', '2026-08-16 12:24:51');
INSERT INTO `auditoria` VALUES (44, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 13:56:42', '2026-08-16 13:56:42');
INSERT INTO `auditoria` VALUES (45, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 14:24:09', '2026-08-16 14:24:09');
INSERT INTO `auditoria` VALUES (46, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 15:46:13', '2026-08-16 15:46:13');
INSERT INTO `auditoria` VALUES (47, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 15:46:46', '2026-08-16 15:46:46');
INSERT INTO `auditoria` VALUES (48, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 15:47:36', '2026-08-16 15:47:36');
INSERT INTO `auditoria` VALUES (49, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 15:55:37', '2026-08-16 15:55:37');
INSERT INTO `auditoria` VALUES (50, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:03:52', '2026-08-16 17:03:52');
INSERT INTO `auditoria` VALUES (51, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:04:18', '2026-08-16 17:04:18');
INSERT INTO `auditoria` VALUES (52, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:06:33', '2026-08-16 17:06:33');
INSERT INTO `auditoria` VALUES (53, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:09:20', '2026-08-16 17:09:20');
INSERT INTO `auditoria` VALUES (54, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:09:29', '2026-08-16 17:09:29');
INSERT INTO `auditoria` VALUES (55, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:11:28', '2026-08-16 17:11:28');
INSERT INTO `auditoria` VALUES (56, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:15:30', '2026-08-16 17:15:30');
INSERT INTO `auditoria` VALUES (57, 'Sistema', 'Crear', 'Nuevo aspirante registrado:  prueba prueba (ID: 14)', '::1', '2026-08-16 17:16:18', '2026-08-16 17:16:18');
INSERT INTO `auditoria` VALUES (58, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:16:33', '2026-08-16 17:16:33');
INSERT INTO `auditoria` VALUES (59, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante  prueba prueba: 10', '::1', '2026-08-16 17:17:01', '2026-08-16 17:17:01');
INSERT INTO `auditoria` VALUES (60, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:17:09', '2026-08-16 17:17:09');
INSERT INTO `auditoria` VALUES (61, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:18:09', '2026-08-16 17:18:09');
INSERT INTO `auditoria` VALUES (62, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:19:37', '2026-08-16 17:19:37');
INSERT INTO `auditoria` VALUES (63, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:23:09', '2026-08-16 17:23:09');
INSERT INTO `auditoria` VALUES (64, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:23:39', '2026-08-16 17:23:39');
INSERT INTO `auditoria` VALUES (65, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 17:24:35', '2026-08-16 17:24:35');
INSERT INTO `auditoria` VALUES (66, 'Direccion', 'Aprobar', 'Aspirante  prueba prueba aprobado y registrado como estudiante (ID: 28)', '::1', '2026-08-16 17:28:58', '2026-08-16 17:28:58');
INSERT INTO `auditoria` VALUES (67, 'Registro Academico', 'Actualizar', 'Aspirante   actualizado (ID: 13)', '::1', '2026-08-16 17:36:25', '2026-08-16 17:36:25');
INSERT INTO `auditoria` VALUES (68, 'Direccion', 'Aprobar', 'Aspirante Miguel Angel Rivas Salaverria aprobado y registrado como estudiante (ID: 29)', '::1', '2026-08-16 17:40:39', '2026-08-16 17:40:39');
INSERT INTO `auditoria` VALUES (69, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 18:01:28', '2026-08-16 18:01:28');
INSERT INTO `auditoria` VALUES (70, 'Sistema', 'Crear', 'Nuevo aspirante registrado: Prueba E2E Flujo Aprobacion (ID: 15)', '::1', '2026-08-16 18:02:47', '2026-08-16 18:02:47');
INSERT INTO `auditoria` VALUES (71, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Prueba E2E Flujo Aprobacion: 9.5', '::1', '2026-08-16 18:02:52', '2026-08-16 18:02:52');
INSERT INTO `auditoria` VALUES (72, 'Direccion', 'Aprobar', 'Aspirante Prueba E2E Flujo Aprobacion aprobado y registrado como estudiante (ID: 30)', '::1', '2026-08-16 18:02:58', '2026-08-16 18:02:58');
INSERT INTO `auditoria` VALUES (73, 'Sistema', 'Crear', 'Nuevo aspirante registrado: Prueba E2E Verificacion Rol (ID: 16)', '::1', '2026-08-16 18:04:33', '2026-08-16 18:04:33');
INSERT INTO `auditoria` VALUES (74, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Prueba E2E Verificacion Rol: 7.0', '::1', '2026-08-16 18:04:40', '2026-08-16 18:04:40');
INSERT INTO `auditoria` VALUES (75, 'Direccion', 'Aprobar', 'Aspirante Prueba E2E Verificacion Rol aprobado y registrado como estudiante (ID: 31)', '::1', '2026-08-16 18:04:41', '2026-08-16 18:04:41');
INSERT INTO `auditoria` VALUES (76, 'Sistema', 'Crear', 'Nuevo aspirante registrado: PRUEBA2 prueba2 (ID: 17)', '::1', '2026-08-16 18:15:13', '2026-08-16 18:15:13');
INSERT INTO `auditoria` VALUES (77, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 18:15:19', '2026-08-16 18:15:19');
INSERT INTO `auditoria` VALUES (78, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante PRUEBA2 prueba2: 10', '::1', '2026-08-16 18:15:41', '2026-08-16 18:15:41');
INSERT INTO `auditoria` VALUES (79, 'Sistema', 'Crear', 'Nuevo aspirante registrado: PRUEBA3 prueba3 (ID: 18)', '::1', '2026-08-16 18:17:35', '2026-08-16 18:17:35');
INSERT INTO `auditoria` VALUES (80, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 18:17:38', '2026-08-16 18:17:38');
INSERT INTO `auditoria` VALUES (81, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante PRUEBA3 prueba3: 9', '::1', '2026-08-16 18:17:45', '2026-08-16 18:17:45');
INSERT INTO `auditoria` VALUES (82, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 18:20:13', '2026-08-16 18:20:13');
INSERT INTO `auditoria` VALUES (83, 'Sistema', 'Crear', 'Nuevo aspirante registrado: Prueba E2E General (ID: 19)', '::1', '2026-08-16 18:20:18', '2026-08-16 18:20:18');
INSERT INTO `auditoria` VALUES (84, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Prueba E2E General: 8.0', '::1', '2026-08-16 18:20:24', '2026-08-16 18:20:24');
INSERT INTO `auditoria` VALUES (85, 'Direccion', 'Aprobar', 'Aspirante Prueba E2E General aprobado y registrado como estudiante (ID: 32)', '::1', '2026-08-16 18:20:24', '2026-08-16 18:20:24');
INSERT INTO `auditoria` VALUES (86, 'Direccion', 'Rechazar', 'Aspirante   rechazado. Motivo: prueba', '::1', '2026-08-16 18:25:46', '2026-08-16 18:25:46');
INSERT INTO `auditoria` VALUES (87, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 18:38:09', '2026-08-16 18:38:09');
INSERT INTO `auditoria` VALUES (88, 'Sistema', 'Crear', 'Nuevo aspirante registrado: Test DUP Duplicado (ID: 20)', '::1', '2026-08-16 18:38:16', '2026-08-16 18:38:16');
INSERT INTO `auditoria` VALUES (89, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Test DUP Duplicado: 7.5', '::1', '2026-08-16 18:38:21', '2026-08-16 18:38:21');
INSERT INTO `auditoria` VALUES (90, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante PRUEBA2 prueba2: 8.0', '::1', '2026-08-16 18:38:31', '2026-08-16 18:38:31');
INSERT INTO `auditoria` VALUES (91, 'Direccion', 'Aprobar', 'Aspirante PRUEBA3 prueba3 aprobado y registrado como estudiante (ID: 33)', '::1', '2026-08-16 18:41:07', '2026-08-16 18:41:07');
INSERT INTO `auditoria` VALUES (92, 'Direccion', 'Aprobar', 'Aspirante PRUEBA2 prueba2 aprobado y registrado como estudiante (ID: 34)', '::1', '2026-08-16 18:41:13', '2026-08-16 18:41:13');
INSERT INTO `auditoria` VALUES (93, 'Sistema', 'Crear', 'Nuevo aspirante registrado: PRUEBA3 prueba3 (ID: 21)', '::1', '2026-08-16 18:42:03', '2026-08-16 18:42:03');
INSERT INTO `auditoria` VALUES (94, 'Sistema', 'Crear', 'Nuevo aspirante registrado: Test Libre (ID: 22)', '::1', '2026-08-16 18:47:11', '2026-08-16 18:47:11');
INSERT INTO `auditoria` VALUES (95, 'Sistema', 'Crear', 'Nuevo aspirante registrado: PRUEBA3 prueba2 (ID: 23)', '::1', '2026-08-16 18:50:09', '2026-08-16 18:50:09');
INSERT INTO `auditoria` VALUES (96, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 18:50:14', '2026-08-16 18:50:14');
INSERT INTO `auditoria` VALUES (97, 'Direccion', 'Rechazar', 'Aspirante PRUEBA3 prueba2 rechazado. Motivo: aa', '::1', '2026-08-16 18:50:24', '2026-08-16 18:50:24');
INSERT INTO `auditoria` VALUES (98, 'Direccion', 'Rechazar', 'Aspirante PRUEBA3 prueba3 rechazado. Motivo: prueba', '::1', '2026-08-16 18:50:37', '2026-08-16 18:50:37');
INSERT INTO `auditoria` VALUES (99, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 18:51:52', '2026-08-16 18:51:52');
INSERT INTO `auditoria` VALUES (100, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 18:59:00', '2026-08-16 18:59:00');
INSERT INTO `auditoria` VALUES (101, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 18:59:50', '2026-08-16 18:59:50');
INSERT INTO `auditoria` VALUES (111, 'DIR001', 'Cambiar Calificación de Conducta', 'Estudiante 2026-00015-INA (Gabriela Estefany Alvarado Perez), periodo ''I Periodo'' 2026: calificación ''Muy Bueno'' -> ''Bueno''. Motivo: prueba', '::1', '2026-08-16 19:32:59', '2026-08-16 19:32:59');
INSERT INTO `auditoria` VALUES (112, 'DIR001', 'Cambiar Calificación de Conducta', 'Estudiante 2026-00010-INA (José Efraín Pérez Argueta), periodo ''I Periodo'' 2026: calificación ''Muy Bueno'' -> ''Bueno''. Motivo: prueba', '::1', '2026-08-16 19:33:40', '2026-08-16 19:33:40');
INSERT INTO `auditoria` VALUES (113, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:34:36', '2026-08-16 19:34:36');
INSERT INTO `auditoria` VALUES (116, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:46:17', '2026-08-16 19:46:17');
INSERT INTO `auditoria` VALUES (117, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:47:20', '2026-08-16 19:47:20');
INSERT INTO `auditoria` VALUES (118, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:47:55', '2026-08-16 19:47:55');
INSERT INTO `auditoria` VALUES (119, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:49:08', '2026-08-16 19:49:08');
INSERT INTO `auditoria` VALUES (120, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:50:51', '2026-08-16 19:50:51');
INSERT INTO `auditoria` VALUES (121, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:56:14', '2026-08-16 19:56:14');
INSERT INTO `auditoria` VALUES (122, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:56:53', '2026-08-16 19:56:53');
INSERT INTO `auditoria` VALUES (123, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:59:34', '2026-08-16 19:59:34');
INSERT INTO `auditoria` VALUES (124, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:59:39', '2026-08-16 19:59:39');
INSERT INTO `auditoria` VALUES (125, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 19:59:49', '2026-08-16 19:59:49');
INSERT INTO `auditoria` VALUES (126, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 20:00:39', '2026-08-16 20:00:39');
INSERT INTO `auditoria` VALUES (127, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 20:01:26', '2026-08-16 20:01:26');
INSERT INTO `auditoria` VALUES (128, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 20:08:05', '2026-08-16 20:08:05');
INSERT INTO `auditoria` VALUES (129, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 20:09:30', '2026-08-16 20:09:30');
INSERT INTO `auditoria` VALUES (130, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 20:10:18', '2026-08-16 20:10:18');
INSERT INTO `auditoria` VALUES (131, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 20:11:58', '2026-08-16 20:11:58');
INSERT INTO `auditoria` VALUES (132, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 20:12:05', '2026-08-16 20:12:05');
INSERT INTO `auditoria` VALUES (133, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 20:21:20', '2026-08-16 20:21:20');
INSERT INTO `auditoria` VALUES (134, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 20:22:06', '2026-08-16 20:22:06');
INSERT INTO `auditoria` VALUES (135, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:23:58', '2026-08-16 21:23:58');
INSERT INTO `auditoria` VALUES (136, 'Registro Academico', 'Actualizar', 'Aspirante Walter Ernesto Pineda Amaya actualizado (ID: 10)', '::1', '2026-08-16 21:24:07', '2026-08-16 21:24:07');
INSERT INTO `auditoria` VALUES (137, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Walter Ernesto Pineda Amaya: 9', '::1', '2026-08-16 21:24:11', '2026-08-16 21:24:11');
INSERT INTO `auditoria` VALUES (138, 'Direccion', 'Aprobar', 'Aspirante Walter Ernesto Pineda Amaya aprobado y asignado a la clase Primer Año - Tecnico Vocacional en Administrativo Contable - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-08-16 21:24:17', '2026-08-16 21:24:17');
INSERT INTO `auditoria` VALUES (139, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:24:24', '2026-08-16 21:24:24');
INSERT INTO `auditoria` VALUES (140, 'Registro Academico', 'Matricular', 'Aspirante Walter Ernesto Pineda Amaya matriculado como estudiante (ID: 35, código 2026-00035-INA) en la clase Primer Año - Tecnico Vocacional en Administrativo Contable - Seccion A', '::1', '2026-08-16 21:25:23', '2026-08-16 21:25:23');
INSERT INTO `auditoria` VALUES (141, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:25:48', '2026-08-16 21:25:48');
INSERT INTO `auditoria` VALUES (142, '2026-00035-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:26:31', '2026-08-16 21:26:31');
INSERT INTO `auditoria` VALUES (143, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:26:42', '2026-08-16 21:26:42');
INSERT INTO `auditoria` VALUES (144, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:26:47', '2026-08-16 21:26:47');
INSERT INTO `auditoria` VALUES (145, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:44:00', '2026-08-16 21:44:00');
INSERT INTO `auditoria` VALUES (146, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:44:43', '2026-08-16 21:44:43');
INSERT INTO `auditoria` VALUES (147, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:45:18', '2026-08-16 21:45:18');
INSERT INTO `auditoria` VALUES (148, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:45:31', '2026-08-16 21:45:31');
INSERT INTO `auditoria` VALUES (149, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:45:39', '2026-08-16 21:45:39');
INSERT INTO `auditoria` VALUES (150, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:46:16', '2026-08-16 21:46:16');
INSERT INTO `auditoria` VALUES (151, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 21:46:53', '2026-08-16 21:46:53');
INSERT INTO `auditoria` VALUES (152, 'REG001', 'Importar Notas', 'Importación de 6 notas nuevas y 0 actualizadas en Primer Año - Tecnico Vocacional en Desarrollo de Software - Seccion A, periodo 1 (6 válidas)', '::1', '2026-08-16 22:00:21', '2026-08-16 22:00:21');
INSERT INTO `auditoria` VALUES (153, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:00:40', '2026-08-16 22:00:40');
INSERT INTO `auditoria` VALUES (154, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:01:22', '2026-08-16 22:01:22');
INSERT INTO `auditoria` VALUES (155, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:22:16', '2026-08-16 22:22:16');
INSERT INTO `auditoria` VALUES (156, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:22:45', '2026-08-16 22:22:45');
INSERT INTO `auditoria` VALUES (157, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:23:09', '2026-08-16 22:23:09');
INSERT INTO `auditoria` VALUES (158, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:23:25', '2026-08-16 22:23:25');
INSERT INTO `auditoria` VALUES (159, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:23:38', '2026-08-16 22:23:38');
INSERT INTO `auditoria` VALUES (160, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:25:48', '2026-08-16 22:25:48');
INSERT INTO `auditoria` VALUES (161, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:38:27', '2026-08-16 22:38:27');
INSERT INTO `auditoria` VALUES (162, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:38:48', '2026-08-16 22:38:48');
INSERT INTO `auditoria` VALUES (163, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:39:15', '2026-08-16 22:39:15');
INSERT INTO `auditoria` VALUES (164, 'DIR001', 'Registrar asistencia', 'Estudiante 11 - Presente - Clase 3 - Hora 22:39:24', '::1', '2026-08-16 22:39:25', '2026-08-16 22:39:25');
INSERT INTO `auditoria` VALUES (165, 'DIR001', 'Registrar asistencia', 'Estudiante 12 - Presente - Clase 3 - Hora 22:48:56', '::1', '2026-08-16 22:48:57', '2026-08-16 22:48:57');
INSERT INTO `auditoria` VALUES (166, 'DIR001', 'Registrar asistencia', 'Estudiante 3 - Presente - Clase 3 - Hora 22:48:58', '::1', '2026-08-16 22:48:59', '2026-08-16 22:48:59');
INSERT INTO `auditoria` VALUES (167, 'DIR001', 'Editar asistencia', 'Asistencia 62 - Estudiante 3 - Nuevo estado Ausente - Hora 22:49:02', '::1', '2026-08-16 22:49:03', '2026-08-16 22:49:03');
INSERT INTO `auditoria` VALUES (168, 'DIR001', 'Editar asistencia', 'Asistencia 62 - Estudiante 3 - Nuevo estado Presente - Hora 22:49:07', '::1', '2026-08-16 22:49:08', '2026-08-16 22:49:08');
INSERT INTO `auditoria` VALUES (169, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 22:54:14', '2026-08-16 22:54:14');
INSERT INTO `auditoria` VALUES (170, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 23:13:49', '2026-08-16 23:13:49');
INSERT INTO `auditoria` VALUES (171, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 23:14:08', '2026-08-16 23:14:08');
INSERT INTO `auditoria` VALUES (172, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-16 23:19:52', '2026-08-16 23:19:52');
INSERT INTO `auditoria` VALUES (173, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:12:51', '2026-08-17 07:12:51');
INSERT INTO `auditoria` VALUES (174, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:16:28', '2026-08-17 07:16:28');
INSERT INTO `auditoria` VALUES (175, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:24:42', '2026-08-17 07:24:42');
INSERT INTO `auditoria` VALUES (176, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:24:57', '2026-08-17 07:24:57');
INSERT INTO `auditoria` VALUES (177, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:25:02', '2026-08-17 07:25:02');
INSERT INTO `auditoria` VALUES (178, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:27:28', '2026-08-17 07:27:28');
INSERT INTO `auditoria` VALUES (179, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:28:36', '2026-08-17 07:28:36');
INSERT INTO `auditoria` VALUES (180, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:39:53', '2026-08-17 07:39:53');
INSERT INTO `auditoria` VALUES (181, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:43:08', '2026-08-17 07:43:08');
INSERT INTO `auditoria` VALUES (182, 'Registro Academico', 'Actualizar', 'Aspirante PRUEBA3 prueba2 actualizado (ID: 23)', '::1', '2026-08-17 07:43:14', '2026-08-17 07:43:14');
INSERT INTO `auditoria` VALUES (183, 'Direccion', 'Rechazar', 'Aspirante PRUEBA3 prueba2 rechazado. Motivo: mjj', '::1', '2026-08-17 07:43:18', '2026-08-17 07:43:18');
INSERT INTO `auditoria` VALUES (184, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:46:10', '2026-08-17 07:46:10');
INSERT INTO `auditoria` VALUES (185, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:46:47', '2026-08-17 07:46:47');
INSERT INTO `auditoria` VALUES (186, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:48:07', '2026-08-17 07:48:07');
INSERT INTO `auditoria` VALUES (187, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 07:55:56', '2026-08-17 07:55:56');
INSERT INTO `auditoria` VALUES (188, 'Sistema', 'Crear', 'Nuevo aspirante registrado: Ian Andrew Bonilla Hernandez (ID: 24)', '::1', '2026-08-17 09:06:21', '2026-08-17 09:06:21');
INSERT INTO `auditoria` VALUES (189, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 09:06:26', '2026-08-17 09:06:26');
INSERT INTO `auditoria` VALUES (190, 'Sistema', 'Crear', 'Nuevo aspirante registrado: Vladimir Ernesto Orantes patrick (ID: 25)', '::1', '2026-08-17 09:08:16', '2026-08-17 09:08:16');
INSERT INTO `auditoria` VALUES (191, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 09:08:21', '2026-08-17 09:08:21');
INSERT INTO `auditoria` VALUES (192, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Vladimir Ernesto Orantes patrick: 8', '::1', '2026-08-17 09:09:11', '2026-08-17 09:09:11');
INSERT INTO `auditoria` VALUES (193, 'Direccion', 'Aprobar', 'Aspirante Vladimir Ernesto Orantes patrick aprobado y asignado a la clase Tercer Año - Tecnico Vocacional en Desarrollo de Software - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-08-17 09:09:22', '2026-08-17 09:09:22');
INSERT INTO `auditoria` VALUES (194, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 09:10:30', '2026-08-17 09:10:30');
INSERT INTO `auditoria` VALUES (195, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 09:19:27', '2026-08-17 09:19:27');
INSERT INTO `auditoria` VALUES (196, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 09:20:03', '2026-08-17 09:20:03');
INSERT INTO `auditoria` VALUES (197, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 09:25:04', '2026-08-17 09:25:04');
INSERT INTO `auditoria` VALUES (198, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 09:25:59', '2026-08-17 09:25:59');
INSERT INTO `auditoria` VALUES (199, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-17 09:28:07', '2026-08-17 09:28:07');
INSERT INTO `auditoria` VALUES (200, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-18 07:56:36', '2026-08-18 07:56:36');
INSERT INTO `auditoria` VALUES (201, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-18 08:19:35', '2026-08-18 08:19:35');
INSERT INTO `auditoria` VALUES (202, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-18 08:23:27', '2026-08-18 08:23:27');
INSERT INTO `auditoria` VALUES (203, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-18 08:27:04', '2026-08-18 08:27:04');
INSERT INTO `auditoria` VALUES (204, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-18 19:04:27', '2026-08-18 19:04:27');
INSERT INTO `auditoria` VALUES (205, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-18 19:32:32', '2026-08-18 19:32:32');
INSERT INTO `auditoria` VALUES (206, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-18 19:36:13', '2026-08-18 19:36:13');
INSERT INTO `auditoria` VALUES (207, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-18 19:36:21', '2026-08-18 19:36:21');
INSERT INTO `auditoria` VALUES (208, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-18 19:41:06', '2026-08-18 19:41:06');
INSERT INTO `auditoria` VALUES (209, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-18 19:45:53', '2026-08-18 19:45:53');
INSERT INTO `auditoria` VALUES (210, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 12:49:24', '2026-08-21 12:49:24');
INSERT INTO `auditoria` VALUES (211, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 12:49:33', '2026-08-21 12:49:33');
INSERT INTO `auditoria` VALUES (212, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 13:34:23', '2026-08-21 13:34:23');
INSERT INTO `auditoria` VALUES (213, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 15:36:14', '2026-08-21 15:36:14');
INSERT INTO `auditoria` VALUES (214, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 15:40:17', '2026-08-21 15:40:17');
INSERT INTO `auditoria` VALUES (215, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 15:40:34', '2026-08-21 15:40:34');
INSERT INTO `auditoria` VALUES (216, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 15:40:58', '2026-08-21 15:40:58');
INSERT INTO `auditoria` VALUES (217, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 15:42:41', '2026-08-21 15:42:41');
INSERT INTO `auditoria` VALUES (218, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 20:32:19', '2026-08-21 20:32:19');
INSERT INTO `auditoria` VALUES (219, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 21:47:54', '2026-08-21 21:47:54');
INSERT INTO `auditoria` VALUES (220, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-21 21:54:51', '2026-08-21 21:54:51');
INSERT INTO `auditoria` VALUES (221, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-22 00:06:33', '2026-08-22 00:06:33');
INSERT INTO `auditoria` VALUES (222, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-22 14:00:20', '2026-08-22 14:00:20');
INSERT INTO `auditoria` VALUES (223, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-23 12:22:23', '2026-08-23 12:22:23');
INSERT INTO `auditoria` VALUES (224, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-23 16:17:54', '2026-08-23 16:17:54');
INSERT INTO `auditoria` VALUES (225, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-23 16:23:10', '2026-08-23 16:23:10');
INSERT INTO `auditoria` VALUES (226, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-23 19:01:58', '2026-08-23 19:01:58');
INSERT INTO `auditoria` VALUES (227, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-23 19:04:03', '2026-08-23 19:04:03');
INSERT INTO `auditoria` VALUES (228, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-23 19:14:06', '2026-08-23 19:14:06');
INSERT INTO `auditoria` VALUES (229, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-25 20:09:04', '2026-08-25 20:09:04');
INSERT INTO `auditoria` VALUES (230, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-30 21:11:04', '2026-08-30 21:11:04');
INSERT INTO `auditoria` VALUES (231, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-30 21:11:33', '2026-08-30 21:11:33');
INSERT INTO `auditoria` VALUES (232, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-30 21:12:15', '2026-08-30 21:12:15');
INSERT INTO `auditoria` VALUES (233, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-30 21:26:34', '2026-08-30 21:26:34');
INSERT INTO `auditoria` VALUES (234, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-08-30 21:26:46', '2026-08-30 21:26:46');
INSERT INTO `auditoria` VALUES (235, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-02 15:20:50', '2026-09-02 15:20:50');
INSERT INTO `auditoria` VALUES (236, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-02 15:25:51', '2026-09-02 15:25:51');
INSERT INTO `auditoria` VALUES (237, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-02 16:02:49', '2026-09-02 16:02:49');
INSERT INTO `auditoria` VALUES (238, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-02 16:03:08', '2026-09-02 16:03:08');
INSERT INTO `auditoria` VALUES (239, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-04 23:35:41', '2026-09-04 23:35:41');
INSERT INTO `auditoria` VALUES (240, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-04 23:49:46', '2026-09-04 23:49:46');
INSERT INTO `auditoria` VALUES (241, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-04 23:50:13', '2026-09-04 23:50:13');
INSERT INTO `auditoria` VALUES (242, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-05 00:48:42', '2026-09-05 00:48:42');
INSERT INTO `auditoria` VALUES (243, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-05 09:21:33', '2026-09-05 09:21:33');
INSERT INTO `auditoria` VALUES (244, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-05 09:23:23', '2026-09-05 09:23:23');
INSERT INTO `auditoria` VALUES (245, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-05 09:25:36', '2026-09-05 09:25:36');
INSERT INTO `auditoria` VALUES (246, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-05 09:59:45', '2026-09-05 09:59:45');
INSERT INTO `auditoria` VALUES (247, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 15:38:46', '2026-09-06 15:38:46');
INSERT INTO `auditoria` VALUES (248, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 16:14:06', '2026-09-06 16:14:06');
INSERT INTO `auditoria` VALUES (249, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:20:02', '2026-09-06 17:20:02');
INSERT INTO `auditoria` VALUES (250, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:20:53', '2026-09-06 17:20:53');
INSERT INTO `auditoria` VALUES (251, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:21:06', '2026-09-06 17:21:06');
INSERT INTO `auditoria` VALUES (252, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:21:25', '2026-09-06 17:21:25');
INSERT INTO `auditoria` VALUES (253, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:22:27', '2026-09-06 17:22:27');
INSERT INTO `auditoria` VALUES (254, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:22:47', '2026-09-06 17:22:47');
INSERT INTO `auditoria` VALUES (255, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:23:39', '2026-09-06 17:23:39');
INSERT INTO `auditoria` VALUES (256, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:24:05', '2026-09-06 17:24:05');
INSERT INTO `auditoria` VALUES (257, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:24:26', '2026-09-06 17:24:26');
INSERT INTO `auditoria` VALUES (258, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:24:51', '2026-09-06 17:24:51');
INSERT INTO `auditoria` VALUES (259, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:26:37', '2026-09-06 17:26:37');
INSERT INTO `auditoria` VALUES (260, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-06 17:27:15', '2026-09-06 17:27:15');
INSERT INTO `auditoria` VALUES (261, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-07 21:43:04', '2026-09-07 21:43:04');
INSERT INTO `auditoria` VALUES (262, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-07 22:30:47', '2026-09-07 22:30:47');
INSERT INTO `auditoria` VALUES (263, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-07 22:31:40', '2026-09-07 22:31:40');
INSERT INTO `auditoria` VALUES (264, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-07 23:00:13', '2026-09-07 23:00:13');
INSERT INTO `auditoria` VALUES (265, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-07 23:02:09', '2026-09-07 23:02:09');
INSERT INTO `auditoria` VALUES (266, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-08 17:32:10', '2026-09-08 17:32:10');
INSERT INTO `auditoria` VALUES (267, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-08 17:34:12', '2026-09-08 17:34:12');
INSERT INTO `auditoria` VALUES (268, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-08 20:07:29', '2026-09-08 20:07:29');
INSERT INTO `auditoria` VALUES (269, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-08 22:29:30', '2026-09-08 22:29:30');
INSERT INTO `auditoria` VALUES (270, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-08 22:48:56', '2026-09-08 22:48:56');
INSERT INTO `auditoria` VALUES (271, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-08 23:59:40', '2026-09-08 23:59:40');
INSERT INTO `auditoria` VALUES (272, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:01:07', '2026-09-09 00:01:07');
INSERT INTO `auditoria` VALUES (273, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:08:26', '2026-09-09 00:08:26');
INSERT INTO `auditoria` VALUES (274, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:43:20', '2026-09-09 00:43:20');
INSERT INTO `auditoria` VALUES (275, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:44:33', '2026-09-09 00:44:33');
INSERT INTO `auditoria` VALUES (276, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:45:12', '2026-09-09 00:45:12');
INSERT INTO `auditoria` VALUES (277, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:46:16', '2026-09-09 00:46:16');
INSERT INTO `auditoria` VALUES (278, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:46:58', '2026-09-09 00:46:58');
INSERT INTO `auditoria` VALUES (279, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:49:38', '2026-09-09 00:49:38');
INSERT INTO `auditoria` VALUES (280, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:50:12', '2026-09-09 00:50:12');
INSERT INTO `auditoria` VALUES (281, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:50:57', '2026-09-09 00:50:57');
INSERT INTO `auditoria` VALUES (282, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:51:22', '2026-09-09 00:51:22');
INSERT INTO `auditoria` VALUES (283, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:52:09', '2026-09-09 00:52:09');
INSERT INTO `auditoria` VALUES (284, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 00:52:13', '2026-09-09 00:52:13');
INSERT INTO `auditoria` VALUES (285, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 09:06:21', '2026-09-09 09:06:21');
INSERT INTO `auditoria` VALUES (286, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 09:06:47', '2026-09-09 09:06:47');
INSERT INTO `auditoria` VALUES (287, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 09:26:10', '2026-09-09 09:26:10');
INSERT INTO `auditoria` VALUES (288, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 09:26:44', '2026-09-09 09:26:44');
INSERT INTO `auditoria` VALUES (289, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 09:27:34', '2026-09-09 09:27:34');
INSERT INTO `auditoria` VALUES (290, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 10:01:27', '2026-09-09 10:01:27');
INSERT INTO `auditoria` VALUES (291, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-09 10:01:40', '2026-09-09 10:01:40');
INSERT INTO `auditoria` VALUES (292, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 00:18:17', '2026-09-11 00:18:17');
INSERT INTO `auditoria` VALUES (293, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 00:18:17', '2026-09-11 00:18:17');
INSERT INTO `auditoria` VALUES (294, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 00:19:22', '2026-09-11 00:19:22');
INSERT INTO `auditoria` VALUES (295, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 00:19:41', '2026-09-11 00:19:41');
INSERT INTO `auditoria` VALUES (296, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 10:35:44', '2026-09-11 10:35:44');
INSERT INTO `auditoria` VALUES (297, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 10:36:52', '2026-09-11 10:36:52');
INSERT INTO `auditoria` VALUES (298, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 10:37:44', '2026-09-11 10:37:44');
INSERT INTO `auditoria` VALUES (299, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 10:39:35', '2026-09-11 10:39:35');
INSERT INTO `auditoria` VALUES (300, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 10:41:44', '2026-09-11 10:41:44');
INSERT INTO `auditoria` VALUES (301, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 10:41:58', '2026-09-11 10:41:58');
INSERT INTO `auditoria` VALUES (302, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 10:47:25', '2026-09-11 10:47:25');
INSERT INTO `auditoria` VALUES (303, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 10:47:47', '2026-09-11 10:47:47');
INSERT INTO `auditoria` VALUES (304, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 10:58:39', '2026-09-11 10:58:39');
INSERT INTO `auditoria` VALUES (305, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 19:27:14', '2026-09-11 19:27:14');
INSERT INTO `auditoria` VALUES (306, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 19:30:05', '2026-09-11 19:30:05');
INSERT INTO `auditoria` VALUES (307, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 19:30:32', '2026-09-11 19:30:32');
INSERT INTO `auditoria` VALUES (308, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 19:30:54', '2026-09-11 19:30:54');
INSERT INTO `auditoria` VALUES (309, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 19:31:15', '2026-09-11 19:31:15');
INSERT INTO `auditoria` VALUES (310, 'ENC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 19:31:43', '2026-09-11 19:31:43');
INSERT INTO `auditoria` VALUES (311, 'Sistema', 'Crear', 'Nuevo aspirante registrado: Joshua Felix Bonilla Hernandez (ID: 26)', '::1', '2026-09-11 20:35:49', '2026-09-11 20:35:49');
INSERT INTO `auditoria` VALUES (312, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 20:35:57', '2026-09-11 20:35:57');
INSERT INTO `auditoria` VALUES (313, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 20:36:09', '2026-09-11 20:36:09');
INSERT INTO `auditoria` VALUES (314, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 20:36:29', '2026-09-11 20:36:29');
INSERT INTO `auditoria` VALUES (315, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 20:36:38', '2026-09-11 20:36:38');
INSERT INTO `auditoria` VALUES (316, 'ENC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 20:36:52', '2026-09-11 20:36:52');
INSERT INTO `auditoria` VALUES (317, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-11 20:36:59', '2026-09-11 20:36:59');
INSERT INTO `auditoria` VALUES (318, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 13:33:44', '2026-09-12 13:33:44');
INSERT INTO `auditoria` VALUES (319, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 13:33:44', '2026-09-12 13:33:44');
INSERT INTO `auditoria` VALUES (320, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 13:34:21', '2026-09-12 13:34:21');
INSERT INTO `auditoria` VALUES (321, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 13:34:39', '2026-09-12 13:34:39');
INSERT INTO `auditoria` VALUES (322, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 14:19:35', '2026-09-12 14:19:35');
INSERT INTO `auditoria` VALUES (323, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 15:02:58', '2026-09-12 15:02:58');
INSERT INTO `auditoria` VALUES (324, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 15:14:54', '2026-09-12 15:14:54');
INSERT INTO `auditoria` VALUES (325, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 15:15:14', '2026-09-12 15:15:14');
INSERT INTO `auditoria` VALUES (326, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 15:16:00', '2026-09-12 15:16:00');
INSERT INTO `auditoria` VALUES (327, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 15:49:02', '2026-09-12 15:49:02');
INSERT INTO `auditoria` VALUES (328, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:11:09', '2026-09-12 16:11:09');
INSERT INTO `auditoria` VALUES (329, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:11:44', '2026-09-12 16:11:44');
INSERT INTO `auditoria` VALUES (330, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:17:03', '2026-09-12 16:17:03');
INSERT INTO `auditoria` VALUES (331, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:18:06', '2026-09-12 16:18:06');
INSERT INTO `auditoria` VALUES (332, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:19:19', '2026-09-12 16:19:19');
INSERT INTO `auditoria` VALUES (333, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:28:25', '2026-09-12 16:28:25');
INSERT INTO `auditoria` VALUES (334, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:28:43', '2026-09-12 16:28:43');
INSERT INTO `auditoria` VALUES (335, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:28:47', '2026-09-12 16:28:47');
INSERT INTO `auditoria` VALUES (336, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:29:17', '2026-09-12 16:29:17');
INSERT INTO `auditoria` VALUES (337, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:29:36', '2026-09-12 16:29:36');
INSERT INTO `auditoria` VALUES (338, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:32:47', '2026-09-12 16:32:47');
INSERT INTO `auditoria` VALUES (339, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:33:06', '2026-09-12 16:33:06');
INSERT INTO `auditoria` VALUES (340, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:36:26', '2026-09-12 16:36:26');
INSERT INTO `auditoria` VALUES (341, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:37:01', '2026-09-12 16:37:01');
INSERT INTO `auditoria` VALUES (342, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:37:28', '2026-09-12 16:37:28');
INSERT INTO `auditoria` VALUES (343, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:38:52', '2026-09-12 16:38:52');
INSERT INTO `auditoria` VALUES (344, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:39:38', '2026-09-12 16:39:38');
INSERT INTO `auditoria` VALUES (345, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:40:01', '2026-09-12 16:40:01');
INSERT INTO `auditoria` VALUES (346, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:40:12', '2026-09-12 16:40:12');
INSERT INTO `auditoria` VALUES (347, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-12 16:40:31', '2026-09-12 16:40:31');
INSERT INTO `auditoria` VALUES (348, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-13 09:08:06', '2026-09-13 09:08:06');
INSERT INTO `auditoria` VALUES (349, 'Sistema', 'Crear', 'Nuevo aspirante registrado: prueba5 prueba5 (ID: 27)', '::1', '2026-09-16 21:11:53', '2026-09-16 21:11:53');
INSERT INTO `auditoria` VALUES (350, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 21:12:03', '2026-09-16 21:12:03');
INSERT INTO `auditoria` VALUES (351, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante prueba5 prueba5: 10', '::1', '2026-09-16 21:12:13', '2026-09-16 21:12:13');
INSERT INTO `auditoria` VALUES (352, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 21:12:21', '2026-09-16 21:12:21');
INSERT INTO `auditoria` VALUES (353, 'Registro Academico', 'Actualizar', 'Aspirante prueba5 prueba5 actualizado (ID: 27)', '::1', '2026-09-16 21:13:06', '2026-09-16 21:13:06');
INSERT INTO `auditoria` VALUES (354, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 21:13:22', '2026-09-16 21:13:22');
INSERT INTO `auditoria` VALUES (355, 'Direccion', 'Aprobar', 'Aspirante prueba5 prueba5 aprobado y asignado a la clase Segundo Año - Bachillerato General - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-09-16 21:13:33', '2026-09-16 21:13:33');
INSERT INTO `auditoria` VALUES (356, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 21:13:41', '2026-09-16 21:13:41');
INSERT INTO `auditoria` VALUES (357, 'Registro Academico', 'Matricular', 'Matrícula aceptada por Registro Academico el 16/09/2026 21:14. Aspirante prueba5 prueba5 matriculado como estudiante (ID: 36, código 2026-00036-INA) en la clase Segundo Año - Bachillerato General - Seccion A', '::1', '2026-09-16 21:14:10', '2026-09-16 21:14:10');
INSERT INTO `auditoria` VALUES (358, 'Registro Academico', 'CorreoActivacion', 'Correo de activación enviado a 19931516@clases.edu.sv (automático)', '::1', '2026-09-16 21:14:10', '2026-09-16 21:14:10');
INSERT INTO `auditoria` VALUES (359, 'Sistema', 'EmailError', 'Error al enviar correo a 19931516@clases.edu.sv: 535: 5.7.8 Username and Password not accepted. For more information, go to
5.7.8  https://support.google.com/mail/?p=BadCredentials 71dfb90a1353d-5c9a5357472sm1640713e0c.3 - gsmtp', '0.0.0.0', '2026-09-16 21:14:12', '2026-09-16 21:14:12');
INSERT INTO `auditoria` VALUES (360, 'Registro Academico', 'Actualizar', 'Aspirante prueba5 prueba5 actualizado (ID: 27)', '::1', '2026-09-16 21:16:56', '2026-09-16 21:16:56');
INSERT INTO `auditoria` VALUES (361, 'REG001', 'MarcarEsperaActivacion', 'Estudiante marcado en espera de activación (comentario: prueba)', '::1', '2026-09-16 21:17:21', '2026-09-16 21:17:21');
INSERT INTO `auditoria` VALUES (362, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:01:44', '2026-09-16 23:01:44');
INSERT INTO `auditoria` VALUES (363, 'Sistema', 'Crear', 'Nuevo aspirante registrado: prueba6 prueba6 (ID: 28)', '::1', '2026-09-16 23:03:51', '2026-09-16 23:03:51');
INSERT INTO `auditoria` VALUES (364, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:03:55', '2026-09-16 23:03:55');
INSERT INTO `auditoria` VALUES (365, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante prueba6 prueba6: 10', '::1', '2026-09-16 23:04:05', '2026-09-16 23:04:05');
INSERT INTO `auditoria` VALUES (366, 'Direccion', 'Aprobar', 'Aspirante prueba6 prueba6 aprobado y asignado a la clase Segundo Año - Bachillerato General - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-09-16 23:04:13', '2026-09-16 23:04:13');
INSERT INTO `auditoria` VALUES (367, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:04:17', '2026-09-16 23:04:17');
INSERT INTO `auditoria` VALUES (368, 'Registro Academico', 'Matricular', 'Matrícula aceptada por Registro Academico el 16/09/2026 23:04. Aspirante prueba6 prueba6 matriculado como estudiante (ID: 37, código 2026-00037-INA) en la clase Segundo Año - Bachillerato General - Seccion A', '::1', '2026-09-16 23:04:29', '2026-09-16 23:04:29');
INSERT INTO `auditoria` VALUES (369, 'Registro Academico', 'CorreoActivacion', 'Correo de activación enviado a jefferaguiirre@gmail.com (automático)', '::1', '2026-09-16 23:04:29', '2026-09-16 23:04:29');
INSERT INTO `auditoria` VALUES (370, 'Sistema', 'EmailEnviado', 'Correo enviado a jefferaguiirre@gmail.com', '0.0.0.0', '2026-09-16 23:04:33', '2026-09-16 23:04:33');
INSERT INTO `auditoria` VALUES (371, '2026-00037-INA', 'ActivacionCuenta', 'Cuenta activada por el estudiante (IP: ::1)', '::1', '2026-09-16 23:07:03', '2026-09-16 23:07:03');
INSERT INTO `auditoria` VALUES (372, '2026-00037-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:07:33', '2026-09-16 23:07:33');
INSERT INTO `auditoria` VALUES (373, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:11:40', '2026-09-16 23:11:40');
INSERT INTO `auditoria` VALUES (374, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:12:30', '2026-09-16 23:12:30');
INSERT INTO `auditoria` VALUES (375, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:15:46', '2026-09-16 23:15:46');
INSERT INTO `auditoria` VALUES (376, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:40:25', '2026-09-16 23:40:25');
INSERT INTO `auditoria` VALUES (377, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Joshua Felix Bonilla Hernandez: 10', '::1', '2026-09-16 23:40:37', '2026-09-16 23:40:37');
INSERT INTO `auditoria` VALUES (378, 'Direccion', 'Aprobar', 'Aspirante Joshua Felix Bonilla Hernandez aprobado y asignado a la clase Primer Año - Tecnico Vocacional en Administrativo Contable - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-09-16 23:40:44', '2026-09-16 23:40:44');
INSERT INTO `auditoria` VALUES (379, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Ian Andrew Bonilla Hernandez: 10', '::1', '2026-09-16 23:42:14', '2026-09-16 23:42:14');
INSERT INTO `auditoria` VALUES (380, 'Direccion', 'Aprobar', 'Aspirante Ian Andrew Bonilla Hernandez aprobado y asignado a la clase Primer Año - Tecnico Vocacional en Administrativo Contable - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-09-16 23:42:22', '2026-09-16 23:42:22');
INSERT INTO `auditoria` VALUES (381, 'Sistema', 'Crear', 'Nuevo aspirante registrado: Joshua Felix Hernández Perez (ID: 29)', '::1', '2026-09-16 23:44:05', '2026-09-16 23:44:05');
INSERT INTO `auditoria` VALUES (382, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:44:09', '2026-09-16 23:44:09');
INSERT INTO `auditoria` VALUES (383, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Joshua Felix Hernández Perez: 10', '::1', '2026-09-16 23:44:21', '2026-09-16 23:44:21');
INSERT INTO `auditoria` VALUES (384, 'Direccion', 'Aprobar', 'Aspirante Joshua Felix Hernández Perez aprobado y asignado a la clase Tercer Año - Tecnico Vocacional en Desarrollo de Software - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-09-16 23:44:26', '2026-09-16 23:44:26');
INSERT INTO `auditoria` VALUES (385, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:44:32', '2026-09-16 23:44:32');
INSERT INTO `auditoria` VALUES (386, 'Registro Academico', 'Matricular', 'Matrícula aceptada por Registro Academico el 16/09/2026 23:44. Aspirante Joshua Felix Hernández Perez matriculado como estudiante (ID: 38, código 2026-00038-INA) en la clase Tercer Año - Tecnico Vocacional en Desarrollo de Software - Seccion A', '::1', '2026-09-16 23:44:47', '2026-09-16 23:44:47');
INSERT INTO `auditoria` VALUES (387, 'Registro Academico', 'CorreoActivacion', 'Correo de activación enviado a josesitoxd504@gmail.com (automático)', '::1', '2026-09-16 23:44:47', '2026-09-16 23:44:47');
INSERT INTO `auditoria` VALUES (388, 'Sistema', 'EmailEnviado', 'Correo enviado a josesitoxd504@gmail.com', '0.0.0.0', '2026-09-16 23:45:01', '2026-09-16 23:45:01');
INSERT INTO `auditoria` VALUES (389, 'Registro Academico', 'Matricular', 'Matrícula aceptada por Registro Academico el 16/09/2026 23:45. Aspirante Joshua Felix Bonilla Hernandez matriculado como estudiante (ID: 39, código 2026-00039-INA) en la clase Primer Año - Tecnico Vocacional en Administrativo Contable - Seccion A', '::1', '2026-09-16 23:45:04', '2026-09-16 23:45:04');
INSERT INTO `auditoria` VALUES (390, 'Registro Academico', 'CorreoActivacion', 'Correo de activación enviado a joshua19morao@gmail.com (automático)', '::1', '2026-09-16 23:45:04', '2026-09-16 23:45:04');
INSERT INTO `auditoria` VALUES (391, 'Sistema', 'EmailEnviado', 'Correo enviado a joshua19morao@gmail.com', '0.0.0.0', '2026-09-16 23:45:10', '2026-09-16 23:45:10');
INSERT INTO `auditoria` VALUES (392, 'ENC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:47:41', '2026-09-16 23:47:41');
INSERT INTO `auditoria` VALUES (393, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-16 23:49:00', '2026-09-16 23:49:00');
INSERT INTO `auditoria` VALUES (394, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 10:39:28', '2026-09-17 10:39:28');
INSERT INTO `auditoria` VALUES (395, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 10:40:03', '2026-09-17 10:40:03');
INSERT INTO `auditoria` VALUES (396, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:05:26', '2026-09-17 11:05:26');
INSERT INTO `auditoria` VALUES (397, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:19:59', '2026-09-17 11:19:59');
INSERT INTO `auditoria` VALUES (398, 'Sistema', 'Crear', 'Nuevo aspirante registrado: ghfgjhgjg dgdghfhfg (ID: 30)', '::1', '2026-09-17 11:23:36', '2026-09-17 11:23:36');
INSERT INTO `auditoria` VALUES (399, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:23:43', '2026-09-17 11:23:43');
INSERT INTO `auditoria` VALUES (400, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante ghfgjhgjg dgdghfhfg: 10', '::1', '2026-09-17 11:24:00', '2026-09-17 11:24:00');
INSERT INTO `auditoria` VALUES (401, 'Direccion', 'Aprobar', 'Aspirante ghfgjhgjg dgdghfhfg aprobado y asignado a la clase Segundo Año - Bachillerato General - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-09-17 11:25:20', '2026-09-17 11:25:20');
INSERT INTO `auditoria` VALUES (402, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:25:27', '2026-09-17 11:25:27');
INSERT INTO `auditoria` VALUES (403, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:29:53', '2026-09-17 11:29:53');
INSERT INTO `auditoria` VALUES (404, 'Registro Academico', 'Matricular', 'Matrícula aceptada por Registro Academico el 17/09/2026 11:31. Aspirante ghfgjhgjg dgdghfhfg matriculado como estudiante (ID: 40, código 2026-00040-INA) en la clase Segundo Año - Bachillerato General - Seccion A', '::1', '2026-09-17 11:31:20', '2026-09-17 11:31:20');
INSERT INTO `auditoria` VALUES (405, 'Registro Academico', 'CorreoActivacion', 'Correo de activación enviado a eswampy29naranja@gmail.com (automático)', '::1', '2026-09-17 11:31:20', '2026-09-17 11:31:20');
INSERT INTO `auditoria` VALUES (406, 'Sistema', 'EmailEnviado', 'Correo enviado a eswampy29naranja@gmail.com', '0.0.0.0', '2026-09-17 11:31:24', '2026-09-17 11:31:24');
INSERT INTO `auditoria` VALUES (407, '2026-00040-INA', 'ActivacionCuenta', 'Cuenta activada por el estudiante (IP: ::1)', '::1', '2026-09-17 11:32:36', '2026-09-17 11:32:36');
INSERT INTO `auditoria` VALUES (408, '2026-00040-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:32:57', '2026-09-17 11:32:57');
INSERT INTO `auditoria` VALUES (409, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:33:38', '2026-09-17 11:33:38');
INSERT INTO `auditoria` VALUES (410, '2026-00040-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:34:13', '2026-09-17 11:34:13');
INSERT INTO `auditoria` VALUES (411, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:40:28', '2026-09-17 11:40:28');
INSERT INTO `auditoria` VALUES (412, 'DOC001', 'Registrar asistencia', 'Estudiante 40 - Presente - Clase 2 - Hora 11:40:47', '::1', '2026-09-17 11:40:48', '2026-09-17 11:40:48');
INSERT INTO `auditoria` VALUES (413, '2026-00040-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:40:55', '2026-09-17 11:40:55');
INSERT INTO `auditoria` VALUES (414, 'ENC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:41:13', '2026-09-17 11:41:13');
INSERT INTO `auditoria` VALUES (415, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:42:14', '2026-09-17 11:42:14');
INSERT INTO `auditoria` VALUES (416, 'DOC001', 'Registrar asistencia', 'Estudiante 1 - Presente - Clase 1 - Hora 11:42:35', '::1', '2026-09-17 11:42:35', '2026-09-17 11:42:35');
INSERT INTO `auditoria` VALUES (417, 'ENC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:42:46', '2026-09-17 11:42:46');
INSERT INTO `auditoria` VALUES (418, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:43:39', '2026-09-17 11:43:39');
INSERT INTO `auditoria` VALUES (419, 'DOC001', 'Registrar asistencia', 'Estudiante 2 - Presente - Clase 3 - Hora 11:43:47', '::1', '2026-09-17 11:43:47', '2026-09-17 11:43:47');
INSERT INTO `auditoria` VALUES (420, 'ENC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:43:52', '2026-09-17 11:43:52');
INSERT INTO `auditoria` VALUES (421, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:47:47', '2026-09-17 11:47:47');
INSERT INTO `auditoria` VALUES (422, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:47:53', '2026-09-17 11:47:53');
INSERT INTO `auditoria` VALUES (423, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:48:14', '2026-09-17 11:48:14');
INSERT INTO `auditoria` VALUES (424, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:52:51', '2026-09-17 11:52:51');
INSERT INTO `auditoria` VALUES (425, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-17 11:52:58', '2026-09-17 11:52:58');
INSERT INTO `auditoria` VALUES (426, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:12:35', '2026-09-19 11:12:35');
INSERT INTO `auditoria` VALUES (427, 'DIR001', 'ReenviarActivacion', 'Correo de activación reenviado a joshua19morao@gmail.com', '::1', '2026-09-19 11:20:07', '2026-09-19 11:20:07');
INSERT INTO `auditoria` VALUES (428, 'DIR001', 'ReenviarActivacion', 'Correo de activación reenviado a 19931516@clases.edu.sv', '::1', '2026-09-19 11:20:11', '2026-09-19 11:20:11');
INSERT INTO `auditoria` VALUES (429, 'Sistema', 'EmailEnviado', 'Correo enviado a joshua19morao@gmail.com', '0.0.0.0', '2026-09-19 11:20:12', '2026-09-19 11:20:12');
INSERT INTO `auditoria` VALUES (430, 'DIR001', 'ReenviarActivacion', 'Correo de activación reenviado a josesitoxd504@gmail.com', '::1', '2026-09-19 11:20:12', '2026-09-19 11:20:12');
INSERT INTO `auditoria` VALUES (431, 'Sistema', 'EmailEnviado', 'Correo enviado a 19931516@clases.edu.sv', '0.0.0.0', '2026-09-19 11:20:15', '2026-09-19 11:20:15');
INSERT INTO `auditoria` VALUES (432, 'Sistema', 'EmailEnviado', 'Correo enviado a josesitoxd504@gmail.com', '0.0.0.0', '2026-09-19 11:20:16', '2026-09-19 11:20:16');
INSERT INTO `auditoria` VALUES (433, 'DIR001', 'ActivacionPresencial', 'Cuenta activada presencialmente por DIR001', '::1', '2026-09-19 11:20:48', '2026-09-19 11:20:48');
INSERT INTO `auditoria` VALUES (434, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:23:17', '2026-09-19 11:23:17');
INSERT INTO `auditoria` VALUES (435, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:24:03', '2026-09-19 11:24:03');
INSERT INTO `auditoria` VALUES (436, '2026-00039-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:25:08', '2026-09-19 11:25:08');
INSERT INTO `auditoria` VALUES (437, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:25:59', '2026-09-19 11:25:59');
INSERT INTO `auditoria` VALUES (438, '2026-00039-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:33:21', '2026-09-19 11:33:21');
INSERT INTO `auditoria` VALUES (439, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:33:54', '2026-09-19 11:33:54');
INSERT INTO `auditoria` VALUES (440, 'Sistema', 'Crear', 'Nuevo aspirante registrado: Ronald Ernesto  Pérez Argueta (ID: 31)', '::1', '2026-09-19 11:42:16', '2026-09-19 11:42:16');
INSERT INTO `auditoria` VALUES (441, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:43:07', '2026-09-19 11:43:07');
INSERT INTO `auditoria` VALUES (442, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:43:57', '2026-09-19 11:43:57');
INSERT INTO `auditoria` VALUES (443, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:44:12', '2026-09-19 11:44:12');
INSERT INTO `auditoria` VALUES (444, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante Ronald Ernesto  Pérez Argueta: 10', '::1', '2026-09-19 11:44:19', '2026-09-19 11:44:19');
INSERT INTO `auditoria` VALUES (445, 'Direccion', 'Aprobar', 'Aspirante Ronald Ernesto  Pérez Argueta aprobado y asignado a la clase Primer Año - Tecnico Vocacional en Administrativo Contable - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-09-19 11:44:26', '2026-09-19 11:44:26');
INSERT INTO `auditoria` VALUES (446, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 11:44:31', '2026-09-19 11:44:31');
INSERT INTO `auditoria` VALUES (447, 'Registro Academico', 'Matricular', 'Matrícula aceptada por Registro Academico el 19/09/2026 11:44. Aspirante Ronald Ernesto  Pérez Argueta matriculado como estudiante (ID: 41, código 2026-00041-INA) en la clase Primer Año - Tecnico Vocacional en Administrativo Contable - Seccion A', '::1', '2026-09-19 11:44:56', '2026-09-19 11:44:56');
INSERT INTO `auditoria` VALUES (448, 'Registro Academico', 'CorreoActivacion', 'Correo de activación enviado a eswampy32morado@gmail.com (automático)', '::1', '2026-09-19 11:44:56', '2026-09-19 11:44:56');
INSERT INTO `auditoria` VALUES (449, 'Sistema', 'EmailEnviado', 'Correo enviado a eswampy32morado@gmail.com', '0.0.0.0', '2026-09-19 11:44:58', '2026-09-19 11:44:58');
INSERT INTO `auditoria` VALUES (450, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 12:03:39', '2026-09-19 12:03:39');
INSERT INTO `auditoria` VALUES (451, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 14:54:03', '2026-09-19 14:54:03');
INSERT INTO `auditoria` VALUES (452, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:08:53', '2026-09-19 17:08:53');
INSERT INTO `auditoria` VALUES (453, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:09:10', '2026-09-19 17:09:10');
INSERT INTO `auditoria` VALUES (454, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:09:33', '2026-09-19 17:09:33');
INSERT INTO `auditoria` VALUES (455, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:14:15', '2026-09-19 17:14:15');
INSERT INTO `auditoria` VALUES (456, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:14:50', '2026-09-19 17:14:50');
INSERT INTO `auditoria` VALUES (457, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:15:06', '2026-09-19 17:15:06');
INSERT INTO `auditoria` VALUES (458, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:16:40', '2026-09-19 17:16:40');
INSERT INTO `auditoria` VALUES (459, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:21:46', '2026-09-19 17:21:46');
INSERT INTO `auditoria` VALUES (460, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:23:25', '2026-09-19 17:23:25');
INSERT INTO `auditoria` VALUES (461, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:24:29', '2026-09-19 17:24:29');
INSERT INTO `auditoria` VALUES (462, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:24:58', '2026-09-19 17:24:58');
INSERT INTO `auditoria` VALUES (463, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 17:28:11', '2026-09-19 17:28:11');
INSERT INTO `auditoria` VALUES (464, 'DIR001', 'Registrar asistencia', 'Estudiante 40 - Presente - Clase 2 - Hora 17:54:45', '::1', '2026-09-19 17:54:46', '2026-09-19 17:54:46');
INSERT INTO `auditoria` VALUES (465, 'DIR001', 'Registrar asistencia', 'Estudiante 37 - Presente - Clase 2 - Hora 17:54:45', '::1', '2026-09-19 17:54:46', '2026-09-19 17:54:46');
INSERT INTO `auditoria` VALUES (466, 'DIR001', 'Registrar asistencia', 'Estudiante 10 - Presente - Clase 2 - Hora 17:54:45', '::1', '2026-09-19 17:54:46', '2026-09-19 17:54:46');
INSERT INTO `auditoria` VALUES (467, 'DIR001', 'Registrar asistencia', 'Estudiante 9 - Presente - Clase 2 - Hora 17:54:45', '::1', '2026-09-19 17:54:46', '2026-09-19 17:54:46');
INSERT INTO `auditoria` VALUES (468, 'DIR001', 'Registrar asistencia', 'Estudiante 36 - Presente - Clase 2 - Hora 17:54:45', '::1', '2026-09-19 17:54:46', '2026-09-19 17:54:46');
INSERT INTO `auditoria` VALUES (469, 'DIR001', 'Cambiar Calificación de Conducta', 'Estudiante 2026-00040-INA (ghfgjhgjg dgdghfhfg), periodo ''I Periodo'' 2026: calificación ''Sin asignar'' -> ''Muy Bueno''. Motivo: Prueba', '::1', '2026-09-19 17:57:37', '2026-09-19 17:57:37');
INSERT INTO `auditoria` VALUES (470, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 18:13:49', '2026-09-19 18:13:49');
INSERT INTO `auditoria` VALUES (471, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 18:18:14', '2026-09-19 18:18:14');
INSERT INTO `auditoria` VALUES (472, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 18:25:52', '2026-09-19 18:25:52');
INSERT INTO `auditoria` VALUES (473, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 19:38:50', '2026-09-19 19:38:50');
INSERT INTO `auditoria` VALUES (474, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 19:58:45', '2026-09-19 19:58:45');
INSERT INTO `auditoria` VALUES (475, '2026-00040-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 20:48:42', '2026-09-19 20:48:42');
INSERT INTO `auditoria` VALUES (476, 'ENC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 20:56:49', '2026-09-19 20:56:49');
INSERT INTO `auditoria` VALUES (477, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-19 20:58:41', '2026-09-19 20:58:41');
INSERT INTO `auditoria` VALUES (478, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-20 21:44:38', '2026-09-20 21:44:38');
INSERT INTO `auditoria` VALUES (479, 'Registro Academico', 'Actualizar', 'Aspirante   actualizado (ID: 13)', '::1', '2026-09-20 22:16:45', '2026-09-20 22:16:45');
INSERT INTO `auditoria` VALUES (480, 'Direccion', 'Actualizar', 'Aspirante   puesto en lista de espera', '::1', '2026-09-20 22:16:55', '2026-09-20 22:16:55');
INSERT INTO `auditoria` VALUES (481, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-20 22:18:01', '2026-09-20 22:18:01');
INSERT INTO `auditoria` VALUES (482, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-20 22:36:52', '2026-09-20 22:36:52');
INSERT INTO `auditoria` VALUES (483, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-20 22:38:38', '2026-09-20 22:38:38');
INSERT INTO `auditoria` VALUES (484, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-20 22:47:43', '2026-09-20 22:47:43');
INSERT INTO `auditoria` VALUES (485, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-21 21:56:10', '2026-09-21 21:56:10');
INSERT INTO `auditoria` VALUES (486, 'DOC001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-21 22:53:16', '2026-09-21 22:53:16');
INSERT INTO `auditoria` VALUES (487, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-21 22:55:29', '2026-09-21 22:55:29');
INSERT INTO `auditoria` VALUES (488, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-22 23:34:06', '2026-09-22 23:34:06');
INSERT INTO `auditoria` VALUES (489, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 19:47:12', '2026-09-23 19:47:12');
INSERT INTO `auditoria` VALUES (490, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 19:56:31', '2026-09-23 19:56:31');
INSERT INTO `auditoria` VALUES (491, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 20:00:19', '2026-09-23 20:00:19');
INSERT INTO `auditoria` VALUES (492, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 20:25:58', '2026-09-23 20:25:58');
INSERT INTO `auditoria` VALUES (493, 'Sistema', 'Crear', 'Nuevo aspirante registrado: svdhfh afsgsg (ID: 32)', '::1', '2026-09-23 20:51:17', '2026-09-23 20:51:17');
INSERT INTO `auditoria` VALUES (494, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 20:53:08', '2026-09-23 20:53:08');
INSERT INTO `auditoria` VALUES (495, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante svdhfh afsgsg: 10', '::1', '2026-09-23 20:53:21', '2026-09-23 20:53:21');
INSERT INTO `auditoria` VALUES (496, 'Direccion', 'Aprobar', 'Aspirante svdhfh afsgsg aprobado y asignado a la clase Primer Año - Bachillerato General - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-09-23 20:53:27', '2026-09-23 20:53:27');
INSERT INTO `auditoria` VALUES (497, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 20:53:32', '2026-09-23 20:53:32');
INSERT INTO `auditoria` VALUES (498, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 20:54:17', '2026-09-23 20:54:17');
INSERT INTO `auditoria` VALUES (499, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 20:54:33', '2026-09-23 20:54:33');
INSERT INTO `auditoria` VALUES (500, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 20:54:53', '2026-09-23 20:54:53');
INSERT INTO `auditoria` VALUES (501, 'Sistema', 'Crear', 'Nuevo aspirante registrado: prueba10 prueba10 (ID: 33)', '::1', '2026-09-23 21:11:40', '2026-09-23 21:11:40');
INSERT INTO `auditoria` VALUES (502, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 21:11:48', '2026-09-23 21:11:48');
INSERT INTO `auditoria` VALUES (503, 'Direccion', 'Actualizar', 'Nota de examen registrada para aspirante prueba10 prueba10: 9', '::1', '2026-09-23 21:11:54', '2026-09-23 21:11:54');
INSERT INTO `auditoria` VALUES (504, 'Direccion', 'Aprobar', 'Aspirante prueba10 prueba10 aprobado y asignado a la clase Primer Año - Bachillerato General - Seccion A (pendiente de matrícula por Registro Académico)', '::1', '2026-09-23 21:12:00', '2026-09-23 21:12:00');
INSERT INTO `auditoria` VALUES (505, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 21:12:05', '2026-09-23 21:12:05');
INSERT INTO `auditoria` VALUES (506, 'Registro Academico', 'Matricular', 'Matrícula aceptada por Registro Academico el 23/09/2026 21:12. Aspirante prueba10 prueba10 matriculado como estudiante (ID: 42, código 2026-00042-INA) en la clase Primer Año - Bachillerato General - Seccion A', '::1', '2026-09-23 21:12:21', '2026-09-23 21:12:21');
INSERT INTO `auditoria` VALUES (507, 'Registro Academico', 'CorreoActivacion', 'Correo de activación enviado a cuentadetrabajo123mujer@gmail.com (automático)', '::1', '2026-09-23 21:12:21', '2026-09-23 21:12:21');
INSERT INTO `auditoria` VALUES (508, 'Sistema', 'EmailEnviado', 'Correo enviado a cuentadetrabajo123mujer@gmail.com', '0.0.0.0', '2026-09-23 21:12:24', '2026-09-23 21:12:24');
INSERT INTO `auditoria` VALUES (509, 'Sistema', 'EmailEnviado', 'Correo enviado a jefferaguirrre@gmail.com', '0.0.0.0', '2026-09-23 21:12:26', '2026-09-23 21:12:26');
INSERT INTO `auditoria` VALUES (510, 'ENC-013347F4', 'ActivacionCuenta', 'Cuenta de ENCARGADO activada por jefferaguirrre@gmail.com (IP: ::1)', '::1', '2026-09-23 21:17:37', '2026-09-23 21:17:37');
INSERT INTO `auditoria` VALUES (511, 'ENC-013347F4', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 21:17:58', '2026-09-23 21:17:58');
INSERT INTO `auditoria` VALUES (512, '2026-00042-INA', 'ActivacionCuenta', 'Cuenta de ESTUDIANTE activada por 2026-00042-INA (IP: ::1)', '::1', '2026-09-23 21:20:17', '2026-09-23 21:20:17');
INSERT INTO `auditoria` VALUES (513, '2026-00042-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 21:20:43', '2026-09-23 21:20:43');
INSERT INTO `auditoria` VALUES (514, 'ENC-013347F4', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 21:21:27', '2026-09-23 21:21:27');
INSERT INTO `auditoria` VALUES (515, '2026-00042-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 21:43:02', '2026-09-23 21:43:02');
INSERT INTO `auditoria` VALUES (516, 'ENC-013347F4', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 21:43:21', '2026-09-23 21:43:21');
INSERT INTO `auditoria` VALUES (517, 'ENC-013347F4', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-23 21:53:54', '2026-09-23 21:53:54');
INSERT INTO `auditoria` VALUES (518, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: 127.0.0.1', '127.0.0.1', '2026-09-24 22:14:03', '2026-09-24 22:14:03');
INSERT INTO `auditoria` VALUES (519, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: 127.0.0.1', '127.0.0.1', '2026-09-24 22:32:25', '2026-09-24 22:32:25');
INSERT INTO `auditoria` VALUES (520, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-24 22:47:33', '2026-09-24 22:47:33');
INSERT INTO `auditoria` VALUES (521, 'ENC-013347F4', 'Login', 'Inicio de sesion exitoso desde IP: ::1', '::1', '2026-09-24 22:50:15', '2026-09-24 22:50:15');
INSERT INTO `auditoria` VALUES (522, '2026-00010-INA', 'Login', 'Inicio de sesion exitoso desde IP: 127.0.0.1', '127.0.0.1', '2026-09-24 23:05:32', '2026-09-24 23:05:32');
INSERT INTO `auditoria` VALUES (523, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: 127.0.0.1', '127.0.0.1', '2026-09-24 23:05:53', '2026-09-24 23:05:53');
INSERT INTO `auditoria` VALUES (524, 'DIR001', 'Login', 'Inicio de sesion exitoso desde IP: 127.0.0.1', '127.0.0.1', '2026-09-24 23:13:49', '2026-09-24 23:13:49');
INSERT INTO `auditoria` VALUES (525, 'REG001', 'Login', 'Inicio de sesion exitoso desde IP: 127.0.0.1', '127.0.0.1', '2026-09-24 23:17:05', '2026-09-24 23:17:05');
INSERT INTO `auditoria` VALUES (526, 'admin', 'Login', 'Inicio de sesion exitoso desde IP: 127.0.0.1', '127.0.0.1', '2026-09-24 23:20:32', '2026-09-24 23:20:32');
-- 515 fila(s) en `auditoria`

DROP TABLE IF EXISTS `auditoria_notas`;
CREATE TABLE `auditoria_notas` (
  `id_audit_nota` int AUTO_INCREMENT,
  `id_calificacion` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_docente` int NOT NULL,
  `nota_anterior` decimal(5,2),
  `nota_nueva` decimal(5,2),
  `motivo_cambio` text,
  `fecha_cambio` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_audit_nota`)
);
-- 0 fila(s) en `auditoria_notas`

DROP TABLE IF EXISTS `auditoria_recuperaciones`;
CREATE TABLE `auditoria_recuperaciones` (
  `id_audit_recuperacion` int AUTO_INCREMENT,
  `id_recuperacion` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `id_materia` int NOT NULL,
  `accion` enum('CREAR','MODIFICAR_NOTA','ELIMINAR') NOT NULL,
  `nota_anterior` decimal(5,2),
  `nota_nueva` decimal(5,2),
  `registrado_por` int NOT NULL,
  `fecha` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_audit_recuperacion`)
);
-- 0 fila(s) en `auditoria_recuperaciones`

DROP TABLE IF EXISTS `aulas`;
CREATE TABLE `aulas` (
  `id_aula` int NOT NULL,
  `id_edificio` int NOT NULL,
  `numero_aula` varchar(20) NOT NULL,
  `nivel_edificio` int DEFAULT 1,
  `capacidad` int NOT NULL DEFAULT 30,
  `tipo_aula` varchar(50) DEFAULT Aula regular,
  `turno` enum('Matutino','Vespertino','Ambos') DEFAULT Ambos,
  `estado` tinyint(1) NOT NULL DEFAULT 1
);
INSERT INTO `aulas` VALUES (1, 1, 'A-01', 1, 30, 'Aula regular', 'Matutino', 1);
INSERT INTO `aulas` VALUES (2, 1, 'A-02', 1, 30, 'Aula regular', 'Matutino', 1);
INSERT INTO `aulas` VALUES (3, 1, 'A-03', 2, 35, 'Aula regular', 'Matutino', 1);
INSERT INTO `aulas` VALUES (4, 2, 'B-01', 1, 30, 'Aula regular', 'Matutino', 1);
INSERT INTO `aulas` VALUES (5, 2, 'LAB-01', 1, 25, 'Laboratorio de Informatica', 'Matutino', 1);
INSERT INTO `aulas` VALUES (6, 2, 'LAB-02', 1, 25, 'Laboratorio de Contabilidad', 'Matutino', 1);
-- 6 fila(s) en `aulas`

DROP TABLE IF EXISTS `avisos`;
CREATE TABLE `avisos` (
  `id_aviso` int NOT NULL,
  `titulo_aviso` varchar(255) NOT NULL,
  `detalle_aviso` mediumtext NOT NULL,
  `archivo_adjunto` varchar(255),
  `fecha_publicacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  `id_admin` int,
  `modificado_por` int
);
INSERT INTO `avisos` VALUES (1, 'Inicio de Clases 2026', 'Bienvenida a toda la comunidad educativa del Instituto Nacional de Apopa. Las clases inician el 15 de enero de 2026 en horario de 7:00 a 12:00.', NULL, '2026-01-15 07:00:00', 1, NULL);
INSERT INTO `avisos` VALUES (2, 'Semana de Examenes - I Periodo', 'Los examenes del I periodo se realizaran del 2 al 6 de febrero. Estudiantes deben presentarse puntualmente con su carnet.', NULL, '2026-01-28 09:00:00', 1, NULL);
INSERT INTO `avisos` VALUES (3, 'Feriado de Semana Santa', 'Recordamos que del 29 de marzo al 4 de abril no habra clases por la celebracion de Semana Santa.', NULL, '2026-03-20 08:30:00', 1, NULL);
INSERT INTO `avisos` VALUES (4, 'Entrega de Notas I Periodo', 'Las notas del I periodo seran publicadas en el portal del estudiante a partir del 16 de marzo.', NULL, '2026-03-10 10:00:00', 1, NULL);
-- 4 fila(s) en `avisos`

DROP TABLE IF EXISTS `avisos_internos`;
CREATE TABLE `avisos_internos` (
  `id_aviso` int AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `contenido` text NOT NULL,
  `prioridad` enum('baja','media','alta') DEFAULT media,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_inicio` datetime,
  `fecha_fin` datetime,
  `creado_por` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_aviso`)
);
INSERT INTO `avisos_internos` VALUES (2, 'Prueba', 'afaf', 'media', 1, NULL, NULL, NULL, '2026-09-19 11:16:17', NULL);
-- 1 fila(s) en `avisos_internos`

DROP TABLE IF EXISTS `cache_sistema`;
CREATE TABLE `cache_sistema` (
  `id_cache` int AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` datetime,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_cache`)
);
-- 0 fila(s) en `cache_sistema`

DROP TABLE IF EXISTS `calificaciones_actividades`;
CREATE TABLE `calificaciones_actividades` (
  `id_calificacion` int AUTO_INCREMENT,
  `id_actividad` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `nota` decimal(5,2),
  `nota_calculada` decimal(5,2),
  `nota_manual` decimal(5,2),
  `nota_recuperacion` decimal(5,2),
  `observaciones` text,
  `registrado_por` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime
,
  PRIMARY KEY (`id_calificacion`)
);
-- 0 fila(s) en `calificaciones_actividades`

DROP TABLE IF EXISTS `calificaciones_auditoria`;
CREATE TABLE `calificaciones_auditoria` (
  `id_auditoria` int AUTO_INCREMENT,
  `id_calificacion_sub` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `id_sub_actividad` int NOT NULL,
  `nota_anterior` decimal(5,2),
  `nota_nueva` decimal(5,2),
  `recuperacion_anterior` decimal(5,2),
  `recuperacion_nueva` decimal(5,2),
  `observacion_cambio` text NOT NULL,
  `id_usuario_cambio` int NOT NULL,
  `nombre_usuario` varchar(200) NOT NULL,
  `rol_usuario` varchar(100) NOT NULL,
  `tipo_operacion` enum('CREACION','MODIFICACION','ELIMINACION','RECUPERACION') NOT NULL,
  `es_primera_vez` tinyint(1) DEFAULT 0,
  `ip_address` varchar(45),
  `user_agent` varchar(500),
  `fecha_hora_cambio` datetime DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_auditoria`)
);
-- 0 fila(s) en `calificaciones_auditoria`

DROP TABLE IF EXISTS `calificaciones_sub_actividades`;
CREATE TABLE `calificaciones_sub_actividades` (
  `id_calificacion_sub` int AUTO_INCREMENT,
  `id_sub_actividad` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `nota` decimal(5,2),
  `nota_recuperacion` decimal(5,2),
  `observaciones` text,
  `registrado_por` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime
,
  PRIMARY KEY (`id_calificacion_sub`)
);
INSERT INTO `calificaciones_sub_actividades` VALUES (1, 20, 8, 10.00, NULL, NULL, 4, '2026-09-07 22:29:08', '2026-09-09 00:01:26', '2026-09-09 00:01:26');
INSERT INTO `calificaciones_sub_actividades` VALUES (2, 21, 8, 10.00, NULL, NULL, 4, '2026-09-07 22:29:12', '2026-09-07 22:29:12', '2026-09-07 22:29:12');
INSERT INTO `calificaciones_sub_actividades` VALUES (3, 22, 8, 10.00, NULL, NULL, 4, '2026-09-07 22:29:14', '2026-09-07 22:29:14', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (4, 18, 8, 10.00, NULL, NULL, 4, '2026-09-07 22:29:16', '2026-09-07 22:34:30', '2026-09-07 22:34:30');
INSERT INTO `calificaciones_sub_actividades` VALUES (5, 19, 8, 10.00, NULL, NULL, 4, '2026-09-07 22:29:18', '2026-09-07 22:34:32', '2026-09-07 22:34:32');
INSERT INTO `calificaciones_sub_actividades` VALUES (6, 23, 8, 10.00, NULL, NULL, 4, '2026-09-07 22:29:43', '2026-09-11 00:18:36', '2026-09-11 00:18:36');
INSERT INTO `calificaciones_sub_actividades` VALUES (7, 24, 8, 10.00, NULL, NULL, 4, '2026-09-07 22:29:47', '2026-09-11 00:18:43', '2026-09-11 00:18:43');
INSERT INTO `calificaciones_sub_actividades` VALUES (8, 25, 8, 8.00, NULL, NULL, 4, '2026-09-07 22:29:49', '2026-09-11 00:19:06', '2026-09-11 00:19:06');
INSERT INTO `calificaciones_sub_actividades` VALUES (9, 26, 8, 10.00, NULL, NULL, 4, '2026-09-07 22:29:50', '2026-09-11 00:18:48', '2026-09-11 00:18:48');
INSERT INTO `calificaciones_sub_actividades` VALUES (10, 27, 8, 8.00, NULL, NULL, 4, '2026-09-07 22:29:53', '2026-09-11 00:18:50', '2026-09-11 00:18:50');
INSERT INTO `calificaciones_sub_actividades` VALUES (11, 30, 8, 5.00, NULL, NULL, 4, '2026-09-07 22:29:55', '2026-09-11 00:18:54', '2026-09-11 00:18:54');
INSERT INTO `calificaciones_sub_actividades` VALUES (12, 28, 8, 4.00, NULL, NULL, 4, '2026-09-07 22:29:57', '2026-09-11 00:18:58', '2026-09-11 00:18:58');
INSERT INTO `calificaciones_sub_actividades` VALUES (13, 29, 8, 8.00, NULL, NULL, 4, '2026-09-07 22:29:59', '2026-09-11 00:19:00', '2026-09-11 00:19:00');
INSERT INTO `calificaciones_sub_actividades` VALUES (14, 20, 7, 8.00, NULL, NULL, 4, '2026-09-07 23:28:31', '2026-09-07 23:40:17', '2026-09-07 23:40:17');
INSERT INTO `calificaciones_sub_actividades` VALUES (15, 21, 7, 10.00, NULL, NULL, 4, '2026-09-07 23:28:32', '2026-09-07 23:28:32', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (16, 22, 7, 10.00, NULL, NULL, 4, '2026-09-07 23:28:33', '2026-09-07 23:28:33', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (17, 18, 7, 10.00, NULL, NULL, 4, '2026-09-07 23:28:34', '2026-09-07 23:28:33', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (18, 19, 7, 10.00, NULL, NULL, 4, '2026-09-07 23:28:35', '2026-09-07 23:28:34', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (19, 57, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:40:41', '2026-09-11 10:40:40', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (20, 58, 8, 8.00, NULL, NULL, 4, '2026-09-11 10:40:42', '2026-09-11 10:40:42', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (21, 59, 8, 9.00, NULL, NULL, 4, '2026-09-11 10:40:44', '2026-09-11 10:40:43', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (22, 60, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:40:46', '2026-09-11 10:40:45', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (23, 61, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:40:47', '2026-09-11 10:40:47', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (24, 62, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:40:49', '2026-09-11 10:40:49', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (25, 63, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:40:51', '2026-09-11 10:40:50', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (26, 64, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:40:52', '2026-09-11 10:40:52', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (27, 65, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:40:54', '2026-09-11 10:40:57', '2026-09-11 10:40:57');
INSERT INTO `calificaciones_sub_actividades` VALUES (28, 66, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:41:00', '2026-09-11 10:41:03', '2026-09-11 10:41:03');
INSERT INTO `calificaciones_sub_actividades` VALUES (29, 67, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:41:05', '2026-09-11 10:41:05', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (30, 68, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:41:07', '2026-09-11 10:41:07', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (31, 69, 8, 10.00, NULL, NULL, 4, '2026-09-11 10:41:09', '2026-09-11 10:41:09', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (32, 57, 7, 10.00, NULL, NULL, 4, '2026-09-11 10:41:24', '2026-09-11 10:41:25', '2026-09-11 10:41:25');
INSERT INTO `calificaciones_sub_actividades` VALUES (33, 62, 7, 10.00, NULL, NULL, 4, '2026-09-11 10:41:28', '2026-09-11 10:41:27', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (34, 57, 33, 10.00, NULL, NULL, 4, '2026-09-11 10:42:27', '2026-09-11 10:42:27', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (35, 58, 33, 8.00, NULL, NULL, 4, '2026-09-11 10:42:29', '2026-09-11 10:42:28', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (36, 70, 3, 4.00, NULL, NULL, 4, '2026-09-12 13:34:11', '2026-09-12 15:46:49', '2026-09-12 15:46:49');
INSERT INTO `calificaciones_sub_actividades` VALUES (37, 70, 11, 5.00, NULL, NULL, 4, '2026-09-12 15:46:31', '2026-09-12 15:46:35', '2026-09-12 15:46:35');
INSERT INTO `calificaciones_sub_actividades` VALUES (38, 71, 11, 5.00, NULL, NULL, 4, '2026-09-12 15:48:23', '2026-09-12 15:48:23', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (39, 72, 11, 5.00, NULL, NULL, 4, '2026-09-12 15:48:25', '2026-09-12 15:48:24', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (40, 73, 11, 5.00, NULL, NULL, 4, '2026-09-12 15:48:27', '2026-09-12 15:48:27', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (41, 74, 11, 5.00, NULL, NULL, 4, '2026-09-12 15:48:29', '2026-09-12 15:48:28', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (42, 75, 11, 5.00, NULL, NULL, 4, '2026-09-12 15:48:31', '2026-09-12 15:48:30', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (43, 71, 3, 2.00, NULL, NULL, 4, '2026-09-12 15:48:41', '2026-09-12 15:48:40', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (44, 72, 3, 1.00, NULL, NULL, 4, '2026-09-12 15:48:43', '2026-09-12 15:48:42', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (45, 73, 3, 3.00, NULL, NULL, 4, '2026-09-12 15:48:45', '2026-09-12 15:48:44', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (46, 74, 3, 4.00, NULL, NULL, 4, '2026-09-12 15:48:47', '2026-09-12 15:48:46', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (47, 75, 3, 1.00, NULL, NULL, 4, '2026-09-12 15:48:49', '2026-09-12 15:48:48', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (48, 78, 11, 10.00, NULL, NULL, 4, '2026-09-12 16:17:36', '2026-09-12 16:17:36', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (49, 79, 11, 0.00, NULL, NULL, 4, '2026-09-12 16:17:38', '2026-09-12 16:17:40', '2026-09-12 16:17:40');
INSERT INTO `calificaciones_sub_actividades` VALUES (50, 80, 11, 8.00, NULL, NULL, 4, '2026-09-12 16:17:43', '2026-09-12 16:17:42', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (51, 81, 11, 8.00, NULL, NULL, 4, '2026-09-12 16:17:44', '2026-09-12 16:17:43', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (52, 82, 11, 7.00, NULL, NULL, 4, '2026-09-12 16:17:45', '2026-09-12 16:17:44', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (53, 83, 11, 7.00, NULL, NULL, 4, '2026-09-12 16:17:49', '2026-09-12 16:17:48', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (54, 84, 11, 8.00, NULL, NULL, 4, '2026-09-12 16:17:50', '2026-09-12 16:17:49', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (55, 85, 11, 7.00, NULL, NULL, 4, '2026-09-12 16:17:51', '2026-09-12 16:17:50', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (56, 87, 11, 9.00, NULL, NULL, 4, '2026-09-12 16:17:56', '2026-09-12 16:17:56', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (57, 86, 11, 8.00, NULL, NULL, 4, '2026-09-12 16:17:57', '2026-09-12 16:17:56', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (58, 88, 11, 9.00, NULL, NULL, 4, '2026-09-12 16:17:59', '2026-09-12 16:17:59', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (59, 89, 11, 8.00, NULL, NULL, 4, '2026-09-12 16:18:00', '2026-09-12 16:18:00', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (60, 90, 11, 7.00, NULL, NULL, 4, '2026-09-12 16:18:01', '2026-09-12 16:18:01', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (61, 78, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:30:12', '2026-09-12 16:30:12', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (62, 79, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:30:14', '2026-09-12 16:30:14', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (63, 80, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:30:16', '2026-09-12 16:30:16', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (64, 81, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:30:18', '2026-09-12 16:30:17', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (65, 82, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:30:19', '2026-09-12 16:30:19', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (66, 83, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:31:03', '2026-09-12 16:31:02', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (67, 84, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:31:05', '2026-09-12 16:31:04', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (68, 85, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:31:06', '2026-09-12 16:31:06', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (69, 86, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:31:08', '2026-09-12 16:31:07', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (70, 87, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:31:10', '2026-09-12 16:31:09', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (71, 88, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:31:12', '2026-09-12 16:31:12', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (72, 89, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:31:14', '2026-09-12 16:31:13', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (73, 90, 3, 10.00, NULL, NULL, 4, '2026-09-12 16:31:16', '2026-09-12 16:31:15', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (74, 78, 12, 5.00, NULL, NULL, 4, '2026-09-12 16:31:24', '2026-09-12 16:31:23', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (75, 31, 40, 10.00, NULL, NULL, 4, '2026-09-17 11:33:57', '2026-09-17 11:33:57', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (76, 32, 40, 10.00, NULL, NULL, 4, '2026-09-17 11:33:59', '2026-09-17 11:33:58', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (77, 33, 40, 10.00, NULL, NULL, 4, '2026-09-17 11:34:00', '2026-09-17 11:34:00', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (78, 34, 40, 10.00, NULL, NULL, 4, '2026-09-17 11:34:02', '2026-09-17 11:34:02', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (79, 35, 40, 10.00, NULL, NULL, 4, '2026-09-17 11:34:04', '2026-09-17 11:34:03', NULL);
INSERT INTO `calificaciones_sub_actividades` VALUES (80, 36, 40, 10.00, NULL, NULL, 4, '2026-09-17 11:34:05', '2026-09-17 11:34:05', NULL);
-- 80 fila(s) en `calificaciones_sub_actividades`

DROP TABLE IF EXISTS `clases`;
CREATE TABLE `clases` (
  `id_clase` int AUTO_INCREMENT,
  `id_nivel` int NOT NULL,
  `id_grado` int NOT NULL,
  `id_especialidad` int,
  `id_seccion` int,
  `nombre_clase` varchar(80) NOT NULL,
  `seccion` varchar(5) NOT NULL,
  `grupo` varchar(10),
  `anio_lectivo_actual` year,
  `promocion_automatica` tinyint(1) DEFAULT 1,
  `estado` tinyint(1) DEFAULT 1,
  `cupo_maximo` int DEFAULT 30,
  `cupo_actual` int DEFAULT 0,
  `anio_lectivo` year NOT NULL DEFAULT 2026,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_clase`)
);
INSERT INTO `clases` VALUES (1, 1, 1, NULL, 1, 'Primer Año - Bachillerato General - Seccion A', 'A', 'A', 2026, 1, 1, 35, 5, 2026, '2026-08-14 18:30:22');
INSERT INTO `clases` VALUES (2, 1, 2, NULL, 1, 'Segundo Año - Bachillerato General - Seccion A', 'A', 'A', 2026, 1, 1, 30, 5, 2026, '2026-08-14 18:30:22');
INSERT INTO `clases` VALUES (3, 2, 3, 1, 1, 'Primer Año - Tecnico Vocacional en Desarrollo de Software - Seccion A', 'A', 'A', 2026, 1, 1, 30, 5, 2026, '2026-08-14 18:30:22');
INSERT INTO `clases` VALUES (4, 2, 4, 1, 1, 'Segundo Año - Tecnico Vocacional en Desarrollo de Software - Seccion A', 'A', 'A', 2026, 1, 1, 30, 2, 2026, '2026-08-14 18:30:22');
INSERT INTO `clases` VALUES (5, 2, 5, 1, 1, 'Tercer Año - Tecnico Vocacional en Desarrollo de Software - Seccion A', 'A', 'A', 2026, 1, 1, 30, 3, 2026, '2026-08-14 18:30:22');
INSERT INTO `clases` VALUES (6, 2, 3, 2, 1, 'Primer Año - Tecnico Vocacional en Administrativo Contable - Seccion A', 'A', 'A', 2026, 1, 1, 30, 10, 2026, '2026-08-14 18:30:22');
INSERT INTO `clases` VALUES (7, 3, 6, 3, 1, 'Primer Año - Tecnico Productivo en Salud y Bienestar - Seccion A', 'A', 'A', 2026, 1, 1, 30, 3, 2026, '2026-08-14 18:30:22');
INSERT INTO `clases` VALUES (8, 2, 3, 1, 2, 'Primer Año - Tecnico Vocacional en Desarrollo de Software - Seccion B', 'B', 'B', 2026, 1, 1, 30, 2, 2026, '2026-08-14 18:30:22');
INSERT INTO `clases` VALUES (9, 1, 1, 1, 3, 'Bachillerato General - Tecnico Vocacional en Desarrollo de Software - Seccion C', 'C', NULL, NULL, 1, 0, 30, 0, 2026, '2026-08-14 20:24:45');
INSERT INTO `clases` VALUES (10, 1, 1, 2, 1, 'Bachillerato General - Tecnico Vocacional en Administrativo Contable - Seccion A', 'A', NULL, NULL, 1, 0, 30, 0, 2026, '2026-08-16 11:52:59');
INSERT INTO `clases` VALUES (11, 3, 6, 3, 3, 'Primer Año - Tecnico Productivo en Salud y Bienestar - Seccion C', 'C', NULL, NULL, 1, 1, 35, 1, 2026, '2026-08-16 17:36:15');
INSERT INTO `clases` VALUES (12, 1, 1, NULL, 1, 'Primer Año - Bachillerato General - Seccion A', 'A', NULL, NULL, 1, 1, 30, 1, 2026, '2026-09-19 11:29:21');
-- 12 fila(s) en `clases`

DROP TABLE IF EXISTS `combinacion_materias`;
CREATE TABLE `combinacion_materias` (
  `id_combinacion` int NOT NULL,
  `id_clase` int NOT NULL,
  `id_materia` int NOT NULL,
  `estado` tinyint(1) DEFAULT 1
);
-- 0 fila(s) en `combinacion_materias`

DROP TABLE IF EXISTS `conducta_periodos`;
CREATE TABLE `conducta_periodos` (
  `id_conducta` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_periodo` int NOT NULL,
  `calificacion_conducta` enum('Excelente','Muy Bueno','Bueno','Suficiente','Necesita Mejorar') NOT NULL,
  `observaciones` text,
  `registrado_por` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_conducta`)
);
INSERT INTO `conducta_periodos` VALUES (1, 1, 1, 'Excelente', NULL, NULL, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (2, 2, 1, 'Bueno', 'Requiere mejorar comportamiento en aula', 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (3, 3, 1, 'Bueno', 'prueba', 2, '2026-08-14 18:30:23', '2026-08-16 19:33:40');
INSERT INTO `conducta_periodos` VALUES (4, 4, 1, 'Muy Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (5, 5, 1, 'Excelente', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (6, 6, 1, 'Muy Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (7, 7, 1, 'Excelente', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (8, 8, 1, 'Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (9, 9, 1, 'Muy Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (10, 10, 1, 'Muy Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (11, 11, 1, 'Muy Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (12, 12, 1, 'Excelente', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (13, 13, 1, 'Bueno', 'prueba', 2, '2026-08-14 18:30:23', '2026-08-16 19:32:58');
INSERT INTO `conducta_periodos` VALUES (14, 14, 1, 'Bueno', 'Amonestado por interrupciones', 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (15, 15, 1, 'Excelente', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (16, 16, 1, 'Muy Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (17, 17, 1, 'Muy Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (18, 18, 1, 'Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (19, 19, 1, 'Muy Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (20, 20, 1, 'Muy Bueno', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (21, 21, 1, 'Excelente', NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (22, 22, 1, 'Suficiente', 'Falta de atencion constante', 4, '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `conducta_periodos` VALUES (23, 40, 1, 'Muy Bueno', 'Prueba', 2, '2026-09-19 17:57:37', '2026-09-19 17:57:36');
-- 23 fila(s) en `conducta_periodos`

DROP TABLE IF EXISTS `configuracion`;
CREATE TABLE `configuracion` (
  `id_configuracion` int NOT NULL,
  `clave` varchar(100) NOT NULL,
  `valor` text,
  `descripcion` varchar(255),
  `creado_por` int,
  `modificado_por` int
);
INSERT INTO `configuracion` VALUES (1, 'nombre_instituto', 'Instituto Nacional de Apopa', 'Nombre del instituto', NULL, NULL);
INSERT INTO `configuracion` VALUES (2, 'logo', 'logo.png', 'Logo del sistema', NULL, NULL);
INSERT INTO `configuracion` VALUES (3, 'anio_lectivo', '2026', 'Año lectivo actual', NULL, NULL);
INSERT INTO `configuracion` VALUES (4, 'nota_minima_basica', '60', 'Nota minima aprobatoria para materias basicas (0-100)', NULL, NULL);
INSERT INTO `configuracion` VALUES (5, 'nota_minima_especialidad', '4', 'Nota minima aprobatoria para especialidad (1-5)', NULL, NULL);
INSERT INTO `configuracion` VALUES (6, 'escala_basica_max', '100', 'Escala maxima para materias basicas', NULL, NULL);
INSERT INTO `configuracion` VALUES (7, 'escala_especialidad_max', '5', 'Escala maxima para especialidad', NULL, NULL);
INSERT INTO `configuracion` VALUES (8, 'periodos_anio', '4', 'Numero de periodos por año lectivo', NULL, NULL);
INSERT INTO `configuracion` VALUES (9, 'conducta_escala_max', '10', 'Escala maxima para conducta', NULL, NULL);
INSERT INTO `configuracion` VALUES (10, 'telefono_contacto', '2288-9966', 'Telefono de contacto del instituto', NULL, NULL);
INSERT INTO `configuracion` VALUES (11, 'correo_contacto', 'ina@mined.edu.sv', 'Correo de contacto del instituto', NULL, NULL);
INSERT INTO `configuracion` VALUES (12, 'director', 'Lic. Juan Perez', 'Nombre del director', NULL, NULL);
INSERT INTO `configuracion` VALUES (13, 'lema', 'Educacion con excelencia', 'Lema del instituto', NULL, NULL);
-- 13 fila(s) en `configuracion`

DROP TABLE IF EXISTS `constancia_asistencia_revert`;
CREATE TABLE `constancia_asistencia_revert` (
  `id_revert` int AUTO_INCREMENT,
  `id_constancia` int NOT NULL,
  `id_asistencia` int NOT NULL,
  `estado_anterior` varchar(20) NOT NULL DEFAULT Presente,
  `creada_por_permiso` tinyint(1) NOT NULL DEFAULT 0
,
  PRIMARY KEY (`id_revert`)
);
-- 0 fila(s) en `constancia_asistencia_revert`

DROP TABLE IF EXISTS `constancias`;
CREATE TABLE `constancias` (
  `id_constancia` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `tipo` varchar(30) NOT NULL DEFAULT Estudio,
  `motivo` varchar(500),
  `fecha_inicio` date,
  `cantidad_dias` int,
  `fecha_fin` date,
  `documento` varchar(300),
  `nombre_archivo` varchar(200),
  `trajo_documento` tinyint(1) NOT NULL DEFAULT 0,
  `encargado_presente` tinyint(1) NOT NULL DEFAULT 0,
  `permiso_asistencias` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_emision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `generada_por` varchar(50),
  `estado` varchar(20) NOT NULL DEFAULT Activa,
  `observaciones` varchar(500)
,
  PRIMARY KEY (`id_constancia`)
);
INSERT INTO `constancias` VALUES (1, 17, 'Incapacidad', 'prueba', '2026-08-16 00:00:00', 2, '2026-08-17 00:00:00', NULL, NULL, 1, 1, 1, '2026-08-16 15:43:55', 'DIR001', 'Anulada', NULL);
INSERT INTO `constancias` VALUES (2, 3, 'Incapacidad', 'prueba', '2026-08-16 00:00:00', 2, '2026-08-17 00:00:00', NULL, NULL, 1, 1, 1, '2026-08-16 15:46:06', 'DIR001', 'Anulada', 'prueba');
INSERT INTO `constancias` VALUES (12, 3, 'Incapacidad', 'Constancia de incapacidad emitida por la direccion', '2026-08-16 00:00:00', 2, '2026-08-17 00:00:00', NULL, NULL, 1, 1, 1, '2026-08-16 16:14:53', 'admin', 'Anulada', 'Permiso de asistencias 16 y 17 de agosto');
INSERT INTO `constancias` VALUES (13, 3, 'Incapacidad', 'prueba', '2026-08-16 00:00:00', 2, '2026-08-17 00:00:00', NULL, NULL, 0, 1, 1, '2026-08-16 17:05:36', 'DIR001', 'Anulada', 'prueba');
INSERT INTO `constancias` VALUES (14, 13, 'Estudio', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, '2026-08-16 22:02:09', 'REG001', 'Activa', NULL);
INSERT INTO `constancias` VALUES (15, 2, 'titulo_en_proceso', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, '2026-08-21 15:36:42', 'REG001', 'Anulada', NULL);
INSERT INTO `constancias` VALUES (16, 3, 'titulo_en_proceso', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, '2026-08-21 20:33:04', 'REG001', 'Anulada', NULL);
INSERT INTO `constancias` VALUES (17, 38, 'Incapacidad', 'Esguince', '2026-09-19 00:00:00', 3, '2026-09-21 00:00:00', NULL, NULL, 1, 0, 1, '2026-09-19 11:32:44', 'DIR001', 'Activa', NULL);
INSERT INTO `constancias` VALUES (18, 42, 'Conducta', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, '2026-09-24 23:09:33', 'admin', 'Activa', NULL);
-- 9 fila(s) en `constancias`

DROP TABLE IF EXISTS `contenido_publico`;
CREATE TABLE `contenido_publico` (
  `id_contenido` int AUTO_INCREMENT,
  `pagina` varchar(50) NOT NULL,
  `seccion` varchar(100) NOT NULL,
  `titulo` varchar(200),
  `contenido` longtext,
  `imagen_url` varchar(500),
  `imagen_config` varchar(500),
  `orden` int NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modificado_por` varchar(100)
,
  PRIMARY KEY (`id_contenido`)
);
INSERT INTO `contenido_publico` VALUES (1, 'home', 'hero-titulo', NULL, 'Instituto Nacional de Apopa', NULL, NULL, 1, 1, '2026-09-19 17:24:35', 'DIR001');
INSERT INTO `contenido_publico` VALUES (2, 'home', 'hero-subtitulo', NULL, 'Excelencia académica y formación integral', NULL, NULL, 2, 1, '2026-09-19 17:24:35', 'DIR001');
INSERT INTO `contenido_publico` VALUES (3, 'home', 'historia', 'Historia', '<p>Fue fundado el 07 de febrero de 1981, en el local de la Escuela Vicente Acosta; se utilizó una sala de clases para el funcionamiento de una sección del 1º año de bachillerato con 44 alumnos.</p><p>El Profesor José Jerónimo Yánez (Director), profesor Rubén Alirio Gomero Canjura (Q.D.D.G), Señora María Ramos (Secretaria), Señor Angelino Herrera Salazar (Ordenanza) fueron quienes hicieron funcionar al INA durante el primer Año; Instituto que hoy en día goza de prestigio y reconocimiento a nivel nacional por la calidad de Bachilleres que cada año egresan, así como por el buen desempeño de los(as) docentes y personal administrativo.</p><p>Inicialmente se atendía solo el Bachillerato General y fue en 1984, que se ubicó donde se encuentra actualmente y poco a poco se construyeron las aulas con el apoyo y esfuerzo de padres y madres de familia y de la Comunidad Educativa.</p><p>En 1988 se ofrecería: Bachillerato Académico, Bachillerato Comercial y Bachillerato en Salud; para entonces, se contaba con una población de 1000 estudiantes, educados por 30 docentes. </p><p>El deseo de superación y la alcanzar la excelencia, ha sido el motor que hace que cada día se busquen nuevas opciones para ofrecer mas oportunidades a los estudiantes para que puedan desarrollar todas sus habilidades y poder así incorporarse a la sociedad, al mundo laborar o crear su empresa de una forma efectiva.</p><p>Con esa visión se promovió el implementó de una forma sistemática la participación de los estudiantes en actividades artísticas, deportivas y culturales; en las cuales se ha logrado resultados positivos y donde hay reconocimientos a nivel nacional e internacional.</p><p>A partir del año 2015 se Desarrolla el Currículo Renovado: Ofreciendo Bachillerato Técnico Vocacional Administrativo Contable, Atención Primaria en Salud, Electrónica, Desarrollo de Software y Bachillerato General </p>', 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_del_Instituto_Nacional_de_Apopa_%28INA%29.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original', '{"ancho":"25%","alto":"150px","alineacion":"left","borderRadius":"0","objectFit":"contain"}', 3, 1, '2026-09-19 17:42:39', 'DIR001');
INSERT INTO `contenido_publico` VALUES (4, 'home', 'mision', 'Misión', 'Formar jóvenes con excelencia académica, valores y habilidades técnicas que les permitan incorporarse exitosamente a la sociedad, al mundo laboral o crear su propia empresa.', NULL, NULL, 4, 1, '2026-09-19 17:24:35', 'DIR001');
INSERT INTO `contenido_publico` VALUES (5, 'home', 'vision', 'Visión', 'Ser un instituto líder a nivel nacional, reconocido por la calidad educativa y la formación integral de estudiantes emprendedores y competitivos.', NULL, NULL, 5, 1, '2026-09-19 17:24:35', 'DIR001');
INSERT INTO `contenido_publico` VALUES (6, 'cultura', 'quienes-somos', '¿Quiénes Somos?', 'Somos una institución de educación media, con más de 40 años formando bachilleres de calidad, comprometidos con la sociedad.', NULL, NULL, 1, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (7, 'cultura', 'mision', 'Misión', 'Somos una institución de educación media que brinda servicios de calidad, haciendo uso de recursos tecnológicos apropiados para la formación de personas integrales, competentes y con visión empresarial con la participación efectiva de los diferentes actores y gestores del proceso educativo.', NULL, NULL, 2, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (8, 'cultura', 'vision', 'Visión', 'Ser una Institución de educación media, líder en la formación de personas integrales, competentes y capaces de desarrollarse en el ámbito familiar, social y de estudios superiores, con proyección empresarial.', NULL, NULL, 3, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (9, 'cultura', 'escudo', 'Escudo', 'Representa la identidad, los valores y la trayectoria del Instituto Nacional de Apopa.', NULL, NULL, 4, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (10, 'cultura', 'bandera', 'Bandera', 'Los colores que identifican a nuestra institución y nos representan en eventos cívicos y culturales.', NULL, NULL, 5, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (11, 'cultura', 'himno', 'Himno', 'Canto que exalta los valores, la historia y el orgullo de pertenecer al Instituto Nacional de Apopa.', NULL, NULL, 6, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (12, 'cultura', 'valor-calidad', 'Calidad en Educación', 'Brindamos servicios educativos de excelencia para la formación integral de nuestros estudiantes.', NULL, NULL, 10, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (13, 'cultura', 'valor-excelencia', 'Excelencia Académica', 'Buscamos la mejora continua en el proceso de enseñanza-aprendizaje.', NULL, NULL, 11, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (14, 'cultura', 'valor-innovacion', 'Innovación continua', 'Incorporamos recursos tecnológicos apropiados para potenciar el aprendizaje.', NULL, NULL, 12, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (15, 'cultura', 'valor-compromiso', 'Compromiso Social', 'Nos comprometemos con el desarrollo de la sociedad a través de la formación de jóvenes.', NULL, NULL, 13, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (16, 'cultura', 'valor-respeto', 'Respeto', 'Fomentamos el respeto entre todos los miembros de la comunidad educativa.', NULL, NULL, 14, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (17, 'contacto', 'ubicacion', 'Ubicación', '<p>Calle "A". Colonia Madre Tierra, Apopa, El Salvador</p>', NULL, NULL, 1, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (18, 'contacto', 'telefono', 'Teléfono', '<p>2216-4001</p>', NULL, NULL, 2, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (19, 'contacto', 'correo', 'Correo Electrónico', '<p>direccioninapopa@gmail.com</p>', NULL, NULL, 3, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (20, 'contacto', 'horario', 'Horario de Atención', '<p>Lunes a Viernes: 7:00 AM - 3:00 PM</p><p>Secretaría: 7:00 AM - 12:00 PM</p>', NULL, NULL, 4, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (21, 'contacto', 'direccion', NULL, '<p><strong>Dirección:</strong> Calle "A". Colonia Madre Tierra, Apopa, El Salvador</p><p><strong>Teléfono:</strong> 2216-4001</p>', NULL, NULL, 5, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (22, 'contacto', 'facebook', '@inadeapopa', 'https://www.facebook.com/inadeapopa', NULL, NULL, 10, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (23, 'contacto', 'instagram', '@ina_apopa_oficial', 'https://www.instagram.com/ina_apopa_oficial/', NULL, NULL, 11, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (24, 'contacto', 'tiktok', '@inapopaoficial', 'https://www.tiktok.com/@inapopaoficial', NULL, NULL, 12, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (25, 'bachilleratos', 'carrera-software-nombre', NULL, 'Desarrollo de Software', NULL, NULL, 1, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (26, 'bachilleratos', 'carrera-software-duracion', NULL, '3 años', NULL, NULL, 2, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (27, 'bachilleratos', 'carrera-software-descripcion', NULL, 'En este bachillerato recibirás formación técnica necesaria para desarrollar aplicaciones de escritorio, intranet, web y dispositivos móviles. También obtendrás los conocimientos necesarios para la Administración de Bases de Datos relacionales.', NULL, NULL, 3, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (28, 'bachilleratos', 'carrera-contable-nombre', NULL, 'Administrativo Contable', NULL, NULL, 10, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (29, 'bachilleratos', 'carrera-contable-duracion', NULL, '3 años', NULL, NULL, 11, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (30, 'bachilleratos', 'carrera-contable-descripcion', NULL, 'Competencias y Oportunidades que lograra con el Bachillerato Tecnico Vocacional Administrativo Contable.', NULL, NULL, 12, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (31, 'bachilleratos', 'carrera-electronica-nombre', NULL, 'Electronica', NULL, NULL, 20, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (32, 'bachilleratos', 'carrera-electronica-duracion', NULL, '3 años', NULL, NULL, 21, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (33, 'bachilleratos', 'carrera-electronica-descripcion', NULL, 'El Bachiller Tecnico en Electronica egresa como persona de solida formacion Tecnica y Humana que le permite insertarse en la vida laboral, ser agente productivo del pais y promover su desarrollo personal.', NULL, NULL, 22, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (34, 'bachilleratos', 'carrera-salud-nombre', NULL, 'Atencion Primaria en Salud', NULL, NULL, 30, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (35, 'bachilleratos', 'carrera-salud-duracion', NULL, '3 años', NULL, NULL, 31, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (36, 'bachilleratos', 'carrera-salud-descripcion', NULL, 'El Tecnico en Atencion Primaria en Salud es un Tecnico de nivel medio preparado para incorporarse a los procesos de promocion de la salud, Organizacion Comunitaria y Actividades de Administracion de la Salud.', NULL, NULL, 32, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (37, 'bachilleratos', 'carrera-general-nombre', NULL, 'Bachillerato General', NULL, NULL, 40, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (38, 'bachilleratos', 'carrera-general-duracion', NULL, '2 años', NULL, NULL, 41, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (39, 'bachilleratos', 'carrera-general-descripcion', NULL, 'Duracion de 2 años y al graduarte podras optar por una carrera universitaria especializada. Obtienes conocimientos generales en todas las asignaturas cientificas.', NULL, NULL, 42, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (40, 'extracurriculares', 'introduccion', NULL, 'El Instituto Nacional de Apopa promueve la participación de los estudiantes en actividades artísticas, deportivas y culturales, logrando resultados positivos y reconocimientos a nivel nacional e internacional.', NULL, NULL, 1, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (41, 'extracurriculares', 'logros', 'Logros y Reconocimientos', '<ul><li>Campeonatos interescolares en fútbol y baloncesto</li><li>Reconocimientos en festivales de danza folklorica</li><li>Presentaciones de la Banda de Paz en eventos cívicos nacionales</li><li>Participación en competencias departamentales de bádminton</li></ul>', NULL, NULL, 2, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (42, 'extracurriculares', 'calendario', 'Calendario de Actividades 2026', '<ul><li>Marzo: Inicio de entrenamientos deportivos</li><li>Mayo: Festival de Danza y Música</li><li>Junio: Juegos estudiantiles interescolares</li><li>Agosto: Presentación de la Banda de Paz</li><li>Septiembre: Competencias deportivas departamentales</li><li>Octubre: Clausura de actividades extracurriculares</li></ul>', NULL, NULL, 3, 1, '2026-09-19 17:15:49', NULL);
INSERT INTO `contenido_publico` VALUES (43, 'cultura', 'Valores', '', '<p>Valores</p><p>-Liderazgo</p><p>-Innovacion</p><p>-Calidad</p><p>-Integridad</p><p>-Pertinencia</p>', '', NULL, 12, 1, '2026-09-19 17:45:48', 'DIR001');
-- 43 fila(s) en `contenido_publico`

DROP TABLE IF EXISTS `correos_programados`;
CREATE TABLE `correos_programados` (
  `id_correo` int AUTO_INCREMENT,
  `destinatario` varchar(100) NOT NULL,
  `asunto` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `archivo_adjunto` varchar(255),
  `fecha_programada` datetime NOT NULL,
  `enviado` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_correo`)
);
-- 0 fila(s) en `correos_programados`

DROP TABLE IF EXISTS `cupos_especialidades`;
CREATE TABLE `cupos_especialidades` (
  `id_cupo` int AUTO_INCREMENT,
  `id_especialidad` int NOT NULL,
  `seccion` varchar(5) NOT NULL,
  `cupos_totales` int NOT NULL DEFAULT 30,
  `cupos_ocupados` int NOT NULL DEFAULT 0,
  `anio_lectivo` year NOT NULL
,
  PRIMARY KEY (`id_cupo`)
);
INSERT INTO `cupos_especialidades` VALUES (1, 1, 'A', 30, 9, 2026);
INSERT INTO `cupos_especialidades` VALUES (2, 1, 'B', 30, 2, 2026);
INSERT INTO `cupos_especialidades` VALUES (3, 2, 'A', 30, 9, 2026);
INSERT INTO `cupos_especialidades` VALUES (4, 3, 'A', 30, 3, 2026);
-- 4 fila(s) en `cupos_especialidades`

DROP TABLE IF EXISTS `docente_materias`;
CREATE TABLE `docente_materias` (
  `id_docente_materia` int AUTO_INCREMENT,
  `id_docente` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `puede_calificar` tinyint(1) DEFAULT 1,
  `puede_amonestar` tinyint(1) DEFAULT 1,
  `estado` tinyint(1) DEFAULT 1
,
  PRIMARY KEY (`id_docente_materia`)
);
INSERT INTO `docente_materias` VALUES (1, 1, 1, 1, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (2, 1, 1, 2, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (3, 1, 2, 1, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (4, 2, 2, 2, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (5, 2, 3, 1, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (6, 2, 3, 2, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (7, 2, 4, 1, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (8, 2, 4, 2, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (14, 3, 6, 1, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (15, 3, 6, 3, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (16, 3, 6, 6, 2026, 1, 1, 1);
INSERT INTO `docente_materias` VALUES (30, 1, 5, 1, 2026, 1, 0, 1);
INSERT INTO `docente_materias` VALUES (33, 1, 2, 3, 2026, 1, 1, 1);
-- 13 fila(s) en `docente_materias`

DROP TABLE IF EXISTS `docente_modulos`;
CREATE TABLE `docente_modulos` (
  `id_docente_modulo` int AUTO_INCREMENT,
  `id_docente` int NOT NULL,
  `id_modulo` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` int NOT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_docente_modulo`)
);
INSERT INTO `docente_modulos` VALUES (1, 1, 1, 3, 2026, 1, '2026-09-09 09:08:41');
INSERT INTO `docente_modulos` VALUES (2, 1, 2, 3, 2026, 1, '2026-09-09 09:08:45');
INSERT INTO `docente_modulos` VALUES (3, 1, 3, 3, 2026, 1, '2026-09-09 09:08:48');
INSERT INTO `docente_modulos` VALUES (4, 1, 4, 3, 2026, 1, '2026-09-09 09:08:51');
INSERT INTO `docente_modulos` VALUES (5, 1, 5, 3, 2026, 1, '2026-09-09 09:08:54');
INSERT INTO `docente_modulos` VALUES (6, 1, 6, 3, 2026, 1, '2026-09-09 09:08:57');
INSERT INTO `docente_modulos` VALUES (7, 6, 7, 3, 2026, 1, '2026-09-09 09:08:59');
INSERT INTO `docente_modulos` VALUES (8, 2, 8, 3, 2026, 1, '2026-09-09 09:09:06');
INSERT INTO `docente_modulos` VALUES (9, 1, 1, 5, 2026, 1, '2026-09-12 15:15:53');
INSERT INTO `docente_modulos` VALUES (10, 2, 9, 7, 2026, 1, '2026-09-19 11:14:15');
-- 10 fila(s) en `docente_modulos`

DROP TABLE IF EXISTS `docentes`;
CREATE TABLE `docentes` (
  `id_docente` int AUTO_INCREMENT,
  `codigo_docente` varchar(50) NOT NULL,
  `nip` varchar(50),
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `dui` varchar(10),
  `nit` varchar(20),
  `pasaporte` varchar(50),
  `telefono` varchar(15),
  `correo` varchar(100),
  `direccion` text,
  `especialidad_docente` varchar(100),
  `tipo_docente` enum('Basica','Especialidad') DEFAULT Basica,
  `id_especialidad` int,
  `fecha_ingreso` date,
  `tipo_contrato` enum('Planta','Hora Clase','Sobresueldo') DEFAULT Planta,
  `sueldo_base` decimal(10,2),
  `valor_hora` decimal(10,2),
  `horas_asignadas` int,
  `contrasena` varchar(100),
  `estado` tinyint(1) DEFAULT 1,
  `situacion` enum('Activo','Licencia','Vacaciones','Incapacidad','Suspendido','Retirado') DEFAULT Activo,
  `id_rol` int
,
  PRIMARY KEY (`id_docente`)
);
INSERT INTO `docentes` VALUES (1, 'DOC001', 'DOC001', 'Maria Elena', 'Rodriguez Castro', '01010101-1', '0610-010101-101-1', NULL, '7711-0001', 'docente@ina.edu.sv', 'Colonia San Jose, Apopa', 'Matematica', 'Basica', NULL, '2019-01-15 00:00:00', 'Planta', 900.00, 12.50, 20, NULL, 1, 'Activo', 6);
INSERT INTO `docentes` VALUES (2, 'DOC002', 'DOC002', 'Carlos Alberto', 'Martinez Herrera', '01020202-2', '0610-010202-102-2', NULL, '7711-0002', 'carlos.martinez@ina.edu.sv', 'Residencial Las Flores, Apopa', 'Ciencias Naturales', 'Basica', NULL, '2019-02-01 00:00:00', 'Planta', 850.00, 12.00, 20, NULL, 1, 'Activo', 6);
INSERT INTO `docentes` VALUES (3, 'DOC003', 'DOC003', 'Rosa Elvira', 'Castillo Lopez', '01030303-3', '0610-010303-103-3', NULL, '7711-0003', 'rosa.castillo@ina.edu.sv', 'Colonia El Carmen, Apopa', 'Ingles', 'Basica', NULL, '2020-01-15 00:00:00', 'Planta', 850.00, 12.00, 20, NULL, 1, 'Activo', 6);
INSERT INTO `docentes` VALUES (4, 'DOC004', 'DOC004', 'Jose Manuel', 'Ramirez Flores', '01040404-4', '0610-010404-104-4', NULL, '7711-0004', 'jose.ramirez@ina.edu.sv', 'Colonia La Campanera, San Salvador', 'Desarrollo de Software', 'Especialidad', 1, '2020-02-01 00:00:00', 'Planta', 950.00, 14.00, 20, NULL, 1, 'Activo', 6);
INSERT INTO `docentes` VALUES (5, 'DOC005', 'DOC005', 'Karla Ivette', 'Sanchez Guevara', '01050505-5', '0610-010505-105-5', NULL, '7711-0005', 'karla.sanchez@ina.edu.sv', 'Colonia Escalon, San Salvador', 'Contabilidad', 'Especialidad', 2, '2021-01-15 00:00:00', 'Planta', 950.00, 14.00, 20, NULL, 1, 'Activo', 6);
INSERT INTO `docentes` VALUES (6, 'DOC006', 'DOC006', 'Fernando Enrique', 'Vasquez Rivas', '01060606-6', '0610-010606-106-6', NULL, '7711-0006', 'fernando.vasquez@ina.edu.sv', 'Canton Santa Lucia, Apopa', 'Salud y Bienestar', 'Especialidad', 3, '2021-02-01 00:00:00', 'Planta', 900.00, 13.00, 20, NULL, 1, 'Activo', 6);
INSERT INTO `docentes` VALUES (7, 'DOC007', NULL, 'Felix Diomande', 'Beltran Gutierrez', '1235858', NULL, NULL, '123', 'Diomande@gmail.com', NULL, 'Desarollo de Software/Lenguaje', '', NULL, NULL, 'Planta', NULL, NULL, NULL, NULL, 1, 'Activo', NULL);
-- 7 fila(s) en `docentes`

DROP TABLE IF EXISTS `documentos_estudiantes`;
CREATE TABLE `documentos_estudiantes` (
  `id_documento` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `tipo` varchar(80) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `documento` varchar(300),
  `nombre_archivo` varchar(200),
  `fecha` date NOT NULL,
  `registrado_por` varchar(50),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_documento`)
);
INSERT INTO `documentos_estudiantes` VALUES (1, 3, 'Otro', 'prueba', '/uploads/documentos_estudiantes/3/documento_23a6b9745f0543078461cc5818874481_Poderes del estado.pdf', NULL, '2026-08-17 00:00:00', 'REG001', '2026-08-16 23:13:31');
INSERT INTO `documentos_estudiantes` VALUES (2, 3, 'Constancia de Estudio', 'Constancia', '/uploads/documentos_estudiantes/3/documento_36b588903e3d4d63aab5e71dc95bad93_boleta_mined_periodo.pdf', NULL, '2026-08-17 00:00:00', 'REG001', '2026-08-17 09:30:38');
-- 2 fila(s) en `documentos_estudiantes`

DROP TABLE IF EXISTS `documentos_personas`;
CREATE TABLE `documentos_personas` (
  `id_documento_persona` int AUTO_INCREMENT,
  `id_persona` int NOT NULL,
  `id_tipo_documento` int NOT NULL,
  `numero_documento` varchar(100),
  `archivo` varchar(255),
  `estado` tinyint DEFAULT 1,
  `observaciones` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_documento_persona`)
);
-- 0 fila(s) en `documentos_personas`

DROP TABLE IF EXISTS `documentosadministrativos`;
CREATE TABLE `documentosadministrativos` (
  `id_documento_admin` int AUTO_INCREMENT,
  `id_administrador` int,
  `id_documento` int,
  `NumeroDocumento` varchar(100),
  `Documento` varchar(225),
  `Estado` bit(1)
,
  PRIMARY KEY (`id_documento_admin`)
);
-- 0 fila(s) en `documentosadministrativos`

DROP TABLE IF EXISTS `documentosdocentes`;
CREATE TABLE `documentosdocentes` (
  `id_documento_docente` int AUTO_INCREMENT,
  `id_docente` int,
  `id_documento` int,
  `NumeroDocumento` varchar(100),
  `Documento` varchar(225),
  `Estado` bit(1)
,
  PRIMARY KEY (`id_documento_docente`)
);
-- 0 fila(s) en `documentosdocentes`

DROP TABLE IF EXISTS `documentosestudiantes`;
CREATE TABLE `documentosestudiantes` (
  `id_documento_estudiante` int AUTO_INCREMENT,
  `id_estudiante` int,
  `id_documento` int,
  `Numero_Documento` varchar(100),
  `Documento` varchar(255),
  `Estado` bit(1)
,
  PRIMARY KEY (`id_documento_estudiante`)
);
-- 0 fila(s) en `documentosestudiantes`

DROP TABLE IF EXISTS `edificios`;
CREATE TABLE `edificios` (
  `id_edificio` int NOT NULL,
  `codigo_edificio` varchar(5) NOT NULL,
  `nombre_edificio` varchar(100),
  `descripcion` text,
  `estado` tinyint(1) NOT NULL DEFAULT 1
);
INSERT INTO `edificios` VALUES (1, 'A', 'Edificio A', 'Salones de primero y segundo año', 1);
INSERT INTO `edificios` VALUES (2, 'B', 'Edificio B', 'Salones de especialidades y laboratorios', 1);
-- 2 fila(s) en `edificios`

DROP TABLE IF EXISTS `errores_sistema`;
CREATE TABLE `errores_sistema` (
  `id_error` int AUTO_INCREMENT,
  `mensaje` text NOT NULL,
  `stack_trace` text,
  `usuario` varchar(100),
  `ruta` varchar(255),
  `ip` varchar(50),
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `resuelto` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_error`)
);
INSERT INTO `errores_sistema` VALUES (1, 'Unknown column ''c.PeriodoAcademicoIdPeriodo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ConductaController.GetConductaPorClase(Int32 idClase, Int32 idPeriodo) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ConductaController.cs:line 119
   at lambda_method545(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.TaskOfActionResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DIR001', '/api/conducta/clase/1/periodo/1', '::1', '2026-08-16 19:15:52', 0, '2026-08-16 19:15:52');
INSERT INTO `errores_sistema` VALUES (2, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:20:51', 0, '2026-09-02 15:20:51');
INSERT INTO `errores_sistema` VALUES (3, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:20:51', 0, '2026-09-02 15:20:51');
INSERT INTO `errores_sistema` VALUES (4, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:21:44', 0, '2026-09-02 15:21:44');
INSERT INTO `errores_sistema` VALUES (5, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:21:44', 0, '2026-09-02 15:21:44');
INSERT INTO `errores_sistema` VALUES (6, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:22:57', 0, '2026-09-02 15:22:57');
INSERT INTO `errores_sistema` VALUES (7, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:22:57', 0, '2026-09-02 15:22:57');
INSERT INTO `errores_sistema` VALUES (8, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:25:54', 0, '2026-09-02 15:25:54');
INSERT INTO `errores_sistema` VALUES (9, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:25:54', 0, '2026-09-02 15:25:54');
INSERT INTO `errores_sistema` VALUES (10, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:26:58', 0, '2026-09-02 15:26:58');
INSERT INTO `errores_sistema` VALUES (11, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:26:58', 0, '2026-09-02 15:26:58');
INSERT INTO `errores_sistema` VALUES (12, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:27:09', 0, '2026-09-02 15:27:09');
INSERT INTO `errores_sistema` VALUES (13, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method722(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 15:27:09', 0, '2026-09-02 15:27:09');
INSERT INTO `errores_sistema` VALUES (14, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method276(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 16:01:22', 0, '2026-09-02 16:01:22');
INSERT INTO `errores_sistema` VALUES (15, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method276(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 16:01:22', 0, '2026-09-02 16:01:22');
INSERT INTO `errores_sistema` VALUES (16, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method276(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 16:01:52', 0, '2026-09-02 16:01:52');
INSERT INTO `errores_sistema` VALUES (17, 'Unknown column ''a.es_modulo'' in ''field list''', '   at MySqlConnector.Core.ServerSession.ReceiveReplyAsync(IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/ServerSession.cs:line 1169
   at MySqlConnector.Core.ResultSet.ReadResultSetHeaderAsync(IOBehavior ioBehavior) in /_/src/MySqlConnector/Core/ResultSet.cs:line 37
   at MySqlConnector.MySqlDataReader.ActivateResultSet(CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 133
   at MySqlConnector.MySqlDataReader.InitAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, IDictionary`2 cachedProcedures, IMySqlCommand command, CommandBehavior behavior, Activity activity, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlDataReader.cs:line 489
   at MySqlConnector.Core.CommandExecutor.ExecuteReaderAsync(CommandListPosition commandListPosition, ICommandPayloadCreator payloadCreator, CommandBehavior behavior, Activity activity, MySqlConnectorSemanticConventionsKinds conventionsKinds, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/Core/CommandExecutor.cs:line 58
   at MySqlConnector.MySqlCommand.ExecuteReaderAsync(CommandBehavior behavior, IOBehavior ioBehavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 352
   at MySqlConnector.MySqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken) in /_/src/MySqlConnector/MySqlCommand.cs:line 345
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
   at Pomelo.EntityFrameworkCore.MySql.Storage.Internal.MySqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
   at SistemaAcademicoINA.Controllers.ActividadesController.GetActividadesByDocente(Int32 idDocente) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Controllers\ActividadesController.cs:line 60
   at lambda_method276(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.AwaitableObjectResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Swashbuckle.AspNetCore.SwaggerUI.SwaggerUIMiddleware.Invoke(HttpContext httpContext)
   at Swashbuckle.AspNetCore.Swagger.SwaggerMiddleware.Invoke(HttpContext httpContext, ISwaggerProvider swaggerProvider)
   at SistemaAcademicoINA.Middleware.ErrorHandlingMiddleware.InvokeAsync(HttpContext context) in C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Middleware\ErrorHandlingMiddleware.cs:line 27', 'DOC001', '/api/actividades/docente/1', '::1', '2026-09-02 16:01:52', 0, '2026-09-02 16:01:52');
-- 17 fila(s) en `errores_sistema`

DROP TABLE IF EXISTS `especialidades`;
CREATE TABLE `especialidades` (
  `id_especialidad` int NOT NULL,
  `nombre_especialidad` varchar(150) NOT NULL,
  `descripcion` text,
  `duracion_anios` int DEFAULT 3,
  `estado` tinyint(1) DEFAULT 1
);
INSERT INTO `especialidades` VALUES (0, 'prueba', 'prueba', 3, 0);
INSERT INTO `especialidades` VALUES (1, 'Tecnico Vocacional en Desarrollo de Software', 'Programacion, bases de datos y desarrollo de aplicaciones', 3, 1);
INSERT INTO `especialidades` VALUES (2, 'Tecnico Vocacional en Administrativo Contable', 'Contabilidad, administracion y planillas', 3, 1);
INSERT INTO `especialidades` VALUES (3, 'Tecnico Productivo en Salud y Bienestar', 'Salud preventiva, primeros auxilios y nutricion', 3, 1);
-- 4 fila(s) en `especialidades`

DROP TABLE IF EXISTS `especialidades_temp`;
CREATE TABLE `especialidades_temp` (
  `id_especialidad` int AUTO_INCREMENT,
  `nombre_especialidad` varchar(100) NOT NULL,
  `descripcion` text,
  `duracion_anios` int DEFAULT 3,
  `estado` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_especialidad`)
);
-- 0 fila(s) en `especialidades_temp`

DROP TABLE IF EXISTS `estadisticas_tablas`;
CREATE TABLE `estadisticas_tablas` (
  `id_estadistica` int AUTO_INCREMENT,
  `tabla` varchar(100) NOT NULL,
  `registros` int DEFAULT 0,
  `tamano_mb` decimal(10,2) DEFAULT 0.00,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_estadistica`)
);
-- 0 fila(s) en `estadisticas_tablas`

DROP TABLE IF EXISTS `estudiantes`;
CREATE TABLE `estudiantes` (
  `id_estudiante` int AUTO_INCREMENT,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `codigo_estudiante` varchar(100) NOT NULL,
  `dui` varchar(10),
  `pasaporte` varchar(50),
  `nacionalidad` varchar(100) DEFAULT Salvadorena,
  `fecha_nacimiento` date,
  `genero` enum('Masculino','Femenino','Otro'),
  `tipo_sangre` varchar(10),
  `enfermedades_cronicas` text,
  `alergias` text,
  `medicamentos` text,
  `discapacidad` tinyint(1) DEFAULT 0,
  `tipo_discapacidad` varchar(100),
  `direccion` text,
  `telefono_fijo` varchar(15),
  `telefono_movil` varchar(15),
  `telefono_emergencia` varchar(15),
  `nombre_contacto_emergencia` varchar(150),
  `parentesco_emergencia` varchar(50),
  `correo_estudiante` varchar(100),
  `id_clase` int,
  `ano_ingreso` year,
  `fecha_matricula` date,
  `nombre_padre` varchar(150),
  `dui_padre` varchar(10),
  `telefono_padre` varchar(15),
  `ocupacion_padre` varchar(100),
  `nombre_madre` varchar(150),
  `dui_madre` varchar(10),
  `telefono_madre` varchar(15),
  `ocupacion_madre` varchar(100),
  `nombre_encargado` varchar(150),
  `telefono_encargado` varchar(15),
  `parentesco_encargado` varchar(50),
  `email_encargado` varchar(100),
  `contrasena` varchar(100),
  `estado` tinyint(1) DEFAULT 1,
  `graduado` tinyint(1) DEFAULT 0,
  `fecha_graduacion` date,
  `id_rol` int,
  `id_aspirante_origen` int,
  `nie` varchar(20) NOT NULL,
  `carnet_menoridad` varchar(20)
,
  PRIMARY KEY (`id_estudiante`)
);
INSERT INTO `estudiantes` VALUES (1, 'Ana Lucia', 'Perez Gomez', '2026-00001-INA', '03000001-1', NULL, 'Salvadorena', '2009-05-12 00:00:00', 'Femenino', 'O+', NULL, NULL, NULL, 0, NULL, 'Colonia San Jose, Apopa', NULL, '7788-4001', NULL, NULL, NULL, 'estudiante@ina.edu.sv', 1, 2026, '2026-01-05 00:00:00', 'Luis Alberto Perez', NULL, '7701-0001', 'Contador', 'Ana Beatriz Gomez', NULL, '7701-0002', 'Ama de casa', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-01', NULL);
INSERT INTO `estudiantes` VALUES (2, 'jose', 'perez', '2026-00002-INA', '03000002-2', NULL, 'Salvadorena', '2008-11-03 00:00:00', 'Masculino', 'A+', NULL, NULL, NULL, 0, NULL, 'Colonia San Jose, Apopa', NULL, '7788-4002', NULL, NULL, NULL, 'josesito@gmail.com', 3, 2026, '2026-01-05 00:00:00', 'Luis Alberto Perez', NULL, '7701-0001', 'Contador', 'Ana Beatriz Gomez', NULL, '7701-0002', 'Ama de casa', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-02', NULL);
INSERT INTO `estudiantes` VALUES (3, 'José Efraín', 'Pérez Argueta', '2026-00010-INA', '03000003-3', NULL, 'Salvadorena', '2009-02-18 00:00:00', 'Masculino', 'O-', NULL, NULL, NULL, 0, NULL, 'Colonia El Carmen, Apopa', NULL, '7788-4003', NULL, NULL, NULL, 'jose19morado@gmail.com', 3, 2026, '2026-01-06 00:00:00', 'Efrain Perez', NULL, '7701-0003', 'Comerciante', 'Rosa Argueta', NULL, '7701-0004', 'Costurera', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-03', NULL);
INSERT INTO `estudiantes` VALUES (4, 'Ian Andrew', 'Bonilla Hernandez', '2026-00013-INA', '03000004-4', NULL, 'Salvadorena', '2009-07-25 00:00:00', 'Masculino', 'B+', NULL, NULL, NULL, 0, NULL, 'Colonia La Campanera, San Salvador', NULL, '7788-4004', NULL, NULL, NULL, 'owenmejia12@gmail.com', 6, 2026, '2026-01-06 00:00:00', 'Miguel Bonilla', NULL, '7701-0005', 'Mecanico', 'Sandra Hernandez', NULL, '7701-0006', 'Enfermera', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-04', NULL);
INSERT INTO `estudiantes` VALUES (5, 'FELIPE MEDRANO', 'Bonilla Suarez', '2026-00103-INA', '03000005-5', NULL, 'Salvadorena', '2008-09-14 00:00:00', 'Masculino', 'A-', NULL, NULL, NULL, 0, NULL, 'Colonia Las Dalias, Apopa', NULL, '7788-4005', NULL, NULL, NULL, 'santamariamadrededios@gmail.com', 7, 2026, '2026-01-06 00:00:00', 'Felipe Bonilla', NULL, '7701-0007', 'Albañil', 'Carmen Suarez', NULL, '7701-0008', 'Vendedora', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-05', NULL);
INSERT INTO `estudiantes` VALUES (6, 'Juan Jose', 'Hernández Perez', '2026-00127-INA', '03000006-6', NULL, 'Salvadorena', '2008-04-22 00:00:00', 'Masculino', 'O+', NULL, NULL, NULL, 0, NULL, 'Canton Santa Lucia, Apopa', NULL, '7788-4006', NULL, NULL, NULL, 'juan19morado@gmail.com', 4, 2026, '2026-01-07 00:00:00', 'Roberto Hernandez', NULL, '7701-0009', 'Agricultor', 'Patricia Perez', NULL, '7701-0010', 'Maestra', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-06', NULL);
INSERT INTO `estudiantes` VALUES (7, 'Carlos Ernesto', 'Martinez Portillo', '2026-00007-INA', '03000007-7', NULL, 'Salvadorena', '2009-06-30 00:00:00', 'Masculino', 'B-', NULL, NULL, NULL, 0, NULL, 'Colonia San Luis, Apopa', NULL, '7788-4007', NULL, NULL, NULL, 'carlos.martinez@pupilo.com', 1, 2026, '2026-01-05 00:00:00', 'Jorge Martinez', NULL, '7701-0011', 'Piloto', 'Iris Portillo', NULL, '7701-0012', 'Secretaria', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-07', NULL);
INSERT INTO `estudiantes` VALUES (8, 'Daniela Beatriz', 'Hernandez Caceres', '2026-00008-INA', '03000008-8', NULL, 'Salvadorena', '2009-01-09 00:00:00', 'Femenino', 'AB+', NULL, NULL, NULL, 0, NULL, 'Residencial Las Flores, Apopa', NULL, '7788-4008', NULL, NULL, NULL, 'daniela.hernandez@pupilo.com', 1, 2026, '2026-01-05 00:00:00', 'Oscar Hernandez', NULL, '7701-0013', 'Contador', 'Ruth Caceres', NULL, '7701-0014', 'Doctora', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-08', NULL);
INSERT INTO `estudiantes` VALUES (9, 'Sofia Alejandra', 'Romero Alas', '2026-00009-INA', '03000009-9', NULL, 'Salvadorena', '2008-08-17 00:00:00', 'Femenino', 'O+', NULL, NULL, NULL, 0, NULL, 'Colonia El Carmen, Apopa', NULL, '7788-4009', NULL, NULL, NULL, 'sofia.romero@pupilo.com', 2, 2026, '2026-01-05 00:00:00', 'Manuel Romero', NULL, '7701-0015', 'Electricista', 'Glenda Alas', NULL, '7701-0016', 'Cocinera', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-09', NULL);
INSERT INTO `estudiantes` VALUES (10, 'Diego Alejandro', 'Mejia Quintanilla', '2026-00011-INA', '03000010-0', NULL, 'Salvadorena', '2008-12-05 00:00:00', 'Masculino', 'A+', NULL, NULL, NULL, 0, NULL, 'Colonia La Solidaridad, Apopa', NULL, '7788-4010', NULL, NULL, NULL, 'diego.mejia@pupilo.com', 2, 2026, '2026-01-05 00:00:00', 'Rene Mejia', NULL, '7701-0017', 'Chofer', 'Iliana Quintanilla', NULL, '7701-0018', 'Ama de casa', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-10', NULL);
INSERT INTO `estudiantes` VALUES (11, 'Katherine Michelle', 'Ayala Serrano', '2026-00012-INA', '03000011-1', NULL, 'Salvadorena', '2009-03-28 00:00:00', 'Femenino', 'O-', NULL, NULL, NULL, 0, NULL, 'Colonia Las Dalias, Apopa', NULL, '7788-4011', NULL, NULL, NULL, 'katherine.ayala@pupilo.com', 3, 2026, '2026-01-06 00:00:00', 'Marcos Ayala', NULL, '7701-0019', 'Policia', 'Julia Serrano', NULL, '7701-0020', 'Enfermera', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-11', NULL);
INSERT INTO `estudiantes` VALUES (12, 'Bryan Jose', 'Orellana Ventura', '2026-00014-INA', '03000012-2', NULL, 'Salvadorena', '2009-10-11 00:00:00', 'Masculino', 'B+', NULL, NULL, NULL, 0, NULL, 'Canton El Rosario, Apopa', NULL, '7788-4012', NULL, NULL, NULL, 'bryan.orellana@pupilo.com', 3, 2026, '2026-01-06 00:00:00', 'Hugo Orellana', NULL, '7701-0021', 'Jardinero', 'Marta Ventura', NULL, '7701-0022', 'Vendedora', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-12', NULL);
INSERT INTO `estudiantes` VALUES (13, 'Gabriela Estefany', 'Alvarado Perez', '2026-00015-INA', '03000013-3', NULL, 'Salvadorena', '2008-07-19 00:00:00', 'Femenino', 'A-', NULL, NULL, NULL, 0, NULL, 'Colonia San Miguel, Apopa', NULL, '7788-4013', NULL, NULL, NULL, 'gabriela.alvarado@pupilo.com', 1, 2026, '2026-01-07 00:00:00', 'Saul Alvarado', NULL, '7701-0023', 'Carpintero', 'Silvia Perez', NULL, '7701-0024', 'Maestra', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-13', NULL);
INSERT INTO `estudiantes` VALUES (14, 'Steven Alexander', 'Rivas Melendez', '2026-00016-INA', '03000014-4', NULL, 'Salvadorena', '2008-05-02 00:00:00', 'Masculino', 'O+', NULL, NULL, NULL, 0, NULL, 'Residencial Las Perlas, Apopa', NULL, '7788-4014', NULL, NULL, NULL, 'steven.rivas@pupilo.com', 4, 2026, '2026-01-07 00:00:00', 'Carlos Rivas', NULL, '7701-0025', 'Mecanico', 'Alicia Melendez', NULL, '7701-0026', 'Ama de casa', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-14', NULL);
INSERT INTO `estudiantes` VALUES (15, 'Andrea Paola', 'Flores Martinez', '2026-00017-INA', '03000015-5', NULL, 'Salvadorena', '2007-11-23 00:00:00', 'Femenino', 'AB+', NULL, NULL, NULL, 0, NULL, 'Colonia El Milagro, Apopa', NULL, '7788-4015', NULL, NULL, NULL, 'andrea.flores@pupilo.com', 5, 2026, '2026-01-07 00:00:00', 'Roberto Flores', NULL, '7701-0027', 'Contador', 'Claudia Ramirez', NULL, '7701-0028', 'Abogada', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-15', NULL);
INSERT INTO `estudiantes` VALUES (16, 'Kevin Josue', 'Vega Campos', '2026-00018-INA', '03000016-6', NULL, 'Salvadorena', '2007-03-15 00:00:00', 'Masculino', 'B-', NULL, NULL, NULL, 0, NULL, 'Colonia La Campanera, Apopa', NULL, '7788-4016', NULL, NULL, NULL, 'kevin.vega@pupilo.com', 5, 2026, '2026-01-07 00:00:00', 'Luis Vega', NULL, '7701-0029', 'Pintor', 'Nancy Campos', NULL, '7701-0030', 'Ama de casa', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-16', NULL);
INSERT INTO `estudiantes` VALUES (17, 'Nancy Michelle', 'Guzman Torres', '2026-00019-INA', '03000017-7', NULL, 'Salvadorena', '2009-01-31 00:00:00', 'Femenino', 'O+', NULL, NULL, NULL, 0, NULL, 'Colonia San Luis, Apopa', NULL, '7788-4017', NULL, NULL, NULL, 'nancy.guzman@pupilo.com', 6, 2026, '2026-01-06 00:00:00', 'Pablo Guzman', NULL, '7701-0031', 'Albañil', 'Sonia Torres', NULL, '7701-0032', 'Costurera', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-17', NULL);
INSERT INTO `estudiantes` VALUES (18, 'Eduardo Saul', 'Menjivar Carballo', '2026-00020-INA', '03000018-8', NULL, 'Salvadorena', '2009-04-08 00:00:00', 'Masculino', 'A+', NULL, NULL, NULL, 0, NULL, 'Canton Joya Grande, Apopa', NULL, '7788-4018', NULL, NULL, NULL, 'eduardo.menjivar@pupilo.com', 6, 2026, '2026-01-06 00:00:00', 'Walter Menjivar', NULL, '7701-0033', 'Agricultor', 'Leticia Carballo', NULL, '7701-0034', 'Ama de casa', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-18', NULL);
INSERT INTO `estudiantes` VALUES (19, 'Patricia Liliana', 'Cruz Escobar', '2026-00021-INA', '03000019-9', NULL, 'Salvadorena', '2008-10-20 00:00:00', 'Femenino', 'O-', NULL, NULL, NULL, 0, NULL, 'Colonia Las Flores, Apopa', NULL, '7788-4019', NULL, NULL, NULL, 'patricia.cruz@pupilo.com', 7, 2026, '2026-01-06 00:00:00', 'Hernan Cruz', NULL, '7701-0035', 'Bombero', 'Vilma Escobar', NULL, '7701-0036', 'Ama de casa', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-19', NULL);
INSERT INTO `estudiantes` VALUES (20, 'Jorge Alberto', 'Herrera Rivas', '2026-00022-INA', '03000020-0', NULL, 'Salvadorena', '2008-02-27 00:00:00', 'Masculino', 'B+', NULL, NULL, NULL, 0, NULL, 'Colonia La Esperanza, Apopa', NULL, '7788-4020', NULL, NULL, NULL, 'jorge.herrera@pupilo.com', 7, 2026, '2026-01-06 00:00:00', 'David Herrera', NULL, '7701-0037', 'Chofer', 'Claribel Rivas', NULL, '7701-0038', 'Cocinera', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-20', NULL);
INSERT INTO `estudiantes` VALUES (21, 'Beatriz Adriana', 'Marroquin Sosa', '2026-00023-INA', '03000021-1', NULL, 'Salvadorena', '2009-09-06 00:00:00', 'Femenino', 'A-', NULL, NULL, NULL, 0, NULL, 'Residencial Los Angeles, Apopa', NULL, '7788-4021', NULL, NULL, NULL, 'beatriz.marroquin@pupilo.com', 8, 2026, '2026-01-07 00:00:00', 'Edwin Marroquin', NULL, '7701-0039', 'Tecnico', 'Karla Sosa', NULL, '7701-0040', 'Enfermera', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-21', NULL);
INSERT INTO `estudiantes` VALUES (22, 'William Ernesto', 'Velasquez Giron', '2026-00024-INA', '03000022-2', NULL, 'Salvadorena', '2009-12-14 00:00:00', 'Masculino', 'O+', NULL, NULL, NULL, 0, NULL, 'Colonia El Zapote, Apopa', NULL, '7788-4022', NULL, NULL, NULL, 'william.velasquez@pupilo.com', 8, 2026, '2026-01-07 00:00:00', 'Mario Velasquez', NULL, '7701-0041', 'Comerciante', 'Rosa Giron', NULL, '7701-0042', 'Vendedora', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, NULL, 'NIE-2026-22', NULL);
INSERT INTO `estudiantes` VALUES (25, 'Luis Eduardo', 'Mejia Benavides', '2026-00025-INA', '02000003-3', NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'luis.mejia@correo.com', 6, 2026, '2026-08-14 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, 3, 'NIE-EXP-003', NULL);
INSERT INTO `estudiantes` VALUES (26, 'Karen Noemi', 'Ayala Martinez', '2026-00026-INA', '02000002-2', NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'karen.ayala@correo.com', 6, 2026, '2026-08-14 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, 2, 'NIE-EXP-002', NULL);
INSERT INTO `estudiantes` VALUES (27, 'Alejandro Rafael', 'Vasquez Portillo', '2026-00027-INA', '02000012-2', NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'alejandro.vasquez@correo.com', 6, 2026, '2026-08-14 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, 12, 'NIE-EXP-012', NULL);
INSERT INTO `estudiantes` VALUES (29, 'Miguel Angel', 'Rivas Salaverria', '2026-00029-INA', '02000001-1', NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'miguel.rivas@correo.com', 11, 2026, '2026-08-16 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, 1, 'NIE-EXP-001', NULL);
INSERT INTO `estudiantes` VALUES (33, 'PRUEBA3', 'prueba3', '2026-00033-INA', '111113454', NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ajdhad@gmail.com', 1, 2026, '2026-08-16 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, 18, '424245242', NULL);
INSERT INTO `estudiantes` VALUES (34, 'PRUEBA2', 'prueba2', '2026-00034-INA', '111111111-', NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'jm@gmail.com', 6, 2026, '2026-08-16 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, 17, '11114463', NULL);
INSERT INTO `estudiantes` VALUES (35, 'Walter Ernesto', 'Pineda Amaya', '2026-00035-INA', '02000010-0', NULL, 'Salvadorena', NULL, NULL, 'B-', NULL, NULL, NULL, 0, NULL, 'Canton Joya Grande, Apopa', 'prueba', '7788-1010', NULL, NULL, NULL, 'walter.pineda@correo.com', 6, 2026, '2026-08-17 00:00:00', 'Salvador Pineda', NULL, '7788-2010', NULL, 'Dina Amaya', NULL, '7788-3010', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, 10, 'NIE-EXP-010', NULL);
INSERT INTO `estudiantes` VALUES (36, 'prueba5', 'prueba5', '2026-00036-INA', NULL, NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2424242424242', '4424242', '68797977', NULL, NULL, NULL, '19931516@clases.edu.sv', 2, 2026, '2026-09-17 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, 27, '112436897', NULL);
INSERT INTO `estudiantes` VALUES (37, 'prueba6', 'prueba6', '2026-00037-INA', NULL, NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '43453', '111111132', '2335535', NULL, NULL, NULL, 'jefferaguiirre@gmail.com', 2, 2026, '2026-09-17 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, 28, '44444444444444', NULL);
INSERT INTO `estudiantes` VALUES (38, 'Joshua Felix', 'Hernández Perez', '2026-00038-INA', NULL, NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '79544646', NULL, NULL, NULL, 'josesitoxd504@gmail.com', 5, 2026, '2026-09-17 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, 29, '747845', NULL);
INSERT INTO `estudiantes` VALUES (39, 'Joshua Felix', 'Bonilla Hernandez', '2026-00039-INA', NULL, NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '22556633', NULL, NULL, NULL, 'joshua19morao@gmail.com', 6, 2026, '2026-09-17 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, 26, '3164665', NULL);
INSERT INTO `estudiantes` VALUES (40, 'ghfgjhgjg', 'dgdghfhfg', '2026-00040-INA', NULL, NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '5dfhfjfgha', 'rrt6757756', '75868657', NULL, NULL, NULL, 'eswampy29naranja@gmail.com', 2, 2026, '2026-09-17 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, 30, '6789689', NULL);
INSERT INTO `estudiantes` VALUES (41, 'Ronald Ernesto ', 'Pérez Argueta', '2026-00041-INA', NULL, NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 'Apopayork', '21541510', '22556633', NULL, NULL, NULL, 'eswampy32morado@gmail.com', 6, 2026, '2026-09-19 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, 7, 31, '1234875966', NULL);
INSERT INTO `estudiantes` VALUES (42, 'prueba10', 'prueba10', '2026-00042-INA', '234567865', NULL, 'Salvadorena', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '34534', '234543', '242435343', NULL, NULL, NULL, 'cuentadetrabajo123mujer@gmail.com', 12, 2026, '2026-09-24 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'jefferaguirrre@gmail.com', NULL, 1, 0, NULL, 7, 33, '23565432', NULL);
-- 36 fila(s) en `estudiantes`

DROP TABLE IF EXISTS `exportaciones_historial`;
CREATE TABLE `exportaciones_historial` (
  `id_exportacion` int AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `nombre_usuario` varchar(200) NOT NULL,
  `rol_usuario` varchar(100) NOT NULL,
  `tipo_exportacion` enum('ClaseMateriaPeriodo','ClaseMateriaTodosPeriodos','ClaseTodasMateriasPeriodo','ClaseTodasMateriasTodosPeriodos','ConsolidadoAnual') NOT NULL,
  `descripcion` varchar(500) NOT NULL,
  `id_clase` int,
  `id_materia` int,
  `id_especialidad` int,
  `id_periodo` int,
  `anio_lectivo` int NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tamano_bytes` bigint NOT NULL DEFAULT 0,
  `total_registros` int NOT NULL DEFAULT 0,
  `ip_origen` varchar(50),
  `user_agent` text,
  `fecha_generacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_descarga` datetime,
  `contador_descargas` int DEFAULT 0,
  `estado` enum('Activo','Eliminado','Expirado') DEFAULT Activo,
  `observaciones` text
,
  PRIMARY KEY (`id_exportacion`)
);
-- 0 fila(s) en `exportaciones_historial`

DROP TABLE IF EXISTS `faltas_amonestaciones`;
CREATE TABLE `faltas_amonestaciones` (
  `id_faltas` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_docente` int,
  `tipo` enum('Falta','Amonestacion','Demerito') NOT NULL,
  `gravedad` enum('Leve','Moderada','Grave') DEFAULT Leve,
  `fecha` date NOT NULL,
  `id_periodo` int,
  `descripcion` text,
  `puntos_demerito` int DEFAULT 0,
  `estado` enum('Activa','Revisada','Apelada') DEFAULT Activa,
  `registrado_por` varchar(100),
  `id_docente_registro` int
,
  PRIMARY KEY (`id_faltas`)
);
INSERT INTO `faltas_amonestaciones` VALUES (1, 2, 1, 'Falta', 'Leve', '2026-02-10 00:00:00', 1, 'Uso de telefono celular en clase sin autorizacion', 2, 'Activa', 'DOC001', 1);
INSERT INTO `faltas_amonestaciones` VALUES (2, 14, 4, 'Amonestacion', 'Moderada', '2026-02-18 00:00:00', 1, 'Interrupciones repetidas durante la clase', 5, 'Activa', 'DOC004', 4);
INSERT INTO `faltas_amonestaciones` VALUES (3, 16, 4, 'Demerito', 'Grave', '2026-02-25 00:00:00', 1, 'Salida del aula sin autorizacion', 8, 'Activa', 'DOC004', 4);
INSERT INTO `faltas_amonestaciones` VALUES (4, 18, 5, 'Falta', 'Leve', '2026-02-12 00:00:00', 1, 'No entrego la tarea asignada', 2, 'Activa', 'DOC005', 5);
INSERT INTO `faltas_amonestaciones` VALUES (5, 13, NULL, 'Falta', 'Leve', '2026-08-14 00:00:00', 3, 'prueba
', 2, 'Activa', NULL, NULL);
INSERT INTO `faltas_amonestaciones` VALUES (7, 3, NULL, 'Falta', 'Leve', '2026-08-17 00:00:00', 4, 'prueba', 2, '', NULL, NULL);
INSERT INTO `faltas_amonestaciones` VALUES (8, 3, NULL, 'Falta', 'Leve', '2026-08-17 00:00:00', 4, 'prueba', 2, '', NULL, NULL);
INSERT INTO `faltas_amonestaciones` VALUES (9, 3, NULL, 'Falta', 'Leve', '2026-08-17 00:00:00', 1, 'prueba', 2, 'Activa', NULL, NULL);
INSERT INTO `faltas_amonestaciones` VALUES (10, 40, NULL, 'Falta', 'Leve', '2026-09-19 00:00:00', 1, 'Prueba Leve
', 2, 'Activa', NULL, NULL);
INSERT INTO `faltas_amonestaciones` VALUES (11, 40, NULL, 'Falta', 'Moderada', '2026-09-19 00:00:00', 1, 'Prueba Moderada', 5, 'Activa', NULL, NULL);
INSERT INTO `faltas_amonestaciones` VALUES (12, 40, NULL, 'Falta', 'Grave', '2026-09-19 00:00:00', 1, 'Prueba Grave', 10, 'Activa', NULL, NULL);
INSERT INTO `faltas_amonestaciones` VALUES (13, 40, 1, 'Amonestacion', 'Leve', '2026-09-20 00:00:00', 1, 'Prueba Docente', 2, 'Activa', NULL, NULL);
-- 12 fila(s) en `faltas_amonestaciones`

DROP TABLE IF EXISTS `grados`;
CREATE TABLE `grados` (
  `id_grados` int NOT NULL,
  `id_nivel` int NOT NULL,
  `numero_grado` int NOT NULL,
  `nombre_grado` varchar(50) NOT NULL,
  `orden` int NOT NULL,
  `estado` tinyint(1) DEFAULT 1
);
INSERT INTO `grados` VALUES (1, 1, 1, 'Primer Año', 1, 1);
INSERT INTO `grados` VALUES (2, 1, 2, 'Segundo Año', 2, 1);
INSERT INTO `grados` VALUES (3, 2, 1, 'Primer Año', 1, 1);
INSERT INTO `grados` VALUES (4, 2, 2, 'Segundo Año', 2, 1);
INSERT INTO `grados` VALUES (5, 2, 3, 'Tercer Año', 3, 1);
INSERT INTO `grados` VALUES (6, 3, 1, 'Primer Año', 1, 1);
INSERT INTO `grados` VALUES (7, 3, 2, 'Segundo Año', 2, 1);
-- 7 fila(s) en `grados`

DROP TABLE IF EXISTS `historial_contrasenas`;
CREATE TABLE `historial_contrasenas` (
  `id_historial` int AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `contrasena_anterior` varchar(255) NOT NULL,
  `contrasena_nueva` varchar(255) NOT NULL,
  `ip` varchar(50),
  `fecha_cambio` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_historial`)
);
-- 0 fila(s) en `historial_contrasenas`

DROP TABLE IF EXISTS `horarios`;
CREATE TABLE `horarios` (
  `id_horario` int AUTO_INCREMENT,
  `id_clase` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_docente` int,
  `jornada` enum('Matutina','Vespertina') NOT NULL,
  `dia_semana` enum('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `aula` varchar(50),
  `id_aula` int,
  `periodo` int,
  `estado` tinyint(1) DEFAULT 1,
  `anio_lectivo` year NOT NULL DEFAULT 2026
,
  PRIMARY KEY (`id_horario`)
);
INSERT INTO `horarios` VALUES (1, 1, 1, 1, 'Matutina', 'Lunes', '08:45:00', '09:30:00', 'A-01', 1, 1, 1, 2026);
INSERT INTO `horarios` VALUES (2, 1, 2, 1, 'Matutina', 'Lunes', '09:30:00', '10:15:00', 'A-01', 1, 1, 0, 2026);
INSERT INTO `horarios` VALUES (3, 1, 5, 3, 'Matutina', 'Martes', '07:00:00', '08:30:00', 'A-02', 2, 1, 1, 2026);
INSERT INTO `horarios` VALUES (4, 1, 3, 2, 'Matutina', 'Lunes', '10:30:00', '11:15:00', 'A-01', 1, 1, 1, 2026);
INSERT INTO `horarios` VALUES (5, 1, 1, 1, 'Matutina', 'Jueves', '08:45:00', '09:30:00', 'A-01', 1, 1, 1, 2026);
INSERT INTO `horarios` VALUES (6, 1, 4, 2, 'Matutina', 'Martes', '09:30:00', '10:15:00', 'A-01', 1, 1, 1, 2026);
INSERT INTO `horarios` VALUES (7, 1, 2, 1, 'Matutina', 'Miercoles', '07:45:00', '08:30:00', 'A-01', 1, 1, 1, 2026);
INSERT INTO `horarios` VALUES (8, 1, 6, 3, 'Matutina', 'Miercoles', '11:15:00', '12:00:00', 'A-03', 3, 1, 1, 2026);
INSERT INTO `horarios` VALUES (9, 1, 1, 1, 'Matutina', 'Jueves', '07:00:00', '07:45:00', 'A-01', 1, 1, 1, 2026);
INSERT INTO `horarios` VALUES (10, 1, 4, 2, 'Matutina', 'Jueves', '07:45:00', '08:30:00', 'A-01', 1, 1, 1, 2026);
INSERT INTO `horarios` VALUES (11, 1, 5, 3, 'Matutina', 'Viernes', '08:45:00', '09:30:00', 'A-02', 2, 1, 1, 2026);
INSERT INTO `horarios` VALUES (12, 1, 3, 2, 'Matutina', 'Viernes', '10:30:00', '11:15:00', 'A-01', 1, 1, 1, 2026);
INSERT INTO `horarios` VALUES (13, 2, 1, 1, 'Matutina', 'Lunes', '07:00:00', '07:45:00', 'A-02', 2, 1, 1, 2026);
INSERT INTO `horarios` VALUES (14, 2, 2, 2, 'Matutina', 'Lunes', '07:45:00', '08:30:00', 'A-02', 2, 1, 1, 2026);
INSERT INTO `horarios` VALUES (15, 2, 5, 3, 'Matutina', 'Martes', '07:45:00', '08:30:00', 'A-01', 1, 1, 1, 2026);
INSERT INTO `horarios` VALUES (16, 2, 4, 2, 'Matutina', 'Lunes', '08:45:00', '09:30:00', 'A-02', 2, 1, 1, 2026);
INSERT INTO `horarios` VALUES (17, 2, 3, 2, 'Matutina', 'Miercoles', '07:45:00', '08:30:00', 'A-02', 2, 1, 1, 2026);
INSERT INTO `horarios` VALUES (18, 2, 1, 1, 'Matutina', 'Miercoles', '07:00:00', '07:45:00', 'A-02', 2, 1, 1, 2026);
INSERT INTO `horarios` VALUES (19, 2, 4, 2, 'Matutina', 'Jueves', '09:30:00', '10:15:00', 'A-02', 2, 1, 1, 2026);
INSERT INTO `horarios` VALUES (20, 2, 5, 3, 'Matutina', 'Viernes', '07:45:00', '08:30:00', 'A-01', 1, 1, 1, 2026);
INSERT INTO `horarios` VALUES (21, 3, 7, 4, 'Matutina', 'Miercoles', '09:30:00', '10:15:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (22, 3, 8, 4, 'Matutina', 'Jueves', '07:00:00', '07:45:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (23, 3, 5, 3, 'Matutina', 'Lunes', '08:45:00', '09:30:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (24, 3, 6, 3, 'Matutina', 'Lunes', '10:30:00', '11:15:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (25, 3, 7, 4, 'Matutina', 'Miercoles', '07:45:00', '08:30:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (26, 3, 8, 4, 'Matutina', 'Martes', '08:45:00', '09:30:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (27, 3, 7, 4, 'Matutina', 'Miercoles', '08:45:00', '09:30:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (28, 3, 8, 4, 'Matutina', 'Viernes', '07:45:00', '08:30:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (29, 3, 7, 4, 'Matutina', 'Viernes', '08:45:00', '09:30:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (30, 4, 7, 4, 'Matutina', 'Viernes', '07:00:00', '07:45:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (31, 4, 8, 4, 'Matutina', 'Jueves', '08:45:00', '09:30:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (32, 4, 7, 4, 'Matutina', 'Jueves', '09:30:00', '10:15:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (33, 4, 8, 4, 'Matutina', 'Miercoles', '07:00:00', '07:45:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (34, 4, 7, 4, 'Matutina', 'Jueves', '07:45:00', '08:30:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (35, 4, 8, 4, 'Matutina', 'Viernes', '10:30:00', '11:15:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (36, 5, 7, 4, 'Matutina', 'Lunes', '07:00:00', '07:45:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (37, 5, 8, 4, 'Matutina', 'Lunes', '10:30:00', '11:15:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (38, 5, 7, 4, 'Matutina', 'Martes', '09:30:00', '10:15:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (39, 5, 8, 4, 'Matutina', 'Viernes', '11:15:00', '12:00:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (40, 6, 10, 5, 'Matutina', 'Lunes', '07:00:00', '07:45:00', 'LAB-02', 6, 1, 1, 2026);
INSERT INTO `horarios` VALUES (41, 6, 11, 5, 'Matutina', 'Lunes', '07:45:00', '08:30:00', 'LAB-02', 6, 1, 1, 2026);
INSERT INTO `horarios` VALUES (42, 6, 5, 3, 'Matutina', 'Jueves', '07:00:00', '07:45:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (43, 6, 6, 3, 'Matutina', 'Lunes', '09:30:00', '10:15:00', 'LAB-02', 6, 1, 1, 2026);
INSERT INTO `horarios` VALUES (44, 6, 10, 5, 'Matutina', 'Martes', '07:00:00', '07:45:00', 'LAB-02', 6, 1, 1, 2026);
INSERT INTO `horarios` VALUES (45, 6, 11, 5, 'Matutina', 'Miercoles', '07:45:00', '08:30:00', 'LAB-02', 6, 1, 1, 2026);
INSERT INTO `horarios` VALUES (46, 7, 12, 6, 'Matutina', 'Lunes', '09:30:00', '10:15:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (47, 7, 13, 6, 'Matutina', 'Lunes', '07:45:00', '08:30:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (48, 7, 12, 6, 'Matutina', 'Miercoles', '08:45:00', '09:30:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (49, 7, 13, 6, 'Matutina', 'Jueves', '07:45:00', '08:30:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (50, 8, 7, 4, 'Matutina', 'Martes', '07:45:00', '08:30:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (51, 8, 8, 4, 'Matutina', 'Lunes', '09:30:00', '10:15:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (52, 8, 5, 3, 'Matutina', 'Lunes', '11:15:00', '12:00:00', 'B-01', 4, 1, 1, 2026);
INSERT INTO `horarios` VALUES (53, 8, 7, 4, 'Matutina', 'Martes', '07:00:00', '07:45:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (54, 8, 8, 4, 'Matutina', 'Viernes', '09:30:00', '10:15:00', 'LAB-01', 5, 1, 1, 2026);
INSERT INTO `horarios` VALUES (57, 1, 3, 4, 'Matutina', 'Lunes', '07:45:00', '08:30:00', 'f6', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (58, 1, 2, 5, 'Matutina', 'Viernes', '07:00:00', '08:45:00', 'Q3', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (59, 1, 2, 5, 'Matutina', 'Viernes', '07:45:00', '08:30:00', 'Q3', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (60, 1, 5, 5, 'Matutina', 'Martes', '07:45:00', '08:30:00', 'A', NULL, NULL, 0, 2026);
INSERT INTO `horarios` VALUES (61, 1, 14, 6, 'Vespertina', 'Lunes', '05:15:00', '06:00:00', NULL, NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (62, 1, 3, 3, 'Matutina', 'Lunes', '07:00:00', '07:45:00', 'prueba', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (63, 3, 3, 2, 'Matutina', 'Lunes', '07:00:00', '07:45:00', 'd3', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (64, 3, 3, 2, 'Matutina', 'Martes', '07:00:00', '07:45:00', 'd1', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (65, 3, 6, 3, 'Matutina', 'Miercoles', '07:00:00', '07:45:00', 'e1', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (66, 3, 8, 3, 'Matutina', 'Viernes', '07:00:00', '07:45:00', 'prueba', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (67, 3, 3, 3, 'Matutina', 'Lunes', '07:45:00', '08:30:00', 'prueba', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (68, 3, 4, 2, 'Matutina', 'Martes', '07:45:00', '08:30:00', 'prueba', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (69, 3, 4, 3, 'Matutina', 'Jueves', '07:45:00', '08:30:00', 'prueba', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (70, 3, 1, 3, 'Matutina', 'Jueves', '08:45:00', '09:30:00', 'prueba', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (71, 3, 3, 3, 'Matutina', 'Lunes', '13:00:00', '13:45:00', 'prueba', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (72, 3, 3, 2, 'Matutina', 'Viernes', '17:15:00', '18:00:00', 'prueba', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (73, 2, 8, 1, 'Matutina', 'Martes', '07:00:00', '07:45:00', 'prueba', NULL, NULL, 0, 2026);
INSERT INTO `horarios` VALUES (74, 1, 8, 1, 'Matutina', 'Martes', '07:45:00', '08:30:00', 'prueba', NULL, NULL, 1, 2026);
INSERT INTO `horarios` VALUES (75, 2, 3, 3, 'Matutina', 'Martes', '08:45:00', '09:30:00', 'D4', NULL, NULL, 1, 2026);
-- 73 fila(s) en `horarios`

DROP TABLE IF EXISTS `imagenes_publicas`;
CREATE TABLE `imagenes_publicas` (
  `id_imagen` int AUTO_INCREMENT,
  `pagina` varchar(50) NOT NULL,
  `seccion` varchar(100),
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta` varchar(500) NOT NULL,
  `descripcion` varchar(255),
  `fecha_subida` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `subida_por` varchar(100),
  `activo` tinyint(1) NOT NULL DEFAULT 1
,
  PRIMARY KEY (`id_imagen`)
);
-- 0 fila(s) en `imagenes_publicas`

DROP TABLE IF EXISTS `inscripciones`;
CREATE TABLE `inscripciones` (
  `id_inscripciones` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `fecha_inscripcion` date,
  `fecha_matricula` date,
  `tipo_inscripcion` enum('Nuevo Ingreso','Regular','Repitente','Traslado') DEFAULT Nuevo Ingreso,
  `estado_inscripcion` enum('Pendiente','Confirmada','Cancelada','Retirado') DEFAULT Pendiente,
  `estado_aprobacion` enum('Pendiente','Aprobada','Rechazada') DEFAULT Pendiente,
  `fecha_aprobacion` datetime,
  `aprobado_por` varchar(100),
  `motivo_rechazo` text,
  `numero_expediente` varchar(50),
  `numero_carnet` varchar(50),
  `documentos_presentados` text,
  `id_aspirante_origen` int,
  `nie` varchar(20),
  `carnet_menoridad` varchar(20)
,
  PRIMARY KEY (`id_inscripciones`)
);
INSERT INTO `inscripciones` VALUES (1, 1, 1, 2026, '2026-01-05 00:00:00', '2026-01-05 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-05 08:30:00', 'Registro Academico', NULL, 'EXP-2026-001', 'CARNET-2026-001', 'Partida, Notas', NULL, 'NIE-2026-01', NULL);
INSERT INTO `inscripciones` VALUES (2, 2, 1, 2026, '2026-01-05 00:00:00', '2026-01-05 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-05 08:35:00', 'Registro Academico', NULL, 'EXP-2026-002', 'CARNET-2026-002', 'Partida, Notas', NULL, 'NIE-2026-02', NULL);
INSERT INTO `inscripciones` VALUES (3, 3, 3, 2026, '2026-01-06 00:00:00', '2026-01-06 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-06 08:30:00', 'Registro Academico', NULL, 'EXP-2026-003', 'CARNET-2026-003', 'Partida, Notas, DUI', NULL, 'NIE-2026-03', NULL);
INSERT INTO `inscripciones` VALUES (4, 4, 6, 2026, '2026-01-06 00:00:00', '2026-01-06 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-06 09:00:00', 'Registro Academico', NULL, 'EXP-2026-004', 'CARNET-2026-004', 'Partida, Notas', NULL, 'NIE-2026-04', NULL);
INSERT INTO `inscripciones` VALUES (5, 5, 7, 2026, '2026-01-06 00:00:00', '2026-01-06 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-06 09:10:00', 'Registro Academico', NULL, 'EXP-2026-005', 'CARNET-2026-005', 'Partida, Notas, Carnet', NULL, 'NIE-2026-05', NULL);
INSERT INTO `inscripciones` VALUES (6, 6, 4, 2026, '2026-01-07 00:00:00', '2026-01-07 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-07 08:40:00', 'Registro Academico', NULL, 'EXP-2026-006', 'CARNET-2026-006', 'Partida, Notas', NULL, 'NIE-2026-06', NULL);
INSERT INTO `inscripciones` VALUES (7, 7, 1, 2026, '2026-01-05 00:00:00', '2026-01-06 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-01-06 10:00:00', 'Registro Academico', NULL, 'EXP-2026-007', 'CARNET-2026-007', 'Partida, Notas', NULL, 'NIE-2026-07', NULL);
INSERT INTO `inscripciones` VALUES (8, 8, 1, 2026, '2026-01-05 00:00:00', '2026-01-06 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-01-06 10:05:00', 'Registro Academico', NULL, 'EXP-2026-008', 'CARNET-2026-008', 'Partida, Notas', NULL, 'NIE-2026-08', NULL);
INSERT INTO `inscripciones` VALUES (9, 9, 2, 2026, '2026-01-05 00:00:00', '2026-01-06 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-06 10:10:00', 'Registro Academico', NULL, 'EXP-2026-009', 'CARNET-2026-009', 'Partida, Notas', NULL, 'NIE-2026-09', NULL);
INSERT INTO `inscripciones` VALUES (10, 10, 2, 2026, '2026-01-05 00:00:00', '2026-01-06 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-06 10:15:00', 'Registro Academico', NULL, 'EXP-2026-010', 'CARNET-2026-010', 'Partida, Notas', NULL, 'NIE-2026-10', NULL);
INSERT INTO `inscripciones` VALUES (11, 11, 3, 2026, '2026-01-06 00:00:00', '2026-01-07 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-01-07 09:00:00', 'Registro Academico', NULL, 'EXP-2026-011', 'CARNET-2026-011', 'Partida, Notas, Carnet', NULL, 'NIE-2026-11', NULL);
INSERT INTO `inscripciones` VALUES (12, 12, 3, 2026, '2026-01-06 00:00:00', '2026-01-07 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-01-07 09:05:00', 'Registro Academico', NULL, 'EXP-2026-012', 'CARNET-2026-012', 'Partida, Notas', NULL, 'NIE-2026-12', NULL);
INSERT INTO `inscripciones` VALUES (13, 13, 6, 2026, '2026-01-07 00:00:00', '2026-01-07 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-07 09:10:00', 'Registro Academico', NULL, 'EXP-2026-013', 'CARNET-2026-013', 'Partida, Notas', NULL, 'NIE-2026-13', NULL);
INSERT INTO `inscripciones` VALUES (14, 14, 4, 2026, '2026-01-07 00:00:00', '2026-01-07 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-07 09:15:00', 'Registro Academico', NULL, 'EXP-2026-014', 'CARNET-2026-014', 'Partida, Notas', NULL, 'NIE-2026-14', NULL);
INSERT INTO `inscripciones` VALUES (15, 15, 5, 2026, '2026-01-07 00:00:00', '2026-01-07 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-07 09:20:00', 'Registro Academico', NULL, 'EXP-2026-015', 'CARNET-2026-015', 'Partida, Notas', NULL, 'NIE-2026-15', NULL);
INSERT INTO `inscripciones` VALUES (16, 16, 5, 2026, '2026-01-07 00:00:00', '2026-01-07 00:00:00', 'Regular', 'Confirmada', 'Aprobada', '2026-01-07 09:25:00', 'Registro Academico', NULL, 'EXP-2026-016', 'CARNET-2026-016', 'Partida, Notas', NULL, 'NIE-2026-16', NULL);
INSERT INTO `inscripciones` VALUES (17, 17, 6, 2026, '2026-01-06 00:00:00', '2026-01-07 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-01-07 09:30:00', 'Registro Academico', NULL, 'EXP-2026-017', 'CARNET-2026-017', 'Partida, Notas, Carnet', NULL, 'NIE-2026-17', NULL);
INSERT INTO `inscripciones` VALUES (18, 18, 6, 2026, '2026-01-06 00:00:00', '2026-01-07 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-01-07 09:35:00', 'Registro Academico', NULL, 'EXP-2026-018', 'CARNET-2026-018', 'Partida, Notas', NULL, 'NIE-2026-18', NULL);
INSERT INTO `inscripciones` VALUES (19, 19, 7, 2026, '2026-01-06 00:00:00', '2026-01-07 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-01-07 09:40:00', 'Registro Academico', NULL, 'EXP-2026-019', 'CARNET-2026-019', 'Partida, Notas, DUI', NULL, 'NIE-2026-19', NULL);
INSERT INTO `inscripciones` VALUES (20, 20, 7, 2026, '2026-01-06 00:00:00', '2026-01-07 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-01-07 09:45:00', 'Registro Academico', NULL, 'EXP-2026-020', 'CARNET-2026-020', 'Partida, Notas', NULL, 'NIE-2026-20', NULL);
INSERT INTO `inscripciones` VALUES (21, 21, 8, 2026, '2026-01-07 00:00:00', '2026-01-08 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-01-08 09:00:00', 'Registro Academico', NULL, 'EXP-2026-021', 'CARNET-2026-021', 'Partida, Notas, Carnet', NULL, 'NIE-2026-21', NULL);
INSERT INTO `inscripciones` VALUES (22, 22, 8, 2026, '2026-01-07 00:00:00', '2026-01-08 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-01-08 09:05:00', 'Registro Academico', NULL, 'EXP-2026-022', 'CARNET-2026-022', 'Partida, Notas', NULL, 'NIE-2026-22', NULL);
INSERT INTO `inscripciones` VALUES (23, 25, 6, 2026, '2026-08-14 00:00:00', '2026-08-14 00:00:00', 'Regular', 'Confirmada', 'Pendiente', NULL, NULL, NULL, 'EXP-2026-25', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `inscripciones` VALUES (24, 26, 6, 2026, '2026-08-14 00:00:00', '2026-08-14 00:00:00', 'Regular', 'Confirmada', 'Pendiente', NULL, NULL, NULL, 'EXP-2026-26', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `inscripciones` VALUES (26, 27, 6, 2026, '2026-08-14 00:00:00', '2026-08-14 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-08-14 00:00:00', 'Direccion', NULL, NULL, NULL, 'Partida de Nacimiento, Notas', 12, 'NIE-EXP-012', NULL);
INSERT INTO `inscripciones` VALUES (27, 29, 11, 2026, '2026-08-16 00:00:00', '2026-08-16 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-08-16 00:00:00', 'Direccion', NULL, NULL, NULL, 'Partida de Nacimiento, Notas', 1, 'NIE-EXP-001', NULL);
INSERT INTO `inscripciones` VALUES (28, 33, 1, 2026, '2026-08-16 00:00:00', '2026-08-16 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-08-16 00:00:00', 'Direccion', NULL, NULL, NULL, NULL, 18, '424245242', NULL);
INSERT INTO `inscripciones` VALUES (29, 34, 6, 2026, '2026-08-16 00:00:00', '2026-08-16 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-08-16 00:00:00', 'Direccion', NULL, NULL, NULL, NULL, 17, '11114463', NULL);
INSERT INTO `inscripciones` VALUES (33, 35, 6, 2026, '2026-08-17 00:00:00', '2026-08-17 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-08-16 21:25:23', 'Registro Academico', NULL, 'prueba', 'prueba', 'prueba', 10, 'NIE-EXP-010', NULL);
INSERT INTO `inscripciones` VALUES (34, 36, 2, 2026, '2026-09-17 00:00:00', '2026-09-17 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-09-16 21:14:10', 'Registro Academico', NULL, '253542', '142353536', NULL, 27, '112436897', NULL);
INSERT INTO `inscripciones` VALUES (35, 37, 2, 2026, '2026-09-17 00:00:00', '2026-09-17 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-09-16 23:04:29', 'Registro Academico', NULL, NULL, '11111111', NULL, 28, '44444444444444', NULL);
INSERT INTO `inscripciones` VALUES (36, 38, 5, 2026, '2026-09-17 00:00:00', '2026-09-17 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-09-16 23:44:47', 'Registro Academico', NULL, NULL, '', NULL, 29, '747845', NULL);
INSERT INTO `inscripciones` VALUES (37, 39, 6, 2026, '2026-09-17 00:00:00', '2026-09-17 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-09-16 23:45:04', 'Registro Academico', NULL, NULL, '', NULL, 26, '3164665', NULL);
INSERT INTO `inscripciones` VALUES (38, 40, 2, 2026, '2026-09-17 00:00:00', '2026-09-17 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-09-17 11:31:19', 'Registro Academico', NULL, '235253', '456', 'aa', 30, '6789689', NULL);
INSERT INTO `inscripciones` VALUES (39, 41, 6, 2026, '2026-09-19 00:00:00', '2026-09-19 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-09-19 11:44:56', 'Registro Academico', NULL, '2026-001-01', '12345678', NULL, 31, '1234875966', NULL);
INSERT INTO `inscripciones` VALUES (40, 42, 12, 2026, '2026-09-24 00:00:00', '2026-09-24 00:00:00', 'Nuevo Ingreso', 'Confirmada', 'Aprobada', '2026-09-23 21:12:21', 'Registro Academico', NULL, NULL, '23565', NULL, 33, '23565432', '23565');
-- 36 fila(s) en `inscripciones`

DROP TABLE IF EXISTS `integridad_datos`;
CREATE TABLE `integridad_datos` (
  `id_integridad` int AUTO_INCREMENT,
  `tabla` varchar(100) NOT NULL,
  `registros_ok` int DEFAULT 0,
  `registros_error` int DEFAULT 0,
  `errores` text,
  `fecha_verificacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_integridad`)
);
-- 0 fila(s) en `integridad_datos`

DROP TABLE IF EXISTS `intentos_login`;
CREATE TABLE `intentos_login` (
  `id_intento` int AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `ip` varchar(50),
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `exitoso` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_intento`)
);
INSERT INTO `intentos_login` VALUES (3, 'REG001', '::1', '2026-08-14 19:09:00', 1, '2026-08-14 19:09:00');
INSERT INTO `intentos_login` VALUES (4, 'admin', '::1', '2026-08-14 19:33:58', 1, '2026-08-14 19:33:58');
INSERT INTO `intentos_login` VALUES (10, 'DOC001', '::1', '2026-08-14 20:28:01', 1, '2026-08-14 20:28:01');
INSERT INTO `intentos_login` VALUES (11, 'Jose19morado@gmail.com', '::1', '2026-08-14 20:28:50', 1, '2026-08-14 20:28:50');
INSERT INTO `intentos_login` VALUES (13, 'xx', '::1', '2026-08-14 21:32:55', 0, '2026-08-14 21:32:55');
INSERT INTO `intentos_login` VALUES (15, 'admin', '::1', '2026-08-14 22:12:35', 1, '2026-08-14 22:12:35');
INSERT INTO `intentos_login` VALUES (16, '2026-00010-INA', '::1', '2026-08-14 22:13:38', 1, '2026-08-14 22:13:38');
INSERT INTO `intentos_login` VALUES (17, 'DOC001', '::1', '2026-08-14 22:13:45', 1, '2026-08-14 22:13:45');
INSERT INTO `intentos_login` VALUES (19, 'REG001', '::1', '2026-08-14 22:15:12', 1, '2026-08-14 22:15:12');
INSERT INTO `intentos_login` VALUES (20, 'admin', '::1', '2026-08-14 22:15:32', 1, '2026-08-14 22:15:32');
INSERT INTO `intentos_login` VALUES (22, 'DOC001', '::1', '2026-08-16 11:29:19', 1, '2026-08-16 11:29:19');
INSERT INTO `intentos_login` VALUES (24, 'DOC001', '::1', '2026-08-16 12:00:50', 1, '2026-08-16 12:00:50');
INSERT INTO `intentos_login` VALUES (26, 'DOC001', '::1', '2026-08-16 12:24:51', 1, '2026-08-16 12:24:51');
INSERT INTO `intentos_login` VALUES (27, '2026-00010-INA', '::1', '2026-08-16 13:56:42', 1, '2026-08-16 13:56:42');
INSERT INTO `intentos_login` VALUES (29, '2026-00010-INA', '::1', '2026-08-16 15:46:13', 1, '2026-08-16 15:46:13');
INSERT INTO `intentos_login` VALUES (32, 'admin', '::1', '2026-08-16 15:55:37', 1, '2026-08-16 15:55:37');
INSERT INTO `intentos_login` VALUES (33, 'DOC001', '::1', '2026-08-16 17:03:52', 1, '2026-08-16 17:03:52');
INSERT INTO `intentos_login` VALUES (35, '2026-00010-INA', '::1', '2026-08-16 17:06:33', 1, '2026-08-16 17:06:33');
INSERT INTO `intentos_login` VALUES (37, '2026-00010-INA', '::1', '2026-08-16 17:09:29', 1, '2026-08-16 17:09:29');
INSERT INTO `intentos_login` VALUES (38, 'DOC001', '::1', '2026-08-16 17:11:28', 1, '2026-08-16 17:11:28');
INSERT INTO `intentos_login` VALUES (41, 'DOC001', '::1', '2026-08-16 17:17:09', 1, '2026-08-16 17:17:09');
INSERT INTO `intentos_login` VALUES (44, 'REG001', '::1', '2026-08-16 17:23:09', 1, '2026-08-16 17:23:09');
INSERT INTO `intentos_login` VALUES (45, 'admin', '::1', '2026-08-16 17:23:39', 1, '2026-08-16 17:23:39');
INSERT INTO `intentos_login` VALUES (47, 'admin', '::1', '2026-08-16 18:01:28', 1, '2026-08-16 18:01:28');
INSERT INTO `intentos_login` VALUES (50, 'admin', '::1', '2026-08-16 18:20:13', 1, '2026-08-16 18:20:13');
INSERT INTO `intentos_login` VALUES (51, 'admin', '::1', '2026-08-16 18:38:09', 1, '2026-08-16 18:38:09');
INSERT INTO `intentos_login` VALUES (54, '2026-00010-INA', '::1', '2026-08-16 18:59:00', 1, '2026-08-16 18:59:00');
INSERT INTO `intentos_login` VALUES (74, '2026-00010-INA', '::1', '2026-08-16 19:34:36', 1, '2026-08-16 19:34:36');
INSERT INTO `intentos_login` VALUES (77, '2026-00010-INA', '::1', '2026-08-16 19:46:17', 1, '2026-08-16 19:46:17');
INSERT INTO `intentos_login` VALUES (78, 'DIR001', '::1', '2026-08-16 19:47:20', 1, '2026-08-16 19:47:20');
INSERT INTO `intentos_login` VALUES (79, '2026-00010-INA', '::1', '2026-08-16 19:47:55', 1, '2026-08-16 19:47:55');
INSERT INTO `intentos_login` VALUES (80, 'DIR001', '::1', '2026-08-16 19:49:08', 1, '2026-08-16 19:49:08');
INSERT INTO `intentos_login` VALUES (81, 'DIR001', '::1', '2026-08-16 19:50:51', 1, '2026-08-16 19:50:51');
INSERT INTO `intentos_login` VALUES (82, '2026-00010-INA', '::1', '2026-08-16 19:56:13', 1, '2026-08-16 19:56:13');
INSERT INTO `intentos_login` VALUES (83, 'DIR001', '::1', '2026-08-16 19:56:53', 1, '2026-08-16 19:56:53');
INSERT INTO `intentos_login` VALUES (84, 'DOC001', '::1', '2026-08-16 19:59:33', 1, '2026-08-16 19:59:33');
INSERT INTO `intentos_login` VALUES (85, 'REG001', '::1', '2026-08-16 19:59:39', 1, '2026-08-16 19:59:39');
INSERT INTO `intentos_login` VALUES (86, 'DIR001', '::1', '2026-08-16 19:59:49', 1, '2026-08-16 19:59:49');
INSERT INTO `intentos_login` VALUES (87, 'admin', '::1', '2026-08-16 20:00:39', 1, '2026-08-16 20:00:39');
INSERT INTO `intentos_login` VALUES (88, 'DIR001', '::1', '2026-08-16 20:01:26', 1, '2026-08-16 20:01:26');
INSERT INTO `intentos_login` VALUES (89, 'REG001', '::1', '2026-08-16 20:08:05', 1, '2026-08-16 20:08:05');
INSERT INTO `intentos_login` VALUES (90, 'DIR001', '::1', '2026-08-16 20:09:30', 1, '2026-08-16 20:09:30');
INSERT INTO `intentos_login` VALUES (91, '2026-00010-INA', '::1', '2026-08-16 20:10:18', 1, '2026-08-16 20:10:18');
INSERT INTO `intentos_login` VALUES (92, 'DIR001', '::1', '2026-08-16 20:11:58', 1, '2026-08-16 20:11:58');
INSERT INTO `intentos_login` VALUES (93, 'REG001', '::1', '2026-08-16 20:12:05', 1, '2026-08-16 20:12:05');
INSERT INTO `intentos_login` VALUES (94, 'DIR001', '::1', '2026-08-16 20:21:20', 1, '2026-08-16 20:21:20');
INSERT INTO `intentos_login` VALUES (95, 'REG001', '::1', '2026-08-16 20:22:06', 1, '2026-08-16 20:22:06');
INSERT INTO `intentos_login` VALUES (96, 'DIR001', '::1', '2026-08-16 21:23:58', 1, '2026-08-16 21:23:58');
INSERT INTO `intentos_login` VALUES (97, 'REG001', '::1', '2026-08-16 21:24:24', 1, '2026-08-16 21:24:24');
INSERT INTO `intentos_login` VALUES (98, 'admin', '::1', '2026-08-16 21:25:48', 1, '2026-08-16 21:25:48');
INSERT INTO `intentos_login` VALUES (99, '2026-00035-INA', '::1', '2026-08-16 21:26:31', 1, '2026-08-16 21:26:31');
INSERT INTO `intentos_login` VALUES (100, 'DIR001', '::1', '2026-08-16 21:26:42', 1, '2026-08-16 21:26:42');
INSERT INTO `intentos_login` VALUES (101, 'REG001', '::1', '2026-08-16 21:26:47', 1, '2026-08-16 21:26:47');
INSERT INTO `intentos_login` VALUES (102, 'DIR001', '::1', '2026-08-16 21:44:00', 1, '2026-08-16 21:44:00');
INSERT INTO `intentos_login` VALUES (103, 'DOC001', '::1', '2026-08-16 21:44:43', 1, '2026-08-16 21:44:43');
INSERT INTO `intentos_login` VALUES (104, 'DIR001', '::1', '2026-08-16 21:45:18', 1, '2026-08-16 21:45:18');
INSERT INTO `intentos_login` VALUES (105, 'REG001', '::1', '2026-08-16 21:45:31', 1, '2026-08-16 21:45:31');
INSERT INTO `intentos_login` VALUES (106, 'DOC001', '::1', '2026-08-16 21:45:39', 1, '2026-08-16 21:45:39');
INSERT INTO `intentos_login` VALUES (107, 'DIR001', '::1', '2026-08-16 21:46:16', 1, '2026-08-16 21:46:16');
INSERT INTO `intentos_login` VALUES (108, 'REG001', '::1', '2026-08-16 21:46:53', 1, '2026-08-16 21:46:53');
INSERT INTO `intentos_login` VALUES (109, 'DIR001', '::1', '2026-08-16 22:00:40', 1, '2026-08-16 22:00:40');
INSERT INTO `intentos_login` VALUES (110, 'REG001', '::1', '2026-08-16 22:01:22', 1, '2026-08-16 22:01:22');
INSERT INTO `intentos_login` VALUES (111, 'DIR001', '::1', '2026-08-16 22:22:16', 1, '2026-08-16 22:22:16');
INSERT INTO `intentos_login` VALUES (112, 'DOC001', '::1', '2026-08-16 22:22:45', 1, '2026-08-16 22:22:45');
INSERT INTO `intentos_login` VALUES (113, 'REG001', '::1', '2026-08-16 22:23:09', 1, '2026-08-16 22:23:09');
INSERT INTO `intentos_login` VALUES (114, 'admin', '::1', '2026-08-16 22:23:25', 1, '2026-08-16 22:23:25');
INSERT INTO `intentos_login` VALUES (115, 'DIR001', '::1', '2026-08-16 22:23:38', 1, '2026-08-16 22:23:38');
INSERT INTO `intentos_login` VALUES (116, 'REG001', '::1', '2026-08-16 22:25:48', 1, '2026-08-16 22:25:48');
INSERT INTO `intentos_login` VALUES (117, 'DIR001', '::1', '2026-08-16 22:38:27', 1, '2026-08-16 22:38:27');
INSERT INTO `intentos_login` VALUES (118, 'DOC001', '::1', '2026-08-16 22:38:48', 1, '2026-08-16 22:38:48');
INSERT INTO `intentos_login` VALUES (119, 'DIR001', '::1', '2026-08-16 22:39:15', 1, '2026-08-16 22:39:15');
INSERT INTO `intentos_login` VALUES (120, 'REG001', '::1', '2026-08-16 22:54:13', 1, '2026-08-16 22:54:13');
INSERT INTO `intentos_login` VALUES (121, 'admin', '::1', '2026-08-16 23:13:49', 1, '2026-08-16 23:13:49');
INSERT INTO `intentos_login` VALUES (122, 'DIR001', '::1', '2026-08-16 23:14:08', 1, '2026-08-16 23:14:08');
INSERT INTO `intentos_login` VALUES (123, 'DIR001', '::1', '2026-08-16 23:19:52', 1, '2026-08-16 23:19:52');
INSERT INTO `intentos_login` VALUES (124, 'DIR001', '::1', '2026-08-17 07:12:51', 1, '2026-08-17 07:12:51');
INSERT INTO `intentos_login` VALUES (125, 'DOC001', '::1', '2026-08-17 07:16:27', 1, '2026-08-17 07:16:27');
INSERT INTO `intentos_login` VALUES (126, 'DOC001', '::1', '2026-08-17 07:24:42', 1, '2026-08-17 07:24:42');
INSERT INTO `intentos_login` VALUES (127, 'DOC001', '::1', '2026-08-17 07:24:57', 1, '2026-08-17 07:24:57');
INSERT INTO `intentos_login` VALUES (128, 'DIR001', '::1', '2026-08-17 07:25:02', 1, '2026-08-17 07:25:02');
INSERT INTO `intentos_login` VALUES (129, 'DIR001', '::1', '2026-08-17 07:27:28', 1, '2026-08-17 07:27:28');
INSERT INTO `intentos_login` VALUES (130, 'DIR001', '::1', '2026-08-17 07:28:36', 1, '2026-08-17 07:28:36');
INSERT INTO `intentos_login` VALUES (131, 'DIR001', '::1', '2026-08-17 07:39:53', 1, '2026-08-17 07:39:53');
INSERT INTO `intentos_login` VALUES (132, 'DIR001', '::1', '2026-08-17 07:43:08', 1, '2026-08-17 07:43:08');
INSERT INTO `intentos_login` VALUES (133, 'DIR001', '::1', '2026-08-17 07:46:10', 1, '2026-08-17 07:46:10');
INSERT INTO `intentos_login` VALUES (134, 'DIR001', '::1', '2026-08-17 07:46:47', 1, '2026-08-17 07:46:47');
INSERT INTO `intentos_login` VALUES (135, 'DIR001', '::1', '2026-08-17 07:48:07', 1, '2026-08-17 07:48:07');
INSERT INTO `intentos_login` VALUES (136, 'DIR001', '::1', '2026-08-17 07:55:56', 1, '2026-08-17 07:55:56');
INSERT INTO `intentos_login` VALUES (137, 'DIR001', '::1', '2026-08-17 09:06:26', 1, '2026-08-17 09:06:26');
INSERT INTO `intentos_login` VALUES (138, 'DIR001', '::1', '2026-08-17 09:08:21', 1, '2026-08-17 09:08:21');
INSERT INTO `intentos_login` VALUES (139, 'DOC001', '::1', '2026-08-17 09:10:30', 1, '2026-08-17 09:10:30');
INSERT INTO `intentos_login` VALUES (140, 'DIR001', '::1', '2026-08-17 09:19:27', 1, '2026-08-17 09:19:27');
INSERT INTO `intentos_login` VALUES (141, 'DOC001', '::1', '2026-08-17 09:20:03', 1, '2026-08-17 09:20:03');
INSERT INTO `intentos_login` VALUES (142, 'DIR001', '::1', '2026-08-17 09:25:04', 1, '2026-08-17 09:25:04');
INSERT INTO `intentos_login` VALUES (143, '2026-00010-INA', '::1', '2026-08-17 09:25:59', 1, '2026-08-17 09:25:59');
INSERT INTO `intentos_login` VALUES (144, 'REG001', '::1', '2026-08-17 09:28:07', 1, '2026-08-17 09:28:07');
INSERT INTO `intentos_login` VALUES (145, 'REG001', '::1', '2026-08-18 07:56:36', 1, '2026-08-18 07:56:36');
INSERT INTO `intentos_login` VALUES (146, 'REG001', '::1', '2026-08-18 08:19:34', 1, '2026-08-18 08:19:34');
INSERT INTO `intentos_login` VALUES (147, 'DIR001', '::1', '2026-08-18 08:23:27', 1, '2026-08-18 08:23:27');
INSERT INTO `intentos_login` VALUES (148, 'DOC001', '::1', '2026-08-18 08:27:04', 1, '2026-08-18 08:27:04');
INSERT INTO `intentos_login` VALUES (149, 'REG001', '::1', '2026-08-18 19:04:27', 1, '2026-08-18 19:04:27');
INSERT INTO `intentos_login` VALUES (150, 'DOC001', '::1', '2026-08-18 19:32:32', 1, '2026-08-18 19:32:32');
INSERT INTO `intentos_login` VALUES (151, 'DIR001', '::1', '2026-08-18 19:36:13', 1, '2026-08-18 19:36:13');
INSERT INTO `intentos_login` VALUES (152, 'REG001', '::1', '2026-08-18 19:36:21', 1, '2026-08-18 19:36:21');
INSERT INTO `intentos_login` VALUES (153, 'DIR001', '::1', '2026-08-18 19:41:06', 1, '2026-08-18 19:41:06');
INSERT INTO `intentos_login` VALUES (154, 'REG001', '::1', '2026-08-18 19:45:53', 1, '2026-08-18 19:45:53');
INSERT INTO `intentos_login` VALUES (155, 'DIR001', '::1', '2026-08-21 12:49:24', 1, '2026-08-21 12:49:24');
INSERT INTO `intentos_login` VALUES (156, 'REG001', '::1', '2026-08-21 12:49:33', 1, '2026-08-21 12:49:33');
INSERT INTO `intentos_login` VALUES (157, 'REG001', '::1', '2026-08-21 13:34:23', 1, '2026-08-21 13:34:23');
INSERT INTO `intentos_login` VALUES (158, 'REG001', '::1', '2026-08-21 15:36:14', 1, '2026-08-21 15:36:14');
INSERT INTO `intentos_login` VALUES (159, '2026-00010-INA', '::1', '2026-08-21 15:40:17', 1, '2026-08-21 15:40:17');
INSERT INTO `intentos_login` VALUES (160, 'REG001', '::1', '2026-08-21 15:40:34', 1, '2026-08-21 15:40:34');
INSERT INTO `intentos_login` VALUES (161, '2026-00010-INA', '::1', '2026-08-21 15:40:58', 1, '2026-08-21 15:40:58');
INSERT INTO `intentos_login` VALUES (162, 'REG001', '::1', '2026-08-21 15:42:41', 1, '2026-08-21 15:42:41');
INSERT INTO `intentos_login` VALUES (163, 'REG001', '::1', '2026-08-21 20:32:18', 1, '2026-08-21 20:32:18');
INSERT INTO `intentos_login` VALUES (164, 'REG001', '::1', '2026-08-21 21:47:53', 1, '2026-08-21 21:47:53');
INSERT INTO `intentos_login` VALUES (165, 'admin', '::1', '2026-08-21 21:54:51', 1, '2026-08-21 21:54:51');
INSERT INTO `intentos_login` VALUES (166, 'REG001', '::1', '2026-08-22 00:06:32', 1, '2026-08-22 00:06:32');
INSERT INTO `intentos_login` VALUES (167, 'REG001', '::1', '2026-08-22 14:00:20', 1, '2026-08-22 14:00:20');
INSERT INTO `intentos_login` VALUES (168, 'REG001', '::1', '2026-08-23 12:22:22', 1, '2026-08-23 12:22:22');
INSERT INTO `intentos_login` VALUES (169, 'DIR001', '::1', '2026-08-23 16:17:54', 1, '2026-08-23 16:17:54');
INSERT INTO `intentos_login` VALUES (170, 'REG001', '::1', '2026-08-23 16:23:10', 1, '2026-08-23 16:23:10');
INSERT INTO `intentos_login` VALUES (171, 'DIR001', '::1', '2026-08-23 19:01:58', 1, '2026-08-23 19:01:58');
INSERT INTO `intentos_login` VALUES (172, 'DOC001', '::1', '2026-08-23 19:04:03', 1, '2026-08-23 19:04:03');
INSERT INTO `intentos_login` VALUES (173, 'DOC001', '::1', '2026-08-23 19:14:06', 1, '2026-08-23 19:14:06');
INSERT INTO `intentos_login` VALUES (174, 'DOC001', '::1', '2026-08-25 20:09:04', 1, '2026-08-25 20:09:04');
INSERT INTO `intentos_login` VALUES (175, 'DOC001', '::1', '2026-08-30 21:11:04', 1, '2026-08-30 21:11:04');
INSERT INTO `intentos_login` VALUES (176, 'DIR001', '::1', '2026-08-30 21:11:33', 1, '2026-08-30 21:11:33');
INSERT INTO `intentos_login` VALUES (177, 'DOC001', '::1', '2026-08-30 21:12:15', 1, '2026-08-30 21:12:15');
INSERT INTO `intentos_login` VALUES (178, 'DIR001', '::1', '2026-08-30 21:26:34', 1, '2026-08-30 21:26:34');
INSERT INTO `intentos_login` VALUES (179, 'DOC001', '::1', '2026-08-30 21:26:46', 1, '2026-08-30 21:26:46');
INSERT INTO `intentos_login` VALUES (180, 'DOC001', '::1', '2026-09-02 15:20:50', 1, '2026-09-02 15:20:50');
INSERT INTO `intentos_login` VALUES (182, 'DOC001', '::1', '2026-09-02 15:25:51', 1, '2026-09-02 15:25:51');
INSERT INTO `intentos_login` VALUES (183, 'REG001', '::1', '2026-09-02 16:02:49', 1, '2026-09-02 16:02:49');
INSERT INTO `intentos_login` VALUES (184, 'DIR001', '::1', '2026-09-02 16:03:07', 1, '2026-09-02 16:03:07');
INSERT INTO `intentos_login` VALUES (185, 'DOC001', '::1', '2026-09-04 23:35:41', 1, '2026-09-04 23:35:41');
INSERT INTO `intentos_login` VALUES (186, 'DIR001', '::1', '2026-09-04 23:49:46', 1, '2026-09-04 23:49:46');
INSERT INTO `intentos_login` VALUES (187, 'REG001', '::1', '2026-09-04 23:50:13', 1, '2026-09-04 23:50:13');
INSERT INTO `intentos_login` VALUES (188, 'DOC001', '::1', '2026-09-05 00:48:42', 1, '2026-09-05 00:48:42');
INSERT INTO `intentos_login` VALUES (189, 'DIR001', '::1', '2026-09-05 09:21:32', 1, '2026-09-05 09:21:32');
INSERT INTO `intentos_login` VALUES (190, 'REG001', '::1', '2026-09-05 09:23:23', 1, '2026-09-05 09:23:23');
INSERT INTO `intentos_login` VALUES (191, 'DIR001', '::1', '2026-09-05 09:25:36', 1, '2026-09-05 09:25:36');
INSERT INTO `intentos_login` VALUES (192, 'REG001', '::1', '2026-09-05 09:59:45', 1, '2026-09-05 09:59:45');
INSERT INTO `intentos_login` VALUES (193, 'DOC001', '::1', '2026-09-06 15:38:46', 1, '2026-09-06 15:38:46');
INSERT INTO `intentos_login` VALUES (194, 'DOC001', '::1', '2026-09-06 16:14:05', 1, '2026-09-06 16:14:05');
INSERT INTO `intentos_login` VALUES (195, '2026-00010-INA', '::1', '2026-09-06 17:20:02', 1, '2026-09-06 17:20:02');
INSERT INTO `intentos_login` VALUES (196, 'admin', '::1', '2026-09-06 17:20:53', 1, '2026-09-06 17:20:53');
INSERT INTO `intentos_login` VALUES (197, 'REG001', '::1', '2026-09-06 17:21:06', 1, '2026-09-06 17:21:06');
INSERT INTO `intentos_login` VALUES (198, 'admin', '::1', '2026-09-06 17:21:25', 1, '2026-09-06 17:21:25');
INSERT INTO `intentos_login` VALUES (199, 'REG001', '::1', '2026-09-06 17:22:27', 1, '2026-09-06 17:22:27');
INSERT INTO `intentos_login` VALUES (200, 'admin', '::1', '2026-09-06 17:22:47', 1, '2026-09-06 17:22:47');
INSERT INTO `intentos_login` VALUES (201, 'REG001', '::1', '2026-09-06 17:23:39', 1, '2026-09-06 17:23:39');
INSERT INTO `intentos_login` VALUES (202, '2026-00010-INA', '::1', '2026-09-06 17:24:05', 1, '2026-09-06 17:24:05');
INSERT INTO `intentos_login` VALUES (203, 'REG001', '::1', '2026-09-06 17:24:26', 1, '2026-09-06 17:24:26');
INSERT INTO `intentos_login` VALUES (204, '2026-00010-INA', '::1', '2026-09-06 17:24:51', 1, '2026-09-06 17:24:51');
INSERT INTO `intentos_login` VALUES (205, 'REG001', '::1', '2026-09-06 17:26:37', 1, '2026-09-06 17:26:37');
INSERT INTO `intentos_login` VALUES (206, '2026-00015-INA', '::1', '2026-09-06 17:26:57', 0, '2026-09-06 17:26:57');
INSERT INTO `intentos_login` VALUES (207, 'DOC001', '::1', '2026-09-06 17:27:15', 1, '2026-09-06 17:27:15');
INSERT INTO `intentos_login` VALUES (208, 'DOC001', '::1', '2026-09-07 21:43:04', 1, '2026-09-07 21:43:04');
INSERT INTO `intentos_login` VALUES (209, 'DIR001', '::1', '2026-09-07 22:30:47', 1, '2026-09-07 22:30:47');
INSERT INTO `intentos_login` VALUES (210, 'DOC001', '::1', '2026-09-07 22:31:40', 1, '2026-09-07 22:31:40');
INSERT INTO `intentos_login` VALUES (211, 'DIR001', '::1', '2026-09-07 23:00:13', 1, '2026-09-07 23:00:13');
INSERT INTO `intentos_login` VALUES (212, 'DOC001', '::1', '2026-09-07 23:02:09', 1, '2026-09-07 23:02:09');
INSERT INTO `intentos_login` VALUES (213, 'REG001', '::1', '2026-09-08 17:32:09', 1, '2026-09-08 17:32:09');
INSERT INTO `intentos_login` VALUES (214, 'DIR001', '::1', '2026-09-08 17:34:12', 1, '2026-09-08 17:34:12');
INSERT INTO `intentos_login` VALUES (215, 'REG001', '::1', '2026-09-08 20:07:29', 1, '2026-09-08 20:07:29');
INSERT INTO `intentos_login` VALUES (216, 'REG001', '::1', '2026-09-08 22:29:29', 1, '2026-09-08 22:29:29');
INSERT INTO `intentos_login` VALUES (217, 'DIR001', '::1', '2026-09-08 22:48:56', 1, '2026-09-08 22:48:56');
INSERT INTO `intentos_login` VALUES (218, 'REG001', '::1', '2026-09-08 23:59:39', 1, '2026-09-08 23:59:39');
INSERT INTO `intentos_login` VALUES (219, 'DOC001', '::1', '2026-09-09 00:01:07', 1, '2026-09-09 00:01:07');
INSERT INTO `intentos_login` VALUES (220, 'DIR001', '::1', '2026-09-09 00:08:26', 1, '2026-09-09 00:08:26');
INSERT INTO `intentos_login` VALUES (221, 'DIR001', '::1', '2026-09-09 00:43:20', 1, '2026-09-09 00:43:20');
INSERT INTO `intentos_login` VALUES (222, 'REG001', '::1', '2026-09-09 00:44:33', 1, '2026-09-09 00:44:33');
INSERT INTO `intentos_login` VALUES (223, 'DIR001', '::1', '2026-09-09 00:45:12', 1, '2026-09-09 00:45:12');
INSERT INTO `intentos_login` VALUES (224, 'DIR001', '::1', '2026-09-09 00:46:16', 1, '2026-09-09 00:46:16');
INSERT INTO `intentos_login` VALUES (225, 'DOC001', '::1', '2026-09-09 00:46:58', 1, '2026-09-09 00:46:58');
INSERT INTO `intentos_login` VALUES (226, 'REG001', '::1', '2026-09-09 00:49:38', 1, '2026-09-09 00:49:38');
INSERT INTO `intentos_login` VALUES (227, 'DIR001', '::1', '2026-09-09 00:50:12', 1, '2026-09-09 00:50:12');
INSERT INTO `intentos_login` VALUES (228, 'DOC001', '::1', '2026-09-09 00:50:57', 1, '2026-09-09 00:50:57');
INSERT INTO `intentos_login` VALUES (229, 'DIR001', '::1', '2026-09-09 00:51:22', 1, '2026-09-09 00:51:22');
INSERT INTO `intentos_login` VALUES (230, 'DIR001', '::1', '2026-09-09 00:52:09', 1, '2026-09-09 00:52:09');
INSERT INTO `intentos_login` VALUES (231, 'DOC001', '::1', '2026-09-09 00:52:13', 1, '2026-09-09 00:52:13');
INSERT INTO `intentos_login` VALUES (232, 'DOC001', '::1', '2026-09-09 09:06:21', 1, '2026-09-09 09:06:21');
INSERT INTO `intentos_login` VALUES (233, 'DIR001', '::1', '2026-09-09 09:06:47', 1, '2026-09-09 09:06:47');
INSERT INTO `intentos_login` VALUES (234, 'DOC001', '::1', '2026-09-09 09:26:10', 1, '2026-09-09 09:26:10');
INSERT INTO `intentos_login` VALUES (235, 'DIR001', '::1', '2026-09-09 09:26:44', 1, '2026-09-09 09:26:44');
INSERT INTO `intentos_login` VALUES (236, 'DOC001', '::1', '2026-09-09 09:27:34', 1, '2026-09-09 09:27:34');
INSERT INTO `intentos_login` VALUES (237, 'DIR001', '::1', '2026-09-09 10:01:27', 1, '2026-09-09 10:01:27');
INSERT INTO `intentos_login` VALUES (238, 'DOC001', '::1', '2026-09-09 10:01:40', 1, '2026-09-09 10:01:40');
INSERT INTO `intentos_login` VALUES (239, 'DOC001', '::1', '2026-09-11 00:18:16', 1, '2026-09-11 00:18:16');
INSERT INTO `intentos_login` VALUES (240, 'DOC001', '::1', '2026-09-11 00:18:17', 1, '2026-09-11 00:18:17');
INSERT INTO `intentos_login` VALUES (241, 'REG001', '::1', '2026-09-11 00:19:22', 1, '2026-09-11 00:19:22');
INSERT INTO `intentos_login` VALUES (242, 'DIR001', '::1', '2026-09-11 00:19:41', 1, '2026-09-11 00:19:41');
INSERT INTO `intentos_login` VALUES (243, 'REG001', '::1', '2026-09-11 10:35:44', 1, '2026-09-11 10:35:44');
INSERT INTO `intentos_login` VALUES (244, 'DOC001', '::1', '2026-09-11 10:36:52', 1, '2026-09-11 10:36:52');
INSERT INTO `intentos_login` VALUES (245, 'REG001', '::1', '2026-09-11 10:37:44', 1, '2026-09-11 10:37:44');
INSERT INTO `intentos_login` VALUES (246, 'DOC001', '::1', '2026-09-11 10:39:35', 1, '2026-09-11 10:39:35');
INSERT INTO `intentos_login` VALUES (247, 'REG001', '::1', '2026-09-11 10:41:44', 1, '2026-09-11 10:41:44');
INSERT INTO `intentos_login` VALUES (248, 'DOC001', '::1', '2026-09-11 10:41:58', 1, '2026-09-11 10:41:58');
INSERT INTO `intentos_login` VALUES (249, 'REG001', '::1', '2026-09-11 10:47:25', 1, '2026-09-11 10:47:25');
INSERT INTO `intentos_login` VALUES (250, 'REG001', '::1', '2026-09-11 10:47:47', 1, '2026-09-11 10:47:47');
INSERT INTO `intentos_login` VALUES (251, '2026-00010-INA', '::1', '2026-09-11 10:58:39', 1, '2026-09-11 10:58:39');
INSERT INTO `intentos_login` VALUES (252, 'admin', '::1', '2026-09-11 19:27:14', 1, '2026-09-11 19:27:14');
INSERT INTO `intentos_login` VALUES (253, 'DIR001', '::1', '2026-09-11 19:30:05', 1, '2026-09-11 19:30:05');
INSERT INTO `intentos_login` VALUES (254, 'REG001', '::1', '2026-09-11 19:30:32', 1, '2026-09-11 19:30:32');
INSERT INTO `intentos_login` VALUES (255, 'DOC001', '::1', '2026-09-11 19:30:54', 1, '2026-09-11 19:30:54');
INSERT INTO `intentos_login` VALUES (256, '2026-00010-INA', '::1', '2026-09-11 19:31:15', 1, '2026-09-11 19:31:15');
INSERT INTO `intentos_login` VALUES (257, 'ENC001', '::1', '2026-09-11 19:31:43', 1, '2026-09-11 19:31:43');
INSERT INTO `intentos_login` VALUES (258, 'admin', '::1', '2026-09-11 20:35:57', 1, '2026-09-11 20:35:57');
INSERT INTO `intentos_login` VALUES (259, 'DIR001', '::1', '2026-09-11 20:36:09', 1, '2026-09-11 20:36:09');
INSERT INTO `intentos_login` VALUES (260, 'REG001', '::1', '2026-09-11 20:36:29', 1, '2026-09-11 20:36:29');
INSERT INTO `intentos_login` VALUES (261, 'DOC001', '::1', '2026-09-11 20:36:38', 1, '2026-09-11 20:36:38');
INSERT INTO `intentos_login` VALUES (262, 'ENC001', '::1', '2026-09-11 20:36:52', 1, '2026-09-11 20:36:52');
INSERT INTO `intentos_login` VALUES (263, '2026-00010-INA', '::1', '2026-09-11 20:36:59', 1, '2026-09-11 20:36:59');
INSERT INTO `intentos_login` VALUES (264, 'DOC001', '::1', '2026-09-12 13:33:44', 1, '2026-09-12 13:33:44');
INSERT INTO `intentos_login` VALUES (265, 'DIR001', '::1', '2026-09-12 13:33:44', 1, '2026-09-12 13:33:44');
INSERT INTO `intentos_login` VALUES (266, '2026-00010-INA', '::1', '2026-09-12 13:34:21', 1, '2026-09-12 13:34:21');
INSERT INTO `intentos_login` VALUES (267, 'DIR001', '::1', '2026-09-12 13:34:39', 1, '2026-09-12 13:34:39');
INSERT INTO `intentos_login` VALUES (268, 'REG001', '::1', '2026-09-12 14:19:35', 1, '2026-09-12 14:19:35');
INSERT INTO `intentos_login` VALUES (269, 'DIR001', '::1', '2026-09-12 15:02:58', 1, '2026-09-12 15:02:58');
INSERT INTO `intentos_login` VALUES (270, 'DOC001', '::1', '2026-09-12 15:14:54', 1, '2026-09-12 15:14:54');
INSERT INTO `intentos_login` VALUES (271, 'DIR001', '::1', '2026-09-12 15:15:14', 1, '2026-09-12 15:15:14');
INSERT INTO `intentos_login` VALUES (272, 'DOC001', '::1', '2026-09-12 15:16:00', 1, '2026-09-12 15:16:00');
INSERT INTO `intentos_login` VALUES (273, 'DIR001', '::1', '2026-09-12 15:49:02', 1, '2026-09-12 15:49:02');
INSERT INTO `intentos_login` VALUES (274, 'REG001', '::1', '2026-09-12 16:11:09', 1, '2026-09-12 16:11:09');
INSERT INTO `intentos_login` VALUES (275, 'DIR001', '::1', '2026-09-12 16:11:44', 1, '2026-09-12 16:11:44');
INSERT INTO `intentos_login` VALUES (276, 'DOC001', '::1', '2026-09-12 16:17:03', 1, '2026-09-12 16:17:03');
INSERT INTO `intentos_login` VALUES (277, 'DIR001', '::1', '2026-09-12 16:18:06', 1, '2026-09-12 16:18:06');
INSERT INTO `intentos_login` VALUES (278, 'REG001', '::1', '2026-09-12 16:19:19', 1, '2026-09-12 16:19:19');
INSERT INTO `intentos_login` VALUES (279, 'DOC001', '::1', '2026-09-12 16:28:25', 1, '2026-09-12 16:28:25');
INSERT INTO `intentos_login` VALUES (280, 'DIR001', '::1', '2026-09-12 16:28:43', 1, '2026-09-12 16:28:43');
INSERT INTO `intentos_login` VALUES (281, 'DOC001', '::1', '2026-09-12 16:28:47', 1, '2026-09-12 16:28:47');
INSERT INTO `intentos_login` VALUES (282, 'DIR001', '::1', '2026-09-12 16:29:17', 1, '2026-09-12 16:29:17');
INSERT INTO `intentos_login` VALUES (283, 'DOC001', '::1', '2026-09-12 16:29:36', 1, '2026-09-12 16:29:36');
INSERT INTO `intentos_login` VALUES (284, 'DIR001', '::1', '2026-09-12 16:32:47', 1, '2026-09-12 16:32:47');
INSERT INTO `intentos_login` VALUES (285, '2026-00010-INA', '::1', '2026-09-12 16:33:06', 1, '2026-09-12 16:33:06');
INSERT INTO `intentos_login` VALUES (286, 'DOC001', '::1', '2026-09-12 16:36:26', 1, '2026-09-12 16:36:26');
INSERT INTO `intentos_login` VALUES (287, 'DIR001', '::1', '2026-09-12 16:37:01', 1, '2026-09-12 16:37:01');
INSERT INTO `intentos_login` VALUES (288, 'DIR001', '::1', '2026-09-12 16:37:28', 1, '2026-09-12 16:37:28');
INSERT INTO `intentos_login` VALUES (289, '2026-00010-INA', '::1', '2026-09-12 16:38:52', 1, '2026-09-12 16:38:52');
INSERT INTO `intentos_login` VALUES (290, 'DIR001', '::1', '2026-09-12 16:39:38', 1, '2026-09-12 16:39:38');
INSERT INTO `intentos_login` VALUES (291, '2026-00010-INA', '::1', '2026-09-12 16:40:01', 1, '2026-09-12 16:40:01');
INSERT INTO `intentos_login` VALUES (292, 'DIR001', '::1', '2026-09-12 16:40:12', 1, '2026-09-12 16:40:12');
INSERT INTO `intentos_login` VALUES (293, '2026-00010-INA', '::1', '2026-09-12 16:40:31', 1, '2026-09-12 16:40:31');
INSERT INTO `intentos_login` VALUES (294, 'DIR001', '::1', '2026-09-13 09:08:06', 1, '2026-09-13 09:08:06');
INSERT INTO `intentos_login` VALUES (295, 'DIR001', '::1', '2026-09-16 21:12:03', 1, '2026-09-16 21:12:03');
INSERT INTO `intentos_login` VALUES (296, 'REG001', '::1', '2026-09-16 21:12:21', 1, '2026-09-16 21:12:21');
INSERT INTO `intentos_login` VALUES (297, 'DIR001', '::1', '2026-09-16 21:13:22', 1, '2026-09-16 21:13:22');
INSERT INTO `intentos_login` VALUES (298, 'REG001', '::1', '2026-09-16 21:13:41', 1, '2026-09-16 21:13:41');
INSERT INTO `intentos_login` VALUES (299, 'DIR001', '::1', '2026-09-16 23:01:44', 1, '2026-09-16 23:01:44');
INSERT INTO `intentos_login` VALUES (300, 'DIR001', '::1', '2026-09-16 23:03:55', 1, '2026-09-16 23:03:55');
INSERT INTO `intentos_login` VALUES (301, 'REG001', '::1', '2026-09-16 23:04:17', 1, '2026-09-16 23:04:17');
INSERT INTO `intentos_login` VALUES (302, '2026-00037-INA', '::1', '2026-09-16 23:07:32', 1, '2026-09-16 23:07:32');
INSERT INTO `intentos_login` VALUES (303, 'REG001', '::1', '2026-09-16 23:11:40', 1, '2026-09-16 23:11:40');
INSERT INTO `intentos_login` VALUES (304, 'DOC001', '::1', '2026-09-16 23:12:30', 1, '2026-09-16 23:12:30');
INSERT INTO `intentos_login` VALUES (305, 'DIR001', '::1', '2026-09-16 23:15:46', 1, '2026-09-16 23:15:46');
INSERT INTO `intentos_login` VALUES (306, 'DIR001', '::1', '2026-09-16 23:40:25', 1, '2026-09-16 23:40:25');
INSERT INTO `intentos_login` VALUES (307, 'DIR001', '::1', '2026-09-16 23:44:09', 1, '2026-09-16 23:44:09');
INSERT INTO `intentos_login` VALUES (308, 'REG001', '::1', '2026-09-16 23:44:32', 1, '2026-09-16 23:44:32');
INSERT INTO `intentos_login` VALUES (309, 'ENC001', '::1', '2026-09-16 23:47:41', 1, '2026-09-16 23:47:41');
INSERT INTO `intentos_login` VALUES (310, '2026-00010-INA', '::1', '2026-09-16 23:49:00', 1, '2026-09-16 23:49:00');
INSERT INTO `intentos_login` VALUES (311, 'DIR001', '::1', '2026-09-17 10:39:28', 1, '2026-09-17 10:39:28');
INSERT INTO `intentos_login` VALUES (312, 'REG001', '::1', '2026-09-17 10:40:03', 1, '2026-09-17 10:40:03');
INSERT INTO `intentos_login` VALUES (313, 'DIR001', '::1', '2026-09-17 11:05:26', 1, '2026-09-17 11:05:26');
INSERT INTO `intentos_login` VALUES (314, '2026-00010-INA', '::1', '2026-09-17 11:19:59', 1, '2026-09-17 11:19:59');
INSERT INTO `intentos_login` VALUES (315, 'DIR001', '::1', '2026-09-17 11:23:43', 1, '2026-09-17 11:23:43');
INSERT INTO `intentos_login` VALUES (316, 'admin', '::1', '2026-09-17 11:25:27', 1, '2026-09-17 11:25:27');
INSERT INTO `intentos_login` VALUES (317, 'REG001', '::1', '2026-09-17 11:29:53', 1, '2026-09-17 11:29:53');
INSERT INTO `intentos_login` VALUES (318, '2026-00040-INA', '::1', '2026-09-17 11:32:57', 1, '2026-09-17 11:32:57');
INSERT INTO `intentos_login` VALUES (319, 'DOC001', '::1', '2026-09-17 11:33:38', 1, '2026-09-17 11:33:38');
INSERT INTO `intentos_login` VALUES (320, '2026-00040-INA', '::1', '2026-09-17 11:34:13', 1, '2026-09-17 11:34:13');
INSERT INTO `intentos_login` VALUES (321, 'DOC001', '::1', '2026-09-17 11:40:28', 1, '2026-09-17 11:40:28');
INSERT INTO `intentos_login` VALUES (322, '2026-00040-INA', '::1', '2026-09-17 11:40:55', 1, '2026-09-17 11:40:55');
INSERT INTO `intentos_login` VALUES (323, 'ENC001', '::1', '2026-09-17 11:41:13', 1, '2026-09-17 11:41:13');
INSERT INTO `intentos_login` VALUES (324, 'DOC001', '::1', '2026-09-17 11:42:14', 1, '2026-09-17 11:42:14');
INSERT INTO `intentos_login` VALUES (325, 'ENC001', '::1', '2026-09-17 11:42:46', 1, '2026-09-17 11:42:46');
INSERT INTO `intentos_login` VALUES (326, 'DOC001', '::1', '2026-09-17 11:43:39', 1, '2026-09-17 11:43:39');
INSERT INTO `intentos_login` VALUES (327, 'ENC001', '::1', '2026-09-17 11:43:52', 1, '2026-09-17 11:43:52');
INSERT INTO `intentos_login` VALUES (328, 'DIR001', '::1', '2026-09-17 11:47:47', 1, '2026-09-17 11:47:47');
INSERT INTO `intentos_login` VALUES (329, 'DOC001', '::1', '2026-09-17 11:47:53', 1, '2026-09-17 11:47:53');
INSERT INTO `intentos_login` VALUES (330, 'DIR001', '::1', '2026-09-17 11:48:14', 1, '2026-09-17 11:48:14');
INSERT INTO `intentos_login` VALUES (331, 'DOC001', '::1', '2026-09-17 11:52:51', 1, '2026-09-17 11:52:51');
INSERT INTO `intentos_login` VALUES (332, 'DIR001', '::1', '2026-09-17 11:52:58', 1, '2026-09-17 11:52:58');
INSERT INTO `intentos_login` VALUES (333, 'DIR001', '::1', '2026-09-19 11:12:35', 1, '2026-09-19 11:12:35');
INSERT INTO `intentos_login` VALUES (334, 'DOC001', '::1', '2026-09-19 11:23:17', 1, '2026-09-19 11:23:17');
INSERT INTO `intentos_login` VALUES (335, 'DIR001', '::1', '2026-09-19 11:24:03', 1, '2026-09-19 11:24:03');
INSERT INTO `intentos_login` VALUES (336, '2026-00039-INA', '::1', '2026-09-19 11:25:08', 1, '2026-09-19 11:25:08');
INSERT INTO `intentos_login` VALUES (337, 'DIR001', '::1', '2026-09-19 11:25:59', 1, '2026-09-19 11:25:59');
INSERT INTO `intentos_login` VALUES (340, '2026-00039-INA', '::1', '2026-09-19 11:33:21', 1, '2026-09-19 11:33:21');
INSERT INTO `intentos_login` VALUES (344, 'REG001', '::1', '2026-09-19 11:33:54', 1, '2026-09-19 11:33:54');
INSERT INTO `intentos_login` VALUES (345, 'DIR001', '::1', '2026-09-19 11:43:07', 1, '2026-09-19 11:43:07');
INSERT INTO `intentos_login` VALUES (347, 'REG001', '::1', '2026-09-19 11:43:57', 1, '2026-09-19 11:43:57');
INSERT INTO `intentos_login` VALUES (348, 'DIR001', '::1', '2026-09-19 11:44:12', 1, '2026-09-19 11:44:12');
INSERT INTO `intentos_login` VALUES (349, 'REG001', '::1', '2026-09-19 11:44:31', 1, '2026-09-19 11:44:31');
INSERT INTO `intentos_login` VALUES (350, 'DIR001', '::1', '2026-09-19 12:03:39', 1, '2026-09-19 12:03:39');
INSERT INTO `intentos_login` VALUES (351, 'REG001', '::1', '2026-09-19 14:54:03', 1, '2026-09-19 14:54:03');
INSERT INTO `intentos_login` VALUES (352, 'DIR001', '::1', '2026-09-19 17:08:53', 1, '2026-09-19 17:08:53');
INSERT INTO `intentos_login` VALUES (353, 'DIR001', '::1', '2026-09-19 17:09:10', 1, '2026-09-19 17:09:10');
INSERT INTO `intentos_login` VALUES (354, 'DIR001', '::1', '2026-09-19 17:09:33', 1, '2026-09-19 17:09:33');
INSERT INTO `intentos_login` VALUES (355, 'DIR001', '::1', '2026-09-19 17:14:15', 1, '2026-09-19 17:14:15');
INSERT INTO `intentos_login` VALUES (356, 'DIR001', '::1', '2026-09-19 17:14:50', 1, '2026-09-19 17:14:50');
INSERT INTO `intentos_login` VALUES (357, 'admin', '::1', '2026-09-19 17:15:06', 1, '2026-09-19 17:15:06');
INSERT INTO `intentos_login` VALUES (358, 'DIR001', '::1', '2026-09-19 17:16:40', 1, '2026-09-19 17:16:40');
INSERT INTO `intentos_login` VALUES (359, 'DIR001', '::1', '2026-09-19 17:21:46', 1, '2026-09-19 17:21:46');
INSERT INTO `intentos_login` VALUES (360, 'DIR001', '::1', '2026-09-19 17:23:25', 1, '2026-09-19 17:23:25');
INSERT INTO `intentos_login` VALUES (361, 'DIR001', '::1', '2026-09-19 17:24:29', 1, '2026-09-19 17:24:29');
INSERT INTO `intentos_login` VALUES (362, 'DIR001', '::1', '2026-09-19 17:24:58', 1, '2026-09-19 17:24:58');
INSERT INTO `intentos_login` VALUES (363, 'DIR001', '::1', '2026-09-19 17:28:11', 1, '2026-09-19 17:28:11');
INSERT INTO `intentos_login` VALUES (364, 'REG001', '::1', '2026-09-19 18:13:49', 1, '2026-09-19 18:13:49');
INSERT INTO `intentos_login` VALUES (365, 'DIR001', '::1', '2026-09-19 18:18:14', 1, '2026-09-19 18:18:14');
INSERT INTO `intentos_login` VALUES (366, 'DIR001', '::1', '2026-09-19 18:25:52', 1, '2026-09-19 18:25:52');
INSERT INTO `intentos_login` VALUES (367, 'admin', '::1', '2026-09-19 19:38:50', 1, '2026-09-19 19:38:50');
INSERT INTO `intentos_login` VALUES (368, 'DOC001', '::1', '2026-09-19 19:58:45', 1, '2026-09-19 19:58:45');
INSERT INTO `intentos_login` VALUES (369, '2026-00040-INA', '::1', '2026-09-19 20:48:42', 1, '2026-09-19 20:48:42');
INSERT INTO `intentos_login` VALUES (370, 'ENC001', '::1', '2026-09-19 20:56:49', 1, '2026-09-19 20:56:49');
INSERT INTO `intentos_login` VALUES (371, 'DOC001', '::1', '2026-09-19 20:58:41', 1, '2026-09-19 20:58:41');
INSERT INTO `intentos_login` VALUES (372, 'DIR001', '::1', '2026-09-20 21:44:38', 1, '2026-09-20 21:44:38');
INSERT INTO `intentos_login` VALUES (373, '2026-00010-INA', '::1', '2026-09-20 22:18:01', 1, '2026-09-20 22:18:01');
INSERT INTO `intentos_login` VALUES (374, 'DIR001', '::1', '2026-09-20 22:36:52', 1, '2026-09-20 22:36:52');
INSERT INTO `intentos_login` VALUES (375, 'DOC001', '::1', '2026-09-20 22:38:38', 1, '2026-09-20 22:38:38');
INSERT INTO `intentos_login` VALUES (376, 'DIR001', '::1', '2026-09-20 22:47:43', 1, '2026-09-20 22:47:43');
INSERT INTO `intentos_login` VALUES (377, 'DIR001', '::1', '2026-09-21 21:56:10', 1, '2026-09-21 21:56:10');
INSERT INTO `intentos_login` VALUES (378, 'DOC001', '::1', '2026-09-21 22:53:16', 1, '2026-09-21 22:53:16');
INSERT INTO `intentos_login` VALUES (379, 'DIR001', '::1', '2026-09-21 22:55:29', 1, '2026-09-21 22:55:29');
INSERT INTO `intentos_login` VALUES (380, 'DIR001', '::1', '2026-09-22 23:34:06', 1, '2026-09-22 23:34:06');
INSERT INTO `intentos_login` VALUES (381, 'DIR001', '::1', '2026-09-23 19:47:12', 1, '2026-09-23 19:47:12');
INSERT INTO `intentos_login` VALUES (382, 'admin', '::1', '2026-09-23 19:56:31', 1, '2026-09-23 19:56:31');
INSERT INTO `intentos_login` VALUES (383, 'DIR001', '::1', '2026-09-23 20:00:19', 1, '2026-09-23 20:00:19');
INSERT INTO `intentos_login` VALUES (384, 'DIR001', '::1', '2026-09-23 20:25:58', 1, '2026-09-23 20:25:58');
INSERT INTO `intentos_login` VALUES (385, 'DIR001', '::1', '2026-09-23 20:53:08', 1, '2026-09-23 20:53:08');
INSERT INTO `intentos_login` VALUES (386, 'REG001', '::1', '2026-09-23 20:53:32', 1, '2026-09-23 20:53:32');
INSERT INTO `intentos_login` VALUES (387, 'DIR001', '::1', '2026-09-23 20:54:17', 1, '2026-09-23 20:54:17');
INSERT INTO `intentos_login` VALUES (388, 'DIR001', '::1', '2026-09-23 20:54:33', 1, '2026-09-23 20:54:33');
INSERT INTO `intentos_login` VALUES (389, 'pruebas@gmail.com', '::1', '2026-09-23 20:54:49', 0, '2026-09-23 20:54:49');
INSERT INTO `intentos_login` VALUES (390, 'admin', '::1', '2026-09-23 20:54:53', 1, '2026-09-23 20:54:53');
INSERT INTO `intentos_login` VALUES (391, 'DIR001', '::1', '2026-09-23 21:11:48', 1, '2026-09-23 21:11:48');
INSERT INTO `intentos_login` VALUES (392, 'REG001', '::1', '2026-09-23 21:12:05', 1, '2026-09-23 21:12:05');
INSERT INTO `intentos_login` VALUES (393, 'ENC-013347F4', '::1', '2026-09-23 21:17:58', 1, '2026-09-23 21:17:58');
INSERT INTO `intentos_login` VALUES (394, '2026-00042-INA', '::1', '2026-09-23 21:20:43', 1, '2026-09-23 21:20:43');
INSERT INTO `intentos_login` VALUES (395, 'ENC-013347F4', '::1', '2026-09-23 21:21:27', 1, '2026-09-23 21:21:27');
INSERT INTO `intentos_login` VALUES (396, '2026-00042-INA', '::1', '2026-09-23 21:43:02', 1, '2026-09-23 21:43:02');
INSERT INTO `intentos_login` VALUES (397, 'ENC-013347F4', '::1', '2026-09-23 21:43:21', 1, '2026-09-23 21:43:21');
INSERT INTO `intentos_login` VALUES (398, 'ENC-013347F4', '::1', '2026-09-23 21:53:54', 1, '2026-09-23 21:53:54');
INSERT INTO `intentos_login` VALUES (399, '2026-00010-INA', '127.0.0.1', '2026-09-24 22:14:03', 1, '2026-09-24 22:14:03');
INSERT INTO `intentos_login` VALUES (400, '2026-00010-INA', '127.0.0.1', '2026-09-24 22:32:25', 1, '2026-09-24 22:32:25');
INSERT INTO `intentos_login` VALUES (401, '2026-00010-INA', '::1', '2026-09-24 22:47:32', 1, '2026-09-24 22:47:32');
INSERT INTO `intentos_login` VALUES (402, 'ENC-013347F4', '::1', '2026-09-24 22:50:15', 1, '2026-09-24 22:50:15');
INSERT INTO `intentos_login` VALUES (403, '2026-00010-INA', '127.0.0.1', '2026-09-24 23:05:32', 1, '2026-09-24 23:05:32');
INSERT INTO `intentos_login` VALUES (404, 'admin', '127.0.0.1', '2026-09-24 23:05:53', 1, '2026-09-24 23:05:53');
INSERT INTO `intentos_login` VALUES (405, 'DIR001', '127.0.0.1', '2026-09-24 23:13:49', 1, '2026-09-24 23:13:49');
INSERT INTO `intentos_login` VALUES (406, 'REG001', '127.0.0.1', '2026-09-24 23:17:05', 1, '2026-09-24 23:17:05');
INSERT INTO `intentos_login` VALUES (407, 'admin', '127.0.0.1', '2026-09-24 23:20:32', 1, '2026-09-24 23:20:32');
-- 352 fila(s) en `intentos_login`

DROP TABLE IF EXISTS `inventario`;
CREATE TABLE `inventario` (
  `id_inventario` int NOT NULL,
  `codigo_inventario` varchar(50) NOT NULL,
  `nombre_equipo` varchar(150) NOT NULL,
  `descripcion` text,
  `marca` varchar(100),
  `modelo` varchar(100),
  `serie` varchar(100),
  `categoria` enum('Electronico','Mobiliario','Deportivo','Laboratorio','Oficina','Otro') DEFAULT Electronico,
  `estado_equipo` enum('Bueno','Regular','Malo','En Reparacion','Dado de Baja') DEFAULT Bueno,
  `cantidad` int DEFAULT 1,
  `ubicacion` varchar(200),
  `id_edificio` int,
  `id_aula` int,
  `fecha_adquisicion` date,
  `valor_compra` decimal(10,2),
  `responsable` varchar(100),
  `estado` tinyint(1) DEFAULT 1
);
-- 0 fila(s) en `inventario`

DROP TABLE IF EXISTS `materias`;
CREATE TABLE `materias` (
  `id_materia` int AUTO_INCREMENT,
  `nombre_materia` varchar(100) NOT NULL,
  `codigo_materia` varchar(100),
  `tipo_materia` enum('Basica','Especialidad') NOT NULL DEFAULT Basica,
  `escala_maxima` decimal(5,2) NOT NULL DEFAULT 100.00,
  `escala_minima` decimal(5,2) NOT NULL DEFAULT 0.00,
  `nota_minima` decimal(5,2) NOT NULL DEFAULT 60.00,
  `decimales_permitidos` tinyint NOT NULL DEFAULT 0,
  `id_especialidad` int,
  `estado` tinyint(1) DEFAULT 1
,
  PRIMARY KEY (`id_materia`)
);
INSERT INTO `materias` VALUES (1, 'Matematica', 'MAT-B01', 'Basica', 100.00, 0.00, 60.00, 1, NULL, 1);
INSERT INTO `materias` VALUES (2, 'Lenguaje y Literatura', 'LEN-B02', 'Basica', 100.00, 0.00, 60.00, 1, NULL, 1);
INSERT INTO `materias` VALUES (3, 'Ciencias Naturalesa', 'CIE-B03', 'Basica', 100.00, 0.00, 60.00, 1, NULL, 1);
INSERT INTO `materias` VALUES (4, 'Estudios Sociales', 'EST-B04', 'Basica', 100.00, 0.00, 60.00, 1, NULL, 1);
INSERT INTO `materias` VALUES (5, 'Ingles', 'ING-B05', 'Basica', 100.00, 0.00, 60.00, 1, NULL, 1);
INSERT INTO `materias` VALUES (6, 'Informatica', 'INF-B06', 'Basica', 100.00, 0.00, 60.00, 1, NULL, 1);
INSERT INTO `materias` VALUES (14, 'prueba', 'pruena', 'Basica', 100.00, 0.00, 6.00, 2, NULL, 0);
INSERT INTO `materias` VALUES (15, 'Lenguaje', 'Leng-01', 'Basica', 100.00, 0.00, 6.00, 2, NULL, 1);
INSERT INTO `materias` VALUES (16, 'Proyecto de Vida', 'Proy-001', '', 100.00, 0.00, 6.00, 2, NULL, 0);
-- 9 fila(s) en `materias`

DROP TABLE IF EXISTS `modulos`;
CREATE TABLE `modulos` (
  `id_modulo` int AUTO_INCREMENT,
  `id_especialidad` int NOT NULL,
  `numero_grado` int NOT NULL,
  `numero_modulo` int NOT NULL,
  `nombre_modulo` varchar(200) NOT NULL,
  `orden` int DEFAULT 0,
  `estado` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_modulo`)
);
INSERT INTO `modulos` VALUES (1, 1, 1, 1, 'Modulo 1.1', 1, 1, '2026-09-09 09:07:17', '2026-09-11 10:55:22');
INSERT INTO `modulos` VALUES (2, 1, 1, 2, 'prueba', 2, 1, '2026-09-09 09:07:26', NULL);
INSERT INTO `modulos` VALUES (3, 1, 1, 3, 'prueba', 3, 1, '2026-09-09 09:07:46', NULL);
INSERT INTO `modulos` VALUES (4, 1, 1, 4, 'prueba', 4, 1, '2026-09-09 09:07:51', NULL);
INSERT INTO `modulos` VALUES (5, 1, 1, 5, 'prueba', 5, 1, '2026-09-09 09:07:56', NULL);
INSERT INTO `modulos` VALUES (6, 1, 1, 6, 'prueba', 6, 1, '2026-09-09 09:08:03', NULL);
INSERT INTO `modulos` VALUES (7, 1, 1, 7, 'prueba', 7, 1, '2026-09-09 09:08:09', NULL);
INSERT INTO `modulos` VALUES (8, 1, 1, 8, 'prueba', 8, 1, '2026-09-09 09:08:15', NULL);
INSERT INTO `modulos` VALUES (9, 3, 1, 1, 'Modulo Primeros Auxilios', 1, 1, '2026-09-19 11:13:38', NULL);
-- 9 fila(s) en `modulos`

DROP TABLE IF EXISTS `monitoreo_espacio`;
CREATE TABLE `monitoreo_espacio` (
  `id_monitoreo` int AUTO_INCREMENT,
  `espacio_total_gb` decimal(10,2) NOT NULL,
  `espacio_libre_gb` decimal(10,2) NOT NULL,
  `espacio_usado_gb` decimal(10,2) NOT NULL,
  `porcentaje_uso` decimal(5,2) NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_monitoreo`)
);
-- 0 fila(s) en `monitoreo_espacio`

DROP TABLE IF EXISTS `niveles_academicos`;
CREATE TABLE `niveles_academicos` (
  `id_niveles` int NOT NULL,
  `nombre_nivel` varchar(50) NOT NULL,
  `tipo_media` enum('General','Especialidad') NOT NULL,
  `duracion_anios` int NOT NULL,
  `descripcion` text,
  `estado` tinyint(1) DEFAULT 1
);
INSERT INTO `niveles_academicos` VALUES (1, 'Bachillerato General', 'General', 2, 'Educacion media general (2 anios)', 1);
INSERT INTO `niveles_academicos` VALUES (2, 'Bachillerato Tecnico Vocacional', 'Especialidad', 3, 'Bachillerato tecnico vocacional (3 anios)', 1);
INSERT INTO `niveles_academicos` VALUES (3, 'Bachillerato Tecnico Productivo', 'Especialidad', 3, 'Bachillerato tecnico productivo (3 anios)', 1);
-- 3 fila(s) en `niveles_academicos`

DROP TABLE IF EXISTS `notificaciones`;
CREATE TABLE `notificaciones` (
  `id_notificacion` int AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `tipo` enum('email','interna') DEFAULT interna,
  `destinatario_email` varchar(100),
  `fecha_programada` datetime,
  `fecha_envio` datetime,
  `archivo_adjunto` varchar(255),
  `creado_por` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_notificacion`)
);
INSERT INTO `notificaciones` VALUES (1, 'Bienvenida al Portal', 'Su cuenta fue creada exitosamente en el Sistema Academico INA', 1, 'interna', 'estudiante@ina.edu.sv', NULL, NULL, NULL, 1, '2026-08-14 18:30:23', '2026-08-14 18:49:13');
INSERT INTO `notificaciones` VALUES (2, 'Reunion de Padres de Familia', 'El 5 de febrero se realizara la reunion general de padres a las 8:00 AM en el auditorio.', 1, 'interna', 'encargado@google.com', NULL, NULL, NULL, 1, '2026-08-14 18:30:23', '2026-08-14 18:49:13');
INSERT INTO `notificaciones` VALUES (3, 'Resultados Publicados', 'Los resultados del I periodo ya estan disponibles en el portal.', 1, 'interna', 'estudiante@ina.edu.sv', NULL, NULL, NULL, 1, '2026-08-14 18:30:23', '2026-08-14 18:49:13');
INSERT INTO `notificaciones` VALUES (4, 'Actividad Proxima', 'Recuerde que el examen de Programacion es el 9 de febrero.', 1, 'interna', 'jose19morado@gmail.com', NULL, NULL, NULL, 4, '2026-08-14 18:30:23', '2026-08-14 18:49:13');
-- 4 fila(s) en `notificaciones`

DROP TABLE IF EXISTS `periodos_academicos`;
CREATE TABLE `periodos_academicos` (
  `id_periodo` int AUTO_INCREMENT,
  `anio_lectivo` year NOT NULL,
  `numero_periodo` tinyint NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('Activo','Cerrado') DEFAULT Activo,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_periodo`)
);
INSERT INTO `periodos_academicos` VALUES (1, 2026, 1, 'I Periodo', '2026-01-15 00:00:00', '2026-03-15 00:00:00', 'Activo', '2026-08-14 18:30:21');
INSERT INTO `periodos_academicos` VALUES (2, 2026, 2, 'II Periodo', '2026-03-16 00:00:00', '2026-05-30 00:00:00', 'Cerrado', '2026-08-14 18:30:21');
INSERT INTO `periodos_academicos` VALUES (3, 2026, 3, 'III Periodo', '2026-06-01 00:00:00', '2026-08-15 00:00:00', 'Cerrado', '2026-08-14 18:30:21');
INSERT INTO `periodos_academicos` VALUES (4, 2026, 4, 'IV Periodo', '2026-08-16 00:00:00', '2026-10-30 00:00:00', 'Cerrado', '2026-08-14 18:30:21');
-- 4 fila(s) en `periodos_academicos`

DROP TABLE IF EXISTS `personas`;
CREATE TABLE `personas` (
  `id_persona` int AUTO_INCREMENT,
  `tipo_documento` enum('DUI','NIT','Pasaporte','NIE','Carnet_Menoridad'),
  `numero_documento` varchar(50),
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `fecha_nacimiento` date,
  `genero` enum('Masculino','Femenino','Otro'),
  `telefono_principal` varchar(15),
  `telefono_secundario` varchar(15),
  `correo` varchar(100),
  `direccion` text,
  `ocupacion` varchar(100),
  `fecha_creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` int
,
  PRIMARY KEY (`id_persona`)
);
INSERT INTO `personas` VALUES (1, 'DUI', '04000001-1', 'Luis Alberto', 'Perez Martinez', '1975-08-20 00:00:00', 'Masculino', '7701-0001', NULL, 'encargado@google.com', 'Colonia San Jose, Apopa', 'Contador', '2026-08-14 18:30:22', '2026-08-14 18:30:22', 6);
INSERT INTO `personas` VALUES (2, 'DUI', '04000002-2', 'Ana Beatriz', 'Gomez Romero', '1978-02-14 00:00:00', 'Femenino', '7701-0002', NULL, 'ana.gomez@correo.com', 'Colonia San Jose, Apopa', 'Ama de casa', '2026-08-14 18:30:22', '2026-08-14 18:30:22', NULL);
INSERT INTO `personas` VALUES (3, 'DUI', '04000003-3', 'Roberto Carlos', 'Hernandez Torres', '1974-11-30 00:00:00', 'Masculino', '7701-0009', NULL, 'roberto.hernandez@correo.com', 'Canton Santa Lucia, Apopa', 'Agricultor', '2026-08-14 18:30:22', '2026-08-14 18:30:22', NULL);
INSERT INTO `personas` VALUES (4, 'DUI', '04000004-4', 'Juan Carlos', 'Perez Rodriguez', '1970-05-10 00:00:00', 'Masculino', '7799-0001', NULL, 'direccion@ina.edu.sv', 'Apopa', 'Director', '2026-08-14 18:30:22', '2026-08-14 18:30:22', 2);
INSERT INTO `personas` VALUES (5, 'DUI', '12345678-9', 'Prueba10', 'Prueba10', NULL, NULL, '12345678', NULL, 'jefferaguirrre@gmail.com', NULL, NULL, '2026-09-23 22:01:32', '2026-09-23 22:01:32', 33);
INSERT INTO `personas` VALUES (7, 'DUI', '12345678-0', 'Prueba10', 'Prueba10', NULL, NULL, '12345678', NULL, 'jefferaguirrre@gmail.com', NULL, NULL, '2026-09-24 00:25:15', '2026-09-24 00:25:15', 33);
-- 6 fila(s) en `personas`

DROP TABLE IF EXISTS `plantillas_constancias`;
CREATE TABLE `plantillas_constancias` (
  `id_plantilla` int AUTO_INCREMENT,
  `nombre_plantilla` varchar(50) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `cuerpo` text NOT NULL,
  `pie` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_plantilla`)
);
-- 0 fila(s) en `plantillas_constancias`

DROP TABLE IF EXISTS `prestamos_equipo`;
CREATE TABLE `prestamos_equipo` (
  `id_prestamo` int NOT NULL,
  `id_inventario` int NOT NULL,
  `tipo_solicitante` enum('Docente','Estudiante','Administrativo') NOT NULL,
  `id_solicitante` int NOT NULL,
  `nombre_solicitante` varchar(150),
  `fecha_prestamo` date,
  `fecha_devolucion_esperada` date,
  `fecha_devolucion_real` date,
  `estado_prestamo` enum('Pendiente','Activo','Devuelto','Vencido','Cancelado') DEFAULT Pendiente,
  `estado_equipo_entrega` enum('Bueno','Regular','Malo') DEFAULT Bueno,
  `estado_equipo_devolucion` enum('Bueno','Regular','Malo','Danado'),
  `aprobado_por` varchar(100)
);
-- 0 fila(s) en `prestamos_equipo`

DROP TABLE IF EXISTS `promocion_automatica`;
CREATE TABLE `promocion_automatica` (
  `id_promocion` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `id_clase_origen` int NOT NULL,
  `id_clase_destino` int,
  `anio_lectivo` year NOT NULL,
  `promedio_final` decimal(5,2),
  `estado_promocion` enum('Promovido','Reprobado','CambioEspecialidad'),
  `nueva_especialidad` int,
  `observaciones` text
);
-- 0 fila(s) en `promocion_automatica`

DROP TABLE IF EXISTS `recuperaciones`;
CREATE TABLE `recuperaciones` (
  `id_recuperacion` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `nota_recuperacion` decimal(5,2) NOT NULL,
  `fecha_recuperacion` date NOT NULL,
  `tipo_recuperacion` enum('Sustituye','Promedia','Nota_Minima') DEFAULT Sustituye,
  `nota_minima_asignada` decimal(5,2),
  `registrado_por` int,
  `observaciones` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_recuperacion`)
);
-- 0 fila(s) en `recuperaciones`

DROP TABLE IF EXISTS `recuperaciones_contrasena`;
CREATE TABLE `recuperaciones_contrasena` (
  `id_recuperacion` int AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `token` varchar(100) NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_recuperacion`)
);
-- 0 fila(s) en `recuperaciones_contrasena`

DROP TABLE IF EXISTS `recuperaciones_modulo`;
CREATE TABLE `recuperaciones_modulo` (
  `id_recuperacion_modulo` int AUTO_INCREMENT,
  `id_resultado_periodo` int NOT NULL,
  `id_actividad` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `id_periodo` int NOT NULL,
  `id_clase` int NOT NULL,
  `id_especialidad` int,
  `nota_recuperacion` decimal(5,2),
  `observacion` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_recuperacion_modulo`)
);
INSERT INTO `recuperaciones_modulo` VALUES (1, 0, 39, 11, 1, 3, NULL, NULL, '', '2026-09-12 15:46:37', '2026-09-12 15:46:42');
INSERT INTO `recuperaciones_modulo` VALUES (2, 0, 39, 3, 1, 3, NULL, 5.00, '', '2026-09-12 16:36:45', '2026-09-12 16:36:45');
INSERT INTO `recuperaciones_modulo` VALUES (3, 0, 40, 3, 1, 3, NULL, 5.00, '', '2026-09-12 16:36:47', '2026-09-12 16:36:47');
INSERT INTO `recuperaciones_modulo` VALUES (4, 0, 41, 3, 1, 3, NULL, 4.00, '', '2026-09-12 16:36:50', '2026-09-12 16:36:50');
INSERT INTO `recuperaciones_modulo` VALUES (5, 0, 43, 3, 1, 3, NULL, 4.00, '', '2026-09-12 16:36:54', '2026-09-12 16:36:54');
-- 5 fila(s) en `recuperaciones_modulo`

DROP TABLE IF EXISTS `relaciones_familiares`;
CREATE TABLE `relaciones_familiares` (
  `id_relacion` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_persona` int NOT NULL,
  `parentesco` enum('Padre','Madre','Encargado','Tutor','Hermano','Abuelo','Otro') NOT NULL,
  `vive_con_estudiante` tinyint(1) DEFAULT 1,
  `recibe_comunicados` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_relacion`)
);
INSERT INTO `relaciones_familiares` VALUES (1, 1, 1, 'Padre', 1, 1, '2026-08-14 18:30:22', '2026-08-14 18:30:22');
INSERT INTO `relaciones_familiares` VALUES (2, 2, 1, 'Padre', 1, 1, '2026-08-14 18:30:22', '2026-08-14 18:30:22');
INSERT INTO `relaciones_familiares` VALUES (3, 1, 2, 'Madre', 1, 0, '2026-08-14 18:30:22', '2026-08-14 18:30:22');
INSERT INTO `relaciones_familiares` VALUES (4, 2, 2, 'Madre', 1, 0, '2026-08-14 18:30:22', '2026-08-14 18:30:22');
INSERT INTO `relaciones_familiares` VALUES (5, 6, 3, 'Padre', 1, 1, '2026-08-14 18:30:22', '2026-08-14 18:30:22');
INSERT INTO `relaciones_familiares` VALUES (6, 999, 5, 'Encargado', 1, 1, '2026-09-23 22:01:32', '2026-09-23 22:01:32');
INSERT INTO `relaciones_familiares` VALUES (7, 42, 7, 'Encargado', 1, 1, '2026-09-24 00:25:15', '2026-09-24 00:25:15');
INSERT INTO `relaciones_familiares` VALUES (8, 42, 5, 'Encargado', 1, 1, '2026-09-24 23:03:59', '2026-09-24 23:03:59');
-- 8 fila(s) en `relaciones_familiares`

DROP TABLE IF EXISTS `reportes_datos_estudiante`;
CREATE TABLE `reportes_datos_estudiante` (
  `id` int AUTO_INCREMENT,
  `estudiante_id` int NOT NULL,
  `campo` varchar(100) NOT NULL,
  `valor_actual` text,
  `valor_propuesto` text NOT NULL,
  `comentario` text,
  `estado` enum('Pendiente','EnRevision','Aprobado','Rechazado') NOT NULL DEFAULT Pendiente,
  `motivo_rechazo` text,
  `resuelto_por` int,
  `fecha_creacion` datetime NOT NULL,
  `fecha_resolucion` datetime
,
  PRIMARY KEY (`id`)
);
-- 0 fila(s) en `reportes_datos_estudiante`

DROP TABLE IF EXISTS `reportes_pendientes`;
CREATE TABLE `reportes_pendientes` (
  `id_reportes` int NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text,
  `tipo_reporte` enum('Academico','Disciplinario','Equipo','General') DEFAULT General,
  `generado_por` varchar(100),
  `fecha_generacion` date,
  `estado` enum('Pendiente','En Proceso','Completado','Cancelado') DEFAULT Pendiente,
  `archivo_adjunto` varchar(255),
  `observaciones` text,
  `id_admin` int,
  `aprobado_por` int
);
-- 0 fila(s) en `reportes_pendientes`

DROP TABLE IF EXISTS `resultados_finales`;
CREATE TABLE `resultados_finales` (
  `id_resultado_final` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_clase` int NOT NULL,
  `anio_lectivo` year NOT NULL,
  `nota_final` decimal(5,2) NOT NULL DEFAULT 0.00,
  `estado_materia` enum('Aprobado','Reprobado','Recuperacion','Pendiente') DEFAULT Pendiente,
  `fecha_calculo` timestamp DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_resultado_final`)
);
INSERT INTO `resultados_finales` VALUES (1, 1, 1, 1, 2026, 8.30, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (2, 1, 2, 1, 2026, 8.60, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (3, 1, 3, 1, 2026, 7.80, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (4, 1, 4, 1, 2026, 8.90, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (5, 1, 5, 1, 2026, 8.00, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (6, 1, 6, 1, 2026, 8.40, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (7, 2, 1, 1, 2026, 7.30, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (8, 2, 2, 1, 2026, 7.40, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (9, 2, 3, 1, 2026, 7.20, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (10, 2, 4, 1, 2026, 7.00, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (11, 2, 5, 1, 2026, 8.10, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (12, 2, 6, 1, 2026, 6.90, 'Recuperacion', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (13, 7, 1, 1, 2026, 9.00, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (14, 7, 2, 1, 2026, 8.90, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (15, 7, 3, 1, 2026, 8.00, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (16, 7, 4, 1, 2026, 9.20, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (17, 7, 5, 1, 2026, 8.80, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (18, 7, 6, 1, 2026, 8.50, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (19, 3, 7, 3, 2026, 7.90, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (20, 3, 8, 3, 2026, 8.20, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (21, 3, 5, 3, 2026, 7.90, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (22, 3, 6, 3, 2026, 8.00, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (23, 12, 7, 3, 2026, 9.00, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (24, 12, 8, 3, 2026, 9.30, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (25, 12, 5, 3, 2026, 8.80, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (26, 12, 6, 3, 2026, 8.60, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (27, 6, 7, 4, 2026, 8.40, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (28, 6, 8, 4, 2026, 8.10, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (29, 15, 7, 5, 2026, 9.10, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (30, 15, 8, 5, 2026, 9.40, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (31, 16, 7, 5, 2026, 8.20, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (32, 16, 8, 5, 2026, 8.50, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (33, 4, 10, 6, 2026, 7.80, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (34, 4, 11, 6, 2026, 8.00, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (35, 18, 10, 6, 2026, 6.90, 'Recuperacion', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (36, 18, 11, 6, 2026, 7.20, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (37, 5, 12, 7, 2026, 8.20, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (38, 5, 13, 7, 2026, 8.10, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (39, 19, 12, 7, 2026, 7.90, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
INSERT INTO `resultados_finales` VALUES (40, 19, 13, 7, 2026, 8.40, 'Aprobado', '2026-08-14 18:30:23', '2026-08-14 18:30:23', '2026-08-14 18:30:23');
-- 40 fila(s) en `resultados_finales`

DROP TABLE IF EXISTS `resultados_periodos`;
CREATE TABLE `resultados_periodos` (
  `id_resultado_periodo` int AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_materia` int,
  `id_especialidad` int,
  `id_clase` int NOT NULL,
  `id_periodo` int NOT NULL,
  `anio_lectivo` year,
  `nota_acumulada` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `nota_recuperacion` decimal(5,2),
  `nota_final_anual` decimal(5,2),
  `nota_recuperacion_anual` decimal(5,2),
  `observacion_recuperacion` text,
  `observacion_recuperacion_anual` text,
  `nota_recuperacion_modulo` decimal(5,2),
  `observacion_recuperacion_modulo` text
,
  PRIMARY KEY (`id_resultado_periodo`)
);
INSERT INTO `resultados_periodos` VALUES (102, 8, 2, NULL, 1, 1, 2026, 8.30, '2026-09-07 22:29:08', '2026-09-11 00:19:06', NULL, NULL, NULL, '', NULL, NULL, NULL);
INSERT INTO `resultados_periodos` VALUES (103, 7, 2, NULL, 1, 1, 2026, 3.26, '2026-09-07 23:28:32', '2026-09-07 23:40:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `resultados_periodos` VALUES (104, 8, 1, NULL, 1, 1, 2026, 9.79, '2026-09-11 10:40:41', '2026-09-11 10:41:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `resultados_periodos` VALUES (105, 7, 1, NULL, 1, 1, 2026, 7.00, '2026-09-11 10:41:26', '2026-09-11 10:41:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `resultados_periodos` VALUES (106, 33, 1, NULL, 1, 1, 2026, 3.15, '2026-09-11 10:42:27', '2026-09-11 10:42:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `resultados_periodos` VALUES (107, 11, 2, NULL, 3, 1, 2026, 7.44, '2026-09-12 16:17:36', '2026-09-12 16:32:41', 6.00, NULL, NULL, '', NULL, NULL, NULL);
INSERT INTO `resultados_periodos` VALUES (108, 3, 2, NULL, 3, 1, 2026, 10.00, '2026-09-12 16:30:13', '2026-09-12 16:31:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `resultados_periodos` VALUES (109, 12, 2, NULL, 3, 1, 2026, 1.75, '2026-09-12 16:31:24', '2026-09-12 16:32:37', 6.00, NULL, NULL, '', NULL, NULL, NULL);
INSERT INTO `resultados_periodos` VALUES (110, 40, 1, NULL, 2, 1, 2026, 7.00, '2026-09-17 11:33:57', '2026-09-17 11:34:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
-- 9 fila(s) en `resultados_periodos`

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` text,
  `nivel_acceso` int DEFAULT 1,
  `estado` tinyint(1) DEFAULT 1
);
INSERT INTO `roles` VALUES (1, 'Administrador', 'Acceso total al sistema', 1, 1);
INSERT INTO `roles` VALUES (2, 'Director', 'Acceso a todo excepto configuracion', 2, 1);
INSERT INTO `roles` VALUES (3, 'Sub Director', 'Acceso limitado a gestion academica', 3, 1);
INSERT INTO `roles` VALUES (4, 'Registro Academico', 'Todos los permisos de gestion academica', 2, 1);
INSERT INTO `roles` VALUES (5, 'Coordinador', 'Supervision de docentes y materias', 4, 1);
INSERT INTO `roles` VALUES (6, 'Docente', 'Solo puede calificar y ver sus materias', 5, 1);
INSERT INTO `roles` VALUES (7, 'Estudiante', 'Solo puede consultar notas, horarios y avisos', 6, 1);
INSERT INTO `roles` VALUES (8, 'Encargado', 'Padres o tutores de estudiantes', 6, 1);
INSERT INTO `roles` VALUES (9, '4457', 'saaaa', 3, 1);
-- 9 fila(s) en `roles`

DROP TABLE IF EXISTS `secciones`;
CREATE TABLE `secciones` (
  `id_seccion` int AUTO_INCREMENT,
  `nombre_seccion` varchar(10) NOT NULL,
  `estado` tinyint(1) DEFAULT 1
,
  PRIMARY KEY (`id_seccion`)
);
INSERT INTO `secciones` VALUES (1, 'A', 1);
INSERT INTO `secciones` VALUES (2, 'B', 1);
INSERT INTO `secciones` VALUES (3, 'C', 1);
-- 3 fila(s) en `secciones`

DROP TABLE IF EXISTS `sesiones_usuarios`;
CREATE TABLE `sesiones_usuarios` (
  `id_sesion` int AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `token` varchar(500),
  `ip` varchar(50),
  `fecha_inicio` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_fin` datetime,
  `activa` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id_sesion`)
);
INSERT INTO `sesiones_usuarios` VALUES (1, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZjQ4ZDMzZC1lZGRmLTQzY2QtYTBiYy04NmM0MDViMjMyOWIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY3NjY5NDcsImV4cCI6MTc4Njc5NTc0NywiaWF0IjoxNzg2NzY2OTQ3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.14LWS05CtpL1obTZJch0gIrQa8mSlLRyHAaPJjGkGWA', '::1', '2026-08-14 22:09:07', NULL, 1, '2026-08-14 22:09:07');
INSERT INTO `sesiones_usuarios` VALUES (2, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZTQ4NjMwOS03N2RkLTQ3NmUtYTAyNy1kZjU1MGY2YWNjYjUiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2NzY3MTU1LCJleHAiOjE3ODY3OTU5NTUsImlhdCI6MTc4Njc2NzE1NSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Y83ypyHo8hAk-Hu0YBmaLyG6fqJlv_6qrJgWVfKNUpk', '::1', '2026-08-14 22:12:35', NULL, 1, '2026-08-14 22:12:35');
INSERT INTO `sesiones_usuarios` VALUES (3, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDdmYmQ1Mi1hN2M4LTQ2NTktYjNmMS0zNDM4YTgzOTdkNGUiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2NzY3MjE3LCJleHAiOjE3ODY3OTYwMTcsImlhdCI6MTc4Njc2NzIxNywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.YpPmP6fQ3Mz1zlvqmezJwZLkjssgsuO86783jfw4cDo', '::1', '2026-08-14 22:13:38', NULL, 1, '2026-08-14 22:13:38');
INSERT INTO `sesiones_usuarios` VALUES (4, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMmUxZGE1NC0wNTYzLTRhYmItODcwOC00MzNmZmI5YmViM2EiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4Njc2NzIyNSwiZXhwIjoxNzg2Nzk2MDI1LCJpYXQiOjE3ODY3NjcyMjUsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.tWtKmVLVGx9ZFAItUOutdDBw6ODj75T1rBfhTBC38S4', '::1', '2026-08-14 22:13:45', NULL, 1, '2026-08-14 22:13:45');
INSERT INTO `sesiones_usuarios` VALUES (5, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlZmRhYzEzMC00MDg3LTQ1Y2YtODYyOS00MTUxZDcyNTFkYjEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY3NjcyNDIsImV4cCI6MTc4Njc5NjA0MiwiaWF0IjoxNzg2NzY3MjQyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.VzkOsQkA4UHxVIUDbuiZDEUV-HWx92kKUUGlrp5KGgs', '::1', '2026-08-14 22:14:02', NULL, 1, '2026-08-14 22:14:02');
INSERT INTO `sesiones_usuarios` VALUES (6, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNTQ1MDY1OS00Mzc3LTRiODUtOTkyMi01YzhhYjc4NjU2NDIiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2NzY3MzEyLCJleHAiOjE3ODY3OTYxMTIsImlhdCI6MTc4Njc2NzMxMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.ClEtmR3h1MMZP2YoahiDsRCvqe-0se4yX1E6wzM_ySU', '::1', '2026-08-14 22:15:12', NULL, 1, '2026-08-14 22:15:12');
INSERT INTO `sesiones_usuarios` VALUES (7, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4YWQ3M2RiYS04YWFiLTRmMDItOTdlNi0wMDVhZDU0NDE0MTIiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2NzY3MzMxLCJleHAiOjE3ODY3OTYxMzEsImlhdCI6MTc4Njc2NzMzMSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Sz31IRhfyYX80ZBuHGcvj4Oj79HREd7du1HkhlxXzew', '::1', '2026-08-14 22:15:32', NULL, 1, '2026-08-14 22:15:32');
INSERT INTO `sesiones_usuarios` VALUES (8, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzODExYWY5My0xNzVjLTRkMmEtOWExZi1hODdlMDlmMTNjOTgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MDEyOTAsImV4cCI6MTc4NjkzMDA5MCwiaWF0IjoxNzg2OTAxMjkwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.aLN_2TYSWlFmdhZw2V_xcSRbVstT_6RGhAs0oFNFhUk', '::1', '2026-08-16 11:28:10', NULL, 1, '2026-08-16 11:28:10');
INSERT INTO `sesiones_usuarios` VALUES (9, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MzZiYzY4Ny0yN2JkLTQ2NDItOTFjYS0zYThiNWNiMmYwMjkiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NjkwMTM1OCwiZXhwIjoxNzg2OTMwMTU4LCJpYXQiOjE3ODY5MDEzNTgsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.5t0TnJ-CXMGl8NC2U94p_pvfbq-kgJREYufzk3960BM', '::1', '2026-08-16 11:29:19', NULL, 1, '2026-08-16 11:29:19');
INSERT INTO `sesiones_usuarios` VALUES (10, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYTgxODVjNS0yN2M5LTRiNmYtYjc3NC1lYzcxNTJhZjk2NWYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MDIzODksImV4cCI6MTc4NjkzMTE4OSwiaWF0IjoxNzg2OTAyMzg5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.y9Cd81fO6qhLhM3QUw0eI4y_dq-Co7BXmVRARWukolE', '::1', '2026-08-16 11:46:29', NULL, 1, '2026-08-16 11:46:29');
INSERT INTO `sesiones_usuarios` VALUES (11, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhYzdiODYwMi03NDVlLTQ1NDUtYTljNi0zZTgwY2M5MTVhNzQiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NjkwMzI1MCwiZXhwIjoxNzg2OTMyMDUwLCJpYXQiOjE3ODY5MDMyNTAsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.FYAT0vKV5kexrkYiP5_hBmmAYkrMWsz1YID1dvNbQ1g', '::1', '2026-08-16 12:00:50', NULL, 1, '2026-08-16 12:00:50');
INSERT INTO `sesiones_usuarios` VALUES (12, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjRhOGRmNy0wYzQ2LTRkMjEtOTEwZi02YzRiOTE2YzU2NWQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MDQ2NjgsImV4cCI6MTc4NjkzMzQ2OCwiaWF0IjoxNzg2OTA0NjY4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.xUlGdIIsPLUE0u4HQJGrYa8a2fTp-xpDZoXKvqePSak', '::1', '2026-08-16 12:24:28', NULL, 1, '2026-08-16 12:24:28');
INSERT INTO `sesiones_usuarios` VALUES (13, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhODI2MzJkMC01Mzc5LTQ0ZDgtYmJkMi00MjkyOGM5MjEyZmYiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NjkwNDY5MCwiZXhwIjoxNzg2OTMzNDkwLCJpYXQiOjE3ODY5MDQ2OTAsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.fvHMjKeR6xWTww2vUFsxlGpzHlqGxjmO3BLS6AMlPls', '::1', '2026-08-16 12:24:51', NULL, 1, '2026-08-16 12:24:51');
INSERT INTO `sesiones_usuarios` VALUES (14, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmOTFlOGIzYy1hOTBkLTQyODYtODJhZC0zOTA0Y2VkYjBlYWUiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTEwMjAyLCJleHAiOjE3ODY5MzkwMDIsImlhdCI6MTc4NjkxMDIwMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.vKqXFC4EXio_iaDRmOb1bCL6JuQEKIeHJFUA9ez2nsM', '::1', '2026-08-16 13:56:42', NULL, 1, '2026-08-16 13:56:42');
INSERT INTO `sesiones_usuarios` VALUES (15, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NGVmYTQzNy1kYjYyLTQwMTItYTIxYy03NDkzMGUzYWYzZDgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MTE4NDksImV4cCI6MTc4Njk0MDY0OSwiaWF0IjoxNzg2OTExODQ5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.bbLGOdqP7Z5EZFdfxz2lRT_oc8RNiM5sml5rSPWccEQ', '::1', '2026-08-16 14:24:10', NULL, 1, '2026-08-16 14:24:10');
INSERT INTO `sesiones_usuarios` VALUES (16, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTI0NjY4ZC00OTE2LTQwYzQtYmZmMi0zZmNhZDQwZGZjZWEiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTE2NzczLCJleHAiOjE3ODY5NDU1NzMsImlhdCI6MTc4NjkxNjc3MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.aHfrVOOPTvERAAjkHVCLI8FGyFUwMdqbVtzqfnK0wyk', '::1', '2026-08-16 15:46:13', NULL, 1, '2026-08-16 15:46:13');
INSERT INTO `sesiones_usuarios` VALUES (17, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MTg2YjAwMy0xMjY5LTQ5MTEtYjA3Ny1hNTY3NDY0MmI3MzEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MTY4MDUsImV4cCI6MTc4Njk0NTYwNSwiaWF0IjoxNzg2OTE2ODA1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.piBKG_BHTUrPXRnbMn_zxv9ftxrgg2cJ5nDzzePJdgU', '::1', '2026-08-16 15:46:46', NULL, 1, '2026-08-16 15:46:46');
INSERT INTO `sesiones_usuarios` VALUES (18, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNzhiMzA1ZS03MmZjLTQxZjUtODE0OS1jNDZiMDgwZGEwNGQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MTY4NTYsImV4cCI6MTc4Njk0NTY1NiwiaWF0IjoxNzg2OTE2ODU2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.Gdy31-291zV7vJbmZNkRZv-MKkK_KsSQk7z8pEyKu7g', '::1', '2026-08-16 15:47:36', NULL, 1, '2026-08-16 15:47:36');
INSERT INTO `sesiones_usuarios` VALUES (19, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NTM3NjViYi1mMDZlLTQ2OTAtYmNhMC03NTE5OGIwMzMyMzEiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2OTE3MzM2LCJleHAiOjE3ODY5NDYxMzYsImlhdCI6MTc4NjkxNzMzNiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.uAFXV9JCFqI9xkjJhm66zeAXo9Wd_JSKBHDjdY5YiGE', '::1', '2026-08-16 15:55:37', NULL, 1, '2026-08-16 15:55:37');
INSERT INTO `sesiones_usuarios` VALUES (20, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMGY1NGYzYS1mZDgyLTQ5NDItOTk2Mi00NmQzZGZhODg0ZjgiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NjkyMTQzMiwiZXhwIjoxNzg2OTUwMjMyLCJpYXQiOjE3ODY5MjE0MzIsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.E6Eklj13g1tg5LVkrIn-C8mIMe6C-vSQL6fjs6Yd7XU', '::1', '2026-08-16 17:03:52', NULL, 1, '2026-08-16 17:03:52');
INSERT INTO `sesiones_usuarios` VALUES (21, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZWIzOTMxOS01OGEzLTQ2MWUtOTkxMC0wODQ5MmM2ZTk5NDMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjE0NTcsImV4cCI6MTc4Njk1MDI1NywiaWF0IjoxNzg2OTIxNDU3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.L7AAR7zVLki_w2doV3XjoxCIg94ZkbViP4M3jlr8dNo', '::1', '2026-08-16 17:04:18', NULL, 1, '2026-08-16 17:04:18');
INSERT INTO `sesiones_usuarios` VALUES (22, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NTQ1YzNhYi05YzBhLTRmYjEtOTllYS02NWY2YTEyYjE5N2IiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTIxNTkyLCJleHAiOjE3ODY5NTAzOTIsImlhdCI6MTc4NjkyMTU5MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.z8H6RprftDRSvsKyahz7jaP0_NDxlok3WAz5AnoRyX8', '::1', '2026-08-16 17:06:33', NULL, 1, '2026-08-16 17:06:33');
INSERT INTO `sesiones_usuarios` VALUES (23, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZWQ4ZDgzYi1mM2IwLTQyMWYtYjZkNi1kZWE5ZWZiYTkwYWIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjE3NjAsImV4cCI6MTc4Njk1MDU2MCwiaWF0IjoxNzg2OTIxNzYwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.Zh5xakfhmxSiJa3hivAf1TUzuRrEnlbicBDaXT4_X74', '::1', '2026-08-16 17:09:20', NULL, 1, '2026-08-16 17:09:20');
INSERT INTO `sesiones_usuarios` VALUES (24, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNmZkOWIwYS1hZDNkLTQ2Y2YtYWQ1Mi03YjkyZjdkNWJmNjgiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTIxNzY5LCJleHAiOjE3ODY5NTA1NjksImlhdCI6MTc4NjkyMTc2OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.LBzpAR_ZUQgxxzun98vC9JxSQqQYReLcksWvNwZQWj8', '::1', '2026-08-16 17:09:29', NULL, 1, '2026-08-16 17:09:29');
INSERT INTO `sesiones_usuarios` VALUES (25, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNzZjYzRjNC1iZWNhLTRjYWQtYTFiOS04MGU4YzU0MjU5ZjEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NjkyMTg4NywiZXhwIjoxNzg2OTUwNjg3LCJpYXQiOjE3ODY5MjE4ODcsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.Y_O6T0b0zXSv79AfD_czyWLRphg1kL82HKoGSSz1sLQ', '::1', '2026-08-16 17:11:28', NULL, 1, '2026-08-16 17:11:28');
INSERT INTO `sesiones_usuarios` VALUES (26, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NjAwNjE2Zi04NjcxLTQ5YzMtYTZkNy0zNTY3NGI0NjYzODgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjIxMjksImV4cCI6MTc4Njk1MDkyOSwiaWF0IjoxNzg2OTIyMTI5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.385cdLOKL0oz8uF4oGCdsfJz0TU4NzC7nGkupbXPHgc', '::1', '2026-08-16 17:15:30', NULL, 1, '2026-08-16 17:15:30');
INSERT INTO `sesiones_usuarios` VALUES (27, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YjQxYzgyNi1lOGM4LTQyODgtYjgzZi1mMTEyOWY1ZjFlY2IiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjIxOTIsImV4cCI6MTc4Njk1MDk5MiwiaWF0IjoxNzg2OTIyMTkyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.77X1ojcDtYMYcmy8BFaFBBr6oMHLQipX-TJq1joNgvU', '::1', '2026-08-16 17:16:33', NULL, 1, '2026-08-16 17:16:33');
INSERT INTO `sesiones_usuarios` VALUES (28, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YzRlYTA1YS00YTQwLTQzMjYtODZmYS0wMDQ2ZWM2NzcwMDAiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NjkyMjIyOCwiZXhwIjoxNzg2OTUxMDI4LCJpYXQiOjE3ODY5MjIyMjgsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.znRi5a9-zCPL_2awfPu3eANds_uKjJijRV6fCV0SdYQ', '::1', '2026-08-16 17:17:09', NULL, 1, '2026-08-16 17:17:09');
INSERT INTO `sesiones_usuarios` VALUES (29, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmN2M0NzdlMy03ZmFlLTRmM2YtODljMC0xMGJlMGNiNmEyMTQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjIyODgsImV4cCI6MTc4Njk1MTA4OCwiaWF0IjoxNzg2OTIyMjg4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.N0bHz0TFyJqcGUXlaQS72z-aHQxq5rZRNjL6UqA7Fec', '::1', '2026-08-16 17:18:09', NULL, 1, '2026-08-16 17:18:09');
INSERT INTO `sesiones_usuarios` VALUES (30, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMDJhYzExNS0yZDdlLTQ0YzQtYjU0MC02MjRkNTI4MWVkNzciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjIzNzcsImV4cCI6MTc4Njk1MTE3NywiaWF0IjoxNzg2OTIyMzc3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.d0voyyL77JNPq81Z2qhmeRMrPdiFLU8wy90CbTXw4Pk', '::1', '2026-08-16 17:19:37', NULL, 1, '2026-08-16 17:19:37');
INSERT INTO `sesiones_usuarios` VALUES (31, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ODA2Mjc1MS04Mjk2LTRlOGItOTkzOC02NmE0ZDkxNTgzYjIiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTIyNTg5LCJleHAiOjE3ODY5NTEzODksImlhdCI6MTc4NjkyMjU4OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.PFf3xSKlf0PcxcYpxT5-S3ykp1vVOMlt_pbO62wju8s', '::1', '2026-08-16 17:23:09', NULL, 1, '2026-08-16 17:23:09');
INSERT INTO `sesiones_usuarios` VALUES (32, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZWZiNDkxNS1jZGM4LTQwMWEtYjVlZC04NjU5YzQzZjc5MzIiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2OTIyNjE4LCJleHAiOjE3ODY5NTE0MTgsImlhdCI6MTc4NjkyMjYxOCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Bmgcu9lL7KldwalwdlNcz_7uKelust_X9e3j5-qutJg', '::1', '2026-08-16 17:23:39', NULL, 1, '2026-08-16 17:23:39');
INSERT INTO `sesiones_usuarios` VALUES (33, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1Y2FiNjU0ZS1hNzA2LTQ5ZDYtYmE3Ny1mZDJmMDVjMWEyMDEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjI2NzQsImV4cCI6MTc4Njk1MTQ3NCwiaWF0IjoxNzg2OTIyNjc0LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.yQDTAr5bG5-fmDaRweLtjjnSuCtTwGBNX6Pe9Nzb6WQ', '::1', '2026-08-16 17:24:35', NULL, 1, '2026-08-16 17:24:35');
INSERT INTO `sesiones_usuarios` VALUES (34, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYTQyNzY1Yy1iMzU5LTQ3MmUtOGYyNi05N2RjOWE5N2Q3MzQiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2OTI0ODg4LCJleHAiOjE3ODY5NTM2ODgsImlhdCI6MTc4NjkyNDg4OCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.615AZrgSeHNa4WQUKptp3IuG8kQqnP9xaGJQmS4wziE', '::1', '2026-08-16 18:01:28', NULL, 1, '2026-08-16 18:01:28');
INSERT INTO `sesiones_usuarios` VALUES (35, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZjhiMWEzYS0yNDk4LTRhOTMtYjBkMS03ZWUzZTBiMjcxNDMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjU3MTgsImV4cCI6MTc4Njk1NDUxOCwiaWF0IjoxNzg2OTI1NzE4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.bnGU0DtbEJKJRNeIor2GG2ZFeGmF2LpqG-h5NkunN9w', '::1', '2026-08-16 18:15:19', NULL, 1, '2026-08-16 18:15:19');
INSERT INTO `sesiones_usuarios` VALUES (36, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlZDQwMGYzNC0wODU5LTRhY2YtYWQyNC04OTQzM2I2OGVlZGQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjU4NTcsImV4cCI6MTc4Njk1NDY1NywiaWF0IjoxNzg2OTI1ODU3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.FZoB8sih4NF-FclZWgW_Fz1C5SPYqX829pVfu3l3pQg', '::1', '2026-08-16 18:17:38', NULL, 1, '2026-08-16 18:17:38');
INSERT INTO `sesiones_usuarios` VALUES (37, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2MDNhYmIwYy0wYzY2LTQ3NjgtYWQwMS0zZTRjNjc4Yjk1YjAiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2OTI2MDEzLCJleHAiOjE3ODY5NTQ4MTMsImlhdCI6MTc4NjkyNjAxMywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.rmsj6aTXspWx-pc4JzYk9A_rlQ7pVm7kr8wYkR9NIks', '::1', '2026-08-16 18:20:13', NULL, 1, '2026-08-16 18:20:13');
INSERT INTO `sesiones_usuarios` VALUES (38, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MTMyZWQyMC00YmY0LTQwOTctODUwNi1iYjA0NjZmZDBhYjgiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2OTI3MDg5LCJleHAiOjE3ODY5NTU4ODksImlhdCI6MTc4NjkyNzA4OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.GHCXsBtgWyNnFEqzaYlLl9Pmh1H0d5MJj4-8giI1ndM', '::1', '2026-08-16 18:38:09', NULL, 1, '2026-08-16 18:38:09');
INSERT INTO `sesiones_usuarios` VALUES (39, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyYjlhZDA1OC03MTkyLTRjMDYtOGQ1OS0zZDMwYzdlZDRhZjgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5Mjc4MTMsImV4cCI6MTc4Njk1NjYxMywiaWF0IjoxNzg2OTI3ODEzLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.U5-h_Jx8JCiQ4P1-FZSfrmDj6ZwR4q_rGq1CjMWbsys', '::1', '2026-08-16 18:50:14', NULL, 1, '2026-08-16 18:50:14');
INSERT INTO `sesiones_usuarios` VALUES (40, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmOGY3Y2MyYy0wMGEyLTRhMjktYWQyZC1kMGViOWJhNzU2YzIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5Mjc5MTIsImV4cCI6MTc4Njk1NjcxMiwiaWF0IjoxNzg2OTI3OTEyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.g8I1v-JVSn8iwqFSZp5wEfB76vUClZL8Gr3GKzPMIB4', '::1', '2026-08-16 18:51:52', NULL, 1, '2026-08-16 18:51:52');
INSERT INTO `sesiones_usuarios` VALUES (41, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZDdlNzc5OS04OTIwLTQyOTctODIyZS01MzJiZDNlMjZiMjIiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTI4MzQwLCJleHAiOjE3ODY5NTcxNDAsImlhdCI6MTc4NjkyODM0MCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.3AiuNPWOOFiYyRURKFTmblNQ-uPis7HUGa8tryDdx6k', '::1', '2026-08-16 18:59:00', NULL, 1, '2026-08-16 18:59:00');
INSERT INTO `sesiones_usuarios` VALUES (42, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MzNkNWQzZi05ZGQ0LTRlMzgtOTcwYi05ZmRmYTlhYTIwMmYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjgzODksImV4cCI6MTc4Njk1NzE4OSwiaWF0IjoxNzg2OTI4Mzg5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.H3V5Mpbi9Qy0FJqupU-eVAfBgDChVKa-ZAfLfhNvCPU', '::1', '2026-08-16 18:59:50', NULL, 1, '2026-08-16 18:59:50');
INSERT INTO `sesiones_usuarios` VALUES (43, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MTgzOTVkZS1iNTJiLTQ0NDgtOTk5MS0wYjAxZjYzMDk0ODUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjkzNDEsImV4cCI6MTc4Njk1ODE0MSwiaWF0IjoxNzg2OTI5MzQxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.i1SprxmQc6K1zJZHmwPDjCEvRiMTYvBTJzchPEQ2wU8', '::1', '2026-08-16 19:15:42', NULL, 1, '2026-08-16 19:15:42');
INSERT INTO `sesiones_usuarios` VALUES (44, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMDNjMWU2My00MDQzLTQ0NjEtYTI4Zi03NGIzN2Y3NjcyODIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjkzNDYsImV4cCI6MTc4Njk1ODE0NiwiaWF0IjoxNzg2OTI5MzQ2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.2oiCAaqh24QUfCApXOqAeI4pMEM6Hzsw92wdnutOvi4', '::1', '2026-08-16 19:15:47', NULL, 1, '2026-08-16 19:15:47');
INSERT INTO `sesiones_usuarios` VALUES (45, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZmNhOWZlZC1iZTJlLTQxZmItODJhOS1mMzA5ZGVjN2IwYmMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MjkzNTEsImV4cCI6MTc4Njk1ODE1MSwiaWF0IjoxNzg2OTI5MzUxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.NDRDxzM4HwSufUOSMfmKAgCbTQcTb4WlEBY8dOOsoas', '::1', '2026-08-16 19:15:52', NULL, 1, '2026-08-16 19:15:52');
INSERT INTO `sesiones_usuarios` VALUES (46, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyYjljY2M3OS0zNjZhLTQxZGQtYjk2Mi1hM2E3NWQ5NjhlOWIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5Mjk1MDIsImV4cCI6MTc4Njk1ODMwMiwiaWF0IjoxNzg2OTI5NTAyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.aKuNIgem9mvxUVfej3XJ-kTrVgaqfYlYo16fiN4HCas', '::1', '2026-08-16 19:18:22', NULL, 1, '2026-08-16 19:18:22');
INSERT INTO `sesiones_usuarios` VALUES (47, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2OTQ5ZTA2Yi1iYTE3LTRkZWYtODg2MS1jZjExODgzYTRmY2IiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5Mjk1MDcsImV4cCI6MTc4Njk1ODMwNywiaWF0IjoxNzg2OTI5NTA3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.BnkRzVSYz-LBbJFaeY2QZGDZRrmo_Nn32u-g-M4He6k', '::1', '2026-08-16 19:18:27', NULL, 1, '2026-08-16 19:18:27');
INSERT INTO `sesiones_usuarios` VALUES (48, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NDk5NzhmOC05ZjYxLTQzZDEtYjA5Mi03YWY0MjA4NjhjMDgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5Mjk1MTIsImV4cCI6MTc4Njk1ODMxMiwiaWF0IjoxNzg2OTI5NTEyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.h-TiI9AtcoaSfMPbOAbsFH_vMkQwFCH9ilwtkVztO_I', '::1', '2026-08-16 19:18:33', NULL, 1, '2026-08-16 19:18:33');
INSERT INTO `sesiones_usuarios` VALUES (49, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNjQxMWZhZi01YjQyLTRkOTAtODY2YS05YzczMDQzOTcyZTUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5Mjk1MjAsImV4cCI6MTc4Njk1ODMyMCwiaWF0IjoxNzg2OTI5NTIwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.unS0gi7nAV0zSW2lt58FWvCwxoiIL7sJie9WfEFkWYw', '::1', '2026-08-16 19:18:41', NULL, 1, '2026-08-16 19:18:41');
INSERT INTO `sesiones_usuarios` VALUES (50, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMWI3M2M4ZC0zZjk0LTQ5NDQtOGY3Yy01NTM1ZTZlOWMwYjIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5Mjk1MzMsImV4cCI6MTc4Njk1ODMzMywiaWF0IjoxNzg2OTI5NTMzLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.Ff1KTuw-d9HaEpn-b5pjdG3JnubBzhrDDTLMaTj7YIw', '::1', '2026-08-16 19:18:54', NULL, 1, '2026-08-16 19:18:54');
INSERT INTO `sesiones_usuarios` VALUES (51, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjY2NjMjVmNS02N2Q3LTQ5N2YtYmI4ZS03ODkwODBkMWVmMWEiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTMwNDc2LCJleHAiOjE3ODY5NTkyNzYsImlhdCI6MTc4NjkzMDQ3NiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.QgvSA8fDRVu3fcc2FkzD_yIzg5uxGS0JS_y-d_M3ZJ4', '::1', '2026-08-16 19:34:36', NULL, 1, '2026-08-16 19:34:36');
INSERT INTO `sesiones_usuarios` VALUES (52, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYzNmODMyZi00NWRmLTQ0ZGYtODQzNi1lNTEwNDJhNzJkMmUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzA0OTMsImV4cCI6MTc4Njk1OTI5MywiaWF0IjoxNzg2OTMwNDkzLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.ziA2KBXxMyOei4T6iFdDpL-mtvXquMz5MXMNN8J1BtU', '::1', '2026-08-16 19:34:53', NULL, 1, '2026-08-16 19:34:53');
INSERT INTO `sesiones_usuarios` VALUES (53, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNTA3N2I5ZC0wMDcwLTQ5YjQtYmE4My01YTcyM2Y3MzczOTUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzA5MjUsImV4cCI6MTc4Njk1OTcyNSwiaWF0IjoxNzg2OTMwOTI1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.vcqrtz_czKvoLM4EpVsG63C_QTZXF9OSEDWsIZ_EJ54', '::1', '2026-08-16 19:42:06', NULL, 1, '2026-08-16 19:42:06');
INSERT INTO `sesiones_usuarios` VALUES (54, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiN2E2M2ZkNS01OGQ2LTQ1M2MtOWFlNi01YTA5OTBhYzQ0NWMiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTMxMTc3LCJleHAiOjE3ODY5NTk5NzcsImlhdCI6MTc4NjkzMTE3NywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.elZtcZAAMflh8Yh4x4knEd7HY1N-E1wPWE1j2TLcm-U', '::1', '2026-08-16 19:46:17', NULL, 1, '2026-08-16 19:46:17');
INSERT INTO `sesiones_usuarios` VALUES (55, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkODUwMmNjMS1lMzkwLTQxODUtOWY4NS00OTc3NDdiNDZmN2MiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzEyNDAsImV4cCI6MTc4Njk2MDA0MCwiaWF0IjoxNzg2OTMxMjQwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.CKHuWdRhQEXDn5DkTjZE5YAl1YXL48JyUVUHJb2Ex5E', '::1', '2026-08-16 19:47:20', NULL, 1, '2026-08-16 19:47:20');
INSERT INTO `sesiones_usuarios` VALUES (56, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMTUyN2FiZC00ZDExLTQ3MmUtYjhhZS03YjExYzJjY2E2ZDEiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTMxMjc0LCJleHAiOjE3ODY5NjAwNzQsImlhdCI6MTc4NjkzMTI3NCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.NRKYMjqIlkrfFUw-P0PJa9YynH2H5ha8sN3P2UeAtWk', '::1', '2026-08-16 19:47:55', NULL, 1, '2026-08-16 19:47:55');
INSERT INTO `sesiones_usuarios` VALUES (57, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YTkxNjNhMi0yZGFkLTQwMGMtOGUzMi03NDU4ZWYyZjFjODAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzEzNDgsImV4cCI6MTc4Njk2MDE0OCwiaWF0IjoxNzg2OTMxMzQ4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.TK2PSgpAjFquJBYOnhP6Ucftfk2zyX6U3zS1S0hr6eQ', '::1', '2026-08-16 19:49:08', NULL, 1, '2026-08-16 19:49:08');
INSERT INTO `sesiones_usuarios` VALUES (58, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZDBjOTRkZC0yNGQ5LTRmN2UtODhlYi1jZGI0MWZlODVmZDMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzE0NTAsImV4cCI6MTc4Njk2MDI1MCwiaWF0IjoxNzg2OTMxNDUwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.Onktcv-mAl3ClEOxKKn2-sh6L0Ys4xa6nAUQqZE6xYo', '::1', '2026-08-16 19:50:51', NULL, 1, '2026-08-16 19:50:51');
INSERT INTO `sesiones_usuarios` VALUES (59, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZTg4NzU0YS1jMzIzLTQwYzItYjI3ZC1mZmE5OTgyMzM0ZGMiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTMxNzczLCJleHAiOjE3ODY5NjA1NzMsImlhdCI6MTc4NjkzMTc3MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.zZ-GmE_kQP5NdltYPfMfRSbQOqJz0gmHBl-kwiA2744', '::1', '2026-08-16 19:56:14', NULL, 1, '2026-08-16 19:56:14');
INSERT INTO `sesiones_usuarios` VALUES (60, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMWM4NGViNy1hZGE0LTRjYWEtOTQ2Ny0yY2Y1OTk2NjVmYjEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzE4MTIsImV4cCI6MTc4Njk2MDYxMiwiaWF0IjoxNzg2OTMxODEyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.qmPDHYvQdKRGP7t2sCUGVe-lUnNrcABfB9lbjAtWxmg', '::1', '2026-08-16 19:56:53', NULL, 1, '2026-08-16 19:56:53');
INSERT INTO `sesiones_usuarios` VALUES (61, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZmYxYjZkYy1hNDAxLTRhNTQtODFmNy01YzljNDMyZWE2MGIiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NjkzMTk3MywiZXhwIjoxNzg2OTYwNzczLCJpYXQiOjE3ODY5MzE5NzMsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.NmP7rv5ftvjMD_Xa4BAMtPVXbvLYkMaHTagr-WjBiLI', '::1', '2026-08-16 19:59:34', NULL, 1, '2026-08-16 19:59:34');
INSERT INTO `sesiones_usuarios` VALUES (62, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YjZmOTFhOC1hNTEyLTQ4M2UtOGNiZS02N2NkZGEzYTY0ZWQiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTMxOTc4LCJleHAiOjE3ODY5NjA3NzgsImlhdCI6MTc4NjkzMTk3OCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.RxaLdN5dlH7RpXrOCN--5V4PWe1XE2X5tt62dqdNkb0', '::1', '2026-08-16 19:59:39', NULL, 1, '2026-08-16 19:59:39');
INSERT INTO `sesiones_usuarios` VALUES (63, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4YjY5MmYxMC05MWNkLTQ5NjQtOTBhOC0zM2FiNDA0ZTlkNjkiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzE5ODksImV4cCI6MTc4Njk2MDc4OSwiaWF0IjoxNzg2OTMxOTg5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.fLo7N_eooIskJa6jLIgK7N4Vtu0eQw8NRFNWrSQAJyY', '::1', '2026-08-16 19:59:49', NULL, 1, '2026-08-16 19:59:49');
INSERT INTO `sesiones_usuarios` VALUES (64, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNjg3YzRhMC05ZjNjLTQwMzEtYmE3MC05Yjg4YjU0OTA0NWMiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2OTMyMDM4LCJleHAiOjE3ODY5NjA4MzgsImlhdCI6MTc4NjkzMjAzOCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Z9B7Rx0CQR4HD1rXpGAgUP-OYwgSLAN42uRayRSwoqo', '::1', '2026-08-16 20:00:39', NULL, 1, '2026-08-16 20:00:39');
INSERT INTO `sesiones_usuarios` VALUES (65, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNzljMWY3OS1lNjg1LTQ5MDEtYmMwNy05YzIyNzg1NmMwNzIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzIwODUsImV4cCI6MTc4Njk2MDg4NSwiaWF0IjoxNzg2OTMyMDg1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.W_ypRRxAkS_79-j0GZOVP3vAV82Uu6FXP7_wWaM40bo', '::1', '2026-08-16 20:01:26', NULL, 1, '2026-08-16 20:01:26');
INSERT INTO `sesiones_usuarios` VALUES (66, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYzFiZjkyOC03MjMyLTQwNjYtOTUyNi00ZDVlNTFhNDE0NzgiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTMyNDg1LCJleHAiOjE3ODY5NjEyODUsImlhdCI6MTc4NjkzMjQ4NSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.ref2XVPxsku0YLtYENrgMj9AEk2vN0VxRKv2cad-FOo', '::1', '2026-08-16 20:08:05', NULL, 1, '2026-08-16 20:08:05');
INSERT INTO `sesiones_usuarios` VALUES (67, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNjI4ZjAzMi02NzkwLTQwOGMtOWM3Zi1iNDQyZDM3ZWI1MmMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzI1NzAsImV4cCI6MTc4Njk2MTM3MCwiaWF0IjoxNzg2OTMyNTcwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.vGGpQUZ86cWuSE-67xNW4OnM02X0tLAdiydGqkNHaFA', '::1', '2026-08-16 20:09:30', NULL, 1, '2026-08-16 20:09:30');
INSERT INTO `sesiones_usuarios` VALUES (68, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OWVjMmIyMS0yZTc1LTQzNjItYmM4YS0yYzY0YjI3ZDIwZjUiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTMyNjE3LCJleHAiOjE3ODY5NjE0MTcsImlhdCI6MTc4NjkzMjYxNywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.bDDHh8LseseH_a_IWqpzCZGLWaYP8cTZtUXqn7g_QUw', '::1', '2026-08-16 20:10:18', NULL, 1, '2026-08-16 20:10:18');
INSERT INTO `sesiones_usuarios` VALUES (69, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMWE2NjY4Yy0zZWU2LTQ5N2MtOGIxYy00MDkyZGNkYWI0MGMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzI3MTcsImV4cCI6MTc4Njk2MTUxNywiaWF0IjoxNzg2OTMyNzE3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.51wn_2MTY-9xE6G6a1ruJE5RRGLh9x9nOoUh3DrXOso', '::1', '2026-08-16 20:11:58', NULL, 1, '2026-08-16 20:11:58');
INSERT INTO `sesiones_usuarios` VALUES (70, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlY2NlMjQ4MC1kMGFkLTQ2NTYtOWFlMy04NTY0ZDMxNDI0YjgiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTMyNzI0LCJleHAiOjE3ODY5NjE1MjQsImlhdCI6MTc4NjkzMjcyNCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.c-cpAdDCW4Kcs66PpoUZ2GDXYTUo-ucZChyw3CRDw5M', '::1', '2026-08-16 20:12:05', NULL, 1, '2026-08-16 20:12:05');
INSERT INTO `sesiones_usuarios` VALUES (71, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ODA2YTc3ZC1iYjNhLTQ4ZGQtYjc1MS1lZGY5MWNhMzdhZTMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzMyODAsImV4cCI6MTc4Njk2MjA4MCwiaWF0IjoxNzg2OTMzMjgwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.pKEpfhPMBBJum19R-TPnfOuUeJIWcW0h29fxr-BBmiM', '::1', '2026-08-16 20:21:20', NULL, 1, '2026-08-16 20:21:20');
INSERT INTO `sesiones_usuarios` VALUES (72, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNzkzM2QyYy0zNjRkLTQwOGEtODhkMS00ZWI3ZDJmMmYzZDgiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTMzMzI2LCJleHAiOjE3ODY5NjIxMjYsImlhdCI6MTc4NjkzMzMyNiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.fEe2J-mVTgw-AW8NPS1-gJr_8gX0Cb9aV66j6r2X2lc', '::1', '2026-08-16 20:22:06', NULL, 1, '2026-08-16 20:22:06');
INSERT INTO `sesiones_usuarios` VALUES (73, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZTZkYTA0NC01YjNlLTRlZmUtODNiNi0wMzZjZTQ3OTczYzgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzcwMzgsImV4cCI6MTc4Njk2NTgzOCwiaWF0IjoxNzg2OTM3MDM4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.4ydDAgIdQigsPC_ADUUnvpj6Tg-P09zIMuataTuwx5I', '::1', '2026-08-16 21:23:58', NULL, 1, '2026-08-16 21:23:58');
INSERT INTO `sesiones_usuarios` VALUES (74, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMTRiMmIxMC01MzY5LTRhMzItYWIzMi0xMGNmNDZiMjVhMDEiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTM3MDY0LCJleHAiOjE3ODY5NjU4NjQsImlhdCI6MTc4NjkzNzA2NCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.8K-LBlFDbv9XXJqInAenV0NKSsBjKMUVzIWCnXjwdBA', '::1', '2026-08-16 21:24:24', NULL, 1, '2026-08-16 21:24:24');
INSERT INTO `sesiones_usuarios` VALUES (75, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZThkMTVhMy0wNjhkLTRmNDAtYTBkMi00MDQ4MTExNWRlOTIiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2OTM3MTQ3LCJleHAiOjE3ODY5NjU5NDcsImlhdCI6MTc4NjkzNzE0NywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.8v2T6jYVMdXIlvuMVWe2mNAtvKbwJQdSQ9hp0veLTFU', '::1', '2026-08-16 21:25:48', NULL, 1, '2026-08-16 21:25:48');
INSERT INTO `sesiones_usuarios` VALUES (76, 25, '2026-00035-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjOTFhMzQ4Yy03ZjdjLTQzYWEtYTc5Ni0wN2JmZDkxZGU0ZTUiLCJuYW1laWQiOiIyNSIsInVuaXF1ZV9uYW1lIjoiMjAyNi0wMDAzNS1JTkEiLCJyb2xlIjoiRXN0dWRpYW50ZSIsIm5iZiI6MTc4NjkzNzE5MSwiZXhwIjoxNzg2OTY1OTkxLCJpYXQiOjE3ODY5MzcxOTEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.i7w-U3x9bpd3IHuenXL2eIYqYv6MICjGelnzNgRHd3Q', '::1', '2026-08-16 21:26:31', NULL, 1, '2026-08-16 21:26:31');
INSERT INTO `sesiones_usuarios` VALUES (77, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMjhhNTJlYi1lYjQ3LTQwYjMtODhhZC04YTU1ZDg5ZThiMDIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzcyMDEsImV4cCI6MTc4Njk2NjAwMSwiaWF0IjoxNzg2OTM3MjAxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.EB1KioRPZRerpgo6gTrwLJWtOLe40E0krYEyMRhB0XE', '::1', '2026-08-16 21:26:42', NULL, 1, '2026-08-16 21:26:42');
INSERT INTO `sesiones_usuarios` VALUES (78, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYzQwM2YwZi1jOWMxLTRkY2UtYTBmOS0xNDMwMmFkNzYxYzYiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTM3MjA2LCJleHAiOjE3ODY5NjYwMDYsImlhdCI6MTc4NjkzNzIwNiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.ePY_0dMFb3PVN1Scy8BvyUNJDWiyWz7M9Hjd6iH44K4', '::1', '2026-08-16 21:26:47', NULL, 1, '2026-08-16 21:26:47');
INSERT INTO `sesiones_usuarios` VALUES (79, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NDYxZWM2OS1lODYxLTQ5MmUtYjgwYy1hNjEyMTQ0MmJmN2YiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzgyMzksImV4cCI6MTc4Njk2NzAzOSwiaWF0IjoxNzg2OTM4MjM5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.3rn_IHlLuKCU-Ur-kY-xa5b6HYAw460Mb-h2_bLel4E', '::1', '2026-08-16 21:44:00', NULL, 1, '2026-08-16 21:44:00');
INSERT INTO `sesiones_usuarios` VALUES (80, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3N2QwMDc3My0yNDg0LTRjYTYtYjc1My1kMmIwZjhjMzA0NWQiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NjkzODI4MywiZXhwIjoxNzg2OTY3MDgzLCJpYXQiOjE3ODY5MzgyODMsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.vk0mWFScnvE0jQ8AxMf75GxrO9i9_d_w2hEp01uLYxs', '::1', '2026-08-16 21:44:43', NULL, 1, '2026-08-16 21:44:43');
INSERT INTO `sesiones_usuarios` VALUES (81, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMjgzMzZlOS03Y2M5LTQzMWEtOGE1Yy1iODlmYzdkMmJhMmYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzgzMTcsImV4cCI6MTc4Njk2NzExNywiaWF0IjoxNzg2OTM4MzE3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.m4ND2s97skEnxkgrr3t_wtjMmcUgxXZ62VU2nYHWCOM', '::1', '2026-08-16 21:45:18', NULL, 1, '2026-08-16 21:45:18');
INSERT INTO `sesiones_usuarios` VALUES (82, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiZjVmYTJiYi1lZjVhLTQ1NjMtYjMzOC0xZDUwMjUxYzJkNTkiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTM4MzMxLCJleHAiOjE3ODY5NjcxMzEsImlhdCI6MTc4NjkzODMzMSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.LscVYMV530mI7ojfK8XYtTkvwqwD2UA9X1HAMHxQyJA', '::1', '2026-08-16 21:45:31', NULL, 1, '2026-08-16 21:45:31');
INSERT INTO `sesiones_usuarios` VALUES (83, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MmQxNjY0OC00ZTBhLTQ4MTQtODIyNy01NzY1MmU4ODM4Y2EiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NjkzODMzOCwiZXhwIjoxNzg2OTY3MTM4LCJpYXQiOjE3ODY5MzgzMzgsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.rBrL2V5MGasTuXrEnz7cERbznwoOeqgmo4uk-I3qDcY', '::1', '2026-08-16 21:45:39', NULL, 1, '2026-08-16 21:45:39');
INSERT INTO `sesiones_usuarios` VALUES (84, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNTIyM2MwMi1hMTM2LTQ2NjktYTgxOS1iNDM5YTM3YmQ1YTgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzgzNzYsImV4cCI6MTc4Njk2NzE3NiwiaWF0IjoxNzg2OTM4Mzc2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.96z_KAvgSD6UIO2eOOx3GwXPe9mJhm2k3vd6NEZnhpY', '::1', '2026-08-16 21:46:16', NULL, 1, '2026-08-16 21:46:16');
INSERT INTO `sesiones_usuarios` VALUES (85, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNTYxMzU0YS0yYWI3LTQ5MTAtOGM0MS1mYjYzNWQzNTQyZTIiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTM4NDEzLCJleHAiOjE3ODY5NjcyMTMsImlhdCI6MTc4NjkzODQxMywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.g8qAejuOCcMjsEYeDnusVp_uB28lUUJDEZq7iGTtqb0', '::1', '2026-08-16 21:46:53', NULL, 1, '2026-08-16 21:46:53');
INSERT INTO `sesiones_usuarios` VALUES (86, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhYWJiMWZhYy1mMWFlLTQ3YjgtODkxYy0yMDEyMzc0MmViNDciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5MzkyNDAsImV4cCI6MTc4Njk2ODA0MCwiaWF0IjoxNzg2OTM5MjQwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.jkZYO8wFo8XyBC1x5VqgXxGnmXsrk-QvUhPVKxn-ETU', '::1', '2026-08-16 22:00:40', NULL, 1, '2026-08-16 22:00:40');
INSERT INTO `sesiones_usuarios` VALUES (87, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YjA1MDZjOC0wNjc1LTQ1NTYtYTUyMC0zNjU0ZTQ4MmZmOGUiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTM5MjgyLCJleHAiOjE3ODY5NjgwODIsImlhdCI6MTc4NjkzOTI4MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.LlOgN4HQYwRxhzzIiqPkoCz8a99IEUAheC294yUaNL0', '::1', '2026-08-16 22:01:22', NULL, 1, '2026-08-16 22:01:22');
INSERT INTO `sesiones_usuarios` VALUES (88, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYWFjMDgzNy04ZDJiLTQ0OTQtYTY4Yy05OWU4MjNjOWEzMGEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NDA1MzYsImV4cCI6MTc4Njk2OTMzNiwiaWF0IjoxNzg2OTQwNTM2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.61wTStLaVrB4u4ZW0fb43KozK1xFUfNRDIQfGon0thM', '::1', '2026-08-16 22:22:16', NULL, 1, '2026-08-16 22:22:16');
INSERT INTO `sesiones_usuarios` VALUES (89, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYzljNTZlNC1iMzczLTQ0ZjYtOTUyNy1lNzlhYjNiNzY1MWQiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4Njk0MDU2NSwiZXhwIjoxNzg2OTY5MzY1LCJpYXQiOjE3ODY5NDA1NjUsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.evvw9OB4cmRzRrg0ol66-ABY_0MLvW60TF23ivyt4c8', '::1', '2026-08-16 22:22:45', NULL, 1, '2026-08-16 22:22:45');
INSERT INTO `sesiones_usuarios` VALUES (90, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MThkNjhjNS01MDI1LTRmM2UtOGMxYS0yY2JlYzZkYzZlMTUiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTQwNTg4LCJleHAiOjE3ODY5NjkzODgsImlhdCI6MTc4Njk0MDU4OCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.V8AV75EzrkZKK3iNNJ-yrm-Oqb2pNCKHiHi8GYS5UKs', '::1', '2026-08-16 22:23:09', NULL, 1, '2026-08-16 22:23:09');
INSERT INTO `sesiones_usuarios` VALUES (91, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNDg3OWU3ZS1jYWM2LTQ2MTEtYWNhYi1hYmZlZGI1NjJmYTEiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2OTQwNjA0LCJleHAiOjE3ODY5Njk0MDQsImlhdCI6MTc4Njk0MDYwNCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.wr7X0v_nkjKLbtZeO7pde9JMa9hEjwz0aGRn_3Jm2qk', '::1', '2026-08-16 22:23:25', NULL, 1, '2026-08-16 22:23:25');
INSERT INTO `sesiones_usuarios` VALUES (92, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZDgzNWQyNS04MDUxLTQwNGEtYWFhZC04ZWMwYjBiZWM4N2UiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NDA2MTcsImV4cCI6MTc4Njk2OTQxNywiaWF0IjoxNzg2OTQwNjE3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.ePInASykPIHwvwPp0BiQ3n7TlY3eZ9CD-ZP0JZ-Hpx4', '::1', '2026-08-16 22:23:38', NULL, 1, '2026-08-16 22:23:38');
INSERT INTO `sesiones_usuarios` VALUES (93, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1YWUyNzk3Zi1jNjFmLTRiZDQtOWJjMy03Yzc5ZTJjNThjNjAiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTQwNzQ3LCJleHAiOjE3ODY5Njk1NDcsImlhdCI6MTc4Njk0MDc0NywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Ea4uF-yIzCCIAAqme2HekU014_QwgvvkCAaXCBlpV7s', '::1', '2026-08-16 22:25:48', NULL, 1, '2026-08-16 22:25:48');
INSERT INTO `sesiones_usuarios` VALUES (94, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MDI1MDQzZi0yODk1LTQ0OWMtYTBjMi02NDRhYzE3YjZlYzYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NDE1MDcsImV4cCI6MTc4Njk3MDMwNywiaWF0IjoxNzg2OTQxNTA3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.wYU986-2iNS8fbiQjGKdBdWU9xASKkaybCF6lNTQZ_0', '::1', '2026-08-16 22:38:27', NULL, 1, '2026-08-16 22:38:27');
INSERT INTO `sesiones_usuarios` VALUES (95, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGQzNjgyOS1iNDhmLTQxMzctOTQzMS0yMGVjNTA2YmEzODEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4Njk0MTUyOCwiZXhwIjoxNzg2OTcwMzI4LCJpYXQiOjE3ODY5NDE1MjgsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.CHmDF744aGVkWvPGw9OY_kPatplHn6nOHSjwN_XE5lE', '::1', '2026-08-16 22:38:48', NULL, 1, '2026-08-16 22:38:48');
INSERT INTO `sesiones_usuarios` VALUES (96, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiZmVmMTFjYi01YTVkLTRjN2ItOTc0NC0yODEzMjgwM2Q1MDQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NDE1NTUsImV4cCI6MTc4Njk3MDM1NSwiaWF0IjoxNzg2OTQxNTU1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.S7Mo1ciofVtEJXqL-XhDhXBjSQ55u0UuV9GVSA-SsoE', '::1', '2026-08-16 22:39:15', NULL, 1, '2026-08-16 22:39:15');
INSERT INTO `sesiones_usuarios` VALUES (97, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1Y2M4NTBlMy1jMDZlLTQzY2EtYjY2Zi01M2I0ZWZhMzQ0NTAiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTQyNDUzLCJleHAiOjE3ODY5NzEyNTMsImlhdCI6MTc4Njk0MjQ1MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.afLunUzWEpEIyOLMzTJSnd0uWWBoNH6Ha9wZBvwWCG8', '::1', '2026-08-16 22:54:14', NULL, 1, '2026-08-16 22:54:14');
INSERT INTO `sesiones_usuarios` VALUES (98, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNzhjMjJkZC0yNjFkLTRmNGQtYjJiOS02ZDQ3ZTAzZTdjMjEiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg2OTQzNjI4LCJleHAiOjE3ODY5NzI0MjgsImlhdCI6MTc4Njk0MzYyOCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.4Z7UoFGjL6WCVRcyf4V1wPuhL_JAHSGNpuf-vworuNU', '::1', '2026-08-16 23:13:49', NULL, 1, '2026-08-16 23:13:49');
INSERT INTO `sesiones_usuarios` VALUES (99, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MWE2MzAzMC0wNjNmLTQwNmItOGUxNS02Y2ZmMDg3NTA1ZDAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NDM2NDgsImV4cCI6MTc4Njk3MjQ0OCwiaWF0IjoxNzg2OTQzNjQ4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.P6TgJ5zqqcazW6JaHnH7FJwjkrkU-r2pWkxQo8bRkIg', '::1', '2026-08-16 23:14:08', NULL, 1, '2026-08-16 23:14:08');
INSERT INTO `sesiones_usuarios` VALUES (100, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OThmZGE1ZS0yYjg3LTQzN2EtYjE3MS0wYmFkYzIzODFmYjQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NDM5OTEsImV4cCI6MTc4Njk3Mjc5MSwiaWF0IjoxNzg2OTQzOTkxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.kVypMEQW95dXvrE1mD-3zUzssSrgj9OYovco6TqvVm0', '::1', '2026-08-16 23:19:52', NULL, 1, '2026-08-16 23:19:52');
INSERT INTO `sesiones_usuarios` VALUES (101, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYTVmYTE3MS1jZGFiLTRlMGEtYWRiMC0yODEyZWM0ZDRjNmIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzIzNzEsImV4cCI6MTc4NzAwMTE3MSwiaWF0IjoxNzg2OTcyMzcxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.p_gq69Fh-0CfXQwi_pHJEgozxEUiY4VVmVNtb-FCQkg', '::1', '2026-08-17 07:12:51', NULL, 1, '2026-08-17 07:12:51');
INSERT INTO `sesiones_usuarios` VALUES (102, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0Y2FkMGExMy0yY2YxLTQ4MGQtYjU0OC0yNGY4MmZlOGI4OGIiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4Njk3MjU4NywiZXhwIjoxNzg3MDAxMzg3LCJpYXQiOjE3ODY5NzI1ODcsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.oPHJy9GiaSQ0RRuGvSBsY72SzYCUqdAeBupqkzseLkI', '::1', '2026-08-17 07:16:28', NULL, 1, '2026-08-17 07:16:28');
INSERT INTO `sesiones_usuarios` VALUES (103, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYzRlNGE4NS01MGZkLTQ5NmUtOTFhMC04YzVjMWEyNGQzZGEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4Njk3MzA4MSwiZXhwIjoxNzg3MDAxODgxLCJpYXQiOjE3ODY5NzMwODEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.lTMJ4MIbBrbP8prWkr3TkDV8wy83_SfjnJBXqxbrC24', '::1', '2026-08-17 07:24:42', NULL, 1, '2026-08-17 07:24:42');
INSERT INTO `sesiones_usuarios` VALUES (104, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMTYzYjhiMi0wNmRjLTQ5YzgtYWM1My0zZmViODJlNTY4MTgiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4Njk3MzA5NywiZXhwIjoxNzg3MDAxODk3LCJpYXQiOjE3ODY5NzMwOTcsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.4CejGgVaU5jSvi7p5Y9t4vGvGI5srB1dWWQ-CLpyL4Q', '::1', '2026-08-17 07:24:57', NULL, 1, '2026-08-17 07:24:57');
INSERT INTO `sesiones_usuarios` VALUES (105, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZWZkZGVmNy02OGUxLTQxZWMtOGE1OC1iY2FjMDY4NWRhZDgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzMxMDEsImV4cCI6MTc4NzAwMTkwMSwiaWF0IjoxNzg2OTczMTAxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.wuCxC_ASiSDN6jl2CZTrRS1yg_loU_oeVrK09sVl3Us', '::1', '2026-08-17 07:25:02', NULL, 1, '2026-08-17 07:25:02');
INSERT INTO `sesiones_usuarios` VALUES (106, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMTYxYjEwNC1kODA4LTRiNmItODVkMC0wNzYzZDdkZjk1NWMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzMyNDgsImV4cCI6MTc4NzAwMjA0OCwiaWF0IjoxNzg2OTczMjQ4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.iRqIXzWpNVuGvWSnkJ_B2cgK1OS_zaPa6nEO1Ufszds', '::1', '2026-08-17 07:27:28', NULL, 1, '2026-08-17 07:27:28');
INSERT INTO `sesiones_usuarios` VALUES (107, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NjczODJmMi00ZjExLTRmMDEtYTM4Mi04MzZjN2EyNDVjYWEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzMzMTYsImV4cCI6MTc4NzAwMjExNiwiaWF0IjoxNzg2OTczMzE2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.u-vQGfPcNNox3pojRzBUZz7N2uhsPrcG6K_Cp4ca-JI', '::1', '2026-08-17 07:28:36', NULL, 1, '2026-08-17 07:28:36');
INSERT INTO `sesiones_usuarios` VALUES (108, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMDhmMzk4My0xZDQ2LTRmNGYtYjg1Ny01YmVkNDhmZjZiMGMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzM5OTIsImV4cCI6MTc4NzAwMjc5MiwiaWF0IjoxNzg2OTczOTkyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.ASI_Occ8e-JGI-HF_WRiVILsPKvTSULZU5fGyUwBnLQ', '::1', '2026-08-17 07:39:53', NULL, 1, '2026-08-17 07:39:53');
INSERT INTO `sesiones_usuarios` VALUES (109, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZWRiZmU1Mi01MDk3LTQ5NmMtOWMzNC04YzE0NDc4NmFmMDIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzQxODcsImV4cCI6MTc4NzAwMjk4NywiaWF0IjoxNzg2OTc0MTg3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.upbLB2655crW4vFz-Z_ndwXwKakN8EWMYPieeO1-0J8', '::1', '2026-08-17 07:43:08', NULL, 1, '2026-08-17 07:43:08');
INSERT INTO `sesiones_usuarios` VALUES (110, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZjY3MjIyMy05ZTExLTRiNmQtOTEyOC1hNmU2YzhlNWU4MjUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzQzNjksImV4cCI6MTc4NzAwMzE2OSwiaWF0IjoxNzg2OTc0MzY5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.9zVBgRjbTFgZkpFh-imqG0NU5v8jjNiGLZovzXUfx7A', '::1', '2026-08-17 07:46:10', NULL, 1, '2026-08-17 07:46:10');
INSERT INTO `sesiones_usuarios` VALUES (111, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYzFhYThiMC1mMTk3LTRlMmQtODJiYy0xMzFlMjg0NzFhYmYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzQ0MDYsImV4cCI6MTc4NzAwMzIwNiwiaWF0IjoxNzg2OTc0NDA2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.XDM_uS8AjbnOD19audPFk9EeY_0GfaalCrD4lJj_MKc', '::1', '2026-08-17 07:46:47', NULL, 1, '2026-08-17 07:46:47');
INSERT INTO `sesiones_usuarios` VALUES (112, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NjZmMTJiMC1iZTY0LTRlZjEtODlkOC1iMzVkNDc3ZjIxZTkiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzQ0ODYsImV4cCI6MTc4NzAwMzI4NiwiaWF0IjoxNzg2OTc0NDg2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.0q8GK5FfLO0-DJj0Vo6UznD_1-Cw3qV6ESQ1RKKd_ec', '::1', '2026-08-17 07:48:07', NULL, 1, '2026-08-17 07:48:07');
INSERT INTO `sesiones_usuarios` VALUES (113, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZDQ0NWRkNy05ZWU2LTQ1MjEtYWUwMC04ODk3ZTBlMzY3MWQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzQ5NTUsImV4cCI6MTc4NzAwMzc1NSwiaWF0IjoxNzg2OTc0OTU1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.DfS6ONwS6BQ_PZqe4kh15GrL_67IHQ3VpF_wcSmZdEk', '::1', '2026-08-17 07:55:56', NULL, 1, '2026-08-17 07:55:56');
INSERT INTO `sesiones_usuarios` VALUES (114, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5OGZmNjkwZi0wZGIwLTQ5ZjYtOGI4Yy1jZjg0MjIwMTg0NmUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzkxODUsImV4cCI6MTc4NzAwNzk4NSwiaWF0IjoxNzg2OTc5MTg1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.Fmz5fOjJ4HBgD1CIX6sc2yFsJS-ERS-pcws_HwDdrZc', '::1', '2026-08-17 09:06:26', NULL, 1, '2026-08-17 09:06:26');
INSERT INTO `sesiones_usuarios` VALUES (115, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMzMyYmI5MC1iMzk1LTRlZDAtYjI4Ni1lZDQ1ZjEwNDVhZmYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5NzkzMDEsImV4cCI6MTc4NzAwODEwMSwiaWF0IjoxNzg2OTc5MzAxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.clzPO3MRHvdEG1Q75egK4aSWEiz8YARSjnjdXEVuNhs', '::1', '2026-08-17 09:08:21', NULL, 1, '2026-08-17 09:08:21');
INSERT INTO `sesiones_usuarios` VALUES (116, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNWQzYzJhYS1jNTQyLTQ5N2YtOWEyZi00NDhlYzI5NTVhZDEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4Njk3OTQyOSwiZXhwIjoxNzg3MDA4MjI5LCJpYXQiOjE3ODY5Nzk0MjksImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.SVgO9DhuSFf16fyo-ZmhzPTBUqciwInNsYSwmLxMJ1g', '::1', '2026-08-17 09:10:30', NULL, 1, '2026-08-17 09:10:30');
INSERT INTO `sesiones_usuarios` VALUES (117, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxY2Q3MGUzMC01MWQ1LTQzOTItOGZhMi0zOGQzZjQ3MjUxNzQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5Nzk5NjcsImV4cCI6MTc4NzAwODc2NywiaWF0IjoxNzg2OTc5OTY3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.dcwCACYSB5K7PAzouUiuETeIZBntRJw7dEh6XCaVScU', '::1', '2026-08-17 09:19:27', NULL, 1, '2026-08-17 09:19:27');
INSERT INTO `sesiones_usuarios` VALUES (118, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMjVjMTM5NS1hZDk4LTQyZjQtYWJkYS1iMmQ2OTQ2NGQ0ZWIiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4Njk4MDAwMiwiZXhwIjoxNzg3MDA4ODAyLCJpYXQiOjE3ODY5ODAwMDIsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.xcj-azm3H2n4DVXxWIfmEVTFoJu1JyzUYC7aIk0H7kE', '::1', '2026-08-17 09:20:03', NULL, 1, '2026-08-17 09:20:03');
INSERT INTO `sesiones_usuarios` VALUES (119, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYjAzNTA0Ny0yNmM0LTQxY2EtOGUwNi1mNGIzNGYyYTYwMzQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODY5ODAzMDQsImV4cCI6MTc4NzAwOTEwNCwiaWF0IjoxNzg2OTgwMzA0LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.E5KWJBLIGORRiC_tfQ6_teh-WAr-DmSAaSNLGz_4YnY', '::1', '2026-08-17 09:25:04', NULL, 1, '2026-08-17 09:25:04');
INSERT INTO `sesiones_usuarios` VALUES (120, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMDM5ZGFiMC0wMGM3LTRjOTUtYTRjOS1hMzZmMzBjZDg0Y2IiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg2OTgwMzU5LCJleHAiOjE3ODcwMDkxNTksImlhdCI6MTc4Njk4MDM1OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.uWNVBUlSME4NT1cpmASBivbvetdWYbr9a_7qB_t8Jj0', '::1', '2026-08-17 09:25:59', NULL, 1, '2026-08-17 09:25:59');
INSERT INTO `sesiones_usuarios` VALUES (121, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNThhMjE5ZS02MmQwLTQ2ZmEtOTdmMC02MzU0MmFmYjNjNDEiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg2OTgwNDg2LCJleHAiOjE3ODcwMDkyODYsImlhdCI6MTc4Njk4MDQ4NiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.8BvVVmlrM8oTUcddW5JzPh9bl7TC0aiXtfhVB0bICVo', '::1', '2026-08-17 09:28:07', NULL, 1, '2026-08-17 09:28:07');
INSERT INTO `sesiones_usuarios` VALUES (122, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlOGM0OTNiZi1mY2M3LTRjNTItODliMy01ZGI2MmNjNmM4MGMiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MDYxMzk1LCJleHAiOjE3ODcwOTAxOTUsImlhdCI6MTc4NzA2MTM5NSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.iNQbdyRjjfT8IX-YNJsD2RA_2Zn5UivomNqiXaAslBY', '::1', '2026-08-18 07:56:36', NULL, 1, '2026-08-18 07:56:36');
INSERT INTO `sesiones_usuarios` VALUES (123, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiZmI3ODk1Ny1iNzVhLTQ3ZjItOThlNy1iOTdjYjBiMDAyOTEiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MDYyNzc0LCJleHAiOjE3ODcwOTE1NzQsImlhdCI6MTc4NzA2Mjc3NCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.MxpUBl0G4tsOYrUP0wD5OIMuqi_dbmFNlRCIFI59TSQ', '::1', '2026-08-18 08:19:35', NULL, 1, '2026-08-18 08:19:35');
INSERT INTO `sesiones_usuarios` VALUES (124, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDA3ODUyMy1kMDM1LTRiZTYtODA2OS1jMWNiNmUwNjZlZGYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODcwNjMwMDYsImV4cCI6MTc4NzA5MTgwNiwiaWF0IjoxNzg3MDYzMDA2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.rJqtAbYBZoDtkyEYUuMjV359LKszJ7P1Hlh63wjwNH4', '::1', '2026-08-18 08:23:27', NULL, 1, '2026-08-18 08:23:27');
INSERT INTO `sesiones_usuarios` VALUES (125, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYTc5ZTA1Ny0xY2RhLTQ1NDEtYWYzOS1jNTc1NjcxZGZjZjciLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NzA2MzIyMywiZXhwIjoxNzg3MDkyMDIzLCJpYXQiOjE3ODcwNjMyMjMsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.U5k5d_eh_eHasLFf-Y-uu9t8fb1a3E_2M6gfZ3oFocM', '::1', '2026-08-18 08:27:04', NULL, 1, '2026-08-18 08:27:04');
INSERT INTO `sesiones_usuarios` VALUES (126, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ODFjZDM2NC03NTRmLTQ1ZDItYmNmNS05MWM3ODZkYTZhYmMiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MTAxNDY3LCJleHAiOjE3ODcxMzAyNjcsImlhdCI6MTc4NzEwMTQ2NywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.h-4XZ13kOT3kY6heL5UuCVvx0utW2zku5hmuDjW4NuU', '::1', '2026-08-18 19:04:27', NULL, 1, '2026-08-18 19:04:27');
INSERT INTO `sesiones_usuarios` VALUES (127, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZWJiMWJkOC0xOGE4LTQzZWEtOTc3MS0xZDlmNzhhNmRiOWQiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NzEwMzE1MiwiZXhwIjoxNzg3MTMxOTUyLCJpYXQiOjE3ODcxMDMxNTIsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.Khb_oOk2anNe4kMLuErt3AHL5kgVLFSWdRh5DFR9MEQ', '::1', '2026-08-18 19:32:32', NULL, 1, '2026-08-18 19:32:32');
INSERT INTO `sesiones_usuarios` VALUES (128, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiODE0ZWE0MC05ZGQxLTQ4MTEtYjJiMC0xYmM3ZjQ3OGM5NDEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODcxMDMzNzIsImV4cCI6MTc4NzEzMjE3MiwiaWF0IjoxNzg3MTAzMzcyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.Q_fcrne4Pagvjh7GlwUDRWsLduhF9ALu2OC8X0eNqk0', '::1', '2026-08-18 19:36:13', NULL, 1, '2026-08-18 19:36:13');
INSERT INTO `sesiones_usuarios` VALUES (129, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNWZjMzg0ZS02YjdlLTQwZDItYWViOS05ODU0NTI4MWRmOTMiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MTAzMzgxLCJleHAiOjE3ODcxMzIxODEsImlhdCI6MTc4NzEwMzM4MSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.7JmGIlP2tPLYyNOp21eYoyQBTwTxY3IOjSPiODAQYCM', '::1', '2026-08-18 19:36:21', NULL, 1, '2026-08-18 19:36:21');
INSERT INTO `sesiones_usuarios` VALUES (130, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNTcyMDhiNS0yNDkyLTQxNzktYjU4MC02ZDcyZTA2MWJmMTIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODcxMDM2NjYsImV4cCI6MTc4NzEzMjQ2NiwiaWF0IjoxNzg3MTAzNjY2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.0E7H7ZIXv5i-pcSRQ0gqQ3AyDlnW4ovPagZMBJMGwHA', '::1', '2026-08-18 19:41:06', NULL, 1, '2026-08-18 19:41:06');
INSERT INTO `sesiones_usuarios` VALUES (131, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYjkyNzhjZi1lODExLTQzMjYtYmUzNS05MmJjYTBhMDZiNjQiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MTAzOTUyLCJleHAiOjE3ODcxMzI3NTIsImlhdCI6MTc4NzEwMzk1MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.zWNsXuQ7D1Cd7lHy-lYnhzbgOvZV5JkwsmxihTjHdlE', '::1', '2026-08-18 19:45:53', NULL, 1, '2026-08-18 19:45:53');
INSERT INTO `sesiones_usuarios` VALUES (132, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYzBhZDJlMC00MDdkLTQ0N2QtYWQxMC0xMzUwZGU4Yjg0ODUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODczMzgxNjQsImV4cCI6MTc4NzM2Njk2NCwiaWF0IjoxNzg3MzM4MTY0LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.yvKcgG5NRxLxzAg6_YDiDU-NU7-8l7_LtmjbzyOR2qU', '::1', '2026-08-21 12:49:24', NULL, 1, '2026-08-21 12:49:24');
INSERT INTO `sesiones_usuarios` VALUES (133, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlZjQ2M2VlZC1kNWVmLTRjYjMtYTg4MS1hMTEwNzFkOGQzZjIiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MzM4MTczLCJleHAiOjE3ODczNjY5NzMsImlhdCI6MTc4NzMzODE3MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.rmHw-HUanSXRm5Z9dHhZvRTHg7foC01eADnx4E_9JpA', '::1', '2026-08-21 12:49:33', NULL, 1, '2026-08-21 12:49:33');
INSERT INTO `sesiones_usuarios` VALUES (134, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiN2NhMGZmNS0yNDVjLTRiM2QtYjJkNi03ODE1MjRjZjY2M2EiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MzQwODYyLCJleHAiOjE3ODczNjk2NjIsImlhdCI6MTc4NzM0MDg2MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.dX_sxhGGx7UMIkwkBOIUiDnFzZ6x1gU1yTEO24H0G2s', '::1', '2026-08-21 13:34:23', NULL, 1, '2026-08-21 13:34:23');
INSERT INTO `sesiones_usuarios` VALUES (135, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhN2I1MTA5NS05Y2Q0LTRjYzAtYmEyYS1iNTRjZjZjZDYwZDYiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MzQ4MTc0LCJleHAiOjE3ODczNzY5NzQsImlhdCI6MTc4NzM0ODE3NCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.NzlxZRClBcv7VGWaOvOZbKMGgBUQnzYcg1-JELX4qBg', '::1', '2026-08-21 15:36:14', NULL, 1, '2026-08-21 15:36:14');
INSERT INTO `sesiones_usuarios` VALUES (136, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MTFmM2Y5NS05ZDY0LTQ0NmUtYjE4Ny04NTRmMDg1MmUyNWUiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg3MzQ4NDE3LCJleHAiOjE3ODczNzcyMTcsImlhdCI6MTc4NzM0ODQxNywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.cmgo7sYw570p2pz8or4qyO4x_GsgEPWIrIYj5X8p_6g', '::1', '2026-08-21 15:40:17', NULL, 1, '2026-08-21 15:40:17');
INSERT INTO `sesiones_usuarios` VALUES (137, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYzg1ZjUwZi0zM2RlLTQ3MjMtODFhYy1kMjM4OGU5OTU4ZmUiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MzQ4NDM0LCJleHAiOjE3ODczNzcyMzQsImlhdCI6MTc4NzM0ODQzNCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.a4amPMQoU4aeoXsep5ZlNiuoOmQyfHMr5m6O8yrNORE', '::1', '2026-08-21 15:40:34', NULL, 1, '2026-08-21 15:40:34');
INSERT INTO `sesiones_usuarios` VALUES (138, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ODQ1ZTg1OS1lYzNmLTQ0ZjItOTcwNy0zYzFmOWQyMjNlMDciLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg3MzQ4NDU3LCJleHAiOjE3ODczNzcyNTcsImlhdCI6MTc4NzM0ODQ1NywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.NYQhWETLf-Tgs_mlNaZerwCnihrvktxrtnsY8GnXzOs', '::1', '2026-08-21 15:40:58', NULL, 1, '2026-08-21 15:40:58');
INSERT INTO `sesiones_usuarios` VALUES (139, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZjQ4YzIzMy1iN2E2LTQ3MWItOTA3MS1hMWI3NmRkMGQ5MzYiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MzQ4NTYxLCJleHAiOjE3ODczNzczNjEsImlhdCI6MTc4NzM0ODU2MSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.rJBqNjoqDfpvSc_XSeFDKp4C4cp8LC17wQPEZSyheb4', '::1', '2026-08-21 15:42:41', NULL, 1, '2026-08-21 15:42:41');
INSERT INTO `sesiones_usuarios` VALUES (140, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGE2NTZmOS0yMzdmLTRjZmMtYTdiZS00M2E1ZDQ3YjAzYzgiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MzY1OTM4LCJleHAiOjE3ODczOTQ3MzgsImlhdCI6MTc4NzM2NTkzOCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.oYzbEUpSy7zS2tVWoDghNAloh8BxtZ7mETIsiSbNkCE', '::1', '2026-08-21 20:32:19', NULL, 1, '2026-08-21 20:32:19');
INSERT INTO `sesiones_usuarios` VALUES (141, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiZjUxYmUxMi03MzE4LTQxMTYtYWM0OC0yMjZkNThiOTBkMTgiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3MzcwNDczLCJleHAiOjE3ODczOTkyNzMsImlhdCI6MTc4NzM3MDQ3MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.sOD0R80yjZ9PD_UAXQnBPX4Fo5Yg-AbOZkA4mfQ2g0Q', '::1', '2026-08-21 21:47:54', NULL, 1, '2026-08-21 21:47:54');
INSERT INTO `sesiones_usuarios` VALUES (142, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYzAxNjk1OC1lM2RlLTQ3NTItOTIyMi0xNzRiZThmMTFhODUiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg3MzcwODkwLCJleHAiOjE3ODczOTk2OTAsImlhdCI6MTc4NzM3MDg5MCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Cy4DH4k-gelNoviJ-7JmlOTbFQFRKWnnvylGsRtPYhg', '::1', '2026-08-21 21:54:51', NULL, 1, '2026-08-21 21:54:51');
INSERT INTO `sesiones_usuarios` VALUES (143, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YTc3YTc1OS0yOTE0LTQ3N2UtYmE2Ny04MWNmMmNkNjI1ZjYiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3Mzc4NzkyLCJleHAiOjE3ODc0MDc1OTIsImlhdCI6MTc4NzM3ODc5MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.U4Wz3dKFUhEs9I0RbrKui94SrSKn7zksI6oH6m0S4jk', '::1', '2026-08-22 00:06:33', NULL, 1, '2026-08-22 00:06:33');
INSERT INTO `sesiones_usuarios` VALUES (144, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5OWZiZTVkNi0yYWE5LTQxZTctYmFmYy01NmQxYWI3NWU1N2MiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3NDI4ODIwLCJleHAiOjE3ODc0NTc2MjAsImlhdCI6MTc4NzQyODgyMCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.KK_M0UdnzM5BVnFn9wkqc7a2VQYFLiemC76MZJcZ_B0', '::1', '2026-08-22 14:00:20', NULL, 1, '2026-08-22 14:00:20');
INSERT INTO `sesiones_usuarios` VALUES (145, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMGE2MmRmNS02NmUwLTQ5ZDItYjc4Mi0yMzk0NThlNzJmYjgiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3NTA5MzQyLCJleHAiOjE3ODc1MzgxNDIsImlhdCI6MTc4NzUwOTM0MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.vxKcaB_0rZ1HlGgzx2JDPE9UQhY_OGAt0Liiyp-t9o4', '::1', '2026-08-23 12:22:23', NULL, 1, '2026-08-23 12:22:23');
INSERT INTO `sesiones_usuarios` VALUES (146, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNTkxNjNkNy00YTBmLTRmOTgtOTlhZS1hNTZlMzk2MDM5NTciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODc1MjM0NzQsImV4cCI6MTc4NzU1MjI3NCwiaWF0IjoxNzg3NTIzNDc0LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.VB4Ihqlq5dT7iwARZ38lzYO4Z2u_LNyt1IH89_31UGA', '::1', '2026-08-23 16:17:54', NULL, 1, '2026-08-23 16:17:54');
INSERT INTO `sesiones_usuarios` VALUES (147, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNDI0ZDJhZC05ZGM4LTQzZTItYmUwNC00YzhmMjIwNjVhZGYiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg3NTIzNzkwLCJleHAiOjE3ODc1NTI1OTAsImlhdCI6MTc4NzUyMzc5MCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.4NsjImRtX74G62Sv0XMj3zNq7LsORMgQ09Omy-gbHXY', '::1', '2026-08-23 16:23:10', NULL, 1, '2026-08-23 16:23:10');
INSERT INTO `sesiones_usuarios` VALUES (148, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NDBjYWVlNC0xYTgwLTQzZjEtODlmMy01MjIzMGU0ZThhYTkiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODc1MzMzMTgsImV4cCI6MTc4NzU2MjExOCwiaWF0IjoxNzg3NTMzMzE4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.AKrHik9ewMo1jm_XF6UrOcb2mAV9FsOcFvqL4yFH-Vc', '::1', '2026-08-23 19:01:58', NULL, 1, '2026-08-23 19:01:58');
INSERT INTO `sesiones_usuarios` VALUES (149, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNjA2ZjFiZC00ODU0LTQ4NTgtOGI5OC0yNGVjOWQ3ODI4NDciLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NzUzMzQ0MiwiZXhwIjoxNzg3NTYyMjQyLCJpYXQiOjE3ODc1MzM0NDIsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.N7bVKz0eC55NGM9TSeMSJvhuUmicZQxC7y4CmkPkZuo', '::1', '2026-08-23 19:04:03', NULL, 1, '2026-08-23 19:04:03');
INSERT INTO `sesiones_usuarios` VALUES (150, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNGFmYWNjZi01MWQ3LTQ2MDAtYWQ0NS1jM2UxYTE0OWQ4MzciLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NzUzNDA0NiwiZXhwIjoxNzg3NTYyODQ2LCJpYXQiOjE3ODc1MzQwNDYsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.B4MVCgtO-A-c_2vFe0VtcZjD6rQPrOQvDaJmQxn4S_w', '::1', '2026-08-23 19:14:06', NULL, 1, '2026-08-23 19:14:06');
INSERT INTO `sesiones_usuarios` VALUES (151, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MWE1ZWIyZi04N2Q3LTQ0MjUtODBhZS1jZGZjMjNlZDQ2MmEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4NzcxMDE0NCwiZXhwIjoxNzg3NzM4OTQ0LCJpYXQiOjE3ODc3MTAxNDQsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.kqc3Ul35yz6asbwTfXyKuDxhpdjKlufbA19AaNJL9Ko', '::1', '2026-08-25 20:09:04', NULL, 1, '2026-08-25 20:09:04');
INSERT INTO `sesiones_usuarios` VALUES (152, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYTczYmQ3Ni03YmE4LTRlMDYtOGQyMC05MWQwNWVjYzBhZTciLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODE0NTg2NCwiZXhwIjoxNzg4MTc0NjY0LCJpYXQiOjE3ODgxNDU4NjQsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.AxqPwrjtxoxumti1meTIUUyWfO04xK8EAgaaT-euIyk', '::1', '2026-08-30 21:11:04', NULL, 1, '2026-08-30 21:11:04');
INSERT INTO `sesiones_usuarios` VALUES (153, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZDQxZDExNC02MjE5LTQyNGUtOTBhMy03ZWUxNjA3Y2U0ZmUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODgxNDU4OTIsImV4cCI6MTc4ODE3NDY5MiwiaWF0IjoxNzg4MTQ1ODkyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.t_lYT2OHQUZsAEOnsWcQ7LKa9JNexWqDGYUEyiQ41BQ', '::1', '2026-08-30 21:11:33', NULL, 1, '2026-08-30 21:11:33');
INSERT INTO `sesiones_usuarios` VALUES (154, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZmM3YzhmYi01MjEwLTQ4OTUtOGI4ZC0xODM2M2JlMDc4ZDUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODE0NTkzNCwiZXhwIjoxNzg4MTc0NzM0LCJpYXQiOjE3ODgxNDU5MzQsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.H4nTEMs1UO9GS0uq69k8kElH78_c_LQ8uLGMDEildPw', '::1', '2026-08-30 21:12:15', NULL, 1, '2026-08-30 21:12:15');
INSERT INTO `sesiones_usuarios` VALUES (155, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NDVjYmUzYS1iNDRjLTRjZDgtYTg2ZC1jMGY4OWVjMjBjNzUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODgxNDY3OTMsImV4cCI6MTc4ODE3NTU5MywiaWF0IjoxNzg4MTQ2NzkzLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.8Nl2vM0_kr36g6jtq4Hrx2IaVZb_jvyBye9ujdG8gsM', '::1', '2026-08-30 21:26:34', NULL, 1, '2026-08-30 21:26:34');
INSERT INTO `sesiones_usuarios` VALUES (156, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZDlmNzc5Ni1iY2FmLTQ3NGQtOGNlYy05M2JkZjY3YzEwOWYiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODE0NjgwNSwiZXhwIjoxNzg4MTc1NjA1LCJpYXQiOjE3ODgxNDY4MDUsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.J42JqGqWM9GslYg1nH5ocMeaG8dL_kboxiWmk-vOpZc', '::1', '2026-08-30 21:26:46', NULL, 1, '2026-08-30 21:26:46');
INSERT INTO `sesiones_usuarios` VALUES (157, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMGZmOTIwYy05MTY0LTQ2ODctYTA2MC0zOWU5ZTEzYWRhYTkiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODM4NDA1MCwiZXhwIjoxNzg4NDEyODUwLCJpYXQiOjE3ODgzODQwNTAsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.jYFmiRKYYYs2qw2G_pt5lJPEfenyPc1bCDs9F6Zyfnk', '::1', '2026-09-02 15:20:50', NULL, 1, '2026-09-02 15:20:50');
INSERT INTO `sesiones_usuarios` VALUES (158, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZjEwZWZmZS1hMjY5LTQ4NTUtODFjMy00NjYwM2ZmOTdhN2QiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODM4NDM1MSwiZXhwIjoxNzg4NDEzMTUxLCJpYXQiOjE3ODgzODQzNTEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.P67aXdX02LDWkNQostJ8ncx6-kXW6nJzYOJbMWmt_HM', '::1', '2026-09-02 15:25:51', NULL, 1, '2026-09-02 15:25:51');
INSERT INTO `sesiones_usuarios` VALUES (159, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYzhkYTliMy02YmVmLTQ2MDUtOGQyMC1hMjQ3ZjlkYWNlZTAiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4Mzg2NTY5LCJleHAiOjE3ODg0MTUzNjksImlhdCI6MTc4ODM4NjU2OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.DhFl0ku1ycBfz65qFULPcPRQal1INCrSLCPDwNP_uVQ', '::1', '2026-09-02 16:02:49', NULL, 1, '2026-09-02 16:02:49');
INSERT INTO `sesiones_usuarios` VALUES (160, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MDBjN2Y5Ni0yZmE5LTRkYjctYWVhMy1jNmZkZDBlMTRhMjMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODgzODY1ODcsImV4cCI6MTc4ODQxNTM4NywiaWF0IjoxNzg4Mzg2NTg3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.-33OUNOCCD75Q1muaMf-HTguLQbxnRhTY8j-xURMGu0', '::1', '2026-09-02 16:03:08', NULL, 1, '2026-09-02 16:03:08');
INSERT INTO `sesiones_usuarios` VALUES (161, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NTgzZGI1NC1iNzliLTQxMTAtOWUxZi1jYjg5YTY2YTIzMjUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODU4NjU0MSwiZXhwIjoxNzg4NjE1MzQxLCJpYXQiOjE3ODg1ODY1NDEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.5hl0Hi7eYKI5ZVfMBbs7gBVPi1cP8Wgysej017TAejE', '::1', '2026-09-04 23:35:41', NULL, 1, '2026-09-04 23:35:41');
INSERT INTO `sesiones_usuarios` VALUES (162, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwOWEyYmZhOS1hZTMxLTQ0OTQtYWU5My1iZWNmYTZiZWY2NzYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg1ODczODUsImV4cCI6MTc4ODYxNjE4NSwiaWF0IjoxNzg4NTg3Mzg1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.kZ2RKtJHI86pfIPQPAxRuTT98Sh1dd70j_O26UXHZw8', '::1', '2026-09-04 23:49:46', NULL, 1, '2026-09-04 23:49:46');
INSERT INTO `sesiones_usuarios` VALUES (163, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NGJiNWViYy1jNTgzLTQ0MzctYTQxMy00YWRiN2NhNjdhMDciLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4NTg3NDEyLCJleHAiOjE3ODg2MTYyMTIsImlhdCI6MTc4ODU4NzQxMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.yj3KrlXiNYKdnR9U3zsY2U8rtKpmXzLIZlJ9Z-rOea8', '::1', '2026-09-04 23:50:13', NULL, 1, '2026-09-04 23:50:13');
INSERT INTO `sesiones_usuarios` VALUES (164, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NTM0YjhlNi1mNjc1LTRiYjctODhlYi1mMmU5ZTIwMzFiYTgiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODU5MDkyMSwiZXhwIjoxNzg4NjE5NzIxLCJpYXQiOjE3ODg1OTA5MjEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.OX1WKIOaijUQSFvalj_r-aAVojZadvPWTzisWQiSToo', '::1', '2026-09-05 00:48:42', NULL, 1, '2026-09-05 00:48:42');
INSERT INTO `sesiones_usuarios` VALUES (165, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ODU4MjQ5ZS1iOGNmLTQ3ZDYtYmI1Ny01NzFlMmU0ZDNkMzkiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg2MjE2OTIsImV4cCI6MTc4ODY1MDQ5MiwiaWF0IjoxNzg4NjIxNjkyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.G3NbpuWHVF06xFqplwoQUqcrYFBJCQoOpErbQLTnT6M', '::1', '2026-09-05 09:21:33', NULL, 1, '2026-09-05 09:21:33');
INSERT INTO `sesiones_usuarios` VALUES (166, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MTdmNGIxOC01NzM4LTQ5MzQtODE1MS0wZTg5Mjk1ZTFjYTkiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4NjIxODAyLCJleHAiOjE3ODg2NTA2MDIsImlhdCI6MTc4ODYyMTgwMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.rpsty3YRhdopDkexMhtPIDWDG3EnkUcYqO1sfpPT4WY', '::1', '2026-09-05 09:23:23', NULL, 1, '2026-09-05 09:23:23');
INSERT INTO `sesiones_usuarios` VALUES (167, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkN2Q5NjE5Ni01YTcxLTRiMzctYmM5Zi04NjIyZTkxZDA4OWEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg2MjE5MzUsImV4cCI6MTc4ODY1MDczNSwiaWF0IjoxNzg4NjIxOTM1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.oM21J2gCNC2eX57a_4o53j4wrnapGzYWKid6Fi7acGs', '::1', '2026-09-05 09:25:36', NULL, 1, '2026-09-05 09:25:36');
INSERT INTO `sesiones_usuarios` VALUES (168, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZWI0YjliMi02Y2Y1LTRmY2MtOTVkYS01ZGY2YWRiMWZmNzEiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4NjIzOTg0LCJleHAiOjE3ODg2NTI3ODQsImlhdCI6MTc4ODYyMzk4NCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.pbvvrljabpYfsFO7LHiNhQLox7SQ-h3Owh3k2xnM9Fc', '::1', '2026-09-05 09:59:45', NULL, 1, '2026-09-05 09:59:45');
INSERT INTO `sesiones_usuarios` VALUES (169, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ODE1ZGNkMS1jOTg0LTQwNjctOTYzYS1lOTkwOWExYTlhOTUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODczMDcyNSwiZXhwIjoxNzg4NzU5NTI1LCJpYXQiOjE3ODg3MzA3MjUsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.t-p9vecdH1egsm8Gy3BMqrEVlSog67D4PbmhFCudrB0', '::1', '2026-09-06 15:38:46', NULL, 1, '2026-09-06 15:38:46');
INSERT INTO `sesiones_usuarios` VALUES (170, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkOTk0Y2E1My1iNTM3LTQxYzQtOTI5Yi05ZTUwNWMwYTNjYTEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODczMjg0NSwiZXhwIjoxNzg4NzYxNjQ1LCJpYXQiOjE3ODg3MzI4NDUsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.10guZoGZA1Mb6xGT0bGyxDy4h2KxUjTTYXef23uiFP4', '::1', '2026-09-06 16:14:06', NULL, 1, '2026-09-06 16:14:06');
INSERT INTO `sesiones_usuarios` VALUES (171, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMDRlMDczZC0xYTRhLTRjNDUtYjJjYy0xOTgzZmU5MjBkOGUiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg4NzM2ODAyLCJleHAiOjE3ODg3NjU2MDIsImlhdCI6MTc4ODczNjgwMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.OglLj-g59ittKexJfi7Xh37s3nJwfxORmVH0mcV4Bxo', '::1', '2026-09-06 17:20:02', NULL, 1, '2026-09-06 17:20:02');
INSERT INTO `sesiones_usuarios` VALUES (172, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NjUwYWMzZS0zMTFlLTQ5NDctYWMyNS0xYjQzMGMwMWNmMDIiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg4NzM2ODUyLCJleHAiOjE3ODg3NjU2NTIsImlhdCI6MTc4ODczNjg1MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.N891SyKTvSpeo56PnXxiJ4B2CtGarem1pNuK9nYVgFA', '::1', '2026-09-06 17:20:53', NULL, 1, '2026-09-06 17:20:53');
INSERT INTO `sesiones_usuarios` VALUES (173, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NjQ5Yzg2OC1iZDAyLTQ3YjAtYmU0MC0xZDYzYjczYzUzZDUiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4NzM2ODY1LCJleHAiOjE3ODg3NjU2NjUsImlhdCI6MTc4ODczNjg2NSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.hEvQcfbB1yrVAT48KIGv_wQQ2yhjZzbBrI6zJ0WsIkM', '::1', '2026-09-06 17:21:06', NULL, 1, '2026-09-06 17:21:06');
INSERT INTO `sesiones_usuarios` VALUES (174, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NmIzNzBkNy0wNDEyLTQzOWMtOTY2Yi05YWNiZmQ3ZTcwZDEiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg4NzM2ODg0LCJleHAiOjE3ODg3NjU2ODQsImlhdCI6MTc4ODczNjg4NCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ._AjBdFHo4VutxkFZgaM7Xl5WXHp3ctpfG8gTNNwpyR4', '::1', '2026-09-06 17:21:25', NULL, 1, '2026-09-06 17:21:25');
INSERT INTO `sesiones_usuarios` VALUES (175, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwN2QyNzIyYy03NTRhLTQ0YTItOTJkNy0xZTM2MDM4MzM4ODAiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4NzM2OTQ3LCJleHAiOjE3ODg3NjU3NDcsImlhdCI6MTc4ODczNjk0NywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.u-_c3-FHxy3gABBj61weTfWS46p-iVexyZl9JFauu24', '::1', '2026-09-06 17:22:27', NULL, 1, '2026-09-06 17:22:27');
INSERT INTO `sesiones_usuarios` VALUES (176, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzOTZjMWMyYi0zYmIxLTRkYTktOGE4My1lYzk0ZDg1YTViNjAiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg4NzM2OTY3LCJleHAiOjE3ODg3NjU3NjcsImlhdCI6MTc4ODczNjk2NywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.bHWUEiQH_TzfGls02BB5CVVN_0tLjuaqfXxxUWKrvuA', '::1', '2026-09-06 17:22:47', NULL, 1, '2026-09-06 17:22:47');
INSERT INTO `sesiones_usuarios` VALUES (177, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNGRiYjJhMS0wNGJkLTQ0ZGUtYjZhYS04MmNlZmUwOTYwMjkiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4NzM3MDE5LCJleHAiOjE3ODg3NjU4MTksImlhdCI6MTc4ODczNzAxOSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.V74NfLcW0oDWDV2LXo0UE6S4xvSPD6reTDIiM_V8sLU', '::1', '2026-09-06 17:23:39', NULL, 1, '2026-09-06 17:23:39');
INSERT INTO `sesiones_usuarios` VALUES (178, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNzU0Y2ZiZi1jMTJjLTQ4YjYtYTFlOS04YjY2YWZjMDcxMzgiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg4NzM3MDQ0LCJleHAiOjE3ODg3NjU4NDQsImlhdCI6MTc4ODczNzA0NCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.8viSnTChAwCtt14P8tC9DiZTBP90WqnJrpUCeazPYOk', '::1', '2026-09-06 17:24:05', NULL, 1, '2026-09-06 17:24:05');
INSERT INTO `sesiones_usuarios` VALUES (179, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0Yzc3OTcwYi0zODQwLTQ5MWUtOTc3OS1iMjU5MmQ4MTY5NjMiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4NzM3MDY2LCJleHAiOjE3ODg3NjU4NjYsImlhdCI6MTc4ODczNzA2NiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.rQPvN5MOLkxs9L6pxfOMZVFLG715D--GOkfJw5v3oZ8', '::1', '2026-09-06 17:24:26', NULL, 1, '2026-09-06 17:24:26');
INSERT INTO `sesiones_usuarios` VALUES (180, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYjVhNTg4Yi1lOGFlLTRlMDYtYTRkOS0xNzkyNjRkMWM1YjUiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg4NzM3MDkwLCJleHAiOjE3ODg3NjU4OTAsImlhdCI6MTc4ODczNzA5MCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.ujNI3DjDiZ3bNMl1e0ACjhzC3z1FqpXalYeFXYjcaeI', '::1', '2026-09-06 17:24:51', NULL, 1, '2026-09-06 17:24:51');
INSERT INTO `sesiones_usuarios` VALUES (181, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YzMxYzRhNS03NDFjLTRkOGUtYmU1MC05ODg5ZWRiMmFhOWEiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4NzM3MTk3LCJleHAiOjE3ODg3NjU5OTcsImlhdCI6MTc4ODczNzE5NywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.wAwLhQI-eXJpfz6gWHb-WWg3wuEXt6nijAnLzMbYx_I', '::1', '2026-09-06 17:26:37', NULL, 1, '2026-09-06 17:26:37');
INSERT INTO `sesiones_usuarios` VALUES (182, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMTVkNDlmNS1lZTZjLTQ2YzAtYjQ2NS1kN2E2YzlkYjBmNDUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODczNzIzNCwiZXhwIjoxNzg4NzY2MDM0LCJpYXQiOjE3ODg3MzcyMzQsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.kI82RawJYbWcZyplMHT9eqwL9iMKdop7Uax-nv0meac', '::1', '2026-09-06 17:27:15', NULL, 1, '2026-09-06 17:27:15');
INSERT INTO `sesiones_usuarios` VALUES (183, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMzBkZTY3NC00MDQ3LTRlNWItOGNmNi1lMDFlNWRiMjZkNmMiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODgzODk4NCwiZXhwIjoxNzg4ODY3Nzg0LCJpYXQiOjE3ODg4Mzg5ODQsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.7gQ1D_poL_jGM-7WNIAEm5EKqbOLFeqIo4nk5O3qTEo', '::1', '2026-09-07 21:43:04', NULL, 1, '2026-09-07 21:43:04');
INSERT INTO `sesiones_usuarios` VALUES (184, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MGM3ZDFkOC1jMDM3LTQwZGYtOTQ0MC04ODIxNTE0MDFjM2YiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg4NDE4NDcsImV4cCI6MTc4ODg3MDY0NywiaWF0IjoxNzg4ODQxODQ3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.cLhu8-d_HgMX9ZZS1gt7OfVJFVevzx5DoQKX6JsvsBw', '::1', '2026-09-07 22:30:47', NULL, 1, '2026-09-07 22:30:47');
INSERT INTO `sesiones_usuarios` VALUES (185, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmOTU0OTFhZC0wMzlhLTQxZDEtYjExNi1jZDQ3N2YzZTY4YzgiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODg0MTkwMCwiZXhwIjoxNzg4ODcwNzAwLCJpYXQiOjE3ODg4NDE5MDAsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.BfJ2TGvvwByxf7g1NHi32ZoVtorgJYj2DEBacSDjuYo', '::1', '2026-09-07 22:31:40', NULL, 1, '2026-09-07 22:31:40');
INSERT INTO `sesiones_usuarios` VALUES (186, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNWU2MTYzYS1mODM3LTQzMTgtYWQzMS1jOTc0NTY1Mjk5NDQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg4NDM2MTIsImV4cCI6MTc4ODg3MjQxMiwiaWF0IjoxNzg4ODQzNjEyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.E1ffOhGBc_auZU8sVzvwpmNRSCVfompAwzSxPlT5NAw', '::1', '2026-09-07 23:00:13', NULL, 1, '2026-09-07 23:00:13');
INSERT INTO `sesiones_usuarios` VALUES (187, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNTY2ODUxZS1jMDcxLTRjMGItOGUzMy1mNjhmNDA2MTZlMWMiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODg0MzcyOSwiZXhwIjoxNzg4ODcyNTI5LCJpYXQiOjE3ODg4NDM3MjksImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.lpm1KkrT4T-gj9HfQmjBJUh1diF7HBOisCSrQ5agw6c', '::1', '2026-09-07 23:02:09', NULL, 1, '2026-09-07 23:02:09');
INSERT INTO `sesiones_usuarios` VALUES (188, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNDc0ZDc3MC0xYTIwLTQ1MmUtYjlmNS02ZGNmMWE2YjExYjUiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4OTEwMzI5LCJleHAiOjE3ODg5MzkxMjksImlhdCI6MTc4ODkxMDMyOSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.V8hD_KBYx_Ue4qhVxefUb0_z5lpuZCBy4_qyRxFGwvg', '::1', '2026-09-08 17:32:10', NULL, 1, '2026-09-08 17:32:10');
INSERT INTO `sesiones_usuarios` VALUES (189, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYjkzYjY2Zi05NWM3LTQ2ZTItYWY3ZC0yN2Y1MDVmYzBkZTYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5MTA0NTIsImV4cCI6MTc4ODkzOTI1MiwiaWF0IjoxNzg4OTEwNDUyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.lvorBpq_B_eHMuoEOJnk1xa0heW9qLmuAnXTY-zljSg', '::1', '2026-09-08 17:34:12', NULL, 1, '2026-09-08 17:34:12');
INSERT INTO `sesiones_usuarios` VALUES (190, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZmJmZWM1OS1hNDgwLTRkNTYtYmM4Yi03YTA1MjUxMmQ3NGMiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4OTE5NjQ5LCJleHAiOjE3ODg5NDg0NDksImlhdCI6MTc4ODkxOTY0OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.atU1EPPKzFRSwNMUiaOxGBQ4wzhbkBCQPNgWduYX2YI', '::1', '2026-09-08 20:07:29', NULL, 1, '2026-09-08 20:07:29');
INSERT INTO `sesiones_usuarios` VALUES (191, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MjZlNGQ4Mi03MDU1LTQzZmYtODZjZS04MmJjNGZjYmQ3YjciLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4OTI4MTY5LCJleHAiOjE3ODg5NTY5NjksImlhdCI6MTc4ODkyODE2OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.SXq8XCg7JJHxs7T16RG1PbApmCtMuHTZuM5UUSXxXP8', '::1', '2026-09-08 22:29:30', NULL, 1, '2026-09-08 22:29:30');
INSERT INTO `sesiones_usuarios` VALUES (192, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZDFjOGI0ZS1hOWIyLTRjMjctOWZlZC05Njk2NDJjNGI5NjEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5MjkzMzUsImV4cCI6MTc4ODk1ODEzNSwiaWF0IjoxNzg4OTI5MzM1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.YvZxm4PC2xGazJGWnGpiVHfpXpagmlX-ZCCsFxjViQk', '::1', '2026-09-08 22:48:56', NULL, 1, '2026-09-08 22:48:56');
INSERT INTO `sesiones_usuarios` VALUES (193, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2Y2FhODUwOS1mODk3LTQzM2EtYmY0My00MjEwMTIxNGI4MTkiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4OTMzNTc5LCJleHAiOjE3ODg5NjIzNzksImlhdCI6MTc4ODkzMzU3OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.xPNYZgPRXmUm0BENyAuj6iSykyvbC8S30fcQEA8u9qE', '::1', '2026-09-08 23:59:40', NULL, 1, '2026-09-08 23:59:40');
INSERT INTO `sesiones_usuarios` VALUES (194, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MDkyM2UzOC00NTEwLTQ5ZmEtOTA1Ni0xZDUxNzczZjlmYmUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODkzMzY2NywiZXhwIjoxNzg4OTYyNDY3LCJpYXQiOjE3ODg5MzM2NjcsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.jq7IWP0C1bFtGYFuEleHtNIpL5VTMEeKcYBqPPkGIuc', '::1', '2026-09-09 00:01:07', NULL, 1, '2026-09-09 00:01:07');
INSERT INTO `sesiones_usuarios` VALUES (195, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNTAwMDQyOC04YTZiLTRiNjAtODRjNy04MGJkMjFkM2UwYzgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5MzQxMDUsImV4cCI6MTc4ODk2MjkwNSwiaWF0IjoxNzg4OTM0MTA1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.qAVC3sFr_JINUWIwi9W-l6YCX73tCOb9BSKRenYq-T0', '::1', '2026-09-09 00:08:26', NULL, 1, '2026-09-09 00:08:26');
INSERT INTO `sesiones_usuarios` VALUES (196, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNmRkMTIyYi01OTYyLTRiYWMtYTg3Yi1hZTk0MWZiYmY1ZjEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5MzYxOTksImV4cCI6MTc4ODk2NDk5OSwiaWF0IjoxNzg4OTM2MTk5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.juxdODHweZ_MYO6ngL7OqX7y2DUjEFMmhJSTZ1rUKlQ', '::1', '2026-09-09 00:43:20', NULL, 1, '2026-09-09 00:43:20');
INSERT INTO `sesiones_usuarios` VALUES (197, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5OTQ2YjMwNC01NzIxLTQ0OWYtYmMyOS0yNTFjMGE2OGZlNDIiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4OTM2MjcyLCJleHAiOjE3ODg5NjUwNzIsImlhdCI6MTc4ODkzNjI3MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.O9jToYpQTEjOHY0NJ0AuNwG98roJIWHKAc8OHSYK0Kw', '::1', '2026-09-09 00:44:33', NULL, 1, '2026-09-09 00:44:33');
INSERT INTO `sesiones_usuarios` VALUES (198, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMTlkNTYzZC1jNmQ5LTQxMzQtYjc1Ny1jZDU0MDQwMjcwZDciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5MzYzMTIsImV4cCI6MTc4ODk2NTExMiwiaWF0IjoxNzg4OTM2MzEyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.JJpK16VxqO2wt-I_OhF1fEwfphKx12JXYy6fobu3PzE', '::1', '2026-09-09 00:45:12', NULL, 1, '2026-09-09 00:45:12');
INSERT INTO `sesiones_usuarios` VALUES (199, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2M2E0ZGVkOS1iZWNlLTRhYzQtYjE1Mi1jYWZjMGVjZmU5ODgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5MzYzNzUsImV4cCI6MTc4ODk2NTE3NSwiaWF0IjoxNzg4OTM2Mzc1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.fQlgx3FI5i2APqg65YmI3PI9RpH3SJvJWYaOgFYrEc8', '::1', '2026-09-09 00:46:16', NULL, 1, '2026-09-09 00:46:16');
INSERT INTO `sesiones_usuarios` VALUES (200, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZGM3NDEwNy1jOTdlLTQ4ZmUtODk1ZC03ZjhiOThiMmVhOTIiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODkzNjQxNywiZXhwIjoxNzg4OTY1MjE3LCJpYXQiOjE3ODg5MzY0MTcsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.hVGZk-BQ1sLGvXoZTEs4hbVoDsy-nwKtuTZUGype1Gg', '::1', '2026-09-09 00:46:58', NULL, 1, '2026-09-09 00:46:58');
INSERT INTO `sesiones_usuarios` VALUES (201, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwM2NkZWFhNS0wMDJhLTQ4NTItOGYyYy1lZGJhNTI3YWM4MTMiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg4OTM2NTc4LCJleHAiOjE3ODg5NjUzNzgsImlhdCI6MTc4ODkzNjU3OCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.LP-qxMzoK7aqTYxpC4bGLvB2ihHW4n4gW0SAX0qMUoE', '::1', '2026-09-09 00:49:38', NULL, 1, '2026-09-09 00:49:38');
INSERT INTO `sesiones_usuarios` VALUES (202, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmODA1ZTk2ZC0yYWJiLTQ1MWMtYWM4Ni1lNjA1N2U5NjhhYzUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5MzY2MTIsImV4cCI6MTc4ODk2NTQxMiwiaWF0IjoxNzg4OTM2NjEyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.4rcIIMhY5LTUnAdylNRFtawBvifG7KctNbj8MEndnyo', '::1', '2026-09-09 00:50:12', NULL, 1, '2026-09-09 00:50:12');
INSERT INTO `sesiones_usuarios` VALUES (203, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyYWQ0YWZiZS1iZWVlLTRmMWYtODc4NC00YTQ0MmU1MzI2NTMiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODkzNjY1NiwiZXhwIjoxNzg4OTY1NDU2LCJpYXQiOjE3ODg5MzY2NTYsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.9hQ4VnSQ9z7JGyjju64aAut2UUwJzkEQ6-UVOKi-72E', '::1', '2026-09-09 00:50:57', NULL, 1, '2026-09-09 00:50:57');
INSERT INTO `sesiones_usuarios` VALUES (204, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5M2FmNDg3Zi02OWY0LTRhZGItYjg0Mi1iMGRkOTI2YmU5MDkiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5MzY2ODEsImV4cCI6MTc4ODk2NTQ4MSwiaWF0IjoxNzg4OTM2NjgxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.E1vy6EwpO_dHIcqdOajqZgXEOnA5txm8RDgQ_r1l69I', '::1', '2026-09-09 00:51:22', NULL, 1, '2026-09-09 00:51:22');
INSERT INTO `sesiones_usuarios` VALUES (205, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZWE1YTY1OC05MjExLTRkODUtOTI0YS04MzY3OTcyNjRkMTEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5MzY3MjgsImV4cCI6MTc4ODk2NTUyOCwiaWF0IjoxNzg4OTM2NzI4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.CKP0EzIQI-Y3FPd44dTdB5o7JrN26fAeb5wAzdER8Jo', '::1', '2026-09-09 00:52:09', NULL, 1, '2026-09-09 00:52:09');
INSERT INTO `sesiones_usuarios` VALUES (206, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZjAxZDE0Ny0wMzQzLTQwZDUtOWQ5Ny04ODY5NzRmNmY2NTEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODkzNjczMiwiZXhwIjoxNzg4OTY1NTMyLCJpYXQiOjE3ODg5MzY3MzIsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.lxD0dH1OKBeGh4ND2DX7Glt8c4AwNl_DfyXgw79rDjw', '::1', '2026-09-09 00:52:13', NULL, 1, '2026-09-09 00:52:13');
INSERT INTO `sesiones_usuarios` VALUES (207, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNjI2NDAzOC05YmQ3LTRkZTAtYmE3Yi0wYjcyOGVhZGQ5NDIiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODk2NjM4MCwiZXhwIjoxNzg4OTk1MTgwLCJpYXQiOjE3ODg5NjYzODAsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.d_s78V6NM_hVc1uXk4w7hrLDRt2UO-uzCvIew5YbdcE', '::1', '2026-09-09 09:06:21', NULL, 1, '2026-09-09 09:06:21');
INSERT INTO `sesiones_usuarios` VALUES (208, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTYxMzNiMS1jNjg3LTRjZGEtODg3Yi00NjlmNGZjZWY0YjUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5NjY0MDYsImV4cCI6MTc4ODk5NTIwNiwiaWF0IjoxNzg4OTY2NDA2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.rn922t10pdPYRmC6sjndu-RzTlAECbpxUX7bY1dfCmE', '::1', '2026-09-09 09:06:47', NULL, 1, '2026-09-09 09:06:47');
INSERT INTO `sesiones_usuarios` VALUES (209, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMGY1ZWFkMi0wNGYzLTRkYzUtYjA4MC1lNTBlYzBlNmZkMDEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODk2NzU2OSwiZXhwIjoxNzg4OTk2MzY5LCJpYXQiOjE3ODg5Njc1NjksImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.JdHOVHCrHLAX7PtvDhsPCTYOzaTfxHfQVmHyOsjL5Lk', '::1', '2026-09-09 09:26:10', NULL, 1, '2026-09-09 09:26:10');
INSERT INTO `sesiones_usuarios` VALUES (210, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTMwNmFkMy01NDFkLTQxNzYtOWY1NS04YjRmYmJkOWIyOTAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5Njc2MDMsImV4cCI6MTc4ODk5NjQwMywiaWF0IjoxNzg4OTY3NjAzLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.HK1XoShEJehVqm8SnM3dC2J7IbrUSBJtYuiLz4MkAAk', '::1', '2026-09-09 09:26:44', NULL, 1, '2026-09-09 09:26:44');
INSERT INTO `sesiones_usuarios` VALUES (211, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNTAwMTBjNS05MjZhLTQ2OGMtYTQ4Zi1kYTJjYzRlYjc2ZmIiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODk2NzY1MywiZXhwIjoxNzg4OTk2NDUzLCJpYXQiOjE3ODg5Njc2NTMsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.3k6uMCCCUD1StH3yRP5mK1tBYV3nd8WOGG_lx2TQ80I', '::1', '2026-09-09 09:27:34', NULL, 1, '2026-09-09 09:27:34');
INSERT INTO `sesiones_usuarios` VALUES (212, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YmI2ZWYxYi1hYTNhLTRiN2YtODM5My05ZTg1N2IyZTNjNjciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODg5Njk2ODcsImV4cCI6MTc4ODk5ODQ4NiwiaWF0IjoxNzg4OTY5Njg3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.-fR1c2-Qc-PN5BgV_p8ZINyjMb4v8os3W9sMiuObv4U', '::1', '2026-09-09 10:01:27', NULL, 1, '2026-09-09 10:01:27');
INSERT INTO `sesiones_usuarios` VALUES (213, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NWZmZDQyNi1jZWNlLTQ1ZWQtODg1OC0xZGVkOWVjYjQ1MjAiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4ODk2OTY5OSwiZXhwIjoxNzg4OTk4NDk5LCJpYXQiOjE3ODg5Njk2OTksImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.AAcMsHkR1UZXnmmscxOOY6YlpupHUFl2x2QCCyZtODo', '::1', '2026-09-09 10:01:40', NULL, 1, '2026-09-09 10:01:40');
INSERT INTO `sesiones_usuarios` VALUES (214, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYWNkYzA5Ny02MzgyLTQ2ZTAtYTdhNy0xOWZkY2VlYmI0OGYiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTEwNzQ5NiwiZXhwIjoxNzg5MTM2Mjk2LCJpYXQiOjE3ODkxMDc0OTYsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.ng18XhHWlh8-BLRmegp38gOTta_bjBQBDhu7QVfOwhc', '::1', '2026-09-11 00:18:17', NULL, 1, '2026-09-11 00:18:17');
INSERT INTO `sesiones_usuarios` VALUES (215, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzOTc0YWIwMC02NGVhLTQ4YTktYmU3OC1mYTg4NzMzOTY4ZTgiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTEwNzQ5NywiZXhwIjoxNzg5MTM2Mjk3LCJpYXQiOjE3ODkxMDc0OTcsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.mG4ccX3gMfb2UbVi24AEDs60GuftxSblZ3tabgHQQ0Q', '::1', '2026-09-11 00:18:17', NULL, 1, '2026-09-11 00:18:17');
INSERT INTO `sesiones_usuarios` VALUES (216, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNzU0NjBkOS00YzM3LTRjYWEtYWU0NS1hZWE3YjI0OTUzZDYiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MTA3NTYyLCJleHAiOjE3ODkxMzYzNjIsImlhdCI6MTc4OTEwNzU2MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Mpq_z70cEnWgETlEy1EstNqpvOyiepr4pARZ_dBUOx0', '::1', '2026-09-11 00:19:22', NULL, 1, '2026-09-11 00:19:22');
INSERT INTO `sesiones_usuarios` VALUES (217, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkOTdhNDgxYS03OTQwLTRhNjctOGRkNS1kNzY4NTcxYjkxMTAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkxMDc1ODAsImV4cCI6MTc4OTEzNjM4MCwiaWF0IjoxNzg5MTA3NTgwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.VZm-fZil1kPGEX1yo2PqLGC_aKCsx9htR2BwgBT_UaY', '::1', '2026-09-11 00:19:41', NULL, 1, '2026-09-11 00:19:41');
INSERT INTO `sesiones_usuarios` VALUES (218, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNDJlY2Q4Mi1hOWEzLTRjNzMtOWUxYy1kOTRlMDgxZjcxNzkiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MTQ0NTQzLCJleHAiOjE3ODkxNzMzNDMsImlhdCI6MTc4OTE0NDU0MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.KzRaVOMMyxD45zCMqMn5SYcJJLw_J-bJlJOBgt4_MHw', '::1', '2026-09-11 10:35:44', NULL, 1, '2026-09-11 10:35:44');
INSERT INTO `sesiones_usuarios` VALUES (219, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYTFiNDg0My0wZTJiLTQ2YzItYmQzMC00MjBkZjEyOGZhNWYiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTE0NDYxMSwiZXhwIjoxNzg5MTczNDExLCJpYXQiOjE3ODkxNDQ2MTEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.zZQ9wCBWUXn3vhQHt2QpFyNyPe9NQ_F6bVE0Dmvyo6Y', '::1', '2026-09-11 10:36:52', NULL, 1, '2026-09-11 10:36:52');
INSERT INTO `sesiones_usuarios` VALUES (220, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MmVjNzVkMC03NzI3LTRmYzktYWNkNy1lYTNkMmUzMDE1NmYiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MTQ0NjYzLCJleHAiOjE3ODkxNzM0NjMsImlhdCI6MTc4OTE0NDY2MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.HdJUo0qM4de_aaaSKxf8EaWcZE75ipYg00xj7dRcvv4', '::1', '2026-09-11 10:37:44', NULL, 1, '2026-09-11 10:37:44');
INSERT INTO `sesiones_usuarios` VALUES (221, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOTYxM2U0Yy1mYmZhLTQ2ZTYtOGY3NC0yMzg1ZGI3ZDI3MmUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTE0NDc3NCwiZXhwIjoxNzg5MTczNTc0LCJpYXQiOjE3ODkxNDQ3NzQsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.UBMczxJ85jHe52fgtLkVS1v4SDa_CdaE5UxWcaM2AKE', '::1', '2026-09-11 10:39:35', NULL, 1, '2026-09-11 10:39:35');
INSERT INTO `sesiones_usuarios` VALUES (222, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YjliNzRiZS0wYTBlLTRlNzUtOWFmNC00OGY2YTQwODcxNWYiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MTQ0OTAzLCJleHAiOjE3ODkxNzM3MDMsImlhdCI6MTc4OTE0NDkwMywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.l7jRjjVft9CUJx2BKGS9XlFMeDYEtLA6KnNpXJ0cdqo', '::1', '2026-09-11 10:41:44', NULL, 1, '2026-09-11 10:41:44');
INSERT INTO `sesiones_usuarios` VALUES (223, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZTY1ZTc3ZS1mZjE1LTQ1N2MtYWMxMS04Mjk1ZDdlYjU1NjQiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTE0NDkxNywiZXhwIjoxNzg5MTczNzE3LCJpYXQiOjE3ODkxNDQ5MTcsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.XzE_MDUx6UHFC_IOyvKKLob1-iLh1LFmc8puYjrQEj0', '::1', '2026-09-11 10:41:58', NULL, 1, '2026-09-11 10:41:58');
INSERT INTO `sesiones_usuarios` VALUES (224, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNmJhMDUwNS1kOGIzLTRhM2QtODIzYy01ZTNkNTg3YmM1YTEiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MTQ1MjQ1LCJleHAiOjE3ODkxNzQwNDUsImlhdCI6MTc4OTE0NTI0NSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.WCHKwazfi6iCm6Aquh72Lhqk_Fifj7nlozrtB-vMH7M', '::1', '2026-09-11 10:47:25', NULL, 1, '2026-09-11 10:47:25');
INSERT INTO `sesiones_usuarios` VALUES (225, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZTk5YjM5MS1mYTJjLTQ2NzEtYmEyNC0xYjE2Mjg0OWExMzkiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MTQ1MjY3LCJleHAiOjE3ODkxNzQwNjcsImlhdCI6MTc4OTE0NTI2NywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.ZdrVC4tGscw-vuBSUr7noSagxURGgVHRIYylNArUqZA', '::1', '2026-09-11 10:47:47', NULL, 1, '2026-09-11 10:47:47');
INSERT INTO `sesiones_usuarios` VALUES (226, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNDE2MzMxMi01MmUwLTQ3ZTItYTg2MS0zYTU0MDU0OGJiNDEiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5MTQ1OTE4LCJleHAiOjE3ODkxNzQ3MTgsImlhdCI6MTc4OTE0NTkxOCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.EvpbVL3_u_CPBW7snXrYU7MgqURCyUx9EfWtvh5leMw', '::1', '2026-09-11 10:58:39', NULL, 1, '2026-09-11 10:58:39');
INSERT INTO `sesiones_usuarios` VALUES (227, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZmIxZmRkMi1mZTMzLTRlM2EtOWNjOC0zYmRkYzBmN2IyZTIiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg5MTc2NDM0LCJleHAiOjE3ODkyMDUyMzQsImlhdCI6MTc4OTE3NjQzNCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.lSU3BOvYELusRmx7v1Nyn0cJhtdGZGsC3DTBpy0RjXA', '::1', '2026-09-11 19:27:14', NULL, 1, '2026-09-11 19:27:14');
INSERT INTO `sesiones_usuarios` VALUES (228, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTZkZGQ4ZC0yNjZlLTRjN2QtYmMwMS03Mjg0Y2YzOTQxM2QiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkxNzY2MDUsImV4cCI6MTc4OTIwNTQwNSwiaWF0IjoxNzg5MTc2NjA1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.YXMINXHAincqOUZTPl_G1IShl3hCC3J18mFAXr0sD2g', '::1', '2026-09-11 19:30:05', NULL, 1, '2026-09-11 19:30:05');
INSERT INTO `sesiones_usuarios` VALUES (229, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OTQ5ZDQyYS00NjYzLTQ3M2QtYTY3OS00ZDgzMjI2ZWMwNTEiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MTc2NjMxLCJleHAiOjE3ODkyMDU0MzEsImlhdCI6MTc4OTE3NjYzMSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.eyjDC0p92nZdZQCFmr6n2PkcGsWUZgUamyn0gLRn-NA', '::1', '2026-09-11 19:30:32', NULL, 1, '2026-09-11 19:30:32');
INSERT INTO `sesiones_usuarios` VALUES (230, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlZTUxZWFhNi01ZDZlLTRiMzEtYWZmOC1mYmU0Y2Q1YzIwMmMiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTE3NjY1MywiZXhwIjoxNzg5MjA1NDUzLCJpYXQiOjE3ODkxNzY2NTMsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.FrdPZtUOXOvbgGO9pIQBD3p6UneZ1a7aM0Npp0vBHBg', '::1', '2026-09-11 19:30:54', NULL, 1, '2026-09-11 19:30:54');
INSERT INTO `sesiones_usuarios` VALUES (231, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NWY1Mjk5NC05NjI3LTRhMzQtOTc4Ni0xMTYwMmE3Y2QzMjgiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5MTc2Njc0LCJleHAiOjE3ODkyMDU0NzQsImlhdCI6MTc4OTE3NjY3NCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.P7K3Sudf0UdPZ8udGywzefJNoXvxITwBNRuSBuXXgto', '::1', '2026-09-11 19:31:15', NULL, 1, '2026-09-11 19:31:15');
INSERT INTO `sesiones_usuarios` VALUES (232, 6, 'ENC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMDUyOTQ1MS03MzYwLTQyZGEtODczNS1jZWE3YzIyYWU0MjMiLCJuYW1laWQiOiI2IiwidW5pcXVlX25hbWUiOiJFTkMwMDEiLCJyb2xlIjoiRW5jYXJnYWRvIiwibmJmIjoxNzg5MTc2NzAzLCJleHAiOjE3ODkyMDU1MDMsImlhdCI6MTc4OTE3NjcwMywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.QAMAjRQM8XbhpFPbtm-SNNEub0y9tQ9suFkh0-totp4', '::1', '2026-09-11 19:31:43', NULL, 1, '2026-09-11 19:31:43');
INSERT INTO `sesiones_usuarios` VALUES (233, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkODI2Mjg3Zi1hYTY0LTQwYTYtOGQzNi1jZDU5MTdlNjE0OTEiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg5MTgwNTU2LCJleHAiOjE3ODkyMDkzNTYsImlhdCI6MTc4OTE4MDU1NiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.k2wDSl9yS8UH7ccdIFL6iDt-ADpzJNuegfuOW0IWBVw', '::1', '2026-09-11 20:35:57', NULL, 1, '2026-09-11 20:35:57');
INSERT INTO `sesiones_usuarios` VALUES (234, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGEzNTFkYi0yYzcwLTQ2MmEtYjVhMS1iNzRkNGJmODkzZWMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkxODA1NjksImV4cCI6MTc4OTIwOTM2OSwiaWF0IjoxNzg5MTgwNTY5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.pZ2LXLTRxdRvUTASQAilLlYOjDrIbWYWtRUhJPYENzc', '::1', '2026-09-11 20:36:09', NULL, 1, '2026-09-11 20:36:09');
INSERT INTO `sesiones_usuarios` VALUES (235, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ODZjZDI4Zi02NTcwLTQ5ZGItYjM2NS1kZTBhNTcwNDViZTAiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MTgwNTg4LCJleHAiOjE3ODkyMDkzODgsImlhdCI6MTc4OTE4MDU4OCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.GpfZYvg8R4mHh_8bdox8dUOdjtF5K-bJBORn8p6TSSE', '::1', '2026-09-11 20:36:29', NULL, 1, '2026-09-11 20:36:29');
INSERT INTO `sesiones_usuarios` VALUES (236, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YTY5YmEzZC02ZTM1LTQ2MjctOTI0ZS03ZjhmZGRjMGNkMWMiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTE4MDU5OCwiZXhwIjoxNzg5MjA5Mzk4LCJpYXQiOjE3ODkxODA1OTgsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.M62rWHbFtuPBjnGwIEYGaSq3Uk5TMQiiUZAlmlezu1s', '::1', '2026-09-11 20:36:38', NULL, 1, '2026-09-11 20:36:38');
INSERT INTO `sesiones_usuarios` VALUES (237, 6, 'ENC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNTU3MmMzNi0xYmJjLTQyMWYtYmY4Ni1kZDQxY2JhODgwY2IiLCJuYW1laWQiOiI2IiwidW5pcXVlX25hbWUiOiJFTkMwMDEiLCJyb2xlIjoiRW5jYXJnYWRvIiwibmJmIjoxNzg5MTgwNjEyLCJleHAiOjE3ODkyMDk0MTIsImlhdCI6MTc4OTE4MDYxMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.vJRRvsertDAdAMCuM317nftJVm2f94UqqUe5_ICaFc8', '::1', '2026-09-11 20:36:52', NULL, 1, '2026-09-11 20:36:52');
INSERT INTO `sesiones_usuarios` VALUES (238, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNmJkODZiNi0wZDQyLTQ2ZGYtOTQ4ZS1hM2EzYjkxMmJmMzAiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5MTgwNjE5LCJleHAiOjE3ODkyMDk0MTksImlhdCI6MTc4OTE4MDYxOSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.tVbgUIULbUEAgrOD9vs0LtyUxBAtI4Fab0sX3KDD3x8', '::1', '2026-09-11 20:36:59', NULL, 1, '2026-09-11 20:36:59');
INSERT INTO `sesiones_usuarios` VALUES (239, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTgzZmVkNi01NTZkLTQ2ZjYtOGU0Yy1iNGMzODViYTU3YjEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTI0MTYyNCwiZXhwIjoxNzg5MjcwNDI0LCJpYXQiOjE3ODkyNDE2MjQsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.0g1vPj0V-31fvT3qz-McNZv8fTjwF3JvulzKytaunZI', '::1', '2026-09-12 13:33:44', NULL, 1, '2026-09-12 13:33:44');
INSERT INTO `sesiones_usuarios` VALUES (240, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyODU0Y2ZkMS0xMjg1LTRjOTctOGFkMy04NzM0ZmUyNjg0OTUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNDE2MjQsImV4cCI6MTc4OTI3MDQyNCwiaWF0IjoxNzg5MjQxNjI0LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.gEHsUeiJoggnYmgsRNaKBbvORNultFCmue2TfleXuLY', '::1', '2026-09-12 13:33:44', NULL, 1, '2026-09-12 13:33:44');
INSERT INTO `sesiones_usuarios` VALUES (241, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZDRkNzI1ZS0zM2I5LTQxODItYjQ1Mi1lMTI5YmEwYjNlZTMiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5MjQxNjYwLCJleHAiOjE3ODkyNzA0NjAsImlhdCI6MTc4OTI0MTY2MCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.d1EHRZTaYEgbV8JzgEsGiOExtcgKKxcXzRb04ZNtaME', '::1', '2026-09-12 13:34:21', NULL, 1, '2026-09-12 13:34:21');
INSERT INTO `sesiones_usuarios` VALUES (242, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NDQzZTVkZC0xYjhkLTQ4NmItYWEwNS02ZDAxYjllNDcyZTIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNDE2NzgsImV4cCI6MTc4OTI3MDQ3OCwiaWF0IjoxNzg5MjQxNjc4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.jjYyWbi8fg7KitDonWL1B0gjY7MgsU3hWMEPbViHlU4', '::1', '2026-09-12 13:34:39', NULL, 1, '2026-09-12 13:34:39');
INSERT INTO `sesiones_usuarios` VALUES (243, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMDQwMjlkZC0wMzkxLTQ0ZWQtYWM4ZC1kZTM0MDk4YzU3N2IiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MjQ0Mzc1LCJleHAiOjE3ODkyNzMxNzUsImlhdCI6MTc4OTI0NDM3NSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ._kA1z5DnPu-i89ptI7Lkx42Kq793KwcQRbdn_GGesOA', '::1', '2026-09-12 14:19:35', NULL, 1, '2026-09-12 14:19:35');
INSERT INTO `sesiones_usuarios` VALUES (244, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NmE4M2E3Mi03YmRhLTQ4MjMtYjNlMi02N2MyMjIyMDFlYmMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNDY5NzgsImV4cCI6MTc4OTI3NTc3OCwiaWF0IjoxNzg5MjQ2OTc4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.-lkZym7xgr3feJ96tQwQGu6y-SRQwZBwbcSa-JWcB4E', '::1', '2026-09-12 15:02:58', NULL, 1, '2026-09-12 15:02:58');
INSERT INTO `sesiones_usuarios` VALUES (245, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDZhZjZkOS1iNWFlLTQ5NGYtODlkMy0wZDg2NjdkN2RlMmIiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTI0NzY5NCwiZXhwIjoxNzg5Mjc2NDk0LCJpYXQiOjE3ODkyNDc2OTQsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.AKMba6EeQ5Hz0lODQbiHrEiDtJSIX0wnIzmVuY5ncWU', '::1', '2026-09-12 15:14:54', NULL, 1, '2026-09-12 15:14:54');
INSERT INTO `sesiones_usuarios` VALUES (246, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNDBlMzJmOC0wYTBhLTRhZWItYTdlNy00YWNjYmZlNTIzMWEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNDc3MTMsImV4cCI6MTc4OTI3NjUxMywiaWF0IjoxNzg5MjQ3NzEzLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.-cZkFOnvyLDgkisaTT1J8z1Qhve97AAUePjIcMppGYY', '::1', '2026-09-12 15:15:14', NULL, 1, '2026-09-12 15:15:14');
INSERT INTO `sesiones_usuarios` VALUES (247, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNThkZDJmZi01NzIyLTQyOTAtOGI1YS03NmMwYjAwM2YyYjkiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTI0Nzc2MCwiZXhwIjoxNzg5Mjc2NTYwLCJpYXQiOjE3ODkyNDc3NjAsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.OGFnK1wjPhF-rRjQ4y10zYSYuiHUQjpfY9ZVI44GtE4', '::1', '2026-09-12 15:16:00', NULL, 1, '2026-09-12 15:16:00');
INSERT INTO `sesiones_usuarios` VALUES (248, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NmEwNjM0YS0wZDIxLTQxMGUtYTFiMS05ODc5OTE4MmU0NjciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNDk3NDIsImV4cCI6MTc4OTI3ODU0MiwiaWF0IjoxNzg5MjQ5NzQyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.-JRXKbN3sQ3vJ0o4ZHQGJxrPoFXOgVLjV7cXjo2JXTc', '::1', '2026-09-12 15:49:02', NULL, 1, '2026-09-12 15:49:02');
INSERT INTO `sesiones_usuarios` VALUES (249, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYTBkZmEwYS0wM2U1LTRmZGItYmI2Mi02YWI5NDM2MjM4NGIiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MjUxMDY5LCJleHAiOjE3ODkyNzk4NjksImlhdCI6MTc4OTI1MTA2OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Iqbw7rQycv7LMWvZ5cNF42_uz6HPL4LESYspVp3aF30', '::1', '2026-09-12 16:11:09', NULL, 1, '2026-09-12 16:11:09');
INSERT INTO `sesiones_usuarios` VALUES (250, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYzA2MjY3Ny1kMWE0LTQ1M2MtOTE5Ny1iYzIzNmM1M2Y0NzEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNTExMDQsImV4cCI6MTc4OTI3OTkwNCwiaWF0IjoxNzg5MjUxMTA0LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.SgEroZeHgGED_YWPuJ17GDp-TGQTFb7DiurmMw03t8M', '::1', '2026-09-12 16:11:44', NULL, 1, '2026-09-12 16:11:44');
INSERT INTO `sesiones_usuarios` VALUES (251, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NGQ0Yjk1Yy1iZDgwLTRiNDYtYWZjMy0yY2YxNjIyMDJmNTgiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTI1MTQyMywiZXhwIjoxNzg5MjgwMjIzLCJpYXQiOjE3ODkyNTE0MjMsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.oIzF15huFRNMCpukG3fZrdD8sEJ0_fHJ1bCOyxocsjw', '::1', '2026-09-12 16:17:03', NULL, 1, '2026-09-12 16:17:03');
INSERT INTO `sesiones_usuarios` VALUES (252, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMGM1NzljMy1kOTUwLTQ1NjktYTM0Ny1jM2Q2NTdiZjA5M2QiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNTE0ODYsImV4cCI6MTc4OTI4MDI4NiwiaWF0IjoxNzg5MjUxNDg2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.HQKTqhFq7MKDCq9our-znWmnOwF5fKV70i0MhWxlPEk', '::1', '2026-09-12 16:18:06', NULL, 1, '2026-09-12 16:18:06');
INSERT INTO `sesiones_usuarios` VALUES (253, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMjNlYjBlMy02ZGU2LTQ0MmMtYjJlNy1iMzNhMDNmMDgxNmMiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5MjUxNTU5LCJleHAiOjE3ODkyODAzNTksImlhdCI6MTc4OTI1MTU1OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.6J6zOm1rdnRLTuF7TreNdsw_TcirhgYtLEhz57j2tB0', '::1', '2026-09-12 16:19:19', NULL, 1, '2026-09-12 16:19:19');
INSERT INTO `sesiones_usuarios` VALUES (254, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMDM5NjQxNS01YWFjLTRlNjgtOWM3Yy00MjAwOTMxMTBlMzEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTI1MjEwNSwiZXhwIjoxNzg5MjgwOTA1LCJpYXQiOjE3ODkyNTIxMDUsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.jkVg3_NpSjxBBsLAAMXlu2wzh143Tlx_yvKNOPe7BII', '::1', '2026-09-12 16:28:25', NULL, 1, '2026-09-12 16:28:25');
INSERT INTO `sesiones_usuarios` VALUES (255, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNjAzNjk1YS05MDk1LTQwYTUtYjNjNC1hMDJiODcwMjgzNTAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNTIxMjIsImV4cCI6MTc4OTI4MDkyMiwiaWF0IjoxNzg5MjUyMTIyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.c0LUzJRy3PcM7dXjRNHj2s33ih9xhl4k5eN_y7T57vs', '::1', '2026-09-12 16:28:43', NULL, 1, '2026-09-12 16:28:43');
INSERT INTO `sesiones_usuarios` VALUES (256, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZDgyNTIyMC1mOThkLTQzMjYtOWM5My0yZTkwMzY0NTNiNGUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTI1MjEyNywiZXhwIjoxNzg5MjgwOTI3LCJpYXQiOjE3ODkyNTIxMjcsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.EIiN2ImHaLpoXt8xFWA4bAqxuB96ayNrPVGNf8rS0Jc', '::1', '2026-09-12 16:28:47', NULL, 1, '2026-09-12 16:28:47');
INSERT INTO `sesiones_usuarios` VALUES (257, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMjg1Yzg5Yy0zMDU1LTQ3ZWItYmEyMC0yOTc4ZTBiOWZiNjgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNTIxNTYsImV4cCI6MTc4OTI4MDk1NiwiaWF0IjoxNzg5MjUyMTU2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.WbDdiy7KWSaFQiLjFo3eivtgDSJ0Tjm-A9sY24Ir8SA', '::1', '2026-09-12 16:29:17', NULL, 1, '2026-09-12 16:29:17');
INSERT INTO `sesiones_usuarios` VALUES (258, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NDdiOWFkYS05OTQ1LTRhNjYtODU0YS0yMjlmYmM0YzBjZjAiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTI1MjE3NiwiZXhwIjoxNzg5MjgwOTc2LCJpYXQiOjE3ODkyNTIxNzYsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.o8ukVzOeVfQSMDXYHQ94tLxHz-7vGnRadhpl6GEaVnM', '::1', '2026-09-12 16:29:36', NULL, 1, '2026-09-12 16:29:36');
INSERT INTO `sesiones_usuarios` VALUES (259, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3Mjg1NWUzNy1iZGQ5LTQ0MDgtOWI0MC0xMjIzZjc1NDM1ZjAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNTIzNjcsImV4cCI6MTc4OTI4MTE2NywiaWF0IjoxNzg5MjUyMzY3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.RheQ_yaL8sKCnnPJtj4mVwt_QQOM5vwv3HMHJmGoQL0', '::1', '2026-09-12 16:32:47', NULL, 1, '2026-09-12 16:32:47');
INSERT INTO `sesiones_usuarios` VALUES (260, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MjE2NmUzNy0xN2Q1LTRhM2UtOTUzNS0yNGE0YzM0NWYyNzAiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5MjUyMzg1LCJleHAiOjE3ODkyODExODUsImlhdCI6MTc4OTI1MjM4NSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.6T4DZpZcjv5ztZI2_HPnrrqzI71pa2FPu4vciuwfpTA', '::1', '2026-09-12 16:33:06', NULL, 1, '2026-09-12 16:33:06');
INSERT INTO `sesiones_usuarios` VALUES (261, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MzcyODI2ZS04N2MwLTQzYWUtYWUxZC00ODFhYjZjYjg4MTUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTI1MjU4NiwiZXhwIjoxNzg5MjgxMzg2LCJpYXQiOjE3ODkyNTI1ODYsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.36Qxp-aIFNbpdP4Pp4-APTqsP_826xORXcngGmHlIxA', '::1', '2026-09-12 16:36:26', NULL, 1, '2026-09-12 16:36:26');
INSERT INTO `sesiones_usuarios` VALUES (262, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NWJlMGExNS1lYmVkLTRkOWMtODYwNi04NmYwN2FiMGFhNDUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNTI2MjEsImV4cCI6MTc4OTI4MTQyMSwiaWF0IjoxNzg5MjUyNjIxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.DUGRjShd9iqeVELeDSKhhk22tDQl9snaoBaOdHgFdI8', '::1', '2026-09-12 16:37:01', NULL, 1, '2026-09-12 16:37:01');
INSERT INTO `sesiones_usuarios` VALUES (263, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwY2JlOTc4ZS1kMGM0LTRmMTgtODZkNC00ZWQ0ZjA5ZDkyNmUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNTI2NDcsImV4cCI6MTc4OTI4MTQ0NywiaWF0IjoxNzg5MjUyNjQ3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.w5gtQV8nX1bt-6yaoSz-Qo5rmonDQe3ETJmdeYT1H5Y', '::1', '2026-09-12 16:37:28', NULL, 1, '2026-09-12 16:37:28');
INSERT INTO `sesiones_usuarios` VALUES (264, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2Yjc0MGJkMS0xMjYyLTRjN2YtOTlmMS0xYzRjYWNhNmFiMmMiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5MjUyNzMyLCJleHAiOjE3ODkyODE1MzIsImlhdCI6MTc4OTI1MjczMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.KCEMTOPxbZ6klttAA9X7RKhJE8HejbjzM0kTWKx4QXA', '::1', '2026-09-12 16:38:52', NULL, 1, '2026-09-12 16:38:52');
INSERT INTO `sesiones_usuarios` VALUES (265, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiOGY4NDE1OC1hMzVkLTQ5MTItYTU3Yy1hMWQ1ZmM3YWM3ODkiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNTI3NzcsImV4cCI6MTc4OTI4MTU3NywiaWF0IjoxNzg5MjUyNzc3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.qxWZGjRDE2wXff0CAun1oCUJfZU6rMU3QNzrNFHEITY', '::1', '2026-09-12 16:39:38', NULL, 1, '2026-09-12 16:39:38');
INSERT INTO `sesiones_usuarios` VALUES (266, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYTFmNDJhYi0zZTExLTRmODgtOWIzNy1iZjMwMzQzNWE4YmEiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5MjUyODAwLCJleHAiOjE3ODkyODE2MDAsImlhdCI6MTc4OTI1MjgwMCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.3ipdLi0ctnwacnxnJrscwcobSGrQh0OHyQ95ankRKP8', '::1', '2026-09-12 16:40:01', NULL, 1, '2026-09-12 16:40:01');
INSERT INTO `sesiones_usuarios` VALUES (267, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlY2RmNGQyMy1hMmRkLTQwZTgtYmQxMi1kNDM5MmI2MmMyMzEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkyNTI4MTEsImV4cCI6MTc4OTI4MTYxMSwiaWF0IjoxNzg5MjUyODExLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.IbE_HR1-3rujhBkK7mne8bUitdKeGPTkiLbHe1RlHSc', '::1', '2026-09-12 16:40:12', NULL, 1, '2026-09-12 16:40:12');
INSERT INTO `sesiones_usuarios` VALUES (268, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyYzE2ZWE3MC1jYzI4LTQ3MTUtYjVkYy1hZTk2MTZjZWEzZjYiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5MjUyODMxLCJleHAiOjE3ODkyODE2MzEsImlhdCI6MTc4OTI1MjgzMSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.IjFZ1kZdGAqSCyf_ciYy1lBimicaXQPPU9rmqh4rQow', '::1', '2026-09-12 16:40:31', NULL, 1, '2026-09-12 16:40:31');
INSERT INTO `sesiones_usuarios` VALUES (269, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MzBjMDhjYS04MDYzLTQ2MjgtOGQ2NC0zMGNhYmM0ZTU2ZDQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODkzMTIwODYsImV4cCI6MTc4OTM0MDg4NiwiaWF0IjoxNzg5MzEyMDg2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.4A-7JUjwZYsjZgnSwv9FAe8x-Krc0xY4nTrexwoOu5s', '::1', '2026-09-13 09:08:06', NULL, 1, '2026-09-13 09:08:06');
INSERT INTO `sesiones_usuarios` VALUES (270, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlY2E0MjdlYi0xYTZkLTRiNjctYjRhNS04ZDY5NzNhMWJiMjAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2MTQ3MjIsImV4cCI6MTc4OTY0MzUyMiwiaWF0IjoxNzg5NjE0NzIyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.GvFUhoyuPeO1XeJGuWYjzItN0DHBs6S__ARevascBJE', '::1', '2026-09-16 21:12:03', NULL, 1, '2026-09-16 21:12:03');
INSERT INTO `sesiones_usuarios` VALUES (271, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZWUxYzJhMi1mZDBlLTQyN2MtYWY4MC0xZWZiYjk4NjcyNGUiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5NjE0NzQwLCJleHAiOjE3ODk2NDM1NDAsImlhdCI6MTc4OTYxNDc0MCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.8bRKHDOzZXIPNeZc4hIicq4m-tw3y2a-7LvK7VFmMys', '::1', '2026-09-16 21:12:21', NULL, 1, '2026-09-16 21:12:21');
INSERT INTO `sesiones_usuarios` VALUES (272, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0Y2E2ZDczNS1kOTY0LTRmMzAtYjM4OC1mYWMyOWY1NDk2NjYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2MTQ4MDIsImV4cCI6MTc4OTY0MzYwMiwiaWF0IjoxNzg5NjE0ODAyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.LtN5AOaYppL7Lh7YAI8nrMPnvr6A3DA-XsDtQ2Sx8es', '::1', '2026-09-16 21:13:22', NULL, 1, '2026-09-16 21:13:22');
INSERT INTO `sesiones_usuarios` VALUES (273, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMmM2NWNlZC1kZWU2LTQ3MWUtYTUwNS1lMTA4MTM2MDdkYWQiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5NjE0ODIwLCJleHAiOjE3ODk2NDM2MjAsImlhdCI6MTc4OTYxNDgyMCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.1AcsETNkubzXzOIzys2BmmuPs5zpVXy5voqz2HI14cA', '::1', '2026-09-16 21:13:41', NULL, 1, '2026-09-16 21:13:41');
INSERT INTO `sesiones_usuarios` VALUES (274, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1N2MxMmNiMS1iMWE3LTQ3ODYtYWFhZS0zMGZlNDYwZDQwNTAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2MjEzMDQsImV4cCI6MTc4OTY1MDEwNCwiaWF0IjoxNzg5NjIxMzA0LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.nGVGjEeCtKe7UX4TkbEB4BrHpdGxc1hx0aC_DYDp3IQ', '::1', '2026-09-16 23:01:45', NULL, 1, '2026-09-16 23:01:45');
INSERT INTO `sesiones_usuarios` VALUES (275, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYmNhZjU2OC04YzA2LTQ1NTAtYmIxZi1kYzg0NDVlMjFhOTgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2MjE0MzUsImV4cCI6MTc4OTY1MDIzNSwiaWF0IjoxNzg5NjIxNDM1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.cw1EptiYtx4c3eYJwb4184QouQ6QZpdB8aLtAoe5svE', '::1', '2026-09-16 23:03:55', NULL, 1, '2026-09-16 23:03:55');
INSERT INTO `sesiones_usuarios` VALUES (276, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYTEzMDA2ZC0xNjIwLTQ3MjItOWUwYi0wY2RlMzI3ZTZmMmMiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5NjIxNDU2LCJleHAiOjE3ODk2NTAyNTYsImlhdCI6MTc4OTYyMTQ1NiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.WOzBnXSIMMyhX7OHCFzMMRAtoDcU5ZznaIEhCpx2aso', '::1', '2026-09-16 23:04:17', NULL, 1, '2026-09-16 23:04:17');
INSERT INTO `sesiones_usuarios` VALUES (277, 27, '2026-00037-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YTlkOGQ4OS1kYjMwLTQ0YTEtYWE4Mi0zNjFjMDJmN2U2YjQiLCJuYW1laWQiOiIyNyIsInVuaXF1ZV9uYW1lIjoiMjAyNi0wMDAzNy1JTkEiLCJyb2xlIjoiRXN0dWRpYW50ZSIsIm5iZiI6MTc4OTYyMTY1MiwiZXhwIjoxNzg5NjUwNDUyLCJpYXQiOjE3ODk2MjE2NTIsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.zU71Lit3s-QPNzNV2QfFxSpq7Dw8tKrmxr-YHPw8U9o', '::1', '2026-09-16 23:07:33', NULL, 1, '2026-09-16 23:07:33');
INSERT INTO `sesiones_usuarios` VALUES (278, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYzBmZjliMS03MzczLTQ2MGMtOTNlYi0zMjQyMDExODZiOTEiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5NjIxOTAwLCJleHAiOjE3ODk2NTA3MDAsImlhdCI6MTc4OTYyMTkwMCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.OS8MUVqMqesvLfQzH_zW13yTs8W8K2RTxmjS7pCUpjM', '::1', '2026-09-16 23:11:40', NULL, 1, '2026-09-16 23:11:40');
INSERT INTO `sesiones_usuarios` VALUES (279, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YTRiNjlmMC1kZTQ1LTQ1OTAtYjViZS02ZjFmYzM4NjkxZDEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTYyMTk1MCwiZXhwIjoxNzg5NjUwNzUwLCJpYXQiOjE3ODk2MjE5NTAsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.2JaGFZxHJZy4FCvuSS7mdhs7sEmjBP4PoF4Da7dlij8', '::1', '2026-09-16 23:12:30', NULL, 1, '2026-09-16 23:12:30');
INSERT INTO `sesiones_usuarios` VALUES (280, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNzM0MjNhNS1hMjMxLTQwMmEtODFiNS0zY2M5ZGU0OTU3NTAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2MjIxNDUsImV4cCI6MTc4OTY1MDk0NSwiaWF0IjoxNzg5NjIyMTQ1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.9VyIqoghVvGbC1Xj9KJGlUsdO-G4vDwcK3lqxnKoqtE', '::1', '2026-09-16 23:15:46', NULL, 1, '2026-09-16 23:15:46');
INSERT INTO `sesiones_usuarios` VALUES (281, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYmFiODFlMS1mZWM5LTRlNTctOTIxYy1hZTk4YWFjYzY0NWMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2MjM2MjUsImV4cCI6MTc4OTY1MjQyNSwiaWF0IjoxNzg5NjIzNjI1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.KCkWzlSkpOgY2pmyt8iz-Ynd02omk1O_M_LvCSnMKwE', '::1', '2026-09-16 23:40:25', NULL, 1, '2026-09-16 23:40:25');
INSERT INTO `sesiones_usuarios` VALUES (282, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyOWNkYzViNC0wNmY3LTQ0M2YtODkxYy1lNjEzMDk4M2I2YTkiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2MjM4NDksImV4cCI6MTc4OTY1MjY0OSwiaWF0IjoxNzg5NjIzODQ5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.kudxaTtZiZsJtH_wAwu7fQwK3EIU2coy3FTzeizemBU', '::1', '2026-09-16 23:44:09', NULL, 1, '2026-09-16 23:44:09');
INSERT INTO `sesiones_usuarios` VALUES (283, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYWQ3N2I0Ny04MTM0LTQ1NmYtYmY0ZS0wYjE4MDc0MDEyNGEiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5NjIzODcxLCJleHAiOjE3ODk2NTI2NzEsImlhdCI6MTc4OTYyMzg3MSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.0fSi6tIuDUy4IuKAngWN6dSy5VHXoUGgpq9ioMAVCpI', '::1', '2026-09-16 23:44:32', NULL, 1, '2026-09-16 23:44:32');
INSERT INTO `sesiones_usuarios` VALUES (284, 6, 'ENC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2M2MwMjJjMi0wMmRhLTQwZGEtYTlhZS1iZTUyMjQ4YThmMGUiLCJuYW1laWQiOiI2IiwidW5pcXVlX25hbWUiOiJFTkMwMDEiLCJyb2xlIjoiRW5jYXJnYWRvIiwibmJmIjoxNzg5NjI0MDYxLCJleHAiOjE3ODk2NTI4NjEsImlhdCI6MTc4OTYyNDA2MSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.jI6IbgtL4gPUwYECF6wo7OmdqzJbevXn7O5f43ZXfdo', '::1', '2026-09-16 23:47:41', NULL, 1, '2026-09-16 23:47:41');
INSERT INTO `sesiones_usuarios` VALUES (285, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwOTUyMGFjZS1hMmVlLTRmNmYtOTc3Ni0yNWYyZWY0NmM1YmQiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5NjI0MTM5LCJleHAiOjE3ODk2NTI5MzksImlhdCI6MTc4OTYyNDEzOSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.-bXaxf0m9VWkPtLwj9GtKjBawAwxUa3DWS0j5bXzkvk', '::1', '2026-09-16 23:49:00', NULL, 1, '2026-09-16 23:49:00');
INSERT INTO `sesiones_usuarios` VALUES (286, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYjZlNjhkYy1jZTNlLTQ3NTktYjQ1NS03ZmI3ZWU4NGYzZjYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2NjMxNjgsImV4cCI6MTc4OTY5MTk2OCwiaWF0IjoxNzg5NjYzMTY4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.823RBbMVB-iz0zJzelqgIzAAueptLaCd1nhDlGGHTYw', '::1', '2026-09-17 10:39:28', NULL, 1, '2026-09-17 10:39:28');
INSERT INTO `sesiones_usuarios` VALUES (287, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMDAzNDhjMi1lNjVlLTQ0MzUtYTFkZS1jNGI5YTczOGNkMmIiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5NjYzMjAzLCJleHAiOjE3ODk2OTIwMDMsImlhdCI6MTc4OTY2MzIwMywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.8BBKJakvwnmNm5n68LJDXuiZE31qxosKaD2wSYDcALo', '::1', '2026-09-17 10:40:03', NULL, 1, '2026-09-17 10:40:03');
INSERT INTO `sesiones_usuarios` VALUES (288, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOWQ3ZjE4Zi0wNmEyLTQ1NzktODQ3NC05Zjk1Y2NlZjQ5YjAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2NjQ3MjYsImV4cCI6MTc4OTY5MzUyNiwiaWF0IjoxNzg5NjY0NzI2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.KA4bcqIbu9qiFAB4MEROmA3zkT3jEGmXNn3wBdgmlC0', '::1', '2026-09-17 11:05:26', NULL, 1, '2026-09-17 11:05:26');
INSERT INTO `sesiones_usuarios` VALUES (289, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZjlhZDgwYy0yYWFlLTQxMDAtOTcyMy1kZjkwMDZhOGNkOGYiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5NjY1NTk5LCJleHAiOjE3ODk2OTQzOTksImlhdCI6MTc4OTY2NTU5OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.0mKOeLaillSRhYzzUwLtweTZIH_PWInz-i7FISrFlWU', '::1', '2026-09-17 11:19:59', NULL, 1, '2026-09-17 11:19:59');
INSERT INTO `sesiones_usuarios` VALUES (290, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NjdmYzYzOC03YzA0LTQ2YmUtOTk1NS00ZDdmMDI1NTZiZjciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2NjU4MjMsImV4cCI6MTc4OTY5NDYyMywiaWF0IjoxNzg5NjY1ODIzLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.GI7eTGBYnpetkyOXi3n1Gski2fTtVENsfjFDnGQ0U1s', '::1', '2026-09-17 11:23:43', NULL, 1, '2026-09-17 11:23:43');
INSERT INTO `sesiones_usuarios` VALUES (291, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2FlMGRlNy04YWQ1LTQwODYtODZjOS1hODg0NzM0MzgyNjYiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg5NjY1OTI2LCJleHAiOjE3ODk2OTQ3MjYsImlhdCI6MTc4OTY2NTkyNiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.mEa3jrYrrr-QM572dUgWapFU_QX-IgU9HqV8EfLXpoo', '::1', '2026-09-17 11:25:27', NULL, 1, '2026-09-17 11:25:27');
INSERT INTO `sesiones_usuarios` VALUES (292, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMTlhZWZhYi0yYTczLTQ3ZDgtODljOS03MzNkYjdiZmM1NzgiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5NjY2MTkyLCJleHAiOjE3ODk2OTQ5OTIsImlhdCI6MTc4OTY2NjE5MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.KJvKsNEM2IDSVye1qZqrjE_N1JfcS70PGB6oCpCwT7o', '::1', '2026-09-17 11:29:53', NULL, 1, '2026-09-17 11:29:53');
INSERT INTO `sesiones_usuarios` VALUES (293, 30, '2026-00040-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZWMyNzY2My1hYzA5LTRjYmItOTE5Ni03YWM5YzI2ZWMzMGMiLCJuYW1laWQiOiIzMCIsInVuaXF1ZV9uYW1lIjoiMjAyNi0wMDA0MC1JTkEiLCJyb2xlIjoiRXN0dWRpYW50ZSIsIm5iZiI6MTc4OTY2NjM3NywiZXhwIjoxNzg5Njk1MTc3LCJpYXQiOjE3ODk2NjYzNzcsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.CucWfnP-sBxfkaOXTW1u0WuC3BJptEmFEx_gsIsZo4o', '::1', '2026-09-17 11:32:57', NULL, 1, '2026-09-17 11:32:57');
INSERT INTO `sesiones_usuarios` VALUES (294, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMjA5N2U3My01NjVhLTQ0N2QtODJlMi1lMWM1M2U5ZjI4OWMiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTY2NjQxOCwiZXhwIjoxNzg5Njk1MjE4LCJpYXQiOjE3ODk2NjY0MTgsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.P7H3XkRZsJOauJAWjVAQlFrJ7SkV8BGIag2ZalKyHK0', '::1', '2026-09-17 11:33:38', NULL, 1, '2026-09-17 11:33:38');
INSERT INTO `sesiones_usuarios` VALUES (295, 30, '2026-00040-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNzMxYzczZS1lZDlkLTQ1MDItOTI5Yy02NDIwYjMyYzMwYzgiLCJuYW1laWQiOiIzMCIsInVuaXF1ZV9uYW1lIjoiMjAyNi0wMDA0MC1JTkEiLCJyb2xlIjoiRXN0dWRpYW50ZSIsIm5iZiI6MTc4OTY2NjQ1MiwiZXhwIjoxNzg5Njk1MjUyLCJpYXQiOjE3ODk2NjY0NTIsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.f0Qj8RcWl2uBWaarsekiMfc0olaVuwp_5pqpGcZR5oM', '::1', '2026-09-17 11:34:13', NULL, 1, '2026-09-17 11:34:13');
INSERT INTO `sesiones_usuarios` VALUES (296, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MDA1ZTdhOS02Yzk2LTQ5OWQtYjBhZi00MjVkMTE4ODM2OTQiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTY2NjgyOCwiZXhwIjoxNzg5Njk1NjI4LCJpYXQiOjE3ODk2NjY4MjgsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.7sEBad3LeAkgGpKqMsFcfGR4bSIB9YAuUVLH-OGg4wA', '::1', '2026-09-17 11:40:28', NULL, 1, '2026-09-17 11:40:28');
INSERT INTO `sesiones_usuarios` VALUES (297, 30, '2026-00040-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxOGIzZjE2Ny1mNTJhLTQ2MmYtODI1Ni00NTAyMzBiYjY3YTYiLCJuYW1laWQiOiIzMCIsInVuaXF1ZV9uYW1lIjoiMjAyNi0wMDA0MC1JTkEiLCJyb2xlIjoiRXN0dWRpYW50ZSIsIm5iZiI6MTc4OTY2Njg1NSwiZXhwIjoxNzg5Njk1NjU1LCJpYXQiOjE3ODk2NjY4NTUsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0._ZIMIBuPXetchNKrnI72Q4vrw8NdBPUVhVR7twaJVyM', '::1', '2026-09-17 11:40:55', NULL, 1, '2026-09-17 11:40:55');
INSERT INTO `sesiones_usuarios` VALUES (298, 6, 'ENC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNGUwODBkMS1jNzJhLTRlYTQtODRkYS1lNmVlMWMxOTNiMTEiLCJuYW1laWQiOiI2IiwidW5pcXVlX25hbWUiOiJFTkMwMDEiLCJyb2xlIjoiRW5jYXJnYWRvIiwibmJmIjoxNzg5NjY2ODczLCJleHAiOjE3ODk2OTU2NzMsImlhdCI6MTc4OTY2Njg3MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.rbBkMq78nWnzMJtoOF3GVnMQkxqbSVIe2jssw64bCp8', '::1', '2026-09-17 11:41:13', NULL, 1, '2026-09-17 11:41:13');
INSERT INTO `sesiones_usuarios` VALUES (299, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZTM5MzQwMC1iZGY2LTRmZDctODUzYi0xNmYyYzBkNDc2ZjQiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTY2NjkzMywiZXhwIjoxNzg5Njk1NzMzLCJpYXQiOjE3ODk2NjY5MzMsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.dR_hkbBZp8xfRMDtPRLwcPx4XV_NHKCmNwF-M3090gs', '::1', '2026-09-17 11:42:14', NULL, 1, '2026-09-17 11:42:14');
INSERT INTO `sesiones_usuarios` VALUES (300, 6, 'ENC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhYTg1ZDA3ZC0wZDdlLTQyNjAtODQzYi01ODczMmU5ZDU0YjgiLCJuYW1laWQiOiI2IiwidW5pcXVlX25hbWUiOiJFTkMwMDEiLCJyb2xlIjoiRW5jYXJnYWRvIiwibmJmIjoxNzg5NjY2OTY1LCJleHAiOjE3ODk2OTU3NjUsImlhdCI6MTc4OTY2Njk2NSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.0rx1tOc-xfCO-g1JWrejX4gTLpHyDjAv3uQ13DjOAaE', '::1', '2026-09-17 11:42:46', NULL, 1, '2026-09-17 11:42:46');
INSERT INTO `sesiones_usuarios` VALUES (301, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3Zjk1OTY5OC02Y2I2LTQ5YzYtYWZmNS1jOGI5ZmU2NDE5N2MiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTY2NzAxOSwiZXhwIjoxNzg5Njk1ODE5LCJpYXQiOjE3ODk2NjcwMTksImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.vN5RRSmJPQTyWOAvFz09a9uPBYq9E7nJfvnfG54OmZ8', '::1', '2026-09-17 11:43:39', NULL, 1, '2026-09-17 11:43:39');
INSERT INTO `sesiones_usuarios` VALUES (302, 6, 'ENC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MThkOTAzMy1iZDgwLTRlYjAtYmQ1YS1lMWJiNTYxMWU4ZmQiLCJuYW1laWQiOiI2IiwidW5pcXVlX25hbWUiOiJFTkMwMDEiLCJyb2xlIjoiRW5jYXJnYWRvIiwibmJmIjoxNzg5NjY3MDMyLCJleHAiOjE3ODk2OTU4MzIsImlhdCI6MTc4OTY2NzAzMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.88PQ8syLSY46dBvCo6gYI-2xlWyCEPQRApBdk0eL8pQ', '::1', '2026-09-17 11:43:52', NULL, 1, '2026-09-17 11:43:52');
INSERT INTO `sesiones_usuarios` VALUES (303, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNWVkMjY4OS02ZDQ4LTRiMGMtYmUzNy05MjdkNTU3NWIzNjgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2NjcyNjYsImV4cCI6MTc4OTY5NjA2NiwiaWF0IjoxNzg5NjY3MjY2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.YmJPqBPoBj626KS5N0Vq3eAsG5T-ueW-IarJqL75GiE', '::1', '2026-09-17 11:47:47', NULL, 1, '2026-09-17 11:47:47');
INSERT INTO `sesiones_usuarios` VALUES (304, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZDQxZmE1MS0xOTNiLTQ5ODItOTMxMy00YTUzZDE3MjdkM2UiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTY2NzI3MiwiZXhwIjoxNzg5Njk2MDcyLCJpYXQiOjE3ODk2NjcyNzIsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.WyfrAIieBDBaAhnJiyqc_TKeGTo13B3kuZFHMeSbhlM', '::1', '2026-09-17 11:47:53', NULL, 1, '2026-09-17 11:47:53');
INSERT INTO `sesiones_usuarios` VALUES (305, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNWI3NjEwOS1hNzBlLTQwZjYtYWRiMy0xMDJlYTkwODY1ODEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2NjcyOTQsImV4cCI6MTc4OTY5NjA5NCwiaWF0IjoxNzg5NjY3Mjk0LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.jCdn1HSLktxQDMWtqe9__hxxc1X9lCJBQ1QpzVWYM0M', '::1', '2026-09-17 11:48:14', NULL, 1, '2026-09-17 11:48:14');
INSERT INTO `sesiones_usuarios` VALUES (306, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NGUzYzUzMy1iYTFhLTRmNzktOTljYi05ZTQxOTEzZDRmY2QiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTY2NzU3MCwiZXhwIjoxNzg5Njk2MzcwLCJpYXQiOjE3ODk2Njc1NzAsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.j2rML2Xuvd2rZyNwgjh5TEOFwNSlVrw5VZIxPWneC0s', '::1', '2026-09-17 11:52:51', NULL, 1, '2026-09-17 11:52:51');
INSERT INTO `sesiones_usuarios` VALUES (307, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYjk4MzM1My1jYTEzLTQ5YzctYjlhNS1jMDE1YzYzZmU1NDgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk2Njc1NzgsImV4cCI6MTc4OTY5NjM3OCwiaWF0IjoxNzg5NjY3NTc4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.c_uomrqJoiHdEUywm4Bl5GhFZ3Ml7n8UDVGfIEjSt1A', '::1', '2026-09-17 11:52:58', NULL, 1, '2026-09-17 11:52:58');
INSERT INTO `sesiones_usuarios` VALUES (308, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ODY0NDE3Zi02NzBmLTQ1NDUtYTg1ZC1jMDRhNzYzMjNkMzciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4Mzc5NTQsImV4cCI6MTc4OTg2Njc1NCwiaWF0IjoxNzg5ODM3OTU0LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.kZEQfBCg0nP4mYos7IXPsaf0-ZD-vZIWVhrila8hew4', '::1', '2026-09-19 11:12:35', NULL, 1, '2026-09-19 11:12:35');
INSERT INTO `sesiones_usuarios` VALUES (309, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZGYzZDdhMC00Y2IxLTQ0ZWMtOGU2Zi1lNWNlYWE1OTZiZjgiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTgzODU5NiwiZXhwIjoxNzg5ODY3Mzk2LCJpYXQiOjE3ODk4Mzg1OTYsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.7tyjy0AujmFPiVf7VYKqRazAIlGRzxrFYPBE9l20So0', '::1', '2026-09-19 11:23:17', NULL, 1, '2026-09-19 11:23:17');
INSERT INTO `sesiones_usuarios` VALUES (310, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNmU0NGQ2YS1jMGIwLTQ2OWItYTk0Mi1kZDFlNGQ5NGE2MGUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4Mzg2NDMsImV4cCI6MTc4OTg2NzQ0MywiaWF0IjoxNzg5ODM4NjQzLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.oMxs_L9zmftNK2vd7HlIlvVmy4BxFyDTynzH7KDxuxI', '::1', '2026-09-19 11:24:03', NULL, 1, '2026-09-19 11:24:03');
INSERT INTO `sesiones_usuarios` VALUES (311, 29, '2026-00039-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlZDMwZThmYS0yOGQ4LTQ5ZWItODhmNC0zYTBkMzhhNThjMGIiLCJuYW1laWQiOiIyOSIsInVuaXF1ZV9uYW1lIjoiMjAyNi0wMDAzOS1JTkEiLCJyb2xlIjoiRXN0dWRpYW50ZSIsIm5iZiI6MTc4OTgzODcwOCwiZXhwIjoxNzg5ODY3NTA4LCJpYXQiOjE3ODk4Mzg3MDgsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.CRsdAokGxb8WKCcTqFNQWhqnGJniGc-gXecp67TFZHY', '::1', '2026-09-19 11:25:08', NULL, 1, '2026-09-19 11:25:08');
INSERT INTO `sesiones_usuarios` VALUES (312, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZjkxYWViYS1jNDdmLTQyMWYtYWY5ZS02ZmQ4NGQ1MmMwZjUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4Mzg3NTksImV4cCI6MTc4OTg2NzU1OSwiaWF0IjoxNzg5ODM4NzU5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.S9AONyBtOQFGojqv5MuFzuLLFjFk_93tu7YxFMdJlKI', '::1', '2026-09-19 11:25:59', NULL, 1, '2026-09-19 11:25:59');
INSERT INTO `sesiones_usuarios` VALUES (313, 29, '2026-00039-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMTY1NzU3ZC05NWRmLTQ5YWEtYTVlNS05YjUzYzEyOTJhYjAiLCJuYW1laWQiOiIyOSIsInVuaXF1ZV9uYW1lIjoiMjAyNi0wMDAzOS1JTkEiLCJyb2xlIjoiRXN0dWRpYW50ZSIsIm5iZiI6MTc4OTgzOTIwMSwiZXhwIjoxNzg5ODY4MDAxLCJpYXQiOjE3ODk4MzkyMDEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.ULM6H2v9R5lXV_WTbYFa1jqJdWoDP8LEi47ZtmBfXzc', '::1', '2026-09-19 11:33:21', NULL, 1, '2026-09-19 11:33:21');
INSERT INTO `sesiones_usuarios` VALUES (314, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NjM1N2ZkMC0yMWZiLTQ3NjEtOTc4Ny04YzNiN2FmYzgxNmIiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5ODM5MjMzLCJleHAiOjE3ODk4NjgwMzMsImlhdCI6MTc4OTgzOTIzMywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Wkm5iT6MSwWqajhJ1i1y1AJ8C73LpumtFpqgud_Os9Y', '::1', '2026-09-19 11:33:54', NULL, 1, '2026-09-19 11:33:54');
INSERT INTO `sesiones_usuarios` VALUES (315, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiODgwN2RiNS03NmZjLTQyMjMtYTk1YS1jYWU3ZDM5MGNkOGUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4Mzk3ODcsImV4cCI6MTc4OTg2ODU4NywiaWF0IjoxNzg5ODM5Nzg3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.RxXgB5EccBQISwDjDDtBAV7YiCvk5J86TS7h0uzs7Gg', '::1', '2026-09-19 11:43:07', NULL, 1, '2026-09-19 11:43:07');
INSERT INTO `sesiones_usuarios` VALUES (316, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNzY5NTEyOC04NzljLTQ3NmEtYmY3Yy03NWU3YWRiZTYxY2YiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5ODM5ODM2LCJleHAiOjE3ODk4Njg2MzYsImlhdCI6MTc4OTgzOTgzNiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.KBPwEvmCk7WTvRDu7WW46h-l89Eki5m6E7GHX7giTew', '::1', '2026-09-19 11:43:57', NULL, 1, '2026-09-19 11:43:57');
INSERT INTO `sesiones_usuarios` VALUES (317, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NzRiMmE0Ny0zOWMxLTRmYWYtYTExNS03NTc3YWQ5ODU0ZTciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4Mzk4NTEsImV4cCI6MTc4OTg2ODY1MSwiaWF0IjoxNzg5ODM5ODUxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.3R8_QuFL56GIoWLtMMCIVo77b132ERHrpQ2FxSh_j2E', '::1', '2026-09-19 11:44:12', NULL, 1, '2026-09-19 11:44:12');
INSERT INTO `sesiones_usuarios` VALUES (318, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNDMyOWI3OS02NjVkLTQ0NzEtODE1My1lNjYwN2ZmNjk0MDkiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5ODM5ODcwLCJleHAiOjE3ODk4Njg2NzAsImlhdCI6MTc4OTgzOTg3MCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Jc99ZCzT7wcSzOiuJEpqjZq2HnU2nHRS3BVd9iOrYmY', '::1', '2026-09-19 11:44:31', NULL, 1, '2026-09-19 11:44:31');
INSERT INTO `sesiones_usuarios` VALUES (319, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYzg2MDMxMi1hZWMyLTQyZjctOTAxYi02ZmFkYjZjNzQyZWUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NDEwMTksImV4cCI6MTc4OTg2OTgxOSwiaWF0IjoxNzg5ODQxMDE5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.CA4T8wsATGnC1Ty0LkZeW2DnbXrYGmUUVH-RJf5rZQc', '::1', '2026-09-19 12:03:39', NULL, 1, '2026-09-19 12:03:39');
INSERT INTO `sesiones_usuarios` VALUES (320, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YjcyNzk4MC0wMjk2LTQzZTgtOTYzMS03ODU4MWVkMTJkNTgiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5ODUxMjQzLCJleHAiOjE3ODk4ODAwNDMsImlhdCI6MTc4OTg1MTI0MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.MYC5k0oiE33ZjPDiFW7T3QuxhISN3ZpSxRGVrPZq12A', '::1', '2026-09-19 14:54:03', NULL, 1, '2026-09-19 14:54:03');
INSERT INTO `sesiones_usuarios` VALUES (321, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNjE4MDAyYi0wMGQwLTQwMzEtODJmZS05NzYwZDA3N2Q5MjQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NTkzMzIsImV4cCI6MTc4OTg4ODEzMiwiaWF0IjoxNzg5ODU5MzMyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.P5YiY3RelFYMfhfBGbcGwpo3lpztQ9SOOcgFL6_HJJM', '::1', '2026-09-19 17:08:53', NULL, 1, '2026-09-19 17:08:53');
INSERT INTO `sesiones_usuarios` VALUES (322, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMmFkNWM5Zi0xOWM0LTRjNWEtODI3Ni1hMzZlZmMzNTc0ZWIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NTkzNTAsImV4cCI6MTc4OTg4ODE1MCwiaWF0IjoxNzg5ODU5MzUwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.4r6PeeARvzGgsQ_JJqpPSgyKrNDaUT85HeEzDZG4eiM', '::1', '2026-09-19 17:09:10', NULL, 1, '2026-09-19 17:09:10');
INSERT INTO `sesiones_usuarios` VALUES (323, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NjNiNjZmMC1hNGNhLTQyNTYtODhkNS05OTY1ZDMzYzJlZmYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NTkzNzIsImV4cCI6MTc4OTg4ODE3MiwiaWF0IjoxNzg5ODU5MzcyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.5ZIKjVZyf7WVcyuFtpUOHG9mntHnkQUytHYGVJnGH8c', '::1', '2026-09-19 17:09:33', NULL, 1, '2026-09-19 17:09:33');
INSERT INTO `sesiones_usuarios` VALUES (324, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTJlOWYxMi05Y2VjLTRjMTAtYjI3Yi0xYTZiZmE5ZGQyMWMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NTk2NTQsImV4cCI6MTc4OTg4ODQ1NCwiaWF0IjoxNzg5ODU5NjU0LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.orXv-PMQ4iurxrj-ZJAuZFFzhkjjYQ_Xz_1AInPaLvQ', '::1', '2026-09-19 17:14:15', NULL, 1, '2026-09-19 17:14:15');
INSERT INTO `sesiones_usuarios` VALUES (325, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OGUxMTVmNi04MDM3LTQwM2YtODIzMS0xYzk5ZmRkYmQwNjEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NTk2ODksImV4cCI6MTc4OTg4ODQ4OSwiaWF0IjoxNzg5ODU5Njg5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.wpGduH0-FQoeB9f2gE0ERFB3KskJwfatWsRT6rgJSz4', '::1', '2026-09-19 17:14:50', NULL, 1, '2026-09-19 17:14:50');
INSERT INTO `sesiones_usuarios` VALUES (326, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMzExNzYzYi03YmRjLTRmNzYtOGYzMC1jYzZlMzE5N2E0ZGQiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg5ODU5NzA2LCJleHAiOjE3ODk4ODg1MDYsImlhdCI6MTc4OTg1OTcwNiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.4R2Nvut7zcEaTSNCtosbiHfHoRMURgj1ug5E_rburb8', '::1', '2026-09-19 17:15:06', NULL, 1, '2026-09-19 17:15:06');
INSERT INTO `sesiones_usuarios` VALUES (327, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNjA4NTVmYy05ZjZlLTRiNmMtYjgwZS03YjY0NzVjYjBjYjgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NTk3OTksImV4cCI6MTc4OTg4ODU5OSwiaWF0IjoxNzg5ODU5Nzk5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.Z_n9YNgGhE-qGEfKscQRMb4S5wJwmk9cF68qwKgBLp8', '::1', '2026-09-19 17:16:40', NULL, 1, '2026-09-19 17:16:40');
INSERT INTO `sesiones_usuarios` VALUES (328, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNzM1ZGYyNC05ZDhkLTQyMmMtOTRhYy0xNmU3NDE0MmU2MDciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NjAxMDYsImV4cCI6MTc4OTg4ODkwNiwiaWF0IjoxNzg5ODYwMTA2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.Whf7_vkGXarKocQ2RjHHHr7jZj0pqky1Q5sKdBpevtU', '::1', '2026-09-19 17:21:47', NULL, 1, '2026-09-19 17:21:47');
INSERT INTO `sesiones_usuarios` VALUES (329, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYTJjMjI2YS0xZDEwLTRlZTUtYTNjOS01M2E4NGVhZWI3MDgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NjAyMDUsImV4cCI6MTc4OTg4OTAwNSwiaWF0IjoxNzg5ODYwMjA1LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.jt7gqripevHAZkKfJpJpefoyzbBTKYzOuTu68dL4o8w', '::1', '2026-09-19 17:23:25', NULL, 1, '2026-09-19 17:23:25');
INSERT INTO `sesiones_usuarios` VALUES (330, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMGEwYzIwYi0xYmU1LTQyZDYtOGZlYi0yZTUzZDRjYWNhODgiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NjAyNjksImV4cCI6MTc4OTg4OTA2OSwiaWF0IjoxNzg5ODYwMjY5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.yOXY87dKkexeFKzTr25b9DpsgwYek4viVAqFEur9Zvo', '::1', '2026-09-19 17:24:29', NULL, 1, '2026-09-19 17:24:29');
INSERT INTO `sesiones_usuarios` VALUES (331, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMGFkZGVjOS1kZGE4LTRiZTYtYTMzZS1mNDZjYTIyMjAyMzciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NjAyOTgsImV4cCI6MTc4OTg4OTA5OCwiaWF0IjoxNzg5ODYwMjk4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.B6IxUpBbEojnWIS55tf6F0HwwnG-C4xRVI0rnDBBbE0', '::1', '2026-09-19 17:24:58', NULL, 1, '2026-09-19 17:24:58');
INSERT INTO `sesiones_usuarios` VALUES (332, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlZTZkMTUxNi03YmZmLTQzZWQtOTE3Mi1jZGUwZTE4YzcyOWMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NjA0OTAsImV4cCI6MTc4OTg4OTI5MCwiaWF0IjoxNzg5ODYwNDkwLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.2shO0SyOPbHTit37nCe5xHtD30clfov0Jw1_z1fJhxE', '::1', '2026-09-19 17:28:11', NULL, 1, '2026-09-19 17:28:11');
INSERT INTO `sesiones_usuarios` VALUES (333, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZThmMTZhMS1jMzdhLTQ5NTMtOTliMS01YjgxYjJkNWNiYTMiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzg5ODYzMjI5LCJleHAiOjE3ODk4OTIwMjksImlhdCI6MTc4OTg2MzIyOSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.0qtAkS_L3p5-zNYJZsUjyVMhS1UFycKadYIaDyxcfAQ', '::1', '2026-09-19 18:13:49', NULL, 1, '2026-09-19 18:13:49');
INSERT INTO `sesiones_usuarios` VALUES (334, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZmZhZmI5Ny01MzE3LTQ4YTgtODZhMy0yNTAwNTUyYzQ1YjciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NjM0OTMsImV4cCI6MTc4OTg5MjI5MywiaWF0IjoxNzg5ODYzNDkzLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.ywsS7JL9vwMoV66ETVv6xM4m6HXF6_TuYPrQ7kQH6Mc', '::1', '2026-09-19 18:18:14', NULL, 1, '2026-09-19 18:18:14');
INSERT INTO `sesiones_usuarios` VALUES (335, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2MzY1ZTNlZC0yMWUzLTQ2NTQtYThjOS05MTk3ZDJiOWEwZmQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk4NjM5NTEsImV4cCI6MTc4OTg5Mjc1MSwiaWF0IjoxNzg5ODYzOTUxLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.TIJVqTcmCvp3DiNjavCcC44MikEQ47nJa7Sef3LTnXw', '::1', '2026-09-19 18:25:52', NULL, 1, '2026-09-19 18:25:52');
INSERT INTO `sesiones_usuarios` VALUES (336, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMWQzYjQ3Ni1iY2EzLTQxYTQtODljZC01MjFjYWRiZjMzMTIiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzg5ODY4MzI5LCJleHAiOjE3ODk4OTcxMjksImlhdCI6MTc4OTg2ODMyOSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.OsdR3fBca7hmVIrA6X2c7V0wmFRN-BvfJ-72Qj8bgFE', '::1', '2026-09-19 19:38:50', NULL, 1, '2026-09-19 19:38:50');
INSERT INTO `sesiones_usuarios` VALUES (337, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5Y2Q2YjczMC1lOTg4LTQyOTItOWNhMS0xNzY1ZjFkNDc3NjEiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTg2OTUyNSwiZXhwIjoxNzg5ODk4MzI1LCJpYXQiOjE3ODk4Njk1MjUsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.SG99KBgkwUEnQce3HGek4TEveUIHsc-dvr7fp6rBcY8', '::1', '2026-09-19 19:58:45', NULL, 1, '2026-09-19 19:58:45');
INSERT INTO `sesiones_usuarios` VALUES (338, 30, '2026-00040-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZjExYmU4ZS1mZTI1LTQwNGQtYWE4ZC04ODM0ZDI0OTRjN2YiLCJuYW1laWQiOiIzMCIsInVuaXF1ZV9uYW1lIjoiMjAyNi0wMDA0MC1JTkEiLCJyb2xlIjoiRXN0dWRpYW50ZSIsIm5iZiI6MTc4OTg3MjUyMiwiZXhwIjoxNzg5OTAxMzIyLCJpYXQiOjE3ODk4NzI1MjIsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.hz3HerSQMI1y1zZfnqtgkAUKyAHd5T60LVztlkQutwM', '::1', '2026-09-19 20:48:42', NULL, 1, '2026-09-19 20:48:42');
INSERT INTO `sesiones_usuarios` VALUES (339, 6, 'ENC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MDFkNDM5ZS1kZGU4LTQzN2EtYTcwOS05NGU4ZTFhMjMyNjEiLCJuYW1laWQiOiI2IiwidW5pcXVlX25hbWUiOiJFTkMwMDEiLCJyb2xlIjoiRW5jYXJnYWRvIiwibmJmIjoxNzg5ODczMDA4LCJleHAiOjE3ODk5MDE4MDgsImlhdCI6MTc4OTg3MzAwOCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.tUwMT5pcIF9a0x7a3uZg5nXYbuHAoFjMPcafDst8MxA', '::1', '2026-09-19 20:56:49', NULL, 1, '2026-09-19 20:56:49');
INSERT INTO `sesiones_usuarios` VALUES (340, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTZkMGUzOC05MDU4LTQ4NjctYTZlNS00ZjJjZGVmNmY0OWUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTg3MzEyMSwiZXhwIjoxNzg5OTAxOTIxLCJpYXQiOjE3ODk4NzMxMjEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.2kZrc7ZbDrsMRQjypuk8_IenFboLq9YqnQjeSFXNGVo', '::1', '2026-09-19 20:58:41', NULL, 1, '2026-09-19 20:58:41');
INSERT INTO `sesiones_usuarios` VALUES (341, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYzc4OTk3Yi1mMTk0LTQ1ZTktYWRlMS00N2MwMGFhNzJkMzciLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk5NjIyNzgsImV4cCI6MTc4OTk5MTA3OCwiaWF0IjoxNzg5OTYyMjc4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.ecbdmuKOqcLJ8of3S04yDKsYReFTEo3_e3v9FXrreRo', '::1', '2026-09-20 21:44:38', NULL, 1, '2026-09-20 21:44:38');
INSERT INTO `sesiones_usuarios` VALUES (342, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMGMzOTM3OC1kMzg2LTQ5ZGItOWNlZS02N2FkNGM4MDE0ZjUiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzg5OTY0MjgwLCJleHAiOjE3ODk5OTMwODAsImlhdCI6MTc4OTk2NDI4MCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.UX6UlBKpseSZ2CCkRtK2m7-mman_6S1ud-Cl5dtrq7A', '::1', '2026-09-20 22:18:01', NULL, 1, '2026-09-20 22:18:01');
INSERT INTO `sesiones_usuarios` VALUES (343, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMTNkZDNjMi00NTdkLTQxYzMtODQxYy00MTRkMzhhZDczNWQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk5NjU0MTEsImV4cCI6MTc4OTk5NDIxMSwiaWF0IjoxNzg5OTY1NDExLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.-7WY2u7p2_hjA2_XBHyo1mk5pjEvlbjaVqHvDOoAyzk', '::1', '2026-09-20 22:36:52', NULL, 1, '2026-09-20 22:36:52');
INSERT INTO `sesiones_usuarios` VALUES (344, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MWJjZWJjNy02MTUxLTQ0NDgtOTVmZC04YzlmOTMzOTcwZDUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc4OTk2NTUxOCwiZXhwIjoxNzg5OTk0MzE4LCJpYXQiOjE3ODk5NjU1MTgsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.oVnRQlOk5vhaG4N5VFRqrGT__iWyXngI5jjHZS7Nq_Y', '::1', '2026-09-20 22:38:38', NULL, 1, '2026-09-20 22:38:38');
INSERT INTO `sesiones_usuarios` VALUES (345, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1YmE5ZTg3YS0wYWU2LTQ2NjktYTJiOC1mNGY5NTBjZWEzYmIiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3ODk5NjYwNjIsImV4cCI6MTc4OTk5NDg2MiwiaWF0IjoxNzg5OTY2MDYyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.IJBLDfvwSkN2Z-6OAuSer2QRwcl-izFGz5sQ41UhgLc', '::1', '2026-09-20 22:47:43', NULL, 1, '2026-09-20 22:47:43');
INSERT INTO `sesiones_usuarios` VALUES (346, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MTQ0YzNlMC0zOGI1LTQ5OTktYmY5ZC03NWEyMmFiZTJkNTYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAwNDkzNjksImV4cCI6MTc5MDA3ODE2OSwiaWF0IjoxNzkwMDQ5MzY5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.guexZIVsUzkuf3U3wsAWiDUdSx73AR9TcQVYh-N9iNI', '::1', '2026-09-21 21:56:10', NULL, 1, '2026-09-21 21:56:10');
INSERT INTO `sesiones_usuarios` VALUES (347, 4, 'DOC001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YWQ5ZGRhYS0xMDVkLTRkYmEtYTFiMS1jZmQxNDk5NWM5MTUiLCJuYW1laWQiOiI0IiwidW5pcXVlX25hbWUiOiJET0MwMDEiLCJyb2xlIjoiRG9jZW50ZSIsIm5iZiI6MTc5MDA1Mjc5NSwiZXhwIjoxNzkwMDgxNTk1LCJpYXQiOjE3OTAwNTI3OTUsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.QNbTDbN4OYbziN3KGnAqoU5IUeDiFVF7YoS1elLklvk', '::1', '2026-09-21 22:53:16', NULL, 1, '2026-09-21 22:53:16');
INSERT INTO `sesiones_usuarios` VALUES (348, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZTdiZGJkYi04YzkwLTQwMjItYWNiZi1hN2JiODMxYjgzYjQiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAwNTI5MjgsImV4cCI6MTc5MDA4MTcyOCwiaWF0IjoxNzkwMDUyOTI4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.0vMUcomXRab6jnhODQVDHbiWyCWrd7jY7EcNA4LE3fg', '::1', '2026-09-21 22:55:29', NULL, 1, '2026-09-21 22:55:29');
INSERT INTO `sesiones_usuarios` VALUES (349, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYjMwOWI0NC03M2RlLTQ4MDctYmZiOS0zY2ZkMGUxODNlMGUiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAxNDE2NDYsImV4cCI6MTc5MDE3MDQ0NiwiaWF0IjoxNzkwMTQxNjQ2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.sQzh_jsoY-TvViHGVWL3UXyOSKvUQu6pR_48wjOdAsY', '::1', '2026-09-22 23:34:06', NULL, 1, '2026-09-22 23:34:06');
INSERT INTO `sesiones_usuarios` VALUES (350, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3Zjc5ODBkNy01YjAyLTQwMzMtOGViMy0wMTY4NzgwYzU3OWEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAyMTQ0MzIsImV4cCI6MTc5MDI0MzIzMiwiaWF0IjoxNzkwMjE0NDMyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.WytRFDYv4nZ6LyqwpGOc5l_uI58BmB9RG_EcSC-LTCQ', '::1', '2026-09-23 19:47:12', NULL, 1, '2026-09-23 19:47:12');
INSERT INTO `sesiones_usuarios` VALUES (351, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTRkMzAzMC03OTU3LTRjMzAtYjhiNC1hZDhjNDk0NWEzMGQiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzkwMjE0OTkwLCJleHAiOjE3OTAyNDM3OTAsImlhdCI6MTc5MDIxNDk5MCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.cfPQi8hiLUL-JKjgt3HHLwUU2FG-jp2VxcJvi5pPvHk', '::1', '2026-09-23 19:56:31', NULL, 1, '2026-09-23 19:56:31');
INSERT INTO `sesiones_usuarios` VALUES (352, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZmE2NTVkOC1hNGRkLTRjNTEtOTVlNS03Yzc0MTk2MTVhOGMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAyMTUyMTksImV4cCI6MTc5MDI0NDAxOSwiaWF0IjoxNzkwMjE1MjE5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.-CK1hMF7uCKtx7eTzl3v9fxGdCObM0uId3n1p2_7PJ0', '::1', '2026-09-23 20:00:19', NULL, 1, '2026-09-23 20:00:19');
INSERT INTO `sesiones_usuarios` VALUES (353, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNGJlZDM1Ny0xM2ZjLTQ1ZDYtYTYyMy04MzdmZDg0Mzg0M2IiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAyMTY3NTgsImV4cCI6MTc5MDI0NTU1OCwiaWF0IjoxNzkwMjE2NzU4LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.lrdeeSOlDFt5SnzhrIWH16_mH4la_EqUEww3SgopwCk', '::1', '2026-09-23 20:25:58', NULL, 1, '2026-09-23 20:25:58');
INSERT INTO `sesiones_usuarios` VALUES (354, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNzY4M2JmMS0zY2U1LTQ5MjItOWVjNS1jZjk1OTY2YzkzODAiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAyMTgzODcsImV4cCI6MTc5MDI0NzE4NywiaWF0IjoxNzkwMjE4Mzg3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.wtmK2iRNl3sZcf4VlOml7coJuDS3E9DxfGbbIQAzETE', '::1', '2026-09-23 20:53:08', NULL, 1, '2026-09-23 20:53:08');
INSERT INTO `sesiones_usuarios` VALUES (355, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMjRkZWQ3MS01MmQ3LTQyZTYtODNhZS01ZmM2MGM2ZDQ0MTMiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzkwMjE4NDEyLCJleHAiOjE3OTAyNDcyMTIsImlhdCI6MTc5MDIxODQxMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.SsseTpwxLexymFWnjHXIoLDYZjTzaWMcYFyn7lMlovY', '::1', '2026-09-23 20:53:32', NULL, 1, '2026-09-23 20:53:32');
INSERT INTO `sesiones_usuarios` VALUES (356, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NzFiYTA0YS1iMGQ4LTQ4ODUtYTk3Mi02YjYxZmNkZmI3YTYiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAyMTg0NTYsImV4cCI6MTc5MDI0NzI1NiwiaWF0IjoxNzkwMjE4NDU2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.0J6d-SFsaWfdKZYDXkMyP8LFfpBZT7eXmpKZjCrnLGQ', '::1', '2026-09-23 20:54:17', NULL, 1, '2026-09-23 20:54:17');
INSERT INTO `sesiones_usuarios` VALUES (357, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YjUzY2U4Yy1mNDUzLTQ3YjQtYTllOC1kZWZiMWM1NTVlNWMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAyMTg0NzIsImV4cCI6MTc5MDI0NzI3MiwiaWF0IjoxNzkwMjE4NDcyLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.TrXfAQAxxQ_QM3YJDJC5cQJ6hyfrgik6Zwyb5HCQAH4', '::1', '2026-09-23 20:54:33', NULL, 1, '2026-09-23 20:54:33');
INSERT INTO `sesiones_usuarios` VALUES (358, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYTBhMjIwZC1mYjc2LTRiOWYtOGYxOS0zMjgwMThjMjdlODEiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzkwMjE4NDkyLCJleHAiOjE3OTAyNDcyOTIsImlhdCI6MTc5MDIxODQ5MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.5oHKrA93eZ1Cj2oJ-fSAxgLQ8gffw_GLt2uGda4PWCg', '::1', '2026-09-23 20:54:53', NULL, 1, '2026-09-23 20:54:53');
INSERT INTO `sesiones_usuarios` VALUES (359, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMTYzNjM4MS05YjBjLTQ1MzQtYmFlMS04Mzc1Zjk4MDhmNjMiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAyMTk1MDcsImV4cCI6MTc5MDI0ODMwNywiaWF0IjoxNzkwMjE5NTA3LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.QJREirniapobr_fRQH9w99ZfJQJrR5LeZ00r58ZAdUY', '::1', '2026-09-23 21:11:48', NULL, 1, '2026-09-23 21:11:48');
INSERT INTO `sesiones_usuarios` VALUES (360, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiOTI1NDE1NC1lNzgxLTQzMDAtYmQ1MC03ZDllMjM0MGVjODUiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzkwMjE5NTI0LCJleHAiOjE3OTAyNDgzMjQsImlhdCI6MTc5MDIxOTUyNCwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.-xuZloHBscWHkWWqGtDy-fjziyMe3XIxySErDN5aFGM', '::1', '2026-09-23 21:12:05', NULL, 1, '2026-09-23 21:12:05');
INSERT INTO `sesiones_usuarios` VALUES (361, 33, 'ENC-013347F4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZGZlYTAxNy1hODQzLTQ5YTAtOGU3Zi03NjE0NjBjZWQ1YjMiLCJuYW1laWQiOiIzMyIsInVuaXF1ZV9uYW1lIjoiRU5DLTAxMzM0N0Y0Iiwicm9sZSI6IkVuY2FyZ2FkbyIsIm5iZiI6MTc5MDIxOTg3OCwiZXhwIjoxNzkwMjQ4Njc4LCJpYXQiOjE3OTAyMTk4NzgsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.E90EJxHnuPy92nxhStNy6eTVYQ42sppNUaQNa6wR3BQ', '::1', '2026-09-23 21:17:58', NULL, 1, '2026-09-23 21:17:58');
INSERT INTO `sesiones_usuarios` VALUES (362, 32, '2026-00042-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZTE0NzcyNi0xZDg1LTQyN2YtOTE5Mi02MDgxYzI2OTgyNjMiLCJuYW1laWQiOiIzMiIsInVuaXF1ZV9uYW1lIjoiMjAyNi0wMDA0Mi1JTkEiLCJyb2xlIjoiRXN0dWRpYW50ZSIsIm5iZiI6MTc5MDIyMDA0MiwiZXhwIjoxNzkwMjQ4ODQyLCJpYXQiOjE3OTAyMjAwNDIsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.35Ac3qKzZ5BnPUd-IlmSLWAgZ11ahdAvHQdPVar7jSE', '::1', '2026-09-23 21:20:43', NULL, 1, '2026-09-23 21:20:43');
INSERT INTO `sesiones_usuarios` VALUES (363, 33, 'ENC-013347F4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2MGM3MTZhMy0xN2ViLTRkNWUtOWM2ZC0xNjY1YTFlOTM1OTkiLCJuYW1laWQiOiIzMyIsInVuaXF1ZV9uYW1lIjoiRU5DLTAxMzM0N0Y0Iiwicm9sZSI6IkVuY2FyZ2FkbyIsIm5iZiI6MTc5MDIyMDA4NiwiZXhwIjoxNzkwMjQ4ODg2LCJpYXQiOjE3OTAyMjAwODYsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.5AEzRCGtab5iJOpHKGEl-5NstX9CdGGdrx1KQ8lD1Zg', '::1', '2026-09-23 21:21:27', NULL, 1, '2026-09-23 21:21:27');
INSERT INTO `sesiones_usuarios` VALUES (364, 32, '2026-00042-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMGYzYTg3Ny00MTIwLTQ4NTktOGYwZC05YmUxMTkwNjAxMmMiLCJuYW1laWQiOiIzMiIsInVuaXF1ZV9uYW1lIjoiMjAyNi0wMDA0Mi1JTkEiLCJyb2xlIjoiRXN0dWRpYW50ZSIsIm5iZiI6MTc5MDIyMTM4MSwiZXhwIjoxNzkwMjUwMTgxLCJpYXQiOjE3OTAyMjEzODEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.CHNKsh6zyceoIgiWWhhaPY1dTJNsgECT8RQhl2sIsww', '::1', '2026-09-23 21:43:02', NULL, 1, '2026-09-23 21:43:02');
INSERT INTO `sesiones_usuarios` VALUES (365, 33, 'ENC-013347F4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNmVkYTA5Mi1kODMyLTQyZDUtYmQ3MC01Y2IzOTRkZjk2ZmIiLCJuYW1laWQiOiIzMyIsInVuaXF1ZV9uYW1lIjoiRU5DLTAxMzM0N0Y0Iiwicm9sZSI6IkVuY2FyZ2FkbyIsIm5iZiI6MTc5MDIyMTQwMCwiZXhwIjoxNzkwMjUwMjAwLCJpYXQiOjE3OTAyMjE0MDAsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.Ll9dWBtbvYRYYd7VDvBSNJuEKqJg2KhYnTduUDAhfns', '::1', '2026-09-23 21:43:21', NULL, 1, '2026-09-23 21:43:21');
INSERT INTO `sesiones_usuarios` VALUES (366, 33, 'ENC-013347F4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNTg2MjdhOS03MDU5LTQ3YmMtYjY1NS00OWFhZWI3YzNmNzUiLCJuYW1laWQiOiIzMyIsInVuaXF1ZV9uYW1lIjoiRU5DLTAxMzM0N0Y0Iiwicm9sZSI6IkVuY2FyZ2FkbyIsIm5iZiI6MTc5MDIyMjAzMywiZXhwIjoxNzkwMjUwODMzLCJpYXQiOjE3OTAyMjIwMzMsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.KC67Dn_PwAURkCbrFz1j8XpXmBDpbJRrXugZeefQEpA', '::1', '2026-09-23 21:53:54', NULL, 1, '2026-09-23 21:53:54');
INSERT INTO `sesiones_usuarios` VALUES (367, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NjgwYjBiZi1mNzYyLTQwOGMtYTdkMC1lY2QyNTQ5NjVhYmYiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzkwMzA5NjQzLCJleHAiOjE3OTAzMzg0NDMsImlhdCI6MTc5MDMwOTY0MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29JTkEifQ.pxMwBhSxuTBdONNAN3hLFBSNX3ZPMIG_0J9TnYMIS2k', '127.0.0.1', '2026-09-24 22:14:03', NULL, 1, '2026-09-24 22:14:03');
INSERT INTO `sesiones_usuarios` VALUES (368, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMTEyOGRiMC1lYTFiLTQ5ZGMtYjRhMS0yM2UyZGFmZmJiZjkiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzkwMzEwNzQ1LCJleHAiOjE3OTAzMzk1NDUsImlhdCI6MTc5MDMxMDc0NSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.Q-rayTZCtgOt4Jjzm3ZwAULoiFrpeZSXIZfdtM9H50A', '127.0.0.1', '2026-09-24 22:32:25', NULL, 1, '2026-09-24 22:32:25');
INSERT INTO `sesiones_usuarios` VALUES (369, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NTQ2NDY2Yy1kYzE0LTQ0NGQtOGVhOS1iNjRlN2E1YmZmNzEiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzkwMzExNjUyLCJleHAiOjE3OTAzNDA0NTIsImlhdCI6MTc5MDMxMTY1MiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.eL4ZTXqBVCEaVVKdVfz_uLpoHrY1gPUGirUIfPQVvX0', '::1', '2026-09-24 22:47:33', NULL, 1, '2026-09-24 22:47:33');
INSERT INTO `sesiones_usuarios` VALUES (370, 33, 'ENC-013347F4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYzk2OTZkYS05ZWYzLTRiMTQtOTczZi1jYzBhZjU1M2FiNTYiLCJuYW1laWQiOiIzMyIsInVuaXF1ZV9uYW1lIjoiRU5DLTAxMzM0N0Y0Iiwicm9sZSI6IkVuY2FyZ2FkbyIsIm5iZiI6MTc5MDMxMTgxNSwiZXhwIjoxNzkwMzQwNjE1LCJpYXQiOjE3OTAzMTE4MTUsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEiLCJhdWQiOiJTaXN0ZW1hQWNhZGVtaWNvQ2xpZW50In0.bUDDJJAj7RSs_i5r1GfEC8z6PnZAYAJhu74Anl8_w0Y', '::1', '2026-09-24 22:50:15', NULL, 1, '2026-09-24 22:50:15');
INSERT INTO `sesiones_usuarios` VALUES (371, 9, '2026-00010-INA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlZDBmZWVhYS1kM2UxLTQxMzgtYWMwYi0zMmUwMmE1ZjA0M2QiLCJuYW1laWQiOiI5IiwidW5pcXVlX25hbWUiOiIyMDI2LTAwMDEwLUlOQSIsInJvbGUiOiJFc3R1ZGlhbnRlIiwibmJmIjoxNzkwMzEyNzMxLCJleHAiOjE3OTAzNDE1MzEsImlhdCI6MTc5MDMxMjczMSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.dIrKSCPIRpcVPSjGHUAgu17unb1Cau71sJ9NorOCBj0', '127.0.0.1', '2026-09-24 23:05:32', NULL, 1, '2026-09-24 23:05:32');
INSERT INTO `sesiones_usuarios` VALUES (372, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMmU5NThlNC1lMGJmLTQxMjItODNiOC0wODZjMzEyNmYzNTEiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzkwMzEyNzUzLCJleHAiOjE3OTAzNDE1NTMsImlhdCI6MTc5MDMxMjc1MywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.UMhaWlVQri-DqZbwl61iHSIdZk-c9iqO4x5FVj9Hu9M', '127.0.0.1', '2026-09-24 23:05:53', NULL, 1, '2026-09-24 23:05:53');
INSERT INTO `sesiones_usuarios` VALUES (373, 2, 'DIR001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYzZjMjkyMS0yMjRmLTQwNjktYjNkMi1hMTUxMmM0ZjlhZGEiLCJuYW1laWQiOiIyIiwidW5pcXVlX25hbWUiOiJESVIwMDEiLCJyb2xlIjoiRGlyZWN0b3IiLCJuYmYiOjE3OTAzMTMyMjksImV4cCI6MTc5MDM0MjAyOSwiaWF0IjoxNzkwMzEzMjI5LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIiwiYXVkIjoiU2lzdGVtYUFjYWRlbWljb0NsaWVudCJ9.dqTDaJtDAam_8N6kTWQ9l628_GVoyUPNJS3fEFa2lmk', '127.0.0.1', '2026-09-24 23:13:49', NULL, 1, '2026-09-24 23:13:49');
INSERT INTO `sesiones_usuarios` VALUES (374, 3, 'REG001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYzcyMTM5NS05ZWYwLTQ0Y2YtOTBlNC1kZDIxOTliY2ZlOTQiLCJuYW1laWQiOiIzIiwidW5pcXVlX25hbWUiOiJSRUcwMDEiLCJyb2xlIjoiUmVnaXN0cm8gQWNhZGVtaWNvIiwibmJmIjoxNzkwMzEzNDI1LCJleHAiOjE3OTAzNDIyMjUsImlhdCI6MTc5MDMxMzQyNSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.lsn_C6uratbQNt0Ti5ugLO4FEjCdQ3fh7HH9Epc5nYs', '127.0.0.1', '2026-09-24 23:17:05', NULL, 1, '2026-09-24 23:17:05');
INSERT INTO `sesiones_usuarios` VALUES (375, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NTIwNjA3Mi1jNWY0LTQ4MGQtOTBkMi04N2I3Mzc2ZGUxYjUiLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwibmJmIjoxNzkwMzEzNjMyLCJleHAiOjE3OTAzNDI0MzIsImlhdCI6MTc5MDMxMzYzMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSIsImF1ZCI6IlNpc3RlbWFBY2FkZW1pY29DbGllbnQifQ.wYQVTC2SJlhBSbNoy7_GRu5QVQkI-T56W7hZG8bgX94', '127.0.0.1', '2026-09-24 23:20:32', NULL, 1, '2026-09-24 23:20:32');
-- 375 fila(s) en `sesiones_usuarios`

DROP TABLE IF EXISTS `solicitudes_equipo`;
CREATE TABLE `solicitudes_equipo` (
  `id_solicitud` int NOT NULL,
  `id_solicitante` int,
  `tipo_solicitante` enum('Docente','Estudiante','Administrativo') NOT NULL,
  `nombre_solicitante` varchar(150),
  `equipo_solicitado` varchar(100) NOT NULL,
  `cantidad` int DEFAULT 1,
  `fecha_solicitud` date,
  `fecha_devolucion` date,
  `estado_equipo` enum('Bueno','Regular','Malo','En Reparacion') DEFAULT Bueno,
  `observacion_equipo` text,
  `estado_solicitud` enum('Pendiente','Aprobada','Rechazada','Entregado','Devuelto') DEFAULT Pendiente,
  `observaciones` text,
  `aprobado_por` varchar(100)
);
-- 0 fila(s) en `solicitudes_equipo`

DROP TABLE IF EXISTS `sub_actividad_plantilla_detalle`;
CREATE TABLE `sub_actividad_plantilla_detalle` (
  `id_sub_detalle` int AUTO_INCREMENT,
  `id_detalle_actividad` int NOT NULL,
  `orden_sub` int NOT NULL,
  `nombre_sub_actividad` varchar(200) NOT NULL,
  `ponderacion_sub` decimal(5,2) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `tipo_sub_actividad` varchar(50) DEFAULT Subactividad,
  `es_vertical` tinyint(1) DEFAULT 0,
  `numero_orden` int DEFAULT 0
,
  PRIMARY KEY (`id_sub_detalle`)
);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (1, 1, 1, 'AUTOEVALUACIÓN', 20.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (2, 1, 2, 'COEVALUACIÓN', 20.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (3, 1, 3, 'PRUEBA OBJETIVA 1', 20.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (4, 1, 4, 'PRUEBA OBJETIVA 2', 20.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (5, 1, 5, 'PRUEBA OBJETIVA 3', 20.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (6, 2, 1, 'AUTOEVALUACIÓN', 20.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (7, 2, 2, 'COEVALUACIÓN', 20.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (8, 2, 3, 'PRUEBA OBJETIVA 1', 20.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (9, 2, 4, 'PRUEBA OBJETIVA 2', 20.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (10, 2, 5, 'PRUEBA OBJETIVA 3', 20.00, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (11, 3, 1, 'AUTOEVALUACIÓN', 33.33, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (12, 3, 2, 'COEVALUACIÓN', 33.33, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (13, 3, 3, 'PRUEBA OBJETIVA', 33.34, '2026-08-25 19:05:49', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (14, 4, 1, 'AUTOEVALUACIÓN', 20.00, '2026-08-25 19:10:10', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (15, 4, 2, 'COEVALUACIÓN', 20.00, '2026-08-25 19:10:10', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (16, 4, 3, 'PRUEBA OBJETIVA 1', 20.00, '2026-08-25 19:10:10', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (17, 4, 4, 'PRUEBA OBJETIVA 2', 20.00, '2026-08-25 19:10:10', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (18, 4, 5, 'PRUEBA OBJETIVA 3', 20.00, '2026-08-25 19:10:10', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (19, 5, 1, 'AUTOEVALUACIÓN', 20.00, '2026-08-25 19:10:11', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (20, 5, 2, 'COEVALUACIÓN', 20.00, '2026-08-25 19:10:11', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (21, 5, 3, 'PRUEBA OBJETIVA 1', 20.00, '2026-08-25 19:10:11', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (22, 5, 4, 'PRUEBA OBJETIVA 2', 20.00, '2026-08-25 19:10:11', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (23, 5, 5, 'PRUEBA OBJETIVA 3', 20.00, '2026-08-25 19:10:11', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (24, 6, 1, 'AUTOEVALUACIÓN', 33.33, '2026-08-25 19:10:11', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (25, 6, 2, 'COEVALUACIÓN', 33.33, '2026-08-25 19:10:11', 'Subactividad', 0, 0);
INSERT INTO `sub_actividad_plantilla_detalle` VALUES (26, 6, 3, 'PRUEBA OBJETIVA', 33.34, '2026-08-25 19:10:11', 'Subactividad', 0, 0);
-- 26 fila(s) en `sub_actividad_plantilla_detalle`

DROP TABLE IF EXISTS `sub_actividades`;
CREATE TABLE `sub_actividades` (
  `id_sub_actividad` int AUTO_INCREMENT,
  `id_actividad` int NOT NULL,
  `nombre_sub_actividad` varchar(200) NOT NULL,
  `tipo_sub_actividad` enum('Subactividad','Autoevaluacion','Coevaluacion','ActividadModulo','Porcentaje','PruebaObjetiva','RecuperacionModulo') NOT NULL DEFAULT Subactividad,
  `ponderacion` decimal(5,2) NOT NULL,
  `orden` int NOT NULL DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `es_vertical` tinyint(1) DEFAULT 0,
  `numero_orden` int DEFAULT 0
,
  PRIMARY KEY (`id_sub_actividad`)
);
INSERT INTO `sub_actividades` VALUES (1, 26, 'AUTOEVALUACIÓN', 'Subactividad', 30.00, 4, '2026-09-06 17:00:21', '2026-09-16 23:14:00', 0, 4);
INSERT INTO `sub_actividades` VALUES (2, 26, 'COEVALUACIÓN', 'Subactividad', 10.00, 1, '2026-09-06 17:00:21', '2026-09-16 23:14:02', 0, 1);
INSERT INTO `sub_actividades` VALUES (3, 26, 'Prueba Objetiva 1', 'Subactividad', 20.00, 2, '2026-09-06 17:00:21', '2026-09-16 23:14:02', 0, 2);
INSERT INTO `sub_actividades` VALUES (4, 26, 'Prueba Objetiva 2', 'Subactividad', 20.00, 3, '2026-09-06 17:00:21', '2026-09-16 23:14:00', 0, 3);
INSERT INTO `sub_actividades` VALUES (6, 27, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 1, '2026-09-06 17:00:21', '2026-09-06 17:00:20', 0, 0);
INSERT INTO `sub_actividades` VALUES (7, 27, 'COEVALUACIÓN', 'Subactividad', 20.00, 2, '2026-09-06 17:00:21', '2026-09-06 17:00:20', 0, 0);
INSERT INTO `sub_actividades` VALUES (8, 27, 'Prueba Objetiva 1', 'Subactividad', 20.00, 3, '2026-09-06 17:00:21', '2026-09-06 18:20:37', 0, 0);
INSERT INTO `sub_actividades` VALUES (9, 27, 'Prueba Objetiva 2', 'Subactividad', 20.00, 4, '2026-09-06 17:00:21', '2026-09-06 18:20:37', 0, 0);
INSERT INTO `sub_actividades` VALUES (10, 27, 'Prueba Objetiva 3', 'Subactividad', 20.00, 5, '2026-09-06 17:00:21', '2026-09-06 18:20:37', 0, 0);
INSERT INTO `sub_actividades` VALUES (11, 28, 'AUTOEVALUACIÓN', 'Subactividad', 33.33, 1, '2026-09-06 17:00:21', '2026-09-06 17:00:20', 0, 0);
INSERT INTO `sub_actividades` VALUES (12, 28, 'COEVALUACIÓN', 'Subactividad', 33.33, 2, '2026-09-06 17:00:21', '2026-09-06 17:00:20', 0, 0);
INSERT INTO `sub_actividades` VALUES (13, 28, 'Prueba Objetiva', 'Subactividad', 33.34, 3, '2026-09-06 17:00:21', '2026-09-06 18:20:37', 0, 0);
INSERT INTO `sub_actividades` VALUES (17, 26, 'prubea', 'Subactividad', 20.00, 5, '2026-09-06 17:30:51', '2026-09-16 23:14:00', 0, 5);
INSERT INTO `sub_actividades` VALUES (18, 29, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 4, '2026-09-07 00:09:05', '2026-09-07 22:28:15', 0, 4);
INSERT INTO `sub_actividades` VALUES (19, 29, 'COEVALUACIÓN', 'Subactividad', 20.00, 5, '2026-09-07 00:09:05', '2026-09-07 22:28:14', 0, 5);
INSERT INTO `sub_actividades` VALUES (20, 29, 'PRUEBA', 'Subactividad', 20.00, 3, '2026-09-07 00:09:05', '2026-09-21 22:53:48', 0, 3);
INSERT INTO `sub_actividades` VALUES (21, 29, 'PRUEBA OBJETIVA 2', 'Subactividad', 20.00, 1, '2026-09-07 00:09:05', '2026-09-21 22:53:48', 0, 1);
INSERT INTO `sub_actividades` VALUES (22, 29, 'PRUEBA OBJETIVA 3', 'Subactividad', 20.00, 2, '2026-09-07 00:09:05', '2026-09-21 22:53:48', 0, 2);
INSERT INTO `sub_actividades` VALUES (23, 30, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 1, '2026-09-07 00:09:05', '2026-09-07 00:09:05', 0, 0);
INSERT INTO `sub_actividades` VALUES (24, 30, 'COEVALUACIÓN', 'Subactividad', 20.00, 2, '2026-09-07 00:09:05', '2026-09-07 00:09:05', 0, 0);
INSERT INTO `sub_actividades` VALUES (25, 30, 'PRUEBA OBJETIVA 1', 'Subactividad', 20.00, 3, '2026-09-07 00:09:05', '2026-09-07 00:09:05', 0, 0);
INSERT INTO `sub_actividades` VALUES (26, 30, 'PRUEBA OBJETIVA 2', 'Subactividad', 20.00, 4, '2026-09-07 00:09:05', '2026-09-07 00:09:05', 0, 0);
INSERT INTO `sub_actividades` VALUES (27, 30, 'PRUEBA OBJETIVA 3', 'Subactividad', 20.00, 5, '2026-09-07 00:09:05', '2026-09-07 00:09:05', 0, 0);
INSERT INTO `sub_actividades` VALUES (28, 31, 'AUTOEVALUACIÓN', 'Subactividad', 34.00, 2, '2026-09-07 00:09:05', '2026-09-07 00:10:30', 0, 2);
INSERT INTO `sub_actividades` VALUES (29, 31, 'COEVALUACIÓN', 'Subactividad', 33.00, 3, '2026-09-07 00:09:05', '2026-09-07 00:10:30', 0, 3);
INSERT INTO `sub_actividades` VALUES (30, 31, 'PRUEBA OBJETIVA', 'Subactividad', 33.00, 1, '2026-09-07 00:09:05', '2026-09-07 00:10:30', 0, 1);
INSERT INTO `sub_actividades` VALUES (31, 32, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 1, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (32, 32, 'COEVALUACIÓN', 'Subactividad', 20.00, 2, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (33, 32, 'PRUEBA OBJETIVA 1', 'Subactividad', 20.00, 3, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (34, 32, 'PRUEBA OBJETIVA 2', 'Subactividad', 20.00, 4, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (35, 32, 'PRUEBA OBJETIVA 3', 'Subactividad', 20.00, 5, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (36, 33, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 1, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (37, 33, 'COEVALUACIÓN', 'Subactividad', 20.00, 2, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (38, 33, 'PRUEBA OBJETIVA 1', 'Subactividad', 20.00, 3, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (39, 33, 'PRUEBA OBJETIVA 2', 'Subactividad', 20.00, 4, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (40, 33, 'PRUEBA OBJETIVA 3', 'Subactividad', 20.00, 5, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (41, 34, 'AUTOEVALUACIÓN', 'Subactividad', 33.33, 1, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (42, 34, 'COEVALUACIÓN', 'Subactividad', 33.33, 2, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (43, 34, 'PRUEBA OBJETIVA', 'Subactividad', 33.34, 3, '2026-09-07 22:56:23', '2026-09-07 22:56:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (44, 35, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 1, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (45, 35, 'COEVALUACIÓN', 'Subactividad', 20.00, 2, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (46, 35, 'PRUEBA OBJETIVA 1', 'Subactividad', 20.00, 3, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (47, 35, 'PRUEBA OBJETIVA 2', 'Subactividad', 20.00, 4, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (48, 35, 'PRUEBA OBJETIVA 3', 'Subactividad', 20.00, 5, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (49, 36, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 1, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (50, 36, 'COEVALUACIÓN', 'Subactividad', 20.00, 2, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (51, 36, 'PRUEBA OBJETIVA 1', 'Subactividad', 20.00, 3, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (52, 36, 'PRUEBA OBJETIVA 2', 'Subactividad', 20.00, 4, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (53, 36, 'PRUEBA OBJETIVA 3', 'Subactividad', 20.00, 5, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (54, 37, 'AUTOEVALUACIÓN', 'Subactividad', 33.33, 1, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (55, 37, 'COEVALUACIÓN', 'Subactividad', 33.33, 2, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (56, 37, 'PRUEBA OBJETIVA', 'Subactividad', 33.34, 3, '2026-09-09 00:52:27', '2026-09-09 00:52:26', 0, 0);
INSERT INTO `sub_actividades` VALUES (57, 46, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 1, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (58, 46, 'COEVALUACIÓN', 'Subactividad', 20.00, 2, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (59, 46, 'PRUEBA OBJETIVA 1', 'Subactividad', 20.00, 3, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (60, 46, 'PRUEBA OBJETIVA 2', 'Subactividad', 20.00, 4, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (61, 46, 'PRUEBA OBJETIVA 3', 'Subactividad', 20.00, 5, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (62, 47, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 1, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (63, 47, 'COEVALUACIÓN', 'Subactividad', 20.00, 2, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (64, 47, 'PRUEBA OBJETIVA 1', 'Subactividad', 20.00, 3, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (65, 47, 'PRUEBA OBJETIVA 2', 'Subactividad', 20.00, 4, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (66, 47, 'PRUEBA OBJETIVA 3', 'Subactividad', 20.00, 5, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (67, 48, 'AUTOEVALUACIÓN', 'Subactividad', 33.33, 1, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (68, 48, 'COEVALUACIÓN', 'Subactividad', 33.33, 2, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (69, 48, 'PRUEBA OBJETIVA', 'Subactividad', 33.34, 3, '2026-09-11 10:40:27', '2026-09-11 10:40:27', 0, 0);
INSERT INTO `sub_actividades` VALUES (70, 38, 'Prueba', 'Subactividad', 100.00, 1, '2026-09-11 10:45:53', '2026-09-11 10:45:53', 0, 0);
INSERT INTO `sub_actividades` VALUES (71, 39, 'adsd', 'Subactividad', 100.00, 1, '2026-09-12 15:47:20', '2026-09-12 15:47:20', 0, 0);
INSERT INTO `sub_actividades` VALUES (72, 40, '100aasd', 'Subactividad', 100.00, 1, '2026-09-12 15:47:30', '2026-09-12 15:47:30', 0, 0);
INSERT INTO `sub_actividades` VALUES (73, 41, '4215', 'Subactividad', 100.00, 1, '2026-09-12 15:47:41', '2026-09-12 15:47:40', 0, 0);
INSERT INTO `sub_actividades` VALUES (74, 42, 'sad', 'Subactividad', 100.00, 1, '2026-09-12 15:47:48', '2026-09-12 15:47:47', 0, 0);
INSERT INTO `sub_actividades` VALUES (75, 43, 'asdad', 'Subactividad', 100.00, 1, '2026-09-12 15:47:55', '2026-09-12 15:47:55', 0, 0);
INSERT INTO `sub_actividades` VALUES (76, 44, 'asdadafaf', 'Subactividad', 100.00, 1, '2026-09-12 15:48:03', '2026-09-12 15:48:03', 0, 0);
INSERT INTO `sub_actividades` VALUES (77, 45, '1adasaf', 'Subactividad', 100.00, 1, '2026-09-12 15:48:12', '2026-09-12 15:48:11', 0, 0);
INSERT INTO `sub_actividades` VALUES (78, 49, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 1, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (79, 49, 'COEVALUACIÓN', 'Subactividad', 20.00, 2, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (80, 49, 'PRUEBA OBJETIVA 1', 'Subactividad', 20.00, 3, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (81, 49, 'PRUEBA OBJETIVA 2', 'Subactividad', 20.00, 4, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (82, 49, 'PRUEBA OBJETIVA 3', 'Subactividad', 20.00, 5, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (83, 50, 'AUTOEVALUACIÓN', 'Subactividad', 20.00, 1, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (84, 50, 'COEVALUACIÓN', 'Subactividad', 20.00, 2, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (85, 50, 'PRUEBA OBJETIVA 1', 'Subactividad', 20.00, 3, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (86, 50, 'PRUEBA OBJETIVA 2', 'Subactividad', 20.00, 4, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (87, 50, 'PRUEBA OBJETIVA 3', 'Subactividad', 20.00, 5, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (88, 51, 'AUTOEVALUACIÓN', 'Subactividad', 33.33, 1, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (89, 51, 'COEVALUACIÓN', 'Subactividad', 33.33, 2, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
INSERT INTO `sub_actividades` VALUES (90, 51, 'PRUEBA OBJETIVA', 'Subactividad', 33.34, 3, '2026-09-12 16:17:23', '2026-09-12 16:17:23', 0, 0);
-- 86 fila(s) en `sub_actividades`

DROP TABLE IF EXISTS `tipodocumentos`;
CREATE TABLE `tipodocumentos` (
  `id_documento` int NOT NULL,
  `TipoDocumento` varchar(255) NOT NULL
);
INSERT INTO `tipodocumentos` VALUES (1, 'Partida de Nacimiento');
INSERT INTO `tipodocumentos` VALUES (2, 'Carnet de Menoridad');
INSERT INTO `tipodocumentos` VALUES (3, 'DUI');
INSERT INTO `tipodocumentos` VALUES (4, 'Notas de 9 Grado');
INSERT INTO `tipodocumentos` VALUES (5, 'Certificado de Conducta');
-- 5 fila(s) en `tipodocumentos`

DROP TABLE IF EXISTS `tokens_activacion`;
CREATE TABLE `tokens_activacion` (
  `id` int AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `token` varchar(500) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
,
  PRIMARY KEY (`id`)
);
INSERT INTO `tokens_activacion` VALUES (2, 27, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwOTQ2YzQ0Yy02NjYzLTRlZTYtOWUwYS1mNjc3N2E2MzBlYWMiLCJuYW1laWQiOiIyNyIsImVtYWlsIjoiamVmZmVyYWd1aWlycmVAZ21haWwuY29tIiwicHJvcG9zaXRvIjoiYWN0aXZhY2lvbkN1ZW50YSIsIm5iZiI6MTc4OTYyMTQ2OSwiZXhwIjoxNzg5Nzk0MjY5LCJpYXQiOjE3ODk2MjE0NjksImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEifQ.E4TuXuDkmfF5_jj3ZNAqVusvLKiNKAdozpCPWwfBCJU', '2026-09-16 23:04:29', '2026-09-18 23:04:29', 1, '2026-09-16 23:04:29');
INSERT INTO `tokens_activacion` VALUES (5, 30, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiODczYmQ4ZC0zNjk0LTQwOTgtYjczMi1jMDVmODIyNjYxODgiLCJuYW1laWQiOiIzMCIsImVtYWlsIjoiZXN3YW1weTI5bmFyYW5qYUBnbWFpbC5jb20iLCJwcm9wb3NpdG8iOiJhY3RpdmFjaW9uQ3VlbnRhIiwibmJmIjoxNzg5NjY2Mjc5LCJleHAiOjE3ODk4MzkwNzksImlhdCI6MTc4OTY2NjI3OSwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSJ9.1yJsF5bliMnuuCvRyH_yf8AhHgPcgQdEGhSKiu0Zv5o', '2026-09-17 11:31:19', '2026-09-19 11:31:19', 1, '2026-09-17 11:31:19');
INSERT INTO `tokens_activacion` VALUES (6, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NmQxZmIyNy1kMDc1LTQwNjgtODZiYy1mYzcwYzUyNjY1NGYiLCJuYW1laWQiOiIyOSIsImVtYWlsIjoiam9zaHVhMTltb3Jhb0BnbWFpbC5jb20iLCJwcm9wb3NpdG8iOiJhY3RpdmFjaW9uQ3VlbnRhIiwibmJmIjoxNzg5ODM4NDA3LCJleHAiOjE3OTAwMTEyMDcsImlhdCI6MTc4OTgzODQwNywiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSJ9.VJn5hnyWU-SmFDosc8N06f_tj6rnmJe2Qt3400a_8aA', '2026-09-19 11:20:07', '2026-09-21 11:20:07', 1, '2026-09-19 11:20:07');
INSERT INTO `tokens_activacion` VALUES (7, 26, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMjI4ZTIyNi1mOWU4LTRhNjgtOWZlNS00N2JlMjBlMGU4NmQiLCJuYW1laWQiOiIyNiIsImVtYWlsIjoiMTk5MzE1MTZAY2xhc2VzLmVkdS5zdiIsInByb3Bvc2l0byI6ImFjdGl2YWNpb25DdWVudGEiLCJuYmYiOjE3ODk4Mzg0MTEsImV4cCI6MTc5MDAxMTIxMSwiaWF0IjoxNzg5ODM4NDExLCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIn0.XPBa1wqbzCvXkBQJY9iE_8c84OTOpzSNmBDBymzdeOo', '2026-09-19 11:20:11', '2026-09-21 11:20:11', 0, '2026-09-19 11:20:11');
INSERT INTO `tokens_activacion` VALUES (8, 28, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZmNlYzg3Yi03YThiLTQ3ZWYtOWZjMC0wZjQyZjY3YjhlZDQiLCJuYW1laWQiOiIyOCIsImVtYWlsIjoiam9zZXNpdG94ZDUwNEBnbWFpbC5jb20iLCJwcm9wb3NpdG8iOiJhY3RpdmFjaW9uQ3VlbnRhIiwibmJmIjoxNzg5ODM4NDEyLCJleHAiOjE3OTAwMTEyMTIsImlhdCI6MTc4OTgzODQxMiwiaXNzIjoiU2lzdGVtYUFjYWRlbWljb0lOQSJ9.elVd0vklzgNANVAKR67EdysXf5adf_sfkeISP0na1Y8', '2026-09-19 11:20:12', '2026-09-21 11:20:12', 0, '2026-09-19 11:20:12');
INSERT INTO `tokens_activacion` VALUES (9, 31, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiZGU2ZmMwMi0zODFmLTQyYzAtYjk3Ny1iOTgzNGM0NjNkNzAiLCJuYW1laWQiOiIzMSIsImVtYWlsIjoiZXN3YW1weTMybW9yYWRvQGdtYWlsLmNvbSIsInByb3Bvc2l0byI6ImFjdGl2YWNpb25DdWVudGEiLCJuYmYiOjE3ODk4Mzk4OTYsImV4cCI6MTc5MDAxMjY5NiwiaWF0IjoxNzg5ODM5ODk2LCJpc3MiOiJTaXN0ZW1hQWNhZGVtaWNvSU5BIn0.BbiF3Q6dM_SbcdAIcqKYMz2fFBzu45GqwynS-gv4SyY', '2026-09-19 11:44:56', '2026-09-21 11:44:56', 0, '2026-09-19 11:44:56');
INSERT INTO `tokens_activacion` VALUES (10, 32, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZjk4ZWEzZC0wZTczLTQwMTgtOGM2ZS0yYzc3YTQ3NDBjMmMiLCJuYW1laWQiOiIzMiIsImVtYWlsIjoiY3VlbnRhZGV0cmFiYWpvMTIzbXVqZXJAZ21haWwuY29tIiwicHJvcG9zaXRvIjoiYWN0aXZhY2lvbkN1ZW50YSIsIm5iZiI6MTc5MDIxOTU0MSwiZXhwIjoxNzkwMzkyMzQxLCJpYXQiOjE3OTAyMTk1NDEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEifQ.RuThofOMqF4skthX-uxInDZJy-9CM0GDBvB0i3N0QGM', '2026-09-23 21:12:21', '2026-09-25 21:12:21', 1, '2026-09-23 21:12:21');
INSERT INTO `tokens_activacion` VALUES (11, 33, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YmNmZTVjYS00MWE5LTQ4OGUtYTQxMC02NDQ5MTNkYjQ3NzgiLCJuYW1laWQiOiIzMyIsImVtYWlsIjoiamVmZmVyYWd1aXJycmVAZ21haWwuY29tIiwicHJvcG9zaXRvIjoiYWN0aXZhY2lvbkN1ZW50YSIsIm5iZiI6MTc5MDIxOTU0MSwiZXhwIjoxNzkwMzkyMzQxLCJpYXQiOjE3OTAyMTk1NDEsImlzcyI6IlNpc3RlbWFBY2FkZW1pY29JTkEifQ.tNKzMJJIRyg_zz4r968N-dlNhH6ZBMjEzc-laIkeEB8', '2026-09-23 21:12:21', '2026-09-25 21:12:21', 1, '2026-09-23 21:12:21');
-- 8 fila(s) en `tokens_activacion`

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuario` int AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `correo` varchar(100),
  `contrasena` varchar(100),
  `rol_id` int NOT NULL,
  `id_referencia` int,
  `tipo_referencia` enum('docente','estudiante','persona'),
  `estado` tinyint(1) DEFAULT 1,
  `estado_activacion` varchar(40)
,
  PRIMARY KEY (`id_usuario`)
);
INSERT INTO `usuarios` VALUES (1, 'admin', 'Administrador', 'del Sistema', 'admin@ina.edu.sv', '$2a$11$bWtGBM9DWGJHIc9SWheVceDnLjiyPfCW3fFqi8ks.PJDzdiCJ.ymO', 1, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (2, 'DIR001', 'Juan Carlos', 'Perez Rodriguez', 'direccion@ina.edu.sv', '$2a$11$6iEhqDI1/yUmeSB3JjvfP.bnv6AW1yoXCPJWCKUL69hz8BB3WKeEa', 2, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (3, 'REG001', 'Ana Maria', 'Lopez Castro', 'registro@ina.edu.sv', '$2a$11$vrNXPdDJ4jYTkoKB.T3W2O/ZBQd3Zs3Hdyu17ZYyZzdnA8qSpJpbO', 4, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (4, 'DOC001', 'Maria Elena', 'Rodriguez Castro', 'docente@ina.edu.sv', '$2a$11$UfT7jEtzhOQTLVj0FomEAuJo.TKTfjCqsTehWl8dKGf2Y3oM/GHWC', 6, 1, 'docente', 1, NULL);
INSERT INTO `usuarios` VALUES (5, '2026-00001-INA', 'Ana Lucia', 'Perez Gomez', 'estudiante@ina.edu.sv', '$2a$11$luOIw86cBHk8pstAPrWJuOJ8hLzn6ea3LRn/4J.gvFwIhWILqctIW', 7, 1, 'estudiante', 1, NULL);
INSERT INTO `usuarios` VALUES (6, 'ENC001', 'Luis Alberto', 'Perez Martinez', 'encargado@google.com', '$2a$11$u6Se/jUi5OdRAlOwyDTgxOxaBFTDSGEUuBpY1PYvntCP23kYipJVy', 8, 1, 'persona', 1, NULL);
INSERT INTO `usuarios` VALUES (7, '2026-00002-INA', 'jose', 'perez', 'josesito@gmail.com', '$2a$11$hBMoA.hf4qaOiGTUWYty5OuyEOe1qFIvkxE4y0PvJ/RR1Z2EC8.uK', 7, 2, 'estudiante', 1, NULL);
INSERT INTO `usuarios` VALUES (8, 'DIR002', 'Oscar', 'Cortez', 'Oscar@gmail.com', '$2a$11$lkRXxePsGnWyYqSb3hmrw.w1jrJjgkR94yc2BX66ZuS4GS6mjX97y', 3, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (9, '2026-00010-INA', 'José Efraín', 'Pérez Argueta', 'jose19morado@gmail.com', '$2a$11$9wFYjookN3BUkx5zXyt/.Oz1l5IYeItsom6cz5jMh0BWutm3d5bom', 7, 3, 'estudiante', 1, NULL);
INSERT INTO `usuarios` VALUES (10, '2026-00013-INA', 'Ian Andrew', 'Bonilla Hernandez', 'owenmejia12@gmail.com', '$2a$11$HuJG7vIquzaVscAysCNTi.ETONt8RXXk2DWJcrZI3JcvJOukyrrDK', 7, 4, 'estudiante', 1, NULL);
INSERT INTO `usuarios` VALUES (11, '2026-00103-INA', 'FELIPE MEDRANO', 'BONILLA SUAREZ', 'santamariamadrededios@gmail.com', '$2a$11$KNMhx8Z62Umrta38ARollu0vuqn5MHgtvICwXTQNflMMQLEO6.aM2', 7, 5, 'estudiante', 1, NULL);
INSERT INTO `usuarios` VALUES (12, 'TEMPQA01', 'QA Test', 'Temp', 'qa@temp.local', '$2a$11$oxxIUG2c6RpzbOGDJEjCYOwGC5yLnyiMyxCUVGaxWJ6Iw3QZreXLC', 2, NULL, NULL, 0, NULL);
INSERT INTO `usuarios` VALUES (13, 'TEMPQA03', 'QA', 'Temp', 'qa3@temp.local', '$2a$11$6J0FBqUKkzc8fdJwdl9unuoc91ES7gsWwM4rMoC9nXdmGoq9Y86Mq', 2, NULL, NULL, 0, NULL);
INSERT INTO `usuarios` VALUES (14, '2026-00127-INA', 'Juan Jose', 'Hernández Perez', 'juan19morado@gmail.com', '$2a$11$2.//pWZAnnduRWoYdmIW0.WpYcishRCSh/VEnQmKxUTW7KpJ6urGy', 7, 6, 'estudiante', 1, NULL);
INSERT INTO `usuarios` VALUES (15, '2026-00025-INA', 'Luis Eduardo', 'Mejia Benavides', 'luis.mejia@correo.com', '$2a$11$/nZ5RtVvZlhYdQcuc1r38uqSSuGXgRLksum5Rsx3yQcO3152UIktS', 7, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (16, '2026-00026-INA', 'Karen Noemi', 'Ayala Martinez', 'karen.ayala@correo.com', '$2a$11$zckTQ8g0bEJ528EO654qsuJ.NB1yO/RyY5x2ZkYGG56/.Hqiy1QG2', 7, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (17, '2026-00027-INA', 'Alejandro Rafael', 'Vasquez Portillo', 'alejandro.vasquez@correo.com', '$2a$11$FnigP0s1QlJgGPzAKeYr/upEXK10bOpDA2Ac8PiUKaVAmh04DD8dy', 7, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (19, '2026-00029-INA', 'Miguel Angel', 'Rivas Salaverria', 'miguel.rivas@correo.com', '$2a$11$8g2mWG4puvIKTsmNPyjNlOW1aFWUritf2zUtBhL3C2guHZCVWc1.S', 7, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (23, '2026-00033-INA', 'PRUEBA3', 'prueba3', 'ajdhad@gmail.com', '$2a$11$APhN9a2irFALnWw4TCPoY.ZDGRrODhNvqqvbO/9Pjnoh1.RX9UGXq', 7, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (24, '2026-00034-INA', 'PRUEBA2', 'prueba2', 'jm@gmail.com', '$2a$11$6cbfsWwNPXEWRuQXa1hrEeKyCwCDO2thvSd0loKkoIj0/RWV/ZL6C', 7, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (25, '2026-00035-INA', 'Walter Ernesto', 'Pineda Amaya', 'walter.pineda@correo.com', '$2a$11$mY540kNPJN26mPphh3YnVuTeDyV0oS5buY/hbGH/sQKJ4KgKwVH0i', 7, NULL, NULL, 1, NULL);
INSERT INTO `usuarios` VALUES (26, '2026-00036-INA', 'prueba5', 'prueba5', '19931@gmail.com', NULL, 7, NULL, NULL, 0, 'PendienteActivacion');
INSERT INTO `usuarios` VALUES (27, '2026-00037-INA', 'prueba6', 'prueba6', 'jefferaguiirre@gmail.com', '$2a$11$TBKz8V2.jkKUHaybxsZBGOTCpTKAZQU.8U7vlAoLLp8DEaCDA3R.G', 7, NULL, NULL, 1, 'Activo');
INSERT INTO `usuarios` VALUES (28, '2026-00038-INA', 'Joshua Felix', 'Hernández Perez', 'josesitoxd504@gmail.com', NULL, 7, NULL, NULL, 0, 'PendienteActivacion');
INSERT INTO `usuarios` VALUES (29, '2026-00039-INA', 'Joshua Felix', 'Bonilla Hernandez', 'joshua19morao@gmail.com', '$2a$11$at3sJglji0VrVTfhPeN33uvlWdLn2qsw4hWlSH4wNw/Y.k/aVvfX6', 7, NULL, NULL, 1, 'Activo');
INSERT INTO `usuarios` VALUES (30, '2026-00040-INA', 'ghfgjhgjg', 'dgdghfhfg', 'eswampy29naranja@gmail.com', '$2a$11$3SDdCaVhf59rkJItXaDNK..ajXk2LINFSyY4l/pQFPulN/EiqVSaS', 7, NULL, NULL, 1, 'Activo');
INSERT INTO `usuarios` VALUES (31, '2026-00041-INA', 'Ronald Ernesto ', 'Pérez Argueta', 'eswampy32morado@gmail.com', NULL, 7, NULL, NULL, 0, 'PendienteActivacion');
INSERT INTO `usuarios` VALUES (32, '2026-00042-INA', 'prueba10', 'prueba10', 'cuentadetrabajo123mujer@gmail.com', '$2a$11$IRTTl7QkwTmWtrkQtlkwK.GLdS3J0prIHi.2D3/BWbYv574rdQYnq', 7, NULL, NULL, 1, 'Activo');
INSERT INTO `usuarios` VALUES (33, 'ENC-013347F4', '', 'prueba10', 'jefferaguirrre@gmail.com', '$2a$11$y1hD4NE07Q/kWQGR1gMJFecpmi/VqXHIIobW/0lJqI1DbmtigwhFC', 8, NULL, NULL, 1, 'Activo');
-- 29 fila(s) en `usuarios`

