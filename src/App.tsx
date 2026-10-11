import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RibbonHeader } from './components/Ribbon/RibbonHeader';
import { HomeTab } from './components/Ribbon/HomeTab';
import { InsertTab } from './components/Ribbon/InsertTab';
import { FormulasTab } from './components/Ribbon/FormulasTab';
import { DataTab } from './components/Ribbon/DataTab';
import { ReviewTab } from './components/Ribbon/ReviewTab';
import { ViewTab } from './components/Ribbon/ViewTab';
import { AutomateTab } from './components/Ribbon/AutomateTab';
import { CollabTab } from './components/Ribbon/CollabTab';
import { FormulaBar } from './components/FormulaBar/FormulaBar';
import { SpreadsheetGrid } from './components/Grid/SpreadsheetGrid';
import { SheetTabs } from './components/Tabs/SheetTabs';
import { StatusBar } from './components/StatusBar/StatusBar';

// Modals
import { FileBackstageModal } from './components/Modals/FileBackstageModal';
import { VbaEditorModal } from './components/Modals/VbaEditorModal';
import { GoogleDriveModal } from './components/Modals/GoogleDriveModal';
import { EncryptionModal } from './components/Modals/EncryptionModal';
import { AddonsModal } from './components/Modals/AddonsModal';
import { ChartModal } from './components/Modals/ChartModal';
import { FindReplaceModal } from './components/Modals/FindReplaceModal';
import { FunctionWizardModal } from './components/Modals/FunctionWizardModal';
import { TemplatePickerModal } from './components/Modals/TemplatePickerModal';

// Utilities & Data
import {
  Cell,
  CellFormat,
  CollaborationUser,
  RibbonTab,
  SelectionRange,
  Sheet,
  Workbook,
} from './types/spreadsheet';
import { createInitialWorkbook } from './data/initialWorkbook';
import {
  cellKey,
  coordsToAddress,
  expandRange,
} from './utils/cellUtils';
import { formulaEngine } from './utils/formulaEngine';
import { vbaEngine } from './utils/vbaEngine';
import {
  loadActiveWorkbook,
  saveActiveWorkbook,
  getAutosaveSetting,
  setAutosaveSetting,
  createVersionSnapshot,
} from './utils/storageUtils';
import { createDefaultSheet } from './utils/fileIO';

