import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import path from 'path';
import { getTasks, addTask, updateTaskStatus, deleteTask, updateTaskTime } from './database';

let mainWindow: BrowserWindow | null = null;

app.setAppUserModelId('com.productivity.app');

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

  ipcMain.handle('update-task-time', (_event, { id, minutesWorked }) => {
    return updateTaskTime(id, minutesWorked);
  });

  // Echo 'tasks-updated' to all renderers so they can refresh their lists immediately
  ipcMain.on('tasks-updated', () => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('tasks-updated');
    });
  });

  ipcMain.on('pomodoro-state-changed', (_event, { isBreak }: { isBreak: boolean }) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    // Windows muestra este progreso como una línea verde en el botón de la app.
    mainWindow.setProgressBar(isBreak ? 1 : -1);
    mainWindow.setBackgroundColor(isBreak ? '#dcfce7' : '#f0f2f5');
  });

  ipcMain.on('pomodoro-notification', (_event, { title, body }: { title: string; body: string }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
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
  mainWindow = win;
  win.on('closed', () => {
    if (mainWindow === win) mainWindow = null;
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
