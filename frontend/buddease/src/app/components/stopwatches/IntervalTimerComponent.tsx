// IntervalTimerComponent.tsx
import React, { useEffect, useState } from 'react';

const IntervalTimerComponent: React.FC = () => {
  const [intervalTime, setIntervalTime] = useState<number>(5); // Initial interval time in seconds
  const [timeLeft, setTimeLeft] = useState<number>(5); // Initial time left in the current interval
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            // If the interval is over, reset the timer to the initial interval time
            setTimeLeft(intervalTime);
            return intervalTime;
          }
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isRunning, intervalTime]);

  const handleStartStop = () => {
    setIsRunning((prevIsRunning) => !prevIsRunning);
  };

  const handleReset = () => {
    setTimeLeft(intervalTime); // Reset time left to initial interval time
    setIsRunning(false); // Stop the timer
  };

  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div>
      <h2>Interval Timer</h2>
      <div>Time Left in Interval: {formattedTime}</div>
      <button onClick={handleStartStop}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default IntervalTimerComponent;
