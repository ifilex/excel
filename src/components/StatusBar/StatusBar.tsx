import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Radio,
  Sparkles,
} from 'lucide-react';
import { SelectionRange, Sheet } from '../../types/spreadsheet';
import { cellKey } from '../../utils/cellUtils';

interface StatusBarProps {
  sheet: Sheet;
  selectionRange: SelectionRange;
  isEditing: boolean;
  isRecordingMacro: boolean;
  autosaveStatus: string;
  isEncrypted: boolean;
  onUpdateZoom: (zoom: number) => void;
  isDarkMode: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  sheet,
  selectionRange,
  isEditing,
  isRecordingMacro,
  autosaveStatus,
  isEncrypted,
  onUpdateZoom,
  isDarkMode,
}) => {
  // Compute dynamic stats for the selection range
  const minR = Math.min(selectionRange.startRow, selectionRange.endRow);
  const maxR = Math.max(selectionRange.startRow, selectionRange.endRow);
  const minC = Math.min(selectionRange.startCol, selectionRange.endCol);
  const maxC = Math.max(selectionRange.startCol, selectionRange.endCol);

  const numericValues: number[] = [];
  let cellCount = 0;

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      cellCount++;
      const cell = sheet.data[cellKey(c, r)];
      if (cell && cell.value !== undefined && cell.value !== null && cell.value !== '') {
        const num = Number(cell.value);
        if (!isNaN(num)) {
          numericValues.push(num);
        }
      }
    }
  }

  const hasNumbers = numericValues.length > 0;
  const sum = numericValues.reduce((acc, v) => acc + v, 0);
  const avg = hasNumbers ? sum / numericValues.length : 0;
  const min = hasNumbers ? Math.min(...numericValues) : 0;
  const max = hasNumbers ? Math.max(...numericValues) : 0;

  const currentZoom = Math.round((sheet.zoom || 1) * 100);

  return (
    <footer
      className={`h-6 px-3 flex items-center justify-between border-t text-[11px] select-none transition-colors ${
        isDarkMode ? 'bg-[#107c41]/90 text-zinc-100 border-emerald-800' : 'bg-[#107c41] text-white border-emerald-700'
      }`}
    >
      {/* Left: Status Mode & Macro State */}
      <div className="flex items-center gap-3">
        {isRecordingMacro ? (
          <span className="flex items-center gap-1 font-bold text-amber-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            GRABANDO MACRO VBA
          </span>
        ) : (
          <span className="font-medium text-emerald-100">
            {isEditing ? 'MODO EDICIÓN' : 'LISTO'}
          </span>
        )}

        <div className="h-3 w-px bg-white/20" />

        {/* Autosave info */}
        <span className="text-[10px] text-emerald-100/80 hidden sm:inline">
          {autosaveStatus}
        </span>
      </div>

      {/* Center / Right: Dynamic Calculation Stats */}
      <div className="flex items-center gap-4">
        {cellCount > 1 && (
          <div className="flex items-center gap-3 font-medium text-[11px]">
            {hasNumbers && (
              <>
                <span>
                  PROMEDIO: <strong>{avg.toLocaleString('es-ES', { maximumFractionDigits: 2 })}</strong>
                </span>
                <span>
                  MÍNIMO: <strong>{min.toLocaleString('es-ES')}</strong>
                </span>
                <span>
                  MÁXIMO: <strong>{max.toLocaleString('es-ES')}</strong>
                </span>
                <span>
                  SUMA: <strong>{sum.toLocaleString('es-ES', { maximumFractionDigits: 2 })}</strong>
                </span>
              </>
            )}
            <span>
              RECUENTO: <strong>{numericValues.length}</strong>
            </span>
          </div>
        )}

        {/* Security indicator */}
        {isEncrypted && (
          <div className="flex items-center gap-1 text-[10px] text-emerald-200">
            <ShieldCheck className="w-3 h-3" />
            <span>AES-256</span>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 pl-2">
          <button
            onClick={() => onUpdateZoom(Math.max(0.5, (sheet.zoom || 1) - 0.1))}
            className="hover:bg-white/20 p-0.5 rounded transition-colors"
            title="Reducir Zoom"
          >
            <ZoomOut className="w-3 h-3" />
          </button>

          <span className="w-10 text-center font-bold text-[10px]">{currentZoom}%</span>

          <button
            onClick={() => onUpdateZoom(Math.min(2, (sheet.zoom || 1) + 0.1))}
            className="hover:bg-white/20 p-0.5 rounded transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
};
