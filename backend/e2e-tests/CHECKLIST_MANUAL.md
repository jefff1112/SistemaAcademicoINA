# Checklist Manual de Pruebas - Cuadro Auxiliar Digital

## 📋 Prerrequisitos
- [ ] Backend corriendo en `http://localhost:5228`
- [ ] Frontend corriendo en `http://localhost:3000`
- [ ] Migraciones 08 y 09 ejecutadas en BD
- [ ] Usuarios de prueba creados (docente, registro, director)
- [ ] Al menos 1 clase con estudiantes matriculados
- [ ] Al menos 1 materia asignada a la clase
- [ ] Períodos académicos 1-4 del año actual

---

## 🔐 1. AUTENTICACIÓN Y ACCESO

| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| **Login Docente** | 1. Ir a `/login`<br>2. Credenciales docente<br>3. Click Iniciar | Redirige a dashboard docente |
| **Acceso Cuadro Auxiliar (Docente)** | 1. Navegar a `/docente/cuadro-auxiliar` | Vista "Cuadro Auxiliar Digital" visible |
| **Login Registro** | Login con usuario registro | Dashboard registro |
| **Acceso Cuadro Auxiliar (Registro)** | Navegar a `/registro/cuadro-auxiliar` | Vista completa con botones Importar/Exportar |
| **Login Dirección** | Login con usuario director | Dashboard dirección |
| **Acceso Cuadro Auxiliar (Dirección)** | Navegar a `/direccion/cuadro-auxiliar` | Vista completa |

---

## 🎯 2. SELECCIÓN DE FILTROS Y CARGA DE DATOS

| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| **Cargar clases** | Click en select "Clase" | Lista de clases del año actual |
| **Seleccionar clase → Materias** | 1. Seleccionar clase<br>2. Esperar 1s | Select "Materia" se habilita con materias de esa clase |
| **Seleccionar materia → Período** | 1. Seleccionar materia<br>2. Esperar 1s | Select "Período" muestra períodos del año |
| **Carga completa (Clase+Materia+Período)** | Seleccionar los 3 filtros | Tabla aparece con estudiantes y columnas de sub-actividades |

**Verificar estructura de columnas:**
- [ ] Columna fija: **CÓDIGO**
- [ ] Columna fija: **NOMBRES**
- [ ] 3 Grupos de actividad (35%, 35%, 30%)
- [ ] Cada grupo: 5 sub-actividades (20% c/u = 100%)
  - AUTOEVALUACIÓN
  - COEVALUACIÓN
  - PRUEBA OBJETIVA 1
  - PRUEBA OBJETIVA 2
  - PRUEBA OBJETIVA 3
- [ ] Columna: **PROMEDIO FINAL DE PERIODO** (naranja)
- [ ] Columna: **CORRECCIÓN, RECUPERACIÓN** (rojo)

---

## ✏️ 3. EDICIÓN DE NOTAS Y GUARDADO AUTOMÁTICO

| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| **Editar celda** | 1. Click en input sub-actividad<br>2. Escribir `8.5`<br>3. Press Tab o click fuera | Valor aceptado, border verde (#16a34a) |
| **Validación rango 0-10** | Escribir `11` o `-1` | Mensaje error "La nota debe estar entre 0 y 10" |
| **Guardado automático (debounce)** | 1. Editar nota<br>2. Esperar 1s sin recargar<br>3. Recargar página (F5)<br>4. Verificar nota persiste | Nota guardada en BD y visible tras recarga |
| **Editar múltiples celdas** | Editar 5 sub-actividades seguidas | Todas se guardan (verificar en BD o recarga) |
| **Colores semáforo** | Probar notas: `9` (verde), `5.5` (dorado), `4` (rojo) | Border cambia color según semáforo |

---

## 🧮 4. CÁLCULO AUTOMÁTICO DE PROMEDIOS

| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| **Promedio actividad (5 sub × 20%)** | Poner `10` en 5 sub de Actividad 1 | Nota Actividad 1 = 10.0 |
| **Promedio periodo (3 act × 35/35/30)** | Poner `10` en todas las sub (15 celdas) | Promedio Final = 10.00 |
| **Promedio ponderado mixto** | Actividad 1: todas 8 (35%)<br>Actividad 2: todas 6 (35%)<br>Actividad 3: todas 4 (30%) | (8×0.35)+(6×0.35)+(4×0.30) = 6.10 |
| **Sub-actividades sin nota** | Dejar algunas vacías | Promedio calcula solo las que tienen nota |
| **Recálculo tras edición** | Cambiar una nota de 8 a 10 | Promedio Final se actualiza automáticamente |

---

## 🔴 5. COLUMNA RECUPERACIÓN (CORRECCIÓN)

| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| **Ingresar recuperación** | En columna "CORRECCIÓN, RECUPERACIÓN" poner `6.5` | Valor aceptado, border rojo (#ef4444) |
| **Recuperación reemplaza final** | 1. Promedio calculado = 4.0<br>2. Ingresar recuperación 6.5 | Celda "Promedio Final" muestra **6.5** (no 4.0) |
| **Recuperación 0 o vacía** | Dejar vacío o poner 0 | No afecta, usa promedio calculado |
| **Guardado recuperación** | Recargar página → verificar | Persiste en BD (`resultados_periodos.nota_recuperacion`) |

---

## ⚙️ 6. CONFIGURACIÓN DE ACTIVIDADES (MODAL ⚙️)

| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| **Abrir modal** | Click "⚙️ Config. Actividades" | Modal se abre con título "Configurar Actividades y Sub-actividades" |
| **Ver actividades existentes** | En modal | Lista actividades con badge: "XX% / 100% ✓" o "⏳ Incompleto" |
| **Crear Estructura Estándar** | Click "✨ Crear Estructura Estándar (3×5)" | 3 actividades × 5 sub = 100% cada una, mensaje éxito |
| **Validación 100%** | Cambiar ponderación sub a 50% | Badge muestra "50% / 100% ⏳ Incompleto" |
| **Editar nombre sub-actividad** | Cambiar "AUTOEVALUACIÓN" → "AUTO EVALUACIÓN" | Nombre actualiza en tabla principal al cerrar modal |
| **Cerrar modal** | Click "Cerrar" o X | Modal cierra, tabla refleja cambios |

---

## 📥📤 7. PLANTILLA / EXPORTAR / IMPORTAR EXCEL

| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| **Descargar Plantilla** | 1. Seleccionar Clase+Materia+Período<br>2. Click "📥 Plantilla" | Archivo `Plantilla_CuadroAuxiliar_Seccion_Materia_P#.xlsx` descargado |
| **Estructura Plantilla** | Abrir en Excel | - Filas 1-9: Encabezados INA<br>- Fila 10: Headers (CODIGO, NOMBRES, 15 sub, PROMEDIO, RECUPERACIÓN)<br>- Fila 11: Ponderaciones (20% c/u)<br>- Filas 12+: Estudiantes con celdas vacías |
| **Exportar Excel** | Click "📊 Exportar Excel" | Archivo `Cuadro_Auxiliar_...xlsx` con datos actuales + formato oficial |
| **Exportar múltiples hojas** | Sin filtros (todas clases) | Un archivo .xlsx con una hoja por clase/materia/período |
| **Importar Excel** | 1. Descargar plantilla<br>2. Llenar algunas notas en Excel<br>3. Guardar<br>4. Click "📤 Importar" → seleccionar archivo<br>5. Click "Importar" | Mensaje "Importación completada: X nuevas, Y actualizadas" + tabla actualizada |

---

## 🎨 8. PALETA INA - VERIFICACIÓN VISUAL

| Elemento | Color Esperado | Código Hex | Verificación |
|----------|----------------|------------|--------------|
| **Header tabla / Sidebar / Navbar** | Azul INA Profundo | `#1A2E6B` | `rgb(26, 46, 107)` |
| **Botones primarios (Exportar, Config, Guardar)** | Azul Real INA | `#2B47B8` | `rgb(43, 71, 184)` |
| **Botones editar/plantilla/secundarios** | Dorado INA | `#C8A832` | `rgb(200, 168, 50)` |
| **Fondo tarjetas / body** | Blanco Institucional | `#EEF1F9` | `rgb(238, 241, 249)` |
| **Nota ≥ 6 (Aprobado)** | Verde | `#16a34a` | Border input + bg `#f0fdf4` |
| **Nota 5-5.9 (Recuperación)** | Dorado | `#C8A832` | Border input + bg `#fffbeb` |
| **Nota < 5 (Reprobado)** | Rojo | `#dc2626` | Border input + bg `#fef2f2` |
| **Promedio Final** | Naranja | `#fb923c` | Header + bg `#fff7ed` |
| **Recuperación** | Rojo | `#ef4444` | Header + bg `#fef2f2` |

**Cómo verificar en navegador:**
1. F12 → Inspector → Click elemento → Styles → Background-color / Border-color
2. O consola: `getComputedStyle(document.querySelector('button:has-text("Exportar Excel")')).backgroundColor`

---

## 🔄 9. FLUJO COMPLETO END-TO-END

**Escenario: Profesor califica a su clase del Periodo 1**

```
[ ] 1. Login como Docente
[ ] 2. Ir a /docente/cuadro-auxiliar
[ ] 3. Seleccionar: Clase "1A" → Materia "MATEMATICA" → Periodo "1"
[ ] 4. Verificar: 35 estudiantes cargados, 15 sub-actividades + 2 finales
[ ] 5. Click "⚙️ Config. Actividades" → "✨ Crear Estructura Estándar (3×5)" → Cerrar
[ ] 6. Para estudiante "001 - PEREZ, JUAN":
      [ ] Sub-act 1 (Autoevaluación): 9
      [ ] Sub-act 2 (Coevaluación): 8
      [ ] Sub-act 3 (Prueba 1): 10
      [ ] Sub-act 4 (Prueba 2): 7
      [ ] Sub-act 5 (Prueba 3): 8
      [ ] Repetir para Actividad 2 y 3
[ ] 7. Verificar: Promedio Final calculado automáticamente ≈ 8.5
[ ] 8. Estudiante "002 - LOPEZ, MARIA" va mal: poner Recuperación = 6.0
[ ] 9. Verificar: Su Promedio Final ahora muestra 6.0 (reemplaza calculado)
[ ] 10. Click "📊 Exportar Excel" → Abrir archivo → Verificar formato idéntico a plantilla oficial
[ ] 11. Click "📥 Plantilla" → Llenar notas para otra materia → "📤 Importar" → Datos importados
[ ] 12. Logout → Login como Registro Académico → Verificar mismos datos en /registro/cuadro-auxiliar
```

---

## 🐛 10. CASOS EDGE Y ERRORES

| Caso | Comportamiento Esperado |
|------|------------------------|
| Sin actividades configuradas | Mensaje "No hay actividades configuradas para esta materia/clase/periodo" |
| Sin estudiantes en clase | Mensaje "No hay estudiantes en esta clase para el periodo seleccionado" |
| Docente sin permiso en materia | Error 403 "No tiene autorización para calificar esta materia" |
| Nota fuera de rango (11, -1) | Toast error "La nota debe estar entre 0 y 10" |
| Red caída al guardar | Toast error "Error al guardar nota" + nota NO perdida en UI (reintento) |
| Período inactivo | Se puede seleccionar pero con advertencia visual |
| Navegación browser back/forward | Estado de filtros se mantiene |

---

## ✅ CRITERIOS DE ACEPTACIÓN FINAL

**El sistema está listo para producción si:**

- [ ] Todos los tests manuales arriba pasan
- [ ] Tests automatizados Playwright pasan (`npx playwright test`)
- [ ] Paleta INA aplicada consistentemente en todo el componente
- [ ] Cálculos matemáticos exactos (verificar con calculadora)
- [ ] Exportación Excel abre correctamente en Excel/LibreOffice
- [ ] Importación no duplica ni pierde datos
- [ ] Performance: tabla con 40 estudiantes × 15 sub-actividades < 2s carga
- [ ] Responsive: funciona en 1366px, 1920px, tablet (scroll horizontal)
- [ ] Accesibilidad: navegación por Tab, labels en inputs, contraste AA

---

## 📝 REGISTRO DE EJECUCIÓN

| Fecha | Ejecutor | Resultado | Observaciones |
|-------|----------|-----------|---------------|
|       |          |           |               |
|       |          |           |               |

---

**Firma QA:** _________________ **Fecha:** _________________

**Firma Dev:** _________________ **Fecha:** _________________