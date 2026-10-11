import { Sheet, Workbook } from '../types/spreadsheet';
import { addressToCoords, cellKey, expandRange } from './cellUtils';
import { formulaEngine } from './formulaEngine';

export interface VbaExecutionResult {
  success: boolean;
  logs: string[];
  messages: string[];
  updatedWorkbook?: Workbook;
  error?: string;
}

export class VbaEngine {
  private isRecording = false;
  private recordedActions: string[] = [];

  // Macro Recording
  public startRecording(macroName = 'MacroGrabada') {
    this.isRecording = true;
    this.recordedActions = [
      `' Macro grabada el ${new Date().toLocaleString('es-ES')}`,
      `Sub ${macroName}()`,
      `    Dim ws As Worksheet`,
      `    Set ws = ActiveSheet`,
    ];
  }

  public recordCellEdit(cellAddr: string, value: any, formula?: string) {
    if (!this.isRecording) return;
    if (formula) {
      this.recordedActions.push(`    Range("${cellAddr}").Formula = "${formula}"`);
    } else if (typeof value === 'string') {
      this.recordedActions.push(`    Range("${cellAddr}").Value = "${value}"`);
    } else {
      this.recordedActions.push(`    Range("${cellAddr}").Value = ${value}`);
    }
  }

  public recordFormat(cellAddr: string, property: string, val: any) {
    if (!this.isRecording) return;
    if (property === 'bold') {
      this.recordedActions.push(`    Range("${cellAddr}").Font.Bold = ${val ? 'True' : 'False'}`);
    } else if (property === 'bgColor') {
      this.recordedActions.push(`    Range("${cellAddr}").Interior.Color = "${val}"`);
    } else if (property === 'textColor') {
      this.recordedActions.push(`    Range("${cellAddr}").Font.Color = "${val}"`);
    }
  }

  public recordAction(action: { type: string; target: string; params: any }) {
    if (!this.isRecording) return;
    if (action.type === 'SET_VALUE') {
      this.recordCellEdit(action.target, action.params.value, action.params.value?.toString().startsWith('=') ? action.params.value : undefined);
    } else if (action.type === 'SET_FORMAT') {
      Object.keys(action.params).forEach((prop) => {
        this.recordFormat(action.target, prop, action.params[prop]);
      });
    }
  }

