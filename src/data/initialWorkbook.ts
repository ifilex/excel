import { Sheet, Workbook } from '../types/spreadsheet';
import { createBlankWorkbook } from './templates';

export function createInitialWorkbook(): Workbook {
  // Returns a completely clean blank workbook when starting the app
  return createBlankWorkbook();
}

