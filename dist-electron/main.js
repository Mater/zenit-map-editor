import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as fs from "fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Map Files", extensions: ["map"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });
  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});
ipcMain.handle(
  "dialog:saveFile",
  async (_, content, filename) => {
    const result = await dialog.showSaveDialog(win, {
      defaultPath: filename,
      filters: [
        { name: "Map Files", extensions: ["map"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (!result.canceled && result.filePath) {
      try {
        await fs.promises.writeFile(result.filePath, content, "utf8");
        return { success: true, path: result.filePath };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }
    return { success: false, error: "Save cancelled" };
  }
);
ipcMain.handle("fs:readFile", async (_, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, "utf8");
    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("fs:writeFile", async (_, filePath, content) => {
  try {
    await fs.promises.writeFile(filePath, content, "utf8");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("fs:getFileInfo", async (_, filePath) => {
  try {
    const stats = await fs.promises.stat(filePath);
    return {
      success: true,
      info: {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
