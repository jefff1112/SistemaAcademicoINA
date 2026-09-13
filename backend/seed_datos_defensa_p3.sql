-- ============================================================
--  SEED PARTE 3: NOTAS, ASISTENCIAS, CONDUCTA, AVISOS
--  Database: sistema_academico - Post-WIPE
--  Requiere: seed_datos_defensa_p1.sql y p2.sql ejecutados.
-- ============================================================

SET NAMES utf8mb4;

-- ---------- ACTIVIDADES ----------
-- Ponderaciones por clase (activas) suman <= 100% (validado por trigger).
INSERT INTO `actividades` (`id_materia`, `id_clase`, `id_docente`, `nombre_actividad`, `tipo_actividad`, `ponderacion`, `fecha_publicacion`, `fecha_limite`, `descripcion`, `estado`) VALUES
(1,1,1,'Tarea 1: Operaciones Básicas','Tarea',10.00,'2026-01-20','2026-01-27','Resolver ejercicios de operaciones combinadas','Activo'),
(1,1,1,'Examen Unidad I','Examen',20.00,'2026-02-02','2026-02-06','Examen de la unidad de conjuntos y numeros reales','Activo'),
(1,1,1,'Proyecto: Presupuesto Familiar','Proyecto',30.00,'2026-02-10','2026-02-24','Elaborar presupuesto familiar con datos reales','Cerrado'),
(1,1,1,'Participacion en Clase','Participacion',10.00,'2026-01-15','2026-03-10','Evaluacion continua de participacion','Activo'),
(2,1,1,'Ensayo: La Literatura Salvadorena','Tarea',15.00,'2026-01-22','2026-01-29','Ensayo sobre autores salvadorenos','Activo'),
(3,1,2,'Examen Unidad I: La Celula','Examen',25.00,'2026-02-03','2026-02-07','Examen de citologia','Activo'),
(4,1,2,'Investigacion: Simbolos Patrios','Tarea',15.00,'2026-01-26','2026-02-03','Investigacion historica de los simbolos patrios','Activo'),
(5,2,3,'Tarea: Vocabulario Unidad 2','Tarea',30.00,'2026-01-25','2026-02-01','Vocabulario de la unidad 2','Activo'),
(6,1,3,'Practica: Hoja de Calculo','Proyecto',5.00,'2026-02-12','2026-03-04','Practica de formulas en hoja de calculo','Cerrado'),
(7,3,4,'Tarea: Estructuras de Datos','Tarea',15.00,'2026-01-22','2026-01-29','Ejercicios de pilas y colas','Activo'),
(7,3,4,'Examen Parcial: Programacion','Examen',35.00,'2026-02-05','2026-02-09','Examen parcial de logica de programacion','Activo'),
(8,3,4,'Proyecto: Base de Datos Escolar','Proyecto',50.00,'2026-02-12','2026-03-05','Disenar e implementar base de datos del instituto','Activo'),
(7,4,4,'Examen: Logica de Programacion','Examen',50.00,'2026-02-06','2026-02-10','Examen de logica aplicada','Activo'),
(8,4,4,'Tarea: Modelo Relacional','Tarea',50.00,'2026-02-10','2026-02-20','Modelar entidades de un sistema de biblioteca','Activo'),
(10,6,5,'Tarea: Asientos Contables','Tarea',25.00,'2026-01-28','2026-02-04','Registrar asientos contables basicos','Activo'),
(11,6,5,'Proyecto: Planilla de Empleados','Proyecto',35.00,'2026-02-10','2026-03-06','Calcular planilla con deducciones de ley','Activo'),
(12,7,6,'Practica: Higiene Escolar','Tarea',30.00,'2026-01-27','2026-02-04','Practica de habitos de higiene personal','Activo'),
(13,7,6,'Practica: Vendajes','Proyecto',40.00,'2026-02-15','2026-03-01','Practica de tecnicas de vendaje basico','Activo');

-- ---------- ACTIVIDADES POR PERIODO ----------
INSERT INTO `actividades_periodos` (`id_actividad`, `id_periodo`, `ponderacion_periodo`) VALUES
(1,1,10.00),(2,1,20.00),(3,1,30.00),(4,1,10.00),(5,1,15.00),(6,1,25.00),(7,1,15.00),(8,1,30.00),
(9,1,5.00),(10,1,15.00),(11,1,35.00),(12,1,50.00),(13,1,50.00),(14,1,50.00),(15,1,25.00),
(16,1,35.00),(17,1,30.00),(18,1,40.00);

