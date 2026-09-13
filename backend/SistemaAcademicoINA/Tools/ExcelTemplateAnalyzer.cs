// Herramienta temporal: Analizar estructura de plantilla Excel
// Uso: dotnet run después de compilar, luego eliminar
using ClosedXML.Excel;

class ExcelTemplateAnalyzer
{
    static void Main()
    {
        var templatePath = @"C:\Projects\SistemaAcademicoINA\SistemaAcademicoINA\Plantillas\Excel\PRIMEROS AÑOS MATERIAS CUADROS AUXILIARES-2026.xlsx";

        try
        {
            using var workbook = new XLWorkbook(templatePath);
            Console.WriteLine("=== ANÁLISIS DE PLANTILLA EXCEL ===\n");

            foreach (var ws in workbook.Worksheets)
            {
                Console.WriteLine($"📄 Hoja: {ws.Name}");
                Console.WriteLine($"   Filas usadas: {ws.LastRowUsed()?.RowNumber() ?? 0}");
                Console.WriteLine($"   Columnas usadas: {ws.LastColumnUsed()?.ColumnNumber() ?? 0}");

                // Mostrar primeras 10 filas y todas las columnas
                Console.WriteLine("\n   Contenido (primeras 10 filas):");
                for (int r = 1; r <= Math.Min(10, ws.LastRowUsed()?.RowNumber() ?? 0); r++)
                {
                    var row = ws.Row(r);
                    Console.Write($"   Fila {r}: ");
                    for (int c = 1; c <= (ws.LastColumnUsed()?.ColumnNumber() ?? 0); c++)
                    {
                        var cell = ws.Cell(r, c);
                        var text = cell.GetString();
                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            Console.Write($"[{cell.Address}={text}] ");
                        }
                    }
                    Console.WriteLine();
                }
                Console.WriteLine();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
        }
    }
}
