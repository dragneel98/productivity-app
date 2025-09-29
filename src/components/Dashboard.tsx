// import React from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import type { Task } from '../types/task';

// interface DashboardProps {
//   tasks: Task[];
// }

// const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
//   const completedTasks = tasks.filter(task => task.completed);

//   const data = [
//     {
//       name: 'Tasks',
//       completed: completedTasks.length,
//       remaining: tasks.length - completedTasks.length,
//     },
//   ];

//   return (
//     <div className="dashboard">
//       <h2>Dashboard</h2>
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="completed" fill="#82ca9d" />
//           <Bar dataKey="remaining" fill="#e94560" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default Dashboard;
