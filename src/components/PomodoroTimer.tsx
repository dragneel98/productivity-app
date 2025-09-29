import React, { useState, useRef } from 'react';
import type { Task } from '../types/task';
import '../styles/Pomodoro.css';

interface PomodoroTimerProps {
  tasks: Task[];
  onTimeTracked: (taskId: number, minutesWorked: number) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ tasks, onTimeTracked }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | ''>('');
  const [minutes, setMinutes] = useState<number>(25);
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [workDuration, setWorkDuration] = useState<number>(25);
  const [breakDuration, setBreakDuration] = useState<number>(5);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(15);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState<number>(4);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const availableTasks = tasks.filter(task => 
    task.status === 'pending' || task.status === 'in_progress'
  );

  // Reiniciar el temporizador
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workDuration);
    setSeconds(0);
    setElapsedTime(0);
  };

  // Saltar descanso
  const skipBreak = () => {
    setIsBreak(false);
    setMinutes(workDuration);
    setSeconds(0);
  };

  // Alternar el temporizador
  const toggleTimer = () => {
    if (!selectedTaskId) return;
    
    if (isActive) {
      // Pausar el temporizador
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Actualizar el tiempo trabajado en la tarea
      if (selectedTaskId && !isBreak) {
        const totalSeconds = (workDuration - minutes - 1) * 60 + (60 - seconds);
        const minutesWorked = Math.ceil(totalSeconds / 60);
        if (minutesWorked > 0) {
          onTimeTracked(Number(selectedTaskId), minutesWorked);
        }
      }
    } else {
      // Iniciar el temporizador
      setIsActive(true);
      
      // Si el temporizador está en 0:00, reiniciar con la duración actual
      if (minutes === 0 && seconds === 0) {
        setMinutes(isBreak ? breakDuration : workDuration);
        setSeconds(0);
      }
    }
  };

  return (
    <div className={`pomodoro-timer ${isBreak ? 'break-mode' : ''}`}>
      <h2>{isBreak ? 'Break Time!' : 'Pomodoro Timer'}</h2>
      
      <div className="task-selector">
        <select 
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : '')}
          disabled={isActive}
          className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select a task</option>
          {availableTasks.map(task => (
            <option key={task.id} value={task.id}>
              {task.title} ({task.estimatedHours.toFixed(1)}h remaining)
            </option>
          ))}
        </select>
      </div>
      
      {elapsedTime > 0 && (
        <div className="elapsed-time">
          Time worked on task: {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
        </div>
      )}
      
      <div className="time-display">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      <div className="timer-controls">
        <button 
          onClick={toggleTimer} 
          disabled={!selectedTaskId || (!isActive && !isBreak)}
          className={`px-4 py-2 rounded-md font-medium ${
            isActive 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium"
        >
          Reset
        </button>
        <button 
          onClick={skipBreak} 
          disabled={!isBreak || isActive}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip Break
        </button>
      </div>
      
      <div className="pomodoro-settings mt-4">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>
        
        {showSettings && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Duration (minutes):</label>
              <input 
                type="number" 
                min="1" 
                max="60"
                value={workDuration}
                onChange={(e) => setWorkDuration(Math.max(1, Math.min(60, Number(e.target.value))))}
                disabled={isActive}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Break (minutes):</label>
              <input 
                type="number" 
                min="1" 
                max="30"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Math.max(1, Math.min(30, Number(e.target.value))))}
                disabled={isActive}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Long Break (minutes):</label>
              <input 
                type="number" 
                min="1" 
                max="60"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Math.max(1, Math.min(60, Number(e.target.value))))}
                disabled={isActive}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sessions before long break:</label>
              <input 
                type="number" 
                min="1" 
                max="10"
                value={sessionsBeforeLongBreak}
                onChange={(e) => setSessionsBeforeLongBreak(Math.max(1, Math.min(10, Number(e.target.value))))}
                disabled={isActive}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
      
      <audio 
        ref={audioRef} 
        src="https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3" 
        preload="auto"
      />
    </div>
  );
};
