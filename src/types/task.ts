export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedHours: number;
  workedHours: number;
  createdAt: string;
}
