import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Task } from '../types/task';

interface DashboardProps {
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;

  const data = [
    {
      name: 'Tasks',
      Completed: completedTasks,
      Pending: pendingTasks,
      'In Progress': inProgressTasks,
    },
  ];

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Completed" stackId="a" fill="#82ca9d" />
          <Bar dataKey="Pending" stackId="a" fill="#e94560" />
          <Bar dataKey="In Progress" stackId="a" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard;
