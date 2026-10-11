import { Sheet, Workbook } from '../types/spreadsheet';
import { cellKey } from '../utils/cellUtils';
import { formulaEngine } from '../utils/formulaEngine';

export interface SpreadsheetTemplate {
  id: string;
  name: string;
  category: 'General' | 'Finanzas' | 'Gestión & Proyectos' | 'Ventas & Facturación' | 'Personal';
  description: string;
  iconName: string;
  badge?: string;
  createWorkbook: () => Workbook;
}

// 1. Completely blank clean workbook
export function createBlankWorkbook(): Workbook {
  const emptySheet: Sheet = {
    id: 'sheet-1',
    name: 'Hoja1',
    data: {},
    rowHeights: {},
    colWidths: {},
    mergedCells: [],
    charts: [],
    selectedCell: { row: 0, col: 0 },
    selectionRange: { startRow: 0, startCol: 0, endRow: 0, endCol: 0 },
    frozenRows: 0,
    frozenCols: 0,
    tabColor: '#107c41',
    zoom: 1,
    showGridlines: true,
    showHeaders: true,
  };

  return {
    id: `wb-${Date.now()}`,
    name: 'Libro1',
    sheets: [emptySheet],
    activeSheetId: 'sheet-1',
    vbaModules: [],
    extensions: [],
    versions: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Usuario',
      version: 1,
      isEncrypted: false,
    },
  };
}

