// ProgressiveTimerComponent.tsx

import React, { useState, useEffect } from 'react';

interface ProgressiveTimerProps {
  initialTime: number;
}

const ProgressiveTimerComponent: React.FC<ProgressiveTimerProps> = ({ initialTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isActive) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (prevTimeLeft === 0) {
            clearInterval(intervalId!);
            setIsActive(false);
            // Additional logic can be added here when the timer reaches 0
            return 0; // Ensure that a valid number is always returned
          } else {
            return prevTimeLeft - 1;
          }
        });
      }, 1000);
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  return (
    <div>
      <h1>Progressive Timer</h1>
      <div>Time Left: {timeLeft}</div>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default ProgressiveTimerComponent;
