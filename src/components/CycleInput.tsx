import { useState } from 'react';
import { getCyclePhase, getPhaseDescription, getPhaseColor } from '../utils/cycleLogic';
import styles from './CycleInput.module.css';

interface CycleInputProps {
  value: number;
  onChange: (day: number) => void;
}

const CycleInput = ({ value, onChange }: CycleInputProps) => {
  const [day, setDay] = useState(value);
  const phase = getCyclePhase(day);
  const description = getPhaseDescription(phase);

  const handleChange = (newDay: number) => {
    if (newDay >= 1 && newDay <= 35) {
      setDay(newDay);
      onChange(newDay);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Which day of your cycle are you on?</label>
      <div className={styles.inputGroup}>
        <button 
          className={styles.btn}
          onClick={() => handleChange(day - 1)}
          disabled={day <= 1}
        >
          -
        </button>
        <input
          type="number"
          min="1"
          max="35"
          value={day}
          onChange={(e) => handleChange(parseInt(e.target.value) || 1)}
          className={styles.input}
        />
        <button 
          className={styles.btn}
          onClick={() => handleChange(day + 1)}
          disabled={day >= 35}
        >
          +
        </button>
      </div>
      <div 
        className={styles.phasePill}
        style={{ backgroundColor: getPhaseColor(phase) }}
      >
        <span className={styles.phaseName}>{phase}</span>
        <span className={styles.phaseDesc}>{description}</span>
      </div>
    </div>
  );
};

export default CycleInput;