-- ---------- CALIFICACIONES DE ACTIVIDADES ----------
INSERT INTO `calificaciones_actividades` (`id_actividad`, `id_estudiante`, `nota`, `observaciones`, `registrado_por`) VALUES
(1,1,8.50,NULL,1),(1,2,7.00,NULL,1),(1,7,9.00,NULL,1),(1,8,7.50,NULL,1),
(2,1,8.00,NULL,1),(2,2,6.50,NULL,1),(2,7,8.50,NULL,1),(2,8,6.00,NULL,1),
(3,1,9.00,NULL,1),(3,2,7.50,NULL,1),(3,7,9.50,NULL,1),(3,8,7.00,NULL,1),
(4,1,8.80,NULL,1),(4,2,7.80,NULL,1),(4,7,9.20,NULL,1),(4,8,7.20,NULL,1),
(5,1,8.60,NULL,1),(5,2,7.40,NULL,1),(5,7,8.90,NULL,1),(5,8,7.10,NULL,1),
(6,1,7.80,NULL,2),(6,2,7.20,NULL,2),(6,7,8.00,NULL,2),(6,8,6.80,NULL,2),
(7,1,8.90,NULL,2),(7,2,7.00,NULL,2),(7,7,9.20,NULL,2),(7,8,7.40,NULL,2),
(8,9,8.50,NULL,3),(8,10,7.00,NULL,3),
(9,1,8.40,NULL,3),(9,7,8.80,NULL,3),
(10,3,8.00,NULL,4),(10,11,7.50,NULL,4),(10,12,9.00,NULL,4),
(11,3,7.50,NULL,4),(11,11,6.80,NULL,4),(11,12,8.70,NULL,4),
(12,3,8.20,NULL,4),(12,11,7.00,NULL,4),(12,12,9.30,NULL,4),
(13,13,8.00,NULL,4),(13,14,7.40,NULL,4),(13,6,8.60,NULL,4),
(14,13,8.30,NULL,4),(14,14,7.10,NULL,4),(14,6,8.10,NULL,4),
(15,4,7.60,NULL,5),(15,17,8.00,NULL,5),(15,18,6.90,NULL,5),
(16,4,8.00,NULL,5),(16,17,8.30,NULL,5),(16,18,7.20,NULL,5),
(17,5,8.30,NULL,6),(17,19,7.90,NULL,6),(17,20,8.10,NULL,6),
(18,5,8.10,NULL,6),(18,19,8.40,NULL,6),(18,20,7.80,NULL,6);

