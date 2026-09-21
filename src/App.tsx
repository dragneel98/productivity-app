import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { PomodoroTimer } from './components/PomodoroTimer';
import Dashboard from './components/Dashboard';
import { getTasks, updateTaskTime, subscribeToTaskUpdates } from './services/taskService';
import type { Task } from './types/task';
import './index.css';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const fetchedTasks = await getTasks();
    setTasks(fetchedTasks);
  };

  useEffect(() => {
    fetchTasks();
    const unsubscribe = subscribeToTaskUpdates(fetchTasks);
    return () => unsubscribe();
  }, []);

  const handleUpdateTaskTime = async (taskId: number, minutesWorked: number) => {
    try {
      await updateTaskTime(taskId, minutesWorked);
      await fetchTasks(); // Refresh tasks to get updated times
    } catch (error) {
      console.error('Error updating task time:', error);
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
            <TaskForm />
            <TaskList 
              tasks={tasks} 
            />
          </div>
          <div className="right-column">
            <PomodoroTimer 
              tasks={tasks.filter(t => t.status !== 'completed')} 
              onTimeTracked={handleUpdateTaskTime} 
            />
            <Dashboard tasks={tasks} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
