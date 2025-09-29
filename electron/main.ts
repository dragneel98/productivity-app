import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { getTasks, addTask, updateTaskStatus, deleteTask } from './database';

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('get-tasks', () => {
    return getTasks();
  });

  ipcMain.handle('add-task', (_event, task) => {
    return addTask(task);
  });

  ipcMain.handle('update-task-status', (_event, { id, status }) => {
    return updateTaskStatus(id, status);
  });

  ipcMain.handle('delete-task', (_event, id) => {
    return deleteTask(id);
  });
});
function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    win.loadURL(devServerUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, load the built index.html from Vite
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

