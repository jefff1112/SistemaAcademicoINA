-- ============================================================
--  REINICIO TOTAL Y RADICAL DE LA BASE DE DATOS
--  Sistema Academico INA - DB: sistema_academico (MySQL 8.4, WAMP)
--  Generado: 2026-08-11
--
--  ADVERTENCIAS (leer antes de ejecutar):
--  1. Detener el backend (dotnet) ANTES de ejecutar: evitara
--     escrituras concurrentes (auditoria, sesiones, errores).
--  2. Ejecutar con el cliente/root como TEXTO UTF-8:
--        mysql -u root -h 127.0.0.1 -P 3306 sistema_academico < reinicio_total_bd.sql
--  3. TRUNCATE es DDL: hace COMMIT implicito, no se puede deshacer.
--     Se recomienda un respaldo completo previo por si acaso:
--        mysqldump -u root -h 127.0.0.1 -P 3306 sistema_academico > respaldo_full.sql
--  4. Orden estricto del proceso: PASO 1 -> PASO 2 -> PASO 3.
--     NO modificar el orden de las secciones.
-- ============================================================

SET NAMES utf8mb4;

-- ============================================================
-- PASO 1: RESPALDO SELECTIVO DE ACCESO (DOCUMENTAL)
-- Los INSERTs de este bloque estan COMENTADOS a proposito: el
-- respaldo real quedo exportado en el archivo
-- "respaldo_usuarios.sql" (mysqldump, byte-exacto). Ejecutar
-- estos INSERTs antes del PASO 2 daria error de duplicados
-- (las tablas aun tienen datos). La reinsercion ejecutable
-- esta en el PASO 3.
-- Tablas preservadas: roles (catalogo de acceso, FK de
-- usuarios.rol_id), usuarios (solo login: codigo, nombres,
-- correo, contrasena BCrypt, rol_id, estado) y configuracion
-- (13 ajustes de la institucion: nombre, notas minimas, etc.,
-- no son datos de prueba).
-- id_referencia (asignaciones a docentes/estudiantes) queda
-- fuera: el reinicio elimina esas relaciones por diseno.
-- ============================================================

-- INSERT INTO `roles` ... (8 filas: ver PASO 3)
-- INSERT INTO `usuarios` ... (14 cuentas: ver PASO 3)
-- INSERT INTO `configuracion` ... (13 ajustes: ver PASO 3)

