// Punto de entrada de la API: configura servicios, CORS, autenticación JWT y el pipeline de middleware.
// Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
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

// 1. Base de datos
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 0))
    )
);

// 2. JwtHelper
builder.Services.AddScoped<JwtHelper>();

// 2b. IPlaywright (para generación de PDF desde HTML)
builder.Services.AddSingleton<IPlaywright>(_ => Playwright.CreateAsync().GetAwaiter().GetResult());

// 2b. DocumentoService (generación PDF, Word, Excel)
builder.Services.AddScoped<DocumentoService>();

// 2b. AuditoriaHelper (registro centralizado de eventos de auditoría)
builder.Services.AddScoped<AuditoriaHelper>();

// 2b. HttpContextAccessor (usado por AuditoriaController)
builder.Services.AddHttpContextAccessor();

// 3. AUTENTICACIÓN JWT
// Configura la autenticación con tokens JWT y la validación de la firma simétrica.
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

// 4. CORS
// Permite solicitudes desde los orígenes del frontend (desarrollo y producción local).
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3000")
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

// 5. Controladores
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// 6. Swagger
// Documentación interactiva de la API con esquema de seguridad Bearer para JWT.
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

var app = builder.Build();

// Pipeline de middleware: Swagger solo en desarrollo, manejo global de errores, CORS, autenticación y autorización.
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// Sirve los archivos subidos (documentos de constancias, fotos de aspirantes, etc.).
app.UseStaticFiles();

// ✅ ORDEN CORRECTO: Authentication ANTES de Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();