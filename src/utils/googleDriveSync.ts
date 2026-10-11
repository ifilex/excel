import { Workbook } from '../types/spreadsheet';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size: string;
  icon: string;
  starred?: boolean;
  sharedWithMe?: boolean;
}

const DRIVE_FILES_KEY = 'excel_office_drive_cloud_files';

export class GoogleDriveSyncService {
  private isConnected = false;
  private userEmail = 'chanampa.emanuel@gmail.com';
  private userName = 'Emanuel Chanampa';

  constructor() {
    this.isConnected = localStorage.getItem('excel_drive_connected') === 'true';
  }

  public getStatus(): { isConnected: boolean; userEmail: string; userName: string } {
    return {
      isConnected: this.isConnected,
      userEmail: this.userEmail,
      userName: this.userName,
    };
  }

  public connect(): Promise<{ success: boolean; user: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        localStorage.setItem('excel_drive_connected', 'true');
        resolve({ success: true, user: this.userEmail });
      }, 600);
    });
  }

  public disconnect(): void {
    this.isConnected = false;
    localStorage.removeItem('excel_drive_connected');
  }

  public getFiles(): GoogleDriveFile[] {
    const raw = localStorage.getItem(DRIVE_FILES_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }

    // Default cloud templates in Google Drive
    const initialFiles: GoogleDriveFile[] = [
      {
        id: 'drive-file-1',
        name: 'Reporte Financiero Anual 2026.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        modifiedTime: '2026-08-20T14:30:00Z',
        size: '148 KB',
        icon: 'table',
        starred: true,
      },
      {
        id: 'drive-file-2',
        name: 'Automatización Nómina y Macros.xlsm',
        mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12',
        modifiedTime: '2026-08-24T09:15:00Z',
        size: '280 KB',
        icon: 'code',
      },
      {
        id: 'drive-file-3',
        name: 'Inventario y Matriz de Costos.xlsb',
        mimeType: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        modifiedTime: '2026-08-25T18:45:00Z',
        size: '512 KB',
        icon: 'database',
      },
      {
        id: 'drive-file-4',
        name: 'Presupuesto Comercial Q3.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        modifiedTime: '2026-08-26T07:10:00Z',
        size: '95 KB',
        icon: 'table',
      },
    ];

    localStorage.setItem(DRIVE_FILES_KEY, JSON.stringify(initialFiles));
    return initialFiles;
  }

  public saveWorkbookToDrive(workbook: Workbook): Promise<{ success: boolean; fileId: string; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const files = this.getFiles();
        const existingIdx = files.findIndex((f) => f.name === `${workbook.name}.xlsx` || f.id === workbook.googleDriveFileId);

        const fileId = workbook.googleDriveFileId || `drive-${Date.now()}`;
        const newFile: GoogleDriveFile = {
          id: fileId,
          name: `${workbook.name}.xlsx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          modifiedTime: new Date().toISOString(),
          size: `${Math.round(JSON.stringify(workbook).length / 1024)} KB`,
          icon: workbook.vbaModules?.length ? 'code' : 'table',
        };

        if (existingIdx >= 0) {
          files[existingIdx] = newFile;
        } else {
          files.unshift(newFile);
        }

        localStorage.setItem(DRIVE_FILES_KEY, JSON.stringify(files));
        localStorage.setItem(`drive_content_${fileId}`, JSON.stringify(workbook));

        resolve({
          success: true,
          fileId,
          message: `Documento sincronizado con Google Drive exitosamente en "${newFile.name}".`,
        });
      }, 700);
    });
  }

  public loadWorkbookFromDrive(fileId: string): Promise<Workbook | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const raw = localStorage.getItem(`drive_content_${fileId}`);
        if (raw) {
          try {
            resolve(JSON.parse(raw));
            return;
          } catch {}
        }
        resolve(null);
      }, 400);
    });
  }
}

export const googleDriveSync = new GoogleDriveSyncService();