-- ---------- RESULTADOS POR PERIODO (Periodo 1 = Activo) ----------
INSERT INTO `resultados_periodos` (`id_estudiante`, `id_materia`, `id_clase`, `id_periodo`, `nota_acumulada`) VALUES
(1,1,1,1,8.30),(1,2,1,1,8.60),(1,3,1,1,7.80),(1,4,1,1,8.90),(1,5,1,1,8.00),(1,6,1,1,8.40),
(2,1,1,1,7.30),(2,2,1,1,7.40),(2,3,1,1,7.20),(2,4,1,1,7.00),(2,5,1,1,8.10),(2,6,1,1,6.90),
(7,1,1,1,9.00),(7,2,1,1,8.90),(7,3,1,1,8.00),(7,4,1,1,9.20),(7,5,1,1,8.80),(7,6,1,1,8.50),
(8,1,1,1,7.10),(8,2,1,1,7.10),(8,3,1,1,6.80),(8,4,1,1,7.40),(8,5,1,1,7.90),(8,6,1,1,7.20),
(9,1,2,1,8.40),(9,2,2,1,8.90),(9,3,2,1,8.20),(9,4,2,1,8.70),(9,5,2,1,8.50),
(10,1,2,1,7.20),(10,2,2,1,7.90),(10,3,2,1,7.00),(10,4,2,1,7.40),(10,5,2,1,7.00),
(3,7,3,1,7.90),(3,8,3,1,8.20),(3,5,3,1,7.90),(3,6,3,1,8.00),
(11,7,3,1,7.10),(11,8,3,1,7.00),(11,5,3,1,7.60),(11,6,3,1,7.30),
(12,7,3,1,9.00),(12,8,3,1,9.30),(12,5,3,1,8.80),(12,6,3,1,8.60),
(13,7,4,1,8.00),(13,8,4,1,8.30),
(14,7,4,1,7.40),(14,8,4,1,7.10),
(6,7,4,1,8.40),(6,8,4,1,8.10),
(15,7,5,1,9.10),(15,8,5,1,9.40),
(16,7,5,1,8.20),(16,8,5,1,8.50),
(4,10,6,1,7.80),(4,11,6,1,8.00),(4,5,6,1,8.20),(4,6,6,1,7.90),
(17,10,6,1,8.00),(17,11,6,1,8.30),(17,5,6,1,7.70),(17,6,6,1,8.10),
(18,10,6,1,6.90),(18,11,6,1,7.20),(18,5,6,1,7.40),(18,6,6,1,7.00),
(5,12,7,1,8.20),(5,13,7,1,8.10),
(19,12,7,1,7.90),(19,13,7,1,8.40),
(20,12,7,1,8.10),(20,13,7,1,7.80),
(21,7,8,1,8.70),(21,8,8,1,8.90),(21,5,8,1,7.80),
(22,7,8,1,7.50),(22,8,8,1,7.30),(22,5,8,1,7.10);

-- ---------- RESULTADOS FINALES (Anio 2026) ----------
INSERT INTO `resultados_finales` (`id_estudiante`, `id_materia`, `id_clase`, `anio_lectivo`, `nota_final`, `estado_materia`, `fecha_calculo`) VALUES
(1,1,1,2026,8.30,'Aprobado',NOW()), (1,2,1,2026,8.60,'Aprobado',NOW()), (1,3,1,2026,7.80,'Aprobado',NOW()), (1,4,1,2026,8.90,'Aprobado',NOW()), (1,5,1,2026,8.00,'Aprobado',NOW()), (1,6,1,2026,8.40,'Aprobado',NOW()),
(2,1,1,2026,7.30,'Aprobado',NOW()), (2,2,1,2026,7.40,'Aprobado',NOW()), (2,3,1,2026,7.20,'Aprobado',NOW()), (2,4,1,2026,7.00,'Aprobado',NOW()), (2,5,1,2026,8.10,'Aprobado',NOW()), (2,6,1,2026,6.90,'Recuperacion',NOW()),
(7,1,1,2026,9.00,'Aprobado',NOW()), (7,2,1,2026,8.90,'Aprobado',NOW()), (7,3,1,2026,8.00,'Aprobado',NOW()), (7,4,1,2026,9.20,'Aprobado',NOW()), (7,5,1,2026,8.80,'Aprobado',NOW()), (7,6,1,2026,8.50,'Aprobado',NOW()),
(3,7,3,2026,7.90,'Aprobado',NOW()), (3,8,3,2026,8.20,'Aprobado',NOW()), (3,5,3,2026,7.90,'Aprobado',NOW()), (3,6,3,2026,8.00,'Aprobado',NOW()),
(12,7,3,2026,9.00,'Aprobado',NOW()), (12,8,3,2026,9.30,'Aprobado',NOW()), (12,5,3,2026,8.80,'Aprobado',NOW()), (12,6,3,2026,8.60,'Aprobado',NOW()),
(6,7,4,2026,8.40,'Aprobado',NOW()), (6,8,4,2026,8.10,'Aprobado',NOW()),
(15,7,5,2026,9.10,'Aprobado',NOW()), (15,8,5,2026,9.40,'Aprobado',NOW()),
(16,7,5,2026,8.20,'Aprobado',NOW()), (16,8,5,2026,8.50,'Aprobado',NOW()),
(4,10,6,2026,7.80,'Aprobado',NOW()), (4,11,6,2026,8.00,'Aprobado',NOW()),
(18,10,6,2026,6.90,'Recuperacion',NOW()), (18,11,6,2026,7.20,'Aprobado',NOW()),
(5,12,7,2026,8.20,'Aprobado',NOW()), (5,13,7,2026,8.10,'Aprobado',NOW()),
(19,12,7,2026,7.90,'Aprobado',NOW()), (19,13,7,2026,8.40,'Aprobado',NOW());

