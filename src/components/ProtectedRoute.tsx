import { Navigate } from 'react-router-dom';
import LoadingScreen from './login/LoadingScreen';
import { usePrivySafe } from '../hooks/usePrivySafe';
import { useDemoAuth } from '../contexts/DemoAuthContext';
import { PRIVY_APP_ID } from '../config/privy';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const hasPrivy = PRIVY_APP_ID && PRIVY_APP_ID.trim() !== '';
  const { ready, authenticated } = usePrivySafe();
  const { isAuthenticated: isDemoAuthenticated } = useDemoAuth();
  
  // Si está autenticado en modo demo, permitir acceso
  if (isDemoAuthenticated) {
    return <>{children}</>;
  }
  
  // Si no hay Privy configurado, redirigir al login
  if (!hasPrivy) {
    return <Navigate to="/" replace />;
  }

  // Mostrar loading mientras Privy se inicializa
  if (!ready) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, redirigir al login
  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;

