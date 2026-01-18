// useResizablePanels.ts
import { useState } from 'react';

const useResizablePanels = () => {
  const [panelSizes, setPanelSizes] = useState<number[]>([300, 200, 400]); // Initial sizes

  const handleResize = (newSizes: number[]) => {
    // Update the state with the new panel sizes
    setPanelSizes(newSizes);
  };

  return { panelSizes, handleResize };
};

export default useResizablePanels;
