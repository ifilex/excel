import React, { useState } from 'react';
import { History, RotateCcw, Plus, Clock, FileCheck, X, Sparkles } from 'lucide-react';
import { Workbook, WorkbookVersion } from '../../types/spreadsheet';
import { createVersionSnapshot } from '../../utils/storageUtils';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbook: Workbook;
  onUpdateWorkbook: (wb: Workbook) => void;
  isDarkMode: boolean;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  workbook,
  onUpdateWorkbook,
  isDarkMode,
}) => {
  const [snapshotNote, setSnapshotNote] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<WorkbookVersion | null>(
    workbook.versions?.[0] || null
  );

  if (!isOpen) return null;

  const versions = workbook.versions || [];

  const handleCreateSnapshot = () => {
    const updated = createVersionSnapshot(workbook, snapshotNote || 'Punto de control manual');
    onUpdateWorkbook(updated);
    setSnapshotNote('');
    setSelectedVersion(updated.versions[0]);
  };

  const handleRestoreVersion = (version: WorkbookVersion) => {
    try {
      const data = JSON.parse(version.dataSnapshot);
      const restored: Workbook = {
        ...workbook,
        sheets: data.sheets,
        activeSheetId: data.activeSheetId || workbook.activeSheetId,
        vbaModules: data.vbaModules || workbook.vbaModules,
        metadata: {
          ...workbook.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
      onUpdateWorkbook(restored);
      alert(`Versión del ${new Date(version.timestamp).toLocaleString('es-ES')} restaurada.`);
      onClose();
    } catch (e: any) {
      alert(`Error al restaurar versión: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="bg-[#5b21b6] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-purple-300" />
            <h3 className="font-bold text-base">Historial de Versiones & Puntos de Restauración</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Create new snapshot */}
          <div className={`p-4 rounded-xl border flex gap-2 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <input
              type="text"
              value={snapshotNote}
              onChange={(e) => setSnapshotNote(e.target.value)}
              placeholder="Descripción del punto de control (ej: Antes de aplicar macro)..."
              className={`flex-1 px-3 py-2 text-xs rounded-lg border outline-hidden ${
                isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300'
              }`}
            />
            <button
              onClick={handleCreateSnapshot}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Instantánea</span>
            </button>
          </div>

          {/* Versions list */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">
              Versiones Guardadas ({versions.length})
            </h4>

            {versions.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">
                No hay versiones registradas aún. Las instantáneas se generan automáticamente durante el trabajo.
              </div>
            ) : (
              versions.map((ver) => (
                <div
                  key={ver.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs">{ver.description}</h5>
                      <span className="text-[11px] text-zinc-400">
                        {new Date(ver.timestamp).toLocaleString('es-ES')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreVersion(ver)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
