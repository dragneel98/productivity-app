import { contextBridge, ipcRenderer } from 'electron';

// --------- Expose some API to the Renderer process --------- 
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

// Expose database API directly on window.db, matching src/types/electron.d.ts
contextBridge.exposeInMainWorld('db', {
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  addTask: (task: { title: string; description?: string; estimatedHours: number }) =>
    ipcRenderer.invoke('add-task', task),
  updateTaskStatus: (id: number, status: 'pending' | 'in_progress' | 'completed') =>
    ipcRenderer.invoke('update-task-status', { id, status }),
  updateTaskTime: (id: number, minutesWorked: number) =>
    ipcRenderer.invoke('update-task-time', { id, minutesWorked }),
  deleteTask: (id: number) => ipcRenderer.invoke('delete-task', id),
});
