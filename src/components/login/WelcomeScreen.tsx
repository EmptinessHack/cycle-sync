import { usePrivySafe } from '../../hooks/usePrivySafe';
import { useDemoAuth } from '../../contexts/DemoAuthContext';
import { PRIVY_APP_ID } from '../../config/privy';
import styles from './WelcomeScreen.module.css';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onAlreadyHaveAccount: () => void;
  onBypass: () => void;
}

const WelcomeScreen = ({ onGetStarted, onAlreadyHaveAccount, onBypass }: WelcomeScreenProps) => {
  const { login } = usePrivySafe();
  const { timeRemaining } = useDemoAuth();
  const hasPrivy = PRIVY_APP_ID && PRIVY_APP_ID.trim() !== '';
  
  const formatTime = (ms: number | null) => {
    if (!ms) return '';
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const handleGoogleLogin = async () => {
    if (!hasPrivy) {
      console.warn('⚠️ Modo demo: El login no está disponible sin Privy App ID');
      alert('Modo demo: Para usar el login, configura VITE_PRIVY_APP_ID en tu archivo .env');
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

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoCircle}>
            <span className={styles.logoText}>4h</span>
          </div>
        </div>
        <h1 className={styles.title}>Welcome to Cyra!</h1>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.illustration}>
          <div className={styles.illustrationBg}>
            <div className={styles.plan4herText}>
              <span className={styles.planText}>PLAN</span>
              <span className={styles.forherText}>CYRA</span>
            </div>
            <div className={styles.decorativeElements}>
              <div className={`${styles.shell} ${styles.shell1}`}></div>
              <div className={`${styles.shell} ${styles.shell2}`}></div>
              <div className={`${styles.shell} ${styles.shell3}`}></div>
            </div>
          </div>
        </div>

        <div className={styles.description}>
          <p>
            Plan your life in sync with your cycle. With AI, Cyra helps you organize tasks and routines in harmony with your hormonal cycle, so you can work, rest, and live at your best.
          </p>
        </div>

        <div className={styles.ctaButtons}>
          <button className={styles.btnPrimary} onClick={onGetStarted}>
            Get Started
          </button>
          <button className={styles.btnSecondary} onClick={handleGoogleLogin}>
            <span className={styles.googleIcon}>G</span>
            Already Have Account?
          </button>
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

export default WelcomeScreen;

