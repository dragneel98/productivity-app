import type { Task } from '../types/task';

export const getTasks = async (): Promise<Task[]> => {
  return window.db.getTasks();
};

export const addTask = async (task: { title: string; estimatedHours: number }): Promise<void> => {
  await window.db.addTask(task);
  window.ipcRenderer.send('tasks-updated');
};

export const toggleTaskStatus = async (tasks: Task[], id: number): Promise<void> => {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  let newStatus: "pending" | "in_progress" | "completed" = "pending";
  if (task.status === "pending") {
    newStatus = "in_progress";
  } else if (task.status === "in_progress") {
    newStatus = "completed";
  }
  
  await window.db.updateTaskStatus(id, newStatus);
  window.ipcRenderer.send('tasks-updated');
};

export const deleteTask = async (id: number): Promise<void> => {
  await window.db.deleteTask(id);
  window.ipcRenderer.send('tasks-updated');
};

export const updateTaskTime = async ( taskId: number, minutesWorked: number): Promise<void> => {
  try {
    await window.db.updateTaskTime(taskId, minutesWorked);
    window.ipcRenderer.send('tasks-updated');
  } catch (error) {
    console.error('Error updating task time:', error);
    throw error;
  }
};

export const subscribeToTaskUpdates = (callback: () => void): (() => void) => {
  window.ipcRenderer.on('tasks-updated', callback);
  
  return () => {
    window.ipcRenderer.off('tasks-updated', callback);
  };
};
