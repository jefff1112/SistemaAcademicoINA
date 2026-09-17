// Servicio para cargar y renderizar las plantillas HTML de correo
// ubicadas en la carpeta Templates/Emails, sustituyendo los placeholders {{clave}}.
namespace SistemaAcademicoINA.Services;

public class PlantillasCorreoService
{
    private readonly IWebHostEnvironment _env;

    public PlantillasCorreoService(IWebHostEnvironment env)
    {
        _env = env;
    }

    // Carga la plantilla indicada y reemplaza los placeholders {{clave}} por sus valores.
    public async Task<string> RenderizarAsync(string nombrePlantilla, Dictionary<string, string> reemplazos)
    {
        var ruta = Path.Combine(_env.ContentRootPath, "Templates", "Emails", $"{nombrePlantilla}.html");

        if (!File.Exists(ruta))
            return string.Empty;

        var html = await File.ReadAllTextAsync(ruta);

        foreach (var kvp in reemplazos)
            html = html.Replace($"{{{{{kvp.Key}}}}}", kvp.Value ?? "");

        return html;
    }
}