"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("db", {
  getTasks: () => electron.ipcRenderer.invoke("get-tasks"),
  addTask: (task) => electron.ipcRenderer.invoke("add-task", task),
  updateTaskStatus: (id, status) => electron.ipcRenderer.invoke("update-task-status", { id, status }),
  updateTaskTime: (id, minutesWorked) => electron.ipcRenderer.invoke("update-task-time", { id, minutesWorked }),
  deleteTask: (id) => electron.ipcRenderer.invoke("delete-task", id)
});
