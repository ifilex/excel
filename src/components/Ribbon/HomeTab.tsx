import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Scissors,
  Copy,
  ClipboardPaste,
  Paintbrush,
  Percent,
  DollarSign,
  Plus,
  Minus,
  Trash2,
  Filter,
  ArrowUpDown,
  Search,
  Grid,
  Sigma,
  Eraser,
  Sparkles,
} from 'lucide-react';
import { CellFormat } from '../../types/spreadsheet';

interface HomeTabProps {
  currentFormat: CellFormat;
  onApplyFormat: (format: Partial<CellFormat>) => void;
  onAutoSum: () => void;
  onInsertRow: () => void;
  onInsertCol: () => void;
  onDeleteRow: () => void;
  onDeleteCol: () => void;
  onClearCells: () => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  onOpenFindReplace: () => void;
  onMergeCells: () => void;
  isDarkMode: boolean;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  currentFormat,
  onApplyFormat,
  onAutoSum,
  onInsertRow,
  onInsertCol,
  onDeleteRow,
  onDeleteCol,
  onClearCells,
  onSortAsc,
  onSortDesc,
  onOpenFindReplace,
  onMergeCells,
  isDarkMode,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const fontFamilies = ['Calibri', 'Arial', 'Segoe UI', 'Roboto', 'Times New Roman', 'Courier New'];
  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36];
  const colorPalette = [
    '#000000', '#ffffff', '#107c41', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2',
    '#f1f5f9', '#fee2e2', '#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff', '#e0e7ff', '#334155'
  ];

  return (
    <div
      className={`h-24 px-3 py-1 flex items-center gap-2 overflow-x-auto border-b text-xs select-none ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-[#f9fbfd] border-slate-200 text-slate-800'
      }`}
    >
      {/* Group 1: Clipboard */}
      <div className="flex items-center gap-1 pr-2 border-r border-inherit">
        <div className="flex flex-col items-center">
          <button
            onClick={() => navigator.clipboard.readText?.().catch(() => {})}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
            title="Pegar (Ctrl+V)"
          >
            <ClipboardPaste className="w-5 h-5 text-amber-600" />
            <span className="text-[10px]">Pegar</span>
          </button>
        </div>

        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => document.execCommand?.('cut')}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Cortar (Ctrl+X)"
          >
            <Scissors className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px]">Cortar</span>
          </button>
          <button
            onClick={() => document.execCommand?.('copy')}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Copiar (Ctrl+C)"
          >
            <Copy className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px]">Copiar</span>
          </button>
        </div>
      </div>

      {/* Group 2: Font Formatting */}
      <div className="flex flex-col justify-center gap-1 pr-2 border-r border-inherit">
        <div className="flex items-center gap-1">
          {/* Font Family */}
          <select
            value={currentFormat.fontFamily || 'Calibri'}
            onChange={(e) => onApplyFormat({ fontFamily: e.target.value })}
            className={`h-6 px-1 text-[11px] rounded border outline-hidden ${
              isDarkMode ? 'bg-zinc-950 border-zinc-700 text-zinc-200' : 'bg-white border-slate-300'
            }`}
          >
            {fontFamilies.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Font Size */}
          <select
            value={currentFormat.fontSize || 11}
            onChange={(e) => onApplyFormat({ fontSize: Number(e.target.value) })}
            className={`h-6 w-12 px-1 text-[11px] rounded border outline-hidden ${
              isDarkMode ? 'bg-zinc-950 border-zinc-700 text-zinc-200' : 'bg-white border-slate-300'
            }`}
          >
            {fontSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Font Style Buttons */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onApplyFormat({ bold: !currentFormat.bold })}
            className={`p-1 rounded transition-colors ${
              currentFormat.bold ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Negrita (Ctrl+N / Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ italic: !currentFormat.italic })}
            className={`p-1 rounded transition-colors ${
              currentFormat.italic ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Cursiva (Ctrl+K / Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ underline: !currentFormat.underline })}
            className={`p-1 rounded transition-colors ${
              currentFormat.underline ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Subrayado (Ctrl+S / Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

          {/* Text Color Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowBgColorPicker(false);
              }}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center"
              title="Color de Fuente"
            >
              <span className="font-bold text-xs leading-none">A</span>
              <div
                className="w-3 h-0.5 mt-0.5 rounded"
                style={{ backgroundColor: currentFormat.textColor || '#000000' }}
              />
            </button>
            {showColorPicker && (
              <div className="absolute top-8 left-0 z-50 p-2 bg-white dark:bg-zinc-900 border rounded-lg shadow-xl grid grid-cols-4 gap-1 w-32">
                {colorPalette.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onApplyFormat({ textColor: c });
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-zinc-300 dark:border-zinc-700 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Fill Color Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBgColorPicker(!showBgColorPicker);
                setShowColorPicker(false);
              }}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center"
              title="Color de Relleno"
            >
              <Paintbrush className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              <div
                className="w-3 h-0.5 mt-0.5 rounded"
                style={{ backgroundColor: currentFormat.bgColor || 'transparent' }}
              />
            </button>
            {showBgColorPicker && (
              <div className="absolute top-8 left-0 z-50 p-2 bg-white dark:bg-zinc-900 border rounded-lg shadow-xl grid grid-cols-4 gap-1 w-32">
                {colorPalette.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onApplyFormat({ bgColor: c });
                      setShowBgColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-zinc-300 dark:border-zinc-700 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group 3: Alignment */}
      <div className="flex flex-col justify-center gap-1 pr-2 border-r border-inherit">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onApplyFormat({ align: 'left' })}
            className={`p-1 rounded ${
              currentFormat.align === 'left' ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Alinear a la izquierda"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ align: 'center' })}
            className={`p-1 rounded ${
              currentFormat.align === 'center' ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Centrar"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ align: 'right' })}
            className={`p-1 rounded ${
              currentFormat.align === 'right' ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Alinear a la derecha"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onMergeCells}
            className="px-1.5 py-0.5 rounded text-[10px] font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Combinar y centrar celdas seleccionadas"
          >
            Combinar
          </button>
          <button
            onClick={() => onApplyFormat({ wrapText: !currentFormat.wrapText })}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
              currentFormat.wrapText
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Ajustar texto en celda"
          >
            Ajustar
          </button>
        </div>
      </div>

      {/* Group 4: Number Formats */}
      <div className="flex flex-col justify-center gap-1 pr-2 border-r border-inherit">
        <select
          value={currentFormat.numFormat || 'general'}
          onChange={(e) => onApplyFormat({ numFormat: e.target.value as any })}
          className={`h-6 px-1 text-[11px] rounded border outline-hidden ${
            isDarkMode ? 'bg-zinc-950 border-zinc-700 text-zinc-200' : 'bg-white border-slate-300'
          }`}
        >
          <option value="general">General</option>
          <option value="currency">Moneda ($)</option>
          <option value="percentage">Porcentaje (%)</option>
          <option value="number">Número</option>
          <option value="date">Fecha Corta</option>
        </select>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onApplyFormat({ numFormat: 'currency' })}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Formato Moneda ($)"
          >
            <DollarSign className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ numFormat: 'percentage' })}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Formato Porcentaje (%)"
          >
            <Percent className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Group 5: Cells Management */}
      <div className="flex flex-col justify-center gap-1 pr-2 border-r border-inherit">
        <div className="flex items-center gap-1">
          <button
            onClick={onInsertRow}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Insertar fila encima"
          >
            <Plus className="w-3 h-3 text-emerald-600" />
            <span>Fila</span>
          </button>
          <button
            onClick={onInsertCol}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Insertar columna a la izquierda"
          >
            <Plus className="w-3 h-3 text-emerald-600" />
            <span>Columna</span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDeleteRow}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Eliminar fila actual"
          >
            <Trash2 className="w-3 h-3" />
            <span>Fila</span>
          </button>
          <button
            onClick={onDeleteCol}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Eliminar columna actual"
          >
            <Trash2 className="w-3 h-3" />
            <span>Col</span>
          </button>
        </div>
      </div>

      {/* Group 6: Editing & AutoSum */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAutoSum}
          className="p-2 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex flex-col items-center gap-1"
          title="Autosuma rápida (=SUM(rango))"
        >
          <Sigma className="w-4 h-4 font-bold" />
          <span className="text-[10px] font-bold">Autosuma</span>
        </button>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <button
              onClick={onSortAsc}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[10px] flex items-center gap-1"
              title="Ordenar de A a Z (Ascendente)"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>A-Z</span>
            </button>
            <button
              onClick={onSortDesc}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[10px] flex items-center gap-1"
              title="Ordenar de Z a A (Descendente)"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Z-A</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenFindReplace}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[10px] flex items-center gap-1"
              title="Buscar y Reemplazar (Ctrl+B / Ctrl+F)"
            >
              <Search className="w-3 h-3 text-blue-600" />
              <span>Buscar</span>
            </button>
            <button
              onClick={onClearCells}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[10px] flex items-center gap-1 text-zinc-500"
              title="Borrar contenido seleccionado"
            >
              <Eraser className="w-3 h-3" />
              <span>Borrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
