import { CellData, Sheet, Workbook } from '../types/spreadsheet';
import { addressToCoords, cellKey, expandRange } from './cellUtils';

/**
 * Robust Excel Formula Engine
 */
export class FormulaEngine {
  private visitedCells: Set<string> = new Set();

  /**
   * Evaluates all formulas in a workbook sheet and updates display values
   */
  public evaluateSheet(sheet: Sheet, workbook: Workbook): Sheet {
    const newSheet = { ...sheet, data: { ...sheet.data } };
    this.visitedCells.clear();

    // Pass 1: compute display values for all cells
    for (const key of Object.keys(newSheet.data)) {
      const cell = newSheet.data[key];
      if (cell && cell.formula && cell.formula.startsWith('=')) {
        try {
          this.visitedCells.clear();
          const result = this.evaluateFormula(cell.formula, newSheet, workbook, key);
          newSheet.data[key] = {
            ...cell,
            value: result,
            displayValue: String(result),
          };
        } catch (err: any) {
          newSheet.data[key] = {
            ...cell,
            value: '#ERROR!',
            displayValue: '#ERROR!',
          };
        }
      } else if (cell) {
        newSheet.data[key] = {
          ...cell,
          displayValue: cell.value !== null && cell.value !== undefined ? String(cell.value) : '',
        };
      }
    }

    return newSheet;
  }

  /**
   * Evaluates a single formula string e.g. "=SUM(A1:A5) * 1.21"
   */
  public evaluateFormula(
    formula: string,
    currentSheet: Sheet,
    workbook: Workbook,
    currentCellKey?: string
  ): any {
    if (!formula.startsWith('=')) return formula;
    if (currentCellKey) {
      if (this.visitedCells.has(currentCellKey)) {
        return '#CIRCULAR!';
      }
      this.visitedCells.add(currentCellKey);
    }

    const expression = formula.substring(1).trim();
    return this.parseExpression(expression, currentSheet, workbook);
  }

  private parseExpression(expr: string, currentSheet: Sheet, workbook: Workbook): any {
    if (!expr) return '';

    // Handle comparison operators: =, <>, <=, >=, <, >
    const compMatch = this.findTopLevelComparison(expr);
    if (compMatch) {
      const left = this.parseExpression(compMatch.left, currentSheet, workbook);
      const right = this.parseExpression(compMatch.right, currentSheet, workbook);
      switch (compMatch.op) {
        case '=':
          return left == right;
        case '<>':
        case '!=':
          return left != right;
        case '<=':
          return Number(left) <= Number(right);
        case '>=':
          return Number(left) >= Number(right);
        case '<':
          return Number(left) < Number(right);
        case '>':
          return Number(left) > Number(right);
      }
    }

    // Handle string concat &
    const concatParts = this.splitTopLevel(expr, '&');
    if (concatParts.length > 1) {
      return concatParts
        .map((p) => this.parseExpression(p, currentSheet, workbook))
        .join('');
    }

    // Handle addition and subtraction (lowest precedence arithmetic)
    const addSubParts = this.splitTopLevelAddSub(expr);
    if (addSubParts.length > 1) {
      let total = 0;
      for (const part of addSubParts) {
        const val = Number(this.parseExpression(part.text, currentSheet, workbook)) || 0;
        if (part.op === '+') total += val;
        else total -= val;
      }
      return total;
    }

    // Handle multiplication and division
    const mulDivParts = this.splitTopLevelMulDiv(expr);
    if (mulDivParts.length > 1) {
      let result = Number(this.parseExpression(mulDivParts[0].text, currentSheet, workbook)) || 0;
      for (let i = 1; i < mulDivParts.length; i++) {
        const part = mulDivParts[i];
        const val = Number(this.parseExpression(part.text, currentSheet, workbook)) || 0;
        if (part.op === '*') {
          result *= val;
        } else {
          if (val === 0) return '#DIV/0!';
          result /= val;
        }
      }
      return result;
    }

    // Handle exponentiation ^
    const powParts = this.splitTopLevel(expr, '^');
    if (powParts.length > 1) {
      let result = Number(this.parseExpression(powParts[0], currentSheet, workbook));
      for (let i = 1; i < powParts.length; i++) {
        result = Math.pow(result, Number(this.parseExpression(powParts[i], currentSheet, workbook)));
      }
      return result;
    }

    // Handle percentage % (e.g. 50%)
    if (expr.endsWith('%')) {
      const inner = expr.slice(0, -1);
      return (Number(this.parseExpression(inner, currentSheet, workbook)) || 0) / 100;
    }

    // Handle parentheses wrapping: ( ... )
    if (expr.startsWith('(') && expr.endsWith(')')) {
      // Check if matching outer
      if (this.isMatchingOuterParen(expr)) {
        return this.parseExpression(expr.substring(1, expr.length - 1), currentSheet, workbook);
      }
    }

    // Check for Function Call: NAME(arg1, arg2, ...)
    const funcMatch = expr.match(/^([A-Z0-9_\.]+)\s*\((.*)\)$/i);
    if (funcMatch && this.isMatchingOuterParen(`(${funcMatch[2]})`)) {
      const funcName = funcMatch[1].toUpperCase();
      const argsRaw = this.splitFunctionArgs(funcMatch[2]);
      return this.evaluateFunction(funcName, argsRaw, currentSheet, workbook);
    }

    // String literal "hello"
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.substring(1, expr.length - 1);
    }

