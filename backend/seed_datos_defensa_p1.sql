-- ============================================================
--  SEED PARTE 1: CATALOGOS Y PERSONAL
--  Database: sistema_academico - Post-WIPE
--  Generado para demostracion de defensa del proyecto.
-- ============================================================

SET NAMES utf8mb4;

-- ---------- NIVELES ACADEMICOS ----------
INSERT INTO `niveles_academicos` (`id_niveles`, `nombre_nivel`, `tipo_media`, `duracion_anios`, `descripcion`, `estado`) VALUES
(1,'Bachillerato General','General',2,'Educacion media general (2 anios)',1),
(2,'Bachillerato Tecnico Vocacional','Especialidad',3,'Bachillerato tecnico vocacional (3 anios)',1),
(3,'Bachillerato Tecnico Productivo','Especialidad',3,'Bachillerato tecnico productivo (3 anios)',1);

-- ---------- GRADOS ----------
INSERT INTO `grados` (`id_grados`, `id_nivel`, `numero_grado`, `nombre_grado`, `orden`, `estado`) VALUES
(1,1,1,'Primer Año',1,1),
(2,1,2,'Segundo Año',2,1),
(3,2,1,'Primer Año',1,1),
(4,2,2,'Segundo Año',2,1),
(5,2,3,'Tercer Año',3,1),
(6,3,1,'Primer Año',1,1),
(7,3,2,'Segundo Año',2,1);

-- ---------- ESPECIALIDADES ----------
INSERT INTO `especialidades` (`id_especialidad`, `nombre_especialidad`, `descripcion`, `duracion_anios`, `estado`) VALUES
(1,'Tecnico Vocacional en Desarrollo de Software','Programacion, bases de datos y desarrollo de aplicaciones',3,1),
(2,'Tecnico Vocacional en Administrativo Contable','Contabilidad, administracion y planillas',3,1),
(3,'Tecnico Productivo en Salud y Bienestar','Salud preventiva, primeros auxilios y nutricion',3,1);

-- ---------- SECCIONES ----------
INSERT INTO `secciones` (`nombre_seccion`, `estado`) VALUES ('A',1),('B',1);

-- ---------- EDIFICIOS Y AULAS ----------
INSERT INTO `edificios` (`id_edificio`, `codigo_edificio`, `nombre_edificio`, `descripcion`, `estado`) VALUES
(1,'A','Edificio A','Salones de primero y segundo año',1),
(2,'B','Edificio B','Salones de especialidades y laboratorios',1);

INSERT INTO `aulas` (`id_aula`, `id_edificio`, `numero_aula`, `nivel_edificio`, `capacidad`, `tipo_aula`, `turno`, `estado`) VALUES
(1,1,'A-01',1,30,'Aula regular','Matutino',1),
(2,1,'A-02',1,30,'Aula regular','Matutino',1),
(3,1,'A-03',2,35,'Aula regular','Matutino',1),
(4,2,'B-01',1,30,'Aula regular','Matutino',1),
(5,2,'LAB-01',1,25,'Laboratorio de Informatica','Matutino',1),
(6,2,'LAB-02',1,25,'Laboratorio de Contabilidad','Matutino',1);

-- ---------- TIPOS DE DOCUMENTO ----------
INSERT INTO `tipodocumentos` (`id_documento`, `TipoDocumento`) VALUES
(1,'Partida de Nacimiento'),
(2,'Carnet de Menoridad'),
(3,'DUI'),
(4,'Notas de 9 Grado'),
(5,'Certificado de Conducta');

-- ---------- MATERIAS ----------
INSERT INTO `materias` (`id_materia`, `nombre_materia`, `codigo_materia`, `tipo_materia`, `escala_maxima`, `escala_minima`, `nota_minima`, `decimales_permitidos`, `id_especialidad`, `estado`) VALUES
(1,'Matematica','MAT-B01','Basica',100.00,0.00,60.00,1,NULL,1),
(2,'Lenguaje y Literatura','LEN-B02','Basica',100.00,0.00,60.00,1,NULL,1),
(3,'Ciencias Naturales','CIE-B03','Basica',100.00,0.00,60.00,1,NULL,1),
(4,'Estudios Sociales','EST-B04','Basica',100.00,0.00,60.00,1,NULL,1),
(5,'Ingles','ING-B05','Basica',100.00,0.00,60.00,1,NULL,1),
(6,'Informatica','INF-B06','Basica',100.00,0.00,60.00,1,NULL,1),
(7,'Programacion','PROG-E01','Especialidad',5.00,0.00,4.00,1,1,1),
(8,'Base de Datos','BD-E02','Especialidad',5.00,0.00,4.00,1,1,1),
(9,'Diseno Web','WEB-E03','Especialidad',5.00,0.00,4.00,1,1,1),
(10,'Contabilidad General','CONT-E01','Especialidad',5.00,0.00,4.00,1,2,1),
(11,'Administracion','ADM-E02','Especialidad',5.00,0.00,4.00,1,2,1),
(12,'Higiene y Salud','SAL-E01','Especialidad',5.00,0.00,4.00,1,3,1),
(13,'Primeros Auxilios','PAUX-E02','Especialidad',5.00,0.00,4.00,1,3,1);

