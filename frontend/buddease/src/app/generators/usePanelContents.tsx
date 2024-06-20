// usePanelContents.tsx

import React from "react";
import { useState } from "react";

// Define the function to generate panel contents
export const generatePanelContents = (numPanels: number): React.ReactNode[] => {
  const panels: React.ReactNode[] = [];
  for (let i = 1; i <= numPanels; i++) {
    panels.push(<div key={`panel-${i}`}>Panel {i}</div>);
  }
  return panels;
}

// Define state to hold the number of panels
export const usePanelContents = (initialNumPanels: number = 3) => {
  const [numPanels, setNumPanels] = useState(initialNumPanels);

  // Event handler for changing the number of panels
  const handleNumPanelsChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = parseInt(event.target.value);
    setNumPanels(value);
  };

  // Generate panel contents based on the current number of panels
  const panelContents = generatePanelContents(numPanels);

  return {
    numPanels,
    handleNumPanelsChange,
    panelContents,
  };
};