    // Numeric literal
    if (!isNaN(Number(expr)) && expr.trim() !== '') {
      return Number(expr);
    }

    // Boolean literals
    if (expr.toUpperCase() === 'TRUE' || expr.toUpperCase() === 'VERDADERO') return true;
    if (expr.toUpperCase() === 'FALSE' || expr.toUpperCase() === 'FALSO') return false;

    // Cross-sheet reference Sheet1!A1
    if (expr.includes('!')) {
      const [sheetName, cellAddr] = expr.split('!');
      const targetSheet = workbook.sheets.find(
        (s) => s.name.toUpperCase() === sheetName.replace(/'/g, '').toUpperCase()
      );
      if (targetSheet) {
        return this.getCellValue(cellAddr, targetSheet);
      }
      return '#REF!';
    }

    // Cell Reference: A1, B5, $C$10
    const coords = addressToCoords(expr);
    if (coords) {
      return this.getCellValue(expr, currentSheet);
    }

    return expr;
  }

  private getCellValue(address: string, sheet: Sheet): any {
    const coords = addressToCoords(address);
    if (!coords) return 0;
    const key = cellKey(coords.col, coords.row);
    const cell = sheet.data[key];
    if (!cell || cell.value === null || cell.value === undefined || cell.value === '') {
      return 0;
    }
    return cell.value;
  }

