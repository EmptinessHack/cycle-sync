/**
 * Agente de Calendario Hormonal
 * 
 * Genera actividades personalizadas basadas en el ciclo hormonal,
 * síntomas, objetivos y preferencias del usuario.
 */

import { getCyclePhase } from './cycleLogic';
import type { CyclePhase } from '../types';
import type {
  HormonalAgentInput,
  HormonalAgentResponse,
  GeneratedActivity,
  UnScheduledActivity,
  Symptom,
  Goal,
  FixedActivity,
  VariableActivity,
} from '../types/hormonal';

/**
 * Prompt del sistema para el agente hormonal
 */
const SYSTEM_PROMPT = `🧠 System Prompt — "Hormonal Cycle Calendar Agent"

Rol:
Eres un agente experto en salud hormonal y planificación personalizada de actividades. Tu tarea es generar actividades en un calendario diario o semanal basándote en las fases del ciclo hormonal, síntomas reportados, hábitos, preferencias del usuario y objetivos personales.

🎯 Objetivo del agente

Generar una lista estructurada de actividades recomendadas para cada día, considerando:

- Día del ciclo hormonal
- Fase actual (menstrual, folicular, ovulatoria, luteal)
- Síntomas presentes o pasados
- Objetivos del usuario (salud, desempeño, bienestar emocional, productividad, fitness, etc.)
- Categoría de cada tarea
- Frecuencia de repetición (repeatFrequency)
- Actividades fijas y variables del usuario
- Restricciones de tiempo / energía
- Notas o preferencias del usuario

El resultado debe ser útil, accionable y bien estructurado.

📤 Output esperado

Debes retornar un JSON válido con la siguiente estructura:

{
  "activities": [
    {
      "title": "Nombre de la actividad",
      "category": "Categoría (fitness, bienestar, trabajo, etc.)",
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "duration": "HH:MM",
      "phase": "Menstrual | Follicular | Ovulatory | Luteal",
      "energyLevel": "high | medium | low",
      "reason": "Breve explicación de por qué se recomienda",
      "repeatFrequency": "none | daily | weekdays | weekly | monthly",
      "isFixed": true | false,
      "priority": "high | medium | low"
    }
  ],
  "recommendations": [
    "Recomendación general 1",
    "Recomendación general 2"
  ],
  "phaseInsights": "Insights sobre la fase actual del ciclo",
  "energyForecast": {
    "today": "high | medium | low",
    "tomorrow": "high | medium | low",
    "week": "high | medium | low"
  }
}

IMPORTANTE:
- Las actividades deben ser realistas y accionables
- Considera las actividades fijas del usuario y no las dupliques
- Distribuye las actividades variables de manera inteligente según la fase
- Respeta las restricciones de tiempo y energía
- Las actividades deben estar bien distribuidas a lo largo del día
- Considera los síntomas reportados para ajustar las recomendaciones`;

/**
 * Genera el prompt del usuario basado en el input
 */
function generateUserPrompt(input: HormonalAgentInput): string {
  const phaseDescriptions = {
    Menstrual: 'Fase de descanso y reflexión - tiempo para autocuidado suave',
    Follicular: 'Energía en aumento - ideal para trabajo profundo y aprendizaje',
    Ovulatory: 'Energía máxima - perfecto para reuniones importantes y trabajo creativo',
    Luteal: 'Energía disminuyendo - enfócate en terminar y organizar',
  };

  const fixedActivitiesStr = input.fixedActivities
    .map(a => `- ${a.title} (${a.duration}h${a.startTime ? ` a las ${a.startTime}` : ''})`)
    .join('\n');

  const variableActivitiesStr = input.variableActivities
    .map(a => `- ${a.title} (${a.category}${a.duration ? `, ${a.duration}h` : ''})`)
    .join('\n');

  return `Genera un calendario de actividades para:

📅 Día del ciclo: ${input.cycleDay}
🌙 Fase hormonal: ${input.hormonalPhase} - ${phaseDescriptions[input.hormonalPhase]}

🤒 Síntomas reportados: ${input.symptoms.length > 0 ? input.symptoms.join(', ') : 'ninguno'}

🎯 Objetivos: ${input.goals.join(', ')}

⏰ Actividades fijas (ya programadas):
${fixedActivitiesStr || 'Ninguna'}

🔄 Actividades variables (a programar):
${variableActivitiesStr || 'Ninguna'}

⚙️ Preferencias:
- Intensidad preferida: ${input.preferences.intensity}
- Tiempo disponible: ${input.preferences.timeAvailability} horas/día
${input.preferences.preferredCategories ? `- Categorías preferidas: ${input.preferences.preferredCategories.join(', ')}` : ''}
${input.preferences.avoidCategories ? `- Categorías a evitar: ${input.preferences.avoidCategories.join(', ')}` : ''}

Genera actividades para los próximos 7 días, distribuyéndolas inteligentemente según la fase hormonal, síntomas y objetivos.`;
}

