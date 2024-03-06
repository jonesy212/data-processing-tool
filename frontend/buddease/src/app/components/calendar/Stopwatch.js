//Stopwatch.js
import { useEffect, useState } from 'react';

const Stopwatch = ({ startTime, endTime }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;

    // Start interval when Stopwatch is running
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    // Cleanup: Stop interval on component unmount or when Stopwatch is paused
    return () => clearInterval(interval);
  }, [isRunning]);

  // Toggle Stopwatch between running and paused
  const toggleStopwatch = () => {
    setIsRunning((prevIsRunning) => !prevIsRunning);
  };

  // Reset Stopwatch to zero
  const resetStopwatch = () => {
    setElapsedTime(0);
    setIsRunning(false);
  };

  // Format time in seconds to HH:MM:SS format
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div>Stopwatch: {formatTime(elapsedTime)}</div>
      <div>Start Time: {formatTime(startTime)}</div>
      <div>End Time: {formatTime(endTime)}</div>
      <button onClick={toggleStopwatch}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={resetStopwatch}>Reset</button>
    </div>
  );
};

export default Stopwatch;
