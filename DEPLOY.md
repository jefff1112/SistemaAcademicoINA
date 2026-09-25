# Guía de Despliegue - Sistema Académico INA

> **Stack:** Backend .NET 8 (Docker) + Frontend React (Static Site) + BD MySQL 8.4 (Aiven)
> **Plataforma:** Render.com

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Configurar Base de Datos en Aiven](#2-configurar-base-de-datos-en-aiven)
3. [Importar Base de Datos con phpMyAdmin + WAMP](#3-importar-base-de-datos-con-phpmyadmin--wamp)
4. [Desplegar Backend en Render (Web Service Docker)](#4-desplegar-backend-en-render-web-service-docker)
5. [Desplegar Frontend en Render (Static Site)](#5-desplegar-frontend-en-render-static-site)
6. [Configurar CORS en Backend](#6-configurar-cors-en-backend)
7. [Variables de Entorno Resumen](#7-variables-de-entorno-resumen)
8. [Verificación y Troubleshooting](#8-verificación-y-troubleshooting)

---

## 1. Requisitos Previos

- Cuenta en [Render.com](https://render.com)
- Cuenta en [Aiven.io](https://aiven.io) (plan gratuito MySQL)
- Repositorio Git (GitHub, GitLab, Bitbucket) con el código
- WAMP Server instalado localmente (para importar BD a Aiven)
- Docker Desktop instalado (para probar build localmente)

---

## 2. Configurar Base de Datos en Aiven

### 2.1 Crear el servicio MySQL en Aiven

1. Inicia sesión en [Aiven Console](https://console.aiven.io)
2. Click **Create Service** → **MySQL**
3. Selecciona:
   - **Plan:** Free (o Startup si necesitas más recursos)
   - **Cloud/Region:** El más cercano a tus usuarios (ej. `google-europe-west1`)
   - **Service name:** `sistema-academico-db` (o el que prefieras)
4. Click **Create Service**
5. Espera a que el estado pase a **Running**

### 2.2 Obtener credenciales de conexión

En la página **Overview** del servicio, anota:
- **Host:** `mysql-xxxxxxxx-xxxxx.aivencloud.com`
- **Port:** `12345` (puerto no estándar)
- **User:** `avnadmin`
- **Password:** (click en "Show" para verla)
- **Database:** `defaultdb` (crearemos `sistema_academico` después)
- **SSL:** **Required** (Aiven fuerza SSL)

### 2.3 Crear la base de datos `sistema_academico`

En la pestaña **Databases** del servicio Aiven:
1. Click **Create database**
2. Nombre: `sistema_academico`
3. Click **Create**

### 2.4 Descargar certificado CA (para phpMyAdmin y conexiones SSL)

En la pestaña **Overview** → **Connection Information** → **SSL**:
1. Click **Download CA Certificate** (`ca.pem`)
2. Guárdalo en: `C:\wamp64\bin\apache\apache2.4.XX\bin\ca.pem`
   - Reemplaza `apache2.4.XX` por tu versión real de Apache en WAMP

---

## 3. Importar Base de Datos con phpMyAdmin + WAMP

> Esta sección te permite importar tu `sistema_academico.sql` local a la BD en Aiven usando phpMyAdmin de WAMP.

### 3.1 Preparar WAMP

1. Asegúrate de que WAMP esté **detenido** (icono rojo)
2. Abre `C:\wamp64\bin\apache\apache2.4.XX\bin\php.ini` (versión de Apache)
3. Busca y descomenta (quita `;`) estas líneas:
   ```ini
   extension=mysqli
   extension=openssl
   ```
4. Guarda y cierra

### 3.2 Configurar phpMyAdmin para Aiven

1. Abre `C:\wamp64\apps\phpmyadminX.X.X\config.inc.php`
2. Al final del archivo, **antes del `?>`**, agrega:

```php
$i++;
$cfg['Servers'][$i]['host'] = 'mysql-27f5c115-jefferaguirre-3c55.aivencloud.com'; // TU HOST AIVEN
$cfg['Servers'][$i]['port'] = '12345'; // TU PUERTO AIVEN
$cfg['Servers'][$i]['user'] = 'avnadmin';
$cfg['Servers'][$i]['password'] = 'TU_CONTRASEÑA_AIVEN'; // La real, solo local
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['extension'] = 'mysqli';
$cfg['Servers'][$i]['ssl'] = true;
$cfg['Servers'][$i]['ssl_ca'] = 'C:/wamp64/bin/apache/apache2.4.XX/bin/ca.pem'; // Ruta a tu ca.pem
$cfg['Servers'][$i]['ssl_verify'] = false; // false para evitar verificación de hostname
$cfg['Servers'][$i]['connect_type'] = 'tcp';
```

> ⚠️ **Importante:** Usa barras normales `/` en la ruta del certificado en Windows.

### 3.3 Reiniciar WAMP y acceder

1. Inicia WAMP (icono verde)
2. Abre navegador: `http://localhost/phpmyadmin/`
3. En el selector de servidor (esquina superior derecha), elige el nuevo servidor **Aiven** (será el último en la lista)
4. Deberías ver las bases de datos de Aiven (incluyendo `sistema_academico`)

### 3.4 Importar el archivo SQL

1. Selecciona la base de datos `sistema_academico` en el panel izquierdo
2. Pestaña **Importar**
3. Click **Seleccionar archivo** → elige `C:\Projects\SistemaAcademico\sistema_academico.sql` (o donde lo tengas)
4. Configuración:
   - **Juego de caracteres:** `utf8mb4`
   - **Formato:** `SQL`
   - **Compatibilidad:** `NONE`
5. Click **Continuar** (abajo a la derecha)
6. Espera a que termine: debería mostrar "Importación completada con X consultas"

### 3.5 Verificar datos

- Revisa que las tablas principales existan: `usuarios`, `estudiantes`, `docentes`, `materias`, `grados`, `secciones`, `periodos_academicos`, etc.
- Ejecuta una consulta de prueba: `SELECT COUNT(*) FROM usuarios;`

---

## 4. Desplegar Backend en Render (Web Service Docker)

### 4.1 Preparar el repositorio

Asegúrate de que estos archivos estén commiteados:
- `backend/SistemaAcademicoINA/Dockerfile`
- `backend/SistemaAcademicoINA/Program.cs` (con cambios de PORT y CORS)
- `backend/SistemaAcademicoINA/appsettings.json` (con placeholders)
- `.gitignore` (excluyendo appsettings.json real, .env, etc.)

### 4.2 Crear Web Service en Render

1. En Render Dashboard → **New** → **Web Service**
2. Conecta tu repositorio Git
3. Configuración:
   - **Name:** `sistema-academico-api` (o tu preferido)
   - **Region:** La misma que tu BD en Aiven (ej. `Oregon (US West)` o `Frankfurt (EU Central)`)
   - **Branch:** `main` (o tu rama principal)
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `backend/SistemaAcademicoINA/Dockerfile`
   - **Docker Build Context:** `backend/SistemaAcademicoINA` (importante: la carpeta donde está el .csproj)

### 4.3 Variables de Entorno en Render (Backend)

En **Environment** → **Add Environment Variable**, agrega **exactamente** estas:

| Key | Value | Notas |
|-----|-------|-------|
| `ConnectionStrings__DefaultConnection` | `Server=mysql-27f5c115-jefferaguirre-3c55.aivencloud.com;Port=12345;Database=sistema_academico;Uid=avnadmin;Pwd=TU_CONTRASEÑA_AIVEN;SslMode=Required;` | **Reemplaza host, puerto y password reales** |
| `Jwt__Key` | `TuClaveSecretaSuperSeguraDeAlMenos32Caracteres!` | Mínimo 32 chars, guárdala segura |
| `Jwt__Issuer` | `SistemaAcademicoINA` | |
| `Jwt__Audience` | `SistemaAcademicoINA` | |
| `ASPNETCORE_ENVIRONMENT` | `Production` | |
| `FRONTEND_URLS` | `https://tu-frontend.onrender.com,http://localhost:3000` | **Actualiza después de crear el frontend** |

> 💡 **Nota:** Render usa `__` (doble guion bajo) para anidación en variables de entorno. `ConnectionStrings__DefaultConnection` → `ConnectionStrings:DefaultConnection` en config.

### 4.4 Deploy

1. Click **Create Web Service**
2. Espera el build (5-10 min la primera vez)
3. Cuando esté **Live**, anota la URL: `https://sistema-academico-api.onrender.com`
4. Prueba: `https://sistema-academico-api.onrender.com/api/info` (o tu endpoint de health check)

---

## 5. Desplegar Frontend en Render (Static Site)

### 5.1 Preparar el frontend

1. Verifica `frontend/.env.example` tiene la URL correcta del backend
2. El `package.json` ya tiene `"build": "react-scripts build"`

### 5.2 Crear Static Site en Render

1. En Render Dashboard → **New** → **Static Site**
2. Conecta el **mismo repositorio**
3. Configuración:
   - **Name:** `sistema-academico-frontend`
   - **Branch:** `main`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`

### 5.3 Variables de Entorno en Render (Frontend)

En **Environment** → **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://sistema-academico-api.onrender.com/api` |

> Usa la URL real de tu backend deployado en el paso 4.

### 5.4 Deploy

1. Click **Create Static Site**
2. Espera el build (2-5 min)
3. Cuando esté **Live**, anota la URL: `https://sistema-academico-frontend.onrender.com`

---

## 6. Configurar CORS en Backend

### 6.1 Actualizar variable FRONTEND_URLS

Ahora que tienes la URL del frontend, ve al **Web Service (Backend)** en Render:

1. **Environment** → Edita `FRONTEND_URLS`
2. Valor: `https://sistema-academico-frontend.onrender.com,http://localhost:3000`
3. Click **Save Changes** → Esto hará **redeploy automático**

### 6.2 Verificar CORS

En el frontend, abre DevTools → Network → haz login. No debería haber errores de CORS.

---

## 7. Variables de Entorno Resumen

### Backend (Web Service Docker)

```bash
ConnectionStrings__DefaultConnection=Server=mysql-27f5c115-jefferaguirre-3c55.aivencloud.com;Port=12345;Database=sistema_academico;Uid=avnadmin;Pwd=TU_CONTRASEÑA_REAL;SslMode=Required;
Jwt__Key=TuClaveSecretaSuperSeguraDeAlMenos32Caracteres!
Jwt__Issuer=SistemaAcademicoINA
Jwt__Audience=SistemaAcademicoINA
ASPNETCORE_ENVIRONMENT=Production
FRONTEND_URLS=https://tu-frontend.onrender.com,http://localhost:3000
```

### Frontend (Static Site)

```bash
REACT_APP_API_URL=https://tu-backend.onrender.com/api
```

---

## 8. Verificación y Troubleshooting

### 8.1 Health Checks

| Componente | URL de prueba |
|------------|---------------|
| Backend API | `https://tu-backend.onrender.com/api/info` |
| Swagger (solo dev) | `https://tu-backend.onrender.com/swagger` |
| Frontend | `https://tu-frontend.onrender.com` |

### 8.2 Logs en Render

- **Backend:** Web Service → **Logs** (ver build y runtime)
- **Frontend:** Static Site → **Logs** (ver build estático)

### 8.3 Problemas Comunes

| Error | Solución |
|-------|----------|
| **CORS Error** | Verifica `FRONTEND_URLS` en backend coincide EXACTAMENTE con URL del frontend (sin slash final) |
| **BD Connection Failed** | Verifica: host, puerto, password, `SslMode=Required`, certificado CA en Dockerfile |
| **JWT Invalid** | `Jwt__Key` debe ser idéntico en backend y tener ≥32 chars |
| **404 en rutas React** | Static Site → **Redirects/Rewrites**: agrega `/* /index.html 200` (SPA fallback) |
| **Build fail Docker** | Verifica `Dockerfile Path` y `Build Context` apuntan a `backend/SistemaAcademicoINA` |
| **Playwright error** | El Dockerfile instala solo runtime; si necesitas PDFs con Playwright, agregar `RUN npx playwright install-deps chromium && npx playwright install chromium` |

### 8.4 Configurar Redirects para SPA (Frontend)

En Render Static Site → **Settings** → **Redirects/Rewrites**:
```
Source: /*
Destination: /index.html
Action: Rewrite (200)
```
Esto permite recargar páginas internas del React Router.

---

## 🔐 Seguridad - Checklist Post-Deploy

- [ ] `Jwt__Key` es única, ≥32 caracteres, no está en el repo
- [ ] Contraseña BD Aiven no está en código (solo en Render Env Vars)
- [ ] SMTP password no está en código
- [ ] `ASPNETCORE_ENVIRONMENT=Production`
- [ ] HTTPS funciona en ambos (Render da certificado automático)
- [ ] CORS solo permite tu dominio frontend (no `*` en producción)

---

## 📝 Comandos Útiles Locales

```bash
# Probar build Docker localmente
cd backend/SistemaAcademicoINA
docker build -t sistema-academico-api .
docker run -p 10000:10000 -e PORT=10000 -e ConnectionStrings__DefaultConnection="Server=...;Pwd=..." -e Jwt__Key="..." -e ASPNETCORE_ENVIRONMENT=Production sistema-academico-api

# Build frontend local
cd frontend
npm install
npm run build

# Ver logs Render CLI (si instalas render-cli)
render logs servicio-backend --tail
```

---

## 📞 Soporte

- **Render Docs:** https://render.com/docs
- **Aiven Docs:** https://aiven.io/docs
- **Issues del proyecto:** GitHub Issues

---

**Última actualización:** $(date +%Y-%m-%d)
**Versión:** 1.0