/**
 * Procesa la respuesta del agente (simulado por ahora)
 * En producción, esto se conectaría con un modelo de IA real
 */
function processAgentResponse(
  input: HormonalAgentInput,
  aiResponse: string
): HormonalAgentResponse {
  try {
    // Intentar parsear JSON de la respuesta
    const parsed = JSON.parse(aiResponse);
    
    // Validar y normalizar actividades
    const activities: GeneratedActivity[] = (parsed.activities || []).map((act: any) => ({
      title: act.title || 'Actividad sin título',
      category: act.category || 'general',
      date: act.date || new Date().toISOString().split('T')[0],
      startTime: act.startTime || '09:00',
      endTime: act.endTime || '10:00',
      duration: act.duration || '01:00',
      phase: (act.phase as CyclePhase) || input.hormonalPhase,
      energyLevel: act.energyLevel || 'medium',
      reason: act.reason,
      repeatFrequency: act.repeatFrequency || 'none',
      isFixed: act.isFixed || false,
      priority: act.priority || 'medium',
    }));

    return {
      activities,
      unScheduledActivities: parsed.unScheduledActivities || undefined,
      recommendations: parsed.recommendations || [],
      phaseInsights: parsed.phaseInsights || '',
      energyForecast: parsed.energyForecast || {
        today: 'medium',
        tomorrow: 'medium',
        week: 'medium',
      },
      restRecommendation: parsed.restRecommendation || undefined,
    };
  } catch (error) {
    console.error('Error al procesar respuesta del agente:', error);
    // Retornar respuesta por defecto
    return generateDefaultResponse(input);
  }
}

/**
 * Convierte hora en formato "HH:MM" a minutos desde medianoche
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Encuentra el próximo slot disponible para una actividad en un día
 */
function findNextAvailableSlot(
  date: string,
  duration: number,
  existingActivities: GeneratedActivity[],
  fixedActivities: FixedActivity[],
  startHour: number = 9
): { startTime: string; endTime: string } | null {
  const dayActivities = existingActivities.filter(a => a.date === date);
  const slots: Array<{ start: number; end: number }> = [];
  
  // Agregar slots ocupados por actividades fijas
  // Las actividades fijas tienen startTime en formato "HH:MM" o pueden tener fecha
  fixedActivities.forEach(fixed => {
    if (fixed.startTime) {
      // Si startTime contiene fecha, extraerla; si no, asumir que es del mismo día
      const timeStr = fixed.startTime.includes('T') 
        ? fixed.startTime.split('T')[1]?.split(':').slice(0, 2).join(':') || fixed.startTime
        : fixed.startTime;
      
      // Si la actividad fija tiene fecha específica, verificar que coincida
      // Por ahora, asumimos que si tiene startTime, es del día actual
      const fixedStart = timeToMinutes(timeStr);
      slots.push({ start: fixedStart, end: fixedStart + (fixed.duration * 60) });
    }
  });
  
  // Agregar slots ocupados por actividades ya generadas
  dayActivities.forEach(act => {
    slots.push({
      start: timeToMinutes(act.startTime),
      end: timeToMinutes(act.endTime),
    });
  });
  
  // Ordenar slots por hora de inicio
  slots.sort((a, b) => a.start - b.start);
  
  // Buscar primer slot disponible
  let currentTime = startHour * 60; // Empezar desde startHour
  const endOfDay = 22 * 60; // Hasta las 10 PM
  
  for (const slot of slots) {
    if (currentTime + (duration * 60) <= slot.start) {
      // Encontramos un slot disponible
      const startMinutes = currentTime;
      const endMinutes = startMinutes + (duration * 60);
      
      return {
        startTime: `${Math.floor(startMinutes / 60).toString().padStart(2, '0')}:${(startMinutes % 60).toString().padStart(2, '0')}`,
        endTime: `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`,
      };
    }
    // Actualizar currentTime al final del slot ocupado
    currentTime = Math.max(currentTime, slot.end);
  }
  
  // Verificar si hay espacio al final del día
  if (currentTime + (duration * 60) <= endOfDay) {
    const startMinutes = currentTime;
    const endMinutes = startMinutes + (duration * 60);
    
    return {
      startTime: `${Math.floor(startMinutes / 60).toString().padStart(2, '0')}:${(startMinutes % 60).toString().padStart(2, '0')}`,
      endTime: `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`,
    };
  }
  
  return null; // No hay espacio disponible
}

