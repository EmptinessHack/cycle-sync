import React, { createContext, useContext, ReactNode } from 'react';

interface PrivyDemoContextType {
  ready: boolean;
  authenticated: boolean;
  user: any;
  login: (options?: any) => Promise<void>;
  logout: () => Promise<void>;
}

const PrivyDemoContext = createContext<PrivyDemoContextType | undefined>(undefined);

// Valores demo por defecto
const demoValue: PrivyDemoContextType = {
  ready: true,
  authenticated: false,
  user: null,
  login: async () => {
    console.warn('⚠️ Modo demo: Login no disponible sin Privy App ID');
  },
  logout: async () => {
    console.warn('⚠️ Modo demo: Logout no disponible sin Privy App ID');
  },
};

export const PrivyDemoProvider = ({ children }: { children: ReactNode }) => {
  return (
    <PrivyDemoContext.Provider value={demoValue}>
      {children}
    </PrivyDemoContext.Provider>
  );
};

export const usePrivyDemo = () => {
  const context = useContext(PrivyDemoContext);
  if (!context) {
    throw new Error('usePrivyDemo must be used within PrivyDemoProvider');
  }
  return context;
};

