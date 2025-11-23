/**
 * Utilidades para calcular el día del ciclo basado en fechas
 */

/**
 * Calcula el día del ciclo actual basado en la fecha del último periodo
 * 
 * @param lastPeriodDate - Fecha del último periodo en formato YYYY-MM-DD
 * @param cycleLength - Longitud del ciclo en días (default: 28)
 * @returns Día del ciclo (1-28 o según cycleLength)
 */
export function calculateCycleDay(
  lastPeriodDate: string,
  cycleLength: number = 28
): number {
  const lastPeriod = new Date(lastPeriodDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastPeriod.setHours(0, 0, 0, 0);
  
  // Calcular diferencia en días
  const diffTime = today.getTime() - lastPeriod.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Calcular día del ciclo (1-indexed, cíclico)
  const cycleDay = (diffDays % cycleLength) + 1;
  
  return cycleDay;
}

/**
 * Obtiene el día del ciclo actual desde UserData
 * Si hay lastPeriodDate, calcula automáticamente
 * Si no, usa cycleDay directamente
 * 
 * @param userData - Datos del usuario
 * @returns Día del ciclo actual
 */
export function getCurrentCycleDay(userData: { cycleDay: number; lastPeriodDate?: string; cycleLength?: number }): number {
  if (userData.lastPeriodDate) {
    return calculateCycleDay(userData.lastPeriodDate, userData.cycleLength || 28);
  }
  return userData.cycleDay;
}

