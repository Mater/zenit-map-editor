import { ipcRenderer, contextBridge } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

// --------- Expose file system API ---------
contextBridge.exposeInMainWorld('electronAPI', {
  // Открытие диалога выбора файлов
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),

  // Сохранение файла
  saveFile: (content: string, filename: string) =>
    ipcRenderer.invoke('dialog:saveFile', content, filename),

  // Чтение файла
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),

  // Запись файла
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('fs:writeFile', filePath, content),

  // Получение информации о файле
  getFileInfo: (filePath: string) =>
    ipcRenderer.invoke('fs:getFileInfo', filePath),
});
