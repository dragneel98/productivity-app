import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import PomodoroTimer from './components/PomodoroTimer';
import Dashboard from './components/Dashboard';
import type { Task } from './types/task';
import './index.css';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const fetchedTasks = await window.db.getTasks();
    setTasks(fetchedTasks);
  };

  useEffect(() => {
    fetchTasks();

    const handleTaskUpdate = () => fetchTasks();
    window.ipcRenderer.on('tasks-updated', handleTaskUpdate);

    return () => {
      window.ipcRenderer.off('tasks-updated', handleTaskUpdate);
    };
  }, []);

  const addTask = async (title: string, estimatedHours: number) => {
    await window.db.addTask({ title, estimatedHours });
    window.ipcRenderer.send('tasks-updated');
  };

 const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      let newStatus: "pending" | "in_progress" | "completed" = "pending";
      if (task.status === "pending") {
        newStatus = "in_progress";
      } else if (task.status === "in_progress") {
        newStatus = "completed";
      } else {
        newStatus = "pending";
      }
      await window.db.updateTaskStatus(id, newStatus);
      window.ipcRenderer.send('tasks-updated');
    }
  };

  const deleteTask = async (id: number) => {
    await window.db.deleteTask(id);
    window.ipcRenderer.send('tasks-updated');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Productivity App</h1>
      </header>
      <main>
        <TaskForm addTask={addTask} />
        <PomodoroTimer />
        <TaskList tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} />
        <Dashboard tasks={tasks} />
      </main>
    </div>
  );
};

export default App;
