using ClosedXML.Excel;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Playwright;
using SistemaAcademicoINA.Models.Entities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

public enum FormatoDocumento
{
    Pdf,
    Word,
    Excel
}

public class DocumentoService
{
    private readonly IPlaywright _playwright;
    private readonly IWebHostEnvironment _env;

    public DocumentoService(IPlaywright playwright, IWebHostEnvironment env)
    {
        _playwright = playwright;
        _env = env;
    }

    // ============================================================
    // MÉTODO GENÉRICO: Genera constancias (Estudio/Conducta/Incapacidad)
    // ============================================================
    public async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarDocumentoAsync(
        FormatoDocumento formato,
        string nombreEstudiante,
        string nombreDirectora,
        string nombreBachillerato,
        string especialidad,
        string seccion,
        string anioEmision,
        string conducta,
        string dia,
        string mes,
        string anio,
        string codigoEstudiante)
    {
        var reemplazos = new Dictionary<string, string>
        {
            { "nombreEstudiante", nombreEstudiante },
            { "nombreDirectora", nombreDirectora },
            { "nivelBachillerato", nombreBachillerato },
            { "especialidad", especialidad },
            { "seccion", seccion },
            { "anioEmision", anioEmision },
            { "conducta", conducta },
            { "dia", dia },
            { "mes", mes },
            { "anio", anio },
            { "nombreInstitucion", "Instituto Nacional de Apopa" }
        };

        return formato switch
        {
            FormatoDocumento.Pdf => await GenerarPdfAsync(reemplazos, codigoEstudiante),
            FormatoDocumento.Word => await GenerarWordAsync(reemplazos, codigoEstudiante),
            FormatoDocumento.Excel => await GenerarExcelAsync(reemplazos, codigoEstudiante),
            _ => throw new ArgumentException($"Formato no soportado: {formato}")
        };
    }

    // ============================================================
    // PDF INDIVIDUAL (Constancias)
    // ============================================================
    private async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarPdfAsync(
        Dictionary<string, string> reemplazos, string codigoEstudiante)
    {
        var templatePath = Path.Combine(_env.ContentRootPath, "Plantillas", "HTML", "PlantillaHTMLConstanciaTituloEnProceso.html");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"No se encontró la plantilla HTML en: {templatePath}");

        var html = await File.ReadAllTextAsync(templatePath);

        var logoPath = Path.Combine(_env.WebRootPath, "images", "logo-ina.png");
        string logoDataUri = "";
        if (File.Exists(logoPath))
        {
            var logoBytes = await File.ReadAllBytesAsync(logoPath);
            var base64 = Convert.ToBase64String(logoBytes);
            logoDataUri = $"data:image/png;base64,{base64}";
        }

        if (!reemplazos.ContainsKey("logoUrl"))
        {
            reemplazos["logoUrl"] = logoDataUri != "" ? logoDataUri : "/images/logo-ina.png";
        }

        foreach (var kvp in reemplazos)
        {
            html = html.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
        }