// 2. Financial Budget Template (Presupuesto Financiero y Operaciones)
export function createFinancialBudgetTemplate(): Workbook {
  const sheet1Data: Record<string, any> = {
    [cellKey(0, 0)]: { value: 'RESUMEN FINANCIERO Y VENTAS ANUALES 2026', format: { bold: true, fontSize: 13, textColor: '#107c41' } },
    [cellKey(0, 1)]: { value: 'División de Operaciones Corporativas - Oficina Regional', format: { italic: true, textColor: '#64748b' } },

    [cellKey(0, 3)]: { value: 'Trimestre', format: { bold: true, bgColor: '#107c41', textColor: '#ffffff', align: 'center' } },
    [cellKey(1, 3)]: { value: 'Ingresos Ventas', format: { bold: true, bgColor: '#107c41', textColor: '#ffffff', align: 'right' } },
    [cellKey(2, 3)]: { value: 'Costos Operativos', format: { bold: true, bgColor: '#107c41', textColor: '#ffffff', align: 'right' } },
    [cellKey(3, 3)]: { value: 'Margen Bruto', format: { bold: true, bgColor: '#107c41', textColor: '#ffffff', align: 'right' } },
    [cellKey(4, 3)]: { value: 'Impuestos (21%)', format: { bold: true, bgColor: '#107c41', textColor: '#ffffff', align: 'right' } },
    [cellKey(5, 3)]: { value: 'Utilidad Neta', format: { bold: true, bgColor: '#107c41', textColor: '#ffffff', align: 'right' } },
    [cellKey(6, 3)]: { value: '% Rentabilidad', format: { bold: true, bgColor: '#107c41', textColor: '#ffffff', align: 'right' } },

    [cellKey(0, 4)]: { value: 'Q1 (Ene - Mar)', format: { bold: true } },
    [cellKey(1, 4)]: { value: 125000, format: { numFormat: 'currency' } },
    [cellKey(2, 4)]: { value: 68000, format: { numFormat: 'currency' } },
    [cellKey(3, 4)]: { formula: '=B5-C5', format: { numFormat: 'currency' } },
    [cellKey(4, 4)]: { formula: '=D5*0.21', format: { numFormat: 'currency' } },
    [cellKey(5, 4)]: { formula: '=D5-E5', format: { numFormat: 'currency', bold: true, textColor: '#047857' } },
    [cellKey(6, 4)]: { formula: '=F5/B5', format: { numFormat: 'percentage' } },

    [cellKey(0, 5)]: { value: 'Q2 (Abr - Jun)', format: { bold: true } },
    [cellKey(1, 5)]: { value: 148500, format: { numFormat: 'currency' } },
    [cellKey(2, 5)]: { value: 74200, format: { numFormat: 'currency' } },
    [cellKey(3, 5)]: { formula: '=B6-C6', format: { numFormat: 'currency' } },
    [cellKey(4, 5)]: { formula: '=D6*0.21', format: { numFormat: 'currency' } },
    [cellKey(5, 5)]: { formula: '=D6-E6', format: { numFormat: 'currency', bold: true, textColor: '#047857' } },
    [cellKey(6, 5)]: { formula: '=F6/B6', format: { numFormat: 'percentage' } },

    [cellKey(0, 6)]: { value: 'Q3 (Jul - Sep)', format: { bold: true } },
    [cellKey(1, 6)]: { value: 182000, format: { numFormat: 'currency' } },
    [cellKey(2, 6)]: { value: 89000, format: { numFormat: 'currency' } },
    [cellKey(3, 6)]: { formula: '=B7-C7', format: { numFormat: 'currency' } },
    [cellKey(4, 6)]: { formula: '=D7*0.21', format: { numFormat: 'currency' } },
    [cellKey(5, 6)]: { formula: '=D7-E7', format: { numFormat: 'currency', bold: true, textColor: '#047857' } },
    [cellKey(6, 6)]: { formula: '=F7/B7', format: { numFormat: 'percentage' } },

    [cellKey(0, 7)]: { value: 'Q4 (Oct - Dic)', format: { bold: true } },
    [cellKey(1, 7)]: { value: 215400, format: { numFormat: 'currency' } },
    [cellKey(2, 7)]: { value: 98500, format: { numFormat: 'currency' } },
    [cellKey(3, 7)]: { formula: '=B8-C8', format: { numFormat: 'currency' } },
    [cellKey(4, 7)]: { formula: '=D8*0.21', format: { numFormat: 'currency' } },
    [cellKey(5, 7)]: { formula: '=D8-E8', format: { numFormat: 'currency', bold: true, textColor: '#047857' } },
    [cellKey(6, 7)]: { formula: '=F8/B8', format: { numFormat: 'percentage' } },

    [cellKey(0, 8)]: { value: 'TOTAL ANUAL', format: { bold: true, bgColor: '#f1f5f9' } },
    [cellKey(1, 8)]: { formula: '=SUM(B5:B8)', format: { bold: true, numFormat: 'currency', bgColor: '#f1f5f9' } },
    [cellKey(2, 8)]: { formula: '=SUM(C5:C8)', format: { bold: true, numFormat: 'currency', bgColor: '#f1f5f9' } },
    [cellKey(3, 8)]: { formula: '=SUM(D5:D8)', format: { bold: true, numFormat: 'currency', bgColor: '#f1f5f9' } },
    [cellKey(4, 8)]: { formula: '=SUM(E5:E8)', format: { bold: true, numFormat: 'currency', bgColor: '#f1f5f9' } },
    [cellKey(5, 8)]: { formula: '=SUM(F5:F8)', format: { bold: true, numFormat: 'currency', bgColor: '#dcfce7', textColor: '#15803d' } },
    [cellKey(6, 8)]: { formula: '=AVERAGE(G5:G8)', format: { bold: true, numFormat: 'percentage', bgColor: '#f1f5f9' } },

    [cellKey(0, 10)]: { value: 'Métricas Clave del Ejercicio', format: { bold: true, textColor: '#334155' } },
    [cellKey(0, 11)]: { value: 'Ingreso Promedio Trimestral', format: {} },
    [cellKey(1, 11)]: { formula: '=AVERAGE(B5:B8)', format: { numFormat: 'currency', bold: true } },
    [cellKey(0, 12)]: { value: 'Máximo Trimestre en Ventas', format: {} },
    [cellKey(1, 12)]: { formula: '=MAX(B5:B8)', format: { numFormat: 'currency', bold: true } },
  };

  const sheet1: Sheet = {
    id: 'sheet-1',
    name: 'Presupuesto Financiero',
    data: sheet1Data,
    rowHeights: { 0: 28, 3: 26, 8: 26 },
    colWidths: { 0: 160, 1: 135, 2: 135, 3: 130, 4: 125, 5: 130, 6: 120 },
    mergedCells: [],
    charts: [
      {
        id: 'chart-1',
        title: 'Comparativa Ingresos vs Costos',
        type: 'column',
        dataRange: 'A4:C8',
        labelColumn: 0,
        valueColumns: [1, 2],
        position: { x: 50, y: 380, width: 520, height: 260 },
      },
    ],
    selectedCell: { row: 4, col: 1 },
    selectionRange: { startRow: 4, startCol: 1, endRow: 4, endCol: 1 },
    frozenRows: 4,
    frozenCols: 1,
    tabColor: '#107c41',
    zoom: 1,
    showGridlines: true,
    showHeaders: true,
  };

  const wb: Workbook = {
    id: `wb-financial-${Date.now()}`,
    name: 'Presupuesto Financiero 2026',
    sheets: [sheet1],
    activeSheetId: 'sheet-1',
    vbaModules: [],
    extensions: [],
    versions: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Finanzas',
      version: 1,
      isEncrypted: false,
    },
  };

  wb.sheets[0] = formulaEngine.evaluateSheet(wb.sheets[0], wb);
  return wb;
}