export default function App() {
  // 1. Core State
  const [workbook, setWorkbook] = useState<Workbook>(() => {
    const saved = loadActiveWorkbook();
    return saved || createInitialWorkbook();
  });

  const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTab>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('excel_dark_mode') === 'true';
  });

  // Undo / Redo history
  const [undoStack, setUndoStack] = useState<Workbook[]>([]);
  const [redoStack, setRedoStack] = useState<Workbook[]>([]);

  // Autosave
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(getAutosaveSetting);
  const [autosaveStatus, setAutosaveStatus] = useState<string>('Guardado');
  const lastSavedRef = useRef<number>(Date.now());

  // Macro Recording State
  const [isRecordingMacro, setIsRecordingMacro] = useState<boolean>(false);

  // Active Sheet & Selection
  const activeSheet =
    workbook.sheets.find((s) => s.id === workbook.activeSheetId) || workbook.sheets[0];
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({
    row: activeSheet?.selectedCell?.row ?? 0,
    col: activeSheet?.selectedCell?.col ?? 0,
  });
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    startRow: activeSheet?.selectionRange?.startRow ?? 0,
    startCol: activeSheet?.selectionRange?.startCol ?? 0,
    endRow: activeSheet?.selectionRange?.endRow ?? 0,
    endCol: activeSheet?.selectionRange?.endCol ?? 0,
  });

  // Inline & Formula Bar Editing State
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editingValue, setEditingValue] = useState('');

  // Active cell format
  const activeCellData = activeSheet ? activeSheet.data[cellKey(selectedCell.col, selectedCell.row)] : undefined;
  const currentFormat: CellFormat = activeCellData?.format || {};

  // Formula Bar value
  const formulaBarValue = activeCellData ? (activeCellData.formula || String(activeCellData.value ?? '')) : '';

  // 2. Modals state
  const [showBackstage, setShowBackstage] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showVbaEditor, setShowVbaEditor] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showFunctionWizard, setShowFunctionWizard] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // 3. Collaboration Peers
  const [isCollabActive, setIsCollabActive] = useState(false);
  const [collabUsers, setCollabUsers] = useState<CollaborationUser[]>([]);

  // Handle Dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('excel_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Push workbook state to Undo stack
  const recordHistory = useCallback(
    (newWb: Workbook) => {
      setUndoStack((prev) => [...prev.slice(-30), workbook]);
      setRedoStack([]);
      setWorkbook(newWb);
    },
    [workbook]
  );

  // Autosave interval
  useEffect(() => {
    if (!autosaveEnabled) return;
    const interval = setInterval(() => {
      saveActiveWorkbook(workbook);
      lastSavedRef.current = Date.now();
      setAutosaveStatus('Autoguardado');
    }, 4000);
    return () => clearInterval(interval);
  }, [workbook, autosaveEnabled]);

  // Periodic simulated cursor movements for team collaboration
  useEffect(() => {
    if (!isCollabActive) return;
    const interval = setInterval(() => {
      const demoCells = ['B5', 'C6', 'D7', 'E5', 'B8', 'F4', 'A4', 'C4'];
      setCollabUsers((prev) =>
        prev.map((u) => ({
          ...u,
          activeCell: demoCells[Math.floor(Math.random() * demoCells.length)],
        }))
      );
    }, 6000);
    return () => clearInterval(interval);
  }, [isCollabActive]);

  // Update Workbook Helper
  const handleUpdateWorkbook = (newWorkbook: Workbook, addToHistory = true) => {
    // Re-evaluate current active sheet
    const activeIdx = newWorkbook.sheets.findIndex((s) => s.id === newWorkbook.activeSheetId);
    if (activeIdx >= 0) {
      newWorkbook.sheets[activeIdx] = formulaEngine.evaluateSheet(
        newWorkbook.sheets[activeIdx],
        newWorkbook
      );
    }

    if (addToHistory) {
      recordHistory(newWorkbook);
    } else {
      setWorkbook(newWorkbook);
    }
  };

  // Undo / Redo Handlers
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, workbook]);
    setWorkbook(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, workbook]);
    setWorkbook(next);
  };

  // Cell Selection Handlers
  const handleSelectCell = (row: number, col: number, isRange = false) => {
    setSelectedCell({ row, col });
    if (!isRange) {
      setSelectionRange({ startRow: row, startCol: col, endRow: row, endCol: col });
    } else {
      setSelectionRange((prev) => ({ ...prev, endRow: row, endCol: col }));
    }

    const cell = activeSheet.data[cellKey(col, row)];
    const val = cell ? (cell.formula || String(cell.value ?? '')) : '';
    setEditingValue(val);
  };

  // Cell Value Update
  const handleUpdateCellValue = (
    row: number,
    col: number,
    value: string,
    isFormula = false
  ) => {
    const key = cellKey(col, row);
    const prevCell = activeSheet.data[key] || { value: '' };

    let parsedVal: any = value;
    let formulaStr: string | undefined = undefined;

    if (isFormula || value.startsWith('=')) {
      formulaStr = value;
      parsedVal = null;
    } else if (value !== '' && !isNaN(Number(value))) {
      parsedVal = Number(value);
    }

    const updatedCell: Cell = {
      ...prevCell,
      value: parsedVal,
      formula: formulaStr,
      displayValue: formulaStr ? '' : String(parsedVal),
    };

    const newSheet = {
      ...activeSheet,
      data: {
        ...activeSheet.data,
        [key]: updatedCell,
      },
    };

    // If recording macro, register action in VBA engine
    if (isRecordingMacro) {
      vbaEngine.recordAction({
        type: 'SET_VALUE',
        target: coordsToAddress(col, row),
        params: { value },
      });
    }

    const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
    handleUpdateWorkbook({ ...workbook, sheets: updatedSheets });
  };

  // Apply Cell Format
  const handleApplyFormat = (format: Partial<CellFormat>) => {
    const minR = Math.min(selectionRange.startRow, selectionRange.endRow);
    const maxR = Math.max(selectionRange.startRow, selectionRange.endRow);
    const minC = Math.min(selectionRange.startCol, selectionRange.endCol);
    const maxC = Math.max(selectionRange.startCol, selectionRange.endCol);

    const newSheet = { ...activeSheet, data: { ...activeSheet.data } };

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const key = cellKey(c, r);
        const cell = newSheet.data[key] || { value: '' };
        newSheet.data[key] = {
          ...cell,
          format: {
            ...cell.format,
            ...format,
          },
        };
      }
    }

    if (isRecordingMacro) {
      vbaEngine.recordAction({
        type: 'SET_FORMAT',
        target: `${coordsToAddress(minC, minR)}:${coordsToAddress(maxC, maxR)}`,
        params: format,
      });
    }

    const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
    handleUpdateWorkbook({ ...workbook, sheets: updatedSheets });
  };

  // AutoSum on Selection
  const handleAutoSum = () => {
    const minR = Math.min(selectionRange.startRow, selectionRange.endRow);
    const maxR = Math.max(selectionRange.startRow, selectionRange.endRow);
    const minC = Math.min(selectionRange.startCol, selectionRange.endCol);
    const maxC = Math.max(selectionRange.startCol, selectionRange.endCol);

    const targetRow = maxR + 1;
    for (let c = minC; c <= maxC; c++) {
      const formula = `=SUM(${coordsToAddress(c, minR)}:${coordsToAddress(c, maxR)})`;
      handleUpdateCellValue(targetRow, c, formula, true);
    }
  };

  // Insert / Delete Rows & Columns
  const handleInsertRow = () => {
    const minR = Math.min(selectionRange.startRow, selectionRange.endRow);
    const newSheet = { ...activeSheet, data: { ...activeSheet.data } };
    const updatedData: Record<string, Cell> = {};

    for (const key of Object.keys(newSheet.data)) {
      const [c, r] = key.split(',').map(Number);
      if (r >= minR) {
        updatedData[cellKey(c, r + 1)] = newSheet.data[key];
      } else {
        updatedData[key] = newSheet.data[key];
      }
    }
    newSheet.data = updatedData;
    const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
    handleUpdateWorkbook({ ...workbook, sheets: updatedSheets });
  };

  const handleInsertCol = () => {
    const minC = Math.min(selectionRange.startCol, selectionRange.endCol);
    const newSheet = { ...activeSheet, data: { ...activeSheet.data } };
    const updatedData: Record<string, Cell> = {};

    for (const key of Object.keys(newSheet.data)) {
      const [c, r] = key.split(',').map(Number);
      if (c >= minC) {
        updatedData[cellKey(c + 1, r)] = newSheet.data[key];
      } else {
        updatedData[key] = newSheet.data[key];
      }
    }
    newSheet.data = updatedData;
    const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
    handleUpdateWorkbook({ ...workbook, sheets: updatedSheets });
  };

  const handleDeleteRow = () => {
    const minR = Math.min(selectionRange.startRow, selectionRange.endRow);
    const newSheet = { ...activeSheet, data: { ...activeSheet.data } };
    const updatedData: Record<string, Cell> = {};

    for (const key of Object.keys(newSheet.data)) {
      const [c, r] = key.split(',').map(Number);
      if (r === minR) continue;
      if (r > minR) {
        updatedData[cellKey(c, r - 1)] = newSheet.data[key];
      } else {
        updatedData[key] = newSheet.data[key];
      }
    }
    newSheet.data = updatedData;
    const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
    handleUpdateWorkbook({ ...workbook, sheets: updatedSheets });
  };

  const handleDeleteCol = () => {
    const minC = Math.min(selectionRange.startCol, selectionRange.endCol);
    const newSheet = { ...activeSheet, data: { ...activeSheet.data } };
    const updatedData: Record<string, Cell> = {};

    for (const key of Object.keys(newSheet.data)) {
      const [c, r] = key.split(',').map(Number);
      if (c === minC) continue;
      if (c > minC) {
        updatedData[cellKey(c - 1, r)] = newSheet.data[key];
      } else {
        updatedData[key] = newSheet.data[key];
      }
    }
    newSheet.data = updatedData;
    const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
    handleUpdateWorkbook({ ...workbook, sheets: updatedSheets });
  };

  const handleClearCells = () => {
    const minR = Math.min(selectionRange.startRow, selectionRange.endRow);
    const maxR = Math.max(selectionRange.startRow, selectionRange.endRow);
    const minC = Math.min(selectionRange.startCol, selectionRange.endCol);
    const maxC = Math.max(selectionRange.startCol, selectionRange.endCol);

    const newSheet = { ...activeSheet, data: { ...activeSheet.data } };
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        delete newSheet.data[cellKey(c, r)];
      }
    }
    const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
    handleUpdateWorkbook({ ...workbook, sheets: updatedSheets });
  };

  // Sort Ascending / Descending
  const handleSort = (ascending = true) => {
    const minR = Math.min(selectionRange.startRow, selectionRange.endRow);
    const maxR = Math.max(selectionRange.startRow, selectionRange.endRow);
    const col = selectedCell.col;

    const rowIndices = Array.from({ length: maxR - minR + 1 }, (_, i) => minR + i);
    rowIndices.sort((a, b) => {
      const valA = activeSheet.data[cellKey(col, a)]?.value ?? '';
      const valB = activeSheet.data[cellKey(col, b)]?.value ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return ascending ? valA - valB : valB - valA;
      }
      return ascending
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    const newSheet = { ...activeSheet, data: { ...activeSheet.data } };
    const originalRowsData: Record<number, Record<number, Cell>> = {};

    rowIndices.forEach((origR) => {
      originalRowsData[origR] = {};
      for (let c = 0; c < 26; c++) {
        if (newSheet.data[cellKey(c, origR)]) {
          originalRowsData[origR][c] = { ...newSheet.data[cellKey(c, origR)] };
        }
      }
    });

    rowIndices.forEach((sourceR, idx) => {
      const targetR = minR + idx;
      for (let c = 0; c < 26; c++) {
        if (originalRowsData[sourceR]?.[c]) {
          newSheet.data[cellKey(c, targetR)] = originalRowsData[sourceR][c];
        } else {
          delete newSheet.data[cellKey(c, targetR)];
        }
      }
    });

    const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
    handleUpdateWorkbook({ ...workbook, sheets: updatedSheets });
  };

  // Format Table Style
  const handleInsertTable = () => {
    const minR = Math.min(selectionRange.startRow, selectionRange.endRow);
    const maxR = Math.max(selectionRange.startRow, selectionRange.endRow);
    const minC = Math.min(selectionRange.startCol, selectionRange.endCol);
    const maxC = Math.max(selectionRange.startCol, selectionRange.endCol);

    const newSheet = { ...activeSheet, data: { ...activeSheet.data } };

    // Format header
    for (let c = minC; c <= maxC; c++) {
      const key = cellKey(c, minR);
      const cell = newSheet.data[key] || { value: `Columna ${c + 1}` };
      newSheet.data[key] = {
        ...cell,
        format: { bold: true, bgColor: '#107c41', textColor: '#ffffff', align: 'center' },
      };
    }

    // Zebra stripes for data rows
    for (let r = minR + 1; r <= maxR; r++) {
      const isEven = (r - minR) % 2 === 0;
      for (let c = minC; c <= maxC; c++) {
        const key = cellKey(c, r);
        const cell = newSheet.data[key] || { value: '' };
        newSheet.data[key] = {
          ...cell,
          format: {
            ...cell.format,
            bgColor: isEven ? '#f8fafc' : '#ffffff',
          },
        };
      }
    }

    const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
    handleUpdateWorkbook({ ...workbook, sheets: updatedSheets });
  };

  // Macro Recording Control
  const handleStartRecordMacro = () => {
    vbaEngine.startRecording('MacroGrabada');
    setIsRecordingMacro(true);
  };

  const handleStopRecordMacro = () => {
    const code = vbaEngine.stopRecording();
    setIsRecordingMacro(false);
    const newMod = {
      id: `vba-rec-${Date.now()}`,
      name: `MacroGrabada_${(workbook.vbaModules?.length || 0) + 1}`,
      code,
      isMacroEnabled: true,
    };
    const updatedModules = [...(workbook.vbaModules || []), newMod];
    handleUpdateWorkbook({ ...workbook, vbaModules: updatedModules });
    alert('Grabación de macro finalizada con éxito. Código guardado en el módulo VBA.');
  };

  const handleRunMacroDirect = (code: string) => {
    const result = vbaEngine.executeVba(code, workbook);
    if (result.success && result.updatedWorkbook) {
      handleUpdateWorkbook(result.updatedWorkbook);
      if (result.messages?.length) {
        alert(result.messages.join('\n'));
      }
    } else {
      alert(`Error en VBA: ${result.error || 'No se pudo ejecutar la macro'}`);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveActiveWorkbook(workbook);
        setAutosaveStatus('Guardado');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleApplyFormat({ bold: !currentFormat.bold });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        handleApplyFormat({ italic: !currentFormat.italic });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        handleApplyFormat({ underline: !currentFormat.underline });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      } else if (e.altKey && e.key === 'F11') {
        e.preventDefault();
        setShowVbaEditor(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  });

  return (
    <div
      id="excel-app-root"
      className={`w-screen h-screen flex flex-col overflow-hidden font-sans select-none transition-colors ${
        isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* 1. Ribbon Header & Quick Access */}
      <RibbonHeader
        activeTab={activeRibbonTab}
        onSelectTab={setActiveRibbonTab}
        workbook={workbook}
        onUpdateWorkbookName={(name) => handleUpdateWorkbook({ ...workbook, name })}
        onSave={() => {
          saveActiveWorkbook(workbook);
          setAutosaveStatus('Guardado');
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        autosaveEnabled={autosaveEnabled}
        onToggleAutosave={() => {
          const next = !autosaveEnabled;
          setAutosaveEnabled(next);
          setAutosaveSetting(next);
        }}
        autosaveStatus={autosaveStatus}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenBackstage={() => setShowBackstage(true)}
        onOpenTemplatePicker={() => setShowTemplatePicker(true)}
        onOpenDriveModal={() => setShowDriveModal(true)}
        onOpenEncryptionModal={() => setShowEncryptionModal(true)}
        activeCollabUsers={collabUsers.length + 1}
      />

      {/* 2. Ribbon Tabs Content */}
      <div className="shrink-0">
        {activeRibbonTab === 'home' && (
          <HomeTab
            currentFormat={currentFormat}
            onApplyFormat={handleApplyFormat}
            onAutoSum={handleAutoSum}
            onInsertRow={handleInsertRow}
            onInsertCol={handleInsertCol}
            onDeleteRow={handleDeleteRow}
            onDeleteCol={handleDeleteCol}
            onClearCells={handleClearCells}
            onSortAsc={() => handleSort(true)}
            onSortDesc={() => handleSort(false)}
            onOpenFindReplace={() => setShowFindReplace(true)}
            onMergeCells={() => handleApplyFormat({ align: 'center' })}
            isDarkMode={isDarkMode}
          />
        )}
        {activeRibbonTab === 'insert' && (
          <InsertTab
            onOpenChartModal={() => setShowChartModal(true)}
            onOpenAddonsModal={() => setShowAddonsModal(true)}
            onInsertTable={handleInsertTable}
            isDarkMode={isDarkMode}
          />
        )}
        {activeRibbonTab === 'formulas' && (
          <FormulasTab
            onAutoSum={handleAutoSum}
            onOpenFunctionWizard={() => setShowFunctionWizard(true)}
            onInsertFormula={(f) => {
              handleUpdateCellValue(selectedCell.row, selectedCell.col, f, true);
            }}
            isDarkMode={isDarkMode}
          />
        )}
        {activeRibbonTab === 'data' && (
          <DataTab
            onOpenBackstage={() => setShowBackstage(true)}
            onOpenAddonsModal={() => setShowAddonsModal(true)}
            onSortAsc={() => handleSort(true)}
            onSortDesc={() => handleSort(false)}
            isDarkMode={isDarkMode}
          />
        )}
        {activeRibbonTab === 'review' && (
          <ReviewTab
            workbook={workbook}
            onOpenEncryptionModal={() => setShowEncryptionModal(true)}
            onOpenVersionModal={() => setShowVersionHistory(true)}
            isDarkMode={isDarkMode}
          />
        )}
        {activeRibbonTab === 'view' && (
          <ViewTab
            sheet={activeSheet}
            onUpdateSheet={(s) => {
              const updated = workbook.sheets.map((sh) => (sh.id === s.id ? s : sh));
              handleUpdateWorkbook({ ...workbook, sheets: updated }, false);
            }}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        )}
        {activeRibbonTab === 'automate' && (
          <AutomateTab
            workbook={workbook}
            onOpenVbaEditor={() => setShowVbaEditor(true)}
            onOpenAddonsModal={() => setShowAddonsModal(true)}
            isRecordingMacro={isRecordingMacro}
            onStartRecordMacro={handleStartRecordMacro}
            onStopRecordMacro={handleStopRecordMacro}
            onRunMacro={handleRunMacroDirect}
            isDarkMode={isDarkMode}
          />
        )}
        {activeRibbonTab === 'addons' && (
          <div
            className={`h-24 px-4 flex items-center justify-between border-b ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-xs">
              <span className="font-bold block text-sm text-emerald-600">Catálogo de Complementos Office</span>
              <span className="text-zinc-500">Herramientas de automatización, Word Bridge, Amortización y Limpieza de datos.</span>
            </div>
            <button
              onClick={() => setShowAddonsModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
            >
              Abrir Gestor de Complementos
            </button>
          </div>
        )}
        {activeRibbonTab === 'collab' && (
          <CollabTab
            activeUsers={collabUsers}
            onToggleCollab={() => setIsCollabActive(!isCollabActive)}
            isCollabActive={isCollabActive}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* 3. Formula Bar */}
      <FormulaBar
        sheet={activeSheet}
        activeRow={selectedCell.row}
        activeCol={selectedCell.col}
        currentValue={editingValue || formulaBarValue}
        onChangeValue={(val) => setEditingValue(val)}
        onSubmitValue={() => {
          handleUpdateCellValue(selectedCell.row, selectedCell.col, editingValue, editingValue.startsWith('='));
        }}
        onCancelValue={() => {
          setEditingValue(formulaBarValue);
          setIsEditingInline(false);
        }}
        onJumpToCell={(r, c) => handleSelectCell(r, c, false)}
        onOpenFunctionWizard={() => setShowFunctionWizard(true)}
        isDarkMode={isDarkMode}
      />

      {/* 4. Spreadsheet Grid */}
      <SpreadsheetGrid
        sheet={activeSheet}
        selectedCell={selectedCell}
        selectionRange={selectionRange}
        onSelectCell={handleSelectCell}
        onUpdateCellValue={handleUpdateCellValue}
        onUpdateColumnWidth={(c, w) => {
          const newSheet = {
            ...activeSheet,
            colWidths: { ...activeSheet.colWidths, [c]: w },
          };
          const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
          handleUpdateWorkbook({ ...workbook, sheets: updatedSheets }, false);
        }}
        onUpdateRowHeight={(r, h) => {
          const newSheet = {
            ...activeSheet,
            rowHeights: { ...activeSheet.rowHeights, [r]: h },
          };
          const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
          handleUpdateWorkbook({ ...workbook, sheets: updatedSheets }, false);
        }}
        onDeleteChart={(chartId) => {
          const newSheet = {
            ...activeSheet,
            charts: (activeSheet.charts || []).filter((ch) => ch.id !== chartId),
          };
          const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
          handleUpdateWorkbook({ ...workbook, sheets: updatedSheets });
        }}
        onMoveChart={(chartId, x, y) => {
          const newSheet = {
            ...activeSheet,
            charts: (activeSheet.charts || []).map((ch) =>
              ch.id === chartId ? { ...ch, position: { ...ch.position, x, y, width: ch.position?.width || 520, height: ch.position?.height || 260 } } : ch
            ),
          };
          const updatedSheets = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
          handleUpdateWorkbook({ ...workbook, sheets: updatedSheets }, false);
        }}
        collabUsers={collabUsers}
        isDarkMode={isDarkMode}
        isEditingInline={isEditingInline}
        setIsEditingInline={setIsEditingInline}
        editingValue={editingValue}
        setEditingValue={setEditingValue}
      />

      {/* 5. Sheet Tabs Bar */}
      <SheetTabs
        sheets={workbook.sheets}
        activeSheetId={workbook.activeSheetId}
        onSelectSheet={(id) => handleUpdateWorkbook({ ...workbook, activeSheetId: id }, false)}
        onAddSheet={() => {
          const newS = createDefaultSheet(`Hoja ${(workbook.sheets.length || 0) + 1}`);
          handleUpdateWorkbook({
            ...workbook,
            sheets: [...workbook.sheets, newS],
            activeSheetId: newS.id,
          });
        }}
        onRenameSheet={(id, name) => {
          const updated = workbook.sheets.map((s) => (s.id === id ? { ...s, name } : s));
          handleUpdateWorkbook({ ...workbook, sheets: updated });
        }}
        onDuplicateSheet={(id) => {
          const target = workbook.sheets.find((s) => s.id === id);
          if (!target) return;
          const dup: Sheet = {
            ...target,
            id: `sheet-${Date.now()}`,
            name: `${target.name} (Copia)`,
            data: JSON.parse(JSON.stringify(target.data)),
          };
          handleUpdateWorkbook({
            ...workbook,
            sheets: [...workbook.sheets, dup],
            activeSheetId: dup.id,
          });
        }}
        onDeleteSheet={(id) => {
          if (workbook.sheets.length <= 1) return;
          const remaining = workbook.sheets.filter((s) => s.id !== id);
          handleUpdateWorkbook({
            ...workbook,
            sheets: remaining,
            activeSheetId: remaining[0].id,
          });
        }}
        onChangeTabColor={(id, color) => {
          const updated = workbook.sheets.map((s) => (s.id === id ? { ...s, tabColor: color } : s));
          handleUpdateWorkbook({ ...workbook, sheets: updated });
        }}
        isDarkMode={isDarkMode}
      />

      {/* 6. Status Bar */}
      <StatusBar
        sheet={activeSheet}
        selectionRange={selectionRange}
        isEditing={isEditingInline}
        isRecordingMacro={isRecordingMacro}
        autosaveStatus={autosaveStatus}
        isEncrypted={!!workbook.metadata?.isEncrypted}
        onUpdateZoom={(zoom) => {
          const newSheet = { ...activeSheet, zoom };
          const updated = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
          handleUpdateWorkbook({ ...workbook, sheets: updated }, false);
        }}
        isDarkMode={isDarkMode}
      />

      {/* --- ALL SYSTEM MODALS --- */}
      <FileBackstageModal
        isOpen={showBackstage}
        onClose={() => setShowBackstage(false)}
        workbook={workbook}
        onUpdateWorkbook={handleUpdateWorkbook}
        onOpenDriveModal={() => setShowDriveModal(true)}
        onOpenEncryptionModal={() => setShowEncryptionModal(true)}
        onOpenVersionModal={() => setShowVersionHistory(true)}
        onNewWorkbook={() => {
          const newWb = createInitialWorkbook();
          newWb.name = 'Libro Nuevo';
          handleUpdateWorkbook(newWb);
        }}
        onSelectTemplate={(newWb) => {
          handleUpdateWorkbook(newWb);
        }}
        onSaveLocal={() => {
          saveActiveWorkbook(workbook);
          setAutosaveStatus('Guardado');
        }}
        autosaveEnabled={autosaveEnabled}
        onToggleAutosave={() => {
          const next = !autosaveEnabled;
          setAutosaveEnabled(next);
          setAutosaveSetting(next);
        }}
        isDarkMode={isDarkMode}
      />

      <TemplatePickerModal
        isOpen={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelectTemplate={(newWb) => {
          handleUpdateWorkbook(newWb);
        }}
        isDarkMode={isDarkMode}
      />

      <VbaEditorModal
        isOpen={showVbaEditor}
        onClose={() => setShowVbaEditor(false)}
        workbook={workbook}
        onUpdateWorkbook={handleUpdateWorkbook}
        isRecordingMacro={isRecordingMacro}
        onStartRecordMacro={handleStartRecordMacro}
        onStopRecordMacro={handleStopRecordMacro}
        isDarkMode={isDarkMode}
      />

      <GoogleDriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        workbook={workbook}
        onUpdateWorkbook={handleUpdateWorkbook}
        isDarkMode={isDarkMode}
      />

      <EncryptionModal
        isOpen={showEncryptionModal}
        onClose={() => setShowEncryptionModal(false)}
        workbook={workbook}
        onUpdateWorkbook={handleUpdateWorkbook}
        isDarkMode={isDarkMode}
      />

      <AddonsModal
        isOpen={showAddonsModal}
        onClose={() => setShowAddonsModal(false)}
        workbook={workbook}
        onUpdateWorkbook={handleUpdateWorkbook}
        isDarkMode={isDarkMode}
      />

      <ChartModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        sheet={activeSheet}
        onAddChart={(newChart) => {
          const newSheet = {
            ...activeSheet,
            charts: [...(activeSheet.charts || []), newChart],
          };
          const updated = workbook.sheets.map((s) => (s.id === activeSheet.id ? newSheet : s));
          handleUpdateWorkbook({ ...workbook, sheets: updated });
        }}
        isDarkMode={isDarkMode}
      />

      <FindReplaceModal
        isOpen={showFindReplace}
        onClose={() => setShowFindReplace(false)}
        workbook={workbook}
        onUpdateWorkbook={handleUpdateWorkbook}
        onSelectCell={(r, c) => handleSelectCell(r, c, false)}
        isDarkMode={isDarkMode}
      />

      <FunctionWizardModal
        isOpen={showFunctionWizard}
        onClose={() => setShowFunctionWizard(false)}
        onSelectFormula={(f) => {
          handleUpdateCellValue(selectedCell.row, selectedCell.col, f, true);
        }}
        isDarkMode={isDarkMode}
      />

      {/* Version History Modal */}
      {showVersionHistory && (
        <FileBackstageModal
          isOpen={true}
          onClose={() => setShowVersionHistory(false)}
          workbook={workbook}
          onUpdateWorkbook={handleUpdateWorkbook}
          onOpenDriveModal={() => setShowDriveModal(true)}
          onOpenEncryptionModal={() => setShowEncryptionModal(true)}
          onOpenVersionModal={() => {}}
          onNewWorkbook={() => {}}
          onSaveLocal={() => {}}
          autosaveEnabled={autosaveEnabled}
          onToggleAutosave={() => {}}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
