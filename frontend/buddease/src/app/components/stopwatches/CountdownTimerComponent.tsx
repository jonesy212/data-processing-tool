import React, { useState, useEffect } from 'react';

const CountdownTimerComponent: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(10); // Initial countdown time in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  const handleStartStop = () => {
    setIsRunning((prevIsRunning) => !prevIsRunning);
  };

  const handleReset = () => {
    setTimeLeft(10); // Reset countdown time to initial value
    setIsRunning(false); // Stop the countdown
  };

  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div>
      <h2>Countdown Timer</h2>
      <div>Time Left: {formattedTime}</div>
      <button onClick={handleStartStop}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default CountdownTimerComponent;
