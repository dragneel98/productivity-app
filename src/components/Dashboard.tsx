import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Task } from '../types/task';
import '../styles/Dashboard.css';

interface DashboardProps {
  tasks: Task[];
}

type TimeRange = 'day' | 'week' | 'month';

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filtrar tareas completadas
  const completedTasks = useMemo(() => 
    tasks.filter(task => task.status === 'completed'),
    [tasks]
  );

  // Agrupar tareas por día/semana/mes
  const chartData = useMemo(() => {
    const now = new Date(selectedDate);
    let startDate = new Date(now);
    let endDate = new Date(now);
    
    // Ajustar el rango de fechas según la selección
    if (timeRange === 'day') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeRange === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para que la semana empiece en lunes
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else { // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Filtrar tareas en el rango de fechas
    const tasksInRange = completedTasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });

    // Agrupar por fecha
    const grouped = tasksInRange.reduce((acc, task) => {
      const taskDate = new Date(task.createdAt);
      let key: string;
      
      if (timeRange === 'day') {
        key = taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeRange === 'week') {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        key = days[taskDate.getDay()];
      } else { // month
        key = `Día ${taskDate.getDate()}`;
      }

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += task.estimatedHours || 0;
      return acc;
    }, {} as Record<string, number>);

    // Convertir a array para el gráfico
    return Object.entries(grouped).map(([name, horas]) => ({
      name,
      'Horas trabajadas': Number(horas.toFixed(1))
    }));
  }, [completedTasks, timeRange, selectedDate]);

  // Calcular total de horas
  const totalHours = useMemo(
    () => chartData.reduce((sum, item) => sum + item['Horas trabajadas'], 0),
    [chartData]
  );

  // Calcular horas por tipo de tarea
  const hoursByTaskType = useMemo(() => {
    const types = new Map<string, number>();
    completedTasks.forEach(task => {
      const type = task.title.split(':')[0] || 'Otras';
      types.set(type, (types.get(type) || 0) + (task.estimatedHours || 0));
    });
    return Array.from(types.entries()).map(([name, value]) => ({
      name,
      'Horas': Number(value.toFixed(1))
    }));
  }, [completedTasks]);

  const handleDateChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    if (timeRange === 'day') {
      newDate.setDate(newDate.getDate() + increment);
    } else if (timeRange === 'week') {
      newDate.setDate(newDate.getDate() + (increment * 7));
    } else { // month
      newDate.setMonth(newDate.getMonth() + increment);
    }
    setSelectedDate(newDate);
  };

  const formatDateRange = () => {
    const now = new Date(selectedDate);
    if (timeRange === 'day') {
      return now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    } else if (timeRange === 'week') {
      const start = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
    } else { // month
      return now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Resumen de Productividad</h2>
        <div className="dashboard-controls">
          <button 
            className={`time-range-btn ${timeRange === 'day' ? 'active' : ''}`}
            onClick={() => setTimeRange('day')}
          >
            Día
          </button>
          <button 
            className={`time-range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Semana
          </button>
          <button 
            className={`time-range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Mes
          </button>
          
          <div className="date-navigation">
            <button onClick={() => handleDateChange(-1)}>&lt;</button>
            <span className="current-period">{formatDateRange()}</span>
            <button onClick={() => handleDateChange(1)}>&gt;</button>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total horas trabajadas</h3>
          <p className="stat-value">{totalHours.toFixed(1)} hrs</p>
        </div>
        <div className="stat-card">
          <h3>Tareas completadas</h3>
          <p className="stat-value">{completedTasks.length}</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Horas por {timeRange === 'day' ? 'hora' : timeRange === 'week' ? 'día' : 'día'}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label="Horas" />
              <Tooltip formatter={(value) => [`${value} horas`, 'Horas trabajadas']} />
              <Legend />
              <Bar 
                dataKey="Horas trabajadas" 
                name="Horas trabajadas"
                fill="#4f46e5" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Horas por tipo de tarea</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hoursByTaskType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label="Horas" />
              <Tooltip formatter={(value) => [`${value} horas`, 'Horas']} />
              <Bar 
                dataKey="Horas" 
                name="Horas"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
