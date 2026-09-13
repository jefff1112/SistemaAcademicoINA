
// Servicio de boleta: obtiene las calificaciones de los estudiantes desde el backend y genera boletas en PDF (formatos MINED e INA).
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// URL base de la API, configurable por variable de entorno REACT_APP_API_URL.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5228/api';

// Paleta de colores corporativos usada en los PDF (MINED e INA).
const COLORS = {
    MINED: {
        primary: '#1a3a6b',
        secondary: '#2b5a8c',
        accent: '#e8a838',
        light: '#f0f4f8'
    },
    INA: {
        primary: '#1a3a6b',
        secondary: '#2b5a8c',
        accent: '#c41e24',
        light: '#f8f9fa'
    }
};

const boletaService = {
    // ============================================================
    // OBTENER DATOS DE LA BOLETA CON TOKEN EXPLÍCITO
    // tipo: 'periodo' | 'global'
    // ============================================================
    getDatosBoleta: async (idEstudiante, idPeriodo, idClase, tipo = 'periodo') => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('❌ No hay token de autenticación');
                throw new Error('No hay token de autenticación');
            }

            const url = tipo === 'global'
                ? `${API_URL}/boleta/estudiante/${idEstudiante}/global/clase/${idClase}`
                : `${API_URL}/boleta/estudiante/${idEstudiante}/periodo/${idPeriodo}/clase/${idClase}`;

            const response = await axios.get(
                url,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener datos de boleta:', error);
            throw error;
        }
    },

    // ============================================================
    // GENERAR PDF - FORMATO MINED (horizontal/landscape)
    // tipo: 'periodo' | 'global'
    // ============================================================
    generarPDFMined: async (estudiantes, periodo, clase, tipo = 'periodo') => {
        const doc = new jsPDF('l', 'mm', 'letter');
        const pageWidth = doc.internal.pageSize.getWidth();

        for (const estudiante of estudiantes) {
            const datos = await boletaService.getDatosBoleta(
                estudiante.idEstudiante,
                periodo,
                clase,
                tipo
            );

            dibujarBoletaMINED(doc, datos, pageWidth, tipo);

            if (estudiantes.indexOf(estudiante) < estudiantes.length - 1) {
                doc.addPage();
            }
        }

        doc.save(`boleta_mined_${tipo}.pdf`);
    },

    // ============================================================
    // GENERAR PDF - FORMATO INA (1 boleta por página, horizontal)
    // tipo: 'periodo' | 'global'
    // ============================================================
    generarPDFINA: async (estudiantes, periodo, clase, tipo = 'periodo') => {
        const doc = new jsPDF('l', 'mm', 'letter');

        for (let i = 0; i < estudiantes.length; i++) {
            const datos = await boletaService.getDatosBoleta(
                estudiantes[i].idEstudiante,
                periodo,
                clase,
                tipo
            );

            dibujarBoletaINA(doc, datos, tipo);

            if (i < estudiantes.length - 1) {
                doc.addPage();
            }
        }

        doc.save(`boletas_ina_${tipo}.pdf`);
    }
};

