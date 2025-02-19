// CountdownTimerComponent.tsx
import React, { useEffect, useMemo, useState } from 'react';

interface StopwatchProps {}

interface StopwatchState {
  time: number;
  isRunning: boolean;
}

const BasicStopwatchComponent: React.FC<StopwatchProps> = () => {
  const [state, setState] = useState<StopwatchState>({
    time: 0,
    isRunning: false,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (state.isRunning) {
      timer = setInterval(() => {
        setState((prevState) => ({ ...prevState, time: prevState.time + 1 }));
      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isRunning]);

  const handleStartStop = () => {
    setState((prevState) => ({ ...prevState, isRunning: !prevState.isRunning }));
  };

  const handleReset = () => {
    setState({ time: 0, isRunning: false });
  };

  const formattedTime = useMemo(() => {
    const { time } = state;
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [state.time]);

  return (
    <div>
      <h2>Stopwatch</h2>
      <div>Time: {formattedTime}</div>
      <button onClick={handleStartStop}>{state.isRunning ? 'Stop' : 'Start'}</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default BasicStopwatchComponent;
 