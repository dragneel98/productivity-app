import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '../types/task';
import {
  addTask,
  deleteTask,
  getTasks,
  subscribeToTaskUpdates,
  toggleTaskStatus,
  updateTaskTime,
} from './taskService';

const tasks: Task[] = [
  {
    id: 1,
    title: 'Planificar sprint',
    status: 'pending',
    estimatedHours: 4,
    workedHours: 0,
    createdAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Implementar feature',
    status: 'in_progress',
    estimatedHours: 2,
    workedHours: 1,
    createdAt: '2026-09-20T11:00:00.000Z',
  },
];

describe('taskService', () => {
  const db = {
    getTasks: vi.fn(),
    addTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    deleteTask: vi.fn(),
    updateTaskTime: vi.fn(),
  };
  const ipcRenderer = {
    send: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(window, { db, ipcRenderer });
  });

  it('returns tasks from the database', async () => {
    // Verifica que la lectura delega en la API SQLite expuesta por Electron.
    db.getTasks.mockResolvedValue(tasks);

    await expect(getTasks()).resolves.toEqual(tasks);
    expect(db.getTasks).toHaveBeenCalledOnce();
  });

  it('adds a task and notifies other renderers', async () => {
    // Verifica que crear una tarea persiste el dato y emite la actualización global.
    db.addTask.mockResolvedValue(undefined);

    await addTask({ title: 'Nueva tarea', estimatedHours: 2 });

    expect(db.addTask).toHaveBeenCalledWith({ title: 'Nueva tarea', estimatedHours: 2 });
    expect(ipcRenderer.send).toHaveBeenCalledWith('tasks-updated');
  });

  it('cycles a pending task to in_progress', async () => {
    // Verifica la primera transición del estado de una tarea.
    db.updateTaskStatus.mockResolvedValue(undefined);

    await toggleTaskStatus(tasks, 1);

    expect(db.updateTaskStatus).toHaveBeenCalledWith(1, 'in_progress');
    expect(ipcRenderer.send).toHaveBeenCalledWith('tasks-updated');
  });

  it('does not update an unknown task', async () => {
    // Verifica que un identificador inexistente no provoca una escritura accidental.
    await toggleTaskStatus(tasks, 999);

    expect(db.updateTaskStatus).not.toHaveBeenCalled();
    expect(ipcRenderer.send).not.toHaveBeenCalled();
  });

  it('updates tracked time and deletes tasks through the database API', async () => {
    // Verifica las operaciones de tiempo trabajado y eliminación de tareas.
    db.updateTaskTime.mockResolvedValue(undefined);
    db.deleteTask.mockResolvedValue(undefined);

    await updateTaskTime(2, 30);
    await deleteTask(2);

    expect(db.updateTaskTime).toHaveBeenCalledWith(2, 30);
    expect(db.deleteTask).toHaveBeenCalledWith(2);
    expect(ipcRenderer.send).toHaveBeenCalledTimes(2);
    expect(ipcRenderer.send).toHaveBeenNthCalledWith(1, 'tasks-updated');
    expect(ipcRenderer.send).toHaveBeenNthCalledWith(2, 'tasks-updated');
  });

  it('subscribes and unsubscribes from task updates', () => {
    // Verifica que la suscripción devuelve una limpieza correcta del listener IPC.
    const callback = vi.fn();
    const unsubscribe = subscribeToTaskUpdates(callback);

    expect(ipcRenderer.on).toHaveBeenCalledWith('tasks-updated', callback);

    unsubscribe();

    expect(ipcRenderer.off).toHaveBeenCalledWith('tasks-updated', callback);
  });
});
