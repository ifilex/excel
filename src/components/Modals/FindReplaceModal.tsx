import React, { useState } from 'react';
import { Search, Replace, X, Check, ArrowRight } from 'lucide-react';
import { Sheet, Workbook } from '../../types/spreadsheet';
import { cellKey, coordsToAddress } from '../../utils/cellUtils';

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbook: Workbook;
  onUpdateWorkbook: (wb: Workbook) => void;
  onSelectCell: (row: number, col: number) => void;
  isDarkMode: boolean;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  onClose,
  workbook,
  onUpdateWorkbook,
  onSelectCell,
  isDarkMode,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId) || workbook.sheets[0];

  const handleFindNext = () => {
    if (!findText) return;
    const term = matchCase ? findText : findText.toLowerCase();

    for (let r = 0; r < 100; r++) {
      for (let c = 0; c < 26; c++) {
        const cell = currentSheet.data[cellKey(c, r)];
        if (cell && cell.value !== undefined && cell.value !== null) {
          const valStr = matchCase ? String(cell.value) : String(cell.value).toLowerCase();
          if (valStr.includes(term)) {
            onSelectCell(r, c);
            setStatusMsg(`Coincidencia encontrada en ${coordsToAddress(c, r)}.`);
            return;
          }
        }
      }
    }
    setStatusMsg('No se encontraron más coincidencias.');
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    let count = 0;
    const newSheet = { ...currentSheet, data: { ...currentSheet.data } };

    for (const key of Object.keys(newSheet.data)) {
      const cell = newSheet.data[key];
      if (cell && typeof cell.value === 'string') {
        let val = cell.value;
        if (matchCase ? val.includes(findText) : val.toLowerCase().includes(findText.toLowerCase())) {
          const regex = new RegExp(findText, matchCase ? 'g' : 'gi');
          newSheet.data[key] = {
            ...cell,
            value: val.replace(regex, replaceText),
            displayValue: val.replace(regex, replaceText),
          };
          count++;
        }
      }
    }

    const updatedSheets = workbook.sheets.map((s) => (s.id === currentSheet.id ? newSheet : s));
    onUpdateWorkbook({ ...workbook, sheets: updatedSheets });
    setStatusMsg(`Se han reemplazado ${count} coincidencias.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="bg-[#107c41] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <h3 className="font-bold text-sm">Buscar y Reemplazar</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Buscar:</label>
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Texto o número a buscar..."
              className={`w-full px-3 py-1.5 text-xs rounded-lg border outline-hidden ${
                isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Reemplazar con:</label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Texto de sustitución..."
              className={`w-full px-3 py-1.5 text-xs rounded-lg border outline-hidden ${
                isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              id="matchCase"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="matchCase">Coincidir mayúsculas y minúsculas</label>
          </div>

          {statusMsg && (
            <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {statusMsg}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleFindNext}
              className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Buscar Siguiente
            </button>
            <button
              onClick={handleReplaceAll}
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Reemplazar Todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