-- ============================================================
-- PASO 2: DESTRUCCION TOTAL (WIPE OUT)
-- TRUNCATE = borra datos Y reinicia AUTO_INCREMENT a 1.
-- Con FOREIGN_KEY_CHECKS=0 no importa el orden entre tablas.
-- Son 68 tablas reales. Las 14 VISTAS no almacenan datos y no
-- se truncan: aspirantes_aprobados/espera/pendientes/rechazados,
-- estudiantes_aspirantes, resumen_aspirantes, v_* y
-- vista_notas_finales_periodos.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `__efmigrationshistory`;
TRUNCATE TABLE `actividad_usuarios`;
TRUNCATE TABLE `actividades`;
TRUNCATE TABLE `actividades_entregas`;
TRUNCATE TABLE `actividades_periodos`;
TRUNCATE TABLE `administradores`;
TRUNCATE TABLE `asignacion_aulas`;
TRUNCATE TABLE `asistencias`;
TRUNCATE TABLE `asistencias_alertas`;
TRUNCATE TABLE `asistencias_configuracion`;
TRUNCATE TABLE `asistencias_justificaciones`;
TRUNCATE TABLE `asistencias_resumen`;
TRUNCATE TABLE `aspirantes`;
TRUNCATE TABLE `auditoria`;
TRUNCATE TABLE `auditoria_notas`;
TRUNCATE TABLE `auditoria_recuperaciones`;
TRUNCATE TABLE `aulas`;
TRUNCATE TABLE `avisos`;
TRUNCATE TABLE `avisos_internos`;
TRUNCATE TABLE `cache_sistema`;
TRUNCATE TABLE `calificaciones_actividades`;
TRUNCATE TABLE `clases`;
TRUNCATE TABLE `combinacion_materias`;
TRUNCATE TABLE `conducta_periodos`;
TRUNCATE TABLE `configuracion`;
TRUNCATE TABLE `constancia_asistencia_revert`;
TRUNCATE TABLE `constancias`;
TRUNCATE TABLE `correos_programados`;
TRUNCATE TABLE `cupos_especialidades`;
TRUNCATE TABLE `docente_materias`;
TRUNCATE TABLE `docentes`;
TRUNCATE TABLE `documentos_personas`;
TRUNCATE TABLE `documentosadministrativos`;
TRUNCATE TABLE `documentosdocentes`;
TRUNCATE TABLE `documentosestudiantes`;
TRUNCATE TABLE `edificios`;
TRUNCATE TABLE `errores_sistema`;
TRUNCATE TABLE `especialidades`;
TRUNCATE TABLE `especialidades_temp`;
TRUNCATE TABLE `estadisticas_tablas`;
TRUNCATE TABLE `estudiantes`;
TRUNCATE TABLE `faltas_amonestaciones`;
TRUNCATE TABLE `grados`;
TRUNCATE TABLE `historial_contrasenas`;
TRUNCATE TABLE `horarios`;
TRUNCATE TABLE `inscripciones`;
TRUNCATE TABLE `integridad_datos`;
TRUNCATE TABLE `intentos_login`;
TRUNCATE TABLE `inventario`;
TRUNCATE TABLE `materias`;
TRUNCATE TABLE `monitoreo_espacio`;
TRUNCATE TABLE `niveles_academicos`;
TRUNCATE TABLE `notificaciones`;
TRUNCATE TABLE `periodos_academicos`;
TRUNCATE TABLE `personas`;
TRUNCATE TABLE `plantillas_constancias`;
TRUNCATE TABLE `prestamos_equipo`;
TRUNCATE TABLE `promocion_automatica`;
TRUNCATE TABLE `recuperaciones`;
TRUNCATE TABLE `recuperaciones_contrasena`;
TRUNCATE TABLE `relaciones_familiares`;
TRUNCATE TABLE `reportes_pendientes`;
TRUNCATE TABLE `resultados_finales`;
TRUNCATE TABLE `resultados_periodos`;
TRUNCATE TABLE `roles`;
TRUNCATE TABLE `secciones`;
TRUNCATE TABLE `sesiones_usuarios`;
TRUNCATE TABLE `solicitudes_equipo`;
TRUNCATE TABLE `tipodocumentos`;
TRUNCATE TABLE `usuarios`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- PASO 3: REINSERCION LIMPIA
-- roles con sus IDs fijos (1-8): el codigo de la app los usa.
-- usuarios SIN id_usuario: reciben IDs nuevos 1..14.
-- SIN id_referencia: las relaciones con docentes/estudiantes
-- quedan rotas intencionalmente (se reasignaran al reingresar
-- datos reales).
-- ============================================================

INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`, `nivel_acceso`, `estado`) VALUES (1,'Administrador','Acceso total al sistema',1,1);
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`, `nivel_acceso`, `estado`) VALUES (2,'Director','Acceso a todo excepto configuracion',2,1);
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`, `nivel_acceso`, `estado`) VALUES (3,'Sub Director','Acceso limitado a gestion academica',3,1);
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`, `nivel_acceso`, `estado`) VALUES (4,'Registro Academico','Todos los permisos de gestion academica',2,1);
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`, `nivel_acceso`, `estado`) VALUES (5,'Coordinador','Supervision de docentes y materias',4,1);
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`, `nivel_acceso`, `estado`) VALUES (6,'Docente','Solo puede calificar y ver sus materias',5,1);
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`, `nivel_acceso`, `estado`) VALUES (7,'Estudiante','Solo puede consultar notas, horarios y avisos',6,1);
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`, `nivel_acceso`, `estado`) VALUES (8,'Encargado','Padres o tutores de estudiantes',6,1);

INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('admin','Administrador','del Sistema','admin@ina.edu.sv','$2a$11$bWtGBM9DWGJHIc9SWheVceDnLjiyPfCW3fFqi8ks.PJDzdiCJ.ymO',1,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('DIR001','Juan Carlos','Perez Rodriguez','direccion@ina.edu.sv','$2a$11$6iEhqDI1/yUmeSB3JjvfP.bnv6AW1yoXCPJWCKUL69hz8BB3WKeEa',2,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('REG001','Ana Maria','Lopez Castro','registro@ina.edu.sv','$2a$11$vrNXPdDJ4jYTkoKB.T3W2O/ZBQd3Zs3Hdyu17ZYyZzdnA8qSpJpbO',4,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('DOC001','Maria Elena','Rodriguez Castro','docente@ina.edu.sv','$2a$11$UfT7jEtzhOQTLVj0FomEAuJo.TKTfjCqsTehWl8dKGf2Y3oM/GHWC',6,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('2026-00001-INA','Ana Lucia','Perez Gomez','estudiante@ina.edu.sv','$2a$11$luOIw86cBHk8pstAPrWJuOJ8hLzn6ea3LRn/4J.gvFwIhWILqctIW',7,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('ENC001','Luis Alberto','Perez Martinez','encargado@google.com','$2a$11$u6Se/jUi5OdRAlOwyDTgxOxaBFTDSGEUuBpY1PYvntCP23kYipJVy',8,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('2026-00002-INA','jose','perez','josesito@gmail.com','$2a$11$hBMoA.hf4qaOiGTUWYty5OuyEOe1qFIvkxE4y0PvJ/RR1Z2EC8.uK',7,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('DIR002','Oscar','Cortez','Oscar@gmail.com','$2a$11$lkRXxePsGnWyYqSb3hmrw.w1jrJjgkR94yc2BX66ZuS4GS6mjX97y',3,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('2026-00010-INA','José Efraín','Pérez Argueta','jose19morado@gmail.com','$2a$11$9wFYjookN3BUkx5zXyt/.Oz1l5IYeItsom6cz5jMh0BWutm3d5bom',7,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('2026-00013-INA','Ian Andrew','Bonilla Hernandez','owenmejia12@gmail.com','$2a$11$HuJG7vIquzaVscAysCNTi.ETONt8RXXk2DWJcrZI3JcvJOukyrrDK',7,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('2026-00103-INA','FELIPE MEDRANO','BONILLA SUAREZ','santamariamadrededios@gmail.com','$2a$11$KNMhx8Z62Umrta38ARollu0vuqn5MHgtvICwXTQNflMMQLEO6.aM2',7,1);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('TEMPQA01','QA Test','Temp','qa@temp.local','$2a$11$oxxIUG2c6RpzbOGDJEjCYOwGC5yLnyiMyxCUVGaxWJ6Iw3QZreXLC',2,0);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('TEMPQA03','QA','Temp','qa3@temp.local','$2a$11$6J0FBqUKkzc8fdJwdl9unuoc91ES7gsWwM4rMoC9nXdmGoq9Y86Mq',2,0);
INSERT INTO `usuarios` (`codigo`, `nombres`, `apellidos`, `correo`, `contrasena`, `rol_id`, `estado`) VALUES ('2026-00127-INA','Juan Jose','Hernández Perez','juan19morado@gmail.com','$2a$11$2.//pWZAnnduRWoYdmIW0.WpYcishRCSh/VEnQmKxUTW7KpJ6urGy',7,1);

INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (1,'nombre_instituto','Instituto Nacional de Apopa','Nombre del instituto',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (2,'logo','logo.png','Logo del sistema',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (3,'anio_lectivo','2026','Año lectivo actual',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (4,'nota_minima_basica','60','Nota minima aprobatoria para materias basicas (0-100)',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (5,'nota_minima_especialidad','4','Nota minima aprobatoria para especialidad (1-5)',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (6,'escala_basica_max','100','Escala maxima para materias basicas',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (7,'escala_especialidad_max','5','Escala maxima para especialidad',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (8,'periodos_anio','4','Numero de periodos por año lectivo',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (9,'conducta_escala_max','10','Escala maxima para conducta',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (10,'telefono_contacto','2288-9966','Telefono de contacto del instituto',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (11,'correo_contacto','ina@mined.edu.sv','Correo de contacto del instituto',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (12,'director','Lic. Juan Perez','Nombre del director',NULL,NULL);
INSERT INTO `configuracion` (`id_configuracion`, `clave`, `valor`, `descripcion`, `creado_por`, `modificado_por`) VALUES (13,'lema','Educacion con excelencia','Lema del instituto',NULL,NULL);

-- ============================================================
-- VERIFICACION POST-EJECUCION (opcional):
-- SELECT COUNT(*) AS usuarios FROM usuarios;      -> 14
-- SELECT COUNT(*) AS roles FROM roles;            -> 8
-- SELECT COUNT(*) AS configs FROM configuracion;  -> 13
-- SELECT COUNT(*) AS docentes FROM docentes;      -> 0 (limpio)
-- ============================================================