        await using var browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true,
            Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
        });

        await using var page = await browser.NewPageAsync();
        await page.SetContentAsync(html, new PageSetContentOptions { WaitUntil = WaitUntilState.NetworkIdle });

        var pdfBytes = await page.PdfAsync(new PagePdfOptions
        {
            Format = "Letter",
            PrintBackground = true,
            Margin = new()
            {
                Top = "20mm",
                Bottom = "20mm",
                Left = "20mm",
                Right = "20mm"
            }
        });

        return (pdfBytes, $"constancia_{codigoEstudiante}.pdf", "application/pdf");
    }

    // ============================================================
    // WORD INDIVIDUAL (Constancias)
    // ============================================================
    private async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarWordAsync(
        Dictionary<string, string> reemplazos, string codigoEstudiante)
    {
        var templatePath = Path.Combine(_env.ContentRootPath, "Plantillas", "Word", "PlantillaConstanciaTituloEnProceso.docx");

        using var ms = new MemoryStream();

        if (File.Exists(templatePath))
        {
            var bytes = await File.ReadAllBytesAsync(templatePath);
            ms.Write(bytes, 0, bytes.Length);
            ms.Position = 0;
        }

        using (var doc = WordprocessingDocument.Open(ms, true))
        {
            var body = doc.MainDocumentPart?.Document.Body;
            if (body != null)
            {
                ReplaceTextInParagraphs(body.Descendants<Paragraph>(), reemplazos);

                foreach (var table in body.Descendants<Table>())
                {
                    foreach (var cell in table.Descendants<TableCell>())
                    {
                        ReplaceTextInParagraphs(cell.Descendants<Paragraph>(), reemplazos);
                    }
                }
            }
        }

        return (ms.ToArray(), $"constancia_{codigoEstudiante}.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }

    // ============================================================
    // EXCEL (Constancias)
    // ============================================================
    private async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarExcelAsync(
        Dictionary<string, string> reemplazos, string codigoEstudiante)
    {
        var templatePath = Path.Combine(_env.WebRootPath, "Plantillas", "Excel", "constancia_titulo.xlsx");

        using var wb = File.Exists(templatePath)
            ? new XLWorkbook(templatePath)
            : new XLWorkbook();

        var ws = wb.Worksheet(1);

        if (!File.Exists(templatePath))
        {
            ws.Cell(1, 1).Value = "Campo";
            ws.Cell(1, 2).Value = "Valor";
            ws.Row(1).Style.Font.Bold = true;
            ws.Row(1).Style.Fill.BackgroundColor = XLColor.LightBlue;

            int row = 2;
            foreach (var kvp in reemplazos)
            {
                ws.Cell(row, 1).Value = kvp.Key;
                ws.Cell(row, 2).Value = kvp.Value;
                row++;
            }

            ws.Columns().AdjustToContents();
        }
        else
        {
            foreach (var row in ws.RowsUsed())
            {
                for (int col = 1; col <= ws.LastColumnUsed().ColumnNumber(); col++)
                {
                    var cell = row.Cell(col);
                    if (cell.DataType == XLDataType.Text)
                    {
                        var value = cell.GetString();
                        foreach (var kvp in reemplazos)
                        {
                            value = value.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
                        }
                        cell.Value = value;
                    }
                }
            }
        }

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return (ms.ToArray(), $"reporte_{codigoEstudiante}.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    // ============================================================
    // MÉTODO AUXILIAR: Reemplazo de texto en párrafos Word
    // ============================================================
    private void ReplaceTextInParagraphs(IEnumerable<Paragraph> paragraphs, Dictionary<string, string> reemplazos)
    {
        foreach (var paragraph in paragraphs)
        {
            foreach (var run in paragraph.Descendants<Run>())
            {
                foreach (var text in run.Descendants<Text>())
                {
                    var originalText = text.Text;
                    var newText = originalText;

                    foreach (var kvp in reemplazos)
                    {
                        var placeholder = "{{" + kvp.Key + "}}";
                        var placeholderWithSpaces = "{{ " + kvp.Key + " }}";
                        var placeholderWithExtraSpaces = "{{  " + kvp.Key + "  }}";

                        newText = newText.Replace(placeholder, kvp.Value ?? "");
                        newText = newText.Replace(placeholderWithSpaces, kvp.Value ?? "");
                        newText = newText.Replace(placeholderWithExtraSpaces, kvp.Value ?? "");
                    }

                    if (newText != originalText)
                    {
                        text.Text = newText;
                    }
                }
            }
        }
    }

    // ============================================================
    // TÍTULO EN PROCESO - WORD COMBINADO (múltiples estudiantes)
    // ============================================================
    public async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarWordCombinadoTituloProcesoAsync(
        List<Dictionary<string, string>> listaReemplazos, int idClase)
    {
        var templatePath = Path.Combine(_env.ContentRootPath, "Plantillas", "Word", "PlantillaConstanciaTituloEnProceso.docx");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"No se encontró la plantilla Word en: {templatePath}");

        var templateBytes = await File.ReadAllBytesAsync(templatePath);

        using var ms = new MemoryStream();

        using (var doc = WordprocessingDocument.Create(ms, WordprocessingDocumentType.Document))
        {
            var mainPart = doc.AddMainDocumentPart();
            mainPart.Document = new Document(new Body());
            var body = mainPart.Document.Body;

            AddStylesFromTemplate(mainPart, templateBytes);
            CopyHeaderFromTemplate(mainPart, templateBytes);

            bool first = true;
            foreach (var reemplazos in listaReemplazos)
            {
                if (!first)
                {
                    body.Append(new Paragraph(new Run(new Break() { Type = BreakValues.Page })));
                }
                first = false;

                BuildStudentContent(body, reemplazos);
            }

            body.Append(new SectionProperties(
                new HeaderReference() { Type = HeaderFooterValues.Default, Id = "rId6" },
                new PageSize() { Width = 12240, Height = 15840 },
                new PageMargin() { Top = 1417, Right = 1701, Bottom = 1417, Left = 1701, Header = 708, Footer = 708, Gutter = 0 },
                new Columns() { Space = new StringValue("708") },
                new DocGrid() { LinePitch = 360 }
            ));
        }

        return (ms.ToArray(), $"titulo_proceso_clase_{idClase}.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }

    // ============================================================
    // TÍTULO EN PROCESO - PDF COMBINADO
    // ============================================================
    public async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarPdfCombinadoTituloProcesoAsync(
        List<Dictionary<string, string>> listaReemplazos, int idClase)
    {
        var templatePath = Path.Combine(_env.ContentRootPath, "Plantillas", "HTML", "PlantillaHTMLConstanciaTituloEnProceso.html");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"No se encontró la plantilla HTML en: {templatePath}");

        var htmlTemplate = await File.ReadAllTextAsync(templatePath);

        var logoPath = Path.Combine(_env.WebRootPath, "images", "logo-ina.png");
        string logoDataUri = "";
        if (File.Exists(logoPath))
        {
            var logoBytes = await File.ReadAllBytesAsync(logoPath);
            var base64 = Convert.ToBase64String(logoBytes);
            logoDataUri = $"data:image/png;base64,{base64}";
        }

        var allHtml = "";
        foreach (var reemplazos in listaReemplazos)
        {
            var html = htmlTemplate;
            foreach (var kvp in reemplazos)
            {
                html = html.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
            }
            if (!reemplazos.ContainsKey("logoUrl"))
            {
                html = html.Replace("{{logoUrl}}", logoDataUri != "" ? logoDataUri : "/images/logo-ina.png");
            }
            allHtml += html + "<div style='page-break-after: always;'></div>";
        }

        await using var browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true,
            Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
        });

        await using var page = await browser.NewPageAsync();
        await page.SetContentAsync(allHtml, new PageSetContentOptions { WaitUntil = WaitUntilState.NetworkIdle });

        var pdfBytes = await page.PdfAsync(new PagePdfOptions
        {
            Format = "Letter",
            PrintBackground = true,
            Margin = new()
            {
                Top = "20mm",
                Bottom = "20mm",
                Left = "20mm",
                Right = "20mm"
            }
        });

        return (pdfBytes, $"titulo_proceso_clase_{idClase}.pdf", "application/pdf");
    }

    // ============================================================
    // HELPERS PARA WORD
    // ============================================================
    private void AddStylesFromTemplate(MainDocumentPart mainPart, byte[] templateBytes)
    {
        using var templateMs = new MemoryStream(templateBytes);
        using var templateDoc = WordprocessingDocument.Open(templateMs, false);
        var templateStylesPart = templateDoc.MainDocumentPart?.StyleDefinitionsPart;
        if (templateStylesPart != null)
        {
            var stylesPart = mainPart.AddNewPart<StyleDefinitionsPart>();
            stylesPart.FeedData(templateStylesPart.GetStream());
        }
    }

    private void CopyHeaderFromTemplate(MainDocumentPart mainPart, byte[] templateBytes)
    {
        using var templateMs = new MemoryStream(templateBytes);
        using var templateDoc = WordprocessingDocument.Open(templateMs, false);
        var templateHeaderPart = templateDoc.MainDocumentPart?.HeaderParts?.FirstOrDefault();
        if (templateHeaderPart != null)
        {
            var headerPart = mainPart.AddNewPart<HeaderPart>("rId6");

            foreach (var part in templateHeaderPart.Parts)
            {
                var openXmlPart = part.OpenXmlPart;
                if (openXmlPart != null)
                {
                    var newPart = headerPart.AddPart(openXmlPart, part.RelationshipId);
                    using (var stream = openXmlPart.GetStream())
                    {
                        newPart.FeedData(stream);
                    }
                }
            }

            headerPart.FeedData(templateHeaderPart.GetStream());
        }
    }

    private Run CreateRun(string text, bool bold = false, bool noProof = false, string fontSize = "30", string fontFamily = "Times New Roman")
    {
        var run = new Run();
        var props = new RunProperties();
        if (bold) props.Append(new Bold());
        props.Append(new FontSize() { Val = fontSize });
        props.Append(new RunFonts() { Ascii = fontFamily, HighAnsi = fontFamily });
        props.Append(new Languages() { Val = "es-SV" });
        if (noProof) props.Append(new NoProof());
        run.Append(props);
        run.Append(new Text(text) { Space = SpaceProcessingModeValues.Preserve });
        return run;
    }

    private void BuildStudentContent(Body body, Dictionary<string, string> r)
    {
        body.Append(new Paragraph(
            new ParagraphProperties(
                new SpacingBetweenLines() { Line = "360", LineRule = LineSpacingRuleValues.Auto },
                new Justification() { Val = JustificationValues.Both }
            ),
            CreateRun("La Suscrita Directora del Instituto Nacional de Apopa, HACE CONSTAR QUE: "),
            CreateRun(r.GetValueOrDefault("nombreEstudiante", ""), bold: true, noProof: true),
            CreateRun(", ")
        ));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new SpacingBetweenLines() { Line = "360", LineRule = LineSpacingRuleValues.Auto },
                new Justification() { Val = JustificationValues.Both }
            ),
            CreateRun("ha finalizado sus estudios del "),
            CreateRun(r.GetValueOrDefault("nivelBachillerato", ""), noProof: true),
            CreateRun(" BACHILLERATO TÉCNICO VOCACIONAL EN "),
            CreateRun(r.GetValueOrDefault("especialidad", ""), noProof: true),
            CreateRun(", SECCIÓN: \""),
            CreateRun(r.GetValueOrDefault("seccion", ""), noProof: true),
            CreateRun("\", en el año escolar "),
            CreateRun(r.GetValueOrDefault("anio", ""), noProof: true),
            CreateRun(", obteniendo  ")
        ));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new SpacingBetweenLines() { Line = "360", LineRule = LineSpacingRuleValues.Auto },
                new Justification() { Val = JustificationValues.Both }
            ),
            CreateRun("“", bold: true),
            CreateRun(r.GetValueOrDefault("conducta", ""), bold: true, noProof: true),
            CreateRun("” conducta. Se iniciará el proceso de trámite de legalización de título en el Ministerio de Educación.")
        ));

        body.Append(new Paragraph(CreateRun("  ")));

        body.Append(new Paragraph(
            CreateRun("Y, para los usos que el interesado estime conveniente se extiende la presente en la Ciudad de Apopa a los "),
            CreateRun(r.GetValueOrDefault("dia", ""), noProof: true),
            CreateRun(" días del mes de "),
            CreateRun(r.GetValueOrDefault("mes", ""), noProof: true),
            CreateRun(" de "),
            CreateRun(r.GetValueOrDefault("anioEmision", ""), noProof: true),
            CreateRun(".")
        ));

        body.Append(new Paragraph(CreateRun("  ")));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new Justification() { Val = JustificationValues.Center },
                new Tabs(new TabStop() { Val = TabStopValues.Left, Position = 3181 })
            ),
            CreateRun(r.GetValueOrDefault("nombreDirectora", ""))
        ));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new Justification() { Val = JustificationValues.Center },
                new RunProperties(
                    new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" },
                    new FontSize() { Val = "28" },
                    new Languages() { Val = "es-SV" }
                )
            ),
            CreateRun("Directora", fontFamily: "Arial")
        ));
    }

    // ============================================================
    // CERTIFICADO DE PROMOCIÓN - PDF INDIVIDUAL
    // ============================================================
    public async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarCertificadoPromocionAsync(
        FormatoDocumento formato,
        Dictionary<string, string> reemplazos,
        string codigoEstudiante)
    {
        if (formato == FormatoDocumento.Pdf)
        {
            return await GenerarPdfCertificadoPromocionAsync(reemplazos, codigoEstudiante);
        }
        else if (formato == FormatoDocumento.Word)
        {
            return await GenerarWordCertificadoPromocionAsync(reemplazos, codigoEstudiante);
        }
        throw new ArgumentException($"Formato no soportado: {formato}");
    }

    private async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarPdfCertificadoPromocionAsync(
        Dictionary<string, string> reemplazos, string codigoEstudiante)
    {
        var templatePath = Path.Combine(_env.ContentRootPath, "Plantillas", "HTML", "PlantillaHTMLCertificadoPromocion.html");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"No se encontró la plantilla HTML en: {templatePath}");

        var html = await File.ReadAllTextAsync(templatePath);

        var logoPath = Path.Combine(_env.WebRootPath, "images", "logo-ina.png");
        string logoDataUri = "";
        if (File.Exists(logoPath))
        {
            var logoBytes = await File.ReadAllBytesAsync(logoPath);
            var base64 = Convert.ToBase64String(logoBytes);
            logoDataUri = $"data:image/png;base64,{base64}";
        }

        if (!reemplazos.ContainsKey("logoUrl"))
            reemplazos["logoUrl"] = logoDataUri != "" ? logoDataUri : "/images/logo-ina.png";

        foreach (var kvp in reemplazos)
        {
            html = html.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
        }

        await using var browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true,
            Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
        });

        await using var page = await browser.NewPageAsync();
        await page.SetContentAsync(html, new PageSetContentOptions { WaitUntil = WaitUntilState.NetworkIdle });

        var pdfBytes = await page.PdfAsync(new PagePdfOptions
        {
            Format = "Letter",
            PrintBackground = true,
            Margin = new() { Top = "20mm", Bottom = "20mm", Left = "20mm", Right = "20mm" }
        });

        return (pdfBytes, $"certificado_promocion_{codigoEstudiante}.pdf", "application/pdf");
    }

    private async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarWordCertificadoPromocionAsync(
        Dictionary<string, string> reemplazos, string codigoEstudiante)
    {
        var templatePath = Path.Combine(_env.ContentRootPath, "Plantillas", "Word", "PlantillaCertificadoPromocion.docx");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"No se encontró la plantilla Word en: {templatePath}");

        var bytes = await File.ReadAllBytesAsync(templatePath);
        using var ms = new MemoryStream(bytes);
        ms.Position = 0;

        using (var doc = WordprocessingDocument.Open(ms, true))
        {
            var body = doc.MainDocumentPart?.Document.Body;
            if (body != null)
            {
                ReplaceTextInParagraphs(body.Descendants<Paragraph>(), reemplazos);
                foreach (var table in body.Descendants<Table>())
                {
                    foreach (var cell in table.Descendants<TableCell>())
                    {
                        ReplaceTextInParagraphs(cell.Descendants<Paragraph>(), reemplazos);
                    }
                }
            }
        }

        return (ms.ToArray(), $"certificado_promocion_{codigoEstudiante}.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }

    // ============================================================
    // CERTIFICADO DE PROMOCIÓN - PDF COMBINADO (por clase)
    // ============================================================
    public async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarPdfCombinadoCertificadoPromocionAsync(
        List<Dictionary<string, string>> listaReemplazos, int idClase)
    {
        var templatePath = Path.Combine(_env.ContentRootPath, "Plantillas", "HTML", "PlantillaHTMLCertificadoPromocion.html");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"No se encontró la plantilla HTML en: {templatePath}");

        var htmlTemplate = await File.ReadAllTextAsync(templatePath);

        var logoPath = Path.Combine(_env.WebRootPath, "images", "logo-ina.png");
        string logoDataUri = "";
        if (File.Exists(logoPath))
        {
            var logoBytes = await File.ReadAllBytesAsync(logoPath);
            var base64 = Convert.ToBase64String(logoBytes);
            logoDataUri = $"data:image/png;base64,{base64}";
        }

        var allHtml = "";
        foreach (var reemplazos in listaReemplazos)
        {
            var html = htmlTemplate;
            foreach (var kvp in reemplazos)
            {
                html = html.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
            }
            if (!reemplazos.ContainsKey("logoUrl"))
                html = html.Replace("{{logoUrl}}", logoDataUri != "" ? logoDataUri : "/images/logo-ina.png");

            allHtml += html + "<div style='page-break-after: always;'></div>";
        }

        await using var browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true,
            Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
        });

        await using var page = await browser.NewPageAsync();
        await page.SetContentAsync(allHtml, new PageSetContentOptions { WaitUntil = WaitUntilState.NetworkIdle });

        var pdfBytes = await page.PdfAsync(new PagePdfOptions
        {
            Format = "Letter",
            PrintBackground = true,
            Margin = new() { Top = "20mm", Bottom = "20mm", Left = "20mm", Right = "20mm" }
        });

        return (pdfBytes, $"certificados_promocion_clase_{idClase}.pdf", "application/pdf");
    }

    // ============================================================
    // CERTIFICADO DE PROMOCIÓN - WORD COMBINADO (por clase)
    // ============================================================
    public async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarWordCombinadoCertificadoPromocionAsync(
        List<Dictionary<string, string>> listaReemplazos, int idClase)
    {
        var templatePath = Path.Combine(_env.ContentRootPath, "Plantillas", "Word", "PlantillaCertificadoPromocion.docx");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"No se encontró la plantilla Word en: {templatePath}");

        var templateBytes = await File.ReadAllBytesAsync(templatePath);

        using var ms = new MemoryStream();

        using (var doc = WordprocessingDocument.Create(ms, WordprocessingDocumentType.Document))
        {
            var mainPart = doc.AddMainDocumentPart();
            mainPart.Document = new Document(new Body());
            var body = mainPart.Document.Body;

            AddStylesFromTemplate(mainPart, templateBytes);
            CopyHeaderFromTemplate(mainPart, templateBytes);

            bool first = true;
            foreach (var reemplazos in listaReemplazos)
            {
                if (!first)
                    body.Append(new Paragraph(new Run(new Break() { Type = BreakValues.Page })));
                first = false;

                BuildCertificadoPromocionContent(body, reemplazos);
            }

            body.Append(new SectionProperties(
                new HeaderReference() { Type = HeaderFooterValues.Default, Id = "rId6" },
                new PageSize() { Width = 12240, Height = 15840 },
                new PageMargin() { Top = 1417, Right = 1701, Bottom = 1417, Left = 1701, Header = 708, Footer = 708, Gutter = 0 },
                new Columns() { Space = new StringValue("708") },
                new DocGrid() { LinePitch = 360 }
            ));
        }

        return (ms.ToArray(), $"certificados_promocion_clase_{idClase}.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }

    private void BuildCertificadoPromocionContent(Body body, Dictionary<string, string> r)
    {
        // Título
        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Center }),
            CreateRun("INSTITUTO NACIONAL DE APOPA", bold: true, fontSize: "32")
        ));

        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Center }),
            CreateRun("CERTIFICADO DE PROMOCIÓN", bold: true, fontSize: "28")
        ));

        body.Append(new Paragraph(CreateRun(" ")));

        // Cuerpo
        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Both }),
            CreateRun("El suscrito Director del Instituto Nacional de Apopa, HACE CONSTAR QUE: ")
        ));

        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Both }),
            CreateRun(r.GetValueOrDefault("nombreEstudiante", ""), bold: true, noProof: true),
            CreateRun(", con código de estudiante "),
            CreateRun(r.GetValueOrDefault("codigoEstudiante", ""), noProof: true),
            CreateRun(" y NIE "),
            CreateRun(r.GetValueOrDefault("nie", ""), noProof: true),
            CreateRun(", ha cursado y aprobado el "),
            CreateRun(r.GetValueOrDefault("nivelBachillerato", ""), noProof: true),
            CreateRun(" BACHILLERATO TÉCNICO VOCACIONAL EN "),
            CreateRun(r.GetValueOrDefault("especialidad", ""), noProof: true),
            CreateRun(", SECCIÓN \""),
            CreateRun(r.GetValueOrDefault("seccion", ""), noProof: true),
            CreateRun("\", durante el año lectivo "),
            CreateRun(r.GetValueOrDefault("anioLectivo", ""), noProof: true),
            CreateRun(".")
        ));

        body.Append(new Paragraph(CreateRun(" ")));

        // Datos académicos
        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Left }),
            CreateRun("Promedio General: ", bold: true),
            CreateRun(r.GetValueOrDefault("promedioGeneral", "0.00"), noProof: true)
        ));

        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Left }),
            CreateRun("Materias Aprobadas: ", bold: true),
            CreateRun(r.GetValueOrDefault("materiasAprobadas", "0"), noProof: true)
        ));

        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Left }),
            CreateRun("Materias Reprobadas: ", bold: true),
            CreateRun(r.GetValueOrDefault("materiasReprobadas", "0"), noProof: true)
        ));

        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Left }),
            CreateRun("Estado: ", bold: true),
            CreateRun(r.GetValueOrDefault("estado", "NO PROMOVIDO"), bold: true, noProof: true)
        ));

        body.Append(new Paragraph(CreateRun(" ")));

        // Cierre
        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Both }),
            CreateRun("Y, para los usos que el interesado estime conveniente se extiende la presente en la Ciudad de Apopa a los "),
            CreateRun(r.GetValueOrDefault("dia", ""), noProof: true),
            CreateRun(" días del mes de "),
            CreateRun(r.GetValueOrDefault("mes", ""), noProof: true),
            CreateRun(" de "),
            CreateRun(r.GetValueOrDefault("anio", ""), noProof: true),
            CreateRun(".")
        ));

        body.Append(new Paragraph(CreateRun(" ")));
        body.Append(new Paragraph(CreateRun(" ")));

        // Firma
        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Center }),
            CreateRun(r.GetValueOrDefault("nombreDirectora", ""))
        ));

        body.Append(new Paragraph(
            new ParagraphProperties(new Justification() { Val = JustificationValues.Center }),
            CreateRun("Directora", fontFamily: "Arial", fontSize: "28")
        ));
    }
    // ============================================================
    // PUBLICACIÓN DE RESULTADOS - PDF
    // ============================================================
    public async Task<(byte[] contenido, string nombreArchivo, string mimeType)> GenerarPdfPublicacionResultadosAsync(
        List<Dictionary<string, string>> aspirantes,
        string nombreEspecialidad,
        int totalAspirantes,
        int aprobados,
        int rechazados,
        int enEspera,
        int preseleccionados)
    {
        var templatePath = Path.Combine(_env.ContentRootPath, "Plantillas", "HTML", "PlantillaHTMLPublicacionResultados.html");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"No se encontró la plantilla HTML en: {templatePath}");

        var html = await File.ReadAllTextAsync(templatePath);

        // Logo en base64
        var logoPath = Path.Combine(_env.WebRootPath, "images", "logo-ina.png");
        string logoDataUri = "";
        if (File.Exists(logoPath))
        {
            var logoBytes = await File.ReadAllBytesAsync(logoPath);
            var base64 = Convert.ToBase64String(logoBytes);
            logoDataUri = $"data:image/png;base64,{base64}";
        }
        html = html.Replace("{{logoUrl}}", logoDataUri);

        // Generar filas de la tabla
        var filasHtml = new System.Text.StringBuilder();
        foreach (var asp in aspirantes)
        {
            var estadoColor = asp.GetValueOrDefault("estado", "") switch
            {
                "Aprobado" => "#16a34a",
                "Rechazado" => "#dc2626",
                "En Espera" => "#e67e22",
                "Preseleccionado" => "#3b82f6",
                _ => "#64748b"
            };

            filasHtml.Append($@"
            <tr>
                <td style='text-align:center;'>{asp.GetValueOrDefault("id", "")}</td>
                <td>{asp.GetValueOrDefault("nombres", "")}</td>
                <td>{asp.GetValueOrDefault("apellidos", "")}</td>
                <td style='text-align:center;'>{asp.GetValueOrDefault("nie", "-")}</td>
                <td>{asp.GetValueOrDefault("especialidad", "-")}</td>
                <td style='text-align:center;'>{asp.GetValueOrDefault("nota", "-")}</td>
                <td style='text-align:center;'>
                    <span style='background:{estadoColor};color:#fff;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:bold;'>
                        {asp.GetValueOrDefault("estado", "Pendiente")}
                    </span>
                </td>
            </tr>");
        }

        html = html.Replace("{{filasAspirantes}}", filasHtml.ToString());
        html = html.Replace("{{nombreEspecialidad}}", nombreEspecialidad);
        html = html.Replace("{{totalAspirantes}}", totalAspirantes.ToString());
        html = html.Replace("{{aprobados}}", aprobados.ToString());
        html = html.Replace("{{rechazados}}", rechazados.ToString());
        html = html.Replace("{{enEspera}}", enEspera.ToString());
        html = html.Replace("{{preseleccionados}}", preseleccionados.ToString());
        html = html.Replace("{{fechaGeneracion}}", DateTime.Now.ToString("dd/MM/yyyy HH:mm"));
        html = html.Replace("{{anioLectivo}}", DateTime.Now.Year.ToString());

        await using var browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true,
            Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
        });

        await using var page = await browser.NewPageAsync();
        await page.SetContentAsync(html, new PageSetContentOptions { WaitUntil = WaitUntilState.NetworkIdle });

        var pdfBytes = await page.PdfAsync(new PagePdfOptions
        {
            Format = "Letter",
            PrintBackground = true,
            Margin = new() { Top = "15mm", Bottom = "15mm", Left = "15mm", Right = "15mm" }
        });

        var nombreArchivo = $"publicacion_resultados_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
        return (pdfBytes, nombreArchivo, "application/pdf");
    }
}