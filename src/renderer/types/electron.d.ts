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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
