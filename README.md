# Sistema Académico INA

Sistema de gestión académica para el Instituto Nacional de Apopa (INA).
Monorepo con dos proyectos:

- `backend/` → API en **.NET 8** (C# / EF Core / MySQL).
- `frontend/` → aplicación web en **React**.

---

## 1. Requisitos previos (instalar una sola vez)

| Herramienta | Necesario para |
|---|---|
| **Git** (con Git Bash) | Clonar y manejar versiones |
| **.NET 8 SDK** | Compilar/correr el backend |
| **Node.js + npm** | Compilar/correr el frontend |
| **Visual Studio 2024 (17.10+)** | Abrir la solución `.slnx` del backend |
| **MySQL 8** (WAMP) | Base de datos `sistema_academico` |

---

## 2. Clonar el repositorio (en Git Bash)

```bash
cd C:/Projects
git clone https://github.com/jefff1112/SistemaAcademicoINA.git SistemaAcademico
cd SistemaAcademico
```

> Al clonar queda la carpeta `C:\Projects\SistemaAcademico\` con `backend\` y `frontend\` adentro.

### Elegir tu rama de trabajo

```bash
git checkout efrain      # si eres Efrain
# o
git checkout vladimir    # si eres Vladimir
```

---

## 3. Configurar credenciales (archivos secretos)

> ⚠️ **Los archivos de configuración con credenciales NO están en el repositorio** (por seguridad).
> Están en este **Drive compartido**:
>
> 📁 https://drive.google.com/drive/folders/1b9ocZGkjaWZp_w6G9M9tL7uHRrLbB3b-?usp=sharing

Descarga del Drive los 2 archivos y colócalos en **estas rutas exactas**:

### 🔹 `appsettings.json` (backend)

1. Descarga `appsettings.json` del Drive.
2. Colócalo en:
   ```
   backend/SistemaAcademicoINA/appsettings.json
   ```

> Si no lo tienes aún, también puedes copiar `backend/SistemaAcademicoINA/appsettings.example.json`
> y renombrarlo a `appsettings.json`, rellenando las credenciales reales.

### 🔹 `.env` (frontend)

1. Descarga `.env` del Drive.
2. Colócalo en:
   ```
   frontend/.env
   ```

> Contenido esperado del `.env`:
> ```
> REACT_APP_API_URL=http://localhost:5228/api
> ```

---

## 4. Instalar dependencias

### Backend (.NET)

```bash
cd backend/SistemaAcademicoINA
dotnet restore
```

### Frontend (React)

```bash
cd frontend
npm install
```

---

## 5. Ejecutar el proyecto

### Backend (puerto 5228)

```bash
cd backend/SistemaAcademicoINA
dotnet run
```

> O ábrelo en Visual Studio con la solución `backend/SistemaAcademicoINA.slnx` y presiona F5.

### Frontend (puerto 3000)

```bash
cd frontend
npm start
```

---

## 6. Estructura de carpetas

```
SistemaAcademico/
├── backend/
│   ├── SistemaAcademicoINA.slnx          ← solución .NET (abrir en VS)
│   ├── SistemaAcademicoINA/               ← proyecto .NET
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── appsettings.json               ← (tú lo creas, NO se sube)
│   │   └── appsettings.example.json       ← plantilla (sí está en el repo)
│   ├── migrations/                        ← scripts SQL de la base de datos
│   └── ...
└── frontend/
    ├── src/
    ├── public/
    ├── .env                               ← (tú lo creas, NO se sube)
    └── package.json
```

---

## 7. Flujo de trabajo con Git

Cada desarrollador tiene **su propia rama** (`efrain` o `vladimir`). **Solo el dueño (Jefferson) sube cambios a `main`**.

### 🔹 Antes de empezar a trabajar (siempre)

```bash
git checkout efrain          # tu rama
git pull origin main         # traer lo último que ya se integró a main
```

### 🔹 Hacer un cambio y subirlo

```bash
git add .
git commit -m "descripción clara del cambio"
git push origin efrain       # sube SOLO a tu rama
```

### 🔹 Actualizarte con lo que otro compañero ya integró

```bash
git checkout vladimir        # tu rama
git pull origin main         # trae los cambios de main a tu rama
```

### 🔹 Llevar tus cambios a `main` (lo hace el dueño)

Cuando tu trabajo esté listo, avisas al dueño. Él hace el **merge a `main`**:

```bash
git checkout main
git pull origin efrain       # (o vladimir) trae los cambios de la rama
git push origin main
```

---

## 8. Reglas importantes

- ❌ **Nunca** hagas `git push` a `main`. Solo a tu rama.
- ✅ Siempre haz `git pull origin main` **antes** de empezar a trabajar.
- 🔒 Los archivos `appsettings.json` y `.env` **NO se suben a Git** (están en el Drive).
- 🚫 No subas `node_modules`, `bin`, `obj` ni `build` (ya están ignorados).
- Si hay **conflicto** al hacer `git pull origin main`, resuélvelo en el archivo y vuelve a commitear.

---

## 9. Activación de cuentas por correo (nuevo ingreso)

### 9.1 Variables de entorno / configuración

Se requiere la sección `Smtp` y la URL del frontend en `backend/SistemaAcademicoINA/appsettings.json` (usa `appsettings.example.json` como plantilla):

```json
{
  "FrontendUrl": "http://localhost:3000",
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "User": "sistemaacademicoina@gmail.com",
    "Password": "PONER_AQUI_APP_PASSWORD_DE_GMAIL",
    "From": "notificaciones@ina.edu.sv",
    "FromName": "INA - Sistema Académico",
    "EnableSsl": true
  }
}
```

> **Gmail App Password**: entra a tu cuenta de Google → Seguridad → Verificación en dos pasos → *Contraseñas de aplicaciones* → genera una para "Correo" y pégala en `Password`. **No uses la contraseña de tu cuenta.**

### 9.2 Aplicar la migración de base de datos

Ejecuta en MySQL el script `backend/migrations/18_activacion_cuentas_reportes.sql`, que:
- Permite contraseña nula en `usuarios` (`contrasena` NULLable).
- Agrega `usuarios.estado_activacion`.
- Crea las tablas `tokens_activacion` y `reportes_datos_estudiante`.

```bash
mysql -u root sistema_academico < backend/migrations/18_activacion_cuentas_reportes.sql
```

### 9.3 Cómo probar el flujo completo

1. **Registro Académico** aprueba y matricula a un aspirante (menú *Matriculas*). Deja marcado **"Enviar correo de activación automáticamente"**.
2. El sistema crea el estudiante, su usuario (`estado=false`, sin contraseña) y un **token de 48 h**, y encola el correo de bienvenida.
3. Revisa el correo (o la tabla `tokens_activacion`) y abre `http://localhost:3000/activar-cuenta?token=XXXX`.
4. La página muestra los datos del estudiante; crea la contraseña (mín. 8 caracteres, 1 mayúscula, 1 número).
5. Opcional: **"Reportar dato incorrecto"** → envía uno o varios reportes (notifica a Dirección y Registro Académico).
6. **Dirección/Registro** → menú **"Reportes de Datos"**: aprobar/rechazar/en revisión.
7. Si el enlace expira o el envío fue manual, usa **"Activaciones Pendientes"** para reenviar, marcar en espera o activar presencialmente.

### 9.4 Ende­points nuevos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/auth/validar-token?token=` | Valida el token de activación |
| POST | `/api/auth/activar-cuenta` | Crea la contraseña y activa la cuenta |
| POST | `/api/reportes-datos` | Crea reportes de datos (con token) |
| GET/PUT | `/api/reportes-datos(/{id}/aprobar\|rechazar\|en-revision)` | Gestión de reportes |
| GET/POST | `/api/activaciones/pendientes`, `/api/activaciones/{id}/reenviar\|marcar-espera\|activar-presencial` | Gestión de activaciones |

> Las plantillas de correo están en `backend/SistemaAcademicoINA/Templates/Emails/` y el envío se procesa en background (cola `Channel<T>`), sin bloquear las respuestas HTTP.