/**
 * Detecta si una actividad es "pesada" o de alta intensidad
 */
function isHeavyActivity(activity: VariableActivity): boolean {
  const heavyKeywords = [
    'fitness', 'deporte', 'ejercicio', 'gym', 'correr', 'running',
    'cardio', 'entrenamiento', 'workout', 'crossfit', 'pesas',
    'natación', 'ciclismo', 'bicicleta', 'yoga intenso', 'pilates intenso'
  ];
  
  const titleLower = activity.title.toLowerCase();
  const categoryLower = activity.category.toLowerCase();
  
  return heavyKeywords.some(keyword => 
    titleLower.includes(keyword) || categoryLower.includes(keyword)
  );
}

/**
 * Determina si una actividad debe agendarse según la fase y síntomas
 */
function shouldScheduleActivity(
  activity: VariableActivity,
  phase: CyclePhase,
  symptoms: Symptom[],
  weekIndex: number
): { shouldSchedule: boolean; reason?: string; suggestedAction?: 'skip' | 'postpone' | 'modify' } {
  const isHeavy = isHeavyActivity(activity);
  const hasLowEnergy = symptoms.includes('baja energía') || symptoms.includes('fatiga');
  const hasCramps = symptoms.includes('cólicos');
  const hasPain = symptoms.includes('dolor de cabeza') || symptoms.includes('dolor de espalda');
  
  // Fase Menstrual: evitar actividades pesadas
  if (phase === 'Menstrual' && isHeavy) {
    return {
      shouldSchedule: false,
      reason: `Durante la fase menstrual, es mejor evitar actividades físicas intensas como "${activity.title}". Tu cuerpo necesita descanso y recuperación.`,
      suggestedAction: 'skip'
    };
  }
  
  // Fase Menstrual con síntomas: evitar cualquier actividad pesada
  if (phase === 'Menstrual' && (hasCramps || hasPain) && isHeavy) {
    return {
      shouldSchedule: false,
      reason: `Con los síntomas que reportas (${hasCramps ? 'cólicos' : ''}${hasCramps && hasPain ? ' y ' : ''}${hasPain ? 'dolor' : ''}), es mejor descansar esta semana y evitar "${activity.title}".`,
      suggestedAction: 'skip'
    };
  }
  
  // Fase Luteal con baja energía: evitar actividades pesadas
  if (phase === 'Luteal' && hasLowEnergy && isHeavy) {
    return {
      shouldSchedule: false,
      reason: `Con la baja energía que reportas y estando en la fase luteal, es mejor evitar actividades físicas intensas como "${activity.title}" esta semana.`,
      suggestedAction: 'postpone'
    };
  }
  
  // Síntomas generales de baja energía con actividades pesadas
  if (hasLowEnergy && isHeavy && (phase === 'Menstrual' || phase === 'Luteal')) {
    return {
      shouldSchedule: false,
      reason: `Con la baja energía que reportas, considera descansar esta semana en lugar de hacer "${activity.title}".`,
      suggestedAction: 'modify'
    };
  }
  
  return { shouldSchedule: true };
}

/**
 * Genera una respuesta por defecto basada en reglas simples
 * (Fallback cuando no hay IA disponible)
 */
