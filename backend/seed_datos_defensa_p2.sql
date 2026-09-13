-- ============================================================
--  SEED PARTE 2: DATOS ACADEMICOS (clases, horarios, aspirantes,
--  estudiantes, notas, asistencias, avisos...)
--  Database: sistema_academico - Post-WIPE
--  Requiere ejecutar primero: seed_datos_defensa_p1.sql
-- ============================================================

SET NAMES utf8mb4;

-- ---------- DOCENTE - MATERIAS - CLASES ----------
INSERT INTO `docente_materias` (`id_docente`, `id_materia`, `id_clase`, `anio_lectivo`, `puede_calificar`, `puede_amonestar`, `estado`) VALUES
(1,1,1,2026,1,1,1),
(1,1,2,2026,1,1,1),
(1,2,1,2026,1,1,1),
(2,2,2,2026,1,1,1),
(2,3,1,2026,1,1,1),
(2,3,2,2026,1,1,1),
(2,4,1,2026,1,1,1),
(2,4,2,2026,1,1,1),
(3,5,1,2026,1,1,1),
(3,5,2,2026,1,1,1),
(3,5,3,2026,1,1,1),
(3,5,6,2026,1,1,1),
(3,5,8,2026,1,1,1),
(3,6,1,2026,1,1,1),
(3,6,3,2026,1,1,1),
(3,6,6,2026,1,1,1),
(4,7,3,2026,1,1,1),
(4,7,4,2026,1,1,1),
(4,7,5,2026,1,1,1),
(4,7,8,2026,1,1,1),
(4,8,3,2026,1,1,1),
(4,8,4,2026,1,1,1),
(4,8,5,2026,1,1,1),
(4,8,8,2026,1,1,1),
(5,10,6,2026,1,1,1),
(5,11,6,2026,1,1,1),
(6,12,7,2026,1,1,1),
(6,13,7,2026,1,1,1);

-- ---------- CLASES ----------
INSERT INTO `clases` (`id_clase`, `id_nivel`, `id_grado`, `id_especialidad`, `id_seccion`, `nombre_clase`, `seccion`, `grupo`, `anio_lectivo_actual`, `promocion_automatica`, `estado`, `cupo_maximo`, `cupo_actual`, `anio_lectivo`) VALUES
(1,1,1,NULL,1,'Primer Año - Bachillerato General - Seccion A','A','A',2026,1,1,30,4,2026),
(2,1,2,NULL,1,'Segundo Año - Bachillerato General - Seccion A','A','A',2026,1,1,30,2,2026),
(3,2,3,1,1,'Primer Año - Tecnico Vocacional en Desarrollo de Software - Seccion A','A','A',2026,1,1,30,3,2026),
(4,2,4,1,1,'Segundo Año - Tecnico Vocacional en Desarrollo de Software - Seccion A','A','A',2026,1,1,30,3,2026),
(5,2,5,1,1,'Tercer Año - Tecnico Vocacional en Desarrollo de Software - Seccion A','A','A',2026,1,1,30,2,2026),
(6,2,3,2,1,'Primer Año - Tecnico Vocacional en Administrativo Contable - Seccion A','A','A',2026,1,1,30,3,2026),
(7,3,6,3,1,'Primer Año - Tecnico Productivo en Salud y Bienestar - Seccion A','A','A',2026,1,1,30,3,2026),
(8,2,3,1,2,'Primer Año - Tecnico Vocacional en Desarrollo de Software - Seccion B','B','B',2026,1,1,30,2,2026);

-- ---------- CUPOS POR ESPECIALIDAD ----------
INSERT INTO `cupos_especialidades` (`id_especialidad`, `seccion`, `cupos_totales`, `cupos_ocupados`, `anio_lectivo`) VALUES
(1,'A',30,8,2026),
(1,'B',30,2,2026),
(2,'A',30,3,2026),
(3,'A',30,3,2026);

