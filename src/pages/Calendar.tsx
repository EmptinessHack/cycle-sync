import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivySafe } from '../hooks/usePrivySafe';
import { generateHormonalActivities, convertToScheduledTasks } from '../utils/hormonalAgent';
import type { HormonalAgentInput, HormonalAgentResponse, Symptom, UnScheduledActivity } from '../types/hormonal';
import { getCyclePhase } from '../utils/cycleLogic';
import { getCurrentCycleDay } from '../utils/cycleCalculator';
import { loadUserData, saveUserData } from '../utils/storage';
import { findScheduleConflicts, hasScheduleConflicts, removeTasksFromSchedule } from '../utils/scheduleValidator';
import type { ScheduledTask, Task } from '../types';
import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import styles from './Calendar.module.css';

// Síntomas disponibles como chips
const AVAILABLE_SYMPTOMS: Symptom[] = [
  'baja energía',
  'alta energía',
  'dolor de cabeza',
  'ligero dolor de cabeza',
  'cólicos',
  'hinchazón',
  'cambios de humor',
  'ansiedad',
  'fatiga',
  'insomnio',
  'dolor de espalda',
  'sensibilidad mamaria',
  'acné',
  'ansiedad por comida',
  'nauseas',
];

const Calendar = () => {
  const navigate = useNavigate();
  const { user, authenticated } = usePrivySafe();
  
  // Estados
  const [userData, setUserData] = useState<ReturnType<typeof loadUserData>>(null);
  const [currentCycleDay, setCurrentCycleDay] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [proposedSchedule, setProposedSchedule] = useState<ScheduledTask[] | null>(null);
  const [agentResponse, setAgentResponse] = useState<HormonalAgentResponse | null>(null);
  const [generatingActivities, setGeneratingActivities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const saved = loadUserData();
    if (!saved || saved.tasks.length === 0) {
      navigate('/setup');
      return;
    }
    
    setUserData(saved);
    // Calcular día del ciclo automáticamente
    const calculatedDay = getCurrentCycleDay(saved);
    setCurrentCycleDay(calculatedDay);
  }, [navigate]);

  // Obtener tareas flexibles y fijas
  const { flexibleTasks, fixedTasks } = useMemo(() => {
    if (!userData) return { flexibleTasks: [], fixedTasks: [] };
    
    return {
      flexibleTasks: userData.tasks.filter(t => !t.isFixed),
      fixedTasks: userData.tasks.filter(t => t.isFixed),
    };
  }, [userData]);

  // Generar propuesta de reorganización
  const handleGenerateProposal = async () => {
    if (!userData) return;
    
    setGeneratingActivities(true);
    setError(null);
    
    try {
      const hormonalPhase = getCyclePhase(currentCycleDay);
      
      // Usar las tareas flexibles como "objetivos" (actividades a reorganizar)
      const input: HormonalAgentInput = {
        cycleDay: currentCycleDay,
        hormonalPhase,
        symptoms: selectedSymptoms,
        goals: flexibleTasks.map(t => t.title) as any[], // Tareas como objetivos
        fixedActivities: fixedTasks.map(t => ({
          title: t.title,
          duration: parseFloat(t.duration.replace(':', '.')) || 1,
          startTime: t.startTime,
          category: t.category,
        })),
        variableActivities: flexibleTasks.map(t => ({
          title: t.title,
          category: t.category,
          duration: parseFloat(t.duration.replace(':', '.')) || 1,
        })),
        preferences: {
          intensity: 'media',
          timeAvailability: 8,
        },
        existingTasks: userData.tasks,
      };

      const response = await generateHormonalActivities(input, false);
      
      // Convertir actividades generadas a ScheduledTask
      // Solo reorganizar las tareas flexibles
      const newSchedule: ScheduledTask[] = [
        // Mantener tareas fijas del schedule original
        ...(userData.schedule.filter(st => {
          const originalTask = userData.tasks.find(t => t.id === st.taskId);
          return originalTask?.isFixed;
        })),
        // Agregar tareas flexibles reorganizadas
        ...convertToScheduledTasks(
          response.activities.filter(act => 
            flexibleTasks.some(ft => ft.title === act.title)
          )
        ),
      ];
      
      setProposedSchedule(newSchedule);
      // Guardar respuesta completa para mostrar recomendaciones
      setAgentResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar propuesta');
      console.error('Error al generar propuesta:', err);
    } finally {
      setGeneratingActivities(false);
    }
  };

  // Eliminar actividad de la propuesta
  const handleRemoveTask = (taskId: string) => {
    if (!proposedSchedule) return;
    
    const updatedSchedule = proposedSchedule.filter(task => task.id !== taskId);
    setProposedSchedule(updatedSchedule);
  };

  // Validar conflictos en el schedule propuesto
  const scheduleConflicts = useMemo(() => {
    if (!proposedSchedule) return [];
    return findScheduleConflicts(proposedSchedule);
  }, [proposedSchedule]);

  const hasConflicts = scheduleConflicts.length > 0;

  // Aceptar cambios y actualizar weekly-schedule
  const handleAcceptChanges = () => {
    if (!userData || !proposedSchedule) return;
    
    // Validar que no haya conflictos antes de aceptar
    if (hasConflicts) {
      setError('No se pueden aceptar cambios con conflictos de horario. Por favor, elimina las tareas que se empalman.');
      return;
    }
    
    // Actualizar datos del usuario con el nuevo schedule
    const updatedData = {
      ...userData,
      cycleDay: currentCycleDay,
      schedule: proposedSchedule,
    };
    
    saveUserData(updatedData);
    
    // Navegar a weekly-schedule
    navigate('/weekly-schedule');
  };

  // Toggle síntoma
  const toggleSymptom = (symptom: Symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  if (!userData) {
    return (
      <div className={styles.container}>
        <TopHeader />
        <div className={styles.content}>
          <p>Cargando...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const currentPhase = getCyclePhase(currentCycleDay);
  const hasChanges = proposedSchedule && JSON.stringify(proposedSchedule) !== JSON.stringify(userData.schedule);

  return (
    <div className={styles.container}>
      <TopHeader />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>🧠 Reorganización Inteligente</h1>
          <p className={styles.subtitle}>
            Reorganiza tus tareas flexibles según tu fase hormonal actual
          </p>
        </div>

        {/* Información del ciclo */}
        <div className={styles.cycleInfo}>
          <div className={styles.cycleInfoItem}>
            <span className={styles.cycleInfoLabel}>Día del ciclo:</span>
            <span className={styles.cycleInfoValue}>{currentCycleDay}</span>
          </div>
          <div className={styles.cycleInfoItem}>
            <span className={styles.cycleInfoLabel}>Fase:</span>
            <span className={styles.cycleInfoValue}>{currentPhase}</span>
          </div>
        </div>

        {/* Síntomas como chips */}
        <div className={styles.symptomsSection}>
          <label className={styles.sectionLabel}>Síntomas (opcional):</label>
          <div className={styles.symptomsChips}>
            {AVAILABLE_SYMPTOMS.map(symptom => (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`${styles.symptomChip} ${
                  selectedSymptoms.includes(symptom) ? styles.symptomChipSelected : ''
                }`}
              >
                {symptom}
                {selectedSymptoms.includes(symptom) && <span className={styles.chipRemove}>×</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Tareas a reorganizar */}
        <div className={styles.tasksSection}>
          <label className={styles.sectionLabel}>
            Tareas flexibles a reorganizar ({flexibleTasks.length}):
          </label>
          <div className={styles.tasksList}>
            {flexibleTasks.length === 0 ? (
              <p className={styles.noTasks}>No hay tareas flexibles para reorganizar</p>
            ) : (
              flexibleTasks.map(task => (
                <div key={task.id} className={styles.taskChip}>
                  {task.title} ({task.category})
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botón para generar propuesta */}
        <button
          onClick={handleGenerateProposal}
          disabled={generatingActivities || flexibleTasks.length === 0}
          className={styles.generateButton}
        >
          {generatingActivities ? 'Generando propuesta...' : 'Generar Propuesta de Reorganización'}
        </button>

        {error && (
          <div className={styles.errorCard}>
            <p className={styles.errorText}>⚠️ {error}</p>
          </div>
        )}

        {/* Propuesta de cambios */}
        {proposedSchedule && (
          <div className={styles.proposalSection}>
            <h2 className={styles.proposalTitle}>📋 Propuesta de Reorganización</h2>
            <p className={styles.proposalDescription}>
              Esta es la propuesta de reorganización de tus tareas flexibles según tu fase actual ({currentPhase}).
            </p>

            {hasChanges ? (
              <>
                {/* Recomendación de descanso */}
                {agentResponse?.restRecommendation && (
                  <div className={styles.restRecommendation}>
                    <h4 className={styles.restTitle}>💤 Recomendación de Descanso</h4>
                    <p className={styles.restText}>{agentResponse.restRecommendation}</p>
                  </div>
                )}

                {/* Actividades no agendadas */}
                {agentResponse?.unScheduledActivities && agentResponse.unScheduledActivities.length > 0 && (
                  <div className={styles.unScheduledSection}>
                    <h4 className={styles.unScheduledTitle}>
                      ⏸️ Actividades No Agendadas ({agentResponse.unScheduledActivities.length})
                    </h4>
                    <p className={styles.unScheduledSubtitle}>
                      Estas actividades no se han agendado para esta semana según tu fase hormonal y síntomas:
                    </p>
                    <div className={styles.unScheduledList}>
                      {agentResponse.unScheduledActivities.map((unScheduled, idx) => (
                        <div key={idx} className={styles.unScheduledItem}>
                          <div className={styles.unScheduledHeader}>
                            <span className={styles.unScheduledActivityName}>{unScheduled.title}</span>
                            <span className={styles.unScheduledCategory}>{unScheduled.category}</span>
                          </div>
                          <p className={styles.unScheduledReason}>{unScheduled.reason}</p>
                          {unScheduled.alternativeSuggestion && (
                            <p className={styles.unScheduledAlternative}>
                              💡 {unScheduled.alternativeSuggestion}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className={styles.reevaluateActions}>
                      <button
                        onClick={handleGenerateProposal}
                        className={styles.reevaluateButton}
                      >
                        🔄 Reevaluar Actividades
                      </button>
                      <p className={styles.reevaluateNote}>
                        Puedes modificar tus síntomas o generar una nueva propuesta
                      </p>
                    </div>
                  </div>
                )}

                <div className={styles.changesSummary}>
                  <p>
                    <strong>{proposedSchedule.length}</strong> tareas programadas
                    {proposedSchedule.length !== userData.schedule.length && (
                      <span> (antes: {userData.schedule.length})</span>
                    )}
                    {agentResponse?.unScheduledActivities && agentResponse.unScheduledActivities.length > 0 && (
                      <span> • {agentResponse.unScheduledActivities.length} no agendadas</span>
                    )}
                  </p>
                </div>

                {/* Advertencia de conflictos */}
                {hasConflicts && (
                  <div className={styles.conflictsWarning}>
                    <h4 className={styles.conflictsTitle}>⚠️ Conflictos de horario detectados</h4>
                    <p className={styles.conflictsText}>
                      Hay {scheduleConflicts.length} conflicto(s) de horario. Por favor, elimina las tareas que se empalman antes de aceptar.
                    </p>
                    <div className={styles.conflictsList}>
                      {scheduleConflicts.map((conflict, idx) => (
                        <div key={idx} className={styles.conflictItem}>
                          <span className={styles.conflictDate}>{conflict.date}</span>
                          <span className={styles.conflictTime}>{conflict.timeRange}</span>
                          <div className={styles.conflictTasks}>
                            {conflict.tasks.map(task => (
                              <span key={task.id} className={styles.conflictTaskName}>
                                {task.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.proposedTasks}>
                  <h3 className={styles.proposedTasksTitle}>
                    Nuevo calendario propuesto ({proposedSchedule.length} tareas):
                  </h3>
                  <p className={styles.proposedTasksSubtitle}>
                    Puedes eliminar tareas haciendo clic en el botón ×
                  </p>
                  <div className={styles.tasksPreview}>
                    {proposedSchedule.map((task) => {
                      const isInConflict = scheduleConflicts.some(c => 
                        c.tasks.some(t => t.id === task.id)
                      );
                      
                      return (
                        <div 
                          key={task.id} 
                          className={`${styles.taskPreviewItem} ${isInConflict ? styles.taskPreviewItemConflict : ''}`}
                        >
                          <div className={styles.taskPreviewHeader}>
                            <div className={styles.taskPreviewHeaderLeft}>
                              <span className={styles.taskPreviewTitle}>{task.title}</span>
                              <span className={styles.taskPreviewCategory}>{task.category}</span>
                              {isInConflict && (
                                <span className={styles.conflictBadge}>⚠️ Conflicto</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveTask(task.id)}
                              className={styles.removeTaskButton}
                              title="Delete task"
                              aria-label="Delete task"
                            >
                              🗑️
                              <span className={styles.tooltip}>Delete task</span>
                            </button>
                          </div>
                          <div className={styles.taskPreviewDetails}>
                            <span>{task.date}</span>
                            <span>{task.startTime} - {task.endTime}</span>
                            <span className={styles.energyBadge} data-level={task.energyLevel}>
                              {task.energyLevel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={handleAcceptChanges}
                    disabled={hasConflicts}
                    className={styles.acceptButton}
                    title={hasConflicts ? 'Resuelve los conflictos antes de aceptar' : ''}
                  >
                    ✓ Aceptar Cambios y Actualizar Calendario
                  </button>
                  <button
                    onClick={() => setProposedSchedule(null)}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.noChanges}>
                <p>No se requieren cambios. Tu calendario actual ya está optimizado para esta fase.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Calendar;
