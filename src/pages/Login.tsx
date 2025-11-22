import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import styles from './Login.module.css';

const Login = () => {
  const { login, authenticated, ready } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && authenticated) {
      navigate('/setup');
    }
  }, [ready, authenticated, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <h1 className={styles.title}>CYRA</h1>
          <p className={styles.tagline}>Your cycle-synced productivity companion</p>
        </div>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.emoji}>🌸</span>
            <p>Organize tasks by your cycle phase</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.emoji}>⚡</span>
            <p>Maximize energy and productivity</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.emoji}>🗓️</span>
            <p>Smart scheduling that works with you</p>
          </div>
        </div>

        <button 
          className="btn-primary"
          onClick={login}
          disabled={!ready}
          style={{ width: '100%', maxWidth: '320px' }}
        >
          Sign in with Email
        </button>

        <p className={styles.privacy}>
          Secure & private. Your data is encrypted and yours alone.
        </p>
      </div>
    </div>
  );
};

export default Login;
