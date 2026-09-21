import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Task } from '../types/task';
import '../styles/Dashboard.css';

interface DashboardProps {
  tasks: Task[];
}

type TimeRange = 'day' | 'week' | 'month';

const getDateRange = (date: Date, timeRange: TimeRange): [Date, Date] => {
  const startDate = new Date(date);
  const endDate = new Date(date);

  if (timeRange === 'day') {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (timeRange === 'week') {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
    endDate.setTime(startDate.getTime());
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    endDate.setMonth(endDate.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
  }

  return [startDate, endDate];
};

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Las horas trabajadas existen aunque la tarea todavía no esté completada.
  const trackedTasks = useMemo(() =>
    tasks.filter(task => task.workedHours > 0),
    [tasks]
  );

  // Filtrar tareas completadas para el contador independiente del tiempo trabajado.
  const completedTasks = useMemo(() => 
    tasks.filter(task => task.status === 'completed'),
    [tasks]
  );

  const tasksInRange = useMemo(() => {
    const [startDate, endDate] = getDateRange(selectedDate, timeRange);
    return trackedTasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [trackedTasks, timeRange, selectedDate]);

  const completedTasksInRange = useMemo(() => {
    const [startDate, endDate] = getDateRange(selectedDate, timeRange);
    return completedTasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [completedTasks, timeRange, selectedDate]);

  // Agrupar tareas por día/semana/mes
  const chartData = useMemo(() => {

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
      acc[key] += task.workedHours || 0;
      return acc;
    }, {} as Record<string, number>);

    // Convertir a array para el gráfico
    return Object.entries(grouped).map(([name, horas]) => ({
      name,
      'Horas trabajadas': Number(horas.toFixed(2))
    }));
  }, [tasksInRange, timeRange]);

  // Calcular total de horas
  const totalHours = useMemo(
    () => tasksInRange.reduce((sum, task) => sum + (task.workedHours || 0), 0),
    [tasksInRange]
  );

  // Calcular horas por tipo de tarea
  const hoursByTaskType = useMemo(() => {
    const types = new Map<string, number>();
    tasksInRange.forEach(task => {
      const type = task.title.split(':')[0] || 'Otras';
      types.set(type, (types.get(type) || 0) + (task.workedHours || 0));
    });
    return Array.from(types.entries()).map(([name, value]) => ({
      name,
      'Horas': Number(value.toFixed(2))
    }));
  }, [tasksInRange]);

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
          <p className="stat-value">{totalHours.toFixed(2)} hrs</p>
        </div>
        <div className="stat-card">
          <h3>Tareas completadas</h3>
          <p className="stat-value">{completedTasksInRange.length}</p>
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
