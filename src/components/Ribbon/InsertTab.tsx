import React from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Table,
  Sparkles,
  Link,
  MessageSquare,
  FileSpreadsheet,
  Layers,
  Shapes,
} from 'lucide-react';

interface InsertTabProps {
  onOpenChartModal: () => void;
  onOpenAddonsModal: () => void;
  onInsertTable: () => void;
  isDarkMode: boolean;
}

export const InsertTab: React.FC<InsertTabProps> = ({
  onOpenChartModal,
  onOpenAddonsModal,
  onInsertTable,
  isDarkMode,
}) => {
  return (
    <div
      className={`h-24 px-3 py-1 flex items-center gap-3 overflow-x-auto border-b text-xs select-none ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-[#f9fbfd] border-slate-200 text-slate-800'
      }`}
    >
      {/* Tables Group */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={onInsertTable}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Convertir rango seleccionado en Tabla con estilo"
        >
          <Table className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] font-medium">Tabla</span>
        </button>

        <button
          onClick={onOpenAddonsModal}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Generador de Tablas Dinámicas (Pivot Tables)"
        >
          <Layers className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] font-medium">Tabla Dinámica</span>
        </button>
      </div>

      {/* Charts Group */}
      <div className="flex items-center gap-1.5 pr-3 border-r border-inherit">
        <button
          onClick={onOpenChartModal}
          className="p-2 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex flex-col items-center gap-1 transition-colors"
          title="Insertar Gráficos de Columnas, Líneas, Circular o Área"
        >
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] font-bold">Gráfico Excel</span>
        </button>

        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={onOpenChartModal}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center gap-1 text-[10px]"
          >
            <LineChart className="w-3.5 h-3.5 text-blue-600" />
            <span>Líneas</span>
          </button>
          <button
            onClick={onOpenChartModal}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center gap-1 text-[10px]"
          >
            <PieChart className="w-3.5 h-3.5 text-amber-600" />
            <span>Circular</span>
          </button>
          <button
            onClick={onOpenChartModal}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center gap-1 text-[10px]"
          >
            <AreaChart className="w-3.5 h-3.5 text-purple-600" />
            <span>Áreas</span>
          </button>
          <button
            onClick={onOpenChartModal}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center gap-1 text-[10px]"
          >
            <Shapes className="w-3.5 h-3.5 text-rose-600" />
            <span>Barras</span>
          </button>
        </div>
      </div>

      {/* AI Smart Automation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAddonsModal}
          className="p-2 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex flex-col items-center gap-1 hover:scale-[1.02] transition-transform"
        >
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="text-[10px] font-bold">Word Report Bridge</span>
        </button>
      </div>
    </div>
  );
};
