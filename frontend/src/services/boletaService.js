import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5228/api';

let logoCache = null;
async function getLogoBase64() {
    if (logoCache) return logoCache;
    try {
        const baseUrl = API_URL.replace(/\/api$/, '');
        const response = await fetch(`${baseUrl}/images/logo-ina.png`);
        if (!response.ok) throw new Error('Logo no encontrado');
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                logoCache = reader.result;
                resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('No se pudo cargar el logo:', e);
        return '';
    }
}

// Helper para calcular Nota Final correctamente (regla INA)
function calcularNotaFinal(n) {
    const p1 = parseFloat(n.p1) || 0;
    const p2 = parseFloat(n.p2) || 0;
    const p3 = parseFloat(n.p3) || 0;
    const p4 = parseFloat(n.p4) || 0;
    
    // Ordinaria: promedio de los 4 periodos
    const ordinaria = (p1 + p2 + p3 + p4) / 4;
    
    // Si hay recuperación, aplicarla al periodo más bajo (tope 6.0)
    const recuperacion = parseFloat(n.recuperacion);
    if (recuperacion && recuperacion > 0) {
        const recLimitada = Math.min(recuperacion, 6.0);
        const periodos = [p1, p2, p3, p4].sort((a, b) => a - b);
        // Reemplazar el periodo más bajo si la recuperación es mayor
        if (recLimitada > periodos[0]) {
            return (recLimitada + periodos[1] + periodos[2] + periodos[3]) / 4;
        }
    }
    
    return ordinaria;
}

