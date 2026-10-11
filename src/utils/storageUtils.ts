import { Workbook, WorkbookVersion } from '../types/spreadsheet';

const STORAGE_KEY = 'excel_office_active_workbook';
const RECENT_FILES_KEY = 'excel_office_recent_files';
const AUTOSAVE_INTERVAL_KEY = 'excel_office_autosave_enabled';

export interface RecentFileMeta {
  id: string;
  name: string;
  updatedAt: string;
  sheetCount: number;
  isEncrypted: boolean;
}

export function saveActiveWorkbook(workbook: Workbook): void {
  try {
    const serialized = JSON.stringify(workbook);
    localStorage.setItem(STORAGE_KEY, serialized);

    // Update recent files list
    updateRecentFileList({
      id: workbook.id,
      name: workbook.name,
      updatedAt: new Date().toISOString(),
      sheetCount: workbook.sheets.length,
      isEncrypted: !!workbook.metadata?.isEncrypted,
    });
  } catch (e) {
    console.warn('LocalStorage quota or serialization error:', e);
  }
}

export function loadActiveWorkbook(): Workbook | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // If the cached workbook was the old pre-filled demo, purge it so the app starts with a clean blank sheet
    if (
      parsed &&
      (parsed.id === 'wb-demo-default' ||
        parsed.name === 'Presupuesto Financiero y Operaciones 2026' ||
        (parsed.sheets && parsed.sheets.some((s: any) => s.name === 'Resumen Financiero' && s.data?.['0_0'])))
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load active workbook:', e);
    return null;
  }
}

export function createVersionSnapshot(workbook: Workbook, description = 'Autoguardado'): Workbook {
  const version: WorkbookVersion = {
    id: `ver-${Date.now()}`,
    timestamp: new Date().toISOString(),
    description,
    dataSnapshot: JSON.stringify({
      sheets: workbook.sheets,
      activeSheetId: workbook.activeSheetId,
      vbaModules: workbook.vbaModules,
    }),
  };

  const versions = [version, ...(workbook.versions || [])].slice(0, 25);
  return {
    ...workbook,
    versions,
    metadata: {
      ...workbook.metadata,
      updatedAt: new Date().toISOString(),
      version: (workbook.metadata?.version || 1) + 1,
    },
  };
}

export function getRecentFiles(): RecentFileMeta[] {
  try {
    const raw = localStorage.getItem(RECENT_FILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function updateRecentFileList(meta: RecentFileMeta) {
  try {
    const list = getRecentFiles().filter((f) => f.id !== meta.id);
    const updated = [meta, ...list].slice(0, 15);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
  } catch {}
}

export function getAutosaveSetting(): boolean {
  const val = localStorage.getItem(AUTOSAVE_INTERVAL_KEY);
  return val === null ? true : val === 'true';
}

export function setAutosaveSetting(enabled: boolean): void {
  localStorage.setItem(AUTOSAVE_INTERVAL_KEY, String(enabled));
}
