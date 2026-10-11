import React, { useRef, useState } from 'react';
import {
  FileSpreadsheet,
  FolderOpen,
  Save,
  Download,
  Cloud,
  Lock,
  History,
  Printer,
  Info,
  ArrowLeft,
  FileCode,
  FileText,
  Globe,
  FileType,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Share2,
  TrendingUp,
  Boxes,
  Receipt,
  Calculator,
  CalendarCheck,
  Search,
  ArrowRight,
} from 'lucide-react';
import { Workbook } from '../../types/spreadsheet';
import { SPREADSHEET_TEMPLATES, SpreadsheetTemplate } from '../../data/templates';
import {
  exportToHTML5,
  exportToPDF,
  exportToRTF,
  exportToTXT,
  exportToXLSB,
  exportToXLSM,
  exportToXLSX,
  importWorkbookFromFile,
} from '../../utils/fileIO';

interface FileBackstageProps {
  isOpen: boolean;
  onClose: () => void;
  workbook: Workbook;
  onUpdateWorkbook: (wb: Workbook) => void;
  onOpenDriveModal: () => void;
  onOpenEncryptionModal: () => void;
  onOpenVersionModal: () => void;
  onNewWorkbook: () => void;
  onSelectTemplate?: (wb: Workbook) => void;
  onSaveLocal: () => void;
  autosaveEnabled: boolean;
  onToggleAutosave: () => void;
  isDarkMode: boolean;
}

