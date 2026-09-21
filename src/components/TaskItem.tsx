import React from 'react';
import type { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <div className={`task-item ${task.status}`}>
      <div className="task-info">
        <input
          type="checkbox"
          checked={task.status === 'completed'}
          onChange={() => onToggle(task.id)}
        /> 
        <span className="task-name">{task.title}</span>
        <span className="task-status">Status: {task.status}</span>
        <span className="task-hours">Horas: {task.estimatedHours}</span>
      </div>
      <div className="task-actions">
        <button onClick={() => onDelete(task.id)} className="delete-btn">
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
