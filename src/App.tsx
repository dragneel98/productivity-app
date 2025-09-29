import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { PomodoroTimer } from './components/PomodoroTimer';
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

  // Función para actualizar el tiempo trabajado en una tarea
  const updateTaskTime = async (taskId: number, minutesWorked: number) => {
    try {
      // Actualizar la tarea en la base de datos
      await window.db.updateTaskTime(taskId, minutesWorked);
      // Actualizar el estado local
      setTasks(tasks.map(task => {
        if (task.id === taskId) {
          const updatedHours = (task.estimatedHours || 0) - (minutesWorked / 60);
          return {
            ...task,
            estimatedHours: Math.max(0, updatedHours)
          };
        }
        return task;
      }));
    } catch (error) {
      console.error('Error actualizando el tiempo de la tarea:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Productivity App</h1>
      </header>
      <main>
        <div className="main-content">
          <div className="left-column">
            <TaskForm addTask={addTask} />
            <TaskList tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} />
          </div>
          <div className="right-column">
            <PomodoroTimer 
              tasks={tasks.filter(t => t.status !== 'completed')} 
              onTimeTracked={updateTaskTime} 
            />
            <Dashboard tasks={tasks} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
