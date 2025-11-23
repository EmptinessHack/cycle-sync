/**
 * Tipos relacionados con el agente de calendario hormonal
 */

import { CyclePhase, Task, ScheduledTask } from './index';

/**
 * Síntomas que el usuario puede reportar
 */
export type Symptom = 
  | 'baja energía'
  | 'alta energía'
  | 'dolor de cabeza'
  | 'ligero dolor de cabeza'
  | 'cólicos'
  | 'hinchazón'
  | 'cambios de humor'
  | 'ansiedad'
  | 'fatiga'
  | 'insomnio'
  | 'dolor de espalda'
  | 'sensibilidad mamaria'
  | 'acné'
  | 'ansiedad por comida'
  | 'nauseas'
  | 'otros';

/**
 * Objetivos del usuario
 */
export type Goal = 
  | 'mejorar resistencia'
  | 'bajar estrés'
  | 'aumentar productividad'
  | 'mejorar bienestar emocional'
  | 'fitness'
  | 'salud mental'
  | 'equilibrio trabajo-vida'
  | 'crecimiento personal'
  | 'descanso y recuperación'
  | 'otros';

/**
 * Intensidad de actividad
 */
export type Intensity = 'baja' | 'media' | 'alta';

/**
 * Actividad fija del usuario
 */
export interface FixedActivity {
  title: string;
  duration: number; // Duración en horas
  startTime?: string; // Hora de inicio opcional
  category?: string;
}

/**
 * Actividad variable del usuario
 */
export interface VariableActivity {
  title: string;
  category: string;
  preferredTime?: 'morning' | 'afternoon' | 'evening';
  duration?: number; // Duración en horas
}

/**
 * Preferencias del usuario
 */
export interface UserPreferences {
  intensity: Intensity;
  timeAvailability: number; // Horas disponibles por día
  preferredCategories?: string[];
  avoidCategories?: string[];
  restDays?: number[]; // Días de la semana (0-6) donde prefiere descansar
}

/**
 * Input para el agente hormonal
 */
export interface HormonalAgentInput {
  cycleDay: number;
  hormonalPhase: CyclePhase;
  symptoms: Symptom[];
  goals: Goal[];
  fixedActivities: FixedActivity[];
  variableActivities: VariableActivity[];
  preferences: UserPreferences;
  existingTasks?: Task[]; // Tareas existentes del usuario
}

/**
 * Actividad generada por el agente
 */
export interface GeneratedActivity {
  title: string;
  category: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: string; // HH:MM
  phase: CyclePhase;
  energyLevel: 'high' | 'medium' | 'low';
  reason?: string; // Razón por la que se recomienda esta actividad
  repeatFrequency?: 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
  isFixed: boolean;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Respuesta del agente hormonal
 */
export interface HormonalAgentResponse {
  activities: GeneratedActivity[];
  recommendations: string[]; // Recomendaciones generales
  phaseInsights: string; // Insights sobre la fase actual
  energyForecast: {
    today: 'high' | 'medium' | 'low';
    tomorrow: 'high' | 'medium' | 'low';
    week: 'high' | 'medium' | 'low';
  };
}

