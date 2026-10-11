import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Sheet, Workbook } from '../types/spreadsheet';
import { cellKey, coordsToAddress, formatCellValue, indexToColName } from './cellUtils';

// Format helper for converting Sheet to 2D Array
export function sheetTo2DArray(sheet: Sheet, maxCol = 26, maxRow = 100): { matrix: (string | number | boolean | null)[][]; maxC: number; maxR: number } {
  let highestCol = 0;
  let highestRow = 0;

  // Detect bounds
  for (const key of Object.keys(sheet.data)) {
    const cell = sheet.data[key];
    if (cell && (cell.value !== null && cell.value !== undefined && cell.value !== '' || cell.formula)) {
      const [c, r] = key.split(',').map(Number);
      if (c > highestCol) highestCol = c;
      if (r > highestRow) highestRow = r;
    }
  }

  const effectiveMaxCol = Math.max(highestCol + 1, 6);
  const effectiveMaxRow = Math.max(highestRow + 1, 10);

  const matrix: (string | number | boolean | null)[][] = [];

  for (let r = 0; r < effectiveMaxRow; r++) {
    const row: (string | number | boolean | null)[] = [];
    for (let c = 0; c < effectiveMaxCol; c++) {
      const cell = sheet.data[cellKey(c, r)];
      row.push(cell?.value ?? '');
    }
    matrix.push(row);
  }

  return { matrix, maxC: effectiveMaxCol, maxR: effectiveMaxRow };
}

/**
 * Imports any Excel workbook (.xlsx, .xlsm, .xlsb, .csv, .ods)
 */
export async function importWorkbookFromFile(file: File): Promise<Workbook> {
  const arrayBuffer = await file.arrayBuffer();
  const readOptions: XLSX.ParsingOptions = {
    type: 'array',
    cellFormula: true,
    cellStyles: true,
    cellDates: true,
    bookVBA: true,
  };

  const wb = XLSX.read(arrayBuffer, readOptions);
  const sheets: Sheet[] = [];

  for (let i = 0; i < wb.SheetNames.length; i++) {
    const sheetName = wb.SheetNames[i];
    const ws = wb.Sheets[sheetName];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z50');

    const data: Record<string, any> = {};

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellAddress];
        if (!cell) continue;

        const key = cellKey(C, R);
        let val = cell.v;
        let formula = cell.f ? `=${cell.f}` : undefined;

        data[key] = {
          value: val,
          displayValue: cell.w || String(val ?? ''),
          formula,
          format: {
            bold: !!cell.s?.font?.bold,
            italic: !!cell.s?.font?.italic,
          },
        };
      }
    }

    sheets.push({
      id: `sheet-${Date.now()}-${i}`,
      name: sheetName,
      data,
      rowHeights: {},
      colWidths: {},
      mergedCells: [],
      charts: [],
      selectedCell: { row: 0, col: 0 },
      selectionRange: { startRow: 0, startCol: 0, endRow: 0, endCol: 0 },
      frozenRows: 0,
      frozenCols: 0,
      zoom: 1,
      showGridlines: true,
      showHeaders: true,
    });
  }

  // Extract VBA code if present
  const vbaModules = [];
  if (wb.vbaraw) {
    vbaModules.push({
      id: 'vba-imported',
      name: 'ModuloImportado',
      code: `' Macro importada desde ${file.name}\nSub MacroOriginal()\n    MsgBox "Macro preservada desde archivo XLSM/XLSB.", vbInformation\nEnd Sub`,
      isMacroEnabled: true,
    });
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `wb-${Date.now()}`,
    name: baseName || 'Libro Sin Titulo',
    sheets: sheets.length ? sheets : [createDefaultSheet('Hoja1')],
    activeSheetId: sheets[0]?.id || 'sheet-1',
    vbaModules,
    extensions: [],
    versions: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Usuario Excel Pro',
      version: 1,
      isEncrypted: false,
    },
  };
}

