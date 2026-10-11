import React from 'react';
import {
  Code2,
  Play,
  Square,
  Sparkles,
  FileCode,
  Layers,
  FileText,
  Bot,
} from 'lucide-react';
import { Workbook } from '../../types/spreadsheet';

interface AutomateTabProps {
  workbook: Workbook;
  onOpenVbaEditor: () => void;
  onOpenAddonsModal: () => void;
  isRecordingMacro: boolean;
  onStartRecordMacro: () => void;
  onStopRecordMacro: () => void;
  onRunMacro: (macroCode: string) => void;
  isDarkMode: boolean;
}

export const AutomateTab: React.FC<AutomateTabProps> = ({
  workbook,
  onOpenVbaEditor,
  onOpenAddonsModal,
  isRecordingMacro,
  onStartRecordMacro,
  onStopRecordMacro,
  onRunMacro,
  isDarkMode,
}) => {
  return (
    <div
      className={`h-24 px-3 py-1 flex items-center gap-3 overflow-x-auto border-b text-xs select-none ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-[#f9fbfd] border-slate-200 text-slate-800'
      }`}
    >
      {/* Visual Basic IDE */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={onOpenVbaEditor}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Abrir entorno de desarrollo Visual Basic para Aplicaciones (Alt+F11)"
        >
          <Code2 className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
          <span className="text-[10px] font-bold">Visual Basic (VBA)</span>
        </button>

        {isRecordingMacro ? (
          <button
            onClick={onStopRecordMacro}
            className="p-2 rounded bg-red-600 hover:bg-red-700 text-white flex flex-col items-center gap-1 animate-pulse transition-colors"
            title="Detener grabación de macro"
          >
            <Square className="w-5 h-5 fill-current" />
            <span className="text-[10px] font-bold">Detener Grabación</span>
          </button>
        ) : (
          <button
            onClick={onStartRecordMacro}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
            title="Grabar nueva macro interactiva"
          >
            <div className="w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
            </div>
            <span className="text-[10px]">Grabar Macro</span>
          </button>
        )}
      </div>

      {/* Quick Macros list */}
      <div className="flex items-center gap-1.5 pr-3 border-r border-inherit">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-zinc-400 font-medium">Macros Disponibles:</span>
          <div className="flex items-center gap-1">
            {(workbook.vbaModules || []).slice(0, 2).map((m) => (
              <button
                key={m.id}
                onClick={() => onRunMacro(m.code)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-200/80 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white transition-colors text-[10px] font-medium"
                title={`Ejecutar macro "${m.name}"`}
              >
                <Play className="w-2.5 h-2.5 fill-current text-emerald-600" />
                <span>{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Office Add-ons & Word Bridge */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAddonsModal}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Biblioteca de extensiones y complementos"
        >
          <Layers className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] font-medium">Complementos</span>
        </button>

        <button
          onClick={onOpenAddonsModal}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Generar informe estructurado para Microsoft Word"
        >
          <FileText className="w-5 h-5 text-cyan-600" />
          <span className="text-[10px]">Doc Word Bridge</span>
        </button>
      </div>
    </div>
  );
};