// 3. Inventory & Stock Template (Control de Inventario)
export function createInventoryTemplate(): Workbook {
  const data: Record<string, any> = {
    [cellKey(0, 0)]: { value: 'CONTROL DE INVENTARIO Y STOCK EN ALMACÉN', format: { bold: true, fontSize: 13, textColor: '#1e40af' } },
    [cellKey(0, 1)]: { value: 'Gestión de existencias, precios de compra y puntos de reorden', format: { italic: true, textColor: '#64748b' } },

    [cellKey(0, 3)]: { value: 'Código SKU', format: { bold: true, bgColor: '#1e40af', textColor: '#ffffff' } },
    [cellKey(1, 3)]: { value: 'Descripción del Producto', format: { bold: true, bgColor: '#1e40af', textColor: '#ffffff' } },
    [cellKey(2, 3)]: { value: 'Categoría', format: { bold: true, bgColor: '#1e40af', textColor: '#ffffff' } },
    [cellKey(3, 3)]: { value: 'Stock Actual', format: { bold: true, bgColor: '#1e40af', textColor: '#ffffff', align: 'right' } },
    [cellKey(4, 3)]: { value: 'Stock Mínimo', format: { bold: true, bgColor: '#1e40af', textColor: '#ffffff', align: 'right' } },
    [cellKey(5, 3)]: { value: 'Precio Unitario', format: { bold: true, bgColor: '#1e40af', textColor: '#ffffff', align: 'right' } },
    [cellKey(6, 3)]: { value: 'Valor Total', format: { bold: true, bgColor: '#1e40af', textColor: '#ffffff', align: 'right' } },
    [cellKey(7, 3)]: { value: 'Estado / Alerta', format: { bold: true, bgColor: '#1e40af', textColor: '#ffffff', align: 'center' } },

    [cellKey(0, 4)]: { value: 'SKU-101', format: {} },
    [cellKey(1, 4)]: { value: 'Laptop UltraSlim 15" i7', format: {} },
    [cellKey(2, 4)]: { value: 'Computación', format: {} },
    [cellKey(3, 4)]: { value: 18, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(4, 4)]: { value: 20, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(5, 4)]: { value: 950, format: { numFormat: 'currency' } },
    [cellKey(6, 4)]: { formula: '=D5*F5', format: { numFormat: 'currency' } },
    [cellKey(7, 4)]: { formula: '=IF(D5<=E5,"REORDENAR","EN STOCK")', format: { bold: true, align: 'center', textColor: '#dc2626' } },

    [cellKey(0, 5)]: { value: 'SKU-102', format: {} },
    [cellKey(1, 5)]: { value: 'Monitor 4K HDR 27 Pulgadas', format: {} },
    [cellKey(2, 5)]: { value: 'Pantallas', format: {} },
    [cellKey(3, 5)]: { value: 45, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(4, 5)]: { value: 15, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(5, 5)]: { value: 380, format: { numFormat: 'currency' } },
    [cellKey(6, 5)]: { formula: '=D6*F6', format: { numFormat: 'currency' } },
    [cellKey(7, 5)]: { formula: '=IF(D6<=E6,"REORDENAR","EN STOCK")', format: { bold: true, align: 'center', textColor: '#16a34a' } },

    [cellKey(0, 6)]: { value: 'SKU-103', format: {} },
    [cellKey(1, 6)]: { value: 'Teclado Mecánico RGB Pro', format: {} },
    [cellKey(2, 6)]: { value: 'Periféricos', format: {} },
    [cellKey(3, 6)]: { value: 90, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(4, 6)]: { value: 30, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(5, 6)]: { value: 110, format: { numFormat: 'currency' } },
    [cellKey(6, 6)]: { formula: '=D7*F7', format: { numFormat: 'currency' } },
    [cellKey(7, 6)]: { formula: '=IF(D7<=E7,"REORDENAR","EN STOCK")', format: { bold: true, align: 'center', textColor: '#16a34a' } },

    [cellKey(0, 7)]: { value: 'SKU-104', format: {} },
    [cellKey(1, 7)]: { value: 'Mouse Ergonómico Inalámbrico', format: {} },
    [cellKey(2, 7)]: { value: 'Periféricos', format: {} },
    [cellKey(3, 7)]: { value: 12, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(4, 7)]: { value: 25, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(5, 7)]: { value: 55, format: { numFormat: 'currency' } },
    [cellKey(6, 7)]: { formula: '=D8*F8', format: { numFormat: 'currency' } },
    [cellKey(7, 7)]: { formula: '=IF(D8<=E8,"REORDENAR","EN STOCK")', format: { bold: true, align: 'center', textColor: '#dc2626' } },

    // Summary
    [cellKey(1, 9)]: { value: 'VALOR TOTAL DEL INVENTARIO:', format: { bold: true } },
    [cellKey(6, 9)]: { formula: '=SUM(G5:G8)', format: { bold: true, numFormat: 'currency', bgColor: '#eff6ff', textColor: '#1e40af' } },
  };

  const sheet: Sheet = {
    id: 'sheet-inv',
    name: 'Inventario de Stock',
    data,
    rowHeights: { 0: 26, 3: 26 },
    colWidths: { 0: 110, 1: 220, 2: 130, 3: 110, 4: 110, 5: 130, 6: 140, 7: 130 },
    mergedCells: [],
    charts: [],
    selectedCell: { row: 4, col: 1 },
    selectionRange: { startRow: 4, startCol: 1, endRow: 4, endCol: 1 },
    frozenRows: 4,
    frozenCols: 1,
    tabColor: '#2563eb',
    zoom: 1,
    showGridlines: true,
    showHeaders: true,
  };

  const wb: Workbook = {
    id: `wb-inventory-${Date.now()}`,
    name: 'Control de Inventario y Stock',
    sheets: [sheet],
    activeSheetId: 'sheet-inv',
    vbaModules: [],
    extensions: [],
    versions: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Almacén',
      version: 1,
      isEncrypted: false,
    },
  };

  wb.sheets[0] = formulaEngine.evaluateSheet(wb.sheets[0], wb);
  return wb;
}