function generateDefaultResponse(input: HormonalAgentInput): HormonalAgentResponse {
  const activities: GeneratedActivity[] = [];
  const unScheduledActivities: UnScheduledActivity[] = [];
  const today = new Date();
  const currentPhase = getCyclePhase(input.cycleDay);
  
  // Verificar si hay recomendación de descanso para la semana
  const needsRestWeek = currentPhase === 'Menstrual' || 
    (currentPhase === 'Luteal' && (input.symptoms.includes('baja energía') || input.symptoms.includes('fatiga')));
  
  // Generar actividades para los próximos 7 días
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const cycleDay = ((input.cycleDay + i - 1) % 28) + 1;
    const phase = getCyclePhase(cycleDay);
    
    // Determinar nivel de energía según la fase
    let energyLevel: 'high' | 'medium' | 'low';
    let startHour: number;
    
    if (phase === 'Follicular' || phase === 'Ovulatory') {
      energyLevel = 'high';
      startHour = 9; // Mañana para alta energía
    } else if (phase === 'Luteal') {
      energyLevel = 'medium';
      startHour = 10; // Media mañana
    } else {
      energyLevel = 'low';
      startHour = 14; // Tarde para baja energía
    }
    
    // Evaluar cada actividad variable
    input.variableActivities.forEach((varAct) => {
      // Verificar si debe agendarse
      const scheduleDecision = shouldScheduleActivity(varAct, phase, input.symptoms, i);
      
      if (!scheduleDecision.shouldSchedule) {
        // Agregar a actividades no agendadas si no está ya en la lista
        const alreadyUnScheduled = unScheduledActivities.some(u => u.title === varAct.title);
        if (!alreadyUnScheduled) {
          unScheduledActivities.push({
            title: varAct.title,
            category: varAct.category,
            reason: scheduleDecision.reason || 'No recomendado para esta fase',
            suggestedAction: scheduleDecision.suggestedAction || 'skip',
            alternativeSuggestion: scheduleDecision.suggestedAction === 'modify' 
              ? `Considera hacer una versión más suave de "${varAct.title}" o reemplazarla con una actividad de descanso como yoga suave, meditación o caminata ligera.`
              : scheduleDecision.suggestedAction === 'postpone'
              ? `Puedes posponer "${varAct.title}" para la próxima semana cuando tengas más energía.`
              : undefined
          });
        }
        return; // No agendar esta actividad
      }
      
      // Si debe agendarse, buscar slot disponible
      const duration = varAct.duration || 1;
      const slot = findNextAvailableSlot(
        dateStr,
        duration,
        activities,
        input.fixedActivities,
        startHour
      );
      
      if (slot) {
        activities.push({
          title: varAct.title,
          category: varAct.category,
          date: dateStr,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: `${Math.floor(duration).toString().padStart(2, '0')}:${((duration % 1) * 60).toString().padStart(2, '0')}`,
          phase,
          energyLevel,
          isFixed: false,
          priority: 'medium',
        });
      }
    });
  }
  
  const recommendations = [
    `Durante la fase ${input.hormonalPhase}, es recomendable ${input.hormonalPhase === 'Menstrual' ? 'descansar y hacer actividades suaves' : input.hormonalPhase === 'Follicular' ? 'aprovechar la energía creciente para tareas importantes' : input.hormonalPhase === 'Ovulatory' ? 'hacer actividades que requieren máxima energía' : 'enfocarse en terminar proyectos y organizar'}.`,
    ...(input.symptoms.includes('baja energía') ? ['Considera reducir la intensidad de las actividades debido a la baja energía reportada.'] : []),
    ...(input.goals.includes('bajar estrés') ? ['Incluye actividades de relajación y mindfulness en tu rutina.'] : []),
  ];
  
  // Generar recomendación de descanso si es necesario
  let restRecommendation: string | undefined;
  if (needsRestWeek && unScheduledActivities.length > 0) {
    const heavyActivities = unScheduledActivities.filter(u => isHeavyActivity({ title: u.title, category: u.category }));
    if (heavyActivities.length > 0) {
      restRecommendation = `Esta semana es mejor descansar. ${heavyActivities.length} actividad${heavyActivities.length > 1 ? 'es' : ''} física${heavyActivities.length > 1 ? 's' : ''} no se ha agendado porque tu fase hormonal y síntomas sugieren que es momento de recuperación. Puedes reevaluar estas actividades o agregar alternativas más suaves.`;
    }
  }
  
  return {
    activities,
    unScheduledActivities: unScheduledActivities.length > 0 ? unScheduledActivities : undefined,
    recommendations,
    phaseInsights: `Estás en la fase ${input.hormonalPhase} del ciclo. ${input.hormonalPhase === 'Menstrual' ? 'Es momento de descanso y autocuidado.' : input.hormonalPhase === 'Follicular' ? 'Tu energía está aumentando, ideal para nuevos proyectos.' : input.hormonalPhase === 'Ovulatory' ? 'Estás en tu pico de energía, aprovecha para actividades importantes.' : 'Tu energía está disminuyendo, enfócate en terminar tareas pendientes.'}`,
    energyForecast: {
      today: getCyclePhase(input.cycleDay) === 'Follicular' || getCyclePhase(input.cycleDay) === 'Ovulatory' ? 'high' : getCyclePhase(input.cycleDay) === 'Luteal' ? 'medium' : 'low',
      tomorrow: getCyclePhase(((input.cycleDay % 28) + 1)) === 'Follicular' || getCyclePhase(((input.cycleDay % 28) + 1)) === 'Ovulatory' ? 'high' : getCyclePhase(((input.cycleDay % 28) + 1)) === 'Luteal' ? 'medium' : 'low',
      week: 'medium',
    },
    restRecommendation,
  };
}

