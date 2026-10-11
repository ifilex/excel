import React, { useState, useEffect } from 'react';
import { Check, X, FunctionSquare } from 'lucide-react';
import { coordsToAddress, addressToCoords } from '../../utils/cellUtils';
import { Sheet } from '../../types/spreadsheet';

interface FormulaBarProps {
  sheet: Sheet;
  activeRow: number;
  activeCol: number;
  currentValue: string;
  onChangeValue: (val: string) => void;
  onSubmitValue: () => void;
  onCancelValue: () => void;
  onJumpToCell: (row: number, col: number) => void;
  onOpenFunctionWizard: () => void;
  isDarkMode: boolean;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  sheet,
  activeRow,
  activeCol,
  currentValue,
  onChangeValue,
  onSubmitValue,
  onCancelValue,
  onJumpToCell,
  onOpenFunctionWizard,
  isDarkMode,
}) => {
  const [addressInput, setAddressInput] = useState(coordsToAddress(activeCol, activeRow));
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    if (!isEditingAddress) {
      setAddressInput(coordsToAddress(activeCol, activeRow));
    }
  }, [activeRow, activeCol, isEditingAddress]);

  const handleAddressSubmit = () => {
    const coords = addressToCoords(addressInput.trim().toUpperCase());
    if (coords) {
      onJumpToCell(coords.row, coords.col);
    }
    setIsEditingAddress(false);
  };

  return (
    <div
      className={`h-9 px-3 flex items-center gap-2 border-b select-none transition-colors ${
        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Name Box (Cell Address) */}
      <div className="w-20">
        <input
          type="text"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onFocus={() => setIsEditingAddress(true)}
          onBlur={handleAddressSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddressSubmit();
            if (e.key === 'Escape') {
              setAddressInput(coordsToAddress(activeCol, activeRow));
              setIsEditingAddress(false);
            }
          }}
          className={`w-full px-2 py-0.5 text-xs text-center font-semibold rounded border outline-hidden ${
            isDarkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}
          title="Cuadro de Nombres (escriba una coordenada como D15 para saltar a ella)"
        />
      </div>

      <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* Buttons (Cancel, Accept, fx) */}
      <div className="flex items-center gap-0.5 text-zinc-500">
        <button
          onClick={onCancelValue}
          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors text-red-500"
          title="Cancelar (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onSubmitValue}
          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors text-emerald-600"
          title="Confirmar (Intro / Enter)"
        >
          <Check className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenFunctionWizard}
          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors text-blue-600 font-serif italic font-bold text-xs"
          title="Insertar Función (fx)"
        >
          fx
        </button>
      </div>

      <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* Formula & Value Input */}
      <div className="flex-1">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => onChangeValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmitValue();
            if (e.key === 'Escape') onCancelValue();
          }}
          placeholder="Ingrese un valor o fórmula comenzando con '=' (ej: =SUM(B5:B8))"
          className={`w-full px-2.5 py-0.5 text-xs font-mono rounded border outline-hidden ${
            isDarkMode
              ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
    </div>
  );
};
