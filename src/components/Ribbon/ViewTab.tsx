import React from 'react';
import {
  Grid,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize,
  Moon,
  Sun,
  Lock,
  Columns,
} from 'lucide-react';
import { Sheet } from '../../types/spreadsheet';

interface ViewTabProps {
  sheet: Sheet;
  onUpdateSheet: (updated: Sheet) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ViewTab: React.FC<ViewTabProps> = ({
  sheet,
  onUpdateSheet,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <div
      className={`h-24 px-3 py-1 flex items-center gap-3 overflow-x-auto border-b text-xs select-none ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-[#f9fbfd] border-slate-200 text-slate-800'
      }`}
    >
      {/* Show / Hide Elements */}
      <div className="flex flex-col justify-center gap-1.5 pr-3 border-r border-inherit text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sheet.showGridlines !== false}
            onChange={(e) => onUpdateSheet({ ...sheet, showGridlines: e.target.checked })}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Líneas de cuadrícula</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sheet.showHeaders !== false}
            onChange={(e) => onUpdateSheet({ ...sheet, showHeaders: e.target.checked })}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Encabezados (A, B, 1, 2)</span>
        </label>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={() => onUpdateSheet({ ...sheet, zoom: Math.min(2, (sheet.zoom || 1) + 0.1) })}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Aumentar Zoom (+10%)"
        >
          <ZoomIn className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <span className="text-[10px]">Acercar</span>
        </button>

        <button
          onClick={() => onUpdateSheet({ ...sheet, zoom: Math.max(0.5, (sheet.zoom || 1) - 0.1) })}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Alejar Zoom (-10%)"
        >
          <ZoomOut className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <span className="text-[10px]">Alejar</span>
        </button>

        <button
          onClick={() => onUpdateSheet({ ...sheet, zoom: 1 })}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Restablecer Zoom a 100%"
        >
          <Maximize className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] font-bold">100%</span>
        </button>
      </div>

      {/* Freeze Panes */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={() => {
            const isFrozen = !!sheet.frozenRows;
            onUpdateSheet({
              ...sheet,
              frozenRows: isFrozen ? 0 : 1,
              frozenCols: isFrozen ? 0 : 1,
            });
          }}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Inmovilizar fila superior y primera columna"
        >
          <Columns className="w-5 h-5 text-blue-600" />
          <span className="text-[10px]">
            {sheet.frozenRows ? 'Movilizar Paneles' : 'Inmovilizar'}
          </span>
        </button>
      </div>

      {/* Dark Mode Switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Modo Oscuro optimizado para largas jornadas de trabajo"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          <span className="text-[10px] font-medium">
            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </span>
        </button>
      </div>
    </div>
  );
};
