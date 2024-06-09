// NavigationManager.tsx
import React from "react";

import { useState } from 'react';

// Define the NavigationManager component
const NavigationManager = () => {
  // State to track the current path
  const [currentPath, setCurrentPath] = useState<string>('/');

  // Method to navigate to a new path
  const navigateTo = (newPath: string) => {
    setCurrentPath(newPath);
  };

  // Method to navigate back in history
  const navigateBack = () => {
    // Implement logic to navigate back in history
    console.log('Navigating back...');
  };

  // Method to navigate forward in history
  const navigateForward = () => {
    // Implement logic to navigate forward in history
    console.log('Navigating forward...');
  };

  return (
    <div>
      <h2>Navigation Manager</h2>
      <p>Current Path: {currentPath}</p>
      <button onClick={() => navigateTo('/home')}>Go to Home</button>
      <button onClick={() => navigateTo('/about')}>Go to About</button>
      <button onClick={() => navigateBack()}>Go Back</button>
      <button onClick={() => navigateForward()}>Go Forward</button>
    </div>
  );
};

export default NavigationManager;
