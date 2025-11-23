import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

interface DemoAuthContextType {
  isAuthenticated: boolean;
  bypassLogin: () => void;
  logout: () => void;
  timeRemaining: number | null;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

const BYPASS_DURATION = 30 * 1000; // 30 segundos en milisegundos

export const DemoAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Verificar si hay una sesión demo activa al cargar
  useEffect(() => {
    const savedAuth = localStorage.getItem('demo-auth');
    const savedStartTime = localStorage.getItem('demo-auth-start-time');
    
    if (savedAuth === 'true' && savedStartTime) {
      const startTime = parseInt(savedStartTime, 10);
      const elapsed = Date.now() - startTime;
      const remaining = BYPASS_DURATION - elapsed;
      
      if (remaining > 0) {
        // La sesión aún es válida
        setIsAuthenticated(true);
        startTimeRef.current = startTime;
        setTimeRemaining(remaining);
        startTimer(remaining);
      } else {
        // La sesión expiró
        localStorage.removeItem('demo-auth');
        localStorage.removeItem('demo-auth-start-time');
      }
    }
  }, []);

  const startTimer = (duration: number) => {
    // Limpiar timer anterior si existe
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Actualizar tiempo restante cada segundo
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = BYPASS_DURATION - elapsed;
        
        if (remaining > 0) {
          setTimeRemaining(remaining);
        } else {
          // Tiempo expirado
          setIsAuthenticated(false);
          setTimeRemaining(null);
          localStorage.removeItem('demo-auth');
          localStorage.removeItem('demo-auth-start-time');
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          console.log('⏰ Modo demo: Bypass expirado después de 30 segundos');
        }
      }
    }, 1000);
  };

  const bypassLogin = () => {
    const startTime = Date.now();
    setIsAuthenticated(true);
    setTimeRemaining(BYPASS_DURATION);
    startTimeRef.current = startTime;
    
    // Guardar en localStorage
    localStorage.setItem('demo-auth', 'true');
    localStorage.setItem('demo-auth-start-time', startTime.toString());
    
    console.log('🔓 Modo demo: Login bypass activado (válido por 30 segundos)');
    startTimer(BYPASS_DURATION);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setTimeRemaining(null);
    startTimeRef.current = null;
    localStorage.removeItem('demo-auth');
    localStorage.removeItem('demo-auth-start-time');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    console.log('🔒 Modo demo: Logout realizado');
  };

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <DemoAuthContext.Provider value={{ isAuthenticated, bypassLogin, logout, timeRemaining }}>
      {children}
    </DemoAuthContext.Provider>
  );
};

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error('useDemoAuth must be used within DemoAuthProvider');
  }
  return context;
};

