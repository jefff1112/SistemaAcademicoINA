// Punto de entrada de la API: configura servicios, CORS, autenticación JWT y el pipeline de middleware.
// Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Playwright;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Helpers;
using SistemaAcademicoINA.Middleware;
using SistemaAcademicoINA.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// 1. BASE DE DATOS
// ============================================================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 0))
    )
);

// ============================================================
// 2. HELPERS Y SERVICIOS DE NEGOCIO
// ============================================================
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<AuditoriaHelper>();
builder.Services.AddHttpContextAccessor();

// ============================================================
// 3. PLAYWRIGHT + DOCUMENTO SERVICE
// ============================================================
// IPlaywright como Singleton perezoso (lazy). Se inicializa la primera vez que se usa.
// Esto evita que la app falle al arrancar si Playwright no tiene navegadores instalados.
builder.Services.AddSingleton<IPlaywright>(sp =>
{
    try
    {
        return Playwright.CreateAsync().GetAwaiter().GetResult();
    }
    catch (Exception ex)
    {
        var logger = sp.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error al inicializar Playwright. ¿Instalaste los navegadores con 'playwright install'?");
        throw;
    }
});

builder.Services.AddScoped<DocumentoService>();

// ============================================================
// 4. CORREO ELECTRÓNICO (MailKit + cola en background)
// ============================================================
builder.Services.AddSingleton<EmailQueue>();
builder.Services.AddSingleton<IEmailService, SmtpEmailService>();
builder.Services.AddHostedService<EmailBackgroundService>();
builder.Services.AddSingleton<PlantillasCorreoService>();
builder.Services.AddSingleton<RateLimiterService>();

// ============================================================
// 5. CONFIGURACIÓN DE SUBIDA DE ARCHIVOS (para constancias)
// ============================================================
builder.Services.Configure<FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = int.MaxValue;
    options.MemoryBufferThreshold = int.MaxValue;
});

// ============================================================
// 6. AUTENTICACIÓN JWT
// ============================================================
var jwtKey = builder.Configuration["Jwt:Key"] ?? "TuClaveSecretaSuperSeguraDeAlMenos32Caracteres!";
var key = Encoding.UTF8.GetBytes(jwtKey);
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "SistemaAcademicoINA";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "SistemaAcademicoINAWeb";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ============================================================
// 7. CORS (permite el frontend en desarrollo y producción)
// ============================================================
// Leer orígenes permitidos desde variable de entorno (separados por coma)
// Ej: FRONTEND_URLS=https://mi-frontend.onrender.com,http://localhost:3000
var corsOrigins = builder.Configuration["FRONTEND_URLS"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? new[] { "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(corsOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

// ============================================================
// 8. CONTROLADORES
// ============================================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ============================================================
// 9. LOGS DETALLADOS EN DESARROLLO (para ver rutas registradas)
// ============================================================
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
if (builder.Environment.IsDevelopment())
{
    builder.Logging.SetMinimumLevel(LogLevel.Debug);
    builder.Logging.AddFilter("Microsoft.AspNetCore.Routing", LogLevel.Debug);
    builder.Logging.AddFilter("Microsoft.AspNetCore.Mvc", LogLevel.Debug);
}

// ============================================================
// 10. SWAGGER
// ============================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Sistema Académico INA API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// ============================================================
// CONSTRUCCIÓN DE LA APP
// ============================================================
var app = builder.Build();

// ============================================================
// CONFIGURACIÓN DE PUERTO PARA RENDER (lee variable PORT)
// ============================================================
var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";
app.Urls.Clear();
app.Urls.Add($"http://0.0.0.0:{port}");

// ============================================================
// PIPELINE DE MIDDLEWARE
// ============================================================

// Manejo global de errores (debe ir primero)
app.UseMiddleware<ErrorHandlingMiddleware>();

// Swagger solo en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS
app.UseCors("AllowFrontend");

// Archivos estáticos (documentos, imágenes, PDFs generados)
app.UseStaticFiles();

// Autenticación ANTES de Autorización
app.UseAuthentication();
app.UseAuthorization();

// Mapeo de controladores
app.MapControllers();

// ============================================================
// LOG DE RUTAS REGISTRADAS (útil para detectar problemas)
// ============================================================
if (app.Environment.IsDevelopment())
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("========================================");
    logger.LogInformation("API iniciada en: {Urls}", string.Join(", ", app.Urls));
    logger.LogInformation("Entorno: {Environment}", app.Environment.EnvironmentName);
    logger.LogInformation("========================================");
}

app.Run();