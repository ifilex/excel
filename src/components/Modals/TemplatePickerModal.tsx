import React, { useState } from 'react';
import {
  FileSpreadsheet,
  TrendingUp,
  Boxes,
  Receipt,
  Calculator,
  CalendarCheck,
  Search,
  Sparkles,
  X,
  ArrowRight,
  Check,
} from 'lucide-react';
import { SPREADSHEET_TEMPLATES, SpreadsheetTemplate } from '../../data/templates';
import { Workbook } from '../../types/spreadsheet';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (wb: Workbook) => void;
  isDarkMode: boolean;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  isDarkMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = ['Todos', 'General', 'Finanzas', 'Gestión & Proyectos', 'Ventas & Facturación'];

  const filteredTemplates = SPREADSHEET_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'Todos' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />;
      case 'Boxes':
        return <Boxes className="w-7 h-7 text-blue-600 dark:text-blue-400" />;
      case 'Receipt':
        return <Receipt className="w-7 h-7 text-teal-600 dark:text-teal-400" />;
      case 'Calculator':
        return <Calculator className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-7 h-7 text-sky-600 dark:text-sky-400" />;
      case 'FileSpreadsheet':
      default:
        return <FileSpreadsheet className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const handleApply = (tpl: SpreadsheetTemplate) => {
    const newWb = tpl.createWorkbook();
    onSelectTemplate(newWb);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border overflow-hidden ${
          isDarkMode
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-inherit flex items-center justify-between bg-[#107c41] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Galería de Modelos y Plantillas</h2>
              <p className="text-xs text-emerald-100">
                Selecciona una plantilla prediseñada o inicia con un libro completamente en blanco
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Category Filters */}
        <div
          className={`p-4 border-b border-inherit flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDarkMode ? 'bg-zinc-950/40' : 'bg-slate-50'
          }`}
        >
          {/* Categories pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#107c41] text-white shadow-xs'
                    : isDarkMode
                    ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar modelos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border outline-hidden transition-all ${
                isDarkMode
                  ? 'bg-zinc-800 border-zinc-700 focus:border-emerald-500 text-zinc-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleApply(tpl)}
                className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg group ${
                  tpl.id === 'blank'
                    ? isDarkMode
                      ? 'bg-emerald-950/20 border-emerald-800 hover:border-emerald-500'
                      : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-500'
                    : isDarkMode
                    ? 'bg-zinc-800/60 border-zinc-700/80 hover:border-emerald-500'
                    : 'bg-white border-slate-200 hover:border-emerald-500 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-3 rounded-xl ${
                        isDarkMode ? 'bg-zinc-900 border border-zinc-700' : 'bg-slate-100 border border-slate-200'
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
                  <span>Usar modelo</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="py-12 text-center text-zinc-400">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No se encontraron modelos con ese criterio</p>
              <button
                onClick={() => {
                  setSelectedCategory('Todos');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs text-emerald-600 hover:underline"
              >
                Restablecer filtros
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t border-inherit flex items-center justify-between text-xs ${
            isDarkMode ? 'bg-zinc-950/60 text-zinc-400' : 'bg-slate-50 text-slate-500'
          }`}
        >
          <span>💡 Todos los modelos incluyen fórmulas dinámicas calculadas automáticamente.</span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border font-medium transition-colors ${
              isDarkMode
                ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-200'
                : 'border-slate-300 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
