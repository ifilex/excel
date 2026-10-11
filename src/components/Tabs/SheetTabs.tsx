import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, MoreVertical, Copy, Trash2, Palette, Edit2 } from 'lucide-react';
import { Sheet } from '../../types/spreadsheet';

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onAddSheet: () => void;
  onRenameSheet: (id: string, newName: string) => void;
  onDuplicateSheet: (id: string) => void;
  onDeleteSheet: (id: string) => void;
  onChangeTabColor: (id: string, color: string) => void;
  isDarkMode: boolean;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onAddSheet,
  onRenameSheet,
  onDuplicateSheet,
  onDeleteSheet,
  onChangeTabColor,
  isDarkMode,
}) => {
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ sheetId: string; x: number; y: number } | null>(null);

  const colors = ['#107c41', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#e11d48'];

  const handleStartRename = (sheet: Sheet) => {
    setEditingSheetId(sheet.id);
    setEditName(sheet.name);
    setContextMenu(null);
  };

  const handleFinishRename = (id: string) => {
    if (editName.trim()) {
      onRenameSheet(id, editName.trim());
    }
    setEditingSheetId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, sheetId: string) => {
    e.preventDefault();
    setContextMenu({ sheetId, x: e.clientX, y: e.clientY - 120 });
  };

  return (
    <div
      onClick={() => setContextMenu(null)}
      className={`h-9 px-2 flex items-center justify-between border-t select-none transition-colors ${
        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-300 text-slate-700'
      }`}
    >
      {/* Navigation Arrows & Add Button */}
      <div className="flex items-center gap-1">
        <button
          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-500"
          title="Hoja anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-500"
          title="Siguiente hoja"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={onAddSheet}
          className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded transition-colors"
          title="Insertar nueva hoja de cálculo (+)"
        >
          <Plus className="w-4 h-4 font-bold" />
        </button>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Tabs List */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-2xl py-1">
          {sheets.map((s) => {
            const isActive = s.id === activeSheetId;

            return (
              <div
                key={s.id}
                onClick={() => onSelectSheet(s.id)}
                onDoubleClick={() => handleStartRename(s)}
                onContextMenu={(e) => handleContextMenu(e, s.id)}
                className={`group px-3 py-1 text-xs rounded-t-md font-medium cursor-pointer flex items-center gap-2 border-t-2 transition-all relative ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 font-semibold shadow-xs'
                    : 'hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60 text-zinc-500 border-t-transparent'
                }`}
                style={{
                  borderTopColor: s.tabColor || (isActive ? '#107c41' : 'transparent'),
                }}
              >
                {editingSheetId === s.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleFinishRename(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFinishRename(s.id);
                      if (e.key === 'Escape') setEditingSheetId(null);
                    }}
                    autoFocus
                    className="w-24 px-1 text-xs border rounded bg-white dark:bg-zinc-950 outline-hidden"
                  />
                ) : (
                  <span>{s.name}</span>
                )}

                {/* Color Dot if set */}
                {s.tabColor && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.tabColor }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Menu on Right Click */}
      {contextMenu && (
        <div
          style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }}
          className="z-60 w-44 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-1 text-xs space-y-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const sheet = sheets.find((s) => s.id === contextMenu.sheetId);
              if (sheet) handleStartRename(sheet);
            }}
            className="w-full px-2.5 py-1.5 rounded text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Cambiar nombre</span>
          </button>

          <button
            onClick={() => {
              onDuplicateSheet(contextMenu.sheetId);
              setContextMenu(null);
            }}
            className="w-full px-2.5 py-1.5 rounded text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicar hoja</span>
          </button>

          {/* Color Picker Sub-options */}
          <div className="px-2.5 py-1 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-medium">Color de etiqueta:</span>
            <div className="flex gap-1 mt-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onChangeTabColor(contextMenu.sheetId, c);
                    setContextMenu(null);
                  }}
                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-125 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {sheets.length > 1 && (
            <button
              onClick={() => {
                onDeleteSheet(contextMenu.sheetId);
                setContextMenu(null);
              }}
              className="w-full px-2.5 py-1.5 rounded text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar hoja</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