function dibujarBoletaINA(doc, datos, boxTop, logoBase64, numeroLista) {
    const boxH = 140;
    const leftX = 4;
    const boxW = 202;
    let y = boxTop;

    // 1. CAJA EXTERNA
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.rect(leftX, y, boxW, boxH);

    // 2. HEADER CON COORDENADAS ABSOLUTAS
    if (logoBase64 && logoBase64.length > 100) {
        try {
            doc.addImage(logoBase64, 'PNG', leftX + 2, y + 2, 10, 10);
        } catch (e) {
            doc.setLineWidth(0.6);
            doc.setDrawColor(26, 58, 107);
            doc.circle(leftX + 7, y + 7, 5.5);
            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 58, 107);
            doc.text('INA', leftX + 7, y + 9, { align: 'center' });
        }
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 107);
    doc.text('INSTITUTO NACIONAL DE APOPA', leftX + boxW / 2, y + 6, { align: 'center' });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const subTitulo = datos.periodoNumero === 0 ? 'INFORME DE NOTAS GLOBAL (CICLO COMPLETO)' : 'INFORME DE NOTAS POR PERIODO';
    doc.text(subTitulo, leftX + boxW / 2, y + 11, { align: 'center' });

    const grado = (datos.grado || 'PRIMER AÑO').toUpperCase();
    const seccion = (datos.seccion || 'A').toUpperCase();
    doc.text(`${grado} SECCION "${seccion}"`, leftX + boxW / 2, y + 15, { align: 'center' });

    // DATOS DEL ESTUDIANTE (Coordenadas X/Y fijas y separadas)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');

    // Fila 1 de datos
    doc.text('CODIGO:', leftX + 2, y + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(String(datos.codigoEstudiante || 'N/A'), leftX + 16, y + 20);

    doc.setFont('helvetica', 'bold');
    doc.text('Nº:', leftX + 55, y + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(String(numeroLista || datos.numeroLista || 'N/A'), leftX + 61, y + 20);

    doc.setFont('helvetica', 'bold');
    doc.text('OPCION:', leftX + 75, y + 20);
    doc.setFont('helvetica', 'normal');
    const opcionTexto = (datos.especialidad || 'Bachillerato General').toUpperCase();
    doc.text(opcionTexto.substring(0, 40), leftX + 88, y + 20);

    doc.setFont('helvetica', 'bold');
    doc.text('AÑO:', leftX + 170, y + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(String(datos.anioLectivo || ''), leftX + 178, y + 20);

    // Fila 2 de datos
    doc.setFont('helvetica', 'bold');
    doc.text('NOMBRES:', leftX + 2, y + 25);
    doc.setFont('helvetica', 'normal');
    const nombresTexto = (datos.nombres || 'N/A').toUpperCase();
    doc.text(nombresTexto.substring(0, 45), leftX + 16, y + 25);

    doc.setFont('helvetica', 'bold');
    doc.text('APELLIDOS:', leftX + 110, y + 25);
    doc.setFont('helvetica', 'normal');
    const apellidosTexto = (datos.apellidos || 'N/A').toUpperCase();
    doc.text(apellidosTexto.substring(0, 40), leftX + 125, y + 25);

    // 3. TABLA PRINCIPAL CON autoTable
    const notas = datos.notas || [];

    // Helper para crear fila de materia (9 columnas exactas)
    const filaMateria = (n) => {
        const notaFinalCalculada = calcularNotaFinal(n);
        return [
            n.nombreMateria || '',
            n.p1 !== null && n.p1 !== undefined ? n.p1 : '',
            n.p2 !== null && n.p2 !== undefined ? n.p2 : '',
            n.p3 !== null && n.p3 !== undefined ? n.p3 : '',
            n.p4 !== null && n.p4 !== undefined ? n.p4 : '',
            n.promedio !== null && n.promedio !== undefined ? n.promedio : '',
            n.recuperacion !== null && n.recuperacion !== undefined ? n.recuperacion : '',
            notaFinalCalculada.toFixed(2),
            n.inasistencias !== null && n.inasistencias !== undefined ? n.inasistencias : ''
        ];
    };

    // Cálculos de resumen
    const asignaturas = notas.filter(n => !n.esModulo);
    const modulos = notas.filter(n => n.esModulo);

    const contarAprobadas = (lista) => lista.filter(n => {
        const v = calcularNotaFinal(n);
        return !isNaN(v) && v >= 6.0;
    }).length;

    const aprobadas = contarAprobadas(asignaturas);
    const reprobadas = asignaturas.length - aprobadas;
    const modAprob = contarAprobadas(modulos);
    const modReprob = modulos.length - modAprob;

    // Calcular promedio general de nota final
    const notasFinalesValidas = asignaturas.map(n => calcularNotaFinal(n)).filter(v => !isNaN(v) && v > 0);
    const promedioGeneral = notasFinalesValidas.length > 0
        ? (notasFinalesValidas.reduce((a, b) => a + b, 0) / notasFinalesValidas.length).toFixed(2)
        : '';

    const body = [
        ...asignaturas.map(filaMateria),
        ...modulos.map(filaMateria),
        ['PROMEDIO GENERAL', '', '', '', '', '', '', promedioGeneral, ''],
        ['CONDUCTA', datos.conducta || 'E', '', '', '', '', '', '', ''],
        ['MATERIAS APROBADAS', aprobadas, '', '', '', '', '', '', ''],
        ['MATERIAS REPROBADAS', reprobadas, '', '', '', '', '', '', ''],
        ['MODULOS APROBADOS', '', '', '', '', '', '', modAprob, ''],
        ['MODULOS REPROBADOS', '', '', '', '', '', '', modReprob, '']
    ];

    autoTable(doc, {
        startY: y + 28,
        margin: { left: leftX + 2, right: leftX + 2 },
        tableWidth: 198,
        head: [
            [
                { content: 'ASIGNATURAS Y/O MODULOS INTEGRALES', rowSpan: 2, styles: { halign: 'left', fontSize: 7 } },
                { content: 'PERIODO', colSpan: 4, styles: { fontSize: 7 } },
                { content: 'ORDINARIO', rowSpan: 2, styles: { fontSize: 7 } },
                { content: 'RECUPERACION', rowSpan: 2, styles: { fontSize: 7 } },
                { content: 'NOTA FINAL', rowSpan: 2, styles: { fontSize: 7 } },
                { content: 'INASISTENCIAS', rowSpan: 2, styles: { fontSize: 7 } }
            ],
            [
                { content: 'UNO', styles: { fontSize: 7 } },
                { content: 'DOS', styles: { fontSize: 7 } },
                { content: 'TRES', styles: { fontSize: 7 } },
                { content: 'CUATRO', styles: { fontSize: 7 } }
            ]
        ],
        body: body,
        theme: 'grid',
        headStyles: {
            fillColor: [26, 58, 107],
            textColor: 255,
            fontSize: 7,
            halign: 'center',
            valign: 'middle',
            cellPadding: 1.5
        },
        bodyStyles: {
            fontSize: 6,
            halign: 'center',
            valign: 'middle',
            cellPadding: 1
        },
        columnStyles: {
            0: { cellWidth: 78, halign: 'left' },   // Asignaturas
            1: { cellWidth: 13 },                    // UNO
            2: { cellWidth: 13 },                    // DOS
            3: { cellWidth: 13 },                    // TRES
            4: { cellWidth: 13 },                    // CUATRO
            5: { cellWidth: 18 },                    // ORDINARIO
            6: { cellWidth: 18 },                    // RECUPERACION
            7: { cellWidth: 18 },                    // NOTA FINAL
            8: { cellWidth: 18 }                     // INASISTENCIAS
        },
        didParseCell: function (data) {
            if (data.section !== 'body') return;
            // Alinear a la derecha las etiquetas de resumen
            if (data.row.index >= notas.length + 1 && data.column.index === 0) {
                data.cell.styles.halign = 'right';
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 6;
            }
            // Colorear celdas de Nota Final
            if (data.column.index === 7) {
                const nota = parseFloat(data.cell.raw);
                if (!isNaN(nota)) {
                    if (nota >= 6.0) data.cell.styles.fillColor = [212, 237, 218]; // Verde
                    else if (nota > 0) data.cell.styles.fillColor = [255, 243, 205]; // Amarillo
                    else data.cell.styles.fillColor = [248, 215, 218]; // Rojo
                }
            }
        }
    });

    // 4. SECCIÓN DE RESUMEN Y FIRMA (Fuera de autoTable, con coordenadas fijas)
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : y + 90;
    const yResumen = Math.min(finalY + 5, y + 120);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 107);

    // Asistencias con más separación
    const asist = datos.asistencias || {};
    doc.text('ASISTENCIAS:', leftX + 2, yResumen);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(String(asist.presentes || 0), leftX + 20, yResumen);

    doc.setFont('helvetica', 'bold');
    doc.text('JUSTIFICADAS:', leftX + 40, yResumen);
    doc.setFont('helvetica', 'normal');
    doc.text(String(asist.justificadas || 0), leftX + 58, yResumen);

    doc.setFont('helvetica', 'bold');
    doc.text('INJUSTIFICADAS:', leftX + 80, yResumen);
    doc.setFont('helvetica', 'normal');
    doc.text(String(asist.ausencias || 0), leftX + 100, yResumen);

    // FIRMA (más arriba dentro de la caja)
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('F: _______________________________________', leftX + boxW / 2, y + 132, { align: 'center' });
    doc.text('DOCENTE ORIENTADOR/A', leftX + boxW / 2, y + 135, { align: 'center' });
}

async function generarPDFINA(listaEstudiantes, idPeriodo, idClase, tipo = 'periodo') {
    const logoBase64 = await getLogoBase64();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const estudiantes = Array.isArray(listaEstudiantes) ? listaEstudiantes : [listaEstudiantes];

    for (let i = 0; i < estudiantes.length; i++) {
        const est = estudiantes[i];
        let url = tipo === 'global'
            ? `/boleta/estudiante/${est.idEstudiante}/global/clase/${idClase}`
            : `/boleta/estudiante/${est.idEstudiante}/periodo/${idPeriodo}/clase/${idClase}`;

        let datos;
        try {
            const resp = await API.get(url);
            datos = resp.data;
        } catch (error) {
            console.error(`Error obteniendo boleta del estudiante ${est.idEstudiante}:`, error);
            continue;
        }

        if (i > 0 && i % 2 === 0) {
            doc.addPage();
        }

        // Posiciones ajustadas para evitar superposición
        const boxTop = (i % 2 === 0) ? 5 : 152;
        dibujarBoletaINA(doc, datos, boxTop, logoBase64, i + 1);
    }

    const fecha = new Date().toISOString().split('T')[0];
    doc.save(`Boletas_INA_${fecha}.pdf`);
}

async function generarPDFMined(listaEstudiantes, idPeriodo, idClase, tipo = 'periodo') {
    // Función MINED mantenida para compatibilidad
}

const boletaService = {
    generarPDFINA,
    generarPDFMined,
    getLogoBase64
};

export default boletaService;