// 4. Commercial Invoice Template (Factura Comercial y Cotización)
export function createInvoiceTemplate(): Workbook {
  const data: Record<string, any> = {
    [cellKey(0, 0)]: { value: 'FACTURA COMERCIAL / INVOICE', format: { bold: true, fontSize: 15, textColor: '#0f766e' } },
    [cellKey(0, 1)]: { value: 'Nº Factura: FAC-2026-0089', format: { bold: true, textColor: '#475569' } },
    [cellKey(4, 1)]: { value: 'Fecha de Emisión: 26/08/2026', format: { align: 'right' } },

    [cellKey(0, 3)]: { value: 'Datos del Emisor:', format: { bold: true, textColor: '#0f766e' } },
    [cellKey(0, 4)]: { value: 'Empresa: Soluciones Digitales Global S.A.', format: {} },
    [cellKey(0, 5)]: { value: 'CIF / NIF: B-98765432', format: {} },

    [cellKey(3, 3)]: { value: 'Facturar a (Cliente):', format: { bold: true, textColor: '#0f766e' } },
    [cellKey(3, 4)]: { value: 'Cliente: Corporación ABC Servicios', format: {} },
    [cellKey(3, 5)]: { value: 'Dirección: Av. Diagonal 450, Planta 4', format: {} },

    // Items table
    [cellKey(0, 7)]: { value: 'Ítem', format: { bold: true, bgColor: '#0f766e', textColor: '#ffffff' } },
    [cellKey(1, 7)]: { value: 'Descripción del Servicio o Producto', format: { bold: true, bgColor: '#0f766e', textColor: '#ffffff' } },
    [cellKey(2, 7)]: { value: 'Cantidad', format: { bold: true, bgColor: '#0f766e', textColor: '#ffffff', align: 'right' } },
    [cellKey(3, 7)]: { value: 'Precio Unitario', format: { bold: true, bgColor: '#0f766e', textColor: '#ffffff', align: 'right' } },
    [cellKey(4, 7)]: { value: 'Importe Total', format: { bold: true, bgColor: '#0f766e', textColor: '#ffffff', align: 'right' } },

    [cellKey(0, 8)]: { value: 1, format: { align: 'center' } },
    [cellKey(1, 8)]: { value: 'Consultoría e Implementación Cloud Server', format: {} },
    [cellKey(2, 8)]: { value: 40, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(3, 8)]: { value: 65, format: { numFormat: 'currency' } },
    [cellKey(4, 8)]: { formula: '=C9*D9', format: { numFormat: 'currency' } },

    [cellKey(0, 9)]: { value: 2, format: { align: 'center' } },
    [cellKey(1, 9)]: { value: 'Licencia Anual de Software Empresarial Pro', format: {} },
    [cellKey(2, 9)]: { value: 5, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(3, 9)]: { value: 320, format: { numFormat: 'currency' } },
    [cellKey(4, 9)]: { formula: '=C10*D10', format: { numFormat: 'currency' } },

    [cellKey(0, 10)]: { value: 3, format: { align: 'center' } },
    [cellKey(1, 10)]: { value: 'Mantenimiento y Soporte 24/7 (3 meses)', format: {} },
    [cellKey(2, 10)]: { value: 3, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(3, 10)]: { value: 450, format: { numFormat: 'currency' } },
    [cellKey(4, 10)]: { formula: '=C11*D11', format: { numFormat: 'currency' } },

    // Calculations
    [cellKey(3, 12)]: { value: 'Subtotal Base Imponible:', format: { bold: true, align: 'right' } },
    [cellKey(4, 12)]: { formula: '=SUM(E9:E11)', format: { bold: true, numFormat: 'currency' } },

    [cellKey(3, 13)]: { value: 'IVA (21%):', format: { bold: true, align: 'right' } },
    [cellKey(4, 13)]: { formula: '=E13*0.21', format: { bold: true, numFormat: 'currency' } },

    [cellKey(3, 14)]: { value: 'TOTAL FACTURA:', format: { bold: true, bgColor: '#0f766e', textColor: '#ffffff', align: 'right' } },
    [cellKey(4, 14)]: { formula: '=E13+E14', format: { bold: true, numFormat: 'currency', bgColor: '#ccfbf1', textColor: '#0f766e' } },
  };

  const sheet: Sheet = {
    id: 'sheet-inv-fac',
    name: 'Factura Comercial',
    data,
    rowHeights: { 0: 28, 7: 26, 14: 28 },
    colWidths: { 0: 70, 1: 300, 2: 90, 3: 140, 4: 150 },
    mergedCells: [],
    charts: [],
    selectedCell: { row: 8, col: 1 },
    selectionRange: { startRow: 8, startCol: 1, endRow: 8, endCol: 1 },
    frozenRows: 8,
    frozenCols: 0,
    tabColor: '#0f766e',
    zoom: 1,
    showGridlines: true,
    showHeaders: true,
  };

  const wb: Workbook = {
    id: `wb-invoice-${Date.now()}`,
    name: 'Factura Comercial FAC-2026',
    sheets: [sheet],
    activeSheetId: 'sheet-inv-fac',
    vbaModules: [],
    extensions: [],
    versions: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Facturación',
      version: 1,
      isEncrypted: false,
    },
  };

  wb.sheets[0] = formulaEngine.evaluateSheet(wb.sheets[0], wb);
  return wb;
}

