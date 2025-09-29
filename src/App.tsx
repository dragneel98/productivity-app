import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import PomodoroTimer from './components/PomodoroTimer';
import Dashboard from './components/Dashboard';
import type { Task } from './types/task';
import './index.css';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (name: string, estimatedHours: number) => {
    const newTask: Task = {
      id: Date.now(),
      name,
      estimatedHours,
      completed: false,
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
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