-- ---------- PERIODOS ACADEMICOS ----------
INSERT INTO `periodos_academicos` (`id_periodo`, `anio_lectivo`, `numero_periodo`, `nombre`, `fecha_inicio`, `fecha_fin`, `estado`, `created_at`) VALUES
(1,2026,1,'I Periodo','2026-01-15','2026-03-15','Activo',NOW()),
(2,2026,2,'II Periodo','2026-03-16','2026-05-30','Cerrado',NOW()),
(3,2026,3,'III Periodo','2026-06-01','2026-08-15','Cerrado',NOW()),
(4,2026,4,'IV Periodo','2026-08-16','2026-10-30','Cerrado',NOW());

-- ---------- DOCENTES ----------
INSERT INTO `docentes` (`id_docente`, `codigo_docente`, `nip`, `nombres`, `apellidos`, `dui`, `nit`, `telefono`, `correo`, `direccion`, `especialidad_docente`, `tipo_docente`, `id_especialidad`, `fecha_ingreso`, `tipo_contrato`, `sueldo_base`, `valor_hora`, `horas_asignadas`, `id_rol`, `estado`, `situacion`) VALUES
(1,'DOC001','DOC001','Maria Elena','Rodriguez Castro','01010101-1','0610-010101-101-1','7711-0001','docente@ina.edu.sv','Colonia San Jose, Apopa','Matematica','Basica',NULL,'2019-01-15','Planta',900.00,12.50,20,6,1,'Activo'),
(2,'DOC002','DOC002','Carlos Alberto','Martinez Herrera','01020202-2','0610-010202-102-2','7711-0002','carlos.martinez@ina.edu.sv','Residencial Las Flores, Apopa','Ciencias Naturales','Basica',NULL,'2019-02-01','Planta',850.00,12.00,20,6,1,'Activo'),
(3,'DOC003','DOC003','Rosa Elvira','Castillo Lopez','01030303-3','0610-010303-103-3','7711-0003','rosa.castillo@ina.edu.sv','Colonia El Carmen, Apopa','Ingles','Basica',NULL,'2020-01-15','Planta',850.00,12.00,20,6,1,'Activo'),
(4,'DOC004','DOC004','Jose Manuel','Ramirez Flores','01040404-4','0610-010404-104-4','7711-0004','jose.ramirez@ina.edu.sv','Colonia La Campanera, San Salvador','Desarrollo de Software','Especialidad',1,'2020-02-01','Planta',950.00,14.00,20,6,1,'Activo'),
(5,'DOC005','DOC005','Karla Ivette','Sanchez Guevara','01050505-5','0610-010505-105-5','7711-0005','karla.sanchez@ina.edu.sv','Colonia Escalon, San Salvador','Contabilidad','Especialidad',2,'2021-01-15','Planta',950.00,14.00,20,6,1,'Activo'),
(6,'DOC006','DOC006','Fernando Enrique','Vasquez Rivas','01060606-6','0610-010606-106-6','7711-0006','fernando.vasquez@ina.edu.sv','Canton Santa Lucia, Apopa','Salud y Bienestar','Especialidad',3,'2021-02-01','Planta',900.00,13.00,20,6,1,'Activo');

-- ---------- ADMINISTRADORES ----------
INSERT INTO `administradores` (`id_admin`, `usuario`, `contraseña`, `nombre_completo`, `email`, `id_rol`) VALUES
(1,'admin','$2a$11$bWtGBM9DWGJHIc9SWheVceDnLjiyPfCW3fFqi8ks.PJDzdiCJ.ymO','Administrador del Sistema','admin@ina.edu.sv',1);