  private getRangeValues(rangeStr: string, currentSheet: Sheet, workbook: Workbook): any[] {
    let sheet = currentSheet;
    let cleanRange = rangeStr;

    if (rangeStr.includes('!')) {
      const [sheetName, range] = rangeStr.split('!');
      const target = workbook.sheets.find(
        (s) => s.name.toUpperCase() === sheetName.replace(/'/g, '').toUpperCase()
      );
      if (target) sheet = target;
      cleanRange = range;
    }

    const coordsList = expandRange(cleanRange);
    return coordsList.map((c) => {
      const key = cellKey(c.col, c.row);
      const cell = sheet.data[key];
      return cell?.value ?? null;
    });
  }

  /**
   * Excel built-in function library
   */
  private evaluateFunction(
    name: string,
    argsRaw: string[],
    currentSheet: Sheet,
    workbook: Workbook
  ): any {
    const evalArg = (raw: string) => this.parseExpression(raw, currentSheet, workbook);

    // Extract values that can be single items or range arrays
    const getFlattenedValues = (args: string[]): any[] => {
      const list: any[] = [];
      for (const arg of args) {
        const trimmed = arg.trim();
        if (trimmed.includes(':')) {
          list.push(...this.getRangeValues(trimmed, currentSheet, workbook));
        } else {
          const val = evalArg(trimmed);
          list.push(val);
        }
      }
      return list;
    };

    const getNumericValues = (args: string[]): number[] => {
      return getFlattenedValues(args)
        .map((v) => (typeof v === 'number' ? v : parseFloat(String(v))))
        .filter((v) => !isNaN(v));
    };

    switch (name) {
      // --- Math & Statistics ---
      case 'SUM':
      case 'SUMA': {
        const nums = getNumericValues(argsRaw);
        return nums.reduce((acc, curr) => acc + curr, 0);
      }

      case 'AVERAGE':
      case 'PROMEDIO': {
        const nums = getNumericValues(argsRaw);
        return nums.length ? nums.reduce((acc, curr) => acc + curr, 0) / nums.length : 0;
      }

      case 'COUNT':
      case 'CONTAR': {
        return getNumericValues(argsRaw).length;
      }

      case 'COUNTA':
      case 'CONTARA': {
        return getFlattenedValues(argsRaw).filter((v) => v !== null && v !== undefined && v !== '').length;
      }

      case 'MAX':
      case 'MAXIMO': {
        const nums = getNumericValues(argsRaw);
        return nums.length ? Math.max(...nums) : 0;
      }

      case 'MIN':
      case 'MINIMO': {
        const nums = getNumericValues(argsRaw);
        return nums.length ? Math.min(...nums) : 0;
      }

      case 'PRODUCT':
      case 'PRODUCTO': {
        const nums = getNumericValues(argsRaw);
        return nums.reduce((acc, curr) => acc * curr, 1);
      }

      case 'MEDIAN':
      case 'MEDIANA': {
        const nums = getNumericValues(argsRaw).sort((a, b) => a - b);
        if (!nums.length) return 0;
        const mid = Math.floor(nums.length / 2);
        return nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
      }

      case 'STDEV':
      case 'DESVEST': {
        const nums = getNumericValues(argsRaw);
        if (nums.length < 2) return 0;
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const variance = nums.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / (nums.length - 1);
        return Math.sqrt(variance);
      }

      case 'ROUND':
      case 'REDONDEAR': {
        const num = Number(evalArg(argsRaw[0])) || 0;
        const dec = Number(evalArg(argsRaw[1])) || 0;
        const factor = Math.pow(10, dec);
        return Math.round(num * factor) / factor;
      }

      case 'ROUNDUP':
      case 'REDONDEAR.MAS': {
        const num = Number(evalArg(argsRaw[0])) || 0;
        const dec = Number(evalArg(argsRaw[1])) || 0;
        const factor = Math.pow(10, dec);
        return Math.ceil(num * factor) / factor;
      }

      case 'ROUNDDOWN':
      case 'REDONDEAR.MENOS': {
        const num = Number(evalArg(argsRaw[0])) || 0;
        const dec = Number(evalArg(argsRaw[1])) || 0;
        const factor = Math.pow(10, dec);
        return Math.floor(num * factor) / factor;
      }

      case 'ABS':
        return Math.abs(Number(evalArg(argsRaw[0])) || 0);

      case 'SQRT':
      case 'RAIZ':
        return Math.sqrt(Number(evalArg(argsRaw[0])) || 0);

      case 'POWER':
      case 'POTENCIA':
        return Math.pow(Number(evalArg(argsRaw[0])) || 0, Number(evalArg(argsRaw[1])) || 1);

      case 'MOD':
      case 'RESIDUO':
        return (Number(evalArg(argsRaw[0])) || 0) % (Number(evalArg(argsRaw[1])) || 1);

      case 'INT':
      case 'ENTERO':
        return Math.floor(Number(evalArg(argsRaw[0])) || 0);

      case 'SUMIF':
      case 'SUMAR.SI': {
        const range = argsRaw[0].trim();
        const criteria = String(evalArg(argsRaw[1])).replace(/^["']|["']$/g, '');
        const sumRange = argsRaw[2] ? argsRaw[2].trim() : range;

        const checkValues = this.getRangeValues(range, currentSheet, workbook);
        const sumValues = this.getRangeValues(sumRange, currentSheet, workbook);

        let total = 0;
        for (let i = 0; i < checkValues.length; i++) {
          const val = checkValues[i];
          if (this.evaluateCriteria(val, criteria)) {
            total += Number(sumValues[i]) || 0;
          }
        }
        return total;
      }

      case 'COUNTIF':
      case 'CONTAR.SI': {
        const range = argsRaw[0].trim();
        const criteria = String(evalArg(argsRaw[1])).replace(/^["']|["']$/g, '');
        const checkValues = this.getRangeValues(range, currentSheet, workbook);
        let count = 0;
        for (const val of checkValues) {
          if (this.evaluateCriteria(val, criteria)) count++;
        }
        return count;
      }

      // --- Logical ---
      case 'IF':
      case 'SI': {
        const condition = evalArg(argsRaw[0]);
        if (condition && condition !== '0' && condition !== 'FALSE') {
          return evalArg(argsRaw[1]);
        }
        return argsRaw[2] ? evalArg(argsRaw[2]) : '';
      }

      case 'IFS':
      case 'SI.CONJUNTO': {
        for (let i = 0; i < argsRaw.length; i += 2) {
          const cond = evalArg(argsRaw[i]);
          if (cond && cond !== '0' && cond !== 'FALSE') {
            return evalArg(argsRaw[i + 1]);
          }
        }
        return '#N/A';
      }

      case 'IFERROR':
      case 'SI.ERROR': {
        try {
          const res = evalArg(argsRaw[0]);
          if (String(res).startsWith('#')) {
            return evalArg(argsRaw[1]);
          }
          return res;
        } catch {
          return evalArg(argsRaw[1]);
        }
      }

      case 'AND':
      case 'Y': {
        for (const arg of argsRaw) {
          const val = evalArg(arg);
          if (!val || val === '0' || val === 'FALSE') return false;
        }
        return true;
      }

      case 'OR':
      case 'O': {
        for (const arg of argsRaw) {
          const val = evalArg(arg);
          if (val && val !== '0' && val !== 'FALSE') return true;
        }
        return false;
      }

      case 'NOT':
      case 'NO': {
        const val = evalArg(argsRaw[0]);
        return !val || val === '0' || val === 'FALSE';
      }

      // --- Text Functions ---
      case 'CONCAT':
      case 'CONCATENATE':
      case 'CONCATENAR': {
        return getFlattenedValues(argsRaw).join('');
      }

      case 'TRIM':
      case 'ESPACIOS':
        return String(evalArg(argsRaw[0]) || '').trim();

      case 'UPPER':
      case 'MAYUSC':
        return String(evalArg(argsRaw[0]) || '').toUpperCase();

      case 'LOWER':
      case 'MINUSC':
        return String(evalArg(argsRaw[0]) || '').toLowerCase();

      case 'PROPER':
      case 'NOMPROPIO':
        return String(evalArg(argsRaw[0]) || '').replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );

      case 'LEN':
      case 'LARGO':
        return String(evalArg(argsRaw[0]) || '').length;

      case 'LEFT':
      case 'IZQUIERDA': {
        const str = String(evalArg(argsRaw[0]) || '');
        const count = argsRaw[1] ? Number(evalArg(argsRaw[1])) : 1;
        return str.substring(0, count);
      }

      case 'RIGHT':
      case 'DERECHA': {
        const str = String(evalArg(argsRaw[0]) || '');
        const count = argsRaw[1] ? Number(evalArg(argsRaw[1])) : 1;
        return str.substring(Math.max(0, str.length - count));
      }

      case 'MID':
      case 'EXTRAE': {
        const str = String(evalArg(argsRaw[0]) || '');
        const start = Number(evalArg(argsRaw[1])) || 1;
        const length = Number(evalArg(argsRaw[2])) || 1;
        return str.substring(start - 1, start - 1 + length);
      }

      case 'SUBSTITUTE':
      case 'SUSTITUIR': {
        const text = String(evalArg(argsRaw[0]) || '');
        const oldText = String(evalArg(argsRaw[1]) || '');
        const newText = String(evalArg(argsRaw[2]) || '');
        return text.split(oldText).join(newText);
      }

      case 'FIND':
      case 'ENCONTRAR': {
        const findStr = String(evalArg(argsRaw[0]) || '');
        const withinStr = String(evalArg(argsRaw[1]) || '');
        const pos = withinStr.indexOf(findStr);
        return pos >= 0 ? pos + 1 : '#VALUE!';
      }

      // --- Lookup & Reference ---
      case 'VLOOKUP':
      case 'BUSCARV': {
        const lookupValue = evalArg(argsRaw[0]);
        const tableRange = argsRaw[1].trim();
        const colIndex = Number(evalArg(argsRaw[2])) || 1;
        const exactMatch = argsRaw[3] ? evalArg(argsRaw[3]) === false || evalArg(argsRaw[3]) === '0' || evalArg(argsRaw[3]) === 'FALSE' : true;

        const startEnd = tableRange.split(':');
        const start = addressToCoords(startEnd[0]);
        const end = addressToCoords(startEnd[1]);
        if (!start || !end) return '#REF!';

        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);

        for (let r = minRow; r <= maxRow; r++) {
          const firstKey = cellKey(minCol, r);
          const firstCell = currentSheet.data[firstKey];
          const val = firstCell?.value;

          const isMatch = exactMatch
            ? String(val).toLowerCase() === String(lookupValue).toLowerCase()
            : String(val).toLowerCase().startsWith(String(lookupValue).toLowerCase());

          if (isMatch) {
            const targetCol = minCol + colIndex - 1;
            if (targetCol > maxCol) return '#REF!';
            const targetKey = cellKey(targetCol, r);
            return currentSheet.data[targetKey]?.value ?? '';
          }
        }
        return '#N/A';
      }

      case 'XLOOKUP':
      case 'BUSCARX': {
        const lookupValue = evalArg(argsRaw[0]);
        const lookupRange = this.getRangeValues(argsRaw[1].trim(), currentSheet, workbook);
        const returnRange = this.getRangeValues(argsRaw[2].trim(), currentSheet, workbook);
        const notFound = argsRaw[3] ? evalArg(argsRaw[3]) : '#N/A';

        for (let i = 0; i < lookupRange.length; i++) {
          if (String(lookupRange[i]).toLowerCase() === String(lookupValue).toLowerCase()) {
            return returnRange[i] ?? '';
          }
        }
        return notFound;
      }

      // --- Financial & Time ---
      case 'PMT':
      case 'PAGO': {
        // PMT(rate, nper, pv, [fv], [type])
        const rate = Number(evalArg(argsRaw[0])) || 0;
        const nper = Number(evalArg(argsRaw[1])) || 0;
        const pv = Number(evalArg(argsRaw[2])) || 0;
        const fv = argsRaw[3] ? Number(evalArg(argsRaw[3])) : 0;
        if (rate === 0) return -(pv + fv) / nper;
        const pvif = Math.pow(1 + rate, nper);
        return -(rate * (pv * pvif + fv)) / (pvif - 1);
      }

      case 'TODAY':
      case 'HOY': {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      case 'NOW':
      case 'AHORA': {
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
      }

      case 'YEAR':
      case 'ANIO':
      case 'AÑO': {
        const d = new Date(evalArg(argsRaw[0]));
        return !isNaN(d.getFullYear()) ? d.getFullYear() : '#VALUE!';
      }

      case 'MONTH':
      case 'MES': {
        const d = new Date(evalArg(argsRaw[0]));
        return !isNaN(d.getMonth()) ? d.getMonth() + 1 : '#VALUE!';
      }

      case 'DAY':
      case 'DIA': {
        const d = new Date(evalArg(argsRaw[0]));
        return !isNaN(d.getDate()) ? d.getDate() : '#VALUE!';
      }

      default:
        return `#NAME? (${name})`;
    }
  }

  private evaluateCriteria(val: any, criteria: string): boolean {
    if (criteria.startsWith('>=')) {
      return Number(val) >= Number(criteria.substring(2));
    }
    if (criteria.startsWith('<=')) {
      return Number(val) <= Number(criteria.substring(2));
    }
    if (criteria.startsWith('<>')) {
      return String(val) != criteria.substring(2);
    }
    if (criteria.startsWith('>')) {
      return Number(val) > Number(criteria.substring(1));
    }
    if (criteria.startsWith('<')) {
      return Number(val) < Number(criteria.substring(1));
    }
    if (criteria.startsWith('=')) {
      return String(val).toLowerCase() === criteria.substring(1).toLowerCase();
    }
    return String(val).toLowerCase() === criteria.toLowerCase();
  }

  // --- Parser Helpers ---

  private isMatchingOuterParen(expr: string): boolean {
    if (!expr.startsWith('(') || !expr.endsWith(')')) return false;
    let depth = 0;
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') depth++;
      else if (expr[i] === ')') depth--;
      if (depth === 0 && i < expr.length - 1) return false;
    }
    return depth === 0;
  }

  private findTopLevelComparison(expr: string): { left: string; op: string; right: string } | null {
    let depth = 0;
    let inQuote = false;
    const ops = ['<=', '>=', '<>', '!=', '=', '<', '>'];

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (char === '"' || char === "'") inQuote = !inQuote;
      if (inQuote) continue;
      if (char === '(') depth++;
      else if (char === ')') depth--;

      if (depth === 0) {
        for (const op of ops) {
          if (expr.substring(i, i + op.length) === op) {
            return {
              left: expr.substring(0, i),
              op,
              right: expr.substring(i + op.length),
            };
          }
        }
      }
    }
    return null;
  }

  private splitTopLevel(expr: string, delimiter: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    let inQuote = false;

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (char === '"' || char === "'") inQuote = !inQuote;
      if (!inQuote) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
      }

      if (!inQuote && depth === 0 && expr.substring(i, i + delimiter.length) === delimiter) {
        parts.push(current.trim());
        current = '';
        i += delimiter.length - 1;
      } else {
        current += char;
      }
    }
    parts.push(current.trim());
    return parts;
  }

