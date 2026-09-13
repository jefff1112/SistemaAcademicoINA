-- Script: Insertar nueva plantilla 'titulo_en_proceso' y modificar función SQL
-- para generar constancias de título en proceso usando la plantilla DOCX/HTML proporcionada.

-- 1. Insertar la plantilla en la BD (usando marcadores originales del doc/HTML)
INSERT INTO plantillas_constancias (nombre_plantilla, titulo, cuerpo, pie) 
VALUES ('titulo_en_proceso', 
'CONSTANCIA TÍTULO EN PROCESO',
'La Suscrita Directora del Instituto Nacional de Apopa, HACE CONSTAR QUE: {{nombreEstudiante}}, ha finalizado sus estudios del {{nivelBachillerato}} BACHILLERATO TÉCNICO VOCACIONAL EN {{especialidad}}, SECCIÓN: "{{seccion}}", en el año escolar {{anio}}, obteniendo "{{conducta}}" conducta. Se iniciará el proceso de trámite de legalización de título en el Ministerio de Educación.

Y, para los usos que el interesado estime conveniente se extiende la presente en la Ciudad de Apopa a los {{dia}} días del mes de {{mes}} de {{anioEmision}}.

{{nombreDirectora}}
Directora',
'Atentamente,');

-- 2. Verificar inserción
SELECT * FROM plantillas_constancias WHERE nombre_plantilla = 'titulo_en_proceso';