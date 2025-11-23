import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '../components/login/WelcomeScreen';
import LoginScreen from '../components/login/LoginScreen';
import ConfirmationScreen from '../components/login/ConfirmationScreen';
import LoadingScreen from '../components/login/LoadingScreen';
import { usePrivySafe } from '../hooks/usePrivySafe';
import { useDemoAuth } from '../contexts/DemoAuthContext';
import { PRIVY_APP_ID } from '../config/privy';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const hasPrivy = PRIVY_APP_ID && PRIVY_APP_ID.trim() !== '';
  const { ready, authenticated, user } = usePrivySafe();
  const { isAuthenticated: isDemoAuthenticated, bypassLogin } = useDemoAuth();
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'confirmation'>('welcome');
  const [email, setEmail] = useState('');
  const [showUI, setShowUI] = useState(!hasPrivy); // Si no hay Privy, mostrar UI inmediatamente

  // Si está autenticado en modo demo, redirigir a setup
  // Si el bypass expira, redirigir de vuelta al login
  useEffect(() => {
    if (isDemoAuthenticated) {
      navigate('/setup');
    } else if (!isDemoAuthenticated && hasPrivy && !authenticated) {
      // Si el bypass expiró y no hay autenticación real, quedarse en login
      // (esto se maneja automáticamente por el estado)
    }
  }, [isDemoAuthenticated, navigate, hasPrivy, authenticated]);

  // Timeout para mostrar la UI si Privy no se inicializa (modo demo)
  useEffect(() => {
    if (!hasPrivy) {
      setShowUI(true);
      return;
    }

    const timer = setTimeout(() => {
      if (!ready) {
        console.warn('Privy no se inicializó. Mostrando UI en modo demo.');
        setShowUI(true);
      }
    }, 2000); // Esperar 2 segundos antes de mostrar UI

    if (ready) {
      setShowUI(true);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [ready, hasPrivy]);

  // Log del privy_id cuando el usuario esté autenticado
  useEffect(() => {
    if (hasPrivy && ready && authenticated && user) {
      console.log(`Usuario autenticado - Privy ID: ${user.id}`);
      // Redirigir a setup después del login
      navigate('/setup');
    }
  }, [ready, authenticated, user, navigate, hasPrivy]);

  // Mostrar loading solo si Privy está inicializando y aún no ha pasado el timeout
  if (hasPrivy && !ready && !showUI) {
    return (
      <div className={styles.container}>
        <LoadingScreen />
      </div>
    );
  }

  if (hasPrivy && authenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <h1>¡Bienvenido a Plan4Her!</h1>
          <p>Has iniciado sesión correctamente.</p>
          <p className={styles.privyId}>Privy ID: {user?.id}</p>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    setCurrentScreen('login');
  };

  const handleAlreadyHaveAccount = () => {
    setCurrentScreen('login');
  };

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setCurrentScreen('confirmation');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  const handleBypass = () => {
    bypassLogin();
    navigate('/setup');
  };

  return (
    <div className={styles.container}>
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onGetStarted={handleGetStarted}
          onAlreadyHaveAccount={handleAlreadyHaveAccount}
          onBypass={handleBypass}
        />
      )}
      {currentScreen === 'login' && (
        <LoginScreen
          onEmailSubmit={handleEmailSubmit}
          onBack={handleBackToLogin}
          onBypass={handleBypass}
        />
      )}
      {currentScreen === 'confirmation' && (
        <ConfirmationScreen
          email={email}
          onBack={handleBackToLogin}
          onBypass={handleBypass}
        />
      )}
    </div>
  );
};

export default Login;