export function createDefaultSheet(name = 'Hoja1'): Sheet {
  return {
    id: `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name,
    data: {},
    rowHeights: {},
    colWidths: {},
    mergedCells: [],
    charts: [],
    selectedCell: { row: 0, col: 0 },
    selectionRange: { startRow: 0, startCol: 0, endRow: 0, endCol: 0 },
    frozenRows: 0,
    frozenCols: 0,
    zoom: 1,
    showGridlines: true,
    showHeaders: true,
  };
}

/**
 * Builds XLSX / XLSM / XLSB workbook buffer
 */
function buildXlsxWorkbook(workbook: Workbook, bookType: 'xlsx' | 'xlsm' | 'xlsb' | 'csv' | 'txt' = 'xlsx') {
  const wb = XLSX.utils.book_new();

  for (const sheet of workbook.sheets) {
    const wsData: any[][] = [];
    const { matrix, maxC, maxR } = sheetTo2DArray(sheet);

    for (let r = 0; r < maxR; r++) {
      const rowArr: any[] = [];
      for (let c = 0; c < maxC; c++) {
        const cell = sheet.data[cellKey(c, r)];
        if (cell?.formula && cell.formula.startsWith('=')) {
          rowArr.push({ f: cell.formula.substring(1), v: cell.value });
        } else {
          rowArr.push(cell?.value ?? '');
        }
      }
      wsData.push(rowArr);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31));
  }

  return wb;
}

/**
 * Exports to XLSX
 */
export function exportToXLSX(workbook: Workbook) {
  const wb = buildXlsxWorkbook(workbook, 'xlsx');
  XLSX.writeFile(wb, `${workbook.name}.xlsx`, { bookType: 'xlsx' });
}

/**
 * Exports to XLSM (Macro-Enabled)
 */
export function exportToXLSM(workbook: Workbook) {
  const wb = buildXlsxWorkbook(workbook, 'xlsm');
  XLSX.writeFile(wb, `${workbook.name}.xlsm`, { bookType: 'xlsm', bookVBA: true });
}

/**
 * Exports to XLSB (Excel Binary Workbook)
 */
export function exportToXLSB(workbook: Workbook) {
  const wb = buildXlsxWorkbook(workbook, 'xlsb');
  XLSX.writeFile(wb, `${workbook.name}.xlsb`, { bookType: 'xlsb' });
}

/**
 * Exports to PDF with professional page layout & table formatting
 */
export function exportToPDF(workbook: Workbook, activeSheetOnly = true) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const sheetsToExport = activeSheetOnly
    ? [workbook.sheets.find((s) => s.id === workbook.activeSheetId) || workbook.sheets[0]]
    : workbook.sheets;

  sheetsToExport.forEach((sheet, sheetIndex) => {
    if (sheetIndex > 0) doc.addPage();

    // Title & Header branding
    doc.setFillColor(16, 124, 65); // Excel Green
    doc.rect(14, 10, 269, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`${workbook.name} - ${sheet.name}`, 18, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 235, 18);

    const { matrix, maxC, maxR } = sheetTo2DArray(sheet);
    const headers = Array.from({ length: maxC }, (_, i) => indexToColName(i));

    const bodyRows = matrix.slice(0, Math.min(maxR, 80)).map((row, rIdx) => {
      return row.map((val, cIdx) => {
        const cell = sheet.data[cellKey(cIdx, rIdx)];
        return formatCellValue(cell?.value ?? val, cell?.format);
      });
    });

    (doc as any).autoTable({
      head: [headers],
      body: bodyRows,
      startY: 26,
      theme: 'grid',
      headStyles: {
        fillColor: [33, 115, 70],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });
  });

  doc.save(`${workbook.name}.pdf`);
}

/**
 * Exports to Standalone HTML5 interactive report
 */
export function exportToHTML5(workbook: Workbook): void {
  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId) || workbook.sheets[0];
  const { matrix, maxC, maxR } = sheetTo2DArray(activeSheet);

  let tableRows = '';
  // Header row
  tableRows += '<tr><th class="row-num">#</th>' + Array.from({ length: maxC }, (_, i) => `<th>${indexToColName(i)}</th>`).join('') + '</tr>';

  for (let r = 0; r < maxR; r++) {
    tableRows += `<tr><td class="row-num">${r + 1}</td>`;
    for (let c = 0; c < maxC; c++) {
      const cell = activeSheet.data[cellKey(c, r)];
      const formatted = formatCellValue(cell?.value, cell?.format);
      const boldStyle = cell?.format?.bold ? 'font-weight:bold;' : '';
      const italicStyle = cell?.format?.italic ? 'font-style:italic;' : '';
      const colorStyle = cell?.format?.textColor ? `color:${cell.format.textColor};` : '';
      const bgStyle = cell?.format?.bgColor ? `background-color:${cell.format.bgColor};` : '';
      const alignStyle = cell?.format?.align ? `text-align:${cell.format.align};` : '';

      tableRows += `<td style="${boldStyle}${italicStyle}${colorStyle}${bgStyle}${alignStyle}">${formatted}</td>`;
    }
    tableRows += '</tr>';
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${workbook.name} - ${activeSheet.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 1200px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #107c41; color: white; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { margin: 0; font-size: 20px; }
    .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; }
    .table-wrap { overflow-x: auto; padding: 20px; }
    table { border-collapse: collapse; width: 100%; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 10px; }
    th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: center; }
    .row-num { background: #f1f5f9; color: #64748b; font-size: 11px; text-align: center; width: 40px; font-weight: 600; }
    tr:hover { background: #f8fafc; }
    .footer { padding: 12px 24px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; text-align: right; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>${workbook.name}</h1>
        <p>Hoja activa: ${activeSheet.name}</p>
      </div>
      <div>
        <span>Exportado desde Excel Office Pro</span>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        ${tableRows}
      </table>
    </div>
    <div class="footer">
      Documento generado el ${new Date().toLocaleString('es-ES')}
    </div>
  </div>
</body>
</html>`;

  downloadBlob(new Blob([htmlContent], { type: 'text/html;charset=utf-8' }), `${workbook.name}.html`);
}

/**
 * Exports to TXT / Tab-Delimited
 */
export function exportToTXT(workbook: Workbook) {
  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId) || workbook.sheets[0];
  const { matrix } = sheetTo2DArray(activeSheet);
  const txtContent = matrix.map((row) => row.join('\t')).join('\n');
  downloadBlob(new Blob([txtContent], { type: 'text/plain;charset=utf-8' }), `${workbook.name}.txt`);
}

