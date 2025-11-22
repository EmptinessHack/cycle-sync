import ThemeToggle from './ThemeToggle';
import styles from './TopHeader.module.css';

interface TopHeaderProps {
  userName?: string;
}

const TopHeader = ({ userName = 'Luna' }: TopHeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.greeting}>
        <h2>Hello, {userName}</h2>
      </div>
      <div className={styles.actions}>
        <div className={styles.avatar}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default TopHeader;
