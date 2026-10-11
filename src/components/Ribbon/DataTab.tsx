import React from 'react';
import {
  FolderOpen,
  Filter,
  ArrowUpDown,
  CopySlash,
  Sparkles,
  Database,
  SplitSquareVertical,
  CheckCheck,
} from 'lucide-react';

interface DataTabProps {
  onOpenBackstage: () => void;
  onOpenAddonsModal: () => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  isDarkMode: boolean;
}

export const DataTab: React.FC<DataTabProps> = ({
  onOpenBackstage,
  onOpenAddonsModal,
  onSortAsc,
  onSortDesc,
  isDarkMode,
}) => {
  return (
    <div
      className={`h-24 px-3 py-1 flex items-center gap-3 overflow-x-auto border-b text-xs select-none ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-[#f9fbfd] border-slate-200 text-slate-800'
      }`}
    >
      {/* Get & Transform Data */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={onOpenBackstage}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Importar datos desde XLSX, XLSM, XLSB o CSV"
        >
          <Database className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] font-medium">Obtener Datos</span>
        </button>
      </div>

      {/* Sort & Filter */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={onSortAsc}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Ordenar de Menor a Mayor (A-Z)"
        >
          <ArrowUpDown className="w-5 h-5 text-blue-600" />
          <span className="text-[10px]">Ordenar A-Z</span>
        </button>

        <button
          onClick={onSortDesc}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Ordenar de Mayor a Menor (Z-A)"
        >
          <ArrowUpDown className="w-5 h-5 text-blue-600 rotate-180" />
          <span className="text-[10px]">Ordenar Z-A</span>
        </button>
      </div>

      {/* Data Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAddonsModal}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Depurar duplicados y limpiar datos"
        >
          <CopySlash className="w-5 h-5 text-rose-600" />
          <span className="text-[10px] font-medium">Quitar Duplicados</span>
        </button>

        <button
          onClick={onOpenAddonsModal}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Asistente de Limpieza de Datos Pro"
        >
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="text-[10px] font-medium">Limpieza de Datos</span>
        </button>
      </div>
    </div>
  );
};
