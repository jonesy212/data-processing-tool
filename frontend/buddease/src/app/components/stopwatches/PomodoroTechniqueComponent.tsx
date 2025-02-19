// PomodoroTechniqueComponent.tsx
import React, { useEffect, useState } from 'react';

interface PomodoroTechniqueProps {
  pomodoroTime: number; // Pomodoro time in minutes
  breakTime: number; // Break time in minutes
}

const PomodoroTechniqueComponent: React.FC<PomodoroTechniqueProps> = ({ pomodoroTime, breakTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(pomodoroTime * 60); // Initial time left in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            // If the timer reaches 0, switch between pomodoro and break
            setIsBreak((prevIsBreak) => !prevIsBreak);
            return isBreak ? breakTime * 60 : pomodoroTime * 60;
          }
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, isBreak, pomodoroTime, breakTime]);

  const handleStartStop = () => {
    setIsRunning((prevIsRunning) => !prevIsRunning);
  };

  const handleReset = () => {
    setTimeLeft(pomodoroTime * 60); // Reset time left to initial pomodoro time
    setIsRunning(false); // Stop the timer
    setIsBreak(false); // Reset to pomodoro mode
  };

  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div>
      <h2>{isBreak ? 'Break Time' : 'Pomodoro Time'}</h2>
      <div>Time Left: {formattedTime}</div>
      <button onClick={handleStartStop}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default PomodoroTechniqueComponent;