-- ---------- HORARIOS ----------
INSERT INTO `horarios` (`id_clase`, `id_materia`, `id_docente`, `jornada`, `dia_semana`, `hora_inicio`, `hora_fin`, `aula`, `id_aula`, `periodo`, `estado`, `anio_lectivo`) VALUES
(1,1,1,'Matutina','Lunes','07:00:00','07:45:00','A-01',1,1,1,2026),
(1,2,1,'Matutina','Lunes','07:45:00','08:30:00','A-01',1,1,1,2026),
(1,5,3,'Matutina','Lunes','08:45:00','09:30:00','A-02',2,1,1,2026),
(1,3,2,'Matutina','Lunes','10:30:00','11:15:00','A-01',1,1,1,2026),
(1,1,1,'Matutina','Martes','07:00:00','07:45:00','A-01',1,1,1,2026),
(1,4,2,'Matutina','Martes','09:30:00','10:15:00','A-01',1,1,1,2026),
(1,2,1,'Matutina','Miercoles','07:45:00','08:30:00','A-01',1,1,1,2026),
(1,6,3,'Matutina','Miercoles','11:15:00','12:00:00','A-03',3,1,1,2026),
(1,1,1,'Matutina','Jueves','07:00:00','07:45:00','A-01',1,1,1,2026),
(1,4,2,'Matutina','Jueves','07:45:00','08:30:00','A-01',1,1,1,2026),
(1,5,3,'Matutina','Viernes','08:45:00','09:30:00','A-02',2,1,1,2026),
(1,3,2,'Matutina','Viernes','10:30:00','11:15:00','A-01',1,1,1,2026),
(2,1,1,'Matutina','Lunes','07:00:00','07:45:00','A-02',2,1,1,2026),
(2,2,2,'Matutina','Lunes','07:45:00','08:30:00','A-02',2,1,1,2026),
(2,5,3,'Matutina','Lunes','08:45:00','09:30:00','A-01',1,1,1,2026),
(2,4,2,'Matutina','Martes','07:00:00','07:45:00','A-02',2,1,1,2026),
(2,3,2,'Matutina','Miercoles','07:45:00','08:30:00','A-02',2,1,1,2026),
(2,1,1,'Matutina','Jueves','07:00:00','07:45:00','A-02',2,1,1,2026),
(2,4,2,'Matutina','Jueves','09:30:00','10:15:00','A-02',2,1,1,2026),
(2,5,3,'Matutina','Viernes','07:45:00','08:30:00','A-01',1,1,1,2026),
(3,7,4,'Matutina','Lunes','07:00:00','07:45:00','LAB-01',5,1,1,2026),
(3,8,4,'Matutina','Lunes','07:45:00','08:30:00','LAB-01',5,1,1,2026),
(3,5,3,'Matutina','Lunes','08:45:00','09:30:00','B-01',4,1,1,2026),
(3,6,3,'Matutina','Lunes','10:30:00','11:15:00','LAB-01',5,1,1,2026),
(3,7,4,'Matutina','Martes','07:00:00','07:45:00','LAB-01',5,1,1,2026),
(3,8,4,'Matutina','Martes','07:45:00','08:30:00','LAB-01',5,1,1,2026),
(3,7,4,'Matutina','Miercoles','08:45:00','09:30:00','LAB-01',5,1,1,2026),
(3,8,4,'Matutina','Jueves','07:45:00','08:30:00','LAB-01',5,1,1,2026),
(3,7,4,'Matutina','Viernes','07:00:00','07:45:00','LAB-01',5,1,1,2026),
(4,7,4,'Matutina','Lunes','07:00:00','07:45:00','LAB-01',5,1,1,2026),
(4,8,4,'Matutina','Lunes','07:45:00','08:30:00','LAB-01',5,1,1,2026),
(4,7,4,'Matutina','Martes','08:45:00','09:30:00','LAB-01',5,1,1,2026),
(4,8,4,'Matutina','Miercoles','07:00:00','07:45:00','LAB-01',5,1,1,2026),
(4,7,4,'Matutina','Jueves','07:45:00','08:30:00','LAB-01',5,1,1,2026),
(4,8,4,'Matutina','Viernes','10:30:00','11:15:00','LAB-01',5,1,1,2026),
(5,7,4,'Matutina','Lunes','07:00:00','07:45:00','B-01',4,1,1,2026),
(5,8,4,'Matutina','Lunes','08:45:00','09:30:00','B-01',4,1,1,2026),
(5,7,4,'Matutina','Martes','09:30:00','10:15:00','B-01',4,1,1,2026),
(5,8,4,'Matutina','Viernes','11:15:00','12:00:00','B-01',4,1,1,2026),
(6,10,5,'Matutina','Lunes','07:00:00','07:45:00','LAB-02',6,1,1,2026),
(6,11,5,'Matutina','Lunes','07:45:00','08:30:00','LAB-02',6,1,1,2026),
(6,5,3,'Matutina','Lunes','08:45:00','09:30:00','B-01',4,1,1,2026),
(6,6,3,'Matutina','Lunes','09:30:00','10:15:00','LAB-02',6,1,1,2026),
(6,10,5,'Matutina','Martes','07:00:00','07:45:00','LAB-02',6,1,1,2026),
(6,11,5,'Matutina','Miercoles','07:45:00','08:30:00','LAB-02',6,1,1,2026),
(7,12,6,'Matutina','Lunes','07:00:00','07:45:00','B-01',4,1,1,2026),
(7,13,6,'Matutina','Lunes','07:45:00','08:30:00','B-01',4,1,1,2026),
(7,12,6,'Matutina','Miercoles','08:45:00','09:30:00','B-01',4,1,1,2026),
(7,13,6,'Matutina','Jueves','07:45:00','08:30:00','B-01',4,1,1,2026),
(8,7,4,'Matutina','Lunes','07:00:00','07:45:00','LAB-01',5,1,1,2026),
(8,8,4,'Matutina','Lunes','07:45:00','08:30:00','LAB-01',5,1,1,2026),
(8,5,3,'Matutina','Lunes','08:45:00','09:30:00','B-01',4,1,1,2026),
(8,7,4,'Matutina','Martes','07:00:00','07:45:00','LAB-01',5,1,1,2026),
(8,8,4,'Matutina','Jueves','07:45:00','08:30:00','LAB-01',5,1,1,2026);

