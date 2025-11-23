import { useState } from 'react';
import { usePrivySafe } from '../../hooks/usePrivySafe';
import { useDemoAuth } from '../../contexts/DemoAuthContext';
import { PRIVY_APP_ID } from '../../config/privy';
import styles from './LoginScreen.module.css';

interface LoginScreenProps {
  onEmailSubmit: (email: string) => void;
  onBack: () => void;
  onBypass: () => void;
}

const LoginScreen = ({ onEmailSubmit, onBack, onBypass }: LoginScreenProps) => {
  const { login } = usePrivySafe();
  const { timeRemaining } = useDemoAuth();
  const hasPrivy = PRIVY_APP_ID && PRIVY_APP_ID.trim() !== '';
  const [email, setEmail] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const formatTime = (ms: number | null) => {
    if (!ms) return '';
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const showDemoMessage = () => {
    alert('Modo demo: Para usar el login, configura VITE_PRIVY_APP_ID en tu archivo .env');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      if (!hasPrivy) {
        showDemoMessage();
        // En modo demo, aún mostrar la pantalla de confirmación para demostración
        onEmailSubmit(email);
        return;
      }
      
      try {
        // Iniciar el proceso de login con Privy
        // Privy enviará el código automáticamente
        await (login as any)({
          method: 'email',
          email: email,
        });
        // Si llegamos aquí, Privy está procesando el código
        // La pantalla de confirmación se mostrará automáticamente
        onEmailSubmit(email);
      } catch (error) {
        console.error('Error iniciando login con email:', error);
        // Aún así mostrar la pantalla de confirmación para que el usuario pueda ingresar el código
        onEmailSubmit(email);
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (!hasPrivy) {
      showDemoMessage();
      return;
    }
    try {
      await (login as any)({
        method: 'google',
      });
    } catch (error) {
      console.error('Error en login con Google:', error);
    }
  };

  const handleTelegramLogin = async () => {
    if (!hasPrivy) {
      showDemoMessage();
      return;
    }
    try {
      await (login as any)({
        method: 'telegram',
      });
    } catch (error) {
      console.error('Error en login con Telegram:', error);
    }
  };

  const handleAppleLogin = async () => {
    if (!hasPrivy) {
      showDemoMessage();
      return;
    }
    try {
      await (login as any)({
        method: 'apple',
      });
    } catch (error) {
      console.error('Error en login con Apple:', error);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoCircle}>
            <span className={styles.logoText}>4h</span>
          </div>
        </div>
        <h1 className={styles.title}>Ready to plan with your natural rhythm?</h1>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.loginPrompt}>
          <span>Login or sign up</span>
          <button className={styles.closeBtn} onClick={onBack}>×</button>
        </div>

        <form className={styles.emailForm} onSubmit={handleEmailSubmit}>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>✉</span>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={handleEmailChange}
              className={styles.emailInput}
            />
            <button
              type="submit"
              className={`${styles.submitBtn} ${email && email.includes('@') ? styles.active : ''}`}
            >
              Submit
            </button>
          </div>
        </form>

        <div className={styles.socialLogin}>
          <button className={styles.socialBtn} onClick={handleGoogleLogin}>
            <span className={`${styles.socialIcon} ${styles.googleIcon}`}>G</span>
            <span>Google</span>
            {email && <span className={styles.recentTag}>Recent</span>}
          </button>

          {!showMoreOptions ? (
            <>
              <button className={styles.socialBtn} onClick={handleTelegramLogin}>
                <span className={`${styles.socialIcon} ${styles.telegramIcon}`}>✈</span>
                <span>Telegram</span>
              </button>
              <button
                className={styles.socialBtn}
                onClick={() => setShowMoreOptions(true)}
              >
                <span className={`${styles.socialIcon} ${styles.personIcon}`}>👤</span>
                <span>More options</span>
                <span className={styles.arrow}>→</span>
              </button>
            </>
          ) : (
            <button className={styles.socialBtn} onClick={handleAppleLogin}>
              <span className={`${styles.socialIcon} ${styles.appleIcon}`}>🍎</span>
              <span>Apple</span>
            </button>
          )}
        </div>

        {/* Botón de bypass para desarrollo */}
        <div className={styles.bypassContainer}>
          <button className={styles.bypassBtn} onClick={onBypass} title="Bypass login para desarrollo">
            🚀 Bypass Login (Dev)
          </button>
          {timeRemaining !== null && (
            <span className={styles.bypassTime}>
              Tiempo restante: {formatTime(timeRemaining)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