-- ---------- CONDUCTA POR PERIODO ----------
INSERT INTO `conducta_periodos` (`id_estudiante`, `id_periodo`, `calificacion_conducta`, `observaciones`, `registrado_por`) VALUES
(1,1,'Excelente','Excelente participacion en clase',4),
(2,1,'Bueno','Requiere mejorar comportamiento en aula',4),
(3,1,'Muy Bueno',NULL,4),
(4,1,'Muy Bueno',NULL,4),
(5,1,'Excelente',NULL,4),
(6,1,'Muy Bueno',NULL,4),
(7,1,'Excelente',NULL,4),
(8,1,'Bueno',NULL,4),
(9,1,'Muy Bueno',NULL,4),
(10,1,'Muy Bueno',NULL,4),
(11,1,'Muy Bueno',NULL,4),
(12,1,'Excelente',NULL,4),
(13,1,'Muy Bueno',NULL,4),
(14,1,'Bueno','Amonestado por interrupciones',4),
(15,1,'Excelente',NULL,4),
(16,1,'Muy Bueno',NULL,4),
(17,1,'Muy Bueno',NULL,4),
(18,1,'Bueno',NULL,4),
(19,1,'Muy Bueno',NULL,4),
(20,1,'Muy Bueno',NULL,4),
(21,1,'Excelente',NULL,4),
(22,1,'Suficiente','Falta de atencion constante',4);

-- ---------- ASISTENCIAS ----------
INSERT INTO `asistencias` (`id_estudiante`, `id_clase`, `id_materia`, `id_docente`, `fecha`, `estado`, `hora_registro`, `minutos_tarde`, `observaciones`) VALUES
(1,1,1,1,'2026-01-13','Presente','07:02:00',0,NULL),
(1,1,1,1,'2026-01-14','Presente','07:01:00',0,NULL),
(1,1,1,1,'2026-01-15','Tarde','07:15:00',15,'Llego tarde por trafico'),
(1,1,1,1,'2026-01-16','Presente','07:00:00',0,NULL),
(1,1,1,1,'2026-01-20','Presente','07:03:00',0,NULL),
(1,1,1,1,'2026-01-21','Ausente','08:00:00',0,'Cita medica'),
(1,1,1,1,'2026-01-22','Presente','07:00:00',0,NULL),
(1,1,1,1,'2026-01-26','Tarde','07:10:00',10,NULL),
(1,1,1,1,'2026-01-27','Presente','07:01:00',0,NULL),
(1,1,1,1,'2026-01-28','Presente','07:02:00',0,NULL),
(2,1,1,1,'2026-01-13','Presente','07:00:00',0,NULL),
(2,1,1,1,'2026-01-14','Presente','07:05:00',0,NULL),
(2,1,1,1,'2026-01-15','Tarde','07:12:00',12,NULL),
(2,1,1,1,'2026-01-16','Presente','07:00:00',0,NULL),
(2,1,1,1,'2026-01-20','Ausente','08:10:00',0,'Motivo familiar'),
(2,1,1,1,'2026-01-21','Presente','07:00:00',0,NULL),
(3,3,7,4,'2026-01-13','Presente','07:01:00',0,NULL),
(3,3,7,4,'2026-01-14','Presente','07:03:00',0,NULL),
(3,3,7,4,'2026-01-16','Presente','07:00:00',0,NULL),
(3,3,7,4,'2026-01-20','Presente','07:02:00',0,NULL),
(3,3,7,4,'2026-01-22','Tarde','07:20:00',20,NULL),
(3,3,7,4,'2026-01-27','Presente','07:00:00',0,NULL),
(6,4,7,4,'2026-02-03','Presente','07:00:00',0,NULL),
(6,4,7,4,'2026-02-04','Presente','07:01:00',0,NULL),
(6,4,7,4,'2026-02-06','Ausente','08:00:00',0,'Sin justificacion'),
(6,4,7,4,'2026-02-10','Presente','07:00:00',0,NULL),
(6,4,7,4,'2026-02-11','Presente','07:05:00',0,NULL);

