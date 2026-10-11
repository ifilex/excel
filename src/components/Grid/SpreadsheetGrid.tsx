import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sheet,
  Cell,
  SelectionRange,
  ChartConfig,
  CollaborationUser,
} from '../../types/spreadsheet';
import {
  cellKey,
  coordsToAddress,
  formatCellValue,
  columnToLetter,
} from '../../utils/cellUtils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell as RechartsCell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { X, Move, Trash2 } from 'lucide-react';

interface SpreadsheetGridProps {
  sheet: Sheet;
  selectedCell: { row: number; col: number };
  selectionRange: SelectionRange;
  onSelectCell: (row: number, col: number, isRange?: boolean) => void;
  onUpdateCellValue: (row: number, col: number, value: string, isFormula?: boolean) => void;
  onUpdateColumnWidth: (col: number, width: number) => void;
  onUpdateRowHeight: (row: number, height: number) => void;
  onDeleteChart: (chartId: string) => void;
  onMoveChart: (chartId: string, x: number, y: number) => void;
  collabUsers: CollaborationUser[];
  isDarkMode: boolean;
  isEditingInline: boolean;
  setIsEditingInline: (val: boolean) => void;
  editingValue: string;
  setEditingValue: (val: string) => void;
}

const DEFAULT_COLS = 26; // A to Z
const DEFAULT_ROWS = 60; // 1 to 60
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 24;
const COLORS = ['#107c41', '#2563eb', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4'];

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  sheet,
  selectedCell,
  selectionRange,
  onSelectCell,
  onUpdateCellValue,
  onUpdateColumnWidth,
  onUpdateRowHeight,
  onDeleteChart,
  onMoveChart,
  collabUsers,
  isDarkMode,
  isEditingInline,
  setIsEditingInline,
  editingValue,
  setEditingValue,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  // Column resizing state
  const [resizingCol, setResizingCol] = useState<{ col: number; startX: number; startWidth: number } | null>(null);
  // Row resizing state
  const [resizingRow, setResizingRow] = useState<{ row: number; startY: number; startHeight: number } | null>(null);

  // Chart dragging state
  const [draggingChart, setDraggingChart] = useState<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const getColWidth = (c: number) => sheet.colWidths?.[c] || DEFAULT_COL_WIDTH;
  const getRowHeight = (r: number) => sheet.rowHeights?.[r] || DEFAULT_ROW_HEIGHT;

  useEffect(() => {
    if (isEditingInline && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    }
  }, [isEditingInline]);

  // Handle cell click / drag selection
  const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    if (isEditingInline) {
      handleCommitInline();
    }
    setIsMouseDown(true);
    setDragStart({ row: r, col: c });
    onSelectCell(r, c, false);
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (isMouseDown && dragStart) {
      onSelectCell(r, c, true);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setResizingCol(null);
    setResizingRow(null);
    setDraggingChart(null);
  };

  const handleCellDoubleClick = (r: number, c: number) => {
    const cell = sheet.data[cellKey(c, r)];
    const initialVal = cell ? (cell.formula || String(cell.value ?? '')) : '';
    setEditingValue(initialVal);
    setIsEditingInline(true);
  };

  const handleCommitInline = () => {
    const isFormula = editingValue.startsWith('=');
    onUpdateCellValue(selectedCell.row, selectedCell.col, editingValue, isFormula);
    setIsEditingInline(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditingInline) {
      if (e.key === 'Enter') {
        handleCommitInline();
        onSelectCell(Math.min(DEFAULT_ROWS - 1, selectedCell.row + 1), selectedCell.col, false);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleCommitInline();
        onSelectCell(selectedCell.row, Math.min(DEFAULT_COLS - 1, selectedCell.col + 1), false);
      } else if (e.key === 'Escape') {
        setIsEditingInline(false);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onSelectCell(Math.max(0, selectedCell.row - 1), selectedCell.col, false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onSelectCell(Math.min(DEFAULT_ROWS - 1, selectedCell.row + 1), selectedCell.col, false);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSelectCell(selectedCell.row, Math.max(0, selectedCell.col - 1), false);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSelectCell(selectedCell.row, Math.min(DEFAULT_COLS - 1, selectedCell.col + 1), false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleCellDoubleClick(selectedCell.row, selectedCell.col);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onSelectCell(selectedCell.row, Math.min(DEFAULT_COLS - 1, selectedCell.col + 1), false);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      onUpdateCellValue(selectedCell.row, selectedCell.col, '', false);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Start typing directly into active cell
      setEditingValue(e.key);
      setIsEditingInline(true);
    }
  };

  // Mouse move listener for resizing and chart dragging
  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (resizingCol) {
      const deltaX = e.clientX - resizingCol.startX;
      const newWidth = Math.max(40, resizingCol.startWidth + deltaX);
      onUpdateColumnWidth(resizingCol.col, newWidth);
    }
    if (resizingRow) {
      const deltaY = e.clientY - resizingRow.startY;
      const newHeight = Math.max(18, resizingRow.startHeight + deltaY);
      onUpdateRowHeight(resizingRow.row, newHeight);
    }
    if (draggingChart) {
      const deltaX = e.clientX - draggingChart.startX;
      const deltaY = e.clientY - draggingChart.startY;
      onMoveChart(draggingChart.id, Math.max(10, draggingChart.origX + deltaX), Math.max(10, draggingChart.origY + deltaY));
    }
  };

  const minR = Math.min(selectionRange.startRow, selectionRange.endRow);
  const maxR = Math.max(selectionRange.startRow, selectionRange.endRow);
  const minC = Math.min(selectionRange.startCol, selectionRange.endCol);
  const maxC = Math.max(selectionRange.startCol, selectionRange.endCol);

  return (
    <div
      ref={gridContainerRef}
      onMouseUp={handleMouseUp}
      onMouseMove={handleContainerMouseMove}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`flex-1 overflow-auto outline-hidden relative select-none ${
        isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-slate-900'
      }`}
      style={{
        transform: `scale(${sheet.zoom || 1})`,
        transformOrigin: 'top left',
      }}
    >
      <div className="inline-block min-w-full pb-32">
        {/* Table Structure */}
        <table className="border-collapse table-fixed">
          {/* Header Row: Column Letters */}
          <thead>
            <tr className="sticky top-0 z-30">
              {/* Top-Left Corner Cell (Select all) */}
              {sheet.showHeaders !== false && (
                <th
                  onClick={() => onSelectCell(0, 0, false)}
                  className={`w-12 h-6 sticky left-0 z-40 border-r border-b text-[10px] font-semibold text-center cursor-pointer ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-400' : 'bg-slate-100 border-slate-300 text-slate-500'
                  }`}
                >
                  ◢
                </th>
              )}

              {/* Column Headers A, B, C... */}
              {Array.from({ length: DEFAULT_COLS }).map((_, c) => {
                const isColSelected = minC <= c && c <= maxC;
                const colLetter = columnToLetter(c);
                const width = getColWidth(c);

                return (
                  <th
                    key={c}
                    style={{ width, minWidth: width, maxWidth: width }}
                    className={`h-6 border-r border-b text-[11px] font-medium text-center relative select-none transition-colors ${
                      isColSelected
                        ? 'bg-emerald-600 text-white font-bold'
                        : isDarkMode
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-400'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  >
                    <span>{colLetter}</span>

                    {/* Column Resizer Handle */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setResizingCol({ col: c, startX: e.clientX, startWidth: width });
                      }}
                      className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500 z-10"
                    />
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: Spreadsheet Rows & Cells */}
          <tbody>
            {Array.from({ length: DEFAULT_ROWS }).map((_, r) => {
              const rowNum = r + 1;
              const isRowSelected = minR <= r && r <= maxR;
              const height = getRowHeight(r);

              return (
                <tr key={r} style={{ height }}>
                  {/* Row Header (1, 2, 3...) */}
                  {sheet.showHeaders !== false && (
                    <td
                      style={{ height }}
                      className={`w-12 sticky left-0 z-20 border-r border-b text-[11px] font-medium text-center relative select-none ${
                        isRowSelected
                          ? 'bg-emerald-600 text-white font-bold'
                          : isDarkMode
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-400'
                          : 'bg-slate-100 border-slate-300 text-slate-600'
                      }`}
                    >
                      <span>{rowNum}</span>

                      {/* Row Resizer Handle */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizingRow({ row: r, startY: e.clientY, startHeight: height });
                        }}
                        className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-emerald-500 z-10"
                      />
                    </td>
                  )}

                  {/* Row Cells */}
                  {Array.from({ length: DEFAULT_COLS }).map((_, c) => {
                    const isSelected = selectedCell.row === r && selectedCell.col === c;
                    const inSelection = minR <= r && r <= maxR && minC <= c && c <= maxC;
                    const cell = sheet.data[cellKey(c, r)] as Cell | undefined;
                    const width = getColWidth(c);

                    // Formatted display value
                    const display = formatCellValue(cell);

                    // Cell styles
                    const fmt = cell?.format || {};
                    const customStyle: React.CSSProperties = {
                      width,
                      minWidth: width,
                      maxWidth: width,
                      height,
                      backgroundColor: fmt.bgColor || (inSelection && !isSelected ? (isDarkMode ? 'rgba(16, 124, 65, 0.2)' : 'rgba(16, 124, 65, 0.12)') : undefined),
                      color: fmt.textColor || (isDarkMode ? '#f4f4f5' : '#0f172a'),
                      fontWeight: fmt.bold ? 'bold' : 'normal',
                      fontStyle: fmt.italic ? 'italic' : 'normal',
                      textDecoration: fmt.underline ? 'underline' : 'none',
                      textAlign: fmt.align || (typeof cell?.value === 'number' ? 'right' : 'left'),
                      fontFamily: fmt.fontFamily || 'Calibri, sans-serif',
                      fontSize: fmt.fontSize ? `${fmt.fontSize}px` : '12px',
                    };

                    // Check for collab users active on this cell
                    const userOnCell = collabUsers.find((u) => u.activeCell === coordsToAddress(c, r));

                    return (
                      <td
                        key={c}
                        onMouseDown={(e) => handleCellMouseDown(r, c, e)}
                        onMouseEnter={() => handleCellMouseEnter(r, c)}
                        onDoubleClick={() => handleCellDoubleClick(r, c)}
                        style={customStyle}
                        className={`p-1 border-r border-b text-xs overflow-hidden truncate relative transition-shadow ${
                          sheet.showGridlines === false
                            ? 'border-transparent'
                            : isDarkMode
                            ? 'border-zinc-800'
                            : 'border-slate-200'
                        } ${
                          isSelected
                            ? 'ring-2 ring-[#107c41] ring-inset z-10 bg-emerald-50/20 dark:bg-emerald-950/30'
                            : inSelection
                            ? 'bg-emerald-100/30 dark:bg-emerald-900/30'
                            : ''
                        }`}
                      >
                        {/* Inline Editor */}
                        {isSelected && isEditingInline ? (
                          <input
                            ref={inlineInputRef}
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={handleCommitInline}
                            className="w-full h-full bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-hidden px-1 border-none text-xs font-mono"
                          />
                        ) : (
                          <span className="block truncate">{display}</span>
                        )}

                        {/* Excel bottom-right corner fill-handle */}
                        {isSelected && !isEditingInline && (
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#107c41] border border-white dark:border-zinc-900 cursor-crosshair z-20" />
                        )}

                        {/* Collaborator Cursor Badge */}
                        {userOnCell && !isSelected && (
                          <div
                            className="absolute -top-3.5 left-0 px-1 py-0.2 rounded text-[9px] text-white font-bold shadow-xs z-30 pointer-events-none whitespace-nowrap"
                            style={{ backgroundColor: userOnCell.color }}
                          >
                            {userOnCell.name}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Embedded Floating Charts on Sheet */}
        {(sheet.charts || []).map((chart) => {
          // Extract data for chart
          const items: any[] = [];
          try {
            for (let r = 4; r <= 7; r++) {
              const qCell = sheet.data[cellKey(0, r)];
              const v1Cell = sheet.data[cellKey(1, r)];
              const v2Cell = sheet.data[cellKey(2, r)];
              if (qCell) {
                items.push({
                  name: qCell.value || `Q${r - 3}`,
                  'Ingresos Ventas': Number(v1Cell?.value) || 0,
                  'Costos Operativos': Number(v2Cell?.value) || 0,
                });
              }
            }
          } catch {}

          return (
            <div
              key={chart.id}
              style={{
                position: 'absolute',
                left: chart.position?.x || 50,
                top: chart.position?.y || 380,
                width: chart.position?.width || 520,
                height: chart.position?.height || 260,
              }}
              className={`rounded-xl border shadow-xl z-20 flex flex-col overflow-hidden backdrop-blur-md ${
                isDarkMode ? 'bg-zinc-900/95 border-zinc-700 text-zinc-100' : 'bg-white/95 border-slate-300 text-slate-800'
              }`}
            >
              {/* Chart Header Bar with Drag handle & Close */}
              <div
                onMouseDown={(e) => {
                  setDraggingChart({
                    id: chart.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    origX: chart.position?.x || 50,
                    origY: chart.position?.y || 380,
                  });
                }}
                className="px-3 py-1.5 border-b flex items-center justify-between cursor-move bg-emerald-700 text-white select-none"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Move className="w-3.5 h-3.5" />
                  <span>{chart.title}</span>
                </div>
                <button
                  onClick={() => onDeleteChart(chart.id)}
                  className="p-0.5 hover:bg-emerald-800 rounded transition-colors text-emerald-200 hover:text-white"
                  title="Eliminar gráfico"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chart Display Area */}
              <div className="flex-1 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chart.type === 'column' ? (
                    <BarChart data={items}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Ingresos Ventas" fill="#107c41" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Costos Operativos" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : chart.type === 'line' ? (
                    <LineChart data={items}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="Ingresos Ventas" stroke="#107c41" strokeWidth={2} />
                      <Line type="monotone" dataKey="Costos Operativos" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                  ) : (
                    <AreaChart data={items}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="Ingresos Ventas" stroke="#107c41" fill="#107c41" fillOpacity={0.3} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
