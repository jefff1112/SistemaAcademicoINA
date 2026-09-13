-- Script: agregar columna `documentos` (JSON) a la tabla `aspirantes` para soportar
-- la carga de documentos múltiples (Partida de Nacimiento, Notas de 9°, DUI,
-- Carnet de Menoridad, Constancia de Conducta, etc.) desde el formulario de Nuevo Ingreso.
-- Fecha: 2026-08-16

USE `sistema_academico`;

ALTER TABLE `aspirantes`
    ADD COLUMN `documentos` TEXT NULL AFTER `foto`;