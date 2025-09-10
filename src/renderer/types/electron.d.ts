// Типы для Electron API
export interface ElectronAPI {
  // Диалог выбора файлов
  openFileDialog: () => Promise<string[]>;

  // Сохранение файла
  saveFile: (
    content: string,
    filename: string
  ) => Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }>;

  // Чтение файла
  readFile: (filePath: string) => Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }>;

  // Запись файла
  writeFile: (
    filePath: string,
    content: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Получение информации о файле
  getFileInfo: (filePath: string) => Promise<{
    success: boolean;
    info?: {
      name: string;
      path: string;
      size: number;
      modified: Date;
      created: Date;
    };
    error?: string;
  }>;
}

// Расширение глобального объекта Window
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    ipcRenderer: {
      on: (channel: string, listener: (...args: any[]) => void) => void;
      off: (channel: string, ...args: any[]) => void;
      send: (channel: string, ...args: any[]) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}