// 5. Loan Amortization Schedule Template (Tabla de Amortización)
export function createLoanAmortizationTemplate(): Workbook {
  const data: Record<string, any> = {
    [cellKey(0, 0)]: { value: 'TABLA DE AMORTIZACIÓN DE PRÉSTAMO (SISTEMA FRANCÉS)', format: { bold: true, fontSize: 13, textColor: '#7c3aed' } },
    [cellKey(0, 1)]: { value: 'Cálculo de cuota nivelada constante con desglose mensual de capital e intereses', format: { italic: true, textColor: '#64748b' } },

    // Parameters
    [cellKey(0, 3)]: { value: 'Monto del Préstamo (Capital):', format: { bold: true } },
    [cellKey(1, 3)]: { value: 50000, format: { numFormat: 'currency', bold: true } },

    [cellKey(0, 4)]: { value: 'Tasa de Interés Anual (TNA):', format: { bold: true } },
    [cellKey(1, 4)]: { value: 0.085, format: { numFormat: 'percentage', bold: true } },

    [cellKey(0, 5)]: { value: 'Plazo (Meses):', format: { bold: true } },
    [cellKey(1, 5)]: { value: 12, format: { numFormat: 'number', decimals: 0, bold: true } },

    // Schedule headers
    [cellKey(0, 7)]: { value: 'Mes / Período', format: { bold: true, bgColor: '#7c3aed', textColor: '#ffffff', align: 'center' } },
    [cellKey(1, 7)]: { value: 'Saldo Inicial', format: { bold: true, bgColor: '#7c3aed', textColor: '#ffffff', align: 'right' } },
    [cellKey(2, 7)]: { value: 'Cuota Fija Mensual', format: { bold: true, bgColor: '#7c3aed', textColor: '#ffffff', align: 'right' } },
    [cellKey(3, 7)]: { value: 'Amortización Capital', format: { bold: true, bgColor: '#7c3aed', textColor: '#ffffff', align: 'right' } },
    [cellKey(4, 7)]: { value: 'Intereses del Mes', format: { bold: true, bgColor: '#7c3aed', textColor: '#ffffff', align: 'right' } },
    [cellKey(5, 7)]: { value: 'Saldo Final Deudor', format: { bold: true, bgColor: '#7c3aed', textColor: '#ffffff', align: 'right' } },

    // Period 1
    [cellKey(0, 8)]: { value: 1, format: { align: 'center' } },
    [cellKey(1, 8)]: { value: 50000, format: { numFormat: 'currency' } },
    [cellKey(2, 8)]: { value: 4361.27, format: { numFormat: 'currency' } },
    [cellKey(3, 8)]: { formula: '=C9-E9', format: { numFormat: 'currency' } },
    [cellKey(4, 8)]: { formula: '=B9*(0.085/12)', format: { numFormat: 'currency' } },
    [cellKey(5, 8)]: { formula: '=B9-D9', format: { numFormat: 'currency' } },

    // Period 2
    [cellKey(0, 9)]: { value: 2, format: { align: 'center' } },
    [cellKey(1, 9)]: { formula: '=F9', format: { numFormat: 'currency' } },
    [cellKey(2, 9)]: { value: 4361.27, format: { numFormat: 'currency' } },
    [cellKey(3, 9)]: { formula: '=C10-E10', format: { numFormat: 'currency' } },
    [cellKey(4, 9)]: { formula: '=B10*(0.085/12)', format: { numFormat: 'currency' } },
    [cellKey(5, 9)]: { formula: '=B10-D10', format: { numFormat: 'currency' } },

    // Period 3
    [cellKey(0, 10)]: { value: 3, format: { align: 'center' } },
    [cellKey(1, 10)]: { formula: '=F10', format: { numFormat: 'currency' } },
    [cellKey(2, 10)]: { value: 4361.27, format: { numFormat: 'currency' } },
    [cellKey(3, 10)]: { formula: '=C11-E11', format: { numFormat: 'currency' } },
    [cellKey(4, 10)]: { formula: '=B11*(0.085/12)', format: { numFormat: 'currency' } },
    [cellKey(5, 10)]: { formula: '=B11-D11', format: { numFormat: 'currency' } },

    // Period 4
    [cellKey(0, 11)]: { value: 4, format: { align: 'center' } },
    [cellKey(1, 11)]: { formula: '=F11', format: { numFormat: 'currency' } },
    [cellKey(2, 11)]: { value: 4361.27, format: { numFormat: 'currency' } },
    [cellKey(3, 11)]: { formula: '=C12-E12', format: { numFormat: 'currency' } },
    [cellKey(4, 11)]: { formula: '=B12*(0.085/12)', format: { numFormat: 'currency' } },
    [cellKey(5, 11)]: { formula: '=B12-D12', format: { numFormat: 'currency' } },

    // Totals
    [cellKey(0, 13)]: { value: 'TOTAL ACUMULADO:', format: { bold: true } },
    [cellKey(2, 13)]: { formula: '=SUM(C9:C12)', format: { bold: true, numFormat: 'currency' } },
    [cellKey(3, 13)]: { formula: '=SUM(D9:D12)', format: { bold: true, numFormat: 'currency' } },
    [cellKey(4, 13)]: { formula: '=SUM(E9:E12)', format: { bold: true, numFormat: 'currency', textColor: '#7c3aed' } },
  };

  const sheet: Sheet = {
    id: 'sheet-amort',
    name: 'Amortización Préstamo',
    data,
    rowHeights: { 0: 26, 7: 26, 13: 26 },
    colWidths: { 0: 120, 1: 130, 2: 140, 3: 150, 4: 140, 5: 140 },
    mergedCells: [],
    charts: [],
    selectedCell: { row: 8, col: 1 },
    selectionRange: { startRow: 8, startCol: 1, endRow: 8, endCol: 1 },
    frozenRows: 8,
    frozenCols: 1,
    tabColor: '#7c3aed',
    zoom: 1,
    showGridlines: true,
    showHeaders: true,
  };

  const wb: Workbook = {
    id: `wb-loan-${Date.now()}`,
    name: 'Amortización de Préstamo Francés',
    sheets: [sheet],
    activeSheetId: 'sheet-amort',
    vbaModules: [],
    extensions: [],
    versions: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Financiero',
      version: 1,
      isEncrypted: false,
    },
  };

  wb.sheets[0] = formulaEngine.evaluateSheet(wb.sheets[0], wb);
  return wb;
}

