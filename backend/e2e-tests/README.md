# Tests E2E - Cuadro Auxiliar Digital

## Requisitos previos

```bash
# 1. Instalar Playwright (si no está)
cd C:\Projects\SistemaAcademicoINA
npm init -y
npm install -D @playwright/test
npx playwright install chromium

# 2. Instalar xlsx para test de importación
npm install xlsx
```

## Configuración de entorno

Crear archivo `.env.test` en `C:\Projects\SistemaAcademicoINA\e2e-tests\`:

```env
BASE_URL=http://localhost:3000
API_URL=http://localhost:5228/api
```

## Ejecutar tests

```bash
# Todos los tests (headless)
cd C:\Projects\SistemaAcademicoINA
npx playwright test e2e-tests/cuadro-auxiliar.test.js

# Con interfaz gráfica (headed)
npx playwright test e2e-tests/cuadro-auxiliar.test.js --headed

# Modo UI interactivo (recomendado para debug)
npx playwright test e2e-tests/cuadro-auxiliar.test.js --ui

# Solo un grupo de tests
npx playwright test e2e-tests/cuadro-auxiliar.test.js -g "Flujo completo"
npx playwright test e2e-tests/cuadro-auxiliar.test.js -g "Paleta INA"
npx playwright test e2e-tests/cuadro-auxiliar.test.js -g "Importar / Exportar"

# Con reporte HTML
npx playwright test e2e-tests/cuadro-auxiliar.test.js --reporter=html
npx playwright show-report
```

## Credenciales de prueba requeridas

El test usa estos usuarios (deben existir en la BD):

| Rol | Email | Password |
|-----|-------|----------|
| Docente | docente@ina.edu.sv | 123456 |
| Registro Académico | registro@ina.edu.sv | 123456 |
| Director | director@ina.edu.sv | 123456 |

**Crear usuarios si no existen:**
```sql
-- Ejecutar en BD
INSERT INTO usuarios (codigo, contrasena, id_rol, estado) VALUES 
('docente@ina.edu.sv', '$2a$11$...', (SELECT id_rol FROM roles WHERE nombre='Docente'), 1),
('registro@ina.edu.sv', '$2a$11$...', (SELECT id_rol FROM roles WHERE nombre='Registro Academico'), 1),
('director@ina.edu.sv', '$2a$11$...', (SELECT id_rol FROM roles WHERE nombre='Director'), 1);
```

## Datos de prueba requeridos

1. **Al menos 1 clase** con estudiantes matriculados (año lectivo actual)
2. **Al menos 1 materia** asignada a esa clase
3. **Períodos académicos** del año actual (1-4)
4. **Estructura de actividades** (se crea automáticamente con el test "Crear Estructura Estándar")

## Qué valida cada suite

| Suite | Qué prueba |
|-------|------------|
| `Autenticación y Navegación` | Login por rol + acceso a `/cuadro-auxiliar` |
| `Flujo Principal: Filtros` | Carga cascada Clase → Materia → Periodo → Tabla |
| `Edición de Notas` | Debounce 800ms, guardado automático, recálculo |
| `Cálculo Automático` | Promedio ponderado sub-act (20%×5=100%) → act (35/35/30) |
| `Columna Recuperación` | Nota > 0 reemplaza promedio final |
| `Configuración Actividades` | Modal, estructura 3×5, validación 100% |
| `Importar/Exportar/Plantilla` | Descarga, exportación, estructura Excel oficial |
| `Paleta INA` | Colores exactos: #1A2E6B, #2B47B8, #C8A832, #EEF1F9 |
| `Flujo completo E2E` | Login → Filtros → Editar → Calcular → Exportar |

## Debugging

```bash
# Pausar en test específico
test('mi test', async ({ page }) => {
  await page.pause(); // Abre inspector de Playwright
  ...
});

# Screenshots en fallo
test('mi test', async ({ page }) => {
  await page.screenshot({ path: 'debug.png', fullPage: true });
});

# Traces
npx playwright test --trace on
```

## CI/CD (GitHub Actions ejemplo)

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test e2e-tests/cuadro-auxiliar.test.js
        env:
          BASE_URL: ${{ secrets.FRONTEND_URL }}
          API_URL: ${{ secrets.API_URL }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: test-results/
```