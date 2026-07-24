import { Reading } from '../models/Reading.js';
import { Weight } from '../models/Weight.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import prisma from '../prisma.js';

console.log('✅ reportController.js cargado');

function classifyBloodPressure(systolic, diastolic) {
  if (!systolic || !diastolic) return 'Sin datos suficientes';
  if (systolic < 120 && diastolic < 80) return 'Normal';
  if (systolic < 130 && diastolic < 80) return 'Elevada';
  if (systolic < 140 || diastolic < 90) return 'Hipertensión etapa 1';
  return 'Hipertensión etapa 2';
}

export const getReport = async (req, res) => {
  try {
    console.log('📊 getReport llamado');
    const { from, to } = req.query;
    const readings = await Reading.findByUserId(req.userId, 1000, 0);
    const weights = await Weight.findByUserId(req.userId);
    const stats = readings.length > 0 ? await Reading.getStats(req.userId, from, to) : { total: 0 };
    const recentReadings = readings.slice(0, 10);

    res.json({
      summary: stats,
      recent: recentReadings,
      totalWeights: weights.length,
      classification: classifyBloodPressure(stats.avg_sys, stats.avg_dia)
    });
  } catch (error) {
    console.error('❌ Error en getReport:', error);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
};

export const generateReportPDF = async (req, res) => {
  console.log('📄 generateReportPDF INICIADO');
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    console.log('Usuario:', user?.email);

    const readings = await Reading.findByUserId(req.userId, 10000, 0);
    const weights = await Weight.findByUserId(req.userId);
    console.log(`Lecturas: ${readings.length}, Pesos: ${weights.length}`);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Paleta de colores (usando rgb)
    const primary = rgb(0.15, 0.35, 0.65);      // Azul
    const secondary = rgb(0.4, 0.4, 0.4);       // Gris
    const lightGray = rgb(0.9, 0.9, 0.9);
    const black = rgb(0.1, 0.1, 0.1);
    const white = rgb(1, 1, 1);
    const red = rgb(0.8, 0.2, 0.2);
    const green = rgb(0.1, 0.7, 0.1);
    const orange = rgb(0.9, 0.6, 0.1);

    let page = pdfDoc.addPage([595, 842]); // A4
    const margin = 50;
    let y = 800;

    const addNewPage = () => {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    };

    const drawText = (text, x, y, size = 10, fontType = font, color = black) => {
      page.drawText(text, { x, y, size, font: fontType, color });
    };

    const drawLine = (x1, y1, x2, y2, color = rgb(0.8, 0.8, 0.8)) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 1, color });
    };

    // --- Encabezado ---
    // Línea superior
    drawLine(margin, y + 10, margin + 495, y + 10, primary);
    y -= 10;
    drawText('SysPress - Reporte Clínico', margin, y, 20, boldFont, primary);
    y -= 30;

    // Datos del paciente
    drawText(`Paciente: ${user?.name || 'Sin nombre'}`, margin, y, 12, boldFont);
    y -= 18;
    drawText(`Email: ${user?.email || '-'}`, margin, y, 10, font, secondary);
    y -= 18;
    drawText(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, margin, y, 10, font, secondary);
    y -= 30;

    // Línea separadora
    drawLine(margin, y, margin + 495, y);
    y -= 20;

    // --- Resumen de lecturas ---
    const stats = readings.length > 0 ? await Reading.getStats(req.userId) : { total: 0 };

    drawText('RESUMEN DE PRESIÓN ARTERIAL', margin, y, 12, boldFont, primary);
    y -= 20;
    drawText(`Total de lecturas: ${stats.total || 0}`, margin, y, 10);
    y -= 15;
    drawText(`Sistólica promedio: ${Math.round(stats.avg_sys || 0)} mmHg`, margin, y, 10);
    y -= 15;
    drawText(`Diastólica promedio: ${Math.round(stats.avg_dia || 0)} mmHg`, margin, y, 10);
    y -= 15;
    drawText(`Pulso promedio: ${Math.round(stats.avg_pulse || 0)} lpm`, margin, y, 10);
    y -= 15;

    // Clasificación con color
    const classification = classifyBloodPressure(stats.avg_sys, stats.avg_dia);
    let classColor = secondary;
    if (classification === 'Normal') classColor = green;
    else if (classification === 'Elevada') classColor = orange;
    else if (classification.includes('Hipertensión')) classColor = red;
    drawText(`Clasificación: ${classification}`, margin, y, 10, boldFont, classColor);
    y -= 25;

    // Línea separadora
    drawLine(margin, y, margin + 495, y);
    y -= 20;

    // --- Tabla de lecturas ---
    if (readings.length > 0) {
      drawText('DETALLE DE LECTURAS', margin, y, 12, boldFont, primary);
      y -= 22;

      // Encabezados de tabla (con fondo gris claro)
      const headers = ['Fecha', 'Sist.', 'Diast.', 'Pulso', 'Notas'];
      const colWidths = [120, 50, 50, 50, 150];
      let xPos = margin;

      // Encabezado con fondo
      headers.forEach((h, i) => {
        drawText(h, xPos + 4, y, 9, boldFont, primary);
        xPos += colWidths[i];
      });
      y -= 12;
      drawLine(margin, y+7, margin + 495, y+7);
      y -= 5;

      let rowCount = 0;
      for (const r of readings) {
        if (y < 60) {
          addNewPage();
          // Repetir encabezados
          xPos = margin;
          headers.forEach((h, i) => {
            drawText(h, xPos + 4, y, 9, boldFont, primary);
            xPos += colWidths[i];
          });
          y -= 12;
          drawLine(margin, y, margin + 495, y);
          y -= 5;
          rowCount = 0;
        }

        xPos = margin;
        const date = new Date(r.measuredAt).toLocaleDateString('es-ES');
        drawText(date, xPos + 4, y, 8, font);
        xPos += colWidths[0];
        drawText(r.systolic.toString(), xPos + 4, y, 8, font);
        xPos += colWidths[1];
        drawText(r.diastolic.toString(), xPos + 4, y, 8, font);
        xPos += colWidths[2];
        drawText(r.pulse ? r.pulse.toString() : '-', xPos + 4, y, 8, font);
        xPos += colWidths[3];
        drawText(r.notes || '-', xPos + 4, y, 8, font);
        y -= 12;
        rowCount++;
      }
      y -= 20;
    }

    drawLine(margin, y+10, margin + 495, y+10);

    // --- Pesos ---
    if (weights.length > 0) {
      if (y < 100) addNewPage();

      drawText('REGISTRO DE PESOS', margin, y-2, 12, boldFont, primary);
      y -= 22;

      const wHeaders = ['Fecha', 'Peso (kg)', 'Notas'];
      const wColWidths = [150, 80, 200];
      let xPosW = margin;

      wHeaders.forEach((h, i) => {
        drawText(h, xPosW + 4, y, 9, boldFont, primary);
        xPosW += wColWidths[i];
      });
      y -= 12;
      drawLine(margin, y+7, margin + 495, y+7);
      y -= 5;

      for (const w of weights) {
        if (y < 60) {
          addNewPage();
          xPosW = margin;
          wHeaders.forEach((h, i) => {
            drawText(h, xPosW + 4, y, 9, boldFont, primary);
            xPosW += wColWidths[i];
          });
          y -= 12;
          drawLine(margin, y, margin + 495, y);
          y -= 5;
        }
        xPosW = margin;
        const date = new Date(w.measuredAt).toLocaleDateString('es-ES');
        drawText(date, xPosW + 4, y, 8, font);
        xPosW += wColWidths[0];
        drawText(w.weight.toString(), xPosW + 4, y, 8, font);
        xPosW += wColWidths[1];
        drawText(w.notes || '-', xPosW + 4, y, 8, font);
        y -= 12;
      }
    }

    // --- Pie de página ---
    drawLine(margin, 40, margin + 495, 40, secondary);
    drawText('Generado por SysPress - Sistema de monitoreo de salud', margin, 28, 8, font, secondary);

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_syspress_${Date.now()}.pdf`);
    res.send(Buffer.from(pdfBytes));
    console.log('✅ PDF enviado correctamente');

  } catch (error) {
    console.error('❌ ERROR en generateReportPDF:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Error al generar el PDF',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};