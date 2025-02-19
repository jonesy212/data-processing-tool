import createDynamicHook from ''
import React, { useState, useEffect } from 'react';
import authService from '../components/auth/AuthService';
import createDynamicHook from "../components/hooks/phaseHooks/DynamicPromptPhaseHook";
import UserFormComponent from './forms/UserFormComponent';
import BasicStopwatchComponent from '../components/stopwatches/BasicStopwatchComponent';
import CountdownTimerComponent from '../components/stopwatches/CountdownTimerComponent';
// Import other timer components as needed

const YourApp: React.FC = () => {
  const [timerType, setTimerType] = useState<string>('basicStopwatch');
  const [stopwatchState, setStopwatchState] = useState({
    time: 0,
    isRunning: false,
  });

  // Create dynamic hook with desired parameters
  const useDynamicPromptPhaseHook = createDynamicHook();
  const dynamicHook = useDynamicPromptPhaseHook;

  useEffect(() => {
    // Your additional logic using isActive, toggleActivation, etc.
  }, [dynamicHook.isActive]);

  const handleUserIdeaSubmit = async () => {
    // Additional logic for handling user idea submission
    const { accessToken } = await authService.login(username, password);
    dynamicHook.toggleActivation(accessToken);
  };

  // Function to render the selected timer component
  const renderTimerComponent = () => {
    switch (timerType) {
      case 'basicStopwatch':
        return <BasicStopwatchComponent stopwatchState={stopwatchState} setStopwatchState={setStopwatchState} />;
      case 'countdownTimer':
        return <CountdownTimerComponent />;
      // Add cases for other timer components as needed
      default:
        return null;
    }
  };

  return (
    <div>
      <h1>Your Project Management App</h1>
      <UserFormComponent onSubmit={handleUserIdeaSubmit} />
      {/* Other components and UI elements */}

      {/* Render the selected timer component */}
      {renderTimerComponent()}

      {/* Render buttons to select different timer types */}
      <button onClick={() => setTimerType('basicStopwatch')}>Basic Stopwatch</button>
      <button onClick={() => setTimerType('countdownTimer')}>Countdown Timer</button>
      {/* Add buttons for other timer types as needed */}
    </div>
  );
};

export default YourApp;
