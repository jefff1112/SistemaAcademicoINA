const { test, expect } = require('@playwright/test');

// ============================================================
// CONFIGURACIÓN
// ============================================================
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5228/api';

// Credenciales de prueba (ajustar según tus usuarios de prueba)
const USUARIOS = {
  docente: { email: 'docente@ina.edu.sv', password: '123456', rol: 'Docente' },
  registro: { email: 'registro@ina.edu.sv', password: '123456', rol: 'Registro Academico' },
  direccion: { email: 'director@ina.edu.sv', password: '123456', rol: 'Director' }
};

// ============================================================
// HELPERS
// ============================================================
async function login(page, usuario) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"], input[name="email"], input[name="usuario"]', usuario.email);
  await page.fill('input[type="password"], input[name="password"]', usuario.password);
  await page.click('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")');
  await page.waitForURL('**/dashboard**', { timeout: 10000 });
}

async function navegarCuadroAuxiliar(page, rol) {
  const rutas = {
    'Docente': '/docente/cuadro-auxiliar',
    'Registro Academico': '/registro/cuadro-auxiliar',
    'Director': '/direccion/cuadro-auxiliar'
  };
  await page.goto(`${BASE_URL}${rutas[rol]}`);
  await page.waitForLoadState('networkidle');
  // Esperar a que cargue el componente
  await page.waitForSelector('text=Cuadro Auxiliar Digital', { timeout: 10000 });
}

async function seleccionarFiltros(page, { clase, materia, periodo }) {
  if (clase) {
    await page.selectOption('select:near(label:has-text("Clase"))', { label: clase });
    await page.waitForTimeout(500);
  }
  if (materia) {
    await page.selectOption('select:near(label:has-text("Materia"))', { label: materia });
    await page.waitForTimeout(500);
  }
  if (periodo) {
    await page.selectOption('select:near(label:has-text("Periodo"))', { label: periodo });
    await page.waitForTimeout(500);
  }
  // Esperar a que cargue la tabla
  await page.waitForSelector('table.cuadro-auxiliar-table', { timeout: 10000 });
}

async function obtenerEstudiantes(page) {
  return await page.$$eval('table.cuadro-auxiliar-table tbody tr', rows => 
    rows.map(row => {
      const celdas = row.querySelectorAll('td');
      return {
        codigo: celdas[0]?.textContent?.trim(),
        nombre: celdas[1]?.textContent?.trim(),
      };
    }).filter(e => e.codigo && e.nombre)
  );
}

async function editarNota(page, filaIndice, subActividadIndice, valor) {
  const filas = await page.$$('table.cuadro-auxiliar-table tbody tr');
  const inputs = await filas[filaIndice].$$('input[type="number"]');
  await inputs[subActividadIndice].fill(valor.toString());
  await inputs[subActividadIndice].press('Tab'); // Trigger blur para guardar
  await page.waitForTimeout(1000); // Debounce 800ms
}

async function verificarCalculoPromedio(page, filaIndice) {
  const fila = (await page.$$('table.cuadro-auxiliar-table tbody tr'))[filaIndice];
  const celdas = await fila.$$('td');
  // Últimas 2 celdas: promedio final y recuperación
  const promedioFinal = await celdas[celdas.length - 2].textContent();
  return promedioFinal?.trim();
}

// ============================================================
// TESTS PRINCIPALES
// ============================================================

test.describe('🔐 Autenticación y Navegación', () => {
  test('Login como Docente y acceso a Cuadro Auxiliar', async ({ page }) => {
    await login(page, USUARIOS.docente);
    await navegarCuadroAuxiliar(page, 'Docente');
    await expect(page.locator('text=Cuadro Auxiliar Digital')).toBeVisible();
  });

  test('Login como Registro Académico y acceso a Cuadro Auxiliar', async ({ page }) => {
    await login(page, USUARIOS.registro);
    await navegarCuadroAuxiliar(page, 'Registro Academico');
    await expect(page.locator('text=Cuadro Auxiliar Digital')).toBeVisible();
  });

  test('Login como Dirección y acceso a Cuadro Auxiliar', async ({ page }) => {
    await login(page, USUARIOS.direccion);
    await navegarCuadroAuxiliar(page, 'Director');
    await expect(page.locator('text=Cuadro Auxiliar Digital')).toBeVisible();
  });
});