export const FileBackstageModal: React.FC<FileBackstageProps> = ({
  isOpen,
  onClose,
  workbook,
  onUpdateWorkbook,
  onOpenDriveModal,
  onOpenEncryptionModal,
  onOpenVersionModal,
  onNewWorkbook,
  onSelectTemplate,
  onSaveLocal,
  autosaveEnabled,
  onToggleAutosave,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    'info' | 'new' | 'open' | 'save' | 'export' | 'drive' | 'protect' | 'history'
  >('info');

  const [selectedTemplateCat, setSelectedTemplateCat] = useState<string>('Todos');
  const [templateSearch, setTemplateSearch] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importWorkbookFromFile(file);
      onUpdateWorkbook(imported);
      onClose();
    } catch (err: any) {
      alert(`Error al abrir archivo: ${err.message || 'Formato no soportado'}`);
    }
  };

  const handleTemplateClick = (tpl: SpreadsheetTemplate) => {
    const wb = tpl.createWorkbook();
    if (onSelectTemplate) {
      onSelectTemplate(wb);
    } else {
      onUpdateWorkbook(wb);
    }
    onClose();
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'Boxes':
        return <Boxes className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'Receipt':
        return <Receipt className="w-6 h-6 text-teal-600 dark:text-teal-400" />;
      case 'Calculator':
        return <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" />;
      case 'FileSpreadsheet':
      default:
        return <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const filteredTemplates = SPREADSHEET_TEMPLATES.filter((tpl) => {
    const matchesCat = selectedTemplateCat === 'Todos' || tpl.category === selectedTemplateCat;
    const matchesSearch =
      tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tpl.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className={`fixed inset-0 z-50 flex ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Left Sidebar navigation */}
      <div className="w-64 bg-[#107c41] text-white flex flex-col justify-between p-4 shadow-xl select-none">
        <div>
          {/* Back button */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-emerald-800/60 hover:bg-emerald-800 text-white font-medium text-sm transition-all"
            title="Volver a la hoja de cálculo"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la hoja</span>
          </button>

          <div className="px-3 mb-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
              <span>Excel Office Pro</span>
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1">Suite Ofimática Empresarial</p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'info' ? 'bg-white text-[#107c41] font-semibold shadow-sm' : 'text-emerald-50 hover:bg-emerald-800/50'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Información</span>
            </button>

            <button
              onClick={() => setActiveTab('new')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'new' ? 'bg-white text-[#107c41] font-semibold shadow-sm' : 'text-emerald-50 hover:bg-emerald-800/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Nuevo</span>
            </button>

            <button
              onClick={() => setActiveTab('open')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'open' ? 'bg-white text-[#107c41] font-semibold shadow-sm' : 'text-emerald-50 hover:bg-emerald-800/50'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Abrir (.xlsx, .xlsm, .xlsb)</span>
            </button>

            <button
              onClick={() => {
                onSaveLocal();
                setActiveTab('save');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'save' ? 'bg-white text-[#107c41] font-semibold shadow-sm' : 'text-emerald-50 hover:bg-emerald-800/50'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'export' ? 'bg-white text-[#107c41] font-semibold shadow-sm' : 'text-emerald-50 hover:bg-emerald-800/50'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDriveModal();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'drive' ? 'bg-white text-[#107c41] font-semibold shadow-sm' : 'text-emerald-50 hover:bg-emerald-800/50'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Google Drive Cloud</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenEncryptionModal();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'protect' ? 'bg-white text-[#107c41] font-semibold shadow-sm' : 'text-emerald-50 hover:bg-emerald-800/50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Cifrado & Contraseña</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenVersionModal();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history' ? 'bg-white text-[#107c41] font-semibold shadow-sm' : 'text-emerald-50 hover:bg-emerald-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historial de Versiones</span>
            </button>
          </nav>
        </div>

        <div className="text-xs text-emerald-200/70 border-t border-emerald-700/50 pt-3">
          <span>Excel Desktop Web Engine v4.8</span>
        </div>
      </div>

      {/* Main Backstage Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx,.xlsm,.xlsb,.xls,.csv,.tsv,.ods,.json"
          className="hidden"
        />

        {/* Tab 1: Info */}
        {activeTab === 'info' && (
          <div className="max-w-4xl space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold">{workbook.name}</h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Propiedades, estado de seguridad y permisos del documento activo
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Protect Card */}
              <div
                onClick={() => {
                  onClose();
                  onOpenEncryptionModal();
                }}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  workbook.metadata.isEncrypted
                    ? isDarkMode
                      ? 'bg-emerald-950/30 border-emerald-700'
                      : 'bg-emerald-50 border-emerald-300'
                    : isDarkMode
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${workbook.metadata.isEncrypted ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Proteger Documento</h3>
                    <span className="text-xs text-emerald-600 font-medium">
                      {workbook.metadata.isEncrypted ? 'Cifrado AES-256 Activo' : 'Sin Contraseña'}
                    </span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Cifrar datos sensibles con algoritmo criptográfico militar AES-GCM en el navegador.
                </p>
              </div>

              {/* Google Drive Sync Card */}
              <div
                onClick={() => {
                  onClose();
                  onOpenDriveModal();
                }}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  isDarkMode
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Google Drive Sync</h3>
                    <span className="text-xs text-blue-600 font-medium">Sincronización en la nube</span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Guarda, sincroniza y comparte libros de cálculo directamente con tu cuenta de Google.
                </p>
              </div>

              {/* Version History Card */}
              <div
                onClick={() => {
                  onClose();
                  onOpenVersionModal();
                }}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  isDarkMode
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-600 text-white">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Historial de Cambios</h3>
                    <span className="text-xs text-purple-600 font-medium">
                      {workbook.versions?.length || 0} instantáneas
                    </span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Restaura versiones previas y examina la línea de tiempo de modificaciones.
                </p>
              </div>
            </div>

            {/* Document Metadata Details */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Detalles del Libro
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div>
                  <span className={`block text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Hojas totales</span>
                  <span className="font-semibold text-base">{workbook.sheets.length} hojas</span>
                </div>
                <div>
                  <span className={`block text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Módulos VBA / Macros</span>
                  <span className="font-semibold text-base">{workbook.vbaModules?.length || 0} macros</span>
                </div>
                <div>
                  <span className={`block text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Última modificación</span>
                  <span className="font-semibold text-xs">
                    {new Date(workbook.metadata.updatedAt).toLocaleString('es-ES')}
                  </span>
                </div>
                <div>
                  <span className={`block text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Autor del documento</span>
                  <span className="font-semibold">{workbook.metadata.author}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: New with rich templates */}
        {activeTab === 'new' && (
          <div className="max-w-5xl space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold">Crear Nuevo Libro</h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Comienza desde un libro completamente en blanco o elige una plantilla prediseñada con fórmulas
              </p>
            </div>

            {/* Filters Bar */}
            <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['Todos', 'General', 'Finanzas', 'Gestión & Proyectos', 'Ventas & Facturación'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedTemplateCat(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedTemplateCat === cat
                        ? 'bg-[#107c41] text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar modelos..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border outline-hidden transition-all ${
                    isDarkMode
                      ? 'bg-zinc-800 border-zinc-700 focus:border-emerald-500 text-zinc-100'
                      : 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleTemplateClick(tpl)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg group ${
                    tpl.id === 'blank'
                      ? isDarkMode
                        ? 'bg-emerald-950/20 border-emerald-800 hover:border-emerald-500'
                        : 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500'
                      : isDarkMode
                      ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500'
                      : 'bg-white border-slate-200 hover:border-emerald-500 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`p-3 rounded-xl ${
                          isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {getTemplateIcon(tpl.iconName)}
                      </div>
                      {tpl.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tpl.badge === 'Popular'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : tpl.badge === 'Básico'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {tpl.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm mb-1.5 group-hover:text-emerald-600 transition-colors">
                      {tpl.name}
                    </h3>
                    <p className={`text-xs line-clamp-3 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {tpl.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>{tpl.id === 'blank' ? 'Crear vacío' : 'Usar plantilla'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Open */}
        {activeTab === 'open' && (
          <div className="max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold">Abrir Archivo de Hojas de Cálculo</h1>
            <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Soporte nativo completo para Microsoft Excel (.xlsx, .xlsm, .xlsb, .csv, .ods)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Local File Browser */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                  isDarkMode
                    ? 'border-zinc-700 hover:border-emerald-500 bg-zinc-900/50 hover:bg-zinc-900'
                    : 'border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 shadow-sm'
                }`}
              >
                <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mb-4">
                  <HardDrive className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-1">Examinar este equipo</h3>
                <p className={`text-xs max-w-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Haz clic para seleccionar archivos .xlsx, .xlsm (con macros), .xlsb (binario) o CSV.
                </p>
              </div>

              {/* Open from Google Drive */}
              <div
                onClick={() => {
                  onClose();
                  onOpenDriveModal();
                }}
                className={`p-8 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                  isDarkMode
                    ? 'border-zinc-800 hover:border-blue-500 bg-zinc-900 hover:bg-zinc-800/80'
                    : 'border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 shadow-sm'
                }`}
              >
                <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 mb-4">
                  <Cloud className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-1">Abrir desde Google Drive</h3>
                <p className={`text-xs max-w-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Carga documentos almacenados en tu nube de Google sincronizada.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Save */}
        {activeTab === 'save' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold">Documento Guardado</h1>
                <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Guardado en el almacenamiento local del navegador y en caché de alta velocidad.
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">Función de Autoguardado Continuo</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Guarda automáticamente cada celda, fórmula y cambio de estilo cada 3 segundos.
                  </p>
                </div>
                <button
                  onClick={onToggleAutosave}
                  className={`px-4 py-2 rounded-lg font-medium text-xs transition-colors ${
                    autosaveEnabled ? 'bg-emerald-600 text-white' : 'bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {autosaveEnabled ? 'Autoguardado: ACTIVADO' : 'Autoguardado: DESACTIVADO'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Export Multiformat */}
        {activeTab === 'export' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Exportar Documento</h1>
              <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Convierte y descarga el libro en múltiples formatos profesionales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {/* XLSX */}
              <div
                onClick={() => exportToXLSX(workbook)}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-500 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-600 text-white">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Libro de Excel (.xlsx)</h3>
                    <span className="text-xs text-emerald-600 font-medium">Estándar Office</span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Formato estándar OpenXML con fórmulas, hojas y formatos.
                </p>
              </div>

              {/* XLSM */}
              <div
                onClick={() => exportToXLSM(workbook)}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-amber-500' : 'bg-white border-slate-200 hover:border-amber-500 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-600 text-white">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Libro con Macros (.xlsm)</h3>
                    <span className="text-xs text-amber-600 font-medium">Habilitado para VBA</span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Conserva los scripts y módulos de Visual Basic para Aplicaciones.
                </p>
              </div>

              {/* XLSB */}
              <div
                onClick={() => exportToXLSB(workbook)}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-500 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Libro Binario (.xlsb)</h3>
                    <span className="text-xs text-blue-600 font-medium">Alto Rendimiento</span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Formato binario optimizado para grandes volúmenes de datos.
                </p>
              </div>

              {/* PDF */}
              <div
                onClick={() => exportToPDF(workbook)}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-red-500' : 'bg-white border-slate-200 hover:border-red-500 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-600 text-white">
                    <FileType className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Documento PDF (.pdf)</h3>
                    <span className="text-xs text-red-600 font-medium">Para impresión</span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Reporte maquetado en horizontal con encabezados y paginación nítida.
                </p>
              </div>

              {/* HTML5 */}
              <div
                onClick={() => exportToHTML5(workbook)}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-500 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Página Web (.html5)</h3>
                    <span className="text-xs text-indigo-600 font-medium">Web interactiva</span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Tabla autocontenida HTML con estilos modernos para compartir.
                </p>
              </div>

              {/* RTF Word */}
              <div
                onClick={() => exportToRTF(workbook)}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-cyan-500' : 'bg-white border-slate-200 hover:border-cyan-500 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-cyan-600 text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Documento Word (.rtf)</h3>
                    <span className="text-xs text-cyan-600 font-medium">Compatible con Word</span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Rich Text Format para edición directa en Microsoft Word o WordPad.
                </p>
              </div>

              {/* TXT */}
              <div
                onClick={() => exportToTXT(workbook)}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-500' : 'bg-white border-slate-200 hover:border-zinc-500 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-zinc-600 text-white">
                    <FileType className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Texto / CSV (.txt)</h3>
                    <span className="text-xs text-zinc-500 font-medium">Delimitado por tabulaciones</span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Texto plano estructurado para bases de datos o scripts.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