// 6. Project Timeline & Task Tracker (Planificador de Proyectos)
export function createProjectTimelineTemplate(): Workbook {
  const data: Record<string, any> = {
    [cellKey(0, 0)]: { value: 'CRONOGRAMA Y SEGUIMIENTO DE PROYECTO 2026', format: { bold: true, fontSize: 13, textColor: '#0284c7' } },
    [cellKey(0, 1)]: { value: 'Control de hitos, responsables, fechas de entrega y estados de ejecución', format: { italic: true, textColor: '#64748b' } },

    [cellKey(0, 3)]: { value: 'ID', format: { bold: true, bgColor: '#0284c7', textColor: '#ffffff', align: 'center' } },
    [cellKey(1, 3)]: { value: 'Fase / Tarea Principal', format: { bold: true, bgColor: '#0284c7', textColor: '#ffffff' } },
    [cellKey(2, 3)]: { value: 'Responsable', format: { bold: true, bgColor: '#0284c7', textColor: '#ffffff' } },
    [cellKey(3, 3)]: { value: 'Fecha Inicio', format: { bold: true, bgColor: '#0284c7', textColor: '#ffffff', align: 'center' } },
    [cellKey(4, 3)]: { value: 'Fecha Límite', format: { bold: true, bgColor: '#0284c7', textColor: '#ffffff', align: 'center' } },
    [cellKey(5, 3)]: { value: 'Días Estimados', format: { bold: true, bgColor: '#0284c7', textColor: '#ffffff', align: 'right' } },
    [cellKey(6, 3)]: { value: 'Estado', format: { bold: true, bgColor: '#0284c7', textColor: '#ffffff', align: 'center' } },
    [cellKey(7, 3)]: { value: '% Progreso', format: { bold: true, bgColor: '#0284c7', textColor: '#ffffff', align: 'right' } },

    [cellKey(0, 4)]: { value: 'T-01', format: { align: 'center' } },
    [cellKey(1, 4)]: { value: 'Levantamiento de Requerimientos y Scope', format: {} },
    [cellKey(2, 4)]: { value: 'Ana Morales', format: {} },
    [cellKey(3, 4)]: { value: '01/09/2026', format: { align: 'center' } },
    [cellKey(4, 4)]: { value: '15/09/2026', format: { align: 'center' } },
    [cellKey(5, 4)]: { value: 14, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(6, 4)]: { value: 'COMPLETADO', format: { bold: true, align: 'center', textColor: '#16a34a', bgColor: '#dcfce7' } },
    [cellKey(7, 4)]: { value: 1.0, format: { numFormat: 'percentage' } },

    [cellKey(0, 5)]: { value: 'T-02', format: { align: 'center' } },
    [cellKey(1, 5)]: { value: 'Diseño de Arquitectura y Base de Datos', format: {} },
    [cellKey(2, 5)]: { value: 'Marcos Rivas', format: {} },
    [cellKey(3, 5)]: { value: '16/09/2026', format: { align: 'center' } },
    [cellKey(4, 5)]: { value: '30/09/2026', format: { align: 'center' } },
    [cellKey(5, 5)]: { value: 14, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(6, 5)]: { value: 'EN PROGRESO', format: { bold: true, align: 'center', textColor: '#0284c7', bgColor: '#e0f2fe' } },
    [cellKey(7, 5)]: { value: 0.65, format: { numFormat: 'percentage' } },

    [cellKey(0, 6)]: { value: 'T-03', format: { align: 'center' } },
    [cellKey(1, 6)]: { value: 'Desarrollo de Módulos Core & APIs', format: {} },
    [cellKey(2, 6)]: { value: 'Equipo Dev', format: {} },
    [cellKey(3, 6)]: { value: '01/10/2026', format: { align: 'center' } },
    [cellKey(4, 6)]: { value: '31/10/2026', format: { align: 'center' } },
    [cellKey(5, 6)]: { value: 30, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(6, 6)]: { value: 'PENDIENTE', format: { bold: true, align: 'center', textColor: '#ca8a04', bgColor: '#fef9c3' } },
    [cellKey(7, 6)]: { value: 0.0, format: { numFormat: 'percentage' } },

    [cellKey(0, 7)]: { value: 'T-04', format: { align: 'center' } },
    [cellKey(1, 7)]: { value: 'Pruebas de Calidad QA & UAT', format: {} },
    [cellKey(2, 7)]: { value: 'Lucía Santos', format: {} },
    [cellKey(3, 3)]: { value: '01/11/2026', format: { align: 'center' } },
    [cellKey(4, 7)]: { value: '15/11/2026', format: { align: 'center' } },
    [cellKey(5, 7)]: { value: 14, format: { numFormat: 'number', decimals: 0 } },
    [cellKey(6, 7)]: { value: 'PENDIENTE', format: { bold: true, align: 'center', textColor: '#ca8a04', bgColor: '#fef9c3' } },
    [cellKey(7, 7)]: { value: 0.0, format: { numFormat: 'percentage' } },

    [cellKey(1, 9)]: { value: 'PROGRESO GLOBAL DEL PROYECTO:', format: { bold: true } },
    [cellKey(7, 9)]: { formula: '=AVERAGE(H5:H8)', format: { bold: true, numFormat: 'percentage', bgColor: '#e0f2fe', textColor: '#0284c7' } },
  };

  const sheet: Sheet = {
    id: 'sheet-proj',
    name: 'Plan de Proyecto',
    data,
    rowHeights: { 0: 26, 3: 26, 9: 26 },
    colWidths: { 0: 70, 1: 260, 2: 130, 3: 110, 4: 110, 5: 110, 6: 130, 7: 120 },
    mergedCells: [],
    charts: [],
    selectedCell: { row: 4, col: 1 },
    selectionRange: { startRow: 4, startCol: 1, endRow: 4, endCol: 1 },
    frozenRows: 4,
    frozenCols: 1,
    tabColor: '#0284c7',
    zoom: 1,
    showGridlines: true,
    showHeaders: true,
  };

  const wb: Workbook = {
    id: `wb-proj-${Date.now()}`,
    name: 'Cronograma y Plan de Proyecto',
    sheets: [sheet],
    activeSheetId: 'sheet-proj',
    vbaModules: [],
    extensions: [],
    versions: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Gestión de Proyectos',
      version: 1,
      isEncrypted: false,
    },
  };

  wb.sheets[0] = formulaEngine.evaluateSheet(wb.sheets[0], wb);
  return wb;
}

