"use strict";
const electron = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");
const appDataPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
const dbPath = path.join(appDataPath, "productivity-app", "database.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    estimatedHours REAL NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
(() => {
  const columns = db.prepare("PRAGMA table_info(tasks)").all();
  const hasEstimated = columns.some((c) => c.name === "estimatedHours");
  if (!hasEstimated) {
    db.exec("ALTER TABLE tasks ADD COLUMN estimatedHours REAL NOT NULL DEFAULT 0");
  }
})();
const getTasks = () => {
  const stmt = db.prepare("SELECT * FROM tasks");
  return stmt.all();
};
const addTask = (task) => {
  const stmt = db.prepare("INSERT INTO tasks (title, description, estimatedHours) VALUES (?, ?, ?)");
  return stmt.run(task.title, task.description, task.estimatedHours);
};
const updateTaskStatus = (id, status) => {
  const stmt = db.prepare("UPDATE tasks SET status = ? WHERE id = ?");
  return stmt.run(status, id);
};
const deleteTask = (id) => {
  const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
  return stmt.run(id);
};
electron.app.whenReady().then(() => {
  createWindow();
  electron.ipcMain.handle("get-tasks", () => {
    return getTasks();
  });
  electron.ipcMain.handle("add-task", (_event, task) => {
    return addTask(task);
  });
  electron.ipcMain.handle("update-task-status", (_event, { id, status }) => {
    return updateTaskStatus(id, status);
  });
  electron.ipcMain.handle("delete-task", (_event, id) => {
    return deleteTask(id);
  });
  electron.ipcMain.on("tasks-updated", () => {
    electron.BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send("tasks-updated");
    });
  });
});
function createWindow() {
  const win = new electron.BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    win.loadURL(devServerUrl);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
