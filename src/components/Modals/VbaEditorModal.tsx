import React, { useState } from 'react';
import {
  Play,
  Square,
  Sparkles,
  Code2,
  FolderTree,
  FileCode,
  Check,
  AlertCircle,
  Terminal,
  Layers,
  Copy,
  Plus,
  Trash2,
  X,
  Bot,
  Wand2,
  Info,
} from 'lucide-react';
import { VbaModule, Workbook } from '../../types/spreadsheet';
import { vbaEngine } from '../../utils/vbaEngine';

interface VbaEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbook: Workbook;
  onUpdateWorkbook: (wb: Workbook) => void;
  isRecordingMacro: boolean;
  onStartRecordMacro: () => void;
  onStopRecordMacro: () => void;
  isDarkMode: boolean;
}

export const VbaEditorModal: React.FC<VbaEditorModalProps> = ({
  isOpen,
  onClose,
  workbook,
  onUpdateWorkbook,
  isRecordingMacro,
  onStartRecordMacro,
  onStopRecordMacro,
  isDarkMode,
}) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(
    workbook.vbaModules?.[0]?.id || 'default-mod'
  );
  const [code, setCode] = useState<string>(
    workbook.vbaModules?.[0]?.code ||
      `' Módulo 1 de Visual Basic para Aplicaciones (VBA)\nSub MiPrimeraMacro()\n    Dim ws As Worksheet\n    Set ws = ActiveSheet\n    \n    Range("A1").Value = "Reporte Automatizado"\n    Range("A1").Font.Bold = True\n    Range("A1").Interior.Color = "rgb(16, 124, 65)"\n    \n    MsgBox "Macro ejecutada con éxito en Excel Office Pro.", vbInformation\nEnd Sub`
  );

  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'Microsoft Visual Basic for Applications 7.1 Runtime listo.',
    'Seleccione una macro y presione [Ejecutar Sub] o presione F5.',
  ]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentModule = workbook.vbaModules?.find((m) => m.id === activeModuleId) || {
    id: 'default-mod',
    name: 'Modulo1',
    code,
    isMacroEnabled: true,
  };

  const handleSelectModule = (mod: VbaModule) => {
    setActiveModuleId(mod.id);
    setCode(mod.code);
  };

  const handleAddModule = () => {
    const newMod: VbaModule = {
      id: `vba-${Date.now()}`,
      name: `Modulo${(workbook.vbaModules?.length || 0) + 1}`,
      code: `Sub Macro${(workbook.vbaModules?.length || 0) + 1}()\n    ' Código de automatización\n    MsgBox "Nueva macro iniciada", vbInformation\nEnd Sub`,
      isMacroEnabled: true,
    };
    const updated = [...(workbook.vbaModules || []), newMod];
    onUpdateWorkbook({ ...workbook, vbaModules: updated });
    setActiveModuleId(newMod.id);
    setCode(newMod.code);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const updated = (workbook.vbaModules || []).map((m) =>
      m.id === activeModuleId ? { ...m, code: newCode } : m
    );
    if (!updated.some((m) => m.id === activeModuleId)) {
      updated.push({
        id: activeModuleId,
        name: 'Modulo1',
        code: newCode,
        isMacroEnabled: true,
      });
    }
    onUpdateWorkbook({ ...workbook, vbaModules: updated });
  };

  const handleRunMacro = () => {
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Iniciando ejecución VBA...`]);
    const result = vbaEngine.executeVba(code, workbook);

    if (result.success) {
      setConsoleLogs((prev) => [
        ...prev,
        ...result.logs,
        `[${new Date().toLocaleTimeString()}] Ejecución finalizada con éxito.`,
      ]);

      if (result.messages?.length) {
        setExecutionMessage(result.messages.join('\n'));
      }

      if (result.updatedWorkbook) {
        onUpdateWorkbook(result.updatedWorkbook);
      }
    } else {
      setConsoleLogs((prev) => [
        ...prev,
        ...result.logs,
        `[ERROR] ${result.error || 'Fallo en la macro VBA'}`,
      ]);
      alert(`Error en VBA: ${result.error}`);
    }
  };

  const handleAiGenerateMacro = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vba_generate',
          prompt: aiPrompt,
          vbaCode: code,
        }),
      });
      const data = await res.json();
      if (data.code) {
        const fullCode = `${code}\n\n' --- Macro generada por Copilot AI (${data.macroName || 'Generada'}) ---\n${data.code}`;
        handleCodeChange(fullCode);
        setConsoleLogs((prev) => [
          ...prev,
          `[Copilot AI] Macro generada con éxito: ${data.macroName || 'Sub'}`,
        ]);
        setAiPrompt('');
      }
    } catch (e: any) {
      alert(`Error al generar con IA: ${e.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const insertSnippet = (snippetCode: string) => {
    const newCode = `${code}\n\n${snippetCode}`;
    handleCodeChange(newCode);
    setConsoleLogs((prev) => [...prev, '[Editor] Snippet insertado al código']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-6xl h-[88vh] rounded-xl flex flex-col shadow-2xl overflow-hidden border ${
          isDarkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-300 text-slate-900'
        }`}
      >
        {/* Title Bar - Classic Microsoft Visual Basic Style */}
        <div className="bg-[#1e3a8a] text-white px-4 py-2 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-300" />
            <span className="font-semibold text-sm">
              Microsoft Visual Basic para Aplicaciones (VBA Studio) - {workbook.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-600 rounded text-white transition-colors"
            title="Cerrar Editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div
          className={`px-3 py-1.5 border-b flex items-center justify-between text-xs select-none ${
            isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-200 border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {/* Run Button */}
            <button
              onClick={handleRunMacro}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs transition-colors"
              title="Ejecutar Macro (F5)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Ejecutar Sub (F5)</span>
            </button>

            {/* Macro Recorder Toggle */}
            {isRecordingMacro ? (
              <button
                onClick={onStopRecordMacro}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-medium animate-pulse transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Detener Grabación</span>
              </button>
            ) : (
              <button
                onClick={onStartRecordMacro}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-700/80 hover:bg-rose-700 text-white font-medium transition-colors"
                title="Grabar acciones del usuario en código VBA"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span>Grabar Macro</span>
              </button>
            )}

            <div className="h-4 w-px bg-zinc-400 dark:bg-zinc-600 mx-1" />

            {/* Snippets Dropdown / Buttons */}
            <button
              onClick={() =>
                insertSnippet(
                  `' Resaltar valores negativos en rojo\nSub ResaltarNegativos()\n    For i = 1 To 20\n        If Cells(i, 2).Value < 0 Then\n            Cells(i, 2).Font.Color = RGB(220, 38, 38)\n            Cells(i, 2).Font.Bold = True\n        End If\n    Next i\n    MsgBox "Resaltado de negativos completado", vbInformation\nEnd Sub`
                )
              }
              className="px-2 py-1 rounded bg-zinc-300/80 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors"
            >
              + Snippet Negativos
            </button>

            <button
              onClick={() =>
                insertSnippet(
                  `' Generar Matriz de Multiplicación 10x10\nSub MatrizMultiplicar()\n    For r = 1 To 10\n        For c = 1 To 10\n            Cells(r + 1, c + 1).Value = r * c\n        Next c\n    Next r\n    MsgBox "Matriz 10x10 generada", vbInformation\nEnd Sub`
                )
              }
              className="px-2 py-1 rounded bg-zinc-300/80 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors"
            >
              + Snippet Matriz
            </button>
          </div>

          {/* Status info */}
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">
              Módulo: <strong>{currentModule.name}</strong>
            </span>
          </div>
        </div>

        {/* Main Editor Body: 3-column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Project Explorer Tree (Left) */}
          <div
            className={`w-60 border-r flex flex-col select-none ${
              isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <div className="p-2 border-b text-xs font-bold flex items-center justify-between uppercase tracking-wider text-zinc-500">
              <span className="flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5" />
                Explorador de Proyectos
              </span>
              <button
                onClick={handleAddModule}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                title="Nuevo Módulo VBA"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2 flex-1 overflow-y-auto space-y-3 text-xs">
              <div>
                <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 py-1">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>VBAProject ({workbook.name})</span>
                </div>

                {/* Sheets list */}
                <div className="pl-4 space-y-1">
                  <span className="text-[11px] text-zinc-400 font-medium">Hojas de Cálculo:</span>
                  {workbook.sheets.map((s) => (
                    <div key={s.id} className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 py-0.5">
                      <FileCode className="w-3 h-3 text-emerald-600" />
                      <span>{s.name} (Hoja)</span>
                    </div>
                  ))}
                </div>

                {/* Modules list */}
                <div className="pl-4 space-y-1 mt-3">
                  <span className="text-[11px] text-zinc-400 font-medium">Módulos de Código:</span>
                  {(workbook.vbaModules || []).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectModule(m)}
                      className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded cursor-pointer transition-colors ${
                        activeModuleId === m.id
                          ? 'bg-blue-600 text-white font-medium'
                          : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{m.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Generator Box at bottom */}
            <div className="p-3 border-t bg-zinc-200/50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Copilot AI para VBA</span>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ej: Genera una macro para formatear en verde y calcular el 10% de bono..."
                rows={2}
                className={`w-full p-2 text-xs rounded border resize-none mb-2 ${
                  isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <button
                onClick={handleAiGenerateMacro}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="w-full py-1.5 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {isGeneratingAi ? (
                  <>
                    <Wand2 className="w-3 h-3 animate-spin" />
                    <span>Generando VBA...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5" />
                    <span>Generar con IA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Central Code Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-3 font-mono text-sm bg-zinc-950 text-emerald-400 overflow-y-auto">
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent resize-none border-none outline-hidden font-mono text-xs leading-relaxed text-zinc-100 selection:bg-blue-600"
              />
            </div>

            {/* Immediate Window / Console Output */}
            <div
              className={`h-36 border-t flex flex-col text-xs font-mono select-text ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <div className="px-3 py-1 border-b font-sans font-semibold text-[11px] flex items-center justify-between text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Ventana Inmediata / Registros de Ejecución VBA
                </span>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="hover:underline text-[10px]"
                >
                  Limpiar consola
                </button>
              </div>
              <div className="flex-1 p-2 overflow-y-auto space-y-0.5 text-[11px]">
                {consoleLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.startsWith('[ERROR]')
                        ? 'text-red-500'
                        : log.startsWith('[MsgBox]')
                        ? 'text-emerald-500 font-semibold'
                        : log.startsWith('[Copilot')
                        ? 'text-purple-400'
                        : 'text-zinc-400'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MsgBox Popup Modal Notification */}
        {executionMessage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs">
            <div
              className={`w-96 p-5 rounded-lg border shadow-2xl animate-scaleUp ${
                isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">Microsoft Visual Basic for Applications</h3>
              </div>
              <p className="text-xs mb-5 whitespace-pre-wrap">{executionMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setExecutionMessage(null)}
                  className="px-5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