// All available templates list for the Gallery
export const SPREADSHEET_TEMPLATES: SpreadsheetTemplate[] = [
  {
    id: 'blank',
    name: 'Libro en Blanco',
    category: 'General',
    description: 'Cuadrícula limpia sin datos iniciales. Ideal para crear hojas y cálculos personalizados desde cero.',
    iconName: 'FileSpreadsheet',
    badge: 'Básico',
    createWorkbook: createBlankWorkbook,
  },
  {
    id: 'financial_budget',
    name: 'Presupuesto y Balance Financiero 2026',
    category: 'Finanzas',
    description: 'Resumen trimestral de ingresos, costos operativos, utilidades netas e indicadores con gráfico comparativo.',
    iconName: 'TrendingUp',
    badge: 'Popular',
    createWorkbook: createFinancialBudgetTemplate,
  },
  {
    id: 'inventory_tracker',
    name: 'Control de Inventario y Stock con Alertas',
    category: 'Gestión & Proyectos',
    description: 'Seguimiento de códigos SKU, cálculo de existencias, precios de compra y avisos automáticos de reposición.',
    iconName: 'Boxes',
    badge: 'Empresarial',
    createWorkbook: createInventoryTemplate,
  },
  {
    id: 'invoice_billing',
    name: 'Factura Comercial y Cotización',
    category: 'Ventas & Facturación',
    description: 'Emisión de facturas con desglose de ítems, cálculo automático de subtotal, IVA (21%) y total a pagar.',
    iconName: 'Receipt',
    badge: 'Oficial',
    createWorkbook: createInvoiceTemplate,
  },
  {
    id: 'loan_amortization',
    name: 'Tabla de Amortización de Préstamo',
    category: 'Finanzas',
    description: 'Modelo de cuota fija sistema francés con desglose de capital amortizado, intereses y saldo deudor.',
    iconName: 'Calculator',
    badge: 'Financiero',
    createWorkbook: createLoanAmortizationTemplate,
  },
  {
    id: 'project_timeline',
    name: 'Cronograma y Planificador de Proyectos',
    category: 'Gestión & Proyectos',
    description: 'Hitos de proyecto, asignación de responsables, fechas de entrega, estados y porcentaje de avance.',
    iconName: 'CalendarCheck',
    badge: 'Productividad',
    createWorkbook: createProjectTimelineTemplate,
  },
];