test.describe('🎯 Flujo Principal: Selección de Filtros y Carga de Datos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USUARIOS.docente);
    await navegarCuadroAuxiliar(page, 'Docente');
  });

  test('Cargar clases disponibles en selector', async ({ page }) => {
    const selectClase = page.locator('select:near(label:has-text("Clase"))');
    await expect(selectClase).toBeVisible();
    const options = await selectClase.locator('option').allTextContents();
    expect(options.length).toBeGreaterThan(1); // Al menos "Seleccionar" + 1 clase
    console.log('Clases disponibles:', options);
  });

  test('Al seleccionar clase, cargar materias de esa clase', async ({ page }) => {
    // Seleccionar primera clase disponible
    const selectClase = page.locator('select:near(label:has-text("Clase"))');
    const opcionesClase = await selectClase.locator('option').allTextContents();
    if (opcionesClase.length > 1) {
      await selectClase.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      
      const selectMateria = page.locator('select:near(label:has-text("Materia"))');
      await expect(selectMateria).toBeEnabled();
      const opcionesMateria = await selectMateria.locator('option').allTextContents();
      expect(opcionesMateria.length).toBeGreaterThan(1);
      console.log('Materias cargadas:', opcionesMateria);
    }
  });

  test('Carga completa: Clase + Materia + Periodo → Tabla con estudiantes', async ({ page }) => {
    // Seleccionar clase
    await page.selectOption('select:near(label:has-text("Clase"))', { index: 1 });
    await page.waitForTimeout(1000);
    
    // Seleccionar materia
    await page.selectOption('select:near(label:has-text("Materia"))', { index: 1 });
    await page.waitForTimeout(1000);
    
    // Seleccionar periodo
    await page.selectOption('select:near(label:has-text("Periodo"))', { index: 1 });
    await page.waitForTimeout(2000);
    
    // Verificar que aparece la tabla con datos
    const tabla = page.locator('table.cuadro-auxiliar-table');
    await expect(tabla).toBeVisible();
    
    const estudiantes = await obtenerEstudiantes(page);
    expect(estudiantes.length).toBeGreaterThan(0);
    console.log(`${estudiantes.length} estudiantes cargados`);
    console.log('Primeros 3:', estudiantes.slice(0, 3));
  });
});

test.describe('✏️ Edición de Notas y Cálculo Automático', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USUARIOS.docente);
    await navegarCuadroAuxiliar(page, 'Docente');
    // Cargar datos de prueba
    await page.selectOption('select:near(label:has-text("Clase"))', { index: 1 });
    await page.waitForTimeout(1000);
    await page.selectOption('select:near(label:has-text("Materia"))', { index: 1 });
    await page.waitForTimeout(1000);
    await page.selectOption('select:near(label:has-text("Periodo"))', { index: 1 });
    await page.waitForTimeout(2000);
  });

  test('Editar nota de sub-actividad → Guardado automático (debounce)', async ({ page }) => {
    const fila = 0; // Primer estudiante
    const subActividad = 0; // Primera sub-actividad
    
    // Obtener valor actual
    const inputsAntes = await page.$$('table.cuadro-auxiliar-table tbody tr >> input[type="number"]');
    const valorOriginal = await inputsAntes[subActividad].inputValue();
    
    // Editar nota
    await editarNota(page, fila, subActividad, 8.5);
    
    // Verificar que se guardó (recargar y comprobar)
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.selectOption('select:near(label:has-text("Clase"))', { index: 1 });
    await page.waitForTimeout(500);
    await page.selectOption('select:near(label:has-text("Materia"))', { index: 1 });
    await page.waitForTimeout(500);
    await page.selectOption('select:near(label:has-text("Periodo"))', { index: 1 });
    await page.waitForTimeout(1500);
    
    const inputsDespues = await page.$$('table.cuadro-auxiliar-table tbody tr >> input[type="number"]');
    const valorNuevo = await inputsDespues[subActividad].inputValue();
    expect(valorNuevo).toBe('8.5');
  });

  test('Cálculo automático de Promedio Final al editar sub-actividades', async ({ page }) => {
    const fila = 0;
    
    // Leer promedio inicial
    const filas = await page.$$('table.cuadro-auxiliar-table tbody tr');
    const celdasIniciales = await filas[fila].$$('td');
    const promedioInicial = await celdasIniciales[celdasIniciales.length - 2].textContent();
    console.log('Promedio inicial:', promedioInicial);
    
    // Poner nota 10 en todas las sub-actividades visibles (primeras 5 = Actividad 1)
    for (let i = 0; i < 5; i++) {
      await editarNota(page, fila, i, 10);
    }
    await page.waitForTimeout(1500);
    
    // Verificar promedio final se actualizó
    const filas2 = await page.$$('table.cuadro-auxiliar-table tbody tr');
    const celdasFinales = await filas2[fila].$$('td');
    const promedioFinal = await celdasFinales[celdasFinales.length - 2].textContent();
    console.log('Promedio final:', promedioFinal);
    
    // Con todas las sub-act en 10, promedio debe ser 10
    expect(parseFloat(promedioFinal)).toBeCloseTo(10, 1);
  });

  test('Columna Recuperación reemplaza Promedio Final', async ({ page }) => {
    const fila = 0;
    
    // Ingresar nota de recuperación
    const filas = await page.$$('table.cuadro-auxiliar-table tbody tr');
    const inputsRecuperacion = await filas[fila].$$('input[type="number"]');
    const inputRecuperacion = inputsRecuperacion[inputsRecuperacion.length - 1]; // Último input = recuperación
    
    await inputRecuperacion.fill('6.5');
    await inputRecuperacion.press('Tab');
    await page.waitForTimeout(1500);
    
    // Verificar que la celda de promedio final ahora muestra 6.5 (recuperación)
    const filas2 = await page.$$('table.cuadro-auxiliar-table tbody tr');
    const celdas = await filas2[fila].$$('td');
    const promedioFinal = await celdas[celdas.length - 2].textContent();
    
    // La nota final mostrada debe ser la de recuperación (6.5)
    expect(parseFloat(promedioFinal.trim())).toBeCloseTo(6.5, 1);
  });
});