/**
 * Genera actividades usando el agente hormonal
 * 
 * @param input - Datos del usuario para el agente
 * @param useOasis - Si es true, usa Oasis para procesamiento privado (futuro)
 * @returns Respuesta del agente con actividades generadas
 */
export async function generateHormonalActivities(
  input: HormonalAgentInput,
  useOasis: boolean = false
): Promise<HormonalAgentResponse> {
  // Validar input
  if (input.cycleDay < 1 || input.cycleDay > 28) {
    throw new Error('El día del ciclo debe estar entre 1 y 28');
  }

  // Generar prompts
  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = generateUserPrompt(input);

  // TODO: En producción, esto se conectaría con un modelo de IA real
  // Por ahora, usamos la respuesta por defecto basada en reglas
  // Si useOasis es true, en el futuro se podría usar Oasis Sapphire para procesamiento privado
  
  if (useOasis) {
    console.log('🔒 Usando Oasis para procesamiento privado del agente hormonal');
    // TODO: Implementar integración con Oasis para procesamiento privado
    // Esto podría usar smart contracts en Oasis Sapphire para procesar datos de forma confidencial
  }

  // Por ahora, generar respuesta por defecto
  // En producción, esto sería una llamada a una API de IA
  const aiResponse = JSON.stringify(generateDefaultResponse(input));
  
  return processAgentResponse(input, aiResponse);
}

/**
 * Mapea energyLevel a energyType para compatibilidad con WeeklySchedule
 */
function mapEnergyLevelToType(energyLevel: 'high' | 'medium' | 'low', phase: CyclePhase): 'deep-work' | 'admin' | 'social' | 'rest' {
  if (energyLevel === 'high') {
    return 'deep-work';
  } else if (energyLevel === 'medium') {
    return phase === 'Luteal' ? 'admin' : 'social';
  } else {
    return 'rest';
  }
}

/**
 * Convierte actividades generadas a ScheduledTask
 * Compatible con ambos tipos: el de types/index.ts y el de lib/mockSchedule.ts
 */
export function convertToScheduledTasks(
  activities: GeneratedActivity[]
): import('../types').ScheduledTask[] {
  return activities.map(act => {
    const energyType = mapEnergyLevelToType(act.energyLevel, act.phase);
    
    return {
      id: `generated-${act.date}-${act.startTime}-${Date.now()}`,
      taskId: `task-${act.title.toLowerCase().replace(/\s+/g, '-')}`,
      title: act.title,
      category: act.category,
      date: act.date,
      startTime: act.startTime,
      endTime: act.endTime,
      phase: act.phase,
      energyLevel: act.energyLevel,
      // Campos adicionales para compatibilidad con WeeklySchedule
      energyType: energyType as any,
      cycleDay: 1, // Se calculará después si es necesario
      cyclePhase: act.phase as any,
      isProject: act.category.toLowerCase().includes('proyecto'),
      repeats: act.repeatFrequency !== 'none',
    } as import('../types').ScheduledTask;
  });
}

