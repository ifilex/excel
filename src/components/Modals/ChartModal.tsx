import React, { useState } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLine,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartConfig, Sheet } from '../../types/spreadsheet';
import { addressToCoords, cellKey, coordsToAddress, expandRange } from '../../utils/cellUtils';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: Sheet;
  onAddChart: (chart: ChartConfig) => void;
  isDarkMode: boolean;
}

const COLORS = ['#107c41', '#2563eb', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4'];

export const ChartModal: React.FC<ChartModalProps> = ({
  isOpen,
  onClose,
  sheet,
  onAddChart,
  isDarkMode,
}) => {
  const [title, setTitle] = useState('Gráfico de Análisis de Datos');
  const [chartType, setChartType] = useState<'column' | 'bar' | 'line' | 'pie' | 'area'>('column');
  const [dataRange, setDataRange] = useState('A4:C8');

  if (!isOpen) return null;

  // Extract preview data from sheet based on dataRange
  const extractChartData = () => {
    try {
      const parts = dataRange.split(':');
      const start = addressToCoords(parts[0]);
      const end = addressToCoords(parts[1] || parts[0]);
      if (!start || !end) return [];

      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);

      const items: any[] = [];
      for (let r = minRow; r <= maxRow; r++) {
        const rowLabelCell = sheet.data[cellKey(minCol, r)];
        const rowObj: any = { name: rowLabelCell?.value || `Fila ${r + 1}` };

        for (let c = minCol + 1; c <= maxCol; c++) {
          const valCell = sheet.data[cellKey(c, r)];
          const colHeader = sheet.data[cellKey(c, Math.max(0, minRow - 1))]?.value || `Serie ${c}`;
          rowObj[String(colHeader)] = Number(valCell?.value) || 0;
        }
        items.push(rowObj);
      }
      return items;
    } catch {
      return [];
    }
  };

  const chartData = extractChartData();
  const seriesKeys = chartData.length > 0 ? Object.keys(chartData[0]).filter((k) => k !== 'name') : [];

  const handleSaveChart = () => {
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      title,
      type: chartType,
      dataRange,
      labelColumn: 0,
      valueColumns: [1, 2],
      position: { x: 80, y: 350, width: 480, height: 260 },
    };
    onAddChart(newChart);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="bg-[#107c41] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-bold text-base">Insertar Gráfico de Microsoft Excel</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Título del Gráfico:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-lg border outline-hidden ${
                  isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Rango de Datos:</label>
              <input
                type="text"
                value={dataRange}
                onChange={(e) => setDataRange(e.target.value)}
                placeholder="Ej: A4:C8"
                className={`w-full px-3 py-2 text-xs rounded-lg border outline-hidden ${
                  isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Tipo de Visualización:</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setChartType('column')}
                  className={`p-2 rounded-lg border transition-colors ${
                    chartType === 'column' ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title="Columnas"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded-lg border transition-colors ${
                    chartType === 'line' ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title="Líneas"
                >
                  <LineChart className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('pie')}
                  className={`p-2 rounded-lg border transition-colors ${
                    chartType === 'pie' ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title="Circular / Pastel"
                >
                  <PieChart className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('area')}
                  className={`p-2 rounded-lg border transition-colors ${
                    chartType === 'area' ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title="Área"
                >
                  <AreaChart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Area */}
          <div
            className={`p-4 rounded-xl border h-72 flex flex-col items-center justify-center ${
              isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h4 className="font-semibold text-xs mb-3 text-zinc-500">{title}</h4>

            {chartData.length > 0 ? (
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'column' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {seriesKeys.map((k, idx) => (
                        <Bar key={k} dataKey={k} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  ) : chartType === 'line' ? (
                    <RechartsLine data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {seriesKeys.map((k, idx) => (
                        <Line key={k} type="monotone" dataKey={k} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />
                      ))}
                    </RechartsLine>
                  ) : chartType === 'pie' ? (
                    <RechartsPie>
                      <Pie
                        data={chartData}
                        dataKey={seriesKeys[0] || 'value'}
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label
                      >
                        {chartData.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </RechartsPie>
                  ) : (
                    <RechartsArea data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {seriesKeys.map((k, idx) => (
                        <Area
                          key={k}
                          type="monotone"
                          dataKey={k}
                          stroke={COLORS[idx % COLORS.length]}
                          fill={COLORS[idx % COLORS.length]}
                          fillOpacity={0.4}
                        />
                      ))}
                    </RechartsArea>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Verifique el rango de celdas para previsualizar datos.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end gap-2 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveChart}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
          >
            Insertar Gráfico en la Hoja
          </button>
        </div>
      </div>
    </div>
  );
};
