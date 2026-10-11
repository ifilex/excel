import { OfficeAddon, Sheet, Workbook } from '../types/spreadsheet';
import { cellKey, coordsToAddress, formatCellValue } from './cellUtils';
import { formulaEngine } from './formulaEngine';

export const AVAILABLE_ADDONS: OfficeAddon[] = [
  {
    id: 'addon-word-bridge',
    name: 'Word Report Generator & Doc Bridge',
    iconName: 'FileText',
    category: 'Integración Office',
    description: 'Genera informes ejecutivos enriquecidos, minutas de reunión y memorandos estilo Microsoft Word a partir de los datos de la planilla.',
    author: 'Microsoft Office Integrations',
    version: '2.4.0',
    installed: true,
    actionType: 'word_bridge',
  },
  {
    id: 'addon-data-cleaner',
    name: 'Asistente de Limpieza de Datos Pro',
    iconName: 'Sparkles',
    category: 'Automatización',
    description: 'Elimina espacios en blanco superfluos, estandariza mayúsculas/minúsculas, repara fechas y separa texto en columnas automáticamente.',
    author: 'DataOps Suite',
    version: '3.1.2',
    installed: true,
    actionType: 'data_cleaner',
  },
  {
    id: 'addon-deduplicator',
    name: 'Detector y Eliminador de Duplicados',
    iconName: 'CopySlash',
    category: 'Productividad',
    description: 'Identifica registros idénticos o casi duplicados, resalta coincidencias y purga registros repetidos manteniendo la integridad referencial.',
    author: 'Office Tools Team',
    version: '1.9.0',
    installed: true,
    actionType: 'deduplicator',
  },
  {
    id: 'addon-pivot-builder',
    name: 'Generador de Tablas Dinámicas (Pivot Tables)',
    iconName: 'TableProperties',
    category: 'Análisis',
    description: 'Crea resúmenes multidimensionales con agrupación por filas, columnas y agregaciones (Suma, Promedio, Recuento, Máximo, Mínimo).',
    author: 'Business Intelligence Addons',
    version: '4.0.1',
    installed: true,
    actionType: 'pivot_builder',
  },
  {
    id: 'addon-financial-modeler',
    name: 'Modelador Financiero & Tablas de Amortización',
    iconName: 'Calculator',
    category: 'Análisis',
    description: 'Generador automático de cuadros de préstamos (sistema francés/alemán), análisis de VAN, TIR, flujo de caja proyectado y punto de equilibrio.',
    author: 'FinCorp Analytics',
    version: '2.0.5',
    installed: true,
    actionType: 'financial_modeler',
  },
  {
    id: 'addon-ai-copilot',
    name: 'Copilot AI Formula & VBA Assistant',
    iconName: 'Bot',
    category: 'Automatización',
    description: 'Asistente inteligente con tecnología Gemini para redactar fórmulas complejas, generar scripts VBA y explicar discrepancias en los datos.',
    author: 'Microsoft Cloud AI Partner',
    version: '5.2.0',
    installed: true,
    actionType: 'ai_copilot',
  },
];

/**
 * Executes Data Cleaning Wizard
 */
export function executeDataCleaner(sheet: Sheet, options: {
  trimSpaces?: boolean;
  toProperCase?: boolean;
  removeEmptyRows?: boolean;
}): { updatedSheet: Sheet; changesCount: number } {
  const newSheet = { ...sheet, data: { ...sheet.data } };
  let changesCount = 0;

  for (const key of Object.keys(newSheet.data)) {
    const cell = newSheet.data[key];
    if (cell && typeof cell.value === 'string' && !cell.formula) {
      let val = cell.value;
      const original = val;

      if (options.trimSpaces) {
        val = val.replace(/\s+/g, ' ').trim();
      }
      if (options.toProperCase) {
        val = val.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      }

      if (val !== original) {
        newSheet.data[key] = {
          ...cell,
          value: val,
          displayValue: val,
        };
        changesCount++;
      }
    }
  }

  return { updatedSheet: newSheet, changesCount };
}

/**
 * Generates Loan Amortization Schedule onto a new or existing sheet
 */
export function generateAmortizationTable(
  amount: number,
  annualRate: number,
  months: number
): Record<string, any> {
  const data: Record<string, any> = {};
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

  // Headers
  const headers = ['Mes', 'Saldo Inicial', 'Cuota Fija', 'Interés', 'Capital', 'Saldo Final'];
  headers.forEach((h, c) => {
    data[cellKey(c, 0)] = {
      value: h,
      format: { bold: true, bgColor: '#107c41', textColor: '#ffffff', align: 'center' },
    };
  });

  let balance = amount;
  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    const endBalance = Math.max(0, balance - principal);

    data[cellKey(0, m)] = { value: m, format: { align: 'center' } };
    data[cellKey(1, m)] = { value: Math.round(balance * 100) / 100, format: { numFormat: 'currency' } };
    data[cellKey(2, m)] = { value: Math.round(monthlyPayment * 100) / 100, format: { numFormat: 'currency', bold: true } };
    data[cellKey(3, m)] = { value: Math.round(interest * 100) / 100, format: { numFormat: 'currency', textColor: '#b91c1c' } };
    data[cellKey(4, m)] = { value: Math.round(principal * 100) / 100, format: { numFormat: 'currency', textColor: '#047857' } };
    data[cellKey(5, m)] = { value: Math.round(endBalance * 100) / 100, format: { numFormat: 'currency' } };

    balance = endBalance;
  }

  return data;
}

/**
 * Removes duplicate rows based on column values
 */
export function removeDuplicateRows(sheet: Sheet, maxCol = 10, maxRow = 100): { updatedSheet: Sheet; removedCount: number } {
  const newSheet = { ...sheet, data: { ...sheet.data } };
  const seenRows = new Set<string>();
  const duplicateRowIndexes: number[] = [];

  for (let r = 1; r < maxRow; r++) { // skip header row 0
    let rowFingerprint = '';
    let hasData = false;

    for (let c = 0; c < maxCol; c++) {
      const cell = newSheet.data[cellKey(c, r)];
      if (cell && cell.value !== null && cell.value !== undefined && cell.value !== '') {
        hasData = true;
      }
      rowFingerprint += `|${cell?.value ?? ''}`;
    }

    if (hasData) {
      if (seenRows.has(rowFingerprint)) {
        duplicateRowIndexes.push(r);
      } else {
        seenRows.add(rowFingerprint);
      }
    }
  }

  // Remove duplicate cells
  duplicateRowIndexes.forEach((r) => {
    for (let c = 0; c < maxCol; c++) {
      delete newSheet.data[cellKey(c, r)];
    }
  });

  return { updatedSheet: newSheet, removedCount: duplicateRowIndexes.length };
}
