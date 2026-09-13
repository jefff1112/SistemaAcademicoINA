// Middleware global de manejo de errores: captura excepciones no controladas, las guarda en la base de datos y responde JSON.
using System.Net;
using System.Text.Json;
using SistemaAcademicoINA.Data;
using SistemaAcademicoINA.Models.Entities;

namespace SistemaAcademicoINA.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IServiceScopeFactory scopeFactory)
    {
        _next = next;
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    // Ejecuta el resto del pipeline y captura cualquier excepción no controlada.
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ocurrió un error no controlado");

            // Guardar error en la base de datos
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var user = context.User?.Identity?.Name ?? "Sistema";

                // Crea el registro de ErrorSistema con datos de la solicitud y el usuario.
                var error = new ErrorSistema
                {
                    Mensaje = ex.Message,
                    StackTrace = ex.StackTrace,
                    Usuario = user,
                    Ruta = context.Request.Path,
                    Ip = context.Connection.RemoteIpAddress?.ToString(),
                    Fecha = DateTime.Now,
                    Resuelto = false,
                    CreatedAt = DateTime.Now
                };

                dbContext.ErroresSistema.Add(error);
                await dbContext.SaveChangesAsync();
            }

            await HandleExceptionAsync(context, ex);
        }
    }

    // Devuelve una respuesta JSON con código 500 y un mensaje genérico (sin fuga de detalles internos).
    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new
        {
            mensaje = "Ocurrió un error interno en el servidor",
            statusCode = context.Response.StatusCode
        };

        var jsonResponse = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(jsonResponse);
    }
}