-- ---------- ASPIRANTES ----------
INSERT INTO `aspirantes` (`nombres`, `apellidos`, `dui`, `nacionalidad`, `fecha_nacimiento`, `genero`, `tipo_sangre`, `direccion`, `telefono`, `correo`, `escuela_procedencia`, `anio_estudio`, `promedio_anterior`, `conducta_puntaje`, `nivel_aspira`, `especialidad_aspira`, `nombre_padre`, `telefono_padre`, `nombre_madre`, `telefono_madre`, `num_hermanos`, `estado_solicitud`, `fecha_solicitud`, `observaciones`, `fecha_entrevista`, `entrevistado_por`, `observaciones_entrevista`, `fecha_aprobacion`, `aprobado_por`, `documentos_presentados`, `nie`, `nota_primer_periodo_escuela`, `nota_segundo_periodo_escuela`, `promedio_final_escuela`, `conducta_escuela`) VALUES
('Miguel Angel','Rivas Salaverria','02000001-1','Salvadoreña','2010-03-14','Masculino','O+','Colonia San Luis, Apopa','7788-1001','miguel.rivas@correo.com','Centro Escolar San Luis','9° Grado',8.20,9.0,'Bachillerato General',NULL,'Carlos Rivas','7788-2001','Sandra Salaverria','7788-3001',2,'Pendiente','2026-01-20 09:00:00','Aspirante con buen promedio',NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas','NIE-EXP-001',7.5,8.0,8.2,'Muy Bueno'),
('Karen Noemi','Ayala Martinez','02000002-2','Salvadoreña','2010-07-22','Femenino','A+','Residencial Los Angeles, Apopa','7788-1002','karen.ayala@correo.com','CE La Floresta','9° Grado',8.90,9.5,'Bachillerato Tecnico',1,'Jose Ayala','7788-2002','Marta Martinez','7788-3002',1,'Pendiente','2026-01-21 10:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas, Carnet','NIE-EXP-002',8.5,9.0,8.9,'Excelente'),
('Luis Eduardo','Mejia Benavides','02000003-3','Salvadoreña','2010-01-30','Masculino','B+','Canton El Rosario, Apopa','7788-1003','luis.mejia@correo.com','CE El Rosario','9° Grado',7.80,8.0,'Bachillerato Tecnico',2,'Rene Mejia','7788-2003','Adriana Benavides','7788-3003',3,'Pendiente','2026-01-22 11:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas','NIE-EXP-003',7.0,7.5,7.8,'Bueno'),
('Carlos Javier','Guevara Ponce','02000004-4','Salvadoreña','2010-05-11','Masculino','O-','Colonia La Campanera, Apopa','7788-1004','carlos.guevara@correo.com','CE La Campanera','9° Grado',8.10,8.5,'Bachillerato Tecnico',1,'Hector Guevara','7788-2004','Rosa Ponce','7788-3004',0,'Preseleccionado','2026-01-22 14:00:00','Preseleccionado por nota de examen',NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas','NIE-EXP-004',7.8,8.2,8.1,'Muy Bueno'),
('Ana Gabriela','Menjivar Castro','02000005-5','Salvadoreña','2010-09-18','Femenino','A-','Canton El Zapote, Apopa','7788-1005','ana.menjivar@correo.com','CE El Zapote','9° Grado',8.00,9.0,'Bachillerato Tecnico',3,'Walter Menjivar','7788-2005','Leticia Castro','7788-3005',1,'Preseleccionado','2026-01-23 09:00:00',NULL,NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas, Carnet','NIE-EXP-005',7.9,8.1,8.0,'Muy Bueno'),
('Rodrigo Alexander','Ayala Serrano','02000006-6','Salvadoreña','2010-11-05','Masculino','B-','Colonia Las Dalias, Apopa','7788-1006','rodrigo.ayala@correo.com','CE Las Dalias','9° Grado',7.00,7.5,'Bachillerato Tecnico',2,'Marcos Ayala','7788-2006','Julia Serrano','7788-3006',2,'Preseleccionado','2026-01-23 10:30:00','Necesita reforzar notas',NULL,NULL,NULL,NULL,NULL,'Notas','NIE-EXP-006',6.8,7.2,7.0,'Bueno'),
('Paola Michelle','Flores Ramirez','02000007-7','Salvadoreña','2010-04-26','Femenino','AB+','Residencial Las Colinas, Apopa','7788-1007','paola.flores@correo.com','CE Las Colinas','9° Grado',8.70,9.5,'Bachillerato Tecnico',1,'Roberto Flores','7788-2007','Claudia Ramirez','7788-3007',0,'Preseleccionado','2026-01-24 09:30:00','Excelente expediente',NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas','NIE-EXP-007',8.4,8.8,8.7,'Excelente'),
('Jose Roberto','Parada Linares','02000008-8','Salvadoreña','2010-08-03','Masculino','O+','Colonia San Miguel, Apopa','7788-1008','jose.parada@correo.com','CE San Miguel','9° Grado',8.50,9.0,'Bachillerato Tecnico',1,'Juan Parada','7788-2008','Carmen Linares','7788-3008',1,'Aprobado','2026-01-15 08:00:00','Aprobado con exito','2026-01-28 09:00:00','Direccion INA','Buen desempeño en entrevista','2026-02-02','Direccion INA','Partida de Nacimiento, Notas, Carnet, DUI Padre','NIE-EXP-008',8.0,8.6,8.5,'Excelente'),
('Sandra Yolanda','Quintanilla Vega','02000009-9','Salvadoreña','2010-02-14','Femenino','A+','Colonia La Solidaridad, Apopa','7788-1009','sandra.quintanilla@correo.com','CE La Solidaridad','9° Grado',8.30,8.5,'Bachillerato Tecnico',1,'Ramon Quintanilla','7788-2009','Vilma Vega','7788-3009',2,'Aprobado','2026-01-16 10:00:00',NULL,'2026-01-29 10:00:00','Direccion INA','Expediente completo','2026-02-03','Direccion INA','Partida de Nacimiento, Notas','NIE-EXP-009',8.1,8.4,8.3,'Muy Bueno'),
('Walter Ernesto','Pineda Amaya','02000010-0','Salvadoreña','2010-06-09','Masculino','B-','Canton Joya Grande, Apopa','7788-1010','walter.pineda@correo.com','CE Joya Grande','9° Grado',5.60,6.0,'Bachillerato Tecnico',2,'Salvador Pineda','7788-2010','Dina Amaya','7788-3010',3,'Rechazado','2026-01-19 09:00:00','Promedio por debajo del minimo',NULL,NULL,NULL,'2026-02-04','Comision INA','Notas','NIE-EXP-010',5.2,5.8,5.6,'Suficiente'),
('Claudia Marina','Ochoa Tamayo','02000011-1','Salvadoreña','2010-10-27','Femenino','O+','Residencial Las Perlas, Apopa','7788-1011','claudia.ochoa@correo.com','CE Las Perlas','9° Grado',5.90,6.5,'Bachillerato Tecnico',3,'Nelson Ochoa','7788-2011','Beatriz Tamayo','7788-3011',1,'Rechazado','2026-01-20 13:00:00','Documentacion incompleta',NULL,NULL,NULL,'2026-02-04','Comision INA','Notas','NIE-EXP-011',5.7,6.0,5.9,'Suficiente'),
('Alejandro Rafael','Vasquez Portillo','02000012-2','Salvadoreña','2010-03-03','Masculino','A-','Colonia El Milagro, Apopa','7788-1012','alejandro.vasquez@correo.com','CE El Milagro','9° Grado',7.60,8.0,'Bachillerato Tecnico',3,'Julio Vasquez','7788-2012','Sonia Portillo','7788-3012',2,'En Espera','2026-01-21 15:00:00','En lista de espera por cupo',NULL,NULL,NULL,NULL,NULL,'Partida de Nacimiento, Notas','NIE-EXP-012',7.2,7.7,7.6,'Bueno');

-- ---------- ESTUDIANTES ----------
INSERT INTO `estudiantes` (`nombres`, `apellidos`, `codigo_estudiante`, `dui`, `nacionalidad`, `fecha_nacimiento`, `genero`, `tipo_sangre`, `direccion`, `telefono_movil`, `correo_estudiante`, `id_clase`, `ano_ingreso`, `fecha_matricula`, `nombre_padre`, `telefono_padre`, `ocupacion_padre`, `nombre_madre`, `telefono_madre`, `ocupacion_madre`, `id_rol`, `estado`, `nie`) VALUES
('Ana Lucia','Perez Gomez','2026-00001-INA','03000001-1','Salvadorena','2009-05-12','Femenino','O+','Colonia San Jose, Apopa','7788-4001','estudiante@ina.edu.sv',1,2026,'2026-01-05','Luis Alberto Perez','7701-0001','Contador','Ana Beatriz Gomez','7701-0002','Ama de casa',7,1,'NIE-2026-01'),
('jose','perez','2026-00002-INA','03000002-2','Salvadorena','2008-11-03','Masculino','A+','Colonia San Jose, Apopa','7788-4002','josesito@gmail.com',1,2026,'2026-01-05','Luis Alberto Perez','7701-0001','Contador','Ana Beatriz Gomez','7701-0002','Ama de casa',7,1,'NIE-2026-02'),
('José Efraín','Pérez Argueta','2026-00010-INA','03000003-3','Salvadorena','2009-02-18','Masculino','O-','Colonia El Carmen, Apopa','7788-4003','jose19morado@gmail.com',3,2026,'2026-01-06','Efrain Perez','7701-0003','Comerciante','Rosa Argueta','7701-0004','Costurera',7,1,'NIE-2026-03'),
('Ian Andrew','Bonilla Hernandez','2026-00013-INA','03000004-4','Salvadorena','2009-07-25','Masculino','B+','Colonia La Campanera, San Salvador','7788-4004','owenmejia12@gmail.com',6,2026,'2026-01-06','Miguel Bonilla','7701-0005','Mecanico','Sandra Hernandez','7701-0006','Enfermera',7,1,'NIE-2026-04'),
('FELIPE MEDRANO','BONILLA SUAREZ','2026-00103-INA','03000005-5','Salvadorena','2008-09-14','Masculino','A-','Colonia Las Dalias, Apopa','7788-4005','santamariamadrededios@gmail.com',7,2026,'2026-01-06','Felipe Bonilla','7701-0007','Albañil','Carmen Suarez','7701-0008','Vendedora',7,1,'NIE-2026-05'),
('Juan Jose','Hernández Perez','2026-00127-INA','03000006-6','Salvadorena','2008-04-22','Masculino','O+','Canton Santa Lucia, Apopa','7788-4006','juan19morado@gmail.com',4,2026,'2026-01-07','Roberto Hernandez','7701-0009','Agricultor','Patricia Perez','7701-0010','Maestra',7,1,'NIE-2026-06'),
('Carlos Ernesto','Martinez Portillo','2026-00007-INA','03000007-7','Salvadorena','2009-06-30','Masculino','B-','Colonia San Luis, Apopa','7788-4007','carlos.martinez@pupilo.com',1,2026,'2026-01-05','Jorge Martinez','7701-0011','Piloto','Iris Portillo','7701-0012','Secretaria',7,1,'NIE-2026-07'),
('Daniela Beatriz','Hernandez Caceres','2026-00008-INA','03000008-8','Salvadorena','2009-01-09','Femenino','AB+','Residencial Las Flores, Apopa','7788-4008','daniela.hernandez@pupilo.com',1,2026,'2026-01-05','Oscar Hernandez','7701-0013','Contador','Ruth Caceres','7701-0014','Doctora',7,1,'NIE-2026-08'),
('Sofia Alejandra','Romero Alas','2026-00009-INA','03000009-9','Salvadorena','2008-08-17','Femenino','O+','Colonia El Carmen, Apopa','7788-4009','sofia.romero@pupilo.com',2,2026,'2026-01-05','Manuel Romero','7701-0015','Electricista','Glenda Alas','7701-0016','Cocinera',7,1,'NIE-2026-09'),
('Diego Alejandro','Mejia Quintanilla','2026-00011-INA','03000010-0','Salvadorena','2008-12-05','Masculino','A+','Colonia La Solidaridad, Apopa','7788-4010','diego.mejia@pupilo.com',2,2026,'2026-01-05','Rene Mejia','7701-0017','Chofer','Iliana Quintanilla','7701-0018','Ama de casa',7,1,'NIE-2026-10'),
('Katherine Michelle','Ayala Serrano','2026-00012-INA','03000011-1','Salvadorena','2009-03-28','Femenino','O-','Colonia Las Dalias, Apopa','7788-4011','katherine.ayala@pupilo.com',3,2026,'2026-01-06','Marcos Ayala','7701-0019','Policia','Julia Serrano','7701-0020','Enfermera',7,1,'NIE-2026-11'),
('Bryan Jose','Orellana Ventura','2026-00014-INA','03000012-2','Salvadorena','2009-10-11','Masculino','B+','Canton El Rosario, Apopa','7788-4012','bryan.orellana@pupilo.com',3,2026,'2026-01-06','Hugo Orellana','7701-0021','Jardinero','Marta Ventura','7701-0022','Vendedora',7,1,'NIE-2026-12'),
('Gabriela Estefany','Alvarado Perez','2026-00015-INA','03000013-3','Salvadorena','2008-07-19','Femenino','A-','Colonia San Miguel, Apopa','7788-4013','gabriela.alvarado@pupilo.com',4,2026,'2026-01-07','Saul Alvarado','7701-0023','Carpintero','Silvia Perez','7701-0024','Maestra',7,1,'NIE-2026-13'),
('Steven Alexander','Rivas Melendez','2026-00016-INA','03000014-4','Salvadorena','2008-05-02','Masculino','O+','Residencial Las Perlas, Apopa','7788-4014','steven.rivas@pupilo.com',4,2026,'2026-01-07','Carlos Rivas','7701-0025','Mecanico','Alicia Melendez','7701-0026','Ama de casa',7,1,'NIE-2026-14'),
('Andrea Paola','Flores Martinez','2026-00017-INA','03000015-5','Salvadorena','2007-11-23','Femenino','AB+','Colonia El Milagro, Apopa','7788-4015','andrea.flores@pupilo.com',5,2026,'2026-01-07','Roberto Flores','7701-0027','Contador','Claudia Ramirez','7701-0028','Abogada',7,1,'NIE-2026-15'),
('Kevin Josue','Vega Campos','2026-00018-INA','03000016-6','Salvadorena','2007-03-15','Masculino','B-','Colonia La Campanera, Apopa','7788-4016','kevin.vega@pupilo.com',5,2026,'2026-01-07','Luis Vega','7701-0029','Pintor','Nancy Campos','7701-0030','Ama de casa',7,1,'NIE-2026-16'),
('Nancy Michelle','Guzman Torres','2026-00019-INA','03000017-7','Salvadorena','2009-01-31','Femenino','O+','Colonia San Luis, Apopa','7788-4017','nancy.guzman@pupilo.com',6,2026,'2026-01-06','Pablo Guzman','7701-0031','Albañil','Sonia Torres','7701-0032','Costurera',7,1,'NIE-2026-17'),
('Eduardo Saul','Menjivar Carballo','2026-00020-INA','03000018-8','Salvadorena','2009-04-08','Masculino','A+','Canton Joya Grande, Apopa','7788-4018','eduardo.menjivar@pupilo.com',6,2026,'2026-01-06','Walter Menjivar','7701-0033','Agricultor','Leticia Carballo','7701-0034','Ama de casa',7,1,'NIE-2026-18'),
('Patricia Liliana','Cruz Escobar','2026-00021-INA','03000019-9','Salvadorena','2008-10-20','Femenino','O-','Colonia Las Flores, Apopa','7788-4019','patricia.cruz@pupilo.com',7,2026,'2026-01-06','Hernan Cruz','7701-0035','Bombero','Vilma Escobar','7701-0036','Ama de casa',7,1,'NIE-2026-19'),
('Jorge Alberto','Herrera Rivas','2026-00022-INA','03000020-0','Salvadorena','2008-02-27','Masculino','B+','Colonia La Esperanza, Apopa','7788-4020','jorge.herrera@pupilo.com',7,2026,'2026-01-06','David Herrera','7701-0037','Chofer','Claribel Rivas','7701-0038','Cocinera',7,1,'NIE-2026-20'),
('Beatriz Adriana','Marroquin Sosa','2026-00023-INA','03000021-1','Salvadorena','2009-09-06','Femenino','A-','Residencial Los Angeles, Apopa','7788-4021','beatriz.marroquin@pupilo.com',8,2026,'2026-01-07','Edwin Marroquin','7701-0039','Tecnico','Karla Sosa','7701-0040','Enfermera',7,1,'NIE-2026-21'),
('William Ernesto','Velasquez Giron','2026-00024-INA','03000022-2','Salvadorena','2009-12-14','Masculino','O+','Colonia El Zapote, Apopa','7788-4022','william.velasquez@pupilo.com',8,2026,'2026-01-07','Mario Velasquez','7701-0041','Comerciante','Rosa Giron','7701-0042','Vendedora',7,1,'NIE-2026-22');

-- ---------- PERSONAS (ENCARGADO Y FAMILIARES) ----------
INSERT INTO `personas` (`tipo_documento`, `numero_documento`, `nombres`, `apellidos`, `fecha_nacimiento`, `genero`, `telefono_principal`, `correo`, `direccion`, `ocupacion`, `id_usuario`) VALUES
('DUI','04000001-1','Luis Alberto','Perez Martinez','1975-08-20','Masculino','7701-0001','encargado@google.com','Colonia San Jose, Apopa','Contador',6),
('DUI','04000002-2','Ana Beatriz','Gomez Romero','1978-02-14','Femenino','7701-0002','ana.gomez@correo.com','Colonia San Jose, Apopa','Ama de casa',NULL),
('DUI','04000003-3','Roberto Carlos','Hernandez Torres','1974-11-30','Masculino','7701-0009','roberto.hernandez@correo.com','Canton Santa Lucia, Apopa','Agricultor',NULL),
('DUI','04000004-4','Juan Carlos','Perez Rodriguez','1970-05-10','Masculino','7799-0001','direccion@ina.edu.sv','Apopa','Director',2);

-- ---------- RELACIONES FAMILIARES ----------
INSERT INTO `relaciones_familiares` (`id_estudiante`, `id_persona`, `parentesco`, `vive_con_estudiante`, `recibe_comunicados`) VALUES
(1,1,'Padre',1,1),
(2,1,'Padre',1,1),
(1,2,'Madre',1,0),
(2,2,'Madre',1,0),
(6,3,'Padre',1,1);

-- ---------- INSCRIPCIONES ----------
INSERT INTO `inscripciones` (`id_estudiante`, `id_clase`, `anio_lectivo`, `fecha_inscripcion`, `fecha_matricula`, `tipo_inscripcion`, `estado_inscripcion`, `estado_aprobacion`, `fecha_aprobacion`, `aprobado_por`, `numero_expediente`, `numero_carnet`, `documentos_presentados`, `nie`) VALUES
(1,1,2026,'2026-01-05','2026-01-05','Regular','Confirmada','Aprobada','2026-01-05 08:30:00','Registro Academico','EXP-2026-001','CARNET-2026-001','Partida, Notas','NIE-2026-01'),
(2,1,2026,'2026-01-05','2026-01-05','Regular','Confirmada','Aprobada','2026-01-05 08:35:00','Registro Academico','EXP-2026-002','CARNET-2026-002','Partida, Notas','NIE-2026-02'),
(3,3,2026,'2026-01-06','2026-01-06','Regular','Confirmada','Aprobada','2026-01-06 08:30:00','Registro Academico','EXP-2026-003','CARNET-2026-003','Partida, Notas, DUI','NIE-2026-03'),
(4,6,2026,'2026-01-06','2026-01-06','Regular','Confirmada','Aprobada','2026-01-06 09:00:00','Registro Academico','EXP-2026-004','CARNET-2026-004','Partida, Notas','NIE-2026-04'),
(5,7,2026,'2026-01-06','2026-01-06','Regular','Confirmada','Aprobada','2026-01-06 09:10:00','Registro Academico','EXP-2026-005','CARNET-2026-005','Partida, Notas, Carnet','NIE-2026-05'),
(6,4,2026,'2026-01-07','2026-01-07','Regular','Confirmada','Aprobada','2026-01-07 08:40:00','Registro Academico','EXP-2026-006','CARNET-2026-006','Partida, Notas','NIE-2026-06'),
(7,1,2026,'2026-01-05','2026-01-06','Nuevo Ingreso','Confirmada','Aprobada','2026-01-06 10:00:00','Registro Academico','EXP-2026-007','CARNET-2026-007','Partida, Notas','NIE-2026-07'),
(8,1,2026,'2026-01-05','2026-01-06','Nuevo Ingreso','Confirmada','Aprobada','2026-01-06 10:05:00','Registro Academico','EXP-2026-008','CARNET-2026-008','Partida, Notas','NIE-2026-08'),
(9,2,2026,'2026-01-05','2026-01-06','Regular','Confirmada','Aprobada','2026-01-06 10:10:00','Registro Academico','EXP-2026-009','CARNET-2026-009','Partida, Notas','NIE-2026-09'),
(10,2,2026,'2026-01-05','2026-01-06','Regular','Confirmada','Aprobada','2026-01-06 10:15:00','Registro Academico','EXP-2026-010','CARNET-2026-010','Partida, Notas','NIE-2026-10'),
(11,3,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:00:00','Registro Academico','EXP-2026-011','CARNET-2026-011','Partida, Notas, Carnet','NIE-2026-11'),
(12,3,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:05:00','Registro Academico','EXP-2026-012','CARNET-2026-012','Partida, Notas','NIE-2026-12'),
(13,4,2026,'2026-01-07','2026-01-07','Regular','Confirmada','Aprobada','2026-01-07 09:10:00','Registro Academico','EXP-2026-013','CARNET-2026-013','Partida, Notas','NIE-2026-13'),
(14,4,2026,'2026-01-07','2026-01-07','Regular','Confirmada','Aprobada','2026-01-07 09:15:00','Registro Academico','EXP-2026-014','CARNET-2026-014','Partida, Notas','NIE-2026-14'),
(15,5,2026,'2026-01-07','2026-01-07','Regular','Confirmada','Aprobada','2026-01-07 09:20:00','Registro Academico','EXP-2026-015','CARNET-2026-015','Partida, Notas','NIE-2026-15'),
(16,5,2026,'2026-01-07','2026-01-07','Regular','Confirmada','Aprobada','2026-01-07 09:25:00','Registro Academico','EXP-2026-016','CARNET-2026-016','Partida, Notas','NIE-2026-16'),
(17,6,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:30:00','Registro Academico','EXP-2026-017','CARNET-2026-017','Partida, Notas, Carnet','NIE-2026-17'),
(18,6,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:35:00','Registro Academico','EXP-2026-018','CARNET-2026-018','Partida, Notas','NIE-2026-18'),
(19,7,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:40:00','Registro Academico','EXP-2026-019','CARNET-2026-019','Partida, Notas, DUI','NIE-2026-19'),
(20,7,2026,'2026-01-06','2026-01-07','Nuevo Ingreso','Confirmada','Aprobada','2026-01-07 09:45:00','Registro Academico','EXP-2026-020','CARNET-2026-020','Partida, Notas','NIE-2026-20'),
(21,8,2026,'2026-01-07','2026-01-08','Nuevo Ingreso','Confirmada','Aprobada','2026-01-08 09:00:00','Registro Academico','EXP-2026-021','CARNET-2026-021','Partida, Notas, Carnet','NIE-2026-21'),
(22,8,2026,'2026-01-07','2026-01-08','Nuevo Ingreso','Confirmada','Aprobada','2026-01-08 09:05:00','Registro Academico','EXP-2026-022','CARNET-2026-022','Partida, Notas','NIE-2026-22');