"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Открытие диалога выбора файлов
  openFileDialog: () => electron.ipcRenderer.invoke("dialog:openFile"),
  // Сохранение файла
  saveFile: (content, filename) => electron.ipcRenderer.invoke("dialog:saveFile", content, filename),
  // Чтение файла
  readFile: (filePath) => electron.ipcRenderer.invoke("fs:readFile", filePath),
  // Запись файла
  writeFile: (filePath, content) => electron.ipcRenderer.invoke("fs:writeFile", filePath, content),
  // Получение информации о файле
  getFileInfo: (filePath) => electron.ipcRenderer.invoke("fs:getFileInfo", filePath)
});
