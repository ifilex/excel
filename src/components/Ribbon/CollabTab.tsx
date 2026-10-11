import React, { useState } from 'react';
import {
  Users,
  Share2,
  Copy,
  Check,
  MessageSquare,
  Globe,
  Radio,
  Sparkles,
} from 'lucide-react';
import { CollaborationUser } from '../../types/spreadsheet';

interface CollabTabProps {
  activeUsers: CollaborationUser[];
  onToggleCollab: () => void;
  isCollabActive: boolean;
  isDarkMode: boolean;
}

export const CollabTab: React.FC<CollabTabProps> = ({
  activeUsers,
  onToggleCollab,
  isCollabActive,
  isDarkMode,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`h-24 px-3 py-1 flex items-center gap-4 overflow-x-auto border-b text-xs select-none ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-[#f9fbfd] border-slate-200 text-slate-800'
      }`}
    >
      {/* Collaboration Status & Toggle */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <button
          onClick={onToggleCollab}
          className={`p-2 rounded flex flex-col items-center gap-1 transition-colors ${
            isCollabActive
              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
              : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600'
          }`}
          title="Alternar Colaboración en Tiempo Real en la Nube"
        >
          <Radio className={`w-5 h-5 ${isCollabActive ? 'animate-pulse text-purple-600' : 'text-zinc-500'}`} />
          <span className="text-[10px] font-bold">
            {isCollabActive ? 'En Vivo (Sincronizado)' : 'Activar Colaboración'}
          </span>
        </button>
      </div>

      {/* Active Team Members */}
      <div className="flex items-center gap-2 pr-3 border-r border-inherit">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-zinc-400 font-medium">Equipo Activo en Este Libro:</span>
          <div className="flex items-center gap-1.5">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium"
                style={{
                  borderColor: user.color,
                  backgroundColor: `${user.color}15`,
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span>{user.name}</span>
                {user.activeCell && (
                  <span className="text-[10px] opacity-70">({user.activeCell})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Document Link */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyShareLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Enlace Copiado!' : 'Compartir con Colegas'}</span>
        </button>
      </div>
    </div>
  );
};