// ============================================================
// DIBUJAR BOLETA MINED (SIGES) - 1 boleta por página, horizontal
// Estructura oficial:
//  1) Encabezado oficial (logo + 4 líneas centradas)
//  2) Cuadrícula de datos institucionales y del estudiante
//  3) Cuadro de asistencias (una fila, etiqueta + valor)
//  4) Leyenda de abreviaturas (NI, PP, PPS, SP, SPS, NF)
//  5) Tabla principal de 12 columnas
//  6) Área de firmas (Director / Responsable de Sección)
//  7) Pie del sistema: sello SIGES (izquierda) + paginación (derecha)
// ============================================================
const dibujarBoletaMINED = (doc, datos, pageWidth, tipo = 'periodo') => {
    const margin = 10;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = margin + 5;

    // --- 1) ENCABEZADO OFICIAL (logo + texto apilado centrado) ---
    // Logo: placeholder circular (Escudo de El Salvador).
    // Reemplazar por doc.addImage(escudo, 'PNG', ...) si se dispone del archivo.
    const logoY = margin + 11;
    doc.setLineWidth(0.6);
    doc.setDrawColor(COLORS.MINED.primary);
    doc.circle(margin + 11, logoY, 7.5);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.MINED.primary);
    doc.text('SV', margin + 11, logoY + 1.4, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MINISTERIO DE EDUCACIÓN, CIENCIA Y TECNOLOGÍA', pageWidth / 2, y, { align: 'center' });
    y += 5.5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    doc.text('GERENCIA DE GESTIÓN Y REGISTRO ACADÉMICO', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text('DEPARTAMENTO DE REGISTRO ACADÉMICO', pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.MINED.primary);
    doc.text('BOLETA DE CALIFICACIONES', pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const subTitulo = tipo === 'global'
        ? `CICLO COMPLETO - AÑO ${datos.anioLectivo || '2026'}`
        : `PERIODO ${datos.periodoNumero || ''} - ${datos.periodoNombre || ''}`;
    doc.text(subTitulo, pageWidth / 2, y, { align: 'center' });
    y += 6;

    // --- 2) BLOQUE DE INFORMACIÓN INSTITUCIONAL Y DEL ESTUDIANTE ---
    const filasMetadata = [
        ['Sede Educativa', { content: '11330 - INSTITUTO NACIONAL "DE APOPA"', colSpan: 5 }],
        ['Servicio Educativo', { content: `Educación Media - Media - Único - ${datos.especialidad || 'Bachillerato Técnico Vocacional'}`, colSpan: 5 }],
        ['Plan de Estudio', { content: `PL2020 - TÉCNICO VOCACIONAL - ${datos.especialidad || 'Bachillerato'}`, colSpan: 5 }],
        ['Grado', datos.grado || 'Segundo Año', 'Sección', `${datos.seccion || 'C'} - Vespertino`, 'Año', String(datos.anioLectivo || '2026')],
        ['Estudiante', { content: `${datos.codigoEstudiante || ''} - ${(datos.apellidos || '').toUpperCase()}, ${(datos.nombres || '').toUpperCase()}`, colSpan: 5 }]
    ];

    autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        tableWidth: pageWidth - (margin * 2),
        body: filasMetadata,
        theme: 'grid',
        bodyStyles: {
            fontSize: 8,
            cellPadding: 1.8,
            halign: 'left',
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 42 },
            1: { cellWidth: 44 },
            2: { cellWidth: 42 },
            3: { cellWidth: 44 },
            4: { cellWidth: 30 },
            5: { cellWidth: 57.4 }
        },
        didParseCell: function (data) {
            if (data.section !== 'body') return;
            const esEtiqueta = data.column.index === 0 || (data.row.index === 3 && data.column.index % 2 === 0);
            if (esEtiqueta) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [240, 244, 248];
                data.cell.styles.textColor = [26, 58, 107];
            }
        }
    });

    y = doc.lastAutoTable.finalY + 3;

    // --- 3) CUADRO DE ASISTENCIAS (una fila, etiqueta + valor) ---
    const asistencias = datos.asistencias || {};
    const fechaAsistencia = asistencias.fecha || new Date().toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' });

    autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        tableWidth: pageWidth - (margin * 2),
        body: [[
            'Cuadro de asistencias al', fechaAsistencia,
            'Asistencias', String(asistencias.presentes || 0),
            'Inasistencias justificadas', String(asistencias.justificadas || 0),
            'Inasistencias sin justificar', String(asistencias.ausencias || 0)
        ]],
        theme: 'grid',
        bodyStyles: {
            fontSize: 7.5,
            cellPadding: 1.5,
            halign: 'center',
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 46 },
            2: { cellWidth: 22 },
            4: { cellWidth: 46 },
            6: { cellWidth: 46 }
        },
        didParseCell: function (data) {
            if (data.section === 'body' && data.column.index % 2 === 0) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [240, 244, 248];
                data.cell.styles.textColor = [26, 58, 107];
            }
        }
    });

    y = doc.lastAutoTable.finalY + 4;

    // --- 4) LEYENDA DE ABREVIATURAS ---
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80);
    doc.text(
        'NI=Nota institucional, PP=Primera prueba recuperación, PPS=PP por suficiencia, SP=Segunda prueba recuperación, SPS=SP por suficiencia, NF=Nota final',
        pageWidth / 2, y, { align: 'center' }
    );
    y += 3;

    // --- 5) TABLA PRINCIPAL DE CALIFICACIONES (12 columnas) ---
    const notas = datos.notas || [];
    const asignaturas = notas.filter(n => !n.esConducta);
    const criteriosConvivencia = notas.filter(n => n.esConducta) || [
        { nombreMateria: 'EVIDENCIA ACTITUDES FAVORABLES PARA LA CONVIVENCIA', p1: 'E', p2: 'E', p3: 'E', p4: 'E', notaFinal: 'E', estado: 'E' },
        { nombreMateria: 'TOMA DECISIONES DE FORMA AUTÓNOMA Y RESPONSABLE', p1: 'E', p2: 'E', p3: 'E', p4: 'E', notaFinal: 'E', estado: 'E' },
        { nombreMateria: 'SE EXPRESA Y PARTICIPA CON RESPETO EN DIFERENTES CONTEXTOS', p1: 'E', p2: 'E', p3: 'E', p4: 'E', notaFinal: 'E', estado: 'E' },
        { nombreMateria: 'MUESTRA SENTIDO DE PERTENENCIA Y CUIDADO DEL ENTORNO', p1: 'E', p2: 'E', p3: 'E', p4: 'E', notaFinal: 'E', estado: 'E' }
    ];

    const numeroPeriodo = datos.periodoNumero || 1;
    const colPeriodo = (n, p) => (tipo === 'global' ? n['p' + p] || '' : (numeroPeriodo === p ? n['p' + p] || '' : ''));

    const head = [[
        'Componente plan estudio',
        'P1', 'P2', 'P3', 'P4',
        'NI', 'PP', 'PPS', 'SP', 'SPS',
        'NF', 'Resultado'
    ]];

    const body = [
        ...asignaturas.map(n => [
            n.nombreMateria || 'Sin materia',
            colPeriodo(n, 1),
            colPeriodo(n, 2),
            colPeriodo(n, 3),
            colPeriodo(n, 4),
            tipo === 'global' ? n.ni || '' : '',
            tipo === 'global' ? n.pp || '' : '',
            tipo === 'global' ? n.pps || '' : '',
            tipo === 'global' ? n.sp || '' : '',
            tipo === 'global' ? n.sps || '' : '',
            n.notaFinal || '',
            n.estado || (parseFloat(n.notaFinal) >= 6 ? 'APROBADO' : 'REPROBADO')
        ]),
        ...criteriosConvivencia.map(n => [
            n.nombreMateria,
            'E', 'E', 'E', 'E',
            '', '', '', '', '',
            n.notaFinal || 'E',
            n.estado || 'E'
        ])
    ];

    autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        tableWidth: pageWidth - (margin * 2),
        head: head,
        body: body,
        theme: 'grid',
        headStyles: {
            fillColor: COLORS.MINED.primary,
            textColor: 255,
            fontSize: 7,
            halign: 'center',
            valign: 'middle',
            cellPadding: 1.5
        },
        bodyStyles: {
            fontSize: 7,
            halign: 'center',
            valign: 'middle',
            cellPadding: 1.2
        },
        columnStyles: {
            0: { cellWidth: 118, halign: 'left' },
            1: { cellWidth: 12 },
            2: { cellWidth: 12 },
            3: { cellWidth: 12 },
            4: { cellWidth: 12 },
            5: { cellWidth: 10.5 },
            6: { cellWidth: 10.5 },
            7: { cellWidth: 10.5 },
            8: { cellWidth: 10.5 },
            9: { cellWidth: 10.5 },
            10: { cellWidth: 13 },
            11: { cellWidth: 28 }
        },
        didParseCell: function (data) {
            if (data.section === 'body' && data.column.index === 10) {
                const nota = parseFloat(data.cell.raw);
                if (!isNaN(nota)) {
                    if (nota >= 6.0) {
                        data.cell.styles.fillColor = [212, 237, 218];
                    } else if (nota >= 5.0) {
                        data.cell.styles.fillColor = [255, 243, 205];
                    } else {
                        data.cell.styles.fillColor = [248, 215, 218];
                    }
                }
            }
        }
    });

    y = doc.lastAutoTable.finalY + 10;

    // --- 6) ÁREA DE FIRMAS ---
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);

    // Columna izquierda: Director(a) del Centro Educativo
    const NOMBRE_DIRECTOR = 'RUBIO DE GOMEZ, SONIA EUGENIA';
    doc.text(NOMBRE_DIRECTOR, margin + 12, y);
    doc.setFont('helvetica', 'normal');
    doc.text('_________________________________________', margin + 12, y + 4);
    doc.setFontSize(7.5);
    doc.text('Director(a) del Centro Educativo', margin + 12, y + 8);

    // Columna derecha: Responsable de Sección
    doc.setFontSize(8.5);
    doc.text('_________________________________________', margin + 115, y + 4);
    doc.setFontSize(7.5);
    doc.text('Responsable de Sección', margin + 115, y + 8);
    y += 12;

    // --- 7) PIE DEL SISTEMA (sello SIGES izquierda, paginación derecha) ---
    const ahora = new Date();
    const fechaSIGES = ahora.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaSIGES = ahora.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
    const paginaActual = doc.getCurrentPageInfo().pageNumber;
    const totalPaginas = doc.getNumberOfPages();

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text(`Obtenido del sistema SIGES - ${fechaSIGES} ${horaSIGES}`, margin, pageHeight - 6);
    doc.text(`${paginaActual}/${totalPaginas}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
    doc.setTextColor(0);
};

// ============================================================
// DIBUJAR BOLETA INA (1 boleta por página, horizontal)
// Estructura oficial:
//  1) Encabezado institucional (logo + 3 títulos centrados)
//  2) Datos del estudiante (2 filas)
//  3) Tabla principal con cabeceras combinadas (rowspan/colspan)
//  4) Filas: asignaturas básicas + módulos técnicos
//  5) Resumen: PROMEDIO, CONDUCTA, MATERIAS/MODULOS aprobados y reprobados
//  6) Asistencias, inasistencias justificadas e injustificadas
//  7) Pie de página: F: ______ DOCENTE ORIENTADOR/A
// ============================================================
const dibujarBoletaINA = (doc, datos, tipo = 'periodo') => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 8;
    const centerX = pageWidth / 2;

    // --- 1) ENCABEZADO INSTITUCIONAL (Top Banner) ---
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

    doc.setLineWidth(0.3);
    doc.rect(margin, margin, pageWidth - (margin * 2), 18);

    // Logo (placeholder; reemplazar por doc.addImage(logo, 'PNG', ...) si se dispone del archivo)
    const logoCx = 20;
    const logoCy = margin + 9;
    doc.setLineWidth(0.6);
    doc.setDrawColor(26, 58, 107);
    doc.circle(logoCx, logoCy, 5.5);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 107);
    doc.text('INA', logoCx, logoCy + 1.2, { align: 'center' });

    // Títulos centrales
    doc.setFontSize(11);
    doc.text('INSTITUTO NACIONAL DE APOPA', centerX, margin + 5.5, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(
        tipo === 'global' ? 'INFORME DE NOTAS GLOBAL (CICLO COMPLETO)' : 'INFORME DE NOTAS POR PERIODO',
        centerX, margin + 10.5, { align: 'center' }
    );

    const gradoBoleta = (datos.grado || '').toUpperCase() || 'PRIMER AÑO';
    const seccionBoleta = (datos.seccion || 'A').toUpperCase();
    doc.text(`${gradoBoleta} SECCION "${seccionBoleta}"`, centerX, margin + 15, { align: 'center' });

    // --- 2) DATOS DEL ESTUDIANTE (Student Info Bar) ---
    let yPos = margin + 21;
    const textX = margin + 2;

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('CODIGO:', textX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.codigoEstudiante || '', textX + 14, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Nº:', textX + 45, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.numeroLista || '', textX + 52, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('OPCION:', textX + 68, yPos);
    doc.setFont('helvetica', 'normal');
    const especialidad = (datos.especialidad || 'Bachillerato General').toUpperCase();
    doc.text(especialidad.substring(0, 38), textX + 80, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('AÑO', pageWidth - margin - 16, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(datos.anioLectivo || '2026'), pageWidth - margin - 4, yPos, { align: 'right' });

    yPos += 4.5;

    doc.setFont('helvetica', 'bold');
    doc.text('NOMBRES:', textX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text((datos.nombres || '').toUpperCase(), textX + 15, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('APELLIDOS:', textX + 95, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text((datos.apellidos || '').toUpperCase(), textX + 110, yPos);

    yPos += 6;

    // --- 3) TABLA PRINCIPAL (cabeceras con celdas combinadas) ---
    const notas = datos.notas || [];
    const asignaturas = notas.filter(n => !n.esConducta && !/^MOD/i.test(n.nombreMateria || ''));
    const modulos = notas.filter(n => !n.esConducta && /^MOD/i.test(n.nombreMateria || ''));

    const head = [
        [
            { content: 'ASIGNATURAS Y/O MODULOS INTEGRALES', rowSpan: 2, styles: { halign: 'left' } },
            { content: 'PERIODO', colSpan: 4 },
            { content: 'ORDINARIO', rowSpan: 2 },
            { content: 'RECUPERACION', rowSpan: 2 },
            { content: 'NOTA FINAL', rowSpan: 2 },
            { content: 'INASISTENCIA\nEN DÍAS', rowSpan: 2 }
        ],
        [
            'UNO', 'DOS', 'TRES', 'CUATRO'
        ]
    ];

    const filaMateria = (n) => [
        n.nombreMateria || '',
        n.p1 || '',
        n.p2 || '',
        n.p3 || '',
        n.p4 || '',
        n.promedio || '',
        n.recuperacion || '',
        n.notaFinal || '',
        n.inasistencias || ''
    ];

    const body = [
        ...asignaturas.map(filaMateria),
        ...modulos.map(filaMateria)
    ];

    // --- 5) FILAS DE RESUMEN Y ESTADISTICAS ---
    const valPeriodo = (lista, p) => lista.filter(n => {
        const v = parseFloat(n['p' + p]);
        return !isNaN(v) && v >= 6;
    }).length;
    const valOrdinario = (lista) => lista.filter(n => {
        const v = parseFloat(n.promedio);
        return !isNaN(v) && v >= 6;
    }).length;
    const valNf = (lista) => lista.filter(n => {
        const v = parseFloat(n.notaFinal);
        return !isNaN(v) && v >= 6;
    }).length;

    const notasFinales = asignaturas.map(n => parseFloat(n.notaFinal)).filter(v => !isNaN(v));
    const promedio = notasFinales.length > 0
        ? (notasFinales.reduce((a, b) => a + b, 0) / notasFinales.length).toFixed(1)
        : '';

    const modulosAprobados = valNf(modulos);
    const modulosReprobados = modulos.length - modulosAprobados;

    body.push(
        ['PROMEDIO', '', '', '', '', '', '', promedio, ''],
        ['CONDUCTA', datos.conducta || 'E', '', '', '', '', '', '', ''],
        [
            'MATERIAS APROBADAS',
            valPeriodo(asignaturas, 1),
            valPeriodo(asignaturas, 2),
            valPeriodo(asignaturas, 3),
            valPeriodo(asignaturas, 4),
            valOrdinario(asignaturas),
            '',
            valNf(asignaturas),
            ''
        ],
        [
            'MATERIAS REPROBADAS',
            asignaturas.length - valPeriodo(asignaturas, 1),
            asignaturas.length - valPeriodo(asignaturas, 2),
            asignaturas.length - valPeriodo(asignaturas, 3),
            asignaturas.length - valPeriodo(asignaturas, 4),
            asignaturas.length - valOrdinario(asignaturas),
            '',
            asignaturas.length - valNf(asignaturas),
            ''
        ],
        ['MODULOS APROBADOS', '', '', '', '', '', '', modulosAprobados, ''],
        ['MODULOS REPROBADOS', '', '', '', '', '', '', modulosReprobados, '']
    );

    const inicioResumen = body.length - 6;

    autoTable(doc, {
        startY: yPos,
        margin: { left: margin, right: margin },
        tableWidth: pageWidth - (margin * 2),
        head: head,
        body: body,
        theme: 'grid',
        headStyles: {
            fillColor: [26, 58, 107],
            textColor: 255,
            fontSize: 7,
            halign: 'center',
            valign: 'middle',
            cellPadding: 1.2
        },
        bodyStyles: {
            fontSize: 6.5,
            cellPadding: 1,
            halign: 'center',
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 130, halign: 'left' },
            1: { cellWidth: 15.5 },
            2: { cellWidth: 15.5 },
            3: { cellWidth: 15.5 },
            4: { cellWidth: 15.5 },
            5: { cellWidth: 18 },
            6: { cellWidth: 18 },
            7: { cellWidth: 18 },
            8: { cellWidth: 20.4 }
        },
        didParseCell: function (data) {
            if (data.section !== 'body') return;

            // Etiquetas de resumen: primera columna alineada a la derecha y en negrita
            if (data.row.index >= inicioResumen && data.column.index === 0) {
                data.cell.styles.halign = 'right';
                data.cell.styles.fontStyle = 'bold';
            }

            // Color semafórico en NOTA FINAL y valores de resumen
            if (data.column.index === 7 || data.row.index >= inicioResumen) {
                const nota = parseFloat(data.cell.raw);
                if (!isNaN(nota)) {
                    if (nota >= 6.0) {
                        data.cell.styles.fillColor = [212, 237, 218];
                    } else if (nota >= 5.0) {
                        data.cell.styles.fillColor = [255, 243, 205];
                    } else {
                        data.cell.styles.fillColor = [248, 215, 218];
                    }
                }
            }
        }
    });

    // --- 6) ASISTENCIAS E INASISTENCIAS ---
    let yInfo = doc.lastAutoTable.finalY + 4;
    const asistencias = datos.asistencias || {};
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 107);
    doc.text('ASISTENCIAS:', textX, yInfo);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    doc.text(String(asistencias.presentes || 0), textX + 18, yInfo);

    doc.setFont('helvetica', 'bold');
    doc.text('INASISTENCIAS JUSTIFICADAS:', textX + 30, yInfo);
    doc.setFont('helvetica', 'normal');
    doc.text(String(asistencias.justificadas || 0), textX + 64, yInfo);

    doc.setFont('helvetica', 'bold');
    doc.text('INASISTENCIAS INJUSTIFICADAS:', textX + 78, yInfo);
    doc.setFont('helvetica', 'normal');
    doc.text(String(asistencias.ausencias || 0), textX + 118, yInfo);

    // --- 7) PIE DE PAGINA ---
    const yFirma = pageHeight - margin - 12;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    doc.text('F: _______________________________________', centerX, yFirma, { align: 'center' });
    doc.text('DOCENTE ORIENTADOR/A', centerX, yFirma + 4.5, { align: 'center' });
};

export default boletaService;