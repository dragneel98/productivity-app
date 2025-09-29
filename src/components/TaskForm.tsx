import React, { useState } from 'react';

interface TaskFormProps {
  addTask: (name: string, estimatedHours: number) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ addTask }) => {
  const [name, setName] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && estimatedHours) {
      addTask(name, parseFloat(estimatedHours));
      setName('');
      setEstimatedHours('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        placeholder="Task name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Estimated hours"
        value={estimatedHours}
        onChange={e => setEstimatedHours(e.target.value)}
        step="0.5"
        min="0"
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
