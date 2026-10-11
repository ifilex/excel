import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  CopySlash,
  TableProperties,
  Calculator,
  Bot,
  CheckCircle2,
  Play,
  Download,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Sheet, Workbook } from '../../types/spreadsheet';
import {
  AVAILABLE_ADDONS,
  executeDataCleaner,
  generateAmortizationTable,
  removeDuplicateRows,
} from '../../utils/officeAddons';
import { exportToRTF } from '../../utils/fileIO';
import { createDefaultSheet } from '../../utils/fileIO';

interface AddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbook: Workbook;
  onUpdateWorkbook: (wb: Workbook) => void;
  isDarkMode: boolean;
}

export const AddonsModal: React.FC<AddonsModalProps> = ({
  isOpen,
  onClose,
  workbook,
  onUpdateWorkbook,
  isDarkMode,
}) => {
  const [selectedAddon, setSelectedAddon] = useState(AVAILABLE_ADDONS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [wizardResult, setWizardResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Amortization wizard states
  const [loanAmount, setLoanAmount] = useState(50000);
  const [annualRate, setAnnualRate] = useState(12);
  const [loanMonths, setLoanMonths] = useState(12);

  // Word report wizard state
  const [reportTitle, setReportTitle] = useState('Informe Ejecutivo de Operaciones y Finanzas');

  if (!isOpen) return null;

  const currentSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId) || workbook.sheets[0];

  const handleRunCleaner = () => {
    setIsProcessing(true);
    const { updatedSheet, changesCount } = executeDataCleaner(currentSheet, {
      trimSpaces: true,
      toProperCase: true,
      removeEmptyRows: false,
    });
    const updatedSheets = workbook.sheets.map((s) => (s.id === currentSheet.id ? updatedSheet : s));
    onUpdateWorkbook({ ...workbook, sheets: updatedSheets });
    setIsProcessing(false);
    setWizardResult(`Limpieza completada: Se optimizaron ${changesCount} celdas de texto.`);
  };

  const handleRunDeduplicator = () => {
    setIsProcessing(true);
    const { updatedSheet, removedCount } = removeDuplicateRows(currentSheet);
    const updatedSheets = workbook.sheets.map((s) => (s.id === currentSheet.id ? updatedSheet : s));
    onUpdateWorkbook({ ...workbook, sheets: updatedSheets });
    setIsProcessing(false);
    setWizardResult(`Deduplicación finalizada: ${removedCount} filas repetidas fueron depuradas.`);
  };

  const handleGenerateAmortization = () => {
    setIsProcessing(true);
    const tableData = generateAmortizationTable(loanAmount, annualRate, loanMonths);
    const newSheet = createDefaultSheet(`Préstamo $${loanAmount}`);
    newSheet.data = tableData;
    newSheet.colWidths = { 0: 80, 1: 130, 2: 130, 3: 130, 4: 130, 5: 130 };

    const updatedSheets = [...workbook.sheets, newSheet];
    onUpdateWorkbook({
      ...workbook,
      sheets: updatedSheets,
      activeSheetId: newSheet.id,
    });
    setIsProcessing(false);
    setWizardResult(`Tabla de amortización generada en la nueva hoja "${newSheet.name}".`);
  };

  const handleGenerateWordReport = async () => {
    setIsProcessing(true);
    // Directly export active sheet as formatted RTF for Word
    exportToRTF(workbook);
    setIsProcessing(false);
    setWizardResult(`Documento compatible con Microsoft Word (.rtf) generado y descargado exitosamente.`);
  };

  const filteredAddons =
    activeCategory === 'Todos'
      ? AVAILABLE_ADDONS
      : AVAILABLE_ADDONS.filter((a) => a.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-5xl h-[82vh] rounded-xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="bg-[#107c41] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Complementos de Office & Extensiones de Automatización</h2>
              <p className="text-xs text-emerald-100">Potencia tu flujo de trabajo con add-ons empresariales</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left catalog list */}
          <div
            className={`w-80 border-r flex flex-col ${
              isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Category tabs */}
            <div className="p-3 border-b flex gap-1 overflow-x-auto text-xs">
              {['Todos', 'Automatización', 'Productividad', 'Análisis', 'Integración Office'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredAddons.map((addon) => (
                <div
                  key={addon.id}
                  onClick={() => {
                    setSelectedAddon(addon);
                    setWizardResult(null);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedAddon.id === addon.id
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30'
                      : isDarkMode
                      ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
                      : 'border-slate-200 hover:border-slate-300 bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                      {addon.iconName === 'FileText' && <FileText className="w-4 h-4" />}
                      {addon.iconName === 'Sparkles' && <Sparkles className="w-4 h-4" />}
                      {addon.iconName === 'CopySlash' && <CopySlash className="w-4 h-4" />}
                      {addon.iconName === 'TableProperties' && <TableProperties className="w-4 h-4" />}
                      {addon.iconName === 'Calculator' && <Calculator className="w-4 h-4" />}
                      {addon.iconName === 'Bot' && <Bot className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs truncate">{addon.name}</h4>
                      <span className="text-[10px] text-zinc-400">{addon.category}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {addon.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Detail & Wizard Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{selectedAddon.name}</h3>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  v{selectedAddon.version} &bull; Instalado
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                {selectedAddon.description}
              </p>
            </div>

            {wizardResult && (
              <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{wizardResult}</span>
              </div>
            )}

            {/* Dynamic Wizard Actions */}
            {selectedAddon.actionType === 'data_cleaner' && (
              <div className={`p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="font-bold text-sm">Opciones de Limpieza Rápida en Hoja Activa ({currentSheet.name})</h4>
                <ul className="text-xs space-y-2 text-zinc-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Elimina espacios en blanco dobles y recorta márgenes (TRIM).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Estandariza a Formato Título / Tipo Oración (PROPER).</span>
                  </li>
                </ul>
                <button
                  onClick={handleRunCleaner}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isProcessing ? 'Procesando...' : 'Ejecutar Asistente de Limpieza'}</span>
                </button>
              </div>
            )}

            {selectedAddon.actionType === 'deduplicator' && (
              <div className={`p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="font-bold text-sm">Eliminación Inteligente de Duplicados</h4>
                <p className="text-xs text-zinc-500">
                  Escanea los registros de la hoja actual y purga las filas que contengan datos idénticos conservando la primera aparición.
                </p>
                <button
                  onClick={handleRunDeduplicator}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors"
                >
                  <CopySlash className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Analizando...' : 'Depurar Filas Duplicadas'}</span>
                </button>
              </div>
            )}

            {selectedAddon.actionType === 'word_bridge' && (
              <div className={`p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="font-bold text-sm">Generador de Documentos para Microsoft Word</h4>
                <div>
                  <label className="block text-xs font-semibold mb-1">Título del Informe Word:</label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-hidden ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
                <button
                  onClick={handleGenerateWordReport}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Generando Word...' : 'Exportar a Documento Word (.rtf)'}</span>
                </button>
              </div>
            )}

            {selectedAddon.actionType === 'financial_modeler' && (
              <div className={`p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="font-bold text-sm">Generador de Tabla de Amortización de Préstamos</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Monto Principal ($):</label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className={`w-full px-3 py-2 text-xs rounded-lg border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tasa Anual (%):</label>
                    <input
                      type="number"
                      value={annualRate}
                      onChange={(e) => setAnnualRate(Number(e.target.value))}
                      className={`w-full px-3 py-2 text-xs rounded-lg border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Plazo (Meses):</label>
                    <input
                      type="number"
                      value={loanMonths}
                      onChange={(e) => setLoanMonths(Number(e.target.value))}
                      className={`w-full px-3 py-2 text-xs rounded-lg border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerateAmortization}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Insertar Tabla de Amortización en Nueva Hoja</span>
                </button>
              </div>
            )}

            {selectedAddon.actionType === 'ai_copilot' && (
              <div className={`p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  Copilot AI para Fórmulas y Automatización
                </h4>
                <p className="text-xs text-zinc-500">
                  Usa el botón Copilot AI en la pestaña de Fórmulas o en el Editor VBA para solicitar fórmulas y macros en lenguaje natural.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