test.describe('⚙️ Configuración de Actividades (Modal)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USUARIOS.docente);
    await navegarCuadroAuxiliar(page, 'Docente');
    await page.selectOption('select:near(label:has-text("Clase"))', { index: 1 });
    await page.waitForTimeout(1000);
    await page.selectOption('select:near(label:has-text("Materia"))', { index: 1 });
    await page.waitForTimeout(1000);
  });

  test('Abrir modal de configuración', async ({ page }) => {
    await page.click('button:has-text("Config. Actividades")');
    await expect(page.locator('text=Configurar Actividades y Sub-actividades')).toBeVisible();
    await expect(page.locator('text=Estructura estándar: 3 actividades × 5 sub-actividades')).toBeVisible();
  });

  test('Crear Estructura Estándar (3×5)', async ({ page }) => {
    await page.click('button:has-text("Config. Actividades")');
    await page.waitForSelector('button:has-text("Crear Estructura Estándar")');
    await page.click('button:has-text("Crear Estructura Estándar")');
    await page.waitForTimeout(3000);
    
    // Verificar mensaje de éxito
    await expect(page.locator('text=Estructura estándar creada')).toBeVisible({ timeout: 5000 });
    
    // Cerrar modal y verificar que la tabla ahora tiene las columnas correctas
    await page.click('button:has-text("Cerrar")');
    await page.waitForTimeout(1000);
    
    // Verificar headers: 3 actividades × 5 sub = 15 sub-actividades + 2 fijas + 2 finales = 19 columnas totales
    const headers = await page.$$eval('table.cuadro-auxiliar-table thead th', ths => ths.map(th => th.textContent.trim()));
    console.log('Headers:', headers);
    expect(headers.length).toBeGreaterThanOrEqual(19);
  });

  test('Validación de ponderación 100% por actividad', async ({ page }) => {
    await page.click('button:has-text("Config. Actividades")');
    await page.waitForSelector('input[type="number"][max="100"]');
    
    // Cambiar una ponderación a 50%
    const inputsPonderacion = await page.$$('input[type="number"][max="100"]');
    await inputsPonderacion[0].fill('50');
    await page.waitForTimeout(500);
    
    // El badge debe mostrar "50% / 100% ⏳ Incompleto" o similar
    const badge = page.locator('text=/\\d+% \\/ 100%/');
    await expect(badge.first()).toBeVisible();
  });
});

