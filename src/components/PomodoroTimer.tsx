import React from 'react';
import type { Task } from '../types/task';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import '../styles/Pomodoro.css';

interface PomodoroTimerProps {
  tasks: Task[];
  onTimeTracked: (taskId: number, minutesWorked: number) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ tasks, onTimeTracked }) => {
  const {
    audioRef,
    selectedTaskId,
    setSelectedTaskId,
    isActive,
    isBreak,
    elapsedTime,
    workDuration,
    setWorkDuration,
    breakDuration,
    setBreakDuration,
    longBreakDuration,
    setLongBreakDuration,
    sessionsBeforeLongBreak,
    setSessionsBeforeLongBreak,
    remainingTime,
    showSettings,
    setShowSettings,
    toggleTimer,
    resetTimer,
    skipBreak,
  } = usePomodoroTimer({ onTimeTracked });

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const availableTasks = tasks.filter(
    (task) => task.status === 'pending' || task.status === 'in_progress',
  );

  return (
    <div className={`pomodoro-timer ${isBreak ? 'break-mode' : ''}`}>
      <h2>{isBreak ? 'Break Time!' : 'Pomodoro Timer'}</h2>

      <div className="task-selector">
        <select
          value={selectedTaskId || ''}
          onChange={(event) => setSelectedTaskId(Number(event.target.value))}
          disabled={isActive}
          className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select a task</option>
          {availableTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </div>

      {elapsedTime > 0 && !isBreak && (
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
          disabled={!selectedTaskId && !isBreak}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Duration (minutes):
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={workDuration / 60}
                onChange={(event) => setWorkDuration(Math.max(1, Math.min(60, Number(event.target.value))) * 60)}
                disabled={isActive}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Short Break (minutes):
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={breakDuration / 60}
                onChange={(event) => setBreakDuration(Math.max(1, Math.min(30, Number(event.target.value))) * 60)}
                disabled={isActive}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Long Break (minutes):
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={longBreakDuration / 60}
                onChange={(event) => setLongBreakDuration(Math.max(1, Math.min(60, Number(event.target.value))) * 60)}
                disabled={isActive}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sessions before long break:
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={sessionsBeforeLongBreak}
                onChange={(event) => setSessionsBeforeLongBreak(Math.max(1, Math.min(10, Number(event.target.value))))}
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
