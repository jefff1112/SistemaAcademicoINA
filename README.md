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