import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck, KeyRound, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Workbook } from '../../types/spreadsheet';
import { encryptDocument, decryptDocument } from '../../utils/cryptoUtils';

interface EncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbook: Workbook;
  onUpdateWorkbook: (wb: Workbook) => void;
  isDarkMode: boolean;
}

export const EncryptionModal: React.FC<EncryptionModalProps> = ({
  isOpen,
  onClose,
  workbook,
  onUpdateWorkbook,
  isDarkMode,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hint, setHint] = useState(workbook.metadata.encryptionHint || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const isEncrypted = !!workbook.metadata.isEncrypted;

  const handleApplyEncryption = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'La contraseña no puede estar vacía.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    if (password.length < 4) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 4 caracteres.' });
      return;
    }

    setIsLoading(true);
    try {
      const payload = await encryptDocument(workbook.sheets, password, hint);
      onUpdateWorkbook({
        ...workbook,
        metadata: {
          ...workbook.metadata,
          isEncrypted: true,
          encryptionHint: hint,
          salt: payload.salt,
          iv: payload.iv,
        },
      });
      setMessage({
        type: 'success',
        text: 'Documento cifrado con éxito con algoritmo AES-GCM 256 bits.',
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e: any) {
      setMessage({ type: 'error', text: `Error al cifrar: ${e.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEncryption = () => {
    onUpdateWorkbook({
      ...workbook,
      metadata: {
        ...workbook.metadata,
        isEncrypted: false,
        encryptionHint: undefined,
        salt: undefined,
        iv: undefined,
      },
    });
    setMessage({ type: 'success', text: 'Cifrado y protección por contraseña eliminados.' });
    setTimeout(() => onClose(), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-bold text-base">Cifrado de Documentos Sensibles</h2>
              <p className="text-[11px] text-emerald-200">Seguridad Criptográfica AES-GCM 256 bits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div
            className={`p-3 rounded-lg border flex items-center gap-3 ${
              isEncrypted
                ? isDarkMode
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isDarkMode
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {isEncrypted ? <Lock className="w-5 h-5 text-emerald-600" /> : <Unlock className="w-5 h-5 text-zinc-500" />}
            <div className="text-xs">
              <div className="font-bold">{isEncrypted ? 'Documento Protegido' : 'Documento Sin Cifrar'}</div>
              <div className="text-[11px] opacity-80">
                {isEncrypted
                  ? 'Este libro requiere contraseña para acceder a los datos.'
                  : 'Los datos no están encriptados actualmente.'}
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {!isEncrypted ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold mb-1">Nueva Contraseña:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese contraseña segura..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-hidden focus:border-emerald-500 ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Confirmar Contraseña:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la contraseña..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-hidden focus:border-emerald-500 ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Pista para recordar (opcional):</label>
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="Ej: Año de fundación de la empresa"
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-hidden focus:border-emerald-500 ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <button
                onClick={handleApplyEncryption}
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoading ? 'Cifrando libro...' : 'Cifrar y Bloquear Libro'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                La protección con contraseña está activa. Puedes desactivarla en cualquier momento.
              </p>
              <button
                onClick={handleRemoveEncryption}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Unlock className="w-4 h-4" />
                <span>Desactivar Cifrado y Contraseña</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
