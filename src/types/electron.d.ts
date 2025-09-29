import { Task } from './task';

declare global {
  interface Window {
    ipcRenderer: {
      send: (channel: string, ...args: any[]) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      off: (channel: string, listener: (...args: any[]) => void) => void;
    };
    db: {
      getTasks: () => Promise<Task[]>;
      addTask: (task: { title: string; description?: string; estimatedHours: number }) => Promise<any>;
      updateTaskStatus: (id: number, status: 'pending' | 'in_progress' | 'completed') => Promise<any>;
      updateTaskTime: (id: number, minutesWorked: number) => Promise<void>;
      deleteTask: (id: number) => Promise<any>;
    }
  }
}

export {};
