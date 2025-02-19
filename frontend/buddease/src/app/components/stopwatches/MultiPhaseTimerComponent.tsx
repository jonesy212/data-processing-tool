// MultiPhaseTimerComponent.tsx
import React, { useState, useEffect } from 'react';
import { Phase } from '../phases/Phase';
import { PhaseHookConfig } from '../hooks/phaseHooks/PhaseHooks';


interface MultiPhaseTimerProps {
    phases: PhaseHookConfig[]; // Array of phase configurations
  }
  
  const MultiPhaseTimerComponent: React.FC<MultiPhaseTimerProps> = ({ phases }) => {
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(phases[0].duration);
    const [isRunning, setIsRunning] = useState<boolean>(false);
  
    useEffect(() => {
      let timer: NodeJS.Timeout;
  
      if (isRunning) {
        timer = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime > 0) {
              return prevTime - 1;
            } else {
              // Move to the next phase when the current phase ends
              if (currentPhaseIndex < phases.length - 1) {
                setCurrentPhaseIndex((prevIndex) => prevIndex + 1);
                return phases[currentPhaseIndex + 1].duration;
              } else {
                setIsRunning(false); // Stop the timer when all phases are completed
                return 0;
              }
            }
          });
        }, 1000);
      }
  
      return () => {
        clearInterval(timer);
      };
    }, [isRunning, currentPhaseIndex, phases]);
  
    const handleStartStop = () => {
      setIsRunning((prevIsRunning) => !prevIsRunning);
    };
  
    const handleReset = () => {
      setCurrentPhaseIndex(0); // Reset to the first phase
      setTimeLeft(phases[0].duration); // Reset time left to the duration of the first phase
      setIsRunning(false); // Stop the timer
    };
  
    const formattedTime = `${Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;
  
    return (
      <div>
        <h2>Multi-Phase Timer</h2>
        <div>Current Phase: {phases[currentPhaseIndex].name}</div>
        <div>Time Left in Phase: {formattedTime}</div>
        <button onClick={handleStartStop}>{isRunning ? 'Pause' : 'Start'}</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    );
  };
  
  export default MultiPhaseTimerComponent;