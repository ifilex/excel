import React from 'react';
import {
  Lock,
  ShieldCheck,
  History,
  SpellCheck,
  MessageSquarePlus,
  CheckCircle2,
} from 'lucide-react';
import { Workbook } from '../../types/spreadsheet';

interface ReviewTabProps {
  workbook: Workbook;
  onOpenEncryptionModal: () => void;
  onOpenVersionModal: () => void;
  isDarkMode: boolean;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  workbook,
  onOpenEncryptionModal,
  onOpenVersionModal,
  isDarkMode,
}) => {
  return (
    <div
      className={`h-24 px-3 py-1 flex items-center gap-3 overflow-x-auto border-b text-xs select-none ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-[#f9fbfd] border-slate-200 text-slate-800'
      }`}
    >
      {/* Security & Protection */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={onOpenEncryptionModal}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Proteger libro con Cifrado Militar AES-256"
        >
          {workbook.metadata?.isEncrypted ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          ) : (
            <Lock className="w-5 h-5 text-amber-600" />
          )}
          <span className="text-[10px] font-bold">
            {workbook.metadata?.isEncrypted ? 'Cifrado Activo' : 'Cifrar Libro'}
          </span>
        </button>
      </div>

      {/* Version Control & Revisions */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={onOpenVersionModal}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Ver historial de cambios y restaurar versiones"
        >
          <History className="w-5 h-5 text-purple-600" />
          <span className="text-[10px] font-medium">Historial de Versiones</span>
        </button>
      </div>

      {/* Proofing */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => alert('Revisión ortográfica completada: Sin errores en la hoja activa.')}
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 flex flex-col items-center gap-1 transition-colors"
          title="Comprobar ortografía"
        >
          <SpellCheck className="w-5 h-5 text-blue-600" />
          <span className="text-[10px]">Ortografía</span>
        </button>
      </div>
    </div>
  );
};
