// NavigationManager.tsx
import React, { useState } from 'react';
import { NotificationTypeEnum, useNotification } from '../support/NotificationContext';
import { NotificationPosition } from '../models/data/StatusType';
const NavigationManager = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const { notify, setDuration } = useNotification();

  const navigateTo = (newPath: string) => {
    setCurrentPath(newPath);
    notify(
      'navigateTo',
      `Navigated to ${newPath}`,
      '',
      new Date(),
      NotificationTypeEnum.Info,
      
      NotificationPosition.TopRight
    );
  };

  const navigateBack = () => {
    // Implement logic to navigate back in history
    console.log('Navigating back...');
    notify(
      'navigateBack',
      'Navigated back',
      '',
      new Date(),
      NotificationTypeEnum.Info,
      NotificationPosition.TopRight
    );
  };

  const navigateForward = () => {
    // Implement logic to navigate forward in history
    console.log('Navigating forward...');
    notify(
      'navigateForward',
      'Navigated forward',
      '',
      new Date(),
      NotificationTypeEnum.Info,
      NotificationPosition.TopRight
    );
  };

  return (
    <div>
      <h2>Navigation Manager</h2>
      <p>Current Path: {currentPath}</p>
      <button onClick={() => setDuration(5000)}>Set Long Duration</button>
      <button onClick={() => setDuration(3000)}>Reset Duration</button>
      <button onClick={() => navigateTo('/home')}>Go to Home</button>
      <button onClick={() => navigateTo('/about')}>Go to About</button>
      <button onClick={() => navigateBack()}>Go Back</button>
      <button onClick={() => navigateForward()}>Go Forward</button>
    </div>
  );
};

export default NavigationManager;