  private splitTopLevelAddSub(expr: string): { op: '+' | '-'; text: string }[] {
    const parts: { op: '+' | '-'; text: string }[] = [];
    let current = '';
    let currentOp: '+' | '-' = '+';
    let depth = 0;
    let inQuote = false;

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (char === '"' || char === "'") inQuote = !inQuote;
      if (!inQuote) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
      }

      if (!inQuote && depth === 0 && (char === '+' || (char === '-' && i > 0 && !/[+\-*/^(]/.test(expr[i - 1])))) {
        parts.push({ op: currentOp, text: current.trim() });
        currentOp = char;
        current = '';
      } else {
        current += char;
      }
    }
    parts.push({ op: currentOp, text: current.trim() });
    return parts;
  }

  private splitTopLevelMulDiv(expr: string): { op: '*' | '/'; text: string }[] {
    const parts: { op: '*' | '/'; text: string }[] = [];
    let current = '';
    let currentOp: '*' | '/' = '*';
    let depth = 0;
    let inQuote = false;

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (char === '"' || char === "'") inQuote = !inQuote;
      if (!inQuote) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
      }

      if (!inQuote && depth === 0 && (char === '*' || char === '/')) {
        parts.push({ op: currentOp, text: current.trim() });
        currentOp = char;
        current = '';
      } else {
        current += char;
      }
    }
    parts.push({ op: currentOp, text: current.trim() });
    return parts;
  }

  private splitFunctionArgs(argsStr: string): string[] {
    const args: string[] = [];
    let current = '';
    let depth = 0;
    let inQuote = false;

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      if (char === '"' || char === "'") inQuote = !inQuote;
      if (!inQuote) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
      }

      if (!inQuote && depth === 0 && (char === ',' || char === ';')) {
        args.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      args.push(current.trim());
    }
    return args;
  }
}

export const formulaEngine = new FormulaEngine();
