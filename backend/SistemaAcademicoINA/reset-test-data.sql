-- ============================================================
-- SCRIPT: Limpieza de datos de prueba para test limpio
-- Ejecutar antes de cada test end-to-end
-- ============================================================

USE sistema_academico;

-- Desactivar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Limpiar RelacionesFamiliares de personas de prueba
DELETE FROM relaciones_familiares 
WHERE IdPersona IN (SELECT IdPersona FROM personas WHERE Correo LIKE '%test%' OR Correo LIKE '%prueba%');

-- 2. Limpiar Personas de prueba
DELETE FROM personas 
WHERE Correo LIKE '%test%' OR Correo LIKE '%prueba%';

-- 3. Limpiar TokensActivacion de usuarios de prueba (encargados y estudiantes)
DELETE FROM tokens_activacion 
WHERE UsuarioId IN (
    SELECT IdUsuario FROM usuarios 
    WHERE Correo LIKE '%test%' OR Correo LIKE '%prueba%' 
       OR Codigo LIKE 'ENC-%'
);

-- 4. Limpiar Usuarios de prueba (encargados ENC-% y correos test)
DELETE FROM usuarios 
WHERE Correo LIKE '%test%' OR Correo LIKE '%prueba%' 
   OR Codigo LIKE 'ENC-%';

-- 5. Limpiar Aspirantes de prueba
DELETE FROM aspirantes 
WHERE Correo LIKE '%test%' OR Correo LIKE '%prueba%' 
   OR EmailEncargado LIKE '%test%' OR EmailEncargado LIKE '%prueba%';

-- 6. Limpiar Estudiantes de prueba
DELETE FROM estudiantes 
WHERE CorreoEstudiante LIKE '%test%' OR CorreoEstudiante LIKE '%prueba%' 
   OR EmailEncargado LIKE '%test%' OR EmailEncargado LIKE '%prueba%';

-- 7. Limpiar Inscripciones de estudiantes de prueba (si quedaron huérfanas)
DELETE FROM inscripciones 
WHERE IdEstudiante NOT IN (SELECT IdEstudiante FROM estudiantes);

-- Reactivar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verificar limpieza
SELECT 'Usuarios test/ENC:' as tabla, COUNT(*) as count FROM usuarios WHERE Correo LIKE '%test%' OR Codigo LIKE 'ENC-%';
SELECT 'Personas test:' as tabla, COUNT(*) as count FROM personas WHERE Correo LIKE '%test%';
SELECT 'Aspirantes test:' as tabla, COUNT(*) as count FROM aspirantes WHERE Correo LIKE '%test%';
SELECT 'Estudiantes test:' as tabla, COUNT(*) as count FROM estudiantes WHERE CorreoEstudiante LIKE '%test%';
SELECT 'TokensActivacion test:' as tabla, COUNT(*) as count FROM tokens_activacion WHERE UsuarioId IN (SELECT IdUsuario FROM usuarios WHERE Correo LIKE '%test%' OR Codigo LIKE 'ENC-%');