-- ============================================================
-- FIX: Usuario Encargado existente sin Persona ni RelacionFamiliar
-- Usuario id=33 (ENC-013347F4) fue creado ANTES del fix
-- ============================================================

USE sistema_academico;

-- 1. Verificar el usuario existente
SELECT '=== USUARIO ENCARGADO ID=33 ===' as info;
SELECT IdUsuario, Codigo, Nombres, Apellidos, Correo, RolId, Estado, EstadoActivacion
FROM usuarios WHERE IdUsuario = 33;

-- 2. Verificar si ya tiene Persona
SELECT '=== PERSONA EXISTENTE PARA IDUSUARIO=33 ===' as info;
SELECT * FROM personas WHERE IdUsuario = 33;

-- 3. Verificar si ya tiene RelacionFamiliar
SELECT '=== RELACIONES FAMILIARES EXISTENTES ===' as info;
SELECT rf.* 
FROM relaciones_familiares rf
JOIN personas p ON rf.IdPersona = p.IdPersona
WHERE p.IdUsuario = 33;

-- 4. Verificar el estudiante vinculado por EmailEncargado
SELECT '=== ESTUDIANTE VINCULADO POR EMAIL ENCARGADO ===' as info;
SELECT e.IdEstudiante, e.Nombres, e.Apellidos, e.CodigoEstudiante, e.EmailEncargado
FROM estudiantes e
JOIN usuarios u ON e.EmailEncargado = u.Correo
WHERE u.IdUsuario = 33;

-- 5. CREAR PERSONA PARA EL ENCARGADO (si no existe)
-- Usamos DUI único generado para evitar duplicate key
INSERT IGNORE INTO personas (TipoDocumento, NumeroDocumento, Nombres, Apellidos, TelefonoPrincipal, Correo, IdUsuario)
SELECT 'DUI', CONCAT('ENC-DUI-', u.IdUsuario), u.Nombres, u.Apellidos, '', u.Correo, u.IdUsuario
FROM usuarios u
WHERE u.IdUsuario = 33
  AND u.RolId = 8
  AND NOT EXISTS (SELECT 1 FROM personas WHERE IdUsuario = 33);

-- 6. CREAR RELACION FAMILIAR (si no existe)
-- Buscar el estudiante vinculado por EmailEncargado
INSERT IGNORE INTO relaciones_familiares (IdEstudiante, IdPersona, Parentesco, ViveConEstudiante, RecibeComunicados)
SELECT 
    e.IdEstudiante,
    p.IdPersona,
    'Encargado',
    true,
    true
FROM usuarios u
JOIN personas p ON p.IdUsuario = u.IdUsuario
JOIN estudiantes e ON e.EmailEncargado = u.Correo
WHERE u.IdUsuario = 33
  AND u.RolId = 8
  AND NOT EXISTS (
      SELECT 1 FROM relaciones_familiares rf 
      JOIN personas p2 ON rf.IdPersona = p2.IdPersona 
      WHERE p2.IdUsuario = 33
  );

-- 7. VERIFICAR RESULTADO
SELECT '=== VERIFICACIÓN FINAL ===' as info;
SELECT 'Persona creada:' as check, COUNT(*) as count FROM personas WHERE IdUsuario = 33;
SELECT 'RelacionFamiliar creada:' as check, COUNT(*) as count 
FROM relaciones_familiares rf
JOIN personas p ON rf.IdPersona = p.IdPersona
WHERE p.IdUsuario = 33;

-- 8. MOSTRAR DATOS COMPLETOS PARA EL DASHBOARD
SELECT '=== DATOS PARA DASHBOARD ENCARGADO ===' as info;
SELECT 
    e.IdEstudiante,
    e.Nombres,
    e.Apellidos,
    e.CodigoEstudiante,
    e.Nie,
    rf.Parentesco,
    c.NombreClase,
    c.Seccion
FROM usuarios u
JOIN personas p ON p.IdUsuario = u.IdUsuario
JOIN relaciones_familiares rf ON rf.IdPersona = p.IdPersona
JOIN estudiantes e ON e.IdEstudiante = rf.IdEstudiante
LEFT JOIN clases c ON e.IdClase = c.IdClase
WHERE u.IdUsuario = 33
  AND rf.RecibeComunicados = true;