-- ---------- RESUMEN DE ASISTENCIA (Periodo 1) ----------
INSERT INTO `asistencias_resumen` (`id_estudiante`, `id_clase`, `anio_lectivo`, `periodo`, `total_dias`, `presentes`, `ausencias`, `tardanzas`, `justificadas`, `porcentaje_asistencia`) VALUES
(1,1,2026,1,10,7,1,2,1,90.00),
(2,1,2026,1,6,4,1,1,0,83.33),
(3,3,2026,1,6,5,0,1,0,91.66),
(6,4,2026,1,5,4,1,0,0,80.00);

-- ---------- FALTAS Y AMONESTACIONES ----------
INSERT INTO `faltas_amonestaciones` (`id_estudiante`, `id_docente`, `tipo`, `gravedad`, `fecha`, `descripcion`, `puntos_demerito`, `estado`, `registrado_por`) VALUES
(2,1,'Falta','Leve','2026-02-10','Uso de telefono celular en clase sin autorizacion',2,'Activa','DOC001'),
(14,4,'Amonestacion','Moderada','2026-02-18','Interrupciones repetidas durante la clase',5,'Activa','DOC004'),
(16,4,'Demerito','Grave','2026-02-25','Salida del aula sin autorizacion',8,'Activa','DOC004'),
(18,5,'Falta','Leve','2026-02-12','No entrego la tarea asignada',2,'Activa','DOC005');

-- ---------- AVISOS ----------
INSERT INTO `avisos` (`id_aviso`, `titulo_aviso`, `detalle_aviso`, `fecha_publicacion`, `id_admin`) VALUES
(1,'Inicio de Clases 2026','Bienvenida a toda la comunidad educativa del Instituto Nacional de Apopa. Las clases inician el 15 de enero de 2026 en horario de 7:00 a 12:00.', '2026-01-15 07:00:00',1),
(2,'Semana de Examenes - I Periodo','Los examenes del I periodo se realizaran del 2 al 6 de febrero. Estudiantes deben presentarse puntualmente con su carnet.', '2026-01-28 09:00:00',1),
(3,'Feriado de Semana Santa','Recordamos que del 29 de marzo al 4 de abril no habra clases por la celebracion de Semana Santa.', '2026-03-20 08:30:00',1),
(4,'Entrega de Notas I Periodo','Las notas del I periodo seran publicadas en el portal del estudiante a partir del 16 de marzo.', '2026-03-10 10:00:00',1);

-- ---------- NOTIFICACIONES ----------
INSERT INTO `notificaciones` (`titulo`, `mensaje`, `leida`, `tipo`, `destinatario_email`, `creado_por`) VALUES
('Bienvenida al Portal','Su cuenta fue creada exitosamente en el Sistema Academico INA',0,'interna','estudiante@ina.edu.sv',1),
('Reunion de Padres de Familia','El 5 de febrero se realizara la reunion general de padres a las 8:00 AM en el auditorio.',0,'interna','encargado@google.com',1),
('Resultados Publicados','Los resultados del I periodo ya estan disponibles en el portal.',0,'interna','estudiante@ina.edu.sv',1),
('Actividad Proxima','Recuerde que el examen de Programacion es el 9 de febrero.',0,'interna','jose19morado@gmail.com',4);

-- ---------- VINCULACION USUARIOS -> PERSONAL ----------
UPDATE `usuarios` SET `id_referencia` = 1 WHERE `codigo` = 'DOC001';
UPDATE `usuarios` SET `id_referencia` = 1 WHERE `codigo` = '2026-00001-INA';
UPDATE `usuarios` SET `id_referencia` = 2 WHERE `codigo` = '2026-00002-INA';
UPDATE `usuarios` SET `id_referencia` = 3 WHERE `codigo` = '2026-00010-INA';
UPDATE `usuarios` SET `id_referencia` = 4 WHERE `codigo` = '2026-00013-INA';
UPDATE `usuarios` SET `id_referencia` = 5 WHERE `codigo` = '2026-00103-INA';
UPDATE `usuarios` SET `id_referencia` = 6 WHERE `codigo` = '2026-00127-INA';
UPDATE `usuarios` SET `id_referencia` = 1 WHERE `codigo` = 'ENC001';