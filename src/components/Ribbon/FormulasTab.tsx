import React, { useState } from 'react';
import {
  Sigma,
  FunctionSquare,
  Sparkles,
  Calculator,
  Calendar,
  Search,
  CheckCircle2,
  Bot,
  HelpCircle,
} from 'lucide-react';

interface FormulasTabProps {
  onAutoSum: () => void;
  onOpenFunctionWizard: () => void;
  onInsertFormula: (formula: string) => void;
  isDarkMode: boolean;
}

export const FormulasTab: React.FC<FormulasTabProps> = ({
  onAutoSum,
  onOpenFunctionWizard,
  onInsertFormula,
  isDarkMode,
}) => {
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAiFormula = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'formula_assist',
          prompt: aiPrompt,
        }),
      });
      const data = await res.json();
      if (data.formula) {
        onInsertFormula(data.formula);
        setShowAiInput(false);
        setAiPrompt('');
      } else {
        alert(data.explanation || 'No se pudo generar la fórmula solicitada.');
      }
    } catch (e: any) {
      alert(`Error al generar con IA: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className={`h-24 px-3 py-1 flex items-center gap-3 overflow-x-auto border-b text-xs select-none ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-[#f9fbfd] border-slate-200 text-slate-800'
      }`}
    >
      {/* Function Wizard & AutoSum */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={onOpenFunctionWizard}
          className="p-2 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex flex-col items-center gap-1 transition-colors"
          title="Insertar Función (fx)"
        >
          <FunctionSquare className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] font-bold">Insertar fx</span>
        </button>

        <button
          onClick={onAutoSum}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Autosuma (SUM)"
        >
          <Sigma className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <span className="text-[10px]">Autosuma</span>
        </button>
      </div>

      {/* Function Categories */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={() => onInsertFormula('=IF(A1>0, "OK", "REVISAR")')}
          className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-0.5 text-[10px]"
          title="Funciones Lógicas (IF, AND, OR)"
        >
          <HelpCircle className="w-4 h-4 text-purple-600" />
          <span>Lógicas</span>
        </button>

        <button
          onClick={() => onInsertFormula('=VLOOKUP(A1, B1:D20, 2, FALSE)')}
          className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-0.5 text-[10px]"
          title="Búsqueda y Referencia (VLOOKUP, INDEX, MATCH)"
        >
          <Search className="w-4 h-4 text-blue-600" />
          <span>Búsqueda</span>
        </button>

        <button
          onClick={() => onInsertFormula('=TODAY()')}
          className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-0.5 text-[10px]"
          title="Fecha y Hora (TODAY, NOW, YEAR)"
        >
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>Fecha/Hora</span>
        </button>

        <button
          onClick={() => onInsertFormula('=SUM(A1:A10)')}
          className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-0.5 text-[10px]"
          title="Matemáticas y Trigonometría"
        >
          <Calculator className="w-4 h-4 text-emerald-600" />
          <span>Matemáticas</span>
        </button>
      </div>

      {/* Copilot AI Formula Generator */}
      <div className="flex items-center gap-2">
        {!showAiInput ? (
          <button
            onClick={() => setShowAiInput(true)}
            className="p-2 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex flex-col items-center gap-1 hover:scale-[1.02] transition-transform"
          >
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-[10px] font-bold">Copilot AI Fórmulas</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-700">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateAiFormula()}
              placeholder="Ej: Si ventas en B2 > 5000 aplica 10% de bono..."
              className="w-64 px-2 py-1 text-xs rounded border border-purple-300 dark:border-purple-600 bg-white dark:bg-zinc-900 outline-hidden"
              autoFocus
            />
            <button
              onClick={handleGenerateAiFormula}
              disabled={isGenerating || !aiPrompt.trim()}
              className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold disabled:opacity-50"
            >
              {isGenerating ? 'Generando...' : 'Generar'}
            </button>
            <button
              onClick={() => setShowAiInput(false)}
              className="text-xs text-zinc-500 hover:underline px-1"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