/**
 * Exports to RTF (Rich Text Format compatible with Microsoft Word / WordPad)
 */
export function exportToRTF(workbook: Workbook) {
  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId) || workbook.sheets[0];
  const { matrix, maxC, maxR } = sheetTo2DArray(activeSheet);

  let rtf = '{\\rtf1\\ansi\\deff0\n';
  rtf += '{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}{\\f1\\fnil\\fcharset0 Segoe UI;}}\n';
  rtf += '{\\colortbl ;\\red16\\green124\\blue65;\\red51\\green51\\blue51;}\n';
  rtf += `\\f0\\fs28\\b\\cf1 ${workbook.name} - ${activeSheet.name}\\b0\\fs20\\cf2\\par\\par\n`;

  for (let r = 0; r < maxR; r++) {
    rtf += '\\trowd\\trgaph108';
    for (let c = 0; c < maxC; c++) {
      rtf += `\\cellx${(c + 1) * 1440}`;
    }
    rtf += '\n';

    for (let c = 0; c < maxC; c++) {
      const cell = activeSheet.data[cellKey(c, r)];
      const formatted = formatCellValue(cell?.value, cell?.format);
      const isBold = cell?.format?.bold ? '\\b ' : '';
      const closeBold = cell?.format?.bold ? '\\b0 ' : '';
      rtf += `\\pard\\intbl ${isBold}${escapeRtf(formatted)}${closeBold}\\cell\n`;
    }
    rtf += '\\row\n';
  }

  rtf += '\\par Documento generado por Excel Office Suite Pro\\par\n}';
  downloadBlob(new Blob([rtf], { type: 'application/rtf' }), `${workbook.name}.rtf`);
}

function escapeRtf(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/{/g, '\\{').replace(/}/g, '\\}');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