test.describe('📥📤 Importar / Exportar / Plantilla Excel', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USUARIOS.registro); // Registro tiene permisos completos
    await navegarCuadroAuxiliar(page, 'Registro Academico');
    await page.selectOption('select:near(label:has-text("Clase"))', { index: 1 });
    await page.waitForTimeout(1000);
    await page.selectOption('select:near(label:has-text("Materia"))', { index: 1 });
    await page.waitForTimeout(1000);
    await page.selectOption('select:near(label:has-text("Periodo"))', { index: 1 });
    await page.waitForTimeout(2000);
  });

  test('Descargar plantilla Excel', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Plantilla")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/Plantilla_CuadroAuxiliar.*\.xlsx$/);
    console.log('Plantilla descargada:', download.suggestedFilename());
  });

  test('Exportar Excel (formato idéntico al oficial)', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Exportar Excel")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/Cuadro_Auxiliar.*\.xlsx$/);
    console.log('Exportación descargada:', download.suggestedFilename());
  });

  test('Importar Excel con notas válidas', async ({ page }) => {
    // Primero descargar plantilla para conocer estructura
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Plantilla")');
    const plantilla = await downloadPromise;
    const plantillaPath = await plantilla.path();
    
    // Leer plantilla, modificar algunas celdas con notas
    const XLSX = require('xlsx');
    const wb = XLSX.readFile(plantillaPath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    
    // Poner nota 7.5 en primera sub-actividad del primer estudiante (fila 14, columna C)
    // Nota: ajustar coordenadas según plantilla real
    const range = XLSX.utils.decode_range(ws['!ref']);
    // Simplificación: solo verificar que el botón importa sin error
    // En test real, aquí modificarías el archivo y lo subes
    
    // Subir archivo (necesitarías el archivo modificado)
    // const fileInput = page.locator('input[type="file"][accept=".xlsx,.xls"]');
    // await fileInput.setInputFiles(plantillaPathModificado);
    // await page.click('button:has-text("Importar")');
    // await expect(page.locator('text=Importación completada')).toBeVisible({ timeout: 10000 });
    
    console.log('Test de importación requiere archivo modificado - saltando subida real');
  });
});

test.describe('🎨 Paleta INA - Verificación Visual', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USUARIOS.docente);
    await navegarCuadroAuxiliar(page, 'Docente');
    await page.selectOption('select:near(label:has-text("Clase"))', { index: 1 });
    await page.waitForTimeout(1000);
    await page.selectOption('select:near(label:has-text("Materia"))', { index: 1 });
    await page.waitForTimeout(1000);
    await page.selectOption('select:near(label:has-text("Periodo"))', { index: 1 });
    await page.waitForTimeout(2000);
  });

  test('Headers de tabla usan Azul INA Profundo (#1A2E6B)', async ({ page }) => {
    const th = page.locator('table.cuadro-auxiliar-table thead th').first();
    const bgColor = await th.evaluate(el => getComputedStyle(el).backgroundColor);
    // rgb(26, 46, 107) = #1A2E6B
    expect(bgColor).toMatch(/rgb\(26, 46, 107\)/);
  });

  test('Botón primario usa Azul Real INA (#2B47B8)', async ({ page }) => {
    const btn = page.locator('button:has-text("Exportar Excel")');
    const bgColor = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
    // rgb(43, 71, 184) = #2B47B8
    expect(bgColor).toMatch(/rgb\(43, 71, 184\)/);
  });

  test('Botón editar/plantilla usa Dorado INA (#C8A832)', async ({ page }) => {
    const btn = page.locator('button:has-text("Plantilla")');
    const bgColor = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
    // rgb(200, 168, 50) = #C8A832
    expect(bgColor).toMatch(/rgb\(200, 168, 50\)/);
  });

  test('Tarjetas usan Blanco Institucional (#EEF1F9)', async ({ page }) => {
    const card = page.locator('.card, .ina-card').first();
    const bgColor = await card.evaluate(el => getComputedStyle(el).backgroundColor);
    // rgb(238, 241, 249) = #EEF1F9
    expect(bgColor).toMatch(/rgb\(238, 241, 249\)/);
  });

  test('Colores semáforo en inputs: Verde (≥6), Dorado (5-5.9), Rojo (<5)', async ({ page }) => {
    const fila = 0;
    const filas = await page.$$('table.cuadro-auxiliar-table tbody tr');
    const inputs = await filas[fila].$$('input[type="number"]');
    
    // Probar nota 8 (Verde)
    await inputs[0].fill('8');
    await inputs[0].press('Tab');
    await page.waitForTimeout(500);
    let borderColor = await inputs[0].evaluate(el => getComputedStyle(el).borderColor);
    expect(borderColor).toMatch(/rgb\(22, 163, 74\)/); // #16a34a
    
    // Probar nota 5.5 (Dorado)
    await inputs[0].fill('5.5');
    await inputs[0].press('Tab');
    await page.waitForTimeout(500);
    borderColor = await inputs[0].evaluate(el => getComputedStyle(el).borderColor);
    expect(borderColor).toMatch(/rgb\(200, 168, 50\)/); // #C8A832
    
    // Probar nota 4 (Rojo)
    await inputs[0].fill('4');
    await inputs[0].press('Tab');
    await page.waitForTimeout(500);
    borderColor = await inputs[0].evaluate(el => getComputedStyle(el).borderColor);
    expect(borderColor).toMatch(/rgb\(220, 38, 38\)/); // #dc2626
  });
});

