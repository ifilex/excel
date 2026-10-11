import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  RefreshCw,
  FolderOpen,
  X,
  Star,
  Clock,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { Workbook } from '../../types/spreadsheet';
import { googleDriveSync, GoogleDriveFile } from '../../utils/googleDriveSync';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbook: Workbook;
  onUpdateWorkbook: (wb: Workbook) => void;
  isDarkMode: boolean;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  workbook,
  onUpdateWorkbook,
  isDarkMode,
}) => {
  const [status, setStatus] = useState(googleDriveSync.getStatus());
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus(googleDriveSync.getStatus());
      setFiles(googleDriveSync.getFiles());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsSyncing(true);
    await googleDriveSync.connect();
    setStatus(googleDriveSync.getStatus());
    setFiles(googleDriveSync.getFiles());
    setIsSyncing(false);
    setStatusMessage('Conectado a Google Drive correctamente.');
  };

  const handleSaveToDrive = async () => {
    setIsSyncing(true);
    const result = await googleDriveSync.saveWorkbookToDrive(workbook);
    setIsSyncing(false);
    setFiles(googleDriveSync.getFiles());
    setStatusMessage(result.message);
    onUpdateWorkbook({
      ...workbook,
      googleDriveFileId: result.fileId,
      lastDriveSync: new Date().toISOString(),
    });
  };

  const handleOpenDriveFile = async (file: GoogleDriveFile) => {
    setIsSyncing(true);
    const loaded = await googleDriveSync.loadWorkbookFromDrive(file.id);
    setIsSyncing(false);
    if (loaded) {
      onUpdateWorkbook(loaded);
      setStatusMessage(`Archivo "${file.name}" cargado desde Google Drive.`);
      setTimeout(() => onClose(), 800);
    } else {
      alert(`Cargando archivo demo "${file.name}".`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="bg-[#1a73e8] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Integración con Google Drive</h2>
              <p className="text-xs text-blue-100">Almacenamiento, sincronización y colaboración en la nube</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-md text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Account Status Card */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              status.isConnected
                ? isDarkMode
                  ? 'bg-blue-950/30 border-blue-800'
                  : 'bg-blue-50 border-blue-200'
                : isDarkMode
                ? 'bg-zinc-800 border-zinc-700'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {status.userName.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  {status.userName}
                  {status.isConnected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </h4>
                <span className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {status.userEmail} &bull; {status.isConnected ? 'Sincronizado' : 'Desconectado'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {status.isConnected ? (
                <button
                  onClick={handleSaveToDrive}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a73e8] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Upload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Guardar Libro en Drive'}</span>
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a73e8] hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Conectar Cuenta de Google</span>
                </button>
              )}
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Files List in Drive */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                Archivos en Google Drive ({files.length})
              </h3>
              <button
                onClick={() => setFiles(googleDriveSync.getFiles())}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Actualizar lista
              </button>
            </div>

            <div className={`rounded-xl border divide-y overflow-hidden ${isDarkMode ? 'border-zinc-800 divide-zinc-800' : 'border-slate-200 divide-slate-200'}`}>
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    isDarkMode ? 'hover:bg-zinc-800/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                      {file.name.endsWith('.xlsm') ? (
                        <FileCode className="w-5 h-5 text-amber-600" />
                      ) : (
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-1.5">
                        {file.name}
                        {file.starred && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span>{file.size}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(file.modifiedTime).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenDriveFile(file)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Abrir en Editor</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
