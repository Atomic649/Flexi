import fontkit from 'fontkit';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

/**
 * Fill WHTTemplate.pdf with provided data and save as a new PDF, using Thai font.
 * @param templatePath Path to the WHTTemplate.pdf
 * @param outputPath Path to save the filled PDF
 * @param fields Object with keys as field names and values as text to add
 * @param positions Object with keys as field names and values as {x, y, size}
 * @param thaiFontPath Path to Thai font file
 */
export async function fillWHTTemplateWithThaiFont({
  templatePath,
  fields,
  positions,
  thaiFontPath,
}: {
  templatePath: string;
  fields: Record<string, string>;
  positions: Record<string, { x: number; y: number; size?: number }>;
  thaiFontPath: string;
}): Promise<Buffer> {
  // Load the template and Thai font
  const templateBytes = fs.readFileSync(templatePath);
  const fontBytes = fs.readFileSync(thaiFontPath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const thaiFont = await pdfDoc.embedFont(fontBytes);
  const page = pdfDoc.getPages()[0];

  // Add each field at its position using Thai font
  Object.entries(fields).forEach(([key, value]) => {
    const pos = positions[key];
    if (pos) {
      page.drawText(value, {
        x: pos.x,
        y: pos.y,
        size: pos.size || 12,
        font: thaiFont,
        color: rgb(1, 0, 0), // Red for development visibility
      });
    }
  });

  // Return the filled PDF as a Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Example usage:
// fillWHTTemplateWithThaiFont({
//   templatePath: path.resolve(__dirname, '../../WHTTemplate.pdf'),
//   outputPath: path.resolve(__dirname, '../../uploads/pdf/WHTDocument_filled.pdf'),
//   fields: {
//     taxpayerName: 'ชื่อผู้เสียภาษี',
//     taxpayerId: '1234567890',
//     amount: '1000.00',
//     date: '29/08/2025',
//   },
//   positions: {
//     taxpayerName: { x: 100, y: 700, size: 14 },
//     taxpayerId: { x: 100, y: 680, size: 12 },
//     amount: { x: 400, y: 650, size: 12 },
//     date: { x: 400, y: 630, size: 12 },
//   },
//   thaiFontPath: path.resolve(__dirname, '../../fonts/THSarabunNew.ttf'),
// });
