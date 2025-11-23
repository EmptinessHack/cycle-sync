export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';

export type RepeatFrequency = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  category: string;
  isFixed: boolean;
  duration: string; // Format: "HH:MM"
  date?: string; // For fixed tasks
  startTime?: string; // For fixed tasks
  endTime?: string; // For fixed tasks
  deadline?: string; // For flexible tasks
  repeatFrequency?: RepeatFrequency; // How often the task repeats
  isProject?: boolean;
}

export interface ScheduledTask {
  id: string;
  taskId: string;
  title: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  phase: CyclePhase;
  energyLevel: 'high' | 'medium' | 'low';
  isProject?: boolean;
  repeats?: boolean;
}

export interface UserData {
  cycleDay: number;
  lastPeriodDate?: string; // YYYY-MM-DD - Fecha del último periodo para calcular el día actual
  cycleLength?: number; // Longitud del ciclo en días (default: 28)
  tasks: Task[];
  schedule: ScheduledTask[];
  
}
