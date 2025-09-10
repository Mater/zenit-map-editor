import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --------- IPC Handlers ---------

// Диалог открытия файлов
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(win!, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Map Files', extensions: ['map'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});

// Диалог сохранения файла
ipcMain.handle(
  'dialog:saveFile',
  async (_, content: string, filename: string) => {
    const result = await dialog.showSaveDialog(win!, {
      defaultPath: filename,
      filters: [
        { name: 'Map Files', extensions: ['map'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (!result.canceled && result.filePath) {
      try {
        await fs.promises.writeFile(result.filePath, content, 'utf8');
        return { success: true, path: result.filePath };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return { success: false, error: 'Save cancelled' };
  }
);

// Чтение файла
ipcMain.handle('fs:readFile', async (_, filePath: string) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Запись файла
ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
  try {
    await fs.promises.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Получение информации о файле
ipcMain.handle('fs:getFileInfo', async (_, filePath: string) => {
  try {
    const stats = await fs.promises.stat(filePath);
    return {
      success: true,
      info: {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

app.whenReady().then(createWindow);
