-- Fix Encargado relationship for user 33 (Persona IdPersona=5)
-- Link Encargado to a student so they can see them in the dashboard

USE sistema_academico;

-- 1. Check current state
SELECT '=== ENCARGADO USER 33 ===' as info;
SELECT u.IdUsuario, u.Codigo, u.Nombres, u.Apellidos, u.Correo, u.RolId
FROM usuarios u WHERE u.IdUsuario = 33;

SELECT '=== PERSONA FOR USER 33 ===' as info;
SELECT p.IdPersona, p.Nombres, p.Apellidos, p.Correo, p.IdUsuario
FROM personas p WHERE p.IdUsuario = 33;

SELECT '=== EXISTING RELACIONES FOR PERSONA 5 ===' as info;
SELECT rf.*, e.Nombres as EstudianteNombres, e.Apellidos as EstudianteApellidos, e.CodigoEstudiante
FROM relaciones_familiares rf
JOIN estudiantes e ON rf.IdEstudiante = e.IdEstudiante
WHERE rf.IdPersona = 5;

SELECT '=== ALL STUDENTS ===' as info;
SELECT e.IdEstudiante, e.Nombres, e.Apellidos, e.CodigoEstudiante, e.EmailEncargado
FROM estudiantes e WHERE e.Estado = 1;

-- 2. Find a student to link (preferably one with matching EmailEncargado)
-- Get the Encargado's email
SELECT '=== ENCARGADO EMAIL ===' as info;
SELECT u.Correo as EncargadoEmail
FROM usuarios u WHERE u.IdUsuario = 33;

-- 3. Find student with matching EmailEncargado
SELECT '=== STUDENT WITH MATCHING EMAIL ===' as info;
SELECT e.IdEstudiante, e.Nombres, e.Apellidos, e.CodigoEstudiante, e.EmailEncargado
FROM estudiantes e 
WHERE e.EmailEncargado = (SELECT Correo FROM usuarios WHERE IdUsuario = 33);

-- 4. CREATE THE RELATIONSHIP (run this if step 3 returns a student)
-- Replace STUDENT_ID with the actual IdEstudiante from step 3
-- INSERT IGNORE INTO relaciones_familiares (IdEstudiante, IdPersona, Parentesco, ViveConEstudiante, RecibeComunicados)
-- VALUES (STUDENT_ID, 5, 'Encargado', true, true);

-- 5. VERIFY
-- SELECT '=== VERIFICATION ===' as info;
-- SELECT rf.*, e.Nombres as EstudianteNombres, e.Apellidos as EstudianteApellidos, e.CodigoEstudiante
-- FROM relaciones_familiares rf
-- JOIN estudiantes e ON rf.IdEstudiante = e.IdEstudiante
-- WHERE rf.IdPersona = 5 AND rf.RecibeComunicados = true;