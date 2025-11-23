/**
 * Utilidades para validar schedules y detectar conflictos
 */

import type { ScheduledTask } from '../types';

/**
 * Convierte una hora en formato "HH:MM" a minutos desde medianoche
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Verifica si dos tareas se empalman (solapan) en tiempo
 */
function tasksOverlap(task1: ScheduledTask, task2: ScheduledTask): boolean {
  // Solo verificar si están en la misma fecha
  if (task1.date !== task2.date) return false;
  
  const start1 = timeToMinutes(task1.startTime);
  const end1 = timeToMinutes(task1.endTime);
  const start2 = timeToMinutes(task2.startTime);
  const end2 = timeToMinutes(task2.endTime);
  
  // Verificar si hay solapamiento
  // Dos tareas se solapan si:
  // - El inicio de una está dentro del rango de la otra, o
  // - El final de una está dentro del rango de la otra, o
  // - Una tarea contiene completamente a la otra
  return (start1 < end2 && end1 > start2);
}

/**
 * Encuentra todos los conflictos (empalmes) en un schedule
 * 
 * @param schedule - Array de tareas programadas
 * @returns Array de conflictos, cada conflicto contiene las tareas que se empalman
 */
export function findScheduleConflicts(schedule: ScheduledTask[]): Array<{
  tasks: ScheduledTask[];
  date: string;
  timeRange: string;
}> {
  const conflicts: Array<{
    tasks: ScheduledTask[];
    date: string;
    timeRange: string;
  }> = [];
  
  // Agrupar tareas por fecha
  const tasksByDate: Record<string, ScheduledTask[]> = {};
  schedule.forEach(task => {
    if (!tasksByDate[task.date]) {
      tasksByDate[task.date] = [];
    }
    tasksByDate[task.date].push(task);
  });
  
  // Verificar conflictos en cada fecha
  Object.entries(tasksByDate).forEach(([date, tasks]) => {
    // Comparar cada par de tareas
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        if (tasksOverlap(tasks[i], tasks[j])) {
          // Encontrar si ya existe un conflicto con estas tareas
          const existingConflict = conflicts.find(c => 
            c.date === date && 
            c.tasks.some(t => t.id === tasks[i].id || t.id === tasks[j].id)
          );
          
          if (existingConflict) {
            // Agregar tareas al conflicto existente si no están ya
            const allTaskIds = existingConflict.tasks.map(t => t.id);
            if (!allTaskIds.includes(tasks[i].id)) {
              existingConflict.tasks.push(tasks[i]);
            }
            if (!allTaskIds.includes(tasks[j].id)) {
              existingConflict.tasks.push(tasks[j]);
            }
          } else {
            // Crear nuevo conflicto
            const startTimes = [tasks[i].startTime, tasks[j].startTime].map(timeToMinutes);
            const endTimes = [tasks[i].endTime, tasks[j].endTime].map(timeToMinutes);
            const minStart = Math.min(...startTimes);
            const maxEnd = Math.max(...endTimes);
            
            const startHour = Math.floor(minStart / 60);
            const startMin = minStart % 60;
            const endHour = Math.floor(maxEnd / 60);
            const endMin = maxEnd % 60;
            
            conflicts.push({
              tasks: [tasks[i], tasks[j]],
              date,
              timeRange: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')} - ${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
            });
          }
        }
      }
    }
  });
  
  return conflicts;
}

/**
 * Verifica si un schedule tiene conflictos
 */
export function hasScheduleConflicts(schedule: ScheduledTask[]): boolean {
  return findScheduleConflicts(schedule).length > 0;
}

/**
 * Filtra un schedule eliminando tareas específicas
 */
export function removeTasksFromSchedule(
  schedule: ScheduledTask[],
  taskIdsToRemove: string[]
): ScheduledTask[] {
  return schedule.filter(task => !taskIdsToRemove.includes(task.id));
}

