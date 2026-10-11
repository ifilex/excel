import React from 'react';
import {
  Save,
  Undo2,
  Redo2,
  Moon,
  Sun,
  Cloud,
  Lock,
  Users,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { RibbonTab, Workbook } from '../../types/spreadsheet';

interface RibbonHeaderProps {
  activeTab: RibbonTab;
  onSelectTab: (tab: RibbonTab) => void;
  workbook: Workbook;
  onUpdateWorkbookName: (name: string) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autosaveEnabled: boolean;
  onToggleAutosave: () => void;
  autosaveStatus: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBackstage: () => void;
  onOpenTemplatePicker?: () => void;
  onOpenDriveModal: () => void;
  onOpenEncryptionModal: () => void;
  activeCollabUsers: number;
}

export const RibbonHeader: React.FC<RibbonHeaderProps> = ({
  activeTab,
  onSelectTab,
  workbook,
  onUpdateWorkbookName,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  autosaveEnabled,
  onToggleAutosave,
  autosaveStatus,
  isDarkMode,
  onToggleDarkMode,
  onOpenBackstage,
  onOpenTemplatePicker,
  onOpenDriveModal,
  onOpenEncryptionModal,
  activeCollabUsers,
}) => {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(workbook.name);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    setTitleInput(workbook.name);
  }, [workbook.name]);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onUpdateWorkbookName(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const tabs: { id: RibbonTab; label: string }[] = [
    { id: 'home', label: 'Inicio' },
    { id: 'insert', label: 'Insertar' },
    { id: 'formulas', label: 'Fórmulas' },
    { id: 'data', label: 'Datos' },
    { id: 'review', label: 'Revisar' },
    { id: 'view', label: 'Vista' },
    { id: 'automate', label: 'Automatizar & VBA' },
    { id: 'addons', label: 'Complementos' },
    { id: 'collab', label: 'Colaboración' },
  ];

  return (
    <header
      className={`border-b select-none transition-colors ${
        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Top Bar: Title, Quick Access & Global Controls */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-inherit text-xs">
        {/* Left: Quick Access Toolbar */}
        <div className="flex items-center gap-2">
          {/* Backstage Button (Classic Green Office Ribbon) */}
          <button
            onClick={onOpenBackstage}
            className="px-3.5 py-1 rounded bg-[#107c41] hover:bg-emerald-700 text-white font-bold tracking-wide text-xs shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Archivo</span>
          </button>

          {/* New Templates Gallery Button */}
          {onOpenTemplatePicker && (
            <button
              onClick={onOpenTemplatePicker}
              className="px-2.5 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition-colors flex items-center gap-1 border border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30"
              title="Explorar y cargar modelos de plantillas prediseñadas"
            >
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Plantillas</span>
            </button>
          )}

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

          {/* Quick Save */}
          <button
            onClick={onSave}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors text-emerald-600 dark:text-emerald-400"
            title="Guardar localmente (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          {/* Undo / Redo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 rounded transition-colors"
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 rounded transition-colors"
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

          {/* Autosave Toggle & Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={onToggleAutosave}
              className={`w-7 h-3.5 rounded-full p-0.5 transition-colors ${
                autosaveEnabled ? 'bg-emerald-600' : 'bg-zinc-400 dark:bg-zinc-600'
              }`}
              title="Alternar autoguardado continuo"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${
                  autosaveEnabled ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Autoguardado {autosaveEnabled ? 'ON' : 'OFF'}
            </span>
          </div>

          <span className="text-[10px] text-zinc-400 hidden sm:inline-block truncate max-w-[140px]">
            {autosaveStatus}
          </span>
        </div>

        {/* Center: Workbook Title Editable */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="font-semibold text-xs px-2 py-0.5 border rounded border-emerald-500 outline-hidden bg-white dark:bg-zinc-900"
            />
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="font-semibold text-xs px-2 py-0.5 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 cursor-pointer flex items-center gap-1.5"
              title="Haga clic para renombrar el libro"
            >
              <span>{workbook.name}</span>
              <span className="text-[10px] text-zinc-400">.xlsx</span>
            </div>
          )}

          {/* Encryption Badge */}
          {workbook.metadata?.isEncrypted ? (
            <button
              onClick={onOpenEncryptionModal}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold"
              title="Documento protegido con cifrado AES-256"
            >
              <Lock className="w-3 h-3" />
              <span>Cifrado AES</span>
            </button>
          ) : null}
        </div>

        {/* Right: Cloud, Collab, Dark Mode, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Google Drive Status Button */}
          <button
            onClick={onOpenDriveModal}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 transition-colors"
            title="Google Drive Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden md:inline">Drive</span>
          </button>

          {/* Active Collaborators Presence */}
          <div
            onClick={() => onSelectTab('collab')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer text-purple-600 dark:text-purple-400"
            title={`${activeCollabUsers} usuarios colaborando en tiempo real`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{activeCollabUsers}</span>
          </div>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

          {/* Dark / Light Mode Toggle (Anti-fatiga visual) */}
          <button
            onClick={onToggleDarkMode}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
              isDarkMode
                ? 'bg-zinc-800 text-amber-300 hover:bg-zinc-700'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
            title={isDarkMode ? 'Cambiar a Modo Claro' : 'Activar Modo Oscuro (Reduce la fatiga visual)'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
            <span className="text-[11px] font-medium hidden lg:inline">
              {isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}
            </span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
            title="Pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tabs Strip (Office Fluent Navigation) */}
      <div className="flex items-center px-2 pt-1 gap-0.5 overflow-x-auto text-xs font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`px-3 py-1.5 rounded-t-md transition-all relative ${
              activeTab === tab.id
                ? 'font-bold text-[#107c41] dark:text-emerald-400 border-b-2 border-[#107c41] dark:border-emerald-400 bg-zinc-100/80 dark:bg-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
