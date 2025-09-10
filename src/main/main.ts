import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { isDev } from '../shared/utils';

let mainWindow: BrowserWindow;

function createWindow(): void {
  // Создание окна браузера
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    minHeight: 600,
    minWidth: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false,
  });

  // Загрузка приложения
  if (isDev()) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Показать окно когда готово
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null as any;
  });
}

// Этот метод будет вызван когда Electron закончит инициализацию
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Выйти когда все окна закрыты
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC обработчики
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Map Files', extensions: ['map'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  return result;
});

ipcMain.handle(
  'save-file',
  async (_: any, options: { defaultPath?: string }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: options.defaultPath || 'merged_map.map',
      filters: [
        { name: 'Map Files', extensions: ['map'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    return result;
  }
);