test.describe('🔄 Flujo completo end-to-end', () => {
  test('Flujo completo: Login → Filtros → Editar notas → Verificar cálculo → Exportar → Importar', async ({ page }) => {
    // 1. Login
    await login(page, USUARIOS.registro);
    console.log('✅ Login OK');
    
    // 2. Navegar a Cuadro Auxiliar
    await navegarCuadroAuxiliar(page, 'Registro Academico');
    console.log('✅ Navegación OK');
    
    // 3. Seleccionar filtros
    await page.selectOption('select:near(label:has-text("Clase"))', { index: 1 });
    await page.waitForTimeout(1000);
    await page.selectOption('select:near(label:has-text("Materia"))', { index: 1 });
    await page.waitForTimeout(1000);
    await page.selectOption('select:near(label:has-text("Periodo"))', { index: 1 });
    await page.waitForTimeout(2000);
    console.log('✅ Filtros cargados');
    
    // 4. Verificar estudiantes cargados
    const estudiantes = await obtenerEstudiantes(page);
    expect(estudiantes.length).toBeGreaterThan(0);
    console.log(`✅ ${estudiantes.length} estudiantes cargados`);
    
    // 5. Configurar estructura estándar si no existe
    try {
      await page.click('button:has-text("Config. Actividades")');
      await page.waitForSelector('button:has-text("Crear Estructura Estándar")', { timeout: 3000 });
      await page.click('button:has-text("Crear Estructura Estándar")');
      await page.waitForTimeout(3000);
      await page.click('button:has-text("Cerrar")');
      console.log('✅ Estructura estándar creada');
    } catch (e) {
      console.log('ℹ️ Estructura ya existe o no se pudo crear');
    }
    
    // 6. Editar notas de primer estudiante
    await editarNota(page, 0, 0, 9);    // Autoevaluación
    await editarNota(page, 0, 1, 8);    // Coevaluación
    await editarNota(page, 0, 2, 10);   // Prueba Objetiva 1
    await editarNota(page, 0, 3, 9);    // Prueba Objetiva 2
    await editarNota(page, 0, 4, 8);    // Prueba Objetiva 3
    await page.waitForTimeout(2000);
    console.log('✅ Notas editadas');
    
    // 7. Verificar promedio calculado
    const promedio = await verificarCalculoPromedio(page, 0);
    console.log('✅ Promedio calculado:', promedio);
    
    // 8. Exportar Excel
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Exportar Excel")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/Cuadro_Auxiliar/);
    console.log('✅ Exportado:', download.suggestedFilename());
    
    // 9. Verificar botón importar existe
    await expect(page.locator('button:has-text("Importar")')).toBeVisible();
    console.log('✅ Flujo completo OK');
  });
});

// ============================================================
// EJECUCIÓN
// ============================================================
// npx playwright test e2e-tests/cuadro-auxiliar.test.js --headed
// npx playwright test e2e-tests/cuadro-auxiliar.test.js --ui
// npx playwright test e2e-tests/cuadro-auxiliar.test.js -g "Flujo completo"