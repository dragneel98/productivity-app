import React from 'react';
import type { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, toggleTask, deleteTask }) => {
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-info">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(task.id)}
        />
        <span className="task-name">{task.name}</span>
        <span className="task-hours">{task.estimatedHours}h</span>
      </div>
      <div className="task-actions">
        <button onClick={() => deleteTask(task.id)} className="delete-btn">Delete</button>
      </div>
    </div>
  );
};

export default TaskItem;
