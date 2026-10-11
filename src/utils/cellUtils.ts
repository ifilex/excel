import { CellData, CellFormat, NumberFormatType, SelectionRange } from '../types/spreadsheet';

/**
 * Converts 0-indexed column number to Excel column letters (0 -> 'A', 25 -> 'Z', 26 -> 'AA')
 */
export function indexToColName(index: number): string {
  let name = '';
  let num = index;
  while (num >= 0) {
    name = String.fromCharCode((num % 26) + 65) + name;
    num = Math.floor(num / 26) - 1;
  }
  return name;
}

export const columnToLetter = indexToColName;

/**
 * Converts Excel column letter to 0-indexed column number ('A' -> 0, 'Z' -> 25, 'AA' -> 26)
 */
export function colNameToIndex(colName: string): number {
  const upper = colName.toUpperCase().trim();
  let index = 0;
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
}

/**
 * Converts col and row (0-indexed) to cell address string like "A1", "B5"
 */
export function coordsToAddress(col: number, row: number): string {
  return `${indexToColName(col)}${row + 1}`;
}

/**
 * Parses "A1" or "$A$1" to { col: number, row: number }
 */
export function addressToCoords(address: string): { col: number; row: number } | null {
  const clean = address.replace(/\$/g, '').trim().toUpperCase();
  const match = clean.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  const colName = match[1];
  const rowNumber = parseInt(match[2], 10);
  return {
    col: colNameToIndex(colName),
    row: rowNumber - 1,
  };
}

/**
 * Normalizes internal cell key "col,row"
 */
export function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

export function parseCellKey(key: string): { col: number; row: number } {
  if (key.includes(',')) {
    const [c, r] = key.split(',').map(Number);
    return { col: c, row: r };
  }
  const coords = addressToCoords(key);
  return coords || { col: 0, row: 0 };
}

/**
 * Expands range string "A1:B3" to array of coordinate objects
 */
export function expandRange(rangeStr: string): { col: number; row: number }[] {
  const parts = rangeStr.split(':');
  if (parts.length === 1) {
    const coords = addressToCoords(parts[0]);
    return coords ? [coords] : [];
  }
  const start = addressToCoords(parts[0]);
  const end = addressToCoords(parts[1]);
  if (!start || !end) return [];

  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  const result: { col: number; row: number }[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      result.push({ col: c, row: r });
    }
  }
  return result;
}

/**
 * Checks if a cell coordinate is inside a selection range
 */
export function isCellInRange(col: number, row: number, range: SelectionRange): boolean {
  const minCol = Math.min(range.startCol, range.endCol);
  const maxCol = Math.max(range.startCol, range.endCol);
  const minRow = Math.min(range.startRow, range.endRow);
  const maxRow = Math.max(range.startRow, range.endRow);
  return col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;
}

/**
 * Formats a raw value according to cell format options
 */
export function formatCellValue(value: any, format?: CellFormat): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = typeof value === 'number' ? value : parseFloat(String(value));
  const isNumeric = !isNaN(num) && typeof value !== 'boolean' && String(value).trim() !== '';

  const numFormat: NumberFormatType = format?.numFormat || 'general';
  const decimals = format?.decimals !== undefined ? format.decimals : 2;
  const currencySymbol = format?.currencySymbol || '$';

  if (!isNumeric) {
    return String(value);
  }

  switch (numFormat) {
    case 'number':
      return num.toLocaleString('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

    case 'currency':
      return `${currencySymbol} ${num.toLocaleString('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;

    case 'percentage':
      return `${(num * (Math.abs(num) <= 1 ? 100 : 1)).toLocaleString('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}%`;

    case 'scientific':
      return num.toExponential(decimals);

    case 'date':
      try {
        // Handle Excel date serial number or date string
        let d: Date;
        if (num > 30000 && num < 70000) {
          // Excel epoch
          d = new Date((num - (25567 + 2)) * 86400 * 1000);
        } else {
          d = new Date(value);
        }
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('es-ES');
        }
      } catch {}
      return String(value);

    case 'time':
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('es-ES');
        }
      } catch {}
      return String(value);

    case 'text':
      return String(value);

    case 'general':
    default:
      return String(value);
  }
}
