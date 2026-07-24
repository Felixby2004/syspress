import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateReportPDF = (userEmail, readings, stats, weights) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Encabezado
      doc.fontSize(20).text('SysPress - Reporte de Salud', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Usuario: ${userEmail}`, { align: 'center' });
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Resumen de lecturas
      doc.fontSize(16).text('Resumen de Lecturas de Presión', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Total de lecturas: ${stats.total}`);
      doc.text(`Sistólica promedio: ${Math.round(stats.avg_sys || 0)} mmHg`);
      doc.text(`Diastólica promedio: ${Math.round(stats.avg_dia || 0)} mmHg`);
      doc.text(`Pulso promedio: ${Math.round(stats.avg_pulse || 0)} lpm`);
      doc.text(`Rango sistólico: ${stats.min_sys} - ${stats.max_sys} mmHg`);
      doc.text(`Rango diastólico: ${stats.min_dia} - ${stats.max_dia} mmHg`);
      doc.moveDown();

      // Últimas 10 lecturas en tabla
      doc.fontSize(14).text('Últimas 10 lecturas', { underline: true });
      doc.moveDown(0.5);
      const tableTop = doc.y;
      doc.fontSize(10);
      // Cabecera
      doc.text('Fecha', 50, tableTop, { width: 120, continued: true });
      doc.text('Sistólica', 170, tableTop, { width: 70, continued: true });
      doc.text('Diastólica', 240, tableTop, { width: 70, continued: true });
      doc.text('Pulso', 310, tableTop, { width: 70 });
      let y = tableTop + 20;
      readings.slice(0, 10).forEach(r => {
        const date = new Date(r.measuredAt).toLocaleDateString();
        doc.text(date, 50, y, { width: 120, continued: true });
        doc.text(r.systolic.toString(), 170, y, { width: 70, continued: true });
        doc.text(r.diastolic.toString(), 240, y, { width: 70, continued: true });
        doc.text(r.pulse?.toString() || '-', 310, y, { width: 70 });
        y += 20;
      });
      doc.moveDown();

      // Peso
      if (weights && weights.count > 0) {
        doc.fontSize(14).text('Evolución de Peso', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Peso actual: ${weights.latest?.weight || 'N/A'} kg`);
        doc.text(`Peso inicial: ${weights.first?.weight || 'N/A'} kg`);
        doc.text(`Promedio: ${Math.round(weights.avg || 0)} kg`);
        doc.text(`Mínimo: ${weights.min || 'N/A'} kg`);
        doc.text(`Máximo: ${weights.max || 'N/A'} kg`);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};