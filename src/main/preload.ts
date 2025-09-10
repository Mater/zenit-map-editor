import { contextBridge, ipcRenderer } from 'electron';

// Типы для API
export interface ElectronAPI {
  selectFiles: () => Promise<{
    canceled: boolean;
    filePaths: string[];
  }>;
  saveFile: (options: { defaultPath?: string }) => Promise<{
    canceled: boolean;
    filePath?: string;
  }>;
}

// Безопасный API для рендерера
const electronAPI: ElectronAPI = {
  selectFiles: () => ipcRenderer.invoke('select-files'),
  saveFile: options => ipcRenderer.invoke('save-file', options),
};

// Предоставляем API в контекст рендерера
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Типы для глобального объекта
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
