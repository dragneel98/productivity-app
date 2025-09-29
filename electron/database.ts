import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Define the path for the database in the user's app data folder
const appDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
const dbPath = path.join(appDataPath, 'productivity-app', 'database.db');

// Ensure the directory exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Create tasks table if it doesn't exist
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

// Ensure estimatedHours column exists for users with an older schema
(() => {
  const columns = db.prepare('PRAGMA table_info(tasks)').all() as Array<{ name: string }>;
  const hasEstimated = columns.some(c => c.name === 'estimatedHours');
  if (!hasEstimated) {
    db.exec("ALTER TABLE tasks ADD COLUMN estimatedHours REAL NOT NULL DEFAULT 0");
  }
})();

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedHours: number;
  createdAt: string;
}

export const getTasks = (): Task[] => {
  const stmt = db.prepare('SELECT * FROM tasks');
  return stmt.all() as Task[];
};

export const addTask = (task: { title: string; description?: string; estimatedHours: number }): Database.RunResult => {
  const stmt = db.prepare('INSERT INTO tasks (title, description, estimatedHours) VALUES (?, ?, ?)');
  return stmt.run(task.title, task.description, task.estimatedHours);
};

export const updateTaskStatus = (id: number, status: Task['status']): Database.RunResult => {
  const stmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ?');
  return stmt.run(status, id);
};

export const updateTaskTime = (id: number, minutesWorked: number): Database.RunResult => {
  // Convertir minutos a horas y restarlos de las horas estimadas
  const hoursWorked = minutesWorked / 60;
  const stmt = db.prepare(`
    UPDATE tasks 
    SET estimatedHours = MAX(0, estimatedHours - ?)
    WHERE id = ?
  `);
  return stmt.run(hoursWorked, id);
};

export const deleteTask = (id: number): Database.RunResult => {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  return stmt.run(id);
};

export default db;
