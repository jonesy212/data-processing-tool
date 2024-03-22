// ScheduledTimersComponent.tsx
import React, { useEffect, useState } from 'react';

interface ScheduledTimersProps {
  scheduledTimes: number[];
}

const ScheduledTimersComponent: React.FC<ScheduledTimersProps> = ({ scheduledTimes }) => {
  const [timeLeft, setTimeLeft] = useState<number>(scheduledTimes[0]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isActive) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (prevTimeLeft === 0) {
            clearInterval(intervalId!); // Added ! to assert non-null
            setIsActive(false);
            // Additional logic can be added here when the timer reaches 0
            if (currentIndex < scheduledTimes.length - 1) {
              setCurrentIndex((prevIndex) => prevIndex + 1);
              return scheduledTimes[currentIndex + 1];
            } else {
              return 0;
            }
          } else {
            return prevTimeLeft - 1;
          }
        });
      }, 1000);
    } else {
      clearInterval(intervalId!); // Added ! to assert non-null
    }

    return () => clearInterval(intervalId!); // Added ! to assert non-null
  }, [isActive, currentIndex, scheduledTimes]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentIndex(0);
    setTimeLeft(scheduledTimes[0]);
  };

  return (
    <div>
      <h1>Scheduled Timers</h1>
      <div>Time Left: {timeLeft}</div>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default ScheduledTimersComponent;
