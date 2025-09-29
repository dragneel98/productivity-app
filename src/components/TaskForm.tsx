import React, { useState } from 'react';

interface TaskFormProps {
  addTask: (title: string, estimatedHours: number) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ addTask }) => {
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    const parsedHours = Number(hours);
    if (trimmed && !Number.isNaN(parsedHours) && parsedHours >= 0) {
      addTask(trimmed, parsedHours);
      setTitle('');
      setHours('');
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
        placeholder="Estimated hours"
        value={hours}
        min={0}
        step={0.5}
        onChange={e => setHours(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
