import { usePrivy } from '@privy-io/react-auth';
import { usePrivyDemo } from '../contexts/PrivyDemoContext';
import { PRIVY_APP_ID } from '../config/privy';

/**
 * Hook seguro para usar Privy que maneja el caso cuando no está configurado
 * 
 * IMPORTANTE: Este hook siempre llama a ambos hooks (usePrivy y usePrivyDemo).
 * App.tsx se encarga de proporcionar PrivyProvider cuando hay App ID.
 * Si no hay App ID, usePrivy() puede fallar, pero usePrivyDemo() siempre está disponible.
 */
export const usePrivySafe = () => {
  const hasPrivy = PRIVY_APP_ID && PRIVY_APP_ID.trim() !== '';
  
  // Siempre llamar a ambos hooks (regla de hooks de React)
  // usePrivyDemo siempre está disponible (PrivyDemoProvider siempre está presente)
  const demoHook = usePrivyDemo();
  
  // usePrivy - App.tsx siempre proporciona PrivyProvider (incluso con appId inválido)
  // Si no hay PrivyProvider, esto lanzará un error que React mostrará
  // Pero App.tsx siempre tiene PrivyProvider, así que esto debería funcionar
  const privyHook = usePrivy();

  // Si hay Privy configurado, usar el hook real
  // Si no, usar demo
  if (hasPrivy) {
    return privyHook;
  }

  // Usar demo cuando no hay Privy configurado
  return demoHook;
};

