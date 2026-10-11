export type NumberFormatType = 
  | 'general' 
  | 'number' 
  | 'currency' 
  | 'percentage' 
  | 'date' 
  | 'time' 
  | 'scientific' 
  | 'text';

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  textColor?: string;
  bgColor?: string;
  fontSize?: number; // default 11
  fontFamily?: string; // 'Calibri', 'Arial', 'Segoe UI', 'Times New Roman', 'Consolas'
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  wrapText?: boolean;
  numFormat?: NumberFormatType;
  decimals?: number; // default 2
  currencySymbol?: string; // '$', '€', '£', '¥', 'ARS', 'MXN'
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
}

export interface CellComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  resolved?: boolean;
}

export interface CellData {
  value: string | number | boolean | null;
  displayValue?: string;
  formula?: string; // e.g. "=SUM(A1:A10)"
  format?: CellFormat;
  comment?: CellComment;
  isLocked?: boolean;
  hyperlink?: string;
  validationRule?: {
    type: 'list' | 'number' | 'date' | 'textLength';
    criteria: string;
    allowedValues?: string[];
  };
}

export interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'column' | 'bar' | 'line' | 'pie' | 'area';
  dataRange: string; // e.g. "A1:C10"
  labelColumn: number;
  valueColumns: number[];
  position: { x: number; y: number; width: number; height: number };
}

export interface Sheet {
  id: string;
  name: string;
  data: Record<string, CellData>; // key: "colIndex,rowIndex" or "A1"
  rowHeights: Record<number, number>;
  colWidths: Record<number, number>;
  mergedCells: string[]; // e.g. ["A1:B2"]
  charts: ChartConfig[];
  selectedCell: { row: number; col: number };
  selectionRange: SelectionRange;
  frozenRows: number;
  frozenCols: number;
  tabColor?: string;
  zoom: number; // 0.5 to 2.0
  showGridlines: boolean;
  showHeaders: boolean;
}

export interface VbaModule {
  id: string;
  name: string;
  code: string;
  isMacroEnabled: boolean;
  lastExecuted?: string;
}

export interface ExtensionScript {
  id: string;
  name: string;
  description: string;
  type: 'word_bridge' | 'data_cleaner' | 'pivot_table' | 'financial_calc' | 'ai_copilot' | 'custom_js';
  enabled: boolean;
}

export interface WorkbookVersion {
  id: string;
  timestamp: string;
  description: string;
  dataSnapshot: string; // serialized JSON
}

export interface WorkbookMetadata {
  createdAt: string;
  updatedAt: string;
  author: string;
  version: number;
  isEncrypted: boolean;
  encryptionHint?: string;
  salt?: string;
  iv?: string;
}

export interface Workbook {
  id: string;
  name: string;
  sheets: Sheet[];
  activeSheetId: string;
  vbaModules: VbaModule[];
  extensions: ExtensionScript[];
  versions: WorkbookVersion[];
  metadata: WorkbookMetadata;
  googleDriveFileId?: string;
  lastDriveSync?: string;
}

export interface CollabUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  activeSheetId: string;
  selectedCell: { row: number; col: number };
  selectionRange?: SelectionRange;
  status: 'active' | 'idle';
  lastPing: number;
}

export interface OfficeAddon {
  id: string;
  name: string;
  iconName: string;
  category: 'Automatización' | 'Productividad' | 'Análisis' | 'Integración Office';
  description: string;
  author: string;
  version: string;
  installed: boolean;
  actionType: string;
}

export type Cell = CellData;
export type CollaborationUser = CollabUser;
export type RibbonTab = 'home' | 'insert' | 'formulas' | 'data' | 'review' | 'view' | 'automate' | 'addons' | 'collab';
