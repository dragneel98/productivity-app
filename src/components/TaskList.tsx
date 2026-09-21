import React from 'react';
import TaskItem from './TaskItem';
import { toggleTaskStatus, deleteTask } from '../services/taskService';
import type { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdated }) => {
  const handleToggleTask = async (id: number) => {
    try {
      await toggleTaskStatus(tasks, id);
      onTaskUpdated?.();
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      onTaskUpdated?.();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="task-list">
      {tasks?.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
      ))}
    </div>
  );
};

export default TaskList;
