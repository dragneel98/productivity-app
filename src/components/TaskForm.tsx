import React, { useState } from 'react';
import { addTask } from '../services/taskService';

const TaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    const parsedHours = Number(hours);
    if (trimmed && !Number.isNaN(parsedHours) && parsedHours >= 0) {
      try {
        await addTask({ title: trimmed, estimatedHours: parsedHours });
        setTitle('');
        setHours('');
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        type="number"
        placeholder="Hours"
        min="0"
        step="0.5"
        value={hours}
        onChange={e => setHours(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