  public stopRecording(): string {
    if (!this.isRecording) return '';
    this.isRecording = false;
    this.recordedActions.push(`    MsgBox "Macro grabada ejecutada exitosamente.", vbInformation`);
    this.recordedActions.push(`End Sub`);
    return this.recordedActions.join('\n');
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Executes VBA script code against workbook state
   */
  public executeVba(code: string, workbook: Workbook): VbaExecutionResult {
    const logs: string[] = [];
    const messages: string[] = [];

    try {
      // Clone workbook deeply
      const wb: Workbook = JSON.parse(JSON.stringify(workbook));
      let currentSheet = wb.sheets.find((s) => s.id === wb.activeSheetId) || wb.sheets[0];

      // Strip comments and split lines
      const rawLines = code.split('\n');
      const lines: string[] = [];

      for (const line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("'") || trimmed.startsWith('Rem ')) continue;
        lines.push(trimmed);
      }

      const variables: Record<string, any> = {};

      let i = 0;
      while (i < lines.length) {
        const line = lines[i];

        // Skip Sub / End Sub / Dim
        if (line.toLowerCase().startsWith('sub ') || line.toLowerCase() === 'end sub') {
          logs.push(`[VBA] ${line}`);
          i++;
          continue;
        }

        if (line.toLowerCase().startsWith('dim ') || line.toLowerCase().startsWith('set ')) {
          i++;
          continue;
        }

        // MsgBox "message"
        const msgBoxMatch = line.match(/^msgbox\s+["']?(.*?)["']?(\s*,\s*vb\w+)?$/i);
        if (msgBoxMatch) {
          const msg = msgBoxMatch[1].replace(/["']/g, '');
          messages.push(msg);
          logs.push(`[MsgBox] ${msg}`);
          i++;
          continue;
        }

        // For Loop: For var = start To end
        const forMatch = line.match(/^for\s+([a-zA-Z0-9_]+)\s*=\s*(.+?)\s+to\s+(.+)$/i);
        if (forMatch) {
          const varName = forMatch[1];
          const startVal = Number(this.evalVbaExpr(forMatch[2], variables)) || 1;
          const endVal = Number(this.evalVbaExpr(forMatch[3], variables)) || 10;

          // Find matching Next
          let nextIdx = -1;
          let depth = 0;
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].toLowerCase().startsWith('for ')) depth++;
            else if (lines[j].toLowerCase().startsWith('next')) {
              if (depth === 0) {
                nextIdx = j;
                break;
              }
              depth--;
            }
          }

          if (nextIdx !== -1) {
            const loopBody = lines.slice(i + 1, nextIdx);
            for (let v = startVal; v <= endVal; v++) {
              variables[varName] = v;
              this.executeVbaLines(loopBody, currentSheet, wb, variables, logs, messages);
            }
            i = nextIdx + 1;
            continue;
          }
        }

        // Handle single statement
        this.executeSingleStatement(line, currentSheet, wb, variables, logs, messages);
        i++;
      }

      // Re-evaluate sheet formulas
      const activeIdx = wb.sheets.findIndex((s) => s.id === wb.activeSheetId);
      if (activeIdx !== -1) {
        wb.sheets[activeIdx] = formulaEngine.evaluateSheet(wb.sheets[activeIdx], wb);
      }

      return {
        success: true,
        logs,
        messages,
        updatedWorkbook: wb,
      };
    } catch (err: any) {
      return {
        success: false,
        logs,
        messages,
        error: err.message || 'Error en la ejecución del script VBA',
      };
    }
  }

  private executeVbaLines(
    lines: string[],
    sheet: Sheet,
    wb: Workbook,
    variables: Record<string, any>,
    logs: string[],
    messages: string[]
  ) {
    for (const line of lines) {
      this.executeSingleStatement(line, sheet, wb, variables, logs, messages);
    }
  }

  private executeSingleStatement(
    statement: string,
    sheet: Sheet,
    wb: Workbook,
    variables: Record<string, any>,
    logs: string[],
    messages: string[]
  ) {
    const s = statement.trim();

    // Variable assignment: x = 5 or x = x + 1
    const assignMatch = s.match(/^([a-zA-Z0-9_]+)\s*=\s*(.+)$/);
    if (assignMatch && !s.toLowerCase().startsWith('range(') && !s.toLowerCase().startsWith('cells(')) {
      const varName = assignMatch[1];
      const val = this.evalVbaExpr(assignMatch[2], variables);
      variables[varName] = val;
      return;
    }

    // Range("A1").Value = ...
    const rangeValMatch = s.match(/^Range\s*\(\s*["']([^"']+)["']\s*\)\.Value\s*=\s*(.+)$/i);
    if (rangeValMatch) {
      const rangeStr = rangeValMatch[1];
      const expr = rangeValMatch[2];
      const resolvedVal = this.evalVbaExpr(expr, variables);
      const coordsList = expandRange(rangeStr);

      for (const coord of coordsList) {
        const key = cellKey(coord.col, coord.row);
        sheet.data[key] = {
          ...(sheet.data[key] || { value: '' }),
          value: resolvedVal,
          displayValue: String(resolvedVal),
          formula: undefined,
        };
      }
      logs.push(`[VBA] Set Range("${rangeStr}").Value = ${resolvedVal}`);
      return;
    }

    // Range("A1").Formula = "=SUM(...)"
    const rangeFormulaMatch = s.match(/^Range\s*\(\s*["']([^"']+)["']\s*\)\.Formula\s*=\s*(.+)$/i);
    if (rangeFormulaMatch) {
      const rangeStr = rangeFormulaMatch[1];
      let formula = rangeFormulaMatch[2].replace(/^["']|["']$/g, '');
      if (!formula.startsWith('=')) formula = '=' + formula;
      const coordsList = expandRange(rangeStr);

      for (const coord of coordsList) {
        const key = cellKey(coord.col, coord.row);
        sheet.data[key] = {
          ...(sheet.data[key] || { value: '' }),
          formula,
        };
      }
      logs.push(`[VBA] Set Range("${rangeStr}").Formula = ${formula}`);
      return;
    }

    // Range("A1").Font.Bold = True/False
    const rangeBoldMatch = s.match(/^Range\s*\(\s*["']([^"']+)["']\s*\)\.Font\.Bold\s*=\s*(.+)$/i);
    if (rangeBoldMatch) {
      const rangeStr = rangeBoldMatch[1];
      const isBold = rangeBoldMatch[2].toLowerCase() === 'true';
      const coordsList = expandRange(rangeStr);

      for (const coord of coordsList) {
        const key = cellKey(coord.col, coord.row);
        const prevFormat = sheet.data[key]?.format || {};
        sheet.data[key] = {
          ...(sheet.data[key] || { value: '' }),
          format: { ...prevFormat, bold: isBold },
        };
      }
      logs.push(`[VBA] Set Range("${rangeStr}").Font.Bold = ${isBold}`);
      return;
    }

    // Range("A1").Interior.Color = RGB(16, 124, 65) or "#107c41"
    const rangeBgMatch = s.match(/^Range\s*\(\s*["']([^"']+)["']\s*\)\.Interior\.Color\s*=\s*(.+)$/i);
    if (rangeBgMatch) {
      const rangeStr = rangeBgMatch[1];
      const color = this.parseVbaColor(rangeBgMatch[2]);
      const coordsList = expandRange(rangeStr);

      for (const coord of coordsList) {
        const key = cellKey(coord.col, coord.row);
        const prevFormat = sheet.data[key]?.format || {};
        sheet.data[key] = {
          ...(sheet.data[key] || { value: '' }),
          format: { ...prevFormat, bgColor: color },
        };
      }
      logs.push(`[VBA] Set Range("${rangeStr}").Interior.Color = ${color}`);
      return;
    }

    // Range("A1").Font.Color = RGB(...)
    const rangeColorMatch = s.match(/^Range\s*\(\s*["']([^"']+)["']\s*\)\.Font\.Color\s*=\s*(.+)$/i);
    if (rangeColorMatch) {
      const rangeStr = rangeColorMatch[1];
      const color = this.parseVbaColor(rangeColorMatch[2]);
      const coordsList = expandRange(rangeStr);

      for (const coord of coordsList) {
        const key = cellKey(coord.col, coord.row);
        const prevFormat = sheet.data[key]?.format || {};
        sheet.data[key] = {
          ...(sheet.data[key] || { value: '' }),
          format: { ...prevFormat, textColor: color },
        };
      }
      logs.push(`[VBA] Set Range("${rangeStr}").Font.Color = ${color}`);
      return;
    }

    // Cells(row, col).Value = ...
    const cellsMatch = s.match(/^Cells\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\.Value\s*=\s*(.+)$/i);
    if (cellsMatch) {
      const r = Number(this.evalVbaExpr(cellsMatch[1], variables)) - 1;
      const c = Number(this.evalVbaExpr(cellsMatch[2], variables)) - 1;
      const val = this.evalVbaExpr(cellsMatch[3], variables);
      if (r >= 0 && c >= 0) {
        const key = cellKey(c, r);
        sheet.data[key] = {
          ...(sheet.data[key] || { value: '' }),
          value: val,
          displayValue: String(val),
        };
        logs.push(`[VBA] Set Cells(${r + 1}, ${c + 1}).Value = ${val}`);
      }
      return;
    }

    // Range("A1:C10").Clear or ClearContents
    const clearMatch = s.match(/^Range\s*\(\s*["']([^"']+)["']\s*\)\.(Clear|ClearContents)$/i);
    if (clearMatch) {
      const rangeStr = clearMatch[1];
      const coordsList = expandRange(rangeStr);
      for (const coord of coordsList) {
        const key = cellKey(coord.col, coord.row);
        delete sheet.data[key];
      }
      logs.push(`[VBA] Cleared Range("${rangeStr}")`);
      return;
    }

    // ActiveSheet.Name = "..."
    const sheetNameMatch = s.match(/^ActiveSheet\.Name\s*=\s*["']?([^"']+)["']?$/i);
    if (sheetNameMatch) {
      sheet.name = sheetNameMatch[1];
      logs.push(`[VBA] Renamed sheet to "${sheet.name}"`);
      return;
    }
  }

  private evalVbaExpr(expr: string, variables: Record<string, any>): any {
    let clean = expr.trim();
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
      return clean.slice(1, -1);
    }
    if (!isNaN(Number(clean))) {
      return Number(clean);
    }
    if (clean.toLowerCase() === 'true') return true;
    if (clean.toLowerCase() === 'false') return false;

    // Check variable replacement
    for (const [k, v] of Object.entries(variables)) {
      const regex = new RegExp(`\\b${k}\\b`, 'g');
      clean = clean.replace(regex, JSON.stringify(v));
    }

    try {
      // Safe math evaluation
      if (/^[0-9+\-*/().\s]+$/.test(clean)) {
        return Function(`"use strict"; return (${clean});`)();
      }
    } catch {}

    return clean;
  }

  private parseVbaColor(expr: string): string {
    const clean = expr.trim();
    if (clean.startsWith('"') || clean.startsWith("'")) {
      return clean.slice(1, -1);
    }
    const rgbMatch = clean.match(/RGB\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbMatch) {
      return `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
    }
    if (clean.toLowerCase() === 'vbred') return '#ff0000';
    if (clean.toLowerCase() === 'vbgreen') return '#00aa00';
    if (clean.toLowerCase() === 'vbblue') return '#0000ff';
    if (clean.toLowerCase() === 'vbyellow') return '#ffff00';
    if (clean.toLowerCase() === 'vbwhite') return '#ffffff';
    if (clean.toLowerCase() === 'vbblack') return '#000000';
    return clean;
  }
}

export const vbaEngine = new VbaEngine();
